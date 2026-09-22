const fs = require("fs");
const path = require("path");
const { getOpenAIClient } = require("../config/openai");

function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "image/jpeg";
}

function localPathFromPhotoUrl(photoUrl) {
  // Supports:
  // 1) http://localhost:5000/uploads/reportPhotos/abc.jpg
  // 2) /uploads/reportPhotos/abc.jpg
  // 3) uploads/reportPhotos/abc.jpg
  // Produces: <cwd>/uploads/reportPhotos/abc.jpg

  const raw = String(photoUrl || "").trim();
  if (!raw) throw new Error("photoUrl is missing");

  // If already looks like a local relative path
  if (raw.startsWith("uploads/") || raw.startsWith("uploads\\") || raw.startsWith("/uploads")) {
    const clean = raw.replace(/^\/+/, "");
    return path.resolve(__dirname, "../../", clean);
  }

  // If it's a full URL
  try {
    const u = new URL(raw);
    const clean = decodeURIComponent(u.pathname).replace(/^\/+/, "");
    return path.resolve(__dirname, "../../", clean);
  } catch {
    // Fallback: strip domain if present and join
    const clean = raw.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+/, "");
    return path.resolve(__dirname, "../../", clean);
  }
}

async function generatePollutionDescriptionFromReportPhoto(photoUrl) {
  const filePath = localPathFromPhotoUrl(photoUrl);
  console.log(`[AI SERVICE] Calculated file path: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`[AI SERVICE] File NOT found at: ${filePath}`);
    throw new Error(`Report image file not found on server: ${filePath}`);
  }

  const mime = mimeFromExt(filePath);
  const base64 = fs.readFileSync(filePath, "base64");

  const openai = getOpenAIClient();
  const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

  const prompt =
    "You are helping a marine pollution reporting app. " +
    "Look at the image and write a short report description (2–4 sentences). " +
    "Mention visible pollution type(s) (plastic, glass, fishing nets, oil, etc.), " +
    "approximate amount/extent, and any important context (beach, shoreline, water). " +
    "If the image does not clearly show pollution, say that it is unclear.";

  try {
    console.log(`[AI SERVICE] Calling OpenAI with model: ${model}`);
    const resp = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mime};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const text = (resp.choices[0]?.message?.content || "").trim();
    console.log(`[AI SERVICE] Success. Generated text: ${text.substring(0, 50)}...`);
    
    const MAX_LEN = 800;
    return text.length > MAX_LEN ? text.slice(0, MAX_LEN).trim() : text;
  } catch (err) {
    console.error(`[AI SERVICE] OpenAI API call failed!`);
    console.error(`Error Message: ${err.message}`);
    throw err;
  }
}

module.exports = { generatePollutionDescriptionFromReportPhoto };