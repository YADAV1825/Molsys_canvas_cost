const fs = require('fs');

try {
    let app = fs.readFileSync('app.js', 'utf8');

    // Remove the unused models from MODEL_COLORS to prevent conflicts
    app = app.replace(/    'Model C 4B': \{.*?\},?\r?\n/g, '');
    app = app.replace(/    'Model E 27B': \{.*?\},?\r?\n/g, '');

    // Now safely rename the existing models
    app = app.replace(/'Model D 12B'/g, "'Model C 12B'");
    app = app.replace(/'Model F 20B'/g, "'Model D 20B'");
    app = app.replace(/'Model G 110B MoE'/g, "'Model E 110B MoE'");

    fs.writeFileSync('app.js', app);
    console.log('Model names re-ordered to A, B, C, D, E.');
} catch (e) {
    console.error(e);
}
