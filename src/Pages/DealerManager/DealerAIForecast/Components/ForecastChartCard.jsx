import React from "react";
import { ProCard } from "@ant-design/pro-components";
import { Line } from "@ant-design/plots";
import { Empty, Tag } from "antd";

function ForecastChartCard({ allVehiclesData, forecastByVehicle }) {
  // Kiểm tra có dữ liệu không
  if (!allVehiclesData || allVehiclesData.length === 0 || !forecastByVehicle) {
    return (
      <ProCard title="Biểu Đồ Dự Báo Tổng Hợp" bordered className="mb-4">
        <Empty description="Không có dữ liệu dự báo" />
      </ProCard>
    );
  }

  // Xử lý dữ liệu để tổng hợp tất cả xe
  const processedData = [];
  const colors = [
    "#1890ff", // Xanh dương
    "#52c41a", // Xanh lá
    "#fa8c16", // Cam
    "#eb2f96", // Hồng
    "#722ed1", // Tím
    "#13c2c2", // Xanh ngọc
    "#fa541c", // Đỏ cam
    "#2f54eb", // Xanh đậm
    "#faad14", // Vàng
    "#a0d911", // Xanh chanh
    "#f5222d", // Đỏ
    "#531dab", // Tím đậm
  ];

  // Tạo color mapping cho từng xe dựa trên evTemplateId
  const colorMap = {};
  const vehicleNameMap = {};

  allVehiclesData.forEach((vehicle, index) => {
    // Tạo tên xe, loại bỏ các giá trị null/undefined/empty/string "null"
    const parts = [
      vehicle.modelName,
      vehicle.versionName,
      vehicle.colorName,
    ].filter((part) => {
      return (
        part !== null &&
        part !== undefined &&
        part !== "" &&
        part !== "null" &&
        String(part).trim() !== "" &&
        String(part).toLowerCase() !== "null"
      );
    });
    const vehicleName = parts.join(" - ");

    // Map màu theo evTemplateId để đảm bảo mỗi xe có 1 màu riêng
    vehicleNameMap[vehicle.evTemplateId] = vehicleName;
    colorMap[vehicleName] = colors[index % colors.length];

    console.log(
      `Vehicle ${index}: ${vehicleName} -> Color: ${
        colors[index % colors.length]
      }`
    );
  });
  allVehiclesData.forEach((vehicle) => {
    const forecastData = forecastByVehicle[vehicle.evTemplateId] || [];

    // Tạo tên xe, loại bỏ các giá trị null/undefined/empty/string "null"
    const parts = [
      vehicle.modelName,
      vehicle.versionName,
      vehicle.colorName,
    ].filter((part) => {
      return (
        part !== null &&
        part !== undefined &&
        part !== "" &&
        part !== "null" &&
        String(part).trim() !== "" &&
        String(part).toLowerCase() !== "null"
      );
    });
    const vehicleName = parts.join(" - ");

    forecastData.forEach((item) => {
      const date = new Date(item.targetDate);
      const day = date.getUTCDate();
      const month = date.getUTCMonth() + 1;
      const year = date.getUTCFullYear();

      processedData.push({
        dateLabel: `${String(day).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}/${year}`,
        dateShort: `${String(day).padStart(2, "0")}/${String(month).padStart(
          2,
          "0"
        )}`,
        forecast: Number(item.forecast.toFixed(3)),

        vehicle: vehicleName,
        quantity: vehicle.quantity,
      });
    });
  });

  if (processedData.length === 0) {
    return (
      <ProCard title="Biểu Đồ Dự Báo Tổng Hợp" bordered className="mb-4">
        <Empty description="Không có dữ liệu dự báo" />
      </ProCard>
    );
  }

  // Lấy danh sách các tên xe duy nhất theo thứ tự xuất hiện
  const uniqueVehicles = [...new Set(processedData.map((d) => d.vehicle))];

  // Tạo array màu theo đúng thứ tự của uniqueVehicles
  const colorArray = uniqueVehicles.map((vehicleName, idx) => {
    const color = colorMap[vehicleName];
    return color || "#1890ff";
  });

  const config = {
    data: processedData,
    xField: "dateShort",
    yField: "forecast",
    seriesField: "vehicle",
    smooth: true,
    // Sử dụng array màu để map theo uniqueVehicles
    color: colorArray,
    point: {
      size: 4,
      shape: "circle",
    },
    legend: {
      position: "top-left",
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
    yAxis: {
      title: {
        text: "Dự báo nhu cầu (xe)",
        style: {
          fontSize: 13,
          fontWeight: 500,
        },
      },
      label: {
        formatter: (v) => {
          const num = parseFloat(v);
          return num.toFixed(1);
        },
      },
    },
    xAxis: {
      title: {
        text: "Ngày",
        style: {
          fontSize: 13,
          fontWeight: 500,
        },
      },
      label: {
        style: {
          fontSize: 10,
        },
        rotate: -45,
      },
    },

    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.vehicle,
          value: `${datum.forecast.toFixed(2)} xe`,
        };
      },
      title: (title, datum) => {
        return datum?.dateLabel || title;
      },
    },
    lineStyle: {
      lineWidth: 2,
    },
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
  };

  // Tính tổng số xe và trung bình dự báo
  const totalQuantity = allVehiclesData.reduce(
    (sum, vehicle) => sum + vehicle.quantity,
    0
  );
  const totalForecastPoints = processedData.length;
  const avgForecast =
    processedData.reduce((sum, item) => sum + item.forecast, 0) /
    totalForecastPoints;

  return (
    <ProCard
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            Biểu Đồ Dự Báo Tổng Hợp Tất Cả Xe
          </span>
          <div className="flex gap-2">
            <Tag color="blue">Tổng loại xe: {allVehiclesData.length}</Tag>
            <Tag color="purple">Tồn kho: {totalQuantity} xe</Tag>
            <Tag color="green">Dự báo TB: {avgForecast.toFixed(2)} xe/ngày</Tag>
          </div>
        </div>
      }
      bordered
      className="mb-4 shadow-md"
    >
      <div className="h-96">
        <Line {...config} />
      </div>
    </ProCard>
  );
}

export default ForecastChartCard;
