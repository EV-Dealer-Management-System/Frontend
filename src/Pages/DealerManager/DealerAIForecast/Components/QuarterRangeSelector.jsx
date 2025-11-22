import React from "react";
import { Select } from "antd";

function QuarterRangeSelector({ onSelect }) {
    const currentYear = new Date().getFullYear();

    // Tạo danh sách các quý từ năm 2024 đến năm hiện tại + 1
    const quarters = [];
    for (let year = 2024; year <= currentYear + 1; year++) {
        for (let q = 1; q <= 4; q++) {
            const startMonth = (q - 1) * 3 + 1;
            const endMonth = q * 3;
            const lastDay = new Date(year, endMonth, 0).getDate();
            const from = `${year}-${String(startMonth).padStart(2, '0')}-01T00:00:00Z`;
            const to = `${year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59Z`;

            quarters.push({
                label: `Quý ${q} - ${year}`,
                value: `${year}-Q${q}`,
                from,
                to
            });
        }
    }

    const handleChange = (value) => {
        const selected = quarters.find(q => q.value === value);
        if (selected) {
            onSelect({ from: selected.from, to: selected.to });
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn khoảng thời gian dự báo
            </label>
            <Select
                placeholder="Chọn quý để xem dự báo"
                onChange={handleChange}
                options={quarters}
                className="w-full"
                size="large"
            />
        </div>
    );
}

export default QuarterRangeSelector;
