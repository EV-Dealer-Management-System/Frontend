import { useState, useEffect, useRef } from 'react';
import { App } from 'antd';

// Import TinyMCE CSS files
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/content/default/content.css';

// Import TinyMCE core
import tinymce from 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';

// Import plugins - ĐẦY ĐỦ NHƯ TEMPLATE EDITOR
import 'tinymce/plugins/code';
import 'tinymce/plugins/table';
import 'tinymce/plugins/link';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/image';

// 🔥 TinyMCE config DÀNH RIÊNG CHO EVM STAFF - DỰA TRÊN TEMPLATE EDITOR
const evmTinyMCEConfig = {
  license_key: 'gpl',
  height: '100%',
  min_height: 400,
  resize: true,
  menubar: false,
  plugins: [
    'code', 'table', 'link', 'searchreplace', 'lists',
    'autolink', 'charmap', 'preview', 'anchor', 'image',
    'wordcount', 'fullscreen', 'insertdatetime', 'media'
  ],
  external_plugins: {},
  
  // 🎨 TOOLBAR CHO EVM STAFF - FOCUS VÀO TABLE VÀ FORMATTING
  toolbar1: 'undo redo | cut copy | bold italic underline | alignleft aligncenter alignright alignjustify | outdent indent',
  toolbar_mode: 'sliding',
  
  // 🔥 ĐẢM BẢO EDITOR KHÔNG BIỆ READONLY
  readonly: false,
  disabled: false,
  editable_root: true,
  
  // 🔥 BẢO VỆ HTML HOÀN TOÀN - COPY TỪ TEMPLATE EDITOR
  valid_elements: '*[*]',
  extended_valid_elements: '*[*]',
  valid_children: '+*[*]',
  valid_styles: { '*': '*' },
  verify_html: false,
  cleanup: false,
  cleanup_on_startup: false,
  trim: false,
  
  // 🚫 TẮT HTML NORMALIZATION
  forced_root_block: false,
  force_br_newlines: false,
  force_p_newlines: false,
  convert_newlines_to_brs: false,
  remove_linebreaks: false,
  preformatted: true,
  
  // 🚫 TẮT WHITESPACE NORMALIZATION
  indent: false,
  indent_use_margin: false,
  
  // 🔥 RAW MODE
  entities: '',
  convert_urls: false,
  relative_urls: false,
  remove_script_host: false,
  document_base_url: '',
  encoding: 'raw',
  entity_encoding: 'raw',
  element_format: 'html',
  formats: {},
  keep_values: true,
  
  // 🚫 TẮT URL PROCESSING
  urlconverter_callback: function(url, node, on_save) {
    return url;
  },
  
  // 🔥 TẮT DOM MUTATIONS
  custom_elements: '~*',
  object_resizing: false,
  resize_img_proportional: false,
  table_resize_bars: false,
  
  // 🎨 FONT OPTIONS - SIMPLE CHO EVM STAFF
  font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 20pt 24pt',
  
  // 🎨 BLOCK FORMATS
  block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre',
  
  // 🔒 BẢO VỆ PATTERNS QUAN TRỌNG
  protect: [
    /\{\{.*?\}\}/g,                        // Bảo vệ mustache {{variable}}
    /<style[^>]*>[\s\S]*?<\/style>/gi,     // 🔒 BẢO VỆ <style>
    /<head[^>]*>[\s\S]*?<\/head>/gi,       // 🔒 BẢO VỆ <head>
    /<meta[^>]*\/?>/gi                     // 🔒 BẢO VỆ <meta>
  ],
  
  // 🔥 TABLE CONFIG - QUAN TRỌNG CHO HIỂN THỊ BẢNG
  table_default_attributes: {
    border: '1',
    cellpadding: '5',
    cellspacing: '0',
    width: '100%'
  },
  table_default_styles: {
    'border-collapse': 'collapse',
    'border': '1px solid #ccc'
  },
  table_class_list: [
    {title: 'None', value: ''},
    {title: 'Table with borders', value: 'table-bordered'},
    {title: 'Contract table', value: 'contract-table'}
  ],
  table_cell_class_list: [
    {title: 'None', value: ''},
    {title: 'Cell with border', value: 'cell-border'}
  ],
  
  // 🎯 CONTENT STYLES CHO EVM STAFF - BAO GỒM STYLES TỬ HTML GỐC
  content_style: `
    /* Base styles */
    body { 
      font-family: 'Times New Roman', Times, serif; 
      font-size: 13px; 
      line-height: 1.5; 
      margin: 1rem;
      color: #000;
    }
    
    /* Paragraph and text styles */
    p { margin: 6px 0; }
    h1, h2, h3, h4, h5, h6 { margin: 10px 0 6px 0; }
    
    /* Table styles - GIỮNG NHƯ HTML GỐC */
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin: 10px 0;
      font-size: 13px;
    }
    table td, table th { 
      border: 1px solid #000; 
      padding: 6px 8px; 
      text-align: left;
      vertical-align: top;
    }
    table th { 
      background-color: #f0f0f0; 
      font-weight: bold;
      text-align: center;
    }
    
    /* Contract specific styles */
    .contract-table {
      border: 1px solid #000;
      width: 100%;
    }
    .contract-table td, .contract-table th {
      border: 1px solid #000;
      padding: 8px;
    }
    
    /* Text alignment */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    
    /* Common contract elements */
    .signature-block { margin-top: 30px; }
    .header-info { text-align: center; font-weight: bold; }
    .article-title { font-weight: bold; margin: 15px 0 10px 0; }
    
    /* 🚫 ẨN CONTENT-TABLE TRONG EDITOR */
    table.content-table.mce-item-table,
    table.mce-item-table.content-table {
      display: none !important;
      visibility: hidden !important;
    }
  `,
  
  // 🔥 FUNCTION ĐỂ INJECT EXTERNAL STYLES
  content_css_cors: true,
  content_css: false, // Tắt default CSS
  
  // 🔧 SETUP CHO EVM STAFF
  setup: function(editor) {
    console.log('🎯 EVM TinyMCE Editor initialized');
    
    // 🔥 ĐẢM BẢO EDITOR KHÔNG BIỆ READONLY
    editor.on('init', function() {
      editor.mode.set('design'); // Chế độ design thay vì readonly
      console.log('📝 EVM Editor mode set to design - ready for editing');
    });
    
    // Custom command để insert contract table
    editor.addCommand('InsertContractTable', function() {
      const tableHtml = `
        <table class="contract-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid #333; padding: 10px; background-color: #f5f5f5;">STT</th>
              <th style="border: 1px solid #333; padding: 10px; background-color: #f5f5f5;">Tên xe</th>
              <th style="border: 1px solid #333; padding: 10px; background-color: #f5f5f5;">Phiên bản</th>
              <th style="border: 1px solid #333; padding: 10px; background-color: #f5f5f5;">Màu sắc</th>
              <th style="border: 1px solid #333; padding: 10px; background-color: #f5f5f5;">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #333; padding: 10px;">1</td>
              <td style="border: 1px solid #333; padding: 10px;">[Tên xe]</td>
              <td style="border: 1px solid #333; padding: 10px;">[Phiên bản]</td>
              <td style="border: 1px solid #333; padding: 10px;">[Màu sắc]</td>
              <td style="border: 1px solid #333; padding: 10px;">[Số lượng]</td>
            </tr>
          </tbody>
        </table>
      `;
      editor.insertContent(tableHtml);
    });
    
    // Add custom button cho contract table
    editor.ui.registry.addButton('contracttable', {
      text: 'Bảng xe',
      tooltip: 'Chèn bảng chi tiết xe',
      onAction: function() {
        editor.execCommand('InsertContractTable');
      }
    });
  }
};

// 🎯 CUSTOM HOOK CHO EVM TINYMCE EDITOR
export const useEVMTinyEditor = () => {
  const { message } = App.useApp();
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const editorRef = useRef(null);

  // State để lưu các content-table đã tách
  const [hiddenTables, setHiddenTables] = useState([]);

  // 🔥 TÁCH CONTENT-TABLE KHỊI CONTENT HIỂN THỊ
  const extractContentTables = (htmlContent) => {
    if (!htmlContent) return { cleanContent: '', extractedTables: [] };
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Tìm tất cả bảng có class "content-table mce-item-table"
    const contentTables = doc.querySelectorAll('table.content-table.mce-item-table, table.mce-item-table.content-table');
    const extractedTables = [];
    
    contentTables.forEach((table, index) => {
      // Lưu bảng vào mảng
      extractedTables.push({
        id: `content-table-${index}`,
        html: table.outerHTML,
        placeholder: `<!-- HIDDEN_CONTENT_TABLE_${index} -->`
      });
      
      // Thay thế bảng bằng placeholder
      const placeholder = doc.createComment(`HIDDEN_CONTENT_TABLE_${index}`);
      table.parentNode.replaceChild(placeholder, table);
    });
    
    const cleanContent = doc.body.innerHTML;
    
    console.log('🔍 EVM: Extracted', extractedTables.length, 'content-tables from editor');
    
    return { cleanContent, extractedTables };
  };

  // 🔥 GHÉP LẠI CONTENT-TABLE VÀO CONTENT
  const restoreContentTables = (htmlContent, extractedTables) => {
    if (!htmlContent || !extractedTables || extractedTables.length === 0) {
      return htmlContent;
    }
    
    let restoredContent = htmlContent;
    
    extractedTables.forEach((tableData) => {
      // Thay thế placeholder bằng HTML gốc của bảng
      restoredContent = restoredContent.replace(
        tableData.placeholder,
        tableData.html
      );
    });
    
    console.log('🔄 EVM: Restored', extractedTables.length, 'content-tables to content');
    
    return restoredContent;
  };

  // Get current content from editor - VỚI RESTORE CONTENT-TABLES
  const getCurrentContent = () => {
    if (editor && isEditorReady) {
      const editorContent = editor.getContent();
      // Ghép lại các content-table đã ẩn
      return restoreContentTables(editorContent, hiddenTables);
    }
    return '';
  };

  // Set content to editor với styles injection - AN TOÀN + TÁCH CONTENT-TABLE
  const setEditorContent = (content, externalStyles = '') => {
    if (!editor || !isEditorReady) {
      console.warn('🚨 EVM: Editor not ready, skipping setContent');
      return;
    }
    
    try {
      // 🔥 TÁCH CONTENT-TABLE TRƯỚC KHI HIỂN THỊ
      const { cleanContent, extractedTables } = extractContentTables(content);
      setHiddenTables(extractedTables);
      
      console.log('📝 Setting EVM editor content:', cleanContent?.length || 0, 'chars');
      console.log('🔍 Hidden', extractedTables.length, 'content-tables from editor view');
      
      // 🔥 INJECT EXTERNAL STYLES VÀO EDITOR - VỚI SAFETY CHECK
      if (externalStyles && externalStyles.trim()) {
        const iframe = editor.getDoc();
        
        // 🚨 SAFETY CHECK - đảm bảo iframe và head tồn tại
        if (iframe && iframe.head) {
          const head = iframe.head;
          
          // Remove old injected styles
          const oldStyles = head.querySelectorAll('#evm-injected-styles');
          oldStyles.forEach(style => style.remove());
          
          // Add new styles
          const styleElement = iframe.createElement('style');
          styleElement.id = 'evm-injected-styles';
          styleElement.textContent = externalStyles;
          head.appendChild(styleElement);
          
          console.log('🎨 EVM: Injected external styles into editor');
        } else {
          console.warn('🚨 EVM: iframe or head not available, skipping style injection');
        }
      }
      
      // 🔥 SET CONTENT VỚI SAFETY CHECK - SỪD DỤNG CLEAN CONTENT
      editor.setContent(cleanContent || '');
      
      // 🔥 ĐẢM BẢO EDITOR KHÔNG BỊ READONLY - VỚI TRY-CATCH
      try {        if (editor.mode && typeof editor.mode.set === 'function') {
          editor.mode.set('design');
        }
      } catch (e) {
        console.warn('🚨 EVM: Could not set editor mode:', e.message);
      }
      
    } catch (error) {
      console.error('🚨 EVM: Error in setEditorContent:', error);
    }
  };

  // Reset editor content - AN TOÀN + RESET HIDDEN TABLES
  const resetEditorContent = () => {
    if (!editor || !isEditorReady) {
      console.warn('🚨 EVM: Editor not ready, skipping reset');
      return;
    }
    
    try {
      console.log('🔄 Resetting EVM editor content');
      editor.setContent('');
      setHiddenTables([]); // Reset hidden tables
    } catch (error) {
      console.error('🚨 EVM: Error resetting editor content:', error);
    }
  };

  // Handle editor initialization
  const handleEditorInit = (evt, editorInstance) => {
    console.log('🎯 EVM TinyMCE Editor ready');
    setEditor(editorInstance);
    setIsEditorReady(true);
    editorRef.current = editorInstance;
    
    // 🔥 ĐẢM BẢO EDITOR CÓ THỂ EDIT ĐƯỢC
    setTimeout(() => {
      if (editorInstance && editorInstance.mode) {
        editorInstance.mode.set('design');
        console.log('✅ EVM Editor set to design mode - ready for editing');
      }
    }, 100);
  };

  // Custom editor change handler
  const handleEditorChange = (content, editor) => {
    // Return content để component parent xử lý
    return content;
  };

  // 🔄 CLEANUP FUNCTION - KHÔNG GÂY LOOP + RESET HIDDEN TABLES
  const cleanupEditor = () => {
    console.log('🧧 EVM: Cleaning up editor');
    setEditor(null);
    setIsEditorReady(false);
    editorRef.current = null;
    setHiddenTables([]); // Reset hidden tables
  };

  return {
    editor,
    isEditorReady,
    tinyMCEConfig: evmTinyMCEConfig,
    getCurrentContent,
    setEditorContent,
    resetEditorContent,
    handleEditorInit,
    handleEditorChange,
    cleanupEditor,
    editorRef,
    hiddenTables, // Expose hidden tables for debugging
    extractContentTables,
    restoreContentTables
  };
};

export default useEVMTinyEditor;