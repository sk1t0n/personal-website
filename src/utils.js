function scrollTo (element, updateDrawerState = false) {
  if (!element) return

  if (updateDrawerState) {
    const hamburger = document.querySelector('.hamburger')
    hamburger.classList.toggle('close')
    updateDrawerState(false)
  }

  window.scroll({ top: element.offsetTop, behavior: 'smooth' })
}

function changeActiveMenuDesktopItem (scrollPosition) {
  const about = document.getElementById('about')
  const work = document.getElementById('work')
  const education = document.getElementById('education')
  const contact = document.getElementById('contact')
  const menu = document.querySelector('.q-toolbar ul').childNodes
  const classActive = 'menudesktop__item--active'

  if (scrollPosition >= about.offsetTop && scrollPosition < work.offsetTop) {
    menu[0].classList.add(classActive)
  } else {
    menu[0].classList.remove(classActive)
  }

  if (scrollPosition >= work.offsetTop && scrollPosition < education.offsetTop) {
    menu[1].classList.add(classActive)
  } else {
    menu[1].classList.remove(classActive)
  }

  if (scrollPosition >= education.offsetTop && scrollPosition < contact.offsetTop) {
    menu[2].classList.add(classActive)
  } else {
    menu[2].classList.remove(classActive)
  }

  if (scrollPosition >= contact.offsetTop - education.clientHeight) {
    menu[2].classList.remove(classActive)
    menu[3].classList.add(classActive)
  } else {
    menu[3].classList.remove(classActive)
  }
}

function getCookie (key) {
  const re = new RegExp(`${key}=(\\w*);?`)
  const result = document.cookie.match(re)
  return result ? result[1] : result
}

function setCookie (key, value, days) {
  const d = new Date()
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `${key}=${value}; expires=${expires}; SameSite=Lax`
}

export { scrollTo, changeActiveMenuDesktopItem, getCookie, setCookie }
