
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
    OverlayTrigger,
    Button,
    Tooltip,
    Container,
    CloseButton,
    Spinner,
    Dropdown,
    Table} from 'react-bootstrap'

import tinycolor from 'tinycolor2'

import { UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { MappingContext } from '../components/main.component'
import { GraphDataState } from '../reducers/graphdata.reducer'
import { ServerState } from '../reducers/sessiondata.reducer'

import { LayoutSettingsReducer, LayoutSettingsState, LayoutSettingsReducerAction, AvailableLayout } from '../reducers/layoutsettings.reducer'
import { MappingsReducerAction, MappingsState, mappingProperties, MappingChannel, mappingChannels, MappingType } from '../reducers/selectedmappings.reducer'

import { BiCog } from 'react-icons/bi'

import { API } from '../services/api.service'
import { Map } from 'immutable'

import './home.component.css'

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
        )
    }

    let res = selectedLayout[0]

    return (
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
    )
}

function ColourBox(colour: number | null): JSX.Element {
    if (colour === null) {
        return <>Select a colour</>
    }

    return (
            <div className="color-box" style={{
                backgroundColor: 'hsl(' + colour + ', 50%, 50%)',
                // flexGrow: 1,
                // flexShrink: 0,
                // flexBasis: 'auto',
                width: '100%',
                height: '80%',
                paddingTop: '10px',
                // Rounded corners
                margin: '5px',
            }}></div>
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
                            if (e.target.value === '') {
                                return
                            }

                            if (e.target.value.length > 20) {
                                return
                            }

                            if (selectedPalette === null) {
                                return
                            }

                            if (props.mappingsState.schemes.has(e.target.value)) {
                                return
                            }

                            // Sanitize input
                            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')

                            props.mappingsDispatch({
                                type: 'schemes/renamed',
                                payload: {
                                    oldName: selectedPalette,
                                    newName: e.target.value
                                }
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

                                                if (newValue < 0 || newValue > 360 || isNaN(newValue)) {
                                                    return
                                                }

                                                if (selectedPalette === null) {
                                                    return
                                                }

                                                let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                                                newColours[index] = parseInt(e.target.value)

                                                props.mappingsDispatch({
                                                    type: 'schemes/updated',
                                                    payload: {
                                                        key: selectedPalette,
                                                        values: newColours
                                                    }
                                                })
                                            }}></Form.Control>
                                        </Col>
                                        <Col md={{span: 4}}>
                                            {/* Slider */}
                                            <Form.Control type='range' min='0' max='360' value={colour} onChange={(e) => {
                                                if (selectedPalette === null) {
                                                    return
                                                }

                                                let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                                                newColours[index] = parseInt(e.target.value)

                                                props.mappingsDispatch({
                                                    type: 'schemes/updated',
                                                    payload: {
                                                        key: selectedPalette!,
                                                        values: newColours
                                                    }
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
                            if (selectedPalette === null) {
                                return
                            }

                            let newColours = props.mappingsState.schemes.get(selectedPalette!)!

                            newColours.push(0)

                            props.mappingsDispatch({
                                type: 'schemes/updated',
                                payload: {
                                    key: selectedPalette,
                                    values: newColours
                                }
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
                <Col>
                    <h3>Palettes</h3>
                </Col>
                <Col md={{span: 1, offset: 8}}>
                    <CloseButton
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
                            type: 'schemes/added',
                            payload: {
                                key: 'New scheme'
                            }
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

    const colourScheme = mappingsState.config.get(JSON.stringify(settingsType))!.colourScheme

    return (
        <>
            <Row>
                <Col md={{span: 1, offset: 11}}>
                    <CloseButton
                        onClick={() => setSettingsType(null)}></CloseButton>
                </Col>
            </Row>
            <Row>
                <div style={{
                    overflowY: 'scroll',
                    height: '400px',
                }}>

                {settingsType.mappingName === 'hue' &&
                        <Row>
                            <Col>
                                <Dropdown onSelect={(select) => {
                                    if (select === null) {
                                        return
                                    }

                                    let config = mappingsState.config.get(JSON.stringify(settingsType))

                                    if (config === undefined) {
                                        return
                                    }

                                    mappingsDispatch({
                                        type: 'settings/edited',
                                        payload: {
                                            mapping: settingsType,
                                            settings: {
                                                ...config,
                                                colourScheme: select
                                            }
                                        }
                                    })
                                    }}>
                                    <Dropdown.Toggle variant='outline-primary' id='dropdown-basic'>
                                        {mappingsState.config.get(JSON.stringify(settingsType))!.colourScheme ?? 'Select a colour scheme'}
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
                            <Col>
                                <Button variant='outline-primary' onClick={() => {
                                    let config = mappingsState.config.get(JSON.stringify(settingsType))

                                    if (config === undefined) {
                                        return
                                    }

                                    let element = document.createElement('a')

                                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(config)))
                                    element.setAttribute('download', 'mapping.json')

                                    element.style.display = 'none'

                                    document.body.appendChild(element)

                                    element.click()

                                    document.body.removeChild(element)

                                }}>Download mapping</Button>
                            </Col>
                            <Col>
                                <Button variant='outline-primary' onClick={() => {
                                    // Load mapping from clipboard
                                    navigator.clipboard.readText().then((text) => {
                                        let config = mappingsState.config.get(JSON.stringify(settingsType))

                                        if (config === undefined) {
                                            return
                                        }

                                    })
                                }}>Load mapping</Button>
                            </Col>
                        </Row>

                }

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

                                        <td>
                                            <Dropdown onSelect={(select) => {
                                                if (select === null) {
                                                    return
                                                }
                                                let config = mappingsState.config.get(JSON.stringify(settingsType))

                                                if (config === undefined) {
                                                    return
                                                }

                                                mappingsDispatch({
                                                    type: 'settings/edited',
                                                    payload: {
                                                        mapping: settingsType,
                                                        settings: {
                                                            ...config,
                                                            settings: config.settings.set(category, parseInt(select))}
                                                    }
                                                })}}>
                                                <Dropdown.Toggle id={'catdrop' + index}>
                                                {settingsType.mappingName === 'text' &&
                                                    <>
                                                        {mappingsState.config.get(JSON.stringify(settingsType))?.settings.get(category) === 0 ? 'hidden' : 'visible'}
                                                    </>
                                                }

                                                {settingsType.mappingName === 'shape' &&
                                                    <>
                                                        {mappingsState.config.get(JSON.stringify(settingsType))?.settings.get(category) === 0 ? 'Square' : 'Circle'}
                                                    </>
                                                }

                                                {(settingsType.mappingName === 'hue' && colourScheme !== null) &&
                                                    <>
                                                        {ColourBox(mappingsState.schemes.get(colourScheme)![mappingsState.config.get(JSON.stringify(settingsType))?.settings.get(category)!])}
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
                                        </td>
                                    </tr>
                                )
                            })
                        }
                        </tbody>
                    </Table>
                </div>
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
                type: 'mappings/edited',
                payload: {
                    newMapping: newType,
                    prevMapping: mapping,
                }
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

            mappingsDispatch({
                type: 'mappings/edited',
                payload: {
                    prevMapping: mapping,
                    newMapping: {...mapping, attributeName: selected, attributeType: mapping.objectType === 'node' ? graphState.nodes.metadata[selected].type : graphState.edges.metadata[selected].type, mappingName: 'none'}
                }
            })

            }}>
            <Dropdown.Toggle
                id="dropdown-basic"

                >
                <span style={{whiteSpace: 'nowrap', overflow: 'hidden', float: 'left', display: 'inline-block', width: '100px', textOverflow:'ellipsis'}}>{mapping.attributeName === '' ? 'none' : mapping.attributeName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu style={{overflowY: 'scroll', maxHeight: 200}}>
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

            mappingsDispatch({
                type: 'mappings/edited',
                payload: {
                    prevMapping: mapping,
                    newMapping: newType
                }
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
                    <Col >
                        {objectTypeDropdown}
                    </Col>
                    <Col >
                        {attributeDropdown}
                    </Col>
                    <Col >
                        {channelDropdown}
                    </Col>
                    {(mapping.mappingName !== 'none' && mappingProperties.get(mapping.mappingName)?.channelType === 'categorical') &&
                            <Col >
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
                        <Col>
                        </Col>
                    }
                    <Col md={{order: 'last'}}>
                        <Button variant='outline-danger' onClick={() => {
                            mappingsDispatch({
                                type: 'mappings/removed',
                                payload: {
                                    mapping: mapping
                                }
                            })
                        }}>X</Button>
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
                <ListGroup.Item>
                        <Row>
                            <Col>
                                No mappings
                            </Col>
                        </Row>
                </ListGroup.Item>
        )
    }

    return (
        <>
            {

                mappingsState.selectedMappings.toList().map((mapping) => {
                        return generateRow(
                            mappingsState,
                            mappingsDispatch,
                            graphState,
                            mapping.toJS() as any,
                            setSettingsType)})
            }
        </>
    )
}

export default function MappingTab() {
    const { state } = useContext(UserDataContext)
    const { graphState, graphDispatch } = useContext(GraphDataContext)
    const { mappingsState, mappingsDispatch } = useContext(MappingContext)

    const [ layoutSettingsState, layoutSettingsReducer ] = useReducer(LayoutSettingsReducer, null)

    const [ settingsType, setSettingsType ] = useState<MappingType | 'palette' | null>(null)

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
        <Button variant='outline-success' disabled={mappingsState.selectedMappings.has(Map(newItem))} onClick={() => {
            mappingsDispatch({
                type: 'mappings/added',
            })
        }}>Add map</Button>
    )

    let editPaletteButton = (
        <Button variant='outline-primary' disabled={mappingsState.selectedMappings.has(Map(newItem))} onClick={() => {
            setSettingsType('palette')
        }}>Edit palettes</Button>
    )

    return (
        <Container style={{
            marginBottom: '10px',
            marginTop: '10px'
        }}>
            <Row>
                <Col>
                    <h3>Mapping</h3>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Accordion defaultActiveKey='nodemap'>
                        <Accordion.Item eventKey='nodemap'>
                            <Accordion.Header>Selected Mappings</Accordion.Header>
                            <Accordion.Body style={{
                                padding: '0px',
                            }}>
                                <ListGroup>
                                    <div style={{
                                        height: '300px',
                                        overflowY: 'auto',
                                    }}>
                                        {MappingList(mappingsState, mappingsDispatch, graphState, setSettingsType)}
                                    </div>
                                    <ListGroup.Item>
                                        <Row>
                                            {/* <Col>
                                                <Button variant='outline-primary'>Save</Button>
                                                </Col>
                                                <Col>
                                                <Button variant='outline-primary'>Load</Button>
                                            </Col> */}
                                            <Col md={{span: 3}}>
                                                {addButton}
                                            </Col>
                                            <Col md={{span: 4}}>
                                                {editPaletteButton}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Accordion.Body>
                        </Accordion.Item>

                        <Accordion.Item eventKey='layoutmap'>
                            <Accordion.Header>Layout Mapping</Accordion.Header>
                            <Accordion.Body>
                                {layoutMapping(
                                    state.layouts.map((layout) => {return layout.name}),
                                    layoutSettingsState,
                                    layoutSettingsReducer,
                                    state.currentLayout,
                                    state.state)}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>
        </Container>
    )
}
