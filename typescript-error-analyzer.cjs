const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração de prioridades
const ERROR_PRIORITIES = {
  // Críticos - impedem compilação
  'TS2304': 1, // Cannot find name
  'TS2339': 1, // Property does not exist on type
  'TS2322': 1, // Type is not assignable to type
  'TS2345': 1, // Argument of type is not assignable
  'TS2307': 1, // Cannot find module
  
  // Altos - problemas de tipagem importantes
  'TS2571': 2, // Object is of type 'unknown'
  'TS2532': 2, // Object is possibly 'undefined'
  'TS2531': 2, // Object is possibly 'null'
  'TS2740': 2, // Type is missing properties
  'TS2741': 2, // Property is missing in type
  
  // Médios - problemas de compatibilidade
  'TS2769': 3, // No overload matches this call
  'TS2554': 3, // Expected X arguments, but got Y
  'TS2559': 3, // Type has no properties in common
  
  // Baixos - avisos e melhorias
  'TS2695': 4, // Left side of comma operator is unused
  'TS6133': 4, // Variable is declared but never used
  'TS2564': 4, // Property has no initializer
};

const CATEGORY_NAMES = {
  1: '🔴 CRÍTICO',
  2: '🟠 ALTO',
  3: '🟡 MÉDIO',
  4: '🟢 BAIXO'
};

function runTypeScriptCheck() {
  console.log('🔍 Executando verificação TypeScript...');
  
  try {
    // Executa tsc com output detalhado
    execSync('npx tsc --noEmit --pretty false', { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log('✅ Nenhum erro TypeScript encontrado!');
    return [];
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : '';
    return parseTypeScriptErrors(output);
  }
}

function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Regex para capturar erros TypeScript
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      const [, file, line, column, code, message] = match;
      errors.push({
        file: path.relative(process.cwd(), file),
        line: parseInt(line),
        column: parseInt(column),
        code,
        message,
        priority: ERROR_PRIORITIES[code] || 5,
        category: CATEGORY_NAMES[ERROR_PRIORITIES[code] || 5] || '⚪ OUTROS'
      });
    }
  }
  
  return errors;
}

function categorizeErrors(errors) {
  const categorized = {};
  
  errors.forEach(error => {
    const key = error.priority;
    if (!categorized[key]) {
      categorized[key] = [];
    }
    categorized[key].push(error);
  });
  
  return categorized;
}

function generateReport(errors) {
  const categorized = categorizeErrors(errors);
  const report = [];
  
  report.push('# 📊 Relatório de Erros TypeScript\n');
  report.push(`**Total de erros encontrados: ${errors.length}**\n`);
  
  // Estatísticas por categoria
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryErrors = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      report.push(`- ${categoryName}: ${categoryErrors.length} erros`);
    });
  
  report.push('\n---\n');
  
  // Detalhes por categoria
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryErrors = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      
      report.push(`## ${categoryName} (${categoryErrors.length} erros)\n`);
      
      // Agrupar por arquivo
      const byFile = {};
      categoryErrors.forEach(error => {
        if (!byFile[error.file]) {
          byFile[error.file] = [];
        }
        byFile[error.file].push(error);
      });
      
      Object.keys(byFile).forEach(file => {
        report.push(`### 📁 ${file}\n`);
        byFile[file].forEach(error => {
          report.push(`- **Linha ${error.line}:${error.column}** - \`${error.code}\`: ${error.message}`);
        });
        report.push('');
      });
      
      report.push('---\n');
    });
  
  return report.join('\n');
}

function generateFixPlan(errors) {
  const categorized = categorizeErrors(errors);
  const plan = [];
  
  plan.push('# 🔧 Plano de Correção\n');
  
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((priority, index) => {
      const categoryErrors = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      
      plan.push(`## Fase ${index + 1}: ${categoryName}\n`);
      
      // Agrupar por tipo de erro
      const byCode = {};
      categoryErrors.forEach(error => {
        if (!byCode[error.code]) {
          byCode[error.code] = [];
        }
        byCode[error.code].push(error);
      });
      
      Object.keys(byCode).forEach(code => {
        const codeErrors = byCode[code];
        plan.push(`### ${code} (${codeErrors.length} ocorrências)\n`);
        
        // Estratégia de correção baseada no código do erro
        const strategy = getFixStrategy(code);
        plan.push(`**Estratégia**: ${strategy}\n`);
        
        plan.push('**Arquivos afetados**:');
        const files = [...new Set(codeErrors.map(e => e.file))];
        files.forEach(file => {
          const fileErrors = codeErrors.filter(e => e.file === file);
          plan.push(`- ${file} (${fileErrors.length} erros)`);
        });
        plan.push('');
      });
      
      plan.push('---\n');
    });
  
  return plan.join('\n');
}

function getFixStrategy(errorCode) {
  const strategies = {
    'TS2304': 'Adicionar imports necessários ou declarar variáveis/tipos',
    'TS2339': 'Corrigir tipagem de interfaces ou adicionar propriedades',
    'TS2322': 'Ajustar tipos para compatibilidade ou usar type assertions',
    'TS2345': 'Corrigir tipos de parâmetros de função',
    'TS2307': 'Verificar caminhos de módulos e instalar dependências',
    'TS2571': 'Substituir \'unknown\' por tipos específicos',
    'TS2532': 'Adicionar verificações de undefined ou usar optional chaining',
    'TS2531': 'Adicionar verificações de null ou usar nullish coalescing',
    'TS2740': 'Completar propriedades obrigatórias em objetos',
    'TS2741': 'Adicionar propriedades faltantes em tipos',
    'TS2769': 'Ajustar parâmetros de função para match com overloads',
    'TS2554': 'Corrigir número de argumentos em chamadas de função',
    'TS2559': 'Alinhar tipos para ter propriedades em comum',
    'TS2695': 'Remover código não utilizado',
    'TS6133': 'Remover variáveis não utilizadas ou adicionar underscore',
    'TS2564': 'Adicionar inicializadores ou marcar como optional'
  };
  
  return strategies[errorCode] || 'Análise manual necessária';
}

function main() {
  console.log('🚀 Iniciando análise de erros TypeScript...\n');
  
  const errors = runTypeScriptCheck();
  
  if (errors.length === 0) {
    console.log('🎉 Parabéns! Nenhum erro TypeScript encontrado.');
    return;
  }
  
  console.log(`📋 Encontrados ${errors.length} erros TypeScript\n`);
  
  // Gerar relatório
  const report = generateReport(errors);
  fs.writeFileSync('typescript-errors-report.md', report);
  console.log('📄 Relatório salvo em: typescript-errors-report.md');
  
  // Gerar plano de correção
  const plan = generateFixPlan(errors);
  fs.writeFileSync('typescript-fix-plan.md', plan);
  console.log('🔧 Plano de correção salvo em: typescript-fix-plan.md');
  
  // Mostrar resumo
  const categorized = categorizeErrors(errors);
  console.log('\n📊 Resumo por prioridade:');
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      console.log(`${categoryName}: ${categorized[priority].length} erros`);
    });
  
  console.log('\n🎯 Próximos passos:');
  console.log('1. Revisar o relatório detalhado');
  console.log('2. Seguir o plano de correção por ordem de prioridade');
  console.log('3. Executar novamente após cada fase de correções');
  
  // Retornar dados para processamento adicional
  return { errors, categorized };
}

if (require.main === module) {
  main();
}

module.exports = { main, runTypeScriptCheck, parseTypeScriptErrors, categorizeErrors };