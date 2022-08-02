
import React, { useState, useEffect, useContext } from 'react'
import { Row, Container, InputGroup, Form, Accordion, Table } from 'react-bootstrap'
import { VisGraph } from '../types';

import Fuse from 'fuse.js'

import { GraphDataContext } from '../components/main.component'
import { SelectionDataContext } from '../components/main.component'

import { API } from '../services/api.service'

import './home.component.css'
import { SelectionDataReducerAction } from '../reducers/selection.reducer';
import { select } from 'd3';

interface InspectTabProps {
    // selectedEdgeID: string,
    // selectedNodeID: string
}

interface InspectEdge {
    id: string,
    nodeID: string
}

function renderListContent(source: string, edges: InspectEdge[],
    selectedEdges: string[], selectedNodes: string[], selectionDispatch: React.Dispatch<SelectionDataReducerAction>): JSX.Element {
    if (edges.length === 0) {
        return (<></>)
    }

    return (
        <Accordion.Body>
            <Table striped>
                <thead>
                    <tr>
                        <th>Edge ID</th>
                        <th>Source Node ID</th>
                        <th>Target Node ID</th>
                    </tr>
                </thead>
                <tbody>
                    {edges.map((edge) => {
                        return (
                            <tr key={edge.id} className={selectedEdges.includes(edge.id) ? 'table-primary':''}>
                                <td onClick={(e) => {
                                        selectionDispatch({
                                            'attribute': 'edge',
                                            'type': 'set',
                                            'value': [edge.id]
                                        })
                                    }}>{edge.id}</td>
                                <td
                                    className={selectedNodes.includes(source) ? 'table-primary':''}
                                    onClick={(e) => {
                                        selectionDispatch({
                                            'attribute': 'node',
                                            'type': 'set',
                                            'value': [source]
                                        })
                                    }}
                                    >{source}</td>
                                <td className={selectedNodes.includes(edge.nodeID) ? 'table-primary':''}
                                    onClick={(e) => {
                                        selectionDispatch({
                                            'attribute': 'node',
                                            'type': 'set',
                                            'value': [edge.nodeID]
                                        })
                                    }}>{edge.nodeID}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </Accordion.Body>
    )
}

function renderMainList(nodes: {[id: string]: InspectEdge[]},
    selectedEdges: string[], selectedNodes: string[], selectionDispatch: React.Dispatch<SelectionDataReducerAction>): JSX.Element {
    return (
        <Container style={{
            overflowY: 'scroll',
            height: '400px',
            paddingRight: '0px'
        }}>
            <Accordion alwaysOpen>
                {Object.keys(nodes).map((id) => {
                    return (
                        <Accordion.Item key={id} eventKey={id}>
                            <Accordion.Header>Node {id} (edge count: {nodes[id].length})</Accordion.Header>
                            {renderListContent(id, nodes[id], selectedEdges, selectedNodes, selectionDispatch)}
                        </Accordion.Item>
                    )
                })}
            </Accordion>
        </Container>
    )
}

// TRY MINISEARCH
// PAGINATION
export default function InspectTab(props: InspectTabProps) {
    let [nodes, setNodes] = useState<{[id: string]: InspectEdge[]}>({})
    let [query, setQuery] = useState('')

    const { graphState } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)

    useEffect(() => {
        if (graphState === null) {
            return
        }

        let tmpNodes: {[id: string]: InspectEdge[]} = {}

        if (query !== '') {
            console.log('searching')
            const options = {
                keys: ['id'],
                shouldSort: false,
                threshold: 0.4
            }

            const fuse = new Fuse(graphState.nodes.data, options)

            fuse.search(query).forEach((result) => {
                tmpNodes[result.item.id] = []
            })
        } else {
            graphState.nodes.data.forEach((node) => {
                tmpNodes[node.id] = []
            })
        }

        graphState.edges.data.forEach((edge, index) => {
            let id = 'id' in edge.attributes ? edge.attributes.id : index.toString()

            if (query !== '') {
                if (!(Object.keys(tmpNodes).includes(edge.source.toString()))) {
                    if (graphState.directed) {
                        return
                    }

                    if (!(Object.keys(tmpNodes).includes(edge.target.toString()))) {
                        return
                    }

                    tmpNodes[edge.target].push({ id: id, nodeID: edge.source})
                    return
                }
            }


            tmpNodes[edge.source].push({ id: id, nodeID: edge.target})

            if (graphState.directed) {
                return
            }

            if (!(Object.keys(tmpNodes).includes(edge.target.toString()))) {
                return
            }

            tmpNodes[edge.target].push({ id: id, nodeID: edge.source})
        })

        setNodes(tmpNodes)
    }, [graphState, query])

    if (selectionState === null || selectionDispatch === null) {
        return <>
        </>
    }
    return (
        <Container style={{
            paddingLeft: '0px'
        }}>
            <Row>
                <InputGroup style={{
                    paddingRight: '0px'
                }}>
                <Form.Control
                placeholder='Search'
                aria-label='search'
                onChange={(e) => {
                    setQuery(e.target.value)
                }}
                />
                </InputGroup>
            </Row>
            <Row >
                {renderMainList(nodes, selectionState.selectedEdges, selectionState.selectedNodes, selectionDispatch)}
            </Row>
        </Container>
    )
}
