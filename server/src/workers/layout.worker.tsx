import { parentPort } from 'worker_threads'
const cytoscape = require('cytoscape')
// @ts-ignore
import fcose from 'cytoscape-fcose'
// @ts-ignore
import euler from 'cytoscape-euler'
// @ts-ignore
import cola from 'cytoscape-cola'
// @ts-ignore
import spread from 'cytoscape-spread'
// @ts-ignore
import cise from 'cytoscape-cise'
// @ts-ignore
import d3Force from 'cytoscape-d3-force'

cytoscape.use(fcose)
cytoscape.use(euler)
cytoscape.use(cola)
cytoscape.use(spread)
cytoscape.use(cise)
cytoscape.use(d3Force)

export interface WorkerData {
    graphData: object,
    settings: {name: string, settings: {[key: string]: (number | boolean)}},
    width: number,
    height: number
}

parentPort?.on(('message'), (data: WorkerData) => {
    if (parentPort === null) {
        return
    }

    let cy = cytoscape({
        headless:true,
        styleEnabled: true,
    })

    cy.json(data.graphData)

    let layout = cy.layout(
        {
            name: data.settings.name,
            boundingBox: {
                x1: 0,
                y1: 0,
                w: data.width,
                h: data.height
            },
            randomize: true,
            fit: true,
            ...data.settings.settings
        }
    )

    layout.run()

    parentPort.postMessage(
        cy.json()
    )
})
