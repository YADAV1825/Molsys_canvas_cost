const fs = require('fs');

try {
    let app = fs.readFileSync('app.js', 'utf8');

    // 1. Add 5 PDFs to PDF_TIERS
    app = app.replace('const PDF_TIERS = [50, 30, 15, 10];', 'const PDF_TIERS = [50, 30, 15, 10, 5];');

    // 2. Dynamically add 5 PDF scenarios
    const dynamicAddStr = `];

// --- Dynamically generate 5 PDF tier based on 10 PDF tier ---
const models5Pdf = MODELS_DATA.filter(d => d.pdfs === 10).map(d => ({
    ...d,
    pdfs: 5,
    inputTokens: d.inputTokens / 2,
    outputTokens: d.outputTokens / 2,
    totalTokens: d.totalTokens / 2,
    costPerUser: Number((d.costPerUser / 2).toFixed(2))
}));
MODELS_DATA.push(...models5Pdf);
`;
    app = app.replace(/];\s*const MODEL_NAMES/, dynamicAddStr + '\nconst MODEL_NAMES');

    // 3. Add btnDownloadCsv to els
    app = app.replace("tableCount: document.getElementById('table-count'),", "tableCount: document.getElementById('table-count'),\n    btnDownloadCsv: document.getElementById('btn-download-csv'),");

    // 4. Add Event Listener for CSV export
    const exportEvt = `
    if (els.btnDownloadCsv) {
        els.btnDownloadCsv.addEventListener('click', () => {
            let csvContent = "Model,PDFs/User,Context Tier,Input Tokens,Output Tokens,Total Tokens,Cost/PDF,Cost/User/Mo,Monthly Total,Annual Total\\n";
            
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
                csvContent += rowArr.join(",") + "\\n";
            });
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", \`molsys_cost_simulation_\${state.users}_users.csv\`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
`;
    app = app.replace('function bindEvents() {', 'function bindEvents() {' + exportEvt);

    fs.writeFileSync('app.js', app);

    let html = fs.readFileSync('index.html', 'utf8');

    // 1. Add 5 PDFs option
    html = html.replace('<option value="10">10 PDFs</option>', '<option value="10">10 PDFs</option>\n                            <option value="5">5 PDFs</option>');

    // 2. Add Export CSV button
    const newTableActions = `<div class="table-actions" style="display: flex; align-items: center;">
                        <button id="btn-download-csv" class="btn-reset" style="margin-right: 16px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); padding: 6px 12px; border-radius: 6px; color: #f0f1f5; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 11v3H2v-3M8 3v8M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            Export CSV
                        </button>
                        <span class="table-count" id="table-count">0 scenarios</span>
                    </div>`;

    html = html.replace(/<div class="table-actions">[\s\S]*?<span class="table-count" id="table-count">.*?<\/span>\s*<\/div>/, newTableActions);

    fs.writeFileSync('index.html', html);
    console.log('Update completed successfully.');
} catch (e) {
    console.error(e);
}
