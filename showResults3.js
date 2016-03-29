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

      var numThings = Object.keys(obj.things).length;

      // collect data types from each key of each thing
      var dataTypes = []; // initialize
      var oids = Object.keys(obj.things);  // each key is an origin_id
      console.log("oids",oids);
      oids.forEach(function(thisOid,i) {
         console.log("oid "+ i,thisOid);
         console.log("thisOid length",obj.things[thisOid].length);
        obj.things[thisOid].forEach(function(thisObj,j) {
          console.log("obj "+j,thisObj);
          //console.log("key " + thisKey + " has " + "keys:",Object.keys(obj.things[thisOid][thisKey]));
         });
           //dataTypes.push(Object.keys(thisKey));
      });
      console.log("dataTypes found:",dataTypes);
      // remove duplicates

      var str = "<h2>scraped from " + obj.source + "at time " + obj.time + "</h2>";
      str += "<table><tr><td class='thingnum'>thing</td>";

      // header row
      obj.data.forEach( (thisObj,i) => {
        str += "<td class='columnHeader'>" + thisObj.keyname + "</td>";
      });
      str += "</tr>";

      var keys = Object.keys(obj.things);  // each key is an origin_id
      // data rows
      keys.forEach(function(thisKey,i) {
        str += "<tr>";
        str += "<td class='thingnum'>" + i + "</td>";
        obj.things[thisKey].forEach(function(dataObj,j) {
           
        });
      });
        for (var j = 0; j < obj.data.length ; j++) {
          str += `<td class='key${j}'>${obj.data[j].values[i]}</td>`;
        }
        str += "</tr>";
      
      str += "</table>";
      $("#stuffGoesHere").html(str);

      // add key color to columns
      for (var j = 0; j < obj.data.length; j++) {
        console.log("color", obj.data[j].color);
        $(".key" + j).css("background-color",obj.data[j].color);
      }

      // apply styling to leftmost "key" column
      $(".thingnum").css("background-color","#CCC").css("width","25px");
      $(".columnHeader").css("background-color","#CCC");
    });
  });
});