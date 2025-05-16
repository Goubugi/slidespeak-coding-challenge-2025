from unittest.mock import patch
from app import convert_and_upload, jobs
import os


@patch("app.requests.post")
@patch("app.s3.upload_file")
@patch("app.s3.generate_presigned_url")


# Convert successful, assert that everything we need is there.
def test_convert_success(mock_presign, mock_upload, mock_post):
    job_id = "test123"
    pptx_path = f"/tmp/{job_id}.pptx"
    pdf_path = pptx_path.replace(".pptx", ".pdf")

    # Create fake pptx file
    with open(pptx_path, "wb") as f:
        f.write(b"%PPTX content")

    mock_post.return_value.status_code = 200
    mock_post.return_value.content = b"%PDF content"
    mock_presign.return_value = "https://mock-s3-url.com/file.pdf"

    convert_and_upload(job_id, pptx_path, "slides.pptx")

    assert jobs[job_id]["status"] == "done"
    assert jobs[job_id]["download_url"] == "https://mock-s3-url.com/file.pdf"
    assert not os.path.exists(pptx_path)
    assert not os.path.exists(pdf_path)


# Convert fails for some reason, and we check to see if it correctly detects that.
@patch("app.requests.post")
def test_convert_failure(mock_post):
    job_id = "fail123"
    pptx_path = f"/tmp/{job_id}.pptx"

    # Create fake pptx file
    with open(pptx_path, "wb") as f:
        f.write(b"bad content")

    mock_post.return_value.status_code = 500
    mock_post.return_value.text = "Unoserver crashed"

    convert_and_upload(job_id, pptx_path, "slides.pptx")

    assert jobs[job_id]["status"] == "error"
    assert "Unoserver failed" in jobs[job_id]["error"]
