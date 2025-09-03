import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet, Download, User, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Medicine {
  id: string;
  ten: string;
  donvi: string;
  tonkho: number;
  gianhap: number;
  giaban: number;
  dathang: number;
  duongdung: string;
  hansudung: string;
  nhasanxuat: string;
}

interface ExcelReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lowStockMedicines: Medicine[];
  lowStockCount: number;
}

export default function ExcelReportDialog({
  open,
  onOpenChange,
  lowStockMedicines,
  lowStockCount
}: ExcelReportDialogProps) {
  const [pharmacistName, setPharmacistName] = useState("");
  const [headOfDepartment, setHeadOfDepartment] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    if (!pharmacistName.trim()) {
      alert("Vui lòng nhập tên dược sĩ");
      return;
    }

    setIsExporting(true);

    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      
      // Tạo header và data
      const currentDate = format(new Date(), "dd/MM/yyyy");
      const currentTime = format(new Date(), "HH:mm");
      
      // Tạo data array cho Excel
      const excelData = [
        [""], // Empty row
        ["DANH SÁCH THUỐC SẮP HẾT"], // Title
        ["Báo cáo thống kê tình hình thuốc sắp hết hàng"], // Subtitle
        [""], // Empty row
        [`Ngày lập báo cáo: ${currentDate} - ${currentTime}`], // Date
        [`Tổng số thuốc sắp hết: ${lowStockCount} loại`], // Count
        [""], // Empty row
        ["STT", "Tên thuốc", "Đơn vị", "Tồn kho", "Giá nhập (VND)", "Giá bán (VND)", "Đặt hàng", "Đường dùng", "Hạn sử dụng"], // Headers
      ];

      // Thêm dữ liệu thuốc
      lowStockMedicines.forEach((medicine, index) => {
        excelData.push([
          (index + 1).toString(),
          medicine.ten,
          medicine.donvi,
          medicine.tonkho.toString(),
          medicine.gianhap.toLocaleString('vi-VN'),
          medicine.giaban.toLocaleString('vi-VN'),
          medicine.dathang.toString(),
          medicine.duongdung,
          medicine.hansudung ? format(new Date(medicine.hansudung), "dd/MM/yyyy") : "N/A"
        ]);
      });

      // Thêm footer
      excelData.push(
        [""], // Empty row
        [""], // Empty row
        ["THÔNG TIN BÁO CÁO"], // Footer title
        [`Dược sĩ lập báo cáo: ${pharmacistName}`],
        [`Ngày lập: ${currentDate}`],
        [`Trưởng phòng: ${headOfDepartment || "..............................."}`],
        [""], // Empty row
        ["Ghi chú: Danh sách này cần được duyệt và xem xét nhập hàng bổ sung"],
      );

      // Tạo worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Định dạng worksheet
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Merge cells cho title (cập nhật cho 9 cột)
      ws['!merges'] = [
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Title
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Subtitle
        { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } }, // Date
        { s: { r: 5, c: 0 }, e: { r: 5, c: 8 } }, // Count
        { s: { r: excelData.length - 6, c: 0 }, e: { r: excelData.length - 6, c: 8 } }, // Footer title
      ];

      // Set column widths
      ws['!cols'] = [
        { width: 5 },   // STT
        { width: 25 },  // Tên thuốc
        { width: 10 },  // Đơn vị
        { width: 10 },  // Tồn kho
        { width: 15 },  // Giá nhập
        { width: 15 },  // Giá bán
        { width: 10 },  // Đặt hàng
        { width: 12 },  // Đường dùng
        { width: 12 },  // Hạn sử dụng
      ];

      // Style cho title và headers
      const titleStyle = {
        font: { bold: true, size: 16 },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E3F2FD" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };

      // Apply styles
      if (ws['B2']) ws['B2'].s = titleStyle;
      
      // Style headers row (cập nhật cho 9 cột)
      for (let col = 0; col <= 8; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 7, c: col });
        if (ws[cellAddress]) ws[cellAddress].s = headerStyle;
      }

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách thuốc sắp hết");

      // Tạo file và download
      const fileName = `Danh_sach_thuoc_sap_het_${format(new Date(), "ddMMyyyy_HHmm")}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

      // Đóng dialog và reset form
      onOpenChange(false);
      setPharmacistName("");
      setHeadOfDepartment("");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Lỗi khi xuất file Excel. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Xuất báo cáo Excel - Thuốc sắp hết
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Số lượng thuốc:</span>
                  <span className="text-red-600 font-bold">{lowStockCount} loại</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Ngày xuất:</span>
                  <span>{format(new Date(), "dd/MM/yyyy")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="pharmacist-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Tên dược sĩ lập báo cáo *
              </Label>
              <Input
                id="pharmacist-name"
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                placeholder="Nhập tên dược sĩ..."
                className="mt-1"
                data-testid="input-pharmacist-name"
              />
            </div>

            <div>
              <Label htmlFor="head-name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Trưởng phòng (tùy chọn)
              </Label>
              <Input
                id="head-name"
                value={headOfDepartment}
                onChange={(e) => setHeadOfDepartment(e.target.value)}
                placeholder="Nhập tên trưởng phòng..."
                className="mt-1"
                data-testid="input-head-name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={exportToExcel}
              disabled={isExporting || !pharmacistName.trim()}
              className="w-full"
              data-testid="button-export-excel"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Đang xuất file..." : "Xuất báo cáo Excel"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-export"
            >
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}