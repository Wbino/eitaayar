import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  console.log("📩 [API] درخواست دریافت شد");

  try {
    const form = await req.formData();
    const message = form.get("message") as string | null;
    const file = form.get("file") as File | null;
    const date = form.get("date") as string;

    const TOKEN = process.env.NEXT_EITA_TOKEN;
    const CHAT_ID = process.env.NEXT_CHAT_ID;

    console.log("🔑 TOKEN:", !!TOKEN, "CHAT_ID:", !!CHAT_ID); // فقط برای تست وجود مقادیر

    if (!TOKEN || !CHAT_ID)
      return NextResponse.json({ ok: false, error: "توکن یا چت آی‌دی تنظیم نشده" });

    const baseUrl = `https://eitaayar.ir/api/${TOKEN}`;
    let url = "";
    let payload: any;
    let headers: any = {};

    if (file) {
      console.log("📦 شروع آپلود فایل...");
      url = `${baseUrl}/sendFile`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileData = new FormData();
      fileData.append("chat_id", CHAT_ID);
      fileData.append("caption", message || "");
      fileData.append("date", date);
      fileData.append("file", buffer, file.name);

      payload = fileData;
      headers = fileData.getHeaders();
    } else {
      console.log("📝 ارسال پیام متنی...");
      url = `${baseUrl}/sendMessage`;
      payload = { chat_id: CHAT_ID, text: message || "", date };
      headers = { "Content-Type": "application/json" };
    }

    const res = await axios.post(url, payload, {
      headers,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 5 * 60 * 1000,
      validateStatus: () => true,
    });

    console.log("📨 پاسخ سرور:", res.status, res.data);
    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("🔥 API ERROR:", error?.response?.data || error.message);
    return NextResponse.json(
      { ok: false, error: error?.response?.data || error.message },
      { status: 500 }
    );
  }
}
