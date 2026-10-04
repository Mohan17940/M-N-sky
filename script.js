
// ==========================================
// WEATHERLY
// Main JavaScript File
// ==========================================


// ==========================================
// 1. API KEY
// ==========================================

// Your OpenWeather API key
const API_KEY = "9db93748d9896781538d9ec0892bd08d";


// ==========================================
// 2. GET HTML ELEMENTS
// ==========================================

// City input
const cityInput = document.getElementById("city");

// Search button
const searchButton = document.getElementById("searchButton");

// Location button
const locationButton = document.getElementById("locationButton");

// Loading box
const loading = document.getElementById("loading");

// Error box
const error = document.getElementById("error");

// Error text
const errorText = document.getElementById("errorText");

// Empty state
const emptyState = document.getElementById("emptyState");

// Weather dashboard
const weatherDashboard =
    document.getElementById("weatherDashboard");

// Forecast container
const forecastContainer =
    document.getElementById("forecast");


// ==========================================
// 3. SEARCH BUTTON
// ==========================================

// Search button click panna getWeather()
// function call aagum
searchButton.addEventListener("click", getWeather);


// ==========================================
// 4. ENTER KEY SEARCH
// ==========================================

// Input box-la Enter press panna search pannum
cityInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        getWeather();

    }

});


// ==========================================
// 5. MAIN WEATHER FUNCTION
// ==========================================

async function getWeather() {

    // Input box-la irundhu city name edukkrom
    const city = cityInput.value.trim();


    // City empty-ah irundha search stop pannrom
    if (city === "") {

        showError("Please enter a city name.");

        return;

    }


    // Loading show pannrom
    showLoading();


    try {

        // ======================================
        // CREATE OPENWEATHER API URL
        // ======================================

        const url =
            "https://api.openweathermap.org/data/2.5/weather" +
            "?q=" + encodeURIComponent(city) +
            "&appid=" + API_KEY +
            "&units=metric";


        // API request
        const response = await fetch(url);


        // Response JSON-ah convert pannrom
        const data = await response.json();


        // API error check
        if (!response.ok) {

            throw new Error(
                data.message || "City not found."
            );

        }


        // Current weather display
        displayWeather(data);


        // 5-day forecast load pannrom
        await getForecast(
            data.coord.lat,
            data.coord.lon
        );


        // Dashboard show
        weatherDashboard.classList.remove("hidden");


        // Empty message hide
        emptyState.style.display = "none";


        // Error hide
        hideError();

    }


    catch (err) {

        // Browser console-la error print pannum
        console.error(err);


        // User-ku readable error show pannum
        showError(
            "Unable to get weather: " +
            err.message
        );

    }


    finally {

        // Loading hide pannrom
        loading.classList.add("hidden");

    }

}


// ==========================================
// 6. DISPLAY CURRENT WEATHER
// ==========================================

function displayWeather(data) {

    // ----------------------------------------
    // Get data from API
    // ----------------------------------------

    const cityName = data.name;

    const country = data.sys.country;

    const temperature =
        Math.round(data.main.temp);

    const feelsLike =
        Math.round(data.main.feels_like);

    const humidity =
        data.main.humidity;

    const pressure =
        data.main.pressure;

    // OpenWeather wind speed m/s-la kudukkum
    // m/s x 3.6 = km/h
    const wind =
        (data.wind.speed * 3.6).toFixed(1);

    // Visibility meters-la varum
    // / 1000 = kilometres
    const visibility =
        (data.visibility / 1000).toFixed(1);

    const condition =
        data.weather[0].description;


    // ----------------------------------------
    // City
    // ----------------------------------------

    document.getElementById("location")
        .textContent =
        cityName + ", " + country;


    // ----------------------------------------
    // Current date
    // ----------------------------------------

    document.getElementById("date")
        .textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    // ----------------------------------------
    // Temperature
    // ----------------------------------------

    document.getElementById("temperature")
        .textContent =
        temperature;


    // ----------------------------------------
    // Feels like
    // ----------------------------------------

    document.getElementById("feelsLike")
        .textContent =
        feelsLike;


    // ----------------------------------------
    // Weather condition
    // ----------------------------------------

    document.getElementById("condition")
        .textContent =
        condition;


    // ----------------------------------------
    // Humidity
    // ----------------------------------------

    document.getElementById("humidity")
        .textContent =
        humidity + "%";


    // ----------------------------------------
    // Wind
    // ----------------------------------------

    document.getElementById("wind")
        .textContent =
        wind + " km/h";


    // ----------------------------------------
    // Pressure
    // ----------------------------------------

    document.getElementById("pressure")
        .textContent =
        pressure + " hPa";


    // ----------------------------------------
    // Visibility
    // ----------------------------------------

    document.getElementById("visibility")
        .textContent =
        visibility + " km";


    // ----------------------------------------
    // Sunrise
    // ----------------------------------------

    document.getElementById("sunrise")
        .textContent =
        formatTime(
            data.sys.sunrise,
            data.timezone
        );


    // ----------------------------------------
    // Sunset
    // ----------------------------------------

    document.getElementById("sunset")
        .textContent =
        formatTime(
            data.sys.sunset,
            data.timezone
        );


    // ----------------------------------------
    // Wind direction
    // ----------------------------------------

    document.getElementById("windDirection")
        .textContent =
        getWindDirection(data.wind.deg);


    // ----------------------------------------
    // Weather icon
    // ----------------------------------------

    document.getElementById("weatherIcon")
        .textContent =
        getWeatherIcon(
            data.weather[0].id,
            data.weather[0].icon
        );


    // ----------------------------------------
    // Minimum temperature
    // ----------------------------------------

    document.getElementById("minTemp")
        .textContent =
        Math.round(data.main.temp_min)
        + "°C";


    // ----------------------------------------
    // Maximum temperature
    // ----------------------------------------

    document.getElementById("maxTemp")
        .textContent =
        Math.round(data.main.temp_max)
        + "°C";

}


// ==========================================
// 7. GET 5-DAY FORECAST
// ==========================================

async function getForecast(latitude, longitude) {

    // Forecast API URL
    const url =
        "https://api.openweathermap.org/data/2.5/forecast" +
        "?lat=" + latitude +
        "&lon=" + longitude +
        "&appid=" + API_KEY +
        "&units=metric";


    // API request
    const response = await fetch(url);


    // JSON convert
    const data = await response.json();


    // Check API response
    if (!response.ok) {

        throw new Error(
            data.message ||
            "Forecast unavailable."
        );

    }


    // Old forecast cards clear pannrom
    forecastContainer.innerHTML = "";


    // ======================================
    // GROUP FORECAST DATA BY DATE
    // ======================================

    const dailyData = {};


    data.list.forEach(function(item) {

        // Example:
        // 2026-10-04
        const date =
            item.dt_txt.split(" ")[0];


        // Date-ku array create pannrom
        if (!dailyData[date]) {

            dailyData[date] = [];

        }


        // Forecast add pannrom
        dailyData[date].push(item);

    });


    // First 5 days
    const dates =
        Object.keys(dailyData).slice(0, 5);


    // ======================================
    // CREATE FORECAST CARDS
    // ======================================

    dates.forEach(function(date, index) {

        // Andha date-ku irukkura forecasts
        const items =
            dailyData[date];


        // Noon-ku closest forecast select pannrom
        let selected =
            items[0];


        items.forEach(function(item) {

            const itemHour =
                Number(item.dt_txt.slice(11, 13));

            const selectedHour =
                Number(selected.dt_txt.slice(11, 13));


            if (
                Math.abs(itemHour - 12) <
                Math.abs(selectedHour - 12)
            ) {

                selected = item;

            }

        });


        // ==================================
        // MIN / MAX TEMPERATURE
        // ==================================

        let minTemp =
            items[0].main.temp_min;

        let maxTemp =
            items[0].main.temp_max;


        // Rain probability
        let rainChance = 0;


        items.forEach(function(item) {

            // Minimum
            if (
                item.main.temp_min < minTemp
            ) {

                minTemp =
                    item.main.temp_min;

            }


            // Maximum
            if (
                item.main.temp_max > maxTemp
            ) {

                maxTemp =
                    item.main.temp_max;

            }


            // Rain probability
            if (
                item.pop > rainChance
            ) {

                rainChance =
                    item.pop;

            }

        });


        // ==================================
        // GET DAY NAME
        // ==================================

        const dateObject =
            new Date(date + "T12:00:00");


        let dayName;


        if (index === 0) {

            dayName = "Today";

        } else {

            dayName =
                dateObject.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        }


        // ==================================
        // GET WEATHER ICON
        // ==================================

        const icon =
            getWeatherIcon(
                selected.weather[0].id,
                selected.weather[0].icon
            );


        // ==================================
        // CREATE CARD
        // ==================================

        const card =
            document.createElement("div");

        card.className =
            "forecast-item";


        // Day
        const day =
            document.createElement("div");

        day.className =
            "forecast-day";

        day.textContent =
            dayName;


        // Icon
        const iconElement =
            document.createElement("div");

        iconElement.className =
            "forecast-icon";

        iconElement.textContent =
            icon;


        // Condition
        const condition =
            document.createElement("div");

        condition.className =
            "forecast-condition";

        condition.textContent =
            selected.weather[0].description;


        // Temperature
        const temperature =
            document.createElement("div");

        temperature.className =
            "forecast-temp";

        temperature.textContent =
            Math.round(maxTemp)
            + "° / "
            + Math.round(minTemp)
            + "°";


        // Rain
        const rain =
            document.createElement("div");

        rain.className =
            "forecast-rain";

        rain.textContent =
            "🌧️ "
            + Math.round(rainChance * 100)
            + "%";


        // Add elements to card
        card.appendChild(day);

        card.appendChild(iconElement);

        card.appendChild(condition);

        card.appendChild(temperature);

        card.appendChild(rain);


        // Add card to forecast area
        forecastContainer.appendChild(card);


        // Today's rain chance
        if (index === 0) {

            document.getElementById("rainChance")
                .textContent =
                Math.round(
                    rainChance * 100
                ) + "%";

        }

    });

}


// ==========================================
// 8. WEATHER ICON FUNCTION
// ==========================================

function getWeatherIcon(id, iconCode) {

    // Thunderstorm
    if (id >= 200 && id < 300) {

        return "⛈️";

    }


    // Drizzle
    if (id >= 300 && id < 400) {

        return "🌦️";

    }


    // Rain
    if (id >= 500 && id < 600) {

        return "🌧️";

    }


    // Snow
    if (id >= 600 && id < 700) {

        return "❄️";

    }


    // Mist / fog
    if (id >= 700 && id < 800) {

        return "🌫️";

    }


    // Clear sky
    if (id === 800) {

        // Night icon
        if (
            iconCode &&
            iconCode.endsWith("n")
        ) {

            return "🌙";

        }

        // Day icon
        return "☀️";

    }


    // Clouds
    if (id > 800) {

        return "☁️";

    }


    // Default
    return "🌤️";

}


// ==========================================
// 9. FORMAT TIME
// ==========================================

function formatTime(timestamp, timezoneOffset) {

    // API time seconds-la irukkum.
    // JavaScript milliseconds expect pannum.
    const date =
        new Date(
            (timestamp + timezoneOffset) * 1000
        );


    // Readable time return pannrom
    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC"
        }
    );

}


// ==========================================
// 10. WIND DIRECTION
// ==========================================

function getWindDirection(degrees) {

    // If API doesn't give direction
    if (degrees === undefined) {

        return "--";

    }


    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];


    // Degree -> direction convert
    const index =
        Math.round(degrees / 45) % 8;


    return directions[index];

}


// ==========================================
// 11. MY LOCATION
// ==========================================

locationButton.addEventListener(
    "click",
    function() {

        // Browser location support check
        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        // Loading show
        showLoading();


        // Get current coordinates
        navigator.geolocation.getCurrentPosition(

            async function(position) {

                try {

                    // Latitude
                    const latitude =
                        position.coords.latitude;


                    // Longitude
                    const longitude =
                        position.coords.longitude;


                    // API URL
                    const url =
                        "https://api.openweathermap.org/data/2.5/weather" +
                        "?lat=" + latitude +
                        "&lon=" + longitude +
                        "&appid=" + API_KEY +
                        "&units=metric";


                    // Request
                    const response =
                        await fetch(url);


                    // JSON
                    const data =
                        await response.json();


                    // Error check
                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Unable to get your location weather."
                        );

                    }


                    // Update input with city name
                    cityInput.value =
                        data.name;


                    // Current weather
                    displayWeather(data);


                    // Forecast
                    await getForecast(
                        latitude,
                        longitude
                    );


                    // Show dashboard
                    weatherDashboard
                        .classList
                        .remove("hidden");


                    // Hide empty state
                    emptyState.style.display =
                        "none";


                    // Hide error
                    hideError();

                }


                catch (err) {

                    showError(err.message);

                }


                finally {

                    loading
                        .classList
                        .add("hidden");

                }

            },


            function() {

                // Permission denied
                loading
                    .classList
                    .add("hidden");


                showError(
                    "Location permission denied. " +
                    "Please search for a city."
                );

            },

            {
                timeout: 10000
            }

        );

    }
);


// ==========================================
// 12. SHOW LOADING
// ==========================================

function showLoading() {

    loading
        .classList
        .remove("hidden");


    error
        .classList
        .add("hidden");

}


// ==========================================
// 13. SHOW ERROR
// ==========================================

function showError(message) {

    loading
        .classList
        .add("hidden");


    error
        .classList
        .remove("hidden");


    errorText.textContent =
        message;

}


// ==========================================
// 14. HIDE ERROR
// ==========================================

function hideError() {

    error
        .classList
        .add("hidden");

}


// ==========================================
// 15. DARK MODE
// ==========================================

const themeButton =
    document.getElementById("themeButton");


themeButton.addEventListener(
    "click",
    function() {

        // Dark mode on/off
        document.body
            .classList
            .toggle("dark-mode");


        // Check current mode
        const isDark =
            document.body
                .classList
                .contains("dark-mode");


        // Change button icon
        themeButton.textContent =
            isDark ? "☀️" : "🌙";

    }
);
