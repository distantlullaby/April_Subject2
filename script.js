class CalculatorVisualizer {
    constructor() {
        this.numStack = [];
        this.opStack = [];
        this.res = 0;
        this.sign = 1;
        this.index = 0;
        this.expression = '';
        this.steps = [];
        this.stepCount = 0;
        this.isRunning = false;
        this.isAutoMode = false;
        this.autoInterval = null;
        this.speed = 1000;
        
        this.initElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initElements() {
        this.numStackEl = document.getElementById('numStack');
        this.opStackEl = document.getElementById('opStack');
        this.resEl = document.getElementById('currentRes');
        this.signEl = document.getElementById('currentSign');
        this.charEl = document.getElementById('currentChar');
        this.stepsListEl = document.getElementById('stepsList');
        this.expressionTextEl = document.getElementById('expressionText');
        this.expressionInput = document.getElementById('expression');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.speedControl = document.getElementById('speedControl');
        this.resultSection = document.getElementById('resultSection');
        this.finalResult = document.getElementById('finalResult');
        this.modeRadios = document.querySelectorAll('input[name="mode"]');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.nextBtn.addEventListener('click', () => this.nextStep());
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValue.textContent = this.speed + 'ms';
            if (this.autoInterval) {
                clearInterval(this.autoInterval);
                this.startAutoMode();
            }
        });

        this.modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.isAutoMode = e.target.value === 'auto';
                this.speedControl.style.display = this.isAutoMode ? 'flex' : 'none';
            });
        });

        this.nextBtn.disabled = true;
        this.speedControl.style.display = 'none';
    }

    start() {
        this.reset();
        this.expression = this.expressionInput.value;
        if (!this.expression.trim()) {
            alert('请输入表达式！');
            return;
        }
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.expressionInput.disabled = true;
        this.nextBtn.disabled = this.isAutoMode;
        this.renderExpression();
        
        if (this.isAutoMode) {
            this.startAutoMode();
        }
    }

    startAutoMode() {
        this.nextBtn.disabled = true;
        this.autoInterval = setInterval(() => {
            if (this.index < this.expression.length) {
                this.nextStep();
            } else {
                this.stopAutoMode();
            }
        }, this.speed);
    }

    stopAutoMode() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
            this.autoInterval = null;
        }
        this.nextBtn.disabled = false;
    }

    reset() {
        this.stopAutoMode();
        this.numStack = [];
        this.opStack = [];
        this.res = 0;
        this.sign = 1;
        this.index = 0;
        this.steps = [];
        this.stepCount = 0;
        this.isRunning = false;
        this.stepsListEl.innerHTML = '';
        this.resultSection.style.display = 'none';
        this.startBtn.disabled = false;
        this.expressionInput.disabled = false;
        this.nextBtn.disabled = true;
        this.updateDisplay();
    }

    nextStep() {
        if (!this.isRunning || this.index >= this.expression.length) {
            this.finishCalculation();
            return;
        }

        const c = this.expression[this.index];
        
        if (c === ' ') {
            this.index++;
            this.addStep(`跳过空格`);
            this.updateDisplay();
            return;
        }

        if (this.isDigit(c)) {
            this.processDigit();
        } else if (c === '+') {
            this.sign = 1;
            this.addStep(`遇到 '+'，设置符号 sign = 1`);
            this.index++;
        } else if (c === '-') {
            this.sign = -1;
            this.addStep(`遇到 '-'，设置符号 sign = -1`);
            this.index++;
        } else if (c === '(') {
            this.processLeftParen();
        } else if (c === ')') {
            this.processRightParen();
        } else {
            this.index++;
            this.addStep(`跳过未知字符 '${c}'`);
        }

        this.updateDisplay();

        if (this.index >= this.expression.length) {
            this.finishCalculation();
        }
    }

    processDigit() {
        let num = 0;
        let digits = [];
        while (this.index < this.expression.length && this.isDigit(this.expression[this.index])) {
            digits.push(this.expression[this.index]);
            num = num * 10 + parseInt(this.expression[this.index]);
            this.index++;
        }
        this.res += this.sign * num;
        this.addStep(`读取数字 '${digits.join('')}'，计算 res = ${this.res - this.sign * num} + ${this.sign} * ${num} = ${this.res}`);
    }

    processLeftParen() {
        this.numStack.push(this.res);
        this.opStack.push(this.sign);
        this.addStep(`遇到 '('，压栈：numStack.push(${this.res}), opStack.push(${this.sign})，然后重置 res = 0, sign = 1`);
        this.res = 0;
        this.sign = 1;
        this.index++;
    }

    processRightParen() {
        const prevRes = this.numStack.pop();
        const prevSign = this.opStack.pop();
        const oldRes = this.res;
        this.res = prevRes + prevSign * this.res;
        this.addStep(`遇到 ')'，弹栈计算：numStack.pop() = ${prevRes}, opStack.pop() = ${prevSign}，计算 res = ${prevRes} + ${prevSign} * ${oldRes} = ${this.res}`);
        this.index++;
        
        setTimeout(() => this.updateStackDisplay(), 100);
    }

    finishCalculation() {
        this.stopAutoMode();
        this.isRunning = false;
        this.nextBtn.disabled = true;
        this.resultSection.style.display = 'block';
        this.finalResult.textContent = this.res;
        this.charEl.textContent = '✓';
        this.addStep(`计算完成！最终结果: ${this.res}`);
        this.renderExpression();
    }

    addStep(description) {
        this.stepCount++;
        this.steps.push(description);
        
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.innerHTML = `<span class="step-number">${this.stepCount}</span>${description}`;
        this.stepsListEl.appendChild(stepItem);
        this.stepsListEl.scrollTop = this.stepsListEl.scrollHeight;
    }

    updateDisplay() {
        this.updateStackDisplay();
        this.resEl.textContent = this.res;
        this.signEl.textContent = this.sign;
        this.charEl.textContent = this.index < this.expression.length ? this.expression[this.index] : '结束';
        this.renderExpression();
    }

    updateStackDisplay() {
        this.renderStack(this.numStackEl, this.numStack);
        this.renderStack(this.opStackEl, this.opStack);
    }

    renderStack(stackEl, stackData) {
        const items = stackEl.querySelectorAll('.stack-item');
        items.forEach(item => {
            item.classList.add('pop-out');
        });
        
        setTimeout(() => {
            while (stackEl.children.length > 1) {
                stackEl.removeChild(stackEl.firstChild);
            }
            
            stackData.forEach(item => {
                const stackItem = document.createElement('div');
                stackItem.className = 'stack-item';
                stackItem.textContent = item;
                stackEl.insertBefore(stackItem, stackEl.firstChild);
            });
        }, items.length > 0 ? 300 : 0);
    }

    renderExpression() {
        if (!this.expression) return;
        
        let html = '';
        for (let i = 0; i < this.expression.length; i++) {
            const char = this.expression[i];
            let className = 'char-normal';
            if (i < this.index) {
                className = 'char-done';
            } else if (i === this.index && this.isRunning) {
                className = 'char-current';
            }
            html += `<span class="${className}">${char === ' ' ? '&nbsp;' : char}</span>`;
        }
        this.expressionTextEl.innerHTML = html;
    }

    isDigit(c) {
        return c >= '0' && c <= '9';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalculatorVisualizer();
});
