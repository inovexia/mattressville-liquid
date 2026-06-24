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

    document.querySelectorAll('.price-bucket-radio').forEach((radio) => {
      const bucket = parsePriceBucketLabel(radio.dataset.bucketLabel);
      radio.checked = bucket.min === currentMin && bucket.max === currentMax;
    });
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
