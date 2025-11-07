// RegisterBusinessNoPayment.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const RegisterBusinessNoPayment = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gmbOptions, setGmbOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [loadingGMB, setLoadingGMB] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fromGoogle, setFromGoogle] = useState(false);


  const serviceRef = useRef(null);
  const areaServiceRef = useRef(null);


  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    pan_number: "",
    gst_number: "",
    seaneb_id: "",
    allowEditId: false,
    address: "",
    contact_no: "",
    website: "",
    latitude: "",
    longitude: "",
    area: "",
    city: "",
    state: "",
    country: "",
    country_short: "",
    zip_code: "",
    google_map_id: "",
    u_id: "",
    business_category_ids: [],
  });

  // Initialize Google Places services
  const initGoogleServices = () => {
    if (window.google && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (window.google && !areaServiceRef.current) {
      areaServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  };

  useEffect(() => {
    initGoogleServices();
  }, []);

  // Fetch users (owner mapping)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://api.seaneb.com/api/mobile/get-users-for-business");
        const options = (res.data?.data || []).map((u) => ({
          value: u.u_id,
          label: `${u.first_name || ""} ${u.last_name || ""} (${u.mobile_no || ""})`,
        }));
        setUsers(options);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch business categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://api.seaneb.com/api/mobile/business-category-list?limit=50");
        const list = res.data?.data?.data || [];
        const opts = list.map((cat) => ({
          value: cat.category, // 👈 use readable category name as value
          label: cat.category,
        }));
        setCategories(opts);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Helper: extract address components from Google Place result
  const extractAddressComponents = (components = []) => {
    const find = (types) => {
      for (const t of types) {
        const c = components.find((comp) => comp.types.includes(t));
        if (c) return c.long_name;
      }
      return "";
    };
    const findShort = (types) => {
      for (const t of types) {
        const c = components.find((comp) => comp.types.includes(t));
        if (c) return c.short_name;
      }
      return "";
    };
    return {
      area: find(["sublocality_level_2", "sublocality_level_1", "neighborhood", "locality"]),
      city: find(["locality", "administrative_area_level_2"]),
      state: find(["administrative_area_level_1"]),
      country: find(["country"]),
      country_short: findShort(["country"]),
      zip_code: find(["postal_code"]),
    };
  };

  // Generate SeaNeB ID from business name + area (safe/fallback logic)
  const generateSeanebId = (businessName, area) => {
    if (!businessName) return "";
    const cleanBiz = businessName.replace(/\s+/g, "").slice(0, 10);
    const cleanArea = (area || "local").replace(/\s+/g, "").slice(0, 8);
    return `${cleanBiz}_${cleanArea}`.toLowerCase().slice(0, 20);
  };

  // Search Google Places (business)
  const searchGoogleBusiness = async (query) => {
    if (!query || query.length < 2) {
      setGmbOptions([]);
      return;
    }
    initGoogleServices();
    if (!serviceRef.current) return;

    setLoadingGMB(true);
    const formattedQuery = query.trim().replace(/\s{2,}/g, " ").replace(/\s+/g, ", ");
    let locationBias = new window.google.maps.LatLng(22.5645, 72.9289); // Anand default

    // attempt to use geolocation to bias results (non-blocking)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          locationBias = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // ignore geolocation failure
        }
      );
    }

    const getPredictions = (input) =>
      new Promise((resolve) => {
        serviceRef.current.getPlacePredictions(
          {
            input,
            types: ["establishment"],
            componentRestrictions: { country: "in" },
            locationBias: { center: locationBias, radius: 50000 },
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
              resolve(predictions);
            } else resolve([]);
          }
        );
      });

    try {
      const predictions = await getPredictions(formattedQuery);
      if (predictions.length > 0) {
        setGmbOptions(
          predictions.map((p) => ({
            value: p.description,
            label: p.description,
            place_id: p.place_id,
          }))
        );
        setLoadingGMB(false);
        return;
      }

      // fallback: geocode endpoint (requires key)
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query
          )}&region=in&key=${apiKey}`
        );
        const data = await resp.json();
        if (data.status === "OK" && data.results.length) {
          setGmbOptions(
            data.results.map((r) => ({
              value: r.formatted_address,
              label: r.formatted_address,
              place_id: r.place_id,
            }))
          );
          setLoadingGMB(false);
          return;
        }
      }

      // final fallback: show typed query as option
      setGmbOptions([{ value: query, label: query }]);
    } catch (err) {
      console.error("❌ searchGoogleBusiness error:", err);
      setGmbOptions([{ value: query, label: query }]);
    } finally {
      setLoadingGMB(false);
    }
  };


  // When user selects a Google Business option -> get details & populate form
  const handleGMBSelect = (selected) => {
    if (!selected) return;

    // If option has no place_id (fallback typed), just set name/address and leave others
    if (!selected.place_id) {
      setFromGoogle(true);
      setFormData((prev) => {
        const newSF = {
          ...prev,
          business_name: selected.value || prev.business_name,
          address: selected.value || prev.address,
        };
        newSF.seaneb_id = generateSeanebId(newSF.business_name, newSF.area || newSF.city);
        return newSF;
      });
      return;
    }

    // Use PlacesService to fetch details
    const detailsService = new window.google.maps.places.PlacesService(document.createElement("div"));
    detailsService.getDetails(
      {
        placeId: selected.place_id,
        fields: [
          "name",
          "formatted_address",
          "geometry",
          "website",
          "url",
          "formatted_phone_number",
          "address_components",
          "types",
        ],
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const lat = place.geometry?.location?.lat() || "";
          const lng = place.geometry?.location?.lng() || "";
          const addr = extractAddressComponents(place.address_components || []);
          const generatedId = generateSeanebId(place.name, addr.area || addr.city);

          // Extract typed Google categories from place.types
          const googleCategories = (place.types || [])
            .map((t) => t.replace(/_/g, " "))
            .filter((t) => t && !t.includes("point of interest") && !t.includes("establishment"));

          // Merge any missing GMB categories into categories dropdown
          const existingLabels = categories.map((c) => c.label.toLowerCase());
          const newGmbCats = googleCategories.filter((gc) => !existingLabels.includes(gc.toLowerCase()));
          if (newGmbCats.length > 0) {
            const newOptions = newGmbCats.map((c) => ({
              value: `gmb_${c.toLowerCase().replace(/\s+/g, "_")}`,
              label: c,
              fromGoogle: true,
            }));
            setCategories((prev) => [...prev, ...newOptions]);
          }

          // Auto-select categories that match existing or newly added
          const matchedCategoryLabels = googleCategories.filter((gc) =>
            [...existingLabels, ...newGmbCats.map((n) => n.toLowerCase())].includes(gc.toLowerCase())
          );

          setFromGoogle(true);
          setFormData((prev) => ({
            ...prev,
            business_name: place.name || prev.business_name,
            address: place.formatted_address || prev.address,
            website: place.website || prev.website,
            contact_no: place.formatted_phone_number || prev.contact_no,
            latitude: lat,
            longitude: lng,
            area: addr.area || prev.area,
            city: addr.city || prev.city,
            state: addr.state || prev.state,
            country: addr.country || prev.country,
            country_short: addr.country_short || prev.country_short,
            zip_code: addr.zip_code || prev.zip_code,
            seaneb_id: generatedId,
            // store selected category labels (not ids) — keeps your previous approach
            business_category_ids: matchedCategoryLabels.length ? matchedCategoryLabels : prev.business_category_ids,
          }));
        } else {
          // not OK
          console.warn("Google details fetch not OK:", status);
        }
      }
    );
  };



  // Search area options (always available)
  const searchArea = (query) => {
    if (!query || query.length < 2) return setAreaOptions([]);
    initGoogleServices();
    if (!areaServiceRef.current) return;

    areaServiceRef.current.getPlacePredictions(
      {
        input: query,
        types: ["sublocality", "locality", "neighborhood"],
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions?.length) {
          setAreaOptions(
            predictions.map((p) => ({
              value: p.description,
              label: p.description,
              place_id: p.place_id,
            }))
          );
        } else {
          setAreaOptions([]);
        }
      }
    );
  };

  // When area is selected from dropdown: fill address parts and update seaneb id
  const handleAreaSelect = (selected) => {
    if (!selected) {
      setFormData((p) => ({
        ...p,
        area: "",
        city: "",
        state: "",
        country: "",
        country_short: "",
        zip_code: "",
      }));
      return;
    }

    const detailsService = new window.google.maps.places.PlacesService(document.createElement("div"));
    detailsService.getDetails(
      { placeId: selected.place_id, fields: ["address_components", "geometry", "place_id"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addr = extractAddressComponents(place.address_components || []);
          const lat = place.geometry?.location?.lat() || "";
          const lng = place.geometry?.location?.lng() || "";
          const generatedId = generateSeanebId(formData.business_name || "", addr.area || addr.city);

          // ✅ Always build a valid Maps link
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.value)}&query_place_id=${selected.place_id}`;

          console.log("✅ Final Google Map URL:", mapUrl);

          setFormData((prev) => ({
            ...prev,
            area: addr.area || selected.value,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            country_short: addr.country_short,
            zip_code: addr.zip_code,
            latitude: lat,
            longitude: lng,
            google_map_id: mapUrl,
            seaneb_id: generatedId,
          }));
        } else {
          console.warn("Area details fetch not OK:", status);
        }
      }
    );
  };


  // Handle typing into inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If user is editing seaneb_id but editing is locked, do not allow direct edit
    if (name === "seaneb_id" && !formData.allowEditId) {
      // ignore change if lock active
      return;
    }
    const next = { ...formData, [name]: value };

    // If business_name or area changed, regenerate seaneb_id (unless user unlocked and editing id manually)
    if ((name === "business_name" || name === "area") && !formData.allowEditId) {
      const biz = name === "business_name" ? value : formData.business_name;
      const ar = name === "area" ? value : formData.area;
      next.seaneb_id = generateSeanebId(biz, ar);
    }

    setFormData(next);
  };

  // Toggle allowEditId (lock/unlock)
  const toggleAllowEditId = () => {
    setFormData((p) => ({ ...p, allowEditId: !p.allowEditId }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ✅ clone formData first
      let payload = {
        ...formData,
        business_category: (formData.business_category_ids || []).join(", "),
      };

      // ✅ Add fallback if google_map_id missing
      if (!payload.google_map_id || !payload.google_map_id.trim()) {
        if (formData.area || formData.city) {
          payload.google_map_id = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            formData.area + " " + formData.city
          )}`;
        } else if (formData.latitude && formData.longitude) {
          payload.google_map_id = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`;
        } else {
          payload.google_map_id = null;
        }
      }

      // ✅ Now log and confirm before sending
      console.log("🚀 FINAL PAYLOAD SENT:", payload.google_map_id);

      delete payload.business_category_ids;
      delete payload.allowEditId;

      const res = await axios.post(
        "https://api.seaneb.com/api/mobile/register-business-no-payment",
        payload
      );

      setMessage(`✅ ${res.data.message || "Business registered successfully!"}`);
      setFormData({
        business_name: "",
        email: "",
        pan_number: "",
        gst_number: "",
        seaneb_id: "",
        allowEditId: false,
        address: "",
        contact_no: "",
        website: "",
        latitude: "",
        longitude: "",
        area: "",
        city: "",
        state: "",
        country: "",
        country_short: "",
        zip_code: "",
        google_map_id: "",
        u_id: "",
        business_category_ids: [],
      });
      setFromGoogle(false);
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data || err.message);
      const serverMsg = err.response?.data?.message || "";

      if (serverMsg.includes("SeaNeB ID already exists")) {
        setMessage("⚠️ This SeaNeB ID is already registered. Please pick a different one.");
      } else if (serverMsg.includes("GST number already exists")) {
        setMessage("⚠️ This GST number is already registered with another business.");
      } else if (serverMsg.includes("PAN number already exists")) {
        setMessage("⚠️ This PAN number is already registered with another business.");
      } else if (serverMsg.includes("email already exists")) {
        setMessage("⚠️ This email is already registered.");
      } else if (serverMsg.includes("mobile number already exists")) {
        setMessage("⚠️ This mobile number is already registered.");
      } else if (serverMsg.includes("already linked with another business")) {
        setMessage("⚠️ This user is already linked with another business. Please select a different user.");
      } else {
        setMessage("❌ Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4 py-8">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          🏢 Register Business (No Payment)
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Google Business Search */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Search Business (Google)
            </label>
            <Select
              options={gmbOptions}
              onInputChange={(v) => {
                searchGoogleBusiness(v);
                return v;
              }}
              onChange={handleGMBSelect}
              placeholder={loadingGMB ? "Searching..." : "Search by Business Name (optional)"}
              isLoading={loadingGMB}
              isClearable
            />
          </div>

          <p className="text-center text-gray-500 text-sm">OR add manually 👇</p>

          {/* Manual Fields */}
          <input
            type="text"
            name="business_name"
            placeholder="Business Name"
            value={formData.business_name}
            onChange={handleChange}
            required
            className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <Select
            options={users}
            onChange={(e) => setFormData((p) => ({ ...p, u_id: e?.value || "" }))}
            placeholder="Select User"
            isClearable
          />

          <CreatableSelect
            options={categories}
            value={categories.filter((c) =>
              formData.business_category_ids.includes(c.value)
            )}
            onChange={(selected) =>
              setFormData((p) => ({
                ...p,
                business_category_ids: selected ? selected.map((s) => s.value) : [],
              }))
            }
            onCreateOption={(inputValue) => {
              const newOption = { value: inputValue, label: inputValue };
              setCategories((prev) => [...prev, newOption]);
              setFormData((p) => ({
                ...p,
                business_category_ids: [...p.business_category_ids, inputValue],
              }));
            }}
            placeholder="Select or type Business Categories"
            isMulti
            isClearable
          />

          {/* Contact & Address Info */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="contact_no"
              placeholder="Contact Number"
              value={formData.contact_no}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="pan_number"
              placeholder="PAN Number"
              value={formData.pan_number}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="gst_number"
              placeholder="GST Number"
              value={formData.gst_number}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <input
            type="text"
            name="website"
            placeholder="Website (optional)"
            value={formData.website}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 w-full"
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-400"
          />

          {/* Always show Search Area — editable regardless of fromGoogle */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Search Area</label>
            <Select
              options={areaOptions}
              onInputChange={(v) => {
                searchArea(v);
                return v;
              }}
              onChange={handleAreaSelect}
              placeholder="Search area..."
              isClearable
            />
          </div>

          {/* Address fields */}
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              name="area"
              placeholder="Area"
              value={formData.area}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="zip_code"
              placeholder="Zip Code"
              value={formData.zip_code}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* SeaNeB ID + edit lock */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              name="seaneb_id"
              placeholder="SeaNeB ID"
              value={formData.seaneb_id}
              onChange={handleChange}
              className={`p-3 border rounded-lg w-full text-gray-700 ${message.includes("SeaNeB ID") ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              readOnly={!formData.allowEditId}
            />
            <button
              type="button"
              onClick={toggleAllowEditId}
              className={`px-3 py-2 ${formData.allowEditId ? "bg-green-600" : "bg-yellow-500"} text-white rounded-lg hover:opacity-90 transition`}
            >
              {formData.allowEditId ? "Lock" : "Edit"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {loading ? "Registering..." : "Register Business"}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-center font-medium ${message.includes("❌") ? "text-red-600" : "text-green-700"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterBusinessNoPayment;
