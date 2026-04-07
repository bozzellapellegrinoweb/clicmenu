import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Clicmenu.ai",
  description: "Informativa sul trattamento dei dati personali di Clicmenu.ai",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-emerald-600 text-sm font-medium hover:text-emerald-700 mb-4 inline-block">
            ← Torna alla home
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 mt-2 text-sm">Sito web: https://www.clicmenu.ai · Ultima modifica: 7 aprile 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <Section title="1. Titolare del Trattamento e Contatti">
          <p>Ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (di seguito "GDPR"), il Titolare del trattamento dei dati personali raccolti tramite il presente sito web è:</p>
          <InfoBox>
            <strong>Novarise Consulting FZCO</strong><br />
            Sede legale: Dubai Silicon Oasis, Ifza Park, DDP, Building A1, Dubai – Emirati Arabi Uniti<br />
            Licenza n.: 61290<br />
            Email: <a href="mailto:info@clicmenu.ai" className="text-emerald-600 hover:underline">info@clicmenu.ai</a>
          </InfoBox>
          <p>Il Titolare tratta i dati personali degli utenti nel rispetto della normativa vigente in materia di protezione dei dati personali, garantendo la riservatezza, la sicurezza e la correttezza del trattamento.</p>
        </Section>

        <Section title="2. Rappresentante nell'Unione Europea (art. 27 GDPR)">
          <p>Poiché il Titolare del trattamento ha sede al di fuori dell'Unione Europea, ai sensi dell'art. 27 GDPR, è tenuto a designare per iscritto un rappresentante nell'Unione Europea.</p>
          <InfoBox>
            <strong>Rappresentante UE:</strong> Novarise Consulting FZCO<br />
            Indirizzo: Dubai Silicon Oasis, Ifza Park, DDP, Building A1, Dubai – Emirati Arabi Uniti<br />
            Email: <a href="mailto:info@clicmenu.ai" className="text-emerald-600 hover:underline">info@clicmenu.ai</a>
          </InfoBox>
        </Section>

        <Section title="3. Tipologie di Dati Personali Raccolti">
          <SubSection title="3.1 Dati forniti volontariamente dall'utente">
            <ul>
              <li>Dati anagrafici e di contatto: nome, cognome, indirizzo email;</li>
              <li>Dati di registrazione: email, password (crittografata), preferenze dell'utente;</li>
              <li>Dati relativi all'attività: nome del ristorante o dell'esercizio commerciale, tipologia di attività, indirizzo;</li>
              <li>Dati di pagamento: informazioni relative ai metodi di pagamento (carta di credito, ecc.), trattati tramite gateway sicuri di terze parti (Stripe);</li>
              <li>Contenuti caricati: immagini e fotografie dei menu, dati relativi ai piatti, prezzi e descrizioni.</li>
            </ul>
          </SubSection>
          <SubSection title="3.2 Dati raccolti automaticamente">
            <ul>
              <li>Dati di navigazione: indirizzo IP, tipo di browser, sistema operativo, pagine visitate, durata della sessione, URL di provenienza, timestamp;</li>
              <li>Cookie e tecnologie di tracciamento: il sito utilizza cookie tecnici, analitici e, previo consenso, cookie di profilazione (si veda la sezione 11).</li>
            </ul>
          </SubSection>
          <SubSection title="3.3 Dati relativi ai gestori di attività">
            <p>Qualora l'utente sia un gestore di ristorante, bar, spa o altra attività che utilizza la piattaforma Clicmenu.ai, il Titolare può raccogliere:</p>
            <ul>
              <li>Dati anagrafici e di contatto del gestore o del legale rappresentante;</li>
              <li>Dati relativi all'attività (denominazione, indirizzo, partita IVA);</li>
              <li>Dati relativi ai menu e ai servizi offerti;</li>
              <li>Dati economici e contabili (fatturazione, pagamenti, abbonamenti).</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="4. Finalità del Trattamento e Basi Giuridiche">
          <SubSection title="4.1 Esecuzione del contratto (art. 6, par. 1, lett. b) GDPR)">
            <ul>
              <li>Gestione dell'account: registrazione, accesso e gestione del profilo utente;</li>
              <li>Erogazione del servizio: fornitura della piattaforma per la creazione e pubblicazione di menu digitali, generazione di QR code, traduzione automatica;</li>
              <li>Assistenza clienti: risposta a richieste di informazioni, supporto tecnico, gestione di reclami;</li>
              <li>Fatturazione e pagamenti: gestione degli abbonamenti, emissione di fatture, adempimenti contabili.</li>
            </ul>
          </SubSection>
          <SubSection title="4.2 Obbligo di legge (art. 6, par. 1, lett. c) GDPR)">
            <ul>
              <li>Adempimenti fiscali e contabili: conservazione delle fatture e dei documenti contabili;</li>
              <li>Risposta a richieste delle Autorità competenti.</li>
            </ul>
          </SubSection>
          <SubSection title="4.3 Consenso dell'interessato (art. 6, par. 1, lett. a) GDPR)">
            <ul>
              <li>Marketing diretto: invio di comunicazioni promozionali, newsletter e offerte commerciali (previo consenso esplicito);</li>
              <li>Cookie di profilazione: utilizzo di cookie di terze parti per finalità di marketing e remarketing (previo consenso tramite banner cookie).</li>
            </ul>
          </SubSection>
          <SubSection title="4.4 Interesse legittimo del Titolare (art. 6, par. 1, lett. f) GDPR)">
            <ul>
              <li>Sicurezza informatica: prevenzione di frodi, attacchi informatici, accessi non autorizzati;</li>
              <li>Analisi statistiche: elaborazione di statistiche anonime sull'utilizzo della piattaforma;</li>
              <li>Miglioramento del servizio: ottimizzazione dell'esperienza utente, sviluppo di nuove funzionalità;</li>
              <li>Tutela dei diritti: difesa in giudizio, accertamento o esercizio di un diritto.</li>
            </ul>
          </SubSection>
        </Section>

        <Section title="5. Modalità del Trattamento">
          <p>I dati personali sono trattati con strumenti automatizzati (server, database, software gestionali, piattaforme cloud) nel rispetto dei principi di liceità, correttezza, trasparenza, minimizzazione, esattezza, limitazione della conservazione, integrità e riservatezza.</p>
          <p>Il Titolare adotta misure tecniche e organizzative adeguate, tra cui: crittografia dei dati sensibili, protocollo HTTPS (SSL/TLS), firewall e sistemi di protezione, backup periodici, controllo degli accessi.</p>
        </Section>

        <Section title="6. Periodo di Conservazione dei Dati">
          <SubSection title="6.1 Dati relativi all'abbonamento e ai servizi">
            <p>Per tutta la durata del rapporto contrattuale e, successivamente, per il tempo necessario agli adempimenti fiscali e contabili (10 anni dalla cessazione del rapporto, ai sensi dell'art. 2220 c.c. e del D.P.R. 600/1973).</p>
          </SubSection>
          <SubSection title="6.2 Dati di navigazione e cookie">
            <ul>
              <li>Cookie tecnici: per la durata della sessione o per il periodo necessario al funzionamento del sito;</li>
              <li>Cookie analitici: fino a 26 mesi dalla raccolta;</li>
              <li>Cookie di profilazione: fino a 12 mesi dalla raccolta, salvo revoca del consenso.</li>
            </ul>
          </SubSection>
          <SubSection title="6.3 Dati per marketing">
            <p>Fino alla revoca del consenso o all'esercizio del diritto di opposizione da parte dell'interessato.</p>
          </SubSection>
        </Section>

        <Section title="7. Destinatari dei Dati Personali">
          <p>I dati possono essere comunicati alle seguenti categorie di destinatari:</p>
          <ul>
            <li><strong>Fornitori di servizi IT:</strong> hosting, cloud computing, manutenzione tecnica (es. Supabase, Vercel);</li>
            <li><strong>Payment service provider:</strong> Stripe per la gestione dei pagamenti online;</li>
            <li><strong>Fornitori di email:</strong> Resend per l'invio di comunicazioni transazionali;</li>
            <li><strong>Fornitori di analytics:</strong> strumenti di analisi statistica del traffico (es. Meta Pixel);</li>
            <li><strong>CRM:</strong> GoHighLevel per la gestione delle relazioni con i clienti;</li>
            <li><strong>AI provider:</strong> Anthropic per l'elaborazione delle immagini dei menu tramite intelligenza artificiale;</li>
            <li><strong>Consulenti e professionisti:</strong> commercialisti, avvocati, consulenti fiscali;</li>
            <li><strong>Autorità pubbliche:</strong> in adempimento di obblighi di legge o su richiesta motivata.</li>
          </ul>
        </Section>

        <Section title="8. Trasferimento dei Dati verso Paesi Terzi">
          <p>I dati personali possono essere trasferiti e trattati in Paesi situati al di fuori dello Spazio Economico Europeo (SEE), inclusi gli Emirati Arabi Uniti (sede del Titolare) e gli Stati Uniti d'America (fornitori cloud e di servizi digitali).</p>
          <p>Il Titolare garantisce che i trasferimenti avvengano nel rispetto degli artt. 44 e ss. del GDPR, mediante Clausole Contrattuali Standard approvate dalla Commissione Europea e/o altre garanzie adeguate.</p>
        </Section>

        <Section title="9. Diritti degli Interessati">
          <p>Ai sensi degli artt. 15-22 del GDPR, gli interessati hanno il diritto di:</p>
          <ul>
            <li><strong>Accesso (art. 15):</strong> ottenere conferma del trattamento e accesso ai propri dati;</li>
            <li><strong>Rettifica (art. 16):</strong> correggere dati inesatti o incompleti;</li>
            <li><strong>Cancellazione / "diritto all'oblio" (art. 17):</strong> ottenere la cancellazione dei propri dati;</li>
            <li><strong>Limitazione (art. 18):</strong> ottenere la limitazione del trattamento;</li>
            <li><strong>Portabilità (art. 20):</strong> ricevere i propri dati in formato strutturato;</li>
            <li><strong>Opposizione (art. 21):</strong> opporsi al trattamento basato sull'interesse legittimo;</li>
            <li><strong>Revoca del consenso (art. 7):</strong> revocare in qualsiasi momento il consenso prestato;</li>
            <li><strong>Reclamo (art. 77):</strong> proporre reclamo al Garante Privacy.</li>
          </ul>
          <InfoBox>
            Per esercitare i propri diritti: <a href="mailto:info@clicmenu.ai" className="text-emerald-600 hover:underline font-medium">info@clicmenu.ai</a> — oggetto: <em>Esercizio diritti GDPR</em><br />
            Il Titolare risponderà entro 30 giorni.
          </InfoBox>
        </Section>

        <Section title="10. Cookie e Tecnologie di Tracciamento">
          <p>Il sito utilizza le seguenti tipologie di cookie:</p>
          <ul>
            <li><strong>Cookie tecnici (necessari):</strong> indispensabili per il funzionamento del sito (autenticazione, sicurezza). Non richiedono consenso.</li>
            <li><strong>Cookie analitici:</strong> raccolgono informazioni statistiche aggregate sull'utilizzo del sito. Richiedono consenso.</li>
            <li><strong>Cookie di profilazione e marketing:</strong> Meta Pixel per remarketing e monitoraggio delle conversioni. Richiedono consenso.</li>
          </ul>
          <p>L'utente può gestire le proprie preferenze tramite il banner cookie al primo accesso o tramite le impostazioni del browser.</p>
        </Section>

        <Section title="11. Sicurezza dei Dati">
          <p>Il Titolare adotta misure tecniche e organizzative adeguate ai sensi dell'art. 32 GDPR, tra cui: crittografia end-to-end, protocollo HTTPS/SSL, firewall, backup periodici, autenticazione sicura e controllo degli accessi. Le password sono archiviate in formato crittografato e non sono mai accessibili in chiaro.</p>
        </Section>

        <Section title="12. Modifiche alla Privacy Policy">
          <p>Il Titolare si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento. Le modifiche saranno pubblicate su questa pagina con aggiornamento della data. Si invitano gli utenti a consultare periodicamente questa pagina.</p>
        </Section>

        <Section title="13. Reclami all'Autorità Garante">
          <InfoBox>
            <strong>Garante per la protezione dei dati personali</strong><br />
            Piazza Venezia, 11 – 00187 Roma<br />
            Tel: +39 06 696771 · Email: <a href="mailto:garante@gpdp.it" className="text-emerald-600 hover:underline">garante@gpdp.it</a><br />
            Sito: <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">www.garanteprivacy.it</a>
          </InfoBox>
        </Section>

        <Section title="14. Contatti">
          <InfoBox>
            <strong>Novarise Consulting FZCO</strong><br />
            Dubai Silicon Oasis, Ifza Park, DDP, Building A1, Dubai – Emirati Arabi Uniti<br />
            Licenza n.: 61290<br />
            Email: <a href="mailto:info@clicmenu.ai" className="text-emerald-600 hover:underline">info@clicmenu.ai</a>
          </InfoBox>
          <p className="text-sm text-slate-400 mt-4">Data di entrata in vigore: 7 aprile 2026 · Versione: 1.0</p>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed">
      {children}
    </div>
  );
}
