//MajorProject Sarthak
$(document).one("pagecreate",function(){
    
    //Label global variable used for the charts
    var labels = new Array();
    //Global variable for charts stores min temperature forecast
    var data1 = new Array();
    //Global variable for charts stores max temperature forecast
    var data2 = new Array();
    //Global variable for chartes stores temperature forecast
    var data3 = new Array();

//localStorageCities stores list of cities user has searched for in local-storage
var localStorageCities = new Array();

//Get user location once the website is launched
getUserLocation();

//Image array stores the images for appropriate weather condition
var imgs = ["imgs/superhot.gif",
            "imgs/hot.gif", 
            "imgs/cold.gif",
            "imgs/supercold.gif",
            "imgs/earth.gif"];


var Coordinates = function(lat, lon) {
    this.latitude = lat;
    this.longitude = lon;
}

//new Coordinates object
var coord = new Coordinates(0, 0);

//function to the user's geolocation 
function getUserLocation() {
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(showPosition, showErr);
    }
    else 
    {
        //This line isn't working do fix it
        $("#localWeather").append("Gelocation is not supported by this browser");
        console.log("geolocation not supported")
    }
}//end of getUserLocation function

//Pass geolocation to the methods that need them
function showPosition(position) {
    coord.latitude = position.coords.latitude;
    coord.longitude = position.coords.longitude;
    callWeatherAPI();
    callForecastAPI();
    callForecastAPI2();
}

function makeURL(lat, lon) {
    var appid = '63a4a9aa94eafded1a87dd7216c409b1';
    return  "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + appid;
}

function makeChartURL(lat,lon) {
    var appid = '63a4a9aa94eafded1a87dd7216c409b1';
    return "http://api.openweathermap.org/data/2.5/forecast?lat=" +lat + "&lon=" + lon + "&units=metric&appid=" + appid;
}


function getLocalWeather(data){
    var s = $("#localWeather");
    s.empty();
  var kelvinTemp = data.main.temp;
  var celciusTemp = kelvinTemp - 273.15;
  var tempArray = [30, 20, 0];
  //Change back ground image depending on the weather conditions
  if (celciusTemp >= tempArray[0]) 
  {
	  $('#localWeather').css('backgroundImage', 'url(' + imgs[0] +')');
  }
  else if (celciusTemp < tempArray[0] && celciusTemp >= tempArray[1])
  {
	  $('#localWeather').css('backgroundImage', 'url(' + imgs[1] +')');
  }
  else if (celciusTemp < tempArray[1] && celciusTemp >= tempArray[2])
  {
	  $('#localWeather').css('backgroundImage', 'url(' + imgs[2] +')');
  }
  else if (celciusTemp < tempArray[2]) 
  {
	  $('#localWeather').css('backgroundImage', 'url(' + imgs[3] +')');
  }
  var description = data.weather[0].description;
  var code = data.weather[0].icon;
  var wspeed = data.wind.speed;
  var city = data.name;
  var html = '<img src="https://openweathermap.org/img/w/' + code +
    '.png" alt="Weather Icon" class="icon">' + '<p> ' + Math.round(celciusTemp) +
    ', ' + description + '<br> Wind Speed: ' + wspeed + '</p><p>' +
	city + '</p>';
	$("#localWeather").append(html);

}//end of getLocalWeather function

//function connects to the local forecast URL and gets information using JSON
function callWeatherAPI() {
    var url = makeURL(coord.latitude, coord.longitude);
    $.getJSON(url, getLocalWeather);
}

//function gets the url needed to make the forecast charts or show weather for several days
function callForecastAPI() {
    var url2 = makeChartURL(coord.latitude, coord.longitude);
    $.getJSON(url2, loadChartData);
}

function callForecastAPI2() {
    var url = makeChartURL(coord.latitude, coord.longitude);
    $.getJSON(url, showWeatherForecast);
}

function start() {
    getUserLocation();
    callWeatherAPI();
    callForecastAPI();
    callForecastAPI2();
}

//This function shows an error message if geolocation is down or not working.
function showErr(err)
{
var s = $("#localWeather2");
s.empty();
$("#localWeather").append(err.message);
$("#localWeather2").append(err.message + "  Please Refresh Your Browser and click Allow! :-D");
console.log(err.message);    
}

function loadItems(){//load saved items 
    if(localStorage.listItems){
        localStorageCities=JSON.parse(localStorage.listItems);
        //loop thru storage
        $.each(localStorageCities, function(index, objectName){
          //localStorageCities.setItem("#city");
        });
    }
}

  //Form On Click Event, place user query in local storage and displays the weather for the city user searched for
$('form').on('submit' , function(e) {
    //call loadItem method
     loadItems();
     var city= $('#city').val();
     
      if (city && city!='') {
          $('#error').text('');

        $.ajax({
             url: 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=metric'
                  +'&APPID=bdae348d7da5482450ec146662cbc5fa',  
                  type: 'GET',                     
                  dataType: 'json',                 
                  success: function (data3){

                  //call the show function to get array of weather details back from inside the 
                          //weather object
                  var weatherUpdate= showWeather(data3);
                  var items = city.split(',');
                  items.forEach(function(objectName) {
                    items.push($("#city").val());

                  //update the array with users entered city
                  localStorageCities.push(objectName);
                  });
                  //after the loop add array to local storage
                  localStorage.listItems=JSON.stringify(localStorageCities);
                  //console.logconsole.log(localStorageCities);
                  
                  $('#city').val();
                  //now append the return info from showWeather 
                 //$('#show').html(weatherUpdate);
                  }//success block ends 
           });//ajax end
      }else{
        $('#error').html('The city field cannot be empty');
    }
    e.preventDefault();

  });//function body ends

function showWeatherForecast(data) {
    var s = $("#localWeather3");
    s.empty();
    $('#localWeather3').css('backgroundImage', 'url(' + imgs[4] +')');
    xx = 0;
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var forecastDateAndTime = new Array ();
    var forecastTemperature = new Array();
    var forecastDescription = new Array ();
    var forecastIcon = new Array();
    var city;
    var country;
    //get full forecasting data using for each loop and extra key
    //information
    $.each(data["list"], function(e, key) {
    forecastDateAndTime[xx] = key.dt_txt.substring(0,10);
    forecastTemperature[xx] = key.main.temp;
    forecastDescription[xx] = key.weather[0].description;
    forecastIcon[xx] = key.weather[0].icon;
    city = data.city.name;
    country = data.city.country;
    xx++;
    //key.weather keep that in mind
    //console.logconsole.log(data);
    });//end of for each loop
    //Create some variables that hold forecasting information
    var DateAndTime1 = forecastDateAndTime[1];
    var DateAndTime2 = forecastDateAndTime[9];
    var DateAndTime3 = forecastDateAndTime[17];

    var Temperature1 = forecastTemperature[1];
    var Temperature2 = forecastTemperature[9];
    var Temperature3 = forecastTemperature[17];

    var Description1 = forecastDescription[1];
    var Description2 = forecastDescription[9];
    var Description3 = forecastDescription[17];

    var Icon1 = forecastIcon[1];
    var Icon2 = forecastIcon[9];
    var Icon3 = forecastIcon[17];

    
    var html1 = 
    'Weather For: ' + city + ' ' + country + '<br>' +
    'Forecast For ' + DateAndTime1 + '<br>' +
    '<img src="https://openweathermap.org/img/w/' + Icon1 + '.png" alt="Weather Icon" class="icon">' + 
    '<p> ' + Temperature1 +', ' + Description1 +  '</p>' + 
    '<hr>' + 
    'Forecast For ' + DateAndTime2 + '<br>' +
    '<img src="https://openweathermap.org/img/w/' + Icon2 + '.png" alt="Weather Icon" class="icon">' + 
    '<p> ' + Temperature2 + ', ' + Description2 +  '</p>' + 
    '<hr>' +
    'Forecast For ' + DateAndTime3 + '<br>' + 
    '<img src="https://openweathermap.org/img/w/' + Icon3 + '.png" alt="Weather Icon" class="icon">' + 
    '<p> ' + Temperature3 + ', ' + Description3 +  '</p>';
    //console.log(html1);

    return $("#localWeather3").append(html1);

}//end of showWeatherForecastFunction

//function displays weather data for the city user has searched for
function showWeather(data3){
    var s = $('#localWeather2');
    s.empty();
    var kelvinTemp = data3.main.temp;
    var name = data3.name;
    var country = data3.sys.country;
    var weather =  data3.weather[0].main;
    var description = data3.weather[0].description;
    var code = data3.weather[0].icon;
    var wspeed = data3.wind.speed;

    var html = 'Current weather for: ' + name + '  ' + country + '<br> <img src="https://openweathermap.org/img/w/' + code +
    '.png" alt="Weather Icon" class="icon">' + '<p> ' + kelvinTemp +
    ', ' + description + '<br> Wind Speed: ' + wspeed + '</p><p>' +
    '</p>';
   
     return $("#localWeather2").append(html);

    }//end of showWeather

//Function loads two charts in the appropriate canvas 
function loadChartData(data){
xx = 0;
$.each(data["list"], function(e, key) {
//Labels for the array
labels[xx] = $(this).attr("dt_txt");
//Min temp array
data1[xx] = key.main.temp_min;
//console.log("data 1 is " +  data1);

//Max temp array 
data2[xx] = key.main.temp_max;
//console.log(data2);

//just the temperatures
data3[xx] = key.main.temp;
//console.log(data3);
xx++;

});//End of each loop
//console.log(data);
}//end of loadChartData function

//Shows Chart 1 which displays minimum temperatures
var ctx = document.getElementById("minTemp").getContext('2d');
var myChart = new Chart(ctx, {
type: 'line',
data: {
label: 'Minimum Temperature through the Week',
labels: labels,
datasets: [{
    data: data1,
    backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
}]
},
options: {
legend:  {
display: false
},
scales: {
    yAxes:  [{
            ticks: {
                    beginAtZero:true
            }
    }]
}
}
});//End of Chart 1 that showed minimum temperatueres

//Chart 2 Shows High Temperature
var ctx = document.getElementById("maxTemp").getContext('2d');
var myChart = new Chart(ctx, {
type: 'bar',
data: {
label: 'Maximum temperature through the week',
labels: labels,
datasets: [{
    data: data2,
    backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
}]
},
options: {
    legend: {
        display: false
},
scales: {
    yAxes: [{
        ticks: {
            beginAtZero:true
                            }
    }]
}
}
});
var densityCanvas = document.getElementById("forecastTemp");

Chart.defaults.global.defaultFontFamily = "Lato";
Chart.defaults.global.defaultFontSize = 12;

var weatherData = {
  label: 'Temperature Forecast for your city ',
  data: data3
};

var barChart = new Chart(densityCanvas, {
  type: 'bar',
  data: {
  labels: labels,
  datasets: [weatherData]
  }
});
});//end of jquery function
