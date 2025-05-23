// Ensure QUnit is loaded
if (typeof QUnit === 'undefined') {
    throw new Error("QUnit is not loaded. Make sure test.html includes it.");
}

// Ensure calculateExpression is available (exposed via window in main.js)
if (typeof window.calculateExpression === 'undefined') {
    throw new Error("calculateExpression function is not found. Make sure main.js is loaded and exports it correctly.");
}

const calculate = window.calculateExpression; // Shortcut for tests

QUnit.module('calculateExpression', function() {

    QUnit.test('Basic Arithmetic: Addition', function(assert) {
        assert.strictEqual(calculate("1+1"), "2", "1 + 1 = 2");
        assert.strictEqual(calculate("10+5"), "15", "10 + 5 = 15");
        assert.strictEqual(calculate("0+0"), "0", "0 + 0 = 0");
        assert.strictEqual(calculate("1.5+2.5"), "4", "1.5 + 2.5 = 4");
        assert.strictEqual(calculate("-1+5"), "4", "-1 + 5 = 4");
        assert.strictEqual(calculate("5+-2"), "3", "5 + -2 = 3");
        assert.strictEqual(calculate("-1+-1"), "-2", "-1 + -1 = -2");
    });

    QUnit.test('Basic Arithmetic: Subtraction', function(assert) {
        assert.strictEqual(calculate("5-3"), "2", "5 - 3 = 2");
        assert.strictEqual(calculate("10-20"), "-10", "10 - 20 = -10");
        assert.strictEqual(calculate("0-0"), "0", "0 - 0 = 0");
        assert.strictEqual(calculate("3.5-1.5"), "2", "3.5 - 1.5 = 2");
        assert.strictEqual(calculate("-5-3"), "-8", "-5 - 3 = -8");
        assert.strictEqual(calculate("5--3"), "8", "5 - -3 = 8"); // 5 - (-3) = 8
    });

    QUnit.test('Basic Arithmetic: Multiplication', function(assert) {
        assert.strictEqual(calculate("2*3"), "6", "2 * 3 = 6");
        assert.strictEqual(calculate("10*0"), "0", "10 * 0 = 0");
        assert.strictEqual(calculate("1.5*2"), "3", "1.5 * 2 = 3");
        assert.strictEqual(calculate("-2*3"), "-6", "-2 * 3 = -6");
        assert.strictEqual(calculate("2*-3"), "-6", "2 * -3 = -6");
        assert.strictEqual(calculate("-2*-3"), "6", "-2 * -3 = 6");
    });

    QUnit.test('Basic Arithmetic: Division', function(assert) {
        assert.strictEqual(calculate("6/2"), "3", "6 / 2 = 3");
        assert.strictEqual(calculate("10/4"), "2.5", "10 / 4 = 2.5");
        assert.strictEqual(calculate("0/5"), "0", "0 / 5 = 0");
        assert.strictEqual(calculate("-6/2"), "-3", "-6 / 2 = -3");
        assert.strictEqual(calculate("6/-2"), "-3", "6 / -2 = -3");
        assert.strictEqual(calculate("-6/-2"), "3", "-6 / -2 = 3");
    });

    QUnit.test('Division by Zero', function(assert) {
        assert.strictEqual(calculate("5/0"), "Error", "5 / 0 = Error");
        assert.strictEqual(calculate("0/0"), "Error", "0 / 0 = Error (NaN becomes Error)"); // Internally 0/0 is NaN
        assert.strictEqual(calculate("10*2/0"), "Error", "10 * 2 / 0 = Error");
    });

    QUnit.test('Operator Precedence', function(assert) {
        assert.strictEqual(calculate("2+3*4"), "14", "2 + 3 * 4 = 14");
        assert.strictEqual(calculate("10-6/2"), "7", "10 - 6 / 2 = 7");
        assert.strictEqual(calculate("2*3+4/2"), "8", "2 * 3 + 4 / 2 = 8");
        assert.strictEqual(calculate("1+2-3*4/5"), "0.6", "1 + 2 - 3 * 4 / 5 = 0.6 (1+2-2.4 = 0.6)");
    });

    QUnit.test('Multiple Operations', function(assert) {
        assert.strictEqual(calculate("10-2*3+8/4"), "6", "10 - 2 * 3 + 8 / 4 = 10 - 6 + 2 = 6");
        assert.strictEqual(calculate("2*2*2*2"), "16", "2 * 2 * 2 * 2 = 16");
        assert.strictEqual(calculate("100/10/2"), "5", "100 / 10 / 2 = 5");
        assert.strictEqual(calculate("1+1+1+1+1"), "5", "1 + 1 + 1 + 1 + 1 = 5");
        assert.strictEqual(calculate("10-1-1-1"), "7", "10 - 1 - 1 - 1 = 7");
    });
    
    QUnit.test('Operations with Negative Numbers', function(assert) {
        assert.strictEqual(calculate("-5*2"), "-10", "-5 * 2 = -10");
        assert.strictEqual(calculate("-5+-2"), "-7", "-5 + -2 = -7");
        assert.strictEqual(calculate("5*-2"), "-10", "5 * -2 = -10");
        assert.strictEqual(calculate("10--5"), "15", "10 - (-5) = 15");
        assert.strictEqual(calculate("-10--5"), "-5", "-10 - (-5) = -5");
        assert.strictEqual(calculate("-2*-2*-2"), "-8", "-2 * -2 * -2 = -8");
        assert.strictEqual(calculate("10/-2"), "-5", "10 / -2 = -5");
    });

    QUnit.test('Edge Cases and Invalid Input', function(assert) {
        assert.strictEqual(calculate("abc"), "Error", "Input 'abc' = Error");
        assert.strictEqual(calculate("1+"), "Error", "Input '1+' = Error");
        assert.strictEqual(calculate("+1"), "Error", "Input '+1' (unary plus not standard for start) = Error"); // Current logic treats leading operator (not -) as error
        assert.strictEqual(calculate("1++2"), "Error", "Input '1++2' = Error");
        assert.strictEqual(calculate("1* /2"), "Error", "Input '1* /2' = Error");
        assert.strictEqual(calculate(""), "Error", "Empty input = Error");
        assert.strictEqual(calculate("5."), "5", "Input '5.' should be treated as '5'"); // parseFloat handles this
        assert.strictEqual(calculate(".5"), "0.5", "Input '.5' should be treated as '0.5'"); // parseFloat handles this
        assert.strictEqual(calculate("5.0"), "5", "Input '5.0' is '5'");
        assert.strictEqual(calculate("0.00"), "0", "Input '0.00' is '0'");
        assert.strictEqual(calculate("-0"), "0", "Input '-0' is '0'"); // String("-0") is "-0", but parseFloat(-0) is -0, String(-0) is "0"
    });

    QUnit.test('15-Character Display Limit and Error for Overflow/Underflow', function(assert) {
        // Test numbers that would result in > 15 chars
        assert.strictEqual(calculate("1000000000000000"), "1e+15", "1000000000000000 -> 1e+15 (check if this is error or not based on current toFixed logic)"); // String(1e15) is "1e+15" (6 chars)
        assert.strictEqual(calculate("123456789012345"), "123456789012345", "15 digits exact fit");
        assert.strictEqual(calculate("1234567890123456"), "Error", "16 digits -> Error"); // Based on current logic for large numbers
        assert.strictEqual(calculate("0.12345678901234"), "0.12345678901234", "1 + 14 decimal digits = 16 chars -> check formatting. String() is fine.");
        assert.strictEqual(calculate("0.123456789012345"), "Error", "1 + 15 decimal digits = 17 chars -> Error"); // String() is "0.123456789012345"
        
        // Test rounding and precision within 15 chars for decimals
        assert.strictEqual(calculate("1/3"), "0.3333333333333", "1/3 (14 dec places, total 16 chars with '0.' -> should be handled by toFixed)"); // 1/3 = 0.333... current code: "0.3333333333333" (15 char total)
        assert.strictEqual(calculate("2/3"), "0.6666666666667", "2/3 (13 dec places, rounded, total 15 chars)"); // 2/3 = 0.666... current code: "0.6666666666667" (15 char total)
        assert.strictEqual(calculate("100000000/3"), "33333333.33333", "100000000/3 (5 dec, total 15 chars)"); // 33333333.33333333 -> "33333333.33333" (15 chars)

        // Test extremely large numbers that would be Infinity or error
        assert.strictEqual(calculate("1e20*1e20"), "Error", "1e20 * 1e20 = Infinity -> Error"); // Results in Infinity
        
        // Test extremely small numbers (close to zero)
        assert.strictEqual(calculate("1/100000000000000"), "0.00000000000001", "1/1e14 = 1e-14. String is 1e-14. Needs toFixed for 0.00... form"); // 1e-14. String is "1e-14" (6 chars)
                                                                                                                                         // The current toFixed logic might make this "Error" if it tries to represent full 0.00...
                                                                                                                                         // The current code makes it "Error"
        assert.strictEqual(calculate("0.000000000000001"), "Error", "0.000000000000001 (16 chars) -> Error"); // This is 1e-15. String is "1e-15" (6 chars). My code handles it as "Error"
        assert.strictEqual(calculate("1/10000000000000"), "0.0000000000001", "1/1e13 = 1e-13. String is 1e-13. toFixed: 0.0000000000001 (15 chars)"); // My code: "0.0000000000001"
    });

    QUnit.test('Single Number Input', function(assert) {
        assert.strictEqual(calculate("5"), "5", "Single number '5'");
        assert.strictEqual(calculate("-10"), "-10", "Single negative number '-10'");
        assert.strictEqual(calculate("123.45"), "123.45", "Single decimal number '123.45'");
        assert.strictEqual(calculate("0"), "0", "Single '0'");
    });
    
    QUnit.test('Numbers with trailing decimal point', function(assert) {
        assert.strictEqual(calculate("12."), "12", "12. should be 12");
        assert.strictEqual(calculate("12.+3"), "15", "12. + 3 should be 15");
        assert.strictEqual(calculate("3*12."), "36", "3 * 12. should be 36");
    });
});
