// ─── main.js ─────────────────────────────────────────────────────────────────
// Navigation entre les pages + interactions UI
// Chargé avec <script defer src="main.js"> dans index.html
// ─────────────────────────────────────────────────────────────────────────────

// ── Navigation ───────────────────────────────────────────────────────────────
const btns  = document.querySelectorAll('.noto-nav-btn');
const pages = document.querySelectorAll('.noto-page');

function navigateTo(target) {
    // Mettre à jour les boutons nav
    btns.forEach(b => b.classList.remove('active'));
    const matchBtn = document.querySelector(`.noto-nav-btn[data-page="${target}"]`);
    if (matchBtn) matchBtn.classList.add('active');

    // Afficher la bonne page avec animation
    pages.forEach(p => {
        p.classList.remove('active');
        if (p.id === 'page-' + target) {
            p.classList.add('active');
            p.classList.remove('page-enter');
            void p.offsetWidth; // Force reflow pour relancer l'animation CSS
            p.classList.add('page-enter');
        }
    });

    // Signaler à firebase.js que la page est visible (lazy load)
    if (target === 'vod')     window.dispatchEvent(new Event('vodPageVisible'));
    if (target === 'musique') window.dispatchEvent(new Event('musiquePageVisible'));
}

// Clic sur les boutons de nav
btns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// Clic sur le logo NOTO → retour à l'accueil
const brandBtn = document.getElementById('noto-brand-btn');
if (brandBtn) {
    brandBtn.addEventListener('click', () => navigateTo('reseaux'));
}

// ── Année dynamique dans tous les footers ────────────────────────────────────
document.querySelectorAll('.noto-footer-year')
    .forEach(el => el.textContent = new Date().getFullYear());

// ── Easter Eggs ──────────────────────────────────────────────────────────────
(function () {
    var TOTAL = 5;
    var found = new Set(JSON.parse(localStorage.getItem('noto_eggs') || '[]'));

    function save() { localStorage.setItem('noto_eggs', JSON.stringify([...found])); }

    function updateHud() {
        var hud = document.getElementById('egg-hud');
        var txt = document.getElementById('egg-hud-text');
        if (found.size > 0) {
            hud.style.display = 'flex';
            txt.textContent = '🔍 ' + found.size + ' / ' + TOTAL;
        }
        if (found.size >= TOTAL) setTimeout(triggerFaille, 800);
    }

    function triggerFaille() {
        document.querySelectorAll('.noto-nav-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.noto-page').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('page-faille').classList.add('active');
        document.getElementById('egg-hud').style.display = 'none';
        localStorage.removeItem('noto_eggs');
    }

    function collectEgg(id, el) {
        if (found.has(id)) return;
        found.add(id);
        save();
        if (el) {
            el.classList.add('egg-flash');
            setTimeout(function () { el.classList.remove('egg-flash'); }, 600);
        }
        updateHud();
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateHud();

        // Egg 1 : logo NOTO header — triple clic
        var logoClicks = 0, logoTimer;
        var brand = document.getElementById('noto-brand-btn');
        if (brand) {
            brand.addEventListener('click', function () {
                logoClicks++;
                clearTimeout(logoTimer);
                logoTimer = setTimeout(function () { logoClicks = 0; }, 600);
                if (logoClicks >= 3) { logoClicks = 0; collectEgg('logo', brand); }
            });
        }

        // Egg 2 : "SUSPECT" dans le lore
        var suspect = document.querySelector('.lore-id-photo-label');
        if (suspect) {
            suspect.style.cursor = 'pointer';
            suspect.addEventListener('click', function () { collectEgg('suspect', suspect); });
        }

        // Egg 3 : année dans le footer
        var years = document.querySelectorAll('.noto-footer-year');
        years.forEach(function (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function () { collectEgg('year', el); });
        });

        // Egg 4 : image vinyle dans les liens
        var links = document.querySelectorAll('.noto-link');
        links.forEach(function (a) {
            if (a.href && a.href.includes('bandcamp')) {
                var img = a.querySelector('.noto-link-img');
                if (img) {
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        collectEgg('vinyle', img);
                    });
                }
            }
        });

        // Egg 5 : ✦ dans le divider lore
        var divIcon = document.querySelector('.lore-divider-icon');
        if (divIcon) {
            divIcon.style.cursor = 'pointer';
            divIcon.addEventListener('click', function () { collectEgg('divider', divIcon); });
        }

        // Retour depuis la page faille
        var backBtn = document.getElementById('faille-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function () {
                document.getElementById('page-faille').classList.remove('active');
                document.getElementById('page-reseaux').classList.add('active');
                var navBtn = document.querySelector('.noto-nav-btn[data-page="reseaux"]');
                if (navBtn) navBtn.classList.add('active');
            });
        }
    });
})();
