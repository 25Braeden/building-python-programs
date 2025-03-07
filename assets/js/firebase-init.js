import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIZWUaCeg3jy9pOp9oj_twlcxvBg2Gf8E",
  authDomain: "building-python-programs.firebaseapp.com",
  projectId: "building-python-programs",
  storageBucket: "building-python-programs.firebasestorage.app",
  messagingSenderId: "355834343302",
  appId: "1:355834343302:web:8d456ca4eec831410bc607",
  measurementId: "G-TZ264KD7JY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export { app };
console.log("Firebase has been initialized.");
