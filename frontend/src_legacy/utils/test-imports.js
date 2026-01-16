// Testez si vos imports fonctionnent
import * as allUtils from './index.js';

console.log('Utils disponibles:', Object.keys(allUtils));
console.log('formatters:', typeof allUtils.formatters);
console.log('helpers:', typeof allUtils.helpers);