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

// Import plugins
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

// 🔥 TinyMCE config CHỐNG PHÁ FORMAT HOÀN TOÀN
const tinyMCEConfig = {
  license_key: 'gpl',
  height: '100%',
  min_height: 400,
  resize: true,
  menubar: false,
  plugins: [
    'code', 'table', 'link', 'searchreplace',
    'autolink', 'charmap', 'preview', 'anchor', 
    'wordcount', 'fullscreen'
  ],
  external_plugins: {},  // 🔥 KHÔNG CÓ EXTERNAL PLUGINS
  toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright | table | removeformat | code | fullscreen',
  
  // 🔥 SIÊU BẢO VỆ HTML - KHÔNG ĐỤNG VÀO GÌ HẾT
  valid_elements: '*[*]',           // Chấp nhận TẤT CẢ elements + attributes
  extended_valid_elements: '*[*]',  // Mở rộng không giới hạn
  valid_children: '+*[*]',          // Cho phép mọi element làm con của mọi element
  valid_styles: { '*': '*' },       // Chấp nhận TẤT CẢ styles cho TẤT CẢ elements
  verify_html: false,               // KHÔNG verify HTML
  cleanup: false,                   // KHÔNG cleanup
  cleanup_on_startup: false,        // KHÔNG cleanup khi khởi động
  trim: false,                      // KHÔNG trim whitespace
  
  // 🚫 TẮT HOÀN TOÀN HTML NORMALIZATION
  forced_root_block: false,         // KHÔNG force root block
  force_br_newlines: false,         // KHÔNG force BR newlines  
  force_p_newlines: false,          // KHÔNG force P newlines
  convert_newlines_to_brs: false,   // KHÔNG convert newlines
  remove_linebreaks: false,         // KHÔNG remove line breaks
  preformatted: true,               // Giữ format gốc
  
  // 🚫 TẮT WHITESPACE NORMALIZATION
  indent: false,                    // KHÔNG indent
  indent_use_margin: false,         // KHÔNG dùng margin cho indent
  
  // 🔥 CHỐNG NORMALIZE MẠNH NHẤT (TinyMCE v8 compatible)
  // Loại bỏ forced_root_block và force_p_newlines - deprecated trong v8          /
  entities: '',                     // KHÔNG encode entities
  convert_urls: false,              // KHÔNG convert URLs
  relative_urls: false,             // KHÔNG relative URLs
  remove_script_host: false,        // KHÔNG remove script host
  document_base_url: '',            // Base URL rỗng
  
  // 🔧 RAW MODE - HOÀN TOÀN KHÔNG XỬ LÝ GÌ
  encoding: 'raw',                  // Raw encoding
  entity_encoding: 'raw',           // Raw entity encoding - QUAN TRỌNG
  element_format: 'html',           // HTML format
  formats: {},                      // Không có format tự động
  keep_values: true,                // Giữ nguyên values
  
  // 🚫 TẮT HOÀN TOÀN URL PROCESSING
  urlconverter_callback: function(url, node, on_save) {
    return url; // Trả về URL nguyên gốc, không convert
  },
  
  // 🔥 TẮT HOÀN TOÀN DOM MUTATIONS VÀ PROCESSING
  custom_elements: '~*',            // Cho phép custom elements
  object_resizing: false,           // Tắt resize objects
  resize_img_proportional: false,   // Tắt proportional resize
  table_resize_bars: false,         // Tắt table resize
  
  // 🚫 TẮT SERIALIZATION PROCESSING
  // ❌ [COMMENTED OUT] init_instance_callback - GÂY VẤN ĐỀ VỚI PROTECT RESTORE
  /*
  init_instance_callback: function(editor) {
    // HOÀN TOÀN TẮT serializer processing
    if (editor.serializer) {
      editor.serializer.serialize = function(node, args) {
        // Trả về innerHTML trực tiếp, không xử lý gì
        return node && node.innerHTML ? node.innerHTML : '';
      };
      editor.serializer.encode = function(text) { return text; };
      editor.serializer.decode = function(text) { return text; };
    }
  },
  */
  
  // 🔒 BẢO VỆ CHỈ CÁC PATTERNS THỰC SỰ CẦN THIẾT
  protect: [
    // /<!\ [CDATA\[[\s\S]*?\]\]>/g,         // CDATA (có thể không cần)                       
    /<style[^>]*>[\s\S]*?<\/style>/gi,     // 🔒 BẢO VỆ <style>
    /<head[^>]*>[\s\S]*?<\/head>/gi,       // 🔒 BẢO VỆ <head>
    /<meta[^>]*\/?>/gi                     // 🔒 BẢO VỆ <meta>
    // ❌ BỎ: style="" và class="" - để TinyMCE xử lý bình thường
    // /style\s*=\s*["'][^"']*["']/gi,    
    // /class\s*=\s*["'][^"']*["']/gi     
  ],
  
  // 🚫 TẮT HOÀN TOÀN MỌI XỬ LÝ HTML
  fix_list_elements: false,         // KHÔNG sửa lists
  fix_table_elements: false,        // KHÔNG sửa tables
  apply_source_formatting: false,   // KHÔNG format source
  remove_trailing_brs: false,       // KHÔNG xóa <br> cuối
  pad_empty_with_br: false,         // KHÔNG thêm <br> vào empty
  keep_styles: true,                // GIỮ TẤT CẢ styles
  inline_styles: false,             // KHÔNG convert inline styles
  
  // 🚫 TẮT HTML SANITIZATION
  allow_html_data_urls: true,       // Cho phép data URLs
  allow_svg_data_urls: true,        // Cho phép SVG data URLs
  allow_script_urls: true,          // Cho phép script URLs
  allow_unsafe_link_target: true,   // Cho phép unsafe links
  
  // 🛡️ BẢO VỆ STRUCTURE HOÀN TOÀN - TẮT TẤT CẢ AUTO-FORMAT
  allow_html_in_named_anchor: true, // Cho phép HTML trong anchor
  paste_retain_style_properties: "all", // Giữ ALL style properties
  paste_remove_styles: false,       // KHÔNG remove styles khi paste
  paste_remove_spans: false,        // KHÔNG remove spans
  paste_strip_class_attributes: "none", // KHÔNG strip class attributes
  
  // 🚫 TẮT MARKDOWN VÀ QUOTE PROCESSING
  convert_fonts_to_spans: false,    // KHÔNG convert fonts
  font_size_legacy_values: '',     // KHÔNG legacy font values
  
  // 🚫 TẮT LIST AUTO-FORMAT (CÓ THỂ GÂY RA DẤU >)
  lists_indent_on_tab: false,       // KHÔNG indent lists với tab

  
  // 🚫 TẮT PASTE PROCESSING
  paste_preprocess: function(plugin, args) {
    // KHÔNG xử lý paste content
    return;
  },
  paste_postprocess: function(plugin, args) {
    // KHÔNG xử lý paste content
    return;
  },
  
  // 🛡️ BẢO VỆ SCHEMA VÀ ELEMENTS
  schema: 'mixed',                  // Mixed schema - chấp nhận mọi thứ
  
  
  // 🎯 SIMPLE SETUP - CHỈ CALLBACK CƠ BẢN
  setup: function(editor) {
    if (onEditorReady) {
      onEditorReady(editor, tinymce);
    }
  },
  
  // 🎨 CONTENT STYLE CHỐNG NORMALIZE + BẢO VỆ FORMAT  
  content_style: `
    /* 🔥 BẢO VỆ WHITESPACE VÀ FORMAT */
    body { 
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      background: #fff; 
      font-family: 'Noto Sans','DejaVu Sans','Arial',sans-serif; 
      font-size: 12pt; 
      line-height: 1.45; 
      margin: 20px;
    }
    
    /* Bảo vệ structure không bị TinyMCE đụng */
    * { box-sizing: border-box; }
    
    /* 📄 PRINT STYLES */
    @page { size: A4; margin: 10mm 10mm 12mm 10mm; }
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
    }
    
    /* 🎯 HEADINGS */
    h1, h2, h3 { 
      text-align: center; 
      margin: 6px 0; 
      white-space: pre-wrap;
    }
    
    /* 📊 META BLOCK - Bảo vệ grid layout */
    .meta-block { 
      margin-top: 8px; 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 8px 16px;
      white-space: pre-wrap;
    }
    
    /* 📝 SECTION TITLES */
    .section-title { 
      margin-top: 12px; 
      font-weight: bold; 
      text-transform: uppercase;
      white-space: pre-wrap;
    }
    
    /* 📋 TABLES - Bảo vệ không bị normalize */
    .content-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 8px;
      white-space: pre-wrap;
    }
    
    /* 🔒 COMMENTS ĐƯỢC GIỮ NGUYÊN TRONG HTML */
    
    /* 🛡️ LIST PROTECTION - Giữ format danh sách */
    .list-block {
      white-space: pre-line !important;
      margin: 8px 0;
    }
    .content-table th, .content-table td { border: 1px solid #444; padding: 6px 8px; vertical-align: top; }
    .right { text-align: right; }
    .muted { color: #777; font-size: 10pt; }
    .note { white-space: pre-line; }
    thead { display: table-header-group; }
    
    /* đồng bộ sign-block + sign-box */
    .sign-block { width:100%; table-layout:fixed; border-collapse:collapse; margin-top:24px; }
    .sign-block td { width:50%; padding:0 6px; vertical-align:bottom; }
    .sign-box { position:relative; padding:10px 10px 10px 10px; }
    
    /* đồng bộ signature-anchor */
    .signature-anchor {
      position:absolute; bottom:10px; left:10px;
      font-size:1pt; line-height:1;
      color:#ffffff;
      opacity:0.01;
      letter-spacing:-0.2pt;
      user-select:none;
    }
    
    /* Template variables styling */
    .template-var { 
      background-color: #fff3cd; 
      padding: 2px 4px; 
      border-radius: 3px; 
      color: #856404;
      font-weight: bold;
    }
  `
};

function useTinyEditor() {
  const [editor, setEditor] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [originalFullHtml, setOriginalFullHtml] = useState('');
  const [originalHead, setOriginalHead] = useState('');
  const [originalHtmlAttrs, setOriginalHtmlAttrs] = useState('');
  const [originalDoctype, setOriginalDoctype] = useState('');
  const { message } = App.useApp();

  // ✅ Extract body content từ full HTML
  const extractBodyFromFullHtml = (fullHtml) => {
    if (!fullHtml) return '';
    
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      return bodyMatch[1];
    }
    
    // Nếu không có body tag, return full content
    return fullHtml;
  };

  // ✅ Extract head NGUYÊN GỐC
  const extractHeadFromFullHtml = (fullHtml) => {
    if (!fullHtml) return '';
    
    const headMatch = fullHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    return headMatch ? headMatch[1] : '';
  };

  // ✅ GENERIC: Rebuild HTML với HEAD NGUYÊN GỐC cho mọi template
  const rebuildFullHtmlFromBody = (bodyContent) => {
    // Nếu bodyContent đã là full HTML document thì return luôn
    if (bodyContent?.includes('<!DOCTYPE') && bodyContent?.includes('<html')) {
      return bodyContent;
    }

    // GENERIC: Lấy toàn bộ structure từ originalFullHtml
    if (originalFullHtml) {
      // Thay thế nội dung body, giữ nguyên doctype + html + head
      return originalFullHtml.replace(
        /<body[^>]*>([\s\S]*?)<\/body>/i,
        `<body>\n${bodyContent}\n</body>`
      );
    }

    // Fallback: Tạo cấu trúc cơ bản
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Document</title>
</head>
<body>
${bodyContent}
</body>
</html>`;
  };

  // Handle editor change
  const handleEditorChange = (content, editor) => {
    console.log('✏️ TinyMCE: Content changed, length:', content?.length || 0);
  };

  // ✅ Get current content - CRITICAL FIX: Luôn trả full HTML document
  const getCurrentContent = () => {
    if (!editor || editor.removed || !editor.initialized) {
      return originalFullHtml || '';
    }
    
    try {
      // Lấy body content từ TinyMCE
      const bodyContent = editor.getContent({ 
        format: 'html',
        get_from_editor: true
      });
      
      // CRITICAL: Kiểm tra có HEAD content không
      if (!originalHead || originalHead.length === 0) {
        // Thử recovery từ originalFullHtml
        if (originalFullHtml) {
          const recoveredHead = extractHeadFromFullHtml(originalFullHtml);
          if (recoveredHead) {
            setOriginalHead(recoveredHead);
          }
        }
      }
      
      // CRITICAL: Rebuild thành full HTML document
      const fullHtml = rebuildFullHtmlFromBody(bodyContent);
      
      return fullHtml;
      
    } catch (error) {
      console.error('❌ TinyMCE: Error getting content:', error);
      return originalFullHtml || '';
    }
  };

  // ✅ Set content - BẢO VỆ HEAD HOÀN TOÀN + THÊM DEBUG
  const setEditorContent = (content) => {
    if (!editor || !content) {
      console.warn('⚠️ setEditorContent: Missing editor or content');
      return;
    }
    
    try {
      console.log('📝 Setting TinyMCE content...');
      console.log('📊 Full HTML length:', content?.length || 0);
      
      // 🔒 LƯU TOÀN BỘ HTML GỐC - KHÔNG CHO TINYMCE ĐỘNG VÀO
      setOriginalFullHtml(content);
      
      // 🔒 EXTRACT VÀ BẢO VỆ HEAD NGUYÊN GỐC
      const headContent = extractHeadFromFullHtml(content);
      const doctypeMatch = content.match(/<!DOCTYPE[^>]*>/i);
      const htmlAttrMatch = content.match(/<html([^>]*)>/i);
      
      console.log('🧠 Extracted HEAD content:', {
        headLength: headContent?.length || 0,
        hasDoctype: !!doctypeMatch,
        hasHtmlAttrs: !!htmlAttrMatch
      });
      
      // Lưu các phần nguyên gốc + backup vào localStorage
      setOriginalHead(headContent);
      setOriginalDoctype(doctypeMatch ? doctypeMatch[0] : '<!DOCTYPE html>');
      setOriginalHtmlAttrs(htmlAttrMatch ? htmlAttrMatch[1] : '');
      
      // KHÔNG cần backup localStorage - sử dụng originalFullHtml để preserve
      
      // Chỉ đưa body vào TinyMCE - SỬ DỤNG innerHTML TRỰC TIẾP
      const bodyContent = extractBodyFromFullHtml(content);
      console.log('📝 Setting body content DIRECTLY via innerHTML, length:', bodyContent?.length || 0);
      
      // 🔥 SỬ DỤNG innerHTML TRỰC TIẾP - BỎ QUA TẤT CẢ TINYMCE PROCESSING
      const editorBody = editor.getBody();
      if (editorBody) {
        editorBody.innerHTML = bodyContent;
        console.log('✅ Direct innerHTML assignment completed');
      } else {
        // Fallback nếu không có body
        console.warn('⚠️ No editor body, using setContent fallback');
        editor.setContent(bodyContent, { format: 'raw', no_events: true });
      }
      
      console.log('✅ TinyMCE content set successfully');
      
    } catch (error) {
      console.error('❌ Error setting content:', error);
    }
  };

  // Reset content - THÊM DEBUG LOGS
  const resetEditorContent = () => {
    if (!editor) return;
    
    try {
      console.log('🔄 Resetting TinyMCE editor content...');
      console.log('📊 Before reset - HEAD length:', originalHead?.length || 0);
      
      editor.setContent('');
      setOriginalFullHtml('');
      setOriginalHead('');
      setOriginalHtmlAttrs('');
      setOriginalDoctype('');
      
      console.log('✅ TinyMCE content reset completed');
    } catch (error) {
      console.error('❌ Error resetting content:', error);
    }
  };

  // TinyMCE config với setup
  const finalTinyMCEConfig = {
    ...tinyMCEConfig,
    skin: 'oxide',
    content_css: 'oxide',
    setup: (editor) => {
      setEditor(editor);
      
      editor.on('init', () => {
        setIsEditorReady(true);
      });
    }
  };

  return {
    editor,
    isEditorReady,
    tinyMCEConfig: finalTinyMCEConfig,
    getCurrentContent,
    setEditorContent,
    resetEditorContent,
    handleEditorChange
  };
}

export default useTinyEditor;
