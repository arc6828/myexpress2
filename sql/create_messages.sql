create table messages (
  id uuid default gen_random_uuid() primary key,
  user_id VARCHAR(255),                  -- LINE userId
  message_id text not null,              -- LINE messageId
  type text not null,                    -- text, image, sticker, video
  content text,                          -- ข้อความหรือ URL ของไฟล์
  reply_token text,                      -- token สำหรับ reply  
  reply_content text,                    -- ข้อความที่ตอบกลับ สามารถ null
  created_at timestamp default now()
);

INSERT INTO books (id, title, description, price, image) VALUES
('1', 'React Native Basics', 'หนังสือแนะนำการพัฒนาแอปด้วย React Native สำหรับผู้เริ่มต้น', 299.00, 'https://picsum.photos/200?random=1'),
('2', 'Advanced React Native', 'เทคนิคขั้นสูงและการจัดการ State, Navigation, และ Performance', 459.00, 'https://picsum.photos/200?random=2'),
('3', 'Supabase with React Native', 'การเชื่อมต่อฐานข้อมูลและ API ด้วย Supabase บน React Native', 399.00, 'https://picsum.photos/200?random=3'),
('4', 'JavaScript Essentials', 'พื้นฐาน JavaScript ที่จำเป็นสำหรับนักพัฒนา React Native', 199.00, 'https://picsum.photos/200?random=4'),
('5', 'Mobile UI/UX Design', 'แนวทางการออกแบบ UI/UX สำหรับแอปพลิเคชันมือถือที่ใช้งานง่าย', 350.00, 'https://picsum.photos/200?random=5');
