#!/usr/bin/env tsx
/**
 * 24点求解器预计算脚本
 * 生成所有4个数字组合的解法，输出到 JSON 文件
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EPSILON = 1e-9;

type Operator = '+' | '-' | '*' | '/';

const OPERATORS: Operator[] = ['+', '-', '*', '/'];

interface Expression {
  value: number;
  str: string;
}

function applyOp(a: number, b: number, op: Operator): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (Math.abs(b) < EPSILON) return null;
      return a / b;
  }
}

function formatExpr(a: string, b: string, op: Operator): string {
  return `(${a}${op}${b})`;
}

// 递归求解 - 从n个数中找出所有可能的表达式
function solve(nums: number[]): Set<string> {
  const solutions = new Set<string>();

  function helper(expressions: Expression[]): void {
    if (expressions.length === 1) {
      if (Math.abs(expressions[0].value - 24) < EPSILON) {
        solutions.add(expressions[0].str);
      }
      return;
    }

    // 选择两个表达式进行运算
    for (let i = 0; i < expressions.length; i++) {
      for (let j = 0; j < expressions.length; j++) {
        if (i === j) continue;

        const a = expressions[i];
        const b = expressions[j];
        const rest = expressions.filter((_, idx) => idx !== i && idx !== j);

        for (const op of OPERATORS) {
          // a op b
          const result = applyOp(a.value, b.value, op);
          if (result !== null) {
            const str = formatExpr(a.str, b.str, op);
            helper([...rest, { value: result, str }]);
          }

          // 对于非交换律运算，还需要 b op a
          if (op === '-' || op === '/') {
            const result2 = applyOp(b.value, a.value, op);
            if (result2 !== null) {
              const str2 = formatExpr(b.str, a.str, op);
              helper([...rest, { value: result2, str: str2 }]);
            }
          }
        }
      }
    }
  }

  helper(nums.map(n => ({ value: n, str: String(n) })));
  return solutions;
}

// 生成所有4个数字的组合（允许重复，排序后去重）
function* generateCombinations(): Generator<number[]> {
  for (let a = 1; a <= 13; a++) {
    for (let b = a; b <= 13; b++) {
      for (let c = b; c <= 13; c++) {
        for (let d = c; d <= 13; d++) {
          yield [a, b, c, d];
        }
      }
    }
  }
}

// 简化表达式，移除不必要的括号
function simplifyExpr(expr: string): string {
  while (expr.startsWith('(') && expr.endsWith(')')) {
    let depth = 0;
    let canRemove = true;
    for (let i = 0; i < expr.length - 1; i++) {
      if (expr[i] === '(') depth++;
      if (expr[i] === ')') depth--;
      if (depth === 0 && i < expr.length - 1) {
        canRemove = false;
        break;
      }
    }
    if (canRemove) {
      expr = expr.slice(1, -1);
    } else {
      break;
    }
  }
  return expr;
}

// 主函数
function main() {
  console.log('开始生成24点求解表...');

  const solvable: Record<string, string[]> = {};
  const unsolvable: string[] = [];

  let total = 0;
  let solvableCount = 0;

  for (const combo of generateCombinations()) {
    total++;
    const key = combo.join(',');

    const solutions = solve(combo);
    const uniqueSolutions = Array.from(solutions).map(simplifyExpr);

    if (uniqueSolutions.length > 0) {
      solvable[key] = uniqueSolutions;
      solvableCount++;
    } else {
      unsolvable.push(key);
    }

    if (total % 500 === 0) {
      console.log(`已处理 ${total} 个组合...`);
    }
  }

  console.log(`\n统计:`);
  console.log(`- 总组合数: ${total}`);
  console.log(`- 有解: ${solvableCount}`);
  console.log(`- 无解: ${unsolvable.length}`);

  const output = {
    solvable,
    unsolvable,
    version: '1.0',
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, '../web/public/24-solver-table.json');
  fs.writeFileSync(outputPath, JSON.stringify(output));

  console.log(`\n已保存到: ${outputPath}`);
  const fileSize = fs.statSync(outputPath).size;
  console.log(`文件大小: ${(fileSize / 1024).toFixed(2)} KB`);
}

main();
