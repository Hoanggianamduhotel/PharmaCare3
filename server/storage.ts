import { supabase } from "./supabase";
import {
  type Thuoc,
  type InsertThuoc,
  type User,
  type InsertUser,
  type Khambenh,
  type InsertKhambenh,
  type Toathuoc,
  type InsertToathuoc,
  type Patient,
  type InsertPatient
} from "@shared/schema";

export interface IStorage {
  // User
  getUser(id: string | number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Thuốc
  getAllThuoc(): Promise<Thuoc[]>;
  getThuocById(id: string | number): Promise<Thuoc | undefined>;
  searchThuocByName(searchTerm: string): Promise<Thuoc[]>;
  createThuoc(thuoc: InsertThuoc): Promise<Thuoc>;
  updateThuoc(id: string | number, thuoc: Partial<InsertThuoc>): Promise<Thuoc | undefined>;
  deleteThuoc(id: string | number): Promise<boolean>;

  // Bệnh nhân & Khám bệnh
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientById(id: string | number): Promise<Patient | undefined>;
  createKhambenh(data: InsertKhambenh): Promise<Khambenh>;
  createToathuoc(data: InsertToathuoc[]): Promise<Toathuoc[]>;
}

export class SupabaseStorage implements IStorage {
  // --- USER METHODS ---
  async getUser(id: string | number) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return undefined;
    return data;
  }

  async getUserByUsername(username: string) {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
    if (error) return undefined;
    return data || undefined;
  }

  async createUser(user: InsertUser) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw new Error(`Lỗi tạo user: ${error.message}`);
    return data;
  }

  // --- THUOC METHODS ---
  async getAllThuoc(): Promise<Thuoc[]> {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .order('ten_thuoc', { ascending: true }); // Sắp xếp theo tên cho dễ nhìn
    
    if (error) {
      console.error("Lỗi lấy danh sách thuốc:", error.message);
      return [];
    }
    return data || [];
  }

  async getThuocById(id: string | number) {
    const { data, error } = await supabase.from('thuoc').select('*').eq('id', id).single();
    if (error) return undefined;
    return data;
  }

  async searchThuocByName(searchTerm: string) {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .ilike('ten_thuoc', `%${searchTerm}%`)
      .limit(20);
    
    if (error) return [];
    return data || [];
  }

  async createThuoc(thuoc: InsertThuoc): Promise<Thuoc> {
    const { data, error } = await supabase.from('thuoc').insert(thuoc).select().single();
    if (error) throw new Error(`Lỗi tạo thuốc: ${error.message}`);
    return data;
  }

  async updateThuoc(id: string | number, updateData: Partial<InsertThuoc>): Promise<Thuoc | undefined> {
    const { data, error } = await supabase
      .from('thuoc')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Lỗi cập nhật thuốc ${id}:`, error.message);
      return undefined;
    }
    return data;
  }

  async deleteThuoc(id: string | number): Promise<boolean> {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    if (error) {
      console.error(`Lỗi xóa thuốc ${id}:`, error.message);
      return false;
    }
    return true;
  }

  // --- PATIENT & KHAM BENH ---
  async createPatient(patient: InsertPatient): Promise<Patient> {
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  }

  async getPatientById(id: string | number) {
    const { data, error } = await supabase.from('patients').select('*').eq('id', id).single();
    if (error) return undefined;
    return data;
  }

  async createKhambenh(khambenh: InsertKhambenh): Promise<Khambenh> {
    const { data, error } = await supabase.from('khambenh').insert(khambenh).select().single();
    if (error) throw error;
    return data;
  }

  async createToathuoc(items: InsertToathuoc[]): Promise<Toathuoc[]> {
    const { data, error } = await supabase.from('toathuoc').insert(items).select();
    if (error) throw error;
    return data || [];
  }
}

export const storage = new SupabaseStorage();
