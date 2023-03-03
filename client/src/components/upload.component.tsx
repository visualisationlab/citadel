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
import { Form, Button, Container, Row, Col, Table, Spinner, DropdownButton, InputGroup, Dropdown } from 'react-bootstrap'
import { userService } from '../services/user.service'
import { round } from 'mathjs'

import './home.component.css'

type ErrorPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6

type ErrorMessage = {
    phase: ErrorPhase,
    errors: string[]
}

export default function Home() {
    const [url, setURL] = useState('')

    const [error, setError] = useState<ErrorMessage | null>(null)

    const [loading, setLoading] = useState<boolean>(false)

    const [sessionStatusList, setSessionStatusList] = useState<boolean[]>([false, false, false, false, false])

    const [graphList, setGraphList] = useState<string[]>([])

    const [graphRoot, setGraphRoot] = useState<string>('')

    let history = useHistory()

    const [sid, setSid] = useState('')

    let [parsedPrevSessions, setParsedPrevSessions] = useState<[string, Date][] | null>([])

    // Load previous sessions from local storage
    useEffect(() => {
        const prevSessions = localStorage.getItem('prevSessions')

        if (prevSessions !== null) {
            setParsedPrevSessions(JSON.parse(prevSessions))
        } else {
            return
        }
    }, [setParsedPrevSessions])

    // Load graphlist from server
    useEffect(() => {
        userService.getGraphs().then(
            response => {
                setGraphList(response.data.graphs)
                setGraphRoot(response.data.root)
            }
        )
    }, [])

    // Load session status from server
    useEffect(() => {
        let res: boolean[] = []

        if (parsedPrevSessions === null) {
            return
        }

        parsedPrevSessions.forEach(([sid, date], index) => {
            userService.getSessionStatus(sid).then(
                response => {
                    res.push(response.data)

                    if (parsedPrevSessions && res.length === parsedPrevSessions.length - 1) {
                        setSessionStatusList(res)
                    }
                }
            )
        })
    }, [parsedPrevSessions])

    function joinSession(newSid: string | null) {
        if (newSid === null) {
            history.push(`/sessions/${sid}`)
        }
        else {
            history.push(`/sessions/${newSid}`)
        }
    }

    function startSession(url: string) {
        setError(null)

        setLoading(true)

        userService.genSession(url).then(
            response => {
                setLoading(false)
                history.push(`/sessions/${response.data}`)
            },
            error => {
                setLoading(false)

                if (error.response.status === 404) {
                    setError({
                        phase: 0,
                        errors: ['Could not connect to server.']
                    })
                }
                else if (error.response.status === 400) {
                    console.log("setting errors")

                    setError({
                        phase: error.response.data.phase,
                        errors: error.response.data.errors
                    })
                }
            }
        )
    }

    let errorText = <></>

    if (error) {
        console.log(error)



        let phaseTexts = [
            'Connect to server',
            'Check URL',
            'Get from external URL',
            'Read data',
            'Parse data',
            'Create session'
        ]

        let renderPhase = phaseTexts.map((phaseText, index) => {
            let variant = 'secondary'

            if (index === error.phase) {
                variant = 'danger'
            }
            else if (index < error.phase) {
                variant = 'success'
            }

            return (
                <>
                    <Col>
                        <Button
                            variant={variant}
                            disabled={true}
                        >
                            {phaseText}

                        </Button>
                    </Col>
                    {index < phaseTexts.length - 1 && (
                        <Col>
                            {'->'}
                        </Col>
                    )}
                </>
            )
        })

        errorText = (
            <>
                <Row style={{
                    marginTop: '10px',
                    marginBottom: '10px'
                }}>
                    {renderPhase}
                </Row>
                <Row>
                    <Col>
                        <Table variant="responsive" responsive striped bordered hover>
                            <thead>
                                <tr>
                                    {/* <th>Phase</th> */}
                                    {/* <th>Property</th> */}
                                    <th>Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {error.errors.map((val, index) => {
                                    return (
                                        <tr key='val'>
                                            {/* <td>{error.phase}</td> */}
                                            {/* <td>{index}</td> */}
                                            <td>{val}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </>
        )
    }


    let startSessionButton = !loading ? (
        <Button variant='primary'
                type='submit'
                onClick={() => startSession(url)}
                disabled={url === ''}>
            Start session
        </Button>
    ) : (
        <Spinner animation='border'></Spinner>
    )

    let prevSessionComponent = parsedPrevSessions === null ? [] : (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Session ID</th>
                </tr>
            </thead>
            <tbody>
                {parsedPrevSessions.map(([sid, date], index) => {
                    let elapsedMins = round(((new Date()).getTime() - new Date(date).getTime()) / 1000 / 60, 0)

                    return (
                        <tr key={sid}>
                            <td>{sid + ((elapsedMins > 120) ? '' : ' (' + elapsedMins + ' minute(s) ago)')} </td>
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
                    <Col>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>New Session</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        id="url"
                                        aria-describedby="urlBlock"
                                        onChange={(e) => setURL(e.target.value)}
                                        value={url}
                                    />
                                    <DropdownButton
                                        variant="outline-primary"
                                        title="Graph URLs"
                                        id="input-group-dropdown-1"
                                    >
                                        <div style={{
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                        {
                                            graphList.map((val, index) => {
                                                return (
                                                    <Dropdown.Item key={index} onClick={
                                                        () => setURL(graphRoot + val)}>{val}</Dropdown.Item>
                                                )
                                            })
                                        }
                                        </div>
                                    </DropdownButton>
                                </InputGroup>
                                <Form.Text id="url">
                                Enter a URL to a graph file.
                                </Form.Text>
                            </Form.Group>
                            {startSessionButton}
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {errorText}
                    </Col>
                </Row>
            </Container>
            <Container className="shadow p-3 bg-white rounded" style={{ width: '50%', marginTop: '30px' }}>
                <Row>
                    <Col>
                        <Form>
                            <Form.Group className='mb-3'>
                                <Form.Label htmlFor="sid">Existing Session</Form.Label>
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
                            <Button variant='primary' type='submit' disabled={sid === ''} onClick={() => joinSession(null)}>
                                Join Session
                            </Button>
                        </Form>
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
                    <Col>
                        {prevSessionComponent}
                    </Col>
                </Row>

            </Container>
        </>
    )
}
