import { db } from "./db";
import { agentCatalog } from "@shared/schema";

const seedAgents = [
  {
    id: "form-collection",
    name: "Form Data Collection Agent",
    type: "lead-generation",
    description: "Capture, validate, and process lead data from web forms",
    longDescription: "Multi-source form integration with real-time data validation, duplicate detection, auto-enrichment with external data sources, and email/SMS verification.",
    icon: "ClipboardList",
    category: "lead-generation",
    backendEndpoint: "/api/agents/form-collection",
    price: 0,
    isActive: true,
  },
  {
    id: "chatbot",
    name: "Chatbot Agent",
    type: "customer-engagement",
    description: "Intelligent conversational AI for customer interaction and lead qualification",
    longDescription: "Natural language understanding, multi-channel support (website, WhatsApp, Slack), lead qualification through conversation, FAQ handling, and appointment scheduling.",
    icon: "MessageSquare",
    category: "customer-engagement",
    backendEndpoint: "/api/agents/chatbot",
    price: 0,
    isActive: true,
  },
  {
    id: "lead-scoring",
    name: "Lead Scoring Agent",
    type: "lead-qualification",
    description: "AI-powered lead qualification and ranking based on conversion probability",
    longDescription: "Multi-factor scoring algorithm with behavioral analysis, demographic scoring, engagement scoring, predictive ML models, auto-prioritization, and score decay over time.",
    icon: "TrendingUp",
    category: "lead-qualification",
    backendEndpoint: "/api/agents/lead-scoring",
    price: 0,
    isActive: true,
  },
  {
    id: "forecasting",
    name: "Forecasting Agent",
    type: "analytics",
    description: "Predictive analytics for sales, revenue, and business trends",
    longDescription: "Sales pipeline forecasting, revenue predictions, churn prediction, seasonal trend analysis, growth projection, and scenario modeling with time series models.",
    icon: "BarChart",
    category: "analytics",
    backendEndpoint: "/api/agents/forecasting",
    price: 0,
    isActive: true,
  },
  {
    id: "email-sms-marketing",
    name: "Email/SMS Marketing Agent",
    type: "marketing",
    description: "Automated, personalized outreach campaigns",
    longDescription: "Drip campaign automation, AI-powered personalized email generation, A/B testing, send time optimization, engagement tracking, and automated follow-ups.",
    icon: "Mail",
    category: "marketing",
    backendEndpoint: "/api/agents/email-sms",
    price: 0,
    isActive: true,
  },
  {
    id: "data-enrichment",
    name: "Data Enrichment Agent",
    type: "data-processing",
    description: "Enhance lead data with external information sources",
    longDescription: "Company information lookup, contact verification, social media profile discovery, technographic and firmographic data, email verification and validation.",
    icon: "Database",
    category: "data-processing",
    backendEndpoint: "/api/agents/data-enrichment",
    price: 0,
    isActive: true,
  },
];

async function seed() {
  console.log("Seeding agent catalog...");
  
  for (const agent of seedAgents) {
    try {
      await db.insert(agentCatalog).values(agent).onConflictDoNothing();
      console.log(`✓ Added ${agent.name}`);
    } catch (error) {
      console.error(`✗ Error adding ${agent.name}:`, error);
    }
  }
  
  console.log("Seed complete!");
  process.exit(0);
}

seed();
