export const constructOrderData = (orderData: any) => {
  let totalAmount = 0;
  let totalTaxAmount = 0;
  const orderLines: any[] = [];

  // Hantera orderlinjer
  orderData.orderDetails.forEach((orderDetail: any) => {
    const unitPriceInOre = Math.round(orderDetail.unitPrice * 100);
    const totalAmountForProduct = unitPriceInOre * orderDetail.quantity;
    const totalTaxAmountForProduct = Math.round((totalAmountForProduct * (orderDetail.taxRate / 10000)) * 100) / 100;
    totalAmount += totalAmountForProduct;
    totalTaxAmount += totalTaxAmountForProduct;

    orderLines.push({
      name: orderDetail.product,
      quantity: orderDetail.quantity,
      unit_price: unitPriceInOre,
      total_amount: totalAmountForProduct,
      total_tax_amount: totalTaxAmountForProduct,
      tax_rate: orderDetail.taxRate,
      currency: 'SEK',
      total_discount_amount: 0,
    });
  });

  const totalAmountInOre = Math.round(totalAmount);
  const totalTaxAmountInOre = Math.round(totalTaxAmount);

  // Skapa faktureringsadress
  const billingAddress = {
    given_name: orderData.name,
    street_address: orderData.streetAddress,
    postal_code: orderData.postCode,
    city: orderData.city,
    country: orderData.billingCountry
  };

  // Kontrollera om leveransadressen ska vara samma som faktureringsadressen eller olika
  const shippingAddress = orderData.useAsShippingAddress ? billingAddress : {
    given_name: orderData.name,
    street_address: orderData.shippingStreetAddress || '',
    postal_code: orderData.shippingPostCode || '',
    city: orderData.shippingCity || '',
    country: orderData.shippingCountry || ''
  };

  console.log('Shipping address:', shippingAddress); // Lägg till logg för att se resultatet

  return {
    purchase_country: 'SE',
    purchase_currency: 'SEK',
    locale: 'sv-SE',
    order_amount: totalAmountInOre,
    order_tax_amount: totalTaxAmountInOre,
    billing_address: billingAddress,
    shipping_address: shippingAddress,
    order_lines: orderLines,
    merchant_urls: {
      terms: 'https://www.example.com/terms.html',
      checkout: 'http://localhost:4200/checkout',
      confirmation: 'https://www.example.com/confirmation.html',
      push: 'https://www.example.com/api/push',
    },
  };
};












