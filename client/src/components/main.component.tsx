import React, {useEffect, useReducer, createContext, Reducer, useState } from 'react'
import { Set, Map } from 'immutable'
import './home.component.css'

import Navigator from './navigator.component'
import Layout from './layout.component'

import { SessionDataReducer, SessionState, SessionReducer } from '../reducers/sessiondata.reducer'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction, SelectionDataState, SelectionDataReducer } from '../reducers/selection.reducer'
import { MappingsReducer, MappingsReducerAction, MappingsState } from '../reducers/selectedmappings.reducer'

import { websocketService } from '../services/websocket.service'

import { Router } from './router.component'

import { QR } from '../services/qrcode.service'

import { API } from '../services/api.service'

import InspectionTab from './inspection.component'

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

export default function Main() {
    let [mappingsState, mappingsDispatch] = useReducer<Reducer<MappingsState, MappingsReducerAction>>(MappingsReducer,
        {
            schemes: Map<string, number[]>().set('Default', [0, 50, 100, 200, 250]),
            config: Map(),
            selectedMappings: Set()
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
        directed: false
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
    }, [])

    // If we have a QR code, display it.
    if (qrCode !== '') {
        return (
            <img style={{margin: '10px'}} src={qrCode} alt='QRcode'></img>
        )
    }

    return (
        <>
            <SelectionDataContext.Provider value={{ selectionState: selectionData, selectionDispatch: selectionDataDispatch}}>
            <MappingContext.Provider value={{ mappingsState: mappingsState, mappingsDispatch: mappingsDispatch}}>
            <GraphDataContext.Provider value={{ graphState: graphData, graphDispatch: graphDataDispatch }}>
                <UserDataContext.Provider value={{ state: sessionData, dispatch: sessionDataDispatch}}>
                        <Navigator disconnected = {sessionData.state === 'disconnected'}/>
                        <InspectionTab/>
                </UserDataContext.Provider>

                <Layout/>
            </GraphDataContext.Provider>
            </MappingContext.Provider>
            </SelectionDataContext.Provider>
        </>
    )
}
