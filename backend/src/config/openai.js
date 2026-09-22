const OpenAI = require("openai");

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing in .env");

  return new OpenAI({ apiKey });
}

module.exports = { getOpenAIClient };