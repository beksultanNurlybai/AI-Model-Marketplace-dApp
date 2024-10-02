// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AIModelMarketplace {
    struct Model {
        string name;
        string description;
        uint256 price;
        address creator;
        uint256 totalRating;
        uint256 ratingCount;
    }

    Model[] public models;
    mapping(address => uint256) public earnings;

    constructor() {
        models.push(Model("TextGPT", "It is AI like ChatGPT. Lorem ipsum dolor sit amet consectetur adipisicing elit.", 1.6 ether, msg.sender, 19, 6));
        models.push(Model("ImageGenAI", "AI that generates images. Lorem ipsum dolor sit amet consectetur.", 2 ether, msg.sender, 18, 4));
        models.push(Model("VoiceAssistAI", "AI for voice assistance. Lorem ipsum dolor sit amet.", 0.05 ether, msg.sender, 10, 6));
    }

    event ModelListed(uint256 modelId, string name, uint256 price, address creator);
    event ModelPurchased(uint256 modelId, address buyer);
    event ModelRated(uint256 modelId, uint8 rating);

    function listModel(string memory name, string memory description, uint256 price) public {
        require(price > 0, "Price must be greater than zero.");

        models.push(Model({
            name: name,
            description: description,
            price: price,
            creator: msg.sender,
            totalRating: 0,
            ratingCount: 0
        }));

        emit ModelListed(models.length - 1, name, price, msg.sender);
    }

    function purchaseModel(uint256 modelId) public payable {
        require(modelId < models.length, "Model does not exist.");
        Model storage model = models[modelId];
        require(msg.value == model.price, "Incorrect payment amount.");
        require(model.creator != msg.sender, "Creator cannot purchase their own model.");

        earnings[model.creator] += msg.value;

        emit ModelPurchased(modelId, msg.sender);
    }

    function rateModel(uint256 modelId, uint8 rating) public {
        require(modelId < models.length, "Model does not exist.");
        Model storage model = models[modelId];
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5.");

        model.totalRating += rating;
        model.ratingCount++;

        emit ModelRated(modelId, rating);
    }

    function withdrawFunds() public {
        uint256 amount = earnings[msg.sender];
        require(amount > 0, "No funds to withdraw.");

        earnings[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getModelDetails(uint256 modelId) public view returns (string memory name, string memory description, uint256 price, address creator, uint256 averageRating) {
        require(modelId < models.length, "Model does not exist.");

        Model storage model = models[modelId];
        averageRating = model.ratingCount > 0 ? (model.totalRating * 10) / model.ratingCount : 0;

        return (model.name, model.description, model.price, model.creator, averageRating);
    }

    function totalModels() public view returns (uint256) {
        return models.length;
    }
}
