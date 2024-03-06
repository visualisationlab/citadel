// Imports
import React, {useEffect, useReducer, createContext, Reducer, useState } from 'react'
import { Set, Map } from 'immutable'
import './home.component.css'

import { Container,Col,Row } from 'react-bootstrap'
import Navigator from './navigator.component'
import SetupSimPopupMenu from './simulatorsetup.component'
import PreProcess from './preprocess.component'
import { DisplaySigmaGraph } from './sigmagraph.component'

import { SessionDataReducer, SessionState, SessionReducer } from '../reducers/sessiondata.reducer'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction, SelectionDataState, SelectionDataReducer } from '../reducers/selection.reducer'
import { MappingsReducer, MappingsReducerAction, MappingsState } from '../reducers/selectedmappings.reducer'
import { GlobalSettingsReducer, GlobalSettingsState, GlobalSettingsReducerAction } from '../reducers/globalsettings.reducer'
import {themeContext,Theme} from './darkmode.component'

import { websocketService } from '../services/websocket.service'

import { Router } from './router.component'

import { QR } from '../services/qrcode.service'

import { API } from '../services/api.service'

import InspectionTab from './inspection.component'
import Globals from './globals.component'

export const UserDataContext = createContext({
    state: null as SessionState | null,
    dispatch: null as React.Dispatch<SessionReducer> | null
})

export const GraphDataContext = createContext({
    graphState: null as GraphDataState | null,
    graphDispatch: null as React.Dispatch<GraphDataReducerAction> | null
})

export const MappingContext = createContext({
    mappingsState: null as MappingsState | null,
    mappingsDispatch: null as React.Dispatch<MappingsReducerAction> | null
})

export const SelectionDataContext = createContext({
    selectionState: null as SelectionDataState | null,
    selectionDispatch: null as React.Dispatch<SelectionDataReducerAction> | null
})

export const GlobalSettingsContext = createContext({
    globalSettingsState: null as GlobalSettingsState | null,
    globalSettingsDispatch: null as React.Dispatch<GlobalSettingsReducerAction> | null
})

export interface SetupSimPopupMenuProps {
    setSimSetupVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }

export default function Main() {
    let currentTheme: Theme = localStorage.getItem('theme') as Theme || 'dark';

    let [theme, setTheme] = useState<Theme>(currentTheme);
    const [simSetupVisible, setSimSetupVisible] = useState(false);


    let [mappingsState, mappingsDispatch] = useReducer<Reducer<MappingsState, MappingsReducerAction>>(MappingsReducer,
        {
            // Add default colour scheme
            schemes: Map({
            'default': [
                0, 32, 52, 120, 204, 276
            ]
            }),
            config: Map(),
            selectedMappings: Set()
        })

    let [selectionData, selectionDataDispatch] = useReducer(SelectionDataReducer, {
        selectedIDs: [],
        objectType: 'node',
        selectionMode: 'single'
    })

    let [sessionData, sessionDataDispatch] = useReducer(SessionDataReducer, {
        globals: {},
        globalsGeneratedOn: 0,
        currentLayout: null,
        userName: '',
        users: [],
        expirationDate: new Date(),
        graphURL: '',
        sid: '',
        layouts: [],
        state: 'idle',
        simulators: [],
        graphIndex: 0,
        graphIndexCount: 1,
        simState: {
            step: 0,
            stepMax: 0,
            name: ''
        },
        websocketPort: '3000',
        sessionURL: '',
        headsets: [],
        playmode: false
    })

    let [graphData, graphDataDispatch] = useReducer<Reducer<GraphDataState, GraphDataReducerAction>>(GraphDataReducer, {
        nodes: {
            data: [],
            metadata: {}
        },
        edges: {
            data: [],
            metadata: {}
        },
        directed: false,
        globals: {}
    })

    let [globalSettingsState, globalSettingsDispatch] = useReducer<Reducer<GlobalSettingsState, GlobalSettingsReducerAction>>(GlobalSettingsReducer, {
        selectionHighlight: 'transparency',
        textScale: 1,
        stateStack: []
    })

    const [qrCode, setqrCode] = useState('')

    useEffect(() => {
        // Update remote window size on resize.
        window.addEventListener('resize', () => {
            API.setWindowSize(window.innerWidth, window.innerHeight)
        })

        // Check if we are connected to a remote.
        websocketService.checkConnection()

        // Give router access to dispatchers.
        Router.setup({
            sessionDataDispatch: sessionDataDispatch,
            graphDataDispatch: graphDataDispatch,
            selectionDataDispatch: selectionDataDispatch,
        })

        // Set up QR code service.
        QR.registerFun(setqrCode)

        // Communicate window size to remote.
        API.setWindowSize(window.innerWidth, window.innerHeight)

        let schemes = Map<string, number[]>()

        // Load colour schemes from localstorage.
        try {
            schemes = Map(JSON.parse(localStorage.getItem('schemes') || ''))

            // Combine with default schemes.
            schemes = schemes.merge(mappingsState.schemes)
            console.log("loaded schemes from localstorage")

            mappingsDispatch({
                type: 'scheme',
                action: 'load',
                state: schemes
            })

        } catch (e) {
            console.log('failed to load schemes from localstorage')
            console.log(e)
        }

        // Load config from localstorage.
        try {
            let config = JSON.parse(localStorage.getItem('config') || '')

            console.log("loaded config from localstorage")

            globalSettingsDispatch({
                type: 'settingsLoaded',
                payload: { value: config }
            })
        } catch (e) {
            console.log('failed to load config from localstorage')
            console.log(e)
        }

        // let storedTheme = localStorage.getItem('theme');
        // //let themeItem: Theme = 'dark'; // default value
        
        // if (storedTheme === 'light' || storedTheme === 'dark') {
        //     console.log('gettting theme from localstorage:',storedTheme)

        // //   storedTheme = themeItem as Theme;
        //     //themeItem = storedTheme
        //     //theme = storedTheme
        // }
        console.log('theme in initial Naviagtor render',theme)


    }, [])

    // If we have a QR code, display it.
    if (qrCode !== '') {
        return (
            <img style={{margin: '10px'}} src={qrCode} alt='QRcode'></img>
        )
    }

    console.log('theme about to given to context provider : ',theme)

    return (
        <>
            <themeContext.Provider value={{ theme, setTheme }}>
            <GlobalSettingsContext.Provider value={{ globalSettingsState: globalSettingsState, globalSettingsDispatch: globalSettingsDispatch}}>
            <SelectionDataContext.Provider value={{ selectionState: selectionData, selectionDispatch: selectionDataDispatch}}>
            <MappingContext.Provider value={{ mappingsState: mappingsState, mappingsDispatch: mappingsDispatch}}>
            <GraphDataContext.Provider value={{ graphState: graphData, graphDispatch: graphDataDispatch }}>
                <UserDataContext.Provider value={{ state: sessionData, dispatch: sessionDataDispatch}}>
                    <Container fluid>
                    <DisplaySigmaGraph/>

                        {/* <Row>

                            // {/* <Col xs={3} className="pe-1">
                            //     <Navigator disconnected = {sessionData.state === 'disconnected'}/>
                            // </Col> */}
                            {/* <Col xs={{span:8, offset:4}} className="ps-0 pe-0">
                            </Col> */}
                            {/* 
                            <Globals/>
                            <InspectionTab/> */}
                            {/* <PreProcess/> */}
                        {/* </Row>  */}
                    </Container>
                    <Container fluid className="overlay-side-menu">
                        {/* <Row>
                            <Col xs={4} className="pe-1 pt-3 pb-3"> */}
                            {/* <Container className=""> */}
                                <Navigator setSimSetupVisible={setSimSetupVisible}/>
                            {/* </Container> */}
                            {/* </Col> */}
                            {/* <Col xs={9} className="ps-0 pe-0">
                                <DisplaySigmaGraph/>
                            </Col> */}
                            {/* 
                            <Globals/>
                            <InspectionTab/> */}
                            {/* <PreProcess/> */}
                        {/* </Row> */}
                    </Container>
                    <Container fluid className="overlay-middle-menu">
                        {simSetupVisible && <SetupSimPopupMenu setSimSetupVisible={setSimSetupVisible}/>}
                    </Container>
                </UserDataContext.Provider>

            </GraphDataContext.Provider>
            </MappingContext.Provider>
            </SelectionDataContext.Provider>
            </GlobalSettingsContext.Provider>
            </themeContext.Provider>

        </>
    )
}
