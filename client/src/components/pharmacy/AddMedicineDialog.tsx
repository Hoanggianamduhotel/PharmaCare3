import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Thuoc } from "@shared/schema";

const medicineSchema = z.object({
  ten_thuoc: z.string().min(1, "Bắt buộc"),
  don_vi: z.string().min(1, "Bắt buộc"),
  so_luong_ton: z.number().default(0),
  gia_nhap: z.number().default(0),
  gia_ban: z.number().default(0),
  so_lo: z.string().min(1, "Bắt buộc"),
  han_dung: z.string().min(1, "Bắt buộc"),
  duong_dung: z.string().optional(),
});

export function AddMedicineDialog({ open, onOpenChange, existingMedicines }: any) {
  const [tab, setTab] = useState("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: { ten_thuoc: "", don_vi: "Viên", so_luong_ton: 0, gia_nhap: 0, gia_ban: 0, so_lo: "", han_dung: "", duong_dung: "Uống" }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        so_luong_ton: String(data.so_luong_ton),
        gia_nhap: String(data.gia_nhap),
        gia_ban: String(data.gia_ban),
      };
      const method = tab === "new" ? "POST" : "PATCH";
      const url = tab === "new" ? "/api/thuoc" : `/api/thuoc/${selectedId}`;
      return (await apiRequest(method, url, payload)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thuoc"] });
      toast({ title: "Thành công" });
      onOpenChange(false);
      form.reset();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Quản lý kho thuốc</DialogTitle></DialogHeader>
        <Tabs value={tab} onValueChange={(v) => { setTab(v); form.reset(); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Tạo mới</TabsTrigger>
            <TabsTrigger value="existing">Nhập thêm lô</TabsTrigger>
          </TabsList>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              {tab === "existing" && (
                <Select onValueChange={(id) => {
                  const m = existingMedicines.find((i: any) => i.id === id);
                  if (m) {
                    setSelectedId(id);
                    form.setValue("ten_thuoc", m.ten_thuoc);
                    form.setValue("don_vi", m.don_vi);
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Chọn thuốc trong kho" /></SelectTrigger>
                  <SelectContent>
                    {existingMedicines.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.ten_thuoc}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <FormField control={form.control} name="ten_thuoc" render={({ field }) => (
                <FormItem><FormLabel>Tên thuốc</FormLabel><FormControl><Input {...field} disabled={tab === "existing"} /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="so_luong_ton" render={({ field }) => (
                  <FormItem><FormLabel>Số lượng nhập</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="so_lo" render={({ field }) => (
                  <FormItem><FormLabel>Số lô</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>Lưu dữ liệu</Button>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
