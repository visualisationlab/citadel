
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
    Tooltip,
    ButtonGroup,
    DropdownButton,
    Container,
    CloseButton,
    Spinner,
    ListGroupItem} from 'react-bootstrap'

import tinycolor from 'tinycolor2'

import { UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { MappingSettingsContext } from '../components/main.component'
import { GraphDataReducerAction, GraphDataState, NodeMapping, EdgeMapping } from '../reducers/graphdata.reducer'
import { ServerState } from '../reducers/sessiondata.reducer'

import { LayoutSettingsReducer, LayoutSettingsState, LayoutSettingsReducerAction, AvailableLayout } from '../reducers/layoutsettings.reducer'

import { BiCog } from 'react-icons/bi'

import { SelectedMappingsReducerAction, SelectedMappingsState, mappingProperties, MappingChannel, mappingChannels, MappingType } from '../reducers/selectedmappings.reducer'

import { API } from '../services/api.service'
import { Map } from 'immutable'
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
    'text': {img: 'colourImg', title: 'Text', description: 'Maps a node attribute to its label.'},
}

const edgeMappingTitles: { [key in EdgeMapping]: InfoCard} = {
    'colour': {img: 'colourImg', title: 'Fill Colour', description: 'Maps an edge attribute to its colour.'},
    'alpha': {img: 'alphaImg', title: 'Alpha', description: 'Maps an edge attribute to its transparency.'},
    'width': {img: 'widthImg', title: 'Width', description: 'Maps an edge attribute to its width.'},
}

// function NodeMappingWindow(nodeSettings: string, setNodeSettingState: React.Dispatch<React.SetStateAction<string>>, graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
//     const rows = Object.entries(nodeMappingTitles).map(([key, value], index) => {
//             const title = graphState.nodes.mapping.generators[key as NodeMapping].attribute

//             return (
//                 <ListGroup.Item variant={title !== '' ? 'outline-primary' : ''}>
//                     <Row>
//                         <Col md={{span: 2}}>
//                             {value.title}
//                         </Col>
//                         <Col md={{span: 4}}>
//                             {value.description}
//                         </Col>
//                         <Col md={{span: 6}}>
//                             <ListGroup className="list-group-flush">
//                                 <ListGroup.Item>
//                                     <ButtonGroup>

//                                         <DropdownButton as={ButtonGroup} title={title === '' ? 'none' : title} onSelect={(item) => {
//                                         if (item === null) {
//                                             return
//                                         }

//                                         dispatch({
//                                             type: 'set',
//                                             property: 'mapping',
//                                             object: 'node',
//                                             map: key as NodeMapping,
//                                             fun: 'linearmap',
//                                             key: item
//                                         })
//                                         }}>
//                                             <Dropdown.Item eventKey={''}>none</Dropdown.Item>
//                                             {Object.keys(graphState.nodes.data[0]?.attributes).map((attribute) => {
//                                                 return (
//                                                     <Dropdown.Item key={attribute} eventKey={attribute}>{attribute}</Dropdown.Item>
//                                                 )
//                                             })}

//                                         </DropdownButton>
//                                         <Button onClick={() => setNodeSettingState(key)}><BiCog></BiCog></Button>
//                                     </ButtonGroup>
//                                 </ListGroup.Item>
//                             </ListGroup>
//                         </Col>
//                     </Row>
//                 </ListGroup.Item>
//             )
//         })

//     return (
//         <Accordion.Item eventKey='nodemap'>
//             <Accordion.Header>Node Mapping</Accordion.Header>
//             <Accordion.Body style={{
//                 overflowY: 'scroll',
//                 height: '400px'
//             }}>
//                 <Container>
//                     { nodeSettings !== '' &&
//                         SettingsComponent(nodeSettings, setNodeSettingState, graphState, dispatch)}
//                     { nodeSettings === '' &&

//                     <ListGroup>
//                         {rows}
//                     </ListGroup>}
//                 </Container>
//             </Accordion.Body>
//         </Accordion.Item>
//     )
// }

// function edgeMapping(graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
//     if (graphState.edges.data.length === 0) {
//         return <></>
//     }

//     const rows = Object.entries(edgeMappingTitles).map(([key, value], index) => {
//         const title = graphState.edges.mapping.generators[key as EdgeMapping].attribute

//         return (
//             <ListGroup.Item variant={title !== '' ? 'outline-primary' : ''}>
//                 <Row>
//                     <Col md={{span: 2}}>
//                         {value.title}
//                     </Col>
//                     <Col md={{span: 4}}>
//                         {value.description}
//                     </Col>
//                     <Col md={{span: 4}}>
//                         <ListGroup className="list-group-flush">
//                             <ListGroup.Item>
//                                 <ButtonGroup>
//                                     {/* <Button>Settings</Button> */}
//                                     <DropdownButton as={ButtonGroup} title={title === '' ? 'none' : title} onSelect={(item) => {
//                                     if (item === null) {
//                                         return
//                                     }

//                                     dispatch({
//                                         type: 'set',
//                                         property: 'mapping',
//                                         object: 'edge',
//                                         map: key as EdgeMapping,
//                                         fun: 'linearmap',
//                                         key: item
//                                     })
//                                     }}>
//                                         <Dropdown.Item eventKey={''}>none</Dropdown.Item>
//                                         {Object.keys(graphState.edges.data[0]?.attributes).map((attribute) => {
//                                             return (
//                                                 <Dropdown.Item key={attribute} eventKey={attribute}>{attribute}</Dropdown.Item>
//                                             )
//                                         })}

//                                     </DropdownButton>
//                                 </ButtonGroup>
//                             </ListGroup.Item>
//                         </ListGroup>
//                     </Col>
//                 </Row>
//             </ListGroup.Item>
//         )
//     })

//     return (
//         <Accordion.Item eventKey='edgemap'>
//             <Accordion.Header>Edge Mapping</Accordion.Header>
//             <Accordion.Body style={{
//                 overflowY: 'scroll',
//                 height: '300px'
//             }}>
//                 <Container>
//                     <ListGroup>
//                         {rows}
//                         {/* {settingsBorder([])} */}
//                     </ListGroup>
//                 </Container>
//             </Accordion.Body>
//         </Accordion.Item>
//     )
// }

function layoutMapping(layouts: string[], layoutInfo: LayoutSettingsState,
    layoutSettingsDispatch: React.Dispatch<LayoutSettingsReducerAction>,
    currentLayout: string | null,
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
                                            {layoutInfo?.selectedLayout === null ? 'none' : layoutInfo?.selectedLayout}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item key='None' eventKey={''}>none</Dropdown.Item>
                                            {layouts.map((layout) => {
                                                return <Dropdown.Item key={layout} eventKey={layout}>{layout + (currentLayout === layout ? ' (selected)' : '')}</Dropdown.Item>
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
                                        {layoutInfo?.selectedLayout === null ? 'none' : layoutInfo?.selectedLayout}
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
                                <Row key={setting.name}>
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
                                            placeholder={setting.defaultValue.toString()}>

                                            </Form.Control>
                                        }
                                        {
                                            setting.type === 'boolean' &&
                                            <Form.Check
                                            type='checkbox'
                                            onChange={
                                                (e) => {
                                                    layoutSettingsDispatch({
                                                        attribute: 'property',
                                                        key: setting.name,
                                                        value: e.target.checked
                                                    })
                                                }
                                            }
                                            checked={setting.value}
                                            >
                                            </Form.Check>
                                        }
                                            {/* <Dropdown onSelect={(item) => {
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
                                            </Dropdown> */}
                                        {/* } */}
                                    </Col>
                                </Row>
                            )
                        })}
                        <Row>
                            <Col>
                                randomize starting positions
                            </Col>
                            <Col>
                            <Form.Check
                            type='checkbox'
                            onChange={
                                (e) => {
                                    layoutSettingsDispatch({
                                        attribute: 'property',
                                        key: 'randomize',
                                        value: e.target.checked
                                    })
                                }
                            }
                            checked={res.randomize}>
                            </Form.Check>
                            </Col>
                        </Row>
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

async function getClipboardData() {
    return await navigator.clipboard.readText()
}

// function ColourSettingsComponent(props: {graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>, objectType: 'node' | 'edge'}): JSX.Element {
//     let colours = props.objectType === 'node' ? props.graphState.nodes.mapping.settings.colours : props.graphState.edges.mapping.settings.colours

//     const [colourState, setColourState] = useState(colours)
//     const sessionRef = useRef(null)

//     useEffect(() => {
//         if (props.objectType === 'node')
//             setColourState(props.graphState.nodes.mapping.settings.colours)
//         else
//             setColourState(props.graphState.edges.mapping.settings.colours)
//     }, [props.graphState.nodes.mapping.settings.colours, props.graphState.edges.mapping.settings.colours, props.objectType])

//     let colourRows = colourState.map((colour, index) => {
//         let val = '#' + colour.map(function (x) {return Math.round(x * 255).toString(16).padStart(2, '0')}).join('')

//         return (
//             <Row>
//                 <Col md={{span: 2}}>
//                     <input type="color" onChange={(val) => {
//                         let newColours = [...colourState]
//                         newColours[index] = [tinycolor(val.target.value).toRgb().r / 255, tinycolor(val.target.value).toRgb().g / 255, tinycolor(val.target.value).toRgb().b / 255]
//                         setColourState(newColours)
//                     }} value={val}></input>
//                 </Col>
//                 {index > 0 &&
//                     <Col md={{span: 2}}>
//                         <Button variant='outline-danger' onClick={() => {
//                             let newColours = [...colourState]
//                             newColours.splice(index, 1)
//                             setColourState(newColours)
//                         }
//                         }>Remove</Button>
//                     </Col>
//                 }
//             </Row>
//         )
//     })

//     return (<>
//         {colourRows}
//         <Row>
//             <Col>
//                 <Button variant='outline-primary'
//                     onClick={() => {
//                         if (props.objectType === 'node') {
//                             let newColours = [...colourState]
//                             newColours.push([1.0, 0.0, 0.0])
//                             setColourState(newColours)
//                         }
//                     }
//                 }>Add Colour</Button>
//             </Col>
//         </Row>
//         <Row>
//             <Col>
//                 <Button variant='outline-primary'
//                     onClick={() => {
//                         if (props.objectType === 'node') {
//                             if (window.isSecureContext && navigator.clipboard) {
//                                 navigator.clipboard.writeText('{"colours":[' + colourState.map((x) => {
//                                     return '[' + (x.map((n) => {return n.toFixed(2)}).toString()) + ']'
//                                  }) + ']}')
//                             } else {
//                                 console.log("Connection is insecure")
//                             }
//                         }
//                     }
//                 }>Copy Colours</Button>
//             </Col>
//             <Col md={{offset: 4, span: 4}}>
//                 <Button variant='outline-primary'
//                     onClick={() => {
//                         props.dispatch({
//                             type: 'updateSetting',
//                             object: 'node',
//                             attribute: 'colours',
//                             value: colourState
//                         })
//                     }
//                 }>Apply</Button>
//             </Col>
//         </Row>
//         <Row>
//             <input type='text' ref={sessionRef} value={'{"colours":[' + colourState.map((x) => {
//                return '[' + (x.map((n) => {return n.toFixed(2)}).toString()) + ']'
//             }) + ']}'}></input>
//         </Row>
//         <Row>
//             <Col>
//                 <Button variant='outline-primary'
//                     onClick={() => {
//                         getClipboardData().then((text) => {
//                             let newColours = JSON.parse(text)

//                             try {
//                                 colours = newColours['colours']

//                                 setColourState(colours)
//                             } catch (e) {
//                                 console.log(e)
//                             }
//                         })
//                     }
//                 }>Load colours from clipboard</Button>
//             </Col>
//         </Row>
//     </>)
// }

// function SettingsComponent(nodeSettings: string, setNodeSettingState: React.Dispatch<React.SetStateAction<string>>, graphState: GraphDataState, dispatch: Dispatch<GraphDataReducerAction>): JSX.Element {
//     let content = <></>

//     if (nodeSettings === 'colour') {
//         content = <ColourSettingsComponent graphState={graphState} dispatch={dispatch} objectType='node'/>
//     }

//     return (
//         <>
//             <Row>
//                 <Col>
//                     <CloseButton
//                         onClick={() => setNodeSettingState('')}></CloseButton>
//                 </Col>
//                 {content}
//             </Row>
//         </>
//     )
// }

function CategoryMapping(   mappingSettingsState: SelectedMappingsState,
                            mappingSettingsDispatch: React.Dispatch<SelectedMappingsReducerAction>,
                            graphState: GraphDataState,
                            settingsType: MappingType,
                            setSettingsType: React.Dispatch<React.SetStateAction<MappingType | null>>): JSX.Element {
    // Maps categories to indices, with an option to enable.

    return (
        <>
            <Row>
                <Col md={{span: 1}}>
                    {settingsType.attributeName}
                </Col>
                <Col md={{span: 1}}>
                    {settingsType.attributeType}
                </Col>
                <Col md={{span: 1, offset: 9}}>
                    <CloseButton
                        onClick={() => setSettingsType(null)}></CloseButton>
                </Col>
            </Row>
            <Row>
            </Row>
        </>
    )
}

function generateRow(
    mappingSettingsState: SelectedMappingsState,
    mappingSettingsDispatch: React.Dispatch<SelectedMappingsReducerAction>,
    graphState: GraphDataState,
    mapping: MappingType,
    setSettingsType: React.Dispatch<React.SetStateAction<MappingType | null>>
    ): JSX.Element {

    if (mappingSettingsState.get(Map(mapping)) === undefined) {
        return <></>
    }

    let nodeAttributes = Object.keys(graphState.nodes.metadata)

    let edgeAttributes = Object.keys(graphState.edges.metadata)

    let objectTypeDropdown = (
        <Dropdown onSelect={(selected: any) => {
            // Dropdown for object type.

            const newType: MappingType = {
                ...mapping,
                objectType: selected
            }

            mappingSettingsDispatch({
                type: 'editRow',
                newItem: newType,
                prevItem: mapping,
            })
        }}>
            <Dropdown.Toggle
                id="dropdown-basic"
                >
                {mapping.objectType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item key='node' eventKey='node'>
                    node
                </Dropdown.Item>
                <Dropdown.Item key='edge' eventKey='edge'>
                    edge
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )

    let attributeList: string[] = []

    if (mapping.objectType === 'node') {
        attributeList = nodeAttributes
    }
    else if (mapping.objectType === 'edge') {
        attributeList = edgeAttributes
    }
    else {
        attributeList = []
    }

    let attributeDropdown = mapping.objectType === 'none' ? <></> : (
        <Dropdown onSelect={(selected: any) => {
            // Dropdown for attribute selection.

            mappingSettingsDispatch({
                type: 'editRow',
                prevItem: mapping,
                newItem: {...mapping, attributeName: selected, attributeType: mapping.objectType === 'node' ? graphState.nodes.metadata[selected].type : graphState.edges.metadata[selected].type, mappingName: 'none'}
            })

            }}>
            <Dropdown.Toggle
                id="dropdown-basic"

                >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', float: 'left', display: 'inline-block', width: '100px', textOverflow:'ellipsis'}}>{mapping.attributeName === '' ? 'none' : mapping.attributeName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {Object.values(attributeList).map((attribute) => {
                    return (
                        <Dropdown.Item key={attribute} eventKey={attribute}>
                            {attribute}
                        </Dropdown.Item>
                    )
                })}
            </Dropdown.Menu>
        </Dropdown>
    )

    let orderedProperties: MappingChannel[] = []
    let categoricalProperties: MappingChannel[] = []

    mappingProperties.keySeq().filter((key) => {
        let property = mappingProperties.get(key)

        if (property === undefined) {
            return false
        }

        if (property.objectType !== 'all' && property.objectType !== mapping.objectType) {
            return false
        }

        if (property.channelType !== mapping.attributeType && mapping.attributeType === 'categorical') {
            return false
        }

        return true
    }).forEach((key) => {
        let property = mappingProperties.get(key)

        if (property === undefined) {
            return
        }

        if (property.channelType === 'ordered') {
            orderedProperties.push(key)
        }

        if (property.channelType === 'categorical') {
            categoricalProperties.push(key)
        }
    })

    let channelDropdown = mapping.attributeName === '' ? <></> : (
        <Dropdown onSelect={(selected: any) => {
            // Dropdown for channel selection.
            const newType: MappingType = {
                ...mapping,
                mappingName: selected
            }

            mappingSettingsDispatch({
                type: 'editRow',
                prevItem: mapping,
                newItem: newType
            })
            }}>
            <Dropdown.Toggle
                id="dropdown-basic"
                >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', float: 'left', display: 'inline-block', width: '80px', textOverflow:'ellipsis'}}>{mapping.mappingName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {orderedProperties.length > 0 &&
                    <>
                        <Dropdown.Header>Ordered</Dropdown.Header>
                        {orderedProperties.map((key) => {
                            return (
                                <Dropdown.Item key={key} eventKey={key}>
                                    {key}
                                </Dropdown.Item>
                            )
                        })}
                        <Dropdown.Divider></Dropdown.Divider>
                    </>
                }

                <Dropdown.Header>Categorical</Dropdown.Header>
                {categoricalProperties.map((key) => {
                    return (
                        <>
                            {key === 'none' &&
                                <Dropdown.Divider></Dropdown.Divider>
                            }
                            <Dropdown.Item key={key} eventKey={key}>
                                {key}
                            </Dropdown.Item>
                        </>
                    )
                })}
            </Dropdown.Menu>
        </Dropdown>
    )

    return (
        <ListGroup.Item key={JSON.stringify(mapping)}>
            <Row>
                <Col md={{span: 2}}>
                    {objectTypeDropdown}
                </Col>
                <Col md={{span: 4}}>
                    {attributeDropdown}
                </Col>
                <Col md={{span: 3}}>
                    {channelDropdown}
                </Col>
                {(mapping.mappingName !== 'none' && mappingProperties.get(mapping.mappingName)?.channelType === 'categorical') &&
                        <Col md={{offset: 1, span: 1}}>
                            <Button variant='outline-primary' onClick={
                                () => {
                                    setSettingsType(mapping)
                                }
                            }>
                                <BiCog></BiCog>
                            </Button>
                        </Col>
                }
                {!(mapping.mappingName !== 'none' && mappingProperties.get(mapping.mappingName)?.channelType === 'categorical') &&
                    <Col md={{span: 2}}>
                    </Col>
                }
                <Col md={{span: 1}}>
                    <Button variant='outline-danger' onClick={() => {
                        mappingSettingsDispatch({
                            type: 'remove',
                            mapping: mapping
                        })
                    }}>X</Button>
                </Col>
            </Row>
        </ListGroup.Item>
    )
}

function MappingList(
    mappingSettingsState: SelectedMappingsState,
    mappingSettingsDispatch: React.Dispatch<SelectedMappingsReducerAction>,
    graphState: GraphDataState,
    setSettingsType: React.Dispatch<React.SetStateAction<MappingType | null>>): JSX.Element {

    if (Object.keys(mappingSettingsState).length === 0) {
        // If there are no mappings selected, default message.
        return (
            <ListGroup>
                <ListGroup.Item>
                    <Row>
                        <Col>
                            No mappings
                        </Col>
                    </Row>
                </ListGroup.Item>
            </ListGroup>
        )
    }

    return (
        <ListGroup>
            {
            mappingSettingsState.toList().map((mapping) => {
                return generateRow(
                    mappingSettingsState,
                    mappingSettingsDispatch,
                    graphState,
                    mapping.toJS() as any,
                    setSettingsType)}
                )
            }
        </ListGroup>
    )
}

export default function MappingTab() {
    const { state } = useContext(UserDataContext)

    const { graphState, graphDispatch } = useContext(GraphDataContext)
    const { mappingSettingsState, mappingSettingsDispatch } = useContext(MappingSettingsContext)

    const [ layoutSettingsState, layoutSettingsReducer ] = useReducer(LayoutSettingsReducer, null)

    const [settingsType, setSettingsType] = useState<MappingType | null>(null)

    useEffect(() => {
        if (state?.layouts === undefined) {
            console.log('Layouts undefined')
            return
        }

        layoutSettingsReducer({
            attribute: 'layouts',
            value: state.layouts,
            currentLayout: state.currentLayout as AvailableLayout
        })

    }, [state?.layouts, state?.currentLayout])

    if (state === null || graphState == null || graphDispatch == null) {
        console.log('Something is null!')
        return <></>
    }

    if (mappingSettingsState == null || mappingSettingsDispatch == null) {
        console.log('Mapping settings is null!')
        return <></>
    }

    if (state.layouts.length === 0) {
        API.getLayouts()

        return <></>
    }

    const newItem: MappingType = {
        mappingName: 'none',
        attributeType: 'categorical',
        objectType: 'none',
        attributeName: ''
    }

    if (settingsType !== null) {
        // If a mapping is selected, show the settings.
        if (mappingProperties.get(settingsType.mappingName)?.channelType === 'categorical') {
            return CategoryMapping(mappingSettingsState, mappingSettingsDispatch, graphState, settingsType, setSettingsType)
        }

        return (
            <>
                Ordered
            </>
        )
    }

    let addButton = (
        <Button variant='outline-success' disabled={mappingSettingsState.has(Map(newItem))} onClick={() => {
            mappingSettingsDispatch({
                type: 'addEmpty'
            })
        }}>Add map</Button>
    )

    return (
        <Accordion defaultActiveKey='nodemap'>
            <Container>
                <Row>
                    <Col>
                        {MappingList(mappingSettingsState, mappingSettingsDispatch, graphState, setSettingsType)}
                    </Col>
                </Row>
                <Row>
                    {/* <Col>
                        <Button variant='outline-primary'>Save</Button>
                    </Col>
                    <Col>
                        <Button variant='outline-primary'>Load</Button>
                    </Col> */}
                    <Col>
                        {addButton}
                    </Col>
                </Row>
            </Container>
            {layoutMapping(
                state.layouts.map((layout) => {return layout.name}),
                layoutSettingsState,
                layoutSettingsReducer,
                state.currentLayout,
                state.state)}
        </Accordion>
    )

            {/* {NodeMappingWindow(nodeSettingState, setNodeSettingState, graphState, graphDispatch)} */}
            {/* {edgeMapping(graphState, graphDispatch)} */}

}
