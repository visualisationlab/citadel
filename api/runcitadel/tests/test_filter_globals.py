from runcitadel import filter_globals

import math
import types

def test_filter_globals():
    assert filter_globals


def test_filter_globals_basic():
    def a(): pass

    # Assert that key num hasn't changed
    # assert len(filter_globals(a).items()) == len(a.__globals__.items())
    fun = types.FunctionType(a.__code__, filter_globals(a))

    assert a() == fun()


def test_filter_globals_import():
    def a():
        return math.sqrt(4)

    fun = types.FunctionType(a.__code__, filter_globals(a))

    assert 2 == fun()


def test_filter_globals_class():
    class TestClass:
        def __init__(self):
            self.value = 1

    def a():
        t = TestClass()
        return t.value

    fun = types.FunctionType(a.__code__, filter_globals(a), a.__name__, a.__defaults__, a.__closure__)

    assert 1 == fun()


