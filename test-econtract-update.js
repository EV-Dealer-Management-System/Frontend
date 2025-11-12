// Test script để kiểm tra EContract Update API
// Copy vào browser console để test

const testUpdateEContract = async () => {
  const testPayload = {
    id: "1216d2c4-86d0-4c41-8a32-eee1886be7ed", // Sample ID từ data bạn cung cấp
    subject: "Test EContract Update",
    htmlFile: `<!DOCTYPE html>
<html>
<head>
  <title>Test Contract</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>HỢP ĐỒNG ĐIỆN TỬ - TEST UPDATE</h1>
  </div>
  <p>Đây là nội dung test để kiểm tra API update eContract.</p>
  <p>Thời gian test: ${new Date().toISOString()}</p>
</body>
</html>`
  };

  try {
    console.log('🔄 Testing EContract Update API...');
    console.log('Payload:', testPayload);
    
    const response = await fetch('/api/EContract/update-econtract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', result);
    
    if (result.success) {
      console.log('🎉 Update thành công!');
      console.log('Download URL:', result.data?.downloadUrl);
    } else {
      console.log('❌ Update thất bại:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test error:', error);
    return { success: false, error: error.message };
  }
};

// Gọi function test
testUpdateEContract();