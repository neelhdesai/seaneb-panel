import React, { useEffect, useState } from "react";
import axios from "axios";

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
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

  const token = localStorage.getItem("token");

  const safe = (v) => (v && v !== "" ? v : "N/A");

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axios.get("https://api.seaneb.com/admin/all-users", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: 20,
          start_date: startDate,
          end_date: endDate,
        },
      });

      const data = res.data?.data;
      const pages = data?.pages > 0 ? data.pages : 1;

      setUsers(data?.users || []);
      setOriginalUsers(data?.users || []);

      setPageInfo({
        page: data?.page || 1,
        pages,
        limit: data?.limit || 20,
      });
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) return setUsers(originalUsers);

    const filtered = originalUsers.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(value.toLowerCase())
    );

    setUsers(filtered);
  };

  return (
    <div className="min-h-screen bg-white p-3 sm:p-5 flex justify-center">
      <div className="w-full max-w-6xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-semibold text-black mb-6 text-center">
          Users Directory
        </h1>

        {/* FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full px-4 py-2.5 border border-black/20 rounded-xl focus:ring-2 focus:ring-black"
          />

          <input
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-black/20 rounded-xl"
          />

          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-black/20 rounded-xl"
          />
        </div>

        <button
          onClick={() => fetchUsers(1)}
          className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-xl hover:bg-black/80 mb-6"
        >
          Apply Filter
        </button>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block w-full overflow-x-auto">
          <div className="min-w-[850px] rounded-xl overflow-hidden border border-black/10 shadow">
            <table className="w-full table-auto text-left">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Mobile</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Business</th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  users.map((u, i) => (
                    <tr key={i} className="border-t border-black/10 hover:bg-black/5">

                      <td className="px-5 py-4 font-medium">
                        {safe(u.first_name)} {safe(u.last_name)}
                      </td>

                      <td className="px-5 py-4">{safe(u.mobile_no)}</td>

                      <td className="px-5 py-4 break-all">{safe(u.email)}</td>

                      <td className="px-5 py-4">
                        {u.businesses?.length > 0 ? (
                          <button
                            onClick={() => setSelectedBusiness(u.businesses[0])}
                            className="text-blue-600 cursor-pointer"
                          >
                            {safe(u.businesses[0].business_name)}
                          </button>
                        ) : (
                          "N/A"
                        )}
                      </td>

                    </tr>
                  ))}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-black/40">
                      No users found
                    </td>
                  </tr>
                )}

                {loading &&
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse bg-gray-100 h-12"></tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {!loading &&
            users.map((u, i) => (
              <div key={i} className="border border-black/10 rounded-2xl p-4 bg-white shadow-sm">
                <h2 className="text-lg font-semibold">
                  {safe(u.first_name)} {safe(u.last_name)}
                </h2>

                <div className="text-sm text-black/80 mt-3 space-y-2">
                  <p>📞 {safe(u.mobile_no)}</p>
                  <p>✉️ {safe(u.email)}</p>

                  <p className="mt-2">
                    🏢{" "}
                    {u.businesses?.length > 0 ? (
                      <button
                        onClick={() => setSelectedBusiness(u.businesses[0])}
                        className="text-blue-600 underline"
                      >
                        {safe(u.businesses[0].business_name)}
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-8 px-2">
          <button
            disabled={pageInfo.page <= 1}
            onClick={() => fetchUsers(pageInfo.page - 1)}
            className={`px-5 py-2 rounded-xl ${
              pageInfo.page <= 1
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            ← Previous
          </button>

          <span className="text-black font-medium">
            Page {pageInfo.page} / {pageInfo.pages}
          </span>

          <button
            disabled={pageInfo.page >= pageInfo.pages}
            onClick={() => fetchUsers(pageInfo.page + 1)}
            className={`px-5 py-2 rounded-xl ${
              pageInfo.page >= pageInfo.pages
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-black text-white hover:bg-black/90"
            }`}
          >
            Next →
          </button>
        </div>
      </div>

      {/* MODAL */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">

            <button
              onClick={() => setSelectedBusiness(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {safe(selectedBusiness.business_name)}
            </h2>

            <div className="space-y-2 text-sm text-black/80">
              <p><strong>Legal Name:</strong> {safe(selectedBusiness.business_legal_name)}</p>
              <p><strong>Category:</strong> {safe(selectedBusiness.business_category)}</p>
              <p><strong>PAN:</strong> {safe(selectedBusiness.pan_number)}</p>
              <p><strong>GST:</strong> {safe(selectedBusiness.gst_number)}</p>

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
