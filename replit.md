# Abetworks - Business AI Automation Platform

## Overview
Abetworks is a production-ready AI automation platform designed to empower businesses with intelligent tools for lead management, customer interaction, sales forecasting, and workflow orchestration. Its core purpose is to automate and optimize key business processes, from lead collection and qualification to customer engagement and predictive analytics. The platform aims to enhance efficiency, drive sales, and provide actionable insights through a modular AI agent system.

## User Preferences
I prefer iterative development with a focus on delivering functional components in phases. I value clear, concise explanations and detailed breakdowns of proposed changes, especially for backend logic and AI model implementations. Ask for my approval before making significant architectural changes or integrating new third-party services. Ensure all solutions are scalable and maintain security best practices, particularly regarding multi-tenancy.

## System Architecture
The platform features a modular AI agent system, enabling flexible and scalable business automation.

### UI/UX Decisions
- **Frontend Framework**: React with TypeScript.
- **Styling**: Tailwind CSS, utilizing Shadcn UI component library for a modern, professional aesthetic.
- **Data Visualization**: Recharts for interactive and responsive charts across dashboards.
- **Design Principles**: Clean, professional UI with responsive layouts, focusing on intuitive user experience for managing agents, forms, chatbots, and analytics.

### Technical Implementations
- **Authentication**: JWT-based system with separate login flows for users and super admins.
- **Multi-tenancy**: Strict data isolation per organization, enforced at the database and API levels. The first user to sign up becomes the super admin.
- **Core Modules**:
    - **Authentication & User Management**: Role-based access (Super Admin, Admin, Member).
    - **Dashboard**: Real-time metrics visualization (active users, tasks done/pending, active workflows).
    - **Tasks System**: Management and tracking of automation workflow tasks.
    - **Reports & Analytics**: Aggregate metrics, resource usage, and performance analytics.
    - **Settings**: Organization configuration and API key management.
    - **Agents Board**: Placeholder ready for displaying and managing various AI agents.

### Feature Specifications
The platform will incorporate several AI agent types, each with specific capabilities and configuration schemas:
- **Form Data Collection Agent**: Captures, validates, and processes lead data from multiple sources with enrichment and deduplication.
- **Chatbot Agent**: Intelligent conversational AI for multi-channel customer interaction, lead qualification, and scheduling.
- **Lead Scoring Agent**: AI-powered lead qualification and ranking based on multi-factor algorithms (behavioral, demographic, engagement) and machine learning.
- **Forecasting Agent**: Predictive analytics for sales, revenue, churn, and business trends using various time series and classification models.
- **Email/SMS Marketing Agent**: Automated, personalized outreach campaigns with AI-powered content generation and engagement tracking.
- **Data Enrichment Agent**: Enhances lead data with external information from various sources (company info, contact verification, technographics).

### System Design Choices
- **Frontend**: React 18+, TypeScript, Tailwind CSS, Shadcn UI, Recharts, React Query, Wouter.
- **Backend API (Node.js)**: Node.js + Express + TypeScript, PostgreSQL (Neon serverless) with Drizzle ORM, JWT, bcrypt.
- **Agent Runtime (Python)**: Python 3.11+ with FastAPI, OpenAI, LangChain, Pandas, NumPy, psycopg2.
- **Security**: Critical emphasis on multi-tenant security, including `org_id` filtering, JWT validation, data encryption, rate limiting, and audit logging.

## External Dependencies
- **Database**: PostgreSQL (specifically, Neon serverless for the backend API).
- **AI/ML Services**:
    - OpenAI / Anthropic (for LLM integration in Chatbot and Email/SMS Marketing agents).
    - Clearbit, Hunter.io, FullContact (for Data Enrichment Agent).
    - SendGrid, Mailgun, AWS SES (for Email marketing).
    - Twilio, MessageBird (for SMS marketing).
- **Libraries/Frameworks**:
    - React, TypeScript, Tailwind CSS, Shadcn UI, Recharts, React Query, Wouter (Frontend).
    - Node.js, Express, Drizzle ORM, JWT, bcrypt (Backend API).
    - Python, FastAPI, LangChain, Pandas, NumPy, psycopg2 (Agent Runtime).
- **Forecasting Models**: Prophet (Facebook), ARIMA, LSTM, Gradient Boosting, Random Forest, Linear Regression, XGBoost.