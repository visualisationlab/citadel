import websockets
import ssl
import pathlib
import json
from jsonschema import validate
import jsonschema


def validate_schema(schema, data):
    """Validates the data against the schema."""

    try:
        validate(data, schema)
    except Exception as e:
        print(f'Error! {e}')


def validate_params_schema(data):
    schema = {
        "type": "array",
        "description": "Start parameters schema",
        "items": {
            "type": "object",
            "oneOf": [
                {
                "type": "object",
                "properties": {
                    "attribute": {
                        "type": "string",
                        "description": "The name of the attribute"
                    },
                    "type": {
                        "type": "string",
                        "description": "The type of the attribute"
                    },
                    "defaultValue": {
                        "type": "string",
                        "description": "The default value of the attribute"
                    }
                },
                },
                {
                    "type": "object",
                    "properties": {
                        "attribute": {
                            "type": "number",
                            "description": "The name of the attribute"
                        },
                        "type": {
                            "type": "string",
                            "description": "The type of the attribute"
                        },
                        "defaultValue": {
                            "type": "number",
                            "description": "The default value of the attribute"
                        }
                    }
                }
            ]
        }
    }

    validate_schema(schema, data)


def process_response(response, simulatefun):
    print("Processing data...")

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

        print("Simulating step...")

        res = simulatefun(jsonObj['data']['nodes'],
                                jsonObj['data']['edges'], params)

        params = [res[2][param['attribute']]
                    for param in jsonObj['data']['params']]

        return res
    except Exception as e:
        print(f'Error! {e}')


async def connect(url: str,
                  port: int,
                  sid: str,
                  key: str,
                  title: str,
                  startParams: json,
                  simulatefun,
                  schema: json):
    """Connects API to the VisGraph server."""

    uri = f"wss://{url}:{int(port)}?sid={sid}&key={key}"

    print("Connecting to {}:{}...".format(url, port))

    validator = jsonschema.Validator

    try:
        validator.check_schema(schema)

        has_schema = True
    except Exception as e:
        has_schema = False
    ssl._create_default_https_context = ssl._create_unverified_context
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    async with(websockets.connect(uri, max_size=2 ** 25, ssl=ctx)) as websocket:
        print("Connected")

        await websocket.send(json.dumps({
            'sessionID': sid,
            'messageSource': 'simulator',
            'messageType': 'set',
            'dataType': 'register',
            'apiKey': key,
            'data': json.dumps(startParams),
            'validator': has_schema,
            'title': title,
        }))

        while (1):
            response = await websocket.recv()

            result = process_response(response, simulatefun)

            await websocket.send(json.dumps({
                'sessionID': sid,
                'messageSource': 'simulator',
                'messageType': 'set',
                'dataType': 'data',
                'apiKey': key,
                'params': {
                    'nodes': result[0],
                    'edges': result[1],
                    'params': result[2]
                },
            }))
