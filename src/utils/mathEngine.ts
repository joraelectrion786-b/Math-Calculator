export interface EngineResult {
  ok: boolean;
  errorEn?: string;
  errorUr?: string;
  inputDisplay: string;
  kind: 'arithmetic' | 'simplify' | 'expand' | 'linear' | 'quadratic' | 'linear2d' | 'system2d' | 'geometry';
  correctAnswer: string;
  completeCalculation: string[];
  stepsEn: string[];
  stepsUr: string[];
  formulas: string[];
  shortExplanationEn: string;
  shortExplanationUr: string;
  detailedExplanationEn: string;
  detailedExplanationUr: string;
}

// ---------- EXACT RATIONAL ARITHMETIC ----------
interface Rational {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function rat(n: number, d = 1): Rational {
  if (d === 0) throw new Error('Division by zero');
  if (n === 0) return { n: 0, d: 1 };
  const sign = d < 0 ? -1 : 1;
  const sn = n * sign;
  const sd = Math.abs(d);
  // Handle decimals cleanly by scaling up to 1e6
  if (!Number.isInteger(sn) || !Number.isInteger(sd)) {
    const scale = 1_000_000;
    const inN = Math.round(sn * scale);
    const inD = Math.round(sd * scale);
    const g = gcd(inN, inD);
    return { n: inN / g, d: inD / g };
  }
  const g = gcd(sn, sd);
  return { n: sn / g, d: sd / g };
}

function addR(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d + b.n * a.d, a.d * b.d);
}
function subR(a: Rational, b: Rational): Rational {
  return rat(a.n * b.d - b.n * a.d, a.d * b.d);
}
function mulR(a: Rational, b: Rational): Rational {
  return rat(a.n * b.n, a.d * b.d);
}
function divR(a: Rational, b: Rational): Rational {
  if (b.n === 0) throw new Error('Division by zero');
  return rat(a.n * b.d, a.d * b.n);
}
function toFloat(a: Rational): number {
  return a.n / a.d;
}
function formatRational(a: Rational): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n}/${a.d}`;
}
function formatNumberNice(val: number): string {
  if (Math.abs(val) < 1e-10) return '0';
  const rounded = Math.round(val * 1000000) / 1000000;
  return Number.isInteger(rounded) ? `${rounded}` : `${Number(rounded.toFixed(6))}`;
}

// ---------- SYMBOLIC POLYNOMIAL IN X & Y ----------
// Key format: `${px},${py}` -> coefficient (number, exact when rational)
type PolyMap = Map<string, Rational>;

function polyZero(): PolyMap {
  return new Map();
}
function polyConst(r: Rational): PolyMap {
  const m = new Map<string, Rational>();
  if (r.n !== 0) m.set('0,0', r);
  return m;
}
function polyVar(v: 'x' | 'y'): PolyMap {
  const m = new Map<string, Rational>();
  m.set(v === 'x' ? '1,0' : '0,1', rat(1));
  return m;
}
function addPoly(a: PolyMap, b: PolyMap): PolyMap {
  const res = new Map(a);
  for (const [k, coef] of b.entries()) {
    const prev = res.get(k) ?? rat(0);
    const sum = addR(prev, coef);
    if (sum.n === 0) res.delete(k);
    else res.set(k, sum);
  }
  return res;
}
function subPoly(a: PolyMap, b: PolyMap): PolyMap {
  const res = new Map(a);
  for (const [k, coef] of b.entries()) {
    const prev = res.get(k) ?? rat(0);
    const diff = subR(prev, coef);
    if (diff.n === 0) res.delete(k);
    else res.set(k, diff);
  }
  return res;
}
function mulPoly(a: PolyMap, b: PolyMap): PolyMap {
  const res = new Map<string, Rational>();
  for (const [ka, ca] of a.entries()) {
    const [ax, ay] = ka.split(',').map(Number);
    for (const [kb, cb] of b.entries()) {
      const [bx, by] = kb.split(',').map(Number);
      const key = `${ax + bx},${ay + by}`;
      const prod = mulR(ca, cb);
      const prev = res.get(key) ?? rat(0);
      const sum = addR(prev, prod);
      if (sum.n === 0) res.delete(key);
      else res.set(key, sum);
    }
  }
  return res;
}
function isConstPoly(p: PolyMap): Rational | null {
  if (p.size === 0) return rat(0);
  if (p.size === 1 && p.has('0,0')) return p.get('0,0')!;
  return null;
}
function powPoly(base: PolyMap, exp: number): PolyMap {
  if (!Number.isInteger(exp) || exp < 0 || exp > 12) {
    throw new Error('Exponent on algebraic expression must be a non-negative integer ≤ 12.');
  }
  let res = polyConst(rat(1));
  for (let i = 0; i < exp; i++) {
    res = mulPoly(res, base);
  }
  return res;
}

function formatPoly(p: PolyMap): string {
  if (p.size === 0) return '0';
  const entries = Array.from(p.entries()).sort((a, b) => {
    const [ax, ay] = a[0].split(',').map(Number);
    const [bx, by] = b[0].split(',').map(Number);
    const degDiff = bx + by - (ax + ay);
    if (degDiff !== 0) return degDiff;
    return bx - ax;
  });

  const parts: string[] = [];
  entries.forEach(([key, coef], idx) => {
    const [px, py] = key.split(',').map(Number);
    const isNeg = coef.n < 0;
    const absC = rat(Math.abs(coef.n), coef.d);
    const varPart =
      (px > 0 ? (px === 1 ? 'x' : `x^${px}`) : '') +
      (py > 0 ? (py === 1 ? 'y' : `y^${py}`) : '');

    let term = '';
    if (!varPart) {
      term = formatRational(absC);
    } else if (absC.n === 1 && absC.d === 1) {
      term = varPart;
    } else {
      term = `${formatRational(absC)}${varPart}`;
    }

    if (idx === 0) {
      parts.push(isNeg ? `−${term}` : term);
    } else {
      parts.push(isNeg ? `− ${term}` : `+ ${term}`);
    }
  });

  return parts.join(' ');
}

// ---------- TOKENIZER & RECURSIVE DESCENT PARSER ----------
type Token =
  | { type: 'num'; value: string }
  | { type: 'var'; value: 'x' | 'y' }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'sqrt' }
  | { type: 'pct' }
  | { type: 'lparen' }
  | { type: 'rparen' };

type ASTNode =
  | { kind: 'num'; raw: string; val: Rational }
  | { kind: 'var'; name: 'x' | 'y' }
  | { kind: 'unary'; op: '-'; arg: ASTNode }
  | { kind: 'sqrt'; arg: ASTNode }
  | { kind: 'pct'; arg: ASTNode }
  | { kind: 'bin'; op: '+' | '-' | '*' | '/' | '^'; left: ASTNode; right: ASTNode };

function normalizeMathString(raw: string): string {
  return raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/–/g, '-')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/sqrt\s*\(/gi, '√(')
    .replace(/√\s*(\d+(?:\.\d+)?)/g, '√($1)')
    .replace(/√\s*([xy])/gi, '√($1)')
    .replace(/\s+/g, '');
}

function tokenize(input: string): Token[] {
  const s = normalizeMathString(input);
  if (!s) throw new Error('Empty expression');
  const rawTokens: Token[] = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      let dots = 0;
      while (j < s.length && /[0-9.]/.test(s[j])) {
        if (s[j] === '.') dots++;
        j++;
      }
      if (dots > 1) throw new Error(`Invalid number near "${s.slice(i, j)}"`);
      const numStr = s.slice(i, j);
      if (numStr === '.') throw new Error('Standalone decimal point "." is invalid');
      rawTokens.push({ type: 'num', value: numStr });
      i = j;
    } else if (ch === 'x' || ch === 'X' || ch === 'y' || ch === 'Y') {
      rawTokens.push({ type: 'var', value: ch.toLowerCase() as 'x' | 'y' });
      i++;
    } else if (ch === '√') {
      rawTokens.push({ type: 'sqrt' });
      i++;
    } else if (ch === '%') {
      rawTokens.push({ type: 'pct' });
      i++;
    } else if (ch === '(') {
      rawTokens.push({ type: 'lparen' });
      i++;
    } else if (ch === ')') {
      rawTokens.push({ type: 'rparen' });
      i++;
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      rawTokens.push({ type: 'op', value: ch });
      i++;
    } else {
      throw new Error(`Unsupported symbol "${ch}". Use numbers, x, y, +, −, ×, ÷, ^, √, %, and ( ).`);
    }
  }

  // Insert implicit multiplication tokens cleanly
  const out: Token[] = [];
  for (let k = 0; k < rawTokens.length; k++) {
    const cur = rawTokens[k];
    if (out.length > 0) {
      const prev = out[out.length - 1];
      const prevEndsAtom =
        prev.type === 'num' || prev.type === 'var' || prev.type === 'rparen' || prev.type === 'pct';
      const curStartsAtom =
        cur.type === 'var' || cur.type === 'lparen' || cur.type === 'sqrt' || (cur.type === 'num' && prev.type === 'rparen');
      if (prevEndsAtom && curStartsAtom) {
        out.push({ type: 'op', value: '*' });
      }
    }
    out.push(cur);
  }
  return out;
}

function parseTokens(tokens: Token[]): ASTNode {
  let pos = 0;
  const peek = () => tokens[pos];
  const consume = () => tokens[pos++];

  function parseExpr(): ASTNode {
    let left = parseTerm();
    while (peek()?.type === 'op' && (peek() as { value: string }).value.match(/^[+-]$/)) {
      const op = (consume() as { type: 'op'; value: '+' | '-' }).value;
      const right = parseTerm();
      left = { kind: 'bin', op, left, right };
    }
    return left;
  }

  function parseTerm(): ASTNode {
    let left = parsePower();
    while (peek()?.type === 'op' && (peek() as { value: string }).value.match(/^[*/]$/)) {
      const op = (consume() as { type: 'op'; value: '*' | '/' }).value;
      const right = parsePower();
      left = { kind: 'bin', op, left, right };
    }
    return left;
  }

  function parsePower(): ASTNode {
    const base = parseUnary();
    if (peek()?.type === 'op' && (peek() as { value: string }).value === '^') {
      consume();
      const right = parsePower();
      return { kind: 'bin', op: '^', left: base, right };
    }
    return base;
  }

  function parseUnary(): ASTNode {
    const tk = peek();
    if (tk?.type === 'op' && tk.value === '-') {
      consume();
      return { kind: 'unary', op: '-', arg: parseUnary() };
    }
    if (tk?.type === 'op' && tk.value === '+') {
      consume();
      return parseUnary();
    }
    if (tk?.type === 'sqrt') {
      consume();
      return { kind: 'sqrt', arg: parseUnary() };
    }
    return parsePostfix();
  }

  function parsePostfix(): ASTNode {
    let node = parsePrimary();
    while (peek()?.type === 'pct') {
      consume();
      node = { kind: 'pct', arg: node };
    }
    return node;
  }

  function parsePrimary(): ASTNode {
    const tk = peek();
    if (!tk) throw new Error('Unexpected end of expression');
    if (tk.type === 'num') {
      consume();
      const numVal = Number(tk.value);
      if (!Number.isFinite(numVal)) throw new Error(`Invalid number "${tk.value}"`);
      return { kind: 'num', raw: tk.value, val: rat(numVal) };
    }
    if (tk.type === 'var') {
      consume();
      return { kind: 'var', name: tk.value };
    }
    if (tk.type === 'lparen') {
      consume();
      const inner = parseExpr();
      if (peek()?.type !== 'rparen') {
        throw new Error('Missing closing bracket ")"');
      }
      consume();
      return inner;
    }
    throw new Error('Unexpected token in expression');
  }

  const ast = parseExpr();
  if (pos < tokens.length) {
    throw new Error('Unexpected extra bracket or symbol in expression');
  }
  return ast;
}

function hasVariables(node: ASTNode): boolean {
  switch (node.kind) {
    case 'var':
      return true;
    case 'num':
      return false;
    case 'unary':
    case 'sqrt':
    case 'pct':
      return hasVariables(node.arg);
    case 'bin':
      return hasVariables(node.left) || hasVariables(node.right);
  }
}

function astToString(node: ASTNode): string {
  switch (node.kind) {
    case 'num':
      return node.raw;
    case 'var':
      return node.name;
    case 'unary':
      return `−${astToString(node.arg)}`;
    case 'sqrt':
      return `√(${astToString(node.arg)})`;
    case 'pct':
      return `${astToString(node.arg)}%`;
    case 'bin': {
      const opSym = node.op === '*' ? '×' : node.op === '/' ? '÷' : node.op === '-' ? '−' : node.op;
      const l = node.left.kind === 'bin' ? `(${astToString(node.left)})` : astToString(node.left);
      const r = node.right.kind === 'bin' ? `(${astToString(node.right)})` : astToString(node.right);
      return `${l} ${opSym} ${r}`;
    }
  }
}

// ---------- NUMERIC EVALUATOR (FOR PURE ARITHMETIC WITH ROOTS) ----------
interface NumericEvalResult {
  value: number;
  exactRational: Rational | null;
  stepsEn: string[];
  stepsUr: string[];
  calcLines: string[];
}

function evalNumericAST(node: ASTNode): NumericEvalResult {
  switch (node.kind) {
    case 'num':
      return {
        value: toFloat(node.val),
        exactRational: node.val,
        stepsEn: [],
        stepsUr: [],
        calcLines: [],
      };
    case 'var':
      throw new Error('Expression contains variables; cannot evaluate numerically.');
    case 'unary': {
      const inner = evalNumericAST(node.arg);
      return {
        value: -inner.value,
        exactRational: inner.exactRational ? rat(-inner.exactRational.n, inner.exactRational.d) : null,
        stepsEn: inner.stepsEn,
        stepsUr: inner.stepsUr,
        calcLines: inner.calcLines,
      };
    }
    case 'pct': {
      const inner = evalNumericAST(node.arg);
      const res = inner.value / 100;
      const ex = inner.exactRational ? divR(inner.exactRational, rat(100)) : null;
      const line = `${formatNumberNice(inner.value)}% = ${formatNumberNice(inner.value)} ÷ 100 = ${formatNumberNice(res)}`;
      return {
        value: res,
        exactRational: ex,
        stepsEn: [...inner.stepsEn, `Convert percentage: ${line}`],
        stepsUr: [...inner.stepsUr, `فیصد کو عدد میں بدلیں: ${line}`],
        calcLines: [...inner.calcLines, line],
      };
    }
    case 'sqrt': {
      const inner = evalNumericAST(node.arg);
      if (inner.value < 0) throw new Error('Cannot take the square root of a negative number in real numbers.');
      const res = Math.sqrt(inner.value);
      let ex: Rational | null = null;
      if (inner.exactRational && inner.exactRational.n >= 0) {
        const sn = Math.round(Math.sqrt(inner.exactRational.n));
        const sd = Math.round(Math.sqrt(inner.exactRational.d));
        if (sn * sn === inner.exactRational.n && sd * sd === inner.exactRational.d) {
          ex = rat(sn, sd);
        }
      }
      const line = `√(${formatNumberNice(inner.value)}) = ${formatNumberNice(res)}`;
      return {
        value: res,
        exactRational: ex,
        stepsEn: [...inner.stepsEn, `Calculate square root: ${line}`],
        stepsUr: [...inner.stepsUr, `جزر المربع معلوم کریں: ${line}`],
        calcLines: [...inner.calcLines, line],
      };
    }
    case 'bin': {
      const L = evalNumericAST(node.left);
      const R = evalNumericAST(node.right);
      let value = 0;
      let ex: Rational | null = null;

      if (node.op === '+') {
        value = L.value + R.value;
        if (L.exactRational && R.exactRational) ex = addR(L.exactRational, R.exactRational);
      } else if (node.op === '-') {
        value = L.value - R.value;
        if (L.exactRational && R.exactRational) ex = subR(L.exactRational, R.exactRational);
      } else if (node.op === '*') {
        value = L.value * R.value;
        if (L.exactRational && R.exactRational) ex = mulR(L.exactRational, R.exactRational);
      } else if (node.op === '/') {
        if (Math.abs(R.value) < 1e-12) throw new Error('Division by zero is undefined.');
        value = L.value / R.value;
        if (L.exactRational && R.exactRational) ex = divR(L.exactRational, R.exactRational);
      } else if (node.op === '^') {
        value = Math.pow(L.value, R.value);
        if (!Number.isFinite(value)) throw new Error('Exponent result is too large or undefined.');
        if (
          L.exactRational &&
          R.exactRational &&
          R.exactRational.d === 1 &&
          R.exactRational.n >= 0 &&
          R.exactRational.n <= 12
        ) {
          ex = rat(Math.pow(L.exactRational.n, R.exactRational.n), Math.pow(L.exactRational.d, R.exactRational.n));
        }
      }

      const opSym = node.op === '*' ? '×' : node.op === '/' ? '÷' : node.op === '-' ? '−' : node.op;
      const line = `${formatNumberNice(L.value)} ${opSym} ${formatNumberNice(R.value)} = ${formatNumberNice(value)}`;
      return {
        value,
        exactRational: ex,
        stepsEn: [...L.stepsEn, ...R.stepsEn, `Compute ${line}`],
        stepsUr: [...L.stepsUr, ...R.stepsUr, `حساب کریں: ${line}`],
        calcLines: [...L.calcLines, line],
      };
    }
  }
}

// ---------- SYMBOLIC EVALUATOR (WITH EXPANSION TRACE) ----------
interface SymbolicResult {
  poly: PolyMap;
  expansionStepsEn: string[];
  expansionStepsUr: string[];
}

function evalSymbolicAST(node: ASTNode): SymbolicResult {
  switch (node.kind) {
    case 'num':
      return { poly: polyConst(node.val), expansionStepsEn: [], expansionStepsUr: [] };
    case 'var':
      return { poly: polyVar(node.name), expansionStepsEn: [], expansionStepsUr: [] };
    case 'unary': {
      const inner = evalSymbolicAST(node.arg);
      return {
        poly: subPoly(polyZero(), inner.poly),
        expansionStepsEn: inner.expansionStepsEn,
        expansionStepsUr: inner.expansionStepsUr,
      };
    }
    case 'pct': {
      const inner = evalSymbolicAST(node.arg);
      const c = isConstPoly(inner.poly);
      if (!c) throw new Error('Percentages cannot be applied directly to algebraic variables.');
      return {
        poly: polyConst(divR(c, rat(100))),
        expansionStepsEn: inner.expansionStepsEn,
        expansionStepsUr: inner.expansionStepsUr,
      };
    }
    case 'sqrt': {
      const inner = evalSymbolicAST(node.arg);
      const c = isConstPoly(inner.poly);
      if (!c) throw new Error('Square roots of expressions containing variables are not supported in Class 8 algebraic mode.');
      const val = toFloat(c);
      if (val < 0) throw new Error('Cannot take the square root of a negative number.');
      const sqN = Math.round(Math.sqrt(c.n));
      const sqD = Math.round(Math.sqrt(c.d));
      if (sqN * sqN === c.n && sqD * sqD === c.d) {
        return { poly: polyConst(rat(sqN, sqD)), expansionStepsEn: [], expansionStepsUr: [] };
      }
      return { poly: polyConst(rat(Math.sqrt(val))), expansionStepsEn: [], expansionStepsUr: [] };
    }
    case 'bin': {
      const L = evalSymbolicAST(node.left);
      const R = evalSymbolicAST(node.right);
      const stepsEn = [...L.expansionStepsEn, ...R.expansionStepsEn];
      const stepsUr = [...L.expansionStepsUr, ...R.expansionStepsUr];

      if (node.op === '+') {
        return { poly: addPoly(L.poly, R.poly), expansionStepsEn: stepsEn, expansionStepsUr: stepsUr };
      }
      if (node.op === '-') {
        return { poly: subPoly(L.poly, R.poly), expansionStepsEn: stepsEn, expansionStepsUr: stepsUr };
      }
      if (node.op === '*') {
        const prod = mulPoly(L.poly, R.poly);
        const lIsCompound = L.poly.size > 1;
        const rIsCompound = R.poly.size > 1;
        if (lIsCompound || rIsCompound) {
          const lStr = formatPoly(L.poly);
          const rStr = formatPoly(R.poly);
          const pStr = formatPoly(prod);
          stepsEn.push(`Expand brackets: (${lStr}) × (${rStr}) = ${pStr}`);
          stepsUr.push(`بریکٹ کھولیں: (${lStr}) × (${rStr}) = ${pStr}`);
        }
        return { poly: prod, expansionStepsEn: stepsEn, expansionStepsUr: stepsUr };
      }
      if (node.op === '/') {
        const rc = isConstPoly(R.poly);
        if (!rc) throw new Error('Dividing by an algebraic expression with variables is not supported here.');
        if (rc.n === 0) throw new Error('Division by zero is undefined.');
        const inv = polyConst(divR(rat(1), rc));
        return { poly: mulPoly(L.poly, inv), expansionStepsEn: stepsEn, expansionStepsUr: stepsUr };
      }
      if (node.op === '^') {
        const rc = isConstPoly(R.poly);
        if (!rc || rc.d !== 1 || rc.n < 0) {
          throw new Error('Exponents on algebraic expressions must be non-negative whole numbers.');
        }
        const powRes = powPoly(L.poly, rc.n);
        if (L.poly.size > 1 && rc.n >= 2) {
          const lStr = formatPoly(L.poly);
          const pStr = formatPoly(powRes);
          stepsEn.push(`Expand power: (${lStr})^${rc.n} = ${pStr}`);
          stepsUr.push(`قوت کھولیں: (${lStr})^${rc.n} = ${pStr}`);
        }
        return { poly: powRes, expansionStepsEn: stepsEn, expansionStepsUr: stepsUr };
      }
      throw new Error('Unknown operator');
    }
  }
}

// ---------- EQUATION & SYSTEM SOLVERS ----------
function solveSingleEquation(rawEq: string): EngineResult {
  const parts = rawEq.split('=');
  if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
    throw new Error('An equation must have a left side and a right side separated by "=".');
  }

  const lhsAst = parseTokens(tokenize(parts[0]));
  const rhsAst = parseTokens(tokenize(parts[1]));

  const lhsSym = evalSymbolicAST(lhsAst);
  const rhsSym = evalSymbolicAST(rhsAst);

  // Move everything to LHS: lhs - rhs = 0
  const combined = subPoly(lhsSym.poly, rhsSym.poly);

  // Inspect degrees of x and y
  let maxDegX = 0;
  let maxDegY = 0;
  let hasMixed = false;
  for (const key of combined.keys()) {
    const [px, py] = key.split(',').map(Number);
    if (px > maxDegX) maxDegX = px;
    if (py > maxDegY) maxDegY = py;
    if (px > 0 && py > 0) hasMixed = true;
  }

  const lhsSimplifiedStr = formatPoly(lhsSym.poly);
  const rhsSimplifiedStr = formatPoly(rhsSym.poly);

  const expansionEn = [...lhsSym.expansionStepsEn, ...rhsSym.expansionStepsEn];
  const expansionUr = [...lhsSym.expansionStepsUr, ...rhsSym.expansionStepsUr];

  // Case A: Equation in both x and y (linear 2D relation)
  if (maxDegX >= 1 && maxDegY >= 1) {
    if (maxDegX > 1 || maxDegY > 1 || hasMixed) {
      throw new Error('Two-variable equations must be linear (degree 1 in x and y).');
    }
    const a = combined.get('1,0') ?? rat(0);
    const b = combined.get('0,1') ?? rat(0);
    const c = combined.get('0,0') ?? rat(0); // ax + by + c = 0 => ax + by = -c
    const rhsConst = rat(-c.n, c.d);

    // Express y in terms of x: y = (-a/b)x + (rhsConst/b)
    const slope = divR(rat(-a.n, a.d), b);
    const intercept = divR(rhsConst, b);
    const yExpr = formatPoly(
      addPoly(mulPoly(polyConst(slope), polyVar('x')), polyConst(intercept))
    );

    const slopeX = divR(rat(-b.n, b.d), a);
    const interceptX = divR(rhsConst, a);
    const xExpr = formatPoly(
      addPoly(mulPoly(polyConst(slopeX), polyVar('y')), polyConst(interceptX))
    );

    return {
      ok: true,
      inputDisplay: rawEq,
      kind: 'linear2d',
      correctAnswer: `y = ${yExpr}  (or  x = ${xExpr})`,
      completeCalculation: [
        `Original: ${parts[0].trim()} = ${parts[1].trim()}`,
        `Standard form: ${formatPoly(addPoly(mulPoly(polyConst(a), polyVar('x')), mulPoly(polyConst(b), polyVar('y'))))} = ${formatRational(rhsConst)}`,
        `Solved for y: y = ${yExpr}`,
        `Solved for x: x = ${xExpr}`,
      ],
      stepsEn: [
        ...expansionEn,
        `Simplify both sides: ${lhsSimplifiedStr} = ${rhsSimplifiedStr}.`,
        `Rearrange into standard form ax + by = c: ${formatRational(a)}x + (${formatRational(b)})y = ${formatRational(rhsConst)}.`,
        `Isolate y: y = ${yExpr}. (Tip: To find unique values of both x and y, enter two equations separated by ";", e.g., 2x + y = 7; x - y = 2).`,
      ],
      stepsUr: [
        ...expansionUr,
        `دونوں اطراف کو مختصر کریں: ${lhsSimplifiedStr} = ${rhsSimplifiedStr}۔`,
        `معیاری شکل میں لکھیں: ${formatRational(a)}x + (${formatRational(b)})y = ${formatRational(rhsConst)}۔`,
        `y کی قیمت x کی شکل میں: y = ${yExpr}۔ (نوٹ: x اور y کی عددی قیمت معلوم کرنے کے لیے دو مساواتیں ";" کے ساتھ لکھیں)۔`,
      ],
      formulas: ['ax + by = c  ⇒  y = (−a/b)x + c/b'],
      shortExplanationEn: `Since one equation has two variables (x and y), solving for y gives y = ${yExpr}.`,
      shortExplanationUr: `ایک مساوات میں دو متغیرات (x اور y) ہونے کی وجہ سے y کی قیمت x کی شکل میں y = ${yExpr} ہے۔`,
      detailedExplanationEn: `A single linear equation in two variables represents a straight line with infinitely many (x, y) pairs. Expressing y in terms of x gives y = ${yExpr}. To solve for specific numbers, enter a second equation separated by ";".`,
      detailedExplanationUr: `دو متغیرات والی ایک مساوات ایک خط مستقیم کو ظاہر کرتی ہے۔ y کو الگ کرنے پر y = ${yExpr} حاصل ہوتا ہے۔ مخصوص قیمتوں کے لیے ";" کے بعد دوسری مساوات درج کریں۔`,
    };
  }

  // Case B: Single variable x or y
  const varName: 'x' | 'y' = maxDegY > 0 ? 'y' : 'x';
  const maxDeg = Math.max(maxDegX, maxDegY);

  if (maxDeg === 0) {
    const c = combined.get('0,0') ?? rat(0);
    if (c.n === 0) {
      return {
        ok: true,
        inputDisplay: rawEq,
        kind: 'linear',
        correctAnswer: 'Identity (True for all numbers)',
        completeCalculation: [`${lhsSimplifiedStr} = ${rhsSimplifiedStr}`, `0 = 0 (Always true)`],
        stepsEn: [...expansionEn, `Both sides simplify identically to ${lhsSimplifiedStr}.`],
        stepsUr: [...expansionUr, `دونوں اطراف برابر ہیں: ${lhsSimplifiedStr} = ${rhsSimplifiedStr}۔`],
        formulas: ['Identity: LHS ≡ RHS'],
        shortExplanationEn: 'Both sides are always equal for every value of the variable.',
        shortExplanationUr: 'دونوں اطراف ہر قیمت کے لیے برابر ہیں۔',
        detailedExplanationEn: `After expanding and combining like terms, both sides equal ${lhsSimplifiedStr}, making this an identity.`,
        detailedExplanationUr: `مختصر کرنے کے بعد دونوں اطراف برابر ثابت ہوئے، لہٰذا یہ ایک متماثلہ ہے۔`,
      };
    }
    throw new Error(`No solution exists: ${lhsSimplifiedStr} cannot equal ${rhsSimplifiedStr}.`);
  }

  if (maxDeg === 1) {
    // a*var + c = 0 => var = -c / a
    const aKey = varName === 'x' ? '1,0' : '0,1';
    const a = combined.get(aKey) ?? rat(0);
    const c = combined.get('0,0') ?? rat(0);
    const rhsVal = rat(-c.n, c.d);
    const sol = divR(rhsVal, a);
    const solStr = sol.d === 1 ? `${sol.n}` : `${formatRational(sol)} (${formatNumberNice(toFloat(sol))})`;
    const cleanSol = formatRational(sol);

    // Detailed linear steps from simplified LHS = RHS
    const lhsVar = lhsSym.poly.get(aKey) ?? rat(0);
    const lhsConst = lhsSym.poly.get('0,0') ?? rat(0);
    const rhsVar = rhsSym.poly.get(aKey) ?? rat(0);
    const rhsConst = rhsSym.poly.get('0,0') ?? rat(0);

    const calcLines: string[] = [
      `${parts[0].trim()} = ${parts[1].trim()}`,
      ...(lhsSimplifiedStr !== parts[0].trim() || rhsSimplifiedStr !== parts[1].trim()
        ? [`${lhsSimplifiedStr} = ${rhsSimplifiedStr}`]
        : []),
      `${formatRational(a)}${varName} = ${formatRational(rhsVal)}`,
      `${varName} = ${formatRational(rhsVal)} ÷ ${formatRational(a)} = ${cleanSol}`,
    ];

    const stepsEn: string[] = [...expansionEn];
    if (lhsSimplifiedStr !== parts[0].trim() || rhsSimplifiedStr !== parts[1].trim()) {
      stepsEn.push(`Combine like terms on both sides: ${lhsSimplifiedStr} = ${rhsSimplifiedStr}.`);
    }
    if (rhsVar.n !== 0) {
      stepsEn.push(`Move ${varName} terms to the left side: (${formatRational(lhsVar)} − ${formatRational(rhsVar)})${varName} = ${formatRational(a)}${varName}.`);
    }
    if (lhsConst.n !== 0 || rhsConst.n !== 0) {
      stepsEn.push(`Transpose constants to the right side: ${formatRational(a)}${varName} = ${formatRational(rhsVal)}.`);
    }
    stepsEn.push(`Divide both sides by ${formatRational(a)}: ${varName} = ${cleanSol}.`);

    const stepsUr: string[] = [...expansionUr];
    if (lhsSimplifiedStr !== parts[0].trim() || rhsSimplifiedStr !== parts[1].trim()) {
      stepsUr.push(`دونوں اطراف میں یکساں رقوم یکجا کریں: ${lhsSimplifiedStr} = ${rhsSimplifiedStr}۔`);
    }
    stepsUr.push(`متغیر ${varName} کی رقوم بائیں طرف اور مستقل اعداد دائیں طرف لے جائیں: ${formatRational(a)}${varName} = ${formatRational(rhsVal)}۔`);
    stepsUr.push(`دونوں اطراف کو ${formatRational(a)} پر تقسیم کریں: ${varName} = ${cleanSol}۔`);

    return {
      ok: true,
      inputDisplay: rawEq,
      kind: 'linear',
      correctAnswer: `${varName} = ${solStr}`,
      completeCalculation: calcLines,
      stepsEn,
      stepsUr,
      formulas: [
        'Distributive Law: a(b + c) = ab + ac',
        `Linear Equation: a${varName} + b = c ⇒ ${varName} = (c − b) / a`,
      ],
      shortExplanationEn: `Simplify both sides to ${formatRational(a)}${varName} = ${formatRational(rhsVal)}, then divide by ${formatRational(a)} to get ${varName} = ${cleanSol}.`,
      shortExplanationUr: `مساوات کو مختصر کر کے ${formatRational(a)}${varName} = ${formatRational(rhsVal)} حاصل ہوتا ہے، تقسیم کرنے پر ${varName} = ${cleanSol} جواب آتا ہے۔`,
      detailedExplanationEn: `First expand any brackets using the distributive property and combine like terms on each side. Then collect ${varName} terms on the left and constant numbers on the right. Finally divide by ${formatRational(a)} to isolate ${varName} = ${cleanSol}.`,
      detailedExplanationUr: `سب سے پہلے بریکٹ کھولیں اور ہر طرف یکساں رقوم جمع یا تفریق کریں۔ اس کے بعد ${varName} والی رقوم کو بائیں طرف اور عام اعداد کو دائیں طرف منتقل کر کے ${formatRational(a)} پر تقسیم کریں۔ یوں درست جواب ${varName} = ${cleanSol} ملتا ہے۔`,
    };
  }

  if (maxDeg === 2) {
    const aKey = varName === 'x' ? '2,0' : '0,2';
    const bKey = varName === 'x' ? '1,0' : '0,1';
    const a = toFloat(combined.get(aKey) ?? rat(0));
    const b = toFloat(combined.get(bKey) ?? rat(0));
    const c = toFloat(combined.get('0,0') ?? rat(0));
    const disc = b * b - 4 * a * c;

    if (disc < -1e-10) {
      throw new Error(
        `No real solution: Discriminant b² − 4ac = ${formatNumberNice(disc)} is negative.`
      );
    }

    const sqrtDisc = Math.sqrt(Math.max(0, disc));
    const r1 = (-b + sqrtDisc) / (2 * a);
    const r2 = (-b - sqrtDisc) / (2 * a);
    const ans =
      Math.abs(r1 - r2) < 1e-9
        ? `${varName} = ${formatNumberNice(r1)}`
        : `${varName} = ${formatNumberNice(r1)}  or  ${varName} = ${formatNumberNice(r2)}`;

    return {
      ok: true,
      inputDisplay: rawEq,
      kind: 'quadratic',
      correctAnswer: ans,
      completeCalculation: [
        `Standard form: ${formatPoly(combined)} = 0`,
        `a = ${formatNumberNice(a)}, b = ${formatNumberNice(b)}, c = ${formatNumberNice(c)}`,
        `Δ = b² − 4ac = (${formatNumberNice(b)})² − 4(${formatNumberNice(a)})(${formatNumberNice(c)}) = ${formatNumberNice(disc)}`,
        `${varName} = (−b ± √Δ) / 2a ⇒ ${ans}`,
      ],
      stepsEn: [
        ...expansionEn,
        `Rewrite in standard quadratic form: ${formatPoly(combined)} = 0.`,
        `Identify coefficients a = ${formatNumberNice(a)}, b = ${formatNumberNice(b)}, c = ${formatNumberNice(c)}.`,
        `Compute discriminant Δ = b² − 4ac = ${formatNumberNice(disc)}.`,
        `Apply the quadratic formula to get ${ans}.`,
      ],
      stepsUr: [
        ...expansionUr,
        `مساوات کو دو درجی معیاری شکل میں لکھیں: ${formatPoly(combined)} = 0۔`,
        `عددی سر: a = ${formatNumberNice(a)}، b = ${formatNumberNice(b)}، c = ${formatNumberNice(c)}۔`,
        `ممیز معلوم کریں: Δ = ${formatNumberNice(disc)}۔`,
        `دو درجی فارمولے سے حل: ${ans}۔`,
      ],
      formulas: [`${varName} = [−b ± √(b² − 4ac)] / (2a)`],
      shortExplanationEn: `Solving ${formatPoly(combined)} = 0 yields ${ans}.`,
      shortExplanationUr: `دو درجی مساوات ${formatPoly(combined)} = 0 حل کرنے سے ${ans} حاصل ہوتا ہے۔`,
      detailedExplanationEn: `Move all terms to one side to form a${varName}² + b${varName} + c = 0, compute the discriminant Δ = b² − 4ac, and apply the quadratic formula.`,
      detailedExplanationUr: `تمام رقوم ایک طرف لا کر معیاری دو درجی مساوات بنائیں اور دو درجی فارمولے سے جذر معلوم کریں۔`,
    };
  }

  throw new Error('Polynomial equations of degree higher than 2 are outside Class 8 scope.');
}

function solveSystem2D(eq1Raw: string, eq2Raw: string): EngineResult {
  const parseLinear2D = (raw: string) => {
    const parts = raw.split('=');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      throw new Error(`Invalid equation "${raw}". Each equation must contain "=".`);
    }
    const lhs = evalSymbolicAST(parseTokens(tokenize(parts[0])));
    const rhs = evalSymbolicAST(parseTokens(tokenize(parts[1])));
    const diff = subPoly(lhs.poly, rhs.poly);
    for (const key of diff.keys()) {
      const [px, py] = key.split(',').map(Number);
      if (px + py > 1) {
        throw new Error('Simultaneous equations must be linear (degree 1 in x and y).');
      }
    }
    const a = diff.get('1,0') ?? rat(0);
    const b = diff.get('0,1') ?? rat(0);
    const c0 = diff.get('0,0') ?? rat(0);
    const c = rat(-c0.n, c0.d); // ax + by = c
    return { a, b, c };
  };

  const e1 = parseLinear2D(eq1Raw);
  const e2 = parseLinear2D(eq2Raw);

  const det = subR(mulR(e1.a, e2.b), mulR(e2.a, e1.b));
  if (det.n === 0) {
    throw new Error('These two equations are parallel or identical and do not have a unique (x, y) solution.');
  }

  const xSol = divR(subR(mulR(e1.c, e2.b), mulR(e2.c, e1.b)), det);
  const ySol = divR(subR(mulR(e1.a, e2.c), mulR(e2.a, e1.c)), det);

  const xStr = formatRational(xSol);
  const yStr = formatRational(ySol);

  return {
    ok: true,
    inputDisplay: `${eq1Raw} ; ${eq2Raw}`,
    kind: 'system2d',
    correctAnswer: `x = ${xStr}, y = ${yStr}`,
    completeCalculation: [
      `Eq (1): ${formatRational(e1.a)}x + (${formatRational(e1.b)})y = ${formatRational(e1.c)}`,
      `Eq (2): ${formatRational(e2.a)}x + (${formatRational(e2.b)})y = ${formatRational(e2.c)}`,
      `Determinant D = (${formatRational(e1.a)})(${formatRational(e2.b)}) − (${formatRational(e2.a)})(${formatRational(e1.b)}) = ${formatRational(det)}`,
      `x = ${xStr},  y = ${yStr}`,
    ],
    stepsEn: [
      `Write both equations in standard form ax + by = c.`,
      `Eliminate one variable (or use determinants): D = ${formatRational(det)}.`,
      `Solve for x = (${formatRational(e1.c)}×${formatRational(e2.b)} − ${formatRational(e2.c)}×${formatRational(e1.b)}) ÷ ${formatRational(det)} = ${xStr}.`,
      `Substitute x = ${xStr} back to find y = ${yStr}.`,
    ],
    stepsUr: [
      `دونوں مساواتوں کو معیاری شکل ax + by = c میں لکھیں۔`,
      `اخراج یا کراس ملٹیپلیکیشن سے x کی قیمت نکالیں: x = ${xStr}۔`,
      `x کی قیمت درج کر کے y کی قیمت معلوم کریں: y = ${yStr}۔`,
    ],
    formulas: [
      'a₁x + b₁y = c₁  and  a₂x + b₂y = c₂',
      'x = (c₁b₂ − c₂b₁) / (a₁b₂ − a₂b₁)',
      'y = (a₁c₂ − a₂c₁) / (a₁b₂ − a₂b₁)',
    ],
    shortExplanationEn: `Solving the simultaneous linear system gives x = ${xStr} and y = ${yStr}.`,
    shortExplanationUr: `ہمزاد مساواتیں حل کرنے سے x = ${xStr} اور y = ${yStr} حاصل ہوتا ہے۔`,
    detailedExplanationEn: `We align both equations into standard form a₁x + b₁y = c₁ and a₂x + b₂y = c₂, eliminate one variable, solve for x = ${xStr}, and substitute back to get y = ${yStr}.`,
    detailedExplanationUr: `دونوں مساواتوں کو معیاری شکل میں ترتیب دے کر یکے بعد دیگرے x اور y کی قیمتیں معلوم کی گئیں: x = ${xStr} اور y = ${yStr}۔`,
  };
}

// ---------- MAIN ENTRY POINT ----------
export function evaluateMathInput(rawInput: string): EngineResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      inputDisplay: '',
      kind: 'arithmetic',
      correctAnswer: '',
      completeCalculation: [],
      stepsEn: [],
      stepsUr: [],
      formulas: [],
      shortExplanationEn: '',
      shortExplanationUr: '',
      detailedExplanationEn: '',
      detailedExplanationUr: '',
      errorEn: 'Please enter a mathematical expression or equation.',
      errorUr: 'براہ کرم کوئی ریاضی کی عبارت یا مساوات درج کریں۔',
    };
  }

  try {
    // Check if simultaneous equations (separated by ; or newline)
    const systemParts = trimmed
      .split(/[;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (systemParts.length === 2 && systemParts[0].includes('=') && systemParts[1].includes('=')) {
      return solveSystem2D(systemParts[0], systemParts[1]);
    }
    if (systemParts.length > 2) {
      throw new Error('Please enter at most 2 equations separated by ";" for x and y systems.');
    }

    // Single equation
    if (trimmed.includes('=')) {
      return solveSingleEquation(trimmed);
    }

    // Pure expression (arithmetic or algebraic simplification/expansion)
    const ast = parseTokens(tokenize(trimmed));
    if (!hasVariables(ast)) {
      const res = evalNumericAST(ast);
      const niceFloat = formatNumberNice(res.value);
      const fracStr =
        res.exactRational && res.exactRational.d !== 1
          ? `${formatRational(res.exactRational)} (${niceFloat})`
          : niceFloat;

      return {
        ok: true,
        inputDisplay: trimmed,
        kind: 'arithmetic',
        correctAnswer: fracStr,
        completeCalculation:
          res.calcLines.length > 0
            ? [...res.calcLines, `Final Answer = ${fracStr}`]
            : [`${astToString(ast)} = ${fracStr}`],
        stepsEn:
          res.stepsEn.length > 0
            ? res.stepsEn
            : [`The expression evaluates directly to ${fracStr}.`],
        stepsUr:
          res.stepsUr.length > 0
            ? res.stepsUr
            : [`عبارت کی قیمت براہ راست ${fracStr} ہے۔`],
        formulas: ['Order of Operations: Brackets → Powers & Roots → Multiply/Divide → Add/Subtract'],
        shortExplanationEn: `${trimmed} evaluates to ${fracStr}.`,
        shortExplanationUr: `${trimmed} کا جواب ${fracStr} ہے۔`,
        detailedExplanationEn: `Following BODMAS/PEMDAS order of operations, brackets, powers, and roots are resolved before multiplication/division and addition/subtraction, yielding ${fracStr}.`,
        detailedExplanationUr: `حسابی ترتیب (بریکٹ، قوت/جزر، ضرب/تقسیم، جمع/تفریق) کے مطابق حل کرنے سے درست جواب ${fracStr} حاصل ہوتا ہے۔`,
      };
    }

    // Algebraic expression simplification & bracket expansion
    const sym = evalSymbolicAST(ast);
    const simplified = formatPoly(sym.poly);
    const didExpand = sym.expansionStepsEn.length > 0;

    return {
      ok: true,
      inputDisplay: trimmed,
      kind: didExpand ? 'expand' : 'simplify',
      correctAnswer: simplified,
      completeCalculation: [
        `Expression: ${trimmed}`,
        ...(sym.expansionStepsEn.length > 0 ? sym.expansionStepsEn : []),
        `Simplified Form: ${simplified}`,
      ],
      stepsEn: [
        ...(sym.expansionStepsEn.length > 0
          ? sym.expansionStepsEn
          : ['Group terms with identical variable powers.']),
        `Combine like terms to obtain: ${simplified}.`,
      ],
      stepsUr: [
        ...(sym.expansionStepsUr.length > 0
          ? sym.expansionStepsUr
          : ['یکساں قوت والے متغیرات کو یکجا کریں۔']),
        `مختصر کرنے پر حتمی شکل: ${simplified}۔`,
      ],
      formulas: [
        'Distributive Law: a(b + c) = ab + ac',
        '(a ± b)² = a² ± 2ab + b²',
      ],
      shortExplanationEn: `Expanding and combining like terms simplifies ${trimmed} to ${simplified}.`,
      shortExplanationUr: `بریکٹ کھولنے اور یکساں رقوم یکجا کرنے سے ${simplified} حاصل ہوتا ہے۔`,
      detailedExplanationEn: `Multiply out all bracketed factors using the distributive property, then add or subtract coefficients of like powers of x and y to reach ${simplified}.`,
      detailedExplanationUr: `پہلے بریکٹ کے اندر ضرب دے کر تمام رقوم کھولیں، پھر x اور y کی ایک جیسی قوتوں کے عددی سر جمع یا تفریق کریں۔`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to parse mathematical expression.';
    return {
      ok: false,
      inputDisplay: trimmed,
      kind: 'arithmetic',
      correctAnswer: '',
      completeCalculation: [],
      stepsEn: [],
      stepsUr: [],
      formulas: [],
      shortExplanationEn: '',
      shortExplanationUr: '',
      detailedExplanationEn: '',
      detailedExplanationUr: '',
      errorEn: msg,
      errorUr: `عبارت یا مساوات حل نہیں ہو سکی: ${msg}`,
    };
  }
}

// ---------- GEOMETRY AREA, PERIMETER & VOLUME CALCULATOR ----------
export type GeometryCalcShape =
  | 'triangle'
  | 'square'
  | 'rectangle'
  | 'circle'
  | 'cube'
  | 'cuboid'
  | 'cylinder'
  | 'cone'
  | 'sphere';

export function calculateGeometryFormula(
  shape: GeometryCalcShape,
  a: number,
  b = 0,
  c = 0
): EngineResult {
  if ([a, b, c].some((v) => !Number.isFinite(v) || v < 0) || a <= 0) {
    return {
      ok: false,
      inputDisplay: `${shape}`,
      kind: 'geometry',
      correctAnswer: '',
      completeCalculation: [],
      stepsEn: [],
      stepsUr: [],
      formulas: [],
      shortExplanationEn: '',
      shortExplanationUr: '',
      detailedExplanationEn: '',
      detailedExplanationUr: '',
      errorEn: 'All shape dimensions must be positive numbers greater than 0.',
      errorUr: 'تمام پیمائشیں صفر سے بڑی مثبت ہونی چاہئیں۔',
    };
  }

  const pi = Math.PI;
  if (shape === 'rectangle') {
    if (b <= 0) return calculateGeometryFormula('square', a);
    const area = a * b;
    const peri = 2 * (a + b);
    return {
      ok: true,
      inputDisplay: `Rectangle (l = ${a}, w = ${b})`,
      kind: 'geometry',
      correctAnswer: `Area = ${formatNumberNice(area)} cm² | Perimeter = ${formatNumberNice(peri)} cm`,
      completeCalculation: [
        `Area = ${a} × ${b} = ${formatNumberNice(area)} cm²`,
        `Perimeter = 2 × (${a} + ${b}) = 2 × ${formatNumberNice(a + b)} = ${formatNumberNice(peri)} cm`,
      ],
      stepsEn: [
        `Multiply length (${a}) by width (${b}) to find Area = ${formatNumberNice(area)} cm².`,
        `Add length and width (${a} + ${b} = ${formatNumberNice(a + b)}) and multiply by 2 for Perimeter = ${formatNumberNice(peri)} cm.`,
      ],
      stepsUr: [
        `لمبائی (${a}) کو چوڑائی (${b}) سے ضرب دے کر رقبہ = ${formatNumberNice(area)} مربع سم نکالیں۔`,
        `لمبائی اور چوڑائی کو جمع کر کے 2 سے ضرب دیں: احاطہ = ${formatNumberNice(peri)} سم۔`,
      ],
      formulas: ['Area = l × w', 'Perimeter = 2(l + w)'],
      shortExplanationEn: `Rectangle area is ${formatNumberNice(area)} cm² and perimeter is ${formatNumberNice(peri)} cm.`,
      shortExplanationUr: `مستطیل کا رقبہ ${formatNumberNice(area)} مربع سم اور احاطہ ${formatNumberNice(peri)} سم ہے۔`,
      detailedExplanationEn: `A rectangle of length ${a} cm and width ${b} cm encloses ${formatNumberNice(area)} cm² of area and has a boundary length of ${formatNumberNice(peri)} cm.`,
      detailedExplanationUr: `مستطیل کا رقبہ لمبائی ضرب چوڑائی اور احاطہ چاروں اضلاع کا مجموعہ ہوتا ہے۔`,
    };
  }

  if (shape === 'square') {
    const area = a * a;
    const peri = 4 * a;
    return {
      ok: true,
      inputDisplay: `Square (s = ${a})`,
      kind: 'geometry',
      correctAnswer: `Area = ${formatNumberNice(area)} cm² | Perimeter = ${formatNumberNice(peri)} cm`,
      completeCalculation: [`Area = ${a}² = ${formatNumberNice(area)} cm²`, `Perimeter = 4 × ${a} = ${formatNumberNice(peri)} cm`],
      stepsEn: [`Square the side: ${a} × ${a} = ${formatNumberNice(area)} cm².`, `Multiply side by 4: 4 × ${a} = ${formatNumberNice(peri)} cm.`],
      stepsUr: [`ضلع کا مربع: ${a}² = ${formatNumberNice(area)} مربع سم۔`, `احاطہ: 4 × ${a} = ${formatNumberNice(peri)} سم۔`],
      formulas: ['Area = s²', 'Perimeter = 4s'],
      shortExplanationEn: `Square area is ${formatNumberNice(area)} cm² and perimeter is ${formatNumberNice(peri)} cm.`,
      shortExplanationUr: `مربع کا رقبہ ${formatNumberNice(area)} مربع سم اور احاطہ ${formatNumberNice(peri)} سم ہے۔`,
      detailedExplanationEn: `With all four sides equal to ${a} cm, Area = s² and Perimeter = 4s.`,
      detailedExplanationUr: `مربع کے چاروں اضلاع برابر ہوتے ہیں، اس لیے رقبہ = s² اور احاطہ = 4s۔`,
    };
  }

  if (shape === 'triangle') {
    const area = 0.5 * a * (b > 0 ? b : a);
    const hVal = b > 0 ? b : a;
    return {
      ok: true,
      inputDisplay: `Triangle (base = ${a}, height = ${hVal})`,
      kind: 'geometry',
      correctAnswer: `Area = ${formatNumberNice(area)} cm²`,
      completeCalculation: [`Area = ½ × ${a} × ${hVal} = ${formatNumberNice(area)} cm²`],
      stepsEn: [`Multiply base (${a}) by height (${hVal}) = ${formatNumberNice(a * hVal)}.`, `Divide by 2: Area = ${formatNumberNice(area)} cm².`],
      stepsUr: [`قاعدہ (${a}) کو اونچائی (${hVal}) سے ضرب دے کر 2 پر تقسیم کریں: رقبہ = ${formatNumberNice(area)} مربع سم۔`],
      formulas: ['Area of Triangle = ½ × base × height'],
      shortExplanationEn: `Triangle area is ${formatNumberNice(area)} cm².`,
      shortExplanationUr: `مثلث کا رقبہ ${formatNumberNice(area)} مربع سم ہے۔`,
      detailedExplanationEn: `Using Area = ½ × base × height gives ½ × ${a} × ${hVal} = ${formatNumberNice(area)} cm².`,
      detailedExplanationUr: `مثلث کے رقبے کے فارمولے ½ × قاعدہ × اونچائی سے رقبہ ${formatNumberNice(area)} مربع سم حاصل ہوا۔`,
    };
  }

  if (shape === 'circle') {
    const circ = 2 * pi * a;
    const area = pi * a * a;
    return {
      ok: true,
      inputDisplay: `Circle (r = ${a})`,
      kind: 'geometry',
      correctAnswer: `Area = ${formatNumberNice(area)} cm² | Circumference = ${formatNumberNice(circ)} cm`,
      completeCalculation: [
        `Circumference = 2 × π × ${a} ≈ ${formatNumberNice(circ)} cm`,
        `Area = π × ${a}² ≈ ${formatNumberNice(area)} cm²`,
      ],
      stepsEn: [`Circumference = 2πr = 2 × π × ${a} ≈ ${formatNumberNice(circ)} cm.`, `Area = πr² = π × ${a * a} ≈ ${formatNumberNice(area)} cm².`],
      stepsUr: [`محیط = 2πr ≈ ${formatNumberNice(circ)} سم۔`, `رقبہ = πr² ≈ ${formatNumberNice(area)} مربع سم۔`],
      formulas: ['C = 2πr', 'Area = πr²'],
      shortExplanationEn: `Circle area ≈ ${formatNumberNice(area)} cm² and circumference ≈ ${formatNumberNice(circ)} cm.`,
      shortExplanationUr: `دائرے کا رقبہ تقریباً ${formatNumberNice(area)} مربع سم اور محیط ${formatNumberNice(circ)} سم ہے۔`,
      detailedExplanationEn: `For radius r = ${a} cm, Circumference = 2πr and Area = πr².`,
      detailedExplanationUr: `رداس ${a} سم کے لیے محیط 2πr اور رقبہ πr² فارمولوں سے نکالا گیا ہے۔`,
    };
  }

  if (shape === 'cube') {
    const vol = a ** 3;
    const tsa = 6 * a * a;
    return {
      ok: true,
      inputDisplay: `Cube (s = ${a})`,
      kind: 'geometry',
      correctAnswer: `Volume = ${formatNumberNice(vol)} cm³ | Surface Area = ${formatNumberNice(tsa)} cm²`,
      completeCalculation: [`Volume = ${a}³ = ${formatNumberNice(vol)} cm³`, `Total Surface Area = 6 × ${a}² = ${formatNumberNice(tsa)} cm²`],
      stepsEn: [`Cube the side: ${a}³ = ${formatNumberNice(vol)} cm³.`, `Multiply 6 faces by s²: 6 × ${a * a} = ${formatNumberNice(tsa)} cm².`],
      stepsUr: [`حجم = ${a}³ = ${formatNumberNice(vol)} مکعب سم۔`, `کل سطحی رقبہ = 6 × ${a * a} = ${formatNumberNice(tsa)} مربع سم۔`],
      formulas: ['Volume = s³', 'TSA = 6s²'],
      shortExplanationEn: `Cube volume = ${formatNumberNice(vol)} cm³ and TSA = ${formatNumberNice(tsa)} cm².`,
      shortExplanationUr: `مکعب کا حجم ${formatNumberNice(vol)} مکعب سم اور سطحی رقبہ ${formatNumberNice(tsa)} مربع سم ہے۔`,
      detailedExplanationEn: `A cube with edge ${a} cm has volume s³ and 6 square faces totaling 6s².`,
      detailedExplanationUr: `مکعب کا حجم ضلع کا مکعب اور سطحی رقبہ چھ مربع سطحوں کا مجموعہ ہوتا ہے۔`,
    };
  }

  if (shape === 'cuboid') {
    const w = b > 0 ? b : a;
    const h = c > 0 ? c : a;
    const vol = a * w * h;
    const tsa = 2 * (a * w + w * h + a * h);
    return {
      ok: true,
      inputDisplay: `Cuboid (${a} × ${w} × ${h})`,
      kind: 'geometry',
      correctAnswer: `Volume = ${formatNumberNice(vol)} cm³ | TSA = ${formatNumberNice(tsa)} cm²`,
      completeCalculation: [`V = ${a} × ${w} × ${h} = ${formatNumberNice(vol)} cm³`, `TSA = 2(${a * w} + ${w * h} + ${a * h}) = ${formatNumberNice(tsa)} cm²`],
      stepsEn: [`Multiply dimensions: ${a} × ${w} × ${h} = ${formatNumberNice(vol)} cm³.`, `Sum pair products and double for TSA = ${formatNumberNice(tsa)} cm².`],
      stepsUr: [`حجم = ${a} × ${w} × ${h} = ${formatNumberNice(vol)} مکعب سم۔`, `کل سطحی رقبہ = ${formatNumberNice(tsa)} مربع سم۔`],
      formulas: ['V = l × w × h', 'TSA = 2(lw + wh + lh)'],
      shortExplanationEn: `Cuboid volume = ${formatNumberNice(vol)} cm³ and TSA = ${formatNumberNice(tsa)} cm².`,
      shortExplanationUr: `مکعب نما کا حجم ${formatNumberNice(vol)} مکعب سم اور سطحی رقبہ ${formatNumberNice(tsa)} مربع سم ہے۔`,
      detailedExplanationEn: `Volume is the product of length, width, and height; surface area sums all six rectangular faces.`,
      detailedExplanationUr: `حجم لمبائی، چوڑائی اور اونچائی کا حاصل ضرب ہے۔`,
    };
  }

  if (shape === 'cylinder') {
    const h = b > 0 ? b : a;
    const vol = pi * a * a * h;
    const tsa = 2 * pi * a * (a + h);
    return {
      ok: true,
      inputDisplay: `Cylinder (r = ${a}, h = ${h})`,
      kind: 'geometry',
      correctAnswer: `Volume ≈ ${formatNumberNice(vol)} cm³ | TSA ≈ ${formatNumberNice(tsa)} cm²`,
      completeCalculation: [`V = π × ${a}² × ${h} ≈ ${formatNumberNice(vol)} cm³`, `TSA = 2π(${a})(${a} + ${h}) ≈ ${formatNumberNice(tsa)} cm²`],
      stepsEn: [`Compute base area πr² × h ≈ ${formatNumberNice(vol)} cm³.`, `Compute 2πr(r + h) ≈ ${formatNumberNice(tsa)} cm².`],
      stepsUr: [`حجم = πr²h ≈ ${formatNumberNice(vol)} مکعب سم۔`, `کل سطحی رقبہ = 2πr(r + h) ≈ ${formatNumberNice(tsa)} مربع سم۔`],
      formulas: ['V = πr²h', 'TSA = 2πr(r + h)'],
      shortExplanationEn: `Cylinder volume ≈ ${formatNumberNice(vol)} cm³ and TSA ≈ ${formatNumberNice(tsa)} cm².`,
      shortExplanationUr: `سلنڈر کا حجم تقریباً ${formatNumberNice(vol)} مکعب سم اور کل سطحی رقبہ ${formatNumberNice(tsa)} مربع سم ہے۔`,
      detailedExplanationEn: `Multiply the circular base area πr² by height h for Volume, and add curved + end areas for TSA.`,
      detailedExplanationUr: `سلنڈر کا حجم قاعدے کے رقبے اور اونچائی کے حاصل ضرب کے برابر ہے۔`,
    };
  }

  if (shape === 'cone') {
    const h = b > 0 ? b : a;
    const l = Math.sqrt(a * a + h * h);
    const vol = (1 / 3) * pi * a * a * h;
    const tsa = pi * a * (a + l);
    return {
      ok: true,
      inputDisplay: `Cone (r = ${a}, h = ${h})`,
      kind: 'geometry',
      correctAnswer: `Volume ≈ ${formatNumberNice(vol)} cm³ | TSA ≈ ${formatNumberNice(tsa)} cm²`,
      completeCalculation: [`l = √(${a}² + ${h}²) ≈ ${formatNumberNice(l)} cm`, `V = ⅓πr²h ≈ ${formatNumberNice(vol)} cm³`, `TSA = πr(r + l) ≈ ${formatNumberNice(tsa)} cm²`],
      stepsEn: [`Find slant height l = √(${a}² + ${h}²) ≈ ${formatNumberNice(l)} cm.`, `Volume = ⅓πr²h ≈ ${formatNumberNice(vol)} cm³.`, `TSA = πr(r + l) ≈ ${formatNumberNice(tsa)} cm².`],
      stepsUr: [`ترچھی اونچائی l ≈ ${formatNumberNice(l)} سم۔`, `حجم ≈ ${formatNumberNice(vol)} مکعب سم۔`, `سطحی رقبہ ≈ ${formatNumberNice(tsa)} مربع سم۔`],
      formulas: ['l = √(r² + h²)', 'V = ⅓πr²h', 'TSA = πr(r + l)'],
      shortExplanationEn: `Cone volume ≈ ${formatNumberNice(vol)} cm³ and TSA ≈ ${formatNumberNice(tsa)} cm².`,
      shortExplanationUr: `مخروط کا حجم تقریباً ${formatNumberNice(vol)} مکعب سم اور سطحی رقبہ ${formatNumberNice(tsa)} مربع سم ہے۔`,
      detailedExplanationEn: `Find slant height via Pythagoras theorem first, then evaluate ⅓πr²h and πr(r + l).`,
      detailedExplanationUr: `پہلے مسئلہ فیثاغورث سے ترچھی اونچائی معلوم کریں پھر حجم اور سطحی رقبہ نکالیں۔`,
    };
  }

  // Sphere
  const vol = (4 / 3) * pi * a ** 3;
  const sa = 4 * pi * a * a;
  return {
    ok: true,
    inputDisplay: `Sphere (r = ${a})`,
    kind: 'geometry',
    correctAnswer: `Volume ≈ ${formatNumberNice(vol)} cm³ | Surface Area ≈ ${formatNumberNice(sa)} cm²`,
    completeCalculation: [`V = (4/3)π(${a})³ ≈ ${formatNumberNice(vol)} cm³`, `SA = 4π(${a})² ≈ ${formatNumberNice(sa)} cm²`],
    stepsEn: [`Volume = (4/3)πr³ ≈ ${formatNumberNice(vol)} cm³.`, `Surface Area = 4πr² ≈ ${formatNumberNice(sa)} cm².`],
    stepsUr: [`حجم = (4/3)πr³ ≈ ${formatNumberNice(vol)} مکعب سم۔`, `سطحی رقبہ = 4πr² ≈ ${formatNumberNice(sa)} مربع سم۔`],
    formulas: ['V = (4/3)πr³', 'SA = 4πr²'],
    shortExplanationEn: `Sphere volume ≈ ${formatNumberNice(vol)} cm³ and surface area ≈ ${formatNumberNice(sa)} cm².`,
    shortExplanationUr: `کرہ کا حجم تقریباً ${formatNumberNice(vol)} مکعب سم اور سطحی رقبہ ${formatNumberNice(sa)} مربع سم ہے۔`,
    detailedExplanationEn: `For a sphere of radius ${a} cm, apply V = (4/3)πr³ and SA = 4πr².`,
    detailedExplanationUr: `رداس ${a} سم والے کرہ کا حجم اور سطحی رقبہ فارمولوں سے معلوم کیا گیا۔`,
  };
}
