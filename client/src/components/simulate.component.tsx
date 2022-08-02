import React, { useState, useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import { Tabs, Tab, Container, Row, Col, Button, Card, ListGroup, ButtonGroup, ToggleButton, Spinner } from 'react-bootstrap'
import { userService } from '../services/user.service';

import { API } from '../services/api.service'
import './home.component.css'

export interface Simulator {
    id: string,
    generating: boolean,
    options: { [key: string]: string },
}

interface SimulatorTabProps {
    simulators: Simulator[]
}

function renderOrderButtons(order: number, simulatorCount: number): JSX.Element {
    let jsx: JSX.Element[] = []

    if (simulatorCount === 1) {
        return <>
        <Col sm={4}>{jsx}</Col>
        </>
    }

    if (order !== 0) {
        jsx.push(
            <Button variant='outline-primary'>
                Up
            </Button>
        )
    }

    if (order !== simulatorCount - 1) {
        jsx.push(
            <Button variant='outline-primary'>
                Down
            </Button>
        )
    }

    return <>
    <Col sm={4}>
        {jsx}
    </Col></>
}

function renderSimulator(simulator: Simulator, order: number, simulatorCount: number): JSX.Element {
    return (
        <Row>
            {renderOrderButtons(order, simulatorCount)}
            <Col md={{
                span: 8,
            }}>
                <Card bg='light'>
                    <Card.Header>
                        <Row>
                            <Col sm={10}>
                                {simulator.id}
                            </Col>
                            <Col sm={2}>
                                {simulator.generating &&
                                    <Spinner animation="border" role="status"></Spinner>
                                }
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Text>
                    <ListGroup variant='flush'>
                    <ListGroup.Item >
                        IP address: XYZ
                    </ListGroup.Item>
                    <ListGroup.Item>
                        Updates: 23
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col sm={4}>
                                <ButtonGroup>
                                    <ToggleButton
                                        key={0}
                                        id='sim-on'
                                        type='radio'
                                        checked={true}
                                        value={'enable'}
                                        variant='outline-success'
                                        >
                                        On
                                    </ToggleButton>
                                    <ToggleButton
                                        key={0}
                                        id='sim-off'
                                        type='radio'
                                        checked={false}
                                        value={'disable'}
                                        variant='outline-danger'
                                        >
                                        Off
                                    </ToggleButton>
                                </ButtonGroup>
                            </Col>
                            <Col sm={4}>
                                    <Button>
                                        Edit
                                    </Button>
                                </Col>
                            {order === simulatorCount - 1 &&
                                <Col sm={4}>
                                    <Button variant={simulator.generating ? 'outline-danger' : 'outline-success'}>
                                        {simulator.generating ? 'Stop' : 'Start'}
                                    </Button>
                                </Col>
                            }
                        </Row>
                    </ListGroup.Item>
                    </ListGroup>
                    </Card.Text>
                </Card>
            </Col>
        </Row>
    )
}

export function SimulatorTab(
    props: SimulatorTabProps) {

    return <Container fluid>
        <Row >
            <Col md={{
                span: 8,
                offset: 4
                }}>
                <Card bg='secondary' text='white'>
                    <Card.Header>Server</Card.Header>
                    <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                    </Card.Text>
                </Card>
            </Col>
        </Row>
        {props.simulators.map((simulator, index) => {
            return renderSimulator(simulator, index, props.simulators.length)
        })}
        <Row>
            <Col sm={2}>
                <Button variant='outline-success'>
                    Add
                </Button>
            </Col>
        </Row>
        <Row>
            <Button onClick={() => {API.step()}}>
                Step
            </Button>
        </Row>
    </Container>
}
