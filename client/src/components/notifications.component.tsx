import React, { useContext, useEffect, useState, Reducer, useReducer } from 'react'
import { Container, CloseButton, Row, Col, Alert, Collapse, Button, Card } from 'react-bootstrap'

import { GraphDataContext, MappingContext, UserDataContext } from '../components/main.component'

// import { GraphDataContext } from '../components/main.component'
// import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer'
// import { SelectionDataReducerAction } from '../reducers/selection.reducer'
// import { API } from '../services/api.service'


export interface NotificationType {
    title: string,
    message: string,
    status: 'success' | 'info' | 'warning' | 'danger'
}

interface AlertType extends NotificationType {
    id: number
}

const MAXNOTIFICATIONS = 5
const TIMEOUT = 5000

function AlertComponent(props: {alert: AlertType,
    index: number, showOnStart: boolean, alertsDispatch: React.Dispatch<AlertsReducerAction>}) {

    const [show, setShow] = useState(props.showOnStart)

    useEffect(() => {
        setShow(props.showOnStart)}
    , [props.showOnStart])
    let variant = 'primary'

    switch (props.alert.status) {
        case 'success':
            variant = 'success'
            break
        case 'info':
            variant = 'info'
            break
        case 'warning':
            variant = 'warning'
            break
        case 'danger':
            variant = 'danger'
            break
        default:
            variant = 'primary'
            break
    }

    let title = props.alert.title

    if (!show) {
        const MAXTITLELENGTH = 18
        const MAXMESSAGELENGTH = 50

        if (props.alert.title.length > MAXTITLELENGTH) {
            title = props.alert.title.substring(0, MAXTITLELENGTH) + '...'
        }

        if (props.alert.message.length > MAXMESSAGELENGTH) {
            props.alert.message = props.alert.message.substring(0, MAXMESSAGELENGTH) + '...'
        }
    }

    return (
        <Card border={variant} onClick={!show ? () => {
            if (show) {
                props.alertsDispatch({
                    type: 'flags/remove',
                    payload: {id: props.alert.id}
                })

                setTimeout(() => {
                    props.alertsDispatch({
                        type: 'alerts/remove',
                        id: props.alert.id
                    })

                }, TIMEOUT / 2)
            } else {
                props.alertsDispatch({
                    type: 'flags/add',
                    payload: {id: props.alert.id}
                })
            }
            setShow(!show)
        } : () => {}}
        style={{
            padding: '0px',
            margin: '0px',
            marginBottom: '10px',
            cursor: !show ? 'pointer' : 'default',
        }}
        >
            <Card.Header>
                <Row>
                    <Col md={{ span: 12 }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div>
                                {title}
                            </div>
                            <div>
                                <CloseButton onClick={() => {
                                    props.alertsDispatch({
                                        type: 'alerts/removeImmediate',
                                        id: props.alert.id
                                    })
                                }} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                {!show &&
                    props.alert.message.substring(0, 40) + '...'
                }
                <Collapse in={show}>
                    <Row>
                        <Col>
                            <div>
                                <Row>
                                    <Col>
                                        {props.alert.message}
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Collapse>
            </Card.Body>
        </Card>
    )

}

type AlertsReducerAction = { type: 'alerts/add', payload: { notification: NotificationType, id: number} }
    | { type: 'alerts/remove', id: number }
    | { type: 'alerts/removeImmediate', id: number }
    | { type: 'alerts/clear' }
    | { type: 'flags/add', payload: { id: number } }
    | { type: 'flags/remove', payload: { id: number } }

type AlertsReducerType = {
    alerts: AlertType[],
    flags: number[]
}

function AlertsReducer(state: AlertsReducerType, action: AlertsReducerAction): AlertsReducerType {
    switch (action.type) {
        case 'alerts/add':
            if (state.alerts.length >= MAXNOTIFICATIONS) {
                state.alerts.shift()
            }

            return {
                alerts: [...state.alerts, {
                    ...action.payload.notification,
                    id: action.payload.id
                }],
                flags: state.flags
            }
        case 'alerts/removeImmediate':
            return {
                alerts: state.alerts.filter((alert) => alert.id !== action.id),
                flags: state.flags.filter((flag) => flag !== action.id)
            }
        case 'alerts/remove':
            // If the alert is in the flags array, don't remove it
            if (state.flags.includes(action.id)) {
                return state
            }

            return {
                alerts: state.alerts.filter((alert) => alert.id !== action.id),
                flags: state.flags
            }
        case 'alerts/clear':
            return {
                alerts: [],
                flags: []
            }
        case 'flags/add':
            return {
                alerts: state.alerts,
                flags: [...state.flags, action.payload.id]
            }
        case 'flags/remove':
            return {
                alerts: state.alerts,
                flags: state.flags.filter((flag) => flag !== action.payload.id)
            }
        default:
            return state
    }
}

export default function Notifications(): JSX.Element {
    // Notifications reducer for adding/removing notifications
    let [alerts, alertsDispatch] = useReducer<Reducer<AlertsReducerType,
        AlertsReducerAction>>(AlertsReducer, {alerts: [], flags: []})

    // Get the mappings state from the main component
    let { mappingsState, mappingsDispatch } = useContext(MappingContext)
    let { state, dispatch } = useContext(UserDataContext)

    if (mappingsState === null || mappingsDispatch === null
        || state === null || !dispatch) {
        throw new Error('Mappings state is null')
    }

    let tempNot = mappingsState.notification
    let sessionNotification = state.notification

    useEffect(() => {
        if ((sessionNotification === null && tempNot === null)
            || mappingsDispatch === null || dispatch === null) {

            return
        }

        // Generate a random id for the notification
        let id = Math.floor(Math.random() * 1000000)

        // Set timeout to remove the notification after 5 seconds
        setTimeout(() => {
            alertsDispatch({
                type: 'alerts/remove',
                id: id
            })

            // if (!mappingsDispatch) {
            //     return
            // }

            // mappingsDispatch({
            //     type: 'notification',
            //     action: 'clear'
            // })
        }, TIMEOUT)

        if (sessionNotification) {
            console.log('Session notification')
            alertsDispatch({
                type: 'alerts/add',
                payload: {
                    notification: sessionNotification,
                    id: id
                }
            })

            dispatch({
                attribute: 'notification/clear',
            })
        }
        else if (tempNot) {
            alertsDispatch({
                type: 'alerts/add',
                payload: {
                    notification: tempNot,
                    id: id
                }
            })

            mappingsDispatch({
                type: 'notification',
                action: 'clear'
            })
        }

    }, [tempNot, sessionNotification, mappingsDispatch, dispatch])



    return (
        <div>
            <Container style={{
                right: '50px',
                top: '10px',
                position:'absolute',
                width: '400px',
            }}>
                {alerts.alerts.map((alert, index) => {
                // Show on start when id is in flags list
                let showOnStart = alerts.flags.includes(alert.id)

                return (
                    <Row>
                        <Col>
                            <AlertComponent alert={alert} index={index} showOnStart={showOnStart} alertsDispatch={alertsDispatch} />
                        </Col>
                    </Row>)}
                )}
            </Container>
        </div>
    )
}
