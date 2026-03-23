import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [debugLog, setDebugLog] = useState(["Iniciando diagnóstico..."]);
  const [isSdkReady, setIsSdkReady] = useState(false);

  const addLog = (msg) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    addLog("Tentando carregar script do Asaas...");
    
    const script = document.createElement('script');
    script.src = "https://static.asaas.com/js/sdk/asaas-v3.js";
    script.async = true;

    script.onload = () => {
      if (window.Asaas) {
        addLog("✅ SUCESSO: window.Asaas encontrado!");
        setIsSdkReady(true);
      } else {
        addLog("❌ ERRO: Script carregou, mas window.Asaas está undefined.");
      }
    };

    script.onerror = () => {
      addLog("❌ ERRO CRÍTICO: O Navegador bloqueou o download do script.");
    };

    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Painel de Diagnóstico de Segurança</h2>
      <div style={{ backgroundColor: '#000', color: '#0f0', padding: '15px', borderRadius: '5px', minHeight: '150px' }}>
        {debugLog.map((log, i) => <div key={i}>{log}</div>)}
      </div>
      
      {isSdkReady ? (
        <p style={{color: 'green'}}>🔥 SDK PRONTO! O botão de pagamento pode ser liberado.</p>
      ) : (
        <p style={{color: 'red'}}>⏳ Aguardando... Se o erro persistir, verifique o Console (F12).</p>
      )}
    </div>
  );
}

  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    valor: '100.00', // Valor fixo para teste
    card_number: '',
    card_holder: '',
    card_month: '',
    card_year: '',
    card_cvv: ''
  });

  // --- ENGENHARIA DE CARREGAMENTO DO SDK ---
  useEffect(() => {
    // 1. Evita duplicidade se o script já existir
    if (document.getElementById('asaas-sdk')) {
      if (window.Asaas) setIsSdkReady(true);
      return;
    }

    // 2. Cria a tag de script e injeta no cabeçalho
    const script = document.createElement('script');
    script.id = 'asaas-sdk';
    script.src = "https://static.asaas.com/js/sdk/asaas-v3.js";
    script.async = true;

    script.onload = () => {
      console.log("✅ SDK Asaas injetado e carregado com sucesso!");
      setIsSdkReady(true);
    };

    script.onerror = () => {
      console.error("❌ Erro crítico ao carregar o SDK do Asaas.");
      alert("Erro ao carregar módulos de segurança. Verifique sua conexão ou AdBlock.");
    };

    document.head.appendChild(script);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSdkReady) return;

    setLoading(true);

    try {
      // 1. Preparar dados para a Tokenização (Padrão PCI)
      const cardPayload = {
        holderName: formData.card_holder,
        number: formData.card_number,
        expiryMonth: formData.card_month,
        expiryYear: formData.card_year,
        ccv: formData.card_cvv
      };

      console.log("Iniciando tokenização segura...");

      // 2. Chamar o SDK do Asaas para gerar o Token
      window.Asaas.creditCard.tokenize(cardPayload, async (token) => {
        console.log("Token gerado:", token);

        // 3. Montar payload para o SEU Backend (Render)
        // Note: Não enviamos o número do cartão para o nosso servidor!
        const backendPayload = {
          nome: formData.nome,
          cpf: formData.cpf,
          email: formData.email,
          telefone: formData.telefone,
          valor: formData.valor,
          creditCardToken: token 
        };

        try {
          const API_URL = import.meta.env.VITE_API_URL || 'https://core-service-api.onrender.com';
          const response = await axios.post(`${API_URL}/checkout/credit-card`, backendPayload);
          
          console.log("Resposta do Backend:", response.data);
          alert("Sucesso! Pagamento enviado para processamento no Sandbox.");
        } catch (err) {
          console.error("Erro no Backend:", err);
          alert("O servidor recebeu o token, mas houve um erro no processamento.");
        } finally {
          setLoading(false);
        }

      }, (errors) => {
        // Tratamento de erros de validação do cartão (ex: número inválido)
        console.error("Erros do Asaas SDK:", errors);
        alert("Erro no Cartão: " + (errors[0]?.description || "Verifique os dados"));
        setLoading(false);
      });

    } catch (error) {
      console.error("Erro geral:", error);
      alert("Ocorreu um erro inesperado.");
      setLoading(false);
    }
  };

  // --- INTERFACE ---
  return (
    <div style={{ padding: '20px', maxWidth: '450px', margin: '40px auto', fontFamily: 'sans-serif', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Finalizar Pagamento</h2>
      
      {/* Alerta Visual de Carregamento */}
      {!isSdkReady && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
          ⚠️ Carregando módulos de segurança...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          placeholder="Nome Completo" 
          style={inputStyle}
          onChange={e => setFormData({...formData, nome: e.target.value})} 
          required 
        />
        <input 
          placeholder="CPF (Apenas números)" 
          style={inputStyle}
          onChange={e => setFormData({...formData, cpf: e.target.value})} 
          required 
        />
        <input 
          placeholder="E-mail" 
          type="email"
          style={inputStyle}
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          placeholder="Telefone (DDD + Número)" 
          style={inputStyle}
          onChange={e => setFormData({...formData, telefone: e.target.value})} 
          required 
        />

        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Dados do Cartão</p>
          <input 
            placeholder="Número do Cartão" 
            style={{ ...inputStyle, width: '94%' }} 
            onChange={e => setFormData({...formData, card_number: e.target.value})} 
          />
          <input 
            placeholder="Nome impresso no cartão" 
            style={{ ...inputStyle, width: '94%', marginTop: '10px' }} 
            onChange={e => setFormData({...formData, card_holder: e.target.value})} 
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input placeholder="Mês (MM)" style={{...inputStyle, width: '30%'}} onChange={e => setFormData({...formData, card_month: e.target.value})} />
            <input placeholder="Ano (AAAA)" style={{...inputStyle, width: '30%'}} onChange={e => setFormData({...formData, card_year: e.target.value})} />
            <input placeholder="CVV" style={{...inputStyle, width: '30%'}} onChange={e => setFormData({...formData, card_cvv: e.target.value})} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!isSdkReady || loading} 
          style={{ 
            padding: '15px', 
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isSdkReady ? '#28a745' : '#ccc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: isSdkReady ? 'pointer' : 'not-allowed',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'Processando transação...' : isSdkReady ? 'Confirmar Pagamento' : 'Aguarde segurança...'}
        </button>
      </form>
    </div>
  );
}

// Estilo auxiliar para os inputs
const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px'
};

export default App;
