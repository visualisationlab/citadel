# Citadel

This repository contains software for rendering graph networks in-browser.

- [`api`](api): Contains Python code for connecting and running simulations on a session.
- [`client`](client): Contains the React frontend code.
- [`server`](server): Contains the NodeJS and Cytoscape backend server code.
- [`shared`](shared): Contains shared Typescript definitions for the client and server.
- [`ar-unity`](ar-unity): Contains code for the AR Unity application.

For the full documentation consult the [`Citadel Documentation`](https://visualisationlab.github.io/visualisationlab) section of the Visualisation Lab documentation site.

## Description
Citadel allows users to analyze and edit graphs through the web browser. It offers an API through which users can run code on the graph, by adding or removing nodes or edges, or changing attributes. Visual properties of nodes and edges are able to be mapped to their attributes. The tool is designed for explorative analysis of graphs.

## Installation

Install [yarn](https://yarnpkg.com/getting-started/install) and clone the repository:

```bash
git clone git@github.com:visualisationlab/citadel.git
```
## FOLLOWING INSTRUCTIONS PROBABLY WON"T WORK **not sure whyy**

Go into the root directory and run:

```bash
npm install
npm run generate-certs
cd client && npm install
cd ../server && npm install

cd ../shared npm && run compile
```

Create `.env` files for the server and the client.

### Client
The client `.env` should contain the following definitions:

```bash
REACT_APP_SERVERPORT=3001
REACT_APP_CLIENTPORT=3000
REACT_APP_WEBSOCKETPORT=3001
REACT_APP_URL="https://dev.citadel"
REACT_APP_WSURL="wss://dev.citadel"
REACT_APP_SPRITE_ORIGIN="https://dev.citadel:3001/images"
```

### Server
The server `.env` should be placed in the root `server` directory and contain these definitions:
```bash
SESSION_CHECKING_INTERVAL=60
SESSION_TIMEOUT=24
LOCAL_ADDRESS=dev.citadel
WEBSOCKET_PORT=3001
DEFAULT_GRAPH_URL="https://dev.citadel:3001/graphs"
NODE_ENV=development
SERVERPORT=3001
CLIENTPORT=3000
KEY_PATH=path/to/generated/certs/key
CERT_PATH=path/to/generated/certs/crt
```
```bash
npm run start
```

in the root repository path.

## Authors and acknowledgment
Miles van der Lely, Bsc. <milesvanderlely@uva.nl>, 
Laurens Stuurman, <laurensstuurman@gmail.com>, 
Dr. Rob Belleman
## License
MIT
