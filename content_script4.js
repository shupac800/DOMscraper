"use strict";

// globals
var scrape =  { source: null,
                time:   null };

console.clear();
console.log("running");
writeDOMNodeType();
mapTree();
disableListeners();
activateListeners();
//augmentCSS();  // do we need this?
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

function loadCursor(e,z) {  // put all items selected by z into array "cursor"
  var cursor = [];
  var clicked_dom_id = $(e.target).attr("dom_id");  // clicked_dom_id = "cdi"
  var cdi_origin_id = $(getOriginNode(e.target)).attr("dom_id");
  var cdi_fields = clicked_dom_id.split("_");
  var mismatch_count = new Array(cdi_fields.length).fill(0); // initialize array with zeroes; note ES6 only

  $(z).each(function() {
    var nodeHTML = this;
    var dom_id = $(this).attr("dom_id");
    var origin_node = getOriginNode(this);
    var origin_id = $(origin_node).attr("dom_id");
    cursor.push( { nodeHTML: nodeHTML,
                   dom_id: dom_id,
                   origin_node: origin_node,
                   origin_id: origin_id } );
  });

  // filter out any dom_id's of different length than dom_id of clicked-on element
  console.log("cursor contents",cursor);
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
    c.origin_id = $(getOriginNode(c.nodeHTML)).attr("dom_id");
  });
  cursor.forEach(function(thing,i) {
    console.log(i + ": " + thing.dom_id +  "   " + thing.origin_id);
  });
  console.log("mismatch_count",mismatch_count);
  // identify which field has the highest mismatch count
  var highest_mismatch_count = 0, highest_mismatch_count_field = 0;
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
    return c.dom_id.match(matchString);  // evaluates to null (falsy) if no match
  });

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
      if ( $(chlist[i]).attr("dom_node_type") === "V") {  // takes too long -- not for production version
        $("body").append("<div class='dpop' id='pop-" + newid + "' style='display: inline-block; position: absolute; padding: 6px; background: #eee; color: #000; border: 2px solid #1a1a1a; font-size: 90%; border-radius: 15px'>" + newid + "</div>");
        $("#pop-" + newid).hide();
      }
      todolist.push(chlist[i]);  // add this child element to end of todo list
    }
  }
  console.log("finished mapTree");
}


// from http://creativeindividual.co.uk/2011/02/create-a-pop-up-div-in-jquery/
/*$(function() {
  $("[dom_node_type='V']").hover(function(e) {
    var s = $(e.target).attr("dom_id");
    $("#pop-" + s).show("fast")
      .css('top', e.pageY + 10)
      .css('left', e.pageX + 10)
      .appendTo('body');
  }, function(e) {
    var s = $(e.target).attr("dom_id");
    $("#pop-" + s).hide();
  });
});*/


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


function buildPopUpMenu(clickedEl) {
  var attrArray = getAllAttributesInNet(getOriginNode(clickedEl));
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
    Object.keys(namedNodeMap).forEach(function(key) {
      attrArray.push( { attr:     namedNodeMap[key].name,
                        value:    namedNodeMap[key].value } );
    });
  });
  // filter out attributes we don't care about so they won't clutter up the pop-up menu
  attrArray = attrArray.filter( (thisAttr) => {
    return ( thisAttr.attr !== "class" &&
             thisAttr.attr !== "id" &&
             thisAttr.attr !== "dom_id" &&
             thisAttr.attr !== "dom_node_type" &&
             thisAttr.attr !== "origin-node" &&
             thisAttr.attr !== "rel" &&
             thisAttr.attr !== "style" &&
             thisAttr.attr.slice(0,3) !== "ng-");
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

function popUp(e,cursor) {
  $("body").append("<div id='popUpMenu'></div>");
  $("popUpMenu").hide();
  $("#popUpMenu").offset( {top:e.pageY, left:e.pageX} );
  console.log("sending buildPopUpMenu", e.target);
  writeOriginAttrForNet(getOriginNode(e.target));  // augment all nodes in this net with attr "origin-node"; needed for buildPopUpMenu
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

function actionOnMenuItemClick(e,cursor,idx) {
  // get next highlight color
  var colorArr = ["yellow",
                  "coral",
                  "greenyellow",
                  "aqua",
                  "pink",
                  "gold",
                  "darkorange",
                  "chocolate"];
  var numKeys = $("#numKeysSelected").text().split(" ")[0]  // number of keys scraped so far
  var colorIndex = numKeys % colorArr.length;

  // populate scrape.originID for each item in cursor
  for (var i = 0; i < cursor.length; i++) {
    console.log("cursor-sub-"+i,cursor[i]);
    if (idx === 0) {
      var keyname = "text";
      var value = $(cursor[i].nodeHTML).text();
    } else {
      console.log("working on it...");
      // have to pick attribute out of attrArray for cursor item
      if (!$(cursor[i].origin_node).attr("origin-node")) {
        writeOriginAttrForNet(origin_node);    
      }
      console.log("getting attrArray for origin node = ",cursor[i].origin_id);
      var attrArray = getAllAttributesInNet(cursor[i].origin_node);
      var value = attrArray[idx - 1].value;
      var keyname = attrArray[idx - 1].attr;
    }
    if (!(cursor[i].origin_id in scrape)) {
      scrape[cursor[i].origin_id] =  [];
    }
    // add data object to array scrape[origin_id]
    scrape[cursor[i].origin_id].push( { keyname: keyname,
                                        color: colorArr[colorIndex],
                                        value: value } );
  }
  console.log("scrape",scrape);

  // update popCtrlWin contents
  // ******** UPGRADE: have user enter a key name for this set of values **********
  $("#popCtrlWin")
    .append(`<div class='tagWrapper'><div class='colorBlock' style='background-color:${colorArr[colorIndex]}'></div><p>${keyname}</p></div>`);
  numKeys++;
  $("#numKeysSelected").text(numKeys + " keys selected");

  killPopUp();
  return false;  // critical!
}


function uploadScrape() {
  //var things =convertScrape();  // organize scraped data into "things"
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


function convertScrape() {
  // each "thing" has a unique origin_id
  var things = {};
  // things has a bunch of keys
  // the name of each key is an origin_id
  // each key is an array of objects
  console.log("scrape",scrape);
  for (var i = 0; i < scrape.data.length; i++) {
    for (var j = 0; j < scrape.data[i].values.length; j++) {
      var origin_id = scrape.data[i].values[j].origin_id;
      if (!(origin_id in things)) {  // does this key already exist in things? if not...
        things[origin_id] = [];  // initialize new key
      }
      var newObj = {};
      newObj[`"${scrape.data[i].keyname}"`] = `${scrape.data[i].values[j].value}`;
      things[origin_id].push(newObj);
    }
  }
  // make sure all bottom-level objects have same keys
  // fill with value = null where appropriate
        // collect data types from each key of each thing
  var dataTypesAll = []; // initialize
  var oids = Object.keys(things);  // each key is an origin_id
  oids.forEach(function(thisOid,i) {
    things[thisOid].forEach(function(thisObj,j) {
      Object.keys(thisObj).forEach(function(thisKey,k) {
        // remove double quotes and add to array
        dataTypesAll.push(thisKey.replace(/"/gm,""));
      })
    });
  });
  var dataTypes = $.unique(dataTypesAll);  // remove duplicate data types
  console.log("dataTypes found:",dataTypes);
  /*oids.forEach(function(thisOid,i) {
    dataTypes.forEach(function(thisType) {
      things[thisOid].forEach(function(thisObj,j) {
        console.log("thisObj",thisObj);
        var foundDataType = false;
        Object.keys(thisObj).forEach(function(thisKey,k) {
          // remove double quotes and add to array
          //dataTypesAll.push(thisKey.replace(/"/gm,""));
          console.log("thisKey",thisKey);
          if (thisKey.replace(/"/gm,"") === thisType) {
            foundDataType = true;
          }
        });
        if (!foundDataType) {
          // add missing key with null data
          var newObj = {};
          newObj[thisType] = "";
          things[thisOid].push(newObj);
        }
      });
    });
  });*/

  oids.forEach(function(thisOid) {
    console.log(Object.keys(things[thisOid]));  // ["0","1"] and ["0"]
    var objects = [];
    Object.keys(things[thisOid]).forEach(function(thisKey) {
      objects.push(Object.keys(things[thisOid][thisKey])[0].replace(/"/gm,""));
    });
    console.log("objectKeysforthisKey",objects);
    var typesNotInKey = dataTypes.filter(function(thisType) {
      var inKey = false;
      objects.forEach(function(thisKey) {
        console.log("comparing" + thisKey + " to " + thisType);
        if (thisKey == thisType) {
          inKey = true;
        }
        console.log("result = ",inKey);
      });
      return false;
    });
    console.log("missing",typesNotInKey);
  });
  return things;
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


function augmentCSS() {
  // this allows our CSS definitions to be used on the web page we're scraping
  $("head").append('<style type="text/css"> #popUp {border: 2px solid black; background-color: #F90; } #popUp ul {margin: 0; padding: 0; } .popUpItem {margin: 0; padding: 0 0 0 5px; } .popUpItem:hover {background-color: blue; color: white; } .highlighted {background-color: #3CE; } #popCtrlWin {border: 2px solid black; background-color: #FFEBDE; width: 120px; }</style>');
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