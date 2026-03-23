import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, numeric, uuid, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- 1. BẢNG NGƯỜI DÙNG (USERS) ---
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// --- 2. BẢNG THUỐC (THUOC) - KHỚP 100% SQL DATABASE ---
export const thuoc = pgTable("thuoc", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi"),
  so_luong_ton: numeric("so_luong_ton"),
  gia_ban: numeric("gia_ban"),
  gia_nhap: numeric("gia_nhap", { precision: 10, scale: 2 }),
  so_luong_dat_hang: integer("so_luong_dat_hang").default(0),
  duong_dung: text("duong_dung"),
  phan_loai: text("phan_loai"),
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

// --- 3. BẢNG BỆNH NHÂN (PATIENTS) ---
export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_benhnhan: text("ten_benhnhan").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// --- 4. BẢNG KHÁM BỆNH (KHAMBENH) ---
export const khambenh = pgTable("khambenh", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  benh_nhan_id: uuid("benh_nhan_id").notNull(),
  bac_si_id: uuid("bac_si_id").notNull(),
  ngay_kham: date("ngay_kham").notNull().defaultNow(),
  chan_doan: text("chan_doan").notNull(),
  ghi_chu: text("ghi_chu"),
});

// --- 5. BẢNG TOA THUỐC (TOATHUOC) ---
export const toathuoc = pgTable("toathuoc", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  khambenh_id: uuid("khambenh_id").notNull(),
  thuoc_id: uuid("thuoc_id").notNull(),
  so_luong: integer("so_luong").notNull(),
  cach_dung: text("cach_dung"),
});

// --- ZOD INSERT SCHEMAS (Dùng cho Validation & Form) ---

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema cho Thuốc (Xử lý chuyển đổi kiểu Numeric từ Form thành String cho DB)
export const insertThuocSchema = createInsertSchema(thuoc, {
  so_luong_ton: z.preprocess((val) => (val === undefined ? "0" : String(val)), z.string()),
  gia_nhap: z.preprocess((val) => (val === undefined ? "0" : String(val)), z.string()),
  gia_ban: z.preprocess((val) => (val === undefined ? "0" : String(val)), z.string()),
  vat: z.preprocess((val) => (val === undefined ? "5" : String(val)), z.string()),
  so_luong_dat_hang: z.coerce.number().default(0),
  han_dung: z.string().min(1, "Hạn dùng không được để trống"),
  ngay_sx: z.string().optional(),
}).omit({
  id: true,
  created_at: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({ id: true, created_at: true });
export const insertKhambenhSchema = createInsertSchema(khambenh).omit({ id: true });
export const insertToathuocSchema = createInsertSchema(toathuoc).omit({ id: true });

// --- TYPE DEFINITIONS (Inferred Types) ---

export type User = typeof users.$inferSelect;
export type Thuoc = typeof thuoc.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Khambenh = typeof khambenh.$inferSelect;
export type Toathuoc = typeof toathuoc.$inferSelect;

export type InsertThuoc = z.infer<typeof insertThuocSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

// Kiểu dữ liệu phức hợp (Joins) cho UI
export type PrescriptionWithDetails = {
  id: string;
  ten_benhnhan: string;
  ngay_kham: string;
  chan_doan: string;
  medicines: Array<{
    ten_thuoc: string;
    so_luong: number;
    don_vi: string;
    cach_dung: string;
  }>;
};
