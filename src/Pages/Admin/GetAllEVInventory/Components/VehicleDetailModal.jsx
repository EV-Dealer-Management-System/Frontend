import React, { useState } from "react";
import { Modal, Table, Card, Empty, List, Button } from "antd";
import { ArrowLeftOutlined, EnvironmentOutlined, CarOutlined } from "@ant-design/icons";

function VehicleDetailModal({ visible, onClose, vehicle }) {
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

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
            width: 140,
        },
        {
            title: "Tên Kho",
            dataIndex: "warehouseName",
            key: "warehouseName",
        },
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
            width={selectedWarehouse ? 1200 : 800}
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