const axios = require("axios");

const api = axios.create({
<<<<<<< HEAD
  baseURL: process.env.API_GATEWAY_BASE_URL, // KONG GATEWAY
  timeout: 10000,
=======
  baseURL: "http://localhost:8000", // KONG GATEWAY
  timeout: 10000,
  withCredentials: true,
>>>>>>> 49ae5ee44aadfe2a1938c9fc96614371b4fbff2d
});

module.exports = api;
