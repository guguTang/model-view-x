export function NameFromLine(line: string, startIndex: number, commentChar: string): string {
	let name = line.substring(startIndex);
	let commentStart = name.indexOf(commentChar);
	if (commentStart !== -1) {
		name = name.substring(0, commentStart);
	}
	return name.trim();
}

export function ReadLines(str: string, onLine: (str:string)=>void) {
	function LineFound(line: string, onLine: (str:string)=>void) {
		let trimmed = line.trim ();
		if (trimmed.length > 0) {
			onLine(trimmed);
		}
	}

	let cursor = 0;
	let next = str.indexOf ('\n', cursor);
	while (next !== -1) {
		LineFound (str.substring (cursor, next), onLine);
		cursor = next + 1;
		next = str.indexOf ('\n', cursor);
	}
	LineFound (str.substring (cursor), onLine);
}

export function ParametersFromLine(line: string, commentChar: string): Array<string> {
	if (commentChar !== null) {
		let commentStart = line.indexOf(commentChar);
		if (commentStart !== -1) {
			line = line.substring (0, commentStart).trim ();
		}
	}
	return line.split(/\s+/u);
}