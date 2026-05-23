import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function AuctionListing() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchAuctions() {
        try {
            const res = await API.get('/auctions/listing');
            setAuctions(res.data);
        } catch (err) {
            console.error('Failed to fetch auctions:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAuctions();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchAuctions, 30000);
        return () => clearInterval(interval);
    }, []);

    function getStatusClass(status) {
        switch (status) {
            case 'active':
                return 'badge badge-active';
            case 'closed':
                return 'badge badge-closed';
            case 'force_closed':
                return 'badge badge-force_closed';
            case 'draft':
                return 'badge badge-draft';
            default:
                return 'badge badge-closed';
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString([], {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            Loading auctions...
        </div>
    );

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: '24px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-action)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Active Auctions
                </h2>
                <button onClick={() => navigate('/create')} className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create RFQ
                </button>
            </div>

            {auctions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No auctions found</p>
                    <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Create your first RFQ to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="saas-table">
                        <thead>
                            <tr>
                                <th>Reference ID</th>
                                <th>RFQ Name</th>
                                <th>Lowest Bid (₹)</th>
                                <th style={{ textAlign: 'center' }}>Total Bids</th>
                                <th>Bid Close Time</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auctions.map((auction) => (
                                <tr key={auction.id}>
                                    <td style={{ fontWeight: '500', color: 'var(--color-action)' }}>{auction.reference_id}</td>
                                    <td style={{ fontWeight: '500' }}>{auction.name}</td>
                                    <td>
                                        {auction.current_lowest_bid
                                            ? <span style={{ fontWeight: '600' }}>₹{Number(auction.current_lowest_bid).toLocaleString()}</span>
                                            : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{
                                            backgroundColor: '#f1f5f9',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            {auction.total_bids}
                                        </span>
                                    </td>
                                    <td>{formatDate(auction.bid_close_time)}</td>
                                    <td>
                                        <span className={getStatusClass(auction.status)}>
                                            {auction.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => navigate(`/auction/${auction.id}`)}
                                                className="btn"
                                                style={{ backgroundColor: '#f1f5f9', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                            >
                                                View
                                            </button>
                                            {auction.status === 'active' && (
                                                <button
                                                    onClick={() => navigate(`/bid/${auction.id}`)}
                                                    className="btn btn-primary"
                                                >
                                                    Bid
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AuctionListing;