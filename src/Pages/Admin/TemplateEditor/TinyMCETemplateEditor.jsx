import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Spin, App } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { 
  parseTemplateStructure,
  reconstructTemplateHTML,
  splitCombinedContent,
  protectPlaceholders,
  restorePlaceholders,
  validateTemplateStructure
} from './htmlStructureParser';
import { defaultTinyMCEConfig } from './tinymceHelpers';



const TinyMCETemplateEditor = ({
  content,
  onContentChange,
  height = '70vh'
}) => {
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalContent, setOriginalContent] = useState(content);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lưu trữ cấu trúc template đã parse
  const [parsedStructure, setParsedStructure] = useState(null);
  const [placeholderMap, setPlaceholderMap] = useState(new Map());
  const [sectionContent, setSectionContent] = useState('');

  // Parse template chỉ khi content thay đổi từ bên ngoài (không phải từ editor)
  const isInitialLoadRef = useRef(true);
  const lastParsedContentRef = useRef('');
  const isProcessingRef = useRef(false);  // Ngăn processing đồng thời
  const contentHashRef = useRef('');
  const parseCountRef = useRef(0);
  const isInternalChangeRef = useRef(false);  // Flag cho thay đổi nội bộ

  const { message } = App.useApp();
  
  useEffect(() => {
    // 🔄 Parse khi content thay đổi từ bên ngoài (template mới)
    if (!content) return;
    
    // Tạo hash cho content để so sánh chính xác
    const contentHash = btoa(encodeURIComponent(content)).substring(0, 20);
    
    // CIRCUIT BREAKER: Ngăn parse quá nhiều lần
    if (parseCountRef.current > 2) {  // Giảm từ 3 xuống 2
      console.warn('⚠️ [CIRCUIT BREAKER] Too many parse attempts, stopping to prevent loop');
      return;
    }
    
    // CHỈ parse khi thật sự là content từ bên ngoài (không phải từ editor)
    if (contentHash !== contentHashRef.current && 
        !isProcessingRef.current &&
        !isInternalChangeRef.current &&
        content !== lastEditorContentRef.current) {  // Thêm điều kiện này
      
      console.log('🔄 [NEW TEMPLATE] Parsing template structure...', {
        contentLength: content.length,
        contentHash,
        parseCount: parseCountRef.current,
        isFirstLoad: isInitialLoadRef.current
      });
      
      parseCountRef.current++;
      isProcessingRef.current = true;
      contentHashRef.current = contentHash;
      lastParsedContentRef.current = content;
      setOriginalContent(content);
      
      // Reset lại trạng thái khi chuyển template mới
      isInitialLoadRef.current = true;
      
      // Kiểm tra và parse template structure - NGHIÊM NGẶT
      try {
        if (!validateTemplateStructure(content)) {
          throw new Error('Template không có cấu trúc hợp lệ (thiếu section-title)');
        }
        
        const structure = parseTemplateStructure(content);
        console.log('✅ Template có cấu trúc hợp lệ, chỉ hiển thị section content');
        setParsedStructure(structure);
        setHasError(false);
        setErrorMessage('');
        
        // ✅ CHỈ hiển thị section-content, KHÔNG bao gồm pre-section-content
        const editableContent = structure.sectionContent;
        
        console.log('🎯 [EDITOR CONTENT] Only showing section content:', {
          preSectionLength: structure.preSectionContent?.length || 0,
          sectionLength: editableContent?.length || 0,
          showingPreSection: false
        });
        
        // 🛡️ Bảo vệ placeholders cho template mới
        const { protectedContent, placeholderMap: newPlaceholderMap } = protectPlaceholders(editableContent);
        setPlaceholderMap(newPlaceholderMap);
        setSectionContent(protectedContent);
        
        // Cập nhật TinyMCE content nếu đã khởi tạo
        if (editorRef.current && editorRef.current.setContent) {
          editorRef.current.setContent(protectedContent);
        }
        
        console.log('✅ Template parsed successfully:', {
          editableContentLength: editableContent.length,
          protectedContentLength: protectedContent.length,
          placeholderCount: newPlaceholderMap.size
        });
        
        isInitialLoadRef.current = false;
        
      } catch (error) {
        console.error('❌ [TEMPLATE ERROR]', error.message, {
          contentLength: content.length,
          contentPreview: content.substring(0, 200) + '...'
        });
        setHasError(true);
        setErrorMessage(error.message);
        setParsedStructure(null);
        setSectionContent('');  // KHÔNG hiển thị gì trong TinyMCE
        setPlaceholderMap(new Map());
      }
      
      // Reset processing flag sau khi hoàn thành
      setTimeout(() => {
        isProcessingRef.current = false;
        isInternalChangeRef.current = false;
        // Reset circuit breaker sau 5 giây
        setTimeout(() => {
          parseCountRef.current = 0;
        }, 5000);
      }, 200);
    }
  }, [content]);  // Chỉ dependency là content - đơn giản nhất

  // Sync TinyMCE content khi sectionContent thay đổi (template mới)
  useEffect(() => {
    if (sectionContent && editorRef.current && editorRef.current.setContent) {
      const currentContent = editorRef.current.getContent();
      if (currentContent !== sectionContent) {
        console.log('🔄 [SYNC] Updating TinyMCE with new template content');
        editorRef.current.setContent(sectionContent);
      }
    }
  }, [sectionContent]);

  // Handle content changes từ TinyMCE - với debounce và prevent loop
  const debounceTimeoutRef = useRef();
  const lastEditorContentRef = useRef('');
  
  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  const handleEditorChange = useCallback((newContent, editor) => {
    // 📝 SIMPLE: Chỉ xử lý khi có content và không đang processing
    if (!newContent || isProcessingRef.current) {
      return;
    }
    
    console.log('📝 [USER TYPING] Content changed:', newContent.length, 'chars');
    
    // Clear timeout cũ
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce - chọ user gõ xong rồi mới xử lý
    debounceTimeoutRef.current = setTimeout(() => {
      if (!onContentChange) return;
      
      try {
        if (parsedStructure) {
          // ✅ Xử lý cho template có cấu trúc - Editor chỉ chứa section content
          const restoredSectionContent = restorePlaceholders(newContent, placeholderMap);
          
          console.log('🔄 [RECONSTRUCT] Rebuilding full HTML:', {
            editorContent: restoredSectionContent.substring(0, 100) + '...',
            keepingOriginalPreSection: !!parsedStructure.preSectionContent
          });
          
          const fullHTML = reconstructTemplateHTML({
            ...parsedStructure,
            preSectionContent: parsedStructure.preSectionContent, // Giữ nguyên pre-section gốc
            sectionContent: restoredSectionContent // Chỉ thay section content từ editor
          });
          
          console.log('🚀 [SAVE] Sending reconstructed HTML to parent');
          onContentChange(fullHTML);
        } else {
          // Fallback cho template không có cấu trúc
          const restoredContent = restorePlaceholders(newContent, placeholderMap);
          console.log('🚀 [SAVE] Sending direct content to parent');
          onContentChange(restoredContent);
        }
      } catch (error) {
        console.error('❌ Error processing content:', error);
      }
    }, 800); // 800ms debounce
  }, [onContentChange, parsedStructure, placeholderMap, originalContent]);

  // Hiển thị lỗi nếu có
  if (hasError) {
    return (
      <div className="w-full bg-white rounded-lg border shadow-sm" style={{ height }}>
        <div className="px-4 py-2 border-b bg-red-50 rounded-t-lg">
          <h3 className="text-sm font-medium text-red-700 m-0">❌ Template Editor - Lỗi Cấu trúc</h3>
        </div>
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h4 className="text-lg font-semibold text-red-700 mb-2">Lỗi Cấu trúc Template</h4>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <div className="text-sm text-gray-600">
              <p>⚠️ Template phải có cấu trúc HTML đúng với các class:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><code>.section-title</code> - Bắt buộc</li>
                <li><code>.non-editable-header</code> - Tùy chọn</li>
                <li><code>.meta-block</code> - Tùy chọn</li>
                <li><code>.pre-section-content</code> - Tùy chọn</li>
                <li><code>.table-block</code> - Tùy chọn</li>
                <li><code>.sign-block</code> - Tùy chọn</li>
                <li><code>.footer</code> - Tùy chọn</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm" style={{ height }}>
      <div className="px-4 py-2 border-b bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-700 m-0"><SaveOutlined /> Template Editor - TinyMCE</h3>
      </div>
      
      <div className="relative" style={{ height: 'calc(100% - 60px)' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <Spin size="large" />
              <div className="mt-2 text-gray-600">Đang tải TinyMCE Editor...</div>
            </div>
          </div>
        )}
        
        <Editor
          key="tinymce-template-editor"  // Key tĩnh để tránh re-render loop
          ref={editorRef}
          initialValue={sectionContent || ''}  // Sử dụng initialValue thay vì value
          onEditorChange={handleEditorChange}
          onInit={(evt, editor) => {
            setIsLoading(false);
            console.log('🔧 TinyMCE Editor initialized');
            
            // Cập nhật content khi có template mới
            if (sectionContent && sectionContent !== editor.getContent()) {
              editor.setContent(sectionContent);
            }
            
            // Lưu reference
            editorRef.current = editor;
          }}
          init={{
            ...defaultTinyMCEConfig,
            
            // Override height for this instance
            height: '100%',
            
            // 🔧 SETUP CALLBACK - Placeholder protection và template structure
            setup: (editor) => {
              editor.on('init', () => {
                console.log('✅ TinyMCE Editor initialized with template structure parsing');
              });
              
              // Xử lý click trên placeholder blocks
              editor.on('click', (e) => {
                const target = e.target;
                if (target && target.classList && target.classList.contains('placeholder-block')) {
                  e.preventDefault();
                  
                  // Kiểm tra nếu click vào nút xóa (❌)
                  const clickX = e.offsetX;
                  const targetWidth = target.offsetWidth;
                  
                  if (clickX > targetWidth - 30) { // Click vào vùng ❌
                    if (confirm('Bạn có muốn xóa placeholder này không?')) {
                      target.remove();
                      editor.fire('change');
                    }
                  } else {
                    // Hiển thị thông tin về placeholder
                    const placeholder = target.getAttribute('data-placeholder');
                    console.log('🔒 Placeholder clicked:', placeholder);
                  }
                  return false;
                }
              });
              
              // CHO PHÉP xóa placeholder bằng phím Delete/Backspace
              editor.on('keydown', (e) => {
                const selection = editor.selection;
                const node = selection.getNode();
                
                if (node && node.classList && node.classList.contains('placeholder-block')) {
                  if (e.key === 'Delete' || e.key === 'Backspace') {
                    // CHO PHÉP xóa placeholder
                    if (confirm('Bạn có muốn xóa placeholder này không?')) {
                      e.preventDefault();
                      node.remove();
                      editor.fire('change');
                      return false;
                    } else {
                      e.preventDefault();
                      return false;
                    }
                  } else if (e.key.length === 1) {
                    // Ngăn nhập chữ vào placeholder
                    e.preventDefault();
                    return false;
                  }
                }
              });
              
              // Ngăn paste vào placeholder blocks
              editor.on('paste', (e) => {
                const selection = editor.selection;
                const node = selection.getNode();
                
                if (node && node.classList && node.classList.contains('placeholder-block')) {
                  e.preventDefault();
                  message.warning('🛡️ Không thể paste vào placeholder được bảo vệ');
                  return false;
                }
              });
              
              // CSS cho placeholder blocks - KHÔNG có icon để tránh gửi về BE
              editor.on('init', () => {
                const doc = editor.getDoc();
                const style = doc.createElement('style');
                style.textContent = `
                  .placeholder-block {
                    background: #e6f3ff !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                    color: #1890ff !important;
                    cursor: pointer !important;
                    user-select: none !important;
                    display: inline-block !important;
                    margin: 0 2px !important;
                    border: 1px dashed #1890ff !important;
                    position: relative !important;
                    font-weight: bold !important;
                  }
                  
                  .placeholder-block:hover {
                    background: #bae7ff !important;
                    border-color: #096dd9 !important;
                  }
                  
                  /* Indicator đơn giản bằng CSS - KHÔNG có text */
                  .placeholder-block:before {
                    content: "🔒";
                    font-size: 10px;
                    margin-right: 3px;
                  }
                `;
                doc.head.appendChild(style);
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default TinyMCETemplateEditor;