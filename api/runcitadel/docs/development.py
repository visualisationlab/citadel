# Imports
import runcitadel
import sys
import asyncio
import ssl
import time


# Global variables
step = 1 # would be nice to get this from the params

# Functions
def sim_step(connection, nodes, edges, params, globals):
    """Performs one simulation step of the Replacement model"""

    # print(validation_json, len(nodes), len(edges), len(params))

    if (globals['step'] is not None):
        step = globals['step']['step']

    # add 1
    # step += 1
    print("step", step)
    time.sleep(2)

    globals['step'] = {
        'step': step + 1,
    }

    return [nodes, edges, params, globals] # TODO: change this to the correct format

# Parameters that can be set by the user
startParams = [{
                'attribute': 'Number of Steps',
                'type': 'integer',
                'defaultValue': 365,
            }]

# Main
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
