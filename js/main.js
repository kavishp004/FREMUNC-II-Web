/* ==========================================================================
   FREMUNC — main.js
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
  const CONFERENCE_DATE = new Date("2026-10-03T08:15:00");

  /* ====================================================================== */
  /*  HOMEPAGE HERO SLIDESHOW — EDIT THIS ONE OBJECT AND NOTHING ELSE.      */
  /*                                                                        */
  /*  To add a photo:    add a line to `photos`.                            */
  /*  To remove a photo: delete its line.                                   */
  /*  To reorder:        move the lines around. The first one is the LCP    */
  /*                     image (eager + high priority); the second is also  */
  /*                     eager, everything after it lazy-loads.             */
  /*                                                                        */
  /*  Drop the files in assets/photos/. Use LANDSCAPE images only — a       */
  /*  portrait photo crops badly at hero proportions.                       */
  /*  w/h are the file's real pixel dimensions; they set the aspect-ratio   */
  /*  so there is no layout shift while the image loads.                    */
  /*  If the folder is missing or every image fails, the hero quietly falls */
  /*  back to a plain dusk-to-pale gradient — never broken-image icons.     */
  /* ====================================================================== */
  const HERO_SLIDESHOW = {
    dir: "assets/photos/",
    holdMs: 6000,   /* how long each photo sits on screen */
    fadeMs: 1500,   /* how long the crossfade between photos takes */
    photos: [
      { file: "hero-01.jpg", w: 2400, h: 1603, alt: "Delegates in committee session at FREMUNC 2025" },
      { file: "hero-02.jpg", w: 2400, h: 1603, alt: "Opening ceremony in the Irvington High School auditorium" },
      { file: "hero-03.jpg", w: 2400, h: 1603, alt: "A delegate addressing the floor during debate" },
      { file: "hero-04.jpg", w: 2400, h: 1800, alt: "Chairs reviewing resolutions at the dais" },
      { file: "hero-05.jpg", w: 2400, h: 1800, alt: "Delegates negotiating in an unmoderated caucus" }
    ]
  };

  /* ====================================================================== */
  /*  ROAD TO FREMUNC — timeline milestones. EDIT DATES / TEXT HERE.      */
  /*  date: "YYYY-MM-DD" (visitor's local time) or null.                     */
  /*  • null  → renders as "TBD", neutral state.                             */
  /*  • past  → checked + muted.                                             */
  /*  • the earliest still-upcoming dated one → "Next up" badge.             */
  /*  (e.g. Conference Day is "2026-10-03".)                                 */
  /* ====================================================================== */
  const TIMELINE_MILESTONES = [
    { date: "2026-08-11", title: "Registration Opens",            description: "Early registration opens at $22 per delegate ($20 for Irvington students)." },
    { date: "2026-08-29", title: "Early Registration Closes",     description: "Last day for the discounted early rate." },
    { date: "2026-08-30", title: "General Registration Opens",    description: "Standard rate of $25 per delegate." },
    { date: "2026-09-19", title: "Registration Closes",           description: "Final deadline to register a delegation." },
    { date: "2026-10-03", title: "FREMUNC Conference",            description: "The main event at Irvington High School, 8:15 AM to 5:30 PM." }
  ];

  /* Signal to the stylesheet that JS is available. Done as early as possible
     so the reveal elements can be hidden before first paint. */
  document.documentElement.classList.add("has-js");

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initCountdown();
    initTimeline();
    initCountUp();
    initMagneticButtons();
    initNavIndicator();
    initCardCursor();
    initCommitteeFilter();
    initDecor();
    initHeroSlideshow();
    initAboutPortrait();
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
  /* Hero photo slideshow. Builds the slides from HERO_SLIDESHOW, then    */
  /* crossfades them on a timer with a slow Ken Burns push. Dots jump to  */
  /* a slide and restart the timer. Under reduced motion there is no Ken  */
  /* Burns and no crossfade — one static photo, dots switch instantly.    */
  /* Falls back to a plain gradient if no image can be loaded.            */
  /* ------------------------------------------------------------------ */
  function initHeroSlideshow() {
    var stage = document.querySelector("[data-hero-photos]");
    var hero = document.getElementById("hero");
    if (!stage || !hero) return;

    var cfg = HERO_SLIDESHOW;
    var list = (cfg && cfg.photos) || [];
    var dotWrap = document.querySelector("[data-hero-dots]");

    function fallback() {
      hero.classList.add("hero--nophotos");
      stage.innerHTML = "";
      if (dotWrap) dotWrap.innerHTML = "";
    }
    if (!list.length) { fallback(); return; }

    var reduce = prefersReducedMotion();
    var slides = [];
    var order = [];   /* indices still usable — broken images drop out of it */

    list.forEach(function (photo, i) {
      var img = document.createElement("img");
      img.className = "hero-slide" + (i % 2 ? " hero-slide--alt" : "");
      img.src = cfg.dir + photo.file;
      img.alt = photo.alt || "";
      if (photo.w && photo.h) { img.width = photo.w; img.height = photo.h; }
      img.decoding = "async";
      if (i === 0) {
        img.loading = "eager";
        img.setAttribute("fetchpriority", "high");
      } else if (i === 1) {
        img.loading = "eager";
      } else {
        img.loading = "lazy";
      }
      /* Slide durations come from the config so the Ken Burns push lasts
         exactly as long as the photo is on screen. */
      img.style.setProperty("--kb-dur", (cfg.holdMs + cfg.fadeMs) + "ms");
      img.style.setProperty("--fade-dur", cfg.fadeMs + "ms");
      img.addEventListener("error", function () {
        img.classList.add("is-broken");
        /* The first slide is eager, so if IT fails the folder is missing or
           empty — bail out to the gradient rather than show a blank hero.
           (Later slides are lazy and may never even be requested, so we can't
           wait for "all of them failed".) */
        if (i === 0) { fallback(); return; }
        dropSlide(i);
      });
      stage.appendChild(img);
      slides.push(img);
      order.push(i);
    });

    var dots = [];
    if (dotWrap && slides.length > 1) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hero-dot";
        b.setAttribute("aria-label", "Show photo " + (i + 1) + " of " + slides.length);
        b.addEventListener("click", function () {
          var at = order.indexOf(i);
          if (at !== -1) { go(at); restart(); }
        });
        dotWrap.appendChild(b);
        dots.push(b);
      });
    }

    var pos = 0;      /* position within `order`, not the raw slide index */
    var timer = null;

    /* A slide failed to load: take it out of the rotation and drop its dot. */
    function dropSlide(i) {
      var at = order.indexOf(i);
      if (at === -1) return;
      order.splice(at, 1);
      if (dots[i]) dots[i].hidden = true;
      if (!order.length) { fallback(); return; }
      if (pos >= order.length) pos = 0;
      go(pos);
    }

    function go(p) {
      if (!order.length) return;
      pos = (p + order.length) % order.length;
      var live = order[pos];
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === live); });
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === live);
        d.setAttribute("aria-current", i === live ? "true" : "false");
      });
    }
    function next() { go(pos + 1); }
    function restart() {
      if (reduce || order.length < 2) return;
      clearInterval(timer);
      timer = setInterval(next, cfg.holdMs);
    }

    go(0);
    restart();

    /* Don't burn frames animating a hero nobody is looking at. */
    if (!reduce && order.length > 1 && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { restart(); }
          else { clearInterval(timer); }
        });
      }, { threshold: 0.01 }).observe(hero);
    }
  }

  /* ------------------------------------------------------------------ */
  /* About page portrait: hide the frame entirely if the image is        */
  /* missing, rather than showing a broken-image icon.                   */
  /* ------------------------------------------------------------------ */
  function initAboutPortrait() {
    var img = document.querySelector("[data-about-portrait]");
    if (!img) return;
    img.addEventListener("error", function () {
      var frame = img.closest(".about-figure");
      if (frame) frame.classList.add("is-missing");
    });
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

    /* --- Fixed layer: corner marks + ambient blobs --- */
    var frag = document.createDocumentFragment();

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
  /* Road to FREMUNC timeline. Renders milestones from                   */
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
