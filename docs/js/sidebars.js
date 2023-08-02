/* global bootstrap: false */
(() => {
    'use strict'
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl)
    })
})();

const htmlMarkup = `
  <div id="sidebar"
  class="col-lg-3 col-3 d-none d-lg-block position-fixed position-lg-relative animate__animated"
  style="bottom:0;left:0;">
  <div class="bg-body-tertiary w-100 position-sticky" style="top: 0; bottom: 0; left: 0">
  <!-- <div class="sidebar-heading border-bottom pb-5">
      JJb foods
  </div>
  <div class="list-group list-group-flush">
      <a href="index.html"
          class="list-group-item list-group-item-action list-group-item-light p-3">Home</a>
      <a href="login.html"
          class="list-group-item list-group-item-action list-group-item-light p-3">Login</a>
      <div href="account.html" class="list-group-item list-group-item-light p-3 active">Account
      </div>
      <div class="list-group list-group-flush">
          <a href="#dashboard"
              class="list-group-item list-group-item-action list-group-item-light ps-5 d-flex align-items-center justify-content-between">
              <span>Dashboard</span>
              <i class="fas fa-link"></i>
          </a>
          <a href="#sales"
              class="list-group-item list-group-item-action list-group-item-light ps-5 d-flex align-items-center justify-content-between">
              <span>Sales</span>
              <i class="fas fa-link"></i>
          </a>
          <a href="#expense"
              class="list-group-item list-group-item-action list-group-item-light ps-5 d-flex align-items-center justify-content-between">
              <span>Expense</span>
              <i class="fas fa-link"></i>
          </a>

      </div>
      <a href="admin.html"
          class="list-group-item list-group-item-action list-group-item-light p-3">Admin</a>
  </div> -->
  <div class="flex-shrink-0 p-3 bg-white w-100" style="width: 280px;">
      <!-- <a href="/"
          class="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom">
          <svg class="bi pe-none me-2" width="30" height="24">
              <use xlink:href="#bootstrap" />
          </svg>
          <span class="fs-5 fw-semibold">JJB Foods API Docs</span>
      </a> -->
      <ul class='nav nav-pill flex-column mb-auto'>
      </ul>
      <ul class="list-unstyled ps-0">
        <li class="mb-2">
          <a href="#" class="nav-link ps-2" onclick="routerLink('index.html')">
            Home
          </a>
        </li>
        <li class="mb-2">
          <a href="#" class="nav-link ps-2" onclick="routerLink('login.html#login')">
            Login
          </a>
        </li>
            
          <li class="mb-1">
              <button
                  class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed"
                  data-bs-toggle="collapse" data-bs-target="#home-collapse" aria-expanded="true">
                  Account
              </button>
              <div class="collapse show" id="home-collapse">
                  <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                      <li><a href="index.html"
                              class="link-dark d-inline-flex text-decoration-none rounded">Dashboard</a>
                      </li>
                      <li><a href="#" onclick="routerLink('account.html#sales')"
                              class="link-dark d-inline-flex text-decoration-none rounded">Sales</a>
                      </li>
                      <li><a href="#" onclick="routerLink('account.html#expenses')"
                              class="link-dark d-inline-flex text-decoration-none rounded">Expenses</a>
                      </li>
                  </ul>
              </div>
          </li>
          <li class="mb-1">
              <button
                  class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed"
                  data-bs-toggle="collapse" data-bs-target="#dashboard-collapse"
                  aria-expanded="false">
                  Dashboard
              </button>
              <div class="collapse" id="dashboard-collapse">
                  <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Overview</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Weekly</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Monthly</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Annually</a>
                      </li>
                  </ul>
              </div>
          </li>
          <li class="mb-1">
              <button
                  class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed"
                  data-bs-toggle="collapse" data-bs-target="#orders-collapse" aria-expanded="false">
                  Orders
              </button>
              <div class="collapse" id="orders-collapse">
                  <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">New</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Processed</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Shipped</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Returned</a>
                      </li>
                  </ul>
              </div>
          </li>
          <li class="border-top my-3"></li>
          <li class="mb-1">
              <button
                  class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed"
                  data-bs-toggle="collapse" data-bs-target="#account-collapse" aria-expanded="false">
                  Account
              </button>
              <div class="collapse" id="account-collapse">
                  <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">New...</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Profile</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Settings</a>
                      </li>
                      <li><a href="#"
                              class="link-dark d-inline-flex text-decoration-none rounded">Sign
                              out</a></li>
                  </ul>
              </div>
          </li>
      </ul>
  </div>
</div>
</div>
  `;
const nav = `<nav class="navbar navbar-expand-lg navbar-light border-bottom bg-body-tertiary w-100">
  <div class="container-fluid justify-content-start">
      <button id="sidebarToggle" class="navbar-toggler me-2">
          <span class="navbar-toggler-icon"></span>
      </button>
      <a href="/" class="navbar-brand">API Docs</a>
  </div>
  <div class="collapse navbar-collapse" id="navbarAltMarkup">
      <ul class="navbar-nav">
          <li class="nav-item">
              <a href="index.html" class="nav-item nav-link">Home</a>
          </li>
          <li class="nav-item">
              <a href="login.html" class="nav-item nav-link">Login</a>
          </li>
          <li class="nav-item">
              <a href="account.html" class="nav-item nav-link active">Account</a>
          </li>
          <li class="nav-item">
              <a href="admin.html" class="nav-item nav-link">Admin</a>
          </li>
      </ul>
  </div>
</nav>`;
$('body').prepend(nav);
$('.row').prepend(htmlMarkup);
let shown = false;
let toggle = $('#sidebarToggle');
let sidebar = $('#sidebar');
console
$(document).ready(() => {
    toggle.on('click', e => {
        e.stopPropagation();
        e.preventDefault();
        slideSidebar(shown);
        shown = !shown;
    });
    sidebar.on('click', e => {
        e.stopPropagation();
        e.preventDefault();
    })
    $(document).on('click', () => {
        if (window.matchMedia("(min-width: 900px)").matches || !shown) return;
        slideSidebar(shown);
        shown = !shown;
    });
})

const slideSidebar = (shown) => {
    if (shown) {
        setTimeout(() => {
            sidebar.addClass('d-none').removeClass('animate__slideOutLeft');
        }, 1000);
        sidebar.addClass('animate__slideOutLeft').removeClass('animate__slideInLeft').removeClass('d-block');

    } else {
        sidebar.addClass('animate__slideInLeft').addClass('d-block').removeClass('d-none').removeClass('animate__slideOutLeft');
    }
}
const routerLink = (link) => {
    console.log(link);
    if (location.href.substring(location.href.lastIndexOf("/") + 1) === link) return;
    location.href = link;
}