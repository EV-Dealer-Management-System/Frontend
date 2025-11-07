import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom"; // Chưa sử dụng
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Image,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Modal,
  Form,
  Upload,
  InputNumber,
  App,
  Popconfirm,
  Tooltip,
  Badge,
  Divider,
  Tabs,
  Spin,
  Alert,
  Pagination,
} from "antd";
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SettingOutlined,
  ExportOutlined,
  FilterOutlined,
  BgColorsOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import NavigationBar from "../../../Components/Admin/Components/NavigationBar";
import HeaderBar from "../../../Components/Admin/Components/HeaderBar";
import ManageModel from "./Components/ModelManagement";
import ManageVersion from "./Components/VersionManagement";
import ColorManagement from "./Components/ColorManagementSimple";
import CreateTemplateVehicle from "./Components/CreateTemplateVehicle";
import VehicleCard from "./Components/VehicleCard";
import VehicleDetails from "./Components/VehicleDetails";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", textAlign: "center" }}>
          <h2>❌ Đã xảy ra lỗi</h2>
          <p>Lỗi: {this.state.error?.message || "Unknown error"}</p>
          <Button
            type="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function VehicleManagement() {
  const { message } = App.useApp();
  // const navigate = useNavigate(); // Chưa sử dụng
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12, // Hiển thị 12 templates mỗi trang (3x4 grid)
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} templates`,
    pageSizeOptions: ['8', '12', '16', '24', '48'],
  });

  // Load tất cả templates từ API với search và pagination
  const loadAllTemplates = useCallback(async (page, size) => {
    try {
      setLoading(true);

      // Tham số API với search keyword và pagination
      const params = {
        pageNumber: page || 1,
        pageSize: size || 12,
        ...(searchKeyword && { search: searchKeyword })
      };

      console.log("📤 [Template] Loading with params:", params);

      const result = await vehicleApi.getAllTemplateVehicles(params);

      console.log("📥 Template API Response:", result);

      if (result.success) {
        // Xử lý cả 2 trường hợp: result.data.data (nested) hoặc result.data (flat)
        let templatesData = [];

        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // Trường hợp nested: result.data.data
          templatesData = result.data.data;
          console.log("✅ Using nested data structure:", templatesData.length, "templates");
        } else if (Array.isArray(result.data)) {
          // Trường hợp flat: result.data
          templatesData = result.data;
          console.log("✅ Using flat data structure:", templatesData.length, "templates");
        }

        console.log("✅ Final templates data:", templatesData);
        setTemplates(templatesData);

        // Cập nhật pagination info từ API response
        if (result.data && result.data.pagination) {
          const apiPagination = result.data.pagination;
          setPagination(prev => ({
            ...prev,
            current: apiPagination.pageNumber || params.pageNumber,
            pageSize: apiPagination.pageSize || params.pageSize,
            total: apiPagination.totalItems || 0,
          }));
          console.log("📊 Updated pagination:", apiPagination);
        } else {
          // Fallback nếu không có pagination info
          setPagination(prev => ({
            ...prev,
            current: params.pageNumber,
            pageSize: params.pageSize,
            total: templatesData.length,
          }));
        }

        // Kiểm tra nếu không có template nào
        if (templatesData.length === 0) {
          message.info("Chưa có template nào.");
        }
      } else {
        message.error(result.error || "Không thể tải danh sách templates!");
        setTemplates([]);
        setPagination(prev => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error("❌ Error loading templates:", error);
      message.error("Lỗi khi tải danh sách templates!");
      setTemplates([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, message]); // Dependencies cho useCallback

  // Function để reload với pagination hiện tại
  const reloadTemplates = () => {
    loadAllTemplates(pagination.current, pagination.pageSize);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Unified effect để handle cả tab change và search
  useEffect(() => {
    if (activeTab !== "overview") return;

    // Nếu không có searchKeyword, load ngay lập tức (tab change hoặc clear search)
    if (!searchKeyword.trim()) {
      setPagination(prev => ({ ...prev, current: 1 }));
      loadAllTemplates(1, 12);
      return;
    }

    // Nếu có searchKeyword, debounce search
    setPagination(prev => ({ ...prev, current: 1 }));
    const timeoutId = setTimeout(() => {
      loadAllTemplates(1, pagination.pageSize);
    }, 500); // Delay 500ms sau khi user dừng gõ

    return () => clearTimeout(timeoutId);
  }, [activeTab, searchKeyword, loadAllTemplates, pagination.pageSize]);

  // Xử lý thay đổi pagination
  const handlePaginationChange = (page, pageSize) => {
    console.log("📄 Pagination changed:", { page, pageSize });
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    loadAllTemplates(page, pageSize);
  };

  // Xử lý khi click xem chi tiết
  const handleViewDetails = (template) => {
    // Lấy versionId từ template
    const versionId = template.version?.versionId || template.versionId || template.version?.id;
    console.log("Opening details for version ID:", versionId);
    setSelectedVersionId(versionId);
    setDetailsVisible(true);
  };

  // Đóng popup chi tiết
  const handleCloseDetails = () => {
    setDetailsVisible(false);
    setSelectedVersionId(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <HeaderBar collapsed={collapsed} isMobile={isMobile} />
      <NavigationBar collapsed={collapsed} onCollapse={setCollapsed} />

      <div className="flex-1 transition-all duration-200" style={{ marginLeft: collapsed ? 64 : 280, paddingTop: '56px' }}>
        <PageContainer
          header={{
            title: "Quản lý xe điện",
            subTitle: "Quản lý danh sách và thông tin các mẫu xe điện",
            breadcrumb: {
              items: [{ title: "Trang chủ" }, { title: "Admin" }, { title: "Quản lý xe điện" }],
            },
          }}
          className="p-6"
        >
          {/* Quick Action Buttons */}

          <Divider />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "overview",
                label: (<span><DashboardOutlined />Tổng quan</span>),
                children: (
                  <div className="w-full">
                    <PageContainer
                      title="Tổng Quan Xe Điện"
                      subTitle={`Hiển thị ${templates.length} trong tổng số ${pagination.total} templates`}
                      extra={[
                        <Search
                          key="search"
                          placeholder="Tìm kiếm theo tên mẫu"
                          onSearch={(value) => setSearchKeyword(value)}
                          style={{ width: 300 }}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          allowClear
                        />,
                        <Button
                          key="refresh"
                          icon={<ReloadOutlined />}
                          onClick={reloadTemplates}
                          loading={loading}
                          type="primary"
                        >
                          Làm mới
                        </Button>,
                      ]}
                    >
                      {/* Loading State */}
                      {loading && (
                        <div className="flex justify-center items-center py-20">
                          <Spin size="large" tip="Đang tải danh sách templates..." />
                        </div>
                      )}

                      {/* Empty State */}
                      {!loading && Array.isArray(templates) && templates.length === 0 && (
                        <Card className="text-center py-20">
                          <CarOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
                          <Text type="secondary" className="block mt-4">
                            Chưa có template nào
                          </Text>
                        </Card>
                      )}

                      {/* Template Grid */}
                      {!loading && Array.isArray(templates) && templates.length > 0 && (
                        <>
                          <Row gutter={[16, 16]}>
                            {templates
                              .filter((template) => {
                                // Ẩn những template có status ngừng hoạt động
                                const isActive = template.isActive !== false && template.status !== 0;

                                // Search filtering - vì đã search từ API nên không cần filter ở đây nữa
                                // Chỉ cần filter theo active status
                                return isActive;
                              })
                              .map((template) => {
                                // Chuẩn hóa data để khớp với VehicleCard
                                const vehicleData = {
                                  ...template,
                                  modelName: template.version?.modelName,
                                  versionName: template.version?.versionName,
                                  colorName: template.color?.colorName,
                                };

                                return (
                                  <Col xs={24} sm={12} md={8} lg={6} key={template.id}>
                                    <VehicleCard
                                      vehicle={vehicleData}
                                      onViewDetails={handleViewDetails}
                                    />
                                  </Col>
                                );
                              })}
                          </Row>

                          {/* Pagination */}
                          {pagination.total > 0 && (
                            <div className="flex justify-center mt-8">
                              <Pagination
                                current={pagination.current}
                                total={pagination.total}
                                pageSize={pagination.pageSize}
                                showSizeChanger={pagination.showSizeChanger}
                                showQuickJumper={pagination.showQuickJumper}
                                showTotal={pagination.showTotal}
                                pageSizeOptions={pagination.pageSizeOptions}
                                onChange={handlePaginationChange}
                                onShowSizeChange={handlePaginationChange}
                                style={{
                                  marginTop: '24px',
                                  textAlign: 'center'
                                }}
                              />
                            </div>
                          )}
                        </>
                      )}

                      {/* Modal chi tiết template */}
                      <VehicleDetails
                        visible={detailsVisible}
                        onClose={handleCloseDetails}
                        versionId={selectedVersionId}
                      />
                    </PageContainer>
                  </div>
                ),
              },
              {
                key: "create-template",
                label: (<span><PlusOutlined />Tạo Mẫu Xe Template</span>),
                children: <CreateTemplateVehicle />,
              },
              {
                key: "manage-models",
                label: (<span><CarOutlined />Quản lý Model</span>),
                children: <ManageModel />,
              },
              {
                key: "manage-versions",
                label: (<span><BuildOutlined />Quản lý Version</span>),
                children: <ManageVersion />,
              },
              {
                key: "manage-colors",
                label: (<span><BgColorsOutlined />Quản lý Màu sắc</span>),
                children: <ColorManagement />,
              },
            ]}
          />
        </PageContainer>
      </div>
    </div>
  );
}

function VehicleManagementWithErrorBoundary() {
  return (
    <App>
      <ErrorBoundary>
        <VehicleManagement />
      </ErrorBoundary>
    </App>
  );
}

export default VehicleManagementWithErrorBoundary;
