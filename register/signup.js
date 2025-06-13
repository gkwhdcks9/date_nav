// Firebase 설정 및 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOLNru-cYOxhrmxvHgwvdXgj6_3DFO_Hs",
  authDomain: "datenav-4aba2.firebaseapp.com",
  projectId: "datenav-4aba2",
  storageBucket: "datenav-4aba2.firebasestorage.app",
  messagingSenderId: "497188807582",
  appId: "1:497188807582:web:472486a3775616d8bc2c8f",
  measurementId: "G-XZWDMYY8Z1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

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

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!isPersonalEmailVerified) {
    alert("개인 이메일 인증을 먼저 완료해주세요.");
    return;
  }

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const school = document.getElementById('school').value || null;
  const schoolEmail = document.getElementById('schoolEmail').value || null;

  try {
    // ✅ 이메일 중복 확인
    const userQuery = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      alert("이미 등록된 이메일입니다. 로그인 또는 다른 이메일을 사용해주세요.");
      return;
    }

    // ✅ 새로운 사용자 등록
    await addDoc(collection(db, "users"), {
      name,
      email,
      password,
      school: isSchoolEmailVerified ? school : null,
      schoolEmail: isSchoolEmailVerified ? schoolEmail : null,
      createdAt: serverTimestamp()
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
