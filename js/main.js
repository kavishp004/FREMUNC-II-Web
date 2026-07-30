/* ==========================================================================
   FREMUNC II — main.js
   Progressive enhancement: header scroll state, mobile overlay menu, and a
   scroll-reveal IntersectionObserver (disabled under prefers-reduced-motion).
   ========================================================================== */

(function () {
  "use strict";

  /* ====================================================================== */
  /*  CONFERENCE DATE — drives the countdown timer on about.html.           */
  /*  The date (Sep 27, 2026) is set; UPDATE the 09:00 start time below      */
  /*  once it's confirmed. Parsed in the visitor's LOCAL time zone.          */
  /* ====================================================================== */
  const CONFERENCE_DATE = new Date("2026-09-27T09:00:00");

  /* ====================================================================== */
  /*  ROAD TO FREMUNC II — timeline milestones. EDIT DATES / TEXT HERE.      */
  /*  date: "YYYY-MM-DD" (visitor's local time) or null.                     */
  /*  • null  → renders as "TBD", neutral state.                             */
  /*  • past  → checked + muted.                                             */
  /*  • the earliest still-upcoming dated one → "Next up" badge.             */
  /*  (e.g. set Conference Day to "2026-09-27" to light up the logic.)       */
  /* ====================================================================== */
  const TIMELINE_MILESTONES = [
    { date: null, title: "Registration Opens",           description: "TBD" },
    { date: null, title: "Early Registration Deadline",  description: "TBD" },
    { date: null, title: "Regular Registration Deadline", description: "TBD" },
    { date: null, title: "Late Registration Deadline",   description: "TBD" },
    { date: null, title: "FREMUNC II Conference",        description: "The main event — September 2026 (TBD)." }
  ];

  /* Signal to the stylesheet that JS is available. Done as early as possible
     so the reveal elements can be hidden before first paint. */
  document.documentElement.classList.add("has-js");

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initCountdown();
    initHeroParallax();
    initTimeline();
    initCountUp();
    initMagneticButtons();
    initNavIndicator();
    initCardCursor();
    initCommitteeFilter();
    initPpgToc();
    initPageBanner();
    initDecor();
  });

  /* Shared motion check. */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ------------------------------------------------------------------ */
  /* Header: add .scrolled once the page has moved down a little so the  */
  /* bottom border / shadow fade in.                                     */
  /* ------------------------------------------------------------------ */
  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    var THRESHOLD = 8;
    var ticking = false;

    function update() {
      header.classList.toggle("scrolled", window.scrollY > THRESHOLD);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Mobile menu: hamburger toggles a full-screen overlay. Closes on     */
  /* link click, Escape, or resize back to desktop. Locks body scroll.   */
  /* ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function openMenu() {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("menu-open");
    }

    function toggleMenu() {
      if (menu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    toggle.addEventListener("click", toggleMenu);

    /* Close when a nav link inside the overlay is tapped. */
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    /* Close on Escape. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        toggle.focus();
      }
    });

    /* If the viewport grows past the mobile breakpoint, make sure the
       overlay isn't left stuck open. */
    var desktop = window.matchMedia("(min-width: 901px)");
    desktop.addEventListener("change", function (e) {
      if (e.matches) closeMenu();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal: fade + slide sections in as they enter the viewport. */
  /* Fully skipped when the user prefers reduced motion.                 */
  /* ------------------------------------------------------------------ */
  function initScrollReveal() {
    var groups = document.querySelectorAll(".section:not(.timeline-section), .page-header");
    if (!groups.length) return;

    /* Elements that individually reveal. Headings wipe; everything else rises. */
    var ITEM_SEL =
      ".eyebrow, h1, h2, .section-head p, .lead, " +
      ".grid-2 > *, .grid-3 > *, .grid-auto > *, .stats-grid > *, " +
      ".letter > *, .callout, .tbd-block, .info-list, .guide-part";

    groups.forEach(function (group) {
      group.querySelectorAll(ITEM_SEL).forEach(function (el) {
        var t = el.tagName;
        el.classList.add(t === "H1" || t === "H2" ? "rv-wipe" : "rv-up");
      });
      /* stagger index = position among revealing siblings in the same parent */
      group.querySelectorAll(".rv-up, .rv-wipe").forEach(function (el) {
        var i = 0, s = el.previousElementSibling;
        while (s) {
          if (s.classList.contains("rv-up") || s.classList.contains("rv-wipe")) i++;
          s = s.previousElementSibling;
        }
        el.style.setProperty("--rv-i", Math.min(i, 8));
      });
    });

    /* Reduced motion / no observer: nothing is hidden (the hidden state lives
       inside a no-preference media query), so there's nothing to do. */
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      groups.forEach(function (g) { g.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    groups.forEach(function (g) { observer.observe(g); });
  }

  /* ------------------------------------------------------------------ */
  /* Count-up: stat numerals animate 0 → value (ease-out, ~1.2s) when     */
  /* scrolled into view. Non-numeric values (e.g. "TBD") are skipped.     */
  /* ------------------------------------------------------------------ */
  function initCountUp() {
    var values = document.querySelectorAll(".stat-value");
    if (!values.length) return;
    var reduce = prefersReducedMotion();

    var targets = [];
    values.forEach(function (el) {
      var raw = el.textContent.trim();
      var m = raw.match(/^(\D*)(\d[\d.,]*)(.*)$/);
      if (!m) return; /* "TBD" and other non-numeric values → skip */
      var t = {
        el: el,
        target: parseFloat(m[2].replace(/,/g, "")),
        pre: m[1],
        suf: m[3],
        comma: m[2].indexOf(",") >= 0
      };
      targets.push(t);
      if (!reduce) el.textContent = t.pre + "0" + t.suf;
    });
    if (!targets.length || reduce || !("IntersectionObserver" in window)) return;

    function fmt(t, v) {
      return t.pre + (t.comma ? Math.round(v).toLocaleString() : String(Math.round(v))) + t.suf;
    }
    function run(t) {
      var dur = 1200, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
        t.el.textContent = fmt(t, t.target * eased);
        if (p < 1) requestAnimationFrame(step);
        else t.el.textContent = fmt(t, t.target);
      }
      requestAnimationFrame(step);
    }

    var grid = document.querySelector(".stats-grid") || targets[0].el;
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        o.disconnect();
        targets.forEach(run);
      });
    }, { threshold: 0.4 });
    obs.observe(grid);
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons (desktop pointer only): the button eases a few px   */
  /* toward the cursor and springs back on leave.                         */
  /* ------------------------------------------------------------------ */
  function initMagneticButtons() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".btn-primary, .btn-secondary").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        function cap(v) { return Math.max(-6, Math.min(6, v)); }
        btn.style.setProperty("--bx", cap((e.clientX - (r.left + r.width / 2)) * 0.25).toFixed(1) + "px");
        btn.style.setProperty("--by", cap((e.clientY - (r.top + r.height / 2)) * 0.25).toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.setProperty("--bx", "0px");
        btn.style.setProperty("--by", "0px");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Nav: one shared underline indicator that slides between links on     */
  /* hover and rests under the active link. Position via translateX,      */
  /* width via scaleX (both transforms).                                  */
  /* ------------------------------------------------------------------ */
  function initNavIndicator() {
    var nav = document.querySelector(".nav-desktop");
    if (!nav) return;
    var indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    nav.appendChild(indicator);

    var links = [].slice.call(nav.querySelectorAll("a"));
    if (!links.length) return;
    var active = nav.querySelector("a.active") || links[0];

    function moveTo(link) {
      if (!link) { indicator.style.opacity = "0"; return; }
      var padL = parseFloat(getComputedStyle(link).paddingLeft) || 10;
      var x = link.offsetLeft + padL;
      var w = Math.max(1, link.offsetWidth - padL * 2);
      indicator.style.transform = "translateX(" + x + "px) scaleX(" + w + ")";
      indicator.style.opacity = "1";
    }

    moveTo(active);
    links.forEach(function (l) {
      l.addEventListener("mouseenter", function () { moveTo(l); });
    });
    nav.addEventListener("mouseleave", function () { moveTo(active); });
    window.addEventListener("resize", function () { moveTo(active); });
  }

  /* ------------------------------------------------------------------ */
  /* Cards: feed the cursor position into a CSS radial highlight.         */
  /* (Desktop pointer only; the highlight opacity is handled in CSS.)     */
  /* ------------------------------------------------------------------ */
  function initCardCursor() {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".card:not(.stat-card):not(.member-card), .explore-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--cx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        card.style.setProperty("--cy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Committees: difficulty filter. Cards fade out/in; an empty-state    */
  /* message shows when a level has no matches (all are TBD for now).    */
  /* ------------------------------------------------------------------ */
  function initCommitteeFilter() {
    var bar = document.querySelector(".filter-bar");
    var grid = document.getElementById("committeeGrid");
    if (!bar || !grid) return;
    var cards = [].slice.call(grid.querySelectorAll(".committee-card"));
    var empty = document.querySelector(".committee-empty");
    var btns = [].slice.call(bar.querySelectorAll(".filter-btn"));

    function apply(val) {
      var shown = 0;
      cards.forEach(function (card) {
        var d = (card.getAttribute("data-type") || "").toLowerCase();
        var show = val === "all" || d === val;
        if (show) {
          card.hidden = false;
          requestAnimationFrame(function () { card.classList.remove("is-filtered-out"); });
          shown++;
        } else {
          card.classList.add("is-filtered-out");
          window.setTimeout(function () {
            if (card.classList.contains("is-filtered-out")) card.hidden = true;
          }, 320);
        }
      });
      if (empty) empty.hidden = shown !== 0;
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        apply(btn.getAttribute("data-filter"));
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Position paper: sticky TOC scrollspy — highlight the section        */
  /* nearest the top of the viewport as the reader scrolls.              */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* Committees banner: build the rippling dot grid as inline SVG.        */
  /* (Dots exist regardless of motion; the ripple animation is CSS-gated  */
  /* by prefers-reduced-motion, so reduced motion shows a static grid.)   */
  /* ------------------------------------------------------------------ */
  function initPageBanner() {
    var host = document.querySelector("[data-dotgrid]");
    if (!host || host.firstChild) return;
    var NS = "http://www.w3.org/2000/svg";
    var COLS = 18, ROWS = 5;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1200 400");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("focusable", "false");
    var gx = 1200 / COLS, gy = 400 / ROWS;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "dot");
        dot.setAttribute("cx", (gx * (c + 0.5)).toFixed(1));
        dot.setAttribute("cy", (gy * (r + 0.5)).toFixed(1));
        dot.setAttribute("r", "2.4");
        dot.style.setProperty("--i", c + r); /* diagonal index → travelling wave */
        svg.appendChild(dot);
      }
    }
    host.appendChild(svg);
  }

  /* ------------------------------------------------------------------ */
  /* Decorative edge treatment: fixed side rails, corner registration    */
  /* marks, ambient blobs, and per-section edge numerals. All of it is    */
  /* aria-hidden + pointer-events:none (styled in styles.css). Injected    */
  /* here so it stays DRY across every page. Only the right rail's        */
  /* progress fill + percentage are dynamic — skipped under reduced       */
  /* motion (the CSS hides them there too).                               */
  /* ------------------------------------------------------------------ */
  function initDecor() {
    function make(tag, cls) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      e.setAttribute("aria-hidden", "true");
      return e;
    }

    /* --- Fixed layer: rails + corner marks + ambient blobs --- */
    var frag = document.createDocumentFragment();

    var leftRail = make("div", "side-rail side-rail--left");
    var leftLabel = make("span", "rail-label");
    leftLabel.textContent = "FREMUNC II · THE SKY'S THE LIMIT";
    leftRail.appendChild(leftLabel);

    var rightRail = make("div", "side-rail side-rail--right");
    var progress = make("span", "rail-progress");
    var pct = make("span", "rail-pct");
    pct.textContent = "000%";
    rightRail.appendChild(progress);
    rightRail.appendChild(pct);

    frag.appendChild(leftRail);
    frag.appendChild(rightRail);

    ["tl", "tr", "bl", "br"].forEach(function (corner) {
      frag.appendChild(make("span", "corner-mark corner-mark--" + corner));
    });
    [1, 2, 3].forEach(function (n) {
      frag.appendChild(make("div", "ambient-blob ambient-blob--" + n));
    });
    document.body.appendChild(frag);

    /* --- Per-section edge numerals, alternating sides --- */
    var sections = document.querySelectorAll("main .section:not(.timeline-section)");
    Array.prototype.forEach.call(sections, function (sec, i) {
      sec.classList.add("has-edge-glyph");
      var glyph = make("span", "edge-glyph edge-glyph--" + (i % 2 === 0 ? "left" : "right"));
      glyph.textContent = ("0" + (i + 1)).slice(-2);
      sec.insertBefore(glyph, sec.firstChild);
    });

    /* --- Right rail: live scroll progress (motion → skip if reduced) --- */
    if (prefersReducedMotion()) return;
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY || doc.scrollTop || 0) / max : 0;
      if (p < 0) p = 0; else if (p > 1) p = 1;
      progress.style.height = (p * 100).toFixed(2) + "%";
      pct.textContent = ("00" + Math.round(p * 100)).slice(-3) + "%";
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  function initPpgToc() {
    var toc = document.querySelector(".ppg-toc");
    if (!toc || !("IntersectionObserver" in window)) return;
    var links = [].slice.call(toc.querySelectorAll(".ppg-toc-link"));
    if (!links.length) return;

    function setCurrent(id) {
      links.forEach(function (l) {
        l.classList.toggle("is-current", l.getAttribute("href") === "#" + id);
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setCurrent(e.target.id);
      });
    }, { rootMargin: "-25% 0px -70% 0px", threshold: 0 });

    links.forEach(function (l) {
      var s = document.getElementById(l.getAttribute("href").slice(1));
      if (s) io.observe(s);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Countdown to CONFERENCE_DATE. Ticks once a second; once the date    */
  /* has passed it swaps the digits out for a short message rather than  */
  /* counting into negative numbers.                                     */
  /* ------------------------------------------------------------------ */
  function initCountdown() {
    var root = document.getElementById("countdown");
    if (!root) return;

    var grid = root.querySelector(".countdown-grid");
    var done = root.querySelector(".countdown-done");
    var units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]')
    };

    var animate = !prefersReducedMotion();
    var timer = null;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    /* Flip a value: stack the old number above the new one in the clipped box
       and slide up one cell. Falls back to a plain swap on first paint and
       under reduced motion. */
    function setUnit(el, text) {
      if (!el) return;
      var prev = el.getAttribute("data-v");
      if (prev === text) return;
      el.setAttribute("data-v", text);
      if (!animate || prev === null) {
        el.textContent = text;
        return;
      }
      el.innerHTML =
        '<span class="cd-stack"><span class="cd-cell">' + prev +
        '</span><span class="cd-cell">' + text + "</span></span>";
      var stack = el.firstChild;
      void stack.offsetWidth; /* force reflow so the transition runs */
      stack.classList.add("cd-go");
      window.setTimeout(function () {
        if (el.getAttribute("data-v") === text) el.textContent = text;
      }, 470);
    }

    /* Returns false once the conference has arrived. */
    function render() {
      var diff = CONFERENCE_DATE.getTime() - Date.now();

      if (diff <= 0) {
        if (grid) grid.hidden = true;
        if (done) done.hidden = false;
        return false;
      }

      var total = Math.floor(diff / 1000);
      setUnit(units.days, pad(Math.floor(total / 86400)));
      setUnit(units.hours, pad(Math.floor((total % 86400) / 3600)));
      setUnit(units.minutes, pad(Math.floor((total % 3600) / 60)));
      setUnit(units.seconds, pad(total % 60));
      return true;
    }

    if (render()) {
      timer = setInterval(function () {
        if (!render()) clearInterval(timer);
      }, 1000);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Hero parallax: translate each sky layer at its own rate on scroll   */
  /* for depth. Transform only (never top/left), throttled with rAF, and */
  /* skipped entirely under reduced motion.                              */
  /* ------------------------------------------------------------------ */
  function initHeroParallax() {
    var hero = document.getElementById("hero");
    if (!hero || prefersReducedMotion()) return;

    var layers = hero.querySelectorAll(".hero-layer[data-depth]");
    if (!layers.length) return;

    var depths = [];
    for (var i = 0; i < layers.length; i++) {
      depths.push(parseFloat(layers[i].getAttribute("data-depth")) || 0);
    }

    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset || 0;
      /* Only do work while the hero is still on (or near) screen. */
      if (y <= hero.offsetHeight + window.innerHeight) {
        for (var i = 0; i < layers.length; i++) {
          layers[i].style.transform =
            "translate3d(0," + (y * depths[i]).toFixed(1) + "px,0)";
        }
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------ */
  /* Road to FREMUNC II timeline. Renders milestones from                */
  /* TIMELINE_MILESTONES, applies date-based state, then wires either a   */
  /* horizontal scroll-pinned track (wide + motion) or a vertical         */
  /* IntersectionObserver timeline (narrow or reduced motion).            */
  /* ------------------------------------------------------------------ */
  var TL_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function tlParseDate(str) { var p = str.split("-"); return new Date(+p[0], (+p[1]) - 1, +p[2]); }
  function tlStartOfToday() { var d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function tlFormatDate(d) { return TL_MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); }
  function tlEscape(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function tlHeaderH() { var h = document.querySelector(".site-header"); return h ? h.offsetHeight : 68; }
  function tlOnMQ(mq, fn) {
    if (mq.addEventListener) mq.addEventListener("change", fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  function initTimeline() {
    var section = document.getElementById("road");
    if (!section) return;
    var list = document.getElementById("timelineList");
    var track = document.getElementById("timelineTrack");
    if (!list || !track) return;
    var rail = section.querySelector(".timeline-rail");
    var railFill = section.querySelector(".timeline-rail-fill");
    var progressFill = section.querySelector(".timeline-progress-fill");
    var pin = section.querySelector(".timeline-pin");

    /* ---- date-based state ---- */
    var today = tlStartOfToday();
    var parsed = TIMELINE_MILESTONES.map(function (m) {
      return { m: m, d: m.date ? tlParseDate(m.date) : null };
    });
    var nextIndex = -1, nextT = Infinity;
    parsed.forEach(function (it, i) {
      if (it.d && it.d.getTime() >= today.getTime() && it.d.getTime() < nextT) {
        nextT = it.d.getTime(); nextIndex = i;
      }
    });

    /* ---- render milestones ---- */
    parsed.forEach(function (it, i) {
      var li = document.createElement("li");
      li.className = "milestone " + (i % 2 === 0 ? "above" : "below");
      if (i === parsed.length - 1) li.classList.add("is-final");
      var isPast = it.d && it.d.getTime() < today.getTime();
      var isNext = i === nextIndex;
      if (isPast) li.classList.add("is-past");
      if (isNext) li.classList.add("is-next");

      var card = document.createElement("div");
      card.className = "milestone-card";
      card.innerHTML =
        (isNext ? '<span class="milestone-badge">Next up</span>' : "") +
        '<p class="milestone-date">' + (it.d ? tlFormatDate(it.d) : "TBD") + "</p>" +
        '<h3 class="milestone-title">' + tlEscape(it.m.title) + "</h3>" +
        '<p class="milestone-desc">' + tlEscape(it.m.description) + "</p>";

      var connector = document.createElement("span");
      connector.className = "milestone-connector";
      var node = document.createElement("span");
      node.className = "milestone-node";

      li.appendChild(card);
      li.appendChild(connector);
      li.appendChild(node);
      list.appendChild(li);
    });

    var milestones = [].slice.call(list.querySelectorAll(".milestone"));
    var n = milestones.length;

    var horizMQ = window.matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    var teardown = null;

    /* Nodes pop as the progress line reaches them (fraction of the rail). */
    function revealByProgress(p) {
      for (var i = 0; i < n; i++) {
        var threshold = n > 1 ? i / (n - 1) : 0;
        milestones[i].classList.toggle("is-active", p >= threshold - 0.03);
      }
    }

    /* -------- horizontal scroll-pinned track -------- */
    function setupHorizontal() {
      var headerH = tlHeaderH();
      var trackScroll = 0;
      var ticking = false;

      function layout() {
        section.style.height = "";
        var viewW = track.parentElement.clientWidth;
        /* Derive each milestone's width from the node count so the track always
           spans a comfortable horizontal scroll distance — fewer milestones get
           more spacing rather than bunching up at one end. */
        var padPx = 2 * (parseFloat(getComputedStyle(list).paddingLeft) || 64);
        var targetTrackW = viewW + 240 + (n - 1) * 210;
        var msW = Math.max(300, Math.min(560, (targetTrackW - padPx) / n));
        track.style.setProperty("--ms-w", msW.toFixed(1) + "px");
        var pinH = pin.offsetHeight;
        trackScroll = Math.max(0, track.scrollWidth - viewW);
        section.style.height = pinH + trackScroll + "px";
      }
      function update() {
        var sectionTop = section.getBoundingClientRect().top + window.scrollY;
        var maxPx = section.offsetHeight - pin.offsetHeight;
        var progressPx = window.scrollY + headerH - sectionTop;
        var p = maxPx > 0 ? Math.max(0, Math.min(1, progressPx / maxPx)) : 0;
        track.style.transform = "translate3d(" + (-p * trackScroll).toFixed(1) + "px,0,0)";
        if (railFill) railFill.style.width = (p * 100).toFixed(2) + "%";
        if (progressFill) progressFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
        revealByProgress(p);
        ticking = false;
      }
      function onScroll() { if (!ticking) { requestAnimationFrame(update); ticking = true; } }
      function onResize() { layout(); update(); }

      layout();
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);

      return function () {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        section.style.height = "";
        track.style.transform = "";
        track.style.removeProperty("--ms-w");
        if (railFill) railFill.style.width = "";
        if (progressFill) progressFill.style.transform = "";
        milestones.forEach(function (mi) { mi.classList.remove("is-active"); });
      };
    }

    /* -------- vertical IntersectionObserver timeline -------- */
    function setupVertical() {
      if (reduceMQ.matches) {
        /* reduced motion: no transitions, everything shown at rest */
        milestones.forEach(function (mi) { mi.classList.add("is-active"); });
        if (railFill) railFill.style.height = "100%";
        return function () {
          milestones.forEach(function (mi) { mi.classList.remove("is-active"); });
          if (railFill) railFill.style.height = "";
        };
      }
      function updateFill() {
        var last = null;
        for (var i = 0; i < n; i++) if (milestones[i].classList.contains("is-active")) last = milestones[i];
        if (last && railFill && rail) {
          var node = last.querySelector(".milestone-node");
          var railTop = rail.getBoundingClientRect().top;
          var nodeMid = node.getBoundingClientRect().top + node.offsetHeight / 2;
          railFill.style.height = Math.max(0, nodeMid - railTop) + "px";
        }
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-active"); io.unobserve(e.target); }
        });
        requestAnimationFrame(updateFill);
      }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });
      milestones.forEach(function (mi) { io.observe(mi); });
      var onScroll = function () { requestAnimationFrame(updateFill); };
      window.addEventListener("scroll", onScroll, { passive: true });

      return function () {
        io.disconnect();
        window.removeEventListener("scroll", onScroll);
        if (railFill) railFill.style.height = "";
        milestones.forEach(function (mi) { mi.classList.remove("is-active"); });
      };
    }

    function setup() {
      if (teardown) { teardown(); teardown = null; }
      teardown = horizMQ.matches ? setupHorizontal() : setupVertical();
    }

    setup();
    tlOnMQ(horizMQ, setup);   /* re-wire if the viewport crosses 900px … */
    tlOnMQ(reduceMQ, setup);  /* … or the motion preference changes */
  }
})();
