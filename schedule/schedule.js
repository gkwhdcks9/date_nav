// ✅ schedule.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, where, setDoc, doc
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

let currentUser = null;
let existingDocId = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // 기존 시간표 확인
    const q = query(collection(db, "schedules"), where("email", "==", currentUser.email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // 기존 문서 ID 저장
      const docData = snapshot.docs[0];
      existingDocId = docData.id;

      // 기존 데이터 불러와서 화면에 표시
      const data = docData.data();
      document.getElementById("major").value = data.major || "";
      document.getElementById("share-checkbox").checked = data.share || false;

      // 시간표 입력
      data.schedule.forEach(item => {
        const selector = `td[data-hour='${item.hour}'][data-day='${item.day}']`;
        const cell = document.querySelector(selector);
        if (cell) cell.textContent = item.subject;
      });

      // 버튼 텍스트 변경
      document.getElementById("save-btn").textContent = "시간표 수정";
    }
  } else {
    alert("로그인 후 사용 가능한 기능입니다.");
    location.href = "/login.html";
  }
});

document.getElementById("save-btn").addEventListener("click", async () => {
  if (!currentUser) return;

  const major = document.getElementById("major").value;
  const share = document.getElementById("share-checkbox").checked;
  const table = document.getElementById("schedule-table");
  const rows = table.querySelectorAll("tbody tr");
  const schedule = [];

  rows.forEach(row => {
    const hour = row.querySelector("th").textContent.replace(":00", "");
    const cells = row.querySelectorAll("td");
    cells.forEach((cell, index) => {
      const content = cell.textContent.trim();
      if (content !== "") {
        schedule.push({ day: index, hour: parseInt(hour), subject: content });
      }
    });
  });

  try {
    const data = {
      uid: currentUser.uid,
      email: currentUser.email,
      major,
      share,
      schedule,
      updatedAt: new Date()
    };

    if (existingDocId) {
      // 문서 업데이트
      await setDoc(doc(db, "schedules", existingDocId), data);
      alert("시간표가 수정되었습니다!");
    } else {
      // 새 문서 추가
      await addDoc(collection(db, "schedules"), {
        ...data,
        createdAt: new Date()
      });
      alert("시간표가 저장되었습니다!");
    }

  } catch (err) {
    console.error("시간표 저장 오류:", err);
    alert("저장 중 오류가 발생했습니다.");
  }
});
