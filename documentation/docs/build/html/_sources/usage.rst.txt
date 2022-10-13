Usage
#####

Visgraph is designed to do three things: visualize networks collaboratively in a browser, make changes to those networks either manually or via a script,
and render the networks in 3D using an augmented reality headset. The user can upload a network in two formats: JSON and GraphML. The JSON format
follows Cytoscape.js, and the GraphML format follows Gephi.

You can upload your datasets to the server using the web interface. When first
accessing the Visgraph server, the page prompts the user to either enter a URL pointing to the dataset or join an existing visualization session using the session ID.
A unique session ID identifies each visualization session and multiple
users can connect or disconnect from the same session at any time.

Mapping
=======

When successfully loading a dataset the user is shown a full-screen view of the
visualization. The visualization is composed of two main parts: the nodes and
edges, and the controls which are used to interact with the visualization. Nodes and edges
are set out on a 2D plane through a *layout* algorithm. The current layout algorithm
can be chosen by navigating to the **Mapping** tab in the controls, and by selecting the
**Layout Mapping** dropdown menu.

Layout Mapping
**************

The layout mapping algorithm sets out the nodes and edges on a 2D plane. Some algorithms (such as circle, null, breadth-first or grid) are deterministic and will always produce
the same layout for a given dataset. Other *force-directed*  algorithms (such as fcose, cise or spread) are stochastic and will create a different layout each time they are run, with an undetermined running time. Layout generation is capped at sixty seconds, after which the server will return an error message.

Each layout algorithm has several parameters, depending on the algorithm. When the user presses the **apply** button, the server generates the layout and updates the visualization.
The user can then interact with the visualization for all users. While the server generates the layout, users cannot change the attributes of the graph until layout generation finalizes.

Node Mapping
************

Each node in the graph has visual attributes such as size, colour and transparency, which the user can map to data associated with that node in the **Node Mappings** dropdown.
The user can set these parameters to generate their desired visualization.
Visual mappings are personal to each user and are not shared with other collaborators in the graph.

Edge Mapping
************

Each edge in the graph has visual attributes such as width, colour and transparency, which the user can map to data associated with that edge in the **Edge Mappings** dropdown.
The user can set these parameters to generate their desired visualization.

Simulation
==========

The **Simulation** tab allows users to add, remove and run existing simulation scripts connected via an API. Each script receives the current data stored in the visualization, and can modify the data in any way. The user can then run the script to update the visualization.
The script prepends the state to a timeline history and the user can use the timeline controls (First, Previous, Next and Last) to navigate through the timeline. Whenever the user runs a script, it takes the current point in the timeline as the input and removes all subsequent points, replacing them with the updated state.

A script is connectd by running it using the supplied session ID and API key.
The **Add** button generates an API key, which is unique to each session.
Each script can have a set of parameters accessible through the **settings** button next to that script.
These parameters can be of the **integer**, **float**, **boolean** or **string** type.
The **step** button runs the selected script for a configurable number of steps.

Developing Scripts
******************

Scripts are written in **Python 3**. Visgraph has its own library which can be installed by running:

.. code-block:: bash

    pip install visgraph

This library contains the function *connect*, which has the following signature:

.. code-block:: python

    async def connect(  url: str,
                        port: int,
                        sid: str,
                        key: str,
                        title: str,
                        startParams: json,
                        simulateFunction) -> void

The script connects to the session using the *url*, *port* and *sid* parameters.
The *key* parameter corresponds to the API key in the interface.
*title* is shown to the user when the script connects. The *simulateFunction* is called each time the user runs the script from the web interface.
The function has the following signature:

.. code-block:: python

    def simulate(nodes, edges, params) -> [nodes, edges, params]

The *startParams* parameter has the following signature:

.. code-block:: JSON

    [
        {
            'attribute': 'floatParam',
            'type': 'float',
            'defaultValue': 1.0,
        },
        {
            'attribute': 'defaultValue',
            'type': 'integer',
            'defaultValue': 0,
        },
        {
            'attribute': 'stringParam',
            'type': 'string',
            'defaultValue': 'default',
        },
        {
            'attribute': 'randomlyInfect',
            'type': 'boolean',
            'defaultValue': True,
        }
    ]

These are the parameters that the user can set in the web interface. Note that
these parameters are *not updated* by the script, only by the user. The API passes the parameters to simulate as a dictionary, with keys corresponding to the *attribute* field. The
web interface will automatically generate the appropriate input fields for each
parameter based on the given type.

*Although it would technically be possible to let the script update the parameters, this comes with
some caveats. Mainly, it could encourage developers to write scripts that
are incompatible with the web interface. For example, suppose the script updates
the parameters (which depend on the outputted graph state). In that case, the output may tempt the user to change these parameters from the interface or aspects of the graph, rendering the script broken on subsequent runs.*

Search
======

The **Search Tab** allows the user to access each node and edge in the network. By clicking on either nodes or edges in the list, the user selects that object in the network.
If a node is selected, all edges connected to that node are highlighted. If an edge is selected, both nodes connected to that edge are highlighted. The search box uses *fuzzy searching*
to find nodes and edges that match the search query. The search box also supports regular expressions.

Session
=======

The **Session Tab** enables the user to change their username for that session, and see other connected users, as well as sesion info such as the original graph URL,
session ID, and expiration date. Every session expires after six hours by default, at which point the graph information will be lost. The user can also connect an AR headset
using the connect button.
