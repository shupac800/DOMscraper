"use strict";

// initialize globals
var arrays = [];
var fields = [];

$(document).ready(function(){
  console.clear();
  console.log("running");

// disable all buttons and links:
  $("a").css("cursor","arrow").click(false);  // maybe this belongs on all elements, not just A?
  $("img").css("cursor","arrow").click(false);  // successfully disables clicks on cars.com car images
  $(":input").prop("disabled",true);

  // disable all other click listeners
  var b = document.getElementsByTagName("*");
  var i;
  for (i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }
  //
  augmentCSS();

  // remove element attributes that take action upon click
  var q = document.getElementsByTagName("*");
  for (var i = 0; i < q.length; i++) {
    var attributes = q[i].attributes;
    var j = attributes.length;
    while(j--){
      if
         (
          // (attributes[j].name === "href") ||
         (attributes[j].name === "onclick") ||
         (attributes[j].name === "ng-click") ||
         (attributes[j].name === "ng-href"))
         // ||
         // (attributes[j].name === "xxxxx") ) {
      {
        q[i].removeAttributeNode(attributes[j]);
      }
    }
  }

  popControlWin();  // spawn control window
  $("#button-upload").on("click",uploadScrape);

  // add event listeners that allow DOM elements and their equivalents to be selected
  var q = document.getElementsByTagName("*");
  for (var i = 0; i < q.length; i++) {
    q[i].addEventListener("click",function(e) {
      e.preventDefault();  // redundant of stopPropagation?
      e.stopPropagation();

      //document.addEventListener("keypress", (e) => {processKeypress(e,z);});

      var tag = e.target.tagName;
      var clist = e.target.classList;
      var index = $(e.target).index();
      var classStr = "";
      clist.forEach( (thisClass,idx) => {
        classStr += "." + thisClass;
      });
      var z = `${tag}${classStr}:nth-child(${index + 1})`;

      selectorAction(z, (el) => { $(el).addClass("highlighted"); } );

      popUp(e,z);
    });
  }
});  // end document.ready()


function popUp(e,z) {
  var popOrigin = e.target;
  //console.log("event",e);
  $("body").append(`<div id='popUp'></div>`);
  $("#popUp").offset({top:e.pageY, left:e.pageX});  
  // positioning an element using pageX, pageY or clientX, clientY triggers mouseleave or mouseout -- why??
  $("#popUp").html(parseAttributes(popOrigin));

  // add listener to close #popUp if mouse moves out of it
  $("#popUp").on("mouseleave", () => { killPopUp(popOrigin); });

  // add listener to each attribute displayed
  $("#popUp li").each( (idx,item) => {
    $(item).click( (e) => {
      console.log("clicked on index "+idx+", item: ",$(item).html());
      var scrapeValues = [];
      var nodeMapKey = idx - 1;
      if (idx === 0) {  // clicked on the first item in the pop-up menu, which is always "text"
        $(z).each( (i,el) => {
          scrapeValues.push($(el).html());
        });
        console.log("added " + scrapeValues.length + " values to scrapeValues");
      } else {         // clicked on item other than first one, meaning, an attribute
        $(z).each( (i,el) => {
          // note similary to parseAttributes -- DRY this up
          var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
          var keys = Object.keys(el.attributes);
          console.log(namedNodeMap[keys[nodeMapKey]].name + ": " + namedNodeMap[keys[nodeMapKey]].value);
          scrapeValues.push(namedNodeMap[keys[nodeMapKey]].value);
        });
      }
      // update popCtrlWin with new no. of keys tracked
      // ******** UPGRADE: have user enter a key name for this set of values **********
      var numKeysSelected = $("#numKeysSelected").html().split(" ")[0];
      numKeysSelected++;
      $("#numKeysSelected").text(numKeysSelected + " keys selected");
      console.log("outputting array",scrapeValues);
      arrays.push(scrapeValues);  // "arrays" becomes array of arrays
      fields.push("Key_" + arrays.length);
      console.log("fields:",fields);
      console.log("arrays:",arrays);
      return false;  // critical!
    });
  });
}


function popControlWin() {
  $("body").append("<div id='popCtrlWin'><p>DOMscraper</p><p id='numKeysSelected'>0 keys selected</p><button id='button-upload'>Upload</button></div>");
  $("#popCtrlWin").draggable();
}


function killPopUp(popOrigin) {
  $("#popUp").remove();
  $(".highlighted").removeClass("highlighted");
}


function selectorAction(selector,fn) {
  $(selector).each( function(idx,element) { fn(element); } );
}


function parseAttributes(el) {
  var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
  var keys = Object.keys(el.attributes);
  var i;
  var string = "<ul style='list-style-type:none'><li class='popUpItem'>text: " + $(el).html() + "</li>";
  for (i = "0"; i < keys.length; i++) {
    string += "<li class='popUpItem'>" + namedNodeMap[keys[i]].name + ": " + namedNodeMap[keys[i]].value + "</li>";
  }
  return string + "</ul>";
}


function uploadScrape() {
  // idea: use map, filter, reduce to build JSON object?

  // initialize objects
  var dataObj = {};
  for (var h = 0; h < arrays[0].length; h++) {
    var thisThing = '"Thing_' + h + '"';  // JSON requires keys to be in quotes
    dataObj[thisThing] = {};
  }

  // populate objects
  for (var i = 0; i < fields.length; i++) {
      var thisKey = '"' + fields[i] + '"';
      console.log("fields[i]",i,fields[i]);
    for (var h = 0; h < arrays[0].length; h++) {
      var thisThing = '"Thing_' + h + '"';  // JSON requires keys to be in quotes
      var thisValue = arrays[i][h];
      dataObj[thisThing][thisKey] = thisValue;
      console.log("wrote dataObj." + thisThing + "." + thisKey + " = " + thisValue);
    }
  }
  var JSONobj = {"data": dataObj};

  // post JSON object to Firebase under new key
  $.ajax({
    url: "https://domscraper.firebaseio.com/datasets/.json",
    method: "POST",
    data: JSON.stringify(JSONobj)
  }).done(function(o) {  // AJAX returns object {name: newkeyname}
    console.log("posted new key",o.name);
    // spawn a new tab or window that displays, in tabular format, the data you just collected
    // re-initialize globals
    spawnWindow(o.name);
    arrays = [];
    fields = [];
    $("#numKeysSelected").html("0 keys selected");  // reset key counter
    // also post a function that can be used as the basis for a pseudo-API
  });
}

function augmentCSS() {
  // this allows our CSS definitions to be used on the web page we're scraping
  $("head").append('<style type="text/css">#popUp {border: 2px solid black; background-color: #F70; } #popUp ul {margin: 0; padding: 0; } .popUpItem {margin: 0; padding: 0 0 0 5px; } .popUpItem:hover {background-color: blue; color: white; } .highlighted {background-color: #3CE; }</style>');
}

function spawnWindow(firebaseKey) {
  document.cookie =  "firebaseKey=" + firebaseKey;
  window.open("http://localhost:8080/showResults.html").focus();
}