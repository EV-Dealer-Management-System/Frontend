import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import { 
  Modal, 
  Button, 
  Card, 
  Space, 
  Spin, 
  Typography,
  Row,
  Col,
  Input,
  Tabs
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  EyeOutlined,
  FileTextOutlined,
  CodeOutlined,
  EditFilled
} from '@ant-design/icons';

import { useTinyEditor } from './useTinyEditor';
import { useHtmlParser } from './useHtmlParser';
import { useTemplateActions } from './useTemplateActions';

const { Title, Text } = Typography;
const { TextArea } = Input;

// PDF Template Editor Main Component
function PDFEditMain({
  contractId,
  contractNo,
  visible = false,
  onSave,
  onCancel
}) {
  // States cơ bản
  const [htmlContent, setHtmlContent] = useState(''); // chỉ chứa editableBody cho TinyMCE
  const [originalContent, setOriginalContent] = useState('');
  const [contractSubject, setContractSubject] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdatingFromCode, setIsUpdatingFromCode] = useState(false);
  const [fullPreviewHtml, setFullPreviewHtml] = useState(''); // full HTML cho Preview và HTML tab
  
  // States mới cho cấu trúc phân tách
  const [parsedStructure, setParsedStructure] = useState({
    headerBody: '',
    metaBlocks: '',
    signBody: '',
    footerBody: ''
  });


  // Custom hooks
  const {
    parseHtmlFromBE,        // ✅ đúng tên hàm trong hook
  rebuildCompleteHtml,
  allStyles,
  htmlHead,
  htmlAttributes,
  updateParsedStructure,  // ✅ cần thêm vì bạn đang gọi trong code
  resetStructureStates  
  } = useHtmlParser();

  const {
    resetQuillContent,
    getCurrentContent,
    tinyMCEConfig,
    handleEditorChange
  } = useTinyEditor(visible, htmlContent, setHasUnsavedChanges, isUpdatingFromCode);

  const {
    loading,
    saveLoading,
    templateData,
    templateLoaded,
    handleSave,
    handleReset,
    handleClose,
    handleForceClose,
    loadTemplate,
    resetStates,
    setTemplateData,
    setTemplateLoaded,
    contextHolder
  } = useTemplateActions(
    contractId,
    contractNo,
    visible,
    onSave,
    onCancel,
    htmlContent,
    setHtmlContent,
    originalContent,
    setOriginalContent,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    getCurrentContent,
    rebuildCompleteHtml,
    contractSubject,
    allStyles,
    parsedStructure  // truyền parsedStructure thay vì signContent và headerContent
  );

  useEffect(() => {
    window.__UPDATE_HTML_CONTENT__ = (newHtml) => {
      setHtmlContent(newHtml);
    };
    return () => {
      delete window.__UPDATE_HTML_CONTENT__;
    };
  }, []);

  // ✅ Parse template khi templateData thay đổi - Fix race condition
  useEffect(() => {
    if (!visible || !templateData) return;

    // Parse HTML từ BE - tách các phần rõ ràng
    const rawHtml = templateData.htmlTemplate || '';
    const parsedResult = parseHtmlFromBE(rawHtml);
    
    // Set editableBody cho TinyMCE Editor
    setHtmlContent(parsedResult.editableBody || '');
    setOriginalContent(parsedResult.editableBody || '');
    
    // Set fullHtml cho Preview và HTML tab
    setFullPreviewHtml(parsedResult.fullHtml || rawHtml);
    
    // Lưu cấu trúc phân tách
    setParsedStructure({
      headerBody: parsedResult.headerBody || '',
      metaBlocks: parsedResult.metaBlocks || '',
      signBody: parsedResult.signBody || '',
      footerBody: parsedResult.footerBody || ''
    });
    
    // Lưu structure vào state
    updateParsedStructure(parsedResult);

    window.__PDF_TEMPLATE_CACHE__ = {
      allStyles: parsedResult.allStyles,
      htmlHead: parsedResult.htmlHead,
      htmlAttributes: parsedResult.htmlAttributes
    }
    
    setContractSubject(templateData.name);

    // ✅ Ghi log an toàn
    console.log('✅ Template parsed successfully from templateData');
    console.log('- Editable body length:', parsedResult.editableBody?.length || 0);
    console.log('- Template body length:', parsedResult.templateBody?.length || 0);
    console.log('- All styles length:', parsedResult.allStyles?.length || 0);
  }, [visible, templateData]);

  // Reset editor khi tạo contract mới
  useEffect(() => {
    if (visible && !contractId) {
      resetEditor(true); // FIX: Reset content khi tạo contract mới
    }
  }, [visible, contractId]);

  // Reset editor hoàn toàn - FIX: Chỉ reset khi thực sự cần
  const resetEditor = (shouldResetContent = false) => {
    console.log('Resetting editor, shouldResetContent:', shouldResetContent);
    
    // Reset workflow states
    setHasUnsavedChanges(false);
    
    // Chỉ reset content khi thực sự cần (ví dụ sau khi hoàn tất hợp đồng)
    if (shouldResetContent) {
      setHtmlContent('');
      setOriginalContent('');
      setContractSubject('');
      setFullPreviewHtml('');
      setParsedStructure({
        headerBody: '',
        metaBlocks: '',
        signBody: '',
        footerBody: ''
      });
      setTemplateData(null);
      setTemplateLoaded(false); // ✅ Reset flag để cho phép load lại template
      
      // ✅ Reset HTML structure states
      resetStructureStates();
      
      // Clear TinyMCE content
      resetQuillContent(); // Alias function - works for TinyMCE too
    }
  };

  // ✅ Reset states khi modal đóng
  useEffect(() => {
    if (!visible) {
      // Reset các flag và states
      setIsUpdatingFromCode(false);
      resetStates();
      
      console.log('✅ Modal closed → Reset all states + cleanup');
    }
  }, [visible]);

  // ✅ TinyMCE CSS - Chỉ cần minimal styling vì TinyMCE tự handle
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      /* TinyMCE container styling */
      .tox-tinymce {
        border-radius: 6px !important;
        border-color: #d1d5db !important;
      }
      
      .tox .tox-editor-header {
        border-radius: 6px 6px 0 0 !important;
      }
      
      .tox .tox-edit-area {
        border-radius: 0 0 6px 6px !important;
      }
      
      /* Modal z-index fix for TinyMCE dialogs */
      .tox-dialog-wrap {
        z-index: 10000 !important;
      }
      
      /* Prevent aux overlay from blocking editor */
      .tox-tinymce-aux {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <EditOutlined className="mr-2" />
            Chỉnh sửa Template Hợp đồng - {contractNo}
          </span>
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                ⚠️ Có thay đổi chưa lưu
              </span>
            )}
            <Text type="secondary" className="text-sm">
              {templateData?.code}
            </Text>
          </div>
        </div>
      }
      open={visible}
      maskClosable={false}
      keyboard={false}
      onCancel={handleClose}
      width="95vw"
      style={{ top: 20 }}
      styles={{
        body: { 
          height: 'calc(100vh - 150px)', 
          padding: '16px',
          overflow: 'auto'
        }
      }}
      footer={null}
      forceRender
      destroyOnHidden={false}
    >
      {contextHolder}
      <div className="h-full flex flex-col">
        {/* Toolbar với workflow buttons */}
        <Card className="mb-4" size="small">
          <Row gutter={[16, 8]} align="middle">
            <Col>
              <Space className="flex flex-wrap">
                {/* Save Changes Button */}
                <Button 
                  type="primary" 
                  icon={saveLoading ? <Spin size="small" /> : <SaveOutlined />}
                  onClick={handleSave}
                  loading={saveLoading}
                  disabled={!hasUnsavedChanges}
                  className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                >
                  {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                
                {/* Reset Button */}
                <Button 
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                  className="border-gray-300 hover:border-orange-500"
                >
                  Khôi phục
                </Button>
              </Space>
            </Col>

            {/* Status Display */}
            <Col>
              {hasUnsavedChanges && (
                <div className="flex items-center text-yellow-600">
                  <EditOutlined className="mr-1" />
                  <span>Có thay đổi chưa lưu</span>
                </div>
              )}
              {!hasUnsavedChanges && (
                <div className="flex items-center text-gray-500">
                  <span>Sẵn sàng lưu</span>
                </div>
              )}
            </Col>

            <Col flex="auto" />
          </Row>
        </Card>

        {/* Content Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded">
            <Spin size="large" tip="Đang tải template..." />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="h-full"
              type="card"
              items={[
                {
                  key: 'editor',
                  label: (
                    <span>
                      <EditFilled />
                      Chỉnh sửa nội dung
                    </span>
                  ),
                  children: (
                    <div 
                      className="h-full relative" 
                      style={{ 
                        height: 'calc(100vh - 300px)', 
                        minHeight: '500px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* ✅ TinyMCE Editor - Full height modal */}
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <Editor
                          tinymce={tinymce}       // ✅ truyền instance local
                          value={htmlContent}
                          init={{
                            ...tinyMCEConfig,
                            height: '100%'
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
                    <span>
                      <EyeOutlined />
                      Xem trước
                    </span>
                  ),
                  children: (
                    <div
                      style={{
                        height: 'calc(100vh - 300px)',
                        overflowY: 'auto',
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        padding: 16,
                        fontFamily: 'Noto Sans, DejaVu Sans, Arial, sans-serif',
                        fontSize: '12pt',
                        lineHeight: '1.4'
                      }}
                    >
                      {/* ✅ Preview hiển thị full HTML đầy đủ */}
                      <div dangerouslySetInnerHTML={{ 
                        __html: fullPreviewHtml || rebuildCompleteHtml({
                          editableBody: htmlContent,
                          headerBody: parsedStructure.headerBody,
                          metaBlocks: parsedStructure.metaBlocks,
                          signBody: parsedStructure.signBody,
                          footerBody: parsedStructure.footerBody,
                          subject: contractSubject,
                          externalAllStyles: allStyles
                        })
                      }} />
                    </div>
                  )
                },
              ]}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PDFEditMain;
