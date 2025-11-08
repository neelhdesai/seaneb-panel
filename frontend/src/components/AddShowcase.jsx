import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import imageCompression from "browser-image-compression";

const AddShowcase = () => {
  const [businesses, setBusinesses] = useState([]);
  const [formData, setFormData] = useState({
    business_u_id: "",
    description: "",
    mediaFile: null,
    thumbnailFile: null,
    media_url: "",
    thumbnail: "",
    type: "",
  });
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingPromote, setLoadingPromote] = useState(false);
  const [businessData, setBusinessData] = useState([]); // store full business list
  const [selectedBusiness, setSelectedBusiness] = useState(null); // store chosen business

  // ✅ Refs for clearing Select & file input
  const selectRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get(
          "https://api.seaneb.com/api/mobile/get-business-list"
        );
        const data = res.data?.data || [];

        const opts = data.map((b) => ({
          value: b.u_id,
          label: `${b.business_name} (${b.area || b.city || "N/A"})`,
        }));

        setBusinesses(opts);
        setBusinessData(data); // ✅ store full data for reference later
      } catch (err) {
        console.error("Error fetching businesses:", err);
      }
    };
    fetchBusinesses();
  }, []);

  // 🔹 Generate video thumbnail
  const generateVideoThumbnail = (file) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.currentTime = 1;

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      };
    });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type.startsWith("video") ? "video" : "image";
    setFormData((prev) => ({ ...prev, type }));
    setPreview(URL.createObjectURL(file));

    if (type === "video") {
      // 🎞️ Existing video thumbnail logic
      const thumbBlob = await generateVideoThumbnail(file);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const timestamp = Date.now();
      const thumbFileName = `${timestamp}_${baseName}_thumb.png`;
      const thumbFile = new File([thumbBlob], thumbFileName, {
        type: "image/png",
      });
      setFormData((prev) => ({
        ...prev,
        mediaFile: file,
        thumbnailFile: thumbFile,
      }));
      setThumbPreview(URL.createObjectURL(thumbFile));
    } else {
      try {
        // 🧩 PNG Compression
        const options = {
          maxWidthOrHeight: 1080, // keep HD, resize only if too big
          fileType: "image/png",
          useWebWorker: true,
        };

        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File(
          [compressedBlob],
          `${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.png`,
          { type: "image/png" }
        );

        console.log(
          `Compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
            compressedFile.size /
            1024 /
            1024
          ).toFixed(2)}MB`
        );

        setFormData((prev) => ({ ...prev, mediaFile: compressedFile }));
        setThumbPreview(URL.createObjectURL(compressedFile));
      } catch (err) {
        console.error("Image compression failed:", err);
        setFormData((prev) => ({ ...prev, mediaFile: file }));
        setThumbPreview(URL.createObjectURL(file));
      }
    }
  };

  // 🔹 Upload file(s)
  const uploadFile = async (file, thumbFile) => {
    const token = localStorage.getItem("token");

    // 🧾 1️⃣ Upload main media file
    const mediaForm = new FormData();
    mediaForm.append("mediaFile", file);
    mediaForm.append("business_u_id", formData.business_u_id);

    const mediaRes = await axios.post(
      "https://api.seaneb.com/api/mobile/upload-showcase-media",
      mediaForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Extract response data safely
    const mediaData = mediaRes.data?.data;

    if (!mediaRes.data.status || !mediaData?.media_url) {
      throw new Error(mediaRes.data?.message || "Media upload failed");
    }

    let thumbnailUrl = "";

    // 🧾 2️⃣ Upload video thumbnail if exists
    if (thumbFile) {
      const thumbForm = new FormData();
      thumbForm.append("mediaFile", thumbFile);
      thumbForm.append("business_u_id", formData.business_u_id);

      const thumbRes = await axios.post(
        "https://api.seaneb.com/api/mobile/upload-showcase-media",
        thumbForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const thumbData = thumbRes.data?.data;
      if (thumbRes.data.status && thumbData?.media_url) {
        thumbnailUrl = thumbData.media_url;
      }
    }

    // ✅ 3️⃣ Return URLs for DB save
    return {
      media_url: mediaData.media_url,
      thumbnail: thumbnailUrl || mediaData.thumbnail || mediaData.media_url,
    };
  };

  // 🔹 Hashtag handling
  const handleHashtagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = hashtagInput.trim().replace(/[#@]/g, "");
      if (trimmed) {
        const tag = `#${trimmed}`;
        if (!hashtags.includes(tag)) setHashtags([...hashtags, tag]);
      }
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag) => setHashtags(hashtags.filter((t) => t !== tag));

  const handleSubmit = async (e, promote = false) => {
    e.preventDefault();
    if (!formData.business_u_id || !formData.description || !formData.mediaFile)
      return setMessage("⚠️ Please fill all fields and upload a file.");

    if (promote) setLoadingPromote(true);
    else setLoadingAdd(true);
    setMessage("");

    try {
      const uploadData = await uploadFile(
        formData.mediaFile,
        formData.thumbnailFile
      );
      const cleanPath = (url) =>
        url ? url.replace(/^https?:\/\/[^/]+\/seaneb\//, "") : "";

      const payload = {
        business_u_id: formData.business_u_id,
        description: formData.description,
        hashtags,
        media_url: cleanPath(uploadData.media_url),
        thumbnail: cleanPath(uploadData.thumbnail),
        type: formData.type,

        // ✅ Required for promote
        city: selectedBusiness?.city || "",
        area: selectedBusiness?.area || "",
        business_category: selectedBusiness?.business_category || "",
      };


      const token = localStorage.getItem("token");
      const endpoint = promote
        ? "https://api.seaneb.com/api/mobile/add-promote-showcase"
        : "https://api.seaneb.com/api/mobile/add-showcase";

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const success =
        res.data.success === true ||
        res.data.status === true ||
        res.data.data?.success === true ||
        res.data.data?.status === true;

      if (success) {
        setMessage(
          promote
            ? "Showcase added and promoted successfully!"
            : "Showcase added successfully!"
        );

        setFormData({
          business_u_id: "",
          description: "",
          mediaFile: null,
          thumbnailFile: null,
          media_url: "",
          thumbnail: "",
          type: "",
        });
        setPreview(null);
        setThumbPreview(null);
        setHashtags([]);
        setHashtagInput("");

        if (selectRef.current) selectRef.current.clearValue();
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage(`⚠️ ${res.data.message || "Unknown server response"}`);
      }
    } catch (err) {
      console.error("Error adding showcase:", err);
      setMessage(`❌ ${err.message || "Failed to add showcase"}`);
    } finally {
      if (promote) setLoadingPromote(false);
      else setLoadingAdd(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 p-8">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          🎬 Add Showcase
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block font-medium text-gray-700">
            Select Business
          </label>
          <Select
            ref={selectRef}
            options={businesses}
            onChange={(e) => {
              const selected = businessData.find((b) => b.u_id === e?.value);
              setSelectedBusiness(selected || null);
              setFormData((p) => ({ ...p, business_u_id: e?.value || "" }));
            }}
            placeholder="Search business..."
            isClearable
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter description"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            rows={3}
          />

          {/* Hashtags */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Hashtags
            </label>
            <div className="border rounded-lg p-2 flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="text-blue-500 hover:text-red-500"
                  >
                    ❌
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="Type and press Enter"
                className="flex-1 p-2 outline-none"
              />
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Upload Image/Video
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border rounded-lg p-2"
            />

            {preview && (
              <div className="mt-3">
                {formData.type === "video" ? (
                  <video
                    src={preview}
                    controls
                    className="rounded-lg w-full h-64 object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="rounded-lg w-full h-64 object-cover"
                  />
                )}
              </div>
            )}

            {thumbPreview && formData.type === "video" && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Generated Thumbnail:
                </p>
                <img
                  src={thumbPreview}
                  alt="Thumbnail Preview"
                  className="rounded-lg w-full h-48 object-cover border"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              disabled={loadingAdd || loadingPromote}
              onClick={(e) => handleSubmit(e, false)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              {loadingAdd ? "Uploading..." : "Add Showcase"}
            </button>

            <button
              type="button"
              disabled={loadingAdd || loadingPromote}
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all"
            >
              {loadingPromote ? "Processing..." : "Add & Promote"}
            </button>
          </div>
        </form>

        {message && (
          <p
            className={`mt-5 text-center font-medium ${
              message.startsWith("✅")
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

export default AddShowcase;
