/* ===================== CARROSSEL ===================== */
(function () {
  const wrapper = document.querySelector('.carousel-wrapper');
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelector('.carousel-cards');
  let cards = Array.from(document.querySelectorAll('.card-separado'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!wrapper || !carousel || !carouselCards || cards.length === 0 || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let cardsPerView = 2;

  const computeCardsPerView = () => (window.innerWidth <= 768 ? 1 : 2);

  function getCardTotalWidth(cardEl) {
    const style = window.getComputedStyle(cardEl);
    const marginL = parseFloat(style.marginLeft) || 0;
    const marginR = parseFloat(style.marginRight) || 0;
    return cardEl.getBoundingClientRect().width + marginL + marginR;
  }

  function update() {
    if (!cards[0]) return;
    const oneCardWidth = getCardTotalWidth(cards[0]);
    const translateX = -(oneCardWidth * currentIndex);
    carouselCards.style.transition = 'transform 0.45s ease';
    carouselCards.style.transform = `translateX(${translateX}px)`;
  }

  function recalc() {
    cardsPerView = Math.max(1, computeCardsPerView());
    cards = Array.from(document.querySelectorAll('.card-separado'));
    currentIndex = currentIndex % Math.max(cards.length, 1);
    update();
  }

  function goNext() {
    currentIndex += cardsPerView;
    if (currentIndex >= cards.length) currentIndex = 0;
    update();
  }

  function goPrev() {
    currentIndex -= cardsPerView;
    if (currentIndex < 0) currentIndex = Math.max(0, cards.length - cardsPerView);
    update();
  }

  nextBtn.addEventListener('click', (e) => { e.preventDefault(); goNext(); });
  prevBtn.addEventListener('click', (e) => { e.preventDefault(); goPrev(); });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(recalc, 110);
  });

  const mo = new MutationObserver(() => {
    cards = Array.from(document.querySelectorAll('.card-separado'));
    recalc();
  });
  mo.observe(carouselCards, { childList: true, subtree: false });

  (function addTouchSupport() {
    let startX = 0, currentX = 0, dragging = false;

    carousel.addEventListener('touchstart', (ev) => {
      if (!ev.touches || ev.touches.length === 0) return;
      startX = ev.touches[0].clientX;
      dragging = true;
      carouselCards.style.transition = '';
    }, { passive: true });

    carousel.addEventListener('touchmove', (ev) => {
      if (!dragging || !ev.touches || ev.touches.length === 0 || !cards[0]) return;
      currentX = ev.touches[0].clientX;
      const delta = currentX - startX;
      const oneCardWidth = getCardTotalWidth(cards[0]);
      const translateXBase = -(oneCardWidth * currentIndex);
      carouselCards.style.transform = `translateX(${translateXBase + delta}px)`;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      const delta = currentX - startX;
      const threshold = 40;
      if (delta < -threshold) goNext();
      else if (delta > threshold) goPrev();
      else update();
      startX = currentX = 0;
    }, { passive: true });
  })();

  recalc();
})();

/* ===================== ROLAGEM SUAVE ===================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800; // ms
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const progress = currentTime - start;
      const ratio = Math.min(progress / duration, 1);
      window.scrollTo(0, startPosition + distance * ratio);
      if (progress < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
  });
});

/* ===================== ENVIO DE E-MAIL (EmailJS, sem abrir app) ===================== */
/*
  Pré-requisitos:
  1) Criar conta em https://www.emailjs.com/
  2) Criar Service (ex.: Gmail) -> obter SERVICE_ID
  3) Criar Template -> obter TEMPLATE_ID
     - No template, coloque variáveis: from_email, subject, message, reply_to, to_email (opcional)
     - Configure o "To" padrão para seu e-mail OU permita "to_email" dinâmico
  4) Pegar PUBLIC_KEY
  5) No HTML você já tem o formulário:
     <form class="form-email">
       <input type="email" placeholder="ENVIE-NOS UM E-MAIL" required />
       <button type="submit"><img src="imagens/email.jpg" alt="Enviar" /></button>
     </form>

(function emailSender() {
  const form = document.querySelector('.form-email');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn  = form.querySelector('button[type="submit"]');

  // >>> SUBSTITUA pelos seus dados do EmailJS <<<
  const PUBLIC_KEY  = 'e6zx2ESlZE4JUzrSL';
  const SERVICE_ID  = 'Sservice_wjjdyap';
  const TEMPLATE_ID = 'template_caqud6w';

  // E-mail que vai receber as mensagens (se o seu template permitir to_email dinâmico)
  const DESTINATION_EMAIL = 'williamrego240604@gmail.com';

  // Carrega EmailJS via CDN se não estiver disponível
  function ensureEmailJSLoaded() {
    return new Promise((resolve, reject) => {
      if (window.emailjs && typeof window.emailjs.init === 'function') {
        return resolve();
      }
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Falha ao carregar EmailJS CDN.'));
      document.head.appendChild(s);
    });
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const userEmail = (emailInput.value || '').trim();
    if (!isValidEmail(userEmail)) {
      alert('Digite um e-mail válido.');
      emailInput.focus();
      return;
    }

    // Desabilita botão durante envio
    const oldDisabled = submitBtn.disabled;
    submitBtn.disabled = true;

    try {
      await ensureEmailJSLoaded();
      // Inicializa (pode chamar mais de uma vez sem problema)
      window.emailjs.init(PUBLIC_KEY);

      // Monte os parâmetros esperados pelo seu TEMPLATE do EmailJS
      const templateParams = {
        from_email: userEmail,                         // e-mail da pessoa
        reply_to: userEmail,                           // "responder para" a pessoa
        subject: 'Dúvidas sobre o home care',          // assunto fixo
        message: 'O usuário solicitou ajuda pelo site.', // corpo (pode enriquecer)
        to_email: DESTINATION_EMAIL                    // se seu template aceitar destinatário dinâmico
      };

      // Envia
      await window.emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);

      alert('✅ Mensagem enviada com sucesso! Vamos retornar no seu e-mail.');
      form.reset();
    } catch (err) {
      console.error('Erro no envio via EmailJS:', err);
      alert('❌ Ocorreu um erro ao enviar. Verifique suas chaves do EmailJS e tente novamente.');
    } finally {
      submitBtn.disabled = oldDisabled;
    }
  }

  form.addEventListener('submit', handleSubmit);
})();
*/