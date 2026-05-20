/**
 * ServiceRequestEditDrawer — slide-in panel for full CRM edit of a service request.
 *
 * Sections: Basic Info · Location · Device · Problem · Schedule · Pricing · Assignment · Notes
 * Single Save button in footer submits all fields at once.
 * Save button hidden via PermissionGate when user lacks service_requests.update.
 */
import { useState, useEffect } from "react";
import { useServiceRequest, useUpdateServiceRequest } from "../hooks";
import { PermissionGate } from "@/shared/components/PermissionGate";
import type { SRUpdatePayload } from "../api";

// Exact enum from serviceRequest.model.ts — keep in sync with backend.
const ALL_STATUSES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Pending Verification",
  "Scheduled",
  "Pickup Requested",
  "Pickup Initiated",
  "Captain Reached Customer",
  "Pickup Done",
  "Captain Reached Vendor (Pickup)",
  "Handover to Vendor",
  "Device Received",
  "Problem Verification",
  "Problem Identification",
  "Identification Done",
  "Repair",
  "Repair Started",
  "Repair Done",
  "Admin Review Pending",
  "Customer Approval Pending",
  "Drop Requested",
  "Drop Initiated",
  "Captain Reached Vendor",
  "Handover to Captain",
  "Captain Pickup Done",
  "Device Delivered",
  "Arrived at Shop",
  "Completed",
  "Cancelled",
  "Expired",
];

const TABS = [
  "Basic Info",
  "Location",
  "Device",
  "Problem",
  "Schedule",
  "Pricing",
  "Assignment",
  "Notes",
] as const;

type Tab = (typeof TABS)[number];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500";

const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500";

interface Props {
  requestId: string;
  onClose: () => void;
}

export function ServiceRequestEditDrawer({ requestId, onClose }: Props) {
  const { data, isLoading } = useServiceRequest(requestId);
  const sr = data?.data;
  const updateMutation = useUpdateServiceRequest();

  const [activeTab, setActiveTab] = useState<Tab>("Basic Info");

  const [basicInfo, setBasicInfo] = useState({
    userName: "",
    userPhone: "",
    beneficiaryName: "",
    beneficiaryPhone: "",
    requestType: "" as "" | "self" | "other",
    status: "",
    priority: "" as "" | "low" | "medium" | "high" | "urgent",
    serviceType: "" as "" | "pickup-drop" | "visit-shop" | "onsite",
    isUrgent: false,
  });

  const [location, setLocation] = useState({
    address: "",
    city: "",
    lat: "",
    lng: "",
  });

  const [device, setDevice] = useState({
    brand: "",
    model: "",
    deviceType: "",
    deviceBrand: "",
    deviceModel: "",
  });

  const [problem, setProblem] = useState({
    problemDescription: "",
    level: "",
    minPrice: "",
    maxPrice: "",
  });

  const [schedule, setSchedule] = useState({
    preferredDate: "",
    preferredTime: "",
    scheduledDate: "",
    scheduledTime: "",
    scheduledSlot: "",
  });

  const [pricing, setPricing] = useState({
    adminFinalPrice: "",
    adminPricingNotes: "",
    adminComponentCharges: "",
    adminComponentNotes: "",
  });

  const [assignment, setAssignment] = useState({
    assignedTechnician: "",
    assignedVendor: "",
    assignedCaptain: "",
  });

  const [notes, setNotes] = useState({
    technicianNotes: "",
    scheduleNotes: "",
  });

  useEffect(() => {
    if (!sr) return;
    // Initializing multiple state slices from server data; React 18 batches these.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBasicInfo({
      userName: sr.userName ?? "",
      userPhone: sr.userPhone ?? "",
      beneficiaryName: sr.beneficiaryName ?? "",
      beneficiaryPhone: sr.beneficiaryPhone ?? "",
      requestType: (sr.requestType ?? "") as "" | "self" | "other",
      status: sr.status ?? "",
      priority: sr.priority ?? "",
      serviceType: sr.serviceType ?? "",
      isUrgent: sr.isUrgent ?? false,
    });
    setLocation({
      address: sr.address ?? sr.location?.address ?? "",
      city: sr.city ?? "",
      lat: String(sr.customerLocation?.latitude ?? sr.location?.lat ?? ""),
      lng: String(sr.customerLocation?.longitude ?? sr.location?.lng ?? ""),
    });
    setDevice({
      brand: sr.brand ?? "",
      model: sr.model ?? "",
      deviceType: sr.deviceType ?? "",
      deviceBrand: sr.deviceBrand ?? "",
      deviceModel: sr.deviceModel ?? "",
    });
    setProblem({
      problemDescription: sr.problemDescription ?? "",
      level: sr.level ?? "",
      minPrice: sr.minPrice != null ? String(sr.minPrice) : "",
      maxPrice: sr.maxPrice != null ? String(sr.maxPrice) : "",
    });
    setSchedule({
      preferredDate: sr.preferredDate ?? "",
      preferredTime: sr.preferredTime ?? "",
      scheduledDate: sr.scheduledDate ? sr.scheduledDate.slice(0, 10) : "",
      scheduledTime: sr.scheduledTime ?? "",
      scheduledSlot: sr.scheduledSlot ?? "",
    });
    setPricing({
      adminFinalPrice:
        sr.adminFinalPrice != null ? String(sr.adminFinalPrice) : "",
      adminPricingNotes: sr.adminPricingNotes ?? "",
      adminComponentCharges:
        sr.adminComponentCharges != null
          ? String(sr.adminComponentCharges)
          : "",
      adminComponentNotes: sr.adminComponentNotes ?? "",
    });
    setAssignment({
      assignedTechnician:
        typeof sr.assignedTechnician === "string" ? sr.assignedTechnician : "",
      assignedVendor:
        typeof sr.assignedVendor === "string"
          ? sr.assignedVendor
          : (sr.assignedVendor?._id ?? ""),
      assignedCaptain: sr.assignedCaptain ?? "",
    });
    setNotes({
      technicianNotes: sr.technicianNotes ?? "",
      scheduleNotes: sr.scheduleNotes ?? "",
    });
  }, [sr]);

  function buildPayload(): SRUpdatePayload {
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lng);
    const fp = parseFloat(pricing.adminFinalPrice);
    const cc = parseFloat(pricing.adminComponentCharges);
    const minP = parseFloat(problem.minPrice);
    const maxP = parseFloat(problem.maxPrice);

    return {
      // Basic Info
      userName: basicInfo.userName || undefined,
      userPhone: basicInfo.userPhone || undefined,
      beneficiaryName: basicInfo.beneficiaryName || undefined,
      beneficiaryPhone: basicInfo.beneficiaryPhone || undefined,
      requestType: basicInfo.requestType || undefined,
      status: basicInfo.status || undefined,
      priority: basicInfo.priority || undefined,
      serviceType: basicInfo.serviceType || undefined,
      isUrgent: basicInfo.isUrgent,
      // Location
      address: location.address || undefined,
      city: location.city || undefined,
      location: {
        address: location.address || undefined,
        lat: isNaN(lat) ? undefined : lat,
        lng: isNaN(lng) ? undefined : lng,
      },
      customerLocation: {
        latitude: isNaN(lat) ? undefined : lat,
        longitude: isNaN(lng) ? undefined : lng,
      },
      // Device
      brand: device.brand || undefined,
      model: device.model || undefined,
      deviceType: device.deviceType || undefined,
      deviceBrand: device.deviceBrand || undefined,
      deviceModel: device.deviceModel || undefined,
      // Problem
      problemDescription: problem.problemDescription || undefined,
      level: problem.level || undefined,
      minPrice: isNaN(minP) ? undefined : minP,
      maxPrice: isNaN(maxP) ? undefined : maxP,
      // Schedule
      preferredDate: schedule.preferredDate || undefined,
      preferredTime: schedule.preferredTime || undefined,
      scheduledDate: schedule.scheduledDate || undefined,
      scheduledTime: schedule.scheduledTime || undefined,
      scheduledSlot: schedule.scheduledSlot || undefined,
      // Pricing
      adminFinalPrice: isNaN(fp) ? undefined : fp,
      adminPricingNotes: pricing.adminPricingNotes || undefined,
      adminComponentCharges: isNaN(cc) ? undefined : cc,
      adminComponentNotes: pricing.adminComponentNotes || undefined,
      // Assignment
      assignedTechnician: assignment.assignedTechnician || undefined,
      assignedVendor: assignment.assignedVendor || undefined,
      assignedCaptain: assignment.assignedCaptain || undefined,
      // Notes
      technicianNotes: notes.technicianNotes || undefined,
      scheduleNotes: notes.scheduleNotes || undefined,
    };
  }

  function handleSave() {
    updateMutation.mutate(
      { id: requestId, updates: buildPayload() },
      { onSuccess: onClose },
    );
  }

  const saving = updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-xl bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-semibold text-base">
              Edit Service Request
            </h2>
            {sr && (
              <p className="text-slate-500 text-xs mt-0.5 font-mono">
                {sr.request_id}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex gap-1 py-2 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : !sr ? (
            <p className="text-slate-500 text-sm">Service request not found.</p>
          ) : (
            <>
              {/* ── Basic Info ── */}
              {activeTab === "Basic Info" && (
                <div className="space-y-4">
                  <Field label="Customer Name">
                    <input
                      className={inputCls}
                      value={basicInfo.userName}
                      onChange={(e) =>
                        setBasicInfo((s) => ({
                          ...s,
                          userName: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Customer Phone">
                    <input
                      className={inputCls}
                      value={basicInfo.userPhone}
                      onChange={(e) =>
                        setBasicInfo((s) => ({
                          ...s,
                          userPhone: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Request Type">
                    <select
                      className={selectCls}
                      value={basicInfo.requestType}
                      onChange={(e) =>
                        setBasicInfo((s) => ({
                          ...s,
                          requestType: e.target.value as "" | "self" | "other",
                        }))
                      }
                    >
                      <option value="">— select —</option>
                      <option value="self">Self</option>
                      <option value="other">Other (Beneficiary)</option>
                    </select>
                  </Field>
                  {basicInfo.requestType === "other" && (
                    <>
                      <Field label="Beneficiary Name">
                        <input
                          className={inputCls}
                          value={basicInfo.beneficiaryName}
                          onChange={(e) =>
                            setBasicInfo((s) => ({
                              ...s,
                              beneficiaryName: e.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Beneficiary Phone">
                        <input
                          className={inputCls}
                          value={basicInfo.beneficiaryPhone}
                          onChange={(e) =>
                            setBasicInfo((s) => ({
                              ...s,
                              beneficiaryPhone: e.target.value,
                            }))
                          }
                        />
                      </Field>
                    </>
                  )}
                  <Field label="Status">
                    <select
                      className={selectCls}
                      value={basicInfo.status}
                      onChange={(e) =>
                        setBasicInfo((s) => ({ ...s, status: e.target.value }))
                      }
                    >
                      <option value="">— select —</option>
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Priority">
                    <select
                      className={selectCls}
                      value={basicInfo.priority}
                      onChange={(e) =>
                        setBasicInfo((s) => ({
                          ...s,
                          priority: e.target.value as
                            | ""
                            | "low"
                            | "medium"
                            | "high"
                            | "urgent",
                        }))
                      }
                    >
                      <option value="">— select —</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </Field>
                  <Field label="Service Type">
                    <select
                      className={selectCls}
                      value={basicInfo.serviceType}
                      onChange={(e) =>
                        setBasicInfo((s) => ({
                          ...s,
                          serviceType: e.target.value as
                            | ""
                            | "pickup-drop"
                            | "visit-shop"
                            | "onsite",
                        }))
                      }
                    >
                      <option value="">— select —</option>
                      <option value="pickup-drop">Pickup &amp; Drop</option>
                      <option value="visit-shop">Visit Shop</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </Field>
                  <Field label="Urgent">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setBasicInfo((s) => ({ ...s, isUrgent: !s.isUrgent }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${basicInfo.isUrgent ? "bg-red-600" : "bg-slate-700"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${basicInfo.isUrgent ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                      <span className="text-slate-300 text-sm">
                        {basicInfo.isUrgent ? "Yes" : "No"}
                      </span>
                    </div>
                  </Field>
                </div>
              )}

              {/* ── Location ── */}
              {activeTab === "Location" && (
                <div className="space-y-4">
                  <Field label="Address">
                    <input
                      className={inputCls}
                      value={location.address}
                      onChange={(e) =>
                        setLocation((s) => ({ ...s, address: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="City">
                    <input
                      className={inputCls}
                      value={location.city}
                      onChange={(e) =>
                        setLocation((s) => ({ ...s, city: e.target.value }))
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude">
                      <input
                        type="number"
                        className={inputCls}
                        value={location.lat}
                        onChange={(e) =>
                          setLocation((s) => ({ ...s, lat: e.target.value }))
                        }
                      />
                    </Field>
                    <Field label="Longitude">
                      <input
                        type="number"
                        className={inputCls}
                        value={location.lng}
                        onChange={(e) =>
                          setLocation((s) => ({ ...s, lng: e.target.value }))
                        }
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Device ── */}
              {activeTab === "Device" && (
                <div className="space-y-4">
                  <Field label="Brand">
                    <input
                      className={inputCls}
                      value={device.brand}
                      onChange={(e) =>
                        setDevice((s) => ({ ...s, brand: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Model">
                    <input
                      className={inputCls}
                      value={device.model}
                      onChange={(e) =>
                        setDevice((s) => ({ ...s, model: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Device Type">
                    <input
                      className={inputCls}
                      placeholder="e.g. Laptop, Mobile, Tablet"
                      value={device.deviceType}
                      onChange={(e) =>
                        setDevice((s) => ({ ...s, deviceType: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Device Brand (legacy)">
                    <input
                      className={inputCls}
                      value={device.deviceBrand}
                      onChange={(e) =>
                        setDevice((s) => ({
                          ...s,
                          deviceBrand: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Device Model (legacy)">
                    <input
                      className={inputCls}
                      value={device.deviceModel}
                      onChange={(e) =>
                        setDevice((s) => ({
                          ...s,
                          deviceModel: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}

              {/* ── Problem ── */}
              {activeTab === "Problem" && (
                <div className="space-y-4">
                  {sr.mainProblem && (
                    <div className="bg-slate-800/60 rounded-xl p-3 text-sm text-slate-300 space-y-1">
                      <p>
                        <span className="text-slate-500">Main: </span>
                        {sr.mainProblem.title}
                      </p>
                      {sr.subProblem && (
                        <p>
                          <span className="text-slate-500">Sub: </span>
                          {sr.subProblem.title}
                        </p>
                      )}
                    </div>
                  )}
                  <Field label="Problem Description">
                    <textarea
                      className={`${inputCls} resize-none h-24`}
                      value={problem.problemDescription}
                      onChange={(e) =>
                        setProblem((s) => ({
                          ...s,
                          problemDescription: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Level">
                    <input
                      className={inputCls}
                      placeholder="e.g. L1, L2, L3"
                      value={problem.level}
                      onChange={(e) =>
                        setProblem((s) => ({ ...s, level: e.target.value }))
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Min Price (₹)">
                      <input
                        type="number"
                        className={inputCls}
                        value={problem.minPrice}
                        onChange={(e) =>
                          setProblem((s) => ({
                            ...s,
                            minPrice: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <Field label="Max Price (₹)">
                      <input
                        type="number"
                        className={inputCls}
                        value={problem.maxPrice}
                        onChange={(e) =>
                          setProblem((s) => ({
                            ...s,
                            maxPrice: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── Schedule ── */}
              {activeTab === "Schedule" && (
                <div className="space-y-4">
                  <Field label="Preferred Date">
                    <input
                      type="date"
                      className={inputCls}
                      value={schedule.preferredDate}
                      onChange={(e) =>
                        setSchedule((s) => ({
                          ...s,
                          preferredDate: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Preferred Time">
                    <input
                      className={inputCls}
                      placeholder="e.g. 10:00 AM"
                      value={schedule.preferredTime}
                      onChange={(e) =>
                        setSchedule((s) => ({
                          ...s,
                          preferredTime: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Scheduled Date">
                    <input
                      type="date"
                      className={inputCls}
                      value={schedule.scheduledDate}
                      onChange={(e) =>
                        setSchedule((s) => ({
                          ...s,
                          scheduledDate: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Scheduled Time">
                    <input
                      className={inputCls}
                      placeholder="e.g. 11:00 AM"
                      value={schedule.scheduledTime}
                      onChange={(e) =>
                        setSchedule((s) => ({
                          ...s,
                          scheduledTime: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Scheduled Slot">
                    <input
                      className={inputCls}
                      placeholder="e.g. morning, 9-12"
                      value={schedule.scheduledSlot}
                      onChange={(e) =>
                        setSchedule((s) => ({
                          ...s,
                          scheduledSlot: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}

              {/* ── Pricing ── */}
              {activeTab === "Pricing" && (
                <div className="space-y-4">
                  <Field label="Admin Final Price (₹)">
                    <input
                      type="number"
                      className={inputCls}
                      value={pricing.adminFinalPrice}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          adminFinalPrice: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Admin Pricing Notes">
                    <textarea
                      className={`${inputCls} resize-none h-20`}
                      value={pricing.adminPricingNotes}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          adminPricingNotes: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Component Charges (₹)">
                    <input
                      type="number"
                      className={inputCls}
                      value={pricing.adminComponentCharges}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          adminComponentCharges: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Component Notes">
                    <textarea
                      className={`${inputCls} resize-none h-20`}
                      value={pricing.adminComponentNotes}
                      onChange={(e) =>
                        setPricing((s) => ({
                          ...s,
                          adminComponentNotes: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}

              {/* ── Assignment ── */}
              {activeTab === "Assignment" && (
                <div className="space-y-4">
                  <p className="text-slate-500 text-xs">
                    Enter MongoDB ObjectId of the user to assign. Leave blank to
                    keep current.
                  </p>
                  <Field label="Assigned Technician ID">
                    <input
                      className={inputCls}
                      placeholder="Vendor/Technician ObjectId"
                      value={assignment.assignedTechnician}
                      onChange={(e) =>
                        setAssignment((s) => ({
                          ...s,
                          assignedTechnician: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Assigned Vendor ID">
                    <input
                      className={inputCls}
                      placeholder="Vendor ObjectId"
                      value={assignment.assignedVendor}
                      onChange={(e) =>
                        setAssignment((s) => ({
                          ...s,
                          assignedVendor: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Assigned Captain ID">
                    <input
                      className={inputCls}
                      placeholder="Captain ObjectId"
                      value={assignment.assignedCaptain}
                      onChange={(e) =>
                        setAssignment((s) => ({
                          ...s,
                          assignedCaptain: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}

              {/* ── Notes ── */}
              {activeTab === "Notes" && (
                <div className="space-y-4">
                  <Field label="Technician Notes">
                    <textarea
                      className={`${inputCls} resize-none h-28`}
                      value={notes.technicianNotes}
                      onChange={(e) =>
                        setNotes((s) => ({
                          ...s,
                          technicianNotes: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Schedule Notes">
                    <textarea
                      className={`${inputCls} resize-none h-28`}
                      value={notes.scheduleNotes}
                      onChange={(e) =>
                        setNotes((s) => ({
                          ...s,
                          scheduleNotes: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — single save button */}
        {sr && (
          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <PermissionGate
              permission="service_requests.update"
              fallback={
                <span className="text-xs text-slate-500 italic">
                  Read-only — no edit permission
                </span>
              }
            >
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </PermissionGate>
          </div>
        )}
      </div>
    </div>
  );
}
