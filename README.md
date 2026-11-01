# Why We Buy

An interactive scrollytelling website built from the thesis
**"Why We Buy Products: Advertisement and Consumerism During the Roaring Twenties"**
by Ruike (Vincent) Liu (AP United States History, April 2026).

It traces how 1920s advertisers moved from selling what a product *does* to
selling who the buyer might *become*.

## Built with

- Hand-written HTML and CSS, no framework
- A small dependency-free script (`assets/main.js`) for the pinned
  "thrift → desire" flip, number count-ups, the ledger bars and the reading
  progress line
- Typography: EB Garamond for text, Playfair Display for headlines (Google Fonts)
- Responsive, respects `prefers-reduced-motion`, and reads fully without
  JavaScript

The design was cleaned up with the
[unslop](https://github.com/heydamir/unslop) skill by Damir Sokolovsky.

## Run locally

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

The period advertisements are reset in type rather than reproduced, and every
quotation comes from the sources in the on-page bibliography.
