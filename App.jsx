import { useState } from 'react';
import axios from 'axios';

function App() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    valor: '100.00',
    card_number: '',
    card_holder: '',
    card_month: '',
    card_year: '',
    card_cvv: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // AQUI ESTÁ A MÁGICA: Apontando para o seu backend no Render
      const response = await axios.post('https://core-service-api.onrender.com/checkout/credit-card', formData);
      alert('Resposta do Servidor: ' + response.data.msg);
    } catch (error) {
      console.error(error);
      alert('Erro ao processar pagamento');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Checkout Simulado (Asaas Sandbox)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input placeholder="Nome Completo" onChange={e => setFormData({...formData, nome: e.target.value})} />
        <input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} />
        <input placeholder="E-mail" onChange={e => setFormData({...formData, email: e.target.value})} />
        <hr />
        <input placeholder="Número do Cartão" onChange={e => setFormData({...formData, card_number: e.target.value})} />
        <input placeholder="Nome no Cartão" onChange={e => setFormData({...formData, card_holder: e.target.value})} />
        <div style={{ display: 'flex', gap: '5px' }}>
          <input placeholder="Mês (MM)" onChange={e => setFormData({...formData, card_month: e.target.value})} />
          <input placeholder="Ano (YYYY)" onChange={e => setFormData({...formData, card_year: e.target.value})} />
          <input placeholder="CVV" onChange={e => setFormData({...formData, card_cvv: e.target.value})} />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Pagar Agora
        </button>
      </form>
    </div>
  );
}

export default App;
