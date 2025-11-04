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

    // Từ khóa tìm kiếm & bộ lọc trạng thái
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Fetch dữ liệu kho xe của hãng
    const fetchInventoryData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAllEVInventory();

            if (response.isSuccess) {
                // Thêm key cho mỗi item để Table hoạt động tốt
                const dataWithKeys = response.result.map((item, index) => ({
                    ...item,
                    key: index,
                    id: index + 1
                }));

                setInventoryData(dataWithKeys);
                message.success("Tải dữ liệu kho xe hãng thành công!");
            } else {
                message.error(response.message || "Có lỗi xảy ra khi tải dữ liệu");
            }
        } catch (error) {
            console.error("Error fetching company inventory:", error);
            message.error("Không thể tải dữ liệu kho xe. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    }, []);

    // Làm mới dữ liệu
    const handleRefresh = () => {
        fetchInventoryData();
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
                            key="status-filter"
                            showSearch                     // ✅ Cho phép nhập từ khóa
                            placeholder="Chọn hoặc nhập tình trạng"
                            value={statusFilter || undefined}
                            style={{ width: 280 }}
                            allowClear
                            onSearch={(value) => setStatusFilter(value)}  // ✅ Gõ -> cập nhật
                            onChange={(value) => setStatusFilter(value)}  // ✅ Chọn -> cập nhật
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