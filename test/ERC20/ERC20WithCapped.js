const assert = require('assert');
const { contract,accounts } = require('@openzeppelin/test-environment');
const {expectRevert,ether} = require('@openzeppelin/test-helpers');
const ERC20Contract = contract.fromArtifact('ERC20WithCapped');
const ERC20 = require('../inc/ERC20');
describe("有封顶代币", async function () {
    const param = [
        "My Golden Coin",   //代币名称
        "MGC",              //代币缩写
        18,                 //精度
        1000,               //初始发行量
        1000000000          //封顶上限
    ];
    //测试ERC20合约的基本方法
    ERC20Instance = await ERC20(ERC20Contract, param);
});
describe("测试有封顶代币的特殊方法", function () {
    //测试封顶方法
    it('封顶方法: cap()', async function () {
        await expectRevert(ERC20Instance.mint(owner, ether('1000000000'),{from:owner}), 'cap exceeded');
    });
});