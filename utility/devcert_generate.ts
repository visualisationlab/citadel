import * as fs from 'fs'
import * as devcert from 'devcert'

const address = process.env['npm_package_config_devaddress']

if (!address) {
    console.error('Please provide an address')
    process.exit(1)
}

// Check if certs folder exists
if (!fs.existsSync('./certs')) {
    console.log('Creating certs folder')
    fs.mkdirSync('./certs')
}

devcert.certificateFor(address, {
}).then(({key, cert}) => {
    console.log('Writing certs')
    fs.writeFileSync(`./certs/${address}.key`, key)
    fs.writeFileSync(`./certs/${address}.crt`, cert)
}).catch((error) => {
    console.error(error)
})