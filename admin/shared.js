(function() {
  'use strict';

  /* ====== TOAST ====== */
  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || icons.info) + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
      toast.classList.add('removing');
      setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
  }

  window.showToast = showToast;

  /* ====== MOBILE SIDEBAR ====== */
  function toggleSidebar() {
    var sidebar = document.getElementById('adminSidebar');
    var overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  }

  window.toggleSidebar = toggleSidebar;

  /* ====== COMMON EVENT LISTENERS ====== */
  document.addEventListener('DOMContentLoaded', function() {
    /* Refresh button spinner */
    document.getElementById('refreshBtn').addEventListener('click', function() {
      this.classList.add('spinning');
      var self = this;
      if (typeof window.onRefresh === 'function') window.onRefresh();
      setTimeout(function() { self.classList.remove('spinning'); }, 800);
    });

    /* Logout */
    document.getElementById('logoutBtn').addEventListener('click', function() {
      if (window.SupabaseClient && SupabaseClient.signOut) {
        SupabaseClient.signOut().then(function() {
          window.location.href = '/partner/login/';
        });
      } else {
        window.location.href = '/partner/login/';
      }
    });

    /* Mobile sidebar toggle */
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', toggleSidebar);

    /* Escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(function(m) {
          m.classList.remove('active');
        });
        var sidebar = document.getElementById('adminSidebar');
        var overlay = document.getElementById('sidebarOverlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
    });

    /* Search & filter debounced */
    var searchInput = document.getElementById('searchInput');
    var statusFilter = document.getElementById('statusFilter');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        if (typeof window.applyFilters === 'function') window.applyFilters();
      });
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', function() {
        if (typeof window.applyFilters === 'function') window.applyFilters();
      });
    }
  });

})();
