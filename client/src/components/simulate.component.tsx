/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 * This file contains the simulate component, which allows for connections of
 * API simulations to the session.
 */

import React, { useState, useEffect, useContext, useRef } from 'react'
import { Container, Row, Col, Button, ListGroup, Dropdown, ProgressBar,
    Form, CloseButton, InputGroup } from 'react-bootstrap'
    import { GrPlay, GrPause } from 'react-icons/gr'

import { UserDataContext } from '../components/main.component'
import { API } from '../services/api.service'
import './home.component.css'
import { SimulatorParam } from '../reducers/sessiondata.reducer'
import { Router } from './router.component'

// Renders sim item in simulator list.
function renderSimItem(param: SimulatorParam, index: number, key: string, params: SimulatorParam[]) {
    let inputField = <></>

    switch (param.type) {
        case 'boolean':
            // Booleans are rendered as a dropdown menu.
            inputField = (
                <Dropdown onSelect={(item) => {
                    Router.setSimulatorSettings(key, params.map((paramIter) => {
                        if (paramIter.attribute === param.attribute) {
                            paramIter.value = item === 'true'
                        }

                        return paramIter
                    }))
                }}>
                    <Dropdown.Toggle>{param.value === true ? 'True' : 'False'}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item key='true' eventKey={'true'} active={param.value}>True</Dropdown.Item>
                        <Dropdown.Item key='false' eventKey={'false'} active={!param.value}>False</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
            break
        case 'integer':
            // Integers are rendered as a number input field.
            inputField = (
                <Form.Control
                    type='number'
                    value={param.value}
                    onChange={(e) => {
                        let num = Number(e.target.value)

                        if (!Number.isInteger(num)) {
                            return
                        }

                        Router.setSimulatorSettings(key, params.map((paramIter) => {
                            if (paramIter.attribute === param.attribute) {
                                paramIter.value = num
                            }

                            return paramIter
                        }))
                    }}
                >

                </Form.Control>
            )
            break
        case 'float':
            // Floats are rendered as a number input field.
            inputField = (
                <Form.Control
                    type='number'
                    step={0.1}
                    value={param.value}
                    onChange={(e) => {
                        let num = parseFloat(e.target.value)

                        if (isNaN(num)) {
                            return
                        }

                        Router.setSimulatorSettings(key, params.map((paramIter) => {
                            if (paramIter.attribute === param.attribute) {
                                paramIter.value = num
                            }

                            return paramIter
                        }))
                    }}
                >

                </Form.Control>
            )
            break
        case 'string':
            // Strings are rendered as a text input field.
            inputField = (
                <Form.Control
                    type='string'
                    value={param.value}
                    onChange={(e) => {
                        if (e.target.value === '') {
                            return
                        }

                        Router.setSimulatorSettings(key, params.map((paramIter) => {
                            if (paramIter.attribute === param.attribute) {
                                paramIter.value = e.target.value
                            }

                            return paramIter
                        }))
                    }}
                >

                </Form.Control>
            )
            break

        default:
            break
    }

    return (
        <ListGroup.Item key={index}>
            <Container fluid>

                <Row>
                    <Col>
                        {param.attribute}
                    </Col>
                    <Col>
                        {param.type}
                    </Col>
                    <Col>
                        {inputField}
                    </Col>
                    <Col>
                        {param.value !== param.defaultValue &&
                            <Button variant='primary' onClick={() => {
                                Router.setSimulatorSettings(key, params.map((paramIter) => {
                                    if (paramIter.attribute === param.attribute) {
                                        paramIter.value = paramIter.defaultValue
                                    }

                                    return paramIter
                                }))
                            }}>Reset</Button>
                        }
                    </Col>
                </Row>
            </Container>
        </ListGroup.Item>
    )
}

// Renders the simulator settings.
function renderSimulatorSettings(key: string, params: SimulatorParam[],
    setSimOptionsSelection: React.Dispatch<React.SetStateAction<string | null>>) {

    const closeButton = (
            <Row>
                <Col md={{span: 2}}>
                    <CloseButton onClick={()=>{setSimOptionsSelection(null)}}>

                    </CloseButton>
                </Col>
            </Row>
    )

    const simList = (
        <ListGroup>
                {params.map((param, index) => {
                    return renderSimItem(param, index, key, params)
                })}
            </ListGroup>
    )

    return (
        <>
            {closeButton}
            {simList}
        </>
    )
}

function renderValidateButton(simKey: string | null, validated: 'valid' | 'unknown' | 'invalid') {
    if (validated === 'valid') {
        return (
            <Button variant='success' disabled>Valid</Button>
        )
    }

    if (validated === 'invalid') {
        return (
            <Button variant='error' disabled>Invalid</Button>
        )
    }

    <Button variant='outline-primary' onClick={() => {
        if ((simKey) !== null && simKey !== '') {
            API.validate(simKey)
        }
    }}>Validate</Button>
}

// Renders the simulator options and list.
export function SimulatorTab() {
    const { state,  } = useContext(UserDataContext)

    const [ selectedSim, setSelectedSim ] = useState('')
    const [ simOptionsSelection, setSimOptionsSelection ] = useState<string | null>(null)
    const [ stepCount, setStepCount ] = useState(1)

    const textRef = useRef(null)
    const sessionRef = useRef(null)

    let simulators = state?.simulators

    useEffect(() => {
        if (simOptionsSelection === null || simulators === undefined) {
            return
        }

        // If the selected simulator is not generating or idle, then reset the selection.
        if (simulators.filter((sim) => {
            return (sim.key === simOptionsSelection && (sim.state === 'generating' || sim.state === 'idle'))
        }).length === 0) {
            setSimOptionsSelection(null)
        }
    }, [simOptionsSelection, simulators])

    if (!state) {
        return <></>
    }

    // Renders the simulator list.
    const sims = state?.simulators.map((sim, index) => {
        let buttonVariant = 'outline-secondary'

        if (sim.state === 'generating') {
            buttonVariant = 'outline-primary'
        } else if (sim.state === 'disconnected') {
            buttonVariant = 'outline-danger'
        }

        return (
            <ListGroup.Item key={index}>
                <Container fluid>
                    <Row >
                        <Col md={{span: 1}}>
                            { sim.key !== null &&
                                <Form.Check
                                    checked={selectedSim === sim.key}
                                    type='radio'
                                    onChange={(() => {
                                        if (sim.key === null)
                                            return

                                        setSelectedSim(sim.key)
                                })}></Form.Check>
                            }
                        </Col>
                        <Col md={{span: 2}}>
                            {((sim.username !== null && sim.username !== '') || !sim.validator) ? sim.username : (

                                    renderValidateButton(sim.key, sim.valid)
                            )}
                        </Col>
                        <Col md={{span: 2}}>
                            {sim.key}
                        </Col>
                        <Col md={{span: 2}}>
                            {sim.title}
                        </Col>
                        <Col md={{span: 1}}>
                            {
                                sim.options.length > 0 &&

                                <Button onClick={()=> {setSimOptionsSelection(sim.key)}}>Options</Button>
                            }
                        </Col>
                        <Col md={{span: 2, offset: 1}}><Button disabled variant={buttonVariant}>{sim.state}</Button></Col>

                    </Row>
                </Container>
            </ListGroup.Item>
        )
    })

    // Flag for if the simulator is unavailable.
    const disabled = selectedSim === '' || state.state !== 'idle' || state.simulators.filter((sim) => {
        return sim.key === selectedSim && sim.state !== 'idle'
    }).length > 0

    // Renders the simulator controls.
    const simulatorControl = state.graphIndexCount > 1 ? (
        <Row>
            <Col md={{span: 4}}>
                <Row>
                    <Col>
                        <Button onClick={() => {
                            API.setGraphIndex(0)
                        }}>First</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => {
                            API.setGraphIndex(state.graphIndex - 1)
                        }}>Previous</Button>
                    </Col>
                </Row>
            </Col>
            <Col md={{span: 4}}>
                <Row>
                    <Col md={{span: 8}}>
                        <Form.Control
                            type='number'
                            value={state.graphIndex + 1}
                            onChange={(e) => {
                                if (parseInt(e.target.value) > 0 && parseInt(e.target.value) < 1000)
                                    API.setGraphIndex(parseInt(e.target.value) - 1)
                            }}></Form.Control>
                    </Col>
                    <Col md={{span: 4}}>
                        / {state.graphIndexCount}
                    </Col>
                </Row>
            </Col>
            <Col md={{span: 4}}>
                <Row>
                    <Col>
                        <Button onClick={() => {
                            API.setGraphIndex(state.graphIndex + 1)
                        }}>Next</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => {
                            API.setGraphIndex(state.graphIndexCount - 1)
                        }}>Last</Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    ) : <></>

    var playbutton = (<></>)

    // Renders the play/pause button.
    if (state.playmode) {
        playbutton = (
            <Col>
                <Button onClick={() => {
                    API.pause()
                }}>
                    <GrPause></GrPause>
                </Button>
            </Col>
        )
    }

    if (!state.playmode && state.graphIndexCount > 1) {
        playbutton = (
            <Col>
                <Button onClick={() => {
                    API.play()
                }}
                disabled={disabled}>
                    <GrPlay></GrPlay>
                </Button>
            </Col>
        )
    }

    // If simulating render a stop button, otherwise play button
    const simButton = state.state === 'simulating' ? (
        <Col>
            <Button
                variant='danger'
                // disabled={disabled}
                onClick={() => {
                    API.stop()
                }}>
                Stop
            </Button>
        </Col>
    ) : (
        <Col>
            <Button
                disabled={disabled}
                onClick={() => {
                    if (!disabled)
                        API.step(stepCount, selectedSim, state.simulators.filter((sim) => {return sim.key === selectedSim})[0].options)
                }}>
                Step
            </Button>
        </Col>
    )

    const res = simOptionsSelection === null ? (
        <Container fluid style={{
            paddingBottom: '10px',
            paddingTop: '10px',
        }}>
            <Row>
                <h3>Simulate</h3>
            </Row>
            <Row>
                <Col md={{span: 12}}>
                    <InputGroup>
                        <InputGroup.Text>Simulator URL:</InputGroup.Text>
                        <Form.Control
                            readOnly
                            value={state.sessionURL} ref={sessionRef}/>
                        <Button variant="outline-secondary"
                            id="button-copy"
                            onClick={() => {
                                if (window.isSecureContext && navigator.clipboard) {
                                    navigator.clipboard.writeText(state.sessionURL)
                                } else {
                                    // @ts-ignore
                                    sessionRef.current.select()

                                    document.execCommand('copy')
                                }
                            }}>
                            Copy
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row style={{
                marginBottom: '10px',
            }}>
                <Col md={{span: 6}}>
                    <InputGroup>
                        <InputGroup.Text>Simulator port:</InputGroup.Text>
                        <Form.Control
                            readOnly
                            value={state.websocketPort} ref={textRef}/>
                        <Button variant="outline-secondary"
                            id="button-copy"
                            onClick={() => {
                                if (window.isSecureContext && navigator.clipboard) {
                                    navigator.clipboard.writeText(state.websocketPort)
                                } else {
                                    // @ts-ignore
                                    textRef.current.select()

                                    document.execCommand('copy')
                                }
                            }}>
                            Copy
                        </Button>
                    </InputGroup>
                </Col>
            </Row>
            <Row style={{
                marginBottom: '10px',
            }}>
                <Col>
                    <ListGroup>
                        <div style={{

                            overflowY: 'auto',
                            height: '200px',
                        }}>
                            {sims}
                        </div>
                        <ListGroup.Item>
                                <Container fluid>
                                    <Row>
                                        <Col md={{
                                            span: 3,
                                            offset: 9
                                        }}>
                                            <Button onClick={() => {API.addSim()}}
                                                variant='outline-success'>
                                                Add
                                            </Button>
                                        </Col>
                                    </Row>
                                </Container>
                            </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
            <Row>
                {playbutton}
                <Col md={{span: 2}}>
                    <Form.Control
                        type='number'
                        value={stepCount}
                        onChange={(e) => {
                            if (parseInt(e.target.value) > 0 && parseInt(e.target.value) < 1000)
                                setStepCount(parseInt(e.target.value))
                        }}></Form.Control>
                </Col>
                    {simButton}
                <Col>
                        {state.simState.stepMax > 0 &&
                            <ProgressBar animated now={state.simState.step / state.simState.stepMax * 100}></ProgressBar>
                        }
                </Col>
            </Row>
            {simulatorControl}
        </Container>
    ) : renderSimulatorSettings(simOptionsSelection,
            state.simulators.filter((sim) => {return sim.key === simOptionsSelection})[0].options,
            setSimOptionsSelection)

    return res
}
