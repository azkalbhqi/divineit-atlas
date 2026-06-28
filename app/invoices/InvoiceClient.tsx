"use client";

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

// Import modular components
import SettingsCard from "./components/SettingsCard";
import CustomizerCard from "./components/CustomizerCard";
import SenderCard from "./components/SenderCard";
import ClientCard from "./components/ClientCard";
import ItemsCard from "./components/ItemsCard";
import CalculationsCard from "./components/CalculationsCard";
import PreviewPaper from "./components/PreviewPaper";
import AddBusinessModal from "./components/AddBusinessModal";

import { getCompanyProfiles, createCompanyProfile, CompanyProfile, getNextInvoiceNumber, saveInvoice } from "@/lib/db";
import { supabase } from "@/lib/supabase";

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

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

const CURRENCIES = [
  { value: "IDR", symbol: "Rp", label: "IDR (Rp)" },
  { value: "USD", symbol: "$", label: "USD ($)" },
  { value: "EUR", symbol: "€", label: "EUR (€)" },
  { value: "GBP", symbol: "£", label: "GBP (£)" },
  { value: "JPY", symbol: "¥", label: "JPY (¥)" },
  { value: "SGD", symbol: "S$", label: "SGD (S$)" },
];

export default function InvoiceClient() {
  // --- STATE ---
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [currency, setCurrency] = useState("IDR");
  const [currencySymbol, setCurrencySymbol] = useState("Rp");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [terms, setTerms] = useState("Due on Receipt");

  // Company Profile Database Template states
  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);

  const [senderName, setSenderName] = useState("diviteit studio");
  const [senderEmail, setSenderEmail] = useState("hello@diviteit.com");
  const [senderPhone, setSenderPhone] = useState("+62 812-3456-7890");
  const [senderAddress, setSenderAddress] = useState("Sudirman Central Business District\nJakarta, Indonesia");
  const [logoBase64, setLogoBase64] = useState("");
  const [qrBase64, setQrBase64] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const [items, setItems] = useState<LineItem[]>([
    { id: "item-1", description: "Professional Web Development Services", quantity: 1, price: 15000000, tax: 11, discount: 0 }
  ]);

  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business! Visit our site: www.diviteit.com");
  const [paymentInstructions, setPaymentInstructions] = useState("Bank: Transfer Bank\nAccount: 1234-5678-9012\nRouting: 987654321");

  // Visibility States
  const [showLogo, setShowLogo] = useState(true);
  const [showQr, setShowQr] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [showDiscount, setShowDiscount] = useState(true);
  const [showShipping, setShowShipping] = useState(true);
  const [showPayment, setShowPayment] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [showQty, setShowQty] = useState(true);
  const [showRate, setShowRate] = useState(true);

  // Field Enabled States (Inverse of disabledFields)
  const [enabledFields, setEnabledFields] = useState<any>({
    invoiceNumber: true,
    issueDate: true,
    dueDate: true,
    paymentTerms: true,
    senderName: true,
    senderEmail: true,
    senderPhone: true,
    senderAddress: true,
    clientName: true,
    clientEmail: true,
    clientPhone: true,
    clientAddress: true,
  });

  // Layout Settings
  const [settings, setSettings] = useState<InvoiceSettings>({
    headerPosition: "right",
    senderAlign: "left",
    clientAlign: "left",
    addressOrder: "normal",
    notesPosition: "left",
    notesAlign: "left",
    paymentPosition: "right",
    paymentAlign: "right",
  });

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toast State
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info",
  });

  // Scaling state
  const [scale, setScale] = useState(1);
  const [marginLeft, setMarginLeft] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState("auto");

  // DOM Refs
  const scaleWrapperRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION & DRAFT CACHING ---
  useEffect(() => {
    // Set default dates
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setIssueDate(today);
    setDueDate(nextWeek);

    // Fetch auto-generated invoice number from DB
    const fetchNextNum = async () => {
      try {
        const nextNum = await getNextInvoiceNumber();
        setInvoiceNumber(nextNum);
      } catch (err) {
        console.error("Failed to get next invoice number:", err);
      }
    };
    fetchNextNum();

    // Load draft
    const cached = localStorage.getItem("invoicefly_draft_data_react_clean");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          // invoiceNumber is auto-generated and fetched above
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
          if (parsed.issueDate) setIssueDate(parsed.issueDate);
          if (parsed.dueDate) setDueDate(parsed.dueDate);
          if (parsed.terms) setTerms(parsed.terms);
          if (parsed.senderName) setSenderName(parsed.senderName);
          if (parsed.senderEmail) setSenderEmail(parsed.senderEmail);
          if (parsed.senderPhone) setSenderPhone(parsed.senderPhone);
          if (parsed.senderAddress) setSenderAddress(parsed.senderAddress);
          if (parsed.logoBase64) setLogoBase64(parsed.logoBase64);
          if (parsed.qrBase64) setQrBase64(parsed.qrBase64);
          if (parsed.clientName) setClientName(parsed.clientName);
          if (parsed.clientEmail) setClientEmail(parsed.clientEmail);
          if (parsed.clientPhone) setClientPhone(parsed.clientPhone);
          if (parsed.clientAddress) setClientAddress(parsed.clientAddress);
          if (parsed.items) setItems(parsed.items);
          if (parsed.discountPercentage !== undefined) setDiscountPercentage(parsed.discountPercentage);
          if (parsed.taxPercentage !== undefined) setTaxPercentage(parsed.taxPercentage);
          if (parsed.shippingCost !== undefined) setShippingCost(parsed.shippingCost);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.paymentInstructions) setPaymentInstructions(parsed.paymentInstructions);
          if (parsed.showLogo !== undefined) setShowLogo(parsed.showLogo);
          if (parsed.showQr !== undefined) setShowQr(parsed.showQr);
          if (parsed.showTax !== undefined) setShowTax(parsed.showTax);
          if (parsed.showDiscount !== undefined) setShowDiscount(parsed.showDiscount);
          if (parsed.showShipping !== undefined) setShowShipping(parsed.showShipping);
          if (parsed.showPayment !== undefined) setShowPayment(parsed.showPayment);
          if (parsed.showNotes !== undefined) setShowNotes(parsed.showNotes);
          if (parsed.showQty !== undefined) setShowQty(parsed.showQty);
          if (parsed.showRate !== undefined) setShowRate(parsed.showRate);
          if (parsed.enabledFields) setEnabledFields(parsed.enabledFields);
          if (parsed.settings) setSettings(parsed.settings);
        }
      } catch (e) {
        console.warn("Failed to load draft data:", e);
      }
    }
  }, []);

  // Save draft whenever state changes
  useEffect(() => {
    const draft = {
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
      discountPercentage,
      taxPercentage,
      shippingCost,
      notes,
      paymentInstructions,
      showLogo,
      showQr,
      showTax,
      showDiscount,
      showShipping,
      showPayment,
      showNotes,
      showQty,
      showRate,
      enabledFields,
      settings,
    };
    localStorage.setItem("invoicefly_draft_data_react_clean", JSON.stringify(draft));
  }, [
    invoiceNumber, currency, currencySymbol, issueDate, dueDate, terms,
    senderName, senderEmail, senderPhone, senderAddress, logoBase64, qrBase64,
    clientName, clientEmail, clientPhone, clientAddress, items,
    discountPercentage, taxPercentage, shippingCost, notes, paymentInstructions,
    showLogo, showQr, showTax, showDiscount, showShipping, showPayment, showNotes,
    showQty, showRate, enabledFields, settings
  ]);

  // Responsive Scaling & Page Guides
  const updateScaling = () => {
    const wrapper = scaleWrapperRef.current;
    const preview = previewRef.current;
    if (!wrapper || !preview) return;

    const containerWidth = wrapper.clientWidth;
    const targetWidth = 800; // Fixed width of virtual A4 paper

    if (containerWidth < targetWidth && containerWidth > 0) {
      const currentScale = containerWidth / targetWidth;
      setScale(currentScale);
      setMarginLeft((containerWidth - targetWidth * currentScale) / 2);
      setWrapperHeight(`${preview.offsetHeight * currentScale}px`);
    } else {
      setScale(1);
      setMarginLeft(0);
      setWrapperHeight("auto");
    }
  };

  useEffect(() => {
    updateScaling();
    window.addEventListener("resize", updateScaling);
    return () => window.removeEventListener("resize", updateScaling);
  }, [items, showQty, showRate, showTax, showDiscount, showLogo, showQr, showNotes, showPayment, settings, enabledFields]);

  // Fetch profiles on load
  const fetchProfiles = async () => {
    try {
      const res = await getCompanyProfiles();
      setCompanyProfiles(res);
    } catch (err) {
      console.error("Failed to load profiles:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateScaling, 100);
    return () => clearTimeout(timer);
  }, [items]);

  const handleSelectProfile = (id: string) => {
    setSelectedProfileId(id);
    if (!id) return;
    const profile = companyProfiles.find((p) => p.id === id);
    if (profile) {
      setSenderName(profile.business_name);
      setSenderPhone(profile.phone || "");
      setLogoBase64(profile.logo_url || "");
      setSenderEmail(profile.email_address || "");
      setSenderAddress(profile.address || "");
    }
  };

  const handleAddBusinessSubmit = async (data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    logoFile: File | null;
  }) => {
    let logoUrl = "";
    if (data.logoFile) {
      const fileExt = data.logoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `logos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("logo")
        .upload(filePath, data.logoFile);
        
      if (uploadError) {
        triggerToast("Failed to upload logo: " + uploadError.message, "error");
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from("logo")
        .getPublicUrl(filePath);
      logoUrl = urlData.publicUrl;
    }

    const newProfile = await createCompanyProfile({
      business_name: data.name,
      phone: data.phone,
      logo_url: logoUrl,
      email_address: data.email,
      address: data.address,
    });

    triggerToast("Business profile added successfully!", "success");
    await fetchProfiles();
    handleSelectProfile(newProfile.id);
  };

  // --- HELPER FUNCTIONS ---
  const triggerToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const formatCurrency = (amount: number) => {
    if (currencySymbol === "Rp" || currency === "IDR") {
      const integerPart = Math.floor(amount);
      const decimalPart = Math.round((amount - integerPart) * 100);
      const formattedInt = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      if (decimalPart === 0) {
        return `Rp ${formattedInt}`;
      } else {
        const formattedDec = decimalPart < 10 ? "0" + decimalPart : decimalPart;
        return `Rp ${formattedInt},${formattedDec}`;
      }
    }
    return `${currencySymbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatQty = (qty: number) => {
    if (Number.isInteger(qty)) return qty.toString();
    return qty.toFixed(2);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      triggerToast("Please upload an image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxW = 300;
        const maxH = 150;
        let width = img.width;
        let height = img.height;

        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        if (height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL(file.type);
        setLogoBase64(resizedBase64);
        triggerToast("Logo uploaded successfully!", "success");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      triggerToast("Please upload an image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxW = 200;
        const maxH = 200;
        let width = img.width;
        let height = img.height;

        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        if (height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedBase64 = canvas.toDataURL(file.type);
        setQrBase64(resizedBase64);
        triggerToast("Payment QR Code uploaded!", "success");
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const item = CURRENCIES.find(c => c.value === val);
    setCurrency(val);
    setCurrencySymbol(item?.symbol || "Rp");
  };

  // --- ITEM HANDLERS ---
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substring(2, 9),
      description: "",
      quantity: 1,
      price: 0,
      tax: 0,
      discount: 0,
    };
    setItems([...items, newItem]);
    triggerToast("Item added.", "info");
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    triggerToast("Item removed.", "info");
  };

  // --- CALCULATION LOGIC ---
  const subtotal = items.reduce((sum, item) => {
    const qty = showQty ? item.quantity : 1;
    return sum + qty * item.price;
  }, 0);

  const itemsDiscountTotal = items.reduce((sum, item) => {
    if (!showDiscount) return 0;
    const qty = showQty ? item.quantity : 1;
    const base = qty * item.price;
    return sum + base * ((item.discount || 0) / 100);
  }, 0);

  const itemsTaxTotal = items.reduce((sum, item) => {
    if (!showTax) return 0;
    const qty = showQty ? item.quantity : 1;
    const base = qty * item.price;
    const discountAmount = base * ((item.discount || 0) / 100);
    const itemTotal = base - discountAmount;
    return sum + itemTotal * ((item.tax || 0) / 100);
  }, 0);

  let runningSubtotal = subtotal - itemsDiscountTotal;

  let globalDiscountAmount = 0;
  if (showDiscount && discountPercentage > 0) {
    globalDiscountAmount = runningSubtotal * (discountPercentage / 100);
    runningSubtotal -= globalDiscountAmount;
  }
  const totalDiscountCombined = globalDiscountAmount + itemsDiscountTotal;

  let globalTaxAmount = 0;
  if (showTax && taxPercentage > 0) {
    globalTaxAmount = runningSubtotal * (taxPercentage / 100);
  }
  const totalTaxCombined = globalTaxAmount + itemsTaxTotal;

  const shipping = showShipping ? shippingCost : 0;
  const grandTotal = runningSubtotal + totalTaxCombined + shipping;

  // --- EXPORT PDF ACTION ---
  const handleDownloadPDF = async () => {
    triggerToast("Generating & saving invoice...", "info");

    const element = previewRef.current;
    if (!element) return;

    element.classList.add("print-native");

    try {
      // Wait a tick for print-native styles to apply
      await new Promise((r) => setTimeout(r, 150));

      // 1. Render the element to a canvas using html2canvas-pro (supports oklch/oklab)
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
      });

      // 2. Convert canvas to image data
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // 3. Build PDF with jsPDF
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const margin = 10; // 10mm margins on all sides
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2;

      // Calculate how many pages we need based on the canvas aspect ratio
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgHeightInPdf = pdfWidth / ratio;

      if (imgHeightInPdf <= pdfHeight) {
        // Fits on one page
        pdf.addImage(imgData, "JPEG", margin, margin, pdfWidth, imgHeightInPdf);
      } else {
        // Multi-page: slice the canvas into page-sized chunks
        const pageCanvasHeight = (canvasWidth * pdfHeight) / pdfWidth;
        let position = 0;
        let page = 0;

        while (position < canvasHeight) {
          const sliceHeight = Math.min(pageCanvasHeight, canvasHeight - position);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvasWidth;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, position, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
          const sliceHeightMm = (sliceHeight / canvasWidth) * pdfWidth;

          if (page > 0) pdf.addPage();
          pdf.addImage(pageImgData, "JPEG", margin, margin, pdfWidth, sliceHeightMm);

          position += sliceHeight;
          page++;
        }
      }

      // 4. Get the PDF as a Blob
      const blob = pdf.output("blob");

      // 5. Upload to Supabase Storage 'invoices' bucket
      const fileName = `${invoiceNumber}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Storage upload failed: " + uploadError.message);
      }

      // 6. Get Public URL
      const { data: urlData } = supabase.storage
        .from("invoices")
        .getPublicUrl(fileName);
      const pdfUrl = urlData.publicUrl;

      // 7. Save to Invoices Database Table
      await saveInvoice(invoiceNumber, pdfUrl);

      triggerToast("Invoice saved to database!", "success");

      // 8. Download PDF locally from blob
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // 9. Fetch next invoice number automatically
      const nextNum = await getNextInvoiceNumber();
      setInvoiceNumber(nextNum);
    } catch (err: any) {
      console.error("PDF Generation error:", err);
      triggerToast("Failed to generate PDF: " + err.message, "error");
    } finally {
      element.classList.remove("print-native");
    }
  };

  return (
    <>

      <div className={`min-h-screen ${isDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-800"} flex flex-col font-sans transition-colors duration-200`}>
        {/* Toast Alert */}
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl border text-xs shadow-2xl transition-all duration-300 transform ${toast.show ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
            } ${toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
              : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/30 text-rose-400"
                : "bg-zinc-900/95 border-zinc-800 text-zinc-300"
            }`}
        >
          <span>
            {toast.type === "success" && "✅"}
            {toast.type === "error" && "⚠️"}
            {toast.type === "info" && "ℹ️"}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>

        {/* Global Header */}
        <header className={`border-b ${isDarkMode ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-zinc-200"} sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between`}>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDarkMode
                ? "bg-zinc-800/60 border-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                }`}
              title="Toggle Workspace Theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>📥</span>
              <span>Download PDF</span>
            </button>
          </div>
        </header>

        {/* App Workspace Container */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-8 p-6 lg:p-8 max-w-full mx-auto w-full">
          {/* Left Column: Form Editor Panel */}
          <section className="space-y-6 max-h-[85vh] xl:overflow-y-auto xl:pr-4">
            <SettingsCard
              invoiceNumber={invoiceNumber}
              setInvoiceNumber={setInvoiceNumber}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
              currencies={CURRENCIES}
              issueDate={issueDate}
              setIssueDate={setIssueDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              terms={terms}
              setTerms={setTerms}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              headerPosition={settings.headerPosition}
              setHeaderPosition={(val) => setSettings({ ...settings, headerPosition: val })}
            />

            <CustomizerCard
              showLogo={showLogo}
              setShowLogo={setShowLogo}
              showQr={showQr}
              setShowQr={setShowQr}
              showQty={showQty}
              setShowQty={setShowQty}
              showRate={showRate}
              setShowRate={setShowRate}
              showTax={showTax}
              setShowTax={setShowTax}
              showDiscount={showDiscount}
              setShowDiscount={setShowDiscount}
              showShipping={showShipping}
              setShowShipping={setShowShipping}
              showPayment={showPayment}
              setShowPayment={setShowPayment}
              showNotes={showNotes}
              setShowNotes={setShowNotes}
            />

            <SenderCard
              senderName={senderName}
              setSenderName={setSenderName}
              senderEmail={senderEmail}
              setSenderEmail={setSenderEmail}
              senderPhone={senderPhone}
              setSenderPhone={setSenderPhone}
              senderAddress={senderAddress}
              setSenderAddress={setSenderAddress}
              showLogo={showLogo}
              logoBase64={logoBase64}
              setLogoBase64={setLogoBase64}
              handleLogoUpload={handleLogoUpload}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              companyProfiles={companyProfiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={handleSelectProfile}
              onOpenAddBusiness={() => setIsAddBusinessOpen(true)}
            />

            <ClientCard
              clientName={clientName}
              setClientName={setClientName}
              clientEmail={clientEmail}
              setClientEmail={setClientEmail}
              clientPhone={clientPhone}
              setClientPhone={setClientPhone}
              clientAddress={clientAddress}
              setClientAddress={setClientAddress}
              enabledFields={enabledFields}
              setEnabledFields={setEnabledFields}
              clientAlign={settings.clientAlign}
              setClientAlign={(val) => setSettings({ ...settings, clientAlign: val })}
              addressOrder={settings.addressOrder}
              setAddressOrder={(val) => setSettings({ ...settings, addressOrder: val })}
            />

            <ItemsCard
              items={items}
              currencySymbol={currencySymbol}
              showQty={showQty}
              showRate={showRate}
              showTax={showTax}
              showDiscount={showDiscount}
              addLineItem={addLineItem}
              updateItem={updateItem}
              deleteItem={deleteItem}
            />

            <CalculationsCard
              currencySymbol={currencySymbol}
              showQr={showQr}
              qrBase64={qrBase64}
              setQrBase64={setQrBase64}
              handleQrUpload={handleQrUpload}
              showDiscount={showDiscount}
              discountPercentage={discountPercentage}
              setDiscountPercentage={setDiscountPercentage}
              showTax={showTax}
              taxPercentage={taxPercentage}
              setTaxPercentage={setTaxPercentage}
              showShipping={showShipping}
              shippingCost={shippingCost}
              setShippingCost={setShippingCost}
              showNotes={showNotes}
              notes={notes}
              setNotes={setNotes}
              showPayment={showPayment}
              paymentInstructions={paymentInstructions}
              setPaymentInstructions={setPaymentInstructions}
              settings={settings}
              setSettings={setSettings}
            />
          </section>

          {/* Right Column: Virtual A4 Invoice Paper Realtime Preview */}
          <section className="flex flex-col items-center justify-center">
            <PreviewPaper
              previewRef={previewRef}
              scaleWrapperRef={scaleWrapperRef}
              scale={scale}
              marginLeft={marginLeft}
              wrapperHeight={wrapperHeight}
              invoiceNumber={invoiceNumber}
              currency={currency}
              currencySymbol={currencySymbol}
              issueDate={issueDate}
              dueDate={dueDate}
              terms={terms}
              senderName={senderName}
              senderEmail={senderEmail}
              senderPhone={senderPhone}
              senderAddress={senderAddress}
              logoBase64={logoBase64}
              qrBase64={qrBase64}
              clientName={clientName}
              clientEmail={clientEmail}
              clientPhone={clientPhone}
              clientAddress={clientAddress}
              items={items}
              showLogo={showLogo}
              showQr={showQr}
              showQty={showQty}
              showRate={showRate}
              showTax={showTax}
              showDiscount={showDiscount}
              showShipping={showShipping}
              showPayment={showPayment}
              showNotes={showNotes}
              discountPercentage={discountPercentage}
              taxPercentage={taxPercentage}
              shippingCost={shipping}
              notes={notes}
              paymentInstructions={paymentInstructions}
              enabledFields={enabledFields}
              settings={settings}
              subtotal={subtotal}
              totalDiscountCombined={totalDiscountCombined}
              totalTaxCombined={totalTaxCombined}
              grandTotal={grandTotal}
              itemsDiscountTotal={itemsDiscountTotal}
              itemsTaxTotal={itemsTaxTotal}
              formatCurrency={formatCurrency}
              formatQty={formatQty}
            />
          </section>
        </div>
      </div>

      <AddBusinessModal
        isOpen={isAddBusinessOpen}
        onClose={() => setIsAddBusinessOpen(false)}
        onSubmit={handleAddBusinessSubmit}
      />
    </>
  );
}
