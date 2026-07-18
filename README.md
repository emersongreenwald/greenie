# Greenie

A gamified mobile application that makes community service more accessible and rewarding for high school students.

## What is Greenie?

Many high school students complete community service because it is required for graduation. That requirement can make the experience feel transactional — something to get done rather than something meaningful. Greenie is built to change that.

Greenie connects students in the Hamptons with local volunteer opportunities through a single platform, and redesigns the experience around motivation rather than obligation. Students discover opportunities through a swipe-based interface, log their hours digitally, and earn XP and levels as their participation is verified. Schools and organizations manage opportunities and confirm student involvement — reducing the administrative paperwork that currently burdens all three groups.

The goal is not just to make community service easier to find. It is to make it an experience students feel genuinely connected to.

## Core Features

- Swipe-based discovery of volunteer opportunities
- Student, school, and organization accounts
- Hour logging and organization verification
- XP and level progression tied to verified service
- Student dashboard with hours, XP, and level

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo |
| Navigation | Expo Router |
| Styling | NativeWind |
| State management | Zustand |
| Backend + Database | Supabase |
| Version control | Git + GitHub |

## Project Status

Early development. Documentation and architecture phase complete. Project setup in progress.

See [ROADMAP.md](ROADMAP.md) for the full development plan and [REQUIREMENTS.md](REQUIREMENTS.md) for the complete feature list.

## Setup

_Setup instructions will be added after Milestone 1 (project setup) is complete._

## Project Structure

```
app/          # Screens — each file is a route (Expo Router)
components/   # Reusable UI components
lib/          # Configuration and utilities (Supabase client, etc.)
services/     # Functions that fetch or write data to Supabase
stores/       # Zustand global state (auth, XP, etc.)
types/        # Shared TypeScript type definitions
assets/       # Images, icons, fonts
```

## Development Log

See [DEVLOG.md](DEVLOG.md) for a record of progress, decisions, and next steps.
