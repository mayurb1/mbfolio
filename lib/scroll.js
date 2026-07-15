// Smoothly scroll to an element by id, accounting for the fixed header offset.
export function scrollToSection(id, offset = 80) {
  const element = document.getElementById(id)
  if (element) {
    const offsetTop = element.offsetTop - offset
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth',
    })
  }
}
