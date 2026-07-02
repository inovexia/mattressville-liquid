/**
 * Variant-aware price sorting for Dawn collection pages.
 * Sorts by the effective variant price for active Size + Option filters.
 */

(function () {
  'use strict';

  const GRID_SELECTOR = '#product-grid';
  const CARD_SELECTOR = '.grid__item';
  const PRICE_DATA_SELECTOR = '.product-price-data';
  const PAGINATION_SELECTOR = '.pagination-wrapper, .pagination, nav.pagination';

  const DEFAULT_SIZE = 'QUEEN';
  const DEFAULT_OPTION = 'NO BOX SPRING';
  const FALLBACK_OPTION = 'NO BOX';

  let allProducts = [];
  let perPage = 0;
  let totalPages = 1;
  let rebuildToken = 0;
  let selfMutating = false;
  let mutationDebounce = null;

  function findGrid() {
    return document.querySelector(GRID_SELECTOR);
  }

  function findStableContainer() {
    const grid = findGrid();
    if (!grid) return document.body;
    return grid.closest('[id*="ProductGridContainer"]') || grid.parentElement || document.body;
  }

  function findPagination() {
    return document.querySelector('.pagination-wrapper') || document.querySelector(PAGINATION_SELECTOR);
  }

  function normalize(value) {
    return String(value || '').trim().toUpperCase();
  }

  function getSelectedVariantOptions() {
    const params = new URLSearchParams(window.location.search);
    const selected = {
      size: [],
      option: []
    };

    params.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!lowerKey.startsWith('filter.v.option.')) return;

      const optionName = lowerKey.replace(/^filter\.v\.option\./, '');
      if (optionName === 'size') {
        selected.size.push(normalize(value));
      } else if (optionName === 'option' || optionName.includes('box')) {
        selected.option.push(normalize(value));
      }
    });

    return selected;
  }

  function getCollectionTitleSizeValue() {
    const grid = findGrid();
    const container = grid ? grid.closest('[data-collection-title]') : null;
    const title = container ? container.dataset.collectionTitle : '';
    if (!title || !title.includes(' Size ')) return null;

    const sizeValue = title.split(' Size ')[0].trim();
    return sizeValue || null;
  }

  function getCollectionDefaultSizes() {
    const sizeValue = getCollectionTitleSizeValue();
    return sizeValue ? [normalize(sizeValue)] : null;
  }

  const AUTOFILTER_PARAM = '_pricesort_auto';

  function maybeAutoFilterRedirect() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('filter.v.option.size') || params.has('sort_by')) return false;

    const sizeValue = getCollectionTitleSizeValue();
    if (!sizeValue) return false;

    // Circuit breaker: if something downstream strips our params and we end up
    // back here within a few seconds, that's a loop — abort instead of redirecting
    // again. A genuine repeat visit later (minutes/hours apart) still gets auto-filtered.
    const marker = 'priceSortAutoFilter:' + window.location.pathname;
    const now = Date.now();
    let lastRedirect = 0;
    try {
      lastRedirect = Number(sessionStorage.getItem(marker)) || 0;
    } catch (error) {
      lastRedirect = 0;
    }

    if (now - lastRedirect < 5000) {
      console.warn('[price-sort] auto-filter redirect loop detected, aborting');
      return false;
    }

    try {
      sessionStorage.setItem(marker, String(now));
    } catch (error) {
      // Storage unavailable (private browsing, etc.) — proceed without the breaker.
    }

    const url = new URL(window.location.href);
    url.searchParams.set('filter.v.option.size', normalize(sizeValue));
    url.searchParams.set('sort_by', 'price-ascending');
    url.searchParams.set(AUTOFILTER_PARAM, '1');
    window.location.replace(url.toString());

    return true;
  }

  function cleanupAutoFilterUrl() {
    if (!window.location.search.includes(AUTOFILTER_PARAM)) return;
    history.replaceState(null, '', window.location.pathname);
  }

  function getEffectiveSortBy() {
    const urlSort = new URLSearchParams(window.location.search).get('sort_by');
    if (urlSort) return urlSort.toLowerCase();

    // No sort_by in the URL means the collection's configured default sort
    // is in effect. The rendered <select> reflects that default correctly.
    const select = document.querySelector('select[name="sort_by"]');
    if (select && select.value) return select.value.toLowerCase();

    return '';
  }

  function getSortDirection() {
    return getEffectiveSortBy().includes('desc') ? 'desc' : 'asc';
  }

  function isPriceSort() {
    return getEffectiveSortBy().startsWith('price');
  }

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

  function getPriceRangeFilter() {
    const params = new URLSearchParams(window.location.search);
    const gte = params.get('filter.v.price.gte');
    const lte = params.get('filter.v.price.lte');

    // URL values are dollars; variant prices are in cents.
    let min = gte && Number.isFinite(Number(gte)) ? Number(gte) * 100 : null;
    let max = lte && Number.isFinite(Number(lte)) ? Number(lte) * 100 : null;

    if (min === null && max === null) {
      const bucketValue = params.get('filter.p.m.custom.price_range');
      if (bucketValue) {
        const bucket = parsePriceBucketLabel(bucketValue);
        min = bucket.min !== null ? bucket.min * 100 : null;
        max = bucket.max !== null ? bucket.max * 100 : null;
      }
    }

    return { min, max };
  }

  function hasPriceRangeFilter() {
    const { min, max } = getPriceRangeFilter();
    return min !== null || max !== null;
  }

  function shouldRebuild() {
    return isPriceSort() || hasPriceRangeFilter();
  }

  function filterByPriceRange() {
    const { min, max } = getPriceRangeFilter();
    if (min === null && max === null) return;

    // Shopify's native price filter matches on the product's overall
    // price_min/price_max across all variants, not the effective/displayed
    // variant price — so it can include products whose shown price is
    // actually outside the requested range. Re-filter on the effective price.
    allProducts = allProducts.filter((product) => {
      if (!isFinite(product.price)) return false;
      if (min !== null && product.price < min) return false;
      if (max !== null && product.price > max) return false;
      return true;
    });
  }

  function waitForGridReady(cb, tries = 0) {
    const grid = findGrid();
    if (!grid || grid.querySelectorAll(PRICE_DATA_SELECTOR).length === 0) {
      if (tries < 20) {
        return setTimeout(() => waitForGridReady(cb, tries + 1), 150);
      }
      return;
    }

    cb();
  }

  function readVariantData(card) {
    const el = card.querySelector(PRICE_DATA_SELECTOR);
    if (!el) return [];

    try {
      return JSON.parse(el.dataset.variantPrices || '[]');
    } catch (error) {
      console.warn('[price-sort] invalid variant data', error);
      return [];
    }
  }

  function findEffectiveVariant(variants, selected = getSelectedVariantOptions()) {
    if (!variants.length) return null;

    const sizes = selected.size.length
      ? selected.size
      : (getCollectionDefaultSizes() || [DEFAULT_SIZE]);
    const options = selected.option.length ? selected.option : [DEFAULT_OPTION, FALLBACK_OPTION, ''];

    for (const size of sizes) {
      for (const option of options) {
        const match = variants.find((variant) => {
          const sameSize = normalize(variant.option1) === size;
          const sameOption = option === '' || normalize(variant.option2) === option;
          return sameSize && sameOption;
        });

        if (match) return match;
      }
    }

    for (const size of sizes) {
      const sizeMatch = variants.find((variant) => normalize(variant.option1) === size);
      if (sizeMatch) return sizeMatch;
    }

    return variants[0];
  }

  function computePrice(variants, selected = getSelectedVariantOptions()) {
    const variant = findEffectiveVariant(variants, selected);
    return variant && Number.isFinite(Number(variant.price)) ? Number(variant.price) : Infinity;
  }

  function cardToProduct(card) {
    const variants = readVariantData(card);

    return {
      html: card.outerHTML,
      variants,
      price: computePrice(variants)
    };
  }

  function getSectionId() {
    const grid = findGrid();
    return grid ? (grid.dataset.id || null) : null;
  }

  async function fetchPage(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);

    // Using the section rendering API returns only the section HTML (~20–50 KB)
    // instead of the full storefront page (~200–400 KB), making each fetch
    // significantly faster when there are multiple pages to load.
    const sectionId = getSectionId();
    if (sectionId) url.searchParams.set('section_id', sectionId);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    return response.text();
  }

  function parseHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  function extractCards(html) {
    const grid = parseHtml(html).querySelector(GRID_SELECTOR);
    if (!grid) return [];

    return Array.from(grid.querySelectorAll(CARD_SELECTOR));
  }

  function detectTotalPagesFromHtml(html) {
    const pagination = parseHtml(html).querySelector(PAGINATION_SELECTOR);
    if (!pagination) return 1;

    let max = 1;
    pagination.querySelectorAll('a').forEach((link) => {
      try {
        const page = new URL(link.href).searchParams.get('page');
        if (page) max = Math.max(max, Number(page));
      } catch (error) {
        // Ignore non-URL pagination links.
      }
    });

    return max;
  }

  async function fetchPagesLimited(pageNumbers, concurrency = 4) {
    const results = new Array(pageNumbers.length);
    let next = 0;

    async function worker() {
      while (next < pageNumbers.length) {
        const index = next++;
        results[index] = await fetchPage(pageNumbers[index]);
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, pageNumbers.length) }, worker);
    await Promise.all(workers);

    return results;
  }

  async function buildAllProducts(token) {
    allProducts = [];

    const page1Html = await fetchPage(1);
    if (token !== rebuildToken) return false;
    if (!page1Html) return false;

    const page1Cards = extractCards(page1Html);
    const currentGrid = findGrid();
    perPage = page1Cards.length || (currentGrid ? currentGrid.querySelectorAll(CARD_SELECTOR).length : 0);
    page1Cards.forEach((card) => allProducts.push(cardToProduct(card)));

    totalPages = detectTotalPagesFromHtml(page1Html);

    const pageNumbers = [];
    for (let page = 2; page <= totalPages; page += 1) pageNumbers.push(page);

    const htmlPages = await fetchPagesLimited(pageNumbers, 4);
    if (token !== rebuildToken) return false;

    htmlPages.forEach((html, index) => {
      if (!html) {
        console.warn('[price-sort] failed to fetch page', pageNumbers[index]);
        return;
      }

      extractCards(html).forEach((card) => allProducts.push(cardToProduct(card)));
    });

    return true;
  }

  function sortProducts() {
    const selected = getSelectedVariantOptions();

    allProducts.forEach((product) => {
      product.price = computePrice(product.variants, selected);
    });

    filterByPriceRange();

    // Only re-sort when price sorting is actually active — otherwise preserve
    // Shopify's own fetched order (e.g. best-selling, relevance) and just
    // leave the out-of-range filtering applied above.
    if (!isPriceSort()) return;

    const direction = getSortDirection();
    allProducts.sort((a, b) => {
      const priceA = isFinite(a.price) ? a.price : Infinity;
      const priceB = isFinite(b.price) ? b.price : Infinity;

      return direction === 'asc' ? priceA - priceB : priceB - priceA;
    });
  }

  function showLoading() {
    const grid = findGrid();
    if (!grid) return;

    grid.style.transition = 'none';
    grid.style.opacity = '0';
    grid.style.pointerEvents = 'none';

    if (!document.getElementById('price-sort-loader')) {
      if (!document.getElementById('price-sort-style')) {
        const style = document.createElement('style');
        style.id = 'price-sort-style';
        style.textContent = '@keyframes price-sort-spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
      const loader = document.createElement('div');
      loader.id = 'price-sort-loader';
      loader.style.cssText = [
        'position:fixed',
        'top:50%',
        'left:50%',
        'transform:translate(-50%,-50%)',
        'z-index:9999',
        'width:48px',
        'height:48px',
        'border-radius:50%',
        'border:3px solid rgba(0,0,0,0.12)',
        'border-top-color:#D7355C',
        'animation:price-sort-spin 0.75s linear infinite'
      ].join(';');
      document.body.appendChild(loader);
    }
  }

  function hideLoading() {
    const grid = findGrid();
    if (!grid) return;

    const veil = document.getElementById('price-sort-veil');
    if (veil) veil.remove();

    const loader = document.getElementById('price-sort-loader');
    if (loader) loader.remove();

    // Force reflow so the transition fires from 0→1, not skipped.
    grid.style.transition = 'none';
    grid.style.opacity = '0';
    void grid.offsetHeight;

    grid.style.transition = 'opacity 0.4s ease';
    grid.style.opacity = '';
    grid.style.pointerEvents = '';
  }

  function updateVariantLabels() {
    const grid = findGrid();
    if (!grid) return;

    const selected = getSelectedVariantOptions();

    grid.querySelectorAll(CARD_SELECTOR).forEach((card) => {
      const variant = findEffectiveVariant(readVariantData(card), selected);
      if (!variant) return;

      const variantName = variant.option1 || '';
      const label = card.querySelector('.price__sale small');
      if (label && variantName) label.textContent = variantName.toUpperCase();
    });
  }

  function updatePaginationUI(active) {
    const wrapper = findPagination();
    if (!wrapper) return;

    const nav = document.createElement('nav');
    nav.className = 'pagination custom-pagination';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Pagination');

    const ul = document.createElement('ul');
    ul.className = 'pagination__list list-unstyled';
    ul.setAttribute('role', 'list');

    const prevIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 13" fill="none" width="24" height="11">
        <path d="M7.5 1L1 6.5L7.5 12" stroke="currentColor" stroke-width="2"/>
        <path d="M1 6.5H25" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;

    const nextIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 13" fill="none" width="24" height="11">
        <path d="M18.5 1L25 6.5L18.5 12" stroke="currentColor" stroke-width="2"/>
        <path d="M1 6.5H25" stroke="currentColor" stroke-width="2"/>
      </svg>
    `;

    if (active > 1) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'btn-navigate prev';
      link.href = '#';
      link.setAttribute('aria-label', 'Previous page');
      link.innerHTML = `${prevIcon}<span class="label">PREV</span>`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        renderPage(active - 1);
      });
      li.appendChild(link);
      ul.appendChild(li);
    }

    const pages = [1];
    const delta = 1;

    for (let page = active - delta; page <= active + delta; page += 1) {
      if (page > 1 && page < totalPages) pages.push(page);
    }

    if (totalPages > 1) pages.push(totalPages);

    let lastPage = 0;
    [...new Set(pages)].sort((a, b) => a - b).forEach((page) => {
      if (page - lastPage > 1) {
        const li = document.createElement('li');
        const dots = document.createElement('span');
        dots.className = 'btn-paginate dots';
        dots.textContent = '...';
        li.appendChild(dots);
        ul.appendChild(li);
      }

      const li = document.createElement('li');

      if (page === active) {
        const span = document.createElement('span');
        span.className = 'btn-paginate active';
        span.setAttribute('aria-current', 'page');
        span.textContent = page;
        li.appendChild(span);
      } else {
        const link = document.createElement('a');
        link.className = 'btn-paginate';
        link.href = '#';
        link.textContent = page;
        link.setAttribute('aria-label', `Page ${page}`);
        link.addEventListener('click', (event) => {
          event.preventDefault();
          renderPage(page);
        });
        li.appendChild(link);
      }

      ul.appendChild(li);
      lastPage = page;
    });

    if (active < totalPages) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'btn-navigate next';
      link.href = '#';
      link.setAttribute('aria-label', 'Next page');
      link.innerHTML = `<span class="label">NEXT</span>${nextIcon}`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        renderPage(active + 1);
      });
      li.appendChild(link);
      ul.appendChild(li);
    }

    nav.appendChild(ul);
    wrapper.innerHTML = '';
    wrapper.appendChild(nav);
  }

  function renderPage(page) {
    const grid = findGrid();
    if (!grid || !perPage) return;

    const safePage = Math.max(1, Math.min(page, totalPages));
    const start = (safePage - 1) * perPage;
    const slice = allProducts.slice(start, start + perPage);

    selfMutating = true;
    // On the search page, #product-grid is a wrapper <div> containing a
    // loading-overlay and a <ul class="grid">. Writing cards directly to
    // the div destroys the <ul> wrapper, breaking the flex layout. Write
    // to the inner <ul> when it exists; fall back to the grid element itself
    // on collection pages where #product-grid is already the <ul>.
    const cardContainer = grid.querySelector('ul.grid') || grid;
    cardContainer.innerHTML = slice.map((product) => product.html).join('');
    updateVariantLabels();
    updatePaginationUI(safePage);
    setTimeout(() => { selfMutating = false; }, 0);

    const url = new URL(window.location.href);
    url.searchParams.set('page', safePage);
    history.pushState({ page: safePage }, '', url);
  }

  async function rebuild() {
    const token = rebuildToken + 1;
    rebuildToken = token;

    showLoading();

    const built = await buildAllProducts(token);
    if (!built || token !== rebuildToken) {
      hideLoading();
      return;
    }

    sortProducts();

    totalPages = perPage ? Math.ceil(allProducts.length / perPage) : 1;
    const requestedPage = Number(new URLSearchParams(location.search).get('page')) || 1;
    renderPage(requestedPage);
    hideLoading();
    cleanupAutoFilterUrl();

    window.__priceSort = {
      ran: true,
      isPriceSort: isPriceSort(),
      priceRangeFilter: getPriceRangeFilter(),
      gridFound: !!findGrid(),
      productCount: allProducts.length,
      perPage,
      totalPages,
      prices: allProducts.map((product) => product.price)
    };
  }

  function hookDawn() {
    if (!window.FacetFiltersForm) {
      return setTimeout(hookDawn, 100);
    }

    const original = FacetFiltersForm.prototype.renderProductGridContainer;
    if (!original || original.__priceSortHooked) return;

    FacetFiltersForm.prototype.renderProductGridContainer = function (html) {
      original.call(this, html);
      if (shouldRebuild()) waitForGridReady(rebuild);
    };

    FacetFiltersForm.prototype.renderProductGridContainer.__priceSortHooked = true;
  }

  function observeGridChanges() {
    const target = findStableContainer();

    const observer = new MutationObserver((mutations) => {
      if (selfMutating) return;

      // Ignore mutations that happened inside an existing card (e.g. a
      // lazy-loaded review widget updating its own content) — only react
      // to changes at or above the grid level (a genuine card-set replacement).
      const relevant = mutations.some((mutation) => {
        const el = mutation.target;
        return !(el.closest && el.closest(CARD_SELECTOR));
      });
      if (!relevant) return;

      clearTimeout(mutationDebounce);
      mutationDebounce = setTimeout(() => {
        if (shouldRebuild()) waitForGridReady(rebuild);
      }, 250);
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (maybeAutoFilterRedirect()) return;

    window.__priceSort = {
      ran: false,
      isPriceSort: isPriceSort(),
      priceRangeFilter: getPriceRangeFilter(),
      gridFound: !!findGrid(),
      priceDataCount: findGrid() ? findGrid().querySelectorAll(PRICE_DATA_SELECTOR).length : 0
    };

    if (shouldRebuild()) {
      // Hide the grid immediately — before waitForGridReady starts polling —
      // so users never see the server-rendered unsorted/unfiltered cards.
      // The Liquid veil <style> already hides it from first paint; this call
      // covers the JS path (e.g. AJAX filter changes after initial load).
      showLoading();
      waitForGridReady(rebuild);
    }
    hookDawn();
    observeGridChanges();
  });
})();
