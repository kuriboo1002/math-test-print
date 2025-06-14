document.addEventListener('DOMContentLoaded', () => {
    const gradeSelect = document.getElementById('grade');
    const topicSelect = document.getElementById('topicSelect'); // 単元選択プルダウン
    // const numQuestionsSelect = document.getElementById('numQuestions'); // 削除
    const fillInTheBlankCheckbox = document.getElementById('fillInTheBlank');
    const generateButton = document.getElementById('generateButton');
    const printButton = document.getElementById('printButton');
    const printAnswersButton = document.getElementById('printAnswersButton');
    const problemsArea = document.getElementById('problemsArea'); // これは .problems-container を指す
    const printHeaderInfo = document.getElementById('printHeaderInfo'); 

    const NUM_QUESTIONS_TOTAL = 20; // 問題数を20問に固定
    const NUM_QUESTIONS_PER_COLUMN = 10;

    const curriculum = {
        '1': {
            'たし算とひき算 (基本)': ['1位数同士のたし算', '1位数同士のひき算'],
            'たし算とひき算 (応用)': ['2位数と1位数のたし算 (簡単)', '2位数と1位数のひき算 (簡単)']
        },
        '2': {
            'たし算とひき算 (筆算)': ['2位数のたし算 (筆算)', '2位数のひき算 (筆算)', '3位数のたし算 (簡単)', '3位数のひき算 (簡単)'],
            'かけ算': ['かけ算 (九九)', '2位数と1位数のかけ算 (簡単)']
        },
        '3': {
            'たし算とひき算 (発展)': ['3・4位数のたし算', '3・4位数のひき算'],
            'かけ算 (発展)': ['2・3位数と1・2位数のかけ算'],
            'わり算': ['わり算 (わる数1位数、あまりあり/なし)'],
            '小数': ['小数第一位のたし算', '小数第一位のひき算'],
            '分数': ['分数のたし算 (簡単、同分母)', '分数のひき算 (簡単、同分母)']
        },
        '4': {
            'わり算 (発展)': ['整数のわり算 (わる数1・2位数、被除数2・3位数)'],
            '小数 (発展)': ['小数のたし算 (発展)', '小数のひき算 (発展)', '小数のかけ算 (かける数整数)', '小数のわり算 (わる数整数)'],
            '分数 (同分母)': ['同分母分数のたし算', '同分母分数のひき算']
        },
        '5': {
            '小数のかけ算とわり算': ['小数のかけ算 (かける数小数)', '小数のわり算 (わる数小数)'],
            '分数 (異分母)': ['異分母分数のたし算', '異分母分数のひき算'],
            '分数のかけ算とわり算 (基本)': ['分数のかけ算 (かける数整数)', '分数のわり算 (わる数整数)']
        },
        '6': {
            '分数のかけ算とわり算 (発展)': ['分数のかけ算 (かける数分数)', '分数のわり算 (わる数分数)'],
            '小数と分数の計算': ['小数と分数の混合計算']
        }
    };

    function updateTopicSelect() {
        const selectedGrade = gradeSelect.value;
        const topicsForGrade = curriculum[selectedGrade];
        topicSelect.innerHTML = '<option value="all">すべての単元</option>';
        if (topicsForGrade) {
            for (const topicName in topicsForGrade) {
                const option = document.createElement('option');
                option.value = topicName;
                option.textContent = topicName;
                topicSelect.appendChild(option);
            }
        }
    }

    gradeSelect.addEventListener('change', updateTopicSelect);
    updateTopicSelect();

    function setPrintHeader() {
        const gradeText = gradeSelect.options[gradeSelect.selectedIndex].text;
        const topicValue = topicSelect.value;
        let topicText = topicValue === 'all' ? 'すべての単元' : topicSelect.options[topicSelect.selectedIndex].text;
        printHeaderInfo.textContent = `学年: ${gradeText} | 単元: ${topicText}`;
    }

    generateButton.addEventListener('click', () => {
        const grade = parseInt(gradeSelect.value);
        const selectedTopicKey = topicSelect.value;
        const useFillInTheBlank = fillInTheBlankCheckbox.checked;
        generateProblems(grade, selectedTopicKey, NUM_QUESTIONS_TOTAL, useFillInTheBlank);
    });

    printButton.addEventListener('click', () => {
        setPrintHeader();
        problemsArea.classList.remove('print-with-answers');
        window.print();
    });

    printAnswersButton.addEventListener('click', () => {
        setPrintHeader();
        problemsArea.classList.add('print-with-answers'); 
        window.print();
        setTimeout(() => {
            problemsArea.classList.remove('print-with-answers'); 
        }, 100); 
    });

    function generateProblems(grade, selectedTopicKey, numQuestions, useFillInTheBlank) {
        setPrintHeader();
        const column1 = document.getElementById('problem-column-1');
        const column2 = document.getElementById('problem-column-2');
        column1.innerHTML = '';
        column2.innerHTML = '';
        problemsArea.classList.remove('print-with-answers');

        const gradeTopics = curriculum[String(grade)];
        if (!gradeTopics) {
            column1.innerHTML = '<p>選択された学年のデータが見つかりません。</p>';
            return;
        }

        let availableProblemTypes = [];
        if (selectedTopicKey === 'all') {
            for (const topicName in gradeTopics) {
                availableProblemTypes = availableProblemTypes.concat(gradeTopics[topicName]);
            }
        } else if (gradeTopics[selectedTopicKey]) {
            availableProblemTypes = gradeTopics[selectedTopicKey];
        } else {
            column1.innerHTML = '<p>選択された単元のデータが見つかりません。</p>';
            return;
        }

        availableProblemTypes = availableProblemTypes.filter(type => type);
        if (availableProblemTypes.length === 0) {
            column1.innerHTML = `<p>選択された学年・単元の問題タイプが定義されていません。</p>`;
            return;
        }

        const generatedQuestions = new Set();
        let generatedCount = 0;
        const maxAttemptsPerQuestionType = 30;

        for (let i = 0; i < numQuestions; i++) { 
            let question = '';
            let answer = '';
            let problemType = '';
            let uniqueProblemFound = false;
            let attemptsForThisQuestion = 0;
            let originalCalculationResult = null;

            while (!uniqueProblemFound && attemptsForThisQuestion < maxAttemptsPerQuestionType * availableProblemTypes.length) {
                problemType = availableProblemTypes[Math.floor(Math.random() * availableProblemTypes.length)];
                let num1 = Math.floor(Math.random() * (grade * 10)) + 1;
                let num2 = Math.floor(Math.random() * (grade * 5)) + 1;

                if (problemType.includes('1位数')) {
                    num1 = Math.floor(Math.random() * 9) + 1;
                    num2 = Math.floor(Math.random() * 9) + 1;
                }

                switch (problemType) {
                    case '1位数同士のたし算':
                    case '2位数と1位数のたし算 (簡単)':
                        num1 = (problemType === '1位数同士のたし算') ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 90) + 10;
                        num2 = Math.floor(Math.random() * 9) + 1;
                        if (problemType === '1位数同士のたし算' && num1 + num2 >= 10) {
                             if (num1 > num2) num2 = Math.floor(Math.random() * (9-num1)) +1; else num1 = Math.floor(Math.random() * (9-num2)) +1;
                        }
                        answer = num1 + num2;
                        question = `${num1} + ${num2} = `;
                        break;
                    case '1位数同士のひき算':
                    case '2位数と1位数のひき算 (簡単)':
                        let n1_h = (problemType === '1位数同士のひき算') ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 90) + 10;
                        let n2_h = Math.floor(Math.random() * 9) + 1;
                        if (n1_h < n2_h) [n1_h, n2_h] = [n2_h, n1_h];
                        if (problemType === '1位数同士のひき算' && String(n1_h - n2_h).length > 1 && n2_h > n1_h % 10) {
                            n2_h = Math.floor(Math.random() * (n1_h % 10)) +1;
                        }
                        answer = n1_h - n2_h;
                        question = `${n1_h} - ${n2_h} = `;
                        break;
                    case '2位数のたし算 (筆算)':
                    case '3位数のたし算 (簡単)':
                        num1 = (problemType === '2位数のたし算 (筆算)') ? Math.floor(Math.random() * 90) + 10 : Math.floor(Math.random() * 900) + 100;
                        num2 = (problemType === '2位数のたし算 (筆算)') ? Math.floor(Math.random() * 90) + 10 : Math.floor(Math.random() * (num1 > 200 ? 90 : 900)) + (num1 > 200 ? 10 : 100) ;
                        answer = num1 + num2;
                        question = `${num1} + ${num2} = `;
                        break;
                    case '2位数のひき算 (筆算)':
                    case '3位数のひき算 (簡単)':
                        let n1_h2 = (problemType === '2位数のひき算 (筆算)') ? Math.floor(Math.random() * 90) + 10 : Math.floor(Math.random() * 900) + 100;
                        let n2_h2 = (problemType === '2位数のひき算 (筆算)') ? Math.floor(Math.random() * 90) + 10 : Math.floor(Math.random() * (n1_h2 > 200 ? 90 : n1_h2-1)) + (n1_h2 > 200 ? 10 : 1) ;
                        if (n1_h2 < n2_h2) [n1_h2, n2_h2] = [n2_h2, n1_h2];
                         answer = n1_h2 - n2_h2;
                        question = `${n1_h2} - ${n2_h2} = `;
                        break;
                    case 'かけ算 (九九)':
                    case '2位数と1位数のかけ算 (簡単)':
                        num1 = (problemType === 'かけ算 (九九)') ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 90) + 10;
                        num2 = (problemType === 'かけ算 (九九)') ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 9) + 1;
                        answer = num1 * num2;
                        question = `${num1} × ${num2} = `;
                        break;
                    case '3・4位数のたし算':
                        num1 = Math.floor(Math.random() * 9000) + 100;
                        num2 = Math.floor(Math.random() * 9000) + 100;
                        answer = num1 + num2;
                        question = `${num1} + ${num2} = `;
                        break;
                    case '3・4位数のひき算':
                        num1 = Math.floor(Math.random() * 9000) + 100;
                        num2 = Math.floor(Math.random() * num1) + 100;
                        answer = num1 - num2;
                        question = `${num1} - ${num2} = `;
                        break;
                    case '2・3位数と1・2位数のかけ算':
                        num1 = Math.floor(Math.random() * 900) + 10;
                        num2 = Math.floor(Math.random() * 90) + 1;
                        answer = num1 * num2;
                        question = `${num1} × ${num2} = `;
                        break;
                    case 'わり算 (わる数1位数、あまりあり/なし)':
                        const dividend = Math.floor(Math.random() * 90) + 10;
                        const divisor = Math.floor(Math.random() * 9) + 1;
                        const quotient = Math.floor(dividend / divisor);
                        const remainder = dividend % divisor;
                        answer = remainder === 0 ? `${quotient}` : `${quotient} あまり ${remainder}`;
                        question = `${dividend} ÷ ${divisor} = `;
                        break;
                    case '小数第一位のたし算':
                        num1 = parseFloat(((Math.random() * 89) + 1) / 10 .toFixed(1)); 
                        num2 = parseFloat(((Math.random() * 89) + 1) / 10 .toFixed(1));
                        if(num1 % 1 === 0) num1 = parseFloat((num1 + 0.1).toFixed(1)); 
                        if(num2 % 1 === 0) num2 = parseFloat((num2 + 0.1).toFixed(1));
                        answer = Math.round((num1 + num2) * 10) / 10;
                        question = `${num1.toFixed(1)} + ${num2.toFixed(1)} = `;
                        break;
                    case '小数第一位のひき算':
                        let dec1_sub = parseFloat(((Math.random() * 89) + 1) / 10 .toFixed(1));
                        let dec2_sub = parseFloat(((Math.random() * 89) + 1) / 10 .toFixed(1));
                        if(dec1_sub % 1 === 0) dec1_sub = parseFloat((dec1_sub + 0.1).toFixed(1));
                        if(dec2_sub % 1 === 0) dec2_sub = parseFloat((dec2_sub + 0.1).toFixed(1));
                        if (dec1_sub < dec2_sub) [dec1_sub, dec2_sub] = [dec2_sub, dec1_sub];
                        answer = Math.round((dec1_sub - dec2_sub) * 10) / 10;
                        question = `${dec1_sub.toFixed(1)} - ${dec2_sub.toFixed(1)} = `;
                        break;
                    case '分数のたし算 (簡単、同分母)':
                    case '分数のひき算 (簡単、同分母)':
                        const den_s = Math.floor(Math.random() * 8) + 2;
                        let num1_s = Math.floor(Math.random() * (den_s -1)) + 1;
                        let num2_s = Math.floor(Math.random() * (den_s -1)) + 1;
                        if (problemType.includes('ひき算') && num1_s < num2_s) [num1_s, num2_s] = [num2_s, num1_s];
                        const sum_s = num1_s + num2_s;
                        const diff_s = num1_s - num2_s;
                        answer = problemType.includes('たし算') ? `$\\frac{${sum_s}}{${den_s}}$` : `$\\frac{${diff_s}}{${den_s}}$`;
                        if (problemType.includes('ひき算') && diff_s === 0) answer = "0";
                        else if (problemType.includes('たし算') && sum_s === den_s) answer = "1";
                        else if (problemType.includes('ひき算') && diff_s === den_s) answer = "1";
                        question = `$\\frac{${num1_s}}{${den_s}}$ ${problemType.includes('たし算') ? '+' : '-'} $\\frac{${num2_s}}{${den_s}}$ = `;
                        break;
                    case '整数のわり算 (わる数1・2位数、被除数2・3位数)':
                        const div_4_dividend = Math.floor(Math.random() * 900) + 10;
                        const div_4_divisor = Math.floor(Math.random() * 90) + (Math.random() < 0.5 ? 1 : 10) ;
                        const quot_4 = Math.floor(div_4_dividend / div_4_divisor);
                        const rem_4 = div_4_dividend % div_4_divisor;
                        answer = rem_4 === 0 ? `${quot_4}` : `${quot_4} あまり ${rem_4}`;
                        question = `${div_4_dividend} ÷ ${div_4_divisor} = `;
                        break;
                    case '小数のたし算 (発展)':
                    case '小数のひき算 (発展)':
                        num1 = parseFloat(((Math.random() * 998) + 1) / 10 .toFixed(1)); 
                        num2 = parseFloat(((Math.random() * 998) + 1) / 10 .toFixed(1));
                        if (num1 % 1 === 0) num1 = parseFloat((num1 + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                        if (num2 % 1 === 0) num2 = parseFloat((num2 + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                        if (problemType.includes('ひき算') && num1 < num2) [num1, num2] = [num2, num1];
                        answer = problemType.includes('たし算') ? Math.round((num1 + num2)*10)/10 : Math.round((num1 - num2)*10)/10;
                        question = `${num1.toFixed(1)} ${problemType.includes('たし算') ? '+' : '-'} ${num2.toFixed(1)} = `;
                        break;
                    case '小数のかけ算 (かける数整数)':
                        num1 = parseFloat(((Math.random() * 98) + 1) / 10 .toFixed(1)); 
                        if (num1 % 1 === 0) { 
                           num1 = parseFloat((num1 + (Math.floor(Math.random() * 9) + 1) / 10).toFixed(1));
                           if (num1 >= 10.0) num1 = parseFloat((num1 - 1).toFixed(1)); 
                           num1 = Math.max(0.1, num1);
                        }
                        num2 = Math.floor(Math.random() * 9) + 1; 
                        answer = Math.round(num1 * num2 * 100) / 100;
                        question = `${num1.toFixed(1)} × ${num2} = `;
                        break;
                    case '小数のわり算 (わる数整数)':
                        let dec_div_dividend = parseFloat(((Math.random() * 998) + 1) / 10 .toFixed(1)); 
                        if (dec_div_dividend % 1 === 0) {
                            dec_div_dividend = parseFloat((dec_div_dividend + (Math.floor(Math.random() * 9) + 1) / 10).toFixed(1));
                            dec_div_dividend = Math.max(0.1, dec_div_dividend);
                        }
                        let dec_div_divisor = Math.floor(Math.random() * 9) + 1;
                        if (Math.random() < 0.7) { 
                           let temp_quotient_int = Math.floor(Math.random()*10)+1;
                           dec_div_dividend = parseFloat((temp_quotient_int * dec_div_divisor).toFixed(1));
                           if (dec_div_dividend % 1 === 0 || String(dec_div_dividend).split('.')[1] === '0') {
                               dec_div_dividend = parseFloat((dec_div_dividend + (Math.floor(Math.random()*8)+1)/10).toFixed(1));
                           }
                           dec_div_dividend = Math.max(0.1, parseFloat(dec_div_dividend.toFixed(1)));
                        }
                        answer = Math.round((dec_div_dividend / dec_div_divisor) * 1000) / 1000; 
                        question = `${dec_div_dividend.toFixed(1)} ÷ ${dec_div_divisor} = `;
                        break;
                    case '同分母分数のたし算':
                    case '同分母分数のひき算':
                        const den_4 = Math.floor(Math.random() * 18) + 2;
                        let num1_4 = Math.floor(Math.random() * (den_4 -1)) + 1;
                        let num2_4 = Math.floor(Math.random() * (den_4 -1)) + 1;
                        if (problemType.includes('ひき算') && num1_4 < num2_4) [num1_4, num2_4] = [num2_4, num1_4];
                        const sum_4 = num1_4 + num2_4;
                        const diff_4 = num1_4 - num2_4;
                        answer = problemType.includes('たし算') ? `$\\frac{${sum_4}}{${den_4}}$` : `$\\frac{${diff_4}}{${den_4}}$`;
                        if (problemType.includes('ひき算') && diff_4 === 0) answer = "0";
                        else if (problemType.includes('たし算') && sum_4 === den_4) answer = "1";
                        else if (problemType.includes('ひき算') && diff_4 === den_4) answer = "1";
                        question = `$\\frac{${num1_4}}{${den_4}}$ ${problemType.includes('たし算') ? '+' : '-'} $\\frac{${num2_4}}{${den_4}}$ = `;
                        break;
                    case '小数のかけ算 (かける数小数)':
                        num1 = parseFloat(((Math.random() * 98) + 1) / 10 .toFixed(1)); 
                        num2 = parseFloat(((Math.random() * 98) + 1) / 10 .toFixed(1));
                        if (num1 % 1 === 0) num1 = parseFloat((num1 + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                        if (num2 % 1 === 0) num2 = parseFloat((num2 + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                        answer = Math.round(num1 * num2 * 100) / 100;
                        question = `${num1.toFixed(1)} × ${num2.toFixed(1)} = `;
                        break;
                    case '小数のわり算 (わる数小数)':
                        let dec5_div_dividend = parseFloat(((Math.random() * 998) + 1) / 10 .toFixed(1));
                        let dec5_div_divisor = parseFloat(((Math.random() * 98) + 1) / 10 .toFixed(1));
                        if (dec5_div_dividend % 1 === 0) dec5_div_dividend = parseFloat((dec5_div_dividend + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                        if (dec5_div_divisor % 1 === 0 || dec5_div_divisor === 0) {
                            dec5_div_divisor = parseFloat((dec5_div_divisor + ((Math.floor(Math.random()*8)+1)/10)).toFixed(1));
                            dec5_div_divisor = Math.max(0.1, dec5_div_divisor);
                        }
                        if (Math.random() < 0.5) {
                            let tempQuotient = Math.floor(Math.random()*9)+1; 
                            dec5_div_dividend = parseFloat((dec5_div_divisor * tempQuotient).toFixed(2)); 
                             if(dec5_div_dividend % 1 === 0) dec5_div_dividend = parseFloat((dec5_div_dividend + (Math.floor(Math.random()*8)+1)/10).toFixed(1));
                        }
                        answer = Math.round((dec5_div_dividend / dec5_div_divisor) * 1000) / 1000;
                        question = `${dec5_div_dividend.toFixed(1)} ÷ ${dec5_div_divisor.toFixed(1)} = `;
                        break;
                    case '異分母分数のたし算':
                    case '異分母分数のひき算':
                        let d1_異 = Math.floor(Math.random() * 5) + 2;
                        let d2_異 = Math.floor(Math.random() * 5) + 2;
                        while (d1_異 === d2_異) { d2_異 = Math.floor(Math.random() * 5) + 2; }
                        let n1_異 = Math.floor(Math.random() * (d1_異 - 1)) + 1;
                        let n2_異 = Math.floor(Math.random() * (d2_異 - 1)) + 1;
                        const commonDen_異 = d1_異 * d2_異;
                        const new_n1_異 = n1_異 * d2_異;
                        const new_n2_異 = n2_異 * d1_異;
                        let ans_num_異, ans_den_異;
                        if (problemType.includes('たし算')) {
                            ans_num_異 = new_n1_異 + new_n2_異;
                        } else {
                            if (new_n1_異 < new_n2_異) {
                                [n1_異, d1_異, n2_異, d2_異] = [n2_異, d2_異, n1_異, d1_異];
                                ans_num_異 = (n1_異 * d2_異) - (n2_異 * d1_異);
                            } else {
                                ans_num_異 = new_n1_異 - new_n2_異;
                            }
                        }
                        ans_den_異 = commonDen_異;
                        answer = `$\\frac{${ans_num_異}}{${ans_den_異}}$`;
                        if (ans_num_異 === 0) answer = "0";
                        else if (ans_num_異 === ans_den_異) answer = "1";
                        question = `$\\frac{${n1_異}}{${d1_異}}$ ${problemType.includes('たし算') ? '+' : '-'} $\\frac{${n2_異}}{${d2_異}}$ = `;
                        break;
                    case '分数のかけ算 (かける数整数)':
                    case '分数のわり算 (わる数整数)':
                        const den_frac_int = Math.floor(Math.random() * 8) + 2;
                        const num_frac_int = Math.floor(Math.random() * (den_frac_int -1)) + 1;
                        const int_val = Math.floor(Math.random() * 8) + 2;
                        let ans_num_fi, ans_den_fi;
                        if (problemType.includes('かけ算')) {
                            ans_num_fi = num_frac_int * int_val;
                            ans_den_fi = den_frac_int;
                        } else {
                            ans_num_fi = num_frac_int;
                            ans_den_fi = den_frac_int * int_val;
                        }
                        answer = `$\\frac{${ans_num_fi}}{${ans_den_fi}}$`;
                        const operator_fi = problemType.includes('かけ算') ? '×' : '÷';
                        question = `$\\frac{${num_frac_int}}{${den_frac_int}}$ ${operator_fi} ${int_val} = `;
                        break;
                    case '分数のかけ算 (かける数分数)':
                    case '分数のわり算 (わる数分数)':
                        const d1_ff = Math.floor(Math.random() * 8) + 2;
                        const n1_ff = Math.floor(Math.random() * (d1_ff - 1)) + 1;
                        const d2_ff = Math.floor(Math.random() * 8) + 2;
                        const n2_ff = Math.floor(Math.random() * (d2_ff - 1)) + 1;
                        let ans_num_ff, ans_den_ff;
                        if (problemType.includes('かけ算')) {
                            ans_num_ff = n1_ff * n2_ff;
                            ans_den_ff = d1_ff * d2_ff;
                        } else {
                            ans_num_ff = n1_ff * d2_ff;
                            ans_den_ff = d1_ff * n2_ff;
                        }
                        answer = `$\\frac{${ans_num_ff}}{${ans_den_ff}}$`;
                        const operator_ff = problemType.includes('かけ算') ? '×' : '÷';
                        question = `$\\frac{${n1_ff}}{${d1_ff}}$ ${operator_ff} $\\frac{${n2_ff}}{${d2_ff}}$ = `;
                        break;
                    case '小数と分数の混合計算':
                        const decOrFracFirst = Math.random() < 0.5;
                        let dec_mixed_val = 0;
                        while(dec_mixed_val % 1 === 0 || dec_mixed_val === 0) { dec_mixed_val = parseFloat(((Math.random() * 89) + 1) / 10 .toFixed(1));}
                        const frac_den_mixed = [2, 4, 5, 8, 10][Math.floor(Math.random()*5)];
                        const frac_num_mixed = Math.floor(Math.random() * (frac_den_mixed - 1)) + 1;
                        const operator_mixed = Math.random() < 0.5 ? '+' : '-';
                        let val1_mixed, val2_mixed;
                        let q_val1_mixed, q_val2_mixed;
                        if (decOrFracFirst) {
                            q_val1_mixed = `${dec_mixed_val.toFixed(1)}`;
                            q_val2_mixed = `$\\frac{${frac_num_mixed}}{${frac_den_mixed}}$`;
                            val1_mixed = dec_mixed_val;
                            val2_mixed = frac_num_mixed / frac_den_mixed;
                        } else {
                            q_val1_mixed = `$\\frac{${frac_num_mixed}}{${frac_den_mixed}}$`;
                            q_val2_mixed = `${dec_mixed_val.toFixed(1)}`;
                            val1_mixed = frac_num_mixed / frac_den_mixed;
                            val2_mixed = dec_mixed_val;
                        }
                        let ans_mixed_val;
                        if (operator_mixed === '+') {
                            ans_mixed_val = val1_mixed + val2_mixed;
                        } else {
                            if (val1_mixed < val2_mixed) {
                                [q_val1_mixed, q_val2_mixed] = [q_val2_mixed, q_val1_mixed];
                                ans_mixed_val = Math.max(val1_mixed, val2_mixed) - Math.min(val1_mixed, val2_mixed);
                            } else {
                                ans_mixed_val = val1_mixed - val2_mixed;
                            }
                        }
                        answer = `${parseFloat(ans_mixed_val.toFixed(3))}`;
                        question = `${q_val1_mixed} ${operator_mixed} ${q_val2_mixed} = `;
                        break;
                    default:
                        console.warn(`未対応の問題タイプ: ${problemType}。スキップします。`);
                        attemptsForThisQuestion++;
                        continue;
                }
                originalCalculationResult = answer;

                if (useFillInTheBlank && Math.random() < 0.5 && !problemType.includes('混合計算') && !problemType.includes('比')) { 
                    let tempQuestionStr = question.substring(0, question.lastIndexOf('=') + 1);
                    let parts = tempQuestionStr.split(/([+\-×÷])/); 
                    
                    if (parts.length >= 3) {
                        const operand1_str = parts[0].trim();
                        const operator_str = parts[1].trim();
                        const operand2_str = parts[2].trim().replace('=', '').trim();
                        const blankBoxHtml = '<span class="fill-in-box"></span>';
                        const makeOperand1Blank = Math.random() < 0.5;

                        if (makeOperand1Blank && operand1_str !== originalCalculationResult.toString()) {
                            question = `${blankBoxHtml} ${operator_str} ${operand2_str} = ${originalCalculationResult}`;
                            answer = operand1_str.includes('frac') ? operand1_str : parseFloat(operand1_str); 
                        } else if (!makeOperand1Blank && operand2_str !== originalCalculationResult.toString()) {
                            question = `${operand1_str} ${operator_str} ${blankBoxHtml} = ${originalCalculationResult}`;
                            answer = operand2_str.includes('frac') ? operand2_str : parseFloat(operand2_str); 
                        } else {
                             answer = originalCalculationResult; 
                        }
                    } else {
                        answer = originalCalculationResult; 
                    }
                }


                if (!generatedQuestions.has(question)) {
                    generatedQuestions.add(question);
                    uniqueProblemFound = true;
                }
                attemptsForThisQuestion++;
            }

            if (!uniqueProblemFound) {
                console.warn(`ユニークな問題の生成に失敗しました。問題タイプ: ${problemType}。重複を許容します。`);
            }
            
            if (question && (answer !== '' && answer !== undefined)) {
                const problemDiv = document.createElement('div');
                problemDiv.classList.add('problem-item');
                problemDiv.innerHTML = `<strong>問 ${generatedCount + 1}:</strong> ${question} <span class="answer-text">${answer}</span> <!-- 答え(コメント): ${answer} -->`;
                
                if (generatedCount < NUM_QUESTIONS_PER_COLUMN) {
                    column1.appendChild(problemDiv);
                } else {
                    column2.appendChild(problemDiv);
                }
                generatedCount++;

            } else if (generatedCount < numQuestions && attemptsForThisQuestion >= maxAttemptsPerQuestionType * availableProblemTypes.length) {
                const targetColumn = generatedCount < NUM_QUESTIONS_PER_COLUMN ? column1 : column2;
                targetColumn.innerHTML += `<p>問題${generatedCount + 1}の生成に失敗しました。異なる設定でお試しください。</p>`;
                break; 
            }
        }
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([column1, column2]).catch((err) => console.error('MathJax typesetting error:', err));
        }
    }
});
