import React, {useState, memo} from 'react'
import Toggle from "react-toggle";

import { Navbar, Container, Button, Row, Col, Nav } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab } from './simulate.component'
import SearchTab from './searchtab.component'
import {themeContext,Theme} from './darkmode.component'

import './home.component.css'
import { ResizeBar } from './inspection.component'

const Navigator = memo(function Navigator() {
    const [ hidden, setHidden ] = useState(false)
    const [ width, setWidth ] = useState(500)
    const [ activeTab, setActiveTab ] = useState('mapping')
    let { theme, setTheme } = React.useContext(themeContext)

    // check for them in locastorage : 
    let storedTheme = localStorage.getItem('theme');
    let themeItem: Theme = 'dark'; // default value
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
    //   storedTheme = themeItem as Theme;
      themeItem = storedTheme
      theme = storedTheme
    }


    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme ===  'dark' ? 'light' : 'dark');
    }


    const toggleDarkMode = () => {
        toggleTheme()
        const html = document.getElementsByTagName('html')[0]
        // localStorage.setItem('theme',theme)
        console.log('theme in toggleDarkmode',theme)
        if (html) {
        // Set data-bs-theme to dark
            html.setAttribute('data-bs-theme', theme)
        }
    }

    if (hidden) {
        return (
            <Button
                onClick={() => {setHidden(false)}}
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
                                <Nav.Item>
                                    <Toggle
                                        checked={theme=='light'}
                                        onChange={toggleDarkMode}
                                        icons={{ unchecked: "🌙", checked: "🔆" }}
                                        aria-label="Dark mode toggle"
                                    />
                                </Nav.Item>
                            </Nav>
                        </Navbar>
                    </Col>
                    <Col style={{
                        paddingBottom: '10px',

                    }}>
                        <Button style={{
                            float: 'right'
                        }}
                            onClick={() => {setHidden(true)}}>
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
