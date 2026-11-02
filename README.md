# Ghana Guide — Journey Prototype

A calm, trusted guidance platform for navigating Ghanaian government agencies and corporate setup.

> **Product Thesis**: Forms and links are not the product—anyone can find a link. The product is knowing what to do, in what order, at which office, and what goes wrong: a journey. When stuck, founders tap **"Talk to us"** to reach human consultants at Babanawo Consults.

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
Runs the Vitest suite validating journey JSON schema, URL protocols (absolute HTTP/HTTPS only), and lead submission rules.

### Production Build
```bash
npm run build
npm start
```

---

## 2. Environment Variables

Configure these in `.env` (or through the AI Studio Secrets panel):

| Variable | Description | Default / Example |
|---|---|---|
| `ADMIN_TOKEN` | Secret token required to access `/admin` and write journey updates | `ghana-guide-admin-secret` |
| `WHATSAPP_NUMBER` | WhatsApp international phone number for Babanawo Consults (without `+`). If unset, the WhatsApp button is hidden cleanly. | `233240000000` |
| `GEMINI_API_KEY` | Google Gemini API key used for the journey-grounded assistant. | Injected by AI Studio |
| `PORT` | Web server port | `3000` |

---

## 3. How to Add a New Journey

Journeys are completely **data-driven**. To add a new journey (e.g. `register-a-trademark` or `import-commercial-goods`):

1. Create a new file in `server/data/journeys/<your-journey-id>.json`.
2. Follow the journey schema:
```json
{
  "id": "register-a-trademark",
  "title": "Register a Trademark in Ghana",
  "description": "Step-by-step roadmap for filing trademarks with the Registrar-General / ORC.",
  "status": "DRAFT_NOT_REVIEWED",
  "last_reviewed": null,
  "steps": [
    {
      "id": "step-1-search",
      "step_number": 1,
      "title": "Search trademark registry",
      "why": "Ensures prior registration does not conflict.",
      "do_this_when": "Before filing the trademark application.",
      "optional": false,
      "choose": "one",
      "options": [
        {
          "id": "opt-orc-tm-search",
          "agency": "ORC",
          "label": "ORC Trademark Search Portal",
          "url": "https://orc.gov.gh/forms.php",
          "seed_link_status": "deep",
          "verified_at": null
        }
      ],
      "documents_needed": null,
      "typical_cost": null,
      "typical_time": null,
      "common_mistakes": null,
      "expert_reviewed": false
    }
  ]
}
```
3. Restart or reload the app. The landing page and `/journey/<your-journey-id>` will automatically load and render the new journey without any code modifications.

---

## 4. How the Expert Fills in Content

Trust is the product. Costs, timelines, documents, and common mistakes begin as `null` and display honest placeholders: *"Details for this step are being verified by our team."*

The expert can fill these in without touching any code:

1. Visit `/admin` in your browser.
2. Enter the secret token matching `ADMIN_TOKEN`.
3. Open the **Journey Content Editor** tab.
4. For each step, enter:
   - **Typical Cost** (e.g., `GH₵ 60 filing fee`)
   - **Typical Timeline** (e.g., `2 to 4 working days`)
   - **Documents Needed** (one per line)
   - **Common Mistakes to Avoid** (one per line)
   - Check **"Mark as Expert-Reviewed"**.
5. Click **"Save & Publish Changes"**.
6. When all steps are verified, the journey status changes to `REVIEWED` and `last_reviewed` is updated to today's date. The draft warning banner disappears automatically.

---

## 5. Consultant Leads & Unanswered Questions

- **Leads**: Stored in `server/data/leads.json` and visible in `/admin`.
- **Unanswered AI Queries**: When users ask questions that the grounded AI assistant cannot answer from verified data, the query is recorded in `server/data/unanswered.json` and listed in the admin console. This guides the expert on what content is missing.
