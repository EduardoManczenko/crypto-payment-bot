const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const url = 'http://localhost:3000/checkDeposit';

let usuarios = {};

const siteAtual = "https://ipfs.io/ipfs/QmdQVnAp7gL9YANdCeLszeiDLFDPyYbrhbp9trKw4AvMbC?filename=index.html"

async function getDepositChecker(hash, buyer, value, telegramId) {
    try {
        const requestData = { params: { hash, buyer, value, telegramId } };
        const response = await axios.get(url, requestData);
        const result = response.data;
        console.log('Result:', result);
        return result;
    } catch (error) {
        console.error('Error:', error.message);
        throw error; // Rejeite a promessa em caso de erro
    }
}

function weiToEther(weiString) {
    // Converter a string para BigInt
    const wei = BigInt(weiString);
    
    // Definir o fator de conversão de Wei para Ether (1 Ether = 10^18 Wei)
    const etherFactor = BigInt(10 ** 18);
    
    // Calcular o valor em Ether e retornar como string
    const ether = (wei / etherFactor).toString();
    return ether;
}

// Função para converter de Ether para Wei
function etherToWei(etherString) {
    // Converter a string para BigInt
    const ether = BigInt(etherString);
    
    // Definir o fator de conversão de Ether para Wei (1 Ether = 10^18 Wei)
    const etherFactor = BigInt(10 ** 18);
    
    // Calcular o valor em Wei e retornar como string
    const wei = (ether * etherFactor).toString();
    return wei;
}


// Substitua 'SEU_TOKEN' pelo token do seu bot, obtido ao conversar com o BotFather no Telegram.
const bot = new TelegramBot('SEU_TOKEN', {polling: true});

const STATES = {
    START: "start",
    WAITING_FOR_ADDRESS: "wainting_for_address",
    WAITING_FOR_VALUE: "wainting_for_value",
    WAITING_FOR_HASH: "waiting_for_hash"
}
let chatStates = {}

// Lidar com comandos /start e /help
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Bem-vindo! Este é um bot para realizar seu deposito!');
    bot.sendMessage(chatId, 'Para continuar basta informar seu endereço da metamask!');
    chatStates[chatId] = STATES.WAITING_FOR_ADDRESS 
});



bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    switch (chatStates[chatId]){
        case STATES.WAITING_FOR_ADDRESS:
                const address = msg.text;
                if (!usuarios[chatId]) {
                    usuarios[chatId] = {};
                }
                usuarios[chatId].walletAddress = address;    
                bot.sendMessage(chatId, `carteira metamask adicionada: ${address}`);
                bot.sendMessage(chatId, 'Para continuar basta informar o valor que voce ira depositar!');
                chatStates[chatId] = STATES.WAITING_FOR_VALUE      
        break;
    
        case STATES.WAITING_FOR_VALUE:
  
                const value = msg.text;
                console.log(etherToWei(value), "aquiiiiiiiiiii")
                usuarios[chatId].lastValueDeposited = etherToWei(value);
                bot.sendMessage(chatId, `valor a ser depositado: ${value}`);
                bot.sendMessage(chatId, `ID : ${chatId}\nlink: ${siteAtual}`);
                chatStates[chatId] = STATES.WAITING_FOR_HASH
            
        break;
    
        case STATES.WAITING_FOR_HASH:
                const hash = msg.text;
                const res = await getDepositChecker(hash, usuarios[chatId].walletAddress, usuarios[chatId].lastValueDeposited, chatId )
                if(res.confirmation){
                    bot.sendMessage(chatId, `hash: ${hash}`);
                    if (!usuarios[chatId].saldo){
                        usuarios[chatId].saldo = parseFloat(0)
                    }
                    usuarios[chatId].saldo += parseFloat(weiToEther(usuarios[chatId].lastValueDeposited))
                    bot.sendMessage(chatId, `novo saldo usd: $ ${usuarios[chatId].saldo}`);
                }
                chatStates[chatId] = null
        break;
    }
})


// Lidar com mensagens de texto

bot.onText(/\/saldo/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Saldo\nUSD: ${usuarios[chatId].saldo}`);
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Este bot responde aos comandos /start e /help.');
});