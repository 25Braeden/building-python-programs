document.addEventListener('DOMContentLoaded', function() {
  // ========== Theme Functionality ==========
  const themeToggle = document.querySelector('.theme-toggle');
  
  function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
  }

  themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);

  // ========== Sidebar Functionality ==========
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '☰';
  toggleButton.setAttribute('aria-label', 'Toggle navigation');
  document.body.appendChild(toggleButton);

  function toggleSidebar() {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', 
          document.body.classList.contains('sidebar-collapsed'));
  }

  toggleButton.addEventListener('click', toggleSidebar);

  // Restore sidebar state
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
  }

  // ========== Navigation System ==========
  function setActiveLink() {
      const currentPath = window.location.pathname;
      document.querySelectorAll('#sidebar a').forEach(link => {
          const linkPath = new URL(link.href).pathname;
          link.classList.toggle('active', linkPath === currentPath);
      });
  }

  async function handleNavigation(e) {
      e.preventDefault();
      const target = e.target.closest('a');
      if (!target) return;

      try {
          const url = new URL(target.href);
          const response = await fetch(url);
          
          if (!response.ok) throw new Error('Network response was not ok');
          
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Update content
          document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          window.history.pushState({}, '', url.pathname);

          // Update UI states
          setActiveLink();
          document.body.classList.remove('sidebar-collapsed'); // Auto-open sidebar on nav

      } catch (error) {
          console.error('Navigation failed:', error);
          window.location.href = target.href; // Fallback to normal navigation
      }
  }

  // ========== Event Listeners ==========
  document.querySelector('#sidebar').addEventListener('click', handleNavigation);
  
  window.addEventListener('popstate', async () => {
      try {
          const response = await fetch(window.location.href);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          setActiveLink();
      } catch (error) {
          window.location.reload();
      }
  });

  document.addEventListener('click', function(e) {
      const target = e.target.closest('.prev-button, .next-button');
      if (!target) return;
      e.preventDefault();
      handleNavigation(e);
  });

  // ========== Initial Setup ==========
  setActiveLink();
});