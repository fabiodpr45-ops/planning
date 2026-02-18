import { getData, saveData, requireAuth, setupLogout } from './storage.js';

requireAuth();
setupLogout();

let state = getData();

const assignmentForm = document.getElementById('assignment-form');
const siteSelect = assignmentForm?.elements.siteId;
const workerSelect = assignmentForm?.elements.workerId;
const subcontractorSelect = assignmentForm?.elements.subcontractorId;
const viewMode = document.getElementById('view-mode');
const planningView = document.getElementById('planning-view');

function option(value, label) {
  return `<option value="${value}">${label}</option>`;
}

function populateSelects() {
  siteSelect.innerHTML = `<option value="">Choisir chantier</option>${state.sites
    .map((site) => option(site.id, `${site.name} (${site.location})`))
    .join('')}`;

  workerSelect.innerHTML = `<option value="">Choisir ouvrier</option>${state.workers
    .map((worker) => option(worker.id, `${worker.name} - ${worker.skill}`))
    .join('')}`;

  subcontractorSelect.innerHTML = `<option value="">Choisir sous-traitant</option><option value="none">Aucun</option>${state.subcontractors
    .map((sub) => option(sub.id, `${sub.name} - ${sub.domain}`))
    .join('')}`;
}

function enrich(assignment) {
  const site = state.sites.find((s) => s.id === assignment.siteId);
  const worker = state.workers.find((w) => w.id === assignment.workerId);
  const subcontractor = state.subcontractors.find((s) => s.id === assignment.subcontractorId);

  return {
    ...assignment,
    siteName: site?.name ?? 'Chantier supprimé',
    workerName: worker?.name ?? 'Ouvrier supprimé',
    subcontractorName: assignment.subcontractorId === 'none' ? 'Aucun' : subcontractor?.name ?? 'Sous-traitant supprimé'
  };
}

function timelineView(assignments) {
  const rows = assignments
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (a) => `<tr><td>${a.date}</td><td>${a.siteName}</td><td>${a.workerName}</td><td>${a.subcontractorName}</td></tr>`
    )
    .join('');

  return `<table class="table"><thead><tr><th>Date</th><th>Chantier</th><th>Ouvrier</th><th>Sous-traitant</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Aucune affectation</td></tr>'}</tbody></table>`;
}

function groupView(assignments, key, label) {
  const grouped = assignments.reduce((acc, assignment) => {
    const groupKey = assignment[key];
    acc[groupKey] ||= [];
    acc[groupKey].push(assignment);
    return acc;
  }, {});

  const blocks = Object.entries(grouped)
    .map(
      ([name, items]) =>
        `<article class="card"><h3>${label}: ${name}</h3><ul class="data-list">${items
          .map(
            (item) =>
              `<li><span>${item.date} - ${item.siteName}</span><span>${item.workerName} / ${item.subcontractorName}</span></li>`
          )
          .join('')}</ul></article>`
    )
    .join('');

  return blocks || '<p>Aucune affectation.</p>';
}

function renderPlanning() {
  const assignments = state.assignments.map(enrich);

  switch (viewMode.value) {
    case 'by-site':
      planningView.innerHTML = groupView(assignments, 'siteName', 'Chantier');
      break;
    case 'by-person':
      planningView.innerHTML = groupView(assignments, 'workerName', 'Ouvrier');
      break;
    default:
      planningView.innerHTML = timelineView(assignments);
      break;
  }
}

assignmentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(assignmentForm);

  state.assignments.push({
    id: crypto.randomUUID(),
    siteId: formData.get('siteId').toString(),
    workerId: formData.get('workerId').toString(),
    subcontractorId: formData.get('subcontractorId').toString(),
    date: formData.get('date').toString()
  });

  saveData(state);
  assignmentForm.reset();
  populateSelects();
  renderPlanning();
});

viewMode?.addEventListener('change', renderPlanning);

populateSelects();
renderPlanning();
