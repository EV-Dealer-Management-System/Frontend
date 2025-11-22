import React, { useState, useEffect } from "react";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { message, Spin, Alert, Row, Col } from "antd";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import QuarterRangeSelector from "./Components/QuarterRangeSelector";
import ForecastChartCard from "./Components/ForecastChartCard";
import { GetEVDealerInventory } from "../../../App/DealerManager/DealerAlForecast/GetDealerInventory";
import { GetEVForecastSeries } from "../../../App/DealerManager/DealerAlForecast/GetEVForecastSeries";

function DealerAIForecast() {
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [forecastByVehicle, setForecastByVehicle] = useState({});

    // Lấy danh sách xe trong kho khi load trang
    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await GetEVDealerInventory();
            if (response.isSuccess) {
                setInventoryData(response.result);
            } else {
                message.error(response.message || "Không thể lấy danh sách xe");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi lấy danh sách xe trong kho");
        } finally {
            setLoading(false);
        }
    };

    // Khi chọn quý, lấy dự báo cho TẤT CẢ xe trong kho
    const handleQuarterSelect = async (quarter) => {
        if (inventoryData.length === 0) {
            message.warning("Không có xe trong kho để dự báo");
            return;
        }

        setDateRange(quarter);
        setLoading(true);

        const forecasts = {};
        let successCount = 0;
        let failCount = 0;

        // Gọi API dự báo cho từng xe
        for (const vehicle of inventoryData) {
            try {
                const response = await GetEVForecastSeries(
                    vehicle.evTemplateId,
                    quarter.from,
                    quarter.to
                );

                if (response.isSuccess && response.result) {
                    forecasts[vehicle.evTemplateId] = response.result;
                    successCount++;
                } else {
                    forecasts[vehicle.evTemplateId] = [];
                    failCount++;
                }
            } catch (error) {
                console.error(`Lỗi khi lấy dự báo cho xe ${vehicle.modelName}:`, error);
                forecasts[vehicle.evTemplateId] = [];
                failCount++;
            }
        }

        setForecastByVehicle(forecasts);
        setLoading(false);

        if (successCount > 0) {
            message.success(
                `Lấy dữ liệu dự báo thành công cho ${successCount}/${inventoryData.length} xe`
            );
        }
        if (failCount > 0) {
            message.warning(`Không thể lấy dữ liệu cho ${failCount} xe`);
        }
    };

    return (
        <DealerManagerLayout>
            <PageContainer
                title="Dự Báo AI Cho Tất Cả Xe Điện"
                subTitle="Hệ thống phân tích và dự báo nhu cầu thị trường dựa trên AI"
                className="bg-gray-50 min-h-screen"
            >
                <Spin spinning={loading} tip="Đang xử lý dữ liệu dự báo...">
                    <ProCard direction="column" ghost gutter={[0, 16]} className="mb-6">
                        {/* Control Panel - Chỉ chọn thời gian */}
                        <ProCard
                            title="Chọn khoảng thời gian dự báo"
                            bordered
                            headerBordered
                            className="shadow-sm"
                        >
                            <div className="max-w-md">
                                <QuarterRangeSelector onSelect={handleQuarterSelect} />
                            </div>
                            {inventoryData.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Hiện có <strong>{inventoryData.length} loại xe</strong>{" "}
                                        trong kho sẽ được phân tích dự báo
                                    </p>
                                </div>
                            )}
                        </ProCard>

                        {/* Forecast Charts Section */}
                        {Object.keys(forecastByVehicle).length > 0 ? (
                            <div>
                                <Alert
                                    message="Kết quả dự báo AI"
                                    description={`Dự báo từ ${dateRange.from} đến ${dateRange.to}`}
                                    type="info"
                                    showIcon
                                    className="mb-4"
                                />
                                <ForecastChartCard
                                    allVehiclesData={inventoryData}
                                    forecastByVehicle={forecastByVehicle}
                                />
                            </div>
                        ) : (
                            <ProCard bordered className="shadow-sm text-center py-12">
                                <div className="text-gray-400">
                                    <p className="text-lg mb-2">Chưa có dữ liệu phân tích</p>
                                    <p className="text-sm">
                                        Vui lòng chọn khoảng thời gian để xem dự báo AI cho tất cả
                                        xe trong kho
                                    </p>
                                </div>
                            </ProCard>
                        )}
                    </ProCard>
                </Spin>
            </PageContainer>
        </DealerManagerLayout>
    );
}

export default DealerAIForecast;
