"use strict";

//globals
var fff;

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
      var dataTypesAll = []; // initialize
      var oids = Object.keys(obj.things);  // each key is an origin_id
      oids.forEach(function(thisOid,i) {
        obj.things[thisOid].forEach(function(thisObj,j) {
          Object.keys(thisObj).forEach(function(thisKey,k) {
            // remove double quotes and add to array
            dataTypesAll.push(thisKey.replace(/"/gm,""));
          })
        });
      });
      var dataTypes = $.unique(dataTypesAll);  // remove duplicate data types
      console.log("dataTypes found:",dataTypes);

      var str = "<h2>scraped from " + obj.source + "at time " + obj.time + "</h2>";
      str += "<table><tr><td class='thingnum'>thing</td>";

      // header row
      var colHdr = [];
      dataTypes.forEach( (thisType,i) => {
        str += "<td class='columnHeader'>" + thisType + "</td>";
        colHdr[i] = thisType;
      });
      str += "</tr>";

      // data rows
      oids.forEach(function(thisOid,i) {
        str += "<tr>";
        str += "<td class='thingnum'>" + i + "</td>";
        for (var k = 0; k < obj.things.length; k++){
          console.log("checking obj",obj.things[k]);
          for (var m = 0; m < dataTypes.length; m++ ) {
            console.log("    checking dataType",dataTypes[m]);
            var keys = Object.keys(obj.things[k]);
            for (var n = 0; n < keys.length; n++) {
              console.log("          checking key ",keys[n]);
              console.log("comparing " + keys[n] + " to " + dataTypes[m]);
              if (keys[n].replace(/"/gm,"") === dataTypes[m]) {
                str += "<td>" + obj.things[k][keys[n]] + "</td>";
                console.log("wrote <td>" + obj.things[k][keys[n]] + "</td>");
                n = keys.length;
                m = dataTypes.length;
                k++; // i.e. go on to next dataType
              } else {
                str += "<td></td>";
                console.log("wrote blank cell");
              }
            }
          }
        };
      });
      console.log("str",str);
      
      str += "</table>";
      $("#stuffGoesHere").html(str);

/*      // add key color to columns
      for (var j = 0; j < obj.data.length; j++) {
        console.log("color", obj.data[j].color);
        $(".key" + j).css("background-color",obj.data[j].color);
      }*/

      // apply styling to leftmost "key" column
      $(".thingnum").css("background-color","#CCC").css("width","25px");
      $(".columnHeader").css("background-color","#CCC");
    });
  });
});