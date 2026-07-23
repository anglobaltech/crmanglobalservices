"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, FolderOpen, CheckCircle2,
  AlertTriangle, TrendingUp, ChevronRight, Users, Calendar, Award,
  ChevronLeft
} from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";

import KpiCard from "@/components/ui/KpiCard";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CreateProjectModal from "./CreateProjectModal";

const PAGE_SIZE = 16;

const STATUS_CONFIG = {
  pending:     { label: "Pending",     cls: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  review:      { label: "Review",      cls: "bg-purple-100 text-purple-700" },
  on_hold:     { label: "On Hold",     cls: "bg-amber-100 text-amber-700" },
  completed:   { label: "Completed",   cls: "bg-emerald-100 text-emerald-700" },
};

function formatDate(iso) {
  if (!iso) return "No deadline";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getProgress(project) {
  if (project.serviceType === "isi" || project.serviceType === "bis_crs" || project.serviceType === "hallmarking") {
    const stages = project.isiStages || [];
    const total = stages.reduce((a, s) => a + s.steps.length, 0);
    const done  = stages.reduce((a, s) => a + s.steps.filter(st => st.done).length, 0);
    return total > 0 ? { done, total, pct: Math.round((done / total) * 100) } : { done: 0, total: 0, pct: 0 };
  }
  const cl = project.checklist || [];
  const done = cl.filter(i => i.done).length;
  return { done, total: cl.length, pct: cl.length > 0 ? Math.round((done / cl.length) * 100) : 0 };
}

function ProjectCard({ project, onClick }) {
  const typeConfig = SERVICE_TYPES[project.serviceType] || { label: project.serviceType, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const statusConfig = STATUS_CONFIG[project.status] || { label: project.status, cls: "bg-gray-100 text-gray-600" };
  const { done, total, pct } = getProgress(project);
  const isOverdue = project.dueDate && new Date(project.dueDate) < new Date() && project.status !== "completed";
  const isDone = project.status === "completed";

  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden ${isDone ? "border-emerald-200 hover:border-emerald-300" : "border-gray-100 hover:border-blue-200"}`}>
      <div className={`h-1 ${isDone ? "bg-emerald-400" : pct === 100 ? "bg-emerald-400" : "bg-blue-500"}`} />
      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-50" : "bg-blue-50"}`}>
              {isDone ? <Award size={14} className="text-emerald-600" /> : <FolderOpen size={14} className="text-blue-600" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">{project.id}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[140px]">{project.projectName}</p>
            </div>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition mt-0.5 flex-shrink-0" />
        </div>

        {/* Client */}
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 truncate">
          <Users size={11} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{project.clientName}</span>
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge label={typeConfig.label} colorClass={typeConfig.color} />
          <Badge label={statusConfig.label} colorClass={statusConfig.cls} />
          {isOverdue && <Badge label={<><AlertTriangle size={9} className="mr-0.5 inline" />Overdue</>} colorClass="bg-red-100 text-red-600" />}
        </div>

        {/* Progress */}
        {total > 0 && (
          <ProgressBar
            progress={pct}
            label={`${done}/${total} steps`}
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Calendar size={11} />
            {formatDate(project.dueDate)}
          </div>
          {project.assignedToNames?.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <Users size={11} />
              <span className="truncate max-w-[90px]">
                {project.assignedToNames.slice(0, 2).join(", ")}
                {project.assignedToNames.length > 2 && ` +${project.assignedToNames.length - 2}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalItems, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
      <p className="text-xs text-gray-400">
        Page {currentPage} of {totalPages} · {totalItems} projects
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
          <ChevronLeft size={14} className="text-gray-600" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`d${i}`} className="text-xs text-gray-400 px-1">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${currentPage === p ? "bg-gray-900 text-white" : "hover:bg-gray-100 text-gray-600"}`}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition cursor-pointer">
          <ChevronRight size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({ search: "", serviceType: "", status: "" });
  const { projects, stats, loading, isManager, refetch } = useProjects(filters);
  const [showCreate, setShowCreate] = useState(false);
  const [activePage, setActivePage]       = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  const activeProjects    = projects.filter(p => p.status !== "completed");
  const completedProjects = projects.filter(p => p.status === "completed");
  const overdueProjects   = projects.filter(p => p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "completed");

  // Paginate active
  const activeTotalPages    = Math.ceil(activeProjects.length / PAGE_SIZE);
  const activeSlice         = activeProjects.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const completedTotalPages = Math.ceil(completedProjects.length / PAGE_SIZE);
  const completedSlice      = completedProjects.slice((completedPage - 1) * PAGE_SIZE, completedPage * PAGE_SIZE);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setActivePage(1);
    setCompletedPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-blue-600" /> Certification Projects
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage ISI, FMCS, Hallmarking &amp; BIS CRS certification projects</p>
          </div>
          {isManager && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer">
              <Plus size={13} /> New Project
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={FolderOpen}    label="Total Projects" value={projects.length}          colorClass="bg-blue-100 text-blue-600" />
          <KpiCard icon={TrendingUp}    label="Active"         value={activeProjects.length}    colorClass="bg-indigo-100 text-indigo-600" />
          <KpiCard icon={CheckCircle2}  label="Completed"      value={completedProjects.length} colorClass="bg-emerald-100 text-emerald-600" />
          <KpiCard icon={AlertTriangle} label="Overdue"        value={overdueProjects.length}   colorClass="bg-red-100 text-red-600" />
        </div>

        {/* Service Type Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {[{ key: "", label: "All" }, ...Object.entries(SERVICE_TYPES).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
            <button key={key} onClick={() => handleFilter("serviceType", key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${filters.serviceType === key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {label}{key && stats?.byType?.[key] !== undefined ? ` (${stats.byType[key]})` : ""}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search by project name or client..."
              value={filters.search} onChange={e => handleFilter("search", e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <select value={filters.status} onChange={e => handleFilter("status", e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none cursor-pointer">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {(filters.search || filters.status) && (
            <button
              className="text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
              onClick={() => { setFilters(f => ({ ...f, search: "", status: "" })); setActivePage(1); setCompletedPage(1); }}>Clear</button>
          )}
        </div>

        {/* Projects List */}
        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found"
            description={isManager ? "Click \"New Project\" to create one." : "No projects assigned to you yet."} />
        ) : (
          <div className="space-y-6">
            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp size={12} /> Active Projects ({activeProjects.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {activeSlice.map(project => (
                    <ProjectCard key={project.id} project={project}
                      onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
                <Pagination
                  currentPage={activePage}
                  totalPages={activeTotalPages}
                  totalItems={activeProjects.length}
                  onPageChange={setActivePage}
                />
              </div>
            )}

            {/* Completed / Done Projects */}
            {completedProjects.length > 0 && (
              <div>
                <h2 className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Award size={12} /> Completed Projects ({completedProjects.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {completedSlice.map(project => (
                    <ProjectCard key={project.id} project={project}
                      onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
                <Pagination
                  currentPage={completedPage}
                  totalPages={completedTotalPages}
                  totalItems={completedProjects.length}
                  onPageChange={setCompletedPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  );
}
