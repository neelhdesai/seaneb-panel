import React, { useEffect, useState } from "react";
import axios from "axios";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

import { Line, Bar, Pie } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

// Lucide Icons (Corporate Set)
import {
    Users,
    Building2,
    TrendingUp,
    MapPin,
    ListChecks,
} from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    TimeScale,
    Title,
    Tooltip,
    Legend
);

const DashboardKPI = () => {
    const [kpi, setKpi] = useState(null);
    const [loading, setLoading] = useState(true);

    const [timeFilter, setTimeFilter] = useState("1");
    const [selectedCity, setSelectedCity] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchKPI = async () => {
            try {
                const res = await axios.get("https://api.seaneb.com/admin/dashboard-kpi", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setKpi(res.data?.data);
                setLoading(false);
            } catch (error) {
                console.error("KPI Fetch Error:", error);
                setLoading(false);
            }
        };

        fetchKPI();
    }, []);

    if (loading)
        return (
            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>
                ))}
            </div>
        );

    if (!kpi)
        return <div className="text-center text-slate-500 p-4">Failed to load data</div>;

    // ---------------- KPI CARD (Corporate style) ----------------
    const KPI = ({ title, value, icon: Icon }) => (
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500">{title}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl">
                    <Icon className="text-slate-700" size={22} />
                </div>
            </div>
        </div>
    );

    // ---------------- Line Chart Filter ----------------
    const monthsLimit = Number(timeFilter);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsLimit);

    const filteredLineData = kpi.business_created_by_date.filter((d) => {
        const entryDate = new Date(`${d.date}T00:00:00`); // FIX
        return entryDate >= cutoffDate;
    });


    const lineData = {
        labels: filteredLineData.map((d) => d.date),
        datasets: [
            {
                label: "Businesses Created",
                data: filteredLineData.map((d) => Number(d.count)),
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14,165,233,0.18)",
                fill: true,
                tension: 0.35,

                pointRadius: 0,
                pointHoverRadius: 0,
            },
        ],
    };

    const barData = {
        labels: kpi.top_cities.map((c) => c.city),
        datasets: [
            {
                label: "Businesses",
                data: kpi.top_cities.map((c) => Number(c.count)),
                backgroundColor: "#6366f1",
            },
        ],
    };

    // ---------------- Top 10 Categories ----------------
    const top10Categories = kpi.top_categories.slice(0, 10);

    const pieData = {
        labels: top10Categories.map((c) => c.business_category),
        datasets: [
            {
                data: top10Categories.map((c) => Number(c.count)),
                backgroundColor: [
                    "#6366f1",
                    "#0ea5e9",
                    "#22c55e",
                    "#f97316",
                    "#ef4444",
                    "#a855f7",
                    "#14b8a6",
                    "#eab308",
                    "#f43f5e",
                    "#475569",
                ],
            },
        ],
    };

    return (
        <div className="p-6 space-y-10 bg-slate-50 min-h-screen">

            {/* TITLE */}
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>

            {/* TOP KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPI title="Total Users" value={kpi.total_users} icon={Users} />
                <KPI title="Total Businesses" value={kpi.total_businesses} icon={Building2} />
                <KPI title="Cities" value={kpi.city_wise_count.length} icon={MapPin} />
            </div>

            {/* SECOND KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPI title="New Today" value={kpi.new_businesses_today} icon={TrendingUp} />
                <KPI title="Last 1 Month" value={kpi.new_businesses_last_1_month} icon={TrendingUp} />
                <KPI title="Last 3 Months" value={kpi.new_businesses_last_3_months} icon={TrendingUp} />
            </div>

            {/* TIME FILTER */}
            <div className="flex justify-end">
                <select
                    className="px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                >
                    <option value="1">Last 1 Month</option>
                    <option value="3">Last 3 Months</option>
                    <option value="6">Last 6 Months</option>
                </select>
            </div>

            {/* FULL WIDTH LINE CHART */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Businesses Created Over Time
                </h3>
                <div className="h-[420px] w-full">
                    <Line
                        data={lineData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                        }}
                    />
                </div>
            </div>

            {/* BAR + PIE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Top Cities</h3>
                    <div className="h-72">
                        <Bar data={barData} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Top 10 Categories</h3>
                    <div className="h-72">
                        <Pie data={pieData} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Citywise Breakdown</h3>

                    <select
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white shadow-sm"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        {kpi.city_wise_count.map((c, i) => (
                            <option key={i} value={c.city}>
                                {c.city}
                            </option>
                        ))}
                    </select>
                </div>

                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-100">
                            <th className="px-3 py-3 text-left text-slate-600">City</th>
                            <th className="px-3 py-3 text-left text-slate-600">Businesses</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(selectedCity
                            ? kpi.city_wise_count.filter((c) => c.city === selectedCity)
                            : kpi.city_wise_count
                        ).map((row, i) => (
                            <tr key={i} className="border-b">
                                <td className="px-3 py-3">{row.city}</td>
                                <td className="px-3 py-3">{row.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default DashboardKPI;
