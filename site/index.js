let walletAddress;
const depositContract = "0x38EBE21da3c3B91946A99818783915fEE3C16aDE"
const usdContract = "0x14c38e2D2A3Ba28d882ae997Bf14A5e1FDcD0B0D"
const makeDepositABI = "function makeDeposit(uint value, address c, string memory telegramId) external returns (bytes32)"
const approveABI = "function approve(address spender, uint256 value) public virtual returns (bool)"
const getHashABI = "function getHash(address buyer, string memory telegramId) public view returns(bytes32)"


document.addEventListener('DOMContentLoaded', function () {
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  const walletLabel = document.getElementById('walletLabel');
  const confirmarBtn = document.getElementById('confirmarBtn');
  const hashLabel = document.getElementById('hashLabel');
  const confirmationHashSpan = document.getElementById('confirmationHash');

  connectWalletBtn.addEventListener('click', async function () {
    walletAddress = await login();
    walletLabel.style.display = 'block';
    walletLabel.textContent = `Wallet: ${walletAddress}`;
    connectWalletBtn.style.display = 'none';
  });

  confirmarBtn.addEventListener('click', async function () {
    const confirmationHash = await permAndDeposit();
    hashLabel.style.display = 'block';
    confirmationHashSpan.textContent = confirmationHash;
  });

  hashLabel.addEventListener('click', function () {
    const confirmationHashText = confirmationHashSpan.textContent;
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = confirmationHashText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    hashLabel.textContent = 'Hash Copiado!';
    setTimeout(() => {
      hashLabel.textContent = ` clique para copiar  o Hash de Confirmação: ${confirmationHashText}`;
    }, 1500);
  });
});

function getProvider(){
  if(!window.ethereum){
    console.log("sem metamask instalada")
  }{
    console.log("getting provider...")
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  return provider
}



async function login() {
  let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

async function captureTelegramId() {
  var telegramIdInput = document.getElementById("telegramId");
  var telegramId = telegramIdInput.value;
  return telegramId
}

async function captureDepositAmount() {
  var depositAmountInput = document.getElementById("totalToDeposit");
  var depositAmount = depositAmountInput.value;
  return depositAmount
}


async function permissaoToken(){
  const provider = getProvider()
  const signer = provider.getSigner()
  const contract = new ethers.Contract(usdContract, [approveABI], provider)
  const contractSigner = contract.connect(signer)
  
  const amount = await captureDepositAmount()
  const amountFormat = await ethers.utils.parseUnits(amount).toString()
  const spender = depositContract
  console.log(amount, "amount")
  const tx = await contractSigner.approve(spender, amountFormat)
  console.log(tx)
  await tx.wait(1)
  return tx
}


async function deposit(){
  const provider = getProvider()
  const signer = provider.getSigner()
  const contract = new ethers.Contract(depositContract, [makeDepositABI], provider)
  const contractSigner = contract.connect(signer)
  const amount = await captureDepositAmount()
  const amountFormat = await ethers.utils.parseUnits(amount).toString()
  const telegramId = await captureTelegramId()
  const tx = await contractSigner.makeDeposit(amountFormat, usdContract, telegramId)
  console.log(tx)
  await tx.wait(1)
  return(tx)
}

async function getTheHash(){
  const provider = getProvider()
  const contract = new ethers.Contract(depositContract, [getHashABI], provider)
  const tx = await contract.getHash(walletAddress, await captureTelegramId())
  return tx
}


async function permAndDeposit(){
  await permissaoToken()
  await deposit()
  const hash = await getTheHash()
  console.log(hash)
  return hash
}