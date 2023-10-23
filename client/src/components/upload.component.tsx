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
} from './backgroundrenderer.component'

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
    Alert,
    ListGroup,
    Popover,
    OverlayTrigger,
    Toast,
    ToastContainer
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
    graphs: GraphDataInfo[],
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

interface GraphDataInfo {
    name: string,
    nodeCount: number,
    edgeCount: number,
    lastAccessed: Date | null,
    size: number
}

interface Notification {
    title: string,
    contents: string,
    time: Date,
    show: boolean
}

function subtractHours(date: Date, hours: number): Date {
    const newDate = new Date()

    newDate.setHours(date.getHours() - hours)

    return newDate
}

function subtractMinutes(date: Date, minutes: number): Date {
    const newDate = new Date()

    newDate.setMinutes(date.getMinutes() - minutes)

    return newDate
}

function addDays(date: Date, days: number): Date {
    const newDate = new Date()

    newDate.setDate(date.getDate() + days)

    return newDate
}

const currentDate = new Date()

const testSessionStatus: SessionStatus[] = [
    {
        sid: 'test0',
        creationDate: subtractHours(currentDate, 3),
        expirationDate: addDays(currentDate, 1),
        connectedUsers: 1,
        nodeCount: 1,
        edgeCount: 2,
        graphURL: 'test0'
    },
    // {
    //     sid: 'test1',
    //     creationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    //     expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    //     connectedUsers: 2,
    //     nodeCount: 0,
    //     edgeCount: 1,
    //     graphURL: 'test1'
    // },
    // {
    //     sid: 'test2',
    //     creationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    //     expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    //     connectedUsers: 0,
    //     nodeCount: 0,
    //     edgeCount: 1,
    //     graphURL: 'test2'
    // }
]

const testGraphData: GraphDataInfo[] = [
    {
        name: 'TEST',
        edgeCount: 10,
        nodeCount: 10,
        lastAccessed: null,
        size: 100
    }
]

const testServerInfo: ServerInfo = {
    currentSessionCount: 0,
    serverRoot: 'HELLo',
    sessionDuration: new Date(1),
    storedGraphs: 4,
    uptime: new Date(1000)
}

const testNotifications: Notification[] = [
    {
        title: 'Test',
        contents: 'Test contents',
        time: subtractMinutes(currentDate, 1),
        show: true
    },
    {
        title: 'Test',
        contents: 'Test contents',
        time: subtractMinutes(currentDate, 2),
        show: true
    },
    {
        title: 'Test',
        contents: 'Test contents',
        time: subtractMinutes(currentDate, 5),
        show: true
    }

]

// const SID_MAX_LENGTH = 8

function renderAnimatedBackground() {
    return (
        <div id={BACKGROUND_ID} style={{        }}>
        </div>
    )
}

function renderHeader(notifications: Notification[], setNotifications: (notifications: Notification[]) => void) {
    return (
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
            <Col>
                <Button onClick={() => {
                    setNotifications([{
                        title: "NEW NEW",
                        contents: "NEW NEW 2",
                        show: true,
                        time: (new Date())
                    }, ...notifications])

                }}>Add notification</Button>
            </Col>
        </Row>
    )
}

function renderCreate(
    loading: boolean,
    url: string,
    setURL: (url: string) => void,
    graphList: GraphDataInfo[],
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

    const graphListInfoOver = (
        <Popover id="popover-graphlist" style={{
        }}>
            <Popover.Header>Stored Graph Data</Popover.Header>
            <Popover.Body>
                A set of preset graphs stored on the server.
            </Popover.Body>
        </Popover>
    )

    const graphListDropdown = graphList.length === 0 ? <></>
        : (
        <OverlayTrigger
            trigger={["hover", "focus"]}
            placement="top"
            overlay={graphListInfoOver}
            key={'a'}>
            <span>
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
                                    onClick={() => {setURL(val.name)}}
                                >
                                    {val.name}
                                </Dropdown.Item>
                            )
                        })
                    }
                    </div>
                </DropdownButton>
            </span>
        </OverlayTrigger>
    )

    const graphIndex = graphList.findIndex((graph) => {
        return graph.name === url
    })

    const renderGraphInfo = (graphIndex === -1) ? <></> : (
        <Card>
            <Card.Body>
                <Card.Title>Graph Information</Card.Title>
                <Card.Body>Graph information stored on server.</Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item>{graphList[graphIndex]?.name}</ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
    )

    const urlOverlay = (
        <Popover id="popover-url">
            <Popover.Header>Source URL</Popover.Header>
            <Popover.Body>
                Citadel fetches the data pointed at by this URL to create a new session.
            </Popover.Body>
        </Popover>
    )

    const inputForm = (
        <>
            <Row>
                <Col>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                New Session
                            </Form.Label>
                            <InputGroup>
                                <OverlayTrigger
                                    trigger={['focus', 'hover']}
                                    placement="top"
                                    overlay={urlOverlay}
                                    key={'b'}
                                >
                                    {/* <span> */}
                                        <Form.Control
                                            type="text"
                                            id="url"
                                            aria-describedby="urlBlock"
                                            // onChange={(e) => {setURL(e.target.value)}}
                                            value={url}
                                        />
                                    {/* </span> */}
                                </OverlayTrigger>
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
                </Col>
            </Row>
            <Row>
                <Col>
                    {renderGraphInfo}
                </Col>
            </Row>
        </>
    )

    return inputForm
}

function renderSessionCard(session: SessionStatus, active: boolean): JSX.Element {
    // const elapsedTime = new Date((currentDate).getTime() - session.creationDate.getTime())

    return (
        <Card
            border={active ? 'light' : 'dark'}
            style={{
                marginTop: '5px',
                marginBottom: '5px',
                padding: '0px',
                maxWidth: '400px'
            }}
        >
            {/* <Card.Header>
                {
                    session.sid + ' (' + session.connectedUsers + ' user(s))'
                }
            </Card.Header> */}
            <Card.Body>
                <Row>
                    <Col>
                        Number of nodes: {session.nodeCount}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Number of edges: {session.edgeCount}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Session started: {session.creationDate.toLocaleDateString()}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Session expires on: {session.expirationDate.toLocaleDateString()}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Number of connected users: {session.connectedUsers}
                    </Col>
                </Row>
            </Card.Body>
            <Card.Footer>
                <Row>
                    <Col>
                        <Button
                            disabled={!active}
                            onClick={() => {
                                console.log("Connecting to session " + session.sid)
                                // joinSession(sid)
                            }}
                        >
                            Connect
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={() => {
                            navigator.clipboard.writeText(session.sid).then(() => {
                                console.log('Copied sid to clipboard')
                            }).catch((reason) => {
                                console.log('Unable to print sid to clipboard due to ', reason)
                            })
                        }}
                            variant="outline-secondary"
                        >
                            Copy Session ID
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={() => {
                            console.log("Copying session ID")
                        }}
                            variant="outline-secondary"
                        >
                            Copy Source URL
                        </Button>
                    </Col>
                </Row>
            </Card.Footer>
        </Card>
    )
}

function renderJoinManual(
    url: string,
    setUrl: (str: string) => void
) {
    setUrl('abc')
    return (
        <Row>
            <Col>
                {url}
            </Col>
        </Row>
    )
}

function renderHistory(sessions: SessionStatus[]) {
    if (sessions.length === 0) {
        return <></>
    }

    const currentDate = new Date()

    const activeSessionList = sessions.filter((session) => {
        return (session.expirationDate).getTime() > currentDate.getTime()
    }).map((session) => {
        return renderSessionCard(session, true)
    })

    return (
        <>
            {activeSessionList}
        </>
    )
}

function renderJoinActive(sessions: SessionStatus[]) {
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
        </>
    )
}

function renderError(heading: string, content: string) {
    // const phaseDescriptions = [
    //     'Connect to server',
    //     'Check URL',
    //     'Get from external URL',
    //     'Read data',
    //     'Parse data',
    //     'Create session'
    // ]

    // const renderPhase = phaseDescriptions.map((phaseText, index) => {
    //     let variant = 'secondary'

    //     if (index === error.phase) {
    //         variant = 'danger'
    //     }
    //     else if (index < error.phase) {
    //         variant = 'success'
    //     }

    //     return (
    //         <>
    //             <Col>
    //                 <Button
    //                     variant={variant}
    //                     disabled={true}
    //                 >
    //                     {phaseText}

    //                 </Button>
    //             </Col>
    //             {index < phaseDescriptions.length - 1 && (
    //                 <Col>
    //                     {'->'}
    //                 </Col>
    //             )}
    //         </>
    //     )
    // })

    // errorText = (
    //     <>
    //         <Row style={{
    //             marginTop: '10px',
    //             marginBottom: '10px'
    //         }}>
    //             {renderPhase}
    //         </Row>
    //         <Row>
    //             <Col>
    //                 <Table variant="responsive" responsive striped bordered hover>
    //                     <thead>
    //                         <tr>
    //                             {/* <th>Phase</th> */}
    //                             {/* <th>Property</th> */}
    //                             <th>Error</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {error.errors.map((val) => {
    //                             return (
    //                                 <tr key='val'>
    //                                     {/* <td>{error.phase}</td> */}
    //                                     {/* <td>{index}</td> */}
    //                                     <td>{val}</td>
    //                                 </tr>
    //                             )
    //                         })}
    //                     </tbody>
    //                 </Table>
    //             </Col>
    //         </Row>
    //     </>
    // )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    if (true) {
        return <></>
    }

    return (
        <Alert variant='danger' dismissible>
            <Alert.Heading>{heading}</Alert.Heading>
            <p>
                {content}
            </p>
        </Alert>
    )
}

function renderFAQ() {
    return (
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
    )
}

type MenuType = 'create' | 'join active' | 'history' | 'join (manual sid)' | 'faq' | 'server status'

interface ServerInfo {
    uptime: Date,
    sessionDuration: Date,
    currentSessionCount: number,
    storedGraphs: number,
    serverRoot: string
}

function renderServerStatus(serverInfo: ServerInfo) {
    return (
        <p>
            {serverInfo.serverRoot}
        </p>
    )
}

function renderNotifications(
    notifications: Notification[],
    setNotifications: (notifications: Notification[]) => void) {
    const visibleNotifications = notifications.slice(0, 5).map((notification, index) => {
        return (
            <Toast
                show={notification.show}
                delay={5000}
                autohide
                onClose={() => {
                    const newNotifications = [...notifications]

                    const val = newNotifications[index]

                    if (val === undefined) {
                        return
                    }

                    val.show = false

                    Object.assign([], newNotifications, {index: val})

                    setNotifications(newNotifications)
                }}
            >
                <Toast.Header closeButton={true}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <strong>{notification.title}</strong>
                    <small style={{
                        marginLeft: 'auto'
                    }}>{new Date(currentDate.getTime() - notification.time.getTime()).getMinutes()} mins ago</small>
                </Toast.Header>
                <Toast.Body>
                    {notification.contents}
                </Toast.Body>
            </Toast>
        )
    })

    return (
        <ToastContainer
            className='p-3'
            position='top-end'
        >
            {visibleNotifications}
        </ToastContainer>
    )
}

// Renders the upload component.
function render(
    notifications: Notification[],
    setNotifications: (notifications: Notification[]) => void,
    loading: boolean,
    url: string,
    setUrl: (url: string) => void,
    sessions: SessionStatus[],
    graphList: GraphDataInfo[],
    menuType: MenuType,
    setMenuType: (type: MenuType) => void
) {
    let content = <></>

    const currentDate = new Date().getTime()

    const activeSessionCount = sessions.filter((session) => {
        return (session.expirationDate).getTime() > currentDate
    }).length

    switch (menuType) {
        case 'create':
            content = renderCreate(loading, url, setUrl, graphList)
            break
        case 'join active':
            content = renderJoinActive(sessions)
            break
        case 'join (manual sid)':
            content = renderJoinManual(url, setUrl)
            break
        case 'history':
            content = renderHistory(sessions)
            break
        case 'faq':
            content = renderFAQ()
            break
        case 'server status':
            content = renderServerStatus(testServerInfo)
            break
    }

    return (
        <>
            {renderNotifications(notifications, setNotifications)}
            <Container
                className="shadow p-3 bg-white rounded"
                style={{
                    position: 'absolute',
                    maxHeight: '100vh',
                    maxWidth: '70vw',
                    overflowY: 'auto',
                    left: '15%',
                    marginTop: '20px'
                }}>
                {renderHeader(notifications , setNotifications)}
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
                                    Join Active Session ({activeSessionCount})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='join manual'>
                                    Join Session (Manual URL)
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='history'>
                                    Session History
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='faq'>
                                    FAQ
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey='server status'>
                                    Server Status
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <br></br>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            renderError('Test Message', 'Some information')
                        }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            content
                        }
                    </Col>
                </Row>
            </Container>
        <>
            {renderAnimatedBackground()}
        </>
        </>
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


export default function Upload() {
    const [url, setURL] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const [serverGraphData, setServerGraphData] = useState<ServerGraphData>({graphs: [], root: ''})
    const [sessions, setSessions] = useState<SessionStatus[]>([])
    const [menuType, setMenuType] = useState<MenuType>('create')
    const [notifications, setNotifications] = useState<Notification[]>([])

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
        setURL('')
        setLoading(false)
        setServerGraphData({graphs: testGraphData, root: ''})
        setSessions(testSessionStatus)
        setNotifications(testNotifications)
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
        void loadBackgroundRendering(BACKGROUND_ID)
    }, [])

    // Render the component.
    return render(notifications, setNotifications, loading, url, setURL, sessions, serverGraphData.graphs, menuType, setMenuType)
}
