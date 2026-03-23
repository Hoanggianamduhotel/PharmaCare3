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

  // Bệnh nhân & Khám bệnh (Bổ sung để chạy được tính năng đơn thuốc)
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientById(id: string): Promise<Patient | undefined>;
  createKhambenh(data: InsertKhambenh): Promise<Khambenh>;
  createToathuoc(data: InsertToathuoc[]): Promise<Toathuoc[]>;
}

export class SupabaseStorage implements IStorage {
  // --- USER METHODS ---
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

  // --- THUOC METHODS ---
  async getAllThuoc(): Promise<Thuoc[]> {
    const { data, error } = await supabase
      .from('thuoc')
      .select('*')
      .order('created_at', { ascending: false }); // Ưu tiên thuốc mới nhập lên đầu
    if (error) return [];
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
    const { data, error } = await supabase.from('thuoc').insert(thuoc).select().single();
    if (error) throw error;
    return data;
  }

  async updateThuoc(id: string, updateData: Partial<InsertThuoc>): Promise<Thuoc | undefined> {
    const { data, error } = await supabase
      .from('thuoc')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data || undefined;
  }

  async deleteThuoc(id: string): Promise<boolean> {
    const { error } = await supabase.from('thuoc').delete().eq('id', id);
    return !error;
  }

  // --- BỔ SUNG: PATIENT & KHAM BENH METHODS ---
  async createPatient(patient: InsertPatient): Promise<Patient> {
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  }

  async getPatientById(id: string) {
    const { data } = await supabase.from('patients').select('*').eq('id', id).single();
    return data || undefined;
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
