import type { Locale } from '../i18n/locale';

export type AppId = 'yag-channel-tools' | 'piston-atlas-publishing';
export type DocumentKind = 'overview' | 'privacy' | 'terms';
export type Link = { label: string; href: string };
export type Section = { title: string; paragraphs: string[]; links?: Link[] };
export type Document = { title: string; summary: string; sections: Section[] };

export const updated = '2026-11-07';
export const contact = 'stemly.corp@gmail.com';
export const appIds: AppId[] = ['yag-channel-tools', 'piston-atlas-publishing'];
export const kinds: DocumentKind[] = ['overview', 'privacy', 'terms'];
export const apps = {
  'yag-channel-tools': {
    name: 'YAG Channel Tools', channel: 'Yet Another Graphs', analytics: true,
    channelUrl: 'https://www.youtube.com/channel/UCGyqD7u8bHpSmrpzPlLBE7A',
    description: {
      ko: 'Yet Another Graphs 채널의 영상 게시 준비, 메타데이터 관리와 성과 확인을 위한 운영자용 로컬 도구 모음입니다.',
      en: 'A collection of local operator tools for preparing publications, managing metadata and reviewing performance for the Yet Another Graphs channel.'
    },
    features: {
      ko: '영상과 썸네일 업로드, 제목·설명·예약 정보 관리, 채널 확인을 지원합니다. 별도로 승인된 읽기 전용 연동에서는 누적 통계와 일별 YouTube Analytics 보고서를 조회해 비공개 로컬 검수 화면으로 확인합니다.',
      en: 'The tools support video and thumbnail uploads, title, description and schedule management, and channel verification. A separately authorized read-only integration retrieves cumulative statistics and daily YouTube Analytics reports for private local review.'
    },
    permissions: {
      ko: 'youtube 또는 youtube.upload는 설치된 게시 모듈에 맞춰 관리·업로드에 사용합니다. 분석 연동은 youtube.readonly와 yt-analytics.readonly를 사용합니다. 권한들은 현재 목적별로 나뉘어 있으며 통합 인증은 준비 단계입니다. 각 인증에서 실제 요청하는 범위는 Google 동의 화면에서 확인할 수 있습니다.',
      en: 'youtube or youtube.upload is used for management or uploading according to the installed publishing module. Analytics uses youtube.readonly and yt-analytics.readonly. Grants are currently separated by purpose; consolidated authentication is in preparation. The Google consent screen identifies the scopes actually requested for each grant.'
    }
  },
  'piston-atlas-publishing': {
    name: 'Piston Atlas Publishing', channel: 'Piston Atlas', analytics: false,
    channelUrl: 'https://www.youtube.com/channel/UCeUUQEVNsjymvuKF5CbJicQ',
    description: {
      ko: '기계의 작동 원리를 설명하는 Piston Atlas 채널의 영상 업로드와 예약 게시를 준비하는 운영자용 로컬 도구입니다.',
      en: 'A local operator tool for preparing uploads and scheduled publications for Piston Atlas, a channel explaining how machines work.'
    },
    features: {
      ko: '영상·썸네일·제목·설명·재생목록·예약 시각을 검토할 수 있는 계획으로 묶습니다. 운영자의 별도 일회성 승인이 있을 때만 영상을 비공개로 업로드하고, 승인된 예약 시각에 YouTube가 공개하도록 설정합니다. 즉시 공개나 고정 댓글 자동 게시 기능은 제공하지 않습니다.',
      en: 'The tool creates a reviewable plan containing the video, thumbnail, title, description, playlists and scheduled time. Only with separate one-time operator approval does it upload privately and set YouTube to publish at the approved time. It does not offer immediate public publishing or automatic pinned comments.'
    },
    permissions: {
      ko: '현재 youtube 관리 범위 하나를 사용합니다. 대상 채널 확인, 비공개 영상·썸네일 업로드, 예약 설정과 승인된 재생목록 추가에 필요합니다. youtube.upload 전용 토큰이나 다른 범위를 섞은 토큰은 현재 도구에서 허용하지 않습니다. YouTube Analytics 수집 기능은 현재 포함하지 않습니다.',
      en: 'The current tool uses only the youtube management scope for channel verification, private video and thumbnail uploads, scheduling and approved playlist additions. The current implementation rejects upload-only tokens and tokens mixed with other scopes. It does not currently collect YouTube Analytics reports.'
    }
  }
} as const;

export const labels = {
  ko: { overview: '도구 소개', privacy: '개인정보처리방침', terms: '서비스약관', updated: '최종 수정', contact: '문의 및 삭제 요청', operator: '운영: 스템리 주식회사 (Stemly Corp.)', channel: 'YouTube 채널 보기', language: '언어', other: '다른 채널 도구', skip: '본문으로 이동' },
  en: { overview: 'Overview', privacy: 'Privacy Policy', terms: 'Terms of Service', updated: 'Last updated', contact: 'Support and deletion requests', operator: 'Operated by Stemly Corp.', channel: 'View YouTube channel', language: 'Language', other: 'Other channel tools', skip: 'Skip to content' }
} as const;

export function pathFor(lang: Locale, app: AppId, kind: DocumentKind = 'overview'): string {
  return `/${lang}/${app}${kind === 'overview' ? '' : `/${kind}`}/`;
}

export const external = {
  youtube: { label: 'YouTube Terms of Service', href: 'https://www.youtube.com/t/terms' },
  googlePrivacy: { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' },
  apiPolicy: { label: 'Google API Services User Data Policy', href: 'https://developers.google.com/terms/api-services-user-data-policy' },
  revoke: { label: 'Google Account connections', href: 'https://myaccount.google.com/connections' },
  fonts: { label: 'Google Fonts privacy', href: 'https://developers.google.com/fonts/faq/privacy' },
  hosting: { label: 'GitHub Privacy Statement', href: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement' }
} satisfies Record<string, Link>;

export function documentFor(appId: AppId, lang: Locale, kind: DocumentKind): Document {
  const app = apps[appId];
  const ko = lang === 'ko';
  if (kind === 'overview') return {
    title: app.name,
    summary: app.description[lang],
    sections: [
      { title: ko ? '누가 사용하는 도구인가요?' : 'Who uses this tool?', paragraphs: [ko ? 'Stemly의 채널 소유자와 승인된 운영자를 위한 도구입니다. 일반 사용자 회원가입이나 공개 분석 대시보드는 제공하지 않으며, 이 페이지는 앱의 목적과 데이터 처리 방식을 설명하는 정적 안내 페이지입니다.' : 'This tool is for the channel owner and approved Stemly operators. It does not offer public registration or a public analytics dashboard. This static page explains the application and its data practices.'] },
      { title: ko ? '지원하는 작업' : 'Supported operations', paragraphs: [app.features[lang]] },
      { title: ko ? 'Google 권한을 요청하는 이유' : 'Why Google authorization is requested', paragraphs: [app.permissions[lang], ko ? '공식 Google OAuth로 동의받습니다. 채널 비밀번호를 요청하거나 수집하지 않으며, 채널을 확인한 뒤 허용된 작업만 수행합니다. 다른 채널에 대한 토큰이나 권한을 자동으로 공유하지 않습니다.' : 'Authorization uses official Google OAuth. The tool does not request or collect channel passwords. It verifies the channel before permitted operations and does not automatically share tokens or permissions with another channel.'] },
      { title: ko ? '승인과 데이터 보호' : 'Approval and data protection', paragraphs: [ko ? 'OAuth 동의는 실제 게시 승인과 다릅니다. 업로드·수정 등 외부 계정에 영향을 주는 작업은 별도 운영자 승인이 필요합니다. 비공개 데이터·인증 정보는 이 웹사이트에 게시하지 않습니다. 자세한 처리 내용과 이용 조건은 아래 정책에서 확인할 수 있습니다.' : 'OAuth consent is not publication approval. Uploads, edits and other changes to external accounts require separate operator approval. Private data and credentials are not published on this website. The policies below explain processing and use.'], links: [ {label: labels[lang].privacy, href: pathFor(lang, appId, 'privacy')}, {label: labels[lang].terms, href: pathFor(lang, appId, 'terms')} ] }
    ]
  };
  if (kind === 'privacy') return {
    title: `${app.name}: ${labels[lang].privacy}`,
    summary: ko ? '이 방침은 Stemly가 운영하는 이 채널 도구와 해당 소개·정책 페이지에 적용됩니다. 다른 Stemly 서비스 전체의 방침을 대체하지 않습니다.' : 'This policy covers this channel tool and its product and policy pages operated by Stemly. It does not replace the policies of other Stemly services.',
    sections: [
      { title: ko ? '1. 운영자와 문의' : '1. Operator and contact', paragraphs: [ko ? `운영자는 스템리 주식회사(Stemly Corp.)입니다. 데이터 처리·접근 해제·삭제 요청은 ${contact}로 보내주세요. 본인과 대상 채널을 확인하는 데 필요한 최소한의 정보만 요청합니다. 비밀번호나 OAuth 토큰을 이메일로 보내지 마세요.` : `The operator is Stemly Corp. Send privacy, access and deletion requests to ${contact}. We request only information needed to verify the requester and affected channel. Do not send passwords or OAuth tokens by email.`] },
      { title: ko ? '2. 접근하거나 처리하는 정보' : '2. Information accessed or processed', paragraphs: [ko ? 'Google OAuth의 접근·갱신 토큰, 승인된 범위와 만료 정보, 대상 채널 식별자, 영상 식별자·제목·설명·공개/예약 상태·재생목록 정보, 운영자가 제공한 영상·썸네일, 승인·작업 결과 기록을 필요한 작업 범위에서 처리합니다.' : 'Within the operations needed, the tool processes OAuth access and refresh tokens, granted scopes and expiry, channel identifiers, video identifiers, titles, descriptions, privacy and schedule states, playlist information, operator-provided videos and thumbnails, and approval and operation records.', app.analytics ? (ko ? '별도로 승인된 분석 연동은 조회수·참여 조회수·시청 시간·평균 시청 지속 시간과 조회율·좋아요·댓글 수·공유 수·획득 구독자 등 보고서 수치를 처리합니다. 집계 수치이며 개별 시청자의 신원이나 Google 계정 이메일 목록을 수집하지 않습니다.' : 'A separately approved analytics integration processes report metrics such as views, engaged views, watch time, average view duration and percentage, likes, comment counts, shares and subscribers gained. These are report metrics, not a collection of individual viewers’ identities or Google account email lists.') : (ko ? '현재 Piston Atlas 도구는 업로드·예약 관리와 그에 필요한 채널·영상 확인을 수행합니다. 별도의 YouTube Analytics 보고서를 수집하는 기능은 포함하지 않습니다.' : 'The current Piston Atlas tool performs upload and schedule operations and the channel and video checks they need. It does not include collection of YouTube Analytics reports.')] },
      { title: ko ? '3. 사용 목적과 제한' : '3. Purposes and limitations', paragraphs: [ko ? '정보는 승인된 채널 운영, 게시 준비·검증, 오류 확인과 승인된 성과 검토에만 사용합니다. Google 사용자 데이터를 판매하거나 광고 타겟팅에 사용하지 않으며, 일반화된 AI 또는 머신러닝 모델의 개발·학습·개선에 사용하지 않습니다.' : 'Information is used only for authorized channel operations, publication preparation and verification, troubleshooting and approved performance review. Google user data is not sold, used for advertising targeting, or used to develop, train or improve generalized AI or machine-learning models.', `${app.name}'s use and transfer of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.`], links: [external.apiPolicy] },
      { title: ko ? '4. 저장과 보호' : '4. Storage and safeguards', paragraphs: [ko ? '인증 정보는 운영자가 관리하는 비공개 환경에서 소스 저장소와 분리해 보관하며, 지원되는 운영체제에서는 파일 접근 권한으로 제한합니다. API 원본, 정규화 기록과 작업 결과는 비공개 로컬 파일·데이터베이스·검수 자료에 남을 수 있습니다. 자동화된 중앙 삭제나 보관 검사는 현재 제공하지 않습니다.' : 'Credentials are held separately from source repositories in operator-controlled private environments, with restricted file permissions on supported systems. API responses, normalized records and operation results may be retained in private local files, databases and review materials. Automated central deletion or retention checks are not currently provided.'] },
      { title: ko ? '5. 제공과 전송' : '5. Sharing and transmission', paragraphs: [ko ? '승인된 영상·썸네일·메타데이터는 작업 실행 시 YouTube에 전송합니다. API 조회와 OAuth는 Google 서비스와 통신합니다. 비공개 API 자료와 인증 정보를 공개 웹사이트에 올리거나 제3자에게 판매하지 않습니다. 운영에 필요한 접근과 법적으로 요구되는 공개 외에 Google 사용자 데이터를 제공하지 않습니다.' : 'Approved media, thumbnails and metadata are transmitted to YouTube when an operation is executed. API requests and OAuth communicate with Google services. Private API records and credentials are not published on the public website or sold to third parties. Google user data is not otherwise shared beyond access needed to operate the tool or legally required disclosures.'], links: [external.googlePrivacy] },
      { title: ko ? '6. 보관과 삭제' : '6. Retention and deletion', paragraphs: [ko ? 'Google API 데이터에는 해당 정책의 갱신·삭제 기한을 적용합니다. 메타데이터와 그 밖에 30일 갱신·삭제 규칙이 적용되는 자료는 기한 안에 갱신하거나 삭제합니다. 장기 보관이 허용되는 소유자 승인 통계도 30일 이내 간격의 지속 권한·원본 영상 삭제 여부 확인을 조건으로 보관하며, 확인할 수 없으면 장기 보관하지 않고 삭제합니다. 현재 확인·갱신·삭제는 운영자가 수동으로 처리합니다.' : 'Google API records are subject to applicable refresh and deletion deadlines. Metadata and other records covered by a 30-day refresh or deletion rule are refreshed or deleted within that period. Owner-authorized statistics eligible for longer retention are kept only with authorization and video-deletion checks at intervals no longer than 30 days; without those checks they are deleted rather than kept long term. These checks, refreshes and deletions are currently handled manually by the operator.', ko ? '삭제 요청을 받으면 요청자와 범위를 확인하고 해당 Google API 데이터, 인증 정보와 관련 로컬 복사본·캐시를 지체 없이 수동 삭제하며, 적용되는 YouTube API 정책에 따라 요청 후 7일 이내 처리합니다. 연결 해제만으로 로컬 자료가 자동 삭제되지는 않으므로 삭제가 필요하면 연락해주세요. 이는 창작 원본이나 이미 YouTube에 게시된 영상의 삭제를 의미하지 않습니다. 그런 작업은 별도 요청과 승인이 필요합니다.' : 'On a deletion request, we verify the requester and scope and manually delete the relevant Google API records, credentials and related local copies and caches without undue delay and within seven days of the request under applicable YouTube API policy. Disconnecting access does not itself automatically delete local copies; contact us for deletion. This does not mean deleting creative source media or videos already on YouTube, which requires a separate request and approval.'] },
      { title: ko ? '7. Google 연결 해제' : '7. Revoke Google access', paragraphs: [ko ? 'Google 계정의 서드 파티 연결 관리에서 해당 앱의 액세스를 해제할 수 있습니다. 권한이 해제되면 그 권한에 의존하는 작업은 중단되어야 하며 새 동의 없이 다시 접근하지 않습니다. 관련 로컬 자료 삭제는 위 연락처로 요청할 수 있습니다.' : 'You can revoke the app’s access through your Google Account’s third-party connections. Operations depending on revoked access must stop and cannot resume without new consent. Request deletion of related local records using the contact above.'], links: [external.revoke] },
      { title: ko ? '8. 이 웹페이지의 접속 정보' : '8. Visits to these web pages', paragraphs: [ko ? '이 도구의 소개·정책 페이지에는 회원가입, Google 로그인, 비공개 대시보드나 별도 광고·행동 추적 기능을 추가하지 않았습니다. 사이트는 GitHub Pages를 통해 제공되고 공통 디자인은 Google Fonts를 사용하므로, 해당 제공자가 페이지·글꼴 전달 과정에서 IP 주소와 브라우저 요청 정보를 처리할 수 있습니다. 인증 토큰이나 채널 통계는 이 페이지에 포함하지 않습니다.' : 'These product and policy pages do not add registration, Google sign-in, private dashboards, advertising or behavioral tracking. The site is served through GitHub Pages and its shared design uses Google Fonts; those providers may process IP addresses and browser request information to deliver pages and fonts. Authentication tokens and channel statistics are not embedded here.'], links: [external.hosting, external.fonts] },
      { title: ko ? '9. 변경 안내' : '9. Changes', paragraphs: [ko ? '처리 방식이 바뀌면 이 페이지의 수정일과 내용을 갱신합니다. 새로운 데이터 접근이나 이용 목적에 추가 동의가 필요한 경우, 기존 동의를 자동 확대하지 않고 별도 승인을 받습니다.' : 'Changes are reflected in this page and its update date. New access or purposes requiring additional consent are separately approved rather than silently expanding an existing grant.'] }
    ]
  };
  return {
    title: `${app.name}: ${labels[lang].terms}`,
    summary: ko ? '이 약관은 Stemly의 승인된 채널 운영자가 해당 로컬 도구를 이용할 때 적용됩니다.' : 'These terms apply to approved operators using this local channel tool provided by Stemly.',
    sections: [
      { title: ko ? '1. 서비스와 이용 대상' : '1. Service and permitted users', paragraphs: [app.description[lang], ko ? '일반 공개형 서비스가 아니며 채널 소유자 또는 적법하게 권한을 위임받은 운영자만 이용할 수 있습니다. Stemly가 제공하는 독립 도구로서 Google 또는 YouTube가 제공·보증하거나 제휴를 인증한 제품이 아닙니다.' : 'This is not a public registration service. Use is limited to channel owners and lawfully authorized operators. It is an independent Stemly tool, not a product provided, endorsed or certified as affiliated by Google or YouTube.'] },
      { title: ko ? '2. 승인 범위와 운영 책임' : '2. Authorization and operator responsibilities', paragraphs: [app.features[lang], ko ? 'Google OAuth 동의가 모든 외부 작업에 대한 포괄적인 실행 승인은 아닙니다. 운영자는 채널과 입력 자료, 저작권, 공개 시각, 제목·설명 등을 검토하고 해당 작업을 별도로 승인해야 합니다. 타인 채널에 대한 무단 접근, 권한 우회, 정책 위반 업로드와 스팸에 사용할 수 없습니다.' : 'Google OAuth consent is not blanket approval to execute external operations. Operators must review the channel, input material, rights, publication time, title and description and separately approve the operation. Unauthorized access to other channels, permission bypass, policy-violating uploads and spam are prohibited.'] },
      { title: ko ? '3. YouTube 및 Google 정책' : '3. YouTube and Google policies', paragraphs: [ko ? '이 도구는 YouTube API Services를 사용합니다. 도구를 이용하면 YouTube 서비스약관에도 동의하는 것입니다. Google 및 YouTube의 적용 정책과 API 제한을 준수해야 하며, 이 도구는 그러한 제한을 우회하지 않습니다.' : 'This tool uses YouTube API Services. By using it, you also agree to be bound by the YouTube Terms of Service. Applicable Google and YouTube policies and API restrictions must be followed; this tool does not bypass them.'], links: [external.youtube, external.googlePrivacy, external.apiPolicy] },
      { title: ko ? '4. 개인정보와 연결 해제' : '4. Privacy and disconnection', paragraphs: [ko ? '데이터 처리, 보관, 삭제 요청과 Google 권한 해제 방법은 이 도구의 개인정보처리방침에 따릅니다. 계정 비밀번호, 인증 토큰과 승인 파일을 공개 저장소·웹페이지·채팅에 공유하지 마세요.' : 'Data handling, retention, deletion requests and revocation of Google access are described in this tool’s Privacy Policy. Do not share passwords, authentication tokens or approval files in public repositories, websites or chat.'], links: [{label: labels[lang].privacy, href: pathFor(lang, appId, 'privacy')}] },
      { title: ko ? '5. 제공 범위와 한계' : '5. Availability and limitations', paragraphs: [ko ? '도구는 현재 제공되는 상태로 이용합니다. YouTube의 집계 지연, API 변경, 할당량, 네트워크 오류나 예약 게시 결과를 보장하지 않습니다. 성과 수치는 특정 조회수·수익 또는 인과관계를 보장하지 않습니다. 적용 법령상 배제할 수 없는 권리와 책임은 이 조항으로 제한되지 않습니다.' : 'The tool is provided as available. Reporting latency, API changes, quotas, network availability and publication outcomes are not guaranteed. Metrics do not guarantee views, revenue or causal conclusions. Rights and liabilities that cannot lawfully be excluded are not limited by this section.'] },
      { title: ko ? '6. 변경·중단·문의' : '6. Changes, discontinuation and contact', paragraphs: [ko ? `필요에 따라 도구를 변경하거나 중단할 수 있습니다. 추가 권한이 필요하면 별도 동의를 받으며 무단으로 확대하지 않습니다. 문의와 삭제 요청은 ${contact}로 보내주세요.` : `The tool may be changed or discontinued. Any additional permissions require separate consent rather than silent expansion. Contact ${contact} for support and deletion requests.`] }
    ]
  };
}
