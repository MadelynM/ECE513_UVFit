var map = null;
var markers = [];

function clearMarkers() {
  for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

function deg2rad(num) {
  return num*Math.PI/180.0;
}

function sphereDist(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}


function reduceActivity(activity) {
  // Number of calories burned in 1s per activity at given speed
  // Given values are meaningless nonsense
  var calPerOne = {
    walking: 0.031966,
    running: 0.031966,
    biking: 0.016942
  };

  var result = {
    duration: 0,
    burned: 0,
    uvTotal: 0,
    distance: 0
  };

  var activityType = activity.activityType;
  var startDate = new Date(activity.startDate);
  var endDate = new Date(activity.endDate);
  result.duration = (endDate.getTime() - startDate.getTime());

  if (!activityType) {
    activityType = "walking";
  }

  var lat0 = null;
  var lng0 = null;
  for (var key in activity.snapshots) {
    lat = activity.snapshots[key].latitude;
    lng = activity.snapshots[key].longitude;
    if(lat0 !== null && lng0 !== null) {
      result.distance += sphereDist(lat0, lng0, lat, lng);
    }
    lat0 = lat;
    lng0 = lng;
    result.burned += calPerOne[activityType]*activity.snapshots[key].speed;
    result.uvTotal += activity.snapshots[key].uvLevel;
  }

  return result;
}

function getMyWeeklySummary(){
  $.ajax({
     url: '/activities/retrieve/week',
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: myWeeklySummarySuccess,
     error: errorHandling
  });
}

function myWeeklySummarySuccess(data, textStatus, jqXHR) {
  var responseHTML = "";
  if (!data.activities) {
    responseHTML += "<p class='collection-item'>" + data.message + "</p>";
  }
  else {
    var activityDuration = 0;
    var caloriesBurned = 0;
    var uvTotal = 0;
    var distTotal = 0;
    for (var key in data.activities) {
      var curActivity = data.activities[key];
      result = reduceActivity(curActivity);
      activityDuration += result.duration;
      caloriesBurned += result.burned;
      uvTotal += result.uvTotal;
      distTotal += result.distance;
    }
    responseHTML += "<div class=\"col s12 m6\">";
    responseHTML += "<ul class='collection'>";
    responseHTML += "<li class='collection-item'>Activity Duration (s): " + Math.round(activityDuration/1000.0) + "</li>";
    responseHTML += "<li class='collection-item'>Calories Burned: " + (caloriesBurned) + "</li>";
    responseHTML += "<li class='collection-item'>Total UV Exposure: " + uvTotal + "</li>";
    responseHTML += "<li class='collection-item'>Total Distance: " + distTotal + "</li>";
    responseHTML += "</ul>";
    responseHTML += "</div>";
  }
  $("#mySummaryRes").html(responseHTML);
}

function getMyActivitySummary(){
  $.ajax({
     url: '/activities/retrieve/all',
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: myActivitySummarySuccess,
     error: errorHandling
  });
}

function myActivitySummarySuccess(data, textStatus, jqXHR) {
  var resHTML = "";
  if (!data.activities) {
    resHTML += "<p class='collection-item'>" + data.message + "</p>";
  }
  else {
    resHTML += "<div class=\"row\"><div class=\"col s12 m6\">";
    for (var key in data.activities) {
      var curActivity = data.activities[key];
      resHTML += "<ul class='collection'>";
      resHTML += "<li class='collection-item'>";
      resHTML += "<a href='#!' onclick=getOneActivity(";
      resHTML += curActivity.activityId + ")>Activity ID: ";
      resHTML += curActivity.activityId + "</a></li>";

      resHTML += "<li class='collection-item'>Activity started: ";
      resHTML += moment(curActivity.startDate).format('MMM Do YYYY, h:mm a') + "</li>";

      var defaultHTML = "";
      var actSel = {walking: "",
        running: "",
        biking: ""
      };
      switch(curActivity.activityType) {
        case "walking":
          actSel.walking = " selected"
          break;
        case "running":
          actSel.running = " selected";
          break;
        case "biking":
          actSel.biking = " selected";
          break;
        default:
          defaultHTML += "<option value='' disabled selected>Choose activity type</option>";
          break;
      }
      resHTML += "<li class='collection-item'>";
      resHTML += "<div class='input-field'><select>";
      resHTML += defaultHTML;
      resHTML += "<option value='{\"activityType\": \"walking\", \"activityId\": \"";
      resHTML += curActivity.activityId + "\"}'" + actSel.walking +">Walking</option>";
      resHTML += "<option value='{\"activityType\": \"running\", \"activityId\": \"";
      resHTML += curActivity.activityId + "\"}'" + actSel.running +">Running</option>";
      resHTML += "<option value='{\"activityType\": \"biking\", \"activityId\": \"";
      resHTML += curActivity.activityId + "\"}'" + actSel.biking +">Biking</option>";
      resHTML += "</select><label>Type of Activity</label>";
      resHTML += "</li>";
      result = reduceActivity(curActivity);
      resHTML += "<li class=\"collection-item\">Activity duration (s): " + Math.round(result.duration/1000.0) + "</li>";
      resHTML += "<li class=\"collection-item\">Calories burned: " + Math.round(result.burned) + "</li>";
      resHTML += "<li class=\"collection-item\">UV Exposure: " + Math.round(result.uvTotal) + "</li>";
      resHTML += "</ul>";
    }
    resHTML += "</div></div>";
  }
  $("#myActivitiesRes").html(resHTML);
  $('select').material_select();
  $('select').on('change', function() {
    updateActivityType($(this).val());
  });
}

function getNearWeeklySummary(){
  $.ajax({
     url: '/activities/summary/near',
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: nearWeeklySummarySuccess,
     error: errorHandling
  });
}

function nearWeeklySummarySuccess(data, textStatus, jqXHR) {
  var responseHTML = "";
  if (!data.success) {
    responseHTML += "<p class='collection-item'>" + data.message + "</p>";
  }
  else {
    responseHTML += "<div class='col s12 m6'><ul class='collection'>";
    responseHTML += "<li class='collection-item'>Number of activities: " + data.message.numAct + "</li>";
    responseHTML += "<li class='collection-item'>Average total distance: " + data.message.avgDist + "</li>";
    responseHTML += "<li class='collection-item'>Average total calories burned: " + data.message.avgBurned + "</li>";
    responseHTML += "<li class='collection-item'>Average UV exposure: " + data.message.avgUvTotal + "</li>";
    responseHTML += "</ul></div>";
  }
  $("#nearSummaryRes").html(responseHTML);
}

function getAllWeeklySummary(){
  $.ajax({
     url: '/activities/summary/all',
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: allWeeklySummarySuccess,
     error: errorHandling
  });
}

function allWeeklySummarySuccess(data, textStatus, jqXHR) {
  var responseHTML = "";
  if (!data.success) {
    responseHTML += "<p class='collection-item'>" + data.message + "</p>";
  }
  else {
    responseHTML += "<div class='col s12 m6'><ul class='collection'>";
    responseHTML += "<li class='collection-item'>Number of activities: " + data.message.numAct + "</li>";
    responseHTML += "<li class='collection-item'>Average total distance: " + data.message.avgDist + "</li>";
    responseHTML += "<li class='collection-item'>Average total calories burned: " + data.message.avgBurned + "</li>";
    responseHTML += "<li class='collection-item'>Average UV exposure: " + data.message.avgUvTotal + "</li>";
    responseHTML += "</ul></div>";
  }
  $("#allSummaryRes").html(responseHTML);
}

function updateActivityType(jsonData){
  console.log(jsonData);
  $.ajax({
     url: '/activities/update/type',
     type: 'PUT',
     headers: { 'x-auth': window.localStorage.getItem("authToken"),
        'Content-Type': 'application/json'
     },
     data: jsonData,
     responseType: 'json',
     success: updateActivityTypeSuccess,
     error: errorHandling
  });
}

function updateActivityTypeSuccess(){
//    var resHTML = "Successfully updated the thing";
//    $("#responseMsg").html(resHTML);
}

function getOneActivity(actid){
  $.ajax({
     url: '/activities/retrieve/' + actid,
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: activitySuccess,
     error: errorHandling
  });
}

function activitySuccess(data, textStatus, jqXHR) {
  var lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 5,
      scale:4 ,
      strokeColor:'red',
      fillColor:'red'
  };

  $("#oneActivity").css("display", "block");

  if(data.activities[0].snapshots.length==0 ){
   $('#serverRes').html("<p class='collection-item'>" +
     data.message + "</p>");
  }
  else{
    var dataStr= "<ul>" ;
    clearMarkers();
    if(data.activities[0].startLoc) {
      map.setCenter({lat:data.activities[0].startLoc.coordinates[1],
        lng:data.activities[0].startLoc.coordinates[0]});
    }
    for (var snapshot of data.activities[0].snapshots) {
//      dataStr = dataStr + "<ul>" + "<li class='collection-item'>lat: " +
//      snapshot.latitude + ", long: " + snapshot.longitude + ", uvLevel: "+ snapshot.uvLevel+", speed: " + snapshot.speed + "</li>";

      if (snapshot.longitude != 0 && snapshot.latitude !=0){
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(snapshot.latitude, snapshot.longitude),
          map: map, icon:lineSymbol
        });
        markers.push(marker);
      }
    }
//    dataStr = dataStr + "</ul>"

//    $("#serverRes").html(dataStr);
  }
}

function errorHandling(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken
  // redirect user to sign-in page (which is index.html)
  if( jqXHR.status === 401 ) {
    console.log("Invalid auth token");
    window.localStorage.removeItem("authToken");
    window.location.replace("index.html");
  }
  else {
    var response = JSON.parse(jqXHR.responseText);
    resHTML = response.message;
    $('#errorMsg').html(resHTML);
  }
}


// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initMap() {
  var lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 5,
    scale:4 ,
    strokeColor:'red',
    fillColor:'red'
  };

  var options={
    zoom:13,
    center: {lat: 32.2319, lng: -110.9501}
  };
  map = new google.maps.Map(document.getElementById('map'),options);

  //GetData();


  //  document.getElementById("refresh").addEventListener("click", getRecentPotholes);
}

// Handle authentication on page load
$(function() {
  // If there's no authToekn stored, redirect user to
  // the sign-in page (which is index.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("index.html");
  }
  else {
    getMyWeeklySummary();
    getMyActivitySummary();
    getNearWeeklySummary();
    getAllWeeklySummary();
  }
});
