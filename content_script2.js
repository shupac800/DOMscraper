"use strict";

var array1 = [];

$(document).ready(function(){
//  console.clear();
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
      var oldBgColor = e.target.style.backgroundColor;
      popUp(e.target);

      // console.log("parentNode name for this element",e.target.parentNode);
      // console.log("parentNodeX2 name for this element",e.target.parentNode.parentNode);
      // console.log("tag name for this element:",e.target.tagName);
      // console.log("class list for this element:",e.target.classList);
      // console.log("index for this element",$(this).index());
      // console.log("attributes list for this element:",e.target.attributes);

      var tag = e.target.tagName;
      var clist = e.target.classList;
      var index = $(e.target).index();
      var classStr = "";
      clist.forEach((thisClass,idx) => {
        classStr += "." + thisClass;
      })
      var z = `${tag}${classStr}:nth-child(${index + 1})`;
      //z = "a:nth-of-type(2)";
      //console.log("z = ",z);
      //console.log("selects " + $(z).length + " elements");
      document.addEventListener("keypress", function(e){processKeypress(e,z);});
      e.target.addEventListener("mouseout", function(e) {
        console.log("got mouseout");
        killPopUp();
        // cancel keyup listener on mouseout
        document.removeEventListener("keypress", processKeypress);
        selectorAction(z,function(el) { $(el).css({"background-color":oldBgColor});} );
      });
      selectorAction(z,function(el) { $(el).css({"background-color":"#3CE"});} );
    });
  }

});  // end document.ready()

var selectorAction = function(selector,fn) {
  $(selector).each( function(idx,element) { fn(element); } );
};


var processKeypress = function(e,selector){
  console.log(e.keyCode);
  if (e.keyCode === 108) { // lowercase "l" for less
    console.log("less");
  } else if (e.keyCode === 109) { // lowercase "m" for more
    console.log("more");
  } else if (e.keyCode === 97) { // lowercase "a" for add
    array1 = [];
    $(selector).each( (idx,element) => {
      console.log("processing element",element);
      array1.push($(element).html());
    });
    console.log(array1);
    // console.log("adding ");

  }
};


var popUp = function(element,x,y) {
  //var rectObject = element.getBoundingClientRect();
  //console.log("rectObject",rectObject);
  $("body").append(`<div id='popUp'></div>`);
  $("#popUp").css( {
    "position":"absolute",
    "top":y,
    "left":x
  });
  $("#popUp").html(parseAttributes(element));

};

var killPopUp = function() {
  $("#popUp").remove();
};

var parseAttributes = function(el) {
  var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
  var keys = Object.keys(el.attributes);
  var i;
  var string = "text: " + $(el).html() + "<br>";
  for (i = "0"; i < keys.length; i++) {
    string += namedNodeMap[keys[i]].name + ": " + namedNodeMap[keys[i]].value + "<br>";
  }
  return string;
};

var doScrape = function() {
  // function that will extract information from the DOM and put it into a JSON object
};

var uploadScrape = function() {
  // function that will upload the JSON object to Firebase
  // and spawn a new window showing the results
};

var selectFromAttributes = function(element) {
  // go through each item in the pop-up menu
  // highlight the one you're hovering over
  // if you click an item, add that data set to the global array

};