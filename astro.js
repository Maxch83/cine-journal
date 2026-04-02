// ═══════════════════════════════════════════════
// AstroBoard : Logique Spatiale (API)
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  fetchNasaAPOD();
  fetchISS();
});

/**
 * Récupère l'Astronomy Picture of the Day de la NASA.
 * Utilise la clé DEMO, qui a une limite de quota, mais suffisante pour un usage perso.
 */
async function fetchNasaAPOD() {
  const titleEl = document.getElementById('apod-title');
  const descEl = document.getElementById('apod-desc');
  const bgEl = document.getElementById('astro-bg');
  const contentEl = document.getElementById('apod-content');

  try {
    const nasaKey = localStorage.getItem('cinejournal_nasa_key') || 'DEMO_KEY';
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaKey}`);

    if (res.status === 429) {
      throw new Error("Quota NASA atteint pour DEMO_KEY.");
    }
    if (!res.ok) throw new Error("Erreur serveur NASA");

    const data = await res.json();

    titleEl.textContent = data.title;

    // S'il s'agit d'une image, on la met en fond. Si c'est une vidéo (ex: youtube), on la met dans le container.
    if (data.media_type === "image") {
      const url = data.hdurl || data.url;
      bgEl.style.backgroundImage = `url('${url}')`;
      descEl.textContent = data.explanation;
    } else if (data.media_type === "video") {
      bgEl.style.backgroundImage = `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80')`;

      contentEl.innerHTML = `
        <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; margin-bottom:1rem;">
          <iframe src="${data.url}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
        <p class="apod-desc">${data.explanation}</p>
      `;
    }

  } catch (error) {
    console.error("APOD Error:", error);
    titleEl.textContent = "Voyage au-delà du système solaire";
    descEl.textContent = "La NASA est temporairement hors de portée (Limitation d'API ou pas de réseau). Voici une ambiance spatiale en attendant de rétablir le signal.";
    // Fallback Unsplash image
    bgEl.style.backgroundImage = `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80')`;
  }
}

/**
 * Récupère le nombre d'humains actuellement dans l'espace.
 */
async function fetchISS() {
  const countEl = document.getElementById('iss-count');
  const listEl = document.getElementById('iss-people');

  try {
    // API Open-Notify (Pas de clé nécessaire, gratuit)
    const res = await fetch('http://api.open-notify.org/astros.json');
    if (!res.ok) throw new Error("Erreur api.open-notify.org");

    const data = await res.json();

    countEl.textContent = data.number;

    if (data.people && data.people.length > 0) {
      listEl.innerHTML = data.people.map(p => `
        <li>
          <strong>${p.name}</strong> 
          <span style="color:var(--text-muted); font-size:0.85rem; margin-left:auto;">(${p.craft})</span>
        </li>
      `).join('');
    } else {
      listEl.innerHTML = "<li style='opacity:0.5'>Personne dans la base...</li>";
    }

  } catch (error) {
    console.error("ISS Fetch Error:", error);
    countEl.textContent = "?";
    listEl.innerHTML = "<li style='color:#e05252'>Transpondeur ISS injoignable...</li>";
  }
}
