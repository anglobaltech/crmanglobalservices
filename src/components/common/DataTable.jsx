import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, SlidersHorizontal, CheckCircle2, GripVertical } from "lucide-react";

const PAGE_SIZES = [20, 50, 100];
const MAX_CELL_LEN = 30;

export function OverflowCell({ value }) {
  const [open, setOpen] = useState(false);
  const str = value == null ? "—" : String(value);
  const isLong = str.length > MAX_CELL_LEN;

  if (!isLong) return <span className="text-gray-700">{str || "—"}</span>;

  return (
    <>
      <div
        className="flex items-center gap-1 max-w-[180px] cursor-pointer group"
        onClick={() => setOpen(true)}
        title="View full content"
      >
        <span className="truncate text-gray-700 text-xs group-hover:text-blue-600 transition-colors">{str}</span>
        <span className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 text-[10px] leading-none transition-colors">
          ▼
        </span>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-[300] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">Full Content</p>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
              {str}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function ColumnPickerModal({ allColumns, selected, onSelect, onClose }) {
  const toggle = (key) => {
    if (selected.includes(key)) {
      if (selected.length <= 1) return; // keep at least 1
      onSelect(selected.filter((k) => k !== key));
    } else {
      onSelect([...selected, key]);
    }
  };

  const selectAll = () => onSelect(allColumns.map((c) => c.key));
  const reset = () => onSelect(allColumns.slice(0, 5).map((c) => c.key));

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-4 sm:p-5 border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Customize Columns</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select columns to display. Selection order determines column order.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors self-start">
            <X size={18} />
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100 min-h-[40px] shrink-0">
            {selected.map((key, idx) => {
              const col = allColumns.find((c) => c.key === key);
              return (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-gray-700 border border-gray-200 text-[10px] font-semibold rounded-md shadow-sm">
                  <span className="text-gray-400">{idx + 1}.</span>
                  {col?.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-y-auto p-1 flex-1 min-h-0 custom-scrollbar">
          {allColumns.map((col) => {
            const on = selected.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => toggle(col.key)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  on
                    ? "bg-blue-50/50 text-blue-700 border-blue-200 shadow-sm"
                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="truncate pr-2">{col.label}</span>
                {on && <CheckCircle2 size={13} className={on ? "text-blue-600 shrink-0" : "text-gray-300 shrink-0"} />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={selectAll} className="text-xs font-bold text-gray-900 hover:text-black cursor-pointer underline underline-offset-4">
              Select All
            </button>
            <button onClick={reset} className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer underline underline-offset-4">
              Reset
            </button>
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer shadow-sm transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}

export function ColumnPickerButton({ allColumns, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
          open
            ? "border-blue-500 text-blue-700 bg-blue-50 shadow-sm"
            : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
        }`}
      >
        <SlidersHorizontal size={12} />
        <span className="hidden sm:inline">Columns</span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
          selected.length === allColumns.length ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
        }`}>
          {selected.length}/{allColumns.length}
        </span>
      </button>

      {open && (
        <ColumnPickerModal
          allColumns={allColumns}
          selected={selected}
          onSelect={onSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export default function DataTable({
  columns,
  data,
  loading,
  totalItems = null,
  currentPage = null,
  onPageChange = null,
  pageSize: controlledPageSize = null,
  onPageSizeChange = null,
  columnPicker = null,
  selection = null,
}) {
  const [sortCol, setSortCol]   = useState(null);
  const [sortDir, setSortDir]   = useState("asc");
  const [localPageSize, setLocalPageSize] = useState(20);
  const [localPage, setLocalPage]         = useState(1);

  const isServer = totalItems !== null && currentPage !== null;

  const pageSize = isServer ? (controlledPageSize || 20) : localPageSize;
  const page = isServer ? currentPage : localPage;
  const setPage = isServer && onPageChange ? onPageChange : setLocalPage;

  const handleSort = (col) => {
    if (!col.key) return;
    if (sortCol === col.key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col.key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const av = a[sortCol] ?? "";
    const bv = b[sortCol] ?? "";
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total      = isServer ? totalItems : sorted.length;
  const totalPages = Math.ceil(total / pageSize);
  const start      = (page - 1) * pageSize;
  const paged      = isServer ? sorted : sorted.slice(start, start + pageSize);

  const handlePageSize = (size) => {
    if (isServer && onPageSizeChange) {
      onPageSizeChange(size);
    } else {
      setLocalPageSize(size);
    }
    setPage(1);
  };

  const visibleColumns = columnPicker
    ? columnPicker.selected
        .map(key => columns.find(c => c.key === key))
        .filter(Boolean)
    : columns;

  return (
    <div className="w-full flex flex-col rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/60 z-20 relative">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSize(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium bg-white text-gray-800 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm transition-all"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {columnPicker && (
          <ColumnPickerButton
            allColumns={columnPicker.allColumns}
            selected={columnPicker.selected}
            onSelect={columnPicker.onSelect}
          />
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-max min-w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                {selection && (
                  <th className="px-4 py-2.5 w-12 text-center border-r border-gray-100">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={paged.length > 0 && paged.every((r) => selection.selectedIds.includes(r.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newIds = new Set(selection.selectedIds);
                          paged.forEach((r) => newIds.add(r.id));
                          selection.onSelectChange(Array.from(newIds));
                        } else {
                          const newIds = new Set(selection.selectedIds);
                          paged.forEach((r) => newIds.delete(r.id));
                          selection.onSelectChange(Array.from(newIds));
                        }
                      }}
                    />
                  </th>
                )}
                {visibleColumns.map((col, i) => (
                  <th
                    key={col.key || i}
                    onClick={() => handleSort(col)}
                    className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap select-none
                      ${col.key ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.key && (
                        <span className="text-gray-400 text-xs">
                          {sortCol === col.key ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (selection ? 1 : 0)} className="px-5 py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paged.length > 0 ? (
                paged.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50 transition-colors duration-100">
                    {selection && (
                      <td className="px-4 py-2 text-center border-r border-gray-50" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selection.selectedIds.includes(row.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              selection.onSelectChange([...selection.selectedIds, row.id]);
                            } else {
                              selection.onSelectChange(selection.selectedIds.filter(id => id !== row.id));
                            }
                          }}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col, ci) => {
                      if (col.render) {
                        return (
                          <td key={col.key || ci} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                            {col.render(row)}
                          </td>
                        );
                      }
                      const raw = row[col.key] ?? "";
                      return (
                        <td key={col.key || ci} className="px-4 py-2 whitespace-nowrap">
                          <OverflowCell value={raw} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length + (selection ? 1 : 0)} className="px-5 py-14 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.75 9.75h16.5m-16.5 4.5h16.5M3.75 6h16.5A2.25 2.25 0 0122.5 8.25v7.5A2.25 2.25 0 0120.25 18H3.75A2.25 2.25 0 011.5 15.75v-7.5A2.25 2.25 0 013.75 6z"/>
                      </svg>
                      <span>No data found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-3 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500">
              Showing {total === 0 ? 0 : start + 1} to {Math.min(start + pageSize, total)} of {total} entries
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-600 cursor-pointer"
              >«</button>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-600 cursor-pointer"
              >Prev</button>

              {(() => {
                const range = [];
                const delta = 2;
                let lo = Math.max(1, page - delta);
                let hi = Math.min(totalPages, page + delta);
                if (page - delta < 1)           hi = Math.min(totalPages, hi + (delta - page + 1));
                if (page + delta > totalPages)  lo = Math.max(1, lo - (page + delta - totalPages));
                for (let i = lo; i <= hi; i++) range.push(i);
                return range.map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer
                      ${p === page ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ));
              })()}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-600 cursor-pointer"
              >Next</button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-600 cursor-pointer"
              >»</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}