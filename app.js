/* ============================================================
   MolSys Cost Simulator — Application Logic
   ============================================================ */

// ─── Model Data ─────────────────────────────────────────────
// Derived from CSV: cost/user/month at 5000 users baseline
// We store the costPerUser (at 5000 users) so we can scale linearly to any user count.

const MODEL_COLORS = {
    'Model A 30B': { bg: '#6366f1', light: 'rgba(99,102,241,0.18)' },
    'Model B 120B': { bg: '#a855f7', light: 'rgba(168,85,247,0.18)' },
    'Model C 12B': { bg: '#06b6d4', light: 'rgba(6,182,212,0.18)' },
    'Model D 20B': { bg: '#f43f5e', light: 'rgba(244,63,94,0.18)' },
    'Model E 110B MoE': { bg: '#3b82f6', light: 'rgba(59,130,246,0.18)' },
};

const MODELS_DATA = [
    // Nemotron Nano 3 30B
    { model: 'Model A 30B', pdfs: 50, context: 'Aggressive (64k+64k)', inputTokens: 3200000, outputTokens: 3200000, totalTokens: 6400000, costPerPdf: 0.02, costPerUser: 0.96 },
    { model: 'Model A 30B', pdfs: 50, context: 'Above Avg (32k+32k)', inputTokens: 1600000, outputTokens: 1600000, totalTokens: 3200000, costPerPdf: 0.01, costPerUser: 0.48 },
    { model: 'Model A 30B', pdfs: 50, context: 'Average (16k+16k)', inputTokens: 800000, outputTokens: 800000, totalTokens: 1600000, costPerPdf: 0.005, costPerUser: 0.24 },
    { model: 'Model A 30B', pdfs: 50, context: 'Conservative (8k+8k)', inputTokens: 400000, outputTokens: 400000, totalTokens: 800000, costPerPdf: 0.0024, costPerUser: 0.12 },
    { model: 'Model A 30B', pdfs: 30, context: 'Aggressive (64k+64k)', inputTokens: 1920000, outputTokens: 1920000, totalTokens: 3840000, costPerPdf: 0.02, costPerUser: 0.58 },
    { model: 'Model A 30B', pdfs: 30, context: 'Above Avg (32k+32k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.01, costPerUser: 0.29 },
    { model: 'Model A 30B', pdfs: 30, context: 'Average (16k+16k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.005, costPerUser: 0.14 },
    { model: 'Model A 30B', pdfs: 30, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.0024, costPerUser: 0.07 },
    { model: 'Model A 30B', pdfs: 15, context: 'Aggressive (64k+64k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.02, costPerUser: 0.29 },
    { model: 'Model A 30B', pdfs: 15, context: 'Above Avg (32k+32k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.14 },
    { model: 'Model A 30B', pdfs: 15, context: 'Average (16k+16k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.005, costPerUser: 0.07 },
    { model: 'Model A 30B', pdfs: 15, context: 'Conservative (8k+8k)', inputTokens: 120000, outputTokens: 120000, totalTokens: 240000, costPerPdf: 0.0024, costPerUser: 0.04 },
    { model: 'Model A 30B', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.02, costPerUser: 0.19 },
    { model: 'Model A 30B', pdfs: 10, context: 'Above Avg (32k+32k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.01, costPerUser: 0.10 },
    { model: 'Model A 30B', pdfs: 10, context: 'Average (16k+16k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.005, costPerUser: 0.05 },
    { model: 'Model A 30B', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.0024, costPerUser: 0.02 },
    { model: 'Model A 30B', pdfs: 5, context: 'Aggressive (64k+64k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.02, costPerUser: 0.10 },
    { model: 'Model A 30B', pdfs: 5, context: 'Above Avg (32k+32k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.05 },
    { model: 'Model A 30B', pdfs: 5, context: 'Average (16k+16k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.005, costPerUser: 0.03 },
    { model: 'Model A 30B', pdfs: 5, context: 'Conservative (8k+8k)', inputTokens: 40000, outputTokens: 40000, totalTokens: 80000, costPerPdf: 0.0024, costPerUser: 0.01 },

    // Nemotron 3 Super 120B
    { model: 'Model B 120B', pdfs: 50, context: 'Aggressive (64k+64k)', inputTokens: 3200000, outputTokens: 3200000, totalTokens: 6400000, costPerPdf: 0.05, costPerUser: 2.56 },
    { model: 'Model B 120B', pdfs: 50, context: 'Above Avg (32k+32k)', inputTokens: 1600000, outputTokens: 1600000, totalTokens: 3200000, costPerPdf: 0.03, costPerUser: 1.28 },
    { model: 'Model B 120B', pdfs: 50, context: 'Average (16k+16k)', inputTokens: 800000, outputTokens: 800000, totalTokens: 1600000, costPerPdf: 0.01, costPerUser: 0.64 },
    { model: 'Model B 120B', pdfs: 50, context: 'Conservative (8k+8k)', inputTokens: 400000, outputTokens: 400000, totalTokens: 800000, costPerPdf: 0.01, costPerUser: 0.32 },
    { model: 'Model B 120B', pdfs: 30, context: 'Aggressive (64k+64k)', inputTokens: 1920000, outputTokens: 1920000, totalTokens: 3840000, costPerPdf: 0.05, costPerUser: 1.54 },
    { model: 'Model B 120B', pdfs: 30, context: 'Above Avg (32k+32k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.03, costPerUser: 0.77 },
    { model: 'Model B 120B', pdfs: 30, context: 'Average (16k+16k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.38 },
    { model: 'Model B 120B', pdfs: 30, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.19 },
    { model: 'Model B 120B', pdfs: 15, context: 'Aggressive (64k+64k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.05, costPerUser: 0.77 },
    { model: 'Model B 120B', pdfs: 15, context: 'Above Avg (32k+32k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.03, costPerUser: 0.38 },
    { model: 'Model B 120B', pdfs: 15, context: 'Average (16k+16k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.19 },
    { model: 'Model B 120B', pdfs: 15, context: 'Conservative (8k+8k)', inputTokens: 120000, outputTokens: 120000, totalTokens: 240000, costPerPdf: 0.01, costPerUser: 0.10 },
    { model: 'Model B 120B', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.05, costPerUser: 0.51 },
    { model: 'Model B 120B', pdfs: 10, context: 'Above Avg (32k+32k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.03, costPerUser: 0.26 },
    { model: 'Model B 120B', pdfs: 10, context: 'Average (16k+16k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.13 },
    { model: 'Model B 120B', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.06 },
    { model: 'Model B 120B', pdfs: 5, context: 'Aggressive (64k+64k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.05, costPerUser: 0.26 },
    { model: 'Model B 120B', pdfs: 5, context: 'Above Avg (32k+32k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.03, costPerUser: 0.13 },
    { model: 'Model B 120B', pdfs: 5, context: 'Average (16k+16k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.07 },
    { model: 'Model B 120B', pdfs: 5, context: 'Conservative (8k+8k)', inputTokens: 40000, outputTokens: 40000, totalTokens: 80000, costPerPdf: 0.01, costPerUser: 0.03 },


    // Gemma 3 12B IT
    { model: 'Model C 12B', pdfs: 50, context: 'Aggressive (64k+64k)', inputTokens: 3200000, outputTokens: 3200000, totalTokens: 6400000, costPerPdf: 0.02, costPerUser: 1.22 },
    { model: 'Model C 12B', pdfs: 50, context: 'Above Avg (32k+32k)', inputTokens: 1600000, outputTokens: 1600000, totalTokens: 3200000, costPerPdf: 0.01, costPerUser: 0.61 },
    { model: 'Model C 12B', pdfs: 50, context: 'Average (16k+16k)', inputTokens: 800000, outputTokens: 800000, totalTokens: 1600000, costPerPdf: 0.01, costPerUser: 0.30 },
    { model: 'Model C 12B', pdfs: 50, context: 'Conservative (8k+8k)', inputTokens: 400000, outputTokens: 400000, totalTokens: 800000, costPerPdf: 0.003, costPerUser: 0.15 },
    { model: 'Model C 12B', pdfs: 30, context: 'Aggressive (64k+64k)', inputTokens: 1920000, outputTokens: 1920000, totalTokens: 3840000, costPerPdf: 0.02, costPerUser: 0.73 },
    { model: 'Model C 12B', pdfs: 30, context: 'Above Avg (32k+32k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.01, costPerUser: 0.37 },
    { model: 'Model C 12B', pdfs: 30, context: 'Average (16k+16k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.18 },
    { model: 'Model C 12B', pdfs: 30, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.003, costPerUser: 0.09 },
    { model: 'Model C 12B', pdfs: 15, context: 'Aggressive (64k+64k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.02, costPerUser: 0.37 },
    { model: 'Model C 12B', pdfs: 15, context: 'Above Avg (32k+32k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.18 },
    { model: 'Model C 12B', pdfs: 15, context: 'Average (16k+16k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.09 },
    { model: 'Model C 12B', pdfs: 15, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.003, costPerUser: 0.05 },
    { model: 'Model C 12B', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.02, costPerUser: 0.24 },
    { model: 'Model C 12B', pdfs: 10, context: 'Above Avg (32k+32k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.01, costPerUser: 0.12 },
    { model: 'Model C 12B', pdfs: 10, context: 'Average (16k+16k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.06 },
    { model: 'Model C 12B', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.003, costPerUser: 0.03 },
    { model: 'Model C 12B', pdfs: 5, context: 'Aggressive (64k+64k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.02, costPerUser: 0.12 },
    { model: 'Model C 12B', pdfs: 5, context: 'Above Avg (32k+32k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.06 },
    { model: 'Model C 12B', pdfs: 5, context: 'Average (16k+16k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.03 },
    { model: 'Model C 12B', pdfs: 5, context: 'Conservative (8k+8k)', inputTokens: 40000, outputTokens: 40000, totalTokens: 80000, costPerPdf: 0.003, costPerUser: 0.01 },


    // GPT-oss-20b
    { model: 'Model D 20B', pdfs: 50, context: 'Aggressive (64k+64k)', inputTokens: 3200000, outputTokens: 3200000, totalTokens: 6400000, costPerPdf: 0.02, costPerUser: 1.18 },
    { model: 'Model D 20B', pdfs: 50, context: 'Above Avg (32k+32k)', inputTokens: 1600000, outputTokens: 1600000, totalTokens: 3200000, costPerPdf: 0.01, costPerUser: 0.59 },
    { model: 'Model D 20B', pdfs: 50, context: 'Average (16k+16k)', inputTokens: 800000, outputTokens: 800000, totalTokens: 1600000, costPerPdf: 0.01, costPerUser: 0.30 },
    { model: 'Model D 20B', pdfs: 50, context: 'Conservative (8k+8k)', inputTokens: 400000, outputTokens: 400000, totalTokens: 800000, costPerPdf: 0.003, costPerUser: 0.15 },
    { model: 'Model D 20B', pdfs: 30, context: 'Aggressive (64k+64k)', inputTokens: 1920000, outputTokens: 1920000, totalTokens: 3840000, costPerPdf: 0.02, costPerUser: 0.71 },
    { model: 'Model D 20B', pdfs: 30, context: 'Above Avg (32k+32k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.01, costPerUser: 0.36 },
    { model: 'Model D 20B', pdfs: 30, context: 'Average (16k+16k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.18 },
    { model: 'Model D 20B', pdfs: 30, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.003, costPerUser: 0.09 },
    { model: 'Model D 20B', pdfs: 15, context: 'Aggressive (64k+64k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.02, costPerUser: 0.36 },
    { model: 'Model D 20B', pdfs: 15, context: 'Above Avg (32k+32k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.18 },
    { model: 'Model D 20B', pdfs: 15, context: 'Average (16k+16k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.09 },
    { model: 'Model D 20B', pdfs: 15, context: 'Conservative (8k+8k)', inputTokens: 120000, outputTokens: 120000, totalTokens: 240000, costPerPdf: 0.003, costPerUser: 0.04 },
    { model: 'Model D 20B', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.02, costPerUser: 0.24 },
    { model: 'Model D 20B', pdfs: 10, context: 'Above Avg (32k+32k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.01, costPerUser: 0.12 },
    { model: 'Model D 20B', pdfs: 10, context: 'Average (16k+16k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.06 },
    { model: 'Model D 20B', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.003, costPerUser: 0.03 },
    { model: 'Model D 20B', pdfs: 5, context: 'Aggressive (64k+64k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.02, costPerUser: 0.12 },
    { model: 'Model D 20B', pdfs: 5, context: 'Above Avg (32k+32k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.06 },
    { model: 'Model D 20B', pdfs: 5, context: 'Average (16k+16k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.03 },
    { model: 'Model D 20B', pdfs: 5, context: 'Conservative (8k+8k)', inputTokens: 40000, outputTokens: 40000, totalTokens: 80000, costPerPdf: 0.003, costPerUser: 0.01 },

    // Llama 4 Scout 110B MoE
    { model: 'Model E 110B MoE', pdfs: 50, context: 'Aggressive (64k+64k)', inputTokens: 3200000, outputTokens: 3200000, totalTokens: 6400000, costPerPdf: 0.05, costPerUser: 2.66 },
    { model: 'Model E 110B MoE', pdfs: 50, context: 'Above Avg (32k+32k)', inputTokens: 1600000, outputTokens: 1600000, totalTokens: 3200000, costPerPdf: 0.03, costPerUser: 1.33 },
    { model: 'Model E 110B MoE', pdfs: 50, context: 'Average (16k+16k)', inputTokens: 800000, outputTokens: 800000, totalTokens: 1600000, costPerPdf: 0.01, costPerUser: 0.66 },
    { model: 'Model E 110B MoE', pdfs: 50, context: 'Conservative (8k+8k)', inputTokens: 400000, outputTokens: 400000, totalTokens: 800000, costPerPdf: 0.01, costPerUser: 0.33 },
    { model: 'Model E 110B MoE', pdfs: 30, context: 'Aggressive (64k+64k)', inputTokens: 1920000, outputTokens: 1920000, totalTokens: 3840000, costPerPdf: 0.05, costPerUser: 1.59 },
    { model: 'Model E 110B MoE', pdfs: 30, context: 'Above Avg (32k+32k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.03, costPerUser: 0.80 },
    { model: 'Model E 110B MoE', pdfs: 30, context: 'Average (16k+16k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.01, costPerUser: 0.40 },
    { model: 'Model E 110B MoE', pdfs: 30, context: 'Conservative (8k+8k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.20 },
    { model: 'Model E 110B MoE', pdfs: 15, context: 'Aggressive (64k+64k)', inputTokens: 960000, outputTokens: 960000, totalTokens: 1920000, costPerPdf: 0.05, costPerUser: 0.80 },
    { model: 'Model E 110B MoE', pdfs: 15, context: 'Above Avg (32k+32k)', inputTokens: 480000, outputTokens: 480000, totalTokens: 960000, costPerPdf: 0.03, costPerUser: 0.40 },
    { model: 'Model E 110B MoE', pdfs: 15, context: 'Average (16k+16k)', inputTokens: 240000, outputTokens: 240000, totalTokens: 480000, costPerPdf: 0.01, costPerUser: 0.20 },
    { model: 'Model E 110B MoE', pdfs: 15, context: 'Conservative (8k+8k)', inputTokens: 120000, outputTokens: 120000, totalTokens: 240000, costPerPdf: 0.01, costPerUser: 0.10 },
    { model: 'Model E 110B MoE', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.05, costPerUser: 0.53 },
    { model: 'Model E 110B MoE', pdfs: 10, context: 'Above Avg (32k+32k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.03, costPerUser: 0.27 },
    { model: 'Model E 110B MoE', pdfs: 10, context: 'Average (16k+16k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.01, costPerUser: 0.13 },
    { model: 'Model E 110B MoE', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.07 },
    { model: 'Model E 110B MoE', pdfs: 5, context: 'Aggressive (64k+64k)', inputTokens: 320000, outputTokens: 320000, totalTokens: 640000, costPerPdf: 0.05, costPerUser: 0.27 },
    { model: 'Model E 110B MoE', pdfs: 5, context: 'Above Avg (32k+32k)', inputTokens: 160000, outputTokens: 160000, totalTokens: 320000, costPerPdf: 0.03, costPerUser: 0.14 },
    { model: 'Model E 110B MoE', pdfs: 5, context: 'Average (16k+16k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.07 },
    { model: 'Model E 110B MoE', pdfs: 5, context: 'Conservative (8k+8k)', inputTokens: 40000, outputTokens: 40000, totalTokens: 80000, costPerPdf: 0.01, costPerUser: 0.04 },
];


const MODEL_NAMES = [...new Set(MODELS_DATA.map(d => d.model))];
const PDF_TIERS = [50, 30, 15, 10, 5];
const CONTEXT_TIERS = ['Aggressive (64k+64k)', 'Above Avg (32k+32k)', 'Average (16k+16k)', 'Conservative (8k+8k)'];

// ─── DOM Elements ───────────────────────────────────────────
const els = {
    userSlider: document.getElementById('user-count-slider'),
    userInput: document.getElementById('user-count-input'),
    modelSelect: document.getElementById('model-select'),
    pdfSelect: document.getElementById('pdf-select'),
    contextSelect: document.getElementById('context-select'),
    btnReset: document.getElementById('btn-reset'),
    // KPIs - first card (swappable)
    kpiFirstCard: document.getElementById('kpi-cheapest'),
    kpiFirstIcon: document.querySelector('#kpi-cheapest .kpi-icon'),
    kpiFirstLabel: document.querySelector('#kpi-cheapest .kpi-label'),
    kpiCheapestVal: document.getElementById('kpi-cheapest-value'),
    kpiCheapestSub: document.getElementById('kpi-cheapest-sub'),
    // KPIs - other cards
    kpiMonthlyVal: document.getElementById('kpi-monthly-value'),
    kpiMonthlySub: document.getElementById('kpi-monthly-sub'),
    kpiAnnualVal: document.getElementById('kpi-annual-value'),
    kpiAnnualSub: document.getElementById('kpi-annual-sub'),
    kpiPerUserVal: document.getElementById('kpi-per-user-value'),
    kpiPerUserSub: document.getElementById('kpi-per-user-sub'),
    // Table
    tableBody: document.getElementById('table-body'),
    tableCount: document.getElementById('table-count'),
    btnDownloadCsv: document.getElementById('btn-download-csv'),
    // Heatmap
    heatmapTable: document.getElementById('heatmap-table'),
    heatmapUserLabel: document.getElementById('heatmap-user-label'),
    // Chart tabs
    tabMonthly: document.getElementById('tab-monthly'),
    tabAnnual: document.getElementById('tab-annual'),
};

// ─── State ──────────────────────────────────────────────────
let state = {
    users: 100,
    model: 'all',
    pdfs: '15',
    context: 'Above Avg (32k+32k)',
    chartView: 'monthly', // 'monthly' | 'annual'
};

// ─── Chart instances ────────────────────────────────────────
let comparisonChart = null;
let perUserChart = null;
let scalingChart = null;

// ─── Initialization ─────────────────────────────────────────
function init() {
    populateModelSelect();
    bindEvents();
    updateAll();
}

function populateModelSelect() {
    MODEL_NAMES.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        els.modelSelect.appendChild(opt);
    });
}

function bindEvents() {
    if (els.btnDownloadCsv) {
        els.btnDownloadCsv.addEventListener('click', () => {
            let csvContent = "Model,PDFs/User,Context Tier,Input Tokens,Output Tokens,Total Tokens,Cost/PDF,Cost/User/Mo,Monthly Total,Annual Total\n";

            MODELS_DATA.forEach(row => {
                const monthly = calcTotalMonthly(row);
                const annual = calcAnnual(row);

                const rowArr = [
                    '"' + row.model + '"',
                    row.pdfs,
                    '"' + row.context + '"',
                    row.inputTokens,
                    row.outputTokens,
                    row.totalTokens,
                    row.costPerPdf.toFixed(4),
                    row.costPerUser.toFixed(2),
                    monthly.toFixed(2),
                    annual.toFixed(2)
                ];
                csvContent += rowArr.join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `molsys_cost_simulation_${state.users}_users.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    els.userSlider.addEventListener('input', e => {
        state.users = parseInt(e.target.value);
        els.userInput.value = state.users;
        updateAll();
    });

    els.userInput.addEventListener('change', e => {
        let v = parseInt(e.target.value);
        v = Math.max(100, Math.min(10000000, v || 100));
        state.users = v;
        els.userSlider.value = v;
        els.userInput.value = v;
        updateAll();
    });

    els.modelSelect.addEventListener('change', e => {
        state.model = e.target.value;
        updateAll();
    });

    els.pdfSelect.addEventListener('change', e => {
        state.pdfs = e.target.value;
        updateAll();
    });

    els.contextSelect.addEventListener('change', e => {
        state.context = e.target.value;
        updateAll();
    });

    els.btnReset.addEventListener('click', () => {
        state = { users: 100, model: 'all', pdfs: '15', context: 'Above Avg (32k+32k)', chartView: 'monthly' };
        els.userSlider.value = 100;
        els.userInput.value = 100;
        els.modelSelect.value = 'all';
        els.pdfSelect.value = '15';
        els.contextSelect.value = 'Above Avg (32k+32k)';
        els.tabMonthly.classList.add('active');
        els.tabAnnual.classList.remove('active');
        updateAll();
    });

    els.tabMonthly.addEventListener('click', () => {
        state.chartView = 'monthly';
        els.tabMonthly.classList.add('active');
        els.tabAnnual.classList.remove('active');
        updateComparisonChart();
    });

    els.tabAnnual.addEventListener('click', () => {
        state.chartView = 'annual';
        els.tabAnnual.classList.add('active');
        els.tabMonthly.classList.remove('active');
        updateComparisonChart();
    });
}

// ─── Filtering ──────────────────────────────────────────────
function getFilteredData() {
    return MODELS_DATA.filter(d => {
        if (state.model !== 'all' && d.model !== state.model) return false;
        if (state.pdfs !== 'all' && d.pdfs !== parseInt(state.pdfs)) return false;
        if (state.context !== 'all' && d.context !== state.context) return false;
        return true;
    });
}

// ─── Cost Calculation ───────────────────────────────────────
function calcTotalMonthly(row) {
    return row.costPerUser * state.users;
}

function calcAnnual(row) {
    return calcTotalMonthly(row) * 12;
}

// ─── Formatting ─────────────────────────────────────────────
function fmtCurrency(val) {
    if (val >= 1000000) return '$' + (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return '$' + val.toFixed(2);
}

function fmtCurrencyPrecise(val) {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTokens(val) {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val.toString();
}

function fmtNumber(val) {
    return val.toLocaleString('en-US');
}

// ─── Update All ─────────────────────────────────────────────
function updateAll() {
    const data = getFilteredData();
    updateKPIs(data);
    updateTable(data);
    updateComparisonChart();
    updatePerUserChart();
    updateScalingChart();
    updateHeatmap();
}

// ─── Context Window Helper ──────────────────────────────────
const CONTEXT_SIZES = {
    'Aggressive (64k+64k)': { input: '64K', output: '64K', total: '128K' },
    'Above Avg (32k+32k)': { input: '32K', output: '32K', total: '64K' },
    'Average (16k+16k)': { input: '16K', output: '16K', total: '32K' },
    'Conservative (8k+8k)': { input: '8K', output: '8K', total: '16K' },
};

const ICON_CHEAPEST = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const ICON_CONTEXT = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

// ─── KPIs ───────────────────────────────────────────────────
function updateKPIs(data) {
    if (data.length === 0) {
        els.kpiCheapestVal.textContent = '—';
        els.kpiCheapestSub.textContent = 'No matching scenarios';
        els.kpiMonthlyVal.textContent = '—';
        els.kpiMonthlySub.textContent = '—';
        els.kpiAnnualVal.textContent = '—';
        els.kpiAnnualSub.textContent = '—';
        els.kpiPerUserVal.textContent = '—';
        els.kpiPerUserSub.textContent = '—';
        return;
    }

    const monthlyCosts = data.map(d => calcTotalMonthly(d));
    const perUserCosts = data.map(d => d.costPerUser);

    const minMonthly = Math.min(...monthlyCosts);
    const maxMonthly = Math.max(...monthlyCosts);
    const minAnnual = minMonthly * 12;
    const maxAnnual = maxMonthly * 12;
    const minPerUser = Math.min(...perUserCosts);
    const maxPerUser = Math.max(...perUserCosts);

    // ── First KPI Card: Cheapest (all models) vs Context Window (specific model) ──
    const isSingleModel = state.model !== 'all';

    if (isSingleModel) {
        // Show Context Window breakdown
        els.kpiFirstLabel.textContent = 'Context Window';
        els.kpiFirstIcon.innerHTML = ICON_CONTEXT;
        els.kpiFirstIcon.className = 'kpi-icon kpi-icon-cyan';
        els.kpiFirstCard.classList.remove('kpi-card-primary');
        els.kpiFirstCard.classList.add('kpi-card-context');

        // Determine the context tier info
        const contextTier = state.context !== 'all' ? state.context : null;
        if (contextTier && CONTEXT_SIZES[contextTier]) {
            const cs = CONTEXT_SIZES[contextTier];
            els.kpiCheapestVal.textContent = `${cs.total} tokens`;
            els.kpiCheapestSub.textContent = `${cs.input} input + ${cs.output} output per PDF`;
        } else {
            // Multiple context tiers selected — show range
            const contexts = [...new Set(data.map(d => d.context))];
            const sizes = contexts.map(c => CONTEXT_SIZES[c]).filter(Boolean);
            if (sizes.length > 0) {
                els.kpiCheapestVal.textContent = `${sizes[sizes.length - 1].total} – ${sizes[0].total}`;
                els.kpiCheapestSub.textContent = `${contexts.length} context tiers · input + output per PDF`;
            } else {
                els.kpiCheapestVal.textContent = '—';
                els.kpiCheapestSub.textContent = 'Select a context tier';
            }
        }
    } else {
        // Show Cheapest Option
        els.kpiFirstLabel.textContent = 'Cheapest Option';
        els.kpiFirstIcon.innerHTML = ICON_CHEAPEST;
        els.kpiFirstIcon.className = 'kpi-icon';
        els.kpiFirstCard.classList.add('kpi-card-primary');
        els.kpiFirstCard.classList.remove('kpi-card-context');

        const cheapestIdx = monthlyCosts.indexOf(minMonthly);
        const cheapest = data[cheapestIdx];
        els.kpiCheapestVal.textContent = fmtCurrency(minMonthly) + '/mo';
        els.kpiCheapestSub.textContent = `${cheapest.model} · ${cheapest.pdfs} PDFs · ${cheapest.context}`;
    }

    // Monthly range
    if (minMonthly === maxMonthly) {
        els.kpiMonthlyVal.textContent = fmtCurrency(minMonthly);
    } else {
        els.kpiMonthlyVal.textContent = `${fmtCurrency(minMonthly)} – ${fmtCurrency(maxMonthly)}`;
    }
    els.kpiMonthlySub.textContent = `${fmtNumber(state.users)} users · ${data.length} scenarios`;

    // Annual range
    if (minAnnual === maxAnnual) {
        els.kpiAnnualVal.textContent = fmtCurrency(minAnnual);
    } else {
        els.kpiAnnualVal.textContent = `${fmtCurrency(minAnnual)} – ${fmtCurrency(maxAnnual)}`;
    }
    els.kpiAnnualSub.textContent = `Projected yearly spend`;

    // Per user
    if (minPerUser === maxPerUser) {
        els.kpiPerUserVal.textContent = fmtCurrencyPrecise(minPerUser);
    } else {
        els.kpiPerUserVal.textContent = `${fmtCurrencyPrecise(minPerUser)} – ${fmtCurrencyPrecise(maxPerUser)}`;
    }
    els.kpiPerUserSub.textContent = `Per user per month`;
}

// ─── Data Table ─────────────────────────────────────────────
function updateTable(data) {
    const sorted = [...data].sort((a, b) => calcTotalMonthly(a) - calcTotalMonthly(b));
    const minCost = sorted.length > 0 ? calcTotalMonthly(sorted[0]) : 0;
    const maxCost = sorted.length > 0 ? calcTotalMonthly(sorted[sorted.length - 1]) : 0;

    els.tableBody.innerHTML = sorted.map((row, i) => {
        const monthly = calcTotalMonthly(row);
        const annual = calcAnnual(row);
        const isCheapest = i === 0 && sorted.length > 1;
        const costRatio = maxCost > 0 ? monthly / maxCost : 0;

        let costClass = '';
        if (costRatio <= 0.33) costClass = 'td-cost-highlight';
        else if (costRatio <= 0.66) costClass = 'td-cost-warn';
        else costClass = 'td-cost-high';

        const color = MODEL_COLORS[row.model]?.bg || '#6366f1';

        return `<tr class="${isCheapest ? 'row-cheapest' : ''}">
            <td><span class="model-tag"><span class="model-dot" style="background:${color}"></span>${row.model}</span></td>
            <td>${row.pdfs} PDFs</td>
            <td>${row.context}</td>
            <td>${fmtTokens(row.inputTokens)}</td>
            <td>${fmtTokens(row.outputTokens)}</td>
            <td>${fmtTokens(row.totalTokens)}</td>
            <td>${fmtCurrencyPrecise(row.costPerPdf)}</td>
            <td class="${costClass}">${fmtCurrencyPrecise(row.costPerUser)}</td>
            <td class="${costClass}">${fmtCurrencyPrecise(monthly)}</td>
            <td class="${costClass}">${fmtCurrencyPrecise(annual)}</td>
        </tr>`;
    }).join('');

    els.tableCount.textContent = `${sorted.length} scenarios`;
}

// ─── Comparison Bar Chart ───────────────────────────────────
function updateComparisonChart() {
    const data = getFilteredData();
    const isAnnual = state.chartView === 'annual';
    const multiplier = isAnnual ? 12 : 1;

    // Group by model, then show grouped bars per context tier or PDF tier
    const modelNames = [...new Set(data.map(d => d.model))];

    // Determine grouping strategy
    let labels, datasets;

    if (state.context !== 'all' && state.pdfs !== 'all') {
        // Single scenario per model — simple bar chart
        labels = modelNames;
        datasets = [{
            label: isAnnual ? 'Annual Cost' : 'Monthly Cost',
            data: modelNames.map(name => {
                const row = data.find(d => d.model === name);
                return row ? calcTotalMonthly(row) * multiplier : 0;
            }),
            backgroundColor: modelNames.map(n => MODEL_COLORS[n]?.bg || '#6366f1'),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 60,
        }];
    } else if (state.pdfs !== 'all') {
        // Fixed PDF, show context tiers
        const contexts = [...new Set(data.map(d => d.context))];
        labels = modelNames;
        datasets = contexts.map((ctx, i) => ({
            label: ctx,
            data: modelNames.map(name => {
                const row = data.find(d => d.model === name && d.context === ctx);
                return row ? calcTotalMonthly(row) * multiplier : 0;
            }),
            backgroundColor: [`rgba(99,102,241,${0.4 + i * 0.2})`, `rgba(168,85,247,${0.4 + i * 0.2})`, `rgba(6,182,212,${0.4 + i * 0.2})`, `rgba(245,158,11,${0.4 + i * 0.2})`][i] || `rgba(99,102,241,${0.5 + i * 0.15})`,
            borderRadius: 4,
            borderSkipped: false,
        }));
    } else if (state.context !== 'all') {
        // Fixed context, show PDF tiers
        const pdfs = [...new Set(data.map(d => d.pdfs))];
        labels = modelNames;
        datasets = pdfs.map((pdf, i) => ({
            label: `${pdf} PDFs`,
            data: modelNames.map(name => {
                const row = data.find(d => d.model === name && d.pdfs === pdf);
                return row ? calcTotalMonthly(row) * multiplier : 0;
            }),
            backgroundColor: [`rgba(99,102,241,${0.9 - i * 0.18})`, `rgba(168,85,247,${0.9 - i * 0.18})`, `rgba(6,182,212,${0.9 - i * 0.18})`, `rgba(245,158,11,${0.9 - i * 0.18})`][i] || `rgba(99,102,241,${0.9 - i * 0.15})`,
            borderRadius: 4,
            borderSkipped: false,
        }));
    } else {
        // All options — show average cost per model
        labels = modelNames;
        datasets = [{
            label: isAnnual ? 'Avg Annual Cost' : 'Avg Monthly Cost',
            data: modelNames.map(name => {
                const rows = data.filter(d => d.model === name);
                const avg = rows.reduce((s, r) => s + calcTotalMonthly(r), 0) / rows.length;
                return avg * multiplier;
            }),
            backgroundColor: modelNames.map(n => MODEL_COLORS[n]?.bg || '#6366f1'),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 60,
        }];
    }

    const ctx = document.getElementById('chart-comparison').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: datasets.length > 1,
                    position: 'top',
                    labels: { color: '#9ca3af', font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 16 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15,17,23,0.95)',
                    titleColor: '#f0f1f5',
                    bodyColor: '#9ca3af',
                    borderColor: 'rgba(99,102,241,0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: { family: 'Inter', weight: '600' },
                    bodyFont: { family: 'JetBrains Mono', size: 12 },
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${fmtCurrencyPrecise(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(99,102,241,0.06)' },
                    ticks: { color: '#6b7280', font: { family: 'Inter', size: 10 } },
                    border: { color: 'rgba(99,102,241,0.1)' }
                },
                y: {
                    grid: { color: 'rgba(99,102,241,0.06)' },
                    ticks: {
                        color: '#6b7280',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: v => fmtCurrency(v)
                    },
                    border: { color: 'rgba(99,102,241,0.1)' }
                }
            }
        }
    });
}

// ─── Per User Radar/Horizontal Bar Chart ────────────────────
function updatePerUserChart() {
    const data = getFilteredData();
    const modelNames = [...new Set(data.map(d => d.model))];

    // Per model, pick the scenario that matches filters best (or average)
    const perUserCosts = modelNames.map(name => {
        const rows = data.filter(d => d.model === name);
        if (rows.length === 1) return rows[0].costPerUser;
        // Show average
        return rows.reduce((s, r) => s + r.costPerUser, 0) / rows.length;
    });

    const ctx = document.getElementById('chart-peruser').getContext('2d');
    if (perUserChart) perUserChart.destroy();

    perUserChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: modelNames,
            datasets: [{
                label: 'Cost / User / Month',
                data: perUserCosts,
                backgroundColor: modelNames.map(n => MODEL_COLORS[n]?.light || 'rgba(99,102,241,0.18)'),
                borderColor: modelNames.map(n => MODEL_COLORS[n]?.bg || '#6366f1'),
                borderWidth: 2,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15,17,23,0.95)',
                    titleColor: '#f0f1f5',
                    bodyColor: '#9ca3af',
                    borderColor: 'rgba(99,102,241,0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: ctx => `$${ctx.parsed.x.toFixed(2)} / user / month`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(99,102,241,0.06)' },
                    ticks: {
                        color: '#6b7280',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: v => '$' + v.toFixed(2)
                    },
                    border: { color: 'rgba(99,102,241,0.1)' }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af', font: { family: 'Inter', size: 11 } },
                    border: { color: 'rgba(99,102,241,0.1)' }
                }
            }
        }
    });
}

// ─── Scaling Line Chart ─────────────────────────────────────
function updateScalingChart() {
    const data = getFilteredData();
    const modelNames = [...new Set(data.map(d => d.model))];
    const userSteps = [100, 10000, 50000, 100000, 500000, 1000000, 2500000, 5000000, 7500000, 10000000];

    // For each model, use the currently filtered scenario(s) — take the average costPerUser
    const datasets = modelNames.map(name => {
        const rows = data.filter(d => d.model === name);
        const avgCostPerUser = rows.reduce((s, r) => s + r.costPerUser, 0) / rows.length;

        return {
            label: name,
            data: userSteps.map(u => avgCostPerUser * u),
            borderColor: MODEL_COLORS[name]?.bg || '#6366f1',
            backgroundColor: MODEL_COLORS[name]?.light || 'rgba(99,102,241,0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: MODEL_COLORS[name]?.bg || '#6366f1',
        };
    });

    const ctx = document.getElementById('chart-scaling').getContext('2d');
    if (scalingChart) scalingChart.destroy();

    scalingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: userSteps.map(u => fmtNumber(u)),
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#9ca3af', font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 }
                },
                tooltip: {
                    backgroundColor: 'rgba(15,17,23,0.95)',
                    titleColor: '#f0f1f5',
                    bodyColor: '#9ca3af',
                    borderColor: 'rgba(99,102,241,0.3)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        title: ctx => `${ctx[0].label} users`,
                        label: ctx => `${ctx.dataset.label}: ${fmtCurrencyPrecise(ctx.parsed.y)}/mo`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(99,102,241,0.06)' },
                    ticks: { color: '#6b7280', font: { family: 'Inter', size: 10 }, maxRotation: 45 },
                    title: { display: true, text: 'Number of Users', color: '#6b7280', font: { family: 'Inter', size: 11 } },
                    border: { color: 'rgba(99,102,241,0.1)' }
                },
                y: {
                    grid: { color: 'rgba(99,102,241,0.06)' },
                    ticks: {
                        color: '#6b7280',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: v => fmtCurrency(v)
                    },
                    title: { display: true, text: 'Monthly Cost ($)', color: '#6b7280', font: { family: 'Inter', size: 11 } },
                    border: { color: 'rgba(99,102,241,0.1)' }
                }
            }
        }
    });
}

// ─── Heatmap ────────────────────────────────────────────────
function updateHeatmap() {
    els.heatmapUserLabel.textContent = fmtNumber(state.users);

    // Build a matrix: rows = models, columns = PDF Tier × Context Tier
    const allModels = state.model === 'all' ? MODEL_NAMES : [state.model];
    const pdfTiers = state.pdfs === 'all' ? PDF_TIERS : [parseInt(state.pdfs)];
    const contextTiers = state.context === 'all' ? CONTEXT_TIERS : [state.context];

    // Compute all costs to find min/max for color scaling
    let allCosts = [];
    allModels.forEach(model => {
        pdfTiers.forEach(pdf => {
            contextTiers.forEach(ctx => {
                const row = MODELS_DATA.find(d => d.model === model && d.pdfs === pdf && d.context === ctx);
                if (row) allCosts.push(row.costPerUser * state.users);
            });
        });
    });

    const minCost = Math.min(...allCosts);
    const maxCost = Math.max(...allCosts);

    // Build header
    let headerHtml = '<thead><tr><th>Model</th>';
    pdfTiers.forEach(pdf => {
        contextTiers.forEach(ctx => {
            headerHtml += `<th>${pdf} PDFs<br><span style="font-weight:400;opacity:0.7">${ctx}</span></th>`;
        });
    });
    headerHtml += '</tr></thead>';

    // Build body
    let bodyHtml = '<tbody>';
    allModels.forEach(model => {
        const color = MODEL_COLORS[model]?.bg || '#6366f1';
        bodyHtml += `<tr><td><span class="model-tag"><span class="model-dot" style="background:${color}"></span>${model}</span></td>`;
        pdfTiers.forEach(pdf => {
            contextTiers.forEach(ctx => {
                const row = MODELS_DATA.find(d => d.model === model && d.pdfs === pdf && d.context === ctx);
                if (row) {
                    const cost = row.costPerUser * state.users;
                    const ratio = maxCost > minCost ? (cost - minCost) / (maxCost - minCost) : 0;
                    const cellColor = getHeatmapColor(ratio);
                    bodyHtml += `<td><span class="hm-cell" style="background:${cellColor}">${fmtCurrencyPrecise(cost)}</span></td>`;
                } else {
                    bodyHtml += '<td>—</td>';
                }
            });
        });
        bodyHtml += '</tr>';
    });
    bodyHtml += '</tbody>';

    els.heatmapTable.innerHTML = headerHtml + bodyHtml;
}

function getHeatmapColor(ratio) {
    // Green → Yellow → Red
    if (ratio <= 0.5) {
        const t = ratio * 2;
        const r = Math.round(16 + t * (245 - 16));
        const g = Math.round(185 + t * (158 - 185));
        const b = Math.round(129 + t * (11 - 129));
        return `rgba(${r},${g},${b},0.2)`;
    } else {
        const t = (ratio - 0.5) * 2;
        const r = Math.round(245 + t * (244 - 245));
        const g = Math.round(158 + t * (63 - 158));
        const b = Math.round(11 + t * (94 - 11));
        return `rgba(${r},${g},${b},0.25)`;
    }
}

// ─── Start ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
