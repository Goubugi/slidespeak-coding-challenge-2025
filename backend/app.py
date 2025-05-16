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

load_dotenv('.env.local')

jobs = {}

# AWS S3 config
s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    endpoint_url="https://s3.eu-west-2.amazonaws.com",
)


UNOSERVER_URL = os.getenv("UNOSERVER_URL")

def convert_and_upload(job_id: str, pptx_path: str, original_filename: str):
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
        s3_key = f"converted/{job_id}.pdf"

        # Upload to S3
        s3.upload_file(pdf_path, os.getenv("S3_BUCKET"), s3_key)

        # Generate presigned download URL for that key
        url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": os.getenv("S3_BUCKET"),
            "Key": s3_key,
            "ResponseContentDisposition": f'attachment; filename="{original_filename.replace(".pptx", ".pdf")}"'
        },
        ExpiresIn=600
    )
        
        print("Uploading key:", s3_key)
        print("Presigned URL:", url)


        #time.sleep(10)
        jobs[job_id]["status"] = "done"
        jobs[job_id]["download_url"] = url

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

    background_tasks.add_task(
    convert_and_upload,
    job_id,
    pptx_path,
    file.filename 
    )

    return {"job_id": job_id}

@app.get("/status/{job_id}")
def get_status(job_id: str):
    job = jobs.get(job_id)
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return job
