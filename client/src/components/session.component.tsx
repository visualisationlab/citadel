
import React, { useContext, useState, useRef } from 'react'
import { Row, Col, Button, Container, ListGroup, InputGroup, Form, Stack } from 'react-bootstrap'

import './home.component.css'

import { UserDataContext, GraphDataContext, GlobalSettingsContext } from '../components/main.component'

import { GlobalSettingsReducerAction, GlobalSettingsState } from '../reducers/globalsettings.reducer'

import { API } from '../services/api.service'

import { QR } from '../services/qrcode.service'

function renderUsers(userName: string, users: {userName: string, headsetCount: number}[]): JSX.Element {
    return (
        <ListGroup variant='flush'>
            <ListGroup.Item variant='primary'>
                {userName} (Me)
            </ListGroup.Item>
            <div style={{
                overflowY: 'scroll',
                maxHeight: '250px',
            }}>
                {
                    users.filter((user) => {return user.userName !== userName}).map((user) => {
                        let headsets = ''

                        return (
                            <ListGroup.Item>
                                {`${user.userName} ${headsets}`}
                            </ListGroup.Item>
                        )
                    })
                }
            </div>
        </ListGroup>
    )
}

function renderSettings(
    userName: string,
    expirationDate: Date,
    graphURL: string,
    sid: string,
    newUserName: string,
    setNewUserName: React.Dispatch<React.SetStateAction<string>>,
    sessionRef: any,
    graphRef: any,
    downloadURL: string,
    ) {

    return (
        <Stack gap={2}>
            <Stack>
                <h5>
                    Username
                </h5>
                <InputGroup>
                    <Form.Control
                        placeholder={userName}
                        onChange={
                            (e) => {
                                e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')

                                if (e.target.value.length > 10) {
                                    e.target.value = e.target.value.substring(0, 10)
                                }

                                if (e.target.value.length === 0) {
                                    return
                                }

                                setNewUserName(e.target.value)
                            }
                        }
                    />
                    <Button
                        variant="outline-primary"
                        id="button-update"
                        onClick={() => {
                            let tmpName = newUserName.replace(/[^a-zA-Z0-9]/g, '')

                            if (tmpName.length > 10) {
                                tmpName = tmpName.substring(0, 10)
                            }

                            if (tmpName.length === 0) {
                                return
                            }

                            API.updateUsername(tmpName)
                        }}>
                        Update
                    </Button>
                </InputGroup>
            </Stack>
            <Stack>
                <h5>
                    Expiration Date
                </h5>
                <Form.Control
                    readOnly
                    value={expirationDate.toString()}
                />
            </Stack>
            <Stack>
                <h5>
                    Session Link
                </h5>
                <InputGroup>

                    <Form.Control
                        readOnly
                        value={window.location.href}
                        ref={sessionRef}/>
                    <Button variant="outline-secondary"
                            id="button-copy"
                            onClick={() => {
                                if (window.isSecureContext && navigator.clipboard) {
                                    navigator.clipboard.writeText(sid)
                                } else {
                                    // @ts-ignore
                                    sessionRef.current.select()

                                    document.execCommand('copy')
                                }
                            }}>
                        Copy
                    </Button>
                </InputGroup>
            </Stack>
            <Stack>
                <h5>
                    Graph Source
                </h5>
                <InputGroup>
                    <Form.Control
                        readOnly
                        value={graphURL}
                        ref={graphRef}/>
                    <Button variant="outline-secondary"
                            id="button-copy"
                            onClick={() => {
                                if (window.isSecureContext && navigator.clipboard) {
                                    navigator.clipboard.writeText(graphURL)
                                } else {
                                    // @ts-ignore
                                    graphRef.current.select()

                                    document.execCommand('copy')
                                }
                            }}>
                        Copy
                    </Button>
                </InputGroup>
            </Stack>
            <Stack>
                <h5>
                    Download Graph
                </h5>
                <Row>
                    <Col>
                        <Button
                            disabled={true}
                            style={{
                                width: '100%',
                            }}
                        >
                            Whole series
                        </Button>
                    </Col>
                    <Col>
                        <a href={downloadURL} download="graph.json">
                            <Button
                                style={{
                                    width: '100%',
                                }}
                            >
                                Single frame
                            </Button>
                        </a>
                    </Col>
                </Row>
            </Stack>
        </Stack>
    )
}

function renderGlobalSettings(globalSettingsState: GlobalSettingsState,
    globalSettingsReducer: React.Dispatch<GlobalSettingsReducerAction>,
    setShowGlobalSettings: React.Dispatch<React.SetStateAction<boolean>>) {

    return (
        <Container style={{
            marginBottom: '10px',
            marginTop: '10px',
        }}>
            <Row>
                <Col>
                    <h3>Global Settings</h3>
                </Col>
            </Row>
            <Row style={{
                marginBottom: '10px',
            }}>
                <Col>
                    <Button onClick={() => {
                        setShowGlobalSettings(false)
                    }} >Back</Button>
                </Col>
                <Col>
                    <Button onClick={() => {
                        globalSettingsReducer({type: 'settingsReset'})
                    }} >Reset</Button>
                </Col>
                <Col>
                    <Button disabled={globalSettingsState.stateStack.length === 0} onClick={() => {
                        globalSettingsReducer({type: 'undo'})
                    }} >Undo</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup>
                        <InputGroup.Text>Selection Highlight</InputGroup.Text>
                        <Form.Control
                            as="select"
                            value={globalSettingsState.selectionHighlight}
                            onChange={(e) => {
                                globalSettingsReducer({type: 'selectionHighlightChanged', payload: {value: e.target.value as any}})
                            }}>
                            <option value='none'>None</option>
                            <option value='transparency'>Transparency</option>
                            <option value='saturation'>Saturation</option>
                            <option value='lightness'>Lightness</option>
                        </Form.Control>
                    </InputGroup>
                </Col>
            </Row>
        </Container>
    )
}

export default function SessionTab() {
    const { state } = useContext(UserDataContext)
    const { graphState } = useContext(GraphDataContext)
    const { globalSettingsState, globalSettingsDispatch } = useContext(GlobalSettingsContext)

    const [newUserName, setNewUserName] = useState('')
    const [showGlobalSettings, setShowGlobalSettings] = useState(false)

    const sessionRef = useRef(null)
    const graphRef = useRef(null)

    if (!state || !graphState || !globalSettingsState || !globalSettingsDispatch) {
        return (
            <></>
        )
    }

    // var graphSchema = {
    //     "$schema": "https://json-schema.org/draft/2020-12/schema",
    //     // "$id": "https://example.com/product.schema.json",
    //     "type": "object",
    //     "description": "Network data",
    //     "properties": {
    //         "attributes": {
    //             "type": "object",
    //             "properties": {
    //                 "edgeType": {
    //                     "type": "string"
    //                 }
    //             },
    //             "required": [ "edgeType" ]
    //         },
    //         "nodes": {
    //             "type": "array",
    //             "items": {
    //                 "type": "object",
    //                 "properties": {
    //                     "id": {
    //                         "type": ["string", "integer"]
    //                     },
    //                     "attributes": {
    //                         "type": "object"
    //                     }
    //                 },
    //                 "required": ["id"]
    //             },
    //             "minItems": 1,
    //             "uniqueItems": true
    //         },
    //         "edges": {
    //             "type": "array",
    //             "items": {
    //                 "type": "object",
    //                 "properties": {
    //                     "source": {
    //                         "type": ["string", "integer"]
    //                     },
    //                     "target": {
    //                         "type": ["string", "integer"]
    //                     },
    //                     "attributes": {
    //                         "type": "object"
    //                     }
    //                 },
    //                 "required": ["source", "target", "attributes"]
    //             },
    //             "minItems": 1,
    //             "uniqueItems": true
    //         }
    //     },
    //     "required": ["attributes", "nodes", "edges"]
    // }

    let exportData = {
        nodes: graphState.nodes.data.map((data) => {
            return {
                id: data.id,
                attributes: data.attributes
            }
        }),
        edges: graphState.edges.data.map((edges) => {
            return {
                source: edges.source,
                target: edges.target,
                attributes: edges.attributes
            }
        }),
        attributes: {
            edgeType: graphState.directed ? 'directed' : 'undirected'
        }
    }

    let blob = new Blob([JSON.stringify(exportData)], {type: 'text/plain'})
    let downloadURL = URL.createObjectURL(blob)

    if (showGlobalSettings) {
        return renderGlobalSettings(globalSettingsState, globalSettingsDispatch, setShowGlobalSettings)
    }

    return (
        <Container>
            <Row>
                <Col>
                    <Stack>
                        <h3>Users</h3>
                        {
                            renderUsers(state.userName, state.users)
                        }
                        <h3>Settings</h3>
                        {
                            renderSettings(
                                state.userName,
                                state.expirationDate,
                                state.graphURL,
                                state.sid,
                                newUserName, setNewUserName,
                                sessionRef,
                                graphRef,
                                downloadURL
                            )
                        }
                        <h3>Global Settings</h3>
                        <Button variant='outline-primary' onClick={() => {
                            setShowGlobalSettings(true)
                        }}>
                            Edit
                        </Button>
                        <h3>Headsets</h3>
                        <ListGroup>
                            <div style={{
                                overflowY:'auto',
                                maxHeight: '200px'
                            }}>

                                {state.headsets.map((headset) => {
                                    if (headset.connected) {
                                        return (
                                            <ListGroup.Item>
                                                <InputGroup>
                                                    <InputGroup.Text>Headset</InputGroup.Text>
                                                    <Button variant='success'>
                                                        Connected
                                                    </Button>
                                                    <Button variant="outline-warning"
                                                            onClick={() => {
                                                                console.log("Disconnect")
                                                            }}>
                                                        Disconnect
                                                    </Button>
                                                </InputGroup>
                                            </ListGroup.Item>
                                        )
                                    }

                                    return (
                                        <ListGroup.Item>
                                                <InputGroup>
                                                    <InputGroup.Text>Headset</InputGroup.Text>
                                                    <Button variant='secondary' disabled>
                                                        Disconnected
                                                    </Button>
                                                    <Button variant="outline-primary"
                                                            onClick={() => {
                                                                console.log('here')
                                                                let uid = API.getUID()

                                                                if (uid) {
                                                                    console.log('here')
                                                                    QR.genQR(state.sessionURL, state.websocketPort, state.sid,
                                                                        headset.headsetID, uid)
                                                                }
                                                            }}>
                                                        Connect
                                                    </Button>
                                                </InputGroup>
                                        </ListGroup.Item>
                                    )
                                })}
                            </div>
                            <ListGroup.Item>
                                <Button variant='outline-success'
                                    onClick={() => {
                                        API.addHeadset()
                                    }}>

                                    Add headset
                                </Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Stack>
                </Col>
            </Row>
        </Container>
    )
}
