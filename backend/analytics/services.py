from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import Literal
# from dotenv import load_dotenv
# load_dotenv()

llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash')

class AnaltyicsModel(BaseModel):
    summary: str = Field(description='Give the summary of the entire conversation that happened so far in 5 to 10 lines')
    sentiment: Literal["positive", "negative", "neutral"] = Field(description='Give the sentiment of the user based on the chat messages')
    loan_type: str = Field(description='Represent the type of loan the user want')
    lead_type: Literal["hot", "warm", "cold"] = Field(description='Categorize customer to determine their suitability and potential for becoming a customer. Hot = high potential, Warm=medium potential, Cold=minimal potential')
    rationale: str = Field(description='The reason behing classifying this use of a particular lead_type')

structured_llm = llm.with_structured_output(AnaltyicsModel)