# Push PharmaCare to New Repository Guide

## 🎯 Mục tiêu
Tạo repository mới có tên `PharmaCare2.git` và push phiên bản hiện tại với tính năng Excel export mới.

## 📝 Các tính năng mới trong phiên bản này:
- ✅ Xuất báo cáo Excel chuyên nghiệp cho thuốc sắp hết
- ✅ Logic lọc chính xác: tồn kho <= đặt hàng
- ✅ Cấu trúc bảng đồng bộ với giao diện: STT, Tên thuốc, Đơn vị, Tồn kho, Giá nhập, Giá bán, Đặt hàng, Đường dùng, Hạn sử dụng
- ✅ API endpoints cho báo cáo (/api/medicines/low-stock)
- ✅ Thống kê real-time với 12 loại thuốc sắp hết
- ✅ Integration với Supabase database
- ✅ Serverless architecture với Netlify Functions

## 🚀 Hướng dẫn thực hiện:

### Bước 1: Tạo repository mới trên GitHub
```bash
# Truy cập GitHub và tạo repository mới với tên: PharmaCare2
# Không tích chọn "Initialize with README" để tránh conflict
```

### Bước 2: Setup Git local
```bash
# Clean up git locks nếu có
rm -f .git/config.lock .git/index.lock

# Initialize git repository
git init

# Add tất cả files
git add .

# Commit với message mô tả đầy đủ
git commit -m "Initial commit: PharmaCare Vietnamese Pharmacy Management System v2.0

Features:
- Complete React + TypeScript frontend with Shadcn/UI
- Serverless Netlify Functions backend architecture  
- Supabase PostgreSQL database integration
- Medicine inventory management with CRUD operations
- Professional Excel export for low-stock medicines
- Real-time statistics dashboard (12 low-stock medicines)
- Responsive design with dark/light theme support
- Vietnamese localization throughout the system

New in v2.0:
- Excel report generation with professional formatting
- Accurate low-stock filtering (tồn kho <= đặt hàng) 
- Column structure matching UI: STT, Tên thuốc, Đơn vị, Tồn kho, Giá nhập, Giá bán, Đặt hàng, Đường dùng, Hạn sử dụng
- Interactive statistics board with export functionality
- API endpoints: /api/medicines/low-stock
- Full deployment configuration for Netlify"
```

### Bước 3: Connect và push to GitHub
```bash
# Thêm remote repository (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/PharmaCare2.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

## 🔍 Verify deployment
Sau khi push thành công:

1. **Kiểm tra repository:** https://github.com/YOUR_USERNAME/PharmaCare2
2. **Deploy lên Netlify:** 
   - Connect repository PharmaCare2 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Test tính năng Excel export:**
   - Click số "12" trong sidebar statistics
   - Xuất file Excel và kiểm tra format

## 📊 Database Schema hiện tại:
```sql
-- Table: thuoc (medicines)
- id: UUID primary key
- ten_thuoc: VARCHAR (tên thuốc)
- don_vi: VARCHAR (đơn vị: gói, viên, chai...)
- so_luong_ton: NUMERIC (tồn kho)
- gia_nhap: NUMERIC (giá nhập)
- gia_ban: NUMERIC (giá bán)  
- so_luong_dat_hang: NUMERIC (số lượng đặt hàng)
- duong_dung: VARCHAR (đường dùng: uống, rơ miệng...)
- phan_loai: VARCHAR (phân loại)
- created_at: TIMESTAMP
```

## 🎯 Next Steps:
1. Push repository thành công 
2. Setup Netlify deployment
3. Configure environment variables (Supabase keys)
4. Test production deployment
5. Document any deployment issues in README.md

---
**Lưu ý:** Phiên bản này đã được test với database thật và API hoạt động ổn định với 102 loại thuốc, 12 loại sắp hết hàng.