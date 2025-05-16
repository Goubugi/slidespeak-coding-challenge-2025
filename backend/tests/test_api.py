import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app
from fastapi.testclient import TestClient
from unittest.mock import patch
from app import jobs

client = TestClient(app)


# Asserts only .pptx files are sent.
def test_upload_rejects_invalid_file():
    response = client.post("/upload", files={"file": ("test.txt", b"not a pptx")})
    assert response.status_code == 400
    assert response.json()["error"] == "Only .pptx files are supported"


# Asserts bad job_ids return 404.
def test_status_not_found():
    response = client.get("/status/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["error"] == "Job not found"


# Asserts that job_id is a valid job_id, if we upload and convert a slide.
@patch("app.convert_and_upload")
def test_upload_accepts_pptx(mock_task):
    response = client.post(
        "/upload", files={"file": ("slides.pptx", b"%PPTX binary content")}
    )
    assert response.status_code == 200
    assert "job_id" in response.json()
    mock_task.assert_called_once()


# When the fake job is finished, it correct updates it to done, and that the download_url is there.
def test_status_done_job():
    job_id = "fake123"
    jobs[job_id] = {"status": "done", "download_url": "https://mock-url/file.pdf"}
    response = client.get(f"/status/{job_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "done"
    assert "download_url" in response.json()
