//  https://developer.chrome.com/extensions/content_scripts

// chrome.browserAction.onClicked.addListener(function(tab) {
//   chrome.tabs.executeScript({
//     code: 'document.body.style.backgroundColor="red"'
//   });
// });

// Usually, instead of inserting code directly (as in the previous sample), 
// you put the code in a file. You inject the file's contents like this:

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(
    null, {file: "content_script6.js"}
  );
});

// from http://stackoverflow.com/questions/22544277/chrome-extension-uncaught-referenceerror-is-not-defined
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
//     if(changeInfo && changeInfo.status == "complete"){
//         chrome.tabs.executeScript(tabId, {file: "bower_components/jquery/dist/jquery.min.js"}, function(){
//             chrome.tabs.executeScript(tabId, {file: "script.js"});
//         });
//     }
// });

// chrome.tabs.executeScript(null, { file: "bower_components/jquery/dist/jquery.min.js" }, function() {
//     chrome.tabs.executeScript(null, { file: "content.js" });
// });

