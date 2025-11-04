import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Button,
} from "antd";
import {
  ReloadOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../App/EVMAdmin/VehiclesManagement/Vehicles";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";
import VehicleCard from "./Components/VehicleCard";
import VehicleDetails from "./Components/VehicleDetails";

const { Text } = Typography;

function TemplateOverview() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  useEffect(() => {
    loadAllTemplates();
  }, []);

  const loadAllTemplates = async () => {
    try {
      setLoading(true);
      const result = await vehicleApi.getAllTemplateVehicles();

      console.log("📥 Template API Response:", result);

      if (result.success) {
        const templatesData = result.data || [];
        console.log("✅ Loaded templates:", templatesData);
        setTemplates(templatesData);

        if (templatesData.length === 0) {
          message.info("Chưa có template nào.");
        }
      } else {
        message.error(result.error || "Không thể tải danh sách templates!");
        setTemplates([]);
      }
    } catch (error) {
      console.error("❌ Error loading templates:", error);
      message.error("Lỗi khi tải danh sách templates!");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
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
        subTitle={`${templates.length} mẫu xe điện có sẵn`}
        extra={[
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
        {!loading && templates.length === 0 && (
          <Card className="text-center py-20">
            <CarOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
            <Text type="secondary" className="block mt-4">
              Chưa có template nào
            </Text>
          </Card>
        )}

        {/* Template Grid */}
        {!loading && templates.length > 0 && (
          <Row gutter={[16, 16]}>
            {templates.map((template) => {
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
