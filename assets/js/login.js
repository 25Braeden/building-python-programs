// assets/js/login.js
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
  } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
  import { app } from "./firebase-init.js";
  
  const auth = getAuth(app);
  
  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user.email);
      // Redirect to the main page (adjust path as needed)
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error signing in:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  });
  
  document.getElementById("signup-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user.email);
      // Redirect after successful signup
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error signing up:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  });
  
  document.getElementById("google-signin-btn").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google sign in successful:", result.user.email);
      // Redirect after successful Google sign-in
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error with Google sign in:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  });
  