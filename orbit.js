// The orbit on the home page: phones from PeerSky's apps on a tilted ring
// around the bird, joined by dotted lines with messages moving along them.
// Hover, focus or tap a phone for a short story about what it shows. Drag
// sideways to spin the ring.
(function () {
  'use strict'

  const stage = document.getElementById('orbit')
  if (!stage) return

  // The phone shots sit beside this script, so a page in a sub-folder, such
  // as /mobile/, finds them too. currentScript is only set while it runs.
  const scriptUrl = document.currentScript && document.currentScript.src
  const phoneShot = (file) => (scriptUrl ? new URL(`images/phones/${file}`, scriptUrl).href : `images/phones/${file}`)

  // tall: the Android frames are a little taller than the iPhone ones.
  const STORIES = [
    {
      img: 'peerchat',
      label: 'PeerChat',
      tag: 'peersky://p2p/peerchat/',
      title: 'Chat with no server in between',
      text: "Alice makes a room called Yosemite Weekend and sends Bob the link. He taps it and he's in. Her photo of Granite Lake goes from her phone straight to his. There is no account, and no server keeps a copy."
    },
    {
      img: 'peertunes',
      tall: true,
      label: 'PeerTunes',
      tag: 'peersky://p2p/peertunes/',
      title: 'Music from a friend, not a service',
      text: 'Carol publishes her road trip playlist from PeerSky on her laptop and sends Bob the link. He opens it in PeerTunes on his phone, and the songs come straight from her drive.'
    },
    {
      img: 'p2pmd',
      label: 'P2PMD',
      tag: 'peersky://p2p/p2pmd/',
      title: 'One note, written together',
      text: 'Bob starts a note for the trip and shares its key. Alice joins from her phone and they type at the same time. She adds the wilderness permit, he adds the bear canisters. The note lives on their devices, not on a server.'
    },
    {
      img: 'trackers',
      tall: true,
      label: 'No trackers',
      tag: 'Desktop and mobile',
      title: 'Trackers blocked everywhere',
      text: 'Eve runs an ad network that follows people from site to site. In PeerSky her trackers are blocked on every page. The block lists come with the app, so it works from the first launch, even offline.'
    },
    {
      img: 'hyperdrive',
      label: 'Hyperdrive',
      tag: 'peersky://p2p/hyperdrive/',
      title: 'Send files directly',
      text: "Alice drops Granite Lake.jpg into Hyperdrive and gets a hyper:// link. She pastes it in PeerChat, Bob taps it, and the photo comes straight from her phone. He taps Keep offline, so it still opens on the trail. Her own notes go in her private drive, encrypted so only her devices can open them."
    },
    {
      img: 'youtube',
      tall: true,
      label: 'No ads',
      tag: 'Desktop and mobile',
      title: 'Videos without the ads',
      text: 'Dave opens a music video before the drive. It starts right away, with no ads in front of it, and the rest of the web loads lighter too.'
    },
    {
      img: 'offline',
      label: 'Offline',
      tag: 'hyperdht mDNS',
      title: 'Works with the internet down',
      text: "The campsite has Wi-Fi but no internet. Alice's and Bob's phones find each other on the local network anyway. Messages, notes and photos keep moving between them, because there was never a server to reach."
    },
    {
      img: 'settings',
      tall: true,
      label: 'No account',
      tag: 'Desktop and mobile',
      title: 'Nothing to sign up for',
      text: "There is no account, and nothing about Alice is collected. Settings lists what each app keeps on her phone, so she can see it and remove it."
    },
    {
      img: 'widgets',
      label: 'Widgets',
      tag: 'iPhone',
      title: 'Right on the home screen',
      text: 'Bob adds the PeerSky widgets to his home screen. One tap searches, opens PeerChat, or plays the trip playlist.'
    },
    {
      img: 'home',
      tall: true,
      label: 'Your node',
      tag: 'Mobile',
      title: 'Your phone is a node',
      text: "Bob's phone browses the web like any other. It is also a node, so pages, files and chats travel straight from it to Alice's laptop, with no company's server in the middle."
    },
    {
      img: 'dark',
      label: 'Dark mode',
      tag: 'Mobile',
      title: 'Dark mode on every site',
      text: 'Carol reads a bird guide in her tent at night. The site never made a dark theme, so PeerSky makes one for it.'
    },
    {
      img: 'p2pmd-dark',
      label: 'Who wrote what',
      tag: 'peersky://p2p/p2pmd/',
      title: 'Every line shows its writer',
      text: 'Late at night Bob adds "Camera and batteries" to the packing list. His line number turns his color, so Alice can see who added what.'
    }
  ]

  const SVG_NS = 'http://www.w3.org/2000/svg'
  const BASE_SPEED = (Math.PI * 2) / 80 // one lap in 80 seconds
  const PHONE_RATIO = 2.05 // height over width, across the iPhone and Android frames
  const BACK_SCALE = 0.55 // a phone's size at the back of the ring
  const SIDE_SCALE = 0.775 // and at either end
  const LIFT = 0.32 // how much bigger a phone grows when it is opened
  const EASE = 9 // how quickly growing, shrinking and dimming settle
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const nodesLayer = stage.querySelector('.orbit-nodes')
  const svg = stage.querySelector('.orbit-lines')
  const bird = stage.querySelector('.stage-bird')
  const card = document.getElementById('story-card')
  const cardTag = card.querySelector('.story-tag')
  const cardTitle = card.querySelector('#story-title')
  const cardText = card.querySelector('.story-text')
  const cardClose = card.querySelector('.story-close')

  const ring = document.createElementNS(SVG_NS, 'ellipse')
  ring.setAttribute('class', 'ring')
  svg.appendChild(ring)

  const nodes = STORIES.map((story, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'orbit-node'
    button.setAttribute('aria-label', `${story.label}: ${story.title}`)
    button.setAttribute('aria-controls', 'story-card')
    button.setAttribute('aria-expanded', 'false')

    const picture = document.createElement('picture')
    const source = document.createElement('source')
    source.type = 'image/avif'
    source.srcset = phoneShot(`${story.img}.avif`)
    const img = document.createElement('img')
    img.alt = ''
    img.width = 400
    img.height = story.tall ? 838 : 803
    img.decoding = 'async'
    img.draggable = false
    // Fade in once decoded, rather than popping in mid-orbit.
    const ready = () => button.classList.add('ready')
    img.addEventListener('load', ready, { once: true })
    img.addEventListener('error', ready, { once: true })
    picture.append(source, img)
    // Only once it sits behind the AVIF source, so no browser fetches the PNG too.
    img.src = phoneShot(`${story.img}.png`)

    const label = document.createElement('span')
    label.className = 'orbit-label'
    label.setAttribute('aria-hidden', 'true')
    label.textContent = story.label

    button.append(picture, label)
    nodesLayer.appendChild(button)
    return { el: button, story, offset: (index / STORIES.length) * Math.PI * 2, x: 0, y: 0, phi: 0, scale: 1, lift: 0 }
  })

  // Each phone is linked to the one three along, so the lines cross the ring
  // like a mesh. Messages also travel the ring itself, between neighbours.
  const chords = []
  for (let i = 0; i < nodes.length; i += 2) {
    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('class', 'chord')
    svg.insertBefore(line, ring)
    chords.push({ a: i, b: (i + 3) % nodes.length, el: line })
  }

  let geo = null
  let phase = Math.PI / 2 // PeerChat starts at the front
  let speed = BASE_SPEED
  let targetSpeed = BASE_SPEED
  let spin = 0
  let drag = null
  let suppressClickUntil = 0
  let active = null
  let pinned = false
  let closeTimer = 0
  let hideTimer = 0
  let raf = 0
  let last = 0
  let onScreen = true
  let focus = 0 // eases to 1 while any phone is open
  const packets = []
  let spawnIn = 0.5

  function narrow () {
    return window.innerWidth < 640
  }

  // The ring fills the text column: a phone at either end of it sits flush
  // with the column's edges, so the orbit lines up with the page below.
  function measure () {
    const width = stage.clientWidth
    // Not laid out yet, as in a hidden tab: keep the last ring until it is.
    if (width < 160) return false
    const nodeW = Math.round(Math.max(52, Math.min(92, width * 0.14)))
    const rx = width / 2 - (nodeW * SIDE_SCALE) / 2
    const ry = rx * (width < 480 ? 0.74 : 0.56)
    const backH = nodeW * PHONE_RATIO * BACK_SCALE
    const frontH = nodeW * PHONE_RATIO
    const cy = 14 + backH / 2 + ry
    // Room below for a front phone at its opened size, and its label.
    const height = Math.round(cy + ry + (frontH * (1 + LIFT)) / 2 + 26)
    stage.style.height = `${height}px`
    bird.style.width = `${Math.round(Math.max(96, Math.min(150, width * 0.25)))}px`
    bird.style.top = `${cy.toFixed(1)}px`
    // The card may use the page's margins beside the column, not just the column.
    const stageBox = stage.getBoundingClientRect()
    const heroBox = stage.closest('.hero').getBoundingClientRect()
    geo = {
      width,
      height,
      cx: width / 2,
      cy,
      rx,
      ry,
      nodeW,
      cardMin: heroBox.left - stageBox.left + 12,
      cardMax: heroBox.right - stageBox.left - 12
    }
    stage.style.setProperty('--node-w', `${nodeW}px`)
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    ring.setAttribute('cx', geo.cx)
    ring.setAttribute('cy', geo.cy.toFixed(1))
    ring.setAttribute('rx', geo.rx.toFixed(1))
    ring.setAttribute('ry', geo.ry.toFixed(1))
    return true
  }

  function place (node) {
    const phi = node.offset + phase
    const s = Math.sin(phi)
    const depth = (s + 1) / 2 // 0 at the back of the ring, 1 at the front
    // lift eases from 0 to 1 while a phone is open, so it grows smoothly.
    const scale = (BACK_SCALE + (1 - BACK_SCALE) * depth) * (1 + LIFT * node.lift)
    node.phi = phi
    node.scale = scale
    node.x = geo.cx + geo.rx * Math.cos(phi)
    node.y = geo.cy + geo.ry * s
    const el = node.el
    el.style.transform = `translate3d(${node.x.toFixed(1)}px, ${node.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
    // Behind the bird at the back, in front of it at the front, and on top of
    // everything while open.
    el.style.zIndex = node.lift > 0.02 ? '35' : String(depth > 0.5 ? 20 + Math.round(depth * 10) : 1 + Math.round(depth * 10))
    // Farther phones are fainter. While one is open the rest dim, so it stands out.
    let opacity = 0.5 + 0.5 * depth
    opacity += (1 - opacity) * node.lift
    opacity *= 1 - 0.45 * focus * (1 - node.lift)
    el.style.opacity = opacity.toFixed(3)
    el.style.setProperty('--label-opacity', Math.max(node.lift, depth * 1.6 - 0.6).toFixed(2))
  }

  function draw () {
    if (!geo) return
    for (const node of nodes) place(node)
    for (const chord of chords) {
      const a = nodes[chord.a]
      const b = nodes[chord.b]
      chord.el.setAttribute('x1', a.x.toFixed(1))
      chord.el.setAttribute('y1', a.y.toFixed(1))
      chord.el.setAttribute('x2', b.x.toFixed(1))
      chord.el.setAttribute('y2', b.y.toFixed(1))
    }
    if (active && !narrow()) positionCard(active)
  }

  // Messages: small dots that run along a link, mostly from the open phone.
  function spawnPacket () {
    if (packets.length >= 5) return
    let a, b, along
    const linked = active ? chords.filter((c) => nodes[c.a] === active || nodes[c.b] === active) : []
    if (active && Math.random() < 0.7) {
      const i = nodes.indexOf(active)
      if (Math.random() < 0.5 && linked.length) {
        const c = linked[Math.floor(Math.random() * linked.length)]
        a = i
        b = c.a === i ? c.b : c.a
        along = 'line'
      } else {
        a = i
        b = (i + (Math.random() < 0.5 ? 1 : nodes.length - 1)) % nodes.length
        along = 'ring'
      }
    } else if (Math.random() < 0.6) {
      a = Math.floor(Math.random() * nodes.length)
      b = (a + (Math.random() < 0.5 ? 1 : nodes.length - 1)) % nodes.length
      along = 'ring'
    } else {
      const c = chords[Math.floor(Math.random() * chords.length)]
      ;[a, b] = Math.random() < 0.5 ? [c.a, c.b] : [c.b, c.a]
      along = 'line'
    }
    const el = document.createElementNS(SVG_NS, 'circle')
    el.setAttribute('class', 'packet')
    el.setAttribute('r', narrow() ? '3' : '3.6')
    el.setAttribute('opacity', '0')
    svg.appendChild(el)
    packets.push({ el, a, b, along, t: 0, duration: 1.3 + Math.random() * 0.9 })
  }

  function movePackets (dt) {
    spawnIn -= dt
    if (spawnIn <= 0) {
      spawnPacket()
      spawnIn = 0.45 + Math.random() * 0.6
    }
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i]
      p.t += dt / p.duration
      if (p.t >= 1) {
        p.el.remove()
        packets.splice(i, 1)
        continue
      }
      const e = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2
      const from = nodes[p.a]
      const to = nodes[p.b]
      let x, y
      if (p.along === 'ring') {
        let d = to.phi - from.phi
        d = Math.atan2(Math.sin(d), Math.cos(d))
        const phi = from.phi + d * e
        x = geo.cx + geo.rx * Math.cos(phi)
        y = geo.cy + geo.ry * Math.sin(phi)
      } else {
        x = from.x + (to.x - from.x) * e
        y = from.y + (to.y - from.y) * e
      }
      p.el.setAttribute('cx', x.toFixed(1))
      p.el.setAttribute('cy', y.toFixed(1))
      p.el.setAttribute('opacity', Math.min(1, p.t * 6, (1 - p.t) * 6).toFixed(2))
    }
  }

  function clearPackets () {
    for (const p of packets) p.el.remove()
    packets.length = 0
  }

  function tick (now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!geo) {
      raf = requestAnimationFrame(tick)
      return
    }
    const settle = reduceMotion.matches ? 1 : 1 - Math.exp(-dt * EASE)
    for (const node of nodes) node.lift += ((node === active ? 1 : 0) - node.lift) * settle
    focus += ((active ? 1 : 0) - focus) * settle
    if (reduceMotion.matches) {
      speed = 0
      spin = 0
      if (packets.length) clearPackets()
    } else {
      speed += (targetSpeed - speed) * Math.min(1, dt * 5)
      if (!drag || !drag.moved) {
        phase += (speed + spin) * dt
        spin *= Math.exp(-dt * 2.2)
      }
      movePackets(dt)
    }
    draw()
    raf = requestAnimationFrame(tick)
  }

  function start () {
    if (raf) return
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  function stop () {
    cancelAnimationFrame(raf)
    raf = 0
  }

  // ---------- Story card ----------

  function positionCard (node) {
    const cardW = card.offsetWidth
    const cardH = card.offsetHeight
    const half = (geo.nodeW * node.scale) / 2
    // Away from the bird when there is room, toward it when there is not.
    const outward = node.x < geo.cx ? node.x - half - 18 - cardW : node.x + half + 18
    const inward = node.x < geo.cx ? node.x + half + 18 : node.x - half - 18 - cardW
    const fits = outward >= geo.cardMin && outward + cardW <= geo.cardMax
    let left = fits ? outward : inward
    left = Math.max(geo.cardMin, Math.min(left, geo.cardMax - cardW))
    const top = Math.max(8, Math.min(node.y - cardH / 2, geo.height - cardH - 8))
    card.style.left = `${left.toFixed(0)}px`
    card.style.top = `${top.toFixed(0)}px`
  }

  function lightChords (node) {
    for (const chord of chords) {
      chord.el.classList.toggle('lit', !!node && (nodes[chord.a] === node || nodes[chord.b] === node))
    }
  }

  function open (node, pin) {
    clearTimeout(closeTimer)
    clearTimeout(hideTimer)
    if (active && active !== node) {
      active.el.classList.remove('active')
      active.el.setAttribute('aria-expanded', 'false')
    }
    pinned = pin || (pinned && active === node)
    active = node
    node.el.classList.add('active')
    node.el.setAttribute('aria-expanded', 'true')
    cardTag.textContent = node.story.tag
    cardTitle.textContent = node.story.title
    cardText.textContent = node.story.text
    card.hidden = false
    targetSpeed = 0
    spin = 0
    lightChords(node)
    draw()
    requestAnimationFrame(() => card.classList.add('open'))
  }

  function close () {
    clearTimeout(closeTimer)
    card.classList.remove('open')
    if (active) {
      active.el.classList.remove('active')
      active.el.setAttribute('aria-expanded', 'false')
    }
    active = null
    pinned = false
    targetSpeed = BASE_SPEED
    lightChords(null)
    draw()
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      if (!active) card.hidden = true
    }, 180)
  }

  function closeSoon () {
    if (pinned) return
    clearTimeout(closeTimer)
    closeTimer = setTimeout(close, 220)
  }

  for (const node of nodes) {
    node.el.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && !(drag && drag.moved) && !pinned) open(node, false)
    })
    node.el.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') closeSoon()
    })
    node.el.addEventListener('focus', () => {
      if (!pinned && node.el.matches(':focus-visible')) open(node, false)
    })
    node.el.addEventListener('blur', () => {
      if (!pinned) closeSoon()
    })
    node.el.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return
      if (active === node && pinned) {
        close()
        return
      }
      open(node, true)
    })
  }

  card.addEventListener('pointerenter', () => clearTimeout(closeTimer))
  card.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') closeSoon()
  })
  cardClose.addEventListener('click', () => {
    const node = active
    close()
    if (node) node.el.focus({ preventScroll: true })
  })
  document.addEventListener('pointerdown', (event) => {
    if (!active || card.contains(event.target) || event.target.closest('.orbit-node')) return
    close()
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !active) return
    const node = active
    close()
    node.el.focus({ preventScroll: true })
  })

  // ---------- Drag to spin ----------

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || card.contains(event.target) || event.target.closest('.stage-bird')) return
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, phase, moved: false, lastX: event.clientX, lastT: event.timeStamp, velocity: 0 }
  })

  window.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return
    const dx = event.clientX - drag.x
    if (!drag.moved) {
      if (Math.abs(dx) < 8) return
      // A mostly vertical move is the page scrolling, not a spin.
      if (Math.abs(event.clientY - drag.y) > Math.abs(dx)) {
        drag = null
        return
      }
      drag.moved = true
      drag.phase = phase
      drag.x = event.clientX
      stage.classList.add('dragging')
      if (active) close()
    }
    phase = drag.phase - (event.clientX - drag.x) / geo.rx
    const dt = Math.max(8, event.timeStamp - drag.lastT) / 1000
    drag.velocity = -(event.clientX - drag.lastX) / geo.rx / dt
    drag.lastX = event.clientX
    drag.lastT = event.timeStamp
  })

  function endDrag (event) {
    if (!drag || event.pointerId !== drag.id) return
    if (drag.moved) {
      spin = Math.max(-4, Math.min(4, drag.velocity))
      suppressClickUntil = performance.now() + 300
      stage.classList.remove('dragging')
    }
    drag = null
  }

  window.addEventListener('pointerup', endDrag)
  window.addEventListener('pointercancel', endDrag)

  // ---------- Start ----------

  // The column's width decides the ring, so follow the column rather than the
  // window: it also catches a page that was laid out after this ran.
  const remeasure = () => {
    if (measure()) draw()
  }
  if ('ResizeObserver' in window) {
    // A frame later, since measure() sets the stage's height, and changing a
    // watched size inside the callback would loop.
    new ResizeObserver(() => requestAnimationFrame(remeasure)).observe(stage.parentElement)
  } else {
    let resizeTimer = 0
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(remeasure, 80)
    })
  }

  remeasure()

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      onScreen = entries[0].isIntersecting
      if (onScreen && !document.hidden) start()
      else stop()
    }).observe(stage)
  } else {
    start()
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (onScreen) start()
  })
})()
