# User Leaderboard Backend

This project is part of a backend development assignment for **Sunflower**. It implements a scalable leaderboard system using Node.js, PostgreSQL, Redis, and Docker.

---

## Features

- Add a new user with an initial score
- Update user scores
- Get top N users from the leaderboard
- Get a user’s current rank and 5 users above/below
- ***postman collection was added to the assignment***
---

## Tech Stack

- **Node.js** + **TypeScript** + **Express**
- **PostgreSQL** (with indexes)
- **Redis** for leaderboard performance
- **Sequelize** ORM
- **Docker Compose** for local development

---

## Design Choices


### User & Score Separation

- Users are stored in a `users` table.
- Their scores are in a separate `user_scores` table (1:1 relationship).


### PostgreSQL for Core Data

- All important data is stored in PostgreSQL for reliability.
- An index on `totalScore DESC, userId ASC` makes leaderboard queries fast and allows proper ranking even when users have the same score.
- Used SQL’s `RANK()` to calculate positions when needed.


### Redis for Speed

- Redis is used as a **cache** for top scores and rank lookups.
- Redis sorted sets (`ZADD`, `ZRANGE`, `ZREVRANK`) are used to manage leaderboard scores.
- PostgreSQL is always the source of truth.



### Efficient Queries

- To get a user’s rank and nearby scores, a single SQL query with `RANK()` is used.
- Redis can also handle this quickly using rank + range operations, keeping the backend fast even with millions of users.

---

## How to Run locally (Docker Compose)
docker-compose up

---

## AWS
- **EKS (Elastic Kubernetes Service)** — Runs the Dockerized Node.js API
- **RDS (PostgreSQL)** — Stores persistent user and score data
- **ElastiCache (Redis)** — Provides fast leaderboard reads using Redis sorted sets
- **ALB + Route 53** — Handles HTTPS traffic and DNS routing
- **Secrets Manager** — Manages credentials and secrets securely
- **ECR (Elastic Container Registry)** — Stores and serves Docker images


---
### Clone the Repository

```bash
git clone https://github.com/your-username/sunflower-leaderboard.git
cd sunflower-leaderboard

---