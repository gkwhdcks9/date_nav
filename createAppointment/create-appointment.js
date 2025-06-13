// ✅ create-appointment.js (로그인 사용자 정보까지 저장)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_zx2hIAQRtFPenTNLyQAKdKa9IrOrJHQ",
  authDomain: "datenavtest.firebaseapp.com",
  projectId: "datenavtest",
  storageBucket: "datenavtest.firebasestorage.app",
  messagingSenderId: "204321530388",
  appId: "1:204321530388:web:a28ebc54468633bd62fd01",
  measurementId: "G-JVYWG6T6PJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserInfo = null; // 로그인한 사용자 정보

// ✅ 로그인된 사용자 정보 가져오기
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        currentUserInfo = {
          uid: user.uid,
          email: user.email,
          name: data.name || '이름 없음'
        };
      } else {
        currentUserInfo = {
          uid: user.uid,
          email: user.email,
          name: '이름 없음'
        };
      }
    } catch (err) {
      console.error("사용자 정보 불러오기 오류:", err);
    }
  }
});

let map;
let clickMarker = null;
let searchMarker = null;
let userMarker = null;
let markers = [];
let userLat = null;
let userLng = null;
let allResults = [];
let currentPage = 1;
const resultsPerPage = 5;

function initMap(lat = 37.5665, lng = 126.9780) {
  const center = new naver.maps.LatLng(lat, lng);
  map = new naver.maps.Map('map', {
    center,
    zoom: 15
  });

  userLat = lat;
  userLng = lng;

  const circleMarker = {
    content: `<div style="width:10px;height:10px;background:red;border-radius:50%;"></div>`,
    anchor: new naver.maps.Point(5, 5)
  };

  userMarker = new naver.maps.Marker({
    position: center,
    map,
    icon: circleMarker
  });

  naver.maps.Event.addListener(map, 'click', function (e) {
    const lat = e.coord.lat();
    const lng = e.coord.lng();
    if (clickMarker) {
      clickMarker.setPosition(e.coord);
    } else {
      clickMarker = new naver.maps.Marker({
        position: e.coord,
        map: map
      });
    }
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;
  });
}

function searchPlaceAndMoveMap() {
  const query = document.getElementById("place").value.trim();
  if (!query) return alert("장소명을 입력해주세요.");
  if (userLat === null || userLng === null) return alert("위치를 불러오지 못했습니다.");

  fetch(`http://localhost:3001/kakao-search?query=${encodeURIComponent(query)}&lat=${userLat}&lng=${userLng}`)
    .then(res => res.json())
    .then(data => {
      allResults = data.items || [];
      currentPage = 1;
      displayPage(currentPage);
    })
    .catch(err => {
      console.error(err);
      alert("검색 중 오류가 발생했습니다");
    });
}

function displayPage(page) {
  const resultList = document.getElementById("search-results");
  const pagination = document.getElementById("pagination");
  resultList.innerHTML = "";
  pagination.innerHTML = "";
  markers.forEach(m => m.setMap(null));
  markers = [];

  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageItems = allResults.slice(start, end);

  pageItems.forEach(place => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const position = new naver.maps.LatLng(lat, lng);

    const li = document.createElement("li");
    li.textContent = `${place.place_name} (${place.road_address_name || place.address_name})`;
    li.style.cursor = 'pointer';
    li.addEventListener("click", () => {
      map.setCenter(position);
      if (searchMarker) searchMarker.setMap(null);
      searchMarker = new naver.maps.Marker({ map, position });
      document.getElementById("lat").value = lat;
      document.getElementById("lng").value = lng;

      const placeName = place.place_name;
      const address = place.road_address_name || place.address_name || '';
      document.getElementById("place").value = `${placeName} (${address})`;
    });
    resultList.appendChild(li);

    const marker = new naver.maps.Marker({
      map,
      position,
      title: place.place_name,
    });
    markers.push(marker);
    marker.addListener("click", () => {
      li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  const totalPages = Math.ceil(allResults.length / resultsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.margin = "0 4px";
    if (i === currentPage) btn.style.fontWeight = "bold";
    btn.addEventListener("click", () => {
      currentPage = i;
      displayPage(i);
    });
    pagination.appendChild(btn);
  }
}

function searchAddressAndMoveMap() {
  const address = document.getElementById("address").value.trim();
  if (!address) return alert("주소를 입력해주세요");
  naver.maps.Service.geocode({ query: address }, function (status, response) {
    if (status !== naver.maps.Service.Status.OK) return alert("주소를 찾을 수 없습니다");
    const result = response.v2.addresses[0];
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    const position = new naver.maps.LatLng(lat, lng);
    if (searchMarker) searchMarker.setMap(null);
    searchMarker = new naver.maps.Marker({ map, position });
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
    map.setCenter(position);
  });
}

async function saveAppointment(e) {
  e.preventDefault();

  if (!currentUserInfo) {
    alert("로그인 후 약속을 등록할 수 있습니다.");
    return;
  }

  const title = document.getElementById('title').value;
  const place = document.getElementById('place').value;
  const maxPeople = parseInt(document.getElementById('maxPeople').value);
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);
  const category = document.getElementById('category').value;
  const appointmentTimeRaw = document.getElementById('appointmentTime').value;
  const appointmentTime = appointmentTimeRaw ? new Date(appointmentTimeRaw) : null;

  if (!appointmentTime || isNaN(appointmentTime.getTime())) {
    alert("약속 시간을 정확히 입력해주세요.");
    return;
  }


  if (!title || !place || !maxPeople || !category || isNaN(lat) || isNaN(lng)) {
    alert("모든 필드를 정확히 입력해주세요.");
    return;
  }

  try {
    const docRef = doc(collection(db, 'appointments'));
    const appointmentId = docRef.id;

    await setDoc(docRef, {
      appointmentId,              // ✅ ID 저장
      title,
      place,
      category,
      maxPeople,
      currentPeople: 1,
      lat,
      lng,
      createdAt: new Date(),
      writerName: currentUserInfo.name,
      writerEmail: currentUserInfo.email,
      members: [currentUserInfo.email], // ✅ 작성자 이메일 저장
      appointmentTime
    });

    alert("약속이 저장되었습니다!");
    location.reload();
  } catch (error) {
    console.error("저장 실패", error);
    alert("저장 중 오류 발생");
  }
}

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => initMap(position.coords.latitude, position.coords.longitude),
      () => {
        console.warn("위치 접근 실패, 기본 위치(서울)로 대체");
        initMap();
      }
    );
  } else {
    alert("위치 정보 사용이 불가능한 브라우저입니다.");
    initMap();
  }

  document.getElementById("choose-place").onclick = () => {
    document.getElementById("place-search-container").style.display = "block";
    document.getElementById("address-search-container").style.display = "none";
  };

  document.getElementById("choose-address").onclick = () => {
    document.getElementById("place-search-container").style.display = "none";
    document.getElementById("address-search-container").style.display = "block";
  };

  document.getElementById("search-place-btn").onclick = (e) => {
    e.preventDefault();
    searchPlaceAndMoveMap();
  };

  document.getElementById("search-address-btn").onclick = (e) => {
    e.preventDefault();
    searchAddressAndMoveMap();
  };

  document.getElementById("appointment-form").addEventListener("submit", saveAppointment);
};
