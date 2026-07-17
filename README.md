# Atrium Monitor

Atrium Monitor is a smart environmental monitoring dashboard designed for Nazarbayev University study spaces.

The application collects environmental sensor readings from a Telegram channel, stores them in a database, analyzes current and historical conditions, and provides recommendations about where and when students should study.

The system consists of:

- A React frontend dashboard
- A FastAPI backend API
- A Telegram listener using Telethon
- A SQLite database for persistent storage

---

# Deployed Application

- Frontend: https://atrium-monitor.vercel.app
- Backend API: https://atrium-monitor-production.up.railway.app
- API Documentation: https://atrium-monitor-production.up.railway.app/docs

---

# Features

## Current Conditions

Atrium Monitor displays:

- Latest atrium temperature
- Latest atrium brightness level
- Latest atrium noise level
- Latest outside temperature
- Current atrium status description

---

## Smart Activity Recommendation

Based on the latest environmental conditions, Atrium Monitor recommends whether students should:

- 📚 Study in the atrium
- 🌳 Go outside
- 🏠 Relax in the dorm

The recommendation considers:

- Atrium comfort score
- Temperature
- Brightness
- Noise
- Outside temperature

---

## Comfort Score Calculation

The comfort score is calculated only from the latest complete atrium reading containing:

- Temperature
- Brightness
- Noise

Partial atrium readings and outside readings do not contribute to the score.

Each environmental factor is first converted into a subscore from 0 to 100.

### Temperature Score

| Atrium temperature | Temperature score |
|-------------------|------------------|
| 24°C – 28°C | 100 |
| 22°C – 30°C | 80 |
| 20°C – 32°C | 60 |
| Below 20°C or above 32°C | 40 |

### Noise Score

| Noise level | Noise score |
|------------|------------|
| Quiet | 100 |
| Mild | 70 |
| Noisy | 40 |
| Very noisy | 20 |
| Unknown value | 50 |

### Brightness Score

| Brightness level | Brightness score |
|-----------------|-----------------|
| Normal | 100 |
| Bright | 80 |
| Dim | 70 |
| Very bright | 60 |
| Dark | 50 |
| Unknown value | 50 |

### Final Comfort Score

```text
Comfort Score =
Temperature Score × 0.50
+ Brightness Score × 0.25
+ Noise Score × 0.25
```

Temperature contributes 50% of the score because thermal comfort is considered the most important environmental factor.

The final result is rounded to the nearest integer.

### Comfort Classification

| Score | Status |
|------|-------|
| 90 – 100 | Excellent |
| 70 – 89 | Good |
| 40 – 69 | Fair |
| Below 40 | Poor |

---

## Current Activity Recommendation

Atrium Monitor generates a recommendation describing what students should do **right now**.

The recommendation uses:

- The latest complete atrium reading
- The latest outside temperature
- The atrium comfort score

The recommendation is selected using the following decision order:

### 1. Study in the Atrium

The application recommends studying in the atrium when all of the following conditions are satisfied:

- Comfort score is at least 75
- Noise level is `quiet` or `mild`
- Brightness is `dim`, `normal`, or `bright`
- Atrium temperature is between `22°C` and `29°C`

This recommendation has the highest priority.

### 2. Go Outside

If the atrium is not suitable for studying, the application checks whether outdoor conditions are suitable.

The application recommends going outside when:

- Outside temperature is between `17°C` and `28°C`
- And at least one of the following is true:
  - Comfort score is below 75
  - Atrium noise level is unsuitable for studying
  - Atrium temperature is unsuitable for studying
  - Outside is at least 2°C cooler than the atrium

### 3. Relax in the Dorm

The application recommends relaxing in the dorm when neither the atrium nor outdoor conditions are suitable.

---

## Best Study Period Prediction

Atrium Monitor predicts the best hour for studying using an explainable, rule-based forecasting algorithm. No machine learning model is currently used.

The model uses only readings that:

- Come from the atrium
- Include temperature, brightness, and noise
- Were recorded between `08:00` and `21:59`
- Belong to the most recent seven-day period ending on the latest available day with complete atrium data

At least two readings must exist for an hour before that hour can be considered.

### 1. Historical Comfort Score

Each reading is converted into a comfort score using the scoring rules above.

Readings are grouped by hour.

More recent readings receive more weight:

```text
Latest day: weight 7
1 day old: weight 6
2 days old: weight 5
3 days old: weight 4
4 days old: weight 3
5 days old: weight 2
6 days old: weight 1
```

The weighted historical score is calculated as:

```text
Historical Score =
sum(comfort score × recency weight)
÷ sum(recency weights)
```

### 2. Current Daily Trend

The model estimates whether conditions on the latest day are improving or worsening.

The latest day's readings are split into:

- Earlier readings
- Later readings

The trend is calculated as:

```text
Current Trend =
average comfort of later readings
− average comfort of earlier readings
```

Positive values indicate improving conditions.

Negative values indicate worsening conditions.

The trend adjustment is limited to:

```text
-15 to +15
```

The trend-adjusted score is:

```text
Trend-adjusted Score =
Historical Score + Current Trend
```

### 3. Hourly Consistency

The algorithm prefers hours that historically exhibit stable environmental conditions.

Consistency is calculated using the population standard deviation:

```text
Consistency Score =
100 − population standard deviation × 4
```

The result is limited to the range from 0 to 100.

### 4. Final Predicted Score

```text
Predicted Score =
Historical Score × 0.65
+ Trend-adjusted Score × 0.20
+ Consistency Score × 0.15
```

Therefore:

- Historical conditions contribute 65%
- Current daily trend contributes 20%
- Hourly consistency contributes 15%

The hour with the highest predicted score becomes the recommended study period.

### Prediction Confidence

The recommendation also receives a confidence level:

- **High confidence:** at least 6 readings and consistency score ≥ 80
- **Medium confidence:** at least 3 readings and consistency score ≥ 60
- **Low confidence:** all other cases

If insufficient data is available, the system returns:

```text
Not enough complete atrium data
```

---

## Analytics Dashboard

Users can:

- View average temperature
- View minimum temperature
- View maximum temperature
- View total readings
- Compare atrium and outside temperatures
- Analyze brightness trends
- Analyze noise trends
- Navigate between different days

---

## History Page

The history page supports:

- Filtering by date
- Filtering by location
- Filtering by brightness level
- Filtering by noise level
- Sorting by time
- Sorting by temperature

---

## Telegram Integration

Atrium Monitor automatically receives sensor updates from a Telegram channel using Telethon.

Incoming messages are normalized before storage to ensure consistency.

Example:

```text
🏫 Atrium
🌡 25.4°C
💡 Dim
🔉 Mild noise
```

is stored as:

```text
location = atrium
temperature = 25.4
brightness = dim
noise = mild
```

---


# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- CSS
- Recharts

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

## Data Collection

- Telethon
- Telegram API

---

# Project Structure

```text
atrium-monitor/
│
├── backend/
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
│   │   │   ├── __init__.py
│   │   │   └── listener.py
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
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
└── .gitignore
```

---

# Installation

## Clone the repository

```bash
git clone https://github.com/aliyamukhanova/atrium-monitor.git
cd atrium-monitor
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## Telegram Listener

Create a `.env` file inside the `backend` directory:

```env
API_ID=your_api_id
API_HASH=your_api_hash
CHANNEL_NAME=your_channel_name
TELEGRAM_SESSION=your_session_string
LOCAL_TIMEZONE=Asia/Almaty
```

Start the listener:

```bash
cd backend
python3 -m app.telegram.listener
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