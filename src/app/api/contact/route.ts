import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ContactPayload = {
  nome?: string;
  telefono?: string;
  email?: string;
  oggetto?: string;
  messaggio?: string;
  // Honeypot anti-spam: deve restare vuoto
  website?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON non valido' }, { status: 400 });
  }

  // Honeypot: se è stato compilato, è un bot — rispondi 200 senza fare nulla
  if (payload.website && payload.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const nome = (payload.nome ?? '').trim();
  const telefono = (payload.telefono ?? '').trim();
  const email = (payload.email ?? '').trim();
  const oggetto = (payload.oggetto ?? '').trim() || 'Richiesta informazioni';
  const messaggio = (payload.messaggio ?? '').trim();

  // Validazione minima
  if (!nome || !email || !telefono) {
    return NextResponse.json({ error: 'Compila tutti i campi obbligatori.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email non valida.' }, { status: 400 });
  }
  if (nome.length > 200 || telefono.length > 50 || email.length > 200 || messaggio.length > 5000) {
    return NextResponse.json({ error: 'Campi troppo lunghi.' }, { status: 400 });
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? '465');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO ?? user;

  if (!host || !user || !pass) {
    console.error('SMTP env vars mancanti');
    return NextResponse.json({ error: 'Configurazione email non attiva.' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true per 465, false per 587/STARTTLS
    auth: { user, pass },
  });

  const subject = `[Sito] ${oggetto} — ${nome}`;
  const textBody = [
    `Nuovo messaggio dal form contatti del sito`,
    `--`,
    `Nome:      ${nome}`,
    `Telefono:  ${telefono}`,
    `Email:     ${email}`,
    `Oggetto:   ${oggetto}`,
    `--`,
    `Messaggio:`,
    messaggio || '(nessun messaggio)',
  ].join('\n');
  const htmlBody = `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; color: #222; max-width: 600px;">
      <h2 style="color: #6b1a1f; border-bottom: 1px solid #eee; padding-bottom: 8px;">Nuovo messaggio dal sito</h2>
      <table style="border-collapse: collapse; margin-top: 12px;">
        <tr><td style="padding:4px 12px 4px 0; color:#777;">Nome</td><td><strong>${escapeHtml(nome)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#777;">Telefono</td><td><a href="tel:${escapeHtml(telefono.replace(/\s/g, ''))}">${escapeHtml(telefono)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#777;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0; color:#777;">Oggetto</td><td>${escapeHtml(oggetto)}</td></tr>
      </table>
      <h3 style="margin-top: 24px; color:#444;">Messaggio</h3>
      <div style="white-space: pre-wrap; padding: 12px; background:#f7f5f1; border-left: 3px solid #B8935A;">${escapeHtml(messaggio || '(nessun messaggio)')}</div>
      <p style="margin-top: 24px; color:#999; font-size:12px;">Email automatica generata da www.eredicoppola.com</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Sito Coppola" <${user}>`,
      to,
      replyTo: `"${nome}" <${email}>`,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('SMTP error:', err);
    return NextResponse.json({ error: "Errore nell'invio. Riprova o chiamaci." }, { status: 500 });
  }
}
