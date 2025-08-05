#!/usr/bin/env python3
"""
ESLint Analysis Report Generator
Analyzes ESLint output and generates a comprehensive report
"""

import subprocess
import json
import re
from collections import defaultdict, Counter
from datetime import datetime

def run_eslint():
    """Run ESLint and capture output"""
    try:
        result = subprocess.run(
            ['npm', 'run', 'lint'],
            capture_output=True,
            text=True,
            cwd='.',
            shell=True
        )
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        print(f"Error running ESLint: {e}")
        return "", str(e), 1

def parse_eslint_output(output):
    """Parse ESLint output and extract issues"""
    issues = []
    current_file = None
    
    lines = output.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Check if this is a file path
        if line and not line.startswith(' ') and ('\\' in line or '/' in line) and line.endswith('.ts') or line.endswith('.tsx'):
            current_file = line
            continue
            
        # Parse issue lines (format: "  line:col  level  message  rule")
        issue_match = re.match(r'\s*(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([a-zA-Z0-9/@-]+)$', line)
        if issue_match and current_file:
            line_num, col_num, level, message, rule = issue_match.groups()
            issues.append({
                'file': current_file,
                'line': int(line_num),
                'column': int(col_num),
                'level': level,
                'message': message,
                'rule': rule
            })
    
    return issues

def analyze_issues(issues):
    """Analyze issues and generate statistics"""
    stats = {
        'total_issues': len(issues),
        'errors': len([i for i in issues if i['level'] == 'error']),
        'warnings': len([i for i in issues if i['level'] == 'warning']),
        'files_with_issues': len(set(i['file'] for i in issues)),
        'rules': Counter(i['rule'] for i in issues),
        'files': Counter(i['file'] for i in issues),
        'by_category': defaultdict(list)
    }
    
    # Categorize issues
    for issue in issues:
        rule = issue['rule']
        if 'typescript' in rule or '@typescript-eslint' in rule:
            stats['by_category']['TypeScript'].append(issue)
        elif 'react' in rule:
            stats['by_category']['React'].append(issue)
        elif 'import' in rule:
            stats['by_category']['Import'].append(issue)
        else:
            stats['by_category']['Other'].append(issue)
    
    return stats

def generate_report(stats, issues):
    """Generate comprehensive analysis report"""
    report = []
    report.append("=" * 80)
    report.append("ESLint Analysis Report")
    report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("=" * 80)
    
    # Summary
    report.append("\n📊 SUMMARY")
    report.append("-" * 40)
    report.append(f"Total Issues: {stats['total_issues']}")
    report.append(f"Errors: {stats['errors']} (High Risk)")
    report.append(f"Warnings: {stats['warnings']} (Medium Risk)")
    report.append(f"Files with Issues: {stats['files_with_issues']}")
    
    # Risk Assessment
    if stats['errors'] > 50:
        risk_level = "🔴 HIGH RISK"
    elif stats['errors'] > 20:
        risk_level = "🟡 MEDIUM RISK"
    else:
        risk_level = "🟢 LOW RISK"
    
    report.append(f"\nRisk Level: {risk_level}")
    
    # Top Issues by Rule
    report.append("\n🔍 TOP ISSUES BY RULE")
    report.append("-" * 40)
    for rule, count in stats['rules'].most_common(10):
        report.append(f"{rule}: {count} issues")
    
    # Issues by Category
    report.append("\n📂 ISSUES BY CATEGORY")
    report.append("-" * 40)
    for category, category_issues in stats['by_category'].items():
        errors = len([i for i in category_issues if i['level'] == 'error'])
        warnings = len([i for i in category_issues if i['level'] == 'warning'])
        report.append(f"{category}: {len(category_issues)} total ({errors} errors, {warnings} warnings)")
    
    # Most Problematic Files
    report.append("\n📁 MOST PROBLEMATIC FILES")
    report.append("-" * 40)
    for file_path, count in stats['files'].most_common(10):
        file_issues = [i for i in issues if i['file'] == file_path]
        errors = len([i for i in file_issues if i['level'] == 'error'])
        warnings = len([i for i in file_issues if i['level'] == 'warning'])
        report.append(f"{file_path}: {count} issues ({errors} errors, {warnings} warnings)")
    
    # TypeScript Specific Issues
    if 'TypeScript' in stats['by_category']:
        report.append("\n🔧 TYPESCRIPT ISSUES")
        report.append("-" * 40)
        ts_issues = stats['by_category']['TypeScript']
        ts_rules = Counter(i['rule'] for i in ts_issues)
        for rule, count in ts_rules.most_common(5):
            report.append(f"{rule}: {count} issues")
    
    # React Specific Issues
    if 'React' in stats['by_category']:
        report.append("\n⚛️ REACT ISSUES")
        report.append("-" * 40)
        react_issues = stats['by_category']['React']
        react_rules = Counter(i['rule'] for i in react_issues)
        for rule, count in react_rules.most_common(5):
            report.append(f"{rule}: {count} issues")
    
    # Recommendations
    report.append("\n💡 RECOMMENDATIONS")
    report.append("-" * 40)
    
    if stats['errors'] > 0:
        report.append("1. 🚨 Fix all ERROR level issues first (these can break builds)")
    
    if 'react-hooks/exhaustive-deps' in stats['rules']:
        report.append("2. 🔄 Review useEffect dependencies to prevent infinite re-renders")
    
    if any('@typescript-eslint' in rule for rule in stats['rules']):
        report.append("3. 📝 Address TypeScript-specific issues for better type safety")
    
    if stats['warnings'] > stats['errors'] * 2:
        report.append("4. ⚠️ Consider addressing warnings to improve code quality")
    
    report.append("\n" + "=" * 80)
    
    return "\n".join(report)

def main():
    """Main function"""
    print("Running ESLint analysis...")
    
    stdout, stderr, returncode = run_eslint()
    
    if returncode != 0 and not stdout:
        print(f"ESLint failed to run: {stderr}")
        return
    
    # Parse the output
    issues = parse_eslint_output(stdout + stderr)
    
    if not issues:
        print("🎉 No ESLint issues found!")
        return
    
    # Analyze issues
    stats = analyze_issues(issues)
    
    # Generate and display report
    report = generate_report(stats, issues)
    print(report)
    
    # Save report to file
    with open('eslint_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📄 Report saved to: eslint_report.txt")
    print(f"📊 Processed {len(issues)} issues across {stats['files_with_issues']} files")

if __name__ == "__main__":
    main()