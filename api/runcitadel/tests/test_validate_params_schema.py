from runcitadel import validate_params_schema

def test_validate_params_schema_string():
    params = [
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        }
    ]

    validate_params_schema(params)


def test_validate_params_schema_integer():
    params = [
        {
            "attribute": "test",
            "type": "integer",
            "defaultValue": 1
        }
    ]

    validate_params_schema(params)


def test_validate_params_schema_boolean():
    params = [
        {
            "attribute": "test",
            "type": "boolean",
            "defaultValue": True
        }
    ]

    validate_params_schema(params)


def test_validate_params_schema_float():
    params = [
        {
            "attribute": "test",
            "type": "float",
            "defaultValue": 1.0
        }
    ]

    validate_params_schema(params)


def test_validate_params_schema_integer_range():
    params = [
        {
            "attribute": "test",
            "type": "integer",
            "defaultValue": 1,
            "min": 1,
            "max": 10
        }
    ]

    validate_params_schema(params)


def test_validate_params_schema_float_range():
    params = [
        {
            "attribute": "test",
            "type": "float",
            "defaultValue": 1.0,
            "min": 1.0,
            "max": 10.0
        }
    ]

    validate_params_schema(params)
