# 1. The Base Plate
FROM python:3.11-slim

# 2. The Table (create a folder inside the container)
WORKDIR /app

# 3. Adding Bricks (copy your local files into that folder)
COPY . .

# 4. Snapping Pieces (install your dependencies)
RUN pip install -r requirements.txt

# 5. The Power Button (how to start your app)
CMD ["python", "main.py"]