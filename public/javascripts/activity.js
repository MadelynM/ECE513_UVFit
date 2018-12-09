var map = null;
var markers = [];

function clearMarkers() {
  for (var i = 0; i < markers.length; i++ ) {
    markers[i].setMap(null);
  }
  markers.length = 0;
}

function reduceActivity(activity) {
  // Number of calories burned in 1s per activity at given speed
  // Given values are meaningless nonsense
  var calPerOne = {
    walking: 5,
    running: 10,
    swimming: 12
  };

  var result = {
    duration: 0,
    burned: 0,
    uvTotal: 0
  };

  var activityType = activity.activityType;
  var startDate = new Date(activity.startDate);
  var endDate = new Date(activity.endDate);
  result.duration = (endDate.getTime() - startDate.getTime());

  if (!activityType) {
    activityType = "walking";
  }

  for (var key in activity.snapshots) {
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
    for (var key in data.activities) {
      var curActivity = data.activities[key];
      result = reduceActivity(curActivity);
      activityDuration += result.duration;
      caloriesBurned += result.burned;
      uvTotal += result.uvTotal;
    }
    responseHTML += "<div class=\"col s12 m6\">";
    responseHTML += "<ul>";
    responseHTML += "<li>Activity Duration (s): " + Math.round(activityDuration/1000.0) + "</li>";
    responseHTML += "<li>Calories Burned: " + Math.round(caloriesBurned) + "</li>";
    responseHTML += "<li>Total UV Exposure: " + uvTotal + "</li>";
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
    resHTML += "<div class=\"row\"><div class=\"col s12 m4\">";
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
    var resHTML = "Successfully updated the thing";
    $("#responseMsg").html(resHTML);
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
    $('#errorMsg').resHTML(response.message);
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
  }
});
