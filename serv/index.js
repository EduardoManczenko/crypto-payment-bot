const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

const provider = new ethers.JsonRpcProvider('https://polygon-testnet.public.blastapi.io');

const checkDepositABI = " function checkDeposit(address addressBuyer, bytes32 transactionHash, uint value, string memory telegramId) external view returns(bool)";
const contractAddress = '0x38EBE21da3c3B91946A99818783915fEE3C16aDE';


// Criar uma instância do contrato
const contract = new ethers.Contract(contractAddress, [checkDepositABI], provider);

const depositObject = {};

// Rota para fazer a consulta de depósito
app.get('/checkDeposit', async (req, res) => {
  const { hash, buyer, value, telegramId } = req.query;

  console.log(hash, buyer, value, telegramId)

  try {
    // Consultar a função checkDeposit do contrato
    const depositConfirmed = await contract.checkDeposit(buyer, hash, value, telegramId);
    console.log(depositConfirmed, "aquiiii")

    // Adicionar o hash a um objeto (você pode adaptar isso conforme necessário)
        depositObject[hash] = depositConfirmed;

    // Responder com a confirmação do depósito
    //res.json({ success: true, depositObject });
    res.json({confirmation: depositConfirmed, hash: hash, buyer: buyer, value: value, telegramId: telegramId})
  } catch (error) {
    console.error('Erro ao consultar depósito:', error);
    res.status(500).json({ success: false, error: 'Erro ao consultar depósito' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor Express rodando em http://localhost:${port}`);
});


