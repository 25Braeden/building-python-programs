document.addEventListener('DOMContentLoaded', function() {
    const divider = document.getElementById('divider');
    const lessonContent = document.getElementById('lesson-content');
    const main = document.querySelector('main');
  
    let isDragging = false;
    let lessonRatio = null; // ratio of lessonContent width to main width
  
    divider.addEventListener('mousedown', function(e) {
      isDragging = true;
      document.body.style.cursor = 'col-resize';
    });
  
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      const mainRect = main.getBoundingClientRect();
      let newWidth = e.clientX - mainRect.left;
      const minWidth = 100;
      const maxWidth = mainRect.width - 100;
      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
  
      lessonContent.style.width = newWidth + 'px';
      lessonRatio = newWidth / mainRect.width;
  
      // Update editor layout if available
      if (window.editor) {
        window.editor.layout();
      }
    });
  
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'default';
        if (window.editor) {
          window.editor.layout();
        }
      }
    });
  
    // On window resize, recalculate lesson content width from stored ratio and update editor layout
    window.addEventListener('resize', function() {
      const mainRect = main.getBoundingClientRect();
      if (lessonRatio !== null) {
        const newWidth = mainRect.width * lessonRatio;
        lessonContent.style.width = newWidth + 'px';
      }
      if (window.editor) {
        window.editor.layout();
      }
    });
  });
  