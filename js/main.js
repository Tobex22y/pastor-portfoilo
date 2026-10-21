/**
 * Pastor Beloved Opeyemi Abimbola Portfolio
 * Interactive Scripts: Navigation, Tabs, Dialog & Order Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Copyright Year
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  // 2. Mobile Burger Navigation Menu
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
    });

    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Qualifications Tab Switching
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"], .panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      // Update tab selection states
      tabs.forEach(t => {
        const isSelected = (t === tab);
        t.setAttribute('aria-selected', isSelected);
      });

      // Update panels visibility
      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.hidden = false;
          panel.removeAttribute('hidden');
        } else {
          panel.hidden = true;
          panel.setAttribute('hidden', '');
        }
      });
    });
  });

  // 4. Book Order Dialog & Dynamic Price Calculation
  const dlg = document.getElementById('orderDlg');
  const form = document.getElementById('orderForm');
  const msg = document.getElementById('orderMsg');
  const submitBtn = document.getElementById('submitBtn');
  const buyBtn = document.getElementById('buyBtn');
  const closeDlg = document.getElementById('closeDlg');
  const closeXBtn = document.getElementById('closeXBtn');
  const qtyInput = document.getElementById('fQty');
  const qtyCalc = document.getElementById('qtyCalc');

  const UNIT_PRICE = 5000; // NGN per copy

  const updatePriceDisplay = () => {
    if (!qtyInput || !qtyCalc) return;
    let qty = parseInt(qtyInput.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 50) qty = 50;
    const total = qty * UNIT_PRICE;
    qtyCalc.textContent = `Total: ₦${total.toLocaleString()}`;
  };

  if (qtyInput) {
    qtyInput.addEventListener('input', updatePriceDisplay);
    qtyInput.addEventListener('change', updatePriceDisplay);
  }

  const openOrderDialog = () => {
    if (!dlg) return;
    if (msg) {
      msg.textContent = '';
      msg.className = 'order-status-msg';
    }
    updatePriceDisplay();
    dlg.showModal();
  };

  const closeOrderDialog = () => {
    if (dlg) dlg.close();
  };

  if (buyBtn) buyBtn.addEventListener('click', openOrderDialog);
  if (closeDlg) closeDlg.addEventListener('click', closeOrderDialog);
  if (closeXBtn) closeXBtn.addEventListener('click', closeOrderDialog);

  // Close dialog on backdrop click
  if (dlg) {
    dlg.addEventListener('click', (e) => {
      const rect = dlg.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeOrderDialog();
      }
    });
  }

  // 5. Book Order Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!submitBtn || !msg) return;

      submitBtn.disabled = true;
      msg.className = 'order-status-msg';
      msg.textContent = 'Processing your order...';

      try {
        const formData = new FormData(form);
        const res = await fetch('php/order.php', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (!data.ok) {
          throw new Error(data.error || 'Failed to place order.');
        }

        if (data.payment_url) {
          window.location.href = data.payment_url;
          return;
        }

        msg.className = 'order-status-msg success';
        msg.textContent = `Order placed successfully (Ref: ${data.reference || 'Confirmed'})! Check your email for payment & delivery details.`;
        form.reset();
        updatePriceDisplay();
      } catch (err) {
        msg.className = 'order-status-msg error';
        msg.textContent = err.message || 'An error occurred. Please try again.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
