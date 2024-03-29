import React, {useState, memo} from 'react'
import { Navbar, Container, Collapse, Button, Row, Col, Nav } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab } from './simulate.component'
import SearchTab from './searchtab.component'
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
    const [ activeTab, setActiveTab ] = useState('mapping')

    if (hidden) {
        return (
            <Button
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

    let content = <></>

    switch (activeTab) {
        case 'mapping':
            content = <MappingTab />
            break
        case 'search':
            content = <SearchTab />
            break
        case 'simulator':
            content = <SimulatorTab />
            break
        case 'settings':
            content = <SessionTab />
            break
    }

    return (
        <>
            <Container
                className="shadow bg-white"
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
                    <Col
                    onDragStart={(e) => { e.preventDefault() }}
                    draggable={false}
                    >
                        <Navbar
                            style={{
                                paddingTop: '0px',
                            }}
                        >
                            <Navbar.Brand>
                                Citadel
                            </Navbar.Brand>
                            <Nav activeKey={activeTab}>
                                {/* Set active */}
                                <Nav.Link eventKey={'mapping'} onClick={() => {
                                    setActiveTab('mapping')
                                }}>
                                    Mapping
                                </Nav.Link>
                                <Nav.Link eventKey={'search'} onClick={() => {
                                    setActiveTab('search')
                                }}>Search</Nav.Link>
                                <Nav.Link eventKey={'simulator'} onClick={
                                    () => {
                                        setActiveTab('simulator')
                                    }
                                }>Simulator</Nav.Link>
                                <Nav.Link eventKey={'settings'} onClick={
                                    () => {
                                        setActiveTab('settings')
                                    }
                                }>Settings</Nav.Link>
                            </Nav>
                        </Navbar>
                    </Col>
                    <Col style={{
                        paddingBottom: '10px',

                    }}>
                        <Button style={{
                            float: 'right'
                        }}
                            onClick={() => setHidden(true)}>
                                Hide
                        </Button>
                    </Col>
                </Row>
                {content}

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
