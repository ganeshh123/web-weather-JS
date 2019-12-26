const searchElement = document.querySelector('[data-city-search]')
const searchBox = new google.maps.places.SearchBox(searchElement)
var timeData = {};

// Toggles
var forecastOpened = false;

// Select a location, and then get Weather and Time Data 

searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()
    fetch('/time', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    }).then(res => res.json()).then(data => {
        timeData = data;
        console.log(timeData)
        setTimeData(timeData)
    })
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    }).then(res => res.json()).then(data => {
        console.log(data)
        setWeatherData(data, place)
    })

   
})

// Objects for all the elements

const icon = new Skycons({ color: '#222' })
const locationElement = document.querySelector('[data-location')
const statusElement = document.querySelector('[data-status')
const weatherDetailsElement = document.querySelector('[data-weather-details')
const tempElement = document.querySelector('[data-temp')
const windElement = document.querySelector('[data-wind')
const precElement = document.querySelector('[data-prec')
const timeElement = document.querySelector('[data-time')
const dateElement = document.querySelector('[data-date')
const localInfoElement = document.querySelector('[data-localInfo')
const alertBoxElement = document.querySelector('[data-alert')
const forecastElement = document.querySelector('[data-forecast')
const controlPanel = document.querySelector('[data-controls');
const weekShowButtonElement = document.querySelector('[data-weekshow]')
console.log(weekShowButtonElement);
icon.set('icon', 'partly-cloudy-day')

// Sort and Display the Weather Data

function setWeatherData(data, place) {

    forecastElement.style.display = "none";
    forecastOpened = false;

    currently = data.currently

    localInfoElement.style.backgroundColor = "rgba(0,0,0,0.1)";
    //localInfoElement.style.margin = "0px 0px 10px 0px";


    locationElement.textContent = place.formatted_address;
    //timeElement.textContent = timeConvert(time) + " |";
    //dateElement.textContent = dateConvert(time);

    statusElement.textContent = currently.summary;
    tempElement.textContent = currently.temperature + " ℃ | " + Math.round(convertTemp(currently.temperature) * 100) / 100 + " ℉";
    windElement.textContent = currently.windSpeed + " kph | " + Math.round(convertSpeed(currently.windSpeed) * 100) / 100 + " mph"
    precElement.textContent = Math.round(currently.precipProbability * 100) + '%'
    icon.set('icon', currently.icon)
    switch (currently.icon) {
        case "clear-day":
            document.body.style.background = "url('img/clear.jpg')";
            break;
        case "clear-night":
            document.body.style.background = "url('img/night.jpg')";
            break;
        case "rain":
            document.body.style.background = "url('img/rain.jpg')";
            break;
        case "snow":
            document.body.style.background = "url('img/snow.jpg')";
            break;
        case "sleet":
            document.body.style.background = "url('img/snow.jpg')";
            break;
        case "wind":
            document.body.style.background = "url('img/wind.jpg')";
            break;
        case "fog":
            document.body.style.background = "url('img/fog.jpg')";
            break;
        case "cloudy":
            document.body.style.background = "url('img/cloud.jpg')";
            break;
        case "partly-cloudy-day":
            document.body.style.background = "url('img/cloud.jpg')";
            break;
        case "partly-cloudy-night":
            document.body.style.background = "url('img/night.jpg')";
            break;
    }

    // Extra background setting

    if (currently.windSpeed > 30) {
        document.body.style.background = "url('img/wind.jpg')";
    }

    if (currently.temperature < -3) {
        document.body.style.background = "url('img/snow.jpg')";
    }


    //document.body.style.backgroundSize = "100% 100%";

    if (data.alerts != null) {
        console.log(data.alerts[0].title);
        alertBoxElement.style.display = "block";
        alertBoxElement.style.cursor = "pointer";
        alertBoxElement.textContent = data.alerts[0].title;
        console.log(data.alerts[0].uri)
        alertBoxElement.onclick = function() {
            window.open(data.alerts[0].uri, '_blank');;
        }
    } else {
        alertBoxElement.style.display = "none";
    }

    icon.play()

    weatherDetailsElement.style.display = "block";
    controlPanel.style.display = "block";


    weekShowButtonElement.onclick = function() {
        renderWeeklyForecast(data);;
    }
}

// Sort and Display the Time Data 

function setTimeData(timeData, data) {
    timeString = timeData.formatted
    console.log(timeString)
    console.log(timeString.length)
    time = timeData.timestamp - 3600;
    timeElement.style.display = "inline-block";
    dateElement.style.display = "inline-block";
    localInfoElement.style.backgroundColor = "rgba(0,0,0,0.1)";
    timeElement.textContent = timeString.slice(11, 16) + " |"
    dateElement.textContent = timeString.slice(0, 10);

}

// Convert from Celcius to Fahrenheit

function convertTemp(input) {
    return (input * 9 / 5) + 32;
}

// Convert from km/h to mph

function convertSpeed(input) {
    return input / 1.609344;
}

// Convert Unix Time to a readable string

function timeConvert(t) {
    var dt = new Date(t * 1000);
    var hr = dt.getHours();
    var m = "0" + dt.getMinutes();
    var s = "0" + dt.getSeconds();
    return hr + ':' + m.substr(-2);
}

// Convert Unix Date to a readable string

function dateConvert(t) {
    var date = new Date(t * 1000);

    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    return weekday[date.getDay()] + " " + date.getDate() + "-" + (date.getMonth() + 1).toString() + "-" + date.getFullYear();
}

function getDay(t) {
    return dateConvert(t).split(" ")[0];
}

function renderWeeklyForecast(data) {
    daily = data.daily.data;

    //console.log(daily);
    forecastElement.innerHTML = '';
    let dayCounter = 0;
    daily.forEach(function(day) {
        //console.log(day.summary + day.precipProbability);
        //var forecastElement = document.getElementById("forecast");
        var forecastRowElement = document.createElement("div");
        forecastRowElement.className = "forecastRow";

        var forecastLeftElement = document.createElement("div");
        forecastLeftElement.className = "forecastLeft";

        var forecastDayElement = document.createElement("div");
        forecastDayElement.className = "forecastDay";
        if (dayCounter == 0) {
            forecastDayElement.appendChild(document.createTextNode("Today"));
            dayCounter++;
        } else if (dayCounter == 1) {
            forecastDayElement.appendChild(document.createTextNode("Tomorrow"));
            dayCounter++;
        } else {
            forecastDayElement.appendChild(document.createTextNode(getDay(day.time)));
        }

        forecastLeftElement.appendChild(forecastDayElement);

        var forecastNumbersElement = document.createElement("div");
        forecastNumbersElement.className = "forecastNumbers";

        var forecastDataBlockElement = document.createElement("div");
        forecastDataBlockElement.className = "forecastDataBlock";

        var forecastTemperatureIconElement = document.createElement("i");

        forecastTemperatureIconElement.className = "fas fa-thermometer-half";

        forecastDataBlockElement.appendChild(forecastTemperatureIconElement);
        forecastDataBlockElement.appendChild(document.createTextNode('\xa0' + Math.round(day.temperatureLow) + '-' + Math.round(day.temperatureHigh) + ' ℃'));

        forecastNumbersElement.appendChild(forecastDataBlockElement);


        var forecastDataBlockElement2 = document.createElement("div");
        forecastDataBlockElement2.className = "forecastDataBlock";

        var forecastStatusIconElement = document.createElement("i");
        forecastStatusIconElement.style.fontSize = "25px";

        switch (day.icon) {
            case "clear-day":
                forecastStatusIconElement.className = "fas fa-sun";
                break;
            case "clear-night":
                forecastStatusIconElement.className = "fas fa-moon";
                break;
            case "rain":
                forecastStatusIconElement.className = "fas fa-cloud-rain";
                break;
            case "snow":
                forecastStatusIconElement.className = "fas fa-snowflake";
                break;
            case "sleet":
                forecastStatusIconElement.className = "fas fa-snowflake";
                break;
            case "wind":
                forecastStatusIconElement.className = "fas fa-wind";
                break;
            case "fog":
                forecastStatusIconElement.className = "fas fa-smog";
                break;
            case "cloudy":
                forecastStatusIconElement.className = "fas fa-sun";
                break;
            case "partly-cloudy-day":
                forecastStatusIconElement.className = "fas fa-cloud-sun";
                break;
            case "partly-cloudy-night":
                forecastStatusIconElement.className = "fas fa-cloud";
                break;
        }


        forecastDataBlockElement2.appendChild(forecastStatusIconElement);
        //forecastDataBlockElement2.appendChild(document.createTextNode('\xa0'));

        forecastNumbersElement.appendChild(forecastDataBlockElement2);


        forecastLeftElement.appendChild(forecastNumbersElement);

        forecastRowElement.appendChild(forecastLeftElement);

        var forecastRightElement = document.createElement("div");
        forecastRightElement.className = "forecastRight";

        var forecastSummaryElement = document.createElement("div");
        forecastSummaryElement.appendChild(document.createTextNode(day.summary));
        forecastRightElement.appendChild(forecastSummaryElement);

        forecastRowElement.appendChild(forecastRightElement);

        forecastElement.appendChild(forecastRowElement);

    })

    if (forecastOpened === false) {
        forecastElement.style.display = "flex";
        forecastOpened = true;
    } else {
        forecastElement.style.display = "none";
        forecastOpened = false;
    }
}