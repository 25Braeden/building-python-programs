// assets/js/main.js
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { app } from "./firebase-init.js";

const auth = getAuth(app);

/**
 * Computes the relative path to the login page.
 * If the current page is inside the "/units/" folder, then go up one level.
 * Otherwise, assume the login page is in "assets/login.html".
 */
function getLoginPagePath() {
  const path = location.pathname;
  if (path.includes("/units/")) {
    return "../assets/login.html";
  } else {
    return "assets/login.html";
  }
}

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // ===== Authentication Check =====
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // User is not logged in; redirect to login page
      window.location.href = getLoginPagePath();
    } else if (!user.emailVerified) {
      // Instead of an alert, display an in-page overlay message
      displayEmailVerificationMessage(user);
    } else {
      console.log("User is logged in:", user.email);
      // Continue with protected page logic...
    }
  });

  // ===== Theme Functionality =====
  const themeToggle = document.querySelector(".theme-toggle");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  setTheme(savedTheme);

  // ===== Sidebar Toggle =====
  function toggleSidebar() {
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "sidebarCollapsed",
      document.body.classList.contains("sidebar-collapsed")
    );
    // Dynamically update the position of the buttons
    updateButtonPositions();
  }

  sidebarToggle.addEventListener("click", toggleSidebar);

  if (localStorage.getItem("sidebarCollapsed") === "true") {
    document.body.classList.add("sidebar-collapsed");
  }

  // Function to adjust button positions dynamically
  function updateButtonPositions() {
    const sidebarWidth = document.body.classList.contains("sidebar-collapsed")
      ? getComputedStyle(document.documentElement).getPropertyValue("--collapsed-sidebar-width")
      : getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width");
    sidebarToggle.style.left = `calc(${sidebarWidth} + 10px)`;
    themeToggle.style.left = `calc(${sidebarWidth} + var(--toggle-spacing))`;
  }

  // Initial button positioning
  updateButtonPositions();

  // ===== Hide Scrollbar Until Scrolling for Lesson Content =====
  const lessonContent = document.getElementById("lesson-content");
  if (lessonContent) {
    let hideScrollbarTimeout;
    lessonContent.addEventListener("scroll", () => {
      lessonContent.classList.add("scrolling");
      clearTimeout(hideScrollbarTimeout);
      // Remove the .scrolling class after 1 second of no scrolling
      hideScrollbarTimeout = setTimeout(() => {
        lessonContent.classList.remove("scrolling");
      }, 1000);
    });
  }
});

/**
 * Displays an in-page overlay message prompting the user to verify their email.
 * Includes options to resend the verification email and to refresh the page.
 */
function displayEmailVerificationMessage(user) {
  // Create an overlay container
  const overlay = document.createElement("div");
  overlay.className = "email-verification-message";
  overlay.innerHTML = `
    <div class="verification-content">
      <h2>Email Verification Required</h2>
      <p>Your email address (${user.email}) has not been verified yet.</p>
      <p>Please check your inbox for the verification email and click the link provided.</p>
      <div class="verification-buttons">
        <button id="resend-btn">Resend Verification Email</button>
        <button id="refresh-btn">I Have Verified My Email</button>
      </div>
    </div>
  `;
  // Optionally, you can clear the page or disable other interactions:
  document.body.innerHTML = "";
  document.body.appendChild(overlay);

  // Add event listener for the Resend button
  document.getElementById("resend-btn").addEventListener("click", async () => {
    try {
      await sendEmailVerification(user);
      const messageParagraph = overlay.querySelector("p");
      messageParagraph.textContent = "Verification email resent. Please check your inbox.";
    } catch (error) {
      console.error("Error resending verification email:", error);
    }
  });

  // Add event listener for the Refresh button
  document.getElementById("refresh-btn").addEventListener("click", () => {
    // Reload the page to re-run the authentication check
    window.location.reload();
  });
}
