console.log("Foo man chu");
var b = document.getElementById("mybutton");
b.innerHTML = "cock horse";
b.addEventListener("mouseover",function(e){
  e.target.style.border = "5px solid blue";
});
b.addEventListener("mouseout",function(e){
  e.target.style.border = "none";
});
b.addEventListener("click",function(e){
  console.log(e.target.innerHTML);
});