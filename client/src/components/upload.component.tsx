import React, { useState, useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import { Form, Button, Container, Row, Col } from 'react-bootstrap'
import { userService } from '../services/user.service';

import { websocketService } from '../services/websocket.service'

import './home.component.css'

export default function Home() {
    const [sidError, setSidError] = useState('')
    const [url, setURL] = useState('')

    let history = useHistory();

    function joinSession() {
        websocketService.connect(sid)

        history.push(`/sessions/${sid}`)
    }

    function startSession(url: string) {
        userService.genSession(url).then(
            response => {
                websocketService.connect(response.data)

                history.push(`/sessions/${response.data}`)
            },
            error => {
                console.log(error)
            }
        )
    }

    function sidReducer(state: string, action: string) : string {
        try {
            // if (action.length > 14) {
            //     setSidError('Session ID must be 14 characters long or less')

            //     return state
            // }
            setSidError('')

            return action
        } catch (e) {
            console.log(e)
            setSidError('Not a valid session ID')

            return state
        }
    }

    const [sid, sidDispatch] = useReducer(sidReducer, '')


    return (
        <>
            <Container className="shadow p-3 bg-white rounded" style={{ width: '50%', marginTop: '30px' }}>
                <Row>
                    <Col md={{span: 2}}>
                        <img width='100%' src="http://visualisationlab.science.uva.nl/wp-content/uploads/2022/02/VisLablogo-cropped-notitle.svg" className="custom-logo" alt="Visualisation Lab"></img>
                    </Col>
                    <Col md={{span: 10}}>
                        <h1>Graph-Vis</h1>
                        <p className='text-secondary'> Graph Visualisation Software. Create a new session or join an existing one below.</p>

                    </Col>
                </Row>
            </Container>
            <Container className="shadow p-3 bg-white rounded" style={{ width: '50%', marginTop: '20px' }}>
                <Row>
                    <Col md={{span: 8}} >
                        <Row>
                            <Form.Group>
                                <Form.Label htmlFor="url">Graph URL</Form.Label>
                                <Form.Control
                                type="text"
                                id="url"
                                aria-describedby="urlBlock"
                                onChange={(e) => {
                                    setURL(e.target.value)
                                }}
                                />
                                <Form.Text id="urlBlock" muted>
                                Enter a URL pointing to a graph in JSON format.
                                </Form.Text>
                            </Form.Group>
                        </Row>
                        <Row style={{
                                marginTop: '10px'
                            }}>
                            <Col md={{span: 4}}>
                                <Button variant='primary'
                                        type='submit'
                                        onClick={() => startSession(url)}
                                        disabled={url === ''}>
                                    Start session
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={{span: 4, offset: 0}}>
                        <Row >
                            <Col>
                                <Form.Group>
                                    <Form.Label htmlFor="sid">Session ID</Form.Label>
                                    <Form.Control
                                    type="text"
                                    id="sid"
                                    aria-describedby="sidBlock"
                                    onChange={(e) => sidDispatch(e.target.value)}
                                    />
                                    <Form.Text id="sid">
                                    Enter an existing session ID.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Row>
                            {/* {sidError !== '' &&
                                        <p className='text-danger'>
                                        {sidError}
                                    </p>
                                } */}
                            </Row>
                        </Row>
                        <Row style={{
                                marginTop: '20px'
                            }}>
                            <Col >
                                <Button variant='primary' type='submit' disabled={sid === '' || sidError !== ''} onClick={joinSession}>
                                    Join Session
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
