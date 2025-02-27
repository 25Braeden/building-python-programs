document.addEventListener("DOMContentLoaded", function () {
  const divider = document.getElementById("divider");
  const lessonContent = document.getElementById("lesson-content");
  const codeArea = document.getElementById("code-area");
  const main = document.querySelector("main");

  let isDragging = false;
  let lessonRatio = null; // Store the ratio for responsive resizing

  divider.addEventListener("mousedown", function () {
    isDragging = true;
    document.body.style.cursor = "col-resize";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    const mainRect = main.getBoundingClientRect();
    let newWidth = e.clientX - mainRect.left;
    const minWidth = 150;
    const maxWidth = mainRect.width - 200;

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    lessonContent.style.flex = `0 0 ${newWidth}px`; // Fix lesson-content width
    lessonRatio = newWidth / mainRect.width;

    // Call layout only if the editor exists and layout() is available
    if (window.editor && typeof window.editor.layout === "function") {
      window.editor.layout();
    }
  });

  document.addEventListener("mouseup", function () {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = "default";
      if (window.editor && typeof window.editor.layout === "function") {
        window.editor.layout();
      }
    }
  });

  // ResizeObserver to adjust the editor when codeArea resizes
  const resizeObserver = new ResizeObserver(() => {
    if (window.editor && typeof window.editor.layout === "function") {
      window.editor.layout();
    }
  });

  resizeObserver.observe(codeArea);
});
