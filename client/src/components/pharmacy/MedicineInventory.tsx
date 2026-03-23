import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Pill, PillBottle, Droplet, Calendar, Package } from "lucide-react";
import type { Thuoc } from "@shared/schema";

interface MedicineInventoryProps {
  medicines: Thuoc[];
  onEditOrderQuantity: (medicine: Thuoc) => void;
}

export function MedicineInventory({
  medicines,
  onEditOrderQuantity,
}: MedicineInventoryProps) {
  // Hàm xác định Icon dựa trên tên thuốc
  const getMedicineIcon = (tenThuoc: string) => {
    const name = tenThuoc.toLowerCase();
    if (name.includes("vitamin") || name.includes("sủi")) {
      return <Droplet className="h-4 w-4 text-blue-500" />;
    }
    if (name.includes("capsule") || name.includes("viên nang") || name.includes("amoxicillin")) {
      return <PillBottle className="h-4 w-4 text-green-500" />;
    }
    return <Pill className="h-4 w-4 text-primary" />;
  };

  // Hàm kiểm tra hàng sắp hết (Low Stock)
  const isLowStock = (item: Thuoc) => {
    const tonKho = Number(item.so_luong_ton ?? 0);
    const nguongBaoDong = Number(item.so_luong_dat_hang ?? 0);
    return tonKho <= nguongBaoDong;
  };

  const columns = [
    {
      key: "ten_thuoc" as keyof Thuoc,
      label: "Tên thuốc",
      render: (value: string, item: Thuoc) => (
        <div className="flex items-center">
          {getMedicineIcon(value)}
          <div className="ml-2">
            <div className="font-medium text-gray-900">{value}</div>
            {isLowStock(item) && (
              <Badge variant="destructive" className="mt-1 text-[10px] h-4 uppercase">
                Sắp hết
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "don_vi" as keyof Thuoc,
      label: "Đơn vị",
      render: (value: string) => <span className="text-gray-600">{value || "---"}</span>,
    },
    {
      key: "so_lo" as keyof Thuoc,
      label: "Số lô",
      render: (value: string) => (
        <div className="flex items-center text-gray-500">
          <Package className="mr-1 h-3 w-3" />
          {value || "N/A"}
        </div>
      ),
    },
    {
      key: "han_dung" as keyof Thuoc,
      label: "Hạn dùng",
      render: (value: string) => {
        if (!value) return "---";
        const isExpired = new Date(value) < new Date();
        return (
          <div className={`flex items-center ${isExpired ? "text-red-500 font-bold" : "text-gray-600"}`}>
            <Calendar className="mr-1 h-3 w-3" />
            {value}
          </div>
        );
      },
    },
    {
      key: "so_luong_ton" as keyof Thuoc,
      label: "Tồn kho",
      render: (value: string | number | null, item: Thuoc) => (
        <Badge
          variant={isLowStock(item) ? "destructive" : "outline"}
          className={isLowStock(item) ? "" : "bg-blue-50 text-blue-700 border-blue-200"}
        >
          {Number(value ?? 0).toLocaleString()}
        </Badge>
      ),
      className: "text-right",
    },
    {
      key: "gia_ban" as keyof Thuoc,
      label: "Giá bán",
      render: (value: string | number | null) => (
        <span className="font-semibold text-emerald-700">
          {Number(value ?? 0).toLocaleString()} <small>đ</small>
        </span>
      ),
      className: "text-right",
    },
    {
      key: "duong_dung" as keyof Thuoc,
      label: "Đường dùng",
      render: (value: string) => <span className="text-xs italic text-gray-500">{value}</span>,
    },
    {
      key: "id" as keyof Thuoc,
      label: "Thao tác",
      render: (_: string, item: Thuoc) => (
        <div className="flex justify-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEditOrderQuantity(item);
            }}
            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-center",
    },
  ];

  const getRowClassName = (item: Thuoc) => {
    return isLowStock(item) ? "bg-red-50/50" : "";
  };

  return (
    <Card className="mb-6 shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b py-4">
        <CardTitle className="text-lg font-bold text-slate-700 flex items-center">
          <Package className="mr-2 h-5 w-5 text-slate-500" />
          Danh mục thuốc & Tồn kho thực tế
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={medicines}
          columns={columns}
          getRowClassName={getRowClassName}
        />
      </CardContent>
    </Card>
  );
}
