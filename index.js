// index.js
require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get("/", (req, res) => {
  res.send("hello world, Chavalit");
});

// ตั้งค่าจาก LINE Developers Console
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
};

app.use("/webhook", line.middleware(config));

// รับ webhook
app.post("/webhook", (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});
// ฟังก์ชัน getGeminiReply
async function getGeminiReply(message) {
  try {
    // ส่งข้อความไปที่ Gemini
    const result = await model.generateContent(message);
    // ดึงข้อความตอบกลับ
    const reply = result.response.text();
    return reply;
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "Something went wrong" });
    return "Something went wrong";
  }
}

// ตอบกลับข้อความ
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  // return client.replyMessage(event.replyToken, {
  //   type: 'text',
  //   text: `คุณพิมพ์ว่า: ${event.message.text} ใช่ไหม?`
  // });

  // ข้อความที่ผู้ใช้พิมพ์มา
  const userMessage = event.message.text;

  // ข้อความที่ตอบกลับ
  // const replyContent = `คุณพิมพ์ว่า: ${userMessage} ใช่ไหม?`;

  // ข้อความที่ตอบกลับจาก GEMINI API
  const replyContent = await getGeminiReply(userMessage);

  return supabase
    .from("messages")
    .insert({
      user_id: event.source.userId,
      message_id: event.message.id,
      type: event.message.type,
      content: userMessage,
      reply_token: event.replyToken,
      reply_content: replyContent,
    })
    .then(({ error }) => {
      if (error) {
        console.error("Error inserting message:", error);
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "เกิดข้อผิดพลาดในการบันทึกข้อความ",
        });
      }
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: replyContent,
      });
    });
}

const client = new line.Client(config);
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
