const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let myDexContract;
  let myContract;
  let YourContract;
  let owner;
  let addr1;
  beforeEach(async function()  {

    const YourContract = await ethers.getContractFactory("YourContract");
    myContract = await YourContract.deploy();
    await myContract.deployed();
    const DexContract = await ethers.getContractFactory("Dex");
    myDexContract = await DexContract.deploy(myContract.address);
    await myDexContract.deployed();
    [owner, addr1]= await ethers.getSigners();

  });

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });
  it("Init function success", async function () {
    await myContract.approve(myDexContract.address,ethers.utils.parseEther("100"));
    await myDexContract.CreateLiquidityFirstTime(ethers.utils.parseEther("100"),{value: ethers.utils.parseEther("1")});
    const BalloonsInDex= await  myContract.balanceOf(myDexContract.address);
    const ownerBalloonsBalance= await myContract.balanceOf(owner.address);
    const liquiditymapping= await myDexContract.liquidity(owner.address);
    expect(myDexContract.TotalLiquidity !=0);
    expect(ethers.utils.formatEther(BalloonsInDex)).to.equal("100.0");
    expect(ethers.utils.formatEther(ownerBalloonsBalance)).to.equal("900.0");
    expect(ethers.utils.formatEther(liquiditymapping)).to.equal("1.0");
    const DExEthBalance= await myDexContract.getEthBalance();
    console.log(ethers.utils.formatEther(DExEthBalance));
  });
  it("price function is correctly working",async function (){
    const price= await myDexContract.price(ethers.utils.parseEther("0.1"),ethers.utils.parseEther("1"),ethers.utils.parseEther("100"));
    console.log(ethers.utils.formatEther(price));

    // expect(myDexContract.price("0.1","1","100")).to.equal("9.70");
  });

  it("ethtoToken func successsfully working", async function() {
    await myContract.approve(myDexContract.address,ethers.utils.parseEther("100"));
    await myDexContract.CreateLiquidityFirstTime(ethers.utils.parseEther("100"),{value: ethers.utils.parseEther("1")});
    const tokensbought=  await myDexContract.ethToToken({value: ethers.utils.parseEther("0.1")});
    expect(ethers.utils.formatEther(tokensbought.value)).to.equal("0.1")
    const balanceofDex= await myContract.balanceOf(myDexContract.address);
    expect((100-ethers.utils.formatEther(balanceofDex)).toFixed(2)).to.equal("9.07");
    // expect(myDexContract.ethToToken(),{value: ethers.utils.parseEther("0.1")}).to.equal()
  })


  it("tokenToEth func successfully working", async function(){
    await myContract.approve(myDexContract.address,ethers.utils.parseEther("100"));
    await myDexContract.CreateLiquidityFirstTime(ethers.utils.parseEther("100"),{value: ethers.utils.parseEther("1")});
    const ethbought= await myDexContract.tokenToEth(ethers.utils.parseEther("10"));
    const DExEthBalance= await myDexContract.getEthBalance();
    const dexbal= ethers.utils.formatEther(DExEthBalance);
    expect(Number(dexbal).toFixed(2)).to.equal("0.91");

  })
  




    
        
    

});
  

  
  // Uncomment the event and emit lines in YourContract.sol to make this test pass

  /*it("Should emit a SetPurpose event ", async function () {
    const [owner] = await ethers.getSigners();

    const newPurpose = "Another Test Purpose";

    expect(await myContract.setPurpose(newPurpose)).to.
      emit(myContract, "SetPurpose").
        withArgs(owner.address, newPurpose);
  });*/