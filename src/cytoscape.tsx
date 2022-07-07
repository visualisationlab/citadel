import cytoscape from 'cytoscape'



function generateGraph() {
    var cy = cytoscape({
        headless: true,
        styleEnabled: true
    })
}

function setLayout(cy: cytoscape.Core, name: string) {
    cy.layout({
        name: name as any,
        boundingBox: {
            x1: 0,
            y1: 0,
            w: 1000,
            h: 1000
        },
        randomize: true,
        animate: false
    }).run()

    // TODO: WS UPDATE
}

function addNode(
    cy: cytoscape.Core,
    id: string,
    data: {[key: string]: any},
    position: {x: number, y: number} | undefined) {

    cy.add({
        group: 'nodes',
        data: Object.assign({}, {id: id}, data),
        position: position
    })
}

function addEdge(
    cy: cytoscape.Core,
    id: string,
    source: string,
    target: string,
    data: {[key: string]: any}) {

    cy.add({
        group: 'edges',
        data: Object.assign({}, {
            id: id,
            source: source,
            target: target
        }, data)
    })
}

function removeElement(
    cy: cytoscape.Core,
    id: string) {

    cy.remove(id)
}

function destroyGraph(
    cy: cytoscape.Core) {

    cy.destroy()
}
