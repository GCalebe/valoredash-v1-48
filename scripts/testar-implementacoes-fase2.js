/**
 * Script para testar as implementações da Fase 2
 * Testa se as funcionalidades de chat, sessões e configurações estão funcionando
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função para testar inserção em n8n_chat_memory
 */
async function testarChatMemory() {
  console.log('\n🧠 TESTANDO N8N_CHAT_MEMORY...');
  
  try {
    const testData = {
      session_id: 'test-session-' + Date.now(),
      memory_data: {
        test: true,
        context: 'Teste de memória contextual',
        created_by: 'script-teste',
        timestamp: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('n8n_chat_memory')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir em n8n_chat_memory:', error.message);
      return false;
    }

    console.log('✅ Inserção em n8n_chat_memory bem-sucedida:', data.id);
    
    // Testar atualização
    const { error: updateError } = await supabase
      .from('n8n_chat_memory')
      .update({
        memory_data: {
          ...testData.memory_data,
          updated: true,
          updated_at: new Date().toISOString()
        }
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar n8n_chat_memory:', updateError.message);
      return false;
    }

    console.log('✅ Atualização em n8n_chat_memory bem-sucedida');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de n8n_chat_memory:', error.message);
    return false;
  }
}

/**
 * Função para testar inserção em n8n_chat_histories
 */
async function testarChatHistories() {
  console.log('\n📜 TESTANDO N8N_CHAT_HISTORIES...');
  
  try {
    const testData = {
      session_id: 'test-session-' + Date.now(),
      message_data: {
        id: 'test-msg-' + Date.now(),
        content: 'Mensagem de teste para histórico',
        role: 'user',
        type: 'text',
        timestamp: new Date().toISOString()
      },
      sender: 'user',
      message_type: 'text'
    };

    const { data, error } = await supabase
      .from('n8n_chat_histories')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir em n8n_chat_histories:', error.message);
      return false;
    }

    console.log('✅ Inserção em n8n_chat_histories bem-sucedida:', data.id);
    
    // Testar inserção de resposta do assistente
    const responseData = {
      session_id: testData.session_id,
      message_data: {
        id: 'test-response-' + Date.now(),
        content: 'Resposta do assistente para teste',
        role: 'assistant',
        type: 'text',
        timestamp: new Date().toISOString()
      },
      sender: 'assistant',
      message_type: 'text'
    };

    const { data: responseResult, error: responseError } = await supabase
      .from('n8n_chat_histories')
      .insert(responseData)
      .select()
      .single();

    if (responseError) {
      console.error('❌ Erro ao inserir resposta em n8n_chat_histories:', responseError.message);
      return false;
    }

    console.log('✅ Inserção de resposta em n8n_chat_histories bem-sucedida:', responseResult.id);
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de n8n_chat_histories:', error.message);
    return false;
  }
}

/**
 * Função para testar inserção em user_sessions
 */
async function testarUserSessions() {
  console.log('\n🔐 TESTANDO USER_SESSIONS...');
  
  try {
    // Usar um user_id real existente
    const testUserId = 'ac609b4a-87fd-4348-9ade-e24385f772f2'; // admin@comercial247.com
    
    const testData = {
      user_id: testUserId,
      session_token: 'test-token-' + Date.now(),
      ip_address: '127.0.0.1',
      user_agent: 'Test Script v1.0',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    const { data, error } = await supabase
      .from('user_sessions')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir em user_sessions:', error.message);
      return false;
    }

    console.log('✅ Inserção em user_sessions bem-sucedida:', data.id);
    
    // Testar busca de sessões ativas
    const { data: activeSessions, error: searchError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', testUserId)
      .gt('expires_at', new Date().toISOString());

    if (searchError) {
      console.error('❌ Erro ao buscar sessões ativas:', searchError.message);
      return false;
    }

    console.log(`✅ Busca de sessões ativas bem-sucedida: ${activeSessions.length} sessões encontradas`);
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de user_sessions:', error.message);
    return false;
  }
}

/**
 * Função para testar inserção em user_settings
 */
async function testarUserSettings() {
  console.log('\n⚙️ TESTANDO USER_SETTINGS...');
  
  try {
    // Usar um user_id real existente
    const testUserId = 'ac609b4a-87fd-4348-9ade-e24385f772f2'; // admin@comercial247.com
    
    const testSettings = [
      {
        user_id: testUserId,
        setting_key: 'theme',
        setting_value: { theme: 'dark', auto_switch: true }
      },
      {
        user_id: testUserId,
        setting_key: 'language',
        setting_value: 'pt'
      },
      {
        user_id: testUserId,
        setting_key: 'notifications',
        setting_value: {
          email: true,
          push: false,
          sms: true
        }
      }
    ];

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(testSettings, { onConflict: 'user_id,setting_key' })
      .select();

    if (error) {
      console.error('❌ Erro ao inserir em user_settings:', error.message);
      return false;
    }

    console.log(`✅ Inserção em user_settings bem-sucedida: ${data.length} configurações salvas`);
    
    // Testar busca de configurações
    const { data: userSettings, error: searchError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', testUserId);

    if (searchError) {
      console.error('❌ Erro ao buscar configurações:', searchError.message);
      return false;
    }

    console.log(`✅ Busca de configurações bem-sucedida: ${userSettings.length} configurações encontradas`);
    
    // Testar atualização de configuração
    const { error: updateError } = await supabase
      .from('user_settings')
      .update({ 
        setting_value: { theme: 'light', auto_switch: false },
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUserId)
      .eq('setting_key', 'theme');

    if (updateError) {
      console.error('❌ Erro ao atualizar configuração:', updateError.message);
      return false;
    }

    console.log('✅ Atualização de configuração bem-sucedida');
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de user_settings:', error.message);
    return false;
  }
}

/**
 * Função para verificar o status final das tabelas
 */
async function verificarStatusFinal() {
  console.log('\n📊 VERIFICANDO STATUS FINAL DAS TABELAS...');
  
  try {
    // Fazer consultas individuais em vez de usar rpc
    const queries = [
      { name: 'n8n_chat_memory', desc: 'Memória contextual do chat' },
      { name: 'n8n_chat_histories', desc: 'Histórico de mensagens' },
      { name: 'user_sessions', desc: 'Sessões de usuário' },
      { name: 'user_settings', desc: 'Configurações de usuário' }
    ];
    
    const results = [];
    
    for (const query of queries) {
      const { count, error } = await supabase
        .from(query.name)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Erro ao contar ${query.name}:`, error.message);
        results.push({ tabela: query.name, registros_atuais: 0, descricao: query.desc });
      } else {
        results.push({ tabela: query.name, registros_atuais: count || 0, descricao: query.desc });
      }
    }
    
    const data = results;

    console.log('\n📈 RESUMO FINAL:');
    console.log('================');
    data.forEach(row => {
      const status = row.registros_atuais > 0 ? '✅ ATIVA' : '⚠️ VAZIA';
      console.log(`${status} ${row.tabela}: ${row.registros_atuais} registros - ${row.descricao}`);
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status final:', error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 INICIANDO TESTES DAS IMPLEMENTAÇÕES DA FASE 2');
  console.log('================================================');
  
  const resultados = {
    chatMemory: false,
    chatHistories: false,
    userSessions: false,
    userSettings: false
  };

  // Executar testes
  resultados.chatMemory = await testarChatMemory();
  resultados.chatHistories = await testarChatHistories();
  resultados.userSessions = await testarUserSessions();
  resultados.userSettings = await testarUserSettings();

  // Verificar status final
  await verificarStatusFinal();

  // Resumo dos resultados
  console.log('\n🎯 RESUMO DOS TESTES:');
  console.log('====================');
  console.log(`${resultados.chatMemory ? '✅' : '❌'} Chat Memory: ${resultados.chatMemory ? 'PASSOU' : 'FALHOU'}`);
  console.log(`${resultados.chatHistories ? '✅' : '❌'} Chat Histories: ${resultados.chatHistories ? 'PASSOU' : 'FALHOU'}`);
  console.log(`${resultados.userSessions ? '✅' : '❌'} User Sessions: ${resultados.userSessions ? 'PASSOU' : 'FALHOU'}`);
  console.log(`${resultados.userSettings ? '✅' : '❌'} User Settings: ${resultados.userSettings ? 'PASSOU' : 'FALHOU'}`);

  const totalTestes = Object.keys(resultados).length;
  const testesPassaram = Object.values(resultados).filter(Boolean).length;
  const percentualSucesso = Math.round((testesPassaram / totalTestes) * 100);

  console.log(`\n📊 RESULTADO GERAL: ${testesPassaram}/${totalTestes} testes passaram (${percentualSucesso}%)`);
  
  if (percentualSucesso === 100) {
    console.log('🎉 TODOS OS TESTES PASSARAM! As implementações estão funcionando corretamente.');
  } else if (percentualSucesso >= 75) {
    console.log('⚠️ A maioria dos testes passou, mas há algumas falhas que precisam ser corrigidas.');
  } else {
    console.log('❌ Muitos testes falharam. Revise as implementações.');
  }

  process.exit(percentualSucesso === 100 ? 0 : 1);
}

// Executar script
main().catch(error => {
  console.error('💥 Erro fatal no script:', error);
  process.exit(1);
});