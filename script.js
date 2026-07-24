/* ===========================================================================
   PrivacyStage landing: interactions (vanilla JS, L2)
   - Scroll reveals (IntersectionObserver)
   - Nav glass on scroll
   - Hero parallax (rAF-throttled)
   - Signature "follows your active window" demo (IO-gated, auto-pauses off-screen)
   - Bento cursor spotlight (rAF-throttled, hover devices only)
   - Copy-to-clipboard sample license key (delight detail)
   - Paddle checkout wiring (graceful when unconfigured)
   =========================================================================== */
(function () {
  "use strict";
  const cfg = window.PRIVACYSTAGE_CONFIG || {};
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  /* ---------- year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- nav glass ---------- */
  const nav = document.getElementById("nav");
  const onScrollNav = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  onScrollNav();
  addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- smooth scroll for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  /* ---------- hero parallax (rAF-throttled) ---------- */
  const parallax = document.getElementById("heroParallax");
  if (parallax && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const y = Math.max(-30, Math.min(30, window.scrollY * -0.04));
      parallax.style.setProperty("--sy", y.toFixed(1) + "px");
      ticking = false;
    };
    addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- signature demo: follows the active window ---------- */
  const demo = document.getElementById("sigDemo");
  if (demo) {
    const chips = [...demo.querySelectorAll(".sig-chip")];
    const frames = [...demo.querySelectorAll(".app-frame")];
    const titleEl = document.getElementById("sigScreenTitle");
    const callApps = ["Google Meet", "Google Meet", "Google Meet"];
    let idx = 0;
    let timer = null;
    let visible = false;

    const setActive = (i) => {
      idx = i;
      chips.forEach((c, n) => c.setAttribute("data-live", String(n === i)));
      frames.forEach((f, n) => f.classList.toggle("active", n === i));
      if (titleEl) titleEl.textContent = callApps[i] + ' · Sharing "Monitor 1"';
    };

    const advance = () => setActive((idx + 1) % frames.length);

    const start = () => {
      if (timer || reduceMotion) return;
      timer = setInterval(advance, 2400);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    // Manual control: clicking a tagged window jumps to it and resets the timer.
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        setActive(Number(c.dataset.index));
        stop();
        if (visible) start();
      })
    );

    // Only animate while on-screen (perf red line).
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            visible = e.isIntersecting;
            visible ? start() : stop();
          });
        },
        { threshold: 0.35 }
      );
      io.observe(demo);
    } else {
      start();
    }
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : visible && start()
    );
  }

  /* ---------- bento cursor spotlight ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll(".bento-card.spotlight").forEach((card) => {
      let raf = null;
      card.addEventListener("pointermove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", e.clientX - r.left + "px");
          card.style.setProperty("--my", e.clientY - r.top + "px");
          raf = null;
        });
      });
    });
  }

  /* ---------- visit beacon: per-source, cookieless (first-party) ---------- */
  (function () {
    if (!cfg.downloadUrl) return;
    let base;
    try {
      base = new URL(cfg.downloadUrl).origin;
    } catch {
      return;
    }
    const params = new URLSearchParams(location.search);
    let src = params.get("utm_source") || "";
    if (!src && document.referrer) {
      try {
        const rh = new URL(document.referrer).hostname.replace(/^www\./, "");
        // Ignore internal navigation (privacy/terms -> home) so it doesn't self-attribute.
        if (rh && rh !== location.hostname.replace(/^www\./, "")) src = rh;
      } catch {}
    }
    const q = new URLSearchParams({ src: src || "direct" });
    ["utm_source", "utm_medium", "utm_campaign"].forEach((k) => {
      const v = params.get(k);
      if (v) q.set(k, v);
    });
    try {
      new Image().src = base + "/v?" + q.toString();
    } catch {}
  })();

  /* ---------- download links (carry UTM params through for attribution) ---------- */
  function downloadHref() {
    if (!cfg.downloadUrl) return null;
    try {
      const dest = new URL(cfg.downloadUrl);
      const landing = new URLSearchParams(location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
        const v = landing.get(k);
        if (v) dest.searchParams.set(k, v);
      });
      return dest.toString();
    } catch {
      return cfg.downloadUrl;
    }
  }
  const dlHref = downloadHref();
  ["downloadLink", "downloadLink2"].forEach((id) => {
    const el = document.getElementById(id);
    if (el && dlHref) el.setAttribute("href", dlHref);
  });

  /* ---------- Paddle checkout ---------- */
  const buyBtn = document.getElementById("buyBtn");
  const paddle = cfg.paddle || {};
  const configured =
    paddle.token &&
    !paddle.token.startsWith("__") &&
    paddle.priceId &&
    !paddle.priceId.startsWith("__");

  function openCheckout() {
    if (!window.Paddle) return;
    window.Paddle.Checkout.open({
      items: [{ priceId: paddle.priceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: new URL(cfg.successUrl || "success.html", location.href).href,
      },
    });
  }

  if (buyBtn) {
    if (configured) {
      // Load Paddle.js only when we have real credentials.
      const s = document.createElement("script");
      s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      s.onload = () => {
        try {
          if (paddle.environment === "sandbox") window.Paddle.Environment.set("sandbox");
          window.Paddle.Initialize({
            token: paddle.token,
            eventCallback: (data) => {
              if (data && data.name === "checkout.completed") {
                // Backend mints + emails the Ed25519 key (see PADDLE_SETUP.md).
                // Optionally forward the buyer to the success page here.
              }
            },
          });
        } catch (err) {
          console.error("Paddle init failed:", err);
        }
      };
      document.head.appendChild(s);
      buyBtn.addEventListener("click", openCheckout);
    } else {
      // Not configured yet: keep the button honest instead of silently failing.
      buyBtn.addEventListener("click", () => {
        alert(
          "Checkout isn't wired up yet.\n\n" +
            "Add your Paddle client token + price ID in config.js, then follow " +
            "PADDLE_SETUP.md to connect the license-key webhook."
        );
      });
    }
  }
})();
