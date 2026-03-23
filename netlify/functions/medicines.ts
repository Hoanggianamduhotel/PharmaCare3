import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// CẬP NHẬT SCHEMA MỚI: Khớp hoàn toàn với schema.ts và SQL
const medicineSchema = z.object({
  ten_thuoc: z.string().min(1),
  don_vi: z.string().optional().nullable(),
  so_luong_ton: z.union([z.number(), z.string()]).transform(val => val.toString()),
  gia_nhap: z.union([z.number(), z.string()]).transform(val => val.toString()).optional(),
  gia_ban: z.union([z.number(), z.string()]).transform(val => val.toString()).optional(),
  so_luong_dat_hang: z.number().int().optional().default(0),
  duong_dung: z.string().optional().nullable(),
  phan_loai: z.string().optional().nullable(),
  so_lo: z.string().optional().nullable(),
  han_dung: z.string().optional().nullable(),
  ngay_sx: z.string().optional().nullable(),
  vat: z.union([z.number(), z.string()]).transform(val => val.toString()).optional().default("5"),
  ma_nha_cung_cap: z.string().optional().nullable(),
  so_dang_ky: z.string().optional().nullable(),
  quy_cach_dong_goi: z.string().optional().nullable(),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { httpMethod, path, body, queryStringParameters } = event;
    const pathParts = path.split('/');
    const medicineId = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'GET':
        if (pathParts.includes('search')) {
          const query = queryStringParameters?.q || '';
          const { data, error } = await supabase
            .from('thuoc')
            .select('*')
            .ilike('ten_thuoc', `%${query}%`)
            .order('ten_thuoc');
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } 
        
        if (medicineId && medicineId !== 'medicines' && medicineId !== 'thuoc') {
          const { data, error } = await supabase.from('thuoc').select('*').eq('id', medicineId).single();
          if (error || !data) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Không tìm thấy' }) };
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        const { data: allData, error: allErr } = await supabase.from('thuoc').select('*').order('ten_thuoc');
        if (allErr) throw allErr;
        return { statusCode: 200, headers, body: JSON.stringify(allData) };

      case 'POST':
        const createData = medicineSchema.parse(JSON.parse(body || '{}'));
        const { data: newRecord, error: createErr } = await supabase
          .from('thuoc')
          .insert(createData) // Dùng spread tự động vì đã khớp tên cột
          .select()
          .single();
        if (createErr) throw createErr;
        return { statusCode: 201, headers, body: JSON.stringify(newRecord) };

      case 'PATCH':
        const updateData = medicineSchema.partial().parse(JSON.parse(body || '{}'));
        const { data: updatedRecord, error: updateErr } = await supabase
          .from('thuoc')
          .update(updateData)
          .eq('id', medicineId)
          .select()
          .single();
        if (updateErr) throw updateErr;
        return { statusCode: 200, headers, body: JSON.stringify(updatedRecord) };

      case 'DELETE':
        const { error: delErr } = await supabase.from('thuoc').delete().eq('id', medicineId);
        if (delErr) throw delErr;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Đã xóa' }) };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
    }
  } catch (error: any) {
    console.error('Function error:', error);
    return {
      statusCode: error instanceof z.ZodError ? 400 : 500,
      headers,
      body: JSON.stringify({ 
        message: error instanceof z.ZodError ? 'Dữ liệu không hợp lệ' : 'Lỗi server', 
        errors: error?.errors || error.message 
      }),
    };
  }
};
