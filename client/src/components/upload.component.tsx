/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the main App component, which is the root of the React app.
 * It contains the routing logic for the app. It allows users to upload a graph
 * and then view it in the main component, or to join an existing session.
 * It also contains information about the project.
 */

import { useEffect, useLayoutEffect, useState } from 'react'

import {
    loadBackgroundRendering
} from './globals'

// import { useHistory } from 'react-router-dom'
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Form,
    InputGroup,
    DropdownButton,
    Dropdown,
    Nav,
    Card,
    // Table, Spinner, DropdownButton, InputGroup, Dropdown
 } from 'react-bootstrap'
// import { userService } from '../services/user.service'
// import { round } from 'mathjs'

import './home.component.css'

const BACKGROUND_ID = 'backgroundRendering'

// type ErrorPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6

// interface ErrorMessage {
//     phase: ErrorPhase,
//     errors: string[]
// }

interface ServerGraphData {
    graphs: string[],
    root: string
}

interface SessionStatus {
    sid: string,
    creationDate: Date,
    expirationDate: Date,
    connectedUsers: number,
    nodeCount: number,
    edgeCount: number,
    graphURL: string,
}

const testSessionStatus: SessionStatus[] = [
    {
        sid: 'test0',
        creationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        connectedUsers: 1,
        nodeCount: 1,
        edgeCount: 1,
        graphURL: 'test0'
    },
    {
        sid: 'test1',
        creationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        connectedUsers: 2,
        nodeCount: 0,
        edgeCount: 1,
        graphURL: 'test1'
    },
    {
        sid: 'test2',
        creationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        connectedUsers: 0,
        nodeCount: 0,
        edgeCount: 1,
        graphURL: 'test2'
    }
]

// const SID_MAX_LENGTH = 8

function renderAnimatedBackground() {
    return (
        <div id={BACKGROUND_ID} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1
        }}>
        </div>
    )
}

function renderHeader() {
    return (
        <Container className="shadow p-3 bg-white rounded"
            style={{
                width: '50%',
                marginTop: '30px',
                }}>
            <Row>
                <Col md={{span: 2}}>
                    <img
                        width='100%'
                        // src="https://chimay.science.uva.nl:8061/VisLablogo-cropped-notitle.svg"
                        src="https://dev.citadel:3001/VisLablogo-cropped-notitle.svg"
                        className="custom-logo"
                        alt="Visualisation Lab"
                    />
                </Col>
                <Col md={{span: 10}}>
                    <h1>
                        Citadel
                    </h1>
                    <p
                        className='text-secondary'
                    >
                        Graph Visualisation Software! Create a new session or join an existing one below.
                    </p>
                </Col>
            </Row>
        </Container>
    )
}

function renderCreate(
    loading: boolean,
    url: string,
    graphList: string[],
) {
    // Renders the start session button in the second panel.
    const startSessionButton = !loading ? (
        <Button variant='primary'
                type='submit'
                onClick={() => {
                    // startSession(
                    //     // url
                    // )
                }}
                disabled={url === ''}>
            Start session
        </Button>
    ) : (
        <Spinner animation='border'/>
    )

    const graphListDropdown = graphList.length === 0 ? <></>
        : (
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
                        <Dropdown.Item
                            key={index}
                            // onClick={() => {setURL(graphRoot + val)}}
                        >
                            {val}
                        </Dropdown.Item>
                    )
                })
            }
            </div>
        </DropdownButton>
    )

    const inputForm = (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>
                    New Session
                </Form.Label>
                <InputGroup>
                    <Form.Control
                        type="text"
                        id="url"
                        aria-describedby="urlBlock"
                        // onChange={(e) => {setURL(e.target.value)}}
                        value={url}
                    />
                    {graphListDropdown}
                </InputGroup>
                <Form.Text id="url">
                    Enter a URL to a graph file.
                </Form.Text>
            </Form.Group>
            {
                startSessionButton
            }
        </Form>
    )

    return inputForm
}

function renderSessionCard(session: SessionStatus, active: boolean): JSX.Element {
    return (
        <Card
            border={active ? 'light' : 'dark'}
            style={{
                marginTop: '5px',
                marginBottom: '5px',
                padding: '0px',
            }}
        >
            <Card.Header>
                {
                    session.sid + ' (' + session.connectedUsers + ' user(s))'
                }
            </Card.Header>
            <Card.Body>
                <Card.Text>
                    Expiration date {session.expirationDate.toLocaleString()}
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button
                    disabled={!active}
                    onClick={() => {
                        console.log("Connecting to session " + session.sid)
                        // joinSession(sid)
                    }}
                >
                    Connect
                </Button>
            </Card.Footer>
        </Card>
    )
}

function renderJoin(
    manualSid: string,
    sessions: SessionStatus[]) {
    // Renders the previous session form in the third panel.

    if (sessions.length === 0) {
        return <></>
    }

    const currentDate = new Date()

    const activeSessionList = sessions.filter((session) => {
        return (session.expirationDate).getTime() > currentDate.getTime()
    }).map((session) => {
        return renderSessionCard(session, true)
    })

    const previousSessionList = sessions.filter((session) => {
        return (session.expirationDate).getTime() < currentDate.getTime()
    }).sort((a, b) => {
        return b.expirationDate.getTime() - a.expirationDate.getTime()
    }).map((session) => {
        return renderSessionCard(session, false)
    })


    // const previousSessionList = (
    //     <Table striped bordered hover>
    //         <thead>
    //             <tr>
    //                 <th>Session ID</th>
    //             </tr>
    //         </thead>
    //         <tbody>
    //             {previousSessions.map((previousSession, index) => {
    //                 const elapsedMinutes = round(((new Date()).getTime() - new Date(previousSession.expirationDate).getTime()) / 1000 / 60, 0)

    //                 return (
    //                     <tr key={previousSession.sid}>
    //                         <td>
    //                             {
    //                                 previousSession.sid + ((elapsedMinutes > 120) ? '' : ' (' + elapsedMinutes + ' minute(s) ago)')
    //                             }
    //                         </td>
    //                         <td>
    //                             <Button
    //                                 disabled={!sessionStatusList[index]}
    //                                 onClick={() => {
    //                                     console.log("Connecting to session " + sid)
    //                                     joinSession(sid)
    //                                 }}
    //                             >
    //                                 Connect
    //                             </Button>
    //                         </td>
    //                     </tr>
    //                 )
    //             })}
    //         </tbody>
    //     </Table>
    // )

    {/* <Row>
                <Col>
                    <Form>
                        <Form.Group className='mb-3'>
                            <Form.Label htmlFor="sid">Existing Session</Form.Label>
                            <Form.Control
                            type="text"
                            id="sid"
                            aria-describedby="sidBlock"
                            // onChange={(e) => {setSid(e.target.value)}}
                            />
                            <Form.Text id="sid">
                            Enter an existing session ID.
                            </Form.Text>
                        </Form.Group>
                        <Button variant='primary'
                            type='submit'
                            disabled={sid === ''}
                            // onClick={() => {joinSession(null)}}
                        >
                            Join Session
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row style={{
                marginTop: '20px'
            }}>
                <Col>
                    {previousSessionList}
                </Col>
            </Row> */}
    return (
        <>
            <Row>
                <Col>
                    {activeSessionList}
                </Col>
            </Row>
            <br></br>
            <Row>
                <Col>
                    {previousSessionList}
                </Col>
            </Row>
        </>
    )
}

// function renderError() {
//     const phaseDescriptions = [
//         'Connect to server',
//         'Check URL',
//         'Get from external URL',
//         'Read data',
//         'Parse data',
//         'Create session'
//     ]

//     const renderPhase = phaseDescriptions.map((phaseText, index) => {
//         let variant = 'secondary'

//         if (index === error.phase) {
//             variant = 'danger'
//         }
//         else if (index < error.phase) {
//             variant = 'success'
//         }

//         return (
//             <>
//                 <Col>
//                     <Button
//                         variant={variant}
//                         disabled={true}
//                     >
//                         {phaseText}

//                     </Button>
//                 </Col>
//                 {index < phaseDescriptions.length - 1 && (
//                     <Col>
//                         {'->'}
//                     </Col>
//                 )}
//             </>
//         )
//     })

//     errorText = (
//         <>
//             <Row style={{
//                 marginTop: '10px',
//                 marginBottom: '10px'
//             }}>
//                 {renderPhase}
//             </Row>
//             <Row>
//                 <Col>
//                     <Table variant="responsive" responsive striped bordered hover>
//                         <thead>
//                             <tr>
//                                 {/* <th>Phase</th> */}
//                                 {/* <th>Property</th> */}
//                                 <th>Error</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {error.errors.map((val) => {
//                                 return (
//                                     <tr key='val'>
//                                         {/* <td>{error.phase}</td> */}
//                                         {/* <td>{index}</td> */}
//                                         <td>{val}</td>
//                                     </tr>
//                                 )
//                             })}
//                         </tbody>
//                     </Table>
//                 </Col>
//             </Row>
//         </>
//     )
// }

function renderFAQ() {
    return (
        <Container className="shadow p-3 bg-white rounded"
            style={{
                width: '50%',
                marginTop: '30px'
            }}>
            <Row>
                <Col>
                    <h3>
                        FAQ
                    </h3>
                    <p>
                        <b>What is Citadel?!!</b>
                    </p>
                    <p>
                        Citadel is a graph visualisation tool. It allows you to upload a graph file and view it in a browser.
                    </p>
                    <p>
                        <b>How do I use Citadel?</b>
                    </p>
                    <p>
                        To start a new session, enter a URL to a graph file in the text box above and click "Start session".
                        To join an existing session, enter the session ID in the text box above and click "Join session".
                    </p>
                    <p>
                        <b>What graph file formats are supported?</b>
                    </p>
                    <p>
                        Citadel supports the following graph file formats:
                    </p>
                    <ul>
                    </ul>
                    <p>
                        <b>How do I create a graph file?</b>
                    </p>
                    <p>
                        You can create a graph file in any text editor.
                    </p>

                </Col>
            </Row>
        </Container>
    )
}

type MenuType = 'create' | 'join active' | 'history' | 'join (manual sid)'

// Renders the upload component.
function render(
    loading: boolean,
    url: string,
    graphList: string[],
    menuType: MenuType,
    setMenuType: (type: MenuType) => void
) {
    return (
        <div style={{
            overflowY: 'auto',
            maxHeight: '100vh'
        }}>
            {renderAnimatedBackground()}
            {renderHeader()}
            <Container
                className="shadow p-3 bg-white rounded"
                style={{
                    width: '50%',
                    marginTop: '20px'
            }}>
                <Row>
                    <Col>
                        <Nav
                            variant='underline'
                            defaultActiveKey={'create'}
                            onSelect={(selectedKey) => {
                                setMenuType(selectedKey as MenuType)
                            }}
                        >
                            <Nav.Item>
                                <Nav.Link eventKey='create'>
                                    Create Session
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='join active'>
                                    Join Active Session
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='history'>
                                    Session History
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='join (manual sid)'>
                                    Join Session (Manual SID)
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            menuType === 'create'
                            ? renderCreate(loading, url, graphList)
                            : renderJoin('', testSessionStatus)
                        }
                    </Col>
                </Row>
            </Container>
            {renderFAQ()}
            {/* {renderError()}
            {renderPreviousSessionSelection()} */}
        </div>
    )
}

// Parses the previous sessions from local storage.
// function parsePreviousSessions(previousSessions: string | null): PreviousSession[] {
//     if (previousSessions === null) {
//         return []
//     }

//     const result: PreviousSession[] = []

//     const sessions = previousSessions.split(',')

//     sessions.forEach(session => {
//         const [sid, date] = session.split(':')

//         if (sid === undefined || date === undefined) {
//             return
//         }

//         if (sid.length > SID_MAX_LENGTH) {
//             return
//         }

//         result.push([sid, new Date(date)])
//     })

//     return result
// }

// function startSession(
//     // url: string
//     ) {
//     setError(null)

//     setLoading(true)

//     userService.genSession(url).then(
//         response => {
//             setLoading(false)
//             history.push(`/sessions/${response.data}`)
//         },
//         error => {
//             setLoading(false)

//             if (error.response.status === 404) {
//                 setError({
//                     phase: 0,
//                     errors: ['Could not connect to server.']
//                 })
//             }
//             else if (error.response.status === 400) {
//                 console.log("setting errors")

//                 setError({
//                     phase: error.response.data.phase,
//                     errors: error.response.data.errors
//                 })
//             }
//         }
//     )
// }

// function joinSession(newSid: string | null) {
//     if (newSid === null) {
//         history.push(`/sessions/${sid}`)
//     }
//     else {
//         history.push(`/sessions/${newSid}`)
//     }
// }



export default function UploadComponent() {
    const [url, setURL] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const [serverGraphData, setServerGraphData] = useState<ServerGraphData>({graphs: [], root: ''})
    const [menuType, setMenuType] = useState<MenuType>('create')

    // const [error, setError] = useState<ErrorMessage | null>(null)

    // const [sessionStatusList, setSessionStatusList] = useState<boolean[]>([false, false, false, false, false])


    // const history = useHistory()

    // const [sid, setSid] = useState('')

    // const [parsedPreviousSessions, setParsedPreviousSessions] = useState<PreviousSession[]>([])

    // Load previous sessions from local storage
    // useEffect(() => {
    //     const previousSessions = parsePreviousSessions(localStorage.getItem('prevSessions'))

    //     if (previousSessions.length > 0) {
    //         setParsedPreviousSessions(previousSessions)
    //     }
    // }, [setParsedPreviousSessions])

    // Load graphlist from server
    useEffect(() => {
        // userService.getGraphs().then(
        //     response => {
        //         setServerGraphData()
        //     }
        // )
    }, [])

    // Load session status from server
    // useEffect(() => {
    //     const result: boolean[] = []

    //     if (parsedPreviousSessions.length === 0) {
    //         return
    //     }

    //     parsedPreviousSessions.forEach((data) => {
    //         userService.getSessionStatus(data.sid).then(
    //             response => {
    //                 result.push(response.data)

    //                 if (parsedPrevSessions && res.length === parsedPrevSessions.length - 1) {
    //                     setSessionStatusList(res)
    //                 }
    //             }
    //         )
    //     })
    // }, [parsedPreviousSessions])


    useLayoutEffect(() => {
        loadBackgroundRendering(BACKGROUND_ID)
    }, [])

    // Render the component.
    return render(loading, url, serverGraphData.graphs, menuType, setMenuType)
}
