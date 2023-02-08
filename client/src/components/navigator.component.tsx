import React, {useState, memo} from 'react'
import { Tabs, Tab, Container, Collapse, Button } from 'react-bootstrap'
import MappingTab from './mapping.component'
import SessionTab from './session.component'
import { SimulatorTab } from './simulate.component'
import ObjectListTab from './objectlist.component'
import { VisGraph } from '../types'

import { Simulator } from '../reducers/sessiondata.reducer'

import { GrCircleAlert } from 'react-icons/gr'

import './home.component.css'

interface NavigatorProps {
    disconnected: boolean
}

const Navigator = memo(function Navigator(
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
                    <SimulatorTab />
                </Tab>
                {/* <Tab eventKey='Search' title='Search'>
                    <ObjectListTab />
                </Tab> */}
                <Tab eventKey='Session' title={props.disconnected ? <GrCircleAlert></GrCircleAlert> : 'Session'} >
                    <SessionTab />
                </Tab>
            </Tabs>
        </Container>
    )
})

export default Navigator
