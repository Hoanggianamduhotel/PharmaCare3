import type { Handler } from "@netlify/functions";
import { supabase } from "../../server/supabase";

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    // Lấy dữ liệu từ Supabase (tất cả thuốc để filter logic ở client)
    const { data: thuoc, error } = await supabase
      .from("thuoc")
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Lỗi database", error: error.message }),
      };
    }

    // Lọc và map dữ liệu thuốc sắp hết (tồn kho <= đặt hàng)
    const lowStockMedicines = thuoc
      .filter(t => {
        const tonKho = Number(t.so_luong_ton || 0);
        const datHang = Number(t.so_luong_dat_hang || 0);
        return tonKho <= datHang;
      })
      .map(t => ({
        id: t.id,
        ten: t.ten_thuoc,
        donvi: t.don_vi || "Viên",
        tonkho: Number(t.so_luong_ton || 0),
        gianhap: Number(t.gia_nhap || 0),
        giaban: Number(t.gia_ban || 0),
        dathang: Number(t.so_luong_dat_hang || 0),
        duongdung: t.duong_dung || "Uống",
        hansudung: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : "N/A",
        nhasanxuat: t.phan_loai || "Chưa cập nhật"
      }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(lowStockMedicines),
    };
  } catch (error) {
    console.error("Error fetching low stock medicines:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Lỗi server" }),
    };
  }
};