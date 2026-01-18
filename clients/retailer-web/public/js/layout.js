document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleBtn");
  const userArea = document.getElementById("userMenu");
  const userDropdown = document.querySelector(".user-dropdown");


  /* ========== TOGGLE SIDEBAR ========== */
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("collapsed");
    });
  }

  /* ========== USER MENU ========== */
  if (userArea && userDropdown) {
    userArea.addEventListener("click", (e) => {
  e.stopPropagation();
  userArea.classList.toggle("open");
});

    // ✅ THÊM CHẶN CLICK TRONG DROPDOWN
  userDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

    document.addEventListener("click", () => {
      userArea.classList.remove("open");
    });
  }

  /* ========== TOOLTIP ICON ========== */
  const menuItems = document.querySelectorAll(".sidebar-item");

  menuItems.forEach(item => {
    item.addEventListener("mouseenter", () => {
      if (sidebar.classList.contains("collapsed")) {
        item.classList.add("show-tooltip");
      }
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("show-tooltip");
    });
  });
});
/* QR POPUP */
  function openQr(id) {
  const overlay = document.getElementById("qrOverlay");
  if (overlay) overlay.classList.add("show");
}

function closeQr() {    
  const overlay = document.getElementById("qrOverlay");
  if (overlay) overlay.classList.remove("show");
}