#!/usr/bin/env node

// Script executor principal para seeding abrangente
import { seedComprehensiveData } from './seed-comprehensive.js';
import { seedAllChatData } from './seed-chat-messages.js';

async function runFullSeeding() {
  console.log('🚀 INICIANDO SEEDING COMPLETO DO BANCO DE DADOS');
  console.log('=' .repeat(70));
  console.log('');
  
  console.log('Este script irá popular o banco com dados realistas para:');
  console.log('📊 Dashboard de métricas');
  console.log('💬 Sistema de chat');
  console.log('🎯 Tracking UTM');
  console.log('👥 Gestão de contatos');
  console.log('📈 Análises e relatórios');
  console.log('');
  console.log('⚠️  ATENÇÃO: Este processo irá adicionar muitos dados ao banco!');
  console.log('');
  
  try {
    // Etapa 1: Dados principais
    console.log('🔄 ETAPA 1: Populando dados principais...');
    await seedComprehensiveData();
    
    console.log('');
    console.log('⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Etapa 2: Dados de chat
    console.log('🔄 ETAPA 2: Populando dados de chat...');
    await seedAllChatData();
    
    console.log('');
    console.log('=' .repeat(70));
    console.log('🎉 SEEDING COMPLETO FINALIZADO COM SUCESSO!');
    console.log('');
    console.log('✨ Seu banco de dados agora está populado com dados realistas.');
    console.log('📊 Acesse o dashboard de métricas para ver os resultados.');
    console.log('💬 Teste o sistema de chat com os dados criados.');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Acesse /metrics para ver o dashboard funcionando');
    console.log('2. Verifique /clients para ver os contatos criados');
    console.log('3. Teste /chats para ver as conversas');
    console.log('');
    
  } catch (error) {
    console.error('❌ ERRO DURANTE O SEEDING COMPLETO:', error);
    console.log('');
    console.log('🔧 DICAS PARA RESOLUÇÃO:');
    console.log('1. Verifique se o Supabase está acessível');
    console.log('2. Confirme se as tabelas existem no banco');
    console.log('3. Verifique as permissões de acesso');
    process.exit(1);
  }
}

// Executar seeding completo
runFullSeeding()
  .then(() => {
    console.log('🏁 Processo finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });