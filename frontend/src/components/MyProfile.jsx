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
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [mobileVerified, setMobileVerified] = useState(false);
    const [mobileExists, setMobileExists] = useState(false);

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
        setOtpSent(false);
        setOtp("");
        setMobileVerified(false);
        setMobileExists(false);
    };

    // Check if mobile already exists
    const checkMobileExists = async (value) => {
        try {
            // Only check if 10 digits and different from current profile
            if (value.length === 10 && value !== profile.mobileNumber) {
                const res = await api.post("/api/users/check-mobile", { mobileNumber: value });

                if (!res.data.success) {
                    setMobileExists(true);
                    toast.error(res.data.message); // Already registered
                } else {
                    setMobileExists(false); // Mobile is available
                }
            } else {
                setMobileExists(false);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to check mobile number");
        }
    };
    const handleMobileChange = (value) => {
        // Just update state, don't check mobile yet
        if (/^\d{0,10}$/.test(value)) {
            setEditData({ ...editData, mobileNumber: value });
            setMobileVerified(false);
            setOtpSent(false);
            setOtp("");
            setMobileExists(false); // reset previous check
        }
    };


    const sendOtpToNewNumber = async () => {
        const mobile = editData.mobileNumber;

        if (!mobile || mobile.length !== 10) {
            toast.error("Enter a valid 10-digit mobile number");
            return;
        }

        try {
            // First, check if mobile already exists
            const res = await api.post("/api/users/check-mobile", { mobileNumber: mobile });

            if (!res.data.success) {
                setMobileExists(true);
                toast.error(res.data.message); // Mobile already registered
                return; // Stop here, do not send OTP
            }

            setMobileExists(false);

            // ✅ Mobile is available, now send OTP
            await api.post("/api/whatsapp/sendOtp", { mobile });
            toast.success("OTP sent to new mobile number");
            setOtpSent(true);
            setMobileVerified(false); // Reset verification if changing number

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to send OTP");
        }
    };


    const verifyOtp = async () => {
        try {
            await api.post("/api/whatsapp/verifyOtp", { mobile: editData.mobileNumber, otp });
            toast.success("Mobile number verified!");
            setMobileVerified(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "OTP verification failed");
        }
    };

    const handleSave = async () => {
        if (editData.mobileNumber !== profile.mobileNumber && !mobileVerified) {
            toast.error("Please verify your new mobile number first");
            return;
        }

        // ✅ Bank account match validation
        if (editData.bankAccount !== editData.confirmBankAccount) {
            toast.error("Bank account numbers do not match");
            return;
        }

        try {
            const res = await api.put("/api/users/profile", editData);
            setProfile(res.data.user);
            toast.success(res.data.message || "Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    };


    const isDataChanged = () => {
        if (!profile) return false;
        const { confirmUpdate, name, consultantPan, ...restEdit } = editData;
        const { confirmUpdate: _, name: __, consultantPan: ___, ...restProfile } = profile;
        return JSON.stringify(restEdit) !== JSON.stringify(restProfile);
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (!profile) return <div className="flex justify-center items-center min-h-screen">No profile data found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 relative">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                <button onClick={handleEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition">
                    <Pencil size={18} /> Edit
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border relative">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shadow-md">
                        {profile.name ? profile.name[0].toUpperCase() : <User size={36} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-gray-800">{profile.name}</h3>
                        <p className="text-gray-500">{profile.email}</p>
                    </div>
                </div>

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
                    <ProfileField label="Consultant PAN" value={profile.consultantPan || "-"} />
                    <ProfileField label="Bank A/c No." value={profile.bankAccount || "-"} />
                    <ProfileField label="IFSC" value={profile.ifsc || "-"} />
                </div>
            </div>

            {/* Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg relative">
                        <button onClick={() => setIsEditing(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                            <X size={22} />
                        </button>

                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">Edit Profile</h3>

                        <div className="space-y-4">
                            <InputField label="Name" type="text" value={editData.name || ""} disabled />
                            <InputField
                                label="Email"
                                type="email"
                                value={editData.email || ""}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                            <InputField
                                label="Mobile"
                                type="text"
                                value={editData.mobileNumber || ""}
                                onChange={(e) => handleMobileChange(e.target.value)}
                            />
                            <InputField
                                label="Bank Account Number"
                                type="text"
                                value={editData.bankAccount || ""}
                                onChange={(e) => setEditData({ ...editData, bankAccount: e.target.value })}
                            />
                            <InputField
                                label="Confirm Bank Account Number"
                                type="text"
                                value={editData.confirmBankAccount || ""}
                                onChange={(e) => setEditData({ ...editData, confirmBankAccount: e.target.value })}
                            />
                            <InputField
                                label="IFSC Code"
                                type="text"
                                value={editData.ifsc || ""}
                                onChange={(e) => setEditData({ ...editData, ifsc: e.target.value })}
                            />


                            {/* OTP Section */}
                            {editData.mobileNumber !== profile.mobileNumber && !mobileVerified && (
                                <div className="flex flex-col gap-2">
                                    {!otpSent ? (
                                        <button
                                            onClick={sendOtpToNewNumber}
                                            disabled={mobileExists}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg w-40"
                                        >
                                            Send OTP
                                        </button>

                                    ) : (
                                        <>
                                            <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                            <button onClick={verifyOtp} className="px-4 py-2 bg-green-600 text-white rounded-lg w-40">Verify OTP</button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                                <input type="checkbox" id="confirmUpdate" checked={editData.confirmUpdate || false} onChange={(e) => setEditData({ ...editData, confirmUpdate: e.target.checked })} className="h-4 w-4" />
                                <label htmlFor="confirmUpdate" className="text-sm text-gray-700">I confirm that I am updating this profile with my knowledge.</label>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={!editData.confirmUpdate || !isDataChanged() || (editData.mobileNumber !== profile.mobileNumber && !mobileVerified)}
                                className={`px-5 py-2 rounded-lg text-white shadow-md ${editData.confirmUpdate && isDataChanged() && (editData.mobileNumber === profile.mobileNumber || mobileVerified) ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
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

function ProfileField({ label, value }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 mt-1">{value}</p>
        </div>
    );
}

function InputField({ label, type, value, onChange, disabled = false }) {
    return (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input type={type} value={value} onChange={onChange} disabled={disabled} className={`w-full border px-3 py-2 rounded-lg focus:outline-none ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"}`} />
        </div>
    );
}
