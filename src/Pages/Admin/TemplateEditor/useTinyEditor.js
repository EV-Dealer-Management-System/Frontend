import { useEffect, useRef, useState } from 'react';
import { App } from 'antd';

// ✅ Import TinyMCE core & plugins local để dùng bản self-hosted (không cần key)
import tinymce from 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/models/dom';

// ✅ Import các plugin bạn đã cấu hình trong tinyMCEConfig
import 'tinymce/plugins/code';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/wordcount';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/autoresize';

// ✅ Cấu hình TinyMCE cho TemplateEditor - đơn giản hóa và focus vào template editing
const tinyMCEConfig = {
  license_key: 'gpl',
  height: '100%',
  min_height: 400,
  resize: true,
  menubar: false,
  plugins: [
    'code', 'table', 'lists', 'link', 'searchreplace',
    'autolink', 'charmap', 'preview', 'anchor', 'visualblocks', 
    'wordcount', 'fullscreen'
  ],
  toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright | ' +
    'bullist numlist | table | removeformat | code | fullscreen | wordcount',
  
  // ✅ Cấu hình quan trọng để giữ nguyên HTML từ BE
  valid_elements: '*[*]',           // Cho phép tất cả elements với tất cả attributes
  extended_valid_elements: '*[*]',  // Mở rộng validation cho custom elements  
  valid_styles: { 
    '*': 'color,font-size,font-family,background,background-color,text-align,margin,padding,border,width,height,line-height,text-decoration,font-weight,display,position,top,left,right,bottom,z-index,opacity,border-radius,box-shadow,float,clear,overflow,white-space'
  },
  verify_html: false,               // Không verify HTML - giữ nguyên như từ BE
  forced_root_block: '',            // Không force P tag wrapper
  entity_encoding: 'raw',           // Không encode entities
  convert_urls: false,              // Không convert URLs
  
  // Note: noneditable plugin không có sẵn trong TinyMCE open source
  
  // ✅ Content style để match với template format
  content_style: `
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 14px; 
      line-height: 1.6; 
      color: #000;
      margin: 0;
      padding: 20px;
      background: white;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    /* Giữ nguyên các class từ BE */
    .center { text-align: center; }
    .section-title { 
      margin-top: 12px; 
      font-weight: bold; 
      text-transform: uppercase; 
    }
    .grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 6px 16px; 
    }
    
    /* Highlight placeholder variables */
    .placeholder-variable {
      background-color: #e6f7ff;
      color: #1890ff;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      border: 1px solid #91d5ff;
    }
    
    /* Style cho non-editable sections */
    .non-editable-header,
    .sign-block,
    .footer,
    .meta-block {
      background-color: #f8f9fa;
      border: 1px dashed #dee2e6;
      padding: 8px;
      margin: 8px 0;
      opacity: 0.7;
      position: relative;
    }
    
    /* Add indicator for non-editable */
    .non-editable-header:before,
    .sign-block:before,
    .footer:before,
    .meta-block:before {
      content: '🔒 Non-editable';
      position: absolute;
      top: -10px;
      left: 8px;
      background: #ffc107;
      color: #000;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: bold;
    }
    
    /* Table styling giữ nguyên từ BE */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 8px 0; 
    }
    th, td { 
      border: 1px solid #ddd; 
      padding: 8px; 
      vertical-align: top; 
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    thead { display: table-header-group; }
  `,
  
  // ✅ Cấu hình scroll và hiển thị
  statusbar: true,
  elementpath: false,
  branding: false,
  
  // ✅ Quan trọng: đảm bảo editor có thể scroll
  body_class: 'mce-content-body',
  
  // Setup sẽ được config trong hook
  setup: (editor) => {
    // Custom setup từ hook
  }
};

// Function để highlight các placeholder như {{ company.name }}
const preprocessHtmlForTinyMCE = (html = '') => {
  return String(html).replace(
    /\{\{\s*([^}]+)\s*\}\}/g, 
    '<span class="placeholder-variable">${{ $1 }}</span>'
  );
};

const postprocessHtmlFromTinyMCE = (html = '') => {
  return String(html).replace(
    /<span class="[^"]*placeholder-variable[^"]*"[^>]*>\$?\{\{\s*([^}]+)\s*\}\}<\/span>/g,
    '{{ $1 }}'
  );
};

// Hash function để nhận diện template đã paste
const hash = (s = '') => {
  let h = 0; 
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i) | 0;
  }
  return String(h);
};

// Debounce function
const debounce = (fn, ms = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

// Hook quản lý TinyMCE editor cho TemplateEditor thay thế useQuillEditor
export const useQuillEditor = (initialContent, onContentChange, visible) => {
  const { message } = App.useApp();
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPasted, setIsPasted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // ✅ Initialize editor khi modal visible
  useEffect(() => {
    if (visible && !isInitialized) {
      console.log('📦 TinyMCE TemplateEditor: Modal visible → Ready to initialize');
      setIsInitialized(true);
    } else if (!visible && isInitialized) {
      console.log('🗑️ TinyMCE TemplateEditor: Modal closed → Reset initialization flag');
      setIsInitialized(false);
      setIsPasted(false);
    }
  }, [visible]);

  // ✅ Handle content changes từ TinyMCE
  const handleEditorChange = (content, editor) => {
    console.log('✏️ TinyMCE TemplateEditor: Content changed, content length:', content.length);
    const processedContent = postprocessHtmlFromTinyMCE(content);
    onContentChange?.(processedContent);
  };

  // ✅ TinyMCE controlled mode - không cần paste thủ công
  // Content được đồng bộ qua value prop của Editor component

  // ✅ Cleanup khi modal đóng
  useEffect(() => {
    if (visible || !editor) return;

    console.log('�️ TinyMCE TemplateEditor: Cleaning up editor instance');
    try {
      // Cleanup TinyMCE instance
      setEditor(null);
      setIsPasted(false);
      setIsInitialized(false);
      console.log('✅ TinyMCE TemplateEditor: Cleanup completed');
    } catch (error) {
      console.warn('TinyMCE TemplateEditor cleanup warning:', error);
    }
  }, [visible, editor]);

  // ✅ Get current content từ TinyMCE
  const getCurrentContent = () => {
    if (!editor || editor.removed || !editor.initialized) {
      console.warn('⚠️ TinyMCE TemplateEditor: Editor not available, returning empty content');
      return '';
    }
    try {
      if (!editor.serializer || !editor.getBody) {
        console.warn('⚠️ TinyMCE TemplateEditor: serializer or getBody not available, returning empty content');
        return '';
      }
      const rawContent = editor.getContent({ format: 'html' });
      const processed = postprocessHtmlFromTinyMCE(rawContent);
      console.log('📄 TinyMCE TemplateEditor: Getting current content, length:', processed.length);
      return processed;
    } catch (error) {
      console.error('❌ TinyMCE TemplateEditor: Error getting content:', error);
      return '';
    }
  };

  // ✅ Set content vào TinyMCE
  const setContent = (content) => {
    if (!editor) return;
    
    try {
      const processed = preprocessHtmlForTinyMCE(content);
      editor.setContent(processed);
      console.log('📝 TinyMCE TemplateEditor: Content set, length:', content.length);
    } catch (error) {
      console.error('❌ TinyMCE TemplateEditor: Error setting content:', error);
    }
  };

  // ✅ Reset TinyMCE content
  const resetContent = () => {
    if (!editor) return;
    
    try {
      editor.setContent('');
      setIsPasted(false);
      console.log('🔄 TinyMCE TemplateEditor: Content reset');
    } catch (error) {
      console.error('❌ TinyMCE TemplateEditor: Error resetting content:', error);
    }
  };

  // ✅ TinyMCE config với setup function
  const finalTinyMCEConfig = {
    ...tinyMCEConfig,
    setup: (editor) => {
      console.log('🔧 TinyMCE TemplateEditor: Setup function called');
      
      // Store editor reference
      setEditor(editor);
      
      // Handle initialization
      editor.on('init', () => {
        console.log('✅ TinyMCE TemplateEditor: Editor initialized');
        
        // ✅ Đảm bảo editor có scroll khi khởi tạo
        const editorBody = editor.getBody();
        if (editorBody) {
          editorBody.style.overflowY = 'auto';
          editorBody.style.overflowX = 'hidden';
          editorBody.style.minHeight = '400px';
        }
        
        // ✅ Đảm bảo iframe có scroll
        const iframe = editor.getContentAreaContainer().querySelector('iframe');
        if (iframe) {
          iframe.style.overflowY = 'auto';
          iframe.style.overflowX = 'hidden';
        }
        
        setIsReady(true);
      });
      
      // Handle paste events để preserve formatting
      editor.on('paste', (e) => {
        console.log('📋 TinyMCE TemplateEditor: Paste event detected');
      });
    }
  };

  // Return API tương thích với useQuillEditor cũ
  return {
    quill: editor,           // Alias để tương thích
    editor,                  // TinyMCE editor instance
    quillRef: editorRef,     // Alias để tương thích  
    editorRef,               // TinyMCE editor ref
    isReady,
    isInitialized,
    isPasted,
    setIsPasted,
    tinyMCEConfig: finalTinyMCEConfig,
    handleEditorChange,

    getCurrentContent,
    setContent,
    resetContent,

    // Processing functions
    preprocessHtmlForTinyMCE,
    postprocessHtmlFromTinyMCE,
    
    // Aliases để tương thích với code cũ
    preprocessHtmlForQuill: preprocessHtmlForTinyMCE,
    postprocessHtmlFromQuill: postprocessHtmlFromTinyMCE,
  };
};