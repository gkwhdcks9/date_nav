// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// ✅ Firebase 설정 (register에서 사용한 설정과 동일하게 유지)
const firebaseConfig = {
  apiKey: "AIzaSyD_zx2hIAQRtFPenTNLyQAKdKa9IrOrJHQ",
  authDomain: "datenavtest.firebaseapp.com",
  projectId: "datenavtest",
  storageBucket: "datenavtest.firebasestorage.app",
  messagingSenderId: "204321530388",
  appId: "1:204321530388:web:a28ebc54468633bd62fd01",
  measurementId: "G-JVYWG6T6PJ"
};

// ✅ Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ 로그인 폼 이벤트
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("로그인 성공!");
    // 원하는 페이지로 리디렉션
    window.location.href = "../home/index.html"; // 또는 home.html 등 원하는 페이지로 변경
  } catch (error) {
    console.error(error.code, error.message);

    // 사용자 친화적인 메시지 처리
    switch (error.code) {
      case "auth/user-not-found":
        errorMsg.textContent = "등록되지 않은 이메일입니다.";
        break;
      case "auth/wrong-password":
        errorMsg.textContent = "비밀번호가 일치하지 않습니다.";
        break;
      case "auth/invalid-email":
        errorMsg.textContent = "이메일 형식이 올바르지 않습니다.";
        break;
      default:
        errorMsg.textContent = "로그인 중 오류가 발생했습니다.";
    }
  }
});
