// /**
//  * @author Miles van der Lely <m.vanderlely@uva.nl>
//  * This file contains the simulate component, which allows for connections of
//  * API simulations to the session.
//  */

// import React, { useState, useEffect, useContext, useRef } from 'react'

// import { Row, Col, Button, ListGroup, Dropdown, ProgressBar,
//     Form, CloseButton, InputGroup, ButtonGroup, SplitButton, Modal } from 'react-bootstrap'
//     import { GrPlay, GrPause } from 'react-icons/gr'

// import { UserDataContext } from '../components/main.component'
// import { API } from '../services/api.service'
// import './home.component.css'
// import { ParamType, ServerState, SimulatorParam } from '../reducers/sessiondata.reducer'
// import { Router } from './router.component'
// import { SimulatorState } from '../services/websocket.service'

// import './simulate.component.scss'

// // Renders sim item in simulator list.
// function renderSimItem<T extends ParamType>(param: SimulatorParam<T>, index: number, key: string,
//     params: Array<SimulatorParam<T>>) {
//     let inputField = <></>

//     switch (param.type) {
//         case 'boolean':
//             const boolParam = param as SimulatorParam<'boolean'>

//             // Booleans are rendered as a dropdown menu.
//             inputField = (
//                 <Col>
//                     <Dropdown onSelect={(item) => {
//                         Router.setSimulatorSettings(key, params.map((paramIter) => {
//                             let newParam = paramIter as SimulatorParam<'boolean'>
//                             if (newParam.attribute === boolParam.attribute) {
//                                 newParam.value = item === 'true'

//                                 return newParam
//                             }

//                             return paramIter
//                         }))
//                     }}>
//                         <Dropdown.Toggle>{param.value === true ? 'True' : 'False'}</Dropdown.Toggle>
//                         <Dropdown.Menu>
//                             <Dropdown.Item key='true' eventKey={'true'} active={boolParam.value}>True</Dropdown.Item>
//                             <Dropdown.Item key='false' eventKey={'false'} active={!boolParam.value}>False</Dropdown.Item>
//                         </Dropdown.Menu>
//                     </Dropdown>
//                 </Col>
//             )
//             break
//         case 'integer':
//             const integerParam = param as SimulatorParam<'integer'>

//             if (integerParam.limits.min === 0 && integerParam.limits.max === 0) {
//                 // Integers are rendered as a number input field.
//                 inputField = (
//                     <Col>
//                         <Form.Control
//                             type='number'
//                             value={integerParam.value}
//                             onChange={(e) => {
//                                 let num = Number(e.target.value)

//                                 if (!Number.isInteger(num)) {
//                                     return
//                                 }

//                                 Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                     if (paramIter.attribute === param.attribute) {
//                                         (paramIter as SimulatorParam<'integer'>).value = num
//                                     }

//                                     return paramIter
//                                 }))
//                             }}
//                         >

//                         </Form.Control>
//                     </Col>
//                 )
//             } else {
//                 // Integers are rendered as a slider.
//                 inputField = (
//                     <>
//                         <Col xs={2} md={{span: 1}}>
//                             {/* Min */}
//                             {integerParam.limits.min}
//                         </Col>
//                         <Col>
//                             <Row>
//                                 <Col>
//                                     <Form.Range
//                                         min={integerParam.limits.min}
//                                         max={integerParam.limits.max}
//                                         value={integerParam.value}
//                                         onChange={(e) => {
//                                             let num = Number(e.target.value)

//                                             if (!Number.isInteger(num)) {
//                                                 return
//                                             }

//                                             Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                                 if (paramIter.attribute === param.attribute) {
//                                                     (paramIter as SimulatorParam<'integer'>).value = num
//                                                 }

//                                                 return paramIter
//                                             }))
//                                         }}
//                                     />
//                                 </Col>
//                             </Row>
//                             <Row>
//                                 <Col>
//                                     {/* Value */}
//                                     <div style={{
//                                         float: 'right',
//                                     }}>
//                                         {integerParam.value}
//                                     </div>
//                                 </Col>
//                             </Row>

//                         </Col>
//                         <Col xs={2}>
//                             {/* Max */}
//                             {integerParam.limits.max}
//                         </Col>
//                     </>
//                 )
//             }

//             break
//         case 'float':
//             const floatParam = param as SimulatorParam<'float'>
//             if (floatParam.limits.min === 0 && floatParam.limits.max === 0) {

//                 // Floats are rendered as a number input field.
//                 inputField = (
//                     <Col>
//                         <Form.Control
//                             type='number'
//                             step={0.1}
//                             value={floatParam.value}
//                             onChange={(e) => {
//                                 let num = parseFloat(e.target.value)

//                                 if (isNaN(num)) {
//                                     return
//                                 }

//                                 Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                     if (paramIter.attribute === param.attribute) {
//                                         (paramIter as SimulatorParam<'float'>).value = num
//                                     }

//                                     return paramIter
//                                 }))
//                             }}
//                         >

//                         </Form.Control>
//                     </Col>
//                 )
//             } else {
//                 // Floats are rendered as a slider.
//                 // Integers are rendered as a slider.
//                 inputField = (
//                     <>
//                         <Col xs={2} md={{span: 1}}>
//                             {/* Min */}
//                             {floatParam.limits.min}
//                         </Col>
//                         <Col>
//                             <Row>
//                                 <Col>
//                                     <Form.Range
//                                         // No step
//                                         step={0.05}
//                                         min={floatParam.limits.min}
//                                         max={floatParam.limits.max}
//                                         value={floatParam.value}
//                                         onChange={(e) => {
//                                             let num = Number(e.target.value)

//                                             if (isNaN(num)) {
//                                                 return
//                                             }

//                                             Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                                 if (paramIter.attribute === param.attribute) {
//                                                     (paramIter as SimulatorParam<'float'>).value = num
//                                                 }

//                                                 return paramIter
//                                             }))
//                                         }}
//                                     />
//                                 </Col>
//                             </Row>
//                             <Row>
//                                 <Col>
//                                     {/* Value */}
//                                     <div style={{
//                                         float: 'right',
//                                     }}>
//                                         {floatParam.value}
//                                     </div>
//                                 </Col>
//                             </Row>

//                         </Col>
//                         <Col xs={2}>
//                             {/* Max */}
//                             {floatParam.limits.max}
//                         </Col>
//                     </>
//                 )
//             }
//             break
//         case 'string':
//             const stringParam = param as SimulatorParam<'string'>
//             // Strings are rendered as a text input field.
//             inputField = (
//                 <Col>
//                     <Form.Control
//                         type='string'
//                         value={stringParam.value}
//                         onChange={(e) => {
//                             if (e.target.value === '') {
//                                 return
//                             }

//                             Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                 if (paramIter.attribute === param.attribute) {
//                                     (paramIter as SimulatorParam<'string'>).value = e.target.value
//                                 }

//                                 return paramIter
//                             }))
//                         }}
//                     >

//                     </Form.Control>
//                 </Col>
//             )
//             break

//         default:
//             break
//     }

//     return (
//         <ListGroup.Item key={index}>
//             <Row>
//                 <Col>
//                     {param.attribute}
//                 </Col>
//                 <Col>
//                     {param.type}
//                 </Col>
//                 {inputField}

//                 <Col>
//                     {param.value !== param.defaultValue &&
//                         <Button variant='primary' onClick={() => {
//                             Router.setSimulatorSettings(key, params.map((paramIter) => {
//                                 if (paramIter.attribute === param.attribute) {
//                                     paramIter.value = paramIter.defaultValue
//                                 }

//                                 return paramIter
//                             }))
//                         }}>
//                             Reset
//                         </Button>
//                     }
//                 </Col>
//             </Row>
//         </ListGroup.Item>
//     )
// }

// // Renders the simulator settings.
// function renderSimulatorSettings(key: string, params: Array<SimulatorParam<ParamType>>,
//     setSimOptionsSelection: React.Dispatch<React.SetStateAction<string | null>>) {

//     const closeButton = (
//         <CloseButton
//             style={{float: 'right', paddingTop: '20px'}}
//             onClick={()=>{setSimOptionsSelection(null)}}>

//         </CloseButton>
//     )

//     const simList = (
//         <ListGroup>
//                 {params.map((param, index) => {
//                     return renderSimItem(param, index, key, params)
//                 })}
//             </ListGroup>
//     )

//     return (
//         <>
//             <Row style={{marginTop: '10px'}}>
//                 <Col md={{span: 10}}>
//                     <h3>Simulator settings</h3>
//                 </Col>

//                 <Col>
//                     {closeButton}
//                 </Col>
//             </Row>
//             <Row>
//                 <Col>
//                     <hr/>
//                 </Col>
//             </Row>
//             <Row>
//                 <Col
//                     style={{
//                         maxHeight: '80vh',
//                         overflowY: 'auto',
//                     }}
//                 >
//                     {simList}
//                 </Col>
//             </Row>
//         </>
//     )
// }

// function renderValidateButton(simKey: string | null, validated: 'valid' | 'unknown' | 'invalid') {
//     if (validated === 'valid') {
//         return (
//             <Button variant='success' disabled>Valid</Button>
//         )
//     }

//     if (validated === 'invalid') {
//         return (
//             <Button variant='error' disabled>Invalid</Button>
//         )
//     }

//     <Button variant='outline-primary' onClick={() => {
//         if ((simKey) !== null && simKey !== '') {
//             API.validate(simKey)
//         }
//     }}>Validate</Button>
// }

// function ModalContent(props: {simKey: string, sid: string, sessionURL: string,
//     port: string, connected: boolean, setShowSimulatorModal: React.Dispatch<React.SetStateAction<boolean>>}) {

//     const sessionRef = useRef(null)
//     const [ advancedView, setAdvancedView ] = useState(false)

//     let exportString = [{
//         name: 'Args',
//         value: `${props.sessionURL} ${props.port} ${props.sid} ${props.simKey}`
//     }]

//     let text = `
//         Citadel Simulators allow users to update, modify or remove data based
//         on preset algorithms. The results can be viewed in real time and
//         exported to a JSON file. To use a simulator, insert the following string
//         into the simulator's command line arguments. For more information on
//         developing a simulator, please visit the Citadel documentation.
//     `

//     if (advancedView) {
//         exportString = [
//             { name: 'URL', value: props.sessionURL},
//             { name: 'Port', value: props.port},
//             { name: 'SID', value: props.sid},
//             { name: 'Key', value: props.simKey}
//         ]
//     }

//     // URL port sid key
//     return (
//         <>
//             <Modal.Header closeButton>
//                 <Modal.Title>
//                     <Row>
//                         <Col md={{span: 1}}>
//                             <img
//                                 width='25px'
//                                 src="https://chimay.science.uva.nl:8061/VisLablogo-cropped-notitle.svg"
//                                 className="custom-logo"
//                                 alt="Visualisation Lab"
//                             />
//                         </Col>
//                         <Col>
//                             Connect Simulator via API
//                         </Col>
//                     </Row>
//                 </Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <Row>
//                     <Col>
//                         {/* Checkbox button */}
//                         <Form.Check
//                             style={{
//                                 float: 'right'
//                             }}
//                             label='Advanced View'
//                             className="mb-3"
//                             type='switch'
//                             id='advanced-view'
//                             onChange={(e) => {
//                                 setAdvancedView(e.target.checked)
//                             }}
//                         />
//                     </Col>
//                 </Row>

//                 {
//                     exportString.map((item, index) => {
//                         return (
//                             <Row key={index} style={{
//                                 marginTop: '10px'
//                             }}>
//                                 <Col>
//                                     <InputGroup>
//                                         <InputGroup.Text
//                                             style={{
//                                                 width: '80px'
//                                             }}
//                                         >
//                                                 {item.name}
//                                         </InputGroup.Text>
//                                         <Form.Control
//                                             readOnly

//                                             value={item.value} ref={sessionRef}/>
//                                         <Button variant="outline-secondary"
//                                             id="button-copy"
//                                             onClick={() => {
//                                                 if (window.isSecureContext && navigator.clipboard) {
//                                                     navigator.clipboard.writeText(item.value)
//                                                 }
//                                             }}>
//                                             Copy
//                                         </Button>
//                                     </InputGroup>
//                                 </Col>
//                             </Row>
//                         )
//                     })
//                 }
//                 <Row
//                     style={{ marginTop: '10px' }}
//                 >
//                     <Col>
//                         <i>{text}</i>
//                     </Col>
//                 </Row>
//             </Modal.Body>
//             <Modal.Footer>
//                 <Row>
//                     <Col>
//                         <Button variant={'outline-' + (props.connected ? 'success' : 'danger')} disabled>
//                             {props.connected ? 'Sim Connected' : 'Sim Disconnected'}
//                         </Button>
//                     </Col>
//                 </Row>
//                 <Col>
//                     <Button variant='outline-primary' onClick={() => {
//                         props.setShowSimulatorModal(false)
//                     }}
//                         style={{float: 'right'}}
//                     >
//                         Close
//                     </Button>
//                 </Col>
//             </Modal.Footer>
//         </>
//     )
// }

// function SimulatorRow<T extends ParamType>(props: {generating: boolean,
//     simKey: string, setSimKey: React.Dispatch<React.SetStateAction<string>>,
//     simState: SimulatorState, setSimOptionsSelection: React.Dispatch<React.SetStateAction<string | null>>,
//     setShowSimulatorModal: React.Dispatch<React.SetStateAction<boolean>>,
//     setModalSimKey: React.Dispatch<React.SetStateAction<string>>,
//     options: Array<SimulatorParam<T>>,
//     simName: string,
//     serverState: ServerState,
//     }) {

//     const [ stepSetting, setStepSetting ] = useState(1)
//     const [ stopping, setStopping ] = useState(false)

//     useEffect(() => {
//         if (props.simState === 'idle') {
//             setStopping(false)
//         }
//     }, [props.simState])

//     let simStateControls = <></>

//     if (props.simState === 'disconnected') (
//         simStateControls = (<Col>
//             <Button
//                 variant='outline-primary'
//                 onClick={() => {

//                     props.setShowSimulatorModal(true)

//                 }}
//             >
//                 Connect
//             </Button>
//         </Col>
//         )
//     )
//     else if (props.simState === 'idle') {
//         const stepButton = (
//             <Button
//                 disabled={props.serverState !== 'idle'}
//                 onClick={() => {
//                     API.step(stepSetting, props.simKey, props.options, props.simName)
//                 }}>
//                 Step
//             </Button>
//         )

//         let stepCounter = (
//             <Col>
//                 <Form.Control
//                     disabled={props.serverState !== 'idle'}
//                     type='number'
//                     value={stepSetting}
//                     onChange={(e) => {
//                         if (parseInt(e.target.value) > 0 && parseInt(e.target.value) < 1000)
//                             setStepSetting(parseInt(e.target.value))
//                     }}
//                 />
//             </Col>
//         )

//         simStateControls = (
//             <>
//                 <Col md={{span: 2}}>
//                     {stepButton}
//                 </Col>
//                 <Col md={{span: 3}}>
//                     {stepCounter}
//                 </Col>
//             </>
//         )
//     }
//     else if (props.simState === 'generating') {
//         simStateControls = (
//             <Col>
//                 <Button
//                     disabled={stopping}
//                     variant='outline-danger'
//                     onClick={() => {
//                         API.stop()
//                         setStopping(true)
//                     }}
//                 >
//                     { stopping ? 'Stopping...' : 'Stop' }
//                 </Button>
//             </Col>
//         )
//     }

//     return (
//         <Row>
//             {simStateControls}
//             <Col style={{paddingTop: '5px'}}>
//                 <i>{props.simName}</i>
//             </Col>
//             <Col style={{ float: 'right' }}>
//                 <Dropdown
//                     align={'end'}
//                     style={{ float: 'right' }}
//                     as={ButtonGroup}
//                     onSelect={(eventKey) => {
//                         if (eventKey === 'delete') {
//                             API.removeSim(props.simKey)
//                         }
//                     }}
//                 >
//                     <Button
//                         disabled={props.options.length === 0}
//                         onClick={() => {
//                             props.setSimOptionsSelection(props.simKey)
//                         }}
//                         variant={'outline-primary'}

//                     >
//                         Options
//                     </Button>
//                     <Dropdown.Toggle
//                         key={'thingy'}
//                         id={`dropdown-split-variants-thingy`}
//                     />
//                     <Dropdown.Menu>
//                         {/* <Dropdown.Item eventKey="params">Parameters</Dropdown.Item> */}
//                         <Dropdown.Item eventKey="check" disabled active={false}>Check Graph</Dropdown.Item>
//                         <Dropdown.Item className='text-danger' active={false} disabled={props.simKey === ''} eventKey="delete">Delete</Dropdown.Item>
//                     </Dropdown.Menu>
//                 </Dropdown>
//             </Col>
//         </Row>
//     )
// }

// // Renders the simulator options and list.
// export function SimulatorTab() {
//     const { state,  } = useContext(UserDataContext)

//     const [ simOptionsSelection, setSimOptionsSelection ] = useState<string | null>(null)

//     const [ showSimulatorModal, setShowSimulatorModal ] = useState(false)
//     const [ showAllSimulators, setShowAllSimulators ] = useState(false)

//     const [ simKey, setSimKey ] = useState('')

//     let simulators = state?.simulators

//     useEffect(() => {
//         if (simOptionsSelection === null || simulators === undefined) {
//             return
//         }

//         // If the selected simulator is not generating or idle, then reset the selection.
//         if (simulators.filter((sim) => {
//             return (sim.key === simOptionsSelection && (sim.state === 'generating' || sim.state === 'idle'))
//         }).length === 0) {
//             setSimOptionsSelection(null)
//         }
//     }, [simOptionsSelection, simulators])

//     useEffect(() => {
//         const sims = state?.simulators

//         if (sims === undefined || simKey !== '_waiting') {
//             return
//         }

//         sims.forEach((sim) => {
//             if (sim.state === 'disconnected' && sim.key !== null) {
//                 setSimKey(sim.key)
//             }
//         })
//     }, [state?.simulators, simKey])

//     if (state === null) {
//         return <></>
//     }

//     // Flag for if the simulator is unavailable.
//     const disabled = state.state !== 'idle' || state.simulators.filter((sim) => {
//         return sim.state !== 'idle'
//     }).length > 0

//     // Renders the simulator list.
//     const sims = state.simulators.map((sim, index) => {
//         if (sim.key === null) {
//             return <></>
//         }

//         return (
//             <ListGroup.Item>
//                 <SimulatorRow
//                     simKey={sim.key}
//                     setSimKey={setSimKey}
//                     simState={sim.state}
//                     setSimOptionsSelection={setSimOptionsSelection}
//                     setShowSimulatorModal={setShowSimulatorModal}
//                     setModalSimKey={setSimKey}
//                     options={sim.params}
//                     simName={sim.title}
//                     generating={sim.state === 'generating'}
//                     serverState={state.state}

//                     />
//             </ListGroup.Item>
//         )
//     })

//     // Renders the simulator controls.
//     const simulatorControl = (
//         <Row style={{
//             position: 'absolute',
//             bottom: '10px',
//             width: '100%'
//         }}>
//             <Col >
//                 <Row>
//                     <Col>
//                         <Button
//                             style={{float: 'left'}}
//                             onClick={() => {
//                                 API.setGraphIndex(0)
//                             }}>
//                             {'<<'}
//                         </Button>
//                     </Col>
//                     <Col>
//                         <Button
//                             onClick={() => {
//                                 API.setGraphIndex(state.graphIndex - 1)
//                             }}
//                             style={{float: 'left'}}
//                         >
//                             {'<'}
//                         </Button>
//                     </Col>
//                 </Row>
//             </Col>
//             <Col>
//                 <Row>
//                     <Col>
//                         <Form.Control
//                             type='number'
//                             style={{width: '80px'}}
//                             value={state.graphIndex + 1}
//                             onChange={(e) => {
//                                 if (parseInt(e.target.value) > 0 && parseInt(e.target.value) < 1000)
//                                     API.setGraphIndex(parseInt(e.target.value) - 1)
//                             }}></Form.Control>
//                     </Col>
//                     <Col style={{paddingTop: '5px'}}>
//                         / {state.graphIndexCount}
//                     </Col>
//                 </Row>
//             </Col>
//             <Col>
//                 <Row>
//                     <Col>
//                         <Button onClick={() => {
//                             API.setGraphIndex(state.graphIndex + 1)
//                         }}>
//                             {'>'}
//                         </Button>
//                     </Col>
//                     <Col>
//                         <Button onClick={() => {
//                             API.setGraphIndex(state.graphIndexCount - 1)
//                         }}>
//                             {'>>'}
//                         </Button>
//                     </Col>
//                 </Row>
//             </Col>
//         </Row>
//     )

//     var playbutton = (<></>)

//     // Renders the play/pause button.
//     if (state.playmode) {
//         playbutton = (
//             <Button onClick={() => {
//                 API.pause()
//             }}>
//                 <GrPause></GrPause>
//             </Button>
//         )
//     }

//     if (!state.playmode && state.graphIndexCount > 1) {
//         playbutton = (
//             <Button onClick={() => {
//                 API.play()
//             }}
//             disabled={disabled}>
//                 <GrPlay></GrPlay>
//             </Button>
//         )
//     }

//     let content = <></>

//     content = (
//         <>
//             <Row>
//                 <Col>
//                     <hr/>
//                 </Col>
//             </Row>
//             <Row style={{marginBottom: '10px'}}>
//                 <Col>
//                     <ListGroup>
//                         <div style={{
//                             overflowY: 'auto',
//                             height: '50vh',
//                         }}>
//                             {sims}
//                             <ListGroup.Item>
//                                 <Row>
//                                     <Col>
//                                         <Button
//                                             disabled={
//                                                 (state.simulators.filter((sim) => {
//                                                 return sim.state === 'disconnected'
//                                                 }).length > 0
//                                                 )}
//                                             onClick={() => {
//                                                 if (state.simulators.filter((sim) => {
//                                                     return sim.state === 'disconnected'
//                                                 }).length > 0) {
//                                                     return
//                                                 }
//                                                 API.addSim()
//                                                 setSimKey('_waiting')
//                                             }}
//                                             variant='outline-success'>
//                                             Add
//                                         </Button>
//                                     </Col>
//                                     {/* <Col>
//                                         <Button
//                                             disabled={state.simulators.filter((sim) => {
//                                                 return sim.state === 'disconnected'
//                                             }).length > 0}
//                                             onClick={() => {
//                                                 if (state.simulators.filter((sim) => {
//                                                     return sim.state === 'disconnected'
//                                                 }).length > 0) {
//                                                     return
//                                                 }
//                                                 API.addTestSim()
//                                                 setSimKey('test')
//                                             }}
//                                             variant='outline-success'>
//                                             Add Test
//                                         </Button>

//                                     </Col> */}
//                                 </Row>
//                             </ListGroup.Item>
//                         </div>
//                     </ListGroup>
//                 </Col>
//             </Row>
//             {state.simState.stepMax > 0 &&
//                 <>
//                     <Row >
//                         <Col>
//                             <i>
//                                 Simulating step {state.simState.step + 1} of {state.simState.stepMax} for {state.simState.name}...
//                             </i>
//                         </Col>
//                     </Row>
//                     <Row style={{marginBottom: '10px', marginTop: '10px'}}>
//                         <Col>
//                                 <ProgressBar animated now={(state.simState.step + 1) / (state.simState.stepMax) * 100}></ProgressBar>
//                         </Col>
//                     </Row>
//                 </>
//             }
//             {simulatorControl}
//         </>
//     )

//     const res = simOptionsSelection === null ? (
//         <>
//             <Modal show={showSimulatorModal} onHide={() => {setShowSimulatorModal(false)}}>
//                 <ModalContent
//                     simKey={simKey}
//                     sessionURL={state.sessionURL}
//                     port={state.websocketPort}
//                     sid={state.sid}
//                     connected={state.simulators.filter((sim) => {return sim.key === simKey})[0]?.state === 'idle'}
//                     setShowSimulatorModal={setShowSimulatorModal}
//                 />
//             </Modal>
//             <Row style={{
//                 marginTop: '10px',
//             }}>
//                 <Col>
//                     <h3>Simulate</h3>
//                 </Col>
//                 <Col>
//                     <ButtonGroup style={{
//                         float: 'right'
//                     }}>
//                         <Button
//                             variant={!showAllSimulators ? 'primary' : 'outline-primary'}
//                             onClick={() => {setShowAllSimulators(false)}}
//                         >
//                             Personal
//                         </Button>
//                         <Button
//                             variant={showAllSimulators ? 'primary' : 'outline-primary'}
//                             onClick={() => {setShowAllSimulators(true)}}
//                         >
//                             Others
//                         </Button>
//                     </ButtonGroup>
//                 </Col>
//             </Row>
//             {content}
//         </>
//     ) : renderSimulatorSettings(simOptionsSelection,
//             state.simulators.filter((sim) => {return sim.key === simOptionsSelection})[0].params,
//             setSimOptionsSelection)

//     return res
// }
