import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  App,
  Popconfirm,
  Tag,
  Row,
  Col,
  Typography,
  Divider,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { vehicleApi } from "../../../../App/EVMAdmin/VehiclesManagement/Vehicles";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const popularColors = [
  { name: "Đỏ Cherry", code: "#DC143C" },
  { name: "Trắng Ngọc Trai", code: "#F8F8FF" },
  { name: "Đen Obsidian", code: "#0B0B0B" },
  { name: "Xanh Ocean", code: "#006994" },
  { name: "Bạc Metallic", code: "#C0C0C0" },
  { name: "Xám Titan", code: "#708090" },
  { name: "Xanh Emerald", code: "#50C878" },
  { name: "Vàng Gold", code: "#FFD700" },
  { name: "Cam Sunset", code: "#FF4500" },
  { name: "Tím Royal", code: "#663399" },
  { name: "Xanh Navy", code: "#000080" },
  { name: "Hồng Rose", code: "#FF69B4" },
  { name: "Nâu Chocolate", code: "#8B4513" },
  { name: "Xanh Mint", code: "#98FB98" },
  { name: "Cam Coral", code: "#FF7F50" },
];

// Utils chọn màu chữ (đen/trắng) theo nền
const getContrastText = (hex) => {
  const c = (hex || "#000000").replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
};

function ColorManagement() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [form] = Form.useForm();

  // Search and Sort
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name-asc"); // name-asc, name-desc, code-asc, cost-desc, cost-asc

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    setLoading(true);
    try {
      const result = await vehicleApi.getAllColors();
      if (result.success) {
        setColors(result.data || []);
      } else {
        message.error("Không thể tải danh sách màu sắc");
        setColors([]);
      }
    } catch (err) {
      message.error("Lỗi khi tải danh sách màu sắc");
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    // Filter
    let filtered = colors;
    if (query) {
      // So sánh chính xác với tên màu đã chọn
      filtered = (colors || []).filter(
        (c) => c.colorName === query
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return (a.colorName || "").localeCompare(b.colorName || "", "vi");
        case "name-desc":
          return (b.colorName || "").localeCompare(a.colorName || "", "vi");
        case "code-asc":
          return (a.colorCode || "").localeCompare(b.colorCode || "", "vi");
        case "cost-desc":
          return (b.extraCost || 0) - (a.extraCost || 0);
        case "cost-asc":
          return (a.extraCost || 0) - (b.extraCost || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [colors, query, sortBy]);

  const handleCreate = () => {
    setIsEditing(false);
    setCurrentColor(null);
    form.resetFields();
    form.setFieldsValue({
      colorName: "",
      colorCode: "#FF0000",
      extraCost: 0,
    });
    setIsModalVisible(true);
  };

  const handleEdit = (color) => {
    setIsEditing(true);
    setCurrentColor(color);
    form.setFieldsValue({
      colorName: color.colorName,
      colorCode: color.colorCode,
      extraCost: color.extraCost || 0,
    });
    setIsModalVisible(true);
  };

 

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validate nhanh
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexRegex.test(values.colorCode)) {
        message.error("Mã màu phải theo định dạng #RRGGBB (6 ký tự hex)!");
        setLoading(false);
        return;
      }
      const payload = {
        colorName: values.colorName.trim(),
        colorCode: values.colorCode.toUpperCase(),
        extraCost: Number(values.extraCost) || 0,
      };

      let result;
      if (isEditing && currentColor?.id) {
        result = await vehicleApi.updateColor(currentColor.id, payload);
      } else {
        result = await vehicleApi.createColor(payload);
      }

      if (result.success) {
        message.success(isEditing ? "Cập nhật Màu sắc thành công!" : "Tạo Màu sắc thành công!");
        setIsModalVisible(false);
        form.resetFields();
        await loadColors();
      } else {
        message.error(result.error || "Không thể lưu màu sắc");
      }
    } catch (err) {
      message.error("Lỗi khi lưu màu sắc");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Màu sắc",
      dataIndex: "colorName",
      width: 280,
      render: (_, record) => (
        <Space>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "2px solid #e5e7eb",
              background: record.colorCode,
              display: "inline-block",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
            }}
            title={record.colorCode}
          />
          <div>
            <Text strong>{record.colorName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.colorCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Mã màu",
      dataIndex: "colorCode",
      width: 140,
      render: (hex) => (
        <Text code copyable>
          {hex}
        </Text>
      ),
    },
    {
      title: "Phụ thu",
      dataIndex: "extraCost",
      width: 160,
      render: (v) => (
        <Tag color={v > 0 ? "orange" : "default"}>
          {v ? `${v.toLocaleString("vi-VN")} ₫` : "Miễn phí"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      fixed: "right",
      width: 170,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
        
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      className="!p-0"
      childrenContentStyle={{ padding: 0, margin: 0, maxWidth: "100%" }}
      header={{
        title: "Quản lý Màu sắc Xe Điện",
        subTitle: "Tạo và quản lý các màu sắc cho xe điện",
        extra: [
          <Select
            key="search"
            allowClear
            showSearch
            placeholder="Chọn màu để tìm kiếm..."
            value={query || undefined}
            onChange={setQuery}
            style={{ width: 260 }}
            filterOption={(input, option) =>
              (option?.children ?? "").toString().toLowerCase().includes(input.toLowerCase())
            }
          >
            {colors.map((color) => (
              <Option key={color.id} value={color.colorName}>
                {color.colorName}
              </Option>
            ))}
          </Select>,
          <Button key="reload" icon={<ReloadOutlined />} onClick={loadColors} loading={loading}>
            Tải lại
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Tạo Màu mới
          </Button>,
        ],
      }}
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-6">
        <Card className="shadow-sm">
          <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
            <Col span={24}>
              <Title level={4} className="!mb-1">
                <BgColorsOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                Danh sách Màu sắc
              </Title>
              <Text type="secondary">
                Tổng cộng: {colors.length} màu &nbsp;•&nbsp; Hiển thị: {filteredAndSorted.length}
              </Text>
            </Col>
          </Row>
          <Divider className="!mt-2" />
          
          {/* Search and Sort Section */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={16} md={12}>
              <Select
                allowClear
                showSearch
                placeholder="Chọn màu để tìm kiếm..."
                value={query || undefined}
                onChange={setQuery}
                size="large"
                style={{ width: "100%" }}
                filterOption={(input, option) =>
                  (option?.children ?? "").toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {colors.map((color) => (
                  <Option key={color.id} value={color.colorName}>
                    {color.colorName}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="large"
                style={{ width: "100%" }}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="name-asc">Tên màu A-Z</Option>
                <Option value="name-desc">Tên màu Z-A</Option>
                <Option value="code-asc">Mã màu A-Z</Option>
                <Option value="cost-desc">Phụ thu cao → thấp</Option>
                <Option value="cost-asc">Phụ thu thấp → cao</Option>
              </Select>
            </Col>
          </Row>

          <Table
            size="middle"
            columns={columns}
            dataSource={filteredAndSorted}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredAndSorted.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} màu`,
            }}
            scroll={{ x: "max-content" }}
            sticky
          />
        </Card>
      </div>

      {/* Modal tạo/sửa màu */}
      <Modal
        title={
          <Space>
            <BgColorsOutlined style={{ color: "#1890ff" }} />
            {isEditing ? "Chỉnh sửa Màu sắc" : "Tạo Màu sắc mới"}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={840}
      >
        <Divider />

        {/* Quick pick phổ biến */}
        <div className="mb-4">
          <Title level={5} className="!mb-3">
            Màu phổ biến (bấm để chọn)
          </Title>
          <div className="flex flex-wrap gap-2">
            {popularColors.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  form.setFieldsValue({ colorName: c.name, colorCode: c.code });
                  message.success(`Đã chọn: ${c.name}`);
                }}
                className="rounded-md border border-gray-200 px-3 py-2 text-xs font-medium"
                style={{
                  background: c.code,
                  color: getContrastText(c.code),
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                }}
                title={`${c.name} - ${c.code}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ colorCode: "#FF0000", extraCost: 0 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên màu"
                name="colorName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên màu!" },
                  { min: 2, message: "Tối thiểu 2 ký tự!" },
                  { max: 50, message: "Tối đa 50 ký tự!" },
                ]}
              >
                <Input placeholder="VD: Trắng Ngọc Trai, Đen Obsidian..." size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Mã màu (HEX)"
                name="colorCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã màu!" },
                  { pattern: /^#[0-9A-Fa-f]{6}$/, message: "Định dạng #RRGGBB" },
                ]}
              >
                <Input
                  placeholder="#FFFFFF"
                  size="large"
                  maxLength={7}
                  addonAfter={
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, cur) => prev.colorCode !== cur.colorCode}
                    >
                      {({ getFieldValue }) => {
                        const hex = getFieldValue("colorCode") || "#FF0000";
                        return (
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              display: "inline-block",
                              background: hex,
                              border: "1px solid #d9d9d9",
                              borderRadius: 6,
                            }}
                            title={`Preview: ${hex}`}
                          />
                        );
                      }}
                    </Form.Item>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Phụ thu (VND)"
                name="extraCost"
                rules={[{ required: true, message: "Vui lòng nhập phụ thu!" }]}
              >
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) => {
                    if (!value && value !== 0) return '';
                    const numStr = String(value);
                    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                  }}
                  parser={(value) => {
                    if (!value) return '';
                    // Loại bỏ tất cả ký tự không phải số
                    const parsed = value.toString().replace(/[^\d]/g, "");
                    return parsed === '' ? '' : Number(parsed);
                  }}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-right">
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
                {isEditing ? "Cập nhật" : "Tạo Màu sắc"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default ColorManagement;
