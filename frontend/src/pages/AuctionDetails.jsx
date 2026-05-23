import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function AuctionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(null);

    const fetchDetails = useCallback(async () => {
        try {
            const res = await API.get(`/rfqs/${id}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch auction details:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const checkStatus = useCallback(async () => {
        try {
            await API.post(`/auctions/check-status/${id}`);
            fetchDetails();
        } catch (err) {
            console.error('Failed to check status:', err);
        }
    }, [id, fetchDetails]);

    useEffect(() => {
        fetchDetails();
        const refreshInterval = setInterval(() => {
            checkStatus();
        }, 15000);
        return () => clearInterval(refreshInterval);
    }, [fetchDetails, checkStatus]);

    useEffect(() => {
        if (!data) return;
        const timer = setInterval(() => {
            const now = new Date();
            const closeTime = new Date(data.rfq.bid_close_time);
            const diff = closeTime - now;
            if (diff <= 0) {
                setTimeRemaining('Closed');
                checkStatus();
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeRemaining(`${mins}m ${secs}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [data, checkStatus]);

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString([], {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    function getStatusClass(status) {
        switch (status) {
            case 'active': return 'badge badge-active';
            case 'closed': return 'badge badge-closed';
            case 'force_closed': return 'badge badge-force_closed';
            case 'draft': return 'badge badge-draft';
            default: return 'badge badge-closed';
        }
    }

    function getRankLabel(rank) {
        if (rank === 1) return { label: 'L1', color: '#166534', bg: '#dcfce7' };
        if (rank === 2) return { label: 'L2', color: '#9a3412', bg: '#ffedd5' };
        if (rank === 3) return { label: 'L3', color: '#991b1b', bg: '#fee2e2' };
        return { label: `L${rank}`, color: '#475569', bg: '#f1f5f9' };
    }

    function getEventIcon(eventType) {
        switch (eventType) {
            case 'bid_submitted': 
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
            case 'time_extended': 
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
            case 'auction_closed': 
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
            case 'force_closed': 
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
            default: 
                return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
        }
    }

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading details...</div>;
    if (!data) return <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>Auction not found.</div>;

    const { rfq, auction_config, bids, activity_log } = data;

    return (
        <div>
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
                Back to Auctions
            </button>

            {/* Header */}
            <div className="card" style={{
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                borderTop: '4px solid var(--color-action)'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>{rfq.name}</h2>
                        <span className={getStatusClass(rfq.status)}>{rfq.status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            {rfq.reference_id}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Buyer: {rfq.buyer_name}
                        </span>
                    </div>
                </div>
                
                {rfq.status === 'active' && (
                    <div style={{ 
                        backgroundColor: '#eff6ff', 
                        padding: '12px 20px', 
                        borderRadius: '8px', 
                        border: '1px solid #bfdbfe',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '600', textTransform: 'uppercase' }}>Time Remaining</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8', fontFamily: 'monospace' }}>
                            {timeRemaining || '...'}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <InfoCard
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                    title="Bid Close Time"
                    value={formatDate(rfq.bid_close_time)}
                />
                <InfoCard
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                    title="Forced Close"
                    value={formatDate(rfq.forced_close_time)}
                />
                <InfoCard
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                    title="Pickup Date"
                    value={new Date(rfq.pickup_service_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                />
            </div>

            {/* Auction Config */}
            {auction_config && (
                <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: 'var(--text-secondary)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        Auction Rules
                    </h3>
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', fontSize: '14px' }}>
                        <div>
                            <div style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>Trigger Window</div>
                            <div style={{ fontWeight: '500' }}>{auction_config.trigger_window_minutes} mins</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>Extension Duration</div>
                            <div style={{ fontWeight: '500' }}>{auction_config.extension_duration_minutes} mins</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>Extension Trigger</div>
                            <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>{auction_config.extension_trigger.replace(/_/g, ' ')}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bids Table */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h3 style={{ margin: 0, fontSize: '20px' }}>Supplier Bids</h3>
                    {rfq.status === 'active' && (
                        <button
                            onClick={() => navigate(`/bid/${rfq.id}`)}
                            className="btn btn-primary"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Submit Bid
                        </button>
                    )}
                </div>

                {bids.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No bids submitted yet.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="saas-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                                    <th>Supplier</th>
                                    <th>Carrier</th>
                                    <th>Freight</th>
                                    <th>Origin</th>
                                    <th>Dest</th>
                                    <th>Total (₹)</th>
                                    <th>Transit</th>
                                    <th>Valid Until</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bids.map((bid, index) => {
                                    const rank = getRankLabel(bid.ranking);
                                    return (
                                        <tr key={bid.id} style={{ backgroundColor: bid.ranking === 1 ? '#f8fafc' : 'transparent' }}>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    backgroundColor: rank.bg,
                                                    color: rank.color,
                                                    fontWeight: '700',
                                                    fontSize: '12px'
                                                }}>
                                                    {rank.label}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{bid.supplier_name}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{bid.carrier_name}</td>
                                            <td>₹{Number(bid.freight_charges).toLocaleString()}</td>
                                            <td>₹{Number(bid.origin_charges).toLocaleString()}</td>
                                            <td>₹{Number(bid.destination_charges).toLocaleString()}</td>
                                            <td style={{
                                                fontWeight: bid.ranking === 1 ? '700' : '600',
                                                color: bid.ranking === 1 ? '#166534' : 'var(--text-primary)'
                                            }}>
                                                ₹{Number(bid.total_amount).toLocaleString()}
                                            </td>
                                            <td>{bid.transit_time}d</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{new Date(bid.quote_validity).toLocaleDateString([], { month: 'short', day: 'numeric' })}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Activity Log */}
            <div>
                <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Activity Log</h3>
                {activity_log.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)' }}>No activity yet.</div>
                ) : (
                    <div className="card" style={{ padding: '0' }}>
                        {activity_log.map((log, index) => (
                            <div
                                key={log.id}
                                style={{
                                    padding: '16px 24px',
                                    borderBottom: index < activity_log.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    backgroundColor: log.event_type === 'time_extended' ? '#fffbeb' : 'transparent'
                                }}
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    backgroundColor: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {getEventIcon(log.event_type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                        {log.description}
                                    </div>
                                    {log.event_type === 'time_extended' && (
                                        <div style={{ fontSize: '13px', color: '#b45309', backgroundColor: '#fef3c7', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', marginBottom: '4px' }}>
                                            {formatDate(log.old_close_time)} → {formatDate(log.new_close_time)}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoCard({ title, value, icon }) {
    return (
        <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
            <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                backgroundColor: '#f1f5f9', 
                color: 'var(--color-action)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

export default AuctionDetails;