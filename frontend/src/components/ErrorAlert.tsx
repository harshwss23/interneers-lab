import React from 'react';

interface ErrorAlertProps {
    message: string;
    onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                    backgroundColor: '#fee2e2', 
                    color: '#dc2626', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold'
                }}>!</div>
                <span style={{ color: '#991b1b', fontWeight: 500 }}>{message}</span>
            </div>
            {onClose && (
                <button 
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#991b1b',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        padding: '0.25rem'
                    }}
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default ErrorAlert;
