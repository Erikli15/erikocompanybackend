import {KlarnaResponse, orderRequest} from './klarnaService';
import dotenv from 'dotenv';

dotenv.config();

const API_KLARNA = process.env.KLARNA_API_KEY || 'default_secret_key';
const KLARNA_USER = process.env.KLARNA_USER || 'default_user';
  export const basicAuth = Buffer.from(`${KLARNA_USER}:${API_KLARNA}`).toString('base64');

let sessionId: string | undefined;

axios.post<KlarnaResponse>('https://api.playground.klarna.com/payments/v1/sessions', orderRequest, {
  headers: {
    'Authorization': `Basic ${basicAuth}` // Använd Basic Auth
  }
})
  .then(response => {
    if (response.data && response.data.session_id) {
      sessionId = response.data.session_id;
      console.log('Session ID:', sessionId);

      // Gör en GET-begäran med sessionId här
      return axios.get<KlarnaResponse>(`https://api.playground.klarna.com/payments/v1/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Basic ${basicAuth}`
        }
      });
    } else {
      console.log("session_id finns inte i response.data");
    }
  })
  .then(response => {
    if (response) {
      console.log(response.data);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });