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

function attachDebugger (tabId) {

  var debugTarget = {
    'tabId': tabId
  };

  chrome.debugger.attach(debugTarget, debuggerVersion, function () {

    console.log('tab attached', tabId);

    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
      return;
    }

    eventHistory[tabId] = {'count': 0};

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
}

function detachDebugger (tabId, callback) {

  chrome.debugger.detach({'tabId': tabId}, function () {

    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }

    callback();
  });
}

// Debugger Events
chrome.debugger.onEvent.addListener(function (debugee, method, params) {

  var tabId = debugee.tabId;
  var message = params.message;

  if (message && message.level === 'error' && 'count' in eventHistory[tabId]) {
    eventHistory[tabId].count += 1;
    chrome.browserAction.setBadgeText({
      'text': '' + eventHistory[tabId].count,
      'tabId': tabId
    });
  }
});

// Tab Events
chrome.tabs.onCreated.addListener(function (tab) {

  attachDebugger(tab.id);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {

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

chrome.browserAction.onClicked.addListener(function (tab) {

  console.log('clicked');
  attachDebugger(tab.id);
});