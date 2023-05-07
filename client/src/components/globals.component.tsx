import { Validator } from 'jsonschema'
import { useContext, useEffect, useState } from 'react'

import { Button, Container, Row, Col, Stack, Form } from 'react-bootstrap'
import { GraphDataContext } from './main.component'

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

export default function Globals() {
    const [hidden, setHidden] = useState(true)

    // Get graph state context
    const { graphState } = useContext(GraphDataContext)

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

    const testData = {
        "edgeType": "directed",
        "ABCD": "AS"
    }

    // Validate globals
    var validator = new Validator()

    var vr = validator.validate(testData, globalsFormat)

    if (!vr.valid) {
        console.log(vr.errors)
        return (
            <></>
        )
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
                            'Globals'
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
            <Stack>
                {
                    Object.keys(graphState.metadata).map((global, index) => {
                        return (
                            <Stack key={global}>
                                <h6
                                    style={{
                                        maxWidth: '100%',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {global}
                                </h6>
                                <Form.Control id={global}

                                    type="text"
                                    value={graphState.metadata[global] === (undefined || null) ? '' : graphState.metadata[global].toString()}

                                    placeholder={graphState.metadata[global] === (undefined || null) ? '' : graphState.metadata[global].toString()}/>
                            </Stack>
                        )
                    })
                }
            </Stack>
        </Container>
    )
}
