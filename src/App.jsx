import React, { useState } from 'react'

function App() {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)

  // URL do seu backend no Render
  const API_URL = "https://core-service-api.onrender.com/criar-pix"

  const gerarPix = async (e) => {
    e.preventDefault()
    setCarregando(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, valor: parseFloat(valor) })
      })

      const data = await response.json()
      if (data.status === "sucesso") {
        setResultado(data)
      } else {
        alert("Erro ao gerar PIX: " + data.erro)
      }
    } catch (error) {
      alert("Erro de conexão com o servidor")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Simulador de PIX (Souza)</h1>
      
      {!resultado ? (
        <form onSubmit={gerarPix}>
          <input 
            type="text" placeholder="Seu nome" 
            value={nome} onChange={(e) => setNome(e.target.value)} required 
          /><br/><br/>
          <input 
            type="number" placeholder="Valor (Ex: 10.50)" 
            value={valor} onChange={(e) => setValor(e.target.value)} required 
          /><br/><br/>
          <button type="submit" disabled={carregando}>
            {carregando ? "Gerando..." : "Gerar QR Code PIX"}
          </button>
        </form>
      ) : (
        <div>
          <h3>PIX Gerado com Sucesso!</h3>
          <p>Cliente: {nome}</p>
          <img src={`data:image/png;base64,${resultado.qr_code_base64}`} alt="QR Code" style={{ width: '250px' }} />
          <br/>
          <textarea readOnly value={resultado.pix_copia_cola} style={{ width: '300px', height: '100px' }} />
          <br/>
          <button onClick={() => setResultado(null)}>Novo Pagamento</button>
        </div>
      )}
    </div>
  )
}

export default App
