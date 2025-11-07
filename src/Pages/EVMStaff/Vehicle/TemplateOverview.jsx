import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Button,
  Input,
  Pagination,
} from "antd";
import { ReloadOutlined, CarOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";
import VehicleCard from "./Components/VehicleCard";
import VehicleDetails from "./Components/VehicleDetails";

const { Text } = Typography;
const { Search } = Input;

function TemplateOverview() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Pagination params
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12 items per page for grid layout

  // Load all templates function - defined before useEffect
  const loadAllTemplates = useCallback(
    async (page = 1, size = 12, search = "") => {
      try {
        setLoading(true);

        // Gọi API với pagination params
        const params = {
          pageNumber: page,
          pageSize: size,
          ...(search && search.trim() && { search: search.trim() }),
        };

        console.log("📤 Loading templates with params:", params);
        const result = await vehicleApi.getAllTemplateVehicles(params);

        console.log("📥 Template API Response:", result);

        if (result.isSuccess) {
          // Xử lý cấu trúc dữ liệu từ API
          const templatesData = Array.isArray(result.data) ? result.data : [];
          const paginationInfo = result.pagination;

          console.log("✅ Loaded templates:", templatesData);
          console.log("📊 Pagination info:", paginationInfo);

          setTemplates(templatesData);
          setPagination(paginationInfo);

          if (templatesData.length === 0) {
            message.info("Chưa có template nào.");
          }
        } else {
          message.error(result.message || "Không thể tải danh sách templates!");
          setTemplates([]);
        }
      } catch (error) {
        console.error("❌ Error loading templates:", error);
        message.error("Lỗi khi tải danh sách templates!");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // useEffect to load initial data
  useEffect(() => {
    loadAllTemplates(1, 12, "");
  }, [loadAllTemplates]);

  // Handle search
  const handleSearch = (value) => {
    setSearchKeyword(value);
    setCurrentPage(1); // Reset to first page when searching
    loadAllTemplates(1, pageSize, value);
  };

  // Handle search input change (for real-time search)
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);

    // Debounce search - only search when user stops typing
    if (value === "") {
      setCurrentPage(1);
      loadAllTemplates(1, pageSize, "");
    }
  };

  // Handle pagination change
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
    loadAllTemplates(page, size || pageSize, searchKeyword);
  };

  // Handle page size change
  const handlePageSizeChange = (current, size) => {
    setCurrentPage(1);
    setPageSize(size);
    loadAllTemplates(1, size, searchKeyword);
  };

  // Xử lý khi click xem chi tiết
  const handleViewDetails = (template) => {
    // Lấy versionId từ template
    const versionId = template.version?.versionId || template.versionId;
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
    <EVMStaffLayout>
      <PageContainer
        title="Tổng Quan Xe Điện"
        subTitle={
          pagination
            ? `${pagination.totalItems} mẫu xe điện (${
                Array.isArray(templates)
                  ? templates.filter((t) => t.isActive === true).length
                  : 0
              } đang hoạt động)`
            : `${
                Array.isArray(templates)
                  ? templates.filter((t) => t.isActive === true).length
                  : 0
              } mẫu xe điện có sẵn`
        }
        extra={[
          <Search
            key="search"
            placeholder="Tìm kiếm theo tên mẫu, màu sắc, mô tả..."
            onSearch={handleSearch}
            value={searchKeyword}
            onChange={handleSearchInputChange}
            style={{ width: 350 }}
            allowClear
            loading={loading}
          />,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={loadAllTemplates}
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
              {(Array.isArray(templates) ? templates : []).map((template) => {
                // Chuẩn hóa data để khớp với VehicleCard
                const vehicleData = {
                  ...template,
                  modelName: template.version?.modelName,
                  versionName: template.version?.versionName,
                  colorName: template.color?.colorName,
                  // Thêm các thông tin khác từ API response
                  price: template.price,
                  description: template.description,
                  imgUrl: template.imgUrl || [],
                  versionId: template.version?.versionId,
                  modelId: template.version?.modelId,
                  colorId: template.color?.colorId,
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
            {pagination && pagination.totalItems > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={pagination.totalItems}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} mẫu xe`
                  }
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageSizeChange}
                  pageSizeOptions={["8", "12", "16", "24", "32"]}
                  size="default"
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
    </EVMStaffLayout>
  );
}

export default TemplateOverview;
