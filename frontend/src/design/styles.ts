export const appStyles = {
  page: {
    base: 'min-h-screen pt-20 pb-[18px] px-[18px] md:pt-24 text-[#2f3328]',
    panel:
      'min-h-[calc(100vh-36px)] overflow-hidden rounded-[18px] border border-[#ded5c6] bg-[#fffdf8] shadow-[0_14px_40px_rgba(57,47,35,0.12)]',
    content: 'p-8 md:p-12 lg:p-[58px_72px_38px]',
  },

  layout: {
    twoColumnPanel:
      'grid min-h-[calc(100vh-36px)] overflow-hidden rounded-[18px] border border-[#ded5c6] bg-[#fffdf8] shadow-[0_14px_40px_rgba(57,47,35,0.12)] lg:grid-cols-[34%_66%]',
    visualPanel:
      'relative flex items-stretch justify-center overflow-hidden border-r border-[#ded5c6] bg-[#f2e8da]',
    fullWidthPanel:
	'min-h-[calc(100vh-36px)] overflow-hidden rounded-[18px] border border-[#ded5c6] bg-[linear-gradient(135deg,_#fffdf8_0%,_#fffaf2_55%,_#fff6eb_100%)] shadow-[0_14px_40px_rgba(57,47,35,0.12)]',
  },

  text: {
    eyebrow:
      'text-sm font-semibold uppercase tracking-wide text-[#706b60]',
    pageTitle:
      'font-serif text-[44px] leading-[1.16] text-[#33442f]',
    largeTitle:
      'font-serif text-[clamp(36px,5vw,64px)] leading-[1.05] text-[#2f4a31]',
    sectionTitle:
      'font-serif text-2xl text-[#33442f]',
    bodyLarge:
      'text-[22px] leading-relaxed text-[#6f6a60]',
    body:
      'text-[#6f6a60]',
    muted:
      'text-[#706b60]',
    soft:
      'text-[#5d5a55]',
    green:
      'text-[#2f4a31]',
  },

  header: {
    row: 'mb-12 flex items-center justify-between gap-4',
    step: 'flex items-center gap-3 text-[18px] font-semibold text-[#706b60]',
    stepIcon:
      'grid h-12 w-12 place-items-center rounded-full bg-[#f4eee4] text-[#344b35]',
  },

  card: {
    base:
      'rounded-[16px] border border-[#ded5c6] bg-[#fffdf8] p-6',
    soft:
      'rounded-[12px] bg-[#f8f2e8] p-4',
    note:
      'rounded-[24px] border border-[#ded5c6] bg-[rgba(255,253,248,0.92)] p-6 shadow-[0_14px_32px_rgba(57,47,35,0.14)]',
    journey:
      'rounded-[28px] border border-[rgba(47,74,49,0.16)] bg-[#fffaf2] p-8',
    journeyDetail:
      'flex gap-4 rounded-[18px] border border-[rgba(47,74,49,0.16)] bg-[rgba(255,250,242,0.78)] p-[18px]',
  },

  button: {
    primary:
      'inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#31583b] bg-[#31583b] px-6 py-4 text-[18px] font-bold text-white transition hover:bg-[#2a4d33] disabled:cursor-not-allowed disabled:opacity-45',
    secondary:
      'inline-flex items-center justify-center gap-3 rounded-[10px] border border-[#ded5c6] bg-[#fffdf8] px-6 py-4 text-[18px] font-bold text-[#756f62] transition hover:bg-[#f4eee4] disabled:cursor-not-allowed disabled:opacity-45',
    smallSecondary:
      'rounded-[10px] border border-[#ded5c6] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-[#706b60] transition hover:bg-[#f4eee4]',
    chatToggle:
      'rounded-[12px] border border-[rgba(47,74,49,0.2)] bg-[#f7f2ea] px-[18px] py-3 font-semibold text-[#2f4a31] transition hover:bg-[#efe7db]',
  },

  form: {
    input:
      'w-full rounded-[10px] border border-[#ded5c6] bg-[#fffdf8] px-[18px] py-4 text-base text-[#2f3328] outline-none focus:border-[#31583b] focus:ring-2 focus:ring-[rgba(49,88,59,0.14)]',
    inputRow: 'flex gap-[14px]',
    iconButton:
      'grid w-[58px] place-items-center rounded-[10px] bg-[#31583b] text-[22px] text-white transition hover:bg-[#2a4d33]',
  },

  answerCard: {
    base:
      'relative min-h-[118px] cursor-pointer rounded-[16px] border-[1.5px] border-[#ded5c6] bg-[#fffdf8] p-6 text-center text-[22px] font-bold text-[#33442f] transition hover:-translate-y-px hover:border-[#b8aa94] hover:shadow-[0_10px_28px_rgba(63,56,45,0.08)]',
    selected:
      'border-[#31583b] bg-[#f4eee4] shadow-[0_0_0_3px_rgba(49,88,59,0.14)]',
    check:
      'absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-[#31583b] text-base font-extrabold text-[#fffdf8]',
  },

  tag: {
    base:
      'inline-flex rounded-full bg-[#f4eee4] px-4 py-2 text-sm font-semibold text-[#2f4a31]',
    muted:
      'inline-flex rounded-full bg-[rgba(123,118,108,0.12)] px-3 py-1 text-xs font-bold text-[#6d6a61]',
    current:
      'inline-flex rounded-full bg-[rgba(47,74,49,0.12)] px-3 py-1 text-xs font-bold text-[#2f4a31]',
    recommended:
      'inline-flex rounded-full bg-[rgba(143,163,143,0.18)] px-3 py-1 text-xs font-bold text-[#2f4a31]',
    upcoming:
      'inline-flex rounded-full bg-[rgba(219,210,195,0.5)] px-3 py-1 text-xs font-bold text-[#5f665d]',
  },

  journey: {
    mountain:
      'relative min-h-[560px] overflow-hidden rounded-[24px] border border-[rgba(47,74,49,0.12)] bg-[#f7f1e6] md:min-h-[620px] lg:min-h-[680px]',
    step:
      'absolute z-10 max-w-[220px] translate-x-[-23px] translate-y-[-23px] text-left text-[#2f4a31] transition hover:translate-y-[-27px]',
    stepMarker:
      'mb-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[rgba(47,74,49,0.18)] bg-[#fffaf2] text-[22px] font-bold text-[#2f4a31] shadow-[0_6px_18px_rgba(47,74,49,0.18)]',
    stepMarkerCurrent:
      'mb-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[#fffaf2] bg-[#2f4a31] text-[22px] font-bold text-[#fffaf2] shadow-[0_6px_18px_rgba(47,74,49,0.18)]',
    stepMarkerRecommended:
      'mb-2 inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[#fffaf2] bg-[#8fa38f] text-[22px] font-bold text-[#fffaf2] shadow-[0_6px_18px_rgba(47,74,49,0.18)]',
    stepTitle:
      'block text-[20px] leading-[1.15] text-[#2f4a31]',
    stepDescription:
      'mt-1 text-sm leading-[1.35] text-[#4f594d]',
    detailNumber:
      'flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#2f4a31] font-bold text-[#fffaf2]',
  },

  assistant: {
    note:
      'rounded-[24px] border border-[#ded5c6] bg-[rgba(255,253,248,0.92)] p-6 shadow-[0_14px_32px_rgba(57,47,35,0.14)]',
    icon:
      'grid h-[42px] w-[42px] place-items-center rounded-full bg-[#31583b] text-white',
    title:
      'mb-3 font-serif text-2xl text-[#33442f]',
    text:
      'text-[18px] leading-[1.5] text-[#5d5a55]',
  },

  divider: {
    top:
      'border-t border-[#ded5c6] pt-[22px]',
    section:
      'border-t border-[rgba(47,74,49,0.16)] pt-6',
  },
} as const