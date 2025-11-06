import React, { useState } from "react";
import { Typography, Tag, Button, Modal, Carousel, Image } from "antd";
import { ProCard } from "@ant-design/pro-components";
import {
    CarOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function VehicleCard({ vehicle, onViewDetails }) {
    const [showImageModal, setShowImageModal] = useState(false);

    // Format giá VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price);
    };

    // Lấy URL ảnh đầu tiên
    const getImageUrl = () => {
        if (vehicle.imgUrl && Array.isArray(vehicle.imgUrl) && vehicle.imgUrl[0]) {
            return vehicle.imgUrl[0];
        }
        if (vehicle.imageUrl && Array.isArray(vehicle.imageUrl) && vehicle.imageUrl[0]) {
            return vehicle.imageUrl[0];
        }
        if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images[0]) {
            return vehicle.images[0];
        }
        if (vehicle.image) {
            return vehicle.image;
        }
        return null;
    };

    const imageUrl = getImageUrl();

    // Lấy tất cả ảnh
    const getAllImages = () => {
        if (vehicle.imgUrl && Array.isArray(vehicle.imgUrl)) {
            return vehicle.imgUrl;
        }
        if (vehicle.imageUrl && Array.isArray(vehicle.imageUrl)) {
            return vehicle.imageUrl;
        }
        if (vehicle.images && Array.isArray(vehicle.images)) {
            return vehicle.images;
        }
        if (vehicle.image) {
            return [vehicle.image];
        }
        return [];
    };

    const allImages = getAllImages();

    return (
        <>
            <style>
                {`
                    .vehicle-card-image-container:hover .image-overlay {
                        opacity: 1 !important;
                    }
                    
                    .custom-dots li button {
                        background: rgba(255,255,255,0.4) !important;
                    }
                    
                    .custom-dots li.slick-active button {
                        background: #fff !important;
                    }
                    
                    .ant-carousel .slick-prev,
                    .ant-carousel .slick-next {
                        width: 48px !important;
                        height: 48px !important;
                        z-index: 10 !important;
                    }
                    
                    .ant-carousel .slick-prev:before,
                    .ant-carousel .slick-next:before {
                        font-size: 48px !important;
                        color: #fff !important;
                        text-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
                    }
                    
                    .ant-carousel .slick-prev {
                        left: 24px !important;
                    }
                    
                    .ant-carousel .slick-next {
                        right: 24px !important;
                    }
                    
                    .ant-carousel .slick-prev:hover:before,
                    .ant-carousel .slick-next:hover:before {
                        color: #1890ff !important;
                        text-shadow: 0 0 12px rgba(24,144,255,0.8), 0 2px 8px rgba(0,0,0,0.5) !important;
                    }
                    
                    .ant-carousel .slick-prev:hover,
                    .ant-carousel .slick-next:hover {
                        background: rgba(255,255,255,0.1) !important;
                        border-radius: 50% !important;
                    }
                `}
            </style>
            <ProCard
                hoverable
                bordered
                style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    height: "100%",
                }}
                bodyStyle={{ padding: 0 }}
            >
                {/* Ảnh xe */}
                <div
                    className="vehicle-card-image-container"
                    style={{
                        position: "relative",
                        height: "200px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        cursor: allImages.length > 0 ? "pointer" : "default",
                    }}
                    onClick={() => allImages.length > 0 && setShowImageModal(true)}
                >
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={vehicle.modelName || vehicle.version?.modelName}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                console.error("Image load error:", imageUrl);
                                e.target.style.display = "none";
                            }}
                        />
                    ) : (
                        <CarOutlined style={{ fontSize: "64px", color: "rgba(255,255,255,0.3)" }} />
                    )}

                    {/* Overlay khi hover nếu có nhiều ảnh */}
                    {allImages.length > 0 && (
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "rgba(0,0,0,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity 0.3s",
                            }}
                            className="image-overlay"
                        >
                            <div style={{ textAlign: "center", color: "white" }}>
                                <PictureOutlined style={{ fontSize: "32px", marginBottom: "8px" }} />
                                <div style={{ fontSize: "14px", fontWeight: 600 }}>
                                    Xem {allImages.length} ảnh
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status badges */}
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            left: "10px",
                            right: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "8px",
                        }}
                    >
                        <Tag
                            icon={vehicle.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            color={vehicle.isActive ? "success" : "default"}
                            style={{
                                padding: "2px 8px",
                                fontSize: "12px",
                                fontWeight: 500,
                                borderRadius: "4px",
                            }}
                        >
                            {vehicle.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                        </Tag>
                    </div>
                </div>

                {/* Nội dung */}
                <div style={{ padding: "16px" }}>
                    {/* Tên xe */}
                    <Title level={5} style={{ marginBottom: "2px", fontSize: "16px", fontWeight: 600 }}>
                        {vehicle.modelName || vehicle.version?.modelName || "N/A"}
                    </Title>
                    <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: "12px" }}>
                        {vehicle.versionName || vehicle.version?.versionName || "N/A"}
                    </Text>

                    {/* Giá bán */}
                    <div
                        style={{
                            textAlign: "center",
                            padding: "8px",
                            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                            borderRadius: "8px",
                            marginBottom: "12px",
                            border: "1px solid #bbf7d0",
                        }}
                    >
                        <Text type="secondary" style={{ fontSize: "11px", display: "block", marginBottom: "2px" }}>
                            Giá Bán Lẻ
                        </Text>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "3px" }}>
                            <Text style={{ fontSize: "11px", color: "#059669" }}>₫</Text>
                            <Text
                                strong
                                style={{
                                    fontSize: "20px",
                                    color: "#059669",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                }}
                            >
                                {formatPrice(vehicle.price || 0)}
                            </Text>
                            <Text style={{ fontSize: "11px", color: "#059669" }}>₫</Text>
                        </div>
                    </div>

                    {/* Thông tin chi tiết - 2 cột */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                            marginBottom: "12px",
                        }}
                    >
                        {/* Màu sắc */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                padding: "8px 6px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "8px",
                                background: "#fafafa",
                            }}
                        >
                            <Text type="secondary" style={{ fontSize: "11px", display: "block", marginBottom: "4px" }}>
                                Màu sắc
                            </Text>
                            <Text strong style={{ fontSize: "12px", display: "block" }}>
                                {vehicle.color?.colorName || vehicle.colorName || "N/A"}
                            </Text>
                        </div>

                        {/* Số lượng ảnh */}
                        <div
                            style={{
                                textAlign: "center",
                                padding: "8px 6px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "8px",
                                background: "#fafafa",
                            }}
                        >
                            <Text
                                strong
                                style={{
                                    fontSize: "22px",
                                    display: "block",
                                    color: "#1890ff",
                                    lineHeight: 1,
                                    marginTop: "6px",
                                    marginBottom: "6px",
                                }}
                            >
                                {vehicle.imgUrl?.length || 0}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                                Số ảnh
                            </Text>
                            <Text strong style={{ fontSize: "12px", display: "block", color: "#666" }}>
                                hình
                            </Text>
                        </div>
                    </div>

                    {/* Nút xem chi tiết */}
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetails && onViewDetails(vehicle)}
                        block
                        size="middle"
                        style={{
                            height: "36px",
                            fontSize: "14px",
                            fontWeight: 600,
                            borderRadius: "8px",
                        }}
                    >
                        Xem Chi Tiết
                    </Button>
                </div>

                {/* Modal xem ảnh */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <PictureOutlined className="text-blue-600" />
                            <span>Ảnh xe - {vehicle.modelName || vehicle.version?.modelName}</span>
                        </div>
                    }
                    open={showImageModal}
                    onCancel={() => setShowImageModal(false)}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: "1200px" }}
                    centered
                    bodyStyle={{ padding: "24px 16px" }}
                >
                    {allImages.length > 0 ? (
                        <div style={{ position: "relative" }}>
                            <Carousel
                                autoplay
                                arrows
                                dots={{ className: "custom-dots" }}
                                style={{
                                    background: "#000",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                }}
                            >
                                {allImages.map((img, index) => (
                                    <div key={index}>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                background: "#000",
                                                minHeight: "60vh",
                                                maxHeight: "70vh",
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`${vehicle.modelName || vehicle.version?.modelName} - ${index + 1}`}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "70vh",
                                                    width: "auto",
                                                    height: "auto",
                                                    objectFit: "contain",
                                                }}
                                                onError={(e) => {
                                                    console.error("Image load error:", img);
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-family='sans-serif' font-size='16'%3EKhông tải được ảnh%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </Carousel>

                            {/* Indicator số ảnh */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "16px",
                                    right: "16px",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    zIndex: 10,
                                }}
                            >
                                <PictureOutlined style={{ marginRight: "6px" }} />
                                {allImages.length} ảnh
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <CarOutlined style={{ fontSize: "48px", marginBottom: "16px" }} />
                            <div>Không có ảnh</div>
                        </div>
                    )}
                </Modal>
            </ProCard>
        </>
    );
}

export default VehicleCard;
