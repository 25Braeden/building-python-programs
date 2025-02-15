document.addEventListener('DOMContentLoaded', function() {
  // Dynamic content sizing
  function adjustLayout() {
      const sidebar = document.getElementById('sidebar');
      const mainContent = document.querySelector('main');
      
      // Set minimum widths based on content
      sidebar.style.minWidth = '300px';
      mainContent.style.minWidth = '600px';
  }

  // Responsive font sizing
  function scaleFonts() {
      const baseWidth = 1920; // Reference screen width
      const currentWidth = window.innerWidth;
      const scaleFactor = currentWidth / baseWidth;
      
      document.body.style.fontSize = `${Math.max(1, scaleFactor) * 100}%`;
  }

  // Handle navigation
  function handleNavigation(event) {
      event.preventDefault();
      const target = event.target.closest('a');
      if (!target) return;

      // Update active class
      document.querySelectorAll('.chapters li a').forEach(link => {
          link.classList.remove('active');
      });
      target.classList.add('active');

      // Load content dynamically
      fetch(target.href)
          .then(response => response.text())
          .then(html => {
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, 'text/html');
              document.querySelector('main').innerHTML = doc.querySelector('main').innerHTML;
              window.history.pushState({}, '', target.href);
          });
  }

  // Event listeners
  window.addEventListener('resize', () => {
      adjustLayout();
      scaleFonts();
  });
  
  document.querySelector('#sidebar').addEventListener('click', handleNavigation);

  // Initial setup
  adjustLayout();
  scaleFonts();
  
  // Handle browser navigation (back/forward)
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