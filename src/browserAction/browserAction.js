'use strict';

var tabId = parseInt(window.location.search.substring(1));
console.log(tabId);


chrome.runtime.getBackgroundPage(function (backgroundWindow) {

  console.dir(backgroundWindow.eventHistory);
});

// var initialTabId;

// chrome.tabs.getCurrent(function (tab) {

//   initialTabId = tab.id;
//   console.log('inital tab id is', initialTabId);
// });


// function onActiveTabChanged (activeInfo) {

//   var tabId = activeInfo.tabId;

//   console.log('active tab changed to', tabId);
// }

// // Tab Events
// chrome.tabs.onActivated.addListener(onActiveTabChanged);