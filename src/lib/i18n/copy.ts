import type { Locale } from "./locale";

type CopyMap<T> = Record<Locale, T>;

export const navCopy: CopyMap<{
  about: string;
  disclosure: string;
  contact: string;
  langSwitchLabel: string;
  navAriaLabel: string;
}> = {
  en: {
    about: "About Us",
    disclosure: "Disclosure",
    contact: "Contact",
    langSwitchLabel: "Language selector",
    navAriaLabel: "Stemly sections",
  },
  ko: {
    about: "회사 소개",
    disclosure: "공시",
    contact: "문의",
    langSwitchLabel: "언어 선택",
    navAriaLabel: "Stemly 섹션",
  },
};

export const aboutCopy: CopyMap<{
  pageTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  companyInfoTitle: string;
  companyName: string;
  addressLabel: string;
  addressValue: string;
  representativeLabel: string;
  representativeValue: string;
  emailLabel: string;
}> = {
  en: {
    pageTitle: "Stemly — About Us",
    heroTitle: "Ideas, engineered.",
    heroSubtitle:
      "We are a discreet lab working at the intersection of research, engineering, and ideas. Our work is shaped by curiosity, rigor, and a desire to build what truly matters.",
    companyInfoTitle: "Company Information",
    companyName: "Stemly Corp.",
    addressLabel: "Address",
    addressValue: "Unit 7421, 9-1, Gugal-ro 60beon-gil, Giheung-gu, Yongin-si, Gyeonggi-do, Republic of Korea",
    representativeLabel: "Representative",
    representativeValue: "Wook Song",
    emailLabel: "Email",
  },
  ko: {
    pageTitle: "Stemly — 회사 소개",
    heroTitle: "아이디어를, 기술로.",
    heroSubtitle:
      "우리는 연구와 엔지니어링, 그리고 다양한 아이디어의 교차점에서 아이디어를 기술로 연결하는 연구랩입니다. 우리의 방향은 호기심과 엄밀함, 그리고 의미 있는 것을 만들고자 하는 의지에서 출발합니다.",
    companyInfoTitle: "회사 정보",
    companyName: "스템리 주식회사 (Stemly Corp.)",
    addressLabel: "주소",
    addressValue: "경기도 용인시 기흥구 구갈로 60번길 9-1, 7층 7421호 (구갈동, 라파빌딩)",
    representativeLabel: "대표자",
    representativeValue: "송욱",
    emailLabel: "이메일",
  },
};

export const disclosureCopy: CopyMap<{
  pageTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  loading: string;
  loadError: string;
  empty: string;
  detailEmpty: string;
  pinnedLabel: string;
  untitled: string;
  loadErrorInline: string;
}> = {
  en: {
    pageTitle: "Stemly — Disclosures",
    heroTitle: "Company Disclosures",
    heroSubtitle: "Real-time electronic disclosures published directly by Stemly.",
    loading: "Loading disclosures…",
    loadError: "Failed to load disclosures. Refresh the page.",
    empty: "No disclosures yet.",
    detailEmpty: "Pick a disclosure to see the details.",
    pinnedLabel: "Pinned",
    untitled: "Untitled disclosure",
    loadErrorInline: "Failed to load disclosures. Please try again.",
  },
  ko: {
    pageTitle: "Stemly — 공시 게시판",
    heroTitle: "공시 게시판",
    heroSubtitle: "실시간으로 제공되는 Stemly 전자공시입니다.",
    loading: "공시를 불러오는 중…",
    loadError: "공시를 불러오지 못했습니다. 새로고침해 주세요.",
    empty: "등록된 공시가 없습니다.",
    detailEmpty: "공시를 선택하면 내용을 확인할 수 있습니다.",
    pinnedLabel: "상단 고정",
    untitled: "제목 없는 공시",
    loadErrorInline: "공시를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
  },
};
