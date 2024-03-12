Shop_name = Shopify.shop;
hostDomain = window.location.hostname;
// proxy = "customerdashboardlite";
proxy = 'customerdashboard';

var mainContentClass = document.getElementsByClassName('main-content')[0];
var mainClass = document.getElementsByClassName('main')[0];
var mainTag = document.getElementsByTagName('main')[0];
var cd_main = document.getElementsByClassName('cd_main')[0];
var mainId = document.querySelector('#main');
var mainContentId = document.querySelector('#main-content');
var cdp_main_always = document.querySelector('.cdp_main_always');
var MainContent = document.querySelector('#MainContent');
var nt_content = document.querySelector('#nt_content');

if (cdp_main_always) {
  cdp_main_always.classList.add('customerdb-parent');
  var NewElement = document.getElementById('customer-dashboard');
  NewElement.removeAttribute('style');
  cdp_main_always.prepend(NewElement);
} else if (
  cd_main ||
  mainContentClass ||
  mainClass ||
  mainTag ||
  mainId ||
  mainContentId ||
  nt_content ||
  MainContent
) {
  maincontainer =
    cd_main || mainContentClass || mainClass || mainTag || mainContentId || mainId || nt_content || MainContent;
  maincontainer.classList.add('customerdb-parent');
  var NewElement = document.getElementById('customer-dashboard');
  NewElement.removeAttribute('style');
  maincontainer.prepend(NewElement);
}

async function InstallMetafields(path, data) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

const checkBilling = () => {
  let billing = {};
  billing.target = 'check_billing';
  InstallMetafields(`https://${hostDomain}/apps/${proxy}`, billing);
};

const getWithExpiry = (item) => {
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item;
};

checkBilling();

//demo-test
CurrencyFormat = (function () {
  function defaultOption(opt, def) {
    return typeof opt == 'undefined' ? def : opt;
  }

  function formatMoney(cents, format) {
    format = window.moneyFormat;
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format;
    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? decimal + parts[1] : '';
      return dollarsAmount + centsAmount;
    }
    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ');
        break;
    }
    return formatString.replace(placeholderRegex, value);
  }
  return {
    formatMoney: formatMoney,
  };
})();

function accordion(id, btnId) {
  var btn = document.getElementById(btnId);
  var hide = btn.querySelector('.cd_hide_2');
  var view = btn.querySelector('.cd_view');
  var panel = document.getElementById(id);
  if (panel.style.maxHeight) {
    panel.style.maxHeight = null;
    view.classList.remove('cd_none');
    hide.classList.add('cd_none');
  } else {
    panel.style.maxHeight = panel.scrollHeight + 'px';
    view.classList.add('cd_none');
    hide.classList.remove('cd_none');
  }
}

var elements = document.getElementsByClassName('cd_menu-child');
var toactive = function () {
  if (this.classList.contains('cd_menu-child')) {
    const urlParams = new URLSearchParams(window.location.search);
    let param2 = urlParams.get('a');
    var elems = document.querySelectorAll('.cd_active');
    [].forEach.call(elems, function (el) {
      el.classList.remove('cd_active');
    });
    var param = this.getAttribute('id');
    if (param == 'link' || param == 'integration_link') {
      let param3 = document.getElementById(param2);
      return param3.classList.add('cd_active');
    }
    if (!param) {
      return myFunction('cd_my-profile');
    }
    myFunction(param);
    customer_dashboard = document.getElementById('customer-dashboard');
    customer_dashboard.scrollIntoView();
    this.classList.add('cd_active');
  }
};

function imgURL(src, size) {
  if (src) {
    // remove any current image size then add the new image size
    return src
      .replace(/_(pico|icon|thumb|small|compact|medium|large|grande|original|1024x1024|2048x2048|master)+\./g, '.')
      .replace(/\.jpg|\.png|\.gif|\.jpeg/g, function (match) {
        return '_' + size + match;
      });
  } else {
    return '';
  }
}

for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('click', toactive, false);
}

function myFunction(page) {
  var divsToHide = document.getElementsByClassName('cd_main-section');
  var element = document.querySelector('.cd_main-section#' + page);
  window.history.replaceState(null, null, '?a=' + page);
  if (element) {
    for (var i = 0; i < divsToHide.length; i++) {
      if (divsToHide[i].getAttribute('id') === page) {
        divsToHide[i].style.display = 'block';
      } else divsToHide[i].style.display = 'none';
    }
  }
}

const cd_queryString = window.location.search;
const cd_urlParams = new URLSearchParams(cd_queryString);
if (cd_urlParams) {
  var param = cd_urlParams.get('a');
  if (!param) param = 'cd_my-profile';
  var cd_active = document.querySelector('#' + param);
  if (param === 'cd_contact') cd_active = document.querySelector('#cd_orders');
  else if (param === 'cd_edit-profile') cd_active = document.querySelector('#cd_my-profile');
  else if (param === 'cd_add-address') cd_active = document.querySelector('#cd_addresses');
  cd_active.classList.add('cd_active');
  document.getElementsByClassName('cd_main-content').onload = myFunction(param);
}

function paramSet(params) {
  var url = new URL(location.href);
  var search_params = url.searchParams;
  search_params.set('a', params);
  url.search = search_params.toString();
  var new_url = url.toString();
  location.replace(new_url);
}

//post api
document.querySelector('#cd_form_customer').addEventListener('submit', async function (e) {
  e.preventDefault();
  var cd_update_profile = document.querySelector('.cd_update_profile');
  var cd_submit_data = cd_update_profile.querySelector('.cd_submit_data');
  var cd_submit_loader = cd_update_profile.querySelector('.cd_submit_loader');
  var success_message = document.getElementById('cd_success_message');
  var validation_phone = document.querySelector('.validation_phone');
  var formData = new FormData(this);
  var array = {};
  for (var pair of formData.entries()) {
    array[pair[0]] += ',' + pair[1];
  }
  array.accepts_marketing ? (array.accepts_marketing = 'subscribed') : (array.accepts_marketing = 'unsubscribed');
  array.target = 'profile-data';
  array = JSON.stringify(array).replace(/undefined,/g, '');
  array = JSON.parse(array);
  // var phone_length = array.phone.replace(/undefined,/g, "");
  // var phoneno = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  // if (phoneno.test(phone_length) || phone_length.length == 0) {
  cd_submit_data.classList.add('cd_none');
  cd_submit_loader.classList.remove('cd_none');
  const res = await InstallMetafields(`https://${hostDomain}/apps/${proxy}`, array);
  if (res.status == 200) {
    success_message.classList.add('cd_show');
    cd_submit_data.classList.remove('cd_none');
    cd_submit_loader.classList.add('cd_none');
    setTimeout(paramSet('cd_my-profile'), 1000);
  }
  // } else {
  //   validation_phone.classList.add('cd_error');
  // }
});

function cd_logout() {
  window.location.href = '/account/logout';
  var REDIRECT_PATH = '/account/login';
  if (cart_lang_2 == 'false') {
    REDIRECT_PATH = '/' + lang_2 + '/account/login';
  }
  fetch('/account/logout').then(() => (window.location.href = REDIRECT_PATH));
}

document.querySelector('.cd_logo .cd_logo_second').addEventListener('click', function () {
  var panel = document.querySelector('.cd_menu .cd_active_ul_toggle');
  var open = document.querySelector('.cd_logo .cd_logo_second .cd_nav_toggle');
  var close = document.querySelector('.cd_logo .cd_logo_second .cd_nav_close');
  if (panel.style.maxHeight) {
    panel.removeAttribute('style');
  } else {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }
  close.classList.toggle('cd_none');
  open.classList.toggle('cd_none');
});

document.querySelector('.cd_add_address').addEventListener('submit', function (e) {
  e.preventDefault();
  var cd_create_address = document.querySelector('.cd_create_address');
  var cd_submit_data = cd_create_address.querySelector('.cd_submit_data');
  var success_message = document.getElementById('cd_success_message_address_create');
  var cd_submit_loader = cd_create_address.querySelector('.cd_submit_loader');
  var addresses = this.action;
  cd_submit_data.classList.add('cd_none');
  cd_submit_loader.classList.remove('cd_none');
  var formData = new FormData(this);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', addresses, true);
  xhr.onload = function () {
    success_message.classList.add('cd_show');
    cd_submit_data.classList.remove('cd_none');
    cd_submit_loader.classList.add('cd_none');
    setTimeout(paramSet('cd_addresses'), 1500);
  };
  xhr.send(formData);
});

var cd_address_edit = document.getElementsByClassName('cd_address_edit');
for (var i = 0; i < cd_address_edit.length; i++) {
  countryProvince(cd_address_edit[i]);
  cd_address_edit[i].addEventListener(
    'submit',
    function (e) {
      e.preventDefault();
      var cd_update_address = e.target.querySelector('.cd_update_address');
      var cd_submit_data = cd_update_address.querySelector('.cd_submit_data');
      var success_message = document.getElementById('cd_success_message_address_update');
      var cd_submit_loader = cd_update_address.querySelector('.cd_submit_loader');
      var addresses = this.action;
      cd_submit_data.classList.add('cd_none');
      cd_submit_loader.classList.remove('cd_none');
      var formData = new FormData(this);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', addresses, true);
      xhr.onload = function () {
        success_message.classList.add('cd_show');
        cd_submit_data.classList.remove('cd_none');
        cd_submit_loader.classList.add('cd_none');
        setTimeout(paramSet('cd_addresses'), 1500);
      };
      xhr.send(formData);
    },
    false
  );
}

function countryProvinceFunctionCall(param, country, array, selectProvince) {
  const cd_province = param.querySelector('.cd_province_perent');
  cd_province.style.display = 'none';
  let check = 0;
  if (country) {
    country = JSON.parse(country);
    country.forEach((element) => {
      if (element) {
        check = 1;
        array += `<option value="${element[0]}">${element[0]}</option>`;
      }
    });
    selectProvince.textContent = '';
    if (check == 1) {
      cd_province.style.display = 'block';
      selectProvince.insertAdjacentHTML('beforeend', array);
    }
  }
}

function countryProvince(param) {
  const selectProvince = param.querySelector('#cd_province');
  const selectElement = param.querySelector('#cd_country');
  const value = selectElement.getAttribute('data-default');
  selectElement.value = value;
  let array = `<option value="${selectProvince.getAttribute('data-default')}">${selectProvince.getAttribute(
    'data-default'
  )}</option>`;
  let country = selectElement.options[selectElement.selectedIndex]?.getAttribute('data-provinces');
  countryProvinceFunctionCall(param, country, array, selectProvince);
  param.querySelector('#cd_country').addEventListener('change', function () {
    let array2 = '';
    let country2 = this.options[this.selectedIndex].getAttribute('data-provinces');
    countryProvinceFunctionCall(param, country2, array2, selectProvince);
  });
}

function addNewAddressCountry(cd_add_addressLoad) {
  var cd_add_addressCountry = cd_add_addressLoad.querySelector('#cd_country');
  var selectProvinceProvince = cd_add_addressLoad.querySelector('#cd_province');
  let cd_province_perent = cd_add_addressLoad.querySelector('.cd_province_perent');
  cd_province_perent.style.display = 'none';
  let check = 0;
  var cd_province_value =
    cd_add_addressCountry.options[cd_add_addressCountry.selectedIndex]?.getAttribute('data-provinces');
  if (cd_province_value) {
    cd_province_value = JSON.parse(cd_province_value);
    let array = '';
    cd_province_value.forEach((element) => {
      if (element) {
        check = 1;
        array += `<option value="${element[0]}">${element[0]}</option>`;
      }
    });
    selectProvinceProvince.textContent = '';
    if (check == 1) {
      cd_province_perent.style.display = 'block';
      selectProvinceProvince.insertAdjacentHTML('beforeend', array);
    }
  }
  check = 0;
}

var cd_add_addressLoad = document.querySelector('.cd_add_address');
addNewAddressCountry(cd_add_addressLoad);

cd_add_addressLoad.querySelector('#cd_country').addEventListener('change', function (e) {
  addNewAddressCountry(cd_add_addressLoad);
});

function trackStatus(url, target) {
  window.open(url, target); // open the twitter page on a new window
}

document.querySelector('.cd_backFunction').addEventListener('click', function (e) {
  customer_dashboard = document.getElementById('customer-dashboard');
  customer_dashboard.scrollIntoView();
  myFunction('cd_my-profile');
});

document.querySelector('.cd_backContact').addEventListener('click', function (e) {
  customer_dashboard = document.getElementById('customer-dashboard');
  customer_dashboard.scrollIntoView();
  myFunction('cd_orders');
});

var cd_backFunction = document.getElementsByClassName('cd_backAddress');
for (var i = 0; i < cd_backFunction.length; i++) {
  cd_backFunction[i].addEventListener('click', function () {
    customer_dashboard = document.getElementById('customer-dashboard');
    customer_dashboard.scrollIntoView();
    myFunction('cd_addresses');
  });
}

async function addToCart(variant, quantity) {
  const items = [
    {
      id: variant.replace(/\s/g, ''),
      quantity: quantity,
    },
  ];
  const str = await InstallMetafields('/cart/add.js', { items: items });
  if (str.description) {
    var modal = document.querySelector('.cd_modal-all');
    var cd_modal_all_content = modal.querySelector('#cd_modal-all-content');
    cd_modal_all_content.innerHTML = str.description;
    return modal.classList.toggle('cd_show-modal-all');
  }
  window.open('/cart', '_top');
}

function ariantOptions(params) {
  var value = params.value;
  var getAttribute = params.options[params.selectedIndex];
  var variant_available = getAttribute.getAttribute('variant_available');
  var price = getAttribute.getAttribute('price');
  var image = getAttribute.getAttribute('img');
  return { value, image, price, variant_available };
}

var cd_delete_button = document.getElementsByClassName('cd_delete_address');
for (var i = 0; i < cd_delete_button.length; i++) {
  cd_delete_button[i].addEventListener('submit', function (e) {
    e.preventDefault();
    var cd_delete_address = this.querySelector('.cd_delete-button');
    var cd_submit_data = cd_delete_address.querySelector('.cd_submit_data');
    var success_message = document.getElementById('cd_success_message_delete_update');
    var cd_submit_loader = cd_delete_address.querySelector('.cd_delete_this_address');
    var addresses = this.action;
    var modal = cd_delete_address.querySelector('.cd_modal');
    modal.classList.toggle('cd_show-modal');
    var cd_reorder_button = modal.getElementsByClassName('cd_reorder_button');
    for (var i = 0; i < cd_reorder_button.length; i++) {
      cd_reorder_button[i].addEventListener('click', function () {
        if (this.innerHTML == 'Yes') {
          cd_submit_data.classList.add('cd_none');
          cd_submit_loader.classList.remove('cd_none');
          var data = new FormData();
          data.append('_method', 'delete');
          var xhr = new XMLHttpRequest();
          xhr.open('POST', addresses, true);
          xhr.onload = function () {
            cd_submit_data.classList.remove('cd_none');
            cd_submit_loader.classList.add('cd_none');
            success_message.classList.add('cd_show');
            setTimeout(paramSet('cd_addresses'), 1000);
          };
          xhr.send(data);
        }
      });
    }
  });
}

var cd_make_default_address = document.getElementsByClassName('cd_make_default_address');
for (var i = 0; i < cd_make_default_address.length; i++) {
  cd_make_default_address[i].addEventListener('submit', function () {
    var success_message = document.getElementById('cd_success_message_make_default_address');
    var addresses = this.action;
    fetch(addresses).then(() => {
      success_message.classList.add('cd_show');
      setTimeout(paramSet('cd_addresses'), 1000);
    });
  });
}

document.querySelector('#cd_change_password_form').addEventListener('submit', async function (e) {
  e.preventDefault();
  var cd_length_char = document.querySelector('.cd_length_char');
  var cd_not_same = document.querySelector('.cd_not_same');
  var cd_change_password = document.querySelector('.cd_change_password');
  var cd_submit_data = cd_change_password.querySelector('.cd_submit_data');
  var cd_submit_loader = cd_change_password.querySelector('.cd_submit_loader');
  var cd_default_store = document.querySelector('.cd_default_store');
  var success_message = document.getElementById('cd_success_message_password');
  var formData = new FormData(this);
  var array = {};
  for (var pair of formData.entries()) {
    array[pair[0]] = pair[1];
  }
  array.target = 'change_password';
  if (array.id === '6715665285442') {
    cd_default_store.classList.add('cd_error');
  } else {
    cd_default_store.classList.remove('cd_error');
    if (array.password === array.passwordConfirmation) {
      function myGreeting() {
        if (cart_lang_2 == 'false') {
          window.location.href = '/' + lang_2 + '/account/login';
        } else window.location.href = '/account/login';
      }
      if (array.password.length > 7) {
        cd_submit_data.classList.add('cd_none');
        cd_submit_loader.classList.remove('cd_none');
        const res = await InstallMetafields(`https://${hostDomain}/apps/${proxy}`, array);
        if (res.status == 200) {
          success_message.classList.add('cd_show');
          cd_submit_data.classList.remove('cd_none');
          cd_submit_loader.classList.add('cd_none');
          setTimeout(myGreeting, 2000);
        }
      } else {
        cd_length_char.classList.add('cd_error');
        cd_not_same.classList.remove('cd_error');
      }
    } else {
      cd_not_same.classList.add('cd_error');
      cd_length_char.classList.remove('cd_error');
    }
  }
});

var elements = document.querySelectorAll('.cd_order-contact .cd_reorder');
var cd_order_variant = document.getElementsByClassName('cd_order_variant');
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener(
    'click',
    async function (event) {
      var reorder_id = event.target.getAttribute('reorder_id');
      const items = [];
      for (let index = 0; index < cd_order_variant.length; index++) {
        let element = cd_order_variant[index];
        let id = element.getAttribute('id');
        if (id === reorder_id) {
          let variant_id = element.getAttribute('variant_id');
          var item = {
            quantity: 1,
            id: variant_id,
          };
          items.push(item);
        }
      }
      const str = await InstallMetafields('/cart/add.js', { items: items });
      if (str.description) {
        var modal = document.querySelector('.cd_modal-all');
        var cd_modal_all_content = modal.querySelector('#cd_modal-all-content');
        cd_modal_all_content.innerHTML = str.description;
        return modal.classList.toggle('cd_show-modal-all');
      }
      var modal = document.querySelector('.cd_modal');
      modal.classList.toggle('cd_show-modal');
    },
    false
  );
}

var contact_posted = localStorage.getItem('contact_posted');
if (contact_posted == 'yes') {
  var cd_success_message_contact = document.querySelector('#cd_success_message_contact');
  setTimeout(function () {
    cd_success_message_contact.classList.add('cd_show');
  }, 1000);

  setTimeout(function () {
    cd_success_message_contact.classList.remove('cd_show');
  }, 3000);
  localStorage.removeItem('contact_posted');
}

setTimeout(() => {
  var cd_modal_all = document.querySelector('.cd_modal-all');
  var cd_modal_all_content = cd_modal_all.querySelector('#cd_modal-all-cancel-button');
  cd_modal_all_content.addEventListener('click', function () {
    cd_modal_all.classList.toggle('cd_show-modal-all');
  });

  var cd_grid__item_recently_viewed = document.getElementsByClassName('cd_recently_viewed_products_grid__item');
  for (var i = 0; i < cd_grid__item_recently_viewed.length; i++) {
    RecentlyViewedFunctionOnchange(cd_grid__item_recently_viewed[i]);
    cd_grid__item_recently_viewed[i].addEventListener('click', function (e) {
      var cd_card__btn = this.querySelector('.cd_recently_viewed_products_card__btn');
      var cd_card__btn_variant_id = cd_card__btn.getAttribute('variant');
      var variant_quantity = cd_card__btn.getAttribute('variant_quantity');
      var cd_product_quantity_input = this.querySelector('.cd_recently_viewed_products_product_quantity_input');
      if (cd_product_quantity_input.value == '' || null) cd_product_quantity_input.value = 1;
      if (e.target.classList.contains('cd_recently_viewed_products_product_quantity_btn_plus')) {
        var increase_count = parseInt(cd_product_quantity_input.value) + 1;
        cd_product_quantity_input.value = increase_count;
        cd_card__btn.setAttribute('variant_quantity', increase_count);
      } else if (e.target.classList.contains('cd_recently_viewed_products_product_quantity_btn_minus')) {
        if (parseInt(cd_product_quantity_input.value) > 1) {
          var decrease_count = parseInt(cd_product_quantity_input.value) - 1;
          cd_product_quantity_input.value = decrease_count;
          cd_card__btn.setAttribute('variant_quantity', decrease_count);
        }
      }
      if (e.target.classList.contains('cd_recently_viewed_products_card__btn')) {
        addToCart(cd_card__btn_variant_id, variant_quantity);
      }
    });
  }
  var cd_grid__item_top_ordered_products = document.getElementsByClassName('cd_top_ordered_products_grid__item');
  for (var i = 0; i < cd_grid__item_top_ordered_products.length; i++) {
    TopOrderedProductsFunctionOnchange(cd_grid__item_top_ordered_products[i]);
    cd_grid__item_top_ordered_products[i].addEventListener('click', function (e) {
      var cd_card__btn = this.querySelector('.cd_top_ordered_products_card__btn');
      var cd_card__btn_variant_id = cd_card__btn.getAttribute('variant');
      var variant_quantity = cd_card__btn.getAttribute('variant_quantity');
      var cd_product_quantity_input = this.querySelector('.cd_top_ordered_products_product_quantity_input');
      if (cd_product_quantity_input.value == '' || null) cd_product_quantity_input.value = 1;
      if (e.target.classList.contains('cd_top_ordered_products_product_quantity_btn_plus')) {
        var increase_count = parseInt(cd_product_quantity_input.value) + 1;
        cd_product_quantity_input.value = increase_count;
        cd_card__btn.setAttribute('variant_quantity', increase_count);
      } else if (e.target.classList.contains('cd_top_ordered_products_product_quantity_btn_minus')) {
        if (parseInt(cd_product_quantity_input.value) > 1) {
          var decrease_count = parseInt(cd_product_quantity_input.value) - 1;
          cd_product_quantity_input.value = decrease_count;
          cd_card__btn.setAttribute('variant_quantity', decrease_count);
        }
      }
      if (e.target.classList.contains('cd_top_ordered_products_card__btn')) {
        addToCart(cd_card__btn_variant_id, variant_quantity);
      }
    });
  }
}, 0);

function RecentlyViewedFunctionOnchange(param) {
  if (param.querySelector('.cd_recently_viewed_products_variant_options')) {
    param.querySelector('.cd_recently_viewed_products_variant_options').addEventListener('change', function () {
      var cd_variant_options = param.querySelector('.cd_recently_viewed_products_variant_options');
      var cd_card__img = param.querySelector('.cd_recently_viewed_products_card__img a img');
      var cd_card_link = param.querySelector('.cd_recently_viewed_products_card_link');
      var cd_card__text = param.querySelector('.cd_recently_viewed_products_card__text span');
      var cd_card__btn = param.querySelector('.cd_recently_viewed_products_card__btn');

      const urlObj = new URL(cd_card_link.href);
      urlObj.search = '';
      const result = urlObj.toString();
      cd_card_link.href = result + '?variant=' + cd_variant_options.value;
      var options = ariantOptions(cd_variant_options);
      cd_card__img.src = options.image;
      cd_card__text.innerHTML = options.price;
      cd_card__btn.setAttribute('variant', options.value);
    });
  }
}

function TopOrderedProductsFunctionOnchange(param) {
  if (param.querySelector('.cd_top_ordered_products_variant_options')) {
    param.querySelector('.cd_top_ordered_products_variant_options').addEventListener('change', function () {
      var cd_variant_options = param.querySelector('.cd_top_ordered_products_variant_options');
      var cd_card__img = param.querySelector('.cd_top_ordered_products_card__img a img');
      var cd_card__text = param.querySelector('.cd_top_ordered_products_card__text span');
      var cd_card__btn = param.querySelector('.cd_top_ordered_products_card__btn');
      var cd_card_link = param.querySelector('.cd_top_ordered_products_card_link');
      const urlObj = new URL(cd_card_link.href);
      urlObj.search = '';
      const result = urlObj.toString();
      cd_card_link.href = result + '?variant=' + cd_variant_options.value;
      var options = ariantOptions(cd_variant_options);
      cd_card__img.src = options.image;
      cd_card__text.innerHTML = options.price;
      cd_card__btn.setAttribute('variant', options.value);
    });
  }
}

function getRecentlyProducts() {
  var getproducts = localStorage.getItem('cd_recently_viewed');
  getproducts = JSON.parse(getproducts) || [];
  if (getproducts.value !== undefined) {
    localStorage.removeItem('cd_recently_viewed');
    getproducts = [];
  }
  var cd_grid = document.querySelector('#cd_recently-viewed .cd_recently_viewed_products_grid');
  if (cd_grid == null) return true;
  const now = new Date();
  getproducts = getproducts.filter((element) => now.getTime() < element.expiry);
  localStorage.setItem('cd_recently_viewed', JSON.stringify(getproducts));
  if (getproducts.length == 0) {
    var cd_grid_2 = document.querySelector('#cd_recently-viewed .cd_recently_viewed_products_grid_2');
    cd_grid.remove();
    return cd_grid_2.classList.toggle('cd_recently_viewed_products_grid_2');
  }
  for (let index = 0; index < getproducts.length; index++) {
    var all_option = [];
    const element = getproducts[index];
    if (element.product?.variants.length > 0) {
      for (let product_variants = 0; product_variants < element.product?.variants.length; product_variants++) {
        const product_variants_element = element.product?.variants[product_variants];
        all_option.push(`
      <option value="${product_variants_element.id}
      "variant_available="${product_variants_element.available ? 1 : 0}" 
      price="${CurrencyFormat.formatMoney(product_variants_element.price, window.moneyFormat)}"
      img="${
        product_variants_element.featured_image?.src != undefined
          ? imgURL(product_variants_element.featured_image.src, '200x')
          : imgURL(element.product?.featured_image, '200x')
      }">${product_variants_element.public_title}</option>`);
      }
    }
    cd_grid.innerHTML += `<div class="cd_recently_viewed_products_grid__item">
<div class="cd_recently_viewed_products_card">
  <div class="cd_recently_viewed_products_card__content">
  <span class="cd_recently_viewed_products_card__img"> 
  ${
    element.product?.featured_image
      ? `<a class="cd_recently_viewed_products_card_link" href=${element.product?.url} target="_blank">
    <img style="width:100%" src=${imgURL(element.product?.featured_image, '200x')} alt="Snowy Mountains"/>
    </a>`
      : ''
  }
  </span>
    <a class="cd_recently_viewed_products_card__header cd_tooltiptext_parent_div" href=${element.product?.url}>
    <p class="cd_order_product_title">${element.handle}</p>
    <span class="cd_tooltiptext">${element.handle}</span>
    </a>
    <p class="cd_recently_viewed_products_card__text">
    <span>${CurrencyFormat.formatMoney(element.product?.price, window.moneyFormat)}</span>
  </p>
 ${
   element.product?.variants.length > 1
     ? `<div style="height: 40px;display: block;"><select class="cd_recently_viewed_products_variant_options">
     ${all_option}
   </select></div>`
     : `<div style="height: 40px;display: block;"><select style="display:none" class="cd_variant_options">
     </select></div>`
 }
<div class="cd_recently_viewed_products_product_quantity">
<input class="cd_recently_viewed_products_product_quantity_btn_minus" type="button" value="-">
<input class="cd_recently_viewed_products_product_quantity_input" onkeypress="return (event.key!='0' && event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))" pattern="[0-9.]+" type="text" value="1" />
<input class="cd_recently_viewed_products_product_quantity_btn_plus" type="button" value='+'>
</div>
<button class="cd_recently_viewed_products_card__btn" 
${element.product?.variants[0].available ? '' : 'disabled'}
style="cursor:${element.product?.variants[0].available ? 'pointer' : 'no-drop'};opacity:${
      element.product?.variants[0].available ? 1 : 0.5
    }"
variant_quantity="1" variant=${element.product?.variants[0].id}> 
${
  element.product?.variants[0].available
    ? cd_recently_viewed_products_add_to_cart
    : cd_recently_viewed_products_sold_out
}
</button>
  </div>
</div>
</div>`;
  }
}

function getTopOrdersProducts() {
  var cd_grid = document.querySelector('#cd_top-ordered-products .cd_top_ordered_products_grid');
  if (cd_grid == null) return true;
  else if (productsarray.length == 0) {
    var cd_grid_2 = document.querySelector('#cd_top-ordered-products .cd_top_ordered_products_grid_2');
    cd_grid.remove();
    return cd_grid_2.classList.toggle('cd_top_ordered_products_grid_2');
  } else if (productsarray.length > 0) {
    for (let index = 0; index < productsarray.length; index++) {
      var all_option = [];
      const element = productsarray[index];
      if (element?.variants.length > 0) {
        for (let product_variants = 0; product_variants < element?.variants.length; product_variants++) {
          const product_variants_element = element?.variants[product_variants];
          all_option.push(`<option value="${product_variants_element?.id}"
          variant_available="${product_variants_element?.available ? 1 : 0}" 
          price="${CurrencyFormat.formatMoney(product_variants_element?.price, window.moneyFormat)}"
          img="${
            product_variants_element?.featured_image?.src !== undefined
              ? imgURL(product_variants_element?.featured_image.src, '200x')
              : imgURL(element?.featured_image, '200x')
          }">${product_variants_element?.public_title}</option>`);
        }
      }
      cd_grid.innerHTML += `<div class="cd_top_ordered_products_grid__item">
      <div class="cd_top_ordered_products_card">
        <div class="cd_top_ordered_products_card__content">
        <span class="cd_top_ordered_products_card__img">
        ${
          element?.featured_image
            ? `<a class="cd_top_ordered_products_card_link" href=${'/products/' + element?.handle} target="_blank">
          <img style="width:100%" src=${imgURL(element?.featured_image, '200x')} alt="Snowy Mountains"/>
          </a>`
            : ''
        }
        </span>
          <a class="cd_top_ordered_products_card__header cd_tooltiptext_parent_div" href=${
            '/products/' + element?.handle
          }>
          <p class="cd_order_product_title">${element.title}</p>
          <span class="cd_tooltiptext">${element.title}</span>
          </a>
          <p class="cd_top_ordered_products_card__text">
          <span>${CurrencyFormat.formatMoney(element?.price, window.moneyFormat)}</span>
        </p>
        <p class="cd_top_ordered_products_count__text">
          <span>${top_ordered_text_value}: ${element?.count}</span>
        </p>
       ${
         element?.variants.length > 1
           ? `<div style="height: 40px;display: block;"><select class="cd_top_ordered_products_variant_options">${all_option}
         </select></div>`
           : `<div style="height: 40px;display: block;"><select style="display:none" class="cd_top_ordered_products_variant_options">
           </select></div>`
       }
      <div class="cd_top_ordered_products_product_quantity">
      <input class="cd_top_ordered_products_product_quantity_btn_minus" type="button" value="-">
      <input class="cd_top_ordered_products_product_quantity_input" onkeypress="return (event.key!='0' && event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))" pattern="[0-9.]+" type="text" value="1" />
      <input class="cd_top_ordered_products_product_quantity_btn_plus" type="button" value='+'>
      </div>
      <button class="cd_top_ordered_products_card__btn" 
      ${element?.variants[0].available ? '' : 'disabled'}
      style="cursor:${element?.variants[0].available ? 'pointer' : 'no-drop'};opacity:${
        element?.variants[0].available ? 1 : 0.5
      }"
      variant_quantity="1" variant=${element?.variants[0].id}> 
      ${element?.variants[0].available ? cd_top_ordered_products_add_to_cart : cd_top_ordered_products_sold_out}
      </button>
        </div>
      </div>
      </div>`;
    }
  }
}

getTopOrdersProducts();
getRecentlyProducts();

if (document.querySelector('#cd_yotpo_banner_layout')) {
  document.querySelector('#cd_yotpo_banner_layout').addEventListener('click', function () {
    document.querySelector('.yotpo-banner-layout').click();
  });
}

if (document.querySelector('#pp-tracking-page-app')) {
  const script = document.createElement('script');
  script.setAttribute('src', '//pp-proxy.parcelpanel.com/assets/tracking/track-page.js');
  script.setAttribute('defer', 'defer');
  document.getElementsByTagName('head')[0].append(script);
}

if (document.querySelector('#cdjoyio_loyalty')) {
  document.querySelector('#cdjoyio_loyalty').addEventListener('click', function () {
    document.querySelector('#Avada-Joy_FloatingButtonTrigger').click();
  });
}

if (document.querySelector('#cdkaktus_wishlist')) {
  document.querySelector('#cdkaktus_wishlist').addEventListener('click', function () {
    document.querySelector('.kaktus-w-wishlist-button__wrap').click();
  });
}

const paginationNumbers = document.getElementById('cd_pagination-numbers');
const paginatedList = document.getElementById('cd_paginated-list');
if (paginatedList) {
  const listItems = paginatedList.querySelectorAll('.cd_order-container');
  const nextButton = document.getElementById('cd_pagination_next-button');
  const paginationLimit = 4;
  const pageCount = Math.ceil(listItems.length);
  let currentPage = 1;
  let newPage = 1;
  const handlePageButtonsStatus = () => {
    if (pageCount <= newPage) {
      newPage = pageCount;
      nextButton.remove();
    }
  };

  const appendPageNumber = (index) => {
    const cd_paginationNumber = document.querySelector('.cd_pagination_current');
    const pageNumber = document.querySelector('.cd_pagination-number');
    cd_paginationNumber.innerHTML = newPage;
    pageNumber.innerHTML = index;
    pageNumber.setAttribute('page-index', index);
    pageNumber.setAttribute('aria-label', 'Page ' + index);
  };

  const getPaginationNumbers = () => {
    const cd_total_orders = document.querySelector('.cd_pagination_onchange');
    let replaceValue = cd_total_orders.textContent.replace('*', '<span class="cd_pagination_current">4</span>');
    replaceValue = replaceValue.replace('$', '<span class="cd_pagination_total">' + pageCount + '</span>');
    cd_total_orders.innerHTML = replaceValue;
    const pageNumber = document.createElement('button');
    pageNumber.className = 'cd_pagination-number';
    pageNumber.innerHTML = currentPage;
    pageNumber.setAttribute('page-index', currentPage);
    pageNumber.setAttribute('aria-label', 'Page ' + currentPage);
    pageNumber.style.display = 'none';
    paginationNumbers.appendChild(pageNumber);
  };

  const setCurrentPage = (pageNum) => {
    currentPage = parseInt(pageNum);
    const currRange = pageNum * paginationLimit;
    newPage = currRange;
    listItems.forEach((item, index) => {
      item.classList.add('hidden');
      if (index < currRange) {
        item.classList.remove('hidden');
      }
    });
    handlePageButtonsStatus();
  };

  nextButton.addEventListener('click', () => {
    setCurrentPage(currentPage + 1);
    appendPageNumber(currentPage + 1);
  });

  window.addEventListener('load', () => {
    getPaginationNumbers();
    setCurrentPage(1);
  });
}
