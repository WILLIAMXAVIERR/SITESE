(function () {
  const wrapper = document.querySelector('.carousel-wrapper');
  const carousel = document.querySelector('.carousel');
  const carouselCards = document.querySelector('.carousel-cards');
  let cards = Array.from(document.querySelectorAll('.card-separado'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!carousel || !carouselCards || cards.length === 0 || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let cardsPerView = 2;
  let cardStepPx = 0;

  function computeCardsPerView() {
    return window.innerWidth <= 768 ? 1 : 2;
  }

  function getCardTotalWidth(cardEl) {
    const style = window.getComputedStyle(cardEl);
    const marginL = parseFloat(style.marginLeft) || 0;
    const marginR = parseFloat(style.marginRight) || 0;
    return cardEl.getBoundingClientRect().width + marginL + marginR;
  }

  function recalc() {
    cardsPerView = computeCardsPerView();
    if (cardsPerView < 1) cardsPerView = 1;

    cards = Array.from(document.querySelectorAll('.card-separado'));
    const referenceCard = cards[0];
    const cardTotalWidth = getCardTotalWidth(referenceCard);
    cardStepPx = cardTotalWidth * cardsPerView;

    // Normaliza currentIndex para múltiplos de cardsPerView
    currentIndex = currentIndex % cards.length;

    update();
  }

  function update() {
    const oneCardWidth = getCardTotalWidth(cards[0]);
    const translateX = -(oneCardWidth * currentIndex);
    carouselCards.style.transition = 'transform 0.45s ease';
    carouselCards.style.transform = `translateX(${translateX}px)`;
  }

  function goNext() {
    currentIndex += cardsPerView;
    if (currentIndex >= cards.length) currentIndex = 0; // loop infinito
    update();
  }

  function goPrev() {
    currentIndex -= cardsPerView;
    if (currentIndex < 0) currentIndex = Math.max(0, cards.length - cardsPerView); // loop infinito
    update();
  }

  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goNext();
  });

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goPrev();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => recalc(), 110);
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
      if (!dragging || !ev.touches || ev.touches.length === 0) return;
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

// transicao 

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      const targetPosition = target.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 2000; // tempo total da rolagem (ms)
      let start = null;

      function animation(currentTime) {
        if (start === null) start = currentTime;
        const progress = currentTime - start;
        const ratio = Math.min(progress / duration, 1); // vai de 0 até 1
        window.scrollTo(0, startPosition + distance * ratio); // movimento linear
        if (progress < duration) requestAnimationFrame(animation);
      }

      requestAnimationFrame(animation);
    });
  });