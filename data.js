/* ==========================================================================
   data.js  |  GDG Fest demo website
   --------------------------------------------------------------------------
   ALL content lives here. script.js only reads it and builds the page.
   Everything marked `sample: true` is placeholder content, not official
   event information. Replace it when the organizers confirm real details.
   ========================================================================== */

/* The one place to set the real event date later.
   Leave it as null until the date is confirmed. Example when known:
   const EVENT_DATE = "2026-12-05T09:00:00";  (local time, ISO format) */
const EVENT_DATE = null;

const GDG_DATA = {
  /* ---------- Site info ---------- */
  site: {
    name: "GDG Fest",
    chapter: "[Chapter name to be added]"
  },

  /* ---------- Track names (used for tags and colors) ---------- */
  tracks: {
    talks: "Talks",
    workshops: "Workshops",
    hackathon: "Hackathon",
    networking: "Networking"
  },

  /* ---------- About: stat tiles (sample values) ---------- */
  stats: [
    { label: "Sessions", value: "12", sample: true },
    { label: "Speakers", value: "8", sample: true },
    { label: "Workshops", value: "3", sample: true },
    { label: "Hackathon teams", value: "20", sample: true }
  ],

  /* ---------- Highlights (bento grid) ---------- */
  highlights: [
    {
      track: "hackathon", icon: "trophy", size: "large", title: "Hackathon",
      text: "Form a team, build a project and demo it. Format, rules and prizes: to be announced."
    },
    {
      track: "workshops", icon: "wrench", size: "medium", title: "Workshops",
      text: "Hands-on sessions where you build while you learn. Sample topics are shown in the schedule."
    },
    {
      track: "talks", icon: "mic", size: "medium", title: "Talks",
      text: "Short sessions on web, cloud, AI and design. The real lineup is to be announced."
    },
    {
      track: "networking", icon: "lifebuoy", size: "small", title: "Mentor corner",
      text: "Get unstuck with friendly guidance from community mentors."
    },
    {
      track: "networking", icon: "users", size: "small", title: "Networking",
      text: "Meet developers, students and community organizers."
    }
  ],

  /* ---------- Schedule ---------- */
  days: [
    { id: "day1", label: "Day 1" },
    { id: "day2", label: "Day 2" }
  ],

  levels: ["Beginner", "Intermediate", "Advanced"],

  /* Times are sample times used to demo the planner and clash detection. */
  sessions: [
    { id: "s1", day: "day1", start: "09:30", end: "10:15", track: "talks", level: "Beginner",
      title: "Sample session: Welcome and community kickoff", duration: "45 min", sample: true },
    { id: "s2", day: "day1", start: "10:30", end: "11:15", track: "talks", level: "Beginner",
      title: "Sample session: Getting started with web apps", duration: "45 min", sample: true },
    { id: "s3", day: "day1", start: "10:45", end: "12:15", track: "workshops", level: "Beginner",
      title: "Sample workshop: Build your first responsive page", duration: "90 min", sample: true },
    { id: "s4", day: "day1", start: "13:30", end: "14:15", track: "talks", level: "Intermediate",
      title: "Sample session: Designing for accessibility", duration: "45 min", sample: true },
    { id: "s5", day: "day1", start: "14:30", end: "16:00", track: "workshops", level: "Intermediate",
      title: "Sample workshop: Debugging with browser tools", duration: "90 min", sample: true },
    { id: "s6", day: "day1", start: "16:15", end: "17:00", track: "hackathon", level: "Beginner",
      title: "Sample session: Hackathon briefing and team forming", duration: "45 min", sample: true },

    { id: "s7", day: "day2", start: "09:30", end: "10:15", track: "talks", level: "Intermediate",
      title: "Sample session: Building with AI tools responsibly", duration: "45 min", sample: true },
    { id: "s8", day: "day2", start: "10:30", end: "12:00", track: "workshops", level: "Advanced",
      title: "Sample workshop: Performance tuning for fast pages", duration: "90 min", sample: true },
    { id: "s9", day: "day2", start: "10:45", end: "11:30", track: "talks", level: "Beginner",
      title: "Sample session: Open source for first-time contributors", duration: "45 min", sample: true },
    { id: "s10", day: "day2", start: "13:00", end: "17:00", track: "hackathon", level: "Beginner",
      title: "Sample session: Hackathon build time", duration: "4 hours", sample: true },
    { id: "s11", day: "day2", start: "14:00", end: "14:45", track: "talks", level: "Advanced",
      title: "Sample session: Scaling a side project", duration: "45 min", sample: true },
    { id: "s12", day: "day2", start: "17:15", end: "18:00", track: "networking", level: "Beginner",
      title: "Sample session: Demos and closing", duration: "45 min", sample: true }
  ],

  /* ---------- Speakers and mentors (generic placeholders) ---------- */
  speakers: [
    { topic: "Web", track: "talks" },
    { topic: "Cloud", track: "talks" },
    { topic: "AI", track: "talks" },
    { topic: "Design", track: "workshops" },
    { topic: "Mobile", track: "workshops" },
    { topic: "Open source", track: "talks" },
    { topic: "Careers", track: "networking" },
    { topic: "Accessibility", track: "workshops" }
  ].map(function (s, i) {
    return {
      id: "sp" + (i + 1),
      name: "Speaker Name",
      role: "Role, Organization",
      initials: "S" + (i + 1),
      topic: s.topic,
      track: s.track,
      bio: "Sample bio. A short introduction to the speaker and their session topic will appear here once confirmed.",
      sample: true
    };
  }),

  /* ---------- Workshops tab ---------- */
  workshops: [
    {
      title: "Sample workshop: Build your first responsive page",
      level: "Beginner",
      prerequisites: "A laptop and a code editor (sample)",
      duration: "90 minutes",
      seats: "To be announced"
    },
    {
      title: "Sample workshop: Debugging with browser tools",
      level: "Intermediate",
      prerequisites: "Basic HTML and JavaScript (sample)",
      duration: "90 minutes",
      seats: "To be announced"
    },
    {
      title: "Sample workshop: Performance tuning for fast pages",
      level: "Advanced",
      prerequisites: "Comfort with CSS and JavaScript (sample)",
      duration: "90 minutes",
      seats: "To be announced"
    }
  ],

  /* ---------- Hackathon tab ---------- */
  hackathon: {
    tracks: [
      "Sample track: Community impact",
      "Sample track: Developer tools",
      "Sample track: Learning and education"
    ],
    rules: "Sample rules summary: original work built during the event, respectful conduct and a short demo. Final rules: to be announced.",
    team: "Team size: To be announced",
    judging: "Judging criteria and prizes: To be announced",
    phases: [
      { title: "Register", text: "Sign up solo or with a team." },
      { title: "Build", text: "Turn an idea into a working project." },
      { title: "Submit", text: "Share your project before the deadline." },
      { title: "Demo", text: "Show your work to the community." }
    ]
  },

  /* ---------- Sponsors and partners (placeholders only) ---------- */
  sponsors: [
    { tier: "Lead", count: 2 },
    { tier: "Supporting", count: 3 },
    { tier: "Community", count: 4 }
  ],

  /* ---------- FAQ ---------- */
  faq: [
    {
      q: "Who can attend?",
      a: "Students, developers and tech enthusiasts are the intended audience. Eligibility details: to be announced."
    },
    {
      q: "Is it free?",
      a: "Ticketing and cost: to be announced."
    },
    {
      q: "What should I bring?",
      a: "A laptop and charger are a good idea for workshops and the hackathon. Official guidance: to be announced."
    },
    {
      q: "Do I need a team for the hackathon?",
      a: "Team rules: to be announced. The sample schedule includes a team-forming session."
    },
    {
      q: "Will there be certificates?",
      a: "To be announced."
    },
    {
      q: "How do I contact the organizers?",
      a: "Contact details: to be announced. See the Venue and contact section for placeholders."
    }
  ]
};