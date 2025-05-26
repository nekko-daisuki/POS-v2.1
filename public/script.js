document.addEventListener('DOMContentLoaded', function() {
    // 商品データ (実際にはデータベースやAPIから取得することを想定)
    const menuItems = {
        'lightRoast': { name: '浅煎り', price: 400 },
        'darkRoast': { name: '深煎り', price: 400 },
        'premium': { name: 'プレミアム', price: 500 },
        'decaf': { name: 'デカフェ', price: 400 },
        'iceCoffee': { name: 'アイス', price: 400 },
        'iceLatte': { name: 'アイスオレ', price: 450 },
        'lemonade': { name: 'レモネード', price: 300 },
        'appleJuice': { name: 'アップル', price: 300 },
        'icedTea': { name: 'アイスティ', price: 300 },
        'milk': { name: 'ミルク', price: 300 },
        'chocolate': { name: 'チョコ', price: 150 },
        'cookie': { name: 'クッキー', price: 150 },
        'madeleine': { name: 'マドレーヌ', price: 150 },
        'financier': { name: 'フィナンシェ', price: 150 },
        'dip': { name: 'ディップ', price: 200 },
        'dipx5': { name: 'ディップ ×5', price: 1000 },
        'sticker': { name: 'ステッカー', price: 100 }
    };

    // 注文データを保持する配列
    let orderItems = [];
    let totalAmount = 0;
    let totalCount = 0;
    let receivedAmount = 0;

    // DOM要素の取得
    const orderList = document.getElementById('orderList');
    const orderSummary = document.getElementById('orderSummary');
    const paymentBtn = document.getElementById('paymentBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const productButtons = document.querySelectorAll('.product-button');
    const paymentScreen = document.getElementById('paymentScreen');
    const paymentTotal = document.getElementById('paymentTotal');
    const receivedAmountDisplay = document.getElementById('receivedAmount');
    const numKeys = document.querySelectorAll('.num-key');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
    const completeBtn = document.getElementById('completeBtn');

    // ★修正: 履歴ボタンはHTMLのサイドメニューに移動したので、動的に作成するコードは削除します。
    // const historyBtn = document.createElement('button');
    // historyBtn.className = 'btn btn-history';
    // historyBtn.textContent = '履歴';
    // historyBtn.id = 'historyBtn';
    // document.querySelector('.action-buttons').appendChild(historyBtn);


    // ★追加: ハンバーガーメニュー関連の要素取得
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');


    // 会計画面が最初から表示されないようにする
    paymentScreen.classList.add('hidden');

    // ★追加: ハンバーガーメニューのクリックイベント
    hamburgerMenu.addEventListener('click', function() {
        hamburgerMenu.classList.toggle('open');
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    // ★追加: オーバーレイのクリックイベント (メニューを閉じる)
    overlay.addEventListener('click', function() {
        hamburgerMenu.classList.remove('open');
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });


    // メニューアイテムのクリックイベント
    productButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-item-id');
            if (itemId && menuItems[itemId]) {
                const item = menuItems[itemId];
                const itemName = item.name;
                const itemPrice = item.price;

                const existingItemIndex = orderItems.findIndex(orderItem => orderItem.name === itemName);

                if (existingItemIndex !== -1) {
                    orderItems[existingItemIndex].quantity++;
                } else {
                    orderItems.push({
                        name: itemName,
                        price: itemPrice,
                        quantity: 1
                    });
                }

                updateOrderList();
            }
        });
    });

    // 注文リストの更新関数
    function updateOrderList() {
        orderList.innerHTML = '';

        totalAmount = 0;
        totalCount = 0;

        orderItems.forEach((item, index) => {
            const orderItemElement = document.createElement('div');
            orderItemElement.className = 'order-item';

            const nameElement = document.createElement('div');
            nameElement.className = 'item-name';
            nameElement.textContent = `${item.name}`;

            const quantityControl = document.createElement('div');
            quantityControl.className = 'item-quantity-control';

            const minusBtn = document.createElement('button');
            minusBtn.className = 'quantity-button';
            minusBtn.textContent = '-';
            minusBtn.addEventListener('click', function() {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    orderItems.splice(index, 1);
                }
                updateOrderList();
            });

            const quantityDisplay = document.createElement('div');
            quantityDisplay.className = 'quantity-display';
            quantityDisplay.textContent = item.quantity;

            const plusBtn = document.createElement('button');
            plusBtn.className = 'quantity-button';
            plusBtn.textContent = '+';
            plusBtn.addEventListener('click', function() {
                item.quantity++;
                updateOrderList();
            });

            quantityControl.appendChild(minusBtn);
            quantityControl.appendChild(quantityDisplay);
            quantityControl.appendChild(plusBtn);

            orderItemElement.appendChild(nameElement);
            orderItemElement.appendChild(quantityControl);

            orderList.appendChild(orderItemElement);

            totalAmount += item.price * item.quantity;
            totalCount += item.quantity;
        });

        orderSummary.textContent = `${totalCount}点 合計 ¥${totalAmount}`;
    }

    // 注文取り消しボタンのクリックイベント
    cancelOrderBtn.addEventListener('click', function() {
        orderItems = [];
        updateOrderList();
    });

    // 支払いボタンのクリックイベント
    paymentBtn.addEventListener('click', function() {
        if (orderItems.length === 0) {
            alert('注文アイテムがありません');
            return;
        }

        paymentScreen.classList.remove('hidden');
        paymentTotal.textContent = `合計 ¥${totalAmount}`;
        receivedAmount = 0;
        updatePaymentDisplay();
    });

    // 数字キーパッドのクリックイベント
    numKeys.forEach(key => {
        key.addEventListener('click', function() {
            const keyValue = this.textContent;

            if (keyValue === 'C') {
                receivedAmount = 0;
            } else if (keyValue === '00') {
                receivedAmount = receivedAmount * 100;
            } else {
                receivedAmount = receivedAmount * 10 + parseInt(keyValue);
            }

            updatePaymentDisplay();
        });
    });

    // 支払い表示の更新関数
    function updatePaymentDisplay() {
        receivedAmountDisplay.textContent = `¥${receivedAmount}`;
        const change = receivedAmount - totalAmount;

        if (change < 0) {
            completeBtn.disabled = true;
            completeBtn.style.opacity = 0.5;
        } else {
            completeBtn.disabled = false;
            completeBtn.style.opacity = 1;
        }
    }

    // 支払いキャンセルボタンのクリックイベント
    cancelPaymentBtn.addEventListener('click', function() {
        paymentScreen.classList.add('hidden');
    });

    // 会計完了ボタンのクリックイベント
    completeBtn.addEventListener('click', function() {
        if (receivedAmount < totalAmount) {
            alert('預り金額が不足しています');
            return;
        }

        const changeAmount = receivedAmount - totalAmount;

        // 注文履歴をローカルストレージに保存
        const orderRecord = {
            timestamp: new Date().toISOString(),
            items: orderItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
            totalAmount: totalAmount,
            totalCount: totalCount,
            receivedAmount: receivedAmount,
            changeAmount: changeAmount
        };
        saveOrderToHistory(orderRecord);

        // スプレッドシートに送信する処理
        try {
            saveToSpreadsheet();

            orderItems = [];
            updateOrderList();

            paymentScreen.classList.add('hidden');

            alert('支払いが完了しました。\nおつり：¥' + changeAmount);
        } catch (error) {
            alert('エラーが発生しました: ' + error.message);
        }
    });

    // スプレッドシートに送信する関数
    function saveToSpreadsheet() {
        fetch('https://script.google.com/macros/s/AKfycby4Q9CaF1tSf3HsdS2aHIZOIfTZBKLutsSJwtq2WD8ZiVAL-aZR3WFpWbBYh8Xgym6d/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    items: orderItems,
                    totalAmount: totalAmount,
                    totalCount: totalCount,
                    receivedAmount: receivedAmount,
                    changeAmount: receivedAmount - totalAmount
                })
            })
            .then(response => console.log('注文データを送信しました'))
            .catch(error => console.error('エラー:', error));
    }

    // 注文履歴をローカルストレージに保存する関数
    function saveOrderToHistory(order) {
        let history = JSON.parse(localStorage.getItem('posOrderHistory')) || [];
        history.push(order);
        localStorage.setItem('posOrderHistory', JSON.stringify(history));
    }

    // ★修正: 履歴ボタンのクリックイベントはHTMLのサイドメニューに移動したので、このイベントリスナーは削除します。
    // historyBtn.addEventListener('click', function() {
    //     window.location.href = 'history.html';
    // });
});