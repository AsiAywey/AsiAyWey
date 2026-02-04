```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🚀 MATCHFLOW - RECRUITMENT PLATFORM 🚀         ║
║                                                           ║
║              A Basic Web App Implementation              ║
║                 (Multi-Page, No SPA)                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

# MatchFlow - AsíAyWey Recruitment Platform

A simple, beginner-friendly recruitment matching platform where **candidates** and **companies** can connect.

## 🎯 What This Does

✅ **Candidates** can:
- Create/edit profile
- Activate "Open to Work" status
- Browse job offers
- Be matched with companies

✅ **Companies** can:
- Post job offers
- Search for available candidates
- Create matches with candidates
- Manage the hiring workflow
- Block other companies from recruiting the same candidate

## ⚡ Quick Start (3 steps)

### 1️⃣ Install json-server
```bash
npm install -g json-server
```

### 2️⃣ Start the server
```bash
json-server --watch general/db.json --port 3001
```

### 3️⃣ Open login.html
Open the file in your browser (with Live Server or drag-and-drop)

**That's it! 🎉**

---

## 📚 Documentation

Read these in order:

1. **[QUICK_START.md](QUICK_START.md)** ← **START HERE** (5 min read)
2. **[SUMMARY.md](SUMMARY.md)** - Full implementation details
3. **[README.md](README.md)** - Complete feature guide + troubleshooting
4. **[API_REFERENCE.md](API_REFERENCE.md)** - All API endpoints

---

## 🧪 Test the App (5 minutes)

### Login as CANDIDATE
- Role: **Candidate**
- User: **Santiago Zapata**
- Go to "My Profile" → Click "Activate Open to Work"

### Login as COMPANY
- Role: **Company**
- User: **Tech Corp**
- Go to "Company Profile"
- Find Santiago in "Search Candidates" tab
- Click "Select & Match" to create a match

### See the Magic
- Status changes from `pending` → `contacted` → `hired`
- Contact info appears only when status is `contacted`
- Try matching as a 2nd company → blocked! ✓

---

## 🗂️ Project Structure

```
login.html              ┐
login.js                │
dashboard.html          │ Multi-page app
dashboard.js            │ (traditional navigation)
candidate.html          │
candidate.js            ┘

jobs.html               ┐ Features
jobs.js                 │
companies/index.html    │
companies/company.js    ┘

general/
  ├─ db.json           (database)
  ├─ api.js            (fetch helpers)
  └─ cache.js          (localStorage caching)

style-*.css            (original styling)
```

---

## ✨ Key Features Implemented

- ✅ Role-based login (candidate/company)
- ✅ Dynamic navigation based on role
- ✅ Open to Work toggle
- ✅ Candidate search (only OTW=true)
- ✅ Create matches (company + job + candidate)
- ✅ Match state transitions
- ✅ Contact privacy (hidden until "contacted")
- ✅ Reservation blocking (prevents double-booking)
- ✅ Auto-cache with TTL
- ✅ Error handling with UI messages

---

## 🏗️ Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling (original + added message styles)
- **JavaScript (ES6)** - Logic
- **Fetch API** - HTTP requests
- **localStorage** - Browser storage
- **json-server** - Mock backend

**Zero external dependencies!** No frameworks, no build tools.

---

## 🚨 Troubleshooting

### "Cannot fetch from localhost:3001"
→ Make sure json-server is running: `json-server --watch general/db.json --port 3001`

### "SyntaxError: Unexpected token <"
→ Don't use `file://`, use Live Server or `http://`

### "No candidates appear in search"
→ Candidate must have `openToWork: true` (activate in profile first)

### "Other company can match my candidate"
→ Reservation blocking is working - other company can't see it

See **[README.md](README.md)** for more troubleshooting.

---

## 📖 Code Quality

- ✅ Beginner-friendly code
- ✅ Small functions with clear names
- ✅ Comments where needed
- ✅ Error handling + user feedback
- ✅ No complex patterns

---

## 🎓 What You'll Learn

1. How to build a multi-page web app (alternative to SPAs)
2. How to use Fetch API for data
3. How to implement caching with TTL
4. How to manage state with localStorage
5. How to handle complex workflows (matches, reservations)

---

## 📋 Business Logic Implemented

### Open to Work (OTW)
- Candidates can activate/deactivate
- Only OTW=true candidates appear in company search

### Matches
- Company creates matches with: candidate + job offer
- States: pending → contacted → hired/discarded
- Contact info hidden until "contacted"

### Reservations (Blocking)
- Auto-created when match is created
- Prevents other companies from reserving same candidate
- Releases on discard or manual release

---

## 🚀 Next Steps

1. Open **[QUICK_START.md](QUICK_START.md)** 
2. Install json-server
3. Start the server
4. Open login.html
5. Test the complete workflow

---

## 📄 Files at a Glance

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [SUMMARY.md](SUMMARY.md) | Full implementation overview |
| [README.md](README.md) | Complete documentation |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoints |
| [TEST.html](TEST.html) | Verify backend connection |
| general/db.json | Database (edit while server is off) |
| START_SERVER.bat/.ps1 | Auto-setup scripts |

---

## ✅ All Requirements Met

- ✅ No SPA (traditional multi-page)
- ✅ No router (normal href navigation)
- ✅ Respected existing structure
- ✅ Minimal HTML changes
- ✅ All CSS original (only added message styles)
- ✅ Complete business logic
- ✅ Simple, beginner code
- ✅ Fetch + localStorage caching
- ✅ Conflict handling
- ✅ Contact privacy enforced

---

## 🎉 Ready to Go!

Everything is set up and ready to test. Start with [QUICK_START.md](QUICK_START.md) now!

```
npm install -g json-server
json-server --watch general/db.json --port 3001
# Then open login.html in browser
```

Enjoy! 🚀

---

**Built with ❤️ by GitHub Copilot**  
*A simple, educational recruitment platform*
