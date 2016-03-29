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

      var numThings = obj.data[0].values.length;

      var str = "<h2>scraped from " + obj.source + "at time " + obj.time + "</h2>";
      str += "<table><tr><td>key</td>";

      // header row
      obj.data.forEach( (thisObj,i) => {
        str += "<td>" + thisObj.keyname + "</td>";
      });
      str += "</tr>";

      // data rows, one per "thing"
      for (var i = 0; i < numThings; i++){
        str += "<tr>";
        str += "<td>" + i + "</td>";
        for (var j = 0; j < obj.data.length ; j++) {
          str += `<td class='key${j}'>${obj.data[j].values[i]}</td>`;
        }
        str += "</tr>";
      }
      str += "</table>";
      $("#stuffGoesHere").html(str);

      // add key color to columns
      for (var j = 0; j < obj.data.length; j++) {
        console.log("color", obj.data[j].color);
        $(".key" + j).css("background-color",obj.data[j].color);
      }
    });
  });
});