import asyncio
import websockets
import json


async def connect(  url: str,
                    port: int,
                    sid: str,
                    key: str,
                    startParams: json,
                    simulateFunction):

    uri = f"ws://{url}:{int(port)}?sid={sid}&key={key}"

    async with(websockets.connect(uri)) as websocket:
        while (1):
            print('Received new message')

            response = await websocket.recv()

            # Response format: [nodes, edges, params]
            try:
                jsonObj = json.loads(response)

                res = simulateFunction(jsonObj['nodes'], jsonObj['edges'], {})

                await websocket.send(json.dumps({
                    'sid': sid,
                    'nodes': res[0],
                    'edges': res[1],
                    'params': {}
                }))
            except Exception as e:
                print(f'Error! {e}')
