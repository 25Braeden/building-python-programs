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
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '☰';
  toggleButton.setAttribute('aria-label', 'Toggle navigation');
  document.body.appendChild(toggleButton);

  window.toggleSidebar = function() {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', 
          document.body.classList.contains('sidebar-collapsed'));
  }

  toggleButton.addEventListener('click', toggleSidebar);

  if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
  }

  // ========== Navigation System ==========
  const navigationOrder = [
      'index.html',
      'units/unit-0.html',
      'units/unit-0.html#about-this-book',
      'units/unit-0.html#how-to-use',
      'units/unit-1.html',
      'units/unit-1.html#integers',
      'units/unit-1.html#floats',
      'units/unit-1.html#strings',
      'units/unit-1.html#booleans'
  ];

  function updateNavigation() {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const currentHash = window.location.hash || '';
      const currentPage = `${currentPath}${currentHash}`;
      
      const currentIndex = navigationOrder.findIndex(item => 
          item === currentPage || item === currentPath + currentHash
      );

      const prevButton = document.querySelector('.prev-button');
      const nextButton = document.querySelector('.next-button');

      prevButton.classList.toggle('disabled', currentIndex <= 0);
      nextButton.classList.toggle('disabled', currentIndex >= navigationOrder.length - 1);

      prevButton.href = currentIndex > 0 ? navigationOrder[currentIndex - 1] : '#';
      nextButton.href = currentIndex < navigationOrder.length - 1 ? navigationOrder[currentIndex + 1] : '#';
  }

  function setActiveLink() {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      
      document.querySelectorAll('#sidebar a').forEach(link => {
          const linkUrl = new URL(link.href);
          const isActive = (
              linkUrl.pathname === currentPath &&
              linkUrl.hash === currentHash
          );
          
          link.classList.toggle('active', isActive);
          
          if (isActive && link.closest('.subsections')) {
              link.closest('.chapter').classList.add('active');
          }
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

          document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          window.history.pushState({}, '', url.href);
          
          setActiveLink();
          updateNavigation();
          document.body.classList.remove('sidebar-collapsed');

      } catch (error) {
          console.error('Navigation failed:', error);
          window.location.href = target.href;
      }
  }

  // Event listeners
  document.querySelector('#sidebar').addEventListener('click', handleNavigation);
  
  window.addEventListener('popstate', async () => {
      try {
          const response = await fetch(window.location.href);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          setActiveLink();
          updateNavigation();
      } catch (error) {
          window.location.reload();
      }
  });

  document.addEventListener('click', function(e) {
      const target = e.target.closest('.prev-button, .next-button');
      if (!target || target.classList.contains('disabled')) return;
      e.preventDefault();
      handleNavigation(e);
  });

  // Initial setup
  setActiveLink();
  updateNavigation();
});