import React, { useState } from "react";

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    logoFile: File | null;
  }) => Promise<void>;
}

export default function AddBusinessModal({
  isOpen,
  onClose,
  onSubmit,
}: AddBusinessModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isPending, setIsPending] = useState(false);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsPending(true);
    try {
      await onSubmit({ name, phone, email, address, logoFile });
      // Reset
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setLogoFile(null);
      setLogoPreview("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl z-10 text-zinc-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>🏢</span>
            <span>Add Business Profile</span>
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-850 rounded-lg w-7 h-7 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Company Logo</label>
            <div className="border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[90px] bg-zinc-950/30">
              {logoPreview ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="absolute top-1 right-1 bg-red-950/70 border border-red-500/20 text-red-400 hover:text-white w-5 h-5 rounded text-[10px] flex items-center justify-center cursor-pointer z-10"
                  >
                    ✕
                  </button>
                  <img src={logoPreview} alt="Logo preview" className="max-h-[70px] object-contain" />
                </>
              ) : (
                <label className="flex flex-col items-center justify-center space-y-1 cursor-pointer w-full h-full py-2 text-center">
                  <span className="text-lg">🖼️</span>
                  <span className="text-[10px] text-zinc-400">Click to upload business logo</span>
                  <input type="file" onChange={handleLogoChange} accept="image/*" className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Business Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="+62 ..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
                placeholder="info@acme.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white h-16 resize-y focus:outline-none focus:border-indigo-500"
              placeholder="Full business address"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              <span>{isPending ? "Adding..." : "Add Business"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
