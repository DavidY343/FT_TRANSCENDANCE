*This project has been created as part of the 42 curriculum by*

# Description

# Instructions

# Resources

# Team Information

# Project Management

# Technical Stack

# Database Schema

# Features List

# Modules

## Use a framework for both the frontend and backend (+2)
The project utilizes React (built with Vite) as the frontend framework and FastAPI for the backend architecture.

## Real-time features using WebSockets (+2)
Implemented via `realtime.py` in the backend and `useSocket.js` in the frontend. It handles live move broadcasting, matchmaking, chat messages, and presence state.

## Allow users to interact with other users (+2)
A comprehensive social system is implemented. This includes a live chat (`ChatCard.jsx`), friend requests and management (`FriendsPage.jsx`), and real-time online status visibility.

## Use an ORM for the database (+1)
SQLAlchemy is used as the Object-Relational Mapper to interact with the PostgreSQL database, defining schemas, tables, and relationships in `models.py`.

## Standard user management and authentication (+2)
Features secure signup and login flows (`AuthForm.jsx`), profile editing, and avatar uploads (`ProfileAvatarForm.jsx`). Secure authentication is handled via JWT tokens (`auth.py`, `tokens.js`).

## Game statistics and match history (+1)
The application tracks user game statistics, including wins and losses, and displays past matches alongside an Elo-based ranking system (`HistoryPage.jsx`, `LeaderboardPage.jsx`, `README-elo-rating.md`).

## Support for multiple languages (+1)
The UI incorporates an internationalization system allowing users to switch between at least three languages, with all user-facing text abstracted to support localization.

## Support for additional browsers (+1)
The application ensures full compatibility across Chromium, Firefox, and WebKit (Safari). UI layout and WebSocket protocols are validated across these engines to guarantee consistent UX and stable connections.

## Introduce an AI Opponent (+2)
A custom chess AI is integrated via `ai_engine.py`. It provides human-like responses and different difficulty levels for single-player matches.

## Implement a complete web-based game (+2)
A fully functional online chess game with server-side legal move validation, win/loss/draw conditions, and an interactive board UI (`GameBoard.jsx`, `boardRules.js`).

## Remote players (+2)
Two players on different machines can play against each other in real-time. The system includes server-authoritative state synchronization, clock management (`Clocks.jsx`), and robust disconnection/reconnection handling (`useDisconnectGraceCountdown.js`).

## A gamification system (+1)
Users are rewarded with persistent achievements based on their in-game actions and overall progression. This feature is managed and rendered via `useAchievementToasts.js` and `AchievementToastContainer.jsx`.

# Individual Contributions
