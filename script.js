class DoubleStackCalculator {
    constructor() {
        this.numStack = [];
        this.opStack = [];
        this.steps = [];
        this.currentStepIndex = 0;
        this.expression = '';
    }

    generateSteps(expression) {
        this.expression = expression;
        this.steps = [];
        this.numStack = [];
        this.opStack = [];
        
        let res = 0;
        let sign = 1;
        const n = expression.length;

        for (let i = 0; i < n; i++) {
            const c = expression[i];

            if (c === ' ') {
                continue;
            }

            if (!isNaN(c)) {
                let num = 0;
                while (i < n && !isNaN(expression[i])) {
                    num = num * 10 + parseInt(expression[i]);
                    i++;
                }
                i--;
                const oldRes = res;
                res += sign * num;
                this.steps.push({
                    type: 'add',
                    num: num,
                    sign: sign,
                    oldRes: oldRes,
                    newRes: res,
                    description: `遇到数字 ${num}，累加结果：${oldRes} + (${sign} * ${num}) = ${res}`,
                    numStack: [...this.numStack],
                    opStack: [...this.opStack],
                    currentRes: res
                });
            } else if (c === '+') {
                sign = 1;
                this.steps.push({
                    type: 'sign',
                    sign: sign,
                    description: '遇到加号，设置符号为 +1',
                    numStack: [...this.numStack],
                    opStack: [...this.opStack],
                    currentRes: res
                });
            } else if (c === '-') {
                sign = -1;
                this.steps.push({
                    type: 'sign',
                    sign: sign,
                    description: '遇到减号，设置符号为 -1',
                    numStack: [...this.numStack],
                    opStack: [...this.opStack],
                    currentRes: res
                });
            } else if (c === '(') {
                this.numStack.push(res);
                this.opStack.push(sign);
                const savedRes = res;
                const savedSign = sign;
                res = 0;
                sign = 1;
                this.steps.push({
                    type: 'leftParen',
                    savedRes: savedRes,
                    savedSign: savedSign,
                    description: `遇到左括号，压栈保存结果 ${savedRes} 和符号 ${savedSign}，重置现场`,
                    numStack: [...this.numStack],
                    opStack: [...this.opStack],
                    currentRes: res
                });
            } else if (c === ')') {
                const poppedRes = this.numStack.pop();
                const poppedSign = this.opStack.pop();
                const oldRes = res;
                res = poppedRes + poppedSign * res;
                this.steps.push({
                    type: 'rightParen',
                    poppedRes: poppedRes,
                    poppedSign: poppedSign,
                    oldRes: oldRes,
                    newRes: res,
                    description: `遇到右括号，合并结果：${poppedRes} + (${poppedSign} * ${oldRes}) = ${res}`,
                    numStack: [...this.numStack],
                    opStack: [...this.opStack],
                    currentRes: res
                });
            }
        }

        this.steps.push({
            type: 'finish',
            result: res,
            description: `计算完成，结果为 ${res}`,
            numStack: [...this.numStack],
            opStack: [...this.opStack],
            currentRes: res
        });

        return this.steps;
    }

    reset() {
        this.numStack = [];
        this.opStack = [];
        this.steps = [];
        this.currentStepIndex = 0;
    }
}

let calculator = new DoubleStackCalculator();
let autoInterval = null;

document.getElementById('startManual').addEventListener('click', startManual);
document.getElementById('startAuto').addEventListener('click', startAuto);
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('nextStep').addEventListener('click', nextStep);

function startManual() {
    const expression = document.getElementById('expression').value;
    if (!expression) return;

    reset();
    calculator.generateSteps(expression);
    document.getElementById('manualControl').style.display = 'block';
    document.getElementById('currentStep').textContent = '准备就绪，点击"下一步"开始';
}

function startAuto() {
    const expression = document.getElementById('expression').value;
    if (!expression) return;

    reset();
    calculator.generateSteps(expression);
    document.getElementById('manualControl').style.display = 'none';
    
    autoInterval = setInterval(() => {
        if (calculator.currentStepIndex < calculator.steps.length) {
            executeStep(calculator.steps[calculator.currentStepIndex]);
            calculator.currentStepIndex++;
        } else {
            clearInterval(autoInterval);
        }
    }, 800);
}

function nextStep() {
    if (calculator.currentStepIndex < calculator.steps.length) {
        executeStep(calculator.steps[calculator.currentStepIndex]);
        calculator.currentStepIndex++;
    }
}

function executeStep(step) {
    document.getElementById('currentStep').textContent = step.description;
    
    if (step.type === 'finish') {
        document.getElementById('result').textContent = step.result;
    }
    
    if (step.currentRes !== undefined) {
        document.getElementById('result').textContent = step.currentRes;
    }
    
    updateStackDisplay('numStack', step.numStack);
    updateStackDisplay('opStack', step.opStack);
}

function updateStackDisplay(stackId, stackData) {
    const stackElement = document.getElementById(stackId);
    stackElement.innerHTML = '';
    
    stackData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'stack-item';
        itemElement.textContent = item;
        itemElement.style.animationDelay = `${index * 0.1}s`;
        stackElement.appendChild(itemElement);
    });
}

function reset() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
    
    calculator.reset();
    document.getElementById('numStack').innerHTML = '';
    document.getElementById('opStack').innerHTML = '';
    document.getElementById('currentStep').textContent = '等待开始';
    document.getElementById('result').textContent = '-';
    document.getElementById('manualControl').style.display = 'none';
}
