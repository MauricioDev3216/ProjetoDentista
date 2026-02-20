/**
 * SORRISO PERFEITO — script.js
 * Funcionalidades:
 *  1. Scroll reveal animation
 *  2. Header shrink on scroll
 *  3. Smooth scroll (já feito via CSS, aqui offset para header fixo)
 *  4. Menu mobile toggle
 *  5. Validação do formulário de contato
 */

// ==========================================
// 1. SCROLL REVEAL
// ==========================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Não precisamos mais observar após revelar
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

// Adiciona delay escalonado para cards em grade
document.querySelectorAll('.reveal').forEach((el, index) => {
  // Cards de grade recebem delay progressivo
  const isGridItem =
    el.classList.contains('servico-card') ||
    el.classList.contains('depoimento-card') ||
    el.classList.contains('galeria-item');

  if (isGridItem) {
    // Calculamos o índice dentro do grupo
    el.style.transitionDelay = `${(index % 6) * 0.08}s`;
  }

  revealObserver.observe(el);
});

// ==========================================
// 2. HEADER — shadow ao rolar
// ==========================================
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ==========================================
// 3. SMOOTH SCROLL COM OFFSET DO HEADER FIXO
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerHeight = header.offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });

    // Fechar menu mobile após clicar
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ==========================================
// 4. MENU MOBILE TOGGLE
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  // Animar as barras do hambúrguer
  const spans = menuToggle.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Fechar menu ao clicar fora
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// ==========================================
// 5. VALIDAÇÃO DO FORMULÁRIO DE CONTATO
// ==========================================
const form = document.getElementById('contatoForm');
const formSuccess = document.getElementById('formSuccess');

/**
 * Valida um campo e exibe/esconde a mensagem de erro.
 * @param {HTMLElement} field - O elemento input/textarea
 * @param {HTMLElement} errorEl - O elemento span de erro
 * @param {Function} validatorFn - Função que retorna true se válido
 * @returns {boolean}
 */
function validateField(field, errorEl, validatorFn) {
  const isValid = validatorFn(field.value.trim());
  if (isValid) {
    field.classList.remove('invalid');
    errorEl.classList.remove('show');
  } else {
    field.classList.add('invalid');
    errorEl.classList.add('show');
  }
  return isValid;
}

/**
 * Valida formato de e-mail básico.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validação em tempo real (ao sair do campo)
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const mensagemInput = document.getElementById('mensagem');
const nomeError = document.getElementById('nomeError');
const emailError = document.getElementById('emailError');
const mensagemError = document.getElementById('mensagemError');

nomeInput.addEventListener('blur', () => {
  validateField(nomeInput, nomeError, (v) => v.length >= 3);
});

emailInput.addEventListener('blur', () => {
  validateField(emailInput, emailError, isValidEmail);
});

mensagemInput.addEventListener('blur', () => {
  validateField(mensagemInput, mensagemError, (v) => v.length >= 10);
});

// Submissão do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Valida todos os campos obrigatórios
  const nomeValido = validateField(nomeInput, nomeError, (v) => v.length >= 3);
  const emailValido = validateField(emailInput, emailError, isValidEmail);
  const mensagemValida = validateField(mensagemInput, mensagemError, (v) => v.length >= 10);

  if (!nomeValido || !emailValido || !mensagemValida) {
    // Rola para o primeiro campo inválido
    const firstInvalid = form.querySelector('.invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    return;
  }

  // Simula envio (em produção, aqui entraria o fetch para o PHP)
  const submitBtn = form.querySelector('.btn-form');
  submitBtn.textContent = 'Enviando...';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Sucesso
    formSuccess.style.display = 'block';
    form.reset();
    submitBtn.textContent = 'Enviar Mensagem';
    submitBtn.disabled = false;

    // Esconde a mensagem de sucesso após 6 segundos
    setTimeout(() => {
      formSuccess.style.display = 'none';
    }, 6000);
  }, 1000);
});

// ==========================================
// 6. ANIMAÇÃO DE ENTRADA NA PÁGINA
// ==========================================
// Garante que o hero aparece mesmo antes do scroll
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    setTimeout(() => el.classList.add('visible'), 100);
  });
});