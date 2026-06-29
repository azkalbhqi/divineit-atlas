"use client";

import React, { useState } from "react";
import { savePortfolioAction, deletePortfolioAction } from "../../actions/landing-page";

interface PortfolioItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

export default function PortfolioTab({ initialItems }: { initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState<string>("");
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState("");
  const [formImg, setFormImg] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formDesc, setFormDesc] = useState("");
  const [formOrderIndex, setFormOrderIndex] = useState("0");
  const [formIsActive, setFormIsActive] = useState(true);

  const openAddModal = () => {
    setFormId("");
    setFormName("");
    setFormCat("");
    setFormImg("");
    setImageFile(null);
    setFormDesc("");
    setFormOrderIndex("0");
    setFormIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setFormId(item.id);
    setFormName(item.name);
    setFormCat(item.category || "");
    setFormImg(item.image_url || "");
    setImageFile(null);
    setFormDesc(item.description || "");
    setFormOrderIndex((item.order_index ?? 0).toString());
    setFormIsActive(item.is_active ?? true);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (formId) formData.append("id", formId);
    formData.append("name", formName);
    formData.append("category", formCat);
    formData.append("image_url", formImg);
    if (imageFile) {
      formData.append("image_file", imageFile);
    }
    formData.append("description", formDesc);
    formData.append("order_index", formOrderIndex);
    formData.append("is_active", formIsActive ? "true" : "false");

    const res = await savePortfolioAction(formData);
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

    const res = await deletePortfolioAction(formData);
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
          <h3 className="text-lg font-bold text-white">Portfolio Showcase</h3>
          <p className="text-zinc-400 text-xs mt-1">
            Display your finest creative and technical workspace case studies.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          + Add Project
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-xs">No portfolio initiatives published yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">Project Name / Category</th>
                <th className="py-3 px-4">Description</th>
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
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-900 border border-zinc-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-650 text-[10px]">
                          No Img
                        </div>
                      )}
                      <div>
                        <p className="text-zinc-100 font-bold text-xs">{item.name}</p>
                        <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
                          {item.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-400 max-w-xs truncate">
                    {item.description || "-"}
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
                {formId ? "Modify Portfolio Project" : "Add Portfolio Project"}
              </h3>
              <p className="text-zinc-400 text-xs mt-1">
                Provide client engagement details and upload cover graphic showcase.
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
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Majadigi Gov platform"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gov-Tech, Mobile, Web"
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Image URL Path
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /images/porto.png or leave blank to upload"
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider col-span-1">
                    Upload Local File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-1.5 bg-zinc-950/80 border border-zinc-850 rounded-xl text-[10px] text-zinc-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Summarize the core impact, architecture, and tech stack utilized."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-950/80 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-650 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="flex items-center space-x-2.5 py-2">
                <input
                  type="checkbox"
                  id="formIsActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-850 text-indigo-600 bg-zinc-950 focus:ring-indigo-500 focus:ring-opacity-25"
                />
                <label htmlFor="formIsActiveCheck" className="text-xs text-zinc-350 select-none font-semibold cursor-pointer">
                  Show this project publicly on the landing page
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
                  <span>Save Project</span>
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
              <h3 className="text-base font-bold text-white">Delete Portfolio Item?</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Are you sure you want to remove this piece from the landing page? This action cannot be undone.
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
