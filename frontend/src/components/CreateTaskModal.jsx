import React, { useState } from "react";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, Plus, CheckCircle2 } from "lucide-react";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`;

const INITIAL_FORM = {
    address: "",
    lat: "",
    lng: "",
    description: "",
    severity: "Medium",
    priority: "Medium",
    wasteType: "Plastic",
    workforceRequired: "",
    deadline: "",
};

// ── Validation rules ─────────────────────────────────────────────────────────
function validate(form) {
    const errs = {};

    // Address
    if (!form.address.trim()) {
        errs.address = "Address is required.";
    } else if (form.address.trim().length < 3) {
        errs.address = "Address must be at least 3 characters.";
    }

    // Latitude
    if (form.lat === "" || form.lat === null) {
        errs.lat = "Latitude is required.";
    } else {
        const lat = parseFloat(form.lat);
        if (isNaN(lat)) {
            errs.lat = "Latitude must be a number.";
        } else if (lat < -90 || lat > 90) {
            errs.lat = "Latitude must be between -90 and 90.";
        }
    }

    // Longitude
    if (form.lng === "" || form.lng === null) {
        errs.lng = "Longitude is required.";
    } else {
        const lng = parseFloat(form.lng);
        if (isNaN(lng)) {
            errs.lng = "Longitude must be a number.";
        } else if (lng < -180 || lng > 180) {
            errs.lng = "Longitude must be between -180 and 180.";
        }
    }

    // Description
    if (!form.description.trim()) {
        errs.description = "Description is required.";
    } else if (form.description.trim().length < 10) {
        errs.description = "Description must be at least 10 characters.";
    } else if (form.description.trim().length > 1000) {
        errs.description = "Description must be under 1000 characters.";
    }

    // Waste type (always valid since it's a Select with a default, but guard anyway)
    if (!["Plastic", "Oil", "Nets"].includes(form.wasteType)) {
        errs.wasteType = "Please select a valid waste type.";
    }

    // Workforce required (optional, but if entered must be a positive integer)
    if (form.workforceRequired !== "") {
        const wf = parseInt(form.workforceRequired);
        if (isNaN(wf) || wf < 0) {
            errs.workforceRequired = "Must be a non-negative whole number.";
        } else if (wf > 500) {
            errs.workforceRequired = "Personnel count seems too high (max 500).";
        }
    }

    // Deadline (optional, but if entered must be in the future)
    if (form.deadline) {
        const dl = new Date(form.deadline);
        if (isNaN(dl.getTime())) {
            errs.deadline = "Invalid date/time entered.";
        } else if (dl <= new Date()) {
            errs.deadline = "Deadline must be a future date and time.";
        }
    }

    return errs;
}

// ── Inline field error component ─────────────────────────────────────────────
function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#FF375F]">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {msg}
        </p>
    );
}

// ── Field wrapper — highlights border red when error present ─────────────────
function fieldCls(hasError) {
    return `bg-[#1f1f1f] text-white h-12 rounded-2xl placeholder:text-white/20 px-5 focus-visible:ring-0 transition-all border ${hasError ? "border-[#FF2D55]/60" : "border-transparent"
        }`;
}
function selectTriggerCls(hasError) {
    return `bg-[#1f1f1f] text-white h-12 rounded-2xl px-5 focus:ring-0 transition-all border ${hasError ? "border-[#FF2D55]/60" : "border-transparent"
        }`;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateTaskModal({ open, onClose, onCreated }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [submitted, setSubmitted] = useState(false); // track if submit was attempted

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setServerError("");
        // Clear this field's error on change (if already submitted)
        if (submitted) {
            setFieldErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleClose = () => {
        setForm(INITIAL_FORM);
        setFieldErrors({});
        setServerError("");
        setSubmitted(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);

        const errs = validate(form);
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            return;
        }

        setFieldErrors({});
        setLoading(true);
        try {
            const payload = {
                location: {
                    address: form.address.trim(),
                    coordinates: {
                        lat: parseFloat(form.lat),
                        lng: parseFloat(form.lng),
                    },
                },
                description: form.description.trim(),
                severity: form.severity,
                priority: form.priority,
                wasteType: form.wasteType,
                workforceRequired: form.workforceRequired !== "" ? parseInt(form.workforceRequired) : 0,
                ...(form.deadline && { deadline: form.deadline }),
            };
            const { data } = await axios.post(API_BASE_URL, payload);
            onCreated(data);
            setForm(INITIAL_FORM);
            setSubmitted(false);
            onClose();
        } catch (err) {
            setServerError(err.response?.data?.message || "Failed to create task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const errorCount = Object.keys(fieldErrors).length;

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent side="right" className="bg-[#111111] border-white/5 text-white w-full sm:max-w-md flex flex-col shadow-2xl p-0">
                <SheetHeader className="mb-4 pt-6 px-6 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl">
                                <Plus className="w-5 h-5 text-black" />
                            </div>
                            <SheetTitle className="text-xl font-bold text-white">Add Cleanup Task</SheetTitle>
                        </div>
                    </div>

                    {/* Validation summary banner */}
                    {errorCount > 0 && (
                        <div className="flex items-center gap-3 mt-3 px-4 py-3 rounded-2xl bg-[#FF2D55]/10 border border-[#FF2D55]/20">
                            <AlertTriangle className="w-4 h-4 text-[#FF375F] shrink-0" />
                            <p className="text-xs text-[#FF375F]">
                                {errorCount} field{errorCount > 1 ? "s need" : " needs"} attention before submitting.
                            </p>
                        </div>
                    )}
                    {serverError && (
                        <div className="flex items-center gap-3 mt-3 px-4 py-3 rounded-2xl bg-[#FF2D55]/10 border border-[#FF2D55]/20">
                            <AlertTriangle className="w-4 h-4 text-[#FF375F] shrink-0" />
                            <p className="text-xs text-[#FF375F]">{serverError}</p>
                        </div>
                    )}
                </SheetHeader>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-4">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* ── Location ── */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">Location Context</p>

                            <div>
                                <Label className="text-sm font-medium text-white/70 mb-2 block">
                                    Address <span className="text-[#FF375F]">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Unawatuna Beach, Sri Lanka"
                                    value={form.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    className={fieldCls(!!fieldErrors.address)}
                                />
                                <FieldError msg={fieldErrors.address} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">
                                        Latitude <span className="text-[#FF375F]">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="6.0174"
                                        value={form.lat}
                                        onChange={(e) => handleChange("lat", e.target.value)}
                                        className={fieldCls(!!fieldErrors.lat)}
                                    />
                                    <FieldError msg={fieldErrors.lat} />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">
                                        Longitude <span className="text-[#FF375F]">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="80.2489"
                                        value={form.lng}
                                        onChange={(e) => handleChange("lng", e.target.value)}
                                        className={fieldCls(!!fieldErrors.lng)}
                                    />
                                    <FieldError msg={fieldErrors.lng} />
                                </div>
                            </div>
                        </div>

                        {/* ── Task Details ── */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">Task Details</p>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-white/70">
                                        Description <span className="text-[#FF375F]">*</span>
                                    </Label>
                                    <span className={`text-[11px] ${form.description.length > 900 ? "text-[#FF375F]" : "text-white/20"}`}>
                                        {form.description.length}/1000
                                    </span>
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Provide specific cleanup instructions and details about the pollution..."
                                    value={form.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    className={`w-full rounded-2xl bg-[#1f1f1f] text-white placeholder:text-white/20 px-5 py-4 text-sm focus:outline-none focus:ring-0 resize-none min-h-[110px] transition-all border ${fieldErrors.description ? "border-[#FF2D55]/60" : "border-transparent"
                                        }`}
                                />
                                <FieldError msg={fieldErrors.description} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">Severity</Label>
                                    <Select value={form.severity} onValueChange={(v) => handleChange("severity", v)}>
                                        <SelectTrigger className={selectTriggerCls(false)}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1f1f1f] border-white/5 text-white rounded-2xl shadow-2xl">
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">Priority</Label>
                                    <Select value={form.priority} onValueChange={(v) => handleChange("priority", v)}>
                                        <SelectTrigger className={selectTriggerCls(false)}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1f1f1f] border-white/5 text-white rounded-2xl shadow-2xl">
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* ── Additional ── */}
                        <div className="space-y-3">
                            <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.1em]">Resources</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">Waste Type</Label>
                                    <Select value={form.wasteType} onValueChange={(v) => handleChange("wasteType", v)}>
                                        <SelectTrigger className={selectTriggerCls(!!fieldErrors.wasteType)}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1f1f1f] border-white/5 text-white rounded-2xl shadow-2xl">
                                            <SelectItem value="Plastic">Plastic Waste</SelectItem>
                                            <SelectItem value="Oil">Oil Leakage</SelectItem>
                                            <SelectItem value="Nets">Ghost Nets</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError msg={fieldErrors.wasteType} />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-white/70 mb-2 block">Personnel Req.</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="500"
                                        placeholder="e.g. 5"
                                        value={form.workforceRequired}
                                        onChange={(e) => handleChange("workforceRequired", e.target.value)}
                                        className={fieldCls(!!fieldErrors.workforceRequired)}
                                    />
                                    <FieldError msg={fieldErrors.workforceRequired} />
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-white/70 mb-2 block">
                                    Deadline <span className="text-white/30 text-xs font-normal">(optional)</span>
                                </Label>
                                <Input
                                    type="datetime-local"
                                    value={form.deadline}
                                    onChange={(e) => handleChange("deadline", e.target.value)}
                                    className={`${fieldCls(!!fieldErrors.deadline)} [color-scheme:dark]`}
                                />
                                <FieldError msg={fieldErrors.deadline} />
                            </div>
                        </div>
                    </form>
                </div>

                {/* ── Fixed footer ── */}
                <div className="shrink-0 px-6 py-5 border-t border-white/5 bg-[#111111] flex flex-col gap-3">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-white hover:bg-white/90 text-black h-14 rounded-[20px] font-semibold text-[15px] shadow-xl gap-3 transition-all active:scale-95 border-0"
                    >
                        {loading
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Registering...</>
                            : <><CheckCircle2 className="w-5 h-5" /> Submit Task</>
                        }
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={handleClose}
                        className="text-white/20 hover:text-white/40 font-normal text-[11px] uppercase transition-all h-auto py-2"
                    >
                        Dismiss
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
