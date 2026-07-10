// Brilliants — Enhanced Site Behaviour v2.0
// Premium animations, counters, particles, parallax, and more.

(function () {
  'use strict';

  var doc = document;
  var win = window;

  // ---- Utils ----
  function qs(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || doc).querySelectorAll(sel)); }

  // ---- DOM Ready ----
  doc.addEventListener('DOMContentLoaded', function () {

    // 1. Mobile Nav Toggle
    var toggle = qs('.nav-toggle');
    var navLinks = qs('.nav-links');
    if (toggle && navLinks) {
      toggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
      });
      qsa('a', navLinks).forEach(function (a) {
        a.addEventListener('click', function () { navLinks.classList.remove('open'); });
      });
    }

    // 2. Nav scroll effect
    var nav = qs('.nav');
    if (nav) {
      win.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', win.scrollY > 40);
      }, { passive: true });
    }

    // 3. FAQ accordion
    qsa('.faq-item').forEach(function (item) {
      var q = qs('.faq-q', item);
      var a = qs('.faq-a', item);
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        qsa('.faq-item.open').forEach(function (other) {
          if (other !== item) {
            other.classList.remove('open');
            qs('.faq-a', other).style.maxHeight = null;
          }
        });
        item.classList.toggle('open', !isOpen);
        a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
      });
    });

    // 4. Scroll Reveal
    (function () {
      var revealTypes = ['.reveal', '.reveal-scale', '.reveal-left', '.reveal-right'];
      var els = [];
      revealTypes.forEach(function (sel) {
        els = els.concat(qsa(sel));
      });
      if ('IntersectionObserver' in win && els.length) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        els.forEach(function (el) { io.observe(el); });
      } else {
        els.forEach(function (el) { el.classList.add('in'); });
      }
    })();

    // 5. Active nav link
    (function () {
      var path = win.location.pathname.split('/').pop() || 'index.html';
      qsa('.nav-links a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href === path) a.classList.add('active');
      });
    })();

    // 6. Animated Counters
    (function () {
      var counters = qsa('.count-up');
      if (!counters.length) return;
      if ('IntersectionObserver' in win) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              var target = parseFloat(el.getAttribute('data-target')) || 0;
              var suffix = el.getAttribute('data-suffix') || '';
              var prefix = el.getAttribute('data-prefix') || '';
              var duration = parseInt(el.getAttribute('data-duration')) || 2000;
              var start = performance.now();
              var isFloat = target % 1 !== 0;

              function update(now) {
                var progress = Math.min((now - start) / duration, 1);
                // easeOutExpo
                var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                var current = eased * target;
                if (isFloat) {
                  el.textContent = prefix + current.toFixed(1) + suffix;
                } else {
                  el.textContent = prefix + Math.floor(current) + suffix;
                }
                if (progress < 1) {
                  requestAnimationFrame(update);
                } else {
                  el.textContent = prefix + (isFloat ? target.toFixed(1) : target) + suffix;
                }
              }
              requestAnimationFrame(update);
              io.unobserve(el);
            }
          });
        }, { threshold: 0.5 });
        counters.forEach(function (c) { io.observe(c); });
      } else {
        counters.forEach(function (c) {
          var target = parseFloat(c.getAttribute('data-target')) || 0;
          var suffix = c.getAttribute('data-suffix') || '';
          var prefix = c.getAttribute('data-prefix') || '';
          c.textContent = prefix + target + suffix;
        });
      }
    })();

    // 7. Button Ripple Effect
    (function () {
      qsa('.btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          var rect = btn.getBoundingClientRect();
          var ripple = doc.createElement('span');
          ripple.className = 'ripple';
          var size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
          ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
          btn.appendChild(ripple);
          setTimeout(function () { ripple.remove(); }, 600);
        });
      });
    })();

    // 8. Mouse Follower (light glow)
    (function () {
      var follower = qs('.mouse-follower');
      if (!follower) return;
      var rafId = null;
      var mx = 0, my = 0;
      doc.addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(function () {
            follower.style.transform = 'translate(' + (mx - 150) + 'px, ' + (my - 150) + 'px)';
            rafId = null;
          });
        }
      }, { passive: true });
    })();

    // 9. Sticky Demo Button
    (function () {
      var sticky = qs('.sticky-demo');
      if (!sticky) return;
      var hero = qs('.hero');
      if (!hero) return;
      win.addEventListener('scroll', function () {
        var heroBottom = hero.getBoundingClientRect().bottom;
        sticky.classList.toggle('visible', heroBottom < 0);
      }, { passive: true });
    })();

    // 10. Back to Top
    (function () {
      var btt = qs('.back-to-top');
      if (!btt) return;
      win.addEventListener('scroll', function () {
        btt.classList.toggle('visible', win.scrollY > 600);
      }, { passive: true });
      btt.addEventListener('click', function (e) {
        e.preventDefault();
        win.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();

    // 11. Pricing toggle (monthly/yearly)
    (function () {
      var toggleEl = qs('.pt-switch');
      if (!toggleEl) return;
      var monthlyLabels = qsa('[data-period="monthly"]');
      var yearlyLabels = qsa('[data-period="yearly"]');
      var isYearly = false;

      function updatePricing() {
        monthlyLabels.forEach(function (el) { el.style.display = isYearly ? 'none' : ''; });
        yearlyLabels.forEach(function (el) { el.style.display = isYearly ? '' : 'none'; });
        qsa('.pt-label').forEach(function (l) { l.classList.toggle('active', l.dataset.period === (isYearly ? 'yearly' : 'monthly')); });
        toggleEl.classList.toggle('active', isYearly);
      }

      toggleEl.addEventListener('click', function () {
        isYearly = !isYearly;
        updatePricing();
      });
      updatePricing();
    })();

    // 12. Particle Background (canvas)
    (function () {
      var canvas = qs('#particle-canvas');
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var particles = [];
      var w, h;

      function resize() {
        w = canvas.width = win.innerWidth;
        h = canvas.height = win.innerHeight;
      }
      resize();
      win.addEventListener('resize', resize, { passive: true });

      var count = Math.min(60, Math.floor(w * h / 15000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 0.5,
          o: Math.random() * 0.5 + 0.1
        });
      }

      function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(function (p, i) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(37,99,235,' + p.o + ')';
          ctx.fill();

          // connections
          for (var j = i + 1; j < particles.length; j++) {
            var p2 = particles[j];
            var dx = p.x - p2.x;
            var dy = p.y - p2.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = 'rgba(37,99,235,' + (0.06 * (1 - dist / 120)) + ')';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
        requestAnimationFrame(animate);
      }
      animate();
    })();

    // 13. Connection Lines Canvas (within hero)
    (function () {
      var cCanvas = qs('#connections-canvas');
      if (!cCanvas) return;
      var ctx = cCanvas.getContext('2d');
      var parent = cCanvas.parentElement;
      var cards = qsa('.os-layer', parent);
      var w, h;

      function resize() {
        var rect = parent.getBoundingClientRect();
        w = cCanvas.width = rect.width;
        h = cCanvas.height = rect.height;
      }
      resize();
      win.addEventListener('resize', resize, { passive: true });

      function getCardCenters() {
        var centers = [];
        cards.forEach(function (c) {
          var rect = c.getBoundingClientRect();
          var pRect = parent.getBoundingClientRect();
          centers.push({
            x: rect.left - pRect.left + rect.width / 2,
            y: rect.top - pRect.top + rect.height / 2
          });
        });
        // add core center
        var core = qs('.os-core', parent);
        if (core) {
          var rect = core.getBoundingClientRect();
          var pRect = parent.getBoundingClientRect();
          centers.push({
            x: rect.left - pRect.left + rect.width / 2,
            y: rect.top - pRect.top + rect.height / 2
          });
        }
        return centers;
      }

      function drawConnections() {
        ctx.clearRect(0, 0, w, h);
        var centers = getCardCenters();
        if (centers.length < 2) return;
        // draw lines from each layer to core (last center)
        var core = centers[centers.length - 1];
        for (var i = 0; i < centers.length - 1; i++) {
          var c1 = centers[i];
          ctx.beginPath();
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(core.x, core.y);
          ctx.strokeStyle = 'rgba(37,99,235,0.12)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      drawConnections();
      win.addEventListener('resize', function () {
        resize();
        drawConnections();
      }, { passive: true });

      // Redraw on card hover / re-layout
      var ro = new ResizeObserver(function () { resize(); drawConnections(); });
      ro.observe(parent);
    })();

    // 14. Smooth scroll for anchor links
    (function () {
      qsa('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var target = qs(this.getAttribute('href'));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    })();

    // 15. Contact Form Handler with Validation & UX
    (function () {
      var form = qs('#contact-form form, .lead-form form');
      if (!form) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.innerHTML : '';

      function showError(input, msg) {
        var wrapper = input.closest('.form-group') || input.parentElement;
        var existing = wrapper.querySelector('.form-error');
        if (!existing) {
          var err = doc.createElement('span');
          err.className = 'form-error';
          err.style.cssText = 'color:#F43F5E;font-size:0.8rem;font-weight:500;margin-top:4px;display:block;';
          wrapper.appendChild(err);
          existing = err;
        }
        existing.textContent = msg;
        input.style.borderColor = '#F43F5E';
      }

      function clearError(input) {
        var wrapper = input.closest('.form-group') || input.parentElement;
        var existing = wrapper.querySelector('.form-error');
        if (existing) existing.remove();
        input.style.borderColor = '';
      }

      function clearAllErrors() {
        qsa('.form-error').forEach(function (e) { e.remove(); });
        qsa('.lead-form input, .lead-form select, .lead-form textarea').forEach(function (i) { i.style.borderColor = ''; });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearAllErrors();

        var valid = true;
        var inputs = {
          name: form.querySelector('#name'),
          email: form.querySelector('#email'),
          product: form.querySelector('#product-interest'),
          message: form.querySelector('#message')
        };

        if (inputs.product && (!inputs.product.value || inputs.product.value === '')) {
          showError(inputs.product, 'Please select a product');
          valid = false;
        }
        if (inputs.name && (!inputs.name.value || inputs.name.value.trim() === '')) {
          showError(inputs.name, 'Please enter your name');
          valid = false;
        }
        if (inputs.email && (!inputs.email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email.value))) {
          showError(inputs.email, 'Please enter a valid email address');
          valid = false;
        }

        if (!valid) return;

        // Loading state
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '&#128229; Sending...';
        }

        // Simulate send (in production, replace with fetch/AJAX to a backend)
        setTimeout(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '&#10003; Message Sent!';
            submitBtn.style.background = '#2E8B57';
          }
          form.querySelectorAll('input, select, textarea').forEach(function (el) { el.value = ''; });
          setTimeout(function () {
            if (submitBtn) {
              submitBtn.innerHTML = originalText || '&#128197; Book Free Demo';
              submitBtn.style.background = '';
            }
          }, 3000);
        }, 1500);
      });

      // Clear errors on input
      qsa('.lead-form input, .lead-form select, .lead-form textarea').forEach(function (el) {
        el.addEventListener('input', function () { clearError(el); });
        el.addEventListener('change', function () { clearError(el); });
      });
    })();

    // 16. Scroll Parallax for Hero
    (function () {
      var hero = qs('.hero');
      if (!hero) return;
      var heroBg = qs('.hero-bg', hero);
      if (!heroBg) return;

      win.addEventListener('scroll', function () {
        var scrollY = win.scrollY;
        if (scrollY < win.innerHeight) {
          heroBg.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
          heroBg.style.opacity = 1 - (scrollY / (win.innerHeight * 0.8));
        }
      }, { passive: true });
    })();

    // 17. Hero depth parallax on floating cards
    (function () {
      var cards = qsa('.float-card');
      if (!cards.length) return;

      win.addEventListener('scroll', function () {
        var scrollY = win.scrollY;
        cards.forEach(function (c, i) {
          var speed = 0.05 + (i * 0.02);
          c.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
        });
      }, { passive: true });
    })();

    // 18. Font Display Swap fix
    (function () {
      qsa('link[href*="fonts.googleapis.com"]').forEach(function (link) {
        link.setAttribute('media', 'all');
      });
    })();

    // 19. Dashboard 3D Tilt on mouse move
    (function () {
      var dashboard = qs('.dashboard-mockup');
      if (!dashboard) return;

      dashboard.addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -8;
        var rotateY = ((x - centerX) / centerX) * 8;
        this.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      });

      dashboard.addEventListener('mouseleave', function () {
        this.style.transform = '';
      });
    })();

  }); // DOMContentLoaded

})();
