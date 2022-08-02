import visgraph
import sys
import asyncio

import copy
import random

def simulate(nodes, edges, params):
    if (len(nodes) == 0):
        nodes = [{
            'data': {
                'id': 'something'
            }
        }]
    newNode = copy.deepcopy(nodes[0])

    newID = newNode['data']['id'] + str(random.randint(0, 10000))

    newNode['data']['id'] = newID
    newNode['data']['income'] = int(newNode['data']['income']) + 5

    nodes.append(newNode)

    newEdge = copy.deepcopy(edges[0])

    newEdge['data']['source'] = newID

    edges.append(newEdge)

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
