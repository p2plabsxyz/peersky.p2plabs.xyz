// The home page's App Store and Google Play badges are not live yet. Until
// they are, a badge marked data-coming-soon says so instead of opening its
// placeholder. Drop the attribute once a real link is in place.
(function () {
  const message = 'Coming soon! Join our community on Matrix, Discord or PeerChat to try PeerSky early on your phone.'
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-coming-soon]')
    if (!link) return
    event.preventDefault()
    window.alert(message)
  })
})()
