
import React, { useContext, useReducer, useEffect, Dispatch } from 'react'
import { Accordion, Row, Col, Dropdown, Form, ListGroup, OverlayTrigger, Button, Card, Tooltip, ButtonGroup, DropdownButton, Container, Spinner } from 'react-bootstrap'

import { UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { GraphDataReducerAction, GraphDataState, NodeMapping, EdgeMapping } from '../reducers/graphdata.reducer'
import { LayoutInfo, ServerState } from '../reducers/sessiondata.reducer'

import { LayoutSettingsReducer, LayoutSettingsState, LayoutSettingsReducerAction } from '../reducers/layoutsettings.reducer'

import { BsInfoCircle } from 'react-icons/bs'

import { API } from '../services/api.service'

import './home.component.css'

type InfoCard = {
    img: string,
    title: string,
    description: string
}

const nodeMappingTitles: { [key in NodeMapping]: InfoCard} = {
    'colour': {img: 'colourImg', title: 'Fill Colour', description: 'Maps a node attribute to its colour.'},
    'radius': {img: 'radiusImg', title: 'Radius', description: 'Maps a node attribute to its radius.'},
    'alpha': {img: 'alphaImg', title: 'Alpha', description: 'Maps a node attribute to its alpha channel (transparency).'},
    'shape': {img: 'colourImg', title: 'Shape', description: 'Maps a node attribute to its shape.'},
}

const edgeMappingTitles: { [key in EdgeMapping]: string} = {
    'colour': 'Colour',
    'alpha': 'Alpha',
    'width': 'Width'
}

function nodeMapping(graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
    const content = Object.entries(nodeMappingTitles).map(([key, value], index) => {
            const title = graphState.nodes.mapping.generators[key as NodeMapping].attribute

            return (
                <Col md={{span: 6}}>
                    <Card border={title !== '' ? 'primary' : ''}>
                        {/* <Card.Img variant="top" src="" /> */}
                        <Card.Header>{value.title}</Card.Header>
                        <Card.Body>
                            {/* <Card.Title>{value.title}</Card.Title> */}
                            <Card.Text>
                            {value.description}
                            </Card.Text>
                        </Card.Body>
                        <ListGroup className="list-group-flush">
                            <ListGroup.Item>
                                <ButtonGroup>
                                    <Button>Settings</Button>
                                    <DropdownButton as={ButtonGroup} title={title === '' ? 'none' : title} onSelect={(item) => {
                                    if (item === null) {
                                        return
                                    }

                                    dispatch({
                                        type: 'set',
                                        property: 'mapping',
                                        object: 'node',
                                        map: key as NodeMapping,
                                        fun: 'linearmap',
                                        key: item
                                    })
                                    }}>
                                        <Dropdown.Item eventKey={''}>none</Dropdown.Item>
                                        {Object.keys(graphState.nodes.data[0]?.attributes).map((attribute) => {
                                            return (
                                                <Dropdown.Item key={attribute} eventKey={attribute}>{attribute}</Dropdown.Item>
                                            )
                                        })}

                                    </DropdownButton>
                                </ButtonGroup>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            )
        })

    let rows = []

    for (let i = 0; i < content.length; i+=2) {
        rows.push(
            <Row>
                {content[i]}
                {content[i+1]}
            </Row>
        )
    }

    return (
        <Accordion.Item eventKey='nodemap'>
            <Accordion.Header>Node Mapping</Accordion.Header>
            <Accordion.Body style={{
                overflowY: 'scroll',
                height: '400px'
            }}>
                <Container>
                    {rows}
                </Container>
            </Accordion.Body>
        </Accordion.Item>
    )
}

function edgeMapping(graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
    if (graphState.edges.data.length === 0) {
        return <></>
    }
    return (
        <Accordion.Item eventKey='edgemap'>
            <Accordion.Header>Edge Mapping</Accordion.Header>
            <Accordion.Body>
                <Row>
                {Object.entries(edgeMappingTitles).map(([key, value]) => {
                    const title = graphState.edges.mapping.generators[key as EdgeMapping].attribute

                    return (
                        <Col md={{span: 3}}>
                            <Row>
                                <p>
                                    {value}
                                </p>
                            </Row>
                            <Row>
                                <Dropdown onSelect={(item) => {
                                    if (item === null) {
                                        return
                                    }

                                    dispatch({
                                        type: 'set',
                                        property: 'mapping',
                                        object: 'edge',
                                        map: key as EdgeMapping,
                                        fun: 'linearmap',
                                        key: item
                                    })
                                    }}>
                                <Dropdown.Toggle>
                                    {title === '' ? 'none' : title}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey={''}>none</Dropdown.Item>
                                    {Object.keys(graphState.edges.data[0]?.attributes).map((attribute) => {
                                        return (
                                            <Dropdown.Item key={attribute + 'abc'} eventKey={attribute}>{attribute}</Dropdown.Item>
                                        )
                                    })}
                                </Dropdown.Menu>
                                </Dropdown>
                            </Row>
                        </Col>
                    )
                })}
                </Row>
            </Accordion.Body>
        </Accordion.Item>
    )
}

function layoutMapping(layouts: string[], layoutInfo: LayoutSettingsState,
    layoutSettingsDispatch: React.Dispatch<LayoutSettingsReducerAction>,
    serverState: ServerState) {

    if (serverState === 'disconnected' || serverState === 'busy') {
        return <Spinner animation="border"></Spinner>
    }

    const selectedLayout = layoutInfo?.layouts.filter((layout) => {
        return (layout.name === layoutInfo.selectedLayout)
    })

    if (selectedLayout === undefined || selectedLayout.length === 0) {
        return (
            <Accordion.Item eventKey='layoutmap'>
                <Accordion.Header>Layout Mapping</Accordion.Header>
                <Accordion.Body>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <Row>
                                <Col md={{span: 4}}>
                                    <p>
                                        Layout Algorithm:
                                    </p>
                                </Col>
                                <Col md={{span: 4}}>
                                    <Dropdown onSelect={(item) => {
                                        if (item === null) {
                                            return
                                        }

                                        layoutSettingsDispatch({
                                            attribute: 'selectedLayout',
                                            value: item
                                        })
                                    }}>
                                        <Dropdown.Toggle>
                                            {layoutInfo?.selectedLayout === '' ? 'none' : layoutInfo?.selectedLayout}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item key='None' eventKey={''}>none</Dropdown.Item>
                                            {layouts.map((layout) => {
                                                return <Dropdown.Item key={layout} eventKey={layout}>{layout}</Dropdown.Item>
                                            })}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>
        )
    }

    let res = selectedLayout[0]

    return (
        <Accordion.Item eventKey='layoutmap'>
            <Accordion.Header>Layout Mapping</Accordion.Header>
            <Accordion.Body>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <Row>
                            <Col md={{span: 4}}>
                                <p>
                                    Layout Algorithm:
                                </p>
                            </Col>
                            <Col md={{span: 4}}>
                                <Dropdown onSelect={(item) => {
                                    if (item === null) {
                                        return
                                    }

                                    layoutSettingsDispatch({
                                        attribute: 'selectedLayout',
                                        value: item
                                    })
                                }}>
                                    <Dropdown.Toggle>
                                        {layoutInfo?.selectedLayout === '' ? 'none' : layoutInfo?.selectedLayout}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item key='None' eventKey={''}>none</Dropdown.Item>
                                        {layouts.map((layout) => {
                                            return <Dropdown.Item key={layout} eventKey={layout}>{layout}</Dropdown.Item>
                                        })}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                            <Col md={{span: 4}}>
                                <OverlayTrigger
                                    key={'title'}
                                    placement={'top'}
                                    overlay={
                                        <Tooltip id={`tooltip-title`}>
                                            {res.description}
                                        </Tooltip>
                                    }
                                >
                                    <Button variant='outline-secondary'>Info</Button>
                                </OverlayTrigger>
                            </Col>
                        </Row>
                        {res.settings.map((setting) => {
                            return (
                                <Row>
                                    <Col>
                                        <p>{setting.name}</p>
                                    </Col>
                                    <Col>
                                        {
                                            setting.type === 'number' &&
                                            <Form.Control
                                            type='number'
                                            onChange={
                                                (e) => {
                                                    layoutSettingsDispatch({
                                                        attribute: 'property',
                                                        key: setting.name,
                                                        value: parseFloat(e.target.value)
                                                    })
                                                }
                                            }
                                            value={setting.value}
                                            defaultValue={setting.defaultValue}
                                            placeholder={setting.defaultValue.toString()}>

                                            </Form.Control>
                                        }
                                        {
                                            setting.type === 'boolean' &&
                                            <Dropdown onSelect={(item) => {
                                                if (item === null) {
                                                    return
                                                }

                                                layoutSettingsDispatch({
                                                    attribute: 'property',
                                                    key: setting.name,
                                                    value: item === 'true'
                                                })
                                                }}>
                                                <Dropdown.Toggle>
                                                    {setting.value ? 'true' : 'false'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item key='True' eventKey={'true'}>true</Dropdown.Item>
                                                    <Dropdown.Item key='False' eventKey={'false'}>false</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        }
                                    </Col>
                                </Row>
                            )
                        })}
                        <Row>
                            <Col md={{offset: 8, span: 4}}>
                                <Button variant='outline-primary'
                                    onClick={() => {
                                        API.setLayout(res)
                                    }}>Apply</Button>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
            </Accordion.Body>
        </Accordion.Item>
    )
}

export default function MappingTab() {
    const { state } = useContext(UserDataContext)
    const { graphState, graphDispatch } = useContext(GraphDataContext)

    const [ layoutSettingsState, layoutSettingsReducer ] = useReducer(LayoutSettingsReducer, null)

    useEffect(() => {
        if (state?.layouts === undefined) {
            return
        }

        layoutSettingsReducer({
            attribute: 'layouts',
            value: state.layouts
        })

    }, [state?.layouts])

    if (state === null || graphState == null || graphDispatch == null) {
        console.log('Something is null!')
        return <></>
    }

    if (state.layouts.length === 0) {
        API.getLayouts()

        return <></>
    }

    return (
        <Accordion defaultActiveKey='nodemap' alwaysOpen>
            {nodeMapping(graphState, graphDispatch)}
            {edgeMapping(graphState, graphDispatch)}
            {layoutMapping(
                state.layouts.map((layout) => {return layout.name}),
                layoutSettingsState,
                layoutSettingsReducer,
                state.state)}
        </Accordion>
    )
}
