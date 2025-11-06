import React from "react";
import { Row, Col } from "antd";
import VehicleCard from "../Components/VehicleCard";

function VehicleGrid({ vehicles, formatPriceShort, onViewDetails }) {
  // Lọc chỉ hiển thị những xe còn đang bán (isActive: true)
  const activeVehicles = vehicles.filter(vehicle => vehicle.isActive !== false);

  return (
    <Row gutter={[16, 16]}>
      {activeVehicles.map((vehicle, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
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
