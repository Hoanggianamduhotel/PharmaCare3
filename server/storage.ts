import { supabase } from "./supabase";
import {
  type Thuoc,
  type InsertThuoc,
  type Toathuoc,
  type InsertToathuoc,
  type Khambenh,
  type InsertKhambenh,
  type User,
  type InsertUser,
} from "@shared/schema";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Thuốc (Tiếng Việt - Primary)
  getAllThuoc(): Promise<Thuoc[]>;
  getThuocById(id: string): Promise<Thuoc | undefined>;
  searchThuocByName(searchTerm: string): Promise<Thuoc[]>;
  createThuoc(data: InsertThuoc): Promise<Thuoc>;
  updateThuoc(id: string, data: Partial<InsertThuoc>): Promise<Thuoc | undefined>;
  deleteThuoc(id: string): Promise<boolean>;
  updateThuocStock(id: string, newStock: number): Promise<void>;

  // Khám bệnh & Toa thuốc
  getKhambenhById(id: string): Promise<Khambenh | undefined>;
  createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh>;
  createToathuoc(toathuoc: InsertToathuoc[]): Promise<Toathuoc[]>;
  getToathuocByKhambenhId(khambenhId: string): Promise<Toathuoc[]>;
}

// --- SUPABASE IMPLEMENTATION ---
export class SupabaseStorage implements IStorage {
  async getUser(id: string) {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getUserByUsername(username: string) {
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    return data || undefined;
  }

  async createUser(user: InsertUser) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  // Thuốc: Xử lý đầy đủ so_lo, han_dung
  async getAllThuoc() {
    const { data, error } = await supabase.from('thuoc').select('*').order('ten_thuoc');
    if (error) throw error;
    return data || [];
  }

  async getThuocById(id: string) {
    const { data } = await supabase.from('thuoc').select('*').eq('id', id).single();
    return data || undefined;
  }

  async searchThuocByName(searchTerm: string) {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .ilike('ten_thuoc', `%${searchTerm}%`)
      .order('ten_thuoc')
      .limit(15);
    if (error) throw error;
    return data || [];
  }

  async createThuoc(data: InsertThuoc) {
    // Supabase sẽ tự nhận diện các trường từ insertThuocSchema
    const { data: created, error } = await supabase.from('thuoc').insert(data).select().single();
    if (error) throw error;
    return created;
  }

  async updateThuoc(id: string, updateData: Partial<InsertThuoc>) {
    const { data, error } = await supabase
      .from('thuoc')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data || undefined;
  }

  async deleteThuoc(id: string) {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    return !error;
  }

  async updateThuocStock(id: string, newStock: number) {
    const { error } = await supabase
      .from('thuoc')
      .update({ so_luong_ton: newStock.toString() }) // numeric cần string
      .eq('id', id);
    if (error) throw error;
  }

  // Khám bệnh & Toa thuốc
  async getKhambenhById(id: string) {
    const { data } = await supabase.from('khambenh').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createKhambenh(khambenh: InsertKhambenh) {
    const { data, error } = await supabase.from('khambenh').insert(khambenh).select().single();
    if (error) throw error;
    return data;
  }

  async createToathuoc(toathuoc: InsertToathuoc[]) {
    const { data, error } = await supabase.from('toathuoc').insert(toathuoc).select();
    if (error) throw error;
    return data || [];
  }

  async getToathuocByKhambenhId(khambenhId: string) {
    const { data, error } = await supabase.from('toathuoc').select('*').eq('khambenh_id', khambenhId);
    if (error) throw error;
    return data || [];
  }
}

// Khởi tạo Storage (Bỏ qua MemStorage để tập trung vào Supabase)
export const storage = new SupabaseStorage();
