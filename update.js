const fs = require('fs');

try {
    let app = fs.readFileSync('app.js', 'utf8');

    // Models
    app = app.replace(/'Nemotron Nano 3 30B'/g, "'30B'");
    app = app.replace(/'Nemotron 3 Super 120B'/g, "'120B'");
    app = app.replace(/'Gemma 3 4B IT'/g, "'4B'");
    app = app.replace(/'Gemma 3 12B IT'/g, "'12B'");
    app = app.replace(/'Gemma 3 27B IT'/g, "'27B'");
    app = app.replace(/'GPT-oss-20b'/g, "'20B'");
    app = app.replace(/'Llama 4 Scout 110B MoE'/g, "'110B MoE'");

    // Context windows
    app = app.replace(/'Aggressive \(64k\)'/g, "'Aggressive (64k+64k)'");
    app = app.replace(/'Above Avg \(32k\)'/g, "'Above Avg (32k+32k)'");
    app = app.replace(/'Average \(16k\)'/g, "'Average (16k+16k)'");
    app = app.replace(/'Conservative \(8k\)'/g, "'Conservative (8k+8k)'");

    // Slider range logic & chart data
    app = app.replace(/Math\.min\(50000/g, "Math.min(10000000");
    app = app.replace(/const userSteps = \[.*?\];/g, "const userSteps = [100, 10000, 50000, 100000, 500000, 1000000, 2500000, 5000000, 7500000, 10000000];");

    fs.writeFileSync('app.js', app);

    let html = fs.readFileSync('index.html', 'utf8');

    // Remove model section visible display
    html = html.replace('<!-- Model Selection -->\r\n                <div class="control-group">', '<!-- Model Selection -->\r\n                <div class="control-group" style="display: none;">');
    html = html.replace('<!-- Model Selection -->\n                <div class="control-group">', '<!-- Model Selection -->\n                <div class="control-group" style="display: none;">');

    // Update Slider limits
    html = html.replace(/max="50000"/g, 'max="10000000"');

    // Update Marks
    const oldMarks = `<div class="slider-marks">
                        <span>100</span>
                        <span>10K</span>
                        <span>25K</span>
                        <span>50K</span>
                    </div>`;
    const oldMarksRN = `<div class="slider-marks">\r\n                        <span>100</span>\r\n                        <span>10K</span>\r\n                        <span>25K</span>\r\n                        <span>50K</span>\r\n                    </div>`;

    const newMarks = `<div class="slider-marks">
                        <span>100</span>
                        <span>1M</span>
                        <span>5M</span>
                        <span>10M</span>
                    </div>`;
    html = html.replace(oldMarks, newMarks);
    html = html.replace(oldMarksRN, newMarks);

    // Update Text labels for Context
    html = html.replace(/"Aggressive \(64k\)"/g, '"Aggressive (64k+64k)"');
    html = html.replace(/>Aggressive \(64k\)</g, '>Aggressive (64k+64k)<');
    html = html.replace(/"Above Avg \(32k\)"/g, '"Above Avg (32k+32k)"');
    html = html.replace(/>Above Avg \(32k\)</g, '>Above Avg (32k+32k)<');
    html = html.replace(/"Average \(16k\)"/g, '"Average (16k+16k)"');
    html = html.replace(/>Average \(16k\)</g, '>Average (16k+16k)<');
    html = html.replace(/"Conservative \(8k\)"/g, '"Conservative (8k+8k)"');
    html = html.replace(/>Conservative \(8k\)</g, '>Conservative (8k+8k)<');

    // Update PDF text
    html = html.replace('PDFs / User / Month', 'PDFs / User / Month <span style="font-size: 0.75em; opacity: 0.75; font-weight: 400; margin-left: 4px;">(Assumes 50 pages/PDF)</span>');

    // Update Chart Description
    html = html.replace('from 100 to 50K users', 'from 100 to 10M users');

    fs.writeFileSync('index.html', html);
    console.log('Update completed successfully.');
} catch (e) {
    console.error(e);
}
