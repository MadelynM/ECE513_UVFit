var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function sendReqForWeatherInfo() {

  console.log();
    $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/3d381662b0a6453183f4e99e6dd41ef2/32.2226,-110.9747',
        type: 'GET',
        data: { }, //, email: $("#email").text()
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
         var forecast=data.daily.data[1];
         console.log(forecast);
         var date=forecast.time;
      //   var dateChanged = date.split("-").join("/");
  //    var utcSeconds = 1234567890;
        var d = new Date(0); // The 0 there is the key, which sets the date to

         d.setUTCSeconds(date);
// // the first card:
//             var icon="";
//            icon="<img class=\"responsiveC-img\" src=" +forecast.day.condition.icon;
//            icon=icon+ ">";
//          $("#img1").html(icon);
          $("#des1").html("Summary: "+forecast.summary);
          $("#day1").html(days[d.getDay()]);
          $("#date1").html(d);
          $("#temp1").html("Temp: " +forecast.apparentTemperatureHigh+ "&#x2109;");
          $("#Humidity1").html( "Humidity: "+forecast.humidity*100+ "%");
          $("#wind1").html("Wind speed: "+forecast.windSpeed+" m/h");
          $("#uv1").html("UV index: "+forecast.uvIndex);
// // //////////////////
        var forecast=data.daily.data[2];
        console.log(forecast);
        var date=forecast.time;
//   var dateChanged = date.split("-").join("/");
//    var utcSeconds = 1234567890;
          var d = new Date(0); // The 0 there is the key, which sets the date to

          d.setUTCSeconds(date);
// // the first card:
//             var icon="";
//            icon="<img class=\"responsiveC-img\" src=" +forecast.day.condition.icon;
//            icon=icon+ ">";
//          $("#img1").html(icon);
           $("#des2").html("Summary: "+forecast.summary);
           $("#day2").html(days[d.getDay()]);
           $("#date2").html(d);
           $("#temp2").html("Temp: " +forecast.apparentTemperatureHigh+ "&#x2109;");
           $("#Humidity2").html( "Humidity: "+forecast.humidity*100+ "%");
           $("#wind2").html("Wind speed: "+forecast.windSpeed+" m/h");
           $("#uv2").html("UV index: "+forecast.uvIndex);

// //
            var forecast=data.daily.data[3];
          console.log(forecast);
            var date=forecast.time;
//   var dateChanged = date.split("-").join("/");
//    var utcSeconds = 1234567890;
            var d = new Date(0); // The 0 there is the key, which sets the date to

            d.setUTCSeconds(date);
// // the first card:
//             var icon="";
//            icon="<img class=\"responsiveC-img\" src=" +forecast.day.condition.icon;
//            icon=icon+ ">";
//          $("#img1").html(icon);
            $("#des3").html("Summary: "+forecast.summary);
            $("#day3").html(days[d.getDay()]);
            $("#date3").html(d);
            $("#temp3").html("Temp: " +forecast.apparentTemperatureHigh+ "&#x2109;");
            $("#Humidity3").html( "Humidity: "+forecast.humidity*100+ "%");
            $("#wind3").html("Wind speed: "+forecast.windSpeed+" m/h");
            $("#uv3").html("UV index: "+forecast.uvIndex);
//         ///////////////////////////////////

        },
        error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           //console.log(jqXHR);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });

}

// Handle authentication on page load
$(function() {
   // If there's no authToekn stored, redirect user to
   // the sign-in page (which is index.html)
   if (!window.localStorage.getItem("authToken")) {
      window.location.replace("index.html");
   }
   else {
        sendReqForWeatherInfo();
   }

});
