import React, { useContext, useEffect, useState } from 'react'
import { Container, Form, Button, Tabs, Tab, Row, Col, Dropdown } from 'react-bootstrap'

import { SelectionDataContext, UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction } from '../reducers/selection.reducer'
import { API } from '../services/api.service'

import { min, max, mean, median } from 'mathjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    } from 'chart.js'

import { Line } from 'react-chartjs-2'

import './home.component.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
)

function ClusterTab(
        attributeSelectionList: string[],
        selectionDispatch: React.Dispatch<SelectionDataReducerAction>,
        clusterAttributes: {[id: string]: any}[],
        selectedAttribute: string,
        setSelectedAttribute: React.Dispatch<React.SetStateAction<string>>
        ) {

    const attributeList = clusterAttributes.map((attributes) => {
        return parseInt(attributes[selectedAttribute])
    })

    if (attributeList.length === 0) {
        return <></>
    }

    let frequencies: {[key: string]: number} = {}

    attributeList.forEach((att) => {
        frequencies[att] = (frequencies[att] || 0) + 1
    })

    const data = {
        labels: Object.keys(frequencies),
        datasets: [
          {
            fill: true,
            label: selectedAttribute,
            data: Object.values(frequencies),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      };

    return (
        <Tab eventKey='Cluster' title={`Cluster (Count: ${attributeList.length})`}>
            <Row>
                <Dropdown onSelect={(item) => {
                    if (item === null)
                        return

                    setSelectedAttribute(item)
                }}>
                    <Dropdown.Toggle>
                        {selectedAttribute === '' ? 'None' : selectedAttribute}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    {attributeSelectionList.map((att) => {
                        return (
                            <Dropdown.Item key={att} eventKey={att}>{att}</Dropdown.Item>
                        )
                    })}
                    </Dropdown.Menu>
                </Dropdown>
            </Row>
            <Row>
                <p>Min: {min(attributeList)}</p>
                <p>Max: {max(attributeList)}</p>
                <p>Mean: {mean(attributeList)}</p>
                <p>Median: {median(attributeList)}</p>
            </Row>
            <Row>
                <Line data={data}></Line>
            </Row>
            <Button onClick={() => {console.log('here'); selectionDispatch({type: 'set', attribute: 'node', value: []})}}>Deselect All</Button>
        </Tab>
    )
}

function NodeTab(
    id: string,
    attributes: {[id: string] : any},
    setAttributes: React.Dispatch<React.SetStateAction<{[id: string]: any}>>,
    graphDispatch: React.Dispatch<GraphDataReducerAction>,
    graphState: GraphDataState) {

    return (
        <Container style={{
            paddingBottom: '10px',
            paddingTop: '10px'
        }}>
            <Row>
                <Col>
                    <h3>Node "{id}"</h3>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5>Attributes</h5>
                </Col>
            </Row>
            <Row>
                <div style={{
                    overflowY: 'scroll',
                    height: '200px',
                }}>
                <Col>
                    {Object.keys(attributes).map((key) => {
                        return (
                            <Row>
                                <Col>
                                    {key}
                                </Col>
                                <Col>
                                    <Form.Control
                                        onChange={
                                            (e) => {
                                                let newState = {...attributes}

                                                newState[key] = e.target.value

                                                setAttributes(newState)
                                            }
                                        }
                                        type="text"
                                        value={attributes[key]}
                                        defaultValue={attributes[key]}
                                        placeholder={attributes[key]}></Form.Control>
                                </Col>
                            </Row>
                        )
                    })}
                </Col>
                </div>
            </Row>
            <Row>
                <Col md={{offset: 6}}>
                    <Button onClick={() => {
                        graphDispatch({
                            type: 'update',
                            property: 'data',
                            object: 'node',
                            value: {
                                id: id,
                                attributes: attributes
                            }
                        })
                    }} type='submit'>Update</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant='outline-danger'
                        onClick={() => {
                            API.removeNode(id, graphState)
                        }}>
                        Remove Node
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

function EdgeTab(
    id: string,
    source: string,
    target: string,
    attributes: {[id: string] : any},
    setAttributes: React.Dispatch<React.SetStateAction<{[id: string]: any}>>,
    graphDispatch: React.Dispatch<GraphDataReducerAction>,
    graphState: GraphDataState) {

    return (
        <Container>
            <Row>
                <Col>
                    <p>Edge ID: {id}</p>
                    <p>Source Node: {source}</p>
                    <p>Target Node: {target}</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>Attributes</p>
                    {Object.keys(attributes).map((key) => {
                        return (
                            <Row>
                                <Col>
                                    {key}
                                </Col>
                                <Col>
                                    <Form.Control
                                        onChange={
                                            (e) => {
                                                let newState = {...attributes}

                                                newState[key] = e.target.value

                                                setAttributes(newState)
                                            }
                                        }
                                        value={attributes[key]}
                                        defaultValue={attributes[key]}
                                        placeholder={attributes[key]}></Form.Control>
                                </Col>
                            </Row>
                        )
                    })}
                </Col>
                <Row>
                    <Col md={{offset: 6}}>
                        <Button onClick={() => {
                            graphDispatch({
                                type: 'update',
                                property: 'data',
                                object: 'edge',
                                value: {
                                    id: id,
                                    attributes: attributes
                                }
                            })
                        }} type='submit'>Update</Button>
                    </Col>
                </Row>
            </Row>
            <Row>
                <Col>
                    <Button variant='outline-danger'
                        onClick={() => {
                            API.removeEdge(id, graphState)
                        }}>
                            Remove edge
                    </Button>
                </Col>
            </Row>
        </Container>
    )
}

interface EditTabProps {
    objectType: 'node' | 'edge',
    id: string,
    attributes: {[id: string] : any}
    setAttributes: React.Dispatch<React.SetStateAction<{[id: string]: any}>>,
    graphDispatch: React.Dispatch<GraphDataReducerAction>,
    graphState: GraphDataState
}

// Edit the attributes of a node or edge or cluster
function EditTab({
    objectType,
    id,
    attributes,
    setAttributes,
    graphDispatch,
    graphState
}: EditTabProps) {
    let header = <></>

    if (objectType === 'node') {
        header = <h3>Node <i>{id}</i></h3>
    }
    else if (objectType === 'edge') {
        header = <h3>Edge <i>{id}</i></h3>
    }

    let rows = Object.keys(attributes).map((key) => {
        return (
            <Row>
                <Col>
                    {key}
                </Col>
                <Col>
                    <Form.Control
                        onChange={
                            (e) => {
                                let newState = {...attributes}

                                newState[key] = e.target.value

                                setAttributes(newState)
                            }

                        }
                        value={attributes[key]}
                        defaultValue={attributes[key]}
                        placeholder={attributes[key]}></Form.Control>
                </Col>
            </Row>
        )
    })

    return (
        <Container style={{
            marginTop: '10px',
            marginBottom: '10px'
        }}>
            <Row>
                <Col>
                    {header}
                </Col>
            </Row>
            <Row>
                <Col>
                    <h5>Attributes</h5>
                </Col>
            </Row>
            <Row>
                <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                <Col>
                    {rows}
                </Col>
                </div>
            </Row>
            <Row style={{
                marginTop: '10px'
            }}>
                <Col>
                    <Button variant='outline-danger'
                        onClick={() => {
                            if (objectType === 'node') {
                                API.removeNode(id, graphState)
                            }
                            else if (objectType === 'edge') {
                                API.removeEdge(id, graphState)
                            }
                        }}>
                        Remove {objectType}
                    </Button>
                </Col>
                <Col>
                    <Button onClick={() => {
                        graphDispatch({
                            type: 'update',
                            property: 'data',
                            object: objectType,
                            value: {
                                id: id,
                                attributes: attributes
                            }
                        })
                    }} type='submit'>Update</Button>
                </Col>
            </Row>
        </Container>
    )
}

function InfoTab() {
    return (
        <Container>

        </Container>
    )
}

export default function InspectionTab(): JSX.Element {
    const { state } = useContext(UserDataContext)
    const { graphState, graphDispatch } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)

    const [ attributes, setAttributes ] = useState<{[id: string]: any}>({})
    const [ selectedClusterAttribute, setSelectedClusterAttribute ] = useState<string | null>(null)

    useEffect(() => {
        if (selectionState === null || graphState === null) {
            return
        }

        if (selectionState.selectedNodes.length === 0
            && selectionState.selectedEdges.length === 0) {
            return
        }

        // If there is a node selected or an edge selected, we want to show the attributes
        // of the first node or edge in the selection
        if (selectionState.selectedNodes.length === 1) {
            let filteredData = graphState.nodes.data.filter((node) => {
                return node.id === selectionState.selectedNodes[0]
            })

            if (filteredData.length === 0) {
                return
            }

            setAttributes(filteredData[0].attributes)
        } else if (selectionState.selectedEdges.length === 1) {
            let filteredData = graphState.edges.data.filter((edge) => {
                return edge.id === selectionState.selectedEdges[0]
            })

            if (filteredData.length === 0) {
                return
            }

            setAttributes(filteredData[0].attributes)
        }
    }, [graphState, selectionState])

    if (state === null || graphState == null || graphDispatch == null
        || selectionState == null || selectionDispatch === null) {
        console.log('Something is null!')
        return <></>
    }

    if (selectionState.selectedNodes.length === 0
        && selectionState.selectedEdges.length === 0) {
        return <></>
    }

    // if (selectedClusterAttribute) {
    //     return (
    //         <Container
    //             className="shadow bg-white rounded"
    //             style={{
    //                 width: '400px',
    //                 paddingTop: '10px',
    //                 paddingBottom: '10px',
    //                 top: '50px',
    //                 right: '50px',
    //                 position:'absolute'}}>
    //             <Row>
    //                 <Col>
    //                     <h3>Cluster</h3>
    //                 </Col>
    //             </Row>
    //         </Container>
    //     )
    // }

    return (
        <div
            className="shadow bg-white rounded"
            style={{
                width: '400px',
                top: '50px',
                right: '50px',
                position:'absolute'}}>

            <Tabs defaultActiveKey="edit" id="tabs">
                <Tab eventKey="edit" title="Edit">
                    <EditTab
                        objectType={selectionState.selectedNodes.length === 1 ? 'node' : 'edge'}
                        id={selectionState.selectedNodes.length === 1 ? selectionState.selectedNodes[0] : selectionState.selectedEdges[0]}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        graphDispatch={graphDispatch}
                        graphState={graphState}
                    />
                </Tab>
                <Tab eventKey="info" title="Info">
                    <InfoTab />
                </Tab>
            </Tabs>
        </div>
    )
}
