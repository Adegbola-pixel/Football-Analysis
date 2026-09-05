// --- PATH RESOLUTION ---
// index.js is shared by index.html at the site root AND the pages one
// level down, so no single hardcoded prefix works for both, and absolute
// "/images/..." breaks unless the site is served at a domain root.
// Both bases are worked out at runtime instead.

// Images: derived from this script's own URL. js/index.js -> site root.
const thisScript = document.currentScript ||
    document.querySelector('script[src$="index.js"]');

const SITE_ROOT = thisScript
    ? new URL("../", thisScript.src).href
    : new URL("./", window.location.href).href;

// Pages: derived from the nav's own Analysis link, which is already
// correct on whichever page we're on. No folder name to hardcode.
function resolvePageBase() {
    const navLink = document.querySelector('.nav-links a[href$="analysis.html"]') ||
        document.querySelector('.mobile-menu-links a[href$="analysis.html"]');

    const base = new URL(navLink ? navLink.getAttribute("href") : "./",
        window.location.href);
    base.pathname = base.pathname.replace(/[^/]*$/, "");
    return base.href;
}

const PAGE_BASE = resolvePageBase();

function imageUrl(file) {
    return new URL("images/" + file, SITE_ROOT).href;
}

function pageUrl(file) {
    return new URL(file, PAGE_BASE).href;
}

const menuButton = document.querySelector(".menu-btn");
const closeMenu = document.querySelector(".close-menu");
const menuOverlay = document.querySelector(".menu-overlay");
const menuLinks = document.querySelectorAll(".mobile-menu a");

const darkModeButton = document.querySelector('[aria-label="Toggle dark mode"]');
const darkModeIcon = darkModeButton ? darkModeButton.querySelector("i") : null;

const searchButton = document.querySelector(".search-btn");
const closeSearch = document.querySelector(".close-search");
const searchOverlay = document.querySelector(".search-overlay");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-form input");
const searchResults = document.querySelector(".search-results");

const navDropdowns = document.querySelectorAll(".nav-dropdown");

// --- MOBILE MENU FUNCTIONALITY ---
if (menuButton) {
    menuButton.addEventListener("click", () => {
        document.body.classList.add("menu-open");
    });
}

if (closeMenu) {
    closeMenu.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
    });
}

if (menuOverlay) {
    menuOverlay.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
    });
}

menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
    });
});

// --- DARK MODE TOGGLE ---
if (darkModeButton && darkModeIcon) {
    darkModeButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            darkModeIcon.classList.remove("fa-moon", "fa-regular");
            darkModeIcon.classList.add("fa-sun", "fa-solid");
        } else {
            darkModeIcon.classList.remove("fa-sun", "fa-solid");
            darkModeIcon.classList.add("fa-moon", "fa-regular");
        }
    });
}

// --- SEARCH PANEL TOGGLE ---
function closeSearchPanel() {
    document.body.classList.remove("search-open");

    if (searchInput) {
        searchInput.value = "";
    }

    if (searchResults) {
        searchResults.classList.remove("active");
        searchResults.innerHTML = "";
    }
}

if (searchButton) {
    searchButton.addEventListener("click", () => {
        document.body.classList.add("search-open");

        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 100);
    });
}

if (closeSearch) {
    closeSearch.addEventListener("click", closeSearchPanel);
}

if (searchOverlay) {
    searchOverlay.addEventListener("click", closeSearchPanel);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("search-open")) {
        closeSearchPanel();
    }
});

// --- CENTRALIZED SEARCH INDEX ---
// Bare filenames only. imageUrl() and pageUrl() build the correct links
// from any depth, so this list never needs path maintenance again.
function getGlobalSearchIndex() {
    return [
        {
            title: "How Pressing Has Changed Modern Football",
            categoryText: "Analysis",
            categoryClass: "analysis",
            image: "pressing.jpg",
            url: "pressing.html"
        },
        {
            title: "Why Barcelona's Midfield Dominated Possession",
            categoryText: "Analysis",
            categoryClass: "analysis",
            image: "barcelona club.png",
            url: "barcelonaanalysis.html"
        },
        {
            title: "Why Pedri Is Barcelona's Most Important Midfielder",
            categoryText: "Analysis",
            categoryClass: "player",
            image: "pedri.jpg",
            url: "article3.html"
        },
        {
            title: "Five Tactical Lessons From City's Victory",
            categoryText: "Review",
            categoryClass: "review",
            image: "Man City.webp",
            url: "cityanalysis.html"
        },
        {
            title: "Spain Beat France To Reach World Cup Final",
            categoryText: "Match Report",
            categoryClass: "review",
            image: "spain vs france.jpg",
            url: "spainvsfrance.html"
        },
        {
            title: "Barcelona Prepare Final Offer For Young Midfielder",
            categoryText: "News",
            categoryClass: "news",
            image: "javi guerra.webp",
            url: "article.html"
        },
        {
            title: "Nico Williams Reaches Agreement With Barcelona",
            categoryText: "Transfer",
            categoryClass: "transfer",
            image: "nico wiliams.webp",
            url: "nicowilliams.html"
        },
        {
            title: "Julian Alvarez Still Pushing For Barca Move",
            categoryText: "Transfer",
            categoryClass: "transfer",
            image: "Julian Alvarez.webp",
            url: "article2.html"
        },
        {
            title: "Are Big Transfers Still Worth The Risk?",
            categoryText: "Opinion",
            categoryClass: "opinion",
            image: "mbappe.jpg",
            url: "bigtransfersopinion.html"
        },
        {
            title: "Classic World Cup Matches Every Fan Should Know",
            categoryText: "History",
            categoryClass: "history",
            image: "spain vs netherlands.jpg",
            url: "classic-world-cup-matches.html"
        },
        {
            title: "The Tactical Systems That Changed The Game",
            categoryText: "History",
            categoryClass: "history",
            image: "pressing.jpg",
            url: "tactical-systems-changed-game.html"
        },
        {
            title: "Players Who Defined Their Generation",
            categoryText: "Legends",
            categoryClass: "history",
            image: "maradona'.webp",
            url: "players-defined-generation.html"
        },
        {
            title: "South Africa vs Canada Match Predictions",
            categoryText: "Prediction",
            categoryClass: "prediction",
            image: "south africa vs canada.avif",
            url: "southafricavscanadaprediction.html"
        },
        {
            title: "Portugal vs Slovakia Match Predictions",
            categoryText: "Prediction",
            categoryClass: "prediction",
            image: "portugal.jpg",
            url: "portugalvsslovakia.html"
        },
        {
            title: "England vs Senegal Match Predictions",
            categoryText: "Prediction",
            categoryClass: "prediction",
            image: "englandvssenegal.jpg",
            url: "englandvssenegal.html"
        },
        {
            title: "Spain vs France Match Analysis",
            categoryText: "Analysis",
            categoryClass: "analysis",
            image: "spain vs france.jpg",
            url: "spainvsfrancematchanalysis.html"
        },
    ];
}

const searchIndex = getGlobalSearchIndex();

// --- SEARCH RESULTS RENDER LOGIC ---
function renderSearchResults(query) {
    if (!searchResults) return;

    const q = query.trim().toLowerCase();
    searchResults.innerHTML = "";

    if (!q) {
        searchResults.classList.remove("active");
        return;
    }

    // Filter index for matches against titles or categories
    const matches = searchIndex
        .filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.categoryText.toLowerCase().includes(q)
        )
        .slice(0, 6);

    searchResults.classList.add("active");

    if (matches.length === 0) {
        const empty = document.createElement("p");
        empty.className = "search-empty";
        empty.textContent = `No results for "${query.trim()}"`;
        searchResults.appendChild(empty);
        return;
    }

    matches.forEach((item) => {
        const link = document.createElement("a");
        link.className = "search-result";
        link.href = pageUrl(item.url);

        const img = document.createElement("img");
        img.src = imageUrl(item.image);
        img.alt = "";

        const content = document.createElement("div");

        const span = document.createElement("span");
        span.className = `category ${item.categoryClass}`;
        span.textContent = item.categoryText;
        content.appendChild(span);

        const h4 = document.createElement("h4");
        h4.textContent = item.title;
        content.appendChild(h4);

        link.appendChild(img);
        link.appendChild(content);

        link.addEventListener("click", closeSearchPanel);

        searchResults.appendChild(link);
    });
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        renderSearchResults(searchInput.value);
    });
}

if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const firstMatch = searchResults
            ? searchResults.querySelector(".search-result")
            : null;
        if (firstMatch) {
            firstMatch.click();
        }
    });
}

// --- TOUCH-DEVICE INTERACTIVE MEGA MENU LOGIC ---
navDropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(":scope > a");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
        const supportsHover = window.matchMedia("(hover: hover)").matches;
        if (supportsHover) return;

        const isOpen = dropdown.classList.contains("open");

        if (!isOpen) {
            e.preventDefault();
            navDropdowns.forEach((d) => d.classList.remove("open"));
            dropdown.classList.add("open");
        }
    });
});

document.addEventListener("click", (e) => {
    const clickedInsideDropdown = [...navDropdowns].some((d) => d.contains(e.target));
    if (!clickedInsideDropdown) {
        navDropdowns.forEach((d) => d.classList.remove("open"));
    }
});

const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: send the email to your mailing-list provider
    });
}