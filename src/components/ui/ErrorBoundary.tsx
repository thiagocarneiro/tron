'use client'
import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Algo deu errado</h3>
            <p className="text-sm text-[#a0a0a0] max-w-md">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF3B30] hover:bg-[#E0342B] text-white rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
