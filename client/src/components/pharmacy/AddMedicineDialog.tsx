import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/* ================== CONFIG SUPABASE ================== */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

/* ================== SCHEMA ================== */
const medicineSchema = z.object({
  ten_thuoc: z.string().min(1, "Bắt buộc"),
  don_vi: z.string().min(1, "Bắt buộc"),
  so_luong_ton: z.number().min(0, "Số lượng không âm"),
  gia_nhap: z.number().default(0),
  gia_ban: z.number().default(0),
  so_lo: z.string().min(1, "Bắt buộc"),
  han_dung: z.string().min(1, "Bắt buộc"),
  duong_dung: z.string().optional(),
});

type MedicineFormValues = z.infer<typeof medicineSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Để component cha load lại data
  existingMedicines: any[];
}

export function AddMedicineDialog({ open, onOpenChange, existingMedicines, onSuccess }: Props) {
  const [tab, setTab] = useState("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      ten_thuoc: "",
      don_vi: "Viên",
      so_luong_ton: 0,
      gia_nhap: 0,
      gia_ban: 0,
      so_lo: "",
      han_dung: "",
      duong_dung: "Uống",
    },
  });

  // Reset form khi đổi tab
  const handleTabChange = (v: string) => {
    setTab(v);
    setSelectedId(null);
    form.reset();
  };

  /* ================== API CALLS ================== */
  async function onSubmit(data: MedicineFormValues) {
    if (!SUPABASE_URL) return;
    setIsSaving(true);

    try {
      let response;
      if (tab === "new") {
        // TẠO MỚI (POST)
        response = await fetch(`${SUPABASE_URL}/rest/v1/thuoc`, {
          method: "POST",
          headers: { ...headers, "Prefer": "return=representation" },
          body: JSON.stringify(data),
        });
      } else {
        // CẬP NHẬT/NHẬP THÊM (PATCH)
        // Lưu ý: Logic PATCH của bạn có thể cần tính toán lại tổng tồn kho nếu muốn cộng dồn
        response = await fetch(`${SUPABASE_URL}/rest/v1/thuoc?id=eq.${selectedId}`, {
          method: "PATCH",
          headers: { ...headers, "Prefer": "return=representation" },
          body: JSON.stringify({
            so_luong_ton: data.so_luong_ton, // Bạn có thể logic cộng dồn ở đây
            so_lo: data.so_lo,
            han_dung: data.han_dung,
            gia_nhap: data.gia_nhap,
            gia_ban: data.gia_ban
          }),
        });
      }

      if (response.ok) {
        toast({ title: "Thành công", description: "Dữ liệu đã được lưu vào kho" });
        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess(); // Gọi callback để refresh danh sách ở trang chính
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error: any) {
      console.error("Lỗi API:", error);
      toast({
        variant: "destructive",
        title: "Lỗi lưu dữ liệu",
        description: error.message || "Không thể kết nối đến máy chủ",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📦 Quản lý kho thuốc</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="new">Tạo thuốc mới</TabsTrigger>
            <TabsTrigger value="existing">Nhập thêm lô (Thuốc cũ)</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {tab === "existing" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Chọn thuốc trong kho</label>
                  <Select
                    onValueChange={(id) => {
                      const m = existingMedicines.find((i: any) => i.id.toString() === id);
                      if (m) {
                        setSelectedId(id);
                        form.setValue("ten_thuoc", m.ten_thuoc);
                        form.setValue("don_vi", m.don_vi);
                        form.setValue("gia_nhap", m.gia_nhap);
                        form.setValue("gia_ban", m.gia_ban);
                        form.setValue("duong_dung", m.duong_dung || "Uống");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Danh sách thuốc hiện có --" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingMedicines.map((m: any) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.ten_thuoc} ({m.don_vi})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <FormField
                control={form.control}
                name="ten_thuoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên thuốc</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={tab === "existing" || isSaving} placeholder="Nhập tên thuốc..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="so_luong_ton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tab === "new" ? "Số lượng khởi tạo" : "Số lượng nhập thêm"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isSaving}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="don_vi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={tab === "existing" || isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="so_lo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lô (Batch No.)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} placeholder="Ví dụ: LO2024" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="han_dung"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hạn dùng</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSaving} />
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
                      <FormLabel>Giá nhập</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isSaving}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gia_ban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isSaving}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
                {isSaving ? "⏳ Đang lưu dữ liệu..." : "💾 Xác nhận lưu kho"}
              </Button>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
