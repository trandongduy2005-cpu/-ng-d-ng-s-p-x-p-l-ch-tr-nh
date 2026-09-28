import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI client initialization
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    appName: "SmartPlanna",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Gemini Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history = [], userProfile, language = "vi" } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      // Intelligent fallback when API key is missing
      const fallbackRepliesVi = [
        `Xin chào! Tôi là Trợ lý AI SmartPlanna. Để tối ưu hóa lịch học và công việc của bạn, hãy ưu tiên chia thời gian thành các khối 45-90 phút (Pomodoro/Time-blocking).`,
        `Gợi ý lịch trình: Buổi sáng dành cho học tập/sáng tạo sâu, buổi chiều cho làm việc nhóm/thực hành, và buổi tối dành 1 giờ tập gym hoặc giải trí trước khi nghỉ ngơi.`,
        `Về quản lý chi tiêu: Hãy áp dụng quy tắc 50/30/20 (50% sinh hoạt thiết yếu, 30% phát triển & giải trí, 20% tiết kiệm dự phòng).`,
      ];
      const fallbackRepliesEn = [
        `Hello! I'm your SmartPlanna AI Assistant. To optimize your schedule, try time-blocking in 45-90 minute focus blocks.`,
        `Routine recommendation: Dedicate morning to deep study or creative work, afternoon for collaboration, and evening for gym or rest.`,
      ];
      const replies = language === "en" ? fallbackRepliesEn : fallbackRepliesVi;
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      res.json({
        reply: `${randomReply}\n\n*(Chế độ ngoại tuyến / Trả lời tự động của SmartPlanna)*`,
        source: "offline_fallback",
      });
      return;
    }

    const systemPrompt = `Bạn là Trợ lý AI thông minh tích hợp trong ứng dụng "SmartPlanna" - nền tảng đa năng hàng đầu dành cho học sinh, sinh viên, người đi làm, nghệ sĩ để:
1. Sắp xếp lịch học, lịch làm việc, lịch sinh hoạt (ăn uống, ngủ nghỉ, gym, nhảy, tập luyện, nghệ sĩ đi show).
2. Quản lý công việc và theo dõi chi tiêu, cân bằng cuộc sống.
3. Gợi ý du lịch, địa điểm tại các tỉnh thành Việt Nam (homestay, nhà hàng, quán ăn, lịch trình di chuyển).
4. Gợi ý việc làm thêm uy tín phù hợp với thời gian rảnh và lịch học của sinh viên.
5. Ngôn ngữ phản hồi: ${language === "en" ? "English" : "Tiếng Việt"}. Hãy trả lời thân thiện, mạch lạc, tích cực, thực tế, có định dạng bullet point rõ ràng khi cần thiết.
Thông tin người dùng hiện tại: ${JSON.stringify(userProfile || {})}`;

    // Format prompt with context
    const fullPrompt = `${systemPrompt}\n\nLịch sử trò chuyện gần đây:\n${history
      .map((h: { role: string; text: string }) => `${h.role}: ${h.text}`)
      .join("\n")}\n\nNgười dùng: ${message}\nSmartPlanna AI:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: fullPrompt,
    });

    const reply = response.text || "SmartPlanna đã nhận yêu cầu của bạn!";
    res.json({ reply, source: "gemini-3.8-flash" });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({
      error: "Không thể kết nối đến AI, vui lòng thử lại sau.",
      details: error?.message || "Internal error",
    });
  }
});

// Gemini Smart Schedule Assistant
app.post("/api/gemini/suggest-schedule", async (req, res) => {
  try {
    const { role = "student", currentTasks = [], busyHours = [], language = "vi" } = req.body;
    const ai = getGenAI();

    if (!ai) {
      res.json({
        plan: [
          { time: "07:00 - 08:00", title: "Thức dậy & Ăn sáng lành mạnh", category: "personal" },
          { time: "08:30 - 11:30", title: "Lịch học / Làm việc tập trung", category: "study" },
          { time: "12:00 - 13:00", title: "Ăn trưa & Nghỉ ngơi ngắn", category: "personal" },
          { time: "14:00 - 17:00", title: "Làm bài tập nhóm / Việc làm thêm", category: "work" },
          { time: "17:30 - 18:30", title: "Tập gym / Thể dục / Nhảy giải phóng năng lượng", category: "health" },
          { time: "19:00 - 20:00", title: "Ăn tối & Thời gian gia đình/bạn bè", category: "personal" },
          { time: "20:30 - 22:30", title: "Ôn bài / Dự án cá nhân / Chuẩn bị ngày mới", category: "study" },
        ],
        advice: "Hãy nhớ uống đủ 2 lít nước và ngủ đủ 7-8 tiếng để giữ hiệu suất cao nhất!",
      });
      return;
    }

    const prompt = `Hãy tạo một kế hoạch sắp xếp lịch trình trong ngày tối ưu cho một người có vai trò: "${role}".
Các nhiệm vụ cần làm: ${JSON.stringify(currentTasks)}.
Khung giờ bận: ${JSON.stringify(busyHours)}.
Ngôn ngữ: ${language === "en" ? "English" : "Tiếng Việt"}.
Yêu cầu phản hồi dạng JSON hợp lệ với cấu trúc:
{
  "plan": [
    { "time": "HH:MM - HH:MM", "title": "Tên hoạt động", "category": "study|work|personal|health|art" }
  ],
  "advice": "Lời khuyên cân bằng công việc và sức khỏe ngắn gọn"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Suggest Schedule Error:", error);
    res.status(500).json({ error: "Lỗi tạo lịch trình thông minh" });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartPlanna Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
