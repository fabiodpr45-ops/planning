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

const printForm = document.getElementById('print-form');
const printStart = document.getElementById('print-start');
const printEnd = document.getElementById('print-end');

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

function renderPrintableHtml(startDate, endDate) {
  const filtered = state.assignments
    .map(enrich)
    .filter((item) => item.date >= startDate && item.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  const rows = filtered
    .map(
      (item) =>
        `<tr><td>${item.date}</td><td>${item.siteName}</td><td>${item.workerName}</td><td>${item.subcontractorName}</td></tr>`
    )
    .join('');

  const tableRows = rows || '<tr><td colspan="4">Aucune affectation sur cette période</td></tr>';

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Impression planning</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1d2740; }
    h1 { margin-bottom: 4px; }
    p { margin-top: 0; color: #4a5678; }
    table { width: 100%; border-collapse: collapse; margin-top: 14px; }
    th, td { border: 1px solid #ccd6ee; padding: 8px; text-align: left; }
    th { background: #edf2ff; }
  </style>
</head>
<body>
  <h1>Planning DPR45</h1>
  <p>Période du <strong>${startDate}</strong> au <strong>${endDate}</strong></p>
  <table>
    <thead>
      <tr><th>Date</th><th>Chantier</th><th>Ouvrier</th><th>Sous-traitant</th></tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;
}

function printPlanning(startDate, endDate) {
  const printableWindow = window.open('', '_blank', 'width=1000,height=750');
  if (!printableWindow) {
    alert('Impossible d’ouvrir la fenêtre d’impression (popup bloquée).');
    return;
  }

  printableWindow.document.open();
  printableWindow.document.write(renderPrintableHtml(startDate, endDate));
  printableWindow.document.close();

  printableWindow.focus();
  setTimeout(() => {
    printableWindow.print();
  }, 200);
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

printForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const startDate = printStart.value;
  const endDate = printEnd.value;

  if (!startDate || !endDate) {
    alert('Sélectionne une date de début et une date de fin.');
    return;
  }

  if (startDate > endDate) {
    alert('La date de début doit être antérieure à la date de fin.');
    return;
  }

  printPlanning(startDate, endDate);
});

viewMode?.addEventListener('change', renderPlanning);

populateSelects();
renderPlanning();
