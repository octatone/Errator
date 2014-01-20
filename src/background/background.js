// The MIT License (MIT)

// Copyright (c) 2014 Raymond May, Jr.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var debuggerVersion = '1.0';
var eventHistory = {};

function ifShouldAttachDebugger (tabId, callback) {

  chrome.storage.sync.get(null, function (storedOptions) {

    // default to not run every where!
    if (!('runEveryWhere' in storedOptions)) {
      storedOptions.runEveryWhere = false;
    }

    var runEveryWhere = storedOptions.runEveryWhere;

    // fetch tab info
    chrome.tabs.get(tabId, function (tab) {

      var matchesAPattern = false;
      var patterns;

      if (runEveryWhere) {
        patterns = storedOptions.blacklist || [];
      }
      else {
        patterns = storedOptions.whitelist || [];
      }

      if (patterns.length) {
        patterns.forEach(function (pattern) {

          var regex = new RegExp(pattern);
          if (regex.test(tab.url)) {
            matchesAPattern = true;
          }
        });
      }

      if (runEveryWhere && !matchesAPattern) {
        callback();
      }
      else if (!runEveryWhere && matchesAPattern) {
        callback();
      }
    });
  });
}

function attachDebugger (tabId) {

  var debugTarget = {
    'tabId': tabId
  };

  ifShouldAttachDebugger(tabId, function () {
    // attach debugger to tab
    chrome.debugger.attach(debugTarget, debuggerVersion, function () {

      console.log('tab attached', tabId);

      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        return;
      }

      eventHistory[tabId] = {
        'count': 0,
        'errors': []
      };

      chrome.browserAction.setBadgeText({
        'text': '' + eventHistory[tabId].count,
        'tabId': tabId
      });

      chrome.debugger.sendCommand(debugTarget, 'Console.enable', function () {

        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
        }
      });
    });
  });
}

function detachDebugger (tabId, callback) {

  chrome.debugger.detach({'tabId': tabId}, function () {

    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }

    callback();
  });
}

function updateBrowserActionPopupURL (tabId) {

  console.log('setting up popup for tab', tabId);
  chrome.browserAction.setPopup({

    'tabId': tabId,
    'popup': 'src/browserAction/browserAction.html?' + tabId
  });
}

// Debugger Events
chrome.debugger.onEvent.addListener(function (debugee, method, params) {

  var tabId = debugee.tabId;
  var message = params.message;

  if (message && message.level === 'error' && message.source === 'javascript' && 'count' in eventHistory[tabId]) {
    eventHistory[tabId].count += 1;
    eventHistory[tabId].errors.push(message);
    chrome.browserAction.setBadgeText({
      'text': '' + eventHistory[tabId].count,
      'tabId': tabId
    });
  }
});

// Tab Events
chrome.tabs.onCreated.addListener(function (tab) {

  var tabId = tab.id;
  attachDebugger(tabId);
  updateBrowserActionPopupURL(tabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {

  updateBrowserActionPopupURL(tabId);

  if (changeInfo.status !== 'loading') {
    return;
  }

  var refresh = 'url' in changeInfo === false;
  console.log('refresh?', refresh);

  if (!refresh) {
    attachDebugger(tabId);
  }
  else {
    detachDebugger(tabId, function () {

      attachDebugger(tabId);
    });
  }
});