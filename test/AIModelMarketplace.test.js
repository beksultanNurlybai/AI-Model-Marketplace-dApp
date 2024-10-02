const AIModelMarketplace = artifacts.require("AIModelMarketplace");

contract("AIModelMarketplace", accounts => {
    let marketplace;

    const [owner, buyer, creator] = accounts;

    beforeEach(async () => {
        marketplace = await AIModelMarketplace.new();
    });

    describe("Model Listing", () => {
        it("should list a new model", async () => {
            await marketplace.listModel("Model 1", "Description of Model 1", web3.utils.toWei("1", "ether"), { from: creator });
            const totalModels = await marketplace.totalModels();
            assert.equal(totalModels.toString(), "1", "Model was not listed correctly");
        });

        it("should emit an event when a model is listed", async () => {
            const result = await marketplace.listModel("Model 2", "Description of Model 2", web3.utils.toWei("2", "ether"), { from: creator });
            const event = result.logs[0];

            assert.equal(event.event, "ModelListed", "Event not emitted correctly");
            assert.equal(event.args.name, "Model 2", "Model name is incorrect");
            assert.equal(event.args.price.toString(), web3.utils.toWei("2", "ether"), "Model price is incorrect");
            assert.equal(event.args.creator, creator, "Model creator is incorrect");
        });
    });

    describe("Model Purchasing", () => {
        beforeEach(async () => {
            await marketplace.listModel("Model 3", "Description of Model 3", web3.utils.toWei("1", "ether"), { from: creator });
        });

        it("should allow a user to purchase a model", async () => {
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
            const earnings = await marketplace.earnings(creator);
            assert.equal(earnings.toString(), web3.utils.toWei("1", "ether"), "Creator did not receive payment");
        });

        it("should not allow the creator to purchase their own model", async () => {
            try {
                await marketplace.purchaseModel(0, { from: creator, value: web3.utils.toWei("1", "ether") });
                assert.fail("The creator should not be able to purchase their own model");
            } catch (error) {
                assert(error.message.includes("Creator cannot purchase their own model"), "Incorrect error message");
            }
        });
    });

    describe("Model Rating", () => {
        beforeEach(async () => {
            await marketplace.listModel("Model 4", "Description of Model 4", web3.utils.toWei("1", "ether"), { from: creator });
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
        });

        it("should allow a user to rate a purchased model", async () => {
            await marketplace.rateModel(0, 5, { from: buyer });
            const modelDetails = await marketplace.getModelDetails(0);
            assert.equal(modelDetails.averageRating.toString(), "5", "Average rating is incorrect");
        });

        it("should not allow rating of an unpurchased model", async () => {
            try {
                await marketplace.rateModel(1, 5, { from: buyer });
                assert.fail("Should not be able to rate a non-purchased model");
            } catch (error) {
                assert(error.message.includes("Model does not exist."), "Incorrect error message");
            }
        });

        it("should not allow invalid ratings", async () => {
            try {
                await marketplace.rateModel(0, 6, { from: buyer });
                assert.fail("Rating should be between 1 and 5");
            } catch (error) {
                assert(error.message.includes("Rating must be between 1 and 5."), "Incorrect error message");
            }
        });
    });

    describe("Withdraw Funds", () => {
        beforeEach(async () => {
            await marketplace.listModel("Model 5", "Description of Model 5", web3.utils.toWei("1", "ether"), { from: creator });
            await marketplace.purchaseModel(0, { from: buyer, value: web3.utils.toWei("1", "ether") });
        });

        it("should allow the creator to withdraw funds", async () => {
            const initialBalance = await web3.eth.getBalance(creator);
            await marketplace.withdrawFunds({ from: creator });
            const finalBalance = await web3.eth.getBalance(creator);
            assert(finalBalance > initialBalance, "Funds were not withdrawn correctly");
        });

        it("should not allow withdrawal of zero funds", async () => {
            try {
                await marketplace.withdrawFunds({ from: buyer });
                assert.fail("Should not be able to withdraw without earnings");
            } catch (error) {
                assert(error.message.includes("No funds to withdraw."), "Incorrect error message");
            }
        });
    });
});
