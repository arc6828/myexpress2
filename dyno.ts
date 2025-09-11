// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.info('server started');

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";
const CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") ?? "";


Deno.serve(async (req) => {
  const { method } = req;
  let response;
  try {
    if (method === "GET") {
      // ตัวอย่าง: ดึงข้อมูล (query string)
      const url = new URL(req.url);
      const data = url.searchParams.get("data") || "World";
      response = {
        message: `GET: Hello Chavalit ${data}!`
      };
    } else if (method === "POST") {
      const body = await req.json();
      // body.events เป็น array ของ event
      const events = body.events ?? [];
      const results = <any>[];

      for (const event of events) {
        if (
          event.type === "message" &&
          event.message.type === "text"
        ) {
          // เตรียม payload สำหรับ reply
          const replyPayload = {
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: `คุณพิมพ์ว่า: ${event.message.text}`,
              },
            ],
          };

          // เรียก LINE Messaging API
          const lineRes = await fetch(LINE_REPLY_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(replyPayload),
          });

          results.push({
            status: lineRes.status,
            statusText: lineRes.statusText,
          });
        }
      }

      response = { results };
    }
    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Connection": "keep-alive"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
