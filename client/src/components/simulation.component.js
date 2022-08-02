
import * as d3 from "d3";

// Node Colouring
// Node size
// Node position
// Line position
// Line colouring

/**
 * Compares two lists of nodes, and returns whether they are different.
 * @param {Array} prevNodes
 * @param {Array} newNodes
 * @returns
 */
function graphHasChanged(prevNodes, newNodes) {
    if (prevNodes.length !== newNodes.length) {
        return true;
    }

    for (let i = 0; i < prevNodes.length; i++) {
        if (prevNodes[i].id !== newNodes[i].id) {
            return true;
        }
    }

    return false;
}

export function ForceGraphPixi(
    container,
    linksData,
    nodesData,
    highlightedNodes,
    parent,
    nodeRadius,
    nodeLineWidth) {

    const height = window.innerHeight;
    const width = window.innerWidth;
    container.innerHTML = "";

    let links;
    let nodes;

    let lineGraphics = new PIXI.Graphics();
    app.stage.addChild(lineGraphics);

    const ticked = () => {
        if (nodes.length === 0 || (!('gfx' in nodes[0]))) {
            return;
        }

        nodes.forEach((node) => {
            let {x, y, id, gfx} = node;

            if (highlightedNodes.includes(id)) {
                if (!node.selected) {
                    gfx.clear();
                    gfx.destroy();

                    node.gfx = renderCircle(app.stage, nodeRadius, nodeLineWidth, 1.0, 0xFFFFFF, () => {parent.setState({
                        highlightedNodes: [id]
                    })})

                    node.selected = true;
                }
            } else {
                if (node.selected) {
                    gfx.clear();
                    gfx.destroy();

                    node.gfx = renderCircle(app.stage, nodeRadius, nodeLineWidth, 1.0, 0xFFFFFF, () => {parent.setState({
                        highlightedNodes: [id]
                    })})

                    node.selected = false;
                }
            }

            console.log(node.gfx);

            updateNodePosition(node.gfx, x, y);
        })

        renderLines(lineGraphics, links, maxLinks);
    }

    setTransformCallback(ticked);

    let maxLinks = 3200;

    container.appendChild(app.view);

    let simulation = null;

    if (graphHasChanged(nodeCopy, nodesData) || updating) {
        console.log("Graph changed, updating...")

        simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links)
                .id((d) => d.id)
                .distance(50)
            )
            .force("charge", d3.forceManyBody().strength(charge))
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .force("collision", d3.forceCollide().radius((d) => 5));

        if (!updating) {
            updating = true;
        }

        nodes.forEach((node) => {
            const {id} = node;

            node.selected = false;

            node.gfx = renderCircle(app.stage, nodeRadius, nodeLineWidth, 1.0, 0xFFFFFF, () => {parent.setState({
                highlightedNodes: [id]
            })})

            if ('x' in node) {
                updateNodePosition(node.gfx, node.x, node.y);
            }
        })

        simulation.alpha(0.3).restart();

        simulation.on("tick", ticked);

        simulation.on("end", () => {updating = false; maxLinks = 10000; ticked()})

    } else {

        nodes.forEach((node) => {
            const {id} = node;

            node.selected = false;

            node.gfx = renderCircle(app.stage, nodeRadius, nodeLineWidth, 1.0, 0xFFFFFF, () => {parent.setState({
                highlightedNodes: [id]
            })})

            if ('x' in node) {
                updateNodePosition(node.gfx, node.x, node.y);
            }
        })

        console.log("Update, but graph stays the same")
        ticked();
    }

    return {
        destroy: () => {
            nodes.forEach((node) => {
                node.gfx.clear();
                node.gfx.destroy();
            });

            destroyLines(lineGraphics);

            lineGraphics.destroy();

            nodeCopy = [...nodes];
            linksCopy = [...links];

            if (simulation) simulation.stop();
        }
    };
}
