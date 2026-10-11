// The light and dark switch at the top of every page. The site starts light;
// each page's <head> puts the dark theme on before anything is drawn when it
// was picked here before. This draws the button and remembers the choice.
const KEY = 'theme'
const root = document.documentElement

const MOON = '<svg class="icon-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
const SUN = '<svg class="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'

function apply (theme) {
  root.dataset.theme = theme
  const label = theme === 'dark' ? 'Use the light theme' : 'Use the dark theme'
  for (const button of document.querySelectorAll('.theme-toggle')) {
    button.setAttribute('aria-label', label)
    button.title = label
  }
}

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
