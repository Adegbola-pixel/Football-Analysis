document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'football_analysis_saved_articles';

    // Retrieve saved articles array from localStorage
    function getSavedArticles() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to parse saved articles from localStorage', e);
            return [];
        }
    }

    // Save articles array to localStorage
    function saveArticlesToStorage(articles) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        } catch (e) {
            console.error('Failed to save articles to localStorage', e);
        }
    }

    // Check if a specific article ID is currently saved
    function isArticleSaved(id) {
        const saved = getSavedArticles();
        return saved.some(item => item.id === id);
    }

    // Escape values before they go into innerHTML. Titles and descriptions
    // are read out of page markup, so a stray quote or angle bracket would
    // otherwise break the generated card.
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Show dynamic toast notifications
    function showToast(message) {
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                background-color: #1a73e8;
                color: #ffffff;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                font-size: 0.9rem;
                font-weight: 500;
                z-index: 10000;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 2500);
    }

    // -------------------------------------------------------------
    // 0. AUTO-EXTRACT ARTICLE DATA FROM WHICHEVER CARD A BUTTON SITS IN
    //    Works for .news-card, .side-card, .mega-item, .mega-featured,
    //    and .hero-content (where the <img> is a sibling, not a
    //    descendant, of the content wrapper).
    //
    //    Links and images are stored as FULLY RESOLVED urls. The same
    //    article can be bookmarked from the site root or from a page one
    //    level down, and the raw relative paths differ between the two —
    //    resolving them here means saved.html renders both correctly.
    // -------------------------------------------------------------
    function slugFromUrl(url) {
        let file = '';

        try {
            file = new URL(url, window.location.href).pathname.split('/').pop();
        } catch (e) {
            file = String(url || '');
        }

        return file
            .replace(/\.html?$/i, '')
            .replace(/[^a-z0-9]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || 'article-' + Date.now();
    }

    function findCard(button) {
        return button.closest(
            '.news-card, .side-card, .mega-item, .mega-featured, .hero-content, .prediction-card, article'
        );
    }

    function findImage(card) {
        let img = card.querySelector('img');
        if (img) return img;
        // Cards like .hero-content have their <img> as a sibling
        // (both children of .hero-main / .article-hero), not a
        // descendant — check one level up as a fallback.
        if (card.parentElement) {
            img = card.parentElement.querySelector(':scope > img');
        }
        return img;
    }

    function extractArticleData(button) {
        const card = findCard(button);
        if (!card) return null;

        const link = card.querySelector('a[href]');
        // .href / .src give the browser-resolved absolute url, unlike
        // getAttribute() which returns the raw relative string.
        const url = link ? link.href : window.location.href;
        const img = findImage(card);
        const titleEl = card.querySelector('h1, h2, h3, h4');
        const categoryEl = card.querySelector('.category');
        const descEl = card.querySelector('p');

        let categoryClass = '';
        if (categoryEl) {
            categoryClass = Array.from(categoryEl.classList).find(c => c !== 'category') || '';
        }

        return {
            id: button.getAttribute('data-id') || slugFromUrl(url),
            url: url,
            image: img ? img.src : '',
            title: titleEl ? titleEl.textContent.trim() : document.title,
            category: categoryEl ? categoryEl.textContent.trim() : '',
            categoryClass: categoryClass,
            description: descEl ? descEl.textContent.trim() : ''
        };
    }

    // -------------------------------------------------------------
    // 1. GLOBAL TOGGLE FUNCTION (still callable directly if needed)
    // -------------------------------------------------------------
    window.toggleSaveArticle = function (articleData, buttonElement) {
        if (!articleData || !articleData.id) return;

        let savedArticles = getSavedArticles();
        const existingIndex = savedArticles.findIndex(item => item.id === articleData.id);
        const icon = buttonElement ? buttonElement.querySelector('i') : null;

        if (existingIndex > -1) {
            savedArticles.splice(existingIndex, 1);
            saveArticlesToStorage(savedArticles);
            if (icon) icon.className = 'fa-regular fa-bookmark';
            if (buttonElement) {
                buttonElement.classList.remove('is-saved');
                buttonElement.setAttribute('aria-pressed', 'false');
            }
            showToast('Removed from Saved Articles');
        } else {
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            savedArticles.push({ ...articleData, savedDate: today });
            saveArticlesToStorage(savedArticles);
            if (icon) icon.className = 'fa-solid fa-bookmark';
            if (buttonElement) {
                buttonElement.classList.add('is-saved');
                buttonElement.setAttribute('aria-pressed', 'true');
            }
            showToast('Saved to your reading list!');
        }

        // Keep every other bookmark button for this article in step —
        // the same story can appear in a mega-menu and a card on one page.
        syncHubBookmarkButtons();

        if (window.location.pathname.includes('saved.html')) {
            renderSavedArticlesPage();
        }
    };

    // -------------------------------------------------------------
    // 2. WIRE UP EVERY BOOKMARK BUTTON — index, mega-menus, side
    //    cards, hero, article pages — via one delegated listener.
    //    No per-button onclick or data-* attributes required.
    // -------------------------------------------------------------
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.bookmark-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        // saved.html has its own dedicated remove-button handling below
        if (btn.classList.contains('remove-bookmark-btn')) return;

        const data = extractArticleData(btn);
        if (!data) return;

        window.toggleSaveArticle(data, btn);
    });

    // -------------------------------------------------------------
    // 3. AUTO-SYNC BOOKMARK ICONS ON PAGE LOAD
    //    (so a previously-saved article still shows a filled
    //    bookmark icon when you revisit the homepage)
    // -------------------------------------------------------------
    function syncHubBookmarkButtons() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            if (btn.classList.contains('remove-bookmark-btn')) return;

            const data = extractArticleData(btn);
            if (!data) return;

            const icon = btn.querySelector('i');
            if (isArticleSaved(data.id)) {
                btn.classList.add('is-saved');
                btn.setAttribute('aria-pressed', 'true');
                if (icon) icon.className = 'fa-solid fa-bookmark';
            } else {
                btn.classList.remove('is-saved');
                btn.setAttribute('aria-pressed', 'false');
                if (icon) icon.className = 'fa-regular fa-bookmark';
            }
        });
    }

    syncHubBookmarkButtons();

    // -------------------------------------------------------------
    // 4. RENDER SAVED ARTICLES PAGE (`saved.html`)
    // -------------------------------------------------------------
    const savedContainer = document.querySelector('.news-container');
    const sectionTitle = document.querySelector('.section-title');

    if (savedContainer && window.location.pathname.includes('saved.html')) {
        renderSavedArticlesPage();
    }

    function renderSavedArticlesPage() {
        const savedArticles = getSavedArticles();

        if (sectionTitle) {
            sectionTitle.innerHTML = `
                <h2>Saved Articles (${savedArticles.length})</h2>
                ${savedArticles.length > 0 ? '<button type="button" class="clear-all-btn" style="background: none; border: none; cursor: pointer; color: #d9534f; font-size: 0.9rem; font-weight: 500;">Clear All</button>' : ''}
            `;

            const clearBtn = sectionTitle.querySelector('.clear-all-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to remove all saved articles?')) {
                        saveArticlesToStorage([]);
                        renderSavedArticlesPage();
                        syncHubBookmarkButtons();
                        showToast('All bookmarks cleared');
                    }
                });
            }
        }

        if (savedArticles.length === 0) {
            savedContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fa-regular fa-bookmark" style="font-size: 3.5rem; color: #ccc; margin-bottom: 16px;"></i>
                    <h3 style="margin-bottom: 8px; font-size: 1.4rem;">No Saved Articles Yet</h3>
                    <p style="color: #666; margin-bottom: 24px;">Bookmark tactical analyses, match previews, and history stories to read them here later.</p>
                    <a href="../index.html" class="btn" style="display: inline-block; padding: 10px 20px; background: #1a73e8; color: #fff; border-radius: 6px; text-decoration: none;">Explore Articles</a>
                </div>
            `;
            return;
        }

        savedContainer.innerHTML = savedArticles.map(article => `
            <article class="news-card" data-id="${escapeHtml(article.id)}">
                <img src="${escapeHtml(article.image)}" alt="">
                <div class="news-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="category ${escapeHtml(article.categoryClass)}">${escapeHtml(article.category)}</span>
                        <button type="button" class="bookmark-btn remove-bookmark-btn" aria-label="Remove bookmark" style="background: none; border: none; cursor: pointer; padding: 4px;" title="Remove bookmark">
                            <i class="fa-solid fa-bookmark" style="color: #1a73e8; font-size: 1.1rem;"></i>
                        </button>
                    </div>
                    <h3><a href="${escapeHtml(article.url)}">${escapeHtml(article.title)}</a></h3>
                    <p>${escapeHtml(article.description)}</p>
                    <div class="news-info">
                        <span>Saved on ${escapeHtml(article.savedDate)}</span>
                        <a href="${escapeHtml(article.url)}">Read Article &rarr;</a>
                    </div>
                </div>
            </article>
        `).join('');

        savedContainer.querySelectorAll('.remove-bookmark-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('.news-card');
                const articleId = card.getAttribute('data-id');

                let savedArticlesList = getSavedArticles();
                savedArticlesList = savedArticlesList.filter(item => item.id !== articleId);
                saveArticlesToStorage(savedArticlesList);
                renderSavedArticlesPage();
                showToast('Article removed from bookmarks');
            });
        });
    }
});