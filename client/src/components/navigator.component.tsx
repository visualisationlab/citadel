import React, {useState, memo} from 'react'
import { Tabs, Tab, Container, Collapse, Button, Row, Col } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab } from './simulate.component'
import ObjectListTab from './objectlist.component'
import { VisGraph } from '../types'

import { Simulator } from '../reducers/sessiondata.reducer'

import { GrCircleAlert } from 'react-icons/gr'

import './home.component.css'
import { ResizeBar } from './inspection.component'

interface NavigatorProps {
    disconnected: boolean
}

const Navigator = memo(function Navigator(
    props: NavigatorProps) {

    const [ hidden, setHidden ] = useState(false)
    const [ width, setWidth ] = useState(500)

    if (hidden) {
        return (
            <Button
                variant="outline-primary"
                onClick={() => setHidden(false)}
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 1000
                }}
            >
                Show Navigator
            </Button>
        )
    }

    return (
        <>
            <Container
                className="shadow bg-white rounded"
                style={{
                    width: width + 'px',
                    height: '100vh',
                    paddingTop: '10px',
                    // left: '10px',
                    position:'absolute'
                }}
                draggable={false}
                >
                <Row>
                    <Col md={{offset: 10, span: 2}}>
                        <Button
                            variant="outline-primary"
                            onClick={() => setHidden(true)}
                            >
                                -
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col
                    onDragStart={(e) => { e.preventDefault() }}
                    draggable={false}
                    >
                        <Tabs
                            defaultActiveKey={'Mapping'}
                            id="navigator"
                            // @ts-ignore
                            justify

                        >
                            <Tab
                                eventKey='Mapping'
                                title='Mapping'
                            >
                                <MappingTab />
                            </Tab>
                            {/* <Tab eventKey='Filter' title='Filter'>

                            </Tab> */}
                            <Tab eventKey='Simulate' title='Simulate'>
                                <SimulatorTab />
                            </Tab>
                            <Tab eventKey='Search' title='Search'>
                                <ObjectListTab />
                            </Tab>
                            <Tab eventKey='Session' title={props.disconnected ? <GrCircleAlert></GrCircleAlert> : 'Session'} >
                                <SessionTab />
                            </Tab>
                        </Tabs>
                    </Col>

                </Row>
            </Container>
            <ResizeBar
                hidden={hidden}
                setHidden={setHidden}
                width={width}
                setWidth={setWidth}
                position='left'
                maxWidth={800}
                barWidth={10}
                minWidth={500}
            />

        </>
    )
})

export default Navigator
