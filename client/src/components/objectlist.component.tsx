/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the object list component, which is a tab in the main component.
 * It allows the user to search through nodes and edges and select them.
 */

import React, { useState, useEffect, useContext, useMemo } from 'react'
import {
    Row,
    Container,
    InputGroup,
    Form,
    ListGroup,
    Table,
    Col,
    Dropdown,
    DropdownButton,
    Button } from 'react-bootstrap'

import './home.component.css'

import Fuse from 'fuse.js'

import { GraphDataContext } from './main.component'
import { SelectionDataContext } from './main.component'
import { SelectionDataReducerAction } from '../reducers/selection.reducer';

interface InspectEdge {
    id: string,
    nodeID: string
}

// function renderListContent(
//     source: string,
//     edges: InspectEdge[],
//     selectedEdges: string[],
//     selectedNodes: string[],
//     selectionDispatch: React.Dispatch<SelectionDataReducerAction>)
//     : JSX.Element {
//     if (edges.length === 0) {
//         return (<></>)
//     }

//     return (
//         <Accordion.Body>
//             <Table striped>
//                 <thead>
//                     <tr>
//                         <th>Edge ID</th>
//                         <th>Source Node ID</th>
//                         <th>Target Node ID</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {edges.map((edge) => {
//                         return (
//                             <tr key={edge.id}
//                                 className={selectedEdges.includes(edge.id) ? 'table-primary':''}
//                             >
//                                 <td onClick={(e) => {
//                                         selectionDispatch({
//                                             'type': 'selection/set',
//                                             payload: {
//                                                 'attribute': 'edge',
//                                                 'value': [edge.id]
//                                             }
//                                         })
//                                     }}>
//                                         {
//                                             edge.id
//                                         }
//                                 </td>
//                                 <td
//                                     className={selectedNodes.includes(source) ? 'table-primary':''}
//                                     onClick={(e) => {
//                                         selectionDispatch({
//                                             'type': 'selection/set',
//                                             payload: {
//                                                 'attribute': 'node',
//                                                 'value': [source]
//                                             }
//                                         })
//                                     }}
//                                     >{source}</td>
//                                 <td className={selectedNodes.includes(edge.nodeID) ? 'table-primary':''}
//                                     onClick={(e) => {
//                                         selectionDispatch({
//                                             'type': 'selection/set',
//                                             payload: {
//                                                 'attribute': 'node',
//                                                 'value': [edge.nodeID]
//                                             }
//                                         })
//                                     }}>{edge.nodeID}</td>
//                             </tr>
//                         )
//                     })}
//                 </tbody>
//             </Table>
//         </Accordion.Body>
//     )
// }

function renderMainList(
    objectIDs: string[],
    selectedEdges: string[] | undefined,
    selectedNodes: string[] | undefined,
    searchType: 'edge' | 'node',
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null)
    : JSX.Element {

    if (selectionDispatch === null || selectedEdges === undefined || selectedNodes === undefined) {
        return (<></>)
    }

    return (
        <Row>
            <Col>
                <ListGroup>
                    <div
                        style={{
                            overflowY: 'scroll',
                            height: '80vh',
                            paddingRight: '0px'
                        }}
                    >
                    {objectIDs.map((id) => {
                        let button = null

                        let selectedObjects = []

                        if (searchType === 'node') {
                            selectedObjects = selectedNodes
                        } else {
                            selectedObjects = selectedEdges
                        }

                        if (selectedObjects.includes(id)) {
                            button = (
                                <Button variant="outline-danger" onClick={(e) => {
                                    selectionDispatch({
                                        'type': 'selection/removed',
                                        payload: {
                                            'attribute': searchType,
                                            'value': id
                                        }
                                    })
                                }}>
                                    Deselect
                                </Button>
                            )
                        } else {
                            button = <Button variant="outline-primary" onClick={(e) => {
                                selectionDispatch({
                                        'type': 'selection/set',
                                        payload: {
                                            'attribute': searchType,
                                            'value': [id]
                                        }
                                    })
                                }}>
                                Select
                            </Button>
                        }


                        return (
                            <ListGroup.Item key={id}>
                                <Row>
                                    <Col>
                                        {searchType.charAt(0).toUpperCase() + searchType.slice(1)} ID: {id}
                                    </Col>
                                    <Col>
                                        {button}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        )
                    })}
                    </div>
                </ListGroup>
            </Col>
        </Row>
    )
}

export default function ObjectListTab() {
    let [objectIDs, setObjectIDs] = useState<string[]>([])
    let [query, setQuery] = useState('')
    let [searchType, setSearchType] = useState<'node' | 'edge'>('node')

    const { graphState } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)

    const list = useMemo(() => renderMainList(objectIDs, selectionState?.selectedEdges,
        selectionState?.selectedNodes, searchType, selectionDispatch),
        [objectIDs, selectionDispatch, searchType, selectionState?.selectedEdges, selectionState?.selectedNodes])

    // Update the list of nodes and edges when the graph state changes or the query changes
    useEffect(() => {
        if (graphState === null) {
            return
        }

        let searchResult: string[] = []

        // Create a set for object attributes
        let attributes: Set<string> = new Set()

        let data = []

        if (searchType === 'node') {
            data = graphState.nodes.data
        } else {
            data = graphState.edges.data
        }

        // Collect all attributes from the nodes
        data.forEach((node) => {
            if (searchType === 'node') {
                Object.keys(node.attributes).forEach((attribute) => {
                    attributes.add(attribute)
                })
            } else {
                Object.keys(node.attributes).forEach((attribute) => {
                    attributes.add(attribute)
                })
            }
        })

        if (query.length > 0) {
            const options = {
                keys: ['id', 'attributes.id', ...Array.from(attributes).map((attribute) => {return ('attributes.' + attribute)})],
                shouldSort: false,
                threshold: searchType === 'node' ? 0.3 : 0.1,
                useExtendedSearch: true
            }

            let fuse
            if (searchType === 'node') {
                fuse = new Fuse(graphState.nodes.data, options)


            } else {
                fuse = new Fuse(graphState.edges.data, options)
            }

            searchResult = [...fuse.search(query).map(
                (result) => {
                    return result.item.id
                }
            )]
        } else {
            searchResult = data.map((node) => {
                return node.id
            })
        }

        setObjectIDs(searchResult)
    }, [graphState, query, searchType, selectionState])

    if (selectionState === null || selectionDispatch === null) {
        return <>
        </>
    }

    // If all nodes are selected, then the select all button should be deselect all
    let selectAllButton = (
        <Button variant='outline-primary' onClick={(e) => {
            selectionDispatch({
                'type': 'selection/set',
                payload: {
                    'attribute': searchType,
                    'value': objectIDs
                }
            })
        }}>
            Select All
        </Button>
    )

    let deselectAllButton = (
        <Button variant='outline-danger' onClick={(e) => {
            selectionDispatch({
                'type': 'selection/set',
                payload: {
                    'attribute': searchType,
                    'value': []
                }
            })
        }}>
            Deselect All
        </Button>
    )

    let selectButton = null

    // If all nodes are selected and searchType is node, then the select button should be deselect all
    if (searchType === 'node' && selectionState.selectedNodes.length === objectIDs.length) {
        selectButton = deselectAllButton
    } else if (searchType === 'edge' && selectionState.selectedEdges.length === objectIDs.length) {
        selectButton = deselectAllButton
    } else {
        selectButton = selectAllButton
    }


    return (
        <Container style={{
            paddingLeft: '0px',
            paddingRight: '0px'
        }}>
            <Row>
                <Col>
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
                        <DropdownButton
                            align='end'
                            variant='outline-secondary'
                            title={searchType.charAt(0).toUpperCase() + searchType.slice(1)}
                            id='input-group-dropdown-2'
                        >
                            <Dropdown.Item onClick={(e) => {
                                setSearchType('node')
                            }}>Node</Dropdown.Item>
                            <Dropdown.Item onClick={(e) => {
                                setSearchType('edge')
                            }}>Edge</Dropdown.Item>
                        </DropdownButton>
                    </InputGroup>
                </Col>
            </Row>
            {list}
            <Row>
                <Col md={{offset: 8}}>
                    {selectButton}
                </Col>
            </Row>
        </Container>
    )
}
