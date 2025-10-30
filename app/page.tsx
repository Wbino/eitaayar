"use client";

import { useState, useRef } from "react";
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
  const [progress, setProgress] = useState<number>(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // ✅ فقط دکمه را رفرش کن — با استفاده از useState کم‌تغییر و ref
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMessage(text);
        toast.info("متن از کلیپ‌بورد وارد شد ✨");
      } else {
        toast.warning("کلیپ‌بورد خالیه 📋");
      }
    } catch {
      toast.error("دسترسی به کلیپ‌بورد مجاز نیست ⚠️");
    }
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      toast.info("ارسال لغو شد ❌");
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!message && !file) {
      toast.error("هیچ متنی یا فایلی وارد نشده ❌");
      return;
    }
    if (!scheduleDate) {
      toast.error("زمان ارسال انتخاب نشده ⏰");
      return;
    }

    setLoading(true);
    setProgress(0);

    const unixTimestamp = Math.floor(scheduleDate.getTime() / 1000);
    const formData = new FormData();
    formData.append("message", message);
    if (file) formData.append("file", file);
    formData.append("date", unixTimestamp.toString());

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setLoading(false);
      setProgress(0);
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.ok) {
          toast.success("پیام با موفقیت زمان‌بندی شد ✅");
          setMessage("");
          setFile(null);
          setScheduleDate(null);
          (document.getElementById("file-input") as HTMLInputElement).value = "";
        } else {
          toast.error("خطا در ارسال: " + (data.description || "نامشخص"));
        }
      } catch {
        toast.error("پاسخ نامعتبر از سرور ⚠️");
      }
    };

    xhr.onerror = () => {
      setLoading(false);
      toast.error("خطا در برقراری ارتباط با سرور ❌");
    };

    xhr.onabort = () => {
      setLoading(false);
      toast.info("درخواست لغو شد ❌");
    };

    xhr.timeout = 1000 * 60 * 5;
    xhr.ontimeout = () => {
      setLoading(false);
      toast.error("زمان ارسال طولانی شد و متوقف گردید ⚠️");
    };

    xhr.open("POST", "/api/send");
    xhr.send(formData);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
      <Toaster position="top-center" richColors />

      <Card className="w-[90%] max-w-sm p-6 space-y-5 shadow-md bg-card border border-border rounded-2xl">
        <h1 className="text-xl font-bold text-center mb-2">زمان‌بندی پیام ایتا</h1>

        {/* متن پیام */}
        <div className="space-y-2">
          <Label className="text-sm">متن پیام</Label>
          <Textarea
            placeholder="متن پیام را بنویس..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none h-28 text-base"
          />
          <Button
            type="button"
            onClick={handlePasteFromClipboard}
            variant="secondary"
            className="w-full mt-1 text-sm"
          >
            چسباندن از کلیپ‌بورد 📋
          </Button>
        </div>

        {/* فایل */}
        <div className="space-y-2">
          <Label className="text-sm">انتخاب فایل (اختیاری)</Label>

          <div className="flex items-center gap-2">
            <Input
              id="file-input"
              type="file"
              accept="*/*"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                setFile(selected);
              }}
              className="cursor-pointer flex-1"
            />
            {file && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  setFile(null);
                  (document.getElementById("file-input") as HTMLInputElement).value = "";
                  toast.info("فایل حذف شد ❌");
                }}
              >
                حذف
              </Button>
            )}
          </div>

          {/* پیش‌نمایش فایل */}
          {file && (
            <div className="mt-2 p-2 rounded-md border border-border bg-muted/30 flex flex-col items-center gap-2">
              {file.type.startsWith("video/") && (
                <video
                  src={URL.createObjectURL(file)}
                  className="rounded-md max-h-48 w-full object-contain"
                  controls
                  muted
                  playsInline
                />
              )}
              {file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="rounded-md max-h-48 w-auto object-contain"
                />
              )}
              <div className="text-xs text-center text-muted-foreground w-full break-words">
                <p>📎 {file.name}</p>
                <p>
                  نوع: {file.type || "نامشخص"} — حجم:{" "}
                  {(file.size / (1024 * 1024)).toFixed(2)} مگابایت
                </p>
              </div>
            </div>
          )}
        </div>

        {/* تاریخ و ساعت */}
        <div className="space-y-2">
          <Label className="text-sm">تاریخ و ساعت ارسال</Label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            format="YYYY/MM/DD HH:mm"
            value={scheduleDate}
            onChange={(date: any) => {
              const jsDate = date?.toDate?.();
              setScheduleDate(jsDate || null);
            }}
            plugins={[<TimePicker position="bottom" />]}
            inputMode="none"
            render={(value, openCalendar) => (
              <input
                type="text"
                value={value}
                onClick={openCalendar}
                readOnly
                className="w-full bg-background text-foreground p-2 border border-border rounded-md text-center cursor-pointer select-none"
                placeholder="انتخاب تاریخ و ساعت..."
              />
            )}
          />
        </div>

        {/* دکمه‌ها */}
        <div className="space-y-2 flex flex-col items-center">
          {!loading && (
            <Button
              onClick={handleSubmit}
              className="w-full mt-4 h-12 text-lg font-bold"
            >
              ارسال پیام
            </Button>
          )}

          {loading && (
            <div className="flex flex-col w-full items-center">
              <Button
                disabled
                className="w-full h-12 text-lg font-bold opacity-80"
              >
                {progress > 0
                  ? `در حال ارسال... ${progress}%`
                  : "در حال آپلود..."}
              </Button>
              <Button
                onClick={handleCancel}
                variant="destructive"
                className="w-1/2 mt-2"
              >
                لغو ارسال ❌
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ساخته شده با ❤️ برای مامان
        </p>
      </Card>
    </div>
  );
}
