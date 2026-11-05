/* =========================================================
   CIS222 / CIS282 Individual Assignment - e-Portfolio
   "Nelson's Files" - shared JavaScript for every page
   ========================================================= */

// Tell the CSS that JavaScript is working (so items can start hidden
// and drop in). Without JavaScript everything is simply shown.
document.documentElement.classList.add("js");

// came from a tab on the home page: this page's folder swings in
try {
  if (sessionStorage.getItem("swingIn") == "yes") {
    sessionStorage.removeItem("swingIn");
    document.documentElement.classList.add("swing-in");
  }
  // came back to the home page from a file: the folders stack up again
  if (sessionStorage.getItem("stackIn") == "yes") {
    sessionStorage.removeItem("stackIn");
    document.documentElement.classList.add("stack-in");
  }
} catch (e) {
  // storage can be switched off; then the normal opening is used
}

// The order of the files. It is used for the side tabs, the "Next"
// button and the folder that peeks out at the bottom of each page.
var FILES = [
  { href: "index.html",      name: "Home",       color: "#c7a46a", dark: true  },
  { href: "personal.html",   name: "About Me",   color: "#3d5a6c", dark: false },
  { href: "experience.html", name: "Experience", color: "#d9a441", dark: true  },
  { href: "education.html",  name: "Education",  color: "#9c3d2e", dark: false },
  { href: "skills.html",     name: "Skills",     color: "#6b7a3c", dark: false },
  { href: "projects.html",   name: "Projects",   color: "#6b3a4a", dark: false },
  { href: "other.html",      name: "More",       color: "#b8643a", dark: false },
  { href: "sitemap.html",    name: "Site Map",   color: "#8c7b6b", dark: false }
];

function reducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function currentFile() {
  var page = window.location.pathname.split("/").pop() || "index.html";
  for (var i = 0; i < FILES.length; i++) {
    if (FILES[i].href == page) {
      return i;
    }
  }
  return -1;
}

// ---------------------------------------------------------
// 1. Paper / Blueprint theme (saved in sessionStorage)
// ---------------------------------------------------------
function toggleTheme() {
  document.body.classList.toggle("dark");
  var btn = document.getElementById("themeBtn");
  if (document.body.classList.contains("dark")) {
    sessionStorage.setItem("theme", "dark");
    btn.innerHTML = "Paper";
  } else {
    sessionStorage.setItem("theme", "light");
    btn.innerHTML = "Blueprint";
  }
}

function loadTheme() {
  if (sessionStorage.getItem("theme") == "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").innerHTML = "Paper";
  }
}

// ---------------------------------------------------------
// 2. Big title: split into letters so they can appear one by one
// ---------------------------------------------------------
function splitTitle() {
  var h1 = document.querySelector(".hero h1");
  if (!h1) {
    return;
  }
  var text = h1.innerText;
  var html = "";
  for (var i = 0; i < text.length; i++) {
    if (text[i] == " ") {
      html += '<span class="space"></span>';
    } else {
      html += '<span class="ch" style="--n:' + i + '">' + text[i] + "</span>";
    }
  }
  h1.setAttribute("aria-label", text);
  h1.innerHTML = html;
}

// ---------------------------------------------------------
// 3. Smooth (inertia) scrolling for the mouse wheel.
//    The page follows a "target" position. Each frame it moves a
//    part of the way there, so it glides and slows down softly.
//    The amount depends on the time between frames, so it feels
//    the same on 60 Hz and 144 Hz screens.
// ---------------------------------------------------------
var scrollTarget = 0;
var scrollCurrent = 0;
var scrolling = false;
var lastFrame = 0;

function maxScrollY() {
  return document.documentElement.scrollHeight - window.innerHeight;
}

function scrollStep(time) {
  var dt = Math.min((time - lastFrame) / 1000, 0.05);
  lastFrame = time;
  var ease = 1 - Math.exp(-dt * 7.5);
  scrollCurrent = scrollCurrent + (scrollTarget - scrollCurrent) * ease;
  if (Math.abs(scrollTarget - scrollCurrent) < 0.4) {
    scrollCurrent = scrollTarget;
    scrolling = false;
  }
  window.scrollTo(0, scrollCurrent);
  if (scrolling) {
    requestAnimationFrame(scrollStep);
  }
}

function smoothScrollTo(y) {
  if (reducedMotion()) {
    window.scrollTo(0, y);
    return;
  }
  if (!scrolling) {
    scrollCurrent = window.scrollY;
  }
  scrollTarget = Math.max(0, Math.min(y, maxScrollY()));
  if (!scrolling) {
    scrolling = true;
    lastFrame = performance.now();
    requestAnimationFrame(scrollStep);
  }
}

function setupSmoothWheel() {
  if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches) {
    return;   // phones and tablets keep their own smooth scrolling
  }
  window.addEventListener("wheel", function(event) {
    if (event.ctrlKey || event.target.closest("textarea, select")) {
      return;
    }
    event.preventDefault();
    var delta = event.deltaY;
    if (event.deltaMode == 1) {
      delta = delta * 40;
    }
    if (!scrolling) {
      scrollTarget = window.scrollY;
    }
    smoothScrollTo(scrollTarget + delta);
    checkKeepScrolling(delta);
  }, { passive: false });

  // keyboard or scroll bar: follow it
  window.addEventListener("scroll", function() {
    if (!scrolling) {
      scrollTarget = window.scrollY;
      scrollCurrent = window.scrollY;
    }
  }, { passive: true });
}

function backToTop() {
  smoothScrollTo(0);
}

// ---------------------------------------------------------
// 4. Things that happen while scrolling
// ---------------------------------------------------------
function onScroll() {
  var y = window.scrollY;
  var bar = document.querySelector(".topbar");
  if (y > 160) {
    bar.classList.add("solid");
  } else {
    bar.classList.remove("solid");
  }

  var topBtn = document.getElementById("topBtn");
  if (y > 500) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }

  var max = maxScrollY();
  if (max > 0) {
    document.getElementById("progress").style.transform = "scaleX(" + (y / max) + ")";
  }
}

// ---------------------------------------------------------
// 5. Scrapbook items drop in when they come on screen
// ---------------------------------------------------------
function setupReveal() {
  var items = document.querySelectorAll(".scrap");
  for (var i = 0; i < items.length; i++) {
    items[i].style.setProperty("--i", i % 3);
  }
  if (!("IntersectionObserver" in window)) {
    for (var j = 0; j < items.length; j++) {
      items[j].classList.add("in-view");
    }
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].isIntersecting) {
        entries[k].target.classList.add("in-view");
        observer.unobserve(entries[k].target);
      }
    }
  }, { threshold: 0.15 });
  for (var n = 0; n < items.length; n++) {
    observer.observe(items[n]);
  }
}

// ---------------------------------------------------------
// 6. Pick up and drag photos and notes (like a scrapbook)
// ---------------------------------------------------------
function setupDraggable() {
  if (!window.matchMedia("(pointer: fine)").matches) {
    return;   // on touch screens a finger should scroll the page
  }
  var items = document.querySelectorAll(".scrap, .portrait");
  for (var i = 0; i < items.length; i++) {
    makeDraggable(items[i]);
  }
}

function makeDraggable(el) {
  el.classList.add("draggable");
  var imgs = el.getElementsByTagName("img");
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].setAttribute("draggable", "false");
  }
  var startX, startY, baseX = 0, baseY = 0, curX = 0, curY = 0;
  var lastX, lastY, lastT, vx = 0, vy = 0;
  var moved = false, down = false;

  el.addEventListener("pointerdown", function(event) {
    if (event.button != 0 || event.target.closest("button, a, input, select, textarea, audio, label")) {
      return;
    }
    down = true;
    moved = false;
    startX = lastX = event.clientX;
    startY = lastY = event.clientY;
    lastT = performance.now();
    vx = vy = 0;
    el.setPointerCapture(event.pointerId);
  });

  el.addEventListener("pointermove", function(event) {
    if (!down) {
      return;
    }
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 4) {
      moved = true;
      el.classList.add("dragging");
      dragTop = dragTop + 1;
      el.style.zIndex = 40 + dragTop;   // the picked item goes on top
    }
    if (moved) {
      var now = performance.now();
      var dt = Math.max(now - lastT, 1);
      vx = (event.clientX - lastX) / dt;   // pixels per millisecond
      vy = (event.clientY - lastY) / dt;
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
      curX = baseX + dx;
      curY = baseY + dy;
      el.style.translate = curX + "px " + curY + "px";
      // lean in the direction of the movement, like real paper
      el.style.rotate = Math.max(-12, Math.min(12, vx * 6)).toFixed(2) + "deg";
    }
  });

  el.addEventListener("pointerup", function() {
    if (!down) {
      return;
    }
    down = false;
    el.classList.remove("dragging");
    el.style.rotate = "0deg";            // settles back with a spring (CSS)
    if (!moved) {
      return;
    }
    // keep sliding a little after you let go, then slow down
    var speedX = vx * 16, speedY = vy * 16;  // pixels per frame
    function glide() {
      speedX = speedX * 0.9;
      speedY = speedY * 0.9;
      curX = curX + speedX;
      curY = curY + speedY;
      el.style.translate = curX.toFixed(1) + "px " + curY.toFixed(1) + "px";
      if (Math.abs(speedX) + Math.abs(speedY) > 0.3 && !down) {
        requestAnimationFrame(glide);
      } else {
        baseX = curX;
        baseY = curY;
      }
    }
    if (reducedMotion()) {
      baseX = curX;
      baseY = curY;
    } else {
      requestAnimationFrame(glide);
    }
  });
}
var dragTop = 30;

// ---------------------------------------------------------
// 7. Side tabs, the next folder and the "Next" button
// ---------------------------------------------------------
var nextHref = "";
var peekVisible = false;

function buildFolderNavigation() {
  var current = currentFile();
  var folder = document.querySelector(".folder");

  // vertical tabs on the right edge of the folder
  if (folder) {
    var tabs = document.createElement("nav");
    tabs.className = "side-tabs";
    var html = "";
    for (var i = 0; i < FILES.length; i++) {
      var cls = (FILES[i].dark ? "dark-text" : "") + (i == current ? " current" : "");
      html += '<a class="' + cls + '" href="' + FILES[i].href + '" style="--tab:' +
              FILES[i].color + '">' + FILES[i].name + "</a>";
    }
    tabs.innerHTML = html;
    folder.appendChild(tabs);
  }

  if (current == -1) {
    current = 0;   // e.g. the thank you page: next file is About Me
  }
  var next = (current + 1) % FILES.length;
  var file = FILES[next];
  nextHref = file.href;
  var textClass = file.dark ? " dark-text" : "";

  // the next folder peeking out at the bottom of the page
  var stage = document.querySelector(".stage");
  if (stage) {
    var peek = document.createElement("a");
    peek.className = "next-folder" + textClass;
    peek.href = file.href;
    peek.style.backgroundColor = file.color;
    peek.innerHTML = '<span class="kicker">File 0' + next + "</span><h2>" + file.name + "</h2>";
    stage.parentNode.insertBefore(peek, stage.nextSibling);

    if ("IntersectionObserver" in window) {
      var watcher = new IntersectionObserver(function(entries) {
        peekVisible = entries[0].isIntersecting;
        var pill = document.getElementById("nextPill");
        pill.innerHTML = peekVisible ? "Keep scrolling<br>for the next page" : "Next &rarr;";
        document.querySelector(".next-pill").classList.toggle("peek", peekVisible);
      }, { threshold: 0.35 });
      watcher.observe(peek);
    }
  }

  // "Next" button with a preview card
  var box = document.createElement("div");
  box.className = "next-pill";
  box.innerHTML = '<div class="preview' + textClass + '" style="background-color:' + file.color + '">' +
                  file.name + "<small>Nelson's Files &middot; File 0" + next + "</small></div>" +
                  '<a class="pill" id="nextPill" href="' + file.href + '">Next &rarr;</a>';
  document.body.appendChild(box);
}

// At the very bottom, the user stops for a moment and then scrolls
// down a few more times -> the next file opens.
var lastWheel = 0;
var armed = false;
var pushes = 0;
var pushTimer;
var openedAt = Date.now();

function checkKeepScrolling(delta) {
  var now = Date.now();
  var pause = now - lastWheel;
  lastWheel = now;
  var atBottom = window.scrollY >= maxScrollY() - 2;
  if (!nextHref || !peekVisible || !atBottom || delta <= 0 || now - openedAt < 1500) {
    armed = false;
    pushes = 0;
    return;
  }
  if (!armed) {
    if (pause > 450) {
      armed = true;
    }
    return;
  }
  pushes = pushes + 1;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(function() { pushes = 0; armed = false; }, 1200);
  if (pushes >= 3) {
    pushes = 0;
    armed = false;
    goTo(nextHref);
  }
}

// ---------------------------------------------------------
// 8. Page change: the folder closes and drops, then the next opens
// ---------------------------------------------------------
// going back to the home page from a file (like mosbyfiles.com):
// the folder turns back down and away, then the home page stacks up
// home page after coming back: each folder reaches down to the bottom of the
// stack while it comes up, then that is taken away again
function setupStackIn() {
  if (!document.documentElement.classList.contains("stack-in")) {
    return;
  }
  var stack = document.querySelector(".stack");
  if (!stack) {
    document.documentElement.classList.remove("stack-in");
    return;
  }
  var bands = stack.querySelectorAll(".band");
  for (var i = 0; i < bands.length; i++) {
    var below = stack.offsetHeight - (bands[i].offsetTop + bands[i].offsetHeight);
    bands[i].style.setProperty("--ext", Math.max(0, below) + "px");
  }
  // (the class "stack-in" stays, so the opening is not played again)
  setTimeout(function() {
    document.documentElement.classList.add("stack-done");
  }, 1800);
}

function swingOut(href) {
  document.body.classList.add("swing-out");
  setTimeout(function() {
    try {
      sessionStorage.setItem("stackIn", "yes");
    } catch (e) {
      // no storage: the home page uses its normal opening
    }
    window.location.href = href;
  }, 560);
}

function goTo(href) {
  var page = href.split("#")[0].split("?")[0];
  if (page.slice(-10) == "index.html" && document.querySelector(".folder") && !reducedMotion()) {
    swingOut(href);
    return;
  }
  if (reducedMotion() || !document.querySelector(".folder")) {
    if (!document.querySelector(".folder") && !reducedMotion()) {
      document.body.classList.add("leaving");
      setTimeout(function() { window.location.href = href; }, 300);
      return;
    }
    window.location.href = href;
    return;
  }
  // cover closes (250ms), folder drops 150ms later (250ms)
  document.body.classList.add("leaving");
  setTimeout(function() {
    window.location.href = href;
  }, 450);
}

// ---------------------------------------------------------
// Open a folder from the home page (like mosbyfiles.com)
//  0     - 0.6s   the title fades, the folders in front fall away
//  0.6s  - 1.25s  only the picked folder is left (a short pause)
//  1.25s - 1.65s  the folder tips over to the right and falls
//  then the next page opens and its folder swings in (CSS: .swing-in)
// ---------------------------------------------------------
function openFromHome(tab, href) {
  if (document.body.classList.contains("opening")) {
    return;
  }
  var band = tab.closest(".band");
  var bands = Array.prototype.slice.call(document.querySelectorAll(".stack .band"));
  var index = bands.indexOf(band);

  // close any opened folder first (no hover effect while opening)
  for (var i = 0; i < bands.length; i++) {
    bands[i].classList.remove("lift", "lift-main");
    var all = bands[i].querySelectorAll(".ftab");
    for (var t = 0; t < all.length; t++) {
      all[t].classList.remove("stay");
    }
  }
  var footer = document.querySelector(".p-home .footer");
  if (footer) {
    footer.classList.remove("lift");
  }

  // a copy of the picked folder, in the colour of the picked tab, behind
  // everything; it shows when the folders in front of it fall away
  var colour = getComputedStyle(tab).getPropertyValue("--tab").trim();
  var bandPos = pagePos(band);
  var tabPos = pagePos(tab);
  var fly = document.createElement("div");
  fly.className = "fly-folder";
  fly.style.left = (bandPos.x - window.scrollX) + "px";
  fly.style.top = (bandPos.y - window.scrollY) + "px";
  fly.style.width = band.offsetWidth + "px";
  fly.style.height = (window.innerHeight * 1.6) + "px";
  addFlyShape(fly, colour);
  var label = document.createElement("span");
  label.className = "ftab fly-tab" + (tab.classList.contains("dark-text") ? " dark-text" : "");
  label.textContent = tab.textContent;
  label.style.setProperty("--tab", colour);
  label.style.left = (tabPos.x - bandPos.x) + "px";
  fly.appendChild(label);
  document.body.appendChild(fly);
  // start loading the next page now, while the folders move, so the page
  // change does not stop the folder for long
  var early = document.createElement("link");
  early.rel = "prefetch";
  early.href = href;
  document.head.appendChild(early);
  // the copy takes the place of the real tab, so only one is seen
  tab.style.visibility = "hidden";
  // ...but not its back, or the back of the next tab would show for a
  // moment as a line of another colour while the folder falls
  var tabBack = tab.querySelector(".tab-back");
  if (tabBack) {
    tabBack.style.visibility = "visible";
  }

  // the picked folder and the folders in front fall, the ones behind fade
  for (var k = 0; k < bands.length; k++) {
    if (k >= index) {
      bands[k].style.setProperty("--k", k - index);
      bands[k].classList.add("fall");
    } else {
      bands[k].classList.add("fade");
    }
  }
  if (footer) {
    footer.style.setProperty("--k", bands.length - index);
    footer.classList.add("fall");
  }
  document.body.classList.add("opening");

  // like mosbyfiles.com: the folder does not fall, it turns to the right
  // around its top left corner and grows, its paper peeks out, and the
  // next page goes on turning it until it stands upright (tabs on the right)
  // while the other folders fall it leans back a little, so it does not
  // stand dead still (like mosbyfiles.com)
  setTimeout(function() {
    fly.classList.add("lean");
  }, 400);
  setTimeout(function() {
    fly.classList.add("tip");
  }, FLY_TIP_AT);
  setTimeout(function() {
    try {
      sessionStorage.setItem("swingIn", "yes");
      // where the corner of this folder is, so the next page can go on
      // turning its own folder from the same place
      sessionStorage.setItem("flyOut", JSON.stringify({
        left: parseFloat(fly.style.left),
        top: parseFloat(fly.style.top),
        turn: FLY_TURN,
        grow: FLY_GROW
      }));
    } catch (e) {
      // no storage: the next page uses its normal opening
    }
    window.location.href = href;
  // the page change starts a little before the turn ends: this page keeps
  // turning its folder while the next page loads
  }, FLY_TIP_AT + FLY_TIP_TIME - 150);
}

function setupPageTransition() {
  document.addEventListener("click", function(event) {
    var link = event.target.closest("a");
    if (!link) {
      return;
    }
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) == "#" || link.target == "_blank" || link.hasAttribute("download") ||
        href.indexOf("mailto:") == 0 || href.indexOf("http") == 0 || href.indexOf(".html") == -1 ||
        event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    // a link that was just dragged should not open
    var dragged = link.closest(".draggable");
    if (dragged && dragged.style.translate && dragged.dataset.justDragged == "yes") {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    if (link.classList.contains("ftab") && link.closest(".stack") && !reducedMotion()) {
      openFromHome(link, href);
      return;
    }
    goTo(href);
  });

  window.addEventListener("pageshow", function(event) {
    if (event.persisted) {
      document.body.classList.remove("leaving");
      document.body.classList.remove("opening");
      document.body.classList.remove("swing-out");
      var fly = document.querySelector(".fly-folder");
      if (fly) {
        fly.remove();
      }
      var hidden = document.querySelectorAll(".stack .ftab");
      for (var h = 0; h < hidden.length; h++) {
        hidden[h].style.visibility = "";
      }
      var gone = document.querySelectorAll(".band.fall, .band.fade, .footer.fall");
      for (var g = 0; g < gone.length; g++) {
        gone[g].classList.remove("fall", "fade");
      }
    }
  });
}

// ---------------------------------------------------------
// 9. Footer year
// ---------------------------------------------------------
function loadFooter() {
  var el = document.getElementById("year");
  if (el) {
    el.innerHTML = new Date().getFullYear();
  }
}


// ---------------------------------------------------------
// 10. More motion: parallax, tilt, text reveal, throw, magnets
// ---------------------------------------------------------
var motionItems = [];

function setupMotion() {
  if (reducedMotion()) {
    var all = document.querySelectorAll(".rv");
    for (var a = 0; a < all.length; a++) {
      all[a].classList.add("in");
    }
    return;
  }

  // (a) each scrapbook item gets its own depth, so they move at
  //     slightly different speeds while you scroll (parallax)
  var scraps = document.querySelectorAll(".scrap");
  var depths = [0.07, -0.05, 0.11, -0.03, 0.09, -0.06];
  var bigScreen = window.matchMedia("(min-width: 801px)").matches;
  for (var i = 0; bigScreen && i < scraps.length; i++) {
    motionItems.push({ el: scraps[i], depth: depths[i % depths.length] });
  }

  // (b) notes, photos and the portrait lean towards the mouse
  var tiltables = document.querySelectorAll(".scrap .note, .scrap .photo, .portrait img");
  for (var t = 0; t < tiltables.length; t++) {
    addTilt(tiltables[t]);
  }

  // (c) buttons that are pulled towards the mouse
  var magnets = document.querySelectorAll(".pill, .media-btn, .submit-btn, .next-folder h2");
  for (var m = 0; m < magnets.length; m++) {
    addMagnet(magnets[m]);
  }

  requestAnimationFrame(motionLoop);
}

// text on the sheet appears line by line (starts after the cover opens)
// the folder from the home page keeps falling, under the new folder
// the copy of a folder is drawn open, like the folder under the mouse:
// a back (as wide as the folder, with the tab on it) and in front of it
// the front, 12px lower and a little wider (like mosbyfiles.com)
function addFlyShape(fly, colour) {
  fly.style.setProperty("--fly", colour);
  var back = document.createElement("span");
  back.className = "fly-back";
  fly.appendChild(back);
  // the paper inside the folder: it peeks out when the folder turns
  var paper = document.createElement("span");
  paper.className = "fly-paper";
  fly.appendChild(paper);
  var front = document.createElement("span");
  front.className = "fly-front";
  fly.appendChild(front);
}

// how far the folder on the home page turns (degrees) and grows before
// the page changes; must match ".fly-folder.tip" in the CSS
var FLY_TURN = 25;
var FLY_GROW = 1.15;
// when the folder starts turning, and how long it turns (ms); the time
// must match the transition of ".fly-folder.tip" in the CSS
var FLY_TIP_AT = 900;
var FLY_TIP_TIME = 450;

// came from a tab on the home page: this page's folder starts where the
// home page's folder stopped, and goes on turning to the right until it
// stands upright. The top left corner of the folder on the home page is
// the top right corner of this folder (its tabs are on the right side).
function continueFlyOut() {
  if (!document.documentElement.classList.contains("swing-in")) {
    return;
  }
  var data = null;
  try {
    data = JSON.parse(sessionStorage.getItem("flyOut"));
    sessionStorage.removeItem("flyOut");
  } catch (e) {
    data = null;
  }
  var folder = document.querySelector(".folder");
  if (!data || !folder || isNaN(data.left) || isNaN(data.top)) {
    return;
  }
  var pos = pagePos(folder);
  var cornerX = pos.x + folder.offsetWidth - window.scrollX;
  var cornerY = pos.y - window.scrollY;
  folder.style.transformOrigin = "100% 0";
  folder.style.setProperty("--swing-from",
    "translate(" + (data.left - cornerX).toFixed(1) + "px, " + (data.top - cornerY).toFixed(1) + "px) " +
    "rotate(" + (data.turn - 90) + "deg) scale(" + data.grow + ")");
  folder.addEventListener("animationend", function done(event) {
    if (event.target == folder) {
      // back to normal, so going back to the home page turns it as before
      folder.style.transformOrigin = "";
      folder.style.removeProperty("--swing-from");
      folder.removeEventListener("animationend", done);
    }
  });
  // start turning with the first frame that is drawn (not before it, or
  // the start would be skipped; not a frame later, or it stops again)
  folder.style.animationPlayState = "paused";
  requestAnimationFrame(function() {
    folder.style.animationPlayState = "";
  });
}

function setupTextReveal() {
  // the folder swings in already open with its text showing (like
  // mosbyfiles.com), so the text does not appear line by line then
  if (document.documentElement.classList.contains("swing-in")) {
    return;
  }
  var parts = document.querySelectorAll(".sheet .col-right > *, .sheet .facts dt, .sheet .facts dd, .sheet .portrait, .hero-intro");
  for (var i = 0; i < parts.length; i++) {
    parts[i].classList.add("rv");
    parts[i].style.setProperty("--d", i % 6);
  }
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    for (var j = 0; j < parts.length; j++) {
      parts[j].classList.add("in");
    }
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].isIntersecting) {
        entries[k].target.classList.add("in");
        observer.unobserve(entries[k].target);
      }
    }
  }, { threshold: 0.1 });
  // wait for the folder to open first
  var wait = document.querySelector(".cover") ? 1050 : 200;
  setTimeout(function() {
    for (var n = 0; n < parts.length; n++) {
      observer.observe(parts[n]);
    }
  }, wait);
}

function addTilt(el) {
  el.addEventListener("pointermove", function(event) {
    if (event.pointerType == "touch") {
      return;
    }
    var r = el.getBoundingClientRect();
    var x = (event.clientX - r.left) / r.width - 0.5;   // -0.5 ... 0.5
    var y = (event.clientY - r.top) / r.height - 0.5;
    el.classList.add("tilting");
    el.style.setProperty("--ty", (x * 10).toFixed(2) + "deg");
    el.style.setProperty("--tx", (-y * 10).toFixed(2) + "deg");
  });
  el.addEventListener("pointerleave", function() {
    el.classList.remove("tilting");
    el.style.setProperty("--ty", "0deg");
    el.style.setProperty("--tx", "0deg");
  });
}

function addMagnet(el) {
  el.classList.add("magnet");
  el.addEventListener("pointermove", function(event) {
    if (event.pointerType == "touch") {
      return;
    }
    var r = el.getBoundingClientRect();
    var dx = event.clientX - (r.left + r.width / 2);
    var dy = event.clientY - (r.top + r.height / 2);
    el.style.translate = (dx * 0.18).toFixed(1) + "px " + (dy * 0.25).toFixed(1) + "px";
  });
  el.addEventListener("pointerleave", function() {
    el.style.translate = "0px 0px";
  });
}

// one animation loop for everything that follows the scroll position
function motionLoop() {
  var vh = window.innerHeight;
  var y = window.scrollY;

  // parallax of the scrapbook items
  for (var i = 0; i < motionItems.length; i++) {
    var item = motionItems[i];
    var r = item.el.getBoundingClientRect();
    if (r.bottom > -200 && r.top < vh + 200) {
      var fromCentre = (r.top + r.height / 2) - vh / 2;
      item.el.style.setProperty("--py", (-fromCentre * item.depth).toFixed(1) + "px");
    }
  }

  // the big title floats up and fades as you scroll away
  var hero = document.querySelector(".hero");
  if (hero && y < vh) {
    hero.style.transform = "translateY(" + (y * 0.35).toFixed(1) + "px)";
    hero.style.opacity = Math.max(0, 1 - y / (vh * 0.7)).toFixed(3);
  }

  // the next folder rises into place
  var next = document.querySelector(".next-folder");
  if (next) {
    var nr = next.getBoundingClientRect();
    var progress = Math.min(1, Math.max(0, (vh - nr.top) / (vh * 0.6)));
    next.style.setProperty("--rise", ((1 - progress) * 140).toFixed(1) + "px");
  }

  requestAnimationFrame(motionLoop);
}


// ---------------------------------------------------------
// 11. Home: pull a folder out of the stack
//     pointing at a folder lifts it and every folder in front of it
// ---------------------------------------------------------
// where an element is on the page when nothing is moving
// (offsetTop / offsetLeft do not include animations)
function pagePos(el) {
  var x = 0, y = 0;
  while (el) {
    x = x + el.offsetLeft;
    y = y + el.offsetTop;
    el = el.offsetParent;
  }
  return { x: x, y: y };
}

function setupStackHover() {
  var stack = document.querySelector(".stack");
  if (!stack || reducedMotion()) {
    return;
  }
  var bands = stack.querySelectorAll(".band");
  var footer = document.querySelector(".p-home .footer");

  // Every tab and the back of its folder are ONE piece: the back is a
  // child of the tab, as wide as the folder, so they always move together.
  var allTabs = stack.querySelectorAll(".ftab");
  for (var a = 0; a < allTabs.length; a++) {
    var back = document.createElement("span");
    back.className = "tab-back";
    back.setAttribute("aria-hidden", "true");
    allTabs[a].appendChild(back);
  }

  // a tab that is held back shrinks back to the middle of its folder,
  // the opposite of the folder itself, so it stays exactly in place;
  // its back is placed under the whole width of the folder
  // true when the element is not scaled, rotated or skewed
  // (moving up and down is fine, it does not change left or width)
  function noSideScale(el) {
    var tr = getComputedStyle(el).transform;
    if (!tr || tr == "none") {
      return true;
    }
    var m = new DOMMatrixReadOnly(tr);
    return m.is2D && m.a == 1 && m.b == 0 && m.c == 0 && m.d == 1;
  }
  function setOrigins() {
    for (var i = 0; i < bands.length; i++) {
      if (bands[i].classList.contains("lift") || bands[i].classList.contains("lift-main")) {
        continue;
      }
      var row = bands[i].querySelector(".band-tabs");
      var tabs = bands[i].querySelectorAll(".ftab");
      // exact (decimal) sizes, so the back lines up with the folder above.
      // getBoundingClientRect has decimals but includes animations, so it is
      // only used when nothing is stretched sideways; else use offsetLeft.
      var exact = noSideScale(bands[i]) && noSideScale(row);
      var rowBox = row.getBoundingClientRect();
      var rowWidth = exact ? rowBox.width : row.offsetWidth;
      for (var t = 0; t < tabs.length; t++) {
        var left = (exact && noSideScale(tabs[t]))
          ? tabs[t].getBoundingClientRect().left - rowBox.left
          : tabs[t].offsetLeft;
        tabs[t].style.transformOrigin = (rowWidth / 2 - left).toFixed(2) + "px 100%";
        tabs[t].style.setProperty("--sx", (-left).toFixed(2) + "px");
        tabs[t].style.setProperty("--sw", rowWidth.toFixed(2) + "px");
      }
    }
  }
  setOrigins();
  window.addEventListener("resize", setOrigins);
  // the folders also change width when a scroll bar comes or goes
  // (no "resize" event then), so watch the stack itself as well
  if ("ResizeObserver" in window) {
    new ResizeObserver(setOrigins).observe(stack);
  }

  // index = the folder you point at, tab = the tab you point at (or null)
  function lift(index, tab) {
    for (var i = 0; i < bands.length; i++) {
      var band = bands[i];
      band.classList.toggle("lift", index >= 0 && i > index);
      band.classList.toggle("lift-main", index >= 0 && i == index);
      var tabs = band.querySelectorAll(".ftab");
      var picked = (i == index) ? (tab || tabs[0]) : null;
      // the picked tab and the tabs on its right stay on the back;
      // tabs on its left are folders in front of it and go with the front.
      // Each tab carries its own back (one piece), so nothing else moves.
      var beforePicked = picked != null;
      for (var t = 0; t < tabs.length; t++) {
        if (tabs[t] == picked) {
          beforePicked = false;
        }
        tabs[t].classList.toggle("stay", picked != null && !beforePicked);
      }
    }
    if (footer) {
      // the footer leans around the top of the front folder (see CSS)
      var front = bands[bands.length - 1];
      footer.style.setProperty("--ft", (pagePos(footer).y - pagePos(front).y) + "px");
      footer.classList.toggle("lift", index >= 0);
    }
  }

  // Which folder and which tab is the mouse on? This is worked out from
  // where everything is when it is NOT moving (offsetTop / offsetLeft do
  // not include the animation). So when a folder opens and moves under a
  // mouse that stands still, the answer does not change and the folders
  // do not flicker open and closed.

  var current = { index: -1, tab: null };
  var mouse = null;

  function whatIsUnder(px, py) {
    // the folders further down are in front, so test them first
    for (var i = bands.length - 1; i >= 0; i--) {
      var band = bands[i];
      var p = pagePos(band);
      // on the folder itself
      if (px >= p.x && px <= p.x + band.offsetWidth && py >= p.y && py <= p.y + band.offsetHeight) {
        return { index: i, tab: null };
      }
      // on one of its tabs (just above the folder)
      var tabs = band.querySelectorAll(".ftab");
      for (var t = 0; t < tabs.length; t++) {
        var tp = pagePos(tabs[t]);
        if (px >= tp.x && px <= tp.x + tabs[t].offsetWidth && py >= tp.y && py <= p.y) {
          return { index: i, tab: tabs[t] };
        }
      }
    }
    return { index: -1, tab: null };
  }

  function update() {
    if (!mouse || document.body.classList.contains("opening")) {
      return;
    }
    if (footer) {
      // keep the lean point right when a folder has been opened or closed
      footer.style.setProperty("--ft", (pagePos(footer).y - pagePos(bands[bands.length - 1]).y) + "px");
    }
    var hit = whatIsUnder(mouse.x + window.scrollX, mouse.y + window.scrollY);
    if (hit.index != current.index || hit.tab != current.tab) {
      current = hit;
      lift(hit.index, hit.tab);
    }
  }

  document.addEventListener("pointermove", function(event) {
    if (event.pointerType == "touch") {
      return;
    }
    mouse = { x: event.clientX, y: event.clientY };
    update();
  });
  window.addEventListener("scroll", update);
  document.documentElement.addEventListener("pointerleave", function() {
    mouse = null;
    current = { index: -1, tab: null };
    lift(-1, null);
  });
}

// ---------------------------------------------------------
// Start
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  loadTheme();
  splitTitle();
  loadFooter();
  buildFolderNavigation();
  continueFlyOut();
  setupStackIn();
  setupReveal();
  setupTextReveal();
  setupDraggable();
  setupMotion();
  setupStackHover();
  setupPageTransition();
  setupSmoothWheel();
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (typeof pageLoad == "function") {
    pageLoad();
  }
});
