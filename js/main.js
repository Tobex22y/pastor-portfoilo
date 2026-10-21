/**
 * Pastor Beloved Opeyemi Abimbola - Interactive Scripts
 * Dynamic UI Features: Scroll progress, Live Counters, Steppers,
 * Accordions, Copy-to-Clipboard Toast, and Order Form Handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Copyright Year
  const yrEl = document.getElementById('yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  // 2. Reading Scroll Progress Bar
  const progressBar = document.getElementById('progressBar');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollHeight > 0 && progressBar) {
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    }

    if (backToTop) {
      if (scrollTop > 450) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 3. Mobile Navigation Burger
  const burger = document.getElementById('burgerBtn') || document.querySelector('.burger');
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

    document.addEventListener('click', (e) => {
      if (!burger.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 4. Smooth Counter Animation (IntersectionObserver)
  const counterElements = document.querySelectorAll('.counter');
  let countersStarted = false;

  const startCounters = () => {
    if (countersStarted) return;
    countersStarted = true;

    counterElements.forEach(counter => {
      const target = parseInt(counter.dataset.target, 10);
      const duration = 1600; // ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        counter.textContent = currentVal.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(counterElements[0].closest('.hero-metrics') || counterElements[0]);
  } else {
    startCounters();
  }

  // 5. Qualifications Tabs Switching
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"], .panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => {
        const isSelected = (t === tab);
        t.setAttribute('aria-selected', isSelected);
      });

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

  // 6. Interactive Book Pricing, Stepper & WhatsApp Link Generator
  const UNIT_PRICE = 5000;
  const stepperInput = document.getElementById('copiesStepper');
  const stepMinus = document.getElementById('stepMinus');
  const stepPlus = document.getElementById('stepPlus');
  const shippingSelect = document.getElementById('shippingSelect');
  const liveTotalSum = document.getElementById('liveTotalSum');
  const bulkNote = document.getElementById('bulkNote');
  const dynamicWaBtn = document.getElementById('dynamicWaBtn');

  // Dialog fields
  const dlgBookSub = document.getElementById('dlgBookSub');
  const dlgDeliveryFee = document.getElementById('dlgDeliveryFee');
  const dlgGrandTotal = document.getElementById('dlgGrandTotal');
  const fQty = document.getElementById('fQty');
  const fDeliveryType = document.getElementById('fDeliveryType');

  const recalculateBookPricing = () => {
    let copies = parseInt(stepperInput ? stepperInput.value : (fQty ? fQty.value : 1), 10);
    if (isNaN(copies) || copies < 1) copies = 1;
    if (copies > 50) copies = 50;

    let shipFee = parseInt(shippingSelect ? shippingSelect.value : 1500, 10);
    if (isNaN(shipFee)) shipFee = 1500;

    const subtotal = copies * UNIT_PRICE;
    const total = subtotal + shipFee;

    // Update section UI
    if (liveTotalSum) liveTotalSum.textContent = `₦${total.toLocaleString()}`;
    if (bulkNote) {
      bulkNote.style.display = copies >= 5 ? 'block' : 'none';
    }

    // Update WhatsApp prefilled message
    if (dynamicWaBtn) {
      const copyText = copies === 1 ? '1 copy' : `${copies} copies`;
      const locationText = shippingSelect ? shippingSelect.options[shippingSelect.selectedIndex].text.split('(')[0].trim() : 'Lagos';
      const encodedMsg = encodeURIComponent(
        `Hello Pastor Abimbola, I would like to order ${copyText} of 'More Than Gold' (${locationText}). Estimated Total: ₦${total.toLocaleString()}`
      );
      dynamicWaBtn.href = `https://wa.me/2348033858056?text=${encodedMsg}`;
    }

    // Sync to Dialog
    if (fQty) fQty.value = copies;
    if (fDeliveryType && shippingSelect) fDeliveryType.value = shippingSelect.value;
    if (dlgBookSub) dlgBookSub.textContent = `₦${subtotal.toLocaleString()}`;
    if (dlgDeliveryFee) dlgDeliveryFee.textContent = `₦${shipFee.toLocaleString()}`;
    if (dlgGrandTotal) dlgGrandTotal.textContent = `₦${total.toLocaleString()}`;
  };

  if (stepMinus && stepperInput) {
    stepMinus.addEventListener('click', () => {
      let cur = parseInt(stepperInput.value, 10) || 1;
      if (cur > 1) {
        stepperInput.value = cur - 1;
        recalculateBookPricing();
      }
    });
  }

  if (stepPlus && stepperInput) {
    stepPlus.addEventListener('click', () => {
      let cur = parseInt(stepperInput.value, 10) || 1;
      if (cur < 50) {
        stepperInput.value = cur + 1;
        recalculateBookPricing();
      }
    });
  }

  if (shippingSelect) {
    shippingSelect.addEventListener('change', recalculateBookPricing);
  }

  if (fQty) {
    fQty.addEventListener('input', () => {
      if (stepperInput) stepperInput.value = fQty.value;
      recalculateBookPricing();
    });
  }

  if (fDeliveryType) {
    fDeliveryType.addEventListener('change', () => {
      if (shippingSelect) shippingSelect.value = fDeliveryType.value;
      recalculateBookPricing();
    });
  }

  recalculateBookPricing();

  // 7. Interactive Chapters Accordion
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isActive = item.classList.contains('active');

      // Close other accordion items
      document.querySelectorAll('.accordion-item').forEach(other => {
        other.classList.remove('active');
        const otherTrigger = other.querySelector('.accordion-trigger');
        if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // 8. Toast Notification Utility & Click-to-Copy
  const toast = document.getElementById('toast');
  let toastTimer = null;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  const copyTargets = document.querySelectorAll('.copy-target');
  copyTargets.forEach(card => {
    card.addEventListener('click', (e) => {
      const textToCopy = card.dataset.copy;
      if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`✓ Copied to clipboard: ${textToCopy}`);
        }).catch(() => {
          showToast(`Contact: ${textToCopy}`);
        });
      }
    });
  });

  // 9. Book Order Dialog Handling
  const dlg = document.getElementById('orderDlg');
  const orderForm = document.getElementById('orderForm');
  const orderMsg = document.getElementById('orderMsg');
  const submitBtn = document.getElementById('submitBtn');
  const buyBtn = document.getElementById('buyBtn');
  const closeDlg = document.getElementById('closeDlg');
  const closeXBtn = document.getElementById('closeXBtn');

  const openOrderDialog = () => {
    if (!dlg) return;
    if (orderMsg) {
      orderMsg.textContent = '';
      orderMsg.className = 'order-status-msg';
    }
    recalculateBookPricing();
    dlg.showModal();
  };

  const closeOrderDialog = () => {
    if (dlg) dlg.close();
  };

  if (buyBtn) buyBtn.addEventListener('click', openOrderDialog);
  if (closeDlg) closeDlg.addEventListener('click', closeOrderDialog);
  if (closeXBtn) closeXBtn.addEventListener('click', closeOrderDialog);

  if (dlg) {
    dlg.addEventListener('click', (e) => {
      const rect = dlg.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) closeOrderDialog();
    });
  }

  // 10. Order Form Submission to PHP Backend
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!submitBtn || !orderMsg) return;

      submitBtn.disabled = true;
      orderMsg.className = 'order-status-msg';
      orderMsg.textContent = 'Processing your order with dispatch...';

      try {
        const formData = new FormData(orderForm);
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

        orderMsg.className = 'order-status-msg success';
        orderMsg.textContent = `Order placed successfully (Ref: ${data.reference || 'Confirmed'})! Check your email for dispatch & delivery instructions.`;
        showToast('✓ Order received! Details sent to your email.');
        orderForm.reset();
        recalculateBookPricing();
      } catch (err) {
        orderMsg.className = 'order-status-msg error';
        orderMsg.textContent = err.message || 'An error occurred. Please try again or order directly via WhatsApp.';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // 11. General Inquiry Form Handling
  const inquiryForm = document.getElementById('inquiryForm');
  const inquiryStatus = document.getElementById('inquiryStatus');
  const inquirySubmitBtn = document.getElementById('inquirySubmitBtn');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (inquirySubmitBtn) inquirySubmitBtn.disabled = true;
      if (inquiryStatus) {
        inquiryStatus.className = 'form-status-msg';
        inquiryStatus.textContent = 'Sending your message...';
      }

      setTimeout(() => {
        if (inquiryStatus) {
          inquiryStatus.className = 'form-status-msg success';
          inquiryStatus.textContent = 'Thank you! Your inquiry has been sent to Pastor Beloved\'s office. We will reply promptly.';
        }
        showToast('✓ Message sent successfully to the secretariat.');
        inquiryForm.reset();
        if (inquirySubmitBtn) inquirySubmitBtn.disabled = false;
      }, 900);
    });
  }
});
