// ✅ lastone.js - 쪽지 기능 포함
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, addDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserEmail = null;
let replyTargetEmail = null;
let currentGroupId = null;

// 위치 관련
let map;
let userMarker;
let appointmentMarkers = [];

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function initMap(lat, lng) {
  const center = new naver.maps.LatLng(lat, lng);
  map = new naver.maps.Map("map", {
    center,
    zoom: 15,
  });

  userMarker = new naver.maps.Marker({
    position: center,
    map,
    icon: {
      content: `<div style="width: 12px; height: 12px; background: red; border-radius: 50%; box-shadow: 0 0 3px rgba(0,0,0,0.3);"></div>`,
      anchor: new naver.maps.Point(6, 6)
    }
  });
}

async function loadAppointments(userLat, userLng) {
  const listContainer = document.getElementById("appointments-list");
  listContainer.innerHTML = "";

  const snapshot = await getDocs(collection(db, "appointments"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const lat = data.lat;
    const lng = data.lng;
    const distance = getDistance(userLat, userLng, lat, lng);

    // 거리만 필터링 (반경 3km 이내)
  if (getDistance(userLat, userLng, data.lat, data.lng) > 3000) return;


    const position = new naver.maps.LatLng(lat, lng);
    const titleDiv = document.createElement("div");
    titleDiv.textContent = `📍 ${data.title}`;
    titleDiv.className = "appointment-title";
    titleDiv.style.cursor = "pointer";

    const detailDiv = document.createElement("div");
    detailDiv.className = "appointment-card";
    detailDiv.style.display = "none";
    detailDiv.innerHTML = `
      <p><strong>장소:</strong> ${data.place}</p>
      <p><strong>도로명 주소:</strong> ${data.roadAddress || '정보 없음'}</p>
      <p><strong>지번 주소:</strong> ${data.address || '정보 없음'}</p>
      <p><strong>인원:</strong> ${data.currentPeople} / ${data.maxPeople}</p>
      <p><strong>작성 시간:</strong> ${data.createdAt?.toDate().toLocaleString() || '정보 없음'}</p>
      <div style="text-align: right; margin-top: 8px;">
        <button class="message-btn" style="padding: 6px 12px; background-color: #ff4d4f; color: white; border: none; border-radius: 6px; cursor: pointer;">
          쪽지 보내기
        </button>
      </div>
    `;

    titleDiv.addEventListener("click", () => {
      const isOpen = detailDiv.style.display === "block";
      document.querySelectorAll(".appointment-card").forEach(el => el.style.display = "none");
      detailDiv.style.display = isOpen ? "none" : "block";
      map.setCenter(position);
    });

    const msgBtn = detailDiv.querySelector(".message-btn");
    msgBtn.onclick = () => {
      // 기존 채팅창 제거
      const existingChat = document.getElementById("chat-area");
      if (existingChat) existingChat.remove();

      // 작성자 이메일 유효성 체크
      if (data.writerEmail && doc.id) {
        openChat(data.writerEmail, doc.id, data.title);
      } else {
        alert("작성자 이메일 정보가 없습니다. 쪽지를 보낼 수 없습니다.");
      }
    };
    listContainer.appendChild(titleDiv);
    listContainer.appendChild(detailDiv);

    const marker = new naver.maps.Marker({ position, map, title: data.title });
    marker.addListener("click", () => {
      titleDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      document.querySelectorAll(".appointment-card").forEach(el => el.style.display = "none");
      detailDiv.style.display = "block";
    });

    appointmentMarkers.push(marker);
  });
}

// 쪽지 기능
async function openChat(targetEmail, appointmentId, title) {
  const chatModal = document.getElementById("chat-modal");
  const chatContent = document.getElementById("chat-content");

  // 이전 채팅 로그 제거
  const prevLogs = chatContent.querySelectorAll(".chat-area");
  prevLogs.forEach(el => el.remove());

  const container = document.createElement("div");
  container.className = "chat-area";

  const titleElem = document.createElement("h3");
  titleElem.textContent = `💬 ${title} 약속 채팅방`;
  container.appendChild(titleElem);

  const chatLog = document.createElement("div");
  chatLog.style.maxHeight = "300px";
  chatLog.style.overflowY = "auto";
  chatLog.style.marginBottom = "1rem";
  container.appendChild(chatLog);

  const groupId = appointmentId; // 👈 약속 ID를 그룹 ID로 사용
  currentGroupId = groupId;
  replyTargetEmail = targetEmail;

  const q = query(collection(db, "messages"), where("groupId", "==", groupId));
  const snapshot = await getDocs(q);

  const sorted = snapshot.docs.map(d => d.data()).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
  sorted.forEach(m => {
    const msg = document.createElement("div");
    msg.style.margin = "0.5rem 0";
    msg.style.background = m.from === currentUserEmail ? "#d1f0ff" : "#f3f3f3";
    msg.style.padding = "0.5rem";
    msg.style.borderRadius = "8px";
    msg.innerHTML = `<small>${m.from}</small><br>${m.content}`;
    chatLog.appendChild(msg);
  });

  const textarea = document.createElement("textarea");
  textarea.placeholder = "메시지를 입력하세요";
  textarea.style.width = "100%";
  textarea.rows = 3;
  container.appendChild(textarea);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "전송";
  sendBtn.style.marginTop = "0.5rem";
  sendBtn.onclick = async () => {
    const content = textarea.value.trim();
    if (!content) return;

    await addDoc(collection(db, "messages"), {
      from: currentUserEmail,
      to: targetEmail,
      content,
      groupId,
      title,
      timestamp: new Date()
    });

    const msg = document.createElement("div");
    msg.style.margin = "0.5rem 0";
    msg.style.background = "#d1f0ff";
    msg.style.padding = "0.5rem";
    msg.style.borderRadius = "8px";
    msg.innerHTML = `<small>${currentUserEmail}</small><br>${content}`;
    chatLog.appendChild(msg);
    textarea.value = "";
    chatLog.scrollTop = chatLog.scrollHeight;
  };
  container.appendChild(sendBtn);

  chatContent.appendChild(container);
  chatModal.style.display = "flex";
}

// 모달 닫기
document.getElementById("chat-close").addEventListener("click", () => {
  document.getElementById("chat-modal").style.display = "none";
});



window.onload = () => {
  onAuthStateChanged(auth, user => {
    if (user) {
      currentUserEmail = user.email;
    }
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        document.getElementById("location").textContent = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        initMap(userLat, userLng);
        loadAppointments(userLat, userLng);
      },
      () => alert("위치 정보를 가져올 수 없습니다.")
    );
  } else {
    alert("브라우저가 위치 정보를 지원하지 않습니다.");
  }
};
