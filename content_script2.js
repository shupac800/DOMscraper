"use strict";

console.clear();
console.log("Foo man T00L");
// how to disable all links/listeners??
// not easy without wrecking display of page!
// angular attributes control both graphics and page linking

// disable all buttons and links:

  // disable all other click listeners on this element
  var b = document.getElementsByTagName("*");
  var i;
  for (i = 0; i < b.length; i++) {
    var elClone = b[i].cloneNode(true);
    b[i].parentNode.replaceChild(elClone, b[i]);
    //b[i].style.backgroundColor = "yellow";
  }

$(document).ready(function(){
  $("a").css("cursor","arrow").click(false);
  // for jquery older than 1.4.3, use the below line
  // $("a").css("cursor","arrow").click(function(){
  //   return false;
  // });

  $(":input").prop("disabled",true);
  // for jquery older than 1.6, use the below line
  // $(":input").attr("disabled","disabled");
});



var todos = document.getElementsByTagName("*");
for (var i = 0; i < todos.length; i++) {
  var attributes = todos[i].attributes;
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
      todos[i].removeAttributeNode(attributes[j]);
    }
  }
}

/*var a = document.getElementsByTagName("a");
for (var i = 0; i < a.length; i++) {
  a[i].setAttribute("href","");
  a[i].setAttribute("onclick","");
  a[i].style.border = "2px solid #CDF"
}*/



/*  var b = document.getElementsByClassName("result-price");
  for (var i=0; i<b.length;i++) {

    b[i].addEventListener("mouseover",function(e){
      e.target.style.border = "2px solid blue";
    });
    b[i].addEventListener("mouseout",function(e){
      e.target.style.border = "none";
    });
    b[i].addEventListener("click",function(e){
      console.log(e.target.innerHTML);
    });
  }*/

var q = document.getElementsByTagName("*");
for (var i = 0; i < q.length; i++) {
  q[i].addEventListener("click",function(e){
    e.stopPropagation();
    //alert(e.target.innerHTML);
    var oldBgColor = e.target.style.backgroundColor;
    e.target.style.backgroundColor = "yellow";

    // console.log("parentNode name for this element",e.target.parentNode);
    // console.log("parentNodeX2 name for this element",e.target.parentNode.parentNode);
    console.log("tag name for this element:",e.target.tagName);
    console.log("class list for this element:",e.target.classList);
    //console.log("index for this element",$(this).index());
    //console.log("attributes list for this element:",e.target.attributes);

   // define the problem
   // need to select all elements that occupy same position in DOM
   // obviously, same tag
   // same class, if tag has class
   // same parent class
   // same nth child of parent (NO -- can't rely on that)
   // this is not a trivial task when the DOM structure is complicated!
   // maybe the thing to do is go through the whole DOM when you rewrite it
   // and when rewriting a tag, assign it a unique ID representing its DOM identity
   // e.g. 

    var tag = e.target.tagName;
    var clist = e.target.classList;
    var classStr = "";
    clist.forEach((thisClass,idx) => {
      classStr += "." + thisClass;
    })
    var z = `${tag}${classStr}`;
    //z = "a.result-ymmt-link.ng-binding";
    $(z).each((idx,m) => {
      $(m).css("background-color","#3CE");
    });
    e.target.addEventListener("mouseout",function(e) {
      $(z).each((idx,m) => {
        $(m).css("background-color",oldBgColor);
      });
    });
  });
}