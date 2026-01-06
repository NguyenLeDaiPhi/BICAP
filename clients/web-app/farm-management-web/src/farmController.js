const axios = require('axios');

// Lưu ý: Nếu chạy qua Kong Gateway thì thường là cổng 8000. 
// Nếu bạn test trực tiếp vào service Farm thì để 8001.
const BASE_API_URL = 'http://localhost:8001/api/farm-features'; 


// 1. Hiển thị trang thông tin (Read)
exports.getFarmInfoPage = async (req, res) => {
    try {
        // Gọi API GET /{id} mà ta vừa viết thêm ở Java
        const response = await axios.get(`${BASE_API_URL}/${req.params.farmId}`);
        
        res.render('farm-info', { 
            farm: response.data,
            pageTitle: 'Thông tin trang trại'
        });
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error.message);
        res.render('farm-info', { farm: null, error: 'Chưa có dữ liệu' });
    }
};

// 2. Hiển thị trang chỉnh sửa (Read for Edit)
exports.getEditFarmPage = async (req, res) => {
    try {
        const response = await axios.get(`${BASE_API_URL}/${req.params.farmId}`);
        res.render('farm-info-edit', { // Lưu ý tên file view của bạn là edit-farm-info hay farm-info-edit?
            farm: response.data,
            pageTitle: 'Chỉnh sửa thông tin'
        });
    } catch (error) {
        res.render('farm-info-edit', { farm: null });
    }
};

// 3. Xử lý cập nhật (Update)
exports.updateFarmInfo = async (req, res) => {
    try {
        // Dữ liệu từ Form gửi lên (req.body) cần khớp với FarmUpdateDto bên Java
        const updateData = {
            farmName: req.body.farmName,
            address: req.body.address,
            email: req.body.email,
            hotline: req.body.phone, // Lưu ý: name bên form là 'phone', bên Java DTO là 'hotline'
            areaSize: parseFloat(req.body.area), // Chuyển String sang Double
            description: req.body.description
        };

        // Gọi API PUT /{id}/info
        await axios.put(`${BASE_API_URL}/${CURRENT_FARM_ID}/info`, updateData);
        
        // Thành công thì quay về trang xem
        res.redirect('/farm-info');
    } catch (error) {
        console.error('Lỗi cập nhật:', error.message);
        // Có thể redirect lại trang edit kèm thông báo lỗi
        res.redirect('/farm-info/edit'); 
    }
};