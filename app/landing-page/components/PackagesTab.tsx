"use client";

import React, { useState } from "react";
import { savePackageAction, deletePackageAction } from "../../actions/landing-page";

interface Package {
  id: string;
  title: string;
  price: number;
  description: string;
  order_index: number;
  is_active: boolean;
  is_highlight: boolean;
  created_at: string;
}

export default function PackagesTab({ initialItems }: { initialItems: Package[] }) {
  const [items, setItems] = useState<Package[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [orderIndex, setOrderIndex] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isHighlight, setIsHighlight] = useState(false);

  const openAddModal = () => {
    setFormId("");
    setTitle("");
    setDescription("");
    setPrice("0");
    setOrderIndex("0");
    setIsActive(true);
    setIsHighlight(false);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: Package) => {
    setFormId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setPrice((item.price ?? 0).toString());
    setOrderIndex((item.order_index ?? 0).toString());
    setIsActive(item.is_active ?? true);
    setIsHighlight(item.is_highlight || false);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (formId) formData.append("id", formId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("order_index", orderIndex);
    formData.append("is_active", isActive ? "true" : "false");
    formData.append("is_highlight", isHighlight ? "true" : "false");

    const res = await savePackageAction(formData);
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

    const res = await deletePackageAction(formData);
    setLoading(false);
    setDeleteId(null);

    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Pricing Packages</h3>
          <p className="text-zinc-400 text-xs mt-1">
            Configure pricing tiers and featured service offerings.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          + Add Package
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-xs">No service packages configured yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">Package Title</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Order Index</th>
                <th className="py-3 px-4 font-bold">Highlight</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/10">
                  <td className="py-4 px-4 font-bold text-white">
                    <div>
                      <p className="text-zinc-100 font-bold text-xs">{item.title}</p>
                      <p className="text-[10px] text-zinc-500 font-normal mt-0.5 max-w-sm truncate">
                        {item.description || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-300 font-semibold">
                    Rp {Number(item.price).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-zinc-300">
                    {item.order_index}
                  </td>
                  <td className="py-4 px-4">
                    {item.is_highlight ? (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        ★ Featured
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[10px]">-</span>
                    )}
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
                {formId ? "Modify Pricing Package" : "Add Pricing Package"}
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                Customize pricing, subscription plan structures, and feature descriptions.
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
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Tier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                  Description Details
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Full-scale solutions for massive production applications."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="flex flex-col space-y-2.5 py-2">
                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="isHighlightCheck"
                    checked={isHighlight}
                    onChange={(e) => setIsHighlight(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-850 text-indigo-600 bg-zinc-950 focus:ring-indigo-500 focus:ring-opacity-25"
                  />
                  <label htmlFor="isHighlightCheck" className="text-xs text-zinc-350 select-none font-semibold cursor-pointer">
                    Feature this package as &ldquo;Highlighted&rdquo; with gold stars banner
                  </label>
                </div>

                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="isActivePackageCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-850 text-indigo-600 bg-zinc-950 focus:ring-indigo-500 focus:ring-opacity-25"
                  />
                  <label htmlFor="isActivePackageCheck" className="text-xs text-zinc-350 select-none font-semibold cursor-pointer">
                    Display this package publicly on the landing page
                  </label>
                </div>
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
                  <span>Save Package</span>
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
              <h3 className="text-base font-bold text-white">Delete Package?</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Are you sure you want to remove this service package? This action cannot be undone.
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
