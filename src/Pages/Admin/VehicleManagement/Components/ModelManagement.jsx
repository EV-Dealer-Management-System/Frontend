import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  App,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Select,
  ConfigProvider,
} from "antd";
import viVN from 'antd/lib/locale/vi_VN';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

function ManageModel() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [form] = Form.useForm();

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); // name-asc, name-desc, date-asc, date-desc, status-asc, status-desc

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const result = await vehicleApi.getAllModels();
      if (result.success) {
        // Tự động ẩn các model không hoạt động
        const allModels = result.data || [];
        const activeModels = allModels.filter(model => model.isActive !== false);
        setModels(activeModels);
      } else {
        message.error("Không thể tải danh sách model");
        setModels([]);
      }
    } catch (e) {
      message.error("Lỗi khi tải danh sách model");
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentModel(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (model) => {
    setIsEditing(true);
    setCurrentModel(model);
    form.setFieldsValue({
      modelName: model.modelName,
      description: model.description,
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let res;
      if (isEditing && currentModel?.id) {
        // BE chỉ nhận field có trong spec -> gửi đúng 2 field
        res = await vehicleApi.updateModel(currentModel.id, {
          modelName: values.modelName,
          description: values.description || "",
        });
      } else {
        res = await vehicleApi.createModel({
          modelName: values.modelName,
          description: values.description || "",
        });
      }

      if (res.success) {
        message.success(isEditing ? "Cập nhật Model thành công!" : "Tạo Model thành công!");
        setIsModalVisible(false);
        form.resetFields();
        loadModels();
      } else {
        message.error(res.error || "Thao tác thất bại");
      }
    } catch (e) {
      message.error("Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await vehicleApi.deleteModel(id);
      if (res.success) {
        message.success("Xóa model thành công!");
        loadModels();
      } else {
        message.error(res.error || "Không thể xóa model");
      }
    } catch (e) {
      message.error("Lỗi khi xóa model");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort models
  const filteredAndSortedModels = React.useMemo(() => {
    // Filter
    let filtered = models.filter((model) => {
      if (!searchKeyword) return true;
      // So sánh chính xác với tên model đã chọn
      return model.modelName === searchKeyword;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.modelName || "").localeCompare(b.modelName || "", "vi");
        case "name-desc":
          return (b.modelName || "").localeCompare(a.modelName || "", "vi");
        case "date-asc":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "date-desc":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "status-asc":
          return (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
        case "status-desc":
          return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [models, searchKeyword, sortBy]);

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <Text strong style={{ color: "#1890ff", fontSize: 13 }}>{index + 1}</Text>
      ),
    },
    {
      title: "Tên Model",
      dataIndex: "modelName",
      width: 220,
      render: (text) => (
        <Space>
          <CarOutlined style={{ color: "#1890ff", fontSize: 14 }} />
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text || "Chưa có mô tả"}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {text || "Chưa có mô tả"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 140,
      render: (date) => (
        <Text style={{ fontSize: 12 }}>
          {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}
        </Text>
      ),
    },
    
    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            type="primary"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Xóa model này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider locale={viVN}>
      <PageContainer
        className="!p-0"
        childrenContentStyle={{ padding: 0, margin: 0 }}
        header={{
          title: "Quản lý Model Xe Điện",
          subTitle: "Tạo và quản lý các model xe điện",
          extra: [
            <Button key="reload" icon={<ReloadOutlined />} onClick={loadModels} loading={loading}>
              Tải lại
            </Button>,
            <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Tạo Model mới
            </Button>,
          ],
        }}
      >
        <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
          <Card className="shadow-sm">
            <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
              <Col span={24}>
                <Title level={4} className="!mb-1">
                  <CarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                  Danh sách Models
                </Title>
                <Text type="secondary">
                  Tổng cộng: {models.length} model &nbsp;•&nbsp; Hiển thị: {filteredAndSortedModels.length}
                </Text>
              </Col>
            </Row>
            <Divider className="!mt-2" />

            {/* Search and Sort Section */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={16} md={12}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Tìm theo tên/mô tả model..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  size="large"
                />
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  size="large"
                  style={{ width: "100%" }}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="name-asc">Tên A-Z</Option>
                  <Option value="name-desc">Tên Z-A</Option>
                  <Option value="date-desc">Mới nhất</Option>
                  <Option value="date-asc">Cũ nhất</Option>
                  <Option value="status-desc">Hoạt động trước</Option>
                  <Option value="status-asc">Ngừng trước</Option>
                </Select>
              </Col>
            </Row>

            <Table
              size="middle"
              columns={columns}
              dataSource={filteredAndSortedModels}
              rowKey="id"
              loading={loading}
              pagination={{
                total: filteredAndSortedModels.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} model`,
              }}

              sticky
            />
          </Card>
        </div>

        {/* Modal tạo/sửa */}
        <Modal
          title={isEditing ? "Chỉnh sửa Model" : "Tạo Model mới"}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={560}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item
              label="Tên Model"
              name="modelName"
              rules={[
                { required: true, message: "Vui lòng nhập tên model!" },
                { min: 2, message: "Tên model phải có ít nhất 2 ký tự!" },
                { max: 100, message: "Tên model không được quá 100 ký tự!" },
              ]}
            >
              <Input placeholder="VD: E-Scooter Pro Max" size="large" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ max: 1000, message: "Mô tả không được quá 1000 ký tự!" }]}
            >
              <TextArea placeholder="Mô tả chi tiết về model..." rows={4} showCount maxLength={1000} />
            </Form.Item>

            <div style={{ textAlign: "right" }}>
              <Space>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isEditing ? "Cập nhật" : "Tạo Model"}
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </PageContainer>
    </ConfigProvider>
  );
}

export default ManageModel;
