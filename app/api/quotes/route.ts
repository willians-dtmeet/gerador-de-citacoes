import { NextResponse } from "next/server";

const QUOTE_API_URL = "https://api.quotable.io/random";
// API alternativa caso a principal falhe
const FALLBACK_API_URL = "https://zenquotes.io/api/random";

// Citações de fallback caso ambas APIs falhem
const FALLBACK_QUOTES = [
  { content: "A persistência é o caminho do êxito.", author: "Charles Chaplin" },
  { content: "A única forma de fazer um grande trabalho é amar o que você faz.", author: "Steve Jobs" },
  { content: "O sucesso é a soma de pequenos esforços repetidos dia após dia.", author: "Robert Collier" },
  { content: "Não espere por oportunidades extraordinárias. Seize oportunidades comuns e torne-as grandes.", author: "Orison Swett Marden" },
  { content: "O futuro pertence àqueles que acreditam na beleza de seus sonhos.", author: "Eleanor Roosevelt" },
];

async function fetchWithTimeout(url: string, timeout: number = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET() {
  // Tenta a API principal primeiro
  try {
    console.log("Tentando buscar citação da API principal:", QUOTE_API_URL);
    
    const response = await fetchWithTimeout(QUOTE_API_URL, 8000);

    if (response.ok) {
      const data = await response.json();
      console.log("Dados recebidos da API principal:", data);

      if (data && data.content) {
        return NextResponse.json({
          content: data.content,
          author: data.author || "Autor desconhecido",
        });
      }
    }
  } catch (error) {
    console.error("Erro ao buscar da API principal:", error);
    // Continua para tentar a API alternativa
  }

  // Tenta a API alternativa
  try {
    console.log("Tentando API alternativa:", FALLBACK_API_URL);
    
    const response = await fetchWithTimeout(FALLBACK_API_URL, 8000);

    if (response.ok) {
      const data = await response.json();
      console.log("Dados recebidos da API alternativa:", data);

      // A API zenquotes retorna um array
      if (data && Array.isArray(data) && data.length > 0) {
        const quote = data[0];
        return NextResponse.json({
          content: quote.q || quote.text || "",
          author: quote.a || quote.author || "Autor desconhecido",
        });
      }
    }
  } catch (error) {
    console.error("Erro ao buscar da API alternativa:", error);
    // Continua para usar citações de fallback
  }

  // Se ambas APIs falharem, usa citações de fallback
  console.log("Usando citações de fallback locais");
  const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  
  return NextResponse.json({
    content: randomQuote.content,
    author: randomQuote.author,
  });
}


