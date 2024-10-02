document.getElementById('create-model-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    if(isNaN(price)) {
        alert("Please enter correct number.");
        return;
    }
    const description = document.getElementById('description').value;

    const contract = await getContract();
    const priceInWei = web3.utils.toWei(price, 'ether');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const account = accounts[0];

    if (!account) {
        alert("Please connect to MetaMask.");
        return;
    }

    try {
        await contract.methods.listModel(name, description, priceInWei).send({ from: account });
        alert('Model created successfully!');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error creating model:", error);
    }
});
