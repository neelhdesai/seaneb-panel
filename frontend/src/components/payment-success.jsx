import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const [status, setStatus] = useState("Processing...");
  const [details, setDetails] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("orderStatus"); // "PAID", "FAILED"
    const orderId = params.get("orderId");
    const referenceId = params.get("referenceId");
    const txMsg = params.get("txMsg");

    if (paymentStatus) {
      setStatus(paymentStatus === "PAID" ? "✅ Payment Successful!" : "❌ Payment Failed!");
      setDetails({ orderId, referenceId, txMsg });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">{status}</h1>

      {details.orderId && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <p>
            <strong>Order ID:</strong> {details.orderId}
          </p>
          <p>
            <strong>Reference ID:</strong> {details.referenceId}
          </p>
          <p>
            <strong>Message:</strong> {details.txMsg}
          </p>
        </div>
      )}

      <a
        href="/"
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Back to Home
      </a>
    </div>
  );
}
