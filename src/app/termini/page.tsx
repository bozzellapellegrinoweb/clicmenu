import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini e Condizioni — Clicmenu.ai",
  description: "Termini e Condizioni di utilizzo della piattaforma Clicmenu.ai",
};

export default function TerminiPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link href="/" className="text-emerald-600 text-sm font-medium hover:text-emerald-700 mb-4 inline-block">
            ← Torna alla home
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Termini e Condizioni</h1>
          <p className="text-slate-400 mt-2 text-sm">Sito web: https://www.clicmenu.ai · Ultima modifica: 7 aprile 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        <Section title="1. Definizioni">
          <p>Ai fini dei presenti Termini e Condizioni, si intende per:</p>
          <ul>
            <li><strong>&ldquo;Piattaforma&rdquo;:</strong> il sito web e i servizi accessibili all&apos;indirizzo https://www.clicmenu.ai;</li>
            <li><strong>&ldquo;Gestore&rdquo; o &ldquo;Utente&rdquo;:</strong> la persona fisica o giuridica che si registra alla Piattaforma e ne utilizza i servizi;</li>
            <li><strong>&ldquo;Titolare&rdquo; o &ldquo;Società&rdquo;:</strong> Novarise Consulting FZCO, con sede in Dubai Silicon Oasis, Ifza Park, DDP, Building A1, Dubai – Emirati Arabi Uniti, Licenza n. 61290;</li>
            <li><strong>&ldquo;Servizio&rdquo;:</strong> la piattaforma SaaS che consente la creazione, gestione e pubblicazione di menu digitali tramite fotografia e intelligenza artificiale, con generazione di QR code;</li>
            <li><strong>&ldquo;Menu Digitale&rdquo;:</strong> il menu creato dall&apos;Utente tramite la Piattaforma e reso accessibile ai clienti finali tramite QR code o URL pubblico;</li>
            <li><strong>&ldquo;Cliente Finale&rdquo;:</strong> il consumatore che accede al Menu Digitale tramite QR code o link pubblico;</li>
            <li><strong>&ldquo;Abbonamento&rdquo;:</strong> il piano a pagamento che consente l&apos;accesso alle funzionalità della Piattaforma.</li>
          </ul>
        </Section>

        <Section title="2. Accettazione dei Termini">
          <p>L&apos;accesso e l&apos;utilizzo della Piattaforma Clicmenu.ai sono subordinati all&apos;accettazione integrale dei presenti Termini e Condizioni. Registrandosi alla Piattaforma o utilizzando i Servizi, l&apos;Utente dichiara di aver letto, compreso e accettato integralmente i presenti Termini.</p>
          <p>Se l&apos;Utente agisce per conto di un&apos;azienda, dichiara di avere l&apos;autorità per vincolare tale entità ai presenti Termini.</p>
          <p>Il Titolare si riserva il diritto di modificare i presenti Termini in qualsiasi momento. Le modifiche saranno comunicate tramite email e/o avviso sulla Piattaforma. L&apos;utilizzo continuato del Servizio dopo la notifica costituisce accettazione delle modifiche.</p>
        </Section>

        <Section title="3. Descrizione del Servizio">
          <p>Clicmenu.ai è una piattaforma SaaS che consente a ristoranti, bar, spa, hotel e attività simili di:</p>
          <ul>
            <li>Creare menu digitali in modo semplice e rapido, anche tramite fotografia di menu cartacei con estrazione automatica tramite intelligenza artificiale;</li>
            <li>Modificare e personalizzare le voci del menu (categorie, piatti, prezzi, descrizioni, fotografie);</li>
            <li>Pubblicare il menu online e generare QR code per permettere ai clienti finali di visualizzarlo;</li>
            <li>Gestire più menu per la stessa attività (es. menu pranzo, menu cena, carta dei vini);</li>
            <li>Accedere a funzionalità aggiuntive incluse nell&apos;Abbonamento attivo.</li>
          </ul>
          <InfoBox>
            Il Servizio è destinato esclusivamente ad uso professionale e commerciale. Non è destinato a consumatori privati che agiscono al di fuori di un&apos;attività commerciale.
          </InfoBox>
        </Section>

        <Section title="4. Registrazione e Account">
          <SubSection title="4.1 Creazione dell'account">
            <p>Per accedere al Servizio, l&apos;Utente deve creare un account fornendo un indirizzo email valido e una password. L&apos;Utente è responsabile della veridicità delle informazioni fornite e dell&apos;aggiornamento degli stessi in caso di variazioni.</p>
          </SubSection>
          <SubSection title="4.2 Sicurezza delle credenziali">
            <p>L&apos;Utente è responsabile della riservatezza delle proprie credenziali di accesso e di tutte le attività svolte tramite il proprio account. Il Titolare non è responsabile per eventuali danni derivanti dall&apos;uso non autorizzato dell&apos;account da parte di terzi. L&apos;Utente si impegna a notificare immediatamente al Titolare qualsiasi accesso non autorizzato.</p>
          </SubSection>
          <SubSection title="4.3 Account singolo">
            <p>Ogni account è personale e non può essere condiviso con terzi o ceduto senza previo consenso scritto del Titolare.</p>
          </SubSection>
        </Section>

        <Section title="5. Abbonamento e Pagamenti">
          <SubSection title="5.1 Piani disponibili">
            <p>L&apos;accesso alle funzionalità complete della Piattaforma richiede un Abbonamento a pagamento. I piani e i prezzi sono indicati nella pagina dedicata del sito. Il Titolare si riserva il diritto di modificare i prezzi con un preavviso di almeno 30 giorni.</p>
          </SubSection>
          <SubSection title="5.2 Periodo di prova">
            <p>Alla registrazione, l&apos;Utente può beneficiare di un periodo di prova gratuito della durata indicata al momento della registrazione. Al termine del periodo di prova, per continuare ad utilizzare il Servizio è necessario attivare un Abbonamento.</p>
          </SubSection>
          <SubSection title="5.3 Fatturazione e rinnovo">
            <p>L&apos;Abbonamento si rinnova automaticamente alla scadenza del periodo scelto (annuale). Il pagamento viene addebitato in anticipo tramite il metodo di pagamento registrato. L&apos;Utente può disdire l&apos;Abbonamento in qualsiasi momento dall&apos;area riservata; la disdetta avrà effetto alla scadenza del periodo già pagato.</p>
          </SubSection>
          <SubSection title="5.4 Metodi di pagamento">
            <p>I pagamenti sono gestiti tramite Stripe, un provider di pagamenti sicuro e certificato PCI DSS. Il Titolare non memorizza i dati delle carte di credito degli Utenti.</p>
          </SubSection>
          <SubSection title="5.5 Rimborsi">
            <p>L&apos;Abbonamento non è rimborsabile, salvo diversa previsione di legge. In caso di difetti del Servizio imputabili al Titolare, sarà valutata caso per caso l&apos;erogazione di un credito o rimborso proporzionale.</p>
          </SubSection>
        </Section>

        <Section title="6. Proprietà Intellettuale">
          <SubSection title="6.1 Piattaforma e contenuti del Titolare">
            <p>La Piattaforma, il codice sorgente, il design, i marchi, i loghi, i testi e tutti gli altri elementi di Clicmenu.ai sono di proprietà esclusiva del Titolare o dei suoi licenziatari e sono protetti dalla normativa applicabile in materia di proprietà intellettuale. È vietata qualsiasi riproduzione, distribuzione o utilizzo non autorizzato.</p>
          </SubSection>
          <SubSection title="6.2 Contenuti dell'Utente">
            <p>L&apos;Utente mantiene la piena titolarità sui contenuti caricati sulla Piattaforma (immagini, testi, menu, fotografie dei piatti). Caricando contenuti, l&apos;Utente concede al Titolare una licenza non esclusiva, gratuita, per il tempo necessario all&apos;erogazione del Servizio, per utilizzare, memorizzare, riprodurre e visualizzare tali contenuti esclusivamente ai fini della fornitura del Servizio.</p>
          </SubSection>
          <SubSection title="6.3 Dichiarazioni dell'Utente sui contenuti">
            <p>L&apos;Utente dichiara e garantisce che i contenuti caricati: (a) sono di sua proprietà o che ha il diritto di utilizzarli; (b) non violano diritti di terzi; (c) non contengono materiale illecito, diffamatorio, osceno o altrimenti vietato dalla legge.</p>
          </SubSection>
        </Section>

        <Section title="7. Obblighi e Responsabilità dell'Utente">
          <p>L&apos;Utente si impegna a:</p>
          <ul>
            <li>Utilizzare il Servizio in conformità con i presenti Termini e con la normativa applicabile;</li>
            <li>Non utilizzare il Servizio per finalità illecite, fraudolente o lesive di diritti di terzi;</li>
            <li>Non tentare di accedere in modo non autorizzato ai sistemi della Piattaforma;</li>
            <li>Non caricare contenuti che violino diritti di terzi o normative vigenti;</li>
            <li>Non utilizzare strumenti automatizzati (bot, scraper) per accedere alla Piattaforma senza autorizzazione;</li>
            <li>Garantire l&apos;accuratezza delle informazioni inserite nel menu (prezzi, allergeni, disponibilità);</li>
            <li>Rispettare la normativa vigente in materia di indicazione degli allergeni e sicurezza alimentare.</li>
          </ul>
          <InfoBox>
            L&apos;Utente è l&apos;unico responsabile dell&apos;accuratezza e dell&apos;aggiornamento delle informazioni presenti nel proprio Menu Digitale, inclusi prezzi, ingredienti e allergeni. Il Titolare non si assume alcuna responsabilità per informazioni errate o non aggiornate.
          </InfoBox>
        </Section>

        <Section title="8. Limitazione di Responsabilità">
          <SubSection title="8.1 Disponibilità del servizio">
            <p>Il Titolare si impegna a garantire la continuità del Servizio, ma non può garantire un uptime del 100%. In caso di interruzioni per manutenzione programmata, il Titolare provvederà ad avvisare gli Utenti con ragionevole anticipo. Non è previsto rimborso per interruzioni non imputabili al Titolare o di durata inferiore a 24 ore consecutive.</p>
          </SubSection>
          <SubSection title="8.2 Esclusione di garanzie">
            <p>Il Servizio è fornito &ldquo;così com&apos;è&rdquo; (as-is) e &ldquo;come disponibile&rdquo; (as-available). Il Titolare non fornisce garanzie, espresse o implicite, circa l&apos;idoneità del Servizio per scopi specifici, l&apos;assenza di errori o l&apos;ininterrotta disponibilità.</p>
          </SubSection>
          <SubSection title="8.3 Limite di responsabilità">
            <p>Nei limiti consentiti dalla legge applicabile, il Titolare non è responsabile per danni indiretti, incidentali, consequenziali, perdita di profitti o perdita di dati derivanti dall&apos;uso o dall&apos;impossibilità di usare il Servizio. La responsabilità complessiva del Titolare nei confronti dell&apos;Utente non potrà in ogni caso superare l&apos;importo pagato dall&apos;Utente negli ultimi 12 mesi.</p>
          </SubSection>
          <SubSection title="8.4 Intelligenza artificiale">
            <p>Le funzionalità di estrazione automatica dei menu tramite AI sono fornite a titolo indicativo. Il Titolare non garantisce la correttezza o completezza dei dati estratti automaticamente. L&apos;Utente è responsabile della verifica e correzione dei dati prima della pubblicazione.</p>
          </SubSection>
        </Section>

        <Section title="9. Sospensione e Risoluzione">
          <SubSection title="9.1 Sospensione da parte del Titolare">
            <p>Il Titolare si riserva il diritto di sospendere o chiudere l&apos;account dell&apos;Utente in caso di: (a) violazione dei presenti Termini; (b) mancato pagamento dell&apos;Abbonamento; (c) utilizzo fraudolento o abusivo del Servizio; (d) richiesta delle Autorità competenti.</p>
          </SubSection>
          <SubSection title="9.2 Recesso dell'Utente">
            <p>L&apos;Utente può recedere in qualsiasi momento chiudendo il proprio account dall&apos;area impostazioni o inviando richiesta a info@clicmenu.ai. Il recesso non dà diritto a rimborsi per il periodo già pagato.</p>
          </SubSection>
          <SubSection title="9.3 Effetti della risoluzione">
            <p>In caso di risoluzione del contratto, il Titolare potrà eliminare i dati dell&apos;Utente dopo un periodo di 30 giorni dalla cessazione. L&apos;Utente è invitato a esportare i propri dati prima della chiusura dell&apos;account.</p>
          </SubSection>
        </Section>

        <Section title="10. Privacy e Protezione dei Dati">
          <p>Il trattamento dei dati personali degli Utenti è disciplinato dalla <Link href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</Link> di Clicmenu.ai, che costituisce parte integrante dei presenti Termini. Utilizzando il Servizio, l&apos;Utente accetta il trattamento dei propri dati personali come descritto nella Privacy Policy.</p>
        </Section>

        <Section title="11. Dati dei Clienti Finali">
          <p>Nella misura in cui l&apos;Utente raccoglie o tratta dati personali dei propri clienti finali tramite la Piattaforma, l&apos;Utente agisce come titolare autonomo del trattamento ed è l&apos;unico responsabile del rispetto della normativa applicabile (GDPR e normative locali). Il Titolare agisce come responsabile del trattamento per conto dell&apos;Utente limitatamente ai dati tecnici necessari all&apos;erogazione del Servizio.</p>
        </Section>

        <Section title="12. Legge Applicabile e Foro Competente">
          <p>I presenti Termini sono regolati dalla legge degli Emirati Arabi Uniti. Per le controversie che coinvolgono Utenti con sede nell&apos;Unione Europea, si applica anche la normativa europea a tutela dei consumatori professionali ove applicabile.</p>
          <p>Per qualsiasi controversia relativa ai presenti Termini, le parti si impegnano a tentare una risoluzione amichevole. In caso di insuccesso, la competenza è attribuita al tribunale competente in base alla sede del Titolare, salvo diverse previsioni di legge inderogabili applicabili all&apos;Utente.</p>
        </Section>

        <Section title="13. Disposizioni Varie">
          <SubSection title="13.1 Intero accordo">
            <p>I presenti Termini, unitamente alla Privacy Policy e a qualsiasi altro documento richiamato, costituiscono l&apos;intero accordo tra le parti in relazione al Servizio e sostituiscono qualsiasi accordo precedente.</p>
          </SubSection>
          <SubSection title="13.2 Nullità parziale">
            <p>Se una disposizione dei presenti Termini risulta invalida o inapplicabile, le restanti disposizioni rimangono pienamente in vigore.</p>
          </SubSection>
          <SubSection title="13.3 Cessione">
            <p>L&apos;Utente non può cedere i propri diritti o obblighi derivanti dai presenti Termini senza il previo consenso scritto del Titolare. Il Titolare può cedere i propri diritti in caso di fusione, acquisizione o vendita degli asset aziendali.</p>
          </SubSection>
          <SubSection title="13.4 Comunicazioni">
            <p>Le comunicazioni ufficiali tra le parti avverranno tramite email. Le comunicazioni al Titolare devono essere inviate a info@clicmenu.ai. Le comunicazioni all&apos;Utente saranno inviate all&apos;indirizzo email registrato sull&apos;account.</p>
          </SubSection>
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
