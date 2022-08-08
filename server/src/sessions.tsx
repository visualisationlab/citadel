import uid from 'uid-safe'
import { rm, createWriteStream, unlink } from 'fs'
import { get } from 'http'
import cytoscape from 'cytoscape'
import { genSocketSession, closeSession, ClientMessage, ServerMessage, GetMessage, SetMessage, sendMessage, APIMessage, sendAPIMessage } from './socket'
import { Cyto } from './cytoscape'

export module Session {
    type Session = {
        sid: string,
        expirationDate: Date,
    }

    export interface SimInfo {
        step: number,
        stepCount: number,
        startParams: {[key: string]: number}
    }

    export interface SessionInfo {
        sid: string,
        expirationDate: Date,
        graphURL: string
    }

    export type LayoutSettings = {
        name: string,
        settings: {[key: string]: number | boolean}
    }

    type SessionData = {
        cy: cytoscape.Core,
        info: SessionInfo,
        simInfo: SimInfo | null,
        layoutSettings: LayoutSettings
    }

    let sessionData: {[sid: string]: SessionData | null} = {}

    let sessions: Session[] = []

    export function getSessionData(sid: string) {
        return sessionData[sid]
    }

    export function getGraphData(sid: string): {nodes: any, edges: any} | null {
        const session = sessionData[sid]

        if (session === null) {
            return null
        }

        return (session.cy.json() as any).elements
    }

    export function getInfo(sid: string): SessionInfo | null {
        const session = sessionData[sid]

        if (session === null) {
            return null
        }

        return session.info
    }

    export function getLayouts() {
        return Cyto.getAvailableLayouts()
    }

    function parseGetMessage(message: GetMessage): ServerMessage | null {
        switch (message.contents.attribute) {
            case 'info':
                throw new Error('AAH')
            case 'layouts':
                return {
                    type: 'layouts',
                    contents: getLayouts()
                }
        }
    }

    export function registerSim(sid: string, startParams: {[key: string]: number}) {
        let session = sessionData[sid]

        if (session === null) {
            return
        }

        session.simInfo = {
            step: 0,
            stepCount: 0,
            startParams: startParams
        }
    }

    function startSim(message: SetMessage) {
        const session = sessionData[message.sid]

        if (session === null || session.simInfo === null) {
            return
        }

        session.simInfo.step = 0
        session.simInfo.stepCount = message.contents.value

        const graphData = getGraphData(message.sid)

        if (graphData === null) {
            return
        }

        console.log('sending api message')

        sendAPIMessage({
            sid: message.sid,
            nodes: graphData.nodes,
            edges: graphData.edges,
            params: session.simInfo.startParams
        },
        '',
        message.sid)
    }

    async function parseSetMessage(message: SetMessage) {
        await new Promise((resolve) => {
            switch (message.contents.attribute) {
                case 'layout':
                    const session = sessionData[message.sid]

                    if (session === null) {
                        return null
                    }

                    session.layoutSettings = message.contents.value.settings
                    console.log(`here ${session.layoutSettings}`)

                    Cyto.setLayout(session.cy, session.layoutSettings).then(() => {
                        resolve('')
                    })

                    break
                case 'data':
                    Cyto.loadJson(getCytoSession(message.sid), message.contents.value.nodes, message.contents.value.edges)
                    resolve('')
                case 'sim':
                    console.log('starting sim')
                    startSim(message)
                    resolve('')
        }})
    }

    export function parseAPIMessage(message: APIMessage): ServerMessage | null {
        const session = sessionData[message.sid]

        if (session === null || session.simInfo === null) {
            return null
        }

        session.simInfo.step++

        Cyto.loadJson(session.cy, message.nodes as any, message.edges as any)

        if (session.simInfo.step < session.simInfo.stepCount) {
            sendAPIMessage({
                sid: message.sid,
                nodes: message.nodes,
                edges: message.edges,
                params: message.params
            },
            '',
            message.sid)
        }

        Cyto.setLayout(session.cy, session.layoutSettings).then(() => {
            const graphData = Session.getGraphData(message.sid)

            if (graphData === null) {
                throw new Error('Graphdata null')
            }

            sendMessage({
                type: 'data',
                contents: graphData
            }, message.sid)
        })


        return null
    }

    export function parseUserMessage(message: ClientMessage): ServerMessage | null {
        switch (message.type) {
            case 'get':
                return parseGetMessage({
                    type: 'get',
                    sid: message.sid,
                    contents: message.contents as any
                })

            case 'set':
                parseSetMessage({
                    type: 'set',
                    sid: message.sid,
                    contents: message.contents as any
                }).then(() => {
                    const graphData = Session.getGraphData(message.sid)

                    if (graphData === null) {
                        throw new Error('Graphdata null')
                    }

                    sendMessage({
                        type: 'data',
                        contents: graphData
                    }, message.sid)
                })

                return null
            default:
                throw new Error('Unknown message type')
        }
    }

    function getCytoSession(sid: string): cytoscape.Core | null {
        const session = sessionData[sid]

        if (session === null) {
            return null
        }

        return session.cy
    }

    export function checkSessions() {
        let now = new Date()

        while (true) {
            if (sessions.length === 0) {
                return
            }

            const session = sessions[sessions.length - 1]

            if (session.expirationDate < now) {
                sessions.shift()

                rm(`./cache/${session.sid}`, () => {})

                closeSession(session.sid)

                sessionData[session.sid]?.cy.destroy()

                sessionData[session.sid] = null

                continue
            }

            return
        }
    }

    function createSessionData(data: string, sid: string, url: string, expirationDate: Date) {
        let cy = cytoscape({
            headless:true,
            styleEnabled: true,

        })

        const json = JSON.parse(data)

        console.log(json)

        genSocketSession(sid)

        Cyto.loadJson(cy, json.nodes, json.edges)

        sessionData[sid] = {cy: cy, info:{
            expirationDate: expirationDate,
            sid: sid,
            graphURL: url,

        },
        simInfo: null,
        layoutSettings: {name: 'fcose', settings: {}}}

        console.log(`Generated cy instance with ${cy.nodes().length} nodes`)
    }

    export function genSession(url: string, fun: (sid: string) => void) {
        uid(4, (err, sid) => {
            if (err) throw err

            const dest = './cache/' + sid

            rm(dest, () => {
                let file = createWriteStream(dest)

                try {
                    get(url, (response) => {
                        let data = ''

                        response.on('data', (chunk) => {
                            data += chunk
                            file.write(chunk)
                        })

                        response.on('end', () => {
                            try {
                                let expirationDate = new Date()

                                createSessionData(data, sid, url, expirationDate)

                                expirationDate.setHours(expirationDate.getHours() + 1)

                                sessions.push({
                                    sid: sid,
                                    expirationDate: expirationDate
                                })
                            } catch (e) {
                                console.error(e)
                                rm(dest, () => {})

                                sid = ''

                                return
                            }

                            console.log(`Started new session with SID ${sid}`)
                            file.close(() => fun(sid))
                        })
                    }).on('error', (err) => {
                        unlink(dest, (err) => {
                            if (err === null) {
                                return
                            }

                            // throw new Error(err.message)
                        })

                        // throw new Error(err.message)
                    })
                } catch (e) {
                    // console.log(e)
                }
            })
        })
    }
}
