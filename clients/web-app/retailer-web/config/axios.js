const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:8000", // KONG GATEWAY
  timeout: 10000,
  withCredentials: true,
});

module.exports = api;
