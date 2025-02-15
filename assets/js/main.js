document.addEventListener('DOMContentLoaded', function() {
  // Initialize sidebar state
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '☰';
  document.body.appendChild(toggleButton);

  // Set initial active state
  function setActiveLink() {
      const currentPath = window.location.pathname;
      document.querySelectorAll('#sidebar a').forEach(link => {
          const linkPath = new URL(link.href).pathname;
          link.classList.toggle('active', linkPath === currentPath);
      });
  }

  // Improved navigation handler
  async function handleNavigation(e) {
      e.preventDefault();
      const target = e.target.closest('a');
      if (!target) return;

      try {
          // Resolve absolute URL
          const url = new URL(target.href);
          const response = await fetch(url);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Update content
          document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          window.history.pushState({}, '', url.pathname);

          // Update active state
          setActiveLink();
      } catch (error) {
          console.error('Navigation failed:', error);
          window.location.href = target.href; // Fallback
      }
  }

  // Toggle sidebar
  function toggleSidebar() {
      document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
  }

  // Event listeners
  toggleButton.addEventListener('click', toggleSidebar);
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

  // Initial setup
  setActiveLink();
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
  }

  // Handle navigation buttons
  document.addEventListener('click', function(e) {
      const target = e.target.closest('.prev-button, .next-button');
      if (!target) return;
      e.preventDefault();
      handleNavigation(e);
  });
});