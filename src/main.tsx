import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro na aplicação Encontro Certo MG:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-orange-200 space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl mx-auto flex items-center justify-center text-3xl">
              💛
            </div>
            <h2 className="text-2xl font-black text-zinc-800">
              Uai, deu um tropeço por aqui!
            </h2>
            <p className="text-xs text-zinc-600">
              Não se preocupe, a gente guarda sua prosa com carinho. Clique abaixo para recarregar o Encontro Certo MG.
            </p>
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold rounded-2xl shadow hover:opacity-95"
              >
                Recarregar Página ☕
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-xl hover:bg-zinc-200"
              >
                Limpar Cache e Reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
