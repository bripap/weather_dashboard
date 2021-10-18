let citiesList = [];
let numberCities = 9;
let APIkey = "appid=7bdfcb5dabbe0c6127d93bb9fa823884";
let unit = "units=imperial";
let dailyWeather = "https://api.openweathermap.org/data/2.5/weather?q=";
let dailyUV = "https://api.openweathermap.org/data/2.5/uvi?";
let dailyForcast = "https://api.openweathermap.org/data/2.5/onecall?";
let searchCityForm = $("#searchCityForm");
let searchedCities = $("#searchedCityLi");
let getCityWeather = function (searchCityName) {
  let apiUrl = dailyWeather + searchCityName + "&" + APIkey + "&" + unit;
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      return response.json().then(function (response) {
        $("#cityName").html(response.name);
        let unixTime = response.dt;
        let date = moment.unix(unixTime).format("MM/DD/YY");
        $("#currentdate").html(date);
        let weatherIncoUrl = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
        $("#weatherIconToday").attr("src", weatherIncoUrl);
        $("#tempToday").html(response.main.temp + " \u00B0F");
        $("#humidityToday").html(response.main.humidity + " %");
        $("#windSpeedToday").html(response.wind.speed + " MPH");
        let lat = response.coord.lat;
        let lon = response.coord.lon;
        getUVIndex(lat, lon);
        getForecast(lat, lon);
      });
    } else {
      alert("Please provide a valid city.");
    }
  });
};
let getUVIndex = function (lat, lon) {
  let apiUrl = dailyUV + APIkey + "&lat=" + lat + "&lon=" + lon + "&" + unit;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      $("#UVIndexToday").removeClass();
      $("#UVIndexToday").html(response.value);
      if (response.value < 3) {
        $("#UVIndexToday").addClass("p-1 rounded bg-success text-white");
      } else if (response.value < 8) {
        $("#UVIndexToday").addClass("p-1 rounded bg-warning text-white");
      } else {
        $("#UVIndexToday").addClass("p-1 rounded bg-danger text-white");
      }
    });
};
let getForecast = function (lat, lon) {
  let apiUrl = dailyForcast + "lat=" + lat + "&lon=" + lon + "&exclude=current,minutely,hourly" + "&" + APIkey + "&" +unit;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      for (let i = 1; i < 6; i++) {
        let unixTime = response.daily[i].dt;
        let date = moment.unix(unixTime).format("MM/DD/YY");
        $("#Date" + i).html(date);
        let weatherIncoUrl =
          "http://openweathermap.org/img/wn/" +
          response.daily[i].weather[0].icon +
          "@2x.png";
        $("#weatherIconDay" + i).attr("src", weatherIncoUrl);
        let temp = response.daily[i].temp.day + " \u00B0F";
        $("#tempDay" + i).html(temp);
        let humidity = response.daily[i].humidity;
        $("#humidityDay" + i).html(humidity + " %");
      }
    });
};
let creatBtn = function (btnText) {
  let btn = $("<button>")
    .text(btnText)
    .addClass("list-group-item list-group-item-action")
    .attr("type", "submit");
  return btn;
};
let loadSavedCity = function () {
  citiesList = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesList == null) {
    citiesList = [];
  }
  for (let i = 0; i < citiesList.length; i++) {
    let cityNameBtn = creatBtn(citiesList[i]);
    searchedCities.append(cityNameBtn);
  }
};
let saveCityName = function (searchCityName) {
  let newcity = 0;
  citiesList = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesList == null) {
    citiesList = [];
    citiesList.unshift(searchCityName);
  } else {
    for (let i = 0; i < citiesList.length; i++) {
      if (searchCityName.toLowerCase() == citiesList[i].toLowerCase()) {
        return newcity;
      }
    }
    if (citiesList.length < numberCities) {
      citiesList.unshift(searchCityName);
    } else {
      citiesList.pop();
      citiesList.unshift(searchCityName);
    }
  }
  localStorage.setItem("weatherInfo", JSON.stringify(citiesList));
  newcity = 1;
  return newcity;
};
let createCityNameBtn = function (searchCityName) {
  let saveCities = JSON.parse(localStorage.getItem("weatherInfo"));
  if (saveCities.length == 1) {
    let cityNameBtn = creatBtn(searchCityName);
    searchedCities.prepend(cityNameBtn);
  } else {
    for (let i = 1; i < saveCities.length; i++) {
      if (searchCityName.toLowerCase() == saveCities[i].toLowerCase()) {
        return;
      }
    }
    if (searchedCities[0].childElementCount < numberCities) {
      let cityNameBtn = creatBtn(searchCityName);
    } else {
      searchedCities[0].removeChild(searchedCities[0].lastChild);
      let cityNameBtn = creatBtn(searchCityName);
    }
    searchedCities.prepend(cityNameBtn);
    $(":button.list-group-item-action").on("click", function () {
      BtnClickHandler(event);
    });
  }
};

loadSavedCity();
let formSubmitHandler = function (event) {
  event.preventDefault();
  let searchCityName = $("#searchCity").val().trim();
  let newcity = saveCityName(searchCityName);
  getCityWeather(searchCityName);
  if (newcity == 1) {
    createCityNameBtn(searchCityName);
  }
};
let BtnClickHandler = function (event) {
  event.preventDefault();
  let searchCityName = event.target.textContent.trim();
  getCityWeather(searchCityName);
};
$("#searchCityForm").on("submit", function () {
  formSubmitHandler(event);
});
$(":button.list-group-item-action").on("click", function () {
  BtnClickHandler(event);
});
