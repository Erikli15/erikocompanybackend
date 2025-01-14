export const constructOrderData = (orderData: any) => {
  let totalAmount = 0; // Initialize total amount (without tax)
  let totalTaxAmount = 0; // Initialize total tax amount
  const orderLines: any[] = []; // Initialize an array to hold order lines

  // Iterate through each order detail to process product information
  orderData.orderDetails.forEach((orderDetail: any) => {
    const unitPriceInOre = Math.round(orderDetail.unitPrice * 100); // Convert unit price to "ore" (1 SEK = 100 ore)
    const totalAmountForProduct = unitPriceInOre * orderDetail.quantity; // Calculate the total amount for the product (without tax)
    const totalTaxAmountForProduct = Math.round((totalAmountForProduct * (orderDetail.taxRate / 10000)) * 100) / 100; // Calculate the total tax amount for the product
    totalAmount += totalAmountForProduct; // Add the product's total amount to the overall total
    totalTaxAmount += totalTaxAmountForProduct; // Add the product's tax amount to the overall tax total

    // Push the details for the current product (order line) to the orderLines array
    orderLines.push({
      name: orderDetail.product, // Product name
      quantity: orderDetail.quantity, // Product quantity
      unit_price: unitPriceInOre, // Product unit price (in ore)
      total_amount: totalAmountForProduct, // Product total amount (without tax)
      total_tax_amount: totalTaxAmountForProduct, // Product total tax amount
      tax_rate: orderDetail.taxRate, // Tax rate for the product
      currency: 'SEK', // Currency is SEK (Swedish Krona)
      total_discount_amount: 0, // No discount applied for now
    });
  });

  // Convert the total amounts (including tax) to "ore" (smallest unit of SEK)
  const totalAmountInOre = Math.round(totalAmount);
  const totalTaxAmountInOre = Math.round(totalTaxAmount);

  // Create the billing address object with the provided data
  const billingAddress = {
    given_name: orderData.name, // Customer's full name
    street_address: orderData.streetAddress, // Customer's street address
    postal_code: orderData.postCode, // Customer's postal code
    city: orderData.city, // Customer's city
    country: orderData.billingCountry, // Customer's billing country
  };

  // Determine the shipping address: if the customer wants to use the billing address for shipping, use it; otherwise, use the provided shipping address
  const shippingAddress = orderData.useAsShippingAddress ? billingAddress : {
    given_name: orderData.name, // Customer's full name
    street_address: orderData.shippingStreetAddress || '', // Customer's shipping street address (defaults to empty if not provided)
    postal_code: orderData.shippingPostCode || '', // Customer's shipping postal code (defaults to empty if not provided)
    city: orderData.shippingCity || '', // Customer's shipping city (defaults to empty if not provided)
    country: orderData.shippingCountry || '', // Customer's shipping country (defaults to empty if not provided)
  };

  console.log('Shipping address:', shippingAddress); // Log the final shipping address

  // Return the constructed order data object
  return {
    purchase_country: 'SE', // Country where the purchase is made (Sweden)
    purchase_currency: 'SEK', // Currency for the purchase (SEK)
    locale: 'sv-SE', // Locale (Swedish)
    order_amount: totalAmountInOre, // Total amount of the order (in ore)
    order_tax_amount: totalTaxAmountInOre, // Total tax amount of the order (in ore)
    billing_address: billingAddress, // Billing address details
    shipping_address: shippingAddress, // Shipping address details
    order_lines: orderLines, // List of order lines (product details)
    merchant_urls: {
      terms: 'https://www.example.com/terms.html', // URL for terms and conditions
      checkout: 'http://localhost:4200/checkout', // URL for checkout page
      confirmation: 'https://www.example.com/confirmation.html', // URL for confirmation page
      push: 'https://www.example.com/api/push', // URL for push notifications API
    },
  };
};













