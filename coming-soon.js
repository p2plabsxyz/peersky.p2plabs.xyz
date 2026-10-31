// The App Store link is not live yet. Until it is, a link marked
// data-coming-soon says so instead of opening its placeholder, in its own
// words when the attribute has some. Drop the attribute once a real link is in
// place.
(function () {
  const message = "PeerSky for iPhone has been in review with Apple since early October. We'll announce it when it's out, and it will show up here too."
  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-coming-soon]')
    if (!link) return
    event.preventDefault()
    window.alert(link.dataset.comingSoon || message)
  })
})()
