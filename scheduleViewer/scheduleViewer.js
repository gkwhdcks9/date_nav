import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, addDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
const db = getFirestore(app);
const auth = getAuth(app);

const tbody = document.querySelector("#schedule-table tbody");
const userList = document.getElementById("user-list");
const messageBtn = document.getElementById("message-btn");
const modal = document.getElementById("message-modal");
const textarea = document.getElementById("message-text");
const cancelBtn = document.getElementById("cancel-message");
const sendBtn = document.getElementById("send-message");

let currentUserEmail = null;
let selectedTargetEmail = null;


// 테이블 생성
for (let hour = 9; hour <= 18; hour++) {
  const row = document.createElement("tr");
  const th = document.createElement("th");
  th.textContent = `${hour}:00`;
  row.appendChild(th);

  for (let day = 0; day < 5; day++) {
    const td = document.createElement("td");
    td.setAttribute("data-hour", hour);
    td.setAttribute("data-day", day);
    td.contentEditable = "false";
    row.appendChild(td);
  }

  tbody.appendChild(row);
}

// 로그인 사용자 감지 후 사용자 목록 불러오기
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("로그인이 필요합니다.");
    location.href = "/login.html";
    return;
  }

  currentUserEmail = user.email;
  await loadSharedUsers();
});

async function loadSharedUsers() {
  const q = query(collection(db, "schedules"), where("share", "==", true));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.email === currentUserEmail) return; // 본인 제외

    const div = document.createElement("div");
    div.className = "user-item";
    div.dataset.id = doc.id;
    div.dataset.email = data.email;
    div.innerHTML = `<strong>${data.email}</strong><br/>전공: ${data.major || '미입력'}`;
    div.addEventListener("click", () => {
        displaySchedule(doc.id);
        selectedTargetEmail = data.email;
        messageBtn.style.display = "block";
      });
      
    userList.appendChild(div);
  });
}

async function displaySchedule(docId) {
  const q = query(collection(db, "schedules"));
  const snapshot = await getDocs(q);
  const doc = snapshot.docs.find(d => d.id === docId);
  if (!doc) return;

  document.querySelectorAll("td").forEach(td => td.textContent = "");

  const schedule = doc.data().schedule;
  schedule.forEach(item => {
    const selector = `td[data-hour='${item.hour}'][data-day='${item.day}']`;
    const cell = document.querySelector(selector);
    if (cell) cell.textContent = item.subject;
  });
}
messageBtn.onclick = () => {
    modal.style.display = "flex";
  };
  
cancelBtn.onclick = () => {
  modal.style.display = "none";
  textarea.value = "";
};

sendBtn.onclick = async () => {
  const content = textarea.value.trim();
  if (!content) return alert("메시지를 입력해주세요.");

  const emails = [currentUserEmail, selectedTargetEmail].sort();
  const groupId = emails.join("_");

  try {
    await addDoc(collection(db, "messages"), {
      from: currentUserEmail,
      to: selectedTargetEmail,
      content,
      groupId, // ✅ 여기에 추가됨
      timestamp: new Date()
    });
    alert("쪽지를 보냈습니다!");
    modal.style.display = "none";
    textarea.value = "";
  } catch (e) {
    console.error("쪽지 저장 오류:", e);
    alert("쪽지 전송 실패!");
  }
};
