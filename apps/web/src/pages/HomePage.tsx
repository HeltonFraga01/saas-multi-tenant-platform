import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, Users } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Performance Otimizada',
      description: 'Aplicação serverless com carregamento ultra-rápido e escalabilidade automática.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Segurança Avançada',
      description: 'Row Level Security, autenticação robusta e proteção de dados de ponta.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Multi-Tenant',
      description: 'Isolamento completo de dados entre empresas com gestão centralizada.',
    },
  ];

  const benefits = [
    'Setup em minutos, não em semanas',
    'Escalabilidade automática',
    'Pagamentos integrados (PIX, Cartão, Boleto)',
    'Chat IA nativo',
    'Dashboard completo',
    'API REST documentada',
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-foreground">SaaS Platform</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contato
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/login"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
              >
                <span>Começar Agora</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              A Plataforma SaaS
              <span className="text-gradient block">
                Multi-Tenant Definitiva
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              Construa e escale seu negócio com nossa plataforma completa. 
              Pagamentos, chat IA, dashboards e muito mais, tudo em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center space-x-2 text-lg font-medium"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <button className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center space-x-2 text-lg">
                <span>Ver Demo</span>
                <span className="text-2xl">▶</span>
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Sem cartão de crédito • Setup em 5 minutos • Suporte 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para construir e escalar seu SaaS
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-lg border border-border card-hover">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Por que escolher nossa plataforma?
              </h2>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link
                  to="/login"
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-2xl">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  Dashboard em Tempo Real
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Usuários Ativos</span>
                    <span className="font-semibold text-green-500">+23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Receita Mensal</span>
                    <span className="font-semibold text-green-500">R$ 45.2k</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversões</span>
                    <span className="font-semibold text-green-500">12.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já transformaram seus negócios
            </p>
            
            <Link
              to="/login"
              className="bg-background text-foreground px-8 py-3 rounded-lg hover:bg-background/90 transition-colors inline-flex items-center space-x-2 text-lg font-medium"
            >
              <span>Começar Gratuitamente</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 SaaS Platform. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              Desenvolvido com ❤️ pelo SaaSMaster Dev
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;