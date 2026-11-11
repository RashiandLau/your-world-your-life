/* Text-only making-of reader. All visible strings come from build.py's STORY_COPY. */
(function () {
  'use strict';
  var lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
  var labels = JSON.parse(document.getElementById('story-copy').textContent);
  var chapters = Array.from(document.querySelectorAll('.story-chapter'));
  var prev = document.getElementById('story-prev');
  var next = document.getElementById('story-next');
  var progress = document.getElementById('story-progress');
  var speed = document.getElementById('story-speed');
  var speak = document.getElementById('story-speak');
  var stop = document.getElementById('story-stop');
  var share = document.getElementById('story-share');
  var status = document.getElementById('story-status');
  var returning = document.getElementById('story-returning');
  var storageKey = 'meguri.story.' + lang + '.';
  var synth = window.speechSynthesis;
  var voice = null;
  var token = 0;
  var index = 0;
  var charPosition = 0;

  function saved(key) {
    try { return localStorage.getItem(storageKey + key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(storageKey + key, String(value)); } catch (e) {}
  }
  function selectVoice() {
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') return null;
    try { return synth.getVoices().find(function (item) { return item.lang.toLowerCase().startsWith(lang); }) || null; }
    catch (e) { return null; }
  }
  function refreshVoice() {
    voice = selectVoice();
    speak.disabled = !voice;
    status.textContent = voice ? labels.ready : labels.no_voice;
  }
  function cancelSpeech(resetPosition) {
    token++;
    if (synth) synth.cancel();
    stop.disabled = true;
    if (resetPosition) {
      charPosition = 0;
      save('speechPosition', 0);
    }
  }
  function chapterFromHash() {
    var match = /^#chapter-(\d+)$/.exec(window.location.hash);
    var number = match ? Number(match[1]) : NaN;
    return number >= 1 && number <= chapters.length ? number - 1 : null;
  }
  function showChapter(number, updateHash) {
    if (number < 0 || number >= chapters.length) return;
    if (number !== index) cancelSpeech(true);
    index = number;
    chapters.forEach(function (chapter, i) { chapter.hidden = i !== index; });
    prev.disabled = index === 0;
    next.disabled = index === chapters.length - 1;
    progress.textContent = labels.progress + ' ' + (index + 1) + ' / ' + chapters.length;
    save('chapter', index + 1);
    if (updateHash) window.location.hash = chapters[index].id;
  }

  var visited = saved('visited');
  if (!visited) {
    try { visited = localStorage.getItem('meguri.life') || localStorage.getItem('meguri.en.life') || localStorage.getItem('meguri.past') || localStorage.getItem('meguri.en.past'); }
    catch (e) {}
  }
  returning.hidden = !visited;
  save('visited', 1);
  var savedChapter = Number(saved('chapter'));
  var initial = chapterFromHash();
  index = initial === null && savedChapter >= 1 && savedChapter <= chapters.length ? savedChapter - 1 : (initial === null ? 0 : initial);
  charPosition = initial !== null && initial + 1 !== savedChapter ? 0 : Math.max(0, Number(saved('speechPosition')) || 0);
  if (charPosition === 0) save('speechPosition', 0);
  var savedSpeed = saved('speed');
  if (['0.8', '1', '1.25', '1.5'].includes(savedSpeed)) speed.value = savedSpeed;
  showChapter(index, false);
  refreshVoice();

  prev.addEventListener('click', function () { showChapter(index - 1, true); });
  next.addEventListener('click', function () { showChapter(index + 1, true); });
  speed.addEventListener('change', function () {
    if (['0.8', '1', '1.25', '1.5'].includes(speed.value)) save('speed', speed.value);
  });
  speak.addEventListener('click', function () {
    voice = selectVoice();
    if (!voice) { refreshVoice(); return; }
    cancelSpeech(false);
    var text = chapters[index].textContent.trim();
    if (charPosition >= text.length) charPosition = 0;
    var start = charPosition;
    var utterance = new SpeechSynthesisUtterance(text.slice(start));
    utterance.lang = lang;
    utterance.voice = voice;
    utterance.rate = Number(speed.value) || 1;
    var currentToken = token;
    utterance.onboundary = function (event) {
      if (currentToken !== token) return;
      charPosition = Math.min(text.length, start + event.charIndex);
      save('speechPosition', charPosition);
    };
    utterance.onend = function () {
      if (currentToken !== token) return;
      charPosition = 0;
      save('speechPosition', 0);
      stop.disabled = true;
      status.textContent = labels.finished;
    };
    utterance.onerror = function () {
      if (currentToken !== token) return;
      stop.disabled = true;
      status.textContent = labels.stopped;
    };
    synth.speak(utterance);
    stop.disabled = false;
    status.textContent = labels.speaking;
  });
  stop.addEventListener('click', function () {
    cancelSpeech(false);
    status.textContent = labels.stopped;
  });
  share.addEventListener('click', async function () {
    var url = new URL(window.location.href);
    url.hash = chapters[index].id;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url: url.href }); }
      catch (e) { /* A cancelled share leaves the reading untouched. */ }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(url.href); status.textContent = labels.copied; }
      catch (e) { status.textContent = labels.share_unavailable; }
    } else {
      status.textContent = labels.share_unavailable;
    }
  });
  if (synth) {
    if (synth.addEventListener) synth.addEventListener('voiceschanged', refreshVoice);
    else synth.onvoiceschanged = refreshVoice;
  }
  window.addEventListener('hashchange', function () {
    var target = chapterFromHash();
    if (target !== null && target !== index) showChapter(target, false);
  });
  window.addEventListener('pagehide', function () { cancelSpeech(false); });
})();
