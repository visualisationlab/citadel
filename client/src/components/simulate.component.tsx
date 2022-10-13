import React, { useState, useEffect, useContext, useRef } from 'react'
import { Tabs, Tab, Container, Row, Col, Button, Card, ListGroup, Dropdown, ToggleButton, ProgressBar, Spinner, Form, CloseButton, InputGroup } from 'react-bootstrap'
import { userService } from '../services/user.service';
import { UserDataContext } from '../components/main.component'

import { API } from '../services/api.service'
import './home.component.css'

import { Simulator, SimulatorParam } from '../reducers/sessiondata.reducer'

import { Router } from './router.component'

import { GrPlay, GrPause } from 'react-icons/gr'

function renderSimulatorSettings(key: string, params: SimulatorParam[], setSimOptionsSelection: React.Dispatch<React.SetStateAction<string | null>>) {
    return (
        <>
            <Row>
                <Col md={{span: 2}}>
                    <CloseButton onClick={()=>{setSimOptionsSelection(null)}}>

                    </CloseButton>
                </Col>
            </Row>

            <ListGroup>
                {params.map((param, index) => {
                    let inputField = <></>

                    switch (param.type) {
                        case 'boolean':
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

                    }

                    return (
                        <ListGroup.Item key={index}>
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
                        </ListGroup.Item>
                    )
                })}
            </ListGroup>
        </>
    )
}

export function SimulatorTab() {
    const { state,  } = useContext(UserDataContext)

    const [ selectedSim, setSelectedSim ] = useState('')
    const [ simOptionsSelection, setSimOptionsSelection ] = useState<string | null>(null)
    const [ stepCount, setStepCount ] = useState(1)

    const textRef = useRef(null)
    const sessionRef = useRef(null)

    useEffect(() => {
        if (simOptionsSelection === null) {
            return
        }

        if (state?.simulators.filter((sim) => {
            return (sim.key === simOptionsSelection && (sim.state === 'generating' || sim.state === 'idle'))
        }).length === 0) {
            setSimOptionsSelection(null)
        }
    }, [simOptionsSelection, state?.simulators])

    if (!state) {
        return <></>
    }

    const sims = state?.simulators.map((sim, index) => {
        let buttonVariant = 'outline-secondary'

        if (sim.state === 'generating') {
            buttonVariant = 'outline-primary'
        } else if (sim.state === 'disconnected') {
            buttonVariant = 'outline-danger'
        }

        return (
            <ListGroup.Item key={index}>
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
                        {sim.username}
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
            </ListGroup.Item>
        )
    })
    const disabled = stepCount <= 0 || selectedSim === '' || state.state !== 'idle'

    const simulatorControl = state.graphIndexCount > 1 ? (
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
            <Col>
                {state.graphIndex + 1} / {state.graphIndexCount}
            </Col>
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
    ) : <></>

    var playbutton = (<></>)

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

    const res = simOptionsSelection === null ? (
        <>
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
                                            navigator.clipboard.writeText(state.websocketPort)
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
                <Row>

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
            <Row>
                <ListGroup>
                    {sims}
                    <ListGroup.Item>
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
                        </ListGroup.Item>
                </ListGroup>
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
                <Col>
                        {state.simState.stepMax > 0 &&
                            <ProgressBar animated now={state.simState.step / state.simState.stepMax * 100}></ProgressBar>
                        }
                </Col>
            </Row>
            {simulatorControl}
        </>
    ) : renderSimulatorSettings(simOptionsSelection, state.simulators.filter((sim) => {return sim.key === simOptionsSelection})[0].options, setSimOptionsSelection)

    return (
        <Container fluid>
                {res}
        </Container>
    )
}
