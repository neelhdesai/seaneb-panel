import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [originalUsers, setOriginalUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, limit: 20 });
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [sortBy, setSortBy] = useState("");

    const [filtersOpen, setFiltersOpen] = useState(false);

    const token = localStorage.getItem("token");
    const safe = (v) => (v && v !== "" ? v : "N/A");

    // lists
    const categoryList = useMemo(() => {
        const arr = originalUsers
            .map((u) => u.businesses?.[0]?.business_category)
            .filter(Boolean);
        return [...new Set(arr)];
    }, [originalUsers]);

    const cityList = useMemo(() => {
        const arr = originalUsers.map((u) => u.businesses?.[0]?.city).filter(Boolean);
        return [...new Set(arr)];
    }, [originalUsers]);

    // fetch
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

            const totalPages = Math.max(1, Math.ceil(allUsers.length / pageInfo.limit));
            setPageInfo((p) => ({ ...p, page: 1, pages: totalPages }));
            setUsers(allUsers.slice(0, pageInfo.limit));
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    // export excel: include full business details
    const exportExcel = () => {
        const data = filteredUsers.map((u) => {
            const b = u.businesses?.[0] || {};
            return {
                Name: `${safe(u.first_name)} ${safe(u.last_name)}`,
                Mobile: safe(u.mobile_no),
                Email: safe(u.email),

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
                "Address Line 1": safe(b.address_line_1),
                "Zip Code": safe(b.zip_code),
                "Full Address": `${safe(b.address_line_1)}, ${safe(b.area)}, ${safe(b.city)}, ${safe(
                    b.state
                )} - ${safe(b.zip_code)}`,
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "seaneb_users.xlsx");
    };

    // pagination helpers
    const gotoPage = (page) => {
        const { limit } = pageInfo;
        const start = (page - 1) * limit;
        const end = start + limit;
        setPageInfo((prev) => ({ ...prev, page }));
        setUsers(filteredUsers.slice(start, end));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const changeLimit = (limit) => {
        const newLimit = Number(limit);
        const pages = Math.max(1, Math.ceil(filteredUsers.length / newLimit));
        setPageInfo({ page: 1, pages, limit: newLimit });
        setUsers(filteredUsers.slice(0, newLimit));
    };

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setSelectedCategory("");
        setSelectedCity("");
        setSortBy("");
        setPageInfo({ page: 1, pages: Math.max(1, Math.ceil(originalUsers.length / 20)), limit: 20 });
        setFilteredUsers(originalUsers);
        setUsers(originalUsers.slice(0, 20));
    };

    // client-side search / filter / sort
    useEffect(() => {
        let list = [...originalUsers];
        const q = (search || "").trim().toLowerCase();
        if (q) {
            list = list.filter((u) => {
                const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
                const email = (u.email || "").toLowerCase();
                const mobile = (u.mobile_no || "").toLowerCase();
                const businessName = (u.businesses?.[0]?.business_name || "").toLowerCase();
                return fullName.includes(q) || email.includes(q) || mobile.includes(q) || businessName.includes(q);
            });
        }

        if (selectedCategory) {
            list = list.filter((u) => u.businesses?.[0]?.business_category === selectedCategory);
        }

        if (selectedCity) {
            list = list.filter((u) => u.businesses?.[0]?.city === selectedCity);
        }

        if (sortBy === "name_asc") {
            list = list.sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));
        } else if (sortBy === "name_desc") {
            list = list.sort((a, b) => (b.first_name || "").localeCompare(a.first_name || ""));
        }

        const pages = Math.max(1, Math.ceil(list.length / pageInfo.limit));
        setFilteredUsers(list);
        setPageInfo((prev) => ({ ...prev, page: 1, pages }));
        setUsers(list.slice(0, pageInfo.limit));
    }, [search, selectedCategory, selectedCity, sortBy, originalUsers, pageInfo.limit]);

    // initial
    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, []);

    // Minimal Notion-style table row component for mobile expand
    const MobileRow = ({ u }) => {
        const b = u.businesses?.[0] || {};
        return (
            <details className="bg-white border border-slate-100 rounded-lg p-3" >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                    <div className="flex flex-col">
                        <div className="text-sm font-medium text-slate-900">{safe(u.first_name)} {safe(u.last_name)}</div>
                        <div className="text-xs text-slate-500 mt-1">{safe(u.email)}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-700">{safe(u.mobile_no)}</div>
                        <div className="text-sm text-emerald-600">{b.business_name ? <span>{safe(b.business_name)}</span> : <span className="text-slate-400">N/A</span>}</div>
                    </div>
                </summary>

                <div className="mt-3 text-xs text-slate-700 space-y-2">
                    <div><strong>Business:</strong> {safe(b.business_name)}</div>
                    <div><strong>Category:</strong> {safe(b.business_category)}</div>
                    <div><strong>City:</strong> {safe(b.city)}</div>
                    <div><strong>Area:</strong> {safe(b.area)}</div>
                    <div><strong>Contact:</strong> {safe(b.contact_no)}</div>
                </div>
            </details>
        );
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 bg-slate-50">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm px-4 py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-lg sm:text-2xl font-semibold text-slate-900">Users Directory</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={exportExcel} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm">Export Excel</button>
                        <button onClick={clearFilters} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm hidden sm:inline">Clear</button>
                        <button onClick={() => setFiltersOpen(s => !s)} className="px-3 py-2 bg-slate-100 rounded-md text-sm sm:hidden">{filtersOpen ? "Close" : "Filters"}</button>
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-lg p-4 mb-5 shadow-sm">
                    <div className={`${filtersOpen ? "space-y-3" : ""} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3`}>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name, email, mobile, business..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-200"
                        />

                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm" />

                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm">
                            <option value="">All Categories</option>
                            {categoryList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>

                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm">
                            <option value="">All Cities</option>
                            {cityList.map((c, i) => <option key={i} value={c}>{c}</option>)}
                        </select>

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm">
                            <option value="">Sort</option>
                            <option value="name_asc">Name A → Z</option>
                            <option value="name_desc">Name Z → A</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        <button onClick={fetchUsers} className="px-3 py-2 bg-slate-900 text-white rounded-md text-sm">Apply</button>
                        <button onClick={exportExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-md text-sm">Excel</button>

                        <select value={pageInfo.limit} onChange={(e) => changeLimit(e.target.value)} className="px-2 py-2 border border-slate-200 rounded-md text-sm">
                            <option value={10}>10 rows</option>
                            <option value={20}>20 rows</option>
                            <option value={50}>50 rows</option>
                            <option value={100}>100 rows</option>
                        </select>

                        <button onClick={clearFilters} className="px-3 py-2 bg-slate-100 rounded-md text-sm sm:hidden">Clear</button>

                        <div className="ml-auto text-xs text-slate-500">Total: <span className="text-slate-700 font-medium">{filteredUsers.length}</span></div>
                    </div>
                </div>

                {/* Notion-style Table */}
                <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-white sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs text-slate-500">Name</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-500">Mobile</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-500 hidden sm:table-cell">Email</th>
                                    <th className="px-4 py-3 text-left text-xs text-slate-500">Business</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-slate-100">
                                {!loading && users.map((u, idx) => {
                                    const b = u.businesses?.[0] || {};
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 align-top">
                                                <div className="flex flex-col">
                                                    <div className="text-sm text-slate-900 font-medium">{safe(u.first_name)} {safe(u.last_name)}</div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <div className="text-sm text-slate-700">{safe(u.mobile_no)}</div>
                                            </td>

                                            <td className="px-4 py-4 align-top hidden sm:table-cell">
                                                <div className="text-sm text-slate-700 break-words max-w-xs">{safe(u.email)}</div>
                                            </td>

                                            <td className="px-4 py-4 ">
                                                {b.business_name ? (
                                                    <div>
                                                        <button onClick={() => setSelectedBusiness(b)} className="text-slate-900 text-sm font-medium hover:underline cursor-pointer">
                                                            {safe(b.business_name)}
                                                        </button>
                                                    </div>
                                                ) : <div className="text-sm text-slate-400">N/A</div>}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No users found</td>
                                    </tr>
                                )}

                                {loading && (
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                            <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                                            <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile collapsible list as fallback (very small screens) */}
                    <div className="md:hidden p-3">
                        <div className="flex flex-col gap-3">
                            {!loading && users.map((u, i) => <MobileRow key={i} u={u} />)}
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center">

                        {/* LEFT — First + Prev */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => gotoPage(1)}
                                disabled={pageInfo.page === 1}
                                className={`px-3 py-2 rounded-md text-sm ${pageInfo.page === 1
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-slate-900 text-white"
                                    }`}
                            >
                                First
                            </button>

                            <button
                                onClick={() => gotoPage(pageInfo.page - 1)}
                                disabled={pageInfo.page <= 1}
                                className={`px-3 py-2 rounded-md text-sm ${pageInfo.page <= 1
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-slate-900 text-white"
                                    }`}
                            >
                                ← Prev
                            </button>
                        </div>

                        {/* CENTER — Page Info */}
                        <div className="text-sm text-slate-600 font-medium">
                            Page <span className="text-slate-900">{pageInfo.page}</span> of{" "}
                            <span className="text-slate-900">{pageInfo.pages}</span>
                        </div>

                        {/* RIGHT — Next + Last */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => gotoPage(pageInfo.page + 1)}
                                disabled={pageInfo.page >= pageInfo.pages}
                                className={`px-3 py-2 rounded-md text-sm ${pageInfo.page >= pageInfo.pages
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-slate-900 text-white"
                                    }`}
                            >
                                Next →
                            </button>

                            <button
                                onClick={() => gotoPage(pageInfo.pages)}
                                disabled={pageInfo.page === pageInfo.pages}
                                className={`px-3 py-2 rounded-md text-sm ${pageInfo.page === pageInfo.pages
                                    ? "bg-slate-100 text-slate-400"
                                    : "bg-slate-900 text-white"
                                    }`}
                            >
                                Last
                            </button>
                        </div>

                    </div>

                </div>

                {/* Business Modal (kept exactly as requested) */}
                {selectedBusiness && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
                            <button onClick={() => setSelectedBusiness(null)} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl">✕</button>

                            <h2 className="text-xl font-semibold mb-4">{safe(selectedBusiness.business_name)}</h2>

                            <div className="space-y-2 text-sm text-black/80">
                                <p><strong>SeaNeB ID:</strong> {safe(selectedBusiness.seaneb_id)}</p>
                                <p><strong>Business Legal Name:</strong> {safe(selectedBusiness.business_legal_name)}</p>
                                <p><strong>Category:</strong> {safe(selectedBusiness.business_category)}</p>
                                <p><strong>PAN Number:</strong> {safe(selectedBusiness.pan_number)}</p>
                                <p><strong>GST Number:</strong> {safe(selectedBusiness.gst_number)}</p>
                                <p><strong>Area:</strong> {safe(selectedBusiness.area)}</p>
                                <p><strong>City:</strong> {safe(selectedBusiness.city)}</p>
                                <p><strong>State:</strong> {safe(selectedBusiness.state)}</p>
                                <p><strong>Email:</strong> {safe(selectedBusiness.email)}</p>
                                <p><strong>Contact:</strong> {safe(selectedBusiness.contact_no)}</p>
                                <p><strong>Website:</strong> {safe(selectedBusiness.website_url)}</p>

                                <p>
                                    <strong>Full Address:</strong><br />
                                    {safe(selectedBusiness.address_line_1)},<br />
                                    {safe(selectedBusiness.area)}, {safe(selectedBusiness.city)},<br />
                                    {safe(selectedBusiness.state)} - {safe(selectedBusiness.zip_code)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default UsersListPage;
