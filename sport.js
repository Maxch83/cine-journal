// ═══════════════════════════════════════════════
// Chapman Sports : Moteur de Données
// ═══════════════════════════════════════════════

const SPORT_API = {
  DB_BASE: "https://www.thesportsdb.com/api/v1/json/3",
  RSS_PROXY: "https://api.rss2json.com/v1/api.json?rss_url=",

  // --- Moteur d'actualité RSS ---
  async fetchNews(category) {
    // Les sites comme L'Équipe bloquent les proxys gratuits via Cloudflare (Erreur 522).
    // Nous fournissons ici une très belle interface émulée avec des données réalistes récentes pour admirer le visuel.
    return new Promise((resolve) => {
      setTimeout(() => {
        if (category === 'psg') {
          resolve([
            { title: "Mercato : Une nouvelle star cible du PSG ?", pubDate: new Date().toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80"} },
            { title: "Ligue des Champions : Le point sur le groupe", pubDate: new Date(Date.now()-3600000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1518605368461-1ee7c51272fc?auto=format&fit=crop&w=400&q=80"} },
            { title: "Conférence de presse : Les mots du coach", pubDate: new Date(Date.now()-7200000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1574629810360-7efbb6b69fa0?auto=format&fit=crop&w=400&q=80"} }
          ]);
        } else if (category === 'rct') {
           resolve([
            { title: "Top 14 : Toulon arrache la victoire à domicile", pubDate: new Date().toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1544098281-073ea455c1b5?auto=format&fit=crop&w=400&q=80"} },
            { title: "Point Infirmerie : Deux joueurs de retour", pubDate: new Date(Date.now()-3600000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1588661601662-7901ad9c3b88?auto=format&fit=crop&w=400&q=80"} },
            { title: "Pilou-Pilou : Revivez le cri de guerre", pubDate: new Date(Date.now()-7200000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80"} }
          ]);
        } else {
           resolve([
            { title: "Football : Les affiches européennes de la soirée", pubDate: new Date().toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80"} },
            { title: "Formule 1 : Coup de théâtre aux essais", pubDate: new Date(Date.now()-3600000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80"} },
            { title: "NFL : Le résumé explosif de la semaine", pubDate: new Date(Date.now()-7200000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=400&q=80"} },
            { title: "Tennis : Un nouveau record battu", pubDate: new Date(Date.now()-10000000).toISOString(), link: "#", enclosure: {link: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=400&q=80"} }
          ]);
        }
      }, 500);
    });
  },

  // --- TheSportsDB ---
  async getClubDetails(teamName) {
    if (teamName.toLowerCase() === 'rct' || teamName.toLowerCase() === 'toulon') {
      return {
        idTeam: 'RCT-MOCK',
        strTeam: "RC Toulon",
        strLeague: "Top 14",
        idLeague: "TOP14",
        strStadium: "Stade Mayol, Toulon",
        strTeamBadge: "https://upload.wikimedia.org/wikipedia/fr/thumb/5/53/Logo_RC_Toulon_2015.svg/1200px-Logo_RC_Toulon_2015.svg.png",
        strTeamFanart1: "https://images.unsplash.com/photo-1502311285514-9c5950d2bb0f?auto=format&fit=crop&q=80&w=2000",
        strDescriptionFR: "Le Rugby Club toulonnais (RCT) est un club de rugby à XV français fondé en 1908 et basé à Toulon. Quintuple champion de France, le club varois est également triple champion d'Europe (2013, 2014, 2015). Le RCT évolue au Stade Mayol et vibre au rythme du célèbre Pilou-Pilou, son chant de ralliement.",
        intFormedYear: "1908",
        strWebsite: "www.rctoulon.com"
      };
    }
    try {
      // Pour éviter le bug Arsenal du endpoint `lookupteam.php` de l'API gratuite, on passe par la recherche textuelle
      const res = await fetch(`${this.DB_BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`);
      const data = await res.json();
      return data.teams ? data.teams[0] : null;
    } catch (e) {
      console.error("getClubDetails Error:", e);
      return null;
    }
  },

  async getClubPlayers(teamId) {
    if (teamId === 'RCT-MOCK') {
      return [
        { strPlayer: "Charles Ollivon", strPosition: "Troisième ligne", strThumb: "https://media.gettyimages.com/id/1247072535/fr/photo/france-rct-training-session.jpg?s=612x612&w=0&k=20&c=Jd27S8Vv1H9-mSGBaC7uB7p3v9qXzQoK_a2gQxHq2Ww=" },
        { strPlayer: "Gabin Villière", strPosition: "Ailier", strThumb: "https://media.gettyimages.com/id/1368940861/fr/photo/gabin-villiere-of-france-during-the-six-nations-match-between-france-and-italy-at-stade-de.jpg?s=612x612&w=0&k=20&c=a_YcQ22D9-XWf2nE1_ZqgX2p6f5QG6Jt6A-355D28kE=" },
        { strPlayer: "Dan Biggar", strPosition: "Demi d'ouverture", strThumb: "https://media.gettyimages.com/id/1349141014/fr/photo/dan-biggar-of-wales-kicking-during-the-autumn-nations-series-match-between-wales-and.jpg?s=612x612&w=0&k=20&c=_7Pq_0hJ48YxZ8938V9d2f6C_7yH4s6wA1zH3G7sK6Q=" },
        { strPlayer: "Facundo Isa", strPosition: "Troisième ligne", strThumb: "https://media.gettyimages.com/id/1230107248/fr/photo/facundo-isa-of-toulon-looks-on-during-the-top-14-match-between-toulon-and-stade-francais-at.jpg?s=612x612&w=0&k=20&c=M_H5E5uD5S8-6H36Qz9H219N5_S_O9-UoHwF6jA-z0c=" },
        { strPlayer: "Pierre Mignoni", strPosition: "Manager / Entraîneur", strThumb: "https://media.gettyimages.com/id/1242940228/fr/photo/pierre-mignoni-manager-of-lyon-looks-on-prior-to-the-top-14-match-between-lyon-and.jpg?s=612x612&w=0&k=20&c=L_Y6-vP-m5I5U2s9J5P1944Z12K8h21258t6B3zC1P4=" }
      ];
    }
    try {
      // The free tier API 3 allows lookup_all_players
      const res = await fetch(`${this.DB_BASE}/lookup_all_players.php?id=${teamId}`);
      const data = await res.json();
      return data.player || [];
    } catch (e) {
      console.error("getClubPlayers Error:", e);
      return [];
    }
  },

  async getLastMatches(teamId) {
    if (teamId === 'RCT-MOCK') {
      return [
        { dateEvent: "2024-03-30", idHomeTeam: 'RCT-MOCK', strHomeTeam: "RC Toulon", intHomeScore: "20", idAwayTeam: "OPP1", strAwayTeam: "Montpellier", intAwayScore: "19", idEvent: "rct_1", strEvent: "Montpellier" },
        { dateEvent: "2024-03-23", idHomeTeam: 'OPP2', strHomeTeam: "Stade Toulousain", intHomeScore: "35", idAwayTeam: "RCT-MOCK", strAwayTeam: "RC Toulon", intAwayScore: "27", idEvent: "rct_2", strEvent: "Stade Toulousain" },
        { dateEvent: "2024-03-16", idHomeTeam: 'RCT-MOCK', strHomeTeam: "RC Toulon", intHomeScore: "44", idAwayTeam: "OPP3", strAwayTeam: "Castres", intAwayScore: "22", idEvent: "rct_3", strEvent: "Castres" }
      ];
    }
    try {
      const res = await fetch(`${this.DB_BASE}/eventslast.php?id=${teamId}`);
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      console.error("getLastMatches Error:", e);
      return [];
    }
  },

  async getNextMatches(teamId) {
    // Non implémenté dans un premier temps pour gagner de la place
    return [];
  },

  async getStandings(leagueId, season = "2023-2024") {
    if (leagueId === 'TOP14') {
      return [
        { intRank: 1, strTeam: "Stade Toulousain", intPlayed: 18, intWin: 12, intDraw: 1, intLoss: 5, intPoints: 58, strTeamBadge:"https://upload.wikimedia.org/wikipedia/fr/thumb/5/53/Logo_Stade_Toulousain_2020.svg/1200px-Logo_Stade_Toulousain_2020.svg.png" },
        { intRank: 2, strTeam: "Stade Français", intPlayed: 18, intWin: 11, intDraw: 1, intLoss: 6, intPoints: 53, strTeamBadge:"https://upload.wikimedia.org/wikipedia/fr/thumb/8/86/Logo_Stade_fran%C3%A7ais_Paris_2015.svg/1200px-Logo_Stade_fran%C3%A7ais_Paris_2015.svg.png" },
        { intRank: 3, strTeam: "RC Toulon", intPlayed: 18, intWin: 10, intDraw: 0, intLoss: 8, intPoints: 46, strTeamBadge:"https://upload.wikimedia.org/wikipedia/fr/thumb/5/53/Logo_RC_Toulon_2015.svg/1200px-Logo_RC_Toulon_2015.svg.png" },
        { intRank: 4, strTeam: "Bordeaux-Bègles", intPlayed: 18, intWin: 10, intDraw: 0, intLoss: 8, intPoints: 45, strTeamBadge:"https://upload.wikimedia.org/wikipedia/fr/thumb/1/1a/Logo_Union_Bordeaux_B%C3%A8gles_2018.svg/1200px-Logo_Union_Bordeaux_B%C3%A8gles_2018.svg.png" },
      ];
    }
    try {
      const res = await fetch(`${this.DB_BASE}/lookuptable.php?l=${leagueId}&s=${season}`);
      const data = await res.json();
      return data.table || [];
    } catch (e) {
      console.error("getStandings Error:", e);
      return [];
    }
  }
};

// ═══════════════════════════════════════════════
// Système de Notation des matchs en LocalStorage
// ═══════════════════════════════════════════════
function getMatchRatings() {
  const data = localStorage.getItem('chapman_sport_ratings');
  return data ? JSON.parse(data) : {};
}

function saveMatchRating(matchId, ratingData) {
  const ratings = getMatchRatings();
  ratings[matchId] = ratingData; // { score: 8, comment: "Incroyable match, l'attaque a été folle !" }
  localStorage.setItem('chapman_sport_ratings', JSON.stringify(ratings));
}
