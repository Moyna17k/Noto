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
