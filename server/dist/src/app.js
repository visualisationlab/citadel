"use strict";
/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const setup_1 = require("./setup");
dotenv_1.default.config({ path: __dirname + '/../../.env' });
function main() {
    const logger = (0, setup_1.setupLogger)();
    const config = (0, setup_1.loadEnvironmentVariables)(logger);
    const sessions = {};
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' });
    const app = (0, express_1.default)();
    // Set up CORS.
    const corsOptions = {
        origin: "https://" + config.localAddress + ":" + config.clientPort,
    };
    app.use((0, cors_1.default)(corsOptions));
    // Set up express app.
    const httpsServer = https_1.default.createServer({
        key: fs.readFileSync(config.keyPath, 'utf8'),
        cert: fs.readFileSync(config.certPath, 'utf8')
    }, app);
    (0, setup_1.configureExpressApp)(app, config, sessions, logger, formatter);
    const websocketServer = new ws_1.WebSocketServer({
        server: httpsServer,
        clientTracking: true,
        perMessageDeflate: true
    });
    //Session checker.
    setInterval(() => {
        Object.keys(sessions).filter((key) => {
            const session = sessions[key];
            if (!session) {
                return false;
            }
            return session.hasExpired();
        }).forEach((key) => {
            logger.log('info', `Session ${key} timed out`);
            sessions[key]?.destroy();
        });
    }, config.checkInterval);
    (0, setup_1.configureWebsocketServer)(websocketServer, logger, sessions);
    httpsServer.listen(config.serverPort);
    logger.log({
        level: 'info',
        message: 'Server started succesfully',
        config
    });
}
main();
//# sourceMappingURL=app.js.map