const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Middleware to get the client's IP address from ifconfig.me
app.use(async (req, res, next) => {
  try {
    // Fetch the client's public IP address using ifconfig.me
    const ipResponse = await axios.get('https://ifconfig.me');
    const ip_address = ipResponse.data.trim(); // Clean up the IP address

    // Store the IP address in the request object
    req.ip_address = ip_address;
    console.log(`Fetched IP Address: ${ip_address}`);
  } catch (error) {
    console.error('Error fetching IP address:', error.message);
    req.ip_address = 'Unknown'; // Fallback IP address
  }
  next();
});

app.get('/', async (req, res) => {
  const ip_address = req.ip_address;

  // Get the IPinfo token from environment variables
  const ipinfoToken = process.env.IPINFO_TOKEN;

  // Construct the URL for IPinfo API
  const ipinfoUrl = `http://ipinfo.io/${ip_address}?token=${ipinfoToken}`;
  console.log(`IPinfo API URL: ${ipinfoUrl}`);

  try {
    // Make request to IPinfo API
    const response = await axios.get(ipinfoUrl);
    const geo = response.data;

    // Log the full API response
    console.log('IPinfo API Response:', geo);

    // Construct location string
    const location = `${geo.city || 'Unknown'}, ${geo.region || 'Unknown'}, ${geo.country || 'Unknown'}`;

    // Send the response to the client
    res.send(`
      <h1>Location and IP Information</h1>
      <p><strong>IP Address:</strong> ${ip_address}</p>
      <p><strong>Location:</strong> ${location}</p>
    `);
  } catch (error) {
    // Log error details
    console.error('Error fetching IP info:', error.message);
    res.status(500).send('An error occurred while fetching IP information.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
