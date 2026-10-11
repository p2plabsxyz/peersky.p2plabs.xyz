// The two steps for joining a PeerChat room: get PeerSky, then scan or open
// the room's link. The home page shows it for P2P Republic, and /peerchat/
// makes it for any room. A page puts <peerchat-invite room="<key>" name="...">
// where it goes and loads lib/toqr/toqr.js, then this script.
//
// Nothing leaves the page: the QR code is drawn here from the link, and a room
// link only ever sits after the # of an address, which browsers never send to
// a server.
//
// It renders without a shadow root so the page's styles apply. Links are built
// from this script's own address, so the same markup works from any folder and
// from a page opened straight from disk.
(function () {
  const ROOM_KEY_RE = /^[a-f0-9]{64}$/i
  const site = new URL('..', document.currentScript.src)

  // The same rules as the apps: a plain room key, or a link with room= after
  // its # or ?.
  function parseRoomKey (input) {
    const value = String(input || '').trim()
    if (ROOM_KEY_RE.test(value)) return value.toLowerCase()
    const tail = (value.match(/[#?]([^#?]*)$/) || [])[1]
    if (!tail) return ''
    try {
      const key = new URLSearchParams(tail).get('room') || ''
      return ROOM_KEY_RE.test(key) ? key.toLowerCase() : ''
    } catch {
      return ''
    }
  }

  function roomLink (key) {
    return `peersky://p2p/peerchat/#room=${key}`
  }

  // One path for the dark modules, a row of neighbours at a time, inside the
  // four-module quiet zone scanners need.
  function qrSvg (text) {
    const cells = self.toQR(text)
    const n = Math.round(Math.sqrt(cells.length))
    const quiet = 4
    let d = ''
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (!(cells[y * n + x] & 1)) continue
        let run = 1
        while (x + run < n && (cells[y * n + x + run] & 1)) run++
        d += `M${x + quiet} ${y + quiet}h${run}v1h-${run}z`
        x += run - 1
      }
    }
    const size = n + quiet * 2
    return `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#111827"/></svg>`
  }

  async function copyText (text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // A page opened from disk, or a browser without the clipboard API.
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.append(area)
      area.select()
      const done = document.execCommand('copy')
      area.remove()
      return done
    }
  }

  // A copy button says so for a moment once it has copied.
  function wireCopy (button, text) {
    button.addEventListener('click', async () => {
      const label = button.textContent
      button.textContent = await copyText(text) ? 'Copied' : 'Copy failed'
      setTimeout(() => { button.textContent = label }, 1800)
    })
  }

  class PeerChatInvite extends HTMLElement {
    static get observedAttributes () {
      return ['room', 'name']
    }

    connectedCallback () {
      this.render()
    }

    attributeChangedCallback () {
      if (this.isConnected) this.render()
    }

    render () {
      const key = parseRoomKey(this.getAttribute('room'))
      const name = (this.getAttribute('name') || '').trim().slice(0, 60)
      const link = key ? roomLink(key) : ''
      const desktop = new URL('./#downloads', site).href
      const mobile = new URL('./mobile/', site).href

      this.innerHTML = `
        <div class="invite-steps">
          <section class="invite-step">
            <p class="invite-step-label">Step 1</p>
            <h3>Get PeerSky</h3>
            <p class="invite-step-text">PeerChat is built into PeerSky, on your computer and on your phone.</p>
            <img class="invite-logo" src="${new URL('./images/logo.png', site).href}" width="480" height="480" alt="" />
            <div class="invite-buttons">
              <a class="invite-button" href="${desktop}">macOS, Windows and Linux</a>
              <a class="invite-button" href="${mobile}">iPhone and Android</a>
            </div>
          </section>
          <section class="invite-step">
            <p class="invite-step-label">Step 2</p>
            <h3 class="invite-room-title"></h3>
            <p class="invite-step-text">On your phone, tap Join group in PeerChat and scan this code. On a computer, open the link in PeerSky.</p>
            ${key
              ? `<div class="invite-qr" role="img" aria-label="QR code for the room link">${qrSvg(link)}</div>
                 <div class="invite-link">
                   <code title="${link}">${link}</code>
                   <button type="button" class="invite-copy">Copy</button>
                 </div>
                 <a class="invite-open" href="${link}">Open in PeerSky</a>`
              : '<p class="invite-missing">Add a room link to make its code.</p>'}
          </section>
        </div>`

      this.querySelector('.invite-room-title').textContent = name ? `Join ${name}` : 'Join the room'
      const copy = this.querySelector('.invite-copy')
      if (copy) wireCopy(copy, link)
      // From the home page, the desktop button only has to scroll to the
      // downloads below, with the popup out of the way.
      for (const button of this.querySelectorAll('.invite-button')) {
        button.addEventListener('click', () => {
          const target = new URL(button.href)
          if (target.pathname === location.pathname) this.closest('dialog')?.close()
        })
      }
    }
  }

  customElements.define('peerchat-invite', PeerChatInvite)
  self.PeerChatInvite = { parseRoomKey, roomLink, copyText }
})()
