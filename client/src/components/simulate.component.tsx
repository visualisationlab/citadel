import React, { useState, useReducer } from 'react'
import { useHistory } from 'react-router-dom'
import { Tabs, Tab, Container, Row, Col, Button, Card, ListGroup, ButtonGroup, ToggleButton, Spinner } from 'react-bootstrap'
import { userService } from '../services/user.service';

import { API } from '../services/api.service'
import './home.component.css'

import { Simulator } from '../reducers/sessiondata.reducer'

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
        <Row>
            <Col sm={2}>
                <Button variant='outline-success'>
                    Add
                </Button>
            </Col>
        </Row>
        <Row>
            <Button onClick={() => {API.step(1)}}>
                Step
            </Button>
        </Row>
    </Container>
}
