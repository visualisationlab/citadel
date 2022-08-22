# Visgraph API

The Visgraph API allows users to attach python scripts to a running session and perform changes on the graph from the web client.

[Link to PyPI](https://pypi.org/project/visgraph/)

## Usage

Install with `pip install visgraph`.

See setup.py and infection_sim.py for example usage.

use ```asyncio.run(visgraph.connect(url, port, sid, key, title, startParams, simulate)) ``` to start the session.

Get the key from the simulate tab in the client session (unique to each user, users can have multiple keys).

Title is shown in the client.

Start params are passed as a dict, and can be either int, string, float or boolean. Each value requires an attribute (title), type, and defaultValue. 
These can be accessed from the client interface.

Nodes and edges are passed to the simulate function as lists, and attributes are accessed using the 'data' key. 

Params are passed as a dictionary, where each key is the attribute value given in the setup dict.

## Contributing

## License
TODO
