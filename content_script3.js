"use strict";

//$(document).ready(function(){  // what does document.ready() really do here?
  console.clear();
  console.log("running");
  mapTree();
  //labelOriginNodes();
  main();
  //test();

  function test() {
   //console.log ("text of 0.0.0", $("[dom_id='0.0.0'").text() );
   console.log ("contents of 0.0.0", $("[dom_id='0.0.0']").contents());
  }

  function labelOriginNodes() {
    var t = $("[dom_id]");
    var nodeArray = [];
    for (var i = 0; i < t.length; i++) {
      var thisDOMid = $(t[i]).attr("dom_id");
      console.log("saw node ",thisDOMid);
      console.log("node type integer is ",t[i].nodeType); // always 1
      console.log(t[i].innerHTML == "" ? "this is an O node" : "this is a V node");
      nodeArray.push($(t[i]).attr("dom_id"));
      // origin node has 2 tests:
      // 1.  it has only one O child
      // 2.  its parent has 2 or more O children
      // O node is defined as an invisible non-attribute node, generally, a tag

      // is this node an O node?
      // problem is, to determine if something is an O node,
      // we have to know both whether its parent is an O node
      // and whether its children are O nodes
      // circular!
      // have to define O node parametrically

      ////////////console.log("nodeArray",nodeArray);
      // work backwards from end of nodeArray

    }
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
      var z = `${tag}${classStr}:nth-child(${index + 1})`;

      selectorAction(z, (el) => { $(el).addClass("highlighted"); } );

      //popUp(e,z);
      console.log("you clicked on dom_id",$(e.target).attr("dom_id"));
      console.log("it is type ",classifyNode(e.target));
      // find origin node of this net
      // algorithm?

    });
  }
}

function mapTree() {
  $("body").attr("dom_id","0");  // label top node of tree with id "0"
  var todolist = [$("body")];
  while (todolist.length > 0) {  // while the todo list has something in it
    var w = todolist.shift();  // get first element in todo list
    //console.log("todolist length",todolist.length); // you can watch it grow, then shrink to 0 length
    var chlist = $(w).children();
    for (var i = 0; i < chlist.length; i++) {
      var newid = writeDOMid($(chlist[i]), $(w).attr("dom_id"), i);
/*      var xyz = $("[dom_id='" + newid + "']");
      if ($(xyz).text() !== "")  {
        $(xyz).html($(xyz).html() + "       " + newid);
      }*/
      // ^^^ problem:  containers test positive for innerHTML/text if they contain tags that have innerHTML/text
      // ...would prefer that container test negative if it has no innerHTML directly associated with container tag
      todolist.push(chlist[i]);  // add child to end of todo list
    }
  } 
}

/*
consider:
<div id="0.0">
  <p id="0.0.0"> UBBG </p>
</div>

innerHTML of id="0.0" is UBBG
innerHTML of id="0.0.0" is UBBG

if innerHTML of child = innerHTML of parent, then we know parent has no innerHTML of its own

<div id="0.0"> FMITA
  <p id="0.0.0"> UBBG </p>
</div>

innerHTML of 


*/

  function writeDOMid(node,parentID,index) {
    var newid = parentID + "." + index;
    $(node).attr('dom_id', newid);
    return newid;
  }

  function findOriginNodeForThingNet() {

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

  var nodeContents = $(node).contents();
  for (var i = 0; i < nodeContents.length; i++) {
    var thisNode = nodeContents[i];
    var thisNodeType = thisNode.nodeType;
    // is this a text node?
    if (thisNodeType === 3) {
      if (thisNode.nodeValue.replace(/(\r\n|\n|\r|\s|\t)/gm,"").length === 0) {
        // if text node is whitespace-only, move on to next node
        continue;
      } else {
        // this node has its own text, and is therefore a V node
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