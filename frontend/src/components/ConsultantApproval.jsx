import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import api from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { usePendingConsultants } from "../context/PendingConsultantsContext";

export default function ConsultantApproval() {
  const [consultants, setConsultants] = useState([]);
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
 const { pendingConsultants, setPendingConsultants } = usePendingConsultants();
  const [isMobile, setIsMobile] = useState(false);
  const userRole = sessionStorage.getItem("role"); 

  const fetchPendingCount = async () => {
    try {
      const res = await api.get("/api/users/pending-count");
      setPendingConsultants(res.data.count);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  useEffect(() => {
    if (userRole === "admin") {
      fetchPendingCount();
    }
  }, [userRole]);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const fetchConsultants = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/users/getAllUsers");
        const nonAdmins = res.data.users.filter((user) => user.role !== "admin");
        setConsultants(nonAdmins);
        setFilteredConsultants(nonAdmins);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch consultants");
      } finally {
        setLoading(false);
      }
    };
    fetchConsultants();
  }, []);

  const handleFilter = (term, status) => {
    let filtered = consultants;

    if (term) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(term.toLowerCase()) ||
          c.email.toLowerCase().includes(term.toLowerCase()) ||
          c.mobileNumber.includes(term)
      );
    }

    if (status && status !== "All") {
      filtered = filtered.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    setFilteredConsultants(filtered);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    handleFilter(term, statusFilter);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    handleFilter(search, status);
  };

  const updateStatus = async (userId, newStatus) => {
    try {
      await api.patch(`/api/users/status/${userId}`, { status: newStatus });

      setConsultants(prev =>
        prev.map(u => (u._id === userId ? { ...u, status: newStatus } : u))
      );
      setFilteredConsultants(prev =>
        prev.map(u => (u._id === userId ? { ...u, status: newStatus } : u))
      );
      setSelectedConsultant(prev => ({ ...prev, status: newStatus }));

      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredConsultants.map(c => ({
      Name: c.name,
      Email: c.email,
      WhatsApp: c.mobileNumber,
      Status: c.status,
      PAN: c.consultantPan || "N/A",
      BankAccount: c.bankAccount || "N/A",
      ifsc: c.ifsc || "N/A"
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consultants");
    XLSX.writeFile(workbook, "Consultants.xlsx");
  };

  const columns = [
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <span className="text-blue-600 cursor-pointer" onClick={() => setSelectedConsultant(row)}>
          {row.name}
        </span>
      ),
    },
    { name: "Email", selector: row => row.email, sortable: true },
    { name: "WhatsApp Number", selector: row => row.mobileNumber, sortable: true },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <span
          className={`px-2 py-1 rounded text-white ${row.status === "approved"
            ? "bg-green-500"
            : row.status === "denied"
              ? "bg-red-500"
              : "bg-gray-500"
            }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),

    },
  ];

  return (
    <div className="max-w-12xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Consultant Approval</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search consultants..."
          value={search}
          onChange={handleSearch}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
        <button
          onClick={exportToExcel}
          disabled={filteredConsultants.length === 0}
          className={`px-4 py-2 rounded text-white ${filteredConsultants.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-blue-600"
            }`}
        >
          Export to Excel
        </button>
      </div>

      {/* Consultant list */}
      {isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredConsultants.map((c) => (
            <div
              key={c._id}
              className="border bg-white rounded-lg p-4 shadow hover:shadow-md cursor-pointer"
              onClick={() => setSelectedConsultant(c)}
            >
              <h3 className="font-bold text-lg mb-2">{c.name}</h3>
              <p><strong>Email:</strong> {c.email}</p>
              <p><strong>WhatsApp Number::</strong> {c.mobileNumber}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-white ${c.status === "approved"
                    ? "bg-green-500"
                    : c.status === "denied"
                      ? "bg-red-500"
                      : "bg-gray-500"
                    }`}
                >
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </p>

            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredConsultants}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
        />
      )}

      {selectedConsultant && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
              onClick={() => setSelectedConsultant(null)}
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-2">{selectedConsultant.name}</h3>
            <p><strong>Email:</strong> {selectedConsultant.email}</p>
            <p><strong>WhatsApp Number:</strong> {selectedConsultant.mobileNumber}</p>
            <p><strong>PAN:</strong> {selectedConsultant.consultantPan || "N/A"}</p>
            <p><strong>Bank Account Number:</strong> {selectedConsultant.bankAccount || "N/A"}</p>
            <p><strong>IFSC:</strong> {selectedConsultant.ifsc || "N/A"}</p>

            <div className="mt-4">
              <label className="block mb-2 font-medium">Update Status</label>
              <select
                value={selectedConsultant.status}
                onChange={(e) => setSelectedConsultant(prev => ({ ...prev, status: e.target.value }))}
                className="border p-2 rounded w-full"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>

              <button
                onClick={async () => {
                  const newStatus = selectedConsultant.status;

                  try {
                    if (newStatus === "approved") {
                      await api.patch(`/api/users/approve/${selectedConsultant._id}`);
                    } else if (newStatus === "denied") {
                      await api.patch(`/api/users/deny/${selectedConsultant._id}`);
                    } else {
                      await api.patch(`/api/users/status/${selectedConsultant._id}`, { status: newStatus });
                    }

                    setConsultants(prev =>
                      prev.map(u => u._id === selectedConsultant._id ? { ...u, status: newStatus } : u)
                    );
                    setFilteredConsultants(prev =>
                      prev.map(u => u._id === selectedConsultant._id ? { ...u, status: newStatus } : u)
                    );

                    const res = await api.get("/api/users/pending-count");
                    setPendingConsultants(res.data.count);

                    toast.success(`Status updated to ${newStatus}`);
                    setSelectedConsultant(null);
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to update status");
                  }
                }}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Update Status
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
