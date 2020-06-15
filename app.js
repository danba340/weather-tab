const URL_BASE = `https://api.openweathermap.org/data/2.5/forecast?appid=17811b814f836419545653077fa493fe`;
const createWeatherString = weatherStringCreator();
const setLoading = loadingHandler();

function loadingHandler() {
  const moons = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  let moonIndex = 0;
  let loadingInterval;

  function loadingAnimation() {
    moonIndex = moonIndex < 7 ? moonIndex + 1 : 0;
    document.title = `${moons[moonIndex]} Loading...`;
  }

  return function setLoading(isLoading) {
    if (isLoading) {
      loadingInterval = setInterval(loadingAnimation, 100);
    } else {
      clearInterval(loadingInterval);
    }
  };
}

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
    }, 3600000); // Every hour
  } else if (res.err) {
    alert(res.err);
  } else {
    alert("Unknown error");
  }
}

function onWeatherData({ city, list }) {
  document.getElementById("location").innerHTML = city.name;
  const dailyWeatherDescriptions = toDailyDescription(list);
  const weatherString = createWeatherString(dailyWeatherDescriptions);
  document.title = weatherString;
}

function weatherStringCreator() {
  const weatherToEmoji = {
    Clear: "🌞",
    Clouds: "⛅︎",
    Thunder: "🌩",
    Rain: "🌧",
  };
  function getComingDays(amount) {
    const allDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let todayIndex = new Date().getDay();
    const fiveDays = [];
    for (let i = 0; i < amount; i++) {
      fiveDays.push(allDays[todayIndex]);
      todayIndex = todayIndex < 6 ? todayIndex + 1 : 0;
    }
    return fiveDays;
  }

  return function createWeatherString(descriptions) {
    const days = getComingDays(5);
    const emojis = descriptions.map((d) => weatherToEmoji[d]);
    const weatherString = days
      .map((day, index) => {
        return day[0] + emojis[index];
      })
      .join("");
    return weatherString;
  };
}

function toDailyDescription(weatherEntries) {
  const midDayEntries = weatherEntries.filter((we) =>
    we.dt_txt.includes("15:00:00")
  );
  return midDayEntries.map((mde) => mde.weather[0].main);
}

async function fetchWeather({ longitude, latitude }) {
  setLoading(true);
  const url = URL_BASE + `&lat=${latitude}&lon=${longitude}`;
  const weatherData = await (await fetch(url)).json();
  setLoading(false);
  onWeatherData(weatherData);
}

initApp(onGeoLocationResponse);
