import React, {useEffect, useState, useReducer, createContext, Reducer } from 'react'
import { VisGraph } from '../types'

import { Button } from 'react-bootstrap'
import './home.component.css'

import Navigator from './navigator.component'
import Layout from './layout.component'

import { SessionDataReducer, SessionState, SessionReducer } from '../reducers/sessiondata.reducer'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import { SelectionDataReducerAction, SelectionDataState, SelectionDataReducer } from '../reducers/selection.reducer'

import { websocketService } from '../services/websocket.service'

import { Router } from './router.component'

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

export const SelectionDataContext = createContext({
    selectionState: null as SelectionDataState | null,
    selectionDispatch: null as React.Dispatch<SelectionDataReducerAction> | null
})

export default function Main() {
    let [sessionData, sessionDataDispatch] = useReducer(SessionDataReducer, {
        userName: '',
        users: [],
        expirationDate: new Date(),
        graphURL: '',
        sid: '',
        layouts: []
    })

    let [graphData, graphDataDispatch] = useReducer<Reducer<GraphDataState, GraphDataReducerAction>>(GraphDataReducer, {
        nodes: {
            data: [],
            mapping: {
                generators: {
                    'colour': {fun: 'linearmap', attribute: '', data: {}},
                    'radius': {fun: 'linearmap', attribute: '', data: {}},
                    'alpha': {fun: 'linearmap', attribute: '', data: {}},
                    'shape': {fun: 'linearmap', attribute: '', data: {}},
                },

                settings: {
                    colours: [],
                    minRadius: 16,
                    maxRadius: 32
                }
            }
        },
        edges: {
            data: [],
            mapping: {

                generators: {
                    'colour': {fun: 'linearmap', attribute: '', data: {}},
                    'alpha': {fun: 'linearmap', attribute: '', data: {}},
                    'width': {fun: 'linearmap', attribute: '', data: {}},
                },
                settings: {
                    colours: [],
                    minWidth: 1,
                    maxWidth: 4
                }
            },

        },
        directed: false
    })

    let [selectionData, selectionDataDispatch] = useReducer(SelectionDataReducer, {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    })

    useEffect(() => {
        websocketService.checkConnection()
        Router.setup({
            sessionDataDispatch: sessionDataDispatch,
            graphDataDispatch: graphDataDispatch
        })
        API.getLayouts()
    }, [])

    return (
        <>
            <SelectionDataContext.Provider value={{ selectionState: selectionData, selectionDispatch: selectionDataDispatch}}>
            <GraphDataContext.Provider value={{ graphState: graphData, graphDispatch: graphDataDispatch }}>
                <UserDataContext.Provider value={{ state: sessionData, dispatch: sessionDataDispatch}}>
                        <Navigator
                            simulators={[]}
                            // nodes={graphData.nodes}
                            // edges={graphData.edges}

                            // directed={graphData.directed}
                        />
                        <InspectionTab/>
                </UserDataContext.Provider>
                <Layout/>
            </GraphDataContext.Provider>
            </SelectionDataContext.Provider>
        </>
    )
}
