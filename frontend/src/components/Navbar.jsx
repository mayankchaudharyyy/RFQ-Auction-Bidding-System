import { Link, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    
    return (
        <nav style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            padding: '0 32px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)'
        }}>

            {/* Logo */}
            <Link to="/" style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: 'var(--text-primary)',
                fontSize: '18px',
                fontWeight: '700',
                textDecoration: 'none',
                letterSpacing: '-0.02em'
            }}>
                <div style={{
                    backgroundColor: 'var(--color-action)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                </div>
                <span>RFQ Auction</span>
            </Link>

            {/* Right Menu */}
            <div style={{
                display: 'flex',
                gap: '32px',
                alignItems: 'center'
            }}>

                <Link to="/" style={{
                    color: location.pathname === '/' ? 'var(--color-action)' : 'var(--text-secondary)',
                    fontWeight: location.pathname === '/' ? '600' : '500',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'color 0.2s'
                }}>
                    Auctions
                </Link>

                <Link to="/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Create RFQ
                </Link>

            </div>
        </nav>
    );
}

export default Navbar;