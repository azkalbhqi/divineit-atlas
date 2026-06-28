import React from "react";

interface InvoiceSettings {
  notesPosition: "left" | "right";
  notesAlign: "left" | "center" | "right";
  paymentPosition: "left" | "right";
  paymentAlign: "left" | "center" | "right";
}

interface CalculationsCardProps {
  currencySymbol: string;
  showQr: boolean;
  qrBase64: string;
  setQrBase64: (val: string) => void;
  handleQrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showDiscount: boolean;
  discountPercentage: number;
  setDiscountPercentage: (val: number) => void;
  showTax: boolean;
  taxPercentage: number;
  setTaxPercentage: (val: number) => void;
  showShipping: boolean;
  shippingCost: number;
  setShippingCost: (val: number) => void;
  showNotes: boolean;
  notes: string;
  setNotes: (val: string) => void;
  showPayment: boolean;
  paymentInstructions: string;
  setPaymentInstructions: (val: string) => void;
  settings: InvoiceSettings;
  setSettings: React.Dispatch<React.SetStateAction<any>>;
}

export default function CalculationsCard({
  currencySymbol,
  showQr,
  qrBase64,
  setQrBase64,
  handleQrUpload,
  showDiscount,
  discountPercentage,
  setDiscountPercentage,
  showTax,
  taxPercentage,
  setTaxPercentage,
  showShipping,
  shippingCost,
  setShippingCost,
  showNotes,
  notes,
  setNotes,
  showPayment,
  paymentInstructions,
  setPaymentInstructions,
  settings,
  setSettings,
}: CalculationsCardProps) {
  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center space-x-2 border-b pb-3 border-zinc-800/20">
        <span>🧮</span>
        <span>Calculations, QR & Details</span>
      </h2>

      {showQr && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Payment QR Code</label>
          <div className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[110px] overflow-hidden transition-all bg-zinc-950/30">
            {qrBase64 ? (
              <>
                <button
                  type="button"
                  onClick={() => setQrBase64("")}
                  className="absolute top-2 right-2 bg-red-950/70 border border-red-500/20 text-red-400 hover:text-white w-6 h-6 rounded-lg text-xs flex items-center justify-center cursor-pointer z-10"
                >
                  ✕
                </button>
                <img src={qrBase64} alt="Payment QR Code" className="max-h-[100px] object-contain" />
              </>
            ) : (
              <label className="flex flex-col items-center justify-center space-y-1 cursor-pointer w-full h-full py-4 text-center">
                <span className="text-xl">🎯</span>
                <span className="text-[10px] font-semibold text-zinc-400">Click to upload Payment QR</span>
                <input type="file" onChange={handleQrUpload} accept="image/*" className="hidden" />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {showDiscount && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Global Discount (%)</label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        )}

        {showTax && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Global Tax (%)</label>
            <input
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        )}

        {showShipping && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Shipping Cost ({currencySymbol})</label>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              min="0"
              step="any"
            />
          </div>
        )}
      </div>

      {showNotes && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Custom Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white h-16 resize-y focus:outline-none focus:border-indigo-500"
            placeholder="Thank you for your business!"
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <label className="text-[8px] font-bold text-zinc-500 uppercase">Notes Position</label>
              <select
                value={settings.notesPosition}
                onChange={(e) => {
                  const nPos = e.target.value as any;
                  setSettings((prev: any) => ({
                    ...prev,
                    notesPosition: nPos,
                    paymentPosition: nPos === "left" ? "right" : "left",
                  }));
                }}
                className="w-full p-1.5 bg-zinc-950 border border-zinc-850 rounded text-[10px] text-white cursor-pointer"
              >
                <option value="left">Left Column</option>
                <option value="right">Right Column</option>
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] font-bold text-zinc-500 uppercase">Notes Align</label>
              <select
                value={settings.notesAlign}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, notesAlign: e.target.value as any }))}
                className="w-full p-1.5 bg-zinc-950 border border-zinc-850 rounded text-[10px] text-white cursor-pointer"
              >
                <option value="left">Align Left</option>
                <option value="center">Align Center</option>
                <option value="right">Align Right</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="space-y-1.5 border-t border-zinc-850/40 pt-3">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Payment Instructions</label>
          <textarea
            value={paymentInstructions}
            onChange={(e) => setPaymentInstructions(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 p-2.5 rounded-xl text-xs text-white h-16 resize-y focus:outline-none focus:border-indigo-500"
            placeholder="Bank Details, Wire accounts..."
          />
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-0.5">
              <label className="text-[8px] font-bold text-zinc-500 uppercase">Payment Align</label>
              <select
                value={settings.paymentAlign}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, paymentAlign: e.target.value as any }))}
                className="w-full p-1.5 bg-zinc-950 border border-zinc-850 rounded text-[10px] text-white cursor-pointer"
              >
                <option value="left">Align Left</option>
                <option value="center">Align Center</option>
                <option value="right">Align Right</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
