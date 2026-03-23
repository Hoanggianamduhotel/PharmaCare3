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
import { insertThuocSchema, type Thuoc, type InsertThuoc } from "@shared/schema";

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

  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<InsertThuoc>({
    resolver: zodResolver(insertThuocSchema),
    defaultValues: {
      ten_thuoc: "",
      don_vi: "",
      so_luong_ton: "0",
      gia_nhap: "0",
      gia_ban: "0",
      so_luong_dat_hang: 0,
      duong_dung: "",
      so_lo: "",
      han_dung: "",
      vat: "5",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertThuoc) => {
      const response = await apiRequest("POST", "/api/thuoc", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thuoc"] });
      toast({ title: "Thành công", description: "Đã thêm thuốc mới!" });
      onOpenChange(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertThuoc> }) => {
      const response = await apiRequest("PATCH", `/api/thuoc/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thuoc"] });
      toast({ title: "Thành công", description: "Đã cập nhật kho hàng!" });
      onOpenChange(false);
      form.reset();
    },
  });

  const onSubmit = (values: InsertThuoc) => {
    if (tab === "new") {
      createMutation.mutate(values);
    } else if (selectedExistingMedicine) {
      // Logic cộng dồn tồn kho cho thuốc cũ
      const currentStock = parseFloat(selectedExistingMedicine.so_luong_ton || "0");
      const addedStock = parseFloat(values.so_luong_ton || "0");
      
      const updateData = {
        ...values,
        so_luong_ton: (currentStock + addedStock).toString(),
      };
      
      updateMutation.mutate({
        id: selectedExistingMedicine.id,
        data: updateData,
      });
    }
  };

  const handleExistingMedicineSelect = (id: string) => {
    const med = existingMedicines.find((m) => m.id === id);
    if (med) {
      setSelectedExistingMedicine(med);
      form.reset({
        ten_thuoc: med.ten_thuoc,
        don_vi: med.don_vi || "",
        duong_dung: med.duong_dung || "",
        gia_nhap: med.gia_nhap || "0",
        gia_ban: med.gia_ban || "0",
        vat: med.vat || "5",
        so_luong_ton: "0", // Reset về 0 để nhập số lượng mới
        so_lo: med.so_lo || "",
        han_dung: med.han_dung || "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            {tab === "new" ? "Thêm thuốc mới vào danh mục" : "Nhập thêm thuốc vào kho"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); form.reset(); }} className="mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="new">Thuốc mới hoàn toàn</TabsTrigger>
            <TabsTrigger value="existing">Thuốc đã có trong kho</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {tab === "existing" && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                  <FormLabel className="text-blue-800 font-semibold">Chọn thuốc cần nhập thêm</FormLabel>
                  <Select onValueChange={handleExistingMedicineSelect}>
                    <SelectTrigger className="bg-white mt-1">
                      <SelectValue placeholder="Gõ tên để tìm thuốc cũ..." />
                    </SelectTrigger>
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
                  name="ten_thuoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên thuốc *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={tab === "existing"} className="font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="so_lo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lô</FormLabel>
                      <FormControl><Input {...field} placeholder="VD: L0123" /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="so_luong_ton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tab === "existing" ? "Số lượng nhập thêm" : "Số lượng tồn đầu"}</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-yellow-50 font-bold text-lg" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="don_vi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl><Input {...field} disabled={tab === "existing"} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT (%)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
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
                      <FormLabel>Giá nhập (đơn vị)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gia_ban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (niêm yết)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="han_dung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạn sử dụng *</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duong_dung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đường dùng</FormLabel>
                      <FormControl><Input {...field} placeholder="Uống / Tiêm..." /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                <Button 
                  type="submit" 
                  ref={saveButtonRef}
                  className="bg-blue-700 hover:bg-blue-800 px-8"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : "Xác nhận lưu kho"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
