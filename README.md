# Car Dealership Inventory

## Overview

## Setup
### Backend

Requires Node 20+ and a MongoDB **replica set** (MongoDB Atlas free tier works).

```bash
cd backend
cp .env.example .env   # then fill in DATABASE_URL and TEST_DATABASE_URL
npm install
npx prisma db push     # creates collections and indexes
npm run dev            # http://localhost:4000/api/health
npm test               # runs against the separate *_test database
```

## API Docs

## Design Decisions

## Test Report

## Screenshots

## My AI Usage