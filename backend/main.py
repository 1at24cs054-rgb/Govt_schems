
import json
import re
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama

from database import conn, cursor

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
with open("schemes.json", "r", encoding="utf-8") as file:
    schemes = json.load(file)
    documents = []

for scheme in schemes:

    text = f"""

    Scheme Name:
    {scheme.get('scheme_name')}

    Title:
    {scheme.get('title')}

    Details:
    {scheme.get('scheme_details')}

    Website:
    {scheme.get('website')}

    """

    documents.append(text)
embedding = HuggingFaceEmbeddings(
    model_name=
    "sentence-transformers/all-MiniLM-L6-v2"
)

db = Chroma.from_texts(
    documents,
    embedding
)

llm = Ollama(
    model="mistral"
)



# =========================
# REGISTER MODEL
# =========================

class RegisterUser(BaseModel):

    username: str
    password: str

    name: str

    age: int
    income: float
    land_size: float

    state: str
    district: str


# =========================
# LOGIN MODEL
# =========================

class LoginUser(BaseModel):

    username: str
    password: str
class Question(BaseModel):

    question: str

# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message": "Jeevandhara Backend Running"
    }


# =========================
# REGISTER
# =========================

@app.post("/register")
def register(user: RegisterUser):

    try:

        cursor.execute(
            """
            INSERT INTO farmers(

            username,
            password,
            name,
            age,
            income,
            land_size,
            state,
            district

            )

            VALUES(?,?,?,?,?,?,?,?)

            """,
            (
                user.username,
                user.password,
                user.name,
                user.age,
                user.income,
                user.land_size,
                user.state,
                user.district
            )
        )

        conn.commit()

        return {
            "status": "success",
            "message": "Registration Successful"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": str(e)
        }


# =========================
# LOGIN
# =========================

@app.post("/login")
def login(user: LoginUser):

    cursor.execute(
        """
        SELECT *

        FROM farmers

        WHERE username=?
        AND password=?
        """,
        (
            user.username,
            user.password
        )
    )

    farmer = cursor.fetchone()

    if farmer:

        return {
            "status": "success",
            "user_id": farmer[0],
            "name": farmer[3]
        }

    return {
        "status": "failed",
        "message": "Invalid Credentials"
    }


# =========================
# PROFILE
# =========================

@app.get("/profile/{user_id}")
def profile(user_id: int):

    cursor.execute(
        "SELECT * FROM farmers WHERE id=?",
        (user_id,)
    )

    farmer = cursor.fetchone()

    if not farmer:
        return {
            "message": "Farmer not found"
        }

    return {
        "id": farmer[0],
        "username": farmer[1],
        "name": farmer[3],
        "age": farmer[4],
        "income": farmer[5],
        "land_size": farmer[6],
        "state": farmer[7],
        "district": farmer[8]
    }


# =========================
# HELPER FUNCTIONS
# =========================

def get_max_land(land_limit):

    if land_limit is None:
        return None

    if isinstance(land_limit, dict):

        value = land_limit.get(
            "maximum_land_holding"
        )

        if value:

            numbers = re.findall(
                r"\d+\.?\d*",
                value
            )

            if numbers:
                return float(numbers[0])

    return None


def is_eligible(farmer, scheme):

    age = farmer[4]
    income = farmer[5]
    land_size = farmer[6]

    details = scheme.get(
        "scheme_details",
        {}
    )

    age_limit = details.get("age_limit")

    if isinstance(age_limit, dict):

        min_age = age_limit.get(
            "minimum_age"
        )

        max_age = age_limit.get(
            "maximum_age"
        )

        if min_age is not None and age < min_age:
            return False

        if max_age is not None and age > max_age:
            return False

    income_limit = details.get(
        "income_limit"
    )

    if isinstance(income_limit, dict):

        amount = income_limit.get(
            "amount"
        )

        if amount and income > amount:
            return False

    land_limit = details.get(
        "land_limit"
    )

    max_land = get_max_land(
        land_limit
    )

    if max_land and land_size > max_land:
        return False

    return True


# =========================
# RECOMMEND SCHEMES
# =========================

def is_eligible(farmer, scheme):

    age = farmer[4]
    income = farmer[5]
    land_size = farmer[6]

    details = scheme.get(
        "scheme_details",
        {}
    )

    # -----------------
    # AGE CHECK
    # -----------------

    age_limit = details.get(
        "age_limit"
    )

    if isinstance(age_limit, dict):

        min_age = age_limit.get(
            "minimum_age"
        )

        max_age = age_limit.get(
            "maximum_age"
        )

        if min_age is not None:

            if age < min_age:
                return False

        if max_age is not None:

            if age > max_age:
                return False

    # -----------------
    # INCOME CHECK
    # -----------------

    income_limit = details.get(
        "income_limit"
    )

    if isinstance(income_limit, dict):

        amount = income_limit.get(
            "amount"
        )

        if amount:

            if income > float(amount):
                return False

    # -----------------
    # LAND CHECK
    # -----------------

    land_limit = details.get(
        "land_limit"
    )

    if isinstance(land_limit, dict):

        max_land_text = land_limit.get(
            "maximum_land_holding"
        )

        if max_land_text:

            numbers = re.findall(
                r"\d+\.?\d*",
                max_land_text
            )

            if numbers:

                max_land = float(
                    numbers[0]
                )

                if land_size > max_land:
                    return False

    return True
# =========================
# RECOMMEND SCHEMES
# =========================

@app.get("/recommend/{user_id}")
def recommend(user_id: int):

    cursor.execute(
        "SELECT * FROM farmers WHERE id=?",
        (user_id,)
    )

    farmer = cursor.fetchone()

    if not farmer:

        return {
            "message": "Farmer not found"
        }

    eligible_schemes = []

    for scheme in schemes:

        try:

            if is_eligible(farmer, scheme):

                details = scheme.get(
                    "scheme_details",
                    {}
                )

                reason = []

                if details.get("age_limit"):
                    reason.append(
                        f"Age {farmer[4]} satisfies scheme criteria"
                    )

                if details.get("income_limit"):
                    reason.append(
                        f"Income {farmer[5]} satisfies scheme criteria"
                    )

                if details.get("land_limit"):
                    reason.append(
                        f"Land size {farmer[6]} satisfies scheme criteria"
                    )

                eligible_schemes.append({

                    "scheme_name":
                    scheme.get("scheme_name"),

                    "title":
                    scheme.get("title"),

                    "website":
                    scheme.get("website"),

                    "why_recommended":
                    reason,

                    "benefits":
                    details.get(
                        "benefits",
                        []
                    ),

                    "documents_required":
                    details.get(
                        "documents_required",
                        []
                    ),

                    "application_process":
                    details.get(
                        "application_process",
                        []
                    )

                })

        except Exception:
            continue

    return {

        "farmer_name":
        farmer[3],

        "age":
        farmer[4],

        "income":
        farmer[5],

        "land_size":
        farmer[6],

        "total_eligible":
        len(eligible_schemes),

        "eligible_schemes":
        eligible_schemes

    }
@app.get("/dashboard/{user_id}")
def dashboard(user_id: int):

    profile_data = profile(user_id)

    recommendation_data = recommend(user_id)

    return {

        "profile": profile_data,

        "recommendations": recommendation_data

    }
@app.post("/ask/{user_id}")
def ask_ai(
    user_id: int,
    query: Question
):

    cursor.execute(
        "SELECT * FROM farmers WHERE id=?",
        (user_id,)
    )

    farmer = cursor.fetchone()

    if not farmer:
        return {
            "message": "Farmer not found"
        }

    results = db.similarity_search(
        query.question,
        k=2
    )

    context = ""

    for result in results:

        context += (
            result.page_content
            + "\n"
        )

    prompt = f"""
    You are Jeevandhara AI.

    Answer only using the provided scheme data.

    Keep answer short, simple and farmer friendly.

    Farmer Name:
    {farmer[3]}

    Farmer Age:
    {farmer[4]}

    Farmer Income:
    {farmer[5]}

    Farmer Land:
    {farmer[6]}

    Context:
    {context}

    Question:
    {query.question}
    """

    answer = llm.invoke(
        prompt
    )

    cursor.execute(
        """
        INSERT INTO chat_history(
            user_id,
            question,
            answer
        )
        VALUES(?,?,?)
        """,
        (
            user_id,
            query.question,
            answer
        )
    )

    conn.commit()

    return {

        "farmer": farmer[3],

        "question": query.question,

        "answer": answer

    }
@app.get("/farmers")
def all_farmers():

    cursor.execute(
        "SELECT * FROM farmers"
    )

    return cursor.fetchall()
@app.get("/chat-history/{user_id}")
def chat_history(user_id: int):

    cursor.execute(
        """
        SELECT question, answer
        FROM chat_history
        WHERE user_id=?
        ORDER BY id DESC
        """,
        (user_id,)
    )

    return cursor.fetchall()


