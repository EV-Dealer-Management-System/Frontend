import React, { useState } from "react";
import { Select } from "antd";

function QuarterRangeSelector({ onSelect }) {
  const currentYear = new Date().getFullYear();

  // State lưu trữ lựa chọn của người dùng
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(null);

  // Tạo danh sách năm: 2024 -> currentYear + 1
  const years = [];
  for (let y = 2024; y <= currentYear + 1; y++) {
    years.push({ label: `Năm ${y}`, value: y });
  }

  // Danh sách các quý cố định
  const quarters = [
    { label: "Quý 1 (Tháng 1 - 3)", value: 1 },
    { label: "Quý 2 (Tháng 4 - 6)", value: 2 },
    { label: "Quý 3 (Tháng 7 - 9)", value: 3 },
    { label: "Quý 4 (Tháng 10 - 12)", value: 4 },
  ];

  // Hàm xử lý tính toán ngày và gọi callback khi có đủ thông tin
  const triggerSelect = (year, quarter) => {
    if (!year || !quarter) return;

    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    // Lấy ngày cuối cùng của tháng kết thúc quý
    // new Date(year, monthIndex, 0) sẽ trả về ngày cuối cùng của tháng trước đó
    // endMonth ở đây là 3, 6, 9, 12 tương ứng với index tháng 4, 7, 10, 13 trong Date constructor
    // Vì vậy nó sẽ trả về ngày cuối của tháng 3, 6, 9, 12 chuẩn xác.
    const lastDay = new Date(year, endMonth, 0).getDate();

    const from = `${year}-${String(startMonth).padStart(2, "0")}-01T00:00:00Z`;
    const to = `${year}-${String(endMonth).padStart(2, "0")}-${String(
      lastDay
    ).padStart(2, "0")}T23:59:59Z`;

    onSelect({ from, to });
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    if (selectedQuarter) {
      triggerSelect(value, selectedQuarter);
    }
  };

  const handleQuarterChange = (value) => {
    setSelectedQuarter(value);
    if (selectedYear) {
      triggerSelect(selectedYear, value);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Chọn khoảng thời gian dự báo
      </label>
      <div className="flex gap-4">
        <Select
          placeholder="Chọn Năm"
          value={selectedYear}
          onChange={handleYearChange}
          options={years}
          className="w-1/3"
          size="large"
        />
        <Select
          placeholder="Chọn Quý"
          value={selectedQuarter}
          onChange={handleQuarterChange}
          options={quarters}
          className="w-2/3"
          size="large"
        />
      </div>
    </div>
  );
}

export default QuarterRangeSelector;
