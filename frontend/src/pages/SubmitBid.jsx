import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function SubmitBid() {
    const { rfq_id } = useParams();
    const navigate = useNavigate();
    const [rfq, setRfq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        supplier_id: '2',
        carrier_name: '',
        freight_charges: '',
        origin_charges: '',
        destination_charges: '',
        transit_time: '',
        quote_validity: ''
    });

    useEffect(() => {
        async function fetchRFQ() {
            try {
                const res = await API.get(`/rfqs/${rfq_id}`);
                setRfq(res.data.rfq);
            } catch (err) {
                console.error('Failed to fetch RFQ:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchRFQ();
    }, [rfq_id]);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const payload = {
                rfq_id,
                supplier_id: form.supplier_id,
                carrier_name: form.carrier_name,
                freight_charges: parseFloat(form.freight_charges),
                origin_charges: parseFloat(form.origin_charges) || 0,
                destination_charges: parseFloat(form.destination_charges) || 0,
                transit_time: parseInt(form.transit_time),
                quote_validity: form.quote_validity
            };

            const res = await API.post('/bids/submit', payload);

            const newCloseTime = new Date(res.data.current_bid_close_time).toLocaleString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            setSuccess(`Bid submitted successfully! Current close time is now ${newCloseTime}.`);

            // Reset form
            setForm({
                supplier_id: form.supplier_id,
                carrier_name: '',
                freight_charges: '',
                origin_charges: '',
                destination_charges: '',
                transit_time: '',
                quote_validity: ''
            });

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit bid. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const totalAmount =
        (parseFloat(form.freight_charges) || 0) +
        (parseFloat(form.origin_charges) || 0) +
        (parseFloat(form.destination_charges) || 0);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading RFQ details...</div>;
    if (!rfq) return <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>RFQ not found.</div>;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

            <button
                onClick={() => navigate(`/auction/${rfq_id}`)}
                className="btn"
                style={{
                    marginBottom: '24px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Auction
            </button>

            <div className="card">
                {/* RFQ Info */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '32px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ 
                            backgroundColor: '#e0e7ff', 
                            color: '#3730a3', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            fontSize: '12px', 
                            fontWeight: '600' 
                        }}>
                            {rfq.reference_id}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{rfq.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Closes: <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(rfq.bid_close_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Submit Your Quote</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Please provide your best rates for this requirement.</p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '16px',
                        borderRadius: '6px',
                        marginBottom: '24px',
                        fontSize: '14px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: '500' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            {success}
                        </div>
                        <button
                            onClick={() => navigate(`/auction/${rfq_id}`)}
                            className="btn"
                            style={{ backgroundColor: '#ffffff', border: '1px solid #bbf7d0', color: '#166534' }}
                        >
                            View Auction Updates
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label className="form-label">Supplier</label>
                            <select
                                className="form-input form-select"
                                name="supplier_id"
                                value={form.supplier_id}
                                onChange={handleChange}
                            >
                                <option value={2}>Supplier One</option>
                                <option value={3}>Supplier Two</option>
                                <option value={4}>Supplier Three</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Carrier Name</label>
                            <input
                                className="form-input"
                                name="carrier_name"
                                value={form.carrier_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Fast Freight Co"
                            />
                        </div>
                    </div>

                    {/* Charges breakdown */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Charges Breakdown (₹)
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Freight Charges *</label>
                                <input
                                    className="form-input"
                                    style={{ width: '150px', textAlign: 'right' }}
                                    type="number"
                                    name="freight_charges"
                                    value={form.freight_charges}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Origin Charges</label>
                                <input
                                    className="form-input"
                                    style={{ width: '150px', textAlign: 'right' }}
                                    type="number"
                                    name="origin_charges"
                                    value={form.origin_charges}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Destination Charges</label>
                                <input
                                    className="form-input"
                                    style={{ width: '150px', textAlign: 'right' }}
                                    type="number"
                                    name="destination_charges"
                                    value={form.destination_charges}
                                    onChange={handleChange}
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>Total Amount</span>
                                <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-action)' }}>
                                    ₹{totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label className="form-label">Transit Time (days)</label>
                            <input
                                className="form-input"
                                type="number"
                                name="transit_time"
                                value={form.transit_time}
                                onChange={handleChange}
                                required
                                min="1"
                                placeholder="e.g. 3"
                            />
                        </div>
                        <div>
                            <label className="form-label">Quote Validity</label>
                            <input
                                className="form-input"
                                type="date"
                                name="quote_validity"
                                value={form.quote_validity}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ padding: '12px 32px', fontSize: '16px' }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Quote'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SubmitBid;
