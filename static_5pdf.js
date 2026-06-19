const fs = require('fs');

try {
    let app = fs.readFileSync('app.js', 'utf8');

    // 1. Remove the dynamic push block
    const dynamicBlockRegex = /\/\/ --- Dynamically generate 5 PDF tier based on 10 PDF tier ---[\s\S]*?MODELS_DATA\.push\(\.\.\.models5Pdf\);\r?\n/g;
    app = app.replace(dynamicBlockRegex, '');

    // 2. We will find every block of 10 PDFs and inject the 5 PDFs manually.
    // The pattern is:
    // { model: '...', pdfs: 10, context: 'Conservative (8k+8k)', inputTokens: 80000, outputTokens: 80000, totalTokens: 160000, costPerPdf: 0.01, costPerUser: 0.07 },
    
    // We can just iterate and build the new string.
    const lines = app.split('\n');
    let newLines = [];
    
    let lastModel10s = [];

    for (let i = 0; i < lines.length; i++) {
        newLines.push(lines[i]);
        
        // If this line is a 10 PDF line, save its parsed data to generate 5 PDF line
        if (lines[i].includes("pdfs: 10")) {
            lastModel10s.push(lines[i]);
        }
        
        // If this is the last 10 PDF line for a model (Conservative)
        if (lines[i].includes("pdfs: 10") && lines[i].includes("Conservative")) {
            // Generate 5 PDF lines
            for (const line10 of lastModel10s) {
                // Parse it out using simple regex
                // { model: 'Model A 30B', pdfs: 10, context: 'Aggressive (64k+64k)', inputTokens: 640000, outputTokens: 640000, totalTokens: 1280000, costPerPdf: 0.02, costPerUser: 0.19 },
                const match = line10.match(/\{ model: '(.*?)', pdfs: 10, context: '(.*?)', inputTokens: (\d+), outputTokens: (\d+), totalTokens: (\d+), costPerPdf: ([\d\.]+), costPerUser: ([\d\.]+) \},/);
                if (match) {
                    const model = match[1];
                    const context = match[2];
                    const inputTokens = parseInt(match[3]) / 2;
                    const outputTokens = parseInt(match[4]) / 2;
                    const totalTokens = parseInt(match[5]) / 2;
                    const costPerPdf = parseFloat(match[6]); // Same
                    const costPerUser = (parseFloat(match[7]) / 2).toFixed(2);
                    
                    const line5 = `    { model: '${model}', pdfs: 5, context: '${context}', inputTokens: ${inputTokens}, outputTokens: ${outputTokens}, totalTokens: ${totalTokens}, costPerPdf: ${costPerPdf}, costPerUser: ${costPerUser} },`;
                    newLines.push(line5);
                }
            }
            lastModel10s = []; // reset for next model
        }
    }

    // Also update the CSV export just in case to make sure it's sorted, though static fixes it.
    // Actually static fixes it perfectly so no need to sort.

    fs.writeFileSync('app.js', newLines.join('\n'));
    console.log('Static 5 PDF logic injected perfectly.');
} catch(e) {
    console.error(e);
}
