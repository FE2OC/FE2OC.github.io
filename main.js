// main.js
const MAPS_API = 'https://api.github.com/repos/mintiler-dev/fe2oc.github.io/contents/maps';
const mapsGrid = document.getElementById('mapsGrid');
const searchInput = document.getElementById('search');
const diffSelect = document.getElementById('difficulty');
const sortSelect = document.getElementById('sortby');
const randomBtn = document.getElementById('randomBtn');
const countEl = document.getElementById('count');

let ALL_MAPS = [];

async function fetchMapsList() {
  try {
    const res = await fetch(MAPS_API);
    if (!res.ok) throw new Error('failed fetch maps list');
    const files = await res.json();
    // files is array of { name, path, download_url }
    const maps = await Promise.all(files.map(async f => {
      try {
        const r = await fetch(f.download_url);
        if (!r.ok) return null;
        return await r.json();
      } catch (e) {
        return null;
      }
    }));
    return maps.filter(Boolean);
  } catch (e) {
    console.error(e);
    return [];
  }
}

function renderMaps(maps) {
  countEl.textContent = `${maps.length} maps`;
  if (!maps.length) {
    mapsGrid.innerHTML = `<div class="muted">no maps yet</div>`;
    return;
  }
  mapsGrid.innerHTML = maps.map(m => `
    <div class="card" data-id="${escapeHtml(m.id)}">
      <img src="${escapeHtml(m.thumbnail)}" alt="${escapeHtml(m.name)}">
      <h3>${escapeHtml(m.name)}</h3>
      <p class="muted">by ${escapeHtml(m.creator)}</p>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">
        <span class="pill">${escapeHtml(m.difficulty || '')}</span>
        <button class="btn small open" data-id="${escapeHtml(m.id)}">view</button>
      </div>
    </div>
  `).join('');

  // attach open handlers
  document.querySelectorAll('.open').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const map = ALL_MAPS.find(x => x.id === id);
      if (map) openModal(map);
    });
  });
}

function applyFilters() {
  const s = (searchInput.value || '').toLowerCase().trim();
  const d = diffSelect.value;
  const sortBy = sortSelect.value || 'name';

  let filtered = ALL_MAPS.filter(m => {
    const text = (m.name + ' ' + (m.creator||'') + ' ' + (m.description||'')).toLowerCase();
    if (s && !text.includes(s)) return false;
    if (d && m.difficulty !== d) return false;
    return true;
  });

  filtered.sort((a,b) => {
    try {
      const A = (a[sortBy]||'').toString().toLowerCase();
      const B = (b[sortBy]||'').toString().toLowerCase();
      return A.localeCompare(B);
    } catch (e) { return 0; }
  });

  renderMaps(filtered);
}

function setupControls() {
  [searchInput, diffSelect, sortSelect].forEach(el => el.addEventListener('input', applyFilters));
  randomBtn.addEventListener('click', () => {
    if (!ALL_MAPS.length) return;
    const pick = ALL_MAPS[Math.floor(Math.random()*ALL_MAPS.length)];
    openModal(pick);
  });
}

// modal logic
const modal = document.getElementById('modal');
const modalThumb = document.getElementById('modalThumb');
const modalName = document.getElementById('modalName');
const modalCreator = document.getElementById('modalCreator');
const modalDifficulty = document.getElementById('modalDifficulty');
const modalDesc = document.getElementById('modalDesc');
const copyIdBtn = document.getElementById('copyId');
const openMapBtn = document.getElementById('openMap');
const closeModalBtn = document.getElementById('closeModal');

function openModal(map) {
  modalThumb.src = map.thumbnail;
  modalName.textContent = map.name;
  modalCreator.textContent = `by ${map.creator}`;
  modalDifficulty.textContent = map.difficulty || '';
  modalDesc.textContent = map.description || '';
  copyIdBtn.onclick = async () => {
    try { await navigator.clipboard.writeText(map.id); alert('id copied'); } catch(e){ alert('copy failed'); }
  };
  openMapBtn.href = map.link || '#';
  modal.classList.add('show');
}
closeModalBtn.addEventListener('click', ()=> modal.classList.remove('show'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });

// simple escape
function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

(async function init(){
  setupControls();
  ALL_MAPS = await fetchMapsList();
  // normalize expected fields
  ALL_MAPS = ALL_MAPS.map(m => ({
    name: m.name || '',
    creator: m.creator || '',
    difficulty: m.difficulty || '',
    id: m.id || m.ID || '',
    thumbnail: m.thumbnail || '',
    description: m.description || '',
    link: m.link || ''
  }));
  applyFilters();
})();
