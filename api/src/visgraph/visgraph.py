import asyncio
import websockets
import json

async def connect(  url: str,
                    port: int,
                    sid: str,
                    key: str,
                    title: str,
                    startParams: json,
                    simulateFunction):

    uri = f"wss://{url}:{int(port)}?sid={sid}&key={key}"

    async with(websockets.connect(uri, max_size=2 ** 25, ssl=True)) as websocket:
        await websocket.send(json.dumps({
            'sessionID': sid,
            'messageSource': 'simulator',
            'messageType': 'set',
            'dataType': 'register',
            'apiKey': key,
            'data': json.dumps(startParams),
            'title': title,
        }))

        while (1):
            response = await websocket.recv()

            print('Received new message')

            # Response format: [nodes, edges, params]
            try:
                jsonObj = json.loads(response)

                params = {}

                for param in jsonObj['data']['params']:
                    if (param['type'] == 'integer'):
                        params[param['attribute']] = int(param['value'])
                    elif (param['type'] == 'string'):
                        params[param['attribute']] = str(param['value'])
                    elif (param['type'] == 'float'):
                        params[param['attribute']] = float(param['value'])
                    elif (param['type'] == 'boolean'):
                        params[param['attribute']] = bool(param['value'])


                res = simulateFunction(jsonObj['data']['nodes'], jsonObj['data']['edges'], params)

                await websocket.send(json.dumps({
                    'sessionID': sid,
                    'messageSource': 'simulator',
                    'messageType': 'set',
                    'dataType': 'data',
                    'apiKey': key,
                    'params': {
                        'nodes': res[0],
                        'edges': res[1],
                        'params': [res[2][param['attribute']] for param in jsonObj['data']['params']]
                    },

                }))
            except Exception as e:
                print(f'Error! {e}')
