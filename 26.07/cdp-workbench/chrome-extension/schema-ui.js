export async function loadMethodCatalog(protocolUrl = "protocol.json") {
  const response = await fetch(protocolUrl);
  if (!response.ok) throw new Error(`加载协议文件失败：HTTP ${response.status}`);
  const protocol = await response.json();
  const typeIndex = new Map();

  for (const domain of protocol.domains) {
    for (const type of domain.types ?? []) {
      typeIndex.set(`${domain.domain}.${type.id}`, type);
    }
  }

  const methods = protocol.domains.flatMap((domain) =>
    (domain.commands ?? []).map((command) => ({
      domain: domain.domain,
      name: command.name,
      method: `${domain.domain}.${command.name}`,
      description: command.description ?? "该方法没有提供描述。",
      parameters: command.parameters ?? [],
      returns: command.returns ?? [],
      experimental: Boolean(command.experimental || domain.experimental),
    })),
  );

  methods.sort((a, b) => a.method.localeCompare(b.method));
  return { protocol, methods, typeIndex };
}

function exampleFromSchema(schema, domain, typeIndex, seen, depth) {
  if (!schema || depth > 3) return {};
  if (schema.enum?.length) return schema.enum[0];

  if (schema.$ref) {
    const qualified = schema.$ref.includes(".") ? schema.$ref : `${domain}.${schema.$ref}`;
    if (seen.has(qualified)) return {};
    const resolved = typeIndex.get(qualified);
    if (!resolved) return `String`;
    return exampleFromSchema(resolved, qualified.split(".")[0], typeIndex, new Set([...seen, qualified]), depth + 1);
  }

  switch (schema.type) {
    case "string": return schema.name?.toLowerCase().includes("url") ? "https://example.com" : "String";
    case "integer": return 0;
    case "number": return 0;
    case "boolean": return false;
    case "array": return [];
    case "object": {
      const result = {};
      for (const property of schema.properties ?? []) {
        if (!property.optional) {
          result[property.name] = exampleFromSchema(property, domain, typeIndex, seen, depth + 1);
        }
      }
      return result;
    }
    default: return {};
  }
}

export function createParamsExample(method, typeIndex) {
  const result = {};
  for (const parameter of method.parameters) {
    if (!parameter.optional) {
      result[parameter.name] = exampleFromSchema(parameter, method.domain, typeIndex, new Set(), 0);
    }
  }
  return result;
}

export function setupMethodPicker({ methods, typeIndex, input, list, description, params, count }) {
  let selected = null;

  function select(method) {
    selected = method;
    input.value = method.method;
    input.setAttribute("aria-expanded", "false");
    list.hidden = true;
    description.textContent = `${method.experimental ? "[Experimental] " : ""}${method.description}`;
    params.value = JSON.stringify(createParamsExample(method, typeIndex), null, 2);
  }

  function render(query = "") {
    const normalized = query.trim().toLowerCase();
    const matches = methods
      .filter((item) => item.method.toLowerCase().includes(normalized))
      .slice(0, 80);

    list.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "method-empty";
      empty.textContent = "没有匹配的方法";
      list.append(empty);
    } else {
      for (const method of matches) {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "method-option";
        option.role = "option";
        option.textContent = method.method;
        option.setAttribute("aria-selected", String(selected?.method === method.method));
        option.addEventListener("mousedown", (event) => {
          event.preventDefault();
          select(method);
        });
        list.append(option);
      }
    }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    count.textContent = `${methods.length} 个可用 method`;
  }

  input.addEventListener("focus", () => {
    input.select();
    render(input.value);
  });
  input.addEventListener("input", () => {
    selected = null;
    render(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
    if (event.key === "Enter") {
      const exact = methods.find((item) => item.method === input.value.trim());
      if (exact) {
        event.preventDefault();
        select(exact);
      }
    }
  });
  input.addEventListener("blur", () => setTimeout(() => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
  }, 100));

  return {
    getSelected() {
      return selected ?? methods.find((item) => item.method === input.value.trim()) ?? null;
    },
    select,
  };
}

export function showResult(element, value, state = "success") {
  element.dataset.state = state;
  element.textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
}
