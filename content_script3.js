"use strict";

console.clear();
console.log("running");
writeDOMNodeType();
mapTree();
disableListeners();
activateListeners();
//main();
//test();


function test() {
  
}

function disableListeners() {
  // disable all buttons and links
  $("a").css("cursor","arrow").click(false);  // maybe this belongs on all elements, not just A?
  $("img").css("cursor","arrow").click(false);  // successfully disables clicks on cars.com car images
  $(":input").prop("disabled",true);
/*
  // clone all elements; listeners won't be recreated when clone tag is written
  // start with first thing after <body> tag
  var b = document.querySelector("body").getElementsByTagName("*");
  //var b = $("[dom_node_type='V']");  // just visible elements?
  for (var i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }*/

  //$("*").unbind("click");

  console.log("finished disableListeners");

}


function activateListeners() {
  //var q = document.getElementsByTagName("*");
  var q = $("[dom_node_type='V'");  // attach click listener to all visible elements
  for (var i = 0; i < q.length; i++) {
    $(q[i]).on("click",actionOnClick);
  }
  console.log("finished activateListeners");
}


function actionOnClick(e) {
  e.preventDefault();  // redundant of stopPropagation?
  e.stopPropagation();  // don't bubble event

  // this tag,clist stuff is all going to go bye-bye
  var tag = e.target.tagName;
  var clist = e.target.classList;
  var index = $(e.target).index();
  var classStr = "";
  clist.forEach( (thisClass,idx) => {
    classStr += "." + thisClass;
  });
  var z = `${tag}${classStr}:nth-child(${index + 1})`;
  selectorAction(z, (el) => { $(el).addClass("highlighted"); } );
  $(e.target).addClass("highlighted"); // *******temp

  popUp(e,z);
  console.log("you clicked on dom_id",$(e.target).attr("dom_id"));
  console.log("it is type",classifyNode(e.target));

  var originNode = getOriginNode(e.target);  // find origin node of this net
  writeOriginClass(originNode);  // augment all nodes in net with class "origin-xxx"
  var attrArray = getAllAttributesInNet(originNode);  // load attrArray with all attributes in this net

  // The return value of an event handler determines whether or not
  // the default browser behavior should take place as well.
  return false;  // may be belt and suspenders to preventDefault() and stopPropagation()
}


function writeDOMNodeType() {
  $("body").find("*:not(iframe)").each(function(x) {  // writing to iframe tags causes errors
    classifyNode(this);
    if ( classifyNode(this) === "V" )  {
      $(this).attr("dom_node_type","V");  // write dom_node_type attribute
    } else {
      $(this).attr("dom_node_type","O");  // write dom_node_type attribute
    }
  });
  console.log("finished writeDOMNodeType");
}


function mapTree() {
  $("body").attr("dom_id","0");  // label top node of tree with dom_id "0"
  var todolist = [$("body")];  // initialize todo list with node at top of tree
  while (todolist.length > 0) {  // while the todo list has something in it
    var el = todolist.shift();  // get first element in todo list
    var chlist = $(el).children();  // chlist contains immediate children of el
    var parentID = $(el).attr("dom_id");
    for (var i = 0; i < chlist.length; i++) {  // loop through immediate children of this element
      var newid = writeDOMid( $(chlist[i]), parentID, i );
      if ( $(chlist[i]).attr("dom_node_type") === "V") {
        $(chlist[i]).html($(chlist[i]).html() + "......" + newid);  // label V nodes in the DOM with their dom_ids
      }
      todolist.push(chlist[i]);  // add this child element to end of todo list
    }
  }
  console.log("finished mapTree");
}


function writeDOMid(node,parentID,index) {
  var newid = parentID + "_" + index;
  $(node).attr('dom_id', newid);
  return newid;
}


function writeOriginClass(originNode) {
  var originID = $(originNode).attr("dom_id");
  // label origin node and all descendants with class
  $(originNode).addClass("origin-" + originID);
  $(originNode).find("*").each(function(x) {
    $(this).addClass("origin-" + originID);
  });
}


function getAllNodesInNet(originID) {
  return $(".origin-" + originID);
}


function getAllAttributesInNet(originNode) {
  var originID = $(originNode).attr("dom_id");
  var nodesInNet = getAllNodesInNet(originID);
  //console.log("nodesInNet",nodesInNet);
  var attrArray = [];
  $(nodesInNet).each(function(x) {
    var namedNodeMap = this.attributes; // NNM is an object
    console.log("NNM",namedNodeMap);
    Object.keys(namedNodeMap).forEach(function(i, key) {
      //console.log("found attribute",namedNodeMap[key].name + "=" + namedNodeMap[key].value);
      attrArray.push( {attr: namedNodeMap[key].name, value: namedNodeMap[key].value} );
    });
  });
  console.log("returning attrArray",attrArray);
  return attrArray;  // attrArray is array of {attrName:attrValue} objects
}


function getOriginNode(nodeUnderTest) {
  console.clear();

  var nodeID = $(nodeUnderTest).attr("dom_id");
  console.log("getting origin node for",nodeID);
  var plist = $(nodeUnderTest).parents().filter(function(thisParent) {
    // does thisParent have attribute dom_node_type?
    var attr = $(this).attr("dom_id");
    return (typeof attr !== typeof undefined);  // filter out parent nodes outside the body tree:  html, document
  });
  var ghi = [];
  for (var i = 0; i < plist.length; i++) {
    ghi.push(plist[i]);  // transform HTML collection of parents into array of parents
  }
  ghi.unshift(nodeUnderTest);  // add the node under test to the beginning of the test array
  // test each node in array ghi to see if it is the origin node
  // origin node is first that has parent with 2 or more V-paths (Multiple V Paths)
  var mvp = ghi.filter(function(ghi_el) {
    //console.log("ghi_el.parent() is",$(ghi_el).parent());
    var jkl = $(ghi_el).parent().find("[dom_node_type='V']");
    //console.log("jkl array is",jkl);
    //console.log("V-paths: ",jkl.length);
    return jkl.length > 1;  // include this node if it has 2 or more V-paths
  });
  return mvp[0];  // first entry in mvp array will be the origin node
}


function classifyNode(node) {
  // determine whether a nodeType=1 node (element) is type O or V

  // get contents of every node of nodeType = 1 and loop through each item
  // if one item is text (nodeType = 3) and nodeValue of that text is not whitespace-only,
  // that item's text "belongs to" that node
  // if node has no text items where nodeValue of that text is not whitespace-only,
  // that node is type O

  var subnodes = $(node).contents();
  for (var i = 0; i < subnodes.length; i++) {
    var thisSubnode = subnodes[i];
    // is this subnode a text node?
    if (thisSubnode.nodeType === 3) {
      // whitespace-only?
      if (thisSubnode.nodeValue.replace(/(\r\n|\n|\r|\s|\t)/gm,"").length === 0) {
        // this text subnode is whitespace-only; move on to next node
        continue;
      } else {
        // node has its own text, and is therefore a V node
        return "V";
      }
    }
  }  // end for
  // if we've searched through all nodes in node.contents
  // and found zero text nodes that were non-whitespace-only
  // then this node has no text of its own
  // and is therefore an O node
  return "O";
}

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
  //$("#popCtrlWin").draggable();
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