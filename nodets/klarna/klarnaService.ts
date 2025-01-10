import axios from 'axios';
import { constructOrderData } from './klarnaPay'; // Import the logic to create the order data
import dotenv from 'dotenv';

dotenv.config();


interface KlarnaOrderResponse {
  order_id: string;
  html_snippet: string;
}

const klarnaApiUrl = 'https://api.playground.klarna.com/checkout/v3/orders';
const klarnaCorrelationId = process.env.KLARNA_USER || "";
const klarnaApiKey = process.env.KLARNA_API_KEY || "";
// Function to create an order with Klarna API
export const createKlarnaOrder = async (orderData: any) => {
  try {
      // Ensure orderData includes orderId and other necessary data
      const orderPayload = constructOrderData(orderData); // Get the order payload to send to Klarna
      const response = await axios.post<KlarnaOrderResponse>(klarnaApiUrl, orderPayload, {
        headers: {
          'Content-Type': 'application/json',
          'klarna-correlation-id': klarnaCorrelationId,
          'Authorization': `Basic ${Buffer.from(`${klarnaApiKey}:`).toString('base64')}`
        }
      });
      console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error with Klarna API:', error);
      throw new Error('Failed to create Klarna order');
  }
};

