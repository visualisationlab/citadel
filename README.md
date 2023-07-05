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

Go into the root directory and run:
```bash
yarn install
```

To create local SSL certificates run:
```bash
npm run cert
```

Create `.env` files for the server and the client.

### Client
The client `.env` should contain the following definitions:

TODO

### Server
The server `.env` should be placed in the root `server` directory and contain these definitions:

- `CHECK_INTERVAL`: The interval to check whether a session has 'expired' (ms).
- `NODE_ENV`: If this is not set to 'production' TLS is disabled.
- `HOST`: HOST IP address used for CORS.
- `WSCLIENTPORT`: Port for websocket connections.
- `DEFAULT_GRAPH_URL`: Optional, points to default graph repository for quick access.
- `CLIENTPORT`: React frontend port.
- `SERVERPORT`: Backend port.
- `KEY`: TLS key path.
- `CERT`: TLS certificate path.

To start the server and client on a local machine run:
```bash
npm run start
```

in the root repository path.

## Authors and acknowledgment
Miles van der Lely, Bsc. <milesvanderlely@uva.nl>
Dr. Rob Belleman
## License
MIT
