const API_BASE_URL = "http://localhost:8081";
const TOKEN_KEY = "qm_jwt_token";

const conversionMap = {
  meterToFeet: {
    factor: 3.28084,
    from: "m",
    to: "ft",
    name: "Meter to Feet",
  },
  feetToMeter: {
    factor: 0.3048,
    from: "ft",
    to: "m",
    name: "Feet to Meter",
  },
  kgToPounds: {
    factor: 2.20462,
    from: "kg",
    to: "lb",
    name: "Kg to Pounds",
  },
  poundsToKg: {
    factor: 0.453592,
    from: "lb",
    to: "kg",
    name: "Pounds to Kg",
  },
  literToGallon: {
    factor: 0.264172,
    from: "L",
    to: "gal",
    name: "Liter to Gallon",
  },
  gallonToLiter: {
    factor: 3.78541,
    from: "gal",
    to: "L",
    name: "Gallon to Liter",
  },
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, { method = "GET", body, requiresAuth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(requiresAuth ? getAuthHeaders() : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  const data = raw ? tryParseJson(raw) : null;

  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function registerUser(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: payload,
  });
}

async function loginUser(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
}

// Optional protected endpoint for conversion when backend support exists.
async function convertQuantityApi(payload) {
  return apiRequest("/convert", {
    method: "POST",
    body: payload,
    requiresAuth: true,
  });
}

function showMessage(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error");
  if (type) {
    element.classList.add(type);
  }
}

function extractToken(responseData) {
  return responseData?.token || responseData?.accessToken || responseData?.jwt || "";
}

function redirectTo(path) {
  globalThis.location.href = path;
}

function ensureAuthenticated() {
  if (!getToken()) {
    redirectTo("index.html");
  }
}

function handleRegisterPage() {
  const form = document.getElementById("registerForm");
  const messageEl = document.getElementById("registerMessage");

  if (!form) return;

  if (getToken()) {
    redirectTo("dashboard.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showMessage(messageEl, "Please provide email and password.", "error");
      return;
    }

    try {
      showMessage(messageEl, "Creating your account...");
      await registerUser({ email, password });
      showMessage(messageEl, "Registration successful. Redirecting to login...", "success");
      setTimeout(() => redirectTo("index.html"), 900);
    } catch (error) {
      showMessage(messageEl, error.message || "Registration failed.", "error");
    }
  });
}

function handleLoginPage() {
  const form = document.getElementById("loginForm");
  const messageEl = document.getElementById("loginMessage");

  if (!form) return;

  if (getToken()) {
    redirectTo("dashboard.html");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showMessage(messageEl, "Please provide email and password.", "error");
      return;
    }

    try {
      showMessage(messageEl, "Signing in...");
      const response = await loginUser({ email, password });
      const token = extractToken(response);

      if (!token) {
        throw new Error("Login succeeded but token was not returned by API.");
      }

      setToken(token);
      showMessage(messageEl, "Login successful. Redirecting...", "success");
      setTimeout(() => redirectTo("dashboard.html"), 500);
    } catch (error) {
      showMessage(messageEl, error.message || "Login failed.", "error");
    }
  });
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 6,
  });
}

function convertQuantity(type, inputValue) {
  const rule = conversionMap[type];

  if (!rule) {
    throw new Error("Invalid conversion type selected.");
  }

  const converted = inputValue * rule.factor;

  return {
    name: rule.name,
    from: rule.from,
    to: rule.to,
    input: inputValue,
    output: converted,
  };
}

function renderResult(result) {
  const resultCard = document.getElementById("resultCard");
  if (!resultCard) return;

  resultCard.innerHTML = `
    <div>
      <p class="result-main">${formatNumber(result.input)} ${result.from} = ${formatNumber(result.output)} ${result.to}</p>
      <p class="result-sub">Conversion type: ${result.name}</p>
    </div>
  `;
}

function handleDashboardPage() {
  ensureAuthenticated();

  const convertForm = document.getElementById("convertForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const convertMessageEl = document.getElementById("convertMessage");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearToken();
      redirectTo("index.html");
    });
  }

  if (!convertForm) return;

  convertForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const type = convertForm.type.value;
    const value = Number.parseFloat(convertForm.value.value);

    if (Number.isNaN(value)) {
      showMessage(convertMessageEl, "Please enter a valid numeric value.", "error");
      return;
    }

    try {
      showMessage(convertMessageEl, "Converting...", "");

      let result;
      try {
        const apiResult = await convertQuantityApi({ type, value });
        result = {
          name: apiResult?.name || conversionMap[type]?.name || type,
          from: apiResult?.from || conversionMap[type]?.from || "",
          to: apiResult?.to || conversionMap[type]?.to || "",
          input: Number(apiResult?.input ?? value),
          output: Number(apiResult?.output),
        };

        if (Number.isNaN(result.output)) {
          throw new TypeError("Conversion output is invalid.");
        }
      } catch {
        // Local fallback keeps dashboard functional if conversion API is unavailable.
        result = convertQuantity(type, value);
      }

      renderResult(result);
      showMessage(convertMessageEl, "Conversion completed.", "success");
    } catch (error) {
      showMessage(convertMessageEl, error.message || "Conversion failed.", "error");
    }
  });
}

function init() {
  const page = document.body.dataset.page;

  if (page === "register") {
    handleRegisterPage();
    return;
  }

  if (page === "login") {
    handleLoginPage();
    return;
  }

  if (page === "dashboard") {
    handleDashboardPage();
  }
}

document.addEventListener("DOMContentLoaded", init);
