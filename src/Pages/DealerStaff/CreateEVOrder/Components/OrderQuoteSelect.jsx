import React, { useEffect, useMemo, useState } from "react";
import { Radio, Space, Typography, Skeleton, message, Divider, Empty } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import api from "../../../../api/api";

const { Text } = Typography;

const formatVnd = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "";

export default function OrderQuoteSelect({ value, onChange, customerId }) {
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/Quote/get-all-quote?status=1");
        const items =
          res?.data?.result?.data && Array.isArray(res.data.result.data)
            ? res.data.result.data
            : [];

        if (alive) setQuotes(items);
      } catch (e) {
        console.error("Fetch quotes failed:", e);
        message.error("Không tải được danh sách báo giá");
      } finally {
        alive && setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [customerId]);

  const quoteOptions = useMemo(() => {
    return (quotes || []).map((q) => {
      return {
        value: q.id,
        quote: q,
        quoteDetails: q?.quoteDetails || [],
        totalAmount: q?.totalAmount || 0,
        createdAt: q?.createdAt,
        note: q?.note || null,
      };
    });
  }, [quotes]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  if (!quoteOptions.length) {
    return (
      <div>
        <Text strong style={{ marginBottom: 16, display: 'block' }}>
          <FileTextOutlined /> Chọn báo giá
        </Text>
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có báo giá nào được duyệt"
        />
      </div>
    );
  }

  return (
    <div>
      <Text strong style={{ marginBottom: 16, display: 'block' }}>
        <FileTextOutlined /> Chọn báo giá
      </Text>
      
      <Radio.Group 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%' }}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {quoteOptions.map((item, index) => (
            <div key={item.value}>
              <Radio 
                value={item.value}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  margin: 0,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ marginLeft: 8, width: '100%' }}>
                  {/* Header với tổng tiền */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      Báo giá #{item.value.slice(-8)} 
                      <span style={{ color: '#666', fontWeight: 'normal', fontSize: '12px' }}>
                        ({item.quoteDetails.length} sản phẩm)
                      </span>
                    </Text>
                    <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                      {formatVnd(item.totalAmount)}
                    </Text>
                  </div>
                  
                  {/* Danh sách sản phẩm */}
                  {item.quoteDetails.map((detail, detailIndex) => (
                    <div 
                      key={detail.id} 
                      style={{ 
                        marginBottom: detailIndex < item.quoteDetails.length - 1 ? 8 : 4,
                        paddingLeft: 12,
                        borderLeft: '2px solid #f0f0f0'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 2
                      }}>
                        <Text strong style={{ fontSize: '13px' }}>
                          {detail.version?.modelName} - {detail.version?.versionName}
                        </Text>
                        <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                          {formatVnd(detail.totalPrice)}
                        </Text>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 1 }}>
                        Màu: {detail.color?.colorName} • Số lượng: {detail.quantity} • 
                        Đơn giá: {formatVnd(detail.unitPrice)}
                      </div>
                      
                      {detail.promotion?.promotionName && (
                        <div style={{ fontSize: '11px', color: '#52c41a' }}>
                          KM: {detail.promotion.promotionName}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Ghi chú nếu có */}
                  {item.note && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      fontStyle: 'italic',
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: '1px dashed #e0e0e0'
                    }}>
                      Ghi chú: {item.note}
                    </div>
                  )}
                </div>
              </Radio>
              
              {index < quoteOptions.length - 1 && (
                <Divider style={{ margin: '12px 0' }} />
              )}
            </div>
          ))}
        </div>
      </Radio.Group>
    </div>
  );
}
