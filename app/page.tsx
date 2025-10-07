"use client";
// components/PreShiftInspectionForm.tsx
import React, { useEffect, useState } from "react";
import { CHECKLIST_ROWS, ChecklistRow, Option, OPTION_COLORS } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function PreShiftInspectionForm() {
  const [operatorName, setOperatorName] = useState("");
  const [equipment, setEquipment] = useState("");
  const [equipmentOptions, setEquipmentOptions] = useState<string[]>([]);
  const [hourMeter, setHourMeter] = useState("");
  const [location, setLocation] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [siteType, setSiteType] = useState<"Standard Site" | "MSHA Site" | "">(
    ""
  );
  const [rows, setRows] = useState<ChecklistRow[]>(CHECKLIST_ROWS);
  const [machineStatus, setMachineStatus] = useState<"Running" | "Down" | "">(
    ""
  );
  const [issuesDetailed, setIssuesDetailed] = useState("");
  const [priority, setPriority] = useState<
    "N/A NONE" | "Critical" | "Medium" | "Low" | ""
  >("");
  const [photos, setPhotos] = useState<Array<{ file: File; url: string; uploading: boolean }>>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // generate previews when photos change
  useEffect(() => {
    const urls = photos.map((p) => URL.createObjectURL(p.file));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  async function uploadSingleImage(file: File, index: number) {
    try {
      setPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, uploading: true } : p
      ));
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      setPhotos(prev => prev.map((p, i) => 
        i === index ? { ...p, url: data.url, uploading: false } : p
      ));
      setUploadError(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image. Please try again.');
      setPhotos(prev => prev.filter((_, i) => i !== index));
    }
  }

  useEffect(() => {
    // Fetch locations and equipment options when component mounts
    async function fetchOptions() {
      try {
        const start = performance.now();

        const [locRes, equipRes] = await Promise.all([
          fetch(`${API_URL}?type=locations`),
          fetch(`${API_URL}?type=equipments`)
        ]);

        const end = performance.now();
        console.log(`Options fetch time: ${(end - start).toFixed(2)} ms`);

        if (!locRes.ok || !equipRes.ok) {
          throw new Error('Failed to fetch options');
        }

        const locations = await locRes.json();
        const equipments = await equipRes.json();

        setLocationOptions(locations.locations);
        setEquipmentOptions(equipments.equipments);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    }

    fetchOptions();
  }, []);

  function setRowValue(id: string, value: Option) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const chosen = Array.from(e.target.files).slice(0, 5 - photos.length); // max 5
    
    const newPhotos = chosen.map(file => ({
      file,
      url: '',
      uploading: false
    }));
    
    setPhotos(prev => [...prev, ...newPhotos]);
    e.currentTarget.value = ''; // reset input
    
    // Upload each new photo
    newPhotos.forEach((photo, index) => {
      const totalIndex = photos.length + index;
      uploadSingleImage(photo.file, totalIndex);
    });
  }

  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  }

  function getPhotoUrls(): string[] {
    return photos.map(p => p.url).filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitMessage(null);

    // Basic required checks
    if (
      !operatorName.trim() ||
      !equipment.trim() ||
      !hourMeter.trim() ||
      !location.trim() ||
      !siteType
    ) {
      setSubmitMessage(
        "Please fill required fields: Operator Name, Equipment, Hour Meter, Location, Site Type."
      );
      return;
    }

    try {
      if (photos.some(p => p.uploading)) {
        setSubmitMessage("Please wait for all photos to finish uploading...");
        return;
      }
      const photoUrls = getPhotoUrls();

      setSubmitMessage("Submitting inspection...");
      const payload = {
        "Operator Name:": operatorName,
        "Equipment:": equipment,
        "Hour Meter:": hourMeter,
        "Location:": location,
        "Site Type:": siteType,
        "Machine Status:": machineStatus,
        "ISSUES DETAILED:": machineStatus === "Down" ? issuesDetailed : "",
        "Priority Level:": priority,
        "Timestamp": new Date().toISOString(),
      };

      rows.forEach((r) => {
        payload[r.label] = r.value;
      });

      photos.forEach((p, idx) => {
        payload[`Upload Issue Photos ${idx + 1}`] = p.url;
      })

      console.log(payload);

      const res = await fetch(API_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({"task": "init", "data": payload}),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Submission failed");
      }

      setSubmitMessage("Inspection submitted ✓");
      // optional: reset form
      // resetForm();
    } catch (err: any) {
      setSubmitMessage(`Error: ${err.message || err}`);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 text-slate-800">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <header className="mb-5">
          <h1 className="text-2xl p-3 mb-4 text-slate-800 pre-shift-header">
            Pre-Shift Inspection
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Complete this form before each shift. If an issue arises during the
            day, submit a new inspection.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
              Report all issues to your Foreman. Use Lock Out / Tag Out if
              required.
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            For assistance or to add equipment, contact Klayton:{" "}
            <a
              href="tel:8033007596"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              803-300-7596
            </a>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            <span className="text-red-500">*</span> Required field
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Info */}
          <section className="space-y-2">
            <label className="text-sm font-medium">
              Operator Name: <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              required
            />

            <label className="text-sm font-medium">
              Equipment: <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              required
            >
              <option value="">Select Equipment</option>
              {equipmentOptions.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>

            <label className="text-sm font-medium">
              Hour Meter: <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={hourMeter}
              onChange={(e) => setHourMeter(e.target.value)}
              required
            />

            <label className="text-sm font-medium">
              Location: <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Select Location</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <label className="text-sm font-medium">
              Site Type: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSiteType("Standard Site")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm border ${
                  siteType === "Standard Site"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                Standard Site
              </button>
              <button
                type="button"
                onClick={() => setSiteType("MSHA Site")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm border ${
                  siteType === "MSHA Site"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                MSHA Site
              </button>
            </div>
          </section>

          {/* System & Safety Checklist */}
          <section>
            <h2 className="text-sm font-medium mb-2">
              SYSTEM CHECKS & OPERATIONAL SAFETY CHECKS
            </h2>
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="bg-gray-50 rounded-lg p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{r.label}</div>
                      {r.note && (
                        <div className="text-xs text-gray-400">{r.note}</div>
                      )}
                    </div>

                    {/* segmented buttons */}
                    <div className="flex gap-1 text-white">
                      {(["Good", "Bad", "N/A"] as Option[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setRowValue(r.id, opt)}
                          className={`text-xs px-3 py-1 rounded-full border  ${
                            r.value === opt
                              ? OPTION_COLORS[opt]
                              : "bg-white text-gray-700 border-gray-200"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tap an option to select — segmented for mobile ease.
            </p>
          </section>

          {/* Machine Status */}
          <section className="space-y-2">
            <label className="text-sm font-medium">
              Machine Status: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMachineStatus("Running")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  machineStatus === "Running"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                Running
              </button>
              <button
                type="button"
                onClick={() => setMachineStatus("Down")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  machineStatus === "Down"
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
              >
                Down
              </button>
            </div>
            {machineStatus === "Down" && (
              <p className="text-xs text-red-500">
                Please inform your Foreman/Supervisor and use our Lock
                Out / Tag Out system.
              </p>
            )}
          </section>

          {/* Issues Detailed & Priority */}
          <section className="space-y-2">
            {machineStatus === "Down" && (<>
            <label className="text-sm font-medium">
              ISSUES DETAILED:
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={4}
              value={issuesDetailed}
              onChange={(e) => setIssuesDetailed(e.target.value)}
              placeholder="Describe any issues / damages / codes. Ex. Broken Mirror - Describe if its the glass, the plastic back piece, etc."
            /></>
            )}
            <label className="text-sm font-medium">
              Priority Level: <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 text-white">
              {(
                ["N/A NONE", "Critical", "Medium", "Low"] as (typeof priority)[]
              ).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                    priority === p
                      ? OPTION_COLORS[p]
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400">Use your best judgement</p>
          </section>

          {/* Photo Upload */}
          <section>
            <label className="text-sm font-medium">
              Upload Issue Photos (up to 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-gray-100 mt-2"
            />
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {previews.map((src, i) => (
                <div
                  key={i}
                  className="relative w-28 h-20 rounded-md overflow-hidden bg-gray-100"
                >
                  <img
                    src={src}
                    alt={`preview-${i}`}
                    className="object-cover w-full h-full"
                  />
                  {photos[i]?.uploading ? (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Uploaded files: maximum 5. Max 100 MB per file enforced on server
              side.
            </p>
          </section>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-medium shadow"
              disabled={photos.some(p => p.uploading)}
            >
              {photos.some(p => p.uploading) ? "Uploading..." : "Submit Inspection"}
            </button>
            {submitMessage && (
              <p className="text-sm mt-2 text-center text-gray-600">
                {submitMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
