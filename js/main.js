document.getElementById('yr').textContent = new Date().getFullYear();

// Mobile menu
const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if (e.target.tagName === 'A') menu.classList.remove('open'); });

// Qualification tabs
const tabs = document.querySelectorAll('[role=tab]');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => {
    const on = x === t;
    x.setAttribute('aria-selected', on);
    document.getElementById(x.dataset.tab).hidden = !on;
  });
}));

// Book order dialog
const dlg = document.getElementById('orderDlg'), form = document.getElementById('orderForm'),
      msg = document.getElementById('orderMsg'), btn = document.getElementById('submitBtn');
document.getElementById('buyBtn').addEventListener('click', () => { msg.textContent = ''; dlg.showModal(); });
document.getElementById('closeDlg').addEventListener('click', () => dlg.close());

form.addEventListener('submit', async e => {
  e.preventDefault();
  btn.disabled = true; msg.textContent = 'Sending your order...';
  try {
    const res = await fetch('php/order.php', { method: 'POST', body: new FormData(form) });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Order failed.');
    if (data.payment_url) { window.location.href = data.payment_url; return; }
    msg.textContent = 'Order received. Check your email for payment details.';
    form.reset();
  } catch (err) {
    msg.textContent = err.message + ' Please try again.';
  } finally { btn.disabled = false; }
});
