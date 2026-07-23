// Live Sourcing — shared behavior across all pages
document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle — keyboard and pointer accessible
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? 'Close ✕' : 'Menu ☰';
    });
    // Close menu on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu ☰';
        toggle.focus();
      }
    });
  }

  // Mark current page link
  var links = document.querySelectorAll('.primary-nav__link');
  var path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === path) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // Enquiry form: lightweight client-side validation demonstrating
  // default / focus-visible / error / loading states
  var form = document.querySelector('.enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        if (!input.value.trim()) {
          field.classList.add('has-error');
          valid = false;
        } else {
          field.classList.remove('has-error');
        }
      });
      if (!valid) {
        var firstError = form.querySelector('.has-error input, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      var successEl = form.querySelector('.form-success');
      btn.classList.add('btn--loading');
      btn.setAttribute('aria-disabled', 'true');
      setTimeout(function () {
        btn.classList.remove('btn--loading');
        btn.removeAttribute('aria-disabled');
        form.reset();
        if (successEl) {
          successEl.hidden = false;
          successEl.focus();
        }
      }, 900);
    });
  }
});
