function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function loadModelDetails() {
    const modelId = getQueryParams();
    const contract = await getContract();

    const model = await contract.methods.getModelDetails(modelId).call();

    const modelDetails = document.getElementById('model-details');
    modelDetails.innerHTML = `
        <p><strong>Name:</strong> ${model.name}</p>
        <p><strong>Description:</strong> ${model.description}</p>
        <p><strong>Price:</strong> ${web3.utils.fromWei(model.price, 'ether')} Ether</p>
        <p><strong>Rating:</strong> ${Number(model.averageRating)/10}</p>
    `;

    document.getElementById('rate-button').addEventListener('click', async () => {
        const ratingValue = document.getElementById('rating').value;
        if (ratingValue < 1 || ratingValue > 5) {
            alert("Rating must be between 1 and 5.");
            return;
        }
        await submitRating(modelId, ratingValue);
    });

    document.getElementById('buy-button').addEventListener('click', async () => {
        await purchaseModel(modelId, model.price);
    });
}

async function submitRating(modelId, rating) {
    const contract = await getContract();
    const account = (await web3.eth.getAccounts())[0];

    try {
        await contract.methods.rateModel(modelId, rating).send({ from: account });
        alert("Rating submitted successfully!");
        loadModelDetails();
    } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Error submitting rating. Please try again.");
    }
}

async function purchaseModel(modelId, price) {
    const contract = await getContract();
    const account = (await web3.eth.getAccounts())[0];

    try {
        await contract.methods.purchaseModel(modelId).send({ from: account, value: price });
        alert("Model purchased successfully!");
    } catch (error) {
        console.error("Error purchasing model:", error);
        alert("Error purchasing model. Please try again.");
    }
}

loadModelDetails();
