const searchElement = document.querySelector('[data-city-search]')
const searchBox = new google.maps.places.SearchBox(searchElement)
searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()
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
        setWeatherData(data, place.formatted_address)
    })
})

const icon = new Skycons({ color: '#222' })
const locationElement = document.querySelector('[data-location')
const statusElement = document.querySelector('[data-status')
const tempElement = document.querySelector('[data-temp')
const windElement = document.querySelector('[data-wind')
const precElement = document.querySelector('[data-prec')
icon.set('icon', 'partly-cloudy-day')

function setWeatherData(data, place) {
    locationElement.textContent = place
    statusElement.textContent = data.summary
    tempElement.textContent = data.temperature
    windElement.textContent = data.windSpeed
    precElement.textContent = data.precipProbability * 100 + '%'
    icon.set('icon', data.icon)
    icon.play()

}