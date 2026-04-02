// ═══════════════════════════════════════════════
// Chapman Sports — Moteur de Données v2
// Sources: ESPN API (PSG/Ligue1) + TheSportsDB (RCT/Top14) + Google News RSS
// ═══════════════════════════════════════════════

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const NEWS_PROXY = 'https://api.allorigins.win/get?url=';

// ── Config clubs ──────────────────────────────
const CLUBS_CONFIG = {
  psg: {
    name: 'Paris Saint-Germain',
    short: 'PSG',
    sport: 'soccer',
    league: 'fra.1',
    espnSlug: 'paris-saint-germain',
    newsQuery: 'PSG "Paris Saint-Germain" Ligue 1 football',
    badge: 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
    badgeFallback: 'https://www.thesportsdb.com/images/media/team/badge/rwqpsq1473505294.png',
    banner: 'https://images.unsplash.com/photo-1518605368461-1ee7c51272fc?auto=format&fit=crop&q=80&w=2000',
    color: '#004170',
    source: 'espn'
  },
  rct: {
    name: 'RC Toulon',
    short: 'RCT',
    sport: 'rugby',
    sportsdbSearch: 'Toulon',
    newsQuery: '"RC Toulon" OR "RCT" rugby Top 14',
    badge: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/53/Logo_RC_Toulon_2015.svg/600px-Logo_RC_Toulon_2015.svg.png',
    banner: 'https://images.unsplash.com/photo-1544098281-073ea455c1b5?auto=format&fit=crop&q=80&w=2000',
    color: '#DA0000',
    source: 'sportsdb'
  }
};

// ── Cache simple (5 minutes) ──────────────────
const _cache = {};
function cached(key, fn, ttl = 5 * 60 * 1000) {
  if (_cache[key] && Date.now() - _cache[key].ts < ttl) return Promise.resolve(_cache[key].data);
  return fn().then(data => { _cache[key] = { data, ts: Date.now() }; return data; });
}

// ═══════════════════════════════════════════════
//  ESPN API — Football (PSG / Ligue 1)
// ═══════════════════════════════════════════════
const ESPN = {
  async fetch(sport, league, path) {
    const url = `${ESPN_BASE}/${sport}/${league}/${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN ${res.status}`);
    return res.json();
  },

  async getTeamId(espnSlug) {
    return cached(`espn_teamid_${espnSlug}`, async () => {
      const data = await this.fetch('soccer', 'fra.1', 'teams');
      const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
      const found = teams.find(t =>
        t.team.slug === espnSlug ||
        t.team.name.toLowerCase().includes('paris')
      );
      return found?.team?.id || '160'; // fallback ID connu pour PSG
    });
  },

  async getStandings() {
    return cached('espn_ligue1_standings', async () => {
      const data = await this.fetch('soccer', 'fra.1', 'standings');
      const entries = data.children?.[0]?.standings?.entries || [];
      return entries.map(e => {
        const stat = name => e.stats?.find(s => s.name === name)?.value ?? 0;
        return {
          rank: stat('rank') || stat('playoffSeed'),
          name: e.team.displayName || e.team.name,
          short: e.team.abbreviation,
          logo: e.team.logos?.[0]?.href || e.team.logo || '',
          played: stat('gamesPlayed'),
          wins: stat('wins'),
          draws: stat('ties'),
          losses: stat('losses'),
          points: stat('points'),
          gf: stat('pointsFor'),
          ga: stat('pointsAgainst')
        };
      }).sort((a, b) => (a.rank || 99) - (b.rank || 99) || b.points - a.points);
    });
  },

  async getLastMatches(teamId, limit = 5) {
    return cached(`espn_matches_${teamId}`, async () => {
      const data = await this.fetch('soccer', 'fra.1', `teams/${teamId}/schedule`);
      const events = data.events || [];
      const finished = events.filter(e =>
        e.competitions?.[0]?.status?.type?.completed === true
      );
      return finished.slice(-limit).reverse().map(e => {
        const comp = e.competitions[0];
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        const isHome = home?.team?.id === String(teamId);
        const my = isHome ? home : away;
        const opp = isHome ? away : home;
        const myScore = parseInt(my?.score || 0);
        const oppScore = parseInt(opp?.score || 0);
        return {
          id: e.id,
          date: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          opponent: opp?.team?.displayName || opp?.team?.name || '?',
          oppLogo: opp?.team?.logos?.[0]?.href || '',
          isHome,
          myScore,
          oppScore,
          homeScore: parseInt(home?.score || 0),
          awayScore: parseInt(away?.score || 0),
          homeName: home?.team?.displayName || home?.team?.name || '',
          awayName: away?.team?.displayName || away?.team?.name || '',
          result: myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw',
          name: e.name || e.shortName || ''
        };
      });
    });
  },

  async getNextMatch(teamId) {
    return cached(`espn_next_${teamId}`, async () => {
      const data = await this.fetch('soccer', 'fra.1', `teams/${teamId}/schedule`);
      const events = data.events || [];
      const upcoming = events.find(e =>
        e.competitions?.[0]?.status?.type?.state === 'pre' ||
        e.competitions?.[0]?.status?.type?.completed === false
      );
      if (!upcoming) return null;
      const comp = upcoming.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === 'home');
      const away = comp.competitors.find(c => c.homeAway === 'away');
      return {
        date: new Date(upcoming.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        homeName: home?.team?.displayName || home?.team?.name || '',
        awayName: away?.team?.displayName || away?.team?.name || ''
      };
    });
  }
};

// ═══════════════════════════════════════════════
//  TheSportsDB — Rugby (RCT / Top 14)
// ═══════════════════════════════════════════════
const SPORTSDB = {
  async fetch(path) {
    const res = await fetch(`${SPORTSDB_BASE}/${path}`);
    if (!res.ok) throw new Error(`SportsDB ${res.status}`);
    return res.json();
  },

  async getTeam(search) {
    return cached(`sdb_team_${search}`, async () => {
      const data = await this.fetch(`searchteams.php?t=${encodeURIComponent(search)}`);
      // Cherche RC Toulon parmi les résultats
      const teams = data.teams || [];
      return teams.find(t =>
        t.strTeam.toLowerCase().includes('toulon') ||
        t.strAlternate?.toLowerCase().includes('rct')
      ) || teams[0] || null;
    });
  },

  async getLastMatches(teamId, limit = 5) {
    return cached(`sdb_last_${teamId}`, async () => {
      const data = await this.fetch(`eventslast.php?id=${teamId}`);
      return (data.results || []).slice(0, limit);
    });
  },

  async getNextMatches(teamId) {
    return cached(`sdb_next_${teamId}`, async () => {
      const data = await this.fetch(`eventsnext.php?id=${teamId}`);
      return data.events || [];
    });
  },

  async getStandings(leagueId, season = '2024-2025') {
    return cached(`sdb_standings_${leagueId}_${season}`, async () => {
      const data = await this.fetch(`lookuptable.php?l=${leagueId}&s=${season}`);
      return data.table || [];
    });
  },

  async getPlayers(teamId) {
    return cached(`sdb_players_${teamId}`, async () => {
      const data = await this.fetch(`lookup_all_players.php?id=${teamId}`);
      return data.player || [];
    }, 30 * 60 * 1000); // cache 30min pour les joueurs
  }
};

// ═══════════════════════════════════════════════
//  Google News RSS via allorigins.win
// ═══════════════════════════════════════════════
async function fetchGoogleNews(query, max = 8) {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`;
  const proxyUrl = `${NEWS_PROXY}${encodeURIComponent(rssUrl)}`;
  try {
    const res = await fetch(proxyUrl);
    const json = await res.json();
    const xml = new DOMParser().parseFromString(json.contents, 'text/xml');
    const items = [...xml.querySelectorAll('item')].slice(0, max);
    return items.map(item => {
      const rawTitle = item.querySelector('title')?.textContent || '';
      const source = item.querySelector('source')?.textContent || '';
      // Google News inclut la source dans le titre (format: "Titre - Source")
      const title = rawTitle.replace(/ - [^-]+$/, '').trim();
      return {
        title: title || rawTitle,
        link: item.querySelector('link')?.textContent || '#',
        date: item.querySelector('pubDate')?.textContent || '',
        source
      };
    });
  } catch (e) {
    console.error('News fetch error:', e);
    return [];
  }
}

// ═══════════════════════════════════════════════
//  Système de notation des matchs
// ═══════════════════════════════════════════════
function getMatchRatings() {
  try { return JSON.parse(localStorage.getItem('chapman_sport_ratings') || '{}'); }
  catch { return {}; }
}

function saveMatchRating(matchId, ratingData) {
  const ratings = getMatchRatings();
  ratings[matchId] = ratingData;
  localStorage.setItem('chapman_sport_ratings', JSON.stringify(ratings));
}

// ═══════════════════════════════════════════════
//  Auto-refresh (5 minutes)
// ═══════════════════════════════════════════════
let _refreshTimer = null;
let _lastRefresh = null;
const REFRESH_MS = 5 * 60 * 1000;

function startAutoRefresh(callback) {
  if (_refreshTimer) clearInterval(_refreshTimer);
  _refreshTimer = setInterval(callback, REFRESH_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && _lastRefresh && Date.now() - _lastRefresh > REFRESH_MS) {
      callback();
    }
  });
}

function markRefreshed() {
  _lastRefresh = Date.now();
  updateRefreshUI();
}

function updateRefreshUI() {
  const el = document.getElementById('last-refresh');
  if (!el || !_lastRefresh) return;
  const mins = Math.floor((Date.now() - _lastRefresh) / 60000);
  el.textContent = mins === 0 ? 'À l\'instant' : `il y a ${mins} min`;
}

// Mettre à jour l'affichage "il y a X min" chaque minute
setInterval(updateRefreshUI, 60000);

// ── Helpers d'affichage ───────────────────────
function resultBadge(result) {
  const map = { win: ['V', '#27ae60'], draw: ['N', '#f39c12'], loss: ['D', '#e74c3c'] };
  const [label, color] = map[result] || ['?', '#888'];
  return `<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:${color};color:#fff;font-size:0.7rem;font-weight:800;text-align:center;line-height:22px;">${label}</span>`;
}

function renderNewsItem(article, sportIcon = '⚽') {
  const date = article.date
    ? new Date(article.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : '';
  return `
    <a href="${article.link}" target="_blank" rel="noopener" class="news-item" style="align-items:flex-start;">
      <div class="news-thumb" style="background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;">${sportIcon}</div>
      <div class="news-content">
        <h4 style="font-size:0.9rem;line-height:1.4;">${article.title}</h4>
        <span class="news-date">${article.source ? `${article.source} · ` : ''}${date}</span>
      </div>
    </a>`;
}

function renderMatchItem(match, teamId, teamName, ratings) {
  const hasRated = ratings[match.id];
  const resultC = match.result === 'win' ? '#27ae60' : match.result === 'loss' ? '#e74c3c' : '#f39c12';
  return `
    <div class="match-item">
      <div class="match-date" style="min-width:70px;">${match.date}</div>
      <div class="match-teams" style="flex:1;gap:0.5rem;">
        <span class="match-team" style="font-size:0.9rem;${match.isHome ? 'color:#fff;font-weight:700;' : 'color:rgba(255,255,255,0.6);'}">${match.homeName}</span>
        <span class="match-score" style="color:${resultC};font-size:1.1rem;">${match.homeScore} - ${match.awayScore}</span>
        <span class="match-team" style="font-size:0.9rem;${!match.isHome ? 'color:#fff;font-weight:700;' : 'color:rgba(255,255,255,0.6);'}">${match.awayName}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        ${resultBadge(match.result)}
        ${hasRated
          ? `<span style="color:var(--gold);font-size:0.8rem;">⭐${hasRated.score}/10</span>`
          : `<button class="rate-btn" onclick="rateMatch('${match.id}','${(match.name || match.opponent || '').replace(/'/g,"\\'")}')">+ Note</button>`}
      </div>
    </div>`;
}

function renderSportsdbMatchItem(match, teamId, ratings) {
  const isHome = match.idHomeTeam === teamId;
  const myScore = parseInt(isHome ? match.intHomeScore : match.intAwayScore) || 0;
  const oppScore = parseInt(isHome ? match.intAwayScore : match.intHomeScore) || 0;
  const result = myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw';
  const resultC = result === 'win' ? '#27ae60' : result === 'loss' ? '#e74c3c' : '#f39c12';
  const hasRated = ratings[match.idEvent];
  const d = match.dateEvent ? new Date(match.dateEvent).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '?';
  return `
    <div class="match-item">
      <div class="match-date" style="min-width:70px;">${d}</div>
      <div class="match-teams" style="flex:1;gap:0.5rem;">
        <span class="match-team" style="font-size:0.9rem;${isHome ? 'color:#fff;font-weight:700;' : 'color:rgba(255,255,255,0.6);'}">${match.strHomeTeam}</span>
        <span class="match-score" style="color:${resultC};font-size:1.1rem;">${match.intHomeScore} - ${match.intAwayScore}</span>
        <span class="match-team" style="font-size:0.9rem;${!isHome ? 'color:#fff;font-weight:700;' : 'color:rgba(255,255,255,0.6);'}">${match.strAwayTeam}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        ${resultBadge(result)}
        ${hasRated
          ? `<span style="color:var(--gold);font-size:0.8rem;">⭐${hasRated.score}/10</span>`
          : `<button class="rate-btn" onclick="rateMatch('${match.idEvent}','${(match.strEvent || '').replace(/'/g,"\\'")}')">+ Note</button>`}
      </div>
    </div>`;
}

// Exposer globalement ce dont les pages HTML ont besoin
window.ESPN = ESPN;
window.SPORTSDB = SPORTSDB;
window.CLUBS_CONFIG = CLUBS_CONFIG;
window.fetchGoogleNews = fetchGoogleNews;
window.getMatchRatings = getMatchRatings;
window.saveMatchRating = saveMatchRating;
window.startAutoRefresh = startAutoRefresh;
window.markRefreshed = markRefreshed;
window.resultBadge = resultBadge;
window.renderNewsItem = renderNewsItem;
window.renderMatchItem = renderMatchItem;
window.renderSportsdbMatchItem = renderSportsdbMatchItem;
