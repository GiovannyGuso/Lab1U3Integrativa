// ===== Tema oscuro / claro =====
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(mode){
  const dark = mode === 'dark';
  root.classList.toggle('sl-theme-dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}
applyTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
if (themeToggle) themeToggle.checked = root.classList.contains('sl-theme-dark');
themeToggle?.addEventListener('sl-change', e => applyTheme(e.target.checked ? 'dark' : 'light'));

// ===== Botón "Instalar App" (PWA) =====
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'inline-flex';
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// ===== Búsqueda en Recursos =====
const resSearch = document.getElementById('searchRes');
const resGrid   = document.getElementById('resGrid');
resSearch?.addEventListener('sl-input', e => {
  const q = e.target.value.trim().toLowerCase();
  [...resGrid.children].forEach(card => {
    const name = (card.dataset.name || card.textContent || '').toLowerCase();
    card.style.display = name.includes(q) ? '' : 'none';
  });
});

// ===== Enviar contacto (simulado) =====
const toast = document.getElementById('toast');
document.getElementById('sendBtn')?.addEventListener('click', () => {
  const name = document.getElementById('name')?.value?.trim();
  if (toast) {
    toast.variant = 'primary';
    toast.innerHTML = `<sl-icon slot="icon" library="bi" name="check2-circle"></sl-icon> Gracias, ${name || 'visitante'}: mensaje enviado.`;
    toast.open = true;
  }
});

// ===== Registro del Service Worker =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js') // si lo llamaste service-worker.js, cambia a './service-worker.js'
      .then(() => console.log('SW registrado'))
      .catch(err => console.error('SW error', err));
  });
}
