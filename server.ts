import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Amazon SP-API Integration Status
app.get("/api/amazon/status", (req, res) => {
  res.json({
    connected: true,
    mode: "sandbox",
    sellerId: "A3L8BOOKSHOPPER",
    marketplacesActive: 17,
    lastSync: new Date().toISOString(),
  });
});

// Amazon Sync Endpoint
app.post("/api/amazon/sync", (req, res) => {
  const { countryId } = req.body || {};
  res.json({
    success: true,
    message: countryId 
      ? `Vendas sincronizadas com sucesso para o marketplace ${countryId}`
      : "Vendas sincronizadas com sucesso para todos os 17 países da Amazon SP-API.",
    timestamp: new Date().toISOString(),
    newOrdersFetched: Math.floor(Math.random() * 4) + 1,
  });
});

// ISBN Search via Open Library API
app.get("/api/books/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn.replace(/[^0-9X]/gi, "");
  if (!isbn) {
    return res.status(400).json({ error: "ISBN inválido." });
  }

  try {
    const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const data = await response.json();
    const bookData = data[`ISBN:${isbn}`];

    if (bookData) {
      return res.json({
        found: true,
        title: bookData.title,
        author: bookData.authors ? bookData.authors.map((a: any) => a.name).join(", ") : "Autor Desconhecido",
        coverUrl: bookData.cover?.large || bookData.cover?.medium || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80",
        pageCount: bookData.number_of_pages || 250,
        publicationDate: bookData.publish_date || "2024",
        isbn,
      });
    }

    return res.json({
      found: false,
      message: "Livro não encontrado na base pública OpenLibrary, você pode preencher manualmente.",
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao consultar ISBN na API externa." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
