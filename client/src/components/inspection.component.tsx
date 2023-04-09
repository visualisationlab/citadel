import React, { useContext, useEffect, useState } from 'react'
import { Container, Form, Button, Tabs, Tab, Row, Col, Dropdown, Stack, Table, ListGroup } from 'react-bootstrap'

import { SelectionDataContext, UserDataContext } from '../components/main.component'
import { GraphDataContext } from '../components/main.component'
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction } from '../reducers/selection.reducer'
import { API } from '../services/api.service'
import { VisGraph } from '../types'

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
    BarElement,
    } from 'chart.js'

import { Bar } from 'react-chartjs-2'

import './home.component.css'
import './inspection.stylesheet.scss'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

function ClusterTab(
        attributeSelectionList: string[],
        objectType: 'node' | 'edge',
        selectionDispatch: React.Dispatch<SelectionDataReducerAction>,
        clusterAttributes: {[id: string]: any}[],
        selectedAttribute: string,
        setSelectedAttribute: React.Dispatch<React.SetStateAction<string>>
        ) {

    const attributeList: string[] = clusterAttributes.map((attributes) => {
        return attributes[selectedAttribute]
    })

    if (attributeList.length === 0) {
        return <></>
    }

    let frequencyDict: {[key: string]: number} = {}

    attributeList.forEach((attribute) => {
        frequencyDict[attribute] = (frequencyDict[attribute] || 0) + 1
    })

    const data = {
        labels: Object.keys(frequencyDict),
        datasets: [
            {
                label: selectedAttribute,
                data: Object.values(frequencyDict),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
      }

      const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'top' as const,
            },
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Frequency',
                    // Bold text
                    font: {
                        weight: 'bold'
                    }
                },
                ticks: {
                    stepSize: 1
                }
            },
            x: {
                title: {
                    display: true,
                    text: selectedAttribute,
                    font: {
                        weight: 'bold'

                    }
                }
            },
        }
    }
    let clusterStatistics = <></>
    // If all attributes are numeric, then we can do some statistics
    if (attributeList.every((attribute) => {
        return !isNaN(Number(attribute))
    })) {
        let vals = attributeList.map((e) => {return parseFloat(e)})

        clusterStatistics = (
            <>
                <tr>
                    <td><b>Min</b></td>
                    <td>{min(vals)}</td>
                </tr>
                <tr>
                    <td><b>Max</b></td>
                    <td>{max(vals)}</td>
                </tr>
                <tr>
                    <td><b>Mean</b></td>
                    <td>{mean(vals)}</td>
                </tr>
                <tr>
                    <td><b>Median</b></td>
                    <td>{median(vals)}</td>
                </tr>
            </>
        )
    }

    const histogramElement = selectedAttribute !== '' ? (
        <>
            <Row style={{
                marginTop: '1em',
            }}>
                <Col>
                    <h4>Histogram</h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Bar options={options} data={data}/>
                </Col>
            </Row>
        </>
    ) : (
        <Row style={{
            marginTop: '1em',
        }}>
            <Col>
                <i>Click on an attribute to view its histogram.</i>
            </Col>
        </Row>
    )

    return (
        <>
            <Row style={{
                height: '80vh',
                overflowY: 'auto',
            }}>
                <Col>

                    <Row>
                        <Col>
                            <h4>Attributes</h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{
                            span: 9
                        }}>
                            <ListGroup
                                style={{
                                    maxHeight: '15vh',
                                    overflowY: 'auto',
                                }}
                            >
                                {attributeSelectionList.map((att) => {
                                    return (
                                        <ListGroup.Item
                                            action
                                            key={att}
                                            eventKey={att}
                                            active={att === selectedAttribute}
                                            onClick={
                                                () => {
                                                    setSelectedAttribute(att)
                                                }
                                            }
                                            >
                                                {
                                                    att
                                                }
                                        </ListGroup.Item>
                                    )
                                })}
                            </ListGroup>
                        </Col>
                    </Row>
                    {
                        histogramElement
                    }
                    <Row style={{
                                    marginTop: '1em',
                                }}>
                        <Col>
                            <h4>Statistics</h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Table striped bordered>
                                {/* <thead>
                                    <tr>
                                        <th></th>
                                        <th>Value</th>
                                    </tr>
                                </thead> */}
                                <tbody>
                                    <tr>
                                        <td><b>Count</b></td>
                                        <td>{attributeList.length}</td>
                                    </tr>
                                    {
                                        clusterStatistics
                                    }
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{
                    position: 'absolute',
                    bottom: '10px',
                    width: '100%'
                }}>
                <Col>
                    <Button variant='outline-danger'
                        onClick={() => {
                        console.log('here');
                        selectionDispatch({
                            type: 'selection/set',
                            payload: {
                                attribute: 'node', value: []
                        }})}}>
                            Deselect All
                    </Button>
                </Col>
            </Row>
        </>
    )
}

function ObjectTab(
    id: string,
    objectType: 'node' | 'edge',
    attributes: {[id: string] : any},
    setAttributes: React.Dispatch<React.SetStateAction<{[id: string]: any}>>,
    graphDispatch: React.Dispatch<GraphDataReducerAction>,
    graphState: GraphDataState) : JSX.Element {

    console.log(attributes)
    return (
        <Stack>
            <h4>
                {objectType.charAt(0).toUpperCase() + objectType.slice(1)} ID
            </h4>
            <p>{id}</p>

            <h4>Attributes</h4>
            <Stack gap={3}>
                <div
                    style={{
                        overflowY: 'auto',
                        // Height is set dynamically based on y dimension - button height - header
                        height: `calc(100vh - 80px - 174px)`,

                    }}
                >
                    <Stack gap={3}>
                        {
                            Object.keys(attributes).map((key) => {
                                return (
                                    <Stack>
                                        <h6
                                            style={{
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {key}
                                        </h6>
                                        <Form.Control id={key}
                                            onChange={
                                                (e) => {
                                                    let newState = {...attributes}

                                                    newState[key] = e.target.value

                                                    setAttributes(newState)
                                                }
                                            }
                                            type="text"
                                            value={attributes[key]}

                                            placeholder={attributes[key]}/>
                                    </Stack>
                                )
                            })
                        }
                    </Stack>
                </div>
                <Row style={{
                    position: 'absolute',
                    bottom: '10px',
                    width: '100%'
                }}>
                    <Col>
                        <Button variant='outline-danger'
                            onClick={() => {
                                if (objectType === 'node') {
                                    API.removeNode(id, graphState)
                                }
                                else {
                                    API.removeEdge(id, graphState)
                                }
                            }}>
                            Remove
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            style={{
                                float: 'right'
                            }}
                            onClick={() => {
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
            </Stack>
        </Stack>
    )
}

export function ResizeBar(props: {
    hidden: boolean,
    setHidden: React.Dispatch<React.SetStateAction<boolean>>,
    width: number,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
    maxWidth: number,
    barWidth: number,
    position: 'left' | 'right',
    minWidth: number,
}) {
    const [dragging, setDragging] = useState(false)

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                right: (props.position === 'right') ? (!props.hidden ? props.width + 'px' : 0) : 'auto',
                left: (props.position === 'left') ? (!props.hidden ? props.width + 'px' : 0) : 'auto',
                width: props.barWidth,
                height: '100%',
                zIndex: 1000,
                backgroundColor: 'white',
                borderLeft: '1px solid #e0e0e0',
                cursor: dragging ? 'grabbing' : 'grab',
                // transition: 'right 0.1s ease-in-out',
            }}
            onDragStart={(e) => { e.preventDefault() }}

            onMouseDown={() => {
                setDragging(true)
                window.onmousemove = ((e) => {
                    let delta = - props.barWidth / 2

                    let x = props.position === 'right' ? window.innerWidth - e.clientX : e.clientX
                    // if (dragging) {
                        if (x + delta > (props.maxWidth)) {
                            props.setWidth(props.maxWidth + delta)

                            setDragging(false)
                            window.onmousemove = null
                        } else if (x + delta < props.minWidth) {
                            props.setWidth(props.minWidth)
                            setDragging(false)
                            window.onmousemove = null
                        } else {
                            props.setWidth(x + delta)
                        }
                    // }
                })

            }}

            onMouseUp={() => {
                window.onmousemove = null
                setDragging(false)
            }}
        >
            <div
                onDragStart={(e) => { e.preventDefault() }}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: (props.position === 'right') ? 10 : 0,
                    left: (props.position === 'left') ? 0 : 10,
                    width: 10,
                    height: '100%',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    borderLeft: (props.position === 'right' ? '1px solid #e0e0e0' : 'none'),
                    borderRight: (props.position === 'left' ? '1px solid #e0e0e0' : 'none'),
                    cursor: dragging ? 'grabbing' : 'grab',
                }}
            />
        </div>
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

    const [ hidden, setHidden ] = useState(false)

    const [ width, setWidth ] = useState(300)

    useEffect(() => {
        if (selectionState === null || graphState === null) {
            return
        }

        if (selectionState.selectedIDs.length === 0) {
            setAttributes({})
            setClusterAttributes([])
            setSelectedAttribute('')
            setAttributeSelectionList([])

            return
        }

        let data: (VisGraph.GraphNode | VisGraph.Edge)[] = []

        if (selectionState.objectType === 'node') {
            data = graphState.nodes.data
        } else if (selectionState.objectType === 'edge') {
            data = graphState.edges.data
        }

        if (selectionState.selectedIDs.length > 1) {
            const filteredResult = data.filter((object) => { return selectionState.selectedIDs.includes(object.id)})

            if (filteredResult.length !== selectionState.selectedIDs.length) {
                console.log(`Wrong number of ${selectionState.objectType}s for cluster ${selectionState.selectedIDs.length}: ${filteredResult.length}`)

                return
            }

            setAttributeSelectionList(Object.keys(filteredResult[0].attributes))

            const result = filteredResult.map((object) => { return object.attributes })

            setClusterAttributes(result)

            return
        }

        const id = selectionState.selectedIDs[0]

        const result = data.filter((object) => {return object.id === id})

        if (result.length === 0 || result.length > 1) {
            console.log(`Wrong number of nodes or edges with id ${id}: ${result.length}`)

            return
        }

        setAttributes(result[0].attributes)
    }, [graphState, selectionState])

    if (state === null || graphState == null || graphDispatch == null
        || selectionState == null || selectionDispatch === null) {
        console.log('Something is null!')
        return <></>
    }

    if (selectionState.selectedIDs.length === 0) {
        return (
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                }}
            >
                <Button disabled={true}>Nothing selected</Button>
            </div>
        )
    }

    if (hidden) {
        return (
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                }}
            >
                <Button onClick={() => {setHidden(false)}}>Show details</Button>
            </div>
        )
    }

    let tabContent = <></>

    if (selectionState.selectedIDs.length > 1) {
        tabContent = ClusterTab(attributeSelectionList, selectionState.objectType, selectionDispatch,
            clusterAttributes, selectedAttribute, setSelectedAttribute)
    } else {
        const id = selectionState.selectedIDs[0]

        let result: VisGraph.GraphNode[] | VisGraph.Edge[] = []

        if (selectionState.objectType === 'node') {
            result = graphState.nodes.data.filter((node) => {return node.id === id})
        }
        else if (selectionState.objectType === 'edge') {
            result = graphState.edges.data.filter((edge) => {return edge.id === id})
        }

        if (result === null || result.length === 0 || result.length > 1) {
            console.log(`Wrong number of nodes or edges with id ${id}: ${result.length}`)
            return <></>
        }

        tabContent = ObjectTab(result[0].id, selectionState.objectType, attributes, setAttributes, graphDispatch, graphState)
    }

    const header = selectionState.selectedIDs.length > 1 ?
        selectionState.objectType.charAt(0).toUpperCase() + selectionState.objectType.slice(1) + ' Cluster' : 'Details'

    return (
        <>
            <ResizeBar
                hidden={hidden}
                setHidden={setHidden}
                width={width}
                setWidth={setWidth}
                maxWidth={600}
                barWidth={20}
                minWidth={300}
                position={'right'}
            />
            <Container
                className="shadow bg-white"
                style={{
                    width: `${width}px`,
                    height: '100%',
                    top: '0',
                    right: '0',
                    position:'absolute',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                }}
                draggable={false}
            >
                <Row>
                    <Col md={{span: 9}}>
                        <h3>
                            {
                                header
                            }
                        </h3>
                    </Col>
                    <Col style={{
                        paddingLeft: 0
                    }}>
                        <Button
                            style={{
                                float: 'right',
                            }}
                            onClick={() => {setHidden(true)}}>Hide</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <hr/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {
                            tabContent
                        }
                    </Col>
                </Row>
            </Container>
        </>
    )
}
