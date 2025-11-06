import React, { useState } from 'react';
import { Card, Tag, Typography, Empty, Space, Button, Tooltip, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import PDFModal from '../../../Admin/SignContract/Components/PDF/PDFModal';
import { getEContractById, getEContractPreview } from '../../../../App/DealerManager/DealerProfile/GetEContract';

const { Text } = Typography;

function ContractListCard({ econtractDealer = [] }) {
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfTitle, setPdfTitle] = useState(null);
    const [pdfBlobObjectUrl, setPdfBlobObjectUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    // Mở PDF modal: nhận record của contract
    const handleOpenContractPdf = async (record) => {
        const eContractId = record?.id || record?.eContractId;
        // Try to obtain downloadUrl directly from record if present
        const possibleDownloadUrl = record?.downloadUrl || record?.downloadURL || record?.fileUrl;

        if (!eContractId && !possibleDownloadUrl) {
            message.warning('Không tìm thấy eContract để xem');
            return;
        }

        setPdfLoading(true);
        try {
            let downloadUrl = possibleDownloadUrl;
            let docNo = record?.name || `EContract-${eContractId || 'unknown'}`;

            if (!downloadUrl && eContractId) {
                const res = await getEContractById(eContractId);
                downloadUrl = res?.data?.downloadUrl || res?.downloadUrl || res?.result?.data?.downloadUrl || res?.result?.downloadUrl;
                docNo = res?.data?.no || res?.no || docNo;
            }

            if (!downloadUrl) {
                message.error('Không tìm thấy file PDF từ eContract');
                return;
            }

            try {
                const blob = await getEContractPreview(downloadUrl);
                const objectUrl = URL.createObjectURL(blob);
                setPdfBlobObjectUrl(objectUrl);
                setPdfUrl(objectUrl);
                setPdfTitle(docNo);
            } catch (previewErr) {
                console.warn('Preview API failed, fallback to direct downloadUrl', previewErr);
                // fallback to using direct downloadUrl
                setPdfUrl(downloadUrl);
                setPdfTitle(docNo);
            }

            setPdfModalVisible(true);
        } catch (err) {
            console.error('Error opening eContract:', err);
            message.error('Lỗi khi tải eContract. Vui lòng thử lại');
        } finally {
            setPdfLoading(false);
        }
    };
    // Map contract status
    const contractStatusMap = {
        1: { text: 'Nháp', status: 'default' },
        2: { text: 'Chờ ký', status: 'processing' },
        3: { text: 'Đã ký', status: 'success' },
        4: { text: 'Hoàn tất', status: 'success' },
        5: { text: 'Đã hủy', status: 'error' },
    };

    return (
        <Card
            className="shadow-sm"
            title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-orange-600" />
                    <span>Hợp đồng điện tử</span>
                </div>
            }
        >
            {econtractDealer.length > 0 ? (
                <ProList
                    dataSource={econtractDealer}
                    rowKey="id"
                    metas={{
                        title: {
                            dataIndex: 'name',
                            render: (_, record) => (
                                <div className="text-center">
                                    <div style={{ width: '80px' }}></div>
                                    <Text strong className="text-center">{record.name}</Text>
                                    <Tag color={contractStatusMap[record.status]?.status || 'default'}>
                                        {contractStatusMap[record.status]?.text || 'N/A'}
                                    </Tag>
                                </div>
                            ),
                        },
                        actions: {
                            render: (_, record) => (
                                <Space>
                                    <Tooltip title="Xem hợp đồng">
                                        <Button
                                            type="primary"
                                            size="middle"
                                            icon={<FileTextOutlined />}
                                            onClick={() => handleOpenContractPdf(record)}
                                            loading={pdfLoading}
                                            style={{ borderRadius: 8, padding: '6px 12px', fontWeight: 600 }}
                                        >
                                            Xem Hợp Đồng
                                        </Button>
                                    </Tooltip>
                                </Space>
                            ),
                        },
                        // description: {
                        //     render: (_, record) => (
                        //         <div className="text-center">
                        //             <Space split={<span className="text-gray-300">•</span>} size="small">
                        //                 {/* <Text type="secondary" className="text-center-xs">
                        //                     Người tạo: <Text className="text-xs">{record.ownerName || 'N/A'}</Text>
                        //                 </Text> */}
                        //                 {/* <Text type="secondary" className="text-xs">
                        //                     Ngày tạo: <Text className="text-xs">{new Date(record.createdAt).toLocaleString('vi-VN')}</Text>
                        //                 </Text> */}
                        //             </Space>
                        //         </div>
                        //     ),
                        // },
                    }}
                    split
                />
            ) : (
                <Empty
                    image={<FileTextOutlined className="text-6xl text-gray-300" />}
                    description={<Text type="secondary">Chưa có hợp đồng điện tử nào</Text>}
                />
            )}

            {/* PDF Modal hiển thị nội dung hợp đồng */}
            <PDFModal
                visible={pdfModalVisible}
                onClose={() => {
                    setPdfModalVisible(false);
                    setPdfUrl(null);
                    setPdfTitle(null);
                    if (pdfBlobObjectUrl) {
                        URL.revokeObjectURL(pdfBlobObjectUrl);
                        setPdfBlobObjectUrl(null);
                    }
                }}
                contractNo={pdfTitle}
                pdfUrl={pdfUrl}
                title={pdfTitle}
            />
        </Card>
    );
}

export default ContractListCard;
