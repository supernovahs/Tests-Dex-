pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dex {
    IERC20 public token;

    uint public TotalLiquidity;
    mapping(address => uint ) public liquidity;

    constructor(address _address) public {
        token = IERC20(_address);
    }

    function CreateLiquidityFirstTime(uint tokens) public payable returns (uint) {
        require(TotalLiquidity==0,"ALready liquidity");
        token.transferFrom(msg.sender, address(this),tokens);
        TotalLiquidity= address(this).balance;
        liquidity[msg.sender] = TotalLiquidity;
        return TotalLiquidity;
    }

    function price (uint _amount, uint input_reserve,uint output_reserve) public view returns (uint) {
        uint _amount_with_fee= _amount * 997;
        uint numerator = _amount_with_fee * output_reserve;
        uint denominator = (input_reserve *1000) + _amount_with_fee;
        return numerator/denominator;
    }

    function ethToToken() public payable returns (uint) {
        uint token_reserve= token.balanceOf(address(this));
        uint tokens_bought = price (msg.value, address(this).balance - msg.value,token_reserve);
        require(token.transfer(msg.sender,tokens_bought));
        return tokens_bought;
    }

    function tokenToEth(uint tokens) public returns(uint){
        uint token_reserve= token.balanceOf(address(this));
        uint eth_bought = price (tokens, token_reserve, address(this).balance);
        (bool success,bytes memory data) = msg.sender.call{value: eth_bought}("");
        require(success,"Failed to receive Eth");
        return eth_bought;

    }

    function deposit() public payable returns (uint256) {
        uint256 eth_reserve = address(this).balance -msg.value;
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 token_amount = ((msg.value *token_reserve) / eth_reserve) +1;
        uint256 liquidity_minted = (msg.value *TotalLiquidity)/ eth_reserve;
        liquidity[msg.sender] = liquidity[msg.sender] + liquidity_minted;
        TotalLiquidity = TotalLiquidity + liquidity_minted;
        require(token.transferFrom(msg.sender, address(this), token_amount));
        return liquidity_minted;
    }
    
    function withdraw(uint256 amount) public returns (uint256, uint256) {
        require(liquidity[msg.sender] >= amount,"not enough liquidity");
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 eth_amount = (amount *(address(this).balance)) / TotalLiquidity;
        uint256 token_amount = (amount *(token_reserve)) / TotalLiquidity;
        liquidity[msg.sender] = liquidity[msg.sender] - amount;
        TotalLiquidity = TotalLiquidity -(amount);
        (bool success, bytes memory data)= msg.sender.call{value: eth_amount}("");
        require(success, "Failed to withdraw");
        require(token.transfer(msg.sender, token_amount));
        return (eth_amount, token_amount);
    }       
    
    function getEthBalance() public view returns (uint) {
        return address(this).balance;
    }

}
