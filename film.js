// ═══════════════════════════════════════════════
//  CinéJournal — Page de détail d'un film (v2)
//  Corrige le bug FILMS → chargerFilms()
//  Ajoute : double note, critères, galerie TMDB, contexte
// ═══════════════════════════════════════════════

const CRITERES_LABELS = {
  realisation: { label: 'Réalisation',   icon: '🎬' },
  image:       { label: 'Image',          icon: '📸' },
  musique:     { label: 'Musique',        icon: '🎵' },
  decors:      { label: 'Décors',         icon: '🏛️' },
  personnages: { label: 'Personnages',    icon: '👥' },
  scenario:    { label: 'Scénario',       icon: '📖' },
  montage:     { label: 'Montage',        icon: '✂️' },
  emotions:    { label: 'Impact',         icon: '💥' },
};

const CONTEXTE_LABELS = {
  'cinéma':    { icon: '🎭', label: 'Au cinéma' },
  'streaming': { icon: '📺', label: 'En streaming' },
  'chez-moi':  { icon: '🏠', label: 'À la maison' },
  'plein-air': { icon: '🌙', label: 'Cinéma en plein air' },
  'autre':     { icon: '✨', label: 'Autre contexte' },
};

const AVEC_QUI_LABELS = {
  'seul':    { icon: '🧍', label: 'Seul(e)' },
  'amis':    { icon: '👥', label: 'Avec des amis' },
  'famille': { icon: '👨‍👩‍👧', label: 'En famille' },
  'date':    { icon: '💑', label: 'En couple' },
};

// ── Lightbox ─────────────────────────────────
let lbImages = [];
let lbIndex = 0;

function openLightbox(images, idx) {
  lbImages = images;
  lbIndex = idx;
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) {
    img.src = images[idx];
    lb.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateLbNav();
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

function lbMove(dir) {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  const img = document.getElementById('lightbox-img');
  if (img) { img.style.opacity = '0'; setTimeout(() => { img.src = lbImages[lbIndex]; img.style.opacity = '1'; }, 150); }
  updateLbNav();
}

function updateLbNav() {
  const prev = document.getElementById('lb-prev');
  const next = document.getElementById('lb-next');
  if (prev) prev.style.display = lbImages.length > 1 ? 'flex' : 'none';
  if (next) next.style.display = lbImages.length > 1 ? 'flex' : 'none';
}

window.closeLightbox = closeLightbox;
window.lbMove = lbMove;

// Keyboard navigation for lightbox
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'ArrowLeft') lbMove(-1);
  if (e.key === 'ArrowRight') lbMove(1);
  if (e.key === 'Escape') closeLightbox();
});

// ═══════════════════════════════════════════════
//  Rendu principal
// ═══════════════════════════════════════════════

function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'), 10);
}

function renderDetail() {
  const id = getIdFromURL();
  // FIX: utiliser chargerFilms() au lieu de FILMS (variable inexistante)
  const film = chargerFilms().find(f => f.id === id);

  if (!film) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;color:#888799;background:#0d0d14;">
        <div style="font-size:5rem;">🎞️</div>
        <h2 style="color:#fff;font-family:Inter,sans-serif;">Film introuvable</h2>
        <p style="color:#888799;text-align:center;">Ce film n'existe pas dans ton journal.</p>
        <a href="index.html" style="color:#c8a84b;text-decoration:underline;font-family:Inter,sans-serif;">← Retour aux films</a>
      </div>`;
    return;
  }

  document.title = `${film.titre} — CinéJournal`;

  // ── Hero Background ─────────────────────────
  const heroBg = document.getElementById('hero-bg');
  if (film.affiche && heroBg) heroBg.style.backgroundImage = `url(${film.affiche})`;

  // ── Poster ───────────────────────────────────
  const posterContainer = document.getElementById('detail-poster-container');
  if (posterContainer) {
    if (film.affiche) {
      posterContainer.innerHTML = `
        <div class="detail-poster">
          <img src="${film.affiche}" alt="Affiche ${film.titre}"
            onerror="this.parentElement.outerHTML='<div class=\\'detail-poster-fallback\\'>${film.emoji || '🎬'}</div>'">
        </div>`;
    } else {
      posterContainer.innerHTML = `<div class="detail-poster-fallback">${film.emoji || '🎬'}</div>`;
    }
  }

  // ── Tags ──────────────────────────────────────
  const tagsEl = document.getElementById('detail-tags');
  if (tagsEl) {
    tagsEl.innerHTML = (film.genre || '').split(' / ').filter(Boolean).map(g =>
      `<span class="detail-tag">${g}</span>`
    ).join('')
    + (film.coup_de_coeur ? '<span class="detail-tag detail-tag-coeur">❤️ Coup de cœur</span>' : '');
  }

  // ── Titre & sous-titre ───────────────────────
  const titreEl = document.getElementById('detail-titre');
  if (titreEl) titreEl.textContent = film.titre;

  const sousTitreEl = document.getElementById('detail-sous-titre');
  if (sousTitreEl) {
    sousTitreEl.textContent = `${film.annee}${film.titre_original && film.titre_original !== film.titre ? ` · ${film.titre_original}` : ''} · Réalisé par ${film.realisateur}`;
  }

  // ── Métas ─────────────────────────────────────
  const metasEl = document.getElementById('detail-metas');
  if (metasEl) {
    metasEl.innerHTML = [
      film.duree ? `<div class="detail-meta-item"><span class="key">Durée</span><span class="val">${film.duree}</span></div>` : '',
      film.nationalite ? `<div class="detail-meta-item"><span class="key">Pays</span><span class="val">${film.nationalite}</span></div>` : '',
      film.genre ? `<div class="detail-meta-item"><span class="key">Genre</span><span class="val">${film.genre.split(' / ')[0]}</span></div>` : '',
    ].join('');
  }

  // ── Double Note ───────────────────────────────
  const noteEl = document.getElementById('detail-note');
  if (noteEl) {
    const noteTech = film.criteres ? (() => {
      const vals = Object.values(film.criteres).filter(v => v > 0);
      return vals.length ? Math.round((vals.reduce((a,b) => a+b,0) / vals.length) * 2) / 2 : null;
    })() : (film.note || null);
    const noteCoeur = film.note_coeur || film.note || null;

    noteEl.innerHTML = `
      <div class="detail-notes-dual">
        ${noteCoeur !== null ? `
          <div class="detail-note-block note-coeur-block">
            <div class="detail-note-circle note-coeur-circle">
              <span class="note-circle-val">${typeof noteCoeur === 'number' && noteCoeur % 1 !== 0 ? noteCoeur.toFixed(1) : noteCoeur}</span>
              <span class="note-circle-denom">/10</span>
            </div>
            <div class="detail-note-meta">
              <span class="detail-note-label">❤️ Note du cœur</span>
              <span class="detail-note-sub">Ressenti personnel</span>
              <div class="detail-note-stars">${renderStars(noteCoeur)}</div>
            </div>
          </div>` : ''}
        ${noteTech !== null && film.criteres ? `
          <div class="detail-note-block note-tech-block">
            <div class="detail-note-circle note-tech-circle">
              <span class="note-circle-val">${typeof noteTech === 'number' && noteTech % 1 !== 0 ? noteTech.toFixed(1) : noteTech}</span>
              <span class="note-circle-denom">/10</span>
            </div>
            <div class="detail-note-meta">
              <span class="detail-note-label">⭐ Note technique</span>
              <span class="detail-note-sub">Moyenne des 8 critères</span>
              <div class="detail-note-stars">${renderStars(noteTech)}</div>
            </div>
          </div>` : ''}
      </div>`;
  }

  // ── Contexte de visionnage ────────────────────
  const contextBar = document.getElementById('detail-context-bar');
  if (contextBar && (film.dateVu || film.contexte || film.aveqQui)) {
    const ctx = CONTEXTE_LABELS[film.contexte] || { icon: '📺', label: film.contexte || '' };
    const who = AVEC_QUI_LABELS[film.aveqQui] || { icon: '👤', label: film.aveqQui || '' };
    contextBar.innerHTML = `
      <div class="context-items">
        ${film.dateVu ? `
          <div class="context-item">
            <span class="context-icon">📅</span>
            <div class="context-text">
              <span class="context-key">Vu le</span>
              <span class="context-val">${formaterDate(film.dateVu)}</span>
            </div>
          </div>` : ''}
        ${film.contexte ? `
          <div class="context-item">
            <span class="context-icon">${ctx.icon}</span>
            <div class="context-text">
              <span class="context-key">Contexte</span>
              <span class="context-val">${ctx.label}</span>
            </div>
          </div>` : ''}
        ${film.aveqQui ? `
          <div class="context-item">
            <span class="context-icon">${who.icon}</span>
            <div class="context-text">
              <span class="context-key">Avec</span>
              <span class="context-val">${who.label}</span>
            </div>
          </div>` : ''}
      </div>`;
    contextBar.style.display = 'block';
  }

  // ── Galerie d'images ──────────────────────────
  const gallerySection = document.getElementById('detail-gallery-section');
  const galleryGrid = document.getElementById('gallery-grid');
  const images = film.images || [];

  if (images.length > 0 && gallerySection && galleryGrid) {
    galleryGrid.innerHTML = images.map((url, i) => `
      <div class="gallery-item" onclick="openLightbox(${JSON.stringify(images)}, ${i})">
        <img src="${url}" alt="Image ${i+1} — ${film.titre}" loading="lazy"
          onerror="this.parentElement.style.display='none'">
        <div class="gallery-item-overlay"><span>🔍</span></div>
      </div>`).join('');
    gallerySection.style.display = 'block';
  }

  // ── Critères de notation ──────────────────────
  const criteresSection = document.getElementById('detail-criteres-section');
  const criteresGrid = document.getElementById('criteres-detail-grid');

  if (film.criteres && criteresSection && criteresGrid) {
    const hasAnyNote = Object.values(film.criteres).some(v => v > 0);
    if (hasAnyNote) {
      criteresGrid.innerHTML = Object.entries(CRITERES_LABELS).map(([id, meta]) => {
        const val = film.criteres[id] || 0;
        const pct = (val / 10) * 100;
        const colorClass = val >= 8 ? 'bar-gold' : val >= 6 ? 'bar-blue' : val >= 4 ? 'bar-orange' : 'bar-red';
        return `
          <div class="critere-detail-item">
            <div class="critere-detail-header">
              <span class="critere-detail-icon">${meta.icon}</span>
              <span class="critere-detail-label">${meta.label}</span>
              <span class="critere-detail-val ${val >= 8 ? 'val-gold' : ''}">${val > 0 ? val+'/10' : '—'}</span>
            </div>
            <div class="critere-detail-bar-bg">
              <div class="critere-detail-bar ${colorClass}" style="width:0%" data-target="${pct}%"></div>
            </div>
          </div>`;
      }).join('');
      criteresSection.style.display = 'block';

      // Animation des barres après rendu
      requestAnimationFrame(() => {
        setTimeout(() => {
          criteresGrid.querySelectorAll('.critere-detail-bar').forEach(bar => {
            bar.style.width = bar.dataset.target;
          });
        }, 200);
      });
    }
  }

  // ── Synopsis ──────────────────────────────────
  const synopsisEl = document.getElementById('detail-synopsis');
  if (synopsisEl) synopsisEl.textContent = film.synopsis || 'Aucun synopsis disponible.';

  // ── Acteurs ───────────────────────────────────
  const acteursEl = document.getElementById('detail-acteurs');
  if (acteursEl && film.acteurs && film.acteurs.length) {
    acteursEl.innerHTML = film.acteurs.map(a => `<span class="actor-chip">${a}</span>`).join('');
  }

  // ── Critique ──────────────────────────────────
  const critiqueEl = document.getElementById('detail-critique');
  const critiqueBlock = document.getElementById('detail-critique-block');
  if (critiqueEl && film.critique) {
    critiqueEl.innerHTML = film.critique.split('\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');
    if (critiqueBlock) critiqueBlock.style.display = 'block';
  }

  // ── Auteur ─────────────────────────────────────
  document.querySelectorAll('.sig-auteur').forEach(el => el.textContent = CONFIG.auteur || 'Moi');
  document.querySelectorAll('.sig-avatar').forEach(el => el.textContent = CONFIG.avatarEmoji || '🎬');

  // ── Bouton Modifier ───────────────────────────
  const btnModifier = document.getElementById('btn-modifier');
  if (btnModifier) btnModifier.href = `add.html?edit=${film.id}`;

  // ── Chargement des notes et critiques externes ──
  loadExternalData(film);
}

// ═══════════════════════════════════════════════
//  Notes externes (OMDb) & Critiques (TMDB)
// ═══════════════════════════════════════════════

async function loadExternalData(film) {
  const containerRatings = document.getElementById('external-ratings');
  const proReviewsContainer = document.getElementById('pro-reviews-container');
  const proReviewsBlock = document.getElementById('pro-reviews-block');

  const omdbKey = localStorage.getItem('cinejournal_omdb_key');
  const tmdbKey = localStorage.getItem('cinejournal_tmdb_key'); // Optionnel, mais utilisé pour TMDB si dispo

  // 1. OMDb : Recherche par titre et année
  if (omdbKey && containerRatings) {
    try {
      // Nettoyage du titre pour la recherche
      const qTitle = encodeURIComponent(film.titre_original || film.titre);
      const qYear = film.annee || '';
      const omdbUrl = `https://www.omdbapi.com/?apikey=${omdbKey}&t=${qTitle}&y=${qYear}`;
      const res = await fetch(omdbUrl);
      const data = await res.json();

      if (data.Response === 'True') {
        let ratingsHtml = '';
        
        // IMDb
        if (data.imdbRating && data.imdbRating !== 'N/A') {
          ratingsHtml += `
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:30px;">
              <span style="background:#f5c518; color:#000; font-weight:900; padding:2px 6px; border-radius:4px; font-size:0.75rem;">IMDb</span>
              <strong style="color:#fff; font-size:1.1rem;">${data.imdbRating}</strong><span style="color:#888799; font-size:0.8rem;">/10</span>
            </div>
          `;
        }

        // Rotten Tomatoes
        const rt = data.Ratings?.find(r => r.Source === 'Rotten Tomatoes');
        if (rt) {
          const score = parseInt(rt.Value);
          const icon = score >= 60 ? '🍅' : '🤢'; // Fresh vs Rotten
          ratingsHtml += `
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:30px;">
              <span style="font-size:1.2rem;">${icon}</span>
              <strong style="color:#fff; font-size:1.1rem;">${rt.Value}</strong>
            </div>
          `;
        }

        // Metacritic (Bonus)
        if (data.Metascore && data.Metascore !== 'N/A') {
          const ms = parseInt(data.Metascore);
          const color = ms >= 61 ? '#66cc33' : ms >= 40 ? '#ffcc33' : '#ff0000';
          ratingsHtml += `
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:30px;">
              <span style="background:${color}; color:#fff; font-weight:800; padding:2px 6px; border-radius:4px; font-size:0.75rem;">M</span>
              <strong style="color:#fff; font-size:1.1rem;">${data.Metascore}</strong><span style="color:#888799; font-size:0.8rem;">/100</span>
            </div>
          `;
        }

        if (ratingsHtml) {
          containerRatings.innerHTML = ratingsHtml;
          containerRatings.style.display = 'flex';
        }
      }
    } catch(e) { console.error("OMDb fetch error:", e); }
  }

  // 2. TMDB Reviews: we need the TMDB ID dynamically.
  if (tmdbKey && proReviewsContainer && proReviewsBlock) {
    try {
      // Since we don't always save tmdbId, let's search TMDB quickly
      const qTitle = encodeURIComponent(film.titre_original || film.titre);
      const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${qTitle}&year=${film.annee}`);
      const searchData = await searchRes.json();
      
      if (searchData.results && searchData.results.length > 0) {
        const tmdbId = searchData.results[0].id; // Take best match

        // Fetch TMDB score
        const tmdbScore = searchData.results[0].vote_average;
        if (tmdbScore && tmdbScore > 0 && containerRatings) {
           const tmdbHtml = `
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:30px;">
              <span style="background:linear-gradient(90deg, #90cea1, #01b4e4); color:#fff; font-weight:800; padding:2px 6px; border-radius:4px; font-size:0.75rem;">TMDB</span>
              <strong style="color:#fff; font-size:1.1rem;">${tmdbScore.toFixed(1)}</strong><span style="color:#888799; font-size:0.8rem;">/10</span>
            </div>`;
           containerRatings.innerHTML += tmdbHtml;
           containerRatings.style.display = 'flex';
        }

        // Fetch reviews
        const reviewsRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/reviews?api_key=${tmdbKey}`);
        const reviewsData = await reviewsRes.json();

        if (reviewsData.results && reviewsData.results.length > 0) {
          const topReviews = reviewsData.results.slice(0, 3); // Garder 3 avis
          let html = '';
          
          topReviews.forEach(r => {
            const author = r.author;
            // Shorten content
            let content = r.content.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
            if (content.length > 300) content = content.substring(0, 297) + '...';
            
            const initial = author.charAt(0).toUpperCase();
            const avatarFallback = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='40' height='40' rx='20' fill='%23333'/><text x='50%25' y='50%25' dominant-baseline='central' text-anchor='middle' fill='white' font-size='18' font-family='sans-serif'>${initial}</text></svg>`;
            const avatar = r.author_details?.avatar_path
              ? (r.author_details.avatar_path.startsWith('/http') ? r.author_details.avatar_path.substring(1) : `https://image.tmdb.org/t/p/w200${r.author_details.avatar_path}`)
              : avatarFallback;
            
            const rating = r.author_details?.rating;
            const ratingHtml = rating ? `<strong style="color:var(--gold)">${rating}/10</strong>` : '';

            html += `
              <div style="background:var(--bg-card); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem;">
                  <div style="display:flex; align-items:center; gap:1rem;">
                    <img src="${avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                    <strong style="color:#fff; font-size:1rem;">${author}</strong>
                  </div>
                  ${ratingHtml}
                </div>
                <p style="color:rgba(255,255,255,0.8); font-size:0.95rem; line-height:1.6; font-style:italic;">"${content}"</p>
                <a href="${r.url}" target="_blank" style="color:var(--gold); font-size:0.85rem; text-decoration:underline; display:inline-block; margin-top:0.5rem;">Lire l'avis complet</a>
              </div>
            `;
          });

          proReviewsContainer.innerHTML = html;
          proReviewsBlock.style.display = 'block';
        }
      }
    } catch(e) { console.error("TMDB reviews fetch error:", e); }
  }
}

// ── Helpers ───────────────────────────────────
function renderStars(note, max = 10, nb = 5) {
  const per = max / nb;
  return Array.from({ length: nb }, (_, i) => {
    const full = (i + 1) * per;
    const half = full - per / 2;
    let cls = 'hs-empty';
    if (note >= full) cls = 'hs-full';
    else if (note >= half) cls = 'hs-half';
    return `<span class="${cls}">★</span>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', renderDetail);
