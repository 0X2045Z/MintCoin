const assert = require('assert');
const { contract, accounts } = require('@openzeppelin/test-environment');
const { ether, time } = require('@openzeppelin/test-helpers');
const CrowdsaleContract = contract.fromArtifact("ERC20TimedCrowdsale");
const ERC20Contract = contract.fromArtifact("ERC20FixedSupply");
const Crowdsale = require('../inc/Crowdsale');
const ERC20 = require('../inc/ERC20');

totalSupply = 1000000000;//发行总量
[owner, sender, receiver, purchaser, beneficiary] = accounts;
value = ether('10');
eth = ether('10');
rate = 100;//兑换比例1ETH:100ERC20

describe("有时限的众筹...", async function () {
    const param = [
        "My Golden Coin",   //代币名称
        "MGC",              //代币缩写
        18,                 //精度
        totalSupply         //发行总量
    ];
    ERC20Instance = await ERC20(ERC20Contract, param);
});
describe("布署有封顶众筹合约...", async function () {
    it('布署合约并且批准给众筹账户', async function () {
        CrowdsaleInstance = await CrowdsaleContract.new(
            rate,                               //兑换比例1ETH:100ERC20
            sender,                        //接收ETH受益人地址
            ERC20Instance.address,              //代币地址
            owner,                        //代币从这个地址发送
            parseInt(await time.latest()) + 60,   //众筹开始时间
            parseInt(await time.latest()) + 600,   //众筹结束时间
            { from: owner }
        );
        //在布署之后必须将发送者账户中的代币批准给众筹合约
        await ERC20Instance.approve(CrowdsaleInstance.address, ether(totalSupply.toString()), { from: owner });
    });
    //测试通用的众筹合约
    await Crowdsale(rate, true);
});
describe("测试有时限众筹合约的特殊方法", function () {
    //测试开始时间
    it('开始时间: openingTime()', async function () {
        assert.doesNotReject(CrowdsaleInstance.openingTime());
    });
    //测试结束时间
    it('结束时间: closingTime()', async function () {
        assert.doesNotReject(CrowdsaleInstance.closingTime());
    });
    //测试众筹是否开始,未开始
    it('众筹未开始: isOpen()', async function () {
        assert.ok(!await CrowdsaleInstance.isOpen());
    });
    //测试众筹是否关闭,未关闭
    it('众筹未关闭: hasClosed()', async function () {
        assert.ok(!await CrowdsaleInstance.hasClosed());
    });
    //重新测试购买代币方法
    it('重新测试购买代币方法: buyTokens()', async function () {
        await time.increase(120);
        await CrowdsaleInstance.buyTokens(beneficiary, { value: eth, from: beneficiary });
    });
    //测试购买账户的余额
    it('购买账户的余额: balanceOf()', async function () {
        assert.equal(ether((10 * rate).toString()).toString(), (await ERC20Instance.balanceOf(beneficiary)).toString());
    });
    //重新测试众筹收入
    it('重新测试众筹收入: weiRaised()', async function () {
        assert.equal(eth.toString(), (await CrowdsaleInstance.weiRaised()).toString());
    });
    //重新测试众筹是否开始,已开始
    it('重新众筹已开始: isOpen()', async function () {
        assert.ok(await CrowdsaleInstance.isOpen());
    });
    //测试等待关闭
    it('等待关闭: hasClosed()', async function () {
        await time.increase(600);
        assert.rejects(CrowdsaleInstance.buyTokens(receiver, { value: eth }), /not open/);
        assert.ok(await CrowdsaleInstance.hasClosed());
    });
});
