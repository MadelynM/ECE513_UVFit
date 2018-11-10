var map = null;

function GetData(){

  $.ajax({
     url: '/getdata/data',
     type: 'GET',
     headers: { 'x-auth': window.localStorage.getItem("authToken") },
     responseType: 'json',
     success: requestSuccess,
     error: errorHandling
  });

}
function requestSuccess(data, textSatus, jqXHR) {

 if(data.snapshots.length==0 ){
   $('#serverMessag').append("<li class='collection-item'>" +
     data.message + "</li>");
 }
 else{
   for (var snapshot of data.snapshots) {
      $("#serverMessag").append("<li class='collection-item'>lat: " +
        snapshot.lat + ", long: " + snapshot.long + ", uvLevel: "+ snapshot.uvVal+"</li>")

        if (snapshot.long != 0 && snapshot.lat !=0){
          marker = new google.maps.Marker({
			        position: new google.maps.LatLng(snapshot.lat, snapshot.long),
			        map: map
		            });

              }
            }
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
$('#serverMessag').append("<li class='collection-item'>" +
  response.message + "</li>");
   }
}





// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initMap() {

  document.getElementById("main").style.display = "block";
   // Allow the user to refresh by clicking a button.
   var options={
     zoom:13,
     center: {lat: 32.2319, lng: -110.9501}
   }
 map= new google.maps.Map(document.getElementById('map'),options);


GetData();

  //  document.getElementById("refresh").addEventListener("click", getRecentPotholes);

}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
});
