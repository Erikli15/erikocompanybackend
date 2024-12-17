

interface OrderLine {
    type: string;
    reference: string;
    name: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    total_amount: number;
    total_discount_amount: number;
    total_tax_amount: number;
    image_url: string;
    product_url: string;
  }
  
  interface MerchantUrls {
    authorization: string;
  }
  
  interface OrderRequest {
    acquiring_channel: string;
    intent: string;
    purchase_country: string;
    purchase_currency: string;
    locale: string;
    order_amount: number;
    order_tax_amount: number;
    order_lines: OrderLine[];
    merchant_urls: MerchantUrls;
  }
  
  export interface KlarnaResponse {
    session_id?: string; // Gör den valfri med '?'
    // Lägg till andra fält som kan finnas i svaret om det behövs
  }
  
    
  export const orderRequest: OrderRequest = {
    acquiring_channel: "ECOMMERCE",
    intent: "buy",
    purchase_country: "SE",
    purchase_currency: "SEK",
    locale: "en-SE",
    order_amount: 9500,
    order_tax_amount: 1900,
    order_lines: [
      {
        type: "physical",
        reference: "19-402",
        name: "Battery Power Pack",
        quantity: 1,
        unit_price: 10000,
        tax_rate: 2500,
        total_amount: 9500,
        total_discount_amount: 500,
        total_tax_amount: 1900,
        image_url: "https://www.exampleobjects.com/logo.png",
        product_url: "https://www.estore.com/products/f2a8d7e34"
      }
    ],
    merchant_urls: {
      authorization: "https://example.com/authorization_callbacks"
    }
  };
  