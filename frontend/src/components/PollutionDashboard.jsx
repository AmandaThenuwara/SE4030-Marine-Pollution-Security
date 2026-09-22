import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
    Plus,
    Search,
    MoreVertical,
    AlertTriangle,
    CheckCircle2,
    Clock,
    UserCheck,
    Trash2,
    MapPin,
    Waves,
    SlidersHorizontal,
    ChevronRight,
    Users,
    Flame,
    Droplets,
    Wind,
    Navigation,
    Info,
    X,
    LayoutList,
    Map as MapIcon,
    Pencil,
    LogOut,
} from "lucide-react";
import pureOceanLogo from "../assets/img/pureocean.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Map, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import CreateTaskModal from "./CreateTaskModal";
import AssignTaskModal from "./AssignTaskModal";
import UpdateTaskModal from "./UpdateTaskModal";
import io from "socket.io-client";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/tasks`;
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_CONFIG = {
    "Pending": { color: "bg-[#FF2D55]", text: "text-[#FF375F]", bg: "bg-[#FF2D55]/10", border: "border-[#FF2D55]/20" },
    "Assigned": { color: "bg-[#007AFF]", text: "text-[#0A84FF]", bg: "bg-[#007AFF]/10", border: "border-[#007AFF]/20" },
    "In Progress": { color: "bg-[#FF9500]", text: "text-[#FF9F0A]", bg: "bg-[#FF9500]/10", border: "border-[#FF9500]/20" },
    "Completed": { color: "bg-[#34C759]", text: "text-[#30D158]", bg: "bg-[#34C759]/10", border: "border-[#34C759]/20" },
};

const WASTE_CONFIG = {
    "Plastic": { icon: <Waves className="w-5 h-5" />, label: "Plastic Waste", color: "#00C2FF" },
    "Oil": { icon: <Droplets className="w-5 h-5" />, label: "Oil Leakage", color: "#FF9500" },
    "Nets": { icon: <Wind className="w-5 h-5" />, label: "Ghost Nets", color: "#BF5AF2" },
};

const FILTER_TABS = ["All", "Pending", "Assigned", "In Progress", "Completed"];

export default function PollutionDashboard({ hideHeader = false }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showAssign, setShowAssign] = useState(false);
    const [assignTarget, setAssignTarget] = useState(null);
    const [showUpdate, setShowUpdate] = useState(false);
    const [updateTarget, setUpdateTarget] = useState(null);
    const [showLegend, setShowLegend] = useState(true);
    const [viewMode, setViewMode] = useState("map");
    const [activeMode, setActiveMode] = useState("tasks");
    const [reports, setReports] = useState([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const { user, logout, isCleanupTaskManager, isAdmin } = useAuth();
    const navigate = useNavigate();
    const canManage = isCleanupTaskManager() || isAdmin();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        fetchTasks();
        fetchReports();

        const socket = io(SOCKET_URL);

        socket.on("task_created", (newTask) => {
            // Deduplicate: only add if not already in list
            setTasks(prev => prev.some(t => t._id === newTask._id) ? prev : [newTask, ...prev]);
        });

        socket.on("task_updated", (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            if (selectedTask?._id === updatedTask._id) setSelectedTask(updatedTask);
        });

        socket.on("task_deleted", (deletedId) => {
            setTasks(prev => prev.filter(t => t._id !== deletedId));
            if (selectedTask?._id === deletedId) setSelectedTask(null);
        });

        return () => socket.disconnect();
    }, [filterStatus]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const url = filterStatus !== "All"
                ? `${API_BASE_URL}?status=${filterStatus}`
                : API_BASE_URL;
            const { data } = await axios.get(url);
            setTasks(data);
        } catch (e) {
            console.error("DEBUG: Fetch Tasks Failed", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`${SOCKET_URL}/api/ch/reports/all/published`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(data.reports || []);
        } catch (e) {
            console.error("DEBUG: Fetch Reports Failed", e);
        }
    };

    // Don't manually add here — the socket "task_created" event already handles it
    const handleTaskCreated = () => { };
    const handleTaskAssigned = (t) => setTasks((p) => p.map((x) => x._id === t._id ? t : x));

    const handleComplete = async (id) => {
        try {
            const { data } = await axios.patch(`${API_BASE_URL}/${id}/complete`);
            setTasks((p) => p.map((x) => x._id === data._id ? data : x));
        } catch (e) { console.error(e); }
    };

    const confirmDelete = (id) => setDeleteConfirmId(id);

    const handleDelete = async () => {
        const id = deleteConfirmId;
        setDeleteConfirmId(null);
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setTasks((p) => p.filter((x) => x._id !== id));
            if (selectedTask?._id === id) setSelectedTask(null);
        } catch (e) { console.error(e); }
    };

    const openAssign = (task) => { setAssignTarget(task); setShowAssign(true); };
    const openUpdate = (task) => { setUpdateTarget(task); setShowUpdate(true); };
    const handleUpdate = (updated) => setTasks(p => p.map(x => x._id === updated._id ? updated : x));

    const filtered = tasks.filter((t) =>
        t.location.address.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={`flex h-screen bg-[#111111] text-white ${hideHeader ? 'pt-32' : 'pt-3'} overflow-hidden font-sans`}>

            {/* ── Left Task Panel ── */}
            <div className="w-[340px] rounded-r-3xl shrink-0 flex flex-col bg-[#000000]  overflow-hidden ">

                {/* Search & Tabs */}
                <div className="px-6 py-4 space-y-5">
                    {/* Main Mode Toggle (Tasks vs Reports) */}
                    <div className="flex p-1 bg-[#1a1a1a] rounded-xl border border-white/5">
                        <button
                            onClick={() => setActiveMode("tasks")}
                            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-semibold transition-all ${activeMode === "tasks" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            <LayoutList className="w-4 h-4" /> Cleanup Tasks
                        </button>
                        <button
                            onClick={() => setActiveMode("reports")}
                            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-semibold transition-all ${activeMode === "reports" ? "bg-[#3D2D68] text-[#D4C1FF] shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            <AlertTriangle className="w-4 h-4" /> Community Reports
                        </button>
                    </div>

                    <div className="relative group">
                        <Input
                            placeholder="Search location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[#1f1f1f] border-transparent pl-5 h-12 text-base text-white placeholder:text-white/30 focus-visible:ring-0 rounded-2xl transition-all shadow-inner"
                        />
                        <Search className="absolute right-4 top-3.5 h-5 w-5 text-white/20" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-normal text-white/30   mb-2">Show me:</p>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="w-full bg-[#1f1f1f] border-white/5 rounded-xl h-10 px-4 text-sm font-medium hover:bg-[#252525] transition-colors focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1f1f1f] border-white/5 text-white rounded-xl shadow-2xl">
                                        {FILTER_TABS.map(tab => (
                                            <SelectItem key={tab} value={tab} className="rounded-lg focus:bg-white focus:text-black">
                                                {tab}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-normal text-white/30   mb-2">Sort by:</p>
                                <button className="w-full bg-[#1f1f1f] border border-white/5 rounded-xl h-10 px-4 flex items-center justify-between text-sm font-medium hover:bg-[#252525] transition-colors">
                                    Nearest <ChevronRight className="w-4 h-4 text-white/20 rotate-90" />
                                </button>
                            </div>
                            <div className="pt-6">
                                <button className="bg-[#1f1f1f] border border-white/5 rounded-xl h-10 px-3 flex items-center justify-center hover:bg-[#252525] transition-colors">
                                    <SlidersHorizontal className="w-4 h-4 text-white/50" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-1 scrollbar-hide">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 && activeMode === "tasks" ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-20">
                            <Waves className="w-12 h-12 mb-2" />
                            <p className="text-sm font-normal">NO TASKS</p>
                        </div>
                    ) : activeMode === "reports" && reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 opacity-20">
                            <AlertTriangle className="w-12 h-12 mb-2" />
                            <p className="text-sm font-normal">NO REPORTS</p>
                        </div>
                    ) : activeMode === "reports" ? (
                        reports.filter(r => r.title.toLowerCase().includes(search.toLowerCase())).map((report) => (
                            <div
                                key={report._id}
                                onClick={() => setSelectedTask(selectedTask?._id === report._id ? null : report)}
                                className={`group flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all ${selectedTask?._id === report._id ? "bg-[#1f1f1f] shadow-2xl" : "hover:bg-white/[0.02]"}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#BF5AF2] flex items-center justify-center p-1.5 shadow-lg overflow-hidden border border-white/10 shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white/90 truncate">{report.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest">{report.severity}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="text-[10px] text-[#BF5AF2] font-black uppercase">Community Report</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        filtered.map((task) => {
                            const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG["Pending"];
                            const wc = WASTE_CONFIG[task.wasteType] || WASTE_CONFIG["Plastic"];
                            const isSelected = selectedTask?._id === task._id;

                            return (
                                <div
                                    key={task._id}
                                    onClick={() => setSelectedTask(isSelected ? null : task)}
                                    className={`group flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all ${isSelected ? "bg-[#1f1f1f] shadow-2xl" : "hover:bg-white/[0.02]"
                                        }`}
                                >
                                    <div className="relative">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center p-1.5 shadow-lg overflow-hidden border border-white/10"
                                            style={{ backgroundColor: wc.color }}
                                        >
                                            <div className="text-white">
                                                {task.wasteType === "Plastic" ? <Waves className="w-4 h-4" /> :
                                                    task.wasteType === "Oil" ? <Droplets className="w-4 h-4" /> :
                                                        <Wind className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 rounded-full border-2 border-[#000000] ${sc.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-[15px] font-normal text-white truncate">{task.location.address}</h3>
                                            {/* 3-dot dropdown */}
                                            {canManage && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-white/20 hover:text-white/60 shrink-0"
                                                        >
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-1.5 min-w-[160px] shadow-2xl"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <DropdownMenuItem
                                                            onClick={() => openAssign(task)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-normal text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
                                                        >
                                                            <UserCheck className="w-4 h-4" /> Assign
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openUpdate(task)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-normal text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
                                                        >
                                                            <Pencil className="w-4 h-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5 my-1" />
                                                        <DropdownMenuItem
                                                            onClick={() => confirmDelete(task._id)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-normal text-[#FF375F] hover:text-white hover:bg-[#FF2D55] cursor-pointer transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-normal px-2 py-1 rounded border border-white/20 text-white/60">{task.status}</span>
                                            <span className="text-xs text-white/40 font-normal ml-auto">0.5 mi</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Map / Table Panel ── */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                {hideHeader && (
                    <div className="absolute top-4 left-4 right-4 z-[40] flex items-center justify-between pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* Hidden spacer to push right actions */}
                        <div />

                        <div className="flex items-center gap-3 pointer-events-auto">
                            {/* Search Input Floating */}
                            <div className="relative group hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Search map..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-2xl h-12 pl-12 pr-6 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-64 shadow-2xl"
                                />
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/20" />
                            </div>

                            {/* Compact View Mode Toggle */}
                            <div className="flex items-center bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1 shadow-2xl">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold transition-all ${viewMode === "map"
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    <MapIcon className="w-4 h-4" /> Map
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold transition-all ${viewMode === "table"
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    <LayoutList className="w-4 h-4" /> Table
                                </button>
                            </div>

                            {canManage && (
                                <button
                                    onClick={() => setShowCreate(true)}
                                    className="h-12 px-6 rounded-2xl bg-white hover:bg-white/90 text-black font-bold text-sm shadow-2xl transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add Task
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {!hideHeader && (
                    <header className="absolute top-3 left-4 right-4 h-16 flex items-center justify-between px-6 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl z-40 transition-all shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-32 flex items-center justify-start overflow-hidden">
                                <img src={pureOceanLogo} alt="pureocean" className="h-full w-full object-contain object-left" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">pure<span className="text-blue-400">ocean</span></span>
                            <div className="ml-4 p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer hidden sm:flex">
                                <Search className="w-4 h-4 text-white/40" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => setViewMode("map")}
                                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all ${viewMode === "map"
                                        ? "bg-white text-black shadow"
                                        : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    <MapIcon className="w-3.5 h-3.5" /> Map
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all ${viewMode === "table"
                                        ? "bg-white text-black shadow"
                                        : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    <LayoutList className="w-3.5 h-3.5" /> Table
                                </button>
                            </div>

                            {canManage && (
                                <Button
                                    onClick={() => setShowCreate(true)}
                                    className="bg-white hover:bg-white/90 text-black font-bold h-10 px-6 rounded-xl shadow-xl transition-all active:scale-95"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Task
                                </Button>
                            )}

                            {/* Divider */}
                            <div className="w-px h-6 bg-white/10" />

                            {/* User Chip + Logout */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl h-10 px-3">
                                    {/* Initials Avatar */}
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-white uppercase">
                                            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CT'}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-white/60 max-w-[120px] truncate hidden sm:block">
                                        {user?.name || 'Cleanup Manager'}
                                    </span>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    title="Sign out"
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#FF375F] hover:bg-[#FF2D55]/10 hover:border-[#FF2D55]/20 transition-all active:scale-95"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {viewMode === "table" && (
                    <div className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-3xl flex items-center justify-center p-4 pt-36 pb-10 md:p-8 md:pt-36 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-full max-w-[1600px] h-full max-h-[900px] bg-[#0a0a0a]/95 border border-white/5 rounded-[40px] flex flex-col overflow-hidden shadow-2xl">

                            {/* Overlay Header */}
                            <div className="h-24 shrink-0 flex items-center justify-between px-10 border-b border-white/5 bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/10 p-2 rounded-xl">
                                        <LayoutList className="w-5 h-5 text-white/70" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-normal text-white/90">Task Directory</h2>
                                        <p className="text-[10px] text-white/20 uppercase mt-0.5">Live Data Feed</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5">
                                        <button
                                            onClick={() => setViewMode("map")}
                                            className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-normal text-white/60 hover:text-white transition-all"
                                        >
                                            <MapIcon className="w-4 h-4" /> Switch to Map
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setViewMode("map")}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Table Content */}
                            <div className="flex-1 overflow-auto px-10 py-8 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                                        <p className="text-xs text-white/20">Accessing archives...</p>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full opacity-10">
                                        <Waves className="w-16 h-16 mb-4" />
                                        <p className="text-lg font-normal">NO RECORDS FOUND</p>
                                    </div>
                                ) : (
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4 first:pl-0">Location</th>
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4">Category</th>
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4">Priority</th>
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4">Status</th>
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4">Personnel</th>
                                                <th className="text-left text-[10px] font-normal text-white/20 uppercase py-5 px-4">Deadline</th>
                                                {canManage && <th className="text-right text-[10px] font-normal text-white/20 uppercase py-5 px-4 last:pr-0">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.02]">
                                            {activeMode === "reports" ? (
                                                reports.filter(r => r.title.toLowerCase().includes(search.toLowerCase())).map((report) => (
                                                    <tr key={report._id} className="group hover:bg-white/[0.01] transition-colors">
                                                        <td className="py-6 px-4 pl-0">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner bg-[#BF5AF2]">
                                                                    <AlertTriangle className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div>
                                                                    <span className="block text-sm font-normal text-white/90 mb-0.5">{report.location.address}</span>
                                                                    <span className="text-[11px] text-white/30 flex items-center gap-1">
                                                                        {report.location?.lat?.toFixed?.(3) || "0.000"}, {report.location?.lng?.toFixed?.(3) || "0.000"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-4">
                                                            <span className="text-[13px] text-[#BF5AF2] font-black uppercase">Community Report</span>
                                                        </td>
                                                        <td className="py-6 px-4 text-white/40 uppercase text-xs">{report.severity}</td>
                                                        <td className="py-6 px-4 text-white/20 uppercase text-[10px]">Published</td>
                                                        <td className="py-6 px-4 text-white/40 text-xs">{report.ownerId?.name || "Anonymous"}</td>
                                                        <td className="py-6 px-4 text-white/20 text-[10px] italic">Via Community Hub</td>
                                                        <td></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                filtered.map((task) => {
                                                    const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG["Pending"];
                                                    const wc = WASTE_CONFIG[task.wasteType] || WASTE_CONFIG["Plastic"];

                                                    return (
                                                        <tr key={task._id} className="group hover:bg-white/[0.01] transition-colors">
                                                            <td className="py-6 px-4 pl-0">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner" style={{ backgroundColor: wc.color }}>
                                                                        <div className="text-white">
                                                                            {task.wasteType === "Plastic" ? <Waves className="w-4 h-4" /> :
                                                                                task.wasteType === "Oil" ? <Droplets className="w-4 h-4" /> :
                                                                                    <Wind className="w-4 h-4" />}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-sm font-normal text-white/90 mb-0.5">{task.location.address}</span>
                                                                        <span className="text-[11px] text-white/30 flex items-center gap-1">
                                                                            {task.location.coordinates.lat.toFixed(3)}, {task.location.coordinates.lng.toFixed(3)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td className="py-6 px-4">
                                                                <span className="text-[13px] text-white/50 font-normal">{wc.label}</span>
                                                            </td>

                                                            <td className="py-6 px-4">
                                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-normal px-3 py-1 bg-white/[0.03] border border-white/[0.05] rounded-lg text-white/40 uppercase">
                                                                    {task.priority || "Low"}
                                                                </span>
                                                            </td>

                                                            <td className="py-6 px-4">
                                                                <div className="inline-flex items-center gap-2 text-[11px] font-normal px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/60 uppercase">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${sc.color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
                                                                    {task.status}
                                                                </div>
                                                            </td>

                                                            <td className="py-6 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center text-[10px]">
                                                                        <Users className="w-3 h-3 text-white/20" />
                                                                    </div>
                                                                    <span className="text-[13px] font-normal text-white/40">
                                                                        {task.assignedTo ? (Array.isArray(task.assignedTo) ? (task.assignedTo.length > 0 ? task.assignedTo[0] : "Awaiting") : task.assignedTo) : "Awaiting"}
                                                                    </span>
                                                                </div>
                                                            </td>

                                                            <td className="py-6 px-4">
                                                                <div className="flex items-center gap-2 text-white/30">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <div className="text-[12px]">
                                                                        <div className="text-white/60">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "ASAP"}</div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {canManage && (
                                                                <td className="py-6 px-4 pr-0">
                                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => openUpdate(task)}
                                                                            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] font-normal hover:bg-white hover:text-black transition-all flex items-center gap-2"
                                                                        >
                                                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openAssign(task)}
                                                                            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] font-normal hover:bg-white hover:text-black transition-all flex items-center gap-2"
                                                                        >
                                                                            <UserCheck className="w-3.5 h-3.5" /> Assign
                                                                        </button>
                                                                        <button
                                                                            onClick={() => confirmDelete(task._id)}
                                                                            className="h-10 px-4 flex items-center gap-2 rounded-xl bg-[#FF2D55]/5 border border-[#FF2D55]/10 text-[#FF375F] text-[11px] font-normal hover:bg-[#FF2D55] hover:text-white transition-all"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === "map" ? (
                    <>
                        <Map center={[79.8631, 6.8351]} zoom={12} className="w-full h-full map-darken">
                            {filtered.map((task) => {
                                const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG["Pending"];
                                const isSelected = selectedTask?._id === task._id;
                                const wc = WASTE_CONFIG[task.wasteType] || WASTE_CONFIG["Plastic"];
                                return (
                                    <MapMarker
                                        key={task._id}
                                        latitude={task.location.coordinates.lat}
                                        longitude={task.location.coordinates.lng}
                                    >
                                        <MarkerContent>
                                            <div
                                                className="relative flex items-center justify-center group cursor-pointer"
                                                onClick={() => setSelectedTask(isSelected ? null : task)}
                                            >
                                                <div
                                                    className="absolute w-14 h-14 rounded-full animate-pulse transition-all duration-1000 opacity-40 shrink-0"
                                                    style={{ backgroundColor: wc.color }}
                                                />
                                                <div
                                                    className="absolute w-24 h-24 rounded-full transition-all duration-500 group-hover:scale-110 opacity-20 shrink-0"
                                                    style={{ backgroundColor: wc.color }}
                                                />
                                                <div
                                                    className="relative w-9 h-9 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:scale-110"
                                                    style={{ backgroundColor: wc.color, opacity: 1 }}
                                                >
                                                    <div className="text-white drop-shadow-sm">
                                                        {task.wasteType === "Plastic" ? <Waves className="w-4 h-4" /> :
                                                            task.wasteType === "Oil" ? <Droplets className="w-4 h-4" /> :
                                                                <Wind className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </MarkerContent>

                                        <MarkerTooltip>
                                            <div className="border border-white/10 rounded-3xl p-6 w-[320px]">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div
                                                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-white/10"
                                                        style={{ backgroundColor: wc.color }}
                                                    >
                                                        <div className="text-white">
                                                            {task.wasteType === "Plastic" ? <Waves className="w-8 h-8" /> :
                                                                task.wasteType === "Oil" ? <Droplets className="w-8 h-8" /> :
                                                                    <Wind className="w-8 h-8" />}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h2 className="text-xl font-normal text-white leading-snug">{task.location.address}</h2>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black tracking-widest uppercase">{task.status}</span>
                                                            <span className="text-xs text-white/40 font-medium ml-auto">0.5 mi</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats Row */}
                                                <div className="flex gap-2 mb-4">
                                                    {/* Assigned / Required tile */}
                                                    <div className="flex-1 bg-[#252525] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
                                                        <Users className="w-3.5 h-3.5 text-white/30" />
                                                        <span className="text-xs font-normal text-white">
                                                            {Array.isArray(task.assignedTo) ? task.assignedTo.length : (task.assignedTo ? 1 : 0)}
                                                            <span className="text-white/30">/{task.workforceRequired || 0}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 bg-[#252525] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-white/30" />
                                                        <span className="text-[11px] font-normal text-white text-center leading-tight">
                                                            {task.deadline ? (
                                                                <>
                                                                    {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}<br />
                                                                    {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </>
                                                            ) : 'ASAP'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 bg-[#252525] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
                                                        <Flame className="w-3.5 h-3.5 text-white/30" />
                                                        <span className="text-xs font-normal text-white uppercase">{task.priority}</span>
                                                    </div>
                                                </div>

                                                {/* Assigned progress bar */}
                                                {(() => {
                                                    const assigned = Array.isArray(task.assignedTo) ? task.assignedTo.length : (task.assignedTo ? 1 : 0);
                                                    const required = task.workforceRequired || 0;
                                                    const pct = required > 0 ? Math.min((assigned / required) * 100, 100) : 0;
                                                    return (
                                                        <div className="mb-5">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="text-[10px] text-white/30 tracking-widest uppercase">Assigned</span>
                                                                <span className="text-[10px] font-semibold text-white/60">{assigned} <span className="text-white/25">of {required}</span></span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-500"
                                                                    style={{
                                                                        width: `${pct}%`,
                                                                        backgroundColor: pct >= 100 ? '#34C759' : pct > 50 ? '#FF9500' : '#FF2D55',
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                <p className="text-[13px] text-white/60 leading-relaxed line-clamp-3 mb-5">
                                                    {task.description}
                                                </p>

                                                {canManage && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openAssign(task); }}
                                                        className="w-full h-14 rounded-2xl bg-white hover:bg-white/90 text-black text-sm font-bold shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                                    >
                                                        <Users className="w-4 h-4" /> Assign Volunteer
                                                    </button>
                                                )}
                                            </div>
                                        </MarkerTooltip>
                                    </MapMarker>
                                );
                            })}

                            {/* Community Reports Markers */}
                            {reports.filter(r => r.location?.lat != null && r.location?.lng != null).map((report) => (
                                <MapMarker
                                    key={report._id}
                                    latitude={report.location.lat}
                                    longitude={report.location.lng}
                                    onClick={() => setSelectedTask(report)}
                                >
                                    <MarkerContent>
                                        <div className="relative flex items-center justify-center group cursor-pointer">
                                            <div className="absolute w-12 h-12 rounded-full animate-pulse opacity-40 bg-[#BF5AF2]" />
                                            <div className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-[#BF5AF2]">
                                                <AlertTriangle className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </MarkerContent>
                                    <MarkerTooltip>
                                        <div className="w-[300px] bg-[#111111]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-3 py-1 bg-[#BF5AF2]/20 border border-[#BF5AF2]/30 rounded-full text-[10px] font-black text-[#D4C1FF] uppercase tracking-widest">Community Hub</span>
                                                <span className="text-[10px] text-white/20 font-bold uppercase">{report.severity}</span>
                                            </div>
                                            <h3 className="text-lg font-normal text-white mb-2 leading-tight">{report.title}</h3>
                                            <p className="text-[13px] text-white/40 leading-relaxed mb-4 line-clamp-3">
                                                {report.aiDescription || "Community identified pollution hotspot."}
                                            </p>
                                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                    <MapPin className="w-4 h-4 text-white/20" />
                                                </div>
                                                <span className="text-[11px] text-white/30 truncate">{report.location.address}</span>
                                            </div>
                                        </div>
                                    </MarkerTooltip>
                                </MapMarker>
                            ))}
                        </Map>

                        {/* Legend Card */}
                        {showLegend && (
                            <div className="absolute bottom-6 right-6 w-56 bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-2xl z-30 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-black text-white/30 tracking-[0.2em]">Map Discovery</p>
                                    <button onClick={() => setShowLegend(false)} className="text-white/20 hover:text-white transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-normal text-white/60 mb-2 tracking-widest">Icon Types</p>
                                        <div className="space-y-2">
                                            {Object.entries(WASTE_CONFIG).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                                                        {React.cloneElement(val.icon, { className: "w-4 h-4 text-black" })}
                                                    </div>
                                                    <span className="text-xs font-normal text-white/80">{val.label}</span>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-[#BF5AF2] flex items-center justify-center">
                                                    <AlertTriangle className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs font-normal text-white/80">Community Report</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-normal text-white/60 mb-2 tracking-widest">Live Status</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                                                <div key={key} className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${val.color}`} />
                                                    <span className="text-[10px] font-normal text-white/50">{key}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : null}

                {/* Floating Nav Controllers — map only */}
                {viewMode === "map" && (
                    <div className="absolute top-6 left-6 flex flex-col gap-4">
                        <div
                            onClick={() => setShowLegend(!showLegend)}
                            className="w-12 h-12 bg-[#111111]/90 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all shadow-2xl cursor-pointer border border-white/5"
                        >
                            <Info className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 bg-[#111111]/90 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all shadow-2xl cursor-pointer border border-white/5">
                            <Navigation className="w-5 h-5 -rotate-45" />
                        </div>
                    </div>
                )}

                {canManage && (
                    <div className="absolute top-6 right-6">
                        <div
                            onClick={() => setShowCreate(true)}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </div>
                    </div>
                )}
                {/* ── Modals ── */}
                <CreateTaskModal
                    open={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={handleTaskCreated}
                />
                <AssignTaskModal
                    open={showAssign}
                    onClose={() => { setShowAssign(false); setAssignTarget(null); }}
                    task={assignTarget}
                    onAssigned={handleTaskAssigned}
                />
                <UpdateTaskModal
                    open={showUpdate}
                    onClose={() => { setShowUpdate(false); setUpdateTarget(null); }}
                    task={updateTarget}
                    onUpdated={handleUpdate}
                />

                {/* ── Delete Confirmation Dialog ── */}
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setDeleteConfirmId(null)}
                        />
                        {/* Dialog */}
                        <div className="relative z-10 bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            {/* Icon */}
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/20 flex items-center justify-center">
                                    <Trash2 className="w-7 h-7 text-[#FF375F]" />
                                </div>
                            </div>
                            {/* Text */}
                            <div className="text-center space-y-2 mb-8">
                                <h3 className="text-[18px] font-normal text-white/90">Delete Task?</h3>
                                <p className="text-[13px] text-white/30 font-normal leading-relaxed">
                                    This action is permanent and cannot be undone. The task will be removed from the database.
                                </p>
                            </div>
                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-[13px] font-normal hover:bg-white/10 hover:text-white/80 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 h-12 rounded-2xl bg-[#FF2D55] text-white text-[13px] font-normal hover:bg-[#FF2D55]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,45,85,0.3)]"
                                >
                                    <Trash2 className="w-4 h-4" /> Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Logout Confirmation Dialog ── */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowLogoutConfirm(false)}
                    />
                    {/* Card */}
                    <div className="relative z-10 bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Icon */}
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/20 flex items-center justify-center">
                                <LogOut className="w-7 h-7 text-[#FF375F]" />
                            </div>
                        </div>
                        {/* Text */}
                        <div className="text-center space-y-2 mb-8">
                            <h3 className="text-[18px] font-normal text-white/90">Sign Out?</h3>
                            <p className="text-[13px] text-white/30 font-normal leading-relaxed">
                                You will be returned to the login screen. Your session will be cleared.
                            </p>
                        </div>
                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-[13px] font-normal hover:bg-white/10 hover:text-white/80 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 h-12 rounded-2xl bg-[#FF2D55] text-white text-[13px] font-normal hover:bg-[#FF2D55]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,45,85,0.3)]"
                            >
                                <LogOut className="w-4 h-4" /> Yes, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
