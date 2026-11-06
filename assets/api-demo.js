/* A local browser trial of the same engine used by the Node core. */
(function () {
  'use strict';
  var words = {
    ja: {
      seed: '種には 0〜4294967295 の整数を入れてください。',
      era: '時代を選んでください。', year: '過去の出生年は 1950〜2025 年で指定してください。',
      loading: '人生を準備しています。', failed: '生成できませんでした。入力を確かめてください。',
      done: 'この種から生まれた一生です。', age: '{age}歳（{year}年）', event: '{age}：{text}',
      title: '{name}：{country}、{year}年生まれ、{age}歳で亡くなりました。',
      noEvents: '表示できる出来事はありません。'
    },
    en: {
      seed: 'Enter an integer from 0 to 4294967295.',
      era: 'Choose an era.', year: 'For a past life, enter a birth year from 1950 to 2025.',
      loading: 'Preparing the life.', failed: 'Could not generate a life. Check the inputs.',
      done: 'A life generated from this seed.', age: 'Age {age} ({year})', event: '{age}: {text}',
      title: '{name}: born in {country} in {year}, died at age {age}.',
      noEvents: 'There are no events to display.'
    }
  };
  var lang = document.documentElement.lang === 'en' ? 'en' : 'ja';
  function t(key, values) {
    return words[lang][key].replace(/\{(\w+)\}/g, function (_, name) { return String(values[name]); });
  }
  function simulate(seedText, options) {
    if (!/^(0|[1-9]\d*)$/.test(String(seedText)) || Number(seedText) > 0xffffffff) throw new TypeError(t('seed', {}));
    var era = options.era || 'now';
    if (['now', 'past', 'future'].indexOf(era) < 0) throw new TypeError(t('era', {}));
    var settings = { era: era, method: 'births', gentle: !!options.gentle, themeDate: '2026-11-06' };
    if (era === 'past') {
      var year = String(options.year == null ? '' : options.year);
      if (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > 2025) throw new TypeError(t('year', {}));
      settings.year = Number(year);
    }
    var life = JSON.parse(JSON.stringify(window.MEGURI.simulateFull(Number(seedText), settings)));
    // Wall-clock record metadata is outside the versioned deterministic contract.
    delete life.ended;
    var events = life.history.map(function (event) {
      return { id: event.id, age: event.age, year: event.year, type: event.type,
        text: event.text, tone: event.tone, identity: event.identity,
        causeId: event.causeId, src: event.src, stat: event.stat };
    });
    return { contractVersion: '1.0.0', life: life, experiences: events };
  }
  window.MEGURI_API_DEMO = { simulate: simulate };

  var form = document.getElementById('api-demo-form');
  if (!form) return;
  form.noValidate = true;
  var seed = document.getElementById('api-demo-seed');
  var era = document.getElementById('api-demo-era');
  var year = document.getElementById('api-demo-year');
  var gentle = document.getElementById('api-demo-gentle');
  var button = document.getElementById('api-demo-run');
  var status = document.getElementById('api-demo-status');
  var output = document.getElementById('api-demo-output');
  function syncYear() { year.disabled = era.value !== 'past'; }
  era.addEventListener('change', syncYear);
  syncYear();
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    output.hidden = true;
    button.disabled = true;
    status.textContent = t('loading', {});
    window.MEGURI_DATA.ready().then(function () {
      try {
        var result = simulate(seed.value, { era: era.value, year: year.value, gentle: gentle.checked });
        document.getElementById('api-demo-title').textContent = t('title', {
          name: result.life.name, country: result.life.country, year: result.life.birthYear, age: result.life.death.age
        });
        document.getElementById('api-demo-summary').textContent = result.life.summary;
        document.getElementById('api-demo-support').textContent = result.life.death.supportLine || '';
        var list = document.getElementById('api-demo-events');
        list.textContent = '';
        result.experiences.slice(0, 12).forEach(function (row) {
          var item = document.createElement('li');
          item.textContent = t('event', { age: t('age', { age: row.age, year: row.year }), text: row.text });
          item.dataset.tone = row.tone || 'neutral';
          list.appendChild(item);
        });
        if (!list.children.length) list.textContent = t('noEvents', {});
        document.getElementById('api-demo-json').textContent = JSON.stringify(result, null, 2);
        output.hidden = false;
        status.textContent = t('done', {});
      } catch (error) {
        status.textContent = error instanceof TypeError ? error.message : t('failed', {});
      }
      button.disabled = false;
    }, function () {
      status.textContent = t('failed', {});
      button.disabled = false;
    });
  });
})();
