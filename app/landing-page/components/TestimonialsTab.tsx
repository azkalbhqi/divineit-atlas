"use client";

import React, { useState } from "react";
import { saveTestimonialAction, deleteTestimonialAction } from "../../actions/landing-page";

interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  quote: string;
  order_index: number;
  is_active: boolean;
  porto_id: string | null;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  name: string;
}

export default function TestimonialsTab({
  initialItems,
  portfolios,
}: {
  initialItems: Testimonial[];
  portfolios: PortfolioItem[];
}) {
  const [items, setItems] = useState<Testimonial[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState<string>("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [quote, setQuote] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [portoId, setPortoId] = useState("");

  const openAddModal = () => {
    setFormId("");
    setAuthorName("");
    setAuthorRole("");
    setQuote("");
    setOrderIndex("0");
    setIsActive(true);
    setPortoId("");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setFormId(item.id);
    setAuthorName(item.author_name);
    setAuthorRole(item.author_role || "");
    setQuote(item.quote);
    setOrderIndex((item.order_index ?? 0).toString());
    setIsActive(item.is_active ?? true);
    setPortoId(item.porto_id || "");
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (formId) formData.append("id", formId);
    formData.append("author_name", authorName);
    formData.append("author_role", authorRole);
    formData.append("quote", quote);
    formData.append("order_index", orderIndex);
    formData.append("is_active", isActive ? "true" : "false");
    formData.append("porto_id", portoId);

    const res = await saveTestimonialAction(formData);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("id", deleteId);

    const res = await deleteTestimonialAction(formData);
    setLoading(false);
    setDeleteId(null);

    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const getPortfolioName = (pId: string | null) => {
    if (!pId) return null;
    return portfolios.find((p) => p.id === pId)?.name || null;
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Client Testimonials</h3>
          <p className="text-zinc-400 text-xs mt-1">
            Display endorsements from partners, clients, and team members.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          + Add Testimonial
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-xs">No client testimonials saved yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Testimonial Quote</th>
                <th className="py-3 px-4">Linked Project</th>
                <th className="py-3 px-4">Order Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/10">
                  <td className="py-4 px-4 font-bold text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[10px] text-zinc-500 font-extrabold uppercase shadow-inner">
                        {(item.author_name || "CN").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-zinc-100 font-bold text-xs">{item.author_name}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                          {item.author_role || "Contributor"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-400 max-w-xs truncate">
                    &ldquo;{item.quote}&rdquo;
                  </td>
                  <td className="py-4 px-4 text-zinc-300 font-semibold text-[10px]">
                    {getPortfolioName(item.porto_id) ? (
                      <span className="bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full">
                        💼 {getPortfolioName(item.porto_id)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-4 px-4 text-zinc-300">
                    {item.order_index}
                  </td>
                  <td className="py-4 px-4">
                    {item.is_active ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-500 rounded-full text-[9px] font-bold">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-zinc-400 hover:text-white transition font-medium text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-400 hover:text-red-300 transition font-medium text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / UPDATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">
                {formId ? "Modify Client Testimonial" : "Add Client Testimonial"}
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                Showcase recommendations and client feedback values.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Author Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Author Role / Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Product Officer at Acme Inc"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Linked Portfolio Project (Optional)
                </label>
                <select
                  value={portoId}
                  onChange={(e) => setPortoId(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="" className="bg-zinc-900">None</option>
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-xs">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Testimonial Quote <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste client recommendation message here."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="flex items-center space-x-2.5 py-2">
                <input
                  type="checkbox"
                  id="isActiveTestimonialCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-850 text-indigo-600 bg-zinc-950 focus:ring-indigo-500 focus:ring-opacity-25"
                />
                <label htmlFor="isActiveTestimonialCheck" className="text-xs text-zinc-350 select-none font-semibold cursor-pointer">
                  Display this testimonial publicly on the landing page
                </label>
              </div>

              <div className="flex justify-end items-center space-x-3 pt-4 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  <span>Save Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Delete Testimonial?</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Are you sure you want to remove this client feedback from the landing page? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end items-center space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2 bg-red-650 hover:bg-red-650/90 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2"
              >
                {loading && <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
