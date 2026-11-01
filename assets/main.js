/* =================================================================
   WHY WE BUY: motion layer, no dependencies
   Content is fully visible without it. With reduced motion the head
   script never adds .js, so nothing here hides or tweens anything.
   ================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var motion = root.classList.contains("js");

  if (motion && !("IntersectionObserver" in window)) {
    root.classList.remove("js");
    motion = false;
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function range(p, a, b) { return clamp01((p - a) / (b - a)); }
  // close to the CSS curve cubic-bezier(0.22, 1, 0.36, 1)
  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

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

  function countUp(el) {
    var from = parseFloat(el.dataset.countFrom || "0");
    var to = parseFloat(el.dataset.countTo);
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var t = clamp01((now - start) / 1200);
      el.textContent = formatNum(from + (to - from) * easeOut(t), el);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- reveals, counters and bars on scroll-in ---------- */
  if (motion) {
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
    counters.forEach(function (el) {
      el.textContent = formatNum(parseFloat(el.dataset.countFrom || "0"), el);
    });

    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        if (el.classList.contains("reveal")) {
          el.style.transitionDelay = Math.min(batch++, 5) * 50 + "ms";
          el.classList.add("is-in");
        }
        if (el.hasAttribute("data-count-to")) countUp(el);
      });
    }, { rootMargin: "0px 0px -12% 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- THE TURN: palette flip scrubbed by scroll ---------- */
  var turn = motion ? document.querySelector(".turn") : null;
  var turnParts = turn && {
    noir: turn.querySelector(".turn__layer--noir"),
    paperWord: turn.querySelector(".turn__layer--paper .turn__word"),
    goldWord: turn.querySelector(".turn__word--gold"),
    center: turn.querySelector(".turn__center")
  };
  function renderTurn() {
    var total = turn.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp01(-turn.getBoundingClientRect().top / total) : 1;
    var wipe = range(p, 0, 0.55);
    var gold = range(p, 0.2, 0.65);
    var center = range(p, 0.4, 0.8);
    turnParts.noir.style.clipPath = "inset(0 0 " + ((1 - wipe) * 100).toFixed(2) + "% 0)";
    turnParts.paperWord.style.opacity = (1 - range(p, 0.08, 0.4)).toFixed(3);
    turnParts.goldWord.style.opacity = (0.18 * gold).toFixed(3);
    turnParts.goldWord.style.transform = "scale(" + (1.06 - 0.06 * gold).toFixed(4) + ")";
    turnParts.center.style.opacity = center.toFixed(3);
    turnParts.center.style.transform = "translateY(" + (12 * (1 - center)).toFixed(2) + "px)";
  }

  /* ---------- nav menu (small screens) ---------- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  if (nav && toggle) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------- nav state, reading progress, the turn ---------- */
  var fill = document.querySelector(".spine__fill");
  var ticking = false;
  function onScroll() {
    var max = root.scrollHeight - root.clientHeight;
    var y = window.scrollY || root.scrollTop;
    if (fill) fill.style.transform = "scaleY(" + (max > 0 ? y / max : 0).toFixed(4) + ")";
    if (nav) nav.classList.toggle("is-stuck", y > 80);
    if (turn) renderTurn();
    ticking = false;
  }
  function requestTick() {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  onScroll();
})();
