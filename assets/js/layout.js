// Brilliants — Shared Layout Injector (Nav + Footer)
// Eliminates HTML duplication across all pages.

(function () {
  'use strict';

  var currentPath = window.location.pathname.split('/').pop() || 'index.html';

  var logoSrc = 'assets/images/logo/brilliants-logo.jpeg';

  var navHtml =
    '<nav class="nav" role="navigation" aria-label="Main navigation">' +
    '<div class="nav-inner">' +
    '<a href="index.html" class="nav-brand" aria-label="Brilliants Home">' +
    '<img src="' + logoSrc + '" alt="Brilliants" style="height:40px;width:auto;">' +
    '<span>Brilliants <span style="font-size:0.7rem;font-weight:500;color:var(--ink-faint);display:block;margin-top:-2px;letter-spacing:0.02em;">Smarter · Better · Stronger</span></span></a>' +
    '<div class="nav-links" role="menubar">' +
    '<a href="index.html" role="menuitem" data-page="index.html">Home</a>' +
    '<a href="industries.html" role="menuitem" data-page="industries.html">Case Studies</a>' +
    '<a href="technology.html" role="menuitem" data-page="technology.html">Technology</a>' +
    '<a href="ai-engine.html" role="menuitem" data-page="ai-engine.html">AI Engine</a>' +
    '<a href="vision.html" role="menuitem" data-page="vision.html">Vision 2030</a>' +
    '<a href="pricing.html" role="menuitem" data-page="pricing.html">Pricing</a>' +
    '<a href="stories.html" role="menuitem" data-page="stories.html">Stories</a>' +
    '<a href="downloads.html" role="menuitem" data-page="downloads.html">Downloads</a>' +
    '</div>' +
    '<div class="nav-cta">' +
    '<a href="pricing.html" class="btn btn-ghost btn-sm">Pricing</a>' +
    '<a href="index.html#contact-form" class="btn btn-primary btn-sm">Book a Demo</a>' +
    '<button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">' +
    '<span></span><span></span><span></span></button>' +
    '</div></div></nav>';

  var footerHtml =
    '<footer class="footer" role="contentinfo">' +
    '<div class="container">' +
    '<div>' +
    '<a href="index.html" class="footer-brand" aria-label="Brilliants Home">' +
    '<img src="' + logoSrc + '" alt="Brilliants" style="height:36px;width:auto;">' +
    '<span style="color:#fff;font-weight:800;font-size:1.15rem;">Brilliants</span></a>' +
    '<p>India\'s AI Operating System for MSMEs — automating operations with AI, analytics, automation, IoT, computer vision and business intelligence.</p>' +
    '<div class="footer-social">' +
    '<a href="https://www.linkedin.com/in/vikas-kamble-2603b6120" aria-label="LinkedIn" target="_blank" rel="noopener">in</a>' +
    '<a href="https://www.instagram.com/brilliants.in" aria-label="Instagram" target="_blank" rel="noopener">ig</a>' +
    '<a href="mailto:contact@brilliants.in" aria-label="Email">&#9993;</a>' +
    '</div></div>' +
    '<div><h4>Products</h4><ul>' +
    '<li><a href="index.html#products">IronBook</a></li>' +
    '<li><a href="index.html#products">Smart HRMS</a></li>' +
    '<li><a href="index.html#products">Smart Billing</a></li>' +
    '<li><a href="index.html#products">Smart Factory</a></li>' +
    '<li><a href="ai-engine.html">Brilliants AI Engine</a></li>' +
    '<li><a href="downloads.html">Download Center</a></li>' +
    '</ul></div>' +
    '<div><h4>Company</h4><ul>' +
    '<li><a href="technology.html">Technology</a></li>' +
    '<li><a href="industries.html">Industries</a></li>' +
    '<li><a href="stories.html">Blog / Stories</a></li>' +
    '<li><a href="vision.html">Vision 2030</a></li>' +
    '<li><a href="index.html#contact-form">Contact</a></li>' +
    '</ul></div>' +
    '<div><h4>Resources</h4><ul>' +
    '<li><a href="downloads.html">Installation Guide</a></li>' +
    '<li><a href="pricing.html">Pricing</a></li>' +
    '<li><a href="#">Privacy Policy</a></li>' +
    '<li><a href="#">Terms of Service</a></li>' +
    '</ul></div></div>' +
    '<div class="container footer-bottom">' +
    '<span>&copy; ' + new Date().getFullYear() + ' Brilliants. All rights reserved.</span>' +
    '<span>Made in India &middot; for every MSME.</span>' +
    '</div></footer>';

  function inject() {
    // Nav
    var navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
      navPlaceholder.outerHTML = navHtml;
      // Mark active page
      var links = document.querySelectorAll('.nav-links a[data-page]');
      links.forEach(function (a) {
        if (a.getAttribute('data-page') === currentPath) {
          a.classList.add('active');
        }
      });
      // Mobile toggle
      var toggle = document.querySelector('.nav-toggle');
      var navLinks = document.querySelector('.nav-links');
      if (toggle && navLinks) {
        toggle.addEventListener('click', function () {
          navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function (a) {
          a.addEventListener('click', function () { navLinks.classList.remove('open'); });
        });
      }
    }

    // Footer
    var footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHtml;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
