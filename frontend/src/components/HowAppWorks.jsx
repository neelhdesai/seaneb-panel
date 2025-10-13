"use client";

import React, { useEffect } from "react";

const businessRegistration = [
  { description: "Business Registration", amount: "₹100", gst: "18%", total: "₹118/-" },
];

const drives = [
  { description: "Drive Purchase (Weekly)", amount: "₹250", gst: "18%", total: "₹295/-" },
  { description: "Drive Purchase (Monthly)", amount: "₹500", gst: "18%", total: "₹590/-" },
  { description: "Drive Purchase (Yearly)", amount: "₹5000", gst: "18%", total: "₹5900/-" },
];

export default function HowAppWorks() {
  // Prevent text selection and right-click
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-white shadow-lg rounded-2xl overflow-hidden relative">
        {/* Transparent overlay to block selection */}
        <div className="absolute inset-0 z-10 bg-transparent"></div>

        <div className="px-6 py-4 bg-purple-600 rounded-t-2xl relative z-20">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
            How the App Works?
          </h1>
        </div>

        <div className="px-4 sm:px-6 py-6 relative z-20">
          <p className="text-gray-700 mb-6 text-base sm:text-lg">
            All you need to know about registration and drives.
          </p>

          {/* Business Registration Section */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-4 mb-3">Business Registration</h2>
          <p className="text-gray-700 mb-4">
            Registering your business on our application by paying an onboarding fee. This process officially lists your business on the platform. You can choose any one drive and start promoting your business with offers.
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    GST
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businessRegistration.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">{item.description}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.amount}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.gst}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Drive Section */}
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mt-4 mb-3">Drive</h2>
          <p className="text-gray-700 mb-3">
            A Drive is a post (image, reel, or similar content) on the platform. Only one drive option can be chosen at a time. Each post runs for 7 days from the date of promotion. Users can promote products or services through these posts.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
            <li>Weekly Drive – 1 week = 1 post at a time</li>
            <li>Monthly Drive – 1 month = 4 posts (one post at a time)</li>
            <li>Yearly Drive – 12 months = 52 posts (one post at a time)</li>
          </ul>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    GST
                  </th>
                  <th className="px-4 py-2 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider break-words">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {drives.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900 whitespace-normal break-words">{item.description}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.amount}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.gst}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-normal">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
