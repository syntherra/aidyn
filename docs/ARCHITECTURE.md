# AIDYN Architecture

## Core Concept
AIDYN simulates a business development employee: learns the business, designs outreach, discovers and verifies leads, drafts and sends personalized emails, classifies replies, and maintains the CRM with analytics and governance.

## High-Level Architecture
- Client: `React` + `Next.js` UI, TailwindCSS, Recharts
- Backend: `Firebase Cloud Functions` in TypeScript, event-driven microservices
- Data: `Firestore` (operational, real-time), `BigQuery` (analytics), `Storage` (artifacts)
- Integrations: `OpenAI` (agents), `SendGrid` (mail), `Stripe` (billing), `Sentry` (monitoring)
- Hosting: `Netlify` (frontend), `Firebase` (backend)

## Modules
1. Onboarding & Strategy
   - Conversational profile building (business description, ICP, tone, objectives)
   - Stored in Firestore; sets defaults and environment
2. Organic Database Growth Engine
   - Discovery via public sources/APIs, scraping, enrichment, verification
   - Scoring: relevance (ICP fit) and confidence (data quality)
   - Duplicate detection, freshness tracking; Firestore + BigQuery mirroring
3. Campaign Management & Communication
   - AI-generated, uniquely personalized drafts; approval mode ("Hold My Hand")
   - Scheduling, queuing, dispatch via Cloud Functions and SendGrid
   - Reply classification and CRM updates; health monitoring
4. CRM & Dynamic Database
   - Autonomous status updates (Qualified, Disqualified, Unsubscribed, OOO)
   - Relationships across companies, contacts, campaigns
   - Data hygiene (merge duplicates, validity checks), suppression management
5. Analytics & Insights
   - Event logging to BigQuery; metrics (open/reply/bounce)
   - AI Advisor: recommendations (targeting, timing, segments)
   - Inbox health and domain reputation indicators
6. Autonomy, Learning & Governance
   - Reinforcement via approvals/corrections; autonomy thresholding
   - Unsubscribe enforcement, privacy compliance (GDPR/CCPA), deletion requests
   - Domain warm-up/reputation; audit logging

## Data Model
- Workspace → Companies, Contacts, Campaigns, Messages, Events
- PII segregation with stricter rules
- Queues for async jobs: discovery, verification, scoring, rollups

## AI Agents
- Onboarding Agent, Drafting Agent, Classifier Agent, Advisor Agent
- Scoped data access, event-triggered; GPT-4/GPT-4o for reasoning/generation

## Scalability
- Migrate heavy ops to Cloud Run microservices (NestJS/Go) when needed
- Queues (Redis/Firestore), Pub/Sub/Kafka for high-volume streaming
- Optional evolution toward hybrid Firestore + SQL, GraphQL for partners

