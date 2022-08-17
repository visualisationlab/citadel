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
        inf_rate = float(G.nodes[node['data']['id']]['infection_rate'])

        if (inf_rate > 0):
            if (inf_rate < 5):
                node['data']['infection_rate'] = inf_rate + random.randint(0, 1) / 10
                continue

        else:
            # node['data']['infection_rate'] = inf_rate

            for n_node in G.neighbors(node['data']['id']):
                if float(G.nodes[n_node]['infection_rate']) > 0:
                    node['data']['infection_rate'] = 0.1
                    edgeID = G.get_edge_data(node['data']['id'], G.nodes[n_node]['id'])['id']

                    def infect(edge):
                        if (edge['data']['id'] == edgeID): edge['data']['infected'] = edge['data']['infected'] + 1

                        return edge

                    edges = list(map(infect, edges))
                    break

    # for node in nodes:
    #     print(node)
    #     node['data'] = G.nodes(node['data']['id'])

    #     print(node)

    print('done simulating...')
    return [nodes, edges, params]

if __name__ == "__main__":
    if (len(sys.argv) != 5):
        print("4 system args required")

        exit(1)

    url = sys.argv[1]
    port = sys.argv[2]
    sid = sys.argv[3]
    key = sys.argv[4]
    title = 'Infection Sim'

    startParams = []

    asyncio.run(visgraph.connect(url, port, sid, key, title, startParams, simulate))
