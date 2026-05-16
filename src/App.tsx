/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  RefreshCcw, 
  ArrowRight,
  X,
  Zap,
  BookOpen,
  Video
} from 'lucide-react';

// --- Types ---

interface QuizQuestion {
  id: number;
  expression: string;
  answer: string; // The single exponent form, e.g., "2^5"
  hint: string;
  base: string;
  steps: string[];
  teacherNote?: string;
}

// --- Components ---

const Header = () => (
  <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
    <div>
      <h1 className="text-4xl font-black tracking-tight text-indigo-900">
        EXPONENT <span className="text-indigo-500">EXPLORER</span>
      </h1>
      <p className="text-slate-500 font-medium italic">Rules of Exponents Module • Santa Ana College</p>
    </div>
    <div className="flex gap-2">
    </div>
  </header>
);

const CardHeader = ({ title, colorClass = "bg-indigo-500" }: { title: string, colorClass?: string }) => (
  <div className="flex items-center gap-2 mb-6">
    <span className={`w-2 h-6 ${colorClass} rounded-full`}></span>
    <h2 className="text-lg font-bold text-slate-800 tracking-tight text-left">{title}</h2>
  </div>
);

const MathText = ({ text, className = "" }: { text: string; className?: string }) => {
  // Support both standard ^5 and braced ^{5+2} notation
  const parts = text.split(/(\^\{[^\}]+\}|\^[\d\w\(\)\+-]+)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('^')) {
          let exponent = part.slice(1);
          // Remove braces if they exist
          if (exponent.startsWith('{') && exponent.endsWith('}')) {
            exponent = exponent.slice(1, -1);
          }
          return <sup key={i} className="text-[0.6em] font-black">{exponent}</sup>;
        }
        return part;
      })}
    </span>
  );
};

export default function App() {
  const [base, setBase] = useState(2);
  const [exponent, setExponent] = useState(3);
  const [activeTab, setActiveTab] = useState<'basics' | 'rules' | 'advanced' | 'practice'>('basics');
  
  // Rule Discovery States
  const [ruleType, setRuleType] = useState<'product' | 'quotient' | 'power' | 'zero'>('product');
  const [exampleIndex, setExampleIndex] = useState(0);
  
  // Advanced State
  const [advancedStep, setAdvancedStep] = useState(0);
  const [advancedCaseIndex, setAdvancedCaseIndex] = useState(0);

  const advancedCases = [
    {
      title: "Mixed Mix-Up",
      expression: "2^5 \u2022 4 / 16",
      unifiedExpression: "2^5 \u2022 2^2 / 2^4",
      initialBases: [4, 16],
      targetBases: ["2^2", "2^4"],
      explanation: "We convert 4 and 16 into powers of 2 so they match 2^5.",
      steps: [
        { label: "Product Rule (Top)", result: "2^{5+2} = 2^7" },
        { label: "Quotient Rule", result: "2^{7-4} = 2^3" }
      ],
      final: "2^3"
    },
    {
      title: "Triple Threat",
      expression: "3^4 \u2022 9 / 27",
      unifiedExpression: "3^4 \u2022 3^2 / 3^3",
      initialBases: [9, 27],
      targetBases: ["3^2", "3^3"],
      explanation: "Rewrite 9 as 3^2 and 27 as 3^3 to unify the bases.",
      steps: [
        { label: "Product Rule (Top)", result: "3^{4+2} = 3^6" },
        { label: "Quotient Rule", result: "3^{6-3} = 3^3" }
      ],
      final: "3^3"
    },
    {
      title: "Triple Five",
      expression: "125 \u2022 25 / 5^5",
      unifiedExpression: "5^3 \u2022 5^2 / 5^5",
      initialBases: [125, 25],
      targetBases: ["5^3", "5^2"],
      explanation: "Convert 125 and 25 into powers of 5 to match the denominator.",
      steps: [
        { label: "Product Rule (Top)", result: "5^{3+2} = 5^5" },
        { label: "Quotient Rule", result: "5^{5-5} = 5^0 = 1" }
      ],
      final: "1"
    }
  ];
  
  // Reset example index when rule type changes
  const handleRuleChange = (type: 'product' | 'quotient' | 'power' | 'zero') => {
    setRuleType(type);
    setExampleIndex(0);
  };

  // Video State
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState(false);
  const VIDEO_ID = "7Rv1nwHQU0U";
  const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?enablejsapi=1&rel=0`;
  
  // Practice States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [score, setScore] = useState(0);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      expression: "2^3 \u00b7 2^4",
      answer: "2^7",
      base: "2",
      hint: "Bases are the same! What do we do with exponents when multiplying?",
      steps: ["(2 \u00b7 2 \u00b7 2) \u00b7 (2 \u00b7 2 \u00b7 2 \u00b7 2)", "Count them up: 3 + 4 = 7", "Result: 2^7"],
      teacherNote: "Remind students that we add the exponents because we are counting the total factors."
    },
    {
      id: 2,
      expression: "(3^2)^4",
      answer: "3^8",
      base: "3",
      hint: "A power raised to another power. Multiply the exponents!",
      steps: ["(3^2) \u00b7 (3^2) \u00b7 (3^2) \u00b7 (3^2)", "Each (3^2) is 3 \u00b7 3", "Total 3s: 2 \u00b7 4 = 8", "Result: 3^8"],
      teacherNote: "This is 'groups of groups'. Encourage them to see the 4 groups of two 3s."
    },
    {
      id: 3,
      expression: "5^7 / 5^3",
      answer: "5^4",
      base: "5",
      hint: "Division means some factors will cancel out. Subtract the exponents!",
      steps: ["(5 \u00b7 5 \u00b7 5 \u00b7 5 \u00b7 5 \u00b7 5 \u00b7 5) / (5 \u00b7 5 \u00b7 5)", "Cancel 3 from the top and bottom", "Leftover: 7 - 3 = 4", "Result: 5^4"],
      teacherNote: "Tell students that division 'removes' factors, which is why we subtract numbers."
    },
    {
      id: 4,
      expression: "2^3 \u00b7 5^3",
      answer: "10^3",
      base: "10",
      hint: "Bases are different but exponents are the same! (2 \u00b7 5)^3",
      steps: ["(2 \u00b7 2 \u00b7 2) \u00b7 (5 \u00b7 5 \u00b7 5)", "Group them: (2 \u00b7 5) \u00b7 (2 \u00b7 5) \u00b7 (2 \u00b7 5)", "That's 10 \u00b7 10 \u00b7 10", "Result: 10^3"],
      teacherNote: "A tricky one! We can group the bases if the exponents match."
    },
    {
      id: 5,
      expression: "x^0",
      answer: "1",
      base: "n/a",
      hint: "Anything (except zero) to the zero power is...",
      steps: ["Think of the pattern: x^3/x^3 = 1", "Rules say x^3/x^3 = x^(3-3) = x^0", "So x^0 must be 1"],
      teacherNote: "The Zero Rule is a favorite! Remind them it follows the pattern of division."
    },
    {
      id: 6,
      expression: "(x^3)^2",
      answer: "x^6",
      base: "x",
      hint: "Multiply those exponents! (3 \u00d7 2)",
      steps: ["(x^3) \u00b7 (x^3)", "Each x^3 is x \u00b7 x \u00b7 x", "Total x's: 3 + 3 = 6", "Result: x^6"],
      teacherNote: "Variables work exactly like numbers. The rule doesn't change!"
    },
    {
      id: 7,
      expression: "10^5 / 10^2",
      answer: "10^3",
      base: "10",
      hint: "Subtract the bottom exponent from the top one.",
      steps: ["10 \u00b7 10 \u00b7 10 \u00b7 10 \u00b7 10 / 10 \u00b7 10", "Cancel 2 from top and bottom", "Leftover: 5 - 2 = 3", "Result: 10^3"],
      teacherNote: "Large bases like 10 might look scary, but they follow the same subtraction rule."
    },
    {
      id: 8,
      expression: "a^4 \u00b7 a^3",
      answer: "a^7",
      base: "a",
      hint: "Same base! Add the exponents together.",
      steps: ["a \u00b7 a \u00b7 a \u00b7 a \u00b7 a \u00b7 a \u00b7 a", "4 + 3 = 7", "Result: a^7"],
      teacherNote: "Make sure they aren't multiplying the base 'a' by itself 7 times manually."
    },
    {
      id: 9,
      expression: "(2^5)^2",
      answer: "2^10",
      base: "2",
      hint: "Two groups of five 2s.",
      steps: ["2^5 \u00b7 2^5", "Each group has five 2s", "Total 2s: 5 \u00d7 2 = 10", "Result: 2^10"],
      teacherNote: "Double power! Remind them to multiply 5 and 2."
    },
    {
      id: 10,
      expression: "y^1 \u00b7 y^4",
      answer: "y^5",
      base: "y",
      hint: "Don't forget: y is the same as y to the power of 1!",
      steps: ["y \u00b7 (y \u00b7 y \u00b7 y \u00b7 y)", "Count them: 1 + 4 = 5", "Result: y^5"],
      teacherNote: "Students often forget the 'invisible' 1 on single variables."
    },
    {
      id: 11,
      expression: "(3^4)^0",
      answer: "1",
      base: "3",
      hint: "Look at that outer exponent. Zero power rule!",
      steps: ["(3 \u00b7 3 \u00b7 3 \u00b7 3)^0", "Anything to the zero power is 1", "Result: 1"],
      teacherNote: "The inner power doesn't matter if the outer one is zero!"
    },
    {
      id: 12,
      expression: "x^5 / x^5",
      answer: "1",
      base: "x",
      hint: "Dividing something by itself always equals...",
      steps: ["x^5 / x^5 = x^(5-5)", "x^0 = 1", "Result: 1"],
      teacherNote: "Another look at the Zero Rule in action."
    },
    {
      id: 13,
      expression: "2^2 \u00b7 2^2 \u00b7 2^2",
      answer: "2^6",
      base: "2",
      hint: "Bases are all 2. Add ALL the exponents up!",
      steps: ["(2^2) \u00b7 (2^2) \u00b7 (2^2)", "Add them: 2 + 2 + 2 = 6", "Result: 2^6"],
      teacherNote: "The Product Rule works for more than just two items!"
    },
    {
      id: 14,
      expression: "(x^10)^3",
      answer: "x^30",
      base: "x",
      hint: "Power of a Power! 10 \u00d7 3.",
      steps: ["x^10 \u00b7 x^10 \u00b7 x^10", "Multiply exponents: 10 \u00d7 3 = 30", "Result: x^30"],
      teacherNote: "Large exponents are just as easy to multiply."
    },
    {
      id: 15,
      expression: "5^10 / 5^9",
      answer: "5^1",
      base: "5",
      hint: "Ten factors on top, nine on bottom. How many left?",
      steps: ["5^10 / 5^9 = 5^(10-9)", "10 - 9 = 1", "Result: 5^1"],
      teacherNote: "5^1 is the same as just 5. Remind them of both forms!",
    },
    {
      id: 16,
      expression: "2^5 \u00b7 4",
      answer: "2^7",
      base: "2",
      hint: "Rewrite 4 as 2 to a power!",
      steps: ["4 is 2^2", "So expression is 2^5 \u00b7 2^2", "5 + 2 = 7", "Result: 2^7"],
      teacherNote: "This is the first base conversion challenge. Help them see 4 as 2^2."
    },
    {
      id: 17,
      expression: "8 / 2^2",
      answer: "2^1",
      base: "2",
      hint: "What power of 2 is equal to 8?",
      steps: ["8 is 2^3", "So expression is 2^3 / 2^2", "3 - 2 = 1", "Result: 2^1"],
      teacherNote: "8 is 2 \u00b7 2 \u00b7 2, which is 2^3."
    },
    {
      id: 18,
      expression: "x^5 \u00b7 x^2 / x^3",
      answer: "x^4",
      base: "x",
      hint: "Do the top part first (Product Rule), then Divide (Quotient Rule).",
      steps: ["Top: x^5 \u00b7 x^2 = x^7", "Now: x^7 / x^3", "7 - 3 = 4", "Result: x^4"],
      teacherNote: "Order of operations! Simplify the numerator first."
    },
    {
      id: 19,
      expression: "(2^3)^2 / 2^4",
      answer: "2^2",
      base: "2",
      hint: "Simplify the power of a power first!",
      steps: ["Top: (2^3)^2 = 2^6", "Now: 2^6 / 2^4", "6 - 4 = 2", "Result: 2^2"],
      teacherNote: "Two rules in one problem! Power rule then Quotient rule."
    },
    {
      id: 20,
      expression: "2^3 \u00b7 4 / 2^5",
      answer: "1",
      base: "2",
      hint: "Convert 4 to 2^2, combine the top, then divide.",
      steps: ["4 is 2^2", "Top: 2^3 \u00b7 2^2 = 2^5", "Now: 2^5 / 2^5", "Anything divided by itself is 1", "Result: 1"],
      teacherNote: "A grand finale! Base conversion, product rule, and the zero/cancellation rule."
    },
    {
      id: 21,
      expression: "9 \u00b7 3^5",
      answer: "3^7",
      base: "3",
      hint: "Rewrite 9 as a power of 3 first!",
      steps: ["9 is 3^2", "3^2 \u00b7 3^5 = 3^(2+5)", "Result: 3^7"],
      teacherNote: "Watch for hidden matchable bases like 9 and 3."
    },
    {
      id: 22,
      expression: "(16 / 2^3) \u00b7 2 \u00b7 32",
      answer: "2^7",
      base: "2",
      hint: "Convert 16 and 32 into powers of 2 first.",
      steps: ["16/2^3 = 2^4/2^3 = 2^1", "Now: 2^1 \u00b7 2^1 \u00b7 2^5", "1 + 1 + 5 = 7", "Result: 2^7"],
      teacherNote: "Complex string! Solve the division group first, then the multiplication."
    },
    {
      id: 23,
      expression: "5^3 / 125",
      answer: "1",
      base: "5",
      hint: "Think about powers of 5. What is 5 \u00d7 5 \u00d7 5?",
      steps: ["125 is 5^3", "5^3 / 5^3 = 1", "Result: 1"],
      teacherNote: "125 is a common cubic factor (5^3)."
    },
    {
      id: 24,
      expression: "9 \u00b7 6 \u00b7 2^2",
      answer: "6^3",
      base: "6",
      hint: "Try to group bases that make 6. 9 is 3^2, 6 is 2^1 \u00b7 3^1.",
      steps: ["9 is 3^2", "So: 3^2 \u00b7 (2 \u00b7 3) \u00b7 2^2", "Group them: (3^2 \u00b7 3^1) \u00b7 (2^1 \u00b7 2^2)", "3^3 \u00b7 2^3", "Result: 6^3"],
      teacherNote: "Combining different bases into a product! (a^n \u00b7 b^n = (ab)^n)"
    }
  ];

  const value = useMemo(() => Math.pow(base, exponent), [base, exponent]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setQuizStatus('idle');
    } else {
      alert(`Quiz complete! Your score: ${score}/${questions.length}`);
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswer('');
      setQuizStatus('idle');
    }
  };

  const checkAnswer = () => {
    const cleanAnswer = userAnswer.replace(/\s/g, '').toLowerCase();
    const correctAnswer = questions[currentQuestionIndex].answer.toLowerCase();
    
    if (cleanAnswer === correctAnswer) {
      setQuizStatus('correct');
      setScore(prev => prev + 1);
    } else {
      setQuizStatus('wrong');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Header />

        {/* Global Navigation */}
        <div className="flex bg-white/80 backdrop-blur p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-10 w-fit overflow-x-auto max-w-full">
          {(['basics', 'rules', 'advanced', 'practice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-indigo-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'basics' && (
            <motion.div
              key="basics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-5"
            >
              {/* Controls Card */}
              <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm h-fit">
                <CardHeader title="Variable Controls" colorClass="bg-rose-500" />
                
                <div className="space-y-10">
                  <div>
                    <label className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Value</span>
                      <span className="text-3xl font-black text-indigo-900 tracking-tighter">{base}</span>
                    </label>
                    <input 
                      type="range" min="1" max="10" step="1" 
                      value={base} 
                      onChange={(e) => setBase(Number(e.target.value))}
                      className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exponent Value</span>
                      <span className="text-3xl font-black text-rose-500 tracking-tighter">{exponent}</span>
                    </label>
                    <input 
                      type="range" min="0" max="6" step="1" 
                      value={exponent} 
                      onChange={(e) => setExponent(Number(e.target.value))}
                      className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-500 border border-slate-200"
                    />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 italic text-slate-400 text-xs leading-relaxed">
                  "Exponents show repeated multiplication of the same number."
                </div>
              </div>

              {/* Visualizer Card */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <CardHeader title="Visual Expansion" colorClass="bg-indigo-500" />
                  <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                    <span className="text-3xl font-black">{base}</span>
                    <span className="text-lg font-black text-rose-400 mt-[-10px]">{exponent}</span>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-10">
                  {exponent === 0 ? (
                    <div className="text-center">
                       <div className="text-8xl font-black text-slate-900 tracking-tighter mb-4">1</div>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Zero Exponent Identity</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {Array.from({ length: exponent }).map((_, i) => (
                          <motion.div 
                            key={i}
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center bg-white shadow-xl rounded-2xl border-2 border-indigo-100">
                              <span className="text-3xl font-black text-indigo-900">{base}</span>
                              <span className="text-[8px] font-bold text-slate-300 uppercase">Factor {i+1}</span>
                            </div>
                            {i < exponent - 1 && (
                              <X className="w-5 h-5 mx-3 text-slate-300" />
                            )}
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-indigo-900 rounded-2xl p-6 text-white text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Total Result</p>
                        <motion.div 
                          key={value}
                          initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                          className="text-6xl font-black tracking-tighter"
                        >
                          {value.toLocaleString()}
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Rules List (The Rule Book) */}
              <div className="col-span-12 md:col-span-4 bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative min-h-[500px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-800 rounded-full -mr-24 -mt-24 opacity-30"></div>
                
                <div>
                  <h2 className="text-2xl font-black tracking-tight mb-10 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                    RULE BOOK
                  </h2>
                  <div className="space-y-8">
                    {[
                      { id: 'product', label: 'Product Rule', formula: 'xᵃ · xᵇ = xᵃ⁺ᵇ', color: 'border-white/40' },
                      { id: 'quotient', label: 'Quotient Rule', formula: 'xᵃ / xᵇ = xᵃ⁻ᵇ', color: 'border-rose-400' },
                      { id: 'power', label: 'Power of Power', formula: '(xᵃ)ᵇ = xᵃ·ᵇ', color: 'border-amber-400' },
                      { id: 'zero', label: 'Zero Rule', formula: 'x⁰ = 1', color: 'border-emerald-400' }
                    ].map((rule) => (
                      <button
                        key={rule.id}
                        onClick={() => handleRuleChange(rule.id as any)}
                        className={`text-left w-full border-l-4 pl-6 py-2 transition-all group ${
                          ruleType === rule.id ? rule.color : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">{rule.label}</p>
                        <p className="text-xl font-mono tracking-tighter group-hover:translate-x-1 transition-transform">{rule.formula}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-12 bg-indigo-800/50 p-5 rounded-2xl border border-indigo-700/50">
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    Pro Tip: Click the rules above to see why they work mathematically!
                  </p>
                </div>
              </div>

              {/* Rule Visual Proof */}
              <div className="col-span-12 md:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-10 shadow-sm flex flex-col min-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${ruleType}-${exampleIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                            {ruleType === 'product' ? 'Product Analysis' : 
                             ruleType === 'quotient' ? 'Quotient Analysis' : 
                             ruleType === 'power' ? 'Power Analysis' : 'Zero Rule Analysis'}
                          </h3>
                          <Zap className="w-8 h-8 text-indigo-100" />
                        </div>
                        <div className="h-1.5 w-20 bg-indigo-600 rounded-full"></div>
                      </div>

                      {/* Example Toggles */}
                      <div className="flex bg-slate-100 p-1 rounded-xl h-fit">
                        {[0, 1].map((idx) => (
                          <button
                            key={idx}
                            onClick={() => setExampleIndex(idx)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                              exampleIndex === idx 
                              ? 'bg-white text-indigo-600 shadow-sm' 
                              : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            Ex {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 p-8 flex-grow">
                      {ruleType === 'product' && (
                        <div className="space-y-8">
                          <p className="text-slate-600 font-bold leading-relaxed first-letter:uppercase">
                            {exampleIndex === 0 
                              ? "When multiplying powers with the same base, we basically just add all their factors together into one big group."
                              : "This works for any base! If we have groups of 3s, we just count up the total number of 3s being multiplied."}
                          </p>
                          <div className="flex flex-col items-center gap-6">
                            <div className="flex items-center gap-4 text-3xl font-black text-slate-400">
                               <div className="bg-white px-4 py-3 border-2 border-indigo-200 rounded-2xl text-indigo-900 shadow-sm">{exampleIndex === 0 ? '2' : '3'}<sup>{exampleIndex === 0 ? '3' : '2'}</sup></div>
                               <span>{'\u2022'}</span>
                               <div className="bg-white px-4 py-3 border-2 border-indigo-200 rounded-2xl text-indigo-900 shadow-sm">{exampleIndex === 0 ? '2' : '3'}<sup>{exampleIndex === 0 ? '2' : '4'}</sup></div>
                            </div>
                            <ArrowRight className="w-8 h-8 text-slate-300" />
                            <div className="flex flex-wrap justify-center gap-2 font-mono">
                               {[...Array(exampleIndex === 0 ? 3 : 2)].map((_,i) => (
                                 <motion.span 
                                   key={`p1-${i}`}
                                   initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                                   className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-lg text-sm"
                                 >
                                   {exampleIndex === 0 ? '2' : '3'}
                                 </motion.span>
                               ))}
                               <span className="text-slate-300 flex items-center px-1 font-black">+</span>
                               {[...Array(exampleIndex === 0 ? 2 : 4)].map((_,i) => (
                                 <motion.span 
                                   key={`p2-${i}`}
                                   initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: (i + 3) * 0.05 }}
                                   className="w-10 h-10 bg-rose-500 text-white flex items-center justify-center rounded-lg shadow-lg text-sm"
                                 >
                                   {exampleIndex === 0 ? '2' : '3'}
                                 </motion.span>
                               ))}
                            </div>
                            <p className="text-sm font-black text-indigo-900 bg-indigo-50 px-6 py-2 rounded-full border border-indigo-100 text-center">
                              Result: {exampleIndex === 0 ? '2' : '3'}<sup>{exampleIndex === 0 ? '3 + 2' : '2 + 4'}</sup> = {exampleIndex === 0 ? '2' : '3'}<sup>{exampleIndex === 0 ? '5' : '6'}</sup>
                            </p>
                          </div>
                        </div>
                      )}

                      {ruleType === 'quotient' && (
                        <div className="space-y-8">
                          <p className="text-slate-600 font-bold leading-relaxed first-letter:uppercase">
                            {exampleIndex === 0 
                              ? "Division is the opposite of multiplication! Every factor on the bottom \"cancels out\" one factor on the top."
                              : "This even works with variables like 'x'. We just look at how many factors are left after the matching ones cancel out."}
                          </p>
                          <div className="flex flex-col items-center gap-6">
                            {/* Expression Header */}
                            <div className="flex items-center gap-4 text-3xl font-black text-slate-400 mb-4">
                               <div className="bg-white px-6 py-4 border-2 border-rose-200 rounded-2xl text-rose-600 shadow-sm flex flex-col items-center">
                                 <span>{exampleIndex === 0 ? '2' : 'x'}<sup>{exampleIndex === 0 ? '5' : '6'}</sup></span>
                                 <div className="w-full h-0.5 bg-rose-200 my-1"></div>
                                 <span>{exampleIndex === 0 ? '2' : 'x'}<sup>{exampleIndex === 0 ? '3' : '2'}</sup></span>
                               </div>
                            </div>

                            <div className="flex flex-col items-center">
                              <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {[...Array(exampleIndex === 0 ? 5 : 6)].map((_, i) => (
                                  <motion.span 
                                    key={`q1-${i}`}
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-black transition-all relative ${
                                      i >= (exampleIndex === 0 ? 2 : 4) 
                                      ? 'bg-slate-50 border-slate-200 text-slate-300' 
                                      : 'bg-rose-500 border-rose-600 text-white shadow-lg'
                                    }`}
                                  >
                                    {exampleIndex === 0 ? '2' : 'x'}
                                    {i >= (exampleIndex === 0 ? 2 : 4) && (
                                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="absolute h-1 bg-slate-400 rotate-45 rounded-full" />
                                    )}
                                  </motion.span>
                                ))}
                              </div>
                              <div className="w-full max-w-sm h-1 bg-slate-200 rounded-full my-4"></div>
                              <div className="flex flex-wrap justify-center gap-2 mt-4">
                                {[...Array(exampleIndex === 0 ? 3 : 2)].map((_, i) => (
                                  <motion.span 
                                    key={`q2-${i}`}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-300 font-black relative"
                                  >
                                    {exampleIndex === 0 ? '2' : 'x'}
                                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="absolute h-1 bg-slate-400 rotate-45 rounded-full" />
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                            <div className="mt-4 text-center">
                              <p className="text-sm font-black text-rose-600 bg-rose-50 px-6 py-2 rounded-full border border-rose-100">Factors Remaining: {exampleIndex === 0 ? '5 - 3 = 2' : '6 - 2 = 4'}</p>
                              <p className="text-3xl font-black mt-4 text-slate-900">Result: {exampleIndex === 0 ? '2' : 'x'}<sup>{exampleIndex === 0 ? '2' : '4'}</sup></p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ruleType === 'power' && (
                        <div className="space-y-8">
                          <p className="text-slate-600 font-bold leading-relaxed first-letter:uppercase">
                            {exampleIndex === 0 
                              ? "A power to a power means groups of groups. If we have 3 groups of 2, we have 6 factors in total!"
                              : "Think of the outer exponent as the number of 'buckets', and the inner exponent as how many items are in each bucket."}
                          </p>
                          <div className="flex flex-col items-center gap-6">
                            <div className="text-3xl font-black bg-white px-10 py-6 border-4 border-amber-400 rounded-3xl text-amber-600 shadow-xl">
                              ({exampleIndex === 0 ? '2' : 'x'}<sup>{exampleIndex === 0 ? '2' : '3'}</sup>)<sup>{exampleIndex === 0 ? '3' : '2'}</sup>
                            </div>
                            <ArrowRight className="w-8 h-8 text-slate-300" />
                            <div className={`grid ${exampleIndex === 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-6`}>
                               {[...Array(exampleIndex === 0 ? 3 : 2)].map((_, group) => (
                                 <motion.div 
                                   key={`power-group-${group}`}
                                   initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: group * 0.1 }}
                                   className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex gap-1 shadow-sm"
                                 >
                                   {[...Array(exampleIndex === 0 ? 2 : 3)].map((_, factor) => (
                                     <span key={`${group}-${factor}`} className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center rounded-lg shadow text-sm font-mono font-black">{exampleIndex === 0 ? '2' : 'x'}</span>
                                   ))}
                                 </motion.div>
                               ))}
                            </div>
                            <p className="text-sm font-black text-amber-700 bg-amber-50 px-6 py-2 rounded-full border border-amber-100 text-center">
                              Total Factors: {exampleIndex === 0 ? '2 \u00d7 3 = 6' : '3 \u00d7 2 = 6'}
                            </p>
                            <p className="text-3xl font-black text-slate-900">Result: {exampleIndex === 0 ? '2' : 'x'}<sup>6</sup></p>
                          </div>
                        </div>
                      )}

                      {ruleType === 'zero' && (
                        <div className="space-y-8 h-full flex flex-col">
                          <p className="text-slate-600 font-bold leading-relaxed first-letter:uppercase">
                            {exampleIndex === 0 
                              ? "The zero rule makes sense if you look at the pattern! Every time the exponent drops, we divide by the base."
                              : "We can also prove it using the Quotient Rule. Dividing something by itself always equals 1!"}
                          </p>
                          
                          {exampleIndex === 0 ? (
                            <div className="max-w-xs mx-auto grid grid-cols-[1fr,auto,1fr] gap-4 items-center py-6">
                              <div className="bg-white p-4 border-2 border-slate-200 rounded-xl font-mono text-center font-black shadow-sm">2<sup>3</sup> = 8</div>
                              <div className="text-indigo-400 font-black text-xs px-2">{'\u00f7'} 2</div>
                              <div className="h-4 w-[2px] bg-indigo-100 justify-self-center"></div>

                              <div className="bg-white p-4 border-2 border-slate-200 rounded-xl font-mono text-center font-black shadow-sm">2<sup>2</sup> = 4</div>
                              <div className="text-indigo-400 font-black text-xs px-2">{'\u00f7'} 2</div>
                              <div className="h-4 w-[2px] bg-indigo-100 justify-self-center"></div>

                              <div className="bg-white p-4 border-2 border-slate-200 rounded-xl font-mono text-center font-black shadow-sm">2<sup>1</sup> = 2</div>
                              <div className="text-indigo-400 font-black text-xs px-2">{'\u00f7'} 2</div>
                              <div className="h-4 w-[2px] bg-indigo-100 justify-self-center"></div>

                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="bg-indigo-900 p-6 border-2 border-indigo-700 rounded-2xl font-mono text-center text-white shadow-2xl col-span-3 font-black text-xl"
                              >
                                2<sup>0</sup> = 1
                              </motion.div>
                              <div className="text-center italic text-slate-400 text-xs mt-6 col-span-3">
                                2 {'\u00f7'} 2 = 1. That's why anything to the power of 0 is 1.
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-8 py-8 flex-grow justify-center">
                              <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-md">
                                <div className="text-center space-y-6">
                                  <div className="flex items-center justify-center gap-4 text-4xl font-black">
                                    <div className="flex flex-col items-center">
                                      <span>x<sup>3</sup></span>
                                      <div className="w-16 h-1 bg-slate-900 rounded-full my-1"></div>
                                      <span>x<sup>3</sup></span>
                                    </div>
                                    <span className="text-slate-300">=</span>
                                    <span className="text-indigo-600 p-3 bg-indigo-50 rounded-xl">x<sup>3-3</sup></span>
                                    <span className="text-slate-300">=</span>
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-indigo-900">x<sup>0</sup></motion.span>
                                  </div>
                                  <div className="text-slate-400 font-black uppercase text-[10px] tracking-widest pt-4">Also, Mathematically:</div>
                                  <div className="flex items-center justify-center gap-4 text-4xl font-black">
                                    <div className="flex flex-col items-center">
                                      <span>x<sup>3</sup></span>
                                      <div className="w-16 h-1 bg-slate-900 rounded-full my-1"></div>
                                      <span>x<sup>3</sup></span>
                                    </div>
                                    <span className="text-slate-300">=</span>
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="text-emerald-600 p-3 bg-emerald-50 rounded-xl">1</motion.span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-3 shadow-xl">
                                <CheckCircle2 className="text-emerald-400 w-6 h-6" />
                                Since both equal x<sup>3</sup>/x<sup>3</sup>, then x<sup>0</sup> must be 1!
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'advanced' && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center shadow-xl">
                   <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">ELITE CHALLENGES</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Level up your understanding with mixed rules</p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-8">
                {/* Theory Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16"></div>
                    <h3 className="text-xl font-black mb-6">BASE CONVERSION</h3>
                    <p className="text-indigo-200 font-medium text-sm leading-relaxed mb-8">
                      To use exponent rules, the <span className="text-white font-black underline decoration-indigo-500">bases must match</span>. 
                      Look for these common conversions:
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">4, 8, 16</span>
                        <ArrowRight className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-indigo-400">Powers of 2</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-400">9, 27, 81</span>
                        <ArrowRight className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-indigo-400">Powers of 3</span>
                      </div>
                    </div>
                    
                    <div className="mt-10 p-4 bg-indigo-500/20 rounded-2xl border border-indigo-400/30">
                      <p className="text-xs font-bold text-indigo-300 italic text-center">"Secret: 1 is just any base to the power of 0!"</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Walkthrough */}
                <div className="col-span-12 lg:col-span-8 bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-sm min-h-[550px] flex flex-col">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div className="flex gap-2">
                      {advancedCases.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => { setAdvancedCaseIndex(i); setAdvancedStep(0); }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            advancedCaseIndex === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setAdvancedStep(0)} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest">
                       Reset Walkthrough
                    </button>
                  </div>

                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 flex-grow flex flex-col justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      {advancedStep === 0 ? (
                        <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{advancedCases[advancedCaseIndex].title}</p>
                          <div className="text-6xl font-black text-slate-900 tracking-tighter mb-10">
                            <MathText text={advancedCases[advancedCaseIndex].expression} />
                          </div>
                          <button onClick={() => setAdvancedStep(1)} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 mx-auto">
                            Deconstruct <ArrowRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ) : advancedStep === 1 ? (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center space-y-8">
                           <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest">Phase 1: Unify Bases</div>
                           <p className="text-slate-600 font-bold max-w-sm mx-auto leading-relaxed">{advancedCases[advancedCaseIndex].explanation}</p>
                           <div className="flex justify-center gap-8 items-center">
                              {advancedCases[advancedCaseIndex].initialBases.map((b, i) => (
                                <div key={i} className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm min-w-20">
                                   <span className="text-slate-400 font-black text-2xl line-through decoration-rose-500/50">{b}</span>
                                   <ArrowRight className="w-4 h-4 text-slate-300 my-2 rotate-90" />
                                   <span className="text-indigo-600 font-black text-2xl h-8">
                                     <MathText text={advancedCases[advancedCaseIndex].targetBases[i]} />
                                   </span>
                                </div>
                              ))}
                           </div>
                           <button onClick={() => setAdvancedStep(2)} className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl">Apply Rules</button>
                        </motion.div>
                      ) : (
                        <motion.div key="final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
                           <div className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 text-center">Phase 2: Execution</div>
                           
                           <div className="mb-10 p-6 bg-indigo-50 border-2 border-indigo-100 rounded-3xl inline-block mx-auto">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Unified Expression</p>
                              <div className="text-4xl font-black text-indigo-900 tracking-tighter">
                                <MathText text={advancedCases[advancedCaseIndex].unifiedExpression} />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-10">
                              {advancedCases[advancedCaseIndex].steps.map((s, i) => (
                                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 text-left">
                                   <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{s.label}</p>
                                   <p className="text-lg font-black text-slate-800"><MathText text={s.result} /></p>
                                </div>
                              ))}
                           </div>
                           <div className="pt-8 border-t-4 border-indigo-600 inline-block">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Simplest Form</p>
                              <div className="text-7xl font-black text-indigo-900 tracking-tighter">
                                <MathText text={advancedCases[advancedCaseIndex].final} />
                              </div>
                           </div>
                           <div className="mt-10">
                             <button onClick={() => setAdvancedStep(0)} className="text-xs font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest">Start Over</button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6 max-w-5xl mx-auto"
            >
              {/* Question Card */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-40 -z-0"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                     <CardHeader title="Expression Smushing" colorClass="bg-emerald-500" />
                     <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                       Question {currentQuestionIndex + 1} / {questions.length}
                     </div>
                  </div>

                  {/* Teacher Note / Tip Area */}
                  <motion.div 
                    key={`note-${currentQuestionIndex}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-slate-900 border-l-4 border-indigo-500 rounded-2xl shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                       <Zap className="w-4 h-4 text-indigo-400" />
                       <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Teacher Insight</span>
                    </div>
                    <p className="text-white font-bold text-sm leading-relaxed">
                      {questions[currentQuestionIndex].teacherNote || "Keep going! You're mastering the patterns."}
                    </p>
                  </motion.div>

                  <div className="text-center py-12 mb-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Simplify this expression:</p>
                    <div className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter">
                      <MathText text={questions[currentQuestionIndex].expression} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <input 
                      type="text"
                      placeholder="e.g. 2^5"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                      className={`flex-grow px-8 py-5 bg-white border-4 rounded-2xl text-2xl font-black tracking-tighter focus:outline-none transition-all ${
                        quizStatus === 'correct' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' :
                        quizStatus === 'wrong' ? 'border-rose-500 bg-rose-50 text-rose-900' :
                        'border-slate-100 focus:border-indigo-600 shadow-inner'
                      }`}
                    />
                    <button 
                      onClick={quizStatus === 'idle' ? checkAnswer : handleNextQuestion}
                      className={`px-10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 ${
                        quizStatus === 'idle' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-black'
                      }`}
                    >
                      {quizStatus === 'idle' ? 'Check' : 'Next'}
                    </button>
                  </div>
                  
                  {quizStatus === 'wrong' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-rose-50 border-2 border-rose-100 rounded-2xl">
                      <p className="text-rose-900 font-black text-xs uppercase mb-2 tracking-widest">Need a hint?</p>
                      <p className="text-rose-800 italic text-sm">{questions[currentQuestionIndex].hint}</p>
                    </motion.div>
                  )}

                  {quizStatus !== 'idle' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="mt-8 p-8 bg-slate-900 text-white rounded-3xl shadow-xl border-t-4 border-indigo-500"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Strategy Breakdown</span>
                      </div>
                      <div className="space-y-4">
                        {questions[currentQuestionIndex].steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300 shrink-0">{i + 1}</div>
                            <p className="text-slate-100 font-bold text-sm">
                              <MathText text={step} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Accuracy Sidebar Cards */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-amber-100 rounded-3xl border-2 border-amber-200 p-8 flex flex-col items-center justify-center text-center shadow-sm flex-grow min-h-[250px]">
                   <div className="w-16 h-16 bg-amber-500 rounded-full mb-5 flex items-center justify-center shadow-lg border-4 border-white">
                      <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={3} />
                   </div>
                   <div className="text-4xl font-black text-amber-900 tracking-tighter mb-1">
                     {score}/{questions.length}
                   </div>
                   <div className="text-[10px] font-black text-amber-700 uppercase tracking-[0.2em]">Current Accuracy</div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
                  <p className="text-[11px] font-bold text-slate-400 leading-tight mb-4 tracking-wide uppercase">Class Progress</p>
                  <p className="text-indigo-200 text-xs font-medium mb-6 italic tracking-tight">"The class is currently moving through the basic patterns. Encourage students to check their work!"</p>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full">
                     <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(score/questions.length)*100}%` }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="py-12 border-t border-slate-200 mt-20 text-center italic text-slate-400 text-sm">
          "Don't just memorize rules. Understand the expansion."
        </footer>
      </div>

      {/* Video Guide Drawer */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {isVideoDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="mb-4 w-[320px] sm:w-[480px] bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden pointer-events-auto"
            >
              <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Interactive Video Guide</span>
                </div>
                <button 
                  onClick={() => setIsVideoDrawerOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close video guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="aspect-video w-full bg-slate-100">
                <iframe
                  src={isVideoDrawerOpen ? EMBED_URL : ""}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Check Your Thinking</h4>
                  <p className="text-slate-600 text-xs font-bold leading-relaxed">
                    How does base conversion change the way you look at complex problems? Consider how unifying the base simplifies the calculation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsVideoDrawerOpen(!isVideoDrawerOpen)}
          aria-expanded={isVideoDrawerOpen}
          className={`pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            isVideoDrawerOpen 
            ? 'bg-rose-500 text-white animate-pulse' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isVideoDrawerOpen ? <X className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
