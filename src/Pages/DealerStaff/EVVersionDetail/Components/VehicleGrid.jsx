import React from "react";
import { Row, Col } from "antd";
import VehicleCard from "../Components/VehicleCard";

function VehicleGrid({ vehicles, formatPriceShort, onViewDetails }) {
  // Lọc chỉ hiển thị những xe còn đang bán (isActive: true)
  const activeVehicles = vehicles.filter(vehicle => vehicle.isActive !== false);
  const vehicleCount = activeVehicles.length;

  // Điều chỉnh layout dựa trên số lượng xe
  const getColProps = () => {
    if (vehicleCount === 1) {
      // Nếu chỉ có 1 xe: hiển thị ở giữa với max-width hợp lý
      return {
        xs: 24,
        sm: { span: 20, offset: 2 },
        md: { span: 16, offset: 4 },
        lg: { span: 12, offset: 6 },
        xl: { span: 10, offset: 7 },
      };
    } else if (vehicleCount === 2) {
      // Nếu có 2 xe: hiển thị 2 cột
      return {
        xs: 24,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
      };
    } else if (vehicleCount === 3) {
      // Nếu có 3 xe: hiển thị 3 cột
      return {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 8,
        xl: 8,
      };
    } else {
      // Nếu có 4+ xe: hiển thị grid responsive bình thường
      return {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 6,
        xl: 6,
      };
    }
  };

  const colProps = getColProps();

  return (
    <Row gutter={[16, 16]} justify={vehicleCount === 1 ? "center" : "start"}>
      {activeVehicles.map((vehicle, index) => (
        <Col {...colProps} key={index}>
          <VehicleCard
            vehicle={vehicle}
            formatPriceShort={formatPriceShort}
            onViewDetails={onViewDetails}
          />
        </Col>
      ))}
    </Row>
  );
}

export default VehicleGrid;
