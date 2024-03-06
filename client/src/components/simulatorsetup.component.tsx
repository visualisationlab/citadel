

/*
Author: Laurens Stuurman

Component for setting up default simulations : 

Component action flow : 

Click on Setup in Navigator -->

    Pop up simulator setup component --- Navigaotor resize to about 20%


*/


import React, { memo,useContext,useState, useEffect, useRef } from 'react'
import { Row, Col, Button,Container, InputGroup,Form} from 'react-bootstrap'

import {themeContext} from './darkmode.component'
import { SetupSimPopupMenuProps } from './main.component'


const SetupSimPopupMenu : React.FC<SetupSimPopupMenuProps> = memo(function setupSimPopupMenu(
    {setSimSetupVisible} : {setSimSetupVisible:React.Dispatch<React.SetStateAction<boolean>>}
    ) {
    let { theme } = useContext(themeContext)
    // const [isVisible, setIsVisible] = useState(false);

    let bgColor : string = theme === 'light' ? "shadow bg-white rounded" : "shadow bg-dark rounded";
    let button = theme === 'light'? 'primary' : 'secondary'

    return (
         <Container 
            className={bgColor}
            style={{
                // display:"none"
            }}>
                <h3 
                style={{padding:'2rem'}}
                > Simulation Setup </h3>
                <Row>
                    <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                        Number of steps till Kingpin Removal
                        </InputGroup.Text>
                        <Form.Control
                            defaultValue='1'
                            aria-label="Default"
                            aria-describedby="inputGroup-sizing-default"
                        />
                    </InputGroup>


                    </Col>
                </Row>
                <Row>
                    <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                        Number of steps till Conclave
                        </InputGroup.Text>
                        <Form.Control
                            defaultValue="10"
                            aria-label="Default"
                            aria-describedby="inputGroup-sizing-default"
                        />
                    </InputGroup>


                    </Col>
                </Row>
                <Row>
                    <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="inputGroup-sizing-default">
                        Total Number of steps
                        </InputGroup.Text>
                        <Form.Control
                            defaultValue='100'
                            aria-label="Default"
                            aria-describedby="inputGroup-sizing-default"
                        />
                    </InputGroup>


                    </Col>
                </Row>
                <Row style={{
                    paddingBottom:'1.5rem'
                }}>
                    <Col xs={{span:4, offset:0}}>
                    <Button variant="outline-danger"
                    onClick={() =>{
                        setSimSetupVisible(false)
                    }}
                    > Close </Button>
                    </Col>
                    <Col xs={{span:4 ,offset:4}}>
                    <Button
                    onClick={() =>{
                        setSimSetupVisible(false)
                    }}
                    > Start Simulation </Button>
                    </Col>
                </Row>

        </Container>
    )
})

export default SetupSimPopupMenu