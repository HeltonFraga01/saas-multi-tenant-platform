import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-12 w-12 text-primary/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground text-lg">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
          <p className="text-sm text-muted-foreground">
            Verifique se o endereço está correto ou use os links abaixo para navegar.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Voltar ao início</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 w-full border border-input py-3 px-6 rounded-lg hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Página anterior</span>
          </button>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{' '}
            <a 
              href="mailto:suporte@saasmaster.com" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;