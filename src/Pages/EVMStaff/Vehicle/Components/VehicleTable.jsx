import React, { useState } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    Select,
    Badge,
    Tooltip,
    Typography,
    Alert,
    Spin,
    Row,
    Col,
} from "antd";
import {
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

function VehicleTable({
    vehiclesList,
    loading,
    currentPage,
    pageSize,
    onPageChange,
    onEdit,
    onView,
}) {
    // Filter states
    const [searchVin, setSearchVin] = useState("");
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterModel, setFilterModel] = useState(null);
    const [filterWarehouse, setFilterWarehouse] = useState(null);

    // Get unique values for filters
    const uniqueModels = [
        ...new Set(
            vehiclesList
                .map((v) => v.electricVehicleTemplate?.modelName)
                .filter(Boolean)
        ),
    ];

    const uniqueWarehouses = [
        ...new Set(vehiclesList.map((v) => v.warehouse?.name).filter(Boolean)),
    ];

    // Filter logic
    const filteredData = vehiclesList.filter((vehicle) => {
        const matchVin = searchVin
            ? vehicle.vin.toLowerCase().includes(searchVin.toLowerCase())
            : true;

        const matchStatus = filterStatus ? vehicle.status === filterStatus : true;

        const matchModel = filterModel
            ? vehicle.electricVehicleTemplate?.modelName === filterModel
            : true;

        const matchWarehouse = filterWarehouse
            ? vehicle.warehouse?.name === filterWarehouse
            : true;

        return matchVin && matchStatus && matchModel && matchWarehouse;
    });

    // Clear all filters
    const handleClearFilters = () => {
        setSearchVin("");
        setFilterStatus(null);
        setFilterModel(null);
        setFilterWarehouse(null);
    };

    const hasActiveFilters =
        searchVin || filterStatus || filterModel || filterWarehouse;

    // Table columns - Phóng to để dễ đọc
    const columns = [
        {
            title: <span className="text-base font-semibold">STT</span>,
            align: "center",
            width: 100,
            render: (_, __, index) => (
                <span className="text-base font-medium">
                    {(currentPage - 1) * pageSize + index + 1}
                </span>
            ),
        },
        {
            title: <span className="text-base font-semibold">VIN</span>,
            dataIndex: "vin",
            width: 160,
            ellipsis: true,
            render: (vin) => (
                <Text copyable strong className="text-blue-600 text-base">
                    {vin}
                </Text>
            ),
        },
        {
            title: <span className="text-base font-semibold">Model / Version</span>,
            width: 200,
            ellipsis: true,
            render: (_, vehicle) => {
                const template = vehicle.electricVehicleTemplate || {};
                return (
                    <div>
                        <div className="text-sm text-gray-500">
                            {template.modelName || "N/A"}
                        </div>
                        <div className="font-semibold text-base">
                            {template.versionName || "N/A"}
                        </div>
                    </div>
                );
            },
        },
        {
            title: <span className="text-base font-semibold">Kho</span>,
            dataIndex: ["warehouse", "name"],
            width: 140,
            ellipsis: true,
            render: (name) => <span className="text-base">{name || "N/A"}</span>,
        },
        {
            title: <span className="text-base font-semibold">Trạng thái</span>,
            dataIndex: "status",
            align: "center",
            width: 130,
            render: (status) => {
                const statusMap = {
                    1: { color: "success", text: "Khả dụng" },
                    2: { color: "processing", text: "Đang chờ" },
                    3: { color: "warning", text: "Đã đặt" },
                    4: { color: "purple", text: "Vận chuyển" },
                    5: { color: "error", text: "Đã bán" },
                    6: { color: "default", text: "Tại ĐL" },
                    7: { color: "orange", text: "Bảo trì" },
                };
                const config = statusMap[status] || {
                    color: "default",
                    text: "N/A",
                };
                return (
                    <Badge
                        status={config.color}
                        text={<span className="text-base">{config.text}</span>}
                    />
                );
            },
        },
        {
            title: <span className="text-base font-semibold">Ngày SX</span>,
            dataIndex: "manufactureDate",
            align: "center",
            width: 110,
            render: (date) => (
                <span className="text-base">
                    {date ? new Date(date).toLocaleDateString("vi-VN") : "—"}
                </span>
            ),
        },
        {
            title: <span className="text-base font-semibold">Thao tác</span>,
            align: "center",
            width: 110,
            fixed: "right",
            render: (_, vehicle) => (
                <Space size="small">
                    <Tooltip title="Cập nhật">
                        <Button
                            icon={<EditOutlined />}
                            size="large"
                            type="primary"
                            onClick={() => onEdit(vehicle)}
                        />
                    </Tooltip>
                    <Tooltip title="Chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="large"
                            onClick={() => onView(vehicle)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-sm w-full border border-gray-300" bodyStyle={{ padding: "24px" }}>
            {/* Filter Section */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-300">
                <div className="flex items-center gap-2 mb-3">
                    <FilterOutlined className="text-blue-600 text-lg" />
                    <Text strong className="text-base">
                        Bộ lọc tìm kiếm
                    </Text>
                    {hasActiveFilters && (
                        <Button
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            className="ml-auto"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Text className="block mb-2 text-sm font-medium">Tìm VIN:</Text>
                        <Input
                            placeholder="Nhập VIN..."
                            prefix={<SearchOutlined />}
                            value={searchVin}
                            onChange={(e) => setSearchVin(e.target.value)}
                            allowClear
                            className="w-full"
                            size="large"
                        />
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Text className="block mb-2 text-sm font-medium">Trạng thái:</Text>
                        <Select
                            placeholder="Chọn trạng thái"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            allowClear
                            className="w-full"
                            size="large"
                        >
                            <Option value={1}>✅ Khả dụng</Option>
                            <Option value={2}>⏳ Đang chờ</Option>
                            <Option value={3}>📦 Đã đặt</Option>
                            <Option value={4}>🚚 Vận chuyển</Option>
                            <Option value={5}>💰 Đã bán</Option>
                            <Option value={6}>🏢 Tại đại lý</Option>
                            <Option value={7}>🔧 Bảo trì</Option>
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Text className="block mb-2 text-sm font-medium">Model:</Text>
                        <Select
                            placeholder="Chọn model"
                            value={filterModel}
                            onChange={setFilterModel}
                            allowClear
                            className="w-full"
                            showSearch
                            size="large"
                        >
                            {uniqueModels.map((model) => (
                                <Option key={model} value={model}>
                                    <span className="text-base">{model}</span>
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Text className="block mb-2 text-sm font-medium">Kho:</Text>
                        <Select
                            placeholder="Chọn kho"
                            value={filterWarehouse}
                            onChange={setFilterWarehouse}
                            allowClear
                            className="w-full"
                            showSearch
                            size="large"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children?.props?.children ?? "")
                                    .toString()
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {uniqueWarehouses.map((warehouse) => (
                                <Option key={warehouse} value={warehouse}>
                                    <span className="text-base font-medium">{warehouse}</span>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </div>

            {/* Results Alert */}
            <Alert
                message={
                    hasActiveFilters
                        ? `Tìm thấy ${filteredData.length} xe phù hợp với bộ lọc (Tổng: ${vehiclesList.length} xe)`
                        : `Tổng cộng: ${vehiclesList.length} xe. Mỗi xe có VIN riêng và được tạo từ template.`
                }
                type={hasActiveFilters ? "success" : "info"}
                showIcon
                closable
                className="mb-4"
            />

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} xe`,
                    onChange: onPageChange,
                }}
                locale={{
                    emptyText: loading ? (
                        <Spin size="large" tip="Đang tải danh sách xe..." />
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">
                                {hasActiveFilters
                                    ? "Không tìm thấy xe phù hợp với bộ lọc"
                                    : "Chưa có xe nào. Hãy tạo xe mới!"}
                            </Text>
                        </div>
                    ),
                }}

                size="large"
                bordered
                className="rounded-lg overflow-hidden border border-gray-300"
            />
        </Card>
    );
}

export default VehicleTable;
