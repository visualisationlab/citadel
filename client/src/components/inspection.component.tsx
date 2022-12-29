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
        <>
            <Row>
                <p>Node ID: {id}</p>
            </Row>
            <Row>
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
                                    type="text"
                                    value={attributes[key]}
                                    defaultValue={attributes[key]}
                                    placeholder={attributes[key]}></Form.Control>
                            </Col>
                        </Row>
                    )
                })}
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
        </>
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
        <>
            <Row>
                <p>Edge ID: {id}</p>
                <p>Source Node: {source}</p>
                <p>Target Node: {target}</p>
            </Row>
            <Row>
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
        </>
    )
}

export default function InspectionTab(): JSX.Element {
    const { state } = useContext(UserDataContext)
    const { graphState, graphDispatch } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)
    const [ attributes, setAttributes ] = useState<{[id: string]: any}>({})
    const [ clusterAttributes, setClusterAttributes ] = useState<{[id: string]: any}[]>([])
    const [ selectedAttribute, setSelectedAttribute ] = useState('')
    const [ attributeSelectionList, setAttributeSelectionList ] = useState<string[]>([])

    useEffect(() => {
        if (selectionState === null || graphState === null) {
            return
        }

        if (selectionState.selectedNodes.length === 0 && selectionState.selectedEdges.length === 0) {
            return
        }

        if (selectionState.selectedNodes.length > 0) {
            if (selectionState.selectedNodes.length > 1) {
                const filteredResult = graphState.nodes.data
                    .filter((node) => { return selectionState.selectedNodes.includes(node.id)})


                if (filteredResult.length !== selectionState.selectedNodes.length) {
                    console.log(`Wrong number of nodes for cluster ${selectionState.selectedNodes.length}: ${filteredResult.length}`)

                    return
                }

                setAttributeSelectionList(Object.keys(filteredResult[0].attributes))

                const result = filteredResult.map((node) => { return node.attributes })
                console.log(result)

                setClusterAttributes(result)

                return
            }

            const id = selectionState.selectedNodes[0]

            const result = graphState.nodes.data.filter((node) => {return node.id === id})

            if (result.length === 0 || result.length > 1) {
                console.log(`Wrong number of nodes with id ${id}: ${result.length}`)

                return
            }

            setAttributes(result[0].attributes)

            return
        }

        if (selectionState.selectedEdges.length > 1) {
            const filteredResult = graphState.edges.data
                .filter((edge) => { return selectionState.selectedEdges.includes(edge.id)})


            if (filteredResult.length !== selectionState.selectedEdges.length) {
                console.log(`Wrong number of edges for cluster ${selectionState.selectedEdges.length}: ${filteredResult.length}`)

                return
            }

            setAttributeSelectionList(Object.keys(filteredResult[0].attributes))

            const result = filteredResult.map((edge) => { return edge.attributes })

            setClusterAttributes(result)

            return
        }

        const id = selectionState.selectedEdges[0]

        console.log(graphState.edges.data)

        const result = graphState.edges.data.filter((edge) => {return edge.id === id})

        if (result.length === 0 || result.length > 1) {
            console.log(`Wrong number of edges with id ${id}: ${result.length}`)

            return
        }

        setAttributes(result[0].attributes)

        return

    }, [graphState, selectionState])

    if (state === null || graphState == null || graphDispatch == null
        || selectionState == null || selectionDispatch === null) {
        console.log('Something is null!')
        return <></>
    }

    if (selectionState.selectedNodes.length === 0 && selectionState.selectedEdges.length === 0) {
        return <></>
    }

    if (selectionState.selectedNodes.length > 0) {
        if (selectionState.selectedNodes.length > 1) {
            return (
                <Container
                    className="shadow bg-white rounded"
                    style={{width: '400px',
                    padding: '0px', top: '50px',
                    right: '50px',
                    position:'absolute'}}>
                    <Tabs>
                        {ClusterTab(attributeSelectionList, selectionDispatch, clusterAttributes, selectedAttribute, setSelectedAttribute)}
                    </Tabs>
                </Container>
            )
        }

        const id = selectionState.selectedNodes[0]

        const result = graphState.nodes.data.filter((node) => {return node.id === id})

        if (result.length === 0 || result.length > 1) {
            console.log(`Wrong number of nodes with id ${id}: ${result.length}`)

            return <></>
        }

        const node = result[0]

        return (
            <Container
                className="shadow bg-white rounded"
                style={{width: '400px',
                padding: '0px', top: '50px',
                right: '50px',
                position:'absolute'}}>
                <Tabs >
                    <Tab eventKey='Node' title='Node'>
                        {NodeTab(node.id, attributes, setAttributes, graphDispatch, graphState)}
                    </Tab>
                </Tabs>
            </Container>
        )
    }

    const id = selectionState.selectedEdges[0]

    const result = graphState.edges.data.filter((edge) => {return edge.id === id})

    if (result.length === 0 || result.length > 1) {
        console.log(`Wrong number of edges with id ${id}: ${result.length}`)

        return <></>
    }

    const edge = result[0]

    return (
        <Container
            className="shadow bg-white rounded"
            style={{width: '400px',
            padding: '0px', top: '50px',
            right: '50px',
            position:'absolute'}}>
            <Tabs >
                <Tab eventKey='Edge' title='Edge'>
                    {EdgeTab(edge.id, edge.source, edge.target, attributes, setAttributes, graphDispatch, graphState)}
                </Tab>
            </Tabs>
        </Container>
    )
}
