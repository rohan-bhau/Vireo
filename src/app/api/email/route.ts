import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = request.headers.get("x-email-secret");
  if (!process.env.EMAIL_SECRET || secret !== process.env.EMAIL_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const { to, subject, html } = (body ?? {}) as {
    to?: string;
    subject?: string;
    html?: string;
  };

  if (!to || !subject || !html) {
    return Response.json({ error: "Missing to, subject, or html" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Vireo" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
