// ═══════════════════════════════════════════════
//  CinéJournal : Statistiques & Graphiques
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initStats();
});

function initStats() {
  const films = chargerFilms() || [];
  
  if (films.length === 0) {
    document.getElementById('kpi-total').textContent = '0';
    return;
  }

  // ── 1. Cadrans KPIs ──
  document.getElementById('kpi-total').textContent = films.length;

  let totalMins = 0;
  let sumNote = 0;
  
  films.forEach(f => {
    if (f.duree) {
      const mins = parseInt(f.duree.replace(/\D/g, '')) || 0;
      totalMins += mins;
    }
    const note = f.note_coeur !== undefined ? f.note_coeur : (f.note || 0);
    sumNote += note;
  });

  const heures = Math.floor(totalMins / 60);
  const minutesRestantes = totalMins % 60;
  document.getElementById('kpi-time').innerHTML = `${heures}<span style="font-size:1.2rem; color:var(--text-muted)">h</span> ${minutesRestantes}<span style="font-size:1.2rem; color:var(--text-muted)">m</span>`;

  const avgNote = (sumNote / films.length).toFixed(1);
  document.getElementById('kpi-avg').textContent = avgNote;

  // ── Configuration commune Chart.js ──
  Chart.defaults.color = 'rgba(255,255,255,0.7)';
  Chart.defaults.font.family = "'Outfit', sans-serif";

  // ── 2. Graphique Radar (Critères) ──
  // Récupérer la moyenne de chaque critère technique
  const criteresSum = {};
  const criteresCount = {};

  const CRITERES_LABELS = {
    realisation: { label: "Réalisation" },
    image: { label: "Image / Photo" },
    musique: { label: "Musique" },
    decors: { label: "Décors" },
    personnages: { label: "Acteurs" },
    scenario: { label: "Scénario" },
    montage: { label: "Montage" },
    emotions: { label: "Émotions" }
  };

  Object.keys(CRITERES_LABELS).forEach(k => {
    criteresSum[k] = 0; criteresCount[k] = 0;
  });

  films.forEach(f => {
    if (f.criteres) {
      Object.keys(f.criteres).forEach(k => {
        const val = f.criteres[k];
        if (val > 0 && criteresSum[k] !== undefined) {
          criteresSum[k] += val;
          criteresCount[k]++;
        }
      });
    }
  });

  const radarLabels = Object.values(CRITERES_LABELS).map(c => c.label);
  const radarData = Object.keys(CRITERES_LABELS).map(k => {
    return criteresCount[k] > 0 ? (criteresSum[k] / criteresCount[k]).toFixed(1) : 0;
  });

  const ctxRadar = document.getElementById('radarChart').getContext('2d');
  new Chart(ctxRadar, {
    type: 'radar',
    data: {
      labels: radarLabels,
      datasets: [{
        label: 'Moyenne des critères',
        data: radarData,
        backgroundColor: 'rgba(200, 168, 75, 0.2)', // var(--gold) transparent
        borderColor: '#c8a84b', // var(--gold)
        pointBackgroundColor: '#fff',
        pointBorderColor: '#c8a84b',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: { color: '#fff', font: { size: 11 } },
          ticks: { backdropColor: 'transparent', color: 'transparent', min: 0, max: 10, stepSize: 2 }
        }
      }
    }
  });

  // ── 3. Graphique Doughnut (Genres) ──
  const genresCount = {};
  films.forEach(f => {
    if (f.genre) {
      // Les genres peuvent être "Action / Aventure"
      const parts = f.genre.split('/').map(g => g.trim()).filter(g => g);
      parts.forEach(g => {
        genresCount[g] = (genresCount[g] || 0) + 1;
      });
    }
  });

  // Trier pour n'avoir que le top 6 et grouper le reste dans "Autres"
  const sortedGenres = Object.entries(genresCount).sort((a,b) => b[1] - a[1]);
  const topGenres = sortedGenres.slice(0, 5);
  let autres = 0;
  sortedGenres.slice(5).forEach(g => { autres += g[1] });
  if (autres > 0) topGenres.push(['Autres', autres]);

  const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
  new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: {
      labels: topGenres.map(g => g[0]),
      datasets: [{
        data: topGenres.map(g => g[1]),
        backgroundColor: [
          '#c8a84b', // Gold
          '#b14d4d', // Rouge
          '#3a6ea5', // Bleu foncé
          '#4ca1a3', // Bleu vert
          '#8c52ff', // Violet
          '#555555'  // Gris
        ],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, padding: 15 } }
      },
      cutout: '70%'
    }
  });

  // ── 4. Graphique Bar (Répartition globale des notes) ──
  // Compter le nombre de films par tranche (ex: 8.5 va dans 8.5)
  // On regroupe par pallier de 0.5 entre 0 et 10.
  const notesCount = {};
  for(let i = 0; i <= 10; i += 0.5) notesCount[i.toFixed(1)] = 0;

  films.forEach(f => {
    const note = f.note_coeur !== undefined ? f.note_coeur : (f.note || 0);
    // Arrondir au 0.5
    const rounded = (Math.round(note * 2) / 2).toFixed(1);
    if(notesCount[rounded] !== undefined) {
      notesCount[rounded]++;
    }
  });

  // Enlever les notes où = 0 (facultatif) ou garder tout
  const barLabels = Object.keys(notesCount);
  const barData = Object.values(notesCount);

  // Gradient pour les barres
  const ctxBar = document.getElementById('barChart').getContext('2d');
  const gradientBar = ctxBar.createLinearGradient(0, 0, 0, 300);
  gradientBar.addColorStop(0, '#c8a84b');
  gradientBar.addColorStop(1, 'rgba(200, 168, 75, 0.1)');

  new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [{
        label: 'Nombre de films',
        data: barData,
        backgroundColor: gradientBar,
        borderRadius: 4,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { 
          grid: { display: false },
          title: { display: true, text: 'Note / 10' }
        },
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });

}
