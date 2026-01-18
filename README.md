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

## Work Split (Team of 5)

> No dedicated Scrum Master. Planning is shared.

### Person 1 — Product + Backend (Auth/API) + Evaluation Readiness
**Owns:**
- Backlog + acceptance criteria + evaluation checklist (shared planning)
- Backend: auth endpoints + user/profile APIs
- Documentation: README, demo script, Terms/Privacy pages
- End-to-end testing of user journeys (signup → play → history → AI)

### Person 2 — Architecture + Database/ORM + Server Integration
**Owns:**
- Backend architecture conventions (shared planning)
- Database schema + migrations + ORM integration
- Shared types/contracts: `GameState`, WS event payloads, API response formats
- Backend integration support: common middleware, validation, error patterns

### Person 3 — Frontend Lead
**Owns:**
- Frontend framework setup, routing, pages (Lobby, Game Room, Profile, Friends, History, Leaderboard)
- Chessboard UI (drag/drop + click-to-move) + responsive layout
- Integrates WebSocket events into the UI state machine

### Person 4 — Real-time / Multiplayer Engineer
**Owns:**
- WebSocket gateway + rooms lifecycle
- Matchmaking queue / invite flow
- Reconnect logic (rejoin token/session) + state resync
- Disconnect handling + presence
- Server-authoritative clocks synchronization
- Basic load testing: multiple games concurrently

### Person 5 — Game Engine + AI Engineer
**Owns:**
- Server-authoritative chess logic:
  - move generation
  - legality checking
  - applying moves to state
  - endgame detection
- AI opponent + difficulty levels
- Outcome computation & persisted match stats updates (with Person 2 for DB)
---

## Sprint Plan (Who does what)

> Adjust sprint length to your calendar (e.g., 1 week each).  
> Each sprint should end with something **demo-able**.

---

### Sprint 1 — Foundations (Frameworks, DB, Auth, Base UI, WS Skeleton)

**Person 1 — Product + Backend (Auth/APIs)**
- Create initial backlog + acceptance criteria for all modules
- Set up backend project structure (framework chosen)
- Implement auth:
  - signup/login/logout
  - password hashing
  - auth middleware/guards
- Implement basic user/profile endpoints (`/me`, profile update)
- Draft Terms + Privacy pages (placeholders) + README skeleton
- Define demo checklist (“how we prove each module”)

**Person 2 — Architecture + DB/ORM + Contracts**
- Design DB schema (Users, Friendships, Games, Results, Stats)
- Set up ORM + migrations + seed scripts
- Define shared contracts:
  - `GameState` shape
  - initial WS event payload formats
  - common API response/error format
- Add backend validation/error middleware patterns

**Person 3 — Frontend**
- Set up frontend project + routing
- Create initial pages: Lobby, Login/Signup, Profile (stub), Game Room (stub)
- Implement chessboard rendering (static board + pieces)
- Add UI state container for `GameState` (dummy state is fine at first)

**Person 4 — Real-time / WebSockets**
- Set up WS server/gateway (rooms + connection lifecycle)
- Implement handshake + ping/pong
- Implement baseline `STATE_SYNC` event
- Presence tracking prototype (online users)

**Person 5 — Game Engine + AI**
- Implement chess state representation (FEN parsing or internal board model)
- Implement move generation skeleton + legality check framework
- Implement apply-move reducer (state updates)
- Create endgame detection scaffolding (placeholders OK in Sprint 1)

**Sprint 1 exit criteria (demo)**
- Users can sign up/login
- Frontend displays a board screen
- WS can connect and send/receive a dummy `STATE_SYNC`
- DB migrations run and Users persist

---

### Sprint 2 — Multiplayer Core (1v1, Move Validation, Sync, Reconnect, Clocks)

**Person 1 — Backend APIs + Product**
- Implement Friends APIs:
  - add/remove/list
- Implement secure auth integration with WS (auth on socket connect)
- Implement match history endpoint skeleton (`/games/history`)
- Continue docs: “how to run locally” + module mapping

**Person 2 — DB/ORM + Integration**
- Implement Games/Results persistence:
  - create game
  - update state snapshot (FEN + clocks)
  - persist result on end
- Add DB constraints/indexes (unique users, friendship pairs, etc.)
- Provide helpers/services for consistent writes (moves/results)
- Keep shared contracts consistent across FE/BE/WS

**Person 3 — Frontend**
- Implement lobby flow:
  - “Play 1v1” queue / “Invite link”
  - show opponent found
- Implement real-time UI updates:
  - move list
  - turn indicator
  - clocks display
- Handle reconnect UI state (loading → resync)

**Person 4 — Real-time / WebSockets**
- Implement matchmaking (queue or invite link)
- Implement room lifecycle:
  - create/join/start game
  - broadcast `MATCH_FOUND` and `STATE_SYNC`
- Implement reconnect:
  - rejoin token/session
  - resync authoritative state
- Implement server-authoritative clocks + periodic `CLOCK_TICK`

**Person 5 — Game Engine + AI**
- Finish legality checks + server-side validation
- Implement check/checkmate/stalemate detection
- Integrate engine into WS:
  - receive `MOVE_SUBMIT`
  - validate → apply → broadcast updates
- Implement resign + timeout end conditions

**Sprint 2 exit criteria (demo)**
- Two remote players can play a full 1v1 game with:
  - real-time sync
  - server-validated moves
  - clocks
  - reconnect after refresh
- Completed games are stored in DB (result + timestamp at minimum)

---

### Sprint 3 — AI + Stats + Polish (AI difficulty, history, leaderboard, quality)

**Person 1 — Backend APIs + Evaluation**
- Finalize match history endpoint (filters: vs AI / 1v1)
- Implement profile enhancements (avatar URL, display name)
- Finalize Terms/Privacy content
- Create evaluation demo script + “module proof” checklist
- E2E test: full flows + regression checks

**Person 2 — DB/ORM + Stats/Leaderboard**
- Implement stats aggregation:
  - W/L/D counts
  - rating updates (basic Elo or points)
- Implement leaderboard endpoint
- Optimize queries for match history + leaderboard
- Add basic audit logging (optional) for debugging

**Person 3 — Frontend**
- Implement Match History page
- Implement Leaderboard page
- Implement Friends page + online status
- UI polish: responsiveness, error states, loading states

**Person 4 — Real-time / WebSockets**
- Implement presence in friends list (online/offline)
- Improve disconnect handling (grace period, forfeit on timeout)
- Load test: multiple concurrent rooms (basic)
- Improve WS reliability: message validation + simple rate limits

**Person 5 — Game Engine + AI**
- Implement AI:
  - minimax + alpha-beta
  - evaluation function
  - difficulty levels
  - randomness/blunder chance
- Integrate AI mode:
  - start AI game
  - AI replies automatically on its turn
- Ensure AI games also write results/stats to DB

**Sprint 3 exit criteria (demo)**
- Play vs AI with difficulty levels
- History + leaderboard reflect completed games
- Friends list + online presence works
- Full evaluation demo works end-to-end

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

