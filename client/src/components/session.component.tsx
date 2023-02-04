
import React, { useContext, useState, useRef } from 'react'
import { Row, Col, Button, Container, ListGroup, InputGroup, Form } from 'react-bootstrap'

import './home.component.css'

import { UserDataContext, GraphDataContext } from '../components/main.component'

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
        <>
            <Row>
                <Col>
                    <InputGroup>
                        <InputGroup.Text>Username</InputGroup.Text>
                        <Form.Control
                            placeholder={userName}
                            onChange={
                                (e) => {
                                    setNewUserName(e.target.value)
                                }
                            }/>
                        <Button
                            variant="outline-primary"
                            id="button-update"
                            onClick={() => {API.updateUsername(newUserName)}}>
                            Update
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Col>

                    <InputGroup>
                        <InputGroup.Text>Session Expiration Date:</InputGroup.Text>
                        <Form.Control
                            readOnly
                            value={expirationDate.toString()}/>
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Text>Session Link:</InputGroup.Text>
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
                    <InputGroup>
                        <InputGroup.Text>Original Graph URL:</InputGroup.Text>
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
                </Col>
            </Row>
            <Row className='justify-content-md-center'>
                <Col md={{span: 3}}>
                    <a href={downloadURL} download="graph.json">
                        <Button>
                            Download Graph
                        </Button>
                    </a>
                </Col>
            </Row>
        </>
    )
}

export default function SessionTab() {
    const { state } = useContext(UserDataContext)
    const { graphState } = useContext(GraphDataContext)

    const [newUserName, setNewUserName] = useState('')

    const sessionRef = useRef(null)
    const graphRef = useRef(null)

    if (!state || !graphState) {
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

    let sessionVariant = 'primary'

    if (state.state === 'busy') {
        sessionVariant = 'secondary'
    } else if (state.state === 'disconnected') {
        sessionVariant = 'danger'
    }

    return (
        <Container>
            <Row>
                <Col md={{span: 3}}>
                    <h3>Users</h3>
                </Col>
                <Col>
                    {renderUsers(state.userName, state.users)}
                </Col>
            </Row>
            <Row>
                <Col md={{span: 3}}>
                    <h3>Settings</h3>
                </Col>
                <Col>
                    {renderSettings(
                        state.userName,
                        state.expirationDate,
                        state.graphURL,
                        state.sid,
                        newUserName, setNewUserName,
                        sessionRef,
                        graphRef,
                        downloadURL)}
                </Col>
            </Row>
            <Row>
                <Col md={{span: 3}}>
                    <h3>Headsets</h3>
                </Col>
                <Col>
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
                </Col>
            </Row>
        </Container>
    )
}
