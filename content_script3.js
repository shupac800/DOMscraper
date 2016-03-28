"use strict";

console.clear();
console.log("running");
writeDOMNodeType();
mapTree();
disableListeners();
activateListeners();
augmentCSS();  // do we need this?
popControlWin();
//main();
//test();


function test() {
  
}

function disableListeners() {

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
         (attributes[j].name === "ng-click") ||  // better just remove ng- everything?
         (attributes[j].name === "ng-href") ||
         (attributes[j].name === "onmousedown" ))
      {
        q[i].removeAttributeNode(attributes[j]);
      }
    }
  }

  // clone all elements; listeners won't be recreated when clone tag is written
  // start with first thing after <body> tag
  //var b = document.querySelector("body").getElementsByTagName("*");  // slow!
  var b = $("[dom_node_type='V']");  // just visible elements
  for (var i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }

  // disable all buttons and links
  $("a").css("cursor","arrow").click(false);  // maybe this belongs on all elements, not just A?
  $("img").css("cursor","arrow").click(false);  // successfully disables clicks on cars.com car images
  $(":input").prop("disabled",true);

  //$("*").unbind("click");

  console.log("finished disableListeners");
}


function activateListeners() {
  //var q = document.getElementsByTagName("*");  // attach click listener to all elements
  var q = $("body *");
  //var q = $("[dom_node_type='V'");  // attach click listener to all visible elements (misses some on cars.com)
  for (var i = 0; i < q.length; i++) {
    $(q[i]).on("click",actionOnClick);
  }
  console.log("finished activateListeners");
}


function actionOnClick(e) {
  e.preventDefault();  // redundant of stopPropagation?
  e.stopPropagation();  // don't bubble event

  var tag = e.target.tagName;
  var clist = e.target.classList;
  var index = $(e.target).index();
  var classStr = "";
  clist.forEach( (thisClass,idx) => {
    classStr += "." + thisClass;
  });
  var z = `${tag}${classStr}:nth-child(${index + 1})`;
  var clicked_dom_id = $(e.target).attr("dom_id");
  var cdi_origin_id = $(getOriginNode(e.target)).attr("dom_id");
  var cdi_fields = clicked_dom_id.split("_");

  // can you just change z to select dom_id's that match a certain pattern?

  // put all z-cursor items in array
  var cursor = [];
  var mismatch_count = new Array(cdi_fields.length).fill(0); // initialize array with zeroes; note ES6 only
  $(z).each(function() {
    cursor.push( { nodeHTML: this,
                   dom_id: $(this).attr("dom_id") } );
  });
  // filter out any dom_id's of different length than dom_id of clicked-on element
  cursor = cursor.filter(function(c) {
    return c.dom_id.split("_").length === cdi_fields.length;
  });
  // filter out any dom_id's that differ from clicked-on element by more than 1 field
  cursor = cursor.filter(function(c) {
    var c_fields = c.dom_id.split("_");
    var matches = 0;
    for (var k = 0; k < c_fields.length; k++) {
      if (c_fields[k] === cdi_fields[k]) {
        matches++;
      }
    }
    return matches >= cdi_fields.length - 1;
  });
  cursor.forEach(function(c,i) {
    //identify the field where the mismatch with the clicked dom_id occurs
    var cArray = c.dom_id.split("_");
    for(var j = 0; j < cdi_fields.length; j++) {
      if (cArray[j] !== cdi_fields[j]) {
        mismatch_count[j]++;
      }
    }
    c.origin_id = $(getOriginNode(c.nodeHTML)).attr("dom_id");
  });
  cursor.forEach(function(thing,i) {
    console.log(i + ": " + thing.dom_id +  "   " + thing.origin_id);
  });
  console.log("mismatch_count",mismatch_count);
  // identify which field has the highest mismatch count
  var highest_mismatch_count = 0;
  var highest_mismatch_count_field = 0;
  for (var j = 0; j < cdi_fields.length; j++) {
    if (mismatch_count[j] > highest_mismatch_count) {
      highest_mismatch_count = mismatch_count[j];
      highest_mismatch_count_field = j;
    }
  }
  console.log("highest mismatch count is in field", highest_mismatch_count_field);
  // use highest_mismatch_count_field to create match string for cursor
  var matchString = "0";
  for (var j = 1; j < cdi_fields.length; j++) {
    if (j === highest_mismatch_count_field) {
      matchString += "_.+";  // regex: + means match one or more of the preceding character
    } else {
      matchString += "_" + cdi_fields[j];
    }
  }
  console.log("match string is", matchString);

  // toss any items in cursor that don't have a dom_id that matches matchString
  cursor = cursor.filter(function(c) {
    console.log(c.dom_id.match(matchString));
    // if ( !c.dom_id.match(matchString) ) {
    //   console.log("filtering out ",c.dom_id);
    // }
    return c.dom_id.match(matchString);  // evaluates to truthy or falsy
  });
  return;

  selectorAction(z, (el) => { $(el).addClass("highlighted");
                                             console.log($(el).attr("dom_id"));
                                              } );

  //console.log("you clicked on dom_id",$(e.target).attr("dom_id"));
  //console.log("it is type",classifyNode(e.target));

  writeOriginAttrForNet(getOriginNode(e.target));  // augment all nodes in this net with attr "origin-node"

  popUp(e,z);

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
      //$(chlist[i]).attr("origin-node",getOriginNode(chlist[i]));  // SLOW and totally not working!!
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


function writeOriginAttrForNet(originNode) {
  var originID = $(originNode).attr("dom_id");
  $(originNode).attr("origin-node",originID);
  $(originNode).find("*").each(function(x) {
    $(this).attr("origin-node",originID);
  });
}


function buildPopUpMenu(clickedEl) {
  var attrArray = getAllAttributesInNet(getOriginNode(clickedEl));
  // filter out attributes we don't care about so they won't show in pop-up menu
  attrArray = attrArray.filter( (thisAttr) => {
    return ( thisAttr.attr !== "class" &&
             thisAttr.attr !== "id" &&
             thisAttr.attr !== "dom_id" &&
             thisAttr.attr !== "dom_node_type" &&
             thisAttr.attr !== "origin-node" &&
             thisAttr.attr !== "rel" );   // or it starts with ng-
  });
  var menuString = "<ul style='list-style-type:none'><li class='popUpItem'>text: " + $(clickedEl).text() + "</li>";
  for (var i = 0; i < attrArray.length; i++) {
    menuString += "<li class='popUpItem'>" + attrArray[i].attr + ": " + attrArray[i].value + "</li>";
  }
  return menuString + "</ul>";
}


function getAllAttributesInNet(originNode) {
  var originID = $(originNode).attr("dom_id");
  var nodesInNet = $("[origin-node='" + originID + "']");
  var attrArray = [];
  $(nodesInNet).each(function(x) {
    var namedNodeMap = this.attributes; // NNM is an object
    Object.keys(namedNodeMap).forEach(function(i, key) {
      attrArray.push( {attr: namedNodeMap[key].name, value: namedNodeMap[key].value} );
    });
  });
  return attrArray;  // attrArray is array of {attr:value} objects
}


function getOriginNode(nodeUnderTest) {
  var nodeID = $(nodeUnderTest).attr("dom_id");
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
  $("body").append("<div id='popUp'></div>");
  $("#popUp").offset( {top:e.pageY, left:e.pageX} );
  console.log("sending buildPopUpMenu", e.target);
  var menuHTML = buildPopUpMenu(e.target);
  $("#popUp").html(menuHTML);

  // add listener to close #popUp if mouse moves out of it
  $("#popUp").on("mouseleave", () => { killPopUp(e); });

  // add listener to each attribute displayed
  $("#popUp li").each( (idx,item) => {
    $(item).on( "click", function() { actionOnMenuItemClick(e,z,idx) } );
  });
}

function actionOnMenuItemClick(e,z,idx) {
  var scrapeValues = [];
  var nodeMapKey = idx - 1;

  return;
  // from here, things get dicey
  // because of z selector
  // we run into missing values problem
  // that is, we get an error if an element in the cursor doesn't have the attribute/menuitem 
  // that was selected from the popup menuu
 
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

/*  // output scrapeValues array to global arrays
  console.log("outputting array",scrapeValues);
  arrays.push(scrapeValues);  // "arrays" becomes array of arrays
  fields.push("Key_" + arrays.length);
  console.log("fields:",fields);
  console.log("arrays:",arrays);*/

  console.log("scrapeValues array",scrapeValues);

  return false;  // critical!
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


function augmentCSS() {
  // this allows our CSS definitions to be used on the web page we're scraping
  $("head").append('<style type="text/css"> #popUp {border: 2px solid black; background-color: #F90; } #popUp ul {margin: 0; padding: 0; } .popUpItem {margin: 0; padding: 0 0 0 5px; } .popUpItem:hover {background-color: blue; color: white; } .highlighted {background-color: #3CE; } #popCtrlWin {border: 2px solid black; background-color: #FFEBDE; width: 120px; }</style>');
}