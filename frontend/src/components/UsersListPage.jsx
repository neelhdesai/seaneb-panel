import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [pageInfo, setPageInfo] = useState({
        page: 1,
        pages: 1,
        limit: 20,
    });

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [sortBy, setSortBy] = useState("");

    const token = localStorage.getItem("token");

    const safe = (v) => (v && v !== "" ? v : "N/A");

    // Extract category list
    const categoryList = useMemo(() => {
        const arr = originalUsers
            .map((u) => u.businesses?.[0]?.business_category)
            .filter(Boolean);
        return [...new Set(arr)];
    }, [originalUsers]);

    // Extract city list
    const cityList = useMemo(() => {
        const arr = originalUsers
            .map((u) => u.businesses?.[0]?.city)
            .filter(Boolean);
        return [...new Set(arr)];
    }, [originalUsers]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const res = await axios.get("https://api.seaneb.com/admin/all-users", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: 1,
                    limit: 999999,
                    start_date: startDate,
                    end_date: endDate,
                },
            });

            const allUsers = res.data?.data?.users || [];

            setOriginalUsers(allUsers);
            setFilteredUsers(allUsers);

            const totalPages = Math.ceil(allUsers.length / pageInfo.limit);

            setPageInfo({
                page: 1,
                pages: totalPages,
                limit: pageInfo.limit,
            });

            setUsers(allUsers.slice(0, pageInfo.limit));
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const exportExcel = () => {
        const data = filteredUsers.map((u) => {
            const b = u.businesses?.[0] || {};

            return {
                Name: `${safe(u.first_name)} ${safe(u.last_name)}`,
                Mobile: safe(u.mobile_no),
                Email: safe(u.email),

                // Business Details (Full)
                "Business Name": safe(b.business_name),
                "SeaNeB ID": safe(b.seaneb_id),
                "Business Legal Name": safe(b.business_legal_name),
                Category: safe(b.business_category),
                "PAN Number": safe(b.pan_number),
                "GST Number": safe(b.gst_number),
                Area: safe(b.area),
                City: safe(b.city),
                State: safe(b.state),
                "Business Email": safe(b.email),
                "Business Contact": safe(b.contact_no),
                "Website URL": safe(b.website_url),

                // Address
                "Address Line 1": safe(b.address_line_1),
                "Full Address": `${safe(b.address_line_1)}, ${safe(
                    b.area
                )}, ${safe(b.city)}, ${safe(b.state)} - ${safe(b.zip_code)}`,
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "seaneb.xlsx");
    };


    const gotoPage = (page) => {
        const { limit } = pageInfo;
        const start = (page - 1) * limit;
        const end = start + limit;

        setPageInfo((prev) => ({
            ...prev,
            page,
        }));

        setUsers(filteredUsers.slice(start, end));
    };

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setSelectedCategory("");
        setSelectedCity("");
        setSortBy("");

        setPageInfo({
            page: 1,
            pages: Math.ceil(originalUsers.length / 20) || 1,
            limit: 20,
        });

        setFilteredUsers(originalUsers);
        setUsers(originalUsers.slice(0, 20));
    };

    useEffect(() => {
        let list = [...originalUsers];

        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((u) => {
                const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
                const email = (u.email || "").toLowerCase();
                const mobile = (u.mobile_no || "").toLowerCase();
                const businessName = (u.businesses?.[0]?.business_name || "").toLowerCase();
                return (
                    fullName.includes(q) ||
                    email.includes(q) ||
                    mobile.includes(q) ||
                    businessName.includes(q)
                );
            });
        }

        if (selectedCategory) {
            list = list.filter(
                (u) => u.businesses?.[0]?.business_category === selectedCategory
            );
        }

        if (selectedCity) {
            list = list.filter(
                (u) => u.businesses?.[0]?.city === selectedCity
            );
        }

        if (sortBy === "name_asc") {
            list = list.sort((a, b) => a.first_name.localeCompare(b.first_name));
        }

        if (sortBy === "name_desc") {
            list = list.sort((a, b) => b.first_name.localeCompare(a.first_name));
        }

        const pages = Math.ceil(list.length / pageInfo.limit) || 1;

        setFilteredUsers(list);
        setPageInfo((prev) => ({ ...prev, page: 1, pages }));
        setUsers(list.slice(0, pageInfo.limit));
    }, [search, selectedCategory, selectedCity, sortBy, originalUsers, pageInfo.limit]);

    const changeLimit = (limit) => {
        const newLimit = Number(limit);
        const pages = Math.ceil(filteredUsers.length / newLimit) || 1;

        setPageInfo({
            page: 1,
            pages,
            limit: newLimit,
        });

        setUsers(filteredUsers.slice(0, newLimit));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-white p-3 sm:p-5">
            <div className="w-full max-w-6xl mx-auto">

                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black mb-6 text-center">
                    Users Directory
                </h1>

                {/* FILTERS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, mobile, business..."
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    />

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    />
                </div>

                {/* ADVANCED FILTERS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    >
                        <option value="">All Categories</option>
                        {categoryList.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    >
                        <option value="">All Cities</option>
                        {cityList.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 rounded-lg text-sm"
                    >
                        <option value="">Sort</option>
                        <option value="name_asc">Name A → Z</option>
                        <option value="name_desc">Name Z → A</option>
                    </select>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                    >
                        Apply
                    </button>

                    <button
                        onClick={exportExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                    >
                        Excel
                    </button>

                    <select
                        value={pageInfo.limit}
                        onChange={(e) => changeLimit(e.target.value)}
                        className="px-3 py-2 border border-black/20 rounded-lg text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>

                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm"
                    >
                        Clear
                    </button>

                    <div className="ml-auto text-xs text-black/60 py-2">
                        Total: {filteredUsers.length}
                    </div>
                </div>

                {/* TABLE (NO HORIZONTAL SCROLL) */}
                <div className="w-full">
                    <table className="w-full table-auto text-left border border-black/10 rounded-lg text-sm">
                        <thead className="bg-black text-white text-xs sm:text-sm">
                            <tr>
                                <th className="px-2 py-2">Name</th>
                                <th className="px-2 py-2">Mobile</th>
                                <th className="px-2 py-2">Email</th>
                                <th className="px-2 py-2">Business</th>
                            </tr>
                        </thead>

                        <tbody>
                            {!loading &&
                                users.map((u, i) => (
                                    <tr key={i} className="border-t text-xs sm:text-sm">
                                        <td className="px-2 py-2 break-words max-w-[150px]">
                                            {safe(u.first_name)} {safe(u.last_name)}
                                        </td>

                                        <td className="px-2 py-2 break-words">{safe(u.mobile_no)}</td>

                                        <td className="px-2 py-2 break-words max-w-[150px]">
                                            {safe(u.email)}
                                        </td>

                                        <td className="px-2 py-2 break-words">
                                            {u.businesses?.length > 0 ? (
                                                <button
                                                    onClick={() => setSelectedBusiness(u.businesses[0])}
                                                    className="text-blue-600 underline text-xs"
                                                >
                                                    {safe(u.businesses[0].business_name)}
                                                </button>
                                            ) : "N/A"}
                                        </td>
                                    </tr>
                                ))}

                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-black/40">
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden grid grid-cols-1 gap-3 mt-4">
                    {!loading &&
                        users.map((u, i) => (
                            <div key={i} className="border border-black/10 rounded-xl p-3 bg-white text-sm">
                                <h2 className="font-semibold">{safe(u.first_name)} {safe(u.last_name)}</h2>

                                <p className="mt-1">📞 {safe(u.mobile_no)}</p>
                                <p>✉️ {safe(u.email)}</p>

                                <p className="mt-1">
                                    🏢{" "}
                                    {u.businesses?.length > 0 ? (
                                        <button
                                            onClick={() => setSelectedBusiness(u.businesses[0])}
                                            className="text-blue-600 underline"
                                        >
                                            {safe(u.businesses[0].business_name)}
                                        </button>
                                    ) : "N/A"}
                                </p>
                            </div>
                        ))}
                </div>

                {/* PAGINATION */}
                <div className="flex justify-between items-center mt-6 text-sm">
                    <button
                        disabled={pageInfo.page <= 1}
                        onClick={() => gotoPage(pageInfo.page - 1)}
                        className="px-3 py-2 rounded-lg bg-black text-white disabled:bg-gray-300"
                    >
                        ← Prev
                    </button>

                    <span>
                        Page {pageInfo.page} / {pageInfo.pages}
                    </span>

                    <button
                        disabled={pageInfo.page >= pageInfo.pages}
                        onClick={() => gotoPage(pageInfo.page + 1)}
                        className="px-3 py-2 rounded-lg bg-black text-white disabled:bg-gray-300"
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* BUSINESS MODAL (unchanged) */}
            {selectedBusiness && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-sm sm:max-w-md relative text-sm">

                        <button
                            onClick={() => setSelectedBusiness(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-3">
                            {safe(selectedBusiness.business_name)}
                        </h2>

                        <div className="space-y-2 text-black/80">
                            <p><strong>SeaNeB ID:</strong> {safe(selectedBusiness.seaneb_id)}</p>
                            <p><strong>Business Legal Name:</strong> {safe(selectedBusiness.business_legal_name)}</p>
                            <p><strong>Category:</strong> {safe(selectedBusiness.business_category)}</p>
                            <p><strong>PAN:</strong> {safe(selectedBusiness.pan_number)}</p>
                            <p><strong>GST:</strong> {safe(selectedBusiness.gst_number)}</p>
                            <p><strong>Area:</strong> {safe(selectedBusiness.area)}</p>
                            <p><strong>City:</strong> {safe(selectedBusiness.city)}</p>
                            <p><strong>State:</strong> {safe(selectedBusiness.state)}</p>
                            <p><strong>Email:</strong> {safe(selectedBusiness.email)}</p>
                            <p><strong>Contact:</strong> {safe(selectedBusiness.contact_no)}</p>
                            <p><strong>Website:</strong> {safe(selectedBusiness.website_url)}</p>

                            <p>
                                <strong>Address:</strong><br />
                                {safe(selectedBusiness.address_line_1)},<br />
                                {safe(selectedBusiness.area)}, {safe(selectedBusiness.city)},<br />
                                {safe(selectedBusiness.state)} - {safe(selectedBusiness.zip_code)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersListPage;
