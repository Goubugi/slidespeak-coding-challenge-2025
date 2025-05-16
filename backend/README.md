# SlideSpeak PowerPoint to PDF Backend

This is the backend service for converting PowerPoint `.pptx` files into downloadable PDF documents using [`unoserver`](https://github.com/unoconv/unoserver), exposed through a FastAPI interface.

Converted files are uploaded to AWS S3 and returned to the user via a presigned URL.

---

## Features

- Upload `.pptx` files and convert to `.pdf`
- Background task execution using FastAPI's `BackgroundTasks`
- AWS S3 integration with presigned download URLs
- CORS-restricted API access for frontend integration
- Auto-generated API documentation via Swagger and ReDoc

---

## API Documentation

Once the FastAPI server is running locally, visit:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Running with Docker

To start the `unoserver` container:

```bash
docker compose up --build
