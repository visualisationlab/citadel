import uid from 'uid-safe'
import { rm, createWriteStream, unlink } from 'fs'
import { get } from 'http'
import cytoscape from 'cytoscape'
import { WebSocket } from 'ws'
import { compress, decompress } from 'compress-json'

type Session = {
    sid: string,
    expirationDate: Date,
}

type SessionData = {
    cy: cytoscape.Core,
    sockets: WebSocket[]
}

export let sessionData: {[sid: string]: SessionData} = {}

export let sessions: Session[] = []

export function updateSessions(sid: string) {
    console.log(`Keys: ${Object.keys(sessionData)}`)

    const session = sessionData[sid.toString()]

    // BAH!
    const compressedData = compress(JSON.parse(JSON.stringify(session.cy.json())))

    console.log(`Sending updates to ${session.sockets.length} clients`)

    session.sockets.forEach((socket) => {
        if (socket.CLOSED || socket.CLOSING) {
            return
        }

        socket.send(compressedData)
    })
}

export function checkSessions() {
    let now = new Date()

    while (true) {
        if (sessions.length === 0) {
            return
        }

        const session = sessions[0]

        if (session.expirationDate < now) {

            sessions.shift()

            rm(`./cache/${session.sid}`, () => {})

            continue
        }

        return
    }
}

function createSessionData(data:string, sid: string) {
    let cy = cytoscape({
        headless:true,
        styleEnabled: true
    })

    const json = JSON.parse(data)
    cy.json(json)

    sessionData[sid] = {cy: cy, sockets: []}

    console.log(`Generated cy instance with ${cy.nodes().length} nodes`)
    updateSessions(sid)
}

export function genSession(url: string, fun: (sid: string) => void) {
    uid(12, (err, string) => {
        if (err) throw err

        const dest = './cache/' + string

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

                            createSessionData(data, string)

                            let date = new Date()

                            date.setHours(date.getHours() + 1)

                            sessions.push({
                                sid: string,
                                expirationDate: date
                            })
                        } catch (e) {
                            console.log(e)
                            rm(dest, () => {})

                            string = ''
                        }

                        file.close(() => fun(string))
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
