import "./styles/EmptyMessage.css";

const EmptyAcceptedJournalMessage = () => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-content">
                <div className="empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 3h18v18H3zM8 8v8m8-8v8" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <h3 className="empty-state-title">No Accepted Journals Found</h3>
                <p className="empty-state-message">
                    There are currently no accepted journals to display.
                </p>
            </div>
        </div>
    );
};

export default EmptyAcceptedJournalMessage;