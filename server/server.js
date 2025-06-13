require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors({
  origin: 'http://127.0.0.1:5500/' // 클라이언트 주소
}));

// 프록시 라우트
app.get('/api/search', async (req, res) => {
  try {
    const { query, category, display = 10 } = req.query;
    
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query,
        display,
        category
      },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});