const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const CONTACT_ACTION = 'contact';

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};

    // Honeypot: bots often fill this hidden field. Return a silent success.
    if (clean_(params.website, 200)) return response_(true, 'Message sent.');

    const props = PropertiesService.getScriptProperties();
    const destination = clean_(props.getProperty('DESTINATION_EMAIL'), 254);
    const turnstileSecret = clean_(props.getProperty('TURNSTILE_SECRET'), 500);
    const allowedHostname = clean_(props.getProperty('ALLOWED_HOSTNAME'), 253);

    if (!destination || !turnstileSecret || !allowedHostname) {
      throw new Error('Missing script properties.');
    }

    const name = clean_(params.name, 120);
    const organisation = clean_(params.organisation, 160);
    const email = clean_(params.email, 254);
    const subject = clean_(params.subject, 140);
    const message = cleanMultiline_(params.message, 8000);
    const language = clean_(params.language, 8) || 'en';
    const source = clean_(params.source, 200) || 'contact';
    const token = String(params['cf-turnstile-response'] || '').trim();

    if (!name || !email || !subject || !message) return response_(false, 'Missing required fields.');
    if (!validEmail_(email)) return response_(false, 'Invalid email address.');
    if (!token || token.length > 2048) return response_(false, 'Security verification failed.');

    const verification = verifyTurnstile_(token, turnstileSecret);
    if (!verification.success) return response_(false, 'Security verification failed. Please try again.');
    if (verification.hostname !== allowedHostname) return response_(false, 'Security verification failed.');
    if (verification.action !== CONTACT_ACTION) return response_(false, 'Security verification failed.');

    // Small privacy-friendly cooldown keyed by a SHA-256 digest of the sender email.
    // The plain address is not stored in CacheService.
    const cache = CacheService.getScriptCache();
    const rateKey = 'contact:' + digest_(email.toLowerCase());
    if (cache.get(rateKey)) return response_(false, 'Please wait a minute before sending another message.');
    cache.put(rateKey, '1', 60);

    if (MailApp.getRemainingDailyQuota() < 1) return response_(false, 'Contact is temporarily unavailable. Please try again later.');

    const mailSubject = '[DATA C0RE / CONTACT] ' + subject;
    const body = [
      'DATA C0RE / CONTACT',
      '',
      'Name: ' + name,
      'Organisation: ' + (organisation || '—'),
      'Email: ' + email,
      'Language: ' + language,
      'Source: ' + source,
      '',
      'Message:',
      message
    ].join('\n');

    MailApp.sendEmail({
      to: destination,
      replyTo: email,
      subject: mailSubject,
      body: body,
      name: 'DATA C0RE contact'
    });

    return response_(true, 'Message sent.');
  } catch (error) {
    // Never log form contents or destination addresses.
    console.error('DATA C0RE contact backend error: ' + (error && error.message ? error.message : 'unknown error'));
    return response_(false, 'The message could not be sent. Please try again.');
  }
}

function verifyTurnstile_(token, secret) {
  const response = UrlFetchApp.fetch(TURNSTILE_VERIFY_URL, {
    method: 'post',
    payload: {
      secret: secret,
      response: token
    },
    muteHttpExceptions: true
  });

  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    return { success: false };
  }

  try {
    return JSON.parse(response.getContentText());
  } catch (_) {
    return { success: false };
  }
}

function response_(ok, message) {
  const payload = JSON.stringify({
    source: 'data-c0re-contact',
    ok: Boolean(ok),
    message: String(message || '')
  });

  const html = '<!doctype html><meta charset="utf-8"><script>' +
    'window.parent.postMessage(' + payload + ', "*");' +
    '<\/script>';

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanMultiline_(value, maxLength) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function validEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[\r\n]/.test(email);
}

function digest_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '').slice(0, 32);
}
