import React from "react";
import { Select, Form, Tag } from "antd";
import { CarOutlined } from "@ant-design/icons";

function VehicleSelector({ inventoryData, selectedVehicle, onSelect }) {
  // Tạo options cho Select
  const vehicleOptions = inventoryData.map((item) => ({
    value: item.evTemplateId,
    label: `${item.modelName} - ${item.versionName} - ${item.colorName}`,
    data: item,
  }));

  const handleChange = (value) => {
    const selected = vehicleOptions.find((opt) => opt.value === value);
    if (selected) {
      onSelect(selected.data);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={<span className="font-medium text-gray-700">Chọn mẫu xe phân tích</span>}
        className="mb-0"
      >
        <Select
          className="w-full"
          size="large"
          placeholder="Tìm kiếm xe theo tên, phiên bản, màu sắc..."
          value={selectedVehicle?.evTemplateId}
          onChange={handleChange}
          options={vehicleOptions}
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
          suffixIcon={<CarOutlined className="text-blue-500" />}
          notFoundContent="Không tìm thấy xe trong kho"
        />
      </Form.Item>
      {selectedVehicle && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái kho:</span>
          <Tag color={selectedVehicle.quantity > 0 ? "success" : "error"}>
            {selectedVehicle.quantity > 0 ? `Còn ${selectedVehicle.quantity} xe` : "Hết hàng"}
          </Tag>
        </div>
      )}
    </Form>
  );
}

export default VehicleSelector;
