import React, { useState, useEffect } from "react";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { message, Spin, Alert } from "antd";
import DealerManagerLayout from "../../../Components/DealerManager/DealerManagerLayout";
import VehicleSelector from "./Components/VehicleSelector";
import QuarterSelector from "./Components/QuarterSelector";
import ForecastChart from "./Components/ForecastChart";
import { GetEVDealerInventory } from "../../../App/DealerManager/DealerAlForecast/GetDealerInventory";
import { GetEVTemplateByVersionAndColor } from "../../../App/DealerManager/DealerAlForecast/GetEVTemplateByVersionAndColor";
import { GetEVForecastSeries } from "../../../App/DealerManager/DealerAlForecast/GetEVForecastSeries";

function DealerAIForecast() {
    const [inventoryData, setInventoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [dateRange, setDateRange] = useState({ from: null, to: null });

    // Lấy danh sách xe trong kho
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

    // Khi chọn xe, lấy template
    const handleVehicleSelect = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setLoading(true);
        try {
            const response = await GetEVTemplateByVersionAndColor(
                vehicle.versionId,
                vehicle.colorId
            );
            if (response.isSuccess) {
                setSelectedTemplate(response.result);
            } else {
                message.error(response.message || "Không thể lấy thông tin template");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi lấy thông tin template");
        } finally {
            setLoading(false);
        }
    };

    // Khi chọn quý, lấy dự báo
    const handleQuarterSelect = async (quarter) => {
        if (!selectedTemplate) {
            message.warning("Vui lòng chọn xe trước");
            return;
        }

        setDateRange(quarter);
        setLoading(true);
        try {
            console.log("Fetching forecast with:", {
                templateId: selectedTemplate.id,
                from: quarter.from,
                to: quarter.to
            });

            const response = await GetEVForecastSeries(
                selectedTemplate.id,
                quarter.from,
                quarter.to
            );

            console.log("Forecast Response:", response);

            if (response.isSuccess) {
                const resultData = response.result;

                // Kiểm tra và xử lý dữ liệu ngày
                const processedData = resultData.map(item => ({
                    ...item,
                    targetDate: item.targetDate || new Date().toISOString()
                }));

                console.log("Processed Forecast Data:", processedData);
                setForecastData(processedData);
                message.success("Lấy dữ liệu dự báo thành công");
            } else {
                console.error("Forecast Failed:", response.message);
                message.error(response.message || "Không thể lấy dữ liệu dự báo");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi lấy dữ liệu dự báo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DealerManagerLayout>
            <PageContainer
                title="Dự Báo AI Cho Xe Điện"
                subTitle="Hệ thống phân tích và dự báo nhu cầu thị trường dựa trên AI"
                className="bg-gray-50 min-h-screen"
            >
                <Spin spinning={loading} tip="Đang xử lý dữ liệu...">
                    <ProCard
                        direction="column"
                        ghost
                        gutter={[0, 16]}
                        className="mb-6"
                    >
                        {/* Control Panel */}
                        <ProCard
                            title="Thiết lập tham số phân tích"
                            bordered
                            headerBordered
                            split="vertical"
                            className="shadow-sm"
                        >
                            <ProCard colSpan={{ xs: 24, md: 12 }}>
                                <VehicleSelector
                                    inventoryData={inventoryData}
                                    selectedVehicle={selectedVehicle}
                                    onSelect={handleVehicleSelect}
                                />
                            </ProCard>
                            <ProCard colSpan={{ xs: 24, md: 12 }}>
                                {selectedTemplate ? (
                                    <QuarterSelector
                                        selectedTemplate={selectedTemplate}
                                        onSelect={handleQuarterSelect}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 italic">
                                        Vui lòng chọn xe để tiếp tục chọn thời gian
                                    </div>
                                )}
                            </ProCard>
                        </ProCard>

                        {/* Forecast Chart Section */}
                        {forecastData.length > 0 ? (
                            <ForecastChart
                                data={forecastData}
                                vehicleName={`${selectedVehicle?.modelName} - ${selectedVehicle?.versionName} - ${selectedVehicle?.colorName}`}
                                dateRange={dateRange}
                            />
                        ) : (
                            <ProCard bordered className="shadow-sm text-center py-12">
                                <div className="text-gray-400">
                                    <p className="text-lg mb-2">Chưa có dữ liệu phân tích</p>
                                    <p className="text-sm">Vui lòng chọn mẫu xe và khoảng thời gian để xem dự báo từ AI</p>
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
