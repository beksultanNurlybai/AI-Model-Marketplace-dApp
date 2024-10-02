document.getElementById('withdrawButton').addEventListener('click', async () => {
    try {
        const contract = await getContract();
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        
        await contract.methods.withdrawFunds().send({ from: account });

        alert('Funds withdrawn successfully!');

    } catch (error) {
        console.error('Error withdrawing funds:', error);
        alert('Failed to withdraw funds. Please try again.');
    }
});

async function loadAvailableModels() {
    const contract = await getContract();
    const totalModels = await contract.methods.totalModels().call();
    const modelList = document.getElementById('model-list');
    modelList.innerHTML = '';

    for (let i = 0; i < totalModels; i++) {
        const model = await contract.methods.getModelDetails(i).call();
        const modelHTML = `
            <div class="col-md-4">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${model.name}</h5>
                        <p class="card-text">Price: ${web3.utils.fromWei(model.price, 'ether')} Ether</p>
                        <p class="card-text">Creator: ${model.creator}</p>
                        <div class="d-flex justify-content-between">
                            <a href="detail.html?id=${i}" class="btn btn-info">View</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modelList.innerHTML += modelHTML;
    }
}

loadAvailableModels();