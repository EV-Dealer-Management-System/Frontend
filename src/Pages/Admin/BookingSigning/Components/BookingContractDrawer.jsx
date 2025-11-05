import {
  Drawer,
  Row,
  Col,
  Button,
  Space,
  message
} from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  SecurityScanOutlined,
  SafetyOutlined,
  EditOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { SafeStatus, getSmartCAChoices } from './BookingTableHelpers';
import PDFViewer from '../../../Admin/SignContract/Components/PDF/PDFViewer';
import SmartCAStatusChecker from '../../../Admin/SignContract/Components/SmartCAStatusChecker';
import AddSmartCA from '../../../Admin/SignContract/Components/AddSmartCA';

const BookingContractDrawer = ({
  visible,
  onClose,
  selectedContract,
  detail,
  detailLoading,
  canSign,
  smartCAInfo,
  selectedSmartCA,
  evcUser,
  onOpenSignModal,
  onOpenPdfModal,
  getPreviewUrl,
  pdfBlobUrl,
  pdfLoading,
  contractSigning,
  handleSmartCAChecked,
  setSmartCAInfo,
  setShowAddSmartCAModal,
  setShowSmartCASelector,
  showAddSmartCAModal,
  contractService
}) => {

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
              }}>
                <FileTextOutlined style={{ color: 'white', fontSize: '20px' }} />
              </div>
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                background: '#10b981',
                borderRadius: '50%',
                border: '2px solid white'
              }}></div>
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0,
                marginBottom: '4px'
              }}>
                Chi tiết hợp đồng Booking
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: '#dbeafe',
                  color: '#1d4ed8'
                }}>
                  ID: {selectedContract?.id?.substring(0, 8) || '...'}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {selectedContract?.name || 'Đang tải thông tin...'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          </div>
        </div>
      }
      width={1400}
      open={visible}
      onClose={onClose}
      loading={detailLoading}
      className="modern-contract-drawer"
      styles={{
        header: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: '20px 24px',
          borderRadius: '0'
        },
        body: {
          padding: 0,
          background: 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 50%, #f8fafc 100%)',
          minHeight: '100vh'
        }
      }}
      extra={
        <Space size="middle">
          {detail?.status?.value === 3 && canSign && selectedSmartCA && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onOpenSignModal}
              loading={contractSigning.signingLoading}
              size="large"
              style={{
                height: '48px',
                padding: '0 32px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                fontWeight: '600',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                border: 'none'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Ký hợp đồng</span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite',
                  marginLeft: '4px'
                }}></div>
              </span>
            </Button>
          )}
          {detail?.status?.value === 3 && canSign && !selectedSmartCA && (
            <Button
              type="default"
              icon={<SafetyOutlined />}
              onClick={() => setShowSmartCASelector(true)}
              size="large"
              style={{
                height: '48px',
                padding: '0 32px',
                borderRadius: '12px',
                fontWeight: '600',
                borderColor: '#f59e0b',
                color: '#d97706',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)'
              }}
            >
              Chọn SmartCA
            </Button>
          )}
          {detail?.status?.value !== 3 && (
            <Button
              type="default"
              disabled
              size="large"
              icon={<EditOutlined />}
              style={{
                height: '48px',
                padding: '0 32px',
                borderRadius: '12px',
                opacity: 0.6
              }}
            >
              Ký hợp đồng
            </Button>
          )}

          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="large"
            title="Tải xuống"
            style={{
              height: '48px',
              width: '48px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          />

          <Button
            type="text"
            icon={<FullscreenOutlined />}
            onClick={onOpenPdfModal}
            loading={pdfLoading}
            size="large"
            title="Mở rộng"
            style={{
              height: '48px',
              width: '48px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          />
        </Space>
      }
    >
      {detail && (
        <div style={{
          padding: '32px',
          minHeight: '100vh',
          paddingBottom: '80px'
        }}>
          <Row gutter={32}>
            {/* Left Sidebar - Contract Info & SmartCA */}
            <Col span={8}>
              {/* Contract Information Card */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                marginBottom: '24px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                      <InfoCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        margin: 0
                      }}>
                        Thông tin hợp đồng
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: 0,
                        marginTop: '4px'
                      }}>
                        Chi tiết và trạng thái
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  {[
                    { icon: FileTextOutlined, label: 'Số hợp đồng', value: detail.no, color: '#3b82f6' },
                    { icon: UserOutlined, label: 'Chủ đề', value: detail.subject, color: '#10b981' },
                    { icon: CheckCircleOutlined, label: 'Trạng thái', value: <SafeStatus value={detail.status.value} />, color: '#8b5cf6' },
                    { icon: CalendarOutlined, label: 'Ngày tạo', value: dayjs(detail.createdDate).format('DD/MM/YYYY HH:mm'), color: '#f59e0b' }
                  ].map((item, index) => (
                    <div key={index} style={{ marginBottom: index < 3 ? '20px' : 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                        border: '1px solid #f1f5f9',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          <item.icon style={{ fontSize: '18px', color: item.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                          }}>
                            {item.label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            wordBreak: 'break-words'
                          }}>
                            {item.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SmartCA Section */}
              {detail?.status?.value === 3 && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}>
                        <SecurityScanOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1e293b',
                          margin: 0
                        }}>
                          SmartCA
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0,
                          marginTop: '4px'
                        }}>
                          Chứng thư số để ký hợp đồng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    {!smartCAInfo && (
                      <>
                        <SmartCAStatusChecker
                          userId={evcUser.userId}
                          contractService={contractService}
                          onChecked={handleSmartCAChecked}
                        />
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                          borderRadius: '12px',
                          border: '1px solid #93c5fd'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            background: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid white',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                          </div>
                          <div>
                            <p style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e40af',
                              margin: 0
                            }}>
                              Đang kiểm tra SmartCA...
                            </p>
                            <p style={{
                              fontSize: '12px',
                              color: '#2563eb',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              Vui lòng đợi trong giây lát
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {smartCAInfo && (() => {
                      const { hasChoices, hasValidChoices } = getSmartCAChoices(smartCAInfo);

                      if (!hasChoices) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                              padding: '16px',
                              background: 'linear-gradient(135deg, #fef3c7, #fecaca)',
                              borderRadius: '12px',
                              border: '1px solid #fed7aa'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#f97316',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <WarningOutlined style={{ color: 'white', fontSize: '14px' }} />
                              </div>
                              <div>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#ea580c',
                                  margin: 0
                                }}>
                                  Không tìm thấy chứng thư số
                                </p>
                                <p style={{
                                  fontSize: '12px',
                                  color: '#ea580c',
                                  margin: 0,
                                  marginTop: '4px'
                                }}>
                                  Bạn có thể thêm SmartCA mới bằng CCCD/CMND
                                </p>
                              </div>
                            </div>

                            <Button
                              type="primary"
                              onClick={() => setShowAddSmartCAModal(true)}
                              size="large"
                              style={{
                                width: '100%',
                                height: '48px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                              }}
                            >
                              + Thêm SmartCA mới
                            </Button>

                            <AddSmartCA
                              visible={showAddSmartCAModal}
                              onCancel={() => setShowAddSmartCAModal(false)}
                              onSuccess={(res) => {
                                setSmartCAInfo(prev => ({
                                  ...(prev || {}),
                                  userCertificates: [...(prev?.userCertificates || []), res.smartCAData].filter(Boolean),
                                  defaultSmartCa: (prev?.defaultSmartCa) || null,
                                }));
                                
                                setShowAddSmartCAModal(false);
                                message.success('SmartCA mới đã được thêm!');
                              }}
                              contractInfo={{
                                userId: evcUser.userId,
                                accessToken: evcUser.accessToken
                              }}
                            />
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {selectedSmartCA ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                              padding: '16px',
                              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                              borderRadius: '12px',
                              border: '1px solid #a7f3d0'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#10b981',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <CheckCircleOutlined style={{ color: 'white', fontSize: '14px' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#047857',
                                  margin: 0
                                }}>
                                  SmartCA đã sẵn sàng
                                </p>
                                <div style={{
                                  fontSize: '12px',
                                  color: '#059669',
                                  marginTop: '8px'
                                }}>
                                  <div style={{ marginBottom: '4px' }}>
                                    <strong>Chứng thư:</strong> {selectedSmartCA.commonName}
                                  </div>
                                  <div>
                                    <strong>UID:</strong> {selectedSmartCA.uid}
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="small"
                                onClick={() => setShowSmartCASelector(true)}
                                style={{
                                  borderColor: '#10b981',
                                  color: '#047857',
                                  borderRadius: '8px'
                                }}
                              >
                                Đổi
                              </Button>
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                              padding: '16px',
                              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                              borderRadius: '12px',
                              border: '1px solid #fbbf24'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                <WarningOutlined style={{ color: 'white', fontSize: '14px' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#d97706',
                                  margin: 0
                                }}>
                                  {hasValidChoices ? 'Chưa chọn SmartCA' : 'Chưa có chứng thư hợp lệ'}
                                </p>
                                <p style={{
                                  fontSize: '12px',
                                  color: '#d97706',
                                  margin: 0,
                                  marginTop: '4px'
                                }}>
                                  {hasValidChoices
                                    ? 'Vui lòng chọn chứng thư số để ký hợp đồng'
                                    : 'Hệ thống có chứng thư nhưng chưa hợp lệ'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                {hasValidChoices ? (
                                  <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => setShowSmartCASelector(true)}
                                    style={{
                                      background: '#3b82f6',
                                      borderRadius: '8px',
                                      border: 'none'
                                    }}
                                  >
                                    Chọn
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      size="small"
                                      onClick={() => setShowSmartCASelector(true)}
                                      style={{
                                        borderRadius: '8px'
                                      }}
                                    >
                                      Danh sách
                                    </Button>
                                    <Button
                                      size="small"
                                      type="primary"
                                      onClick={() => setShowAddSmartCAModal(true)}
                                      style={{
                                        background: '#3b82f6',
                                        borderRadius: '8px',
                                        border: 'none'
                                      }}
                                    >
                                      Thêm
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </Col>

            {/* Right Column - PDF Viewer */}
            <Col span={16}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                overflow: 'visible',
                height: 'auto',
                minHeight: '800px'
              }}>
                <div style={{
                  padding: '24px',
                  borderBottom: '1px solid #f0f0f0',
                  background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                      }}>
                        <FileTextOutlined style={{ color: 'white', fontSize: '20px' }} />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1e293b',
                          margin: 0
                        }}>
                          Xem trước hợp đồng
                        </h3>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          margin: 0,
                          marginTop: '4px'
                        }}>
                          Tài liệu PDF và vị trí chữ ký
                        </p>
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="default"
                        size="small"
                        icon={<DownloadOutlined />}
                        style={{
                          borderColor: '#8b5cf6',
                          color: '#8b5cf6',
                          borderRadius: '8px'
                        }}
                      >
                        Tải xuống
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        icon={<FullscreenOutlined />}
                        onClick={onOpenPdfModal}
                        loading={pdfLoading}
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        Cửa sổ riêng
                      </Button>
                    </Space>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      minHeight: '800px',
                      maxHeight: '900px',
                      borderRadius: '8px',
                      overflow: 'auto',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {detail.downloadUrl ? (
                        <PDFViewer
                          contractNo={detail.no || 'Booking'}
                          pdfUrl={getPreviewUrl() || pdfBlobUrl}
                          showAllPages={false}
                          scale={0.9}
                        />
                      ) : (
                        <div style={{
                          height: '120%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px'
                        }}>
                          <div style={{ textAlign: 'center', color: '#6b7280' }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              margin: '0 auto 16px',
                              background: '#e5e7eb',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FilePdfOutlined style={{ fontSize: '24px', color: '#9ca3af' }} />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '500' }}>
                              Không có PDF để hiển thị
                            </div>
                            <div style={{ fontSize: '14px', marginTop: '4px' }}>
                              Hợp đồng chưa có file đính kèm
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Drawer>
  );
};

export default BookingContractDrawer;