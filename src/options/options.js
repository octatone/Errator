(function () {

  'use strict';

  var $ = document;
  var store = chrome.storage.sync;

  function escapeHtml (str) {

    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function renderStrings () {

    var els = $.getElementsByClassName('i18n');
    els = Array.prototype.slice.call(els);
    els.forEach(function (el) {

      var key = el.getAttribute('data-key');
      var str = chrome.i18n.getMessage(key);
      var escaped = escapeHtml(str);
      el.innerHTML = escaped;
    });
  }

  function loadStoredOptions () {

    store.get(null, function (storedOptions) {

      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
      }

      // default to not run every where!
      if (!('runEveryWhere' in storedOptions)) {
        storedOptions.runEveryWhere = false;
      }

      [true, false].forEach(function (bool) {

        $.querySelector('.runEveryWhere.' + bool).checked = (storedOptions.runEveryWhere === bool);
      });

      ['whitelist', 'blacklist'].forEach(function (list) {

        var patterns = storedOptions[list] || [];
        $.querySelector('#' + list).value = patterns.length ? patterns.join('\n') : '';
      });
    });
  }

  function onRunEverywherRadioClick (ev) {

    var target = ev.target;
    var value = target.value === 'true';

    store.set({'runEveryWhere': value}, function () {

      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }

      console.log('runEveryWhere set to', value);
    });
  }

  function splitByLineAndTrim (text) {

    var lines = text.split('\n');
    lines.forEach(function (line, idx) {

      lines[idx] = line.trim();
    });

    return lines;
  }

  function onSaveButtonClick () {

    ['blacklist', 'whitelist'].forEach(function (list) {

      var $list = $.querySelector('#' + list);
      var lines = splitByLineAndTrim($list.value);

      var validPatterns = [];
      lines.forEach(function (line) {

        var valid = line !== '';
        try {
          new RegExp(line);
        }
        catch (e) {
          valid = false;
        }

        if (valid) {
          validPatterns.push(line);
        }
      });

      var data = {};
      data[list] = validPatterns;

      store.set(data, function () {

        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
        console.log(list + ' set to', validPatterns);
      });
    });
  }

  window.addEventListener('load', function () {

    renderStrings();
    loadStoredOptions();

    var $optionsForm = $.getElementById('options');
    var $runEveryWhereRadios = $optionsForm.getElementsByClassName('runEveryWhere');
    for (var i = 0, len = $runEveryWhereRadios.length; i < len; i++) {
      $runEveryWhereRadios[i].addEventListener('click', onRunEverywherRadioClick);
    }

    var $saveButton = $.getElementById('save');
    $saveButton.addEventListener('click', onSaveButtonClick);
  });

})();
