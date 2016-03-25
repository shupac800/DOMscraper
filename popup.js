//document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  var win = chrome.extension.getBackgroundPage(); 
  document.getElementsByTagName("h2")[0].innerHTML = "xxx";
  var foo = win.document.getElementsByTagName("h1")[0].innerHTML;
  checkPageButton.addEventListener('click', function() {
    // how to change focus to main window?
    // or, how to access DOM of main window? 
    // chrome.windows.getAll(function(array) {
    //   console.log(array);
    // });
    win.querySelector("body").style.backgroundColor = "yellow";
  });
//});


// use popup.js to display splash screen with instructions