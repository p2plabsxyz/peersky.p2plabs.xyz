// The background behind install/, blog/, news/, peerchat/ and press/: a grid
// of birds in six colours, drifting on a loop. A page puts
// <div class="logo-field" aria-hidden="true"></div> first in its body and this
// script last. The colours repeat every six birds along a row and down a
// column, so moving the grid by six birds both ways brings back the same
// picture, and the loop has no seam.
(function () {
  const field = document.querySelector('.logo-field')
  if (!field) return
  const logo = new URL('../images/logo.png', document.currentScript.src).href
  const COLOURS = 6

  function build () {
    const size = parseFloat(getComputedStyle(field).getPropertyValue('--bird')) || 96
    const columns = Math.ceil(window.innerWidth / size) + COLOURS + 1
    const rows = Math.ceil(window.innerHeight / size) + COLOURS + 1
    const grid = document.createElement('div')
    grid.className = 'logo-grid'
    grid.style.gridTemplateColumns = `repeat(${columns}, ${size}px)`
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const bird = document.createElement('img')
        bird.src = logo
        bird.alt = ''
        bird.className = `bird bird-${(row + column) % COLOURS}`
        bird.style.animationDelay = `${-((row * 7 + column * 3) % 10) * 0.4}s`
        grid.appendChild(bird)
      }
    }
    field.replaceChildren(grid)
  }

  build()
  let resizing = null
  window.addEventListener('resize', () => {
    clearTimeout(resizing)
    resizing = setTimeout(build, 200)
  })
})()
