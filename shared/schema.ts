import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- BẢNG USER ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// --- BẢNG THUỐC (CHÍNH - KHỚP SQL SUPABASE) ---
export const thuoc = pgTable("thuoc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi"),
  so_luong_ton: numeric("so_luong_ton"),
  gia_ban: numeric("gia_ban"),
  gia_nhap: numeric("gia_nhap", { precision: 10, scale: 2 }),
  so_luong_dat_hang: integer("so_luong_dat_hang").default(0),
  duong_dung: text("duong_dung"),
  phan_loai: text("phan_loai"),
  // Các cột mới cập nhật từ SQL của bạn
  so_lo: text("so_lo"),
  id_hoa_don: text("id_hoa_don"),
  ngay_sx: date("ngay_sx"), 
  han_dung: date("han_dung"),
  ma_nha_cung_cap: text("ma_nha_cung_cap"),
  so_dang_ky: text("so_dang_ky"),
  quy_cach_dong_goi: text("quy_cach_dong_goi"),
  vat: numeric("vat").default("5"),
  created_at: timestamp("created_at").defaultNow(),
});

// --- BẢNG KHÁM BỆNH ---
export const khambenh = pgTable("khambenh", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  benh_nhan_id: text("ben_nhan_id").notNull(), // Lưu ý: khớp với DB của bạn
  bac_si_id: text("bac_si_id").notNull(),
  ngay_kham: text("ngay_kham").notNull(),
  chan_doan: text("chan_doan").notNull(),
  ghi_chu: text("ghi_chu"),
});

// --- BẢNG TOA THUỐC ---
export const toathuoc = pgTable("toathuoc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  khambenh_id: text("khambenh_id").notNull(),
  thuoc_id: text("thuoc_id").notNull(),
  so_luong: integer("so_luong").notNull(),
  cach_dung: text("cach_dung"),
});

// --- BẢNG BỆNH NHÂN (Dùng cho medicines cũ nếu cần) ---
export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_benhnhan: text("ten_benhnhan").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// --- ZOD SCHEMAS (Để validate dữ liệu từ Frontend gửi lên) ---
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Quan trọng: Cho phép các trường null/optional không gây lỗi 400
export const insertThuocSchema = createInsertSchema(thuoc).omit({
  id: true,
  created_at: true,
});

export const insertKhambenhSchema = createInsertSchema(khambenh).omit({
  id: true,
});

export const insertToathuocSchema = createInsertSchema(toathuoc).omit({
  id: true,
});

// --- TYPE DEFINITIONS ---
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Thuoc = typeof thuoc.$inferSelect;
export type InsertThuoc = typeof thuoc.$inferInsert;
export type Khambenh = typeof khambenh.$inferSelect;
export type InsertKhambenh = typeof khambenh.$inferInsert;
export type Toathuoc = typeof toathuoc.$inferSelect;
export type InsertToathuoc = typeof toathuoc.$inferInsert;
export type Patient = typeof patients.$inferSelect;

// Giữ lại kiểu Medicine để không lỗi các file cũ đang import
export type Medicine = Thuoc; 
export type InsertMedicine = InsertThuoc;
