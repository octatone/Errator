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