import { useState } from "react";
import { X } from "lucide-react";

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

export default function DataTable({ 
  columns, 
  data, 
  loading,
  totalItems = null,
  currentPage = null,
  onPageChange = null,
  pageSize: controlledPageSize = null,
  onPageSizeChange = null
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

  return (
    <div className="w-full flex flex-col rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">

      {/* ── Scrollable table ── */}
      <div className="w-full overflow-x-auto">
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-max min-w-full text-sm text-left">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-100">
                {columns.map((col, i) => (
                  <th
                    key={i}
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
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"/>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paged.length > 0 ? (
                paged.map((row, ri) => (
                  <tr key={ri} className="hover:bg-gray-50 transition-colors duration-100">
                    {columns.map((col, ci) => {
                      if (col.render) {
                        return (
                          <td key={ci} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                            {col.render(row)}
                          </td>
                        );
                      }
                      const raw = row[col.key] ?? "";
                      return (
                        <td key={ci} className="px-4 py-2 whitespace-nowrap">
                          <OverflowCell value={raw} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-14 text-center text-sm text-gray-400">
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

      {/* ── Pagination footer ── */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 flex-wrap gap-3 bg-white">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Rows:</span>
            <select
              value={pageSize}
              onChange={e => handlePageSize(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 cursor-pointer"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-gray-400">
              {start + 1}–{Math.min(start + pageSize, total)} of {total}
            </span>
          </div>

          {/* Right — page buttons */}
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