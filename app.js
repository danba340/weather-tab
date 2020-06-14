const URL_BASE = `https://api.openweathermap.org/data/2.5/forecast?appid=17811b814f836419545653077fa493fe`;
const setLoading = loadingHandler();
const createWeatherString = weatherStringCreator();

function initApp(callback) {
  function success(position) {
    callback({ err: null, pos: position.coords });
  }

  function error() {
    callback({ err: "Unable to retrieve your location, did you allow it?" });
  }

  if (!navigator.geolocation) {
    callback({ err: "Geolocation is not supported by your browser" });
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

function onGeoLocationResponse(res) {
  if (!res.err) {
    fetchWeather(res.pos);
    setInterval(() => {
      fetchWeather(res.pos);
    }, 3600000); // Once again every hour
  } else if (res.err) {
    alert(res.err);
  } else {
    alert("Unknown error");
  }
}

async function fetchWeather(pos) {
  setLoading(true);
  const url = URL_BASE + `&lat=${pos.latitude}&lon=${pos.longitude}`;
  const weatherData = await (await fetch(url)).json();
  onWeatherData(weatherData);
}

function onWeatherData(weatherData) {
  document.getElementById("location").innerHTML = `🗺 ${weatherData.city.name}`;
  const dailyWeather = toDailyDescription(weatherData.list);
  const weatherString = createWeatherString(dailyWeather);
  setLoading(false);
  document.title = weatherString;
}

function weatherStringCreator(dailyWeather) {
  const weatherToEmoji = {
    Clear: "🌞",
    Clouds: "⛅︎",
    Thunder: "🌩",
    Rain: "🌧",
  };
  function getComingDays() {
    const allDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let dayIndex = new Date().getDay();
    const fiveDays = [];
    for (let i = 0; i < 5; i++) {
      fiveDays.push(allDays[dayIndex]);
      dayIndex = dayIndex < 6 ? dayIndex + 1 : 0;
    }
    return fiveDays.map((day) => day[0]);
  }
  return function getWeatherString(dailyWeather) {
    const weekDays = getComingDays();
    const weatherString = weekDays
      .map((day, index) => day + weatherToEmoji[dailyWeather[index]])
      .join("");
    return weatherString;
  };
}

function loadingHandler() {
  const moons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  let loadingInterval;
  let moonIndex = 0;

  function loadingMoonAnimation() {
    moonIndex = moonIndex + 1;
    if (moonIndex === moons.length) {
      moonIndex = 0;
    }
    document.title = `${moons[moonIndex]}Loading...`;
  }

  return function setLoading(isLoading) {
    if (isLoading) {
      loadingInterval = setInterval(loadingMoonAnimation, 200);
    } else {
      clearInterval(loadingInterval);
    }
  };
}

function toDailyDescription(weatherEntries) {
  const dailyDescriptions = weatherEntries
    .filter((dataPoint) => dataPoint.dt_txt.includes("15:00:00"))
    .map((day) => {
      return day.weather[0].main;
    });
  return dailyDescriptions;
}

initApp(onGeoLocationResponse);
