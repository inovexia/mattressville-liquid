let isMenuOpen = false, mq

document.querySelector('.menu-toggle').addEventListener('click', () => {
  if (!isMenuOpen) {
    openMenu()
  } else {
    closeMenu()
  }
})

if (window.matchMedia) {
  mq = window.matchMedia('(min-width: 640px)')
  mq.addListener(onMediaChange)
}

function closeMenu() {
  document.querySelector('.invx-container').style.transform = 'translateX(-300px)'
  isMenuOpen = false
}

function openMenu() {
  document.querySelector('.invx-container').style.transform = 'translateX(0)'
  isMenuOpen = true
}

function onMediaChange(mq) {
  if (mq.matches) {
    document.querySelector('.invx-container').style.transform = 'translateX(0)'
  } else {
    closeMenu()
  }
}
