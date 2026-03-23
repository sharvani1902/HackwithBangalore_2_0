---
description: How to deploy the AI Project Manager (FastAPI + React)
---

# Deployment Workflow

Follow these steps to deploy the complete application.

// turbo
1. Build the Frontend Production Bundle
   - Navigate to `frontend/`
   - Run `npm install`
   - Run `npm run build`
   - The production files will be in `frontend/dist`.

2. Set Up the Backend Production Environment
   - Navigate to the root directory
   - Create a virtual environment: `python -m venv venv`
   - Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Linux)
   - Install dependencies: `pip install -r requirements.txt`

3. Configure Environment Variables
   - Create a `.env` file in the root directory for the backend (Database URL, Secret Keys).
   - Ensure the frontend's `API_URL` points to your production backend.

4. Serve the Application
   - **Backend**: Use a production server like `gunicorn` with `uvicorn` workers:
     `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`
   - **Frontend**: Serve the `frontend/dist` directory using Nginx, Apache, or a service like Vercel/Netlify.
