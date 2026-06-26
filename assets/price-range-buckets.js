/**
 * Price bucket radio buttons for the "Price Range" facet.
 * Selecting a bucket parses its label (e.g. "$301 - $600") into numeric
 * bounds and writes them into the native price_range filter's hidden
 * gte/lte inputs, then fires an 'input' event so Dawn's existing
 * FacetFiltersForm submits the AJAX filter request as usual. This drives
 * the same native filter.v.price.gte/lte params as the (hidden) "Price"
 * filter, rather than the custom.price_range metafield, since the metafield
 * can exclude products whose tagged bucket doesn't match the size variant
 * being viewed — price-sort.js then narrows the (broader) native match down
 * precisely to the effective/selected-size price.
 */
(function () {
  'use strict';

  if (window.__priceRangeBucketsInit) return;
  window.__priceRangeBucketsInit = true;

  function parsePriceBucketLabel(label) {
    const text = String(label || '').trim();

    const upToMatch = text.match(/up\s*to\s*\$?([\d,]+)/i);
    if (upToMatch) {
      return { min: null, max: Number(upToMatch[1].replace(/,/g, '')) };
    }

    const andUpMatch = text.match(/\$?([\d,]+)\s*and\s*up/i);
    if (andUpMatch) {
      return { min: Number(andUpMatch[1].replace(/,/g, '')), max: null };
    }

    const rangeMatch = text.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
    if (rangeMatch) {
      return {
        min: Number(rangeMatch[1].replace(/,/g, '')),
        max: Number(rangeMatch[2].replace(/,/g, ''))
      };
    }

    return { min: null, max: null };
  }

  const PRICE_PILL_MARKER = 'data-price-pill';
  const CLOSE_ICON_SVG = '<svg aria-hidden="true" focusable="false" width="12" height="13" class="icon icon-close-small" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8.48627 9.32917L2.82849 3.67098" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '<path d="M2.88539 9.38504L8.42932 3.61524" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '</svg>';

  function buildPriceLabel(min, max) {
    if (min !== null && max !== null) return '$' + min + ' - $' + max;
    if (min !== null) return '$' + min + ' and up';
    if (max !== null) return 'Up to $' + max;
    return '';
  }

  function buildRemoveUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('filter.v.price.gte');
    url.searchParams.delete('filter.v.price.lte');
    return url.toString();
  }

  // There's no price_range filter object for this collection (it uses a
  // metafield-based list filter instead), so the existing "active facets"
  // pill logic — which only knows how to show a price pill from such a
  // filter object — never fires for our gte/lte params. Inject/remove our
  // own matching pill manually, in every active-facets container on the page.
  function syncPricePill(label) {
    // Guard every DOM write against redundant mutations: this runs from the
    // same MutationObserver that watches .facets-container (the ancestor of
    // .active-facets), so writing unconditionally on every call would
    // re-trigger that observer indefinitely.
    const removeUrl = label ? buildRemoveUrl() : '';

    document.querySelectorAll('.active-facets').forEach((container) => {
      const existing = container.querySelector('[' + PRICE_PILL_MARKER + ']');

      if (!label) {
        if (existing) existing.remove();
        return;
      }

      if (existing) {
        const textEl = existing.querySelector('.active-facets__button-inner');
        const link = existing.querySelector('a');
        const wantedText = label + ' ';
        if (textEl.firstChild && textEl.firstChild.textContent !== wantedText) {
          textEl.firstChild.textContent = wantedText;
        }
        if (link.getAttribute('href') !== removeUrl) {
          link.setAttribute('href', removeUrl);
        }
        return;
      }

      const pill = document.createElement('facet-remove');
      pill.setAttribute(PRICE_PILL_MARKER, '');
      pill.innerHTML = '<a href="' + removeUrl + '" class="active-facets__button active-facets__button--light">' +
        '<span class="active-facets__button-inner button button--tertiary">' + label + ' ' +
        CLOSE_ICON_SVG +
        '<span class="visually-hidden">Remove filter</span>' +
        '</span></a>';
      container.appendChild(pill);
    });
  }

  function syncBucketState() {
    const params = new URLSearchParams(window.location.search);
    const gte = params.get('filter.v.price.gte');
    const lte = params.get('filter.v.price.lte');
    const currentMin = gte !== null && gte !== '' ? Number(gte) : null;
    const currentMax = lte !== null && lte !== '' ? Number(lte) : null;

    // The hidden gte/lte inputs have no SSR value (no price_range filter
    // object needs to exist for these params to work), so restore them from
    // the current URL on every render — otherwise changing an unrelated
    // filter (e.g. brand) would submit the price bucket inputs as blank and
    // silently drop the active price filter.
    document.querySelectorAll('[data-price-bucket-gte]').forEach((input) => {
      input.value = currentMin !== null ? currentMin : '';
    });
    document.querySelectorAll('[data-price-bucket-lte]').forEach((input) => {
      input.value = currentMax !== null ? currentMax : '';
    });

    let matchedLabel = '';
    document.querySelectorAll('.price-bucket-radio').forEach((radio) => {
      const bucket = parsePriceBucketLabel(radio.dataset.bucketLabel);
      const matches = bucket.min === currentMin && bucket.max === currentMax;
      radio.checked = matches;
      if (matches) matchedLabel = radio.dataset.bucketLabel;
    });

    const hasPriceFilter = currentMin !== null || currentMax !== null;
    const pillLabel = hasPriceFilter ? ('Price: ' + (matchedLabel || buildPriceLabel(currentMin, currentMax))) : '';
    syncPricePill(pillLabel);
  }

  document.addEventListener('change', (event) => {
    const radio = event.target.closest('.price-bucket-radio');
    if (!radio || !radio.checked) return;

    const container = radio.closest('details');
    if (!container) return;

    const gteInput = container.querySelector('[data-price-bucket-gte]');
    const lteInput = container.querySelector('[data-price-bucket-lte]');
    if (!gteInput || !lteInput) return;

    const bucket = parsePriceBucketLabel(radio.dataset.bucketLabel);
    gteInput.value = bucket.min !== null ? bucket.min : '';
    lteInput.value = bucket.max !== null ? bucket.max : '';

    const form = container.closest('form');
    if (form) form.dispatchEvent(new Event('input', { bubbles: true }));
  });

  function observeFacetsChanges() {
    const containers = document.querySelectorAll('.facets-container');
    if (!containers.length) return;

    const observer = new MutationObserver(() => {
      syncBucketState();
    });

    containers.forEach((container) => {
      observer.observe(container, { childList: true, subtree: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncBucketState();
    observeFacetsChanges();
  });
})();
