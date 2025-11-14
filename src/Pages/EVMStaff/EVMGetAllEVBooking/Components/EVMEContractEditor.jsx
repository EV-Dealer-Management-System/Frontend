import React, { useState, useEffect, useRef } from 'react';
import { message, Modal, Button, Tabs, Typography } from 'antd';
import { EditOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import tinymce from 'tinymce/tinymce';
import { PDFUpdateService } from '../../../../App/Home/PDFconfig/PDFUpdate';
import { useEVMHtmlParser } from './useEVMHtmlParser';
import useEVMTinyEditor from './useEVMTinyEditor';

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
  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  
  // 🎯 REF ĐỂ TRÁNH LOOP
  const hasInitializedRef = useRef(false);
  
  // States cho cấu trúc phân tách như PDFEdit
  const [parsedStructure, setParsedStructure] = useState({
    headerBody: '',
    metaBlocks: '',
    signBody: '',
    footerBody: ''
  });

  const pdfUpdateService = PDFUpdateService();
  
  // 🔥 EVM CUSTOM HOOKS - DỰA TRÊN TEMPLATE EDITOR PATTERN
  const {
    parseHtmlFromBE,
    rebuildCompleteHtml,
    allStyles,
    htmlHead,
    htmlAttributes,
    headerBody,
    metaBlocks,
    signBody,
    footerBody,
    editableBody,
    updateParsedStructure,
    resetStructureStates  
  } = useEVMHtmlParser();

  const {
    editor,
    isEditorReady,
    tinyMCEConfig,
    getCurrentContent,
    setEditorContent,
    resetEditorContent,
    handleEditorInit,
    cleanupEditor
  } = useEVMTinyEditor();

  // Custom handleEditorChange để tránh bị reset
  const handleEditorChange = (content) => {
    if (isUpdatingFromCode) return; // Bỏ qua khi đang update từ code
    
    setHtmlContent(content);
    
    // Chỉ set unsaved changes nếu content khác với original
    if (content !== originalContent) {
      setHasUnsavedChanges(true);
    }
  };

  // 🔥 HANDLE CANCEL VỚI CONFIRM NẾU CÓ THAY ĐỔI
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setConfirmExitVisible(true);
    } else {
      onClose();
    }
  };
  
  // Handle confirm exit
  const handleConfirmExit = () => {
    console.log('📝 EVM: User confirmed exit with unsaved changes');
    setConfirmExitVisible(false);
    onClose();
  };
  
  // Handle cancel exit
  const handleCancelExit = () => {
    console.log('📝 EVM: User cancelled exit');
    setConfirmExitVisible(false);
  };
  


  // 🔥 Parse eContract HTML - CHỐNG LOOP HOÀN TOÀN
  useEffect(() => {
    // 🚨 STRICT CONDITIONS ĐỂ TRÁNH LOOP
    if (!visible || !eContract || !eContract.htmlTemaple || !eContract.id) {
      return;
    }
    
    // 🚨 TRÁNH PARSE LẠI NẾu ĐÃ PARSE RỒI
    if (hasInitializedRef.current) {
      console.log('🚨 EVM: Already initialized, skipping parse');
      return;
    }

    console.log('🔄 EVM: Loading eContract with Template Editor pattern...', eContract.id);

    // Set isUpdatingFromCode = true để tránh trigger hasUnsavedChanges
    setIsUpdatingFromCode(true);

    // 🔥 Parse HTML từ BE - GIỐNG NHƯ TEMPLATE EDITOR
    const rawHtml = eContract.htmlTemaple || '';
    const parsedResult = parseHtmlFromBE(rawHtml);
    
    // 🎯 CHỈ LƯU editableBody VÀO STATE - TinyMCE sẽ được sync qua useEffect khác
    const editableContent = parsedResult.editableBody || '';
    setHtmlContent(editableContent);
    setOriginalContent(editableContent);
    
    // Lưu full HTML cho Preview và HTML tab
    setFullPreviewHtml(parsedResult.fullHtml || rawHtml);
    
    // Lưu cấu trúc phân tách - GIỐNG TEMPLATE EDITOR
    setParsedStructure({
      headerBody: parsedResult.headerBody || '',
      metaBlocks: parsedResult.metaBlocks || '',
      signBody: parsedResult.signBody || '',
      footerBody: parsedResult.footerBody || ''
    });
    
    // Lưu structure vào hook state - GIỐNG TEMPLATE EDITOR
    updateParsedStructure(parsedResult);
    
    console.log('🔄 EVM: Template loaded:');
    console.log('- Full HTML length:', rawHtml.length);
    console.log('- Editable body length:', editableContent.length);
    console.log('- Meta blocks length:', parsedResult.metaBlocks?.length || 0);

    // Cache window variables như PDFEdit
    window.__PDF_TEMPLATE_CACHE__ = {
      allStyles: parsedResult.allStyles,
      htmlHead: parsedResult.htmlHead,
      htmlAttributes: parsedResult.htmlAttributes
    };
    
    // NOTE: Không gọi setEditorContent ở đây - sẽ được sync qua useEffect với editableBody
    
    // Reset hasUnsavedChanges sau khi load xong
    setTimeout(() => {
      setHasUnsavedChanges(false);
      setIsUpdatingFromCode(false);
      // ✅ ĐÁNH DẤU ĐÃ PARSE XONG ĐỂ TRÁNH PARSE LẠI
      hasInitializedRef.current = true;
      console.log('✅ EVM: Parse completed - flag set to true');
    }, 300);
  }, [visible, eContract?.id]); // CHỈ DEPEND VÀO visible và eContract.id

  // 🎯 REF RIÊNG CHO EDITOR SYNC
  const editorSyncedRef = useRef(false);
  
  // 🎯 Sync TinyMCE với editableBody - CHỐNG LOOP HOÀN TOÀN
  useEffect(() => {
    console.log('🔍 EVM: Sync useEffect called:', {
      isEditorReady,
      hasEditableBody: !!editableBody,
      editorSynced: editorSyncedRef.current
    });
    
    // CHỈ CHẠY MỘT LẦN DUY NHẤT KHI EDITOR READY VÀ CÓ CONTENT
    if (isEditorReady && editableBody && !editorSyncedRef.current) {
      console.log('🔄 EVM: Syncing TinyMCE with editableBody (ONE TIME ONLY):', editableBody.length);
      
      // 🎨 INJECT STYLES TỪ HTML GỐC VÀO EDITOR
      const externalStyles = allStyles || window.__PDF_TEMPLATE_CACHE__?.allStyles || '';
      console.log('🎨 EVM: Injecting styles:', externalStyles.length, 'chars');
      
      setEditorContent(editableBody, externalStyles);
      editorSyncedRef.current = true;
      console.log('✅ EVM: Editor synced - flag set to true');
    }
  }, [isEditorReady, editableBody]); // CHỈ isEditorReady và editableBody

  // 🎯 KEYBOARD SHORTCUT CHO SAVE (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving) {
          console.log('💾 EVM: Keyboard shortcut save triggered');
          handleSave();
        }
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, hasUnsavedChanges, saving]);

  // Handle save theo PDFEdit pattern
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // 🔥 Rebuild HTML hoàn chỉnh - SỬ DỤNG EVM PATTERN
      const currentContent = getCurrentContent ? getCurrentContent() : htmlContent;
      const completeHtml = rebuildCompleteHtml({
        editableBody: currentContent,
        headerBody: headerBody || parsedStructure.headerBody,
        metaBlocks: metaBlocks || parsedStructure.metaBlocks,
        signBody: signBody || parsedStructure.signBody,
        footerBody: footerBody || parsedStructure.footerBody,
        subject: eContract.name || `EContract_${eContract.id?.slice(0, 8)}`,
        externalAllStyles: window.__PDF_TEMPLATE_CACHE__?.allStyles || allStyles
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
  // ✅ Reset states khi đóng modal - CLEANUP HOÀN TOÀN
  useEffect(() => {
    if (!visible) {
      setHasUnsavedChanges(false);
      resetStructureStates();
      resetEditorContent();
      cleanupEditor(); // 🔥 CLEANUP EDITOR ĐỂ TRÁNH LOOP
      setHtmlContent('');
      setOriginalContent('');
      setFullPreviewHtml('');
      setIsUpdatingFromCode(false);
      setActiveTab('editor');
      setConfirmExitVisible(false);
      hasInitializedRef.current = false; // Reset parse flag
      editorSyncedRef.current = false; // Reset editor sync flag
    }
  }, [visible]); // CHỈ DEPEND VÀO visible

  if (!eContract || !visible) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-blue-500" />
          <span>Chỉnh sửa Hợp đồng - EVMStaff</span>
          {hasUnsavedChanges && (
            <span className="text-orange-500 text-sm font-bold">●</span>
          )}
          <Text type="secondary" className="text-sm">
            (Chỉ được sửa điều lệ)
          </Text>
          {hasUnsavedChanges && (
            <Text type="warning" className="text-xs">
              - Có thay đổi chưa lưu
            </Text>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width="90vw"
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={hasUnsavedChanges ? 'animate-pulse' : ''}
        >
          {hasUnsavedChanges ? 'Lưu thay đổi' : 'Đã lưu'}
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
                  {/* 🔥 EVM TinyMCE Editor với Table Support */}
                  <div style={{ flex: 1, height: '600px' }}>
                    <Editor
                      apiKey="your_api_key"
                      key={`evm-editor-${eContract?.id}-${visible}`}
                      tinymce={tinymce}
                      value={htmlContent}
                      init={{
                        ...tinyMCEConfig,
                        height: '100%',
                        min_height: 500,
                        readonly: false,
                        disabled: false
                      }}
                      onEditorChange={handleEditorChange}
                      onInit={handleEditorInit}
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
      
      {/* Confirm Exit Modal */}
      <Modal
        title="Xác nhận thoát"
        open={confirmExitVisible}
        onOk={handleConfirmExit}
        onCancel={handleCancelExit}
        okText="Thoát"
        cancelText="Hủy"
        okType="danger"
        centered
      >
        <p>Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?</p>
      </Modal>
    </Modal>
  );
};

export default EVMEContractEditor;