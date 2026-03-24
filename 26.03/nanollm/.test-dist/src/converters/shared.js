export function fail(message) {
    throw new Error(message);
}
export function text(textValue) {
    return { type: "text", text: textValue };
}
export function refusal(textValue) {
    return { type: "refusal", text: textValue };
}
export function collapseText(parts) {
    return parts
        .map((part) => {
        if (part.type === "text" || part.type === "refusal") {
            return part.text;
        }
        fail(`Cannot collapse "${part.type}" to text`);
    })
        .join("\n");
}
export function requireTextOnly(parts, context) {
    for (const part of parts) {
        if (part.type !== "text" && part.type !== "refusal") {
            fail(`${context} only supports text content`);
        }
    }
    return parts;
}
export function parseJson(textValue, context) {
    try {
        return JSON.parse(textValue);
    }
    catch {
        fail(`${context} contains invalid JSON`);
    }
}
export function stringifyJson(value) {
    return typeof value === "string" ? value : JSON.stringify(value);
}
export function makeDataUrl(mediaType, data) {
    return `data:${mediaType};base64,${data}`;
}
export function parseDataUrl(url) {
    const match = url.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        return null;
    }
    return {
        mediaType: match[1],
        data: match[2],
    };
}
