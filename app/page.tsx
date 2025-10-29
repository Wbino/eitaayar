"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

export default function Home() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message && !file) {
      toast.error("هیچ متنی یا فایلی برای ارسال وارد نشده ❌");
      return;
    }
    if (!scheduleDate) {
      toast.error("زمان ارسال انتخاب نشده ⏰");
      return;
    }

    setLoading(true);
    const unixTimestamp = Math.floor(scheduleDate.getTime() / 1000);

    const formData = new FormData();
    formData.append("message", message);
    if (file) formData.append("file", file);
    formData.append("date", unixTimestamp.toString());

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.ok) {
        toast.success("پیام با موفقیت زمان‌بندی شد ✅");
        setMessage("");
        setFile(null);
        setScheduleDate(null);
      } else {
        toast.error("خطا در ارسال: " + (data.description || "نامشخص"));
      }
    } catch (err) {
      toast.error("ارتباط با سرور برقرار نشد ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900 text-foreground dark:text-neutral-100 flex items-center justify-center p-4">
      <Toaster position="top-right" richColors />

      <Card className="w-full max-w-md md:max-w-lg p-6 space-y-5 shadow-lg bg-card dark:bg-neutral-800 border border-border">
        <h1 className="text-2xl font-bold text-center mb-4">
          زمان‌بندی پیام ایتا
        </h1>

        <div className="space-y-2">
          <Label>متن پیام</Label>
          <Textarea
            placeholder="متن پیام را بنویس..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none h-32"
          />
        </div>

        <div className="space-y-2">
          <Label>انتخاب فایل (اختیاری)</Label>
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-2">
          <Label>تاریخ و ساعت ارسال</Label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD HH:mm"
            value={scheduleDate}
            onChange={(date: any) => {
              const jsDate = date?.toDate?.();
              setScheduleDate(jsDate || null);
            }}
            plugins={[<TimePicker position="bottom" />]}
            className="w-full !bg-background !text-foreground !p-2 !border !border-border rounded-md"
            placeholder="انتخاب تاریخ و ساعت..."
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 font-bold text-lg"
        >
          {loading ? "در حال زمان‌بندی..." : "ارسال پیام زمان‌بندی‌شده"}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-3">
          ساخته شده با ❤️ برای مامان
        </p>
      </Card>
    </div>
  );
}
