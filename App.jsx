import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // 1. Estados de Controle e Diagnóstico
  const [debugLog, setDebugLog] = useState(["Iniciando sistema..."]);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. Estados do Formulário
  const [formData, setFormData] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    valor: '100.00',
    card_number: '', card_holder: '', card_month: '', card_year: '', card_cvv: ''
  });

  const addLog = (msg) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  // 3. Efeito de Carregamento do SDK (Injeção Dinâmica)
  useEffect(() => {
    addLog("Verificando presença do SDK Asaas...");
    
    // Tenta encontrar o SDK a cada 1 segundo (máximo 5 tentativas)
    let tentativas = 0;
    const interval = setInterval(() => {
      tentativas++;
      if (window.Asaas) {
        addLog("✅ SUCESSO: SDK detectado no objeto window!");
        setIsSdkReady(true);
        clearInterval(interval);
      } else if (tentativas > 5) {
        addLog("❌ TIMEOUT: O navegador não liberou o SDK após 5s.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 4. Lógica de Envio
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSdkReady) return;
    setLoading(true);
    addLog("Iniciando tokenização...");

    try {
      const cardPayload = {
        holderName: formData.card_holder,
        number: formData.card_number,
        expiryMonth: formData.card_month,
        expiryYear: formData.card_year,
        ccv: formData.card_cvv
      };

      window.Asaas.creditCard.tokenize(cardPayload, async (token) => {
        addLog("Token gerado com sucesso!");
        
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
          addLog("Resposta do Backend: " + (response.data.id || "OK"));
          alert("Pagamento processado!");
        } catch (err) {
          addLog("❌ Erro no Backend.");
          alert("Erro no servidor.");
        } finally {
          setLoading(false);
        }

      }, (errors) => {
        addLog("❌ Erro no Cartão: " + errors[0].description);
        alert(errors[0].description);
        setLoading(false);
      });

    } catch (error) {
      setLoading(false);
    }
  };

  // 5. Estilos Básicos
  const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', marginBottom: '10px' };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Checkout Engenharia Reversa</h2>
      
      {/* Terminal de Diagnóstico */}
      <div style={{ backgroundColor: '#000', color: '#0f0', padding: '10px', borderRadius: '5px', fontSize: '12px', marginBottom: '20px', maxHeight: '100px', overflowY: 'auto' }}>
        {debugLog.map((log, i) => <div key={i}>{log}</div>)}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <input placeholder="Nome" style={inputStyle} onChange={e => setFormData({...formData, nome: e.target.value})} required />
        <input placeholder="CPF" style={inputStyle} onChange={e => setFormData({...formData, cpf: e.target.value})} required />
        <input placeholder="E-mail" style={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input placeholder="Telefone" style={inputStyle} onChange={e => setFormData({...formData, telefone: e.target.value})} required />
        
        <div style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
          <input placeholder="Número Cartão" style={{...inputStyle, width: '90%'}} onChange={e => setFormData({...formData, card_number: e.target.value})} />
          <input placeholder="Nome no Cartão" style={{...inputStyle, width: '90%'}} onChange={e => setFormData({...formData, card_holder: e.target.value})} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="MM" style={{...inputStyle, width: '25%'}} onChange={e => setFormData({...formData, card_month: e.target.value})} />
            <input placeholder="AAAA" style={{...inputStyle, width: '25%'}} onChange={e => setFormData({...formData, card_year: e.target.value})} />
            <input placeholder="CVV" style={{...inputStyle, width: '25%'}} onChange={e => setFormData({...formData, card_cvv: e.target.value})} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!isSdkReady || loading} 
          style={{ 
            marginTop: '20px', padding: '15px', 
            backgroundColor: isSdkReady ? '#28a745' : '#ccc', 
            color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' 
          }}
        >
          {loading ? 'Processando...' : isSdkReady ? 'Pagar Agora' : 'Aguardando Segurança...'}
        </button>
      </form>
    </div>
  );
}

export default App;
