import { invokeLLM } from "./server/_core/llm.ts";

/**
 * Standalone test to isolate LLM integration issue
 * Run with: node test-llm.mjs
 */

async function testLLM() {
  console.log("=== Testing LLM Integration ===\n");

  // Test 1: Minimal example
  console.log("Test 1: Minimal message array");
  const messages1 = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, world!" },
  ];
  console.log("Messages:", JSON.stringify(messages1, null, 2));

  try {
    const response1 = await invokeLLM({ messages: messages1 });
    console.log("✅ Success! Response:", response1.choices[0].message.content.substring(0, 100) + "...\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2), "\n");
  }

  // Test 2: Empty messages array
  console.log("Test 2: Empty messages array");
  const messages2 = [];
  console.log("Messages:", JSON.stringify(messages2, null, 2));

  try {
    const response2 = await invokeLLM({ messages: messages2 });
    console.log("✅ Success! Response:", response2.choices[0].message.content.substring(0, 100) + "...\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2), "\n");
  }

  // Test 3: System message only
  console.log("Test 3: System message only");
  const messages3 = [
    { role: "system", content: "You are a helpful assistant." },
  ];
  console.log("Messages:", JSON.stringify(messages3, null, 2));

  try {
    const response3 = await invokeLLM({ messages: messages3 });
    console.log("✅ Success! Response:", response3.choices[0].message.content.substring(0, 100) + "...\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2), "\n");
  }

  // Test 4: Writing Studio system prompt
  console.log("Test 4: Writing Studio system prompt (like generateNextMessage)");
  const systemPrompt = `You are an expert story development coach helping an author create a comprehensive story blueprint. You are conversational, encouraging, and ask thoughtful questions to draw out the author's vision.

**Author Profile:**
- Pen Name: Robert J Battista
- Bio: A seasoned writer...

**Current Section:** PROJECT_TYPE

**Previously Collected Data:**
{}

Ask the author what type of project they're working on. Options include: novel, novella, short story, memoir, non-fiction, children's book. Be warm and encouraging.

[SUGGESTIONS: Novel | Novella | Short Story | Memoir]`;

  const messages4 = [
    { role: "system", content: systemPrompt },
  ];
  console.log("Messages length:", messages4.length);
  console.log("System prompt length:", systemPrompt.length);

  try {
    const response4 = await invokeLLM({ messages: messages4 });
    console.log("✅ Success! Response:", response4.choices[0].message.content.substring(0, 100) + "...\n");
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2), "\n");
  }
}

testLLM().catch(console.error);
