from runcitadel import validate_params_schema
import pytest
import jsonschema.exceptions

def test_validate_params_schema_validation_error():
    params = [
        {
            "attribute": 1,
            "type": "string",
            "defaultValue": "test"
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)

def test_validate_params_schema_validation_error2():
    params = [
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": 1
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error3():
    params = [
        {
            "attribute": "test",
            "type": "integer",
            "defaultValue": "test"
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error4():
    params = [
        {
            "attribute": "test",
            "type": "boolean",
            "defaultValue": "test"
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error5():
    params = [
        {
            "attribute": "test",
            "type": "boolean",
            "defaultValue": 1
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error6():
    params = [
        {
            "attribute": "test",
            "type": "float",
            "defaultValue": True
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error_size():
    params = [
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },
        {
            "attribute": "test",
            "type": "string",
            "defaultValue": "test"
        },

    ]

    with pytest.raises(ValueError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error_float_range():
    params = [
        {
            "attribute": "test",
            "type": "float",
            "defaultValue": 1.0,
            "min": 1.0
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)


def test_validate_params_schema_validation_error_float_range2():
    params = [
        {
            "attribute": "test",
            "type": "float",
            "defaultValue": 1.0,
            "max": 1.0
        }
    ]

    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_params_schema(params)
