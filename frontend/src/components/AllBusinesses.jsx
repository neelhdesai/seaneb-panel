import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import api from "../lib/api";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

export default function AllBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isReadonly, setIsReadonly] = useState(true);
  const [popupErrors, setPopupErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/business/getAllBusiness");
        setBusinesses(res.data.businesses);
        setFiltered(res.data.businesses);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch businesses");
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  // Prepare consultant options for dropdown
  const consultantOptions = Array.from(
    new Set(businesses.map((b) => b.consultant?.name).filter(Boolean))
  ).map((name) => ({ value: name, label: name }));

  // Filter businesses
  const filterBusinesses = (searchTerm, consultant) => {
    let data = [...businesses];

    if (searchTerm) {
      data = data.filter((b) =>
        Object.values(b)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (consultant) {
      data = data.filter((b) => b.consultant?.name === consultant.value);
    }

    setFiltered(data);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    filterBusinesses(term, selectedConsultant);
  };

  const handleConsultantChange = (selected) => {
    setSelectedConsultant(selected);
    filterBusinesses(search, selected);
  };

  const validatePopup = () => {
    const errors = {};
    const consultantName = popupData.consultantName || popupData.consultant?.name || "";
    const consultantEmail = popupData.consultantEmail || popupData.consultant?.email || "";
    const consultantPhone = popupData.consultantPhone || popupData.consultant?.mobileNumber || "";

    if (!consultantName.trim()) errors.consultantName = "Consultant Name is required *";
    if (!consultantEmail.trim()) errors.consultantEmail = "Consultant Email is required *";
    else if (!/.+\@.+\..+/.test(consultantEmail)) errors.consultantEmail = "Invalid email address";
    if (!consultantPhone.trim()) errors.consultantPhone = "Consultant Phone is required *";
    else if (!/^[6-9]\d{9}$/.test(consultantPhone)) errors.consultantPhone = "Invalid phone number";

    if (!popupData.businessName?.trim()) errors.businessName = "Business Name is required *";
    if (!popupData.businessEmail?.trim()) errors.businessEmail = "Business Email is required *";
    else if (!/.+\@.+\..+/.test(popupData.businessEmail)) errors.businessEmail = "Invalid email address";
    if (!popupData.businessPhone?.trim()) errors.businessPhone = "Business Phone is required *";
    else if (!/^[6-9]\d{9}$/.test(popupData.businessPhone)) errors.businessPhone = "Invalid phone number";
    if (!popupData.registrationPhone?.trim()) errors.registrationPhone = "User Registration Number is required *";
    else if (!/^[6-9]\d{9}$/.test(popupData.registrationPhone)) errors.registrationPhone = "Invalid registration number (must be 10 digits)";

    setPopupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((b) => ({
        "Consultant Name": b.consultant?.name || "N/A",
        "Consultant Phone": b.consultant?.mobileNumber || b.mobileNumber || "N/A",
        "Consultant Email": b.consultant?.email || b.consultantEmail || "N/A",
        "Business Name": b.businessName || "N/A",
        "Business Phone": b.businessPhone || "N/A",
        "Business Email": b.businessEmail || "N/A",
        "Transaction Date": new Date(b.transactionDate).toLocaleDateString(),
        Seanebid: b.seanebid || "N/A",
        "Registration Phone": b.registrationPhone || "N/A",
        "PAN ": b.pangst || "N/A",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Businesses");
    XLSX.writeFile(wb, "All_Businesses.xlsx");
  };

  const showPopup = (data, type = "view") => {
    setPopupData({ ...data, type });
    setIsReadonly(type !== "edit");
    setIsDialogVisible(true);
  };

  const handleChange = (e, field) => {
    setPopupData({ ...popupData, [field]: e.target.value });
  };

  const savePopup = async () => {
    if (!validatePopup()) return;
    try {
      const payload = {
        businessName: popupData.businessName,
        businessEmail: popupData.businessEmail,
        businessPhone: popupData.businessPhone,
        registrationPhone: popupData.registrationPhone,
        pangst: popupData.pangst,
        seanebid: popupData.seanebid,
      };

      await api.patch(`/api/business/${popupData._id}`, payload);

      setBusinesses((prev) =>
        prev.map((b) => (b._id === popupData._id ? { ...b, ...payload } : b))
      );
      setFiltered((prev) =>
        prev.map((b) => (b._id === popupData._id ? { ...b, ...payload } : b))
      );

      toast.success("Updated successfully");
      setIsDialogVisible(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };


  const columns = [
    {
      name: "Consultant Name",
      selector: (row) => row.consultant?.name || "N/A",
      sortable: true,
      cell: (row) => (
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => showPopup(row, "consultant")}
        >
          {row.consultant?.name || "N/A"}
        </span>
      ),
    },
    {
      name: "Business Name",
      selector: (row) => row.businessName || "N/A",
      sortable: true,
      cell: (row) => (
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => showPopup(row, "business")}
        >
          {row.businessName || "N/A"}
        </span>
      ),
    },
    {
      name: "Transaction Date",
      selector: (row) => new Date(row.transactionDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Seanebid",
      selector: (row) => row.seanebid || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => showPopup(row, "edit")}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-12xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-6 text-gray-800">All Businesses</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={handleSearch}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <Select
          options={consultantOptions}
          value={selectedConsultant}
          onChange={handleConsultantChange}
          isClearable
          placeholder="Filter by consultant..."
          className="w-full md:w-1/4"
        />
        <button
          onClick={exportToExcel}
          disabled={filtered.length === 0}
          className={`px-4 py-2 rounded text-white ${filtered.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
            }`}
        >
          Export to Excel
        </button>
      </div>

      {/* Data Table / Mobile */}
      <div>
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((b) => (
              <div
                key={b._id}
                className="border rounded p-4 shadow hover:shadow-md cursor-pointer"
                onClick={() => showPopup(b, "view")}
              >
                <h3 className="text-xl font-semibold mb-2">{b.businessName || "N/A"}</h3>
                <p><strong>Consultant:</strong> {b.consultant?.name || "N/A"}</p>
                <p><strong>Transaction Date:</strong> {new Date(b.transactionDate).toLocaleDateString()}</p>
                <p><strong>Seanebid:</strong> {b.seanebid || "N/A"}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); showPopup(b, "edit"); }}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
          />
        )}
      </div>

      {/* Modal */}
      {isDialogVisible && popupData && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh] overflow-x-hidden">
            <h3 className="text-lg font-bold mb-4">
              {popupData.type === "consultant"
                ? "Consultant Details"
                : popupData.type === "edit"
                  ? "Edit Business"
                  : "Business Details"}
            </h3>

            {/* Consultant Details */}
            {popupData.type === "consultant" && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {popupData.consultant?.name}</p>
                <p><strong>Email:</strong> {popupData.consultant?.email}</p>
                <p><strong>Phone:</strong> {popupData.consultant?.mobileNumber}</p>
              </div>
            )}

            {/* Business Details / Edit */}
            {(popupData.type === "business" || popupData.type === "edit") && (
              <div className="space-y-2">
                <label>Business Name</label>
                <input
                  type="text"
                  value={popupData.businessName || ""}
                  onChange={(e) => handleChange(e, "businessName")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />
                <label>Business Email</label>
                <input
                  type="email"
                  value={popupData.businessEmail || ""}
                  onChange={(e) => handleChange(e, "businessEmail")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />
                <label>Registration Number</label>
                <input
                  type="text"
                  value={popupData.registrationPhone || ""}
                  onChange={(e) => handleChange(e, "registrationPhone")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />
                <label>PAN / GST (Optional)</label>
                <input
                  type="text"
                  value={popupData.pangst || ""}
                  onChange={(e) => handleChange(e, "pangst")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />
                <label>Business Phone</label>
                <input
                  type="text"
                  value={popupData.businessPhone || ""}
                  onChange={(e) => handleChange(e, "businessPhone")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />
                <label>Seanebid</label>
                <input
                  type="text"
                  value={popupData.seanebid || ""}
                  onChange={(e) => handleChange(e, "seanebid")}
                  className="w-full border p-2 rounded mb-1"
                  disabled={isReadonly}
                />

              </div>
            )}

            {/* Save button */}
            {!isReadonly && popupData.type === "edit" && (
              <button
                onClick={savePopup}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-2"
              >
                Save
              </button>
            )}

            <button
              onClick={() => setIsDialogVisible(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
