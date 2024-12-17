import axios from 'axios';

interface OrderPayload {
    orderId: string;
    customerName: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    totalAmount: number;
}

interface KlarnaPaymentRequest {
    client_id: string;
    collect_shipping_address: boolean;
    payload: OrderPayload;  // Define the structure for your order payload
}

interface KlarnaAuthorizationResponse {
    authorization_token: string;
}

class KlarnaService {
    private clientId: string;

    constructor(clientId: string) {
        this.clientId = clientId;
    }

    public async authorizePayment(request: KlarnaPaymentRequest): Promise<KlarnaAuthorizationResponse> {
        try {
            // Call Klarna API with axios
            const response = await axios.post<KlarnaAuthorizationResponse>(
                'https://api.playground.klarna.com/payments/authorize', 
                {
                    client_id: request.client_id,
                    collect_shipping_address: request.collect_shipping_address,
                    payload: request.payload,  // Send the order payload
                }
            );

            // Return authorization_token from Klarna API
            return response.data;
        } catch (error: any) {
            throw new Error(`Klarna payment authorization failed: ${error.message}`);
        }
    }
}

export default KlarnaService;
  