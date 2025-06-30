import { supabase } from './client';
import type { Database } from './types';

type Company = Database['public']['Tables']['companies']['Row'];
type Plan = Database['public']['Tables']['plans']['Row'];

/**
 * Testa a conexão básica com o Supabase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    console.log('📊 Dados de teste:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

/**
 * Lista todos os planos disponíveis
 */
export async function listPlans(): Promise<Plan[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar planos:', error.message);
      return [];
    }
    
    console.log(`✅ ${data.length} planos encontrados`);
    return data;
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar planos:', error);
    return [];
  }
}

/**
 * Lista todas as empresas (apenas para teste - em produção seria filtrado por RLS)
 */
export async function listCompanies(): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        email,
        slug,
        is_active,
        created_at,
        plans (
          id,
          name,
          type
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error.message);
      return [];
    }
    
    console.log(`✅ ${data.length} empresas encontradas`);
    return data as Company[];
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar empresas:', error);
    return [];
  }
}

/**
 * Testa operação de inserção (cria uma empresa de teste)
 */
export async function testInsert(): Promise<boolean> {
  try {
    // Busca um plano gratuito para associar
    const { data: freePlan } = await supabase
      .from('plans')
      .select('id')
      .eq('type', 'free')
      .single();
    
    if (!freePlan) {
      console.error('❌ Plano gratuito não encontrado');
      return false;
    }
    
    const testCompany = {
      name: 'Empresa Teste',
      email: 'teste@exemplo.com',
      slug: `teste-${Date.now()}`,
      plan_id: freePlan.id,
      is_active: true
    };
    
    const { data, error } = await supabase
      .from('companies')
      .insert(testCompany)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao inserir empresa:', error.message);
      return false;
    }
    
    console.log('✅ Empresa de teste criada:', data);
    
    // Remove a empresa de teste
    await supabase
      .from('companies')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Empresa de teste removida');
    return true;
  } catch (error) {
    console.error('❌ Erro inesperado no teste de inserção:', error);
    return false;
  }
}

/**
 * Executa todos os testes básicos
 */
export async function runBasicTests(): Promise<void> {
  console.log('🚀 Iniciando testes básicos do Supabase...');
  console.log('=' .repeat(50));
  
  // Teste 1: Conexão
  console.log('\n1️⃣ Testando conexão...');
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.log('❌ Falha na conexão. Verifique as configurações.');
    return;
  }
  
  // Teste 2: Listagem de planos
  console.log('\n2️⃣ Testando listagem de planos...');
  const plans = await listPlans();
  plans.forEach(plan => {
    console.log(`   📋 ${plan.name} (${plan.type}) - R$ ${plan.price_monthly || 0}/mês`);
  });
  
  // Teste 3: Listagem de empresas
  console.log('\n3️⃣ Testando listagem de empresas...');
  const companies = await listCompanies();
  companies.slice(0, 3).forEach(company => {
    console.log(`   🏢 ${company.name} (${company.slug})`);
  });
  
  // Teste 4: Inserção e remoção
  console.log('\n4️⃣ Testando inserção e remoção...');
  const insertOk = await testInsert();
  
  console.log('\n' + '=' .repeat(50));
  if (connectionOk && plans.length > 0 && insertOk) {
    console.log('🎉 Todos os testes básicos passaram!');
    console.log('✅ Supabase configurado corretamente');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique a configuração.');
  }
}

// Executa os testes se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runBasicTests();
}