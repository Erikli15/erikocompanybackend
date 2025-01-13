import axios from 'axios';
import { constructOrderData } from './klarnaPay'; // Import the logic to create the order data
import dotenv from 'dotenv';
import { response } from 'express';

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
    const orderPayload = constructOrderData(orderData);    
    console.log('Order Payload:', orderPayload); // Log the payload for debugging

    const response = await axios.post<KlarnaOrderResponse>(klarnaApiUrl, orderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'klarna-correlation-id': klarnaCorrelationId,
        'Authorization': `Basic ${Buffer.from(`${klarnaApiKey}:`).toString('base64')}`
      }
    });

    console.log('Klarna API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Klarna API Error:', error.response?.data || error.message); // Log detailed error
    throw new Error('Failed to create Klarna order');
  }
};

