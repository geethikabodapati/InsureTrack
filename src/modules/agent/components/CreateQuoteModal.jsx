import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/modal.css';

const CreateQuoteModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        productId: '',
        insuredObjectId: '',
        coverageSelection: 'LIABILITY' // Default selection for the UI
    });
    const [loading, setLoading] = useState(false);

    // List of coverage options for the dropdown
    const coverageOptions = [
        { label: 'Liability', value: 'LIABILITY', details: { coverage: 'LIABILITY' } },
        { label: 'Collision & Comprehensive', value: 'COLLISION', details: { type: 'Collision', deductible: 500 } },
        { label: 'Full Coverage', value: 'FULL', details: { type: 'Full', limit: 500000, deductible: 250 } }
    ];

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(false);

        // Find the full object for the selected coverage to turn into JSON
        const selectedCoverage = coverageOptions.find(c => c.value === formData.coverageSelection);
        
        // Prepare the DTO to match your Spring Boot QuoteRequestDTO
        const payload = {
            customerId: parseInt(formData.customerId),
            productId: parseInt(formData.productId),
            insuredObjectId: parseInt(formData.insuredObjectId),
            // Convert the object to a JSON string as expected by your @Column(columnDefinition = "TEXT")
            coveragesJSON: JSON.stringify(selectedCoverage.details)
        };

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8082/api/agent/quotes/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess(data);
                onClose();
            }
        } catch (error) {
            console.error("Failed to create draft", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create Quote Draft</h2>
                    <button className="close-modal-btn" onClick={onClose}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="quote-form-group">
                        <label>Customer ID</label>
                        <input 
                            type="number" 
                            className="quote-form-input" 
                            required 
                            placeholder="e.g. 101"
                            value={formData.customerId}
                            onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                        />
                    </div>

                    <div className="quote-form-group">
                        <label>Product ID</label>
                        <input 
                            type="number" 
                            className="quote-form-input" 
                            required 
                            placeholder="e.g. 5"
                            value={formData.productId}
                            onChange={(e) => setFormData({...formData, productId: e.target.value})}
                        />
                    </div>

                    <div className="quote-form-group">
                        <label>Insured Object ID</label>
                        <input 
                            type="number" 
                            className="quote-form-input" 
                            placeholder="e.g. 202"
                            value={formData.insuredObjectId}
                            onChange={(e) => setFormData({...formData, insuredObjectId: e.target.value})}
                        />
                    </div>

                    <div className="quote-form-group">
                        <label>Coverage Plan</label>
                        {/* User-friendly dropdown instead of a JSON text area */}
                        <select 
                            className="quote-form-input"
                            value={formData.coverageSelection}
                            onChange={(e) => setFormData({...formData, coverageSelection: e.target.value})}
                        >
                            {coverageOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Generating...' : 'Create Draft'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuoteModal;