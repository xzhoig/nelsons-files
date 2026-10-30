/* =========================================================
   CIS222 / CIS282 Individual Assignment - e-Portfolio
   Shared JavaScript for every page
   ========================================================= */

// 1. Hamburger menu: show / hide the navigation links on mobile
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

// 2. Paper / Blueprint theme
//    The choice is saved in sessionStorage so that it stays
//    the same when the user goes to another page.
function toggleTheme() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    sessionStorage.setItem("theme", "dark");
    document.getElementById("themeBtn").innerHTML = "Paper mode";
  } else {
    sessionStorage.setItem("theme", "light");
    document.getElementById("themeBtn").innerHTML = "Blueprint mode";
  }
}

function loadTheme() {
  if (sessionStorage.getItem("theme") == "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").innerHTML = "Paper mode";
  }
}

// 3. Back to top button
window.onscroll = function() {
  var topBtn = document.getElementById("topBtn");
  if (document.documentElement.scrollTop > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
};

function backToTop() {
  window.scrollTo(0, 0);
}

// 4. Footer: show the current year and the last visit time
function loadFooter() {
  var today = new Date();
  document.getElementById("year").innerHTML = today.getFullYear();
}

// Run when every page is loaded
window.onload = function() {
  loadTheme();
  loadFooter();
  if (typeof pageLoad == "function") {
    pageLoad();   // extra code for each page (if any)
  }
};
