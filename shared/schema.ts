import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const thuoc = pgTable("thuoc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ten_thuoc: text("ten_thuoc").notNull(),
  don_vi: text("don_vi"),
  so_luong_ton: numeric("so_luong_ton").default("0"),
  gia_ban: numeric("gia_ban").default("0"),
  gia_nhap: numeric("gia_nhap").default("0"),
  so_luong_dat_hang: integer("so_luong_dat_hang").default(0),
  duong_dung: text("duong_dung"),
  phan_loai: text("phan_loai"),
  so_lo: text("so_lo"),
  ngay_sx: text("ngay_sx"),
  han_dung: text("han_dung"),
  ma_nha_cung_cap: text("ma_nha_cung_cap"),
  so_dang_ky: text("so_dang_ky"),
  quy_cach_dong_goi: text("quy_cach_dong_goi"),
  vat: numeric("vat").default("5"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertThuocSchema = createInsertSchema(thuoc).omit({
  id: true,
  created_at: true,
});

export type Thuoc = typeof thuoc.$inferSelect;
export type InsertThuoc = typeof thuoc.$inferInsert;
