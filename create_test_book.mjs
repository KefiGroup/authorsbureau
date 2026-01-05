import { drizzle } from "drizzle-orm/mysql2";
import { books } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const manuscriptContent = `Chapter 1: The AI Revolution in Business

The world of business is changing faster than ever before. Artificial intelligence is no longer a futuristic concept—it's here, and it's transforming how companies operate, compete, and succeed.

In this book, you'll discover how to leverage AI to build a thriving business in 2024 and beyond. Whether you're a startup founder, small business owner, or corporate executive, the strategies in these pages will help you stay ahead of the curve.

Chapter 2: Understanding AI Fundamentals

Before you can harness AI's power, you need to understand what it is and isn't. AI isn't magic—it's a set of technologies that enable machines to perform tasks that typically require human intelligence.

The key is knowing which AI tools to use for your specific business challenges. From customer service chatbots to predictive analytics, the possibilities are endless.

Chapter 3: Implementing AI in Your Business

The biggest mistake businesses make is trying to implement AI everywhere at once. Start small. Identify one pain point where AI can make an immediate impact.

For most businesses, customer service is the perfect starting point. AI-powered chatbots can handle routine inquiries 24/7, freeing your team to focus on complex customer needs.`;

const result = await db.insert(books).values({
  authorId: 1,
  title: "AI-Powered Business: The Complete Guide",
  subtitle: "How to Build a Thriving Company Using Artificial Intelligence",
  genre: "Business & Entrepreneurship",
  description: "A comprehensive guide for entrepreneurs and business leaders who want to leverage AI to grow their companies and stay competitive in the digital age.",
  content: manuscriptContent,
  status: "drafting",
  wordCount: 1850,
  targetWordCount: 50000
});

console.log("Test book created successfully!", result);
