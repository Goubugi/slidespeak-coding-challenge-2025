from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import requests
import boto3
from dotenv import load_dotenv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

load_dotenv(".env.local")

jobs = {}

# AWS S3 config
s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    endpoint_url=os.getenv("endpoint_url"),
)


UNOSERVER_URL = os.getenv("UNOSERVER_URL")


def convert_and_upload(job_id: str, pptx_path: str, original_filename: str):
    """
    Converts a PPTX file to PDF using Unoserver and uploads it to S3.

    Args:
        job_id (str): Unique ID for the job.
        pptx_path (str): Path to the input PowerPoint file.
        original_filename (str): Original name of the file for download naming.

    Side Effects:
        - Writes PDF to /tmp
        - Uploads to S3
        - Updates global `jobs` dict
        - Removes temporary files
    """
    pdf_path = pptx_path.replace(".pptx", ".pdf")
    jobs[job_id] = {"status": "converting", "error": None, "download_url": None}
    try:

        # Call the unoserver, try to convert pptx to pdf
        with open(pptx_path, "rb") as f:
            response = requests.post(
                UNOSERVER_URL,
                files={"file": f},
                data={"convert-to": "pdf"},
            )
        if response.status_code != 200:
            raise Exception("Unoserver failed: " + response.text)

        with open(pdf_path, "wb") as out:
            out.write(response.content)

        # Upload to S3
        s3_key = f"converted/{job_id}.pdf"
        s3.upload_file(pdf_path, os.getenv("S3_BUCKET"), s3_key)

        # Generate presigned download URL for that key, expires in 10 minutes.
        url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": os.getenv("S3_BUCKET"),
                "Key": s3_key,
                "ResponseContentDisposition": f'attachment; filename="{original_filename.replace(".pptx", ".pdf")}"',
            },
            ExpiresIn=600,
        )

        # Book keeping.
        jobs[job_id]["status"] = "done"
        jobs[job_id]["download_url"] = url
        os.remove(pptx_path)
        os.remove(pdf_path)

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        os.remove(pdf_path)


@app.post(
    "/upload",
    summary="Upload a PPTX file",
    description="Accepts a PowerPoint .pptx file and begins the conversion to PDF by adding it to a background task.",
)
async def upload_file(
    file: UploadFile = File(...), background_tasks: BackgroundTasks = None
):
    """
    Handles incoming PPTX file uploads and starts a background job to convert the file to PDF.

    Args:
        file (UploadFile): The uploaded PowerPoint (.pptx) file.
        background_tasks (BackgroundTasks): FastAPI background task manager used to run the conversion asynchronously.

    Returns:
        dict: A JSON object containing the generated job ID (e.g., {"job_id": "<uuid>"}).

    Side Effects:
        - Saves the uploaded file to /tmp with a UUID-based filename
        - Triggers a background task to:
            • Convert the file to PDF via Unoserver
            • Upload the result to S3
            • Generate a presigned download URL
            • Clean up temporary files
        - Updates the global `jobs` dictionary with job status and metadata
    """
    if not file.filename.endswith(".pptx"):
        return JSONResponse(
            status_code=400, content={"error": "Only .pptx files are supported"}
        )

    job_id = str(uuid.uuid4())
    pptx_path = f"/tmp/{job_id}.pptx"

    with open(pptx_path, "wb") as f:
        f.write(await file.read())

    background_tasks.add_task(convert_and_upload, job_id, pptx_path, file.filename)

    return {"job_id": job_id}


@app.get(
    "/status/{job_id}",
    summary="Checks if current job is completed",
    description="Accepts a job_id, and returns status of that job. If not found, returns error:404.",
)
def get_status(job_id: str):
    """
    Retrieves the processing status of a specific job by its ID.

    Args:
        job_id (str): The unique identifier for the conversion job.

    Returns:
        dict: A dictionary containing the job status and optional metadata, such as error or download URL.
              Example:
              {
                  "status": "done",
                  "download_url": "https://..."
              }

    Raises:
        JSONResponse: Returns a 404 JSON response if the job ID is not found in the global jobs dictionary.
    """
    job = jobs.get(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return job
