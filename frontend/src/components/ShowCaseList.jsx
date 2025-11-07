import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const BusinessShowcasePage = () => {
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promoting, setPromoting] = useState(null);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                if (!token) {
                    console.warn("No auth token in localStorage");
                    return;
                }
                const res = await axios.get(
                    "https://api.seaneb.com/api/mobile/get-business-list",
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // keep extra fields you may need later
                const opts = (res.data?.data || []).map((b) => ({
                    value: b.u_id,
                    label: `${b.business_name} (${b.area || b.city || "N/A"})`,
                    // extras for promote
                    city: b.city,
                    area: b.area,
                    business_category: b.business_category,
                }));

                setBusinesses(opts);
            } catch (err) {
                console.error("Error fetching businesses:", err?.response?.data || err);
            }
        };

        fetchBusinesses();
    }, [token]);

    const fetchShowcases = async (u_id) => {
        if (!u_id) return;
        if (!token) {
            setMessage("⚠️ You are not logged in.");
            return;
        }

        setLoading(true);
        setShowcases([]);
        setMessage("");

        try {
            const url = `https://api.seaneb.com/api/mobile/showcase-cursor-list/${u_id}`;
            console.log("GET", url, { limit: 10 });

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 10 },
            });

            console.log("Showcase API response:", res.data);

            // expected server format (from your backend): { data: { data: [...] , next_cursor } }
            const list = res?.data?.data?.data ?? [];

            // If backend returns 202 with no data, show the message it sent
            if ((res.status === 202 || res?.data?.statusCode === 202) && list.length === 0) {
                setShowcases([]);
                setMessage(res?.data?.message || "No showcases found for this business.");
                return;
            }

            setShowcases(list);
        } catch (err) {
            console.error("Error fetching showcases:", err?.response?.data || err);
            const serverMsg = err?.response?.data?.message;
            setMessage(`❌ Failed to load showcases${serverMsg ? `: ${serverMsg}` : ""}.`);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "https://via.placeholder.com/400x250?text=No+Image";

        if (url.startsWith("/")) url = url.slice(1);
        if (!url.startsWith("http")) {
            url = `https://seaneb.blr1.cdn.digitaloceanspaces.com/${url}`;
        }
        if (!url.includes("-300x300")) {
            url = url.replace(/(\.[a-zA-Z]+)$/, "-300x300$1");
        }

        return url;
    };

    const handlePromote = async (showcase_u_id) => {
        if (!showcase_u_id || !selectedBusiness?.value) {
            setMessage("⚠️ Please select a business first.");
            return;
        }

        const business = businesses.find(b => b.value === selectedBusiness.value);
        setPromoting(showcase_u_id);
        setMessage("");

        try {
            const payload = {
                business_u_id: selectedBusiness.value,
                showcase_u_id,
                city: business?.city || "unknown",
                area: business?.area || "unknown",
                business_category: business?.business_category || "general",
            };

            console.log("📤 Payload sent to promote API:", payload);

            const res = await axios.post(
                "https://api.seaneb.com/api/mobile/promote-showcase",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("📥 API Response:", res.data);

            if (res.data?.status || res.data?.success) {
                setMessage("✅ Showcase promoted successfully!");
            } else {
                setMessage(`⚠️ Promotion failed: ${res.data?.message || "Unknown issue"}`);
            }
        } catch (err) {
            console.error("❌ Error promoting showcase:", err);

            if (err.response) {
                const status = err.response.status;
                const serverMsg = err.response.data?.message || "Unknown server error.";

                // Friendly, formatted error handling
                if (status === 406) {
                    setMessage(`❌ ${serverMsg || "You do not have any Promotion Drive left. Subscribe to a new Promotion Drive."}`);
                } else if (status === 401) {
                    setMessage("⚠️ Unauthorized: Please log in again.");
                } else if (status === 400) {
                    setMessage(`⚠️ Bad Request: ${serverMsg}`);
                } else if (status >= 500) {
                    setMessage(`❌ Server Error (${status}): Please try again later.`);
                } else {
                    setMessage(`⚠️ Error (${status}): ${serverMsg}`);
                }
            } else if (err.request) {
                setMessage("⚠️ No response from server. Please check your internet connection.");
            } else {
                setMessage("❌ Unexpected error occurred while promoting showcase.");
            }
        } finally {
            setPromoting(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
                    🎬 Business Showcases
                </h2>


                <div className="mb-6">
                    <label className="block font-medium text-gray-700 mb-2">
                        Select Business
                    </label>
                    <Select
                        options={businesses}
                        onChange={(opt) => {
                            setSelectedBusiness(opt);
                            fetchShowcases(opt?.value);
                        }}
                        placeholder="Search and select a business..."
                        isClearable
                    />
                </div>

                {/* 🔹 Showcase List */}
                {loading ? (
                    <p className="text-center text-gray-500">Loading showcases...</p>
                ) : showcases.length === 0 ? (
                    <p className="text-center text-gray-400">
                        No showcases found for this business.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {showcases.map((showcase) => (
                            <div
                                key={showcase.u_id}
                                className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="relative">
                                    {showcase.type === "video" ? (
                                        <video
                                            src={`https://seaneb.blr1.cdn.digitaloceanspaces.com/${showcase.media_url}`} controls
                                            className="w-full h-64 object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={getImageUrl(showcase.media_url)}
                                            alt={showcase.description || "Showcase"}
                                            className="w-full h-64 object-cover rounded-lg"
                                            onError={(e) => {
                                                console.error("❌ Image failed to load:", e.target.src);
                                              
                                                const original = e.target.src.replace("-300x300", "");
                                                if (original !== e.target.src) {
                                                    console.log("🔄 Trying original image:", original);
                                                    e.target.src = original;
                                                } else {
                                                    e.target.src = "https://via.placeholder.com/400x250?text=Image+not+found";
                                                }
                                            }}
                                        />

                                    )}
                                </div>


                                <div className="p-4">
                                    <p className="text-gray-700 text-sm mb-3">
                                        {showcase.description || "No description provided."}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            Likes: {showcase.like_count || 0} | Comments:{" "}
                                            {showcase.comment_count || 0}
                                        </span>
                                        <button
                                            onClick={() => handlePromote(showcase.u_id)}
                                            disabled={promoting === showcase.u_id}
                                            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold ${promoting === showcase.u_id
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700"
                                                }`}
                                        >
                                            {promoting === showcase.u_id
                                                ? "Promoting..."
                                                : "Promote"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 🔹 Message */}
                {message && (
                    <p
                        className={`mt-8 text-center font-medium ${message.startsWith("✅")
                            ? "text-green-600"
                            : message.startsWith("⚠️")
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default BusinessShowcasePage;
