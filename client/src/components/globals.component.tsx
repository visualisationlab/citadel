import { Validator } from 'jsonschema'
import { useContext, useEffect, useState } from 'react'

import { Button, Container, Row, Col, Stack, Form } from 'react-bootstrap'
import { GraphDataContext, UserDataContext } from './main.component'

const globalsFormat = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "description": "Network data",
    "anyOf": [{
        "type": "object",
        "properties": {
            "edgeType": {
                "enum": ["directed", "undirected"]
            }
        },
    },
    // {
    //         "type": "object",
    //         "properties": {
    //             "value": {
    //                 "type": "number",
    //             },
    //         },
    // },
    {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
        },
    ],
    "required": [ "edgeType"]
}

type GlobalsType = {
    [key: string]: {[key: string]: any}
}

export default function Globals() {
    const [hidden, setHidden] = useState(true)
    const [showHidden, setShowHidden] = useState(false)

    // Get graph state context
    const { graphState } = useContext(GraphDataContext)
    const { state } = useContext(UserDataContext)

    if (!graphState) {
        return <></>
    }

    if (hidden) {
        return (
            <Button
                onClick={() => setHidden(false)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    // Place in the middle of the screen
                    left: 'calc(50vw - 50px)',
                    zIndex: 1000
                }}
            >
                Show Globals
            </Button>
        )
    }

    // Validate globals
    // var validator = new Validator()

    // var vr = validator.validate(testData, globalsFormat)

    // if (!vr.valid) {
    //     console.log(vr.errors)
    //     return (
    //         <></>
    //     )
    // }

    const testGlobals: GlobalsType = {
        "general": {
            "edgeType": "directed",
        },
        "Kingpin Simulator": {
            "delta": 8,
            "kingpin_threshold": 0.5,
            "_iterator": 3
        },
        "Custom Layout Generator": {
            "convergence": 0.01,
        }
    }

    return (
        <Container
            className="shadow bg-white"
            style={{
                width: '500px',
                height: '80vh',
                paddingTop: '10px',
                left: 'calc(50vw - 250px)',
                position: 'absolute',
            }}
            draggable={false}
        >
            <Row>
                <Col md={{span: 9}}>
                    <h3>
                        {
                            'Graph Globals'
                        }
                    </h3>
                </Col>
                <Col style={{
                    paddingLeft: 0
                }}>
                    <Button
                        style={{
                            float: 'right',
                        }}
                        onClick={() => {setHidden(true)}}>Hide</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <hr></hr>
                </Col>
            </Row>
            <Row>
                <Col>
                    {/* Show checkbox for hidden attributes */}
                    <Form.Check
                        style={{
                            float: 'right',
                        }}
                        type="checkbox"
                        label="Show hidden attributes"
                        checked={showHidden}
                        onChange={
                            (e) => {
                                setShowHidden(e.target.checked)
                            }
                        }
                    />
                </Col>
            </Row>
            <Stack>
                {
                    Object.keys(testGlobals).map((global, index) => {
                        const values = Object.keys(testGlobals[global.toString()]).map((key, index) => {
                            if (key.charAt(0) === '_' && !showHidden) {
                                return <></>
                            }

                            return (
                                <Row key={index}>
                                    <Col md={{span: 4}}>
                                        <Form.Label>
                                            {
                                                key.charAt(0) === '_' ? <i>{key.slice(1)}</i> : key
                                            }
                                        </Form.Label>
                                    </Col>
                                    <Col md={{span: 8}}>
                                        <Form.Control
                                            type="text"
                                            placeholder={testGlobals[global.toString()][key]}
                                            onChange={(e) => {
                                                testGlobals[global.toString()][key] = e.target.value
                                            }}
                                        />
                                    </Col>
                                </Row>
                            )
                        })

                        return (
                            <Stack
                                style={{
                                    marginBottom: '10px'
                                }}
                            >
                                <h6>{global}</h6>
                                {values}
                            </Stack>
                        )
                    })
                }
            </Stack>
        </Container>
    )
}
