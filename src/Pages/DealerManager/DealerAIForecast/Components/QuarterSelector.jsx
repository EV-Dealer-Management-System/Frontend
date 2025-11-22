import React from "react";
import { Segmented, Form } from "antd";

function QuarterSelector({ selectedTemplate, onSelect }) {
  // Tính toán các quý trong năm hiện tại
  const currentYear = new Date().getFullYear();

  const quarters = [
    {
      label: "Quý 1",
      value: "Q1",
      from: `${currentYear}-01-01T00:00:00Z`,
      to: `${currentYear}-03-31T23:59:59Z`,
    },
    {
      label: "Quý 2",
      value: "Q2",
      from: `${currentYear}-04-01T00:00:00Z`,
      to: `${currentYear}-06-30T23:59:59Z`,
    },
    {
      label: "Quý 3",
      value: "Q3",
      from: `${currentYear}-07-01T00:00:00Z`,
      to: `${currentYear}-09-30T23:59:59Z`,
    },
    {
      label: "Quý 4",
      value: "Q4",
      from: `${currentYear}-10-01T00:00:00Z`,
      to: `${currentYear}-12-31T23:59:59Z`,
    },
  ];

  const handleChange = (value) => {
    const selected = quarters.find(q => q.value === value);
    if (selected) {
      onSelect(selected);
    }
  };

  return (
    <Form layout="vertical">
      <Form.Item
        label={<span className="font-medium text-gray-700">Chọn khoảng thời gian ({currentYear})</span>}
        className="mb-0"
      >
        <Segmented
          options={quarters.map(q => ({ label: q.label, value: q.value }))}
          block
          size="large"
          onChange={handleChange}
          className="bg-blue-50"
        />
      </Form.Item>
      <div className="mt-3 text-xs text-gray-500">
        * Dữ liệu dự báo được cập nhật hàng ngày dựa trên xu hướng thị trường
      </div>
    </Form>
  );
}

export default QuarterSelector;
