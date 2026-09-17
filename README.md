# EduRiskAI — Student Dropout Prediction System

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3.0%2B-F7931E?logo=scikit-learn)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38B2AC?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**EduRiskAI** is an end-to-end Machine Learning web platform engineered to predict student dropout risk in higher education institutions. By analyzing academic history, behavioral indicators, stress levels, and socio-economic background, EduRiskAI provides early risk warnings (High, Medium, Low), pinpoints key contributing risk factors, and offers actionable, personalized intervention strategies to boost student retention.

---

## ❓ Problem Statement
Student attrition is a critical challenge faced by educational institutions worldwide. Traditional monitoring mechanisms identify at-risk students reactively—often after significant academic failure or formal withdrawal.

**EduRiskAI** solves this issue by taking a proactive approach:
- Leveraging 10,000 student historical records to train a machine learning model.
- Evaluating multi-dimensional attributes: GPA trends, attendance, study habits, assignment delays, commute time, financial stress, and family background.
- Providing immediate prediction scores and tailored recommendations so academic advisors can intervene early.

---

## ✨ Key Features
- **Real-Time Machine Learning Inference**: Predicts dropout probability and risk level using a serialized Scikit-Learn `Pipeline`.
- **Hybrid Fallback Risk Engine**: Ensures 100% service uptime through a transparent rule-engine fallback in both backend and frontend if ML artifacts or backend servers are offline.
- **Explainable Predictions & Recommendations**: Breaks down individual risk drivers (e.g., low CGPA, poor attendance, high financial stress) and generates targeted academic advising actions.
- **SQLite Data Persistence**: Automatically records every evaluation request, timestamp, input parameters, and output results using SQLAlchemy.
- **Modern Responsive Dashboard**: Interactive React frontend with live system status monitoring, real-time metrics summary, recent activity table, and filtering capabilities.
- **Multi-Step Form with Demo Presets**: Includes pre-configured test presets (High, Medium, Low Risk) for rapid demonstration and testing.

---

## 🏗️ System Architecture

```
                       +-----------------------------------+
                       |    React + TypeScript Frontend    |
                       |  (Vite + Tailwind CSS + Axios)    |
                       +-----------------+-----------------+
                                         |
                                HTTP / REST API
                                         |
                                         v
                       +-----------------+-----------------+
                       |         FastAPI Backend           |
                       |    (Uvicorn + CORS Middleware)    |
                       +--------+------------------+------+
                                |                  |
                 +--------------+                  +--------------+
                 |                                                |
                 v                                                v
  +--------------+--------------+                  +--------------+--------------+
  |    Scikit-Learn ML Pipeline |                  |      SQLite Database        |
  | (Joblib + Rule Fallback)    |                  |  (SQLAlchemy Persistence)   |
  +-----------------------------+                  +-----------------------------+
```

1. **Frontend**: SPA constructed with React 18, TypeScript, and Vite. Handles user inputs, displays dashboard metrics, and presents prediction breakdown cards.
2. **Backend**: Lightweight, asynchronous FastAPI REST API. Processes payloads, validates inputs via Pydantic, calls ML inference, logs evaluations to SQLite, and handles CORS.
3. **Machine Learning Pipeline**: Trained Scikit-Learn pipeline incorporating feature scaling, categorical one-hot encoding, and balanced Logistic Regression.

---

## 🛠️ Technologies Used

### Machine Learning & Data Science
- **Language**: Python 3.10+
- **Libraries**: Pandas, NumPy, Scikit-Learn, Joblib, Matplotlib, Seaborn
- **Environment**: Jupyter Notebooks

### Backend
- **Framework**: FastAPI (v0.115.0)
- **ASGI Server**: Uvicorn (v0.30.6)
- **Data Validation**: Pydantic (v2.9.2)
- **ORM & Database**: SQLAlchemy (v2.0.35), SQLite3

### Frontend
- **Framework**: React 18.3.1 (TypeScript 5.5.3)
- **Build Tool**: Vite (v5.4.3)
- **Styling**: Tailwind CSS (v3.4.11), PostCSS, Autoprefixer
- **HTTP Client**: Axios (v1.7.7)
- **Icons & Routing**: Lucide React, React Router DOM (v6.26.2)

---

## 📊 ML Workflow & Model Details

The machine learning core was developed across 6 sequential Jupyter Notebooks in `ml-model/notebooks/`:

1. **Data Understanding (`01_data_understanding.ipynb`)**: Explored 10,000 raw student records and column definitions.
2. **Data Preprocessing (`02_data_preprocessing.ipynb`)**: Handled missing data, verified data types, and sanitized categorical variables.
3. **Exploratory Data Analysis (`03_eda.ipynb`)**: Visualized feature distributions, correlations with dropout status, and identified key risk threshold patterns.
4. **Feature Engineering (`04_feature_engineering.ipynb`)**: Derived 6 domain-specific features:
   - `Academic_Performance_Score`: Combined average of baseline GPA, Semester GPA, and CGPA.
   - `Study_Attendance_Score`: Interaction metric of study hours and attendance percentage.
   - `Stress_Level`: Categorized index (`Low`, `Medium`, `High`) derived from stress scores.
   - `Log_Family_Income`: Log-transformed income (`np.log1p`) to normalize skewed financial data.
   - `Travel_Study_Ratio`: Ratio of travel time to daily study time.
   - `Assignment_Delay_Level`: Categorized assignment submission delay severity.
5. **Model Training & Selection (`05_model_training.ipynb`)**: Trained and evaluated 4 classification algorithms using 80/20 stratified train-test split:
   - Logistic Regression (Balanced)
   - Decision Tree
   - Random Forest
   - Gradient Boosting
6. **Model Evaluation & Export (`06_model_evaluation.ipynb`)**: Logistic Regression was selected as the optimal model due to superior **Recall** on the dropout class (critical for minimizing false negatives in dropout detection).

### 📈 Model Evaluation Performance Summary

| Evaluation Metric | Model Performance Score |
| :--- | :--- |
| **Accuracy** | **74.70%** |
| **Precision (Dropout)** | **47.69%** |
| **Recall (Dropout)** | **76.65%** |
| **F1-Score (Dropout)** | **58.79%** |
| **ROC-AUC Score** | **82.00%** |

- **Model Artifact**: Serialized `Pipeline` object stored at `ml-model/models/student_dropout_model.pkl`.

---

## 🔌 Backend Overview & API Information

The FastAPI server provides endpoints for health checks, prediction processing, and historical database retrieval.

### Base URL
`http://localhost:8000`

### API Endpoints Summary

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Health Check & ML pipeline status | 200 OK |
| `POST` | `/api/predictions` | Run dropout risk evaluation & persist record | 201 Created |
| `GET` | `/api/predictions/history` | Fetch all historical student evaluations | 200 OK |

### Request & Response Examples

#### `POST /api/predictions`
**Request Payload:**
```json
{
  "department": "CS",
  "semester": "Year 2",
  "cgpa": 1.9,
  "semester_gpa": 1.8,
  "gpa": 2.0,
  "failures": 2,
  "attendance": 55.0,
  "study_hours": 1.5,
  "assignment_delay_days": 4,
  "age": 21.0,
  "gender": "Male",
  "parental_education": "High School",
  "family_income": 25000.0,
  "travel_time_minutes": 45.0,
  "stress_index": 8.0,
  "part_time_job": "Yes",
  "scholarship": "No",
  "internet_access": "Yes",
  "financial_stress": 4
}
```

**Response Payload:**
```json
{
  "prediction": "Dropout",
  "probability": 0.785,
  "riskLevel": "High",
  "keyRiskFactors": [
    "Low CGPA (1.90 / 4.00)",
    "Poor Attendance (55.0%)",
    "2 Previous Academic Failures",
    "Severe Stress Level (8/10)",
    "Chronic Assignment Delays (4 Days)"
  ],
  "recommendations": [
    "Schedule an urgent academic counselling session to review course load and study strategy.",
    "Enrol the student in subject-specific tutoring or a peer-mentoring programme.",
    "Trigger an attendance alert and initiate weekly check-ins with the student's advisor.",
    "Recommend a course-repeat or remedial plan to address failed subjects before the next semester."
  ],
  "message": "This student is at high risk of dropping out. Immediate academic and financial counselling is strongly recommended."
}
```

---

## 💻 Frontend Overview

The frontend application (`frontend/`) is a modern single-page web app providing an intuitive workflow:

- **Dashboard (`/`)**: Displays real-time summary cards (Total Students Evaluated, High Risk, Medium Risk, Low Risk), system backend status (Active ML vs Simulated), search/filter input, and evaluation history table.
- **Predict Page (`/predict`)**: Input form grouped into Academic, Attendance & Habits, and Demographics & Socio-economic sections. Includes instant **Demo Preset Buttons** (High Risk, Medium Risk, Low Risk).
- **Result Page (`/result`)**: Displays prediction status, risk gauge score, risk level badge, list of contributing factors, and prioritized intervention recommendations.
- **About Page (`/about`)**: Detailed breakdown of system architecture, ML model performance metrics (Accuracy, Precision, Recall, ROC-AUC), confusion matrix details, and project credits.

---

## 📂 Project Structure

```
student-dropout-predictor/
├── README.md                           # Master Project Documentation
├── backend/                            # FastAPI Backend Service
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py                 # SQLite SQLAlchemy Connection
│   │   ├── main.py                     # FastAPI App & Endpoint Definitions
│   │   ├── models.py                   # SQLAlchemy ORM StudentRecord Model
│   │   ├── schemas.py                  # Pydantic Input/Output Schemas
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── ml_service.py           # Scikit-Learn Inference Service
│   │       └── risk_engine.py          # Rule Engine Fallback Logic
│   ├── dropout_records.db              # SQLite Database File
│   └── requirements.txt                # Backend Dependencies
├── frontend/                           # React + TypeScript Frontend
│   ├── index.html                      # App Entry HTML
│   ├── package.json                    # Node Dependencies & Scripts
│   ├── postcss.config.js
│   ├── tailwind.config.js              # Tailwind Design Configuration
│   ├── tsconfig.json
│   ├── vite.config.ts                  # Vite Server Configuration
│   └── src/
│       ├── App.tsx                     # Main App Component & Router
│       ├── main.tsx
│       ├── index.css                   # Tailwind Global Styles
│       ├── components/                 # UI & Layout Components
│       │   ├── layout/                 # Navbar & Sidebar Components
│       │   └── ui/                     # UI Helper Components
│       ├── pages/                      # Application Page Views
│       │   ├── AboutPage.tsx           # Architecture & Model Metrics Page
│       │   ├── Dashboard.tsx           # Metrics & History Dashboard Page
│       │   ├── PredictPage.tsx         # Multi-Factor Prediction Form Page
│       │   └── ResultPage.tsx          # Dropout Assessment Results Page
│       ├── services/
│       │   ├── predictionService.ts    # Axios API Client & Client Fallback
│       │   └── storageService.ts       # LocalStorage History Sync
│       └── types/
│           └── student.ts              # TypeScript Interfaces
└── ml-model/                           # Machine Learning Pipeline
    ├── data/
    │   ├── raw/                        # Raw Dataset
    │   └── processed/                  # Processed & Engineered Datasets
    ├── models/
    │   └── student_dropout_model.pkl   # Serialized ML Pipeline Artifact
    ├── notebooks/
    │   ├── 01_data_understanding.ipynb
    │   ├── 02_data_preprocessing.ipynb
    │   ├── 03_eda.ipynb
    │   ├── 04_feature_engineering.ipynb
    │   ├── 05_model_training.ipynb
    │   └── 06_model_evaluation.ipynb
    └── requirements.txt                # ML Environment Dependencies
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Python**: `3.10` or higher
- **Node.js**: `18.0` or higher
- **npm**: `9.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/KalanaCWarnakulasooriya/student-dropout-predictor.git
cd student-dropout-predictor
```

### 2. Machine Learning Environment Setup
```bash
cd ml-model
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## 🚀 How to Run the Application

### Running the Backend Server
From the `backend` directory:
```bash
cd backend
source venv/bin/activate    # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
- API Health Check: `http://localhost:8000/`
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`

### Running the Frontend Application
From the `frontend` directory in a new terminal:
```bash
cd frontend
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory (optional; defaults to `http://localhost:8000`):
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔄 Example Usage / Prediction Flow

1. **Launch Application**: Open `http://localhost:5173` in your web browser.
2. **Navigate to Predict Page**: Click **Predict Risk** on the sidebar or navbar.
3. **Fill Input Form or Select Preset**:
   - Manually enter CGPA (e.g. `1.8`), Attendance Rate (e.g. `55%`), Failures (e.g. `2`), and Stress Index (e.g. `8`).
   - Or click **Load High Risk Student** preset to auto-populate fields.
4. **Submit Prediction**: Click **Evaluate Student Risk**.
5. **Review Results**: View the generated **High Risk (78.5% Probability)** badge, specific risk factor callouts, and intervention recommendations.
6. **Track History**: Return to the **Dashboard** to see the new record stored in the evaluation table.

---

## 👥 Team Members

| Role | Name | GitHub Profile |
| :--- | :--- | :--- |
| **ML Engineer** | **Hansana Sandamini** | [![GitHub](https://img.shields.io/badge/GitHub-Hansana--Sandamini-181717?logo=github)](https://github.com/Hansana-Sandamini) |
| **Backend Developer** | **Kalana C Warnakulasooriya** | [![GitHub](https://img.shields.io/badge/GitHub-KalanaCWarnakulasooriya-181717?logo=github)](https://github.com/KalanaCWarnakulasooriya) |
| **Frontend Developer** | **Tharindu Thrishal** | [![GitHub](https://img.shields.io/badge/GitHub-Thrishal874-181717?logo=github)](https://github.com/Thrishal874) |

---
*EduRiskAI — Empowering Educational Institutions with Data-Driven Student Retention.*