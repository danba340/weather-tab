const POLL_INTERVAL = 60000; // 1 min in ms
const URL_BASE = `https://api.openweathermap.org/data/2.5/forecast?appid=17811b814f836419545653077fa493fe`;
const MOONS = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
let moonIndex = 0;
const WEATHER_TO_EMOJI = {
  Clear: "🌞",
  Clouds: "⛅︎",
  Thunder: "🌩",
  Rain: "🌧",
};
let loadingInterval;
let pollingInterval;
let userPos;

async function getWeather(pos) {
  setLoading(true);
  const url = URL_BASE + `&lat=${pos.latitude}&lon=${pos.longitude}`;
  const weatherData = await (await fetch(url)).json();
  onWeatherData(weatherData);
}

function onWeatherData(weatherData) {
  const dailyWeather = parseWeatherData(weatherData.list);
  console.log(dailyWeather);
  const weatherString = createWeatherString(dailyWeather);
  setLoading(false);
  document.title = weatherString;
}

function loadingMoonAnimation() {
  moonIndex = moonIndex + 1;
  if (moonIndex === MOONS.length) {
    moonIndex = 0;
  }
  document.title = `${MOONS[moonIndex]}Loading...`;
}

function setLoading(isLoading) {
  if (isLoading) {
    loadingInterval = setInterval(loadingMoonAnimation, 200);
  } else {
    clearInterval(loadingInterval);
  }
}

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

function createWeatherString(dailyWeather) {
  const weekDays = getComingDays();

  const weatherString = weekDays
    .map((day, index) => day + WEATHER_TO_EMOJI[dailyWeather[index]])
    .join("");
  return weatherString;
}

function parseWeatherData(payload) {
  const dailyWeathers = payload
    .filter((dataPoint) => dataPoint.dt_txt.includes("15:00:00"))
    .map((day) => {
      return day.weather[0].main;
    });
  return dailyWeathers;
}

function getGeolocation() {
  function success(position) {
    userPos = position.coords;
    getWeather(position.coords);
  }

  function error() {
    alert("Unable to retrieve your location");
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

getGeolocation();

setInterval(() => {
  getWeather(userPos);
}, 3600000); // Once an hour
