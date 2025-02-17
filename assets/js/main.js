document.addEventListener('DOMContentLoaded', function() {
    // ===== Theme Functionality =====
    const themeToggle = document.querySelector('.theme-toggle');
    
    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
    
    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    
    // ===== Sidebar Toggle =====
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    function toggleSidebar() {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
    }
    
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
    }
  });
  