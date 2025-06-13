// ✅ Firebase 설정
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

const SERVER_URL = 'http://localhost:3000';

let isPersonalEmailVerified = false;
let isSchoolEmailVerified = false;

function updateSubmitButton() {
  document.getElementById('submitBtn').disabled = !isPersonalEmailVerified;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateSchoolEmail(email, schoolDomain) {
  const domain = schoolDomain.toLowerCase().replace(/\s/g, '') + '.ac.kr';
  return email.endsWith(`@${domain}`);
}

async function requestCode(email, type) {
  const res = await fetch(`${SERVER_URL}/send-code`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const result = await res.json();
  if (result.success) {
    alert("인증번호가 발송되었습니다.");
    document.getElementById(`${type}CodeGroup`).style.display = 'block';
  } else {
    alert("이메일 발송 실패: " + result.message);
  }
}

async function verifyCode(email, code, type) {
  const res = await fetch(`${SERVER_URL}/verify-code`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });

  const result = await res.json();
  if (result.success) {
    alert(`${type === 'personal' ? '개인' : '학교'} 이메일 인증 완료!`);
    document.getElementById(`${type}EmailVerified`).textContent = "✔ 인증됨";

    if (type === 'personal') isPersonalEmailVerified = true;
    else isSchoolEmailVerified = true;

    updateSubmitButton();
  } else {
    alert("인증번호가 일치하지 않거나 시간이 초과되었습니다.");
  }
}

// ✅ 이벤트 리스너
document.getElementById('verifyPersonalEmail').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  if (validateEmail(email)) {
    requestCode(email, 'personal');
  } else {
    alert("이메일 형식을 확인해주세요.");
  }
});

document.getElementById('verifySchoolEmail').addEventListener('click', () => {
  const email = document.getElementById('schoolEmail').value;
  const school = document.getElementById('school').value;
  if (validateSchoolEmail(email, school)) {
    requestCode(email, 'school');
  } else {
    alert("학교 이메일 형식을 확인해주세요.");
  }
});

document.getElementById('checkPersonalCode').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const code = document.getElementById('personalCode').value;
  verifyCode(email, code, 'personal');
});

document.getElementById('checkSchoolCode').addEventListener('click', () => {
  const email = document.getElementById('schoolEmail').value;
  const code = document.getElementById('schoolCode').value;
  verifyCode(email, code, 'school');
});

// ✅ 회원가입 제출
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!isPersonalEmailVerified) {
    alert("개인 이메일 인증을 먼저 완료해주세요.");
    return;
  }

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const school = document.getElementById('school').value || null;
  const schoolEmail = document.getElementById('schoolEmail').value || null;
  const password = document.getElementById('password').value;

  try {
    // ✅ 중복 이메일 확인
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      alert("이미 등록된 이메일입니다.");
      return;
    }

    // ✅ Firebase Authentication에 계정 등록
    await createUserWithEmailAndPassword(auth, email, password);

    // ✅ Firestore에 사용자 정보 저장
    await addDoc(usersRef, {
      name,
      email,
      password, // 👈 원하면 삭제하거나 암호화 필요
      school: isSchoolEmailVerified ? school : null,
      schoolEmail: isSchoolEmailVerified ? schoolEmail : null,
      createdAt: serverTimestamp(),
      reliabilityScore: {
        v: isSchoolEmailVerified ? 1 : 0,
        coefficient: 1.0,          // 활동 이력 적을수록 1에 가까움
        matchCount: 0,             // 약속 성립 횟수
        attendCount: 0,            // 실제 참여 횟수
        reviewAvg: null            // 최근 리뷰 평균 점수 (null or 0)
      }
    });

    alert("가입이 완료되었습니다!");

    // 폼 초기화
    document.getElementById('signupForm').reset();
    document.getElementById("personalCodeGroup").style.display = "none";
    document.getElementById("schoolCodeGroup").style.display = "none";
    document.getElementById("personalEmailVerified").textContent = "";
    document.getElementById("schoolEmailVerified").textContent = "";
    isPersonalEmailVerified = false;
    isSchoolEmailVerified = false;
    updateSubmitButton();
  } catch (err) {
    console.error(err);
    alert("가입 중 오류가 발생했습니다.");
  }
});
