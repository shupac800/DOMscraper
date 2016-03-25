"use strict";

$.ajax({
  url: "https://domscraper.firebaseio.com/cheatKey.json",
  method: "GET"
}).done(function(response) {
  console.log("Got ",response.fbKey);
  $("#fbKey").text(response.fbKey);
  $.ajax({
    url: "https://domscraper.firebaseio.com/datasets/" + response.fbKey + ".json",
    method: "GET"
  }).done(function(obj) {
    console.log("Got ",obj);

  /*    var obj = {"data" : {
                          "Thing_1" :
                                       {"Key_1" : "USA",
                                        "Key_2" : "Idaho",
                                        "Key_3" : "Coeur D'Alene"},
                          "Thing_2" : 
                                       {"Key_1" : "Canada",
                                        "Key_2" : "Quebec",
                                        "Key_3" : "Ottawa"},
                          "Thing_3" :
                                       {"Key_1" : "Mexico",
                                        "Key_2" : "Baja California",
                                        "Key_3" : "Cabo San Lucas"} 
                          }
                };*/

    // header row
    var things = Object.keys(obj.data);
    var str = "";
    var thingKeys = Object.keys(obj.data[things[0]]);
    //console.log("thingKeys",thingKeys);
    str += "<table><tr><td></td>"
    thingKeys.forEach( (thisKey,i) => {
      str += "<td>" + thisKey + "</td>";
    });
    str += "</tr>";
    // data rows
    things.forEach( (thing,i) => {
      //console.log(obj.data[thing]);
      var thingKeys = Object.keys(obj.data[thing]);
      str += "<td>" + thing;
      thingKeys.forEach( (thisKey,j) => {
        //console.log("thisKey",thisKey);
        //console.log("obj.data[thing][thisKey]",obj.data[thing][thisKey]);
        str += "<td>" + obj.data[thing][thisKey] + "</td>";
      });
      str += "</tr>";
    });
    str += "</table>"
    document.getElementById("stuffGoesHere").innerHTML = str;
  });

});