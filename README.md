# Atrium Monitor

Atrium Monitor is a smart environmental monitoring dashboard designed for Nazarbayev University study spaces. The application collects environmental sensor readings from a Telegram channel, stores them in a database, analyzes current and historical conditions, and provides recommendations for students about where and when to study.

---

## Features

### Current Conditions

- Displays the latest atrium temperature, brightness, and noise level.
- Displays the latest available outside temperature.
- Generates a real-time status description of the atrium environment.

### Smart Activity Recommendation

Based on the latest sensor data, Atrium Monitor recommends whether students should:

- 📚 Study in the atrium
- 🌳 Go outside
- 🏠 Relax in the dorm

The recommendation is determined using:

- Atrium comfort score
- Noise level
- Brightness level
- Atrium temperature
- Outside temperature

### Comfort Score

The comfort score is calculated only from the latest **complete atrium reading**, which includes:

- Temperature
- Brightness
- Noise

The score ranges from 0 to 100 and is used to classify the environment as:

- Excellent
- Good
- Fair
- Poor

### Best Study Period Prediction

Atrium Monitor predicts the best study hour using a lightweight prediction model based on:

- Current daily trends
- Hourly consistency

The model only considers:

- Complete atrium readings
- Realistic study hours (08:00–22:00)

No machine learning models are used.

### Analytics Dashboard

Users can:

- View average temperature
- View minimum temperature
- View maximum temperature
- View total readings
- Compare atrium and outside temperatures
- Analyze brightness trends
- Analyze noise trends
- Navigate between different days

### History Page

The history page supports:

- Filtering by date
- Filtering by location
- Filtering by noise level
- Filtering by brightness level
- Sorting by time
- Sorting by temperature

### Telegram Integration

Atrium Monitor automatically receives sensor updates from a Telegram channel using Telethon.

Incoming messages are normalized before storage to ensure consistency.

Example:

```text
🏫 Atrium
🌡 25.4°C
💡 Dim
🔉 Mild noise
```

becomes:

```text
location = atrium
temperature = 25.4
brightness = dim
noise = mild
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

### Data Collection

- Telethon
- Telegram API

### Data Visualization

- Recharts

---

## Project Structure

```text
atrium-monitor/
│
├── backend/
│   │
│   ├── app/
│   │   ├── routes/
│   │   │   ├── readings.py
│   │   │   └── reports.py
│   │   │
│   │   ├── services/
│   │   │   ├── comfort.py
│   │   │   ├── current_recommendation.py
│   │   │   └── recommendations.py
│   │   │
│   │   ├── telegram/
│   │   │   └── telethon.py
│   │   │
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   │
│   ├── atrium.db
│   ├── requirements.txt
│   └── seed.py
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComfortCard.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── TemperatureChart.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Dashboard.css
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── AnalyticsPage.css
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── HistoryPage.css
│   │   │   ├── ReportsPage.tsx
│   │   │   └── ReportsPage.css
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── api.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── README.md
└── .gitignore
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/aliyamukhanova/atrium-monitor.git
cd atrium-monitor
```

---

### Backend Setup

Create and activate a virtual environment:

```bash
cd backend

python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will run on:

```text
http://127.0.0.1:8000
```

---

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

### Telegram Listener

Create a `.env` file inside:

```text
backend/app/telegram/
```

with the following contents:

```env
API_ID=your_api_id
API_HASH=your_api_hash
CHANNEL_NAME=your_channel_name
```

Start the Telegram listener:

```bash
cd backend
python app/telegram/telethon.py
```

---

## Example Workflow

1. A sensor sends a Telegram message.
2. Telethon receives the message.
3. Data is normalized and stored in SQLite.
4. FastAPI exposes the data through REST endpoints.
5. React fetches the data and updates the dashboard.
6. Atrium Monitor generates recommendations and predictions.

---

## Future Improvements

- Weather API integration
- Push notifications for ideal study conditions
- Machine learning based forecasting
- Occupancy estimation
- Multi-building support

---

## Authors

Developed as part of the **Code Girls Summer Camp Hackathon** project.

Created by:

- Aliya Mukhanova
- Aizere Kadyr

---

## License

This project is intended for educational purposes.