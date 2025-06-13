require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const codeStore = new Map(); // email => { code, expiresAt }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔹 인증번호 전송
app.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: '이메일이 필요합니다.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5분

  codeStore.set(email, { code, expiresAt });

  try {
    await transporter.sendMail({
      from: `"DATENAV" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'DATENAV 인증번호',
      text: `인증번호는 ${code} 입니다. 유효시간: 5분`
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: '이메일 전송 실패', error: err.message });
  }
});

// 🔹 인증번호 확인
app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const data = codeStore.get(email);

  if (!data) return res.status(400).json({ message: '인증요청 기록 없음' });
  if (Date.now() > data.expiresAt) return res.status(400).json({ message: '만료된 인증번호입니다.' });

  if (data.code === code) {
    codeStore.delete(email);
    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: '인증번호가 일치하지 않습니다.' });
  }
});

app.listen(3000, () => {
  console.log('📡 Email 인증 서버 실행 중: http://localhost:3000');
});
console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
console.log('이메일 전송 서버 환경변수 설정 완료');
