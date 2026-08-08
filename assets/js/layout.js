// Brilliants — Shared Layout Injector (Nav + Footer)
// Odoo-style mega menu navigation. Eliminates HTML duplication across all pages.

(function () {
  'use strict';

  var currentPath = window.location.pathname;

  function dd(id, label) {
    return '<button type="button" class="nav-drop-btn" data-dd="' + id + '" aria-expanded="false" aria-haspopup="true">' + label + '<svg class="nav-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></button>';
  }

  var navHtml =
    '<nav class="nav" role="navigation" aria-label="Main navigation">' +
    '<div class="nav-inner">' +
    '<a href="/" class="nav-brand" aria-label="Brilliants Home">' +
    '<img src="/assets/images/logo/brilliants-logo-full.png" alt="" style="height:32px;width:auto;display:block;">' +
    '<span class="brand-text"><span class="brand-half-1">Bril</span><span class="brand-half-2">liants</span></span></a>' +
    '<div class="nav-links" role="menubar">' +
    '<a href="/" role="menuitem" data-page="/">Home</a>' +

    '<div class="nav-drop" data-pages="/ironbook/ /ai-engine/ /downloads/ /pricing/ /pay/">' +
    dd('products', 'Products') +
    '<div class="nav-panel" data-panel="products">' +
    '<div class="nav-panel-grid">' +
    '<div class="nav-panel-col">' +
    '<a href="/ironbook/"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="gym"></span><span class="np-text"><strong>IronBook</strong><small>AI Gym Operating System</small><em class="np-tag live">Live</em></span></a>' +
    '<a href="/#products"><span class="np-icon" style="background:var(--purple-tint);color:var(--purple);" data-icon="hrms"></span><span class="np-text"><strong>Smart HRMS</strong><small>Payroll &amp; attendance</small><em class="np-tag soon">Early Access</em></span></a>' +
    '<a href="/#products"><span class="np-icon" style="background:var(--amber-tint);color:var(--amber-ink);" data-icon="billing"></span><span class="np-text"><strong>Smart Billing</strong><small>GST billing &amp; inventory</small><em class="np-tag soon">Soon</em></span></a>' +
    '<a href="/#products"><span class="np-icon" style="background:var(--primary-tint);color:var(--primary);" data-icon="factory"></span><span class="np-text"><strong>Smart Factory</strong><small>Industry 4.0 platform</small><em class="np-tag proto">Prototype</em></span></a>' +
    '<a href="/#products"><span class="np-icon" style="background:var(--rose-tint);color:var(--rose);" data-icon="inventory"></span><span class="np-text"><strong>Smart Inventory</strong><small>AI warehouse</small><em class="np-tag roadmap">Roadmap</em></span></a>' +
    '</div>' +
    '<div class="nav-panel-col">' +
    '<a href="/ai-engine/"><span class="np-icon" style="background:var(--ink);color:#fff;" data-icon="ai"></span><span class="np-text"><strong>Brilliants AI Engine</strong><small>One engine powering every product</small></span></a>' +
    '<a href="/downloads/"><span class="np-icon" style="background:var(--surface-2);color:var(--ink);" data-icon="download"></span><span class="np-text"><strong>Download Center</strong><small>APKs, guides &amp; install help</small></span></a>' +
    '<a href="/pricing/"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="rupee"></span><span class="np-text"><strong>Pricing</strong><small>Start free &#183; &#8377;499/mo for all apps</small></span></a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '<div class="nav-drop" data-pages="/industries/">' +
    dd('industries', 'Industries') +
    '<div class="nav-panel" data-panel="industries">' +
    '<div class="nav-panel-grid nav-panel-2col">' +
    '<div class="nav-panel-col">' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="gym"></span><span class="np-text"><strong>Gym &amp; Fitness</strong><small>IronBook — live</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--primary-tint);color:var(--primary);" data-icon="factory"></span><span class="np-text"><strong>Manufacturing</strong><small>Smart Factory</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--amber-tint);color:var(--amber-ink);" data-icon="retail"></span><span class="np-text"><strong>Retail</strong><small>Smart Billing + Inventory</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--purple-tint);color:var(--purple);" data-icon="healthcare"></span><span class="np-text"><strong>Pharma</strong><small>Compliance &amp; monitoring</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--rose-tint);color:var(--rose);" data-icon="healthcare"></span><span class="np-text"><strong>Healthcare</strong><small>Clinics &amp; diagnostics</small></span></a>' +
    '</div>' +
    '<div class="nav-panel-col">' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="warehouse"></span><span class="np-text"><strong>Warehousing</strong><small>Smart Inventory</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--primary-tint);color:var(--primary);" data-icon="education"></span><span class="np-text"><strong>Education</strong><small>Schools &amp; institutes</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--amber-tint);color:var(--amber-ink);" data-icon="office"></span><span class="np-text"><strong>Offices &amp; Coworking</strong><small>Smart HRMS</small></span></a>' +
    '<a href="/industries/"><span class="np-icon" style="background:var(--ink);color:#fff;" data-icon="dashboard"></span><span class="np-text"><strong>Every MSME</strong><small>One AI platform</small></span></a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '<div class="nav-drop" data-pages="/technology/ /vision/ /stories/ /ai-engine/">' +
    dd('resources', 'Resources') +
    '<div class="nav-panel" data-panel="resources">' +
    '<div class="nav-panel-grid nav-panel-2col">' +
    '<div class="nav-panel-col">' +
    '<a href="/technology/"><span class="np-icon" style="background:var(--primary-tint);color:var(--primary);" data-icon="settings"></span><span class="np-text"><strong>Technology</strong><small>Stack, security &amp; infra</small></span></a>' +
    '<a href="/ai-engine/"><span class="np-icon" style="background:var(--purple-tint);color:var(--purple);" data-icon="ai"></span><span class="np-text"><strong>AI Engine</strong><small>Capabilities &amp; roadmap</small></span></a>' +
    '<a href="/vision/"><span class="np-icon" style="background:var(--amber-tint);color:var(--amber-ink);" data-icon="trending"></span><span class="np-text"><strong>Vision 2030</strong><small>Platform roadmap</small></span></a>' +
    '</div>' +
    '<div class="nav-panel-col">' +
    '<a href="/stories/"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="graph"></span><span class="np-text"><strong>Stories &amp; Blog</strong><small>Case studies &amp; guides</small></span></a>' +
    '<a href="/downloads/"><span class="np-icon" style="background:var(--rose-tint);color:var(--rose);" data-icon="download"></span><span class="np-text"><strong>Downloads</strong><small>APKs &amp; install guides</small></span></a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '<div class="nav-drop" data-pages="/privacy/ /terms/ /refund-policy/ /grievance-redressal/">' +
    dd('company', 'Company') +
    '<div class="nav-panel" data-panel="company">' +
    '<div class="nav-panel-grid nav-panel-2col">' +
    '<div class="nav-panel-col">' +
    '<a href="/#founder"><span class="np-icon" style="background:var(--primary-tint);color:var(--primary);" data-icon="users"></span><span class="np-text"><strong>About Us</strong><small>Founder &amp; mission</small></span></a>' +
    '<a href="/#contact-form"><span class="np-icon" style="background:var(--green-tint);color:var(--green);" data-icon="phone"></span><span class="np-text"><strong>Contact</strong><small>Talk to our team</small></span></a>' +
    '<a href="/pricing/"><span class="np-icon" style="background:var(--amber-tint);color:var(--amber-ink);" data-icon="rupee"></span><span class="np-text"><strong>Pricing</strong><small>Free to start</small></span></a>' +
    '</div>' +
    '<div class="nav-panel-col">' +
    '<a href="/privacy/"><span class="np-icon" style="background:var(--surface-2);color:var(--ink);" data-icon="lock"></span><span class="np-text"><strong>Privacy Policy</strong><small>How we protect data</small></span></a>' +
    '<a href="/terms/"><span class="np-icon" style="background:var(--surface-2);color:var(--ink);" data-icon="check"></span><span class="np-text"><strong>Terms of Service</strong><small>Usage terms</small></span></a>' +
    '<a href="/refund-policy/"><span class="np-icon" style="background:var(--surface-2);color:var(--ink);" data-icon="refresh"></span><span class="np-text"><strong>Refund Policy</strong><small>Money-back terms</small></span></a>' +
    '<a href="/grievance-redressal/"><span class="np-icon" style="background:var(--surface-2);color:var(--ink);" data-icon="bell"></span><span class="np-text"><strong>Grievance Redressal</strong><small>File a complaint</small></span></a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +

    '</div>' +
    '<div class="nav-cta">' +
    '<a href="/pricing/" class="btn btn-ghost btn-sm">Pricing</a>' +
    '<a href="/#contact-form" class="btn btn-primary btn-sm">Discuss Your Business Problem</a>' +
    '<button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">' +
    '<span></span><span></span><span></span></button>' +
    '</div></div></nav>';

  var footerHtml =
    '<footer class="footer" role="contentinfo">' +
    '<div class="container">' +
    '<div class="footer-col footer-about">' +
    '<a href="/" class="footer-brand" aria-label="Brilliants Home">' +
    '<img src="/assets/images/logo/brilliants-logo-full.png" alt="" style="height:28px;width:auto;display:block;">' +
    '<span class="brand-text"><span class="brand-half-1">Bril</span><span class="brand-half-2">liants</span></span></a>' +
    '<p>India\'s AI Operating System for MSMEs — one platform with AI, analytics, automation, IoT, computer vision and business intelligence.</p>' +
    '<div class="footer-contact">' +
    '<span>+91-9146121280</span>' +
    '<a href="mailto:contact@brilliants.in">contact@brilliants.in</a>' +
    '</div>' +
    '<div class="footer-social">' +
    '<a href="https://www.linkedin.com/in/vikas-kamble-2603b6120" aria-label="LinkedIn" target="_blank" rel="noopener">in</a>' +
    '<a href="https://www.instagram.com/brilliants.in" aria-label="Instagram" target="_blank" rel="noopener">ig</a>' +
    '<a href="https://wa.me/919146121280" aria-label="WhatsApp" target="_blank" rel="noopener">wa</a>' +
    '<a href="mailto:contact@brilliants.in" aria-label="Email">&#9993;</a>' +
    '</div></div>' +
    '<div class="footer-col"><h4>Products</h4><ul>' +
    '<li><a href="/ironbook/">IronBook</a></li>' +
    '<li><a href="/#products">Smart HRMS</a></li>' +
    '<li><a href="/#products">Smart Billing</a></li>' +
    '<li><a href="/#products">Smart Factory</a></li>' +
    '<li><a href="/#products">Smart Inventory</a></li>' +
    '<li><a href="/ai-engine/">AI Engine</a></li>' +
    '</ul></div>' +
    '<div class="footer-col"><h4>Company</h4><ul>' +
    '<li><a href="/technology/">Technology</a></li>' +
    '<li><a href="/industries/">Industries</a></li>' +
    '<li><a href="/stories/">Blog / Stories</a></li>' +
    '<li><a href="/vision/">Vision 2030</a></li>' +
    '<li><a href="/pricing/">Pricing</a></li>' +
    '<li><a href="/#contact-form">Contact</a></li>' +
    '</ul></div>' +
    '<div class="footer-col"><h4>Resources &amp; Legal</h4><ul>' +
    '<li><a href="/downloads/">Download Center</a></li>' +
    '<li><a href="/privacy/">Privacy Policy</a></li>' +
    '<li><a href="/terms/">Terms of Service</a></li>' +
    '<li><a href="/refund-policy/">Refund Policy</a></li>' +
    '<li><a href="/grievance-redressal/">Grievance Redressal</a></li>' +
    '</ul></div></div>' +
    '<div class="container footer-bottom">' +
    '<span>&copy; ' + new Date().getFullYear() + ' Brilliants. All rights reserved.</span>' +
    '<span>Made in India &middot; for every MSME.</span>' +
    '</div></footer>';

  // Paint data-icon spans injected after icons.min.js has already run.
  function paintIcons(scope) {
    if (!window.BRILLIANTS_ICONS) return;
    scope.querySelectorAll('[data-icon]').forEach(function (el) {
      var svg = window.BRILLIANTS_ICONS[el.getAttribute('data-icon')];
      if (!svg) return;
      var size = el.getAttribute('data-size') || '24';
      svg = svg.replace(/width="\d+"/, 'width="' + size + '"').replace(/height="\d+"/, 'height="' + size + '"');
      var color = el.getAttribute('data-color');
      if (color) svg = svg.replace('currentColor', color);
      el.innerHTML = svg;
    });
  }

  function inject() {
    // Nav
    var navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
      navPlaceholder.outerHTML = navHtml;
      paintIcons(document);

      // Mark active page
      document.querySelectorAll('.nav-links a[data-page], .nav-drop').forEach(function (el) {
        if (el.tagName === 'A' && el.getAttribute('data-page') === currentPath) {
          el.classList.add('active');
        } else if (el.classList.contains('nav-drop')) {
          var pages = (el.getAttribute('data-pages') || '').split(' ').filter(Boolean);
          pages.forEach(function (p) {
            if (p.indexOf('/') === 0 && (currentPath === p || currentPath.indexOf(p) === 0)) {
              el.classList.add('active');
            }
          });
        }
      });

      // Dropdowns: click toggles open (mobile) — desktop also opens on hover via CSS
      var ddButtons = document.querySelectorAll('.nav-drop-btn');
      ddButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          var drop = btn.closest('.nav-drop');
          var isOpen = drop.classList.contains('open');
          document.querySelectorAll('.nav-drop.open').forEach(function (d) { d.classList.remove('open'); });
          if (!isOpen) drop.classList.add('open');
          btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });
      });

      // Mobile toggle
      var toggle = document.querySelector('.nav-toggle');
      var navLinks = document.querySelector('.nav-links');
      if (toggle && navLinks) {
        toggle.addEventListener('click', function () {
          var open = navLinks.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        navLinks.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function () {
            navLinks.classList.remove('open');
            document.querySelectorAll('.nav-drop.open').forEach(function (d) {
              d.classList.remove('open');
              d.querySelector('.nav-drop-btn').setAttribute('aria-expanded', 'false');
            });
            toggle.setAttribute('aria-expanded', 'false');
          });
        });
      }
    }

    // Footer
    var footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHtml;
      paintIcons(document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
