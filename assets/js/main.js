document.addEventListener("DOMContentLoaded", function () {
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
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  setTheme(savedTheme);

  // ===== Sidebar Toggle =====
  function toggleSidebar() {
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(
      "sidebarCollapsed",
      document.body.classList.contains("sidebar-collapsed"),
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
      ? getComputedStyle(document.documentElement).getPropertyValue(
          "--collapsed-sidebar-width",
        )
      : getComputedStyle(document.documentElement).getPropertyValue(
          "--sidebar-width",
        );

    sidebarToggle.style.left = `calc(${sidebarWidth} + 10px)`;
    themeToggle.style.left = `calc(${sidebarWidth} + var(--toggle-spacing))`; // Use CSS variable
  }

  // Initial button positioning
  updateButtonPositions();
});
