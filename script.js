/* ==========================================================================
   script.js  |  GDG Fest demo website
   --------------------------------------------------------------------------
   Vanilla JavaScript only. Content comes from data.js.
   Everything here is a FRONTEND DEMO: nothing is sent to a server.
   The only stored data is the visitor's own "My Fest Day" picks (localStorage).

   Sections
   0. Setup and helpers        6. Schedule + filters
   1. Icons                    7. My Fest Day planner (feature)
   2. Rendering from data      8. Registration form + pass
   3. Navigation               9. FAQ, back to top, countdown
   4. Smooth scroll + reveal  10. Start-up (init)
   5. Tabs
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- 0. Setup and helpers ---------- */
  var D = GDG_DATA;
  var STORAGE_KEY = "gdgfest-my-day";

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  // Reduced motion: checked at load and whenever the setting changes
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;
  function onMotionChange(e) {
    reduceMotion = e.matches;
    if (reduceMotion) { $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); }); }
  }
  if (motionQuery.addEventListener) { motionQuery.addEventListener("change", onMotionChange); }
  else if (motionQuery.addListener) { motionQuery.addListener(onMotionChange); }

  var toastTimer = null;
  function toast(message) {
    var el = $("#toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 3200);
  }

  // Turn "09:30" into minutes so we can compare times
  function toMinutes(time) {
    var parts = time.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
  }

  /* ---------- 1. Icons (inline SVG, Lucide-style line icons) ---------- */
  var ICONS = {
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    lifebuoy: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    arrowup: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
  };

  function icon(name) {
    return '<svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      (ICONS[name] || "") + "</svg>";
  }

  // Fill every <span data-icon="name"> with its SVG
  function initIcons(root) {
    $$("[data-icon]", root).forEach(function (el) { el.innerHTML = icon(el.getAttribute("data-icon")); });
  }

  /* ---------- 2. Rendering from data ---------- */
  function tag(track, label) {
    return '<span class="tag tag--' + track + '">' + (label || D.tracks[track]) + "</span>";
  }

  function renderStats() {
    $("#stats").innerHTML = D.stats.map(function (s) {
      return '<div class="card stat reveal"><span class="stat__value">' + s.value + '</span>' +
        '<span class="stat__label">' + s.label + '</span><span class="tag tag--sample">Sample</span></div>';
    }).join("");
  }

  function renderHighlights() {
    $("#highlights-grid").innerHTML = D.highlights.map(function (h) {
      return '<article class="card tile tile--' + h.size + ' card--' + h.track + ' reveal">' +
        '<div><span class="tile__icon">' + icon(h.icon) + "</span><h3>" + h.title + "</h3><p>" + h.text + "</p></div>" +
        tag(h.track) + "</article>";
    }).join("");
  }

  function renderSpeakers() {
    $("#speakers-grid").innerHTML = D.speakers.map(function (s) {
      return '<article class="card speaker card--' + s.track + ' reveal">' +
        '<span class="speaker__avatar" aria-hidden="true">' + s.initials + "</span>" +
        "<h3>" + s.name + "</h3>" +
        '<p class="speaker__role">' + s.role + "</p>" +
        tag(s.track, s.topic) +
        '<span class="tag tag--sample">Sample</span>' +
        '<p class="speaker__bio" id="bio-' + s.id + '">' + s.bio + "</p>" +
        '<button class="speaker__btn" type="button" aria-expanded="false" aria-controls="bio-' + s.id + '">Read bio</button>' +
        "</article>";
    }).join("");
  }

  function renderWorkshops() {
    $("#workshops-grid").innerHTML = D.workshops.map(function (w) {
      return '<article class="card card--workshops reveal">' +
        tag("workshops") + ' <span class="tag tag--level">' + w.level + "</span>" +
        '<h3 style="margin-top:16px">' + w.title + "</h3>" +
        '<ul class="workshop__list">' +
        "<li><strong>Prerequisites:</strong> " + w.prerequisites + "</li>" +
        "<li><strong>Duration:</strong> " + w.duration + "</li>" +
        "<li><strong>Seats:</strong> " + w.seats + "</li></ul>" +
        '<span class="tag tag--sample">Sample</span></article>';
    }).join("");
  }

  function renderHackathon() {
    var h = D.hackathon;
    $("#hackathon-info").innerHTML =
      '<article class="card card--hackathon"><h3>Tracks</h3><ul>' +
      h.tracks.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></article>" +
      '<article class="card card--hackathon"><h3>Rules summary</h3><p>' + h.rules + "</p></article>" +
      '<article class="card card--hackathon"><h3>Team, judging and prizes</h3><p>' + h.team + "</p><p>" + h.judging + "</p></article>";

    $("#timeline").innerHTML = h.phases.map(function (p, i) {
      return "<li><h3>" + (i + 1) + ". " + p.title + "</h3><p>" + p.text + "</p></li>";
    }).join("");
  }

  function renderSponsors() {
    $("#sponsors").innerHTML = D.sponsors.map(function (tier) {
      var boxes = "";
      for (var i = 0; i < tier.count; i++) { boxes += '<div class="logo-box">Your logo here</div>'; }
      return '<div class="sponsors__tier reveal"><h3>' + tier.tier + '</h3><div class="sponsors__row">' + boxes + "</div></div>";
    }).join("");
  }

  function renderFaq() {
    $("#faq-list").innerHTML = D.faq.map(function (item, i) {
      return '<div class="faq__item reveal">' +
        '<h3 class="faq__q"><button class="faq__btn" type="button" id="faq-btn-' + i + '" aria-expanded="false" aria-controls="faq-panel-' + i + '">' +
        "<span>" + item.q + "</span>" + icon("chevron") + "</button></h3>" +
        '<div class="faq__panel" id="faq-panel-' + i + '" role="region" aria-labelledby="faq-btn-' + i + '">' +
        '<div class="faq__inner"><p>' + item.a + "</p></div></div></div>";
    }).join("");
  }

  /* ---------- 3. Navigation ---------- */
  var menuBtn, menuPanel, navEl;

  function setMenu(open) {
    menuPanel.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("no-scroll", open);
    if (open) { $("a", menuPanel).focus(); }
  }

  function isMenuOpen() { return menuPanel.classList.contains("is-open"); }

  function initMenu() {
    navEl = $("#nav");
    menuBtn = $("#menu-btn");
    menuPanel = $("#site-nav");

    menuBtn.addEventListener("click", function () {
      var open = !isMenuOpen();
      setMenu(open);
      if (!open) { menuBtn.focus(); }
    });

    // Tapping empty space in the open panel closes it
    menuPanel.addEventListener("click", function (e) {
      if (e.target === menuPanel || e.target.tagName === "UL") { setMenu(false); menuBtn.focus(); }
    });

    // If the window grows to desktop width, make sure the mobile menu is reset
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (e) {
      if (e.matches && isMenuOpen()) { setMenu(false); }
    });
  }

  // Highlight the nav link of the section currently in view
  function initActiveLink() {
    var links = $$(".nav__link");
    var sections = ["home", "about", "schedule", "speakers", "tracks", "faq", "venue"]
      .map(function (id) { return document.getElementById(id); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (link) {
          var match = link.getAttribute("href") === "#" + entry.target.id;
          if (match) { link.setAttribute("aria-current", "location"); }
          else { link.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    sections.forEach(function (s) { if (s) { observer.observe(s); } });
  }

  /* ---------- 4. Smooth scroll and scroll reveal ---------- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) { return; }
      var id = link.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) { return; }
      e.preventDefault();

      if (isMenuOpen()) { setMenu(false); }
      if ($("#drawer").classList.contains("is-open")) { closeDrawer(true); }

      var navHeight = navEl.offsetHeight;
      var top = id === "home" ? 0 : target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });

      if (history.pushState) { history.pushState(null, "", "#" + id); }
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  }

  var revealObserver = null;
  function observeReveal(root) {
    $$(".reveal", root).forEach(function (el) {
      if (reduceMotion || !revealObserver) { el.classList.add("is-visible"); return; }
      revealObserver.observe(el);
    });
  }

  function initReveal() {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    observeReveal(document);
  }

  /* ---------- 5. Tabs (used by the schedule days and workshops/hackathon) ---------- */
  function initTabs(tablist, onSelect) {
    var tabs = $$('[role="tab"]', tablist);

    function select(tab, moveFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      if (moveFocus) { tab.focus(); }
      onSelect(tab);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") { next = tabs[(i + 1) % tabs.length]; }
        else if (e.key === "ArrowLeft") { next = tabs[(i - 1 + tabs.length) % tabs.length]; }
        else if (e.key === "Home") { next = tabs[0]; }
        else if (e.key === "End") { next = tabs[tabs.length - 1]; }
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  function replayFade(el) {
    el.classList.remove("fade-in");
    void el.offsetWidth; // restart the animation
    el.classList.add("fade-in");
  }

  function initTrackTabs() {
    var panels = { workshops: $("#panel-workshops"), hackathon: $("#panel-hackathon") };
    initTabs($("#tracks-tabs"), function (tab) {
      var key = tab.id.replace("tab-", "");
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== key; });
      replayFade(panels[key]);
    });
  }

  /* ---------- 6. Schedule and filters ---------- */
  var scheduleState = { day: D.days[0].id, filter: "all" };
  var FILTERS = [
    { id: "all", label: "All" },
    { id: "talks", label: "Talks" },
    { id: "workshops", label: "Workshops" },
    { id: "hackathon", label: "Hackathon" }
  ];

  function dayLabel(dayId) {
    var found = D.days.filter(function (d) { return d.id === dayId; })[0];
    return found ? found.label : "";
  }

  function sessionHtml(s) {
    return '<article class="session reveal" data-id="' + s.id + '">' +
      '<div class="session__time"><span>' + s.start + " – " + s.end + "</span></div>" +
      '<div class="card session__card card--' + s.track + '">' +
      '<div class="session__meta">' + tag(s.track) +
      '<span class="tag tag--level">' + s.level + "</span>" +
      '<span class="tag tag--clash" data-clash hidden>Clash</span>' +
      '<span class="tag tag--sample">Sample</span></div>' +
      "<h3>" + s.title + "</h3>" +
      '<p class="session__info">' + icon("clock") + "<span>" + s.duration + "</span></p>" +
      '<button class="btn btn--secondary btn--sm" type="button" data-add="' + s.id + '" aria-pressed="false">Add to my day</button>' +
      "</div></article>";
  }

  function renderSchedule(announce) {
    var panel = $("#schedule-panel");
    var list = D.sessions.filter(function (s) {
      return s.day === scheduleState.day && (scheduleState.filter === "all" || s.track === scheduleState.filter);
    });

    panel.setAttribute("aria-labelledby", "tab-" + scheduleState.day);
    panel.innerHTML = list.length
      ? list.map(sessionHtml).join("")
      : '<p class="empty">No sessions match this filter. Try another track.</p>';

    observeReveal(panel);
    updatePlannerUI();

    if (announce) {
      $("#schedule-live").textContent = list.length + (list.length === 1 ? " session shown" : " sessions shown");
    }
  }

  function initSchedule() {
    $("#day-tabs").innerHTML = D.days.map(function (d, i) {
      return '<button class="tab" type="button" role="tab" id="tab-' + d.id + '" aria-selected="' + (i === 0) +
        '" aria-controls="schedule-panel" tabindex="' + (i === 0 ? 0 : -1) + '" data-day="' + d.id + '">' + d.label + "</button>";
    }).join("");

    $("#filter-chips").innerHTML = FILTERS.map(function (f) {
      return '<button class="chip-btn" type="button" data-filter="' + f.id + '" aria-pressed="' + (f.id === "all") + '">' + f.label + "</button>";
    }).join("");

    initTabs($("#day-tabs"), function (tab) {
      scheduleState.day = tab.getAttribute("data-day");
      renderSchedule(true);
      replayFade($("#schedule-panel"));
    });

    $("#filter-chips").addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filter]");
      if (!chip) { return; }
      scheduleState.filter = chip.getAttribute("data-filter");
      $$("[data-filter]").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      renderSchedule(true);
    });

    // One listener handles every "Add to my day" button
    $("#schedule-panel").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add]");
      if (btn) { togglePick(btn.getAttribute("data-add")); }
    });

    renderSchedule(false);
  }

  /* ---------- 7. My Fest Day planner (the standout feature) ---------- */
  var picks = loadPicks(); // a Set of session ids
  var lastFocus = null;

  function loadPicks() {
    var valid = D.sessions.map(function (s) { return s.id; });
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return new Set(saved.filter(function (id) { return valid.indexOf(id) !== -1; }));
    } catch (err) {
      return new Set(); // storage unavailable: the planner still works for this visit
    }
  }

  function savePicks() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(picks))); } catch (err) { /* ignore */ }
  }

  function sessionById(id) {
    return D.sessions.filter(function (s) { return s.id === id; })[0];
  }

  // Picked sessions sorted by day then start time
  function sortedPicks() {
    return Array.from(picks).map(sessionById).filter(Boolean).sort(function (a, b) {
      if (a.day !== b.day) { return a.day < b.day ? -1 : 1; }
      return toMinutes(a.start) - toMinutes(b.start);
    });
  }

  // Returns a Set of ids whose times overlap with another picked session on the same day
  function findClashes() {
    var items = sortedPicks();
    var clashes = new Set();
    for (var i = 0; i < items.length; i++) {
      for (var j = i + 1; j < items.length; j++) {
        var a = items[i], b = items[j];
        if (a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)) {
          clashes.add(a.id);
          clashes.add(b.id);
        }
      }
    }
    return clashes;
  }

  function togglePick(id) {
    if (picks.has(id)) { picks.delete(id); } else { picks.add(id); }
    savePicks();
    updatePlannerUI();
  }

  function updatePlannerUI() {
    var clashes = findClashes();

    // Schedule cards
    $$("[data-add]").forEach(function (btn) {
      var on = picks.has(btn.getAttribute("data-add"));
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Added" : "Add to my day";
      btn.classList.toggle("is-added", on);
    });
    $$(".session").forEach(function (card) {
      var flag = $("[data-clash]", card);
      if (flag) { flag.hidden = !clashes.has(card.getAttribute("data-id")); }
    });

    // Floating button count
    var count = picks.size;
    var badge = $("#myday-count");
    badge.textContent = count;
    badge.setAttribute("aria-label", count + (count === 1 ? " session" : " sessions"));

    renderDrawer(clashes);
    updatePass();
  }

  function renderDrawer(clashes) {
    var items = sortedPicks();
    $("#drawer-empty").hidden = items.length > 0;
    $("#drawer-clash").hidden = clashes.size === 0;
    $("#drawer-list").innerHTML = items.map(function (s) {
      return '<li class="mini"><div>' +
        '<p class="mini__time">' + dayLabel(s.day) + " · " + s.start + " – " + s.end + "</p>" +
        '<p class="mini__title">' + s.title + "</p>" +
        (clashes.has(s.id) ? '<span class="tag tag--clash">Clash</span>' : tag(s.track)) +
        "</div>" +
        '<button class="icon-btn" type="button" data-remove="' + s.id + '" aria-label="Remove ' + s.title + ' from my day">' + icon("x") + "</button></li>";
    }).join("");
  }

  var drawerEl, backdropEl, dayBtn;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawerEl.classList.add("is-open");
    backdropEl.classList.add("is-open");
    document.body.classList.add("no-scroll");
    $("#drawer-close").focus();
  }

  function closeDrawer(skipFocus) {
    drawerEl.classList.remove("is-open");
    backdropEl.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (!skipFocus) { (lastFocus || dayBtn).focus(); }
  }

  function initPlanner() {
    drawerEl = $("#drawer");
    backdropEl = $("#backdrop");
    dayBtn = $("#myday-btn");

    dayBtn.addEventListener("click", openDrawer);
    $("#drawer-close").addEventListener("click", function () { closeDrawer(); });
    backdropEl.addEventListener("click", function () { closeDrawer(); });

    // Remove a session from inside the drawer, then keep focus somewhere sensible
    $("#drawer-list").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove]");
      if (!btn) { return; }
      togglePick(btn.getAttribute("data-remove"));
      var next = $("#drawer-list [data-remove]");
      (next || $("#drawer-empty-link")).focus();
    });

    // Keep Tab inside the drawer while it is open
    drawerEl.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") { return; }
      var focusable = $$("a[href], button:not([disabled])", drawerEl);
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 8. Registration form and live pass ---------- */
  var form, submitting = false, forceError = false;

  // Which element shows aria-invalid and which one gets focus for each field
  function fieldEl(key) {
    switch (key) {
      case "name": return $("#f-name");
      case "email": return $("#f-email");
      case "org": return $("#f-org");
      case "role": return $("#f-role");
      case "interests": return $("#fs-interests");
      case "consent": return $("#f-consent");
    }
  }

  function firstFocusTarget(key) {
    return key === "interests" ? $('input[name="interests"]', form) : fieldEl(key);
  }

  // Returns an error message, or "" when the field is valid
  function errorFor(key) {
    switch (key) {
      case "name":
        return $("#f-name").value.trim().length >= 2 ? "" : "Please enter your full name (at least 2 characters).";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#f-email").value.trim()) ? "" : "Please enter a valid email address.";
      case "org":
        return $("#f-org").value.trim() ? "" : "Please enter your college or organization.";
      case "role":
        return $("#f-role").value ? "" : "Please choose a role.";
      case "interests":
        return $$('input[name="interests"]:checked', form).length ? "" : "Choose at least one interest.";
      case "consent":
        return $("#f-consent").checked ? "" : "Please tick the box to continue.";
    }
    return "";
  }

  function validateField(key) {
    var message = errorFor(key);
    var el = fieldEl(key);
    $("#err-" + key).textContent = message;
    if (message) { el.setAttribute("aria-invalid", "true"); } else { el.removeAttribute("aria-invalid"); }
    return message === "";
  }

  var FIELD_KEYS = ["name", "email", "org", "role", "interests", "consent"];

  // Validates everything; returns the first invalid element (or null)
  function validateAll() {
    var firstBad = null;
    FIELD_KEYS.forEach(function (key) {
      if (!validateField(key) && !firstBad) { firstBad = firstFocusTarget(key); }
    });
    return firstBad;
  }

  function keyFromTarget(el) {
    switch (el.id) {
      case "f-name": return "name";
      case "f-email": return "email";
      case "f-org": return "org";
      case "f-role": return "role";
      case "f-consent": return "consent";
    }
    return el.name === "interests" ? "interests" : null;
  }

  function updatePass() {
    var name = $("#f-name").value.trim();
    var role = $("#f-role").value;
    var items = sortedPicks();

    // textContent is used for anything the visitor types (safe from HTML injection)
    $("#pass-name").textContent = name || "Your name";
    $("#pass-role").textContent = role ? "Role: " + role : "Role: not selected";
    $("#pass-count").textContent = items.length;

    var list = $("#pass-list");
    list.textContent = "";
    if (!items.length) {
      var empty = document.createElement("li");
      empty.className = "muted";
      empty.textContent = "No sessions added yet.";
      list.appendChild(empty);
      return;
    }
    items.slice(0, 3).forEach(function (s) {
      var li = document.createElement("li");
      li.textContent = s.start + " · " + s.title;
      list.appendChild(li);
    });
    if (items.length > 3) {
      var more = document.createElement("li");
      more.className = "muted";
      more.textContent = "+" + (items.length - 3) + " more";
      list.appendChild(more);
    }
  }

  function setLoading(loading) {
    var btn = $("#submit-btn");
    btn.disabled = loading;
    btn.classList.toggle("is-loading", loading);
    $(".btn__label", btn).textContent = loading ? "Submitting" : "Submit registration";
  }

  // Demo only: waits a moment, then shows success (or the demo error)
  function sendRegistration() {
    submitting = true;
    $("#form-error").hidden = true;
    setLoading(true);
    setTimeout(function () {
      submitting = false;
      setLoading(false);
      if (forceError) {
        forceError = false;
        $("#form-error").hidden = false;
        $("#retry-btn").focus();
      } else {
        showSuccess();
      }
    }, 1200);
  }

  function showSuccess() {
    var name = $("#f-name").value.trim();
    $("#success-text").textContent = "Thanks, " + name + ". This was a demo registration, so nothing was sent or stored.";
    form.hidden = true;
    $("#form-success").hidden = false;
    $("#pass").classList.add("is-issued");
    $("#pass-status").hidden = false;
    $("#form-success").focus();
  }

  function summaryText() {
    var lines = [
      "GDG Fest (demo pass, sample content)",
      "Name: " + $("#f-name").value.trim(),
      "Role: " + $("#f-role").value,
      "Sessions: " + (sortedPicks().map(function (s) { return dayLabel(s.day) + " " + s.start + " " + s.title; }).join("; ") || "none yet"),
      "Note: This is a demo. Nothing was registered."
    ];
    return lines.join("\n");
  }

  function copySummary() {
    var text = summaryText();
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      document.body.removeChild(area);
      toast(ok ? "Summary copied." : "Could not copy. Select the pass text instead.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Summary copied."); }, fallback);
    } else {
      fallback();
    }
  }

  function resetForm() {
    form.reset();
    FIELD_KEYS.forEach(function (key) {
      $("#err-" + key).textContent = "";
      fieldEl(key).removeAttribute("aria-invalid");
    });
    form.hidden = false;
    $("#form-success").hidden = true;
    $("#form-error").hidden = true;
    $("#pass").classList.remove("is-issued");
    $("#pass-status").hidden = true;
    updatePass();
    $("#f-name").focus();
  }

  function initForm() {
    form = $("#reg-form");

    // Validate text fields when the visitor leaves them
    form.addEventListener("focusout", function (e) {
      var key = keyFromTarget(e.target);
      if (key && key !== "interests" && key !== "consent") { validateField(key); }
    });

    // Checkboxes and the select validate when they change
    form.addEventListener("change", function (e) {
      var key = keyFromTarget(e.target);
      if (key) { validateField(key); }
      updatePass();
    });

    // While typing, clear an old error as soon as the value becomes valid, and keep the pass live
    form.addEventListener("input", function (e) {
      var key = keyFromTarget(e.target);
      if (key && e.target.getAttribute("aria-invalid") === "true") { validateField(key); }
      updatePass();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitting) { return; }
      var firstBad = validateAll();
      if (firstBad) { firstBad.focus(); return; }
      sendRegistration();
    });

    $("#retry-btn").addEventListener("click", function () { if (!submitting) { sendRegistration(); } });
    $("#print-btn").addEventListener("click", function () { window.print(); });
    $("#copy-btn").addEventListener("click", copySummary);
    $("#again-btn").addEventListener("click", resetForm);

    // Footer link: the next submit shows the demo error state
    $("#demo-error-link").addEventListener("click", function () {
      forceError = true;
      toast("Demo: the next submit will show the error state.");
    });

    updatePass();
  }

  /* ---------- 9. FAQ, speakers, back to top, countdown ---------- */
  function initFaq() {
    $("#faq-list").addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__btn");
      if (!btn) { return; }
      var willOpen = btn.getAttribute("aria-expanded") !== "true";

      // One panel open at a time
      $$(".faq__btn").forEach(function (b) {
        b.setAttribute("aria-expanded", "false");
        document.getElementById(b.getAttribute("aria-controls")).classList.remove("is-open");
      });
      if (willOpen) {
        btn.setAttribute("aria-expanded", "true");
        document.getElementById(btn.getAttribute("aria-controls")).classList.add("is-open");
      }
    });
  }

  function initSpeakers() {
    $("#speakers-grid").addEventListener("click", function (e) {
      var btn = e.target.closest(".speaker__btn");
      if (!btn) { return; }
      var card = btn.closest(".speaker");
      var willOpen = !card.classList.contains("is-open");

      // One bio open at a time (helps on touch screens)
      $$(".speaker.is-open").forEach(function (c) {
        c.classList.remove("is-open");
        $(".speaker__btn", c).setAttribute("aria-expanded", "false");
        $(".speaker__btn", c).textContent = "Read bio";
      });
      if (willOpen) {
        card.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Hide bio";
      }
    });
  }

  // Back to top + nav border, using one lightweight scroll handler
  function initScrollEffects() {
    var backTop = $("#backtop");
    var ticking = false;

    function update() {
      var y = window.scrollY;
      navEl.classList.toggle("is-scrolled", y > 8);
      backTop.classList.toggle("is-visible", y > 600);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      $("#home").setAttribute("tabindex", "-1");
      $("#home").focus({ preventScroll: true });
    });

    update();
  }

  // Stays dormant until EVENT_DATE (in data.js) is set
  function initCountdown() {
    var chip = $("#chip-date");
    if (!EVENT_DATE) { return; }
    var target = new Date(EVENT_DATE).getTime();
    if (isNaN(target)) { return; }

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) { chip.textContent = "The festival has ended"; return false; }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff / 3600000) % 24;
      var m = Math.floor(diff / 60000) % 60;
      var s = Math.floor(diff / 1000) % 60;
      chip.textContent = "Starts in " + d + "d " + h + "h " + m + "m " + s + "s";
      return true;
    }
    if (tick()) {
      var timer = setInterval(function () { if (!tick()) { clearInterval(timer); } }, 1000);
    }
  }

  /* ---------- 10. Start-up ---------- */
  function init() {
    renderStats();
    renderHighlights();
    renderSpeakers();
    renderWorkshops();
    renderHackathon();
    renderSponsors();
    renderFaq();
    initIcons(document);

    initMenu();
    initSmoothScroll();
    initReveal();
    initActiveLink();
    initTrackTabs();
    initSchedule();
    initPlanner();
    initForm();
    initFaq();
    initSpeakers();
    initScrollEffects();
    initCountdown();

    // Show saved picks right away
    updatePlannerUI();

    // Escape closes whichever overlay is open
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") { return; }
      if (drawerEl.classList.contains("is-open")) { closeDrawer(); }
      else if (isMenuOpen()) { setMenu(false); menuBtn.focus(); }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();