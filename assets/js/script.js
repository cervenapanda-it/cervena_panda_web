/* Červená panda — local rebuild · shared interactions */
(function () {
  "use strict";

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  var menuOpen = false;

  function setMenu(open) {
    if (!toggle || !links) return;
    menuOpen = open;
    links.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
    updateMobileCta();
  }

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---- Sticky mobile CTA ----
     Appears once the hero has scrolled past, hides again while the form is
     on screen (and while the menu is open). */
  var mobileCta = document.querySelector(".mobile-cta");
  var contact = document.querySelector("#kontakt");
  var contactVisible = false;
  var scrolledPastHero = false;

  function updateMobileCta() {
    if (!mobileCta) return;
    mobileCta.classList.toggle(
      "show",
      scrolledPastHero && !contactVisible && !menuOpen
    );
  }

  if (mobileCta) {
    var onScroll = function () {
      scrolledPastHero = window.scrollY > 280;
      updateMobileCta();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (contact && "IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          contactVisible = entries[0].isIntersecting;
          updateMobileCta();
        },
        { threshold: 0.12 }
      ).observe(contact);
    }
  }

  /* ---- Testimonial carousel indicators (phones) ----
     The quotes grid becomes a horizontal snap-scroller under 720px. Dots show
     how many references there are and which one you're on. Built in JS so the
     markup stays clean and the carousel still swipes without it. */
  var quotes = document.querySelector(".quotes");
  var cards = quotes ? [].slice.call(quotes.querySelectorAll(".quote")) : [];
  if (quotes && cards.length > 1) {
    var dotsWrap = document.createElement("div");
    dotsWrap.className = "quotes-dots";
    dotsWrap.setAttribute("role", "tablist");
    dotsWrap.setAttribute("aria-label", "Reference");

    cards.forEach(function (card, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "quotes-dot";
      dot.setAttribute("aria-label", "Reference " + (i + 1) + " z " + cards.length);
      dot.addEventListener("click", function () {
        quotes.scrollTo({
          left: card.offsetLeft - cards[0].offsetLeft,
          behavior: "smooth",
        });
      });
      dotsWrap.appendChild(dot);
    });
    quotes.insertAdjacentElement("afterend", dotsWrap);

    var dots = [].slice.call(dotsWrap.children);
    var syncDots = function () {
      var mid = quotes.scrollLeft + quotes.clientWidth / 2;
      var active = 0;
      var closest = Infinity;
      cards.forEach(function (card, i) {
        var center =
          card.offsetLeft - cards[0].offsetLeft + card.offsetWidth / 2;
        var dist = Math.abs(center - mid);
        if (dist < closest) {
          closest = dist;
          active = i;
        }
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === active ? "true" : "false");
      });
    };
    quotes.addEventListener("scroll", syncDots, { passive: true });
    window.addEventListener("resize", syncDots);
    syncDots();
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.toggle("open");
      q.setAttribute("aria-expanded", isOpen ? "true" : "false");
      a.style.maxHeight = isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* ---- Member bio collapse (teachers page) ----
     Long bios are clamped to 4 lines; a toggle reveals the full text.
     Short bios are left untouched (no button, no clamping). */
  var BIO_LIMIT = 300;
  document.querySelectorAll(".member .body p").forEach(function (p) {
    if (p.textContent.trim().length <= BIO_LIMIT) return;
    var card = p.parentElement;
    card.classList.add("has-toggle");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bio-toggle";
    btn.textContent = "Zobrazit více";
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var isOpen = card.classList.toggle("open");
      btn.textContent = isOpen ? "Zobrazit méně" : "Zobrazit více";
      btn.setAttribute("aria-expanded", String(isOpen));
    });
    card.appendChild(btn);
  });

  /* ---- Poptávka form (posts to n8n webhook) ---- */
  var WEBHOOK_URL = "https://n8n-production-9b68.up.railway.app/webhook/poptavka";
  var poptavka = document.querySelector("#poptavkaForm");
  if (poptavka) {
    poptavka.addEventListener("submit", async function (e) {
      e.preventDefault();

      var btn = document.querySelector("#submitBtn");
      var errorDiv = document.querySelector("#cfError");
      errorDiv.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Odesílám…";

      var data = {
        firstName: document.querySelector("#firstName").value.trim(),
        lastName: document.querySelector("#lastName").value.trim(),
        email: document.querySelector("#email").value.trim(),
        phone: document.querySelector("#phone").value.trim(),
        city: document.querySelector("#city").value.trim(),
        message: document.querySelector("#message").value.trim(),
        priority: document.querySelector("#priority").checked ? "ano" : "ne",
      };

      try {
        var res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        poptavka.style.display = "none";
        var success = document.querySelector("#cfSuccess");
        success.style.display = "block";
        // on a phone the form vanishes mid-screen — bring the confirmation to the user
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (err) {
        errorDiv.style.display = "block";
        btn.disabled = false;
        btn.textContent = "Odeslat";
        errorDiv.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ---- Video play overlay (Jak učíme) ----
     Native controls are hidden until the user clicks the styled play button.
     Clicking starts playback and reveals the standard browser controls. */
  var videoWrap = document.querySelector(".video-wrap");
  if (videoWrap) {
    var video = videoWrap.querySelector("video");
    var playBtn = videoWrap.querySelector(".video-play");
    if (video && playBtn) {
      var startVideo = function () {
        if (!video.paused && !playBtn.hidden) return;
        video.controls = true;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        videoWrap.classList.add("played");
        playBtn.hidden = true;
      };
      playBtn.addEventListener("click", startVideo);
      video.addEventListener("click", function () {
        if (video.paused && !playBtn.hidden) startVideo();
      });
    }
  }

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Footer year ---- */
  var year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
