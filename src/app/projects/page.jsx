"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, FolderOpen, CheckCircle2,
  AlertTriangle, TrendingUp, ChevronRight, Users, Calendar, Award
} from "lucide-react";

import { useProjects } from "@/hooks/useProjects";
import { SERVICE_TYPES } from "@/lib/data/projectChecklists";

import KpiCard from "@/components/ui/KpiCard";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CreateProjectModal from "./CreateProjectModal";

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

// Calculate progress from stages (ISI & BIS CRS) or flat checklist (others)
function getProgress(project) {
  if (project.serviceType === "isi" || project.serviceType === "bis_crs") {
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
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden ${isDone ? "border-emerald-200 hover:border-emerald-300" : "border-gray-100 hover:border-blue-200"}`}>
      <div className={`h-1.5 ${isDone ? "bg-emerald-400" : pct === 100 ? "bg-emerald-400" : "bg-blue-500"}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? "bg-emerald-50" : "bg-blue-50"}`}>
              {isDone ? <Award size={18} className="text-emerald-600" /> : <FolderOpen size={18} className="text-blue-600" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{project.id}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{project.projectName}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition mt-1 flex-shrink-0" />
        </div>

        {/* Client */}
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
          <Users size={13} className="text-gray-400" />
          {project.clientName}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge label={typeConfig.label} colorClass={typeConfig.color} />
          <Badge label={statusConfig.label} colorClass={statusConfig.cls} />
          {isOverdue && <Badge label={<><AlertTriangle size={10} className="mr-1 inline" />Overdue</>} colorClass="bg-red-100 text-red-600" />}
        </div>

        {/* Progress */}
        {total > 0 && (
          <ProgressBar
            progress={pct}
            label={`${done}/${total} ${(project.serviceType === "isi" || project.serviceType === "bis_crs") ? "steps" : "items"}`}
          />
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={12} />
            {formatDate(project.dueDate)}
          </div>
          {project.assignedToNames?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={12} />
              {project.assignedToNames.slice(0, 2).join(", ")}
              {project.assignedToNames.length > 2 && ` +${project.assignedToNames.length - 2}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();

  const [filters, setFilters] = useState({ search: "", serviceType: "", status: "" });
  const { projects, stats, loading, isManager, refetch } = useProjects(filters);
  const [showCreate, setShowCreate] = useState(false);

  const activeProjects    = projects.filter(p => p.status !== "completed");
  const completedProjects = projects.filter(p => p.status === "completed");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen size={24} className="text-blue-600" /> Certification Projects
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage ISI, FMCS, Hallmarking & BIS CRS certification projects</p>
          </div>
          {isManager && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm cursor-pointer">
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={FolderOpen}    label="Total Projects" value={stats?.total}     colorClass="bg-blue-100 text-blue-600" />
          <KpiCard icon={TrendingUp}    label="Active"         value={stats?.active}    colorClass="bg-indigo-100 text-indigo-600" />
          <KpiCard icon={CheckCircle2}  label="Completed"      value={stats?.completed} colorClass="bg-emerald-100 text-emerald-600" />
          <KpiCard icon={AlertTriangle} label="Overdue"        value={stats?.overdue}   colorClass="bg-red-100 text-red-600" />
        </div>

        {/* Service Type Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[{ key: "", label: "All" }, ...Object.entries(SERVICE_TYPES).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
            <button key={key} onClick={() => setFilters(f => ({ ...f, serviceType: key }))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${filters.serviceType === key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {label}{key && stats?.byType?.[key] !== undefined ? ` (${stats.byType[key]})` : ""}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by project name or client..."
              value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none cursor-pointer">
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {(filters.search || filters.status) && (
            <button onClick={() => setFilters(f => ({ ...f, search: "", status: "" }))}
              className="text-sm text-gray-500 hover:text-gray-900 font-medium cursor-pointer">Clear</button>
          )}
        </div>

        {/* Projects List */}
        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderOpen} title="No projects found"
            description={isManager ? "Click \"New Project\" to create one." : "No projects assigned to you yet."} />
        ) : (
          <div className="space-y-8">
            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={14} /> Active Projects ({activeProjects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {activeProjects.map(project => (
                    <ProjectCard key={project.id} project={project}
                      onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed / Done Projects */}
            {completedProjects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award size={14} /> Completed Projects ({completedProjects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {completedProjects.map(project => (
                    <ProjectCard key={project.id} project={project}
                      onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={refetch} />}
    </div>
  );
}
