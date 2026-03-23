import { useState } from 'react';
import axios from 'axios';

// 1. Função Utilitária de Segurança (Isolada)
const generateCardToken = (cardData) => {
  return new Promise((resolve, reject) => {
    // Verificando se o SDK do Asaas carregou corretamente
    if (window.Asaas) {
      window.Asaas.creditCard.tokenize(cardData, (token) => {
        resolve(token);
      }, (errors) => {
        reject(errors);
      });
    } else {
      reject([{ description: "SDK do Asaas não carregado." }]);
    }
  });
};

function App() {
  const [formData, setFormData] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    valor: '100.00',
    card_number: '', card_holder: '', card_month: '', card_year: '', card_cvv: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ENGENHARIA REVERSA: Aqui simulamos o comportamento do plugin do WP
      // Primeiro, pegamos os dados sensíveis e pedimos um Token ao Asaas
      const cardPayload = {
        holderName: formData.card_holder,
        number: formData.card_number,
        expiryMonth: formData.card_month,
        expiryYear: formData.card_year,
        ccv: formData.card_cvv
      };

      console.log("Gerando token de segurança...");
      const token = await generateCardToken(cardPayload);

      // Agora enviamos para o SEU BACKEND apenas o que importa
      // Note que NÃO enviamos mais o número do cartão, apenas o token_gerado
      const backendPayload = {
        ...formData,
        creditCardToken: token, // O Token substitui os dados sensíveis
        card_number: undefined, // Removendo dados sensíveis do envio
        card_cvv: undefined
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/checkout/credit-card`, backendPayload);
      
      alert('Sucesso! Token gerado e enviado: ' + token);
      console.log("Resposta do seu Flask:", response.data);

    } catch (error) {
      const errorMsg = error[0]?.description || "Erro na transação";
      alert('Erro: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '450px', margin: 'auto', fontFamily: 'Arial' }}>
      <h2>Checkout Seguro (Tokenizado)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input placeholder="Nome" onChange={e => setFormData({...formData, nome: e.target.value})} required />
        <input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} required />
        <input placeholder="E-mail" onChange={e => setFormData({...formData, email: e.target.value})} required />
        
        <fieldset style={{ marginTop: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <legend>Dados do Cartão</legend>
          <input placeholder="Número do Cartão" style={{width: '95%', marginBottom: '8px'}} onChange={e => setFormData({...formData, card_number: e.target.value})} />
          <input placeholder="Nome no Cartão" style={{width: '95%', marginBottom: '8px'}} onChange={e => setFormData({...formData, card_holder: e.target.value})} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="MM" style={{width: '30%'}} onChange={e => setFormData({...formData, card_month: e.target.value})} />
            <input placeholder="YYYY" style={{width: '30%'}} onChange={e => setFormData({...formData, card_year: e.target.value})} />
            <input placeholder="CVV" style={{width: '30%'}} onChange={e => setFormData({...formData, card_cvv: e.target.value})} />
          </div>
        </fieldset>

        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Processando...' : 'Finalizar Pagamento Seguro'}
        </button>
      </form>
    </div>
  );
}

export default App;
