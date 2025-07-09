from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/test")
def test():
    return {"message": "test server working"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 