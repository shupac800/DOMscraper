//  https://developer.chrome.com/extensions/content_scripts

chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript(
    null, {file: "content_script2.js"}
  );
});

chrome.tabs.executeScript(null, { file: "bower_components/jquery/dist/jquery.min.js" }, function() {
    chrome.tabs.executeScript(null, { file: "content.js" });
});