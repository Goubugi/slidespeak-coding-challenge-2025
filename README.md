# Powerpoint To PDF Tool

## Implementation - Back-end
Implemented with FastAPI, and calls the unoserver via Docker image to process the converting logic.

Caches the .pptx file locally, and deletes it when the job_id is done / error is thrown.

Uploads the file to Amazon S3, and creates a presigned download for 10 minutes.

The S3 bucket has a lifecycle rule that deletes powerpoints 1 day after creation (can create a lambda function for sooner deletetion).

Tests are implemented with PyTest.

API is documented with the file, as well as [localhost:8000/](http://localhost:8000/docs)


## Implementation - Front-end
Implemented with NextJS, using the Figma design provided.

Broken down into functional components.

Not reliant on useEffect.

Tests are implemented for Axios and Jest.



## Notes
Unoserver's port 2004 is exposed (okay for local development) or via a local network, not safe for production.

FastAPI's Background tasks are not truly concurrent. The program can handle multiple jobs at once, but proccesses them sequentially.
  - Would need to host the backend with multiple instances, and a distributed message queue for it to be truly concurrent.

