var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function sendReqForWeatherInfo() {

  console.log();
    $.ajax({
        url: 'https://api.apixu.com/v1/forecast.json?key=d4f6c721c04d47c6bd1221550182311&q=Tucson&days=10',
        type: 'GET',
        data: { }, //, email: $("#email").text()
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
          var forecast=data.forecast.forecastday[1];
         console.log(data);
         var date=forecast.date;
         var dateChanged = date.split("-").join("/");
          var d = new Date(dateChanged); // The 0 there is the key, which sets the date to the epoch

// // the first card:
            var icon="";
           icon="<img class=\"responsive-img\" src=" +forecast.day.condition.icon;
           icon=icon+ ">";
         $("#img1").html(icon);
         $("#des1").html(forecast.day.condition.text);
         $("#day1").html(days[d.getDay()]);
         $("#date1").html(forecast.date);
         $("#temp1").html("Temp: " +forecast.day.avgtemp_f+ "&#x2109;");
         $("#Humidity1").html( "Humidity: "+forecast.day.avghumidity+ "%");
         $("#wind1").html("wind: "+forecast.day.maxwind_mph+" m/h");
          $("#uv1").html("UV index: "+forecast.day.uv);
// //////////////////
         var forecast=data.forecast.forecastday[2];
         console.log(forecast);
         var date=forecast.date;
         var dateChanged = date.split("-").join("/");
          var d = new Date(dateChanged); // The 0 there is the key, which sets the date to the epoch

// // the first card:
            var icon="";
           icon="<img class=\"responsive-img\" src=" +forecast.day.condition.icon;
           icon=icon+ ">";
         $("#img2").html(icon);
         $("#des2").html(forecast.day.condition.text);
         $("#day2").html(days[d.getDay()]);
         $("#date2").html(forecast.date);
         $("#temp2").html("Temp: " +forecast.day.avgtemp_f+ "&#x2109;");
         $("#Humidity2").html( "Humidity: "+forecast.day.avghumidity+ "%");
         $("#wind2").html("wind: "+forecast.day.maxwind_mph+" m/h");
          $("#uv2").html("UV index: "+forecast.day.uv);
//         ///////////////////////////////////
//
var forecast=data.forecast.forecastday[3];
console.log(forecast);
var date=forecast.date;
var dateChanged = date.split("-").join("/");
 var d = new Date(dateChanged); // The 0 there is the key, which sets the date to the epoch

// // the first card:
   var icon="";
  icon="<img class=\"responsive-img\" src=" +forecast.day.condition.icon;
  icon=icon+ ">";
$("#img3").html(icon);
$("#des3").html(forecast.day.condition.text);
$("#day3").html(days[d.getDay()]);
$("#date3").html(forecast.date);
$("#temp3").html("Temp: " +forecast.day.avgtemp_f+ "&#x2109;");
$("#Humidity3").html( "Humidity: "+forecast.day.avghumidity+ "%");
$("#wind3").html("wind: "+forecast.day.maxwind_mph+" m/h");
 $("#uv3").html("UV index: "+forecast.day.uv);
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
