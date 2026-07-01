import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Or your custom api client

const PaymentModal = ({ invoice, onClose, onPaymentComplete }) => {
  const [savedMethods, setSavedMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  // Controls whether we show the saved cards list OR the new card form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch saved methods when modal opens
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get('/api/v1/payment-methods', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const methods = response.data;
        setSavedMethods(methods);

        // 2. Logic gate: If they have cards, select the first one. If not, force the "Add New" form.
        if (methods.length > 0) {
          setSelectedMethodId(methods[0].id);
          setIsAddingNew(false);
        } else {
          setIsAddingNew(true);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // 3. Handle the final "Pay" button click
  const handleProcessPayment = async () => {
    if (isAddingNew) {
      // Logic to tokenize the new card (e.g., via Stripe Elements)
      // Save it to backend, then process payment
      console.log("Processing with NEW card details...");
    } else {
      // Logic to process payment with the selected existing method ID
      console.log("Processing with SAVED method ID:", selectedMethodId);
      // await axios.post(`/api/v1/payments`, { invoiceId: invoice.id, paymentMethodId: selectedMethodId })
    }
  };

  if (isLoading) return <div>Loading payment details...</div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Complete Your Payment</h2>

        <div className="amount-display">
          <p>Total Amount Due</p>
          <h1>${invoice.amount}</h1>
          <p>For: {invoice.type}</p>
        </div>

        {/* 4. Conditional Rendering based on state */}
        {!isAddingNew ? (
          <div className="saved-methods-section">
            <h3>Select Payment Method</h3>
            {savedMethods.map((method) => (
              <label key={method.id} className="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethodId === method.id}
                  onChange={() => setSelectedMethodId(method.id)}
                />
                {method.brand} ending in {method.last4}
              </label>
            ))}

            <button
              className="add-new-btn"
              onClick={() => setIsAddingNew(true)}
            >
              + Add New Payment Method
            </button>
          </div>
        ) : (
          <div className="new-method-section">
            <h3>Enter Card Details</h3>
            {/* Stripe Elements or your standard input form goes here */}
            <input type="text" placeholder="Card Number" />
            <div className="row">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVC" />
            </div>

            {/* Allow them to go back to saved cards IF they actually have saved cards */}
            {savedMethods.length > 0 && (
              <button
                className="cancel-add-btn"
                onClick={() => setIsAddingNew(false)}
              >
                Use a saved card
              </button>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>CANCEL</button>
          <button onClick={handleProcessPayment} className="pay-btn">
            PAY ${invoice.amount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;