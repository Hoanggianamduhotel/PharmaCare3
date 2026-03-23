import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { httpMethod, path, body, queryStringParameters } = event;
    const pathParts = path.split('/').filter(Boolean);
    // Giả sử path là /api/thuoc hoặc /api/thuoc/:id
    const thuocId = pathParts[pathParts.length - 1] !== 'thuoc' ? pathParts[pathParts.length - 1] : null;

    switch (httpMethod) {
      case 'GET':
        if (path.includes('/search')) {
          const query = queryStringParameters?.q || '';
          const { data, error } = await supabase
            .from('thuoc')
            .select('*')
            .ilike('ten_thuoc', `%${query}%`)
            .order('ten_thuoc');
          if (error) throw error;
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        } 
        
        if (thuocId) {
          const { data, error } = await supabase
            .from('thuoc')
            .select('*')
            .eq('id', thuocId)
            .single();
          if (error || !data) return { statusCode: 404, headers, body: JSON.stringify({ message: 'Không tìm thấy' }) };
          return { statusCode: 200, headers, body: JSON.stringify(data) };
        }

        // Mặc định lấy tất cả
        const { data: allThuoc, error: errAll } = await supabase
          .from('thuoc')
          .select('*')
          .order('created_at', { ascending: false });
        if (errAll) throw errAll;
        return { statusCode: 200, headers, body: JSON.stringify(allThuoc) };

      case 'POST':
        const newData = JSON.parse(body || '{}');
        const { data: inserted, error: errInsert } = await supabase
          .from('thuoc')
          .insert([newData])
          .select()
          .single();
        if (errInsert) throw errInsert;
        return { statusCode: 201, headers, body: JSON.stringify(inserted) };

      case 'PATCH':
        if (!thuocId) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };
        
        const updateData = JSON.parse(body || '{}');
        
        // Xử lý riêng cho route cập nhật nhanh tồn kho hoặc cập nhật toàn bộ
        const { data: updated, error: errUpdate } = await supabase
          .from('thuoc')
          .update(updateData)
          .eq('id', thuocId)
          .select()
          .single();
          
        if (errUpdate) throw errUpdate;
        return { statusCode: 200, headers, body: JSON.stringify(updated) };

      case 'DELETE':
        if (!thuocId) return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing ID' }) };
        const { error: errDelete } = await supabase
          .from('thuoc')
          .delete()
          .eq('id', thuocId);
        if (errDelete) throw errDelete;
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Đã xóa thành công' }) };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
    }
  } catch (error: any) {
    console.error('Netlify Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Lỗi Server', error: error.message }),
    };
  }
};
