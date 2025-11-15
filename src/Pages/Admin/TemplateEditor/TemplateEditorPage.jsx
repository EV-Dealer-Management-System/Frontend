import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Typography,
  Space,
  Input,
  Tag,
  Tooltip,
  message,
  App
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import viVN from 'antd/es/locale/vi_VN';
import { PageContainer } from '@ant-design/pro-components';
import AdminLayout from '../../../Components/Admin/AdminLayout';
import PreviewModal from './PreviewModal';
import TemplateEditorModal from './TemplateEditorModal';
import { getAllTemplates, updateTemplate } from '../../../App/Admin/TemplateEditor';

const { Title, Text } = Typography;
const { Search } = Input;


function TemplateEditorPage() {
  const { modal } = App.useApp();
  
  // Guard chống fetch lặp React 19
  const fetchedRef = useRef(false);
  
  // States cho UI
  const [searchText, setSearchText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Local state management
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load templates from API
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      console.log(' Fetching templates from API...');
      const response = await getAllTemplates();
      
      if (response?.success && response?.data) {
        setTemplates(response.data);
        console.log(' Templates loaded:', response.data.length, 'items');
      } else {
        console.error(' Failed to fetch templates:', response?.message);
        message.error('Không thể tải danh sách template: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error(' Fetch templates error:', error);
      message.error('Lỗi khi tải template: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTemplates();
  }, []);

  // ✅ Filter templates theo search
  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    template.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  // ✅ Handle edit template
  const handleEdit = (template) => {
    console.log('📝 Opening editor for template:', template.name);
    setSelectedTemplate(template);
    setEditorVisible(true);
  };

  // ✅ Handle preview template
  const handlePreview = (template) => {
    console.log('👁 Opening preview for template:', template.name);
    setSelectedTemplate(template);
    setPreviewVisible(true);
  };

  // ✅ Handle save template via API
  const handleSaveTemplate = async (templateId, content) => {
    if (!selectedTemplate) {
      throw new Error('No template selected');
    }
    
    // Handle both old (content) and new (templateId, content) parameter formats
    if (typeof templateId === 'string' && !content) {
      content = templateId; // Old format: just content
    }
    
    if (!content) {
      throw new Error('No content provided');
    }
    
    try {
      console.log(' Saving template via API:', selectedTemplate.name, 'Content length:', content.length);
      
      const response = await updateTemplate(
        selectedTemplate.code,
        selectedTemplate.name,
        content
      );
      
      if (response?.success) {
        console.log(' Template saved successfully');
        
        // Update local state
        setTemplates(prev => prev.map(t => 
          t.code === selectedTemplate.code 
            ? { ...t, contentHtml: content }
            : t
        ));
        
        return response;
      } else {
        throw new Error(response?.message || 'Save failed');
      }
    } catch (error) {
      console.error(' Save template error:', error);
      throw error;
    }
  };

  // ✅ Handle close editor modal
  const handleEditorClose = () => {
    setEditorVisible(false);
    setSelectedTemplate(null);
    // Refresh templates sau khi đóng modal (có thể đã save)
    fetchTemplates();
  };

  // ✅ Table columns configuration
  const columns = [
    {
      title: 'Template Name',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800 mb-1">{text}</div>
          
        </div>
      ),
    },
    {
        title: 'Template Code',
        dataIndex: 'code',
        key: 'code',
        width: '25%',
        render: (_, record) => (
          <div>
              {record.code}
          </div>
        )
    },
    {
      title: 'Content Size',
      dataIndex: 'contentHtml',
      key: 'size',
      width: '15%',
      align: 'center',
      render: (content) => (
        <div className="text-center">
          <div className="font-mono text-sm text-gray-700">
            {(content?.length || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">characters</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '25%',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa template">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Sửa
            </Button>
          </Tooltip>
          
          <Tooltip title="Xem trước template">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
              className="border-green-400 text-green-600 hover:border-green-500 hover:text-green-700"
            >
              Xem
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
    <Layout className="min-h-screen bg-gray-50">
      
      <PageContainer
        title="Quản lý Template Hợp đồng"
        subTitle="Danh sách và chỉnh sửa các template hợp đồng điện tử"
        extra={[
          <Button 
            key="refresh" 
            icon={<ReloadOutlined />} 
            onClick={fetchTemplates}
            loading={loading}
            className="border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          >
            Tải lại
          </Button>,
          
        ]}
      >
        
        {/* Search & Filter Bar */}
        <Card className="mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileTextOutlined className="text-blue-500" />
                <span className="font-medium text-gray-700">Tìm kiếm Template:</span>
              </div>
              <Search
                placeholder="Tìm theo tên hoặc mã template..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                className="border-gray-300"
              />
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Tổng cộng: <strong className="text-blue-600">{filteredTemplates.length}</strong> templates</span>
            </div>
          </div>
        </Card>

        {/* Templates Table */}
        <Card className="shadow-sm">
            <ConfigProvider locale={viVN}>
          <Table
            columns={columns}
            dataSource={filteredTemplates}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            className="template-table"
            size="middle"
          />
          </ConfigProvider>
        </Card>

      </PageContainer>

      {/* Template Editor Modal */}
      <TemplateEditorModal
        visible={editorVisible}
        onClose={handleEditorClose}
        onSave={async (templateId, content) => {
          await handleSaveTemplate(templateId, content);
          // Close all modals and reload templates after successful save
          setEditorVisible(false);
          setSelectedTemplate(null);
          await fetchTemplates();
        }}
        template={selectedTemplate}
      />

      {/* Preview Modal */}
      <PreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        templateData={selectedTemplate}
        htmlContent={selectedTemplate?.contentHtml}
        // REMOVED: rebuildCompleteHtml - dùng full HTML từ BE
      />

      {/* Custom Table Styling */}
      <style>{`
        .template-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          border-bottom: 2px solid #f0f0f0 !important;
          font-weight: 600 !important;
          color: #262626 !important;
        }
        
        .template-table .ant-table-tbody > tr:hover > td {
          background: #f8faff !important;
        }
        
        .template-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f5f5f5 !important;
          padding: 16px 16px !important;
        }
      `}</style>
      
    </Layout>
    </AdminLayout>
  );
}

export default TemplateEditorPage;