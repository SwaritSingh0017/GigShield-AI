// GLOBAL STATE
const stats = { workers: 0, payouts: 0, claims: 0, cities: new Set() };

let adminRegistered    = false;
let adminNameStored    = 'Admin';
let adminCompanyStored = 'Your Company';

// Worker session
let payoutCounted = false, workerPayoutTotal = 0, workerClaimsCount = 0;
let currentWorkerCity = 'Mumbai', currentWorkerName = 'Rajesh Kumar';
let currentWorkerPlan = 'Standard', currentPayoutAmt = 0;
let avgIncome = 0, actualIncome = 0, lossAmt = 0, lossPct = 0, planMaxCov = 0;

const COVERAGE_RATIO = 0.77;

// 'register' = came from new registration, 'dashboard' = came from existing dashboard
let plansBackDestination = 'register';

// Stores registered accounts as "name|phone" keys to detect duplicates
const registeredWorkers = new Map();
const registeredAdmins  = new Map();

// HELPERS
function fmt(n) {
  return Math.round(n).toLocaleString('en-IN');
}

function liveDateStr() {
  const now    = new Date();
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getFullYear();
}

function nextDueStr() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return d.getDate() + ' ' + months[d.getMonth()];
}

function switchScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}


// refreshAdminKPIs — called every time stats change
function refreshAdminKPIs() {
  const aw = document.getElementById('a-c-workers');
  const ap = document.getElementById('a-c-policies');
  const ay = document.getElementById('a-c-payouts');
  if (aw) aw.textContent = stats.workers;
  if (ap) ap.textContent = stats.workers;
  if (ay) ay.textContent = 'Rs ' + stats.payouts.toLocaleString('en-IN');
}

function renderStats() {
  document.getElementById('c-workers').textContent = stats.workers.toLocaleString('en-IN');
  document.getElementById('c-payouts').textContent = 'Rs ' + stats.payouts.toLocaleString('en-IN');
  document.getElementById('c-claims').textContent  = stats.claims.toLocaleString('en-IN');
  document.getElementById('c-cities').textContent  = stats.cities.size;
  refreshAdminKPIs();
}

// WORKER: shared setup logic used by both Register and Login
function setupWorkerDashboard(name, city, platform, upi, isNewRegistration) {
  const factor  = 0.30 + Math.random() * 0.40;
  actualIncome  = Math.round(avgIncome * factor);
  lossAmt       = avgIncome - actualIncome;
  lossPct       = Math.round((lossAmt / avgIncome) * 100);

  const weeklyEarn = (avgIncome * 5) + actualIncome;

  currentWorkerCity  = city;
  currentWorkerName  = name;
  payoutCounted      = false;
  workerPayoutTotal  = 0;
  workerClaimsCount  = 0;
  currentPayoutAmt   = 0;

  const parts    = name.split(' ');
  const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);

  document.getElementById('dash-name').textContent     = parts[0];
  document.getElementById('dash-fullname').textContent = name;
  document.getElementById('dash-avatar').textContent   = initials;
  document.getElementById('dash-platform').textContent = platform;
  document.getElementById('payout-upi').textContent    = upi;
  document.getElementById('dash-date-line').innerHTML  = liveDateStr() + ' — ' + city + ', IN';
  document.getElementById('dash-next-due').textContent = nextDueStr();

  document.getElementById('dash-today-earn').textContent  = 'Rs ' + fmt(actualIncome);
  document.getElementById('dash-weekly-earn').textContent = 'Rs ' + fmt(weeklyEarn);
  document.getElementById('dash-today-trend').textContent = '↓ ' + lossPct + '% from average';
  document.getElementById('dash-today-trend').style.visibility  = 'visible';
  document.getElementById('dash-weekly-trend').style.visibility = 'visible';
  document.getElementById('dash-total-payout').textContent = 'Rs 0';
  document.getElementById('dash-claims-sub').textContent   = '0 claims this month';
  document.getElementById('dash-plan-badge').textContent   = 'No Plan Selected';
  document.getElementById('dash-premium').innerHTML =
    'Rs —<span style="font-size:0.85rem;color:var(--text3)">/week</span>';

  document.getElementById('ai-loss-pct').textContent   = lossPct + '%';
  document.getElementById('ai-expected').textContent   = 'Rs ' + fmt(avgIncome);
  document.getElementById('ai-actual').textContent     = 'Rs ' + fmt(actualIncome);
  document.getElementById('ai-payout-est').textContent = 'Rs — (choose a plan first)';
  document.getElementById('alert-banner-text').textContent =
    'AI predicts ' + lossPct + '% income loss today (Rs ' + fmt(lossAmt) + '). Select a plan to see your payout.';

  const now = new Date();
  document.getElementById('pr-transfer-time').textContent =
    'Today · ' + now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · 6:00 PM';

  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = now.getFullYear();
  document.getElementById('pr-txn').textContent =
    'TXN: GSH-' + yy + '-' + mm + '-' + dd + '-' + Math.floor(10000 + Math.random() * 89999) +
    ' · Verified by GigShield AI Engine v2.1 · Ref: IMD-' + city.substring(0, 3).toUpperCase() + '-RAIN-' + dd + mm;

  if (isNewRegistration) {
    stats.workers++;
    stats.cities.add(city);
    renderStats();
  }
}

// WORKER REGISTRATION
function registerWorker() {
  const name   = document.getElementById('w-name').value.trim();
  const phone  = document.getElementById('w-phone').value.trim();
  const city   = document.getElementById('w-city').value    || 'Mumbai';
  const plat   = document.getElementById('w-platform').value || 'Swiggy';
  const rawAvg = parseFloat(document.getElementById('w-avg-income').value);
  const upi    = document.getElementById('w-upi').value.trim() || 'rajesh@upi';
  const errEl  = document.getElementById('w-reg-error');

  if (!name || !phone || isNaN(rawAvg) || rawAvg < 100) {
    errEl.textContent = 'Please enter your Name, Phone and a valid Daily Income (min Rs 100).';
    errEl.classList.add('show');
    return;
  }

  const dupKey = name.toLowerCase() + '|' + phone;
  if (registeredWorkers.has(dupKey)) {
    errEl.textContent = 'An account with this Name and Phone already exists. Please use Login instead.';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  registeredWorkers.set(dupKey, { name, phone, city, plat, upi, avgIncome: rawAvg });

  avgIncome = rawAvg;
  plansBackDestination = 'register';

  setupWorkerDashboard(name, city, plat, upi, true);
  showToast('OK', 'Account Created!', 'Swagatam ' + name.split(' ')[0] + '! Now choose your plan.');
  setTimeout(() => switchScreen('screen-plans'), 500);
}

// WORKER LOGIN
function workerLogin() {
  const name   = document.getElementById('wl-name').value.trim();
  const phone  = document.getElementById('wl-phone').value.trim();
  const city   = document.getElementById('wl-city').value    || 'Mumbai';
  const plat   = document.getElementById('wl-platform').value || 'Swiggy';
  const rawAvg = parseFloat(document.getElementById('wl-avg-income').value);
  const upi    = document.getElementById('wl-upi').value.trim() || 'rajesh@upi';
  const errEl  = document.getElementById('wl-error');

  if (!name || !phone || isNaN(rawAvg) || rawAvg < 100) {
    errEl.textContent = 'Please enter your Name, Phone and Daily Average Income (min Rs 100).';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  avgIncome = rawAvg;
  plansBackDestination = 'dashboard';

  setupWorkerDashboard(name, city, plat, upi, false);
  showToast('OK', 'Welcome Back!', 'Swagatam ' + name.split(' ')[0] + '! Your dashboard is ready.');
  setTimeout(() => switchScreen('screen-plans'), 500);
}

// ADMIN REGISTRATION
function registerAdmin() {
  const company = document.getElementById('a-company').value.trim();
  const name    = document.getElementById('a-name').value.trim();
  const city    = document.getElementById('a-city').value || 'Mumbai';
  const errEl   = document.getElementById('a-reg-error');

  if (!company || !name) {
    errEl.textContent = 'Please enter both Company Name and Admin Name.';
    errEl.classList.add('show');
    return;
  }

  const dupKey = name.toLowerCase() + '|' + company.toLowerCase();
  if (registeredAdmins.has(dupKey)) {
    errEl.textContent = 'An admin account for this Name and Company already exists. Please use Login instead.';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  registeredAdmins.set(dupKey, { name, company, city });

  adminRegistered    = true;
  adminNameStored    = name;
  adminCompanyStored = company;

  populateAdminDashboard(name, company, city);
  showToast('NEW', 'Admin Account Created!', 'Swagatam ' + name.split(' ')[0] + '! Your dashboard is ready.');
  setTimeout(() => switchScreen('screen-admin-dashboard'), 500);
}

// ADMIN LOGIN
function adminLogin() {
  const company = document.getElementById('al-company').value.trim();
  const name    = document.getElementById('al-name').value.trim();
  const email   = document.getElementById('al-email').value.trim();
  const phone   = document.getElementById('al-phone').value.trim();
  const city    = document.getElementById('al-city').value || 'Mumbai';
  const errEl   = document.getElementById('al-error');

  if (!company || !name || !email || !phone) {
    errEl.textContent = 'Please fill in all fields — Company, Name, Email and Phone.';
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');

  adminRegistered    = true;
  adminNameStored    = name;
  adminCompanyStored = company;

  populateAdminDashboard(name, company, city);
  showToast('OK', 'Welcome Back!', 'Swagatam ' + name.split(' ')[0] + '! Dashboard loaded.');
  setTimeout(() => switchScreen('screen-admin-dashboard'), 500);
}

// Populate admin dashboard UI (shared by register + login)
function populateAdminDashboard(name, company, city) {
  const parts    = name.split(' ');
  const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);

  document.getElementById('admin-name').textContent      = parts[0];
  document.getElementById('admin-fullname').textContent  = name;
  document.getElementById('admin-company').textContent   = company;
  document.getElementById('admin-city-disp').textContent = city;
  document.getElementById('admin-avatar').textContent    = initials;
  document.getElementById('admin-date-line').textContent = liveDateStr();

  refreshAdminKPIs();
}

// Plans back button — context-aware navigation
function goBackFromPlans() {
  if (plansBackDestination === 'register') {
    switchScreen('screen-worker-register');
  } else {
    switchScreen('screen-dashboard');
  }
}

// PLAN SELECTION
function selectPlan(name, price, coverage) {
  currentWorkerPlan = name;
  planMaxCov        = parseInt(coverage);

  const rawPayout  = lossAmt * COVERAGE_RATIO;
  currentPayoutAmt = Math.round(Math.min(rawPayout, planMaxCov));

  const isCapped = rawPayout > planMaxCov;
  const capNote  = isCapped
    ? ' (capped at plan max Rs ' + fmt(planMaxCov) + ')'
    : ' (77% of Rs ' + fmt(lossAmt) + ' loss)';

  document.getElementById('dash-plan-badge').textContent = name + ' Plan';
  document.getElementById('dash-premium').innerHTML =
    'Rs ' + price + '<span style="font-size:0.85rem;color:var(--text3)">/week</span>';
  document.getElementById('ai-payout-est').textContent =
    'Rs ' + fmt(currentPayoutAmt) + capNote;
  document.getElementById('alert-banner-text').textContent =
    'AI predicts ' + lossPct + '% income loss today. ' + name +
    ' plan → payout of Rs ' + fmt(currentPayoutAmt) + ' at 6 PM.';
  document.getElementById('payout-plan-detail').textContent =
    name + ' Shield · Max Rs ' + coverage;

  updatePayoutScreen();
  plansBackDestination = 'dashboard';
  showToast('ON', name + ' Plan Activated!',
    '77% of Rs ' + fmt(lossAmt) + ' loss = Rs ' + fmt(currentPayoutAmt) + ' payout.');
  setTimeout(() => switchScreen('screen-dashboard'), 600);
}

// PAYOUT
function updatePayoutScreen() {
  const safe = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  safe('pr-payout-big', fmt(currentPayoutAmt));
  safe('pr-expected',   'Rs ' + fmt(avgIncome));
  safe('pr-actual',     'Rs ' + fmt(actualIncome));
  safe('pr-loss',       lossPct + '% (Rs ' + fmt(lossAmt) + ')');
  safe('pr-payout',     'Rs ' + fmt(currentPayoutAmt));
}

function triggerPayout() {
  updatePayoutScreen();
  if (!payoutCounted) {
    payoutCounted = true;
    stats.payouts += currentPayoutAmt;
    stats.claims++;
    renderStats();

    workerPayoutTotal += currentPayoutAmt;
    workerClaimsCount++;
    document.getElementById('dash-total-payout').textContent = 'Rs ' + fmt(workerPayoutTotal);
    document.getElementById('dash-claims-sub').textContent =
      workerClaimsCount + ' claim' + (workerClaimsCount > 1 ? 's' : '') + ' this month';

    addAdminPayoutRow(currentWorkerName, currentWorkerCity, currentWorkerPlan, currentPayoutAmt);
  }
  setTimeout(() => showToast('PAY', 'Payout Triggered!',
    'Rs ' + fmt(currentPayoutAmt) + ' will be credited to your UPI by 6 PM.'), 800);
}

function addAdminPayoutRow(name, city, plan, amount) {
  const list  = document.getElementById('admin-payout-list');
  const empty = document.getElementById('admin-empty-msg');
  if (!list) return;
  if (empty) empty.style.display = 'none';

  const row = document.createElement('div');
  row.className = 'payout-row';
  row.innerHTML = `
    <div class="payout-icon">RAIN</div>
    <div class="payout-info">
      <h5>${name}</h5>
      <p>${city} · Heavy Rain · ${plan} Plan · ${liveDateStr()}</p>
    </div>
    <div class="payout-right">
      <div class="amt">Rs ${fmt(amount)}</div>
      <div class="status">PAID</div>
    </div>`;
  list.insertBefore(row, list.firstChild);
}

// TOAST
function showToast(icon, title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('t-icon').textContent  = icon;
  document.getElementById('t-title').textContent = title;
  document.getElementById('t-msg').textContent   = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

// INIT
window.addEventListener('load', () => { renderStats(); });
