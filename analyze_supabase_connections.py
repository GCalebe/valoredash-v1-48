#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para Análise de Conexões Supabase e Dados Mockados
Analisa o projeto em busca de:
- Dados mockados/hardcoded
- Conexões soltas do Supabase
- Queries não utilizadas
- Configurações mock
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Set, Tuple
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class AnalysisResult:
    file_path: str
    line_number: int
    issue_type: str
    description: str
    code_snippet: str
    severity: str  # 'high', 'medium', 'low'

class SupabaseConnectionAnalyzer:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.results: List[AnalysisResult] = []
        self.supabase_tables: Set[str] = set()
        self.used_tables: Set[str] = set()
        self.mock_patterns = [
            r'const\s+\w+\s*=\s*\[\s*{[^}]*}\s*\]',  # Array de objetos mock
            r'data\s*:\s*\[\s*{[^}]*}\s*\]',  # Propriedade data com array
            r'mockData|mock_data|MOCK_DATA',  # Variáveis mock explícitas
            r'// TODO|// FIXME|// MOCK',  # Comentários indicando mock
            r'hardcoded|hard-coded|temporary',  # Indicadores de dados temporários
        ]
        
    def analyze_project(self) -> Dict[str, List[AnalysisResult]]:
        """Executa análise completa do projeto"""
        print("🔍 Iniciando análise do projeto...")
        
        # 1. Extrair tabelas do Supabase
        self._extract_supabase_tables()
        
        # 2. Analisar arquivos TypeScript/JavaScript
        self._analyze_source_files()
        
        # 3. Verificar conexões soltas
        self._check_unused_tables()
        
        # 4. Gerar relatório
        return self._generate_report()
    
    def _extract_supabase_tables(self):
        """Extrai nomes das tabelas do arquivo types.ts do Supabase"""
        types_file = self.project_root / 'src' / 'integrations' / 'supabase' / 'types.ts'
        
        if not types_file.exists():
            print("⚠️  Arquivo types.ts do Supabase não encontrado")
            return
            
        with open(types_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Extrair nomes das tabelas
        table_pattern = r'(\w+):\s*{\s*Row:\s*{'
        matches = re.findall(table_pattern, content)
        self.supabase_tables.update(matches)
        
        print(f"📊 Encontradas {len(self.supabase_tables)} tabelas no Supabase")
    
    def _analyze_source_files(self):
        """Analisa arquivos de código fonte"""
        extensions = ['.ts', '.tsx', '.js', '.jsx']
        exclude_dirs = {'node_modules', '.git', 'dist', 'build', '.next'}
        
        for file_path in self._get_source_files(extensions, exclude_dirs):
            self._analyze_file(file_path)
    
    def _get_source_files(self, extensions: List[str], exclude_dirs: Set[str]) -> List[Path]:
        """Obtém lista de arquivos de código fonte"""
        files = []
        
        for root, dirs, filenames in os.walk(self.project_root):
            # Remover diretórios excluídos
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for filename in filenames:
                if any(filename.endswith(ext) for ext in extensions):
                    files.append(Path(root) / filename)
        
        return files
    
    def _analyze_file(self, file_path: Path):
        """Analisa um arquivo específico"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except (UnicodeDecodeError, PermissionError):
            return
            
        for line_num, line in enumerate(lines, 1):
            self._check_mock_data(file_path, line_num, line)
            self._check_supabase_usage(file_path, line_num, line)
            self._check_hardcoded_data(file_path, line_num, line)
            self._check_todo_comments(file_path, line_num, line)
    
    def _check_mock_data(self, file_path: Path, line_num: int, line: str):
        """Verifica dados mockados"""
        for pattern in self.mock_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                self.results.append(AnalysisResult(
                    file_path=str(file_path.relative_to(self.project_root)),
                    line_number=line_num,
                    issue_type='MOCK_DATA',
                    description='Possível dado mockado encontrado',
                    code_snippet=line.strip(),
                    severity='medium'
                ))
    
    def _check_supabase_usage(self, file_path: Path, line_num: int, line: str):
        """Verifica uso das tabelas do Supabase"""
        # Padrões de uso do Supabase
        supabase_patterns = [
            r"\.from\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",  # .from('table_name')
            r"from\s*:\s*['\"]([^'\"]+)['\"]"  # from: 'table_name'
        ]
        
        for pattern in supabase_patterns:
            matches = re.findall(pattern, line)
            for table_name in matches:
                self.used_tables.add(table_name)
                
                # Verificar se a tabela existe
                if table_name not in self.supabase_tables:
                    self.results.append(AnalysisResult(
                        file_path=str(file_path.relative_to(self.project_root)),
                        line_number=line_num,
                        issue_type='UNKNOWN_TABLE',
                        description=f'Tabela "{table_name}" não encontrada no schema do Supabase',
                        code_snippet=line.strip(),
                        severity='high'
                    ))
    
    def _check_hardcoded_data(self, file_path: Path, line_num: int, line: str):
        """Verifica dados hardcoded suspeitos"""
        # Padrões de dados hardcoded
        hardcoded_patterns = [
            r'id\s*:\s*["\']\w{8}-\w{4}-\w{4}-\w{4}-\w{12}["\']',  # UUIDs hardcoded
            r'email\s*:\s*["\'][^"\'].*@.*["\']',  # Emails hardcoded
            r'phone\s*:\s*["\'][\d\s\(\)\-\+]+["\']',  # Telefones hardcoded
            r'const\s+\w+\s*=\s*["\'][^"\']{{20,}}["\']',  # Strings longas hardcoded
        ]
        
        for pattern in hardcoded_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                self.results.append(AnalysisResult(
                    file_path=str(file_path.relative_to(self.project_root)),
                    line_number=line_num,
                    issue_type='HARDCODED_DATA',
                    description='Possível dado hardcoded encontrado',
                    code_snippet=line.strip(),
                    severity='medium'
                ))
    
    def _check_todo_comments(self, file_path: Path, line_num: int, line: str):
        """Verifica comentários TODO/FIXME relacionados a dados"""
        todo_pattern = r'//\s*(TODO|FIXME|HACK|XXX).*(?:mock|data|hardcode|temporary)'
        
        if re.search(todo_pattern, line, re.IGNORECASE):
            self.results.append(AnalysisResult(
                file_path=str(file_path.relative_to(self.project_root)),
                line_number=line_num,
                issue_type='TODO_COMMENT',
                description='Comentário TODO/FIXME relacionado a dados',
                code_snippet=line.strip(),
                severity='low'
            ))
    
    def _check_unused_tables(self):
        """Verifica tabelas não utilizadas"""
        unused_tables = self.supabase_tables - self.used_tables
        
        for table in unused_tables:
            self.results.append(AnalysisResult(
                file_path='supabase/types.ts',
                line_number=0,
                issue_type='UNUSED_TABLE',
                description=f'Tabela "{table}" definida no Supabase mas não utilizada no código',
                code_snippet=f'Table: {table}',
                severity='low'
            ))
    
    def _generate_report(self) -> Dict[str, List[AnalysisResult]]:
        """Gera relatório organizado por tipo de issue"""
        report = defaultdict(list)
        
        for result in self.results:
            report[result.issue_type].append(result)
        
        return dict(report)

def print_report(report: Dict[str, List[AnalysisResult]]):
    """Imprime relatório formatado"""
    print("\n" + "="*80)
    print("📋 RELATÓRIO DE ANÁLISE - CONEXÕES SUPABASE E DADOS MOCKADOS")
    print("="*80)
    
    severity_colors = {
        'high': '🔴',
        'medium': '🟡', 
        'low': '🟢'
    }
    
    total_issues = sum(len(issues) for issues in report.values())
    print(f"\n📊 Total de issues encontradas: {total_issues}\n")
    
    for issue_type, issues in report.items():
        print(f"\n{issue_type.replace('_', ' ').title()} ({len(issues)} issues):")
        print("-" * 50)
        
        for issue in issues[:10]:  # Limitar a 10 por categoria
            severity_icon = severity_colors.get(issue.severity, '⚪')
            print(f"{severity_icon} {issue.file_path}:{issue.line_number}")
            print(f"   {issue.description}")
            print(f"   Código: {issue.code_snippet[:80]}{'...' if len(issue.code_snippet) > 80 else ''}")
            print()
        
        if len(issues) > 10:
            print(f"   ... e mais {len(issues) - 10} issues\n")

def save_json_report(report: Dict[str, List[AnalysisResult]], output_file: str):
    """Salva relatório em formato JSON"""
    json_report = {}
    
    for issue_type, issues in report.items():
        json_report[issue_type] = [
            {
                'file_path': issue.file_path,
                'line_number': issue.line_number,
                'description': issue.description,
                'code_snippet': issue.code_snippet,
                'severity': issue.severity
            }
            for issue in issues
        ]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_report, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Relatório salvo em: {output_file}")

def main():
    """Função principal"""
    project_root = os.getcwd()
    
    print(f"🚀 Analisando projeto: {project_root}")
    
    analyzer = SupabaseConnectionAnalyzer(project_root)
    report = analyzer.analyze_project()
    
    # Imprimir relatório
    print_report(report)
    
    # Salvar relatório JSON
    save_json_report(report, 'supabase_analysis_report.json')
    
    # Estatísticas finais
    total_issues = sum(len(issues) for issues in report.values())
    high_severity = sum(1 for issues in report.values() for issue in issues if issue.severity == 'high')
    
    print("\n" + "="*80)
    print("📈 RESUMO EXECUTIVO")
    print("="*80)
    print(f"Total de issues: {total_issues}")
    print(f"Issues de alta prioridade: {high_severity}")
    print(f"Tabelas do Supabase: {len(analyzer.supabase_tables)}")
    print(f"Tabelas utilizadas: {len(analyzer.used_tables)}")
    print(f"Tabelas não utilizadas: {len(analyzer.supabase_tables - analyzer.used_tables)}")
    
    if high_severity > 0:
        print("\n⚠️  ATENÇÃO: Issues de alta prioridade encontradas!")
        print("   Recomenda-se revisar e corrigir antes da produção.")
    else:
        print("\n✅ Nenhuma issue crítica encontrada.")

if __name__ == '__main__':
    main()