/* A user-initiated email draft. This site has no support inbox or send endpoint. */
(function () {
  'use strict';
  function mailto(note, details) {
    var message = String(note || '').trim();
    if (!message) return '';
    details = details || {};
    var labels = details.labels || {};
    var subject = 'Your World, Your Life — ' + (labels.subject || '');
    var body = message + '\n\n---\n' +
      (labels.version || '') + ': ' + (details.version || '') + '\n' +
      (labels.page || '') + ': ' + (details.page || '') + '\n' +
      (labels.locale || '') + ': ' + (details.locale || '') + '\n' +
      (labels.device || '') + ': ' + (details.device || '');
    return 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  window.MEGURI_FEEDBACK = { mailto: mailto };
}());
