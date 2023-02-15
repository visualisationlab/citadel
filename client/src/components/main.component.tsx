import React, {useEffect, useReducer, createContext, Reducer, useState } from 'react'
import { Set, Map } from 'immutable'
import './home.component.css'

import Navigator from './navigator.component'
import Layout from './layout.component'
import InspectionTab from './inspection.component'
import Notifications from './notifications.component'

import { SessionDataReducer, SessionState, SessionReducer } from '../reducers/sessiondata.reducer'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction, SelectionDataState, SelectionDataReducer } from '../reducers/selection.reducer'
import { MappingsReducer, MappingsReducerAction, MappingsState } from '../reducers/selectedmappings.reducer'
import { GlobalSettingsReducer, GlobalSettingsState, GlobalSettingsReducerAction } from '../reducers/globalsettings.reducer'


import { websocketService } from '../services/websocket.service'

import { Router } from './router.component'

import { QR } from '../services/qrcode.service'

import { API } from '../services/api.service'


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

export default function Main() {
    let [mappingsState, mappingsDispatch] = useReducer<Reducer<MappingsState, MappingsReducerAction>>(MappingsReducer,
        {
            schemes: Map(),
            config: Map(),
            selectedMappings: Set(),
            notification: null
        })

    let [selectionData, selectionDataDispatch] = useReducer(SelectionDataReducer, {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    })

    let [sessionData, sessionDataDispatch] = useReducer(SessionDataReducer, {
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
            stepMax: 0
        },
        websocketPort: '3000',
        sessionURL: '',
        headsets: [],
        playmode: false,
        notification: null
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
        directed: false
    })

    let [globalSettingsState, globalSettingsDispatch] = useReducer<Reducer<GlobalSettingsState, GlobalSettingsReducerAction>>(GlobalSettingsReducer, {
        selectionHighlight: 'transparency',
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
            graphDataDispatch: graphDataDispatch
        })

        // Set up QR code service.
        QR.registerFun(setqrCode)

        // Communicate window size to remote.
        API.setWindowSize(window.innerWidth, window.innerHeight)

        let schemes = Map<string, number[]>()

        // Load colour schemes from localstorage.
        try {
            schemes = Map(JSON.parse(localStorage.getItem('schemes') || ''))

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
    }, [])

    // If we have a QR code, display it.
    if (qrCode !== '') {
        return (
            <img style={{margin: '10px'}} src={qrCode} alt='QRcode'></img>
        )
    }

    return (
        <>
            <GlobalSettingsContext.Provider value={{ globalSettingsState: globalSettingsState, globalSettingsDispatch: globalSettingsDispatch}}>
            <SelectionDataContext.Provider value={{ selectionState: selectionData, selectionDispatch: selectionDataDispatch}}>
            <MappingContext.Provider value={{ mappingsState: mappingsState, mappingsDispatch: mappingsDispatch}}>
            <GraphDataContext.Provider value={{ graphState: graphData, graphDispatch: graphDataDispatch }}>
                <UserDataContext.Provider value={{ state: sessionData, dispatch: sessionDataDispatch}}>
                        <Navigator disconnected = {sessionData.state === 'disconnected'}/>
                        <InspectionTab/>
                        <Notifications/>
                </UserDataContext.Provider>

                <Layout/>
            </GraphDataContext.Provider>
            </MappingContext.Provider>
            </SelectionDataContext.Provider>
            </GlobalSettingsContext.Provider>
        </>
    )
}
