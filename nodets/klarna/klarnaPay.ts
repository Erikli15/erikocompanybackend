// Construct the order data for Klarna
export const constructOrderData = (orderData: any) => {
    return {
      purchase_country: orderData.billingCountry,
  purchase_currency: 'SEK',
  locale: 'sv-SE',
  order_amount: orderData.orderDetails.unitPrice * orderData.orderDetails.quantity,
  order_tax_amount: (orderData.orderDetails.unitPrice * orderData.orderDetails.quantity) * (orderData.orderDetails.taxRate / 100),
  order_lines: [
    {
      name: orderData.orderDetails.product,
      quantity: orderData.orderDetails.quantity,
      unit_price: orderData.orderDetails.unitPrice,
      total_amount: orderData.orderDetails.unitPrice * orderData.orderDetails.quantity,
      total_tax_amount: (orderData.orderDetails.unitPrice * orderData.orderDetails.quantity) * (orderData.orderDetails.taxRate / 100),
      tax_rate: orderData.orderDetails.taxRate * 100,
      currency: 'SEK',
    },
  ],
      merchant_urls: {
        terms: 'https://yourwebsite.com/terms',
        checkout: 'http://localhost:4200/checkout',
        confirmation: 'https://yourwebsite.com/confirmation',
        push: 'https://yourwebsite.com/push'
      },
    };
  };
