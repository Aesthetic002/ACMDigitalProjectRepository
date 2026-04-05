FROM python:3.9-slim

WORKDIR /app
COPY proto /app/proto

WORKDIR /app/services/ranking-service
COPY services/ranking-service/requirements.txt .

RUN pip install -r requirements.txt
RUN mkdir -p /app/services/ranking-service/proto && touch /app/services/ranking-service/proto/__init__.py
RUN python -m grpc_tools.protoc -I/app/proto --python_out=/app/services/ranking-service/proto --grpc_python_out=/app/services/ranking-service/proto /app/proto/*.proto

COPY services/ranking-service/main.py .

EXPOSE 50057
ENV PYTHONPATH=/app/services/ranking-service
ENV PYTHONUNBUFFERED=1
CMD ["python", "main.py"]