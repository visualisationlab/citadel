# Imports
import runcitadel
import sys
import asyncio
import ssl
import time


# Global variables
step = 1

# Functions
def sim_step(connection, nodes, edges, params, globals):
    """Performs one simulation step of the Replacement model"""

    return [nodes, edges, params, globals] # TODO: change this to the correct format

# Parameters that can be set by the user
startParams = [{
                'attribute': 'Number of Steps',
                'type': 'integer',
                'defaultValue': 365,
                'value': 365,
                "limits": {
                    "min": 1,
                    "max": 1000
                }
            },
            {
                'attribute': 'Float',
                'type': 'float',
                'defaultValue': 0.5,
                'value': 0.5,
                "limits": {
                    "min": 0.1,
                    "max": 1.0
                }
            },
            {
                'attribute': 'Bool',
                'type': 'boolean',
                'defaultValue': True,
                'value': True,
                "limits": None
            },
            {
                'attribute': 'String',
                'type': 'string',
                'defaultValue': 'test',
                'value': 'test',
                "limits": None
            }]

if __name__ == "__main__":
    # Assert required information is provided
    if (len(sys.argv) != 3):
        print("missing arguments, format: development.py <sid> <key>")

        exit(1)

    # Hardcode some of the argument and take rest as command-line args
    url = 'dev.visgraph'
    port = 3001
    sid = sys.argv[1]
    key = sys.argv[2]
    title = 'Kingpin SimStep'

    # Create unsafe SSL environment context
    ssl_context = ssl._create_unverified_context()

    # Connect
    asyncio.run(runcitadel.connect(url, port, sid, key, title, startParams, sim_step, externalContext=ssl_context))
