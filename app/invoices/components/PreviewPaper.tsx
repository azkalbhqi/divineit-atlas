import React from "react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
}

interface InvoiceSettings {
  headerPosition: "right" | "left";
  senderAlign: "left" | "center" | "right";
  clientAlign: "left" | "center" | "right";
  addressOrder: "normal" | "reverse";
  notesPosition: "left" | "right";
  notesAlign: "left" | "center" | "right";
  paymentPosition: "left" | "right";
  paymentAlign: "left" | "center" | "right";
}

interface PreviewPaperProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  scaleWrapperRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  marginLeft: number;
  wrapperHeight: string;
  invoiceNumber: string;
  currency: string;
  currencySymbol: string;
  issueDate: string;
  dueDate: string;
  terms: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  logoBase64: string;
  qrBase64: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  items: LineItem[];
  showLogo: boolean;
  showQr: boolean;
  showQty: boolean;
  showRate: boolean;
  showTax: boolean;
  showDiscount: boolean;
  showShipping: boolean;
  showPayment: boolean;
  showNotes: boolean;
  discountPercentage: number;
  taxPercentage: number;
  shippingCost: number;
  notes: string;
  paymentInstructions: string;
  enabledFields: {
    invoiceNumber: boolean;
    issueDate: boolean;
    dueDate: boolean;
    paymentTerms: boolean;
    senderName: boolean;
    senderEmail: boolean;
    senderPhone: boolean;
    senderAddress: boolean;
    clientName: boolean;
    clientEmail: boolean;
    clientPhone: boolean;
    clientAddress: boolean;
  };
  settings: InvoiceSettings;
  subtotal: number;
  totalDiscountCombined: number;
  totalTaxCombined: number;
  grandTotal: number;
  itemsDiscountTotal: number;
  itemsTaxTotal: number;
  formatCurrency: (amount: number) => string;
  formatQty: (qty: number) => string;
}

export default function PreviewPaper({
  previewRef,
  scaleWrapperRef,
  scale,
  marginLeft,
  wrapperHeight,
  invoiceNumber,
  currency,
  currencySymbol,
  issueDate,
  dueDate,
  terms,
  senderName,
  senderEmail,
  senderPhone,
  senderAddress,
  logoBase64,
  qrBase64,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  items,
  showLogo,
  showQr,
  showQty,
  showRate,
  showTax,
  showDiscount,
  showShipping,
  showPayment,
  showNotes,
  discountPercentage,
  taxPercentage,
  shippingCost,
  notes,
  paymentInstructions,
  enabledFields,
  settings,
  subtotal,
  totalDiscountCombined,
  totalTaxCombined,
  grandTotal,
  itemsDiscountTotal,
  itemsTaxTotal,
  formatCurrency,
  formatQty,
}: PreviewPaperProps) {
  // Safe HTML render helpers for urls
  const renderLinkified = (text: string) => {
    if (!text) return "";
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const wwwPattern = /(^|[^\/])(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    let formatted = escaped.replace(urlPattern, '<a href="$1" target="_blank" style="color: #4f46e5; text-decoration: underline;">$1</a>');
    formatted = formatted.replace(wwwPattern, '$1<a href="https://$2" target="_blank" style="color: #4f46e5; text-decoration: underline;">$2</a>');

    return <span dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, "<br>") }} />;
  };

  // Virtual A4 guidelines calculation
  const previewHeight = previewRef.current?.scrollHeight || 0;
  const pageHeight = 1130; // A4 height ratio at 800px width
  const pageBreaks = [];
  if (previewHeight > pageHeight) {
    const pagesCount = Math.ceil(previewHeight / pageHeight);
    for (let i = 1; i < pagesCount; i++) {
      pageBreaks.push(i * pageHeight);
    }
  }

  return (
    <div ref={scaleWrapperRef} className="w-full relative overflow-hidden flex items-start justify-start p-1 bg-zinc-900/10 border border-zinc-850/20" style={{ height: wrapperHeight }}>
      <div
        ref={previewRef}
        id="invoice-preview"
        className="w-[800px] min-h-[1130px] p-10 bg-white text-slate-800 shadow-2xl relative flex flex-col font-sans transition-all duration-200 select-text"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : "none",
          transformOrigin: "top left",
          marginLeft: `${marginLeft}px`,
          flexShrink: 0,
        }}
      >
        {/* Dotted Page-Break Guidelines */}
        {pageBreaks.map((topVal, index) => (
          <div
            key={index}
            className="absolute left-0 right-0 border-t border-dashed border-red-400/50 flex items-center justify-end pr-4 select-none pointer-events-none page-break-guide"
            style={{ top: `${topVal}px` }}
          >
            <span className="text-[8px] font-extrabold text-red-500/80 bg-red-50 px-2 py-0.5 rounded shadow-sm relative -top-2.5">
              A4 Page {index + 1} / Page {index + 2} Split Line
            </span>
          </div>
        ))}

        {/* Preview Header Area */}
        <div
          className="flex items-start justify-between mb-8"
          style={{
            flexDirection: settings.headerPosition === "left" ? "row-reverse" : "row",
          }}
        >
          <div className="invoice-logo-area">
            {showLogo && logoBase64 && (
              <img src={logoBase64} alt="Company Logo" className="max-h-[60px] max-w-[240px] object-contain" />
            )}
          </div>

          <div
            className="flex flex-col space-y-1.5"
            style={{
              textAlign: settings.headerPosition === "left" ? "left" : "right",
              alignItems: settings.headerPosition === "left" ? "flex-start" : "flex-end",
            }}
          >
            <h2 className="text-3xl font-extrabold tracking-wider text-slate-900">INVOICE</h2>
            {enabledFields.invoiceNumber && (
              <div className="text-sm font-semibold text-slate-600">#{invoiceNumber || "DRAFT"}</div>
            )}

            <div className="text-[10px] text-slate-500 space-y-0.5 mt-2">
              {enabledFields.issueDate && (
                <div>
                  <span className="font-bold text-slate-600">Date: </span>
                  <span>{issueDate || "YYYY-MM-DD"}</span>
                </div>
              )}
              {enabledFields.dueDate && (
                <div>
                  <span className="font-bold text-slate-600">Due Date: </span>
                  <span>{dueDate || "YYYY-MM-DD"}</span>
                </div>
              )}
              {enabledFields.paymentTerms && (
                <div>
                  <span className="font-bold text-slate-600">Terms: </span>
                  <span>{terms || "Due on Receipt"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Addresses Area */}
        <div className="grid grid-cols-2 gap-8 border-t border-b border-slate-100 py-6 mb-8 text-[11px] leading-relaxed">
          {settings.addressOrder === "reverse" ? (
            <>
              {/* Client */}
              <div style={{ textAlign: settings.clientAlign }}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bill To</div>
                <div className="text-slate-700">
                  {enabledFields.clientName && <strong className="text-slate-900 block text-xs">{clientName || "Client Name"}</strong>}
                  {enabledFields.clientEmail && <div className="text-slate-600">{clientEmail}</div>}
                  {enabledFields.clientPhone && <div className="text-slate-600">{clientPhone}</div>}
                  {enabledFields.clientAddress && <div className="text-slate-500 whitespace-pre-wrap">{clientAddress}</div>}
                  {!clientName && !clientEmail && !clientPhone && !clientAddress && (
                    <span className="italic text-slate-400">No client details provided yet.</span>
                  )}
                </div>
              </div>

              {/* Sender */}
              <div style={{ textAlign: settings.senderAlign }}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">From</div>
                <div className="text-slate-700">
                  {enabledFields.senderName && <strong className="text-slate-900 block text-xs">{senderName}</strong>}
                  {enabledFields.senderEmail && <div className="text-slate-600">{senderEmail}</div>}
                  {enabledFields.senderPhone && <div className="text-slate-600">{senderPhone}</div>}
                  {enabledFields.senderAddress && <div className="text-slate-500 whitespace-pre-wrap">{senderAddress}</div>}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sender */}
              <div style={{ textAlign: settings.senderAlign }}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">From</div>
                <div className="text-slate-700">
                  {enabledFields.senderName && <strong className="text-slate-900 block text-xs">{senderName}</strong>}
                  {enabledFields.senderEmail && <div className="text-slate-600">{senderEmail}</div>}
                  {enabledFields.senderPhone && <div className="text-slate-600">{senderPhone}</div>}
                  {enabledFields.senderAddress && <div className="text-slate-500 whitespace-pre-wrap">{senderAddress}</div>}
                </div>
              </div>

              {/* Client */}
              <div style={{ textAlign: settings.clientAlign }}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bill To</div>
                <div className="text-slate-700">
                  {enabledFields.clientName && <strong className="text-slate-900 block text-xs">{clientName || "Client Name"}</strong>}
                  {enabledFields.clientEmail && <div className="text-slate-600">{clientEmail}</div>}
                  {enabledFields.clientPhone && <div className="text-slate-600">{clientPhone}</div>}
                  {enabledFields.clientAddress && <div className="text-slate-500 whitespace-pre-wrap">{clientAddress}</div>}
                  {!clientName && !clientEmail && !clientPhone && !clientAddress && (
                    <span className="italic text-slate-400">No client details provided yet.</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table Items */}
        <div className="flex-1 mb-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-2.5" style={{ width: "45%" }}>Item Description</th>
                {showQty && <th className="py-2.5 text-right" style={{ width: "10%" }}>Qty</th>}
                {showRate && <th className="py-2.5 text-right" style={{ width: "15%" }}>Price</th>}
                {showTax && <th className="py-2.5 text-right" style={{ width: "10%" }}>Tax</th>}
                {showDiscount && <th className="py-2.5 text-right" style={{ width: "10%" }}>Disc</th>}
                <th className="py-2.5 text-right" style={{ width: "10%" }}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No items added.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const itemQty = showQty ? item.quantity : 1;
                  const base = itemQty * item.price;
                  const discountAmt = showDiscount ? base * ((item.discount || 0) / 100) : 0;
                  const itemTotal = base - discountAmt;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 pr-2">
                        <span className="font-semibold text-slate-900 block">{item.description || "Untitled Item"}</span>
                      </td>
                      {showQty && <td className="py-3 text-right">{formatQty(item.quantity)}</td>}
                      {showRate && <td className="py-3 text-right">{formatCurrency(item.price)}</td>}
                      {showTax && <td className="py-3 text-right">{item.tax > 0 ? `${item.tax}%` : "-"}</td>}
                      {showDiscount && <td className="py-3 text-right">{item.discount > 0 ? `${item.discount}%` : "-"}</td>}
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(itemTotal)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Block */}
        <div className="flex justify-end border-t border-slate-100 pt-5 mb-8">
          <div className="w-1/2 sm:w-2/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
            </div>

            {showDiscount && totalDiscountCombined > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>
                  {discountPercentage > 0 && itemsDiscountTotal > 0
                    ? `Discount (${discountPercentage}% + Item)`
                    : discountPercentage > 0
                      ? `Discount (${discountPercentage}%)`
                      : "Item Discount"}
                </span>
                <span className="font-medium text-slate-800">-{formatCurrency(totalDiscountCombined)}</span>
              </div>
            )}

            {showTax && totalTaxCombined > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>
                  {taxPercentage > 0 && itemsTaxTotal > 0
                    ? `Tax (${taxPercentage}% + Item)`
                    : taxPercentage > 0
                      ? `Tax (${taxPercentage}%)`
                      : "Item Tax"}
                </span>
                <span className="font-medium text-slate-800">{formatCurrency(totalTaxCombined)}</span>
              </div>
            )}

            {showShipping && shippingCost > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Shipping & Handling</span>
                <span className="font-medium text-slate-800">{formatCurrency(shippingCost)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold border-t border-slate-200/80 pt-2.5 text-slate-900">
              <span>Total Due</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Preview Footer Area */}
        <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6 text-[10px] text-slate-600 leading-normal">
          {/* Notes Block */}
          <div
            style={{
              gridColumn: settings.notesPosition === "right" ? 2 : 1,
              textAlign: settings.notesAlign,
            }}
          >
            {showNotes && (
              <>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</div>
                <div className="text-slate-500 whitespace-pre-wrap">{renderLinkified(notes)}</div>
              </>
            )}
          </div>

          {/* Payment Block */}
          <div
            className="flex space-x-6 items-start"
            style={{
              gridColumn: settings.notesPosition === "right" ? 1 : 2,
              justifyContent: settings.paymentAlign === "right" ? "flex-end" : settings.paymentAlign === "center" ? "center" : "flex-start",
              textAlign: settings.paymentAlign,
            }}
          >
            {showQr && qrBase64 && (
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Scan Payment</div>
                <img src={qrBase64} alt="Scan to pay" className="w-20 h-20 object-contain border border-slate-200 rounded p-1 bg-white" />
              </div>
            )}
            {showPayment && (
              <div className="flex-1">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Info</div>
                <div className="text-slate-500 whitespace-pre-wrap">{renderLinkified(paymentInstructions)}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
