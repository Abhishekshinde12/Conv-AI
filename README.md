# 💬 **Conversational AI – Banking Chat Analyzer**

An intelligent **Conversational AI** system built to analyze chat conversations between a **bank representative** and a **customer**.  
The project uses **GenAI** to derive actionable insights such as **sentiment**, **intent**, and **lead quality** — helping banks understand customer behavior and improve engagement.



## 🚀 **Core Features**

The system extracts the following insights from a given chat:

1. **📝 Summary**  
   Generates a concise summary of the conversation between customer and representative.

2. **😊 Sentiment Analysis**  
   Determines the overall customer sentiment:
   - 🟢 **Positive** – Customer is satisfied and expresses approval.
   - 🔴 **Negative** – Customer shows dissatisfaction or frustration.
   - ⚪ **Neutral** – Mixed or unclear emotions.

3. **🏦 Loan Type Detection**  
   Identifies if the customer mentions a specific loan category (e.g., *Home Loan*, *Car Loan*, *Personal Loan*).  
   If no loan-related mention is found → returns *“No details.”*

4. **🔥 Lead Type Classification**  
   Categorizes customer interest level:
   - 🔥 **Hot Lead** – Highly interested and likely to convert.  
   - 🌤️ **Warm Lead** – Some interest but needs more engagement.  
   - ❄️ **Cold Lead** – Just inquiring; low probability of conversion.

5. **💡 Rationale**  
   Explains the reasoning behind the lead classification for better business transparency.



## 🛠️ **Tech Stack Used**

**Frontend** - React (Vite), Tailwind CSS, Zustand <br>
**Backend** - Django, DRF, JWT, Django Channels, Redis <br>
**AI/Analytics** - LangChain, Gemini <br>
**Database** - Postgres <br>




## ⚙️ **System Setup**

Follow these steps to set up the project locally.

### 1. **Clone the Repository**
```bash
git clone https://github.com/Abhishekshinde12/Conv-AI.git
cd Conv-AI
```

### 2. **Backend Setup**
```bash
# Creating env
python -m venv env
env\Scripts\activate  # On Windows

# Installing dependencies
cd backend
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# create environment file
create .env

# Setup Redis server (ensure Redis is running locally)
# Setting up redis using docker
docker pull redis:latest
docker run -d --name my-redis-instance -p 6379:6379 redis
```

### 3. **Frontend Setup**
```bash
cd frontend
npm install
```

### 4. **Environment Variables**
Add the following configurations in earlier create .env file:
1. Database Configuration
    ```bash
    DATABASE_NAME=
    DATABASE_USER=
    DATABASE_PASSWORD=
    DATABASE_HOST=
    DATABASE_PORT=
    ```
2. Gemini LLM Configuration
    ```bash 
    GOOGLE_API_KEY=
    ```
(You may use Gemini API or integrate any other LLM provider like OpenAI or Anthropic. and accordingly minor changes in the backend/analytics/services.py files need to made)

### 5. **Starting Project**
    1. Frontend - npm run dev
    2. Backend - python manage.py runserver


## ⚠️ Current Limitations

- The system currently assumes the presence of **only one active bank representative**.  
  - In the backend logic (`GetConversationIdAPIView`), the representative is fetched using:
    ```python
    representative = MyUser.objects.filter(user_type='representative').first()
    ```
  - This means the conversation is always assigned to the **first available representative** in the database.
  - Future updates can include:
    - Real-time assignment logic based on **online presence**, **availability**, or **load balancing**.
    - Support for **multiple representatives** and customer-representative mapping.