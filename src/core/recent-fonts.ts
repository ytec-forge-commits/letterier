export function addRecentFont(recent:string[],name:string){return [name,...recent.filter(n=>n!==name)].slice(0,5);}
