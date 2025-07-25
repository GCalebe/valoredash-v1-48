#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir erros de parsing do ESLint causados por caracteres invisíveis
"""

import json
import os
import re
from pathlib import Path

def load_eslint_report():
    """Carrega o relatório do ESLint"""
    # Tenta diferentes arquivos de relatório
    report_paths = ["eslint-report-new.json", "eslint-report.json", "eslint-full-report.json"]
    
    for report_path in report_paths:
        if os.path.exists(report_path):
            try:
                with open(report_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except UnicodeDecodeError:
                # Tenta com encoding diferente
                try:
                    with open(report_path, 'r', encoding='latin-1') as f:
                        content = f.read()
                    # Converte para UTF-8
                    with open(report_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    with open(report_path, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except:
                    continue
            except:
                continue
    
    print(f"❌ Nenhum arquivo de relatório ESLint encontrado")
    return None

def find_parsing_errors(eslint_data):
    """Encontra todos os erros de parsing"""
    parsing_errors = []
    
    for file_result in eslint_data:
        file_path = file_result.get('filePath', '')
        messages = file_result.get('messages', [])
        
        for message in messages:
            if 'Parsing error: Invalid character' in message.get('message', ''):
                parsing_errors.append({
                    'file': file_path,
                    'line': message.get('line', 0),
                    'column': message.get('column', 0),
                    'message': message.get('message', '')
                })
    
    return parsing_errors

def remove_invisible_characters(file_path):
    """Remove caracteres invisíveis de um arquivo"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Salva o conteúdo original
        original_content = content
        
        # Remove caracteres de controle invisíveis (exceto \n, \r, \t)
        # Remove Zero Width Space (U+200B), Zero Width Non-Joiner (U+200C), etc.
        invisible_chars = [
            '\u200B',  # Zero Width Space
            '\u200C',  # Zero Width Non-Joiner
            '\u200D',  # Zero Width Joiner
            '\u2060',  # Word Joiner
            '\uFEFF',  # Byte Order Mark
            '\u00A0',  # Non-breaking space
        ]
        
        for char in invisible_chars:
            content = content.replace(char, '')
        
        # Remove outros caracteres de controle (exceto \n, \r, \t)
        content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
        
        # Se houve mudanças, salva o arquivo
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
    
    except Exception as e:
        print(f"❌ Erro ao processar {file_path}: {e}")
        return False

def fix_parsing_errors():
    """Corrige erros de parsing removendo caracteres invisíveis"""
    print("🔧 Iniciando correção de erros de parsing...")
    
    # Carrega o relatório do ESLint
    eslint_data = load_eslint_report()
    if not eslint_data:
        return
    
    # Encontra erros de parsing
    parsing_errors = find_parsing_errors(eslint_data)
    
    if not parsing_errors:
        print("✅ Nenhum erro de parsing encontrado")
        return
    
    print(f"📋 Encontrados {len(parsing_errors)} erros de parsing")
    
    # Agrupa por arquivo
    files_with_errors = {}
    for error in parsing_errors:
        file_path = error['file']
        if file_path not in files_with_errors:
            files_with_errors[file_path] = []
        files_with_errors[file_path].append(error)
    
    # Corrige cada arquivo
    fixed_files = 0
    for file_path, errors in files_with_errors.items():
        print(f"🔧 Corrigindo {file_path}...")
        
        if remove_invisible_characters(file_path):
            fixed_files += 1
            print(f"  ✅ Caracteres invisíveis removidos")
        else:
            print(f"  ℹ️ Nenhum caractere invisível encontrado")
    
    print(f"\n📊 RESUMO:")
    print(f"   Arquivos com erros de parsing: {len(files_with_errors)}")
    print(f"   Arquivos corrigidos: {fixed_files}")
    
    if fixed_files > 0:
        print(f"\n🎯 PRÓXIMOS PASSOS:")
        print(f"   1. Execute: npm run lint")
        print(f"   2. Execute: python eslint_analyzer.py")
        print(f"   3. Verifique se os erros de parsing foram resolvidos")

if __name__ == "__main__":
    fix_parsing_errors()