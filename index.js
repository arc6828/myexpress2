// index.js
const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

app.get('/', (req, res) => {
  res.send('hello world, Chavalit');
});

// ตั้งค่าจาก LINE Developers Console
const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
};

app.use('/webhook', line.middleware(config));

// รับ webhook
app.post('/webhook', (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(result => res.json(result));
});

// ตอบกลับข้อความ
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `คุณพิมพ์ว่า: ${event.message.text}`
  });
}

const client = new line.Client(config);
const PORT = process.env.PORT || 3099;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
