import visgraph
import sys
import asyncio

import copy
import random

import networkx as nx
import json

def simulate(nodes, edges, params):
    # Set infection_rate attribute for each node.
    for node in nodes:
        node['data']['infection_rate'] = params['defaultValue']

    for edge in edges:
        edge['data']['infected'] = 0

    if params['randomlyInfect']:
        nodes[random.randint(0, len(nodes) - 1)]['data']['infection_rate'] = 1.2

    return [nodes, edges, params]

if __name__ == "__main__":
    if (len(sys.argv) != 5):
        print("4 system args required")

        exit(1)

    url = sys.argv[1]
    port = sys.argv[2]
    sid = sys.argv[3]
    key = sys.argv[4]
    title = 'Setup Infection Sim'

    startParams = [
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

    asyncio.run(visgraph.connect(url, port, sid, key, title, startParams, simulate))
