import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { httpMethod, path, body } = event;
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1];

    switch (httpMethod) {
      case 'GET':
        const { data: list } = await supabase.from('thuoc').select('*').order('ten_thuoc');
        return { statusCode: 200, headers, body: JSON.stringify(list) };

      case 'POST':
        const newData = JSON.parse(body || '{}');
        const { data: created, error: postErr } = await supabase.from('thuoc').insert(newData).select().single();
        if (postErr) throw postErr;
        return { statusCode: 201, headers, body: JSON.stringify(created) };

      case 'PATCH':
        const updateData = JSON.parse(body || '{}');
        const { data: updated, error: patchErr } = await supabase.from('thuoc').update(updateData).eq('id', id).select().single();
        if (patchErr) throw patchErr;
        return { statusCode: 200, headers, body: JSON.stringify(updated) };

      case 'DELETE':
        await supabase.from('thuoc').delete().eq('id', id);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Deleted" }) };

      default:
        return { statusCode: 405, headers, body: "Method Not Allowed" };
    }
  } catch (error: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
