/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the main App component, which is the root of the React app.
 * It contains the routing logic for the app. It allows users to upload a graph
 * and then view it in the main component, or to join an existing session.
 * It also contains information about the project.
 */

import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Form, Button, Container, Row, Col, Table, Spinner } from 'react-bootstrap'
import { userService } from '../services/user.service'
import { round } from 'mathjs'

import './home.component.css'

export default function Home() {
    const [url, setURL] = useState('')
    const [errors, setErrors] = useState<[string, string][]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [sessionStatusList, setSessionStatusList] = useState<boolean[]>([false, false, false, false, false])

    let history = useHistory()

    const [sid, setSid] = useState('')

    const prevSessions = localStorage.getItem('prevSessions')

    console.log(prevSessions)
    let parsedPrevSessions : [string, Date][] = []

    if (prevSessions !== null) {
        parsedPrevSessions = JSON.parse(prevSessions)
    }

    useEffect(() => {
        let res: boolean[] = []

        parsedPrevSessions.forEach(([sid, date], index) => {
            userService.getSessionStatus(sid).then(
                response => {
                    console.log(response.data)
                    res.push(response.data)

                    if (res.length === parsedPrevSessions.length - 1) {
                        setSessionStatusList(res)
                    }
                }
            )
        })

    }, [])

    function joinSession(newSid: string | null) {
        if (newSid === null) {
            history.push(`/sessions/${sid}`)
        }
        else {
            history.push(`/sessions/${newSid}`)
        }
    }

    function startSession(url: string) {
        setErrors([])

        setLoading(true)

        userService.genSession(url).then(
            response => {
                setLoading(false)
                history.push(`/sessions/${response.data}`)
            },
            error => {
                setLoading(false)

                console.log(error.response)
                if (error.response.status === 404) {
                    setErrors([["server", "Couldn't fetch data from remote"]])
                }
                if (error.response.status === 400) {
                    console.log("setting errors")

                    setErrors(error.response.data.errors.length !== 0 ? error.response.data.errors.map((val: {message: string, property: string}) => {
                        return [val.property, val.message]
                    }) : [["server", error.response.data.msg]])
                }
                console.log(error.response.data)
            }
        )
    }

    let errorText = errors.length === 0 ? [] : (
        <Row>
            <Col>
            <style type="text/css">
                {`
                .table-responsive {
                    overflow: auto;
                    // display: block;
                    // table-layout: auto;
                    height: 200px;
                }
                `}
            </style>
                <Table variant="responsive" responsive striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Property</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errors.map((val, index) => {
                            return (
                                <tr key='val'>
                                    <td>{index}</td>
                                    <td>{val[0]}</td>
                                    <td>{val[1]}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </Col>
        </Row>
    )


    let but = !loading ? (
        <Button variant='primary'
                type='submit'
                onClick={() => startSession(url)}
                disabled={url === ''}>
            Start session
        </Button>
    ) : (
        <Spinner animation='border'></Spinner>
    )

    return (
        <>
            <Container className="shadow p-3 bg-white rounded" style={{ width: '50%', marginTop: '30px' }}>
                <Row>
                    <Col md={{span: 2}}>
                        <img width='100%' src="https://chimay.science.uva.nl:8061/VisLablogo-cropped-notitle.svg" className="custom-logo" alt="Visualisation Lab"></img>
                    </Col>
                    <Col md={{span: 10}}>
                        <h1>Citadel</h1>
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

                                {but}
                            </Col>
                        </Row>
                        {errorText}
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
                                    onChange={(e) => setSid(e.target.value)}
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
                                <Button variant='primary' type='submit' disabled={sid === ''} onClick={() => joinSession(null)}>
                                    Join Session
                                </Button>
                            </Col>
                        </Row>

                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h4>Previous sessions</h4>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Session ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedPrevSessions.map(([sid, date], index) => {
                                    let elapsedMins = round(((new Date()).getTime() - new Date(date).getTime()) / 1000 / 60, 1)

                                    return (
                                        <tr key={sid}>
                                            <td>{sid} ({elapsedMins} minutes ago)</td>
                                            <td><Button
                                                disabled={!sessionStatusList[index]}
                                                onClick={() => {
                                                console.log("Connecting to session " + sid)

                                                joinSession(sid)
                                            }}>Connect</Button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
            {/* <Container className="shadow p-3 bg-white rounded" style={{ width: '50%', marginTop: '30px' }}>
                <Row>
                    <Col>
                        <h2>About Citadel</h2>
                    </Col>
                </Row>
            </Container> */}
        </>
    )
}
