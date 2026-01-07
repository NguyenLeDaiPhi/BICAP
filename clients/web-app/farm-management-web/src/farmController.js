const axios = require('axios');

// Sử dụng tên service trong Docker network thay vì localhost
// Trong Docker, container gọi nhau bằng tên service + port internal (8081 chứ không phải 8001)
const BASE_API_URL = 'http://farm-production-service:8081/api/farm-features'; 


// 1. Hiển thị trang thông tin (Read)
exports.getFarmInfoPage = async (req, res) => {
    try {
        // TẠM THỜI: Lấy ID = 1 để test. 
        // Sau này bạn sẽ lấy từ req.user.farmId hoặc database
        const farmId = req.params.farmId || 1; 

        console.log(`Đang gọi Java API lấy thông tin Farm ID: ${farmId}`);
        const response = await axios.get(`${BASE_API_URL}/${farmId}`);
        
        // Render với dữ liệu thật từ Java
        res.render('farm-info', { 
            farm: response.data, 
            user: req.user // Truyền thêm user để hiển thị Avatar/Tên trên Menu
        });
    } catch (error) {
        console.error('Lỗi kết nối Java:', error.message);
        // Nếu lỗi, hiển thị trang rỗng hoặc thông báo
        res.render('farm-info', { 
            farm: null, 
            user: req.user,
            error: 'Không thể tải dữ liệu trang trại' 
        });
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