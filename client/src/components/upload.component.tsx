/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the main App component, which is the root of the React app.
 * It contains the routing logic for the app. It allows users to upload a graph
 * and then view it in the main component, or to join an existing session.
 * It also contains information about the project.
 */

import { useEffect, useState } from 'react'
import * as PIXI from "pixi.js"
import {ShockwaveFilter} from 'pixi-filters'
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

// interface PreviousSession {
//     sid: string,
//     date: Date
// }

// const SID_MAX_LENGTH = 8



function renderAnimatedBackground() {
    PIXI.utils.sayHello(PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas')

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
                        Graph Visualisation Software. Create a new session or join an existing one below.
                    </p>
                </Col>
            </Row>
        </Container>
    )
}

function renderInput(
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

    return (
        <Container
            className="shadow p-3 bg-white rounded"
            style={{
                width: '50%',
                marginTop: '20px'
            }}>
            <Row>
                <Col>
                    {renderInputMenu()}
                </Col>
            </Row>
            <Row>
                <Col>
                    {
                        inputForm
                    }
                </Col>
            </Row>
        </Container>
    )
}

// function renderPreviousSessionSelection() {
//     // Renders the previous session form in the third panel.
//     const previousSessionComponent = parsedPreviousSessions === null ? [] : (
//         <Table striped bordered hover>
//             <thead>
//                 <tr>
//                     <th>Session ID</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {parsedPreviousSessions.map(([sid, date], index) => {
//                     const elapsedMinutes = round(((new Date()).getTime() - new Date(date).getTime()) / 1000 / 60, 0)

//                     return (
//                         <tr key={sid}>
//                             <td>
//                                 {
//                                     sid + ((elapsedMinutes > 120) ? '' : ' (' + elapsedMinutes + ' minute(s) ago)')
//                                 }
//                             </td>
//                             <td>
//                                 <Button
//                                     disabled={!sessionStatusList[index]}
//                                     onClick={() => {
//                                         console.log("Connecting to session " + sid)
//                                         joinSession(sid)
//                                     }}
//                                 >
//                                     Connect
//                                 </Button>
//                             </td>
//                         </tr>
//                     )
//                 })}
//             </tbody>
//         </Table>
//     )
//     return (
//         <Container className="shadow p-3 bg-white rounded"
//             style={{
//                 width: '50%',
//                 marginTop: '30px'
//             }}>
//             <Row>
//                 <Col>
//                     <Form>
//                         <Form.Group className='mb-3'>
//                             <Form.Label htmlFor="sid">Existing Session</Form.Label>
//                             <Form.Control
//                             type="text"
//                             id="sid"
//                             aria-describedby="sidBlock"
//                             onChange={(e) => {setSid(e.target.value)}}
//                             />
//                             <Form.Text id="sid">
//                             Enter an existing session ID.
//                             </Form.Text>
//                         </Form.Group>
//                         <Button variant='primary'
//                             type='submit'
//                             disabled={sid === ''}
//                             onClick={() => {joinSession(null)}}
//                         >
//                             Join Session
//                         </Button>
//                     </Form>
//                 </Col>
//             </Row>
//             <Row style={{
//                 marginTop: '20px'
//             }}>
//                 <Col>
//                     {previousSessionComponent}
//                 </Col>
//             </Row>
//         </Container>
//     )
// }

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
                        <b>What is Citadel?</b>
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

function renderInputMenu() {
    return (
        <Nav variant='underline' defaultActiveKey={'create'}>
            <Nav.Item>
                <Nav.Link eventKey="create">Create</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="join">Join</Nav.Link>
            </Nav.Item>
        </Nav>
    )
}

// Renders the upload component.
function render(
    loading: boolean,
    url: string,
    graphList: string[],
) {
    return (
        <div style={{
            overflowY: 'auto',
            maxHeight: '100vh'
        }}>
            {renderAnimatedBackground()}
            {renderHeader()}
            {renderInput(loading, url, graphList)}
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

let clearBackgroundRendering = false

const spriteCount = 300
const SPRITE_VELOCITY = 5

interface RenderedSprite {
    sprite: PIXI.Sprite,
    vx: number,
    vy: number
}

function animationTicker(delta: number, spriteList: RenderedSprite[]) {
    for (let i = 0; i < spriteCount; i++) {
        const object = spriteList[i]

        if (object === undefined) {
            continue
        }

        if (object.sprite.x > window.innerWidth) {
            object.sprite.x = -object.sprite.width
        }

        if (object.sprite.x < -object.sprite.width) {
            object.sprite.x = window.innerWidth
        }

        if (object.sprite.y > window.innerHeight) {
            object.sprite.y = -object.sprite.height
        }

        if (object.sprite.y < -object.sprite.height) {
            object.sprite.y = window.innerHeight
        }

        // If object is close to another object, move away from it
        for (let j = 0; j < spriteCount; j++) {
            if (i === j) {
                continue
            }

            const otherObject = spriteList[j]

            if (otherObject === undefined) {
                continue
            }

            const dx = object.sprite.x - otherObject.sprite.x
            const dy = object.sprite.y - otherObject.sprite.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 15) {
                object.vx = Math.min(Math.abs(object.vx + dx / distance), SPRITE_VELOCITY)
                object.vy = Math.min(Math.abs(object.vy + dy / distance), SPRITE_VELOCITY)

                object.sprite.width = 10
                object.sprite.height = 10
            }
        }

        object.sprite.x += Math.min(object.vx, object.vx + delta)
        object.sprite.y += Math.min(object.vy, object.vy + delta)

        const VELOCITY_SLOWDOWN = 0.01

        // Return to original size over time
        if (Math.abs(object.sprite.width - 20) > 0.1) {
            object.sprite.rotation += 0.1
            object.sprite.width += 0.2
            object.sprite.height += 0.2
        }

        // Return to original velocity over time
        if (Math.abs(object.vx) > 0) {
            object.vx -= Math.sign(object.vx) * VELOCITY_SLOWDOWN

            if (Math.abs(object.vx) < 0.3) {
                object.vx = 0
            }
        } else {
            if (Math.abs(object.sprite.x - window.innerWidth / 2) < 20) {
                object.vx = 0

                continue
            }

            if (object.sprite.x > window.innerWidth / 2) {
                object.vx -= SPRITE_VELOCITY / 10
            } else {
                object.vx += SPRITE_VELOCITY / 10
            }
        }

        if (Math.abs(object.vy) > 0) {
            object.vy -= Math.sign(object.vy) * VELOCITY_SLOWDOWN

            if (Math.abs(object.vy) < 0.3) {
                object.vy = 0
            }
        }
        else {
            if (Math.abs(object.sprite.y - window.innerHeight / 2) < 20) {
                object.vy = 0

                continue
            }

            if (object.sprite.y > window.innerHeight / 2) {
                object.vy -= SPRITE_VELOCITY / 10
            } else {
                object.vy += SPRITE_VELOCITY / 10
            }
        }
    }
}

function loadBackgroundRendering() {
    console.log('Setting up PIXI')

    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resizeTo: window,
        antialias: true,
        backgroundColor: 0xFFFFFF,
    })

    const testElement = document.getElementById(BACKGROUND_ID)

    if (testElement === null) {
        return
    }

    const spriteList: RenderedSprite[] = []
    app.stage.filters = []

    const spriteTexture = PIXI.Texture.from('https://dev.citadel:3001/VisLablogo-cropped-notitle.svg')

    for (let i = 0; i < spriteCount; i++) {
        const sprite = new PIXI.Sprite(spriteTexture)
        spriteList.push({
            sprite: sprite,
            vx: (Math.random() - 1) * SPRITE_VELOCITY,
            vy: (Math.random() - 1) * SPRITE_VELOCITY
        })
        sprite.width = 20
        sprite.height = 20
        sprite.anchor.set(0.5)
        sprite.rotation = Math.random() * Math.PI * 2


        sprite.x = Math.random() * window.innerWidth
        sprite.y = Math.random() * window.innerHeight;
        app.stage.addChild(sprite)
    }

    app.ticker.add((delta) => {
        animationTicker(delta as number, spriteList)
    })

    // Clear children of test div
    testElement.innerHTML = ''

    document.getElementById(BACKGROUND_ID)?.appendChild(app.view)

    if (!clearBackgroundRendering) {
        window.addEventListener('beforeunload', () => {
            app.stage.filters.forEach((filter) => {
                filter.enabled = false
            })
            app.stage.removeChildren()
            app.destroy()

            for (let i = 0; i < spriteCount; i++) {
                const object = spriteList[i]
                if (object === undefined) {
                    continue
                }

                object.sprite.destroy()
            }

            console.log('PIXI destroyed!');

            clearBackgroundRendering = true
        })
    }
}

export default function UploadComponent() {
    const [url, setURL] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const [serverGraphData, setServerGraphData] = useState<ServerGraphData>({graphs: [], root: ''})

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


    useEffect(() => {
        loadBackgroundRendering()
    }, [])

    // Render the component.
    return render(loading, url, serverGraphData.graphs)
}
