"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const cytoscape_1 = __importDefault(require("cytoscape"));
const cytoscape_fcose_1 = __importDefault(require("cytoscape-fcose"));
const cytoscape_euler_1 = __importDefault(require("cytoscape-euler"));
cytoscape_1.default.use(cytoscape_fcose_1.default);
cytoscape_1.default.use(cytoscape_euler_1.default);
worker_threads_1.parentPort?.on(('message'), (data) => {
    if (worker_threads_1.parentPort === null) {
        return;
    }
    const cy = (0, cytoscape_1.default)({
        headless: true,
        styleEnabled: true,
    });
    const settingsDict = {};
    data.settings.settings.forEach((setting) => {
        settingsDict[setting.name] = setting.value;
    });
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
    };
    console.log('Running layout', args);
    cy.json(data.graphData);
    const layout = cy.layout(args);
    layout.run();
    worker_threads_1.parentPort.postMessage(cy.json());
});
//# sourceMappingURL=layout.worker.js.map