import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyBvU2bIQsg7LoWkDfjTpMHU-WTrEBalMuw",
      authDomain: "financial-summer-project.firebaseapp.com",
      projectId: "financial-summer-project",
      storageBucket: "financial-summer-project.firebasestorage.app",
      messagingSenderId: "502346293460",
      appId: "1:502346293460:web:379e8369eddfd47ce51b41",
      measurementId: "G-9C8T2LGM4Q"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "login.html"; // redirect if not logged in
      } else {
        document.getElementById("userEmail").innerText = "Welcome, " + user.email;
      }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      });
    });
    // Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Logout Error:", error);
        });
    });
