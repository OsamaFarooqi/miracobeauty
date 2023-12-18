
/*
* @license
* Modular Theme (c) Presidio Creative Themes
*
* Modified versions of the theme code
* are not supported by Presidio Creative.
*
*/

(function (bodyScrollLock, themeCurrency, Sqrl, Flickity, FlickityFade, Ajaxinate, FlickityAsNavFor, Rellax) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var Sqrl__namespace = /*#__PURE__*/_interopNamespaceDefault(Sqrl);

  window.theme = window.theme || {};

  window.theme.sizes = {
    mobile: 480,
    small: 768,
    large: 1024,
    widescreen: 1400,
  };

  window.theme.keyboardKeys = {
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    LEFTARROW: 37,
    RIGHTARROW: 39,
  };

  window.theme.dimensions = {
    headerScrolled: 60,
  };

  window.theme.focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  window.theme.a11yTrigger = null;

  function floatLabels(container) {
    const floats = container.querySelectorAll('.form-field');
    floats.forEach((element) => {
      const label = element.querySelector('label');
      const input = element.querySelector('input, textarea');
      if (label && input) {
        input.addEventListener('keyup', (event) => {
          if (event.target.value !== '') {
            label.classList.add('label--float');
          } else {
            label.classList.remove('label--float');
          }
        });
        if (input.value && input.value.length) {
          label.classList.add('label--float');
        }
      }
    });
  }

  function readHeights() {
    const h = {};
    h.windowHeight = window.innerHeight;
    h.announcementHeight = getHeight('[data-section-type*="announcement"]');
    h.footerHeight = getHeight('[data-section-type*="footer"]');
    h.headerHeight = getHeight('[data-header-height].header--has-scrolled') || 60; // Header height is always 60px on scroll
    h.headerInitialHeight = getHeight('[data-header-height]:not(.header--has-scrolled)');
    return h;
  }

  function setVarsOnResize() {
    document.addEventListener('theme:resize', resizeVars);
  }

  function setVars() {
    const {windowHeight, announcementHeight, headerInitialHeight, headerHeight, footerHeight} = readHeights();

    document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--header-initial-height', `${headerInitialHeight}px`);

    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight}px`);
    document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
    document.documentElement.style.setProperty('--scrollbar-width', `${getScrollbarWidth()}px`);
  }

  function resizeVars() {
    // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
    const {windowHeight, announcementHeight, headerHeight, footerHeight} = readHeights();
    document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight}px`);
    document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
  }

  function getHeight(selector) {
    const el = document.querySelector(selector);
    if (el) {
      return el.clientHeight;
    } else {
      return 0;
    }
  }

  function getScrollbarWidth() {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  const outerHeight = (el) => {
    const style = getComputedStyle(el);
    let height = el.offsetHeight;

    height += parseInt(style.marginTop) + parseInt(style.marginBottom);

    return height;
  };

  const selectors$Q = {
    bannerContainer: '[data-banner-container]',
    bannerContent: '[data-banner-content]',
  };

  function preventOverflow(container) {
    const banners = container.querySelectorAll(selectors$Q.bannerContainer);

    if (banners) {
      banners.forEach((banner) => {
        const content = banner.querySelector(selectors$Q.bannerContent);

        if (content) {
          banner.style.minHeight = `${outerHeight(content)}px`;

          document.addEventListener('theme:resize', () => {
            banner.style.minHeight = `${outerHeight(content)}px`;
          });
        }
      });
    }
  }

  function debounce(fn, time) {
    let timeout;
    return function () {
      // eslint-disable-next-line prefer-rest-params
      if (fn) {
        const functionCall = () => fn.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(functionCall, time);
      }
    };
  }

  window.lastWindowWidth = window.innerWidth;

  function dispatchResizeEvent() {
    document.dispatchEvent(
      new CustomEvent('theme:resize', {
        bubbles: true,
      })
    );

    if (window.lastWindowWidth !== window.innerWidth) {
      document.dispatchEvent(
        new CustomEvent('theme:resize:width', {
          bubbles: true,
        })
      );

      window.lastWindowWidth = window.innerWidth;
    }
  }

  function resizeListener() {
    window.addEventListener('resize', debounce(dispatchResizeEvent, 50));
  }

  let prev = window.pageYOffset;
  let up = null;
  let down = null;
  let wasUp = null;
  let wasDown = null;
  let scrollLockTimeout = 0;

  function dispatch() {
    const position = window.pageYOffset;
    if (position > prev) {
      down = true;
      up = false;
    } else if (position < prev) {
      down = false;
      up = true;
    } else {
      up = null;
      down = null;
    }
    prev = position;
    document.dispatchEvent(
      new CustomEvent('theme:scroll', {
        detail: {
          up,
          down,
          position,
        },
        bubbles: false,
      })
    );
    if (up && !wasUp) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:up', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    if (down && !wasDown) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:down', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    wasDown = down;
    wasUp = up;
  }

  function lock(e) {
    bodyScrollLock.disableBodyScroll(e.detail, {
      allowTouchMove: (el) => el.tagName === 'TEXTAREA',
    });
    document.documentElement.setAttribute('data-scroll-locked', '');
  }

  function unlock() {
    // Prevent body scroll lock race conditions
    scrollLockTimeout = setTimeout(() => {
      document.body.removeAttribute('data-drawer-closing');
    }, 20);

    if (document.body.hasAttribute('data-drawer-closing')) {
      document.body.removeAttribute('data-drawer-closing');

      if (scrollLockTimeout) {
        clearTimeout(scrollLockTimeout);
      }

      return;
    } else {
      document.body.setAttribute('data-drawer-closing', '');
    }

    document.documentElement.removeAttribute('data-scroll-locked');
    bodyScrollLock.clearAllBodyScrollLocks();
  }

  function scrollListener() {
    let timeout;
    window.addEventListener(
      'scroll',
      function () {
        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(function () {
          dispatch();
        });
      },
      {passive: true}
    );

    window.addEventListener('theme:scroll:lock', lock);
    window.addEventListener('theme:scroll:unlock', unlock);
  }

  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  }

  function isTouch() {
    if (isTouchDevice()) {
      document.documentElement.className = document.documentElement.className.replace('no-touch', 'supports-touch');
      window.theme.touched = true;
    } else {
      window.theme.touched = false;
    }
  }

  function ariaToggle(container) {
    const toggleButtons = container.querySelectorAll('[data-aria-toggle]');
    if (toggleButtons.length) {
      toggleButtons.forEach((element) => {
        element.addEventListener('click', function (event) {
          event.preventDefault();
          const currentTarget = event.currentTarget;
          currentTarget.setAttribute('aria-expanded', currentTarget.getAttribute('aria-expanded') == 'false' ? 'true' : 'false');
          const toggleID = currentTarget.getAttribute('aria-controls');
          document.querySelector(`#${toggleID}`).classList.toggle('expanding');
          setTimeout(function () {
            document.querySelector(`#${toggleID}`).classList.toggle('expanded');
          }, 40);
        });
      });
    }
  }

  const classes$y = {
    loading: 'is-loading',
  };

  const selectors$P = {
    img: 'img.is-loading',
  };

  /*
    Catch images loaded events and remove class "is-loading" to them and their containers
  */
  function loadedImagesEventHook() {
    document.addEventListener(
      'load',
      (e) => {
        if (e.target.tagName == 'IMG' && e.target.classList.contains(classes$y.loading)) {
          e.target.classList.remove(classes$y.loading);
          e.target.parentNode.classList.remove(classes$y.loading);
        }
      },
      true
    );
  }

  /*
    Remove "is-loading" class to the loaded images and their containers
  */
  function removeLoadingClassFromLoadedImages(container) {
    container.querySelectorAll(selectors$P.img).forEach((img) => {
      if (img.complete) {
        img.classList.remove(classes$y.loading);
        img.parentNode.classList.remove(classes$y.loading);
      }
    });
  }

  let isCompleted = false;
  let docComplete = false;

  function preloadImages() {
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        docComplete = true;
        initImagesPreloader();
      }
    };

    requestIdleCallback(initImagesPreloader);
  }

  function initImagesPreloader() {
    setTimeout(() => {
      if (isCompleted) return;
      if (!docComplete) {
        initImagesPreloader();
        return;
      }

      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      if (lazyImages.length) {
        lazyImages.forEach((image) => {
          image.setAttribute('loading', 'eager');
        });
      }

      isCompleted = true;
    }, 3000);
  }

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */

  /**
   * Moves focus to an HTML element
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects. Used in bindInPageLinks()
   * eg move focus to a modal that is opened. Used in trapFocus()
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */
  function forceFocus(element, options) {
      options = options || {};
    
      var savedTabIndex = element.tabIndex;
    
      element.tabIndex = -1;
      element.dataset.tabIndex = savedTabIndex;
      element.focus();
      if (typeof options.className !== 'undefined') {
        element.classList.add(options.className);
      }
      element.addEventListener('blur', callback);
    
      function callback(event) {
        event.target.removeEventListener(event.type, callback);
    
        element.tabIndex = savedTabIndex;
        delete element.dataset.tabIndex;
        if (typeof options.className !== 'undefined') {
          element.classList.remove(options.className);
        }
      }
    }
    
    /**
     * If there's a hash in the url, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - Selector for elements to not include.
     */
    
    function focusHash(options) {
      options = options || {};
      var hash = window.location.hash;
      var element = document.getElementById(hash.slice(1));
    
      // if we are to ignore this element, early return
      if (element && options.ignore && element.matches(options.ignore)) {
        return false;
      }
    
      if (hash && element) {
        forceFocus(element, options);
      }
    }
    
    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     * This compensates for older browsers that do not move keyboard focus to anchor links.
     * Recommendation: To be called once the page in loaded.
     *
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     * @param {string} options.ignore - CSS selector for elements to not include.
     */
    
    function bindInPageLinks(options) {
      options = options || {};
      var links = Array.prototype.slice.call(
        document.querySelectorAll('a[href^="#"]')
      );

      function queryCheck (selector) {
        return document.getElementById(selector) !== null
      }
    
      return links.filter(function(link) {
        if (link.hash === '#' || link.hash === '') {
          return false;
        }
    
        if (options.ignore && link.matches(options.ignore)) {
          return false;
        }

        if (!queryCheck(link.hash.substr(1))) {
          return false;
        }
    
        var element = document.querySelector(link.hash);
    
        if (!element) {
          return false;
        }
    
        link.addEventListener('click', function() {
          forceFocus(element, options);
        });
    
        return true;
      });
    }
    
    function focusable(container) {
      var elements = Array.prototype.slice.call(
        container.querySelectorAll(
          '[tabindex],' +
            '[draggable],' +
            'a[href],' +
            'area,' +
            'button:enabled,' +
            'input:not([type=hidden]):enabled,' +
            'object,' +
            'select:enabled,' +
            'textarea:enabled'
        )
      );
    
      // Filter out elements that are not visible.
      // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
      return elements.filter(function(element) {
        return !!(
          element.offsetWidth ||
          element.offsetHeight ||
          element.getClientRects().length
        );
      });
    }
    
    /**
     * Traps the focus in a particular container
     *
     * @param {Element} container - Container DOM element to trap focus inside of
     * @param {Element} elementToFocus - Element to be focused on first
     * @param {Object} options - Settings unique to your theme
     * @param {string} options.className - Class name to apply to element on focus.
     */
    
    var trapFocusHandlers = {};
    
    function trapFocus(container, options) {
      options = options || {};
      var elements = focusable(container);
      var elementToFocus = options.elementToFocus || container;
      var first = elements[0];
      var last = elements[elements.length - 1];
    
      removeTrapFocus();
    
      trapFocusHandlers.focusin = function(event) {
        if (container !== event.target && !container.contains(event.target)) {
          first.focus();
        }
    
        if (
          event.target !== container &&
          event.target !== last &&
          event.target !== first
        )
          return;
        document.addEventListener('keydown', trapFocusHandlers.keydown);
      };
    
      trapFocusHandlers.focusout = function() {
        document.removeEventListener('keydown', trapFocusHandlers.keydown);
      };
    
      trapFocusHandlers.keydown = function(event) {
        if (event.keyCode !== 9) return; // If not TAB key
    
        // On the last focusable element and tab forward, focus the first element.
        if (event.target === last && !event.shiftKey) {
          event.preventDefault();
          first.focus();
        }
    
        //  On the first focusable element and tab backward, focus the last element.
        if (
          (event.target === container || event.target === first) &&
          event.shiftKey
        ) {
          event.preventDefault();
          last.focus();
        }
      };
    
      document.addEventListener('focusout', trapFocusHandlers.focusout);
      document.addEventListener('focusin', trapFocusHandlers.focusin);
    
      forceFocus(elementToFocus, options);
    }
    
    /**
     * Removes the trap of focus from the page
     */
    function removeTrapFocus() {
      document.removeEventListener('focusin', trapFocusHandlers.focusin);
      document.removeEventListener('focusout', trapFocusHandlers.focusout);
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    }
    
    /**
     * Add a preventive message to external links and links that open to a new window.
     * @param {string} elements - Specific elements to be targeted
     * @param {object} options.messages - Custom messages to overwrite with keys: newWindow, external, newWindowExternal
     * @param {string} options.messages.newWindow - When the link opens in a new window (e.g. target="_blank")
     * @param {string} options.messages.external - When the link is to a different host domain.
     * @param {string} options.messages.newWindowExternal - When the link is to a different host domain and opens in a new window.
     * @param {object} options.prefix - Prefix to namespace "id" of the messages
     */
    function accessibleLinks(elements, options) {
      if (typeof elements !== 'string') {
        throw new TypeError(elements + ' is not a String.');
      }
    
      elements = document.querySelectorAll(elements);
    
      if (elements.length === 0) {
        return;
      }
    
      options = options || {};
      options.messages = options.messages || {};
    
      var messages = {
        newWindow: options.messages.newWindow || 'Opens in a new window.',
        external: options.messages.external || 'Opens external website.',
        newWindowExternal:
          options.messages.newWindowExternal ||
          'Opens external website in a new window.'
      };
    
      var prefix = options.prefix || 'a11y';
    
      var messageSelectors = {
        newWindow: prefix + '-new-window-message',
        external: prefix + '-external-message',
        newWindowExternal: prefix + '-new-window-external-message'
      };
    
      function generateHTML(messages) {
        var container = document.createElement('ul');
        var htmlMessages = Object.keys(messages).reduce(function(html, key) {
          return (html +=
            '<li id=' + messageSelectors[key] + '>' + messages[key] + '</li>');
        }, '');
    
        container.setAttribute('hidden', true);
        container.innerHTML = htmlMessages;
    
        document.body.appendChild(container);
      }
    
      function externalSite(link) {
        return link.hostname !== window.location.hostname;
      }
    
      elements.forEach(function(link) {
        var target = link.getAttribute('target');
        var rel = link.getAttribute('rel');
        var isExternal = externalSite(link);
        var isTargetBlank = target === '_blank';
        var missingRelNoopener = rel === null || rel.indexOf('noopener') === -1;
    
        if (isTargetBlank && missingRelNoopener) {
          var relValue = rel === null ? 'noopener' : rel + ' noopener';
          link.setAttribute('rel', relValue);
        }
    
        if (isExternal && isTargetBlank) {
          link.setAttribute('aria-describedby', messageSelectors.newWindowExternal);
        } else if (isExternal) {
          link.setAttribute('aria-describedby', messageSelectors.external);
        } else if (isTargetBlank) {
          link.setAttribute('aria-describedby', messageSelectors.newWindow);
        }
      });
    
      generateHTML(messages);
    }

  var a11y = /*#__PURE__*/Object.freeze({
    __proto__: null,
    forceFocus: forceFocus,
    focusHash: focusHash,
    bindInPageLinks: bindInPageLinks,
    focusable: focusable,
    trapFocus: trapFocus,
    removeTrapFocus: removeTrapFocus,
    accessibleLinks: accessibleLinks
  });

  function getWindowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }

  function getWindowHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  }

  function isDesktop() {
    return getWindowWidth() >= window.theme.sizes.small;
  }

  const selectors$O = {
    inputSearch: 'input[type="search"]',
    focusedElements: '[aria-selected="true"] a',
    resetButton: 'button[type="reset"]',
  };

  const classes$x = {
    hidden: 'hidden',
  };

  class HeaderSearchForm extends HTMLElement {
    constructor() {
      super();

      this.input = this.querySelector(selectors$O.inputSearch);
      this.resetButton = this.querySelector(selectors$O.resetButton);

      if (this.input) {
        this.input.form.addEventListener('reset', this.onFormReset.bind(this));
        this.input.addEventListener(
          'input',
          debounce((event) => {
            this.onChange(event);
          }, 300).bind(this)
        );
      }
    }

    toggleResetButton() {
      const resetIsHidden = this.resetButton.classList.contains(classes$x.hidden);
      if (this.input.value.length > 0 && resetIsHidden) {
        this.resetButton.classList.remove(classes$x.hidden);
      } else if (this.input.value.length === 0 && !resetIsHidden) {
        this.resetButton.classList.add(classes$x.hidden);
      }
    }

    onChange() {
      this.toggleResetButton();
    }

    shouldResetForm() {
      return !document.querySelector(selectors$O.focusedElements);
    }

    onFormReset(event) {
      // Prevent default so the form reset doesn't set the value gotten from the url on page load
      event.preventDefault();
      // Don't reset if the user has selected an element on the predictive search dropdown
      if (this.shouldResetForm()) {
        this.input.value = '';
        this.toggleResetButton();
        event.target.querySelector(selectors$O.inputSearch).focus();
      }
    }
  }

  customElements.define('header-search-form', HeaderSearchForm);

  const selectors$N = {
    allVisibleElements: '[role="option"]',
    ariaSelected: '[aria-selected="true"]',
    predictiveSearch: 'predictive-search',
    predictiveSearchResults: '[data-predictive-search-results]',
    predictiveSearchStatus: '[data-predictive-search-status]',
    searchInput: 'input[type="search"]',
    searchPopdown: '[data-popdown]',
    searchResultsLiveRegion: '[data-predictive-search-live-region-count-value]',
    searchResultsGroupsWrapper: 'data-search-results-groups-wrapper',
    searchForText: '[data-predictive-search-search-for-text]',
    sectionPredictiveSearch: '#shopify-section-predictive-search',
    selectedLink: '[aria-selected="true"] a',
    selectedOption: '[aria-selected="true"] a, button[aria-selected="true"]',
  };

  class PredictiveSearch extends HeaderSearchForm {
    constructor() {
      super();
      this.a11y = a11y;
      this.abortController = new AbortController();
      this.allPredictiveSearchInstances = document.querySelectorAll(selectors$N.predictiveSearch);
      this.cachedResults = {};
      this.input = this.querySelector(selectors$N.searchInput);
      this.isOpen = false;
      this.predictiveSearchResults = this.querySelector(selectors$N.predictiveSearchResults);
      this.searchPopdown = this.closest(selectors$N.searchPopdown);
      this.searchTerm = '';
    }

    connectedCallback() {
      this.input.addEventListener('focus', this.onFocus.bind(this));
      this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

      this.addEventListener('focusout', this.onFocusOut.bind(this));
      this.addEventListener('keyup', this.onKeyup.bind(this));
      this.addEventListener('keydown', this.onKeydown.bind(this));
    }

    getQuery() {
      return this.input.value.trim();
    }

    onChange() {
      super.onChange();
      const newSearchTerm = this.getQuery();

      if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
        // Remove the results when they are no longer relevant for the new search term
        // so they don't show up when the dropdown opens again
        this.querySelector(selectors$N.searchResultsGroupsWrapper)?.remove();
      }

      // Update the term asap, don't wait for the predictive search query to finish loading
      this.updateSearchForTerm(this.searchTerm, newSearchTerm);

      this.searchTerm = newSearchTerm;

      if (!this.searchTerm.length) {
        this.reset();
        return;
      }

      this.getSearchResults(this.searchTerm);
    }

    onFormSubmit(event) {
      if (!this.getQuery().length || this.querySelector(selectors$N.selectedLink)) event.preventDefault();
    }

    onFormReset(event) {
      super.onFormReset(event);
      if (super.shouldResetForm()) {
        this.searchTerm = '';
        this.abortController.abort();
        this.abortController = new AbortController();
        this.closeResults(true);
      }
    }

    shouldResetForm() {
      return !document.querySelector(selectors$N.selectedLink);
    }

    onFocus() {
      const currentSearchTerm = this.getQuery();

      if (!currentSearchTerm.length) return;

      if (this.searchTerm !== currentSearchTerm) {
        // Search term was changed from other search input, treat it as a user change
        this.onChange();
      } else if (this.getAttribute('results') === 'true') {
        this.open();
      } else {
        this.getSearchResults(this.searchTerm);
      }
    }

    onFocusOut() {
      setTimeout(() => {
        if (!this.contains(document.activeElement)) this.close();
      });
    }

    onKeyup(event) {
      if (!this.getQuery().length) this.close(true);
      event.preventDefault();

      switch (event.code) {
        case 'ArrowUp':
          this.switchOption('up');
          break;
        case 'ArrowDown':
          this.switchOption('down');
          break;
        case 'Enter':
          this.selectOption();
          break;
      }
    }

    onKeydown(event) {
      // Prevent the cursor from moving in the input when using the up and down arrow keys
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        event.preventDefault();
      }
    }

    updateSearchForTerm(previousTerm, newTerm) {
      const searchForTextElement = this.querySelector(selectors$N.searchForText);
      const currentButtonText = searchForTextElement?.innerText;

      if (currentButtonText) {
        if (currentButtonText.match(new RegExp(previousTerm, 'g'))?.length > 1) {
          // The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
          return;
        }
        const newButtonText = currentButtonText.replace(previousTerm, newTerm);
        searchForTextElement.innerText = newButtonText;
      }
    }

    switchOption(direction) {
      if (!this.getAttribute('open')) return;

      const moveUp = direction === 'up';
      const selectedElement = this.querySelector(selectors$N.ariaSelected);

      // Filter out hidden elements (duplicated page and article resources) thanks
      // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
      const allVisibleElements = Array.from(this.querySelectorAll(selectors$N.allVisibleElements)).filter((element) => element.offsetParent !== null);

      let activeElementIndex = 0;

      if (moveUp && !selectedElement) return;

      let selectedElementIndex = -1;
      let i = 0;

      while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
        if (allVisibleElements[i] === selectedElement) {
          selectedElementIndex = i;
        }
        i++;
      }

      this.statusElement.textContent = '';

      if (!moveUp && selectedElement) {
        activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
      } else if (moveUp) {
        activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
      }

      if (activeElementIndex === selectedElementIndex) return;

      const activeElement = allVisibleElements[activeElementIndex];

      activeElement.setAttribute('aria-selected', true);
      if (selectedElement) selectedElement.setAttribute('aria-selected', false);

      this.input.setAttribute('aria-activedescendant', activeElement.id);
    }

    selectOption() {
      const selectedOption = this.querySelector(selectors$N.selectedOption);

      if (selectedOption) selectedOption.click();
    }

    getSearchResults(searchTerm) {
      const queryKey = searchTerm.replace(' ', '-').toLowerCase();
      this.setLiveRegionLoadingState();

      if (this.cachedResults[queryKey]) {
        this.renderSearchResults(this.cachedResults[queryKey]);
        return;
      }

      fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`, {signal: this.abortController.signal})
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            this.close();
            throw error;
          }
          return response.text();
        })
        .then((text) => {
          const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$N.sectionPredictiveSearch).innerHTML;
          // Save bandwidth keeping the cache in all instances synced
          this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
            predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
          });
          this.renderSearchResults(resultsMarkup);
        })
        .catch((error) => {
          if (error?.code === 20) {
            // Code 20 means the call was aborted
            return;
          }
          this.close();
          throw error;
        });
    }

    setLiveRegionLoadingState() {
      this.statusElement = this.statusElement || this.querySelector(selectors$N.predictiveSearchStatus);
      this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

      this.setLiveRegionText(this.loadingText);
      this.setAttribute('loading', true);
    }

    setLiveRegionText(statusText) {
      this.statusElement.setAttribute('aria-hidden', 'false');
      this.statusElement.textContent = statusText;

      setTimeout(() => {
        this.statusElement.setAttribute('aria-hidden', 'true');
      }, 1000);
    }

    renderSearchResults(resultsMarkup) {
      this.predictiveSearchResults.innerHTML = resultsMarkup;

      this.setAttribute('results', true);

      this.setLiveRegionResults();
      this.open();
    }

    setLiveRegionResults() {
      this.removeAttribute('loading');
      this.setLiveRegionText(this.querySelector(selectors$N.searchResultsLiveRegion).textContent);
    }

    getResultsMaxHeight() {
      this.resultsMaxHeight = getWindowHeight() - document.querySelector(selectors$N.searchPopdown).getBoundingClientRect().bottom;
      return this.resultsMaxHeight;
    }

    open() {
      this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
      this.setAttribute('open', true);
      this.input.setAttribute('aria-expanded', true);
      this.isOpen = true;
    }

    close(clearSearchTerm = false) {
      this.closeResults(clearSearchTerm);
      this.isOpen = false;
    }

    closeResults(clearSearchTerm = false) {
      if (clearSearchTerm) {
        this.input.value = '';
        this.removeAttribute('results');
      }
      const selected = this.querySelector(selectors$N.ariaSelected);

      if (selected) selected.setAttribute('aria-selected', false);

      this.input.setAttribute('aria-activedescendant', '');
      this.removeAttribute('loading');
      this.removeAttribute('open');
      this.input.setAttribute('aria-expanded', false);
      this.resultsMaxHeight = false;
      this.predictiveSearchResults?.removeAttribute('style');
    }

    reset() {
      this.predictiveSearchResults.innerHTML = '';

      this.input.val = '';
      this.a11y.removeTrapFocus();
    }
  }

  customElements.define('predictive-search', PredictiveSearch);

  const selectors$M = {
    aos: '[data-aos]:not(.aos-animate)',
    aosAnchor: '[data-aos-anchor]',
  };

  const classes$w = {
    aosAnimate: 'aos-animate',
  };

  const observerConfig = {
    attributes: false,
    childList: true,
    subtree: true,
  };

  const mutationCallback = (mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        const element = mutation.target;
        const elementsToAnimate = element.querySelectorAll(selectors$M.aos);
        const anchors = element.querySelectorAll(selectors$M.aosAnchor);

        if (elementsToAnimate.length) {
          elementsToAnimate.forEach((element) => {
            aosItemObserver.observe(element);
          });
        }

        if (anchors.length) {
          // Get all anchors and attach observers
          initAnchorObservers(anchors);
        }
      }
    }
  };

  /*
    Observe each element that needs to be animated
  */
  const aosItemObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(classes$w.aosAnimate);

          // Stop observing element after it was animated
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    }
  );

  /*
    Observe anchor elements
  */
  const aosAnchorObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0.1) {
          const elementsToAnimate = entry.target.querySelectorAll(selectors$M.aos);

          if (elementsToAnimate.length) {
            elementsToAnimate.forEach((item) => {
              item.classList.add(classes$w.aosAnimate);
            });
          }

          // Stop observing anchor element after inner elements were animated
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: [0.1, 0.25, 0.5, 0.75, 1],
    }
  );

  /*
    Watch for mutations in the body and start observing the newly added animated elements and anchors
  */
  function bodyMutationObserver() {
    const bodyObserver = new MutationObserver(mutationCallback);
    bodyObserver.observe(document.body, observerConfig);
  }

  /*
    Observe animated elements that have attribute [data-aos]
  */
  function elementsIntersectionObserver() {
    const elementsToAnimate = document.querySelectorAll(selectors$M.aos);

    if (elementsToAnimate.length) {
      elementsToAnimate.forEach((element) => {
        aosItemObserver.observe(element);
      });
    }
  }

  /*
    Observe animated elements that have attribute [data-aos]
  */
  function anchorsIntersectionObserver() {
    const anchors = document.querySelectorAll(selectors$M.aosAnchor);

    if (anchors.length) {
      // Get all anchors and attach observers
      initAnchorObservers(anchors);
    }
  }

  function initAnchorObservers(anchors) {
    let anchorContainers = [];

    if (!anchors.length) return;

    anchors.forEach((anchor) => {
      const containerId = anchor.dataset.aosAnchor;

      // Avoid adding multiple observers to the same element
      if (anchorContainers.indexOf(containerId) === -1) {
        const container = document.querySelector(containerId);

        if (container) {
          aosAnchorObserver.observe(container);
          anchorContainers.push(containerId);
        }
      }
    });
  }

  function initAnimations() {
    elementsIntersectionObserver();
    anchorsIntersectionObserver();
    bodyMutationObserver();
  }

  // Safari requestIdleCallback polyfill
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function (cb) {
      var start = Date.now();
      return setTimeout(function () {
        cb({
          didTimeout: false,
          timeRemaining: function () {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      }, 1);
    };
  window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function (id) {
      clearTimeout(id);
    };

  // Animate on scroll
  const showAnimations = document.body.getAttribute('data-animations') === 'true';
  if (showAnimations) {
    initAnimations();
  }

  resizeListener();
  scrollListener();
  isTouch();
  setVars();
  loadedImagesEventHook();

  window.addEventListener('DOMContentLoaded', () => {
    setVarsOnResize();
    floatLabels(document);
    preventOverflow(document);
    ariaToggle(document);
    removeLoadingClassFromLoadedImages(document);

    if (window.fastNetworkAndCPU) {
      preloadImages();
    }
  });

  document.addEventListener('shopify:section:load', (e) => {
    const container = e.target;
    floatLabels(container);
    preventOverflow(container);
    ariaToggle(document);

    document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
  });

  document.addEventListener('shopify:section:reorder', () => {
    document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
  });

  document.addEventListener('shopify:section:unload', () => {
    // When you hide/disable a section, the unload event is fired before the section is actually removed from the DOM
    // We need a little delay before checking for transparent header to make sure it's already removed from the DOM
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('theme:header:update', {bubbles: true}));
    }, 200);
  });

  (function () {
    function n(n) {
      var i = window.innerWidth || document.documentElement.clientWidth,
        r = window.innerHeight || document.documentElement.clientHeight,
        t = n.getBoundingClientRect();
      return t.top >= 0 && t.bottom <= r && t.left >= 0 && t.right <= i;
    }
    function t(n) {
      var i = window.innerWidth || document.documentElement.clientWidth,
        r = window.innerHeight || document.documentElement.clientHeight,
        t = n.getBoundingClientRect(),
        u = (t.left >= 0 && t.left <= i) || (t.right >= 0 && t.right <= i),
        f = (t.top >= 0 && t.top <= r) || (t.bottom >= 0 && t.bottom <= r);
      return u && f;
    }
    function i(n, i) {
      function r() {
        var r = t(n);
        r != u && ((u = r), typeof i == 'function' && i(r, n));
      }
      var u = t(n);
      window.addEventListener('load', r);
      window.addEventListener('resize', r);
      window.addEventListener('scroll', r);
    }
    function r(t, i) {
      function r() {
        var r = n(t);
        r != u && ((u = r), typeof i == 'function' && i(r, t));
      }
      var u = n(t);
      window.addEventListener('load', r);
      window.addEventListener('resize', r);
      window.addEventListener('scroll', r);
    }
    window.visibilityHelper = {isElementTotallyVisible: n, isElementPartiallyVisible: t, inViewportPartially: i, inViewportTotally: r};
  })();

  const settings$1 = {
    elements: {
      html: 'html',
      body: 'body',
      inPageLink: '[data-skip-content]',
      linksWithOnlyHash: 'a[href="#"]',
      triggerFocusElement: '[data-focus-element]',
    },
    classes: {
      focus: 'is-focused',
    },
  };

  class Accessibility {
    constructor() {
      this.init();
    }

    init() {
      this.settings = settings$1;
      this.window = window;
      this.document = document;
      this.a11y = a11y;

      // DOM Elements
      this.inPageLink = this.document.querySelector(this.settings.elements.inPageLink);
      this.linksWithOnlyHash = this.document.querySelectorAll(this.settings.elements.linksWithOnlyHash);
      this.html = this.document.querySelector(this.settings.elements.html);
      this.body = this.document.querySelector(this.settings.elements.body);
      this.lastFocused = null;

      // Flags
      this.isFocused = false;

      // A11Y init methods
      this.a11y.focusHash();
      this.a11y.bindInPageLinks();

      // Events
      this.clickEvents();
      this.focusEvents();
      this.focusEventsOff();
      this.closeExpandedElements();
    }

    /**
     * Clicked events accessibility
     *
     * @return  {Void}
     */

    clickEvents() {
      if (this.inPageLink) {
        this.inPageLink.addEventListener('click', (event) => {
          event.preventDefault();
        });
      }

      if (this.linksWithOnlyHash) {
        this.linksWithOnlyHash.forEach((item) => {
          item.addEventListener('click', (event) => {
            event.preventDefault();
          });
        });
      }
    }

    /**
     * Focus events
     *
     * @return  {Void}
     */

    focusEvents() {
      this.document.addEventListener('keyup', (event) => {
        if (event.keyCode !== theme.keyboardKeys.TAB) {
          return;
        }

        this.body.classList.add(this.settings.classes.focus);
        this.isFocused = true;
      });

      // Expand modals
      this.document.addEventListener('keyup', (event) => {
        if (!this.isFocused) {
          return;
        }

        const target = event.target;
        const pressEnterOrSpace = event.keyCode === theme.keyboardKeys.ENTER || event.keyCode === theme.keyboardKeys.SPACE;
        const targetElement = target.matches(this.settings.elements.triggerFocusElement) || target.closest(this.settings.elements.triggerFocusElement);

        if (pressEnterOrSpace && targetElement) {
          if (this.lastFocused === null) {
            this.lastFocused = target;
          }
        }
      });

      // Focus addToCart button or quickview button
      this.html.addEventListener('theme:cart:add', (event) => {
        this.lastFocused = event.detail.selector;
      });
    }

    /**
     * Focus events off
     *
     * @return  {Void}
     */

    focusEventsOff() {
      this.document.addEventListener('mousedown', () => {
        this.body.classList.remove(this.settings.classes.focus);
        this.isFocused = false;
      });
    }

    /**
     * Close expanded elements with when press escape
     *
     * @return  {Void}
     */

    closeExpandedElements() {
      document.addEventListener('keyup', (event) => {
        if (event.keyCode !== theme.keyboardKeys.ESCAPE) {
          return;
        }

        this.a11y.removeTrapFocus();

        if (this.lastFocused !== null) {
          setTimeout(() => {
            this.lastFocused.focus();
            this.lastFocused = null;
          }, 600);
        }
      });
    }
  }

  window.accessibility = new Accessibility();

  const slideUp = (target, duration = 500) => {
    target.style.transitionProperty = 'all';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  };

  const slideDown = (target, duration = 500, checkHidden = true) => {
    let display = window.getComputedStyle(target).display;
    if (checkHidden && display !== 'none') {
      return;
    }
    target.style.removeProperty('display');
    if (display === 'none') {
      display = 'block';
    }
    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = 'all';
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
    }, duration);
  };

  function FetchError(object) {
    this.status = object.status || null;
    this.headers = object.headers || null;
    this.json = object.json || null;
    this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

  const selectors$L = {
    quantityHolder: '[data-quantity-holder]',
    quantityField: '[data-quantity-field]',
    quantityButton: '[data-quantity-button]',
    quantityMinusButton: '[data-quantity-minus]',
    quantityPlusButton: '[data-quantity-plus]',
    quantityReadOnly: 'read-only',
    isDisabled: 'is-disabled',
  };

  class QuantityCounter {
    constructor(holder, inCart = false) {
      this.holder = holder;
      this.quantityUpdateCart = inCart;
    }

    init() {
      // Settings
      this.settings = selectors$L;

      // DOM Elements
      this.quantity = this.holder.querySelector(this.settings.quantityHolder);
      this.field = this.quantity.querySelector(this.settings.quantityField);
      this.buttons = this.quantity.querySelectorAll(this.settings.quantityButton);
      this.increaseButton = this.quantity.querySelector(this.settings.quantityPlusButton);

      // Set value or classes
      this.quantityValue = Number(this.field.value || 0);
      this.cartItemID = this.field.getAttribute('data-id');
      this.maxValue = Number(this.field.getAttribute('max')) > 0 ? Number(this.field.getAttribute('max')) : null;
      this.minValue = Number(this.field.getAttribute('min')) > 0 ? Number(this.field.getAttribute('min')) : 0;
      this.disableIncrease = this.disableIncrease.bind(this);

      // Flags
      this.emptyField = false;

      // Methods
      this.updateQuantity = this.updateQuantity.bind(this);
      this.decrease = this.decrease.bind(this);
      this.increase = this.increase.bind(this);

      this.disableIncrease();

      // Events
      if (!this.quantity.classList.contains(this.settings.quantityReadOnly)) {
        this.changeValueOnClick();
        this.changeValueOnInput();
      }
    }

    /**
     * Change field value when click on quantity buttons
     *
     * @return  {Void}
     */

    changeValueOnClick() {
      const that = this;

      this.buttons.forEach((element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          const clickedElement = event.target;
          const isDescrease = clickedElement.matches(that.settings.quantityMinusButton) || clickedElement.closest(that.settings.quantityMinusButton);
          const isIncrease = clickedElement.matches(that.settings.quantityPlusButton) || clickedElement.closest(that.settings.quantityPlusButton);

          if (isDescrease) {
            that.decrease();
          }

          if (isIncrease) {
            that.increase();
          }

          that.updateQuantity();
        });
      });
    }

    /**
     * Change field value when input new value in a field
     *
     * @return  {Void}
     */

    changeValueOnInput() {
      const that = this;

      this.field.addEventListener(
        'input',
        function () {
          that.quantityValue = this.value;

          if (this.value === '') {
            that.emptyField = true;
          }

          that.updateQuantity();
        },
        this
      );
    }

    /**
     * Update field value
     *
     * @return  {Void}
     */

    updateQuantity() {
      if (this.maxValue < this.quantityValue && this.maxValue !== null) {
        this.quantityValue = this.maxValue;
      }

      if (this.minValue > this.quantityValue) {
        this.quantityValue = this.minValue;
      }

      this.field.value = this.quantityValue;

      this.disableIncrease();

      document.dispatchEvent(new CustomEvent('theme:popout:update'));

      if (this.quantityUpdateCart) {
        this.updateCart();
      }
    }

    /**
     * Decrease value
     *
     * @return  {Void}
     */

    decrease() {
      if (this.quantityValue > this.minValue) {
        this.quantityValue--;

        return;
      }

      this.quantityValue = 0;
    }

    /**
     * Increase value
     *
     * @return  {Void}
     */

    increase() {
      this.quantityValue++;
    }

    /**
     * Disable increase
     *
     * @return  {[type]}  [return description]
     */

    disableIncrease() {
      this.increaseButton.classList.toggle(this.settings.isDisabled, this.quantityValue >= this.maxValue && this.maxValue !== null);
    }

    /**
     * Update cart
     *
     * @return  {Void}
     */

    updateCart() {
      const event = new CustomEvent('theme:cart:update', {
        bubbles: true,
        detail: {
          id: this.cartItemID,
          quantity: this.quantityValue,
          valueIsEmpty: this.emptyField,
        },
      });

      this.holder.dispatchEvent(event);
    }
  }

  const settings = {
    dimensions: {
      maxSize: 100,
    },
    times: {
      timeoutAddProduct: 1000,
      closeDropdownAfter: 5000,
    },
    classes: {
      template: 'template-cart',
      hidden: 'is-hidden',
      cartVisible: 'cart--is-visible',
      open: 'is-open',
      focused: 'is-focused',
      visible: 'is-visible',
      loading: 'is-loading',
      disabled: 'is-disabled',
      success: 'product__form-submit--success',
      defaultSuccess: 'is-success',
      cartEmpty: 'cartToggle--empty',
      isAdded: 'is-added',
    },
    attributes: {
      expanded: 'aria-expanded',
      disabled: 'disabled',
      dataId: 'data-id',
      cartTotalPrice: 'data-cart-total-price',
      freeMessageLimit: 'data-limit',
    },
    elements: {
      apiContent: '[data-api-content]',
      html: 'html',
      button: 'button',
      buttonAddToCart: '[data-add-to-cart]',
      buttonAddToCartText: '[data-add-to-cart-text]',
      buttonHolder: '[data-foot-holder]',
      buttonUpdateCart: '[data-update-cart]',
      cart: '[data-cart]',
      cartScroll: '[data-cart-scroll]',
      cartContainer: '[data-cart-container]',
      cartTemplate: '[data-cart-template]',
      cartToggleElement: '[data-cart-toggle]',
      cartClose: '[data-cart-close]',
      cartItemRemove: '[data-item-remove]',
      cartItemsCount: '[data-cart-items-count]',
      cartTotal: '[data-cart-total]',
      cartErrors: '[data-cart-errors]',
      cartCloseError: '[data-cart-error-close]',
      cartOriginalTotal: '[data-cart-original-total]',
      cartOriginaTotalPrice: '[data-cart-original-total-price]',
      cartDiscountsHolder: '[data-cart-discounts-holder]',
      cartAcceptanceCheckbox: '[data-cart-acceptance-checkbox]',
      cartButtons: '[data-cart-buttons]',
      cartButtonsFieldset: '[data-cart-buttons-fieldset]',
      cartFormError: '[data-cart-error]',
      cartMessage: 'data-cart-message',
      cartMessageItem: '[data-cart-message]',
      cartProgress: '[data-cart-progress]',
      continueBtn: '[data-continue]',
      emptyMessage: '[data-empty-message]',
      errorMessage: '[data-error-message]',
      input: 'input',
      item: '[data-item]',
      itemsHolder: '[data-items-holder]',
      leftToSpend: '[data-left-to-spend]',
      popover: '[data-popover]',
      popoverTemplate: '[data-popover-template]',
      qty: '[data-quantity-field]',
      quickAddHolder: '[data-quick-add-holder]',
    },
    formatMoney: moneyFormat,
    formatMoneyWithCurrencyFormat: moneyWithCurrencyFormat,
    cartTotalDiscountsTemplate: '[data-cart-total-discount]',
  };

  class CartDrawer {
    constructor() {
      if (window.location.pathname === '/password') {
        return;
      }

      this.init();
    }

    init() {
      // DOM Elements
      this.html = document.querySelector(settings.elements.html);
      this.body = document.body;

      this.defineSelectors();
      this.accessibility = a11y;
      this.ajaxEnabled = theme.settings.enableAjaxCart;
      this.popoverTimer = '';
      this.scrollLockTimeout = 0;
      this.cartFocusTimeout = 0;
      this.form = null;
      this.cartItemsCount = document.querySelector(settings.elements.cartItemsCount);

      // Flags
      this.cartDrawerIsOpen = false;
      this.cartDiscounts = 0;
      this.cartLimitErrorIsHidden = true;

      // Cart events
      this.openCartDrawer = this.openCartDrawer.bind(this);
      this.closeCartDrawer = this.closeCartDrawer.bind(this);
      this.toggleCartDrawer = this.toggleCartDrawer.bind(this);
      this.cartKeyUpEvent = this.cartKeyUpEvent.bind(this);

      if (this.ajaxEnabled) {
        this.eventToggleCart();
      }

      this.initDefaultCartEvents();
      this.addProductEvent();
    }

    /**
     * Render cart and define all elements after cart drawer is open for a first time
     *
     * @return  {Void}
     */
    renderCart() {
      // Append cart template html to the cart drawer
      this.cartContainer.innerHTML = document.querySelector(settings.elements.cartTemplate).innerHTML;
      this.totalItems = this.items.length;

      this.defineSelectors();
      this.initDefaultCartEvents();

      this.getCart();
    }

    /**
     * Define cart selectors
     *
     * @return  {Void}
     */
    defineSelectors() {
      this.cartContainer = document.querySelector(settings.elements.cartContainer);
      this.cartTemplate = document.querySelector(settings.elements.cartTemplate);
      this.popover = document.querySelector(settings.elements.popover);
      this.popoverTemplate = document.querySelector(settings.elements.popoverTemplate).innerHTML;
      this.cart = document.querySelector(settings.elements.cart);
      this.cartScroll = document.querySelector(settings.elements.cartScroll);
      this.emptyMessage = document.querySelector(settings.elements.emptyMessage);
      this.buttonHolder = document.querySelector(settings.elements.buttonHolder);
      this.itemsHolder = document.querySelector(settings.elements.itemsHolder);
      this.items = document.querySelectorAll(settings.elements.item);
      this.cartToggle = document.querySelector(settings.elements.cartToggleElement);
      this.continueBtns = document.querySelectorAll(settings.elements.continueBtn);
      this.cartTotal = document.querySelector(settings.elements.cartTotal);
      this.cartOriginalTotal = document.querySelector(settings.elements.cartOriginalTotal);
      this.cartOriginaTotalPrice = document.querySelector(settings.elements.cartOriginaTotalPrice);
      this.cartDiscountHolder = document.querySelector(settings.elements.cartDiscountsHolder);
      this.cartTotalDiscountTemplate = document.querySelector(settings.cartTotalDiscountsTemplate).innerHTML;
      this.cartErrorHolder = document.querySelector(settings.elements.cartErrors);
      this.cartClose = document.querySelector(settings.elements.cartClose);
      this.cartCloseErrorMessage = document.querySelector(settings.elements.cartCloseError);
      this.cartAcceptanceCheckbox = document.querySelector(settings.elements.cartAcceptanceCheckbox);
      this.cartMessage = document.querySelector(`[${settings.elements.cartMessage}]`);
      this.leftToSpend = document.querySelectorAll(settings.elements.leftToSpend);
    }

    /**
     * Init default cart events
     *
     * @return  {Void}
     */
    initDefaultCartEvents() {
      // Cart Events
      if (this.ajaxEnabled) {
        this.cartEvents();
        this.customEventAddProduct();
      } else if (this.items.length) {
        this.noAjaxUpdate();
      }

      // Init quantity for fields
      this.initQuantity(this.ajaxEnabled);

      if (this.cartMessage) {
        this.cartFreeLimitShipping = Number(this.cartMessage.getAttribute(settings.attributes.freeMessageLimit)) * window.Shopify.currency.rate;
        this.subtotal = Number(this.cartMessage.getAttribute(settings.attributes.cartTotalPrice));
        this.cartBarProgress();
        this.updateProgress();
      }
    }

    /**
     * Init quantity field functionality
     *
     * @return  {Void}
     */

    initQuantity(ajax) {
      this.items = document.querySelectorAll(settings.elements.item);

      this.items.forEach((item) => {
        const initQuantity = new QuantityCounter(item, true);

        initQuantity.init();
        if (ajax) {
          this.customEventsHandle(item);
        }
      });
    }

    noAjaxUpdate() {
      const updateBtn = this.buttonHolder.querySelector(settings.elements.buttonUpdateCart);
      updateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.items.forEach((item) => {
          const qty = item.querySelector(`input[${settings.attributes.dataId}]`);
          this.updateCart({
            id: qty.getAttribute(settings.attributes.dataId),
            quantity: qty.value,
          });
        });
      });
    }

    /**
     * Custom event who change the cart
     *
     * @return  {Void}
     */

    customEventsHandle(holder) {
      holder.addEventListener(
        'theme:cart:update',
        debounce((event) => {
          this.updateCart(
            {
              id: event.detail.id,
              quantity: event.detail.quantity,
            },
            holder,
            event.detail.valueIsEmpty
          );
        }, 500)
      );
    }

    /**
     *  Custom event for add product to the cart
     */
    customEventAddProduct() {
      document.addEventListener(
        'theme:cart:add',
        debounce((event) => {
          this.cartToggle.classList.add(settings.classes.isAdded);
          setTimeout(() => {
            this.cartToggle.classList.remove(settings.classes.isAdded);
          }, 800);
        }, 500)
      );
    }

    /**
     * Cart events
     *
     * @return  {Void}
     */

    cartEvents() {
      const cartItemRemove = document.querySelectorAll(settings.elements.cartItemRemove);

      if (cartItemRemove) {
        cartItemRemove.forEach((item) => {
          item.addEventListener('click', (event) => {
            event.preventDefault();
            event.target.closest(settings.elements.item).classList.add(settings.classes.loading);

            this.updateCart({
              id: item.getAttribute(settings.attributes.dataId),
              quantity: 0,
            });
          });
        });
      }

      if (this.cartCloseErrorMessage) {
        this.cartCloseErrorMessage.addEventListener('click', (event) => {
          event.preventDefault();

          slideUp(this.cartErrorHolder, 400);
        });
      }

      // Continue Shopping Button
      if (this.continueBtns) {
        this.continueBtns.forEach((continueBtn) => {
          continueBtn.addEventListener('click', (e) => {
            const referrer = document.referrer;
            const origin = window.location.origin + '/';
            const isDesktop = window.innerWidth >= theme.sizes.small;

            e.preventDefault();

            if (isDesktop && !(window.location.href.indexOf('/cart') > -1)) {
              this.closeCartDrawer();
            } else if (referrer === origin) {
              window.location.href = theme.routes.root;
            } else {
              history.back(1);
            }
          });
        });
      }

      // Close Cart Button
      if (this.cartClose) {
        this.cartClose.addEventListener('click', this.closeCartDrawer);
      }

      // Esc key close cart dropdown and popover
      if (this.cartContainer) {
        this.cartContainer.addEventListener('keyup', this.cartKeyUpEvent);
      }

      // Terms and conditions checkbox listener
      if (this.cartAcceptanceCheckbox) {
        this.cart.addEventListener('click', (event) => {
          const clickedElement = event.target;
          const isCartButtons = clickedElement.matches(settings.elements.cartButtons) || clickedElement.closest(settings.elements.cartButtons);
          if (isCartButtons) {
            this.termsAcceptance(event);
          }
        });
        this.cartAcceptanceCheckbox.addEventListener('change', (event) => this.termsAcceptance(event));

        if (this.cartAcceptanceCheckbox.checked === false) {
          this.cart.querySelector(settings.elements.cartButtonsFieldset).setAttribute(settings.attributes.disabled, true);
        }
      }
    }

    cartKeyUpEvent(e) {
      const key = e.which || e.keyCode;

      if (key === theme.keyboardKeys.ESCAPE && this.cartDrawerIsOpen) {
        this.closeCartDrawer();
        this.popoverHide();
      }
    }

    /**
     * Disable checkout if terms not accepted
     *
     * @return  {Void}
     */

    termsAcceptance(event) {
      const termsNotAccepted = this.cartAcceptanceCheckbox.checked === false;
      const cartFormError = this.cart.querySelector(settings.elements.cartFormError);
      const cartButtonsFieldset = this.cart.querySelector(settings.elements.cartButtonsFieldset);

      // Disable form submit if terms and conditions are not accepted
      if (termsNotAccepted) {
        event.preventDefault();
        cartButtonsFieldset.setAttribute(settings.attributes.disabled, true);
        slideDown(cartFormError);
      } else {
        cartButtonsFieldset.removeAttribute(settings.attributes.disabled);
        slideUp(cartFormError);
      }
    }

    /**
     * Cart Popover
     *
     * @return  {Void}
     */

    renderPopover(product, qty) {
      const stripHtmlRegex = /(<([^>]+)>)/gi;
      let productTitle = product.title.replace(stripHtmlRegex, '');
      let item = {};
      let price = product.final_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(product.final_price, settings.formatMoney);
      let prodImg = theme.assets.no_image;
      let unitPrice = '';
      const sellingPlanName = product.selling_plan_allocation ? product.selling_plan_allocation.selling_plan.name : null;
      let properties = '';

      // Unit price
      if (product.unit_price_measurement) {
        unitPrice = `${themeCurrency.formatMoney(product.unit_price, settings.formatMoney)} / `;
        if (product.unit_price_measurement.reference_value != 1) {
          unitPrice += product.unit_price_measurement.reference_value;
        }
        unitPrice += product.unit_price_measurement.reference_unit;
      }

      // Product image
      if (product.featured_image != null) {
        prodImg = product.featured_image.url;
      }

      // Properties
      if (product.properties) {
        for (const property in product.properties) {
          if ({}.hasOwnProperty.call(product.properties, property)) {
            properties += '<p>' + property + ': ' + product.properties[property] + '</p>';
          }
        }
      }

      item = {
        item_count: qty,
        img: prodImg,
        product_title: productTitle,
        variation: product.product_has_only_default_variant ? false : product.variant_title,
        selling_plan_name: sellingPlanName,
        properties: properties,
        price: product.price,
        price_formatted: price,
        unit_price: unitPrice,
        free: product.price === 0,
      };

      return Sqrl__namespace.render(this.popoverTemplate, item);
    }

    popoverShow(product, quantity) {
      this.popover.innerHTML = this.renderPopover(product, quantity);
      this.popover.classList.add(settings.classes.visible);

      // clear popover timer, set at top of Cart object
      clearTimeout(this.popoverTimer);

      // set new instace of popoverTimer
      this.popoverTimer = setTimeout(() => {
        this.popoverHide();
      }, settings.times.closeDropdownAfter);
    }

    popoverHide() {
      this.popover.classList.remove(settings.classes.visible);
      setTimeout(() => {
        this.popover.innerHtml = '';
      }, 300);
    }

    /**
     * Cart event add product to cart
     *
     * @return  {Void}
     */

    addProductEvent() {
      document.addEventListener('click', (event) => {
        if (event.target.matches(settings.elements.buttonAddToCart)) {
          event.preventDefault();
          const button = event.target;

          if (button.hasAttribute(settings.attributes.disabled)) {
            return;
          }

          button.setAttribute(settings.attributes.disabled, true);
          this.form = button.closest('form');
          const quantity = this.form.querySelector(settings.elements.qty).value;
          let formData = new FormData(this.form);
          formData = new URLSearchParams(formData).toString();

          if (this.form.querySelector('[type="file"]')) {
            return;
          }

          this.addToCart(formData, null, button, quantity);

          document.dispatchEvent(
            new CustomEvent('theme:cart:add', {
              bubbles: true,
              detail: {
                selector: button,
              },
            })
          );
        }
      });
    }

    /**
     * Get response from the cart
     *
     * @return  {Void}
     */

    getCart() {
      fetch(theme.routes.root + 'cart.js')
        .then(this.handleErrors)
        .then((response) => response.json())
        .then((response) => {
          this.updateCounter(response.item_count);

          if (this.cart !== null) {
            this.newTotalItems = response.items.length;

            this.buildTotalPrice(response);
            this.freeShippingMessageHandle(response.total_price);
            this.subtotal = response.total_price;
          }

          return fetch(theme.routes.cart_url + '?section_id=api-cart-items');
        })
        .then((response) => response.text())
        .then((response) => {
          this.build(response);

          // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
          if (this.cartMessage) {
            this.updateProgress();
          }
        })
        .catch((error) => console.log(error));
    }

    /**
     * Add item(s) to the cart and show the added item(s)
     *
     * @param   {String}  data
     * @param   {DOM Element}  quickAddHolder
     * @param   {DOM Element}  button
     *
     * @return  {Void}
     */

    addToCart(data, quickAddHolder = null, button = null, quantity = 1) {
      fetch(theme.routes.root + 'cart/add.js', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            if (quickAddHolder !== null) {
              this.addToCartError(response, quickAddHolder.element, button);
            } else {
              this.addToCartError(response, null, button);
            }

            return;
          }

          if (this.ajaxEnabled) {
            this.cart !== null ? this.getCart() : this.renderCart();

            if (button) {
              button.classList.remove(settings.classes.loading);
              button.classList.add(settings.classes.success);
            }

            setTimeout(() => {
              if (button !== null) {
                button.removeAttribute(settings.attributes.disabled);
                button.classList.remove(settings.classes.success);
              }

              const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

              if (windowWidth >= theme.sizes.mobile) {
                this.popoverShow(response, quantity);
              }
            }, settings.times.timeoutAddProduct);
          } else {
            window.location.href = theme.routes.cart_url;
          }
        })
        .catch((error) => console.log(error));
    }

    /**
     * Update cart
     *
     * @param   {Object}  updateData
     *
     * @return  {Void}
     */

    updateCart(updateData = {}, holder = null, valueIsEmpty = false) {
      let newCount = null;
      let oldCount = null;
      let newItem = null;
      let settedQuantity = updateData.quantity;

      if (holder !== null) {
        holder.closest(settings.elements.item).classList.add(settings.classes.loading);
      }

      this.items.forEach((item) => {
        item.classList.add(settings.classes.disabled);
        item.querySelector(settings.elements.input).setAttribute(settings.attributes.disabled, true);
        item.querySelector(settings.elements.input).blur();
        item.querySelectorAll(settings.elements.button).forEach((button) => {
          button.setAttribute(settings.attributes.disabled, true);
        });
      });

      fetch(theme.routes.root + 'cart.js')
        .then(this.handleErrors)
        .then((response) => response.json())
        .then((response) => {
          const matchKeys = (item) => item.key === updateData.id;
          const index = response.items.findIndex(matchKeys);
          oldCount = response.item_count;
          newItem = response.items[index].title;

          const data = {
            line: `${index + 1}`,
            quantity: settedQuantity,
          };

          return fetch(theme.routes.root + 'cart/change.js', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
          });
        })
        .then(this.handleErrors)
        .then((response) => response.json())
        .then((response) => {
          newCount = response.item_count;

          if (valueIsEmpty) {
            settedQuantity = 1;
          }

          if (this.ajaxEnabled) {
            if (settedQuantity !== 0) {
              this.cartLimitErrorIsHidden = newCount !== oldCount;

              this.toggleLimitError(newItem);
            }

            this.updateCounter(newCount);

            // Change the cart total and hide message if missing discounts and the changed product is not deleted
            this.buildTotalPrice(response);
            this.freeShippingMessageHandle(response.total_price);
            this.cartDiscounts = response.total_discount;

            // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
            if (this.cartMessage) {
              this.subtotal = response.total_price;
              this.updateProgress();
            }

            this.getCart();
          } else {
            const form = this.buttonHolder.closest('form');
            response.items.forEach((item) => {
              if (item.key === updateData.id) {
                form.querySelector(`[${settings.attributes.dataId}="${item.key}"]`).value = item.quantity;
              }
            });
            form.submit();
          }
        })
        .catch((error) => console.log(error));
    }

    /**
     * Show/hide limit error
     *
     * @param   {String}  itemTitle
     *
     * @return  {Void}
     */

    toggleLimitError(itemTitle) {
      this.cartErrorHolder.querySelector(settings.elements.errorMessage).innerText = itemTitle;

      if (this.cartLimitErrorIsHidden) {
        slideUp(this.cartErrorHolder, 400);
      } else {
        slideDown(this.cartErrorHolder, 400);
      }
    }

    /**
     * Handle errors
     *
     * @param   {Object}  response
     *
     * @return  {Object}
     */

    handleErrors(response) {
      if (!response.ok) {
        return response.json().then(function (json) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            json: json,
          });
          throw e;
        });
      }
      return response;
    }

    /**
     * Add to cart error handle
     *
     * @param   {Object}  data
     * @param   {DOM Element/Null} quickAddHolder
     * @param   {DOM Element/Null} button
     *
     * @return  {Void}
     */

    addToCartError(data, quickAddHolder, button) {
      if (!this.ajaxEnabled) {
        return;
      }
      let errorContainer = this.popover;

      if (button !== null) {
        const addToCartText = button.querySelector(settings.elements.buttonAddToCartText);
        addToCartText.textContent = theme.translations.form_submit_error;
        button.setAttribute(settings.attributes.disabled, settings.attributes.disabled);

        setTimeout(() => {
          button.removeAttribute(settings.attributes.disabled);
          addToCartText.textContent = theme.translations.form_submit; // swap it back
        }, 1000);
      }

      clearTimeout(this.popoverTimer);

      if (errorContainer) {
        errorContainer.innerHTML = `<div class="popover-error">${data.message}: ${data.description}</div>`;

        errorContainer.classList.add(settings.classes.visible);
      }

      if (quickAddHolder) {
        this.html.dispatchEvent(
          new CustomEvent('theme:cart:add-error', {
            bubbles: true,
            detail: {
              message: data.message,
              description: data.description,
              holder: quickAddHolder,
            },
          })
        );
      }

      this.popoverTimer = setTimeout(() => {
        errorContainer.classList.remove(settings.classes.visible);
      }, settings.times.closeDropdownAfter);
    }

    /**
     * Open cart dropdown and add class on body
     *
     * @return  {Void}
     */

    openCartDrawer() {
      this.popoverHide();

      if (this.cart === null) {
        this.renderCart();
      }

      document.dispatchEvent(
        new CustomEvent('theme:drawer:close', {
          bubbles: false,
        })
      );

      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.cartScroll}));

      this.setCartClosePosition();
      this.body.classList.add(settings.classes.cartVisible);
      this.cart.classList.add(settings.classes.open);
      this.cartToggle.setAttribute(settings.attributes.expanded, true);
      this.accessibility.removeTrapFocus();
      this.cartDrawerIsOpen = true;

      // Reset cart focus timeout
      if (this.cartFocusTimeout) {
        clearTimeout(this.cartFocusTimeout);
      }

      // Focus first clickable element after drawer animation completes
      this.cartFocusTimeout = setTimeout(() => {
        this.accessibility.trapFocus(this.cart, {
          elementToFocus: this.cart.querySelector('a, button, input'),
        });
      }, 500);
    }

    /**
     * Close cart dropdown and remove class on body
     *
     * @return  {Void}
     */

    closeCartDrawer() {
      this.cartDrawerIsOpen = false;
      document.dispatchEvent(
        new CustomEvent('theme:cart-drawer:close', {
          bubbles: true,
        })
      );

      this.accessibility.removeTrapFocus();

      slideUp(this.cartErrorHolder, 400);

      if (this.body.classList.contains(settings.classes.focused)) {
        const button = document.querySelector(`${settings.elements.cartToggleElement}`);

        setTimeout(() => {
          button.focus();
        }, 200);
      }

      this.body.classList.remove(settings.classes.cartVisible);
      this.cart.classList.remove(settings.classes.open);
      this.cartToggle.setAttribute(settings.attributes.expanded, false);
      this.popoverHide();

      if (this.scrollLockTimeout) {
        clearTimeout(this.scrollLockTimeout);
      }

      // Unlock body scroll after animation completed to prevent content shifting
      this.scrollLockTimeout = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }, 500);
    }

    /**
     * Toggle cart dropdown
     *
     * @return  {Void}
     */

    toggleCartDrawer() {
      if (this.body.classList.contains(settings.classes.template)) {
        return;
      }

      this.cartDrawerIsOpen ? this.closeCartDrawer() : this.openCartDrawer();
    }

    /**
     * Event click to element to open cart dropdown
     *
     * @return  {Void}
     */

    eventToggleCart() {
      document.addEventListener('click', (event) => {
        const clickedElement = event.target;
        const isCartToggle = clickedElement.matches(settings.elements.cartToggleElement) || clickedElement.closest(settings.elements.cartToggleElement);
        const isPopover = clickedElement.matches(settings.elements.popover) || clickedElement.closest(settings.elements.popover);

        if (isCartToggle || isPopover) {
          this.toggleCartDrawer();
          event.preventDefault();
        }
      });
    }

    /**
     * Toggle classes on different containers and messages
     *
     * @return  {Void}
     */

    toggleClassesOnContainers() {
      this.emptyMessage.classList.toggle(settings.classes.hidden, this.hasItemsInCart());
      this.buttonHolder.classList.toggle(settings.classes.hidden, !this.hasItemsInCart());
      this.itemsHolder.classList.toggle(settings.classes.hidden, !this.hasItemsInCart());
    }

    /**
     * Build cart depends on results
     *
     * @param   {Object}  data
     *
     * @return  {Void}
     */

    build(data) {
      if (this.cart === null) {
        this.renderCart();
        return;
      }

      if (this.totalItems !== this.newTotalItems) {
        this.totalItems = this.newTotalItems;

        this.toggleClassesOnContainers();
      }

      const fresh = document.createElement('div');
      fresh.innerHTML = data;
      this.itemsHolder.innerHTML = fresh.querySelector(settings.elements.apiContent).innerHTML;

      this.cartEvents();
      this.initQuantity(this.ajaxEnabled);
    }

    /**
     * Update cart count
     *
     * @param   {Number}  countItems
     *
     * @return  {Void}
     */

    updateCounter(countItems) {
      if (countItems > 0) {
        this.cartToggle.classList.remove(settings.classes.cartEmpty);
      } else {
        this.cartToggle.classList.add(settings.classes.cartEmpty);
      }

      // Update cart icon counter
      if (this.cartItemsCount) {
        this.cartItemsCount.innerText = countItems < 10 ? countItems : '9+';
      }
    }

    /**
     * Check for items in the cart
     *
     * @return  {Void}
     */

    hasItemsInCart() {
      return this.totalItems > 0;
    }

    /**
     * Build total cart total price
     *
     * @param   {Object}  data
     *
     * @return  {Void}
     */

    buildTotalPrice(data) {
      if (this.cart !== null) {
        if (data.original_total_price > data.total_price && data.cart_level_discount_applications.length > 0) {
          this.cartOriginalTotal.classList.remove(settings.classes.hidden);
          this.cartOriginaTotalPrice.innerHTML = data.original_total_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(data.original_total_price, settings.formatMoney);
        } else {
          this.cartOriginalTotal.classList.add(settings.classes.hidden);
        }

        this.cartTotal.innerHTML = data.total_price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(data.total_price, settings.formatMoney);

        if (data.cart_level_discount_applications.length > 0) {
          const discountsMarkup = this.buildCartTotalDiscounts(data.cart_level_discount_applications);

          this.cartDiscountHolder.classList.remove(settings.classes.hidden);
          this.cartDiscountHolder.innerHTML = discountsMarkup;
        } else {
          this.cartDiscountHolder.classList.add(settings.classes.hidden);
        }
      }
    }

    /**
     * Build cart total discounts
     *
     * @param   {Array}  discounts
     *
     * @return  {String}
     */

    buildCartTotalDiscounts(discounts) {
      let discountMarkup = '';

      discounts.forEach((discount) => {
        discountMarkup += Sqrl__namespace.render(this.cartTotalDiscountTemplate, {
          discount_title: discount.title,
          discount_total_allocated_amount: themeCurrency.formatMoney(discount.total_allocated_amount, settings.formatMoney),
        });
      });

      return discountMarkup;
    }

    /**
     * Set cart close position
     *
     * @return  {Void}
     */

    setCartClosePosition() {
      if (this.cartToggle) {
        const cartToggleTop = this.cartToggle.getBoundingClientRect().top;
        const containerPadding = 40;

        this.cartClose.style.top = `${cartToggleTop - containerPadding}px`;
      }
    }

    /**
     * Show/hide free shipping message
     *
     * @param   {Number}  total
     *
     * @return  {Void}
     */

    freeShippingMessageHandle(total) {
      if (this.cartMessage) {
        document.querySelectorAll(settings.elements.cartMessageItem).forEach((message) => {
          const hasFreeShipping = message.hasAttribute(settings.elements.cartMessage) && message.getAttribute(settings.elements.cartMessage) === 'true' && total !== 0;
          const cartMessageClass = hasFreeShipping ? settings.classes.defaultSuccess : settings.classes.hidden;

          message.classList.remove(settings.classes.hidden); // reset hidden state on change
          message.classList.toggle(cartMessageClass, total >= this.cartFreeLimitShipping || total === 0);
        });
      }
    }

    /**
     * Cart bar progress with message for free shipping
     *
     * @param   {Number}  progress
     *
     */
    cartBarProgress(progress = null) {
      const cartProgress = document.querySelectorAll(settings.elements.cartProgress);

      cartProgress.forEach((element) => {
        const progressPercentage = progress === null ? element.getAttribute('data-percent') : progress;
        element.style.setProperty('--percent', progressPercentage);
      });
    }

    /**
     * Update progress when update cart
     *
     * @return  {Void}
     */

    updateProgress() {
      const newPercentValue = (this.subtotal / this.cartFreeLimitShipping) * 100;
      const leftToSpend = theme.settings.currencyCodeEnable
        ? themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, settings.formatMoneyWithCurrencyFormat)
        : themeCurrency.formatMoney(this.cartFreeLimitShipping - this.subtotal, settings.formatMoney);

      document.querySelectorAll(settings.elements.leftToSpend).forEach((element) => {
        element.innerHTML = leftToSpend.replace('.00', '').replace(',00', '');
      });

      this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
    }
  }

  window.cart = new CartDrawer();

  const showElement = (elem, removeProp = false, prop = 'block') => {
    if (elem) {
      if (removeProp) {
        elem.style.removeProperty('display');
      } else {
        elem.style.display = prop;
      }
    }
  };

  /* eslint-disable guard-for-in */

  const selectors$K = {
    saleClass: ' is-sale',
    soldClass: ' is-sold-out',
    apiContent: '[data-api-content]',
    productTemplate: '[data-product-template]',
  };

  Shopify.Products = (function () {
    const config = {
      howManyToShow: 4,
      howManyToStoreInMemory: 10,
      wrapperId: 'RecentlyViewed',
      onComplete: null,
    };

    let productHandleQueue = [];
    let wrapper = null;
    let howManyToShowItems = null;

    const cookie = {
      configuration: {
        expires: 90,
        path: '/',
        domain: window.location.hostname,
      },
      name: 'shopify_recently_viewed',
      write: function (recentlyViewed) {
        const recentlyViewedString = recentlyViewed.join(' ');
        document.cookie = `${this.name}=${recentlyViewedString}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
      },
      read: function () {
        let recentlyViewed = [];
        let cookieValue = null;
        const templateProduct = document.querySelector(selectors$K.productTemplate);

        if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
          cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith(this.name))
            .split('=')[1];
        }

        if (cookieValue !== null) {
          recentlyViewed = cookieValue.split(' ');
        }

        if (templateProduct) {
          const currentProduct = templateProduct.getAttribute('data-product-handle');

          // Remove current product from the array
          if (recentlyViewed.indexOf(currentProduct) != -1) {
            const currentProductIndex = recentlyViewed.indexOf(currentProduct);
            recentlyViewed.splice(currentProductIndex, 1);
          }
        }

        return recentlyViewed;
      },
      destroy: function () {
        const cookieVal = null;
        document.cookie = `${this.name}=${cookieVal}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
      },
      remove: function (productHandle) {
        const recentlyViewed = this.read();
        const position = recentlyViewed.indexOf(productHandle);
        if (position !== -1) {
          recentlyViewed.splice(position, 1);
          this.write(recentlyViewed);
        }
      },
    };

    const finalize = () => {
      showElement(wrapper, true);
      const cookieItemsLength = cookie.read().length;

      if (Shopify.recentlyViewed && howManyToShowItems && cookieItemsLength && cookieItemsLength < howManyToShowItems && wrapper.children.length) {
        let allClassesArr = [];
        let addClassesArr = [];
        let objCounter = 0;

        for (const property in Shopify.recentlyViewed) {
          objCounter += 1;
          const objString = Shopify.recentlyViewed[property];
          const objArr = objString.split(' ');
          const propertyIdx = parseInt(property.split('_')[1]);
          allClassesArr = [...allClassesArr, ...objArr];

          if (cookie.read().length === propertyIdx || (objCounter === Object.keys(Shopify.recentlyViewed).length && !addClassesArr.length)) {
            addClassesArr = [...addClassesArr, ...objArr];
          }
        }

        for (let i = 0; i < wrapper.children.length; i++) {
          const element = wrapper.children[i];
          if (allClassesArr.length) {
            element.classList.remove(...allClassesArr);
          }

          if (addClassesArr.length) {
            element.classList.add(...addClassesArr);
          }
        }
      }

      // If we have a callback.
      if (config.onComplete) {
        try {
          config.onComplete();
        } catch (error) {
          console.log('error: ', error);
        }
      }
    };

    const moveAlong = (shown) => {
      if (productHandleQueue.length && shown < config.howManyToShow) {
        fetch('/products/' + productHandleQueue[0] + '?section_id=api-product-grid-item')
          .then((response) => response.text())
          .then((product) => {
            const fresh = document.createElement('div');
            fresh.innerHTML = product;

            wrapper.innerHTML += fresh.querySelector(selectors$K.apiContent).innerHTML;

            productHandleQueue.shift();
            shown++;
            moveAlong(shown);
          })
          .catch(() => {
            cookie.remove(productHandleQueue[0]);
            productHandleQueue.shift();
            moveAlong(shown);
          });
      } else {
        finalize();
      }
    };

    return {
      showRecentlyViewed: function (params) {
        const paramsNew = params || {};
        const shown = 0;

        // Update defaults.
        Object.assign(config, paramsNew);

        // Read cookie.
        productHandleQueue = cookie.read();

        // Template and element where to insert.
        wrapper = document.querySelector(`#${config.wrapperId}`);

        // How many products to show.
        howManyToShowItems = config.howManyToShow;
        config.howManyToShow = Math.min(productHandleQueue.length, config.howManyToShow);

        // If we have any to show.
        if (config.howManyToShow && wrapper) {
          // Getting each product with an Ajax call and rendering it on the page.
          moveAlong(shown);
        }
      },

      getConfig: function () {
        return config;
      },

      clearList: function () {
        cookie.destroy();
      },

      recordRecentlyViewed: function (params) {
        const paramsNew = params || {};

        // Update defaults.
        Object.assign(config, paramsNew);

        // Read cookie.
        let recentlyViewed = cookie.read();

        // If we are on a product page.
        if (window.location.pathname.indexOf('/products/') !== -1) {
          // What is the product handle on this page.
          const productHandle = decodeURIComponent(window.location.pathname)
            .match(
              /\/products\/([a-z0-9\-]|[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[\u203B]|[\w\u0430-\u044f]|[\u0400-\u04FF]|[\u0900-\u097F]|[\u0590-\u05FF\u200f\u200e]|[\u0621-\u064A\u0660-\u0669 ])+/
            )[0]
            .split('/products/')[1];
          // In what position is that product in memory.
          const position = recentlyViewed.indexOf(productHandle);

          // If not in memory.
          if (position === -1) {
            // Add product at the start of the list.
            recentlyViewed.unshift(productHandle);
            // Only keep what we need.
            recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
          } else {
            // Remove the product and place it at start of list.
            recentlyViewed.splice(position, 1);
            recentlyViewed.unshift(productHandle);
          }

          // Update cookie.
          cookie.write(recentlyViewed);
        }
      },

      hasProducts: cookie.read().length > 0,
    };
  })();

  Sqrl__namespace.filters.define('handle', function (str) {
    str = str.toLowerCase();

    var toReplace = ['"', "'", '\\', '(', ')', '[', ']'];

    // For the old browsers
    for (var i = 0; i < toReplace.length; ++i) {
      str = str.replace(toReplace[i], '');
    }

    str = str.replace(/\W+/g, '-');

    if (str.charAt(str.length - 1) == '-') {
      str = str.replace(/-+\z/, '');
    }

    if (str.charAt(0) == '-') {
      str = str.replace(/\A-+/, '');
    }

    return str;
  });

  Sqrl__namespace.filters.define('last', function (str) {
    const words = str.split('-');
    return words[words.length - 1];
  });

  Sqrl__namespace.filters.define('asset_url', function (str) {
    let asset = theme.assets.image;
    asset = asset.replace('image', str);
    return asset;
  });

  const selectors$J = {
    inputSearch: 'input[type="search"]',
  };

  class MainSearch extends HeaderSearchForm {
    constructor() {
      super();

      this.allSearchInputs = document.querySelectorAll(selectors$J.inputSearch);
      this.setupEventListeners();
    }

    setupEventListeners() {
      let allSearchForms = [];
      this.allSearchInputs.forEach((input) => allSearchForms.push(input.form));
      this.input.addEventListener('focus', this.onInputFocus.bind(this));
      if (allSearchForms.length < 2) return;
      allSearchForms.forEach((form) => form.addEventListener('reset', this.onFormReset.bind(this)));
      this.allSearchInputs.forEach((input) => input.addEventListener('input', this.onInput.bind(this)));
    }

    onFormReset(event) {
      super.onFormReset(event);
      if (super.shouldResetForm()) {
        this.keepInSync('', this.input);
      }
    }

    onInput(event) {
      const target = event.target;
      this.keepInSync(target.value, target);
    }

    onInputFocus() {
      if (!isDesktop()) {
        this.scrollIntoView({behavior: 'smooth'});
      }
    }

    keepInSync(value, target) {
      this.allSearchInputs.forEach((input) => {
        if (input !== target) {
          input.value = value;
        }
      });
    }
  }

  customElements.define('main-search', MainSearch);

  const selectors$I = {
    details: 'details',
    input: 'input:not([type="hidden"])',
    popdown: '[data-popdown]',
    popdownClose: '[data-popdown-close]',
    popdownToggle: '[data-popdown-toggle]',
    predictiveSearch: 'predictive-search',
  };

  const attributes$6 = {
    popdownUnderlay: 'data-popdown-underlay',
  };

  const classes$v = {
    searchPopdownVisible: 'has-search-popdown-visible',
  };

  class SearchPopdown extends HTMLElement {
    constructor() {
      super();
      this.popdown = this.querySelector(selectors$I.popdown);
      this.popdownContainer = this.querySelector(selectors$I.details);
      this.popdownToggle = this.querySelector(selectors$I.popdownToggle);
      this.popdownClose = this.querySelector(selectors$I.popdownClose);
      this.a11y = a11y;
    }

    connectedCallback() {
      this.popdownContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
      this.popdownClose.addEventListener('click', this.close.bind(this));
      this.popdownToggle.addEventListener('click', this.onPopdownToggleClick.bind(this));
      this.popdownToggle.setAttribute('role', 'button');
      this.popdown.addEventListener('transitionend', (event) => {
        if (event.propertyName == 'visibility' && this.popdownContainer.hasAttribute('open') && this.popdownContainer.getAttribute('open') == 'false') {
          this.closeCallback();
        }
      });
    }

    onPopdownToggleClick(event) {
      event.preventDefault();
      event.target.closest(selectors$I.details).hasAttribute('open') ? this.close() : this.open(event);
    }

    onBodyClick(event) {
      if (!this.contains(event.target) || event.target.hasAttribute(attributes$6.popdownUnderlay)) this.close();
    }

    open(event) {
      this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
      event.target.closest(selectors$I.details).setAttribute('open', '');

      document.body.addEventListener('click', this.onBodyClickEvent);
      document.body.classList.add(classes$v.searchPopdownVisible);
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.popdown}));

      // Safari opening transition fix
      requestAnimationFrame(() => {
        event.target.closest(selectors$I.details).setAttribute('open', 'true');

        // Trap focus after opening transition ends
        this.popdown.addEventListener(
          'transitionend',
          (e) => {
            if (e.target == this.popdown) {
              this.a11y.trapFocus(this.popdown, {
                elementToFocus: this.popdown.querySelector(selectors$I.input),
              });
              theme.a11yTrigger = event.target;
            }
          },
          {once: true}
        );
      });
    }

    close() {
      this.popdownContainer.setAttribute('open', 'false');

      document.body.removeEventListener('click', this.onBodyClickEvent);
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    closeCallback() {
      this.popdownContainer.removeAttribute('open');
      this.a11y.removeTrapFocus();
      if (theme.a11yTrigger !== null) {
        theme.a11yTrigger.focus();
      }

      document.body.classList.remove(classes$v.searchPopdownVisible);
    }
  }

  customElements.define('header-search-popdown', SearchPopdown);

  window.isYoutubeAPILoaded = false;
  function loadYoutubeAPI() {
    if (!window.isYoutubeAPILoaded) {
      // Load Youtube API script
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }
  function onYouTubeIframeAPIReady() {
    window.isYoutubeAPILoaded = true;
    document.body.dispatchEvent(new CustomEvent('theme:youtube:api-ready'));
  }

  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  window.loadYoutubeAPI = loadYoutubeAPI;

  theme.ProductModel = (function () {
    let modelJsonSections = {};
    let models = {};
    let xrButtons = {};
    const selectors = {
      productMediaWrapper: '[data-product-single-media-wrapper]',
      productXr: '[data-shopify-xr]',
      dataMediaId: 'data-media-id',
      dataModelId: 'data-model-id',
      dataModel3d: 'data-shopify-model3d-id',
      modelViewer: 'model-viewer',
      modelJson: '#ModelJson-',
      classMediaHidden: 'media--hidden',
      deferredMedia: '[data-deferred-media]',
      deferredMediaButton: '[data-deferred-media-button]',
    };
    const classes = {
      isLoading: 'is-loading',
    };

    function init(mediaContainer, sectionId) {
      modelJsonSections[sectionId] = {
        loaded: false,
      };

      const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

      if (deferredMediaButton) {
        deferredMediaButton.addEventListener('click', loadContent.bind(this, mediaContainer, sectionId));
      }
    }

    function loadContent(mediaContainer, sectionId) {
      if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute('loaded')) {
        return;
      }

      mediaContainer.classList.add(classes.isLoading);
      const content = document.createElement('div');
      content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
      const modelViewerElement = content.querySelector('model-viewer');
      const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
      deferredMedia.appendChild(modelViewerElement).focus();
      deferredMedia.setAttribute('loaded', true);
      const mediaId = mediaContainer.dataset.mediaId;
      const modelId = modelViewerElement.dataset.modelId;
      const xrButton = mediaContainer.closest(selectors.productMediaWrapper).querySelector(selectors.productXr);
      xrButtons[sectionId] = {
        element: xrButton,
        defaultId: modelId,
      };

      models[mediaId] = {
        modelId: modelId,
        mediaId: mediaId,
        sectionId: sectionId,
        container: mediaContainer,
        element: modelViewerElement,
      };

      window.Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: setupShopifyXr,
        },
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: setupModelViewerUi,
        },
      ]);
    }

    function setupShopifyXr(errors) {
      if (errors) {
        console.warn(errors);
        return;
      }
      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', function () {
          setupShopifyXr();
        });
        return;
      }

      for (const sectionId in modelJsonSections) {
        if (modelJsonSections.hasOwnProperty(sectionId)) {
          const modelSection = modelJsonSections[sectionId];
          if (modelSection.loaded) {
            continue;
          }

          const modelJson = document.querySelector(`${selectors.modelJson}${sectionId}`);
          if (modelJson) {
            window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
            modelSection.loaded = true;
          }
        }
      }
      window.ShopifyXR.setupXRElements();
    }

    function setupModelViewerUi(errors) {
      if (errors) {
        console.warn(errors);
        return;
      }

      for (const key in models) {
        if (models.hasOwnProperty(key)) {
          const model = models[key];
          if (!model.modelViewerUi) {
            model.modelViewerUi = new Shopify.ModelViewerUI(model.element);
          }
          setupModelViewerListeners(model);
        }
      }
    }

    function setupModelViewerListeners(model) {
      const xrButton = xrButtons[model.sectionId];

      model.container.addEventListener('theme:media:visible', function () {
        if (xrButton.element) {
          xrButton.element.setAttribute(selectors.dataModel3d, model.modelId);
        }

        pauseOtherMedia(model.mediaId);

        if (window.theme.touched) {
          return;
        }
        model.modelViewerUi.play();
      });

      model.container.addEventListener('theme:media:hidden', function () {
        model.modelViewerUi.pause();
      });

      model.container.addEventListener('theme:xr-launch', function () {
        model.modelViewerUi.pause();
      });

      model.element.addEventListener('load', () => {
        model.container.classList.remove(classes.isLoading);
      });

      model.element.addEventListener('shopify_model_viewer_ui_toggle_play', function () {
        pauseOtherMedia(model.mediaId);
      });
    }

    function pauseOtherMedia(mediaId) {
      const mediaIdString = `[${selectors.dataMediaId}="${mediaId}"]`;
      const currentMedia = document.querySelector(`${selectors.productMediaWrapper}${mediaIdString}`);
      const otherMedia = document.querySelectorAll(`${selectors.productMediaWrapper}:not(${mediaIdString})`);

      currentMedia.classList.remove(selectors.classMediaHidden);
      if (otherMedia.length) {
        otherMedia.forEach((element) => {
          element.dispatchEvent(new CustomEvent('theme:media:hidden'));
          element.classList.add(selectors.classMediaHidden);
        });
      }
    }

    function removeSectionModels(sectionId) {
      for (const key in models) {
        if (models.hasOwnProperty(key)) {
          const model = models[key];
          if (model.sectionId === sectionId) {
            delete models[key];
          }
        }
      }
      delete modelJsonSections[sectionId];
      delete theme.mediaInstances[sectionId];
    }

    return {
      init: init,
      loadContent: loadContent,
      removeSectionModels: removeSectionModels,
    };
  })();

  const selectors$H = {
    templateAddresses: '.template-customers-addresses',
    accountForm: '[data-form]',
    addressNewForm: '[data-form-new]',
    btnNew: '[data-button-new]',
    btnEdit: '[data-button-edit]',
    btnDelete: '[data-button-delete]',
    btnCancel: '[data-button-cancel]',
    dataFormId: 'data-form-id',
    editAddress: 'data-form-edit',
    addressCountryNew: 'AddressCountryNew',
    addressProvinceNew: 'AddressProvinceNew',
    addressProvinceContainerNew: 'AddressProvinceContainerNew',
    addressCountryOption: '[data-country-option]',
    addressCountry: 'AddressCountry',
    addressProvince: 'AddressProvince',
    addressProvinceContainer: 'AddressProvinceContainer',
    notOptionalInputs: 'input[type="text"]:not(.optional)',
  };

  const classes$u = {
    hidden: 'is-hidden',
    validation: 'validation--showup',
  };

  class Addresses {
    constructor(section) {
      this.section = section;
      this.addressNewForm = this.section.querySelector(selectors$H.addressNewForm);
      this.accountForms = this.section.querySelectorAll(selectors$H.accountForm);

      this.init();
      this.validate();
    }

    init() {
      if (this.addressNewForm) {
        const section = this.section;
        const newAddressForm = this.addressNewForm;
        this.customerAddresses();

        const newButtons = section.querySelectorAll(selectors$H.btnNew);
        if (newButtons.length) {
          newButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              button.classList.add(classes$u.hidden);
              newAddressForm.classList.remove(classes$u.hidden);
            });
          });
        }

        const editButtons = section.querySelectorAll(selectors$H.btnEdit);
        if (editButtons.length) {
          editButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              const formId = this.getAttribute(selectors$H.dataFormId);
              section.querySelector(`[${selectors$H.editAddress}="${formId}"]`).classList.toggle(classes$u.hidden);
            });
          });
        }

        const deleteButtons = section.querySelectorAll(selectors$H.btnDelete);
        if (deleteButtons.length) {
          deleteButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              const formId = this.getAttribute(selectors$H.dataFormId);
              if (confirm(theme.translations.delete_confirm)) {
                Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
              }
            });
          });
        }

        const cancelButtons = section.querySelectorAll(selectors$H.btnCancel);
        if (cancelButtons.length) {
          cancelButtons.forEach((button) => {
            button.addEventListener('click', function (e) {
              e.preventDefault();
              this.closest(selectors$H.accountForm).classList.add(classes$u.hidden);
              document.querySelector(selectors$H.btnNew).classList.remove(classes$u.hidden);
            });
          });
        }
      }
    }

    customerAddresses() {
      // Initialize observers on address selectors, defined in shopify_common.js
      if (Shopify.CountryProvinceSelector) {
        new Shopify.CountryProvinceSelector(selectors$H.addressCountryNew, selectors$H.addressProvinceNew, {
          hideElement: selectors$H.addressProvinceContainerNew,
        });
      }

      // Initialize each edit form's country/province selector
      const countryOptions = this.section.querySelectorAll(selectors$H.addressCountryOption);
      countryOptions.forEach((element) => {
        const formId = element.getAttribute(selectors$H.dataFormId);
        const countrySelector = `${selectors$H.addressCountry}_${formId}`;
        const provinceSelector = `${selectors$H.addressProvince}_${formId}`;
        const containerSelector = `${selectors$H.addressProvinceContainer}_${formId}`;

        new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
          hideElement: containerSelector,
        });
      });
    }

    validate() {
      this.accountForms.forEach((accountForm) => {
        const form = accountForm.querySelector('form');
        const inputs = form.querySelectorAll(selectors$H.notOptionalInputs);

        form.addEventListener('submit', (event) => {
          let isEmpty = false;

          // Display notification if input is empty
          inputs.forEach((input) => {
            if (!input.value) {
              input.nextElementSibling.classList.add(classes$u.validation);
              isEmpty = true;
            } else {
              input.nextElementSibling.classList.remove(classes$u.validation);
            }
          });

          if (isEmpty) {
            event.preventDefault();
          }
        });
      });
    }
  }

  const template = document.querySelector(selectors$H.templateAddresses);
  if (template) {
    new Addresses(template);
  }

  const selectors$G = {
    form: '[data-account-form]',
    showReset: '[data-show-reset]',
    hideReset: '[data-hide-reset]',
    recover: '[data-recover-password]',
    login: '[data-login-form]',
    recoverHash: '#recover',
  };

  const classes$t = {
    hidden: 'is-hidden',
  };

  class Login {
    constructor(form) {
      this.form = form;
      this.showButton = form.querySelector(selectors$G.showReset);
      this.hideButton = form.querySelector(selectors$G.hideReset);
      this.recover = form.querySelector(selectors$G.recover);
      this.login = form.querySelector(selectors$G.login);
      this.init();
    }

    init() {
      if (window.location.hash == selectors$G.recoverHash) {
        this.showRecoverPasswordForm();
      } else {
        this.hideRecoverPasswordForm();
      }
      this.showButton.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          this.showRecoverPasswordForm();
        }.bind(this),
        false
      );
      this.hideButton.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          this.hideRecoverPasswordForm();
        }.bind(this),
        false
      );
    }

    showRecoverPasswordForm() {
      this.recover.classList.remove(classes$t.hidden);
      this.login.classList.add(classes$t.hidden);
      window.location.hash = selectors$G.recoverHash;
      return false;
    }

    hideRecoverPasswordForm() {
      this.login.classList.remove(classes$t.hidden);
      this.recover.classList.add(classes$t.hidden);
      window.location.hash = '';
      return false;
    }
  }

  const loginForm = document.querySelector(selectors$G.form);
  if (loginForm) {
    new Login(loginForm);
  }

  window.Shopify = window.Shopify || {};
  window.Shopify.theme = window.Shopify.theme || {};
  window.Shopify.theme.sections = window.Shopify.theme.sections || {};

  window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
  window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
  const registered = window.Shopify.theme.sections.registered;
  const instances = window.Shopify.theme.sections.instances;

  const selectors$F = {
    id: 'data-section-id',
    type: 'data-section-type',
  };

  class Registration {
    constructor(type = null, components = []) {
      this.type = type;
      this.components = validateComponentsArray(components);
      this.callStack = {
        onLoad: [],
        onUnload: [],
        onSelect: [],
        onDeselect: [],
        onBlockSelect: [],
        onBlockDeselect: [],
        onReorder: [],
      };
      components.forEach((comp) => {
        for (const [key, value] of Object.entries(comp)) {
          const arr = this.callStack[key];
          if (Array.isArray(arr) && typeof value === 'function') {
            arr.push(value);
          } else {
            console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
            console.warn(value);
          }
        }
      });
    }

    getStack() {
      return this.callStack;
    }
  }

  class Section {
    constructor(container, registration) {
      this.container = validateContainerElement(container);
      this.id = container.getAttribute(selectors$F.id);
      this.type = registration.type;
      this.callStack = registration.getStack();

      try {
        this.onLoad();
      } catch (e) {
        console.warn(`Error in section: ${this.id}`);
        console.warn(this);
        console.warn(e);
      }
    }

    callFunctions(key, e = null) {
      this.callStack[key].forEach((func) => {
        const props = {
          id: this.id,
          type: this.type,
          container: this.container,
        };
        if (e) {
          func.call(props, e);
        } else {
          func.call(props);
        }
      });
    }

    onLoad() {
      this.callFunctions('onLoad');
    }

    onUnload() {
      this.callFunctions('onUnload');
    }

    onSelect(e) {
      this.callFunctions('onSelect', e);
    }

    onDeselect(e) {
      this.callFunctions('onDeselect', e);
    }

    onBlockSelect(e) {
      this.callFunctions('onBlockSelect', e);
    }

    onBlockDeselect(e) {
      this.callFunctions('onBlockDeselect', e);
    }

    onReorder(e) {
      this.callFunctions('onReorder', e);
    }
  }

  function validateContainerElement(container) {
    if (!(container instanceof Element)) {
      throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
    }
    if (container.getAttribute(selectors$F.id) === null) {
      throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$F.id + ' attribute.');
    }

    return container;
  }

  function validateComponentsArray(value) {
    if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
      throw new TypeError('Theme Sections: The components object provided is not a valid');
    }

    return value;
  }

  /*
   * @shopify/theme-sections
   * -----------------------------------------------------------------------------
   *
   * A framework to provide structure to your Shopify sections and a load and unload
   * lifecycle. The lifecycle is automatically connected to theme editor events so
   * that your sections load and unload as the editor changes the content and
   * settings of your sections.
   */

  function register(type, components) {
    if (typeof type !== 'string') {
      throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
    }

    if (typeof registered[type] !== 'undefined') {
      throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
    }

    if (!Array.isArray(components)) {
      components = [components];
    }

    const section = new Registration(type, components);
    registered[type] = section;

    return registered;
  }

  function load(types, containers) {
    types = normalizeType(types);

    if (typeof containers === 'undefined') {
      containers = document.querySelectorAll('[' + selectors$F.type + ']');
    }

    containers = normalizeContainers(containers);

    types.forEach(function (type) {
      const registration = registered[type];

      if (typeof registration === 'undefined') {
        return;
      }

      containers = containers.filter(function (container) {
        // Filter from list of containers because container already has an instance loaded
        if (isInstance(container)) {
          return false;
        }

        // Filter from list of containers because container doesn't have data-section-type attribute
        if (container.getAttribute(selectors$F.type) === null) {
          return false;
        }

        // Keep in list of containers because current type doesn't match
        if (container.getAttribute(selectors$F.type) !== type) {
          return true;
        }

        instances.push(new Section(container, registration));

        // Filter from list of containers because container now has an instance loaded
        return false;
      });
    });
  }

  function reorder(selector) {
    var instancesToReorder = getInstances(selector);

    instancesToReorder.forEach(function (instance) {
      instance.onReorder();
    });
  }

  function unload(selector) {
    var instancesToUnload = getInstances(selector);

    instancesToUnload.forEach(function (instance) {
      var index = instances
        .map(function (e) {
          return e.id;
        })
        .indexOf(instance.id);
      instances.splice(index, 1);
      instance.onUnload();
    });
  }

  function getInstances(selector) {
    var filteredInstances = [];

    // Fetch first element if its an array
    if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
      var firstElement = selector[0];
    }

    // If selector element is DOM element
    if (selector instanceof Element || firstElement instanceof Element) {
      var containers = normalizeContainers(selector);

      containers.forEach(function (container) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.container === container;
          })
        );
      });

      // If select is type string
    } else if (typeof selector === 'string' || typeof firstElement === 'string') {
      var types = normalizeType(selector);

      types.forEach(function (type) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.type === type;
          })
        );
      });
    }

    return filteredInstances;
  }

  function getInstanceById(id) {
    var instance;

    for (var i = 0; i < instances.length; i++) {
      if (instances[i].id === id) {
        instance = instances[i];
        break;
      }
    }
    return instance;
  }

  function isInstance(selector) {
    return getInstances(selector).length > 0;
  }

  function normalizeType(types) {
    // If '*' then fetch all registered section types
    if (types === '*') {
      types = Object.keys(registered);

      // If a single section type string is passed, put it in an array
    } else if (typeof types === 'string') {
      types = [types];

      // If single section constructor is passed, transform to array with section
      // type string
    } else if (types.constructor === Section) {
      types = [types.prototype.type];

      // If array of typed section constructors is passed, transform the array to
      // type strings
    } else if (Array.isArray(types) && types[0].constructor === Section) {
      types = types.map(function (Section) {
        return Section.type;
      });
    }

    types = types.map(function (type) {
      return type.toLowerCase();
    });

    return types;
  }

  function normalizeContainers(containers) {
    // Nodelist with entries
    if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
      containers = Array.prototype.slice.call(containers);

      // Empty Nodelist
    } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
      containers = [];

      // Handle null (document.querySelector() returns null with no match)
    } else if (containers === null) {
      containers = [];

      // Single DOM element
    } else if (!Array.isArray(containers) && containers instanceof Element) {
      containers = [containers];
    }

    return containers;
  }

  if (window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$F.id + '="' + id + '"]');

      if (container !== null) {
        load(container.getAttribute(selectors$F.type), container);
      }
    });

    document.addEventListener('shopify:section:reorder', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$F.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        reorder(container);
      }
    });

    document.addEventListener('shopify:section:unload', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$F.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        unload(container);
      }
    });

    document.addEventListener('shopify:section:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onSelect(event);
      }
    });

    document.addEventListener('shopify:section:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onDeselect(event);
      }
    });

    document.addEventListener('shopify:block:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockSelect(event);
      }
    });

    document.addEventListener('shopify:block:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockDeselect(event);
      }
    });
  }

  const selectors$E = {
    frame: '[data-ticker-frame]',
    scale: '[data-ticker-scale]',
    text: '[data-ticker-text]',
    clone: 'data-clone',
    moveTime: 1.63, // 100px going to move for 1.63s
    space: 100, // 100px
  };

  const classes$s = {
    tickerAnimated: 'ticker--animated',
    tickerUnloaded: 'ticker--unloaded',
    tickerComparator: 'ticker__comparator',
  };

  class Ticker {
    constructor(el, stopClone = false) {
      this.frame = el;
      this.stopClone = stopClone;
      this.scale = this.frame.querySelector(selectors$E.scale);
      this.text = this.frame.querySelector(selectors$E.text);

      this.comparator = this.text.cloneNode(true);
      this.comparator.classList.add(classes$s.tickerComparator);
      this.frame.appendChild(this.comparator);
      this.scale.classList.remove(classes$s.tickerUnloaded);
      this.checkWidthOnResize = debounce(() => this.checkWidth(), 100);
      this.listen();
    }

    listen() {
      document.addEventListener('theme:resize', this.checkWidthOnResize);
      this.checkWidth();
    }

    checkWidth() {
      const padding = window.getComputedStyle(this.frame).paddingLeft.replace('px', '') * 2;

      if (this.frame.clientWidth - padding < this.text.clientWidth || this.stopClone) {
        this.text.classList.add(classes$s.tickerAnimated);
        if (this.scale.childElementCount === 1) {
          this.clone = this.text.cloneNode(true);
          this.clone.setAttribute(selectors$E.clone, '');
          this.scale.appendChild(this.clone);

          if (this.stopClone) {
            for (let index = 0; index < 10; index++) {
              const cloneSecond = this.text.cloneNode(true);
              cloneSecond.setAttribute(selectors$E.clone, '');
              this.scale.appendChild(cloneSecond);
            }
          }

          const animationTimeFrame = (this.text.clientWidth / selectors$E.space) * selectors$E.moveTime;

          this.scale.style.setProperty('--animation-time', `${animationTimeFrame}s`);
        }
      } else {
        this.text.classList.add(classes$s.tickerAnimated);
        let clone = this.scale.querySelector(`[${selectors$E.clone}]`);
        if (clone) {
          this.scale.removeChild(clone);
        }
        this.text.classList.remove(classes$s.tickerAnimated);
      }
    }

    unload() {
      document.removeEventListener('theme:resize', this.checkWidthOnResize);
    }
  }

  const selectors$D = {
    slider: '[data-slider]',
    slide: '[data-slide]',
    slideValue: 'data-slide',
    dataAutoplay: 'data-autoplay',
    dataAutoplaySpeed: 'data-speed',
    dataWatchCss: 'data-watch-css',
    dataDraggable: 'data-draggable',
    dataSlideIndex: 'data-slide-index',
    dataSliderStartIndex: 'data-slider-start-index',
    dataArrowPositionMiddle: 'data-arrow-position-middle',
    dataFade: 'data-fade',
  };

  const classes$r = {
    classIsSelected: 'is-selected',
    classSliderInitialized: 'js-slider--initialized',
    classSliderArrowsHidden: 'flickity-button-hide',
  };

  class Slider {
    constructor(container, slideshow = null) {
      this.container = container;
      this.slideshow = slideshow || this.container.querySelector(selectors$D.slider);

      if (!this.slideshow) {
        return;
      }

      this.slideshowSlides = this.slideshow.querySelectorAll(selectors$D.slide);
      this.autoPlay = this.slideshow.getAttribute(selectors$D.dataAutoplay) === 'true';
      this.autoPlaySpeed = this.slideshow.getAttribute(selectors$D.dataAutoplaySpeed);
      this.infinite = this.slideshow.getAttribute(selectors$D.dataInfinite) !== 'false';
      this.watchCss = this.slideshow.getAttribute(selectors$D.dataWatchCss) === 'true';
      this.draggable = this.slideshow.getAttribute(selectors$D.dataDraggable) !== 'false';
      this.sliderStartIndex = this.slideshow.hasAttribute(selectors$D.dataSliderStartIndex);
      this.fade = this.slideshow.getAttribute(selectors$D.dataFade) === 'true';

      this.flkty = null;
      this.init();
    }

    init() {
      const sliderOptions = {
        initialIndex: this.sliderStartIndex ? parseInt(this.slideshow.getAttribute(selectors$D.dataSliderStartIndex)) : 0,
        autoPlay: this.autoPlay && this.autoPlaySpeed ? parseInt(this.autoPlaySpeed) : false,
        contain: true,
        pageDots: false,
        wrapAround: this.infinite,
        percentPosition: this.percentPosition,
        watchCSS: this.watchCss,
        draggable: this.draggable ? '>1' : false,
        on: {
          ready: () => {
            setTimeout(() => {
              this.slideshow.parentNode.dispatchEvent(
                new CustomEvent('theme:slider:loaded', {
                  bubbles: true,
                  detail: {
                    slider: this,
                  },
                })
              );
            }, 10);

            if (this.slideshow.classList.contains(classes$r.classIsSelected)) {
              this.slideshow.classList.remove(classes$r.classIsSelected);
            }
          },
        },
      };

      if (this.fade) {
        sliderOptions.fade = true;
        this.flkty = new FlickityFade(this.slideshow, sliderOptions);
      }

      if (!this.fade) {
        this.flkty = new Flickity(this.slideshow, sliderOptions);
      }
    }

    onUnload() {
      if (this.slideshow && this.flkty) {
        this.flkty.options.watchCSS = false;
        this.flkty.destroy();
      }
    }

    onBlockSelect(evt) {
      if (!this.slideshow) {
        return;
      }
      // Ignore the cloned version
      const slide = this.slideshow.querySelector(`[${selectors$D.slideValue}="${evt.detail.blockId}"]`);

      if (!slide) {
        return;
      }
      let slideIndex = parseInt(slide.getAttribute(selectors$D.dataSlideIndex));

      if (this.multipleSlides && !this.slideshow.classList.contains(classes$r.classSliderInitialized)) {
        slideIndex = 0;
      }

      this.slideshow.classList.add(classes$r.classIsSelected);

      // Go to selected slide, pause autoplay
      this.flkty.selectCell(slideIndex);
      this.flkty.stopPlayer();
    }

    onBlockDeselect() {
      if (!this.slideshow) {
        return;
      }
      this.slideshow.classList.remove(classes$r.classIsSelected);

      if (!this.autoPlay) {
        return;
      }
      this.flkty.playPlayer();
    }
  }

  const selectors$C = {
    bar: '[data-bar]',
    barSlide: '[data-slide]',
    frame: '[data-ticker-frame]',
    header: '[data-header-wrapper]',
    slider: '[data-slider]',
    slideValue: 'data-slide',
    tickerScale: '[data-ticker-scale]',
    tickerText: '[data-ticker-text]',
  };

  const attributes$5 = {
    dataStop: 'data-stop',
    style: 'style',
    dataTargetReferrer: 'data-target-referrer',
  };

  const classes$q = {
    tickerAnimated: 'ticker--animated',
  };

  const sections$k = {};

  class Bar {
    constructor(holder) {
      this.barHolder = holder;
      this.locationPath = location.href;

      this.slides = this.barHolder.querySelectorAll(selectors$C.barSlide);
      this.slider = this.barHolder.querySelector(selectors$C.slider);

      this.init();
    }

    init() {
      this.removeAnnouncement();

      if (this.slider) {
        this.initSliders();
      }

      if (!this.slider) {
        this.initTickers(true);
      }
    }

    /**
     * Delete announcement which has a target referrer attribute and it is not contained in page URL
     */
    removeAnnouncement() {
      for (let index = 0; index < this.slides.length; index++) {
        const element = this.slides[index];

        if (!element.hasAttribute(attributes$5.dataTargetReferrer)) {
          continue;
        }

        if (this.locationPath.indexOf(element.getAttribute(attributes$5.dataTargetReferrer)) === -1 && !window.Shopify.designMode) {
          element.parentNode.removeChild(element);
        }
      }
    }

    /**
     * Init slider
     */
    initSliders() {
      this.slider = new Slider(this.barHolder);
      this.slider.flkty.reposition();

      this.barHolder.addEventListener('theme:slider:loaded', () => {
        this.initTickers();
      });
    }

    /**
     * Init tickers in sliders
     */
    initTickers(stopClone = false) {
      const frames = this.barHolder.querySelectorAll(selectors$C.frame);

      frames.forEach((element) => {
        new Ticker(element, stopClone);
      });
    }

    toggleTicker(e, isStoped) {
      const tickerScale = document.querySelector(selectors$C.tickerScale);
      const element = document.querySelector(`[${selectors$C.slideValue}="${e.detail.blockId}"]`);

      if (isStoped && element) {
        tickerScale.setAttribute(attributes$5.dataStop, '');
        tickerScale.querySelectorAll(selectors$C.tickerText).forEach((textHolder) => {
          textHolder.classList.remove(classes$q.tickerAnimated);
          textHolder.style.transform = `translate3d(${-(element.offsetLeft - element.clientWidth)}px, 0, 0)`;
        });
      }

      if (!isStoped && element) {
        tickerScale.querySelectorAll(selectors$C.tickerText).forEach((textHolder) => {
          textHolder.classList.add(classes$q.tickerAnimated);
          textHolder.removeAttribute(attributes$5.style);
        });
        tickerScale.removeAttribute(attributes$5.dataStop);
      }
    }

    onBlockSelect(e) {
      if (this.slider) {
        this.slider.onBlockSelect(e);
      } else {
        this.toggleTicker(e, true);
      }
    }

    onBlockDeselect(e) {
      if (this.slider) {
        this.slider.onBlockDeselect(e);
      } else {
        this.toggleTicker(e, false);
      }
    }
  }

  const bar = {
    onLoad() {
      sections$k[this.id] = [];
      const element = this.container.querySelector(selectors$C.bar);
      if (element) {
        sections$k[this.id].push(new Bar(element));
      }
    },
    onBlockSelect(e) {
      if (sections$k[this.id].length) {
        sections$k[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockSelect(e);
          }
        });
      }
    },
    onBlockDeselect(e) {
      if (sections$k[this.id].length) {
        sections$k[this.id].forEach((el) => {
          if (typeof el.onBlockSelect === 'function') {
            el.onBlockDeselect(e);
          }
        });
      }
    },
  };

  register('announcement', [bar]);

  const selectors$B = {
    aos: 'data-aos',
  };

  const removeAnimations = (container) => {
    const animatedElements = container.querySelectorAll(`[${selectors$B.aos}]`);
    animatedElements.forEach((element) => {
      element.removeAttribute(selectors$B.aos);
    });
  };

  function fetchProduct(handle) {
    const requestRoute = `${theme.routes.root}products/${handle}.js`;
    return window
      .fetch(requestRoute)
      .then((response) => {
        return response.json();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function getScript(url, callback, callbackError) {
    let head = document.getElementsByTagName('head')[0];
    let done = false;
    let script = document.createElement('script');
    script.src = url;

    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        callback();
      } else {
        callbackError();
      }
    };

    head.appendChild(script);
  }

  const loaders = {};
  window.isYoutubeAPILoaded = false;

  function loadScript(options = {}) {
    if (!options.type) {
      options.type = 'json';
    }

    if (options.url) {
      if (loaders[options.url]) {
        return loaders[options.url];
      } else {
        return getScriptWithPromise(options.url, options.type);
      }
    } else if (options.json) {
      if (loaders[options.json]) {
        return Promise.resolve(loaders[options.json]);
      } else {
        return window
          .fetch(options.json)
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            loaders[options.json] = response;
            return response;
          });
      }
    } else if (options.name) {
      const key = ''.concat(options.name, options.version);
      if (loaders[key]) {
        return loaders[key];
      } else {
        return loadShopifyWithPromise(options);
      }
    } else {
      return Promise.reject();
    }
  }

  function getScriptWithPromise(url, type) {
    const loader = new Promise((resolve, reject) => {
      if (type === 'text') {
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        getScript(
          url,
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      }
    });

    loaders[url] = loader;
    return loader;
  }

  function loadShopifyWithPromise(options) {
    const key = ''.concat(options.name, options.version);
    const loader = new Promise((resolve, reject) => {
      try {
        window.Shopify.loadFeatures([
          {
            name: options.name,
            version: options.version,
            onLoad: (err) => {
              onLoadFromShopify(resolve, reject, err);
            },
          },
        ]);
      } catch (err) {
        reject(err);
      }
    });
    loaders[key] = loader;
    return loader;
  }

  function onLoadFromShopify(resolve, reject, err) {
    if (err) {
      return reject(err);
    } else {
      return resolve();
    }
  }

  const defaults$1 = {
    color: 'ash',
  };

  const selectors$A = {
    swatch: 'data-swatch',
    swatchColor: '[data-swatch-color]',
    wrapper: '[data-grid-swatches]',
    template: '[data-swatch-template]',
    handle: 'data-swatch-handle',
    label: 'data-swatch-label',
  };

  class ColorMatch {
    constructor(options = {}) {
      this.settings = {
        ...defaults$1,
        ...options,
      };

      this.match = this.init();
    }

    getColor() {
      return this.match;
    }

    init() {
      const getColors = loadScript({json: theme.assets.swatches});
      return getColors
        .then((colors) => {
          return this.matchColors(colors, this.settings.color);
        })
        .catch((e) => {
          console.log('failed to load swatch colors script');
          console.log(e);
        });
    }

    matchColors(colors, name) {
      let bg = '#E5E5E5';
      let img = null;
      const path = theme.assets.base || '/';
      const comparisonName = name.toLowerCase().replace(/\s/g, '');
      const array = colors.colors;

      if (array) {
        let indexArray = null;

        const hexColorArr = array.filter((colorObj, index) => {
          const neatName = Object.keys(colorObj).toString().toLowerCase().replace(/\s/g, '');

          if (neatName === comparisonName) {
            indexArray = index;

            return colorObj;
          }
        });

        if (hexColorArr.length && indexArray !== null) {
          const value = Object.values(array[indexArray])[0];
          bg = value;

          if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
            img = `${path}${value}`;
            bg = '#888888';
          }
        }
      }

      return {
        color: this.settings.color,
        path: img,
        hex: bg,
      };
    }
  }

  class Swatch {
    constructor(element) {
      this.element = element;
      this.swatchColor = this.element.querySelector(selectors$A.swatchColor);
      this.colorString = element.getAttribute(selectors$A.swatch);
      const matcher = new ColorMatch({color: this.colorString});
      matcher.getColor().then((result) => {
        this.colorMatch = result;
        this.init();
      });
    }

    init() {
      if (this.colorMatch && this.colorMatch.hex) {
        this.swatchColor.style.setProperty('--swatch', `${this.colorMatch.hex}`);
      }
      if (this.colorMatch && this.colorMatch.path) {
        this.swatchColor.style.setProperty('background-image', `url(${this.colorMatch.path})`);
      }
    }
  }

  class GridSwatch {
    constructor(wrap, container) {
      this.template = document.querySelector(selectors$A.template).innerHTML;
      this.wrap = wrap;
      this.container = container;
      this.handle = wrap.getAttribute(selectors$A.handle);
      const label = wrap.getAttribute(selectors$A.label).trim().toLowerCase();
      fetchProduct(this.handle).then((product) => {
        this.product = product;
        this.colorOption = product.options.find(function (element) {
          return element.name.toLowerCase() === label || null;
        });

        if (this.colorOption) {
          this.swatches = this.colorOption.values;
          this.init();
        }
      });
    }

    init() {
      this.wrap.innerHTML = '';

      this.swatches.forEach((swatch) => {
        let variant = this.product.variants.find((variant) => {
          return variant.options.includes(swatch);
        });

        if (variant) {
          this.wrap.innerHTML += Sqrl__namespace.render(this.template, {
            color: swatch,
            uniq: `${this.product.id}-${variant.id}`,
            variant: variant.id,
            variantUrl: `${this.product.url}?variant=${variant.id}`,
          });
        }
      });

      this.swatchElements = this.wrap.querySelectorAll(`[${selectors$A.swatch}]`);

      this.swatchElements.forEach((el) => {
        new Swatch(el);
      });
    }
  }

  const makeGridSwatches = (container) => {
    const gridSwatchWrappers = container.querySelectorAll(selectors$A.wrapper);
    gridSwatchWrappers.forEach((wrap) => {
      new GridSwatch(wrap, undefined);
    });
  };

  const swatchSection = {
    onLoad() {
      this.swatches = [];
      const els = this.container.querySelectorAll(`[${selectors$A.swatch}]`);
      els.forEach((el) => {
        this.swatches.push(new Swatch(el));
      });
    },
  };

  const swatchGridSection = {
    onLoad() {
      makeGridSwatches(this.container);
    },
  };

  const throttle = (fn, wait) => {
    let prev, next;
    return function invokeFn(...args) {
      const now = Date.now();
      next = clearTimeout(next);
      if (!prev || now - prev >= wait) {
        // eslint-disable-next-line prefer-spread
        fn.apply(null, args);
        prev = now;
      } else {
        next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
      }
    };
  };

  const selectors$z = {
    itemsParent: '[data-custom-scrollbar-items]',
    scrollbar: '[data-custom-scrollbar]',
    scrollbarTrack: '[data-custom-scrollbar-track]',
  };
  class CustomScrollbar {
    constructor(container) {
      this.itemsParent = container.querySelector(selectors$z.itemsParent);
      this.scrollbar = container.querySelector(selectors$z.scrollbar);
      this.scrollbarTrack = container.querySelector(selectors$z.scrollbarTrack);
      this.trackWidth = 0;
      this.calcPositionEvent = throttle(() => this.calculatePosition(), 50);
      this.calcTrackEvent = () => this.calculateTrackWidth();

      if (this.scrollbar && this.itemsParent) {
        this.events();
        this.calculateTrackWidth();
      }
    }

    events() {
      this.itemsParent.addEventListener('scroll', this.calcPositionEvent);
      document.addEventListener('theme:resize:width', this.calcTrackEvent);
    }

    calculateTrackWidth() {
      this.trackWidth = 100 / this.itemsParent.children.length;
      this.trackWidth = this.trackWidth < 5 ? 5 : this.trackWidth; // Min track width: 5%
      this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}%`);
    }

    calculatePosition() {
      /* Scrollbar width must be re-calculated by subtracting the track width (in percentage)
       ** E.g. if the track width is 15% of the scroll bar then we must use a reduced by 15% scrollbar width for the calculations which is 85% of the total scrollbar width
       ** This is needed in order to prevent the track moving out of the scrollbar container
       */
      const reducedScrollbarWidth = this.scrollbar.clientWidth * ((100 - this.trackWidth) / 100);
      let position = this.itemsParent.scrollLeft / (this.itemsParent.scrollWidth - this.itemsParent.clientWidth);

      position *= reducedScrollbarWidth;

      this.scrollbar.style.setProperty('--position', `${Math.round(position)}px`);
    }

    destroy() {
      this.itemsParent.removeEventListener('scroll', this.calcPositionEvent);
      document.removeEventListener('theme:resize:width', this.calcTrackEvent);
    }
  }

  const selectors$y = {
    productContainer: '[data-product-container]',
    productSlideshow: '[data-product-slideshow]',
    productImage: '[data-product-single-media-wrapper]',
    productThumbs: '[data-product-single-media-thumbs]',
    productThumb: '[data-thumbnail]',
    productThumbLink: '[data-thumbnail-id]',
    deferredMediaButton: '[data-deferred-media-button]',
    mediaType: 'data-type',
    id: 'data-id',
    tabIndex: 'tabindex',
    arrows: 'data-arrows',
    dots: 'data-dots',
  };

  const classes$p = {
    active: 'active',
    sliderEnabled: 'flickity-enabled',
    scrollable: 'product--layout-scrollable',
    mediaHidden: 'media--hidden',
    focusEnabled: 'is-focused',
    thumbsArrows: 'product__images__slider-nav--arrows',
    isMoving: 'is-moving',
  };

  class InitSlider {
    constructor(section) {
      this.container = section.container;
      this.productContainer = this.container.querySelector(selectors$y.productContainer);
      this.scrollable = this.productContainer.classList.contains(classes$p.scrollable);
      this.slideshow = this.container.querySelector(selectors$y.productSlideshow);
      this.productImages = this.container.querySelectorAll(selectors$y.productImage);
      this.thumbs = this.container.querySelector(selectors$y.productThumbs);
      this.flkty = null;
      this.flktyNav = null;
      this.checkThumbsWidthResizeEvent = () => this.checkThumbsWidth();
      this.scrollableResizeEvent = () => this.toggleCustomScrollbar();

      if (this.productImages.length > 1) {
        this.init();
      }
    }

    init() {
      this.createSlider();
      this.createSliderNav();
      this.createScrollable();

      document.addEventListener('theme:resize', this.checkThumbsWidthResizeEvent);
    }

    createSlider() {
      if (!this.slideshow) {
        return;
      }

      const instance = this;
      const firstSlide = this.slideshow.querySelectorAll(`[${selectors$y.mediaType}]`)[0];
      const arrows = this.slideshow.getAttribute(selectors$y.arrows) === 'true';
      const dots = this.slideshow.getAttribute(selectors$y.dots) === 'true';

      const flickityOptions = {
        autoPlay: false,
        arrowShape: theme.icons.arrowNavSlider,
        prevNextButtons: arrows,
        contain: true,
        pageDots: dots,
        adaptiveHeight: true,
        wrapAround: true,
      };

      this.flkty = new Flickity(this.slideshow, flickityOptions);

      if (firstSlide) {
        const firstType = firstSlide.getAttribute(selectors$y.mediaType);

        if (firstType === 'model' || firstType === 'video' || firstType === 'external_video') {
          this.flkty.options.draggable = false;
          this.flkty.updateDraggable();
        }
      }

      this.flkty.on('dragStart', function () {
        instance.slideshow.classList.add(classes$p.isMoving);
      });

      this.flkty.on('change', function (index) {
        const currentMedia = this.cells[index].element;
        const newMedia = this.selectedElement;

        currentMedia.dispatchEvent(new CustomEvent('theme:media:hidden'));
        newMedia.classList.remove(classes$p.mediaHidden);
      });

      this.flkty.on('settle', function () {
        const currentMedia = this.selectedElement;
        const mediaType = currentMedia.getAttribute(selectors$y.mediaType);

        if (mediaType === 'model' || mediaType === 'video' || mediaType === 'external_video') {
          // first boolean sets value, second option false to prevent refresh
          instance.flkty.options.draggable = false;
          instance.flkty.updateDraggable();
        } else {
          instance.flkty.options.draggable = true;
          instance.flkty.updateDraggable();
        }

        instance.switchMedia(currentMedia);
        instance.slideshow.classList.remove(classes$p.isMoving);
      });
    }

    createSliderNav() {
      if (!this.thumbs || !this.slideshow) {
        return;
      }

      const flickityOptionsNav = {
        asNavFor: this.slideshow,
        pageDots: false,
        prevNextButtons: true,
        arrowShape: theme.icons.arrowNavSlider,
        groupCells: true,
        contain: true,
      };

      this.flktyNav = new Flickity(this.thumbs, flickityOptionsNav);

      this.checkThumbsWidth();

      this.thumbs.querySelectorAll(selectors$y.productThumbLink).forEach((thumbLink) => {
        thumbLink.addEventListener('click', (e) => {
          e.preventDefault();
        });
      });
    }

    checkThumbsWidth() {
      if (!this.thumbs) {
        return;
      }

      const thumbs = this.thumbs.querySelectorAll(selectors$y.productThumb);
      const thumbsContainerPadding = parseInt(window.getComputedStyle(this.thumbs).paddingLeft.replace('px', '')) * 2;
      const thumbsContainerWidth = this.thumbs.offsetWidth - thumbsContainerPadding;
      let thumbsWidth = 0;

      thumbs.forEach((thumb) => {
        thumbsWidth += thumb.offsetWidth;
      });

      if (thumbsContainerWidth < thumbsWidth) {
        this.thumbs.classList.add(classes$p.thumbsArrows);
      } else {
        this.thumbs.classList.remove(classes$p.thumbsArrows);
      }

      if (typeof this.flktyNav == 'object') {
        this.flktyNav.resize();
      }
    }

    createScrollable() {
      if (!this.scrollable) {
        return;
      }

      this.toggleCustomScrollbar();
      document.addEventListener('theme:resize', this.scrollableResizeEvent);
    }

    toggleCustomScrollbar() {
      if (window.innerWidth < theme.sizes.small) {
        this.customScrollbar = new CustomScrollbar(this.container);
      } else if (this.customScrollbar) {
        this.customScrollbar.destroy();
      }
    }

    switchMedia(currentMedia) {
      const otherMedia = Array.prototype.filter.call(currentMedia.parentNode.children, function (child) {
        return child !== currentMedia;
      });
      const isFocusEnabled = document.body.classList.contains(classes$p.focusEnabled);

      if (isFocusEnabled) {
        currentMedia.dispatchEvent(new Event('focus'));
      }

      if (otherMedia.length) {
        otherMedia.forEach((element) => {
          element.classList.add(classes$p.mediaHidden);
          element.dispatchEvent(new CustomEvent('theme:media:hidden'));
        });
      }

      currentMedia.classList.remove(classes$p.mediaHidden);
      currentMedia.dispatchEvent(new CustomEvent('theme:media:visible'));

      // Force media loading if slide becomes visible
      const deferredMedia = currentMedia.querySelector('deferred-media');
      if (deferredMedia && deferredMedia.getAttribute('loaded') !== true) {
        currentMedia.querySelector(selectors$y.deferredMediaButton).dispatchEvent(new Event('click', {bubbles: false}));
      }
    }

    unload() {
      document.removeEventListener('theme:resize', this.checkThumbsWidthResizeEvent);
    }
  }

  const selectors$x = {
    dataEnableSound: 'data-enable-sound',
    dataEnableBackground: 'data-enable-background',
    dataEnableAutoplay: 'data-enable-autoplay',
    dataEnableLoop: 'data-enable-loop',
    dataVideoId: 'data-video-id',
    dataVideoType: 'data-video-type',
    videoIframe: '[data-video-id]',
  };

  const classes$o = {
    loaded: 'loaded',
  };

  class LoadVideoVimeo {
    constructor(container) {
      this.container = container;
      this.player = this.container.querySelector(selectors$x.videoIframe);

      if (this.player) {
        this.videoID = this.player.getAttribute(selectors$x.dataVideoId);
        this.videoType = this.player.getAttribute(selectors$x.dataVideoType);
        this.enableBackground = this.player.getAttribute(selectors$x.dataEnableBackground) === 'true';
        this.disableSound = this.player.getAttribute(selectors$x.dataEnableSound) === 'false';
        this.enableAutoplay = this.player.getAttribute(selectors$x.dataEnableAutoplay) !== 'false';
        this.enableLoop = this.player.getAttribute(selectors$x.dataEnableLoop) !== 'false';

        if (this.videoType == 'vimeo') {
          this.init();
        }
      }
    }

    init() {
      this.loadVimeoPlayer();
    }

    loadVimeoPlayer() {
      const oembedUrl = 'https://vimeo.com/api/oembed.json';
      const vimeoUrl = 'https://vimeo.com/' + this.videoID;
      let paramsString = '';
      const state = this.player;

      const params = {
        url: vimeoUrl,
        background: this.enableBackground,
        muted: this.disableSound,
        autoplay: this.enableAutoplay,
        loop: this.enableLoop,
      };

      for (let key in params) {
        paramsString += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
      }

      fetch(`${oembedUrl}?${paramsString}`)
        .then((response) => response.json())
        .then(function (data) {
          state.innerHTML = data.html;

          setTimeout(function () {
            state.parentElement.classList.add(classes$o.loaded);
          }, 1000);
        })
        .catch(function (error) {
          console.log('error', error);
        });
    }
  }

  const selectors$w = {
    dataSectionId: 'data-section-id',
    dataEnableSound: 'data-enable-sound',
    dataHideOptions: 'data-hide-options',
    dataCheckPlayerVisibility: 'data-check-player-visibility',
    dataVideoId: 'data-video-id',
    dataVideoType: 'data-video-type',
    videoIframe: '[data-video-id]',
    videoWrapper: '.video-wrapper',
    youtubeWrapper: '[data-youtube-wrapper]',
  };

  const classes$n = {
    loaded: 'loaded',
  };

  const players = [];

  class LoadVideoYT {
    constructor(container) {
      this.container = container;
      this.player = this.container.querySelector(selectors$w.videoIframe);

      if (this.player) {
        this.videoOptionsVars = {};
        this.videoID = this.player.getAttribute(selectors$w.dataVideoId);
        this.videoType = this.player.getAttribute(selectors$w.dataVideoType);
        if (this.videoType == 'youtube') {
          this.checkPlayerVisibilityFlag = this.player.getAttribute(selectors$w.dataCheckPlayerVisibility) === 'true';
          this.playerID = this.player.querySelector(selectors$w.youtubeWrapper) ? this.player.querySelector(selectors$w.youtubeWrapper).id : this.player.id;
          if (this.player.hasAttribute(selectors$w.dataHideOptions)) {
            this.videoOptionsVars = {
              cc_load_policy: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              autohide: 0,
              controls: 0,
              branding: 0,
              showinfo: 0,
              rel: 0,
              fs: 0,
              wmode: 'opaque',
            };
          }

          this.init();

          this.container.addEventListener('touchstart', function (e) {
            if (e.target.matches(selectors$w.videoWrapper) || e.target.closest(selectors$w.videoWrapper)) {
              const playerID = e.target.querySelector(selectors$w.videoIframe).id;
              players[playerID].playVideo();
            }
          });
        }
      }
    }

    init() {
      if (window.isYoutubeAPILoaded) {
        this.loadYoutubePlayer();
      } else {
        // Load Youtube API if not loaded yet
        loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadYoutubePlayer());
      }
    }

    loadYoutubePlayer() {
      const defaultYoutubeOptions = {
        height: '720',
        width: '1280',
        playerVars: this.videoOptionsVars,
        events: {
          onReady: (event) => {
            const eventIframe = event.target.getIframe();
            const id = eventIframe.id;
            const enableSound = document.querySelector(`#${id}`).getAttribute(selectors$w.dataEnableSound) === 'true';

            eventIframe.setAttribute('tabindex', '-1');

            if (enableSound) {
              event.target.unMute();
            } else {
              event.target.mute();
            }
            event.target.playVideo();

            if (this.checkPlayerVisibilityFlag) {
              this.checkPlayerVisibility(id);

              window.addEventListener(
                'scroll',
                throttle(() => {
                  this.checkPlayerVisibility(id);
                }, 150)
              );
            }
          },
          onStateChange: (event) => {
            // Loop video if state is ended
            if (event.data == 0) {
              event.target.playVideo();
            }
            if (event.data == 1) {
              // video is playing
              event.target.getIframe().parentElement.classList.add(classes$n.loaded);
            }
          },
        },
      };

      const currentYoutubeOptions = {...defaultYoutubeOptions};
      currentYoutubeOptions.videoId = this.videoID;
      if (this.videoID.length) {
        YT.ready(() => {
          players[this.playerID] = new YT.Player(this.playerID, currentYoutubeOptions);
        });
      }
      window.isYoutubeAPILoaded = true;
    }

    checkPlayerVisibility(id) {
      let playerID;
      if (typeof id === 'string') {
        playerID = id;
      } else if (id.data != undefined) {
        playerID = id.data.id;
      } else {
        return;
      }

      const playerElement = document.getElementById(playerID + '-container');
      if (!playerElement) return;
      const player = players[playerID];
      const box = playerElement.getBoundingClientRect();
      let isVisible = visibilityHelper.isElementPartiallyVisible(playerElement) || visibilityHelper.isElementTotallyVisible(playerElement);

      // Fix the issue when element height is bigger than the viewport height
      if (box.top < 0 && playerElement.clientHeight + box.top >= 0) {
        isVisible = true;
      }

      if (isVisible && player && typeof player.playVideo === 'function') {
        player.playVideo();
      } else if (!isVisible && player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }
    }

    onUnload() {
      const playerID = 'youtube-' + this.container.getAttribute(selectors$w.dataSectionId);
      if (!players[playerID]) return;
      players[playerID].destroy();
    }
  }

  const selectors$v = {
    popupContainer: '.pswp',
    popupCloseBtn: '.pswp__custom-close',
    popupIframe: 'iframe, video',
    popupCustomIframe: '.pswp__custom-iframe',
    popupThumbs: '.pswp__thumbs',
    dataOptionClasses: 'data-pswp-option-classes',
    dataVideoType: 'data-video-type',
  };

  const classes$m = {
    classCurrent: 'is-current',
    classCustomLoader: 'pswp--custom-loader',
    classCustomOpen: 'pswp--custom-opening',
    classLoader: 'pswp__loader',
  };

  const loaderHTML = `<div class="${classes$m.classLoader}"><div class="loader pswp__loader-line"><div class="loader-indeterminate"></div></div></div>`;

  class LoadPhotoswipe {
    constructor(items, options = '') {
      this.accessibility = a11y;
      this.items = items;
      this.pswpElement = document.querySelectorAll(selectors$v.popupContainer)[0];
      this.popup = null;
      this.popupThumbs = null;
      this.popupThumbsContainer = this.pswpElement.querySelector(selectors$v.popupThumbs);
      this.closeBtn = this.pswpElement.querySelector(selectors$v.popupCloseBtn);
      this.closeButtonClick = () => this.closeButtonClickEvent();
      const defaultOptions = {
        history: false,
        focus: false,
        mainClass: '',
      };
      this.options = options !== '' ? options : defaultOptions;

      this.init();
    }

    init() {
      this.pswpElement.classList.add(classes$m.classCustomOpen);

      this.initLoader();

      loadScript({url: window.theme.assets.photoswipe})
        .then(() => this.loadPopup())
        .catch((e) => console.error(e));
    }

    initLoader() {
      if (this.pswpElement.classList.contains(classes$m.classCustomLoader) && this.options !== '' && this.options.mainClass) {
        this.pswpElement.setAttribute(selectors$v.dataOptionClasses, this.options.mainClass);
        let loaderElem = document.createElement('div');
        loaderElem.innerHTML = loaderHTML;
        loaderElem = loaderElem.firstChild;
        this.pswpElement.appendChild(loaderElem);
      } else {
        this.pswpElement.setAttribute(selectors$v.dataOptionClasses, '');
      }
    }

    loadPopup() {
      const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
      const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

      if (this.pswpElement.classList.contains(classes$m.classCustomLoader)) {
        this.pswpElement.classList.remove(classes$m.classCustomLoader);
      }

      this.pswpElement.classList.remove(classes$m.classCustomOpen);

      this.popup = new PhotoSwipe(this.pswpElement, PhotoSwipeUI, this.items, this.options);
      this.popup.init();

      this.accessibility.trapFocus(this.pswpElement);

      this.initVideo();

      this.thumbsActions();

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.closeButtonClick);
      }

      this.popup.listen('close', () => this.onClose());
    }

    closeButtonClickEvent() {
      this.popup.close();
      this.accessibility.removeTrapFocus();
      if (theme.a11yTrigger !== null) {
        theme.a11yTrigger.focus();
      }
    }

    initVideo() {
      const videoContainer = this.pswpElement.querySelector(selectors$v.popupCustomIframe);
      if (videoContainer) {
        const videoType = videoContainer.getAttribute(selectors$v.dataVideoType);

        if (videoType == 'youtube') {
          new LoadVideoYT(videoContainer.parentElement);
        } else if (videoType == 'vimeo') {
          new LoadVideoVimeo(videoContainer.parentElement);
        }
      }
    }

    thumbsActions() {
      if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
        this.popupThumbsContainer.addEventListener('wheel', (e) => this.stopDisabledScroll(e));
        this.popupThumbsContainer.addEventListener('mousewheel', (e) => this.stopDisabledScroll(e));
        this.popupThumbsContainer.addEventListener('DOMMouseScroll', (e) => this.stopDisabledScroll(e));

        this.popupThumbs = this.pswpElement.querySelectorAll(`${selectors$v.popupThumbs} > *`);
        this.popupThumbs.forEach((element, i) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            element.parentElement.querySelector(`.${classes$m.classCurrent}`).classList.remove(classes$m.classCurrent);
            element.classList.add(classes$m.classCurrent);
            this.popup.goTo(i);
          });
        });

        this.popup.listen('imageLoadComplete', () => this.setCurrentThumb());
        this.popup.listen('beforeChange', () => this.setCurrentThumb());
      }
    }

    stopDisabledScroll(e) {
      e.stopPropagation();
    }

    onClose() {
      const popupIframe = this.pswpElement.querySelector(selectors$v.popupIframe);
      if (popupIframe) {
        popupIframe.parentNode.removeChild(popupIframe);
      }

      if (this.popupThumbsContainer && this.popupThumbsContainer.firstChild) {
        while (this.popupThumbsContainer.firstChild) {
          this.popupThumbsContainer.removeChild(this.popupThumbsContainer.firstChild);
        }
      }

      this.pswpElement.setAttribute(selectors$v.dataOptionClasses, '');
      const loaderElem = this.pswpElement.querySelector(`.${classes$m.classLoader}`);
      if (loaderElem) {
        this.pswpElement.removeChild(loaderElem);
      }

      this.accessibility.removeTrapFocus();

      if (theme.a11yTrigger !== null) {
        theme.a11yTrigger.focus();
      }

      this.closeBtn.removeEventListener('click', this.closeButtonClick);
    }

    setCurrentThumb() {
      const lastCurrentThumb = this.pswpElement.querySelector(`${selectors$v.popupThumbs} > .${classes$m.classCurrent}`);
      if (lastCurrentThumb) {
        lastCurrentThumb.classList.remove(classes$m.classCurrent);
      }

      if (!this.popupThumbs) {
        return;
      }
      const currentThumb = this.popupThumbs[this.popup.getCurrentIndex()];
      currentThumb.classList.add(classes$m.classCurrent);
      this.scrollThumbs(currentThumb);
    }

    scrollThumbs(currentThumb) {
      const thumbsContainerLeft = this.popupThumbsContainer.scrollLeft;
      const thumbsContainerWidth = this.popupThumbsContainer.offsetWidth;
      const thumbsContainerPos = thumbsContainerLeft + thumbsContainerWidth;
      const currentThumbLeft = currentThumb.offsetLeft;
      const currentThumbWidth = currentThumb.offsetWidth;
      const currentThumbPos = currentThumbLeft + currentThumbWidth;

      if (thumbsContainerPos <= currentThumbPos || thumbsContainerPos > currentThumbLeft) {
        const currentThumbMarginLeft = parseInt(window.getComputedStyle(currentThumb).marginLeft);
        this.popupThumbsContainer.scrollTo({
          top: 0,
          left: currentThumbLeft - currentThumbMarginLeft,
          behavior: 'smooth',
        });
      }
    }
  }

  const selectors$u = {
    productContainer: '[data-product-container]',
    productSlideshow: '[data-product-slideshow]',
    zoomWrapper: '[data-zoom-wrapper]',
    dataImageSrc: 'data-image-src',
    dataImageWidth: 'data-image-width',
    dataImageHeight: 'data-image-height',
    dataImageZoomEnable: 'data-lightbox',
  };

  const classes$l = {
    popupClass: 'pswp-zoom-gallery',
    popupClassNoThumbs: 'pswp-zoom-gallery--single',
    isMoving: 'is-moving',
  };

  class Zoom {
    constructor(section) {
      this.container = section.container;
      this.productContainer = this.container.querySelector(selectors$u.productContainer);
      this.slideshow = this.container.querySelector(selectors$u.productSlideshow);
      this.zoomWrappers = this.container.querySelectorAll(selectors$u.zoomWrapper);
      this.zoomEnable = this.productContainer.getAttribute(selectors$u.dataImageZoomEnable) === 'true';

      if (this.zoomEnable) {
        this.init();
      }
    }

    init() {
      if (this.zoomWrappers.length) {
        this.zoomWrappers.forEach((element, i) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();

            const isMoving = this.slideshow && this.slideshow.classList.contains(classes$l.isMoving);
            theme.a11yTrigger = element;

            if (!isMoving) {
              this.createZoom(i);
            }
          });

          element.addEventListener('keyup', (e) => {
            // On keypress Enter move the focus to the first focusable element in the related slide
            if (e.keyCode === theme.keyboardKeys.ENTER) {
              e.preventDefault();

              element.dispatchEvent(new Event('click'));
            }
          });
        });
      }
    }

    createZoom(indexImage) {
      const instance = this;
      let items = [];
      let counter = 0;

      this.zoomWrappers.forEach((elementImage) => {
        const imgSrc = elementImage.getAttribute('href');
        const imgWidth = parseInt(elementImage.getAttribute(selectors$u.dataImageWidth));
        const imgHeight = parseInt(elementImage.getAttribute(selectors$u.dataImageHeight));

        items.push({
          src: imgSrc,
          w: imgWidth,
          h: imgHeight,
          msrc: imgSrc,
        });

        counter += 1;
        if (instance.zoomWrappers.length === counter) {
          let popupClass = `${classes$l.popupClass}`;
          if (counter === 1) {
            popupClass = `${classes$l.popupClass} ${classes$l.popupClassNoThumbs}`;
          }
          const options = {
            barsSize: {top: 0, bottom: 'auto'},
            history: false,
            focus: false,
            index: indexImage,
            mainClass: popupClass,
            showHideOpacity: true,
            showAnimationDuration: 250,
            hideAnimationDuration: 250,
            closeOnScroll: false,
            closeOnVerticalDrag: false,
            captionEl: false,
            closeEl: true,
            closeElClasses: ['caption-close'],
            tapToClose: false,
            clickToCloseNonZoomable: false,
            maxSpreadZoom: 2,
            loop: true,
            spacing: 0,
            allowPanToNext: true,
            pinchToClose: false,
          };

          new LoadPhotoswipe(items, options);
        }
      });
    }
  }

  const hosts = {
    html5: 'html5',
    youtube: 'youtube',
  };

  const selectors$t = {
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
    productMediaWrapper: '[data-product-single-media-wrapper]',
    productMediaSlider: '[data-product-single-media-slider]',
    mediaContainer: '[data-video]',
    mediaId: 'data-media-id',
  };

  const classes$k = {
    mediaHidden: 'media--hidden',
  };

  theme.mediaInstances = {};
  class Video {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.id = section.id;
      this.players = {};
      this.init();
    }

    init() {
      const mediaContainers = this.container.querySelectorAll(selectors$t.mediaContainer);

      mediaContainers.forEach((mediaContainer) => {
        const deferredMediaButton = mediaContainer.querySelector(selectors$t.deferredMediaButton);

        if (deferredMediaButton) {
          deferredMediaButton.addEventListener('click', this.loadContent.bind(this, mediaContainer));
        }
      });
    }

    loadContent(mediaContainer) {
      if (mediaContainer.querySelector(selectors$t.deferredMedia).getAttribute('loaded')) {
        return;
      }

      const content = document.createElement('div');
      content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
      const mediaId = mediaContainer.dataset.mediaId;
      const element = content.querySelector('video, iframe');
      const host = this.hostFromVideoElement(element);
      const deferredMedia = mediaContainer.querySelector(selectors$t.deferredMedia);
      deferredMedia.appendChild(element).focus();
      deferredMedia.setAttribute('loaded', true);

      this.players[mediaId] = {
        mediaId: mediaId,
        sectionId: this.id,
        container: mediaContainer,
        element: element,
        host: host,
        ready: () => {
          this.createPlayer(mediaId);
        },
      };

      const video = this.players[mediaId];

      switch (video.host) {
        case hosts.html5:
          this.loadVideo(video, hosts.html5);
          break;
        case hosts.youtube:
          if (window.isYoutubeAPILoaded) {
            this.loadVideo(video, hosts.youtube);
          } else {
            loadScript({url: 'https://www.youtube.com/iframe_api'}).then(() => this.loadVideo(video, hosts.youtube));
          }
          break;
      }
    }

    hostFromVideoElement(video) {
      if (video.tagName === 'VIDEO') {
        return hosts.html5;
      }

      if (video.tagName === 'IFRAME') {
        if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(video.src)) {
          return hosts.youtube;
        }
      }
      return null;
    }

    loadVideo(video, host) {
      if (video.host === host) {
        video.ready();
      }
    }

    createPlayer(mediaId) {
      const video = this.players[mediaId];
      const enableLooping = video.container.dataset.enableVideoLooping;

      switch (video.host) {
        case hosts.html5:
          // Force video play on iOS
          video.element.play();
          video.element.addEventListener('play', () => {
            this.pauseOtherMedia(mediaId);
          });

          video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
          video.container.addEventListener('theme:xr-launch', (event) => this.onHidden(event));
          video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));

          this.observeVideo(video);

          break;

        case hosts.youtube:
          if (video.host == hosts.youtube && video.player) {
            return;
          }

          YT.ready(() => {
            const videoId = video.container.dataset.videoId;

            this.players[mediaId].player = new YT.Player(video.element, {
              videoId: videoId,
              events: {
                onReady: (event) => {
                  event.target.playVideo(); // Force video autoplay on iOS
                },
                onStateChange: (event) => {
                  if (event.data === 0) {
                    // ended
                    if (enableLooping) {
                      event.target.seekTo(0);
                    }
                  }
                  if (event.data === 1) {
                    // playing
                    this.pauseOtherMedia(mediaId);
                  }
                  if (event.data === 2) ;
                },
              },
            });

            window.isYoutubeAPILoaded = true;

            // Force video play on iOS
            video.container.addEventListener('theme:media:hidden', (event) => this.onHidden(event));
            video.container.addEventListener('theme:xr-launch', (event) => this.onHidden(event));
            video.container.addEventListener('theme:media:visible', (event) => this.onVisible(event));

            this.observeVideo(video);
          });

          break;
      }
    }

    observeVideo(video) {
      let observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            const outsideViewport = entry.intersectionRatio != 1;

            if (outsideViewport) {
              this.pauseVideo(video);
            } else {
              this.playVideo(video);
            }
          });
        },
        {threshold: 1}
      );
      observer.observe(video.element);
    }

    playVideo(video) {
      if (video.player && video.player.playVideo) {
        video.player.playVideo();
      } else if (video.element && video.element.play) {
        video.element.play();
      }
    }

    pauseVideo(video) {
      if (video.player && video.player.pauseVideo) {
        video.player.pauseVideo();
      } else if (video.element && video.element.pause) {
        video.element.pause();
      }
    }

    onHidden(event) {
      if (typeof event.target.dataset.mediaId !== 'undefined') {
        const mediaId = event.target.dataset.mediaId;
        const video = this.players[mediaId];
        this.pauseVideo(video);
      }
    }

    onVisible(event) {
      if (typeof event.target.dataset.mediaId !== 'undefined') {
        const mediaId = event.target.dataset.mediaId;
        const video = this.players[mediaId];
        this.playVideo(video);
      }
    }

    pauseOtherMedia(mediaId) {
      const mediaIdString = `[${selectors$t.mediaId}="${mediaId}"]`;
      const currentMedia = document.querySelector(`${selectors$t.productMediaWrapper}${mediaIdString}`);
      const otherMedia = document.querySelectorAll(`${selectors$t.productMediaWrapper}:not(${mediaIdString})`);
      currentMedia.classList.remove(classes$k.mediaHidden);

      if (otherMedia.length) {
        otherMedia.forEach((element) => {
          element.dispatchEvent(new CustomEvent('theme:media:hidden'));
          element.classList.add(classes$k.mediaHidden);
        });
      }
    }
  }

  theme.mediaInstances = {};

  const selectors$s = {
    videoPlayer: '[data-video]',
    modelViewer: '[data-model]',
    sliderEnabled: 'flickity-enabled',
    classMediaHidden: 'media--hidden',
  };

  class Media {
    constructor(section) {
      this.section = section;
      this.id = section.id;
      this.container = section.container;
    }

    init() {
      this.detect3d();
      this.launch3d();

      new Video(this.section);
      new Zoom(this.section);
      new InitSlider(this.section);
    }

    detect3d() {
      const modelViewerElements = this.container.querySelectorAll(selectors$s.modelViewer);
      if (modelViewerElements.length) {
        modelViewerElements.forEach((element) => {
          theme.ProductModel.init(element, this.id);
        });
      }
    }

    launch3d() {
      const instance = this;

      document.addEventListener('shopify_xr_launch', function () {
        const currentMedia = instance.container.querySelector(`${selectors$s.modelViewer}:not(.${selectors$s.classMediaHidden})`);
        currentMedia.dispatchEvent(new CustomEvent('theme:xr-launch'));
      });
    }
  }

  const selectors$r = {
    list: '[data-store-availability-list]',
  };

  const defaults = {
    close: '.js-modal-close',
    open: '.js-modal-open-store-availability-modal',
    openClass: 'modal--is-active',
    openBodyClass: 'modal--is-visible',
    closeModalOnClick: false,
  };

  class Modals {
    constructor(id, options) {
      this.modal = document.getElementById(id);
      this.accessibility = a11y;

      if (!this.modal) {
        return false;
      }

      this.nodes = {
        parents: [document.querySelector('html'), document.body],
      };

      this.config = Object.assign(defaults, options);

      this.modalIsOpen = false;

      this.focusOnOpen = this.config.focusOnOpen ? document.getElementById(this.config.focusOnOpen) : this.modal;

      this.openElement = document.querySelector(this.config.open);
      this.init();
    }

    init() {
      this.openElement.addEventListener('click', this.open.bind(this));

      this.modal.querySelector(this.config.close).addEventListener('click', this.closeModal.bind(this));
    }

    open(evt) {
      var self = this;

      // Keep track if modal was opened from a click, or called by another function
      var externalCall = false;

      if (this.modalIsOpen) {
        return;
      }

      // Prevent following href if link is clicked
      if (evt) {
        evt.preventDefault();
      } else {
        externalCall = true;
      }

      // Without this, the modal opens, the click event bubbles up
      // which closes the modal.
      if (evt && evt.stopPropagation) {
        evt.stopPropagation();
      }

      if (this.modalIsOpen && !externalCall) {
        this.closeModal();
      }

      this.modal.classList.add(this.config.openClass);

      this.nodes.parents.forEach(function (node) {
        node.classList.add(self.config.openBodyClass);
      });

      this.modalIsOpen = true;

      // Scroll lock
      this.scrollableElement = document.querySelector(selectors$r.list);
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.scrollableElement}));

      this.accessibility.trapFocus(this.modal);

      this.bindEvents();
    }

    closeModal() {
      if (!this.modalIsOpen) {
        return;
      }

      document.activeElement.blur();

      this.modal.classList.remove(this.config.openClass);

      var self = this;

      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

      this.nodes.parents.forEach(function (node) {
        node.classList.remove(self.config.openBodyClass);
      });

      this.modalIsOpen = false;

      this.accessibility.removeTrapFocus();

      this.openElement.focus();

      this.unbindEvents();
    }

    bindEvents() {
      this.keyupHandler = this.keyupHandler.bind(this);
      this.clickHandler = this.clickHandler.bind(this);
      document.body.addEventListener('keyup', this.keyupHandler);
      document.body.addEventListener('click', this.clickHandler);
    }

    unbindEvents() {
      document.body.removeEventListener('keyup', this.keyupHandler);
      document.body.removeEventListener('click', this.clickHandler);
    }

    keyupHandler(event) {
      if (event.keyCode === 27) {
        this.closeModal();
      }
    }

    clickHandler(event) {
      if (this.config.closeModalOnClick && !this.modal.contains(event.target)) {
        this.closeModal();
      }
    }
  }

  const selectors$q = {
    body: 'body',
    storeAvailabilityModal: '[data-store-availability-modal]',
    storeAvailabilityModalOpen: '[data-store-availability-modal-open]',
    storeAvailabilityModalClose: '[data-store-availability-modal-close]',
    storeAvailabilityModalProductTitle: '[data-store-availability-modal-product-title]',
  };

  const classes$j = {
    openClass: 'store-availabilities-modal--active',
    hidden: 'visually-hidden',
  };

  class StoreAvailability {
    constructor(container) {
      this.container = container;
    }

    updateContent(variantId, productTitle) {
      this._fetchStoreAvailabilities(variantId, productTitle);
    }

    clearContent() {
      this.container.innerHTML = '';
    }

    _initModal() {
      return new Modals('StoreAvailabilityModal', {
        close: selectors$q.storeAvailabilityModalClose,
        open: selectors$q.storeAvailabilityModalOpen,
        closeModalOnClick: true,
        openClass: classes$j.openClass,
      });
    }

    _fetchStoreAvailabilities(variantId, productTitle) {
      const variantSectionUrl = `/variants/${variantId}/?section_id=store-availability`;
      this.clearContent();
      const self = this;
      fetch(variantSectionUrl)
        .then(function (response) {
          return response.text();
        })
        .then(function (storeAvailabilityHTML) {
          if (storeAvailabilityHTML.trim() === '') {
            return;
          }

          const body = document.querySelector(selectors$q.body);
          let storeAvailabilityModal = body.querySelector(selectors$q.storeAvailabilityModal);

          if (storeAvailabilityModal) {
            storeAvailabilityModal.remove();
          }

          self.container.innerHTML = storeAvailabilityHTML;
          self.container.innerHTML = self.container.firstElementChild.innerHTML;

          const storeAvailabilityModalOpen = self.container.querySelector(selectors$q.storeAvailabilityModalOpen);
          // Only create modal if open modal element exists
          if (!storeAvailabilityModalOpen) {
            return;
          }

          self.modal = self._initModal();
          self._updateProductTitle(productTitle);

          storeAvailabilityModal = self.container.querySelector(selectors$q.storeAvailabilityModal);

          if (storeAvailabilityModal) {
            body.appendChild(storeAvailabilityModal);
          }
        });
    }

    _updateProductTitle(productTitle) {
      const stripHtmlRegex = /(<([^>]+)>)/gi;
      const storeAvailabilityModalProductTitle = this.container.querySelector(selectors$q.storeAvailabilityModalProductTitle);
      storeAvailabilityModalProductTitle.textContent = productTitle.replace(stripHtmlRegex, '');
    }
  }

  function Listeners() {
    this.entries = [];
  }

  Listeners.prototype.add = function (element, event, fn) {
    this.entries.push({element: element, event: event, fn: fn});
    element.addEventListener(event, fn);
  };

  Listeners.prototype.removeAll = function () {
    this.entries = this.entries.filter(function (listener) {
      listener.element.removeEventListener(listener.event, listener.fn);
      return false;
    });
  };

  /**
   * Find a match in the project JSON (using a ID number) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Number} value Accepts Number (e.g. 6908023078973)
   * @returns {Object} The variant object once a match has been successful. Otherwise null will be return
   */

  /**
   * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromSerializedArray(product, collection) {
    _validateProductStructure(product);

    // If value is an array of options
    var optionArray = _createOptionArrayFromOptionCollection(product, collection);
    return getVariantFromOptionArray(product, optionArray);
  }

  /**
   * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromOptionArray(product, options) {
    _validateProductStructure(product);
    _validateOptionsArray(options);

    var result = product.variants.filter(function (variant) {
      return options.every(function (option, index) {
        return variant.options[index] === option;
      });
    });

    return result[0] || null;
  }

  /**
   * Creates an array of selected options from the object
   * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
   * @param {Object} product Product JSON object
   * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
   */
  function _createOptionArrayFromOptionCollection(product, collection) {
    _validateProductStructure(product);
    _validateSerializedArray(collection);

    var optionArray = [];

    collection.forEach(function (option) {
      for (var i = 0; i < product.options.length; i++) {
        var name = product.options[i].name || product.options[i];
        if (name.toLowerCase() === option.name.toLowerCase()) {
          optionArray[i] = option.value;
          break;
        }
      }
    });

    return optionArray;
  }

  /**
   * Check if the product data is a valid JS object
   * Error will be thrown if type is invalid
   * @param {object} product Product JSON object
   */
  function _validateProductStructure(product) {
    if (typeof product !== 'object') {
      throw new TypeError(product + ' is not an object.');
    }

    if (Object.keys(product).length === 0 && product.constructor === Object) {
      throw new Error(product + ' is empty.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted like jQuery's serializeArray()
   * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
   */
  function _validateSerializedArray(collection) {
    if (!Array.isArray(collection)) {
      throw new TypeError(collection + ' is not an array.');
    }

    if (collection.length === 0) {
      throw new Error(collection + ' is empty.');
    }

    if (collection[0].hasOwnProperty('name')) {
      if (typeof collection[0].name !== 'string') {
        throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
      }
    } else {
      throw new Error(collection[0] + 'does not contain name key.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted as list of values
   * @param {Array} collection Array of object (e.g. ['36', 'Black'])
   */
  function _validateOptionsArray(options) {
    if (Array.isArray(options) && typeof options[0] === 'object') {
      throw new Error(options + 'is not a valid array of options.');
    }
  }

  var selectors$p = {
    idInput: '[name="id"]',
    optionInput: '[name^="options"]',
    quantityInput: '[name="quantity"]',
    propertyInput: '[name^="properties"]',
  };

  /**
   * Constructor class that creates a new instance of a product form controller.
   *
   * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
   * @param {Object} product - A product object
   * @param {Object} options - Optional options object
   * @param {Function} options.onOptionChange - Callback for whenever an option input changes
   * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
   * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
   * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
   */
  function ProductForm(element, product, options) {
    this.element = element;
    this.product = _validateProductObject(product);

    options = options || {};

    this._listeners = new Listeners();
    this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

    this.optionInputs = this._initInputs(selectors$p.optionInput, options.onOptionChange);

    //this.quantityInputs = this._initInputs(selectors.quantityInput, options.onQuantityChange);

    this.propertyInputs = this._initInputs(selectors$p.propertyInput, options.onPropertyChange);
  }

  /**
   * Cleans up all event handlers that were assigned when the Product Form was constructed.
   * Useful for use when a section needs to be reloaded in the theme editor.
   */
  ProductForm.prototype.destroy = function () {
    this._listeners.removeAll();
  };

  /**
   * Getter method which returns the array of currently selected option values
   *
   * @returns {Array} An array of option values
   */
  ProductForm.prototype.options = function () {
    return _serializeInputValues(this.optionInputs, function (item) {
      var regex = /(?:^(options\[))(.*?)(?:\])/;
      item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
      return item;
    });
  };

  /**
   * Getter method which returns the currently selected variant, or `null` if variant
   * doesn't exist.
   *
   * @returns {Object|null} Variant object
   */
  ProductForm.prototype.variant = function () {
    return getVariantFromSerializedArray(this.product, this.options());
  };

  /**
   * Getter method which returns a collection of objects containing name and values
   * of property inputs
   *
   * @returns {Array} Collection of objects with name and value keys
   */
  ProductForm.prototype.properties = function () {
    return _serializeInputValues(this.propertyInputs, function (item) {
      var regex = /(?:^(properties\[))(.*?)(?:\])/;
      item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
      return item;
    });
  };

  /**
   * Getter method which returns the current quantity or 1 if no quantity input is
   * included in the form
   *
   * @returns {Array} Collection of objects with name and value keys
   */
  ProductForm.prototype.quantity = function () {
    return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
  };

  // Private Methods
  // -----------------------------------------------------------------------------
  ProductForm.prototype._setIdInputValue = function (value) {
    var idInputElement = this.element.querySelector(selectors$p.idInput);

    if (!idInputElement) {
      idInputElement = document.createElement('input');
      idInputElement.type = 'hidden';
      idInputElement.name = 'id';
      this.element.appendChild(idInputElement);
    }

    idInputElement.value = value.toString();
  };

  ProductForm.prototype._onSubmit = function (options, event) {
    event.dataset = this._getProductFormEventData();

    this._setIdInputValue(event.dataset.variant.id);

    if (options.onFormSubmit) {
      options.onFormSubmit(event);
    }
  };

  ProductForm.prototype._onFormEvent = function (cb) {
    if (typeof cb === 'undefined') {
      return Function.prototype;
    }

    return function (event) {
      event.dataset = this._getProductFormEventData();
      cb(event);
    }.bind(this);
  };

  ProductForm.prototype._initInputs = function (selector, cb) {
    var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

    return elements.map(
      function (element) {
        this._listeners.add(element, 'change', this._onFormEvent(cb));
        return element;
      }.bind(this)
    );
  };

  ProductForm.prototype._getProductFormEventData = function () {
    return {
      options: this.options(),
      variant: this.variant(),
      properties: this.properties(),
      //quantity: this.quantity(),
    };
  };

  function _serializeInputValues(inputs, transform) {
    return inputs.reduce(function (options, input) {
      if (
        input.checked || // If input is a checked (means type radio or checkbox)
        (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
      ) {
        options.push(transform({name: input.name, value: input.value}));
      }

      return options;
    }, []);
  }

  function _validateProductObject(product) {
    if (typeof product !== 'object') {
      throw new TypeError(product + ' is not an object.');
    }

    if (typeof product.variants[0].options === 'undefined') {
      throw new TypeError(
        'Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route'
      );
    }

    return product;
  }

  const selectors$o = {
    product: '[data-product-container]',
    productForm: '[data-product-form-container]',
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productSlideshow: '[data-product-slideshow]',
    productImagesScroller: '[data-custom-scrollbar-items]',
    productImage: '[data-product-single-media-wrapper]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    unitPrice: '[data-product-unit-price]',
    unitBase: '[data-product-base]',
    unitWrapper: '[data-product-unit]',
    storeAvailabilityContainer: '[data-store-availability-container]',
    preOrderTag: '_preorder',
    dataImageId: 'data-id',
    idInput: '[name="id"]',
    notificationForm: '[data-notification-form]',
    colorLabel: '[data-color-label]',
    dataOption: '[data-option]',
    showQuantity: '[data-show-quantity]',
    shopBarImageActive: '[data-shop-bar-image-active]',
    shopBarImageActiveAttr: 'data-shop-bar-image-active',
    variantId: '[data-variant-id]',
    variantIdAttr: 'data-variant-id',
  };

  const classes$i = {
    hiddenPrice: 'product__price--hidden',
    visuallyHidden: 'visually-hidden',
    hidden: 'hidden',
    productPriceSale: 'product__price--sale',
    scrollable: 'product--layout-scrollable',
    sliderEnabled: 'flickity-enabled',
    onboarding: 'onboarding-product',
    shopBarImageShown: 'shop-bar__image--shown',
  };

  class ProductAddForm {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.product = this.container.querySelector(selectors$o.product);
      this.onboarding = this.product.classList.contains(classes$i.onboarding);
      this.scrollable = this.product.classList.contains(classes$i.scrollable);
      this.storeAvailabilityContainer = this.container.querySelector(selectors$o.storeAvailabilityContainer);

      // Stop parsing if we don't have the product
      if (!this.product || this.onboarding) {
        return;
      }

      this.productForm = this.container.querySelector(selectors$o.productForm);

      if (this.product.querySelector(selectors$o.showQuantity)) {
        const counter = new QuantityCounter(this.container);
        counter.init();
      }

      this.init();

      this.hasUnitPricing = this.container.querySelector(selectors$o.unitWrapper);
    }

    init() {
      let productJSON = null;
      const productElemJSON = this.container.querySelector(selectors$o.productJson);
      if (productElemJSON) {
        productJSON = productElemJSON.innerHTML;
      }
      if (productJSON) {
        this.productJSON = JSON.parse(productJSON);
        this.linkForm();
      } else {
        console.error('Missing product JSON');
      }

      if (this.storeAvailabilityContainer) {
        this.storeAvailability = new StoreAvailability(this.storeAvailabilityContainer);
        let variantId = this.productForm.product.variants[0].id;

        if (this.productForm.product.variants.length > 1) {
          // If there are more variants - set current variant id
          variantId = this.productForm.variant().id;
        }
        this.storeAvailability.updateContent(variantId, this.productForm.product.title);
      }
    }

    destroy() {
      this.productForm.destroy();
    }

    linkForm() {
      this.productForm = new ProductForm(this.productForm, this.productJSON, {
        onOptionChange: this.onOptionChange.bind(this),
      });
    }

    onOptionChange(evt) {
      this.updateAddToCartState(evt);
      this.updateProductImage(evt);
      this.updateProductPrices(evt);
      this.updateColorName(evt);
      this.updateHiddenSelect(evt);
      this.updateShopBarImage(evt);

      if (this.storeAvailability) {
        this.updateStoreAvailability(evt);
      }
    }

    updateHiddenSelect(evt) {
      const variant = evt.dataset.variant;

      if (variant) {
        let idInputElement = this.container.querySelector(selectors$o.idInput);
        if (!idInputElement) {
          idInputElement = document.createElement('input');
          idInputElement.type = 'hidden';
          idInputElement.name = 'id';
          this.element.appendChild(idInputElement);
        }
        idInputElement.value = variant.id.toString();
        idInputElement.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }

    updateAddToCartState(evt) {
      const variant = evt.dataset.variant;
      const notificationForm = this.container.querySelectorAll(selectors$o.notificationForm);
      const addToCart = this.container.querySelectorAll(selectors$o.addToCart);
      const addToCartText = this.container.querySelectorAll(selectors$o.addToCartText);
      const formSelects = this.container.querySelectorAll(selectors$o.originalSelectorId);
      let addText = theme.translations.add_to_cart;

      if (this.productJSON.tags.includes(selectors$o.preOrderTag)) {
        addText = theme.translations.pre_order;
      }

      if (notificationForm.length) {
        notificationForm.forEach((element) => {
          if (variant) {
            if (variant.available) {
              element.classList.add(classes$i.hidden);
            } else {
              element.classList.remove(classes$i.hidden);
            }
          } else {
            element.classList.remove(classes$i.hidden);
          }
        });
      }

      if (addToCart.length) {
        addToCart.forEach((element) => {
          if (variant) {
            if (variant.available) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          } else {
            element.disabled = true;
          }
        });
      }

      if (addToCartText.length) {
        addToCartText.forEach((element) => {
          if (variant) {
            if (variant.available) {
              element.innerHTML = addText;
            } else {
              element.innerHTML = theme.translations.sold_out;
            }
          } else {
            element.innerHTML = theme.translations.unavailable;
          }
        });
      }

      if (formSelects && variant) {
        formSelects.forEach((formSelect) => {
          formSelect.value = variant.id;
        });
      }
    }

    updateStoreAvailability(evt) {
      if (evt.dataset.variant) {
        this.storeAvailability.updateContent(evt.dataset.variant.id, evt.dataset.variant.title);
      } else {
        this.storeAvailability.clearContent();
      }
    }

    getBaseUnit(variant) {
      return variant.unit_price_measurement.reference_value === 1
        ? variant.unit_price_measurement.reference_unit
        : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
    }

    updateProductPrices(evt) {
      const variant = evt.dataset.variant;
      const priceWrappers = this.container.querySelectorAll(selectors$o.priceWrapper);

      priceWrappers.forEach((wrap) => {
        const comparePrice = wrap.querySelector(selectors$o.comparePrice);
        const productPrice = wrap.querySelector(selectors$o.productPrice);

        if (variant) {
          wrap.classList.remove(classes$i.hiddenPrice);
          productPrice.innerHTML = variant.price === 0 ? window.theme.translations.free : themeCurrency.formatMoney(variant.price, window.moneyFormat);
        } else {
          wrap.classList.add(classes$i.hiddenPrice);
        }

        if (variant && variant.compare_at_price > variant.price) {
          comparePrice.innerHTML = themeCurrency.formatMoney(variant.compare_at_price, window.moneyFormat);
          comparePrice.classList.remove(classes$i.visuallyHidden);
          productPrice.classList.add(classes$i.productPriceSale);
        } else if (comparePrice) {
          comparePrice.innerHTML = '';
          comparePrice.classList.add(classes$i.visuallyHidden);
          productPrice.classList.remove(classes$i.productPriceSale);
        }
      });

      if (this.hasUnitPricing) {
        this.updateProductUnits(evt);
      }
    }

    updateProductUnits(evt) {
      const variant = evt.dataset.variant;
      let unitPrice = null;

      if (variant && variant.unit_price) {
        unitPrice = variant.unit_price;
      }

      if (unitPrice) {
        const base = this.getBaseUnit(variant);
        const price = themeCurrency.formatMoney(variant.unit_price, window.moneyFormat);

        this.container.querySelector(selectors$o.unitPrice).innerHTML = price;
        this.container.querySelector(selectors$o.unitBase).innerHTML = base;
        this.container.querySelector(selectors$o.unitWrapper).classList.remove(classes$i.hidden);
      } else {
        this.container.querySelector(selectors$o.unitWrapper).classList.add(classes$i.hidden);
      }
    }

    updateColorName(evt) {
      const target = evt.target;
      const optionLabel = target.closest(selectors$o.dataOption).querySelector(selectors$o.colorLabel);

      if (target.tagName === 'INPUT' && optionLabel !== null) {
        optionLabel.innerText = target.value;
      }
    }

    updateProductImage(evt) {
      const variant = evt.dataset.variant;

      if (variant) {
        // Update variant image, if one is set
        if (variant.featured_media) {
          const newImg = this.container.querySelector(`${selectors$o.productImage}[${selectors$o.dataImageId}*="${variant.featured_media.id}"]`);

          if (newImg) {
            const slider = this.container.querySelector(selectors$o.productSlideshow);

            if (slider && slider.classList.contains(classes$i.sliderEnabled)) {
              const newImagePos = Array.from(newImg.parentElement.children).indexOf(newImg);
              FlickityAsNavFor.data(slider).select(newImagePos);
            }

            // Scroll to variant image
            if (this.scrollable) {
              if (window.innerWidth >= theme.sizes.small) {
                const headerHeight = 60; // Header height is always 60px on scroll
                window.scrollTo({
                  top: newImg.getBoundingClientRect().top + window.scrollY - headerHeight,
                  left: 0,
                  behavior: 'smooth',
                });
              } else {
                const scroller = this.container.querySelector(selectors$o.productImagesScroller);
                scroller.scrollTo({
                  top: 0,
                  left: newImg.getBoundingClientRect().left + scroller.scrollLeft,
                  behavior: 'smooth',
                });
              }
            }
          }
        }
      }
    }

    updateShopBarImage(evt) {
      const variant = evt.dataset.variant;
      const shopBarImages = this.container.querySelectorAll(selectors$o.variantId);
      const activeImage = this.container.querySelector(selectors$o.shopBarImageActive);

      if (!variant || variant.featured_image === null) {
        return;
      }

      if (activeImage) {
        activeImage.classList.remove(classes$i.shopBarImageShown);
        activeImage.removeAttribute(selectors$o.shopBarImageActiveAttr);
      }

      shopBarImages.forEach((element) => {
        if (Number(variant.id) === Number(element.getAttribute(selectors$o.variantIdAttr))) {
          element.classList.add(classes$i.shopBarImageShown);
          element.setAttribute(selectors$o.shopBarImageActiveAttr, '');
        }
      });
    }
  }

  const productFormSection = {
    onLoad() {
      this.section = new ProductAddForm(this);
    },
  };

  const selectors$n = {
    id: 'id',
    apiContent: '[data-api-content]',
    container: '[data-section-id]',
    collectionSlider: '[data-collection-slider]',
    collectionSliderWrapper: '[data-collection-slider-wrapper]',
    quickviewWrap: '[data-quickview-wrap]',
    quickviewId: 'data-quickview-id',
    quickviewClose: '[data-quickview-close]',
    featuredBlock: '[data-collection-featured-block]',
    productBlock: '[data-product-block]',
    productContainer: '[data-product-container]',
    productImage: '[data-product-single-media-wrapper]',
    addToCart: '[data-add-to-cart]',
    handle: 'data-trigger-quickview',
    productSlider: '[data-product-slideshow]',
    swatch: '[data-swatch]',
    videoLoop: 'data-video-looping',
  };

  const classes$h = {
    isLoading: 'is-loading',
    isLoaded: 'is-loaded',
    isSelected: 'is-selected',
    isVisible: 'is-visible',
    isQuickviewOpen: 'is-quickview-open',
    focusEnabled: 'is-focused',
    sliderEnabled: 'flickity-enabled',
    mediaHidden: 'media--hidden',
    buttonAlt: 'button--alt',
  };

  /**
   * Button constructor, triggered for each button by Quickview
   */
  class QuickviewButton {
    constructor(button, id) {
      this.button = button;
      this.id = id;
      this.container = this.button.closest(selectors$n.container);
      this.collectionSliderWrapper = this.container.querySelector(selectors$n.collectionSliderWrapper);
      this.layoutCarousel = this.container.querySelector(selectors$n.collectionSlider);
      this.handle = this.button.getAttribute(selectors$n.handle);
      this.productBlock = this.button.closest(selectors$n.productBlock);
      this.quickview = null;
      this.quickviewWrap = null;
      this.quickviewClose = null;
      this.quickviewWrapHeight = 0;
      this.isQuickViewLoading = false;
      this.accessibility = a11y;
      this.swatches = [];
      this.form = {};
      this.init();
    }

    init() {
      this.initButton();
      this.initFetch();
    }

    initFetch() {
      this.productBlock.addEventListener(
        'theme:quickview:open',
        () => {
          this.renderProduct();
        },
        false
      );
    }

    renderProduct() {
      fetch(`${theme.routes.root}products/${this.handle}?section_id=api-quickview`)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const fresh = document.createElement('div');
          fresh.innerHTML = data.replaceAll('||product-handle||', this.handle);
          const uniq = fresh.querySelector(selectors$n.quickviewWrap).dataset.quickviewId;

          if (this.layoutCarousel && this.collectionSliderWrapper) {
            this.collectionSliderWrapper.insertAdjacentHTML('beforeend', fresh.querySelector(selectors$n.apiContent).innerHTML);
          } else {
            this.productBlock.insertAdjacentHTML('beforeend', fresh.querySelector(selectors$n.apiContent).innerHTML);
          }

          this.productBlock.classList.add(classes$h.isLoaded);

          this.quickviewWrap = this.container.querySelector(`[${selectors$n.quickviewId}="${uniq}"]`);
          this.quickviewClose = this.quickviewWrap.querySelector(selectors$n.quickviewClose);
          this.quickviewWrapHeight = this.quickviewWrap.querySelector(selectors$n.productContainer).offsetHeight;
          this.quickview = this.quickviewWrap.parentNode;

          this.onLoaded();
          this.show();
        })
        .catch(function (error) {
          console.log('error: ', error);
        });
    }

    initButton() {
      const initButtons = this.productBlock.querySelectorAll(`[${selectors$n.handle}='${this.handle}']`);

      if (initButtons.length) {
        initButtons.forEach((element) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();

            const productBlockLoaded = this.productBlock.classList.contains(classes$h.isLoaded);
            const productBlockVisible = this.productBlock.classList.contains(classes$h.isQuickviewOpen);
            const siblingsVisible = this.productBlock.parentNode.querySelector(`.${classes$h.isQuickviewOpen}`) !== null;
            const eventQuickview = new CustomEvent('theme:quickview:open', {
              handle: this.handle,
            });

            if (!this.isQuickViewLoading) {
              this.isQuickViewLoading = true;

              if (productBlockLoaded && productBlockVisible) {
                // if loaded and visible
                this.hide();
              } else if (productBlockLoaded && !productBlockVisible && !siblingsVisible) {
                // if loaded but not visible, no other quickViews open
                this.show();
              } else if (productBlockLoaded && !productBlockVisible && siblingsVisible) {
                // if loaded and not visible, other quickViews are open
                this.hide();
                setTimeout(() => {
                  this.show();
                }, 200);
              } else if (siblingsVisible) {
                // if not loaded yet, other quickViews open
                this.hide();
                setTimeout(() => {
                  this.productBlock.dispatchEvent(eventQuickview);
                }, 200);
              } else {
                // if not loaded yet, no other quickViews open
                this.productBlock.dispatchEvent(eventQuickview);
              }
            }
          });
        });
      }
    }

    show() {
      const sub = (window.innerHeight - this.quickviewWrapHeight) / 2;
      const offset = this.quickviewWrap.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = offset - sub - theme.dimensions.headerScrolled;
      const featuredBlockHeight = getHeight(selectors$n.featuredBlock);
      const isFocusEnabled = document.body.classList.contains(classes$h.focusEnabled);
      const quickViewPattern = 'api-quickview';
      const quickViewIds = this.productBlock.querySelectorAll(`[id*="${quickViewPattern}"]`);
      const quickViewFors = this.productBlock.querySelectorAll(`[for*="${quickViewPattern}"]`);
      document.documentElement.style.setProperty('--collection-featured-block-height', `${featuredBlockHeight}px`);

      quickViewIds.forEach((element) => {
        const uniqueId = element.id.replace(quickViewPattern, this.id);
        element.id = uniqueId;
      });

      quickViewFors.forEach((element) => {
        const uniqueFor = element.getAttribute('for').replace(quickViewPattern, this.id);
        element.setAttribute('for', uniqueFor);
      });

      this.quickview.classList.remove(classes$h.isLoading);

      window.scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'smooth',
      });

      this.productBlock.classList.add(classes$h.isQuickviewOpen);
      this.quickview.classList.add(classes$h.isVisible);
      this.isQuickViewLoading = false;

      if (isFocusEnabled) {
        this.accessibility.trapFocus(this.quickviewWrap, {
          elementToFocus: this.quickviewClose,
        });
      }
    }

    hide() {
      const productBlocks = this.productBlock.parentNode.querySelectorAll(selectors$n.productBlock);
      const isFocusEnabled = document.body.classList.contains(classes$h.focusEnabled);
      productBlocks.forEach((productBlock) => {
        if (productBlock.classList.contains(classes$h.isQuickviewOpen)) {
          const visibleImage = productBlock.querySelector(`${selectors$n.productImage}.${classes$h.isSelected}`);
          const uniq = productBlock.dataset.quickviewElement;
          const quickviewWrap = this.container.querySelector(`[${selectors$n.quickviewId}="${uniq}"]`);
          const quickview = quickviewWrap.parentNode;
          if (visibleImage !== null) {
            visibleImage.dispatchEvent(new CustomEvent('theme:media:hidden'));
            visibleImage.classList.remove(classes$h.mediaHidden);
          }

          if (quickview) {
            quickview.classList.remove(classes$h.isVisible, classes$h.isLoading);
          }

          productBlock.classList.remove(classes$h.isQuickviewOpen);
        }
      });

      this.isQuickViewLoading = false;
      this.accessibility.removeTrapFocus();

      if (isFocusEnabled) {
        const button = document.querySelector(`[${selectors$n.handle}="${this.handle}"]`);

        setTimeout(() => {
          document.documentElement.style.setProperty('--collection-featured-block-height', 'none');
          button.focus();
        }, 300);
      }
    }

    onLoaded() {
      const sectionId = `${this.id}-${this.quickviewWrap.getAttribute(selectors$n.quickviewId)}`;
      const slider = this.quickviewWrap.querySelector(selectors$n.productSlider);
      const hasSlider = slider.classList.contains(classes$h.sliderEnabled);

      const section = {
        id: sectionId,
        container: this.quickviewWrap,
        type: 'quickview',
      };

      if (theme.settings.enableVideoLooping) {
        this.quickviewWrap.setAttribute(selectors$n.videoLoop, true);
      }

      if (hasSlider) {
        window.dispatchEvent(new Event('resize'));
      } else if (typeof theme.mediaInstances[this.id] === 'undefined') {
        theme.mediaInstances[sectionId] = new Media(section);
        theme.mediaInstances[sectionId].init();
      } else {
        theme.mediaInstances[sectionId].initSlider();
      }

      this.form = new ProductAddForm(section);

      if (theme.settings.showQuantity) {
        const counter = new QuantityCounter(section.container);
        counter.init();
      }

      const swatches = section.container.querySelectorAll(selectors$n.swatch);
      swatches.forEach((swatch) => {
        this.swatches.push(new Swatch(swatch));
      });

      this.quickviewClose.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
      });

      document.addEventListener('keyup', (event) => {
        if (event.keyCode === theme.keyboardKeys.ESCAPE && document.querySelectorAll(`${selectors$n.productBlock}.${classes$h.isVisible}`).length) {
          this.hide();
        }
      });

      const event = new CustomEvent('theme:quickview:loaded', {
        bubbles: true,
      });

      this.productBlock.dispatchEvent(event);

      this.initPaymentButton();
    }

    initPaymentButton() {
      const enablePaymentButton = theme.settings.enablePaymentButton;
      const enableAcceptTerms = theme.settings.enableAcceptTerms;
      const addToCart = this.quickviewWrap.querySelector(selectors$n.addToCart);

      if (enablePaymentButton && !enableAcceptTerms) {
        addToCart.classList.add(classes$h.buttonAlt);

        if (typeof Shopify !== 'undefined' && typeof Shopify.PaymentButton !== 'undefined' && typeof Shopify.PaymentButton.init !== 'undefined') {
          Shopify.PaymentButton.init();
        }
      } else {
        addToCart.classList.remove(classes$h.buttonAlt);
      }
    }
  }

  const selectors$m = {
    trigger: '[data-trigger-quickview]',
    dataSectionId: 'data-section-id',
  };

  const classes$g = {
    init: 'is-init',
  };

  let sections$j = {};

  class Quickview {
    constructor(container) {
      this.container = container;
      this.id = this.container.dataset.sectionId;

      if (theme.settings.showQuickView) {
        this.init();
      }
    }

    init() {
      sections$j[this.id] = [];
      const buttons = this.container.querySelectorAll(selectors$m.trigger);

      if (buttons.length) {
        buttons.forEach((element) => {
          if (!element.classList.contains(classes$g.init)) {
            sections$j[this.id].push(new QuickviewButton(element, this.id));
            element.classList.add(classes$g.init);
          }
        });
      }
    }
  }

  const quickviewSection = {
    onLoad() {
      this.section = new Quickview(this.container);
    },
  };

  const selectors$l = {
    infinityContainer: '[data-infinity]',
    pagination: '[data-pagination]',
    collectionBlockImage: '[data-product-image]',
    dataId: 'data-section-id',
  };

  let sections$i = {};

  class Ajaxify {
    constructor(container) {
      this.container = container;
      this.infinityContainer = this.container.querySelector(selectors$l.infinityContainer);
      this.endlessScroll = null;

      if (this.infinityContainer) {
        this.init();
      }
    }

    init() {
      const id = this.container.getAttribute(selectors$l.dataId);
      this.fix();
      this.endlessScroll = new Ajaxinate({
        container: `section[${selectors$l.dataId}="${id}"] ${selectors$l.infinityContainer}`,
        pagination: `section[${selectors$l.dataId}="${id}"] ${selectors$l.pagination}`,
        callback: () => {
          makeGridSwatches(this.container);
          new Quickview(this.container);
        },
      });
    }

    // Fix ajaxinate in theme editor
    fix() {
      Ajaxinate.prototype.loadMore = function loadMore() {
        this.request = new XMLHttpRequest();

        this.request.onreadystatechange = function success() {
          if (!this.request.responseXML) {
            return;
          }
          if (!this.request.readyState === 4 || !this.request.status === 200) {
            return;
          }

          const newContainer = this.request.responseXML.querySelector(this.settings.container);
          const newPagination = this.request.responseXML.querySelector(this.settings.pagination);

          this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);

          if (typeof newPagination === 'undefined' || newPagination === null) {
            this.removePaginationElement();
          } else {
            this.paginationElement.innerHTML = newPagination.innerHTML;

            if (this.settings.callback && typeof this.settings.callback === 'function') {
              this.settings.callback(this.request.responseXML);
            }

            this.initialize();
          }
        }.bind(this);

        this.request.open('GET', this.nextPageUrl, true);
        this.request.responseType = 'document';
        this.request.send();
      };
    }

    unload() {
      if (this.endlessScroll) {
        this.endlessScroll.destroy();
      }
    }
  }

  const ajaxify = {
    onLoad() {
      sections$i = new Ajaxify(this.container);
    },
    onUnload: function () {
      if (typeof sections$i.unload === 'function') {
        sections$i.unload();
      }
    },
  };

  const sections$h = {};

  class Blog {
    constructor(section) {
      this.container = section.container;
      this.checkWidthOnResize = this.checkWindowWidth();

      this.init();
    }

    init() {
      this.checkWindowWidth();

      document.addEventListener('theme:resize', this.checkWidthOnResize);
    }

    checkWindowWidth() {
      if (window.innerWidth < theme.sizes.small) {
        removeAnimations(this.container);
      }
    }

    onUnload() {
      document.removeEventListener('theme:resize', this.checkWidthOnResize);
    }
  }

  const BlogSection = {
    onLoad() {
      sections$h[this.id] = new Blog(this);
    },
    onUnload(e) {
      sections$h[this.id].onUnload(e);
    },
  };

  register('blog', [BlogSection, ajaxify]);
  register('featured-blog', BlogSection);

  const selectors$k = {
    popoutWrapper: '[data-popout]',
    popoutList: '[data-popout-list]',
    popoutToggle: '[data-popout-toggle]',
    popoutInput: '[data-popout-input]',
    popoutOptions: '[data-popout-option]',
    popoutPrevent: 'data-popout-prevent',
    popoutQuantity: 'data-quantity-field',
    dataValue: 'data-value',
    dataName: 'data-name',
    ariaExpanded: 'aria-expanded',
    ariaCurrent: 'aria-current',
  };

  const classes$f = {
    listVisible: 'popout-list--visible',
    currentSuffix: '--current',
    classPopoutAlternative: 'popout-container--alt',
  };

  let sections$g = {};

  class Popout {
    constructor(popout) {
      this.container = popout;
      this.popoutList = this.container.querySelector(selectors$k.popoutList);
      this.popoutToggle = this.container.querySelector(selectors$k.popoutToggle);
      this.popoutInput = this.container.querySelector(selectors$k.popoutInput);
      this.popoutOptions = this.container.querySelectorAll(selectors$k.popoutOptions);
      this.popoutPrevent = this.container.getAttribute(selectors$k.popoutPrevent) === 'true';

      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();

      if (this.popoutInput && this.popoutInput.hasAttribute(selectors$k.popoutQuantity)) {
        document.addEventListener('theme:popout:update', this.updatePopout.bind(this));
      }
    }

    unload() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.removeEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
          element.removeEventListener('click', this._connectOptionsDispatch.bind(this));
        });
      }

      this.popoutToggle.removeEventListener('click', this.popupToggleClick.bind(this));

      this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));

      this.popoutList.removeEventListener('focusout', this.popupListFocusout.bind(this));

      this.container.removeEventListener('keyup', this.containerKeyup.bind(this));
    }

    popupToggleClick(evt) {
      const ariaExpanded = evt.currentTarget.getAttribute(selectors$k.ariaExpanded) === 'true';
      evt.currentTarget.setAttribute(selectors$k.ariaExpanded, !ariaExpanded);
      this.popoutList.classList.toggle(classes$f.listVisible);
    }
    popupToggleFocusout(evt) {
      const popoutLostFocus = this.container.contains(evt.relatedTarget);

      if (!popoutLostFocus) {
        this._hideList();
      }
    }
    popupListFocusout(evt) {
      const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
      const isVisible = this.popoutList.classList.contains(classes$f.listVisible);

      if (isVisible && !childInFocus) {
        this._hideList();
      }
    }
    popupOptionsClick(evt) {
      evt.preventDefault();
      let attrValue = '';
      if (evt.currentTarget.getAttribute(selectors$k.dataValue)) {
        attrValue = evt.currentTarget.getAttribute(selectors$k.dataValue);
      }
      this.popoutInput.value = attrValue;

      if (this.popoutPrevent) {
        attrValue = evt.currentTarget.getAttribute(selectors$k.dataName);
        this.popoutInput.dispatchEvent(new Event('change'));
        if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(selectors$k.popoutQuantity)) {
          this.popoutInput.dispatchEvent(new Event('input'));
        }
        const currentElement = this.popoutList.querySelector(`[class*="${classes$f.currentSuffix}"]`);
        let targetClass = classes$f.currentSuffix;
        if (currentElement && currentElement.classList.length) {
          for (const currentElementClass of currentElement.classList) {
            if (currentElementClass.includes(classes$f.currentSuffix)) {
              targetClass = currentElementClass;
              break;
            }
          }
        }

        const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);
        if (listTargetElement) {
          listTargetElement.classList.remove(`${targetClass}`);
          evt.currentTarget.parentElement.classList.add(`${targetClass}`);
        }

        const targetAttribute = this.popoutList.querySelector(`[${selectors$k.ariaCurrent}]`);
        if (targetAttribute && targetAttribute.hasAttribute(`${selectors$k.ariaCurrent}`)) {
          targetAttribute.removeAttribute(`${selectors$k.ariaCurrent}`);
          evt.currentTarget.setAttribute(`${selectors$k.ariaCurrent}`, 'true');
        }

        if (attrValue !== '') {
          this.popoutToggle.textContent = attrValue;
        }

        this.popupToggleFocusout(evt);
        this.popupListFocusout(evt);
      } else {
        this._submitForm(attrValue);
      }
    }
    updatePopout(evt) {
      const targetElement = this.popoutList.querySelector(`[${selectors$k.dataValue}="${this.popoutInput.value}"]`);
      if (targetElement) {
        targetElement.dispatchEvent(
          new CustomEvent('theme:popout:click', {
            cancelable: true,
            bubbles: true,
            detail: {
              preventTrigger: true,
            },
          })
        );

        if (!targetElement.parentElement.nextSibling) {
          this.container.classList.add(classes$f.classPopoutAlternative);
        }
      } else {
        this.container.classList.add(classes$f.classPopoutAlternative);
      }
    }

    containerKeyup(evt) {
      if (evt.which !== theme.keyboardKeys.ESCAPE) {
        return;
      }
      this._hideList();
      this.popoutToggle.focus();
    }

    bodyClick(evt) {
      const isOption = this.container.contains(evt.target);
      const isVisible = this.popoutList.classList.contains(classes$f.listVisible);

      if (isVisible && !isOption) {
        this._hideList();
      }
    }

    _connectToggle() {
      this.popoutToggle.addEventListener('click', this.popupToggleClick.bind(this));
    }

    _connectOptions() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.addEventListener('theme:popout:click', this.popupOptionsClick.bind(this));
          element.addEventListener('click', this._connectOptionsDispatch.bind(this));
        });
      }
    }

    _connectOptionsDispatch(evt) {
      const event = new CustomEvent('theme:popout:click', {
        cancelable: true,
        bubbles: true,
        detail: {
          preventTrigger: false,
        },
      });

      if (!evt.target.dispatchEvent(event)) {
        evt.preventDefault();
      }
    }

    _onFocusOut() {
      this.popoutToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));

      this.popoutList.addEventListener('focusout', this.popupListFocusout.bind(this));

      this.container.addEventListener('keyup', this.containerKeyup.bind(this));

      document.body.addEventListener('click', this.bodyClick.bind(this));
    }

    _submitForm(value) {
      const form = this.container.closest('form');
      if (form) {
        form.submit();
      }
    }

    _hideList() {
      this.popoutList.classList.remove(classes$f.listVisible);
      this.popoutToggle.setAttribute(selectors$k.ariaExpanded, false);
    }
  }

  const popoutSection = {
    onLoad() {
      sections$g[this.id] = [];
      const wrappers = this.container.querySelectorAll(selectors$k.popoutWrapper);
      wrappers.forEach((wrapper) => {
        sections$g[this.id].push(new Popout(wrapper));
      });
    },
    onUnload() {
      sections$g[this.id].forEach((popout) => {
        if (typeof popout.unload === 'function') {
          popout.unload();
        }
      });
    },
  };

  const getSiblings = (el) => {
    return Array.prototype.filter.call(el.parentNode.children, function (child) {
      return child !== el;
    });
  };

  const selectors$j = {
    collapsibleTrigger: '[data-collapsible-trigger]',
    collapsibleContent: '[data-collapsible-content]',
    navHamburger: '[data-hamburger-scrollable]',
    header: 'data-header',
  };

  const attributes$4 = {
    expanded: 'aria-expanded',
    controls: 'aria-controls',
    hidden: 'aria-hidden',
    accordion: 'data-accordion',
  };

  const classes$e = {
    isExpanded: 'is-expanded',
  };

  const sections$f = {};

  class Collapsible {
    constructor(el) {
      this.section = el;
      this.triggers = this.section.querySelectorAll(selectors$j.collapsibleTrigger);
      this.resetHeight = 0;

      this.init();
    }

    init() {
      const navHamburger = document.querySelector(selectors$j.navHamburger);

      if (this.section.hasAttribute(selectors$j.header)) {
        this.triggers = [...this.triggers, ...navHamburger.querySelectorAll(selectors$j.collapsibleTrigger)];
      }

      this.triggers.forEach((trigger) => {
        trigger.addEventListener('click', (event) => this.collapsibleToggleEvent(event, trigger));
        trigger.addEventListener('keyup', (event) => this.collapsibleToggleEvent(event, trigger));
      });
    }

    collapsibleToggleEvent(e, trigger) {
      e.preventDefault();
      const dropdownId = trigger.getAttribute(attributes$4.controls);
      const isAccordion = trigger.hasAttribute(attributes$4.accordion);
      const dropdown = document.getElementById(dropdownId);
      const parent = trigger.parentNode;
      const isExpanded = parent.classList.contains(classes$e.isExpanded);
      const isSpace = e.keyCode === theme.keyboardKeys.SPACE;
      const isEscape = e.keyCode === theme.keyboardKeys.ESCAPE;
      let dropdownHeight = dropdown.querySelector(selectors$j.collapsibleContent).offsetHeight;

      // Do nothing if any different than ESC and Space key pressed
      if (e.keyCode && !isSpace && !isEscape) {
        return;
      }

      if (!isExpanded && isEscape) {
        return;
      }

      if (isExpanded) {
        setTimeout(() => {
          dropdownHeight = 0;
          this.setDropdownHeight(dropdown, dropdownHeight, isExpanded);
        }, 0);
      } else if (isAccordion) {
        const siblings = getSiblings(parent);
        siblings.forEach((sibling) => {
          if (sibling.classList.contains(classes$e.isExpanded)) {
            const trigger = sibling.querySelector(selectors$j.collapsibleTrigger);
            trigger.dispatchEvent(new Event('click'));
          }
        });
      }

      trigger.setAttribute(attributes$4.expanded, !isExpanded);
      parent.classList.toggle(classes$e.isExpanded, !isExpanded);

      this.setDropdownHeight(dropdown, dropdownHeight, isExpanded);
    }

    setDropdownHeight(dropdown, dropdownHeight, isExpanded) {
      dropdown.style.maxHeight = `${dropdownHeight}px`;
      dropdown.setAttribute(attributes$4.hidden, isExpanded);
      let maxHeight = 'none';

      if (this.resetHeight) {
        clearTimeout(this.resetHeight);
      }

      if (dropdownHeight === 0) {
        maxHeight = null;
      }

      this.resetHeight = setTimeout(() => {
        dropdown.style.maxHeight = maxHeight;
      }, 500);
    }
  }

  const collapsible = {
    onLoad() {
      sections$f[this.id] = new Collapsible(this.container);
    },
  };

  const selectors$i = {
    rangeSlider: '[data-range-slider]',
    rangeDotLeft: '[data-range-left]',
    rangeDotRight: '[data-range-right]',
    rangeLine: '[data-range-line]',
    rangeHolder: '[data-range-holder]',
    dataMin: 'data-se-min',
    dataMax: 'data-se-max',
    dataMinValue: 'data-se-min-value',
    dataMaxValue: 'data-se-max-value',
    dataStep: 'data-se-step',
    dataFilterUpdate: 'data-range-filter-update',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
  };

  const classes$d = {
    classInitialized: 'is-initialized',
  };

  class RangeSlider {
    constructor(section) {
      this.container = section.container;
      this.slider = section.querySelector(selectors$i.rangeSlider);
      this.resizeFilters = debounce(() => this.init(), 250);

      if (this.slider) {
        this.onMoveEvent = (event) => this.onMove(event);
        this.onStopEvent = (event) => this.onStop(event);
        this.onStartEvent = (event) => this.onStart(event);
        this.startX = 0;
        this.x = 0;

        // retrieve touch button
        this.touchLeft = this.slider.querySelector(selectors$i.rangeDotLeft);
        this.touchRight = this.slider.querySelector(selectors$i.rangeDotRight);
        this.lineSpan = this.slider.querySelector(selectors$i.rangeLine);

        // get some properties
        this.min = parseFloat(this.slider.getAttribute(selectors$i.dataMin));
        this.max = parseFloat(this.slider.getAttribute(selectors$i.dataMax));

        this.step = 0.0;

        // normalize flag
        this.normalizeFact = 26;

        this.init();
      }
    }

    init() {
      // retrieve default values
      let defaultMinValue = this.min;
      if (this.slider.hasAttribute(selectors$i.dataMinValue)) {
        defaultMinValue = parseFloat(this.slider.getAttribute(selectors$i.dataMinValue));
      }
      let defaultMaxValue = this.max;

      if (this.slider.hasAttribute(selectors$i.dataMaxValue)) {
        defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$i.dataMaxValue));
      }

      // check values are correct
      if (defaultMinValue < this.min) {
        defaultMinValue = this.min;
      }

      if (defaultMaxValue > this.max) {
        defaultMaxValue = this.max;
      }

      if (defaultMinValue > defaultMaxValue) {
        defaultMinValue = defaultMaxValue;
      }

      if (this.slider.getAttribute(selectors$i.dataStep)) {
        this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$i.dataStep)));
      }

      // initial reset
      this.reset();
      window.addEventListener('resize', this.resizeFilters);

      // usefull values, min, max, normalize fact is the width of both touch buttons
      this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
      this.selectedTouch = null;
      this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

      // set defualt values
      this.setMinValue(defaultMinValue);
      this.setMaxValue(defaultMaxValue);

      // link events
      this.touchLeft.addEventListener('mousedown', this.onStartEvent);
      this.touchRight.addEventListener('mousedown', this.onStartEvent);
      this.touchLeft.addEventListener('touchstart', this.onStartEvent);
      this.touchRight.addEventListener('touchstart', this.onStartEvent);

      // initialize
      this.slider.classList.add(classes$d.classInitialized);
    }

    reset() {
      this.touchLeft.style.left = '0px';
      this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.lineSpan.style.marginLeft = '0px';
      this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.startX = 0;
      this.x = 0;
    }

    setMinValue(minValue) {
      const ratio = (minValue - this.min) / (this.max - this.min);
      this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$i.dataMinValue, minValue);
    }

    setMaxValue(maxValue) {
      const ratio = (maxValue - this.min) / (this.max - this.min);
      this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$i.dataMaxValue, maxValue);
    }

    onStart(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      if (event.currentTarget === this.touchLeft) {
        this.x = this.touchLeft.offsetLeft;
      } else {
        this.x = this.touchRight.offsetLeft;
      }

      this.startX = eventTouch.pageX - this.x;
      this.selectedTouch = event.currentTarget;
      this.slider.addEventListener('mousemove', this.onMoveEvent);
      this.slider.addEventListener('mouseup', this.onStopEvent);
      this.slider.addEventListener('touchmove', this.onMoveEvent);
      this.slider.addEventListener('touchend', this.onStopEvent);
    }

    onMove(event) {
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      this.x = eventTouch.pageX - this.startX;

      if (this.selectedTouch === this.touchLeft) {
        if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
          this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
        } else if (this.x < 0) {
          this.x = 0;
        }

        this.selectedTouch.style.left = this.x + 'px';
      } else if (this.selectedTouch === this.touchRight) {
        if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
          this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
        } else if (this.x > this.maxX) {
          this.x = this.maxX;
        }
        this.selectedTouch.style.left = this.x + 'px';
      }

      // update line span
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

      // write new value
      this.calculateValue();

      // call on change
      if (this.slider.getAttribute('on-change')) {
        const fn = new Function('min, max', this.slider.getAttribute('on-change'));
        fn(this.slider.getAttribute(selectors$i.dataMinValue), this.slider.getAttribute(selectors$i.dataMaxValue));
      }

      this.onChange(this.slider.getAttribute(selectors$i.dataMinValue), this.slider.getAttribute(selectors$i.dataMaxValue));
    }

    onStop(event) {
      this.slider.removeEventListener('mousemove', this.onMoveEvent);
      this.slider.removeEventListener('mouseup', this.onStopEvent);
      this.slider.removeEventListener('touchmove', this.onMoveEvent);
      this.slider.removeEventListener('touchend', this.onStopEvent);

      this.selectedTouch = null;

      // write new value
      this.calculateValue();

      // call did changed
      this.onChanged(this.slider.getAttribute(selectors$i.dataMinValue), this.slider.getAttribute(selectors$i.dataMaxValue));
    }

    onChange(min, max) {
      const rangeHolder = this.slider.closest(selectors$i.rangeHolder);
      if (rangeHolder) {
        const priceMin = rangeHolder.querySelector(selectors$i.priceMin);
        const priceMax = rangeHolder.querySelector(selectors$i.priceMax);

        if (priceMin && priceMax) {
          priceMin.value = min;
          priceMax.value = max;
        }
      }
    }

    onChanged(min, max) {
      if (this.slider.hasAttribute(selectors$i.dataFilterUpdate)) {
        this.slider.dispatchEvent(new CustomEvent('theme:filter:range-update', {bubbles: true}));
      }
    }

    calculateValue() {
      const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
      let minValue = this.lineSpan.offsetLeft / this.initialValue;
      let maxValue = minValue + newValue;

      minValue = minValue * (this.max - this.min) + this.min;
      maxValue = maxValue * (this.max - this.min) + this.min;

      if (this.step !== 0.0) {
        let multi = Math.floor(minValue / this.step);
        minValue = this.step * multi;

        multi = Math.floor(maxValue / this.step);
        maxValue = this.step * multi;
      }

      if (this.selectedTouch === this.touchLeft) {
        this.slider.setAttribute(selectors$i.dataMinValue, minValue);
      }

      if (this.selectedTouch === this.touchRight) {
        this.slider.setAttribute(selectors$i.dataMaxValue, maxValue);
      }
    }

    onUnload() {
      if (this.resizeFilters) {
        window.removeEventListener('resize', this.resizeFilters);
      }
    }
  }

  const sections$e = {};

  const selectors$h = {
    ariaExpanded: 'aria-expanded',
    ariaHidden: 'aria-hidden',
    collectionBlockImage: '[data-product-image]',
    collectionGridWrapper: '[data-collection-grid-wrapper]',
    collectionProducts: '[data-collection-products]',
    collectionSort: '[data-collection-sort]',
    collectionWrapper: '[data-collection-wrapper]',
    dataCollection: 'data-collection',
    dataCount: 'data-count',
    dataFilterMode: 'data-filter-mode',
    dataSort: 'data-sort',
    dataTag: 'data-tag',
    dataTags: 'data-tags',
    filter: '[data-filter]',
    filterContainer: '[data-filter-container]',
    filterCount: '[data-filter-count]',
    filterTag: '[data-filter-tag]',
    filterTagButton: '[data-filter-tag-button]',
    filterTitle: '[data-collapsible-trigger]',
    filters: '[data-filters]',
    filtersAvailable: 'data-filters-available',
    filtersResets: '[data-filters-reset]',
    filtersResetButton: '[data-filters-reset-button]',
    filtersEnable: 'data-filters-enable',
    filtersForm: '[data-filters-form]',
    filtersResetButtons: '[data-filter-reset-button]',
    inputs: 'input, select, label, textarea',
    pagination: '[data-pagination]',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
    priceMinValue: 'data-field-price-min',
    priceMaxValue: 'data-field-price-max',
    rangeMin: '[data-se-min-value]',
    rangeMax: '[data-se-max-value]',
    rangeMinValue: 'data-se-min-value',
    rangeMaxValue: 'data-se-max-value',
    swatch: 'data-swatch',
  };

  const classes$c = {
    filtersTop: 'collection__filters--top',
    filtersHasTagsSelected: 'collection__filters--has-tags-selected',
    hasTagsExpanded: 'has-tags-expanded',
    isActive: 'is-active',
    isExpanded: 'is-expanded',
    isLoading: 'is-loading',
  };

  class Collection {
    constructor(section) {
      this.container = section.container;
      this.collectionGridWrapper = this.container.querySelector(selectors$h.collectionGridWrapper);
      this.collectionSort = this.container.querySelector(selectors$h.collectionSort);
      this.collectionProducts = this.container.querySelector(selectors$h.collectionProducts);
      this.collectionWrapper = this.container.querySelector(selectors$h.collectionWrapper);
      this.pagination = this.container.querySelector(selectors$h.pagination);
      this.filterMode = this.container.getAttribute(selectors$h.dataFilterMode);
      this.filters = this.container.querySelector(selectors$h.filters);
      this.filtersEnable = this.container.getAttribute(selectors$h.filtersEnable) === 'true';
      this.filtersForm = this.container.querySelector(selectors$h.filtersForm);
      this.filtersResets = this.container.querySelector(selectors$h.filtersResets);
      this.filtersInputs = [];
      this.sort = null;
      this.tags = null;
      this.collection = null;
      this.reset = null;
      this.resizeFiltersEvent = () => this.checkFiltersPosition();
      this.documentClick = (e) => this.closeOnOutsideClick(e);

      this.init();
    }

    init() {
      if (this.collectionSort) {
        this.initSort();
      }

      if (this.collectionProducts) {
        this.collection = this.collectionProducts.getAttribute(selectors$h.dataCollection);
      }

      if (this.filtersEnable) {
        if (this.filterMode === 'tag' || this.filterMode === 'group') {
          this.tags = JSON.parse(this.collectionProducts.getAttribute(selectors$h.dataTags));
          this.initFilters();
        }

        if (this.filterMode === 'default') {
          this.initFacetedFilters();
        }
      }

      this.initFilterToggleButtons();
      this.checkFiltersPosition();
      document.addEventListener('theme:resize', this.resizeFiltersEvent);
    }

    initSort() {
      this.collectionSort.addEventListener('change', (evt) => {
        const url = new window.URL(window.location.href);
        const value = evt.currentTarget.value;
        const params = url.searchParams;
        params.set('sort_by', value);
        url.search = params.toString();
        this.collectionProducts.setAttribute(selectors$h.dataSort, value);
        this.requestFilteredProducts(url.toString());
      });
    }

    initFilterToggleButtons() {
      if (!this.filters) {
        return;
      }

      const filterTitles = this.filters.querySelectorAll(selectors$h.filterTitle);

      // Bind toggle buttons
      filterTitles.forEach((title) => {
        title.addEventListener('click', () => {
          this.toggleTitle(title);
        });

        if (this.isTopPosition()) {
          title.setAttribute(selectors$h.ariaExpanded, false);
          title.parentNode.classList.remove(classes$c.isExpanded);
          title.parentNode.querySelector(selectors$h.filterContainer).setAttribute(selectors$h.ariaHidden, true);
        }
      });

      // Close horizontal filters on click outside their container
      document.addEventListener('click', this.documentClick);
    }

    initFacetedFilters() {
      if (!this.filters.hasAttribute(selectors$h.filtersAvailable)) {
        return;
      }

      new RangeSlider(this.filtersForm);
      this.filtersInputs = this.filtersForm.querySelectorAll(selectors$h.inputs);

      if (this.filtersInputs.length) {
        this.filtersInputs.forEach((el) => {
          el.addEventListener(
            'input',
            debounce(() => {
              if (this.filtersForm && typeof this.filtersForm.submit === 'function') {
                this.submitForm();
              }
            }, 500)
          );
        });
      }

      this.filtersForm.addEventListener('theme:filter:range-update', () => this.updateRange());
      this.initResets();
    }

    submitForm() {
      const formData = new FormData(this.filtersForm);
      const search = new URLSearchParams(formData);
      this.requestFilteredProducts(`${this.collection}${search.toString()}`);
    }

    initFilters() {
      const filterButtons = this.filters.querySelectorAll(selectors$h.filterTagButton);

      // Select filter
      filterButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          this.toggleFilter(button);
          e.preventDefault();
        });
      });

      this.initResets();
    }

    initResets() {
      const resets = this.container.querySelectorAll(selectors$h.filtersResetButtons);
      this.resetAlt = this.collectionProducts.querySelector(selectors$h.filtersResetButton);

      // Bind reset
      if (resets.length) {
        resets.forEach((button) => {
          button.addEventListener('click', (e) => this.bindResetButton(e));
        });
      }
      if (this.resetAlt) {
        this.resetAlt.addEventListener('click', (e) => this.bindResetButton(e));
      }
    }

    toggleTitle(title) {
      const filter = title.parentNode;
      const filters = getSiblings(filter);
      const isAriaExpanded = title.getAttribute('aria-expanded') === 'true';

      this.filters.classList.toggle(classes$c.hasTagsExpanded, !isAriaExpanded);

      if (this.isTopPosition()) {
        filters.forEach((filter) => {
          filter.classList.remove(classes$c.isExpanded);
          if (filter.querySelector(selectors$h.filterContainer)) {
            filter.querySelector(selectors$h.filterContainer).setAttribute(selectors$h.ariaHidden, true);
          }
          if (filter.querySelector(selectors$h.filterTitle)) {
            filter.querySelector(selectors$h.filterTitle).setAttribute(selectors$h.ariaExpanded, false);
          }
        });
      }
    }

    toggleFilter(button) {
      const filterTag = button.parentNode;
      const selectedTag = button.getAttribute(selectors$h.dataTag);
      const isTagActive = filterTag.classList.contains(classes$c.isActive);
      const title = filterTag.parentNode.parentNode.previousElementSibling;
      this.sort = this.collectionProducts.getAttribute(selectors$h.dataSort);
      let sortParam = '';

      if (isTagActive) {
        const tagIndex = this.tags.indexOf(selectedTag);

        filterTag.classList.remove(classes$c.isActive);

        if (tagIndex > -1) {
          this.tags.splice(tagIndex, 1);
        }
      } else {
        filterTag.classList.add(classes$c.isActive);
        this.tags.push(selectedTag);
      }

      this.collectionProducts.setAttribute(selectors$h.dataTags, this.tags);

      const groupFiltersCount = filterTag.parentNode.querySelectorAll(`.${classes$c.isActive}`).length;

      title.querySelector(selectors$h.filterCount).setAttribute(selectors$h.dataCount, groupFiltersCount);

      if (this.isTopPosition() || isTagActive) {
        title.dispatchEvent(new Event('click'));
      }

      if (this.sort) {
        sortParam = `?sort_by=${this.sort}`;
      }

      const requestedURL = `${this.collection}/${this.tags.join('+')}${sortParam}`;

      this.requestFilteredProducts(requestedURL);
    }

    updateRange() {
      if (this.filtersForm && typeof this.filtersForm.submit === 'function') {
        const rangeMin = this.filtersForm.querySelector(selectors$h.rangeMin);
        const rangeMax = this.filtersForm.querySelector(selectors$h.rangeMax);
        const priceMin = this.filtersForm.querySelector(selectors$h.priceMin);
        const priceMax = this.filtersForm.querySelector(selectors$h.priceMax);
        const checkElements = rangeMin && rangeMax && priceMin && priceMax;

        if (checkElements && rangeMin.hasAttribute(selectors$h.rangeMinValue) && rangeMax.hasAttribute(selectors$h.rangeMaxValue)) {
          const priceMinValue = parseInt(priceMin.placeholder);
          const priceMaxValue = parseInt(priceMax.placeholder);
          const rangeMinValue = parseInt(rangeMin.getAttribute(selectors$h.rangeMinValue));
          const rangeMaxValue = parseInt(rangeMax.getAttribute(selectors$h.rangeMaxValue));

          if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
            priceMin.value = rangeMinValue;
            priceMax.value = rangeMaxValue;

            this.submitForm();
          }
        }
      }
    }

    closeOnOutsideClick(e) {
      const isFiltersContainer = this.filters.contains(e.target);
      const isFilterExpanded = this.filters.classList.contains(classes$c.hasTagsExpanded);

      // Close filter
      if (!isFiltersContainer && isFilterExpanded && this.isTopPosition()) {
        const expandedFilter = this.filters.querySelector(`${selectors$h.filter}.${classes$c.isExpanded}`);
        expandedFilter.querySelector(selectors$h.filterTitle).dispatchEvent(new Event('click'));
      }
    }

    requestFilteredProducts(url) {
      const collectionWrapperTop = parseInt(Math.ceil(this.collectionWrapper.offsetTop) - theme.dimensions.headerScrolled);

      this.collectionWrapper.classList.add(classes$c.isLoading);

      // Scroll back to top
      window.scrollTo({
        top: collectionWrapperTop,
        left: 0,
        behavior: 'smooth',
      });

      if (history.replaceState) {
        window.history.pushState({path: url}, '', url);
      }

      fetch(url)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const createdElement = document.createElement('div');
          createdElement.innerHTML = data;
          const collectionProducts = createdElement.querySelector(selectors$h.collectionProducts).innerHTML;
          const pagination = createdElement.querySelector(selectors$h.pagination);
          const filters = createdElement.querySelector(selectors$h.filters);

          this.collectionProducts.innerHTML = collectionProducts;

          if (this.pagination) {
            this.pagination.innerHTML = pagination !== null ? pagination.innerHTML : '';
          }

          if (!this.pagination && pagination !== null) {
            this.collectionGridWrapper.appendChild(pagination);
            this.pagination = this.collectionGridWrapper.querySelector(selectors$h.pagination);
          }

          if (filters) {
            const filtersHTML = filters.innerHTML;

            this.filters.innerHTML = filtersHTML;
            this.filtersForm = this.filters.querySelector(selectors$h.filtersForm);

            if (this.filterMode === 'tag' || this.filterMode === 'group') {
              this.initFilters();

              // Show reset button if there are tags selected
              if (this.tags.length > 0) {
                this.filters.classList.add(classes$c.filtersHasTagsSelected);
              } else {
                this.filters.classList.remove(classes$c.filtersHasTagsSelected);
              }
            }

            if (this.filterMode === 'default') {
              this.initFacetedFilters();
            }

            this.checkFiltersPosition();
            this.initFilterToggleButtons();
            this.bindSwatchFilters();
            new Collapsible(this.container);
          }

          ajaxify.onUnload();
          new Ajaxify(this.container);
          makeGridSwatches(this.container);
          new Quickview(this.container);
        })
        .catch((e) => {
          this.collectionWrapper.classList.remove(classes$c.isLoading);
        })
        .finally(() => {
          // Stop loading animation
          setTimeout(() => {
            this.collectionWrapper.classList.remove(classes$c.isLoading);
          }, 450);
        });
    }

    checkFiltersPosition() {
      if (!this.filters) {
        return;
      }

      const filters = this.filters.querySelectorAll(selectors$h.filter);
      // Run only if filters position is set to "Top" or window width is < 1279
      if (this.isTopPosition()) {
        this.filters.classList.remove(classes$c.hasTagsExpanded);

        filters.forEach((filter) => {
          const dropdownExpanded = filter.classList.contains(classes$c.isExpanded);

          // Check if dropdown is expanded and close it
          if (dropdownExpanded) {
            filter.classList.remove(classes$c.isExpanded);
            if (filter.querySelector(selectors$h.filterContainer)) {
              filter.querySelector(selectors$h.filterContainer).setAttribute(selectors$h.ariaHidden, true);
              filter.querySelector(selectors$h.filterContainer).style.maxHeight = 0;
            }
            if (filter.querySelector(selectors$h.filterTitle)) {
              filter.querySelector(selectors$h.filterTitle).setAttribute(selectors$h.ariaExpanded, false);
            }
          }
        });
      }
    }

    isTopPosition() {
      return window.innerWidth < theme.sizes.widescreen || this.filters.classList.contains(classes$c.filtersTop);
    }

    bindSwatchFilters() {
      this.swatches = [];
      const els = this.container.querySelectorAll(`[${selectors$h.swatch}]`);
      els.forEach((el) => {
        this.swatches.push(new Swatch(el));
      });
    }

    bindResetButton(e) {
      e.preventDefault();

      if (this.filterMode === 'tag' || this.filterMode === 'group') {
        const button = e.currentTarget;
        if (button.getAttribute(selectors$h.dataTag)) {
          const selectedTag = button.dataset.tag;
          const tagIndex = this.tags.indexOf(selectedTag);

          if (tagIndex > -1) {
            this.tags.splice(tagIndex, 1);
          }
        } else {
          this.tags = [];
        }
        this.collectionProducts.setAttribute(selectors$h.dataTags, this.tags);
      }

      this.requestFilteredProducts(e.currentTarget.href);
    }

    onUnload() {
      document.removeEventListener('click', this.documentClick);
      document.removeEventListener('theme:resize', this.resizeFiltersEvent);
    }
  }

  const CollectionSection = {
    onLoad() {
      sections$e[this.id] = new Collection(this);
    },
    onUnload(e) {
      sections$e[this.id].onUnload(e);
    },
  };

  register('collection', [CollectionSection, collapsible, quickviewSection, ajaxify, swatchGridSection, swatchSection, popoutSection]);
  register('search-template', [CollectionSection, collapsible, quickviewSection, ajaxify, swatchGridSection, swatchSection, popoutSection]);

  class PopupCookie {
    constructor(name, value, expires) {
      this.configuration = {
        expires: expires, // session cookie
        path: '/',
        domain: window.location.hostname,
      };
      this.name = name;
      this.value = value;
    }

    write() {
      const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));
      if (hasCookie || document.cookie.indexOf('; ') === -1) {
        document.cookie = `${this.name}=${this.value}; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
      }
    }

    read() {
      if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
        const returnCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(this.name))
          .split('=')[1];

        return returnCookie;
      } else {
        return false;
      }
    }

    destroy() {
      if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
        document.cookie = `${this.name}=null; expires=${this.configuration.expires}; path=${this.configuration.path}; domain=${this.configuration.domain}`;
      }
    }
  }

  const selectors$g = {
    newsletterForm: '[data-newsletter-form]',
    popup: '[data-popup]',
  };

  const classes$b = {
    success: 'sign-up-posted',
    fail: 'sign-up-failed',
  };

  const attributes$3 = {
    testmode: 'data-testmode',
    checkTrueString: 'true',
  };

  const sections$d = {};

  class NewsletterCheckForResult {
    constructor(newsletter) {
      this.sessionStorage = window.sessionStorage;
      this.newsletter = newsletter;
      this.popup = this.newsletter.closest(selectors$g.popup);
      this.cookie = new PopupCookie('newsletter', 'user_has_closed', null);

      this.stopSubmit = true;
      this.isChallengePage = false;
      this.formID = null;

      this.checkForChallengePage();

      this.newsletterSubmit = (e) => this.newsletterSubmitEvent(e);

      if (!this.isChallengePage) {
        this.init();
      }
    }

    init() {
      this.newsletter.addEventListener('submit', this.newsletterSubmit);

      this.showMessage();
    }

    newsletterSubmitEvent(e) {
      if (this.stopSubmit) {
        e.preventDefault();

        this.removeStorage();
        this.writeStorage();
        this.stopSubmit = false;
        this.newsletter.submit();
      }
    }

    checkForChallengePage() {
      this.isChallengePage = window.location.pathname === '/challenge';
    }

    writeStorage() {
      if (this.sessionStorage !== undefined) {
        this.sessionStorage.setItem('newsletter_form_id', this.newsletter.id);
      }
    }

    readStorage() {
      this.formID = this.sessionStorage.getItem('newsletter_form_id');
    }

    removeStorage() {
      this.sessionStorage.removeItem('newsletter_form_id');
    }

    showMessage() {
      this.readStorage();

      if (this.newsletter.id === this.formID) {
        const newsletter = document.getElementById(this.formID);
        const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;
        const submissionFailure = window.location.search.indexOf('accepts_marketing') !== -1;

        if (submissionSuccess) {
          newsletter.classList.remove(classes$b.error);
          newsletter.classList.add(classes$b.success);

          this.scrollToForm(newsletter);

          if (this.popup && this.popup.getAttribute(attributes$3.testmode) !== attributes$3.checkTrueString) {
            this.cookie.write();
          }
        } else if (submissionFailure) {
          newsletter.classList.remove(classes$b.success);
          newsletter.classList.add(classes$b.fail);

          this.scrollToForm(newsletter);
        }
      }
    }

    scrollToForm(newsletter) {
      const rect = newsletter.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);

      if (!isVisible) {
        setTimeout(() => {
          window.scroll({
            top: rect.top,
            left: 0,
            behavior: 'smooth',
          });
        }, 400);
      }
    }
  }

  const newsletterCheckForResultSection = {
    onLoad() {
      sections$d[this.id] = [];
      const newsletters = this.container.querySelectorAll(selectors$g.newsletterForm);
      newsletters.forEach((form) => {
        sections$d[this.id].push(new NewsletterCheckForResult(form));
      });
    },
    onUnload() {
      sections$d[this.id].forEach((form) => {
        if (typeof form.unload === 'function') {
          form.unload();
        }
      });
    },
  };

  const footerSection = {
    onLoad() {
      // Lighthouse fires security warning for the Shopify link.
      var shopifyLink = document.querySelector('[data-powered-link] a');
      if (shopifyLink) {
        shopifyLink.setAttribute('rel', 'noopener');
      }
    },
  };

  register('footer', [popoutSection, footerSection, newsletterCheckForResultSection]);

  /* eslint-disable consistent-return */

  const sections$c = {};

  const selectors$f = {
    faq: '[data-faq]',
    faqNav: '[data-faq-nav]',
    faqTrigger: '[data-faq-trigger]',
    faqContent: '[data-faq-content]',
    faqAnswerWrapper: '[data-faq-answer-wrapper]',
    faqAnswer: '[data-faq-answer]',
  };

  const attributes$2 = {
    expanded: 'aria-expanded',
    controls: 'aria-controls',
    hidden: 'aria-hidden',
    type: 'data-type',
    index: 'data-index',
  };

  const classes$a = {
    isActive: 'is-active',
  };

  class FaqList {
    constructor(section) {
      this.container = section.container;
      this.faq = this.container.querySelector(selectors$f.faq);
      this.resetHeight = 0;
      this.scrollTimeout = 0;

      if (this.faq) {
        this.faqNav = this.faq.querySelector(selectors$f.faqNav);
        this.faqTriggers = this.faq.querySelectorAll(selectors$f.faqTrigger);
        this.faqContents = this.faq.querySelectorAll(selectors$f.faqContent);
        this.faqTriggerClickEvent = (e) => this.faqTriggerClick(e);

        this.init();
      }
    }

    init() {
      this.faqTriggers.forEach((faqTrigger) => {
        faqTrigger.addEventListener('click', this.faqTriggerClickEvent);
        faqTrigger.addEventListener('keyup', this.faqTriggerClickEvent);
      });
    }

    faqTriggerClick(e) {
      e.preventDefault();
      const trigger = e.target.closest(selectors$f.faqTrigger) || e.target;
      const parent = trigger.parentElement;
      const isActive = parent.classList.contains(classes$a.isActive);
      const itemsCount = this.faqContents.length;
      const isSpace = e.keyCode === theme.keyboardKeys.SPACE;
      const isEscape = e.keyCode === theme.keyboardKeys.ESCAPE;

      // Do nothing if any different than ESC and Space key pressed
      if (e.keyCode && !isSpace && !isEscape) {
        return;
      }

      if (!isActive && isEscape) {
        return;
      }

      if (trigger.dataset.type == 'tab') {
        // Do nothing if there's a single item on Desktop
        if (itemsCount === 1 && window.innerWidth >= theme.sizes.small) {
          return;
        }
      }

      // Toggle active item
      this.toggleActiveItem(trigger);
    }

    toggleActiveItem(trigger) {
      const parent = trigger.parentElement;
      const isActive = parent.classList.contains(classes$a.isActive);
      const itemsCount = this.faqContents.length;
      let triggerIndex = parseInt(trigger.getAttribute(attributes$2.index));

      if (isActive) {
        if (trigger.dataset.type == 'accordion') {
          this.hideItem(trigger);
        }

        if (trigger.dataset.type == 'tab') {
          // Get next element
          triggerIndex += 1;

          // Check if next faq exists or set to first
          if (this.faqTriggers[triggerIndex] === undefined || triggerIndex >= itemsCount) {
            triggerIndex = 0;
          }

          // Open next tab
          this.faqTriggers[triggerIndex].dispatchEvent(new Event('click'));
        }
      } else {
        this.showItem(trigger);
        this.hideSiblings(trigger);
      }
    }

    showItem(trigger) {
      const itemId = trigger.getAttribute(attributes$2.controls);
      const item = document.getElementById(itemId);
      const parent = item.parentNode;
      const triggerParent = trigger.parentNode;
      const itemInner = item.querySelector(selectors$f.faqAnswer);
      const itemHeight = itemInner.offsetHeight;
      const isActive = false;

      triggerParent.classList.add(classes$a.isActive);
      parent.classList.add(classes$a.isActive);
      parent.querySelector(selectors$f.faqTrigger).setAttribute(attributes$2.expanded, true);

      this.setDropdownHeight(item, itemHeight, isActive);

      // Scroll to the expanded item on mobile
      this.scrollToItemOnMobile(item);
    }

    hideItem(trigger) {
      const itemId = trigger.getAttribute(attributes$2.controls);
      const item = document.getElementById(itemId);
      const itemInner = item.querySelector(selectors$f.faqAnswer);
      let itemHeight = itemInner.offsetHeight;
      const parent = item.parentNode;
      const triggerParent = trigger.parentNode;
      const isActive = true;

      setTimeout(() => {
        itemHeight = 0;
        this.setDropdownHeight(item, itemHeight, isActive);
      }, 0);

      triggerParent.classList.remove(classes$a.isActive);
      parent.classList.remove(classes$a.isActive);
      parent.querySelector(selectors$f.faqTrigger).setAttribute(attributes$2.expanded, false);

      this.setDropdownHeight(item, itemHeight, isActive);
    }

    // Close all other active tabs
    hideSiblings(trigger) {
      const parent = trigger.parentElement;
      const siblings = getSiblings(parent);

      if (siblings) {
        siblings.forEach((sibling) => {
          const trigger = sibling.querySelector(selectors$f.faqTrigger);
          if (sibling.classList.contains(classes$a.isActive)) {
            this.hideItem(trigger);
          }
        });
      }
    }

    setDropdownHeight(dropdown, dropdownHeight, isActive) {
      dropdown.style.maxHeight = `${dropdownHeight}px`;
      dropdown.setAttribute(attributes$2.hidden, isActive);
      let maxHeight = 'none';

      if (this.resetHeight) {
        clearTimeout(this.resetHeight);
      }

      if (dropdownHeight === 0) {
        maxHeight = null;
      }

      this.resetHeight = setTimeout(() => {
        dropdown.style.maxHeight = maxHeight;
      }, 250);
    }

    scrollToItemOnMobile(item) {
      if (window.innerWidth < theme.sizes.small || Shopify.designMode) {
        const timeout = Shopify.designMode ? 400 : 250;

        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(() => {
          const titleTop = item.parentElement.getBoundingClientRect().top - document.body.getBoundingClientRect().top - theme.dimensions.headerScrolled;

          window.scrollTo({
            top: titleTop,
            left: 0,
            behavior: 'smooth',
          });
        }, timeout);
      }
    }
  }

  const FaqListSection = {
    onLoad() {
      sections$c[this.id] = new FaqList(this);
    },
    onBlockSelect(e) {
      const faqTrigger = e.target.querySelector(selectors$f.faqTrigger);
      if (!e.target.classList.contains(classes$a.isActive)) {
        faqTrigger.dispatchEvent(new Event('click'));
      }
    },
    onBlockDeselect(e) {
      const faqTrigger = e.target.querySelector(selectors$f.faqTrigger);
      if (e.target.classList.contains(classes$a.isActive) && faqTrigger.getAttribute(attributes$2.type) == 'accordion') {
        faqTrigger.dispatchEvent(new Event('click'));
      }
    },
  };

  register('faq', [FaqListSection]);

  const sections$b = {};

  const selectors$e = {
    slider: '[data-collection-slider]',
    prevArrow: '[data-prev-arrow]',
    nextArrow: '[data-next-arrow]',
    productBlock: '[data-product-block]',
    productImage: '[data-product-image]',
    quickviewId: 'data-quickview-id',
    quickviewWrap: '[data-quickview-wrap]',
    quickviewButton: '[data-trigger-quickview]',
  };

  const classes$9 = {
    isVisible: 'is-visible',
    flickityEnabled: 'flickity-enabled',
    isQuickviewOpen: 'is-quickview-open',
  };

  class CollectionSlider {
    constructor(section) {
      this.container = section.container;
      this.slideshow = this.container.querySelector(selectors$e.slider);
      this.productBlocks = this.container.querySelectorAll(selectors$e.productBlock);
      this.productImages = this.container.querySelectorAll(selectors$e.productImage);
      this.slideshowPrev = this.container.querySelector(selectors$e.prevArrow);
      this.slideshowNext = this.container.querySelector(selectors$e.nextArrow);
      this.flkty = null;
      this.resizeEvents = () => {
        this.sliderInit();
        this.setArrowPosition();
        this.setQuickViewPosition();
      };

      if (this.slideshow && this.productBlocks.length) {
        this.init();
      }
    }

    init() {
      this.slideshowPrev.addEventListener('click', this.goToPrevSlide.bind(this));
      this.slideshowNext.addEventListener('click', this.goToNextSlide.bind(this));

      removeAnimations(this.container);

      this.sliderInit();

      this.productBlocks.forEach((productBlock) => {
        productBlock.addEventListener('theme:quickview:loaded', () => {
          productBlock.classList.add(classes$9.isQuickviewOpen);
          this.setQuickViewPosition();
        });
      });

      document.addEventListener('theme:resize', this.resizeEvents);
    }

    sliderInit() {
      const sliderInitialized = this.slideshow.classList.contains(classes$9.flickityEnabled);

      if (window.innerWidth >= theme.sizes.small) {
        if (!sliderInitialized) {
          this.flkty = new Flickity(this.slideshow, {
            groupCells: '100%',
            autoPlay: false,
            prevNextButtons: false,
            pageDots: false,
            wrapAround: false,
            cellAlign: 'left',
            contain: true,
            on: {
              ready: () => {
                this.setArrowPosition();
              },
              change: function () {
                const visibleQuickView = this.element.querySelector(`${selectors$e.productBlock}.${classes$9.isVisible}`);

                if (visibleQuickView !== null) {
                  visibleQuickView.querySelector(selectors$e.quickviewButton).dispatchEvent(new Event('click'));
                }
              },
            },
          });
        }
      } else if (sliderInitialized) {
        this.flkty.destroy();
      }
    }

    goToPrevSlide(e) {
      e.preventDefault();

      this.flkty.previous(true);
    }

    goToNextSlide(e) {
      e.preventDefault();

      this.flkty.next(true);
    }

    setArrowPosition() {
      const productBlock = this.slideshow.querySelector(selectors$e.productImage);
      if (!productBlock) return;

      let arrowTop = productBlock.offsetHeight / 2;
      const arrowHeight = this.slideshowPrev.offsetHeight / 2;
      arrowTop -= arrowHeight;
      this.slideshowPrev.style.top = `${arrowTop}px`;
      this.slideshowNext.style.top = `${arrowTop}px`;
    }

    setQuickViewPosition() {
      // Get the product block that has Quick view opened
      const productBlock = this.slideshow.querySelector(`.${classes$9.isQuickviewOpen}`);

      if (productBlock === null) {
        return;
      }

      const uniq = productBlock.dataset.quickviewElement;
      const quickviewWrap = this.container.querySelector(`[${selectors$e.quickviewId}="${uniq}"]`);
      const sliderPadding = parseInt(window.getComputedStyle(this.slideshow).paddingLeft.replace('px', ''));
      const sliderInnerWidth = this.slideshow.offsetWidth - sliderPadding * 2;

      if (quickviewWrap) {
        let offsetLeft = productBlock.offsetLeft;

        if (offsetLeft >= sliderInnerWidth) {
          offsetLeft %= sliderInnerWidth;
        }

        quickviewWrap.style.left = `calc(${productBlock.style.left} - ${offsetLeft}px)`;
        quickviewWrap.style.width = '100%';
      }
    }

    onUnload() {
      if (this.slideshow) {
        const sliderInitialized = this.slideshow.classList.contains(classes$9.flickityEnabled);

        if (sliderInitialized) {
          this.flkty.destroy();
        }
      }

      document.removeEventListener('theme:resize', this.resizeEvents);
    }
  }

  const FeaturedCollectionSection = {
    onLoad() {
      sections$b[this.id] = new CollectionSlider(this);
    },
    onUnload(e) {
      sections$b[this.id].onUnload(e);
    },
  };

  register('featured-collection', [FeaturedCollectionSection, quickviewSection, swatchGridSection]);

  const outerWidth = (el) => {
    const style = getComputedStyle(el);
    let width = el.offsetWidth;

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);

    return width;
  };

  const selectors$d = {
    menuToggle: '[data-menu-toggle]',
    hamburgerIcon: '[data-hamburger-icon]',
    hamburgerMenuScrollable: '[data-hamburger-scrollable]',
    headerIcons: '[data-header-icons]',
    navMain: '[data-nav-main]',
    menuDropdownParent: '[data-dropdown-parent]',
    dropdownTrigger: 'data-collapsible-trigger',
    menuItemLink: 'data-menu-item-link',
    visibleLink: 'data-visible-link',
    ariaExpanded: 'aria-expanded',
    href: 'href',
    tabIndex: 'tabindex',
  };

  const classes$8 = {
    navVisible: 'nav--is-visible',
    navHiding: 'nav--is-hiding',
    megamenuVisible: 'header--megamenu-visible',
    headerHamburger: 'header--is-hamburger',
    menuItemDropdown: 'menu-item--dropdown',
    isExpanded: 'is-expanded',
    isActive: 'is-active',
    open: 'open',
  };

  let sections$a = {};

  class Navigation {
    constructor(el) {
      this.header = el;
      this.body = document.body;
      this.menuToggles = document.querySelectorAll(selectors$d.menuToggle);
      this.headerIcons = this.header.querySelector(selectors$d.headerIcons);
      this.navStandard = this.header.querySelector(selectors$d.navMain);
      this.hamburger = this.header.querySelector(selectors$d.hamburgerIcon);
      this.scrollableElement = document.querySelector(selectors$d.hamburgerMenuScrollable);
      this.hamburgerNavLinks = this.scrollableElement.parentNode.querySelectorAll('button, a');
      this.documentClick = (e) => this.hideOnOutsideClick(e);
      this.documentKeyup = (e) => this.hideOnKeyUp(e);
      this.scrollLockTimeout = 0;
      this.resetHeight = 0;
      this.accessibility = a11y;

      this.init();
    }

    init() {
      this.hide();
      this.bindings();
      this.activeLinks();
    }

    bindings() {
      const dropdownParents = this.navStandard.querySelectorAll(selectors$d.menuDropdownParent);
      const emptyLinks = document.querySelectorAll(`${selectors$d.navMain} a[href^="#"]`);
      const dropdownTriggers = document.querySelectorAll(`${selectors$d.navMain} [${selectors$d.dropdownTrigger}]`);
      const triggers = [...dropdownTriggers, ...emptyLinks];

      // Init Bindings
      this.menuToggles.forEach((menuToggle) => {
        menuToggle.addEventListener('click', (e) => {
          e.preventDefault();

          if (this.body.classList.contains(classes$8.navVisible)) {
            this.hide();
          } else {
            this.show();
          }
        });
      });

      dropdownParents.forEach((dropdownParent) => {
        const visibleNavLinks = dropdownParent.querySelectorAll(`[${selectors$d.visibleLink}]`);

        dropdownParent.addEventListener('mouseenter', () => {
          if (theme.touched) {
            return;
          }

          if (!dropdownParent.classList.contains(classes$8.menuItemDropdown)) {
            this.header.classList.add(classes$8.megamenuVisible);
          }

          dropdownParent.classList.add(classes$8.isExpanded);
          visibleNavLinks.forEach((link) => {
            link.removeAttribute(selectors$d.tabIndex);

            if (link.hasAttribute(selectors$d.ariaExpanded)) {
              link.setAttribute(selectors$d.ariaExpanded, true);
            }
          });
        });

        dropdownParent.addEventListener('mouseleave', () => {
          if (!dropdownParent.classList.contains(classes$8.menuItemDropdown)) {
            this.header.classList.remove(classes$8.megamenuVisible);
          }

          dropdownParent.classList.remove(classes$8.isExpanded);
          visibleNavLinks.forEach((link) => {
            link.setAttribute(selectors$d.tabIndex, '-1');

            if (link.hasAttribute(selectors$d.ariaExpanded)) {
              link.setAttribute(selectors$d.ariaExpanded, false);
            }
          });
        });
      });

      triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          if (trigger.parentNode.classList.contains(classes$8.isExpanded)) {
            this.submenuClose(trigger.parentNode);
          } else {
            this.submenuOpen(trigger.parentNode);
          }
        });

        trigger.addEventListener('keyup', (e) => {
          if (e.keyCode === theme.keyboardKeys.SPACE) {
            if (trigger.parentNode.classList.contains(classes$8.isExpanded)) {
              this.submenuClose(trigger.parentNode);
            } else {
              this.submenuOpen(trigger.parentNode);
            }
          } else if (e.keyCode === theme.keyboardKeys.ESCAPE) {
            this.submenuClose(trigger.parentNode);
          }
        });
      });

      // Hide hamburger menu on click outside
      document.addEventListener('click', this.documentClick);

      // Close header dropdowns on focus another elements or ESC key is pressed
      document.addEventListener('keyup', this.documentKeyup);
    }

    hideOnOutsideClick(e) {
      const menuToggle = this.headerIcons.querySelector(selectors$d.menuToggle);
      const isMenuToggle = menuToggle.contains(e.target);
      const isMenuContainer = document.querySelector(selectors$d.hamburgerMenuScrollable).parentNode.contains(e.target);
      const isHeaderHamburger = this.header.classList.contains(classes$8.headerHamburger);

      // Close hamburger menu
      if (!isMenuToggle && !isMenuContainer && isHeaderHamburger) {
        this.hide();
      }
    }

    hideOnKeyUp(e) {
      const key = e.which || e.keyCode;
      const focusedElement = e.target;
      const hamburgerMenu = document.querySelectorAll(selectors$d.navMain)[1];
      const isHamburgerOpen = this.hamburger.classList.contains(classes$8.open);
      const expandedItem = document.querySelector(`${selectors$d.menuDropdownParent}.${classes$8.isExpanded}`);

      if (key !== theme.keyboardKeys.TAB && key !== theme.keyboardKeys.ESCAPE) {
        return;
      }

      if (key === theme.keyboardKeys.TAB) {
        // Close dropdown
        if (focusedElement.hasAttribute(selectors$d.menuItemLink) && expandedItem !== null) {
          expandedItem.querySelector(`[${selectors$d.dropdownTrigger}]`).dispatchEvent(new Event('click'));
        }

        // Close hamburger menu
        if (!hamburgerMenu.contains(focusedElement) && isHamburgerOpen) {
          this.hide();
        }
      } else if (key === theme.keyboardKeys.ESCAPE) {
        if (expandedItem !== null) {
          expandedItem.querySelector(`[${selectors$d.dropdownTrigger}]`).dispatchEvent(new Event('click'));
        }

        if (isHamburgerOpen) {
          this.hide();
        }
      }
    }

    show() {
      const headerIconsLinks = this.headerIcons.querySelectorAll(`a:not(${selectors$d.menuToggle})`);

      // Scroll lock
      document.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true, detail: this.scrollableElement}));

      this.hamburger.classList.add(classes$8.open);
      this.body.classList.add(classes$8.navVisible);

      headerIconsLinks.forEach((iconLink) => iconLink.setAttribute(selectors$d.tabIndex, '-1'));
      this.hamburgerNavLinks.forEach((hamburgerNavLink) => hamburgerNavLink.removeAttribute(selectors$d.tabIndex));
      this.menuToggles.forEach((menuToggle) => menuToggle.setAttribute(selectors$d.ariaExpanded, true));
    }

    hide() {
      const headerIconsLinks = this.headerIcons.querySelectorAll('a');

      if (!this.body.classList.contains(classes$8.navVisible)) {
        return;
      }

      this.hamburger.classList.remove(classes$8.open);
      this.body.classList.add(classes$8.navHiding);
      this.body.classList.remove(classes$8.navVisible);

      if (this.scrollLockTimeout) {
        clearTimeout(this.scrollLockTimeout);
      }

      this.scrollLockTimeout = setTimeout(() => {
        // Scroll unlock
        document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
        this.body.classList.remove(classes$8.navHiding);
      }, 500);

      headerIconsLinks.forEach((iconLink) => iconLink.removeAttribute(selectors$d.tabIndex));
      this.hamburgerNavLinks.forEach((hamburgerNavLink) => hamburgerNavLink.setAttribute(selectors$d.tabIndex, '-1'));
      this.menuToggles.forEach((menuToggle) => menuToggle.setAttribute(selectors$d.ariaExpanded, false));
    }

    activeLinks() {
      const menuItemLinks = this.navStandard.querySelectorAll(`[${selectors$d.menuItemLink}]`);
      const visibleNavLinks = this.navStandard.querySelectorAll(`[${selectors$d.visibleLink}]`);
      let isTopLevel = false;

      menuItemLinks.forEach((link) => {
        if (link.getAttribute(selectors$d.href) === window.location.pathname) {
          link.parentNode.classList.add(classes$8.isActive);
          isTopLevel = true;
        }
      });

      if (!isTopLevel) {
        visibleNavLinks.forEach((link) => {
          if (link.getAttribute(selectors$d.href) === window.location.pathname) {
            link.parentNode.classList.add(classes$8.isActive);
            link.closest(selectors$d.menuDropdownParent).classList.add(classes$8.isActive);
          }
        });
      }
    }

    submenuClose(el) {
      const visibleNavLinks = el.querySelectorAll(`[${selectors$d.visibleLink}]`);

      visibleNavLinks.forEach((link) => {
        link.setAttribute(selectors$d.tabIndex, '-1');

        if (link.hasAttribute(selectors$d.ariaExpanded)) {
          link.setAttribute(selectors$d.ariaExpanded, false);
        }
      });

      if (!el.classList.contains(classes$8.menuItemDropdown)) {
        this.header.classList.remove(classes$8.megamenuVisible);
      }
    }

    submenuOpen(el) {
      const visibleNavLinks = el.querySelectorAll(`[${selectors$d.visibleLink}]`);

      visibleNavLinks.forEach((link) => {
        link.removeAttribute(selectors$d.tabIndex);

        if (link.hasAttribute(selectors$d.ariaExpanded)) {
          link.setAttribute(selectors$d.ariaExpanded, true);
        }
      });

      if (!el.classList.contains(classes$8.menuItemDropdown)) {
        this.header.classList.add(classes$8.megamenuVisible);
      }
    }

    unload() {
      document.removeEventListener('click', this.documentClick);
      document.removeEventListener('keyup', this.documentKeyup);
    }
  }

  const navigation = {
    onLoad() {
      sections$a = new Navigation(this.container);
    },
    onUnload: function () {
      if (typeof sections$a.unload === 'function') {
        sections$a.unload();
      }
    },
    onSelect() {
      if (typeof sections$a.hide === 'function') {
        sections$a.hide();
      }
    },
    onDeselect() {
      if (typeof sections$a.hide === 'function') {
        sections$a.hide();
      }
    },
  };

  const selectors$c = {
    bodyWrap: '[data-body-wrap]',
    mainContent: '.main-content',
    navMain: '[data-nav-main]',
    navItem: '.menu > .menu-item',
    headerRow: '.container > .row',
    headerIcons: '[data-header-icons]',
    dataHeaderStyle: '[data-header-style="transparent"]',
    logoImage: '[data-logo-image]',
    logoImageWidth: 'data-width',
    logoText: '[data-logo-text]',
    hamburgerIcon: '[data-hamburger-icon]',
    hamburgerMenuScrollable: '[data-hamburger-scrollable]',
    cartClose: '[data-cart-close]',
    dataTransparent: 'data-transparent',
  };

  const classes$7 = {
    headerFull: 'header--full',
    headerScrolled: 'header--has-scrolled',
    headerStandard: 'header--is-standard',
    headerHamburger: 'header--is-hamburger',
    headerTransparent: 'header--transparent',
    headerLogoCenterCenter: 'header--logo_center_links_center',
    headerLogoLeftCenter: 'header--logo_left_links_center',
    headerLogoCenterLeft: 'header--logo_center_links_left',
    headerLogoLeftLeft: 'header--logo_left_links_left',
    hasTransparentHeader: 'has-transparent-header',
    navVisible: 'nav--is-visible',
    cartVisible: 'cart--is-visible',
    open: 'open',
  };

  let sections$9 = {};

  class Header {
    constructor(el) {
      this.header = el;
      this.headerContainer = this.header.parentNode;
      this.html = document.documentElement;
      this.body = document.body;
      this.bodyWrap = document.querySelector(selectors$c.bodyWrap);
      this.headerStateEvent = () => this.stickyHeaderState();
      this.checkMobileNavEvent = () => this.checkMobileNav();
      this.checkNavOverlapEvent = () => this.checkNavigationOverlapping();
      this.checkTransparentHeaderEvent = (e) => this.checkTransparentHeader(e);
      this.init();
    }

    init() {
      this.resetHeader();
      this.checkTransparentHeader();
      this.checkNavigationOverlapping();
      this.stickyHeaderState();

      window.addEventListener('load', this.checkNavOverlapEvent);
      document.addEventListener('theme:scroll', this.headerStateEvent);
      document.addEventListener('theme:resize:width', this.checkNavOverlapEvent);
      document.addEventListener('theme:resize:width', this.checkMobileNavEvent);
      document.addEventListener('theme:header:update', this.checkTransparentHeaderEvent);
    }

    stickyHeaderState() {
      const scrolled = window.scrollY;
      let contentTop = 0;

      if (this.bodyWrap !== null) {
        contentTop = Math.max(this.bodyWrap.offsetTop, 60);
      }

      if (scrolled > contentTop) {
        this.header.classList.add(classes$7.headerScrolled);
        this.header.classList.remove(classes$7.headerTransparent);
      } else {
        this.header.classList.remove(classes$7.headerScrolled);

        if (this.isHeaderTransparent()) {
          this.header.classList.add(classes$7.headerTransparent);
        }
      }
    }

    checkNavigationOverlapping() {
      const isDesktop = window.innerWidth >= theme.sizes.large;

      this.header.classList.remove(classes$7.headerHamburger);
      this.header.classList.add(classes$7.headerStandard);

      if (this.getNavigationOverlapping() || !isDesktop) {
        this.header.classList.remove(classes$7.headerStandard);
        this.header.classList.add(classes$7.headerHamburger);
      }
    }

    checkMobileNav() {
      const isDesktop = window.innerWidth >= theme.sizes.large;
      const isHamburgerNavOpen = this.body.classList.contains(classes$7.navVisible);

      if (isHamburgerNavOpen && isDesktop) {
        this.resetHeader();
      }
    }

    checkTransparentHeader() {
      if (this.isHeaderTransparent()) {
        this.body.classList.add(classes$7.hasTransparentHeader);
        this.header.classList.add(classes$7.headerTransparent);
      } else {
        this.body.classList.remove(classes$7.hasTransparentHeader);
        this.header.classList.remove(classes$7.headerTransparent);
      }
    }

    getNavigationOverlapping() {
      const headerRowWidth = this.header.querySelector(selectors$c.headerRow).offsetWidth;
      const navMenuWidth = this.getMenuItemsWidth();
      const headerClasses = this.header.classList;
      const isNavCentered = headerClasses.contains(classes$7.headerLogoCenterCenter) || headerClasses.contains(classes$7.headerLogoLeftCenter);
      const isNavLeftLogoCentered = headerClasses.contains(classes$7.headerLogoCenterLeft) || headerClasses.contains(classes$7.headerLogoLeftLeft);
      const additionalSpace = 40; // Additional spacing from margins
      let isNavigationOverlapping = false;
      let headerIconsWidth = this.header.querySelector(selectors$c.headerIcons).offsetWidth;
      let logoWidth = this.getLogoWidth();

      if (isNavCentered) {
        logoWidth = logoWidth < headerIconsWidth ? headerIconsWidth : logoWidth;
        logoWidth *= 2;
        headerIconsWidth = 0;
      }

      isNavigationOverlapping = parseInt(headerRowWidth) < parseInt(navMenuWidth + logoWidth + headerIconsWidth + additionalSpace);

      if (isNavLeftLogoCentered && logoWidth) {
        isNavigationOverlapping = parseInt((headerRowWidth - logoWidth) / 2) < parseInt(navMenuWidth);
      }

      return isNavigationOverlapping;
    }

    getLogoWidth() {
      const logoImage = this.header.querySelector(selectors$c.logoImage);
      const logoText = this.header.querySelector(selectors$c.logoText);
      let logoWidth = 0;

      if (logoImage !== null) {
        logoWidth = parseInt(logoImage.getAttribute(selectors$c.logoImageWidth));
      }

      if (logoText !== null) {
        logoWidth += logoText.offsetWidth;
      }

      return logoWidth;
    }

    getMenuItemsWidth() {
      let itemsWidth = 0;
      const navStandard = this.header.querySelector(selectors$c.navMain);
      const menuItems = navStandard.querySelectorAll(selectors$c.navItem);
      menuItems.forEach((menuItem) => {
        itemsWidth += outerWidth(menuItem);
      });

      return itemsWidth;
    }

    isHeaderTransparent() {
      const firstSection = document.querySelector(selectors$c.mainContent).firstElementChild;
      const firstSectionClass = firstSection.classList.contains(classes$7.headerFull);
      const firstSectionStyle = firstSection.querySelector(selectors$c.dataHeaderStyle) !== null;
      const transparentHeader = this.header.getAttribute(selectors$c.dataTransparent) === 'true';
      const headerFull = firstSectionClass || firstSectionStyle;
      const headerTransparent = transparentHeader && headerFull;

      return headerTransparent;
    }

    resetHeader() {
      const hamburger = this.header.querySelector(selectors$c.hamburgerIcon);

      this.body.classList.remove(classes$7.navVisible);
      hamburger.classList.remove(classes$7.open);

      if (this.body.classList.contains(classes$7.cartVisible)) {
        document.querySelector(selectors$c.cartClose).click();
      }

      // Unlock page scroll
      document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    unload() {
      document.removeEventListener('theme:scroll', this.headerStateEvent);
      document.removeEventListener('theme:resize:width', this.checkNavOverlapEvent);
      document.removeEventListener('theme:resize:width', this.checkMobileNavEvent);
      document.removeEventListener('theme:header:update', this.checkTransparentHeaderEvent);
    }

    onselect() {
      this.resetHeader();
      this.init();
    }
  }

  const header = {
    onLoad() {
      sections$9 = new Header(this.container);
    },
    onUnload() {
      if (typeof sections$9.unload === 'function') {
        sections$9.unload();
      }
    },
    onSelect() {
      if (typeof sections$9.onselect === 'function') {
        sections$9.onselect();
      }
    },
  };

  register('header', [header, navigation, collapsible]);

  var sections$8 = {};

  const parallaxHero = {
    onLoad() {
      sections$8[this.id] = [];
      const frames = this.container.querySelectorAll('[data-parallax-wrapper]');
      frames.forEach((frame) => {
        const inner = frame.querySelector('[data-parallax-img]');

        sections$8[this.id].push(
          new Rellax(inner, {
            center: true,
            round: true,
            frame: frame,
          })
        );
      });
    },
    onUnload: function () {
      sections$8[this.id].forEach((image) => {
        if (typeof image.destroy === 'function') {
          image.destroy();
        }
      });
    },
  };

  const sections$7 = {};

  const selectors$b = {
    slider: '[data-gallery-slider]',
    slideshow: '[data-slider]',
    slideshowPrev: '[data-prev-arrow]',
    slideshowNext: '[data-next-arrow]',
    dataOptions: 'data-options',
    dataSlide: 'data-slide',
    dataSlideIndex: 'data-slide-index',
  };

  const classes$6 = {
    slideshowLoading: 'gallery-slider--is-loading',
    classIsSelected: 'is-selected',
    flickityEnabled: 'flickity-enabled',
  };

  class Gallery {
    constructor(section) {
      this.container = section.container;
      this.slider = this.container.querySelector(selectors$b.slider);
      this.slideshow = this.container.querySelector(selectors$b.slideshow);
      this.options = this.slideshow.getAttribute(selectors$b.dataOptions);
      this.slideshowPrev = this.container.querySelector(selectors$b.slideshowPrev);
      this.slideshowNext = this.container.querySelector(selectors$b.slideshowNext);
      this.checkSliderVisibilityOnScrollEvent = this.checkSliderVisibility();
      this.flkty = null;

      this.init();
    }

    init() {
      let options = JSON.parse(this.options.replace(/'/g, '"'));

      options = {
        ...options,
        on: {
          ready: () => this.slider.classList.remove(classes$6.slideshowLoading),
        },
      };

      this.flkty = new FlickityFade(this.slideshow, options);

      if (this.slideshowPrev) {
        this.slideshowPrev.addEventListener('click', () => this.flkty.previous(true));
      }

      if (this.slideshowNext) {
        this.slideshowNext.addEventListener('click', () => this.flkty.next(true));
      }

      document.addEventListener('theme:scroll', this.checkSliderVisibilityOnScrollEvent);
    }

    isAutoplay() {
      const autoplay = this.flkty.options.autoPlay !== false;

      return autoplay;
    }

    checkSliderVisibility() {
      if (!this.flkty) return;

      const isInitialized = this.slideshow.classList.contains(classes$6.flickityEnabled);
      const isVisible = visibilityHelper.isElementPartiallyVisible(this.slideshow) || visibilityHelper.isElementTotallyVisible(this.slideshow);

      if (isVisible && isInitialized && this.isAutoplay()) {
        this.flkty.playPlayer();
      } else {
        this.flkty.stopPlayer();
      }
    }

    onUnload() {
      this.flkty.destroy();

      document.removeEventListener('theme:scroll', this.checkSliderVisibilityOnScrollEvent);
    }

    onBlockSelect(evt) {
      const slide = this.slideshow.querySelector(`[${selectors$b.dataSlide}="${evt.detail.blockId}"]`);
      const slideIndex = parseInt(slide.getAttribute(selectors$b.dataSlideIndex));

      // Go to selected slide, pause autoplay
      this.flkty.select(slideIndex);
      this.flkty.stopPlayer();
    }

    onBlockDeselect() {
      if (this.isAutoplay()) {
        this.flkty.playPlayer();
      }
    }
  }

  const GallerySection = {
    onLoad() {
      sections$7[this.id] = new Gallery(this);
    },
    onUnload(e) {
      sections$7[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$7[this.id].onBlockSelect(e);
    },
    onBlockDeselect(e) {
      sections$7[this.id].onBlockDeselect(e);
    },
  };

  register('gallery', [GallerySection, parallaxHero]);

  register('collection-grid', [ajaxify]);

  const sections$6 = {};

  const selectors$a = {
    logoListSlider: '[data-logo-list-slider]',
    logoListSlide: '[data-logo-list-slide]',
    logoListSlideData: 'data-logo-list-slide',
    logoListSlideIndex: 'data-slide-index',
  };

  const classes$5 = {
    flickityEnabled: 'flickity-enabled',
  };

  class LogoList {
    constructor(section) {
      this.container = section.container;
      this.slideshow = this.container.querySelector(selectors$a.logoListSlider);
      this.sliderInitEvent = () => this.sliderInit();

      this.init();
    }

    init() {
      this.sliderInit();

      document.addEventListener('theme:resize', this.sliderInitEvent);
    }

    sliderInit() {
      const slidesCount = this.slideshow.querySelectorAll(selectors$a.logoListSlide).length;
      const slideWidth = 220;
      const windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
      const slidesWidth = slidesCount * slideWidth;
      const sliderInitialized = this.slideshow.classList.contains(classes$5.flickityEnabled);

      if (windowWidth < slidesWidth) {
        if (!sliderInitialized) {
          this.flkty = new Flickity(this.slideshow, {
            autoPlay: 4000,
            prevNextButtons: false,
            pageDots: false,
            wrapAround: true,
          });
        }
      } else if (sliderInitialized) {
        this.flkty.destroy();
      }
    }

    onUnload() {
      const sliderInitialized = this.slideshow.classList.contains(classes$5.flickityEnabled);

      if (sliderInitialized) {
        this.flkty.destroy();
      }

      document.removeEventListener('theme:resize', this.sliderInitEvent);
    }

    onBlockSelect(evt) {
      const slide = this.slideshow.querySelector(`[${selectors$a.logoListSlideData}="${evt.detail.blockId}"]`);
      const slideIndex = parseInt(slide.getAttribute(selectors$a.logoListSlideIndex));
      const sliderInitialized = this.slideshow.classList.contains(classes$5.flickityEnabled);

      if (sliderInitialized) {
        this.flkty.select(slideIndex);
        this.flkty.pausePlayer();
      }
    }

    onBlockDeselect() {
      const sliderInitialized = this.slideshow.classList.contains(classes$5.flickityEnabled);

      if (sliderInitialized) {
        this.flkty.unpausePlayer();
      }
    }
  }

  const LogoListSection = {
    onLoad() {
      sections$6[this.id] = new LogoList(this);
    },
    onUnload(e) {
      sections$6[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$6[this.id].onBlockSelect(e);
    },
    onBlockDeselect() {
      sections$6[this.id].onBlockDeselect();
    },
  };

  register('logo-list', LogoListSection);

  const selectors$9 = {
    videoPlay: '[data-video-play]',
    videoPlayValue: 'data-video-play',
  };

  class VideoPlay {
    constructor(section, selector = selectors$9.videoPlay, selectorValue = selectors$9.videoPlayValue) {
      this.container = section;
      this.videoPlay = this.container.querySelectorAll(selector);

      if (this.videoPlay.length) {
        this.videoPlay.forEach((element) => {
          element.addEventListener('click', (e) => {
            const button = e.currentTarget;
            if (button.hasAttribute(selectorValue) && button.getAttribute(selectorValue).trim() !== '') {
              e.preventDefault();
              theme.a11yTrigger = button;

              const items = [
                {
                  html: button.getAttribute(selectorValue),
                },
              ];

              new LoadPhotoswipe(items);
            }
          });
        });
      }
    }
  }

  const videoPlay = {
    onLoad() {
      new VideoPlay(this.container);
    },
  };

  const sections$5 = {};

  const selectors$8 = {
    slideshow: '[data-mosaic-blocks]',
    slideshowPrev: '[data-prev-arrow]',
    slideshowNext: '[data-next-arrow]',
    dataSlide: 'data-slide',
    dataSlideIndex: 'data-slide-index',
  };

  const classes$4 = {
    flickityEnabled: 'flickity-enabled',
  };

  class Mosaic {
    constructor(section) {
      this.container = section.container;
      this.slideshow = this.container.querySelector(selectors$8.slideshow);
      this.slideshowPrev = this.container.querySelector(selectors$8.slideshowPrev);
      this.slideshowNext = this.container.querySelector(selectors$8.slideshowNext);
      this.flkty = null;
      this._listeners = new Listeners();
      this.sliderInitEvent = () => this.initMobileSlider();

      this.init();
    }

    init() {
      this.initMobileSlider();

      document.addEventListener('theme:resize', this.sliderInitEvent);
    }

    initMobileSlider() {
      const isMobile = window.innerWidth < theme.sizes.small;

      const options = {
        wrapAround: true,
        prevNextButtons: false,
        pageDots: false,
      };

      if (isMobile && !this.isInit()) {
        this.flkty = new Flickity(this.slideshow, options);

        // Bind slider controls event listeners
        if (this.slideshowPrev && this.slideshowNext) {
          this._listeners.add(this.slideshowPrev, 'click', () => this.flkty.previous(true));
          this._listeners.add(this.slideshowNext, 'click', () => this.flkty.next(true));
        }
      } else if (!isMobile && this.isInit()) {
        this.flkty.destroy();

        // Unbind all slider controls event listeners
        this._listeners.removeAll();
      }
    }

    isInit() {
      const isInitialized = this.slideshow?.classList.contains(classes$4.flickityEnabled);

      return isInitialized;
    }

    onUnload() {
      if (this.isInit()) {
        this.flkty.destroy();
      }

      document.removeEventListener('theme:resize', this.sliderInitEvent);
    }

    onBlockSelect(evt) {
      const slide = this.container.querySelector(`[${selectors$8.dataSlide}="${evt.detail.blockId}"]`);

      if (this.isInit() && slide !== null) {
        this.flkty.select(parseInt(slide.getAttribute(selectors$8.dataSlideIndex)));
      }
    }
  }

  const MosaicSection = {
    onLoad() {
      sections$5[this.id] = new Mosaic(this);
    },
    onUnload(e) {
      sections$5[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections$5[this.id].onBlockSelect(e);
    },
  };

  register('mosaic', [MosaicSection, videoPlay]);

  register('newsletter', newsletterCheckForResultSection);

  const selectors$7 = {
    inputGroups: '.input-group--error',
    inputs: 'input.password, input.email',
  };

  class Password {
    constructor(section) {
      this.container = section.container;
      this.inputGroups = this.container.querySelectorAll(selectors$7.inputGroups);

      this.init();
    }

    init() {
      this.inputGroups.forEach((inputGroup) => {
        const input = inputGroup.querySelector(selectors$7.inputs);
        input.focus();
      });
    }
  }

  const PasswordSection = {
    onLoad() {
      new Password(this);
    },
  };

  register('password', PasswordSection);

  const selectors$6 = {
    popup: '[data-popup]',
    close: '[data-popup-close]',
  };

  const classes$3 = {
    popupVisible: 'popup--visible',
  };

  const attributes$1 = {
    delay: 'data-delay',
    reappearTime: 'data-reappear_time',
    testmode: 'data-testmode',
    checkTrueString: 'true',
  };

  let sections$4 = {};

  class Popup {
    constructor(el) {
      this.popup = el;
      this.close = this.popup.querySelector(selectors$6.close);
      this.timeout = 0;
      this.testmode = this.popup.getAttribute(attributes$1.testmode) === attributes$1.checkTrueString;
      this.delay = parseInt(this.popup.getAttribute(attributes$1.delay)) * 1000;
      this.cookie = new PopupCookie('newsletter', 'user_has_closed', this.expireDate());

      this.init();
    }

    expireDate() {
      const todayDate = new Date();
      const expireDate = new Date();
      let date = parseInt(this.popup.getAttribute(attributes$1.reappearTime));

      if (date !== 0) {
        expireDate.setTime(todayDate.getTime() + 3600000 * 24 * date);
      } else {
        expireDate.setTime(todayDate.getTime() + 3600000 * 24 * 365 * 100);
      }

      date = expireDate.toGMTString();

      return date;
    }

    init() {
      const cookieExists = this.cookie.read() !== false;
      const isChallengePage = window.location.pathname === '/challenge';
      const submissionSuccess = window.location.search.indexOf('?customer_posted=true') !== -1;

      if (submissionSuccess) {
        this.delay = 0;
      }

      if ((!cookieExists && !isChallengePage) || this.testmode) {
        this.timeout = setTimeout(() => {
          this.popup.classList.add(classes$3.popupVisible);
          this.initClosers();
          this.close.focus();
        }, this.delay);
      }
    }

    initClosers() {
      this.close.addEventListener('click', this.closeModal.bind(this));
    }

    closeModal(e) {
      e.preventDefault();
      this.popup.classList.remove(classes$3.popupVisible);
      clearTimeout(this.timeout);

      if (!this.testmode) {
        this.cookie.write();
      }
    }
  }

  const popupSection = {
    onLoad() {
      const popup = this.container.querySelector(selectors$6.popup);
      if (popup !== null) {
        sections$4[this.id] = new Popup(popup);
      }
    },
  };

  register('popup', [popupSection, newsletterCheckForResultSection]);

  const selectors$5 = {
    quantityAdjust: '[data-qty-adjust]',
    quantityAdjustPlus: 'data-qty-adjust-plus',
    quantityAdjustMinus: 'data-qty-adjust-minus',
    quantityNum: '[data-qty]',
  };

  const quantity = (e, element) => {
    if (e.type === 'keyup' && e.keyCode !== 13) {
      return;
    }

    const el = element;
    const qtySelector = el.parentElement.querySelector(selectors$5.quantityNum);
    let qty = parseInt(qtySelector.value.replace(/\D/g, ''));

    // Make sure we have a valid integer
    if (parseFloat(qty) == parseInt(qty) && !isNaN(qty)) ; else {
      // Not a number. Default to 1.
      qty = 1;
    }
    // Add or subtract from the current quantity
    if (el.hasAttribute(selectors$5.quantityAdjustPlus)) {
      qty += 1;
    } else {
      qty -= 1;
      if (qty <= 1) {
        qty = 1;
      }
    }
    // Update the input's number
    qtySelector.value = qty;
    qtySelector.dispatchEvent(new Event('click'));
  };

  function quantitySelectors() {
    // Setup listeners to add/subtract from the input
    const quantityAdjust = document.querySelectorAll(selectors$5.quantityAdjust);
    quantityAdjust.forEach((element) => {
      element.addEventListener('click', function (e) {
        quantity(e, element);
      });
      element.addEventListener('keyup', function (e) {
        quantity(e, element);
      });
    });

    // All quantity input value change on up/down arrows key press
    const quantityNum = document.querySelectorAll(selectors$5.quantityNum);
    quantityNum.forEach((element) => {
      element.addEventListener('keyup', function (e) {
        // On arrow up key press (38)
        if (e.keyCode == 38) ;
        // On arrow down key press (40)
        if (e.keyCode == 40) ;
      });
    });
  }

  const selectors$4 = {
    complementaryProducts: 'complementary-products',
    complementaryProduct: '[data-product-block]',
  };

  const classes$2 = {
    loaded: 'is-loaded',
  };

  const attributes = {
    url: 'data-url',
  };

  class ComplementaryProducts extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        if (this.hasAttribute(attributes.url) && this.getAttribute(attributes.url) !== '') {
          fetch(this.getAttribute(attributes.url))
            .then((response) => response.text())
            .then((text) => {
              const html = document.createElement('div');
              html.innerHTML = text;
              const recommendations = html.querySelector(selectors$4.complementaryProducts);

              if (recommendations && recommendations.innerHTML.trim().length) {
                this.innerHTML = recommendations.innerHTML;
              }

              if (html.querySelector(`${selectors$4.complementaryProducts} ${selectors$4.complementaryProduct}`)) {
                this.classList.add(classes$2.loaded);
              }
            })
            .catch((e) => {
              console.error(e);
            });
        }
      };

      new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
    }
  }

  const selectors$3 = {
    productContainer: '[data-product-container]',
    addToCart: '[data-add-to-cart]',
    shopBar: '[data-shop-bar]',
    productJson: '[data-product-json]',
    form: '[data-product-form-container]',
    dropdown: '[data-single-option-selector]',
    footer: '[data-footer]',
    colorLabel: '[data-color-label]',
    colorSwatch: '[data-color-swatch]',
    dataOption: '[data-option]',
    dataSectionId: 'data-section-id',
    selectTag: 'select',
    dataPosition: 'data-position',
    dataIndex: 'data-index',
  };

  const classes$1 = {
    onboarding: 'onboarding-product',
    shopBarVisible: 'shop-bar--is-visible',
    footerPush: 'site-footer--push',
  };

  let sections$3 = {};

  /**
   * Product section constructor.
   * @param {string} container - selector for the section container DOM element
   */
  class Product {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.id = this.container.getAttribute(selectors$3.dataSectionId);
      this.productContainer = this.container.querySelector(selectors$3.productContainer);
      this.footer = document.querySelector(selectors$3.footer);
      this.onboarding = this.productContainer.classList.contains(classes$1.onboarding);
      this.shopBar = document.querySelector(selectors$3.shopBar);
      this.scrollEvent = throttle(() => this.shopBarShow(), 100);

      if (!this.onboarding) {
        // Stop parsing if we don't have the product json script tag
        // when loading section in the Theme Editor
        const productJson = this.container.querySelector(selectors$3.productJson);
        if ((productJson && !productJson.innerHTML) || !productJson) {
          return;
        }

        // Record recently viewed products when the product page is loading
        Shopify.Products.recordRecentlyViewed();

        this.form = this.container.querySelector(selectors$3.form);

        this.init();

        if (this.shopBar) {
          this.initShopBar();
        }
      } else {
        quantitySelectors();

        this.productContainer.querySelectorAll(selectors$3.colorSwatch).forEach((swatch) => {
          swatch.addEventListener('change', (e) => {
            this.updateColorName(e);
          });
        });
      }
    }

    init() {
      theme.mediaInstances[this.id] = new Media(this.section);
      theme.mediaInstances[this.id].init();
    }

    initShopBar() {
      const cartBarSelectors = this.shopBar.querySelectorAll(selectors$3.selectTag);
      const formSelectors = this.form.querySelectorAll(selectors$3.dropdown);
      const submit = this.shopBar.querySelector(selectors$3.addToCart);

      // Prevent shopbar submit
      submit.addEventListener('click', (e) => {
        e.preventDefault();
      });

      if (cartBarSelectors.length) {
        cartBarSelectors.forEach((element) => {
          // Update product form on cart bar variant change
          element.addEventListener('change', () => {
            const index = element.getAttribute(selectors$3.dataIndex);
            const optionSelected = element.value;
            const targets = this.form.querySelectorAll(`${selectors$3.dropdown}[${selectors$3.dataIndex}="${index}"]`);

            if (targets[0].tagName === 'INPUT') {
              for (const target of targets) {
                const targetIndex = target.getAttribute(selectors$3.dataIndex);
                const targetValue = target.value;
                if (targetIndex === index && targetValue === optionSelected) {
                  target.checked = true;
                  target.dispatchEvent(new Event('change'));
                  break;
                }
              }
            } else {
              const select = targets[0];
              select.value = optionSelected;
              select.dispatchEvent(new Event('change'));
            }
          });
        });
      }

      // Update cart bar on product form variant change
      if (formSelectors.length) {
        formSelectors.forEach((element) => {
          element.addEventListener('change', () => {
            const index = element.getAttribute(selectors$3.dataIndex);
            const optionSelected = element.value;

            this.shopBar.querySelector(`[${selectors$3.dataIndex}="${index}"]`).value = optionSelected;
          });
        });
      }

      this.shopBarShow();
      window.addEventListener('scroll', this.scrollEvent);
    }

    shopBarShow() {
      const scrolled = window.scrollY;
      const productContainerTop = this.productContainer.getBoundingClientRect().top + scrolled;

      if (scrolled > productContainerTop) {
        this.shopBar.classList.add(classes$1.shopBarVisible);
        this.footer.classList.add(classes$1.footerPush);
      } else if (scrolled < productContainerTop - theme.dimensions.headerScrolled) {
        this.shopBar.classList.remove(classes$1.shopBarVisible);
        this.footer.classList.remove(classes$1.footerPush);
      }
    }

    updateColorName(evt) {
      const target = evt.target;
      const optionLabel = target.closest(selectors$3.dataOption).querySelector(selectors$3.colorLabel);

      if (target.tagName === 'INPUT' && optionLabel !== null) {
        optionLabel.innerText = target.value;
      }
    }

    unload() {
      window.removeEventListener('scroll', this.scrollEvent);
    }
  }

  const productSection = {
    onLoad() {
      sections$3 = new Product(this);
    },
    onUnload: function () {
      if (typeof sections$3.unload === 'function') {
        sections$3.unload();
      }
    },
  };

  register('product', [productFormSection, productSection, swatchSection]);

  if (!customElements.get('complementary-products')) {
    customElements.define('complementary-products', ComplementaryProducts);
  }

  const sections$2 = {};

  const selectors$2 = {
    recentlyViewed: '#RecentlyViewed',
    dataLimit: 'data-limit',
    productBlock: '[data-product-block]',
    productImage: '[data-product-image]',
  };

  class RecentlyViewedProducts {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.limit = parseInt(this.container.getAttribute(selectors$2.dataLimit));
      this.recentlyViewed = this.container.querySelector(selectors$2.recentlyViewed);

      if (this.recentlyViewed) {
        this.init();
      }
    }

    init() {
      Shopify.Products.showRecentlyViewed({
        howManyToShow: this.limit,
        onComplete: () => {
          const recentlyViewedProducts = this.container.querySelectorAll(selectors$2.productBlock);

          if (recentlyViewedProducts.length > 0) {
            makeGridSwatches(this.container);
            new Quickview(this.container);
          }
        },
      });
    }
  }

  const recentlyViewedProductsSection = {
    onLoad() {
      sections$2[this.id] = new RecentlyViewedProducts(this);
    },
  };

  register('recently-viewed-products', recentlyViewedProductsSection);

  const sections$1 = {};

  const selectors$1 = {
    section: '[data-section-type="related-products"]',
    product: '[data-product-block]',
    productImage: '[data-product-image]',
    sectionId: 'data-section-id',
    productId: 'data-product-id',
    limit: 'data-limit',
  };

  class RelatedProducts {
    constructor(section) {
      this.container = section.container;

      this.init();
    }

    init() {
      const relatedSection = this.container;
      const sectionId = relatedSection.getAttribute(selectors$1.sectionId);
      const productId = relatedSection.getAttribute(selectors$1.productId);
      const limit = relatedSection.getAttribute(selectors$1.limit);
      const requestUrl = `${theme.routes.product_recommendations_url}?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

      fetch(requestUrl)
        .then((response) => {
          return response.text();
        })
        .then((data) => {
          const createdElement = document.createElement('div');
          createdElement.innerHTML = data;
          const inner = createdElement.querySelector(selectors$1.section);

          if (inner.querySelector(selectors$1.product)) {
            relatedSection.innerHTML = inner.innerHTML;

            makeGridSwatches(relatedSection);
            new Quickview(relatedSection);
          }
        });
    }
  }

  const RelatedSection = {
    onLoad() {
      sections$1[this.id] = new RelatedProducts(this);
    },
  };

  register('related-products', RelatedSection);

  const sections = {};

  const selectors = {
    lazyImage: '[loading="lazy"]',
    shopifySection: '.shopify-section',
    slideshowPrev: '[data-prev-arrow]',
    slideshowNext: '[data-next-arrow]',
    header: '[data-header]',
    dataOptions: 'data-options',
    dataColor: 'data-style',
    dataCurrentColor: 'data-current-style',
    dataSlide: 'data-slide',
    dataSlideIndex: 'data-slide-index',
    scrollBtn: '[data-button-scroll]',
  };

  const classes = {
    slideshowLoading: 'hero--is-loading',
    classIsSelected: 'is-selected',
    flickityEnabled: 'flickity-enabled',
  };

  class Slideshow {
    constructor(section) {
      this.container = section.container;
      this.options = this.container.getAttribute(selectors.dataOptions);
      this.parentContainer = this.container.closest(selectors.shopifySection);
      this.slideshowPrev = this.parentContainer.querySelector(selectors.slideshowPrev);
      this.slideshowNext = this.parentContainer.querySelector(selectors.slideshowNext);
      this.scrollBtn = this.parentContainer.querySelector(selectors.scrollBtn);
      this.checkVisibilityOnScroll = this.checkSliderVisibility();
      this.flkty = null;

      this.init();
    }

    init() {
      let options = JSON.parse(this.options.replace(/'/g, '"'));

      options = {
        ...options,
        cellSelector: `[${selectors.dataSlide}]`,
        on: {
          ready: () => {
            requestAnimationFrame(() => {
              this.container.classList.remove(classes.slideshowLoading);
            });
            this.slideActions();
          },
        },
      };

      this.flkty = new FlickityFade(this.container, options);
      this.flkty.on('change', () => {
        this.slideActions();
      });

      if (this.slideshowPrev) {
        this.slideshowPrev.addEventListener('click', () => this.flkty.previous(true));
      }

      if (this.slideshowNext) {
        this.slideshowNext.addEventListener('click', () => this.flkty.next(true));
      }

      if (this.scrollBtn) {
        this.scrollBtn.addEventListener('click', (e) => {
          e.preventDefault();

          const headerHeight = 59;
          const containerTop = this.parentContainer.offsetTop;
          const containerHeight = this.parentContainer.offsetHeight;
          const scrollPosition = containerTop + containerHeight - headerHeight;

          scroll({
            top: scrollPosition,
            behavior: 'smooth',
          });
        });
      }

      document.addEventListener('theme:scroll', this.checkVisibilityOnScroll);
    }

    isAutoplay() {
      const autoplay = this.flkty.options.autoPlay !== false;

      return autoplay;
    }

    checkSliderVisibility() {
      if (!this.flkty) {
        return;
      }

      const isInitialized = this.container.classList.contains(classes.flickityEnabled);
      const isVisible = window.visibilityHelper.isElementPartiallyVisible(this.container) || window.visibilityHelper.isElementTotallyVisible(this.container);

      if (isVisible && isInitialized && this.isAutoplay()) {
        this.flkty.playPlayer();
      } else {
        this.flkty.stopPlayer();
      }
    }

    slideActions() {
      const currentSlide = this.container.querySelector(`.${classes.classIsSelected}`);
      const currentSlideColor = currentSlide.getAttribute(selectors.dataColor);

      this.container.setAttribute(selectors.dataCurrentColor, currentSlideColor);
    }

    onUnload() {
      this.flkty.destroy();

      document.removeEventListener('theme:scroll', this.checkVisibilityOnScroll);
    }

    onBlockSelect(evt) {
      const slide = this.container.querySelector(`[${selectors.dataSlide}="${evt.detail.blockId}"]`);
      const slideIndex = parseInt(slide.getAttribute(selectors.dataSlideIndex));

      // Go to selected slide, pause autoplay
      this.flkty.select(slideIndex);
      this.flkty.stopPlayer();
    }

    onBlockDeselect() {
      if (this.isAutoplay()) {
        this.flkty.playPlayer();
      }
    }
  }

  const SlideshowSection = {
    onLoad() {
      sections[this.id] = new Slideshow(this);
    },
    onUnload(e) {
      sections[this.id].onUnload(e);
    },
    onBlockSelect(e) {
      sections[this.id].onBlockSelect(e);
    },
    onBlockDeselect(e) {
      sections[this.id].onBlockDeselect(e);
    },
  };

  register('slideshow', [SlideshowSection, parallaxHero]);

  /**
   * FeaturedVideo Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the FeaturedVideo template.
   *
   * @namespace FeaturedVideo
   */

  register('featured-video', [videoPlay, parallaxHero]);

  const wrap = (toWrap, wrapperClass = '', wrapper) => {
    wrapper = wrapper || document.createElement('div');
    wrapper.classList.add(wrapperClass);
    toWrap.parentNode.insertBefore(wrapper, toWrap);
    return wrapper.appendChild(toWrap);
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Load all registered sections on the page.
    load('*');

    // Smooth scroll to anchored element
    const anchorLinks = document.querySelectorAll('[data-anchor-link]');
    anchorLinks.forEach((anchorLink) => {
      anchorLink.addEventListener('click', (e) => {
        e.preventDefault();
        const targetElement = document.getElementById(anchorLink.getAttribute('href').split('#')[1]);
        const position = targetElement.getBoundingClientRect().top + window.scrollY - theme.dimensions.headerScrolled;

        window.scrollTo({
          top: position,
          left: 0,
          behavior: 'smooth',
        });
      });
    });

    // Target tables to make them scrollable
    const tableSelectors = '.rte table';
    const tables = document.querySelectorAll(tableSelectors);
    tables.forEach((table) => {
      wrap(table, 'rte__table-wrapper');
    });

    // Target iframes to make them responsive
    const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
    const frames = document.querySelectorAll(iframeSelectors);
    frames.forEach((frame) => {
      wrap(frame, 'rte__video-wrapper');
    });

    if (window.self !== window.top) {
      document.querySelector('html').classList.add('iframe');
    }

    // Safari smoothscroll polyfill
    let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
    if (!hasNativeSmoothScroll) {
      loadScript({url: window.theme.assets.smoothscroll});
    }
  });

  // Apply a specific class to the html element for browser support of cookies.
  if (window.navigator.cookieEnabled) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }

}(themeVendor.BodyScrollLock, themeVendor.themeCurrency, themeVendor.Sqrl, themeVendor.Flickity, themeVendor.FlickityFade, themeVendor.ajaxinate, themeVendor.FlickityAsNavFor, themeVendor.Rellax));
//# sourceMappingURL=theme.js.map
