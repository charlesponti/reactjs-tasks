'use strict';

/**
 * @desc Add event listeners to elements for site navigation controls
 */
(function() {
  var querySelector = document.querySelector.bind(document);

  var main = querySelector('main');
  var header = querySelector('.site-header');
  var navBtn = querySelector('.site-header .menu');
  var siteNav = querySelector('.site-nav');

  /**
   * @desc Remove .open class from <main>, .site-header, and .site-nav
   */
  function closeMenu() {
    return [main, header, siteNav, navBtn].forEach(function(el) {
      return el.classList.remove('open');
    });
  }

  /**
   * @desc Toggle .open class on <main>, .site-header, and .site-nav
   */
  function toggleMenu() {
    return [main, header, siteNav, navBtn].forEach(function(el) {
      return el.classList.toggle('open');
    });
  }

  // Add 'click' event listeners to <main>, .site-header > .menu, and .site-nav
  main.addEventListener('click', closeMenu);
  navBtn.addEventListener('click', toggleMenu);
  siteNav.addEventListener('click', function(event) {
    if (/LI|A/.test(event.target.nodeName)) {
      return closeMenu();
    }
    return;
  });
})();
