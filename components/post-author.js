// Who wrote a blog post, under its last paragraph. A post puts
// <post-author name="akhilesh"></post-author> there and loads this script, so
// an author's name and link are kept here, once, for every post.
//
// It renders without a shadow root so the post's own link styles apply.
const AUTHORS = {
  akhilesh: { name: 'Akhilesh Thite', url: 'https://akhilesh.art/' }
}

class PostAuthor extends HTMLElement {
  connectedCallback () {
    if (this.dataset.rendered) return
    const author = AUTHORS[this.getAttribute('name')]
    if (!author) return
    this.dataset.rendered = 'true'
    const line = document.createElement('p')
    line.className = 'post-author'
    line.append('Written by ')
    const link = document.createElement('a')
    link.href = author.url
    // It opens in a new tab that cannot reach back into this one.
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = author.name
    line.append(link)
    this.replaceChildren(line)
  }
}

customElements.define('post-author', PostAuthor)
