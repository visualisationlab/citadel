
import React, { useContext, useReducer, useEffect, Dispatch, useState, useRef } from 'react'
import {
    Accordion,
    Row,
    Col,
    Dropdown,
    Form,
    ListGroup,
    OverlayTrigger,
    Button,
    Card,
    Tooltip,
    ButtonGroup,
    DropdownButton,
    Container,
    CloseButton,
    Spinner } from 'react-bootstrap'

import tinycolor from 'tinycolor2'

import { UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { GraphDataReducerAction, GraphDataState, NodeMapping, EdgeMapping } from '../reducers/graphdata.reducer'
import { LayoutInfo, ServerState } from '../reducers/sessiondata.reducer'

import { LayoutSettingsReducer, LayoutSettingsState, LayoutSettingsReducerAction } from '../reducers/layoutsettings.reducer'

import { BsInfoCircle } from 'react-icons/bs'
import { BiCog } from 'react-icons/bi'

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

const edgeMappingTitles: { [key in EdgeMapping]: InfoCard} = {
    'colour': {img: 'colourImg', title: 'Fill Colour', description: 'Maps an edge attribute to its colour.'},
    'alpha': {img: 'alphaImg', title: 'Alpha', description: 'Maps an edge attribute to its transparency.'},
    'width': {img: 'widthImg', title: 'Width', description: 'Maps an edge attribute to its width.'},
}

function NodeMappingWindow(nodeSettings: string, setNodeSettingState: React.Dispatch<React.SetStateAction<string>>, graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
    const rows = Object.entries(nodeMappingTitles).map(([key, value], index) => {
            const title = graphState.nodes.mapping.generators[key as NodeMapping].attribute

            return (
                <ListGroup.Item variant={title !== '' ? 'outline-primary' : ''}>
                    <Row>
                        <Col md={{span: 2}}>
                            {value.title}
                        </Col>
                        <Col md={{span: 4}}>
                            {value.description}
                        </Col>
                        <Col md={{span: 6}}>
                            <ListGroup className="list-group-flush">
                                <ListGroup.Item>
                                    <ButtonGroup>

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
                                        <Button onClick={() => setNodeSettingState(key)}><BiCog></BiCog></Button>
                                    </ButtonGroup>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>
                </ListGroup.Item>
            )
        })

    return (
        <Accordion.Item eventKey='nodemap'>
            <Accordion.Header>Node Mapping</Accordion.Header>
            <Accordion.Body style={{
                overflowY: 'scroll',
                height: '400px'
            }}>
                <Container>
                    { nodeSettings !== '' &&
                        SettingsComponent(nodeSettings, setNodeSettingState, graphState, dispatch)}
                    { nodeSettings === '' &&

                    <ListGroup>
                        {rows}
                    </ListGroup>}
                </Container>
            </Accordion.Body>
        </Accordion.Item>
    )
}

function edgeMapping(graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
    if (graphState.edges.data.length === 0) {
        return <></>
    }

    const rows = Object.entries(edgeMappingTitles).map(([key, value], index) => {
        const title = graphState.edges.mapping.generators[key as EdgeMapping].attribute

        return (
            <ListGroup.Item variant={title !== '' ? 'outline-primary' : ''}>
                <Row>
                    <Col md={{span: 2}}>
                        {value.title}
                    </Col>
                    <Col md={{span: 4}}>
                        {value.description}
                    </Col>
                    <Col md={{span: 4}}>
                        <ListGroup className="list-group-flush">
                            <ListGroup.Item>
                                <ButtonGroup>
                                    {/* <Button>Settings</Button> */}
                                    <DropdownButton as={ButtonGroup} title={title === '' ? 'none' : title} onSelect={(item) => {
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
                                        <Dropdown.Item eventKey={''}>none</Dropdown.Item>
                                        {Object.keys(graphState.edges.data[0]?.attributes).map((attribute) => {
                                            return (
                                                <Dropdown.Item key={attribute} eventKey={attribute}>{attribute}</Dropdown.Item>
                                            )
                                        })}

                                    </DropdownButton>
                                </ButtonGroup>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>
            </ListGroup.Item>
        )
    })

    return (
        <Accordion.Item eventKey='edgemap'>
            <Accordion.Header>Edge Mapping</Accordion.Header>
            <Accordion.Body style={{
                overflowY: 'scroll',
                height: '300px'
            }}>
                <Container>
                    <ListGroup>
                        {rows}
                        {/* {settingsBorder([])} */}
                    </ListGroup>
                </Container>
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

function ColourSettingsComponent(props: {graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>, objectType: 'node' | 'edge'}): JSX.Element {
    let colours = props.objectType === 'node' ? props.graphState.nodes.mapping.settings.colours : props.graphState.edges.mapping.settings.colours

    const [colourState, setColourState] = useState(colours)
    const sessionRef = useRef(null)

    useEffect(() => {
        if (props.objectType === 'node')
            setColourState(props.graphState.nodes.mapping.settings.colours)
        else
            setColourState(props.graphState.edges.mapping.settings.colours)
    }, [props.graphState.nodes.mapping.settings.colours, props.graphState.edges.mapping.settings.colours, props.objectType])

    let colourRows = colourState.map((colour, index) => {
        let val = '#' + colour.map(function (x) {return (x * 255).toString(16).padStart(2, '0')}).join('')

        return (
            <Row>
                <Col md={{span: 2}}>
                    <input type="color" onChange={(val) => {
                        let newColours = [...colourState]
                        newColours[index] = [tinycolor(val.target.value).toRgb().r / 255, tinycolor(val.target.value).toRgb().g / 255, tinycolor(val.target.value).toRgb().b / 255]
                        setColourState(newColours)
                    }} value={val}></input>
                </Col>
                {index > 0 &&
                    <Col md={{span: 2}}>
                        <Button variant='outline-danger' onClick={() => {
                            let newColours = [...colourState]
                            newColours.splice(index, 1)
                            setColourState(newColours)
                        }
                        }>Remove</Button>
                    </Col>
                }
            </Row>
        )
    })

    return (<>
        {colourRows}
        <Row>
            <Col>
                <Button variant='outline-primary'
                    onClick={() => {
                        if (props.objectType === 'node') {
                            let newColours = [...colourState]
                            newColours.push([1.0, 0.0, 0.0])
                            setColourState(newColours)
                        }
                    }
                }>Add Colour</Button>
            </Col>
        </Row>
        <Row>
            <Col>
                <Button variant='outline-primary'
                    onClick={() => {
                        if (props.objectType === 'node') {
                            if (window.isSecureContext && navigator.clipboard) {
                                navigator.clipboard.writeText(colourState.toString())
                            } else {
                                // @ts-ignore
                                sessionRef.current.select()

                                document.execCommand('copy')
                            }
                        }
                    }
                }>Copy Colours</Button>
            </Col>
            <Col md={{offset: 4, span: 4}}>
                <Button variant='outline-primary'
                    onClick={() => {
                        props.dispatch({
                            type: 'updateSetting',
                            object: 'node',
                            attribute: 'colours',
                            value: colourState
                        })
                    }
                }>Apply</Button>
            </Col>
        </Row>
        <Row>
            <input type='text' ref={sessionRef} value={'[' + colourState.map((x) => {
               return '[' + (x.map((n) => {return n.toFixed(2)}).toString()) + ']'
            }) + ']'}></input>
        </Row>
    </>)
}

function SettingsComponent(nodeSettings: string, setNodeSettingState: React.Dispatch<React.SetStateAction<string>>, graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
    let content = <></>

    if (nodeSettings === 'colour') {
        content = <ColourSettingsComponent graphState={graphState} dispatch={dispatch} objectType='node'/>
    }

    return (
        <>
            <Row>
                <Col>
                    <CloseButton
                        onClick={() => setNodeSettingState('')}></CloseButton>
                </Col>
                {content}
            </Row>
        </>
    )
}

export default function MappingTab() {
    const { state } = useContext(UserDataContext)

    const { graphState, graphDispatch } = useContext(GraphDataContext)

    const [ nodeSettingState, setNodeSettingState ] = useState('')
    const [ edgeSettingState, setEdgeSettingState ] = useState('')

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
            {NodeMappingWindow(nodeSettingState, setNodeSettingState, graphState, graphDispatch)}
            {edgeMapping(graphState, graphDispatch)}
            {layoutMapping(
                state.layouts.map((layout) => {return layout.name}),
                layoutSettingsState,
                layoutSettingsReducer,
                state.state)}
        </Accordion>
    )
}
