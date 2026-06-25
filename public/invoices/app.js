// App state and configuration
let invoiceData = {
  number: 'INV-0001',
  currency: 'IDR',
  currencySymbol: 'Rp',
  issueDate: '',
  dueDate: '',
  terms: 'Due on Receipt',
  
  senderName: 'diviteit studio',
  senderEmail: 'hello@diviteit.com',
  senderPhone: '+62 812-3456-7890',
  senderAddress: 'Sudirman Central Business District\nJakarta, Indonesia',
  logoBase64: '',
  qrBase64: '',
  
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientAddress: '',
  
  items: [],
  
  discountPercentage: 0,
  taxPercentage: 0,
  shippingCost: 0,
  
  notes: 'Thank you for your business! Visit our site: www.diviteit.com',
  paymentInstructions: 'Bank: Transfer Bank\nAccount: 1234-5678-9012\nRouting: 987654321',

  showLogo: true,
  showQr: true,
  showTax: true,
  showDiscount: true,
  showShipping: true,
  showPayment: true,
  showNotes: true,
  showQty: true,
  showRate: true,
  disabledFields: {
    invoiceNumber: false,
    issueDate: false,
    dueDate: false,
    paymentTerms: false,
    senderName: false,
    senderEmail: false,
    senderPhone: false,
    senderAddress: false,
    clientName: false,
    clientEmail: false,
    clientPhone: false,
    clientAddress: false
  },
  settings: {
    headerPosition: 'right',
    senderAlign: 'left',
    clientAlign: 'left',
    addressOrder: 'normal',
    notesPosition: 'left',
    notesAlign: 'left',
    paymentPosition: 'right',
    paymentAlign: 'right'
  }
};

// DOM Elements
const doc = {
  invoiceNumber: document.getElementById('invoice-number'),
  currencySelector: document.getElementById('currency-selector'),
  issueDate: document.getElementById('issue-date'),
  dueDate: document.getElementById('due-date'),
  paymentTerms: document.getElementById('payment-terms'),
  
  // Logo Upload Elements
  senderLogo: document.getElementById('sender-logo'),
  logoPlaceholder: document.getElementById('logo-placeholder'),
  logoPreviewBox: document.getElementById('logo-preview-box'),
  logoPreviewImg: document.getElementById('logo-preview-img'),
  removeLogoBtn: document.getElementById('remove-logo-btn'),
  
  // QR Upload Elements
  qrCodeFile: document.getElementById('qr-code-file'),
  qrPlaceholder: document.getElementById('qr-placeholder'),
  qrPreviewBox: document.getElementById('qr-preview-box'),
  qrPreviewImg: document.getElementById('qr-preview-img'),
  removeQrBtn: document.getElementById('remove-qr-btn'),
  
  senderName: document.getElementById('sender-name'),
  senderEmail: document.getElementById('sender-email'),
  senderPhone: document.getElementById('sender-phone'),
  senderAddress: document.getElementById('sender-address'),
  
  clientName: document.getElementById('client-name'),
  clientEmail: document.getElementById('client-email'),
  clientPhone: document.getElementById('client-phone'),
  clientAddress: document.getElementById('client-address'),
  
  itemsContainer: document.getElementById('items-container'),
  addItemBtn: document.getElementById('add-item-btn'),
  
  discountPercentage: document.getElementById('discount-percentage'),
  taxPercentage: document.getElementById('tax-percentage'),
  shippingCost: document.getElementById('shipping-cost'),
  invoiceNotes: document.getElementById('invoice-notes'),
  paymentInstructions: document.getElementById('payment-instructions'),
  
  // Preview DOM Elements
  previewLogoContainer: document.getElementById('preview-logo-container'),
  previewInvoiceNumber: document.getElementById('preview-invoice-number'),
  previewIssueDate: document.getElementById('preview-issue-date'),
  previewDueDate: document.getElementById('preview-due-date'),
  previewPaymentTerms: document.getElementById('preview-payment-terms'),
  previewSenderDetails: document.getElementById('preview-sender-details'),
  previewClientDetails: document.getElementById('preview-client-details'),
  previewTableBody: document.getElementById('preview-table-body'),
  
  previewSubtotal: document.getElementById('preview-subtotal'),
  previewRowDiscount: document.getElementById('preview-row-discount'),
  previewDiscountLabel: document.getElementById('preview-discount-label'),
  previewDiscount: document.getElementById('preview-discount'),
  previewRowTax: document.getElementById('preview-row-tax'),
  previewTaxLabel: document.getElementById('preview-tax-label'),
  previewTax: document.getElementById('preview-tax'),
  previewRowShipping: document.getElementById('preview-row-shipping'),
  previewShipping: document.getElementById('preview-shipping'),
  previewTotal: document.getElementById('preview-total'),
  
  // QR code preview elements
  previewQrContainer: document.getElementById('preview-qr-container'),
  previewQrImg: document.getElementById('preview-qr-img'),
  
  previewNotes: document.getElementById('preview-notes'),
  previewPaymentInfo: document.getElementById('preview-payment-info'),
  
  // Theme & Buttons
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  btnDownloadPdf: document.getElementById('btn-download-pdf'),
  
  // Toast
  toast: document.getElementById('toast-notify'),
  toastIcon: document.getElementById('toast-icon'),
  toastMessage: document.getElementById('toast-message'),

  // Visibility Checkboxes
  showLogo: document.getElementById('show-logo'),
  showQr: document.getElementById('show-qr'),
  showTax: document.getElementById('show-tax'),
  showDiscount: document.getElementById('show-discount'),
  showShipping: document.getElementById('show-shipping'),
  showPayment: document.getElementById('show-payment'),
  showNotes: document.getElementById('show-notes'),
  showQty: document.getElementById('show-qty'),
  showRate: document.getElementById('show-rate')
};

window.addEventListener('DOMContentLoaded', () => {
  // 1. Set dates if blank
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  invoiceData.issueDate = today;
  invoiceData.dueDate = nextWeek;
  
  // 2. Load draft if exists
  loadDraft();
  
  // 3. Initialize visual components
  syncFormInputs();
  renderItems();
  toggleEditorFieldsVisibility();
  calculateAndPopulatePreview();
  
  // 4. Initialize Lucide Icons
  lucide.createIcons();
  
  // 5. Bind All Event Listeners
  bindEvents();
});

// Bind UI event handlers
function bindEvents() {
  // Input triggers for live preview update and draft caching
  const autoBindIds = [
    'invoice-number', 'payment-terms', 'issue-date', 'due-date',
    'sender-name', 'sender-email', 'sender-phone', 'sender-address',
    'client-name', 'client-email', 'client-phone', 'client-address',
    'discount-percentage', 'tax-percentage', 'shipping-cost',
    'invoice-notes', 'payment-instructions',
    'show-logo', 'show-qr', 'show-tax', 'show-discount', 'show-shipping', 'show-payment', 'show-notes', 'show-qty', 'show-rate'
  ];
  
  autoBindIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateStateFromForm();
        if (id.startsWith('show-')) {
          toggleEditorFieldsVisibility();
          
          // Sync eye icons for global toggles
          if (id === 'show-logo') updateFieldUIVisibility('showLogo');
          if (id === 'show-qr') updateFieldUIVisibility('showQr');
          if (id === 'show-tax') updateFieldUIVisibility('showTax');
          if (id === 'show-discount') updateFieldUIVisibility('showDiscount');
          if (id === 'show-shipping') updateFieldUIVisibility('showShipping');
          if (id === 'show-payment') updateFieldUIVisibility('showPayment');
          if (id === 'show-notes') updateFieldUIVisibility('showNotes');
          
          renderItems();
        }
        calculateAndPopulatePreview();
        saveDraft();
      });
    }
  });
  
  // Bind click event for eye toggle buttons
  document.querySelectorAll('.field-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.target.closest('.field-toggle-btn');
      if (!button) return;
      const field = button.getAttribute('data-field');
      toggleFieldState(field);
    });
  });
  
  // Currency select triggers update
  doc.currencySelector.addEventListener('change', () => {
    const selectedOption = doc.currencySelector.options[doc.currencySelector.selectedIndex];
    invoiceData.currency = doc.currencySelector.value;
    invoiceData.currencySymbol = selectedOption.getAttribute('data-symbol') || 'Rp';
    calculateAndPopulatePreview();
    saveDraft();
  });
  
  // Logo uploading trigger
  doc.senderLogo.addEventListener('change', handleLogoUpload);
  doc.removeLogoBtn.addEventListener('click', removeLogo);
  
  // QR uploading trigger
  doc.qrCodeFile.addEventListener('change', handleQrUpload);
  doc.removeQrBtn.addEventListener('click', removeQr);
  
  // Items actions
  doc.addItemBtn.addEventListener('click', addLineItem);
  
  // Theme Toggle
  doc.themeToggleBtn.addEventListener('click', toggleTheme);
  
  // File Export Actions
  doc.btnDownloadPdf.addEventListener('click', downloadPdfAction);
  
  // Watch resize for page guide lines and responsive scaling
  window.addEventListener('resize', () => {
    updatePageBreakGuides();
    scaleInvoicePreview();
  });

  // Bind layout settings dropdown change listeners
  document.querySelectorAll('.layout-setting').forEach(select => {
    select.addEventListener('change', (e) => {
      const settingId = e.target.id;
      const val = e.target.value;
      
      if (!invoiceData.settings) {
        invoiceData.settings = {};
      }
      
      if (settingId === 'setting-header-position') invoiceData.settings.headerPosition = val;
      if (settingId === 'setting-sender-align') invoiceData.settings.senderAlign = val;
      if (settingId === 'setting-client-align') invoiceData.settings.clientAlign = val;
      if (settingId === 'setting-address-order') invoiceData.settings.addressOrder = val;
      
      if (settingId === 'setting-notes-position') {
        invoiceData.settings.notesPosition = val;
        const paymentPos = val === 'left' ? 'right' : 'left';
        invoiceData.settings.paymentPosition = paymentPos;
        const paymentPosSel = document.getElementById('setting-payment-position');
        if (paymentPosSel) paymentPosSel.value = paymentPos;
      }
      if (settingId === 'setting-notes-align') invoiceData.settings.notesAlign = val;
      
      if (settingId === 'setting-payment-position') {
        invoiceData.settings.paymentPosition = val;
        const notesPos = val === 'left' ? 'right' : 'left';
        invoiceData.settings.notesPosition = notesPos;
        const notesPosSel = document.getElementById('setting-notes-position');
        if (notesPosSel) notesPosSel.value = notesPos;
      }
      if (settingId === 'setting-payment-align') invoiceData.settings.paymentAlign = val;
      
      calculateAndPopulatePreview();
      saveDraft();
    });
  });
}

// State Synchronization: Form -> state object
function updateStateFromForm() {
  invoiceData.number = doc.invoiceNumber.value;
  invoiceData.issueDate = doc.issueDate.value;
  invoiceData.dueDate = doc.dueDate.value;
  invoiceData.terms = doc.paymentTerms.value;
  
  invoiceData.senderName = doc.senderName.value;
  invoiceData.senderEmail = doc.senderEmail.value;
  invoiceData.senderPhone = doc.senderPhone.value;
  invoiceData.senderAddress = doc.senderAddress.value;
  
  invoiceData.clientName = doc.clientName.value;
  invoiceData.clientEmail = doc.clientEmail.value;
  invoiceData.clientPhone = doc.clientPhone.value;
  invoiceData.clientAddress = doc.clientAddress.value;
  
  invoiceData.discountPercentage = parseFloat(doc.discountPercentage.value) || 0;
  invoiceData.taxPercentage = parseFloat(doc.taxPercentage.value) || 0;
  invoiceData.shippingCost = parseFormattedNumber(doc.shippingCost.value);
  invoiceData.notes = doc.invoiceNotes.value;
  invoiceData.paymentInstructions = doc.paymentInstructions.value;

  invoiceData.showLogo = doc.showLogo.checked;
  invoiceData.showQr = doc.showQr.checked;
  invoiceData.showTax = doc.showTax.checked;
  invoiceData.showDiscount = doc.showDiscount.checked;
  invoiceData.showShipping = doc.showShipping.checked;
  invoiceData.showPayment = doc.showPayment.checked;
  invoiceData.showNotes = doc.showNotes.checked;
  invoiceData.showQty = doc.showQty.checked;
  invoiceData.showRate = doc.showRate.checked;
}

// Sync inputs with loaded draft state
function syncFormInputs() {
  doc.invoiceNumber.value = invoiceData.number;
  doc.currencySelector.value = invoiceData.currency;
  
  const selectedOption = doc.currencySelector.querySelector(`option[value="${invoiceData.currency}"]`);
  invoiceData.currencySymbol = selectedOption ? selectedOption.getAttribute('data-symbol') : 'Rp';
  
  doc.issueDate.value = invoiceData.issueDate;
  doc.dueDate.value = invoiceData.dueDate;
  doc.paymentTerms.value = invoiceData.terms;
  
  doc.senderName.value = invoiceData.senderName;
  doc.senderEmail.value = invoiceData.senderEmail;
  doc.senderPhone.value = invoiceData.senderPhone;
  doc.senderAddress.value = invoiceData.senderAddress;
  
  doc.clientName.value = invoiceData.clientName;
  doc.clientEmail.value = invoiceData.clientEmail;
  doc.clientPhone.value = invoiceData.clientPhone;
  doc.clientAddress.value = invoiceData.clientAddress;
  
  doc.discountPercentage.value = invoiceData.discountPercentage;
  doc.taxPercentage.value = invoiceData.taxPercentage;
  doc.shippingCost.value = invoiceData.shippingCost;
  doc.invoiceNotes.value = invoiceData.notes;
  doc.paymentInstructions.value = invoiceData.paymentInstructions;
  
  doc.showLogo.checked = invoiceData.showLogo !== undefined ? invoiceData.showLogo : true;
  doc.showQr.checked = invoiceData.showQr !== undefined ? invoiceData.showQr : true;
  doc.showTax.checked = invoiceData.showTax !== undefined ? invoiceData.showTax : true;
  doc.showDiscount.checked = invoiceData.showDiscount !== undefined ? invoiceData.showDiscount : true;
  doc.showShipping.checked = invoiceData.showShipping !== undefined ? invoiceData.showShipping : true;
  doc.showPayment.checked = invoiceData.showPayment !== undefined ? invoiceData.showPayment : true;
  doc.showNotes.checked = invoiceData.showNotes !== undefined ? invoiceData.showNotes : true;
  doc.showQty.checked = invoiceData.showQty !== undefined ? invoiceData.showQty : true;
  doc.showRate.checked = invoiceData.showRate !== undefined ? invoiceData.showRate : true;
  
  if (!invoiceData.disabledFields) {
    invoiceData.disabledFields = {};
  }
  
  // Render logo if base64 stored
  if (invoiceData.logoBase64) {
    doc.logoPreviewImg.src = invoiceData.logoBase64;
    doc.logoPlaceholder.style.display = 'none';
    doc.logoPreviewBox.style.display = 'block';
  } else {
    doc.logoPlaceholder.style.display = 'flex';
    doc.logoPreviewBox.style.display = 'none';
  }
  
  // Render QR if base64 stored
  if (invoiceData.qrBase64) {
    doc.qrPreviewImg.src = invoiceData.qrBase64;
    doc.qrPlaceholder.style.display = 'none';
    doc.qrPreviewBox.style.display = 'block';
  } else {
    doc.qrPlaceholder.style.display = 'flex';
    doc.qrPreviewBox.style.display = 'none';
  }
  
  // Initialize visual states of eye toggle fields
  const allToggledFields = [
    'invoiceNumber', 'issueDate', 'dueDate', 'paymentTerms',
    'senderName', 'senderEmail', 'senderPhone', 'senderAddress',
    'clientName', 'clientEmail', 'clientPhone', 'clientAddress',
    'showLogo', 'showQr', 'showDiscount', 'showTax', 'showShipping', 'showNotes', 'showPayment'
  ];
  allToggledFields.forEach(field => updateFieldUIVisibility(field));
  
  if (!invoiceData.settings) {
    invoiceData.settings = {};
  }
  
  const defaults = {
    headerPosition: 'right',
    senderAlign: 'left',
    clientAlign: 'left',
    addressOrder: 'normal',
    notesPosition: 'left',
    notesAlign: 'left',
    paymentPosition: 'right',
    paymentAlign: 'right'
  };
  
  for (const key in defaults) {
    if (invoiceData.settings[key] === undefined) {
      invoiceData.settings[key] = defaults[key];
    }
  }
  
  const selectors = {
    'setting-header-position': invoiceData.settings.headerPosition,
    'setting-sender-align': invoiceData.settings.senderAlign,
    'setting-client-align': invoiceData.settings.clientAlign,
    'setting-address-order': invoiceData.settings.addressOrder,
    'setting-notes-position': invoiceData.settings.notesPosition,
    'setting-notes-align': invoiceData.settings.notesAlign,
    'setting-payment-position': invoiceData.settings.paymentPosition,
    'setting-payment-align': invoiceData.settings.paymentAlign
  };
  
  for (const id in selectors) {
    const el = document.getElementById(id);
    if (el) el.value = selectors[id];
  }
  
  toggleEditorFieldsVisibility();
}

// Item Line addition and list renderer
function renderItems() {
  doc.itemsContainer.innerHTML = '';
  
  if (invoiceData.items.length === 0) {
    // Add an initial empty row if none exists
    invoiceData.items.push({
      id: generateId(),
      description: 'Web Design & Branding Services',
      quantity: 1,
      price: 5000000.00,
      tax: 0,
      discount: 0
    });
  }
  
  // Calculate dynamic grid columns count for Row 1 based on active elements
  const showQty = invoiceData.showQty !== undefined ? invoiceData.showQty : true;
  const showRate = invoiceData.showRate !== undefined ? invoiceData.showRate : true;
  const showDiscount = invoiceData.showDiscount !== undefined ? invoiceData.showDiscount : true;
  const showTax = invoiceData.showTax !== undefined ? invoiceData.showTax : true;
  
  let cols = 0;
  if (showQty) cols++;
  if (showRate) cols++;
  if (showDiscount) cols++;
  if (showTax) cols++;
  
  const gridCols = Math.max(1, cols);
  const gridStyle = `display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 16px; margin-bottom: 12px;`;
  
  invoiceData.items.forEach((item, index) => {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.setAttribute('data-id', item.id);
    
    let row1Content = '';
    if (showQty) {
      row1Content += `
        <div class="form-group no-margin">
          <label>Qty</label>
          <input type="text" class="item-qty" inputmode="decimal" value="${item.quantity}" oninput="updateItemField('${item.id}', 'quantity', parseFormattedNumber(this.value))">
        </div>
      `;
    }
    if (showRate) {
      row1Content += `
        <div class="form-group no-margin">
          <label>Rate</label>
          <input type="text" class="item-price" inputmode="decimal" value="${item.price}" oninput="updateItemField('${item.id}', 'price', parseFormattedNumber(this.value))">
        </div>
      `;
    }
    if (showDiscount) {
      row1Content += `
        <div class="form-group no-margin">
          <label>Discount (%)</label>
          <input type="text" class="item-discount" inputmode="decimal" value="${item.discount || 0}" oninput="updateItemField('${item.id}', 'discount', parseFormattedNumber(this.value))">
        </div>
      `;
    }
    if (showTax) {
      row1Content += `
        <div class="form-group no-margin">
          <label>Tax (%)</label>
          <input type="number" class="item-tax" value="${item.tax || 0}" min="0" max="100" step="any" oninput="updateItemField('${item.id}', 'tax', parseFloat(this.value) || 0)">
        </div>
      `;
    }
    
    // If row 1 is completely empty, hide it
    const row1Html = cols > 0 ? `<div style="${gridStyle}">${row1Content}</div>` : '';
    
    itemRow.innerHTML = `
      <!-- Row 1: Numbers (Qty, Rate, Discount, Tax) -->
      ${row1Html}
      
      <!-- Row 2: Drag Handle, Resizable Textarea Description, and Action buttons -->
      <div style="display: flex; gap: 12px; align-items: flex-end; margin-top: ${cols > 0 ? '0' : '8px'};">
        <div class="item-drag-handle" style="display: flex; align-items: center; gap: 6px; padding-bottom: 8px; cursor: grab; color: var(--text-muted);">
          <i data-lucide="menu" style="width: 16px; height: 16px;"></i>
          <span style="font-size: 13px; font-weight: 600; white-space: nowrap;">Item #${index + 1}</span>
        </div>
        <div class="form-group no-margin" style="flex: 1;">
          <label>Description</label>
          <textarea class="item-desc" style="resize: vertical; min-height: 40px; height: ${item.height || '40px'}; padding: 8px 12px;" oninput="updateItemField('${item.id}', 'description', this.value)">${escapeHtml(item.description)}</textarea>
        </div>
        <div class="item-actions" style="margin-bottom: 2px;">
          <button class="btn btn-text btn-icon-only" onclick="moveItem(${index}, -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
            <i data-lucide="chevron-up" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="btn btn-text btn-icon-only" onclick="moveItem(${index}, 1)" title="Move Down" ${index === invoiceData.items.length - 1 ? 'disabled' : ''}>
            <i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i>
          </button>
          <button class="btn btn-danger btn-icon-only" onclick="deleteLineItem('${item.id}')" title="Delete Item">
            <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      </div>
    `;
    
    doc.itemsContainer.appendChild(itemRow);
    
    // Attach mouseup resize listener to save textarea height
    const descTextarea = itemRow.querySelector('.item-desc');
    if (descTextarea) {
      descTextarea.addEventListener('mouseup', (e) => {
        const currentHeight = e.target.style.height;
        if (currentHeight && currentHeight !== item.height) {
          updateItemField(item.id, 'height', currentHeight);
        }
      });
    }
  });
  
  // Reinitialize icons in newly created items
  lucide.createIcons();
}

function addLineItem() {
  const newItem = {
    id: generateId(),
    description: '',
    quantity: 1,
    price: 0,
    tax: 0,
    discount: 0
  };
  invoiceData.items.push(newItem);
  renderItems();
  calculateAndPopulatePreview();
  saveDraft();
}

function deleteLineItem(id) {
  invoiceData.items = invoiceData.items.filter(item => item.id !== id);
  renderItems();
  calculateAndPopulatePreview();
  saveDraft();
}

function moveItem(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= invoiceData.items.length) return;
  
  // Swap items
  const temp = invoiceData.items[index];
  invoiceData.items[index] = invoiceData.items[targetIndex];
  invoiceData.items[targetIndex] = temp;
  
  renderItems();
  calculateAndPopulatePreview();
  saveDraft();
}

function updateItemField(id, field, value) {
  const item = invoiceData.items.find(item => item.id === id);
  if (item) {
    item[field] = value;
    calculateAndPopulatePreview();
    saveDraft();
  }
}

// Logo Handlers
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file.', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function() {
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
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const resizedBase64 = canvas.toDataURL(file.type);
      invoiceData.logoBase64 = resizedBase64;
      
      doc.logoPreviewImg.src = resizedBase64;
      doc.logoPlaceholder.style.display = 'none';
      doc.logoPreviewBox.style.display = 'block';
      
      calculateAndPopulatePreview();
      saveDraft();
      showToast('Logo uploaded successfully!', 'success');
    };
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  invoiceData.logoBase64 = '';
  doc.senderLogo.value = '';
  doc.logoPlaceholder.style.display = 'flex';
  doc.logoPreviewBox.style.display = 'none';
  calculateAndPopulatePreview();
  saveDraft();
  showToast('Logo removed.', 'info');
}

// QR Code Image Handlers
function handleQrUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file.', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.src = event.target.result;
    img.onload = function() {
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
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const resizedBase64 = canvas.toDataURL(file.type);
      invoiceData.qrBase64 = resizedBase64;
      
      doc.qrPreviewImg.src = resizedBase64;
      doc.qrPlaceholder.style.display = 'none';
      doc.qrPreviewBox.style.display = 'block';
      
      calculateAndPopulatePreview();
      saveDraft();
      showToast('Payment QR Code uploaded!', 'success');
    };
  };
  reader.readAsDataURL(file);
}

function removeQr() {
  invoiceData.qrBase64 = '';
  doc.qrCodeFile.value = '';
  doc.qrPlaceholder.style.display = 'flex';
  doc.qrPreviewBox.style.display = 'none';
  calculateAndPopulatePreview();
  saveDraft();
  showToast('Payment QR Code removed.', 'info');
}

// Linkify plain-text URLs safely into anchors
function linkify(text) {
  if (!text) return '';
  const escaped = escapeHtml(text);
  
  // Regular expressions to find URLs
  const urlPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  const wwwPattern = /(^|[^\/])(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  
  let formatted = escaped.replace(urlPattern, '<a href="$1" target="_blank" style="color: #4f46e5; text-decoration: underline;">$1</a>');
  formatted = formatted.replace(wwwPattern, '$1<a href="https://$2" target="_blank" style="color: #4f46e5; text-decoration: underline;">$2</a>');
  
  return formatted;
}

// Calculations and Preview populator
function calculateAndPopulatePreview() {
  const symbol = invoiceData.currencySymbol;
  
  // Helper to check if a field is enabled
  function isFieldEnabled(field) {
    if (!invoiceData.disabledFields) return true;
    return !invoiceData.disabledFields[field];
  }
  
  // 1. Sync header / basic meta
  const isInvoiceNumEnabled = isFieldEnabled('invoiceNumber');
  doc.previewInvoiceNumber.textContent = invoiceData.number || 'DRAFT';
  doc.previewInvoiceNumber.style.display = isInvoiceNumEnabled ? '' : 'none';
  
  const isIssueDateEnabled = isFieldEnabled('issueDate');
  const lblIssueDate = document.getElementById('lbl-issue-date');
  if (lblIssueDate) lblIssueDate.style.display = isIssueDateEnabled ? '' : 'none';
  doc.previewIssueDate.style.display = isIssueDateEnabled ? '' : 'none';
  doc.previewIssueDate.textContent = invoiceData.issueDate || 'YYYY-MM-DD';
  
  const isDueDateEnabled = isFieldEnabled('dueDate');
  const lblDueDate = document.getElementById('lbl-due-date');
  if (lblDueDate) lblDueDate.style.display = isDueDateEnabled ? '' : 'none';
  doc.previewDueDate.style.display = isDueDateEnabled ? '' : 'none';
  doc.previewDueDate.textContent = invoiceData.dueDate || 'YYYY-MM-DD';
  
  const isTermsEnabled = isFieldEnabled('paymentTerms');
  const lblTerms = document.getElementById('lbl-payment-terms');
  if (lblTerms) lblTerms.style.display = isTermsEnabled ? '' : 'none';
  doc.previewPaymentTerms.style.display = isTermsEnabled ? '' : 'none';
  doc.previewPaymentTerms.textContent = invoiceData.terms || 'Due on receipt';

  if (!invoiceData.settings) {
    invoiceData.settings = {};
  }
  const headerPosition = invoiceData.settings.headerPosition || 'right';
  const titleArea = document.querySelector('.invoice-title-area');
  const header = document.querySelector('.invoice-preview-header');
  if (titleArea && header) {
    if (headerPosition === 'left') {
      header.style.flexDirection = 'row-reverse';
      titleArea.style.marginLeft = '0';
      titleArea.style.marginRight = 'auto';
      titleArea.style.textAlign = 'left';
      const meta = document.querySelector('.invoice-preview-meta');
      if (meta) meta.style.textAlign = 'left';
    } else {
      header.style.flexDirection = 'row';
      titleArea.style.marginLeft = 'auto';
      titleArea.style.marginRight = '0';
      titleArea.style.textAlign = 'right';
      const meta = document.querySelector('.invoice-preview-meta');
      if (meta) meta.style.textAlign = 'right';
    }
  }
  
  // Logo
  if (invoiceData.showLogo && invoiceData.logoBase64) {
    doc.previewLogoContainer.style.display = 'block';
    doc.previewLogoContainer.innerHTML = `<img src="${invoiceData.logoBase64}" alt="Company Logo">`;
  } else {
    doc.previewLogoContainer.style.display = 'none';
    doc.previewLogoContainer.innerHTML = '';
  }
  
  // QR image
  if (invoiceData.showQr && invoiceData.qrBase64) {
    doc.previewQrImg.src = invoiceData.qrBase64;
    doc.previewQrContainer.style.display = 'flex';
  } else {
    doc.previewQrContainer.style.display = 'none';
  }
  
  // Addresses
  const isAnySenderFieldEnabled = isFieldEnabled('senderName') || isFieldEnabled('senderEmail') || isFieldEnabled('senderPhone') || isFieldEnabled('senderAddress');
  let senderHtml = '';
  if (isFieldEnabled('senderName')) {
    senderHtml += `<strong>${escapeHtml(invoiceData.senderName || 'Your Business Name')}</strong><br>`;
  }
  let contactInfo = [];
  if (isFieldEnabled('senderEmail') && invoiceData.senderEmail) {
    contactInfo.push(escapeHtml(invoiceData.senderEmail));
  }
  if (isFieldEnabled('senderPhone') && invoiceData.senderPhone) {
    contactInfo.push(escapeHtml(invoiceData.senderPhone));
  }
  if (contactInfo.length > 0) {
    senderHtml += contactInfo.join(' | ') + '<br>';
  }
  if (isFieldEnabled('senderAddress') && invoiceData.senderAddress) {
    senderHtml += escapeHtml(invoiceData.senderAddress).replace(/\n/g, '<br>');
  }
  doc.previewSenderDetails.innerHTML = senderHtml;
  const senderBlock = doc.previewSenderDetails.parentElement;
  if (senderBlock) {
    senderBlock.style.display = isAnySenderFieldEnabled ? '' : 'none';
  }
  
  const isAnyClientFieldEnabled = isFieldEnabled('clientName') || isFieldEnabled('clientEmail') || isFieldEnabled('clientPhone') || isFieldEnabled('clientAddress');
  let clientHtml = '';
  if (isFieldEnabled('clientName') && invoiceData.clientName) {
    clientHtml += `<strong>${escapeHtml(invoiceData.clientName)}</strong><br>`;
  }
  let clientContact = [];
  if (isFieldEnabled('clientEmail') && invoiceData.clientEmail) {
    clientContact.push(escapeHtml(invoiceData.clientEmail));
  }
  if (isFieldEnabled('clientPhone') && invoiceData.clientPhone) {
    clientContact.push(escapeHtml(invoiceData.clientPhone));
  }
  if (clientContact.length > 0) {
    clientHtml += clientContact.join(' | ') + '<br>';
  }
  if (isFieldEnabled('clientAddress') && invoiceData.clientAddress) {
    clientHtml += escapeHtml(invoiceData.clientAddress).replace(/\n/g, '<br>');
  }
  if (clientHtml) {
    doc.previewClientDetails.innerHTML = clientHtml;
  } else {
    doc.previewClientDetails.innerHTML = `<em style="color: var(--text-invoice-muted);">No client details provided yet.</em>`;
  }
  const clientBlock = doc.previewClientDetails.parentElement;
  if (clientBlock) {
    clientBlock.style.display = isAnyClientFieldEnabled ? '' : 'none';
  }
  
  const addressesContainer = document.querySelector('.invoice-preview-addresses');
  if (addressesContainer) {
    addressesContainer.style.display = (isAnySenderFieldEnabled || isAnyClientFieldEnabled) ? 'grid' : 'none';
  }

  // Apply Sender and Client alignment and order settings
  const senderAlign = invoiceData.settings.senderAlign || 'left';
  doc.previewSenderDetails.style.textAlign = senderAlign;
  const senderTitle = doc.previewSenderDetails.previousElementSibling;
  if (senderTitle) senderTitle.style.textAlign = senderAlign;

  const clientAlign = invoiceData.settings.clientAlign || 'left';
  doc.previewClientDetails.style.textAlign = clientAlign;
  const clientTitle = doc.previewClientDetails.previousElementSibling;
  if (clientTitle) clientTitle.style.textAlign = clientAlign;

  const addressOrder = invoiceData.settings.addressOrder || 'normal';
  if (senderBlock && clientBlock) {
    if (addressOrder === 'reverse') {
      senderBlock.style.gridColumn = '2';
      clientBlock.style.gridColumn = '1';
    } else {
      senderBlock.style.gridColumn = '1';
      clientBlock.style.gridColumn = '2';
    }
  }
  
  // Show/Hide headers in preview
  const showQty = invoiceData.showQty !== undefined ? invoiceData.showQty : true;
  const showRate = invoiceData.showRate !== undefined ? invoiceData.showRate : true;
  
  const thQty = document.getElementById('th-qty');
  const thRate = document.getElementById('th-rate');
  const thTax = document.getElementById('th-tax');
  const thDiscount = document.getElementById('th-discount');
  
  if (thQty) thQty.style.display = showQty ? '' : 'none';
  if (thRate) thRate.style.display = showRate ? '' : 'none';
  if (thTax) thTax.style.display = invoiceData.showTax ? '' : 'none';
  if (thDiscount) thDiscount.style.display = invoiceData.showDiscount ? '' : 'none';
  
  // 2. Render and Calculate Items
  doc.previewTableBody.innerHTML = '';
  let subtotal = 0;
  let itemsDiscountTotal = 0;
  let itemsTaxTotal = 0;
  
  invoiceData.items.forEach(item => {
    const qty = showQty ? (item.quantity || 0) : 1;
    const price = item.price || 0;
    const baseTotal = qty * price;
    
    // Line-level discount
    const discountPercentage = invoiceData.showDiscount ? (item.discount || 0) : 0;
    const discountAmount = baseTotal * (discountPercentage / 100);
    const itemTotal = baseTotal - discountAmount;
    
    // Item-level tax calculations (if any) on net total
    const taxRate = invoiceData.showTax ? (item.tax || 0) : 0;
    const taxAmount = itemTotal * (taxRate / 100);
    
    subtotal += baseTotal;
    itemsDiscountTotal += discountAmount;
    itemsTaxTotal += taxAmount;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${linkify(item.description || 'Untitled Item')}</strong></td>
      <td class="text-right" style="${showQty ? '' : 'display: none;'}">${formatQty(item.quantity || 0)}</td>
      <td class="text-right" style="${showRate ? '' : 'display: none;'}">${formatCurrency(item.price || 0, symbol)}</td>
      <td class="text-right" style="${invoiceData.showTax ? '' : 'display: none;'}">${taxRate > 0 ? taxRate + '%' : '-'}</td>
      <td class="text-right" style="${invoiceData.showDiscount ? '' : 'display: none;'}">${discountPercentage > 0 ? discountPercentage + '%' : '-'}</td>
      <td class="text-right">${formatCurrency(itemTotal, symbol)}</td>
    `;
    doc.previewTableBody.appendChild(tr);
  });
  
  if (invoiceData.items.length === 0) {
    doc.previewTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-invoice-muted);">No items added.</td></tr>`;
  }
  
  // 3. Global Adjustments calculations
  let runningSubtotal = subtotal - itemsDiscountTotal;
  
  // Global Discount
  let globalDiscountAmount = 0;
  if (invoiceData.showDiscount && invoiceData.discountPercentage > 0) {
    globalDiscountAmount = runningSubtotal * (invoiceData.discountPercentage / 100);
    runningSubtotal -= globalDiscountAmount;
  }
  const totalDiscountCombined = globalDiscountAmount + itemsDiscountTotal;
  
  // Global Tax
  let globalTaxAmount = 0;
  if (invoiceData.showTax && invoiceData.taxPercentage > 0) {
    globalTaxAmount = runningSubtotal * (invoiceData.taxPercentage / 100);
  }
  const totalTaxCombined = globalTaxAmount + itemsTaxTotal;
  
  const shipping = invoiceData.showShipping ? invoiceData.shippingCost : 0;
  const grandTotal = runningSubtotal + totalTaxCombined + shipping;
  
  // Populate summaries
  doc.previewSubtotal.textContent = formatCurrency(subtotal, symbol);
  
  // Discount row
  if (invoiceData.showDiscount && totalDiscountCombined > 0) {
    doc.previewRowDiscount.style.display = 'grid';
    let discountLabel = 'Discount';
    if (invoiceData.discountPercentage > 0 && itemsDiscountTotal > 0) {
      discountLabel = `Discount (${invoiceData.discountPercentage}% + Item Disc)`;
    } else if (invoiceData.discountPercentage > 0) {
      discountLabel = `Discount (${invoiceData.discountPercentage}%)`;
    } else {
      discountLabel = 'Item Discount';
    }
    doc.previewDiscountLabel.textContent = discountLabel;
    doc.previewDiscount.textContent = `-${formatCurrency(totalDiscountCombined, symbol)}`;
  } else {
    doc.previewRowDiscount.style.display = 'none';
  }
  
  // Tax row
  if (invoiceData.showTax && totalTaxCombined > 0) {
    doc.previewRowTax.style.display = 'grid';
    let taxLabel = 'Tax';
    if (invoiceData.taxPercentage > 0 && itemsTaxTotal > 0) {
      taxLabel = `Tax (${invoiceData.taxPercentage}% + Item Tax)`;
    } else if (invoiceData.taxPercentage > 0) {
      taxLabel = `Tax (${invoiceData.taxPercentage}%)`;
    } else {
      taxLabel = 'Item Tax';
    }
    doc.previewTaxLabel.textContent = taxLabel;
    doc.previewTax.textContent = formatCurrency(totalTaxCombined, symbol);
  } else {
    doc.previewRowTax.style.display = 'none';
  }
  
  // Shipping row
  if (invoiceData.showShipping && shipping > 0) {
    doc.previewRowShipping.style.display = 'grid';
    doc.previewShipping.textContent = formatCurrency(shipping, symbol);
  } else {
    doc.previewRowShipping.style.display = 'none';
  }
  
  doc.previewTotal.textContent = formatCurrency(grandTotal, symbol);
  
  // Linkified Footers with visibility support
  const notesWrapperBlock = doc.previewNotes.parentElement;
  if (notesWrapperBlock) notesWrapperBlock.style.display = invoiceData.showNotes ? '' : 'none';
  doc.previewNotes.innerHTML = linkify(invoiceData.notes || '').replace(/\n/g, '<br>');
  
  const paymentWrapperBlock = doc.previewPaymentInfo.parentElement;
  if (paymentWrapperBlock) paymentWrapperBlock.style.display = invoiceData.showPayment ? '' : 'none';
  doc.previewPaymentInfo.innerHTML = linkify(invoiceData.paymentInstructions || '').replace(/\n/g, '<br>');
  
  // Apply Notes and Payment layout settings
  const notesPosition = invoiceData.settings.notesPosition || 'left';
  const paymentContainer = doc.previewPaymentInfo.parentElement.parentElement;
  if (notesWrapperBlock && paymentContainer) {
    if (notesPosition === 'right') {
      notesWrapperBlock.style.gridColumn = '2';
      paymentContainer.style.gridColumn = '1';
      paymentContainer.style.justifyContent = 'flex-start';
    } else {
      notesWrapperBlock.style.gridColumn = '1';
      paymentContainer.style.gridColumn = '2';
      paymentContainer.style.justifyContent = 'flex-end';
    }
  }
  
  const notesAlign = invoiceData.settings.notesAlign || 'left';
  doc.previewNotes.style.textAlign = notesAlign;
  const notesTitle = doc.previewNotes.previousElementSibling;
  if (notesTitle) notesTitle.style.textAlign = notesAlign;
  
  const paymentAlign = invoiceData.settings.paymentAlign || 'right';
  doc.previewPaymentInfo.style.textAlign = paymentAlign;
  const paymentTitle = doc.previewPaymentInfo.previousElementSibling;
  if (paymentTitle) paymentTitle.style.textAlign = paymentAlign;
  
  const footerContainer = document.querySelector('.invoice-preview-footer');
  if (footerContainer) {
    const hasQr = invoiceData.showQr && invoiceData.qrBase64;
    footerContainer.style.display = (invoiceData.showNotes || invoiceData.showPayment || hasQr) ? 'grid' : 'none';
  }
  
  // 4. Update the visual page-break guides and responsive scaling
  setTimeout(() => {
    updatePageBreakGuides();
    scaleInvoicePreview();
  }, 50);
}

// Draw dotted guides in preview showing A4 page breaks
function updatePageBreakGuides() {
  // Remove existing lines
  const existingGuides = document.querySelectorAll('.page-break-guide');
  existingGuides.forEach(g => g.remove());
  
  const preview = document.getElementById('invoice-preview');
  if (!preview) return;
  
  const height = preview.scrollHeight;
  // A4 printable height at 800px width is 1130px
  const pageHeight = 1130; 
  
  if (height > pageHeight) {
    const pagesCount = Math.ceil(height / pageHeight);
    for (let i = 1; i < pagesCount; i++) {
      const guide = document.createElement('div');
      guide.className = 'page-break-guide';
      guide.style.top = (i * pageHeight) + 'px';
      
      const badge = document.createElement('span');
      badge.textContent = `Page ${i} / Page ${i + 1} Split`;
      guide.appendChild(badge);
      
      preview.appendChild(guide);
    }
  }
}

// Scale A4 invoice preview dynamically to fit container width (responsiveness)
function scaleInvoicePreview() {
  const wrapper = document.getElementById('invoice-scale-wrapper');
  const preview = document.getElementById('invoice-preview');
  if (!wrapper || !preview) return;
  
  // Reset styles to calculate original height
  wrapper.style.height = 'auto';
  preview.style.transform = 'none';
  preview.style.marginLeft = '0';
  
  const containerWidth = wrapper.clientWidth;
  const targetWidth = 800; // Fixed width of paper
  
  if (containerWidth < targetWidth && containerWidth > 0) {
    const scale = containerWidth / targetWidth;
    preview.style.transformOrigin = 'top left';
    preview.style.transform = `scale(${scale})`;
    
    // Center alignment
    const leftMargin = (containerWidth - (targetWidth * scale)) / 2;
    preview.style.marginLeft = `${leftMargin}px`;
    
    // Adjust wrapper height to cover scaled area
    const originalHeight = preview.offsetHeight;
    wrapper.style.height = `${originalHeight * scale}px`;
  } else {
    preview.style.transform = 'none';
    preview.style.marginLeft = 'auto';
    preview.style.marginRight = 'auto';
    wrapper.style.height = 'auto';
  }
}

// Parse text input strings safely to extract numbers supporting various thousand/decimal notations
function parseFormattedNumber(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  
  // Clean up currency symbols and whitespace
  let clean = str.toString().replace(/[Rp$\s]/g, '');
  
  const lastDot = clean.lastIndexOf('.');
  const lastComma = clean.lastIndexOf(',');
  
  if (lastComma > lastDot) {
    // Comma is decimal separator (European/Indonesian style) e.g., 5.000,50 -> 5000.50
    clean = clean.replace(/\./g, '').replace(/,/g, '.');
  } else {
    // Dot is decimal separator (US/International style) e.g., 5,000.50 -> 5000.50
    clean = clean.replace(/,/g, '');
  }
  
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

// Formatting helpers
function formatCurrency(amount, symbol) {
  if (symbol === 'Rp' || symbol === 'IDR') {
    // Indonesian format: dot thousands separators, rounded to integers unless there are cents
    const integerPart = Math.floor(amount);
    const decimalPart = Math.round((amount - integerPart) * 100);
    const formattedInt = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    if (decimalPart === 0) {
      return 'Rp ' + formattedInt;
    } else {
      const formattedDec = decimalPart < 10 ? '0' + decimalPart : decimalPart;
      return 'Rp ' + formattedInt + ',' + formattedDec;
    }
  }
  
  // Default format
  return symbol + ' ' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatQty(qty) {
  if (Number.isInteger(qty)) return qty.toString();
  return qty.toFixed(2);
}

// Local Caching Draft Management
function saveDraft() {
  localStorage.setItem('invoicefly_draft_data', JSON.stringify(invoiceData));
}

function loadDraft() {
  const cached = localStorage.getItem('invoicefly_draft_data');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        invoiceData = { ...invoiceData, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to parse cached invoice draft data:", e);
    }
  }
}

// Generate unique string for item keys
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Theme Handler
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('invoicefly_theme', newTheme);
  
  const icon = doc.themeToggleBtn.querySelector('i');
  if (newTheme === 'light') {
    icon.setAttribute('data-lucide', 'moon');
  } else {
    icon.setAttribute('data-lucide', 'sun');
  }
  lucide.createIcons();
}

// Load theme on startup
(function loadTheme() {
  const savedTheme = localStorage.getItem('invoicefly_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    window.addEventListener('DOMContentLoaded', () => {
      const icon = doc.themeToggleBtn.querySelector('i');
      if (savedTheme === 'light') {
        icon.setAttribute('data-lucide', 'moon');
        lucide.createIcons();
      }
    });
  }
})();

// Toast Notifications
function showToast(message, type = 'info') {
  doc.toastMessage.textContent = message;
  doc.toast.className = 'toast active';
  doc.toast.classList.add(`toast-${type}`);
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'error') iconName = 'alert-triangle';
  
  doc.toastIcon.setAttribute('data-lucide', iconName);
  lucide.createIcons();
  
  setTimeout(() => {
    doc.toast.classList.remove('active');
  }, 4000);
}

// PDF Export Action (Optimized for pixel-perfect single A4 rendering using layout overrides)
function downloadPdfAction() {
  showToast('Generating PDF file...', 'info');
  
  // Set printing class to expand document to natural 800px width on screen
  document.body.classList.add('is-printing');
  
  // Wait a small frame for the DOM layout to update
  setTimeout(() => {
    const element = document.getElementById('invoice-preview');
    const filename = `Invoice_${invoiceData.number || 'Draft'}.pdf`;
    
    const opt = {
      margin: 0, // No margins inside html2pdf since padding serves as borders
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false, scrollY: 0, scrollX: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(element).save()
      .then(() => {
        showToast('PDF downloaded successfully!', 'success');
        document.body.classList.remove('is-printing');
        scaleInvoicePreview();
      })
      .catch((err) => {
        console.error('PDF Generation error:', err);
        showToast('Failed to download PDF.', 'error');
        document.body.classList.remove('is-printing');
        scaleInvoicePreview();
      });
  }, 150);
}

// Dynamically hide/show cards and inputs in the editor panel based on visibility options
function toggleEditorFieldsVisibility() {
  const logoWrapper = document.getElementById('group-sender-logo');
  if (logoWrapper) logoWrapper.style.display = invoiceData.showLogo ? 'flex' : 'none';
  
  const qrWrapper = document.getElementById('group-qr-code');
  if (qrWrapper) qrWrapper.style.display = invoiceData.showQr ? 'flex' : 'none';
  
  const discountWrapper = document.getElementById('group-discount-percentage');
  if (discountWrapper) discountWrapper.style.display = invoiceData.showDiscount ? 'flex' : 'none';
  
  const taxWrapper = document.getElementById('group-tax-percentage');
  if (taxWrapper) taxWrapper.style.display = invoiceData.showTax ? 'flex' : 'none';
  
  const shippingWrapper = document.getElementById('group-shipping-cost');
  if (shippingWrapper) shippingWrapper.style.display = invoiceData.showShipping ? 'flex' : 'none';
  
  const paymentWrapper = document.getElementById('group-payment-instructions');
  if (paymentWrapper) paymentWrapper.style.display = invoiceData.showPayment ? 'flex' : 'none';
  
  const notesWrapper = document.getElementById('group-invoice-notes');
  if (notesWrapper) notesWrapper.style.display = invoiceData.showNotes ? 'flex' : 'none';
}

// Toggle state of a field (enabled vs disabled)
function toggleFieldState(field) {
  const globalSettings = ['showLogo', 'showQr', 'showTax', 'showDiscount', 'showShipping', 'showPayment', 'showNotes'];
  if (globalSettings.includes(field)) {
    invoiceData[field] = !invoiceData[field];
    const chk = document.getElementById('show-' + field.replace('show', '').toLowerCase());
    if (chk) chk.checked = invoiceData[field];
    toggleEditorFieldsVisibility();
    renderItems();
  } else {
    if (!invoiceData.disabledFields) {
      invoiceData.disabledFields = {};
    }
    invoiceData.disabledFields[field] = !invoiceData.disabledFields[field];
  }
  
  updateFieldUIVisibility(field);
  calculateAndPopulatePreview();
  saveDraft();
}

// Update UI display for field toggles
function updateFieldUIVisibility(field) {
  const fieldMapping = {
    invoiceNumber: { group: 'group-invoice-number', input: 'invoice-number' },
    issueDate: { group: 'group-issue-date', input: 'issue-date' },
    dueDate: { group: 'group-due-date', input: 'due-date' },
    paymentTerms: { group: 'group-payment-terms', input: 'payment-terms' },
    senderName: { group: 'group-sender-name', input: 'sender-name' },
    senderEmail: { group: 'group-sender-email', input: 'sender-email' },
    senderPhone: { group: 'group-sender-phone', input: 'sender-phone' },
    senderAddress: { group: 'group-sender-address', input: 'sender-address' },
    clientName: { group: 'group-client-name', input: 'client-name' },
    clientEmail: { group: 'group-client-email', input: 'client-email' },
    clientPhone: { group: 'group-client-phone', input: 'client-phone' },
    clientAddress: { group: 'group-client-address', input: 'client-address' },
    
    // Globals mapped to inputs
    showLogo: { group: 'group-sender-logo', input: 'sender-logo', isGlobal: true },
    showQr: { group: 'group-qr-code', input: 'qr-code-file', isGlobal: true },
    showDiscount: { group: 'group-discount-percentage', input: 'discount-percentage', isGlobal: true },
    showTax: { group: 'group-tax-percentage', input: 'tax-percentage', isGlobal: true },
    showShipping: { group: 'group-shipping-cost', input: 'shipping-cost', isGlobal: true },
    showNotes: { group: 'group-invoice-notes', input: 'invoice-notes', isGlobal: true },
    showPayment: { group: 'group-payment-instructions', input: 'payment-instructions', isGlobal: true }
  };
  
  const config = fieldMapping[field];
  if (!config) return;
  
  const groupEl = document.getElementById(config.group);
  const inputEl = document.getElementById(config.input);
  if (!groupEl) return;
  
  const isEnabled = config.isGlobal ? invoiceData[field] : !(invoiceData.disabledFields && invoiceData.disabledFields[field]);
  
  if (isEnabled) {
    groupEl.classList.remove('is-disabled');
  } else {
    groupEl.classList.add('is-disabled');
  }
  
  if (inputEl) {
    inputEl.disabled = !isEnabled;
  }
  
  const btn = groupEl.querySelector('.field-toggle-btn');
  if (btn) {
    btn.innerHTML = `<i data-lucide="${isEnabled ? 'eye' : 'eye-off'}"></i>`;
    lucide.createIcons();
  }
}
