const STORAGE_KEY = "family-hub-state-v1";
const LEGACY_STORAGE_KEY = "family-planner-state-v1";
const LOCAL_PROFILE_KEY = "family-hub-local-profile-v1";
const ADMIN_MEMBER_ID = "me";

const statuses = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "discussion", label: "Discuss" },
  { id: "assigned", label: "Assigned" },
  { id: "done", label: "Done" },
];

const familyMembers = [
  {
    id: "me",
    name: "Naval",
    age: 46,
    email: "me@example.com",
    color: "#0f766e",
    pin: "1980",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "wife",
    name: "Priyanka",
    age: 43,
    email: "wife@example.com",
    color: "#4754a3",
    pin: "1983",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "son",
    name: "Vivan",
    age: 16,
    email: "son@example.com",
    color: "#d95f43",
    pin: "2010",
    settings: { reminderDays: 5, includeInDigest: true },
  },
  {
    id: "daughter",
    name: "Yuvika",
    age: 9,
    email: "daughter@example.com",
    color: "#237a57",
    pin: "2017",
    settings: { reminderDays: 3, includeInDigest: true },
  },
];

const legacyNames = {
  me: "Me",
  wife: "Wife",
  son: "Son",
  daughter: "Daughter",
};

const today = new Date();
const isoToday = toISODate(today);

let state = loadState();
let activeStatus = "all";
let selectedTaskId = state.tasks[0]?.id ?? null;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let pendingLoginMemberId = state.currentMemberId;
let cloudState = createCloudState();

const elements = {
  cloudStatusBtn: document.querySelector("#cloudStatusBtn"),
  currentProfileBtn: document.querySelector("#currentProfileBtn"),
  loginBtn: document.querySelector("#loginBtn"),
  memberStrip: document.querySelector("#memberStrip"),
  statusTabs: document.querySelector("#statusTabs"),
  taskList: document.querySelector("#taskList"),
  taskDetail: document.querySelector("#taskDetail"),
  calendarGrid: document.querySelector("#calendarGrid"),
  monthLabel: document.querySelector("#monthLabel"),
  reminderList: document.querySelector("#reminderList"),
  searchInput: document.querySelector("#searchInput"),
  newTaskBtn: document.querySelector("#newTaskBtn"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  deleteTaskBtn: document.querySelector("#deleteTaskBtn"),
  dialogTitle: document.querySelector("#dialogTitle"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  emailDigestBtn: document.querySelector("#emailDigestBtn"),
  notebookTitle: document.querySelector("#notebookTitle"),
  notebookForm: document.querySelector("#notebookForm"),
  notebookInput: document.querySelector("#notebookInput"),
  notebookList: document.querySelector("#notebookList"),
  prevMonthBtn: document.querySelector("#prevMonthBtn"),
  nextMonthBtn: document.querySelector("#nextMonthBtn"),
  todayBtn: document.querySelector("#todayBtn"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  loginMemberGrid: document.querySelector("#loginMemberGrid"),
  loginPin: document.querySelector("#loginPin"),
  loginError: document.querySelector("#loginError"),
  closeLoginBtn: document.querySelector("#closeLoginBtn"),
  cancelLoginBtn: document.querySelector("#cancelLoginBtn"),
  profileDialog: document.querySelector("#profileDialog"),
  profileForm: document.querySelector("#profileForm"),
  profileTitle: document.querySelector("#profileTitle"),
  profilePreview: document.querySelector("#profilePreview"),
  profileName: document.querySelector("#profileName"),
  profileAge: document.querySelector("#profileAge"),
  profileEmail: document.querySelector("#profileEmail"),
  profileColor: document.querySelector("#profileColor"),
  profilePin: document.querySelector("#profilePin"),
  profileReminderDays: document.querySelector("#profileReminderDays"),
  profileDigest: document.querySelector("#profileDigest"),
  profileAdminPanel: document.querySelector("#profileAdminPanel"),
  profileAdminPins: document.querySelector("#profileAdminPins"),
  closeProfileBtn: document.querySelector("#closeProfileBtn"),
  cancelProfileBtn: document.querySelector("#cancelProfileBtn"),
  cloudDialog: document.querySelector("#cloudDialog"),
  cloudForm: document.querySelector("#cloudForm"),
  cloudSummary: document.querySelector("#cloudSummary"),
  cloudEmail: document.querySelector("#cloudEmail"),
  cloudPassword: document.querySelector("#cloudPassword"),
  cloudError: document.querySelector("#cloudError"),
  cloudGoogleBtn: document.querySelector("#cloudGoogleBtn"),
  closeCloudBtn: document.querySelector("#closeCloudBtn"),
  cloudSignOutBtn: document.querySelector("#cloudSignOutBtn"),
  cloudSignUpBtn: document.querySelector("#cloudSignUpBtn"),
  assistantChat: document.querySelector("#assistantChat"),
  assistantForm: document.querySelector("#assistantForm"),
  assistantInput: document.querySelector("#assistantInput"),
  assistantClearBtn: document.querySelector("#assistantClearBtn"),
  assistantSuggestions: document.querySelector("#assistantSuggestions"),
};

const form = {
  id: document.querySelector("#taskId"),
  title: document.querySelector("#taskTitle"),
  type: document.querySelector("#taskType"),
  status: document.querySelector("#taskStatus"),
  requester: document.querySelector("#taskRequester"),
  assignee: document.querySelector("#taskAssignee"),
  dueDate: document.querySelector("#taskDueDate"),
  priority: document.querySelector("#taskPriority"),
  description: document.querySelector("#taskDescription"),
};

render();
bindEvents();
registerServiceWorker();
handleLaunchAction();
initCloudSync();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        members: normalizeMembers(parsed.members),
        tasks: normalizeTasks(parsed.tasks?.length ? parsed.tasks : seedTasks()),
        notes: normalizeNotes(parsed.notes),
        currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || parsed.currentMemberId || "me",
      };
    } catch (error) {
      console.warn("Could not parse planner data", error);
    }
  }

  return {
    members: normalizeMembers(),
    tasks: normalizeTasks(seedTasks()),
    notes: normalizeNotes(),
    currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || "me",
  };
}

function normalizeMembers(savedMembers = []) {
  return familyMembers.map((defaultMember) => {
    const saved = savedMembers.find((member) => member.id === defaultMember.id) ?? {};
    const savedName = saved.name ?? defaultMember.name;
    const shouldUseDefaultName = savedName === legacyNames[defaultMember.id];

    return {
      ...defaultMember,
      ...saved,
      name: shouldUseDefaultName ? defaultMember.name : savedName,
      pin: normalizePin(saved.pin || defaultMember.pin),
      settings: {
        ...defaultMember.settings,
        ...(saved.settings ?? {}),
      },
    };
  });
}

function normalizeTasks(tasks = []) {
  return tasks.map((task) => ({
    ...task,
    title:
      {
        "Review daughter's iPad ask": "Review Yuvika's iPad ask",
        "Son driving practice plan": "Vivan driving practice plan",
      }[task.title] ?? task.title,
  }));
}

function normalizeNotes(notes = {}) {
  return familyMembers.reduce((notebooks, member) => {
    const memberNotes = Array.isArray(notes?.[member.id]) ? notes[member.id] : [];
    notebooks[member.id] = memberNotes
      .filter((note) => note && typeof note.text === "string")
      .map((note) => ({
        id: note.id || crypto.randomUUID(),
        text: note.text.trim(),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
      }))
      .filter((note) => note.text)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return notebooks;
  }, {});
}

function normalizePin(pin) {
  return String(pin || "").trim();
}

function seedTasks() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Review Yuvika's iPad ask",
      type: "ask",
      status: "discussion",
      requester: "daughter",
      assignee: "",
      dueDate: addDays(isoToday, 5),
      priority: "normal",
      description: "Understand why she wants it, budget range, school needs, and screen-time rules.",
      comments: [
        {
          id: crypto.randomUUID(),
          author: "daughter",
          createdAt: new Date().toISOString(),
          text: "I want one for drawing and school games.",
        },
        {
          id: crypto.randomUUID(),
          author: "me",
          createdAt: new Date().toISOString(),
          text: "Let's collect requirements before deciding.",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Vivan driving practice plan",
      type: "todo",
      status: "assigned",
      requester: "son",
      assignee: "me",
      dueDate: addDays(isoToday, 2),
      priority: "high",
      description: "Pick two practice windows, confirm route, and add a parent reminder.",
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: "Family dentist appointment",
      type: "appointment",
      status: "todo",
      requester: "wife",
      assignee: "wife",
      dueDate: addDays(isoToday, 11),
      priority: "normal",
      description: "Call the dentist and find one block for all four appointments.",
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function bindEvents() {
  elements.cloudStatusBtn.addEventListener("click", openCloudDialog);
  elements.currentProfileBtn.addEventListener("click", openProfileDialog);
  elements.loginBtn.addEventListener("click", () => openLoginDialog());
  elements.newTaskBtn.addEventListener("click", () => openTaskDialog());
  elements.closeDialogBtn.addEventListener("click", () => closeTaskDialog());
  elements.taskForm.addEventListener("submit", saveTaskFromForm);
  elements.deleteTaskBtn.addEventListener("click", deleteCurrentTask);
  elements.searchInput.addEventListener("input", renderTasks);
  elements.exportBtn.addEventListener("click", exportState);
  elements.importInput.addEventListener("change", importState);
  elements.emailDigestBtn.addEventListener("click", sendDigestEmail);
  elements.notebookForm.addEventListener("submit", addNotebookNote);
  elements.prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  elements.nextMonthBtn.addEventListener("click", () => changeMonth(1));
  elements.todayBtn.addEventListener("click", () => {
    visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderCalendar();
  });

  elements.taskDialog.addEventListener("click", (event) => {
    if (event.target === elements.taskDialog) closeTaskDialog();
  });

  elements.loginForm.addEventListener("submit", loginAsSelectedMember);
  elements.closeLoginBtn.addEventListener("click", closeLoginDialog);
  elements.cancelLoginBtn.addEventListener("click", closeLoginDialog);
  elements.loginDialog.addEventListener("click", (event) => {
    if (event.target === elements.loginDialog) closeLoginDialog();
  });

  elements.profileForm.addEventListener("submit", saveProfileSettings);
  elements.closeProfileBtn.addEventListener("click", closeProfileDialog);
  elements.cancelProfileBtn.addEventListener("click", closeProfileDialog);
  elements.profileDialog.addEventListener("click", (event) => {
    if (event.target === elements.profileDialog) closeProfileDialog();
  });

  elements.profileName.addEventListener("input", renderProfilePreview);
  elements.profileColor.addEventListener("input", renderProfilePreview);

  elements.cloudForm.addEventListener("submit", signInToCloud);
  elements.closeCloudBtn.addEventListener("click", closeCloudDialog);
  elements.cloudGoogleBtn.addEventListener("click", signInWithGoogle);
  elements.cloudSignUpBtn.addEventListener("click", createCloudLogin);
  elements.cloudSignOutBtn.addEventListener("click", signOutOfCloud);
  elements.cloudDialog.addEventListener("click", (event) => {
    if (event.target === elements.cloudDialog) closeCloudDialog();
  });

  elements.assistantForm.addEventListener("submit", askAssistant);
  elements.assistantClearBtn.addEventListener("click", resetAssistant);
  elements.assistantInput.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      elements.assistantForm.requestSubmit();
    }
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "file:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}

function handleLaunchAction() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("action") === "new-task") {
    window.addEventListener("load", () => openTaskDialog());
  }
}

function createCloudState() {
  return {
    configured: false,
    enabled: false,
    user: null,
    auth: null,
    db: null,
    familyRef: null,
    unsubscribe: null,
    applyingRemote: false,
    saveTimer: null,
    error: "",
  };
}

function initCloudSync() {
  cloudState.configured = isFirebaseConfigured();
  if (!cloudState.configured) {
    renderCloudStatus();
    return;
  }

  try {
    const config = window.FAMILY_HUB_FIREBASE_CONFIG;
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    cloudState.auth = firebase.auth();
    cloudState.db = firebase.firestore();
    cloudState.enabled = true;

    cloudState.auth.onAuthStateChanged((user) => {
      cloudState.user = user;
      cloudState.error = "";
      if (cloudState.unsubscribe) {
        cloudState.unsubscribe();
        cloudState.unsubscribe = null;
      }

      if (user) {
        subscribeToFamilyDoc();
      }

      renderCloudStatus();
      renderCloudDialog();
    });
  } catch (error) {
    cloudState.error = error.message || "Firebase could not start.";
    renderCloudStatus();
  }
}

function isFirebaseConfigured() {
  const config = window.FAMILY_HUB_FIREBASE_CONFIG;
  return Boolean(
    window.firebase &&
      config &&
      config.apiKey &&
      config.projectId &&
      config.appId,
  );
}

function subscribeToFamilyDoc() {
  const familyId = window.FAMILY_HUB_FIREBASE_OPTIONS?.familyId || "default-family";
  cloudState.familyRef = cloudState.db.collection("families").doc(familyId);
  cloudState.unsubscribe = cloudState.familyRef.onSnapshot(
    (snapshot) => {
      if (!snapshot.exists) {
        saveCloudState(true);
        return;
      }

      const data = snapshot.data();
      applyRemoteFamilyData(data);
    },
    (error) => {
      cloudState.error = error.message || "Could not read shared family data.";
      renderCloudStatus();
      renderCloudDialog();
    },
  );
}

function applyRemoteFamilyData(data = {}) {
  cloudState.applyingRemote = true;
  state = {
    members: normalizeMembers(data.members),
    tasks: normalizeTasks(data.tasks?.length ? data.tasks : []),
    notes: normalizeNotes(data.notes),
    currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || state.currentMemberId || "me",
  };

  if (!getMember(state.currentMemberId)) {
    state.currentMemberId = state.members[0]?.id || "me";
  }

  if (!state.tasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = state.tasks[0]?.id ?? null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LOCAL_PROFILE_KEY, state.currentMemberId);
  cloudState.applyingRemote = false;
  render();
}

function queueCloudSave() {
  if (cloudState.applyingRemote || !cloudState.enabled || !cloudState.user || !cloudState.familyRef) return;

  window.clearTimeout(cloudState.saveTimer);
  cloudState.saveTimer = window.setTimeout(() => saveCloudState(), 250);
}

function saveCloudState(force = false) {
  if ((!force && cloudState.applyingRemote) || !cloudState.enabled || !cloudState.user || !cloudState.familyRef) return;

  const payload = {
    members: state.members,
    tasks: state.tasks,
    notes: state.notes,
    updatedBy: cloudState.user.email || cloudState.user.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  cloudState.familyRef.set(payload, { merge: true }).catch((error) => {
    cloudState.error = error.message || "Could not save shared family data.";
    renderCloudStatus();
    renderCloudDialog();
  });
}

function renderCloudStatus() {
  if (!elements.cloudStatusBtn) return;

  if (!cloudState.configured) {
    elements.cloudStatusBtn.className = "cloud-button warning";
    elements.cloudStatusBtn.innerHTML = `<i data-lucide="cloud-off"></i> Local`;
    refreshIcons();
    return;
  }

  if (cloudState.user) {
    elements.cloudStatusBtn.className = "cloud-button connected";
    elements.cloudStatusBtn.innerHTML = `<i data-lucide="cloud"></i> Synced`;
  } else {
    elements.cloudStatusBtn.className = "cloud-button";
    elements.cloudStatusBtn.innerHTML = `<i data-lucide="cloud"></i> Sign in`;
  }
  refreshIcons();
}

function openCloudDialog() {
  elements.cloudError.textContent = "";
  elements.cloudPassword.value = "";
  if (cloudState.user?.email) {
    elements.cloudEmail.value = cloudState.user.email;
  }
  renderCloudDialog();
  elements.cloudDialog.showModal();
  if (!cloudState.user) {
    elements.cloudEmail.focus();
  }
  refreshIcons();
}

function renderCloudDialog() {
  if (!elements.cloudSummary) return;

  const familyId = window.FAMILY_HUB_FIREBASE_OPTIONS?.familyId || "default-family";
  if (!cloudState.configured) {
    elements.cloudSummary.innerHTML = `
      <strong>Local mode</strong>
      <span>Add Firebase config, then enable Google sign-in and Firestore in Firebase.</span>
    `;
    elements.cloudGoogleBtn.disabled = true;
    elements.cloudSignOutBtn.disabled = true;
    return;
  }

  if (cloudState.user) {
    elements.cloudSummary.innerHTML = `
      <strong>Synced as ${escapeHTML(cloudState.user.email || "Firebase user")}</strong>
      <span>Family data: ${escapeHTML(familyId)}</span>
    `;
    elements.cloudGoogleBtn.disabled = true;
    elements.cloudSignOutBtn.disabled = false;
    return;
  }

  elements.cloudSummary.innerHTML = `
    <strong>Cloud sync ready</strong>
    <span>Sign in with a family Google account to share tasks through Firestore.</span>
  `;
  elements.cloudGoogleBtn.disabled = false;
  elements.cloudSignOutBtn.disabled = true;
}

function closeCloudDialog() {
  elements.cloudDialog.close();
  elements.cloudForm.reset();
  elements.cloudError.textContent = "";
}

function signInToCloud(event) {
  event.preventDefault();
  if (!cloudState.configured) {
    elements.cloudError.textContent = "Add Firebase config first.";
    return;
  }

  cloudState.auth
    .signInWithEmailAndPassword(elements.cloudEmail.value.trim(), elements.cloudPassword.value)
    .then(() => closeCloudDialog())
    .catch((error) => {
      elements.cloudError.textContent = firebaseErrorMessage(error);
    });
}

function signInWithGoogle() {
  if (!cloudState.configured) {
    elements.cloudError.textContent = "Add Firebase config first.";
    return;
  }

  elements.cloudError.textContent = "";
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  cloudState.auth
    .signInWithPopup(provider)
    .then(() => closeCloudDialog())
    .catch((error) => {
      if (error?.code === "auth/popup-blocked") {
        cloudState.auth.signInWithRedirect(provider);
        return;
      }
      elements.cloudError.textContent = firebaseErrorMessage(error);
    });
}

function createCloudLogin() {
  if (!cloudState.configured) {
    elements.cloudError.textContent = "Add Firebase config first.";
    return;
  }

  cloudState.auth
    .createUserWithEmailAndPassword(elements.cloudEmail.value.trim(), elements.cloudPassword.value)
    .then(() => closeCloudDialog())
    .catch((error) => {
      elements.cloudError.textContent = firebaseErrorMessage(error);
    });
}

function signOutOfCloud() {
  if (!cloudState.auth) return;
  cloudState.auth.signOut().then(() => {
    closeCloudDialog();
    renderCloudStatus();
  });
}

function firebaseErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  if (code.includes("weak-password")) return "Use a password with at least 6 characters.";
  if (code.includes("email-already-in-use")) return "That email already has a login.";
  if (code.includes("unauthorized-domain")) return "Add this website domain in Firebase Authentication settings.";
  if (code.includes("popup-blocked")) return "Allow popups or try again in Safari/Chrome.";
  if (code.includes("user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Email or password did not match.";
  }
  return error?.message || "Firebase sign-in failed.";
}

function render() {
  renderCloudStatus();
  renderCurrentProfile();
  renderMemberStrip();
  renderStatusTabs();
  populateFormOptions();
  renderTasks();
  renderDetail();
  renderCalendar();
  renderReminders();
  renderNotebook();
  renderAssistantSuggestions();
  refreshIcons();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LOCAL_PROFILE_KEY, state.currentMemberId);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  queueCloudSave();
}

function renderCurrentProfile() {
  const member = currentMember();
  elements.currentProfileBtn.innerHTML = `
    <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
    <span>
      <strong>${escapeHTML(member.name)}</strong>
      <small>Profile</small>
    </span>
  `;
}

function renderMemberStrip() {
  elements.memberStrip.innerHTML = state.members
    .map((member) => {
      const assigned = state.tasks.filter((task) => task.assignee === member.id && task.status !== "done").length;
      const requested = state.tasks.filter((task) => task.requester === member.id && task.status !== "done").length;
      return `
        <button class="member-tile ${member.id === state.currentMemberId ? "current" : ""}" type="button" data-login-member="${member.id}">
          <div class="avatar" style="background:${member.color}">${initials(member.name)}</div>
          <div>
            <strong>${escapeHTML(member.name)}</strong>
            <span>${assigned} assigned · ${requested} asked</span>
          </div>
        </button>
      `;
    })
    .join("");

  elements.memberStrip.querySelectorAll("[data-login-member]").forEach((button) => {
    button.addEventListener("click", () => openLoginDialog(button.dataset.loginMember));
  });
}

function openLoginDialog(memberId = state.currentMemberId) {
  pendingLoginMemberId = memberId || state.currentMemberId;
  elements.loginPin.value = "";
  elements.loginError.textContent = "";
  renderLoginOptions();
  elements.loginDialog.showModal();
  if (getMember(pendingLoginMemberId)?.pin) {
    elements.loginPin.focus();
  }
  refreshIcons();
}

function renderLoginOptions() {
  elements.loginMemberGrid.innerHTML = state.members
    .map(
      (member) => `
        <button class="login-option ${member.id === pendingLoginMemberId ? "selected" : ""}" type="button" data-login-option="${member.id}">
          <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
          <span>
            <strong>${escapeHTML(member.name)}</strong><br />
            <small>${member.pin ? "PIN enabled" : "No PIN set"}</small>
          </span>
        </button>
      `,
    )
    .join("");

  elements.loginMemberGrid.querySelectorAll("[data-login-option]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingLoginMemberId = button.dataset.loginOption;
      elements.loginError.textContent = "";
      renderLoginOptions();
      if (getMember(pendingLoginMemberId)?.pin) {
        elements.loginPin.focus();
      }
    });
  });
}

function loginAsSelectedMember(event) {
  event.preventDefault();
  const member = getMember(pendingLoginMemberId);
  if (!member) return;

  if (member.pin && elements.loginPin.value !== member.pin) {
    elements.loginError.textContent = "That PIN does not match.";
    elements.loginPin.focus();
    return;
  }

  state.currentMemberId = member.id;
  saveState();
  closeLoginDialog();
  render();
}

function closeLoginDialog() {
  elements.loginDialog.close();
  elements.loginForm.reset();
  elements.loginError.textContent = "";
}

function openProfileDialog() {
  const member = currentMember();
  elements.profileTitle.textContent = `${member.name}'s profile`;
  elements.profileName.value = member.name;
  elements.profileAge.value = member.age;
  elements.profileEmail.value = member.email;
  elements.profileColor.value = member.color;
  elements.profilePin.value = member.pin ?? "";
  elements.profileReminderDays.value = member.settings?.reminderDays ?? 7;
  elements.profileDigest.checked = member.settings?.includeInDigest ?? true;
  renderAdminPinControls();
  renderProfilePreview();
  elements.profileDialog.showModal();
  elements.profileName.focus();
  refreshIcons();
}

function renderProfilePreview() {
  const name = elements.profileName.value.trim() || currentMember().name;
  const color = elements.profileColor.value || currentMember().color;
  elements.profilePreview.innerHTML = `
    <span class="avatar" style="background:${escapeAttribute(color)}">${initials(name)}</span>
    <div>
      <strong>${escapeHTML(name)}</strong>
      <div class="reminder-meta">Signed in profile</div>
    </div>
  `;
}

function saveProfileSettings(event) {
  event.preventDefault();
  const member = currentMember();
  member.name = elements.profileName.value.trim();
  member.age = Number(elements.profileAge.value);
  member.email = elements.profileEmail.value.trim();
  member.color = elements.profileColor.value;
  member.pin = normalizePin(elements.profilePin.value);
  member.settings = {
    reminderDays: Number(elements.profileReminderDays.value) || 7,
    includeInDigest: elements.profileDigest.checked,
  };

  if (isAdminMember()) {
    const updated = applyAdminPinResets();
    if (!updated) return;
  }

  saveState();
  closeProfileDialog();
  populateFormOptions();
  render();
}

function renderAdminPinControls() {
  const isAdmin = isAdminMember();
  elements.profileAdminPanel.hidden = !isAdmin;
  if (!isAdmin) {
    elements.profileAdminPins.innerHTML = "";
    return;
  }

  elements.profileAdminPins.innerHTML = state.members
    .map(
      (member) => `
        <label>
          ${escapeHTML(member.name)}
          <input type="password" inputmode="numeric" minlength="4" maxlength="12" placeholder="Leave unchanged" data-admin-pin="${member.id}" />
        </label>
      `,
    )
    .join("");
}

function applyAdminPinResets() {
  const inputs = [...elements.profileAdminPins.querySelectorAll("[data-admin-pin]")];
  for (const input of inputs) {
    const pin = normalizePin(input.value);
    if (!pin) continue;
    if (pin.length < 4) {
      window.alert("PIN resets must be at least 4 characters.");
      input.focus();
      return false;
    }

    const member = getMember(input.dataset.adminPin);
    if (member) {
      member.pin = pin;
    }
  }

  return true;
}

function closeProfileDialog() {
  elements.profileDialog.close();
  elements.profileForm.reset();
  elements.profileAdminPins.innerHTML = "";
}

function renderStatusTabs() {
  elements.statusTabs.innerHTML = statuses
    .map((status) => {
      const count = status.id === "all" ? state.tasks.length : state.tasks.filter((task) => task.status === status.id).length;
      return `
        <button class="segment ${activeStatus === status.id ? "active" : ""}" type="button" data-status="${status.id}">
          ${status.label} ${count}
        </button>
      `;
    })
    .join("");

  elements.statusTabs.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStatus = button.dataset.status;
      renderStatusTabs();
      renderTasks();
    });
  });
}

function populateFormOptions() {
  form.status.innerHTML = statuses
    .filter((status) => status.id !== "all")
    .map((status) => `<option value="${status.id}">${status.label}</option>`)
    .join("");

  const memberOptions = state.members
    .map((member) => `<option value="${member.id}">${escapeHTML(member.name)}</option>`)
    .join("");

  form.requester.innerHTML = memberOptions;
  form.assignee.innerHTML = `<option value="">Unassigned</option>${memberOptions}`;
}

function renderTasks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const tasks = getSortedTasks().filter((task) => {
    const matchesStatus = activeStatus === "all" || task.status === activeStatus;
    const haystack = [task.title, task.description, task.type, memberName(task.requester), memberName(task.assignee)]
      .join(" ")
      .toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });

  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">No tasks match this view.</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => {
      const dueState = getDueState(task);
      const assignee = task.assignee ? memberName(task.assignee) : "Unassigned";
      return `
        <button class="task-row ${dueState} ${task.status === "done" ? "done" : ""} ${
          selectedTaskId === task.id ? "selected" : ""
        }" type="button" data-task-id="${task.id}">
          <span>
            <span class="task-title">${escapeHTML(task.title)}</span>
            <span class="task-meta">
              <span class="badge ${task.type}">${taskTypeLabel(task.type)}</span>
              ${task.priority === "high" ? `<span class="badge high">High</span>` : ""}
              <span>${escapeHTML(memberName(task.requester))} asked</span>
              <span>${escapeHTML(assignee)}</span>
            </span>
          </span>
          <span class="date-pill">
            <i data-lucide="calendar-days"></i>
            ${formatShortDate(task.dueDate)}
          </span>
        </button>
      `;
    })
    .join("");

  elements.taskList.querySelectorAll("[data-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTaskId = button.dataset.taskId;
      renderTasks();
      renderDetail();
      refreshIcons();
    });
  });

  refreshIcons();
}

function renderDetail() {
  const task = getSelectedTask();
  if (!task) {
    elements.taskDetail.className = "empty-detail";
    elements.taskDetail.innerHTML = `
      <i data-lucide="list-checks"></i>
      <h2>Select a task</h2>
      <p>Pick one from the list.</p>
    `;
    refreshIcons();
    return;
  }

  elements.taskDetail.className = "detail-stack";
  const comments = task.comments.length
    ? task.comments
        .map(
          (comment) => `
            <article class="comment">
              <div class="comment-meta">${escapeHTML(memberName(comment.author))} · ${formatDateTime(comment.createdAt)}</div>
              <p>${escapeHTML(comment.text)}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state">No discussion yet.</div>`;

  elements.taskDetail.innerHTML = `
    <div class="detail-top">
      <div>
        <p class="eyebrow">${taskTypeLabel(task.type)}</p>
        <h2 class="detail-title">${escapeHTML(task.title)}</h2>
      </div>
      <div class="detail-actions">
        <button class="secondary-button" type="button" data-action="edit"><i data-lucide="pencil"></i>Edit</button>
        <button class="secondary-button" type="button" data-action="email"><i data-lucide="mail"></i>Email</button>
        <button class="chip-button" type="button" data-action="advance"><i data-lucide="${nextStatusIcon(task.status)}"></i>${nextStatusLabel(task.status)}</button>
      </div>
    </div>

    <section class="detail-facts">
      <div class="fact"><span>Status</span><strong>${statusLabel(task.status)}</strong></div>
      <div class="fact"><span>Due</span><strong>${formatLongDate(task.dueDate)}</strong></div>
      <div class="fact"><span>Requested by</span><strong>${escapeHTML(memberName(task.requester))}</strong></div>
      <div class="fact"><span>Assigned to</span><strong>${escapeHTML(task.assignee ? memberName(task.assignee) : "Unassigned")}</strong></div>
    </section>

    <section class="requirements">
      <h3>Requirements</h3>
      <p class="task-description">${escapeHTML(task.description || "No requirements added.")}</p>
    </section>

    <section class="conversation">
      <h3>Conversation</h3>
      ${comments}
      <form class="comment-form" data-comment-form>
        <select aria-label="Comment author" name="author">
          ${state.members
            .map(
              (member) =>
                `<option value="${member.id}" ${member.id === state.currentMemberId ? "selected" : ""}>${escapeHTML(member.name)}</option>`,
            )
            .join("")}
        </select>
        <input aria-label="Comment" name="text" placeholder="Add a note or requirement" required maxlength="220" />
        <button class="primary-button" type="submit"><i data-lucide="send"></i>Send</button>
      </form>
    </section>
  `;

  elements.taskDetail.querySelector('[data-action="edit"]').addEventListener("click", () => openTaskDialog(task));
  elements.taskDetail.querySelector('[data-action="email"]').addEventListener("click", () => sendTaskEmail(task));
  elements.taskDetail.querySelector('[data-action="advance"]').addEventListener("click", () => advanceTask(task.id));
  elements.taskDetail.querySelector("[data-comment-form]").addEventListener("submit", addComment);
  refreshIcons();
}

function renderCalendar() {
  const monthName = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  elements.monthLabel.textContent = monthName;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(visibleMonth);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  elements.calendarGrid.innerHTML = `
    ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
    ${days
      .map((date) => {
        const iso = toISODate(date);
        const tasks = state.tasks.filter((task) => task.dueDate === iso);
        const outside = date.getMonth() !== visibleMonth.getMonth();
        const isToday = iso === isoToday;
        return `
          <div class="calendar-day ${outside ? "outside" : ""} ${isToday ? "today" : ""}">
            <span class="day-number">${date.getDate()}</span>
            <div class="calendar-items">
              ${tasks
                .map(
                  (task) => `
                    <button class="calendar-task ${task.priority} ${task.status === "done" ? "done" : ""}" type="button" data-task-id="${task.id}" title="${escapeAttribute(task.title)}">
                      ${escapeHTML(task.title)}
                    </button>
                  `,
                )
                .join("")}
            </div>
          </div>
        `;
      })
      .join("")}
  `;

  elements.calendarGrid.querySelectorAll("[data-task-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTaskId = button.dataset.taskId;
      renderTasks();
      renderDetail();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderReminders() {
  const tasks = getSortedTasks()
    .filter((task) => task.status !== "done")
    .filter((task) => {
      const days = daysUntil(task.dueDate);
      const owner = getMember(task.assignee || task.requester);
      return days <= (owner?.settings?.reminderDays ?? 7);
    })
    .slice(0, 6);

  if (!tasks.length) {
    elements.reminderList.innerHTML = `<div class="empty-state">No upcoming reminders.</div>`;
    return;
  }

  elements.reminderList.innerHTML = tasks
    .map((task) => {
      const owner = task.assignee || task.requester;
      return `
        <article class="reminder-item">
          <div class="reminder-row">
            <div>
              <div class="reminder-title">${escapeHTML(task.title)}</div>
              <div class="reminder-meta">${formatDuePhrase(task.dueDate)} · ${escapeHTML(memberName(owner))}</div>
            </div>
            <button class="icon-button" type="button" data-email-task="${task.id}" title="Email reminder" aria-label="Email reminder">
              <i data-lucide="mail">@</i>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  elements.reminderList.querySelectorAll("[data-email-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.emailTask);
      if (task) sendTaskEmail(task);
    });
  });

  refreshIcons();
}

function renderNotebook() {
  const member = currentMember();
  const notes = getNotebookNotes(member.id);
  elements.notebookTitle.textContent = `${member.name}'s notebook`;

  if (!notes.length) {
    elements.notebookList.innerHTML = `<div class="empty-state compact">No notes yet.</div>`;
    return;
  }

  elements.notebookList.innerHTML = notes
    .map(
      (note) => `
        <article class="notebook-note">
          <p class="note-text">${escapeHTML(note.text)}</p>
          <div class="note-footer">
            <span class="reminder-meta">${formatDateTime(note.updatedAt)}</span>
            <span class="note-actions">
              <button class="icon-button" type="button" data-note-edit="${escapeAttribute(note.id)}" title="Edit note" aria-label="Edit note">
                <i data-lucide="pencil"></i>
              </button>
              <button class="icon-button danger" type="button" data-note-delete="${escapeAttribute(note.id)}" title="Delete note" aria-label="Delete note">
                <i data-lucide="trash-2"></i>
              </button>
            </span>
          </div>
        </article>
      `,
    )
    .join("");

  elements.notebookList.querySelectorAll("[data-note-edit]").forEach((button) => {
    button.addEventListener("click", () => editNotebookNote(button.dataset.noteEdit));
  });

  elements.notebookList.querySelectorAll("[data-note-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteNotebookNote(button.dataset.noteDelete));
  });

  refreshIcons();
}

function addNotebookNote(event) {
  event.preventDefault();
  const text = elements.notebookInput.value.trim();
  if (!text) return;

  const now = new Date().toISOString();
  getNotebookNotes(state.currentMemberId).unshift({
    id: crypto.randomUUID(),
    text,
    createdAt: now,
    updatedAt: now,
  });

  elements.notebookInput.value = "";
  saveState();
  renderNotebook();
}

function editNotebookNote(id) {
  const notes = getNotebookNotes(state.currentMemberId);
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  const updatedText = window.prompt("Edit note", note.text);
  if (updatedText === null) return;
  const text = updatedText.trim();
  if (!text) {
    window.alert("Notes cannot be blank. Delete the note if you no longer need it.");
    return;
  }

  note.text = text;
  note.updatedAt = new Date().toISOString();
  notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  saveState();
  renderNotebook();
}

function deleteNotebookNote(id) {
  const notes = getNotebookNotes(state.currentMemberId);
  const note = notes.find((item) => item.id === id);
  if (!note) return;
  const confirmed = window.confirm("Delete this note?");
  if (!confirmed) return;

  state.notes[state.currentMemberId] = notes.filter((item) => item.id !== id);
  saveState();
  renderNotebook();
}

function resetAssistant() {
  elements.assistantChat.innerHTML = "";
  addAssistantMessage(
    "assistant",
    "Ask me about tasks, owners, due dates, overdue work, unassigned items, notes, or paste a rough list to create tasks.",
  );
}

function renderAssistantSuggestions() {
  const suggestions = [
    "What is due this week?",
    "Who has overdue tasks?",
    "Show unassigned tasks",
    "Create tasks: Dentist appointment tomorrow",
  ];

  elements.assistantSuggestions.innerHTML = suggestions
    .map((suggestion) => `<button class="assistant-suggestion" type="button" data-assistant-suggestion="${escapeAttribute(suggestion)}">${escapeHTML(suggestion)}</button>`)
    .join("");

  elements.assistantSuggestions.querySelectorAll("[data-assistant-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.assistantInput.value = button.dataset.assistantSuggestion;
      elements.assistantForm.requestSubmit();
    });
  });

  if (!elements.assistantChat.childElementCount) {
    resetAssistant();
  }
}

function askAssistant(event) {
  event.preventDefault();
  const question = elements.assistantInput.value.trim();
  if (!question) return;

  addAssistantMessage("user", question);
  addAssistantMessage("assistant", answerFamilyQuestion(question));
  elements.assistantInput.value = "";
}

function addAssistantMessage(role, text) {
  const article = document.createElement("article");
  article.className = `assistant-message ${role}`;
  article.innerHTML = `
    <strong>${role === "user" ? "You" : "Assistant"}</strong>
    <p>${escapeHTML(text)}</p>
  `;
  elements.assistantChat.appendChild(article);
  elements.assistantChat.scrollTop = elements.assistantChat.scrollHeight;
}

function answerFamilyQuestion(question) {
  const normalized = question.toLowerCase();
  const person = findMentionedMember(normalized);
  const tasks = getSortedTasks();
  const activeTasks = tasks.filter((task) => task.status !== "done");

  if (mentionsHelp(normalized)) {
    return "I can answer things like: what is due today, what is due this week, who owns a task, what is overdue, what is unassigned, show my notes, create a task from a note, or summarize a family member's tasks.";
  }

  if (mentionsTaskCreationFromNote(normalized)) {
    const member = person || currentMember();
    return createTaskFromNotebookQuestion(normalized, member);
  }

  if (mentionsRoughTaskCreation(question, normalized)) {
    return createTasksFromRoughList(question);
  }

  if (mentionsNotebook(normalized)) {
    const member = person || currentMember();
    const notes = searchNotes(normalized, getNotebookNotes(member.id));
    return formatNotebookAnswer(member, notes);
  }

  if (mentionsOverdue(normalized)) {
    return formatTaskAnswer("Overdue tasks", activeTasks.filter((task) => daysUntil(task.dueDate) < 0));
  }

  if (mentionsUnassigned(normalized)) {
    return formatTaskAnswer("Unassigned tasks", activeTasks.filter((task) => !task.assignee));
  }

  if (mentionsToday(normalized)) {
    return formatTaskAnswer("Due today", activeTasks.filter((task) => daysUntil(task.dueDate) === 0));
  }

  if (mentionsTomorrow(normalized)) {
    return formatTaskAnswer("Due tomorrow", activeTasks.filter((task) => daysUntil(task.dueDate) === 1));
  }

  if (mentionsWeek(normalized) || mentionsUpcoming(normalized)) {
    return formatTaskAnswer("Due in the next 7 days", activeTasks.filter((task) => {
      const days = daysUntil(task.dueDate);
      return days >= 0 && days <= 7;
    }));
  }

  if (person) {
    const memberTasks = activeTasks.filter((task) => task.assignee === person.id || (!task.assignee && task.requester === person.id));
    return formatPersonSummary(person, memberTasks);
  }

  const matchingTasks = searchTasks(normalized, tasks);
  if (matchingTasks.length) {
    return formatTaskAnswer("Matching tasks", matchingTasks);
  }

  if (mentionsSummary(normalized)) {
    return formatFamilySummary(activeTasks);
  }

  return "I did not find a matching task or person. Try asking “what is due this week?”, “who owns dentist?”, “summarize Vivan's tasks”, or “show unassigned tasks”.";
}

function findMentionedMember(text) {
  return state.members.find((member) => text.includes(member.name.toLowerCase()));
}

function searchTasks(text, tasks) {
  const terms = text
    .replace(/[?.,]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !assistantStopWords().has(term));

  if (!terms.length) return [];

  return tasks.filter((task) => {
    const haystack = [
      task.title,
      task.description,
      task.type,
      task.status,
      memberName(task.requester),
      memberName(task.assignee),
      formatLongDate(task.dueDate),
    ]
      .join(" ")
      .toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}

function searchNotes(text, notes) {
  const terms = text
    .replace(/[?.,]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !assistantStopWords().has(term));

  if (!terms.length) return notes;

  const matches = notes.filter((note) => {
    const haystack = `${note.text} ${formatDateTime(note.updatedAt)}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });

  return matches.length ? matches : notes;
}

function formatNotebookAnswer(member, notes) {
  if (!notes.length) return `${member.name}'s notebook has no notes yet.`;

  return `${member.name}'s notebook: ${notes.length} note${notes.length === 1 ? "" : "s"}\n\n${notes
    .slice(0, 5)
    .map((note) => `- ${note.text} (${formatDateTime(note.updatedAt)})`)
    .join("\n")}`;
}

function createTaskFromNotebookQuestion(text, member) {
  const notes = getNotebookNotes(member.id);
  if (!notes.length) return `${member.name}'s notebook has no notes to turn into a task.`;

  const matches = searchNotes(text, notes);
  const note = matches[0];
  if (!note) return `I could not find a matching note in ${member.name}'s notebook.`;

  const task = buildTaskFromNote(note, member, text);
  state.tasks.unshift(task);
  selectedTaskId = task.id;
  saveState();
  render();

  return `Created task: ${task.title}\nDue: ${formatLongDate(task.dueDate)}\nRequested by: ${member.name}\nAssigned to: Unassigned`;
}

function createTasksFromRoughList(question) {
  const drafts = parseRoughTaskList(question);
  if (!drafts.length) {
    return "Paste one task per line with a date, like:\n- Dentist appointment 5/20\n- Vivan driving practice tomorrow\n- Buy birthday gift by May 30";
  }

  const now = new Date().toISOString();
  const tasks = drafts.map((draft) => buildTaskFromDraft(draft, now));
  state.tasks.unshift(...tasks);
  selectedTaskId = tasks[0].id;
  saveState();
  render();

  const defaulted = drafts.filter((draft) => draft.usedDefaultDate).length;
  const defaultNote = defaulted ? `\n\n${defaulted} item${defaulted === 1 ? "" : "s"} had no date, so I used ${formatLongDate(addDays(isoToday, 7))}.` : "";
  return `Created ${tasks.length} task${tasks.length === 1 ? "" : "s"} and added them to the calendar:\n\n${formatTaskLines(tasks)}${defaultNote}`;
}

function parseRoughTaskList(question) {
  return question
    .replace(/\r/g, "")
    .split(/\n|;/)
    .map((line) => parseRoughTaskLine(line))
    .filter(Boolean);
}

function parseRoughTaskLine(line) {
  const original = line.trim();
  if (!original) return null;

  const withoutBullet = original.replace(/^\s*(?:[-*]|\d+[.)]|\[[ x]\])\s*/i, "").trim();
  const commandOnly = /^(create|make|add|turn|convert|schedule|plan)?\s*(tasks?|todos?|to dos?|calendar|list)\s*:?\s*$/i.test(withoutBullet);
  if (commandOnly) return null;

  const dateResult = extractDueDateFromLine(withoutBullet);
  const directiveOnly =
    dateResult.usedDefaultDate &&
    /^(create|make|add|turn|convert|schedule|plan)\b/i.test(withoutBullet) &&
    /\b(tasks?|todos?|to dos?|calendar|schedule|list)\b/i.test(withoutBullet);
  if (directiveOnly) return null;

  const title = cleanRoughTaskTitle(dateResult.titleText);
  if (!title || title.length < 2) return null;

  return {
    title,
    dueDate: dateResult.dueDate,
    usedDefaultDate: dateResult.usedDefaultDate,
    assignee: findAssignedMemberFromLine(withoutBullet)?.id || "",
    original,
  };
}

function buildTaskFromDraft(draft, now) {
  return {
    id: crypto.randomUUID(),
    title: draft.title,
    type: inferTaskType(draft.title),
    status: "todo",
    requester: state.currentMemberId,
    assignee: draft.assignee,
    dueDate: draft.dueDate,
    priority: "normal",
    description: `Created by Family Hub Assistant from rough list:\n\n${draft.original}`,
    comments: [
      {
        id: crypto.randomUUID(),
        author: state.currentMemberId,
        createdAt: now,
        text: "Created by Family Hub Assistant from a rough task list.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

function buildTaskFromNote(note, member, question) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: deriveTaskTitleFromNote(note.text),
    type: "todo",
    status: "todo",
    requester: member.id,
    assignee: "",
    dueDate: deriveDueDateFromQuestion(question),
    priority: "normal",
    description: `Created from ${member.name}'s notebook note:\n\n${note.text}`,
    comments: [
      {
        id: crypto.randomUUID(),
        author: state.currentMemberId,
        createdAt: now,
        text: "Created by Family Hub Assistant from a notebook note.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

function deriveTaskTitleFromNote(text) {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) || "Notebook follow-up";
  const cleaned = firstLine.replace(/^[-*\d.)\s]+/, "");
  const title = cleaned.length > 64 ? `${cleaned.slice(0, 61).trim()}...` : cleaned;
  return title || "Notebook follow-up";
}

function deriveDueDateFromQuestion(text) {
  const parsed = parseDueDateText(text);
  if (parsed) return parsed.dueDate;
  return addDays(isoToday, 7);
}

function extractDueDateFromLine(line) {
  const parsed = parseDueDateText(line);
  if (!parsed) {
    return {
      dueDate: addDays(isoToday, 7),
      titleText: line,
      usedDefaultDate: true,
    };
  }

  return {
    dueDate: parsed.dueDate,
    titleText: line.replace(parsed.match, " "),
    usedDefaultDate: false,
  };
}

function parseDueDateText(text) {
  const relative = text.match(/\b(?:due|by|on)?\s*(today|tomorrow|next week|this week)\b/i);
  if (relative) {
    return {
      dueDate:
        {
          today: isoToday,
          tomorrow: addDays(isoToday, 1),
          "this week": addDays(isoToday, 7),
          "next week": addDays(isoToday, 7),
        }[relative[1].toLowerCase()] || addDays(isoToday, 7),
      match: relative[0],
    };
  }

  const iso = text.match(/\b(?:due|by|on)?\s*(\d{4})-(\d{1,2})-(\d{1,2})\b/i);
  if (iso) {
    const dueDate = datePartsToISO(Number(iso[1]), Number(iso[2]), Number(iso[3]), true);
    if (dueDate) return { dueDate, match: iso[0] };
  }

  const numeric = text.match(/\b(?:due|by|on)?\s*(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/i);
  if (numeric) {
    const year = numeric[3] ? normalizeYear(Number(numeric[3])) : null;
    const dueDate = datePartsToISO(year, Number(numeric[1]), Number(numeric[2]), Boolean(year));
    if (dueDate) return { dueDate, match: numeric[0] };
  }

  const monthFirst = text.match(
    /\b(?:due|by|on)?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:,?\s+(\d{2,4}))?\b/i,
  );
  if (monthFirst) {
    const year = monthFirst[3] ? normalizeYear(Number(monthFirst[3])) : null;
    const dueDate = datePartsToISO(year, monthNameToNumber(monthFirst[1]), Number(monthFirst[2]), Boolean(year));
    if (dueDate) return { dueDate, match: monthFirst[0] };
  }

  const dayFirst = text.match(
    /\b(?:due|by|on)?\s*(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\.|,)?(?:\s+(\d{2,4}))?\b/i,
  );
  if (dayFirst) {
    const year = dayFirst[3] ? normalizeYear(Number(dayFirst[3])) : null;
    const dueDate = datePartsToISO(year, monthNameToNumber(dayFirst[2]), Number(dayFirst[1]), Boolean(year));
    if (dueDate) return { dueDate, match: dayFirst[0] };
  }

  return null;
}

function datePartsToISO(year, month, day, hasExplicitYear) {
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) return "";

  const base = parseLocalDate(isoToday);
  const resolvedYear = year || base.getFullYear();
  const candidate = new Date(resolvedYear, month - 1, day);
  if (candidate.getFullYear() !== resolvedYear || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
    return "";
  }

  if (!hasExplicitYear && candidate < base) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }

  return toISODate(candidate);
}

function normalizeYear(year) {
  if (year < 100) return year + 2000;
  return year;
}

function monthNameToNumber(name) {
  const month = name.toLowerCase().slice(0, 3);
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(month) + 1;
}

function cleanRoughTaskTitle(text) {
  return text
    .replace(/^\s*(?:create|make|add|schedule|plan)\s+(?:a\s+)?(?:tasks?|todos?|to dos?|calendar|schedule|list)\s*:?\s*/i, "")
    .replace(/\b(?:due|by|on)\b/gi, " ")
    .replace(/\s*[-:|]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 90);
}

function findAssignedMemberFromLine(line) {
  const normalized = line.toLowerCase();
  return state.members.find((member) => {
    const name = member.name.toLowerCase();
    return (
      normalized.includes(`@${name}`) ||
      normalized.startsWith(`${name}:`) ||
      normalized.includes(`assign to ${name}`) ||
      normalized.includes(`assigned to ${name}`)
    );
  });
}

function inferTaskType(title) {
  return title.toLowerCase().includes("appointment") ? "appointment" : "todo";
}

function formatPersonSummary(member, tasks) {
  if (!tasks.length) {
    return `${member.name} has no active assigned or requested tasks.`;
  }

  const assigned = tasks.filter((task) => task.assignee === member.id).length;
  const requested = tasks.filter((task) => !task.assignee && task.requester === member.id).length;
  return `${member.name} has ${tasks.length} active item${tasks.length === 1 ? "" : "s"}: ${assigned} assigned, ${requested} requested but unassigned.\n\n${formatTaskLines(tasks)}`;
}

function formatFamilySummary(tasks) {
  if (!tasks.length) return "There are no active family tasks.";

  const lines = state.members.map((member) => {
    const count = tasks.filter((task) => task.assignee === member.id || (!task.assignee && task.requester === member.id)).length;
    return `${member.name}: ${count}`;
  });

  const overdue = tasks.filter((task) => daysUntil(task.dueDate) < 0).length;
  const unassigned = tasks.filter((task) => !task.assignee).length;
  return `There are ${tasks.length} active family tasks.\n${lines.join("\n")}\nOverdue: ${overdue}\nUnassigned: ${unassigned}`;
}

function formatTaskAnswer(title, tasks) {
  if (!tasks.length) return `${title}: none found.`;
  return `${title}: ${tasks.length}\n\n${formatTaskLines(tasks)}`;
}

function formatTaskLines(tasks) {
  return tasks
    .slice(0, 8)
    .map((task) => {
      const owner = task.assignee ? memberName(task.assignee) : `Unassigned, requested by ${memberName(task.requester)}`;
      return `- ${task.title}: ${owner}, ${formatDuePhrase(task.dueDate)}, ${statusLabel(task.status)}`;
    })
    .join("\n");
}

function mentionsHelp(text) {
  return text.includes("help") || text.includes("what can you");
}

function mentionsOverdue(text) {
  return text.includes("overdue") || text.includes("late");
}

function mentionsUnassigned(text) {
  return text.includes("unassigned") || text.includes("not assigned") || text.includes("no owner");
}

function mentionsToday(text) {
  return text.includes("today");
}

function mentionsTomorrow(text) {
  return text.includes("tomorrow");
}

function mentionsWeek(text) {
  return text.includes("week") || text.includes("7 days") || text.includes("seven days");
}

function mentionsUpcoming(text) {
  return text.includes("upcoming") || text.includes("coming up") || text.includes("next");
}

function mentionsSummary(text) {
  return text.includes("summary") || text.includes("summarize") || text.includes("overview");
}

function mentionsNotebook(text) {
  return text.includes("note") || text.includes("notes") || text.includes("notebook");
}

function mentionsTaskCreationFromNote(text) {
  const wantsTask = text.includes("task") || text.includes("todo") || text.includes("to do");
  const wantsNote = mentionsNotebook(text);
  const wantsCreate =
    text.includes("create") ||
    text.includes("make") ||
    text.includes("add") ||
    text.includes("turn") ||
    text.includes("convert");
  return wantsTask && wantsNote && wantsCreate;
}

function mentionsRoughTaskCreation(rawText, text) {
  if (mentionsNotebook(text)) return false;

  const wantsTask =
    text.includes("task") ||
    text.includes("tasks") ||
    text.includes("todo") ||
    text.includes("to do") ||
    text.includes("calendar") ||
    text.includes("schedule");
  const wantsCreate =
    text.includes("create") ||
    text.includes("make") ||
    text.includes("add") ||
    text.includes("schedule") ||
    text.includes("plan");
  const drafts = parseRoughTaskList(rawText);
  const hasListShape = rawText.includes("\n") || rawText.includes(";") || /:\s*\S/.test(rawText);
  const hasDate = drafts.some((draft) => !draft.usedDefaultDate);
  return wantsTask && wantsCreate && drafts.length > 0 && (hasListShape || hasDate);
}

function assistantStopWords() {
  return new Set([
    "what",
    "when",
    "where",
    "who",
    "whose",
    "which",
    "show",
    "create",
    "make",
    "add",
    "turn",
    "convert",
    "into",
    "from",
    "task",
    "tasks",
    "todo",
    "todos",
    "calendar",
    "schedule",
    "list",
    "these",
    "due",
    "date",
    "owner",
    "owned",
    "assigned",
    "family",
    "hub",
    "the",
    "and",
    "for",
    "my",
    "me",
    "with",
    "about",
    "note",
    "notes",
    "notebook",
    "summary",
    "summarize",
  ]);
}

function openTaskDialog(task = null) {
  elements.dialogTitle.textContent = task ? "Edit task" : "New task";
  elements.deleteTaskBtn.style.visibility = task ? "visible" : "hidden";

  form.id.value = task?.id ?? "";
  form.title.value = task?.title ?? "";
  form.type.value = task?.type ?? "todo";
  form.status.value = task?.status ?? "todo";
  form.requester.value = task?.requester ?? state.currentMemberId;
  form.assignee.value = task?.assignee ?? "";
  form.dueDate.value = task?.dueDate ?? isoToday;
  form.priority.value = task?.priority ?? "normal";
  form.description.value = task?.description ?? "";

  elements.taskDialog.showModal();
  form.title.focus();
  refreshIcons();
}

function closeTaskDialog() {
  elements.taskDialog.close();
  elements.taskForm.reset();
}

function saveTaskFromForm(event) {
  event.preventDefault();
  const id = form.id.value || crypto.randomUUID();
  const existing = state.tasks.find((task) => task.id === id);
  const task = {
    id,
    title: form.title.value.trim(),
    type: form.type.value,
    status: form.status.value,
    requester: form.requester.value,
    assignee: form.assignee.value,
    dueDate: form.dueDate.value,
    priority: form.priority.value,
    description: form.description.value.trim(),
    comments: existing?.comments ?? [],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    state.tasks = state.tasks.map((item) => (item.id === id ? task : item));
  } else {
    state.tasks.unshift(task);
  }

  selectedTaskId = id;
  saveState();
  closeTaskDialog();
  render();
}

function deleteCurrentTask() {
  const id = form.id.value;
  if (!id) return;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  const confirmed = window.confirm(`Delete "${task.title}"?`);
  if (!confirmed) return;

  state.tasks = state.tasks.filter((item) => item.id !== id);
  selectedTaskId = state.tasks[0]?.id ?? null;
  saveState();
  closeTaskDialog();
  render();
}

function addComment(event) {
  event.preventDefault();
  const task = getSelectedTask();
  if (!task) return;

  const data = new FormData(event.currentTarget);
  const text = String(data.get("text") || "").trim();
  if (!text) return;

  task.comments.push({
    id: crypto.randomUUID(),
    author: String(data.get("author")),
    createdAt: new Date().toISOString(),
    text,
  });
  task.updatedAt = new Date().toISOString();
  saveState();
  renderDetail();
}

function advanceTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  const order = ["todo", "discussion", "assigned", "done"];
  const next = order[Math.min(order.indexOf(task.status) + 1, order.length - 1)];
  task.status = next;
  if (next === "assigned" && !task.assignee) task.assignee = task.requester;
  task.updatedAt = new Date().toISOString();
  saveState();
  render();
}

function sendTaskEmail(task) {
  const recipient = memberEmail(task.assignee || task.requester);
  if (!recipient) {
    window.alert("Add an email address in that member's profile first.");
    return;
  }

  const subject = `Family Hub: ${task.title}`;
  const body = [
    `Task: ${task.title}`,
    `Status: ${statusLabel(task.status)}`,
    `Due: ${formatLongDate(task.dueDate)}`,
    `Requested by: ${memberName(task.requester)}`,
    `Assigned to: ${task.assignee ? memberName(task.assignee) : "Unassigned"}`,
    "",
    "Requirements:",
    task.description || "No requirements added.",
    "",
    "Latest conversation:",
    task.comments.at(-1)?.text || "No discussion yet.",
  ].join("\n");

  openMail(recipient, subject, body);
}

function sendDigestEmail() {
  const recipients = state.members
    .filter((member) => member.settings?.includeInDigest ?? true)
    .map((member) => member.email)
    .filter(Boolean);
  if (!recipients.length) {
    window.alert("Add email addresses in profile settings first.");
    return;
  }

  const activeTasks = getSortedTasks().filter((task) => task.status !== "done");
  const body = activeTasks.length
    ? activeTasks
        .map(
          (task) =>
            `- ${task.title}\n  Status: ${statusLabel(task.status)}\n  Due: ${formatLongDate(task.dueDate)}\n  Owner: ${
              task.assignee ? memberName(task.assignee) : "Unassigned"
            }`,
        )
        .join("\n\n")
    : "No active tasks.";

  openMail(
    recipients.join(","),
    "Family Hub digest",
    `Family task progress\n\n${body}`,
  );
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `family-hub-${isoToday}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importState(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = JSON.parse(String(reader.result));
      if (!Array.isArray(imported.tasks) || !Array.isArray(imported.members)) {
        throw new Error("Invalid planner file");
      }
      state = {
        members: normalizeMembers(imported.members),
        tasks: normalizeTasks(imported.tasks),
        notes: normalizeNotes(imported.notes),
        currentMemberId: imported.currentMemberId || "me",
      };
      selectedTaskId = state.tasks[0]?.id ?? null;
      saveState();
      render();
    } catch (error) {
      window.alert("That backup file could not be imported.");
      console.error(error);
    } finally {
      elements.importInput.value = "";
    }
  });
  reader.readAsText(file);
}

function changeMonth(delta) {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + delta, 1);
  renderCalendar();
}

function getSelectedTask() {
  return state.tasks.find((task) => task.id === selectedTaskId) ?? null;
}

function getNotebookNotes(memberId = state.currentMemberId) {
  if (!state.notes) {
    state.notes = normalizeNotes();
  }

  if (!Array.isArray(state.notes[memberId])) {
    state.notes[memberId] = [];
  }

  return state.notes[memberId];
}

function getSortedTasks() {
  return [...state.tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    const dateDiff = a.dueDate.localeCompare(b.dueDate);
    if (dateDiff !== 0) return dateDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function getDueState(task) {
  if (task.status === "done") return "done";
  const diff = daysUntil(task.dueDate);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "";
}

function formatDuePhrase(dateString) {
  const days = daysUntil(dateString);
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function daysUntil(dateString) {
  const target = parseLocalDate(dateString);
  const base = parseLocalDate(isoToday);
  return Math.round((target - base) / 86400000);
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, amount) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

function formatShortDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatLongDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function currentMember() {
  return getMember(state.currentMemberId) ?? state.members[0] ?? familyMembers[0];
}

function isAdminMember() {
  return state.currentMemberId === ADMIN_MEMBER_ID;
}

function getMember(id) {
  return state.members.find((member) => member.id === id) ?? null;
}

function memberName(id) {
  return getMember(id)?.name ?? "Unassigned";
}

function memberEmail(id) {
  return getMember(id)?.email ?? "";
}

function taskTypeLabel(type) {
  return {
    todo: "To do",
    ask: "Ask",
    decision: "Decision",
    appointment: "Appointment",
  }[type];
}

function statusLabel(status) {
  return statuses.find((item) => item.id === status)?.label ?? status;
}

function nextStatusLabel(status) {
  return {
    todo: "Discuss",
    discussion: "Assign",
    assigned: "Done",
    done: "Done",
  }[status];
}

function nextStatusIcon(status) {
  return {
    todo: "messages-square",
    discussion: "user-check",
    assigned: "check",
    done: "check-check",
  }[status];
}

function openMail(to, subject, body) {
  const recipients = to
    .split(",")
    .map((address) => encodeURIComponent(address.trim()))
    .filter(Boolean)
    .join(",");
  const params = new URLSearchParams({ subject, body });
  window.location.href = `mailto:${recipients}?${params.toString()}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("\n", " ");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
