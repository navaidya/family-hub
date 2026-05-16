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

const wishCategories = [
  { id: "experience", label: "Experience" },
  { id: "dinner", label: "Dinner" },
  { id: "hike", label: "Hike" },
  { id: "vacation", label: "Vacation" },
  { id: "movie", label: "Movie" },
  { id: "gift", label: "Gift" },
  { id: "other", label: "Other" },
];

const wishStatuses = [
  { id: "wish", label: "Wish" },
  { id: "discussing", label: "Discussing" },
  { id: "planned", label: "Planned" },
  { id: "done", label: "Done" },
];

const googleEmailMemberIds = {
  "navalvaidya@gmail.com": "me",
  "priyanka.naval.vaidya@gmail.com": "wife",
  "vivaanvaidya@gmail.com": "son",
  "yuvikavaidya@gmail.com": "daughter",
};

const mainViews = [
  { id: "tasks", label: "Tasks", icon: "list-checks" },
  { id: "wishlist", label: "Wishlist", icon: "sparkles" },
  { id: "vacation", label: "Vacation", icon: "map" },
];

const familyMembers = [
  {
    id: "me",
    name: "Naval",
    age: 46,
    email: "navalvaidya@gmail.com",
    color: "#0f766e",
    pin: "1980",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "wife",
    name: "Priyanka",
    age: 43,
    email: "priyanka.naval.vaidya@gmail.com",
    color: "#4754a3",
    pin: "1983",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "son",
    name: "Vivan",
    age: 16,
    email: "vivaanvaidya@gmail.com",
    color: "#d95f43",
    pin: "2010",
    settings: { reminderDays: 5, includeInDigest: true },
  },
  {
    id: "daughter",
    name: "Yuvika",
    age: 9,
    email: "yuvikavaidya@gmail.com",
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
let activeMainView = "tasks";
let activeWishMemberId = state.currentMemberId || "me";
let selectedTaskId = state.tasks[0]?.id ?? null;
let selectedTripId = state.trips?.[0]?.id ?? null;
let selectedWishId = state.wishes?.[0]?.id ?? null;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let pendingLoginMemberId = state.currentMemberId;
let cloudState = createCloudState();

const elements = {
  authGate: document.querySelector("#authGate"),
  authGoogleBtn: document.querySelector("#authGoogleBtn"),
  authStatus: document.querySelector("#authStatus"),
  currentProfileBtn: document.querySelector("#currentProfileBtn"),
  loginBtn: document.querySelector("#loginBtn"),
  memberStrip: document.querySelector("#memberStrip"),
  mainTabs: document.querySelector("#mainTabs"),
  taskView: document.querySelector("#taskView"),
  wishlistView: document.querySelector("#wishlistView"),
  vacationView: document.querySelector("#vacationView"),
  newWishBtn: document.querySelector("#newWishBtn"),
  wishTabs: document.querySelector("#wishTabs"),
  wishList: document.querySelector("#wishList"),
  wishDetail: document.querySelector("#wishDetail"),
  newTripBtn: document.querySelector("#newTripBtn"),
  tripList: document.querySelector("#tripList"),
  tripDetail: document.querySelector("#tripDetail"),
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
  tripDialog: document.querySelector("#tripDialog"),
  tripForm: document.querySelector("#tripForm"),
  tripDialogTitle: document.querySelector("#tripDialogTitle"),
  closeTripDialogBtn: document.querySelector("#closeTripDialogBtn"),
  deleteTripBtn: document.querySelector("#deleteTripBtn"),
  wishDialog: document.querySelector("#wishDialog"),
  wishForm: document.querySelector("#wishForm"),
  wishDialogTitle: document.querySelector("#wishDialogTitle"),
  closeWishDialogBtn: document.querySelector("#closeWishDialogBtn"),
  deleteWishBtn: document.querySelector("#deleteWishBtn"),
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
  accountDialog: document.querySelector("#accountDialog"),
  accountForm: document.querySelector("#accountForm"),
  accountTitle: document.querySelector("#accountTitle"),
  accountSummary: document.querySelector("#accountSummary"),
  closeAccountBtn: document.querySelector("#closeAccountBtn"),
  accountSyncBtn: document.querySelector("#accountSyncBtn"),
  accountSettingsBtn: document.querySelector("#accountSettingsBtn"),
  cloudDialog: document.querySelector("#cloudDialog"),
  cloudForm: document.querySelector("#cloudForm"),
  cloudSummary: document.querySelector("#cloudSummary"),
  cloudError: document.querySelector("#cloudError"),
  cloudGoogleBtn: document.querySelector("#cloudGoogleBtn"),
  closeCloudBtn: document.querySelector("#closeCloudBtn"),
  cloudSignOutBtn: document.querySelector("#cloudSignOutBtn"),
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

const tripForm = {
  id: document.querySelector("#tripId"),
  title: document.querySelector("#tripTitle"),
  destination: document.querySelector("#tripDestination"),
  startDate: document.querySelector("#tripStartDate"),
  endDate: document.querySelector("#tripEndDate"),
  notes: document.querySelector("#tripNotes"),
};

const wishForm = {
  id: document.querySelector("#wishId"),
  title: document.querySelector("#wishTitle"),
  owner: document.querySelector("#wishOwner"),
  category: document.querySelector("#wishCategory"),
  status: document.querySelector("#wishStatus"),
  targetDate: document.querySelector("#wishTargetDate"),
  details: document.querySelector("#wishDetails"),
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
        trips: normalizeTrips(parsed.trips),
        wishes: normalizeWishes(parsed.wishes),
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
    trips: normalizeTrips(),
    wishes: normalizeWishes(),
    currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || "me",
  };
}

function normalizeMembers(savedMembers = []) {
  return familyMembers.map((defaultMember) => {
    const saved = savedMembers.find((member) => member.id === defaultMember.id) ?? {};
    const savedName = saved.name ?? defaultMember.name;
    const shouldUseDefaultName = savedName === legacyNames[defaultMember.id];
    const savedEmail = saved.email ?? defaultMember.email;
    const shouldUseDefaultEmail = /@example\.com$/i.test(savedEmail);

    return {
      ...defaultMember,
      ...saved,
      name: shouldUseDefaultName ? defaultMember.name : savedName,
      email: shouldUseDefaultEmail ? defaultMember.email : savedEmail,
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

function normalizeTrips(trips = []) {
  if (!Array.isArray(trips)) return [];

  return trips
    .filter((trip) => trip && typeof trip === "object")
    .map((trip) => ({
      id: trip.id || crypto.randomUUID(),
      title: String(trip.title || "Family trip").trim(),
      destination: String(trip.destination || "").trim(),
      startDate: trip.startDate || isoToday,
      endDate: trip.endDate || trip.startDate || isoToday,
      notes: String(trip.notes || "").trim(),
      hotels: normalizeHotels(trip.hotels),
      days: normalizeTripDays(trip.days),
      createdAt: trip.createdAt || new Date().toISOString(),
      updatedAt: trip.updatedAt || trip.createdAt || new Date().toISOString(),
    }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function normalizeHotels(hotels = []) {
  if (!Array.isArray(hotels)) return [];
  return hotels.map((hotel) => ({
    id: hotel.id || crypto.randomUUID(),
    name: String(hotel.name || "").trim(),
    address: String(hotel.address || "").trim(),
    checkIn: hotel.checkIn || "",
    checkOut: hotel.checkOut || "",
    bookingUrl: String(hotel.bookingUrl || "").trim(),
    notes: String(hotel.notes || "").trim(),
  }));
}

function normalizeTripDays(days = []) {
  if (!Array.isArray(days)) return [];
  return days
    .map((day) => ({
      id: day.id || crypto.randomUUID(),
      date: day.date || isoToday,
      title: String(day.title || "").trim(),
      notes: String(day.notes || "").trim(),
      stops: normalizeTripStops(day.stops),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeTripStops(stops = []) {
  if (!Array.isArray(stops)) return [];
  return stops.map((stop) => ({
    id: stop.id || crypto.randomUUID(),
    type: stop.type || "sightseeing",
    name: String(stop.name || "").trim(),
    address: String(stop.address || "").trim(),
    time: String(stop.time || "").trim(),
    url: String(stop.url || "").trim(),
    notes: String(stop.notes || "").trim(),
  }));
}

function normalizeWishes(wishes = []) {
  if (!Array.isArray(wishes)) return [];

  return wishes
    .filter((wish) => wish && typeof wish === "object")
    .map((wish) => {
      const details = String(wish.details || "").trim();
      const category = wishCategories.some((item) => item.id === wish.category) ? wish.category : "experience";
      const status = wishStatuses.some((item) => item.id === wish.status) ? wish.status : "wish";
      return {
        id: wish.id || crypto.randomUUID(),
        title: String(wish.title || deriveWishTitle(details, category)).trim(),
        owner: getKnownMemberId(wish.owner) || "me",
        category,
        status,
        targetDate: wish.targetDate || "",
        details,
        comments: normalizeWishComments(wish.comments),
        createdAt: wish.createdAt || new Date().toISOString(),
        updatedAt: wish.updatedAt || wish.createdAt || new Date().toISOString(),
      };
    })
    .filter((wish) => wish.title || wish.details)
    .sort((a, b) => {
      if (a.status === "done" && b.status !== "done") return 1;
      if (a.status !== "done" && b.status === "done") return -1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function normalizeWishComments(comments = []) {
  if (!Array.isArray(comments)) return [];
  return comments
    .filter((comment) => comment && typeof comment.text === "string")
    .map((comment) => ({
      id: comment.id || crypto.randomUUID(),
      author: getKnownMemberId(comment.author) || "me",
      createdAt: comment.createdAt || new Date().toISOString(),
      text: comment.text.trim(),
    }))
    .filter((comment) => comment.text);
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
  elements.currentProfileBtn.addEventListener("click", openAccountDialog);
  elements.loginBtn.addEventListener("click", () => openLoginDialog());
  elements.newTaskBtn.addEventListener("click", () => openTaskDialog());
  elements.newWishBtn.addEventListener("click", () => openWishDialog());
  elements.newTripBtn.addEventListener("click", () => openTripDialog());
  elements.closeDialogBtn.addEventListener("click", () => closeTaskDialog());
  elements.taskForm.addEventListener("submit", saveTaskFromForm);
  elements.deleteTaskBtn.addEventListener("click", deleteCurrentTask);
  elements.closeTripDialogBtn.addEventListener("click", closeTripDialog);
  elements.tripForm.addEventListener("submit", saveTripFromForm);
  elements.deleteTripBtn.addEventListener("click", deleteCurrentTrip);
  elements.closeWishDialogBtn.addEventListener("click", closeWishDialog);
  elements.wishForm.addEventListener("submit", saveWishFromForm);
  elements.deleteWishBtn.addEventListener("click", deleteCurrentWish);
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

  elements.tripDialog.addEventListener("click", (event) => {
    if (event.target === elements.tripDialog) closeTripDialog();
  });

  elements.wishDialog.addEventListener("click", (event) => {
    if (event.target === elements.wishDialog) closeWishDialog();
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

  elements.accountForm.addEventListener("submit", (event) => event.preventDefault());
  elements.closeAccountBtn.addEventListener("click", closeAccountDialog);
  elements.accountSyncBtn.addEventListener("click", () => {
    closeAccountDialog();
    openCloudDialog();
  });
  elements.accountSettingsBtn.addEventListener("click", () => {
    closeAccountDialog();
    openProfileDialog();
  });
  elements.accountDialog.addEventListener("click", (event) => {
    if (event.target === elements.accountDialog) closeAccountDialog();
  });

  elements.cloudForm.addEventListener("submit", (event) => event.preventDefault());
  elements.authGoogleBtn.addEventListener("click", signInWithGoogle);
  elements.closeCloudBtn.addEventListener("click", closeCloudDialog);
  elements.cloudGoogleBtn.addEventListener("click", signInWithGoogle);
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
    renderAuthGate("local");
    renderCloudStatus();
    return;
  }

  renderAuthGate("loading");

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
        applySignedInProfile(user);
        render();
        subscribeToFamilyDoc();
      }

      renderAuthGate(user ? "ready" : "required");
      renderCloudStatus();
      renderCloudDialog();
    });
  } catch (error) {
    cloudState.error = error.message || "Firebase could not start.";
    renderAuthGate("local");
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
  const members = normalizeMembers(data.members);
  const signedInMemberId = memberIdForGoogleUser(cloudState.user, members);
  state = {
    members,
    tasks: normalizeTasks(data.tasks?.length ? data.tasks : []),
    notes: normalizeNotes(data.notes),
    trips: normalizeTrips(data.trips),
    wishes: normalizeWishes(data.wishes),
    currentMemberId: signedInMemberId || localStorage.getItem(LOCAL_PROFILE_KEY) || state.currentMemberId || "me",
  };

  if (!getMember(state.currentMemberId)) {
    state.currentMemberId = state.members[0]?.id || "me";
  }

  if (!state.tasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = state.tasks[0]?.id ?? null;
  }

  if (!state.trips.some((trip) => trip.id === selectedTripId)) {
    selectedTripId = state.trips[0]?.id ?? null;
  }

  if (!state.wishes.some((wish) => wish.id === selectedWishId)) {
    selectedWishId = state.wishes[0]?.id ?? null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LOCAL_PROFILE_KEY, state.currentMemberId);
  cloudState.applyingRemote = false;
  render();
}

function applySignedInProfile(user) {
  const memberId = memberIdForGoogleUser(user, state.members);
  if (!memberId || state.currentMemberId === memberId) return;

  state.currentMemberId = memberId;
  activeWishMemberId = memberId;
  localStorage.setItem(LOCAL_PROFILE_KEY, memberId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    trips: state.trips,
    wishes: state.wishes,
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
  renderCurrentProfile();
  refreshIcons();
}

function renderAuthGate(mode) {
  const isRequired = mode === "required" || mode === "loading";
  document.body.classList.toggle("auth-loading", mode === "loading");
  document.body.classList.toggle("auth-required", mode === "required");
  document.body.classList.toggle("auth-ready", mode === "ready" || mode === "local");

  if (!elements.authGate) return;
  elements.authGate.hidden = !isRequired;
  elements.authGoogleBtn.disabled = mode === "loading";
  elements.authStatus.textContent = mode === "loading" ? "Checking sign-in..." : "";
}

function openCloudDialog() {
  elements.cloudError.textContent = "";
  renderCloudDialog();
  elements.cloudDialog.showModal();
  if (!cloudState.user) elements.cloudGoogleBtn.focus();
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
    elements.cloudGoogleBtn.hidden = false;
    elements.cloudGoogleBtn.disabled = true;
    elements.cloudSignOutBtn.disabled = true;
    return;
  }

  if (cloudState.user) {
    elements.cloudSummary.innerHTML = `
      <strong>Synced as ${escapeHTML(cloudState.user.email || "Firebase user")}</strong>
      <span>Family data: ${escapeHTML(familyId)}</span>
    `;
    elements.cloudGoogleBtn.hidden = true;
    elements.cloudGoogleBtn.disabled = true;
    elements.cloudSignOutBtn.disabled = false;
    return;
  }

  elements.cloudSummary.innerHTML = `
    <strong>Cloud sync ready</strong>
    <span>Sign in with a family Google account to share tasks through Firestore.</span>
  `;
  elements.cloudGoogleBtn.hidden = false;
  elements.cloudGoogleBtn.disabled = false;
  elements.cloudSignOutBtn.disabled = true;
}

function closeCloudDialog() {
  elements.cloudDialog.close();
  elements.cloudForm.reset();
  elements.cloudError.textContent = "";
}

function openAccountDialog() {
  const member = currentMember();
  elements.accountTitle.textContent = member.name;
  renderAccountDialog();
  elements.accountDialog.showModal();
  elements.accountSyncBtn.focus();
  refreshIcons();
}

function renderAccountDialog() {
  const member = currentMember();
  elements.accountSummary.innerHTML = `
    <div class="profile-preview compact">
      <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
      <div>
        <strong>${escapeHTML(member.name)}</strong>
        <span>${escapeHTML(syncStatusDetail())}</span>
      </div>
    </div>
  `;
}

function closeAccountDialog() {
  elements.accountDialog.close();
  elements.accountForm.reset();
}

function signInWithGoogle() {
  if (!cloudState.configured) {
    elements.cloudError.textContent = "Add Firebase config first.";
    return;
  }

  elements.cloudError.textContent = "";
  elements.authStatus.textContent = "";
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
      const message = firebaseErrorMessage(error);
      elements.cloudError.textContent = message;
      elements.authStatus.textContent = message;
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
  if (code.includes("unauthorized-domain")) return "Add this website domain in Firebase Authentication settings.";
  if (code.includes("popup-blocked")) return "Allow popups or try again in Safari/Chrome.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was closed before it finished.";
  if (code.includes("operation-not-allowed")) return "Enable Google sign-in in Firebase Authentication.";
  if (code.includes("invalid-credential")) {
    return "Google sign-in did not complete. Try again.";
  }
  return error?.message || "Firebase sign-in failed.";
}

function render() {
  renderCloudStatus();
  renderCurrentProfile();
  renderMemberStrip();
  renderMainTabs();
  renderWishes();
  renderTrips();
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
  const sync = syncStatusSummary();
  elements.currentProfileBtn.innerHTML = `
    <span class="avatar" style="background:${member.color}">${initials(member.name)}</span>
    <span>
      <strong>${escapeHTML(member.name)}</strong>
      <small class="${sync.className}">${escapeHTML(sync.label)}</small>
    </span>
  `;
}

function renderMemberStrip() {
  elements.memberStrip.innerHTML = state.members
    .map((member) => {
      const assigned = state.tasks.filter((task) => task.assignee === member.id && task.status !== "done").length;
      const requested = state.tasks.filter((task) => task.requester === member.id && task.status !== "done").length;
      const wishes = state.wishes.filter((wish) => wish.owner === member.id && wish.status !== "done").length;
      return `
        <button class="member-tile ${member.id === state.currentMemberId ? "current" : ""}" type="button" data-login-member="${member.id}">
          <div class="avatar" style="background:${member.color}">${initials(member.name)}</div>
          <div>
            <strong>${escapeHTML(member.name)}</strong>
            <span>${assigned} assigned · ${requested} asked · ${wishes} wishes</span>
          </div>
        </button>
      `;
    })
    .join("");

  elements.memberStrip.querySelectorAll("[data-login-member]").forEach((button) => {
    button.addEventListener("click", () => openLoginDialog(button.dataset.loginMember));
  });
}

function renderMainTabs() {
  elements.mainTabs.innerHTML = mainViews
    .map((view) => {
      const count =
        {
          tasks: state.tasks.filter((task) => task.status !== "done").length,
          wishlist: state.wishes.filter((wish) => wish.status !== "done").length,
          vacation: state.trips.length,
        }[view.id] ?? 0;
      return `
        <button class="main-tab ${activeMainView === view.id ? "active" : ""}" type="button" data-main-view="${view.id}">
          <i data-lucide="${view.icon}"></i>
          <span>${view.label}</span>
          <strong>${count}</strong>
        </button>
      `;
    })
    .join("");

  elements.taskView.hidden = activeMainView !== "tasks";
  elements.wishlistView.hidden = activeMainView !== "wishlist";
  elements.vacationView.hidden = activeMainView !== "vacation";

  elements.mainTabs.querySelectorAll("[data-main-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMainView = button.dataset.mainView;
      renderMainTabs();
      refreshIcons();
    });
  });
}

function renderWishes() {
  renderWishTabs();
  const wishes = getSortedWishes().filter((wish) => wish.owner === activeWishMemberId);
  const activeMember = getMember(activeWishMemberId) || currentMember();

  if (!wishes.length) {
    selectedWishId = null;
    elements.wishList.innerHTML = `<div class="empty-state compact">No wishes for ${escapeHTML(activeMember.name)} yet.</div>`;
    elements.wishDetail.innerHTML = `
      <div class="empty-detail compact-detail">
        <i data-lucide="sparkles"></i>
        <h2>${escapeHTML(activeMember.name)}'s wishlist</h2>
        <p>Add dinners, hikes, movies, vacations, gifts, or anything the family should understand.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  if (!wishes.some((wish) => wish.id === selectedWishId)) {
    selectedWishId = wishes[0].id;
  }

  elements.wishList.innerHTML = wishes
    .map((wish) => {
      const owner = getMember(wish.owner);
      const targetDate = wish.targetDate ? formatShortDate(wish.targetDate) : "No date";
      return `
        <button class="wish-row ${wish.id === selectedWishId ? "selected" : ""} ${wish.status === "done" ? "done" : ""}" type="button" data-wish-id="${escapeAttribute(wish.id)}">
          <span class="avatar mini" style="background:${owner?.color || "var(--teal)"}">${initials(owner?.name || "F")}</span>
          <span>
            <strong>${escapeHTML(wish.title)}</strong>
            <span>${escapeHTML(memberName(wish.owner))} · ${wishCategoryLabel(wish.category)} · ${targetDate}</span>
          </span>
        </button>
      `;
    })
    .join("");

  elements.wishList.querySelectorAll("[data-wish-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedWishId = button.dataset.wishId;
      renderWishes();
      refreshIcons();
    });
  });

  renderWishDetail();
}

function renderWishTabs() {
  if (!getMember(activeWishMemberId)) {
    activeWishMemberId = state.currentMemberId || state.members[0]?.id || "me";
  }

  elements.wishTabs.innerHTML = state.members
    .map((member) => {
      const count = state.wishes.filter((wish) => wish.owner === member.id && wish.status !== "done").length;
      return `
        <button class="segment ${activeWishMemberId === member.id ? "active" : ""}" type="button" data-wish-member="${member.id}">
          ${escapeHTML(member.name)} ${count}
        </button>
      `;
    })
    .join("");

  elements.wishTabs.querySelectorAll("[data-wish-member]").forEach((button) => {
    button.addEventListener("click", () => {
      activeWishMemberId = button.dataset.wishMember;
      selectedWishId = null;
      renderWishes();
      refreshIcons();
    });
  });
}

function renderWishDetail() {
  const wish = getSelectedWish();
  if (!wish) return;

  const comments = wish.comments.length
    ? wish.comments
        .map(
          (comment) => `
            <article class="comment wish-comment">
              <div class="comment-meta">${escapeHTML(memberName(comment.author))} · ${formatDateTime(comment.createdAt)}</div>
              <p>${escapeHTML(comment.text)}</p>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state compact">No discussion yet.</div>`;

  elements.wishDetail.innerHTML = `
    <div class="wish-detail-stack">
      <div class="detail-top">
        <div>
          <p class="eyebrow">${wishCategoryLabel(wish.category)}</p>
          <h2 class="detail-title">${escapeHTML(wish.title)}</h2>
        </div>
        <div class="detail-actions">
          <button class="secondary-button" type="button" data-wish-edit><i data-lucide="pencil"></i>Edit</button>
          <button class="chip-button" type="button" data-wish-task><i data-lucide="list-plus"></i>Make task</button>
          ${wish.status !== "done" ? `<button class="secondary-button" type="button" data-wish-done><i data-lucide="check"></i>Done</button>` : ""}
        </div>
      </div>

      <section class="detail-facts">
        <div class="fact"><span>For</span><strong>${escapeHTML(memberName(wish.owner))}</strong></div>
        <div class="fact"><span>Status</span><strong>${wishStatusLabel(wish.status)}</strong></div>
        <div class="fact"><span>Target date</span><strong>${wish.targetDate ? formatLongDate(wish.targetDate) : "Open"}</strong></div>
        <div class="fact"><span>Discussion</span><strong>${wish.comments.length} note${wish.comments.length === 1 ? "" : "s"}</strong></div>
      </section>

      <section class="requirements">
        <h3>Wish details</h3>
        <p class="task-description">${escapeHTML(wish.details || "No details added.")}</p>
      </section>

      <section class="conversation">
        <h3>Discussion</h3>
        ${comments}
        <form class="comment-form" data-wish-comment-form>
          <select aria-label="Comment author" name="author">
            ${state.members
              .map(
                (member) =>
                  `<option value="${member.id}" ${member.id === state.currentMemberId ? "selected" : ""}>${escapeHTML(member.name)}</option>`,
              )
              .join("")}
          </select>
          <input aria-label="Comment" name="text" placeholder="Ask a question or add detail" required maxlength="260" />
          <button class="primary-button" type="submit"><i data-lucide="send"></i>Send</button>
        </form>
      </section>
    </div>
  `;

  elements.wishDetail.querySelector("[data-wish-edit]").addEventListener("click", () => openWishDialog(wish));
  elements.wishDetail.querySelector("[data-wish-task]").addEventListener("click", () => makeTaskFromWish(wish.id));
  elements.wishDetail.querySelector("[data-wish-comment-form]").addEventListener("submit", addWishComment);
  elements.wishDetail.querySelector("[data-wish-done]")?.addEventListener("click", () => markWishDone(wish.id));
  refreshIcons();
}

function renderTrips() {
  if (!state.trips.length) {
    elements.tripList.innerHTML = `<div class="empty-state compact">No trips yet.</div>`;
    elements.tripDetail.innerHTML = `
      <div class="empty-detail compact-detail">
        <i data-lucide="map"></i>
        <h2>Plan a family vacation</h2>
        <p>Add a trip, then build hotels, food stops, sightseeing, and day-by-day maps.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  if (!getSelectedTrip()) {
    selectedTripId = state.trips[0].id;
  }

  elements.tripList.innerHTML = state.trips
    .map(
      (trip) => `
        <button class="trip-row ${trip.id === selectedTripId ? "selected" : ""}" type="button" data-trip-id="${escapeAttribute(trip.id)}">
          <strong>${escapeHTML(trip.title)}</strong>
          <span>${escapeHTML(trip.destination)} · ${formatTripRange(trip)}</span>
          <span>${trip.days.length} day${trip.days.length === 1 ? "" : "s"} · ${trip.hotels.length} hotel${trip.hotels.length === 1 ? "" : "s"}</span>
        </button>
      `,
    )
    .join("");

  elements.tripList.querySelectorAll("[data-trip-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTripId = button.dataset.tripId;
      renderTrips();
    });
  });

  renderTripDetail();
}

function renderTripDetail() {
  const trip = getSelectedTrip();
  if (!trip) return;

  const destinationLinks = renderMapLinks(`${trip.destination}`, "Destination map");
  const hotelCards = trip.hotels.length
    ? trip.hotels.map((hotel) => renderHotelCard(hotel)).join("")
    : `<div class="empty-state compact">No hotel stays added.</div>`;
  const dayCards = trip.days.length
    ? trip.days.map((day) => renderTripDayCard(trip, day)).join("")
    : `<div class="empty-state compact">No daily plans yet.</div>`;

  elements.tripDetail.innerHTML = `
    <div class="trip-detail-stack">
      <div class="trip-hero">
        <div>
          <p class="eyebrow">${escapeHTML(trip.destination || "Trip")}</p>
          <h3>${escapeHTML(trip.title)}</h3>
          <p>${formatTripRange(trip)}</p>
        </div>
        <div class="detail-actions">
          ${destinationLinks}
          <button class="secondary-button" type="button" data-trip-edit="${escapeAttribute(trip.id)}"><i data-lucide="pencil"></i>Edit</button>
        </div>
      </div>

      <section class="trip-section">
        <h3>Trip notes</h3>
        <p class="task-description">${escapeHTML(trip.notes || "No trip notes yet.")}</p>
      </section>

      <section class="trip-section">
        <div class="section-heading-inline">
          <h3>Hotel stays</h3>
        </div>
        <div class="hotel-list">${hotelCards}</div>
        ${renderHotelForm(trip)}
      </section>

      <section class="trip-section">
        <div class="section-heading-inline">
          <h3>Daily plans</h3>
        </div>
        ${renderTripDayForm(trip)}
        <div class="trip-day-list">${dayCards}</div>
      </section>
    </div>
  `;

  elements.tripDetail.querySelector("[data-trip-edit]").addEventListener("click", () => openTripDialog(trip));
  elements.tripDetail.querySelector("[data-hotel-form]").addEventListener("submit", addHotelToTrip);
  elements.tripDetail.querySelector("[data-day-form]").addEventListener("submit", addDayToTrip);
  elements.tripDetail.querySelectorAll("[data-hotel-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteHotelFromTrip(button.dataset.hotelDelete));
  });
  elements.tripDetail.querySelectorAll("[data-day-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteDayFromTrip(button.dataset.dayDelete));
  });
  elements.tripDetail.querySelectorAll("[data-stop-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteStopFromDay(button.dataset.dayId, button.dataset.stopDelete));
  });
  elements.tripDetail.querySelectorAll("[data-stop-form]").forEach((formElement) => {
    formElement.addEventListener("submit", addStopToDay);
  });
  refreshIcons();
}

function renderHotelCard(hotel) {
  const address = hotel.address || hotel.name;
  return `
    <article class="hotel-card">
      <div>
        <strong>${escapeHTML(hotel.name || "Hotel stay")}</strong>
        <p>${escapeHTML(hotel.address || "No address added.")}</p>
        <p>${escapeHTML(formatStayRange(hotel))}</p>
        ${hotel.notes ? `<p>${escapeHTML(hotel.notes)}</p>` : ""}
      </div>
      <div class="detail-actions">
        ${renderMapLinks(address, "Hotel map")}
        ${hotel.bookingUrl ? `<a class="secondary-button" href="${escapeAttribute(hotel.bookingUrl)}" target="_blank" rel="noreferrer"><i data-lucide="external-link"></i>Booking</a>` : ""}
        <button class="icon-button danger" type="button" data-hotel-delete="${escapeAttribute(hotel.id)}" title="Delete hotel" aria-label="Delete hotel">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `;
}

function renderHotelForm(trip) {
  return `
    <form class="travel-form" data-hotel-form data-trip-id="${escapeAttribute(trip.id)}">
      <input name="name" required maxlength="90" placeholder="Hotel name" />
      <input name="address" maxlength="160" placeholder="Hotel address" />
      <input name="checkIn" type="date" value="${escapeAttribute(trip.startDate)}" />
      <input name="checkOut" type="date" value="${escapeAttribute(trip.endDate)}" />
      <input name="bookingUrl" type="url" placeholder="Booking link" />
      <input name="notes" maxlength="180" placeholder="Confirmation, parking, breakfast" />
      <button class="secondary-button" type="submit"><i data-lucide="bed"></i>Add hotel</button>
    </form>
  `;
}

function renderTripDayForm(trip) {
  return `
    <form class="travel-form day-form" data-day-form data-trip-id="${escapeAttribute(trip.id)}">
      <input name="date" type="date" required value="${escapeAttribute(nextTripDayDate(trip))}" />
      <input name="title" maxlength="80" placeholder="Day title, e.g. Beach and Old Town" />
      <input name="notes" maxlength="180" placeholder="Per-day plan notes" />
      <button class="secondary-button" type="submit"><i data-lucide="calendar-plus"></i>Add day</button>
    </form>
  `;
}

function renderTripDayCard(trip, day) {
  const stops = day.stops.length
    ? day.stops.map((stop) => renderTripStop(day, stop)).join("")
    : `<div class="empty-state compact">No stops yet.</div>`;
  return `
    <article class="trip-day-card">
      <div class="trip-day-heading">
        <div>
          <p class="eyebrow">${formatLongDate(day.date)}</p>
          <h3>${escapeHTML(day.title || `Day ${trip.days.indexOf(day) + 1}`)}</h3>
          ${day.notes ? `<p>${escapeHTML(day.notes)}</p>` : ""}
        </div>
        <div class="detail-actions">
          ${renderDayMapLinks(day)}
          <button class="icon-button danger" type="button" data-day-delete="${escapeAttribute(day.id)}" title="Delete day" aria-label="Delete day">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="stop-list">${stops}</div>
      ${renderStopForm(day)}
    </article>
  `;
}

function renderTripStop(day, stop) {
  const place = stop.address || stop.name;
  return `
    <article class="stop-card ${escapeAttribute(stop.type)}">
      <div>
        <span class="badge">${tripStopTypeLabel(stop.type)}</span>
        <strong>${escapeHTML(stop.time ? `${stop.time} · ${stop.name}` : stop.name)}</strong>
        <p>${escapeHTML(stop.address || "No address added.")}</p>
        ${stop.notes ? `<p>${escapeHTML(stop.notes)}</p>` : ""}
      </div>
      <div class="detail-actions">
        ${renderMapLinks(place, "Stop map")}
        ${stop.url ? `<a class="secondary-button" href="${escapeAttribute(stop.url)}" target="_blank" rel="noreferrer"><i data-lucide="external-link"></i>Link</a>` : ""}
        <button class="icon-button danger" type="button" data-day-id="${escapeAttribute(day.id)}" data-stop-delete="${escapeAttribute(stop.id)}" title="Delete stop" aria-label="Delete stop">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `;
}

function renderStopForm(day) {
  return `
    <form class="travel-form stop-form" data-stop-form data-day-id="${escapeAttribute(day.id)}">
      <select name="type">
        <option value="sightseeing">Sightseeing</option>
        <option value="food">Food stop</option>
        <option value="hotel">Hotel</option>
        <option value="drive">Drive</option>
        <option value="other">Other</option>
      </select>
      <input name="time" placeholder="Time" maxlength="20" />
      <input name="name" required maxlength="90" placeholder="Place or activity" />
      <input name="address" maxlength="160" placeholder="Address or map search text" />
      <input name="url" type="url" placeholder="Website/menu link" />
      <input name="notes" maxlength="180" placeholder="Notes, tickets, must order" />
      <button class="secondary-button" type="submit"><i data-lucide="map-pin-plus"></i>Add stop</button>
    </form>
  `;
}

function addHotelToTrip(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  if (!trip) return;
  const data = new FormData(event.currentTarget);
  trip.hotels.push({
    id: crypto.randomUUID(),
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    checkIn: String(data.get("checkIn") || ""),
    checkOut: String(data.get("checkOut") || ""),
    bookingUrl: String(data.get("bookingUrl") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
  });
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function addDayToTrip(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  if (!trip) return;
  const data = new FormData(event.currentTarget);
  trip.days.push({
    id: crypto.randomUUID(),
    date: String(data.get("date") || trip.startDate),
    title: String(data.get("title") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
    stops: [],
  });
  trip.days.sort((a, b) => a.date.localeCompare(b.date));
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function addStopToDay(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  const day = trip?.days.find((item) => item.id === event.currentTarget.dataset.dayId);
  if (!day) return;

  const data = new FormData(event.currentTarget);
  day.stops.push({
    id: crypto.randomUUID(),
    type: String(data.get("type") || "sightseeing"),
    time: String(data.get("time") || "").trim(),
    name: String(data.get("name") || "").trim(),
    address: String(data.get("address") || "").trim(),
    url: String(data.get("url") || "").trim(),
    notes: String(data.get("notes") || "").trim(),
  });
  day.stops.sort((a, b) => a.time.localeCompare(b.time));
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function deleteHotelFromTrip(hotelId) {
  const trip = getSelectedTrip();
  if (!trip) return;
  trip.hotels = trip.hotels.filter((hotel) => hotel.id !== hotelId);
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function deleteDayFromTrip(dayId) {
  const trip = getSelectedTrip();
  if (!trip) return;
  const confirmed = window.confirm("Delete this day plan?");
  if (!confirmed) return;
  trip.days = trip.days.filter((day) => day.id !== dayId);
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function deleteStopFromDay(dayId, stopId) {
  const trip = getSelectedTrip();
  const day = trip?.days.find((item) => item.id === dayId);
  if (!day) return;
  day.stops = day.stops.filter((stop) => stop.id !== stopId);
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
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
  if (activeMainView === "wishlist") {
    activeWishMemberId = member.id;
    selectedWishId = null;
  }
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
    .filter((status) => status.id !== "done")
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

  wishForm.owner.innerHTML = memberOptions;
  wishForm.category.innerHTML = wishCategories
    .map((category) => `<option value="${category.id}">${category.label}</option>`)
    .join("");
  wishForm.status.innerHTML = wishStatuses
    .map((status) => `<option value="${status.id}">${status.label}</option>`)
    .join("");
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
        const tripEvents = getTripEventsForDate(iso);
        const wishEvents = getWishEventsForDate(iso);
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
              ${tripEvents
                .map(
                  (event) => `
                    <button class="calendar-task trip" type="button" data-calendar-trip="${event.tripId}" title="${escapeAttribute(event.title)}">
                      ${escapeHTML(event.title)}
                    </button>
                  `,
                )
                .join("")}
              ${wishEvents
                .map(
                  (event) => `
                    <button class="calendar-task wish" type="button" data-calendar-wish="${event.wishId}" title="${escapeAttribute(event.title)}">
                      ${escapeHTML(event.title)}
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
      activeMainView = "tasks";
      selectedTaskId = button.dataset.taskId;
      renderMainTabs();
      renderTasks();
      renderDetail();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  elements.calendarGrid.querySelectorAll("[data-calendar-trip]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMainView = "vacation";
      selectedTripId = button.dataset.calendarTrip;
      renderMainTabs();
      renderTrips();
      elements.tripDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  elements.calendarGrid.querySelectorAll("[data-calendar-wish]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMainView = "wishlist";
      selectedWishId = button.dataset.calendarWish;
      activeWishMemberId = getSelectedWish()?.owner || activeWishMemberId;
      renderMainTabs();
      renderWishes();
      elements.wishDetail.scrollIntoView({ behavior: "smooth", block: "start" });
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
    "Show wishlist",
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
    return "I can answer things like: what is due today, what is due this week, who owns a task, what is overdue, what is unassigned, show family wishes, show my notes, create a task from a note, or summarize a family member's tasks.";
  }

  if (mentionsTaskCreationFromNote(normalized)) {
    const member = person || currentMember();
    return createTaskFromNotebookQuestion(normalized, member);
  }

  if (mentionsRoughTaskCreation(question, normalized)) {
    return createTasksFromRoughList(question);
  }

  if (mentionsWish(normalized)) {
    const wishes = getSortedWishes().filter((wish) => wish.status !== "done");
    if (person) {
      return formatWishAnswer(`${person.name}'s wishes`, wishes.filter((wish) => wish.owner === person.id));
    }

    const matchingWishes = searchWishes(normalized, wishes);
    return formatWishAnswer("Wishlist", matchingWishes.length ? matchingWishes : wishes);
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

function searchWishes(text, wishes) {
  const terms = text
    .replace(/[?.,]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !assistantStopWords().has(term));

  if (!terms.length) return wishes;

  return wishes.filter((wish) => {
    const haystack = [
      wish.title,
      wish.details,
      wishCategoryLabel(wish.category),
      wishStatusLabel(wish.status),
      memberName(wish.owner),
      wish.targetDate ? formatLongDate(wish.targetDate) : "",
    ]
      .join(" ")
      .toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
}

function formatNotebookAnswer(member, notes) {
  if (!notes.length) return `${member.name}'s notebook has no notes yet.`;

  return `${member.name}'s notebook: ${notes.length} note${notes.length === 1 ? "" : "s"}\n\n${notes
    .slice(0, 5)
    .map((note) => `- ${note.text} (${formatDateTime(note.updatedAt)})`)
    .join("\n")}`;
}

function formatWishAnswer(title, wishes) {
  if (!wishes.length) return `${title}: none found.`;
  return `${title}: ${wishes.length}\n\n${formatWishLines(wishes)}`;
}

function formatWishLines(wishes) {
  return wishes
    .slice(0, 8)
    .map((wish) => {
      const target = wish.targetDate ? `, target ${formatLongDate(wish.targetDate)}` : "";
      return `- ${wish.title}: ${memberName(wish.owner)}, ${wishCategoryLabel(wish.category)}, ${wishStatusLabel(wish.status)}${target}`;
    })
    .join("\n");
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

function mentionsWish(text) {
  return text.includes("wish") || text.includes("wishlist") || text.includes("bucket") || text.includes("dream");
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
    "wish",
    "wishes",
    "wishlist",
    "bucket",
    "dream",
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

function openTripDialog(trip = null) {
  elements.tripDialogTitle.textContent = trip ? "Edit trip" : "New trip";
  elements.deleteTripBtn.style.visibility = trip ? "visible" : "hidden";

  tripForm.id.value = trip?.id ?? "";
  tripForm.title.value = trip?.title ?? "";
  tripForm.destination.value = trip?.destination ?? "";
  tripForm.startDate.value = trip?.startDate ?? isoToday;
  tripForm.endDate.value = trip?.endDate ?? addDays(isoToday, 3);
  tripForm.notes.value = trip?.notes ?? "";

  elements.tripDialog.showModal();
  tripForm.title.focus();
  refreshIcons();
}

function closeTripDialog() {
  elements.tripDialog.close();
  elements.tripForm.reset();
}

function openWishDialog(wish = null) {
  elements.wishDialogTitle.textContent = wish ? "Edit wish" : "New wish";
  elements.deleteWishBtn.style.visibility = wish ? "visible" : "hidden";

  wishForm.id.value = wish?.id ?? "";
  wishForm.title.value = wish?.title ?? "";
  wishForm.owner.value = wish?.owner ?? activeWishMemberId ?? state.currentMemberId;
  wishForm.category.value = wish?.category ?? "experience";
  wishForm.status.value = wish?.status ?? "wish";
  wishForm.targetDate.value = wish?.targetDate ?? "";
  wishForm.details.value = wish?.details ?? "";

  elements.wishDialog.showModal();
  wishForm.details.focus();
  refreshIcons();
}

function closeWishDialog() {
  elements.wishDialog.close();
  elements.wishForm.reset();
}

function saveWishFromForm(event) {
  event.preventDefault();
  const id = wishForm.id.value || crypto.randomUUID();
  const existing = state.wishes.find((wish) => wish.id === id);
  const details = wishForm.details.value.trim();
  const category = wishForm.category.value;
  const now = new Date().toISOString();
  const wish = {
    id,
    title: (wishForm.title.value.trim() || deriveWishTitle(details, category)).slice(0, 90),
    owner: wishForm.owner.value,
    category,
    status: wishForm.status.value,
    targetDate: wishForm.targetDate.value,
    details,
    comments: existing?.comments ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    state.wishes = state.wishes.map((item) => (item.id === id ? wish : item));
  } else {
    state.wishes.unshift(wish);
  }

  activeWishMemberId = wish.owner;
  selectedWishId = id;
  saveState();
  closeWishDialog();
  render();
}

function deleteCurrentWish() {
  const id = wishForm.id.value;
  if (!id) return;
  const wish = state.wishes.find((item) => item.id === id);
  if (!wish) return;
  const confirmed = window.confirm(`Delete "${wish.title}"?`);
  if (!confirmed) return;

  state.wishes = state.wishes.filter((item) => item.id !== id);
  selectedWishId = state.wishes[0]?.id ?? null;
  saveState();
  closeWishDialog();
  render();
}

function saveTripFromForm(event) {
  event.preventDefault();
  const id = tripForm.id.value || crypto.randomUUID();
  const existing = state.trips.find((trip) => trip.id === id);
  const now = new Date().toISOString();
  const startDate = tripForm.startDate.value;
  const endDate = tripForm.endDate.value < startDate ? startDate : tripForm.endDate.value;
  const trip = {
    id,
    title: tripForm.title.value.trim(),
    destination: tripForm.destination.value.trim(),
    startDate,
    endDate,
    notes: tripForm.notes.value.trim(),
    hotels: existing?.hotels ?? [],
    days: existing?.days ?? buildDefaultTripDays(startDate, endDate),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    state.trips = state.trips.map((item) => (item.id === id ? trip : item));
  } else {
    state.trips.push(trip);
  }

  state.trips.sort((a, b) => a.startDate.localeCompare(b.startDate));
  selectedTripId = id;
  saveState();
  closeTripDialog();
  renderTrips();
}

function deleteCurrentTrip() {
  const id = tripForm.id.value;
  if (!id) return;
  const trip = state.trips.find((item) => item.id === id);
  if (!trip) return;
  const confirmed = window.confirm(`Delete "${trip.title}"?`);
  if (!confirmed) return;

  state.trips = state.trips.filter((item) => item.id !== id);
  selectedTripId = state.trips[0]?.id ?? null;
  saveState();
  closeTripDialog();
  renderTrips();
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

function addWishComment(event) {
  event.preventDefault();
  const wish = getSelectedWish();
  if (!wish) return;

  const data = new FormData(event.currentTarget);
  const text = String(data.get("text") || "").trim();
  if (!text) return;

  wish.comments.push({
    id: crypto.randomUUID(),
    author: String(data.get("author")),
    createdAt: new Date().toISOString(),
    text,
  });
  wish.status = wish.status === "wish" ? "discussing" : wish.status;
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

function makeTaskFromWish(wishId) {
  const wish = state.wishes.find((item) => item.id === wishId);
  if (!wish) return;

  const now = new Date().toISOString();
  const task = {
    id: crypto.randomUUID(),
    title: wish.title,
    type: wish.category === "gift" ? "ask" : "todo",
    status: "discussion",
    requester: wish.owner,
    assignee: "",
    dueDate: wish.targetDate || addDays(isoToday, 7),
    priority: "normal",
    description: `Created from Wishlist.\n\nCategory: ${wishCategoryLabel(wish.category)}\nWish details:\n${wish.details || "No details added."}`,
    comments: [
      {
        id: crypto.randomUUID(),
        author: state.currentMemberId,
        createdAt: now,
        text: "Created from a Wishlist item.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  state.tasks.unshift(task);
  wish.status = "planned";
  wish.updatedAt = now;
  activeMainView = "tasks";
  selectedTaskId = task.id;
  saveState();
  render();
  document.querySelector(".dashboard-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function markWishDone(wishId) {
  const wish = state.wishes.find((item) => item.id === wishId);
  if (!wish) return;
  wish.status = "done";
  wish.updatedAt = new Date().toISOString();
  saveState();
  render();
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
        trips: normalizeTrips(imported.trips),
        wishes: normalizeWishes(imported.wishes),
        currentMemberId: imported.currentMemberId || "me",
      };
      selectedTaskId = state.tasks[0]?.id ?? null;
      selectedTripId = state.trips[0]?.id ?? null;
      selectedWishId = state.wishes[0]?.id ?? null;
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

function getSelectedTrip() {
  return state.trips.find((trip) => trip.id === selectedTripId) ?? null;
}

function getSelectedWish() {
  return state.wishes.find((wish) => wish.id === selectedWishId) ?? null;
}

function getTripEventsForDate(dateString) {
  return state.trips.flatMap((trip) => {
    const events = [];
    if (dateString === trip.startDate) {
      events.push({ tripId: trip.id, title: `Trip starts: ${trip.title}` });
    }
    if (dateString === trip.endDate && trip.endDate !== trip.startDate) {
      events.push({ tripId: trip.id, title: `Trip ends: ${trip.title}` });
    }
    trip.days
      .filter((day) => day.date === dateString)
      .forEach((day) => {
        events.push({ tripId: trip.id, title: day.title || `${trip.title} plan` });
      });
    return events;
  });
}

function getWishEventsForDate(dateString) {
  return state.wishes
    .filter((wish) => wish.targetDate === dateString && wish.status !== "done")
    .map((wish) => ({
      wishId: wish.id,
      title: `Wish: ${wish.title}`,
    }));
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

function getSortedWishes() {
  return [...state.wishes].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    if (a.targetDate && b.targetDate && a.targetDate !== b.targetDate) return a.targetDate.localeCompare(b.targetDate);
    if (a.targetDate && !b.targetDate) return -1;
    if (!a.targetDate && b.targetDate) return 1;
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

function buildDefaultTripDays(startDate, endDate) {
  const days = [];
  let current = startDate;
  while (current <= endDate && days.length < 21) {
    days.push({
      id: crypto.randomUUID(),
      date: current,
      title: "",
      notes: "",
      stops: [],
    });
    current = addDays(current, 1);
  }
  return days;
}

function nextTripDayDate(trip) {
  if (!trip.days.length) return trip.startDate;
  const last = trip.days[trip.days.length - 1].date;
  const next = addDays(last, 1);
  return next <= trip.endDate ? next : trip.endDate;
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

function formatTripRange(trip) {
  if (trip.startDate === trip.endDate) return formatLongDate(trip.startDate);
  return `${formatShortDate(trip.startDate)} - ${formatShortDate(trip.endDate)}`;
}

function formatStayRange(hotel) {
  if (!hotel.checkIn && !hotel.checkOut) return "Dates not set";
  if (hotel.checkIn && hotel.checkOut) return `${formatShortDate(hotel.checkIn)} - ${formatShortDate(hotel.checkOut)}`;
  return hotel.checkIn ? `Check in ${formatShortDate(hotel.checkIn)}` : `Check out ${formatShortDate(hotel.checkOut)}`;
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

function getKnownMemberId(id) {
  return familyMembers.some((member) => member.id === id) ? id : "";
}

function memberName(id) {
  return getMember(id)?.name ?? "Unassigned";
}

function memberEmail(id) {
  return getMember(id)?.email ?? "";
}

function syncStatusSummary() {
  if (!cloudState.configured) return { label: "Local", className: "sync-local" };
  if (cloudState.error) return { label: "Sync issue", className: "sync-warning" };
  if (cloudState.user) return { label: "Synced", className: "sync-connected" };
  return { label: "Sign in", className: "sync-local" };
}

function syncStatusDetail() {
  if (!cloudState.configured) return "Local mode. Add Firebase config to use Cloud sync.";
  if (cloudState.error) return `Cloud sync needs attention: ${cloudState.error}`;
  if (cloudState.user) return `Cloud sync on as ${cloudState.user.email || "Google user"}`;
  return "Cloud sync is ready. Sign in with Google to share family data.";
}

function memberIdForGoogleUser(user, members = state.members) {
  return memberIdForEmail(user?.email, members);
}

function memberIdForEmail(email, members = state.members) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return "";

  const profileMatch = members.find((member) => normalizeEmail(member.email) === normalizedEmail);
  return profileMatch?.id || googleEmailMemberIds[normalizedEmail] || "";
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
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

function wishCategoryLabel(category) {
  return wishCategories.find((item) => item.id === category)?.label ?? "Wish";
}

function wishStatusLabel(status) {
  return wishStatuses.find((item) => item.id === status)?.label ?? "Wish";
}

function deriveWishTitle(details, category = "experience") {
  const firstLine =
    String(details || "")
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) || "";
  const cleaned = firstLine
    .replace(/^[-*\d.)\s]+/, "")
    .replace(/^(i\s+wish|wish|want|i\s+want|i\s+would\s+like|would\s+like)\s*:?\s*/i, "")
    .trim();
  if (cleaned) {
    return cleaned.length > 72 ? `${cleaned.slice(0, 69).trim()}...` : cleaned;
  }
  return `${wishCategoryLabel(category)} wish`;
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

function tripStopTypeLabel(type) {
  return {
    sightseeing: "Sightseeing",
    food: "Food",
    hotel: "Hotel",
    drive: "Drive",
    other: "Other",
  }[type] || "Stop";
}

function renderMapLinks(query, label = "Map") {
  if (!query) return "";
  return `
    <a class="secondary-button" href="${escapeAttribute(appleMapsUrl(query))}" target="_blank" rel="noreferrer"><i data-lucide="map"></i>Apple</a>
    <a class="secondary-button" href="${escapeAttribute(googleMapsSearchUrl(query))}" target="_blank" rel="noreferrer"><i data-lucide="map-pin"></i>Google</a>
  `;
}

function renderDayMapLinks(day) {
  const points = day.stops.map((stop) => stop.address || stop.name).filter(Boolean);
  if (!points.length) return "";
  if (points.length === 1) return renderMapLinks(points[0], "Day map");

  return `
    <a class="secondary-button" href="${escapeAttribute(googleMapsRouteUrl(points))}" target="_blank" rel="noreferrer"><i data-lucide="route"></i>Google route</a>
    <a class="secondary-button" href="${escapeAttribute(appleMapsUrl(points[0]))}" target="_blank" rel="noreferrer"><i data-lucide="map"></i>Apple first stop</a>
  `;
}

function appleMapsUrl(query) {
  return `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
}

function googleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function googleMapsRouteUrl(points) {
  const origin = points[0];
  const destination = points[points.length - 1];
  const waypoints = points.slice(1, -1).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
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
