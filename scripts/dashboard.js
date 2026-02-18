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

function render() {
  workersList.innerHTML = state.workers
    .map((w) => `<li><span>${w.name} <small>(${w.skill})</small></span><span class="badge">ouvrier</span></li>`)
    .join('');

  subcontractorsList.innerHTML = state.subcontractors
    .map((s) => `<li><span>${s.name} <small>(${s.domain})</small></span><span class="badge">sous-traitant</span></li>`)
    .join('');

  sitesList.innerHTML = state.sites
    .map(
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
