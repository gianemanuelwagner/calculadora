"use strict";

const pantalla = document.querySelector(".pantalla");
const botones = document.querySelectorAll(".btn");

/**
 * Updates the calculator display with the given value.
 * @param {string} value - The value to display.
 */
function updateDisplay(value) {
    pantalla.textContent = value;
}

/**
 * Clears the calculator display, setting it to "0".
 */
function clearDisplay() {
    updateDisplay("0");
}

/**
 * Handles the backspace functionality.
 * Deletes the last character from the display or sets it to "0".
 */
function deleteLastChar() {
    if (pantalla.textContent.length === 1 || pantalla.textContent === "Error") {
        updateDisplay("0");
    } else {
        updateDisplay(pantalla.textContent.slice(0, -1));
    }
}

/**
 * Appends the given input (number or operator) to the display.
 * Handles clearing "0" or "Error" messages and the 15-character limit.
 * @param {string} input - The input value (button's text content).
 */
function appendInput(input) {
    if (pantalla.textContent === "0" || pantalla.textContent === "Error") {
        updateDisplay(input);
    } else if (pantalla.textContent.length < 15) {
        updateDisplay(pantalla.textContent + input);
    }
}

/**
 * Performs the calculation using the current expression on the display.
 * Updates the display with the result or an "Error" message.
 */
function performCalculation() {
    const expression = pantalla.textContent;
    const result = calculateExpression(expression);
    updateDisplay(result);

    // Additional check for Infinity/NaN, though calculateExpression should also handle this
    if (pantalla.textContent === "Infinity" || pantalla.textContent === "NaN") {
        updateDisplay("Error");
    }
}

/**
 * Handles button clicks and routes to the appropriate action.
 * @param {Event} event - The click event.
 */
function handleButtonClick(event) {
    const button = event.target; // The clicked button element
    const buttonValue = button.textContent; // e.g., "C", "←", "7", "+", "="
    const buttonId = button.id; // e.g., "c", "borrar", "igual"

    switch (buttonId) {
        case "c":
            clearDisplay();
            break;
        case "borrar":
            deleteLastChar();
            break;
        case "igual":
            performCalculation();
            break;
        default:
            // For number and operator buttons that don't have a specific ID for action
            appendInput(buttonValue);
            break;
    }
}

/**
 * Handles keydown events for keyboard accessibility.
 * Triggers a click on the button if "Enter" or "Space" is pressed.
 * @param {KeyboardEvent} event - The keydown event.
 */
function handleKeyPress(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Prevent default action (e.g., scrolling on Space, form submission)
        event.target.click(); // Simulate a click on the focused button
    }
}

// Add event listeners to all buttons
botones.forEach(boton => {
    boton.addEventListener("click", handleButtonClick);
    boton.addEventListener("keydown", handleKeyPress);
});

/**
 * Calculates the result of a given mathematical expression string.
 * Handles operator precedence (multiplication/division before addition/subtraction),
 * division by zero, and other potential errors.
 * @param {string} expression - The mathematical expression to evaluate.
 * @returns {string} The calculated result as a string, or "Error".
 */
function calculateExpression(expression) {
    try {
        // Tokenize the expression: separate numbers and operators.
        // Allows for negative numbers at the start or after an operator (e.g., "-5", "5*-2").
        const tokens = expression.match(/-?\d+\.?\d*|[+\-*/]/g);
        if (!tokens) return "Error"; // No tokens found, invalid expression

        // Define operations with precedence: 1st pass for * /, 2nd pass for + -
        const opsByPrecedence = [
            {'*': (a, b) => a * b, '/': (a, b) => b === 0 ? "Error" : a / b},
            {'+': (a, b) => a + b, '-': (a, b) => a - b}
        ];

        let numbers = [];
        let operators = [];

        // Parse tokens into numbers and operators arrays
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (/[+\-*/]/.test(token)) {
                // Handle unary minus: if '-' is at the start or follows another operator,
                // and is followed by a number, it's part of that number.
                if (token === '-' && (i === 0 || /[+\-*/]/.test(tokens[i-1]))) {
                    if (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i+1]))) {
                        numbers.push(parseFloat(token + tokens[i+1]));
                        i++; // Skip next token as it's part of the negative number
                        continue;
                    }
                }
                operators.push(token);
            } else {
                numbers.push(parseFloat(token));
            }
        }
        
        // Validate token parsing: expected numbers.length === operators.length + 1
        // unless it's a single number (e.g. "5" or "-5")
        if (numbers.length !== operators.length + 1) {
            if (!(numbers.length === 1 && operators.length === 0)) {
                return "Error"; // Malformed expression
            }
        }

        // Process operations according to precedence
        for (const currentOps of opsByPrecedence) {
            const newNumbers = [];
            const newOperators = [];
            let currentVal = numbers[0];

            for (let j = 0; j < operators.length; j++) {
                const op = operators[j];
                const nextVal = numbers[j+1];
                if (currentOps[op]) { // If operator is in the current precedence group (e.g., * or /)
                    const result = currentOps[op](currentVal, nextVal);
                    if (result === "Error") return "Error"; // Handle division by zero
                    currentVal = result;
                } else {
                    // Operator not in current precedence group, carry it and currentVal over
                    newNumbers.push(currentVal);
                    newOperators.push(op);
                    currentVal = nextVal;
                }
            }
            newNumbers.push(currentVal); // Push the last processed value
            numbers = newNumbers;
            operators = newOperators;
            if (operators.length === 0) break; // All operations of current precedence done
        }

        let result = numbers[0];
        
        // Check for NaN or Infinity (e.g., from 0/0 or numbers too large)
        if (isNaN(result) || !isFinite(result)) {
            return "Error";
        }
        
        let resultStr = String(result);

        // Format result string to fit within 15 characters if possible
        if (resultStr.length > 15) {
            // For very large or very small numbers, often results in scientific notation or "Error"
            if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-5 && result !== 0)) {
                 return "Error"; // Or implement scientific notation if display supported it
            } else {
                // Try to round decimals if the number isn't too large/small but has many decimal places
                const intPartResult = Math.floor(Math.abs(result));
                const intDigits = intPartResult === 0 ? 0 : String(intPartResult).length;
                // Calculate available decimal places: 15 - sign - integer digits - decimal point
                const decimalPlaces = 15 - (result < 0 ? 1 : 0) - intDigits - 1;

                if (decimalPlaces > 0 && decimalPlaces < 15) { // Ensure decimalPlaces is reasonable
                    resultStr = result.toFixed(decimalPlaces);
                    // Remove trailing zeros from decimals (e.g., "5.2500" -> "5.25")
                    // Also handles cases like "5.00" -> "5" by first removing trailing 0s then trailing .
                    resultStr = resultStr.replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1');
                } else if (decimalPlaces <= 0 && resultStr.length > 15) {
                    return "Error"; // Not enough space for decimals, and original string is too long
                }
            }
        }
        // Final length check after potential toFixed and stripping
        if (resultStr.length > 15) return "Error";

        return resultStr;

    } catch (e) {
        // Catch any unexpected errors during calculation
        // console.error("Calculation error:", e); // For debugging
        return "Error";
    }
}

// Export for testing in browser/node environments
if (typeof window !== 'undefined') {
    window.calculateExpression = calculateExpression;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = calculateExpression;
}
