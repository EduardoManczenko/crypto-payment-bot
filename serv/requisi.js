const axios = require('axios');

const url = 'http://localhost:3000/checkDeposit';
const hash = '0xf60595ea1b07dc12286c0239bd3f1cab3cc1f76ae5bce87e9e0170d7dd99e080';
const buyer = '0xea124eCB924B4A789c8e7d8C2782d0564968c883';
const telegramId = "12312"
const value = "123000000000000000000";

const requestData = { params: { hash, buyer, value, telegramId } };

axios.get(url, requestData)
  .then(response => {
    const result = response.data; // assuming the server responds with JSON
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });