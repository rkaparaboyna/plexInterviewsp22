'''
    This python module serves as a testing script to ensure 
    critical portions of the PlexTech Petstore works as intended!

    Specification: https://app.swaggerhub.com/apis-docs/AkshatJain1/Petstore/2.0.0
'''
import pytest
import requests

def test_availability():
    r = requests.get("http://localhost:8000/flabbergasted")
    assert r.status_code == 404

# TODO: Add more tests