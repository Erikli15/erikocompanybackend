import axios from 'axios';  // Importing axios for making HTTP requests
import { constructOrderData } from './klarnaPay';  // Importing a function that constructs the order data
import dotenv from 'dotenv';  // Importing dotenv to load environment variables

dotenv.config();  // Loading environment variables from a .env file

// Defining the interface for the Klarna API response structure
interface KlarnaOrderResponse {
  order_id: string;  // The order ID returned from Klarna
  html_snippet: string;  // HTML snippet for the Klarna payment widget
}

// Defining the Klarna API URL and loading API keys from environment variables
const klarnaApiUrl = 'https://api.playground.klarna.com/checkout/v3/orders';  // Klarna API URL for creating orders
const klarnaCorrelationId = process.env.KLARNA_USER || "";  // User-specific correlation ID from the environment
const klarnaApiKey = process.env.KLARNA_API_KEY || "";  // API key from the environment

// Function to create an order with Klarna API
export const createKlarnaOrder = async (orderData: any) => {
  try {
    // Constructing the order payload using the provided order data
    const orderPayload = constructOrderData(orderData);    
    console.log('Order Payload:', orderPayload);  // Logging the order payload for debugging

    // Making the POST request to Klarna's API with the constructed order data
    const response = await axios.post<KlarnaOrderResponse>(klarnaApiUrl, orderPayload, {
      headers: {
        'Content-Type': 'application/json',  // Indicating the request content type
        'klarna-correlation-id': klarnaCorrelationId,  // Including the correlation ID for tracking the request
        'Authorization': `Basic ${Buffer.from(`${klarnaApiKey}:`).toString('base64')}`  // Basic authentication with the API key
      }
    });

    // Logging the response from Klarna API for debugging
    console.log('Klarna API Response:', response.data);
    return response.data;  // Returning the Klarna API response
  } catch (error: any) {
    // Handling errors and logging the error message or response data
    console.error('Klarna API Error:', error.response?.data || error.message);
    throw new Error('Failed to create Klarna order');  // Throwing an error if the API call fails
  }
};


