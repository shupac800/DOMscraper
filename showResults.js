  // $.ajax({
  //   url: "https://domscraper.firebaseio.com/data/" + fbKey + ".json",
  //   method: "GET"
  // }).done(function(obj) {
    var obj = {"data" : {
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
              };
    var things = Object.keys(obj.data);
    var str = "";
    things.forEach( (thing,i) => {
      console.log(obj.data[thing]);
      var thingKeys = Object.keys(obj.data[thing]);
      thingKeys.forEach( (thisKey,j) => {
        console.log("thisKey",thisKey);
        console.log("obj.data[thing][thisKey]",obj.data[thing][thisKey]);
        str += thisKey + ": " + thing[thisKey] + "...";
      });
      str += "<br>";
    });
    document.getElementById("stuffGoesHere").innerHTML = str;
  // });