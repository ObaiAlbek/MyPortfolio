/* js/contact.js */
(() => {
  const $ = (s, root = document) => root.querySelector(s);

  // => Dein Formular im HTML: <div class="contact-form"><form ...>...</form></div>
  const form = $('.contact-form form');
  if (!form) return;

  // Felder entsprechend deinem HTML
  const firstNameI = $('#firstName', form);
  const lastNameI  = $('#lastName', form);
  const emailI     = $('#email', form);
  const subjectI   = $('#subject', form);
  const messageI   = $('#message', form);
  const sendBtn    = form.querySelector('.submit-btn');

  // Optionaler Honeypot: falls du ein verstecktes Feld <input id="website" ...> ergänzen willst
  const honeyPot   = $('#website', form);

  // Alert/Status-Zeile für Fehlermeldungen
  let alertEl = $('#formAlert', form);
  if (!alertEl) {
    alertEl = document.createElement('div');
    alertEl.id = 'formAlert';
    alertEl.setAttribute('role', 'status');
    alertEl.setAttribute('aria-live', 'polite');
    alertEl.style.marginBottom = '1rem';
    alertEl.style.fontSize = '0.95rem';
    form.prepend(alertEl);
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const MIN_NAME = 2;
  const MIN_SUBJECT = 3;
  const MIN_MSG = 10;

  const setAlert = (msg, good = false) => {
    alertEl.textContent = msg || '';
    alertEl.style.color = good ? 'var(--accent, #2dd4bf)' : '#ff9aa2';
  };

  // Kleinere Helper für Feld-Validierung
  const val = el => (el?.value || '').trim();

  function validate() {
    const errors = [];
    if (!firstNameI || val(firstNameI).length < MIN_NAME)
      errors.push('Bitte gib einen gültigen Vornamen ein (mind. 2 Zeichen).');

    if (!lastNameI || val(lastNameI).length < MIN_NAME)
      errors.push('Bitte gib einen gültigen Nachnamen ein (mind. 2 Zeichen).');

    if (!emailI || !emailRx.test(val(emailI)))
      errors.push('Bitte gib eine gültige E-Mail-Adresse an.');

    if (!subjectI || val(subjectI).length < MIN_SUBJECT)
      errors.push('Bitte gib einen Betreff an (mind. 3 Zeichen).');

    if (!messageI || val(messageI).length < MIN_MSG)
      errors.push('Nachricht bitte mit mindestens 10 Zeichen.');

    if (honeyPot && val(honeyPot)) // BOT/Honeypot
      errors.push('Spam erkannt.');

    return errors;
  }

  // UX: Entferne Fehlermeldung beim Tippen
  [firstNameI, lastNameI, emailI, subjectI, messageI].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      if (alertEl.textContent) setAlert('');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setAlert('');

    const errors = validate();
    if (errors.length) {
      setAlert(errors[0]);
      (firstNameI || form).focus();
      return;
    }

    // Button sperren + Status
    const btn = sendBtn || form.querySelector('button, input[type="submit"]');
    const origLabel = btn?.textContent || '';
    if (btn) {
      btn.disabled = true;
      if (btn.tagName === 'INPUT') btn.value = 'Wird gesendet …';
      else btn.textContent = 'Wird gesendet …';
    }

    try {
      const fd = new FormData(form);

      // Fallback-Action, falls nicht gesetzt
      const action = form.getAttribute('action') || 'php/send.php';

      const res = await fetch(action, {
        method: form.getAttribute('method') || 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });

      // Versuche JSON zu lesen – wenn keins kommt, ist das okay
      let ok = false;
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const data = await res.json();
          ok = !!data?.ok;
          if (!ok && data?.error) throw new Error(data.error);
        } else {
          // Kein JSON → Erfolg an HTTP-Status koppeln
          ok = res.ok;
        }
      } catch {
        // JSON-Parse-Fehler → wenn HTTP ok, trotzdem weiter
        ok = ok || res.ok;
      }


      // Erfolg → Danke-Seite
      window.location.href = 'html/thanks.html';
    } catch (err) {
      setAlert(err?.message || 'Es ist ein Fehler aufgetreten.');
      if (btn) {
        btn.disabled = false;
        if (btn.tagName === 'INPUT') btn.value = origLabel || 'Nachricht senden';
        else btn.textContent = origLabel || 'Nachricht senden';
      }
    }
  });
})();
