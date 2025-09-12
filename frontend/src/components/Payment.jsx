import { useEffect } from "react";

export default function CashfreePayment() {
    useEffect(() => {
        // Load Cashfree SDK
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/ui/2.0.0/cashfree.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const initiatePayment = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/test/create-order`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: 10, currency: "INR" }),
                }
            );

            const data = await response.json();

            if (data?.payment_session_id) {
                const cashfree = new window.Cashfree(data.payment_session_id);
                cashfree.redirect();
            } else {
                alert("Error creating Cashfree order");
            }
        } catch (error) {
            console.error(error);
            alert("Payment failed to start");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-xl font-bold mb-4">Amount: ₹10</h2>
            <button
                onClick={initiatePayment}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                Pay Now
            </button>
        </div>
    );
}
