import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const message = form.get("message") as string | null;
    const file = form.get("file") as File | null;
    const date = form.get("date") as string;

    // استفاده از متغیرهای بدون `NEXT_PUBLIC_` که فقط در سرور قابل دسترسی هستند
    const TOKEN = process.env.NEXT_EITA_TOKEN;
    const CHAT_ID = process.env.NEXT_CHAT_ID;

    if (!TOKEN || !CHAT_ID)
      return NextResponse.json({ ok: false, error: "توکن یا چت آی‌دی تنظیم نشده" });

    const baseUrl = `https://eitaayar.ir/api/${TOKEN}`;
    let url = "";
    let payload: any;
    let headers: any = {};

    if (file) {
      // === ارسال فایل ===
      url = `${baseUrl}/sendFile`;

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const fileData = new FormData();
      fileData.append("chat_id", CHAT_ID);
      fileData.append("caption", message || "");
      fileData.append("date", date);
      fileData.append("file", fileBuffer, file.name);

      payload = fileData;
      headers = fileData.getHeaders ? fileData.getHeaders() : {};
    } else {
      // === ارسال متن ===
      url = `${baseUrl}/sendMessage`;

      payload = {
        chat_id: CHAT_ID,
        text: message || "",
        date,
      };
      headers = { "Content-Type": "application/json" };
    }

    const res = await axios.post(url, payload, { headers });
    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("API ERROR:", error?.response?.data || error.message);
    return NextResponse.json(
      { ok: false, error: error?.response?.data || error.message },
      { status: 500 }
    );
  }
}
