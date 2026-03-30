document.addEventListener('DOMContentLoaded', () => {
    // БУРГЕР-МЕНЮ (Повноекранне, блокування скролу) ==========
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.querySelector('.mobile-menu__close');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');

    function toggleMenu(open) {
        if (open === undefined) {
            mobileMenu.classList.toggle('open');
        } else if (open) {
            mobileMenu.classList.add('open');
        } else {
            mobileMenu.classList.remove('open');
        }

        const isOpen = mobileMenu.classList.contains('open');
        if (isOpen) {
            document.body.classList.add('no-scroll');
            if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'true');
        } else {
            document.body.classList.remove('no-scroll');
            if (burgerBtn) burgerBtn.setAttribute('aria-expanded', 'false');
        }
    }

    if (burgerBtn) {
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            toggleMenu(false);
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    e.preventDefault();
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
            toggleMenu(false);
        }
    });

    // Анімована кнопка дії + завантаження / блокування ==========
    const actionBtn = document.getElementById('actionBtn');
    const secondaryBtn = document.getElementById('secondaryActionBtn');

    function simulateLoading(button) {
        if (!button) return;
        if (button.disabled) return;

        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.style.cursor = 'wait';

        button.innerHTML = `
            <i class="fas fa-spinner fa-pulse"></i>
            <span class="btn__text">Обробка...</span>
        `;

        setTimeout(() => {
            button.disabled = false;
            button.style.cursor = 'pointer';
            button.innerHTML = originalHTML;
            const fakeMessage = document.createElement('span');
            fakeMessage.textContent = ' ✓ Заявка прийнята!';
            fakeMessage.style.fontSize = '0.85rem';
            fakeMessage.style.marginLeft = '12px';
            fakeMessage.style.color = '#2e7d32';
            button.parentNode?.appendChild(fakeMessage);
            setTimeout(() => fakeMessage.remove(), 2000);
        }, 1500);
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            simulateLoading(actionBtn);
        });
    }
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            simulateLoading(secondaryBtn);
        });
    }

    // ЛАЙКИ НА КАРТКАХ – ВИПРАВЛЕНО: перемикаємо класи іконки
    const likeButtons = document.querySelectorAll('.like-btn');

    likeButtons.forEach(btn => {
        const icon = btn.querySelector('i');
        const countSpan = btn.querySelector('.like-count');

        function updateIcon(liked) {
            if (!icon) return;
            if (liked) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }

        // Встановлюємо початковий стан із data-liked
        const isLikedInitially = btn.getAttribute('data-liked') === 'true';
        if (isLikedInitially) {
            btn.classList.add('liked');
            updateIcon(true);
        } else {
            updateIcon(false);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('liked');
            const nowLiked = btn.classList.contains('liked');
            btn.setAttribute('data-liked', nowLiked ? 'true' : 'false');

            updateIcon(nowLiked);

            if (countSpan) {
                let currentCount = parseInt(countSpan.innerText, 10) || 0;
                if (nowLiked) {
                    currentCount += 1;
                } else {
                    currentCount = Math.max(0, currentCount - 1);
                }
                countSpan.innerText = currentCount;
            }

            if (icon) {
                icon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    icon.style.transform = '';
                }, 150);
            }
        });
    });

    // ДИНАМІЧНА ФІЛЬТРАЦІЯ КАРТОК ==========
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.card');

    function filterCards(category) {
        allCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            filterCards(filterValue);
        });
    });

    filterCards('all');

    // Плавний скрол для якірних посилань
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    allAnchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    if (mobileMenu.classList.contains('open')) {
                        toggleMenu(false);
                    }
                }
            }
        });
    });

    console.log('Практична робота 3: лайки виправлено, іконка перемикається між far і fas');
});