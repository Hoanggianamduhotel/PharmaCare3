import { supabase } from "./supabase";
import {
  type Thuoc,
  type InsertThuoc,
  type User,
  type InsertUser,
  type Khambenh,
  type InsertKhambenh,
  type Toathuoc,
  type InsertToathuoc
} from "@shared/schema";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Thuốc
  getAllThuoc(): Promise<Thuoc[]>;
  getThuocById(id: string): Promise<Thuoc | undefined>;
  searchThuocByName(searchTerm: string): Promise<Thuoc[]>;
  createThuoc(thuoc: InsertThuoc): Promise<Thuoc>;
  updateThuoc(id: string, thuoc: Partial<InsertThuoc>): Promise<Thuoc | undefined>;
  deleteThuoc(id: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  // USER METHODS
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

  // THUOC METHODS (Khớp với Schema và Database)
  async getAllThuoc(): Promise<Thuoc[]> {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .order('ten_thuoc', { ascending: true });
    if (error) {
      console.error("Lỗi lấy danh sách thuốc:", error.message);
      return [];
    }
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
      .limit(20);
    if (error) throw error;
    return data || [];
  }

  async createThuoc(thuoc: InsertThuoc): Promise<Thuoc> {
    // Đảm bảo các trường numeric được gửi dưới dạng string/number đúng ý Supabase
    const { data, error } = await supabase
      .from('thuoc')
      .insert([thuoc])
      .select()
      .single();
    
    if (error) {
      console.error("Lỗi Supabase khi INSERT:", error.message);
      throw new Error(error.message);
    }
    return data;
  }

  async updateThuoc(id: string, updateData: Partial<InsertThuoc>): Promise<Thuoc | undefined> {
    const { data, error } = await supabase
      .from('thuoc')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Lỗi Supabase khi UPDATE:", error.message);
      throw new Error(error.message);
    }
    return data || undefined;
  }

  async deleteThuoc(id: string): Promise<boolean> {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    return !error;
  }
}

// KHỞI TẠO DUY NHẤT STORAGE THỰC
export const storage = new SupabaseStorage();
