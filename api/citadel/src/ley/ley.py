import websockets
import numbers
import json
from jsonschema import validate


def validateStartParamsSchema(data: list):
    schema = {
        "description": "Start parameter schema",
        "type": "object",
        "properties":
        {
            "attribute": {
                "type": "string",
                "description": "The name of the attribute"
            },
            "type": {
                "type": "string",
                "description": "The type of the attribute"
            },
            "defaultValue": {
                "type": ["string", "number", "boolean"],
                "description": "The default value of the attribute"
            }
        }
    }

    print("Validating input parameters...")

    for param in data:
        validate(param, schema)

        if param['type'] == "string":
            if (not isinstance(param["defaultValue"], str)):
                raise Exception("Default value {}".format(param["attribute"])
                                + " must be a string")

        elif param['type'] == "number":
            if (not isinstance(param["defaultValue"], numbers.Number)):
                raise Exception("Default value {}".format(param["attribute"])
                                + " must be a number")

        elif param['type'] == "boolean":
            if (not isinstance(param["defaultValue"], bool)):
                raise Exception("Default value {}".format(param["attribute"])
                                + " must be a boolean")

        else:
            raise Exception("Invalid type {}".format(param["attribute"]))

def checkInputArgs(url: str,
                   port: int,
                   sid: str,
                   key: str,
                   title: str,
                   startParams: list,
                   outputParams: list,
                   simulateFunction):
    """Checks input arguments for connect function."""

    print("Checking passed arguments...")
    if (url == "" or port == "" or sid == "" or key == "" or title == "" or
            simulateFunction is None):

        raise Exception("One or more mandatory input arguments is/are empty")

    if (len(title) > 20):
        raise Exception("Title can be max. 20 characters")

    if (not callable(simulateFunction)):
        raise Exception("Simulate function must be a callable function")

    if len(startParams) > 10:
        raise Exception("Program can have max. 10 starting parameters")

    if len(outputParams) > 5:
        raise Exception("Program can have max. 5 output parameters")

    if not isinstance(port, numbers.Number):
        raise Exception("Port must be a number")


    validateStartParamsSchema(startParams)

async def connect(url: str,
                  port: int,
                  sid: str,
                  key: str,
                  title: str,
                  startParams: list,
                  outputParams: list,
                  simulateFunction):
    """Connects API to the Citadel backend."""

    checkInputArgs(url, port, sid, key, title, startParams, outputParams,
                   simulateFunction)

    uri = f"wss://{url}:{int(port)}?sid={sid}&key={key}"

    print("Connecting to {}:{}...".format(url, port))

    async with(websockets.connect(uri, max_size=2 ** 25,
               ssl=True)) as websocket:
        print("Connected")

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

            print("Received step")

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

                res = simulateFunction(jsonObj['data']['nodes'],
                                       jsonObj['data']['edges'], params)

                params = [res[2][param['attribute']]
                          for param in jsonObj['data']['params']]

                await websocket.send(json.dumps({
                    'sessionID': sid,
                    'messageSource': 'simulator',
                    'messageType': 'set',
                    'dataType': 'data',
                    'apiKey': key,
                    'params': {
                        'nodes': res[0],
                        'edges': res[1],
                        'params': params
                    },

                }))
            except Exception as e:
                print(f'Error! {e}')
