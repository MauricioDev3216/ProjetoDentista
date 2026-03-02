/* =============================================
   SORRISO PERFEITO — script.js
   1. Dark/Light Mode
   2. Scroll Reveal
   3. Header scroll
   4. Menu mobile
   5. Smooth scroll
   6. API ViaCEP — busca de endereço por CEP

   7. API OpenWeatherMap — previsão do tempo
   8. Validação do formulário
   ============================================= */

// ============================================
// ⚙️ CONFIGURAÇÃO — coloque sua chave aqui
// ============================================
const OPENWEATHER_KEY = 'SUA_CHAVE_AQUI'; 
const WEATHER_CITY    = 'São Paulo';

// ============================================
// 1. DARK / LIGHT MODE
// ============================================
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const THEME_KEY    = 'sorrisoperfeito-theme';

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

// Carrega tema salvo ou preferência do sistema
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
  applyTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ============================================
// 2. SCROLL REVEAL
// ============================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  const isCard = el.classList.contains('servico-card') ||
                 el.classList.contains('depoimento-card') ||
                 el.classList.contains('galeria-item');
  if (isCard) el.style.transitionDelay = `${(i % 6) * 0.08}s`;
  revealObserver.observe(el);
});

// Hero visível imediatamente
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    setTimeout(() => el.classList.add('visible'), 80);
  });
});

// ============================================
// 3. HEADER — sombra ao rolar
// ============================================
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ============================================
// 4. MENU MOBILE
// ============================================
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  const [s1, s2, s3] = menuToggle.querySelectorAll('span');
  if (isOpen) {
    s1.style.transform = 'rotate(45deg) translate(5px,5px)';
    s2.style.opacity   = '0';
    s3.style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    s1.style.transform = s2.style.opacity = s3.style.transform = '';
    s2.style.opacity = '1';
  }
});
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    navLinks.classList.remove('open');
    menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// ============================================
// 5. SMOOTH SCROLL com offset do header fixo
// ============================================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - header.offsetHeight, behavior: 'smooth' });
    navLinks.classList.remove('open');
  });
});

// ============================================
// 6. API ViaCEP — preenchimento automático
// ============================================
const cepInput      = document.getElementById('cep');
const cepStatus     = document.getElementById('cepStatus');
const cepError      = document.getElementById('cepError');

// Campos preenchidos automaticamente
const fields = {
  logradouro: document.getElementById('logradouro'),
  bairro:     document.getElementById('bairro'),
  cidade:     document.getElementById('cidade'),
  estado:     document.getElementById('estado'),
};

function formatCEP(value) {
  return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}

function clearAddressFields() {
  Object.values(fields).forEach(f => { f.value = ''; f.style.background = ''; });
}

async function fetchCEP(cep) {
  const raw = cep.replace(/\D/g, '');
  if (raw.length !== 8) return;

  // Status: carregando
  cepStatus.className = 'cep-status loading';
  cepError.classList.remove('show');
  clearAddressFields();

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const data = await res.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    // Preenche campos automaticamente
    fields.logradouro.value = data.logradouro  || '';
    fields.bairro.value     = data.bairro       || '';
    fields.cidade.value     = data.localidade   || '';
    fields.estado.value     = data.uf           || '';

    // Destaca os campos preenchidos
    Object.values(fields).forEach(f => {
      if (f.value) {
        f.style.background = 'rgba(144,190,109,0.08)';
        f.style.borderColor = 'var(--green-dark)';
      }
    });

    cepStatus.className = 'cep-status ok';

    // Foca no campo número
    const numInput = document.getElementById('numero');
    if (numInput) numInput.focus();

  } catch {
    cepStatus.className = 'cep-status err';
    cepError.classList.add('show');
    clearAddressFields();
  }
}

// Formata enquanto digita
cepInput.addEventListener('input', (e) => {
  e.target.value = formatCEP(e.target.value);
  if (e.target.value.replace(/\D/g,'').length < 8) {
    cepStatus.className = 'cep-status';
    cepError.classList.remove('show');
    clearAddressFields();
  }
});

// Busca ao completar 9 chars (00000-000) ou ao sair do campo
cepInput.addEventListener('input', (e) => {
  if (e.target.value.replace(/\D/g,'').length === 8) fetchCEP(e.target.value);
});
cepInput.addEventListener('blur', (e) => {
  if (e.target.value.replace(/\D/g,'').length === 8) fetchCEP(e.target.value);
});

// ============================================
// 7. API OpenWeatherMap — previsão do tempo
// ============================================

// Mapa de condições climáticas → emoji
function getWeatherIcon(weatherId) {
  if (weatherId >= 200 && weatherId < 300) return '⛈️';   // Tempestade
  if (weatherId >= 300 && weatherId < 400) return '🌦️';   // Garoa
  if (weatherId >= 500 && weatherId < 600) return '🌧️';   // Chuva
  if (weatherId >= 600 && weatherId < 700) return '❄️';    // Neve
  if (weatherId >= 700 && weatherId < 800) return '🌫️';   // Névoa/neblina
  if (weatherId === 800)                    return '☀️';    // Céu limpo
  if (weatherId === 801)                    return '🌤️';   // Poucas nuvens
  if (weatherId === 802)                    return '⛅';    // Nuvens dispersas
  if (weatherId >= 803)                     return '☁️';   // Nublado
  return '🌡️';
}

async function fetchWeather() {
  const loadEl   = document.getElementById('weatherLoading');
  const contentEl= document.getElementById('weatherContent');
  const errorEl  = document.getElementById('weatherError');

  // Sem chave configurada
  if (!OPENWEATHER_KEY || OPENWEATHER_KEY === 'SUA_CHAVE_AQUI') {
    loadEl.style.display    = 'none';
    errorEl.style.display   = 'block';
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(WEATHER_CITY)}&appid=${OPENWEATHER_KEY}&lang=pt_br&units=metric`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();

    // Preenche widget
    document.getElementById('weatherCity').textContent    = data.name;
    document.getElementById('weatherTemp').textContent    = `${Math.round(data.main.temp)}°C`;
    document.getElementById('weatherDesc').textContent    = data.weather[0].description;
    document.getElementById('weatherHumidity').textContent= `💧 ${data.main.humidity}%`;
    document.getElementById('weatherWind').textContent    = `💨 ${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('weatherIcon').textContent    = getWeatherIcon(data.weather[0].id);

    loadEl.style.display    = 'none';
    contentEl.style.display = 'block';

  } catch {
    loadEl.style.display  = 'none';
    errorEl.style.display = 'block';
  }
}

// Carrega clima ao iniciar
fetchWeather();
// Atualiza a cada 10 minutos
setInterval(fetchWeather, 10 * 60 * 1000);

// ============================================
// 8. VALIDAÇÃO DO FORMULÁRIO
// ============================================
const form        = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function validateField(field, errorEl, fn) {
  const ok = fn(field.value.trim());
  field.classList.toggle('invalid', !ok);
  errorEl.classList.toggle('show', !ok);
  return ok;
}

// Validação em tempo real ao sair do campo
const nomeInput     = document.getElementById('nome');
const emailInput    = document.getElementById('email');
const mensagemInput = document.getElementById('mensagem');
const nomeError     = document.getElementById('nomeError');
const emailError    = document.getElementById('emailError');
const mensagemError = document.getElementById('mensagemError');

nomeInput.addEventListener('blur', ()     => validateField(nomeInput, nomeError, v => v.length >= 3));
emailInput.addEventListener('blur', ()    => validateField(emailInput, emailError, isValidEmail));
mensagemInput.addEventListener('blur', () => validateField(mensagemInput, mensagemError, v => v.length >= 10));

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nomeOk     = validateField(nomeInput, nomeError, v => v.length >= 3);
  const emailOk    = validateField(emailInput, emailError, isValidEmail);
  const mensagemOk = validateField(mensagemInput, mensagemError, v => v.length >= 10);

  if (!nomeOk || !emailOk || !mensagemOk) {
    form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = form.querySelector('.btn-form');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Simula envio (substituir por fetch ao backend PHP futuramente)
  setTimeout(() => {
    formSuccess.style.display = 'block';
    form.reset();
    cepStatus.className = 'cep-status';
    Object.values(fields).forEach(f => { f.style.background = ''; f.style.borderColor = ''; });
    btn.textContent = 'Enviar Mensagem';
    btn.disabled = false;
    setTimeout(() => { formSuccess.style.display = 'none'; }, 7000);
  }, 1000);
});
