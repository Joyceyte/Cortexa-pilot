import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const AUTH_TOKEN = process.env.BLANDY_API_AUTHORIZATION;
const PATHWAY_ID = process.env.BLANDY_PATHWAY_ID;
const TEST_PHONE_NUMBER = '+61435535896';

const options = {
  method: 'POST',
  headers: {
    authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone_number: TEST_PHONE_NUMBER,
    pathway_id: PATHWAY_ID,
  }),
};

fetch('https://api.bland.ai/v1/calls', options)
  .then(res => res.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
