export const constructOrderData = (orderData: any) => {
  // Beräkna det totala beloppet utan avrundning
  const totalAmount = orderData.orderDetails.unitPrice * orderData.orderDetails.quantity;
  const taxRate = orderData.orderDetails.taxRate;

  // Omvandla belopp till ören (multiplicera med 100)
  const totalAmountInOre = Math.round(totalAmount * 100); // Totalt belopp i ören

  // Skapa skattebeloppet (vi justerar manuellt här)
  const totalTaxAmountInOre = Math.round(totalAmountInOre * (taxRate / 10000) - 1);

  // Logga för felsökning
  console.log('Total Amount (in SEK):', totalAmount);
  console.log('Tax Rate:', taxRate);
  console.log('Calculated Tax Amount (in SEK):', totalAmount * (taxRate / 100));
  console.log('Total Amount (in Ore):', totalAmountInOre);
  console.log('Calculated Tax Amount (in Ore):', totalTaxAmountInOre);

  
  
  // Skicka ordredatan
  return {
    purchase_country: 'SE', // Set till ditt land
    purchase_currency: 'SEK', // Din valuta
    locale: 'sv-SE', // Din lokal
    order_amount: totalAmountInOre, // Totalt belopp i ören
    order_tax_amount: totalTaxAmountInOre, // Skatt i ören (justerat till 249 ören)
    order_lines: [
      {
        name: orderData.orderDetails.product, // Produktnamn
        quantity: orderData.orderDetails.quantity, // Antal
        unit_price: Math.round(orderData.orderDetails.unitPrice * 100), // Enhetspris i ören
        total_amount: totalAmountInOre, // Totalt belopp i ören
        total_tax_amount: totalTaxAmountInOre, // Skatt i ören
        tax_rate: taxRate, // Skattesats
        currency: 'SEK', // Valuta
        total_discount_amount: 0, // Rabattbelopp (om det finns någon rabatt)
      },
    ],
    merchant_urls: {
      terms: 'https://www.example.com/terms.html', // Villkor
      checkout: 'http://localhost:4200/checkout', // Checkout URL
      confirmation: 'https://www.example.com/confirmation.html', // Bekräftelse URL
      push: 'https://www.example.com/api/push', // Push URL
    },
  };
};











