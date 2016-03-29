"use strict";

$(function() {
  $.ajax({
    url: "https://domscraper.firebaseio.com/cheatKey.json",
    method: "GET"
  })
  .done(function(response) {
    console.log("Got ",response.fbKey);
    $("#fbKey").text(response.fbKey);
    $.ajax({
      url: "https://domscraper.firebaseio.com/datasets/" + response.fbKey + ".json",
      method: "GET"
    })
    .done(function(obj) {
      console.log("Got ",obj);
      // start dissecting obj.data
      var numThings = obj.data[0].values.length;
      console.log("numThings",numThings);

      var str = "<table><tr><td>key</td>";
      var thingKeys = Object.keys(obj.data);
      // header row
      obj.data.forEach( (thisObj,i) => {
        str += "<td>" + thisObj.keyname + "</td>";
      });
      str += "</tr>";
      // data rows, one per "thing"
      for (var i = 0; i < numThings; i++){
        str += "<td>" + i + "</td>";
        for (var j = 0; j < obj.data.length ; j++) {
          str += "<td>" + obj.data[j].values[i] + "</td>";
        }
        str += "</tr>";
      }
      str += "</table>";
      document.getElementById("stuffGoesHere").innerHTML = str;
    });
  });
});