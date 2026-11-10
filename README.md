# peersky.p2plabs.xyz

Website for PeerSky. It's plain HTML and CSS with a few small scripts, so there's nothing to install or build.

## Start

Clone the repo:

```bash
git clone https://github.com/p2plabsxyz/peersky.p2plabs.xyz.git
```

Then run a local server from its folder:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 and reload after each change. Any static server works.

Every push to `main` goes live (see `.github/workflows/deploy-distributed-press.yaml`), so work on a branch and open a pull request to `main`.

## What's where

- `index.html` is the home page. `install/`, `mobile/`, `news/`, `press/`, `support/` and `peerchat/` are the other pages.
- `blog/` has the blog page (`blog/index.html`), the RSS feed (`blog/feed.xml`) and one folder per post.
- `components/` has the parts pages share: the footer, the theme toggle and the post author line.
- `site.css` has the site's own styles. `lib/tailwind.min.css` is Tailwind 2, so its classes work too.
- `images/` has pictures used across the site.

## Write a blog post

1. Make a folder in `blog/` named after the post, in lowercase words joined with dashes, like `blog/spare-device-private-cloud/`. The folder name becomes the post's link.
2. Copy an existing post's `index.html` into it and change:
   - the title in `<title>`, `og:title`, `twitter:title` and `<h1>`
   - the summary in `description` and `og:description`
   - the folder name in `og:url`, `og:image` and `twitter:image`
   - the date in `article:published_time` and in `<time>`, written like `datetime="2026-11-08"` with the date as people read it inside
   - the name in `<meta name="author">`
   - the banner's alt text
   - the post itself, inside `<div class="post-body">`
3. Add a card for it at the top of the list in `blog/index.html`. The newest post goes first.
4. Add an `<item>` at the top of `blog/feed.xml`. Copy the one below it and change the title, links, date, summary and banner. Feed dates look like `Sun, 08 Nov 2026 17:00:00 GMT`. Set `<lastBuildDate>` to the same date.

In a post, use `<h2>` for sections and `<p>` for text. Links to other pages on the site are relative, like `../../#downloads`.

Then open http://localhost:8080/blog/your-post/ and check it in the light and dark theme, and in a phone-sized window.

## Pictures

A post keeps its pictures in its own folder, next to its `index.html`, and links them as `./name.jpg`.

- `banner.jpg` is 1600 × 840. It shows on the blog page, at the top of the post, in link previews and in the feed.
- Other pictures are JPG, about 1600 px wide.
- Give each picture its real `width` and `height` so the page doesn't jump while it loads, `loading="lazy"` (all but the banner), and alt text that says what's in it.

```html
<figure>
  <img src="./link.jpg" width="1600" height="917" loading="lazy" alt="What the picture shows" />
  <figcaption>One short line about it.</figcaption>
</figure>
```

To see a picture's size on a Mac:

```bash
sips -g pixelWidth -g pixelHeight banner.jpg
```

Pictures used on more than one page go in `images/`.

## Author

Each post ends with who wrote it. Put this after the post's last paragraph:

```html
<post-author name="akhilesh"></post-author>
```

and load its script at the bottom of the page, with the others:

```html
<script src="../../components/post-author.js"></script>
```

It shows "Written by Akhilesh Thite" with a link to akhilesh.art. Names and links are kept in one place, `AUTHORS` in `components/post-author.js`. To add an author, add a line there:

```js
const AUTHORS = {
  akhilesh: { name: 'Akhilesh Thite', url: 'https://akhilesh.art/' },
  someone: { name: 'Their Name', url: 'https://their.site/' }
}
```

and use `<post-author name="someone"></post-author>` in their post.
