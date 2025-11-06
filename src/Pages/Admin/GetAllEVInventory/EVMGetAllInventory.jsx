import React, { useState, useEffect, useCallback } from "react";
import { Button, message, Input, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import AdminLayout from "../../../Components/Admin/AdminLayout";
import { getAllEVInventory } from "../../../App/EVMAdmin/GetAllEVInventory/GetAllEVInventory";
import VehicleDetailModal from "./Components/VehicleDetailModal";
import StatisticsCards from "./Components/StatisticsCards";
import InventoryTable from "./Components/InventoryTable";

const { Search } = Input;
const { Option } = Select;

function EVMGetAllInventory() {
    const [loading, setLoading] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Từ khóa tìm kiếm & bộ lọc
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [warehouseOptions, setWarehouseOptions] = useState([]);

    // Fetch dữ liệu kho xe của hãng
    const fetchInventoryData = useCallback(async (warehouseId = null) => {
        setLoading(true);
        try {
            const params = {};
            if (warehouseId) {
                params.warehouseId = warehouseId;
            }

            console.log("Fetching inventory data with params:", params);
            const response = await getAllEVInventory(params);
            console.log("API Response:", response); // Debug log
            console.log("Response result:", response?.result); // Debug log
            console.log("Response result data:", response?.result?.data); // Debug log
            console.log("Is result.data array?", Array.isArray(response?.result?.data)); // Debug log

            if (response?.isSuccess) {
                // Xử lý cả cấu trúc cũ và mới của API
                let resultData = [];

                if (Array.isArray(response?.result?.data)) {
                    // Cấu trúc mới: response.result.data
                    resultData = response.result.data;
                } else if (Array.isArray(response?.result)) {
                    // Cấu trúc cũ: response.result
                    resultData = response.result;
                }

                // Thêm key cho mỗi item để Table hoạt động tốt
                const dataWithKeys = resultData.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index + 1
                }));

                // Extract unique warehouses từ dữ liệu (chỉ khi chưa có hoặc đang load tất cả kho)
                if (warehouseOptions.length === 0 || !warehouseId) {
                    const warehouseMap = new Map();
                    resultData.forEach(item => {
                        if (item.vehicles && Array.isArray(item.vehicles)) {
                            item.vehicles.forEach(vehicle => {
                                if (vehicle.warehouseId && vehicle.warehouseName) {
                                    warehouseMap.set(vehicle.warehouseId, vehicle.warehouseName);
                                }
                            });
                        }
                    });

                    // Chuyển đổi thành array options cho Select
                    const warehouseOptionsArray = Array.from(warehouseMap, ([id, name]) => ({
                        value: id,
                        label: name
                    })).sort((a, b) => a.label.localeCompare(b.label));

                    setWarehouseOptions(warehouseOptionsArray);
                    console.log("Warehouse options updated:", warehouseOptionsArray);
                }
                setInventoryData(dataWithKeys);
                console.log("Processed data:", dataWithKeys);
                message.success("Tải dữ liệu kho xe hãng thành công!");
            } else {
                console.log("API returned unsuccessful response:", response);
                message.error(response?.message || "Có lỗi xảy ra khi tải dữ liệu");
                setInventoryData([]);
            }
        } catch (error) {
            console.error("Error fetching company inventory:", error);
            console.log("Error details:", error.response || error.message);
            message.error("Không thể tải dữ liệu kho xe. Vui lòng thử lại!");
            // Đặt dữ liệu về mảng rỗng nếu có lỗi
            setInventoryData([]);
        } finally {
            setLoading(false);
        }
    }, [warehouseOptions.length]);

    // Làm mới dữ liệu
    const handleRefresh = () => {
        console.log("Refreshing data with current warehouse filter:", warehouseFilter);
        fetchInventoryData(warehouseFilter || null);
    };

    // Xử lý thay đổi bộ lọc kho
    const handleWarehouseChange = (value) => {
        console.log("Warehouse filter changed:", value);
        setWarehouseFilter(value);

        // Reset các filter khác khi chuyển kho để tránh xung đột
        setSearchKeyword('');
        setStatusFilter('');

        // Fetch dữ liệu mới với warehouse được chọn
        fetchInventoryData(value || null);
    };

    // Mở modal xem chi tiết
    const showDetailModal = (record) => {
        setSelectedVehicle(record);
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedVehicle(null);
    };



    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData]);

    return (
        <AdminLayout>
            <PageContainer
                title="Quản Lý Kho Xe Toàn Hệ Thống"
                extra={[
                    <>
                        <Select
                            key="warehouse-filter"
                            placeholder="Chọn kho"
                            value={warehouseFilter || undefined}
                            style={{ width: 200 }}
                            allowClear
                            onChange={handleWarehouseChange}
                            loading={loading}
                        >
                            <Option value="">Tất cả kho</Option>
                            {warehouseOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                        <Select
                            key="status-filter"
                            showSearch                     //  Cho phép nhập từ khóa
                            placeholder="Chọn hoặc nhập tình trạng"
                            value={statusFilter || undefined}
                            style={{ width: 280 }}
                            allowClear
                            onSearch={(value) => setStatusFilter(value)}  //  Gõ -> cập nhật
                            onChange={(value) => setStatusFilter(value)}  //  Chọn -> cập nhật
                            filterOption={false}                          // Không giới hạn khi gõ
                            options={[
                                { label: "Dồi Dào", value: "dồi dào" },
                                { label: "Đầy Đủ", value: "đầy đủ" },
                                { label: "Trung Bình", value: "trung bình" },
                                { label: "Ít", value: "ít" },
                                { label: "Hết Hàng", value: "hết hàng" },
                            ]}
                        />
                        <Search
                            key="search"
                            placeholder="Tìm kiếm theo tên xe, phiên bản hoặc màu..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            allowClear
                            style={{ width: 280 }}
                        />,
                        <Button
                            key="refresh"
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
                        >
                            Làm Mới Dữ Liệu
                        </Button>
                    </>
                ]}
                className="bg-white"
            >
                <div className="space-y-6">
                    {/* Thống kê tổng quan */}
                    <StatisticsCards filteredData={inventoryData} />

                    {/* Bảng dữ liệu */}
                    <InventoryTable
                        loading={loading}
                        filteredData={inventoryData.filter((item) => {
                            const keyword = (searchKeyword || "").toLowerCase().trim();
                            const status = (statusFilter || "").toLowerCase().trim();

                            // Xác định tình trạng của xe (giống logic trong InventoryTable)
                            let computedStatus = "";
                            if (item.quantity > 20) computedStatus = "dồi dào";
                            else if (item.quantity > 10) computedStatus = "đầy đủ";
                            else if (item.quantity > 5) computedStatus = "trung bình";
                            else if (item.quantity > 0) computedStatus = "ít";
                            else computedStatus = "hết hàng";

                            // Lọc theo từ khóa và tình trạng
                            const matchesKeyword =
                                !keyword ||
                                item.modelName.toLowerCase().includes(keyword) ||
                                item.versionName.toLowerCase().includes(keyword) ||
                                item.colorName.toLowerCase().includes(keyword);

                            const matchesStatus =
                                !status || computedStatus.includes(status);

                            return matchesKeyword && matchesStatus;
                        })}
                        onShowDetail={showDetailModal}
                    />
                </div>
            </PageContainer>

            {/* Modal hiển thị chi tiết số VIN và phân bố kho */}
            <VehicleDetailModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                vehicle={selectedVehicle}
            />
        </AdminLayout>
    );
}

export default EVMGetAllInventory;