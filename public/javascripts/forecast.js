var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function sendReqForWeatherInfo() {

  console.log();
    $.ajax({
        url: 'http://api.openweathermap.org/data/2.5/forecast?q=Tucson,us&APPID=c8672c5b456801221785b70e00fa460a&units=Imperial',
        type: 'GET',
        data: { }, //, email: $("#email").text()
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
          var city=data.city.name;
          var fiveDaysForecast1=data.list[5];
        //  var fiveDaysForecast2=data.list[5];
          //var fiveDaysForecast3=data.list[5];
           var utcSeconds = fiveDaysForecast1.dt;
          console.log(data);
          var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
             d.setUTCSeconds(utcSeconds);
                 // days[d.getDay()];
// the first card:
           var icon="";
           icon="<img class=\"responsive-img\" src= http://openweathermap.org/img/w/"
           icon=icon+ fiveDaysForecast1.weather[0].icon;
           icon=icon+ ".png >";

        $("#img1").html(icon);
        $("#des1").html(fiveDaysForecast1.weather[0].description);
        $("#day1").html(days[d.getDay()]);
        $("#date1").html(d);
        $("#temp1").html("Temp: " +fiveDaysForecast1.main.temp+ "&#x2109;");
        $("#Humidity1").html( "Humidity: "+fiveDaysForecast1.main.humidity+ "%");
        $("#wind1").html("wind: "+fiveDaysForecast1.wind.speed+"m/h");
//////////////////

        var fiveDaysForecast1=data.list[13];
//  var fiveDaysForecast2=data.list[5];
//var fiveDaysForecast3=data.list[5];
        var utcSeconds = fiveDaysForecast1.dt;

        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
        d.setUTCSeconds(utcSeconds);
       // days[d.getDay()];

// the first card:
        var icon="";
        icon="<img class=\"responsive-img\" src= http://openweathermap.org/img/w/"
        icon=icon+ fiveDaysForecast1.weather[0].icon;
        icon=icon+ ".png >";

        $("#img2").html(icon);
        $("#des2").html(fiveDaysForecast1.weather[0].description);
        $("#day2").html(days[d.getDay()]);
        $("#date2").html(d);
        $("#temp2").html("Temp: " +fiveDaysForecast1.main.temp+ "&#x2109;");
        $("#Humidity2").html( "Humidity: "+fiveDaysForecast1.main.humidity+ "%");
        $("#wind2").html("wind: "+fiveDaysForecast1.wind.speed+"m/h");
        ///////////////////////////////////

        var fiveDaysForecast1=data.list[21];
        //  var fiveDaysForecast2=data.list[5];
        //var fiveDaysForecast3=data.list[5];
         var utcSeconds = fiveDaysForecast1.dt;

        var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
           d.setUTCSeconds(utcSeconds);
               // days[d.getDay()];

        // the first card:
         var icon="";
         icon="<img class=\"responsive-img\" src= http://openweathermap.org/img/w/"
         icon=icon+ fiveDaysForecast1.weather[0].icon;
         icon=icon+ ".png >";

        $("#img3").html(icon);
        $("#des3").html(fiveDaysForecast1.weather[0].description);
        $("#day3").html(days[d.getDay()]);
          $("#date3").html(d);
            $("#temp3").html("Temp: " +fiveDaysForecast1.main.temp+ "&#x2109;");
              $("#Humidity3").html( "Humidity: "+fiveDaysForecast1.main.humidity+ "%");
                $("#wind3").html("wind: "+fiveDaysForecast1.wind.speed+"m/h");

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
