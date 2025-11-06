import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { PageContainer } from "@ant-design/pro-components";
import { ReloadOutlined } from "@ant-design/icons";
import { GetAllEVInventory } from "../../../App/DealerStaff/EVInventory/GetAllEVInventory";
import { GetEVTemplateByVersionAndColor } from "../../../App/DealerStaff/EVInventory/GetEVTemplateByVersionAndColor";
import DealerStaffLayout from "../../../Components/DealerStaff/DealerStaffLayout";

// Components
import StatisticsCards from "./Components/StatisticsCards";
import VehicleGrid from "./Components/VehicleGrid";
import VehicleDetails from "./Components/VehicleDetails";
import EmptyState from "./Components/EmptyState";
import LoadingState from "./Components/LoadingState";
import ErrorState from "./Components/ErrorState";

function EVVersionDetails() {
    const [loading, setLoading] = useState(true);
    const [vehicleTemplates, setVehicleTemplates] = useState([]);
    const [error, setError] = useState(null);

    // State cho popup chi tiết xe
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState(null);

    // Lấy danh sách inventory và template khi component mount
    useEffect(() => {
        fetchAllVehicleData();
    }, []);

    const fetchAllVehicleData = async () => {
        try {
            setLoading(true);
            const response = await GetAllEVInventory();

            if (response.isSuccess && response.result) {
                const inventory = response.result;

                // Lấy thông tin chi tiết cho từng xe
                const templatePromises = inventory.map(async (vehicle) => {
                    try {
                        const templateResponse = await GetEVTemplateByVersionAndColor(
                            vehicle.versionId,
                            vehicle.colorId
                        );

                        if (
                            templateResponse.isSuccess &&
                            templateResponse.result
                        ) {
                            const template = templateResponse.result;
                            const vehicleData = {
                                ...template,
                                quantity: vehicle.quantity,
                                versionId: template.version?.versionId || vehicle.versionId,
                                // Flatten nested data để dễ truy cập
                                versionName: template.version?.versionName,
                                modelName: template.version?.modelName,
                                colorName: template.color?.colorName,
                            };
                            console.log("Vehicle data structure:", vehicleData); // Debug log
                            return vehicleData;
                        }
                        return null;
                    } catch (error) {
                        console.error(
                            `Error fetching template for vehicle ${vehicle.versionId}:`,
                            error
                        );
                        return null;
                    }
                });

                const templates = await Promise.all(templatePromises);
                const filteredTemplates = templates.filter((t) => t !== null);
                console.log("Total templates after filter:", filteredTemplates.length);
                console.log("Templates data:", filteredTemplates);
                setVehicleTemplates(filteredTemplates);
            } else {
                setError("Không thể tải danh sách xe từ kho");
            }
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            setError("Lỗi khi tải danh sách xe từ kho");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi click xem chi tiết xe
    const handleViewDetails = (versionId) => {
        setSelectedVersionId(versionId);
        setDetailsVisible(true);
    };

    // Đóng popup chi tiết
    const handleCloseDetails = () => {
        setDetailsVisible(false);
        setSelectedVersionId(null);
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format số ngắn gọn (165,990,000 -> 165.99 triệu)
    const formatPriceShort = (price) => {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(2)} triệu`;
        }
        return formatPrice(price);
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchAllVehicleData} />;
    }

    // Tính toán thống kê - chỉ tính xe còn đang bán
    const activeVehicles = vehicleTemplates.filter((v) => v.isActive !== false);
    const totalVehicles = activeVehicles.length;
    const availableVehicles = activeVehicles.filter(
        (v) => v.quantity > 0
    ).length;

    return (
        <DealerStaffLayout>
            <PageContainer
                title="Danh Sách Xe Điện"
                subTitle={`${totalVehicles} mẫu xe còn bán | ${availableVehicles} có sẵn`}
                extra={[
                    <Button
                        key="refresh"
                        onClick={fetchAllVehicleData}
                        type="primary"
                        icon={<ReloadOutlined />}
                    >
                        Làm mới
                    </Button>,
                ]}
            >
                {/* Thống kê */}
                {/* <StatisticsCards
                    totalVehicles={totalVehicles}
                    availableVehicles={availableVehicles}
                    activeVehicles={activeVehicles}
                    totalInventory={totalInventory}
                /> */}

                {/* Danh sách xe */}
                {activeVehicles.length === 0 ? (
                    <EmptyState onReload={fetchAllVehicleData} />
                ) : (
                    <VehicleGrid
                        vehicles={vehicleTemplates}
                        formatPriceShort={formatPriceShort}
                        onViewDetails={handleViewDetails}
                    />
                )}

                {/* Popup chi tiết xe */}
                <VehicleDetails
                    visible={detailsVisible}
                    onClose={handleCloseDetails}
                    versionId={selectedVersionId}
                />
            </PageContainer>
        </DealerStaffLayout>
    );
}

export default EVVersionDetails;
