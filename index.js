// index.js
require("dotenv").config();
const express = require("express");
const line = require("@line/bot-sdk");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

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

// ตอบกลับข้อความ
async function handleEvent(event) {
  if (event.type === "message" && event.message.type === "image") {
    const messageId = event.message.id;

    try {
      // ดึงไฟล์จาก LINE
      const stream = await client.getMessageContent(messageId);

      // แปลง stream → buffer
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // อัพโหลดเข้า Supabase Storage
      const fileName = `line_images/${messageId}.jpg`;
      const { data, error } = await supabase.storage
        .from("uploads") // ชื่อ bucket
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true, // ถ้ามีไฟล์ชื่อซ้ำ จะเขียนทับ
        });

      if (error) {
        console.error("❌ Upload error:", error);
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "อัปโหลดรูปไป Supabase ไม่สำเร็จ",
        });
      }

      console.log("✅ Uploaded to Supabase:", data);

      // ตอบกลับ User
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "📷 ได้รับรูปแล้ว และอัปโหลดไป Supabase สำเร็จ!",
      });
    } catch (err) {
      console.error("❌ Error:", err);
    }
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  // get message from user
  const userMessage = event.message.text;
  // save message to Supabase

  // return client.replyMessage(event.replyToken, {
  //   type: 'text',
  //   text: `คุณพิมพ์ว่า: ${event.message.text} ใช่ไหม?`
  // });

  console.log({
    user_id: event.source.userId,
    message_id: event.message.id,
    type: event.message.type,
    content: event.message.text || event.message.fileUrl,
    reply_token: event.replyToken,
  });

  return supabase
    .from("messages")
    .insert({
      user_id: event.source.userId,
      message_id: event.message.id,
      type: event.message.type,
      content: event.message.text || event.message.fileUrl,
      reply_token: event.replyToken,
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
        text: `คุณพิมพ์ว่า: ${event.message.text} ใช่ไหม?`,
      });
    });
}

const client = new line.Client(config);
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
