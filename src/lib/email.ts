import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Clicmenu.ai <noreply@clicmenu.ai>";
const BRAND = "#10b981";
const BRAND_DARK = "#047857";

// ─── Base layout ─────────────────────────────────────────────────────────────

function layout(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Clicmenu.ai</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding-bottom:28px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${BRAND};border-radius:16px;padding:12px 20px;">
                  <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">✳ clicmenu.ai</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:24px;padding:48px 48px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:28px 16px 0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Hai ricevuto questa email perché sei registrato su <strong>Clicmenu.ai</strong>.<br/>
              © ${new Date().getFullYear()} Clicmenu.ai · Tutti i diritti riservati
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string) {
  return `<table cellpadding="0" cellspacing="0" style="margin:32px 0;">
    <tr>
      <td style="background:${BRAND};border-radius:14px;padding:0;">
        <a href="${url}" style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function divider() {
  return `<tr><td style="padding:8px 0;"><div style="height:1px;background:#f1f5f9;"></div></td></tr>`;
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:-0.8px;line-height:1.2;">${text}</h1>`;
}

function p(text: string) {
  return `<p style="margin:0 0 16px;font-size:16px;color:#475569;line-height:1.7;">${text}</p>`;
}

function highlight(text: string) {
  return `<div style="background:#ecfdf5;border-left:4px solid ${BRAND};border-radius:8px;padding:16px 20px;margin:24px 0;">
    <p style="margin:0;font-size:15px;color:${BRAND_DARK};font-weight:600;">${text}</p>
  </div>`;
}

// ─── Email 1: Benvenuto ────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, appUrl: string) {
  const html = layout(`
    ${h1("Benvenuto su Clicmenu.ai! 🎉")}
    ${p(`Ciao <strong>${name}</strong>, il tuo account è pronto.`)}
    ${p("Ora puoi creare il tuo primo menu digitale in pochi secondi — basta scattare una foto al tuo menu cartaceo e la nostra AI fa il resto.")}
    ${highlight("✓ 14 giorni gratuiti · ✓ Nessuna carta richiesta · ✓ Cancella quando vuoi")}
    ${p("Pronto per iniziare?")}
    ${btn("Crea il tuo primo menu →", `${appUrl}/dashboard/menus/new`)}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:24px 0 0;">
          <p style="margin:0;font-size:13px;color:#94a3b8;">Hai domande? Rispondi a questa email, siamo sempre disponibili.</p>
        </td>
      </tr>
    </table>
  `, "Benvenuto su Clicmenu.ai — il tuo menu digitale è pronto");

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Benvenuto su Clicmenu.ai 🎉 Il tuo menu digitale ti aspetta",
    html,
  });
}

// ─── Email 2: Conferma email ────────────────────────────────────────────────

export async function sendConfirmationEmail(to: string, confirmUrl: string) {
  const html = layout(`
    ${h1("Conferma il tuo indirizzo email")}
    ${p("Siamo quasi pronti! Clicca il pulsante qui sotto per confermare la tua email e attivare il tuo account Clicmenu.ai.")}
    ${btn("Conferma email →", confirmUrl)}
    ${p("Il link scade tra <strong>24 ore</strong>. Se non hai richiesto questo account, ignora questa email.")}
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Oppure copia questo link nel browser:<br/><span style="color:#64748b;word-break:break-all;">${confirmUrl}</span></p>
  `, "Conferma la tua email per attivare Clicmenu.ai");

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Conferma la tua email — Clicmenu.ai",
    html,
  });
}

// ─── Email 3: Reset password ────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = layout(`
    ${h1("Reset della password")}
    ${p("Hai richiesto di reimpostare la password del tuo account Clicmenu.ai.")}
    ${btn("Reimposta password →", resetUrl)}
    ${highlight("⚠️ Il link è valido per 1 ora. Se non hai fatto questa richiesta, ignora questa email — il tuo account è al sicuro.")}
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Oppure copia questo link nel browser:<br/><span style="color:#64748b;word-break:break-all;">${resetUrl}</span></p>
  `, "Reimposta la tua password Clicmenu.ai");

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reimposta la tua password — Clicmenu.ai",
    html,
  });
}

// ─── Email 4: Abbonamento attivato ────────────────────────────────────────

export async function sendSubscriptionActiveEmail(to: string, name: string, appUrl: string) {
  const html = layout(`
    ${h1("Il tuo piano è attivo! ✅")}
    ${p(`Grazie <strong>${name}</strong>! Il tuo abbonamento Clicmenu.ai è stato attivato con successo.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#f8fafc;border-radius:16px;padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:15px;color:#475569;">📅 Piano</td>
              <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:#0f172a;">Annuale — €37/anno</td>
            </tr>
            ${divider()}
            <tr>
              <td style="padding:6px 0;font-size:15px;color:#475569;">✓ Menu illimitati</td>
              <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:${BRAND};">Attivo</td>
            </tr>
            ${divider()}
            <tr>
              <td style="padding:6px 0;font-size:15px;color:#475569;">✓ AI estrazione foto</td>
              <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:${BRAND};">Attivo</td>
            </tr>
            ${divider()}
            <tr>
              <td style="padding:6px 0;font-size:15px;color:#475569;">✓ QR code personalizzati</td>
              <td align="right" style="padding:6px 0;font-size:15px;font-weight:700;color:${BRAND};">Attivo</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${btn("Vai alla dashboard →", `${appUrl}/dashboard`)}
  `, "Il tuo abbonamento Clicmenu.ai è attivo");

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Abbonamento attivato ✅ — Clicmenu.ai",
    html,
  });
}

// ─── Email 5: Trial in scadenza ────────────────────────────────────────────

export async function sendTrialEndingEmail(to: string, name: string, daysLeft: number, appUrl: string) {
  const html = layout(`
    ${h1(`Il tuo trial scade tra ${daysLeft} ${daysLeft === 1 ? "giorno" : "giorni"} ⏳`)}
    ${p(`Ciao <strong>${name}</strong>, il tuo periodo di prova gratuito di Clicmenu.ai sta per terminare.`)}
    ${highlight(`Non perdere i tuoi menu digitali! Attiva il piano annuale a soli <strong>€37/anno</strong> — meno di un caffè al mese.`)}
    ${p("Continuando avrai accesso a:")}
    <ul style="margin:0 0 24px;padding:0 0 0 20px;color:#475569;font-size:15px;line-height:2;">
      <li>Menu digitali illimitati</li>
      <li>Estrazione AI da foto</li>
      <li>QR code per ogni menu</li>
      <li>Traduzione automatica multilingua</li>
      <li>Analytics e statistiche</li>
    </ul>
    ${btn("Attiva il piano — €37/anno →", `${appUrl}/dashboard/billing`)}
    <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;text-align:center;">Nessun rinnovo automatico sorpresa · Annulla quando vuoi</p>
  `, `Il tuo trial Clicmenu.ai scade tra ${daysLeft} giorni`);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⏳ Il tuo trial scade tra ${daysLeft} giorni — Clicmenu.ai`,
    html,
  });
}
