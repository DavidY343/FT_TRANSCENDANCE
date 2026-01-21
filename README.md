*This project has been created as part of the 42 curriculum by dyanez-m, <login2>, <login3>, <login4>, <login5>.*

# ft_transcendence — Online Chess Platform

## Description

**ft_transcendence** is a web-based **online chess platform** that allows users to play chess either **against another remote player (1v1)** or **against an AI opponent**. The goal of the project is to design and implement a complete, real-time, multiplayer web application following modern software engineering practices.

Key features include:

* Real-time online chess matches (1v1)
* Chess games versus an AI opponent with multiple difficulty levels
* User authentication and profiles
* Friends system and online presence
* Match history, statistics, and leaderboard
* Server-authoritative game logic to prevent cheating

The project is developed as part of the **42 curriculum**, with a strong focus on clean architecture, modularity, teamwork, and evaluation-ready documentation.

---

## Instructions

### Prerequisites

Ensure the following software is installed:

* **Docker** >= 24.x
* **Docker Compose** >= 2.x
* **Node.js** >= 18.x
* **Python** >= 3.11
* **PostgreSQL** >= 15
* **Git**

### Environment setup

1. Clone the repository:

```bash
git clone <repository_url>
cd ft_transcendence
```

2. Create environment files:

```bash
cp .env.example .env
```

3. Fill required variables in `.env`:

* Database credentials
* Django secret key
* JWT settings

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:8000`

---

## Resources

### Technical references

* Django Documentation
* Django REST Framework Documentation
* PostgreSQL Documentation
* WebSockets (MDN)
* Chess programming concepts (bitboards, minimax, alpha-beta pruning)

### Use of AI tools

AI tools (such as ChatGPT) were used **as development assistants**, specifically for:

* Architectural discussions and planning
* Clarifying framework usage (Django, JWT, WebSockets)
* Drafting documentation and README structure

All core logic, design decisions, and implementations were **written, reviewed, and validated by the team**.

---

## Team Information

| Member   | Role(s)                           | Responsibilities                                                |
| -------- | --------------------------------- | --------------------------------------------------------------- |
| dyanez-m | Product Owner / Backend Developer | API design, authentication, documentation, evaluation readiness |
| <login2> | Backend Developer / Database      | Database schema, ORM, migrations, data integrity                |
| <login3> | Frontend Developer                | UI/UX, chessboard, state management                             |
| <login4> | Real-time Systems Developer       | WebSockets, matchmaking, synchronization                        |
| <login5> | Game Engine & AI Developer        | Chess rules engine, AI opponent, game validation                |

---

## Project Management

### Organization

* Work divided by **modules and technical ownership**
* Weekly sprint planning and daily syncs when needed
* Each sprint ends with demoable features

### Tools

* **GitHub Issues**: task tracking and assignments
* **GitHub Projects**: sprint visualization
* **Git**: version control and code reviews

### Communication

* Discord (main communication channel)
* GitHub Discussions and Pull Requests

---

## Technical Stack

### Frontend

* React
* TypeScript
* Vite
* WebSockets

### Backend

* Django
* Django REST Framework
* JWT authentication (SimpleJWT)
* WebSockets

### Database

* PostgreSQL

**Why PostgreSQL?**

* Strong relational guarantees
* Excellent support in Django
* Suitable for transactional game data

---

# Database Schema

## Main Tables

### Users

| Column       | Type       | Notes                          |
|-------------|------------|--------------------------------|
| id          | UUID (PK)  | Primary key                    |
| username    | varchar    | Unique                         |
| email       | varchar    | Unique                         |
| password    | varchar    |                                |
| first_name  | varchar    | Nullable                       |
| last_name   | varchar    | Nullable                       |
| avatar_url  | varchar    | Nullable                       |
| is_active   | boolean    |                                |
| date_joined | timestamp  | Auto-added                     |
| is_staff    | boolean    |                                |

---

### Friendships

| Column       | Type       | Notes                              |
|-------------|------------|------------------------------------|
| id          | UUID (PK)  | Primary key                        |
| requester   | FK → users.id | User who sent the request          |
| addressee   | FK → users.id | User who received the request      |
| status      | enum       | PENDING / ACCEPTED / DECLINED      |
| created_at  | timestamp  | Auto-added                         |

**Constraints:**  
- Unique together: (requester_id, addressee_id)  

**Relationships:**  
- One user → many friendships sent  
- One user → many friendships received

---

### Game

| Column         | Type       | Notes                        |
|----------------|------------|------------------------------|
| id             | UUID (PK)  | Primary key                  |
| player_white   | FK → users.id | White player                  |
| player_black   | FK → users.id | Black player (nullable)       |
| vs_ai          | boolean    | Default False                |
| fen            | varchar    | Default ""                   |
| status         | enum       | WAITING / ACTIVE / FINISHED  |
| turn           | enum       | w / b                        |
| white_clock    | integer    | Default 600000               |
| black_clock    | integer    | Default 600000               |
| created_at     | timestamp  | Auto-added                   |
| finished_at    | timestamp  |                              |

**Relationships:**  
- One user → many games as white  
- One user → many games as black

---

### GameResults

| Column    | Type       | Notes                              |
|-----------|------------|------------------------------------|
| id        | UUID (PK)  | Primary key                        |
| game      | FK → games.id | OneToOne                          |
| winner    | FK → users.id | Nullable                           |
| loser     | FK → users.id | Nullable                           |
| result    | enum       | WIN / LOSS / DRAW / RESIGNED / TIMEOUT |
| created_at| timestamp  | Auto-added                         |

**Relationships:**  
- One game → one result  
- One user → many games won  
- One user → many games lost  
  
---

### GameStatistics

| Column       | Type       | Notes                        |
|-------------|------------|------------------------------|
| user        | PK, FK → users.id | OneToOne relationship         |
| total_games | integer    | Default 0                     |
| wins        | integer    | Default 0                     |
| losses      | integer    | Default 0                     |
| draws       | integer    | Default 0                     |
| elo_rating  | integer    | Default 1000                  |
| updated_at  | timestamp  |                               |

**Relationships:**  
- One user → one statistics record  


---

## Features List

| Feature             | Description                         | Contributor(s)     |
| ------------------- | ----------------------------------- | ------------------ |
| User authentication | Register/login using JWT            | dyanez-m           |
| Online matchmaking  | Match players in real-time          | <login4>           |
| Chess engine        | Validate legal moves and game state | <login5>           |
| AI opponent         | Play vs AI with difficulty levels   | <login5>           |
| Match history       | View past games and results         | <login2>           |
| Friends system      | Add friends and see online status   | dyanez-m, <login4> |

---

## Modules

### Selected modules

| Module             | Type  | Points | Justification             |
| ------------------ | ----- | ------ | ------------------------- |
| Web-based game     | Major | 2      | Core gameplay requirement |
| Remote players     | Major | 2      | Online multiplayer chess  |
| AI opponent        | Major | 2      | Single-player experience  |
| Real-time features | Major | 2      | Live moves & clocks       |
| Framework usage    | Major | 2      | Scalable architecture     |
| User management    | Major | 2      | Profiles and auth         |
| ORM                | Minor | 1      | Data persistence          |
| Game stats         | Minor | 1      | Player progression        |
| 2FA   (pending)    | Minor | 1      | Enhanced security         |
| Dashboard (pending)| Minor | 1      | User engagement           | 

**Total: 14 or (16) points**

---

## Individual Contributions

### dyanez-m

* Designed backend API
* Implemented JWT authentication
* Documentation and evaluation preparation
* 2FA integration (pending)

### <login2>

* Database schema design
* ORM and migrations
* Match history persistence

### <login3>

* Frontend UI and UX
* Chessboard rendering
* User state management (Dashboard pending)
### <login4>

* WebSocket architecture
* Matchmaking and synchronization

### <login5>

* Chess rules engine
* AI opponent logic

---

## Known Limitations

* No tournament mode
* Limited AI depth for performance reasons

---

## License

This project is developed for educational purposes as part of the 42 curriculum.

