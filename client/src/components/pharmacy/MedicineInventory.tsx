import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Pill, PillBottle, Droplet, Calendar, Package, AlertTriangle } from "lucide-react";

/* ================== TYPES ================== */
// Định nghĩa lại Type để không phụ thuộc vào backend cũ
export type Thuoc = {
  id: number;
  ten_thuoc: string;
  don_vi: string | null;
  so_luong_ton: number | null;
  so_luong_dat_hang?: number | null; // Ngưỡng báo động
  gia_nhap: number | null;
  gia_ban: number | null;
  so_lo: string | null;
  han_dung: string | null;
  duong_dung: string | null;
  ngay_tao?: string;
};

interface MedicineInventoryProps {
  medicines: Thuoc[];
  onEditOrderQuantity: (medicine: Thuoc) => void;
  isLoading?: boolean;
}

export function MedicineInventory({
  medicines,
  onEditOrderQuantity,
  isLoading
}: MedicineInventoryProps) {
  
  /* ================== HELPERS ================== */
  
  // Xác định Icon dựa trên tên thuốc
  const getMedicineIcon = (tenThuoc: string) => {
    const name = (tenThuoc || "").toLowerCase();
    if (name.includes("vitamin") || name.includes("sủi") || name.includes("siro")) {
      return <Droplet className="h-4 w-4 text-blue-500" />;
    }
    if (name.includes("capsule") || name.includes("nang") || name.includes("ống")) {
      return <PillBottle className="h-4 w-4 text-green-500" />;
    }
    return <Pill className="h-4 w-4 text-primary" />;
  };

  // Kiểm tra hàng sắp hết (Low Stock)
  const isLowStock = (item: Thuoc) => {
    const tonKho = Number(item.so_luong_ton ?? 0);
    const nguongBaoDong = Number(item.so_luong_dat_hang ?? 10); // Mặc định là 10 nếu không có ngưỡng
    return tonKho <= nguongBaoDong;
  };

  // Kiểm tra hết hạn
  const checkExpiryStatus = (dateStr: string | null) => {
    if (!dateStr) return { label: "N/A", color: "text-gray-400", isExpired: false };
    const expiryDate = new Date(dateStr);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    if (expiryDate < today) {
      return { label: dateStr, color: "text-red-600 font-bold", isExpired: true };
    }
    if (expiryDate < threeMonthsFromNow) {
      return { label: dateStr, color: "text-orange-500 font-medium", isExpired: false };
    }
    return { label: dateStr, color: "text-gray-600", isExpired: false };
  };

  /* ================== COLUMNS DEFINITION ================== */
  const columns = [
    {
      key: "ten_thuoc" as keyof Thuoc,
      label: "Tên thuốc",
      render: (value: string, item: Thuoc) => (
        <div className="flex items-center">
          <div className="p-2 bg-slate-100 rounded-full mr-3">
            {getMedicineIcon(value)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{value}</div>
            <div className="flex gap-1 mt-1">
               {isLowStock(item) && (
                <Badge variant="destructive" className="text-[9px] h-4 px-1 uppercase leading-none">
                  Sắp hết
                </Badge>
              )}
              {item.duong_dung && (
                <span className="text-[10px] text-slate-400 italic px-1 underline uppercase">
                   {item.duong_dung}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "so_lo" as keyof Thuoc,
      label: "Lô/Hạn dùng",
      render: (_: any, item: Thuoc) => {
        const expiry = checkExpiryStatus(item.han_dung);
        return (
          <div className="space-y-1">
            <div className="flex items-center text-xs text-slate-500">
              <Package className="mr-1 h-3 w-3" />
              Lô: {item.so_lo || "---"}
            </div>
            <div className={`flex items-center text-xs ${expiry.color}`}>
              <Calendar className="mr-1 h-3 w-3" />
              HD: {expiry.label}
              {expiry.isExpired && <AlertTriangle className="ml-1 h-3 w-3" />}
            </div>
          </div>
        );
      },
    },
    {
      key: "so_luong_ton" as keyof Thuoc,
      label: "Tồn kho",
      render: (value: any, item: Thuoc) => (
        <div className="flex flex-col items-end">
          <Badge
            variant={isLowStock(item) ? "destructive" : "outline"}
            className={`font-mono text-sm ${!isLowStock(item) ? "bg-blue-50 text-blue-700 border-blue-200" : ""}`}
          >
            {Number(value ?? 0).toLocaleString()}
          </Badge>
          <span className="text-[10px] text-slate-400 mt-1">{item.don_vi || "đv"}</span>
        </div>
      ),
      className: "text-right",
    },
    {
      key: "gia_ban" as keyof Thuoc,
      label: "Giá bán",
      render: (value: any) => (
        <div className="text-right">
          <div className="font-bold text-emerald-700">
            {Number(value ?? 0).toLocaleString()} <small>đ</small>
          </div>
          <div className="text-[10px] text-slate-400">mỗi đơn vị</div>
        </div>
      ),
      className: "text-right",
    },
    {
      key: "id" as keyof Thuoc,
      label: "Thao tác",
      render: (_: any, item: Thuoc) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditOrderQuantity(item);
            }}
            className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="text-xs">Sửa</span>
          </Button>
        </div>
      ),
      className: "text-center",
    },
  ];

  const getRowClassName = (item: Thuoc) => {
    if (checkExpiryStatus(item.han_dung).isExpired) return "bg-red-100/50";
    return isLowStock(item) ? "bg-orange-50/50" : "";
  };

  return (
    <Card className="shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-white border-b py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center">
            <PillBottle className="mr-2 h-6 w-6 text-blue-600" />
            Kho Dược Phẩm
          </CardTitle>
          <div className="flex gap-2">
             <Badge variant="outline" className="bg-slate-50">
               Tổng loại: {medicines.length}
             </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 italic">Đang tải dữ liệu kho...</div>
        ) : (
          <DataTable
            data={medicines}
            columns={columns}
            getRowClassName={getRowClassName}
          />
        )}
      </CardContent>
    </Card>
  );
}
