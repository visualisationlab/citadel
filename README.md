# Visgraph

Git repo for visgraph, an application for rendering interactive networks.

## Description
Visgraph allows users to analyze and edit graphs through the web browser. It offers an API through which users can run code on the graph, by adding or removing nodes or edges, or changing attributes. Visual properties of nodes and edges are able to be mapped to their attributes. The tool is designed for explorative analysis of graphs.

## Visuals


## Installation
Pull the repo.

Run npm install in root directory.

Run npm install in server directory, add .env file in server directory containing definitions for:
- CLIENTPORT
- SERVERPORT
- WSCLIENTPORT

Change line 10: self to this in /node_modules/cytoscape_fcose/cytoscape-fcose.js

Start server with npm start.

Run npm install in client directory.

Add .env file in client directory containing definitions for:
REACT_APP_SERVERPORT
REACT_APP_CLIENTPORT
REACT_APP_WEBSOCKETPORT
REACT_APP_URL (ex. "http://localhost")
REACT_APP_WSURL (ex. "ws://192.168.0.199")

Update node_modules for port you want to run on. E.g. 3000, 8064, etc.

## Usage
TODO
## Support
Miles van der Lely, milesvanderlely@uva.nl
## Roadmap
Functional frontend implementation.

Timeline system.

AR functionality.

## Contributing


## Authors and acknowledgment
Miles van der Lely, Bsc.
Dr. Rob Belleman
## License
TODO

## Project status
Work In Progress
