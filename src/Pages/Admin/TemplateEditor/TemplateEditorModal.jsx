import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Button,
  Typography,
  Space,
  Spin,
  message,
  App,
  Input,
  Alert
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  ReloadOutlined,
  CodeOutlined,
  WarningOutlined
} from '@ant-design/icons';

import TinyMCETemplateEditor from './TinyMCETemplateEditor';
import PreviewModal from './PreviewModal';
import HtmlEditorModal from './HtmlEditorModal';

const { Title, Text } = Typography;
const { TextArea } = Input;


const TemplateEditorModal = ({ 
  visible, 
  template, 
  onClose, 
  onSave 
}) => {
  const { message: messageApi, modal } = App.useApp();
  
  //  Local state
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  //  Load template content when modal opens (prevent loops)
  useEffect(() => {
    if (visible && template?.contentHtml && template.contentHtml !== content) {
      console.log('🔄 [MODAL] Loading new template:', {
        templateId: template.templateId,
        templateName: template.templateName,
        contentLength: template.contentHtml.length,
        contentPreview: template.contentHtml.substring(0, 200) + '...'
      });
      setContent(template.contentHtml);
      setHasUnsavedChanges(false);
    }
  }, [visible, template?.contentHtml]); // More specific dependency

  //  Handle content change from TinyMCE with debouncing
  const handleContentChange = useCallback((newContent) => {
    // Prevent infinite loops by checking if content actually changed AND significant difference
    const lengthDiff = Math.abs((newContent?.length || 0) - (content?.length || 0));
    
    if (newContent !== content && lengthDiff > 10) { // Chỉ update nếu thay đổi đáng kể
      console.log('📝 [MODAL] Content changed by user:', {
        oldLength: content?.length || 0,
        newLength: newContent?.length || 0,
        lengthDiff
      });
      setContent(newContent);
      setHasUnsavedChanges(true);
    }
  }, [content]);



  //  Save template
  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      messageApi.info('Không có thay đổi để lưu');
      return;
    }

    setIsSaving(true);
    
    try {
      // Use TinyMCE content
      const finalContent = content;
      
      if (!finalContent || !finalContent.trim()) {
        messageApi.error('Nội dung không được để trống');
        return;
      }

      console.log('🚀 Saving template with content length:', finalContent.length);
      
      // Call parent save function with template ID and content
      await onSave?.(template.templateId, finalContent);
      
      setHasUnsavedChanges(false);
      messageApi.success('✅ Template đã được lưu thành công!');
      
    } catch (error) {
      console.error('❌ Save error:', error);
      messageApi.error('❌ Lỗi khi lưu template: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };



  //  Reset content to original
  const handleReset = () => {
    if (template?.contentHtml) {
      setContent(template.contentHtml);
      setHasUnsavedChanges(false);
      messageApi.info('🔄 Đã khôi phục nội dung gốc');
    }
  };

  // 👁️ Preview handler
  const handlePreview = () => {
    setShowPreview(true);
  };

  // 🚪 Close modal with App context
  const handleClose = () => {
    if (hasUnsavedChanges) {
      // Use App.useApp() modal instead of static Modal.confirm
      modal.confirm({
        title: '⚠️ Có thay đổi chưa được lưu',
        content: 'Bạn có muốn lưu thay đổi trước khi đóng?',
        okText: '💾 Lưu và đóng',
        cancelText: '🚪 Đóng không lưu',
        onOk: async () => {
          try {
            await handleSave();
            onClose?.();
          } catch (error) {
            // Error already handled in handleSave
          }
        },
        onCancel: () => {
          onClose?.();
        }
      });
    } else {
      onClose?.();
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-3">
            <Title level={4} className="m-0">
              <SaveOutlined/> Template Editor - {template?.name || 'Unknown'}
            </Title>
            {hasUnsavedChanges && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                <WarningOutlined /> Chưa lưu
              </span>
            )}
          </div>
        }
        open={visible}
        onCancel={handleClose}
        width="98vw"
        styles={{
          body: { 
            height: '80vh', 
            padding: '12px',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        footer={
          <div className="flex justify-between items-center">  
            <div className="flex gap-2">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
              >
                Khôi phục
              </Button>
              <Button 
                icon={<EyeOutlined />} 
                onClick={handlePreview}
              >
                Xem trước
              </Button>
              <Button 
                type="dashed"
                icon={<CodeOutlined />}
                onClick={() => setShowHtmlEditor(true)}
              >
                Chỉnh sửa HTML
              </Button>
              <Button onClick={handleClose}>
                Đóng
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={isSaving}
                disabled={!hasUnsavedChanges}
              >
                Lưu Template
              </Button>
            </div>
          </div>
        }
      >
        <div className="h-full flex flex-col">
          {/* Alert cảnh báo */}
          <Alert
            type="warning"
            showIcon
            message="⚠️ Lưu ý quan trọng khi chỉnh sửa Template"
            description={
              <div className="space-y-1">
                <div>• <strong>Modal này chỉ cho phép sửa những điều khoản</strong> trong template</div>
                <div>• <strong>Placeholders</strong> ({"{{text}}"}, {"${text}"}) được bảo vệ</div>
                <div>• <strong>Nếu muốn sửa chi tiết</strong> (header, footer, cấu trúc) vui lòng sử dụng chức năng "Chỉnh sửa HTML" bên dưới</div>
              </div>
            }
            className="mb-4"
          />
          
          {/* TinyMCE Editor */}
          <div className="flex-1">
            <TinyMCETemplateEditor
              key={`template-${template?.templateId || template?.id || 'default'}`} 
              content={content}
              onContentChange={handleContentChange}
              height="calc(90vh - 300px)"
            />
          </div>
          
         
        </div>
      </Modal>

      {/* HTML Editor Modal */}
      <HtmlEditorModal
        visible={showHtmlEditor}
        template={template}
        onClose={() => setShowHtmlEditor(false)}
        onSave={async (templateId, htmlContent) => {
          try {
            // Call parent onSave which will handle API call, close modals, and reload
            await onSave?.(templateId, htmlContent);
          } catch (error) {
            throw error; // Let HtmlEditorModal handle the error
          }
        }}
      />
      
      {/* Preview Modal */}
      <PreviewModal
        visible={showPreview}
        onClose={() => setShowPreview(false)}
        templateData={template}
        htmlContent={content}
        allStyles={""}
        htmlHead={""}
        htmlAttributes={""}
        rebuildCompleteHtml={undefined}
      />
    </>
  );
};

export default TemplateEditorModal;