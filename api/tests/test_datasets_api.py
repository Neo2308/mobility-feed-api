# coding: utf-8
from fastapi.testclient import TestClient


def test_datasets_gtfs_id_get(client: TestClient):
    """Test case for datasets_gtfs_id_get"""

    headers = {
        "ApiKeyAuth": "special-key",
    }
    response = client.request(
        "GET",
        "/v1/datasets/gtfs/{id}".format(id="mdb-1"),
        headers=headers,
    )

    assert response.status_code == 200


def test_feeds_gtfs_id_datasets_get(client: TestClient):
    """Test case for feeds_gtfs_id_datasets_get"""
    params = [
        ("latest", False),
        ("limit", 10),
        ("offset", 0),
        ("filter", "status=active"),
        ("sort", "+provider"),
        ("bounding_latitudes", "41.46,42.67"),
        ("bounding_longitudes", "-78.58,-87.29"),
        ("bounding_filter_method", "completely_enclosed"),
    ]
    headers = {
        "ApiKeyAuth": "special-key",
    }
    response = client.request(
        "GET",
        "/v1/gtfs_feeds/{id}/datasets".format(id="mdb-1"),
        headers=headers,
        params=params,
    )

    assert response.status_code == 200