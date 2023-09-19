import { parentPort } from 'worker_threads'
import cytoscape from 'cytoscape'
import fcose from 'cytoscape-fcose'
import euler from 'cytoscape-euler'

cytoscape.use(fcose)
cytoscape.use(euler)

export interface WorkerData {
    graphData: object,
    settings: {name: string, settings: {name: string, value: (number | boolean)}[]},
    randomize: boolean,
    width: number,
    height: number
}

parentPort?.on(('message'), (data: WorkerData) => {
    if (parentPort === null) {
        return
    }

    const cy = cytoscape({
        headless:true,
        styleEnabled: true,
    })

    const settingsDict: Record<string, number | boolean> = {}

    data.settings.settings.forEach((setting) => {
        settingsDict[setting.name] =  setting.value})

    const args = {
        name: data.settings.name,
        boundingBox: {
            x1: 0,
            y1: 0,
            w: data.width,
            h: data.height
        },
        randomize: data.randomize,
        fit: true,
        ...settingsDict
    }

    console.log('Running layout', args)
    cy.json(data.graphData)

    const layout = cy.layout(
        args
    )

    layout.run()

    parentPort.postMessage(
        cy.json()
    )
})
