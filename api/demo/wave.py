import visgraph
import sys
import asyncio

import copy
import random

import networkx as nx

def simulate(nodes, edges, params):
    # Set infection_rate attribute for each node.

    print('simulating...')
    G = nx.Graph()
    G.add_nodes_from([(node['data']['id'], dict(node['data'])) for node in nodes])
    G.add_edges_from([[edge['data']['source'], edge['data']['target'], edge['data']] for edge in edges])

    for node in nodes:
        node['data']['degree'] = int(G.degree(node['data']['id']))

        infected = bool(G.nodes[node['data']['id']]['infected'])

        infection_rate = float(G.nodes[node['data']['id']]['infection_rate'])

        if (infected):
            print('infected')
            node['data']['infection_rate'] = infection_rate + params['speed']
            print(infection_rate)
            print(params['speed'])
            print(node['data']['infection_rate'])

            if infection_rate > 10.0:
                node['data']['infected'] = False
        else:
            if node['data']['infection_rate'] > 0.0:
                node['data']['infection_rate'] = infection_rate - params['speed']

            # node['data']['infection_rate'] = inf_rate

            for n_node in G.neighbors(node['data']['id']):
                if bool(G.nodes[n_node]['infected']):
                    node['data']['infected'] = True
                    edgeID = G.get_edge_data(node['data']['id'], G.nodes[n_node]['id'])['id']

                    # def infect(edge):
                        # if (edge['data']['id'] == edgeID): edge['data']['infected'] = edge['data']['infected'] + 1

                        # return edge

                    # edges = list(map(infect, edges))
                    break

    # for node in nodes:
    #     print(node)
    #     node['data'] = G.nodes(node['data']['id'])

    #     print(node)

    return [nodes, edges, params]

if __name__ == "__main__":
    if (len(sys.argv) != 5):
        print("4 system args required")

        exit(1)

    url = sys.argv[1]
    port = sys.argv[2]
    sid = sys.argv[3]
    key = sys.argv[4]
    title = 'Wave'

    startParams = [
        {
            'attribute': 'speed',
            'type': 'float',
            'defaultValue': 0.5,
        },
        {
            'attribute': 'max',
            'type': 'float',
            'defaultValue': 10,
        },
        {
            'attribute': 'min',
            'type': 'float',
            'defaultValue': 0,
        },
    ]

    asyncio.run(visgraph.connect(url, port, sid, key, title, startParams, simulate))
