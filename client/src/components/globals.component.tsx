import Fuse from 'fuse.js'
import { useContext, useEffect, useState } from 'react'

import { Button, Container, Row, Col, Stack, Form } from 'react-bootstrap'
import { API } from '../services/api.service'
import { UserDataContext } from './main.component'

export default function Globals() {
    const [hidden, setHidden] = useState(true)
    const [showHidden, setShowHidden] = useState(false)
    let [query, setQuery] = useState('')
    let [searchResult, setSearchResult] = useState<{parents: string[], data: string[]}>(
        {parents: [], data: []})

    // Get graph state context
    const { state } = useContext(UserDataContext)

    // const testGlobals: GlobalsType = {
    //     "general": {
    //         "edgeType": "directed",
    //     },
    //     "Kingpin Simulator": {
    //         "delta": 8,
    //         "kingpin_threshold": 0.5,
    //         "_iterator": 3
    //     },
    //     "Custom Layout Generator": {
    //         "convergence": 0.01,
    //     }
    // }

    useEffect(() => {
        if (!state)
            return

            const parents = Object.keys(state.globals)
            const data = parents.map((parent) => {
                return Object.keys(state.globals[parent])
            }).flat()

            if (query.length > 0) {
                const options = {
                    // Search in dataset
                    // keys: ['id'],
                    shouldSort: false,
                    threshold: 0.1,
                    // useExtendedSearch: true
                }

                let parentsFuse = new Fuse(parents, options)
                let dataFuse = new Fuse(data, options)

                setSearchResult({
                    parents: parentsFuse.search(query).map((result) => {
                        return result.item
                    }
                    ),
                    data: dataFuse.search(query).map((result) => {
                        return result.item
                    }
                    )
                })
            } else {
                setSearchResult({
                    parents: parents,
                    data: data
                })
            }
    }, [query, state?.globals, state])

    if (!state) {
        return <></>
    }

    if (hidden) {
        return (
            <Button
                onClick={() => setHidden(false)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    // Place in the middle of the screen
                    left: 'calc(50vw - 50px)',
                    zIndex: 1000
                }}
            >
                Show Globals {state.globalsGeneratedOn !== state.graphIndex ? '⚠️' : ''}
            </Button>
        )
    }

    return (
        <Container
            className="shadow bg-white"
            style={{
                width: '500px',
                height: '80vh',
                paddingTop: '10px',
                left: 'calc(50vw - 250px)',
                position: 'absolute',
                zIndex: 1000
            }}
            draggable={false}

        >
            <Row>
                <Col md={{span: 9}}>
                    <h3>
                        {
                            'Graph Globals'
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
                    {state.globalsGeneratedOn !== state.graphIndex && (
                        <p style={{
                            color: 'red'
                        }}>
                            ⚠️ Globals are from slice {state.globalsGeneratedOn + 1}. Please update them to reflect the current graph.
                        </p>
                    )
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                    <hr></hr>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={
                            (e) => {
                                setQuery(e.target.value)
                            }
                        }
                    />
                </Col>
                <Col>
                    {/* Show checkbox for hidden attributes */}
                    <Form.Check
                        style={{
                            float: 'right',
                            paddingTop: '8px'
                        }}
                        type="checkbox"
                        label="Show hidden attributes"
                        checked={showHidden}
                        onChange={
                            (e) => {
                                setShowHidden(e.target.checked)
                            }
                        }
                    />
                </Col>
            </Row>
            <Row>
                <Col

                    style={{
                        overflowY: 'auto',
                        height: 'calc(80vh - 150px)',
                        marginTop: '10px'
                    }}
                >
                    <Stack>
                        {
                            Object.keys(state.globals).map((global, pindex) => {
                                const values = Object.keys(state.globals[global.toString()]).filter(
                                    (key) => {
                                        if (key.charAt(0) === '_' && !showHidden) {
                                            return false
                                        }
                                        if (query.length > 0) {
                                            return searchResult.data.includes(key)
                                        }
                                        return true
                                    }
                                ).map((key, index) => {
                                    return (
                                        <Row key={index.toString() + pindex.toString()}>
                                            <Col md={{span: 4}}>
                                                <Form.Label>
                                                    {
                                                        key.charAt(0) === '_' ? <i>{key.slice(1)}</i> : key
                                                    }
                                                </Form.Label>
                                            </Col>
                                            <Col md={{span: 8}}>
                                                <Form.Control
                                                    type="text"
                                                    maxLength={50}
                                                    value={state.globals[global.toString()][key]}
                                                    onChange={(e) => {
                                                        API.editGlobal(global, key, e.target.value)
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    )
                                })

                                return (
                                    <Stack
                                        key={pindex.toString()}
                                        style={{
                                            marginBottom: '10px'
                                        }}
                                    >
                                        <h6>{global}</h6>
                                        {values}
                                    </Stack>
                                )
                            })
                        }
                    </Stack>
                </Col>
            </Row>
        </Container>
    )
}
