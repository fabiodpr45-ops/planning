import { getData, saveData, requireAuth, setupLogout } from './storage.js';

requireAuth();
setupLogout();

let state = getData();

const workersList = document.getElementById('workers-list');
const subcontractorsList = document.getElementById('subcontractors-list');
const sitesList = document.getElementById('sites-list');

const workerForm = document.getElementById('worker-form');
const subcontractorForm = document.getElementById('subcontractor-form');
const siteForm = document.getElementById('site-form');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function saveAndRender() {
  saveData(state);
  render();
}

function render() {
  workersList.innerHTML = state.workers
    .map(
      (w) => `<li>
        <span>${escapeHtml(w.name)} <small>(${escapeHtml(w.skill)})</small></span>
        <span class="actions-row">
          <button type="button" class="secondary small" data-action="edit-worker" data-id="${w.id}">Éditer</button>
          <button type="button" class="danger small" data-action="delete-worker" data-id="${w.id}">Supprimer</button>
        </span>
      </li>`
    )
    .join('');

  subcontractorsList.innerHTML = state.subcontractors
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.name)} <small>(${escapeHtml(s.domain)})</small></span>
        <span class="actions-row">
          <button type="button" class="secondary small" data-action="edit-subcontractor" data-id="${s.id}">Éditer</button>
          <button type="button" class="danger small" data-action="delete-subcontractor" data-id="${s.id}">Supprimer</button>
        </span>
      </li>`
    )
function render() {
  workersList.innerHTML = state.workers
    .map((w) => `<li><span>${w.name} <small>(${w.skill})</small></span><span class="badge">ouvrier</span></li>`)
    .join('');

  subcontractorsList.innerHTML = state.subcontractors
    .map((s) => `<li><span>${s.name} <small>(${s.domain})</small></span><span class="badge">sous-traitant</span></li>`)
    .join('');

  sitesList.innerHTML = state.sites
    .map(
      (s) => `<li>
        <span><strong>${escapeHtml(s.name)}</strong> - ${escapeHtml(s.location)}<br><small>${s.startDate} → ${s.endDate}</small></span>
        <span class="actions-row">
          <button type="button" class="secondary small" data-action="edit-site" data-id="${s.id}">Éditer</button>
          <button type="button" class="danger small" data-action="delete-site" data-id="${s.id}">Supprimer</button>
        </span>
      </li>`
      (s) =>
        `<li><span><strong>${s.name}</strong> - ${s.location}<br><small>${s.startDate} → ${s.endDate}</small></span><span class="badge">chantier</span></li>`
    )
    .join('');
}

workerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(workerForm);
  state.workers.push({
    id: crypto.randomUUID(),
    name: formData.get('name').toString().trim(),
    skill: formData.get('skill').toString().trim()
  });
  workerForm.reset();
  saveAndRender();
    name: formData.get('name').toString(),
    skill: formData.get('skill').toString()
  });
  saveData(state);
  workerForm.reset();
  render();
});

subcontractorForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(subcontractorForm);
  state.subcontractors.push({
    id: crypto.randomUUID(),
    name: formData.get('name').toString().trim(),
    domain: formData.get('domain').toString().trim()
  });
  subcontractorForm.reset();
  saveAndRender();
    name: formData.get('name').toString(),
    domain: formData.get('domain').toString()
  });
  saveData(state);
  subcontractorForm.reset();
  render();
});

siteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(siteForm);
  state.sites.push({
    id: crypto.randomUUID(),
    name: formData.get('name').toString().trim(),
    location: formData.get('location').toString().trim(),
    startDate: formData.get('startDate').toString(),
    endDate: formData.get('endDate').toString()
  });
  siteForm.reset();
  saveAndRender();
});

workersList?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const worker = state.workers.find((item) => item.id === id);
  if (!worker) return;

  if (button.dataset.action === 'edit-worker') {
    const name = prompt("Nom de l'ouvrier", worker.name);
    if (name === null) return;
    const skill = prompt('Spécialité', worker.skill);
    if (skill === null) return;
    worker.name = name.trim() || worker.name;
    worker.skill = skill.trim() || worker.skill;
    saveAndRender();
    return;
  }

  if (button.dataset.action === 'delete-worker' && confirm('Supprimer cet ouvrier ?')) {
    state.workers = state.workers.filter((item) => item.id !== id);
    state.assignments = state.assignments.filter((item) => item.workerId !== id);
    saveAndRender();
  }
});

subcontractorsList?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const subcontractor = state.subcontractors.find((item) => item.id === id);
  if (!subcontractor) return;

  if (button.dataset.action === 'edit-subcontractor') {
    const name = prompt('Nom du sous-traitant', subcontractor.name);
    if (name === null) return;
    const domain = prompt('Domaine', subcontractor.domain);
    if (domain === null) return;
    subcontractor.name = name.trim() || subcontractor.name;
    subcontractor.domain = domain.trim() || subcontractor.domain;
    saveAndRender();
    return;
  }

  if (button.dataset.action === 'delete-subcontractor' && confirm('Supprimer ce sous-traitant ?')) {
    state.subcontractors = state.subcontractors.filter((item) => item.id !== id);
    state.assignments = state.assignments.map((item) =>
      item.subcontractorId === id ? { ...item, subcontractorId: 'none' } : item
    );
    saveAndRender();
  }
});

sitesList?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.dataset.id;
  const site = state.sites.find((item) => item.id === id);
  if (!site) return;

  if (button.dataset.action === 'edit-site') {
    const name = prompt('Nom du chantier', site.name);
    if (name === null) return;
    const location = prompt('Lieu', site.location);
    if (location === null) return;
    const startDate = prompt('Date de début (YYYY-MM-DD)', site.startDate);
    if (startDate === null) return;
    const endDate = prompt('Date de fin (YYYY-MM-DD)', site.endDate);
    if (endDate === null) return;

    site.name = name.trim() || site.name;
    site.location = location.trim() || site.location;
    site.startDate = startDate.trim() || site.startDate;
    site.endDate = endDate.trim() || site.endDate;
    saveAndRender();
    return;
  }

  if (button.dataset.action === 'delete-site' && confirm('Supprimer ce chantier ?')) {
    state.sites = state.sites.filter((item) => item.id !== id);
    state.assignments = state.assignments.filter((item) => item.siteId !== id);
    saveAndRender();
  }
    name: formData.get('name').toString(),
    location: formData.get('location').toString(),
    startDate: formData.get('startDate').toString(),
    endDate: formData.get('endDate').toString()
  });
  saveData(state);
  siteForm.reset();
  render();
});

render();
