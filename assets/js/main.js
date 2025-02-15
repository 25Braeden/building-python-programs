document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle functionality
  const sidebar = document.getElementById('sidebar');
  const toggleButton = document.createElement('button');
  toggleButton.className = 'sidebar-toggle';
  toggleButton.innerHTML = '☰';
  toggleButton.setAttribute('aria-label', 'Toggle navigation');
  document.body.appendChild(toggleButton);

  // Toggle sidebar
  function toggleSidebar() {
      document.body.classList.toggle('sidebar-collapsed');
      // Save state
      localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
  }

  toggleButton.addEventListener('click', toggleSidebar);

  // Restore sidebar state
  if (localStorage.getItem('sidebarCollapsed') === 'true') {
      document.body.classList.add('sidebar-collapsed');
  }

  // Handle navigation
  document.querySelectorAll('#sidebar a').forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          // Update active state
          document.querySelectorAll('#sidebar a').forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          // Load content
          fetch(this.href)
              .then(response => response.text())
              .then(html => {
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(html, 'text/html');
                  document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
                  window.history.pushState({}, '', this.href);
              });
      });
  });

  // Handle browser navigation
  window.addEventListener('popstate', () => {
      fetch(window.location.href)
          .then(response => response.text())
          .then(html => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
          });
  });
});