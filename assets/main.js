/* =================================================================
   WHY WE BUY — motion engine (GSAP + ScrollTrigger)
   Graceful: if GSAP fails to load, or reduced-motion is set,
   all content remains fully visible and counters show finals.
   ================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- number formatting ---------- */
  function formatNum(value, el) {
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var s = Number(value).toFixed(dec);
    if (el.hasAttribute("data-sep")) {
      var parts = s.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      s = parts.join(".");
    }
    return (el.dataset.prefix || "") + s + (el.dataset.suffix || "");
  }
  function setFinal(el) {
    el.textContent = formatNum(parseFloat(el.dataset.countTo), el);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  var promiseSection = document.querySelector(".promise");

  /* ---------- FALLBACK PATH: no GSAP, or reduced motion ---------- */
  if (!window.gsap || prefersReduce) {
    if (!window.gsap) root.classList.remove("js"); // CSS then shows reveal elements
    counters.forEach(setFinal);
    if (promiseSection) promiseSection.classList.add("no-pin");
    return;
  }

  /* ---------- FULL MOTION PATH ---------- */
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  var ScrollTrigger = window.ScrollTrigger;

  /* count-up on scroll-in */
  function animateCount(el) {
    var from = parseFloat(el.dataset.countFrom || "0");
    var to = parseFloat(el.dataset.countTo);
    if (from === to) { el.textContent = formatNum(to, el); return; }
    var obj = { v: from };
    gsap.to(obj, {
      v: to, duration: 1.8, ease: "power2.out",
      onUpdate: function () { el.textContent = formatNum(obj.v, el); }
    });
  }
  counters.forEach(function (el) {
    el.textContent = formatNum(parseFloat(el.dataset.countFrom || "0"), el);
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: function () { animateCount(el); }
    });
  });

  /* ---------- HERO intro ---------- */
  gsap.set(".hero__title .line > span", { yPercent: 118, opacity: 0 });
  var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
  heroTl
    .to(".hero__kicker", { opacity: 1, duration: 1.1 }, 0.15)
    .to(".hero__title .line > span", { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.16 }, 0.35)
    .to(".hero__subtitle", { opacity: 1, duration: 1.1 }, "-=0.85")
    .to(".hero__meta", { opacity: 1, duration: 1.1 }, "-=0.8")
    .to(".hero__scroll", { opacity: 1, duration: 1.0 }, "-=0.7");

  gsap.from(".hero__ring", { scale: 0.55, opacity: 0, duration: 2.2, ease: "expo.out" });

  /* slow rotating sunbursts */
  gsap.to(".hero__rays", { rotation: 360, duration: 140, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
  gsap.to(".legacy__rays", { rotation: -360, duration: 180, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

  /* hero parallax fade as you leave */
  gsap.to(".hero__inner", {
    yPercent: -14, opacity: 0.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero__ring", {
    scale: 1.25, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- generic reveals (exclude horizontal-track items) ---------- */
  var reveals = gsap.utils.toArray(".reveal").filter(function (el) {
    return !el.closest(".promise__track");
  });
  ScrollTrigger.batch(reveals, {
    start: "top 86%",
    onEnter: function (batch) {
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.0, stagger: 0.12, ease: "power3.out", overwrite: true });
    },
    once: true
  });
  // items inside the horizontal gallery: just make them visible (they travel sideways)
  gsap.set(gsap.utils.toArray(".promise__track .reveal"), { opacity: 1, y: 0 });

  /* ---------- scrub word reveals ---------- */
  function splitWords(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {
        var text = child.textContent;
        if (!text) return;
        var frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (part) {
          if (part.length === 0) return;
          if (/\S/.test(part)) {
            var span = document.createElement("span");
            span.className = "word";
            span.textContent = part;
            frag.appendChild(span);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== "BR") {
        splitWords(child);
      }
    });
  }
  gsap.utils.toArray("[data-scrub]").forEach(function (el) {
    splitWords(el);
    var words = el.querySelectorAll(".word");
    if (!words.length) return;
    gsap.to(words, {
      opacity: 1, ease: "none", stagger: 0.4,
      scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 58%", scrub: true }
    });
  });

  /* ---------- THE TURN — palette flip (CSS sticky + scrubbed timeline) ---------- */
  var turn = document.querySelector(".turn");
  if (turn) {
    gsap.set(".turn__center", { opacity: 0, y: 36 });
    gsap.set(".turn__word--gold", { opacity: 0, scale: 1.12 });
    var turnTl = gsap.timeline({
      scrollTrigger: { trigger: turn, start: "top top", end: "bottom bottom", scrub: 1 }
    });
    turnTl
      .to(".turn__layer--noir", { clipPath: "inset(0 0 0% 0)", ease: "none", duration: 1.0 })
      .to(".turn__layer--paper .turn__word", { opacity: 0, duration: 0.4 }, 0.1)
      .to(".turn__word--gold", { opacity: 0.18, scale: 1, duration: 0.6 }, 0.25)
      .to(".turn__center", { opacity: 1, y: 0, duration: 0.7 }, 0.45);
  }

  /* ---------- THE PROMISE — horizontal pinned scroll ---------- */
  var track = document.querySelector(".promise__track");
  var trackWrap = document.querySelector(".promise__track-wrap");
  if (track && trackWrap) {
    var distance = function () {
      return Math.max(0, track.scrollWidth - window.innerWidth + 24);
    };
    gsap.to(track, {
      x: function () { return -distance(); },
      ease: "none",
      scrollTrigger: {
        trigger: trackWrap,
        start: "top top",
        end: function () { return "+=" + distance(); },
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  }

  /* ---------- LEDGER bars ---------- */
  gsap.utils.toArray(".bar").forEach(function (bar) {
    var grow = parseFloat(bar.dataset.grow || "0");
    var fill = bar.querySelector(".bar__fill");
    if (!fill) return;
    ScrollTrigger.create({
      trigger: bar, start: "top 84%", once: true,
      onEnter: function () {
        gsap.to(fill, { right: (100 - Math.min(grow, 100)) + "%", duration: 1.6, ease: "power3.out" });
      }
    });
  });

  /* ---------- brand marquee ---------- */
  var mq = document.querySelector(".marquee__track");
  if (mq) gsap.to(mq, { xPercent: -50, duration: 32, ease: "none", repeat: -1 });

  /* ---------- nav stuck + reading spine ---------- */
  var nav = document.querySelector(".nav");
  var fill = document.querySelector(".spine__fill");
  var ticking = false;
  function onScroll() {
    var max = root.scrollHeight - root.clientHeight;
    var y = window.scrollY || root.scrollTop;
    var p = max > 0 ? y / max : 0;
    if (fill) fill.style.height = (p * 100).toFixed(2) + "%";
    if (nav) nav.classList.toggle("is-stuck", y > 80);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- recompute after fonts/load ---------- */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  // Settle passes: the horizontal pin inserts a tall spacer that shifts every
  // later trigger; force clean recomputes once layout + fonts are final.
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
    setTimeout(function () { ScrollTrigger.refresh(); }, 450);
  });
})();
