import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertMedicineSchema, 
  insertPrescriptionSchema, 
  insertPatientSchema,
  insertThuocSchema,
  insertKhambenhSchema,
  insertToathuocSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Thuoc (Vietnamese) routes  
  app.get("/api/thuoc", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc" });
    }
  });

  app.get("/api/thuoc/search", async (req, res) => {
    try {
      const { q = "" } = req.query;
      const thuoc = await storage.searchThuocByName(q as string);
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi tìm kiếm thuốc" });
    }
  });

  app.get("/api/thuoc/:id", async (req, res) => {
    try {
      const thuoc = await storage.getThuocById(req.params.id);
      if (!thuoc) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(thuoc);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin thuốc" });
    }
  });

  app.patch("/api/thuoc/:id/stock", async (req, res) => {
    try {
      const { so_luong_ton } = req.body;
      await storage.updateThuocStock(req.params.id, so_luong_ton);
      res.json({ message: "Cập nhật tồn kho thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi cập nhật tồn kho" });
    }
  });

  // Legacy Medicine routes for compatibility - now using thuoc table data
  app.get("/api/medicines", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      // Map thuoc to medicine format with actual data from thuoc table
      const medicines = thuoc.map(t => ({
        id: t.id,
        ten_thuoc: t.ten_thuoc,
        don_vi: t.don_vi || "",
        so_luong_ton: parseInt(t.so_luong_ton?.toString() || "0"),
        so_luong_dat_hang: parseInt(t.so_luong_dat_hang?.toString() || "0"),
        gia_nhap: parseInt(t.gia_nhap?.toString() || "0"),
        gia_ban: parseInt(t.gia_ban?.toString() || "0"),
        duong_dung: t.duong_dung || "Uống",
        created_at: t.created_at || new Date()
      }));
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc" });
    }
  });

  // API endpoint để lấy thuốc sắp hết hàng cho xuất Excel (phải đặt trước :id route)
  app.get("/api/medicines/low-stock", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      // Lọc thuốc sắp hết: tồn kho <= đặt hàng
      const lowStockThuoc = thuoc
        .filter(t => {
          const tonKho = Number(t.so_luong_ton || 0);
          const datHang = Number(t.so_luong_dat_hang || 0);
          return tonKho <= datHang; // Logic giống như trong MedicineInventory.tsx
        })
        .map(t => ({
          id: t.id,
          ten: t.ten_thuoc,
          donvi: t.don_vi || "Viên",
          tonkho: Number(t.so_luong_ton || 0),
          gianhap: Number(t.gia_nhap || 0),
          giaban: Number(t.gia_ban || 0),
          dathang: Number(t.so_luong_dat_hang || 0),
          duongdung: t.duong_dung || "Uống",
          hansudung: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : "N/A",
          nhasanxuat: t.phan_loai || "Chưa cập nhật"
        }));
      
      res.json(lowStockThuoc);
    } catch (error) {
      console.error("Error fetching low stock medicines:", error);
      res.status(500).json({ message: "Lỗi khi lấy danh sách thuốc sắp hết" });
    }
  });

  app.get("/api/medicines/:id", async (req, res) => {
    try {
      const medicine = await storage.getMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin thuốc" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const medicineData = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(medicineData);
      res.status(201).json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      console.error("Error creating medicine:", error);
      res.status(500).json({ message: "Lỗi khi thêm thuốc" });
    }
  });

  app.patch("/api/medicines/:id", async (req, res) => {
    try {
      const updateData = insertMedicineSchema.partial().parse(req.body);
      const medicine = await storage.updateMedicine(req.params.id, updateData);
      if (!medicine) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json(medicine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      res.status(500).json({ message: "Lỗi khi cập nhật thuốc" });
    }
  });

  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedicine(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Không tìm thấy thuốc" });
      }
      res.json({ message: "Đã xóa thuốc thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa thuốc" });
    }
  });

  // Prescription routes (simplified placeholder)
  app.get("/api/prescriptions", async (req, res) => {
    try {
      res.json([]); // Return empty array for now
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách toa thuốc" });
    }
  });

  // Patient routes (simplified placeholder)
  app.get("/api/patients", async (req, res) => {
    try {
      res.json([]); // Return empty array for now
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách bệnh nhân" });
    }
  });

  // Statistics route
  app.get("/api/statistics", async (req, res) => {
    try {
      const thuoc = await storage.getAllThuoc();
      
      const totalMedicines = thuoc.length;
      const lowStockMedicines = thuoc.filter(t => Number(t.so_luong_ton || 0) <= Number(t.so_luong_dat_hang || 0)).length;
      const pendingPrescriptions = 0; // No prescriptions in simplified schema yet
      const totalValue = 0; // No pricing in simplified schema yet
      
      res.json({
        totalMedicines,
        lowStockMedicines,
        pendingPrescriptions,
        totalValue
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
