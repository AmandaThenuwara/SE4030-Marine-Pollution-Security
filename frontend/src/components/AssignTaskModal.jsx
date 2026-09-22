import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Loader2, AlertTriangle, UserPlus, ShieldCheck } from "lucide-react";

const TASK_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`;
const VOL_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/volunteers`;

const priorityColors = {
    High: "text-red-400 bg-red-400/10",
    Medium: "text-orange-400 bg-orange-400/10",
    Low: "text-blue-400 bg-blue-400/10",
};

export default function AssignTaskModal({ open, onClose, task, onAssigned }) {
    const [volunteers, setVolunteers] = useState([]);
    const [volunteerId, setVolunteerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setVolunteerId("");
        setError("");
        const fetchVolunteers = async () => {
            setFetching(true);
            try {
                const { data } = await axios.get(`${VOL_API}?available=true`);
                setVolunteers(data);
            } catch {
                setError("Could not load volunteers.");
            } finally {
                setFetching(false);
            }
        };
        fetchVolunteers();
    }, [open]);

    const handleAssign = async () => {
        if (!volunteerId) {
            setError("Please select a volunteer or team.");
            return;
        }
        setLoading(true);
        try {
            const selected = volunteers.find((v) => v._id === volunteerId);
            const assignLabel = selected?.team !== "Individual"
                ? selected.team
                : selected.name;

            const { data } = await axios.patch(`${TASK_API}/${task._id}/assign`, {
                volunteerId: assignLabel,
            });
            onAssigned(data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Assignment failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!task) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="bg-[#0a0a0a]/95 border-l border-white/5 text-white w-full sm:max-w-md flex flex-col shadow-2xl backdrop-blur-xl p-0">
                <SheetHeader className="mb-8 pt-6 px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl shadow-xl">
                            <ShieldCheck className="w-6 h-6 text-white/40" />
                        </div>
                        <div className="space-y-0.5">
                            <SheetTitle className="text-xl font-normal text-white/90">Deploy Personnel</SheetTitle>
                            <p className="text-[10px] text-white/20 uppercase">Operations Command</p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-6 space-y-8 pb-4">
                    {/* Task Snapshot */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-normal text-white/20 uppercase">Target Location</p>
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 bg-white/5">
                                    <MapPin className="w-5 h-5 text-white/30" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-normal text-white/80 text-[15px] leading-snug">{task.location?.address}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-normal px-2.5 py-1 rounded-full border bg-white/[0.03] border-white/5 text-white/40 uppercase`}>
                                            <div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                            {task.priority || "Low"} Priority
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-[13px] text-white/30 leading-relaxed font-normal bg-white/[0.01] p-4 rounded-2xl">
                                "{task.description}"
                            </div>
                        </div>
                    </div>

                    {/* Volunteer Selection */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-normal text-white/20 uppercase">Available Units</p>
                        {fetching ? (
                            <div className="flex flex-col items-center justify-center py-12 bg-white/[0.02] rounded-[32px] gap-4 border border-white/5 border-dashed">
                                <Loader2 className="w-6 h-6 animate-spin text-white/10" />
                                <span className="text-[10px] font-normal text-white/20 uppercase">Scanning Registry</span>
                            </div>
                        ) : (
                            <Select value={volunteerId} onValueChange={setVolunteerId}>
                                <SelectTrigger className="bg-white/[0.02] border-white/5 text-white/70 h-16 rounded-[24px] px-6 focus:ring-0 shadow-lg text-[14px] font-normal ring-0 focus:border-white/20 transition-all">
                                    <SelectValue placeholder="Select Deployment Unit" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f0f] border border-white/10 text-white rounded-[24px] shadow-2xl p-2 font-normal overflow-hidden">
                                    {volunteers.length === 0 ? (
                                        <div className="py-10 text-center text-white/20 text-[11px] font-normal uppercase">
                                            No Base Units Available
                                        </div>
                                    ) : (
                                        volunteers.map((v) => (
                                            <SelectItem
                                                key={v._id}
                                                value={v._id}
                                                className="rounded-xl h-14 focus:bg-white focus:text-black transition-all mb-1 last:mb-0"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-normal border border-white/5 text-white/40">
                                                        {v.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px] font-normal">{v.name}</span>
                                                        <span className="text-[10px] opacity-40 uppercase font-normal">{v.team}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

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
                        onClick={handleAssign}
                        disabled={loading || fetching || volunteers.length === 0}
                        className="bg-white hover:bg-white/90 text-black h-14 rounded-[20px] font-normal text-[15px] shadow-xl gap-3 transition-all active:scale-95 border-0"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        {loading ? "Confirming..." : "Execute Deployment"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-white/20 hover:text-white/40 font-normal text-[11px] uppercase transition-all h-auto py-2"
                    >
                        Abort Deployment
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
