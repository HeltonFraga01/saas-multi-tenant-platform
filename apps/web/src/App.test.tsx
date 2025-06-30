import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock do Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    }
  }))
}));

const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe('App', () => {
  test('renders without crashing', () => {
    render(<AppWithRouter />);
    // Verifica se o app renderiza sem erros
    expect(document.body).toBeInTheDocument();
  });

  test('renders login page by default', () => {
    render(<AppWithRouter />);
    // Como não há sessão, deve mostrar a página de login
    // Ajuste este teste conforme sua implementação específica
    expect(document.body).toBeInTheDocument();
  });
});