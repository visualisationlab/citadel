import React, { useContext, useEffect, useState } from 'react'
import { Container, Form, Button, Tabs, Tab, Row, Col, Dropdown, Stack, Nav } from 'react-bootstrap'

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
    BarElement,
} from 'chart.js'

import Annotation from 'chartjs-plugin-annotation'

import { Bar, Scatter, Line, Bubble } from 'react-chartjs-2'

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
    Legend,
    Annotation

)

function ClusterTab(
        attributeSelectionList: string[],
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
            position: 'top' as const,
            },
        },
    }
    let clusterStatistics = <></>
    // If all attributes are numeric, then we can do some statistics
    if (attributeList.every((attribute) => {
        return !isNaN(Number(attribute))
    })) {
        let vals = attributeList.map((e) => {return parseInt(e)})
        clusterStatistics = (
            <Col>
                <p>Min: {min(vals)}</p>
                <p>Max: {max(vals)}</p>
                <p>Mean: {mean(vals)}</p>
                <p>Median: {median(vals)}</p>
            </Col>
        )
    }

    return (
        <Tab eventKey='Cluster' title={`Cluster (Count: ${attributeList.length})`}>
            <Row>
                <Col>
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
                </Col>
            </Row>
            <Row>
                {clusterStatistics}
            </Row>
            <Row>
                <Col>
                    <Bar options={options} data={data}/>
                </Col>
            </Row>
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
        <Stack>
            <h4>
                Node ID
            </h4>
            <p>{id}</p>

            <h4>Attributes</h4>
            <Stack gap={3}>
                <div
                    style={{
                        overflowY: 'auto',
                        maxHeight: '70vh',
                    }}
                >
                    <Stack gap={3}>
                        {
                            Object.keys(attributes).map((key) => {
                                return (
                                    <Tab.Container id='inspect' defaultActiveKey='edit'>
                                        <Stack gap={2}>
                                            <Nav variant='pills' className='flex-row'>
                                                <Nav.Item>
                                                    <Nav.Link eventKey='none' disabled>
                                                        {key}
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey='edit'>
                                                        edit
                                                    </Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey='dynamics'>
                                                        dynamics
                                                    </Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                            <Tab.Content>
                                                <Tab.Pane eventKey='edit'>

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

                                                        placeholder={attributes[key]}
                                                    />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey='dynamics'>
                                                    {
                                                        CategoricalClusterDynamicsChart(8,
                                                            new Set<string>(['yes', 'no', 'maybe']),
                                                            Array.from({length: 40},
                                                                () => (Math.random()) > 0.5 ? 'yes' : 'no')
                                                            )
                                                    }
                                                    {/* {
                                                        OrderedDynamicsChart(
                                                            8,
                                                            0,
                                                            1,
                                                            Array.from({length: 40},
                                                                () => (Math.random()))
                                                            )
                                                    } */}
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Stack>
                                    </Tab.Container>
                                )
                            })
                        }
                    </Stack>
                </div>
                <Row>
                    <Col>
                        <Button variant='outline-danger'
                            onClick={() => {
                                API.removeNode(id, graphState)
                            }}>
                            Remove Node
                        </Button>
                    </Col>
                    <Col>
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
            </Stack>
        </Stack>
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
                    right: (props.position === 'right') ? 0 : -10,
                    width: 10,
                    height: '100%',
                    zIndex: 1000,
                    backgroundColor: 'white',
                    borderLeft: '1px solid #e0e0e0',
                    cursor: dragging ? 'grabbing' : 'grab',
                }}
            />
        </div>
    )
}

function CategoricalClusterDynamicsChart(
    currentGraphIndex: number,
    stateSet: Set<string>,
    states: {[attribute: string]: number}[],
): JSX.Element {
    const options = {
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: states.length,
                title: {
                    display: true,
                    text: 'Graph Index'
                },
                ticks: {
                    stepSize: 1,
                },
            },
            y: {
                type: 'category',
                labels: Array.from(stateSet),
                title: {
                    display: true,
                    text: 'Values'
                }
            },
        },
        plugins: {
            legend: {
                display: false
            },
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: currentGraphIndex,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                        content: 'Current Graph',
                        enabled: true,
                        position: 'top',
                        backgroundColor: 'red',
                        color: 'white',
                        yAdjust: -10,
                    }
                }]
            }
        }
    }

    return <Bubble
        data={{
            datasets: [{
                data: states.map((state: {[attribute: string]: number}, index) => {
                    return {
                        x: index,
                        y: state,
                        r: 5
                    }
                }),
                backgroundColor: states.map((state, index) => {
                    return index === currentGraphIndex ? 'red' : 'blue'
                }),
            }]
        }}

        // @ts-ignore
        options={options}
    />
}

function OrderedDynamicsChart(
    currentGraphIndex: number,
    min: number,
    max: number,
    states: number[],
) : JSX.Element {
    const options = {
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: states.length,
                title: {
                    display: true,
                    text: 'Graph Index'
                },
                ticks: {
                    stepSize: 1,
                }
            },
            y: {
                type: 'linear',
                min: min,
                max: max,
                title: {
                    display: true,
                    text: 'Values'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: currentGraphIndex,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                        content: 'Current Graph',
                        enabled: true,
                        position: 'top',
                        backgroundColor: 'red',
                        color: 'white',
                        yAdjust: -10,
                    }
                }]
            }
        }
    }

    const data = {
        labels: states.map((_, i) => i),
        datasets: [{
            data: states,
            backgroundColor: states.map((state, index) => {
                return index === currentGraphIndex ? 'red' : 'blue'
            }),
            // Set fill opacity
            borderColor: 'lightblue'


        }],

    }

    return (
        // @ts-ignore
        <Line data={data} options={options} />
    )
}


// Takes an attribute and an array of states and graphs the states on the y axis
// and the index of the state in the array on the x axis
function CategoricalDynamicsChart(
    currentGraphIndex: number,
    stateSet: Set<string>,
    states: string[],
): JSX.Element {
    const options = {
        scales: {
            x: {
                type: 'linear',
                min: 0,
                max: states.length,
                title: {
                    display: true,
                    text: 'Graph Index'
                },
                ticks: {
                    stepSize: 1,

                },
            },
            y: {
                type: 'category',
                labels: Array.from(stateSet),
                title: {
                    display: true,
                    text: 'Values'
                }
            },
        },
        plugins: {
            legend: {
                display: false
            },
            annotation: {
                annotations: [{
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: currentGraphIndex,
                    borderColor: 'red',
                    borderWidth: 2,
                    label: {
                        content: 'Current Graph',
                        enabled: true,
                        position: 'top',
                        backgroundColor: 'red',
                        color: 'white',
                        yAdjust: -10,
                    }
                }]
            }
        }
    }

    return <Scatter
        data={{
            datasets: [{
                data: states.map((state, index) => {
                    return {
                        x: index,
                        y: state
                    }
                }),
                backgroundColor: states.map((state, index) => {
                    return index === currentGraphIndex ? 'red' : 'blue'
                }),
            }]
        }}

        // @ts-ignore
        options={options}
    />
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

        if (selectionState.selectedNodes.length === 0
            && selectionState.selectedEdges.length === 0) {

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
                        <Tab eventKey='Hide' title='Hide'>
                        </Tab>
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
                    className="shadow bg-white rounded"
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
                        <Col>
                            <h2>
                                Attributes
                            </h2>
                        </Col>
                        <Col>
                            <Button onClick={() => {setHidden(true)}}>Hide</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {
                                NodeTab(node.id, attributes, setAttributes, graphDispatch, graphState)
                            }
                        </Col>
                    </Row>
                </Container>
            </>
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
        <>
            <Container
                className="shadow bg-white rounded"
                style={{
                    width: '400px',
                    padding: '0px',
                    top: '50px',
                    right: '50px',
                    position:'absolute',
                }}>
                <Tabs >
                    <Tab eventKey='Edge' title='Edge'>
                        {EdgeTab(edge.id, edge.source, edge.target, attributes, setAttributes, graphDispatch, graphState)}
                    </Tab>
                </Tabs>
            </Container>
        </>
    )
}
