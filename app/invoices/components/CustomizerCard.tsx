import React from "react";

interface CustomizerCardProps {
  showLogo: boolean;
  setShowLogo: (val: boolean) => void;
  showQr: boolean;
  setShowQr: (val: boolean) => void;
  showQty: boolean;
  setShowQty: (val: boolean) => void;
  showRate: boolean;
  setShowRate: (val: boolean) => void;
  showTax: boolean;
  setShowTax: (val: boolean) => void;
  showDiscount: boolean;
  setShowDiscount: (val: boolean) => void;
  showShipping: boolean;
  setShowShipping: (val: boolean) => void;
  showPayment: boolean;
  setShowPayment: (val: boolean) => void;
  showNotes: boolean;
  setShowNotes: (val: boolean) => void;
}

export default function CustomizerCard({
  showLogo,
  setShowLogo,
  showQr,
  setShowQr,
  showQty,
  setShowQty,
  showRate,
  setShowRate,
  showTax,
  setShowTax,
  showDiscount,
  setShowDiscount,
  showShipping,
  setShowShipping,
  showPayment,
  setShowPayment,
  showNotes,
  setShowNotes,
}: CustomizerCardProps) {
  const toggles = [
    { id: "logo", label: "Company Logo", val: showLogo, set: setShowLogo },
    { id: "qr", label: "QR Payment", val: showQr, set: setShowQr },
    { id: "qty", label: "Qty Column", val: showQty, set: setShowQty },
    { id: "rate", label: "Rate Column", val: showRate, set: setShowRate },
    { id: "tax", label: "Tax Columns", val: showTax, set: setShowTax },
    { id: "discount", label: "Discount Info", val: showDiscount, set: setShowDiscount },
    { id: "shipping", label: "Shipping Details", val: showShipping, set: setShowShipping },
    { id: "payment", label: "Payment Info Block", val: showPayment, set: setShowPayment },
    { id: "notes", label: "Notes Block", val: showNotes, set: setShowNotes },
  ];

  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center space-x-2 border-b pb-3 border-zinc-800/20">
        <span>⚙️</span>
        <span>Customize Template Fields</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {toggles.map((toggle) => (
          <label key={toggle.id} className="flex items-center space-x-2.5 py-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={toggle.val}
              onChange={(e) => toggle.set(e.target.checked)}
              className="rounded border-zinc-800 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-zinc-900 w-4 h-4 bg-zinc-950 cursor-pointer"
            />
            <span className="font-medium text-zinc-350 hover:text-white transition-colors">{toggle.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
