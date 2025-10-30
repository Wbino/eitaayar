import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";          // ✅ برای پشتیبانی از Buffer
export const dynamic = "force-dynamic";   // ✅ جلوگیری از Cache شدن
export const maxDuration = 300;           // ⏳ حداکثر زمان اجرای ۵ دقیقه

export async function POST(req: Request) {
  console.log("📩 [API] درخواست ارسال پیام/فایل دریافت شد");

  try {
    // استخراج داده‌های فرم
    const form = await req.formData();
    const message = form.get("message") as string | null;
    const file = form.get("file") as File | null;
    const date = form.get("date") as string;

    const TOKEN = process.env.NEXT_EITA_TOKEN;
    const CHAT_ID = process.env.NEXT_CHAT_ID;

    if (!TOKEN || !CHAT_ID) {
      console.error("❌ توکن یا شناسه چت در محیط تنظیم نشده");
      return NextResponse.json(
        { ok: false, error: "توکن یا چت آی‌دی تنظیم نشده" },
        { status: 400 }
      );
    }

    const baseUrl = `https://eitaayar.ir/api/${TOKEN}`;
    let url = "";
    let payload: any;
    let headers: any = {};

    if (file) {
      // === ارسال فایل ===
      console.log("📦 شروع ارسال فایل:", file.name, file.type || "بدون نوع مشخص");

      url = `${baseUrl}/sendFile`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      if (message) formData.append("caption", message);
      if (date) formData.append("date", date);

      // تعیین نوع MIME برای جلوگیری از خطا در ویدیو یا تصویر
      formData.append("file", buffer, {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });

      payload = formData;
      headers = formData.getHeaders();
    } else {
      // === ارسال متن ===
      console.log("📝 ارسال پیام متنی...");
      url = `${baseUrl}/sendMessage`;
      payload = {
        chat_id: CHAT_ID,
        text: message || "",
        date,
      };
      headers = { "Content-Type": "application/json" };
    }

    // ارسال درخواست به ایتایار
    const res = await axios.post(url, payload, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 5 * 60 * 1000,
      validateStatus: () => true, // خطاهای 4xx و 5xx را هم دریافت می‌کند
    });

    console.log("📨 پاسخ سرور ایتایار:", res.status, res.data);

    // اگر پاسخ JSON نباشد یا ok=false باشد
    if (!res.data || res.data.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: res.data?.error || "پاسخ نامعتبر سرور ایتایار",
          raw: res.data,
        },
        { status: 500 }
      );
    }

    // ✅ موفق
    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("🔥 خطای غیرمنتظره در ارسال:", error?.response?.data || error.message);
    return NextResponse.json(
      { ok: false, error: error?.response?.data || error.message },
      { status: 500 }
    );
  }
}
