const LOGIN = 'DPR45';
const PASSWORD = 'Isolation45';

if (sessionStorage.getItem('isLoggedIn') === 'true') {
  window.location.href = 'dashboard.html';
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const login = data.get('login');
  const password = data.get('password');

  if (login === LOGIN && password === PASSWORD) {
    sessionStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'dashboard.html';
    return;
  }

  errorEl.textContent = 'Login ou mot de passe incorrect.';
});
