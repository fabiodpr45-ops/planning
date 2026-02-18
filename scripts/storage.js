const KEY = 'dpr45-planning-data';

const defaultData = {
  workers: [
    { id: crypto.randomUUID(), name: 'Jean Martin', skill: 'Isolation' },
    { id: crypto.randomUUID(), name: 'Omar Ali', skill: 'Plaquiste' }
  ],
  subcontractors: [
    { id: crypto.randomUUID(), name: 'BATI PRO', domain: 'Échafaudage' }
  ],
  sites: [
    {
      id: crypto.randomUUID(),
      name: 'Résidence Orion',
      location: 'Orléans',
      startDate: '2026-02-15',
      endDate: '2026-03-15'
    }
  ],
  assignments: []
};

export function getData() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
  return JSON.parse(raw);
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function requireAuth() {
  if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
}

export function setupLogout() {
  const btn = document.getElementById('logout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
  });
}
