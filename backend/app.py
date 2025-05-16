from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import requests
import boto3
import time
from dotenv import load_dotenv
import os

app = FastAPI()

# Allow CORS (you can lock this down later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend
    allow_methods=["*"],
    allow_headers=["*"],
)


jobs = {}

# AWS S3 config
#S3_BUCKET = "your-bucket-name"
#s3 = boto3.client("s3")  # Make sure your AWS creds are set via env or ~/.aws

load_dotenv('.env.local')

UNOSERVER_URL = os.getenv("UNOSERVER_URL")

def convert_and_upload(job_id: str, pptx_path: str):
    pdf_path = pptx_path.replace(".pptx", ".pdf")
    jobs[job_id] = {"status": "converting", "error": None, "download_url": None}
    try:
        with open(pptx_path, 'rb') as f:
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
       # s3_key = f"converted/{job_id}.pdf"
        #s3.upload_file(pdf_path, S3_BUCKET, s3_key)

        # Presigned URL
       # url = s3.generate_presigned_url(
       #     "get_object",
       #     Params={"Bucket": S3_BUCKET, "Key": s3_key},
       #     ExpiresIn=3600
      #  )
        time.sleep(10)
        jobs[job_id]["status"] = "done"
        jobs[job_id]["download_url"] = "www.google.com"

        os.remove(pptx_path)
        os.remove(pdf_path)

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if not file.filename.endswith(".pptx"):
        return JSONResponse(status_code=400, content={"error": "Only .pptx files are supported"})

    job_id = str(uuid.uuid4())
    pptx_path = f"/tmp/{job_id}.pptx"

    with open(pptx_path, "wb") as f:
        f.write(await file.read())

    background_tasks.add_task(convert_and_upload, job_id, pptx_path)

    return {"job_id": job_id}

@app.get("/status/{job_id}")
def get_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return job
