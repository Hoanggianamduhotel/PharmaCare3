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
  type Medicine,
  type InsertMedicine,
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
  updateThuocStock(id: string, newStock: number): Promise<void>;

  // Medicine API (Đã cập nhật để khớp bảng thuoc mới)
  getMedicine(id: string): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: string): Promise<boolean>;

  // Khám bệnh
  getKhambenhById(id: string): Promise<Khambenh | undefined>;
  createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh>;

  // Toa thuốc
  createToathuoc(toathuoc: InsertToathuoc[]): Promise<Toathuoc[]>;
  getToathuocByKhambenhId(khambenhId: string): Promise<Toathuoc[]>;
}

export class SupabaseStorage implements IStorage {
  // User
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    return data || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  // Thuốc
  async getAllThuoc(): Promise<Thuoc[]> {
    const { data, error } = await supabase.from('thuoc').select('*').order('ten_thuoc');
    if (error) throw error;
    return data || [];
  }

  async getThuocById(id: string): Promise<Thuoc | undefined> {
    const { data } = await supabase.from('thuoc').select('*').eq('id', id).single();
    return data || undefined;
  }

  async searchThuocByName(searchTerm: string): Promise<Thuoc[]> {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .ilike('ten_thuoc', `%${searchTerm}%`)
      .order('ten_thuoc')
      .limit(15);
    if (error) throw error;
    return data || [];
  }

  async updateThuocStock(id: string, newStock: number): Promise<void> {
    const { error } = await supabase
      .from('thuoc')
      .update({ so_luong_ton: newStock })
      .eq('id', id);
    if (error) throw error;
  }

  // Khám bệnh
  async getKhambenhById(id: string): Promise<Khambenh | undefined> {
    const { data } = await supabase.from('khambenh').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh> {
    const { data, error } = await supabase.from('khambenh').insert(khambenh).select().single();
    if (error) throw error;
    return data;
  }

  // Toa thuốc
  async createToathuoc(toathuoc: InsertToathuoc[]): Promise<Toathuoc[]> {
    const { data, error } = await supabase.from('toathuoc').insert(toathuoc).select();
    if (error) throw error;
    return data || [];
  }

  async getToathuocByKhambenhId(khambenhId: string): Promise<Toathuoc[]> {
    const { data, error } = await supabase
      .from('toathuoc')
      .select('*')
      .eq('khambenh_id', khambenhId);
    if (error) throw error;
    return data || [];
  }

  // Medicine API - Sử dụng Spread Operator để hỗ trợ mọi cột mới (so_lo, han_dung, vat...)
  async getMedicine(id: string): Promise<Medicine | undefined> {
    const { data, error } = await supabase.from('thuoc').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return data as Medicine;
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    // Tự động nhận tất cả các trường từ schema (so_lo, han_dung, vat, phan_loai...)
    const { data, error } = await supabase
      .from('thuoc')
      .insert([medicine])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      throw error;
    }
    return data as Medicine;
  }

  async updateMedicine(id: string, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const { data, error } = await supabase
      .from('thuoc')
      .update(medicine)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Supabase Update Error:", error.message);
      throw error;
    }
    return data as Medicine;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    return !error;
  }
}

// Giữ MemStorage làm fallback dự phòng (không thay đổi logic cũ)
export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private thuocList = new Map<string, Thuoc>();
  private khambenhList = new Map<string, Khambenh>();
  private toathuocList = new Map<string, Toathuoc>();
  private currentId = 1;

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { 
    return Array.from(this.users.values()).find((u) => u.username === username); 
  }
  async createUser(user: InsertUser) {
    const id = `user-${this.currentId++}`;
    const newUser = { id, ...user } as User;
    this.users.set(id, newUser);
    return newUser;
  }
  async getAllThuoc() { return Array.from(this.thuocList.values()); }
  async getThuocById(id: string) { return this.thuocList.get(id); }
  async searchThuocByName(term: string) {
    return Array.from(this.thuocList.values()).filter(t => t.ten_thuoc.includes(term));
  }
  async updateThuocStock(id: string, stock: number) {
    const t = this.thuocList.get(id);
    if (t) this.thuocList.set(id, { ...t, so_luong_ton: stock.toString() });
  }
  async getKhambenhById(id: string) { return this.khambenhList.get(id); }
  async createKhambenh(k: InsertKhambenh) {
    const id = `kb-${this.currentId++}`;
    const newK = { id, ...k } as Khambenh;
    this.khambenhList.set(id, newK);
    return newK;
  }
  async createToathuoc(data: InsertToathuoc[]) {
    return data.map(d => {
      const id = `tt-${this.currentId++}`;
      const obj = { id, ...d } as Toathuoc;
      this.toathuocList.set(id, obj);
      return obj;
    });
  }
  async getToathuocByKhambenhId(id: string) {
    return Array.from(this.toathuocList.values()).filter(t => t.khambenh_id === id);
  }
  async getMedicine(id: string) { return this.getThuocById(id) as any; }
  async createMedicine(m: InsertMedicine) {
    const id = `m-${this.currentId++}`;
    const obj = { id, ...m } as any;
    this.thuocList.set(id, obj);
    return obj;
  }
  async updateMedicine(id: string, m: any) {
    const ex = this.thuocList.get(id);
    if (!ex) return undefined;
    const up = { ...ex, ...m };
    this.thuocList.set(id, up);
    return up;
  }
  async deleteMedicine(id: string) { return this.thuocList.delete(id); }
}

// Khởi tạo storage
let storage: IStorage;
let isUsingMemoryStorage = false;

const initializeStorage = async () => {
  try {
    const supabaseStorage = new SupabaseStorage();
    // Kiểm tra kết nối thực tế
    await supabase.from('thuoc').select('id').limit(1);
    storage = supabaseStorage;
    console.log('✅ Connected to Supabase database successfully');
  } catch (error: any) {
    console.error('⚠️ Supabase connection failed, using memory storage as fallback');
    storage = new MemStorage();
    isUsingMemoryStorage = true;
  }
};

initializeStorage();

export { storage };
export const getStorageInfo = () => ({ isUsingMemoryStorage });
