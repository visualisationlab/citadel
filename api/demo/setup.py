import visgraph
import sys
import asyncio

import copy
import random

import networkx as nx

def simulate(nodes, edges, params):
    print(nodes)
    # Set infection_rate attribute for each node.
    for node in nodes:
        node['data']['infection_rate'] = 0

    return [nodes, edges, params]

if __name__ == "__main__":
    if (len(sys.argv) != 5):
        print("4 system args required")

        exit(1)

    url = sys.argv[1]
    port = sys.argv[2]
    sid = sys.argv[3]
    key = sys.argv[4]

    startParams = {
        'test0': 1,
        'test1': 0
    }

    asyncio.run(visgraph.connect(url, port, sid, key, startParams, simulate))