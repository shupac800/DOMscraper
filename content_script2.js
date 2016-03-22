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

      //document.addEventListener("keypress", function(e){processKeypress(e,z);});
      //var oldBgColor = e.target.style.backgroundColor;

      //$(e.target).on("mouseleave",function(e) {mLeave(e,z)});

      var tag = e.target.tagName;
      var clist = e.target.classList;
      var index = $(e.target).index();
      var classStr = "";
      clist.forEach((thisClass,idx) => {
        classStr += "." + thisClass;
      });
      var z = `${tag}${classStr}:nth-child(${index + 1})`;

      selectorAction(z,function(el) { $(el).addClass("highlighted"); } );

      popUp(e,z);
    });
  }

});  // end document.ready()

var mLeave = function(e,z) {  // THIS IS FUCKED UP
  console.log("got mouseleave");
  killPopUp();
  // cancel keyup listener on mouseout
  document.removeEventListener("keypress", processKeypress);
  selectorAction(z,function(el) { $(el).removeClass("highlighted"); } );
  // cause this listener to self-destruct after it executes
  $(e.target).off("mouseleave",mLeave);
  return false; // necessary? helpful?
}


var popUp = function(e,z) {
  var popOrigin = e.target;
  console.log("event",e);
  //var rectObject = element.getBoundingClientRect();
  //console.log("rectObject",rectObject);
  $("body").append(`<div id='popUp'></div>`);
  $("#popUp").offset({top:e.pageY, left:e.pageX});  
  // positioning an element using pageX, pageY or clientX, clientY triggers mouseleave or mouseout -- why??
  $("#popUp").html(parseAttributes(popOrigin));

// have to make sure

  // add listener to close #popUp if mouse moves out of it
  $("#popUp").on("mouseleave",function(){killPopUp(popOrigin);});

  // add listener to each attribute displayed
  $("#popUp li").each(function(idx,item) {
    $(item).click(function(e) {
      console.log("clicked on item "+idx+", item: ",$(item).html());
      console.log("writing to array:");
      var nodeMapKey = idx - 1;
      if (idx === 0) {  // clicked on the first item in the pop-up menu
        $(z).each(function(i,item) {
          console.log($(item).html());
          array1.push($(item).html());
        });
      } else {         // clicked on item other than first one
        $(z).each(function(i,el) {
          // note similary to parseAttributes -- DRY this up
          var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
          var keys = Object.keys(el.attributes);
          console.log("index",nodeMapKey);
          console.log(namedNodeMap[keys[nodeMapKey]].name + ": " + namedNodeMap[keys[nodeMapKey]].value);
        });
      }
      return false;  // critical!
    });
  });
};

var killPopUp = function(popOrigin) {
  $("#popUp").remove();
  //$(popOrigin).html("fuck you");
  $(".highlighted").removeClass("highlighted");
};


var selectorAction = function(selector,fn) {
  $(selector).each( function(idx,element) { fn(element); } );
};


var processKeypress = function(e,selector){
  //should use event.which
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

var parseAttributes = function(el) {
  var namedNodeMap = el.attributes;  // .attributes returns an object with keys "0", "1", "2", ...
  var keys = Object.keys(el.attributes);
  var i;
  var string = "<ul style='list-style-type:none'><li class='popUpItem'>text: " + $(el).html() + "</li>";
  for (i = "0"; i < keys.length; i++) {
    string += "<li class='popUpItem'>" + namedNodeMap[keys[i]].name + ": " + namedNodeMap[keys[i]].value + "</li>";
  }
  return string + "</ul>";
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