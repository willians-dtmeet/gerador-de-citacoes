/* No topo, esta linha é OBRIGATÓRIA para usar botões e estado */
"use client";

/* Importamos 'useState' para guardar os dados da citação */
import { useState } from "react";

// Definimos um tipo para nossos dados de citação
interface QuoteData {
  content: string;
  author: string;
}

export default function HomePage() {
  /*
    Criamos "estados" para guardar a citação (quoteData) e
    saber se está carregando (isLoading).
  */
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Esta é a função que chama a API
  const fetchNewQuote = async () => {
    setIsLoading(true); // Avisa que estamos carregando
    setError(null); // Limpa erros anteriores
    
    try {
      // 1. CHAMA O ENDPOINT (A URL da API)
      const response = await fetch("/api/quotes", {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });
      
      // Verifica se a resposta existe (pode falhar na rede)
      if (!response) {
        throw new Error("Não foi possível conectar ao servidor. Verifique se o servidor está rodando.");
      }
      
      // Verifica se a resposta está ok antes de processar
      if (!response.ok) {
        // Tenta ler a mensagem de erro do servidor
        let errorMsg = `Erro ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.details || errorData.error || errorMsg;
        } catch (e) {
          // Se não conseguir ler o JSON, usa a mensagem padrão
          console.error("Não foi possível ler a resposta de erro:", e);
        }
        throw new Error(errorMsg);
      }
      
      // 2. PEGA A RESPOSTA (o JSON) - só executa se response.ok
      const data = await response.json();
      
      // Valida se os dados estão corretos
      if (!data || !data.content || !data.author) {
        throw new Error("Dados inválidos recebidos da API");
      }
      
      // 3. GUARDA A RESPOSTA no nosso estado
      setQuoteData({
        content: data.content,
        author: data.author,
      });
      setError(null); // Limpa qualquer erro anterior

    } catch (error) {
      console.error("Erro ao buscar citação:", error);
      
      // Mensagem de erro mais específica
      let errorMessage = "Não foi possível buscar a citação.";
      
      if (error instanceof TypeError) {
        if (error.message.includes("fetch")) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else {
          errorMessage = `Erro de rede: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setQuoteData(null); // Limpa em caso de erro
    } finally {
      setIsLoading(false); // Avisa que terminamos de carregar (sempre executa)
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <div className="max-w-2xl w-full text-center">
        
        <h1 className="text-5xl font-bold text-cyan-400 mb-8">
          Gerador de Citações
        </h1>

        {/* --- O Botão de Requisição --- */}
        <button
          onClick={fetchNewQuote}
          disabled={isLoading} // Desabilita o botão enquanto carrega
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all disabled:bg-gray-500"
        >
          {isLoading ? "Buscando..." : "Buscar Nova Citação"}
        </button>

        {/* --- A Área da Resposta --- */}
        <div className="mt-12 min-h-[150px]">
          {/* Mostra erro se houver */}
          {error && (
            <div className="bg-red-900 border-l-4 border-red-500 p-4 rounded-lg mb-4">
              <p className="text-red-200 font-semibold">Erro:</p>
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          {/* Mostramos a citação AQUI assim que 'quoteData' tiver algo */}
          {quoteData && (
            <blockquote className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-cyan-500">
              <p className="text-2xl italic text-gray-200">
                "{quoteData.content}"
              </p>
              <footer className="text-right mt-4 text-gray-400">
                - {quoteData.author}
              </footer>
            </blockquote>
          )}
        </div>

      </div>
    </main>
  );
}
