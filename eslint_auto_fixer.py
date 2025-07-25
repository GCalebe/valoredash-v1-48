#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ESLint Auto Fixer - Correção Automática de Problemas ESLint
Este script corrige automaticamente os problemas mais comuns do ESLint
"""

import json
import os
import re
import subprocess
from datetime import datetime
from typing import Dict, List, Any

def load_eslint_report() -> List[Dict[str, Any]]:
    """Carrega o relatório do ESLint"""
    try:
        with open('eslint-full-report.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo eslint-full-report.json não encontrado")
        print("Execute primeiro: npx eslint src/ --format json --output-file eslint-full-report.json")
        return []
    except Exception as e:
        print(f"❌ Erro ao ler relatório: {e}")
        return []

def fix_typescript_any_issues(file_path: str, messages: List[Dict[str, Any]]) -> int:
    """Corrige problemas de @typescript-eslint/no-explicit-any"""
    fixes_applied = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Filtrar apenas mensagens de 'any'
        any_messages = [msg for msg in messages if msg.get('ruleId') == '@typescript-eslint/no-explicit-any']
        
        if not any_messages:
            return 0
        
        # Padrões comuns para substituir 'any'
        replacements = [
            # useState<any> -> useState<unknown>
            (r'useState<any>', 'useState<unknown>'),
            # : any[] -> : unknown[]
            (r': any\[\]', ': unknown[]'),
            # : any -> : unknown
            (r': any(?!\s*\))', ': unknown'),
            # (param: any) -> (param: unknown) mas não em catch
            (r'\(([^:]+): any\)(?!.*catch)', r'(\1: unknown)'),
            # = any -> = unknown
            (r'= any(?![a-zA-Z_])', '= unknown'),
            # <any> -> <unknown>
            (r'<any>', '<unknown>'),
        ]
        
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                fixes_applied += 1
        
        # Casos específicos para catch blocks
        catch_pattern = r'catch\s*\(\s*([^:]+):\s*any\s*\)'
        catch_replacement = r'catch (\1: unknown)'
        content = re.sub(catch_pattern, catch_replacement, content)
        
        # Salvar apenas se houve mudanças
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path}: {fixes_applied} correções de 'any' aplicadas")
        
        return fixes_applied
        
    except Exception as e:
        print(f"❌ Erro ao processar {file_path}: {e}")
        return 0

def fix_react_hooks_deps(file_path: str, messages: List[Dict[str, Any]]) -> int:
    """Corrige problemas de react-hooks/exhaustive-deps"""
    fixes_applied = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Filtrar mensagens de dependências
        deps_messages = [msg for msg in messages if msg.get('ruleId') == 'react-hooks/exhaustive-deps']
        
        for msg in deps_messages:
            line_num = msg.get('line', 0)
            message_text = msg.get('message', '')
            
            # Extrair nome da função/variável da mensagem
            if "missing dependency" in message_text:
                # Extrair dependência faltante
                match = re.search(r"'([^']+)'", message_text)
                if match:
                    missing_dep = match.group(1)
                    
                    # Encontrar a linha do useEffect
                    lines = content.split('\n')
                    if line_num <= len(lines):
                        target_line = lines[line_num - 1]
                        
                        # Verificar se é um array de dependências vazio
                        if re.search(r'\[\s*\]', target_line):
                            # Substituir [] por [missing_dep]
                            new_line = re.sub(r'\[\s*\]', f'[{missing_dep}]', target_line)
                            lines[line_num - 1] = new_line
                            content = '\n'.join(lines)
                            fixes_applied += 1
                        elif re.search(r'\[[^\]]+\]', target_line):
                            # Adicionar à lista existente
                            new_line = re.sub(r'\[([^\]]+)\]', f'[\1, {missing_dep}]', target_line)
                            lines[line_num - 1] = new_line
                            content = '\n'.join(lines)
                            fixes_applied += 1
        
        # Salvar apenas se houve mudanças
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path}: {fixes_applied} correções de dependências aplicadas")
        
        return fixes_applied
        
    except Exception as e:
        print(f"❌ Erro ao processar dependências em {file_path}: {e}")
        return 0

def run_eslint_fix() -> bool:
    """Executa ESLint com --fix para correções automáticas"""
    try:
        print("🔧 Executando ESLint --fix...")
        result = subprocess.run(
            ['npx', 'eslint', 'src/', '--fix'],
            capture_output=True,
            text=True,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            print("✅ ESLint --fix executado com sucesso")
            return True
        else:
            print(f"⚠️ ESLint --fix concluído com avisos (código {result.returncode})")
            return True
            
    except Exception as e:
        print(f"❌ Erro ao executar ESLint --fix: {e}")
        return False

def generate_progress_report(total_files: int, total_errors: int, total_warnings: int, fixes_applied: int) -> str:
    """Gera relatório de progresso"""
    report = []
    report.append("# 🔧 RELATÓRIO DE CORREÇÕES AUTOMÁTICAS")
    report.append(f"**Gerado em:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    report.append("")
    
    report.append("## 📊 ESTATÍSTICAS ANTES DAS CORREÇÕES")
    report.append(f"- **Arquivos analisados:** {total_files}")
    report.append(f"- **Total de erros:** {total_errors}")
    report.append(f"- **Total de warnings:** {total_warnings}")
    report.append(f"- **Total de problemas:** {total_errors + total_warnings}")
    report.append("")
    
    report.append("## ✅ CORREÇÕES APLICADAS")
    report.append(f"- **Correções automáticas:** {fixes_applied}")
    report.append("")
    
    report.append("## 🎯 TIPOS DE CORREÇÕES")
    report.append("1. **@typescript-eslint/no-explicit-any**: Substituição de 'any' por 'unknown'")
    report.append("2. **react-hooks/exhaustive-deps**: Adição de dependências faltantes")
    report.append("3. **ESLint --fix**: Correções automáticas do próprio ESLint")
    report.append("")
    
    report.append("## 🚀 PRÓXIMOS PASSOS")
    report.append("1. Execute novamente: `npm run lint` para verificar o progresso")
    report.append("2. Execute: `python eslint_analyzer.py` para análise detalhada")
    report.append("3. Corrija manualmente os problemas restantes")
    report.append("")
    
    report.append("## 🛠️ COMANDOS ÚTEIS")
    report.append("```bash")
    report.append("# Verificar progresso")
    report.append("npm run lint")
    report.append("")
    report.append("# Executar correções automáticas novamente")
    report.append("python eslint_auto_fixer.py")
    report.append("")
    report.append("# Análise detalhada")
    report.append("python eslint_analyzer.py")
    report.append("```")
    
    return "\n".join(report)

def main():
    """Função principal"""
    print("🚀 ESLint Auto Fixer - Iniciando correções automáticas...")
    print("="*60)
    
    # Carregar relatório do ESLint
    eslint_data = load_eslint_report()
    if not eslint_data:
        return
    
    # Estatísticas iniciais
    total_files = len(eslint_data)
    total_errors = sum(file_data.get('errorCount', 0) for file_data in eslint_data)
    total_warnings = sum(file_data.get('warningCount', 0) for file_data in eslint_data)
    
    print(f"📊 Estatísticas iniciais:")
    print(f"   Arquivos: {total_files}")
    print(f"   Erros: {total_errors}")
    print(f"   Warnings: {total_warnings}")
    print()
    
    total_fixes = 0
    
    # Processar cada arquivo
    for file_data in eslint_data:
        file_path = file_data.get('filePath', '')
        messages = file_data.get('messages', [])
        
        if not messages:
            continue
        
        print(f"🔍 Processando: {os.path.basename(file_path)}")
        
        # Corrigir problemas de 'any'
        any_fixes = fix_typescript_any_issues(file_path, messages)
        total_fixes += any_fixes
        
        # Corrigir problemas de dependências
        deps_fixes = fix_react_hooks_deps(file_path, messages)
        total_fixes += deps_fixes
    
    print()
    print(f"✅ Correções manuais aplicadas: {total_fixes}")
    
    # Executar ESLint --fix
    if run_eslint_fix():
        print("✅ Correções automáticas do ESLint aplicadas")
    
    # Gerar relatório de progresso
    progress_report = generate_progress_report(total_files, total_errors, total_warnings, total_fixes)
    with open('eslint-auto-fix-report.md', 'w', encoding='utf-8') as f:
        f.write(progress_report)
    
    print()
    print("📄 Relatório de correções gerado: eslint-auto-fix-report.md")
    print()
    print("🎯 PRÓXIMOS PASSOS:")
    print("1. Execute: npm run lint")
    print("2. Execute: python eslint_analyzer.py")
    print("3. Corrija manualmente os problemas restantes")
    print()
    print("✨ Correções automáticas concluídas!")

if __name__ == "__main__":
    main()