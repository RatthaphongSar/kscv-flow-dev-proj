import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <h3 className="text-red-700 font-semibold mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-sm text-red-600">กรุณารีเฟรชหน้าเว็บเพื่อลองใหม่อีกครั้ง</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            รีเฟรชหน้าเว็บ
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}