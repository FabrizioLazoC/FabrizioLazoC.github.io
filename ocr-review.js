'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const draft = $('ocr-draft');
  const original = draft.value;
  let previous = original;
  const history = [];
  const status = message => { $('review-status').textContent = message; };
  function record(value) {
    if (value !== previous) { history.push(previous); previous = value; }
    $('undo-edit').disabled = history.length === 0;
    $('review-confirmed').checked = false;
    $('download-text').disabled = true;
  }
  function step(name) {
    ['review', 'confirm', 'export'].forEach(id => {
      $('step-' + id).removeAttribute('aria-current');
    });
    $('step-' + name).setAttribute('aria-current', 'step');
  }
  draft.addEventListener('input', () => {
    record(draft.value);
    status('Draft edited. Original engine output preserved.');
  });
  $('undo-edit').addEventListener('click', () => {
    if (!history.length) return;
    draft.value = history.pop(); previous = draft.value;
    $('undo-edit').disabled = !history.length;
    status('Last edit undone.'); draft.focus();
  });
  $('reset-draft').addEventListener('click', () => {
    $('reset-panel').hidden = false; $('confirm-reset').focus();
  });
  $('cancel-reset').addEventListener('click', () => {
    $('reset-panel').hidden = true; $('reset-draft').focus();
  });
  $('confirm-reset').addEventListener('click', () => {
    record(original); draft.value = original;
    $('reset-panel').hidden = true;
    status('Original restored. Undo is available.'); draft.focus();
  });
  $('continue-review').addEventListener('click', () => {
    if (!draft.value.trim()) {
      status('Add text before continuing. Your draft is empty.'); draft.focus(); return;
    }
    $('export-preview').textContent = draft.value;
    $('review-confirmed').checked = false; $('download-text').disabled = true;
    $('review-panel').hidden = true; $('confirm-panel').hidden = false;
    step('confirm'); status('Confirm your review before downloading.');
    $('review-confirmed').focus();
  });
  $('back-edit').addEventListener('click', () => {
    $('confirm-panel').hidden = true; $('review-panel').hidden = false;
    $('review-confirmed').checked = false; $('download-text').disabled = true;
    step('review'); status('Back to editing. Export confirmation cleared.'); draft.focus();
  });
  $('review-confirmed').addEventListener('change', () => {
    $('download-text').disabled = !$('review-confirmed').checked;
  });
  $('download-text').addEventListener('click', () => {
    if (!$('review-confirmed').checked || !draft.value.trim()) return;
    const url = URL.createObjectURL(new Blob([draft.value], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'shopping-list-reviewed.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    step('export'); status('Download requested. Your reviewed text is ready; you can return to editing.');
  });
})();
