import fs from 'fs';
import path from 'path';

function walkPath(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkPath(dirPath, callback);
        } else if (dirPath.endsWith('.jsx') || dirPath.endsWith('.js') || dirPath.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    walkPath(dir, (filePath) => {
        let content = fs.readFileSync(filePath, 'utf-8');

        let newContent = content.replace(/rounded-(md|lg|xl|2xl|3xl|full)/g, 'rounded-sm');
        newContent = newContent.replace(/bg-dark-([0-9]+)/g, 'bg-base-$1');
        newContent = newContent.replace(/border-white\/[0-9]+/g, 'border-base-800');
        newContent = newContent.replace(/border-white\/[0-9]+\b/g, 'border-base-800');
        newContent = newContent.replace(/shadow-(md|lg|xl|2xl)/g, 'shadow-sm');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log('Updated', filePath);
        }
    });
}

const frontendSrc = 'c:\\Users\\mohan\\Documents\\Projects\\fotx studios\\ReelVerse\\frontend\\src';
const adminFrontendSrc = 'c:\\Users\\mohan\\Documents\\Projects\\fotx studios\\ReelVerse\\admin-frontend\\src';

processDir(frontendSrc);
processDir(adminFrontendSrc);

console.log('Done replacing tokens.');
