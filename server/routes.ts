import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertThuocSchema,
  insertKhambenhSchema,
  insertToathuocSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // --- THUOC (VIETNAMESE) ROUTES ---
  
  // Lấy toàn bộ danh mục thuốc
  app.get("/api/thuoc", async (_req, res) => {
    try {
      const danhSachThuoc = await storage.getAllThuoc();
      res.json(danhSachThuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc" });
    }
  });

  // Tìm kiếm thuốc theo tên
  app.get("/api/thuoc/search", async (req, res) => {
    try {
      const { q = "" } = req.query;
      const ketQua = await storage.searchThuocByName(q as string);
      res.json(ketQua);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tìm kiếm thuốc" });
    }
  });

  // Chi tiết 1 loại thuốc
  app.get("/api/thuoc/:id", async (req, res) => {
    try {
      const thuoc = await storage.getThuocById(req.params.id);
      if (!thuoc) return res.status(404).json({ message: "Không tìm thấy thuốc" });
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin thuốc" });
    }
  });

  // --- MEDICINES ROUTES (Cập nhật để dùng bảng 'thuoc' đồng nhất) ---

  // Route lấy thuốc cũ nhưng dữ liệu lấy từ bảng 'thuoc'
  app.get("/api/medicines", async (_req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      // Map về định dạng cũ nếu Frontend yêu cầu, nhưng giữ đủ data
      const medicines = thuoc.map(t => ({
        ...t,
        so_luong_ton: Number(t.so_luong_ton || 0),
        gia_nhap: Number(t.gia_nhap || 0),
        gia_ban: Number(t.gia_ban || 0),
      }));
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Lỗi hệ thống" });
    }
  });

  // POST: Tạo mới thuốc (Đã sửa để nhận so_lo, han_dung)
  app.post("/api/medicines", async (req, res) => {
    try {
      // SỬA TẠI ĐÂY: Dùng insertThuocSchema thay vì insertMedicineSchema cũ
      const data = insertThuocSchema.parse(req.body);
      const newThuoc = await storage.createThuoc(data);
      res.status(201).json(newThuoc);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi tạo thuốc mới" });
    }
  });

  // PATCH: Cập nhật lô hàng/tồn kho (Đã sửa để nhận so_lo, han_dung)
  app.patch("/api/medicines/:id", async (req, res) => {
    try {
      // SỬA TẠI ĐÂY: Cho phép update từng phần của bảng Thuoc
      const updateData = insertThuocSchema.partial().parse(req.body);
      const updated = await storage.updateThuoc(req.params.id, updateData);
      
      if (!updated) return res.status(404).json({ message: "Không tìm thấy thuốc" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi cập nhật thuốc" });
    }
  });

  // DELETE: Xóa thuốc
  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const success = await storage.deleteThuoc(req.params.id);
      if (!success) return res.status(404).json({ message: "Không tìm thấy thuốc" });
      res.json({ message: "Đã xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa" });
    }
  });

  // --- CÁC ROUTE KHÁC (BÁO CÁO & THỐNG KÊ) ---

  app.get("/api/medicines/low-stock", async (_req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      const lowStock = thuoc
        .filter(t => Number(t.so_luong_ton || 0) <= Number(t.so_luong_dat_hang || 0))
        .map(t => ({
          id: t.id,
          ten: t.ten_thuoc,
          donvi: t.don_vi,
          tonkho: Number(t.so_luong_ton || 0),
          gianhap: Number(t.gia_nhap || 0),
          giaban: Number(t.gia_ban || 0),
          dathang: Number(t.so_luong_dat_hang || 0),
          duongdung: t.duong_dung,
          hansudung: t.han_dung || "N/A", // Lấy trường han_dung mới
          solo: t.so_lo || "N/A"
        }));
      res.json(lowStock);
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy dữ liệu cảnh báo" });
    }
  });

  app.get("/api/statistics", async (_req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      res.json({
        totalMedicines: thuoc.length,
        lowStockMedicines: thuoc.filter(t => Number(t.so_luong_ton || 0) <= Number(t.so_luong_dat_hang || 0)).length,
        pendingPrescriptions: 0,
        totalValue: thuoc.reduce((sum, t) => sum + (Number(t.gia_ban || 0) * Number(t.so_luong_ton || 0)), 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi lấy thống kê" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
