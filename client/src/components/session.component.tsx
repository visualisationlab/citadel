
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
            {
                users.filter((user) => {return user.userName !== userName}).map((user) => {
                    return (
                        <ListGroup.Item>
                            {`${user.userName} (${(user.headsetCount)} headsets)`}
                        </ListGroup.Item>
                    )
                })
            }
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
        <Container>
            <Row>
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
            </Row>
            <Row>
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
        </Container>
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

    var graphSchema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        // "$id": "https://example.com/product.schema.json",
        "type": "object",
        "description": "Network data",
        "properties": {
            "attributes": {
                "type": "object",
                "properties": {
                    "edgeType": {
                        "type": "string"
                    }
                },
                "required": [ "edgeType" ]
            },
            "nodes": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": ["string", "integer"]
                        },
                        "attributes": {
                            "type": "object"
                        }
                    },
                    "required": ["id"]
                },
                "minItems": 1,
                "uniqueItems": true
            },
            "edges": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "source": {
                            "type": ["string", "integer"]
                        },
                        "target": {
                            "type": ["string", "integer"]
                        },
                        "attributes": {
                            "type": "object"
                        }
                    },
                    "required": ["source", "target", "attributes"]
                },
                "minItems": 1,
                "uniqueItems": true
            }
        },
        "required": ["attributes", "nodes", "edges"]
    }

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
                <h3>Users</h3>
                {renderUsers(state.userName, state.users)}
            </Row>
            <Row>
                <Col md={{span: 4}}>
                <h3>Session State</h3>
                </Col>
                <Col>
                <Button variant={sessionVariant} disabled>{state.state}</Button>
                </Col>

            </Row>
            <Row>
                <h3>Settings</h3>
                {renderSettings(
                    state.userName,
                    state.expirationDate,
                    state.graphURL,
                    state.sid,
                    newUserName, setNewUserName,
                    sessionRef,
                    graphRef,
                    downloadURL)}
            </Row>
            <Row>
                {state.headsets.map((headset) => {
                    if (headset.connected) {
                        return (
                            <Row>
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
                            </Row>
                        )
                    }

                    return (
                        <Row>
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
                            </Row>
                    )
                })}
                <Row>
                    <Col>
                        <Button variant='outline-success'
                                onClick={() => {
                                    API.addHeadset()
                                }}>
                            Add headset
                        </Button>
                    </Col>
                </Row>
            </Row>
        </Container>
    )
}
