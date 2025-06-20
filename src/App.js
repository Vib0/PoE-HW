import React, { useState, useEffect, useCallback } from 'react';

// Main App component
const App = () => {
    // State to store the current Divine to Chaos exchange rate
    const [divineChaosRate, setDivineChaosRate] = useState(155); // Default to 155 Chaos per Divine
    // State for Divine input (per piece)
    const [divineInput, setDivineInput] = useState('');
    // State for Chaos input (per piece or total, adjusted by quantity)
    const [chaosInput, setChaosInput] = useState('');
    // State for quantity of items
    const [quantity, setQuantity] = useState(1); // Default quantity to 1
    // State for calculated total Divines (e.g., 3.6 for 3 * 1.2 Div) for display
    const [calculatedTotalDivDisplay, setCalculatedTotalDivDisplay] = useState(0);
    // State for calculated whole Divines from conversion breakdown
    const [calculatedDiv, setCalculatedDiv] = useState(0);
    // State for calculated Chaos from conversion breakdown
    const [calculatedChaos, setCalculatedChaos] = useState(0);
    // State for total Chaos equivalent for conversion section
    const [calculatedTotalChaosDisplay, setCalculatedTotalChaosDisplay] = useState(0);
    // State for the calculation string (e.g., "22 * 1.7 = 37.4 Div")
    const [calculationString, setCalculationString] = useState('');
    // State for total cost input (Div) for change calculation, autofilled from conversion
    const [totalCostDivInput, setTotalCostDivInput] = useState('');
    // State for paid amount input (Div) for change calculation, autofilled to next whole divine
    const [paidAmountDivInput, setPaidAmountDivInput] = useState('');
    // State for calculated change in Divines
    const [changeDiv, setChangeDiv] = useState(0);
    // State for calculated change in Chaos
    const [changeChaos, setChangeChaos] = useState(0);


    // Helper function to convert a total Chaos value into Divines and remaining Chaos
    // Ensures precision using toFixed and parseFloat for accurate breakdown.
    const convertChaosToDivChaos = useCallback((totalChaos) => {
        if (divineChaosRate === 0) return { div: 0, chaos: 0 };

        const div = Math.floor(totalChaos / divineChaosRate);
        const chaos = totalChaos % divineChaosRate;
        // Ensure chaos is rounded to 2 decimal places for display accuracy
        return { div: div, chaos: parseFloat(chaos.toFixed(2)) };
    }, [divineChaosRate]);

    // Helper function to convert a decimal Divine value into whole Divines and remaining Chaos
    // Ensures precision using toFixed and parseFloat for accurate breakdown.
    const convertDivToDivChaos = useCallback((totalDiv) => {
        if (divineChaosRate === 0) return { div: 0, chaos: 0 };

        const wholeDiv = Math.floor(totalDiv);
        const fractionalDiv = totalDiv - wholeDiv;
        const chaos = fractionalDiv * divineChaosRate;
        // Ensure chaos is rounded to 2 decimal places for display accuracy
        return { div: wholeDiv, chaos: parseFloat(chaos.toFixed(2)) };
    }, [divineChaosRate]);

    // Centralized calculation logic for the conversion section.
    // This function ensures consistency and is called whenever relevant inputs/states change.
    const performConversionCalculation = useCallback((currentDivineInput, currentChaosInput, currentQuantity, currentRate) => {
        let totalCalculatedDivDisplayVal = 0;
        let newCalculatedDiv = 0;
        let newCalculatedChaos = 0;
        let newCalculatedTotalChaosDisplay = 0;
        let newCalculationString = '';

        const divInputValue = parseFloat(currentDivineInput);
        const chaosInputValue = parseFloat(currentChaosInput);
        const qty = parseFloat(currentQuantity);

        // Reset all calculated values if inputs are invalid or rate is zero
        if (currentRate === 0 || qty <= 0 || (isNaN(divInputValue) && isNaN(chaosInputValue))) {
            setCalculatedTotalDivDisplay(0);
            setCalculatedDiv(0);
            setCalculatedChaos(0);
            setCalculatedTotalChaosDisplay(0);
            setCalculationString('');
            // Also clear the total cost for change calculation to avoid incorrect autofill
            setTotalCostDivInput('');
            return;
        }

        // Prioritize Divine input if both are present or only Divine is entered
        if (!isNaN(divInputValue) && divInputValue >= 0) {
            const totalDivCalculated = parseFloat((divInputValue * qty).toFixed(2)); // Ensure precision
            totalCalculatedDivDisplayVal = totalDivCalculated;
            newCalculatedTotalChaosDisplay = parseFloat((totalDivCalculated * currentRate).toFixed(2)); // Total Chaos for display

            const { div, chaos } = convertDivToDivChaos(totalDivCalculated);
            newCalculatedDiv = div;
            newCalculatedChaos = chaos;
            newCalculationString = `${divInputValue} * ${qty} = ${totalDivCalculated.toFixed(2)} Divine(s)`;

        } else if (!isNaN(chaosInputValue) && chaosInputValue >= 0) {
            // If only Chaos input is active
            const totalChaosCalculated = parseFloat((chaosInputValue * qty).toFixed(2)); // Ensure precision
            newCalculatedTotalChaosDisplay = totalChaosCalculated;
            totalCalculatedDivDisplayVal = parseFloat((totalChaosCalculated / currentRate).toFixed(2)); // Convert to Div for total display

            const { div, chaos } = convertChaosToDivChaos(totalChaosCalculated);
            newCalculatedDiv = div;
            newCalculatedChaos = chaos;
            newCalculationString = `${chaosInputValue} * ${qty} = ${totalChaosCalculated.toFixed(2)} Chaos`;
        }

        // Update states for display in the conversion section
        setCalculatedTotalDivDisplay(totalCalculatedDivDisplayVal);
        setCalculatedDiv(newCalculatedDiv);
        setCalculatedChaos(newCalculatedChaos);
        setCalculatedTotalChaosDisplay(newCalculatedTotalChaosDisplay);
        setCalculationString(newCalculationString);

        // Auto-fill totalCostDivInput for the change calculation section
        // This must be a string for input value, formatted to 2 decimal places for precision.
        setTotalCostDivInput(totalCalculatedDivDisplayVal.toFixed(2).toString());

    }, [convertChaosToDivChaos, convertDivToDivChaos]); // Dependencies: helper functions

    // Handler for Divine input change
    const handleDivineInputChange = (e) => {
        const value = e.target.value;
        setDivineInput(value);
        // Clear other input to ensure only one input drives the conversion calculation
        setChaosInput('');
        performConversionCalculation(value, '', quantity, divineChaosRate);
    };

    // Handler for Chaos input change
    const handleChaosInputChange = (e) => {
        const value = e.target.value;
        setChaosInput(value);
        // Clear other input
        setDivineInput('');
        performConversionCalculation('', value, quantity, divineChaosRate);
    };

    // Handler for quantity input change
    const handleQuantityChange = (e) => {
        const value = e.target.value;
        const numValue = parseInt(value, 10);
        // Ensure quantity is at least 1, default to 1 if invalid
        const newQuantity = isNaN(numValue) || numValue < 1 ? 1 : numValue;
        setQuantity(newQuantity);

        // Recalculate based on the active input (Divine or Chaos) after quantity updates
        // Use a slight delay (0 timeout) to ensure quantity state has propagated
        setTimeout(() => {
            if (divineInput !== '') {
                performConversionCalculation(divineInput, '', newQuantity, divineChaosRate);
            } else if (chaosInput !== '') {
                performConversionCalculation('', chaosInput, newQuantity, divineChaosRate);
            } else {
                // If no input is active but quantity changed, reset conversion display
                performConversionCalculation('', '', 0, divineChaosRate);
            }
        }, 0);
    };

    // Handler for manual Divine Chaos Rate change
    // When rate changes, re-run the conversion calculation based on current inputs
    const handleDivineChaosRateChange = (e) => {
        const value = parseFloat(e.target.value);
        const newRate = isNaN(value) || value <= 0 ? 0 : value;
        setDivineChaosRate(newRate);

        // Trigger recalculation using the new rate
        // Delay ensures rate state is updated before calculation
        setTimeout(() => {
            if (divineInput !== '') {
                performConversionCalculation(divineInput, '', quantity, newRate);
            } else if (chaosInput !== '') {
                performConversionCalculation('', chaosInput, quantity, newRate);
            } else {
                // If no input, but rate changes, clear conversion display
                performConversionCalculation('', '', 0, newRate);
            }
        }, 0);
    };


    // Function to calculate change based on Div inputs (autofill logic is tied to totalCostDivInput)
    const calculateChangeFromDiv = useCallback(() => {
        const totalCostDiv = parseFloat(totalCostDivInput);
        const paidAmountDiv = parseFloat(paidAmountDivInput);

        // Clear change if inputs are invalid or rate is zero
        if (isNaN(totalCostDiv) || isNaN(paidAmountDiv) || divineChaosRate === 0) {
            setChangeDiv(0);
            setChangeChaos(0);
            return;
        }
        if (totalCostDiv < 0 || paidAmountDiv < 0) {
            setChangeDiv(0);
            setChangeChaos(0);
            return;
        }

        const totalCostInChaos = parseFloat((totalCostDiv * divineChaosRate).toFixed(2)); // Ensure precision
        const paidAmountInChaos = parseFloat((paidAmountDiv * divineChaosRate).toFixed(2)); // Ensure precision

        if (paidAmountInChaos < totalCostInChaos) {
            setChangeDiv(0);
            setChangeChaos(0);
            return;
        }

        const changeInChaos = parseFloat((paidAmountInChaos - totalCostInChaos).toFixed(2)); // Ensure precision
        const { div, chaos } = convertChaosToDivChaos(changeInChaos);
        setChangeDiv(div);
        setChangeChaos(chaos);
    }, [totalCostDivInput, paidAmountDivInput, divineChaosRate, convertChaosToDivChaos]);


    // Handler for total cost divine change. This is the primary trigger for paidAmount autofill.
    const handleTotalCostDivChange = (e) => {
        const value = e.target.value;
        setTotalCostDivInput(value);
    };

    // Effect to auto-fill paid amount when totalCostDivInput changes
    useEffect(() => {
        const numericValue = parseFloat(totalCostDivInput);
        let nextPaidAmount = '';

        if (!isNaN(numericValue) && numericValue >= 0) {
            // Calculate the next whole Divine number
            nextPaidAmount = (Math.floor(numericValue) + 1).toString();
        }
        setPaidAmountDivInput(nextPaidAmount);
    }, [totalCostDivInput]); // This effect runs only when totalCostDivInput changes

    // Handler for paid amount divine change (manual override)
    const handlePaidAmountDivChange = (e) => {
        setPaidAmountDivInput(e.target.value);
    };

    // Effect to recalculate change whenever relevant states (inputs, rate) change.
    // This ensures the displayed change is always up-to-date.
    useEffect(() => {
        calculateChangeFromDiv();
    }, [totalCostDivInput, paidAmountDivInput, divineChaosRate, calculateChangeFromDiv]);

    // --- Buttons for Increment/Decrementing Divine and Chaos inputs ---
    const handleDivineIncrement = () => {
        const currentVal = parseFloat(divineInput) || 0;
        const newVal = (currentVal + 0.1);
        handleDivineInputChange({ target: { value: newVal.toFixed(2) } }); // Ensure 2 decimal places
    };

    const handleDivineDecrement = () => {
        const currentVal = parseFloat(divineInput) || 0;
        const newVal = (currentVal - 0.1);
        handleDivineInputChange({ target: { value: (newVal < 0 ? 0 : newVal).toFixed(2) } }); // Prevent negative, ensure 2 decimal places
    };

    const handleChaosIncrement = () => {
        const currentVal = parseFloat(chaosInput) || 0;
        const newVal = (currentVal + 1);
        handleChaosInputChange({ target: { value: newVal.toFixed(0) } }); // Ensure whole number
    };

    const handleChaosDecrement = () => {
        const currentVal = parseFloat(chaosInput) || 0;
        const newVal = (currentVal - 1);
        handleChaosInputChange({ target: { value: (newVal < 0 ? 0 : newVal).toFixed(0) } }); // Prevent negative, ensure whole number
    };

    // --- Buttons for Increment/Decrementing Quantity input ---
    const handleQuantityIncrement = () => {
        const currentVal = parseInt(quantity, 10) || 0;
        handleQuantityChange({ target: { value: (currentVal + 1).toString() } });
    };

    const handleQuantityDecrement = () => {
        const currentVal = parseInt(quantity, 10) || 0;
        handleQuantityChange({ target: { value: (currentVal - 1 < 1 ? 1 : currentVal - 1).toString() } }); // Ensure min 1
    };


    return (
        // Main container with dark gradient background from Atom One Dark palette
        <div className="min-h-screen bg-gradient-to-br from-[#282C34] to-[#21252B] text-[#ABB2BF] p-4 sm:p-8 font-inter antialiased">
            {/* Main content wrapper */}
            <div className="max-w-4xl mx-auto bg-[#21252B] rounded-xl shadow-2xl p-6 sm:p-8 border border-[#3E4451]">
                {/* Application Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-[#E06C75] mb-6 drop-shadow-lg">
                    Hideout Warrior Assistant
                </h1>

                {/* Exchange Rate Input Section */}
                <div className="mb-8 p-4 bg-[#282C34] rounded-lg shadow-inner border border-[#3E4451] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <label htmlFor="divineChaosRateInput" className="text-lg sm:text-xl font-semibold w-full sm:w-auto">
                        1 Divine =
                        <input
                            type="number"
                            id="divineChaosRateInput"
                            value={divineChaosRate === 0 ? '' : divineChaosRate}
                            onChange={handleDivineChaosRateChange}
                            min="1"
                            placeholder="e.g., 155"
                            className="ml-2 p-2 rounded-lg bg-[#1D2025] text-[#E5C07B] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200 w-24 sm:w-32"
                        />
                        Chaos
                    </label>
                </div>

                {/* Divine/Chaos Conversion Section */}
                <div className="mb-8 p-6 bg-[#282C34] rounded-lg shadow-xl border border-[#3E4451]">
                    <h2 className="text-2xl font-bold text-[#61AFEF] mb-4 text-center">Currency Conversion</h2>

                    {/* Quantity Input with Buttons */}
                    <div className="mb-6">
                        <label htmlFor="quantityInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                            Quantity (pcs):
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleQuantityDecrement}
                                className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                            >
                                -1
                            </button>
                            <input
                                type="number"
                                id="quantityInput"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min="1"
                                placeholder="1"
                                className="flex-grow p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                            />
                            <button
                                onClick={handleQuantityIncrement}
                                className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                            >
                                +1
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Convert from Divines */}
                        <div>
                            <label htmlFor="divineInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                                Price per piece in Divines (e.g., 1.7):
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDivineDecrement}
                                    className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                                >
                                    -0.1
                                </button>
                                <input
                                    type="number"
                                    id="divineInput"
                                    value={divineInput}
                                    onChange={handleDivineInputChange}
                                    placeholder="e.g., 1.7"
                                    className="flex-grow p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                                    step="0.1" /* Increment by 0.1 */
                                />
                                <button
                                    onClick={handleDivineIncrement}
                                    className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                                >
                                    +0.1
                                </button>
                            </div>
                        </div>

                        {/* Convert from Chaos */}
                        <div>
                            <label htmlFor="chaosInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                                Price per piece in Chaos (e.g., 30):
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleChaosDecrement}
                                    className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                                >
                                    -1
                                </button>
                                <input
                                    type="number"
                                    id="chaosInput"
                                    value={chaosInput}
                                    onChange={handleChaosInputChange}
                                    placeholder="e.g., 30"
                                    className="flex-grow p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                                    step="1" /* Increment by 1 */
                                />
                                <button
                                    onClick={handleChaosIncrement}
                                    className="bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-3 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                                >
                                    +1
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Conversion Results */}
                    <div className="mt-6 p-4 bg-[#21252B] rounded-lg border border-[#3E4451] shadow-inner">
                        <h3 className="text-xl font-semibold text-[#ABB2BF] mb-2">Total Result for {quantity} Piece(s):</h3>
                        {calculationString && (
                            <p className="text-sm text-[#ABB2BF] opacity-80 mb-1">
                                Calculation: <span className="font-mono text-[#E5C07B]">{calculationString}</span>
                            </p>
                        )}
                        {calculatedTotalDivDisplay > 0 && (
                            <p className="text-lg text-[#ABB2BF] mb-1">
                                Total: <span className="font-bold text-[#E5C07B]">{calculatedTotalDivDisplay.toFixed(2)}</span> Divine(s)
                            </p>
                        )}
                        {calculatedTotalChaosDisplay > 0 && (
                            <p className="text-lg text-[#ABB2BF] mb-1">
                                Total: <span className="font-bold text-[#98C379]">{calculatedTotalChaosDisplay.toFixed(2)}</span> Chaos
                            </p>
                        )}
                        <p className="text-lg text-[#ABB2BF]">
                            Breakdown: <span className="font-bold text-[#E5C07B]">{calculatedDiv}</span> Divine(s) and{' '}
                            <span className="font-bold text-[#98C379]">{calculatedChaos.toFixed(2)}</span> Chaos
                        </p>
                        {/* Small text for clarity on accuracy */}
                        <p className="text-xs text-[#ABB2BF] opacity-60 mt-2">
                            Calculations are based on the provided rate and aim for maximum precision to prevent discrepancies.
                        </p>
                    </div>
                </div>

                {/* Change Calculation Section */}
                <div className="p-6 bg-[#282C34] rounded-lg shadow-xl border border-[#3E4451]">
                    <h2 className="text-2xl font-bold text-[#61AFEF] mb-4 text-center">Change Calculation (Divine Based)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
                        {/* Calculate Change (Div Inputs) */}
                        <div className="p-4 bg-[#21252B] rounded-lg border border-[#3E4451] shadow-inner">
                            <h3 className="text-xl font-semibold text-[#ABB2BF] mb-3">Input in Divines</h3>
                            <label htmlFor="totalCostDiv" className="block text-[#ABB2BF] text-md font-medium mb-1">
                                Total Cost (Div):
                            </label>
                            <input
                                type="number"
                                id="totalCostDiv"
                                value={totalCostDivInput}
                                onChange={handleTotalCostDivChange}
                                placeholder="e.g., 1.7"
                                className="w-full p-2 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200 mb-3"
                                step="0.01"
                            />

                            <label htmlFor="paidAmountDiv" className="block text-[#ABB2BF] text-md font-medium mb-1">
                                Paid Amount (Div):
                            </label>
                            <input
                                type="number"
                                id="paidAmountDiv"
                                value={paidAmountDivInput}
                                onChange={handlePaidAmountDivChange}
                                placeholder="e.g., 2"
                                className="w-full p-2 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200 mb-4"
                                step="0.01"
                            />
                            <button
                                onClick={calculateChangeFromDiv}
                                className="w-full bg-[#C678DD] hover:bg-[#A35BC8] text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C678DD] focus:ring-opacity-75"
                            >
                                Calculate Change
                            </button>
                        </div>

                    </div>

                    {/* Change Results */}
                    <div className="mt-6 p-4 bg-[#21252B] rounded-lg border border-[#3E4451] shadow-inner">
                        <h3 className="text-xl font-semibold text-[#ABB2BF] mb-2">Change to Give:</h3>
                        <p className="text-lg text-[#ABB2BF]">
                            <span className="font-bold text-[#E5C07B]">{changeDiv}</span> Divine(s) and{' '}
                            <span className="font-bold text-[#98C379]">{changeChaos.toFixed(2)}</span> Chaos
                        </p>
                    </div>
                </div>

                <p className="text-center text-[#ABB2BF] text-sm mt-8 opacity-70">
                    Exchange rates can be manually adjusted.
                    <br/>
                    <span>All calculations are based on the manual exchange rate you provide.</span>
                </p>
            </div>
        </div>
    );
};

export default App;
