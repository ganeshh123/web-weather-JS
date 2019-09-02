if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY
const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;
const axios = require('axios')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.static('public'))

app.post('/weather', (req, res) => {
    const darksky_url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${req.body.latitude},${req.body.longitude}?units=ca`
    axios({
        url: darksky_url,
        responseType: 'json'
    }).then(data => res.json(data.data))

})

app.post('/time', (req, res) => {

    const timezonedb_url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=position&lat=${req.body.latitude}&lng=${req.body.longitude}`
    axios({
        url: timezonedb_url,
        responseType: 'json'
    }).then(response => {
        console.log(response.data);
        res.json(response.data);
    })

})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started')
})