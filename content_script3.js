"use strict";

//$(document).ready(function(){  // what does document.ready() really do here?
  console.clear();
  console.log("running");
  //main();
  mapTree();

function main() {
  var r = $("body>*").children();
  console.log(r);
}

/* 
  // disable all buttons and links:
  $("a").css("cursor","arrow").click(false);  // maybe this belongs on all elements, not just A?
  $("img").css("cursor","arrow").click(false);  // successfully disables clicks on cars.com car images
  $(":input").prop("disabled",true);

  // disable all other click listeners
  var b = document.getElementsByTagName("body *");  // target all children of body
  console.log("cloning " + b.length + "elements, be patient...");
  var i;
  for (i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }*/


function oldmapTree() {
  // map the body tree
  var level = 0;
  var w = $("body").children(); // start with body itself
  //console.log("w.length",w.length);
  //console.log("w[0]",w[0]);
  $("body").attr("DOM_id","0");
  var keepGoing = true;
  while (keepGoing) {
    var nextLevelChildren = 0;
    var numChildNodes = w.length;
    for (var i = 0; i < numChildNodes; i++) {
      console.log("testing level " + level + " index " + i);
      var childchildren = $(w[i]).children().length;
      console.log("this node has " + childchildren + " child nodes");
      nextLevelChildren += childchildren;
    }
    if (nextLevelChildren === 0) {
      console.log("zero next level children");
      keepGoing = false;
    } else {
      console.log("leveling up");
      w = $("body" + ">".repeat(level) + "*").children();
      console.log("w is now","body"+">".repeat(level+1)+"*");
      level++;
    }
  }
}

// for each node
// name the node
// get the array of children
// for each child
   // name the node
   // get the array of children

/*n = node
writeDOMid(n)
w = n.children()

how do you crawl down the tree?
body has no parent node, so do it manually
put a in to do list
a has 2 children b and c
put 2 children b and c in to do list
a is done, move on to b
b has 1 child d
put d in to do list
b is done, move on to c
c has 1 child e
put e in to do list
c is done, move on to d

do to do list in numerical order
keep track of next slot in to do list*/

function mapTree() {
  console.log("hooohah");
  var todolist = [$("body")];
  var slot = 0;
  $("body").attr("DOM_id","0");
  var mm = 11; // do 10 iterations
  while (mm--) {  // while the todo list has something in it
    var w = todolist.shift();
    var pid = $(w).attr('DOM_id');
    console.log("working on w=",w);
    console.log("parent ID is",pid);
    var chlist = $(w).children();
    for (var i = 0; i < chlist.length; i++) {
      var newid = writeDOMid($(chlist[i]),pid,i);
      todolist.push(chlist[i]);
      console.log("todolist",todolist);
    }
  } 
}
  

  function writeDOMid(node,parentID,index) {
    var newid = parentID + "." + index;
    $(node).attr('DOM_id', newid);
    return newid;
  }

/*  // remove element attributes that take action upon click
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
    }*/
//});