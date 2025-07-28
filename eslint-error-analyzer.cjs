const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração de prioridades para regras ESLint
const ESLINT_PRIORITIES = {
  // Críticos - problemas de segurança e bugs
  '@typescript-eslint/no-explicit-any': 1,
  '@typescript-eslint/no-unused-vars': 1,
  'no-unused-vars': 1,
  '@typescript-eslint/no-unsafe-assignment': 1,
  '@typescript-eslint/no-unsafe-member-access': 1,
  '@typescript-eslint/no-unsafe-call': 1,
  
  // Altos - problemas de tipagem e qualidade
  '@typescript-eslint/no-non-null-assertion': 2,
  '@typescript-eslint/prefer-nullish-coalescing': 2,
  '@typescript-eslint/prefer-optional-chain': 2,
  '@typescript-eslint/no-empty-interface': 2,
  'prefer-const': 2,
  
  // Médios - problemas de estilo e convenções
  'react-hooks/exhaustive-deps': 3,
  'react-refresh/only-export-components': 3,
  '@typescript-eslint/no-empty-function': 3,
  'no-console': 3,
  
  // Baixos - formatação e estilo
  'indent': 4,
  'quotes': 4,
  'semi': 4,
  'comma-dangle': 4,
  'eol-last': 4
};

const CATEGORY_NAMES = {
  1: '🔴 CRÍTICO',
  2: '🟠 ALTO', 
  3: '🟡 MÉDIO',
  4: '🟢 BAIXO'
};

const FIX_STRATEGIES = {
  '@typescript-eslint/no-explicit-any': 'Substituir \'any\' por tipos específicos',
  '@typescript-eslint/no-unused-vars': 'Remover variáveis não utilizadas ou adicionar underscore',
  'no-unused-vars': 'Remover variáveis não utilizadas',
  '@typescript-eslint/no-unsafe-assignment': 'Adicionar tipagem adequada para assignments',
  '@typescript-eslint/no-unsafe-member-access': 'Verificar tipos antes de acessar propriedades',
  '@typescript-eslint/no-unsafe-call': 'Verificar tipos antes de chamar funções',
  '@typescript-eslint/no-non-null-assertion': 'Usar verificações de null/undefined ao invés de !',
  '@typescript-eslint/prefer-nullish-coalescing': 'Usar ?? ao invés de ||',
  '@typescript-eslint/prefer-optional-chain': 'Usar ?. para acessos opcionais',
  '@typescript-eslint/no-empty-interface': 'Remover interfaces vazias ou adicionar propriedades',
  'prefer-const': 'Usar const para variáveis que não mudam',
  'react-hooks/exhaustive-deps': 'Adicionar dependências faltantes no useEffect',
  'react-refresh/only-export-components': 'Mover constantes/funções para arquivos separados',
  '@typescript-eslint/no-empty-function': 'Implementar função ou adicionar comentário explicativo',
  'no-console': 'Remover console.log ou usar logger apropriado'
};

function runESLintCheck() {
  console.log('🔍 Executando verificação ESLint...');
  
  try {
    execSync('npx eslint src --ext .ts,.tsx --format=json --output-file eslint-results.json', { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log('✅ Nenhum problema ESLint encontrado!');
    return [];
  } catch (error) {
    // ESLint retorna código de saída 1 quando encontra problemas
    try {
      const results = JSON.parse(fs.readFileSync('eslint-results.json', 'utf8'));
      return parseESLintResults(results);
    } catch (parseError) {
      console.error('Erro ao parsear resultados do ESLint:', parseError);
      return [];
    }
  }
}

function parseESLintResults(results) {
  const problems = [];
  
  results.forEach(file => {
    file.messages.forEach(message => {
      problems.push({
        file: path.relative(process.cwd(), file.filePath),
        line: message.line,
        column: message.column,
        rule: message.ruleId || 'unknown',
        message: message.message,
        severity: message.severity, // 1 = warning, 2 = error
        priority: ESLINT_PRIORITIES[message.ruleId] || 5,
        category: CATEGORY_NAMES[ESLINT_PRIORITIES[message.ruleId] || 5] || '⚪ OUTROS',
        fixable: message.fix ? true : false
      });
    });
  });
  
  return problems;
}

function categorizeProblems(problems) {
  const categorized = {};
  
  problems.forEach(problem => {
    const key = problem.priority;
    if (!categorized[key]) {
      categorized[key] = [];
    }
    categorized[key].push(problem);
  });
  
  return categorized;
}

function generateDetailedReport(problems) {
  const categorized = categorizeProblems(problems);
  const report = [];
  
  report.push('# 📊 Relatório Detalhado de Problemas ESLint\n');
  report.push(`**Total de problemas encontrados: ${problems.length}**\n`);
  
  const errors = problems.filter(p => p.severity === 2).length;
  const warnings = problems.filter(p => p.severity === 1).length;
  const fixable = problems.filter(p => p.fixable).length;
  
  report.push(`- 🔴 Erros: ${errors}`);
  report.push(`- 🟡 Avisos: ${warnings}`);
  report.push(`- 🔧 Auto-corrigíveis: ${fixable}\n`);
  
  // Estatísticas por categoria
  report.push('## 📈 Distribuição por Prioridade\n');
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryProblems = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      report.push(`- ${categoryName}: ${categoryProblems.length} problemas`);
    });
  
  report.push('\n---\n');
  
  // Top 10 regras mais violadas
  const ruleCount = {};
  problems.forEach(p => {
    ruleCount[p.rule] = (ruleCount[p.rule] || 0) + 1;
  });
  
  const topRules = Object.entries(ruleCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  report.push('## 🏆 Top 10 Regras Mais Violadas\n');
  topRules.forEach(([rule, count], index) => {
    const priority = ESLINT_PRIORITIES[rule] || 5;
    const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
    report.push(`${index + 1}. **${rule}** (${count} ocorrências) - ${categoryName}`);
  });
  
  report.push('\n---\n');
  
  // Detalhes por categoria
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryProblems = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      
      report.push(`## ${categoryName} (${categoryProblems.length} problemas)\n`);
      
      // Agrupar por regra
      const byRule = {};
      categoryProblems.forEach(problem => {
        if (!byRule[problem.rule]) {
          byRule[problem.rule] = [];
        }
        byRule[problem.rule].push(problem);
      });
      
      Object.keys(byRule).forEach(rule => {
        const ruleProblems = byRule[rule];
        report.push(`### 📋 ${rule} (${ruleProblems.length} ocorrências)\n`);
        
        const strategy = FIX_STRATEGIES[rule] || 'Análise manual necessária';
        report.push(`**Estratégia de correção**: ${strategy}\n`);
        
        // Agrupar por arquivo
        const byFile = {};
        ruleProblems.forEach(problem => {
          if (!byFile[problem.file]) {
            byFile[problem.file] = [];
          }
          byFile[problem.file].push(problem);
        });
        
        report.push('**Arquivos afetados**:\n');
        Object.keys(byFile).forEach(file => {
          const fileProblems = byFile[file];
          report.push(`#### 📁 ${file} (${fileProblems.length} problemas)\n`);
          fileProblems.forEach(problem => {
            const severity = problem.severity === 2 ? '🔴' : '🟡';
            const fixable = problem.fixable ? ' 🔧' : '';
            report.push(`- **Linha ${problem.line}:${problem.column}** ${severity}${fixable} - ${problem.message}`);
          });
          report.push('');
        });
        
        report.push('---\n');
      });
    });
  
  return report.join('\n');
}

function generateFixPlan(problems) {
  const categorized = categorizeProblems(problems);
  const plan = [];
  
  plan.push('# 🔧 Plano de Correção Prioritizado\n');
  
  // Estatísticas de auto-correção
  const autoFixable = problems.filter(p => p.fixable).length;
  plan.push(`## 🤖 Auto-correção Disponível\n`);
  plan.push(`**${autoFixable} problemas** podem ser corrigidos automaticamente com:\n`);
  plan.push('```bash');
  plan.push('npx eslint src --ext .ts,.tsx --fix');
  plan.push('```\n');
  
  plan.push('---\n');
  
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((priority, index) => {
      const categoryProblems = categorized[priority];
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      
      plan.push(`## Fase ${index + 1}: ${categoryName} (${categoryProblems.length} problemas)\n`);
      
      // Agrupar por regra e mostrar estratégias
      const byRule = {};
      categoryProblems.forEach(problem => {
        if (!byRule[problem.rule]) {
          byRule[problem.rule] = [];
        }
        byRule[problem.rule].push(problem);
      });
      
      Object.entries(byRule)
        .sort(([,a], [,b]) => b.length - a.length) // Ordenar por quantidade
        .forEach(([rule, ruleProblems]) => {
          const autoFixableCount = ruleProblems.filter(p => p.fixable).length;
          const strategy = FIX_STRATEGIES[rule] || 'Análise manual necessária';
          
          plan.push(`### ${rule} (${ruleProblems.length} ocorrências)\n`);
          plan.push(`**Estratégia**: ${strategy}`);
          
          if (autoFixableCount > 0) {
            plan.push(`**Auto-corrigível**: ${autoFixableCount}/${ruleProblems.length} problemas`);
          }
          
          plan.push('');
          
          // Arquivos mais afetados
          const fileCount = {};
          ruleProblems.forEach(p => {
            fileCount[p.file] = (fileCount[p.file] || 0) + 1;
          });
          
          const topFiles = Object.entries(fileCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
          
          plan.push('**Arquivos mais afetados**:');
          topFiles.forEach(([file, count]) => {
            plan.push(`- ${file} (${count} problemas)`);
          });
          plan.push('');
        });
      
      plan.push('---\n');
    });
  
  // Comandos úteis
  plan.push('## 🛠️ Comandos Úteis\n');
  plan.push('```bash');
  plan.push('# Auto-corrigir problemas simples');
  plan.push('npx eslint src --ext .ts,.tsx --fix');
  plan.push('');
  plan.push('# Verificar apenas erros críticos');
  plan.push('npx eslint src --ext .ts,.tsx --quiet');
  plan.push('');
  plan.push('# Gerar relatório detalhado');
  plan.push('npx eslint src --ext .ts,.tsx --format=json --output-file eslint-detailed.json');
  plan.push('```\n');
  
  return plan.join('\n');
}

function main() {
  console.log('🚀 Iniciando análise de problemas ESLint...\n');
  
  const problems = runESLintCheck();
  
  if (problems.length === 0) {
    console.log('🎉 Parabéns! Nenhum problema ESLint encontrado.');
    return;
  }
  
  console.log(`📋 Encontrados ${problems.length} problemas ESLint\n`);
  
  // Gerar relatório detalhado
  const report = generateDetailedReport(problems);
  fs.writeFileSync('eslint-detailed-report.md', report);
  console.log('📄 Relatório detalhado salvo em: eslint-detailed-report.md');
  
  // Gerar plano de correção
  const plan = generateFixPlan(problems);
  fs.writeFileSync('eslint-fix-plan.md', plan);
  console.log('🔧 Plano de correção salvo em: eslint-fix-plan.md');
  
  // Mostrar resumo
  const categorized = categorizeProblems(problems);
  console.log('\n📊 Resumo por prioridade:');
  Object.keys(categorized)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(priority => {
      const categoryName = CATEGORY_NAMES[priority] || '⚪ OUTROS';
      console.log(`${categoryName}: ${categorized[priority].length} problemas`);
    });
  
  const autoFixable = problems.filter(p => p.fixable).length;
  console.log(`\n🤖 Auto-corrigíveis: ${autoFixable}/${problems.length} problemas`);
  
  console.log('\n🎯 Próximos passos:');
  console.log('1. Executar auto-correção: npx eslint src --ext .ts,.tsx --fix');
  console.log('2. Revisar o relatório detalhado');
  console.log('3. Seguir o plano de correção por ordem de prioridade');
  
  // Cleanup
  if (fs.existsSync('eslint-results.json')) {
    fs.unlinkSync('eslint-results.json');
  }
  
  return { problems, categorized };
}

if (require.main === module) {
  main();
}

module.exports = { main, runESLintCheck, parseESLintResults, categorizeProblems };