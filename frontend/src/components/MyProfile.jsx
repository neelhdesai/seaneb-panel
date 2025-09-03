import { useEffect, useState } from "react";
import api from "../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, X, User } from "lucide-react";

export default function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/users/profile");
                setProfile(res.data.user);
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleEdit = () => {
        setEditData(profile);
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const res = await api.put("/api/users/profile", editData);
            setProfile(res.data.user);
            toast.success(res.data.message || "Update request submitted!");
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600 animate-pulse">Loading profile...</p>
            </div>
        );
    }

    // Compare profile and editData (ignoring confirmUpdate)
    const isDataChanged = () => {
        if (!profile) return false;
        const { confirmUpdate, ...restEdit } = editData;
        const { confirmUpdate: _, ...restProfile } = profile;

        return JSON.stringify(restEdit) !== JSON.stringify(restProfile);
    };


    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-600">No profile data found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 relative">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
                >
                    <Pencil size={18} />
                    Edit
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border relative">
                {/* Avatar */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">
                        {profile.name ? profile.name[0].toUpperCase() : <User size={36} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800">{profile.name}</h3>
                        <p className="text-gray-500">{profile.email}</p>
                    </div>
                </div>

                {/* Profile Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ProfileField label="Mobile" value={profile.mobileNumber} />
                    <ProfileField
                        label="Status"
                        value={
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${profile.status === "approved"
                                    ? "bg-green-500"
                                    : profile.status === "pending"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                            >
                                {profile.status}
                            </span>
                        }
                    />

                    {profile.role === "consultant" && (
                        <>
                            <ProfileField label="PAN" value={profile.consultantPan || "N/A"} />
                            <ProfileField label="UPI ID" value={profile.consultantUpiId || "N/A"} />

                            {profile.status === "approved" && (
                                <ProfileField
                                    label="Approved By"
                                    value={`${profile.approvedBy?.name} (${profile.approvedBy?.email})`}
                                />
                            )}
                           
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative">
                        {/* Close button */}
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={22} />
                        </button>

                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Edit Profile</h3>

                        <div className="space-y-4">
                            {/* Name */}
                            <InputField
                                label="Name"
                                type="text"
                                value={editData.name || ""}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />

                            {/* Email */}
                            <InputField
                                label="Email"
                                type="email"
                                value={editData.email || ""}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />

                            {/* Mobile */}
                            <InputField
                                label="Mobile"
                                type="text"
                                value={editData.mobileNumber || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,10}$/.test(value)) {
                                        setEditData({ ...editData, mobileNumber: value });
                                    }
                                }}
                            />

                            {/* Consultant only fields */}
                            {profile.role === "consultant" && (
                                <>
                                    <InputField
                                        label="PAN"
                                        type="text"
                                        value={editData.consultantPan || ""}
                                        onChange={(e) =>
                                            setEditData({ ...editData, consultantPan: e.target.value })
                                        }
                                    />
                                    <InputField
                                        label="UPI ID"
                                        type="text"
                                        value={editData.consultantUpiId || ""}
                                        onChange={(e) =>
                                            setEditData({ ...editData, consultantUpiId: e.target.value })
                                        }
                                    />
                                </>
                            )}

                            {/* Confirmation */}
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="confirmUpdate"
                                    checked={editData.confirmUpdate || false}
                                    onChange={(e) =>
                                        setEditData({ ...editData, confirmUpdate: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                />
                                <label htmlFor="confirmUpdate" className="text-sm text-gray-700">
                                    I confirm that I am updating this profile with my knowledge.
                                </label>
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editData.confirmUpdate || !isDataChanged()}
                                className={`px-5 py-2 rounded-lg text-white shadow-md ${editData.confirmUpdate && isDataChanged()
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Save Changes
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* 🔹 Reusable profile field component */
function ProfileField({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

/* 🔹 Reusable input field */
function InputField({ label, type, value, onChange }) {
    return (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
        </div>
    );
}
