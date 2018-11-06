var map = null;

// Executes once the google map api is loaded, and then sets up the handler's and calls
// getRecentPotholes() to display the recent potholes
function initMap() {
   document.getElementById("main").style.display = "block";
    // Allow the user to refresh by clicking a button.
    var options={
      zoom:9,
      center: {lat: 32.2226, lng: -110.9747}
    }
    var map= new google.maps.Map(document.getElementById('map'),options);

    var marker = new google.maps.Marker({
              position:{lat: 32.2319, lng: -110.9501},
              map: map
            });

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
