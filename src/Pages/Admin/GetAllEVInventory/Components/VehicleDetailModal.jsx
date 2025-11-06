import React, { useState } from "react";
import { Modal, Table, Card, Empty, List, Button, Tag, Select, message, Popconfirm } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined, CarOutlined, EditOutlined } from "@ant-design/icons";
import { updateVehicleStatus } from "../../../../App/EVMAdmin/GetAllEVInventory/UpdateVehicleStatus";

const { Option } = Select;

function VehicleDetailModal({ visible, onClose, vehicle }) {
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState({});

    // Danh sách trạng thái có thể chọn - chỉ cho phép 3 trạng thái
    const allowedStatusIds = [1, 10, 11]; // Chỉ được phép cập nhật những trạng thái này

    const statusOptions = [
        { value: 1, label: "Có Sẵn Hàng", color: "green" },
        { value: 2, label: "Đang Chờ", color: "orange" },
        { value: 3, label: "Đã Đặt", color: "blue" },
        { value: 4, label: "Đang Vận Chuyển", color: "purple" },
        { value: 5, label: "Đã Bán", color: "red" },
        { value: 6, label: "Tại Đại Lý", color: "cyan" },
        { value: 7, label: "Bảo Trì", color: "yellow" },
        { value: 8, label: "Đại Lý Chờ", color: "geekblue" },
        { value: 9, label: "Đặt Cọc", color: "volcano" },
        { value: 10, label: "Hỏng", color: "magenta" },
        { value: 11, label: "Không Hoạt Động", color: "default" }
    ];

    // Xử lý cập nhật trạng thái xe
    const handleUpdateStatus = async (vehicleId, newStatus) => {
        setLoadingUpdate(prev => ({ ...prev, [vehicleId]: true }));

        try {
            await updateVehicleStatus(vehicleId, newStatus);
            message.success("Cập nhật trạng thái xe thành công!");

            // Cập nhật lại dữ liệu trong state local
            if (selectedWarehouse) {
                setSelectedWarehouse(prev => ({
                    ...prev,
                    vehicles: prev.vehicles.map(car =>
                        car.id === vehicleId ? { ...car, status: newStatus } : car
                    )
                }));
            }

        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error("Không thể cập nhật trạng thái xe!");
        } finally {
            setLoadingUpdate(prev => ({ ...prev, [vehicleId]: false }));
        }
    };

    // Mapping trạng thái xe điện theo enum ElectricVehicleStatus
    const getStatusDisplay = (status) => {
        const statusMap = {
            1: { text: "Có Sẵn Hàng", color: "green" },       // Có sẵn
            2: { text: "Đang Chờ", color: "orange" },        // Đang chờ
            3: { text: "Đã Đặt", color: "blue" },          // Đã đặt
            4: { text: "Đang Vận Chuyển", color: "purple" },     // Đang vận chuyển
            5: { text: "Đã Bán", color: "red" },             // Đã bán
            6: { text: "Tại Đại Lý", color: "cyan" },        // Tại đại lý
            7: { text: "Bảo Trì", color: "yellow" },   // Bảo trì
            8: { text: "Đại Lý Chờ", color: "geekblue" }, // Đại lý chờ
            9: { text: "Đặt Cọc", color: "volcano" }, // Đặt cọc
            10: { text: "Hỏng", color: "magenta" },      // Hỏng
            11: { text: "Không Hoạt Động", color: "default" }      // Không hoạt động
        };

        const statusInfo = statusMap[status] || { text: "Không xác định", color: "default" };
        return (
            <Tag color={statusInfo.color}>
                {statusInfo.text}
            </Tag>
        );
    };

    // Format ngày tháng từ ISO string sang định dạng Việt Nam
    const formatDate = (dateString) => {
        if (!dateString) return "Chưa có";

        try {
            const date = new Date(dateString);
            // Kiểm tra ngày có hợp lệ không
            if (isNaN(date.getTime())) return "Ngày không hợp lệ";

            return date.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Lỗi định dạng ngày";
        }
    };

    if (!vehicle) return null;

    // Nhóm xe theo kho
    const warehouseGroups = vehicle.vehicles?.reduce((acc, car) => {
        const warehouseName = car.warehouseName || 'Không xác định';
        if (!acc[warehouseName]) {
            acc[warehouseName] = [];
        }
        acc[warehouseName].push(car);
        return acc;
    }, {}) || {};

    // Danh sách các kho
    const warehouses = Object.keys(warehouseGroups).map(warehouseName => ({
        name: warehouseName,
        count: warehouseGroups[warehouseName].length,
        vehicles: warehouseGroups[warehouseName]
    }));

    // Reset selectedWarehouse khi modal đóng mở lại
    const handleModalClose = () => {
        setSelectedWarehouse(null);
        onClose();
    };

    // Cấu trúc dữ liệu cho bảng VIN
    const vinColumns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên Model",
            key: "modelName",
            width: 150,
            render: () => vehicle.modelName,
        },
        {
            title: "Phiên Bản",
            key: "versionName",
            width: 180,
            render: () => vehicle.versionName,
        },
        {
            title: "Màu Sắc",
            key: "colorName",
            width: 120,
            render: () => vehicle.colorName,
        },
        {
            title: "Số VIN",
            dataIndex: "vin",
            key: "vin",
            width: 100,
        },
        {
            title: "Tên Kho",
            dataIndex: "warehouseName",
            key: "warehouseName",
            width: 150,
        },
        {
            title: "Ngày Nhập Kho",
            dataIndex: "importDate",
            key: "importDate",
            width: 150,
            render: (date) => formatDate(date),
        },
        {
            title: "Trạng Thái Xe",
            dataIndex: "status",
            key: "status",
            width: 130,
            align: "center",
            render: (status) => getStatusDisplay(status),
        },
        {
            title: "Thao Tác",
            key: "actions",
            width: 180,
            align: "center",
            render: (_, record) => {
                // Tìm trạng thái hiện tại để hiển thị
                const currentStatus = statusOptions.find(option => option.value === record.status);
                
                return (
                    <Select
                        value={record.status}
                        style={{ width: "100%" }}
                        size="small"
                        placeholder="Chọn trạng thái"
                        loading={loadingUpdate[record.id]}
                        disabled={loadingUpdate[record.id]}
                        onChange={(newStatus) => {
                            if (newStatus !== record.status && allowedStatusIds.includes(newStatus)) {
                                handleUpdateStatus(record.id, newStatus);
                            }
                        }}
                        dropdownRender={(menu) => (
                            <div className="p-2">
                                <div className="text-xs text-gray-500 mb-2 font-medium">
                                    Chọn trạng thái mới:
                                </div>
                                {menu}
                            </div>
                        )}
                    >
                        {/* Luôn hiển thị trạng thái hiện tại nếu không trong danh sách cho phép */}
                        {!allowedStatusIds.includes(record.status) && currentStatus && (
                            <Option key={record.status} value={record.status} disabled>
                                <div className="flex items-center gap-2">
                                    <Tag color={currentStatus.color} className="m-0 text-xs">
                                        {currentStatus.label}
                                    </Tag>
                                </div>
                            </Option>
                        )}
                        
                        {/* Hiển thị các trạng thái cho phép chọn */}
                        {statusOptions
                            .filter(option => allowedStatusIds.includes(option.value))
                            .map((option) => (
                                <Option key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        <Tag color={option.color} className="m-0 text-xs">
                                            {option.label}
                                        </Tag>
                                    </div>
                                </Option>
                            ))}
                    </Select>
                );
            },
        }
    ];

    return (
        <Modal
            title={
                selectedWarehouse ?
                    <div className="flex items-center gap-2">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            type="text"
                            onClick={() => setSelectedWarehouse(null)}
                        />
                        <span>Xe Trong Kho: {selectedWarehouse.name}</span>
                    </div>
                    : "Chọn Kho Để Xem Chi Tiết"
            }
            open={visible}
            onCancel={handleModalClose}
            footer={null}
            width={selectedWarehouse ? 1300 : 800}
            centered
        >
            <Card>
                {!selectedWarehouse ? (
                    // Bước 1: Hiển thị danh sách các kho
                    warehouses.length > 0 ? (
                        <List
                            dataSource={warehouses}
                            renderItem={(warehouse) => (
                                <List.Item
                                    className="cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                                    onClick={() => setSelectedWarehouse(warehouse)}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                                                <EnvironmentOutlined className="text-blue-600 text-xl" />
                                            </div>
                                        }
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-800">{warehouse.name}</span>
                                                <div className="flex items-center gap-1 text-blue-600">
                                                    <CarOutlined />
                                                    <span className="font-semibold">{warehouse.count} xe</span>
                                                </div>
                                            </div>
                                        }
                                        description={`Nhấn để xem danh sách ${warehouse.count} xe trong kho này`}
                                    />
                                </List.Item>
                            )}
                        />
                    ) : (
                        <Empty description="Không có thông tin về kho" />
                    )
                ) : (
                    // Bước 2: Hiển thị xe trong kho đã chọn
                    selectedWarehouse.vehicles && selectedWarehouse.vehicles.length > 0 ? (
                        <Table
                            columns={vinColumns}
                            dataSource={selectedWarehouse.vehicles.map((car, index) => ({
                                ...car,
                                key: car.vin || index,
                                index,
                            }))}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} / ${total} xe`,
                            }}
                            size="middle"
                            scroll={{ x: 1000 }}
                        />
                    ) : (
                        <Empty description="Không có xe trong kho này" />
                    )
                )}
            </Card>
        </Modal>
    );
}

export default VehicleDetailModal;