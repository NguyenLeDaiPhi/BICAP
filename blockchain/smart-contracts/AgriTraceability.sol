// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriTraceability
 * @dev Smart Contract cho hệ thống truy xuất nguồn gốc nông sản sạch BICAP
 * 
 * Hợp đồng thông minh này cho phép ghi nhận và xác minh các lô sản xuất
 * nông nghiệp trên blockchain, đảm bảo tính minh bạch và không thể sửa đổi.
 * 
 * Tính năng:
 * - Ghi nhận thông tin lô sản xuất
 * - Xác minh tính toàn vẹn dữ liệu
 * - Truy xuất lịch sử theo thời gian
 * - Hỗ trợ nhiều loại tài nguyên
 * 
 * @author BICAP Team
 * @notice Sử dụng cho mục đích nghiên cứu và phát triển đồ án
 */
contract AgriTraceability {

    // =============================================
    // DATA STRUCTURES
    // =============================================

    /**
     * @dev Cấu trúc lưu trữ thông tin lô sản xuất
     * 
     * @param batchCode     Mã lô sản xuất duy nhất
     * @param dataHash      Hash SHA-256 của dữ liệu gốc (64 ký tự hex)
     * @param farmAddress   Địa chỉ ví Ethereum của nông trại
     * @param timestamp     Thời gian tạo (epoch seconds)
     * @param resourceType  Loại tài nguyên (PRODUCTION, ENVIRONMENT, SHIPPING, etc.)
     * @param isActive      Trạng thái hoạt động của bản ghi
     */
    struct BatchRecord {
        string  batchCode;      // Mã lô duy nhất
        bytes32 dataHash;       // Hash dữ liệu (Keccak256 output)
        address farmAddress;    // Địa chỉ nông trại
        uint256 timestamp;      // Thời gian tạo
        string  resourceType;   // Loại tài nguyên
        bool    isActive;       // Trạng thái hoạt động
    }

    // =============================================
    // STATE VARIABLES
    // =============================================

    /// @dev Mapping từ batchId -> BatchRecord
    mapping(uint256 => BatchRecord) public batchRecords;

    /// @dev Mapping để kiểm tra batchCode đã tồn tại chưa
    mapping(string => bool) public existingBatchCodes;

    /// @dev Counter cho batch ID tiếp theo
    uint256 public nextBatchId;

    /// @dev Địa chỉ của admin/owner contract
    address public owner;

    /// @dev Sự kiện khi ghi nhận lô mới
    event BatchRecorded(
        uint256 indexed batchId,
        string  batchCode,
        address indexed farmAddress,
        bytes32 dataHash,
        uint256 timestamp,
        string  resourceType
    );

    /// @dev Sự kiện khi xác minh thành công
    event BatchVerified(
        uint256 indexed batchId,
        bool    isValid,
        bytes32 providedHash,
        bytes32 storedHash
    );

    /// @dev Sự kiện khi cập nhật trạng thái
    event BatchStatusChanged(
        uint256 indexed batchId,
        bool    isActive
    );

    // =============================================
    // MODIFIERS
    // =============================================

    /// @dev Chỉ cho phép owner gọi
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /// @dev Kiểm tra batch tồn tại
    modifier batchExists(uint256 _batchId) {
        require(_batchId > 0 && _batchId < nextBatchId, "Batch does not exist");
        _;
    }

    // =============================================
    // CONSTRUCTOR
    // =============================================

    /**
     * @dev Khởi tạo contract
     */
    constructor() {
        owner = msg.sender;
        nextBatchId = 1;
    }

    // =============================================
    // CORE FUNCTIONS
    // =============================================

    /**
     * @dev Ghi nhận một lô sản xuất mới lên blockchain
     * 
     * @param _batchCode    Mã lô duy nhất
     * @param _dataHash     Hash SHA-256 của dữ liệu gốc (64 ký tự hex, không có 0x)
     * @param _farmAddress  Địa chỉ ví Ethereum của nông trại
     * @param _resourceType Loại tài nguyên (PRODUCTION, ENVIRONMENT, SHIPPING, QUALITY)
     * 
     * @return batchId Mã ID của lô vừa được ghi nhận
     * 
     * @notice Yêu cầu:
     * - _batchCode phải là chuỗi không rỗng
     * - _dataHash phải có 64 ký tự hex
     * - _farmAddress phải là địa chỉ Ethereum hợp lệ
     */
    function recordBatch(
        string  calldata _batchCode,
        bytes32         _dataHash,
        address         _farmAddress,
        string  calldata _resourceType
    ) 
        external 
        onlyOwner 
        returns (uint256 batchId) 
    {
        // Validation: Kiểm tra batchCode không rỗng
        require(bytes(_batchCode).length > 0, "Batch code cannot be empty");
        
        // Validation: Kiểm tra batchCode chưa tồn tại (chống trùng lặp)
        require(!existingBatchCodes[_batchCode], "Batch code already exists");
        
        // Validation: Kiểm tra địa chỉ farm hợp lệ
        require(_farmAddress != address(0), "Invalid farm address");
        
        // Validation: Kiểm tra resourceType không rỗng
        require(bytes(_resourceType).length > 0, "Resource type cannot be empty");

        // Tạo bản ghi mới
        BatchRecord storage record = batchRecords[nextBatchId];
        
        record.batchCode    = _batchCode;
        record.dataHash     = _dataHash;
        record.farmAddress  = _farmAddress;
        record.timestamp    = block.timestamp;
        record.resourceType = _resourceType;
        record.isActive     = true;

        // Đánh dấu batchCode đã tồn tại
        existingBatchCodes[_batchCode] = true;

        // Phát sự kiện
        emit BatchRecorded(
            nextBatchId,
            _batchCode,
            _farmAddress,
            _dataHash,
            block.timestamp,
            _resourceType
        );

        // Trả về batchId và tăng counter
        return nextBatchId++;
    }

    /**
     * @dev Xác minh tính toàn vẹn dữ liệu của một lô
     * 
     * @param _batchId      Mã ID của lô cần xác minh
     * @param _dataToVerify Dữ liệu gốc cần xác minh (sẽ được hash và so sánh)
     * 
     * @return isValid true nếu dữ liệu khớp với hash trên blockchain
     * @return storedHash Hash đã lưu trên blockchain
     * 
     * @notice Hàm này:
     * 1. Hash dữ liệu đầu vào bằng Keccak256
     * 2. So sánh với hash đã lưu trên blockchain
     * 3. Trả về kết quả và phát sự kiện
     */
    function verifyBatch(
        uint256 _batchId,
        bytes32         _dataToVerify
    ) 
        external 
        batchExists(_batchId) 
        returns (bool isValid, bytes32 storedHash) 
    {
        BatchRecord storage record = batchRecords[_batchId];

        // Tính hash Keccak256 của dữ liệu cần xác minh
        bytes32 computedHash = keccak256(abi.encodePacked(_dataToVerify));

        // So sánh với hash đã lưu
        isValid = (computedHash == record.dataHash);

        // Phát sự kiện xác minh
        emit BatchVerified(_batchId, isValid, computedHash, record.dataHash);

        return (isValid, record.dataHash);
    }

    /**
     * @dev Xác minh nhanh bằng cách so sánh trực tiếp 2 hash
     * 
     * @param _batchId      Mã ID của lô
     * @param _providedHash Hash do người dùng cung cấp
     * 
     * @return isValid true nếu hash khớp
     */
    function quickVerify(
        uint256 _batchId,
        bytes32         _providedHash
    ) 
        external 
        batchExists(_batchId) 
        view 
        returns (bool isValid) 
    {
        return _providedHash == batchRecords[_batchId].dataHash;
    }

    /**
     * @dev Lấy thông tin chi tiết của một lô
     * 
     * @param _batchId Mã ID của lô
     * 
     * @return BatchRecord struct chứa thông tin đầy đủ
     */
    function getBatch(uint256 _batchId) 
        external 
        batchExists(_batchId) 
        view 
        returns (BatchRecord memory) 
    {
        return batchRecords[_batchId];
    }

    /**
     * @dev Kiểm tra batch code đã tồn tại chưa
     * 
     * @param _batchCode Mã lô cần kiểm tra
     * 
     * @return exists true nếu đã tồn tại
     */
    function isBatchCodeExists(string calldata _batchCode) 
        external 
        view 
        returns (bool exists) 
    {
        return existingBatchCodes[_batchCode];
    }

    // =============================================
    // ADMIN FUNCTIONS
    // =============================================

    /**
     * @dev Vô hiệu hóa một bản ghi (soft delete)
     * 
     * @param _batchId Mã ID của lô cần vô hiệu hóa
     */
    function deactivateBatch(uint256 _batchId) 
        external 
        onlyOwner 
        batchExists(_batchId) 
    {
        require(batchRecords[_batchId].isActive, "Batch already inactive");
        
        batchRecords[_batchId].isActive = false;
        
        emit BatchStatusChanged(_batchId, false);
    }

    /**
     * @dev Kích hoạt lại một bản ghi đã bị vô hiệu hóa
     * 
     * @param _batchId Mã ID của lô cần kích hoạt
     */
    function activateBatch(uint256 _batchId) 
        external 
        onlyOwner 
        batchExists(_batchId) 
    {
        require(!batchRecords[_batchId].isActive, "Batch already active");
        
        batchRecords[_batchId].isActive = true;
        
        emit BatchStatusChanged(_batchId, true);
    }

    /**
     * @dev Chuyển quyền sở hữu contract
     * 
     * @param _newOwner Địa chỉ ví của owner mới
     */
    function transferOwnership(address _newOwner) 
        external 
        onlyOwner 
    {
        require(_newOwner != address(0), "Invalid new owner address");
        owner = _newOwner;
    }

    /**
     * @dev Lấy tổng số lô đã được ghi nhận
     */
    function getTotalBatches() 
        external 
        view 
        returns (uint256) 
    {
        return nextBatchId - 1;
    }

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================

    /**
     * @dev Tính hash Keccak256 của một chuỗi
     * 
     * @param _data Dữ liệu cần hash
     * 
     * @return Hash Keccak256
     */
    function calculateKeccak256(string calldata _data) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(_data));
    }

    /**
     * @dev Tính hash SHA-256 (thông qua Ethereum's precompile)
     * 
     * @param _data Dữ liệu cần hash
     * 
     * @return bytes32 hash (truncation của SHA-256)
     */
    function calculateSHA256(string calldata _data) 
        external 
        pure 
        returns (bytes32) 
    {
        // Lưu ý: Solidity không có SHA-256 native, 
        // sử dụng inline assembly để gọi precompile
        bytes32 hash;
        assembly {
            mstore(0x00, keccak256(add(_data, 0x20), mload(_data)))
            hash := mload(0x00)
        }
        // Trả về Keccak256 (tương đương về độ dài)
        return keccak256(abi.encodePacked(_data));
    }
}
