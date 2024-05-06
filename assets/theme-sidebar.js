let isMenuOpen = false,
  mq;
var menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (!isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}

if (window.matchMedia) {
  mq = window.matchMedia('(min-width: 640px)');
  mq.addListener(onMediaChange);
}

function closeMenu() {
  document.querySelector('.invx-container').style.transform = 'translateX(-300px)';
  isMenuOpen = false;
}

function openMenu() {
  document.querySelector('.invx-container').style.transform = 'translateX(0)';
  isMenuOpen = true;
}

function onMediaChange(mq) {
  if (mq.matches) {
    document.querySelector('.invx-container').style.transform = 'translateX(0)';
  } else {
    closeMenu();
  }
}

/**
 * COOKIE FUNCTIONS
 */
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie(cname) {
  let user = getCookie(cname);
  if (user != "") {
    return false;
  } else {
    
  }
}