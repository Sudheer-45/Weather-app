// API Configuration
const apiKey = "47e4071549cc736cd66f9f7dc894d27c";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units=metric&appid={appid}";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const tempDisplay = document.querySelector(".temp_display");
const description = document.querySelector(".card-text");
const forecastContainer = document.getElementById("forecast-container");


const darkMode = document.getElementById("darkMode");
const lightMode = document.getElementById("lightMode");
const backgroundVideo = document.getElementById("background-video");
const videoSource = document.getElementById("video-source");
const appContainer = document.getElementById("weather-app");




darkMode.addEventListener("click", () => {
  document.body.classList.add("dark-mode");
  document.body.classList.remove("light-mode");

  // Switch to night video
  videoSource.src = "videos/night.mp4";
  backgroundVideo.load();  // reloads the video with the new src
  backgroundVideo.play();  // ensure it plays
});

lightMode.addEventListener("click", () => {
  document.body.classList.add("light-mode");
  document.body.classList.remove("dark-mode");

  // Switch to sunset (or day) video
  videoSource.src = "videos/day.mp4";
  backgroundVideo.load();
  backgroundVideo.play();
});


// Fetch and display current weather
async function fetchCurrentWeather(city) {
  try {
    cityName.textContent = "Loading...";
    tempDisplay.textContent = "_°C";
    description.textContent = "_";
    weatherIcon.src = "";

    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    const data = await response.json();

    if (data.cod === 200) {
      cityName.textContent = data.name;
      let curr_temperature = Math.round(data.main.temp);
      tempDisplay.textContent = `${curr_temperature}°C`;
      description.textContent = capitalizeWords(data.weather[0].description);
      weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  //     // Change background video based on temperature
  //     if (temperature <= 15) {
  // // Cold weather
  //       videoSource.src = "videos/cold.mp4";
  //     } else if (temperature > 15 && temperature <= 30) {
  // // Moderate weather
  //       videoSource.src = "videos/moderate.mp4";
  //     } else {
  // // Hot weather
  //       videoSource.src = "videos/hot.mp4";
  //     }

  //     backgroundVideo.load();
  //     backgroundVideo.play();
      appContainer.classList.remove("bg-freezing", "bg-cold", "bg-mild", "bg-warm", "bg-hot");


      if (curr_temperature <= 0) {
        videoSource.src = "videos/snow.mp4";
        appContainer.classList.add("bg-freezing");
      } else if (curr_temperature > 0 && curr_temperature <= 10) {
        videoSource.src = "videos/cold.mp4";
        appContainer.classList.add("bg-cold");
      } else if (curr_temperature > 10 && curr_temperature <= 20) {
        videoSource.src = "videos/mild-day.mp4";
        appContainer.classList.add("bg-mild");
      } else if (curr_temperature > 20 && curr_temperature <= 30) {
        videoSource.src = "videos/hot.mp4";
        appContainer.classList.add("bg-warm");
      } else if (curr_temperature > 30) {
        videoSource.src = "videos/warm.mp4";
        appContainer.classList.add("bg-hot");
      }

      backgroundVideo.load();
      backgroundVideo.play();

      // Fetch.forecast
    
    await fetchForecast(data.coord.lat, data.coord.lon);

    } else {
      alert("City not found!");
      cityName.textContent = "City";
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    alert("Failed to fetch current weather data.");
  }

}

// Fetch and display 5-day forecast
async function fetchForecast(lat, lon) {
  try {
    const url = forecastApiUrl
      .replace("{lat}", lat)
      .replace("{lon}", lon)
      .replace("{appid}", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === "200") {
      forecastContainer.innerHTML = "";

      // Filter data for "12:00:00" entries
      const dailyData = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
      );

      for (let i = 0; i < 5; i++) {
        const dayData = dailyData[i];
        if (!dayData) continue;

        const temp = Math.round(dayData.main.temp);
        const iconCode = dayData.weather[0].icon;
        const desc = capitalizeWords(dayData.weather[0].description);
        const dayName = new Date(dayData.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short"
        });
        
        const card = `
          <div class="col">
            <div class="card forecast-card mx-auto">
              <div class="card-body">
                <h5 class="card-title">${dayName}</h5>
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon" class="weather-icon mb-2">
                <p class="card-text">${temp}°C</p>
                <p class="card-text">${desc}</p>
              </div>
            </div>
          </div>
        `;
        forecastContainer.insertAdjacentHTML("beforeend", card);
      }
    } else {
      forecastContainer.innerHTML = `<p class="text-danger">Error loading forecast: ${data.message}</p>`;
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
    forecastContainer.innerHTML = `<p class="text-danger">Failed to load weather forecast.</p>`;
  }
}

// Capitalize each word in string
function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Search Button Click Event
searchButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    await fetchCurrentWeather(city);
  } else {
    alert("Please enter a city name.");
  }
});

// Support Enter key in input
cityInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchButton.click();
  }
});

// Load default weather for Guntur on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchCurrentWeather("Guntur");
});
