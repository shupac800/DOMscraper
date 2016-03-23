"use strict";

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

  // add event listeners that allow DOM elements and their equivalents to be selected
  var q = document.getElementsByTagName("*");
  for (var i = 0; i < q.length; i++) {
    q[i].addEventListener("click",function(e) {
      e.preventDefault();  // redundant of stopPropagation?
      e.stopPropagation();

      document.addEventListener("keypress", (e) => {processKeypress(e,z);});

      var tag = e.target.tagName;
      var clist = e.target.classList;
      var index = $(e.target).index();
      var classStr = "";
      clist.forEach((thisClass,idx) => {
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
      //console.log("clicked on item "+idx+", item: ",$(item).html());
      var scrapeValues = [];
      var nodeMapKey = idx - 1;
      if (idx === 0) {  // clicked on the first item in the pop-up menu, which is always "text"
        $(z).each( (i,el) => {
          scrapeValues.push($(el).html());
        });
      } else {         // clicked on item other than first one
        $(z).each( (i,el) => {
          // note similary to parseAttributes -- DRY this up
          var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
          var keys = Object.keys(el.attributes);
          console.log(namedNodeMap[keys[nodeMapKey]].name + ": " + namedNodeMap[keys[nodeMapKey]].value);
          scrapeValues.push(namedNodeMap[keys[nodeMapKey]].value);
        });
      }
      // console.log("outputting array",scrapeValues);
      arrays.push(scrapeValues);  // "arrays" becomes array of arrays
      fields.push("Key_" + arrays.length);
      // console.log("fields:",fields);
      // console.log("arrays:",arrays);
      return false;  // critical!
    });
  });
}

function killPopUp(popOrigin) {
  $("#popUp").remove();
  $(".highlighted").removeClass("highlighted");
}

function selectorAction(selector,fn) {
  $(selector).each( function(idx,element) { fn(element); } );
}


function processKeypress(e,selector) {
  //should use event.which
  console.log("detected keypress",e.keyCode);
  if (e.keyCode === 108) { // lowercase "l" for less
    console.log("less");
  } else if (e.keyCode === 109) { // lowercase "m" for more
    console.log("more");
  } else if (e.keyCode === 97) { // lowercase "a" for add
    uploadScrape();
    arrays = [];
    fields = [];
  }
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
  // build JSON object
  // idea: use map, filter, reduce
  var dataObj = {};
  for (var h = 0; h < arrays.length; h++) {
    var thisThing = '"Thing_' + h + '"';
    dataObj[thisThing] = {};
    for (var i = 0; i < fields.length; i++) {
      var thisKey = '"' + fields[i] + '"';
      var thisValue = arrays[i][h];
      dataObj[thisThing][thisKey] = thisValue;
      console.log("wrote dataObj."+thisThing+"."+thisKey+" = "+thisValue);
    }
  }
  //console.log("dataObj is",dataObj);
  var JSONobj = {"data": dataObj};
  $.ajax({
    url: "https://domscraper.firebaseio.com/data/.json",
    method: "POST",
    data: JSON.stringify(JSONobj);
  }).done(function() {
    console.log("posted!");
  });
  // var x = new XMLHttpRequest();
  // x.open("POST","https://domscraper.firebaseio.com/data/.json");
  // x.send(JSON.stringify(JSONobj));

  // also post a function that can be used as the basis for a pseudo-API
  // spawn a new tab or window that displays, in tabular format, the data you just collected
}

function augmentCSS() {
  // this allows our CSS definitions to be used on the web page we're scraping
  $("head").append('<style type="text/css">#popUp {border: 2px solid black; background-color: #F70; } #popUp ul {margin: 0; padding: 0; } .popUpItem {margin: 0; padding: 0 0 0 5px; } .popUpItem:hover {background-color: blue; color: white; } .highlighted {background-color: #3CE; }</style>');
}
