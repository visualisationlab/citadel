import React, {useState} from 'react'
import { Tabs, Tab, Container, Collapse, Button } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab, Simulator} from './simulate.component'
import InspectTab from './inspect.component'
import { VisGraph } from '../types'

import './home.component.css'

interface NavigatorProps {
    simulators: Simulator[]
}

export default function Navigator(
    props: NavigatorProps) {

    return (
        <Container className="shadow bg-white rounded" style={{width: '600px',
        padding: '0px', top: '50px',
        left: '50px',
        position:'absolute'}}>
            <Tabs
                defaultActiveKey={'Mapping'}
                id="navigator"
                // @ts-ignore
                justify
            >
                <Tab eventKey='Mapping' title='Mapping'>
                    <MappingTab />
                </Tab>
                {/* <Tab eventKey='Filter' title='Filter'>

                </Tab> */}
                <Tab eventKey='Simulate' title='Simulate'>
                    <SimulatorTab simulators={props.simulators} />
                </Tab>
                <Tab eventKey='Search' title='Search'>
                    <InspectTab />
                </Tab>
                <Tab eventKey='Session' title='Session'>
                    <SessionTab />
                </Tab>
            </Tabs>
        </Container>
    )
}
