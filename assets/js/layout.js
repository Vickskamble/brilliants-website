// Brilliants — Shared Layout Injector (Nav + Footer)
// Eliminates HTML duplication across all pages.

(function () {
  'use strict';

  var currentPath = window.location.pathname;

  var navHtml =
    '<nav class="nav" role="navigation" aria-label="Main navigation">' +
    '<div class="nav-inner">' +
    '<a href="/" class="nav-brand" aria-label="Brilliants Home">' +
    '<img src="/assets/images/logo/brilliants-logo-full.png" alt="" style="height:32px;width:auto;display:block;">' +
    '<span class="brand-text"><span class="brand-half-1">Bril</span><span class="brand-half-2">liants</span></span></a>' +
    '<div class="nav-links" role="menubar">' +
    '<a href="/" role="menuitem" data-page="/">Home</a>' +
    '<a href="/industries/" role="menuitem" data-page="/industries/">Case Studies</a>' +
    '<a href="/technology/" role="menuitem" data-page="/technology/">Technology</a>' +
    '<a href="/ai-engine/" role="menuitem" data-page="/ai-engine/">AI Engine</a>' +
    '<a href="/vision/" role="menuitem" data-page="/vision/">Vision 2030</a>' +
    '<a href="/pricing/" role="menuitem" data-page="/pricing/">Pricing</a>' +
    '<a href="/stories/" role="menuitem" data-page="/stories/">Stories</a>' +
    '<a href="/downloads/" role="menuitem" data-page="/downloads/">Downloads</a>' +
    '</div>' +
    '<div class="nav-cta">' +
    '<a href="/pricing/" class="btn btn-ghost btn-sm">Pricing</a>' +
    '<a href="/#contact-form" class="btn btn-primary btn-sm">Book a Demo</a>' +
    '<button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false">' +
    '<span></span><span></span><span></span></button>' +
    '</div></div></nav>';

  var footerHtml =
    '<footer class="footer" role="contentinfo">' +
    '<div class="container">' +
    '<div>' +
    '<a href="/" class="footer-brand" aria-label="Brilliants Home">' +
    '<img src="/assets/images/logo/brilliants-logo-full.png" alt="" style="height:28px;width:auto;display:block;">' +
    '<span class="brand-text"><span class="brand-half-1">Bril</span><span class="brand-half-2">liants</span></span></a>' +
    '<p>India\'s AI Operating System for MSMEs — automating operations with AI, analytics, automation, IoT, computer vision and business intelligence.</p>' +
    '<div class="footer-social">' +
    '<a href="https://www.linkedin.com/in/vikas-kamble-2603b6120" aria-label="LinkedIn" target="_blank" rel="noopener">in</a>' +
    '<a href="https://www.instagram.com/brilliants.in" aria-label="Instagram" target="_blank" rel="noopener">ig</a>' +
    '<a href="mailto:contact@brilliants.in" aria-label="Email">&#9993;</a>' +
    '</div></div>' +
    '<div><h4>Products</h4><ul>' +
    '<li><a href="/#products">IronBook</a></li>' +
    '<li><a href="/#products">Smart HRMS</a></li>' +
    '<li><a href="/#products">Smart Billing</a></li>' +
    '<li><a href="/#products">Smart Factory</a></li>' +
    '<li><a href="/ai-engine/">Brilliants AI Engine</a></li>' +
    '<li><a href="/downloads/">Download Center</a></li>' +
    '</ul></div>' +
    '<div><h4>Company</h4><ul>' +
    '<li><a href="/technology/">Technology</a></li>' +
    '<li><a href="/industries/">Industries</a></li>' +
    '<li><a href="/stories/">Blog / Stories</a></li>' +
    '<li><a href="/vision/">Vision 2030</a></li>' +
    '<li><a href="/#contact-form">Contact</a></li>' +
    '</ul></div>' +
    '<div><h4>Resources</h4><ul>' +
    '<li><a href="/downloads/">Installation Guide</a></li>' +
    '<li><a href="/pricing/">Pricing</a></li>' +
    '<li><a href="/privacy/">Privacy Policy</a></li>' +
'<li><a href="/terms/">Terms of Service</a></li>' +
'<li><a href="/refund-policy/">Refund Policy</a></li>' +
'<li><a href="/grievance-redressal/">Grievance Redressal</a></li>' +
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
