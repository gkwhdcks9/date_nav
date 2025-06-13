// myactivity.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_zx2hIAQRtFPenTNLyQAKdKa9IrOrJHQ",
  authDomain: "datenavtest.firebaseapp.com",
  projectId: "datenavtest",
  storageBucket: "datenavtest.appspot.com",
  messagingSenderId: "204321530388",
  appId: "1:204321530388:web:a28ebc54468633bd62fd01"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserEmail = null;
const pastAppointmentsContainer = document.getElementById("past-appointments");
const reviewModal = document.getElementById("review-modal");
const reviewContent = document.getElementById("review-content");
const reviewClose = document.getElementById("review-close");
const userInfoContainer = document.getElementById("user-info");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserEmail = user.email;
    await loadUserInfo(user.email);
    await loadPastAppointments();
  }
});

async function loadUserInfo(email) {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    userInfoContainer.innerHTML = "<p>사용자 정보를 찾을 수 없습니다.</p>";
    return;
  }

  const user = snapshot.docs[0].data();
  const reliability = user.reliabilityScore || {};
  const V = user.isSchoolEmailVerified ? 1 : 0;
  const gamma = reliability.coefficient ?? 1.0;
  const Ns = reliability.matchCount || 0;
  const Np = reliability.attendCount || 0;
  const Ravg = Number(reliability.reviewAvg ?? 0);

  // 가중치 설정 (w1, w2, w3)
  const w1 = 0.2;
  const w2 = 0.3;
  const w3 = 0.5;

  const rsScore = gamma * V + (1 - gamma) * (w1 * Ns + w2 * Np + w3 * Ravg);
  const meetingTemperature = 36.5 + rsScore;

  userInfoContainer.innerHTML = `
    <p><strong>이름:</strong> ${user.name || "정보 없음"}</p>
    <p><strong>학교:</strong> ${user.school || "정보 없음"}</p>
    <p><strong>Email:</strong> ${user.email}</p>
    <p><strong>학교 Email:</strong> ${user.schoolEmail || "없음"}</p>
    <p><strong>학교 인증:</strong> ${user.isSchoolEmailVerified ? "✅ 인증됨" : "❌ 미인증"}</p>
    <p><strong>만남온도</strong></p>
    <ul>
      <li>matchCount: ${Ns}</li>
      <li>attendCount: ${Np}</li>
      <li>coefficient (γ): ${gamma.toFixed(2)}</li>
      <li>reviewAvg: ${isNaN(Ravg) ? "0.00" : Ravg.toFixed(2)}</li>
      <li><strong>만남 온도: ${meetingTemperature.toFixed(2)}℃</strong></li>
    </ul>
    ${!user.isSchoolEmailVerified ? '<button class="btn btn-warning" id="verify-btn">학교 이메일 인증하기</button>' : ""}
  `;

  if (!user.isSchoolEmailVerified) {
    document.getElementById("verify-btn").addEventListener("click", () => {
      alert("학교 이메일 인증 절차는 별도로 구현 필요합니다.");
    });
  }
}

async function loadPastAppointments() {
  const snapshot = await getDocs(collection(db, "appointments"));
  const now = new Date();
  pastAppointmentsContainer.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const appointmentTime = data.appointmentTime?.toDate?.();
    if (!appointmentTime || !(appointmentTime instanceof Date)) return;

    const isPast = appointmentTime.getTime() < now.getTime() - 24 * 60 * 60 * 1000;
    const isMember = data.members?.includes(currentUserEmail);
    const alreadyReviewed = Array.isArray(data.reviewers) && data.reviewers.includes(currentUserEmail);

    if (isPast && isMember) {
      const card = document.createElement("div");
      card.className = "appointment-card";

      card.innerHTML = `
        <div class="appointment-title">${data.title}</div>
        <p>약속 시간: ${appointmentTime.toLocaleString()}</p>
        <p>장소: ${data.place || '정보 없음'}</p>
        ${alreadyReviewed ? '<p style="color:green; font-weight:bold;">✅ 후기 작성 완료</p>' : '<button class="btn btn-primary">구성원 보기</button>'}
      `;

      if (!alreadyReviewed) {
        const memberBtn = card.querySelector(".btn");
        memberBtn.onclick = () => showMembers(data, docSnap.id);
      }

      pastAppointmentsContainer.appendChild(card);
    }
  });
}

function showMembers(data, appointmentId) {
  reviewContent.innerHTML = `<h3>📋 구성원 후기 작성 (${data.title})</h3>`;

  const members = data.members.filter(email => email !== currentUserEmail);
  members.forEach(email => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "1rem";
    div.style.margin = "10px 0";
    div.style.borderRadius = "8px";
    div.innerHTML = `
      <p><strong>${email}</strong></p>
      <button class="btn btn-secondary" data-email="${email}">후기 작성</button>
    `;
    div.querySelector("button").onclick = () => openReviewForm(email, appointmentId);
    reviewContent.appendChild(div);
  });

  reviewModal.style.display = "flex";
}

async function openReviewForm(targetEmail, appointmentId) {
  reviewContent.innerHTML = `<h3>✍️ ${targetEmail} 님에 대한 후기</h3>`;

  const q = query(collection(db, "users"), where("email", "==", targetEmail));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.warn(`존재하지 않는 구성원입니다: ${targetEmail}`);
    alert("존재하지 않는 구성원입니다.");
    return;
  }

  const userRef = snapshot.docs[0].ref;
  const userData = snapshot.docs[0].data();

  const attendCheck = document.createElement("input");
  attendCheck.type = "checkbox";
  attendCheck.checked = true;

  const ratingSelect = document.createElement("select");
  for (let i = 5; i >= 1; i--) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = "⭐".repeat(i) + ` (${i})`;
    ratingSelect.appendChild(opt);
  }

  const comment = document.createElement("textarea");
  comment.placeholder = "코멘트 (선택)";
  comment.rows = 3;
  comment.style.width = "100%";
  comment.style.marginTop = "10px";

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "제출";
  submitBtn.className = "btn btn-success";
  submitBtn.style.marginTop = "10px";
  submitBtn.onclick = async () => {
    const attend = attendCheck.checked;
    const rating = parseInt(ratingSelect.value);
    const review = comment.value.trim();

    const rs = userData.reliabilityScore || {
      v: userData.isSchoolEmailVerified ? 1 : 0,
      coefficient: 1.0,
      matchCount: 0,
      attendCount: 0,
      reviewAvg: 0,
      reviewHistory: []
    };

    rs.matchCount++;
    if (attend) rs.attendCount++;
    rs.coefficient = Math.max(0, rs.coefficient - 0.2);

    rs.reviewHistory = rs.reviewHistory || [];
    rs.reviewHistory.push(rating);
    if (rs.reviewHistory.length > 5) rs.reviewHistory.shift();
    rs.reviewAvg = (
      rs.reviewHistory.reduce((a, b) => a + b, 0) / rs.reviewHistory.length
    );

    await setDoc(userRef, { reliabilityScore: rs }, { merge: true });

    const appointmentRef = doc(db, "appointments", appointmentId);
    const appointmentSnap = await getDoc(appointmentRef);
    if (appointmentSnap.exists()) {
      const currentData = appointmentSnap.data();
      const updatedReviewers = currentData.reviewers || [];
      if (!updatedReviewers.includes(currentUserEmail)) {
        updatedReviewers.push(currentUserEmail);
        await updateDoc(appointmentRef, { reviewers: updatedReviewers });
      }
    }

    alert("후기가 제출되었습니다.");
    reviewModal.style.display = "none";
    loadPastAppointments();
  };

  reviewContent.appendChild(document.createTextNode("참석 여부: "));
  reviewContent.appendChild(attendCheck);
  reviewContent.appendChild(document.createElement("br"));
  reviewContent.appendChild(document.createTextNode("별점: "));
  reviewContent.appendChild(ratingSelect);
  reviewContent.appendChild(comment);
  reviewContent.appendChild(submitBtn);
}

reviewClose.onclick = () => {
  reviewModal.style.display = "none";
};
