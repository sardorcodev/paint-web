import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ProPaint runtime error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-fallback" role="alert">
                    <h1>Something went wrong.</h1>
                    <p>Please refresh the page to continue working in ProPaint.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
