import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, numeric, uuid, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const thuoc = pgTable("thuoc", {
  // 1. ID dùng kiểu uuid chính xác
  id: uuid("id").primaryKey().defaultRandom(),
  
  // 2. Thông tin cơ bản
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi"),
  duong_dung: text("duong_dung"),
  phan_loai: text("phan_loai"),
  quy_cach_dong_goi: text("quy_cach_dong_goi"),
  
  // 3. Số lượng và Định mức (Numeric để chính xác hơn integer)
  so_luong_ton: numeric("so_luong_ton"),
  so_luong_dat_hang: integer("so_luong_dat_hang").default(0),
  
  // 4. Tài chính (Sử dụng numeric cho tiền tệ)
  gia_nhap: numeric("gia_nhap", { precision: 10, scale: 2 }),
  gia_ban: numeric("gia_ban"),
  vat: numeric("vat").default("5"),
  
  // 5. Quản lý lô và Hạn dùng (CỰC KỲ QUAN TRỌNG)
  so_lo: text("so_lo"),
  so_dang_ky: text("so_dang_ky"),
  id_hoa_don: text("id_hoa_don"),
  ma_nha_cung_cap: text("ma_nha_cung_cap"),
  ngay_sx: date("ngay_sx"), // Khớp kiểu date trong SQL
  han_dung: date("han_dung"), // Khớp kiểu date trong SQL
  
  // 6. Metadata
  created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
});

// Cập nhật lại Insert Schema để dùng cho Form
export const insertThuocSchema = createInsertSchema(thuoc).omit({
  id: true,
  created_at: true,
});
