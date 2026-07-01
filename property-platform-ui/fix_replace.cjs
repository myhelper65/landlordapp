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

        const badString1 = "(import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || 'http://localhost:8080'}')";
        const goodString1 = "(import.meta.env.VITE_API_URL || 'http://localhost:8080')";
        
        while (content.includes(badString1)) {
            content = content.replace(badString1, goodString1);
            modified = true;
        }

        const badString2 = "'${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1'";
        const goodString2 = "`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`";
        
        while (content.includes(badString2)) {
            content = content.replace(badString2, goodString2);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(f, content);
            console.log(`Fixed ${f}`);
        }
    }
});
