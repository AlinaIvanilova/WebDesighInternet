document.addEventListener('DOMContentLoaded', () => {
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

    const actionBtn = document.getElementById('actionBtn');
    const secondaryBtn = document.getElementById('secondaryActionBtn');

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

    const cardsGrid = document.getElementById('cardsGrid');
    const loader = document.getElementById('loader');

    function renderCards(dataArray) {
        if (!cardsGrid) return;
        cardsGrid.innerHTML = '';

        dataArray.forEach(item => {
            const cardHTML = `
                <div class="card" data-category="${item.category}">
                    <img src="${item.image}" alt="${item.title}" class="card__img" loading="lazy">
                    <div class="card__body">
                        <h3 class="card__title">${escapeHtml(item.title)}</h3>
                        <p class="card__desc">${escapeHtml(item.description)}</p>
                        <div class="card__footer">
                            <button class="like-btn" data-liked="false">
                                <i class="far fa-heart"></i>
                                <span class="like-count">${item.likes}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
            return c;
        });
    }

    function showError(message) {
        if (!cardsGrid) return;
        cardsGrid.innerHTML = `<div class="error-message">⚠️ ${message}</div>`;
    }

    async function loadAndRender() {
        if (loader) loader.style.display = 'flex';
        if (cardsGrid) cardsGrid.innerHTML = ''; // очищаємо попередні дані

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
            filterCards('all');
            const filterBtns = document.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => btn.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');

        } catch (error) {
            console.error('Помилка завантаження:', error);
            showError('Вибачте, дані тимчасово недоступні. Спробуйте оновити сторінку.');
        } finally {
            if (loader) loader.style.display = 'none';
            refreshFilterListener();
        }
    }

    function filterCards(category) {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
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

    if (cardsGrid) {
        cardsGrid.addEventListener('click', (e) => {
            const likeBtn = e.target.closest('.like-btn');
            if (!likeBtn) return;

            const icon = likeBtn.querySelector('i');
            const countSpan = likeBtn.querySelector('.like-count');
            if (!icon || !countSpan) return;

            const isLiked = likeBtn.classList.contains('liked');
            if (isLiked) {
                likeBtn.classList.remove('liked');
                likeBtn.setAttribute('data-liked', 'false');
                icon.classList.remove('fas');
                icon.classList.add('far');
                let current = parseInt(countSpan.innerText, 10) || 0;
                countSpan.innerText = Math.max(0, current - 1);
            } else {
                likeBtn.classList.add('liked');
                likeBtn.setAttribute('data-liked', 'true');
                icon.classList.remove('far');
                icon.classList.add('fas');
                let current = parseInt(countSpan.innerText, 10) || 0;
                countSpan.innerText = current + 1;
            }

            icon.style.transform = 'scale(1.3)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 150);
        });
    }

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

    loadAndRender();
});