# 채널 도구 OAuth 공개 페이지 검수

상태: 로컬 구현·검증 완료 후 소유자 검수 대기. 아직 공개 URL이 생성되거나 Cloud 설정이 바뀐 것은 아닙니다.

## 범위

기존 Stemly SvelteKit 정적 사이트에 앱별 소개·개인정보처리방침·약관을 KO/EN으로 추가했습니다. 총 12개 URL이며, 검증된 경로 매처로 렌더링합니다. **기존 파일은 한 줄도 수정하지 않았습니다.** 공통 레이아웃·footer·내비게이션에 링크를 달지 않아 기존 홈·회사소개·공시·프로젝트 갤러리 화면은 그대로입니다. 각 페이지는 다른 앱과 정책으로만 서로 연결되며, 검수 제출용으로는 URL을 직접 열어 확인합니다.

| 앱 | 소개 (배포 후 주소) | 개인정보처리방침 | 약관 |
|---|---|---|---|
| YAG | `https://stemly.me/ko/yag-channel-tools/` | `https://stemly.me/ko/yag-channel-tools/privacy/` | `https://stemly.me/ko/yag-channel-tools/terms/` |
| Piston Atlas | `https://stemly.me/ko/piston-atlas-publishing/` | `https://stemly.me/ko/piston-atlas-publishing/privacy/` | `https://stemly.me/ko/piston-atlas-publishing/terms/` |

영문은 `/ko/`를 `/en/`으로 바꿉니다. 위 주소는 배포 후 사용할 후보 주소이며 현재 운영 사이트의 존재·응답을 확인한 것은 아닙니다.

## 실제 기능 구분

- YAG: 기존 관리·업로드와 별도 승인된 읽기 전용 Analytics 연동. 현재 단일 통합 토큰 기능은 아직 준비 단계라고 명시했습니다.
- Piston Atlas: 현재 관리 범위 하나, 비공개 업로드·예약·재생목록 기능. Analytics가 구현됐다고 쓰지 않았습니다.
- 소개·정책은 공통 도메인에 있지만 OAuth 프로젝트·클라이언트·채널·토큰을 합치지 않았습니다. YAG의 통합 토큰 논의가 Piston 토큰까지 합친다는 뜻은 아닙니다.
- 두 도구의 Cloud 프로젝트가 같은지 별개인지는 이 작업에서 확인하지 않았습니다. Branding은 Cloud 프로젝트 단위이므로 같은 프로젝트라면 클라이언트별로 서로 다른 앱 이름·홈페이지를 설정할 수 없습니다. 이 경우 공개 전 공통 앱 이름·소개 페이지 사용 여부를 먼저 결정해야 합니다.
- Piston Atlas의 현재 Google Branding 표시 이름은 이 작업에서 확인하지 않았습니다. 제안 이름 `Piston Atlas Publishing`과 실제 콘솔 이름이 일치하는지 배포 전에 소유자가 확인해야 합니다. 다르면 공개 페이지 이름을 실제 이름과 맞춥니다.

## 개인정보처리방침 검수 사항

정책은 실제 수집 정보, 공식 OAuth와 비밀번호 미수집, 로컬 보관, 파일 권한, 수동 갱신·삭제, 승인된 YouTube 전송, 연결 해제와 삭제 요청의 차이를 설명합니다. Google API Services User Data Policy와 Limited Use 준수 문구, YouTube 약관, Google 개인정보처리방침, 계정 연결 해제 링크가 있습니다.

**배포 전에 소유자가 수동 운영 의무에 동의해야 합니다.** 문서에는 요청 후 7일 이내 관련 API 자료·인증정보·로컬 복사본 삭제, 적용되는 자료의 30일 갱신·삭제, 장기 보관 통계의 30일 이내 권한·영상삭제 확인을 운영자가 수동 처리한다고 적었습니다. 이를 수행하는 자동 시스템을 구현했다는 뜻이 아닙니다. 정책을 승인할 수 없다면 배포 전에 문서와 실제 처리 절차를 함께 정비해야 합니다.

Google API 데이터를 모델 학습·개선, 광고 타겟팅이나 판매에 쓰지 않는다는 내용도 확인해야 합니다. 아직 승인되지 않은 예측·모델 학습이나 새 외부 데이터 전송을 허용하는 문서가 아닙니다.

신규 페이지에는 로그인·회원가입·분석 추적을 추가하지 않았습니다. 다만 기존 전체 레이아웃은 Google Fonts를 불러오고 사이트는 GitHub Pages로 배포되므로 제공자의 요청 정보 처리를 고지했습니다. 기존 공시/Firebase 서비스 전체의 개인정보처리방침을 대체하지 않습니다.

## 구현 위치

- `src/lib/channel-tools/content.ts`: 앱별·언어별 문서와 검증된 링크
- `src/lib/pages/ChannelToolPage.svelte`: 메타데이터·정책 탐색·공통 표현
- `src/params/`: 지원 언어·앱·문서의 allowlist
- `src/routes/[lang=toolLocale]/[tool=channelTool]/[[document=toolDocument]]/`: 정적 12경로 생성
- `src/routes/[lang=toolLocale]/[tool=channelTool]/[[document=toolDocument]]/`: 정적 12경로 생성. 기존 `en/projects`·`ko/projects` 등과 충돌하지 않도록 matcher로 범위를 제한
- 추가만 하고 수정한 기존 파일은 없습니다. 링크 노출이 필요해지면 그때 레이아웃 연결을 별도 검토합니다.
- `tests/channel-tools.test.mjs`, `tests/channel-tools.browser.cjs`

## 로컬 검증

이미 설치된 의존성만 사용했습니다. 설치나 lockfile 변경은 없습니다. 기존 `.svelte-kit` 등 캐시를 덮어쓰지 않기 위해 별도 임시 workspace에서 실행했습니다.

```sh
node --test tests/channel-tools.test.mjs
npm run check
npm run build
# 소유자가 로컬 서버로 확인할 경우
npm run preview -- --host 127.0.0.1
```

단위 테스트 15개, Svelte 진단 0 error/0 warning, 정적 build 성공. 실제 Chromium에서 1440×900/390×844의 전체 12페이지와 언어·문서 전환, 링크·레이아웃·키보드·44px 탭을 검사했습니다. Google Fonts 등 외부 요청은 차단하고 시스템 글꼴로 검증했습니다. 전체 접근성·법률 검토나 Google 앱 심사를 통과했다는 뜻은 아닙니다.

Browser QA는 Node 22+의 native WebSocket과 로컬 Chromium을 사용합니다. `CHROME_BINARY`를 설치된 브라우저로 지정하고 `node tests/channel-tools.browser.cjs BUILD_DIR SCREENSHOT_DIR`로 실행합니다. QA 서버는 loopback에만 열고 종료합니다. 단위 테스트는 기존 TypeScript compiler로 메모리 내 변환하므로 Node의 TS 직접 실행 기능에 의존하지 않습니다.

최초 검사에서 타입 추론 오류 1건을 수정했습니다. 초기 browser 실행은 QA의 DNS 차단에 loopback 예외가 없었고 기존 `.html` 경로를 QA 서버가 처리하지 못해 실패했습니다. 이를 수정하고 새 결과 디렉터리에서 최종 111개 검사와 24개 스크린샷을 생성했습니다. 실패 기록은 보존했으며 최종 결과와 구분합니다.

## 공개 배포와 콘솔의 다음 단계 (아직 미실행)

1. 두 앱의 실제 표시 이름·정책 내용·연락처 검수.
2. 소유자의 별도 승인 후 scoped commit/push 및 사이트 배포. 이 저장소는 main push로 Pages가 자동 실행되므로 push 자체가 배포를 유발할 수 있습니다.
3. 외부에서 12개 URL의 HTTPS 200·로그인 없는 본문·정책 링크 확인.
4. 각 OAuth 앱 Branding에 해당 앱의 세 URL 입력. 승인된 도메인은 `stemly.me`이며, 요구되면 소유권을 확인합니다. 프로젝트별 실제 설정은 확인 후 진행합니다.
5. Branding 검증·게시와 Audience의 Production 전환은 구분해서 확인. 페이지가 있다고 심사 성공이 보장되지 않습니다.
6. Production 확인 후 목적별 새 브라우저 동의. YAG 통합 인증은 코드 준비·추가 승인 후 별도 작업입니다. Piston의 현재 exact-scope 검증은 그대로 유지합니다.

**이 작업에서 commit/push, 배포, Cloud/DNS 설정, OAuth 발급·갱신, 실제 API 조회, SNS·Drive 작업은 하지 않았습니다.**
