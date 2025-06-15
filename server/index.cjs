// ✅ index.cjs (카카오 검색 최대 30개까지 통합 요청)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const KAKAO_REST_API_KEY = 'b4acbb6305f3e85a8b72b9172e7899fb'; // 직접 입력

app.use(cors());
app.use(express.json());

app.get('/kakao-search', async (req, res) => {
  const query = req.query.query?.trim();
  console.log('📌 받은 query:', query);

  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  if (!query || query.length === 0 || isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: '잘못된 요청입니다. (query 또는 좌표 확인)' });
  }

  const url = 'https://dapi.kakao.com/v2/local/search/keyword.json';
  const baseParams = {
    query: query,
    x: String(userLng),
    y: String(userLat),
    radius: '3000',
    size: '15',
  };

  try {
    const [page1, page2] = await Promise.all([
      axios.get(url, {
        headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` },
        params: { ...baseParams, page: 1 },
      }),
      axios.get(url, {
        headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` },
        params: { ...baseParams, page: 2 },
      }),
    ]);

    const documents = [...page1.data.documents, ...page2.data.documents];

    res.json({ items: documents });
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error('❌ 카카오 검색 오류 응답:', errorData);
    res.status(500).json({ error: '카카오 API 오류', detail: errorData });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
