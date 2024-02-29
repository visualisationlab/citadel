"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const devcert = __importStar(require("devcert"));
const address = process.env['npm_package_config_devaddress'];
if (!address) {
    console.error('Please provide an address');
    process.exit(1);
}
// Check if certs folder exists
if (!fs.existsSync('./certs')) {
    console.log('Creating certs folder');
    fs.mkdirSync('./certs');
}
devcert.certificateFor(address, {}).then(({ key, cert }) => {
    console.log('Writing certs');
    fs.writeFileSync(`./certs/${address}.key`, key);
    fs.writeFileSync(`./certs/${address}.crt`, cert);
}).catch((error) => {
    console.error(error);
});
//# sourceMappingURL=devcert_generate.js.map