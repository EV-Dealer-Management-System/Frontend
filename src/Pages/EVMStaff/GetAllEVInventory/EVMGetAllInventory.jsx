import React, { useState, useEffect, useCallback } from "react";
import { Button, message, Input, Select } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import EVMStaffLayout from "../../../Components/EVMStaff/EVMStaffLayout";
import { getAllEVInventory } from "../../../App/EVMAdmin/GetAllEVInventory/GetAllEVInventory";
import { getAllWarehouses } from "../../../App/EVMAdmin/GetAllEVInventory/GetAllEVWarehouse";
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

    // Fetch danh sách warehouses từ API
    const fetchWarehouses = useCallback(async () => {
        try {
            console.log("Fetching warehouses...");
            const response = await getAllWarehouses();
            console.log("Warehouses API response:", response);

            if (response?.isSuccess && Array.isArray(response.result)) {
                // Chuyển đổi dữ liệu warehouse thành options cho Select
                const warehouseOptionsArray = response.result.map(warehouse => ({
                    value: warehouse.id,
                    label: warehouse.warehouseName,
                    warehouseType: warehouse.warehouseType,
                    dealerId: warehouse.dealerId,
                    evcInventoryId: warehouse.evcInventoryId
                })).sort((a, b) => a.label.localeCompare(b.label, 'vi'));

                setWarehouseOptions(warehouseOptionsArray);
                console.log("Warehouse options updated:", warehouseOptionsArray);
            } else {
                console.log("Failed to fetch warehouses:", response);
                message.error("Không thể tải danh sách kho hàng");
                setWarehouseOptions([]);
            }
        } catch (error) {
            console.error("Error fetching warehouses:", error);
            message.error("Lỗi khi tải danh sách kho hàng");
            setWarehouseOptions([]);
        }
    }, []);

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
    }, []);

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
        // Load warehouses và inventory data song song
        const initializeData = async () => {
            await Promise.all([
                fetchWarehouses(),
                fetchInventoryData()
            ]);
        };

        initializeData();
    }, [fetchWarehouses, fetchInventoryData]);

    return (
        <EVMStaffLayout>
            <PageContainer
                title="Quản Lý Kho Xe Toàn Hệ Thống"
                extra={[
                    <>
                        <Select
                            key="warehouse-filter"
                            placeholder="Chọn kho"
                            value={warehouseFilter || undefined}
                            style={{ width: 250 }}
                            allowClear
                            onChange={handleWarehouseChange}
                            loading={loading}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            <Option value="">Tất cả kho</Option>
                            {warehouseOptions.map(option => {
                                const warehouseTypeText = option.warehouseType === 1 ? "Đại lý" : "Hãng";
                                return (
                                    <Option key={option.value} value={option.value}>
                                        {option.label} ({warehouseTypeText})
                                    </Option>
                                );
                            })}
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
        </EVMStaffLayout>
    );
}

export default EVMGetAllInventory;
