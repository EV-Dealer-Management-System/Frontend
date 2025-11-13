import { useState, useEffect, useRef } from 'react';
import { App } from 'antd';

// ✅ Import TinyMCE core & plugins local để dùng bản self-hosted (không cần key)
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/content/default/content.css';

// ✅ Import TinyMCE core & plugins local để dùng bản self-hosted (không cần key)
import tinymce from 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/themes/silver';


// ✅ Import các plugin cần thiết cho editor đơn giản
// import 'tinymce/plugins/code';
// import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
// import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/autolink';
// import 'tinymce/plugins/charmap';
// import 'tinymce/plugins/preview';
// import 'tinymce/plugins/anchor';
// import 'tinymce/plugins/visualblocks';
// import 'tinymce/plugins/wordcount';
// import 'tinymce/plugins/fullscreen';

// ✅ Cấu hình TinyMCE để giữ nguyên HTML structure từ BE
const tinyMCEConfig = {
    license_key: 'gpl',
  height: '100%',
  min_height: 400,
  max_height: 800,
  resize: true,
  menubar: false,
  plugins: [
    'lists', 'link', 'autolink'
  ],
  toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | removeformat',
  
  // ✅ Cấu hình quan trọng để giữ nguyên HTML từ BE
  valid_elements: '*[*]',           // Cho phép tất cả elements với tất cả attributes
  extended_valid_elements: '*[*]',  // Mở rộng validation cho custom elements
  valid_styles: { 
    '*': 'color,font-size,font-family,background,background-color,text-align,margin,padding,border,width,height,line-height,text-decoration,font-weight,display,position,top,left,right,bottom,z-index,opacity,border-radius,box-shadow'
  },
  verify_html: false,               // Không verify HTML - giữ nguyên như từ BE          
  entity_encoding: 'raw',           // Không encode entities
  
  // Note: noneditable plugin không có sẵn trong TinyMCE open source
  
  // ✅ Content style để match với A4 format
  content_style: `
    body { 
      font-family: 'Noto Sans', 'DejaVu Sans', Arial, sans-serif; 
      font-size: 12pt; 
      line-height: 1.4; 
      color: #000;
      margin: 0;
      padding: 16px;
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
      background-color: #dbeafe;
      color: #1d4ed8;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 11px;
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
    }
    
    /* Table styling giữ nguyên từ BE */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 8px 0; 
    }
    th, td { 
      border: 1px solid #444; 
      padding: 6px 8px; 
      vertical-align: top; 
    }
    thead { display: table-header-group; }
  `,
  
  // ✅ Setup để handle placeholder variables và events
  setup: (editor) => {
    // Custom setup sẽ được thêm trong hook useTinyEditor
  }
};

// Function để highlight các placeholder như {{ company.name }}
const preprocessHtmlForTinyMCE = (html) => {
  if (!html || typeof html !== 'string') {
    console.warn('⚠️ preprocessHtmlForTinyMCE: Invalid html input:', html);
    return '';
  }
  return html.replace(
    /\{\{\s*([^}]+)\s*\}\}/g, 
    '<span class="placeholder-variable">${{ $1 }}</span>'
  );
};

const postprocessHtmlFromTinyMCE = (html) => {
  if (!html || typeof html !== 'string') {
    console.warn('⚠️ postprocessHtmlFromTinyMCE: Invalid html input:', html);
    return '';
  }
  return html.replace(
    /<span class="[^"]*placeholder-variable[^"]*"[^>]*>\$?\{\{\s*([^}]+)\s*\}\}<\/span>/g,
    '{{ $1 }}'
  );
};

// Hook quản lý TinyMCE editor thay thế useQuillEditor
export const useTinyEditor = (visible, htmlContent, setHasUnsavedChanges, isUpdatingFromCode) => {
  const { message } = App.useApp();
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPasted, setIsPasted] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // ✅ Initialize editor khi modal visible
  useEffect(() => {
    if (visible && !isInitialized) {
      console.log('📦 TinyMCE: Modal visible → Ready to initialize');
      setIsInitialized(true);
    } else if (!visible && isInitialized) {
      console.log('🗑️ TinyMCE: Modal closed → Reset initialization flag');
      setIsInitialized(false);
      setIsPasted(false);
    }
  }, [visible]);

  // ✅ Handle content changes từ TinyMCE
  const handleEditorChange = (content, editor) => {
    if (isUpdatingFromCode) {
      console.log('🔄 TinyMCE: Skipping change - updating from code');
      return;
    }
    
    // Kiểm tra content hợp lệ
    if (content === null || content === undefined) {
      console.warn('⚠️ TinyMCE: Received null/undefined content');
      return;
    }
    
    const processedContent = postprocessHtmlFromTinyMCE(content);
    
    // Callback để update htmlContent trong parent
    if (typeof window.__UPDATE_HTML_CONTENT__ === 'function') {
      window.__UPDATE_HTML_CONTENT__(processedContent);
    }
    
    setHasUnsavedChanges(true);
    console.log('✏️ TinyMCE: Content changed, content length:', content?.length || 0);
  };

  // ✅ TinyMCE controlled mode - không cần paste thủ công
  // Content được đồng bộ qua value prop của Editor component

  // ✅ Cleanup khi modal đóng
  useEffect(() => {
    if (visible || !editor) return;

    console.log('🗑️ TinyMCE: Cleaning up editor instance');
    try {
      // Cleanup TinyMCE instance
      setEditor(null);
      setIsPasted(false);
      setIsInitialized(false);
      console.log('✅ TinyMCE: Cleanup completed');
    } catch (error) {
      console.warn('TinyMCE cleanup warning:', error);
    }
  }, [visible, editor]);

  // ✅ Get current content từ TinyMCE
  const getCurrentContent = () => {
    if (!editor || editor.removed || !editor.initialized) {
      console.warn('⚠️ TinyMCE: Editor not available, returning empty content');
      return '';
    }
    try {
      if( !editor.serializer || !editor.getBody) {
        console.warn('⚠️ TinyMCE: serializer or getBody not available, returning empty content');
        return '';
      }
      const rawContent = editor.getContent({format: 'html'});
      const processed = postprocessHtmlFromTinyMCE(rawContent);
      console.log('📄 TinyMCE: Getting current content, length:', processed.length);
      return processed;
    } catch (error) {
      console.error('❌ TinyMCE: Error getting content:', error);
      return '';
    }
  };

  // ✅ Set content vào TinyMCE
  const setEditorContent = (content) => {
    if (!editor) return;
    
    try {
      const processed = preprocessHtmlForTinyMCE(content);
      editor.setContent(processed);
      console.log('📝 TinyMCE: Content set, length:', content.length);
    } catch (error) {
      console.error('❌ TinyMCE: Error setting content:', error);
    }
  };

  // ✅ Reset TinyMCE content
  const resetEditorContent = () => {
    if (!editor) return;
    
    try {
      editor.setContent('');
      setIsPasted(false);
      console.log('🔄 TinyMCE: Content reset');
    } catch (error) {
      console.error('❌ TinyMCE: Error resetting content:', error);
    }
  };

  // ✅ TinyMCE config với setup function
  const finalTinyMCEConfig = {
    ...tinyMCEConfig,
    skin: 'oxide',
    content_css: 'oxide',
    setup: (editor) => {
      console.log('🔧 TinyMCE: Setup function called');
      
      // Store editor reference
      setEditor(editor);
      
      // Handle initialization
      editor.on('init', () => {
        console.log('✅ TinyMCE: Editor initialized');
        setIsEditorReady(true);
      });
      
      
      
      // Handle paste events để preserve formatting
      editor.on('paste', (e) => {
        console.log('📋 TinyMCE: Paste event detected');
      });
    }
  };

  return {
    editor,
    editorRef,
    isInitialized,
    isPasted,
    setIsPasted,
    isEditorReady,
    tinyMCEConfig: finalTinyMCEConfig,
    getCurrentContent,
    setEditorContent,
    resetEditorContent: resetEditorContent, // Tương thích với useQuillEditor API
    resetQuillContent: resetEditorContent,  // Alias để tương thích
    handleEditorChange,
    preprocessHtmlForTinyMCE,
    postprocessHtmlFromTinyMCE
  };
};