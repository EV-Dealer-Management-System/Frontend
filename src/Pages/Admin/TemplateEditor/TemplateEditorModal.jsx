import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Typography,
  Space,
  Spin,
  Tag,

  Input,
  Alert,
  App
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,

  ReloadOutlined
} from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import { useTemplateEditor } from './useTemplateEditor';
import useTinyEditor from './useTinyEditor';
import { useHtmlParser } from './useHtmlParser';
import PreviewModal from './PreviewModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ========================================
// 📝 TEMPLATE EDITOR MODAL - TINYMCE + HTML
// ========================================

function TemplateEditorModal({ visible, onClose, template }) {
  const { modal } = App.useApp();
  
  // States cho modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [htmlEditorVisible, setHtmlEditorVisible] = useState(false);
  const [fullHtmlContent, setFullHtmlContent] = useState('');
  const [htmlEditorSaving, setHtmlEditorSaving] = useState(false);

  // Hook quản lý HTML parsing cho template
  const {
    allStyles,
    htmlHead,
    htmlAttributes,
    templateBody,
    // 🔄 Parsed parts từ useHtmlParser
    headerBody,
    metaBlocks,
    signBody,
    footerBody,
    editableBody,
    parseHtmlFromBE,
    rebuildCompleteHtml,
    updateParsedStructure,
    resetStructureStates
  } = useHtmlParser();

  // Hook quản lý template editor
  const {
    selectedTemplate,
    htmlContent,
    setHtmlContent,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveTemplate,
    ingestTemplate,
    fullHtml,
    setFullHtml
  } = useTemplateEditor();

  // Hook quản lý TinyMCE editor
  const {
    editor,
    isEditorReady,
    tinyMCEConfig,
    getCurrentContent,
    setEditorContent,
    resetEditorContent,
    handleEditorChange
  } = useTinyEditor();
  // Ref để lưu ID của template đã nạp
  const lastIngestedId = useRef(null);
  const hasInitializedRef = useRef(false);
  
  // 📝 State cho modal HTML editing
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlRawContent, setHtmlRawContent] = useState('');

  // 🎯 Load template theo PDFEdit pattern - chỉ editableBody vào TinyMCE
  useEffect(() => {
    if (visible && template && template.id !== lastIngestedId.current) {
      resetEditorContent();
      
      if (template.contentHtml) {
        console.log('\ud83d\udcc4 Loading template with PDFEdit pattern...');
        
        // Parse HTML để tách các phần
        const parsed = parseHtmlFromBE(template.contentHtml);
        updateParsedStructure(parsed);
        
        // Lưu full HTML cho Preview và HTML tab
        setFullHtml(template.contentHtml);
        
        // 🎯 CHỈ LƯU editableContent vào state - TinyMCE sẽ được sync qua useEffect khác
        const editableContent = parsed.editableBody || template.contentHtml;
        setHtmlContent(editableContent);
        
        // NOTE: Không gọi setEditorContent ở đây - sẽ được sync qua useEffect với editableBody
        
        console.log('\ud83d\udd04 Template loaded:');
        console.log('- Full HTML length:', template.contentHtml.length);
        console.log('- Editable body length:', editableContent.length);
      }
      
      ingestTemplate(template); // nạp template prop vào hook
      lastIngestedId.current = template.id;
      
      // 🔄 Reset các flags sau khi load xong
      setHasUnsavedChanges(false);
      hasInitializedRef.current = false; // Reset để tránh lỗi lần 2+
    }
  }, [visible, template, resetEditorContent, ingestTemplate, parseHtmlFromBE, updateParsedStructure, setFullHtml, setHtmlContent, setHasUnsavedChanges]);

  // ✅ Reset states khi đóng modal
  useEffect(() => {
    if (!visible) {
      setHasUnsavedChanges(false);
      resetStructureStates();
      hasInitializedRef.current = false;
      lastIngestedId.current = null;
    }
  }, [visible, setHasUnsavedChanges, resetStructureStates]);

  // 🎯 Sync TinyMCE với editableBody khi editor sẵn sàng  
  useEffect(() => {
    // Chỉ set content khi có editableBody từ parsing và editor ready
    if (isEditorReady && editableBody && !hasInitializedRef.current) {
      console.log('🔄 Syncing TinyMCE with editableBody:', editableBody.length);
      setEditorContent(editableBody);
      hasInitializedRef.current = true;
    }
  }, [isEditorReady, editableBody, setEditorContent]);

  // 🔄 Handle editor content change - CHỈ CẬP NHẬT STATE
  const onEditorChange = (content, editor) => {
    setHtmlContent(content);
    // KHÔNG set hasUnsavedChanges ở đây - sẽ dùng useEffect theo dõi htmlContent
  };

  // 🔄 Theo dõi htmlContent để kiểm tra thay đổi
  useEffect(() => {
    // Chỉ kiểm tra khi đã load xong template và có editableBody
    if (!editableBody || !htmlContent || !hasInitializedRef.current) {
      return;
    }
    
    const normalizedOriginal = normalizeHtmlForComparison(editableBody);
    const normalizedCurrent = normalizeHtmlForComparison(htmlContent);
    
    console.log('🔍 Checking changes:');
    console.log('- Original (editableBody):', normalizedOriginal.substring(0, 100) + '...');
    console.log('- Current (htmlContent):', normalizedCurrent.substring(0, 100) + '...');
    console.log('- Are different:', normalizedCurrent !== normalizedOriginal);
    
    const hasChanges = normalizedCurrent !== normalizedOriginal;
    
    if (hasChanges !== hasUnsavedChanges) {
      setHasUnsavedChanges(hasChanges);
      console.log('📝 hasUnsavedChanges updated to:', hasChanges);
    }
  }, [htmlContent, editableBody, hasUnsavedChanges]);

  // Helper function để extract body từ full HTML
  const extractBodyFromHtml = (fullHtml) => {
    if (!fullHtml) return '';
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : fullHtml;
  };

  // Helper function để normalize HTML cho việc so sánh
  const normalizeHtmlForComparison = (html) => {
    return html
      ?.replace(/\s+/g, ' ') // Thay thế multiple spaces thành single space
      ?.trim() // Trim đầu cuối
      ?.toLowerCase() || ''; // Lowercase để so sánh
  };

  // Handle mở HTML editor - sử dụng trực tiếp data từ BE
  const handleOpenHtmlEditor = () => {
    // Sử dụng trực tiếp contentHtml từ BE thay vì parse
    const originalHtml = selectedTemplate?.contentHtml || template?.contentHtml || '';
    setFullHtmlContent(originalHtml);
    setHtmlEditorVisible(true);
  };

  // ✅ Handle save từ HTML editor - GỌI LUÔN API SAVE
  const handleSaveFromHtmlEditor = async (newHtmlContent) => {
    if (!selectedTemplate || !newHtmlContent.trim() || htmlEditorSaving) {
      return;
    }

    setHtmlEditorSaving(true);
    try {
      console.log('💾 HTML Editor: Saving content directly to BE...');
      
      // ✅ Gọi API save template với HTML content đầy đủ
      const successObj = await saveTemplate(() => newHtmlContent);
      const success = !!successObj?.success;
      
      if (success) {
        // Update TinyMCE với content mới
        setEditorContent(newHtmlContent);
        setHtmlContent(newHtmlContent);
        setHasUnsavedChanges(false);
        
        // Đóng HTML Editor modal
        setHtmlEditorVisible(false);
        
        // Đóng luôn main modal sau 1 giây
        setTimeout(() => {
          onClose();
        }, 1000);
        
        modal.success({
          title: 'Thành công',
          content: 'Template đã được cập nhật và lưu thành công!',
        });
      } else {
        modal.error({
          title: 'Lỗi lưu template',
          content: successObj?.message || 'Không thể lưu template. Vui lòng thử lại.',
        });
      }
    } catch (error) {
      console.error('❌ HTML Editor: Error saving template:', error);
      modal.error({
        title: 'Lỗi hệ thống',
        content: 'Có lỗi xảy ra khi lưu template. Vui lòng thử lại.',
      });
    } finally {
      setHtmlEditorSaving(false);
    }
  };

  // 🔄 Handle save theo PDFEdit pattern - rebuild từ editableBody
  const handleSave = async () => {
    if (!selectedTemplate) {
      console.error('❌ No selected template for save');
      return;
    }

    // 🔄 LẤY TRỰC TIẾP innerHTML - BỎ QUA TẤT CẢ TINYMCE PROCESSING
    const rawContent = (() => {
      if (!editor) return htmlContent;
      
      // CHỈ sử dụng innerHTML - KHÔNG dùng getContent()
      const editorBody = editor.getBody();
      if (editorBody && editorBody.innerHTML) {
        console.log('📥 Direct innerHTML (no processing):', editorBody.innerHTML.substring(0, 100));
        return editorBody.innerHTML;
      }
      
      console.warn('⚠️ No editor body, using fallback content');
      return htmlContent;
    })();
    
    // 🔧 MINIMAL CLEANER - CHỈ XỬ LÝ CƠ BẢN
    const superCleanTinyMCEContent = (content) => {
      try {
        let cleaned = content;
        
        console.log('🔧 Before cleaning:', cleaned.substring(0, 200));
        
        // CHỈ XỬ LÝ &nbsp; - GIỮ NGUYÊN TẤT CẢ
        cleaned = cleaned.replace(/&nbsp;/g, ' ');
        
        // ❌ KHÔNG XỬ LÝ: mce:protected (để TinyMCE tự restore)
        // ❌ KHÔNG XỬ LỸ: entity decoding (có thể phá structure)
        // ❌ KHÔNG XỬ LÝ: attribute fixing (gây lỗi class%3d...)
        
        console.log('🔧 After minimal cleaning:', cleaned.substring(0, 200));
        return cleaned;
        
      } catch (error) {
        console.warn('🔧 Minimal clean error:', error);
        return content;
      }
    };

    const currentBodyContent = superCleanTinyMCEContent(rawContent);
    
    console.log('💾 Saving with current body content:', currentBodyContent.length);
    console.log('📝 Raw body content preview:', rawContent.substring(0, 200) + '...');
    console.log('📝 Cleaned body content preview:', currentBodyContent.substring(0, 200) + '...');
    
    if (!currentBodyContent.trim()) {
      console.error('❌ Empty body content');
      return;
    }

    console.log('🔄 Rebuilding complete HTML from parts...');
    console.log('- Body content length:', currentBodyContent.length);
    console.log('- Header body length:', headerBody?.length || 0);
    console.log('- Meta blocks length:', metaBlocks?.length || 0);
    console.log('- Sign body length:', signBody?.length || 0);
    console.log('- Footer body length:', footerBody?.length || 0);

    // 🔄 Rebuild complete HTML từ body content + các phần cố định
    const completeHtml = rebuildCompleteHtml({
      editableBody: currentBodyContent,
      headerBody: headerBody || '',
      metaBlocks: metaBlocks || '',
      signBody: signBody || '',
      footerBody: footerBody || '',
      subject: selectedTemplate.name || 'Template',
      externalAllStyles: allStyles
    });

    console.log('✅ Complete HTML rebuilt, length:', completeHtml.length);

    // Cập nhật states
    setHtmlContent(currentBodyContent);
    setFullHtml(completeHtml);
    
    // Save template với HTML hoàn chỉnh đã rebuild
    const successObj = await saveTemplate(() => completeHtml);
    const success = !!successObj?.success;
    if (success) {
      console.log('✅ Template saved successfully with rebuilt HTML');
      setHasUnsavedChanges(false);
      
      // 🔄 Cập nhật editableBody baseline sau khi save
      // Parse lại để có editableBody mới làm baseline
      const newParsed = parseHtmlFromBE(completeHtml);
      updateParsedStructure(newParsed);
      
      // Đóng modal sau khi save thành công
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      console.error('❌ Failed to save template');
    }
  };

  // ✅ Handle reset với confirmation
  const handleReset = () => {
    modal.confirm({
      title: 'Khôi phục nội dung đã nạp?',
      content: 'Tất cả thay đổi chưa lưu sẽ bị mất. Bạn có chắc chắn không?',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      onOk: () => {
        // Parse lại từ template gốc và reset về nội dung ban đầu
        if (template && template.contentHtml) {
          const parsed = parseHtmlFromBE(template.contentHtml);
          updateParsedStructure(parsed);
          setHtmlContent(parsed.fullHtml || template.contentHtml);
          setFullHtml(parsed.fullHtml || template.contentHtml);
          
          // Đặt lại nội dung trong TinyMCE
          if (isEditorReady) {
            setEditorContent(parsed.fullHtml || template.contentHtml);
          }
        }
        setHasUnsavedChanges(false);
      }
    });
  };

  // ✅ Handle close modal với warning nếu có thay đổi
  const handleClose = () => {
    if (hasUnsavedChanges) {
      modal.confirm({
        title: 'Có thay đổi chưa lưu',
        content: 'Bạn có thay đổi chưa được lưu. Bạn có muốn đóng modal không?',
        okText: 'Đóng không lưu',
        cancelText: 'Ở lại',
        onOk: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };



  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
             
              <span className="flex items-center">
                    <EditOutlined className="text-blue-500" /> 
                    Chỉnh Sửa Mẫu Hợp Đồng
                </span>
              <div>
                <Title level={4} className="mb-0">
                  Chỉnh sửa Template: {selectedTemplate?.name || template?.name || ''}
                </Title>
                {selectedTemplate && (
                  <div className="flex items-center space-x-3 mt-1">
                    <Text code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedTemplate.code}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {(selectedTemplate.contentHtml?.length || 0).toLocaleString()} chars
                    </Text>
                    
                    {/* Status Indicator */}
                    {hasUnsavedChanges ? (
                      <Tag color="warning" icon={<ExclamationCircleOutlined />} className="text-xs">
                        Chưa lưu
                      </Tag>
                    ) : (
                      <Tag color="success" icon={<CheckCircleOutlined />} className="text-xs">
                        Đã lưu
                      </Tag>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        width="90vw"
        style={{ top: 10 }}
        destroyOnHidden
        styles={{
          body: { 
            height: 'calc(100vh - 200px)', 
            maxHeight: '800px',
            padding: '16px',
            overflow: 'hidden'
          }
        }}
        footer={[
          <Button key="reset" onClick={handleReset} disabled={!hasUnsavedChanges}>
            <ReloadOutlined />
            Reset
          </Button>,
          <Button 
            key="htmledit" 
            icon={<EditOutlined />}
            onClick={handleOpenHtmlEditor}
            disabled={!selectedTemplate}
            className="border-orange-400 text-orange-600 hover:border-orange-500"
          >
            Sửa bằng HTML
          </Button>,
          <Button 
            key="preview" 
            icon={<EyeOutlined />}
            onClick={() => setPreviewVisible(true)}
            disabled={!selectedTemplate}
            className="border-blue-400 text-blue-600 hover:border-blue-500"
          >
            Xem trước
          </Button>,
          <Button key="cancel" onClick={handleClose}>
            Hủy
          </Button>,
          <Button 
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={false}
            disabled={!hasUnsavedChanges}
            className="bg-green-500 hover:bg-green-600 border-green-500"
          >
            Lưu thay đổi
          </Button>
        ]}
      >
        
        
          <div className="h-full flex flex-col">
            
            {/* Template Info Banner */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800">
                    Đang chỉnh sửa: <strong>{selectedTemplate?.name} </strong>
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-mono">
                    - {selectedTemplate?.code}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges ? (
                    <span className="flex items-center text-amber-600 text-sm">
                      <ExclamationCircleOutlined className="mr-1" />
                      Có thay đổi chưa lưu
                    </span>
                  ) : (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircleOutlined className="mr-1" />
                       Đã đồng bộ
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TinyMCE Editor - Direct, no tabs */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-hidden relative">
                {/* TinyMCE Editor Container - Full height */}
                <div 
                  className="h-full"
                  style={{ 
                    height: 'calc(100vh - 400px)', 
                    maxHeight: '600px',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Editor
                      value={htmlContent}
                      init={{
                        ...tinyMCEConfig,
                        height: '100%'
                      }}
                      onEditorChange={onEditorChange}
                      disabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {!selectedTemplate && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Spin size="large" />
                  <div className="mt-4 text-gray-600">Đang tải nội dung...</div>
                </div>
              </div>
            )}
          </div>
      </Modal>

      {/* HTML Editor Modal */}
      <Modal
        title="Sửa bằng HTML - Toàn bộ Template"
        open={htmlEditorVisible}
        onCancel={() => setHtmlEditorVisible(false)}
        width="90vw"
        style={{ top: 20 }}
        zIndex={2000}
        maskClosable={false}
        data-testid="html-editor-modal"
        footer={[
          <Button key="cancel" onClick={() => setHtmlEditorVisible(false)} disabled={htmlEditorSaving}>
            Hủy
          </Button>,
          <Button 
            key="save"
            type="primary"
            loading={htmlEditorSaving}
            onClick={async () => {
              const textarea = document.getElementById('html-editor-textarea');
              if (textarea) {
                await handleSaveFromHtmlEditor(textarea.value);
              }
            }}
          >
            Cập nhật & Lưu
          </Button>
        ]}
      >
        <div className="mb-4">
          <Alert
            message={
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="font-semibold">Cẩn thận khi chỉnh sửa HTML!</span>
              </div>
            }
            description={
              <div className="text-sm">
                • <strong>Chú trọng nội dung sửa trong đây</strong> - có thể làm hỏng cấu trúc template<br/>
                • Chỉ sửa khi thực sự cần thiết và hiểu rõ HTML<br/>
                • Nên backup template trước khi thực hiện thay đổi lớn
              </div>
            }
            type="warning"
            showIcon
            className="border-yellow-300 bg-yellow-50"
          />
        </div>
        <TextArea
          id="html-editor-textarea"
          value={fullHtmlContent}
          onChange={(e) => setFullHtmlContent(e.target.value)}
          rows={25}
          style={{ 
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '12px'
          }}
          placeholder="HTML content sẽ hiển thị ở đây..."
        />
      </Modal>

      {/* Preview Modal */}
      <PreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        templateData={selectedTemplate || template}
        htmlContent={fullHtml}
        allStyles={allStyles}
        htmlHead={htmlHead}
        htmlAttributes={htmlAttributes}
        rebuildCompleteHtml={rebuildCompleteHtml}
      />

      {/* Custom Styling cho Modal */}
      <style>{`
        /* TinyMCE trong Modal */
        .ant-modal .tox-tinymce {
          border: 1px solid #d9d9d9 !important;
          border-radius: 6px !important;
        }
        
        .ant-modal .tox-toolbar-overlord {
          background: #fafafa !important;
          border-bottom: 1px solid #d9d9d9 !important;
        }
        
        .ant-modal .tox-editor-header {
          border: none !important;
          background: transparent !important;
        }
        
        .ant-modal .tox-edit-area {
          border: none !important;
        }
        
        .ant-modal .tox-statusbar {
          border-top: 1px solid #d9d9d9 !important;
          background: #fafafa !important;
        }
        
        /* Đảm bảo dropdown/popup hiển thị đúng */
        .tox-pop {
          z-index: 9999 !important;
        }
        
        .tox-dialog-wrap {
          z-index: 9999 !important;
        }
        
        /* Responsive Modal styling */
        @media (max-width: 1200px) {
          .ant-modal {
            width: 95vw !important;
            max-width: none !important;
          }
          .ant-modal-body {
            height: calc(100vh - 220px) !important;
            max-height: 700px !important;
          }
        }
        
        @media (max-width: 768px) {
          .ant-modal {
            width: 98vw !important;
            margin: 5px !important;
          }
          .ant-modal-body {
            height: calc(100vh - 180px) !important;
            padding: 12px !important;
          }
        }
        
        /* TinyMCE styling */
        .tox-tinymce {
          border-radius: 6px !important;
          border-color: #d9d9d9 !important;
          height: 100% !important;
        }
        
        .tox .tox-editor-header {
          border-radius: 6px 6px 0 0 !important;
          background: #fafafa !important;
        }
        
        .tox .tox-edit-area {
          border-radius: 0 0 6px 6px !important;
          overflow: auto !important;
        }
        
        .tox .tox-edit-area__iframe {
          height: 100% !important;
          min-height: 400px !important;
        }
        
        /* Đảm bảo nội dung editor có thể scroll */
        .tox-edit-area iframe {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        .mce-content-body {
          overflow-y: auto !important;
          overflow-x: hidden !important;
          min-height: 400px !important;
        }
        
        /* Make TinyMCE aux elements (toolbar dropdowns, menus) interactive inside modal */
        .tox-tinymce-aux {
          z-index: 10050 !important;
          pointer-events: auto !important;
        }
        
        /* Modal z-index fix for TinyMCE dialogs */
        .tox-dialog-wrap {
          z-index: 10000 !important;
        }
        
        /* Template variables styling */
        .placeholder-variable {
          background: #e6f7ff !important;
          color: #1890ff !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          font-family: "Monaco", "Consolas", monospace !important;
          font-size: 12px !important;
          border: 1px solid #91d5ff !important;
        }

        /* HTML Editor Modal z-index */
        .ant-modal[data-testid="html-editor-modal"] {
          z-index: 2000 !important;
        }
        
        .ant-modal-mask[data-testid="html-editor-modal-mask"] {
          z-index: 1999 !important;
        }
      `}</style>
    </>
  );
}

export default TemplateEditorModal;