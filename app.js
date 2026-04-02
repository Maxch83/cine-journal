// ═══════════════════════════════════════════════
//  CinéJournal — Données, CRUD & logique principale
//  app.js (version 2 - avec localStorage)
// ═══════════════════════════════════════════════

// ── Configuration ──────────────────────────────
const CONFIG = {
  get auteur() { return localStorage.getItem('cinejournal_auteur') || "Moi"; },
  get avatarEmoji() { return localStorage.getItem('cinejournal_emoji') || "🎬"; },
  annee: 2026,
  STORAGE_KEY: "cinejournal_films",
  TMDB_KEY_STORAGE: "cinejournal_tmdb_key",
};

// ── Films par défaut (données initiales) ───────
const FILMS_DEFAUT = [
  {
    id: 1,
    titre: "Dune : Deuxième Partie",
    titre_original: "Dune: Part Two",
    realisateur: "Denis Villeneuve",
    annee: 2024,
    genre: "Science-Fiction",
    duree: "166 min",
    nationalite: "🇺🇸 États-Unis",
    affiche: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    emoji: "🪱",
    synopsis: "Paul Atréides s'allie aux Fremen pour mener la guerre sainte contre les conspirateus qui ont détruit sa famille. Alors qu'il fait face à un conflit entre son amour pour Chani et l'accomplissement de sa destinée, il cherche à éviter l'avenir désastreux qu'il a entrevu.",
    acteurs: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler", "Florence Pugh"],
    dateVu: "2026-01-08",
    contexte: "cinéma",
    aveqQui: "amis",
    critique: "Un spectacle cinématographique sans égal. Villeneuve pousse les limites du 7ème art avec une ampleur visuelle saisissante. Chaque plan est une peinture, chaque scène une promesse tenue. La performance d'Austin Butler en Feyd-Rautha est à couper le souffle. Ce film m'a laissé muet pendant les dix premières minutes après la fin du générique.",
    note: 9,
    coup_de_coeur: true,
    tags: ["chef-d'œuvre", "sf épique"],
  },
  {
    id: 2,
    titre: "Poor Things",
    titre_original: "Poor Things",
    realisateur: "Yórgos Lánthimos",
    annee: 2023,
    genre: "Fantasy / Drame",
    duree: "141 min",
    nationalite: "🇬🇧 Royaume-Uni",
    affiche: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXSmABnMmLflSPL.jpg",
    emoji: "🦋",
    synopsis: "L'incroyable histoire de Bella Baxter, une jeune femme ramenée à la vie par le brillant et peu orthodoxe scientifique Dr Godwin Baxter.",
    acteurs: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef"],
    dateVu: "2026-01-22",
    contexte: "streaming",
    aveqQui: "seul",
    critique: "Un ovni cinématographique absolument fascinant. Lanthimos crée un univers steampunk surréaliste où Emma Stone livre peut-être la meilleure performance de sa carrière. C'est à la fois drôle, choquant, poétique et profondément humaniste.",
    note: 8,
    coup_de_coeur: false,
    tags: ["surréaliste", "féministe"],
  },
  {
    id: 3,
    titre: "The Substance",
    titre_original: "The Substance",
    realisateur: "Coralie Fargeat",
    annee: 2024,
    genre: "Horreur / Satire",
    duree: "141 min",
    nationalite: "🇫🇷 France",
    affiche: "https://image.tmdb.org/t/p/w500/lqoMzCcZYEFK729d6qzt349fB4o.jpg",
    emoji: "🩸",
    synopsis: "Une star de cinéma déchue utilise un produit mystérieux censé créer une meilleure version d'elle-même.",
    acteurs: ["Demi Moore", "Margaret Qualley", "Dennis Quaid"],
    dateVu: "2026-02-03",
    contexte: "cinéma",
    aveqQui: "amis",
    critique: "Révulsant, génial, implacable. Fargeat signe un body-horror satirique d'une rare audace qui met à nu l'obsession de la société pour la jeunesse et la beauté.",
    note: 8,
    coup_de_coeur: false,
    tags: ["body horror", "satire"],
  },
  {
    id: 4,
    titre: "Flow",
    titre_original: "Straume",
    realisateur: "Gints Zilbalodis",
    annee: 2024,
    genre: "Animation",
    duree: "84 min",
    nationalite: "🇱🇻 Lettonie",
    affiche: "https://image.tmdb.org/t/p/w500/imKSymKBK7o73sajciEmndJoVkR.jpg",
    emoji: "🐈",
    synopsis: "Un chat solitaire se retrouve confronté à des inondations cataclysmiques et doit chercher refuge sur un bateau avec diverses autres espèces.",
    acteurs: ["Personne (film muet)"],
    dateVu: "2026-02-19",
    contexte: "cinéma",
    aveqQui: "seul",
    critique: "L'animation de 2024 la plus touchante. Sans un mot de dialogue, Zilbalodis parvient à nous transporter dans une aventure émotionnellement bouleversante.",
    note: 9,
    coup_de_coeur: true,
    tags: ["animation", "muet", "émouvant"],
  },
  {
    id: 5,
    titre: "Nosferatu",
    titre_original: "Nosferatu",
    realisateur: "Robert Eggers",
    annee: 2024,
    genre: "Horreur / Gothique",
    duree: "132 min",
    nationalite: "🇺🇸 États-Unis",
    affiche: "https://image.tmdb.org/t/p/w500/5qGIxdEO841C0tdY8vKgG14XMLq.jpg",
    emoji: "🧛",
    synopsis: "Une réécriture gothique obsessionnelle du film muet de 1922. Eggers réinterprète le mythe du Comte Orlok.",
    acteurs: ["Bill Skarsgård", "Lily-Rose Depp", "Nicholas Hoult", "Willem Dafoe"],
    dateVu: "2026-03-01",
    contexte: "cinéma",
    aveqQui: "amis",
    critique: "Eggers fait de la peur un art. Son Nosferatu est une vision gothique hypnotisante, tournée comme une peinture de Caravage animée.",
    note: 8,
    coup_de_coeur: false,
    tags: ["gothique", "atmosphère"],
  },
  {
    id: 6,
    titre: "A Complete Unknown",
    titre_original: "A Complete Unknown",
    realisateur: "James Mangold",
    annee: 2024,
    genre: "Biopic / Drame",
    duree: "140 min",
    nationalite: "🇺🇸 États-Unis",
    affiche: "https://image.tmdb.org/t/p/w500/sgh3PJv6PXvQHn1bNlMWRpJAXYz.jpg",
    emoji: "🎸",
    synopsis: "Les années formatrices de Bob Dylan à New York, depuis son arrivée en 1961 jusqu'à la controverse du Newport Folk Festival de 1965.",
    acteurs: ["Timothée Chalamet", "Elle Fanning", "Monica Barbaro", "Edward Norton"],
    dateVu: "2026-03-15",
    contexte: "cinéma",
    aveqQui: "seul",
    critique: "Chalamet incarne Dylan avec une précision et une profondeur remarquables. La scène finale du Newport Folk Festival est électrisante.",
    note: 7,
    coup_de_coeur: false,
    tags: ["musique", "biopic"],
  },
];

// ═══════════════════════════════════════════════
//  CRUD — localStorage
// ═══════════════════════════════════════════════

function chargerFilms() {
  const data = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (data) {
    try {
      let films = JSON.parse(data);
      // Migration : Remplir les critères des films par défaut s'ils sont manquants
      let changed = false;
      films.forEach(f => {
        if (!f.criteres && f.id <= 6) {
          // Injection de notes fictives réalistes se basant vaguement sur la note globale
          const base = f.note ? f.note - 2 : 6;
          f.criteres = {
            realisation: Math.min(10, Math.floor(Math.random()*3) + base),
            image: Math.min(10, Math.floor(Math.random()*3) + base + 1),
            musique: Math.min(10, Math.floor(Math.random()*4) + base),
            decors: Math.min(10, Math.floor(Math.random()*3) + base + 1),
            personnages: Math.min(10, Math.floor(Math.random()*3) + base),
            scenario: Math.min(10, Math.floor(Math.random()*4) + base - 1),
            montage: Math.min(10, Math.floor(Math.random()*4) + base),
            emotions: Math.min(10, Math.floor(Math.random()*3) + base + 1)
          };
          changed = true;
        }
      });
      if (changed) sauvegarderFilms(films);
      return films;
    } catch (e) {
      console.error("Erreur lecture localStorage", e);
    }
  }

  // --- Premier lancement : initialiser avec les films par défaut avec critères ---
  const filmsDefautRich = FILMS_DEFAUT.map(f => {
    if (!f.criteres) {
      const base = f.note ? f.note - 2 : 6;
      f.criteres = {
        realisation: Math.min(10, Math.floor(Math.random()*3) + base),
        image: Math.min(10, Math.floor(Math.random()*3) + base + 1),
        musique: Math.min(10, Math.floor(Math.random()*4) + base),
        decors: Math.min(10, Math.floor(Math.random()*3) + base + 1),
        personnages: Math.min(10, Math.floor(Math.random()*3) + base),
        scenario: Math.min(10, Math.floor(Math.random()*4) + base - 1),
        montage: Math.min(10, Math.floor(Math.random()*4) + base),
        emotions: Math.min(10, Math.floor(Math.random()*3) + base + 1)
      };
    }
    return f;
  });

  sauvegarderFilms(filmsDefautRich);
  return [...filmsDefautRich];
}

function sauvegarderFilms(films) {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(films));
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.error("localStorage plein — impossible de sauvegarder.", e);
      alert("⚠️ Espace de stockage plein. Exporte tes données (⚙️ Paramètres → Exporter) puis supprime quelques films.");
    } else {
      throw e;
    }
  }
}

function getFilmById(id) {
  const films = chargerFilms();
  return films.find(f => f.id === id) || null;
}

function ajouterFilm(filmData) {
  const films = chargerFilms();
  const maxId = films.reduce((max, f) => Math.max(max, f.id), 0);
  const nouveau = { ...filmData, id: maxId + 1 };
  films.push(nouveau);
  sauvegarderFilms(films);
  return nouveau;
}

function modifierFilm(id, filmData) {
  const films = chargerFilms();
  const idx = films.findIndex(f => f.id === id);
  if (idx === -1) return false;
  films[idx] = { ...films[idx], ...filmData, id };
  sauvegarderFilms(films);
  return true;
}

function supprimerFilm(id) {
  const films = chargerFilms();
  const nouveaux = films.filter(f => f.id !== id);
  sauvegarderFilms(nouveaux);
}

// Exposer globalement
window.getFilmById = getFilmById;
window.ajouterFilm = ajouterFilm;
window.modifierFilm = modifierFilm;
window.supprimerFilm = supprimerFilm;
window.chargerFilms = chargerFilms;

// ═══════════════════════════════════════════════
//  TMDB API
// ═══════════════════════════════════════════════

const TMDB = {
  BASE: "https://api.themoviedb.org/3",
  IMG: "https://image.tmdb.org/t/p/w500",
  IMG_ORIGINAL: "https://image.tmdb.org/t/p/original",

  getKey() {
    return localStorage.getItem(CONFIG.TMDB_KEY_STORAGE) || "";
  },

  setKey(key) {
    localStorage.setItem(CONFIG.TMDB_KEY_STORAGE, key.trim());
  },

  hasKey() {
    return !!this.getKey();
  },

  async search(query) {
    if (!this.hasKey()) return [];
    const url = `${this.BASE}/search/movie?api_key=${this.getKey()}&query=${encodeURIComponent(query)}&language=fr-FR&page=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = await res.json();
    return data.results || [];
  },

  async getDetails(tmdbId) {
    const url = `${this.BASE}/movie/${tmdbId}?api_key=${this.getKey()}&language=fr-FR&append_to_response=credits`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    return await res.json();
  },

  posterUrl(path) {
    if (!path) return "";
    return `${this.IMG}${path}`;
  },

  async getImages(tmdbId, max = 12) {
    if (!this.hasKey()) return [];
    const url = `${this.BASE}/movie/${tmdbId}/images?api_key=${this.getKey()}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      // Prend les backdrops (images paysage du film) en premier
      const backdrops = (data.backdrops || [])
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, max)
        .map(img => `${this.IMG_ORIGINAL}${img.file_path}`);
      return backdrops;
    } catch { return []; }
  },

  // Convertit les données TMDB en format CinéJournal
  parseDetails(data) {
    const director = (data.credits?.crew || [])
      .filter(c => c.job === "Director")
      .map(c => c.name)
      .join(", ");

    const acteurs = (data.credits?.cast || [])
      .slice(0, 8)
      .map(a => a.name);

    const genres = (data.genres || [])
      .map(g => g.name)
      .join(" / ");

    // Nationalité à partir des pays de production
    const pays = (data.production_countries || [])[0];
    const flagsMap = {
      "US": "🇺🇸 États-Unis", "FR": "🇫🇷 France", "GB": "🇬🇧 Royaume-Uni",
      "DE": "🇩🇪 Allemagne", "IT": "🇮🇹 Italie", "ES": "🇪🇸 Espagne",
      "JP": "🇯🇵 Japon", "KR": "🇰🇷 Corée du Sud", "AU": "🇦🇺 Australie",
      "CA": "🇨🇦 Canada", "SE": "🇸🇪 Suède", "DK": "🇩🇰 Danemark",
      "LV": "🇱🇻 Lettonie", "NO": "🇳🇴 Norvège", "FI": "🇫🇮 Finlande",
      "BE": "🇧🇪 Belgique", "NL": "🇳🇱 Pays-Bas", "AT": "🇦🇹 Autriche",
      "CH": "🇨🇭 Suisse", "PL": "🇵🇱 Pologne", "MX": "🇲🇽 Mexique",
      "AR": "🇦🇷 Argentine", "BR": "🇧🇷 Brésil", "IN": "🇮🇳 Inde",
      "CN": "🇨🇳 Chine", "RU": "🇷🇺 Russie",
    };
    const nationalite = pays
      ? (flagsMap[pays.iso_3166_1] || pays.name)
      : "";

    return {
      titre: data.title || "",
      titre_original: data.original_title || "",
      realisateur: director,
      annee: data.release_date ? parseInt(data.release_date.split("-")[0]) : "",
      genre: genres,
      duree: data.runtime ? `${data.runtime} min` : "",
      nationalite,
      affiche: this.posterUrl(data.poster_path),
      synopsis: data.overview || "",
      acteurs,
      tmdb_id: data.id,
    };
  },
};

window.TMDB = TMDB;

// ═══════════════════════════════════════════════
//  Utilitaires
// ═══════════════════════════════════════════════

function formaterDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
window.formaterDate = formaterDate;

function noteEnEtoiles(note, max = 10, nbEtoiles = 5) {
  const lit = Math.round((note / max) * nbEtoiles);
  return Array.from({ length: nbEtoiles }, (_, i) =>
    `<span class="${i < lit ? 'lit' : ''}">★</span>`
  ).join('');
}
window.noteEnEtoiles = noteEnEtoiles;

// ═══════════════════════════════════════════════
//  LOGIQUE PAGE PRINCIPALE (index.html)
// ═══════════════════════════════════════════════

let filtreGenre = "tous";
let rechercheQuery = "";
let triActuel = "date-desc";
let modeEdition = false;

function filmsFiltres() {
  let liste = chargerFilms();
  if (filtreGenre !== "tous") {
    liste = liste.filter(f => f.genre.toLowerCase().includes(filtreGenre.toLowerCase()));
  }
  if (rechercheQuery.trim()) {
    const q = rechercheQuery.toLowerCase();
    liste = liste.filter(f =>
      (f.titre || "").toLowerCase().includes(q) ||
      (f.realisateur || "").toLowerCase().includes(q) ||
      (f.genre || "").toLowerCase().includes(q)
    );
  }
  if (triActuel === "date-desc") liste.sort((a, b) => new Date(b.dateVu) - new Date(a.dateVu));
  else if (triActuel === "date-asc") liste.sort((a, b) => new Date(a.dateVu) - new Date(b.dateVu));
  else if (triActuel === "note-desc") liste.sort((a, b) => b.note - a.note);
  else if (triActuel === "alpha") liste.sort((a, b) => a.titre.localeCompare(b.titre));
  return liste;
}

function renderFilms() {
  const grid = document.getElementById("films-grid");
  if (!grid) return;
  const liste = filmsFiltres();

  if (liste.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">🎞️</div><p>Aucun film trouvé.<br><a href="add.html" style="color:var(--gold)">+ Ajouter un film</a></p></div>`;
    return;
  }

  grid.innerHTML = liste.map((film, idx) => `
    <article class="film-card ${modeEdition ? 'edit-mode' : ''}"
      onclick="${modeEdition ? '' : `ouvrirFilm(${film.id})`}"
      style="animation-delay:${idx * 0.05}s"
      tabindex="0" aria-label="${film.titre}">
      <div class="card-poster">
        ${film.affiche
          ? `<img src="${film.affiche}" alt="Affiche ${film.titre}" loading="lazy"
               onerror="this.parentElement.innerHTML='<div class=\\'card-poster-fallback\\'>${film.emoji || '🎬'}</div>'">`
          : `<div class="card-poster-fallback">${film.emoji || '🎬'}</div>`}
        ${modeEdition ? `
          <div class="edit-overlay">
            <button class="edit-btn" onclick="event.stopPropagation(); window.location.href='add.html?edit=${film.id}'">✏️ Modifier</button>
            <button class="delete-btn" onclick="event.stopPropagation(); confirmerSuppr(${film.id}, '${film.titre.replace(/'/g, "\\'")}')">🗑️ Supprimer</button>
          </div>` : `
          <div class="card-overlay">
            <button class="overlay-btn">Voir la critique →</button>
          </div>`}
        ${film.coup_de_coeur ? '<span class="card-badge">❤️ Coup de cœur</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${film.titre}</div>
        <div class="card-meta">
          <span class="card-genre">${(film.genre || '').split(' / ')[0]}</span>
          <span>${film.annee}</span>
        </div>
        <div class="stars">${noteEnEtoiles(film.note)}</div>
        <div class="card-date">${formaterDate(film.dateVu)}</div>
        ${film.tags && film.tags.length ? `<div class="card-tags">${film.tags.slice(0,2).map(t => `<span class="card-tag">#${t}</span>`).join('')}</div>` : ''}
      </div>
    </article>
  `).join('');
}

function ouvrirFilm(id) {
  window.location.href = `film.html?id=${id}`;
}
window.ouvrirFilm = ouvrirFilm;

function confirmerSuppr(id, titre) {
  const modal = document.getElementById('modal-suppr');
  document.getElementById('modal-suppr-titre').textContent = titre;
  modal.style.display = 'flex';
  document.getElementById('btn-suppr-confirm').onclick = () => {
    supprimerFilm(id);
    modal.style.display = 'none';
    renderFilms();
    mettreAJourStats();
  };
  document.getElementById('btn-suppr-cancel').onclick = () => {
    modal.style.display = 'none';
  };
}
window.confirmerSuppr = confirmerSuppr;

function toggleModeEdition() {
  modeEdition = !modeEdition;
  const btn = document.getElementById('btn-edit-mode');
  if (btn) {
    btn.textContent = modeEdition ? '✅ Terminer' : '✏️ Gérer';
    btn.classList.toggle('active', modeEdition);
  }
  renderFilms();
}
window.toggleModeEdition = toggleModeEdition;

function mettreAJourStats() {
  const films = chargerFilms();
  const nbEl = document.getElementById('stat-nb');
  const noteEl = document.getElementById('stat-note');
  const coupEl = document.getElementById('stat-coup');
  if (!nbEl) return;
  nbEl.textContent = films.length;
  const moy = films.length ? (films.reduce((s, f) => s + (f.note || 0), 0) / films.length).toFixed(1) : "—";
  noteEl.textContent = films.length ? moy + "/10" : "—";
  coupEl.textContent = films.filter(f => f.coup_de_coeur).length;
}

function getGenresUniques() {
  const films = chargerFilms();
  const tous = films.flatMap(f => (f.genre || '').split(' / '));
  return [...new Set(tous.filter(Boolean))];
}

function initFiltres() {
  const chipsContainer = document.getElementById('genre-chips');
  if (!chipsContainer) return;
  const genres = ["tous", ...getGenresUniques()];
  chipsContainer.innerHTML = genres.map(g =>
    `<button class="chip ${g === 'tous' ? 'active' : ''}" data-genre="${g}">
      ${g === 'tous' ? '🎬 Tous' : g}
    </button>`
  ).join('');

  chipsContainer.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filtreGenre = chip.dataset.genre;
    renderFilms();
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      rechercheQuery = e.target.value;
      renderFilms();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      triActuel = e.target.value;
      renderFilms();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  mettreAJourStats();
  initFiltres();
  renderFilms();
});
