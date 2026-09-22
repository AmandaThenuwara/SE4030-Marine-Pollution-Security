import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    MapPin,
    Loader2,
    AlertTriangle,
    PencilLine,
    ChevronRight,
    ClipboardList,
    Users,
    FileText,
    CheckCircle2,
    Clock,
    Activity,
    Flame,
    StickyNote,
} from "lucide-react";

const TASK_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`;
const VOL_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/volunteers`;

const STATUS_STEPS = ["Pending", "Assigned", "In Progress", "Completed"];

const STATUS_COLOR = {
    "Pending": "bg-[#FF2D55]",
    "Assigned": "bg-[#007AFF]",
    "In Progress": "bg-[#FF9500]",
    "Completed": "bg-[#34C759]",
};

export default function UpdateTaskModal({ open, onClose, task, onUpdated }) {
    const [form, setForm] = useState({
        status: "",
        description: "",
        priority: "",
        notes: "",
        assignedTo: "",
    });
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Seed form from task whenever task changes
    useEffect(() => {
        if (!task) return;
        setForm({
            status: task.status || "Pending",
            description: task.description || "",
            priority: task.priority || "Low",
            notes: task.notes || "",
            assignedTo: Array.isArray(task.assignedTo)
                ? (task.assignedTo[0] || "")
                : (task.assignedTo || ""),
        });
        setError("");
        setSuccess(false);
    }, [task]);

    // Fetch volunteers when sheet opens
    useEffect(() => {
        if (!open) return;
        const load = async () => {
            setFetching(true);
            try {
                const { data } = await axios.get(`${VOL_API}?available=true`);
                setVolunteers(data);
            } catch {
                // non-critical, ignore
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [open]);

    const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = async () => {
        setError("");
        setLoading(true);
        try {
            const payload = {
                status: form.status,
                description: form.description,
                priority: form.priority,
                notes: form.notes,
                assignedTo: form.assignedTo || null,
            };
            const { data } = await axios.patch(`${TASK_API}/${task._id}`, payload);
            onUpdated(data);
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onClose(); }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || "Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    const currentStepIdx = STATUS_STEPS.indexOf(form.status);

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="bg-[#0a0a0a]/95 border-l border-white/5 text-white w-full sm:max-w-lg flex flex-col shadow-2xl backdrop-blur-xl p-0"
            >
                <SheetHeader className="mb-8 pt-6 px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
                            <PencilLine className="w-5 h-5 text-white/40" />
                        </div>
                        <div className="space-y-0.5">
                            <SheetTitle className="text-xl font-normal text-white/90">Edit Task</SheetTitle>
                            <p className="text-[10px] text-white/20 uppercase">Task Management</p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-8 pb-4">

                    {/* Location snapshot */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[28px] p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5">
                            <MapPin className="w-4 h-4 text-white/30" />
                        </div>
                        <div>
                            <p className="text-[14px] font-normal text-white/80 leading-snug">{task.location?.address}</p>
                            <p className="text-[11px] text-white/20 mt-0.5">
                                {task.location?.coordinates?.lat?.toFixed(4)}, {task.location?.coordinates?.lng?.toFixed(4)}
                            </p>
                        </div>
                    </div>

                    {/* ── Status Pipeline ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-normal text-white/50 uppercase">
                            <Activity className="w-3.5 h-3.5" /> Status Pipeline
                        </div>
                        <div className="flex items-center gap-1">
                            {STATUS_STEPS.map((step, i) => {
                                const isActive = form.status === step;
                                const isPast = STATUS_STEPS.indexOf(form.status) > i;
                                return (
                                    <React.Fragment key={step}>
                                        <button
                                            onClick={() => handleChange("status", step)}
                                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[10px] font-normal transition-all ${isActive
                                                ? "bg-white text-black border-transparent"
                                                : isPast
                                                    ? "bg-white/5 border-white/5 text-white/40"
                                                    : "bg-transparent border-white/[0.06] text-white/20 hover:border-white/10 hover:text-white/40"
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? `${STATUS_COLOR[step]} shadow-[0_0_10px_rgba(255,255,255,0.3)]` : isPast ? "bg-white/30" : "bg-white/10"}`} />
                                            {step}
                                        </button>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <ChevronRight className="w-3 h-3 text-white/10 shrink-0" />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Priority ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-normal text-white/50 uppercase">
                            <Flame className="w-3.5 h-3.5" /> Priority Level
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {["Low", "Medium", "High"].map(p => (
                                <button
                                    key={p}
                                    onClick={() => handleChange("priority", p)}
                                    className={`py-3 rounded-xl border text-[11px] font-normal transition-all ${form.priority === p
                                        ? "bg-white text-black border-transparent"
                                        : "bg-white/[0.02] border-white/5 text-white/30 hover:border-white/10 hover:text-white/50"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Assigned Personnel ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-normal text-white/50 uppercase">
                            <Users className="w-3.5 h-3.5" /> Assigned Personnel
                        </div>
                        {fetching ? (
                            <div className="flex items-center justify-center py-8 bg-white/[0.02] rounded-2xl border border-white/5 gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-white/10" />
                                <span className="text-[10px] text-white/20 uppercase">Loading Units</span>
                            </div>
                        ) : (
                            <Select value={form.assignedTo} onValueChange={v => handleChange("assignedTo", v)}>
                                <SelectTrigger className="bg-white/[0.02] border-white/5 text-white/60 h-14 rounded-2xl px-5 focus:ring-0 text-[13px] font-normal transition-all focus:border-white/20">
                                    <SelectValue placeholder="Select Personnel" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white rounded-2xl shadow-2xl p-2 font-normal">
                                    <SelectItem value="unassigned" className="rounded-xl h-12 focus:bg-white focus:text-black transition-all mb-1">
                                        <span className="text-[13px] text-white/30 italic font-normal">Unassigned</span>
                                    </SelectItem>
                                    {volunteers.map(v => (
                                        <SelectItem key={v._id} value={v.name} className="rounded-xl h-12 focus:bg-white focus:text-black transition-all mb-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-normal border border-white/5 text-white/40">
                                                    {v.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-normal">{v.name}</span>
                                                    <span className="text-[10px] opacity-40 uppercase font-normal">{v.team}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* ── Description ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-normal text-white/50 uppercase">
                            <FileText className="w-3.5 h-3.5" /> Description
                        </div>
                        <textarea
                            value={form.description}
                            onChange={e => handleChange("description", e.target.value)}
                            rows={3}
                            placeholder="Update task description..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-[13px] font-normal text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-all resize-none"
                        />
                    </div>

                    {/* ── Progress Notes ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-normal text-white/50 uppercase">
                            <StickyNote className="w-3.5 h-3.5" /> Progress Notes
                        </div>
                        <textarea
                            value={form.notes}
                            onChange={e => handleChange("notes", e.target.value)}
                            rows={4}
                            placeholder="Add field notes, observations or cleanup progress..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-[13px] font-normal text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-all resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 text-red-400 text-[11px] font-normal bg-red-400/[0.03] rounded-2xl px-5 py-4 border border-red-400/10">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
                {/* ── Fixed footer buttons ── */}
                <div className="shrink-0 px-6 py-5 border-t border-white/5 bg-[#0a0a0a] flex flex-col gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className={`h-14 rounded-[20px] font-normal text-[15px] shadow-xl gap-3 transition-all active:scale-95 border-0 ${success ? "bg-[#34C759] text-white" : "bg-white hover:bg-white/90 text-black"
                            }`}
                    >
                        {loading
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                            : success
                                ? <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
                                : <><PencilLine className="w-5 h-5" /> Save Changes</>
                        }
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/20 hover:text-white/40 font-normal text-[11px] uppercase transition-all h-auto py-2"
                    >
                        Cancel
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
