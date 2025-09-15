import { useState } from 'react';

export default function CashfreePayment({ amount = 10, currency = 'INR' }) {
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    console.log('💡 Initiating payment...', { amount, currency });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency }),
        }
      );
      const data = await response.json();
      console.log('🔹 Backend response:', data);

      if (!data?.payment_session_id || !data?.order_id) {
        console.error('❌ Invalid session or order ID');
        alert('Error creating Cashfree order');
        return;
      }

      console.log('➡️ Redirecting to Cashfree Hosted Checkout...');
      const checkoutUrl = `https://prod.cashfree.com/pg/orders/${data.order_id}?payment_session_id=${data.payment_session_id}`;
      console.log('🌐 Redirect URL:', checkoutUrl);

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('❌ Payment initiation failed:', error);
      alert('Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Amount: ₹{amount}</h2>
      <button
        onClick={initiatePayment}
        disabled={loading}
        className={`px-6 py-2 rounded-lg text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
