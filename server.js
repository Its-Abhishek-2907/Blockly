const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files if needed

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve the form
app.get('/', (req, res) => {
    res.render('form'); // Render the form view
});

// Handle the POST request to /map
app.post('/map', async (req, res) => {
    const startingPoint = req.body.start;
    const endingPoint = req.body.end;

    const geocodeUrl = `https://nominatim.openstreetmap.org/search`;

    try {
        // Get coordinates for the starting point
        const startResponse = await axios.get(geocodeUrl, {
            params: {
                q: startingPoint,
                format: 'json',
                addressdetails: 1,
            }
        });

        console.log('Start Response:', startResponse.data); // Log the response

        if (startResponse.data.length === 0) {
            return res.status(404).send('Starting point not found');
        }

        const startLocation = startResponse.data[0].lat + ',' + startResponse.data[0].lon;

        // Get coordinates for the ending point
        const endResponse = await axios.get(geocodeUrl, {
            params: {
                q: endingPoint,
                format: 'json',
                addressdetails: 1,
            }
        });

        console.log('End Response:', endResponse.data); // Log the response

        if (endResponse.data.length === 0) {
            return res.status(404).send('Ending point not found');
        }

        const endLocation = endResponse.data[0].lat + ',' + endResponse.data[0].lon;

        // Send the coordinates back to the client
        res.render('index.ejs', { startLatLng: [startLocation], endLatLng: [endLocation] });
        
    } catch (error) {
        console.error('Error fetching coordinates:', error.message); // Log the error message
        res.status(500).send('Error fetching coordinates');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
