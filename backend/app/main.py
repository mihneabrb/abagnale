from fastapi import FastAPI

app = FastAPI(title="Abagnale API")
@app.get("/")
def read_root():
    return {"message": "Abagnale API is running"}