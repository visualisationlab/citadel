
/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for the mapping component, used to map
 * the graph data to visual channels.
 */

import React, { useContext, useReducer, useEffect, useState } from 'react'
import {
    Accordion,
    Row,
    Col,
    Form,
    ListGroup,
    Button,
    Container,
    CloseButton,
    Spinner,
    Dropdown,
    Table,
    InputGroup,
    Stack,
    ButtonGroup} from 'react-bootstrap'

import { UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { MappingContext } from '../components/main.component'
import { GraphDataState } from '../reducers/graphdata.reducer'
import { ServerState } from '../reducers/sessiondata.reducer'

import { LayoutSettingsReducer, LayoutSettingsState, LayoutSettingsReducerAction, AvailableLayout, LayoutState } from '../reducers/layoutsettings.reducer'
import { MappingsReducerAction, MappingsState, mappingProperties, MappingChannel, MappingType } from '../reducers/selectedmappings.reducer'

import { BiCog } from 'react-icons/bi'

import { API } from '../services/api.service'
import { Map } from 'immutable'

import './home.component.css'

function renderLayoutSettings(
    layout: LayoutState,
    layoutSettingsDispatch: React.Dispatch<LayoutSettingsReducerAction>,
    serverState: ServerState
    ) {
    if (serverState !== 'idle') {
        return <Spinner animation="border" />
    }

    return (
        <div style={{
            flexFlow: 'column',
            display: 'flex',
            height: '100%'
        }}>
            <Row style={{
                marginTop: '10px',
                marginBottom: '10px'
            }}>
                <Col>
                    <i>
                        {layout.description}
                    </i>
                </Col>
            </Row>

            <Row style={{
                overflowY: 'auto',
            }}>
                <Col>
                    {
                        layout.settings.map((setting) => {
                            return (
                                <Row key={setting.name}>
                                    <Col>
                                        <p>{setting.name}</p>
                                    </Col>
                                    <Col>
                                        {
                                            setting.type === 'number' &&
                                            <InputGroup className='mb-3'>
                                            {
                                                setting.autoEnabled &&
                                                <>
                                                    <InputGroup.Text>auto</InputGroup.Text>
                                                    <InputGroup.Checkbox checked={setting.auto}
                                                        onChange={() => {
                                                            layoutSettingsDispatch({
                                                                attribute: 'setAuto',
                                                                key: setting.name,
                                                                value: !setting.auto
                                                            })
                                                        }}
                                                    />
                                                </>
                                            }
                                            <Form.Control
                                                type={setting.auto ? 'text' : 'number'}
                                                disabled={setting.auto}
                                                onChange={
                                                    (e) => {
                                                        layoutSettingsDispatch({
                                                            attribute: 'property',
                                                            key: setting.name,
                                                            value: parseFloat(e.target.value)
                                                        })
                                                    }
                                                }
                                                value={setting.auto ? 'server value' : setting.value}
                                                placeholder={setting.defaultValue.toString()}
                                            />

                                            </InputGroup>
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
                        })
                    }
                </Col>
            </Row>
            <Row style={{
                display: 'flex',
                flex: '0 1 40px'
            }}>
                <Col>
                    <Button variant='outline-primary'
                        onClick={() => {
                            API.setLayout(layout)
                        }}
                        style={{
                            float: 'right'
                        }}
                        >
                            Apply
                        </Button>
                </Col>
            </Row>
        </div>
    )
}

function renderLayoutInterface(
    layouts: string[],
    layoutInfo: LayoutSettingsState,
    layoutSettingsDispatch: React.Dispatch<LayoutSettingsReducerAction>,
    currentLayout: string | null,
    serverState: ServerState
    ) {

    const selectedLayout = layoutInfo?.layouts.filter((layout) => {
        return layout.name === layoutInfo.selectedLayout
    })

    let layout = (selectedLayout !== undefined && selectedLayout.length > 0) ? selectedLayout[0] : null

    return (
        <Stack>
            <Row>
                <Col>
                    <p>
                        Layout Algorithm:
                    </p>
                </Col>
                <Col>
                    <Dropdown onSelect={(item) => {
                        if (item === null) {
                            return
                        }

                        layoutSettingsDispatch({
                            attribute: 'selectedLayout',
                            value: item
                        })
                    }}
                        style = {{
                            float: 'right'
                        }}
                        align='end'
                    >
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
            {
                layout !== null &&
                renderLayoutSettings(layout, layoutSettingsDispatch, serverState)
            }
        </Stack>
    )
}

function SchemeColourBox(scheme: number[] | undefined, index: number | undefined): JSX.Element {
    if (scheme === undefined || index === undefined) {
        return <></>
    }

    return ColourBox(scheme[index])
}

function ColourBox(colour: number | null): JSX.Element {
    if (colour === null) {
        return <>Select a colour</>
    }

    return (
        <div
            className="color-box"
            style={{
                backgroundColor: 'hsl(' + colour + ', 50%, 50%)',
                // flexGrow: 1,
                // flexShrink: 0,
                // flexBasis: 'auto',
                width: '100%',
                height: '80%',
                paddingTop: '10px',
                // Rounded corners
                // margin: '5px',
                outlineColor: 'black',
                outlineStyle: 'solid',
                outlineWidth: '1px',
        }}/>
    )
}

// Palette (colour scheme settings) are stored in mappingState.schemes
// Each scheme is a list of colours, each colour is a number between 0 and 255
function PaletteSettings(props: {mappingsState: MappingsState,
    mappingsDispatch: React.Dispatch<MappingsReducerAction>,
    setSettingsType: React.Dispatch<React.SetStateAction<MappingType | 'palette' | null>>}   ) {

    let [selectedPalette, setSelectedPalette] = useState<string | null>(null)

    let schemeSettings = <></>

    if (selectedPalette !== null) {
        schemeSettings = (
            <>
                <Row>
                    <Col md={{span: 2}}>
                        <Form.Label>Rename</Form.Label>
                    </Col>
                    <Col md={{span: 4}}>
                        <Form.Control type='text' value={selectedPalette} onChange={(e) => {
                            props.mappingsDispatch({
                                type: 'scheme',
                                action: 'rename',
                                oldName: selectedPalette!,
                                newName: e.target.value
                            })

                            setSelectedPalette(e.target.value)
                        }}></Form.Control>
                    </Col>
                </Row>
                <Row style={{
                    overflowY: 'scroll',
                    height: '400px',
                    paddingRight: '0px',
                    width: '100%'
                    }}>
                    <Col>
                        {props.mappingsState.schemes.get(selectedPalette)?.map((colour, index) => {
                            return (
                                <Row>
                                    <Col md={{span: 2}}>
                                        <Form.Label>Colour {index}</Form.Label>
                                    </Col>
                                    <Col md={{span: 4}}>
                                        {ColourBox(colour)}
                                    </Col>
                                    <Col md={{span: 2}}>
                                        <Form.Control type='number' value={colour} onChange={(e) => {
                                            let newValue = parseInt(e.target.value)

                                            if (newValue < 0 || newValue > 360) {
                                                return
                                            }

                                            let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                                            newColours[index] = parseInt(e.target.value)

                                            props.mappingsDispatch({
                                                type: 'scheme',
                                                action: 'update',
                                                key: selectedPalette!,
                                                values: newColours
                                            })
                                        }}></Form.Control>
                                    </Col>
                                    <Col md={{span: 4}}>
                                        {/* Slider */}
                                        <Form.Control type='range' min='0' max='360' value={colour} onChange={(e) => {
                                            let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                                            newColours[index] = parseInt(e.target.value)

                                            props.mappingsDispatch({
                                                type: 'scheme',
                                                action: 'update',
                                                key: selectedPalette!,
                                                values: newColours
                                            })
                                        }} style={{
                                            // Multi stop gradient from 0 to 360
                                            background: 'linear-gradient(to right, hsl(0, 50%, 50%), hsl(60, 50%, 50%), hsl(120, 50%, 50%), hsl(180, 50%, 50%), hsl(240, 50%, 50%), hsl(300, 50%, 50%), hsl(360, 50%, 50%))',
                                            // Change slider colour

                                            padding: '0px',

                                        }}></Form.Control>
                                    </Col>
                                </Row>
                            )
                        })
                        }
                    </Col>
                </Row>
                <Row>
                    <Col md={{span: 2}}>
                        <Button variant='outline-primary' onClick={() => {
                            let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                            newColours.push(0)

                            props.mappingsDispatch({
                                type: 'scheme',
                                action: 'update',
                                key: selectedPalette!,
                                values: newColours
                            })
                        }}>Add colour</Button>
                    </Col>
                </Row>
            </>
        )
    }

    return (
        <Container style={{
            paddingBottom: '10px',
            paddingTop: '10px',
        }}>
            <Row>
                <Col md={{span: 6}}>
                    <h3>Palettes</h3>
                </Col>
                <Col md={{offset: 4}}>
                    <CloseButton
                        style={{
                            marginTop: '7px'
                        }}
                        onClick={() => props.setSettingsType(null)}></CloseButton>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Dropdown onSelect={(select) => {
                        if (select === null) {
                            return
                        }

                        setSelectedPalette(select)
                    }}>
                        <Dropdown.Toggle variant='outline-primary' id='dropdown-basic'>
                            {selectedPalette === null ? 'No palette selected' : selectedPalette}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {props.mappingsState.schemes.toArray().map(([scheme, nums]) => {
                                return (
                                    <Dropdown.Item eventKey={scheme}>{scheme}</Dropdown.Item>
                                )
                            })}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
                <Col md={{}}>
                    <Button variant='outline-primary' onClick={() => {
                        props.mappingsDispatch({
                            type: 'scheme',
                            action: 'add',
                            key: 'New scheme'
                        })

                        setSelectedPalette('New scheme')
                    }}>Add new colour scheme</Button>
                </Col>
            </Row>
            {schemeSettings}
        </Container>
    )

}

function CategoryMapping(   mappingsState: MappingsState,
                            mappingsDispatch: React.Dispatch<MappingsReducerAction>,
                            graphState: GraphDataState,
                            settingsType: MappingType,
                            setSettingsType: React.Dispatch<React.SetStateAction<MappingType | 'palette' | null>>): JSX.Element {
    // Maps categories to indices, with an option to enable.

    let frequencies: [string, number][] = []

    if (settingsType.objectType === 'node') {
        frequencies = graphState.nodes.metadata[settingsType.attributeName].frequencies
    }
    else if (settingsType.objectType === 'edge') {
        frequencies = graphState.edges.metadata[settingsType.attributeName].frequencies
    }

    const config = mappingsState.config.get(JSON.stringify(settingsType))

    if (config === undefined) {
        return <></>
    }

    const colourScheme = config.colourScheme

    return (
        <>
            <Row style={{marginTop: '10px'}}>
                <Col md={{span: 10}}>
                    <h3>{settingsType.mappingName.charAt(0).toUpperCase() + settingsType.mappingName.slice(1)} Mapping</h3>
                </Col>
                <Col >
                    <CloseButton
                        style={{
                            float: 'right',
                            paddingTop: '10px'
                        }}
                        onClick={() => setSettingsType(null)}></CloseButton>
                </Col>
            </Row>

            <Row>
                <Col>
                    <>
                        <i>
                            {settingsType.objectType === 'node' ? 'Node' : 'Edge'} attribute: {settingsType.attributeName}
                        </i>
                    </>
                </Col>
            </Row>
            <Row>
                <Col>
                    <hr/>
                </Col>
            </Row>
            <Row style={{
                marginTop: '10px',
                marginBottom: '10px'
            }}>
                <Col>
                    {settingsType.mappingName === 'hue' &&
                    <Row>
                        <Col style={{
                            marginLeft: '10px',
                            paddingTop: '5px'
                        }}
                        md={{
                            span: 2
                        }}>
                            Scheme:
                        </Col>
                        <Col>
                            <Dropdown onSelect={(select) => {
                                if (select === null) {
                                    return
                                }

                                mappingsDispatch({
                                    type: 'settings',
                                    action: 'edit',
                                    mapping: settingsType,
                                    settings: {
                                        ...mappingsState.config.get(JSON.stringify(settingsType))!,
                                        colourScheme: select
                                    }})
                                }}>
                                <Dropdown.Toggle variant='outline-primary' id='dropdown-basic'>
                                    {config.colourScheme ?? 'Select a colour scheme'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {mappingsState.schemes.toArray().map(([scheme, nums]) => {
                                        return (
                                            <Dropdown.Item eventKey={scheme}>{scheme}</Dropdown.Item>
                                        )
                                    })}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        {/* <Col md={{}}>
                            <Button variant='outline-primary' onClick={() => {
                                mappingsDispatch({
                                    type: 'scheme',
                                    action: 'add',
                                    key: 'New scheme'
                                })
                            }}>None</Button>
                        </Col> */}
                    </Row>
                    }
                    <Row style={{
                        marginTop: '10px'
                    }}>
                        <Col>
                            <div style={{
                                overflowY: 'scroll',
                                    // Height is set dynamically based on y dimension - button height - header
                                    height: `calc(100vh - 80px - 174px)`,


                            }}>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            {/* <th>#</th> */}
                                            <th>Name</th>
                                            <th>Frequency</th>
                                            <th>Mapping</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        frequencies.map(([category, freq], index) => {
                                            return (
                                                <tr>
                                                    {/* <td>{index}</td> */}
                                                    <td>{category}</td>
                                                    <td>{freq}</td>

                                                    <td style={{
                                                        width: '250px'
                                                    }}>
                                                        <Row style={{
                                                            margin: '0px',
                                                        }}>
                                                            <Col md={{span: 6}}

                                                            style={{
                                                                padding: '0px',
                                                            }}>
                                                                <Dropdown onSelect={(select) => {
                                                                    if (select === null) {
                                                                        return
                                                                    }
                                                                    mappingsDispatch({
                                                                        type: 'settings',
                                                                        action: 'edit',
                                                                        mapping: settingsType,
                                                                        settings: {
                                                                            ...config,
                                                                            settings: config.settings.set(category, parseInt(select))}
                                                                    })}}

                                                                    >
                                                                    <Dropdown.Toggle id={'catdrop' + index}
                                                                    style={{
                                                                        width: '100px',
                                                                        // height: '80px'
                                                                    }}
                                                                    >
                                                                    {settingsType.mappingName === 'text' &&
                                                                        <>
                                                                            {config.settings.get(category) === 0 ? 'hidden' : 'visible'}
                                                                        </>
                                                                    }

                                                                    {settingsType.mappingName === 'shape' &&
                                                                        <>
                                                                            {config.settings.get(category) === 0 ? 'Square' : 'Circle'}
                                                                        </>
                                                                    }

                                                                    {(settingsType.mappingName === 'hue' && colourScheme !== null) &&
                                                                        <>
                                                                            {
                                                                                SchemeColourBox(
                                                                                    mappingsState.schemes.get(colourScheme),
                                                                                    config.settings.get(category)
                                                                                )
                                                                            }
                                                                        </>
                                                                    }
                                                                    </Dropdown.Toggle>

                                                                    <Dropdown.Menu>
                                                                        {settingsType.mappingName === 'hue' &&
                                                                        <>
                                                                            {mappingsState.schemes.get(mappingsState.config.get(JSON.stringify(settingsType))!.colourScheme!)?.map((num, index) => {
                                                                                return (
                                                                                    <Dropdown.Item key={index} eventKey={index}>
                                                                                        <div className="input-color">
                                                                                            <div className="color-box" style={{
                                                                                                backgroundColor: 'hsl(' + num + ', 50%, 50%)',
                                                                                                // width: '10px',
                                                                                                height: '10px'
                                                                                            }}></div>
                                                                                        </div>
                                                                                    </Dropdown.Item>
                                                                                )

                                                                            }
                                                                            )}
                                                                        </>
                                                                        }

                                                                        {settingsType.mappingName === 'text' &&
                                                                        <>
                                                                            <Dropdown.Item key={0} eventKey={0}>hidden</Dropdown.Item>
                                                                            <Dropdown.Item key={1} eventKey={1}>visible</Dropdown.Item>
                                                                        </>
                                                                        }

                                                                        {settingsType.mappingName === 'shape' &&
                                                                        <>
                                                                            <Dropdown.Item key={1} eventKey={1}>Circle</Dropdown.Item>
                                                                            <Dropdown.Item key={0} eventKey={0}>Square</Dropdown.Item>
                                                                        </>
                                                                        }
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </Col>
                                                            <Col>
                                                                {/* Reset if mapping is set */}
                                                                {mappingsState.config.get(JSON.stringify(settingsType))?.settings.get(category) !== undefined &&
                                                                    <Button variant='outline-primary' onClick={() => {
                                                                        let setting = mappingsState.config.get(JSON.stringify(settingsType))

                                                                        if (setting === undefined) {
                                                                            return
                                                                        }

                                                                        mappingsDispatch({
                                                                            type: 'settings',
                                                                            action: 'edit',
                                                                            mapping: settingsType,
                                                                            settings: {
                                                                                ...setting,
                                                                                settings: setting.settings.delete(category)}
                                                                        })}}>Reset</Button>
                                                                }
                                                            </Col>
                                                        </Row>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    </tbody>
                                </Table>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

function generateRow(
    mappingsState: MappingsState,
    mappingsDispatch: React.Dispatch<MappingsReducerAction>,
    graphState: GraphDataState,
    mapping: MappingType,
    setSettingsType: React.Dispatch<React.SetStateAction<MappingType | 'palette' | null>>
    ): JSX.Element {

    if (mappingsState.selectedMappings.get(Map(mapping)) === undefined) {
        return <></>
    }

    let nodeAttributes = Object.keys(graphState.nodes.metadata)

    let edgeAttributes = Object.keys(graphState.edges.metadata)

    let objectTypeDropdown = (
        <Dropdown onSelect={(selected: any) => {
            // Dropdown for object type.

            const newType: MappingType = {
                mappingName: 'none',
                attributeName: '',
                attributeType: 'categorical',
                objectType: selected
            }

            mappingsDispatch({
                type: 'selection',
                action: 'edit',
                newMapping: newType,
                prevMapping: mapping,
            })
        }}
        // Always render dropdown on top of other elements
        >
            <Dropdown.Toggle
                id="dropdown-basic"
                variant={mapping.objectType === 'none' ? 'outline-primary' : 'primary'}
                >
                {mapping.objectType}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item
                    key='node'
                    eventKey='node'
                    active={mapping.objectType === 'node'}
                >
                    node
                </Dropdown.Item>
                <Dropdown.Item
                    key='edge'
                    eventKey='edge'
                    active={mapping.objectType === 'edge'}
                >
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

            mappingsDispatch({
                type: 'selection',
                action: 'edit',
                prevMapping: mapping,
                newMapping: {
                    ...mapping,
                    attributeName: selected,
                    attributeType: mapping.objectType === 'node' ? graphState.nodes.metadata[selected].type : graphState.edges.metadata[selected].type,
                    mappingName: 'none'
                }
            })

        }}
        >
            <Dropdown.Toggle
                id="dropdown-basic"
                variant={mapping.attributeName === '' ? 'outline-primary' : 'primary'}
            >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', float: 'left', display: 'inline-block', width: '100px', textOverflow:'ellipsis'}}>{mapping.attributeName === '' ? 'none' : mapping.attributeName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ overflowY: 'auto', maxHeight: '200px' }}>
                {
                    Object.values(attributeList).map((attribute) => {
                        return (
                            <Dropdown.Item
                                key={attribute}
                                eventKey={attribute}
                                active={attribute === mapping.attributeName}
                            >
                                {attribute}
                            </Dropdown.Item>
                        )
                    })
                }
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
        <Dropdown

        onSelect={(selected: any) => {
            // Dropdown for channel selection.
            const newType: MappingType = {
                ...mapping,

                mappingName: selected
            }

            mappingsDispatch({
                type: 'selection',
                action: 'edit',
                prevMapping: mapping,
                newMapping: newType
            })

            if (mappingProperties.get(selected)?.channelType === 'categorical') {
                setSettingsType(newType)


            }
            }}>
            <Dropdown.Toggle
                id="dropdown-basic"
                variant={mapping.mappingName === 'none' ? 'outline-primary' : 'primary'}
                >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', float: 'left', display: 'inline-block', width: '80px', textOverflow:'ellipsis'}}>{mapping.mappingName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {orderedProperties.length > 0 &&
                    <>
                        <Dropdown.Header>Ordered</Dropdown.Header>
                        {orderedProperties.map((key) => {
                            // If mapping is active, set active to true.

                            return (
                                <Dropdown.Item
                                    key={key}
                                    eventKey={key}
                                    active={mapping.mappingName === key}
                                >
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
                                <Dropdown.Divider/>
                            }
                            <Dropdown.Item
                                key={key}
                                eventKey={key}
                                active={mapping.mappingName === key}
                            >
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
                <Col >
                    {objectTypeDropdown}
                </Col>
                <Col >
                    {attributeDropdown}
                </Col>
                <Col >
                    {channelDropdown}
                </Col>
                <Col>
                    <Row>
                        {(mapping.mappingName !== 'none' && mappingProperties.get(mapping.mappingName)?.channelType === 'categorical') &&
                                <Col>
                                    <Button
                                        variant='outline-primary' onClick={
                                        () => {
                                            setSettingsType(mapping)
                                        }
                                    }>
                                        <BiCog></BiCog>
                                    </Button>
                                </Col>
                        }
                        {!(mapping.mappingName !== 'none' && mappingProperties.get(mapping.mappingName)?.channelType === 'categorical') &&
                            <Col>
                            </Col>
                        }
                        <Col md={{order: 'last'}}>
                            <Button variant='outline-danger'
                                style={{float: 'right'}}
                                onClick={() => {
                                mappingsDispatch({
                                    type: 'selection',
                                    action: 'remove',
                                    mapping: mapping
                                })
                            }}>X</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </ListGroup.Item>
    )
}

function MappingList(
    mappingsState: MappingsState,
    mappingsDispatch: React.Dispatch<MappingsReducerAction>,
    graphState: GraphDataState,
    setSettingsType: React.Dispatch<React.SetStateAction<MappingType | 'palette' | null>>): JSX.Element {

    if (Object.keys(mappingsState.selectedMappings).length === 0) {
        // If there are no mappings selected, default message.
        return (
            <Row>
                <Col>
                    No mappings
                </Col>
            </Row>
        )
    }

    return (
        <ListGroup style={{height: '100%'}}>
            {
                mappingsState.selectedMappings.toList().map((mapping) => {
                        return generateRow(
                            mappingsState,
                            mappingsDispatch,
                            graphState,
                            mapping.toJS() as any,
                            setSettingsType)})
            }
        </ListGroup>
    )
}

export default function MappingTab() {
    const { state } = useContext(UserDataContext)
    const { graphState, graphDispatch } = useContext(GraphDataContext)
    const { mappingsState, mappingsDispatch } = useContext(MappingContext)
    const [ layoutSettingsState, layoutSettingsReducer ] = useReducer(LayoutSettingsReducer, null)
    const [ settingsType, setSettingsType ] = useState<MappingType | 'palette' | null>(null)
    const [ mappingMenuType, setMappingMenuType ] = useState<'layout' | 'visual'>('visual')

    let layouts = state?.layouts
    let currentLayout = state?.currentLayout

    useEffect(() => {
        if (layouts === undefined) {
            console.log('Layouts undefined')
            return
        }

        layoutSettingsReducer({
            attribute: 'layouts',
            value: layouts,
            currentLayout: currentLayout as AvailableLayout
        })

    }, [layouts, currentLayout])

    useEffect(() => {
        if (mappingsState === null || mappingsDispatch === null) {
            return
        }

        let state = mappingsState.config.get(JSON.stringify(settingsType))
        if (settingsType === null || state === undefined || settingsType === 'palette') {
            return
        }

        let colourScheme = state.colourScheme

        if (colourScheme === null && mappingsState.schemes.size > 0) {
            mappingsDispatch({
                type: 'settings',
                action: 'edit',
                mapping: settingsType,
                settings: {
                    ...mappingsState.config.get(JSON.stringify(settingsType))!,
                    colourScheme: mappingsState.schemes.toArray()[0][0]
                }})
        }
    }, [mappingsState, mappingsDispatch, settingsType])

    if (state === null || graphState == null || graphDispatch == null) {
        console.log('Something is null!')
        return <></>
    }

    if (mappingsState == null || mappingsDispatch == null) {
        console.log('Mapping state is null!')
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
        if (settingsType === 'palette') {
            return <PaletteSettings mappingsState={mappingsState} mappingsDispatch={mappingsDispatch} setSettingsType={setSettingsType}></PaletteSettings>
        }

        // If a mapping is selected, show the settings.
        if (mappingProperties.get(settingsType.mappingName)?.channelType === 'categorical') {
            return CategoryMapping(mappingsState, mappingsDispatch, graphState, settingsType, setSettingsType)
        }

        return (
            <>
                Ordered
            </>
        )
    }

    let addButton = (
        <Button
            variant='outline-success'
            disabled={mappingsState.selectedMappings.has(Map(newItem))}
            onClick={() => {
                mappingsDispatch({
                    type: 'selection',
                    action: 'add'
                })
                }
            }
            style={{
                width: '100%',
            }}
            >
                Add map
            </Button>
    )

    let editPaletteButton = (
        <Button
            variant='outline-primary'
            disabled={mappingsState.selectedMappings.has(Map(newItem))}
            onClick={() => {setSettingsType('palette')}}
            style={{
                width: '100%',
            }}
        >
            Edit palettes
        </Button>
    )

    const content = mappingMenuType === 'visual' ? (
            <>
                <Row style={{
                    height: '100%'
                }}>
                    <Col>
                        <div style={{
                            overflowY: 'auto',
                            height: '90vh'
                        }}>
                            {MappingList(mappingsState, mappingsDispatch, graphState, setSettingsType)}
                        </div>
                    </Col>
                </Row>
                <Row style={{
                    position: 'absolute',
                    bottom: '10px',
                    width: '100%'
                }}>
                    <Col md={{span: 6}}>
                        {addButton}
                    </Col>
                    <Col>
                        {editPaletteButton}
                    </Col>
                </Row>
            </>
        ) : renderLayoutInterface(
                state.layouts.map((layout) => {return layout.name}),
                layoutSettingsState,
                layoutSettingsReducer,
                state.currentLayout,
                state.state)

    return (
        <>
            <Row style={{
                marginTop: '10px',
            }}>
                <Col>
                    <h3>Mapping</h3>
                </Col>

                <Col>
                    <ButtonGroup style={{
                        float: 'right'
                    }}>
                        <Button
                            variant={mappingMenuType === 'visual' ? 'primary' : 'outline-primary'}
                            onClick={() => {setMappingMenuType('visual')}}
                        >
                            Visual
                        </Button>
                        <Button
                            variant={mappingMenuType === 'layout' ? 'primary' : 'outline-primary'}
                            onClick={() => {setMappingMenuType('layout')}}
                        >
                            Layout
                        </Button>
                    </ButtonGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <hr/>
                </Col>
            </Row>
            <Row style={{
                height: '100%'
            }}>
                <Col>
                    {content}
                </Col>
            </Row>
        </>
    )
}
