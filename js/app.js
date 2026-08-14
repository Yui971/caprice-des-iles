/* ============================================
   CAPRICE DES ÎLES — app.js V4
   ============================================ */

const state = {
  menu: null,
  lang: 'fr',
};

const LOADER_MIN_DURATION = 1400;
const LOADER_START = performance.now();

// ---- TRADUCTIONS UI ----
const uiText = {
  fr: {
    loading: 'Chargement de la carte…',
    error: 'Impossible de charger la carte. Réessayez plus tard.',
    heroWelcome: 'Bienvenue au',
    heroTagline: 'Saveurs authentiques des Antilles',
    reservationLabel: 'Réservation :',
    scrollMenu: 'Découvrir la carte',
    sidebarLabel: 'La carte',
    reviewTitle: 'Vous avez aimé&nbsp;?',
    reviewText: 'Partagez votre expérience et aidez d\'autres gourmets à découvrir le Caprice des Îles.',
    reviewBtn: 'Laisser un avis sur Google',
    reviewSee: 'Voir tous les avis',
    heroReviewLink: 'Laissez-nous un avis',
    pwaInstall: "Installer l'app",
    footerTagline: 'Saveurs des Antilles',
    footerContactHeading: 'Nous trouver',
    creditsText: 'Design & développement par',
    legalLink: 'Mentions légales',
    htmlLang: 'fr',
    legalTitle: 'Mentions légales',
    legalContent: `
      <h3>Éditeur du site</h3>
      <p>Restaurant <strong>Caprice des Îles</strong><br>
      Av. du Père Labat, Baillif 97123, Guadeloupe<br>
      Téléphone : +590 590 81 74 97</p>

      <h3>Conception &amp; développement</h3>
      <p>Ce site a été conçu et développé par <strong>Chrisnaël Berdier</strong>,
      étudiant en BUT MMI — Parcours Création Numérique à l'IUT de Guadeloupe.</p>
      <p>
        <a href="https://chrisnaelberdier.com/" target="_blank" rel="noopener">Portfolio</a> ·
        <a href="https://www.linkedin.com/in/chrisna%C3%ABl-berdier-b634a3389/" target="_blank" rel="noopener">LinkedIn</a>
      </p>

      <h3>Hébergement</h3>
      <p>Ce site est hébergé par <strong>GitHub Pages</strong> — GitHub Inc.,
      88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis.</p>

      <h3>Propriété intellectuelle</h3>
      <p>L'ensemble des contenus (textes, photos, logo, mise en forme) présents sur ce site
      est la propriété du restaurant Caprice des Îles, sauf mention contraire. Toute reproduction
      sans autorisation préalable est interdite.</p>

      <h3>Données personnelles</h3>
      <p>Ce site ne collecte aucune donnée personnelle et n'utilise aucun cookie de suivi.</p>
    `,
  },
  en: {
    loading: 'Loading menu…',
    error: 'Unable to load the menu. Please try again later.',
    heroWelcome: 'Welcome to',
    heroTagline: 'Authentic Caribbean flavors',
    reservationLabel: 'Reservations:',
    scrollMenu: 'Discover the menu',
    sidebarLabel: 'The menu',
    reviewTitle: 'Did you enjoy?',
    reviewText: 'Share your experience and help other food lovers discover Caprice des Îles.',
    reviewBtn: 'Leave a review on Google',
    reviewSee: 'See all reviews',
    heroReviewLink: 'Leave us a review',
    pwaInstall: 'Install the app',
    footerTagline: 'Caribbean flavors',
    footerContactHeading: 'Find us',
    creditsText: 'Designed & developed by',
    legalLink: 'Legal notice',
    htmlLang: 'en',
    legalTitle: 'Legal Notice',
    legalContent: `
      <h3>Publisher</h3>
      <p><strong>Caprice des Îles</strong> Restaurant<br>
      Av. du Père Labat, Baillif 97123, Guadeloupe<br>
      Phone: +590 590 81 74 97</p>

      <h3>Design &amp; Development</h3>
      <p>This website was designed and developed by <strong>Chrisnaël Berdier</strong>,
      a Multimedia &amp; Internet student at IUT de Guadeloupe.</p>
      <p>
        <a href="https://chrisnaelberdier.com/" target="_blank" rel="noopener">Portfolio</a> ·
        <a href="https://www.linkedin.com/in/chrisna%C3%ABl-berdier-b634a3389/" target="_blank" rel="noopener">LinkedIn</a>
      </p>

      <h3>Hosting</h3>
      <p>This site is hosted by <strong>GitHub Pages</strong> — GitHub Inc.,
      88 Colin P Kelly Jr St, San Francisco, CA 94107, USA.</p>

      <h3>Intellectual property</h3>
      <p>All content (text, photos, logo, layout) on this site is the property of
      Caprice des Îles restaurant unless otherwise stated. Any unauthorized reproduction
      is prohibited.</p>

      <h3>Personal data</h3>
      <p>This site does not collect any personal data and does not use tracking cookies.</p>
    `,
  },
};

// ============================================
// SOURCE DES DONNÉES
// ============================================
// Pour changer de Sheet : remplacer SHEET_ID par le nouvel identifiant
// (la longue chaîne entre /d/ et /edit dans l'URL Google Sheets)
const SHEET_ID = '1xiQwiEnrxMkEQN18XcNDbTdReTT5BXwqnJvCDJ3-51k';
const SHEET_BASE = `https://opensheet.elk.sh/${SHEET_ID}`;
const SHEET_TABS = ['Plats', 'Categories', 'Formules', 'Glaces', 'Config'];

const FALLBACK_JSON = './data/menu.json';

// ---- FETCH ----
async function loadMenu() {
  try {
    // Fetch les 5 onglets en parallèle
    const responses = await Promise.all(
      SHEET_TABS.map(tab => fetch(`${SHEET_BASE}/${tab}`))
    );

    // Vérifie que tout est OK
    if (responses.some(r => !r.ok)) {
      throw new Error('Opensheet fetch failed');
    }

    const [plats, categories, formules, glaces, config] = await Promise.all(
      responses.map(r => r.json())
    );

    // Transforme les données tabulaires en structure menu.json
    state.menu = buildMenuFromSheets({ plats, categories, formules, glaces, config });

    console.log('✓ Menu chargé depuis Google Sheets');
  } catch (err) {
    console.warn('Opensheet indisponible, fallback sur menu.json local:', err);
    // Fallback : charge le JSON local
    try {
      const response = await fetch(FALLBACK_JSON);
      if (!response.ok) throw new Error('Fallback fetch failed');
      state.menu = await response.json();
      console.log('✓ Menu chargé depuis fallback local');
    } catch (fallbackErr) {
      console.error(fallbackErr);
      document.getElementById('loading-state').textContent = uiText[state.lang].error;
      hideLoaderWithMinDelay();
      return;
    }
  }

  renderAll();
  hideLoaderWithMinDelay();
  setupObservers();
  setupScrollProgress();
}

// ============================================
// TRANSFORMATION Sheets → menu.json
// ============================================
function buildMenuFromSheets({ plats, categories, formules, glaces, config }) {
  // ---- 1. Config → clés/valeurs ----
  const cfg = {};
  config.forEach(row => {
    cfg[row.cle] = { fr: row.valeur_fr || '', en: row.valeur_en || row.valeur_fr || '' };
  });

  // ---- 2. Helpers ----
  const parseBool = v => String(v || '').toUpperCase() === 'OUI';
  const parsePrix = v => {
    if (v === null || v === undefined || v === '') return null;
    // Gère les prix stockés en string avec virgule OU point
    const n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  const parseTags = v => {
    if (!v) return [];
    return String(v).split(',').map(t => t.trim()).filter(Boolean);
  };
  const bilingual = (fr, en) => ({ fr: fr || '', en: en || fr || '' });

  // ---- 3. Index des catégories par id ----
  const catById = {};
  categories.forEach(cat => {
    catById[cat.id] = {
      raw: cat,
      id: cat.id,
      type: cat.type,
      parent: cat.parent || null,
      nom: bilingual(cat.nom_fr, cat.nom_en),
      sous_titre: (cat.sous_titre_fr || cat.sous_titre_en)
        ? bilingual(cat.sous_titre_fr, cat.sous_titre_en) : null,
      note_globale: (cat.note_fr || cat.note_en)
        ? bilingual(cat.note_fr, cat.note_en) : null,
      prix: parsePrix(cat.prix),
      ordre: parseFloat(cat.ordre) || 999,
      plats: [],
      sous_categories: [],
      inclus: [],
    };
  });

  // ---- 4. Rattache les plats à leur catégorie ----
  plats.forEach(plat => {
    const cat = catById[plat.categorie];
    if (!cat) {
      console.warn(`Plat "${plat.id}" a une catégorie inconnue: ${plat.categorie}`);
      return;
    }
    const platObj = {
      id: plat.id,
      nom: bilingual(plat.nom_fr, plat.nom_en),
      prix: parsePrix(plat.prix),
      disponible: parseBool(plat.dispo),
      tags: parseTags(plat.tags),
    };
    if (plat.description_fr || plat.description_en) {
      platObj.description = bilingual(plat.description_fr, plat.description_en);
    }
    cat.plats.push(platObj);
  });

  // ---- 5. Rattache les items de formules ----
  formules
    .sort((a, b) => (parseFloat(a.ordre) || 0) - (parseFloat(b.ordre) || 0))
    .forEach(item => {
      const cat = catById[item.categorie_id];
      if (!cat) return;
      cat.inclus.push(bilingual(item.item_fr, item.item_en));
    });

  // ---- 6. Rattache les sous-catégories à leur parent ----
  Object.values(catById).forEach(cat => {
    if (cat.type === 'sous-categorie' && cat.parent) {
      const parent = catById[cat.parent];
      if (parent) parent.sous_categories.push(cat);
    }
  });

  // ---- 7. Cas spécial : glaces (parfums dans sous-catégorie "glaces") ----
  const glacesCategorie = catById['glaces'];
  if (glacesCategorie) {
    glacesCategorie.type_affichage = 'parfums';
    glacesCategorie.parfums = glaces
      .filter(g => parseBool(g.dispo))
      .sort((a, b) => (parseFloat(a.ordre) || 0) - (parseFloat(b.ordre) || 0))
      .map(g => bilingual(g.nom_fr, g.nom_en));
    glacesCategorie.prix_info = cfg.glaces_prix_info || null;
  }

  // ---- 8. Construit le tableau final des catégories top-level ----
  // On ne garde que celles qui n'ont pas de parent (les "racines")
  const topLevel = Object.values(catById)
    .filter(cat => !cat.parent)
    .sort((a, b) => a.ordre - b.ordre);

  // Nettoie la structure pour qu'elle colle au format menu.json attendu
  const finalCategories = topLevel.map(cat => cleanCategory(cat));

  return {
    restaurant: {
      nom: cfg.nom_restaurant?.fr || 'Caprice des Îles',
      tagline: cfg.tagline || null,
      // adresse, tel, URLs : valeurs simples (pas bilingues)
      adresse: cfg.adresse?.fr || '',
      telephone: cfg.telephone?.fr || '',
      facebook_url: cfg.facebook_url?.fr || '',
      instagram_url: cfg.instagram_url?.fr || '',
      google_place_id: cfg.google_place_id?.fr || '',
      devise_symbole: cfg.devise_symbole?.fr || '€',
      symbole_devise: cfg.devise_symbole?.fr || '€',
      langues_disponibles: ['fr', 'en'],
    },
    categories: finalCategories,
    tags_definitions: {
      signature: { fr: 'Plat signature', en: 'Signature dish' },
      local: { fr: 'Spécialité antillaise', en: 'Caribbean specialty' },
      'plat-du-jour': { fr: 'Plat du jour', en: 'Dish of the day' },
      rupture: { fr: 'Indisponible', en: 'Unavailable' },
      sauce: { fr: 'Sauce au choix', en: 'Choice of sauce' },
    },
  };
}

// Nettoie une catégorie (enlève les champs internes, adapte selon le type)
function cleanCategory(cat) {
  const base = {
    id: cat.id,
    type: cat.type,
    nom: cat.nom,
  };
  if (cat.sous_titre) base.sous_titre = cat.sous_titre;
  if (cat.note_globale) base.note_globale = cat.note_globale;

  if (cat.type === 'formule') {
    base.prix = cat.prix;
    base.inclus = cat.inclus;
    base.disponible = true;
  } else if (cat.type === 'groupe') {
    // Un groupe contient des sous-catégories
    base.sous_categories = cat.sous_categories
      .sort((a, b) => a.ordre - b.ordre)
      .map(sub => cleanSousCategorie(sub));
  } else {
    // standard
    base.plats = cat.plats;
  }
  return base;
}

function cleanSousCategorie(sub) {
  // Cas spécial glaces
  if (sub.type_affichage === 'parfums') {
    return {
      id: sub.id,
      nom: sub.nom,
      type_affichage: 'parfums',
      prix_info: sub.prix_info,
      parfums: sub.parfums,
    };
  }
  // Sous-catégorie classique avec plats
  return {
    id: sub.id,
    nom: sub.nom,
    plats: sub.plats,
  };
}

function hideLoaderWithMinDelay() {
  const elapsed = performance.now() - LOADER_START;
  const remaining = Math.max(0, LOADER_MIN_DURATION - elapsed);
  setTimeout(() => {
    document.getElementById('loader').classList.add('is-hidden');
  }, remaining);
}

// ---- HELPERS ----
function t(obj) {
  if (!obj) return '';
  return obj[state.lang] || obj.fr || '';
}

function formatPrix(prix) {
  if (prix === null || prix === undefined) return '';
  const symbole = state.menu.restaurant.symbole_devise || '€';
  return `${prix.toFixed(2).replace('.', ',')} ${symbole}`;
}

function renderTag(tagKey) {
  const def = state.menu.tags_definitions?.[tagKey];
  if (!def) return '';
  return `<span class="tag tag--${tagKey}">${t(def)}</span>`;
}

// ---- RENDUS ----
function renderPlat(plat) {
  const indispo = plat.disponible === false ? 'plat-indispo' : '';
  const tags = (plat.tags || [])
    .filter(tag => tag !== 'rupture' || plat.disponible === false)
    .map(renderTag)
    .join('');

  const description = plat.description && t(plat.description)
    ? `<p class="plat-description">${t(plat.description)}</p>`
    : '';

  const prixNote = plat.prix_note
    ? `<span class="plat-prix-note">${t(plat.prix_note)}</span>`
    : '';

  const prix = plat.prix !== null && plat.prix !== undefined
    ? `<div class="plat-prix">${formatPrix(plat.prix)}${prixNote}</div>`
    : '';

  return `
    <div class="plat ${indispo}">
      <div class="plat-info">
        <h3 class="plat-nom">
          ${t(plat.nom)}
          ${tags ? `<span class="plat-tags">${tags}</span>` : ''}
        </h3>
        ${description}
      </div>
      ${prix}
    </div>
  `;
}

function renderFormule(cat) {
  const sousTitre = cat.sous_titre ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>` : '';
  const items = cat.inclus.map(item => `<li>${t(item)}</li>`).join('');
  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}${sousTitre}</h2>
      </div>
      <div class="formule">
        <ul class="formule-list">${items}</ul>
        <div class="formule-prix">${formatPrix(cat.prix)}</div>
      </div>
    </section>
  `;
}

function renderGlaces(sous) {
  const parfums = sous.parfums.map(p => `<li class="glace-item">${t(p)}</li>`).join('');
  return `
    <div class="sous-categorie">
      <h3 class="sous-categorie-title">${t(sous.nom)}</h3>
      <p class="glaces-prix-info">${t(sous.prix_info)}</p>
      <ul class="glaces-grid">${parfums}</ul>
    </div>
  `;
}

function renderCategorieStandard(cat) {
  const sousTitre = cat.sous_titre ? `<span class="category-subtitle">${t(cat.sous_titre)}</span>` : '';
  const note = cat.note_globale ? `<p class="category-note">${t(cat.note_globale)}</p>` : '';
  const plats = cat.plats.map(renderPlat).join('');
  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}${sousTitre}</h2>
        ${note}
      </div>
      <div class="plats-list">${plats}</div>
    </section>
  `;
}

function renderGroupe(cat) {
  const sousCats = cat.sous_categories.map(sous => {
    if (sous.type_affichage === 'parfums') return renderGlaces(sous);
    const plats = sous.plats.map(renderPlat).join('');
    return `
      <div class="sous-categorie">
        <h3 class="sous-categorie-title">${t(sous.nom)}</h3>
        <div class="plats-list">${plats}</div>
      </div>
    `;
  }).join('');
  return `
    <section class="category" id="cat-${cat.id}">
      <div class="category-header">
        <h2 class="category-title">${t(cat.nom)}</h2>
      </div>
      ${sousCats}
    </section>
  `;
}

function renderCategorie(cat) {
  switch (cat.type) {
    case 'formule': return renderFormule(cat);
    case 'groupe': return renderGroupe(cat);
    default: return renderCategorieStandard(cat);
  }
}

// ---- NAVS (sidebar + drawer + header) ----
function renderNavs() {
  const links = state.menu.categories
    .map(cat => `<li><a href="#cat-${cat.id}" data-cat-id="${cat.id}">${t(cat.nom)}</a></li>`)
    .join('');

  document.getElementById('sidebar-nav-list').innerHTML = links;
  document.getElementById('drawer-nav-list').innerHTML = links;
  document.getElementById('header-nav-list').innerHTML = links;
}

// ---- I18N UI ----
function updateUIText() {
  const texts = uiText[state.lang];
  const set = (selector, value) => {
    document.querySelectorAll(selector).forEach(el => el.textContent = value);
  };

  set('[data-i18n="hero-welcome"]', texts.heroWelcome);
  set('[data-i18n="hero-tagline"]', texts.heroTagline);
  set('[data-i18n="reservation-label"]', texts.reservationLabel);
  set('[data-i18n="scroll-menu"]', texts.scrollMenu);
  set('[data-i18n="sidebar-label"]', texts.sidebarLabel);
  // review-title contient un &nbsp;, on utilise innerHTML
  document.querySelectorAll('[data-i18n="review-title"]').forEach(el => el.innerHTML = texts.reviewTitle);
  set('[data-i18n="review-text"]', texts.reviewText);
  set('[data-i18n="review-btn"]', texts.reviewBtn);
  set('[data-i18n="review-see"]', texts.reviewSee);
  set('[data-i18n="hero-review-link"]', texts.heroReviewLink);
  set('[data-i18n="pwa-install"]', texts.pwaInstall);
  set('[data-i18n="footer-tagline"]', texts.footerTagline);
  set('[data-i18n="footer-contact-heading"]', texts.footerContactHeading);
  set('[data-i18n="credits-text"]', texts.creditsText);
  set('[data-i18n="legal-link"]', texts.legalLink);
}

// ---- RENDU COMPLET ----
function renderAll() {
  if (!state.menu) return;
  document.documentElement.lang = uiText[state.lang].htmlLang;

  applyRestaurantBindings();
  renderNavs();
  document.getElementById('menu-container').innerHTML =
    state.menu.categories.map(renderCategorie).join('');
  updateUIText();
}

// ---- DATA BINDING depuis Config ----
// Remplit tous les éléments [data-bind] et [data-bind-href]
// avec les infos du restaurant stockées dans state.menu.restaurant
function applyRestaurantBindings() {
  const r = state.menu.restaurant || {};

  // Construit les URLs spéciales à partir des infos
  const urls = {
    adresse_url: r.adresse
      ? `https://maps.google.com/?q=${encodeURIComponent(r.adresse)}`
      : null,
    tel: r.telephone
      ? `tel:${String(r.telephone).replace(/\s/g, '')}`
      : null,
    facebook_url: r.facebook_url || null,
    instagram_url: r.instagram_url || null,
    review_write: r.google_place_id
      ? `https://search.google.com/local/writereview?placeid=${r.google_place_id}`
      : null,
    review_see: r.google_place_id
      ? `https://search.google.com/local/reviews?placeid=${r.google_place_id}`
      : null,
  };

  // Map des valeurs texte bindables
  const values = {
    nom: r.nom || 'Caprice des Îles',
    tagline: r.tagline ? t(r.tagline) : '',
    adresse: r.adresse || '',
    telephone: r.telephone || '',
  };

  // Applique les textes
  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.dataset.bind;
    if (values[key] !== undefined && values[key] !== '') {
      el.textContent = values[key];
    }
  });

  // Applique les liens href
  document.querySelectorAll('[data-bind-href]').forEach(el => {
    const key = el.dataset.bindHref;
    if (urls[key]) {
      el.href = urls[key];
    }
  });
}

// ---- OBSERVERS (révélation + nav active) ----
let revealObs = null;
let activeObs = null;

function setupObservers() {
  if (revealObs) revealObs.disconnect();
  if (activeObs) activeObs.disconnect();

  // Révélation au scroll
  revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.category').forEach(cat => revealObs.observe(cat));

  // Highlight de l'item actif (sidebar + drawer + header nav)
  const allLinks = document.querySelectorAll('[data-cat-id]');

  activeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('cat-', '');
        allLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.catId === id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  document.querySelectorAll('.category').forEach(cat => activeObs.observe(cat));
}

// ---- BARRE DE PROGRESSION SIDEBAR ----
function setupScrollProgress() {
  const bar = document.getElementById('sidebar-progress-bar');
  if (!bar) return;

  const update = () => {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    const rect = menuContainer.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const containerHeight = menuContainer.offsetHeight;
    const scrollPos = window.scrollY + window.innerHeight * 0.4;

    let progress = (scrollPos - containerTop) / containerHeight;
    progress = Math.max(0, Math.min(1, progress));

    bar.style.height = `${progress * 100}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// ---- TOGGLE LANGUE ----
function setupLangToggle() {
  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.dataset.lang;
      if (newLang === state.lang) return;
      state.lang = newLang;

      buttons.forEach(b => {
        const active = b.dataset.lang === newLang;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active);
      });

      renderAll();
      setupObservers();

      requestAnimationFrame(() => {
        document.querySelectorAll('.category').forEach(cat => {
          const rect = cat.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            cat.classList.add('is-visible');
          }
        });
      });
    });
  });
}

// ---- BACK TO TOP ----
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- DRAWER MOBILE ----
function setupDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const toggleBtn = document.getElementById('drawer-toggle');
  const closeBtns = drawer.querySelectorAll('[data-close-drawer]');
  let lastFocused = null;

  function openDrawer() {
    lastFocused = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('scroll-locked');
    setTimeout(() => drawer.querySelector('.drawer-close')?.focus(), 200);
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('scroll-locked');
    if (lastFocused) lastFocused.focus();
  }

  toggleBtn.addEventListener('click', openDrawer);
  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));

  // Fermeture auto au clic sur un lien de catégorie
  drawer.querySelector('#drawer-nav-list').addEventListener('click', (e) => {
    if (e.target.closest('a')) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
}

// ---- MODAL MENTIONS LÉGALES ----
function setupLegalModal() {
  const modal = document.getElementById('legal-modal');
  const openBtn = document.getElementById('open-legal');
  const closeBtns = modal.querySelectorAll('[data-close-modal]');
  const body = document.getElementById('legal-modal-body');
  const title = document.getElementById('legal-modal-title');
  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    body.innerHTML = uiText[state.lang].legalContent;
    title.textContent = uiText[state.lang].legalTitle;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scroll-locked');
    setTimeout(() => modal.querySelector('.modal-close').focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('scroll-locked');
    if (lastFocused) lastFocused.focus();
  }

  openBtn.addEventListener('click', openModal);
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

// ---- ANNÉE COURANTE ----
function setCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ============================================
// PWA — Service worker, install prompt, iOS hint
// ============================================

// Enregistre le service worker (silencieux, sans interférer avec le reste)
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // On attend que la page soit chargée pour ne pas concurrencer le rendu initial
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('✓ Service worker enregistré', reg.scope))
      .catch(err => console.warn('Service worker non enregistré:', err));
  });
}

// Bouton d'installation natif (Chrome/Edge/Android)
let deferredInstallPrompt = null;

function setupPwaInstall() {
  const wrap = document.getElementById('pwa-install-wrap');
  const btn = document.getElementById('pwa-install-btn');
  if (!wrap || !btn) return;

  // Le navigateur signale qu'une installation est possible
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();          // empêche la mini-bar native automatique
    deferredInstallPrompt = e;
    wrap.hidden = false;          // affiche notre bouton discret
  });

  btn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`PWA install: ${outcome}`);
    deferredInstallPrompt = null;
    wrap.hidden = true;
  });

  // Si l'app est déjà installée, on cache le bouton
  window.addEventListener('appinstalled', () => {
    wrap.hidden = true;
    deferredInstallPrompt = null;
  });
}

// Popup iOS one-shot (Safari ne supporte pas beforeinstallprompt)
function setupIosInstallHint() {
  const hint = document.getElementById('ios-install-hint');
  const closeBtn = document.getElementById('ios-hint-close');
  if (!hint) return;

  // Détection : iOS Safari (iPhone/iPad), pas déjà en mode standalone
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
  const alreadyDismissed = localStorage.getItem('caprice-ios-hint-dismissed') === '1';

  if (!isIos || isStandalone || alreadyDismissed) return;

  // On affiche après 3 secondes pour laisser l'utilisateur découvrir le menu d'abord
  setTimeout(() => {
    hint.hidden = false;
    requestAnimationFrame(() => hint.classList.add('is-visible'));
  }, 3000);

  closeBtn.addEventListener('click', () => {
    hint.classList.remove('is-visible');
    setTimeout(() => { hint.hidden = true; }, 400);
    localStorage.setItem('caprice-ios-hint-dismissed', '1');
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  setupLangToggle();
  setupBackToTop();
  setupDrawer();
  setupLegalModal();
  setupPwaInstall();
  setupIosInstallHint();
  loadMenu();
  registerServiceWorker();
});
