const { ethers } = require("hardhat")
const readline = require('readline');
const fs = require('fs');

let deploymentInfo = require("./deploymentConfig.json");

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

async function main() {
    // Display the current network name and connected signer, and ask for y/n to proceed
    await ethers.provider.ready
    const network = await ethers.provider.getNetwork()
    const chainId = network.chainId
    console.log(`Network: ${network.name} - Chain ID: ${chainId}`)
    const signer = await ethers.getSigner()
    console.log(`Signer: ${await signer.getAddress()}`)
    const response = await askQuestion("Do you wish to continue? (y/n) ")
    if (response !== "y") {
        return
    }

    // Deploy Vault
    let vault;
    const Vault = await ethers.getContractFactory("Vault")
    if (deploymentInfo["Vault"].address == "") {
        vault = await Vault.deploy()
        await vault.deployed()
        deploymentInfo["Vault"].address = vault.address
    } else {
        vault = Vault.attach(deploymentInfo["Vault"].address)
    }
    console.log(`Vault: ${vault.address}`)

    // Deploy VaultErrorController
    let vaultErrorController;
    const VaultErrorController = await ethers.getContractFactory("VaultErrorController")
    if (deploymentInfo["VaultErrorController"].address == "") {
        vaultErrorController = await VaultErrorController.deploy()
        await vaultErrorController.deployed()
        deploymentInfo["VaultErrorController"].address = vaultErrorController.address
    } else {
        vaultErrorController = VaultErrorController.attach(deploymentInfo["VaultErrorController"].address)
    }
    console.log(`VaultErrorController: ${vaultErrorController.address}`)

    // Deploy VaultUtils
    let vaultUtils;
    const VaultUtils = await ethers.getContractFactory("VaultUtils")
    if (deploymentInfo["VaultUtils"].address == "") {
        vaultUtils = await VaultUtils.deploy(vault.address)
        await vaultUtils.deployed()
        deploymentInfo["VaultUtils"].address = vaultUtils.address
        deploymentInfo["VaultUtils"].constructorArgs = [vault.address]
    } else {
        vaultUtils = VaultUtils.attach(deploymentInfo["VaultUtils"].address)
    }
    console.log(`VaultUtils: ${vaultUtils.address}`)

    // Deploy USDG
    let usdg;
    const USDG = await ethers.getContractFactory("USDG")
    if (deploymentInfo["USDG"].address == "") {
        usdg = await USDG.deploy(vault.address)
        await usdg.deployed()
        deploymentInfo["USDG"].address = usdg.address
        deploymentInfo["USDG"].constructorArgs = [vault.address]
    } else {
        usdg = USDG.attach(deploymentInfo["USDG"].address)
    }
    console.log(`USDG: ${usdg.address}`)

    // Deploy PriceFeed
    let priceFeed;
    const PriceFeed = await ethers.getContractFactory("PriceFeed")
    if (deploymentInfo["PriceFeed"].address == "") {
        priceFeed = await PriceFeed.deploy()
        await priceFeed.deployed()
        deploymentInfo["PriceFeed"].address = priceFeed.address
    } else {
        priceFeed = PriceFeed.attach(deploymentInfo["PriceFeed"].address)
    }
    console.log(`PriceFeed: ${priceFeed.address}`)

    // Deploy ShortsTracker
    let shortsTracker;
    const ShortsTracker = await ethers.getContractFactory("ShortsTracker")
    if (deploymentInfo["ShortsTracker"].address == "") {
        shortsTracker = await ShortsTracker.deploy(vault.address)
        await shortsTracker.deployed()
        deploymentInfo["ShortsTracker"].address = shortsTracker.address
        deploymentInfo["ShortsTracker"].constructorArgs = [vault.address]
    } else {
        shortsTracker = ShortsTracker.attach(deploymentInfo["ShortsTracker"].address)
    }
    console.log(`ShortsTracker: ${shortsTracker.address}`)

    // Deploy GLP
    let glp;
    const GLP = await ethers.getContractFactory("GLP")
    if (deploymentInfo["GLP"].address == "") {
        glp = await GLP.deploy()
        await glp.deployed()
        deploymentInfo["GLP"].address = glp.address
    } else {
        glp = GLP.attach(deploymentInfo["GLP"].address)
    }
    console.log(`GLP: ${glp.address}`)

    // Deploy WETH
    let weth;
    const WETH = await ethers.getContractFactory("WETH")
    if (deploymentInfo["WETH"].address == "") {
        weth = await WETH.deploy("WETH", "WETH", 18)
        await weth.deployed()
        deploymentInfo["WETH"].address = weth.address
    } else {
        weth = WETH.attach(deploymentInfo["WETH"].address)
    }
    console.log(`WETH: ${weth.address}`)

    // Deploy Router
    let router;
    const Router = await ethers.getContractFactory("Router")
    if (deploymentInfo["Router"].address == "") {
        router = await Router.deploy(vault.address, usdg.address, weth.address)
        await router.deployed()
        deploymentInfo["Router"].address = router.address
        deploymentInfo["Router"].constructorArgs = [vault.address, usdg.address, weth.address]
    } else {
        router = Router.attach(deploymentInfo["Router"].address)
    }
    console.log(`Router: ${router.address}`)

    // Deploy GLPManager
    let glpManager;
    const GLPManager = await ethers.getContractFactory("GlpManager")
    if (deploymentInfo["GlpManager"].address == "") {
        glpManager = await GLPManager.deploy(vault.address, usdg.address, glp.address, shortsTracker.address, 30)
        await glpManager.deployed()
        deploymentInfo["GlpManager"].address = glpManager.address
        deploymentInfo["GlpManager"].constructorArgs = [vault.address, usdg.address, glp.address, shortsTracker.address, 30]
    } else {
        glpManager = GLPManager.attach(deploymentInfo["GlpManager"].address)
    }
    console.log(`GlpManager: ${glpManager.address}`)

    // Deploy OrderBook
    let orderBook;
    const OrderBook = await ethers.getContractFactory("OrderBook")
    if (deploymentInfo["OrderBook"].address == "") {
        orderBook = await OrderBook.deploy()
        await orderBook.deployed()
        deploymentInfo["OrderBook"].address = orderBook.address
    } else {
        orderBook = OrderBook.attach(deploymentInfo["OrderBook"].address)
    }
    console.log(`OrderBook: ${orderBook.address}`)

    // Deploy PositionUtils
    let positionUtils;
    const PositionUtils = await ethers.getContractFactory("PositionUtils")
    if (deploymentInfo["PositionUtils"].address == "") {
        positionUtils = await PositionUtils.deploy()
        await positionUtils.deployed()
        deploymentInfo["PositionUtils"].address = positionUtils.address
    } else {
        positionUtils = PositionUtils.attach(deploymentInfo["PositionUtils"].address)
    }
    console.log(`PositionUtils: ${positionUtils.address}`)

    // Deploy PositionRouter
    let positionRouter;
    const PositionRouter = await ethers.getContractFactory("PositionRouter", { libraries: { PositionUtils: positionUtils.address } })
    if (deploymentInfo["PositionRouter"].address == "") {
        positionRouter = await PositionRouter.deploy(vault.address, router.address, weth.address, shortsTracker.address, 500, 500)
        await positionRouter.deployed()
        deploymentInfo["PositionRouter"].address = positionRouter.address
        deploymentInfo["PositionRouter"].constructorArgs = [vault.address, router.address, weth.address, shortsTracker.address, 500, 500]
    } else {
        positionRouter = PositionRouter.attach(deploymentInfo["PositionRouter"].address)
    }
    console.log(`PositionRouter: ${positionRouter.address}`)

    // -------------------------------
    // POSTDEPLOYMENT CONFIGURATION
    // -------------------------------

    // Configure the vault
    if (deploymentInfo["Vault"].configure == true) {
        console.log("Configuring vault...")
        await vault.initialize(
            router.address,
            usdg.address,
            priceFeed.address,
            deploymentInfo["Vault"].configure_args.liquidationFeeUsd,
            deploymentInfo["Vault"].configure_args.fundingRateFactor,
            deploymentInfo["Vault"].configure_args.stableFundingRateFactor
        )
        await vault.setVaultUtils(vaultUtils.address)
        await vault.setErrorController(vaultErrorController.address)
    }

    // Configure the order book
    if (deploymentInfo["OrderBook"].configure == true) {
        console.log("Configuring order book...")
        await orderBook.initialize(
            router.address,
            vault.address,
            weth.address,
            usdg.address,
            deploymentInfo["OrderBook"].configure_args.minExecutionFee,
            deploymentInfo["OrderBook"].configure_args.minPurchaseTokenAmountUsd,
        )
    }

    // -------------------------------
    // POSTDEPLOYMENT ADMIN
    // -------------------------------

    // Save deployment info
    if (!fs.existsSync(`deployments/${network.chainId}`)) {
        fs.mkdirSync(`deployments/${network.chainId}`);
    }
    const filename = `deployments/${network.chainId}/deployment-${Date.now()}.json`
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 4))

    // Verify contracts
    for (const contractName in deploymentInfo) {
        if (deploymentInfo[contractName].address != "" && deploymentInfo[contractName].verify == true) {
            await run("verify:verify", {
                address: deploymentInfo[contractName].address,
                constructorArguments: deploymentInfo[contractName].constructorArgs,
            })
        } else {
            console.log(`Skipping ${contractName} verification`)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })