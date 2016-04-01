"use strict";

// globals
var keyname = [];
var key0fields = [];
var mask = [];

console.clear();
console.log("running");
disableListeners();
writeDOMNodeType();
mapTree();
writeOriginAttributeForAllNodes();
convertAttributesToNodes();
activateListeners();
popControlWin();
//test();


function test() {
  var array1 = [97,98,99,100,101,102,103,104];
  var array2 = ["a" , "b","c","d","f","g","h"];
  for (var a = 0; a < array1.length; a++) {
    if (array2[a].charCodeAt(0) != array1[a]) {
      array2.splice(a,0,"#");
    }
    console.log("array 1 is " + array1[a] + ", array 2 is " + array2[a]);
    
  }
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
  var b = $("[dom_node_type='V']");  // just visible elements
  for (var i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }

  //remove class ng-binding? other ng-classes?

//maybe change anchor into some other kind of tag?
// that will screw up css tied to anchor

// problem with cars. com is you still have an anchor tag with an href link

  // disable all buttons and links
  $("a").css("cursor","arrow").click(false);  // maybe this belongs on all elements, not just A?
  $("img").css("cursor","arrow").click(false);  // successfully disables clicks on cars.com car images
  $(":input").prop("disabled",true);

  console.log("finished disableListeners");
}


function activateListeners() {
  var q = $("body *:not(attr)");
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

  var z = `${tag}${classStr}:not(.scrapeignore):nth-child(${index + 1})`;

  var cursor = loadCursor(e,z);

  // now you can loop through the node list in the cursor and do whatever you like
  cursor.forEach(function(c) {
    $(c.nodeHTML).addClass("highlighted");
  });

  popUp(e,cursor);

  // The return value of an event handler determines whether or not
  // the default browser behavior should take place as well.
  return false;  // may be belt and suspenders to preventDefault() and stopPropagation()
}
/*
function loadCursorWithANodes(e,z) {
  var cursor = [];

  when you click on a menu item
  that item represents one attribute 
  we need to fill the cursor with corresponding attributes for all other source nodes
  which means we need the list of source nodes
  then for each of them, we need to get whatever list of attributes the popupmenu would show if you clicked on them
  and we need to jam into the cursor the attribute value corresponding to the one you picked from the menu

  wouldn't it be easier if you could select all other sources' attributes by doing a DOM select
  just like you do for the sources themselves?
  catch:  those attributes must already exist as discrete nodes.

  for every visible element
  for that origin node,
  convert all attributes in net to discrete A nodes


       var A_nodes = $(`attr[origin-node='${oid}']`);
      console.log("name",$(A_nodes[menuIndex - 1]).attr("attrname"));
      console.log("value",$(A_nodes[menuIndex - 1]).text());
      console.log("dom_id",$(A_nodes[menuIndex- 1]).attr("dom_id")); 
}
*/
function loadCursor(e,z) {  // put all items selected by z into array "cursor"
  var cursor = [];
  var clicked_dom_id = $(e.target).attr("dom_id");  // clicked_dom_id = "cdi"
  var cdi_origin_id = $(getOriginNode(e.target)).attr("dom_id");
  var cdi_fields = clicked_dom_id.split("_");
  var mismatch_count = new Array(cdi_fields.length).fill(0); // initialize array with zeroes; note ES6 only

// have to be able to load cursor either for text
// or for attribute


  $(z).each(function(i) {
    var nodeHTML = this;
    var dom_node_type = $(this).attr("dom_node_type");
    var name = this.tagName.toLowerCase();
    var dom_id = $(this).attr("dom_id");
    var origin_node = getOriginNode(this);
    var origin_id = $(origin_node).attr("dom_id");
    cursor.push( { name: name,
                   dom_node_type: dom_node_type,
                   nodeHTML: nodeHTML,
                   dom_id: dom_id,
                   origin_node: origin_node,
                   origin_id: origin_id } );
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

  cursor.forEach(function(c) {
    //identify the field where the mismatch with the clicked dom_id occurs
    var cArray = c.dom_id.split("_");
    for(var j = 0; j < cdi_fields.length; j++) {
      if (cArray[j] !== cdi_fields[j]) {
        mismatch_count[j]++;
      }
    }
    c.origin_id = $(getOriginNode(c.nodeHTML)).attr("dom_id"); // ***** but c has origin_id in it, no?
  });

  // identify which field has the highest mismatch count
  var highest_mismatch_count = 0, highest_mismatch_count_field = 0;
  for (var j = 0; j < cdi_fields.length; j++) {
    if (mismatch_count[j] > highest_mismatch_count) {
      highest_mismatch_count = mismatch_count[j];
      highest_mismatch_count_field = j;
    }
  }

  // use highest_mismatch_count_field to create match string for cursor
  var matchString = "0";
  for (var j = 1; j < cdi_fields.length; j++) {
    if (j === highest_mismatch_count_field) {
      matchString += "_.+";  // regex: + means match one or more of the preceding character
    } else {
      matchString += "_" + cdi_fields[j];
    }
  }

  // toss any items in cursor that don't have a dom_id that matches matchString
  cursor = cursor.filter(function(c) {
    return c.dom_id.match(matchString);  // evaluates to null (falsy) if no match
  });

  // if this is not the first key
  if (keyname.length > 0) {  // first dom_id of first key (key0) is basis for mask construction
    // construct a mask that is diff btw idx=0 in keyN and idx=0 in key0
    var keyNfields = cursor[0].dom_id.split("_");
    var key0fields = keyname[0].dom_id[0].split("_");
    // mask is constructed by looping through longer dom_id, then is applied to shorter dom_id
    var padLength = Math.abs(key0fields.length - keyNfields.length);
    if (key0fields.length > keyNfields.length) {
      keyNfields = keyNfields.concat(new Array(padLength).fill("0"));
    }
    if (key0fields.length < keyNfields.length) {
      key0fields = key0fields.concat(new Array(padLength).fill("0"));
    }
    // now that we have 2 arrays of same length, construct mask that is array of differences in digits
    for (var j = 0; j < keyNfields.length; j++) {
      mask[j] = parseInt(keyNfields[j]) - parseInt(key0fields[j]);
    }
    console.log("key0 index0",key0fields);
    console.log("key1 index0",keyNfields);
    console.log("MASK: ",mask," length ",mask.length);
  }

  console.log("cursor: ",cursor);
  return cursor;
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
      var newid = writeDOMid( chlist[i], parentID, i );
      // if ( $(chlist[i]).attr("dom_node_type") === "V") {  // takes too long -- not for production version
      //   $("body").append("<div class='dpop' id='pop-" + newid + "' style='display: inline-block; position: absolute; padding: 6px; background: #eee; color: #000; border: 2px solid #1a1a1a; font-size: 90%; border-radius: 15px'>" + newid + "</div>");
      //   $("#pop-" + newid).hide();
      // }
      todolist.push(chlist[i]);  // add this child element to end of todo list
    }
  }
  console.log("finished mapTree");
}

function writeOriginAttributeForAllNodes() {
  $("body").find("*:not(iframe)").each(function(thisNode) {  // writing to iframe tags causes errors
    var originNode = getOriginNode(thisNode);  // sure to take forever
    $(thisNode).attr("origin-node",originNode);
  });
}

function makeArrayOfOriginNodes() {
  var originNodeArr = [];
  $("body[dom_node_type='V']").each(function(i,el) {
    originNodeArr.push($(el).attr("origin-node"));
  });
  return $.unique(originNodeArr);
}

function convertAttributesToNodes() {
  makeArrayOfOriginNodes().forEach(function(thisOriginNode) {
    makeAllAttributesInNetIntoNodes(thisOriginNode);
  });
}


function writeDOMid(node,parentID,index) {
  var newid = parentID + "_" + index;
  $(node).attr("dom_id", newid);
  return newid;
}


function writeOriginAttrForNet(originNode) {
  var originID = $(originNode).attr("dom_id");  // need this?
  $(originNode).attr("origin-node",originID);
  $(originNode).find("*").each(function(x) {
    $(this).attr("origin-node",originID);
  });
}


function makeAllAttributesInNetIntoNodes(originNode) {
  var originID = $(originNode).attr("dom_id");
  var nodesInNet = $("[origin-node='" + originID + "']");
  var numAttrInNet = 1;
  $(nodesInNet).each(function(i,thisNode) {
    var namedNodeMap = this.attributes;  // NNM is an object
    Object.keys(namedNodeMap).forEach(function(key) {
      var attr_name = namedNodeMap[key].name;
      if ( attr_name !== "class" &&  // skip attributes we don't care about
           attr_name !== "id" &&
           attr_name !== "dom_id" &&
           attr_name !== "dom_node_type" &&
           attr_name !== "origin-node" &&
           attr_name !== "rel" &&
           attr_name !== "style" &&
           attr_name !== "attrname" &&
           attr_name.slice(0,3) !== "ng-") {
        var attr_dom_id = originID + "_-" + numAttrInNet++;
        // make this attribute into an A-node in the DOM
        $(originNode).append(`<attr dom_node_type='A' dom_id='${attr_dom_id}' origin-node='${originID}' attrname='${attr_name}'>${namedNodeMap[key].value}</attr>`);
      }
    });
  });
}


function buildPopUpMenu(clickedEl) {
  // get all type-A nodes in this net (i.e. with same origin as clickedEl)
  var A_nodes = $(`attr[origin-node='${$(getOriginNode(clickedEl)).attr("dom_id")}']`);  // any advantage to sorting them?
  console.log("A-nodes:",A_nodes);
  // first item in menu is always "text"
  var menuString = "<ul style='list-style-type:none'><li class='popUpItem'>text:  " + $(clickedEl).text() + "</li>";
  // other items in menu are the A-nodes in this net
  for (var i = 0; i < A_nodes.length; i++) {
    menuString += `<li class='popUpItem'>${$(A_nodes[i]).attr("attrname")}:  ${$(A_nodes[i]).text()}</li>`;
  }
  return menuString + "</ul>";
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


function popUp(e,cursor) {
  $("body").append("<div id='popUpMenu'></div>");
  $("popUpMenu").hide();
  $("#popUpMenu").offset( {top:e.pageY, left:e.pageX} );
  var originNode = getOriginNode(e.target);

  if (!$(originNode).attr("origin-node")) {  // have "origin-node" attributes been written for this net?
    writeOriginAttrForNet(originNode);  // augment all nodes in this net with attr "origin-node"; needed for buildPopUpMenu
    makeAllAttributesInNetIntoNodes(originNode);  // make important attributes into discrete nodes of type "A"
  }

  var menuHTML = buildPopUpMenu(e.target);
  $("#popUpMenu").html(menuHTML);
  $("#popUpMenu").show("fast");

  // add listener to close #popUp if mouse moves out of it
  $("#popUpMenu").on("mouseleave", () => { killPopUp(e); });

  // add listener to each attribute displayed
  $("#popUpMenu li").each( (idx,item) => {
    $(item).on( "click", function() { actionOnMenuItemClick(e,cursor,idx) } );
  });
}

function actionOnMenuItemClick(e,cursor,menuIndex) {
  console.log("menuIndex",menuIndex);
  //console.log("xxxx cursor",cursor);
  // get next highlight color
  var colorArr = ["yellow",
                  "coral",
                  "greenyellow",
                  "aqua",
                  "pink",
                  "gold",
                  "darkorange",
                  "chocolate"];
  var keynum = keyname.length;
  var colorIndex = keynum % colorArr.length;

  // keyname is an array of keynames
  // if we've selected 4 keys for upload,
  // we'll have  keyname[0] through keyname[3]
  // keyname[0] = {name: "href", values = [ "http://1.2.3.1",
  //                                         ...
  //                                        "http://1.2.3.100" ]}

  // initilize new entry in keyname array
  keyname[keynum] = { name: null, values: [], dom_id: [] };

  if (menuIndex === 0) {  // clicked on the first item in the pop-up menu, which is always "text"
    // transfer data from "cursor" to "keyname"
    for (var i = 0; i < cursor.length; i++) {
      console.log("writing to keynum: dom_id",cursor[i].dom_id);
      keyname[keynum].name = cursor[i].name;
      keyname[keynum].values.push($(cursor[i].nodeHTML).text());
      keyname[keynum].dom_id.push(cursor[i].dom_id);
    }
    console.log("keyname["+keynum+"].dom_id["+(keyname[keynum].dom_id.length - 1)+"]",keyname[keynum].dom_id[(keyname[keynum].dom_id.length - 1)]);
    $(".highlighted").removeClass("highlighted").css("background-color",colorArr[colorIndex]);
  } else {         // clicked on item other than first one, meaning, an attribute
    //transfer data directly from DOM to "keyname"
      var o = getOriginNode(e.target);
      var oid = $(o).attr("dom_id");
      var A_nodes = $(`attr[origin-node='${oid}']`);
      console.log("name",$(A_nodes[menuIndex - 1]).attr("attrname"));
      console.log("value",$(A_nodes[menuIndex - 1]).text());
      console.log("dom_id",$(A_nodes[menuIndex- 1]).attr("dom_id"));

      keyname[keynum].name = $(A_nodes[menuIndex - 1]).attr("attrname");
      keyname[keynum].values.push($(A_nodes[menuIndex - 1]).text());
      //keyname[keynum].dom_id.push() ?????

      // keyname[keynum].name = cursor[i].name;
      // keyname[keynum].values.push($(cursor[i].nodeHTML).text());
      // keyname[keynum].dom_id = cursor[i].dom_id;
  }

  // parse cursor for instances where dom_id !== expected_dom_id
  // in those instances, insert a blank object into the cursor array
  for (var a = 1; a < keyname.length; a++) {
    //console.log("dom id array for key no. "+a+" is ",keyname[a].dom_id);
        //console.log("at index 1, keyname[1].dom_id is",keyname[a].dom_id[1]); // ok here

    for (var b = 0; b < keyname[0].dom_id.length; b++) {
        //console.log("at index 1, keyname[1].dom_id is",keyname[a].dom_id[1]); // ok here
      // use mask to construct, from key0 dom_id at index a, expected value for keyN dom_id at index a

      var key0fields = keyname[0].dom_id[b].split("_");
      //console.log("key0fields",key0fields,"mask",mask);
      var keyNfields = keyname[a].dom_id[b].split("_");
      //pad shorter array with zeroes so it has same length as longer array
      var padLength = Math.abs(key0fields.length - keyNfields.length);
      if (key0fields.length > keyNfields.length) {
        keyNfields = keyNfields.concat(new Array(padLength).fill("0"));
      }
      if (key0fields.length < keyNfields.length) {
        key0fields = key0fields.concat(new Array(padLength).fill("0"));
      }

      var expected_dom_id_fields = [];
        console.log("key0fields",key0fields);
        console.log("maskfields",mask);
      for (var k = 0; k < mask.length; k++) {
        expected_dom_id_fields.push(parseInt(key0fields[k]) + parseInt(mask[k]) + "");  // each entry is string
      }
      console.log("expected:",expected_dom_id_fields);
      console.log("saw:     ",keyNfields);
      //console.log("dom id index "+b+" for key no. "+a+" is ",keyname[a].dom_id[b]);
      //console.log("after padding: expected_dom_id is ",expected_dom_id_fields,", this dom id is",keyNfields);
      if (!arraysEqual(keyNfields,expected_dom_id_fields)) {
        console.log("missing value at index ",b);
        //insert null value into values array
        keyname[a].values.splice(b,0,"N/A");  // value not available
        keyname[a].dom_id.splice(b,0,"-1");   // dummy value; necessary to keep dom_id array parallel to values array
      }
    }
    console.log("after null padding:",keyname);
  }

  // update popCtrlWin contents
  // ******** UPGRADE: have user enter a key name for this set of values **********
  $("#popCtrlWin").append(`<div class='tagWrapper'><div class='colorBlock' style='background-color:${colorArr[colorIndex]}'></div><p>${keyname[keynum].name}</p></div>`);
  $("#keynumSelected").text(keynum++ + " keys selected");

  killPopUp();
  return false;  // critical!
}

// from http://stackoverflow.com/questions/4025893/how-to-check-identical-array-in-most-efficient-way
function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length) {
      return false;
    }
    for (var i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
}


function uploadScrape() {
  console.log("keyname",keyname);
  //roundOutScrape();  // make sure all things in scrape have same set of keys, with values or not
  //console.log("things",things);
  return; // *********** TESTING

  var postObj = { source: window.location.href,
                  time: Math.floor(Date.now() / 1000),  // convert JS time to UNIX time
                  things: things };
  console.log("uploading:",postObj);

  // post JSON object to Firebase under new key
  $.ajax({
    url: "https://domscraper.firebaseio.com/datasets/.json",
    method: "POST",
    data: JSON.stringify(postObj)
  }).done(function(objReceivedFromFB) {  // AJAX returns object {name: newkeyname}
    console.log("posted new key",objReceivedFromFB.name);
    // spawn a new tab or window that displays, in tabular format, the data you just collected
    // re-initialize globals
    spawnWindow(objReceivedFromFB.name);
    $("#numKeysSelected").text("0 keys selected");  // reset key counter
    // also post a function that can be used as the basis for a pseudo-API
  });
}


function roundOutScrape() {
  // make sure all bottom-level objects have same keys
  // fill with value = "" where appropriate

  // collect data types from each key of each thing
  var things = Object.keys(scrape);  // each key in scrape is a "thing" with unique origin_id
  var dataTypesAll = []; // initialize
  things.forEach(function(thisThing) {  // "thisThing" is array of objects
    var nativeDataTypesForThisThing = [];
    scrape[thisThing].forEach(function(thisObj) {
      nativeDataTypesForThisThing.push(thisObj.keyname);
    });
    scrape[thisThing].nativeDataTypes = nativeDataTypesForThisThing;
    dataTypesAll = dataTypesAll.concat(nativeDataTypesForThisThing);
  });

  var dataTypes = $.unique(dataTypesAll);  // remove duplicate data types

  things.forEach(function(thisThing) {  // "thisThing" is array of objects
    var missingDataTypes = dataTypesAll.filter(function(thisType) {
      var thisDataTypeIsNativeToThisThing = false;
      scrape[thisThing].nativeDataTypes.forEach(function(t) {
        if (t === thisType) {
          thisDataTypeIsNativeToThisThing = true;
        }
      });
      return thisDataTypeIsNativeToThisThing === false;
    });
    missingDataTypes.forEach(function(thisMissingType) {
      scrape[thisThing].push( { keyname: thisMissingType,
                                color:   "",
                                value:   ""} );
    });
  });
  console.log("scrape",scrape);
}


function popControlWin() {
  $("body").append("<div id='popCtrlWin'><p class='scrapeignore'>DOMscraper</p><p class='scrapeignore' id='numKeysSelected'>0 keys selected</p><button id='button-upload'>Upload</button><button id='button-clear'>Clear</button></div>");
  $("#button-upload").on("click",uploadScrape);
  $("#popCtrlWin").draggable();
}


function killPopUp(popOrigin) {
  $("#popUpMenu").remove();
  $(".highlighted").removeClass("highlighted");
}


function spawnWindow(firebaseKey) {
  $.ajax({
    url: "https://domscraper.firebaseio.com/cheatKey.json",
    method: "PATCH",
    data: JSON.stringify( {fbKey: firebaseKey} )
  }).done(function(response) {
    console.log("PUT ",response);
  });
  window.open("http://localhost:8080/showResults.html").focus();
}