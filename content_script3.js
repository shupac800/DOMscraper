"use strict";

console.clear();
console.log("running");
writeDOMNodeType();
mapTree();
//disableListeners();
//main();
//test();


function test() {
  
}

function disableListeners() {
  // clone all elements; listeners won't be recreated when clone tag is written
  // start with first thing after <body> tag
  //var b = document.querySelector("body").getElementsByTagName("*");
  var b = $("[dom_node_type='V']");
  for (var i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);  // can't commit suicide, but can commit infanticide
  }

  //$("*").unbind("click");
  console.log("finished");  // takes a long time on Google News

}


function main() {
  var q = document.getElementsByTagName("*");
  for (var i = 0; i < q.length; i++) {
    q[i].addEventListener("click",function(e) {
      e.preventDefault();  // redundant of stopPropagation?
      e.stopPropagation();

      // this tag,clist stuff is all going to go bye-bye
      var tag = e.target.tagName;
      var clist = e.target.classList;
      var index = $(e.target).index();
      var classStr = "";
      clist.forEach( (thisClass,idx) => {
        classStr += "." + thisClass;
      });
      //var z = `${tag}${classStr}:nth-child(${index + 1})`;
      //selectorAction(z, (el) => { $(el).addClass("highlighted"); } );
      $(e.target).addClass("highlighted"); // *******temp

      //popUp(e,z);
      //console.log("you clicked on dom_id",$(e.target).attr("dom_id"));
      //console.log("it is type",classifyNode(e.target));
      var originNode = getOriginNode(e.target);  // find origin node of this net
      writeOriginClass(originNode);  // augment all nodes in net with class "origin-xxx"
      var attrArray = getAllAttributesInNet(originNode);  // load attrArray with all attributes in this net
    });
  }
}

function writeDOMNodeType() {
  var i = 0;
  $("body").find("*:not(iframe)").each(function(x) {
    //console.log(this);
    classifyNode(this);
    if ( classifyNode(this) === "V" )  {
      $(this).attr("dom_node_type","V");  // write dom_node_type attribute
    } else {
      $(this).attr("dom_node_type","O");  // write dom_node_type attribute
    }
  });
  console.log("wrote DOM Node Type for everything");
}


function mapTree() {
  $("body").attr("dom_id","0");  // label top node of tree with dom_id "0"
  var todolist = [$("body")];
  while (todolist.length > 0) {  // while the todo list has something in it
    var el = todolist.shift();  // get first element in todo list
    var chlist = $(el).children();
    var parentID = $(el).attr("dom_id");
    for (var i = 0; i < chlist.length; i++) {  // loop through child elements of this element
      var newid = writeDOMid( $(chlist[i]), parentID, i );
      // var child_el = $("[dom_id='" + newid + "']");
      // if ( $(child_el).attr("dom_node_type") === "V" )  {
      //   $(child_el).html($(child_el).html() + "......" + newid);  // label V nodes in the DOM with their dom_ids
      // }
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


function selectorAction(selector,fn) {
  $(selector).each( function(idx,element) { fn(element); } );
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