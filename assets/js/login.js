// assets/js/login.js
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification
  } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
  import { app } from "./firebase-init.js";
  
  const auth = getAuth(app);
  
  document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user.email);
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
      const user = userCredential.user;
      console.log("User signed up:", user.email);
      // Send a verification email to the newly created account
      await sendEmailVerification(user);
      // Display the in-page overlay for email verification
      displayVerificationOverlay(user);
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
      window.location.href = "../index.html";
    } catch (error) {
      console.error("Error with Google sign in:", error);
      document.getElementById("error-message").textContent = error.message;
    }
  });
  
  /**
   * Creates and displays an in-page overlay prompting the user to verify their email.
   * Provides options to resend the verification email or refresh the page to check verification status.
   */
  function displayVerificationOverlay(user) {
    const overlay = document.createElement("div");
    overlay.className = "email-verification-message";
    overlay.innerHTML = `
      <div class="verification-content">
        <h2>Verify Your Email</h2>
        <p>A verification email has been sent to <strong>${user.email}</strong>.</p>
        <p>Please check your inbox and click the verification link to activate your account.</p>
        <div class="verification-buttons">
          <button id="resend-btn">Resend Email</button>
          <button id="refresh-btn">I Have Verified My Email</button>
        </div>
      </div>
    `;
    // Replace the page content with the overlay
    document.body.innerHTML = "";
    document.body.appendChild(overlay);
  
    // Resend verification email
    document.getElementById("resend-btn").addEventListener("click", async () => {
      try {
        await sendEmailVerification(user);
        overlay.querySelector("p").textContent = "Verification email resent. Please check your inbox.";
      } catch (error) {
        console.error("Error resending verification email:", error);
      }
    });
  
    // Refresh and check email verification status
    document.getElementById("refresh-btn").addEventListener("click", async () => {
      try {
        await user.reload();
        if (user.emailVerified) {
          // If email is verified, redirect to the main page
          window.location.href = "../index.html";
        } else {
          // Otherwise, update the message to indicate the email is still not verified
          overlay.querySelector("p").textContent = "Your email is still not verified. Please check your inbox.";
        }
      } catch (error) {
        console.error("Error reloading user:", error);
      }
    });
  }
  