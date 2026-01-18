# Online Chess (1v1 + vs AI) — Project README

## Overview
This project is an **online chess platform** that supports:
- **1v1 multiplayer (remote players)**
- **1vAI games**
- **User accounts, profiles, friends/online status**
- **Match history + basic stats/leaderboard**
- **Real-time gameplay** with WebSockets

We are a **team of 5** and our target scope is designed to reach **at least 14 points** using a balanced set of modules (Major = 2 pts, Minor = 1 pt).

---

## Target Module Plan (14 points)

> **Goal:** implement and be able to clearly demo each module during evaluation.

| Category | Module | Points | What it means in our chess platform |
|---|---:|---:|---|
| Web | Use a **framework** for frontend + backend (Major) | 2 | React/Vue + Express/Nest/Django/etc. with clean structure |
| Web | **Real-time** features with WebSockets (Major) | 2 | Live moves sync, clocks, presence, reconnection |
| Web | Use an **ORM** (Minor) | 1 | Prisma/TypeORM/Sequelize/etc. with relational DB |
| Gaming & UX | Complete **web-based game** (Major) | 2 | Full chess rules + legal moves + win/draw conditions |
| Gaming & UX | **Remote players** (Major) | 2 | 1v1 on different machines, handle latency/disconnect/reconnect |
| AI | **AI opponent** (Major) | 2 | Human-like, not perfect; difficulty levels |
| User Mgmt | Standard user management (Major) | 2 | Signup/login, profile page, avatar, friends + online status |
| User Mgmt | Game stats & match history (Minor) | 1 | Persisted results, match list, basic rating/leaderboard |

✅ **Total = 14 points**

---

## Feature Breakdown (Module → Deliverables)

### 1) Core Chess Game (Web-based Game)
- Board UI (drag & drop + click-to-move)
- Move highlighting & legal move indicators
- Rules enforcement:
  - legal moves
  - check / checkmate
  - stalemate
  - resign
  - timeout via chess clocks
  - (optional) repetition / 50-move rule

### 2) Multiplayer Remote Play (Remote Players + WebSockets)
- Matchmaking (simple queue) or invite link
- Real-time move broadcast & state sync
- Server-authoritative validation (no cheating via client)
- Reconnect: refresh page → rejoin game & resync state
- Server-authoritative clocks (sync & anti-desync logic)
- Presence + disconnect states

### 3) AI Opponent (AI Module)
- AI move selection:
  - minimax + alpha-beta pruning
  - depth limits
  - evaluation function
  - randomness/blunder chance to avoid perfect play
- Difficulty levels (ex: depth 1/2/3 + blunder rate adjustments)
- Must be explainable during evaluation (how it chooses moves)

### 4) User Management + Social
- Signup/login (secure password hashing)
- Profile page + avatar
- Friends list + online status (presence via WS)

### 5) Persistence (ORM + DB)
- DB schema:
  - Users
  - Friendships
  - Games
  - Game results
  - (optional) Move list / PGN

### 6) Stats, Match History, Leaderboard
- Match list: opponent, result, timestamp, mode (1v1 / AI)
- Simple rating (basic Elo or W/L/D score)
- Leaderboard view

---

## Work Distribution (Team of 5)

We split work so everyone can develop in parallel with clean boundaries.

### Person 1 — PO + PM/Scrum (and Dev support)
**Owns:** planning + evaluation readiness
- Backlog creation, sprint planning, ticket management
- Definition of Done (DoD) per module
- “How to demo each module in 3 minutes” checklist
- Required site pages: Terms / Privacy (project compliance)
- End-to-end testing of user journeys (signup → play → history → AI)

### Person 2 — Tech Lead / Backend Lead
**Owns:** backend architecture + database + auth
- Backend framework setup & structure
- API conventions, validation, error handling
- Database schema + migrations + ORM integration
- Auth (sessions/JWT), password hashing
- Coordinates shared types and game state format

### Person 3 — Frontend Lead
**Owns:** UI/UX + integration
- Frontend framework setup, routing, pages:
  - Lobby
  - Game room
  - Profile
  - Friends
  - Match history
  - Leaderboard
- Chessboard UI implementation and responsive layout
- Integrates WebSocket events into UI state machine

### Person 4 — Real-time / Multiplayer Engineer
**Owns:** WebSockets + multiplayer robustness
- WebSocket gateway + rooms lifecycle
- Matchmaking queue / invite flow
- Reconnect logic (rejoin token/session)
- Disconnect handling + presence
- Server-authoritative clocks synchronization
- Basic load testing: multiple games concurrently

### Person 5 — Game Engine + AI Engineer
**Owns:** chess rules engine + AI + stats derivation
- Authoritative server-side chess logic:
  - move generation
  - legality checking
  - applying moves to state
  - endgame detection
- AI opponent implementation + difficulty
- Outcome computation & persisted match stats updates

---

## Architecture (Suggested)
**Client-Server model** with server authority for game state:
- **Frontend:** renders board, sends move intents, displays synced state
- **Backend:** validates moves, updates game state, broadcasts via WS
- **Database:** stores users, friendships, games, results, stats

**Why server-authoritative?**
- Prevents cheating (illegal moves, clock manipulation)
- Ensures all clients see consistent state

---

## Interface Contracts (Prevent Merge Chaos)

### Shared Game State (example shape)
```ts
GameState {
  fen: string,              // board state
  turn: "w" | "b",
  clocks: { wMs: number, bMs: number },
  status: "PLAYING" | "CHECKMATE" | "STALEMATE" | "DRAW" | "RESIGNED" | "TIMEOUT",
  lastMove?: { from: string, to: string, promotion?: string },
  players: { whiteId: string, blackId: string },
}
