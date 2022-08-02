
import React, { useContext, useState } from 'react'
import { Row, Col, Button, Container, ListGroup, InputGroup, Form } from 'react-bootstrap'

import './home.component.css'

import { UserDataContext } from '../components/main.component'

import { API } from '../services/api.service'

function renderUsers(userName: string, userList: string[]): JSX.Element {
    return (
        <ListGroup variant='flush'>
            <ListGroup.Item variant='primary'>
                {userName} (Me)
            </ListGroup.Item>
            {
                userList.filter((name) => {return name !== userName}).map((user) => {
                    return (
                        <ListGroup.Item>
                            {user}
                        </ListGroup.Item>
                    )
                })
            }
        </ListGroup>
    )
}

function renderSettings(
    userName: string,
    expirationDate: Date,
    graphURL: string,
    sid: string,
    newUserName: string,
    setNewUserName: React.Dispatch<React.SetStateAction<string>>) {

    return (
        <Container>
            <Row>
                <InputGroup>
                    <InputGroup.Text>Username</InputGroup.Text>
                    <Form.Control
                        placeholder={userName}
                        onChange={
                            (e) => {
                                setNewUserName(e.target.value)
                            }
                        }/>
                    <Button
                        variant="outline-primary"
                        id="button-update"
                        onClick={() => {API.updateUsername(newUserName)}}>
                        Update
                    </Button>
                </InputGroup>
            </Row>
            <Row>
                <InputGroup>
                    <InputGroup.Text>Session Expiration Date:</InputGroup.Text>
                    <Form.Control
                        value={expirationDate.toString()}/>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text>Session ID:</InputGroup.Text>
                    <Form.Control
                        value={sid}/>
                    <Button variant="outline-secondary" id="button-copy">
                        Copy
                    </Button>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Text>Original Graph URL:</InputGroup.Text>
                    <Form.Control
                        value={graphURL}/>
                    <Button variant="outline-secondary" id="button-copy">
                        Copy
                    </Button>
                </InputGroup>

            </Row>
            <Row className='justify-content-md-center'>
                <Col md={{span: 3}}>
                    <Button>
                        Download Graph
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

export default function SessionTab() {
    const { state } = useContext(UserDataContext)

    const [newUserName, setNewUserName] = useState('')

    if (!state) {
        return (
            <></>
        )
    }

    return (
        <Container>
            <Row>
                <h3>Users</h3>
                {renderUsers(state.userName, state.users)}
            </Row>
            <Row>
                <h3>Settings</h3>
                {renderSettings(state.userName, state.expirationDate, state.graphURL, state.sid, newUserName, setNewUserName)}
            </Row>
        </Container>
    )
}
