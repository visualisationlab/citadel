import React, {useEffect, useReducer, createContext, Reducer, useState } from 'react'
import { Set, Map } from 'immutable'
import './home.component.css'

import Navigator from './navigator.component'
import Layout from './layout.component'

import { SessionDataReducer, SessionState, SessionReducer } from '../reducers/sessiondata.reducer'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction, SelectionDataState, SelectionDataReducer } from '../reducers/selection.reducer'
import { SelectedMappingsReducerAction, SelectedMappingsState, MappingChannel, MappingType, SelectedMappingsReducer } from '../reducers/selectedmappings.reducer'
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

export const MappingSettingsContext = createContext({
    mappingSettingsState: null as SelectedMappingsState | null,
    mappingSettingsDispatch: null as React.Dispatch<SelectedMappingsReducerAction> | null
})

export const SelectionDataContext = createContext({
    selectionState: null as SelectionDataState | null,
    selectionDispatch: null as React.Dispatch<SelectionDataReducerAction> | null
})

export default function Main() {
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

    let [mappingSettings, mappingSettingsDispatch] = useReducer<Reducer<SelectedMappingsState, SelectedMappingsReducerAction>>(SelectedMappingsReducer, Set<Map<string, any>>())

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

    let [selectionData, selectionDataDispatch] = useReducer(SelectionDataReducer, {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    })

    const [qrCode, setqrCode] = useState('')

    useEffect(() => {
        window.addEventListener('resize', () => {
            API.setWindowSize(window.innerWidth, window.innerHeight)
        })

        websocketService.checkConnection()

        Router.setup({
            sessionDataDispatch: sessionDataDispatch,
            graphDataDispatch: graphDataDispatch
        })

        QR.registerFun(setqrCode)



        API.setWindowSize(window.innerWidth, window.innerHeight)
    }, [])

    if (qrCode !== '') {
        return (
            <img style={{margin: '10px'}} src={qrCode} alt='QRcode'></img>
        )
    }

    return (
        <>
            <SelectionDataContext.Provider value={{ selectionState: selectionData, selectionDispatch: selectionDataDispatch}}>
                <MappingSettingsContext.Provider value={{ mappingSettingsState: mappingSettings, mappingSettingsDispatch: mappingSettingsDispatch}}>
                <GraphDataContext.Provider value={{ graphState: graphData, graphDispatch: graphDataDispatch }}>
                    <UserDataContext.Provider value={{ state: sessionData, dispatch: sessionDataDispatch}}>
                            <Navigator
                                disconnected = {sessionData.state === 'disconnected'}
                                // nodes={graphData.nodes}
                                // edges={graphData.edges}

                                // directed={graphData.directed}
                            />
                            <InspectionTab/>
                    </UserDataContext.Provider>
                    <Layout/>
                </GraphDataContext.Provider>
                </MappingSettingsContext.Provider>
            </SelectionDataContext.Provider>
        </>
    )
}
