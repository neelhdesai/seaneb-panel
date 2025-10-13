const commissionData = [
    { category: "Food & Restaurant", businessReg: "50%", drivePurchase: "40%" },
    { category: "Clothing & Fashion", businessReg: "60%", drivePurchase: "50%" },
    { category: "Electronic & Mobile Shop", businessReg: "70%", drivePurchase: "48%" },
    { category: "Salons, Beauty Parlour & Fitness", businessReg: "50%", drivePurchase: "40%" },
    { category: "Jewellery, Furniture, Real Estate etc. High Volume Business", businessReg: "80%", drivePurchase: "20%" },
    { category: "Other", businessReg: "30%", drivePurchase: "15%" },
];

export default function CommissionTable() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-3 sm:py-8 sm:px-6 lg:px-10">
            <div className="w-full max-w-6xl bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 bg-purple-600 rounded-t-2xl text-center">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white">
                        Payout Structure
                    </h1>
                </div>
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 text-xs sm:text-sm md:text-base">
                    ⚠️ This Payout Structure is valid for 6 months, effective from 1st October 2025.
                </div>
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 sm:px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider w-1/2">
                                    Category
                                </th>
                                <th className="px-3 sm:px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                    Business Registration
                                </th>
                                <th className="px-3 sm:px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                                    Drive Purchase
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {commissionData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="px-3 sm:px-6 py-2 text-gray-900 break-words">
                                        {item.category}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 text-gray-700 whitespace-nowrap">
                                        {item.businessReg || "-"}
                                    </td>
                                    <td className="px-3 sm:px-6 py-2 text-gray-700 whitespace-nowrap">
                                        {item.drivePurchase || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 sm:px-6 py-5 mt-6 bg-gray-50 border-t border-gray-200 text-gray-700 text-xs sm:text-sm md:text-base rounded-b-2xl">
                    <h3 className="font-semibold text-base sm:text-lg md:text-xl text-gray-900 mb-3 flex items-center">
                        📄 <span className="ml-2">Terms & Conditions</span>
                    </h3>

                    <ol className="list-decimal pl-5 space-y-3 leading-relaxed">
                        <li>
                            <span className="font-medium text-gray-900">Payout Cycle:</span> Payouts for
                            <span className="font-medium"> Business Registration </span> and
                            <span className="font-medium"> Drive Purchase </span> are processed on a
                            <span className="font-medium"> monthly basis </span> after successful verification.
                        </li>

                        <li>
                            <span className="font-medium text-gray-900">Business Month Definition: </span>
                            Business month follows the
                            <span className="font-medium"> calendar month</span>.
                            <div className="mt-1 pl-3 text-gray-600 text-sm sm:text-base">
                                Example:
                                <br />– Consultant A joins on <span className="font-medium">1st October 2025</span>, their business month is <span className="font-medium">1st–31st October 2025</span>.
                                <br />– Consultant B joins on <span className="font-medium">25th October 2025</span>, their business month is also <span className="font-medium">1st–31st October 2025</span>.
                            </div>
                        </li>

                        <li>
                            <span className="font-medium text-gray-900">Payout Release Date:</span>
                            <span className="font-medium"> 7th Date of the Next Business Month</span>,
                            except on <span className="italic">holidays, Saturdays, and Sundays</span>.
                        </li>

                        <li>
                            <span className="font-medium text-gray-900">Account Inactivity:</span>
                            An account will be marked as <span className="font-medium">inactive</span> if:
                            <ul className="list-disc pl-6 mt-2 space-y-1">
                                <li>No business is registered within <span className="font-medium">3 months of joining</span>.</li>
                                <li>No business registration or Drive Purchase activity occurs for any <span className="font-medium">consecutive 3-month period</span>.</li>
                            </ul>
                            <p className="mt-2 text-gray-600 text-sm sm:text-base">
                                <span className="italic font-semibold">Note:</span> Payouts will only be released if at least one <span className="font-medium">Drive Purchase</span> occurs during the active period.
                            </p>
                            <div className="mt-2 text-gray-600 text-sm sm:text-base mt-5">
                                <p className="text-center">
                                    All activities are subject to Anand jurisdiction. Terms & conditions apply.
                                </p>
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
