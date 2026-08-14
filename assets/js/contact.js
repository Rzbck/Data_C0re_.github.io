(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const config = window.DATA_C0RE_CONTACT || {};
  const submit = form.querySelector('[data-contact-submit]');
  const status = form.querySelector('[data-contact-status]');
  const slot = form.querySelector('[data-turnstile-slot]');
  const frame = document.querySelector('[data-contact-frame]');
  const languageInput = form.querySelector('[data-contact-language]');
  const lang = (document.documentElement.lang || 'en').slice(0, 2);

  const copy = {
    en: {
      staging: 'Secure contact is not active yet.',
      verify: 'Complete the security check before sending.',
      ready: 'Security check complete. Your message is ready to send.',
      sending: 'Sending…',
      success: 'Message sent. Thank you — DATA C0RE will reply by email.',
      error: 'The message could not be sent. Please try again.',
      timeout: 'The response is taking too long. Please try again.',
      challengeError: 'The security check could not load. Refresh the page and try again.',
      invalid: 'Please complete the required fields.'
    },
    fr: {
      staging: 'Le contact sécurisé n’est pas encore actif.',
      verify: 'Validez la vérification de sécurité avant l’envoi.',
      ready: 'Vérification terminée. Le message est prêt à être envoyé.',
      sending: 'Envoi…',
      success: 'Message envoyé. Merci — DATA C0RE répondra par e-mail.',
      error: 'Le message n’a pas pu être envoyé. Réessayez.',
      timeout: 'La réponse prend trop de temps. Réessayez.',
      challengeError: 'La vérification de sécurité n’a pas pu charger. Rechargez la page.',
      invalid: 'Complétez les champs obligatoires.'
    },
    es: {
      staging: 'El contacto seguro todavía no está activo.',
      verify: 'Completa la verificación de seguridad antes de enviar.',
      ready: 'Verificación completada. El mensaje está listo para enviarse.',
      sending: 'Enviando…',
      success: 'Mensaje enviado. Gracias — DATA C0RE responderá por correo.',
      error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      timeout: 'La respuesta está tardando demasiado. Inténtalo de nuevo.',
      challengeError: 'No se pudo cargar la verificación de seguridad. Recarga la página.',
      invalid: 'Completa los campos obligatorios.'
    }
  }[lang] || null;

  const text = copy || {
    staging: 'Secure contact is not active yet.', verify: 'Complete the security check before sending.', ready: 'Security check complete. Your message is ready to send.', sending: 'Sending…', success: 'Message sent.', error: 'The message could not be sent.', timeout: 'The response is taking too long.', challengeError: 'Security check unavailable.', invalid: 'Please complete the required fields.'
  };

  let widgetId = null;
  let verified = false;
  let responseTimer = null;

  function setStatus(message, state = '') {
    status.textContent = message;
    status.dataset.state = state;
  }

  function resetChallenge() {
    verified = false;
    submit.disabled = true;
    if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
  }

  function loadTurnstile() {
    if (window.turnstile) return renderTurnstile();
    window.__dataC0reTurnstileReady = renderTurnstile;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__dataC0reTurnstileReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      submit.disabled = true;
      setStatus(text.challengeError, 'error');
    };
    document.head.appendChild(script);
  }

  function renderTurnstile() {
    if (!window.turnstile || !slot || widgetId !== null) return;
    widgetId = window.turnstile.render(slot, {
      sitekey: config.turnstileSiteKey,
      theme: 'dark',
      action: 'contact',
      callback: () => {
        verified = true;
        submit.disabled = false;
        setStatus(text.ready, 'success');
      },
      'expired-callback': () => {
        verified = false;
        submit.disabled = true;
        setStatus(text.verify);
      },
      'error-callback': () => {
        verified = false;
        submit.disabled = true;
        setStatus(text.challengeError, 'error');
      }
    });
  }

  const active = config.enabled === true && /^https:\/\/script\.google\.com\/macros\/s\//.test(config.endpoint || '') && String(config.turnstileSiteKey || '').length > 10;
  if (!active) {
    submit.disabled = true;
    setStatus(text.staging);
    return;
  }

  form.action = config.endpoint;
  if (languageInput) languageInput.value = lang;
  setStatus(text.verify);
  loadTurnstile();

  form.addEventListener('submit', event => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      setStatus(text.invalid, 'error');
      return;
    }
    if (!verified) {
      event.preventDefault();
      setStatus(text.verify, 'error');
      return;
    }

    submit.disabled = true;
    setStatus(text.sending);
    clearTimeout(responseTimer);
    responseTimer = window.setTimeout(() => {
      setStatus(text.timeout, 'error');
      resetChallenge();
    }, 20000);
  });

  window.addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow) return;
    const payload = event.data;
    if (!payload || payload.source !== 'data-c0re-contact') return;
    clearTimeout(responseTimer);

    if (payload.ok === true) {
      form.reset();
      if (languageInput) languageInput.value = lang;
      setStatus(text.success, 'success');
      resetChallenge();
    } else {
      setStatus(payload.message || text.error, 'error');
      resetChallenge();
    }
  });
})();
