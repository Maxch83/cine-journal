// ═══════════════════════════════════════════════
//  CinéJournal — Page Coups de Cœur
//  favoris.js
// ═══════════════════════════════════════════════

const FAVORIS_QUOTES = [
  { text: "Le cinéma, c'est l'écriture moderne dont l'encre est la lumière.", from: "Jean Cocteau" },
  { text: "Un film n'est pas pensé, il est ressenti.", from: "François Truffaut" },
  { text: "Le cinéma est une fenêtre sur le monde.", from: "René Clair" },
  { text: "Tout ce dont on a besoin pour faire un film, c'est d'une fille et d'un fusil.", from: "Jean-Luc Godard" },
  { text: "Le cinéma est la réalité à laquelle on a ajouté vingt-quatre fois par seconde du rêve.", from: "Jean-Luc Godard" },
  { text: "Un grand film devrait nous faire sentir plus vivants que nous ne l'étions avant.", from: "Roger Ebert" },
];

document.addEventListener('DOMContentLoaded', () => {
  const films = chargerFilms();
  const coups = films.filter(f => f.coup_de_coeur);

  // Stat
  const countEl = document.getElementById('favoris-count');
  if (countEl) countEl.textContent = coups.length;

  // Empty state
  const emptyEl = document.getElementById('favoris-empty');
  const gridEl = document.getElementById('favoris-grid');

  if (coups.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (gridEl) gridEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  // Quote aléatoire
  const quoteBar = document.getElementById('favoris-quote-bar');
  const quoteText = document.getElementById('favoris-quote-text');
  const quoteFrom = document.getElementById('favoris-quote-from');
  if (quoteBar && quoteText && quoteFrom) {
    const q = FAVORIS_QUOTES[Math.floor(Math.random() * FAVORIS_QUOTES.length)];
    quoteText.textContent = q.text;
    quoteFrom.textContent = `— ${q.from}`;
    quoteBar.style.display = 'block';
  }

  // Floating posters en fond hero (max 5)
  const floatContainer = document.getElementById('favoris-float-posters');
  if (floatContainer) {
    const postersToShow = coups.slice(0, 5).filter(f => f.affiche);
    floatContainer.innerHTML = postersToShow.map((f, i) => `
      <div class="float-poster float-poster-${i}" style="--fp-delay:${i * 0.4}s">
        <img src="${f.affiche}" alt="${f.titre}" loading="lazy">
      </div>
    `).join('');
  }

  // Grille principale
  if (gridEl) {
    gridEl.innerHTML = coups.map((film, idx) => {
      const noteTech = film.criteres ? (() => {
        const vals = Object.values(film.criteres).filter(v => v > 0);
        return vals.length ? Math.round((vals.reduce((a,b) => a+b,0) / vals.length) * 2) / 2 : null;
      })() : null;
      const noteCoeur = film.note_coeur || film.note || null;

      return `
        <article class="favoris-card" onclick="window.location.href='film.html?id=${film.id}'"
          style="animation-delay:${idx * 0.08}s" tabindex="0" aria-label="${film.titre}">
          <!-- Poster -->
          <div class="favoris-card-poster">
            ${film.affiche
              ? `<img src="${film.affiche}" alt="${film.titre}" loading="lazy"
                   onerror="this.parentElement.innerHTML='<div class=\\'favoris-poster-fallback\\'>${film.emoji || '🎬'}</div>'">`
              : `<div class="favoris-poster-fallback">${film.emoji || '🎬'}</div>`}
            <div class="favoris-card-glow"></div>
            <div class="favoris-card-overlay">
              <button class="favoris-card-btn">Voir la fiche →</button>
            </div>
            <div class="favoris-heart-badge">❤️</div>
          </div>
          <!-- Info -->
          <div class="favoris-card-body">
            <div class="favoris-card-year">${film.annee}</div>
            <div class="favoris-card-title">${film.titre}</div>
            <div class="favoris-card-director">🎬 ${film.realisateur || '—'}</div>
            ${film.genre ? `<div class="favoris-card-genre">${film.genre.split(' / ')[0]}</div>` : ''}
            <!-- Notes -->
            <div class="favoris-card-notes">
              ${noteCoeur !== null ? `
                <div class="favoris-note-item">
                  <span class="favoris-note-icon">❤️</span>
                  <span class="favoris-note-val">${typeof noteCoeur === 'number' && noteCoeur % 1 !== 0 ? noteCoeur.toFixed(1) : noteCoeur}/10</span>
                </div>` : ''}
              ${noteTech !== null ? `
                <div class="favoris-note-item">
                  <span class="favoris-note-icon">⭐</span>
                  <span class="favoris-note-val">${typeof noteTech === 'number' && noteTech % 1 !== 0 ? noteTech.toFixed(1) : noteTech}/10</span>
                </div>` : ''}
            </div>
            <!-- Tags -->
            ${film.tags && film.tags.length ? `
              <div class="favoris-card-tags">
                ${film.tags.slice(0, 3).map(t => `<span class="favoris-tag">#${t}</span>`).join('')}
              </div>` : ''}
            <!-- Date -->
            <div class="favoris-card-date">📅 ${formaterDate(film.dateVu)}</div>
            <!-- Extrait critique -->
            ${film.critique ? `
              <div class="favoris-critique-excerpt">
                "${film.critique.slice(0, 120).trim()}${film.critique.length > 120 ? '…' : ''}"
              </div>` : ''}
          </div>
        </article>`;
    }).join('');
  }
});
