"use client";

import React, { useEffect } from "react";

// Drive Plans including 1 Drive
const drivePlans = [
  {
    title: "25 Drives",
    original: "₹6250",
    price: "₹4375",
    savings: "30% Savings",
  },
  {
    title: "10 Drives",
    original: "₹2500",
    price: "₹2000",
    savings: "20% Savings",
  },
  {
    title: "5 Drives",
    original: "₹1250",
    price: "₹1125",
    savings: "10% Savings",
  },
  {
    title: "1 Drive",
    original: null, // no original price
    price: "₹250",
    savings: "No Savings",
  },
];

// Simple rate table
const driveRates = [
  { description: "1 Drive", amount: "₹250", gst: "18%", total: "₹295" },
  { description: "5 Drives", amount: "₹1125", gst: "18%", total: "₹1327.50" },
  { description: "10 Drives", amount: "₹2000", gst: "18%", total: "₹2360" },
  { description: "25 Drives", amount: "₹4375", gst: "18%", total: "₹5162.50" },
];

export default function HowAppWorks() {
  // Disable right-click & text selection
  useEffect(() => {
    const stop = (e) => e.preventDefault();
    document.addEventListener("contextmenu", stop);
    document.addEventListener("selectstart", stop);
    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("selectstart", stop);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white shadow-lg rounded-2xl overflow-hidden relative">

        {/* block selection */}
        <div className="absolute inset-0 z-10 bg-transparent"></div>

        <div className="px-6 py-4 bg-purple-600 rounded-t-2xl relative z-20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            How the App Works?
          </h1>
        </div>

        <div className="px-4 sm:px-6 py-6 relative z-20">

          {/* Intro text */}
          <p className="text-gray-700 mb-6 text-lg">
            Choose the best drive package to promote your business. Each drive stays active for 7 days.
          </p>

          {/* Drive Packs */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Available Drive Packs</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {drivePlans.map((plan, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold">{plan.title}</h3>

                {/* show old price only if exists */}
                {plan.original && (
                  <p className="text-sm text-gray-500 line-through">{plan.original}</p>
                )}

                <p className="text-2xl font-bold text-purple-600">{plan.price}</p>
                <p className="text-green-600 text-sm mt-1">{plan.savings}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <p className="text-gray-700 mb-3">
            Every drive is a promotional post (image or video) visible for 7 days.
          </p>

          <ul className="list-disc pl-5 mb-6 text-gray-700 space-y-1">
            <li>1 Drive = 1 week promotion</li>
            <li>5 / 10 / 25 Drives = bulk option for savings</li>
            <li>Only one drive runs at a time</li>
          </ul>

          {/* GST Table */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Drive Pricing with GST</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500 uppercase text-sm">Description</th>
                  <th className="px-4 py-2 text-left text-gray-500 uppercase text-sm">Amount</th>
                  <th className="px-4 py-2 text-left text-gray-500 uppercase text-sm">GST</th>
                  <th className="px-4 py-2 text-left text-gray-500 uppercase text-sm">Total</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {driveRates.map((row, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{row.description}</td>
                    <td className="px-4 py-2">{row.amount}</td>
                    <td className="px-4 py-2">{row.gst}</td>
                    <td className="px-4 py-2 font-semibold">{row.total}</td>
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
