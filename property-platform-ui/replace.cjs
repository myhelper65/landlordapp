const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
};

const files = walk('./src');
files.forEach(f => {
    if (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')) {
        let content = fs.readFileSync(f, 'utf8');
        let modified = false;

        // Replace literal string 'http://localhost:8080'
        if (content.includes("'http://localhost:8080'")) {
            content = content.replace(/'http:\/\/localhost:8080'/g, "(import.meta.env.VITE_API_URL || 'http://localhost:8080')");
            modified = true;
        }
        if (content.includes('"http://localhost:8080"')) {
            content = content.replace(/"http:\/\/localhost:8080"/g, "(import.meta.env.VITE_API_URL || 'http://localhost:8080')");
            modified = true;
        }
        
        // Replace base URL in backticks: `http://localhost:8080/api/...`
        if (content.includes('http://localhost:8080')) {
            content = content.replace(/http:\/\/localhost:8080/g, "${import.meta.env.VITE_API_URL || 'http://localhost:8080'}");
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(f, content);
            console.log(`Updated ${f}`);
        }
    }
});
