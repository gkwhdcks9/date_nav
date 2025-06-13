// 네이버 맵 초기화
function initMap(lat = 37.5665, lng = 126.9780) { // 기본값: 서울
    const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 13
    };

    // 지도 생성
    const map = new naver.maps.Map('map', mapOptions);

    // 현재 위치 마커 추가
    new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
        title: "현재 위치",
        animation: naver.maps.Animation.BOUNCE
    });
}

// 위치 정보 가져오기
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        document.getElementById('location').textContent = 
            `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
        
        // 지도 초기화
        initMap(lat, lng);
    }, () => {
        alert("위치 정보를 가져올 수 없습니다.");
        initMap(); // 기본 서울 위치
    });
} else {
    alert("Geolocation을 지원하지 않는 브라우저입니다.");
    initMap();
}
