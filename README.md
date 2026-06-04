# Why We Buy

An interactive, Art Deco scrollytelling website built from the thesis
**"Why We Buy Products: Advertisement and Consumerism During the Roaring Twenties"**
by Ruike (Vincent) Liu (AP United States History, April 2026).

It traces how 1920s advertisers abandoned the language of utility for the
psychology of identity — selling who you might *become* instead of what a
product *does* — and, in doing so, helped invent modern consumerism.

## Built with

- Hand-written HTML / CSS (no framework)
- [GSAP](https://gsap.com/) + ScrollTrigger for motion (scrubbed text reveals,
  a pinned "thrift → desire" palette flip, a horizontal gallery, animated
  counters and data bars)
- Typography: Playfair Display, Poiret One, EB Garamond (Google Fonts)
- Fully responsive; respects `prefers-reduced-motion`; degrades gracefully
  without JavaScript.

## Run locally

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

All advertisements are recreated typographically; every quotation is drawn
from the sources in the on-page bibliography.
