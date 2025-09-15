import { useState, useEffect } from "react";



export default function CashfreePayment({ amount = 10, currency = "INR" }) {

  const [loading, setLoading] = useState(false);

  const [sdkReady, setSdkReady] = useState(false);



  // Check if Cashfree SDK is loaded

  useEffect(() => {

    const timer = setInterval(() => {

      if (window.Cashfree) {

        setSdkReady(true);

        clearInterval(timer);

      }

    }, 100);

    return () => clearInterval(timer);

  }, []);



  const initiatePayment = async () => {

    if (!sdkReady) {

      alert("Cashfree SDK is not ready yet");

      return;

    }



    setLoading(true);

    try {

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`, {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ amount, currency }),

      });



      const data = await res.json();



      if (!data.payment_session_id || !data.order_id) {

        alert("Failed to create order");

        setLoading(false);

        return;

      }



      // Use Cashfree JS SDK for checkout

      window.Cashfree.checkout({

        orderId: data.order_id,

        sessionId: data.payment_session_id,

        environment: import.meta.env.VITE_CASHFREE_ENV || "sandbox",

      });

    } catch (err) {

      console.error(err);

      alert("Payment initiation failed");

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

          loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"

        }`}

      >

        {loading ? "Processing..." : "Pay Now"}

      </button>

    </div>

  );

}

