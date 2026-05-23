import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function CreateRFQ() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        buyer_id: '1',
        pickup_service_date: '',
        bid_start_time: '',
        bid_close_time: '',
        forced_close_time: '',
        trigger_window_minutes: 10,
        extension_duration_minutes: 5,
        extension_trigger: 'bid_received'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/rfqs/create', form);
            // Auto activate the RFQ
            await API.post(`/auctions/activate/${res.data.rfq_id}`);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/')}
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
                Back
            </button>

            <div className="card">
                <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Create New RFQ</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Fill in the details below to initialize a new auction.</p>
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">RFQ Name</label>
                        <input
                            className="form-input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Mumbai to Delhi Freight"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label className="form-label">Pickup / Service Date</label>
                            <input
                                className="form-input"
                                type="date"
                                name="pickup_service_date"
                                value={form.pickup_service_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Bid Start Time</label>
                            <input
                                className="form-input"
                                type="datetime-local"
                                name="bid_start_time"
                                value={form.bid_start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label className="form-label">Bid Close Time</label>
                            <input
                                className="form-input"
                                type="datetime-local"
                                name="bid_close_time"
                                value={form.bid_close_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Forced Close Time</label>
                            <input
                                className="form-input"
                                type="datetime-local"
                                name="forced_close_time"
                                value={form.forced_close_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Auction Configuration</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', fontSize: '14px' }}>Set the rules for auto-extensions.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <label className="form-label">Trigger Window (mins)</label>
                            <input
                                className="form-input"
                                type="number"
                                name="trigger_window_minutes"
                                value={form.trigger_window_minutes}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Extension Duration (mins)</label>
                            <input
                                className="form-input"
                                type="number"
                                name="extension_duration_minutes"
                                value={form.extension_duration_minutes}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Extension Trigger</label>
                            <select
                                className="form-input form-select"
                                name="extension_trigger"
                                value={form.extension_trigger}
                                onChange={handleChange}
                            >
                                <option value="bid_received">Bid Received in Window</option>
                                <option value="any_rank_change">Any Supplier Rank Change</option>
                                <option value="l1_rank_change">L1 Rank Change</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="btn"
                            style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create RFQ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRFQ;
