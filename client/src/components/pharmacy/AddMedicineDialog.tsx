import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Medicine } from "@shared/schema";

// 1. Cập nhật Schema để nhận thêm Số lô và Hạn dùng
const medicineSchema = z.object({
  ten_thuoc: z.string().min(1, "Tên thuốc không được để trống"),
  don_vi: z.string().min(1, "Đơn vị không được để trống"),
  so_luong_ton: z.number().min(0, "Số lượng phải >= 0").or(z.undefined()),
  gia_nhap: z.number().min(0, "Giá nhập phải >= 0").or(z.undefined()),
  gia_ban: z.number().min(0, "Giá bán phải >= 0").or(z.undefined()),
  so_luong_dat_hang: z.number().min(0, "Số lượng đặt hàng phải >= 0").or(z.undefined()),
  duong_dung: z.string().min(1, "Đường dùng không được để trống"),
  // Các trường mở rộng
  so_lo: z.string().min(1, "Số lô không được để trống"),
  han_su_dung: z.string().min(1, "Hạn sử dụng không được để trống"),
});

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMedicines: Medicine[];
}

export function AddMedicineDialog({
  open,
  onOpenChange,
  existingMedicines,
}: AddMedicineDialogProps) {
  const [tab, setTab] = useState("new");
  const [selectedExistingMedicine, setSelectedExistingMedicine] = useState<Medicine | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      ten_thuoc: "",
      don_vi: "",
      so_luong_ton: undefined,
      gia_nhap: undefined,
      gia_ban: undefined,
      so_luong_dat_hang: undefined,
      duong_dung: "",
      so_lo: "",
      han_su_dung: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof medicineSchema>) => {
      const processedData = {
        ...data,
        so_luong_ton: data.so_luong_ton ?? 0,
        gia_nhap: data.gia_nhap ?? 0,
        gia_ban: data.gia_ban ?? 0,
        so_luong_dat_hang: data.so_luong_dat_hang ?? 0,
      };
      const response = await apiRequest("POST", "/api/medicines", processedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({ title: "Thành công", description: "Đã nhập thuốc mới vào kho!" });
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: Partial<z.infer<typeof medicineSchema>> }) => {
      const response = await apiRequest("PATCH", `/api/medicines/${data.id}`, data.updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({ title: "Thành công", description: "Đã cập nhật lô hàng mới cho thuốc cũ!" });
      onOpenChange(false);
      form.reset();
      setSelectedExistingMedicine(null);
    },
  });

  const onSubmit = (data: z.infer<typeof medicineSchema>) => {
    if (tab === "new") {
      createMutation.mutate(data);
    } else if (selectedExistingMedicine) {
      // Logic cộng dồn tồn kho và cập nhật Lô/Hạn mới cho thuốc cũ
      const updateData: Partial<z.infer<typeof medicineSchema>> = {
        so_luong_ton: (selectedExistingMedicine.so_luong_ton || 0) + (data.so_luong_ton || 0),
        gia_nhap: data.gia_nhap,
        gia_ban: data.gia_ban,
        so_lo: data.so_lo,
        han_su_dung: data.han_su_dung,
      };
      updateMutation.mutate({ id: selectedExistingMedicine.id, updateData });
    }
  };

  const handleExistingMedicineSelect = (medicineId: string) => {
    const medicine = existingMedicines.find(m => m.id === medicineId);
    if (medicine) {
      setSelectedExistingMedicine(medicine);
      form.setValue("ten_thuoc", medicine.ten_thuoc);
      form.setValue("don_vi", medicine.don_vi);
      form.setValue("duong_dung", medicine.duong_dung);
      form.setValue("gia_nhap", medicine.gia_nhap);
      form.setValue("gia_ban", medicine.gia_ban);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-700">
            {tab === "new" ? "Nhập thuốc mới vào hệ thống" : "Nhập thêm lô hàng cho thuốc cũ"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); form.reset(); }} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Tạo mã thuốc mới</TabsTrigger>
            <TabsTrigger value="existing">Thuốc đã có trong kho</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
              
              {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-4">
                <h4 className="font-semibold text-sm text-slate-500 uppercase">Thông tin thuốc</h4>
                {tab === "new" ? (
                  <FormField
                    control={form.control}
                    name="ten_thuoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên thuốc *</FormLabel>
                        <FormControl><Input placeholder="Ví dụ: Hapacol 150mg" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <FormLabel>Chọn thuốc từ danh mục *</FormLabel>
                    <Select onValueChange={handleExistingMedicineSelect}>
                      <SelectTrigger><SelectValue placeholder="Tìm tên thuốc..." /></SelectTrigger>
                      <SelectContent>
                        {existingMedicines.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.ten_thuoc} ({m.don_vi})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="don_vi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị tính *</FormLabel>
                        <FormControl><Input placeholder="Viên, Gói, Chai..." {...field} disabled={tab === "existing"} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duong_dung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đường dùng *</FormLabel>
                        <FormControl><Input placeholder="Uống, Tiêm..." {...field} disabled={tab === "existing"} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* PHẦN 2: LÔ HÀNG VÀ HẠN DÙNG (CỘT MỞ RỘNG) */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                <h4 className="font-semibold text-sm text-blue-600 uppercase">Chi tiết lô hàng nhập</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="so_lo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700">Số lô (Batch No.) *</FormLabel>
                        <FormControl><Input placeholder="Nhập số lô..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="han_su_dung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-700">Hạn sử dụng *</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* PHẦN 3: SỐ LƯỢNG VÀ GIÁ */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="so_luong_ton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-red-600">
                        {tab === "existing" ? "Số lượng nhập thêm" : "Số lượng tồn kho"}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="so_luong_dat_hang"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngưỡng cảnh báo hết hàng</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gia_nhap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá nhập (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gia_ban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : "Xác nhận nhập kho"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
