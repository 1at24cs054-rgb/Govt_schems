from fastapi import FastAPI
from pydantic import BaseModel
import json

# -----------------------------------
# AI IMPORTS
# -----------------------------------

from langchain_community.vectorstores import Chroma

from langchain_community.embeddings import HuggingFaceEmbeddings

from langchain_community.llms import Ollama


# -----------------------------------
# FASTAPI APP
# -----------------------------------

app = FastAPI()


# -----------------------------------
# LOAD DATASET
# -----------------------------------

try:

    with open(
        "schemes.json",
        encoding="utf-8"
    ) as file:

        schemes = json.load(file)

except Exception as e:

    print("DATASET ERROR:", e)

    schemes = []


# -----------------------------------
# CREATE AI DOCUMENTS
# -----------------------------------

documents = []

for scheme in schemes:

    text = f"""

    Scheme Name:
    {scheme.get("scheme_name")}

    Details:
    {scheme.get("scheme_details")}

    Website:
    {scheme.get("website")}

    """

    documents.append(text)


# -----------------------------------
# CREATE EMBEDDINGS
# -----------------------------------

embedding = HuggingFaceEmbeddings(

    model_name=
    "sentence-transformers/all-MiniLM-L6-v2"

)


# -----------------------------------
# CREATE VECTOR DATABASE
# -----------------------------------

db = Chroma.from_texts(

    documents,

    embedding

)


# -----------------------------------
# LOAD MISTRAL MODEL
# -----------------------------------

llm = Ollama(
    model="mistral"
)


# -----------------------------------
# FARMER INPUT MODEL
# -----------------------------------

class Farmer(BaseModel):

    land_size: float
    income: float
    age: int


# -----------------------------------
# HOME ROUTE
# -----------------------------------

@app.get("/")
def home():

    return {

        "message":
        "Jeevandhara Backend Running",

        "total_schemes_loaded":
        len(schemes)

    }


# -----------------------------------
# ELIGIBILITY API
# -----------------------------------

@app.post("/check")
def check_scheme(farmer: Farmer):

    matched_schemes = []

    for scheme in schemes:

        try:

            scheme_name = scheme.get(
                "scheme_name",
                "Unknown Scheme"
            )

            website = scheme.get(
                "website",
                "No Website"
            )

            details = scheme.get(
                "scheme_details",
                {}
            )

            land_ok = True
            income_ok = True
            age_ok = True


            # -------------------------
            # LAND CHECK
            # -------------------------

            land_limit = details.get(
                "land_limit"
            )

            if isinstance(
                land_limit,
                (int, float)
            ):

                if farmer.land_size > land_limit:

                    land_ok = False


            # -------------------------
            # INCOME CHECK
            # -------------------------

            income_limit = details.get(
                "income_limit"
            )

            if isinstance(
                income_limit,
                dict
            ):

                amount = income_limit.get(
                    "amount"
                )

                if isinstance(
                    amount,
                    (int, float)
                ):

                    if farmer.income > amount:

                        income_ok = False


            # -------------------------
            # AGE CHECK
            # -------------------------

            age_limit = details.get(
                "age_limit"
            )

            if isinstance(
                age_limit,
                dict
            ):

                minimum_age = age_limit.get(
                    "minimum_age"
                )

                maximum_age = age_limit.get(
                    "maximum_age"
                )

                if minimum_age is not None:

                    if farmer.age < minimum_age:

                        age_ok = False

                if maximum_age is not None:

                    if farmer.age > maximum_age:

                        age_ok = False


            # -------------------------
            # FINAL ELIGIBILITY
            # -------------------------

            if (
                land_ok and
                income_ok and
                age_ok
            ):

                matched_schemes.append({

                    "scheme_name":
                    scheme_name,

                    "website":
                    website

                })

        except Exception as error:

            print(
                "Skipping broken scheme:",
                error
            )

            continue

    return {

        "total_eligible":
        len(matched_schemes),

        "eligible_schemes":
        matched_schemes

    }


# -----------------------------------
# AI CHATBOT API
# -----------------------------------

@app.post("/ask")
def ask_ai(question: str):

    results = db.similarity_search(
        question
    )

    context = results[0].page_content


    prompt = f"""

    Answer the question
    using the given context.

    Context:
    {context}

    Question:
    {question}

    """


    response = llm.invoke(
        prompt
    )

    return {

        "question":
        question,

        "answer":
        response

    }