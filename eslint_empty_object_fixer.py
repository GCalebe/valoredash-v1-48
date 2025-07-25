#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ESLint Empty Object Type Fixer - Correção Automática de {} para object
Este script corrige automaticamente os problemas de @typescript-eslint/no-empty-object-type
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any

def load_eslint_report() -> List[Dict[str, Any]]:
    """Carrega o relatório do ESLint"""
    try:
        with open('eslint-full-report.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Arquivo eslint-full-report.json não encontrado")
        return []
    except Exception as e:
        print(f"❌ Erro ao ler relatório: {e}")
        return []

def fix_empty_object_types(file_path: str, messages: List[Dict[str, Any]]) -> int:
    """Corrige problemas de @typescript-eslint/no-empty-object-type"""
    fixes_applied = 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Filtrar apenas mensagens de empty object type
        empty_obj_messages = [msg for msg in messages if msg.get('ruleId') == '@typescript-eslint/no-empty-object-type']
        
        if not empty_obj_messages:
            return 0
        
        # Padrões para substituir {} por object
        replacements = [
            # : {} -> : object
            (r': \{\}(?![a-zA-Z_])', ': object'),
            # <{}> -> <object>
            (r'<\{\}>', '<object>'),
            # = {} -> = object (em tipos)
            (r'= \{\}(?![a-zA-Z_])', '= object'),
            # ({}) -> (object)
            (r'\(\{\}\)', '(object)'),
            # | {} -> | object
            (r'\| \{\}(?![a-zA-Z_])', '| object'),
            # & {} -> & object
            (r'& \{\}(?![a-zA-Z_])', '& object'),
        ]
        
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                fixes_applied += 1
        
        # Casos específicos para definições de tipo
        # type SomeType = {} -> type SomeType = object
        type_pattern = r'(type\s+\w+\s*=\s*)\{\}'
        type_replacement = r'\1object'
        new_content = re.sub(type_pattern, type_replacement, content)
        if new_content != content:
            content = new_content
            fixes_applied += 1
        
        # interface extends {} -> interface extends object
        interface_pattern = r'(extends\s+)\{\}'
        interface_replacement = r'\1object'
        new_content = re.sub(interface_pattern, interface_replacement, content)
        if new_content != content:
            content = new_content
            fixes_applied += 1
        
        # Salvar apenas se houve mudanças
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {file_path}: {fixes_applied} correções de '{{}}' aplicadas")
        
        return fixes_applied
        
    except Exception as e:
        print(f"❌ Erro ao processar {file_path}: {e}")
        return 0

def fix_parsing_errors(file_path: str, messages: List[Dict[str, Any]]) -> int:
    """Tenta corrigir erros de parsing removendo caracteres inválidos"""
    fixes_applied = 0
    
    try:
        # Filtrar mensagens de parsing error
        parsing_errors = [msg for msg in messages if 'Parsing error' in msg.get('message', '')]
        
        if not parsing_errors:
            return 0
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remover caracteres de controle invisíveis comuns
        # Zero Width Space (U+200B)
        content = content.replace('\u200b', '')
        # Zero Width Non-Joiner (U+200C)
        content = content.replace('\u200c', '')
        # Zero Width Joiner (U+200D)
        content = content.replace('\u200d', '')
        # Byte Order Mark (BOM)
        content = content.replace('\ufeff', '')
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            fixes_applied = 1
            print(f"✅ {file_path}: Caracteres invisíveis removidos")
        
        return fixes_applied
        
    except Exception as e:
        print(f"❌ Erro ao processar parsing errors em {file_path}: {e}")
        return 0

def main():
    """Função principal"""
    print("🔧 ESLint Empty Object Fixer - Iniciando correções específicas...")
    print("="*60)
    
    # Carregar relatório do ESLint
    eslint_data = load_eslint_report()
    if not eslint_data:
        return
    
    # Estatísticas iniciais
    total_files = len(eslint_data)
    total_errors = sum(file_data.get('errorCount', 0) for file_data in eslint_data)
    total_warnings = sum(file_data.get('warningCount', 0) for file_data in eslint_data)
    
    print(f"📊 Estatísticas atuais:")
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
        
        # Corrigir problemas de empty object type
        empty_obj_fixes = fix_empty_object_types(file_path, messages)
        total_fixes += empty_obj_fixes
        
        # Tentar corrigir parsing errors
        parsing_fixes = fix_parsing_errors(file_path, messages)
        total_fixes += parsing_fixes
    
    print()
    print(f"✅ Total de correções aplicadas: {total_fixes}")
    print()
    print("🎯 PRÓXIMOS PASSOS:")
    print("1. Execute: npm run lint")
    print("2. Execute: python eslint_analyzer.py")
    print("3. Continue com correções manuais se necessário")
    print()
    print("✨ Correções específicas concluídas!")

if __name__ == "__main__":
    main()