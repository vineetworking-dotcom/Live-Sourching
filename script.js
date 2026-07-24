(function () {
  'use strict';
  document.documentElement.classList.add('js-enabled');

  document.addEventListener('DOMContentLoaded', function () {
    initNavToggle();
    initActiveLink();
    initHeaderScrollState();
    initScrollReveal();
    initCounters();
    initTabs();
    initProductFilter();
    initAccordion();
    initBackToTop();
    initEnquiryForm();
  });

  /* ---------------------------------------------------------- Mobile nav */
  function initNavToggle() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.primary-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? 'Close ✕' : 'Menu ☰';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu ☰';
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------- Active nav link */
  function initActiveLink() {
    var links = document.querySelectorAll('.primary-nav__link');
    var path = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (link) {
      if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------- Sticky header shadow */
  function initHeaderScrollState() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var toggleState = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    toggleState();
    window.addEventListener('scroll', toggleState, { passive: true });
  }

  /* -------------------------------------------------------- Scroll reveal */
  function initScrollReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = Number(entry.target.getAttribute('data-reveal-delay') || 0);
          setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------ Animated counters */
  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-counter'));
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var duration = 1400;
      var start = null;
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) { el.textContent = target + suffix; return; }
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------- ARIA tabs (products) */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var tabs = Array.prototype.slice.call(group.querySelectorAll('.tabs__tab'));
      var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute('aria-controls')); });

      function select(index, focus) {
        tabs.forEach(function (tab, i) {
          var isSelected = i === index;
          tab.setAttribute('aria-selected', String(isSelected));
          tab.tabIndex = isSelected ? 0 : -1;
          if (panels[i]) panels[i].hidden = !isSelected;
        });
        if (focus) tabs[index].focus();
        var newHash = tabs[index].getAttribute('data-tab-hash');
        if (newHash && history.replaceState) history.replaceState(null, '', '#' + newHash);
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(i, false); });
        tab.addEventListener('keydown', function (e) {
          var newIndex = null;
          if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') newIndex = 0;
          else if (e.key === 'End') newIndex = tabs.length - 1;
          if (newIndex !== null) { e.preventDefault(); select(newIndex, true); }
        });
      });

      var hash = window.location.hash.replace('#', '');
      var matchIndex = tabs.findIndex(function (t) { return t.getAttribute('data-tab-hash') === hash; });
      select(matchIndex >= 0 ? matchIndex : 0, false);
    });
  }

  /* ------------------------------------------------- Live product filter */
  function initProductFilter() {
    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
      var scopeSelector = input.getAttribute('data-filter-input');
      var scope = document.querySelector(scopeSelector);
      if (!scope) return;
      var countEl = document.querySelector(input.getAttribute('data-filter-count') || '');

      var updateCount = function () {
        if (!countEl) return;
        var visible = scope.querySelectorAll('[data-filter-item]:not([hidden])').length;
        countEl.textContent = visible + (visible === 1 ? ' style' : ' styles');
      };

      var run = function () {
        var query = input.value.trim().toLowerCase();
        scope.querySelectorAll('[data-filter-item]').forEach(function (item) {
          var text = (item.getAttribute('data-filter-item') + ' ' + item.textContent).toLowerCase();
          item.hidden = query.length > 0 && text.indexOf(query) === -1;
        });
        var emptyState = scope.parentElement.querySelector('[data-empty-example]');
        var anyVisible = scope.querySelectorAll('[data-filter-item]:not([hidden])').length > 0;
        if (emptyState) emptyState.style.display = anyVisible ? 'none' : 'block';
        updateCount();
      };

      input.addEventListener('input', run);
      updateCount();
    });
  }

  /* --------------------------------------------------------- Accordion */
  function initAccordion() {
    document.querySelectorAll('.accordion__trigger').forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!panel) return;
      trigger.addEventListener('click', function () {
        var expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!expanded));
        panel.style.maxHeight = expanded ? '0px' : panel.scrollHeight + 'px';
      });
    });
  }

  /* -------------------------------------------------------- Back to top */
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    var toggle = function () { btn.classList.toggle('is-visible', window.scrollY > 480); };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------- Enquiry form */
  function initEnquiryForm() {
    var form = document.querySelector('.enquiry-form');
    if (!form) return;

    var message = form.querySelector('#message');
    var charCount = form.querySelector('.char-count');
    if (message && charCount) {
      var updateChars = function () { charCount.textContent = message.value.length + ' / 500'; };
      message.addEventListener('input', updateChars);
      updateChars();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var ok = input.type === 'email'
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
          : input.value.trim().length > 0;
        field.classList.toggle('has-error', !ok);
        if (!ok) valid = false;
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
        if (charCount) charCount.textContent = '0 / 500';
        if (successEl) {
          successEl.hidden = false;
          successEl.focus();
        }
      }, 900);
    });
  }
})();
