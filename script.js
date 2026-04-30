document.addEventListener('DOMContentLoaded', () => {
    // ========== Бургер-меню ==========
    const burgerBtn = document.querySelector('.burger-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenuBtn = document.querySelector('.mobile-menu__close');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');

    function toggleMenu(open) {
        if (open === undefined) {
            mobileMenu.classList.toggle('is-open');
        } else if (open) {
            mobileMenu.classList.add('is-open');
        } else {
            mobileMenu.classList.remove('is-open');
        }

        const isOpen = mobileMenu.classList.contains('is-open');
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
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 767 && mobileMenu.classList.contains('is-open')) {
            toggleMenu(false);
        }
    });

    // ========== Кнопка з анімованим завантаженням ==========
    const actionBtn = document.getElementById('actionBtn');

    function simulateLoading(button) {
        if (!button || button.disabled) return;
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.style.cursor = 'wait';
        button.innerHTML = `<i class="fas fa-spinner fa-pulse"></i><span class="btn__text">Обробка...</span>`;
        setTimeout(() => {
            button.disabled = false;
            button.style.cursor = 'pointer';
            button.innerHTML = originalHTML;
            const msg = document.createElement('span');
            msg.textContent = ' ✓ Заявка прийнята!';
            msg.style.fontSize = '0.85rem';
            msg.style.marginLeft = '12px';
            msg.style.color = 'var(--color-success)';
            button.parentNode?.appendChild(msg);
            setTimeout(() => msg.remove(), 2000);
        }, 1500);
    }

    if (actionBtn) {
        actionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            simulateLoading(actionBtn);
        });
    }

    // ========== Асинхронне завантаження карток ==========
    const cardsGrid = document.getElementById('cardsGrid');
    const loader = document.getElementById('loader');

    // Рендеринг карток
    function renderCards(dataArray) {
        if (!cardsGrid) return;
        cardsGrid.innerHTML = '';
        dataArray.forEach(item => {
            const cardHTML = `
                <article class="card" data-category="${item.category}">
                    <img src="${item.image}" alt="${escapeHtml(item.title)}" class="card__img" loading="lazy">
                    <div class="card__body">
                        <h3 class="card__title">${escapeHtml(item.title)}</h3>
                        <p class="card__desc">${escapeHtml(item.description)}</p>
                        <p class="card__price">${escapeHtml(item.price)}</p>
                        <div class="card__footer">
                            <button class="like-btn" data-liked="false" aria-label="Лайк">
                                <i class="far fa-heart"></i>
                                <span class="like-count">${item.likes}</span>
                            </button>
                        </div>
                    </div>
                </article>
            `;
            cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Екранування HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, (m) => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Головна асинхронна функція (відповідає вимозі async function fetchData())
    async function fetchData() {
        // Показуємо лоадер
        if (loader) loader.style.display = 'block';
        if (cardsGrid) cardsGrid.innerHTML = '';   // очищення контейнера

        try {
            const response = await fetch('data.json');

            if (!response.ok) {
                throw new Error(`HTTP помилка! Статус: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Отримано порожній або некоректний масив даних');
            }

            renderCards(data);
            // Активуємо фільтр "всі"
            filterCards('all');
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(b => b.classList.remove('active'));
            if (allBtn) allBtn.classList.add('active');

        } catch (error) {
            console.error('Помилка завантаження:', error);
            if (cardsGrid) {
                cardsGrid.innerHTML = `<div class="error-message">⚠️ Вибачте, дані тимчасово недоступні. Спробуйте оновити сторінку.</div>`;
            }
        } finally {
            // Ховаємо лоадер у будь-якому разі
            if (loader) loader.style.display = 'none';
            // Поновлюємо слухачі фільтрів (бо кнопки залишились тими ж)
            refreshFilterListener();
        }
    }

    // ========== Фільтрація ==========
    function filterCards(category) {
        document.querySelectorAll('.card').forEach(card => {
            const cat = card.getAttribute('data-category');
            if (category === 'all' || cat === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    function refreshFilterListener() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.removeEventListener('click', handleFilterClick);
            btn.addEventListener('click', handleFilterClick);
        });
    }

    function handleFilterClick(e) {
        const btn = e.currentTarget;
        const filterValue = btn.getAttribute('data-filter');
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(filterValue);
    }

    // Делегування подій для лайків
    if (cardsGrid) {
        cardsGrid.addEventListener('click', (e) => {
            const likeBtn = e.target.closest('.like-btn');
            if (!likeBtn) return;
            const icon = likeBtn.querySelector('i');
            const countSpan = likeBtn.querySelector('.like-count');
            if (!icon || !countSpan) return;

            const isLiked = likeBtn.classList.contains('liked');

            // Використовуємо classList.toggle() для синхронізації стану
            likeBtn.classList.toggle('liked');
            const nowLiked = likeBtn.classList.contains('liked');
            likeBtn.setAttribute('data-liked', nowLiked ? 'true' : 'false');

            // Змінюємо іконку
            if (nowLiked) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }

            // Оновлюємо лічильник
            let currentCount = parseInt(countSpan.innerText, 10) || 0;
            if (nowLiked) {
                currentCount += 1;
            } else {
                currentCount = Math.max(0, currentCount - 1);
            }
            countSpan.innerText = currentCount;

            // Маленька анімація
            icon.style.transform = 'scale(1.3)';
            setTimeout(() => { icon.style.transform = ''; }, 150);
        });
    }

    // ========== Плавний скрол для якірних посилань ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (mobileMenu.classList.contains('is-open')) {
                        toggleMenu(false);
                    }
                }
            }
        });
    });

    // ========== Обробка контактної форми ==========
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (contactForm.checkValidity()) {
                contactForm.style.display = 'none';
                if (formSuccess) formSuccess.style.display = 'block';
            } else {
                contactForm.reportValidity();
            }
        });
    }

    // Запуск завантаження даних
    fetchData();
});