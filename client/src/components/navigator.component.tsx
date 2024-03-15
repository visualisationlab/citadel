import React, {useState, memo, useEffect} from 'react'
import Toggle from "react-toggle";

import { Navbar, Container, Button, Row, Col, Nav } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab } from './simulate.component'
import SearchTab from './searchtab.component'
import {themeContext,Theme} from './darkmode.component'

import './home.component.css'
import { ResizeBar } from './inspection.component'

const Navigator = memo(function Navigator(
    {setSimSetupVisible} : {setSimSetupVisible:React.Dispatch<React.SetStateAction<boolean>>}
) {
    const [ hidden, setHidden ] = useState(false)
    const [ width, setWidth ] = useState(500)
    const [ activeTab, setActiveTab ] = useState('simulator')
    let { theme, setTheme } = React.useContext(themeContext)
    console.log(theme)
    console.log(setTheme)

    // // // check for them in locastorage : 
    // useEffect(() => {
    //     let storedTheme = localStorage.getItem('theme');
    //     let themeItem: Theme = 'dark'; // default value
        
    //     if (storedTheme === 'light' || storedTheme === 'dark') {
    //     //   storedTheme = themeItem as Theme;
    //       themeItem = storedTheme
    //       theme = storedTheme
    //     }
    //     console.log('theme in initial Naviagtor render',theme)
    // })
    const html = document.getElementsByTagName('html')[0]
    // localStorage.setItem('theme',theme)
    console.log('theme in toggleDarkmode',theme)
    if (html) {
    // Set data-bs-theme to dark
        html.setAttribute('data-bs-theme', theme)
    }


    const toggleTheme = () => {

        setTheme(prevTheme => prevTheme ===  'dark' ? 'light' : 'dark');

        console.log('thogling them',theme)
        const html = document.getElementsByTagName('html')[0]
        // localStorage.setItem('theme',theme)
        console.log('theme in toggleDarkmode',theme)
        if (html) {
        // Set data-bs-theme to dark
            html.setAttribute('data-bs-theme', theme)
        }

    }


    // const toggleDarkMode = () => {
    //     //toggleTheme()
    //     const html = document.getElementsByTagName('html')[0]
    //     // localStorage.setItem('theme',theme)
    //     console.log('theme in toggleDarkmode',theme)
    //     if (html) {
    //     // Set data-bs-theme to dark
    //         html.setAttribute('data-bs-theme', theme)
    //     }
    // }
    let buttonVariant = 'secondary'
    if (theme =='light'){
        buttonVariant = 'outline-primary'
    }

    if (hidden) {
        return (
            <Button
                variant={buttonVariant}
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
        case 'simulator':
            content = <SimulatorTab setSimSetupVisible={setSimSetupVisible}/>
            break
        case 'layouts':
            content = ''//<LayoutsTab setSimSetupVisible={setSimSetupVisible}/>
            break
        case 'search':
            content = <SearchTab />
            break
        case 'settings':
            content = <SessionTab />
            break
        case 'mapping':
            content = <MappingTab />
            break
    }

    let bgColor : string = theme === 'light' ? "shadow bg-white rounded" : "shadow bg-dark rounded";
    let button = theme === 'light'? 'primary' : 'secondary'

    return (
        <>
            <Container
                className={bgColor}
                style={{
                    // width: width + 'px',
                    height: '100%',
                    paddingTop: '10px',
                    // left: '10px',
                    // position:'absolute'
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
                                {/*Citadel*/}
                                <a href={process.env['REACT_APP_URL'] +':'+ process.env['REACT_APP_CLIENTPORT']}>
                                    <img
                                    width='20vw'
                                    src="https://chimay.science.uva.nl:8061/VisLablogo-cropped-notitle.svg"
                                    className="custom-logo"
                                    alt="Visualisation Lab"
                                    />
                                </a>

                            </Navbar.Brand>
                            <Nav activeKey={activeTab}>
                                {/* Set active */}

                                <Nav.Link eventKey={'simulator'} onClick={
                                    () => {
                                        setActiveTab('simulator')
                                    }
                                }>Simulator</Nav.Link>

                                <Nav.Link eventKey={'layouts'} onClick={
                                    () => {
                                        setActiveTab('layouts')
                                    }
                                }>Layouts</Nav.Link>

                                <Nav.Link eventKey={'search'} onClick={() => {
                                    setActiveTab('search')
                                }}>Search</Nav.Link>


                                <Nav.Link eventKey={'settings'} onClick={
                                    () => {
                                        setActiveTab('settings')
                                    }
                                }>Info</Nav.Link>

                                <Nav.Link eventKey={'mapping'} onClick={() => {
                                    setActiveTab('mapping')
                                }}>
                                    Costum Layout
                                </Nav.Link>

                                <Nav.Item>
                                    <Toggle
                                        checked={theme=='dark'}
                                        onChange={toggleTheme}
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
                        <Button 
                        variant={button}
                        style={{
                            float: 'right'
                        }}
                            onClick={() => {setHidden(true)}}>
                                Hide
                        </Button>
                    </Col>
                </Row>
                {content}

            </Container>
            {/* <ResizeBar
                hidden={hidden}
                setHidden={setHidden}
                width={width}
                setWidth={setWidth}
                position='left'
                maxWidth={800}
                barWidth={10}
                minWidth={500}
            /> */}

        </>
    )
})

export default Navigator
