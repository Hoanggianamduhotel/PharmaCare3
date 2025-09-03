import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ExcelReportDialog from "./ExcelReportDialog";

interface StatisticsBoardProps {
  statistics?: {
    totalMedicines: number;
    lowStockMedicines: number;
    pendingPrescriptions: number;
    totalValue: number;
  };
}

export function StatisticsBoard({ statistics }: StatisticsBoardProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Query để lấy danh sách thuốc sắp hết
  const { data: lowStockMedicines = [] } = useQuery<any[]>({
    queryKey: ['/api/medicines/low-stock'],
    enabled: showExportDialog, // Chỉ fetch khi cần thiết
  });
  if (!statistics) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Thống kê</h3>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Thống kê</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tổng thuốc:</span>
          <span className="font-semibold text-primary">{statistics.totalMedicines}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sắp hết:</span>
          <button
            onClick={() => setShowExportDialog(true)}
            className="font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-2 py-1 rounded transition-colors cursor-pointer"
            data-testid="button-low-stock-count"
            title="Click để xuất báo cáo Excel"
          >
            {statistics.lowStockMedicines}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Toa chờ:</span>
          <span className="font-semibold text-green-600">{statistics.pendingPrescriptions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tổng giá trị:</span>
          <span className="font-semibold text-primary">
            {statistics.totalValue.toLocaleString()} VNĐ
          </span>
        </div>
      </div>
      
      <ExcelReportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        lowStockMedicines={lowStockMedicines}
        lowStockCount={statistics.lowStockMedicines}
      />
    </div>
  );
}
