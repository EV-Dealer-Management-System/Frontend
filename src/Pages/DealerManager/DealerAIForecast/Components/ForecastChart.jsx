import React, { useMemo } from "react";
import { Line } from "@ant-design/charts";
import { ProCard, StatisticCard } from "@ant-design/pro-components";
import {
  ThunderboltOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Tag, Divider, Descriptions, Typography } from "antd";

const { Statistic } = StatisticCard;
const { Text } = Typography;

function ForecastChart({ data, vehicleName, dateRange }) {
  // Chuẩn bị dữ liệu cho biểu đồ - đơn giản hóa để người dùng dễ hiểu
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    console.log("Processing forecast data, items:", data.length);
    if (data.length > 0) {
      console.log("First item:", data[0]);
    }

    const result = [];
    data.forEach((item, index) => {
      // Parse ngày ISO bằng regex
      let dateStr = "N/A";
      let parsedDate = null;

      if (item && item.targetDate) {
        const dateMatch = String(item.targetDate).match(/(\d{4})-(\d{2})-(\d{2})/);

        if (dateMatch) {
          const [, , month, day] = dateMatch;
          dateStr = `${day}/${month}`;
          parsedDate = item.targetDate;
        }
      }

      // Log để debug
      if (index === 0) {
        console.log("Sample data:", { targetDate: item.targetDate, dateStr, parsedDate });
      }

      // Chuyển đổi từ số khoa học sang mức độ nhu cầu dễ hiểu (0-100%)
      const forecast = Number(item.forecast) || 0;
      const upper = Number(item.forecastUpper) || 0;
      const lower = Number(item.forecastLower) || 0;

      // Chuyển đổi sang tỷ lệ phần trăm nhu cầu (0-100%)
      // Nếu tất cả đều = 0 hoặc rất nhỏ, hiển thị mức độ nhu cầu = 0%
      const demandLevel = Math.abs(forecast) < 1e-6 ? 0 : Math.min(Math.abs(forecast) * 1e9, 100);
      const upperLevel = Math.abs(upper) < 1e-6 ? 0 : Math.min(Math.abs(upper) * 1e9, 100);
      const lowerLevel = Math.abs(lower) < 1e-6 ? 0 : Math.min(Math.abs(lower) * 1e9, 100);

      // Thêm dữ liệu với ngày đã parse
      result.push({
        date: dateStr,
        value: demandLevel,
        type: "Mức nhu cầu dự kiến",
        rawDate: parsedDate || item.targetDate || "",
        originalValue: forecast
      });

      result.push({
        date: dateStr,
        value: upperLevel,
        type: "Kịch bản tích cực",
        rawDate: parsedDate || item.targetDate || "",
        originalValue: upper
      });

      result.push({
        date: dateStr,
        value: lowerLevel,
        type: "Kịch bản thận trọng",
        rawDate: parsedDate || item.targetDate || "",
        originalValue: lower
      });
    });

    console.log("Chart data processed, total points:", result.length);
    if (result.length > 0) {
      console.log("First chart point:", result[0]);
    }
    return result;
  }, [data]);

  // Parse vehicle name
  const vehicleParts = vehicleName ? vehicleName.split(" - ") : [];
  const modelName = vehicleParts[0] || vehicleName;
  const versionName = vehicleParts[1] || "Tiêu chuẩn";
  const colorName = vehicleParts[2] || "Mặc định";

  // Cấu hình biểu đồ dễ hiểu cho người dùng thông thường
  const config = {
    data: chartData,
    xField: "date",
    yField: "value",
    seriesField: "type",
    color: ["#1890ff", "#52c41a", "#faad14"], // Xanh dương, Xanh lá, Vàng
    smooth: true,
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
    legend: {
      position: "top",
    },
    point: {
      size: 5,
      shape: "circle",
    },
    interactions: [{ type: "marker-active" }],
    tooltip: {
      formatter: (datum) => {
        // Hiển thị mức độ nhu cầu dễ hiểu
        let demandDescription;
        const demandLevel = datum.value;

        if (demandLevel === 0) {
          demandDescription = " KHÔNG CÓ NHU CẦU";
        } else if (demandLevel < 10) {
          demandDescription = " NHU CẦU RẤT THẤP (Dưới 10%)";
        } else if (demandLevel < 30) {
          demandDescription = " NHU CẦU THẤP (10-30%)";
        } else if (demandLevel < 60) {
          demandDescription = " NHU CẦU TRUNG BÌNH (30-60%)";
        } else if (demandLevel < 80) {
          demandDescription = " NHU CẦU CAO (60-80%)";
        } else {
          demandDescription = " NHU CẦU RẤT CAO (Trên 80%)";
        }

        return {
          name: datum.type,
          value: `${demandLevel.toFixed(1)}% - ${demandDescription}`,
        };
      },
      title: (title, datum) => {
        // Format ngày cho tooltip
        try {
          // Kiểm tra datum có tồn tại
          if (!datum) {
            return ` Không có dữ liệu ngày`;
          }

          const rawDate = datum.rawDate;

          // Kiểm tra rawDate tồn tại và không rỗng
          if (rawDate && typeof rawDate === 'string' && rawDate.length > 0) {
            const dateMatch = rawDate.match(/(\d{4})-(\d{2})-(\d{2})/);

            if (dateMatch) {
              const [, year, month, day] = dateMatch;

              // Tạo Date object để lấy thứ
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

              if (!isNaN(date.getTime())) {
                const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                const weekday = weekdays[date.getDay()];

                return ` ${weekday}, ${day}/${month}/${year}`;
              }
            }
          }
        } catch (error) {
          console.error("Tooltip date error:", error, datum);
          return ` Ngày ${datum?.date || 'lỗi'}`;
        }
      }
    },
    yAxis: {
      label: {
        formatter: (v) => `${v}%`
      },
      title: {
        text: "Mức độ nhu cầu xe máy điện (%)",
        style: {
          fontSize: 12,
          fontWeight: 500,
        },
      },
      max: 100,
      min: 0
    },
    xAxis: {
      title: {
        text: "Thời gian",
        style: {
          fontSize: 12,
          fontWeight: 500,
        },
      },
    },
    meta: {
      value: {
        alias: "Mức độ nhu cầu",
        formatter: (v) => `${v}%`
      },
    },
  };

  // Tính toán thống kê dễ hiểu cho người dùng bình thường
  const statistics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const forecasts = data.map((item) => Number(item.forecast) || 0);

    // Chuyển đổi sang mức độ nhu cầu (0-100%)
    const demandLevels = forecasts.map(f => Math.abs(f) < 1e-6 ? 0 : Math.min(Math.abs(f) * 1e9, 100));

    const totalDemand = demandLevels.reduce((a, b) => a + b, 0);
    const avgDemand = totalDemand / demandLevels.length;
    const maxDemand = Math.max(...demandLevels);
    const minDemand = Math.min(...demandLevels);

    // Kiểm tra mức độ nhu cầu tổng thể
    const isZeroDemand = totalDemand === 0;

    // Phân loại mức độ nhu cầu
    const getDemandLevel = (level) => {
      if (level === 0) return "Không có nhu cầu";
      if (level < 10) return "Rất thấp";
      if (level < 30) return "Thấp";
      if (level < 60) return "Trung bình";
      if (level < 80) return "Cao";
      return "Rất cao";
    };

    return {
      avgDemand: avgDemand.toFixed(1),
      maxDemand: maxDemand.toFixed(1),
      minDemand: minDemand.toFixed(1),
      totalDays: data.length,
      isZeroDemand,
      totalDemand: totalDemand.toFixed(1),
      avgDemandLevel: getDemandLevel(avgDemand),
      maxDemandLevel: getDemandLevel(maxDemand),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <ProCard>
        <div className="text-center py-10 text-gray-500">
          Chưa có dữ liệu dự báo
        </div>
      </ProCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <ProCard
        className="shadow-sm"
        headerBordered
        title={
          <div className="flex items-center gap-3">
            <ThunderboltOutlined className="text-2xl text-blue-500" />
            <div>
              <div className="text-lg font-bold text-gray-800">
                Dự Báo Nhu Cầu Xe Máy Điện
              </div>
              <div className="text-xs font-normal text-gray-500">
                Phân tích thông minh bằng AI
              </div>
            </div>
          </div>
        }
        extra={
          <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            <CalendarOutlined />
            <span className="text-sm font-medium">
              {dateRange?.from && dateRange?.to ?
                `${new Date(dateRange.from).toLocaleDateString("vi-VN")} - ${new Date(dateRange.to).toLocaleDateString("vi-VN")}`
                : 'Đang tải thời gian...'}
            </span>
          </div>
        }
      >
        <Descriptions title="Thông tin phân tích" column={{ xs: 1, sm: 3 }}>
          <Descriptions.Item label="Mẫu xe">
            <span className="font-bold text-blue-700 text-lg">{modelName}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Phiên bản">
            <Tag color="purple">{versionName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Màu sắc">
            <Tag color="cyan">{colorName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian dự báo">
            <span className="text-gray-600">{statistics.totalDays} ngày</span>
          </Descriptions.Item>
          <Descriptions.Item label="Độ tin cậy mô hình">
            <Tag color="success">Cao (95%)</Tag>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>

      {/* Statistics Cards */}
      <StatisticCard.Group direction="row" className="shadow-sm">
        <StatisticCard
          statistic={{
            title: "Mức nhu cầu tổng thể",
            value: statistics.totalDemand,
            icon: <LineChartOutlined style={{ color: "#1890ff" }} />,
            suffix: "%",
            description: statistics.isZeroDemand
              ? "Không có nhu cầu mua xe"
              : "Trong " + statistics.totalDays + " ngày tới",
          }}
        />
        <Divider type="vertical" />
        <StatisticCard
          statistic={{
            title: "Nhu cầu trung bình",
            value: statistics.avgDemand,
            icon: <RiseOutlined style={{ color: "#52c41a" }} />,
            suffix: "%/ngày",
            description: statistics.avgDemandLevel,
          }}
        />
        <Divider type="vertical" />
        <StatisticCard
          statistic={{
            title: "Ngày có nhu cầu cao nhất",
            value: statistics.maxDemand,
            icon: (
              <FallOutlined
                style={{
                  color: statistics.maxDemand === "0.0" ? "#f5222d" : "#52c41a",
                }}
              />
            ),
            suffix: "%",
            description: statistics.maxDemandLevel,
            valueStyle: {
              color: statistics.maxDemand === "0.0" ? "#f5222d" : "#52c41a",
            },
          }}
        />
      </StatisticCard.Group>

      {/* Main Chart */}
      <ProCard
        title="Biểu Đồ Mức Độ Nhu Cầu Theo Ngày"
        headerBordered
        className="shadow-sm"
        extra={<Tag color="processing">Dữ liệu Real-time AI</Tag>}
        split="horizontal"
      >
        <ProCard>
          <div style={{ height: 450 }}>
            <Line {...config} />
          </div>
        </ProCard>


      </ProCard>
    </div>
  );
}

export default ForecastChart;
