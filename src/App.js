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
    // State for calculated total Divines (e.g., 3.6 for 3 * 1.2 Div)
    const [calculatedTotalDivDisplay, setCalculatedTotalDivDisplay] = useState(0);
    // State for calculated whole Divines from conversion
    const [calculatedDiv, setCalculatedDiv] = useState(0);
    // State for calculated Chaos from conversion
    const [calculatedChaos, setCalculatedChaos] = useState(0);
    // State for total cost input (Div) for change calculation
    const [totalCostDivInput, setTotalCostDivInput] = useState('');
    // State for paid amount input (Div) for change calculation
    const [paidAmountDivInput, setPaidAmountDivInput] = useState('');
    // State for calculated change in Divines
    const [changeDiv, setChangeDiv] = useState(0);
    // State for calculated change in Chaos
    const [changeChaos, setChangeChaos] = useState(0);


    // Helper function to convert a total Chaos value into Divines and remaining Chaos
    const convertChaosToDivChaos = (totalChaos) => {
        if (divineChaosRate === 0) return { div: 0, chaos: 0 }; // Avoid division by zero

        const div = Math.floor(totalChaos / divineChaosRate); // Calculate whole Divines
        const chaos = totalChaos % divineChaosRate; // Calculate remaining Chaos
        return { div: div, chaos: parseFloat(chaos.toFixed(2)) }; // Round chaos to 2 decimal places
    };

    // Helper function to convert a decimal Divine value into whole Divines and remaining Chaos
    const convertDivToDivChaos = (totalDiv) => {
        if (divineChaosRate === 0) return { div: 0, chaos: 0 }; // Avoid division by zero

        const wholeDiv = Math.floor(totalDiv); // Get whole Divines
        const fractionalDiv = totalDiv - wholeDiv; // Get fractional part of Divine
        const chaos = fractionalDiv * divineChaosRate; // Convert fractional Divine to Chaos
        return { div: wholeDiv, chaos: parseFloat(chaos.toFixed(2)) }; // Round chaos to 2 decimal places
    };

    // Handler for Divine input change
    const handleDivineInputChange = (e) => {
        const value = e.target.value;
        setDivineInput(value);
        const numericValue = parseFloat(value);
        const currentQuantity = parseFloat(quantity);

        if (value === '' || isNaN(numericValue) || isNaN(currentQuantity) || currentQuantity <= 0) {
            setCalculatedTotalDivDisplay(0);
            setCalculatedDiv(0);
            setCalculatedChaos(0);
            setTotalCostDivInput(''); // Explicitly clear totalCostDivInput on invalid input
            return;
        }

        const totalDiv = numericValue * currentQuantity; // Apply quantity
        setCalculatedTotalDivDisplay(totalDiv); // Store for display "X.X Divines"
        const { div, chaos } = convertDivToDivChaos(totalDiv);
        setCalculatedDiv(div);
        setCalculatedChaos(chaos);
    };

    // Handler for Chaos input change
    const handleChaosInputChange = (e) => {
        const value = e.target.value;
        setChaosInput(value);
        const numericValue = parseFloat(value);
        const currentQuantity = parseFloat(quantity);

        if (value === '' || isNaN(numericValue) || isNaN(currentQuantity) || currentQuantity <= 0) {
            setCalculatedTotalDivDisplay(0);
            setCalculatedDiv(0);
            setCalculatedChaos(0);
            setTotalCostDivInput(''); // Explicitly clear totalCostDivInput on invalid input
            return;
        }

        const totalChaos = numericValue * currentQuantity; // Apply quantity
        // Convert total chaos back to decimal div to show the "X.X Divines" total
        setCalculatedTotalDivDisplay(totalChaos / divineChaosRate);
        const { div, chaos } = convertChaosToDivChaos(totalChaos);
        setCalculatedDiv(div);
        setCalculatedChaos(chaos);
    };

    // Handler for quantity input change
    const handleQuantityChange = (e) => {
        const value = e.target.value;
        const numValue = parseInt(value, 10);
        // Ensure quantity is at least 1
        setQuantity(isNaN(numValue) || numValue < 1 ? 1 : numValue);

        // Recalculate based on whichever input currently has a value
        // Use a slight delay to allow quantity state to update before re-running input handlers
        setTimeout(() => {
            if (divineInput !== '') {
                handleDivineInputChange({ target: { value: divineInput } });
            } else if (chaosInput !== '') {
                handleChaosInputChange({ target: { value: chaosInput } });
            }
        }, 0);
    };

    // Handler for manual Divine Chaos Rate change
    const handleDivineChaosRateChange = (e) => {
        const value = parseFloat(e.target.value);
        setDivineChaosRate(isNaN(value) || value <= 0 ? 0 : value);
    };


    // Function to calculate change based on Div inputs
    const calculateChangeFromDiv = useCallback(() => {
        const totalCostDiv = parseFloat(totalCostDivInput);
        const paidAmountDiv = parseFloat(paidAmountDivInput);

        // Only calculate if both inputs are valid numbers
        if (isNaN(totalCostDiv) || isNaN(paidAmountDiv)) {
            setChangeDiv(0);
            setChangeChaos(0);
            return;
        }
        if (totalCostDiv < 0 || paidAmountDiv < 0) {
            setChangeDiv(0); // Reset if negative values
            setChangeChaos(0);
            return;
        }
        if (divineChaosRate === 0) {
            setChangeDiv(0); // Reset if rate is zero
            setChangeChaos(0);
            return;
        }

        // Convert both to total Chaos for calculation
        const totalCostInChaos = totalCostDiv * divineChaosRate;
        const paidAmountInChaos = paidAmountDiv * divineChaosRate;

        if (paidAmountInChaos < totalCostInChaos) {
            setChangeDiv(0); // Reset if paid amount is less
            setChangeChaos(0);
            return;
        }

        const changeInChaos = paidAmountInChaos - totalCostInChaos;
        const { div, chaos } = convertChaosToDivChaos(changeInChaos);
        setChangeDiv(div);
        setChangeChaos(chaos);
    }, [totalCostDivInput, paidAmountDivInput, divineChaosRate]);


    // Handler for total cost divine change (autofills paid amount)
    const handleTotalCostDivChange = (e) => {
        const value = e.target.value;
        setTotalCostDivInput(value); // Update the total cost input state
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
    }, [totalCostDivInput]); // Only totalCostDivInput as dependency here.

    // Handler for paid amount divine change (manual input)
    const handlePaidAmountDivChange = (e) => {
        setPaidAmountDivInput(e.target.value);
    };

    // Effect to auto-fill totalCostDivInput with calculatedTotalDivDisplay
    useEffect(() => {
        if (!isNaN(calculatedTotalDivDisplay) && calculatedTotalDivDisplay > 0) {
            // Ensure totalCostDivInput is updated with the current calculated total,
            // formatted to 2 decimal places. This will then trigger the paidAmountDivInput autofill.
            setTotalCostDivInput(calculatedTotalDivDisplay.toFixed(2));
        } else {
            setTotalCostDivInput(''); // Clear totalCostDivInput if calculated display is invalid or 0
        }
    }, [calculatedTotalDivDisplay]);

    // Effect to recalculate change when totalCostDivInput or paidAmountDivInput changes
    // This is the primary trigger for the change calculation results display.
    useEffect(() => {
        calculateChangeFromDiv();
    }, [totalCostDivInput, paidAmountDivInput, divineChaosRate, calculateChangeFromDiv]);


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

                    {/* Quantity Input */}
                    <div className="mb-6">
                        <label htmlFor="quantityInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                            Quantity (pcs):
                        </label>
                        <input
                            type="number"
                            id="quantityInput"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            placeholder="1"
                            className="w-full p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Convert from Divines */}
                        <div>
                            <label htmlFor="divineInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                                Price per piece in Divines (e.g., 1.7):
                            </label>
                            <input
                                type="number"
                                id="divineInput"
                                value={divineInput}
                                onChange={handleDivineInputChange}
                                placeholder="e.g., 1.7"
                                className="w-full p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                                step="0.1" /* Changed step to 0.1 for increment/decrement */
                            />
                        </div>

                        {/* Convert from Chaos */}
                        <div>
                            <label htmlFor="chaosInput" className="block text-[#ABB2BF] text-lg font-medium mb-2">
                                Price per piece in Chaos (e.g., 30):
                            </label>
                            <input
                                type="number"
                                id="chaosInput"
                                value={chaosInput}
                                onChange={handleChaosInputChange}
                                placeholder="e.g., 30"
                                className="w-full p-3 rounded-lg bg-[#1D2025] text-[#ABB2BF] border border-[#3E4451] focus:border-[#61AFEF] focus:ring-1 focus:ring-[#61AFEF] transition duration-200"
                            />
                        </div>
                    </div>

                    {/* Conversion Results */}
                    <div className="mt-6 p-4 bg-[#21252B] rounded-lg border border-[#3E4451] shadow-inner">
                        <h3 className="text-xl font-semibold text-[#ABB2BF] mb-2">Total Result for {quantity} Piece(s):</h3>
                        {calculatedTotalDivDisplay > 0 && (
                            <p className="text-lg text-[#ABB2BF] mb-1">
                                Total: <span className="font-bold text-[#E5C07B]">{calculatedTotalDivDisplay.toFixed(2)}</span> Divine(s)
                            </p>
                        )}
                        <p className="text-lg text-[#ABB2BF]">
                            Breakdown: <span className="font-bold text-[#E5C07B]">{calculatedDiv}</span> Divine(s) and{' '}
                            <span className="font-bold text-[#98C379]">{calculatedChaos.toFixed(2)}</span> Chaos
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
