# 🔧 Khắc phục lỗi 404 trên Render

## 🚨 Nguyên nhân lỗi:
Cấu hình hiện tại được thiết kế cho **Netlify** (serverless), nhưng bạn deploy trên **Render** (server-based).

## ❌ Vấn đề chính:

1. **Static files path sai**: 
   - Server tìm files tại `dist/public/` 
   - Nhưng Vite build output vào `dist/`

2. **Server PORT**: 
   - Render cung cấp PORT động
   - Cần cấu hình listen method khác

3. **Missing static file serving**:
   - Express chưa serve static files đúng cách
   - Route fallback chưa hoạt động

## ✅ Giải pháp đã áp dụng:

### 1. Cập nhật PORT handling cho Render
```javascript
// Sử dụng server.listen() chuẩn cho production
if (process.env.NODE_ENV === 'production') {
  server.listen(port, '0.0.0.0', () => {
    log(`🚀 PharmaCare serving on port ${port}`);
  });
}
```

### 2. Tạo Render config file
- `render.yaml` với cấu hình đúng cho Render
- Build command: `npm run build`  
- Start command: `npm start`
- Environment variables setup

## 🔧 Kiểm tra thêm cần thiết:

### Verify Build Output:
```bash
npm run build
ls -la dist/
```

Cần có:
- `dist/index.html` (main file)
- `dist/assets/` (JS/CSS files)

### Verify Server Static Path:
Trong `server/vite.ts`, `serveStatic()` function cần serve từ:
- Production: `dist/` (không phải `dist/public/`)
- Development: Vite dev server

### Environment Variables trên Render:
1. `NODE_ENV=production`
2. `VITE_SUPABASE_URL=your_url`
3. `VITE_SUPABASE_ANON_KEY=your_key`

## 🚀 Deploy Steps:

1. **Push code đã fix** lên GitHub
2. **Trigger redeploy** trên Render
3. **Check logs** xem server start thành công
4. **Test routes**: 
   - `/` → Should serve React app
   - `/api/medicines` → Should return JSON

## 📊 Expected Results:

✅ Server khởi động: "🚀 PharmaCare serving on port XXXX"
✅ Static files served từ `/dist/`  
✅ API routes hoạt động: `/api/*`
✅ SPA routing: All routes → `index.html`

**PharmaCare sẽ hoạt động hoàn hảo sau khi redeploy!**