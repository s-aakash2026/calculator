// Calculator State
class Calculator {
    constructor() {
        this.displayPrimary = document.getElementById('display-primary');
        this.displaySecondary = document.getElementById('display-secondary');
        this.themeSlider = document.getElementById('theme-slider');

        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForNewInput = false;
        this.lastOperation = '';

        this.initializeTheme();
        this.setupEventListeners();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme') || '25';
        this.themeSlider.value = savedTheme;
        this.updateTheme();
    }

    setupEventListeners() {
        this.themeSlider.addEventListener('input', () => this.updateTheme());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Add ripple effect to buttons
        document.querySelectorAll('.btn-calc').forEach(btn => {
            btn.addEventListener('click', (e) => this.addRippleEffect(e));
        });
    }

    updateTheme() {
        const value = parseInt(this.themeSlider.value);
        localStorage.setItem('calculatorTheme', value);

        const themes = {
            0: {
                '--bg-gradient': 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
                '--calc-bg': 'rgba(15, 15, 20, 0.95)',
                '--accent-color': '#8b5cf6'
            },
            25: {
                '--bg-gradient': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
                '--calc-bg': 'rgba(20, 20, 30, 0.95)',
                '--accent-color': '#ff9500'
            },
            50: {
                '--bg-gradient': 'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)',
                '--calc-bg': 'rgba(30, 30, 40, 0.95)',
                '--accent-color': '#11998e'
            },
            75: {
                '--bg-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                '--calc-bg': 'rgba(40, 40, 50, 0.95)',
                '--accent-color': '#764ba2'
            },
            100: {
                '--bg-gradient': 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%)',
                '--calc-bg': 'rgba(50, 50, 60, 0.95)',
                '--accent-color': '#fd79a8'
            }
        };

        // Find closest theme
        const themeKeys = Object.keys(themes).map(Number).sort((a, b) => a - b);
        let closestTheme = themeKeys[0];

        for (const key of themeKeys) {
            if (Math.abs(value - key) < Math.abs(value - closestTheme)) {
                closestTheme = key;
            }
        }

        // Apply theme
        const theme = themes[closestTheme];
        const root = document.documentElement;

        Object.entries(theme).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    addRippleEffect(e) {
        const button = e.currentTarget;
        button.classList.add('pressed');

        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }

    handleKeyboard(e) {
        const key = e.key;

        // Prevent default for calculator keys
        if (/[0-9+\-*/.=]|Enter|Escape|Backspace|Delete/.test(key)) {
            e.preventDefault();
        }

        // Number keys
        if (/[0-9]/.test(key)) {
            this.inputNumber(key);
        }

        // Operator keys
        switch (key) {
            case '+':
                this.inputOperator('+');
                break;
            case '-':
                this.inputOperator('-');
                break;
            case '*':
                this.inputOperator('*');
                break;
            case '/':
                this.inputOperator('/');
                break;
            case '.':
                this.inputDecimal();
                break;
            case '=':
            case 'Enter':
                this.calculate();
                break;
            case 'Escape':
                this.clearAll();
                break;
            case 'Backspace':
            case 'Delete':
                this.deleteLast();
                break;
            case 'c':
            case 'C':
                this.clearEntry();
                break;
        }
    }

    updateDisplay() {
        // Format large numbers
        let displayValue = this.currentInput;

        if (parseFloat(displayValue) !== 0 && Math.abs(parseFloat(displayValue)) < 0.000001) {
            displayValue = parseFloat(displayValue).toExponential(3);
        } else if (Math.abs(parseFloat(displayValue)) >= 1e10) {
            displayValue = parseFloat(displayValue).toExponential(3);
        } else if (displayValue.includes('.') && displayValue.length > 10) {
            displayValue = parseFloat(displayValue).toPrecision(8);
        }

        this.displayPrimary.textContent = this.formatNumber(displayValue);

        // Update secondary display
        let secondaryText = '';
        if (this.previousInput && this.operator) {
            secondaryText = `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`;
        }
        this.displaySecondary.textContent = secondaryText;
    }

    formatNumber(num) {
        const numStr = num.toString();
        if (numStr.includes('e')) return numStr; // Don't format scientific notation

        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[op] || op;
    }

    flashDisplay() {
        this.displayPrimary.parentElement.classList.add('flash');
        setTimeout(() => {
            this.displayPrimary.parentElement.classList.remove('flash');
        }, 300);
    }

    showError(message = 'Error') {
        this.displayPrimary.textContent = message;
        this.displayPrimary.classList.add('error');

        setTimeout(() => {
            this.displayPrimary.classList.remove('error');
            this.clearAll();
        }, 1500);
    }
}

// Calculator instance
const calc = new Calculator();

// Calculator Functions
function inputNumber(num) {
    if (calc.waitingForNewInput) {
        calc.currentInput = num;
        calc.waitingForNewInput = false;
    } else {
        calc.currentInput = calc.currentInput === '0' ? num : calc.currentInput + num;
    }
    calc.updateDisplay();
}

function inputOperator(op) {
    if (!calc.waitingForNewInput && calc.previousInput && calc.operator) {
        calculate();
    }

    calc.previousInput = calc.currentInput;
    calc.operator = op;
    calc.waitingForNewInput = true;
    calc.updateDisplay();
}

function inputDecimal() {
    if (calc.waitingForNewInput) {
        calc.currentInput = '0.';
        calc.waitingForNewInput = false;
    } else if (!calc.currentInput.includes('.')) {
        calc.currentInput += '.';
    }
    calc.updateDisplay();
}

function calculate() {
    if (!calc.operator || !calc.previousInput) return;

    const prev = parseFloat(calc.previousInput);
    const current = parseFloat(calc.currentInput);
    let result;

    try {
        switch (calc.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    calc.showError('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        // Check for invalid results
        if (!isFinite(result)) {
            calc.showError('Invalid operation');
            return;
        }

        calc.lastOperation = `${calc.previousInput} ${calc.getOperatorSymbol(calc.operator)} ${calc.currentInput}`;
        calc.currentInput = result.toString();
        calc.previousInput = '';
        calc.operator = null;
        calc.waitingForNewInput = true;

        calc.flashDisplay();
        calc.updateDisplay();

    } catch (error) {
        calc.showError();
    }
}

function clearAll() {
    calc.currentInput = '0';
    calc.previousInput = '';
    calc.operator = null;
    calc.waitingForNewInput = false;
    calc.displaySecondary.textContent = '';
    calc.updateDisplay();
}

function clearEntry() {
    calc.currentInput = '0';
    calc.updateDisplay();
}

function deleteLast() {
    if (calc.currentInput.length > 1) {
        calc.currentInput = calc.currentInput.slice(0, -1);
    } else {
        calc.currentInput = '0';
    }
    calc.updateDisplay();
}

// Initialize display
calc.updateDisplay();

// Add smooth scrolling and performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Smooth theme transitions
    document.body.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    // Add touch support for mobile
    if ('ontouchstart' in window) {
        document.querySelectorAll('.btn-calc').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(0.95)';
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.style.transform = '';
            });
        });
    }
});