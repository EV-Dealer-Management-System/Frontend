import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Alert,
  message,
  Space,
  Typography,
  App
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  CodeOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;


// ========================================
// 🎯 HTML EDITOR MODAL - STANDALONE
// ========================================

const HtmlEditorModal = ({ 
  visible, 
  template, 
  onClose, 
  onSave 
}) => {
  const { modal } = App.useApp();
  
  const [htmlContent, setHtmlContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load template content when modal opens
  useEffect(() => {
    if (visible && template?.contentHtml) {
      setHtmlContent(template.contentHtml);
      setOriginalContent(template.contentHtml);
      setHasChanges(false);
    }
  }, [visible, template]);

  // Handle HTML content change
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    setHasChanges(newContent !== originalContent);
  };

  // Handle save HTML
  const handleSave = async () => {
    if (!hasChanges) {
      message.info('Không có thay đổi để lưu');
      return;
    }

    if (!htmlContent.trim()) {
      message.error('Nội dung HTML không được để trống');
      return;
    }

    if (!template) {
      message.error('Không tìm thấy thông tin template');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Saving HTML content...');
      
      // Call parent onSave function 
      const templateId = template.templateId || template.id || template.code;
      await onSave(templateId, htmlContent);
      
      // Reset changes and close this modal after successful save
      setHasChanges(false);
      message.success('✅ Đã lưu HTML thành công!');
      
      // Close HTML modal immediately after successful save
      onClose();
      
    } catch (error) {
      console.error('❌ Save HTML error:', error);
      message.error('❌ Lỗi khi lưu HTML: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset content
  const handleReset = () => {
    setHtmlContent(originalContent);
    setHasChanges(false);
    message.info('🔄 Đã khôi phục nội dung gốc');
  };

  // Handle close
  const handleClose = () => {
    if (hasChanges) {
      modal.confirm({
        title: '⚠️ Có thay đổi chưa được lưu',
        content: 'Bạn có muốn lưu thay đổi trước khi đóng?',
        okText: '💾 Lưu và đóng',
        cancelText: '🚪 Đóng không lưu',
        zIndex: 3000, // Higher than HTML modal (2500)
        onOk: handleSave,
        onCancel: () => {
          setHasChanges(false);
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CodeOutlined className="text-blue-500" />
          <Title level={4} className="mb-0">
            🔧 HTML Source Editor
          </Title>
          {template && (
            <Text type="secondary" className="text-sm">
              - {template.name}
            </Text>
          )}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      width="90vw"
      style={{ top: 20 }}
      styles={{
        body: { height: 'calc(90vh - 120px)', padding: '16px' }
      }}
      destroyOnClose={true}
      zIndex={2500} // Higher than main modal to overlay on top
      footer={
        <div className="flex justify-between items-center">
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={!hasChanges}
            >
              Reset
            </Button>
          </Space>
          
          <Space>
            <Button 
              icon={<CloseOutlined />}
              onClick={handleClose}
            >
              Đóng
            </Button>
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
              disabled={!hasChanges}
            >
              Lưu HTML
            </Button>
          </Space>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        <Alert
          message="🔧 HTML Source Editor - Chỉnh sửa cẩn thận"
          description={
            <div className="space-y-1">
              <div>• <strong>Vui lòng chỉnh sửa một cách cẩn thận</strong> để không làm hỏng cấu trúc template</div>
              <div>• <strong>Bảo toàn các class CSS</strong>: .non-editable-header, .meta-block, .section-title, .sign-block, .footer</div>
              <div>• <strong>Không xóa thẻ &lt;head&gt;</strong> và các style CSS quan trọng</div>
              <div>• Lưu thành công sẽ tự động đóng và reload danh sách template</div>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
        
        <div className="flex-1">
          <TextArea
            value={htmlContent}
            onChange={handleContentChange}
            placeholder="Nhập HTML code..."
            className="font-mono text-sm h-full resize-none"
            style={{ 
              height: '100%',
              minHeight: 'calc(80vh - 250px)'
            }}
          />
        </div>
        
        {hasChanges && (
          <Alert
            message="⚠️ Có thay đổi chưa được lưu"
            type="warning"
            showIcon
            className="mt-3"
          />
        )}
      </div>
    </Modal>
  );
};

export default HtmlEditorModal;