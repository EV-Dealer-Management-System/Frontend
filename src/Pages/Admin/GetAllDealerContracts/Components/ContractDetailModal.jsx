import React, { useState, useEffect} from 'react';
import { Modal, Descriptions, Tag, Space, Spin, Button, message, App } from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    EditOutlined
} from '@ant-design/icons';
import { GetDealerContractByID } from '../../../../App/EVMAdmin/DealerContract/GetDealerContractByID';
import useContractSigning from '../../SignContract/useContractSigning';
import SignatureModal from '../../SignContract/Components/SignatureModal';
import SmartCAModal from '../../SignContract/Components/SmartCAModal';
import AppVerifyModal from '../../SignContract/Components/AppVerifyModal';
import AddSmartCA from '../../SignContract/Components/AddSmartCA';
import SmartCASelector from '../../SignContract/Components/SmartCASelector';
import { SmartCAService } from '../../../../App/EVMAdmin/SignContractEVM/SmartCA';
import { SignContract } from '../../../../App/EVMAdmin/SignContractEVM/SignContractEVM';
import PDFModal from '../../SignContract/Components/PDF/PDFModal';
import GetPDFPreview from './GetPDFPreview';
import api from '../../../../api/api';

// Component hiển thị chi tiết hợp đồng trong modal
function ContractDetailModal({ visible, contractId, onClose }) {
    const [loading, setLoading] = useState(false);
    const [contractDetail, setContractDetail] = useState(null);
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    
    // States cho SmartCA workflow
    const [showAddSmartCAModal, setShowAddSmartCAModal] = useState(false);
    const [showSmartCASelector, setShowSmartCASelector] = useState(false);
    const [smartCAData, setSmartCAData] = useState(null);
    const [smartCALoading, setSmartCALoading] = useState(false);

    // Loại bỏ pendingOpenSignature - simplify modal flow

    // EVC token và userId
    const [evcToken, setEvcToken] = useState(null);
    const [evcUserId, setEvcUserId] = useState(null);
    const [loadingEVC, setLoadingEVC] = useState(true);
    const [errorEVC, setErrorEVC] = useState(null);
    
    const smartCAService = SmartCAService();

    //
    useEffect(() => {
        let revokeTimer;
        const loadPreview = async () => {
            if (!contractDetail?.downloadUrl) return;
            setLoadingPdf(true);
            const blobUrl = await GetPDFPreview(contractDetail.downloadUrl); // gọi API BE → blob URL
            setPdfBlobUrl(blobUrl); // có thể là null nếu lỗi
            setLoadingPdf(false);
        };
        loadPreview();

        // cleanup: thu hồi blob cũ để tránh leak bộ nhớ
        return () => {
            if (pdfBlobUrl) {
            revokeTimer = setTimeout(() => URL.revokeObjectURL(pdfBlobUrl), 0);
            }
            return () => revokeTimer && clearTimeout(revokeTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contractDetail?.downloadUrl]);

    
    //hook lấy EVC token và userId khi modal mở
    useEffect(() => {
        if(!visible) return;
        const fetchEVC = async () => {
            try {
                const signService = SignContract();
                const { accessToken, userId } = await signService.getAccessTokenForEVC();
                setEvcToken(accessToken);
                setEvcUserId(userId);
            } catch (error) {
                console.error('Lỗi khi lấy EVC token và userId:', error);
                setErrorEVC('Không thể lấy token EVC');
            }finally {
                setLoadingEVC(false);
            }
        }; 
        fetchEVC();
    }, [visible]);

    // Hook quản lý ký hợp đồng
    const {
        showSignatureModal,
        setShowSignatureModal,
        signingLoading,
        signatureCompleted,
        showSmartCAModal,
        setShowSmartCAModal,
        showAppVerifyModal,
        setShowAppVerifyModal,
        handleSignature,
        handleAppVerification,
        resetSigningState
    } = useContractSigning();

    // Tải chi tiết hợp đồng khi modal mở
    useEffect(() => {
        const loadContractDetail = async () => {
            if (!visible || !contractId) return;

            setLoading(true);
            try {
                const result = await GetDealerContractByID.getDealerContractByID(contractId);
                console.log('API result:', result);
                if (result) {
                    setContractDetail(result);
                } else {
                    message.error('Không thể tải chi tiết hợp đồng');
                }
            } catch (error) {
                console.error('Lỗi khi tải chi tiết hợp đồng:', error);
                message.error('Có lỗi xảy ra khi tải chi tiết hợp đồng');
            } finally {
                setLoading(false);
            }
        };

        loadContractDetail();
    }, [visible, contractId]);

    // Reset dữ liệu khi đóng modal
    useEffect(() => {
        if (!visible) {
            setContractDetail(null);
        }
    }, [visible]);

    // Xử lý mở modal PDF
    const handleOpenPDF = () => {
        if(!contractDetail?.downloadUrl) {
        message.warning('Không có file PDF để xem.');
        return;
        }
        setShowPDFModal(true);
    }

    // Định dạng trạng thái hợp đồng
    const getStatusConfig = (status) => {
        const configs = {
            1: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Chờ xử lý' },
            2: { color: 'success', icon: <CheckCircleOutlined />, text: 'Sẵn sàng' },
            3: { color: 'success', icon: <CheckCircleOutlined />, text: 'Hoàn thành' },
            0: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Hủy' },
        };
        return configs[status?.value] || { color: 'default', icon: null, text: 'Không xác định' };
    };

    // Xử lý tải xuống hợp đồng
    const handleDownload = async () => {
        if (!contractDetail?.downloadUrl) {
            message.warning("Không có file để tải xuống.");
            return;
        }

        try {
            const response = await api.get("/EContract/preview", {
            params: { downloadUrl: contractDetail.downloadUrl },
            responseType: "blob",
            });

            if (response.status === 200 && response.data) {
            const blob = new Blob([response.data]);
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `HopDong_${contractDetail?.no || "download"}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            } else {
            message.error("Không thể tải hợp đồng (dữ liệu rỗng).");
            }
        } catch (error) {
            console.error("Lỗi khi tải hợp đồng:", error);
            message.error("Không thể tải file (có thể lỗi CORS hoặc server).");
        }
    };


    // Kiểm tra xem có thể ký hợp đồng không
    const canSignContract = () => {
        return contractDetail?.status?.value === 2 && contractDetail?.waitingProcess?.status?.value === 1;
    };

    // Xử lý bắt đầu ký hợp đồng - Check SmartCA trước
    const handleStartSigning = async () => {
        if (!contractDetail?.waitingProcess) {
            message.error('Không tìm thấy thông tin tiến trình ký hợp đồng');
            return;
        }

        setSmartCALoading(true);
        try {
            // ✅ luôn có uid dùng ngay, không phụ thuộc state vừa set
            let uid = evcUserId;
            if (!uid) {
            const { userId } = await SignContract().getAccessTokenForEVC();
            if (!userId) throw new Error("Không nhận được EVC User ID");
            setEvcUserId(userId);   // để lần sau có sẵn
            uid = userId;           // dùng cục bộ ngay bây giờ
            }

            console.log('=== CHECKING SMARTCA STATUS BEFORE SIGNING ===');
            console.log('User ID (local):', uid);

            const smartCAResult = await smartCAService.handleCheckSmartCA(uid);
            console.log('SmartCA check result:', smartCAResult);

            if (smartCAResult.success) {
            const hasValidSmartCA = smartCAService.isSmartCAValid(smartCAResult.data);
            if (hasValidSmartCA) {
                setSmartCAData(smartCAResult.data);
                setShowSmartCASelector(true);       // ✅ có chứng thư → chọn & ký
            } else {
                setShowAddSmartCAModal(true);       // ✅ chưa có → Add
            }
            } else {
            setShowAddSmartCAModal(true);         // lỗi check → Add
            }
        } catch (error) {
            console.error('Error checking SmartCA:', error);
            message.error('Có lỗi khi kiểm tra SmartCA');
            setShowAddSmartCAModal(true);
        } finally {
            setSmartCALoading(false);
        }
    };

    // Xử lý khi thêm SmartCA thành công
    const handleAddSmartCASuccess = async (addedData) => {
        console.log('SmartCA added successfully:', addedData);
        setShowAddSmartCAModal(false);

        // Reload SmartCA data - đảm bảo có data mới nhất
        setSmartCALoading(true);
        try {
            // ✅ đảm bảo có uid cục bộ để check ngay
            let uid = evcUserId;
            if (!uid) {
            const { userId } = await SignContract().getAccessTokenForEVC();
            if (!userId) throw new Error('Không nhận được EVC User ID');
            setEvcUserId(userId);
            uid = userId;
            }

            const checkAgain = await smartCAService.handleCheckSmartCA(uid);
            if (checkAgain.success && smartCAService.isSmartCAValid(checkAgain.data)) {
            setSmartCAData(checkAgain.data); // Set data mới
            setShowSmartCASelector(true);
            } else {
            message.warning("Không thể xác nhận chứng thư mới, vui lòng thử lại.");
            }
        } catch (err) {
            console.error("Lỗi khi check lại SmartCA sau khi thêm:", err);
            message.error("Lỗi khi xác nhận chứng thư mới.");
        } finally {
            setSmartCALoading(false);
        }
    };

    // Xử lý khi chọn SmartCA thành công
    const handleSmartCASelected = (selectedCA) => {
        console.log('=== SMARTCA SELECTED DEBUG ===');
        console.log('Selected CA:', selectedCA);
        console.log('Current showSmartCASelector:', showSmartCASelector);
        console.log('Current showSignatureModal:', showSignatureModal);
        
        // Đóng selector trước
        setShowSmartCASelector(false);
        console.log('Set showSmartCASelector to false');
        
        // Tăng timeout lên 300ms để đảm bảo modal đóng hoàn toàn
        setTimeout(() => {
            console.log('Opening signature modal after timeout');
            setShowSignatureModal(true);
            console.log('Set showSignatureModal to true');
        }, 300);
    };

    // Hàm reload SmartCA data
    const handleReloadSmartCA = (update) => {
        console.log('=== HANDLE RELOAD SMARTCA DEBUG ===');
        console.log('Update parameter:', update);
        console.log('Previous smartCAData:', smartCAData);
        
        const newData = typeof update === 'function' ? update(smartCAData) : update;
        console.log('New smartCAData:', newData);
        
        setSmartCAData(newData);
        console.log('SmartCA data updated successfully');
    };

    // Reset signing state khi đóng modal
    useEffect(() => {
        if (!visible) {
            // chỉ reset khi đóng toàn bộ modal chi tiết hợp đồng,
            // KHÔNG reset trong lúc đang đóng selector.
            resetSigningState();
            setShowAddSmartCAModal(false);
            setShowSmartCASelector(false);
            setSmartCAData(null);
            setSmartCALoading(false);
        }
    }, [visible]);

    // Reload contract detail sau khi ký thành công
    const handleContractSigned = () => {
        if (contractId) {
            const loadContractDetail = async () => {
                try {
                    const result = await GetDealerContractByID.getDealerContractByID(contractId);
                    if (result) {
                        setContractDetail(result);
                        message.success('Đã cập nhật trạng thái hợp đồng mới!');
                    }
                } catch (error) {
                    console.error('Lỗi khi reload hợp đồng:', error);
                }
            };
            loadContractDetail();
        }
    };

    if (!visible) return null;

    const status = contractDetail ? getStatusConfig(contractDetail.status) : null;
    const pdfUrl = pdfBlobUrl;

    return (
        <App>
        <Modal
            title={
                <Space>
                    <FileTextOutlined className="text-blue-500" />
                    <span>Chi tiết hợp đồng</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            footer={
                <Space>
                    {pdfUrl && (
                        <Button
                            icon={<FileTextOutlined />}
                            onClick={handleOpenPDF}
                            type='default'
                        >
                            Xem hợp đồng PDF
                        </Button>
                    )}
                    {contractDetail?.downloadUrl && (
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Tải xuống hợp đồng
                        </Button>
                    )}

                    {canSignContract() && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleStartSigning}
                            loading={signingLoading}
                        >
                            Ký hợp đồng
                        </Button>
                    )}

                    <Button onClick={onClose}>
                        Đóng
                    </Button>
                </Space>
            }
            width={800}
        >
            <Spin spinning={loading}>
                {contractDetail ? (
                    <Descriptions bordered column={1} className="mt-4">
                        <Descriptions.Item
                            label={
                                <Space>
                                    <FileTextOutlined />
                                    <span>ID hợp đồng</span>
                                </Space>
                            }
                        >
                            <span className="font-mono text-sm">{contractDetail.id || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <FileTextOutlined />
                                    <span>Số hợp đồng</span>
                                </Space>
                            }
                        >
                            <span className="font-semibold text-blue-600">{contractDetail.no || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item label="Chủ đề">
                            <span className="text-gray-700">{contractDetail.subject || ''}</span>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Space direction="vertical" size="small">
                                {status && (
                                    <Tag color={status.color} icon={status.icon}>
                                        {status.text}
                                    </Tag>
                                )}
                                {canSignContract() && (
                                    <Tag color="green" icon={<EditOutlined />}>
                                        Có thể ký hợp đồng
                                    </Tag>
                                )}
                            </Space>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <CalendarOutlined />
                                    <span>Ngày tạo</span>
                                </Space>
                            }
                        >
                            {contractDetail.createdDate ?
                                new Date(contractDetail.createdDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'Không có thông tin'
                            }
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <CalendarOutlined />
                                    <span>Ngày cập nhật cuối</span>
                                </Space>
                            }
                        >
                            {contractDetail.lastModifiedDate ?
                                new Date(contractDetail.lastModifiedDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'Không có thông tin'
                            }
                        </Descriptions.Item>

                        {contractDetail.completedDate && (
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <CheckCircleOutlined />
                                        <span>Ngày hoàn thành</span>
                                    </Space>
                                }
                            >
                                {new Date(contractDetail.completedDate).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Descriptions.Item>
                        )}

                        {contractDetail.contractValue && (
                            <Descriptions.Item label="Giá trị hợp đồng">
                                <span className="text-green-600 font-semibold">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(contractDetail.contractValue)}
                                </span>
                            </Descriptions.Item>
                        )}

                        {contractDetail.customerCode && (
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <UserOutlined />
                                        <span>Mã khách hàng</span>
                                    </Space>
                                }
                            >
                                <span className="font-mono text-sm">{contractDetail.customerCode}</span>
                            </Descriptions.Item>
                        )}

                        {contractDetail.waitingProcess && (
                            <Descriptions.Item label="Tiến trình đang chờ">
                                <Space direction="vertical" size="small">
                                    <Tag color="processing">
                                        Bước {contractDetail.waitingProcess.orderNo} - {contractDetail.waitingProcess.status.description}
                                    </Tag>
                                </Space>
                            </Descriptions.Item>
                        )}

                        {contractDetail.processes && contractDetail.processes.length > 0 && (
                            <Descriptions.Item label="Các bước xử lý">
                                <Space direction="vertical" size="small" className="w-full">
                                    {contractDetail.processes.map((process) => (
                                        <div key={process.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span>Bước {process.orderNo}: {process.accessPermission.description}</span>
                                            <Tag color={process.status.value === 1 ? 'processing' : 'success'}>
                                                {process.status.description}
                                            </Tag>
                                        </div>
                                    ))}
                                </Space>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Không có dữ liệu hợp đồng
                    </div>
                )}
            </Spin>
            {/* Modal xem PDF hợp đồng */}
            <PDFModal
                visible={showPDFModal}
                onClose={() => setShowPDFModal(false)}
                contractNo={contractDetail?.no}
                pdfUrl={pdfUrl}
                title={`Hợp Đồng ${contractDetail?.no}`}
            />

            {/* Modal ký hợp đồng */}
            <SignatureModal
                visible={showSignatureModal}
                onCancel={() => setShowSignatureModal(false)}
                onSign={(signatureData, signatureDisplayMode) =>
                    handleSignature(
                        signatureData,
                        signatureDisplayMode,
                        contractDetail?.waitingProcess?.id,
                        contractDetail?.waitingProcess,
                        contractDetail?.downloadUrl,
                        contractDetail?.waitingProcess?.position,
                        contractDetail?.waitingProcess?.pageSign
                    )
                }
                loading={signingLoading}
            />

            {/* Modal SmartCA */}
            <SmartCAModal
                visible={showSmartCAModal}
                onCancel={() => setShowSmartCAModal(false)}
                contractNo={contractDetail?.no}
            />

            {/* Modal xác thực ứng dụng */}
            <AppVerifyModal
                visible={showAppVerifyModal}
                onCancel={() => setShowAppVerifyModal(false)}
                onVerify={() => {
                    handleAppVerification(contractDetail?.no);
                    handleContractSigned();
                }}
                loading={signingLoading}
                signatureCompleted={signatureCompleted}
            />

            {/* Modal thêm SmartCA */}
            <AddSmartCA
                visible={showAddSmartCAModal}
                onCancel={() => setShowAddSmartCAModal(false)}
                onSuccess={handleAddSmartCASuccess}
                contractInfo={{ userId: evcUserId }}
            />

            {/* Modal chọn SmartCA */}
            <SmartCASelector
                visible={showSmartCASelector}
                onCancel={() => setShowSmartCASelector(false)}
                onSelect={handleSmartCASelected}
                smartCAData={smartCAData}
                loading={smartCALoading}
                isExistingSmartCA={true}
                isForSigning={true}
                userId={evcUserId}
                onReloadSmartCA={handleReloadSmartCA}
                key={`smartca-${evcUserId}-${showSmartCASelector}`} // Force re-render
            />
        </Modal>
        </App>
    );
}

export default ContractDetailModal;
