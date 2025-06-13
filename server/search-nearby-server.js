import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());

// 위도, 경도를 기준으로 두 지점 사이 거리 계산 함수 (Haversine)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 지구 반지름 (단위: km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 단위: km
}

app.get('/search', async (req, res) => {
  const query = req.query.query;
  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  if (!query || isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=30`;

  // 디버깅 로그 추가
  console.log('🔍 검색어:', query);
  console.log('📍 사용자 위치:', userLat, userLng);
  console.log('🌐 요청 URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': process.env.CLIENT_ID,
        'X-Naver-Client-Secret': process.env.CLIENT_SECRET
      }
    });

    const data = await response.json();
    if (!data.items) return res.status(500).json({ error: '검색 실패' });

    // 위도/경도로 변환 (mapx/mapy는 1e7 나눠야 함)
    const sorted = data.items.map(item => {
      const lat = parseFloat(item.mapy) / 1e7;
      const lng = parseFloat(item.mapx) / 1e7;
      const distance = getDistance(userLat, userLng, lat, lng); // 단위: km
      return { ...item, lat, lng, distance };
    }).sort((a, b) => a.distance - b.distance); // 가까운 순 정렬

    res.json({ items: sorted });

  } catch (error) {
    console.error('❌ 서버 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

app.listen(port, () => {
  console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중`);
});
