from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from langchain.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA

import uvicorn

# --------- PDF & Model Setup (runs once at startup) ---------
PDF_PATH = "data5.pdf"  # Place your PDF in the same directory

print("Loading PDF...")
loader = PyPDFLoader(PDF_PATH)
pages = loader.load_and_split()

print("Splitting text...")
text_splitter = CharacterTextSplitter(
    chunk_size=350,
    chunk_overlap=20,
    separator="\n"
)
chunks = text_splitter.split_documents(pages)

print("Building vector store...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = FAISS.from_documents(chunks, embeddings)

print("Loading Flan-T5...")
model_id = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
text2text_pipeline = pipeline(
    "text2text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=200,
    temperature=0.3
)
llm = HuggingFacePipeline(pipeline=text2text_pipeline)

print("Setting up QA chain...")
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever()
)

# --------- FastAPI Setup ---------
app = FastAPI()

# Allow CORS for local HTML frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:8000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

@app.post("/api/chat")
async def chat(query: Query):
    response = qa_chain.run(query.question)
    return {"answer": response}

# --------- Run with: uvicorn app:app --reload ---------
