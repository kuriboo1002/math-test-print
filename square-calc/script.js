document.addEventListener('DOMContentLoaded', () => {
    const operationTypeRadios = document.querySelectorAll('input[name="operationType"]');
    const calcTypeSelect = document.getElementById('calcType');
    const minVal1Input = document.getElementById('minVal1');
    const maxVal1Input = document.getElementById('maxVal1');
    const minVal2Input = document.getElementById('minVal2');
    const maxVal2Input = document.getElementById('maxVal2');
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn'); // 追加
    const calcGridTable1 = document.getElementById('calcGrid1');
    const calcGridTable2 = document.getElementById('calcGrid2');


    const defaultValues = {
        '1x1': { min1: 1, max1: 10, min2: 1, max2: 10 },
        '2x1': { min1: 11, max1: 20, min2: 1, max2: 10 },
        '2x2': { min1: 11, max1: 20, min2: 11, max2: 20 }
    };

    function updateInputValues(type) {
        const values = defaultValues[type];
        minVal1Input.value = values.min1;
        maxVal1Input.value = values.max1;
        minVal2Input.value = values.min2;
        maxVal2Input.value = values.max2;
    }

    calcTypeSelect.addEventListener('change', (event) => {
        updateInputValues(event.target.value);
    });

    function getSelectedOperationType() {
        for (const radio of operationTypeRadios) {
            if (radio.checked) {
                return radio.value;
            }
        }
        return 'multiply'; // デフォルト
    }

    function getOperationSymbol(operationType) {
        switch (operationType) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'divide': return '÷';
            case 'multiply':
            default: return '×';
        }
    }

    function generateGrid(targetTable) {
        if (!targetTable) {
            console.error('Target table is not defined for generateGrid');
            return;
        }
        const operationType = getSelectedOperationType();
        const min1 = parseInt(minVal1Input.value);
        const max1 = parseInt(maxVal1Input.value);
        const min2 = parseInt(minVal2Input.value);
        const max2 = parseInt(maxVal2Input.value);

        if (isNaN(min1) || isNaN(max1) || isNaN(min2) || isNaN(max2)) {
            alert('最小値と最大値は数値を入力してください。');
            return;
        }
        if (min1 > max1 || min2 > max2) {
            alert('最小値は最大値以下の数値を入力してください。');
            return;
        }
        if (operationType === 'divide') {
            if (min1 === 0 || min2 === 0) {
                alert('除算の場合、0を範囲に含めることはできません。範囲を調整してください。');
                return;
            }
        }


        // 利用可能な範囲でユニークなランダムな数値を生成し、最大10個に制限する関数
        function getRandomNumbers(min, max) {
            const availableNumbersCount = max - min + 1;
            if (availableNumbersCount <= 0) {
                return []; // 不正な範囲の場合は空配列を返す
            }

            const numbers = [];
            for (let i = min; i <= max; i++) {
                numbers.push(i);
            }

            // 配列をシャッフル (Fisher-Yates shuffle)
            for (let i = numbers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
            
            // 利用可能な数値の数が10より少ない場合はその数だけ、多い場合は10個にスライス
            return numbers.slice(0, Math.min(availableNumbersCount, 10));
        }

        const horizontalNumbers = getRandomNumbers(min1, max1);
        const verticalNumbers = getRandomNumbers(min2, max2);

        // テーブルをクリア
        targetTable.innerHTML = '';

        // ヘッダー行を作成 (一番上の行)
        const headerRow = targetTable.insertRow();
        const cornerCell = headerRow.insertCell(); // 左上隅のセル
        cornerCell.classList.add('header-cell');
        cornerCell.textContent = getOperationSymbol(operationType); // 演算記号

        horizontalNumbers.forEach(num => {
            const th = document.createElement('th');
            th.textContent = num;
            headerRow.appendChild(th);
        });

        // データ行を作成
        verticalNumbers.forEach(vNum => {
            const row = targetTable.insertRow();
            const th = document.createElement('th'); // 左端のヘッダーセル
            th.textContent = vNum;
            row.appendChild(th);

            horizontalNumbers.forEach(hNum => {
                const cell = row.insertCell();
                // cell.textContent = calculateResult(hNum, vNum, operationType); // 計算結果を入れる場合
                // 100マス計算なので、解答欄は空にする
            });
        });
    }

    // function calculateResult(num1, num2, operation) {
    //     switch (operation) {
    //         case 'add': return num1 + num2;
    //         case 'subtract': return num1 - num2; // 被減数が常に大きくなるように調整が必要な場合がある
    //         case 'divide':
    //             if (num2 === 0) return 'Error'; // 0除算エラー
    //             // 小数点以下の扱いや、割り切れない場合の処理を考慮する必要がある
    //             return (num1 / num2).toFixed(2); // 例: 小数点第2位まで
    //         case 'multiply':
    //         default: return num1 * num2;
    //     }
    // }

    function generateBothGrids() {
        generateGrid(calcGridTable1);
        generateGrid(calcGridTable2);
    }

    generateBtn.addEventListener('click', generateBothGrids);

    printBtn.addEventListener('click', () => { // 追加
        window.print();
    });

    // operationTypeRadios.forEach(radio => {
    //     radio.addEventListener('change', generateGrid); // ボタン押下時のみ生成に変更
    // });

    // 初期表示時にデフォルト値を設定
    updateInputValues(calcTypeSelect.value);
    // 初期表示時のグリッド生成を削除。ボタン押下時のみ生成する。
    // generateGrid();
});
