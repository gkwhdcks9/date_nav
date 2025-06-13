// main.js - 쪽지 기능 개선 + 채팅 모달 유지 + 정렬 오류 해결 + 약속 정보 로딩 복구
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserEmail = null;
let replyTargetEmail = null;
let currentGroupId = null;

const inboxModal = document.getElementById("inbox-modal");
const inboxList = document.getElementById("inbox-list");
const closeInboxBtn = document.getElementById("close-inbox");

const ctaButtons = document.querySelector('.cta-buttons');
const userDisplay = document.createElement("div");
userDisplay.style.color = "black";
userDisplay.style.fontWeight = "bold";

const logoutBtn = document.createElement("button");
logoutBtn.textContent = "로그아웃";
logoutBtn.style.marginLeft = "10px";
logoutBtn.style.padding = "6px 12px";
logoutBtn.style.border = "none";
logoutBtn.style.borderRadius = "4px";
logoutBtn.style.cursor = "pointer";
logoutBtn.style.backgroundColor = "#f05454";
logoutBtn.style.color = "#fff";

const inboxButton = document.createElement("button");
inboxButton.id = "inbox-btn";
inboxButton.textContent = "쪽지함";
inboxButton.className = "btn btn-secondary";
inboxButton.style.marginLeft = "10px";

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("로그아웃 되었습니다.");
  location.reload();
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserEmail = user.email;

    try {
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        userDisplay.textContent = `${userData.name}님 환영합니다!`;
      } else {
        userDisplay.textContent = `${user.email}로 로그인됨`;
      }
    } catch (err) {
      console.error("사용자 정보 오류:", err);
      userDisplay.textContent = `${user.email}로 로그인됨`;
    }

    ctaButtons.innerHTML = '';
    ctaButtons.appendChild(userDisplay);
    ctaButtons.appendChild(logoutBtn);
    ctaButtons.appendChild(inboxButton);
    loadMyPastAppointments();
  }
});

inboxButton.addEventListener("click", async () => {
  inboxList.innerHTML = "<p>쪽지를 불러오는 중...</p>";
  inboxModal.style.display = "flex";

  const q = query(collection(db, "messages"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    inboxList.innerHTML = "<p>쪽지가 없습니다.</p>";
    return;
  }

  inboxList.innerHTML = "";
  const groupMap = new Map();;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.from === currentUserEmail || data.to === currentUserEmail) {
      groupMap.set(data.groupId, data);
    }
  }

  for (const [groupId, data] of groupMap.entries()) {
    let title = data.title || "(제목 없음)";
    let appointmentId = data.appointmentId || groupId;

    const div = document.createElement("div");
    div.style.border = "1px solid #ddd";
    div.style.borderRadius = "10px";
    div.style.padding = "1rem";
    div.style.background = "#fff8f9";

    div.innerHTML = `
      <strong>약속: ${title}</strong><br/>
      <button class="btn btn-secondary chat-btn" style="margin-top:0.5rem;">채팅 보기</button>
    `;

    const chatBtn = div.querySelector(".chat-btn");
    chatBtn.onclick = () => openChat(data.from === currentUserEmail ? data.to : data.from, groupId, title);
    inboxList.appendChild(div);
  }
});

async function openChat(targetEmail, appointmentId, title) {
  console.log("📨 openChat 호출됨", { targetEmail, appointmentId, title });

  inboxList.innerHTML = `<h3>📨 "${title}" 약속의 채팅방</h3>`;
  const emails = [currentUserEmail, targetEmail].sort();
  currentGroupId = appointmentId;
  replyTargetEmail = targetEmail;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "대화 삭제";
  deleteBtn.className = "btn btn-secondary";
  deleteBtn.style.marginBottom = "1rem";
  deleteBtn.onclick = async () => {
    if (confirm("정말 이 대화를 삭제하시겠습니까?")) {
      const q = query(collection(db, "messages"), where("groupId", "==", currentGroupId));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "messages", docSnap.id));
      }
      alert("대화가 삭제되었습니다.");
      inboxList.innerHTML = "<p>대화가 삭제되었습니다.</p>";
      setTimeout(() => {
        inboxModal.style.display = "none";
      }, 1000);
    }
  };
  inboxList.appendChild(deleteBtn);

  const q = query(collection(db, "messages"), where("groupId", "==", currentGroupId));
  const snapshot = await getDocs(q);

  const sorted = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);

  const chatContainer = document.createElement("div");
  chatContainer.id = "chat-log";
  chatContainer.style.marginBottom = "1rem";
  inboxList.appendChild(chatContainer);

  sorted.forEach(data => {
    const msg = document.createElement("div");
    msg.style.margin = "0.5rem 0";
    msg.style.padding = "0.5rem 1rem";
    msg.style.borderRadius = "10px";
    msg.style.maxWidth = "80%";
    msg.style.background = data.from === currentUserEmail ? "#d1f0ff" : "#f3f3f3";
    msg.innerHTML = `<small>${data.from}</small><br>${data.content}`;
    chatContainer.appendChild(msg);
  });

  const replyInput = document.createElement("textarea");
  replyInput.placeholder = "메시지를 입력하세요...";
  replyInput.style.width = "100%";
  replyInput.style.marginTop = "1rem";
  replyInput.rows = 3;

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "전송";
  sendBtn.className = "btn btn-primary";
  sendBtn.style.marginTop = "0.5rem";

  sendBtn.onclick = async () => {
    const content = replyInput.value.trim();
    if (!content) return;

    await addDoc(collection(db, "messages"), {
      from: currentUserEmail,
      to: replyTargetEmail,
      content,
      groupId: currentGroupId,
      appointmentId: currentGroupId,
      title,
      timestamp: new Date()
    });

    const msg = document.createElement("div");
    msg.style.margin = "0.5rem 0";
    msg.style.padding = "0.5rem 1rem";
    msg.style.borderRadius = "10px";
    msg.style.maxWidth = "80%";
    msg.style.background = "#d1f0ff";
    msg.innerHTML = `<small>${currentUserEmail}</small><br>${content}`;
    chatContainer.appendChild(msg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    replyInput.value = "";
  };
  inboxList.appendChild(replyInput);
  inboxList.appendChild(sendBtn);

  // ✅ 참여 신청 및 수락 기능 로그 추가
  if (!appointmentId) {
    console.warn("❌ appointmentId가 없습니다. 참여 버튼 로직 중단");
    return;
  }

  const appointmentRef = doc(db, "appointments", appointmentId);
  const appointmentSnap = await getDoc(appointmentRef);

  if (!appointmentSnap.exists()) {
    console.warn("❌ appointment 문서가 존재하지 않습니다:", appointmentId);
    return;
  }

  const appointmentData = appointmentSnap.data();
  const members = appointmentData.members || [];
  const isCreator = appointmentData.writerEmail === currentUserEmail;
  const isMember = members.includes(appointmentData.members);

  console.log("📌 약속 참여 조건", {
    currentUserEmail,
    writerEmail: appointmentData.writerEmail,
    isCreator,
    isMember,
    members
  });

  if (!isCreator && !isMember) {
    console.log("🟢 참여 신청 버튼 생성");
    const applyBtn = document.createElement("button");
    applyBtn.textContent = "약속 참여 신청";
    applyBtn.className = "btn btn-success";
    applyBtn.style.marginTop = "1rem";

    applyBtn.onclick = async () => {
      await addDoc(collection(db, "messages"), {
        from: currentUserEmail,
        to: appointmentData.writerEmail,
        content: "[참여 신청]",
        groupId: appointmentId,
        appointmentId,
        title,
        timestamp: new Date()
      });

      alert("참여 신청이 전송되었습니다.");
      applyBtn.disabled = true;
      applyBtn.textContent = "신청 완료";
    };

    inboxList.appendChild(applyBtn);
  }

  if (isCreator) {
    const pending = sorted.filter(m => m.content === "[참여 신청]" && !members.includes(m.from));
    console.log("🟠 수락 대기 목록:", pending);

    for (const app of pending) {
      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = `${app.from} 참여 수락`;
      acceptBtn.className = "btn btn-warning";
      acceptBtn.style.marginTop = "1rem";

      acceptBtn.onclick = async () => {
        const updated = [...members, app.from];
        await updateDoc(appointmentRef, { members: updated });

        await addDoc(collection(db, "messages"), {
          from: currentUserEmail,
          to: app.from,
          content: "[참여 수락]",
          groupId: appointmentId,
          appointmentId,
          title,
          timestamp: new Date()
        });

        alert(`${app.from}님의 참여를 수락했습니다.`);
        acceptBtn.disabled = true;
        acceptBtn.textContent = "수락 완료";
      };

      inboxList.appendChild(acceptBtn);
    }
  }
}


async function loadMyPastAppointments() {
  if (!currentUserEmail) return;
  const activityList = document.getElementById("activity-list");
  activityList.innerHTML = "<p>📂 참여한 지난 약속을 불러오는 중...</p>";

  const snapshot = await getDocs(collection(db, "appointments"));
  const now = new Date();
  const container = document.createElement("div");
  let hasPast = false;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const docId = docSnap.id;
    if (!data.members || !Array.isArray(data.members)) return;

    const appointmentTime = data.appointmentTime?.toDate?.();
    if (!appointmentTime || !(appointmentTime instanceof Date)) return;

    const isPast = appointmentTime.getTime() < now.getTime() - 24 * 60 * 60 * 1000;
    const isMember = data.members.includes(currentUserEmail);

    if (isPast && isMember) {
      hasPast = true;

      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.borderRadius = "10px";
      card.style.padding = "1rem";
      card.style.marginBottom = "1rem";
      card.style.cursor = "pointer";
      card.style.background = "#f9f9f9";

      const title = document.createElement("h4");
      title.textContent = data.title || "(제목 없음)";
      card.appendChild(title);

      const time = document.createElement("p");
      time.textContent = `약속시간: ${appointmentTime.toLocaleString()}`;
      card.appendChild(time);

      const detail = document.createElement("div");
      detail.style.display = "none";
      detail.innerHTML = `
        <p>장소: ${data.place || '알 수 없음'}</p>
        <button class="btn btn-primary review-btn">후기 쓰기</button>
      `;
      card.appendChild(detail);

      card.addEventListener("click", () => {
        detail.style.display = detail.style.display === "none" ? "block" : "none";
      });

      const reviewBtn = detail.querySelector(".review-btn");
      reviewBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // 카드 이벤트 전파 방지
        openReviewModal(docId, data);
      });

      container.appendChild(card);
    }
  });

  activityList.innerHTML = "";
  activityList.appendChild(container);
  if (!hasPast) {
    activityList.innerHTML = "<p>🕓 지난 24시간 이내에 종료된 약속이 없습니다.</p>";
  }
}


closeInboxBtn.addEventListener("click", () => {
  inboxModal.style.display = "none";
});

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2 - lat1) * Math.PI/180;
  const Δλ = (lng2 - lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

async function loadAppointments(userLat, userLng) {
  console.log("🔥 사용자 현재 위치:", userLat, userLng); // 위치 로그

  const snapshot = await getDocs(collection(db, "appointments"));
  const lastoneContainer = document.getElementById("lastone-cards");
  const nearpromContainer = document.getElementById("nearprom-cards");

  if (!lastoneContainer || !nearpromContainer) {
    console.error("❌ 약속 카드 컨테이너가 HTML에 존재하지 않음. id를 확인하세요.");
    return;
  }

  lastoneContainer.innerHTML = "";
  nearpromContainer.innerHTML = "";

  let shownCount = 0;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    console.log("📄 약속 문서 데이터:", data);

    // 필드 유효성 체크
    if (
      typeof data.lat !== "number" || typeof data.lng !== "number" ||
      typeof data.maxPeople !== "number" || typeof data.currentPeople !== "number"
    ) {
      console.warn("⚠️ 필수 필드 누락 또는 타입 오류:", docSnap.id, data);
      return; // skip
    }

    const distance = getDistance(userLat, userLng, data.lat, data.lng);
    console.log(`📏 ${data.title} 거리: ${distance.toFixed(0)}m`);

    if (isNaN(distance)) {
      console.warn("⚠️ 거리 계산 오류 (NaN):", data);
      return;
    }

    if (distance <= 3000) {
      const left = data.maxPeople - data.currentPeople;
      const card = document.createElement("div");
      card.className = "match-card";
      card.innerHTML = `
        <h3>🔥 ${data.title}</h3>
        <p>${data.place}</p>
        <p>${left}명 남은 약속</p>
      `;

      if (left === 1) {
        lastoneContainer.appendChild(card);
      }
      nearpromContainer.appendChild(card.cloneNode(true));
      shownCount++;
    }
  });

  if (shownCount === 0) {
    nearpromContainer.innerHTML = "<p>📭 근처 3km 이내 약속이 없습니다.</p>";
  }
}


window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        loadAppointments(lat, lng);
      },
      err => {
        console.warn("위치 정보를 가져올 수 없음. 기본 위도로 대체");
        loadAppointments(36.1373918, 128.3971489);
      }
    );
  } else {
    alert("브라우저가 위치 정보를 지원하지 않습니다.");
    loadAppointments(36.1373918, 128.3971489);
  }
});
