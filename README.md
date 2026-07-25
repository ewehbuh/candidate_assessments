
# Candidate Assessment Project

A full-stack web application for managing job candidates. Built with **Django REST Framework** (backend) and **Next.js + Redux Toolkit** (frontend).

---

## 🚀 Features

- **List candidates** – Display all fields except `id`, `created`, `updated`
- **Sort candidates** – Sort by `status`, `date_applied`, and `years_exp` (server-side)
- **Filter candidates** – Filter by years of experience range (e.g., 5–10 years)
- **Update status** – Accept or Reject pending candidates; once Accepted/Rejected, status cannot be changed
- **Add candidate** – Create new candidates via a modal form with validation
- **Automatic `reviewed` flag** – Set to `true` when a candidate moves from `pending` to `accepted`/`rejected`
- **Comprehensive error handling** – Client-side validation + clear server-side error messages
- **Responsive UI** – Built with Tailwind CSS
- **Full TypeScript** – Frontend fully typed

---

## 📦 Prerequisites

- **Python 3.8+** and `pip`
- **Node.js 18+** and `npm`
- **Git** (optional)

---

## 🛠️ Setup & Installation
# Candidate Assessment Project

A full-stack web application for managing job candidates. Built with **Django REST Framework** (backend) and **Next.js + Redux Toolkit** (frontend).

---

## 🚀 Features

- **List candidates** – Display all fields except `id`, `created`, `updated`
- **Sort candidates** – Sort by `status`, `date_applied`, and `years_exp` (server‑side)
- **Filter candidates** – Filter by years of experience range (e.g., 5–10 years)
- **Update status** – Accept or Reject pending candidates; once Accepted/Rejected, status cannot be changed
- **Add candidate** – Create new candidates via a modal form with validation
- **Automatic `reviewed` flag** – Set to `true` when a candidate moves from `pending` to `accepted`/`rejected`
- **Comprehensive error handling** – Client‑side validation + clear server‑side error messages
- **Responsive UI** – Built with Tailwind CSS
- **Full TypeScript** – Frontend fully typed

---

## 📦 Prerequisites

- **Python 3.8+** and `pip`
- **Node.js 18+** and `npm`
- **Git** (optional)

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/ewehbuh/candidate_assessment.git
cd candidate-assessment
```

### 2. Backend (Django)

Navigate to the backend directory, create a virtual environment, install dependencies, apply migrations, load sample data, and start the server.

```bash
cd backend
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
cd config
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
# Load sample data (10 candidates)
python manage.py loaddata candidate/fixtures/candidates.json
python manage.py runserver
```

The backend will run at **http://localhost:8000**.

### 3. Frontend (Next.js)

Open a **new terminal** and run the following commands from the project root:

```bash
cd client
npm install
npm run dev
```

The frontend will run at **http://localhost:3000**.

> **Note:** Both servers must be running simultaneously for the application to work.

---

## 🧪 Running Tests

### Backend

```bash
cd backend
python manage.py test candidate --verbosity=2
```

To see detailed output with test names and `print()` statements:

```bash
python manage.py test candidate --verbosity=2 -s
```

### Frontend

Frontend tests are not required for this assessment, but you can add them later.

---

## 📁 Project Structure

```text
candidate-assessment/
├── backend/   
----config                 # Django backend
│   ├── config/                 # Project settings & URLs
│   ├── candidate/              # Main app
│   │   ├── models.py           # Candidate model
│   │   ├── serializers.py      # Validation & reviewed logic
│   │   ├── views.py            # ViewSet with filtering & ordering
│   │   ├── filters.py          # Range filter for years_exp
│   │   ├── tests.py            # Comprehensive test suite
│   │   └── fixtures/           # Sample data (10 candidates)
│   └── requirements.txt
├── client/                     # Next.js frontend
│   ├── app/                    # App Router pages
│   ├── components/             # React components
│   ├── store/                  # Redux store, slices, thunks
│   ├── lib/                    # API client
│   ├── types/                  # TypeScript types
│   └── utils/                  # Helper functions
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/candidates/`          | List all candidates |
| GET    | `/api/candidates/<id>/`     | Retrieve a single candidate |
| POST   | `/api/candidates/`          | Create a new candidate |
| PATCH  | `/api/candidates/<id>/`     | Update a candidate (e.g., status) |

### Query Parameters

- `ordering` – Sort by field: `status`, `date_applied`, `-date_applied`, `years_exp`, etc.
- `years_exp_min` – Minimum years of experience
- `years_exp_max` – Maximum years of experience

**Example:**  
`GET /api/candidates/?years_exp_min=5&years_exp_max=20&ordering=status`

---

## 💡 Bonus Features

- **Add Candidate** – Modal form with validation
- **Range Filtering** – Filter by years of experience
- **Backend Sorting** – Server‑side sorting with `OrderingFilter`
- **Sort by Experience** – Additional sort button
- **Comprehensive Error Handling** – Detailed validation messages
- **TypeScript** – Full type safety
- **Tailwind CSS** – Clean, responsive design

---

