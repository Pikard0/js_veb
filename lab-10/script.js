const STORAGE_KEYS = {
      user: "lab10:user",
      selected: "lab10:selectedFriends",
      cachedUsers: "lab10:cachedUsers"
    };

    const PAGE_SIZE = 30;
    const API_URL = "https://randomuser.me/api/?results=30&nat=us,gb,ca,au,fr,de,es,nl&seed=lab10-friends&inc=login,name,email,phone,location,dob,registered,picture";
    const cityOptions = {
      ukraine: [
        { value: "kyiv", label: "Київ" },
        { value: "lviv", label: "Львів" },
        { value: "odesa", label: "Одеса" },
        { value: "kharkiv", label: "Харків" }
      ],
      poland: [
        { value: "warsaw", label: "Варшава" },
        { value: "krakow", label: "Краків" },
        { value: "gdansk", label: "Гданськ" }
      ],
      germany: [
        { value: "berlin", label: "Берлін" },
        { value: "munich", label: "Мюнхен" },
        { value: "hamburg", label: "Гамбург" }
      ]
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^\+380(39|50|63|66|67|68|73|91|92|93|94|95|96|97|98|99)\d{7}$/;

    const state = {
      user: null,
      authMode: "login",
      friends: [],
      selectedIds: new Set(),
      filters: {
        query: "",
        sort: "name-asc",
        minAge: "",
        maxAge: "",
        birthYear: "",
        location: "",
        email: "",
        selectedOnly: false,
        page: 1
      },
      apiPage: 1,
      isLoading: false,
      reachedEnd: false
    };

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    const elements = {
      authScreen: $("#authScreen"),
      appShell: $("#appShell"),
      authForms: $$(".user-form"),
      statusMessage: $("#status-message"),
      countrySelect: $("#country"),
      citySelect: $("#city"),
      currentUser: $("#currentUser"),
      logoutButton: $("#logoutButton"),
      searchInput: $("#searchInput"),
      sortSelect: $("#sortSelect"),
      minAgeInput: $("#minAgeInput"),
      maxAgeInput: $("#maxAgeInput"),
      birthYearInput: $("#birthYearInput"),
      locationInput: $("#locationInput"),
      emailInput: $("#emailInput"),
      selectedOnlyButton: $("#selectedOnlyButton"),
      clearFiltersButton: $("#clearFiltersButton"),
      reloadButton: $("#reloadButton"),
      totalCount: $("#totalCount"),
      visibleCount: $("#visibleCount"),
      selectedCount: $("#selectedCount"),
      activeFilters: $("#activeFilters"),
      activePages: $("#activePages"),
      cards: $("#cards"),
      pagination: $("#pagination"),
      loader: $("#loader"),
      messageBox: $("#messageBox"),
      sentinel: $("#sentinel"),
      toast: $("#toast")
    };

    const safeJsonParse = (value, fallback) => {
      try {
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    };

    const normalize = (value) => String(value || "").trim().toLowerCase();

    const fullName = (friend) => `${friend.name.first} ${friend.name.last}`;

    const friendId = (friend) => friend.login.uuid;

    const birthYear = (friend) => new Date(friend.dob.date).getFullYear();

    const registeredDate = (friend) => new Date(friend.registered.date);

    const locationText = (friend) => `${friend.location.city}, ${friend.location.country}`;

    const friendSearchBlob = (friend) => [
      fullName(friend),
      friend.email,
      friend.phone,
      friend.location.city,
      friend.location.state,
      friend.location.country,
      friend.dob.age,
      birthYear(friend)
    ].join(" ").toLowerCase();

    const uniqueById = (friends) => {
      const map = new Map();
      friends.forEach((friend) => map.set(friendId(friend), friend));
      return Array.from(map.values());
    };

    const getStoredUser = () => safeJsonParse(localStorage.getItem(STORAGE_KEYS.user), null);

    const getStoredSelectedIds = () => new Set(safeJsonParse(localStorage.getItem(STORAGE_KEYS.selected), []));

    const getCachedFriends = () => safeJsonParse(localStorage.getItem(STORAGE_KEYS.cachedUsers), []);

    const saveSelectedIds = (ids) => localStorage.setItem(STORAGE_KEYS.selected, JSON.stringify(Array.from(ids)));

    const saveCachedFriends = (friends) => localStorage.setItem(STORAGE_KEYS.cachedUsers, JSON.stringify(friends.slice(0, 240)));

    const debounce = (fn, delay = 350) => {
      let timerId;
      return (...args) => {
        window.clearTimeout(timerId);
        timerId = window.setTimeout(() => fn(...args), delay);
      };
    };

    const buildApiUrl = (page) => `${API_URL}&page=${page}`;

    const parseFiltersFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      return {
        query: params.get("q") || "",
        sort: params.get("sort") || "name-asc",
        minAge: params.get("minAge") || "",
        maxAge: params.get("maxAge") || "",
        birthYear: params.get("birthYear") || "",
        location: params.get("location") || "",
        email: params.get("email") || "",
        selectedOnly: params.get("selected") === "1",
        page: Math.max(1, Number(params.get("page")) || 1)
      };
    };

    const writeFiltersToUrl = () => {
      const params = new URLSearchParams();
      const entries = Object.entries(state.filters);

      entries.forEach(([key, value]) => {
        if (value === "" || value === false || value === null) return;
        if (key === "page" && Number(value) === 1) return;
        if (key === "query") params.set("q", value);
        else if (key === "selectedOnly") params.set("selected", "1");
        else params.set(key, value);
      });

      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.pushState({ filters: state.filters }, "", nextUrl);
    };

    const setFormFromState = () => {
      elements.searchInput.value = state.filters.query;
      elements.sortSelect.value = state.filters.sort;
      elements.minAgeInput.value = state.filters.minAge;
      elements.maxAgeInput.value = state.filters.maxAge;
      elements.birthYearInput.value = state.filters.birthYear;
      elements.locationInput.value = state.filters.location;
      elements.emailInput.value = state.filters.email;
      elements.selectedOnlyButton.classList.toggle("active", state.filters.selectedOnly);
    };

    const sorters = {
      "name-asc": (a, b) => fullName(a).localeCompare(fullName(b)),
      "name-desc": (a, b) => fullName(b).localeCompare(fullName(a)),
      "age-asc": (a, b) => a.dob.age - b.dob.age,
      "age-desc": (a, b) => b.dob.age - a.dob.age,
      "registered-asc": (a, b) => registeredDate(a) - registeredDate(b),
      "registered-desc": (a, b) => registeredDate(b) - registeredDate(a)
    };

    const applyFilters = (friends, filters, selectedIds) => {
      const query = normalize(filters.query);
      const location = normalize(filters.location);
      const email = normalize(filters.email);
      const minAge = Number(filters.minAge) || 0;
      const maxAge = Number(filters.maxAge) || Infinity;
      const year = Number(filters.birthYear) || null;

      return friends
        .filter((friend) => !query || friendSearchBlob(friend).includes(query))
        .filter((friend) => friend.dob.age >= minAge && friend.dob.age <= maxAge)
        .filter((friend) => !year || birthYear(friend) === year)
        .filter((friend) => !location || normalize(locationText(friend)).includes(location))
        .filter((friend) => !email || normalize(friend.email).includes(email))
        .filter((friend) => !filters.selectedOnly || selectedIds.has(friendId(friend)))
        .sort(sorters[filters.sort] || sorters["name-asc"]);
    };

    const visibleFriends = () => applyFilters(state.friends, state.filters, state.selectedIds);

    const pageCountFor = (friends) => Math.max(1, Math.ceil(friends.length / PAGE_SIZE));

    const currentPageFriends = (friends) => {
      const page = Math.min(state.filters.page, pageCountFor(friends));
      const start = (page - 1) * PAGE_SIZE;
      return friends.slice(start, start + PAGE_SIZE);
    };

    const iconHeart = (selected) => `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path ${selected ? 'fill="currentColor"' : ""} d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>
      </svg>
    `;

    const formatDate = (dateString) => new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date(dateString));

    const createFriendCard = (friend) => {
      const id = friendId(friend);
      const selected = state.selectedIds.has(id);
      const article = document.createElement("article");
      article.className = `friend-card${selected ? " selected" : ""}`;
      article.dataset.friendId = id;

      article.innerHTML = `
        <img class="photo" src="${friend.picture.large}" alt="${fullName(friend)}" loading="lazy">
        <div class="friend-main">
          <h2>${fullName(friend)}</h2>
          <p>${friend.email}</p>
          <p>${friend.phone}</p>
          <p>${locationText(friend)}</p>
        </div>
        <button class="icon-button${selected ? " selected" : ""}" type="button" data-select="${id}" title="${selected ? "Прибрати з обраних" : "Додати в обрані"}" aria-label="${selected ? "Прибрати з обраних" : "Додати в обрані"}">
          ${iconHeart(selected)}
        </button>
        <div class="badges">
          <span class="badge mint">${friend.dob.age} років</span>
          <span class="badge">${birthYear(friend)} р. н.</span>
          <span class="badge">реєстрація ${formatDate(friend.registered.date)}</span>
        </div>
      `;

      return article;
    };

    const renderMessage = (type, text) => {
      elements.messageBox.innerHTML = text ? `<div class="${type}">${text}</div>` : "";
    };

    const renderCards = () => {
      const filtered = visibleFriends();
      const totalPages = pageCountFor(filtered);

      if (state.filters.page > totalPages) {
        state.filters.page = totalPages;
        writeFiltersToUrl();
      }

      elements.cards.replaceChildren(...currentPageFriends(filtered).map(createFriendCard));
      elements.visibleCount.textContent = filtered.length;
      elements.totalCount.textContent = state.friends.length;
      elements.selectedCount.textContent = state.selectedIds.size;
      elements.selectedOnlyButton.classList.toggle("active", state.filters.selectedOnly);

      if (!state.isLoading && filtered.length === 0) {
        renderMessage("empty", "Нічого не знайдено. Змініть пошук або очистіть фільтри.");
      } else {
        renderMessage("", "");
      }

      renderPagination(filtered);
      renderFilterSummary(filtered);
    };

    const renderPagination = (filtered) => {
      const totalPages = pageCountFor(filtered);
      const current = Math.min(state.filters.page, totalPages);
      const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter((page) => page === 1 || page === totalPages || Math.abs(page - current) <= 2);
      const uniquePages = [...new Set(pageNumbers)];

      const buttons = [
        createPageButton("Назад", Math.max(1, current - 1), current === 1),
        ...uniquePages.map((page, index) => {
          const fragment = document.createDocumentFragment();
          if (index > 0 && page - uniquePages[index - 1] > 1) {
            const gap = document.createElement("span");
            gap.className = "badge";
            gap.textContent = "...";
            fragment.append(gap);
          }
          fragment.append(createPageButton(String(page), page, false, page === current));
          return fragment;
        }),
        createPageButton("Вперед", Math.min(totalPages, current + 1), current === totalPages)
      ];

      elements.pagination.replaceChildren(...buttons);
    };

    const createPageButton = (label, page, disabled, active = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `page-button${active ? " active" : ""}`;
      button.disabled = disabled;
      button.textContent = label;
      button.dataset.page = page;
      return button;
    };

    const renderFilterSummary = (filtered) => {
      const filters = [];
      if (state.filters.query) filters.push(`пошук: "${state.filters.query}"`);
      if (state.filters.minAge) filters.push(`від ${state.filters.minAge} років`);
      if (state.filters.maxAge) filters.push(`до ${state.filters.maxAge} років`);
      if (state.filters.birthYear) filters.push(`рік: ${state.filters.birthYear}`);
      if (state.filters.location) filters.push(`локація: ${state.filters.location}`);
      if (state.filters.email) filters.push(`email: ${state.filters.email}`);
      if (state.filters.selectedOnly) filters.push("тільки обрані");

      const totalPages = pageCountFor(filtered);
      elements.activeFilters.textContent = filters.length ? filters.join(" · ") : "Фільтри не застосовані";
      elements.activePages.textContent = `Сторінка ${Math.min(state.filters.page, totalPages)} з ${totalPages}. Завантажені API-сторінки: 1-${Math.max(1, state.apiPage - 1)}`;
    };

    const showToast = (text) => {
      elements.toast.textContent = text;
      elements.toast.classList.remove("hidden");
      window.setTimeout(() => elements.toast.classList.add("hidden"), 4200);
    };

    const setLoading = (isLoading) => {
      state.isLoading = isLoading;
      elements.loader.classList.toggle("hidden", !isLoading);
      elements.reloadButton.disabled = isLoading;
    };

    const fetchFriends = async ({ reset = false } = {}) => {
      if (state.isLoading || state.reachedEnd) return;
      setLoading(true);
      renderMessage("", "");

      try {
        const page = reset ? 1 : state.apiPage;
        const response = await fetch(buildApiUrl(page));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const nextFriends = reset ? data.results : [...state.friends, ...data.results];
        state.friends = uniqueById(nextFriends);
        state.apiPage = page + 1;
        state.reachedEnd = state.friends.length >= 180;
        saveCachedFriends(state.friends);
      } catch (error) {
        const cached = getCachedFriends();
        if (cached.length && state.friends.length === 0) {
          state.friends = cached;
          state.apiPage = Math.ceil(cached.length / PAGE_SIZE) + 1;
          showToast("Не вдалося отримати нові дані, показано кешованих друзів.");
        } else {
          renderMessage("error", "Помилка запиту до Random User API. Перевірте інтернет-з'єднання та спробуйте оновити дані.");
        }
        console.error(error);
      } finally {
        setLoading(false);
        renderCards();
      }
    };

    const updateFilter = (key, value) => {
      state.filters = { ...state.filters, [key]: value, page: key === "page" ? value : 1 };
      writeFiltersToUrl();
      renderCards();
    };

    const debouncedFilterUpdate = debounce((key, value) => updateFilter(key, value), 320);

    const resetFilters = () => {
      state.filters = {
        query: "",
        sort: "name-asc",
        minAge: "",
        maxAge: "",
        birthYear: "",
        location: "",
        email: "",
        selectedOnly: false,
        page: 1
      };
      setFormFromState();
      writeFiltersToUrl();
      renderCards();
    };

    const toggleSelected = (id) => {
      const next = new Set(state.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      state.selectedIds = next;
      saveSelectedIds(next);
      renderCards();
    };

    const switchTab = (tabName) => {
      $$(".tab-button").forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      elements.authForms.forEach((form) => {
        form.classList.toggle("active", form.dataset.form === tabName);
      });

      elements.statusMessage.textContent = "";
    };

    const createUserFromForm = (form) => {
      const formData = new FormData(form);

      if (form.dataset.form === "register") {
        const firstName = formData.get("firstName").trim();
        const lastName = formData.get("lastName").trim();
        const email = formData.get("email").trim();

        return {
          name: `${firstName} ${lastName}`.trim(),
          email,
          createdAt: new Date().toISOString()
        };
      }

      const username = formData.get("username").trim();

      return {
        name: username,
        email: `${username}@local.lab`,
        createdAt: new Date().toISOString()
      };
    };

    const handleAuthSubmit = (event) => {
      event.preventDefault();

      const form = event.currentTarget;
      const isValid = validateForm(form);

      if (!isValid) {
        elements.statusMessage.textContent = "";
        return;
      }

      const user = createUserFromForm(form);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      state.user = user;
      elements.statusMessage.textContent = form.dataset.form === "register"
        ? "Користувача успішно зареєстровано."
        : "Авторизацію виконано успішно.";
      form.reset();
      resetFormState(form);

      if (form.dataset.form === "register") {
        fillCities("");
      }

      window.setTimeout(showApp, 350);
    };

    const validateForm = (form) => {
      const fields = Array.from(form.elements).filter((element) => {
        return ["INPUT", "SELECT"].includes(element.tagName) && element.type !== "checkbox";
      });

      return fields.map(validateField).every(Boolean);
    };

    const validateField = (input) => {
      if (!input || input.type === "checkbox" || input.type === "button" || input.type === "submit") {
        return true;
      }

      const field = input.closest(".field");

      if (!field) {
        return true;
      }

      const value = input.value.trim();
      let message = "";

      switch (input.name) {
        case "username":
          message = value ? "" : "Введіть username.";
          break;
        case "firstName":
          message = validateLength(value, "First Name");
          break;
        case "lastName":
          message = validateLength(value, "Last Name");
          break;
        case "email":
          if (!value) message = "Введіть email.";
          else if (!emailPattern.test(value)) message = "Email має відповідати шаблону ___@__.__.";
          break;
        case "password":
          if (!value) message = "Введіть пароль.";
          else if (value.length < 6) message = "Пароль має містити не менше 6 символів.";
          break;
        case "confirmPassword":
          if (!value) message = "Підтвердіть пароль.";
          else if (value !== $("#password").value) message = "Паролі повинні збігатися.";
          break;
        case "phone":
          if (!value) message = "Введіть номер телефону.";
          else if (!phonePattern.test(value)) message = "Номер має бути українським мобільним у форматі +380XXXXXXXXX.";
          break;
        case "birthDate":
          message = validateBirthDate(value);
          break;
        case "sex":
          message = $('input[name="sex"]:checked') ? "" : "Оберіть стать.";
          break;
        case "country":
          message = value ? "" : "Оберіть країну.";
          break;
        case "city":
          message = value ? "" : "Оберіть місто.";
          break;
        default:
          message = "";
      }

      setFieldState(field, message);
      return !message;
    };

    const validateLength = (value, fieldName) => {
      if (!value) return `Введіть ${fieldName}.`;
      if (value.length < 3) return `${fieldName} має містити не менше 3 символів.`;
      if (value.length > 15) return `${fieldName} має містити не більше 15 символів.`;
      return "";
    };

    const validateBirthDate = (value) => {
      if (!value) return "Оберіть дату народження.";

      const today = new Date();
      const birthDateValue = new Date(`${value}T00:00:00`);

      if (birthDateValue > today) {
        return "Дата народження не може бути у майбутньому.";
      }

      if (getAge(birthDateValue, today) < 12) {
        return "Користувачу менше 12 років, тому він не зможе зареєструватися.";
      }

      return "";
    };

    const getAge = (birthDateValue, today) => {
      let age = today.getFullYear() - birthDateValue.getFullYear();
      const monthDiff = today.getMonth() - birthDateValue.getMonth();
      const dayDiff = today.getDate() - birthDateValue.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
      }

      return age;
    };

    const setFieldState = (field, message) => {
      const errorNode = field.querySelector(".error-message");

      field.classList.toggle("error", Boolean(message));
      field.classList.toggle("success", !message);
      errorNode.textContent = message;
    };

    const clearFieldState = (field) => {
      field.classList.remove("error", "success");
      field.querySelector(".error-message").textContent = "";
    };

    const resetFormState = (form) => {
      form.querySelectorAll(".field").forEach(clearFieldState);
      form.querySelectorAll(".toggle-password").forEach((button) => {
        const input = button.previousElementSibling;

        input.type = "password";
        button.classList.remove("is-visible");
        button.setAttribute("aria-label", "Показати пароль");
        button.title = "Показати пароль";
      });
    };

    const fillCities = (country) => {
      const options = cityOptions[country] || [];

      elements.citySelect.innerHTML = "";
      elements.citySelect.disabled = options.length === 0;

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = options.length ? "Оберіть місто" : "Спочатку оберіть країну";
      elements.citySelect.append(placeholder);

      options.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.value;
        option.textContent = city.label;
        elements.citySelect.append(option);
      });
    };

    const showApp = () => {
      elements.authScreen.classList.add("hidden");
      elements.appShell.classList.add("active");
      elements.currentUser.textContent = `${state.user.name} · ${state.user.email}`;
      state.filters = parseFiltersFromUrl();
      setFormFromState();
      if (state.friends.length === 0) fetchFriends();
      renderCards();
    };

    const logout = () => {
      localStorage.removeItem(STORAGE_KEYS.user);
      state.user = null;
      elements.authScreen.classList.remove("hidden");
      elements.appShell.classList.remove("active");
      elements.authForms.forEach((form) => {
        form.reset();
        resetFormState(form);
      });
      fillCities("");
      switchTab("login");
    };

    const attachEvents = () => {
      $$(".tab-button").forEach((button) => {
        button.addEventListener("click", () => switchTab(button.dataset.tab));
      });

      $$(".toggle-password").forEach((button) => {
        button.addEventListener("click", () => {
          const input = button.previousElementSibling;
          const isHidden = input.type === "password";

          input.type = isHidden ? "text" : "password";
          button.classList.toggle("is-visible", isHidden);
          button.setAttribute("aria-label", isHidden ? "Приховати пароль" : "Показати пароль");
          button.title = isHidden ? "Приховати пароль" : "Показати пароль";
        });
      });

      elements.authForms.forEach((form) => {
        form.addEventListener("submit", handleAuthSubmit);
        form.addEventListener("input", (event) => {
          const field = event.target.closest(".field");

          if (field && field.classList.contains("error")) {
            validateField(event.target);
          }

          if (event.target.id === "password") {
            validateField($("#confirm-password"));
          }
        });
        form.addEventListener("blur", (event) => validateField(event.target), true);
      });

      elements.countrySelect.addEventListener("change", () => {
        fillCities(elements.countrySelect.value);
        validateField(elements.countrySelect);
        clearFieldState(elements.citySelect.closest(".field"));
      });

      elements.logoutButton.addEventListener("click", logout);
      elements.searchInput.addEventListener("input", (event) => debouncedFilterUpdate("query", event.target.value.trim()));
      elements.minAgeInput.addEventListener("input", (event) => debouncedFilterUpdate("minAge", event.target.value));
      elements.maxAgeInput.addEventListener("input", (event) => debouncedFilterUpdate("maxAge", event.target.value));
      elements.birthYearInput.addEventListener("input", (event) => debouncedFilterUpdate("birthYear", event.target.value));
      elements.locationInput.addEventListener("input", (event) => debouncedFilterUpdate("location", event.target.value.trim()));
      elements.emailInput.addEventListener("input", (event) => debouncedFilterUpdate("email", event.target.value.trim()));
      elements.sortSelect.addEventListener("change", (event) => updateFilter("sort", event.target.value));
      elements.selectedOnlyButton.addEventListener("click", () => updateFilter("selectedOnly", !state.filters.selectedOnly));
      elements.clearFiltersButton.addEventListener("click", resetFilters);
      elements.reloadButton.addEventListener("click", () => {
        state.apiPage = 1;
        state.reachedEnd = false;
        fetchFriends({ reset: true });
      });

      elements.cards.addEventListener("click", (event) => {
        const button = event.target.closest("[data-select]");
        if (button) toggleSelected(button.dataset.select);
      });

      elements.pagination.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page]");
        if (!button || button.disabled) return;
        updateFilter("page", Number(button.dataset.page));
        window.scrollTo({ top: elements.cards.offsetTop - 16, behavior: "smooth" });
      });

      window.addEventListener("popstate", () => {
        state.filters = parseFiltersFromUrl();
        setFormFromState();
        renderCards();
      });

      const observer = new IntersectionObserver((entries) => {
        const shouldLoad = entries.some((entry) => entry.isIntersecting);
        if (shouldLoad && state.user && !state.isLoading && !state.reachedEnd) fetchFriends();
      }, { rootMargin: "600px" });
      observer.observe(elements.sentinel);
    };

    const init = () => {
      state.user = getStoredUser();
      state.selectedIds = getStoredSelectedIds();
      state.friends = getCachedFriends();
      state.apiPage = Math.max(1, Math.ceil(state.friends.length / PAGE_SIZE) + 1);
      state.filters = parseFiltersFromUrl();
      attachEvents();
      switchTab("login");

      if (state.user) {
        showApp();
      }
    };

    init();
