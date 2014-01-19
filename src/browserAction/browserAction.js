/* global Handlebars */
'use strict';

var eventHistory;

var tabId = parseInt(window.location.search.substring(1), 10);
console.log(tabId);

var $ = document;

var templateNames = ['log-row'];
var templates = {};


function render () {

  var $tableInnerFrag = document.createDocumentFragment();

  // clone messages into own array, sort newest to oldest
  var errors = eventHistory[tabId].errors.slice(0);
  errors = errors.sort(function (a, b) {

    return b.timestamp - a.timestamp;
  });

  errors.forEach(function (thisError) {

    var $rowFrag = $.createDocumentFragment();

    var $tr = $.createElement('tr');

    var $error = $.createElement('td');
    $error.textContent = thisError.text;
    console.log('error', $error);
    $tr.appendChild($error);

    var $info = $.createElement('td');
    var $url = $.createElement('div');
    $url.textContent = thisError.url;
    $info.appendChild($url);

    $tr.appendChild($info);
    $rowFrag.appendChild($tr);

    $tableInnerFrag.appendChild($rowFrag);
  });

  var $log = $.getElementById('log');
  $log.innerHTML = '';
  $log.appendChild($tableInnerFrag);
}

function start () {

  render();
}

window.addEventListener('load', function () {

  chrome.runtime.getBackgroundPage(function (backgroundWindow) {

    eventHistory = backgroundWindow.eventHistory;

    start();
  });
});