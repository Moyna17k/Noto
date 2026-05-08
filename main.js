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

    function playBreachSound() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();

            function beep(freq, start, duration, vol, type) {
                var osc  = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = type || 'square';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + start + duration);
                gain.gain.setValueAtTime(0, ctx.currentTime + start);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + duration + 0.05);
            }

            function noise(start, duration, vol) {
                var bufSize  = ctx.sampleRate * duration;
                var buffer   = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                var data     = buffer.getChannelData(0);
                for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
                var src  = ctx.createBufferSource();
                var gain = ctx.createGain();
                var filt = ctx.createBiquadFilter();
                filt.type = 'bandpass';
                filt.frequency.value = 1200;
                filt.Q.value = 0.8;
                src.buffer = buffer;
                src.connect(filt);
                filt.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0, ctx.currentTime + start);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
                src.start(ctx.currentTime + start);
                src.stop(ctx.currentTime + start + duration + 0.05);
            }

            // Glitch beeps rapides
            beep(880,  0.00, 0.06, 0.25, 'square');
            beep(1320, 0.07, 0.05, 0.20, 'square');
            beep(660,  0.13, 0.04, 0.22, 'square');
            beep(1760, 0.18, 0.07, 0.18, 'sawtooth');
            // Bruit de breach
            noise(0.00, 0.25, 0.15);
            noise(0.25, 0.35, 0.10);
            // Swoosh descendant
            beep(2200, 0.28, 0.55, 0.20, 'sawtooth');
            // Confirmation basse
            beep(220,  0.60, 0.40, 0.30, 'sine');
            beep(180,  0.65, 0.35, 0.20, 'sine');

            setTimeout(function () { ctx.close(); }, 1500);
        } catch (e) { /* Pas de Web Audio API dispo */ }
    }

    function triggerFaille() {
        document.querySelectorAll('.noto-nav-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.noto-page').forEach(function (p) { p.classList.remove('active'); });
        document.getElementById('page-faille').classList.add('active');
        document.getElementById('egg-hud').style.display = 'none';
        localStorage.removeItem('noto_eggs');
        playBreachSound();
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
