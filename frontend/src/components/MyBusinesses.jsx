import { useEffect, useState } from "react";
import api from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from "react-data-table-component";

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    const fetchMyBusinesses = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/business/my"); // fetch logged-in user's businesses
        setBusinesses(res.data.businesses);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch businesses");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBusinesses();
  }, []);

  const columns = [
    {
      name: "Business Name",
      selector: (row) => row.businessName,
      sortable: true,
    },
    {
      name: "SeaNeB ID",
      selector: (row) => row.seanebid,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => setSelectedBusiness(row)}
          className="text-blue-500 hover:underline"
        >
          View More
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading businesses...</p>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">No businesses submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-12xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Businesses</h2>

      {/* DataTable for larger devices */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={businesses}
          pagination
          highlightOnHover
          responsive
        />
      </div>

      {/* Cards for smaller devices */}
      <div className="md:hidden space-y-4">
        {businesses.map((b) => (
          <div key={b._id} className="bg-white p-4 rounded-lg shadow-md border">
            <h3 className="font-bold text-lg mb-2">{b.businessName}</h3>
            <p><strong>SeaNeB ID:</strong> {b.seanebid}</p>
            <button
              onClick={() => setSelectedBusiness(b)}
              className="mt-2 text-blue-500 hover:underline"
            >
              View More
            </button>
          </div>
        ))}
      </div>

      {/* Modal for "View More" */}
      {selectedBusiness && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">{selectedBusiness.businessName}</h3>
            <p><strong>User Registration Number:</strong> {selectedBusiness.registrationPhone}</p>
            <p><strong>Business Phone / WhatsApp:</strong> {selectedBusiness.businessPhone}</p>
            <p><strong>PAN / GST Number:</strong> {selectedBusiness.pangst || "N/A"}</p>
            <p><strong>Business Email:</strong> {selectedBusiness.businessEmail}</p>
            <p><strong>Transaction Date:</strong> {new Date(selectedBusiness.transactionDate).toLocaleDateString()}</p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
