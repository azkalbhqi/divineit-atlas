import React from "react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
}

interface ItemsCardProps {
  items: LineItem[];
  currencySymbol: string;
  showQty: boolean;
  showRate: boolean;
  showTax: boolean;
  showDiscount: boolean;
  addLineItem: () => void;
  updateItem: (id: string, field: keyof LineItem, value: any) => void;
  deleteItem: (id: string) => void;
}

export default function ItemsCard({
  items,
  currencySymbol,
  showQty,
  showRate,
  showTax,
  showDiscount,
  addLineItem,
  updateItem,
  deleteItem,
}: ItemsCardProps) {
  return (
    <div className="p-6 rounded-2xl border bg-zinc-900/45 border-zinc-800 space-y-4">
      <h2 className="text-sm font-bold flex items-center justify-between border-b pb-3 border-zinc-800/20">
        <span className="flex items-center space-x-2">
          <span>🛒</span>
          <span>Line Items</span>
        </span>
        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
          {items.length} Added
        </span>
      </h2>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 italic text-xs">
            No items in this invoice. Click add below.
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-855 relative space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800/30 pb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Item #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold hover:underline cursor-pointer"
                >
                  Delete Item
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Description / Details</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
                  placeholder="e.g. Services Rendered - Design & Dev"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {showQty && (
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      min="0.01"
                      step="any"
                    />
                  </div>
                )}
                {showRate && (
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Price ({currencySymbol})</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      min="0"
                      step="any"
                    />
                  </div>
                )}
                {showTax && (
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Tax (%)</label>
                    <input
                      type="number"
                      value={item.tax}
                      onChange={(e) => updateItem(item.id, "tax", parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}
                {showDiscount && (
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Disc (%)</label>
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addLineItem}
        className="w-full py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
      >
        <span>➕</span>
        <span>Add Line Item</span>
      </button>
    </div>
  );
}
