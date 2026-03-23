import { useState } from "react";
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
import type { Thuoc } from "@shared/schema";

// 1. Schema chuẩn khớp với SQL Database
const medicineSchema = z.object({
  ten_thuoc: z.string().min(1, "Tên thuốc không được để trống"),
  don_vi: z.string().min(1, "Đơn vị không được để trống"),
  so_luong_ton: z.number().min(0, "Số lượng phải >= 0").or(z.undefined()),
  gia_nhap: z.number().min(0, "Giá nhập phải >= 0").or(z.undefined()),
  gia_ban: z.number().min(0, "Giá bán phải >= 0").or(z.undefined()),
  so_luong_dat_hang: z.number().min(0, "Ngưỡng báo động phải >= 0").optional().default(0),
  duong_dung: z.string().min(1, "Đường dùng không được để trống"),
  so_lo: z.string().min(1, "Số lô không được để trống"),
  han_dung: z.string().min(1, "Hạn sử dụng không được để trống"), // Khớp han_dung trong SQL
});

interface AddMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMedicines: Thuoc[];
}

export function AddMedicineDialog({
  open,
  onOpenChange,
  existingMedicines,
}: AddMedicineDialogProps) {
  const [tab, setTab] = useState("new");
  const [selectedExistingMedicine, setSelectedExistingMedicine] = useState<Thuoc | null>(null);
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
      so_luong_dat_hang: 0,
      duong_dung: "",
      so_lo: "",
      han_dung: "",
    },
  });

  // Mutation tạo thuốc mới
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof medicineSchema>) => {
      const response = await apiRequest("POST", "/api/thuoc", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thuoc"] });
      toast({ title: "Thành công", description: "Đã thêm thuốc mới vào danh mục!" });
      onOpenChange(false);
      form.reset();
    },
  });

  // Mutation cập nhật lô hàng (nhập thêm)
  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; updateData: Partial<Thuoc> }) => {
      const response = await apiRequest("PATCH", `/api/thuoc/${payload.id}`, payload.updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thuoc"] });
      toast({ title: "Thành công", description: "Đã nhập thêm lô hàng thành công!" });
      onOpenChange(false);
      form.reset();
      setSelectedExistingMedicine(null);
    },
  });

  const onSubmit = (data: z.infer<typeof medicineSchema>) => {
    if (tab === "new") {
      createMutation.mutate(data);
    } else if (selectedExistingMedicine) {
      // Logic cộng dồn số lượng cho thuốc đã có
      const currentStock = Number(selectedExistingMedicine.so_luong_ton) || 0;
      const newImport = data.so_luong_ton || 0;
      
      const updateData = {
        so_luong_ton: (currentStock + newImport).toString(),
        gia_nhap: data.gia_nhap?.toString(),
        gia_ban: data.gia_ban?.toString(),
        so_lo: data.so_lo,
        han_dung: data.han_dung,
      };
      updateMutation.mutate({ id: selectedExistingMedicine.id, updateData });
    }
  };

  const handleExistingMedicineSelect = (id: string) => {
    const m = existingMedicines.find((item) => item.id === id);
    if (m) {
      setSelectedExistingMedicine(m);
      form.setValue("ten_thuoc", m.ten_thuoc);
      form.setValue("don_vi", m.don_vi || "");
      form.setValue("duong_dung", m.duong_dung || "");
      form.setValue("gia_nhap", Number(m.gia_nhap) || 0);
      form.setValue("gia_ban", Number(m.gia_ban) || 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-800">
            {tab === "new" ? "Nhập thuốc mới" : "Nhập lô hàng bổ sung"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); form.reset(); }} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new">Tạo mã thuốc mới</TabsTrigger>
            <TabsTrigger value="existing">Thuốc đã có trong kho</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* PHẦN 1: THÔNG TIN GỐC */}
              <div className="p-4 border rounded-xl bg-slate-50/50 space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Thông tin định danh</h3>
                {tab === "new" ? (
                  <FormField
                    control={form.control}
                    name="ten_thuoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên thuốc thương mại *</FormLabel>
                        <FormControl><Input placeholder="Ví dụ: Augmentin 625mg" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-2">
                    <FormLabel>Chọn thuốc từ danh mục *</FormLabel>
                    <Select onValueChange={handleExistingMedicineSelect}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder="Gõ để tìm thuốc..." /></SelectTrigger>
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
                        <FormLabel>Đơn vị tính</FormLabel>
                        <FormControl><Input {...field} disabled={tab === "existing"} placeholder="Viên, Chai..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duong_dung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đường dùng</FormLabel>
                        <FormControl><Input {...field} disabled={tab === "existing"} placeholder="Uống, Tiêm..." /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* PHẦN 2: CHI TIẾT LÔ HÀNG */}
              <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/30 space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Chi tiết lô nhập hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="so_lo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lô (Batch No.) *</FormLabel>
                        <FormControl><Input className="bg-white" placeholder="Nhập số lô..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="han_dung"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hạn sử dụng *</FormLabel>
                        <FormControl><Input className="bg-white" type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* PHẦN 3: SỐ LƯỢNG & GIÁ */}
              <div className="grid grid-cols-2 gap-6 p-4 border rounded-xl bg-white">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="so_luong_ton"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-600 font-bold">Số lượng nhập kho *</FormLabel>
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
                        <FormLabel>Ngưỡng báo hết hàng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="space-y-4 border-l pl-6">
                  <FormField
                    control={form.control}
                    name="gia_nhap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá nhập (đơn vị)</FormLabel>
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
                        <FormLabel>Giá bán niêm yết</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800 px-8"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Xác nhận nhập kho"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
