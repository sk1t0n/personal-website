export default function scrollTo (element, updateDrawerState = false) {
  if (!element) return

  if (updateDrawerState) {
    const hamburger = document.querySelector('.hamburger')
    hamburger.classList.toggle('close')
    updateDrawerState(false)
  }

  window.scroll({ top: element.scrollHeight, behavior: 'smooth' })
}
