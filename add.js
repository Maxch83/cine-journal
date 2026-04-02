// ═══════════════════════════════════════════════
//  CinéJournal — add.js v3
//  Critères de notation + Note du cœur + IA Gemini
// ═══════════════════════════════════════════════

const CRITERES = [
  { id: 'realisation', label: 'Réalisation',   icon: '🎬', desc: 'Mise en scène & direction' },
  { id: 'image',       label: 'Image',          icon: '📸', desc: 'Photographie & cadrage' },
  { id: 'musique',     label: 'Musique',         icon: '🎵', desc: 'Bande originale & son' },
  { id: 'decors',      label: 'Décors',          icon: '🏛️', desc: 'Production design' },
  { id: 'personnages', label: 'Personnages',     icon: '👥', desc: 'Interprétation & casting' },
  { id: 'scenario',    label: 'Scénario',        icon: '📖', desc: 'Histoire & écriture' },
  { id: 'montage',     label: 'Montage',         icon: '✂️', desc: 'Rythme & construction' },
  { id: 'emotions',    label: 'Impact',          icon: '💥', desc: 'Ressenti émotionnel' },
];

const QUESTIONS_IA = [
  { id: 'q1', label: "Ce qui t'a le plus marqué",           placeholder: "Une image, une scène, un sentiment particulier..." },
  { id: 'q2', label: "Une scène ou moment mémorable",       placeholder: "Décris-la brièvement : ce qui se passe, pourquoi ça t'a touché..." },
  { id: 'q3', label: "Le jeu des acteurs",                  placeholder: "Convaincants ? Décevants ? Une performance qui ressort ?" },
  { id: 'q4', label: "La direction artistique",             placeholder: "Image, décors, costumes — impressionnant ? particulier ?" },
  { id: 'q5', label: "La musique / bande-son",              placeholder: "Mémorable ? Envahissante ? Discrète mais efficace ?" },
  { id: 'q6', label: "Le scénario",                         placeholder: "Surprenant ? Prévisible ? Bien écrit ? Des longueurs ?" },
  { id: 'q7', label: "Ce qui t'a déçu ou moins convaincu", placeholder: "Un point faible, une incohérence, une déception..." },
  { id: 'q8', label: "À qui le recommanderais-tu ?",        placeholder: "Pour qui, dans quel contexte, pourquoi ?" },
  { id: 'q9', label: "Ton ressenti global en une phrase",   placeholder: "Spontané et sincère..." },
];

const COEUR_LABELS = [
  "Déplace le curseur…", "Franchement nul", "Vraiment pas convaincu",
  "Bof, décevant", "Je l'oublierai vite", "Correct, sans plus",
  "Sympa, j'ai passé un bon moment", "Content de l'avoir vu",
  "Très apprécié, j'y repenserai", "Coup de cœur sincère ❤️", "Film de ma vie ✨"
];

// ── État ──────────────────────────────────────
let editId = null;
let acteursList = [];
let tagsList = [];
let criteresValues = {};
let noteCoeur = 0;
let tmdbDebounce = null;
let tmdbImages = [];
CRITERES.forEach(c => criteresValues[c.id] = 0);

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const editParam = params.get('edit');
  if (editParam) {
    editId = parseInt(editParam, 10);
    const film = getFilmById(editId);
    if (film) {
      document.title = `Modifier — ${film.titre} — CinéJournal`;
      document.getElementById('page-title').textContent = "✏️ Modifier le film";
      document.getElementById('submit-btn-text').textContent = "Sauvegarder les modifications";
      // NE PAS appeler prefillForm ici — les éléments HTML n'existent pas encore
    }
  }

  // Initialiser tous les composants D'ABORD (crée les sliders, étoiles, etc.)
  initCriteres();
  initNoteCoeur();
  initQuestionnaire();
  initTmdbSearch();
  initActeurs();
  initTags();
  initAffichePreview();
  initForm();
  checkIaKey();
  checkTmdbKey();

  // Compteur critique
  const critique = document.getElementById('critique');
  const counter = document.getElementById('critique-count');
  if (critique && counter) {
    critique.addEventListener('input', () => { counter.textContent = critique.value.length; });
  }

  // MAINTENANT pré-remplir le formulaire — tous les éléments HTML existent
  if (editParam) {
    const film = getFilmById(parseInt(editParam, 10));
    if (film) prefillForm(film);
  }
});

// ═══════════════════════════════════════════════
//  HALF-STARS — affichage visuel
// ═══════════════════════════════════════════════
function renderHalfStars(value, container, numStars = 5, max = 10) {
  if (!container) return;
  const perStar = max / numStars;
  container.innerHTML = Array.from({ length: numStars }, (_, i) => {
    const full = (i + 1) * perStar;
    const half = full - perStar / 2;
    let cls = 'hs-empty';
    if (value >= full) cls = 'hs-full';
    else if (value >= half) cls = 'hs-half';
    return `<span class="${cls}">★</span>`;
  }).join('');
}

// ═══════════════════════════════════════════════
//  CRITÈRES DE NOTATION
// ═══════════════════════════════════════════════
function initCriteres() {
  const grid = document.getElementById('criteres-grid');
  if (!grid) return;

  grid.innerHTML = CRITERES.map(c => `
    <div class="critere-card" id="card-${c.id}">
      <div class="critere-header">
        <span class="critere-icon">${c.icon}</span>
        <div class="critere-info">
          <span class="critere-label">${c.label}</span>
          <span class="critere-desc">${c.desc}</span>
        </div>
        <span class="critere-val" id="val-${c.id}">—</span>
      </div>
      <div class="critere-stars" id="stars-${c.id}">
        ${Array(5).fill('<span class="hs-empty">★</span>').join('')}
      </div>
      <input type="range" id="slider-${c.id}" class="critere-slider"
        min="0" max="10" step="0.5" value="0"
        oninput="setCritere('${c.id}', parseFloat(this.value))">
      <div class="critere-minmax"><span>0</span><span>10</span></div>
    </div>
  `).join('');
}

function setCritere(id, val) {
  criteresValues[id] = val;
  document.getElementById(`val-${id}`).textContent = val % 1 === 0 ? val+'/10' : val+'/10';
  renderHalfStars(val, document.getElementById(`stars-${id}`));
  updateNoteCalculee();
}

function updateNoteCalculee() {
  const vals = CRITERES.map(c => criteresValues[c.id]).filter(v => v > 0);
  if (!vals.length) {
    document.getElementById('note-calc-val').textContent = '—';
    renderHalfStars(0, document.getElementById('note-calc-stars'));
    return;
  }
  const moy = vals.reduce((a,b) => a+b, 0) / vals.length;
  const arrondi = Math.round(moy * 2) / 2;
  document.getElementById('note-calc-val').textContent = arrondi.toFixed(1);
  renderHalfStars(arrondi, document.getElementById('note-calc-stars'));
}

function getNoteTechnique() {
  const vals = CRITERES.map(c => criteresValues[c.id]).filter(v => v > 0);
  if (!vals.length) return 0;
  const moy = vals.reduce((a,b) => a+b, 0) / vals.length;
  return Math.round(moy * 2) / 2;
}

// ═══════════════════════════════════════════════
//  NOTE DU CŒUR
// ═══════════════════════════════════════════════
function initNoteCoeur() {
  const slider = document.getElementById('coeur-slider');
  if (!slider) return;
  slider.addEventListener('input', () => setNoteCoeur(parseFloat(slider.value)));
}

function setNoteCoeur(val) {
  noteCoeur = val;
  const valEl = document.getElementById('coeur-val');
  const labelEl = document.getElementById('coeur-label-text');
  const starsEl = document.getElementById('coeur-stars');
  const slider = document.getElementById('coeur-slider');
  if (valEl) valEl.textContent = val % 1 === 0 ? val : val.toFixed(1);
  if (labelEl) labelEl.textContent = COEUR_LABELS[Math.floor(val)] || '';
  if (slider) slider.value = val;
  renderHalfStars(val, starsEl);
}

// ═══════════════════════════════════════════════
//  TMDB SEARCH
// ═══════════════════════════════════════════════
function initTmdbSearch() {
  const input = document.getElementById('tmdb-search');
  const dropdown = document.getElementById('tmdb-dropdown');
  const statusEl = document.getElementById('tmdb-status');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(tmdbDebounce);
    if (q.length < 2) { dropdown.style.display = 'none'; return; }
    if (!TMDB.hasKey()) {
      statusEl.innerHTML = `⚠️ Clé TMDB non configurée. <a href="settings.html">Configurer →</a>`;
      statusEl.className = 'tmdb-status warn'; return;
    }
    statusEl.innerHTML = '🔍 Recherche…'; statusEl.className = 'tmdb-status loading';
    tmdbDebounce = setTimeout(async () => {
      try {
        const results = await TMDB.search(q);
        renderTmdbDropdown(results, dropdown);
        statusEl.innerHTML = results.length ? `✅ ${results.length} résultat(s)` : '❌ Aucun résultat';
        statusEl.className = `tmdb-status ${results.length ? 'ok' : 'error'}`;
      } catch {
        statusEl.innerHTML = `❌ Erreur TMDB. <a href="settings.html">Vérifier la clé</a>`;
        statusEl.className = 'tmdb-status error';
        dropdown.style.display = 'none';
      }
    }, 400);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.tmdb-search-wrap')) dropdown.style.display = 'none';
  });
}

function renderTmdbDropdown(results, dropdown) {
  if (!results.length) { dropdown.style.display = 'none'; return; }
  dropdown.innerHTML = results.slice(0, 7).map(m => `
    <div class="tmdb-result" data-id="${m.id}">
      <div class="tmdb-result-poster">
        ${m.poster_path
          ? `<img src="https://image.tmdb.org/t/p/w92${m.poster_path}" loading="lazy">`
          : `<div class="tmdb-no-poster">🎬</div>`}
      </div>
      <div class="tmdb-result-info">
        <div class="tmdb-result-title">${m.title}</div>
        <div class="tmdb-result-meta">${m.release_date ? m.release_date.split('-')[0] : 'N/A'}</div>
      </div>
      <div class="tmdb-result-score">${m.vote_average ? m.vote_average.toFixed(1) : '—'}</div>
    </div>`).join('');
  dropdown.style.display = 'block';
  dropdown.querySelectorAll('.tmdb-result').forEach(el => {
    el.addEventListener('click', () => loadTmdbFilm(parseInt(el.dataset.id)));
  });
}

async function loadTmdbFilm(tmdbId) {
  const dropdown = document.getElementById('tmdb-dropdown');
  const statusEl = document.getElementById('tmdb-status');
  const loader = document.getElementById('tmdb-loading');
  dropdown.style.display = 'none';
  if (loader) loader.style.display = 'flex';
  try {
    // Charge détails + images en parallèle
    const [details, images] = await Promise.all([
      TMDB.getDetails(tmdbId),
      TMDB.getImages(tmdbId, 12)
    ]);
    const parsed = TMDB.parseDetails(details);
    remplirFormulaire(parsed);
    // Stocker les images chargées depuis TMDB
    tmdbImages = images;
    renderImagesPreview(images);
    statusEl.innerHTML = `✅ Film chargé : <strong>${parsed.titre}</strong> — ${images.length} image(s) TMDB`;
    statusEl.className = 'tmdb-status ok';
    document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' });
  } catch(e) {
    statusEl.innerHTML = `❌ Erreur lors du chargement.`;
    statusEl.className = 'tmdb-status error';
    console.error(e);
  } finally {
    if (loader) loader.style.display = 'none';
  }
}

function renderImagesPreview(images) {
  const section = document.getElementById('tmdb-images-section');
  const grid = document.getElementById('tmdb-images-grid');
  if (!section || !grid) return;
  if (!images || images.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';
  grid.innerHTML = images.map((url, i) => `
    <div class="tmdb-img-thumb ${tmdbImages.includes(url) ? 'selected' : ''}" data-url="${url}" onclick="toggleTmdbImage('${url}', this)">
      <img src="${url}" loading="lazy" alt="Image ${i+1}">
      <div class="tmdb-img-check">✓</div>
    </div>`).join('');
  // Sélectionner automatiquement les 5 premières
  const thumbs = grid.querySelectorAll('.tmdb-img-thumb');
  let count = 0;
  thumbs.forEach(thumb => {
    if (count < 5) { thumb.classList.add('selected'); count++; }
  });
  syncSelectedImages();
}

function toggleTmdbImage(url, el) {
  el.classList.toggle('selected');
  syncSelectedImages();
}
window.toggleTmdbImage = toggleTmdbImage;

function syncSelectedImages() {
  const grid = document.getElementById('tmdb-images-grid');
  if (!grid) return;
  tmdbImages = Array.from(grid.querySelectorAll('.tmdb-img-thumb.selected')).map(el => el.dataset.url);
}

function remplirFormulaire(data) {
  setVal('titre', data.titre); setVal('titre_original', data.titre_original);
  setVal('realisateur', data.realisateur); setVal('annee', data.annee);
  setVal('genre', data.genre); setVal('duree', data.duree);
  setVal('nationalite', data.nationalite); setVal('synopsis', data.synopsis);
  setVal('affiche', data.affiche);
  if (data.affiche) updateAffichePreview(data.affiche);
  acteursList = [...data.acteurs]; renderActeurs();
  setVal('tmdb-search', '');
}

// ═══════════════════════════════════════════════
//  QUESTIONNAIRE IA
// ═══════════════════════════════════════════════
function initQuestionnaire() {
  const container = document.getElementById('questionnaire');
  if (!container) return;

  container.innerHTML = QUESTIONS_IA.map((q, i) => `
    <div class="q-item">
      <label class="q-label" for="${q.id}">
        <span class="q-num">${i + 1}</span>
        ${q.label}
      </label>
      <textarea id="${q.id}" class="field-input field-textarea q-textarea"
        rows="2" placeholder="${q.placeholder}"></textarea>
    </div>
  `).join('');

  const btn = document.getElementById('generer-btn');
  const regenBtn = document.getElementById('regenerer-btn');
  if (btn) btn.addEventListener('click', genererCritique);
  if (regenBtn) regenBtn.addEventListener('click', genererCritique);
}

async function genererCritique() {
  const groqKey  = localStorage.getItem('cinejournal_groq_key');
  const geminiKey = localStorage.getItem('cinejournal_gemini_key');

  if (!groqKey && !geminiKey) {
    showToast('❌ Aucune clé IA configurée. Va dans ⚙️ Paramètres.', 'error');
    const iaErr = document.getElementById('ia-error-msg');
    if (iaErr) {
      iaErr.innerHTML = `❌ <strong>Aucune clé IA.</strong> Va dans <a href="settings.html" style="color:#c8a84b">⚙️ Paramètres</a> et configure une clé <strong>Groq</strong> (recommandé, gratuit) ou Gemini.`;
      iaErr.style.display = 'block';
    }
    return;
  }

  const titre = getVal('titre') || 'Film inconnu';
  const realisateur = getVal('realisateur') || 'réalisateur inconnu';
  const annee = getVal('annee') || '';
  const genre = getVal('genre') || '';

  // Vérifier qu'au moins quelques questions ont des réponses
  const reponses = QUESTIONS_IA.map(q => ({
    question: q.label,
    reponse: (document.getElementById(q.id)?.value || '').trim()
  })).filter(r => r.reponse.length > 0);

  if (reponses.length < 2) {
    showToast('⚠️ Réponds à au moins 2 questions pour générer une critique.', 'error');
    return;
  }

  const noteTech = getNoteTechnique();
  const criteresTxt = CRITERES
    .map(c => `• ${c.label} : ${criteresValues[c.id]}/10`)
    .join('\n');

  const prompt = `Tu es un critique de cinéma personnel et passionné. L'utilisateur a vu le film "${titre}" (${annee}) de ${realisateur}, genre : ${genre}.

Ses notes par critère :
${criteresTxt}
Note technique globale : ${noteTech || '?'}/10
Note du cœur (ressenti pur) : ${noteCoeur}/10

Ses réponses à mes questions :
${reponses.map((r, i) => `${i + 1}. ${r.question}\n→ ${r.reponse}`).join('\n\n')}

À partir de CES informations uniquement, rédige une critique de cinéma personnelle et authentique (200 à 280 mots) avec ces règles absolues :
- Écrite entièrement à la première personne (je, mon, ma, mes)
- Commence par une phrase d'accroche originale (pas "J'ai regardé...")
- Mentionne des détails SPÉCIFIQUES tirés des réponses ci-dessus
- Reflète fidèlement le ton : si enthousiaste → enthousiaste ; si déçu → nuancé et critique
- Ne cite pas les notes en chiffres dans le texte
- Conclus sur une recommandation sincère
- Style : celui d'un cinéphile passionné et intelligent, pas d'un journaliste corporate
- La critique doit être UNIQUE et ne jamais ressembler à une autre

Génère UNIQUEMENT la critique, sans commentaires ni introduction.`;

  // UI loading
  const btn = document.getElementById('generer-btn');
  const regenBtn = document.getElementById('regenerer-btn');
  const loadingEl = document.getElementById('ia-loading');
  const resultEl = document.getElementById('critique-result');
  if (btn) btn.disabled = true;
  if (loadingEl) loadingEl.style.display = 'flex';
  if (resultEl) resultEl.style.display = 'none';

  try {
    let texte = "";

    if (groqKey) {
      // 🚀 Appel API GROQ (Llama 3)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Tu es un critique de cinéma passionné, pointu et sincère. Réponds toujours en français." },
            { role: "user", content: prompt }
          ],
          temperature: 0.85,
          max_tokens: 800,
          top_p: 0.9
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Erreur Groq ${res.status}`);
      }

      const data = await res.json();
      texte = data.choices?.[0]?.message?.content;
      if (!texte) throw new Error("Réponse vide de Groq.");

    } else if (geminiKey) {
      // 🌟 Appel API GEMINI (Fallback)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.92, maxOutputTokens: 700, topP: 0.95 }
          })
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Erreur Gemini ${res.status}`);
      }

      const data = await res.json();
      texte = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texte) throw new Error("Réponse vide de Gemini.");
    }

    const textarea = document.getElementById('critique');
    if (textarea) {
      textarea.value = texte.trim();
      document.getElementById('critique-count').textContent = texte.trim().length;
    }
    if (resultEl) resultEl.style.display = 'block';
    resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('✅ Critique générée avec succès !', 'success');
  } catch (e) {
    const msg = e.message || '';
    let userMsg = '';
    let toastMsg = '';

    if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('free_tier') || msg.includes('limit')) {
      userMsg = `
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <div style="font-size:1rem;font-weight:700;color:#ffd97a;">⚠️ Quota API à 0 — voici comment régler ça définitivement</div>
          <p style="color:rgba(255,255,255,0.8);font-size:0.88rem;line-height:1.6;margin:0">
            Ta clé API est rattachée à un projet Google Cloud <strong>avec facturation activée</strong>, 
            ce qui bloque le quota gratuit. Avoir Gemini Pro (Google One) ne donne pas accès à l'API — 
            il faut une clé d'un <strong>projet SANS facturation</strong>.
          </p>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:1rem;font-size:0.85rem;">
            <strong style="color:#b0a0ff;">✅ Solution en 3 étapes :</strong><br><br>
            <strong style="color:#fff;">① Va sur :</strong> 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#7ab8f5">aistudio.google.com/app/apikey</a><br><br>
            <strong style="color:#fff;">② Clique "+ Create API Key"</strong> → choisis <em>"Create API key in new project"</em><br>
            <span style="color:rgba(255,255,255,0.5);font-size:0.8rem;">(Important : new project = pas de facturation = quota gratuit actif)</span><br><br>
            <strong style="color:#fff;">③ Copie la nouvelle clé</strong> → va dans 
            <a href="settings.html" style="color:#c8a84b">⚙️ Paramètres</a>, 
            supprime l'ancienne clé, colle la nouvelle, clique <em>Sauvegarder</em>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin:0">
            💡 Si tu veux vérifier : sur AI Studio, ta clé doit afficher le projet comme <em>"Generative Language Client"</em> ou similaire, sans mention "Billing enabled".
          </p>
        </div>`;
      toastMsg = '⚠️ Quota bloqué — suis les étapes dans le formulaire';
    } else if (msg.includes('API_KEY_INVALID') || msg.includes('invalid') || msg.includes('401') || msg.includes('403')) {
      userMsg = `❌ <strong>Clé API invalide ou refusée.</strong> Va dans <a href="settings.html" style="color:#c8a84b">⚙️ Paramètres</a>, supprime la clé et colle-en une nouvelle depuis <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#7ab8f5">AI Studio</a>.`;
      toastMsg = '❌ Clé API Gemini invalide';
    } else if (msg.includes('not found') || msg.includes('404')) {
      userMsg = `❌ <strong>Modèle introuvable.</strong> Va dans <a href="settings.html" style="color:#c8a84b">⚙️ Paramètres</a> et change le modèle IA.`;
      toastMsg = '❌ Modèle Gemini introuvable';
    } else if (msg.includes('NetworkError') || msg.includes('fetch') || msg.includes('Failed')) {
      userMsg = `🌐 <strong>Erreur réseau.</strong> Vérifie ta connexion internet et réessaie.`;
      toastMsg = '🌐 Erreur réseau';
    } else {
      userMsg = `❌ <strong>Erreur IA :</strong> ${msg}`;
      toastMsg = `❌ Erreur IA`;
    }

    const iaErrorEl = document.getElementById('ia-error-msg');
    if (iaErrorEl) {
      iaErrorEl.innerHTML = userMsg;
      iaErrorEl.style.display = 'block';
      iaErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(toastMsg, 'error');
    console.error('Gemini error:', e);
  } finally {
    if (btn) btn.disabled = false;
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════
//  VÉRIFICATIONS CLÉS API
// ═══════════════════════════════════════════════
function checkIaKey() {
  const banner = document.getElementById('gemini-key-banner');
  if (!banner) return;
  const hasGroq = !!localStorage.getItem('cinejournal_groq_key');
  const hasGemini = !!localStorage.getItem('cinejournal_gemini_key');
  banner.style.display = (hasGroq || hasGemini) ? 'none' : 'flex';
}

function checkTmdbKey() {
  const banner = document.getElementById('tmdb-key-banner');
  if (banner) banner.style.display = TMDB.hasKey() ? 'none' : 'flex';
}

// ═══════════════════════════════════════════════
//  AFFICHE PREVIEW
// ═══════════════════════════════════════════════
function initAffichePreview() {
  const input = document.getElementById('affiche');
  if (input) input.addEventListener('input', () => updateAffichePreview(input.value.trim()));
}

function updateAffichePreview(url) {
  const img = document.getElementById('affiche-img');
  const placeholder = document.getElementById('affiche-placeholder');
  if (!img) return;
  if (url) {
    img.src = url; img.style.display = 'block';
    img.onerror = () => { img.style.display = 'none'; if (placeholder) placeholder.style.display = 'flex'; };
    img.onload  = () => { if (placeholder) placeholder.style.display = 'none'; };
  } else {
    img.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
  }
}

// ═══════════════════════════════════════════════
//  ACTEURS & TAGS
// ═══════════════════════════════════════════════
function initActeurs() {
  const input = document.getElementById('acteur-input');
  const btn = document.getElementById('acteur-add-btn');
  if (!input || !btn) return;
  const ajouter = () => {
    const v = input.value.trim();
    if (v && !acteursList.includes(v)) { acteursList.push(v); renderActeurs(); input.value = ''; }
    input.focus();
  };
  btn.addEventListener('click', ajouter);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouter(); } });
}

function renderActeurs() {
  const c = document.getElementById('acteurs-chips');
  if (!c) return;
  c.innerHTML = acteursList.map((a, i) =>
    `<span class="dynamic-chip">${a}<button type="button" onclick="supprimerActeur(${i})">×</button></span>`
  ).join('');
}
window.supprimerActeur = i => { acteursList.splice(i, 1); renderActeurs(); };

function initTags() {
  const input = document.getElementById('tag-input');
  const btn = document.getElementById('tag-add-btn');
  if (!input || !btn) return;
  const ajouter = () => {
    const v = input.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (v && !tagsList.includes(v)) { tagsList.push(v); renderTags(); input.value = ''; }
    input.focus();
  };
  btn.addEventListener('click', ajouter);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ajouter(); } });
}

function renderTags() {
  const c = document.getElementById('tags-chips');
  if (!c) return;
  c.innerHTML = tagsList.map((t, i) =>
    `<span class="dynamic-chip tag-chip">#${t}<button type="button" onclick="supprimerTag(${i})">×</button></span>`
  ).join('');
}
window.supprimerTag = i => { tagsList.splice(i, 1); renderTags(); };

window.ajouterTagSuggere = tag => {
  if (!tagsList.includes(tag)) { tagsList.push(tag); renderTags(); }
};

// ═══════════════════════════════════════════════
//  PREFILL (mode édition)
// ═══════════════════════════════════════════════
function prefillForm(film) {
  setVal('titre', film.titre); setVal('titre_original', film.titre_original || '');
  setVal('realisateur', film.realisateur); setVal('annee', film.annee);
  setVal('genre', film.genre); setVal('duree', film.duree);
  setVal('nationalite', film.nationalite); setVal('synopsis', film.synopsis);
  setVal('affiche', film.affiche); setVal('emoji', film.emoji || '🎬');
  setVal('dateVu', film.dateVu); setVal('contexte', film.contexte || 'cinéma');
  setVal('aveqQui', film.aveqQui || 'seul');
  if (film.affiche) updateAffichePreview(film.affiche);

  // Critères
  if (film.criteres) {
    CRITERES.forEach(c => {
      const val = film.criteres[c.id] || 0;
      const slider = document.getElementById(`slider-${c.id}`);
      if (slider) slider.value = val;
      setCritere(c.id, val);
    });
  } else if (film.note) {
    // Rétro-compatibilité
    CRITERES.forEach(c => {
      const slider = document.getElementById(`slider-${c.id}`);
      if (slider) slider.value = film.note;
      setCritere(c.id, film.note);
    });
  }

  // Note du cœur
  const coeurVal = film.note_coeur || film.note || 0;
  setNoteCoeur(coeurVal);

  // Critique
  const critiqueEl = document.getElementById('critique');
  if (critiqueEl && film.critique) {
    critiqueEl.value = film.critique;
    const resultEl = document.getElementById('critique-result');
    if (resultEl) resultEl.style.display = 'block';
    const counter = document.getElementById('critique-count');
    if (counter) counter.textContent = film.critique.length;
  }

  // Coup de cœur
  const toggle = document.getElementById('coup-coeur');
  if (toggle) toggle.checked = !!film.coup_de_coeur;

  // Acteurs & tags
  acteursList = [...(film.acteurs || [])]; renderActeurs();
  tagsList = [...(film.tags || [])]; renderTags();

  // Images existantes
  if (film.images && film.images.length > 0) {
    tmdbImages = [...film.images];
    renderImagesPreview(film.images);
    // Désélectionner toutes et re-sélectionner les images sauvegardées
    setTimeout(() => {
      const grid = document.getElementById('tmdb-images-grid');
      if (!grid) return;
      grid.querySelectorAll('.tmdb-img-thumb').forEach(thumb => {
        if (film.images.includes(thumb.dataset.url)) {
          thumb.classList.add('selected');
        } else {
          thumb.classList.remove('selected');
        }
      });
    }, 100);
  }
}

// ═══════════════════════════════════════════════
//  SOUMISSION
// ═══════════════════════════════════════════════
function initForm() {
  const form = document.getElementById('add-film-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const titre = getVal('titre');
    const dateVu = getVal('dateVu');
    const critique = document.getElementById('critique')?.value?.trim() || '';
    const noteTech = getNoteTechnique();

    if (!titre) { showToast('❌ Le titre est obligatoire.', 'error'); return; }
    if (!dateVu) { showToast('❌ La date de visionnage est obligatoire.', 'error'); return; }
    if (!noteTech && !noteCoeur) { showToast('❌ Attribue au moins une note.', 'error'); return; }

    const filmData = {
      titre, titre_original: getVal('titre_original'),
      realisateur: getVal('realisateur'), annee: parseInt(getVal('annee')) || null,
      genre: getVal('genre'), duree: getVal('duree'), nationalite: getVal('nationalite'),
      affiche: getVal('affiche'), emoji: getVal('emoji') || '🎬',
      synopsis: getVal('synopsis'), acteurs: [...acteursList],
      dateVu, contexte: getVal('contexte'), aveqQui: getVal('aveqQui'),
      critique,
      criteres: { ...criteresValues },
      note: noteTech || noteCoeur,          // rétro-compat
      note_coeur: noteCoeur,
      coup_de_coeur: document.getElementById('coup-coeur')?.checked || false,
      tags: [...tagsList],
      images: [...tmdbImages],
    };

    if (editId) { modifierFilm(editId, filmData); showToast('✅ Film modifié !', 'success'); }
    else { ajouterFilm(filmData); showToast('✅ Film ajouté au journal !', 'success'); }
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  });

  const cancelBtn = document.getElementById('cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
}

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════
function getVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val || ''; }

function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast toast-${type} toast-show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}
