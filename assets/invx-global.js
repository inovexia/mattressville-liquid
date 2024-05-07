/**
 * COOKIE FUNCTIONS
 */
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  let expires = '';
  if (exdays > 0) {
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      expires = "expires="+d.toUTCString();
  } else {
    expires = "expires=0";
  }
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

var bar = document.getElementById('invx-announcement-bar');
var dismiss = document.getElementById('invx-announcement-bar-dismiss');
dismiss.addEventListener('click', function () {
    bar.style.display = 'none';
    setCookie('invx_dismiss_annc', '1', '');
});
