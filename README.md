
# Ghana Forms

A practical guidance platform for navigating Ghanaian government services, agency requirements and business setup.

## Product Thesis

Forms and links are not the product—anyone can find a link. The product is knowing what to do, in what order, at which office, and what can go wrong: a journey.

When users need assistance, they can reach human consultants at Babanawo Consults through the "Talk to us" feature.

---

## 1. How to Run

### Development

```bash
npm install
npm run dev
```

The application runs an Express server mounting Vite at `http://localhost:3000`.

### Testing

```bash
npm test
```

Runs the Vitest suite validating journey JSON schema, URL protocols and lead submission rules.

### Production Build

```bash
npm run build
npm start
```

---

## 2. Environment Variables

Configure these in `.env` or through the AI Studio Secrets panel.

| Variable | Description |
|---|---|
| `ADMIN_TOKEN` | Secret token required to access `/admin` and write journey updates. |
| `WHATSAPP_NUMBER` | WhatsApp international phone number without `+`. |
| `GEMINI_API_KEY` | Google Gemini API key. |
| `APP_URL` | Application hosting URL. |

Never commit real credentials or secrets to GitHub.

---

## 3. How to Add a New Journey

Journeys are data-driven.

1. Create a new JSON file in `server/data/journeys/`.
2. Follow the existing journey schema.
3. Add the relevant steps, options, agencies and supporting information.
4. Restart or reload the application.

The landing page and journey routes load the available journey data.

---

## 4. Expert Content Management

Costs, timelines, documents and common mistakes can initially remain unverified.

Experts can use the `/admin` interface to:

1. Access the administrative dashboard.
2. Enter the admin token.
3. Open the Journey Content Editor.
4. Complete the relevant information.
5. Mark verified steps as expert-reviewed.
6. Save and publish changes.

---

## 5. Consultant Leads and Unanswered Questions

- **Leads:** Stored in `server/data/leads.json`.
- **Unanswered AI queries:** Stored in `server/data/unanswered.json`.

These records help the team identify user enquiries and areas where additional verified information is needed.
