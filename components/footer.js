// The footer every page shares. A page puts <peersky-footer></peersky-footer>
// where the footer goes and loads this script. Every link is absolute, so the
// same markup works from any folder (/, /mobile/, a future /blog/) and from a
// page opened straight from disk.
//
// It renders without a shadow root so the page's Tailwind classes apply.
// Mastodon's rel="me" check does not run scripts, so a page that needs the
// verification keeps its own static rel="me" link, like the badge on the home page.
class PeerskyFooter extends HTMLElement {
  connectedCallback () {
    if (this.dataset.rendered) return
    this.dataset.rendered = 'true'
    const link = 'underline hover:text-gray-800 hover:no-underline'
    // External links open in a new tab that cannot reach back into this one.
    const out = 'target="_blank" rel="noopener noreferrer"'
    this.innerHTML = `
      <footer class="text-center text-sm mt-8 mb-8">
        <a class="${link}" href="https://github.com/p2plabsxyz/peersky-browser/" ${out}>Desktop source</a>
        <a class="${link}" href="https://github.com/p2plabsxyz/peersky-mobile/" ${out}>Mobile source</a>
        <a class="${link}" href="https://mastodon.social/@peersky" target="_blank" rel="me noopener noreferrer">Mastodon</a>
        <a class="${link}" href="https://bsky.app/profile/peersky.mastodon.social.ap.brid.gy" ${out}>Bluesky</a>
        <a class="${link}" href="https://twitter.com/PeerskyBrowser" ${out}><del>X/Twitter</del></a>
        <a class="${link}" href="mailto:peersky@p2plabs.xyz">Email</a>
        <br />
        Made with 💙 by
        <a class="${link}" href="https://p2plabs.xyz/" ${out}>p2plabs.xyz</a><br />
        <a class="${link}" href="ipns://peersky.p2plabs.xyz" ${out}>ipns://</a>
        <a class="${link}" href="hyper://peersky.p2plabs.xyz" ${out}>hyper://</a>
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 10px; padding: 8px;">
          <div>Powered by</div>
          <a href="https://distributed.press/" ${out}>
            <img alt="Distributed Press" src="https://distributed.press/img/logos/logo-distributedpress-grey.svg"
              width="123" style="width: 123px; height: auto; margin-top: 6px; display: block;" />
          </a>
          <p style="font-size: 14px; margin-top: 6px;">
            <a href="https://reader.distributed.press/" ${out} style="text-decoration: underline; color: inherit;">Follow on ActivityPub</a> |
            <a href="https://docs.distributed.press/" ${out} style="text-decoration: underline; color: inherit;">Learn More</a>
          </p>
        </div>
      </footer>`
  }
}

customElements.define('peersky-footer', PeerskyFooter)
