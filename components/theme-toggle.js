// The light and dark switch at the top of every page. Each page's <head> picks
// the theme before anything is drawn: the one chosen here last time, or the
// system's. This draws the button, remembers a choice, and follows the system
// until there is one.
const KEY = 'theme'
const root = document.documentElement
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

const MOON = '<svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
const SUN = '<svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'

function savedTheme () {
  try {
    const theme = localStorage.getItem(KEY)
    return theme === 'dark' || theme === 'light' ? theme : null
  } catch {
    return null
  }
}

function apply (theme) {
  root.dataset.theme = theme
  const label = theme === 'dark' ? 'Use the light theme' : 'Use the dark theme'
  for (const button of document.querySelectorAll('.theme-toggle')) {
    button.setAttribute('aria-label', label)
    button.title = label
  }
}

darkQuery.addEventListener('change', (event) => {
  if (!savedTheme()) apply(event.matches ? 'dark' : 'light')
})

class ThemeToggle extends HTMLElement {
  connectedCallback () {
    if (this.querySelector('.theme-toggle')) return
    const button = document.createElement('button')
    button.className = 'theme-toggle'
    button.type = 'button'
    button.innerHTML = MOON + SUN
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(KEY, next) } catch {}
      apply(next)
    })
    this.append(button)
    apply(root.dataset.theme === 'dark' ? 'dark' : 'light')
  }
}

customElements.define('theme-toggle', ThemeToggle)
