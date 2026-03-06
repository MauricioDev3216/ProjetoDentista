/* =============================================
   SORRISO PERFEITO — script.js 601724a4becb5287f3fb76d8fec6c263
   ============================================= */

const OPENWEATHER_KEY = 'key here';
const WEATHER_CITY    = 'Porto Alegre, RS';

// 1. DARK/LIGHT MODE
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('sp-theme', theme);
}

const saved = localStorage.getItem('sp-theme')
  || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(saved);

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// 2. SCROLL REVEAL
const revealSelectors = [
  '.reveal-up','.reveal-left','.reveal-right',
  '.card-from-left','.card-from-right',
  '.card-from-bottom','.card-from-top'
];
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(revealSelectors.join(',')).forEach(el => {
  const siblings = [...el.parentElement.children].filter(c =>
    revealSelectors.some(s => c.matches(s))
  );
  const idx = siblings.indexOf(el);
  if (idx > 0) el.style.transitionDelay = `${idx * 0.12}s`;
  revealObserver.observe(el);
});

// 3. CONTADOR ANIMADO
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const steps  = 60;
  function ease(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  let step = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(ease(step / steps) * target).toLocaleString('pt-BR') + suffix;
    if (step >= steps) { el.textContent = target.toLocaleString('pt-BR') + suffix; clearInterval(timer); }
  }, 2000 / steps);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('revealed');
    const n = entry.target.querySelector('.stat-number');
    if (n) animateCounter(n);
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stat-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
  statsObserver.observe(card);
});

// 4. HEADER SCROLL
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// 5. MENU MOBILE
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
  const [s1, s2, s3] = menuToggle.querySelectorAll('span');
  s1.style.transform = open ? 'rotate(45deg) translate(5px,5px)'  : '';
  s2.style.opacity   = open ? '0' : '1';
  s3.style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    navLinks.classList.remove('open');
    menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// 6. SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - header.offsetHeight, behavior: 'smooth' });
    navLinks.classList.remove('open');
  });
});

// 7. ViaCEP
const cepInput   = document.getElementById('cep');
const cepStatus  = document.getElementById('cepStatus');
const cepError   = document.getElementById('cepError');
const addrFields = {
  logradouro: document.getElementById('logradouro'),
  bairro:     document.getElementById('bairro'),
  cidade:     document.getElementById('cidade'),
  estado:     document.getElementById('estado'),
};

function formatCEP(v) { return v.replace(/\D/g,'').replace(/^(\d{5})(\d)/,'$1-$2').slice(0,9); }
function clearAddr() {
  Object.values(addrFields).forEach(f => { if(f){ f.value=''; f.style.background=''; f.style.borderColor=''; } });
}

async function fetchCEP(cep) {
  const raw = cep.replace(/\D/g,'');
  if (raw.length !== 8) return;
  cepStatus.className = 'cep-status loading';
  cepError.classList.remove('show');
  clearAddr();
  try {
    const r    = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const data = await r.json();
    if (data.erro) throw new Error();
    addrFields.logradouro.value = data.logradouro || '';
    addrFields.bairro.value     = data.bairro      || '';
    addrFields.cidade.value     = `${data.localidade} / ${data.uf}`;
    if (addrFields.estado) addrFields.estado.value = data.uf || '';
    Object.values(addrFields).forEach(f => {
      if (f && f.value) { f.style.background='rgba(144,190,109,0.07)'; f.style.borderColor='var(--green-dark)'; }
    });
    cepStatus.className = 'cep-status ok';
    document.getElementById('numero')?.focus();
  } catch {
    cepStatus.className = 'cep-status err';
    cepError.classList.add('show');
    clearAddr();
  }
}

cepInput.addEventListener('input', e => {
  e.target.value = formatCEP(e.target.value);
  const raw = e.target.value.replace(/\D/g,'');
  if (raw.length < 8) { cepStatus.className='cep-status'; cepError.classList.remove('show'); clearAddr(); }
  if (raw.length === 8) fetchCEP(e.target.value);
});
cepInput.addEventListener('blur', e => {
  if (e.target.value.replace(/\D/g,'').length === 8) fetchCEP(e.target.value);
});

// 8. OPENWEATHERMAP
function getWeatherIcon(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800)             return '☀️';
  if (id === 801)             return '🌤️';
  if (id === 802)             return '⛅';
  if (id >= 803)              return '☁️';
  return '🌡️';
}

async function fetchWeather() {
  const loadEl    = document.getElementById('weatherLoading');
  const contentEl = document.getElementById('weatherContent');
  const errorEl   = document.getElementById('weatherError');
  if (!OPENWEATHER_KEY || OPENWEATHER_KEY === 'SUA_CHAVE_AQUI') {
    loadEl.style.display = 'none'; errorEl.style.display = 'block'; return;
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(WEATHER_CITY)}&appid=${OPENWEATHER_KEY}&lang=pt_br&units=metric`;
    let res = await fetch(url);
    if (!res.ok) res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error();
    const d = await res.json();
    document.getElementById('weatherCity').textContent     = d.name;
    document.getElementById('weatherTemp').textContent     = `${Math.round(d.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent     = d.weather[0].description;
    document.getElementById('weatherHumidity').textContent = `💧 ${d.main.humidity}%`;
    document.getElementById('weatherWind').textContent     = `💨 ${Math.round(d.wind.speed * 3.6)} km/h`;
    document.getElementById('weatherIcon').textContent     = getWeatherIcon(d.weather[0].id);
    loadEl.style.display = 'none'; contentEl.style.display = 'block';
  } catch {
    loadEl.style.display = 'none'; errorEl.style.display = 'block';
  }
}
fetchWeather();
setInterval(fetchWeather, 10 * 60 * 1000);

// 9. VALIDAÇÃO
const form          = document.getElementById('contatoForm');
const formSuccess   = document.getElementById('formSuccess');
const nomeInput     = document.getElementById('nome');
const emailInput    = document.getElementById('email');
const mensagemInput = document.getElementById('mensagem');

function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validate(field, errId, fn) {
  const ok = fn(field.value.trim());
  field.classList.toggle('invalid', !ok);
  document.getElementById(errId).classList.toggle('show', !ok);
  return ok;
}

nomeInput.addEventListener('blur',     () => validate(nomeInput,     'nomeError',     v => v.length >= 3));
emailInput.addEventListener('blur',    () => validate(emailInput,    'emailError',    isEmail));
mensagemInput.addEventListener('blur', () => validate(mensagemInput, 'mensagemError', v => v.length >= 10));

form.addEventListener('submit', e => {
  e.preventDefault();
  const ok = [
    validate(nomeInput,     'nomeError',     v => v.length >= 3),
    validate(emailInput,    'emailError',    isEmail),
    validate(mensagemInput, 'mensagemError', v => v.length >= 10),
  ].every(Boolean);
  if (!ok) { form.querySelector('.invalid')?.scrollIntoView({ behavior:'smooth', block:'center' }); return; }
  const btn = form.querySelector('.btn-form');
  btn.textContent = 'Enviando...'; btn.disabled = true;
  setTimeout(() => {
    formSuccess.style.display = 'block';
    form.reset(); cepStatus.className = 'cep-status'; clearAddr();
    btn.textContent = 'Enviar Mensagem'; btn.disabled = false;
    setTimeout(() => { formSuccess.style.display = 'none'; }, 7000);
  }, 1000);
});

// 10. MÁSCARA TELEFONE
const telefoneInput = document.getElementById('telefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g,'').slice(0,11);
    if (v.length <= 10) v = v.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2');
    else v = v.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{1})(\d{4})(\d)/,'$1 $2-$3');
    e.target.value = v;
    e.target.classList.toggle('filled', v.length > 0);
  });
}

// 11. VOLTAR AO TOPO
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  backToTop.insertAdjacentHTML('beforeend', `
    <svg class="progress-ring" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26"/>
    </svg>`);
  const ring = backToTop.querySelector('.progress-ring circle');
  const circ = 2 * Math.PI * 26;
  ring.style.strokeDasharray  = circ;
  ring.style.strokeDashoffset = circ;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    backToTop.classList.toggle('visible', window.scrollY > 400);
    ring.style.strokeDashoffset = circ - pct * circ;
  }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

// 12. WHATSAPP — esconde em landscape mobile
const wppFloat = document.querySelector('.whatsapp-float');
function checkWpp() {
  if (!wppFloat) return;
  wppFloat.style.display = (window.innerWidth < 600 && window.innerHeight < 450) ? 'none' : '';
}
window.addEventListener('resize', checkWpp, { passive:true });
checkWpp();

// 13. PWA SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] SW:', reg.scope);
    } catch(e) {
      console.warn('[PWA] SW falhou:', e);
    }
  });
}

// 14. PWA BOTÃO INSTALAR
let installPrompt   = null;
const pwaInstallBtn = document.getElementById('pwaInstallBtn');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  if (pwaInstallBtn) pwaInstallBtn.style.display = 'flex';
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { pwaInstallBtn.style.display = 'none'; installPrompt = null; }
  });
}

window.addEventListener('appinstalled', () => {
  if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
  installPrompt = null;
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
}