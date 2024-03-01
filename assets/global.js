function getFocusableElements(t) {
  return Array.from(
    t.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}
document.querySelectorAll('[id^="Details-"] summary').forEach((t) => {
  t.setAttribute('role', 'button'),
    t.setAttribute('aria-expanded', t.parentNode.hasAttribute('open')),
    t.nextElementSibling.getAttribute('id') && t.setAttribute('aria-controls', t.nextElementSibling.id),
    t.addEventListener('click', (t) => {
      t.currentTarget.setAttribute('aria-expanded', !t.currentTarget.closest('details').hasAttribute('open'));
    }),
    t.closest('header-drawer, menu-drawer') || t.parentElement.addEventListener('keyup', onKeyUpEscape);
});
const trapFocusHandlers = {};
function trapFocus(t, e = t) {
  var i = getFocusableElements(t),
    s = i[0],
    n = i[i.length - 1];
  removeTrapFocus(),
    (trapFocusHandlers.focusin = (e) => {
      (e.target !== t && e.target !== n && e.target !== s) ||
        document.addEventListener('keydown', trapFocusHandlers.keydown);
    }),
    (trapFocusHandlers.focusout = function () {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    }),
    (trapFocusHandlers.keydown = function (e) {
      'TAB' === e.code.toUpperCase() &&
        (e.target !== n || e.shiftKey || (e.preventDefault(), s.focus()),
        (e.target !== t && e.target !== s) || !e.shiftKey || (e.preventDefault(), n.focus()));
    }),
    document.addEventListener('focusout', trapFocusHandlers.focusout),
    document.addEventListener('focusin', trapFocusHandlers.focusin),
    e.focus(),
    'INPUT' === e.tagName &&
      ['search', 'text', 'email', 'url'].includes(e.type) &&
      e.value &&
      e.setSelectionRange(0, e.value.length);
}
try {
  document.querySelector(':focus-visible');
} catch (t) {
  focusVisiblePolyfill();
}
function focusVisiblePolyfill() {
  const t = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let e = null,
    i = null;
  window.addEventListener('keydown', (e) => {
    t.includes(e.code.toUpperCase()) && (i = !1);
  }),
    window.addEventListener('mousedown', (t) => {
      i = !0;
    }),
    window.addEventListener(
      'focus',
      () => {
        e && e.classList.remove('focused'), i || ((e = document.activeElement), e.classList.add('focused'));
      },
      !0
    );
}
function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((t) => {
    t.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }),
    document.querySelectorAll('.js-vimeo').forEach((t) => {
      t.contentWindow.postMessage('{"method":"pause"}', '*');
    }),
    document.querySelectorAll('video').forEach((t) => t.pause()),
    document.querySelectorAll('product-model').forEach((t) => {
      t.modelViewerUI && t.modelViewerUI.pause();
    });
}
function removeTrapFocus(t = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin),
    document.removeEventListener('focusout', trapFocusHandlers.focusout),
    document.removeEventListener('keydown', trapFocusHandlers.keydown),
    t && t.focus();
}
function onKeyUpEscape(t) {
  if ('ESCAPE' !== t.code.toUpperCase()) return;
  const e = t.target.closest('details[open]');
  if (!e) return;
  const i = e.querySelector('summary');
  e.removeAttribute('open'), i.setAttribute('aria-expanded', !1), i.focus();
}
class QuantityInput extends HTMLElement {
  constructor() {
    super(),
      (this.input = this.querySelector('input')),
      (this.changeEvent = new Event('change', { bubbles: !0 })),
      this.input.addEventListener('change', this.onInputChange.bind(this)),
      this.querySelectorAll('button').forEach((t) => t.addEventListener('click', this.onButtonClick.bind(this)));
  }
  quantityUpdateUnsubscriber = void 0;
  connectedCallback() {
    this.validateQtyRules(),
      (this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this)));
  }
  disconnectedCallback() {
    this.quantityUpdateUnsubscriber && this.quantityUpdateUnsubscriber();
  }
  onInputChange(t) {
    this.validateQtyRules();
  }
  onButtonClick(t) {
    t.preventDefault();
    const e = this.input.value;
    'plus' === t.target.name ? this.input.stepUp() : this.input.stepDown(),
      e !== this.input.value && this.input.dispatchEvent(this.changeEvent);
  }
  validateQtyRules() {
    const t = parseInt(this.input.value);
    if (this.input.min) {
      const e = parseInt(this.input.min);
      this.querySelector(".quantity__button[name='minus']").classList.toggle('disabled', t <= e);
    }
    if (this.input.max) {
      const e = parseInt(this.input.max);
      this.querySelector(".quantity__button[name='plus']").classList.toggle('disabled', t >= e);
    }
  }
}
function debounce(t, e) {
  let i;
  return (...s) => {
    clearTimeout(i), (i = setTimeout(() => t.apply(this, s), e));
  };
}
function throttle(t, e) {
  let i = 0;
  return function (...s) {
    const n = new Date().getTime();
    if (!(n - i < e)) return (i = n), t(...s);
  };
}
function fetchConfig(t = 'json') {
  return { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: `application/${t}` } };
}
customElements.define('quantity-input', QuantityInput),
  void 0 === window.Shopify && (window.Shopify = {}),
  (Shopify.bind = function (t, e) {
    return function () {
      return t.apply(e, arguments);
    };
  }),
  (Shopify.setSelectorByValue = function (t, e) {
    for (var i = 0, s = t.options.length; i < s; i++) {
      var n = t.options[i];
      if (e == n.value || e == n.innerHTML) return (t.selectedIndex = i), i;
    }
  }),
  (Shopify.addListener = function (t, e, i) {
    t.addEventListener ? t.addEventListener(e, i, !1) : t.attachEvent('on' + e, i);
  }),
  (Shopify.postLink = function (t, e) {
    var i = (e = e || {}).method || 'post',
      s = e.parameters || {},
      n = document.createElement('form');
    for (var o in (n.setAttribute('method', i), n.setAttribute('action', t), s)) {
      var r = document.createElement('input');
      r.setAttribute('type', 'hidden'), r.setAttribute('name', o), r.setAttribute('value', s[o]), n.appendChild(r);
    }
    document.body.appendChild(n), n.submit(), document.body.removeChild(n);
  }),
  (Shopify.CountryProvinceSelector = function (t, e, i) {
    (this.countryEl = document.getElementById(t)),
      (this.provinceEl = document.getElementById(e)),
      (this.provinceContainer = document.getElementById(i.hideElement || e)),
      Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this)),
      this.initCountry(),
      this.initProvince();
  }),
  (Shopify.CountryProvinceSelector.prototype = {
    initCountry: function () {
      var t = this.countryEl.getAttribute('data-default');
      Shopify.setSelectorByValue(this.countryEl, t), this.countryHandler();
    },
    initProvince: function () {
      var t = this.provinceEl.getAttribute('data-default');
      t && this.provinceEl.options.length > 0 && Shopify.setSelectorByValue(this.provinceEl, t);
    },
    countryHandler: function (t) {
      var e = (n = this.countryEl.options[this.countryEl.selectedIndex]).getAttribute('data-provinces'),
        i = JSON.parse(e);
      if ((this.clearOptions(this.provinceEl), i && 0 == i.length)) this.provinceContainer.style.display = 'none';
      else {
        for (var s = 0; s < i.length; s++) {
          var n;
          ((n = document.createElement('option')).value = i[s][0]),
            (n.innerHTML = i[s][1]),
            this.provinceEl.appendChild(n);
        }
        this.provinceContainer.style.display = '';
      }
    },
    clearOptions: function (t) {
      for (; t.firstChild; ) t.removeChild(t.firstChild);
    },
    setOptions: function (t, e) {
      var i = 0;
      for (e.length; i < e.length; i++) {
        var s = document.createElement('option');
        (s.value = e[i]), (s.innerHTML = e[i]), t.appendChild(s);
      }
    },
  });
class MenuDrawer extends HTMLElement {
  constructor() {
    super(),
      (this.mainDetailsToggle = this.querySelector('details')),
      this.addEventListener('keyup', this.onKeyUp.bind(this)),
      this.addEventListener('focusout', this.onFocusOut.bind(this)),
      this.bindEvents();
  }
  bindEvents() {
    this.querySelectorAll('summary').forEach((t) => t.addEventListener('click', this.onSummaryClick.bind(this))),
      this.querySelectorAll('button:not(.localization-selector)').forEach((t) =>
        t.addEventListener('click', this.onCloseButtonClick.bind(this))
      );
  }
  onKeyUp(t) {
    if ('ESCAPE' !== t.code.toUpperCase()) return;
    const e = t.target.closest('details[open]');
    e &&
      (e === this.mainDetailsToggle
        ? this.closeMenuDrawer(t, this.mainDetailsToggle.querySelector('summary'))
        : this.closeSubmenu(e));
  }
  onSummaryClick(t) {
    const e = t.currentTarget,
      i = e.parentNode,
      s = i.closest('.has-submenu'),
      n = i.hasAttribute('open'),
      o = window.matchMedia('(prefers-reduced-motion: reduce)');
    function r() {
      trapFocus(e.nextElementSibling, i.querySelector('button')),
        e.nextElementSibling.removeEventListener('transitionend', r);
    }
    i === this.mainDetailsToggle
      ? (n && t.preventDefault(),
        n ? this.closeMenuDrawer(t, e) : this.openMenuDrawer(e),
        window.matchMedia('(max-width: 990px)') &&
          document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`))
      : setTimeout(() => {
          i.classList.add('menu-opening'),
            e.setAttribute('aria-expanded', !0),
            s && s.classList.add('submenu-open'),
            !o || o.matches ? r() : e.nextElementSibling.addEventListener('transitionend', r);
        }, 100);
  }
  openMenuDrawer(t) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    }),
      t.setAttribute('aria-expanded', !0),
      trapFocus(this.mainDetailsToggle, t),
      document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
  closeMenuDrawer(t, e = !1) {
    void 0 !== t &&
      (this.mainDetailsToggle.classList.remove('menu-opening'),
      this.mainDetailsToggle.querySelectorAll('details').forEach((t) => {
        t.removeAttribute('open'), t.classList.remove('menu-opening');
      }),
      this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach((t) => {
        t.classList.remove('submenu-open');
      }),
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`),
      removeTrapFocus(e),
      this.closeAnimation(this.mainDetailsToggle),
      t instanceof KeyboardEvent && e?.setAttribute('aria-expanded', !1));
  }
  onFocusOut() {
    setTimeout(() => {
      this.mainDetailsToggle.hasAttribute('open') &&
        !this.mainDetailsToggle.contains(document.activeElement) &&
        this.closeMenuDrawer();
    });
  }
  onCloseButtonClick(t) {
    const e = t.currentTarget.closest('details');
    this.closeSubmenu(e);
  }
  closeSubmenu(t) {
    const e = t.closest('.submenu-open');
    e && e.classList.remove('submenu-open'),
      t.classList.remove('menu-opening'),
      t.querySelector('summary').setAttribute('aria-expanded', !1),
      removeTrapFocus(t.querySelector('summary')),
      this.closeAnimation(t);
  }
  closeAnimation(t) {
    let e;
    const i = (s) => {
      void 0 === e && (e = s);
      s - e < 400
        ? window.requestAnimationFrame(i)
        : (t.removeAttribute('open'),
          t.closest('details[open]') && trapFocus(t.closest('details[open]'), t.querySelector('summary')));
    };
    window.requestAnimationFrame(i);
  }
}
customElements.define('menu-drawer', MenuDrawer);
class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }
  openMenuDrawer(t) {
    (this.header = this.header || document.querySelector('.section-header')),
      (this.borderOffset =
        this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom')
          ? 1
          : 0),
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      ),
      this.header.classList.add('menu-open'),
      setTimeout(() => {
        this.mainDetailsToggle.classList.add('menu-opening');
      }),
      t.setAttribute('aria-expanded', !0),
      window.addEventListener('resize', this.onResize),
      trapFocus(this.mainDetailsToggle, t),
      document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
  closeMenuDrawer(t, e) {
    e &&
      (super.closeMenuDrawer(t, e),
      this.header.classList.remove('menu-open'),
      window.removeEventListener('resize', this.onResize));
  }
  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      ),
      document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}
customElements.define('header-drawer', HeaderDrawer);
class ModalDialog extends HTMLElement {
  constructor() {
    super(),
      this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.hide.bind(this, !1)),
      this.addEventListener('keyup', (t) => {
        'ESCAPE' === t.code.toUpperCase() && this.hide();
      }),
      this.classList.contains('media-modal')
        ? this.addEventListener('pointerup', (t) => {
            'mouse' !== t.pointerType || t.target.closest('deferred-media, product-model') || this.hide();
          })
        : this.addEventListener('click', (t) => {
            t.target === this && this.hide();
          });
  }
  connectedCallback() {
    this.moved || ((this.moved = !0), document.body.appendChild(this));
  }
  show(t) {
    this.openedBy = t;
    const e = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden'),
      this.setAttribute('open', ''),
      e && e.loadContent(),
      trapFocus(this, this.querySelector('[role="dialog"]')),
      window.pauseAllMedia();
  }
  hide() {
    document.body.classList.remove('overflow-hidden'),
      document.body.dispatchEvent(new CustomEvent('modalClosed')),
      this.removeAttribute('open'),
      removeTrapFocus(this.openedBy),
      window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);
class ModalOpener extends HTMLElement {
  constructor() {
    super();
    const t = this.querySelector('button');
    t &&
      t.addEventListener('click', () => {
        const e = document.querySelector(this.getAttribute('data-modal'));
        e && e.show(t);
      });
  }
}
customElements.define('modal-opener', ModalOpener);
class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const t = this.querySelector('[id^="Deferred-Poster-"]');
    t && t.addEventListener('click', this.loadContent.bind(this));
  }
  loadContent(t = !0) {
    if ((window.pauseAllMedia(), !this.getAttribute('loaded'))) {
      const e = document.createElement('div');
      e.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(!0)),
        this.setAttribute('loaded', !0);
      const i = this.appendChild(e.querySelector('video, model-viewer, iframe'));
      t && i.focus(), 'VIDEO' == i.nodeName && i.getAttribute('autoplay') && i.play();
    }
  }
}
customElements.define('deferred-media', DeferredMedia);
class SliderComponent extends HTMLElement {
  constructor() {
    if (
      (super(),
      (this.slider = this.querySelector('[id^="Slider-"]')),
      (this.sliderItems = this.querySelectorAll('[id^="Slide-"]')),
      (this.enableSliderLooping = !1),
      (this.currentPageElement = this.querySelector('.slider-counter--current')),
      (this.pageTotalElement = this.querySelector('.slider-counter--total')),
      (this.prevButton = this.querySelector('button[name="previous"]')),
      (this.nextButton = this.querySelector('button[name="next"]')),
      !this.slider || !this.nextButton)
    )
      return;
    this.initPages();
    new ResizeObserver((t) => this.initPages()).observe(this.slider),
      this.slider.addEventListener('scroll', this.update.bind(this)),
      this.prevButton.addEventListener('click', this.onButtonClick.bind(this)),
      this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }
  initPages() {
    (this.sliderItemsToShow = Array.from(this.sliderItems).filter((t) => t.clientWidth > 0)),
      this.sliderItemsToShow.length < 2 ||
        ((this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft),
        (this.slidesPerPage = Math.floor(
          (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset
        )),
        (this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1),
        this.update());
  }
  resetPages() {
    (this.sliderItems = this.querySelectorAll('[id^="Slide-"]')), this.initPages();
  }
  update() {
    if (!this.slider || !this.nextButton) return;
    const t = this.currentPage;
    (this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1),
      this.currentPageElement &&
        this.pageTotalElement &&
        ((this.currentPageElement.textContent = this.currentPage),
        (this.pageTotalElement.textContent = this.totalPages)),
      this.currentPage != t &&
        this.dispatchEvent(
          new CustomEvent('slideChanged', {
            detail: { currentPage: this.currentPage, currentElement: this.sliderItemsToShow[this.currentPage - 1] },
          })
        ),
      this.enableSliderLooping ||
        (this.isSlideVisible(this.sliderItemsToShow[0]) && 0 === this.slider.scrollLeft
          ? this.prevButton.setAttribute('disabled', 'disabled')
          : this.prevButton.removeAttribute('disabled'),
        this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])
          ? this.nextButton.setAttribute('disabled', 'disabled')
          : this.nextButton.removeAttribute('disabled'));
  }
  isSlideVisible(t, e = 0) {
    const i = this.slider.clientWidth + this.slider.scrollLeft - e;
    return t.offsetLeft + t.clientWidth <= i && t.offsetLeft >= this.slider.scrollLeft;
  }
  onButtonClick(t) {
    t.preventDefault();
    const e = t.currentTarget.dataset.step || 1;
    (this.slideScrollPosition =
      'next' === t.currentTarget.name
        ? this.slider.scrollLeft + e * this.sliderItemOffset
        : this.slider.scrollLeft - e * this.sliderItemOffset),
      this.setSlidePosition(this.slideScrollPosition);
  }
  setSlidePosition(t) {
    this.slider.scrollTo({ left: t });
  }
}
customElements.define('slider-component', SliderComponent);
class SlideshowComponent extends SliderComponent {
  constructor() {
    super(),
      (this.sliderControlWrapper = this.querySelector('.slider-buttons')),
      (this.enableSliderLooping = !0),
      this.sliderControlWrapper &&
        ((this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide')),
        this.sliderItemsToShow.length > 0 && (this.currentPage = 1),
        (this.announcementBarSlider = this.querySelector('.announcement-bar-slider')),
        (this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0),
        (this.sliderControlLinksArray = Array.from(
          this.sliderControlWrapper.querySelectorAll('.slider-counter__link')
        )),
        this.sliderControlLinksArray.forEach((t) => t.addEventListener('click', this.linkToSlide.bind(this))),
        this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this)),
        this.setSlideVisibility(),
        this.announcementBarSlider &&
          ((this.announcementBarArrowButtonWasClicked = !1),
          (this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')),
          this.reducedMotion.addEventListener('change', () => {
            'true' === this.slider.getAttribute('data-autoplay') && this.setAutoPlay();
          }),
          [this.prevButton, this.nextButton].forEach((t) => {
            t.addEventListener(
              'click',
              () => {
                this.announcementBarArrowButtonWasClicked = !0;
              },
              { once: !0 }
            );
          })),
        'true' === this.slider.getAttribute('data-autoplay') && this.setAutoPlay());
  }
  setAutoPlay() {
    (this.autoplaySpeed = 1e3 * this.slider.dataset.speed),
      this.addEventListener('mouseover', this.focusInHandling.bind(this)),
      this.addEventListener('mouseleave', this.focusOutHandling.bind(this)),
      this.addEventListener('focusin', this.focusInHandling.bind(this)),
      this.addEventListener('focusout', this.focusOutHandling.bind(this)),
      this.querySelector('.slideshow__autoplay')
        ? ((this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay')),
          this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this)),
          (this.autoplayButtonIsSetToPlay = !0),
          this.play())
        : this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked
        ? this.pause()
        : this.play();
  }
  onButtonClick(t) {
    super.onButtonClick(t), (this.wasClicked = !0);
    const e = 1 === this.currentPage,
      i = this.currentPage === this.sliderItemsToShow.length;
    e || i
      ? (e && 'previous' === t.currentTarget.name
          ? (this.slideScrollPosition =
              this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length)
          : i && 'next' === t.currentTarget.name && (this.slideScrollPosition = 0),
        this.setSlidePosition(this.slideScrollPosition),
        this.applyAnimationToAnnouncementBar(t.currentTarget.name))
      : this.applyAnimationToAnnouncementBar(t.currentTarget.name);
  }
  setSlidePosition(t) {
    this.setPositionTimeout && clearTimeout(this.setPositionTimeout),
      (this.setPositionTimeout = setTimeout(() => {
        this.slider.scrollTo({ left: t });
      }, this.announcerBarAnimationDelay));
  }
  update() {
    super.update(),
      (this.sliderControlButtons = this.querySelectorAll('.slider-counter__link')),
      this.prevButton.removeAttribute('disabled'),
      this.sliderControlButtons.length &&
        (this.sliderControlButtons.forEach((t) => {
          t.classList.remove('slider-counter__link--active'), t.removeAttribute('aria-current');
        }),
        this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active'),
        this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', !0));
  }
  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay),
      this.autoplayButtonIsSetToPlay ? this.pause() : this.play(),
      (this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay);
  }
  focusOutHandling(t) {
    if (this.sliderAutoplayButton) {
      const e = t.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(t.target);
      if (!this.autoplayButtonIsSetToPlay || e) return;
      this.play();
    } else this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked || this.play();
  }
  focusInHandling(t) {
    if (this.sliderAutoplayButton) {
      (t.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(t.target)) &&
      this.autoplayButtonIsSetToPlay
        ? this.play()
        : this.autoplayButtonIsSetToPlay && this.pause();
    } else this.announcementBarSlider.contains(t.target) && this.pause();
  }
  play() {
    this.slider.setAttribute('aria-live', 'off'),
      clearInterval(this.autoplay),
      (this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed));
  }
  pause() {
    this.slider.setAttribute('aria-live', 'polite'), clearInterval(this.autoplay);
  }
  togglePlayButtonState(t) {
    t
      ? (this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused'),
        this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow))
      : (this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused'),
        this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow));
  }
  autoRotateSlides() {
    const t = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.sliderItemOffset;
    this.setSlidePosition(t), this.applyAnimationToAnnouncementBar();
  }
  setSlideVisibility(t) {
    this.sliderItemsToShow.forEach((t, e) => {
      const i = t.querySelectorAll('a');
      e === this.currentPage - 1
        ? (i.length &&
            i.forEach((t) => {
              t.removeAttribute('tabindex');
            }),
          t.setAttribute('aria-hidden', 'false'),
          t.removeAttribute('tabindex'))
        : (i.length &&
            i.forEach((t) => {
              t.setAttribute('tabindex', '-1');
            }),
          t.setAttribute('aria-hidden', 'true'),
          t.setAttribute('tabindex', '-1'));
    }),
      (this.wasClicked = !1);
  }
  applyAnimationToAnnouncementBar(t = 'next') {
    if (!this.announcementBarSlider) return;
    const e = this.sliderItems.length,
      i = 'next' === t ? 1 : -1,
      s = this.currentPage - 1;
    let n = (s + i) % e;
    n = -1 === n ? e - 1 : n;
    const o = this.sliderItems[n],
      r = this.sliderItems[s],
      a = 'announcement-bar-slider--fade-in',
      l = 'announcement-bar-slider--fade-out',
      d = ('next' === t && !(s === e - 1)) || ('previous' === t && 0 === s) ? 'next' : 'previous';
    r.classList.add(`${l}-${d}`),
      o.classList.add(`${a}-${d}`),
      setTimeout(() => {
        r.classList.remove(`${l}-${d}`), o.classList.remove(`${a}-${d}`);
      }, 2 * this.announcerBarAnimationDelay);
  }
  linkToSlide(t) {
    t.preventDefault();
    const e =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
        (this.sliderControlLinksArray.indexOf(t.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({ left: e });
  }
}
customElements.define('slideshow-component', SlideshowComponent);
class VariantSelects extends HTMLElement {
  constructor() {
    super(), this.addEventListener('change', this.onVariantChange);
  }
  onVariantChange() {
    this.updateOptions(),
      this.updateMasterId(),
      this.toggleAddButton(!0, '', !1),
      this.updatePickupAvailability(),
      this.removeErrorMessage(),
      this.updateVariantStatuses(),
      this.currentVariant
        ? (this.updateMedia(),
          this.updateURL(),
          this.updateVariantInput(),
          this.renderProductInfo(),
          this.updateShareUrl())
        : (this.toggleAddButton(!0, '', !0), this.setUnavailable());
  }
  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (t) => t.value);
  }
  updateMasterId() {
    this.currentVariant = this.getVariantData().find(
      (t) => !t.options.map((t, e) => this.options[e] === t).includes(!1)
    );
  }
  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    document
      .querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`)
      .forEach((t) => t.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, !0));
    const t = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!t) return;
    const e = t.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    t.prepend(e);
  }
  updateURL() {
    this.currentVariant &&
      'false' !== this.dataset.updateUrl &&
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  updateShareUrl() {
    const t = document.getElementById(`Share-${this.dataset.section}`);
    t && t.updateUrl && t.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }
  updateVariantInput() {
    document
      .querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`)
      .forEach((t) => {
        const e = t.querySelector('input[name="id"]');
        (e.value = this.currentVariant.id), e.dispatchEvent(new Event('change', { bubbles: !0 }));
      });
  }
  updateVariantStatuses() {
    const t = this.variantData.filter((t) => this.querySelector(':checked').value === t.option1),
      e = [...this.querySelectorAll('.product-form__input')];
    e.forEach((i, s) => {
      if (0 === s) return;
      const n = [...i.querySelectorAll('input[type="radio"], option')],
        o = e[s - 1].querySelector(':checked').value,
        r = t.filter((t) => t.available && t[`option${s}`] === o).map((t) => t[`option${s + 1}`]);
      this.setInputAvailability(n, r);
    });
  }
  setInputAvailability(t, e) {
    t.forEach((t) => {
      e.includes(t.getAttribute('value'))
        ? (t.innerText = t.getAttribute('value'))
        : (t.innerText = window.variantStrings.unavailable_with_option.replace('[value]', t.getAttribute('value')));
    });
  }
  updatePickupAvailability() {
    const t = document.querySelector('pickup-availability');
    t &&
      (this.currentVariant && this.currentVariant.available
        ? t.fetchAvailability(this.currentVariant.id)
        : (t.removeAttribute('available'), (t.innerHTML = '')));
  }
  removeErrorMessage() {
    const t = this.closest('section');
    if (!t) return;
    const e = t.querySelector('product-form');
    e && e.handleErrorMessage();
  }
  renderProductInfo() {
    const t = this.currentVariant.id,
      e = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
    fetch(
      `${this.dataset.url}?variant=${t}&section_id=${
        this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section
      }`
    )
      .then((t) => t.text())
      .then((i) => {
        if (this.currentVariant.id !== t) return;
        const s = new DOMParser().parseFromString(i, 'text/html'),
          n = document.getElementById(`price-${this.dataset.section}`),
          o = s.getElementById(
            `price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          ),
          r = s.getElementById(
            `Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          ),
          a = document.getElementById(`Sku-${this.dataset.section}`),
          l = s.getElementById(
            `Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          ),
          d = document.getElementById(`Inventory-${this.dataset.section}`),
          u = s.getElementById(
            `Volume-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          ),
          c = document.getElementById(`Price-Per-Item-${this.dataset.section}`),
          h = s.getElementById(
            `Price-Per-Item-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
          ),
          m = document.getElementById(`Volume-${this.dataset.section}`),
          p = document.getElementById(`Quantity-Rules-${this.dataset.section}`),
          y = document.getElementById(`Volume-Note-${this.dataset.section}`);
        y && y.classList.remove('hidden'),
          m && m.classList.remove('hidden'),
          p && p.classList.remove('hidden'),
          o && n && (n.innerHTML = o.innerHTML),
          l && d && (d.innerHTML = l.innerHTML),
          r && a && ((a.innerHTML = r.innerHTML), a.classList.toggle('hidden', r.classList.contains('hidden'))),
          u && m && (m.innerHTML = u.innerHTML),
          h && c && ((c.innerHTML = h.innerHTML), c.classList.toggle('hidden', h.classList.contains('hidden')));
        const g = document.getElementById(`price-${this.dataset.section}`);
        g && g.classList.remove('hidden'), d && d.classList.toggle('hidden', '' === l.innerText);
        const f = s.getElementById(`ProductSubmitButton-${e}`);
        this.toggleAddButton(!f || f.hasAttribute('disabled'), window.variantStrings.soldOut),
          publish(PUB_SUB_EVENTS.variantChange, { data: { sectionId: e, html: s, variant: this.currentVariant } });
      });
  }
  toggleAddButton(t = !0, e, i = !0) {
    const s = document.getElementById(`product-form-${this.dataset.section}`);
    if (!s) return;
    const n = s.querySelector('[name="add"]'),
      o = s.querySelector('[name="add"] > span');
    n &&
      (t
        ? (n.setAttribute('disabled', 'disabled'), e && (o.textContent = e))
        : (n.removeAttribute('disabled'), (o.textContent = window.variantStrings.addToCart)));
  }
  setUnavailable() {
    const t = document.getElementById(`product-form-${this.dataset.section}`),
      e = t.querySelector('[name="add"]'),
      i = t.querySelector('[name="add"] > span'),
      s = document.getElementById(`price-${this.dataset.section}`),
      n = document.getElementById(`Inventory-${this.dataset.section}`),
      o = document.getElementById(`Sku-${this.dataset.section}`),
      r = document.getElementById(`Price-Per-Item-${this.dataset.section}`),
      a = document.getElementById(`Volume-Note-${this.dataset.section}`),
      l = document.getElementById(`Volume-${this.dataset.section}`),
      d = document.getElementById(`Quantity-Rules-${this.dataset.section}`);
    e &&
      ((i.textContent = window.variantStrings.unavailable),
      s && s.classList.add('hidden'),
      n && n.classList.add('hidden'),
      o && o.classList.add('hidden'),
      r && r.classList.add('hidden'),
      a && a.classList.add('hidden'),
      l && l.classList.add('hidden'),
      d && d.classList.add('hidden'));
  }
  getVariantData() {
    return (
      (this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent)),
      this.variantData
    );
  }
}
customElements.define('variant-selects', VariantSelects);
class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }
  setInputAvailability(t, e) {
    t.forEach((t) => {
      e.includes(t.getAttribute('value')) ? t.classList.remove('disabled') : t.classList.add('disabled');
    });
  }
  updateOptions() {
    const t = Array.from(this.querySelectorAll('fieldset'));
    this.options = t.map((t) => Array.from(t.querySelectorAll('input')).find((t) => t.checked).value);
  }
}
customElements.define('variant-radios', VariantRadios);
class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    new IntersectionObserver(
      ((t, e) => {
        t[0].isIntersecting &&
          (e.unobserve(this),
          fetch(this.dataset.url)
            .then((t) => t.text())
            .then((t) => {
              const e = document.createElement('div');
              e.innerHTML = t;
              const i = e.querySelector('product-recommendations');
              i && i.innerHTML.trim().length && (this.innerHTML = i.innerHTML),
                !this.querySelector('slideshow-component') &&
                  this.classList.contains('complementary-products') &&
                  this.remove(),
                e.querySelector('.grid__item') && this.classList.add('product-recommendations--loaded');
            })
            .catch((t) => {
              console.error(t);
            }));
      }).bind(this),
      { rootMargin: '0px 0px 400px 0px' }
    ).observe(this);
  }
}
customElements.define('product-recommendations', ProductRecommendations);
