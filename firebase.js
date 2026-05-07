// ─── firebase.js ────────────────────────────────────────────────────────────
// Initialisation Firebase + loaders VOD & Musique
// Importé comme <script type="module" src="firebase.js"> dans index.html
// ────────────────────────────────────────────────────────────────────────────

import { initializeApp }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query }
                                from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── ⚙️ Configuration ────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyAB1VobVvZJ27GEMxWo7NyklJn19HFz1kE",
    authDomain:        "noto-ec859.firebaseapp.com",
    projectId:         "noto-ec859",
    storageBucket:     "noto-ec859.firebasestorage.app",
    messagingSenderId: "490756391672",
    appId:             "1:490756391672:web:edce56c4e4e052ae2e310d"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Loader VODs ──────────────────────────────────────────────────────────────
async function loadVods() {
    const grid = document.getElementById('vod-grid');
    try {
        const q        = query(collection(db, "vods"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        grid.innerHTML = '';

        if (snapshot.empty) {
            grid.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:.85rem;grid-column:1/-1;text-align:center;padding:40px 0;">Aucune vidéo pour l\'instant.</p>';
            return;
        }

        let isFirst = true;
        snapshot.forEach(docSnap => {
            const v    = docSnap.data();
            const card = document.createElement('a');
            card.className = 'vod-card';
            card.href      = v.url;
            card.target    = '_blank';
            card.rel       = 'noopener noreferrer';

            const thumb     = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
            const badgeHtml = (v.badge || isFirst)
                ? `<div class="vod-badge">${v.badge || 'Nouveau'}</div>`
                : '';

            // ── Hero card (première VOD) ─────────────────────────
            if (isFirst) {
                const thumbLink = document.getElementById('vod-hero-thumb-link');
                const thumbImg  = document.getElementById('vod-hero-thumb-img');
                if (thumbLink && v.url)       thumbLink.href = v.url;
                if (thumbImg  && v.youtubeId) thumbImg.src  = `https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`;

                const heroTitle   = document.getElementById('vod-hero-title');
                const heroSub     = document.getElementById('vod-hero-subtitle');
                const heroActions = document.getElementById('vod-hero-actions');
                const heroDate    = document.getElementById('vod-hero-date');

                if (heroTitle) heroTitle.textContent = v.title    || '';
                if (heroSub)   heroSub.textContent   = v.subtitle || '';

                if (heroDate && v.createdAt) {
                    const d = new Date(v.createdAt);
                    heroDate.textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                }


            }

            // Utilise textContent pour le titre (évite les injections HTML)
            card.innerHTML = `
                <div class="vod-thumb">
                    <img src="${thumb}" alt="">
                    <div class="vod-play">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    ${badgeHtml}
                </div>
                <div class="vod-info">
                    <div class="vod-card-title"></div>
                    <div class="vod-card-meta"></div>
                </div>
            `;
            // textContent pour éviter XSS
            card.querySelector('.vod-card-title').textContent = v.title   || '';
            card.querySelector('.vod-card-meta').textContent  = v.subtitle || '';

            grid.appendChild(card);
            isFirst = false;
        });
    } catch (e) {
        grid.innerHTML = `<p style="color:#ff6b6b;font-size:.82rem;grid-column:1/-1;padding:20px;">Erreur de chargement : ${e.message}</p>`;
    }
}

// ── Loader Musique ───────────────────────────────────────────────────────────
async function loadMusique() {
    const grid         = document.getElementById('musique-grid');
    const featuredEmbed = document.getElementById('spotify-featured');

    try {
        const q        = query(collection(db, "musique"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        grid.innerHTML = '';

        if (snapshot.empty) {
            grid.innerHTML = '<p style="color:rgba(255,255,255,0.3);font-size:.85rem;grid-column:1/-1;text-align:center;padding:40px 0;">Aucun son pour l\'instant.</p>';
            return;
        }

        let isFirst = true;
        snapshot.forEach(docSnap => {
            const m = docSnap.data();

            // ── Hero card (premier son) ──────────────────────────────
            if (isFirst) {
                if (m.spotifyId && featuredEmbed) {
                    featuredEmbed.src = `https://open.spotify.com/embed/track/${m.spotifyId}?utm_source=generator&theme=0`;
                }

                const heroTitle   = document.getElementById('hero-title');
                const heroSub     = document.getElementById('hero-subtitle');
                const heroCover   = document.getElementById('hero-cover-img');
                const heroCoverLk = document.getElementById('hero-cover-link');
                const heroActions = document.getElementById('hero-actions');
                const heroDate    = document.getElementById('hero-date');

                if (heroTitle) heroTitle.textContent = m.title    || '';
                if (heroSub)   heroSub.textContent   = m.subtitle || '';

                if (heroCover && m.coverUrl) {
                    heroCover.style.display = 'none';
                    heroCover.onload  = () => { heroCover.style.display = 'block'; };
                    heroCover.onerror = () => { heroCover.style.display = 'none'; };
                    heroCover.src = m.coverUrl;
                    heroCover.alt = m.title || '';
                }

                if (heroCoverLk) heroCoverLk.href = `https://open.spotify.com/track/${m.spotifyId}`;

                if (heroDate && m.createdAt) {
                    const d = new Date(m.createdAt);
                    heroDate.textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                }

                if (heroActions) {
                    heroActions.innerHTML = `
                        <a class="musique-hero-sp-btn" href="https://open.spotify.com/track/${m.spotifyId}" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.4c-.2.3-.6.4-.9.2-2.5-1.53-5.65-1.87-9.35-1.02-.36.08-.72-.14-.8-.5-.08-.36.14-.72.5-.8 4.05-.93 7.52-.53 10.35 1.18.3.2.4.6.2.94zm1.24-2.76c-.25.37-.76.49-1.13.24-2.87-1.76-7.23-2.27-10.62-1.24-.44.13-.9-.11-1.04-.55-.13-.44.11-.9.55-1.04 3.87-1.17 8.67-.6 11.96 1.42.37.25.49.76.28 1.17zm.1-2.87C14.85 9.1 9.37 8.93 6.1 9.9c-.52.16-1.07-.13-1.23-.66-.16-.52.13-1.07.66-1.23 3.76-1.14 10.02-.92 13.97 1.4.47.28.63.88.35 1.35-.28.47-.88.63-1.35.35z"/></svg>
                            Écouter sur Spotify
                        </a>
                        ${m.youtubeId ? `
                        <a class="musique-hero-yt-btn" href="https://www.youtube.com/watch?v=${m.youtubeId}" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Voir le clip
                        </a>` : ''}
                    `;
                }
            }

            // ── Carte grille ─────────────────────────────────────────
            const card     = document.createElement('div');
            card.className = 'musique-card';

            const coverUrl  = m.coverUrl || 'media/vinyle.jpg';
            const badgeHtml = m.badge ? `<div class="musique-badge">${m.badge}</div>` : '';
            const ytBtn     = m.youtubeId
                ? `<a class="musique-yt-btn" href="https://www.youtube.com/watch?v=${m.youtubeId}" target="_blank" rel="noopener noreferrer">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Clip
                   </a>`
                : '';

            card.innerHTML = `
                <a class="musique-cover-link" href="https://open.spotify.com/track/${m.spotifyId}" target="_blank" rel="noopener noreferrer">
                    <div class="musique-thumb">
                        <img src="${coverUrl}" alt="" onerror="this.style.display='none'">
                        <div class="musique-play-overlay">
                            <div class="musique-play-btn">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </div>
                        </div>
                        ${badgeHtml}
                    </div>
                </a>
                <div class="musique-info">
                    <div class="musique-card-title"></div>
                    <div class="musique-card-meta"></div>
                    <div class="musique-card-actions">
                        <a class="musique-sp-btn" href="https://open.spotify.com/track/${m.spotifyId}" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.65 14.4c-.2.3-.6.4-.9.2-2.5-1.53-5.65-1.87-9.35-1.02-.36.08-.72-.14-.8-.5-.08-.36.14-.72.5-.8 4.05-.93 7.52-.53 10.35 1.18.3.2.4.6.2.94zm1.24-2.76c-.25.37-.76.49-1.13.24-2.87-1.76-7.23-2.27-10.62-1.24-.44.13-.9-.11-1.04-.55-.13-.44.11-.9.55-1.04 3.87-1.17 8.67-.6 11.96 1.42.37.25.49.76.28 1.17zm.1-2.87C14.85 9.1 9.37 8.93 6.1 9.9c-.52.16-1.07-.13-1.23-.66-.16-.52.13-1.07.66-1.23 3.76-1.14 10.02-.92 13.97 1.4.47.28.63.88.35 1.35-.28.47-.88.63-1.35.35z"/></svg>
                            Spotify
                        </a>
                        ${ytBtn}
                    </div>
                </div>
            `;
            // textContent pour éviter XSS
            card.querySelector('.musique-card-title').textContent = m.title    || '';
            card.querySelector('.musique-card-meta').textContent  = m.subtitle || '';

            grid.appendChild(card);
            isFirst = false;
        });
    } catch (e) {
        grid.innerHTML = `<p style="color:#ff6b6b;font-size:.82rem;grid-column:1/-1;padding:20px;">Erreur de chargement : ${e.message}</p>`;
    }
}

// ── Écoute les events de navigation (déclenchés par main.js) ────────────────
let vodsLoaded    = false;
let musiqueLoaded = false;

window.addEventListener('vodPageVisible', () => {
    if (!vodsLoaded) { vodsLoaded = true; loadVods(); }
});

window.addEventListener('musiquePageVisible', () => {
    if (!musiqueLoaded) { musiqueLoaded = true; loadMusique(); }
});

// Exposé pour forcer un rechargement si besoin (ex: debug)
window.__loadVods    = loadVods;
window.__loadMusique = loadMusique;
