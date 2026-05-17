const STORAGE_KEY = "family-hub-state-v1";
const LEGACY_STORAGE_KEY = "family-planner-state-v1";
const LOCAL_PROFILE_KEY = "family-hub-local-profile-v1";
const FAMILY_ID_KEY = "family-hub-family-id-v1";
const ADMIN_MEMBER_ID = "me";
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT = "image/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx";

const statuses = [
  { id: "all", label: "All" },
  { id: "todo", label: "To do" },
  { id: "discussion", label: "Discuss" },
  { id: "assigned", label: "Assigned" },
  { id: "done", label: "Done" },
];

const wishCategories = [
  { id: "travel", label: "Travel" },
  { id: "experience", label: "Experience" },
  { id: "gift", label: "Gift" },
  { id: "food", label: "Food" },
  { id: "learning", label: "Learning" },
  { id: "home", label: "Home" },
  { id: "family", label: "Family" },
  { id: "other", label: "Other" },
];

const wishStatuses = [
  { id: "idea", label: "Idea" },
  { id: "researching", label: "Researching" },
  { id: "discussing", label: "Discussing" },
  { id: "planning", label: "Planning" },
  { id: "ready", label: "Ready" },
  { id: "done", label: "Done" },
  { id: "archived", label: "Archived" },
];

const wishTimeframes = [
  { id: "someday", label: "Someday" },
  { id: "this-year", label: "This year" },
  { id: "next-year", label: "Next year" },
  { id: "birthday", label: "Birthday" },
  { id: "holiday", label: "Holiday" },
  { id: "during-vacation", label: "During vacation" },
  { id: "custom", label: "Custom" },
];

const wishPriorities = [
  { id: "normal", label: "Medium" },
  { id: "high", label: "High" },
  { id: "low", label: "Low" },
];

const wishLinkTypes = [
  { id: "product", label: "Product" },
  { id: "hotel", label: "Hotel" },
  { id: "restaurant", label: "Restaurant" },
  { id: "video", label: "Video" },
  { id: "travel", label: "Travel" },
  { id: "article", label: "Article" },
  { id: "map", label: "Map" },
  { id: "other", label: "Other" },
];

const googleEmailMemberIds = {};

const mainViews = [
  { id: "home", label: "Home", icon: "layout-dashboard" },
  { id: "tasks", label: "Tasks", icon: "list-checks" },
  { id: "wishlist", label: "Dreams", icon: "sparkles" },
  { id: "vacation", label: "Vacation", icon: "map" },
  { id: "finance", label: "Finance", icon: "wallet-cards" },
];

const defaultCreditCards = [];

const familyMembers = [
  {
    id: "me",
    name: "Parent 1",
    age: "",
    email: "",
    phone: "",
    color: "#0f766e",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "wife",
    name: "Parent 2",
    age: "",
    email: "",
    phone: "",
    color: "#4754a3",
    settings: { reminderDays: 7, includeInDigest: true },
  },
  {
    id: "son",
    name: "Teen",
    age: "",
    email: "",
    phone: "",
    color: "#d95f43",
    settings: { reminderDays: 5, includeInDigest: true },
  },
  {
    id: "daughter",
    name: "Child",
    age: "",
    email: "",
    phone: "",
    color: "#237a57",
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
let activeMainView = "home";
let activeTaskMemberId = "all";
let activeWishMemberId = "all";
let selectedTaskId = null;
let selectedTripId = state.trips?.[0]?.id ?? null;
let selectedWishId = state.wishes?.[0]?.id ?? null;
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let visibleVacationMonth = monthForDate(state.trips?.[0]?.startDate) || new Date(today.getFullYear(), today.getMonth(), 1);
let visibleFinanceMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let pendingLoginMemberId = state.currentMemberId;
let cloudState = createCloudState();
let vacationItemCurrentAttachments = [];
let vacationItemAttachmentsToDelete = new Set();

const elements = {
  authGate: document.querySelector("#authGate"),
  authGoogleBtn: document.querySelector("#authGoogleBtn"),
  authStatus: document.querySelector("#authStatus"),
  currentProfileBtn: document.querySelector("#currentProfileBtn"),
  loginBtn: document.querySelector("#loginBtn"),
  memberStrip: document.querySelector("#memberStrip"),
  mainTabs: document.querySelector("#mainTabs"),
  homeView: document.querySelector("#homeView"),
  homeEyebrow: document.querySelector("#homeEyebrow"),
  homeTitle: document.querySelector("#homeTitle"),
  homeDashboard: document.querySelector("#homeDashboard"),
  homeNewTaskBtn: document.querySelector("#homeNewTaskBtn"),
  taskView: document.querySelector("#taskView"),
  taskSupportView: document.querySelector("#taskSupportView"),
  wishlistView: document.querySelector("#wishlistView"),
  vacationView: document.querySelector("#vacationView"),
  financeView: document.querySelector("#financeView"),
  newWishBtn: document.querySelector("#newWishBtn"),
  wishTabs: document.querySelector("#wishTabs"),
  wishList: document.querySelector("#wishList"),
  wishDetail: document.querySelector("#wishDetail"),
  newTripBtn: document.querySelector("#newTripBtn"),
  tripList: document.querySelector("#tripList"),
  tripDetail: document.querySelector("#tripDetail"),
  vacationMonthLabel: document.querySelector("#vacationMonthLabel"),
  vacationPrevMonthBtn: document.querySelector("#vacationPrevMonthBtn"),
  vacationTripMonthBtn: document.querySelector("#vacationTripMonthBtn"),
  vacationNextMonthBtn: document.querySelector("#vacationNextMonthBtn"),
  vacationCalendarGrid: document.querySelector("#vacationCalendarGrid"),
  vacationItemDialog: document.querySelector("#vacationItemDialog"),
  vacationItemForm: document.querySelector("#vacationItemForm"),
  vacationItemDialogTitle: document.querySelector("#vacationItemDialogTitle"),
  closeVacationItemDialogBtn: document.querySelector("#closeVacationItemDialogBtn"),
  deleteVacationItemBtn: document.querySelector("#deleteVacationItemBtn"),
  financeUploadBtn: document.querySelector("#financeUploadBtn"),
  financeFileInput: document.querySelector("#financeFileInput"),
  financeDropZone: document.querySelector("#financeDropZone"),
  financeManualForm: document.querySelector("#financeManualForm"),
  financeManualTitle: document.querySelector("#financeManualTitle"),
  financeManualAmount: document.querySelector("#financeManualAmount"),
  financeManualDate: document.querySelector("#financeManualDate"),
  financeManualNote: document.querySelector("#financeManualNote"),
  financeMonthlyTotal: document.querySelector("#financeMonthlyTotal"),
  financeMonthSummary: document.querySelector("#financeMonthSummary"),
  financeMonthLabel: document.querySelector("#financeMonthLabel"),
  financePrevMonthBtn: document.querySelector("#financePrevMonthBtn"),
  financeThisMonthBtn: document.querySelector("#financeThisMonthBtn"),
  financeNextMonthBtn: document.querySelector("#financeNextMonthBtn"),
  financeCalendarGrid: document.querySelector("#financeCalendarGrid"),
  financeCardsDisclosure: document.querySelector("#financeCardsDisclosure"),
  financeExpensesDisclosure: document.querySelector("#financeExpensesDisclosure"),
  financeProcessStatus: document.querySelector("#financeProcessStatus"),
  financeExpenseList: document.querySelector("#financeExpenseList"),
  financeCreditCardList: document.querySelector("#financeCreditCardList"),
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
  notebookAttachments: document.querySelector("#notebookAttachments"),
  notebookList: document.querySelector("#notebookList"),
  prevMonthBtn: document.querySelector("#prevMonthBtn"),
  nextMonthBtn: document.querySelector("#nextMonthBtn"),
  todayBtn: document.querySelector("#todayBtn"),
  loginDialog: document.querySelector("#loginDialog"),
  loginForm: document.querySelector("#loginForm"),
  loginMemberGrid: document.querySelector("#loginMemberGrid"),
  closeLoginBtn: document.querySelector("#closeLoginBtn"),
  cancelLoginBtn: document.querySelector("#cancelLoginBtn"),
  profileDialog: document.querySelector("#profileDialog"),
  profileForm: document.querySelector("#profileForm"),
  profileTitle: document.querySelector("#profileTitle"),
  profilePreview: document.querySelector("#profilePreview"),
  profileName: document.querySelector("#profileName"),
  profileAge: document.querySelector("#profileAge"),
  profileEmail: document.querySelector("#profileEmail"),
  profilePhone: document.querySelector("#profilePhone"),
  profileColor: document.querySelector("#profileColor"),
  profileReminderDays: document.querySelector("#profileReminderDays"),
  profileDigest: document.querySelector("#profileDigest"),
  closeProfileBtn: document.querySelector("#closeProfileBtn"),
  cancelProfileBtn: document.querySelector("#cancelProfileBtn"),
  accountDialog: document.querySelector("#accountDialog"),
  accountForm: document.querySelector("#accountForm"),
  accountTitle: document.querySelector("#accountTitle"),
  accountSummary: document.querySelector("#accountSummary"),
  closeAccountBtn: document.querySelector("#closeAccountBtn"),
  accountSyncBtn: document.querySelector("#accountSyncBtn"),
  accountFamilyBtn: document.querySelector("#accountFamilyBtn"),
  accountSettingsBtn: document.querySelector("#accountSettingsBtn"),
  familyDialog: document.querySelector("#familyDialog"),
  familyForm: document.querySelector("#familyForm"),
  closeFamilyDialogBtn: document.querySelector("#closeFamilyDialogBtn"),
  joinFamilyBtn: document.querySelector("#joinFamilyBtn"),
  familyNameInput: document.querySelector("#familyNameInput"),
  familyIdInput: document.querySelector("#familyIdInput"),
  familyEmailsInput: document.querySelector("#familyEmailsInput"),
  familyHomeAddressInput: document.querySelector("#familyHomeAddressInput"),
  familySetupStatus: document.querySelector("#familySetupStatus"),
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
  recurrence: document.querySelector("#taskRecurrence"),
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

const vacationItemForm = {
  id: document.querySelector("#vacationItemId"),
  sourceDayId: document.querySelector("#vacationItemSourceDayId"),
  type: document.querySelector("#vacationItemType"),
  date: document.querySelector("#vacationItemDate"),
  endDate: document.querySelector("#vacationItemEndDate"),
  time: document.querySelector("#vacationItemTime"),
  name: document.querySelector("#vacationItemName"),
  address: document.querySelector("#vacationItemAddress"),
  url: document.querySelector("#vacationItemUrl"),
  notes: document.querySelector("#vacationItemNotes"),
  attachments: document.querySelector("#vacationItemAttachments"),
  attachmentList: document.querySelector("#vacationItemAttachmentList"),
};

const wishForm = {
  id: document.querySelector("#wishId"),
  title: document.querySelector("#wishTitle"),
  owner: document.querySelector("#wishOwner"),
  category: document.querySelector("#wishCategory"),
  status: document.querySelector("#wishStatus"),
  timeframe: document.querySelector("#wishTimeframe"),
  customTimeframe: document.querySelector("#wishCustomTimeframe"),
  priority: document.querySelector("#wishPriority"),
  estimatedCost: document.querySelector("#wishEstimatedCost"),
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
      const members = normalizeMembers(parsed.members);
      return {
        family: normalizeFamilyProfile(parsed.family, members),
        members,
        tasks: normalizeTasks(parsed.tasks?.length ? parsed.tasks : seedTasks()),
        notes: normalizeNotes(parsed.notes),
        trips: normalizeTrips(parsed.trips),
        wishes: normalizeWishes(parsed.wishes),
        expenses: normalizeExpenses(parsed.expenses),
        creditCards: normalizeCreditCards(parsed.creditCards),
        currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || parsed.currentMemberId || "me",
      };
    } catch (error) {
      console.warn("Could not parse planner data", error);
    }
  }

  return {
    family: normalizeFamilyProfile(),
    members: normalizeMembers(),
    tasks: normalizeTasks(seedTasks()),
    notes: normalizeNotes(),
    trips: normalizeTrips(),
    wishes: normalizeWishes(),
    expenses: normalizeExpenses(),
    creditCards: normalizeCreditCards(),
    currentMemberId: localStorage.getItem(LOCAL_PROFILE_KEY) || "me",
  };
}

function normalizeMembers(savedMembers = []) {
  return familyMembers.map((defaultMember) => {
    const saved = savedMembers.find((member) => member.id === defaultMember.id) ?? {};
    const savedProfile = { ...saved };
    delete savedProfile["p" + "in"];
    const savedName = saved.name ?? defaultMember.name;
    const shouldUseDefaultName = savedName === legacyNames[defaultMember.id];
    const savedEmail = saved.email ?? defaultMember.email;
    const shouldUseDefaultEmail = /@example\.com$/i.test(savedEmail);
    const savedPhone = saved.phone ?? defaultMember.phone;

    return {
      ...defaultMember,
      ...savedProfile,
      name: shouldUseDefaultName ? defaultMember.name : savedName,
      email: shouldUseDefaultEmail ? defaultMember.email : savedEmail,
      phone: normalizePhone(savedPhone),
      settings: {
        ...defaultMember.settings,
        ...(saved.settings ?? {}),
      },
    };
  });
}

function normalizeFamilyProfile(family = {}, members = familyMembers) {
  const memberEmails = members.map((member) => normalizeEmail(member.email)).filter(Boolean);
  const ownerEmail = normalizeEmail(family.ownerEmail) || memberEmails[0] || "";
  const allowedEmails = [...new Set([ownerEmail, ...(Array.isArray(family.allowedEmails) ? family.allowedEmails : memberEmails)].map(normalizeEmail).filter(Boolean))];
  return {
    id: String(family.id || getActiveFamilyId()).trim(),
    name: String(family.name || "My Family").trim(),
    ownerEmail,
    allowedEmails,
    homeAddress: String(family.homeAddress || "").trim(),
    plan: family.plan || "prototype",
    createdAt: family.createdAt || new Date().toISOString(),
    updatedAt: family.updatedAt || family.createdAt || new Date().toISOString(),
  };
}

function normalizeTasks(tasks = []) {
  return tasks.map((task) => {
    const requester = getKnownMemberId(task.requester) || "me";
    return {
      ...task,
      requester,
      assignee: getKnownMemberId(task.assignee) || requester,
      recurrence: ["none", "monthly"].includes(task.recurrence) ? task.recurrence : "none",
      comments: Array.isArray(task.comments) ? task.comments : [],
      title:
        {
          "Review daughter's iPad ask": "Review child's tablet ask",
          "Son driving practice plan": "Teen driving practice plan",
        }[task.title] ?? task.title,
    };
  });
}

function normalizeNotes(notes = {}) {
  return familyMembers.reduce((notebooks, member) => {
    const memberNotes = Array.isArray(notes?.[member.id]) ? notes[member.id] : [];
    notebooks[member.id] = memberNotes
      .filter((note) => note && typeof note.text === "string")
      .map((note) => ({
        id: note.id || crypto.randomUUID(),
        text: note.text.trim(),
        attachments: normalizeAttachments(note.attachments),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
      }))
      .filter((note) => note.text || note.attachments.length)
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
    attachments: normalizeAttachments(hotel.attachments),
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
    attachments: normalizeAttachments(stop.attachments),
    addedBy: getKnownMemberId(stop.addedBy) || "",
    addedAt: stop.addedAt || "",
    source: String(stop.source || "").trim(),
  }));
}

function normalizeWishes(wishes = []) {
  if (!Array.isArray(wishes)) return [];

  return wishes
    .filter((wish) => wish && typeof wish === "object")
    .map((wish) => {
      const details = String(wish.details || "").trim();
      const category = normalizeWishCategory(wish.category);
      const status = normalizeWishStatus(wish.status);
      return {
        id: wish.id || crypto.randomUUID(),
        title: String(wish.title || deriveWishTitle(details, category)).trim(),
        owner: getKnownMemberId(wish.owner) || "me",
        category,
        status,
        timeframe: normalizeWishTimeframe(wish.timeframe),
        customTimeframe: String(wish.customTimeframe || "").trim().slice(0, 80),
        priority: normalizeWishPriority(wish.priority),
        estimatedCost: String(wish.estimatedCost || "").trim().slice(0, 40),
        targetDate: wish.targetDate || "",
        details,
        notes: normalizeWishNotes(wish.notes),
        links: normalizeWishLinks(wish.links),
        attachments: normalizeAttachments(wish.attachments),
        comments: normalizeWishComments(wish.comments),
        createdAt: wish.createdAt || new Date().toISOString(),
        updatedAt: wish.updatedAt || wish.createdAt || new Date().toISOString(),
      };
    })
    .filter((wish) => wish.title || wish.details || wish.notes.length || wish.links.length || wish.attachments.length)
    .sort((a, b) => {
      if (isClosedWish(a) && !isClosedWish(b)) return 1;
      if (!isClosedWish(a) && isClosedWish(b)) return -1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function normalizeWishCategory(category) {
  const migrated = {
    dinner: "food",
    hike: "experience",
    vacation: "travel",
    movie: "experience",
  }[category] || category;
  return wishCategories.some((item) => item.id === migrated) ? migrated : "experience";
}

function normalizeWishStatus(status) {
  const migrated = {
    wish: "idea",
    planned: "planning",
  }[status] || status;
  return wishStatuses.some((item) => item.id === migrated) ? migrated : "idea";
}

function normalizeWishTimeframe(timeframe) {
  return wishTimeframes.some((item) => item.id === timeframe) ? timeframe : "someday";
}

function normalizeWishPriority(priority) {
  return wishPriorities.some((item) => item.id === priority) ? priority : "normal";
}

function normalizeExpenses(expenses = []) {
  if (!Array.isArray(expenses)) return [];

  return expenses
    .filter((expense) => expense && typeof expense === "object")
    .map((expense) => ({
      id: expense.id || crypto.randomUUID(),
      title: String(expense.title || "Expense").trim(),
      merchant: String(expense.merchant || expense.title || "Expense").trim(),
      date: expense.date || isoToday,
      amount: normalizeExpenseAmount(expense.amount),
      category: String(expense.category || "Bills").trim(),
      sourceName: String(expense.sourceName || "Uploaded bill").trim(),
      sourceType: String(expense.sourceType || "upload").trim(),
      note: String(expense.note || "").trim().slice(0, 500),
      textSnippet: String(expense.textSnippet || "").trim().slice(0, 260),
      addedBy: getKnownMemberId(expense.addedBy) || "me",
      createdAt: expense.createdAt || new Date().toISOString(),
      updatedAt: expense.updatedAt || expense.createdAt || new Date().toISOString(),
    }))
    .filter((expense) => expense.title && expense.date && expense.amount > 0)
    .sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

function normalizeCreditCards(savedCards = []) {
  const cards = Array.isArray(savedCards) && savedCards.length ? savedCards : defaultCreditCards;
  return cards.map((card) => {
    const defaultCard = defaultCreditCards.find((item) => item.id === card.id) || {};
    const saved = Array.isArray(savedCards) ? savedCards.find((item) => item.id === card.id) || card : card;
    const migratedDueDay = saved?.dueDay || (saved?.dueDate ? parseLocalDate(saved.dueDate).getDate() : "");
    return {
      ...defaultCard,
      id: saved.id || crypto.randomUUID(),
      issuer: String(saved.issuer || defaultCard.issuer || "").trim(),
      name: String(saved.name || defaultCard.name || "Credit card").trim(),
      recommendedUsage: String(saved.recommendedUsage || defaultCard.recommendedUsage || "").trim(),
      billAmount: normalizeExpenseAmount(saved?.billAmount),
      dueDay: normalizeDueDay(migratedDueDay),
      paidMonth: saved?.paidMonth || "",
      updatedAt: saved?.updatedAt || "",
    };
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

function normalizeWishNotes(notes = []) {
  if (!Array.isArray(notes)) return [];
  return notes
    .filter((note) => note && typeof note.text === "string")
    .map((note) => ({
      id: note.id || crypto.randomUUID(),
      author: getKnownMemberId(note.author) || "me",
      createdAt: note.createdAt || new Date().toISOString(),
      text: note.text.trim(),
    }))
    .filter((note) => note.text)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function normalizeWishLinks(links = []) {
  if (!Array.isArray(links)) return [];
  return links
    .filter((link) => link && typeof link === "object")
    .map((link) => ({
      id: link.id || crypto.randomUUID(),
      title: String(link.title || "").trim().slice(0, 120),
      url: String(link.url || "").trim(),
      type: wishLinkTypes.some((item) => item.id === link.type) ? link.type : "other",
      notes: String(link.notes || "").trim().slice(0, 360),
      addedBy: getKnownMemberId(link.addedBy) || "me",
      addedAt: link.addedAt || new Date().toISOString(),
    }))
    .filter((link) => link.url)
    .map((link) => ({
      ...link,
      title: link.title || titleFromUrl(link.url),
    }))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function normalizeExpenseAmount(amount) {
  const numeric = typeof amount === "number" ? amount : Number(String(amount || "").replace(/[$,\s]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(Math.abs(numeric) * 100) / 100;
}

function normalizeDueDay(day) {
  const numeric = Number(day);
  if (!Number.isFinite(numeric) || numeric < 1) return "";
  return Math.min(31, Math.floor(numeric));
}

function normalizeAttachments(attachments = []) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter((attachment) => attachment && typeof attachment === "object")
    .map((attachment) => ({
      id: attachment.id || crypto.randomUUID(),
      name: String(attachment.name || "Attachment").trim().slice(0, 140),
      type: String(attachment.type || "application/octet-stream").trim(),
      size: Number(attachment.size) || 0,
      url: String(attachment.url || "").trim(),
      path: String(attachment.path || "").trim(),
      createdAt: attachment.createdAt || new Date().toISOString(),
      createdBy: getKnownMemberId(attachment.createdBy) || "",
    }))
    .filter((attachment) => attachment.url || attachment.path);
}

function seedTasks() {
  return [];
}

function bindEvents() {
  elements.currentProfileBtn.addEventListener("click", openAccountDialog);
  elements.loginBtn?.addEventListener("click", () => openLoginDialog());
  elements.newTaskBtn.addEventListener("click", () => openTaskDialog());
  elements.homeNewTaskBtn.addEventListener("click", () => openTaskDialog());
  elements.newWishBtn.addEventListener("click", () => openWishDialog());
  elements.newTripBtn.addEventListener("click", () => openTripDialog());
  elements.vacationPrevMonthBtn.addEventListener("click", () => changeVacationMonth(-1));
  elements.vacationNextMonthBtn.addEventListener("click", () => changeVacationMonth(1));
  elements.vacationTripMonthBtn.addEventListener("click", () => {
    const trip = getSelectedTrip();
    visibleVacationMonth = monthForDate(trip?.startDate) || new Date(today.getFullYear(), today.getMonth(), 1);
    renderVacationCalendar();
  });
  elements.closeVacationItemDialogBtn.addEventListener("click", closeVacationItemDialog);
  elements.vacationItemForm.addEventListener("submit", saveVacationItemFromForm);
  elements.deleteVacationItemBtn.addEventListener("click", deleteCurrentVacationItem);
  vacationItemForm.type.addEventListener("change", syncVacationItemTypeFields);
  elements.financeUploadBtn.addEventListener("click", () => elements.financeFileInput.click());
  elements.financeFileInput.addEventListener("change", (event) => processFinanceFiles(event.target.files));
  elements.financeDropZone.addEventListener("click", () => elements.financeFileInput.click());
  elements.financeDropZone.addEventListener("dragover", handleFinanceDragOver);
  elements.financeDropZone.addEventListener("dragleave", handleFinanceDragLeave);
  elements.financeDropZone.addEventListener("drop", handleFinanceDrop);
  elements.financeManualForm.addEventListener("submit", addManualFinanceExpense);
  elements.financePrevMonthBtn.addEventListener("click", () => changeFinanceMonth(-1));
  elements.financeNextMonthBtn.addEventListener("click", () => changeFinanceMonth(1));
  elements.financeThisMonthBtn.addEventListener("click", () => {
    visibleFinanceMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    renderFinance();
  });
  elements.closeDialogBtn.addEventListener("click", () => closeTaskDialog());
  elements.taskForm.addEventListener("submit", saveTaskFromForm);
  elements.deleteTaskBtn.addEventListener("click", deleteCurrentTask);
  elements.closeTripDialogBtn.addEventListener("click", closeTripDialog);
  elements.tripForm.addEventListener("submit", saveTripFromForm);
  elements.deleteTripBtn.addEventListener("click", deleteCurrentTrip);
  elements.closeWishDialogBtn.addEventListener("click", closeWishDialog);
  elements.wishForm.addEventListener("submit", saveWishFromForm);
  elements.deleteWishBtn.addEventListener("click", deleteCurrentWish);
  wishForm.timeframe.addEventListener("change", syncWishTimeframeField);
  elements.searchInput.addEventListener("input", renderTasks);
  elements.exportBtn?.addEventListener("click", exportState);
  elements.importInput?.addEventListener("change", importState);
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

  elements.vacationItemDialog.addEventListener("click", (event) => {
    if (event.target === elements.vacationItemDialog) closeVacationItemDialog();
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
  elements.accountFamilyBtn.addEventListener("click", () => {
    closeAccountDialog();
    openFamilyDialog();
  });
  elements.accountSettingsBtn.addEventListener("click", () => {
    closeAccountDialog();
    openProfileDialog();
  });
  elements.accountDialog.addEventListener("click", (event) => {
    if (event.target === elements.accountDialog) closeAccountDialog();
  });

  elements.cloudForm.addEventListener("submit", (event) => event.preventDefault());
  elements.familyForm.addEventListener("submit", saveFamilySettings);
  elements.joinFamilyBtn.addEventListener("click", joinFamilyWorkspace);
  elements.closeFamilyDialogBtn.addEventListener("click", closeFamilyDialog);
  elements.familyDialog.addEventListener("click", (event) => {
    if (event.target === elements.familyDialog) closeFamilyDialog();
  });
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
    storage: null,
    familyId: "",
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
    cloudState.storage = firebase.storage ? firebase.storage() : null;
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

function getActiveFamilyId() {
  return localStorage.getItem(FAMILY_ID_KEY) || window.FAMILY_HUB_FIREBASE_OPTIONS?.familyId || "default-family";
}

function setActiveFamilyId(familyId) {
  const normalized = normalizeFamilyId(familyId);
  localStorage.setItem(FAMILY_ID_KEY, normalized);
  if (state.family) state.family.id = normalized;
  return normalized;
}

function normalizeFamilyId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "default-family";
}

function subscribeToFamilyDoc() {
  const familyId = getActiveFamilyId();
  if (cloudState.familyId === familyId && cloudState.unsubscribe) return;
  cloudState.familyId = familyId;
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
    family: normalizeFamilyProfile(data.family || data, members),
    members,
    tasks: normalizeTasks(data.tasks?.length ? data.tasks : []),
    notes: normalizeNotes(data.notes),
    trips: normalizeTrips(data.trips),
    wishes: normalizeWishes(data.wishes),
    expenses: normalizeExpenses(data.expenses),
    creditCards: normalizeCreditCards(data.creditCards),
    currentMemberId: signedInMemberId || localStorage.getItem(LOCAL_PROFILE_KEY) || state.currentMemberId || "me",
  };

  if (!getMember(state.currentMemberId)) {
    state.currentMemberId = state.members[0]?.id || "me";
  }

  if (!state.tasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = null;
  }

  if (activeTaskMemberId !== "all" && !getMember(activeTaskMemberId)) {
    activeTaskMemberId = state.currentMemberId || state.members[0]?.id || "me";
  }

  if (!state.trips.some((trip) => trip.id === selectedTripId)) {
    selectedTripId = state.trips[0]?.id ?? null;
    visibleVacationMonth = monthForDate(getSelectedTrip()?.startDate) || visibleVacationMonth;
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
  activeTaskMemberId = memberId;
  activeWishMemberId = "all";
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
    family: normalizeFamilyProfile(
      {
        ...state.family,
        id: getActiveFamilyId(),
        ownerEmail: state.family?.ownerEmail || cloudState.user.email || "",
        allowedEmails: familyAllowedEmails(),
        updatedAt: new Date().toISOString(),
      },
      state.members,
    ),
    allowedEmails: familyAllowedEmails(),
    ownerEmail: state.family?.ownerEmail || cloudState.user.email || "",
    members: state.members,
    tasks: state.tasks,
    notes: state.notes,
    trips: state.trips,
    wishes: state.wishes,
    expenses: state.expenses,
    creditCards: state.creditCards,
    updatedBy: cloudState.user.email || cloudState.user.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  cloudState.familyRef.set(payload, { merge: true }).catch((error) => {
    cloudState.error = error.message || "Could not save shared family data.";
    renderCloudStatus();
    renderCloudDialog();
  });
}

function attachmentStorageReady() {
  return Boolean(cloudState.enabled && cloudState.user && cloudState.storage);
}

function requireAttachmentStorage() {
  if (attachmentStorageReady()) return;
  throw userFacingError("Sign in with Google first. Attachments are stored securely in Firebase Storage so every family member can open them.");
}

function userFacingError(message) {
  const error = new Error(message);
  error.userFacing = true;
  return error;
}

async function uploadAttachments(fileList, folder) {
  const files = [...(fileList || [])];
  if (!files.length) return [];
  requireAttachmentStorage();

  const oversized = files.find((file) => file.size > MAX_ATTACHMENT_BYTES);
  if (oversized) {
    throw userFacingError(`${oversized.name} is too large. Please keep each attachment under ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`);
  }

  const uploaded = [];
  const now = new Date().toISOString();
  for (const file of files) {
    const id = crypto.randomUUID();
    const safeName = safeStorageFileName(file.name);
    const path = `families/${getActiveFamilyId()}/${folder}/${id}-${safeName}`;
    const ref = cloudState.storage.ref().child(path);
    const snapshot = await ref.put(file, {
      contentType: file.type || "application/octet-stream",
      customMetadata: {
        familyId: getActiveFamilyId(),
        uploadedBy: cloudState.user.email || cloudState.user.uid || state.currentMemberId,
      },
    });
    const url = await snapshot.ref.getDownloadURL();
    uploaded.push({
      id,
      name: file.name || "Attachment",
      type: file.type || "application/octet-stream",
      size: file.size || 0,
      url,
      path,
      createdAt: now,
      createdBy: state.currentMemberId,
    });
  }
  return uploaded;
}

async function deleteAttachmentFiles(attachments = []) {
  if (!attachmentStorageReady()) return;
  await Promise.all(
    normalizeAttachments(attachments)
      .filter((attachment) => attachment.path)
      .map((attachment) =>
        cloudState.storage
          .ref()
          .child(attachment.path)
          .delete()
          .catch((error) => {
            if (error?.code !== "storage/object-not-found") {
              console.warn("Could not delete attachment", attachment.path, error);
            }
          }),
      ),
  );
}

function safeStorageFileName(name) {
  const cleaned = String(name || "attachment")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return cleaned || "attachment";
}

function renderAttachmentList(attachments = [], options = {}) {
  const normalized = normalizeAttachments(attachments);
  if (!normalized.length) return "";
  const deleteAttributes = options.deleteAttributes || (() => "");
  return `
    <div class="attachment-list-inner">
      ${normalized
        .map(
          (attachment) => `
            <div class="attachment-chip">
              <a href="${escapeAttribute(attachment.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(attachment.name)}">
                <i data-lucide="${attachmentIcon(attachment)}"></i>
                <span>${escapeHTML(attachment.name)}</span>
                <small>${formatFileSize(attachment.size)}</small>
              </a>
              ${
                options.deletable
                  ? `<button class="icon-button danger" type="button" ${deleteAttributes(attachment)} title="Remove attachment" aria-label="Remove attachment">
                      <i data-lucide="x"></i>
                    </button>`
                  : ""
              }
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function attachmentIcon(attachment) {
  const type = attachment.type || "";
  const name = attachment.name || "";
  if (type.startsWith("image/")) return "image";
  if (type.includes("pdf") || /\.pdf$/i.test(name)) return "file-text";
  if (/\.(docx?|pages)$/i.test(name)) return "file-text";
  if (/\.(xlsx?|numbers|csv)$/i.test(name)) return "table";
  return "paperclip";
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

function calendarMeta(label, attachments = []) {
  const count = normalizeAttachments(attachments).length;
  const parts = [label, count ? `${count} attachment${count === 1 ? "" : "s"}` : ""].filter(Boolean);
  return parts.join(" · ");
}

function familyAllowedEmails() {
  return [
    state.family?.ownerEmail,
    ...(Array.isArray(state.family?.allowedEmails) ? state.family.allowedEmails : []),
    ...state.members.map((member) => member.email),
    cloudState.user?.email,
  ]
    .map(normalizeEmail)
    .filter(Boolean)
    .filter((email, index, list) => list.indexOf(email) === index);
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

  const familyId = getActiveFamilyId();
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
        <span>${escapeHTML(state.family?.name || "My Family")} · ${escapeHTML(syncStatusDetail())}</span>
      </div>
    </div>
  `;
}

function closeAccountDialog() {
  elements.accountDialog.close();
  elements.accountForm.reset();
}

function openFamilyDialog() {
  const family = normalizeFamilyProfile(state.family, state.members);
  elements.familyNameInput.value = family.name;
  elements.familyIdInput.value = getActiveFamilyId();
  elements.familyEmailsInput.value = familyAllowedEmails().join("\n");
  elements.familyHomeAddressInput.value = family.homeAddress || "";
  elements.familySetupStatus.textContent = "";
  elements.familyDialog.showModal();
  elements.familyNameInput.focus();
  refreshIcons();
}

function closeFamilyDialog() {
  elements.familyDialog.close();
  elements.familyForm.reset();
  elements.familySetupStatus.textContent = "";
}

function saveFamilySettings(event) {
  event.preventDefault();
  const familyId = setActiveFamilyId(elements.familyIdInput.value || elements.familyNameInput.value);
  const allowedEmails = parseEmailList(elements.familyEmailsInput.value);
  const signedInEmail = normalizeEmail(cloudState.user?.email);
  state.family = normalizeFamilyProfile(
    {
      ...state.family,
      id: familyId,
      name: elements.familyNameInput.value.trim() || "My Family",
      ownerEmail: state.family?.ownerEmail || signedInEmail || allowedEmails[0] || "",
      allowedEmails: [...new Set([signedInEmail, ...allowedEmails].filter(Boolean))],
      homeAddress: elements.familyHomeAddressInput.value.trim(),
      updatedAt: new Date().toISOString(),
    },
    state.members,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LOCAL_PROFILE_KEY, state.currentMemberId);
  resubscribeToActiveFamily();
  saveCloudState(true);
  closeFamilyDialog();
  render();
}

function joinFamilyWorkspace() {
  const familyId = setActiveFamilyId(elements.familyIdInput.value || elements.familyNameInput.value);
  state.family = normalizeFamilyProfile(
    {
      ...state.family,
      id: familyId,
      name: elements.familyNameInput.value.trim() || state.family?.name || "My Family",
      allowedEmails: parseEmailList(elements.familyEmailsInput.value),
      homeAddress: elements.familyHomeAddressInput.value.trim(),
      updatedAt: new Date().toISOString(),
    },
    state.members,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  resubscribeToActiveFamily();
  closeFamilyDialog();
  render();
}

function parseEmailList(value) {
  return [...new Set(String(value || "").split(/[\s,;]+/).map(normalizeEmail).filter(Boolean))];
}

function resubscribeToActiveFamily() {
  if (!cloudState.enabled || !cloudState.user || !cloudState.db) return;
  if (cloudState.unsubscribe) {
    cloudState.unsubscribe();
    cloudState.unsubscribe = null;
  }
  subscribeToFamilyDoc();
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
  renderMainTabs();
  renderHomeDashboard();
  renderWishes();
  renderTrips();
  renderFinance();
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
  state.family = normalizeFamilyProfile(state.family, state.members);
  state.tasks = normalizeTasks(state.tasks);
  state.notes = normalizeNotes(state.notes);
  state.trips = normalizeTrips(state.trips);
  state.wishes = normalizeWishes(state.wishes);
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
      const wishes = state.wishes.filter((wish) => wish.owner === member.id && !isClosedWish(wish)).length;
      return `
        <button class="member-tile ${member.id === state.currentMemberId ? "current" : ""}" type="button" data-login-member="${member.id}">
          <div class="avatar" style="background:${member.color}">${initials(member.name)}</div>
          <div>
            <strong>${escapeHTML(member.name)}</strong>
            <span>${assigned} assigned · ${requested} asked · ${wishes} dreams</span>
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
          home: getHomeAttentionCount(),
          wishlist: state.wishes.filter((wish) => !isClosedWish(wish)).length,
          vacation: state.trips.length,
          finance: getExpensesForFinanceMonth().length,
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

  elements.homeView.hidden = activeMainView !== "home";
  elements.taskView.hidden = activeMainView !== "tasks";
  elements.taskSupportView.hidden = activeMainView !== "tasks";
  elements.wishlistView.hidden = activeMainView !== "wishlist";
  elements.vacationView.hidden = activeMainView !== "vacation";
  elements.financeView.hidden = activeMainView !== "finance";

  elements.mainTabs.querySelectorAll("[data-main-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMainView = button.dataset.mainView;
      renderMainTabs();
      refreshIcons();
    });
  });
}

function renderHomeDashboard() {
  const activeTasks = getSortedTasks().filter((task) => task.status !== "done");
  const dueSoon = activeTasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return days <= 7;
  });
  const overdue = activeTasks.filter((task) => daysUntil(task.dueDate) < 0);
  const upcomingTrips = state.trips
    .filter((trip) => trip.endDate >= isoToday)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const activeWishes = getSortedWishes().filter((wish) => !isClosedWish(wish)).slice(0, 4);
  const expenses = getExpensesForFinanceMonth();
  const familyName = state.family?.name || "Family Hub";

  elements.homeEyebrow.textContent = familyName;
  elements.homeTitle.textContent = "Today";
  elements.homeDashboard.innerHTML = `
    <section class="home-card home-card-wide">
      <div>
        <p class="eyebrow">Attention</p>
        <h3>${dueSoon.length} due soon</h3>
        <p>${overdue.length ? `${overdue.length} overdue item${overdue.length === 1 ? "" : "s"} need attention.` : "No overdue tasks right now."}</p>
      </div>
      <button class="secondary-button" type="button" data-home-view="tasks"><i data-lucide="calendar-days"></i>Open tasks</button>
    </section>
    ${renderHomeListCard("Upcoming tasks", dueSoon.slice(0, 5), (task) => `${task.title} · ${memberName(task.assignee)} · ${formatShortDate(task.dueDate)}`, "tasks")}
    ${renderHomeListCard("Dreams", activeWishes, (wish) => `${wish.title} · ${memberName(wish.owner)} · ${wishStatusLabel(wish.status)}`, "wishlist")}
    ${renderHomeListCard("Vacation", upcomingTrips, (trip) => `${trip.title} · ${formatTripRange(trip)}`, "vacation")}
    <section class="home-card">
      <p class="eyebrow">Finance</p>
      <h3>${formatMoney(sumExpenses(expenses))}</h3>
      <p>${expenses.length} expense${expenses.length === 1 ? "" : "s"} in ${financeMonthName()}.</p>
      <button class="secondary-button" type="button" data-home-view="finance"><i data-lucide="wallet-cards"></i>Open finance</button>
    </section>
  `;

  elements.homeDashboard.querySelectorAll("[data-home-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeMainView = button.dataset.homeView;
      renderMainTabs();
      refreshIcons();
    });
  });
}

function renderHomeListCard(title, items, formatter, targetView) {
  return `
    <section class="home-card">
      <p class="eyebrow">${escapeHTML(title)}</p>
      ${
        items.length
          ? `<ul class="home-list">${items.map((item) => `<li>${escapeHTML(formatter(item))}</li>`).join("")}</ul>`
          : `<p>No items yet.</p>`
      }
      <button class="secondary-button" type="button" data-home-view="${targetView}">Open ${escapeHTML(title.toLowerCase())}</button>
    </section>
  `;
}

function getHomeAttentionCount() {
  return state.tasks.filter((task) => task.status !== "done" && daysUntil(task.dueDate) <= 7).length;
}

function renderWishes() {
  renderWishTabs();
  const wishes = getFilteredWishes();
  const activeMember = activeWishMemberId === "all" ? null : getMember(activeWishMemberId) || currentMember();

  if (!wishes.length) {
    selectedWishId = null;
    elements.wishList.innerHTML = `<div class="empty-state compact">No dreams ${activeMember ? `for ${escapeHTML(activeMember.name)} ` : ""}yet.</div>`;
    elements.wishDetail.innerHTML = `
      <div class="empty-detail compact-detail">
        <i data-lucide="sparkles"></i>
        <h2>${activeMember ? `${escapeHTML(activeMember.name)}'s dreams` : "Dreams & ideas"}</h2>
        <p>Add travel ideas, products, hotels, restaurants, gifts, goals, or anything that can grow into a plan.</p>
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
      const countLine = `${wish.notes.length} notes · ${wish.comments.length} comments · ${wish.links.length} links · ${wish.attachments.length} files`;
      return `
        <button class="wish-row ${wish.id === selectedWishId ? "selected" : ""} ${isClosedWish(wish) ? "done" : ""}" type="button" data-wish-id="${escapeAttribute(wish.id)}">
          <span class="avatar mini" style="background:${owner?.color || "var(--teal)"}">${initials(owner?.name || "F")}</span>
          <span>
            <strong>${escapeHTML(wish.title)}</strong>
            <span>${escapeHTML(memberName(wish.owner))} · ${wishCategoryLabel(wish.category)} · ${wishStatusLabel(wish.status)}</span>
            <span>${escapeHTML(wishTimeframeLabel(wish))} · ${escapeHTML(wishPriorityLabel(wish.priority))} · ${escapeHTML(countLine)}</span>
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
  if (activeWishMemberId !== "all" && !getMember(activeWishMemberId)) {
    activeWishMemberId = "all";
  }

  const allCount = state.wishes.filter((wish) => !isClosedWish(wish)).length;
  elements.wishTabs.innerHTML = [
    `<button class="segment ${activeWishMemberId === "all" ? "active" : ""}" type="button" data-wish-member="all">All ${allCount}</button>`,
    ...state.members
    .map((member) => {
      const count = state.wishes.filter((wish) => wish.owner === member.id && !isClosedWish(wish)).length;
      return `
        <button class="segment ${activeWishMemberId === member.id ? "active" : ""}" type="button" data-wish-member="${member.id}">
          ${escapeHTML(member.name)} ${count}
        </button>
      `;
    }),
  ]
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

  const notes = wish.notes.length
    ? wish.notes
        .map(
          (note) => `
            <article class="comment dream-note">
              <div class="comment-meta">${escapeHTML(memberName(note.author))} · ${formatDateTime(note.createdAt)}</div>
              <p>${escapeHTML(note.text)}</p>
              <button class="chip-button compact-action" type="button" data-wish-note-delete="${escapeAttribute(note.id)}">Remove</button>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state compact">No research notes yet.</div>`;

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

  const links = wish.links.length
    ? wish.links
        .map(
          (link) => `
            <article class="dream-link-card">
              <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">
                <i data-lucide="${wishLinkIcon(link.type)}"></i>
                <span>
                  <strong>${escapeHTML(link.title)}</strong>
                  <small>${escapeHTML(wishLinkTypeLabel(link.type))} · Added by ${escapeHTML(memberName(link.addedBy))}</small>
                </span>
              </a>
              ${link.notes ? `<p>${escapeHTML(link.notes)}</p>` : ""}
              <button class="chip-button compact-action" type="button" data-wish-link-delete="${escapeAttribute(link.id)}">Remove</button>
            </article>
          `,
        )
        .join("")
    : `<div class="empty-state compact">No links yet.</div>`;

  elements.wishDetail.innerHTML = `
    <div class="wish-detail-stack">
      <div class="detail-top">
        <div>
          <p class="eyebrow">${wishCategoryLabel(wish.category)}</p>
          <h2 class="detail-title">${escapeHTML(wish.title)}</h2>
        </div>
        <div class="detail-actions">
          <button class="secondary-button" type="button" data-wish-edit><i data-lucide="pencil"></i>Edit</button>
          <button class="chip-button" type="button" data-wish-task><i data-lucide="list-plus"></i>Create task</button>
          ${!isClosedWish(wish) ? `<button class="secondary-button" type="button" data-wish-done><i data-lucide="check"></i>Done</button>` : ""}
        </div>
      </div>

      <section class="detail-facts">
        <div class="fact"><span>Owner</span><strong>${escapeHTML(memberName(wish.owner))}</strong></div>
        <div class="fact"><span>Status</span><strong>${wishStatusLabel(wish.status)}</strong></div>
        <div class="fact"><span>Timeframe</span><strong>${escapeHTML(wishTimeframeLabel(wish))}</strong></div>
        <div class="fact"><span>Priority</span><strong>${escapeHTML(wishPriorityLabel(wish.priority))}</strong></div>
        <div class="fact"><span>Estimate</span><strong>${escapeHTML(wish.estimatedCost || "Open")}</strong></div>
        <div class="fact"><span>Research</span><strong>${wish.notes.length} notes · ${wish.links.length} links · ${wish.attachments.length} files</strong></div>
      </section>

      <section class="requirements">
        <h3>Dream details</h3>
        <p class="task-description">${escapeHTML(wish.details || "No details added.")}</p>
      </section>

      <section class="conversation">
        <h3>Research notes</h3>
        ${notes}
        <form class="comment-form dream-note-form" data-wish-note-form>
          <select aria-label="Note author" name="author">
            ${state.members
              .map(
                (member) =>
                  `<option value="${member.id}" ${member.id === state.currentMemberId ? "selected" : ""}>${escapeHTML(member.name)}</option>`,
              )
              .join("")}
          </select>
          <input aria-label="Research note" name="text" placeholder="Add research, pricing, pros/cons, or planning notes" required maxlength="360" />
          <button class="primary-button" type="submit"><i data-lucide="book-plus"></i>Add</button>
        </form>
      </section>

      <section class="conversation">
        <h3>Links</h3>
        ${links}
        <form class="dream-link-form" data-wish-link-form>
          <input name="title" maxlength="120" placeholder="Title, e.g. Xreal glasses on Amazon" />
          <select name="type" aria-label="Link type">
            ${wishLinkTypes.map((type) => `<option value="${type.id}">${type.label}</option>`).join("")}
          </select>
          <input name="url" type="url" required placeholder="https://..." />
          <input name="notes" maxlength="300" placeholder="Why this link matters" />
          <button class="primary-button" type="submit"><i data-lucide="link"></i>Add link</button>
        </form>
      </section>

      <section class="conversation">
        <h3>Attachments</h3>
        <p class="reminder-meta">Screenshots, PDFs, quotes, product comparisons, or travel ideas. 5 MB per file.</p>
        ${renderAttachmentList(wish.attachments)}
        <form class="form-action-row" data-wish-attachment-form>
          <label class="secondary-button attachment-picker">
            <i data-lucide="paperclip"></i>
            Attach files
            <input name="attachments" type="file" multiple accept="${ATTACHMENT_ACCEPT}" />
          </label>
          ${
            wish.attachments.length
              ? `<button class="secondary-button danger-text" type="button" data-wish-attachment-remove><i data-lucide="file-x"></i>Remove attachment</button>`
              : ""
          }
        </form>
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
          <input aria-label="Comment" name="text" placeholder="Ask a question or discuss this dream" required maxlength="260" />
          <button class="primary-button" type="submit"><i data-lucide="send"></i>Send</button>
        </form>
      </section>
    </div>
  `;

  elements.wishDetail.querySelector("[data-wish-edit]").addEventListener("click", () => openWishDialog(wish));
  elements.wishDetail.querySelector("[data-wish-task]").addEventListener("click", () => makeTaskFromWish(wish.id));
  elements.wishDetail.querySelector("[data-wish-note-form]").addEventListener("submit", addWishNote);
  elements.wishDetail.querySelectorAll("[data-wish-note-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteWishNote(button.dataset.wishNoteDelete));
  });
  elements.wishDetail.querySelector("[data-wish-link-form]").addEventListener("submit", addWishLink);
  elements.wishDetail.querySelectorAll("[data-wish-link-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteWishLink(button.dataset.wishLinkDelete));
  });
  elements.wishDetail.querySelector("[data-wish-attachment-form]").addEventListener("submit", addWishAttachments);
  elements.wishDetail.querySelector("[data-wish-attachment-form] input").addEventListener("change", (event) => addWishAttachments(event));
  elements.wishDetail.querySelector("[data-wish-attachment-remove]")?.addEventListener("click", removeWishAttachment);
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
    renderVacationCalendar();
    refreshIcons();
    return;
  }

  if (!getSelectedTrip()) {
    selectedTripId = state.trips[0].id;
    visibleVacationMonth = monthForDate(state.trips[0].startDate) || visibleVacationMonth;
  }

  elements.tripList.innerHTML = state.trips
    .map((trip, index) => {
      const selected = trip.id === selectedTripId;
      return `
        <button
          class="trip-row ${selected ? "selected" : ""}"
          type="button"
          role="tab"
          aria-selected="${selected ? "true" : "false"}"
          tabindex="${selected || index === 0 ? "0" : "-1"}"
          data-trip-id="${escapeAttribute(trip.id)}"
        >
          <strong>${escapeHTML(trip.title)}</strong>
          <span>${escapeHTML(trip.destination || "Destination")} · ${formatTripRange(trip)}</span>
        </button>
      `;
    })
    .join("");

  elements.tripList.querySelectorAll("[data-trip-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedTripId = button.dataset.tripId;
      visibleVacationMonth = monthForDate(getSelectedTrip()?.startDate) || visibleVacationMonth;
      renderTrips();
    });
  });

  renderTripDetail();
  renderVacationCalendar();
}

function renderTripDetail() {
  const trip = getSelectedTrip();
  if (!trip) return;

  const tripMapLinks = renderTripMapLinks(trip);
  elements.tripDetail.innerHTML = `
    <div class="trip-detail-stack">
      <div class="trip-hero">
        <div>
          <p class="eyebrow">${escapeHTML(trip.destination || "Trip")}</p>
          <h3>${escapeHTML(trip.title)}</h3>
          <p>${formatTripRange(trip)}</p>
        </div>
        <div class="detail-actions">
          ${tripMapLinks}
          ${renderGoogleMapsImportForm(trip)}
          <button class="secondary-button" type="button" data-trip-edit="${escapeAttribute(trip.id)}"><i data-lucide="pencil"></i>Edit</button>
        </div>
      </div>

      <section class="trip-section">
        <h3>Trip notes</h3>
        <p class="task-description">${escapeHTML(trip.notes || "No trip notes yet.")}</p>
      </section>
    </div>
  `;

  elements.tripDetail.querySelector("[data-trip-edit]").addEventListener("click", () => openTripDialog(trip));
  elements.tripDetail.querySelector("[data-google-maps-import]").addEventListener("submit", importGoogleMapsPlaces);
  refreshIcons();
}

function renderVacationCalendar() {
  const trip = getSelectedTrip();
  const monthName = visibleVacationMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  elements.vacationMonthLabel.textContent = trip ? trip.title : "Calendar";
  elements.vacationTripMonthBtn.textContent = monthName;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(visibleVacationMonth);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  elements.vacationCalendarGrid.innerHTML = `
    ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
    ${days
      .map((date) => {
        const iso = toISODate(date);
        const events = trip ? getVacationCalendarEventsForDate(trip, iso) : [];
        const outside = date.getMonth() !== visibleVacationMonth.getMonth();
        const isToday = iso === isoToday;
        return `
          <div class="calendar-day ${outside ? "outside" : ""} ${isToday ? "today" : ""}" data-vacation-date="${iso}">
            <span class="day-number">${date.getDate()}</span>
            <div class="calendar-items">
              ${events
                .map(
                  (event) => `
                    <button class="calendar-task vacation-${event.kind}" type="button" draggable="${event.draggable ? "true" : "false"}" data-vacation-target="${escapeAttribute(event.target)}" data-vacation-target-id="${escapeAttribute(event.targetId)}" data-vacation-source-day-id="${escapeAttribute(event.sourceDayId || "")}" title="${escapeAttribute(event.title)}">
                      <strong>${escapeHTML(event.title)}</strong>
                      ${event.meta ? `<span>${escapeHTML(event.meta)}</span>` : ""}
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

  elements.vacationCalendarGrid.querySelectorAll("[data-vacation-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openVacationItemFromCalendar(button.dataset.vacationTarget, button.dataset.vacationTargetId, button.dataset.vacationSourceDayId);
    });
    button.addEventListener("dragstart", handleVacationCalendarDragStart);
    button.addEventListener("dragend", handleVacationCalendarDragEnd);
  });
  elements.vacationCalendarGrid.querySelectorAll("[data-vacation-date]").forEach((day) => {
    day.addEventListener("click", () => openVacationItemDialog({ date: day.dataset.vacationDate }));
    day.addEventListener("dragover", handleVacationCalendarDragOver);
    day.addEventListener("dragleave", handleVacationCalendarDragLeave);
    day.addEventListener("drop", handleVacationCalendarDrop);
  });
  refreshIcons();
}

function openVacationItemFromCalendar(target, targetId, sourceDayId = "") {
  const trip = getSelectedTrip();
  if (!trip) return;

  if (target === "trip" || target === "day") {
    scrollToVacationTarget(target, targetId);
    return;
  }

  if (target === "hotel") {
    const hotel = trip.hotels.find((item) => item.id === targetId);
    if (hotel) openVacationItemDialog({ item: hotel, type: "hotel" });
    return;
  }

  if (target === "stop") {
    const match = findTripStop(trip, targetId, sourceDayId);
    if (match) openVacationItemDialog({ item: match.stop, type: match.stop.type, sourceDayId: match.day.id, date: match.day.date });
  }
}

function openVacationItemDialog({ date = isoToday, item = null, type = "sightseeing", sourceDayId = "" } = {}) {
  const trip = getSelectedTrip();
  if (!trip) {
    window.alert("Add a trip first.");
    return;
  }

  const isHotel = type === "hotel";
  elements.vacationItemDialogTitle.textContent = item ? "Edit vacation item" : "New vacation item";
  elements.deleteVacationItemBtn.style.visibility = item ? "visible" : "hidden";
  vacationItemForm.id.value = item?.id ?? "";
  vacationItemForm.sourceDayId.value = sourceDayId;
  vacationItemForm.type.value = isHotel ? "hotel" : type;
  vacationItemForm.date.value = isHotel ? item?.checkIn || date : date;
  vacationItemForm.endDate.value = isHotel ? item?.checkOut || addDays(vacationItemForm.date.value, 1) : "";
  vacationItemForm.time.value = isHotel ? "" : item?.time || "";
  vacationItemForm.name.value = item?.name || "";
  vacationItemForm.address.value = item?.address || "";
  vacationItemForm.url.value = isHotel ? item?.bookingUrl || "" : item?.url || "";
  vacationItemForm.notes.value = item?.notes || "";
  vacationItemCurrentAttachments = normalizeAttachments(item?.attachments);
  vacationItemAttachmentsToDelete = new Set();
  renderVacationItemAttachmentList();
  syncVacationItemTypeFields();
  elements.vacationItemDialog.showModal();
  vacationItemForm.name.focus();
  refreshIcons();
}

function closeVacationItemDialog() {
  elements.vacationItemDialog.close();
  elements.vacationItemForm.reset();
  vacationItemForm.sourceDayId.value = "";
  vacationItemCurrentAttachments = [];
  vacationItemAttachmentsToDelete = new Set();
  renderVacationItemAttachmentList();
}

function renderVacationItemAttachmentList() {
  const visibleAttachments = vacationItemCurrentAttachments.filter((attachment) => !vacationItemAttachmentsToDelete.has(attachment.id));
  vacationItemForm.attachmentList.innerHTML = visibleAttachments.length
    ? renderAttachmentList(visibleAttachments, {
        deletable: true,
        deleteAttributes: (attachment) => `data-vacation-attachment-remove="${escapeAttribute(attachment.id)}"`,
      })
    : `<div class="empty-state compact">No attachments yet.</div>`;

  vacationItemForm.attachmentList.querySelectorAll("[data-vacation-attachment-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      vacationItemAttachmentsToDelete.add(button.dataset.vacationAttachmentRemove);
      renderVacationItemAttachmentList();
      refreshIcons();
    });
  });
}

function syncVacationItemTypeFields() {
  const isHotel = vacationItemForm.type.value === "hotel";
  vacationItemForm.endDate.disabled = !isHotel;
  vacationItemForm.time.disabled = isHotel;
  vacationItemForm.endDate.required = isHotel;
  vacationItemForm.endDate.closest("label").style.opacity = isHotel ? "1" : "0.55";
  vacationItemForm.time.closest("label").style.opacity = isHotel ? "0.55" : "1";
}

async function saveVacationItemFromForm(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  if (!trip) return;

  const submitButton = elements.vacationItemForm.querySelector('button[type="submit"]');
  const id = vacationItemForm.id.value || crypto.randomUUID();
  const type = vacationItemForm.type.value;
  const date = vacationItemForm.date.value || trip.startDate;
  const existingHotel = trip.hotels.find((hotel) => hotel.id === id);
  const existingStop = findTripStop(trip, id, vacationItemForm.sourceDayId.value);
  const removedAttachments = vacationItemCurrentAttachments.filter((attachment) => vacationItemAttachmentsToDelete.has(attachment.id));
  const keptAttachments = vacationItemCurrentAttachments.filter((attachment) => !vacationItemAttachmentsToDelete.has(attachment.id));
  let attachments = keptAttachments;

  try {
    submitButton.disabled = true;
    const uploaded = await uploadAttachments(vacationItemForm.attachments.files, `vacation/${trip.id}`);
    attachments = [...keptAttachments, ...uploaded];
  } catch (error) {
    console.error(error);
    window.alert(error.userFacing ? error.message : "Attachment upload failed. The vacation item was not saved.");
    submitButton.disabled = false;
    return;
  }

  if (type === "hotel") {
    if (existingStop) {
      existingStop.day.stops = existingStop.day.stops.filter((stop) => stop.id !== id);
    }
    const checkOut = vacationItemForm.endDate.value && vacationItemForm.endDate.value >= date ? vacationItemForm.endDate.value : addDays(date, 1);
    const hotel = {
      id,
      name: vacationItemForm.name.value.trim(),
      address: vacationItemForm.address.value.trim(),
      checkIn: date,
      checkOut,
      bookingUrl: vacationItemForm.url.value.trim(),
      notes: vacationItemForm.notes.value.trim(),
      attachments,
    };
    if (existingHotel) {
      trip.hotels = trip.hotels.map((item) => (item.id === id ? hotel : item));
    } else {
      trip.hotels.push(hotel);
    }
    trip.hotels.sort((a, b) => String(a.checkIn || "").localeCompare(String(b.checkIn || "")));
  } else {
    if (existingHotel) {
      trip.hotels = trip.hotels.filter((hotel) => hotel.id !== id);
    }
    const targetDay = ensureTripDayForDate(trip, date);
    const stop = {
      id,
      type,
      time: vacationItemForm.time.value.trim(),
      name: vacationItemForm.name.value.trim(),
      address: vacationItemForm.address.value.trim(),
      url: vacationItemForm.url.value.trim(),
      notes: vacationItemForm.notes.value.trim(),
      attachments,
      addedBy: existingStop?.stop.addedBy || state.currentMemberId,
      addedAt: existingStop?.stop.addedAt || new Date().toISOString(),
      source: existingStop?.stop.source || "Vacation calendar",
      updatedBy: state.currentMemberId,
      updatedAt: new Date().toISOString(),
    };
    if (existingStop && existingStop.day.id !== targetDay.id) {
      existingStop.day.stops = existingStop.day.stops.filter((item) => item.id !== id);
    }
    targetDay.stops = targetDay.stops.filter((item) => item.id !== id);
    targetDay.stops.push(stop);
    targetDay.stops.sort((a, b) => a.time.localeCompare(b.time));
  }

  trip.updatedAt = new Date().toISOString();
  visibleVacationMonth = monthForDate(date) || visibleVacationMonth;
  saveState();
  deleteAttachmentFiles(removedAttachments);
  closeVacationItemDialog();
  submitButton.disabled = false;
  renderTrips();
}

async function deleteCurrentVacationItem() {
  const trip = getSelectedTrip();
  const id = vacationItemForm.id.value;
  if (!trip || !id) return;

  const confirmed = window.confirm("Delete this vacation item?");
  if (!confirmed) return;

  const hotelCount = trip.hotels.length;
  const hotel = trip.hotels.find((item) => item.id === id);
  trip.hotels = trip.hotels.filter((hotel) => hotel.id !== id);
  const match = findTripStop(trip, id, vacationItemForm.sourceDayId.value);
  const attachments = hotel?.attachments || match?.stop.attachments || [];
  if (match) {
    match.day.stops = match.day.stops.filter((stop) => stop.id !== id);
  }

  if (hotelCount !== trip.hotels.length || match) {
    trip.updatedAt = new Date().toISOString();
    saveState();
    deleteAttachmentFiles(attachments);
  }
  closeVacationItemDialog();
  renderTrips();
}

function handleVacationCalendarDragStart(event) {
  const button = event.currentTarget;
  if (button.draggable !== true) return;
  button.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(
    "application/json",
    JSON.stringify({
      target: button.dataset.vacationTarget,
      targetId: button.dataset.vacationTargetId,
      sourceDayId: button.dataset.vacationSourceDayId || "",
    }),
  );
}

function handleVacationCalendarDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  elements.vacationCalendarGrid.querySelectorAll(".drag-over").forEach((item) => item.classList.remove("drag-over"));
}

function handleVacationCalendarDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleVacationCalendarDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function handleVacationCalendarDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");
  const date = event.currentTarget.dataset.vacationDate;
  try {
    const payload = JSON.parse(event.dataTransfer.getData("application/json"));
    moveVacationCalendarItem(payload, date);
  } catch (error) {
    console.warn("Could not move vacation item", error);
  }
}

function moveVacationCalendarItem(payload, date) {
  const trip = getSelectedTrip();
  if (!trip || !date) return;

  if (payload.target === "hotel") {
    const hotel = trip.hotels.find((item) => item.id === payload.targetId);
    if (!hotel) return;
    const duration = Math.max(1, Math.round((parseLocalDate(hotel.checkOut || addDays(hotel.checkIn, 1)) - parseLocalDate(hotel.checkIn || date)) / 86400000));
    hotel.checkIn = date;
    hotel.checkOut = addDays(date, duration);
  }

  if (payload.target === "stop") {
    const match = findTripStop(trip, payload.targetId, payload.sourceDayId);
    if (!match) return;
    const targetDay = ensureTripDayForDate(trip, date);
    if (match.day.id !== targetDay.id) {
      match.day.stops = match.day.stops.filter((stop) => stop.id !== payload.targetId);
      targetDay.stops.push(match.stop);
      targetDay.stops.sort((a, b) => a.time.localeCompare(b.time));
    }
  }

  trip.updatedAt = new Date().toISOString();
  visibleVacationMonth = monthForDate(date) || visibleVacationMonth;
  saveState();
  renderTrips();
}

function renderHotelCard(hotel) {
  return `
    <article class="hotel-card" data-hotel-card="${escapeAttribute(hotel.id)}">
      <div>
        <strong>${escapeHTML(hotel.name || "Hotel stay")}</strong>
        <p>${escapeHTML(hotel.address || "No address added.")}</p>
        <p>${escapeHTML(formatStayRange(hotel))}</p>
        ${hotel.notes ? `<p>${escapeHTML(hotel.notes)}</p>` : ""}
        ${renderAttachmentList(hotel.attachments)}
      </div>
      <div class="detail-actions">
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

function renderGoogleMapsImportForm(trip) {
  const dayOptions = trip.days
    .map(
      (day, index) =>
        `<option value="${escapeAttribute(day.id)}">${escapeHTML(day.title || `Day ${index + 1}`)} · ${formatShortDate(day.date)}</option>`,
    )
    .join("");

  return `
    <details class="maps-import-menu">
      <summary class="secondary-button"><i data-lucide="list-plus"></i>Import places</summary>
      <form class="travel-form maps-import-form" data-google-maps-import data-trip-id="${escapeAttribute(trip.id)}">
        <select name="dayId">
          <option value="">New sightseeing day</option>
          ${dayOptions}
        </select>
        <textarea name="places" rows="4" required placeholder="Paste copied Google Maps place rows, one place per line, or exported CSV"></textarea>
        <p class="maps-import-help">Copy the place rows from Google Maps or paste a Takeout export. A share link alone does not expose the saved places to Family Hub.</p>
        <button class="secondary-button" type="submit"><i data-lucide="plus"></i>Add to trip</button>
      </form>
    </details>
  `;
}

function renderTripDayCard(trip, day) {
  const stops = day.stops.length
    ? day.stops.map((stop) => renderTripStop(trip, day, stop)).join("")
    : `<div class="empty-state compact">No stops yet.</div>`;
  return `
    <article class="trip-day-card" data-trip-day-card="${escapeAttribute(day.id)}" data-day-drop="${escapeAttribute(day.id)}">
      <div class="trip-day-heading">
        <div>
          <p class="eyebrow">${formatLongDate(day.date)}</p>
          <h3>${escapeHTML(day.title || `Day ${trip.days.indexOf(day) + 1}`)}</h3>
          ${day.notes ? `<p>${escapeHTML(day.notes)}</p>` : ""}
        </div>
        <div class="detail-actions">
          <button class="icon-button danger" type="button" data-day-delete="${escapeAttribute(day.id)}" title="Delete day" aria-label="Delete day">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
      <div class="stop-list" data-day-drop="${escapeAttribute(day.id)}">${stops}</div>
      ${renderStopForm(day)}
    </article>
  `;
}

function renderTripStop(trip, day, stop) {
  const attribution = stop.addedBy
    ? `<p class="trip-attribution">Added by ${escapeHTML(memberName(stop.addedBy))}${stop.source ? ` · ${escapeHTML(stop.source)}` : ""}</p>`
    : "";
  const dayOptions = trip.days
    .map(
      (tripDay, index) =>
        `<option value="${escapeAttribute(tripDay.id)}" ${tripDay.id === day.id ? "selected" : ""}>${escapeHTML(tripDay.title || `Day ${index + 1}`)}</option>`,
    )
    .join("");
  return `
    <article class="stop-card ${escapeAttribute(stop.type)}" draggable="true" data-stop-drag="${escapeAttribute(stop.id)}" data-day-id="${escapeAttribute(day.id)}" title="Drag to another day">
      <div>
        <span class="badge">${tripStopTypeLabel(stop.type)}</span>
        <strong>${escapeHTML(stop.time ? `${stop.time} · ${stop.name}` : stop.name)}</strong>
        <p>${escapeHTML(stop.address || "No address added.")}</p>
        ${stop.notes ? `<p>${escapeHTML(stop.notes)}</p>` : ""}
        ${renderAttachmentList(stop.attachments)}
        ${attribution}
      </div>
      <div class="detail-actions">
        <select class="move-stop-select" data-stop-move="${escapeAttribute(stop.id)}" data-day-id="${escapeAttribute(day.id)}" title="Move to day" aria-label="Move stop to day">
          ${dayOptions}
        </select>
        ${stop.url ? `<a class="secondary-button" href="${escapeAttribute(stop.url)}" target="_blank" rel="noreferrer"><i data-lucide="external-link"></i>Link</a>` : ""}
        <details class="stop-edit-menu">
          <summary class="icon-button" title="Edit stop" aria-label="Edit stop"><i data-lucide="pencil"></i></summary>
          ${renderStopEditForm(day, stop)}
        </details>
        <button class="icon-button danger" type="button" data-day-id="${escapeAttribute(day.id)}" data-stop-delete="${escapeAttribute(stop.id)}" title="Delete stop" aria-label="Delete stop">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `;
}

function renderStopEditForm(day, stop) {
  return `
    <form class="travel-form stop-edit-form" data-stop-edit-form data-day-id="${escapeAttribute(day.id)}" data-stop-id="${escapeAttribute(stop.id)}">
      <select name="type">
        ${["sightseeing", "food", "hotel", "drive", "other"]
          .map((type) => `<option value="${type}" ${stop.type === type ? "selected" : ""}>${tripStopTypeLabel(type)}</option>`)
          .join("")}
      </select>
      <input name="time" maxlength="20" placeholder="Time" value="${escapeAttribute(stop.time)}" />
      <input name="name" required maxlength="90" placeholder="Place or activity" value="${escapeAttribute(stop.name)}" />
      <input name="address" maxlength="160" placeholder="Address or map search text" value="${escapeAttribute(stop.address)}" />
      <input name="url" type="url" placeholder="Website/menu link" value="${escapeAttribute(stop.url)}" />
      <input name="notes" maxlength="240" placeholder="Notes, tickets, must order" value="${escapeAttribute(stop.notes)}" />
      <button class="secondary-button" type="submit"><i data-lucide="save"></i>Save</button>
    </form>
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

function importGoogleMapsPlaces(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  if (!trip) return;

  const data = new FormData(event.currentTarget);
  const importedPlaces = parseImportedMapPlaces(data.get("places"));
  if (!importedPlaces.length) {
    window.alert("No places found to import.");
    return;
  }

  const selectedDayId = String(data.get("dayId") || "");
  let day = trip.days.find((item) => item.id === selectedDayId);
  if (!day) {
    day = {
      id: crypto.randomUUID(),
      date: nextTripDayDate(trip),
      title: "Sightseeing",
      notes: "",
      stops: [],
    };
    trip.days.push(day);
    trip.days.sort((a, b) => a.date.localeCompare(b.date));
  }

  const existingStops = new Set(
    trip.days.flatMap((tripDay) =>
      tripDay.stops.map((stop) => normalizeMapPlaceKey(stop.name, stop.address)),
    ),
  );
  const stops = importedPlaces
    .filter((place) => {
      const key = normalizeMapPlaceKey(place.name, place.address);
      if (existingStops.has(key)) return false;
      existingStops.add(key);
      return true;
    })
    .map((place) => ({
      id: crypto.randomUUID(),
      type: "sightseeing",
      name: place.name,
      address: place.address,
      time: "",
      url: place.url,
      notes: "",
      addedBy: state.currentMemberId,
      addedAt: new Date().toISOString(),
      source: "Google Maps import",
    }));

  if (!stops.length) {
    window.alert("Those places are already in this trip.");
    return;
  }

  day.stops.push(...stops);
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
  window.alert(`Added ${stops.length} sightseeing place${stops.length === 1 ? "" : "s"}. Existing trip places were kept.`);
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
    addedBy: state.currentMemberId,
    addedAt: new Date().toISOString(),
    source: "Manual add",
  });
  day.stops.sort((a, b) => a.time.localeCompare(b.time));
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function updateTripStop(event) {
  event.preventDefault();
  const trip = getSelectedTrip();
  const day = trip?.days.find((item) => item.id === event.currentTarget.dataset.dayId);
  const stop = day?.stops.find((item) => item.id === event.currentTarget.dataset.stopId);
  if (!trip || !day || !stop) return;

  const data = new FormData(event.currentTarget);
  stop.type = String(data.get("type") || "sightseeing");
  stop.time = String(data.get("time") || "").trim();
  stop.name = String(data.get("name") || "").trim();
  stop.address = String(data.get("address") || "").trim();
  stop.url = String(data.get("url") || "").trim();
  stop.notes = String(data.get("notes") || "").trim();
  stop.updatedBy = state.currentMemberId;
  stop.updatedAt = new Date().toISOString();
  day.stops.sort((a, b) => a.time.localeCompare(b.time));
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function handleTripStopDragStart(event) {
  const card = event.currentTarget;
  card.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData(
    "application/json",
    JSON.stringify({
      sourceDayId: card.dataset.dayId,
      stopId: card.dataset.stopDrag,
    }),
  );
}

function handleTripStopDragEnd(event) {
  event.currentTarget.classList.remove("dragging");
  elements.tripDetail.querySelectorAll(".drag-over").forEach((item) => item.classList.remove("drag-over"));
}

function handleTripStopDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
}

function handleTripStopDragLeave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.classList.remove("drag-over");
  }
}

function handleTripStopDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  const targetDayId = event.currentTarget.dataset.dayDrop;
  event.currentTarget.classList.remove("drag-over");

  try {
    const payload = JSON.parse(event.dataTransfer.getData("application/json") || "{}");
    moveStopToDay(payload.sourceDayId, payload.stopId, targetDayId);
  } catch (error) {
    console.warn("Could not move trip stop", error);
  }
}

function moveStopToDay(sourceDayId, stopId, targetDayId) {
  if (!sourceDayId || !stopId || !targetDayId || sourceDayId === targetDayId) return;

  const trip = getSelectedTrip();
  const sourceDay = trip?.days.find((day) => day.id === sourceDayId);
  const targetDay = trip?.days.find((day) => day.id === targetDayId);
  if (!trip || !sourceDay || !targetDay) return;

  const stop = sourceDay.stops.find((item) => item.id === stopId);
  if (!stop) return;

  sourceDay.stops = sourceDay.stops.filter((item) => item.id !== stopId);
  targetDay.stops.push(stop);
  targetDay.stops.sort((a, b) => a.time.localeCompare(b.time));
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
  const stop = day.stops.find((item) => item.id === stopId);
  const confirmed = window.confirm(`Remove "${stop?.name || "this place"}" from the trip?`);
  if (!confirmed) return;
  day.stops = day.stops.filter((stop) => stop.id !== stopId);
  trip.updatedAt = new Date().toISOString();
  saveState();
  renderTrips();
}

function renderFinance() {
  elements.financeManualDate.value ||= isoToday;
  renderCreditCards();
  renderFinanceTotal();
  renderFinanceCalendar();
  renderFinanceExpenses();
}

function renderCreditCards() {
  if (!state.creditCards) {
    state.creditCards = normalizeCreditCards();
  }

  const canEdit = isAdminMember();
  if (!state.creditCards.length) {
    elements.financeCreditCardList.innerHTML = `<div class="empty-state compact">No credit cards added yet.</div>`;
    refreshIcons();
    return;
  }

  elements.financeCreditCardList.innerHTML = state.creditCards
    .map(
      (card) => {
        const paid = isCreditCardPaidForFinanceMonth(card);
        const dueDate = creditCardDueDateForMonth(card, visibleFinanceMonth);
        const reminderDate = dueDate ? addDays(dueDate, -7) : "";
        return `
          <article class="credit-card-row ${paid ? "paid" : "due"}" data-credit-card-row="${escapeAttribute(card.id)}">
            <div>
              <p class="eyebrow">${escapeHTML(card.issuer)}</p>
              <h3>${escapeHTML(card.name)}</h3>
              <div class="credit-card-status-line">
                <span class="badge ${paid ? "paid" : "high"}">${paid ? "Paid" : "Due"}</span>
                <span>${dueDate ? `Due ${formatShortDate(dueDate)}` : "Add due day"}</span>
                <span>${reminderDate ? `Reminder ${formatShortDate(reminderDate)}` : "Reminder appears 7 days before due date"}</span>
              </div>
              <p>${escapeHTML(card.recommendedUsage)}</p>
            </div>
            <div class="credit-card-fields">
              <label>
                Bill amount
                <input data-card-field="billAmount" data-card-id="${escapeAttribute(card.id)}" type="number" min="0" step="0.01" value="${card.billAmount || ""}" placeholder="0.00" ${canEdit ? "" : "disabled"} />
              </label>
              <label>
                Due day every month
                <input data-card-field="dueDay" data-card-id="${escapeAttribute(card.id)}" type="number" min="1" max="31" step="1" value="${card.dueDay || ""}" placeholder="Day" ${canEdit ? "" : "disabled"} />
              </label>
              <label class="payment-toggle">
                Payment status
                <span>
                  <span>Due</span>
                  <input data-card-paid="${escapeAttribute(card.id)}" type="checkbox" ${paid ? "checked" : ""} ${canEdit ? "" : "disabled"} />
                  <span>Paid</span>
                </span>
              </label>
            </div>
          </article>
        `;
      },
    )
    .join("");

  elements.financeCreditCardList.querySelectorAll("[data-card-field]").forEach((input) => {
    input.addEventListener("change", updateCreditCardField);
  });
  elements.financeCreditCardList.querySelectorAll("[data-card-paid]").forEach((button) => {
    button.addEventListener("click", () => toggleCreditCardPaid(button.dataset.cardPaid));
  });
  refreshIcons();
}

function renderFinanceTotal() {
  const expenses = getExpensesForFinanceMonth();
  const total = sumExpenses(expenses);
  elements.financeMonthlyTotal.textContent = formatMoney(total);
  elements.financeMonthSummary.textContent = expenses.length
    ? `${expenses.length} expense${expenses.length === 1 ? "" : "s"} in ${financeMonthName()}.`
    : `No expenses in ${financeMonthName()}.`;
}

function renderFinanceCalendar() {
  elements.financeMonthLabel.textContent = "Calendar";
  elements.financeThisMonthBtn.textContent = financeMonthName();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(visibleFinanceMonth);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  elements.financeCalendarGrid.innerHTML = `
    ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
    ${days
      .map((date) => {
        const iso = toISODate(date);
        const expenses = state.expenses.filter((expense) => expense.date === iso);
        const cardEvents = getCreditCardEventsForDate(iso);
        const outside = date.getMonth() !== visibleFinanceMonth.getMonth();
        const isToday = iso === isoToday;
        return `
          <div class="calendar-day ${outside ? "outside" : ""} ${isToday ? "today" : ""}">
            <span class="day-number">${date.getDate()}</span>
            <div class="calendar-items">
              ${expenses
                .map(
                  (expense) => `
                    <button class="calendar-task finance" type="button" data-finance-expense="${escapeAttribute(expense.id)}" title="${escapeAttribute(`${expense.title} ${formatMoney(expense.amount)}`)}">
                      ${escapeHTML(`${expense.title} ${formatMoney(expense.amount)}`)}
                    </button>
                  `,
                )
                .join("")}
              ${cardEvents
                .map(
                  (event) => `
                    <button class="calendar-task ${event.kind === "reminder" ? "card-reminder" : "card-due"}" type="button" data-finance-card="${escapeAttribute(event.cardId)}" title="${escapeAttribute(event.title)}">
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

  elements.financeCalendarGrid.querySelectorAll("[data-finance-expense]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.financeExpensesDisclosure.open = true;
      const row = elements.financeExpenseList.querySelector(`[data-expense-card="${CSS.escape(button.dataset.financeExpense)}"]`);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  elements.financeCalendarGrid.querySelectorAll("[data-finance-card]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.financeCardsDisclosure.open = true;
      const row = elements.financeCreditCardList.querySelector(`[data-credit-card-row="${CSS.escape(button.dataset.financeCard)}"]`);
      row?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function renderFinanceExpenses() {
  const expenses = getExpensesForFinanceMonth();
  if (!expenses.length) {
    elements.financeExpenseList.innerHTML = `<div class="empty-state compact">No finance expenses for this month yet.</div>`;
    refreshIcons();
    return;
  }

  elements.financeExpenseList.innerHTML = expenses
    .map(
      (expense) => `
        <article class="finance-expense-card" data-expense-card="${escapeAttribute(expense.id)}">
          <div>
            <strong>${escapeHTML(expense.title)}</strong>
            <p>${formatLongDate(expense.date)} · ${escapeHTML(expense.category)} · ${escapeHTML(expense.sourceName)}</p>
            <label class="finance-note-label">
              Note
              <textarea data-expense-note="${escapeAttribute(expense.id)}" rows="2" maxlength="500" placeholder="What was this expense for?">${escapeHTML(expense.note || "")}</textarea>
            </label>
            ${expense.textSnippet ? `<p>${escapeHTML(expense.textSnippet)}</p>` : ""}
          </div>
          <div class="finance-expense-actions">
            <span>${formatMoney(expense.amount)}</span>
            <button class="icon-button danger" type="button" data-delete-expense="${escapeAttribute(expense.id)}" title="Delete expense" aria-label="Delete expense">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  elements.financeExpenseList.querySelectorAll("[data-delete-expense]").forEach((button) => {
    button.addEventListener("click", () => deleteFinanceExpense(button.dataset.deleteExpense));
  });
  elements.financeExpenseList.querySelectorAll("[data-expense-note]").forEach((textarea) => {
    textarea.addEventListener("change", updateFinanceExpenseNote);
  });

  refreshIcons();
}

function changeFinanceMonth(delta) {
  visibleFinanceMonth = new Date(visibleFinanceMonth.getFullYear(), visibleFinanceMonth.getMonth() + delta, 1);
  renderFinance();
  renderMainTabs();
}

function deleteFinanceExpense(expenseId) {
  const expense = state.expenses.find((item) => item.id === expenseId);
  if (!expense) return;
  const confirmed = window.confirm(`Delete "${expense.title}" for ${formatMoney(expense.amount)}?`);
  if (!confirmed) return;
  state.expenses = state.expenses.filter((item) => item.id !== expenseId);
  saveState();
  renderFinance();
  renderMainTabs();
}

function addManualFinanceExpense(event) {
  event.preventDefault();
  const amount = normalizeExpenseAmount(elements.financeManualAmount.value);
  const date = elements.financeManualDate.value || isoToday;
  const title = elements.financeManualTitle.value.trim();
  if (!title || !amount || !date) return;

  const now = new Date().toISOString();
  const expense = {
    id: crypto.randomUUID(),
    title,
    merchant: title,
    date,
    amount,
    category: inferFinanceCategory(title),
    sourceName: "Manual entry",
    sourceType: "manual",
    note: elements.financeManualNote.value.trim(),
    textSnippet: "",
    addedBy: state.currentMemberId,
    createdAt: now,
    updatedAt: now,
  };

  state.expenses.unshift(expense);
  state.expenses = normalizeExpenses(state.expenses);
  visibleFinanceMonth = new Date(parseLocalDate(date).getFullYear(), parseLocalDate(date).getMonth(), 1);
  saveState();
  elements.financeManualForm.reset();
  elements.financeManualDate.value = date;
  elements.financeExpensesDisclosure.open = true;
  elements.financeProcessStatus.textContent = `Added ${title} for ${formatMoney(amount)}.`;
  renderFinance();
  renderMainTabs();
}

function updateFinanceExpenseNote(event) {
  const expense = state.expenses.find((item) => item.id === event.currentTarget.dataset.expenseNote);
  if (!expense) return;
  expense.note = event.currentTarget.value.trim();
  expense.updatedAt = new Date().toISOString();
  saveState();
}

function updateCreditCardField(event) {
  const card = state.creditCards.find((item) => item.id === event.currentTarget.dataset.cardId);
  if (!card) return;
  if (!isAdminMember()) {
    event.currentTarget.value = event.currentTarget.defaultValue;
    window.alert("Only the family admin can edit credit card settings and payments.");
    return;
  }

  const field = event.currentTarget.dataset.cardField;
  if (field === "billAmount") {
    card.billAmount = normalizeExpenseAmount(event.currentTarget.value);
  } else if (field === "dueDay") {
    card.dueDay = normalizeDueDay(event.currentTarget.value);
  } else {
    return;
  }

  card.updatedAt = new Date().toISOString();
  saveState();
  renderFinance();
}

function toggleCreditCardPaid(cardId) {
  if (!isAdminMember()) {
    window.alert("Only the family admin can change credit card payment status.");
    return;
  }

  const card = state.creditCards.find((item) => item.id === cardId);
  if (!card) return;
  const monthKey = financeMonthKey(visibleFinanceMonth);
  card.paidMonth = card.paidMonth === monthKey ? "" : monthKey;
  card.updatedAt = new Date().toISOString();
  saveState();
  renderFinance();
}

function handleFinanceDragOver(event) {
  event.preventDefault();
  elements.financeDropZone.classList.add("dragging");
}

function handleFinanceDragLeave() {
  elements.financeDropZone.classList.remove("dragging");
}

function handleFinanceDrop(event) {
  event.preventDefault();
  elements.financeDropZone.classList.remove("dragging");
  processFinanceFiles(event.dataTransfer.files);
}

async function processFinanceFiles(fileList) {
  const files = [...(fileList || [])];
  if (!files.length) return;

  elements.financeExpensesDisclosure.open = true;
  elements.financeProcessStatus.textContent = `Processing ${files.length} file${files.length === 1 ? "" : "s"}...`;
  elements.financeUploadBtn.disabled = true;

  const now = new Date().toISOString();
  const extractedExpenses = [];
  const failures = [];

  for (const file of files) {
    try {
      elements.financeProcessStatus.textContent = `Reading ${file.name}...`;
      const text = await extractFinanceText(file);
      const expenses = extractExpensesFromBillText(text, file, now);
      if (expenses.length) {
        extractedExpenses.push(...expenses);
      } else {
        failures.push(file.name);
      }
    } catch (error) {
      console.error(error);
      failures.push(file.name);
    }
  }

  if (extractedExpenses.length) {
    state.expenses.unshift(...extractedExpenses);
    state.expenses = normalizeExpenses(state.expenses);
    visibleFinanceMonth = parseLocalDate(extractedExpenses[0].date);
    visibleFinanceMonth = new Date(visibleFinanceMonth.getFullYear(), visibleFinanceMonth.getMonth(), 1);
    saveState();
  }

  elements.financeFileInput.value = "";
  elements.financeUploadBtn.disabled = false;
  elements.financeProcessStatus.textContent = [
    extractedExpenses.length
      ? `Added ${extractedExpenses.length} expense${extractedExpenses.length === 1 ? "" : "s"}.`
      : "No expenses were found.",
    failures.length ? `Could not read: ${failures.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  renderFinance();
  renderMainTabs();
}

async function extractFinanceText(file) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(file);
  }

  if (file.type.startsWith("image/")) {
    return extractImageText(file);
  }

  return file.text();
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader did not load.");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    window.pdfjsLib.GlobalWorkerOptions.workerSrc || "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const bytes = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();
    content.items.forEach((item) => {
      const y = Math.round(item.transform?.[5] || 0);
      const x = item.transform?.[4] || 0;
      const row = rows.get(y) || [];
      row.push({ x, text: item.str });
      rows.set(y, row);
    });
    pages.push(
      [...rows.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, row]) =>
          row
            .sort((a, b) => a.x - b.x)
            .map((item) => item.text)
            .join(" "),
        )
        .join("\n"),
    );
  }
  return pages.join("\n");
}

async function extractImageText(file) {
  if (!window.Tesseract) {
    throw new Error("Image OCR did not load.");
  }

  const result = await window.Tesseract.recognize(file, "eng");
  return result?.data?.text || "";
}

function extractExpensesFromBillText(text, file, now) {
  const cleanedText = String(text || "").replace(/\u00a0/g, " ");
  const lines = cleanedText
    .split(/\r?\n/)
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);

  const sourceName = file.name;
  const sourceType = file.type || "upload";
  const transactionRows = lines
    .map((line) => parseFinanceExpenseLine(line, sourceName, sourceType, now))
    .filter(Boolean);

  const date = findFinanceDate(cleanedText) || transactionRows[0]?.date || isoToday;
  const amount = findFinanceTotalAmount(lines) || transactionRows[0]?.amount || findLargestFinanceAmount(cleanedText);
  if (!amount) return [];

  const merchant = deriveFinanceMerchant(lines, sourceName);
  return [
    {
      id: crypto.randomUUID(),
      title: merchant,
      merchant,
      date,
      amount,
      category: inferFinanceCategory(`${sourceName} ${cleanedText}`),
      sourceName,
      sourceType,
      note: "",
      textSnippet: lines.slice(0, 4).join(" · ").slice(0, 260),
      addedBy: state.currentMemberId,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function parseFinanceExpenseLine(line, sourceName, sourceType, now) {
  if (isNonExpenseFinanceLine(line)) return null;
  const date = findFinanceDate(line);
  if (!date) return null;
  const amounts = findFinanceAmounts(line).filter((amount) => amount > 0 && amount < 50000);
  if (!amounts.length) return null;

  const amount = amounts.at(-1);
  const merchant = cleanFinanceTitle(line) || deriveFinanceMerchant([line], sourceName);
  return {
    id: crypto.randomUUID(),
    title: merchant,
    merchant,
    date,
    amount,
    category: inferFinanceCategory(`${sourceName} ${line}`),
    sourceName,
    sourceType,
    textSnippet: line.slice(0, 260),
    addedBy: state.currentMemberId,
    createdAt: now,
    updatedAt: now,
  };
}

function isNonExpenseFinanceLine(line) {
  return /\b(payment|refund|credit|cashback|available credit|credit limit|previous balance|autopay|thank you)\b/i.test(line);
}

function findFinanceDate(text) {
  const value = String(text || "");
  const iso = value.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return financeDatePartsToISO(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = value.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
  if (numeric) {
    const year = numeric[3] ? normalizeYear(Number(numeric[3])) : today.getFullYear();
    return financeDatePartsToISO(year, Number(numeric[1]), Number(numeric[2]));
  }

  const monthFirst = value.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:,?\s+(\d{2,4}))?\b/i,
  );
  if (monthFirst) {
    const year = monthFirst[3] ? normalizeYear(Number(monthFirst[3])) : today.getFullYear();
    return financeDatePartsToISO(year, monthNameToNumber(monthFirst[1]), Number(monthFirst[2]));
  }

  const dayFirst = value.match(
    /\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\.|,)?(?:\s+(\d{2,4}))?\b/i,
  );
  if (dayFirst) {
    const year = dayFirst[3] ? normalizeYear(Number(dayFirst[3])) : today.getFullYear();
    return financeDatePartsToISO(year, monthNameToNumber(dayFirst[2]), Number(dayFirst[1]));
  }

  return "";
}

function financeDatePartsToISO(year, month, day) {
  if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) return "";
  const candidate = new Date(year, month - 1, day);
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return "";
  return toISODate(candidate);
}

function findFinanceAmounts(text) {
  return [...String(text || "").matchAll(/(?:[$]\s*)?(-?\d{1,3}(?:,\d{3})*|\d+)\.(\d{2})\b/g)]
    .map((match) => normalizeExpenseAmount(`${match[1]}.${match[2]}`))
    .filter(Boolean);
}

function findFinanceTotalAmount(lines) {
  const totalLines = lines.filter((line) =>
    /\b(grand total|amount due|total due|new charges|new balance|statement balance|total)\b/i.test(line) &&
    !/\b(subtotal|savings|change|tax total|total items)\b/i.test(line),
  );
  const candidates = totalLines.flatMap((line) => findFinanceAmounts(line)).filter((amount) => amount > 0 && amount < 50000);
  return candidates.at(-1) || 0;
}

function findLargestFinanceAmount(text) {
  const amounts = findFinanceAmounts(text).filter((amount) => amount > 0 && amount < 50000);
  return amounts.length ? Math.max(...amounts) : 0;
}

function deriveFinanceMerchant(lines, sourceName) {
  const firstMeaningfulLine = lines.find((line) => !findFinanceAmounts(line).length && !findFinanceDate(line) && line.length > 2);
  return cleanFinanceTitle(firstMeaningfulLine || sourceName.replace(/\.[^.]+$/, "")) || "Uploaded bill";
}

function cleanFinanceTitle(text) {
  return String(text || "")
    .replace(/\b\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?\b/g, " ")
    .replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, " ")
    .replace(/[$]?\s*-?\d{1,3}(?:,\d{3})*(?:\.\d{2})\b/g, " ")
    .replace(/\b(purchase|debit|visa|mastercard|amex|card|transaction)\b/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 80);
}

function inferFinanceCategory(text) {
  const value = String(text || "").toLowerCase();
  if (/\b(phone|wireless|verizon|at&t|tmobile|t-mobile|mobile)\b/.test(value)) return "Phone";
  if (/\b(restaurant|cafe|coffee|pizza|doordash|uber eats|food|grocery|market)\b/.test(value)) return "Food";
  if (/\b(gas|fuel|chevron|shell|exxon|parking|toll)\b/.test(value)) return "Travel";
  if (/\b(electric|water|utility|internet|cable|pg&e|pge)\b/.test(value)) return "Utilities";
  if (/\b(credit card|statement|visa|mastercard|amex)\b/.test(value)) return "Credit card";
  return "Bills";
}

function openLoginDialog(memberId = state.currentMemberId) {
  pendingLoginMemberId = memberId || state.currentMemberId;
  renderLoginOptions();
  elements.loginDialog.showModal();
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
            <small>${escapeHTML(member.email || "Local profile")}</small>
          </span>
        </button>
      `,
    )
    .join("");

  elements.loginMemberGrid.querySelectorAll("[data-login-option]").forEach((button) => {
    button.addEventListener("click", () => {
      pendingLoginMemberId = button.dataset.loginOption;
      renderLoginOptions();
    });
  });
}

function loginAsSelectedMember(event) {
  event.preventDefault();
  const member = getMember(pendingLoginMemberId);
  if (!member) return;

  state.currentMemberId = member.id;
  activeTaskMemberId = member.id;
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
}

function openProfileDialog() {
  const member = currentMember();
  elements.profileTitle.textContent = `${member.name}'s profile`;
  elements.profileName.value = member.name;
  elements.profileAge.value = member.age;
  elements.profileEmail.value = member.email;
  elements.profilePhone.value = member.phone || "";
  elements.profileColor.value = member.color;
  elements.profileReminderDays.value = member.settings?.reminderDays ?? 7;
  elements.profileDigest.checked = member.settings?.includeInDigest ?? true;
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
  member.phone = normalizePhone(elements.profilePhone.value);
  member.color = elements.profileColor.value;
  member.settings = {
    reminderDays: Number(elements.profileReminderDays.value) || 7,
    includeInDigest: elements.profileDigest.checked,
  };

  saveState();
  closeProfileDialog();
  populateFormOptions();
  render();
}

function closeProfileDialog() {
  elements.profileDialog.close();
  elements.profileForm.reset();
}

function renderStatusTabs() {
  if (activeTaskMemberId !== "all" && !getMember(activeTaskMemberId)) {
    activeTaskMemberId = "all";
  }

  const activeTasks = state.tasks.filter((task) => task.status !== "done");
  const tabs = [
    { id: "all", label: "All", count: activeTasks.length },
    ...state.members.map((member) => ({
      id: member.id,
      label: member.name,
      count: activeTasks.filter((task) => task.assignee === member.id).length,
    })),
  ];

  elements.statusTabs.innerHTML = tabs
    .map((member) => {
      return `
        <button class="segment ${activeTaskMemberId === member.id ? "active" : ""}" type="button" data-task-member="${member.id}">
          ${escapeHTML(member.label)} ${member.count}
        </button>
      `;
    })
    .join("");

  elements.statusTabs.querySelectorAll("[data-task-member]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTaskMemberId = button.dataset.taskMember;
      selectedTaskId = null;
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
  form.assignee.innerHTML = memberOptions;

  wishForm.owner.innerHTML = memberOptions;
  wishForm.category.innerHTML = wishCategories
    .map((category) => `<option value="${category.id}">${category.label}</option>`)
    .join("");
  wishForm.status.innerHTML = wishStatuses
    .map((status) => `<option value="${status.id}">${status.label}</option>`)
    .join("");
  wishForm.timeframe.innerHTML = wishTimeframes
    .map((timeframe) => `<option value="${timeframe.id}">${timeframe.label}</option>`)
    .join("");
  wishForm.priority.innerHTML = wishPriorities
    .map((priority) => `<option value="${priority.id}">${priority.label}</option>`)
    .join("");
}

function renderTasks() {
  elements.taskList.innerHTML = "";
  renderCalendar();
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
        ${
          memberPhone(task.assignee || task.requester)
            ? `<button class="secondary-button" type="button" data-action="sms"><i data-lucide="message-square"></i>Text</button>`
            : ""
        }
        <button class="chip-button" type="button" data-action="advance"><i data-lucide="${nextStatusIcon(task.status)}"></i>${nextStatusLabel(task.status)}</button>
      </div>
    </div>

    <section class="detail-facts editable-facts">
      <label class="fact inline-fact">
        <span>Status</span>
        <select class="inline-control" data-task-inline="status" aria-label="Task status">
          ${renderStatusOptions(task.status)}
        </select>
      </label>
      <label class="fact inline-fact">
        <span>Due</span>
        <input class="inline-control" data-task-inline="dueDate" aria-label="Task due date" type="date" value="${escapeAttribute(task.dueDate)}" />
      </label>
      <label class="fact inline-fact">
        <span>Repeat</span>
        <select class="inline-control" data-task-inline="recurrence" aria-label="Task repeat">
          ${renderRecurrenceOptions(task.recurrence)}
        </select>
      </label>
      <label class="fact inline-fact">
        <span>Requested by</span>
        <select class="inline-control" data-task-inline="requester" aria-label="Requested by">
          ${renderMemberOptions(task.requester)}
        </select>
      </label>
      <label class="fact inline-fact">
        <span>Assigned to</span>
        <select class="inline-control" data-task-inline="assignee" aria-label="Assigned to">
          ${renderMemberOptions(task.assignee)}
        </select>
      </label>
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
  elements.taskDetail.querySelector('[data-action="sms"]')?.addEventListener("click", () => sendTaskSms(task));
  elements.taskDetail.querySelector('[data-action="advance"]').addEventListener("click", () => advanceTask(task.id));
  elements.taskDetail.querySelector("[data-comment-form]").addEventListener("submit", addComment);
  elements.taskDetail.querySelectorAll("[data-task-inline]").forEach((control) => {
    control.addEventListener("change", updateTaskInlineField);
  });
  refreshIcons();
}

function renderStatusOptions(selectedStatus) {
  return statuses
    .filter((status) => status.id !== "all")
    .map((status) => `<option value="${status.id}" ${status.id === selectedStatus ? "selected" : ""}>${status.label}</option>`)
    .join("");
}

function renderMemberOptions(selectedMemberId) {
  return state.members
    .map((member) => `<option value="${member.id}" ${member.id === selectedMemberId ? "selected" : ""}>${escapeHTML(member.name)}</option>`)
    .join("");
}

function renderRecurrenceOptions(selectedRecurrence = "none") {
  return [
    { id: "none", label: "Does not repeat" },
    { id: "monthly", label: "Monthly" },
  ]
    .map((item) => `<option value="${item.id}" ${item.id === selectedRecurrence ? "selected" : ""}>${item.label}</option>`)
    .join("");
}

function updateTaskInlineField(event) {
  const task = getSelectedTask();
  if (!task) return;

  const field = event.currentTarget.dataset.taskInline;
  const value = event.currentTarget.value;
  if (!["status", "dueDate", "requester", "assignee", "recurrence"].includes(field)) return;
  if (field === "dueDate" && !value) {
    event.currentTarget.value = task.dueDate;
    return;
  }
  if (task[field] === value) return;

  const previousStatus = task.status;
  task[field] = value;
  if (field === "assignee" && !task.assignee) task.assignee = task.requester || state.currentMemberId;
  if (field === "status" && value === "assigned" && !task.assignee) task.assignee = task.requester;
  task.updatedAt = new Date().toISOString();
  if (field === "status") createNextRecurringTask(task, previousStatus);
  saveState();
  renderStatusTabs();
  renderTasks();
  renderDetail();
  renderCalendar();
  renderReminders();
}

function getVisibleTaskCalendarTasks(query = elements.searchInput.value.trim().toLowerCase()) {
  return getSortedTasks().filter((task) => {
    const matchesMember = activeTaskMemberId === "all" || task.assignee === activeTaskMemberId;
    const haystack = [task.title, task.description, task.type, task.status, memberName(task.requester), memberName(task.assignee)]
      .join(" ")
      .toLowerCase();
    return matchesMember && (!query || haystack.includes(query));
  });
}

function renderCalendar() {
  const monthName = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  elements.monthLabel.textContent = "Calendar";
  elements.todayBtn.textContent = monthName;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(visibleMonth);
  start.setDate(1 - start.getDay());

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    days.push(date);
  }

  const visibleTasks = getVisibleTaskCalendarTasks();

  elements.calendarGrid.innerHTML = `
    ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
    ${days
      .map((date) => {
        const iso = toISODate(date);
        const tasks = visibleTasks.filter((task) => task.dueDate === iso);
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
                      <strong>${escapeHTML(task.title)}</strong>
                      <span>${escapeHTML(memberName(task.assignee))} · ${escapeHTML(statusLabel(task.status))}</span>
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
      openTaskDialog(getSelectedTask());
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
      const ownerProfile = getMember(owner);
      return `
        <article class="reminder-item">
          <div class="reminder-row">
            <div>
              <div class="reminder-title">${escapeHTML(task.title)}</div>
              <div class="reminder-meta">${formatDuePhrase(task.dueDate)} · ${escapeHTML(memberName(owner))}</div>
            </div>
            <div class="reminder-actions">
              ${
                ownerProfile?.email
                  ? `<button class="icon-button" type="button" data-email-task="${task.id}" title="Email reminder" aria-label="Email reminder">
                      <i data-lucide="mail">@</i>
                    </button>`
                  : ""
              }
              ${
                ownerProfile?.phone
                  ? `<button class="icon-button" type="button" data-sms-task="${task.id}" title="Text reminder" aria-label="Text reminder">
                      <i data-lucide="message-square"></i>
                    </button>`
                  : ""
              }
            </div>
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

  elements.reminderList.querySelectorAll("[data-sms-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.smsTask);
      if (task) sendTaskSms(task);
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
          ${renderAttachmentList(note.attachments)}
          <div class="note-footer">
            <span class="reminder-meta">${formatDateTime(note.updatedAt)}</span>
            <span class="note-actions">
              <label class="icon-button" title="Add attachment" aria-label="Add attachment">
                <i data-lucide="paperclip"></i>
                <input type="file" multiple accept="${ATTACHMENT_ACCEPT}" data-note-attach="${escapeAttribute(note.id)}" />
              </label>
              ${
                note.attachments?.length
                  ? `<button class="icon-button danger" type="button" data-note-attachment-menu="${escapeAttribute(note.id)}" title="Remove an attachment" aria-label="Remove an attachment">
                      <i data-lucide="file-x"></i>
                    </button>`
                  : ""
              }
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

  elements.notebookList.querySelectorAll("[data-note-attach]").forEach((input) => {
    input.addEventListener("change", (event) => addAttachmentsToNotebookNote(input.dataset.noteAttach, event.target.files, event.target));
  });

  elements.notebookList.querySelectorAll("[data-note-attachment-menu]").forEach((button) => {
    button.addEventListener("click", () => removeNotebookAttachment(button.dataset.noteAttachmentMenu));
  });

  elements.notebookList.querySelectorAll("[data-note-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteNotebookNote(button.dataset.noteDelete));
  });

  refreshIcons();
}

async function addNotebookNote(event) {
  event.preventDefault();
  const text = elements.notebookInput.value.trim();
  const files = [...(elements.notebookAttachments?.files || [])];
  if (!text && !files.length) return;

  const submitButton = elements.notebookForm.querySelector('button[type="submit"]');
  let attachments = [];
  try {
    submitButton.disabled = true;
    attachments = await uploadAttachments(files, `notebooks/${state.currentMemberId}`);
  } catch (error) {
    console.error(error);
    window.alert(error.userFacing ? error.message : "Attachment upload failed. The note was not saved.");
    submitButton.disabled = false;
    return;
  }

  const now = new Date().toISOString();
  getNotebookNotes(state.currentMemberId).unshift({
    id: crypto.randomUUID(),
    text: text || "Attachment",
    attachments,
    createdAt: now,
    updatedAt: now,
  });

  elements.notebookInput.value = "";
  if (elements.notebookAttachments) elements.notebookAttachments.value = "";
  saveState();
  renderNotebook();
  submitButton.disabled = false;
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

async function addAttachmentsToNotebookNote(id, fileList, input) {
  const notes = getNotebookNotes(state.currentMemberId);
  const note = notes.find((item) => item.id === id);
  if (!note) return;
  try {
    const attachments = await uploadAttachments(fileList, `notebooks/${state.currentMemberId}`);
    if (!attachments.length) return;
    note.attachments = [...normalizeAttachments(note.attachments), ...attachments];
    note.updatedAt = new Date().toISOString();
    notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    saveState();
    renderNotebook();
  } catch (error) {
    console.error(error);
    window.alert(error.userFacing ? error.message : "Attachment upload failed. The note was not updated.");
  } finally {
    if (input) input.value = "";
  }
}

async function removeNotebookAttachment(id) {
  const notes = getNotebookNotes(state.currentMemberId);
  const note = notes.find((item) => item.id === id);
  if (!note?.attachments?.length) return;
  const attachmentNames = note.attachments.map((attachment, index) => `${index + 1}. ${attachment.name}`).join("\n");
  const choice = window.prompt(`Which attachment should be removed?\n\n${attachmentNames}`, "1");
  if (choice === null) return;
  const index = Number(choice) - 1;
  const attachment = note.attachments[index];
  if (!attachment) return;
  const confirmed = window.confirm(`Remove "${attachment.name}" from this note?`);
  if (!confirmed) return;

  note.attachments = note.attachments.filter((item) => item.id !== attachment.id);
  note.updatedAt = new Date().toISOString();
  saveState();
  deleteAttachmentFiles([attachment]);
  renderNotebook();
}

async function deleteNotebookNote(id) {
  const notes = getNotebookNotes(state.currentMemberId);
  const note = notes.find((item) => item.id === id);
  if (!note) return;
  const confirmed = window.confirm("Delete this note?");
  if (!confirmed) return;

  state.notes[state.currentMemberId] = notes.filter((item) => item.id !== id);
  saveState();
  deleteAttachmentFiles(note.attachments);
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
    "Show dreams",
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
    return "I can answer things like: what is due today, what is due this week, who owns a task, what is overdue, what is unassigned, show family dreams, show my notes, create a task from a note, or summarize a family member's tasks.";
  }

  if (mentionsTaskCreationFromNote(normalized)) {
    const member = person || currentMember();
    return createTaskFromNotebookQuestion(normalized, member);
  }

  if (mentionsRoughTaskCreation(question, normalized)) {
    return createTasksFromRoughList(question);
  }

  if (mentionsWish(normalized)) {
    const wishes = getSortedWishes().filter((wish) => !isClosedWish(wish));
    if (person) {
      return formatWishAnswer(`${person.name}'s dreams`, wishes.filter((wish) => wish.owner === person.id));
    }

    const matchingWishes = searchWishes(normalized, wishes);
    return formatWishAnswer("Dreams", matchingWishes.length ? matchingWishes : wishes);
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

  return "I did not find a matching task or person. Try asking “what is due this week?”, “who owns dentist?”, “summarize teen tasks”, or “show unassigned tasks”.";
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
      wishTimeframeLabel(wish),
      wishPriorityLabel(wish.priority),
      wish.estimatedCost,
      wish.notes.map((note) => note.text).join(" "),
      wish.links.map((link) => `${link.title} ${link.url} ${link.notes} ${wishLinkTypeLabel(link.type)}`).join(" "),
      memberName(wish.owner),
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
      const research = wish.notes.length || wish.links.length ? `, ${wish.notes.length} notes, ${wish.links.length} links` : "";
      return `- ${wish.title}: ${memberName(wish.owner)}, ${wishCategoryLabel(wish.category)}, ${wishStatusLabel(wish.status)}, ${wishTimeframeLabel(wish)}${research}`;
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

  return `Created task: ${task.title}\nDue: ${formatLongDate(task.dueDate)}\nRequested by: ${member.name}\nAssigned to: ${member.name}`;
}

function createTasksFromRoughList(question) {
  const drafts = parseRoughTaskList(question);
  if (!drafts.length) {
    return "Paste one task per line with a date, like:\n- Dentist appointment 5/20\n- Driving practice tomorrow\n- Buy birthday gift by May 30";
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
    assignee: draft.assignee || state.currentMemberId,
    dueDate: draft.dueDate,
    recurrence: inferRecurrence(draft.original),
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
    assignee: member.id,
    dueDate: deriveDueDateFromQuestion(question),
    recurrence: inferRecurrence(question),
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

function inferRecurrence(text) {
  return /\b(monthly|every\s+month|recurring|repeat(?:s|ing)?)\b/i.test(String(text || "")) ? "monthly" : "none";
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
  form.assignee.value = task?.assignee ?? state.currentMemberId;
  form.dueDate.value = task?.dueDate ?? isoToday;
  form.recurrence.value = task?.recurrence ?? "none";
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
  elements.wishDialogTitle.textContent = wish ? "Edit dream" : "New dream";
  elements.deleteWishBtn.style.visibility = wish ? "visible" : "hidden";

  wishForm.id.value = wish?.id ?? "";
  wishForm.title.value = wish?.title ?? "";
  wishForm.owner.value = wish?.owner ?? (activeWishMemberId !== "all" ? activeWishMemberId : state.currentMemberId) ?? state.currentMemberId;
  wishForm.category.value = wish?.category ?? "experience";
  wishForm.status.value = wish?.status ?? "idea";
  wishForm.timeframe.value = wish?.timeframe ?? "someday";
  wishForm.customTimeframe.value = wish?.customTimeframe ?? "";
  wishForm.priority.value = wish?.priority ?? "normal";
  wishForm.estimatedCost.value = wish?.estimatedCost ?? "";
  wishForm.details.value = wish?.details ?? "";
  syncWishTimeframeField();

  elements.wishDialog.showModal();
  wishForm.details.focus();
  refreshIcons();
}

function closeWishDialog() {
  elements.wishDialog.close();
  elements.wishForm.reset();
}

function syncWishTimeframeField() {
  const isCustom = wishForm.timeframe.value === "custom";
  wishForm.customTimeframe.disabled = !isCustom;
  wishForm.customTimeframe.closest("label").style.opacity = isCustom ? "1" : "0.55";
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
    timeframe: wishForm.timeframe.value,
    customTimeframe: wishForm.customTimeframe.value.trim(),
    priority: wishForm.priority.value,
    estimatedCost: wishForm.estimatedCost.value.trim(),
    targetDate: existing?.targetDate ?? "",
    details,
    notes: existing?.notes ?? [],
    links: existing?.links ?? [],
    attachments: existing?.attachments ?? [],
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
  deleteAttachmentFiles(wish.attachments);
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
  visibleVacationMonth = monthForDate(trip.startDate) || visibleVacationMonth;
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
  visibleVacationMonth = monthForDate(getSelectedTrip()?.startDate) || new Date(today.getFullYear(), today.getMonth(), 1);
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
    assignee: form.assignee.value || form.requester.value || state.currentMemberId,
    dueDate: form.dueDate.value,
    recurrence: form.recurrence.value,
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
  selectedTaskId = null;
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
  wish.status = wish.status === "idea" ? "discussing" : wish.status;
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

function addWishNote(event) {
  event.preventDefault();
  const wish = getSelectedWish();
  if (!wish) return;

  const data = new FormData(event.currentTarget);
  const text = String(data.get("text") || "").trim();
  if (!text) return;

  wish.notes.unshift({
    id: crypto.randomUUID(),
    author: String(data.get("author")),
    createdAt: new Date().toISOString(),
    text,
  });
  if (wish.status === "idea") wish.status = "researching";
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

function deleteWishNote(noteId) {
  const wish = getSelectedWish();
  if (!wish) return;
  const note = wish.notes.find((item) => item.id === noteId);
  if (!note) return;
  const confirmed = window.confirm("Remove this research note?");
  if (!confirmed) return;

  wish.notes = wish.notes.filter((item) => item.id !== noteId);
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

function addWishLink(event) {
  event.preventDefault();
  const wish = getSelectedWish();
  if (!wish) return;

  const data = new FormData(event.currentTarget);
  const url = String(data.get("url") || "").trim();
  if (!url) return;

  wish.links.unshift({
    id: crypto.randomUUID(),
    title: String(data.get("title") || "").trim() || titleFromUrl(url),
    url,
    type: String(data.get("type") || "other"),
    notes: String(data.get("notes") || "").trim(),
    addedBy: state.currentMemberId,
    addedAt: new Date().toISOString(),
  });
  if (wish.status === "idea") wish.status = "researching";
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

function deleteWishLink(linkId) {
  const wish = getSelectedWish();
  if (!wish) return;
  const link = wish.links.find((item) => item.id === linkId);
  if (!link) return;
  const confirmed = window.confirm(`Remove "${link.title}"?`);
  if (!confirmed) return;

  wish.links = wish.links.filter((item) => item.id !== linkId);
  wish.updatedAt = new Date().toISOString();
  saveState();
  renderWishes();
}

async function addWishAttachments(event) {
  event.preventDefault?.();
  const wish = getSelectedWish();
  if (!wish) return;

  const input = event.currentTarget?.matches?.("input[type='file']")
    ? event.currentTarget
    : event.currentTarget?.querySelector?.("input[type='file']");
  const files = input?.files || [];
  if (!files.length) return;

  try {
    const attachments = await uploadAttachments(files, `dreams/${wish.id}`);
    if (!attachments.length) return;
    wish.attachments = [...normalizeAttachments(wish.attachments), ...attachments];
    if (wish.status === "idea") wish.status = "researching";
    wish.updatedAt = new Date().toISOString();
    saveState();
    renderWishes();
  } catch (error) {
    console.error(error);
    window.alert(error.userFacing ? error.message : "Attachment upload failed. The dream was not updated.");
  } finally {
    if (input) input.value = "";
  }
}

function removeWishAttachment() {
  const wish = getSelectedWish();
  if (!wish?.attachments?.length) return;
  const attachmentNames = wish.attachments.map((attachment, index) => `${index + 1}. ${attachment.name}`).join("\n");
  const choice = window.prompt(`Which attachment should be removed?\n\n${attachmentNames}`, "1");
  if (choice === null) return;
  const index = Number(choice) - 1;
  const attachment = wish.attachments[index];
  if (!attachment) return;
  const confirmed = window.confirm(`Remove "${attachment.name}" from this dream?`);
  if (!confirmed) return;

  wish.attachments = wish.attachments.filter((item) => item.id !== attachment.id);
  wish.updatedAt = new Date().toISOString();
  saveState();
  deleteAttachmentFiles([attachment]);
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
    assignee: wish.owner,
    dueDate: addDays(isoToday, 7),
    recurrence: "none",
    priority: wish.priority === "high" ? "high" : "normal",
    description: `Created from Dream.\n\nType: ${wishCategoryLabel(wish.category)}\nTimeframe: ${wishTimeframeLabel(wish)}\nEstimate: ${wish.estimatedCost || "Open"}\n\nDream details:\n${wish.details || "No details added."}`,
    comments: [
      {
        id: crypto.randomUUID(),
        author: state.currentMemberId,
        createdAt: now,
        text: "Created from a Dream.",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  state.tasks.unshift(task);
  wish.status = "planning";
  wish.updatedAt = now;
  activeMainView = "tasks";
  selectedTaskId = task.id;
  saveState();
  render();
  document.querySelector(".task-calendar-layout")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const previousStatus = task.status;
  const next = order[Math.min(order.indexOf(task.status) + 1, order.length - 1)];
  task.status = next;
  if (next === "assigned" && !task.assignee) task.assignee = task.requester;
  task.updatedAt = new Date().toISOString();
  createNextRecurringTask(task, previousStatus);
  saveState();
  render();
}

function createNextRecurringTask(task, previousStatus) {
  if (previousStatus === "done" || task.status !== "done" || task.recurrence !== "monthly" || !task.dueDate) return null;

  const nextDueDate = addMonths(task.dueDate, 1);
  const alreadyCreated = state.tasks.some((item) => item.parentTaskId === task.id && item.dueDate === nextDueDate);
  if (alreadyCreated) return null;

  const now = new Date().toISOString();
  const nextTask = {
    ...task,
    id: crypto.randomUUID(),
    status: "todo",
    dueDate: nextDueDate,
    comments: [
      {
        id: crypto.randomUUID(),
        author: state.currentMemberId,
        createdAt: now,
        text: `Created from the monthly recurring task due ${formatLongDate(task.dueDate)}.`,
      },
    ],
    parentTaskId: task.id,
    createdAt: now,
    updatedAt: now,
  };

  state.tasks.unshift(nextTask);
  return nextTask;
}

function sendTaskEmail(task) {
  const recipient = memberEmail(task.assignee || task.requester);
  if (!recipient) {
    window.alert("Add an email address in that member's profile first.");
    return;
  }

  const subject = `Family Hub: ${task.title}`;
  openMail(recipient, subject, taskReminderBody(task));
}

function sendTaskSms(task) {
  const recipient = memberPhone(task.assignee || task.requester);
  if (!recipient) {
    window.alert("Add a phone number in that member's profile first.");
    return;
  }

  const body = [
    `Family Hub reminder: ${task.title}`,
    `Due: ${formatLongDate(task.dueDate)}`,
    `Status: ${statusLabel(task.status)}`,
    `Owner: ${task.assignee ? memberName(task.assignee) : memberName(task.requester)}`,
  ].join("\n");

  openSms(recipient, body);
}

function taskReminderBody(task) {
  return [
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
        expenses: normalizeExpenses(imported.expenses),
        creditCards: normalizeCreditCards(imported.creditCards),
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

function changeVacationMonth(delta) {
  visibleVacationMonth = new Date(visibleVacationMonth.getFullYear(), visibleVacationMonth.getMonth() + delta, 1);
  renderVacationCalendar();
}

function getSelectedTask() {
  return state.tasks.find((task) => task.id === selectedTaskId) ?? null;
}

function getSelectedTrip() {
  return state.trips.find((trip) => trip.id === selectedTripId) ?? null;
}

function findTripStop(trip, stopId, preferredDayId = "") {
  const days = preferredDayId
    ? [...trip.days.filter((day) => day.id === preferredDayId), ...trip.days.filter((day) => day.id !== preferredDayId)]
    : trip.days;
  for (const day of days) {
    const stop = day.stops.find((item) => item.id === stopId);
    if (stop) return { day, stop };
  }
  return null;
}

function ensureTripDayForDate(trip, date) {
  let day = trip.days.find((item) => item.date === date);
  if (day) return day;

  day = {
    id: crypto.randomUUID(),
    date,
    title: "",
    notes: "",
    stops: [],
  };
  trip.days.push(day);
  trip.days.sort((a, b) => a.date.localeCompare(b.date));
  return day;
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

function getVacationCalendarEventsForDate(trip, dateString) {
  const events = [];

  if (dateString === trip.startDate) {
    events.push({ kind: "trip", target: "trip", targetId: trip.id, title: `Start: ${trip.title}`, meta: trip.destination, draggable: false });
  }
  if (dateString === trip.endDate && trip.endDate !== trip.startDate) {
    events.push({ kind: "trip", target: "trip", targetId: trip.id, title: `End: ${trip.title}`, meta: trip.destination, draggable: false });
  }

  trip.hotels.forEach((hotel) => {
    if (dateString === hotel.checkIn) {
      events.push({ kind: "hotel", target: "hotel", targetId: hotel.id, title: `Check in: ${hotel.name}`, meta: calendarMeta(hotel.address, hotel.attachments), draggable: true });
    } else if (dateString === hotel.checkOut) {
      events.push({ kind: "hotel", target: "hotel", targetId: hotel.id, title: `Check out: ${hotel.name}`, meta: calendarMeta(hotel.address, hotel.attachments), draggable: true });
    } else if (hotel.checkIn && hotel.checkOut && dateString > hotel.checkIn && dateString < hotel.checkOut) {
      events.push({ kind: "hotel", target: "hotel", targetId: hotel.id, title: `Stay: ${hotel.name}`, meta: calendarMeta(hotel.address, hotel.attachments), draggable: true });
    }
  });

  trip.days
    .filter((day) => day.date === dateString)
    .forEach((day) => {
      day.stops
        .slice()
        .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")))
        .forEach((stop) => {
          events.push({
            kind: stop.type === "hotel" ? "hotel" : "stop",
            target: "stop",
            targetId: stop.id,
            sourceDayId: day.id,
            title: stop.time ? `${stop.time} ${stop.name}` : stop.name,
            meta: calendarMeta(tripStopTypeLabel(stop.type), stop.attachments),
            draggable: true,
          });
        });
    });

  return events;
}

function scrollToVacationTarget(target, targetId) {
  if (target === "trip") {
    elements.tripDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const selectors = {
    hotel: `[data-hotel-card="${CSS.escape(targetId)}"]`,
    day: `[data-trip-day-card="${CSS.escape(targetId)}"]`,
    stop: `[data-stop-drag="${CSS.escape(targetId)}"]`,
  };
  const row = elements.tripDetail.querySelector(selectors[target]);
  row?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getWishEventsForDate(dateString) {
  return state.wishes
    .filter((wish) => wish.targetDate === dateString && !isClosedWish(wish))
    .map((wish) => ({
      wishId: wish.id,
      title: `Dream: ${wish.title}`,
    }));
}

function getCreditCardEventsForDate(dateString) {
  if (!state.creditCards) return [];

  return state.creditCards.flatMap((card) => {
    const dueDate = creditCardDueDateForMonth(card, visibleFinanceMonth);
    if (!dueDate) return [];

    const events = [];
    const reminderDate = addDays(dueDate, -7);
    const amount = card.billAmount ? ` ${formatMoney(card.billAmount)}` : "";
    const status = isCreditCardPaidForFinanceMonth(card) ? "paid" : "due";
    if (dateString === reminderDate) {
      events.push({
        cardId: card.id,
        kind: "reminder",
        title: `Reminder: ${card.name}${amount}`,
      });
    }
    if (dateString === dueDate) {
      events.push({
        cardId: card.id,
        kind: "due",
        title: `Due: ${card.name} (${status})${amount}`,
      });
    }
    return events;
  });
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
    if (isClosedWish(a) && !isClosedWish(b)) return 1;
    if (!isClosedWish(a) && isClosedWish(b)) return -1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

function getExpensesForFinanceMonth() {
  const month = visibleFinanceMonth.getMonth();
  const year = visibleFinanceMonth.getFullYear();
  return [...state.expenses]
    .filter((expense) => {
      const date = parseLocalDate(expense.date);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.title.localeCompare(b.title);
    });
}

function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function creditCardDueDateForMonth(card, monthDate = visibleFinanceMonth) {
  if (!card.dueDay) return "";
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  return toISODate(new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min(card.dueDay, lastDay)));
}

function financeMonthKey(monthDate = visibleFinanceMonth) {
  const month = String(monthDate.getMonth() + 1).padStart(2, "0");
  return `${monthDate.getFullYear()}-${month}`;
}

function isCreditCardPaidForFinanceMonth(card) {
  return card.paidMonth === financeMonthKey(visibleFinanceMonth);
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

function monthForDate(dateString) {
  if (!dateString) return null;
  const date = parseLocalDate(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

function addMonths(dateString, amount) {
  const date = parseLocalDate(dateString);
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toISODate(target);
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

function financeMonthName() {
  return visibleFinanceMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatMoney(amount) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount || 0);
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

function memberPhone(id) {
  return getMember(id)?.phone ?? "";
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
  return wishCategories.find((item) => item.id === category)?.label ?? "Dream";
}

function wishStatusLabel(status) {
  return wishStatuses.find((item) => item.id === status)?.label ?? "Idea";
}

function wishTimeframeLabel(wish) {
  if (wish.timeframe === "custom" && wish.customTimeframe) return wish.customTimeframe;
  return wishTimeframes.find((item) => item.id === wish.timeframe)?.label ?? "Someday";
}

function wishPriorityLabel(priority) {
  return wishPriorities.find((item) => item.id === priority)?.label ?? "Medium";
}

function wishLinkTypeLabel(type) {
  return wishLinkTypes.find((item) => item.id === type)?.label ?? "Other";
}

function wishLinkIcon(type) {
  const icons = {
    product: "shopping-bag",
    hotel: "bed",
    restaurant: "utensils",
    video: "play-circle",
    travel: "map",
    article: "newspaper",
    map: "map-pin",
    other: "link",
  };
  return icons[type] || "link";
}

function isClosedWish(wish) {
  return wish.status === "done" || wish.status === "archived";
}

function getFilteredWishes() {
  const wishes = getSortedWishes();
  return activeWishMemberId === "all" ? wishes : wishes.filter((wish) => wish.owner === activeWishMemberId);
}

function titleFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "Research link";
  }
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
  return `${wishCategoryLabel(category)} dream`;
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

function renderTripMapLinks(trip) {
  const points = getTripMapPoints(trip);
  if (!points.length) return "";
  if (points.length === 1) return renderMapLinks(points[0], "Trip map");

  return `
    <a class="secondary-button" href="${escapeAttribute(googleMapsRouteUrl(points))}" target="_blank" rel="noreferrer"><i data-lucide="route"></i>Google trip</a>
    <a class="secondary-button" href="${escapeAttribute(appleMapsUrl(points[0]))}" target="_blank" rel="noreferrer"><i data-lucide="map"></i>Apple start</a>
  `;
}

function getTripMapPoints(trip) {
  const points = [
    state.family?.homeAddress,
    trip.destination,
    ...trip.hotels.map((hotel) => hotel.address || hotel.name),
    ...trip.days.flatMap((day) =>
      day.stops
        .filter((stop) => stop.type !== "drive")
        .map((stop) => stop.address || stop.name),
    ),
  ];
  return dedupeMapPoints(points);
}

function dedupeMapPoints(points) {
  const seen = new Set();
  return points
    .map((point) => String(point || "").trim())
    .filter((point) => {
      if (!point) return false;
      const key = point.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function parseImportedMapPlaces(value) {
  const text = String(value || "").trim();
  if (!text) return [];

  const delimitedPlaces = parseDelimitedMapPlaces(text);
  if (delimitedPlaces.length) return dedupeImportedPlaces(delimitedPlaces);

  const lines = text
    .split(/\n+/)
    .map((line) => cleanImportedPlaceLine(line))
    .filter(Boolean);

  const copiedGooglePlaces = parseCopiedGoogleMapsList(lines);
  if (copiedGooglePlaces.length) return dedupeImportedPlaces(copiedGooglePlaces);

  const places = lines
    .filter((line) => !isImportedPlaceNoise(line))
    .map((line) => parseImportedPlaceLine(line))
    .filter((place) => place.name);

  return dedupeImportedPlaces(places);
}

function parseCopiedGoogleMapsList(lines) {
  const places = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextLine = lines[index + 1] || "";
    if (isImportedPlaceNoise(line)) continue;

    if (isGoogleMapsRatingLine(nextLine)) {
      places.push({ name: line, address: "", url: "" });
      index += 1;
      if (lines[index + 1] && !isImportedPlaceNoise(lines[index + 1])) index += 1;
      if (lines[index + 1] && isImportedPlaceNoise(lines[index + 1])) index += 1;
    }
  }
  return places;
}

function parseDelimitedMapPlaces(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  if (!lines[0].includes(delimiter)) return [];

  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => header.trim().toLowerCase());
  const nameIndex = findHeaderIndex(headers, ["name", "title", "place", "place name", "saved place"]);
  const addressIndex = findHeaderIndex(headers, ["address", "location", "full address", "formatted address"]);
  const urlIndex = headers.findIndex((header) => header.includes("url") || header.includes("link") || header.includes("maps"));
  if (nameIndex < 0 && addressIndex < 0) return [];

  return lines.slice(1).map((line) => {
    const row = splitDelimitedLine(line, delimiter);
    const name = cleanImportedPlaceLine(row[nameIndex] || row[addressIndex] || row[0] || "");
    const address = cleanImportedPlaceLine(addressIndex >= 0 && addressIndex !== nameIndex ? row[addressIndex] : "");
    const url = normalizeImportedUrl(urlIndex >= 0 ? row[urlIndex] : "");
    return { name, address, url };
  });
}

function splitDelimitedLine(line, delimiter) {
  if (delimiter === "\t") return line.split("\t");

  const cells = [];
  let cell = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells.map((item) => item.replace(/^"|"$/g, "").replaceAll('""', '"'));
}

function findHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => candidates.some((candidate) => header === candidate || header.includes(candidate)));
}

function parseImportedPlaceLine(line) {
  const url = normalizeImportedUrl(line.match(/https?:\/\/\S+/)?.[0] || "");
  const withoutUrl = cleanImportedPlaceLine(line.replace(/https?:\/\/\S+/g, ""));
  const separator = [" - ", " — ", " – ", " | ", "\t"].find((item) => withoutUrl.includes(item));
  if (!separator) return { name: withoutUrl, address: "", url };

  const parts = withoutUrl
    .split(separator)
    .map((part) => cleanImportedPlaceLine(part))
    .filter(Boolean);
  return {
    name: parts[0] || withoutUrl,
    address: parts.slice(1).join(", "),
    url,
  };
}

function cleanImportedPlaceLine(line) {
  return String(line || "")
    .replace(/^\s*(?:[-*•]\s*|\d+[.)]\s+)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isImportedPlaceNoise(line) {
  return /^(\+\s*)?(google maps|saved places|directions|share|save|nearby|send to phone|copy link|add note|note|website|call|closed|open now)$/i.test(line);
}

function isGoogleMapsRatingLine(line) {
  return /^\d(?:\.\d)?\s*★?\s*\([0-9,]+\)/.test(String(line || "").trim());
}

function dedupeImportedPlaces(places) {
  const seen = new Set();
  return places
    .map((place) => ({
      name: cleanImportedPlaceLine(place.name),
      address: cleanImportedPlaceLine(place.address),
      url: normalizeImportedUrl(place.url),
    }))
    .filter((place) => place.name && !isImportedPlaceNoise(place.name))
    .filter((place) => {
      const key = normalizeMapPlaceKey(place.name, place.address);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeMapPlaceKey(name, address) {
  return `${String(name || "").trim()}|${String(address || "").trim()}`.toLowerCase();
}

function normalizeImportedUrl(url) {
  const cleaned = String(url || "").trim();
  return /^https?:\/\//i.test(cleaned) ? cleaned : "";
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

function openSms(to, body) {
  const recipient = to.replace(/[^\d+]/g, "");
  if (!recipient) return;
  const separator = /iPad|iPhone|iPod|Macintosh/i.test(navigator.userAgent) ? "&" : "?";
  window.location.href = `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
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
