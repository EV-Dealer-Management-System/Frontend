import React, { useState, useEffect } from 'react';
import { message, Modal, Button, Tabs, Typography } from 'antd';
import { EditOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import { PDFUpdateService } from '../../../../App/Home/PDFconfig/PDFUpdate';
import { useHtmlParser } from '../../../Admin/SignContract/Components/PDF/PDFEdit/useHtmlParser';
import { useTinyEditor } from '../../../Admin/SignContract/Components/PDF/PDFEdit/useTinyEditor';

const { Title, Text } = Typography;

// EVMStaff-specific eContract editor với quyền hạn hạn chế - sử dụng PDFEdit pattern
const EVMEContractEditor = ({ 
  visible, 
  onClose, 
  eContract,
  onSaveSuccess 
}) => {
  // States theo PDFEdit pattern
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [htmlContent, setHtmlContent] = useState(''); // chỉ editable body cho TinyMCE
  const [originalContent, setOriginalContent] = useState('');
  const [fullPreviewHtml, setFullPreviewHtml] = useState(''); // full HTML cho preview
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdatingFromCode, setIsUpdatingFromCode] = useState(false);
  
  // States cho cấu trúc phân tách như PDFEdit
  const [parsedStructure, setParsedStructure] = useState({
    headerBody: '',
    metaBlocks: '',
    signBody: '',
    footerBody: ''
  });

  const pdfUpdateService = PDFUpdateService();
  
  // Custom hooks từ PDFEdit - sử dụng đúng pattern
  const {
    parseHtmlFromBE,
    rebuildCompleteHtml,
    allStyles,
    htmlHead,
    htmlAttributes,
    updateParsedStructure,
    resetStructureStates  
  } = useHtmlParser();

  const {
    resetQuillContent,
    getCurrentContent,
    tinyMCEConfig
  } = useTinyEditor(visible, htmlContent, setHasUnsavedChanges, isUpdatingFromCode);

  // Custom handleEditorChange để tránh bị reset
  const handleEditorChange = (content) => {
    if (isUpdatingFromCode) return; // Bỏ qua khi đang update từ code
    
    setHtmlContent(content);
    
    // Chỉ set unsaved changes nếu content khác với original
    if (content !== originalContent) {
      setHasUnsavedChanges(true);
    }
  };
  


  // Parse eContract HTML theo PDFEdit pattern - giống hệt TemplateData processing
  useEffect(() => {
    if (!visible || !eContract || !eContract.htmlTemaple) return;

    // Set isUpdatingFromCode = true để tránh trigger hasUnsavedChanges
    setIsUpdatingFromCode(true);

    // Parse HTML từ BE - tách các phần rõ ràng như PDFEdit
    const rawHtml = eContract.htmlTemaple || '';
    const parsedResult = parseHtmlFromBE(rawHtml);
    
    // Set editableBody cho TinyMCE Editor như PDFEdit
    const editableContent = parsedResult.editableBody || '';
    setHtmlContent(editableContent);
    setOriginalContent(editableContent);
    
    // Set fullHtml cho Preview và HTML tab như PDFEdit
    setFullPreviewHtml(parsedResult.fullHtml || rawHtml);
    
    // Lưu cấu trúc phân tách như PDFEdit
    setParsedStructure({
      headerBody: parsedResult.headerBody || '',
      metaBlocks: parsedResult.metaBlocks || '',
      signBody: parsedResult.signBody || '',
      footerBody: parsedResult.footerBody || ''
    });
    
    // Lưu structure vào hook state như PDFEdit
    updateParsedStructure(parsedResult);

    // Cache window variables như PDFEdit
    window.__PDF_TEMPLATE_CACHE__ = {
      allStyles: parsedResult.allStyles,
      htmlHead: parsedResult.htmlHead,
      htmlAttributes: parsedResult.htmlAttributes
    };
    
    // Reset hasUnsavedChanges sau khi load xong
    setTimeout(() => {
      setHasUnsavedChanges(false);
      setIsUpdatingFromCode(false);
    }, 300);
  }, [visible, eContract]);



  // Handle save theo PDFEdit pattern
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Rebuild complete HTML như PDFEdit - sử dụng getCurrentContent để lấy content từ TinyMCE
      const currentContent = getCurrentContent ? getCurrentContent() : htmlContent;
      const completeHtml = rebuildCompleteHtml({
        editableBody: currentContent,
        headerBody: parsedStructure.headerBody,
        metaBlocks: parsedStructure.metaBlocks,
        signBody: parsedStructure.signBody,
        footerBody: parsedStructure.footerBody,
        subject: eContract.name || `EContract_${eContract.id?.slice(0, 8)}`,
        externalAllStyles: allStyles // sử dụng styles từ hook
      });
      
      // Call API để update
      const result = await pdfUpdateService.updateEContract(
        eContract.id,
        completeHtml,
        eContract.name || `EContract_${eContract.id.slice(0, 8)}`
      );
      
      if (result.success) {
        message.success('Đã lưu thay đổi hợp đồng thành công!');
        setHasUnsavedChanges(false);
        
        if (onSaveSuccess) {
          onSaveSuccess({
            success: true,
            data: result.data
          });
        }
        
        setTimeout(() => onClose(), 1500);
      } else {
        throw new Error(result.message || 'Lỗi khi lưu hợp đồng');
      }
      
    } catch (error) {
      console.error('❌ EVMStaff save error:', error);
      message.error('Có lỗi khi lưu hợp đồng. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  // Reset editor khi modal đóng - theo PDFEdit pattern
  useEffect(() => {
    if (!visible) {
      // Reset states khi modal đóng
      setHtmlContent('');
      setOriginalContent('');
      setFullPreviewHtml('');
      setHasUnsavedChanges(false);
      setIsUpdatingFromCode(false);
      setActiveTab('editor');
    }
  }, [visible]);

  if (!eContract || !visible) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-blue-500" />
          <span>Chỉnh sửa Hợp đồng - EVMStaff</span>
          <Text type="secondary" className="text-sm">
            (Chỉ được sửa điều lệ)
          </Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="90vw"
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
        >
          Lưu thay đổi
        </Button>
      ]}
    >
      <div className="h-[85vh] flex flex-col">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="flex-1"
          items={[
            {
              key: 'editor',
              label: (
                <span className="flex items-center gap-2">
                  <EditOutlined />
                  Chỉnh sửa Điều lệ
                </span>
              ),
              children: (
                <div className="h-[75vh] border rounded flex flex-col">
                  {/* TinyMCE Editor - sử dụng pattern từ PDFEdit */}
                  <div style={{ flex: 1, height: '600px' }}>
                    <Editor
                      key={`editor-${eContract?.id}-${visible}`}
                      tinymce={tinymce}
                      value={htmlContent}
                      init={{
                        ...tinyMCEConfig,
                        height: '100%',
                        min_height: 500
                      }}
                      onEditorChange={handleEditorChange}
                      disabled={false}
                    />
                  </div>
                </div>
              )
            },
            {
              key: 'preview',
              label: (
                <span className="flex items-center gap-2">
                  <EyeOutlined />
                  Xem trước toàn bộ
                </span>
              ),
              children: (
                <div className="h-[75vh] overflow-y-auto border rounded p-4 bg-white">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: fullPreviewHtml || rebuildCompleteHtml({
                        editableBody: htmlContent,
                        headerBody: parsedStructure.headerBody,
                        metaBlocks: parsedStructure.metaBlocks,
                        signBody: parsedStructure.signBody,
                        footerBody: parsedStructure.footerBody,
                        subject: eContract?.name || 'Preview',
                        externalAllStyles: allStyles
                      })
                    }}
                    style={{ 
                      fontFamily: 'Noto Sans, DejaVu Sans, Arial, sans-serif',
                      fontSize: '12pt',
                      lineHeight: 1.45
                    }}
                  />
                </div>
              )
            }
          ]}
        />
        
        {hasUnsavedChanges && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            ⚠️ Bạn có thay đổi chưa lưu
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EVMEContractEditor;