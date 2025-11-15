// ========================================
// 🛡️ TINYMCE HELPERS - TEMPLATE PROCESSING
// ========================================

/**
 * Process HTML content to add proper editable zones and protect placeholders
 * @param {string} htmlContent - Raw HTML content from backend
 * @returns {string} - Processed HTML with editable zones
 */
export const processContentForEditing = (htmlContent) => {
  if (!htmlContent) return '';
  
  let processedContent = htmlContent;
  
  // 🛡️ 1. Mark structural elements as non-editable
  processedContent = processedContent
    // Tables structure is protected, but cells are editable

    
    // 📝 2. Table cells ARE editable (but protect placeholders inside)
    .replace(/<td([^>]*)>/g, '<td$1 data-mce-contenteditable="true" class="editable-cell">')
    .replace(/<th([^>]*)>/g, '<th$1 data-mce-contenteditable="true" class="editable-cell">')
    
    // 🚫 3. Meta blocks, signatures, headers are completely non-editable
    .replace(/<div([^>]*class="[^"]*meta-block[^"]*"[^>]*)>/g, '<div$1 data-mce-contenteditable="false" class="protected-block">')
    .replace(/<div([^>]*class="[^"]*sign-block[^"]*"[^>]*)>/g, '<div$1 data-mce-contenteditable="false" class="protected-block">')
    .replace(/<div([^>]*class="[^"]*non-editable-header[^"]*"[^>]*)>/g, '<div$1 data-mce-contenteditable="false" class="protected-block">')
    
    // 🎯 4. Wrap standalone paragraphs in editable zones
 
  
  return processedContent;
};

/**
 * Clean up the content when saving (remove TinyMCE specific attributes)
 * @param {string} content - Content from TinyMCE editor
 * @returns {string} - Clean HTML for backend storage
 */
export const cleanContentForSaving = (content) => {
  if (!content) return '';
  
  return content
    // Remove TinyMCE specific attributes
    .replace(/\s*data-mce-contenteditable="[^"]*"/g, '')
    .replace(/\s*class="editable-cell"/g, '')
    .replace(/\s*class="editable-paragraph"/g, '')
    .replace(/\s*class="protected-block"/g, '')
    .replace(/\s*contenteditable="[^"]*"/g, '')
    
    // Remove placeholder highlighting spans but keep content
    .replace(/<span[^>]*class="[^"]*placeholder-highlight[^"]*"[^>]*>(.*?)<\/span>/g, '$1')
    
    // Clean up any extra spaces
    .replace(/\s+>/g, '>')
    .replace(/>\s+</g, '><');
};

/**
 * Highlight placeholders in content for better visual feedback
 * @param {string} content - HTML content
 * @returns {string} - Content with highlighted placeholders
 */
export const highlightPlaceholders = (content) => {
  if (!content) return '';
  
  return content.replace(
    /(\{\{[^}]+\}\})/g,
    '<span class="placeholder-highlight" contenteditable="false" data-mce-contenteditable="false">$1</span>'
  );
};

/**
 * Extract placeholders from content
 * @param {string} content - HTML content
 * @returns {Array} - Array of found placeholders
 */
export const extractPlaceholders = (content) => {
  if (!content) return [];
  
  const matches = content.match(/\{\{[^}]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
};

/**
 * Validate content to ensure placeholders are preserved
 * @param {string} originalContent - Original content
 * @param {string} newContent - New content from editor
 * @returns {Object} - Validation result
 */
export const validatePlaceholderIntegrity = (originalContent, newContent) => {
  const originalPlaceholders = extractPlaceholders(originalContent);
  const newPlaceholders = extractPlaceholders(newContent);
  
  const missing = originalPlaceholders.filter(p => !newPlaceholders.includes(p));
  const added = newPlaceholders.filter(p => !originalPlaceholders.includes(p));
  
  return {
    isValid: missing.length === 0,
    missing,
    added,
    originalCount: originalPlaceholders.length,
    newCount: newPlaceholders.length
  };
};

// 🎨 Default TinyMCE configuration for contract templates
export const defaultTinyMCEConfig = {
  height: '100%',
  menubar: false,
  statusbar: false,
  toolbar: 'undo redo | bold italic underline | forecolor backcolor | align | bullist numlist | removeformat',
  
  // ⭐ 1. PROTECT PATTERNS - Bảo vệ chuỗi không được sửa đổi (PRIMARY METHOD)
  protect: [
    /\{\{[^}]+\}\}/g   // bảo toàn {{ ... }} 100%
  ],
  
  // ⭐ 2. SIMPLE PLUGINS - Basic functionality only
  plugins: 'lists',
  license_key: 'gpl',
  // 🛡️ BẢO VỆ CẤU TRÚC HTML
  valid_elements: '*[*]',
  extended_valid_elements: '*[*]',
  verify_html: false,
  schema: 'html5',
  noneditable_regexp: /\{\{[^}]+\}\}/g,

  
  // 🎨 STYLE VÀ HIỂN THỊ
  content_style: `
    body {
      font-family: 'Noto Sans', 'DejaVu Sans', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.45;
      margin: 20px;
      background: #fff;
    }
    
    /* 🔒 PLACEHOLDER STYLES - ĐƯỢC BẢO VỆ */
    .placeholder-highlight,
    .placeholder-protected,
    .placeholder-block {
      background-color: #e6f3ff !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      color: #1890ff !important;
      font-weight: bold !important;
      border: 1px dashed #1890ff !important;
      cursor: pointer !important;
      user-select: none !important;
      display: inline-block !important;
      margin: 0 2px !important;
      position: relative !important;
    }
    
    /* Hiệu ứng hover cho placeholder blocks */
    .placeholder-block:hover {
      background-color: #bae7ff !important;
      border-color: #096dd9 !important;
    }
    
    /* Visual indicator bằng CSS thay vì icon */
    .placeholder-block:before {
      content: "🔒";
      font-size: 10px;
      margin-right: 3px;
    }
    
    .placeholder-block:after {
      content: " [Nhấn Delete để xóa]";
      font-size: 9px;
      color: #666;
      font-weight: normal;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .placeholder-block:hover:after {
      opacity: 1;
    }
    
    /* 🚫 VÙNG KHÔNG ĐƯỢC CHỈNH SỬA */
    [data-mce-contenteditable="false"],
    .protected-block {
      border: 1px dashed #dc3545 !important;
      background-color: #f8d7da !important;
      position: relative !important;
      cursor: not-allowed !important;
    }
    
    [data-mce-contenteditable="false"]:before,
    .protected-block:before {
      content: '🔒 Vùng được bảo vệ';
      position: absolute;
      top: -2px;
      right: -2px;
      background: #dc3545;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 2px;
      z-index: 1000;
    }
    
    /* ✏️ VÙNG ĐƯỢC PHÉP CHỈNH SỬA */
    [data-mce-contenteditable="true"],
    .editable-cell,
    .editable-paragraph {
      border: 1px dashed #28a745 !important;
      background-color: #d4edda !important;
      position: relative !important;
      cursor: text !important;
      min-height: 20px !important;
    }
    
    [data-mce-contenteditable="true"]:hover,
    .editable-cell:hover,
    .editable-paragraph:hover {
      background-color: #c3e6cb !important;
    }
    
    [data-mce-contenteditable="true"]:before,
    .editable-cell:before,
    .editable-paragraph:before {
      content: '✏️ Có thể chỉnh sửa';
      position: absolute;
      top: -2px;
      right: -2px;
      background: #28a745;
      color: white;
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 2px;
      z-index: 1000;
    }
    
    /* 📋 TABLE STYLES */
    .content-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      border: 1px solid #444;
    }
    
    .content-table th,
    .content-table td {
      border: 1px solid #444;
      padding: 6px 8px;
      vertical-align: top;
    }
    
    /* 📄 META BLOCK STYLES */
    .meta-block {
      margin-top: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
    }
    
    /* ✍️ SIGNATURE BLOCK STYLES */
    .sign-block {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      margin-top: 24px;
    }
    
    .sign-block td {
      width: 50%;
      padding: 0 6px;
      vertical-align: bottom;
      text-align: center;
    }
    
    /* 📌 HEADER STYLES */
    .non-editable-header {
      text-align: center;
      margin: 6px 0;
      font-weight: bold;
    }
  `
};