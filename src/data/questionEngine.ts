import type { ChapterId, Difficulty, MathQuestion, QuestionType } from '../types';

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function simplifyFraction(num: number, den: number): [number, number] {
  const g = gcd(num, den);
  return [num / g, den / g];
}

const PYTH_TRIPLES: Array<[number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [6, 8, 10],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
  [12, 16, 20],
  [15, 20, 25],
  [9, 40, 41],
  [10, 24, 26],
];

// Deterministic index-based difficulty assignment:
// 0..33 -> easy (34), 34..66 -> medium (33), 67..99 -> hard (33)
function difficultyForIndex(idx: number): Difficulty {
  if (idx < 34) return 'easy';
  if (idx < 67) return 'medium';
  return 'hard';
}

// ---------- CHAPTER 1: NUMBERS & OPERATIONS ----------
function generateNumbersQuestion(type: QuestionType, idx: number): MathQuestion {
  const difficulty = difficultyForIndex(idx);
  const id = `num-${type === 'objective' ? 'obj' : 'lng'}-${idx + 1}`;
  const marks = type === 'objective' ? 2 : 5;

  if (type === 'objective') {
    if (difficulty === 'easy') {
      const sub = idx % 4;
      if (sub === 0) {
        const n = 11 + (idx % 20);
        const sq = n * n;
        return {
          id,
          chapterId: 'numbers',
          type,
          difficulty,
          marks,
          topicEn: 'Square Roots',
          topicUr: 'جزر المربع',
          questionEn: `Find the square root of ${sq}.`,
          questionUr: `عدد ${sq} کا جزر المربع معلوم کریں۔`,
          correctAnswer: `${n}`,
          acceptedAnswers: [`${n}`],
          shortExplanationEn: `Since ${n} × ${n} = ${sq}, √${sq} = ${n}.`,
          shortExplanationUr: `چونکہ ${n} × ${n} = ${sq}، اس لیے √${sq} = ${n}۔`,
          detailedExplanationEn: `A square root of a number ${sq} is a positive number whose square equals ${sq}. Pairing factors gives ${n} × ${n} = ${sq}.`,
          detailedExplanationUr: `کسی عدد ${sq} کا جزر المربع وہ مثبت عدد ہے جسے اپنے آپ سے ضرب دینے پر ${sq} حاصل ہو۔ یہاں ${n} × ${n} = ${sq}۔`,
          stepsEn: [`Write ${sq} as a product of equal factors: ${n} × ${n}.`, `Take one factor from the pair: √${sq} = ${n}.`],
          stepsUr: [`${sq} کو دو برابر اجزاء کے حاصل ضرب میں لکھیں: ${n} × ${n}۔`, `جوڑے میں سے ایک عدد لیں: √${sq} = ${n}۔`],
          formulas: ['√(a²) = a'],
          calculationSteps: [`${sq} = ${n}²`, `√${sq} = ${n}`],
        };
      }
      if (sub === 1) {
        const base = 3 + (idx % 8);
        const cube = base * base * base;
        return {
          id,
          chapterId: 'numbers',
          type,
          difficulty,
          marks,
          topicEn: 'Cube Roots',
          topicUr: 'جزر المکعب',
          questionEn: `Evaluate the cube root: ∛${cube}.`,
          questionUr: `جزر المکعب معلوم کریں: ∛${cube}۔`,
          correctAnswer: `${base}`,
          acceptedAnswers: [`${base}`],
          shortExplanationEn: `${base}³ = ${cube}, so ∛${cube} = ${base}.`,
          shortExplanationUr: `${base}³ = ${cube}، لہٰذا ∛${cube} = ${base}۔`,
          detailedExplanationEn: `To find the cube root of ${cube}, identify the integer multiplied by itself three times to yield ${cube}.`,
          detailedExplanationUr: `${cube} کا جزر المکعب معلوم کرنے کے لیے وہ عدد تلاش کریں جسے تین بار آپس میں ضرب دینے سے ${cube} آئے۔`,
          stepsEn: [`Factorize ${cube} = ${base} × ${base} × ${base}.`, `Select one from the triplet: ${base}.`],
          stepsUr: [`تین برابر اجزاء بنائیں: ${cube} = ${base} × ${base} × ${base}۔`, `جواب = ${base}۔`],
          formulas: ['∛(a³) = a'],
          calculationSteps: [`${base} × ${base} × ${base} = ${cube}`, `∛${cube} = ${base}`],
        };
      }
      if (sub === 2) {
        const pct = [10, 15, 20, 25, 30, 40, 50, 75][idx % 8];
        const total = 40 + (idx % 9) * 20;
        const ans = (pct * total) / 100;
        return {
          id,
          chapterId: 'numbers',
          type,
          difficulty,
          marks,
          topicEn: 'Percentages',
          topicUr: 'فیصد',
          questionEn: `Calculate ${pct}% of ${total}.`,
          questionUr: `${total} کا ${pct}% معلوم کریں۔`,
          correctAnswer: `${ans}`,
          acceptedAnswers: [`${ans}`],
          shortExplanationEn: `(${pct} / 100) × ${total} = ${ans}.`,
          shortExplanationUr: `(${pct} / 100) × ${total} = ${ans}۔`,
          detailedExplanationEn: `Percent means per hundred. Multiply ${total} by ${pct} and divide by 100.`,
          detailedExplanationUr: `فیصد کا مطلب سو میں سے حصہ ہے۔ ${total} کو ${pct} سے ضرب دے کر 100 پر تقسیم کریں۔`,
          stepsEn: [`Convert ${pct}% to fraction: ${pct}/100.`, `Multiply by ${total}: (${pct} × ${total}) / 100 = ${ans}.`],
          stepsUr: [`${pct}% کو کسر میں بدلیں: ${pct}/100۔`, `${total} سے ضرب دیں: ${ans}۔`],
          formulas: ['Value = (Rate / 100) × Total'],
          calculationSteps: [`(${pct} / 100) × ${total}`, `${(pct * total)} / 100 = ${ans}`],
        };
      }
      const k = 2 + (idx % 6);
      const a = 3 + (idx % 5);
      const b = 4 + ((idx + 1) % 5);
      const [sa, sb] = simplifyFraction(a * k, b * k);
      return {
        id,
        chapterId: 'numbers',
        type,
        difficulty,
        marks,
        topicEn: 'Simplifying Ratios',
        topicUr: 'نسبت کو مختصر کرنا',
        questionEn: `Simplify the ratio ${a * k} : ${b * k} to its lowest form.`,
        questionUr: `نسبت ${a * k} : ${b * k} کو سادہ ترین شکل میں لکھیں۔`,
        correctAnswer: `${sa}:${sb}`,
        acceptedAnswers: [`${sa}:${sb}`, `${sa} : ${sb}`, `${sa}/${sb}`],
        shortExplanationEn: `Divide both terms by their HCF ${gcd(a * k, b * k)} to get ${sa}:${sb}.`,
        shortExplanationUr: `دونوں اعداد کو ان کے عادِ اعظم ${gcd(a * k, b * k)} پر تقسیم کرنے سے ${sa}:${sb} حاصل ہوتا ہے۔`,
        detailedExplanationEn: `Find the Highest Common Factor of ${a * k} and ${b * k}, which is ${gcd(a * k, b * k)}, and divide both parts by it.`,
        detailedExplanationUr: `${a * k} اور ${b * k} کا عادِ اعظم ${gcd(a * k, b * k)} ہے، دونوں کو اس پر تقسیم کریں۔`,
        stepsEn: [`HCF(${a * k}, ${b * k}) = ${gcd(a * k, b * k)}.`, `Divide both sides: ${sa} : ${sb}.`],
        stepsUr: [`عادِ اعظم = ${gcd(a * k, b * k)}۔`, `تقسیم کے بعد نسبت = ${sa} : ${sb}۔`],
        formulas: ['a : b = (a ÷ HCF) : (b ÷ HCF)'],
        calculationSteps: [`${a * k} ÷ ${gcd(a * k, b * k)} = ${sa}`, `${b * k} ÷ ${gcd(a * k, b * k)} = ${sb}`],
      };
    }

    if (difficulty === 'medium') {
      const sub = idx % 3;
      if (sub === 0) {
        const base = 2 + (idx % 4);
        const e1 = 2 + (idx % 3);
        const e2 = 1 + (idx % 3);
        const totalExp = e1 + e2;
        const val = Math.pow(base, totalExp);
        return {
          id,
          chapterId: 'numbers',
          type,
          difficulty,
          marks,
          topicEn: 'Laws of Exponents',
          topicUr: 'قوت نما کے قوانین',
          questionEn: `Evaluate: ${base}^${e1} × ${base}^${e2} (give the numerical value).`,
          questionUr: `قیمت معلوم کریں: ${base}^${e1} × ${base}^${e2}۔`,
          correctAnswer: `${val}`,
          acceptedAnswers: [`${val}`, `${base}^${totalExp}`],
          shortExplanationEn: `Add exponents: ${base}^(${e1}+${e2}) = ${base}^${totalExp} = ${val}.`,
          shortExplanationUr: `قوتوں کو جمع کریں: ${base}^${totalExp} = ${val}۔`,
          detailedExplanationEn: `Using the product law of exponents aᵐ × aⁿ = aᵐ⁺ⁿ, keep the base ${base} and add exponents ${e1} + ${e2} = ${totalExp}.`,
          detailedExplanationUr: `قوت نما کے قانون aᵐ × aⁿ = aᵐ⁺ⁿ کے مطابق اساس ${base} رکھتے ہوئے قوتیں جمع کریں۔`,
          stepsEn: [`Apply aᵐ × aⁿ = aᵐ⁺ⁿ: ${base}^(${e1} + ${e2}) = ${base}^${totalExp}.`, `Compute ${base}^${totalExp} = ${val}.`],
          stepsUr: [`کلیہ لگائیں: ${base}^(${e1} + ${e2}) = ${base}^${totalExp}۔`, `قیمت نکالیں: ${val}۔`],
          formulas: ['aᵐ × aⁿ = aᵐ⁺ⁿ'],
          calculationSteps: [`${e1} + ${e2} = ${totalExp}`, `${base}^${totalExp} = ${val}`],
        };
      }
      if (sub === 1) {
        const unitCost = 12 + (idx % 14);
        const q1 = 4 + (idx % 5);
        const q2 = q1 + 3 + (idx % 4);
        const cost1 = unitCost * q1;
        const cost2 = unitCost * q2;
        return {
          id,
          chapterId: 'numbers',
          type,
          difficulty,
          marks,
          topicEn: 'Direct Proportion',
          topicUr: 'راست تناسب',
          questionEn: `If ${q1} notebooks cost Rs. ${cost1}, what is the cost (in Rs.) of ${q2} such notebooks?`,
          questionUr: `اگر ${q1} کاپیوں کی قیمت ${cost1} روپے ہے تو ${q2} کاپیوں کی قیمت کتنی ہوگی؟`,
          correctAnswer: `${cost2}`,
          acceptedAnswers: [`${cost2}`, `Rs. ${cost2}`, `Rs ${cost2}`],
          shortExplanationEn: `Cost of 1 notebook = ${cost1}/${q1} = ${unitCost}; for ${q2} notebooks = ${unitCost} × ${q2} = ${cost2}.`,
          shortExplanationUr: `ایک کاپی کی قیمت = ${unitCost} روپے، لہٰذا ${q2} کاپیوں کی قیمت = ${cost2} روپے۔`,
          detailedExplanationEn: `More notebooks cost more money (direct proportion). First find unit price, then multiply by ${q2}.`,
          detailedExplanationUr: `کاپیاں بڑھنے سے قیمت بھی بڑھے گی (راست تناسب)۔ پہلے ایک کاپی کی قیمت معلوم کریں پھر ${q2} سے ضرب دیں۔`,
          stepsEn: [`Unit cost = ${cost1} ÷ ${q1} = Rs. ${unitCost}.`, `Cost of ${q2} notebooks = ${unitCost} × ${q2} = Rs. ${cost2}.`],
          stepsUr: [`ایک کاپی کی قیمت = ${cost1} ÷ ${q1} = ${unitCost} روپے۔`, `${q2} کاپیوں کی قیمت = ${unitCost} × ${q2} = ${cost2} روپے۔`],
          formulas: ['x₁ / y₁ = x₂ / y₂'],
          calculationSteps: [`${cost1} / ${q1} = ${unitCost}`, `${unitCost} × ${q2} = ${cost2}`],
        };
      }
      const cp = 200 + (idx % 8) * 50;
      const pct = [10, 15, 20, 25][idx % 4];
      const profit = (cp * pct) / 100;
      const sp = cp + profit;
      return {
        id,
        chapterId: 'numbers',
        type,
        difficulty,
        marks,
        topicEn: 'Profit Percentage',
        topicUr: 'فیصد نفع',
        questionEn: `A shopkeeper buys a bag for Rs. ${cp} and sells it for Rs. ${sp}. Find the profit percentage.`,
        questionUr: `ایک دکاندار نے ایک بستہ ${cp} روپے میں خرید کر ${sp} روپے میں فروخت کیا۔ فیصد نفع معلوم کریں۔`,
        correctAnswer: `${pct}%`,
        acceptedAnswers: [`${pct}`, `${pct}%`],
        shortExplanationEn: `Profit = ${sp} − ${cp} = ${profit}. Profit % = (${profit}/${cp}) × 100 = ${pct}%.`,
        shortExplanationUr: `نفع = ${profit} روپے، فیصد نفع = (${profit}/${cp}) × 100 = ${pct}%۔`,
        detailedExplanationEn: `Subtract Cost Price from Selling Price to get Profit, then divide by Cost Price and multiply by 100.`,
        detailedExplanationUr: `قیمت فروخت میں سے قیمت خرید نکال کر نفع معلوم کریں، پھر قیمت خرید پر تقسیم کر کے 100 سے ضرب دیں۔`,
        stepsEn: [`Profit = ${sp} − ${cp} = Rs. ${profit}.`, `Profit % = (${profit} / ${cp}) × 100 = ${pct}%.`],
        stepsUr: [`نفع = ${sp} − ${cp} = ${profit} روپے۔`, `فیصد نفع = (${profit} / ${cp}) × 100 = ${pct}%۔`],
        formulas: ['Profit = SP − CP', 'Profit % = (Profit / CP) × 100'],
        calculationSteps: [`${sp} − ${cp} = ${profit}`, `(${profit} / ${cp}) × 100 = ${pct}%`],
      };
    }

    // Hard objective
    const sub = idx % 3;
    if (sub === 0) {
      const w1 = 4 + (idx % 6);
      const d1 = 6 + ((idx + 2) % 6) * 2;
      const product = w1 * d1;
      const w2 = [2, 3, 4, 6, 8, 12].find((f) => product % f === 0 && f !== w1) || 2;
      const d2 = product / w2;
      return {
        id,
        chapterId: 'numbers',
        type,
        difficulty,
        marks,
        topicEn: 'Inverse Proportion',
        topicUr: 'معکوس تناسب',
        questionEn: `${w1} workers can paint a wall in ${d1} days. How many days will ${w2} workers take at the same rate?`,
        questionUr: `${w1} مزدور ایک دیوار ${d1} دن میں رنگ کرتے ہیں۔ ${w2} مزدور یہی کام کتنے دن میں کریں گے؟`,
        correctAnswer: `${d2}`,
        acceptedAnswers: [`${d2}`, `${d2} days`],
        shortExplanationEn: `Inverse proportion: ${w1} × ${d1} = ${w2} × d₂ ⇒ d₂ = ${product} / ${w2} = ${d2} days.`,
        shortExplanationUr: `معکوس تناسب: (${w1} × ${d1}) ÷ ${w2} = ${d2} دن۔`,
        detailedExplanationEn: `Fewer or more workers change the required days in inverse proportion because total worker-days remain constant.`,
        detailedExplanationUr: `مزدوروں اور دنوں میں معکوس تناسب ہوتا ہے کیونکہ کل کام برابر رہتا ہے۔`,
        stepsEn: [`Total worker-days = ${w1} × ${d1} = ${product}.`, `Days for ${w2} workers = ${product} ÷ ${w2} = ${d2}.`],
        stepsUr: [`کل کام = ${w1} × ${d1} = ${product}۔`, `${w2} مزدوروں کے دن = ${product} ÷ ${w2} = ${d2}۔`],
        formulas: ['x₁ × y₁ = x₂ × y₂'],
        calculationSteps: [`${w1} × ${d1} = ${product}`, `${product} ÷ ${w2} = ${d2}`],
      };
    }
    if (sub === 1) {
      const p = 1000 * (1 + (idx % 5));
      const r = 10;
      const amount = Math.round(p * 1.1 * 1.1);
      const ci = amount - p;
      return {
        id,
        chapterId: 'numbers',
        type,
        difficulty,
        marks,
        topicEn: 'Compound Interest',
        topicUr: 'مرکب منافع',
        questionEn: `Find the compound interest on Rs. ${p} at ${r}% per annum for 2 years compounded annually.`,
        questionUr: `${p} روپے پر ${r}% سالانہ شرح سے 2 سال کا مرکب منافع معلوم کریں۔`,
        correctAnswer: `${ci}`,
        acceptedAnswers: [`${ci}`, `Rs. ${ci}`, `Rs ${ci}`],
        shortExplanationEn: `A = ${p}(1.1)² = ${amount}; CI = ${amount} − ${p} = ${ci}.`,
        shortExplanationUr: `کل رقم = ${amount} روپے، مرکب منافع = ${amount} − ${p} = ${ci} روپے۔`,
        detailedExplanationEn: `Compute the final amount using A = P(1 + r/100)ⁿ, then subtract the principal P to obtain Compound Interest.`,
        detailedExplanationUr: `فارمولے A = P(1 + r/100)ⁿ سے کل رقم نکالیں اور اس میں سے اصل زر تفریق کریں۔`,
        stepsEn: [`A = ${p}(1 + 10/100)² = ${p} × 1.21 = ${amount}.`, `CI = ${amount} − ${p} = Rs. ${ci}.`],
        stepsUr: [`A = ${p}(1.1)² = ${amount}۔`, `مرکب منافع = ${amount} − ${p} = ${ci} روپے۔`],
        formulas: ['A = P(1 + r/100)ⁿ', 'CI = A − P'],
        calculationSteps: [`${p} × 1.21 = ${amount}`, `${amount} − ${p} = ${ci}`],
      };
    }
    const n1 = 3 + (idx % 7);
    const n2 = n1 + 2 + (idx % 4);
    return {
      id,
      chapterId: 'numbers',
      type,
      difficulty,
      marks,
      topicEn: 'Square Root of Fractions',
      topicUr: 'کسر کا جزر المربع',
      questionEn: `Find the value of √(${n1 * n1} / ${n2 * n2}) in simplest fraction form.`,
      questionUr: `√(${n1 * n1} / ${n2 * n2}) کی قیمت سادہ کسر کی شکل میں معلوم کریں۔`,
      correctAnswer: `${n1}/${n2}`,
      acceptedAnswers: [`${n1}/${n2}`],
      shortExplanationEn: `√(${n1 * n1}) / √(${n2 * n2}) = ${n1}/${n2}.`,
      shortExplanationUr: `√(${n1 * n1}) / √(${n2 * n2}) = ${n1}/${n2}۔`,
      detailedExplanationEn: `Apply the quotient property of square roots: √(a/b) = √a / √b.`,
      detailedExplanationUr: `کسر کے جزر کے قانون کے مطابق شمار کنندہ اور مخرج دونوں کا الگ الگ جزر لیں۔`,
      stepsEn: [`√${n1 * n1} = ${n1} and √${n2 * n2} = ${n2}.`, `Answer = ${n1}/${n2}.`],
      stepsUr: [`${n1 * n1} کا جزر ${n1} اور ${n2 * n2} کا جزر ${n2} ہے۔`, `جواب = ${n1}/${n2}۔`],
      formulas: ['√(a / b) = √a / √b'],
      calculationSteps: [`√${n1 * n1} = ${n1}`, `√${n2 * n2} = ${n2}`, `Result = ${n1}/${n2}`],
    };
  }

  // LONG QUESTIONS — Numbers & Operations
  if (difficulty === 'easy') {
    const a = 2 + (idx % 4);
    const b = 3 + (idx % 5);
    const c = 5 + (idx % 4);
    const totalParts = a + b + c;
    const unit = 100 * (1 + (idx % 6));
    const totalAmount = totalParts * unit;
    const shareB = b * unit;
    return {
      id,
      chapterId: 'numbers',
      type,
      difficulty,
      marks,
      topicEn: 'Proportional Division',
      topicUr: 'تناسبی تقسیم',
      questionEn: `Divide Rs. ${totalAmount} among Ali, Bilal, and Sana in the ratio ${a} : ${b} : ${c}. Find Bilal's share.`,
      questionUr: `${totalAmount} روپے کو علی، بلال اور ثناء میں ${a} : ${b} : ${c} کی نسبت سے تقسیم کریں۔ بلال کا حصہ معلوم کریں۔`,
      correctAnswer: `${shareB}`,
      acceptedAnswers: [`${shareB}`, `Rs. ${shareB}`, `Rs ${shareB}`],
      shortExplanationEn: `Sum of ratios = ${totalParts}. Bilal's share = (${b}/${totalParts}) × ${totalAmount} = Rs. ${shareB}.`,
      shortExplanationUr: `نسبتوں کا مجموعہ = ${totalParts}۔ بلال کا حصہ = (${b}/${totalParts}) × ${totalAmount} = ${shareB} روپے۔`,
      detailedExplanationEn: `First add all parts of the ratio (${a} + ${b} + ${c} = ${totalParts}). Multiply Bilal's ratio part (${b}/${totalParts}) by the total amount Rs. ${totalAmount}.`,
      detailedExplanationUr: `پہلے تمام نسبتوں کو جمع کریں (${totalParts})۔ پھر بلال کے حصے کو کل رقم سے ضرب دیں۔`,
      stepsEn: [
        `Sum of ratio terms = ${a} + ${b} + ${c} = ${totalParts}.`,
        `Value of 1 part = ${totalAmount} ÷ ${totalParts} = Rs. ${unit}.`,
        `Ali's share = ${a} × ${unit} = Rs. ${a * unit}; Bilal's share = ${b} × ${unit} = Rs. ${shareB}; Sana's share = ${c} × ${unit} = Rs. ${c * unit}.`,
      ],
      stepsUr: [
        `نسبتوں کا مجموعہ = ${a} + ${b} + ${c} = ${totalParts}۔`,
        `ایک حصے کی قیمت = ${totalAmount} ÷ ${totalParts} = ${unit} روپے۔`,
        `بلال کا حصہ = ${b} × ${unit} = ${shareB} روپے۔`,
      ],
      formulas: ['Share = (Part / Sum of Ratios) × Total Amount'],
      calculationSteps: [`${a}+${b}+${c} = ${totalParts}`, `${totalAmount} / ${totalParts} = ${unit}`, `${b} × ${unit} = ${shareB}`],
    };
  }

  if (difficulty === 'medium') {
    const mp = 800 + (idx % 10) * 100;
    const d1 = 10;
    const d2 = 20;
    const afterFirst = (mp * (100 - d1)) / 100;
    const finalPrice = (afterFirst * (100 - d2)) / 100;
    return {
      id,
      chapterId: 'numbers',
      type,
      difficulty,
      marks,
      topicEn: 'Successive Discounts',
      topicUr: 'مسلسل رعایت',
      questionEn: `The marked price of a jacket is Rs. ${mp}. A store offers two successive discounts of ${d1}% and ${d2}%. Find the final selling price.`,
      questionUr: `ایک جیکٹ کی درج شدہ قیمت ${mp} روپے ہے۔ دکاندار بالترتیب ${d1}% اور ${d2}% کی دو رعایتیں دیتا ہے۔ حتمی قیمت فروخت معلوم کریں۔`,
      correctAnswer: `${finalPrice}`,
      acceptedAnswers: [`${finalPrice}`, `Rs. ${finalPrice}`, `Rs ${finalPrice}`],
      shortExplanationEn: `After ${d1}% discount: Rs. ${afterFirst}. After ${d2}% discount on Rs. ${afterFirst}: Rs. ${finalPrice}.`,
      shortExplanationUr: `پہلی ${d1}% رعایت کے بعد: ${afterFirst} روپے۔ دوسری ${d2}% رعایت کے بعد: ${finalPrice} روپے۔`,
      detailedExplanationEn: `Successive discounts are applied one after another, not simply added. Apply ${d1}% to Rs. ${mp} first, then apply ${d2}% to the reduced price.`,
      detailedExplanationUr: `مسلسل رعایتیں ایک کے بعد ایک لگائی جاتی ہیں۔ پہلے ${mp} پر ${d1}% رعایت نکالیں اور باقی رقم پر ${d2}% رعایت لگائیں۔`,
      stepsEn: [
        `First discount = 10% of ${mp} = ${mp - afterFirst}. Price after 1st discount = ${afterFirst}.`,
        `Second discount = 20% of ${afterFirst} = ${afterFirst - finalPrice}.`,
        `Final Selling Price = ${afterFirst} − ${afterFirst - finalPrice} = Rs. ${finalPrice}.`,
      ],
      stepsUr: [
        `پہلی رعایت کے بعد قیمت = ${mp} × 0.90 = ${afterFirst} روپے۔`,
        `دوسری رعایت کے بعد حتمی قیمت = ${afterFirst} × 0.80 = ${finalPrice} روپے۔`,
      ],
      formulas: ['SP = MP × (1 − d₁/100) × (1 − d₂/100)'],
      calculationSteps: [`${mp} × 0.9 = ${afterFirst}`, `${afterFirst} × 0.8 = ${finalPrice}`],
    };
  }

  // Hard Long: Difference between Compound Interest and Simple Interest
  const p = 2000 + (idx % 6) * 1000;
  const r = 10;
  const si = (p * r * 2) / 100;
  const amount = Math.round(p * 1.1 * 1.1);
  const ci = amount - p;
  const diff = ci - si;
  return {
    id,
    chapterId: 'numbers',
    type,
    difficulty,
    marks,
    topicEn: 'Simple vs Compound Interest',
    topicUr: 'سادہ بمقابلہ مرکب منافع',
    questionEn: `Find the difference between the Compound Interest and Simple Interest on Rs. ${p} at ${r}% per annum for 2 years.`,
    questionUr: `${p} روپے پر ${r}% سالانہ شرح سے 2 سال کے مرکب منافع اور سادہ منافع کا فرق معلوم کریں۔`,
    correctAnswer: `${diff}`,
    acceptedAnswers: [`${diff}`, `Rs. ${diff}`, `Rs ${diff}`],
    shortExplanationEn: `SI = ${si}, CI = ${ci}, so CI − SI = ${diff}.`,
    shortExplanationUr: `سادہ منافع = ${si}، مرکب منافع = ${ci}، فرق = ${diff} روپے۔`,
    detailedExplanationEn: `Calculate Simple Interest using PRT/100, then Compound Interest using P(1 + r/100)² − P, and subtract SI from CI.`,
    detailedExplanationUr: `پہلے سادہ منافع معلوم کریں، پھر مرکب منافع نکالیں اور دونوں کا فرق معلوم کریں۔`,
    stepsEn: [
      `Simple Interest (SI) = (${p} × ${r} × 2) / 100 = Rs. ${si}.`,
      `Compound Amount (A) = ${p}(1 + 10/100)² = ${p} × 1.21 = Rs. ${amount}.`,
      `Compound Interest (CI) = ${amount} − ${p} = Rs. ${ci}.`,
      `Difference = CI − SI = ${ci} − ${si} = Rs. ${diff}.`,
    ],
    stepsUr: [
      `سادہ منافع = (${p} × ${r} × 2) / 100 = ${si} روپے۔`,
      `مرکب رقم = ${p} × 1.21 = ${amount} روپے۔`,
      `مرکب منافع = ${amount} − ${p} = ${ci} روپے۔`,
      `فرق = ${ci} − ${si} = ${diff} روپے۔`,
    ],
    formulas: ['SI = (P × R × T) / 100', 'CI = P(1 + R/100)ᵀ − P'],
    calculationSteps: [`SI = ${si}`, `A = ${amount}`, `CI = ${ci}`, `${ci} − ${si} = ${diff}`],
  };
}

// ---------- CHAPTER 2: ALGEBRA ----------
function generateAlgebraQuestion(type: QuestionType, idx: number): MathQuestion {
  const difficulty = difficultyForIndex(idx);
  const id = `alg-${type === 'objective' ? 'obj' : 'lng'}-${idx + 1}`;
  const marks = type === 'objective' ? 2 : 5;

  if (type === 'objective') {
    if (difficulty === 'easy') {
      const sub = idx % 3;
      if (sub === 0) {
        const a = 2 + (idx % 6);
        const xVal = 2 + (idx % 12);
        const b = 3 + (idx % 9);
        const c = a * xVal + b;
        return {
          id,
          chapterId: 'algebra',
          type,
          difficulty,
          marks,
          topicEn: 'Linear Equations',
          topicUr: 'یک درجی مساوات',
          questionEn: `Solve for x: ${a}x + ${b} = ${c}`,
          questionUr: `x کی قیمت معلوم کریں: ${a}x + ${b} = ${c}`,
          correctAnswer: `${xVal}`,
          acceptedAnswers: [`${xVal}`, `x=${xVal}`, `x = ${xVal}`],
          shortExplanationEn: `Subtract ${b} to get ${a}x = ${c - b}, then divide by ${a} to get x = ${xVal}.`,
          shortExplanationUr: `${b} کو دوسری طرف تفریق کریں: ${a}x = ${c - b}، پس x = ${xVal}۔`,
          detailedExplanationEn: `Transpose +${b} to the right-hand side as −${b}, simplify, and divide both sides by ${a}.`,
          detailedExplanationUr: `مساوات حل کرنے کے لیے +${b} کو دائیں جانب منفی کریں اور پھر ${a} پر تقسیم کریں۔`,
          stepsEn: [`${a}x = ${c} − ${b} = ${c - b}.`, `x = ${c - b} ÷ ${a} = ${xVal}.`],
          stepsUr: [`${a}x = ${c} − ${b} = ${c - b}۔`, `x = ${c - b} ÷ ${a} = ${xVal}۔`],
          formulas: ['ax + b = c ⇒ x = (c − b) / a'],
          calculationSteps: [`${c} − ${b} = ${c - b}`, `${c - b} / ${a} = ${xVal}`],
        };
      }
      if (sub === 1) {
        const m = 2 + (idx % 5);
        const n = 3 + (idx % 7);
        const xVal = 2 + (idx % 6);
        const val = m * xVal * xVal + n;
        return {
          id,
          chapterId: 'algebra',
          type,
          difficulty,
          marks,
          topicEn: 'Evaluating Expressions',
          topicUr: 'الجبری جملوں کی قیمت',
          questionEn: `Find the value of ${m}x² + ${n} when x = ${xVal}.`,
          questionUr: `جب x = ${xVal} ہو تو ${m}x² + ${n} کی قیمت معلوم کریں۔`,
          correctAnswer: `${val}`,
          acceptedAnswers: [`${val}`],
          shortExplanationEn: `${m}(${xVal})² + ${n} = ${m}(${xVal * xVal}) + ${n} = ${val}.`,
          shortExplanationUr: `${m}(${xVal})² + ${n} = ${m * xVal * xVal} + ${n} = ${val}۔`,
          detailedExplanationEn: `Substitute x = ${xVal}, compute the exponent first, multiply by ${m}, and add ${n}.`,
          detailedExplanationUr: `x کی جگہ ${xVal} درج کریں، پہلے مربع نکالیں، پھر ${m} سے ضرب دے کر ${n} جمع کریں۔`,
          stepsEn: [`Substitute x = ${xVal}: ${m} × ${xVal * xVal} + ${n}.`, `Simplify: ${m * xVal * xVal} + ${n} = ${val}.`],
          stepsUr: [`x = ${xVal} درج کریں: ${m} × ${xVal * xVal} + ${n}۔`, `جمع کریں: ${val}۔`],
          formulas: ['Substitution: Replace variable with given constant'],
          calculationSteps: [`${xVal}² = ${xVal * xVal}`, `${m} × ${xVal * xVal} = ${m * xVal * xVal}`, `${m * xVal * xVal} + ${n} = ${val}`],
        };
      }
      const p = 2 + (idx % 7);
      const q = 3 + (idx % 6);
      return {
        id,
        chapterId: 'algebra',
        type,
        difficulty,
        marks,
        topicEn: 'Expanding Identities',
        topicUr: 'الجبری کلیہ کھولنا',
        questionEn: `Expand (x + ${p})² − x² − ${p * p}. What simplified term remains?`,
        questionUr: `(x + ${p})² − x² − ${p * p} کو مختصر کریں۔`,
        correctAnswer: `${2 * p}x`,
        acceptedAnswers: [`${2 * p}x`],
        shortExplanationEn: `(x + ${p})² = x² + ${2 * p}x + ${p * p}, so subtracting x² + ${p * p} leaves ${2 * p}x.`,
        shortExplanationUr: `(x + ${p})² = x² + ${2 * p}x + ${p * p}، باقی بچا ${2 * p}x۔`,
        detailedExplanationEn: `Use (a + b)² = a² + 2ab + b² and cancel like terms.`,
        detailedExplanationUr: `(a + b)² کا کلیہ کھولیں اور یکساں رقوم منفی کریں۔`,
        stepsEn: [`Expand (x + ${p})² = x² + ${2 * p}x + ${p * p}.`, `Cancel x² and ${p * p} to leave ${2 * p}x.`],
        stepsUr: [`(x + ${p})² = x² + ${2 * p}x + ${p * p}۔`, `مختصر کرنے پر ${2 * p}x حاصل ہوگا۔`],
        formulas: ['(a + b)² = a² + 2ab + b²'],
        calculationSteps: [`2 × x × ${p} = ${2 * p}x`],
      };
    }

    if (difficulty === 'medium') {
      const sub = idx % 2;
      if (sub === 0) {
        const a = 30 + (idx % 20);
        const b = 10 + (idx % 15);
        const ans = (a + b) * (a - b);
        return {
          id,
          chapterId: 'algebra',
          type,
          difficulty,
          marks,
          topicEn: 'Difference of Squares',
          topicUr: 'دو مربعوں کا فرق',
          questionEn: `Using an algebraic identity, evaluate: ${a}² − ${b}²`,
          questionUr: `الجبری کلیے کی مدد سے قیمت معلوم کریں: ${a}² − ${b}²`,
          correctAnswer: `${ans}`,
          acceptedAnswers: [`${ans}`],
          shortExplanationEn: `(${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = ${ans}.`,
          shortExplanationUr: `(${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = ${ans}۔`,
          detailedExplanationEn: `Apply a² − b² = (a + b)(a − b) to turn squaring into simple addition, subtraction, and multiplication.`,
          detailedExplanationUr: `کلیہ a² − b² = (a + b)(a − b) استعمال کریں۔`,
          stepsEn: [`${a} + ${b} = ${a + b} and ${a} − ${b} = ${a - b}.`, `Multiply: ${a + b} × ${a - b} = ${ans}.`],
          stepsUr: [`${a} + ${b} = ${a + b} اور ${a} − ${b} = ${a - b}۔`, `ضرب دیں: ${ans}۔`],
          formulas: ['a² − b² = (a + b)(a − b)'],
          calculationSteps: [`${a + b} × ${a - b} = ${ans}`],
        };
      }
      const xVal = 3 + (idx % 9);
      const a = 5 + (idx % 4);
      const b = 2 + (idx % 3);
      const diffCoef = a - b;
      const rightConst = 4 + (idx % 7);
      const leftConst = rightConst - diffCoef * xVal;
      const leftStr = leftConst >= 0 ? `+ ${leftConst}` : `− ${Math.abs(leftConst)}`;
      return {
        id,
        chapterId: 'algebra',
        type,
        difficulty,
        marks,
        topicEn: 'Linear Equations (Two Sides)',
        topicUr: 'دوطرفہ یک درجی مساوات',
        questionEn: `Solve for x: ${a}x ${leftStr} = ${b}x + ${rightConst}`,
        questionUr: `x کے لیے حل کریں: ${a}x ${leftStr} = ${b}x + ${rightConst}`,
        correctAnswer: `${xVal}`,
        acceptedAnswers: [`${xVal}`, `x=${xVal}`, `x = ${xVal}`],
        shortExplanationEn: `Group x terms on the left: ${diffCoef}x = ${diffCoef * xVal} ⇒ x = ${xVal}.`,
        shortExplanationUr: `متغیر ایک طرف جمع کریں: ${diffCoef}x = ${diffCoef * xVal} ⇒ x = ${xVal}۔`,
        detailedExplanationEn: `Subtract ${b}x from both sides and move constants to the right-hand side.`,
        detailedExplanationUr: `دونوں طرف سے ${b}x تفریق کریں اور مستقل اعداد دائیں جانب لے جائیں۔`,
        stepsEn: [`(${a} − ${b})x = ${rightConst} − (${leftConst}) = ${diffCoef * xVal}.`, `x = ${diffCoef * xVal} ÷ ${diffCoef} = ${xVal}.`],
        stepsUr: [`${diffCoef}x = ${diffCoef * xVal}۔`, `x = ${xVal}۔`],
        formulas: ['Collect variable terms on one side'],
        calculationSteps: [`${a}x − ${b}x = ${diffCoef}x`, `${diffCoef * xVal} / ${diffCoef} = ${xVal}`],
      };
    }

    // Hard objective
    const k = 3 + (idx % 8);
    const ans = k * k - 2;
    return {
      id,
      chapterId: 'algebra',
      type,
      difficulty,
      marks,
      topicEn: 'Reciprocal Identities',
      topicUr: 'معکوس الجبری کلیے',
      questionEn: `If x + 1/x = ${k}, find the value of x² + 1/x².`,
      questionUr: `اگر x + 1/x = ${k} ہو تو x² + 1/x² کی قیمت معلوم کریں۔`,
      correctAnswer: `${ans}`,
      acceptedAnswers: [`${ans}`],
      shortExplanationEn: `x² + 1/x² = ${k}² − 2 = ${k * k} − 2 = ${ans}.`,
      shortExplanationUr: `x² + 1/x² = ${k}² − 2 = ${ans}۔`,
      detailedExplanationEn: `Square both sides of x + 1/x = ${k}: x² + 2(x)(1/x) + 1/x² = ${k * k}, so x² + 2 + 1/x² = ${k * k}.`,
      detailedExplanationUr: `دونوں اطراف کا مربع لیں: x² + 2 + 1/x² = ${k * k}، پس 2 تفریق کریں۔`,
      stepsEn: [`(x + 1/x)² = ${k}² = ${k * k}.`, `x² + 2 + 1/x² = ${k * k} ⇒ x² + 1/x² = ${k * k} − 2 = ${ans}.`],
      stepsUr: [`مربع لینے پر: x² + 2 + 1/x² = ${k * k}۔`, `x² + 1/x² = ${k * k} − 2 = ${ans}۔`],
      formulas: ['x² + 1/x² = (x + 1/x)² − 2'],
      calculationSteps: [`${k}² = ${k * k}`, `${k * k} − 2 = ${ans}`],
    };
  }

  // LONG QUESTIONS — Algebra
  if (difficulty === 'easy') {
    const a = 2 + (idx % 4);
    const b = 1 + (idx % 5);
    const c = 3 + (idx % 6);
    const xVal = 4 + (idx % 7);
    const rhs = a * (xVal - b) + c;
    return {
      id,
      chapterId: 'algebra',
      type,
      difficulty,
      marks,
      topicEn: 'Linear Equations with Brackets',
      topicUr: 'بریکٹ والی یک درجی مساوات',
      questionEn: `Solve the equation step by step: ${a}(x − ${b}) + ${c} = ${rhs}`,
      questionUr: `مرحلہ وار حل کریں: ${a}(x − ${b}) + ${c} = ${rhs}`,
      correctAnswer: `${xVal}`,
      acceptedAnswers: [`${xVal}`, `x=${xVal}`, `x = ${xVal}`],
      shortExplanationEn: `Expand to ${a}x − ${a * b} + ${c} = ${rhs}, simplify to ${a}x = ${a * xVal}, giving x = ${xVal}.`,
      shortExplanationUr: `بریکٹ کھول کر مختصر کرنے سے ${a}x = ${a * xVal} اور x = ${xVal} حاصل ہوتا ہے۔`,
      detailedExplanationEn: `Apply the distributive property to remove brackets, combine constant terms, and isolate x.`,
      detailedExplanationUr: `پہلے ${a} کو بریکٹ کے اندر ضرب دیں، مستقل اعداد یکجا کریں اور پھر x کی قیمت نکالیں۔`,
      stepsEn: [
        `Distribute ${a}: ${a}x − ${a * b} + ${c} = ${rhs}.`,
        `Combine constants: ${a}x + (${c - a * b}) = ${rhs}.`,
        `${a}x = ${rhs} − (${c - a * b}) = ${a * xVal}.`,
        `Divide by ${a}: x = ${xVal}.`,
      ],
      stepsUr: [
        `بریکٹ کھولیں: ${a}x − ${a * b} + ${c} = ${rhs}۔`,
        `${a}x = ${a * xVal}۔`,
        `x = ${xVal}۔`,
      ],
      formulas: ['a(x − b) = ax − ab'],
      calculationSteps: [`${a} × ${b} = ${a * b}`, `${a * xVal} / ${a} = ${xVal}`],
    };
  }

  if (difficulty === 'medium') {
    const w = 6 + (idx % 10);
    const diff = 3 + (idx % 5);
    const l = w + diff;
    const perimeter = 2 * (l + w);
    return {
      id,
      chapterId: 'algebra',
      type,
      difficulty,
      marks,
      topicEn: 'Algebraic Word Problems',
      topicUr: 'الجبری عبارت والے سوالات',
      questionEn: `The length of a rectangle is ${diff} cm more than its width. If its perimeter is ${perimeter} cm, find its length in cm.`,
      questionUr: `ایک مستطیل کی لمبائی اس کی چوڑائی سے ${diff} سم زیادہ ہے۔ اگر اس کا احاطہ ${perimeter} سم ہو تو لمبائی معلوم کریں۔`,
      correctAnswer: `${l}`,
      acceptedAnswers: [`${l}`, `${l} cm`],
      shortExplanationEn: `2(w + w + ${diff}) = ${perimeter} ⇒ 2w + ${diff} = ${perimeter / 2} ⇒ w = ${w}, so length = ${l} cm.`,
      shortExplanationUr: `چوڑائی w = ${w} سم، لہٰذا لمبائی = ${w} + ${diff} = ${l} سم۔`,
      detailedExplanationEn: `Let width = w and length = w + ${diff}. Substitute into Perimeter = 2(l + w) to form a linear equation.`,
      detailedExplanationUr: `فرض کریں چوڑائی = w اور لمبائی = w + ${diff}۔ احاطے کے فارمولے میں درج کر کے مساوات بنائیں۔`,
      stepsEn: [
        `Let width = w cm, then length = (w + ${diff}) cm.`,
        `2(w + w + ${diff}) = ${perimeter} ⇒ 2w + ${diff} = ${perimeter / 2}.`,
        `2w = ${perimeter / 2 - diff} ⇒ w = ${w} cm.`,
        `Length = ${w} + ${diff} = ${l} cm.`,
      ],
      stepsUr: [
        `فرض کریں چوڑائی = w، لمبائی = w + ${diff}۔`,
        `2(2w + ${diff}) = ${perimeter} ⇒ 2w + ${diff} = ${perimeter / 2}۔`,
        `w = ${w} سم، پس لمبائی = ${l} سم۔`,
      ],
      formulas: ['Perimeter of Rectangle = 2(l + w)'],
      calculationSteps: [`${perimeter} / 2 = ${perimeter / 2}`, `${perimeter / 2} − ${diff} = ${2 * w}`, `w = ${w}`, `l = ${w} + ${diff} = ${l}`],
    };
  }

  // Hard Long: Simultaneous linear equations
  const xSol = 2 + (idx % 6);
  const ySol = 1 + ((idx + 2) % 5);
  const c1 = 2 * xSol + ySol;
  const c2 = xSol + 3 * ySol;
  return {
    id,
    chapterId: 'algebra',
    type,
    difficulty,
    marks,
    topicEn: 'Simultaneous Linear Equations',
    topicUr: 'ہمزاد یک درجی مساواتیں',
    questionEn: `Solve the simultaneous equations 2x + y = ${c1} and x + 3y = ${c2}. Find the value of x.`,
    questionUr: `ہمزاد مساواتیں 2x + y = ${c1} اور x + 3y = ${c2} حل کریں اور x کی قیمت معلوم کریں۔`,
    correctAnswer: `${xSol}`,
    acceptedAnswers: [`${xSol}`, `x=${xSol}`, `x = ${xSol}`],
    shortExplanationEn: `Eliminate y by multiplying first equation by 3: 6x + 3y = ${3 * c1}, subtract second: 5x = ${5 * xSol} ⇒ x = ${xSol}, y = ${ySol}.`,
    shortExplanationUr: `پہلی مساوات کو 3 سے ضرب دے کر دوسری تفریق کرنے سے 5x = ${5 * xSol}، پس x = ${xSol} اور y = ${ySol}۔`,
    detailedExplanationEn: `Use the elimination method to cancel y and find x, then substitute x back to verify y.`,
    detailedExplanationUr: `اخراج کے طریقے (Elimination Method) سے y کو ختم کر کے x کی قیمت معلوم کریں۔`,
    stepsEn: [
      `Multiply (1) by 3: 6x + 3y = ${3 * c1}.`,
      `Subtract (2) [x + 3y = ${c2}]: 5x = ${3 * c1 - c2} = ${5 * xSol}.`,
      `x = ${5 * xSol} ÷ 5 = ${xSol}.`,
      `Substitute x = ${xSol} into (1): y = ${c1} − ${2 * xSol} = ${ySol}.`,
    ],
    stepsUr: [
      `مساوات (1) کو 3 سے ضرب دیں: 6x + 3y = ${3 * c1}۔`,
      `مساوات (2) تفریق کریں: 5x = ${5 * xSol}۔`,
      `x = ${xSol} اور y = ${ySol}۔`,
    ],
    formulas: ['Elimination Method for Simultaneous Equations'],
    calculationSteps: [`3 × ${c1} = ${3 * c1}`, `${3 * c1} − ${c2} = ${5 * xSol}`, `${5 * xSol} / 5 = ${xSol}`],
  };
}

// ---------- CHAPTER 3: MEASUREMENT ----------
function generateMeasurementQuestion(type: QuestionType, idx: number): MathQuestion {
  const difficulty = difficultyForIndex(idx);
  const id = `mea-${type === 'objective' ? 'obj' : 'lng'}-${idx + 1}`;
  const marks = type === 'objective' ? 2 : 5;

  if (type === 'objective') {
    if (difficulty === 'easy') {
      const sub = idx % 2;
      if (sub === 0) {
        const b = 6 + (idx % 12) * 2;
        const h = 4 + (idx % 9);
        const area = (b * h) / 2;
        return {
          id,
          chapterId: 'measurement',
          type,
          difficulty,
          marks,
          topicEn: 'Area of Triangle',
          topicUr: 'مثلث کا رقبہ',
          questionEn: `Find the area (in cm²) of a triangle with base = ${b} cm and height = ${h} cm.`,
          questionUr: `اس مثلث کا رقبہ (مربع سم میں) معلوم کریں جس کا قاعدہ = ${b} سم اور اونچائی = ${h} سم ہو۔`,
          correctAnswer: `${area}`,
          acceptedAnswers: [`${area}`, `${area} cm²`, `${area} cm2`],
          shortExplanationEn: `Area = ½ × ${b} × ${h} = ${area} cm².`,
          shortExplanationUr: `رقبہ = ½ × ${b} × ${h} = ${area} مربع سم۔`,
          detailedExplanationEn: `Multiply half of the base by the perpendicular height.`,
          detailedExplanationUr: `قاعدے کے نصف کو عمودی اونچائی سے ضرب دیں۔`,
          stepsEn: [`Area = ½ × base × height = ½ × ${b} × ${h}.`, `Area = ${area} cm².`],
          stepsUr: [`رقبہ = ½ × ${b} × ${h} = ${area} مربع سم۔`],
          formulas: ['Area = ½ × b × h'],
          calculationSteps: [`${b} × ${h} = ${b * h}`, `${b * h} / 2 = ${area}`],
        };
      }
      const s = 3 + (idx % 9);
      const vol = s * s * s;
      return {
        id,
        chapterId: 'measurement',
        type,
        difficulty,
        marks,
        topicEn: 'Volume of Cube',
        topicUr: 'مکعب کا حجم',
        questionEn: `Find the volume (in cm³) of a cube whose side length is ${s} cm.`,
        questionUr: `${s} سم ضلع والے مکعب کا حجم (مکعب سم میں) معلوم کریں۔`,
        correctAnswer: `${vol}`,
        acceptedAnswers: [`${vol}`, `${vol} cm³`, `${vol} cm3`],
        shortExplanationEn: `Volume = s³ = ${s}³ = ${vol} cm³.`,
        shortExplanationUr: `حجم = ${s}³ = ${vol} مکعب سم۔`,
        detailedExplanationEn: `A cube has equal length, width, and height, so Volume = s × s × s.`,
        detailedExplanationUr: `مکعب کے تمام اضلاع برابر ہوتے ہیں، اس لیے حجم = ضلع × ضلع × ضلع۔`,
        stepsEn: [`Volume = ${s} × ${s} × ${s} = ${vol} cm³.`],
        stepsUr: [`حجم = ${s} × ${s} × ${s} = ${vol} مکعب سم۔`],
        formulas: ['Volume of Cube = s³'],
        calculationSteps: [`${s} × ${s} × ${s} = ${vol}`],
      };
    }

    if (difficulty === 'medium') {
      const r = 7 * (1 + (idx % 5));
      const area = (22 * r * r) / 7;
      return {
        id,
        chapterId: 'measurement',
        type,
        difficulty,
        marks,
        topicEn: 'Area of Circle',
        topicUr: 'دائرے کا رقبہ',
        questionEn: `Find the area (in cm²) of a circle of radius ${r} cm (take π = 22/7).`,
        questionUr: `${r} سم رداس والے دائرے کا رقبہ معلوم کریں (π = 22/7)۔`,
        correctAnswer: `${area}`,
        acceptedAnswers: [`${area}`, `${area} cm²`, `${area} cm2`],
        shortExplanationEn: `Area = (22/7) × ${r} × ${r} = ${area} cm².`,
        shortExplanationUr: `رقبہ = (22/7) × ${r} × ${r} = ${area} مربع سم۔`,
        detailedExplanationEn: `Substitute r = ${r} and π = 22/7 into Area = πr².`,
        detailedExplanationUr: `دائرے کے رقبے کے فارمولے πr² میں r = ${r} درج کریں۔`,
        stepsEn: [`Area = (22/7) × ${r} × ${r}.`, `Cancel 7 with ${r}: 22 × ${r / 7} × ${r} = ${area} cm².`],
        stepsUr: [`رقبہ = (22/7) × ${r} × ${r} = ${area} مربع سم۔`],
        formulas: ['Area = πr²'],
        calculationSteps: [`${r} / 7 = ${r / 7}`, `22 × ${r / 7} × ${r} = ${area}`],
      };
    }

    // Hard objective: Volume of cylinder
    const r = 7 * (1 + (idx % 3));
    const h = 4 + (idx % 9);
    const vol = (22 * r * r * h) / 7;
    return {
      id,
      chapterId: 'measurement',
      type,
      difficulty,
      marks,
      topicEn: 'Volume of Cylinder',
      topicUr: 'سلنڈر کا حجم',
      questionEn: `Find the volume (in cm³) of a cylinder with radius ${r} cm and height ${h} cm (π = 22/7).`,
      questionUr: `اس سلنڈر کا حجم معلوم کریں جس کا رداس ${r} سم اور اونچائی ${h} سم ہو (π = 22/7)۔`,
      correctAnswer: `${vol}`,
      acceptedAnswers: [`${vol}`, `${vol} cm³`, `${vol} cm3`],
      shortExplanationEn: `V = πr²h = (22/7) × ${r}² × ${h} = ${vol} cm³.`,
      shortExplanationUr: `حجم = (22/7) × ${r}² × ${h} = ${vol} مکعب سم۔`,
      detailedExplanationEn: `Multiply the circular base area πr² by height h.`,
      detailedExplanationUr: `قاعدے کے رقبے πr² کو اونچائی h سے ضرب دیں۔`,
      stepsEn: [`V = (22/7) × ${r} × ${r} × ${h}.`, `V = 22 × ${r / 7} × ${r} × ${h} = ${vol} cm³.`],
      stepsUr: [`حجم = 22 × ${r / 7} × ${r} × ${h} = ${vol} مکعب سم۔`],
      formulas: ['V = πr²h'],
      calculationSteps: [`(22/7) × ${r * r} = ${(22 * r * r) / 7}`, `${(22 * r * r) / 7} × ${h} = ${vol}`],
    };
  }

  // LONG QUESTIONS — Measurement
  if (difficulty === 'easy') {
    const a = 10 + (idx % 8) * 2;
    const b = 14 + (idx % 6) * 2;
    const h = 5 + (idx % 7);
    const area = ((a + b) * h) / 2;
    return {
      id,
      chapterId: 'measurement',
      type,
      difficulty,
      marks,
      topicEn: 'Area of Trapezium',
      topicUr: 'ذوزنقہ کا رقبہ',
      questionEn: `The parallel sides of a trapezium-shaped field are ${a} m and ${b} m, and the perpendicular distance between them is ${h} m. Find the area of the field in m².`,
      questionUr: `ایک ذوزنقہ نما کھیت کے متوازی اضلاع ${a} میٹر اور ${b} میٹر ہیں، اور ان کے درمیان عمودی فاصلہ ${h} میٹر ہے۔ کھیت کا رقبہ معلوم کریں۔`,
      correctAnswer: `${area}`,
      acceptedAnswers: [`${area}`, `${area} m²`, `${area} m2`],
      shortExplanationEn: `Area = ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h} = ${area} m².`,
      shortExplanationUr: `رقبہ = ½ × (${a} + ${b}) × ${h} = ${area} مربع میٹر۔`,
      detailedExplanationEn: `Sum the two parallel sides, divide by 2, and multiply by the height.`,
      detailedExplanationUr: `متوازی اضلاع کو جمع کر کے 2 پر تقسیم کریں اور اونچائی سے ضرب دیں۔`,
      stepsEn: [
        `Sum of parallel sides = ${a} + ${b} = ${a + b} m.`,
        `Area = ½ × ${a + b} × ${h} = ${(a + b) / 2} × ${h} = ${area} m².`,
      ],
      stepsUr: [
        `متوازی اضلاع کا مجموعہ = ${a} + ${b} = ${a + b} میٹر۔`,
        `رقبہ = ${(a + b) / 2} × ${h} = ${area} مربع میٹر۔`,
      ],
      formulas: ['Area of Trapezium = ½ × (a + b) × h'],
      calculationSteps: [`${a} + ${b} = ${a + b}`, `${a + b} / 2 = ${(a + b) / 2}`, `${(a + b) / 2} × ${h} = ${area}`],
    };
  }

  if (difficulty === 'medium') {
    const l = 16 + (idx % 10);
    const b = 10 + (idx % 8);
    const w = 2 + (idx % 3);
    const outerL = l + 2 * w;
    const outerB = b + 2 * w;
    const pathArea = outerL * outerB - l * b;
    return {
      id,
      chapterId: 'measurement',
      type,
      difficulty,
      marks,
      topicEn: 'Area of Rectangular Path',
      topicUr: 'مستطیل کے گرد راستے کا رقبہ',
      questionEn: `A rectangular garden is ${l} m long and ${b} m wide. A path of uniform width ${w} m runs all around the outside of it. Find the area of the path in m².`,
      questionUr: `ایک مستطیل باغ ${l} میٹر لمبا اور ${b} میٹر چوڑا ہے۔ اس کے باہر چاروں طرف ${w} میٹر چوڑا راستہ ہے۔ راستے کا رقبہ معلوم کریں۔`,
      correctAnswer: `${pathArea}`,
      acceptedAnswers: [`${pathArea}`, `${pathArea} m²`, `${pathArea} m2`],
      shortExplanationEn: `Outer area (${outerL} × ${outerB} = ${outerL * outerB}) minus inner area (${l} × ${b} = ${l * b}) = ${pathArea} m².`,
      shortExplanationUr: `بیرونی رقبہ (${outerL * outerB}) منفی اندرونی رقبہ (${l * b}) = ${pathArea} مربع میٹر۔`,
      detailedExplanationEn: `Add 2×path width to both length and width to get outer dimensions, then subtract the garden area.`,
      detailedExplanationUr: `باہر کی لمبائی اور چوڑائی معلوم کرنے کے لیے دونوں طرف ${w} میٹر یعنی مجموعی طور پر ${2 * w} میٹر جمع کریں۔`,
      stepsEn: [
        `Garden area = ${l} × ${b} = ${l * b} m².`,
        `Outer dimensions: L = ${l} + 2(${w}) = ${outerL} m, B = ${b} + 2(${w}) = ${outerB} m.`,
        `Outer area = ${outerL} × ${outerB} = ${outerL * outerB} m².`,
        `Path area = ${outerL * outerB} − ${l * b} = ${pathArea} m².`,
      ],
      stepsUr: [
        `باغ کا رقبہ = ${l} × ${b} = ${l * b} مربع میٹر۔`,
        `راستے سمیت رقبہ = ${outerL} × ${outerB} = ${outerL * outerB} مربع میٹر۔`,
        `راستے کا رقبہ = ${outerL * outerB} − ${l * b} = ${pathArea} مربع میٹر۔`,
      ],
      formulas: ['Path Area = (L + 2w)(B + 2w) − L×B'],
      calculationSteps: [`${outerL} × ${outerB} = ${outerL * outerB}`, `${l} × ${b} = ${l * b}`, `${outerL * outerB} − ${l * b} = ${pathArea}`],
    };
  }

  // Hard Long: Cone CSA using Pythagorean triple or Sphere/Cuboid melting
  const sub = idx % 2;
  if (sub === 0) {
    const r = 7;
    const h = 24;
    const l = 25;
    const mult = 1 + (idx % 3);
    const R = r * mult;
    const H = h * mult;
    const L = l * mult;
    const csa = (22 * R * L) / 7;
    return {
      id,
      chapterId: 'measurement',
      type,
      difficulty,
      marks,
      topicEn: 'Curved Surface Area of Cone',
      topicUr: 'مخروط کا خمیدہ سطحی رقبہ',
      questionEn: `A conical tent has radius ${R} m and vertical height ${H} m. Find its slant height first and then calculate its curved surface area in m² (π = 22/7).`,
      questionUr: `ایک مخروطی خیمے کا رداس ${R} میٹر اور عمودی اونچائی ${H} میٹر ہے۔ ترچھی اونچائی معلوم کر کے خمیدہ سطح کا رقبہ نکالیں (π = 22/7)۔`,
      correctAnswer: `${csa}`,
      acceptedAnswers: [`${csa}`, `${csa} m²`, `${csa} m2`],
      shortExplanationEn: `l = √(${R}² + ${H}²) = ${L} m, so CSA = (22/7) × ${R} × ${L} = ${csa} m².`,
      shortExplanationUr: `ترچھی اونچائی = ${L} میٹر، خمیدہ رقبہ = (22/7) × ${R} × ${L} = ${csa} مربع میٹر۔`,
      detailedExplanationEn: `Use Pythagoras theorem l = √(r² + h²) to find slant height l, then compute CSA = πrl.`,
      detailedExplanationUr: `مسئلہ فیثاغورث سے ترچھی اونچائی l معلوم کریں، پھر فارمولا πrl لگائیں۔`,
      stepsEn: [
        `Slant height l = √(${R}² + ${H}²) = √(${R * R + H * H}) = ${L} m.`,
        `Curved Surface Area = πrl = (22/7) × ${R} × ${L}.`,
        `CSA = 22 × ${R / 7} × ${L} = ${csa} m².`,
      ],
      stepsUr: [
        `ترچھی اونچائی l = √(${R}² + ${H}²) = ${L} میٹر۔`,
        `خمیدہ رقبہ = (22/7) × ${R} × ${L} = ${csa} مربع میٹر۔`,
      ],
      formulas: ['l = √(r² + h²)', 'CSA of Cone = πrl'],
      calculationSteps: [`${R * R} + ${H * H} = ${L * L}`, `l = ${L}`, `22 × ${R / 7} × ${L} = ${csa}`],
    };
  }

  // Melting cuboid into small cubes
  const sideCube = 2 + (idx % 3);
  const L = sideCube * (3 + (idx % 3));
  const W = sideCube * (2 + (idx % 2));
  const H = sideCube * 2;
  const count = (L * W * H) / (sideCube * sideCube * sideCube);
  return {
    id,
    chapterId: 'measurement',
    type,
    difficulty,
    marks,
    topicEn: 'Volume Conservation',
    topicUr: 'حجم کی تبدیلی',
    questionEn: `A solid metal cuboid of dimensions ${L} cm × ${W} cm × ${H} cm is melted and recast into small cubes of side ${sideCube} cm. How many small cubes are formed?`,
    questionUr: `${L} سم × ${W} سم × ${H} سم کے دھاتی مکعب نما کو پگھلا کر ${sideCube} سم ضلع والے چھوٹے مکعب بنائے جاتے ہیں۔ کتنے مکعب بنیں گے؟`,
    correctAnswer: `${count}`,
    acceptedAnswers: [`${count}`, `${count} cubes`],
    shortExplanationEn: `Number of cubes = (${L} × ${W} × ${H}) ÷ ${sideCube}³ = ${L * W * H} ÷ ${sideCube ** 3} = ${count}.`,
    shortExplanationUr: `مکعبوں کی تعداد = (${L} × ${W} × ${H}) ÷ ${sideCube}³ = ${count}۔`,
    detailedExplanationEn: `Total volume stays constant during melting. Divide the cuboid volume by the volume of one small cube.`,
    detailedExplanationUr: `پگھلانے سے کل حجم تبدیل نہیں ہوتا، اس لیے مکعب نما کے حجم کو ایک چھوٹے مکعب کے حجم سے تقسیم کریں۔`,
    stepsEn: [
      `Volume of cuboid = ${L} × ${W} × ${H} = ${L * W * H} cm³.`,
      `Volume of 1 cube = ${sideCube}³ = ${sideCube ** 3} cm³.`,
      `Number of cubes = ${L * W * H} ÷ ${sideCube ** 3} = ${count}.`,
    ],
    stepsUr: [
      `مکعب نما کا حجم = ${L * W * H} مکعب سم۔`,
      `ایک مکعب کا حجم = ${sideCube ** 3} مکعب سم۔`,
      `تعداد = ${L * W * H} ÷ ${sideCube ** 3} = ${count}۔`,
    ],
    formulas: ['Count = Volume of Large Solid / Volume of 1 Small Solid'],
    calculationSteps: [`${L * W * H} / ${sideCube ** 3} = ${count}`],
  };
}

// ---------- CHAPTER 4: GEOMETRY ----------
function generateGeometryQuestion(type: QuestionType, idx: number): MathQuestion {
  const difficulty = difficultyForIndex(idx);
  const id = `geo-${type === 'objective' ? 'obj' : 'lng'}-${idx + 1}`;
  const marks = type === 'objective' ? 2 : 5;

  if (type === 'objective') {
    if (difficulty === 'easy') {
      const sub = idx % 3;
      if (sub === 0) {
        const ang = 18 + (idx % 55);
        const comp = 90 - ang;
        return {
          id,
          chapterId: 'geometry',
          type,
          difficulty,
          marks,
          topicEn: 'Complementary Angles',
          topicUr: 'تکمیلی زاویے',
          questionEn: `Find the complement of an angle measuring ${ang}° (give number in degrees).`,
          questionUr: `${ang}° زاویے کا تکمیلی زاویہ معلوم کریں۔`,
          correctAnswer: `${comp}`,
          acceptedAnswers: [`${comp}`, `${comp}°`],
          shortExplanationEn: `Complement = 90° − ${ang}° = ${comp}°.`,
          shortExplanationUr: `تکمیلی زاویہ = 90° − ${ang}° = ${comp}°۔`,
          detailedExplanationEn: `Two angles are complementary when their sum equals 90°.`,
          detailedExplanationUr: `دو تکمیلی زاویوں کا مجموعہ 90° ہوتا ہے۔`,
          stepsEn: [`90° − ${ang}° = ${comp}°.`],
          stepsUr: [`90° − ${ang}° = ${comp}°۔`],
          formulas: ['Complement = 90° − θ'],
          calculationSteps: [`90 − ${ang} = ${comp}`],
        };
      }
      if (sub === 1) {
        const a1 = 40 + (idx % 40);
        const a2 = 35 + ((idx * 3) % 45);
        const a3 = 180 - a1 - a2;
        return {
          id,
          chapterId: 'geometry',
          type,
          difficulty,
          marks,
          topicEn: 'Triangle Angle Sum',
          topicUr: 'مثلث کے زاویوں کا مجموعہ',
          questionEn: `Two angles of a triangle are ${a1}° and ${a2}°. Find the third angle (in degrees).`,
          questionUr: `ایک مثلث کے دو زاویے ${a1}° اور ${a2}° ہیں۔ تیسرا زاویہ معلوم کریں۔`,
          correctAnswer: `${a3}`,
          acceptedAnswers: [`${a3}`, `${a3}°`],
          shortExplanationEn: `Third angle = 180° − (${a1}° + ${a2}°) = ${a3}°.`,
          shortExplanationUr: `تیسرا زاویہ = 180° − (${a1}° + ${a2}°) = ${a3}°۔`,
          detailedExplanationEn: `The interior angles of every triangle always add up to 180°.`,
          detailedExplanationUr: `کسی بھی مثلث کے تینوں اندرونی زاویوں کا مجموعہ ہمیشہ 180° ہوتا ہے۔`,
          stepsEn: [`Sum of given angles = ${a1}° + ${a2}° = ${a1 + a2}°.`, `Third angle = 180° − ${a1 + a2}° = ${a3}°.`],
          stepsUr: [`مجموعہ = ${a1 + a2}°۔`, `تیسرا زاویہ = 180° − ${a1 + a2}° = ${a3}°۔`],
          formulas: ['∠A + ∠B + ∠C = 180°'],
          calculationSteps: [`${a1} + ${a2} = ${a1 + a2}`, `180 − ${a1 + a2} = ${a3}`],
        };
      }
      const n = 5 + (idx % 6);
      const sum = (n - 2) * 180;
      return {
        id,
        chapterId: 'geometry',
        type,
        difficulty,
        marks,
        topicEn: 'Polygon Angle Sum',
        topicUr: 'کثیر الاضلاع کے زاویے',
        questionEn: `Find the sum of the interior angles (in degrees) of a polygon with ${n} sides.`,
        questionUr: `${n} اضلاع والے کثیر الاضلاع کے اندرونی زاویوں کا مجموعہ معلوم کریں۔`,
        correctAnswer: `${sum}`,
        acceptedAnswers: [`${sum}`, `${sum}°`],
        shortExplanationEn: `Sum = (${n} − 2) × 180° = ${n - 2} × 180° = ${sum}°.`,
        shortExplanationUr: `مجموعہ = (${n} − 2) × 180° = ${sum}°۔`,
        detailedExplanationEn: `Substitute n = ${n} into the polygon angle sum formula (n − 2) × 180°.`,
        detailedExplanationUr: `فارمولے (n − 2) × 180° میں n = ${n} درج کریں۔`,
        stepsEn: [`(${n} − 2) × 180° = ${n - 2} × 180° = ${sum}°.`],
        stepsUr: [`(${n} − 2) × 180° = ${sum}°۔`],
        formulas: ['Interior Sum = (n − 2) × 180°'],
        calculationSteps: [`${n} − 2 = ${n - 2}`, `${n - 2} × 180 = ${sum}`],
      };
    }

    if (difficulty === 'medium') {
      const [a, b, c] = PYTH_TRIPLES[idx % PYTH_TRIPLES.length];
      return {
        id,
        chapterId: 'geometry',
        type,
        difficulty,
        marks,
        topicEn: 'Pythagoras Theorem',
        topicUr: 'مسئلہ فیثاغورث',
        questionEn: `In a right-angled triangle, the two legs are ${a} cm and ${b} cm. Find the length of the hypotenuse (in cm).`,
        questionUr: `ایک قائمہ الزاویہ مثلث کے دو اضلاع ${a} سم اور ${b} سم ہیں۔ وتر کی لمبائی معلوم کریں۔`,
        correctAnswer: `${c}`,
        acceptedAnswers: [`${c}`, `${c} cm`],
        shortExplanationEn: `c = √(${a}² + ${b}²) = √(${a * a + b * b}) = ${c} cm.`,
        shortExplanationUr: `وتر = √(${a}² + ${b}²) = ${c} سم۔`,
        detailedExplanationEn: `Apply Pythagoras theorem c² = a² + b², add the squares, and take the square root.`,
        detailedExplanationUr: `مسئلہ فیثاغورث c² = a² + b² استعمال کریں۔`,
        stepsEn: [`c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`, `c = √${c * c} = ${c} cm.`],
        stepsUr: [`c² = ${a * a} + ${b * b} = ${c * c}۔`, `c = ${c} سم۔`],
        formulas: ['c² = a² + b²'],
        calculationSteps: [`${a * a} + ${b * b} = ${c * c}`, `√${c * c} = ${c}`],
      };
    }

    // Hard objective: Regular polygon sides from exterior angle
    const nOptions = [5, 6, 8, 9, 10, 12, 15, 18, 20];
    const n = nOptions[idx % nOptions.length];
    const ext = 360 / n;
    return {
      id,
      chapterId: 'geometry',
      type,
      difficulty,
      marks,
      topicEn: 'Regular Polygons',
      topicUr: 'باقاعدہ کثیر الاضلاع',
      questionEn: `Each exterior angle of a regular polygon measures ${ext}°. How many sides does the polygon have?`,
      questionUr: `ایک باقاعدہ کثیر الاضلاع کا ہر بیرونی زاویہ ${ext}° ہے۔ اس کے اضلاع کی تعداد کتنی ہے؟`,
      correctAnswer: `${n}`,
      acceptedAnswers: [`${n}`, `${n} sides`],
      shortExplanationEn: `Sides n = 360° ÷ ${ext}° = ${n}.`,
      shortExplanationUr: `اضلاع کی تعداد = 360° ÷ ${ext}° = ${n}۔`,
      detailedExplanationEn: `The sum of all exterior angles of any convex polygon is 360°, so divide 360° by each exterior angle.`,
      detailedExplanationUr: `تمام بیرونی زاویوں کا مجموعہ 360° ہوتا ہے، لہٰذا 360° کو ایک بیرونی زاویے پر تقسیم کریں۔`,
      stepsEn: [`n = 360° ÷ ${ext}° = ${n} sides.`],
      stepsUr: [`n = 360° ÷ ${ext}° = ${n} اضلاع۔`],
      formulas: ['Number of sides n = 360° / Exterior Angle'],
      calculationSteps: [`360 / ${ext} = ${n}`],
    };
  }

  // LONG QUESTIONS — Geometry
  if (difficulty === 'easy') {
    const ratios = [
      [1, 2, 3],
      [2, 3, 4],
      [1, 3, 5],
      [2, 3, 5],
      [3, 4, 5],
    ];
    const [r1, r2, r3] = ratios[idx % ratios.length];
    const sumR = r1 + r2 + r3;
    const xVal = 180 / sumR;
    const largest = r3 * xVal;
    return {
      id,
      chapterId: 'geometry',
      type,
      difficulty,
      marks,
      topicEn: 'Angles in a Ratio',
      topicUr: 'مثلث کے زاویوں کی نسبت',
      questionEn: `The angles of a triangle are in the ratio ${r1} : ${r2} : ${r3}. Find the measure of the largest angle (in degrees).`,
      questionUr: `ایک مثلث کے زاویوں میں ${r1} : ${r2} : ${r3} کی نسبت ہے۔ سب سے بڑا زاویہ معلوم کریں۔`,
      correctAnswer: `${largest}`,
      acceptedAnswers: [`${largest}`, `${largest}°`],
      shortExplanationEn: `(${r1}+${r2}+${r3})x = 180° ⇒ ${sumR}x = 180° ⇒ x = ${xVal}°. Largest angle = ${r3} × ${xVal}° = ${largest}°.`,
      shortExplanationUr: `${sumR}x = 180° ⇒ x = ${xVal}°۔ سب سے بڑا زاویہ = ${r3} × ${xVal}° = ${largest}°۔`,
      detailedExplanationEn: `Represent the angles as ${r1}x, ${r2}x, and ${r3}x, set their sum equal to 180°, solve for x, and calculate the largest angle.`,
      detailedExplanationUr: `زاویوں کو ${r1}x، ${r2}x اور ${r3}x فرض کریں اور ان کا مجموعہ 180° کے برابر رکھیں۔`,
      stepsEn: [
        `Let the angles be ${r1}x, ${r2}x, ${r3}x.`,
        `${r1}x + ${r2}x + ${r3}x = 180° ⇒ ${sumR}x = 180°.`,
        `x = 180 ÷ ${sumR} = ${xVal}°.`,
        `Angles are ${r1 * xVal}°, ${r2 * xVal}°, ${largest}°. Largest = ${largest}°.`,
      ],
      stepsUr: [
        `${sumR}x = 180° ⇒ x = ${xVal}°۔`,
        `سب سے بڑا زاویہ = ${r3} × ${xVal}° = ${largest}°۔`,
      ],
      formulas: ['Sum of interior angles of a triangle = 180°'],
      calculationSteps: [`180 / ${sumR} = ${xVal}`, `${r3} × ${xVal} = ${largest}`],
    };
  }

  if (difficulty === 'medium') {
    const [halfD1, halfD2, side] = PYTH_TRIPLES[idx % PYTH_TRIPLES.length];
    const d1 = 2 * halfD1;
    const d2 = 2 * halfD2;
    const perimeter = 4 * side;
    return {
      id,
      chapterId: 'geometry',
      type,
      difficulty,
      marks,
      topicEn: 'Rhombus Properties',
      topicUr: 'معین کے خواص',
      questionEn: `The diagonals of a rhombus measure ${d1} cm and ${d2} cm. Use Pythagoras theorem to find the perimeter of the rhombus (in cm).`,
      questionUr: `ایک معین کے وتر ${d1} سم اور ${d2} سم ہیں۔ مسئلہ فیثاغورث کی مدد سے اس کا احاطہ معلوم کریں۔`,
      correctAnswer: `${perimeter}`,
      acceptedAnswers: [`${perimeter}`, `${perimeter} cm`],
      shortExplanationEn: `Half diagonals are ${halfD1} cm and ${halfD2} cm, so side = √(${halfD1}² + ${halfD2}²) = ${side} cm, and Perimeter = 4 × ${side} = ${perimeter} cm.`,
      shortExplanationUr: `نصف وتر ${halfD1} اور ${halfD2} سم ہیں، ضلع = ${side} سم، لہٰذا احاطہ = 4 × ${side} = ${perimeter} سم۔`,
      detailedExplanationEn: `Diagonals of a rhombus bisect each other at 90°, creating 4 congruent right triangles with legs d₁/2 and d₂/2.`,
      detailedExplanationUr: `معین کے وتر ایک دوسرے کو 90° پر تنصیف کرتے ہیں، جس سے 4 قائمہ الزاویہ مثلث بنتی ہیں۔`,
      stepsEn: [
        `Half diagonals: d₁/2 = ${halfD1} cm, d₂/2 = ${halfD2} cm.`,
        `Side s = √(${halfD1}² + ${halfD2}²) = √${side * side} = ${side} cm.`,
        `Perimeter = 4 × ${side} = ${perimeter} cm.`,
      ],
      stepsUr: [
        `نصف وتر: ${halfD1} سم اور ${halfD2} سم۔`,
        `ضلع = √(${halfD1}² + ${halfD2}²) = ${side} سم۔`,
        `احاطہ = 4 × ${side} = ${perimeter} سم۔`,
      ],
      formulas: ['Side = √((d₁/2)² + (d₂/2)²)', 'Perimeter = 4 × side'],
      calculationSteps: [`${halfD1 * halfD1} + ${halfD2 * halfD2} = ${side * side}`, `side = ${side}`, `4 × ${side} = ${perimeter}`],
    };
  }

  // Hard Long: Circle Chord Length Theorem
  const [d, halfChord, r] = PYTH_TRIPLES[idx % PYTH_TRIPLES.length];
  const chord = 2 * halfChord;
  return {
    id,
    chapterId: 'geometry',
    type,
    difficulty,
    marks,
    topicEn: 'Circle Chord Theorem',
    topicUr: 'دائرے کے وتر کا مسئلہ',
    questionEn: `A circle has radius ${r} cm. A chord is at a perpendicular distance of ${d} cm from the center. Find the full length of the chord (in cm).`,
    questionUr: `ایک دائرے کا رداس ${r} سم ہے۔ مرکز سے ${d} سم کے عمودی فاصلے پر واقع وتر کی مکمل لمبائی معلوم کریں۔`,
    correctAnswer: `${chord}`,
    acceptedAnswers: [`${chord}`, `${chord} cm`],
    shortExplanationEn: `Half-chord = √(${r}² − ${d}²) = ${halfChord} cm, so full chord = 2 × ${halfChord} = ${chord} cm.`,
    shortExplanationUr: `نصف وتر = √(${r}² − ${d}²) = ${halfChord} سم، مکمل وتر = ${chord} سم۔`,
    detailedExplanationEn: `A perpendicular from the center bisects the chord. Apply Pythagoras theorem to the right triangle formed by radius, distance, and half-chord.`,
    detailedExplanationUr: `مرکز سے وتر پر عمود اس کی تنصیف کرتا ہے۔ مسئلہ فیثاغورث سے نصف وتر نکال کر دوگنا کریں۔`,
    stepsEn: [
      `(Half chord)² = r² − d² = ${r}² − ${d}² = ${r * r} − ${d * d} = ${halfChord * halfChord}.`,
      `Half chord = √${halfChord * halfChord} = ${halfChord} cm.`,
      `Full chord length = 2 × ${halfChord} = ${chord} cm.`,
    ],
    stepsUr: [
      `نصف وتر کا مربع = ${r}² − ${d}² = ${halfChord * halfChord}۔`,
      `نصف وتر = ${halfChord} سم۔`,
      `مکمل وتر = 2 × ${halfChord} = ${chord} سم۔`,
    ],
    formulas: ['(Chord / 2)² + d² = r²'],
    calculationSteps: [`${r * r} − ${d * d} = ${halfChord * halfChord}`, `half = ${halfChord}`, `2 × ${halfChord} = ${chord}`],
  };
}

// ---------- CHAPTER 5: STATISTICS & PROBABILITY ----------
function generateStatisticsQuestion(type: QuestionType, idx: number): MathQuestion {
  const difficulty = difficultyForIndex(idx);
  const id = `sta-${type === 'objective' ? 'obj' : 'lng'}-${idx + 1}`;
  const marks = type === 'objective' ? 2 : 5;

  if (type === 'objective') {
    if (difficulty === 'easy') {
      const sub = idx % 3;
      if (sub === 0) {
        const mean = 10 + (idx % 15);
        const nums = [mean - 4, mean - 1, mean, mean + 2, mean + 3];
        const sum = nums.reduce((a, b) => a + b, 0);
        return {
          id,
          chapterId: 'statistics',
          type,
          difficulty,
          marks,
          topicEn: 'Arithmetic Mean',
          topicUr: 'حسابی اوسط',
          questionEn: `Find the arithmetic mean of the numbers: ${nums.join(', ')}.`,
          questionUr: `درج ذیل اعداد کا حسابی اوسط معلوم کریں: ${nums.join('، ')}۔`,
          correctAnswer: `${mean}`,
          acceptedAnswers: [`${mean}`],
          shortExplanationEn: `Sum = ${sum}, count = 5, so Mean = ${sum} ÷ 5 = ${mean}.`,
          shortExplanationUr: `مجموعہ = ${sum}، تعداد = 5، پس اوسط = ${sum} ÷ 5 = ${mean}۔`,
          detailedExplanationEn: `Add all 5 observations and divide by 5.`,
          detailedExplanationUr: `تمام اعداد کو جمع کر کے 5 پر تقسیم کریں۔`,
          stepsEn: [`Sum = ${nums.join(' + ')} = ${sum}.`, `Mean = ${sum} ÷ 5 = ${mean}.`],
          stepsUr: [`مجموعہ = ${sum}۔`, `اوسط = ${sum} ÷ 5 = ${mean}۔`],
          formulas: ['Mean = ∑x / n'],
          calculationSteps: [`∑x = ${sum}`, `${sum} / 5 = ${mean}`],
        };
      }
      if (sub === 1) {
        const minVal = 4 + (idx % 10);
        const maxVal = minVal + 12 + (idx % 15);
        const data = [minVal + 5, maxVal, minVal, minVal + 8, maxVal - 3];
        const range = maxVal - minVal;
        return {
          id,
          chapterId: 'statistics',
          type,
          difficulty,
          marks,
          topicEn: 'Range',
          topicUr: 'وسعت',
          questionEn: `Find the range of the dataset: ${data.join(', ')}.`,
          questionUr: `مواد ${data.join('، ')} کی وسعت معلوم کریں۔`,
          correctAnswer: `${range}`,
          acceptedAnswers: [`${range}`],
          shortExplanationEn: `Range = Max (${maxVal}) − Min (${minVal}) = ${range}.`,
          shortExplanationUr: `وسعت = سب سے بڑی رقم (${maxVal}) − سب سے چھوٹی رقم (${minVal}) = ${range}۔`,
          detailedExplanationEn: `Identify the highest and lowest values in the dataset and subtract them.`,
          detailedExplanationUr: `سب سے بڑے عدد میں سے سب سے چھوٹا عدد تفریق کریں۔`,
          stepsEn: [`Max = ${maxVal}, Min = ${minVal}.`, `Range = ${maxVal} − ${minVal} = ${range}.`],
          stepsUr: [`بڑا عدد = ${maxVal}، چھوٹا عدد = ${minVal}۔`, `وسعت = ${range}۔`],
          formulas: ['Range = Maximum − Minimum'],
          calculationSteps: [`${maxVal} − ${minVal} = ${range}`],
        };
      }
      const red = 2 + (idx % 5);
      const blue = 3 + ((idx + 1) % 6);
      const total = red + blue;
      const [sn, sd] = simplifyFraction(red, total);
      return {
        id,
        chapterId: 'statistics',
        type,
        difficulty,
        marks,
        topicEn: 'Simple Probability',
        topicUr: 'سادہ احتمال',
        questionEn: `A bag contains ${red} red balls and ${blue} blue balls. One ball is drawn at random. Find the probability of getting a red ball (as a simplified fraction).`,
        questionUr: `ایک تھیلے میں ${red} سرخ اور ${blue} نیلی گیندیں ہیں۔ ایک گیند نکالنے پر سرخ گیند آنے کا احتمال (سادہ کسر میں) معلوم کریں۔`,
        correctAnswer: `${sn}/${sd}`,
        acceptedAnswers: [`${sn}/${sd}`, `${red}/${total}`],
        shortExplanationEn: `P(Red) = ${red} / ${total} = ${sn}/${sd}.`,
        shortExplanationUr: `سرخ گیند کا احتمال = ${red} / ${total} = ${sn}/${sd}۔`,
        detailedExplanationEn: `Divide the number of red balls (${red}) by the total number of balls (${total}) and simplify.`,
        detailedExplanationUr: `سرخ گیندوں کی تعداد کو کل گیندوں پر تقسیم کریں۔`,
        stepsEn: [`Total outcomes = ${red} + ${blue} = ${total}.`, `P(Red) = ${red}/${total} = ${sn}/${sd}.`],
        stepsUr: [`کل گیندیں = ${total}۔`, `احتمال = ${red}/${total} = ${sn}/${sd}۔`],
        formulas: ['P(E) = n(E) / n(S)'],
        calculationSteps: [`${red} + ${blue} = ${total}`, `${red}/${total} = ${sn}/${sd}`],
      };
    }

    if (difficulty === 'medium') {
      const sub = idx % 2;
      if (sub === 0) {
        const base = 10 + (idx % 12);
        const ordered = [base - 5, base - 3, base - 1, base + 2, base + 4, base + 7, base + 10];
        const shuffled = [ordered[4], ordered[1], ordered[6], ordered[3], ordered[0], ordered[5], ordered[2]];
        const median = ordered[3];
        return {
          id,
          chapterId: 'statistics',
          type,
          difficulty,
          marks,
          topicEn: 'Median',
          topicUr: 'وسطانیہ',
          questionEn: `Find the median of the observations: ${shuffled.join(', ')}.`,
          questionUr: `درج ذیل اعداد کا وسطانیہ معلوم کریں: ${shuffled.join('، ')}۔`,
          correctAnswer: `${median}`,
          acceptedAnswers: [`${median}`],
          shortExplanationEn: `Sorted: ${ordered.join(', ')}. The 4th (middle) value is ${median}.`,
          shortExplanationUr: `صعودی ترتیب: ${ordered.join('، ')}۔ درمیانی رقم = ${median}۔`,
          detailedExplanationEn: `First arrange the 7 numbers in ascending order. With n = 7, the median is the (7+1)/2 = 4th value.`,
          detailedExplanationUr: `پہلے اعداد کو چھوٹے سے بڑے کی ترتیب میں لکھیں۔ 7 اعداد میں چوتھا عدد وسطانیہ ہے۔`,
          stepsEn: [`Arrange ascending: ${ordered.join(', ')}.`, `Middle (4th) value = ${median}.`],
          stepsUr: [`ترتیب: ${ordered.join('، ')}۔`, `وسطانیہ = ${median}۔`],
          formulas: ['Median (odd n) = [(n + 1) / 2]ᵗʰ term'],
          calculationSteps: [`Position = (7 + 1)/2 = 4th`, `4th term = ${median}`],
        };
      }
      const mean = 14 + (idx % 10);
      const a = mean - 3;
      const b = mean + 1;
      const c = mean - 2;
      const d = mean + 5;
      const missing = 5 * mean - (a + b + c + d);
      return {
        id,
        chapterId: 'statistics',
        type,
        difficulty,
        marks,
        topicEn: 'Missing Observation from Mean',
        topicUr: 'اوسط سے گمشدہ رقم معلوم کرنا',
        questionEn: `The mean of five numbers ${a}, ${b}, ${c}, ${d}, and x is ${mean}. Find the value of x.`,
        questionUr: `پانچ اعداد ${a}, ${b}, ${c}, ${d} اور x کا اوسط ${mean} ہے۔ x کی قیمت معلوم کریں۔`,
        correctAnswer: `${missing}`,
        acceptedAnswers: [`${missing}`, `x=${missing}`, `x = ${missing}`],
        shortExplanationEn: `Total sum = 5 × ${mean} = ${5 * mean}. Sum of 4 numbers = ${a + b + c + d}, so x = ${missing}.`,
        shortExplanationUr: `پانچوں کا مجموعہ = ${5 * mean}، پس x = ${5 * mean} − ${a + b + c + d} = ${missing}۔`,
        detailedExplanationEn: `Multiply the mean by 5 to find the total sum, then subtract the sum of the four known numbers.`,
        detailedExplanationUr: `اوسط کو 5 سے ضرب دے کر کل مجموعہ نکالیں اور باقی چار اعداد کا مجموعہ تفریق کریں۔`,
        stepsEn: [`Total sum = 5 × ${mean} = ${5 * mean}.`, `Known sum = ${a + b + c + d}.`, `x = ${5 * mean} − ${a + b + c + d} = ${missing}.`],
        stepsUr: [`کل مجموعہ = ${5 * mean}۔`, `x = ${5 * mean} − ${a + b + c + d} = ${missing}۔`],
        formulas: ['∑x = Mean × n'],
        calculationSteps: [`5 × ${mean} = ${5 * mean}`, `${a}+${b}+${c}+${d} = ${a + b + c + d}`, `${5 * mean} − ${a + b + c + d} = ${missing}`],
      };
    }

    // Hard objective: Combined mean of two groups
    const n1 = 10;
    const n2 = 15;
    const m1 = 12 + (idx % 8);
    const m2 = m1 + 5;
    const totalSum = n1 * m1 + n2 * m2;
    const combined = totalSum / (n1 + n2); // (10*m1 + 15*(m1+5))/25 = m1 + 3
    return {
      id,
      chapterId: 'statistics',
      type,
      difficulty,
      marks,
      topicEn: 'Combined Mean',
      topicUr: 'مجموعی اوسط',
      questionEn: `The mean score of ${n1} boys is ${m1} and the mean score of ${n2} girls is ${m2}. Find the combined mean score of all ${n1 + n2} students.`,
      questionUr: `${n1} لڑکوں کے نمبروں کا اوسط ${m1} اور ${n2} لڑکیوں کا اوسط ${m2} ہے۔ تمام ${n1 + n2} طلبہ کا مجموعی اوسط معلوم کریں۔`,
      correctAnswer: `${combined}`,
      acceptedAnswers: [`${combined}`],
      shortExplanationEn: `Combined Mean = (${n1}×${m1} + ${n2}×${m2}) / ${n1 + n2} = ${totalSum} / 25 = ${combined}.`,
      shortExplanationUr: `مجموعی اوسط = ${totalSum} ÷ 25 = ${combined}۔`,
      detailedExplanationEn: `Find the total sum of each group separately, add them together, and divide by total students (${n1 + n2}).`,
      detailedExplanationUr: `دونوں گروپوں کا الگ الگ مجموعہ نکال کر جمع کریں اور کل تعداد ${n1 + n2} پر تقسیم کریں۔`,
      stepsEn: [
        `Sum of boys = ${n1} × ${m1} = ${n1 * m1}.`,
        `Sum of girls = ${n2} × ${m2} = ${n2 * m2}.`,
        `Combined Mean = (${n1 * m1} + ${n2 * m2}) ÷ ${n1 + n2} = ${totalSum} ÷ 25 = ${combined}.`,
      ],
      stepsUr: [
        `لڑکوں کا مجموعہ = ${n1 * m1}، لڑکیوں کا مجموعہ = ${n2 * m2}۔`,
        `مجموعی اوسط = ${totalSum} ÷ 25 = ${combined}۔`,
      ],
      formulas: ['Combined Mean = (n₁x̄₁ + n₂x̄₂) / (n₁ + n₂)'],
      calculationSteps: [`${n1 * m1} + ${n2 * m2} = ${totalSum}`, `${totalSum} / 25 = ${combined}`],
    };
  }

  // LONG QUESTIONS — Statistics & Probability
  if (difficulty === 'easy') {
    const part = 15 + (idx % 6) * 15;
    const total = 180;
    const angle = (part * 360) / total;
    return {
      id,
      chapterId: 'statistics',
      type,
      difficulty,
      marks,
      topicEn: 'Pie Chart Sector Angle',
      topicUr: 'پائی چارٹ کا مرکزی زاویہ',
      questionEn: `In a school survey of ${total} students, ${part} students chose Mathematics as their favourite subject. Calculate the central angle (in degrees) for Mathematics in a pie chart.`,
      questionUr: `${total} طلبہ کے سروے میں ${part} طلبہ نے ریاضی کو پسندیدہ مضمون قرار دیا۔ پائی چارٹ میں ریاضی کا مرکزی زاویہ معلوم کریں۔`,
      correctAnswer: `${angle}`,
      acceptedAnswers: [`${angle}`, `${angle}°`],
      shortExplanationEn: `Central Angle = (${part} / ${total}) × 360° = ${angle}°.`,
      shortExplanationUr: `مرکزی زاویہ = (${part} / ${total}) × 360° = ${angle}°۔`,
      detailedExplanationEn: `A full circle measures 360°. Multiply the fraction of students choosing Mathematics by 360°.`,
      detailedExplanationUr: `مکمل دائرہ 360° کا ہوتا ہے۔ مطلوبہ طلبہ کے تناسب کو 360° سے ضرب دیں۔`,
      stepsEn: [
        `Fraction of students = ${part} / ${total}.`,
        `Central Angle = (${part} / ${total}) × 360° = ${part} × 2° = ${angle}°.`,
      ],
      stepsUr: [
        `مرکزی زاویہ = (${part} / ${total}) × 360° = ${angle}°۔`,
      ],
      formulas: ['Central Angle = (Component / Total) × 360°'],
      calculationSteps: [`360 / ${total} = 2`, `${part} × 2 = ${angle}`],
    };
  }

  if (difficulty === 'medium') {
    const x1 = 4 + (idx % 3);
    const x2 = x1 + 2;
    const x3 = x1 + 4;
    const f1 = 2;
    const f2 = 4;
    const f3 = 2;
    const sumF = f1 + f2 + f3;
    const sumFX = f1 * x1 + f2 * x2 + f3 * x3;
    const mean = sumFX / sumF; // symmetric around x2 => exact integer x2!
    return {
      id,
      chapterId: 'statistics',
      type,
      difficulty,
      marks,
      topicEn: 'Frequency Distribution Mean',
      topicUr: 'تعددی جدول کا اوسط',
      questionEn: `Find the mean of the frequency table: values x = (${x1}, ${x2}, ${x3}) with corresponding frequencies f = (${f1}, ${f2}, ${f3}).`,
      questionUr: `تعددی جدول کا حسابی اوسط معلوم کریں جہاں قدریں x = (${x1}, ${x2}, ${x3}) اور تعدد f = (${f1}, ${f2}, ${f3}) ہیں۔`,
      correctAnswer: `${mean}`,
      acceptedAnswers: [`${mean}`],
      shortExplanationEn: `∑fx = ${f1}(${x1}) + ${f2}(${x2}) + ${f3}(${x3}) = ${sumFX}, ∑f = ${sumF}, so Mean = ${sumFX}/${sumF} = ${mean}.`,
      shortExplanationUr: `∑fx = ${sumFX} اور ∑f = ${sumF}، لہٰذا اوسط = ${mean}۔`,
      detailedExplanationEn: `Multiply each value x by its frequency f, sum all fx products, and divide by the sum of frequencies ∑f.`,
      detailedExplanationUr: `ہر قدر x کو اس کے تعدد f سے ضرب دے کر جمع کریں اور کل تعدد ∑f پر تقسیم کریں۔`,
      stepsEn: [
        `f·x values: ${f1}×${x1}=${f1 * x1}, ${f2}×${x2}=${f2 * x2}, ${f3}×${x3}=${f3 * x3}.`,
        `∑fx = ${sumFX}, ∑f = ${sumF}.`,
        `Mean = ∑fx / ∑f = ${sumFX} ÷ ${sumF} = ${mean}.`,
      ],
      stepsUr: [
        `∑fx = ${f1 * x1} + ${f2 * x2} + ${f3 * x3} = ${sumFX}۔`,
        `∑f = ${sumF}۔`,
        `اوسط = ${sumFX} ÷ ${sumF} = ${mean}۔`,
      ],
      formulas: ['Mean = ∑(f · x) / ∑f'],
      calculationSteps: [`∑fx = ${sumFX}`, `∑f = ${sumF}`, `${sumFX} / ${sumF} = ${mean}`],
    };
  }

  // Hard Long: Missing frequency p when mean is known
  const xVals = [5, 10, 15, 20];
  const f1 = 2;
  const f2 = 4;
  const f3 = 3 + (idx % 5); // missing p!
  const f4 = 3;
  // Let's pick p so mean is exact or clean: wait, let's build mean = 13 or 12
  // Mean = (2*5 + 4*10 + p*15 + 3*20) / (2+4+p+3) = (110 + 15p) / (9 + p)
  // If we set mean = 13: 117 + 13p = 110 + 15p => 2p = 7 (not integer).
  // Set f1=2, f2=3, f4=4 => sum known fx = 10 + 30 + 80 = 120, known f = 9.
  // Mean = (120 + 15p)/(9 + p). Wait: if mean = 14 => 126 + 14p = 120 + 15p => p = 6!
  // Let's generalize: k = 1 + (idx % 6), f1 = 2*k, f2 = 3*k, f4 = 4*k => known sum fx = 120*k, known f = 9*k => p = 6*k gives exact mean = 14!
  const k = 1 + (idx % 6);
  const a1 = 2 * k;
  const a2 = 3 * k;
  const a4 = 4 * k;
  const pSol = 6 * k;
  const meanGiven = 14;
  return {
    id,
    chapterId: 'statistics',
    type,
    difficulty,
    marks,
    topicEn: 'Missing Frequency Problem',
    topicUr: 'گمشدہ تعدد معلوم کرنا',
    questionEn: `If the mean of the frequency distribution x = (${xVals.join(', ')}) with frequencies f = (${a1}, ${a2}, p, ${a4}) is ${meanGiven}, find the missing frequency p.`,
    questionUr: `اگر تعددی جدول x = (${xVals.join(', ')}) اور تعدد f = (${a1}, ${a2}, p, ${a4}) کا اوسط ${meanGiven} ہو تو گمشدہ تعدد p معلوم کریں۔`,
    correctAnswer: `${pSol}`,
    acceptedAnswers: [`${pSol}`, `p=${pSol}`, `p = ${pSol}`],
    shortExplanationEn: `(${120 * k} + 15p) / (${9 * k} + p) = 14 ⇒ ${126 * k} + 14p = ${120 * k} + 15p ⇒ p = ${pSol}.`,
    shortExplanationUr: `مساوات (${120 * k} + 15p) / (${9 * k} + p) = 14 حل کرنے سے p = ${pSol} حاصل ہوتا ہے۔`,
    detailedExplanationEn: `Set up the grouped mean equation ∑fx / ∑f = ${meanGiven}, cross-multiply, and solve the resulting linear equation for p.`,
    detailedExplanationUr: `گروہی اوسط کے فارمولے ∑fx / ∑f = ${meanGiven} میں قدریں درج کر کے p کے لیے حل کریں۔`,
    stepsEn: [
      `∑fx = ${a1}(5) + ${a2}(10) + p(15) + ${a4}(20) = ${120 * k} + 15p.`,
      `∑f = ${a1} + ${a2} + p + ${a4} = ${9 * k} + p.`,
      `(${120 * k} + 15p) / (${9 * k} + p) = 14 ⇒ ${120 * k} + 15p = ${126 * k} + 14p.`,
      `15p − 14p = ${126 * k} − ${120 * k} ⇒ p = ${pSol}.`,
    ],
    stepsUr: [
      `∑fx = ${120 * k} + 15p اور ∑f = ${9 * k} + p۔`,
      `چلیپا ضرب سے: ${120 * k} + 15p = ${126 * k} + 14p۔`,
      `p = ${pSol}۔`,
    ],
    formulas: ['Mean = ∑(f · x) / ∑f'],
    calculationSteps: [`∑fx = ${120 * k} + 15p`, `14 × ${9 * k} = ${126 * k}`, `${126 * k} − ${120 * k} = ${pSol}`],
  };
}

// ---------- PUBLIC QUESTION BANK ACCESS ----------
const CACHE: Record<string, MathQuestion[]> = {};

export function getChapterQuestions(chapterId: ChapterId, type: QuestionType): MathQuestion[] {
  const key = `${chapterId}:${type}`;
  if (CACHE[key]) return CACHE[key];

  const list: MathQuestion[] = [];
  for (let i = 0; i < 100; i++) {
    switch (chapterId) {
      case 'numbers':
        list.push(generateNumbersQuestion(type, i));
        break;
      case 'algebra':
        list.push(generateAlgebraQuestion(type, i));
        break;
      case 'measurement':
        list.push(generateMeasurementQuestion(type, i));
        break;
      case 'geometry':
        list.push(generateGeometryQuestion(type, i));
        break;
      case 'statistics':
        list.push(generateStatisticsQuestion(type, i));
        break;
    }
  }
  CACHE[key] = list;
  return list;
}

export function getCombinedQuestions(
  type: QuestionType,
  count: number,
  difficulty: Difficulty | 'all' = 'all'
): MathQuestion[] {
  const chapters: ChapterId[] = ['numbers', 'algebra', 'measurement', 'geometry', 'statistics'];
  const pools = chapters.map((ch) => {
    const all = getChapterQuestions(ch, type);
    return difficulty === 'all' ? all : all.filter((q) => q.difficulty === difficulty);
  });

  const result: MathQuestion[] = [];
  let round = 0;
  while (result.length < count) {
    let addedInRound = false;
    for (const pool of pools) {
      if (result.length >= count) break;
      if (round < pool.length) {
        result.push(pool[round]);
        addedInRound = true;
      }
    }
    if (!addedInRound) break;
    round++;
  }
  return result;
}

export function getAllQuestionsFlat(): MathQuestion[] {
  const chapters: ChapterId[] = ['numbers', 'algebra', 'measurement', 'geometry', 'statistics'];
  const all: MathQuestion[] = [];
  for (const ch of chapters) {
    all.push(...getChapterQuestions(ch, 'objective'));
    all.push(...getChapterQuestions(ch, 'long'));
  }
  return all;
}

export function getQuestionById(id: string): MathQuestion | undefined {
  return getAllQuestionsFlat().find((q) => q.id === id);
}

// Smart answer evaluator supporting units, "x =", fractions/decimals, and spacing
export function checkStudentAnswer(rawInput: string, question: MathQuestion): boolean {
  const clean = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/^x\s*=\s*/i, '')
      .replace(/^p\s*=\s*/i, '')
      .replace(/^rs\.?\s*/i, '')
      .replace(/(cm²|cm2|cm³|cm3|cm|m²|m2|m³|m3|m|days|sides|cubes|°|degrees?)/gi, '')
      .replace(/\s+/g, '');

  const normalizedInput = clean(rawInput);
  if (!normalizedInput) return false;

  for (const acc of question.acceptedAnswers) {
    if (clean(acc) === normalizedInput) return true;
  }

  // Numeric & fraction equivalence check
  const parseNum = (s: string): number | null => {
    const fracMatch = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (fracMatch) {
      const den = Number(fracMatch[2]);
      if (den === 0) return null;
      return Number(fracMatch[1]) / den;
    }
    const n = Number(s.replace(/%$/, ''));
    return Number.isFinite(n) ? n : null;
  };

  const userNum = parseNum(normalizedInput);
  const targetNum = parseNum(clean(question.correctAnswer));
  if (userNum !== null && targetNum !== null) {
    return Math.abs(userNum - targetNum) < 1e-4;
  }

  return false;
}
