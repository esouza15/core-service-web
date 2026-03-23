import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    valor: '100.00',
    card_number: '', card_holder: '', card_month: '', card_year: '', card_cvv: ''
  });

  // EFEITO DE CHECAGEM: Verifica se o script do Asaas carregou
  useEffect(() => {
    const checkSdk = setInterval(() => {
      if (window.Asaas) {
        console.log("✅ SDK Asaas carregado com sucesso!");
        setIsSdkReady(true);
        clearInterval(checkSdk);
      }
    }, 500); // Checa a cada meio segundo

    return () => clearInterval(checkSdk);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSdkReady) return;

    setLoading(true);
    try {
      // 1. Tokenização Segura (Engenharia Reversa do Plugin)
      const cardPayload = {
        holderName: formData.card_holder,
        number: formData.card_number,
        expiryMonth: formData.card_month,
        expiryYear: formData.card_year,
        ccv: formData.card_cvv
      };

      // Chamada direta ao SDK que agora temos certeza que existe
      window.Asaas.creditCard.tokenize(cardPayload, async (token) => {
        
        // 2. Envio para o seu Backend no Render
        const backendPayload = {
          ...formData,
          creditCardToken: token,
          card_number: undefined, // Segurança: remove dados sensíveis
          card_cvv: undefined
        };

        const API_URL = import.meta.env.VITE_API_URL;
        const response = await axios.post(`${API_URL}/checkout/credit-card`, backendPayload);
        
        alert("Pagamento Processado! ID: " + response.data.id);
        setLoading(false);

      }, (errors) => {
        alert("Erro no Cartão: " + errors[0].description);
        setLoading(false);
      });

    } catch (error) {
      alert("Erro de comunicação com o servidor.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Finalizar Pagamento</h2>
      
      {!isSdkReady && (
        <p style={{ color: 'orange', fontSize: '12px' }}>⚠️ Carregando módulos de segurança...</p>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input placeholder="Nome" onChange={e => setFormData({...formData, nome: e.target.value})} required />
        <input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} required />
        <input placeholder="E-mail" onChange={e => setFormData({...formData, email: e.target.value})} required />
        
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
          <input placeholder="Número do Cartão" style={{width: '90%'}} onChange={e => setFormData({...formData, card_number: e.target.value})} />
          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
            <input placeholder="MM" style={{width: '30%'}} onChange={e => setFormData({...formData, card_month: e.target.value})} />
            <input placeholder="YYYY" style={{width: '30%'}} onChange={e => setFormData({...formData, card_year: e.target.value})} />
            <input placeholder="CVV" style={{width: '30%'}} onChange={e => setFormData({...formData, card_cvv: e.target.value})} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!isSdkReady || loading} 
          style={{ 
            padding: '12px', 
            background: isSdkReady ? '#28a745' : '#ccc', 
            color: 'white', 
            border: 'none', 
            cursor: isSdkReady ? 'pointer' : 'not-allowed' 
          }}
        >
          {loading ? 'Processando...' : isSdkReady ? 'Pagar Agora' : 'Aguarde...'}
        </button>
      </form>
    </div>
  );
}

export default App;
