function scrollTo (element, updateDrawerState = false) {
  if (!element) return

  if (updateDrawerState) {
    const hamburger = document.querySelector('.hamburger')
    hamburger.classList.toggle('close')
    updateDrawerState(false)
  }

  window.scroll({ top: element.offsetTop, behavior: 'smooth' })
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

export { scrollTo, getCookie, setCookie }
