"use strict";

console.clear();
console.log("running");
mapTree();
main();
//test();


function test() {
  
}


function main() {
  var q = document.getElementsByTagName("*");
  for (var i = 0; i < q.length; i++) {
    q[i].addEventListener("click",function(e) {
      e.preventDefault();  // redundant of stopPropagation?
      e.stopPropagation();

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
      console.log("you clicked on dom_id",$(e.target).attr("dom_id"));
      console.log("it is type",classifyNode(e.target));
      // find origin node of this net
      var originNode = getOriginNode(e.target);
      console.log("origin node is", $(originNode).attr("dom_id"));
      writeOriginClass(originNode);
      getAllAttributesInNet(originNode);
    });
  }
}


function mapTree() {
  $("body").attr("dom_id","0");  // label top node of tree with dom_id "0"
  var todolist = [$("body")];
  while (todolist.length > 0) {  // while the todo list has something in it
    var el = todolist.shift();  // get first element in todo list
    var chlist = $(el).children();
    for (var i = 0; i < chlist.length; i++) {  // loop through child elements of this element
      var newid = writeDOMid( $(chlist[i]), $(el).attr("dom_id"), i );
      var child_el = $("[dom_id='" + newid + "']");
      if ( classifyNode(child_el) === "V" )  {
        $(child_el).html($(child_el).html() + "......" + newid);    // label V nodes in the DOM with their dom_ids
        $(child_el).attr("dom_node_type","V");
      } else {
        $(child_el).attr("dom_node_type","O");
      }

      todolist.push(child_el);  // add child element to end of todo list
    }
  } 
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
    return jkl.length > 1;
  })
  return mvp[0];  // last entry in mvp array will be the candidate highest in the tree
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