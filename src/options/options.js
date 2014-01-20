(function () {

  'use strict';

  var $ = document;
  var store = chrome.storage.sync;

  function loadStoredOptions () {

    store.get(null, function (storedOptions) {

      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
      }

      $.querySelector('.runEveryWhere.true').checked = (storedOptions.runEveryWhere === true);
      $.querySelector('.runEveryWhere.false').checked = (storedOptions.runEveryWhere === false);
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
    lines.forEach(function (line) {

      line = line.trim();
    });

    console.log(lines);
  }

  function onSaveButtonClick () {

    var $blacklist = $.querySelector('#blacklist');
    var $whitelist = $.querySelector('#whitelist');


  }

  window.addEventListener('load', function () {

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
