# Frontend Developer Summary — 서주완 ♡ 최윤경 청첩장 (개나리 컨셉 반영판)

> 갱신 일자: 2026-11-21
> 컨셉: "봄바람에 살랑이는 개나리의 약속" — 2027-04-17(토) 14:00
> 방식: 기존 `index.html` / `style.css` / `script.js`(가을 장미판)를 **부분 수정**. 섹션 순서·클래스명·기능 유지.
> 입력: 01 컨셉 시트, 02 카피(변경 내역 표 A 1~19), 03 이미지 매니페스트(9장, 파일명 불변), 04 모션 명세("0. 변경점" 표)

---

## 1. 산출물

| 파일 | 줄 수 | 주요 변경 |
|------|------|----------|
| `index.html` | 386 | 날짜·문구(카피 표 A), alt 9개(매니페스트), theme-color, 캔버스·정적 장식을 `.card` 안으로 이동, 정적 SVG를 개나리 4종으로 교체, 인사말 줄에 `<span>` 추가(마스크 reveal) |
| `style.css` | 1,276 | 팔레트·모션 토큰 교체, §1-0 레이어 구조, 메시 `.card::before`, 글자색 대비 규칙, 타이밍 값 갱신, 가지 살랑임, reduced-motion 대상 추가 |
| `script.js` | 920 | 개나리 파티클 엔진 전면 교체(§1-A), lightbox 파티클 정지/재개, 카운트업 1200ms + flip, 공통 섹션 stagger, 가지 살랑임 IO, 스크롤 인디케이터 fadeOut, 날짜 상수 |

외부 의존성 변경 없음: Google Fonts(Nanum Myeongjo / Cormorant Garamond / Allura), Pretendard CDN, Kakao SDK(주석, 키 입력 시 활성화). 애니메이션 라이브러리 없음.

## 2. 팔레트·대비 반영

- `:root`: primary `#F2C230`, secondary `#B4C77A`, accent `#5F6B2C`, bg `#FFFBF1`, surface `#FBF1D6`, text `#3B3022`, muted `#76664A`. `theme-color` = `#FFFBF1`.
- 이전 색(HEX·rgba) 잔존 **0건** (index.html / style.css / script.js grep). `.bus-green #5C9F5F`은 버스 노선색이라 유지(복사 체크마크에서 쓰던 같은 값은 accent로 교체).
- 글자색 규칙: primary를 글자로 쓰던 `.hero-amp`, `.greeting-en`, `.couple-amp`, `.card-footer .script`, 일요일(`th/td.sun`), D-day "오늘"(script.js) → **accent**. secondary 글자(`th/td.sat`, 음악 아이콘, 복사 완료 체크) → **muted / accent**.
- 달력 예식일: 노랑 원(`--color-primary`, α 0.35↔0.6) + 숫자 `#3B3022`.
- 버튼: `.btn.primary` = accent 배경 + `#FFFBF1` 글자, hover는 opacity 0.92. 보조 `.btn` hover = 노랑 면 + 브라운 글자. `.copy-btn` hover = accent 면 + 크림 글자.
- 카드 바깥 `html, body`: `linear-gradient(135deg, #F6EBC8, #EFE3BC, #E4DCB8)`. 정적 지도 배경도 봄 톤.

## 3. 이미지 통합

- alt 9개 매니페스트 값으로 교체(og-thumbnail은 메타 태그라 alt 없음). 디바이더 2개는 반복 낭독 방지를 위해 `aria-hidden="true"` 추가(코너 장식은 기존부터 aria-hidden).
- 디바이더: `aspect-ratio: 4/1; object-fit: cover`로 위아래 여백 크롭.
- `mix-blend-mode: multiply`는 유지하되, 섹션이 z-index 1 스태킹 컨텍스트라 합성이 섹션 안에서만 일어나므로(배경이 투명해 곱할 대상이 없음) 크림 사각 경계가 메시 위에 비치지 않도록 디바이더(타원)·코너(붙은 모서리 기준 원형)에 **가장자리 mask 페이드**를 추가.
- 이미지 크기(width/height 속성)는 이전과 동일.

## 4. 모션 명세 구현 매핑

| ID | 항목 | 등급 | 상태 | 비고 / 위치 |
|----|------|------|------|-------------|
| 1-0 | 배경 레이어 구조 | Must | ✅ | 캔버스·정적 장식 → `.card` 첫 자식(z 0), 메시 `.card::before`(fixed, z -2), `.hero-illustration` relative z -1, `.hero-content`/`.scroll-indicator` z 1, `.section` z 1 + 배경 transparent, `.card-footer` z 1, `.hero { contain: style }`. 375px 화면에서 히어로 일러스트 위·본문 아래로 꽃잎이 보이는 것을 확인 |
| 1-A | 개나리 파티클 | Must | ✅ | `script.js` setupPetals. CFG 수치 그대로, Path2D 3종 캐시, dt 적분(50ms 클램프), 사인 살랑임 + lean, 뒤집힘(scaleX, 0.15 클램프, 뒷면 α×0.8), 바람 +10px/s + 돌풍(첫 4~7s, 이후 8~15s 간격, 2~3s, cos 곡선), 좌우 랩어라운드, 재생성 x 상류 바이어스, 개수 12/16/18/20 + 저사양 12 + DPR 2/1.5, FPS 강등 1단계(×0.6, 최소 8, DPR 1)·2단계(OFF + 정적 장식), 폭 변화 시에만 재할당(150ms debounce, 높이는 최대값 유지), visibilitychange 시 cancelAnimationFrame |
| 1-A-3 | 꽃잎 잎맥 | Nice | ✅ | L ≥ 14 꽃잎에 0.6px 잎맥, α×0.5 |
| 1-A-6/7 | reduced-motion 정적 장식 | Must | ✅ | 명세 SVG 4종(id는 `fp-static`), 위치 `.sp-1~4` 유지, 루프 미생성 |
| 1-B | 그라디언트 메시 | Must | ✅ | 노랑 .16 / 연두 .14 / 버터 .12 / 노랑 .10, 45s, `.card::before` + 데스크톱 바깥용 `body::before` 같은 값. will-change는 `.card::before`만 |
| 2-1 | Hero 시퀀스 | Must | ✅ | 150/300/650/800/950/1250/1750ms, 각 600ms, 일러스트 300ms·1000ms·blur 4px, 인디케이터 1.4s, 스크롤 시 fadeOut 300ms(신규) |
| 2-2 | Greeting masked reveal | Should | ✅ | 줄 overflow hidden + span translateY(100%)→0, 700ms, stagger 120ms |
| 2-3 | Couple | Must | ✅ | 600ms, 신부 delay 120ms, 부모 함자 500ms/300ms, "&" 500ms/300ms |
| 2-4 | Calendar | Must | ✅ | 그리드 opacity + scale(.97→1) 600ms, 등장 1s 뒤(600+400) 펄스 3회 1.4s scale 1.12 α .35↔.6 |
| 2-5 | 갤러리 첫 슬라이드 | Must | ✅ | 900ms, scale 1.02, blur 4px, dots 400ms/delay 500ms |
| 2-6 | 공통 섹션 reveal | Must | ✅ | venue/account/guestbook/share 자식 stagger 80ms, 600ms (JS가 `.reveal-stagger`·`.stagger-item`·`--stagger-i` 부여, 코너 장식 제외) |
| 3-1 | D-day 카운트업 | Must | ✅ | 1200ms easeOutCubic, 숫자색 accent, 카운트 중 `aria-busy`로 최종값만 낭독 |
| 3-1 | 종료 flip | Nice | ✅ | WAAPI rotateX 70→0, opacity .4→1, 400ms, reduced 시 생략 |
| 3-2 | 갤러리 스와이프 | Must | ✅ | 동작 유지, 활성 dot accent / 비활성 `rgba(95,107,44,.25)` |
| 3-3 | 계좌 복사 + 토스트 | Must | ✅ | 토스트 surface/text, 테두리 `rgba(180,199,122,.5)`, 체크 accent, 1500ms 노출 |
| 3-4 | 부드러운 스크롤 | Must | ✅ | 유지 |
| 3-5 | Lightbox | Should | ✅ | 배경 `rgba(59,48,34,.92)`, 내용 scale(.96→1), 더블탭 2.5, **열림 시 파티클 정지·닫힘 시 재개**, Tab 포커스 트랩, 아래로 100px 스와이프 닫기(신규), 햅틱 열기 25 / 닫기 15 |
| 3-6 | 음악 토글 | Should | ✅ | 아이콘 accent, 배경 `rgba(255,251,241,.8)`, 테두리 `rgba(242,194,48,.6)`, ripple `rgba(242,194,48,.45)`, 이퀄라이저 height→**scaleY**(0.3↔1, layout 속성 제거), aria-label 상태별 갱신, `preload="metadata"` |
| 3-7 | 카카오 공유 | Should | ✅ | 유지 (SHARE_DESC 날짜만 갱신) |
| 3-8 | 햅틱 | Should | ✅ | 유지 + lightbox 25ms |
| 3-9 | 스크롤 리빌 | Nice | ✅ | 섹션 2 공통 패턴(1회성) |
| 3-10 | 모서리 장식 패럴랙스 | Nice | ❌ | 미구현. 래퍼 마크업이 없어 3-12 살랑임과 transform이 충돌하고, `scrollY × 0.15`를 그대로 적용하면 페이지 하단 장식이 수백 px 밀려나 섹션을 벗어남. 기존에도 미구현 |
| 3-11 | Hero ken-burns | Nice | ✅ | 16s 토큰 |
| 3-12 | 코너·디바이더 가지 살랑임 | Nice | ✅ | 코너 ±1.2deg(붙은 모서리 기준), 디바이더 ±0.6deg, 6s, 요소별 음수 delay, viewport 밖 paused, 반전 코너는 `--flip:-1`로 scaleX 유지 |
| 4 | 마이크로 인터랙션 색 | Must | ✅ | 아코디언 `rgba(242,194,48,.10)`, 칩 테두리 연두 .5, 포커스 링 accent, 카드 그림자 `rgba(59,48,34,.08)` |
| 4 | 디바이더 라인 scaleX / 입력 필드 focus | — | 해당 없음 | 페이지에 1px 라인 디바이더·입력 필드가 없음(이미지 디바이더, 외부 폼 링크) |
| 5 | CSS 토큰 | Must | ✅ | `--dur-mid .5 / slow .7 / xslow 1.2 / bg-mesh 45s / bg-petal 20s / pulse 1.4s / ken-burns 16s / branch-sway 6s / stagger .08 · .12` |
| — | reduced-motion 글로벌 | Must | ✅ | 메시·가지 살랑임·펄스(α .45 고정)·이퀄라이저(scaleY .7)·ripple OFF, 모든 reveal 즉시 표시 |

### 명세와 다르게(또는 추가로) 처리한 점
- **FPS 측정 스로틀 보정**: 한 프레임 간격이 250ms를 넘으면 측정 창을 다시 시작한다. 브라우저가 가려진 창의 rAF를 초당 2프레임 수준으로 묶으면, 명세 로직 그대로일 때 정상 기기에서도 파티클이 OFF로 강등되는 것을 미리보기에서 실제로 재현했다. 꾸준히 느린 기기(프레임 간격 20~30ms대)는 그대로 강등된다.
- 바람 돌풍 타이밍을 rAF 타임스탬프 대신 시뮬레이션 누적 시간(`simT`)으로 계산해, 일시정지 후 재개해도 돌풍이 끊기거나 바로 끝나지 않는다.
- 캔버스 CSS 높이를 지금까지 본 최대 `innerHeight`(px)로 지정한다(inset 늘림 대신). 주소창이 나타날 때 세로로 찌그러지지 않는다.

## 5. Placeholder 위치 (수정 후 기준)

| 항목 | 위치 |
|------|------|
| og:url (배포 URL) | `index.html:18` |
| BGM 음원 안내 (`audio/bgm.mp3`, 파일은 이미 커밋됨) | `index.html:41-42` |
| 지도 — **약도 이미지로 교체(2026-11-21)** `images/venue-map.png`, 탭 시 lightbox. 카카오맵 SDK 임베드는 여전히 없음(지도 앱 버튼으로 연결) | `index.html:225-231` |
| 갤러리 사진 — **실제 사진 11장으로 교체(2026-11-21)** `images/gallery-01~11.jpg` | `index.html:167-201` |
| 계좌번호 6개 — **채움(2026-11-21)** (표시 `.acc-num` + 숫자만 `data-copy`) | `index.html:313-315`, `327-329`, `335-337`, `349-351`, `357-359`, `365-367` |
| RSVP 폼 링크 — **섹션 제거(2026-11-21)** | — (HTML 섹션·`RSVP_FORM_URL`·링크 처리·CSS 모두 삭제) |
| 방명록 폼 링크 | `index.html:406-407` / `script.js:13` (`GUESTBOOK_URL`) |
| 카카오 SDK `<script>` (주석) | `index.html:442-443` |
| 카카오 JS 키 | `script.js:12` (`KAKAO_JS_KEY`) |
| 이름·부모 함자 — **채움(2026-11-21)** | — |
| 예식장·주소·교통편 — **채움(2026-11-21)** | `index.html:197-295` venue 섹션, 9·14·22(meta), 79(히어로), 152(dday-sub) / `script.js:16` SHARE_DESC |

## 6. 검증

- `node --check script.js` 통과.
- grep (index.html / style.css / script.js): 이전 팔레트 HEX·rgba **0건**, `2026 / 10.17 / OCTOBER / 가을 / autumn / 장미 / 로즈 / sage / rose / dusty` **0건** ("클로즈업"의 '로즈' 오탐 1건 제외).
- 로컬 서버(`python -m http.server`, 확인 후 종료) + 375×812 에뮬레이션:
  - 히어로: 개나리 일러스트 위, 이름·날짜 아래로 꽃잎·네 갈래 꽃·연두 잎이 날림.
  - 달력: APRIL 2027, 4/1이 목요일 칸에서 시작, 17일(토)에 노랑 원 + 브라운 숫자, D-147(2026-11-21 기준).
  - 인사말·갤러리·계좌·공유·푸터 렌더링, 꽃잎이 정보 박스 아래로 지나감.
  - lightbox 열림 동안 캔버스 프레임 정지, ESC로 닫으면 재개, 포커스가 닫기 버튼에.
  - 콘솔 오류 없음(스크립트로 lightbox를 연 경우 Chrome의 `navigator.vibrate` 사용자 제스처 경고만 있음).
- 확인하지 못한 것: 실제 iOS/Android 기기 터치(스와이프·핀치·아래로 스와이프 닫기), prefers-reduced-motion 실환경(CSS/JS 분기는 코드로만 확인), 60fps 실측(미리보기 창이 가려져 rAF가 스로틀됨), 카카오 공유(키 미설정).

## 7. 배포 가이드

1. placeholder(5절)를 실제 값으로 교체: `og:url`, `GUESTBOOK_URL`, 필요 시 `KAKAO_JS_KEY` + SDK `<script>` 주석 해제.
2. 카카오 공유 미리보기는 절대 URL이 필요하다. `og:image`를 `https://{도메인}/images/og-thumbnail.png`로 바꾸고, 카카오 디벨로퍼스에 사이트 도메인을 등록한다.
3. 정적 호스팅(GitHub Pages / Netlify / Vercel)에 프로젝트 루트를 그대로 올린다. `.nojekyll`이 이미 있다.
4. 이미지(PNG 0.76~1.71MB)는 WebP 변환을 권장한다(파일명을 바꾸면 index.html 경로도 함께 수정).
5. 배포 후 카카오 공유 디버거로 OG 캐시를 초기화한다.

## 2026-11-21 디자인 피드백 반영

신랑·신부 카드의 영문 이름(`<span class="en">Minjun Kim</span>`, `Seoyeon Park`)을 index.html에서 지우고, 더 이상 쓰지 않는 `.couple-name .en` 규칙도 style.css에서 삭제했다. 글자 크기는 다음과 같이 바꿨다. `.hero-info` 13→16px. `.couple-card .parents` 13→16px(letter-spacing 0.04→0.02em, line-height 1.6, margin-bottom 8→10px 추가, 이름 `span`은 상속). `.date-headline` 18→20px. `.cal-caption` 14→17px. `.cal th` 11→13px(letter-spacing 0.18→0.1em). `.cal th, .cal td` 13→16px(padding 10→12px 0, line-height 1.5 명시). `.cal td.today::before`는 inset 4px 타원에서 지름 `--cal-dot` 38px 정원(가운데 정렬)으로 바꿨다. `.dday-label` 13→14px. `.dday-sub` 12→14px. 새로 넣은 `@media (max-width: 360px)` 규칙은 `--cal-dot` 32px, `.cal th` letter-spacing 0.04em, `.hero-info` letter-spacing 0이다. 375px·320px 폭에서 가로 넘침, 요일 헤더 넘침, 히어로 문구와 스크롤 인디케이터의 겹침이 없음을 브라우저로 확인했다.

## 2026-11-21 신랑신부·부모·계좌 실제 정보 반영

예시 이름을 사용자가 준 실제 이름으로 바꿨다(신랑 서주완, 신부 최윤경, 양가 부모 함자 4명, 신부 서열 '장녀'→'차녀', 신랑 '장남' 유지). 바뀐 위치는 index.html의 title(7), meta description(9), og:title(13), twitter:title(21), 히어로 이름(73, 75), 신랑신부 소개(113-114, 121-122), dday-label(150), 계좌 섹션(257-311), 푸터(365), script.js 헤더 주석(3)과 SHARE_TITLE(15), style.css 헤더 주석(2)이다.

계좌 6개를 채웠다. 화면(`.acc-num`)에는 은행명과 하이픈 넣은 번호를 보여 주고, `data-copy`에는 숫자만 넣었다. script.js `setupCopy()`(708)에서도 `data-copy`에 `.replace(/\D/g, '')`를 적용해, 값에 하이픈이나 공백이 섞여도 클립보드에는 숫자만 들어간다. 토스트 문구 "계좌번호가 복사되었습니다"는 그대로 두었다. 버튼 aria-label은 "신랑 아버지 서정표 계좌번호 복사"처럼 관계와 이름을 함께 담도록 맞췄고, placeholder 주석은 지웠다. 6개 모두 "표시번호에서 하이픈을 뺀 값 = data-copy"를 스크립트로 검증했다. 375px·320px 폭에서 아코디언을 연 상태로 확인했을 때 가장 긴 번호도 한 줄에 들어가고 복사 버튼과 겹치거나 넘치지 않아 CSS는 바꾸지 않았다.

## 2026-11-21 예식장 정보 교체

예시 예식장(서울 호텔)을 사용자가 준 **파티움하우스 수원**으로 바꿨다. 홀 이름과 층은 받지 않았으므로 `.venue-hall` 줄과 "그랜드볼룸" 표기를 모두 지웠고, 새로 지어내지 않았다. 바뀐 위치는 index.html의 meta description(9), og:description(14), twitter:description(22), 히어로 `.hero-info`(79), `.dday-sub`(152), venue 섹션(197-295)과 script.js SHARE_DESC(16)다. og/twitter는 " · ", SHARE_DESC는 기존 줄바꿈 구분자를 그대로 썼다.

- **주소**: `.venue-addr`에 도로명 주소(경기 수원시 팔달구 효원로 289), 그 아래 `.venue-addr-sub`(12.5px, muted)에 지번 주소를 넣었다.
- **지도 버튼**: 카카오맵과 네이버지도는 `encodeURIComponent("파티움하우스 수원")` 값(`%ED%8C%8C%ED%8B%B0%EC%9B%80%ED%95%98%EC%9A%B0%EC%8A%A4%20%EC%88%98%EC%9B%90`)으로 검색하도록 바꿨다. 이전 예식장을 가리키던 T map 링크는 지우고, 그 자리에 "주소 복사" 버튼(`data-copy-text`)을 넣었다. 세 버튼은 320px 폭에서도 한 줄에 균등하게 놓인다(`.venue-actions .btn` flex 1 1 0, 좌우 패딩 4px, nowrap).
- **주소 복사**: script.js에서 클립보드 쓰기를 `copyText()`(704)로 빼냈다. 계좌 버튼(`.copy-btn`)은 이전처럼 숫자만 남겨 복사하고, `[data-copy-text]` 버튼(741)은 받은 문자열을 그대로 복사한 뒤 "주소가 복사되었습니다" 토스트를 띄운다.
- **오시는 길**: article을 지하철, 시내버스, 시외버스, 자가용, 주차 5개로 나눴다. 버스 article은 `.route-list` 안에 출발지(`.route-from`, 굵게), 노선 번호(`.bus-tag`), 하차 안내(본문 14px) 순서로 위계를 줬다. 시외버스는 `dl.route-items` 2열 grid(태그 | 안내)로 만들어, "→" 뒤가 줄바꿈되어도 둘째 줄이 안내문 시작 위치에 맞춰진다. 내용, 번호, 정류장명은 사용자 원문 그대로 두고 "10번출구"를 "10번 출구"로 띄어 쓰는 정도만 맞췄다.
- **CSS 정리**: 서울 버스 색 구분(`.bus-blue/.bus-green/.bus-red`), `.bus-list`, `.venue-hall`을 지웠다. `.bus-tag`는 accent(#5F6B2C) 면에 #FFFBF1 글자(약 5.9:1, AA)를 쓰는 단일 스타일 13px로 바꿨다. `.directions p`는 13.5px에서 14px로 키웠다.
- **카카오맵 SDK**: 코드에 지도 SDK 초기화나 좌표가 없다(카카오 SDK는 공유용뿐이다). 그래서 좌표는 넣지 않았다. 지도 영역은 정적 placeholder로 두고 핀 라벨만 바꿨으며, "KAKAO_JS_KEY를 넣으면 지도가 켜진다"던 기존 주석은 사실과 달라 고쳤다.
- **검증**: `node --check script.js` 통과. `인터컨티넨탈|파르나스|그랜드볼룸|테헤란로|삼성중앙|무역센터|호텔|tmap` 검색 결과 0건. 375px과 320px에서 venue 섹션 가로 넘침 0건, 히어로에 "파티움하우스 수원"이 표시됨을 확인했다. 브라우저 패널은 클립보드 권한이 막혀 있어 기존 계좌 복사도 실패 토스트가 뜬다. 그래서 clipboard를 stub으로 바꿔 확인했고, 주소는 "경기 수원시 팔달구 효원로 289" 원문 그대로, 계좌는 숫자만 복사되며 토스트 문구도 각각 맞게 나왔다.

## 2026-11-21 갤러리 실사진 11장·약도·오시는 길 순서·홀 이름

- **갤러리**: `gallery-placeholder-1~5.png` 슬라이드를 `images/gallery-01~11.jpg`로 바꿨다(`index.html:167-201`). alt는 사진별 설명, `aria-label="사진 n / 11"`, width/height는 실제 픽셀(긴 변 1600), 1번만 eager, 전부 `decoding="async"`. `.gallery-stage` 비율을 4:5에서 3:4로 바꾸고 `object-position: center`를 명시했다(`style.css:667`). 375px 화면에서 11장을 모두 넘겨 보며 머리·손·발이 잘리지 않는 것을 확인했다(7번 들어 올린 팔, 11번 아래쪽 인물 포함). 사진 위 blend·오버레이는 원래 없었고, 첫 슬라이드 blur 4px→0 900ms 리빌만 남겼다(짧은 페이드라 인물이 뭉개지지 않음). lightbox 이미지는 `object-fit: contain`.
- **점 인디케이터**: HTML에 점을 하드코딩하지 않고 script.js가 슬라이드 수만큼 `<li>`를 만든다(`script.js:468-469`). 점을 6px·간격 5px·활성 18px로 줄여 11개 너비가 128px라 320px에서도 한 줄이다. 아래에 "1 / 11" 카운터(`#gallery-counter`, Pretendard 12px, muted)를 함께 둔다. 자동 재생 중 반복 낭독을 막으려고 카운터는 aria-hidden이며 슬라이드 aria-label이 위치를 알린다. JS에 슬라이드 수 하드코딩은 원래 없었다(`N = slides.length`).
- **약도**: `#map.map-static` 빈 상자를 `figure.venue-map` > `.venue-map-card`(role=button, tabindex 0, aria-label "약도 크게 보기") > `img venue-map.png`(1122x838, lazy)로 교체했다. 카드는 둥근 모서리 12px + `#EFE2B4` 1px 테두리. 아래에 "약도를 누르면 크게 볼 수 있어요"(12px muted). 클릭·Enter·Space로 lightbox의 새 `openSingle()`(`script.js:599`)이 열리는데, 단독 모드에선 좌우 화살표로 갤러리 사진이 넘어가지 않고 갤러리 순번도 바뀌지 않는다. 핀치 줌·더블탭·아래로 스와이프 닫기는 갤러리와 같은 핸들러를 쓴다. 닫으면 포커스가 약도 카드로 돌아온다. `.map-static`, `.map-pin` CSS와 옛 주석은 지웠다.
- **오시는 길 순서**: 자가용 → 주차 → 지하철 → 시내버스 → 시외버스(`index.html:239-`). 내용은 그대로.
- **홀 이름**: venue에 `.venue-hall` "2층 그레이스켈리홀"(명조 700, 15px, accent, `style.css:791`)을 추가했다. 히어로 `.hero-info`와 `.dday-sub` 둘째 줄은 "파티움하우스 수원 2층 그레이스켈리홀"이며, 두 덩어리를 각각 `.nowrap` span으로 감싸 줄바꿈이 그 사이에서만 일어난다. meta/og/twitter description과 `SHARE_DESC`에도 같은 장소명을 넣었다. 자가용 안내의 네비 검색어는 그대로 뒀다.
- **삭제**: `images/gallery-placeholder-1~5.png`. index.html/style.css/script.js에서 참조 0건을 확인한 뒤 지웠다.
- **검증**: `node --check script.js` 통과. 375px·320px 둘 다 `scrollWidth`가 화면 폭과 같고(가로 넘침 없음) 콘솔 오류 0건. 장소 줄은 320px에서도 한 줄에 들어간다(히어로 기준 오른쪽 끝 281px). 갤러리 다음 버튼으로 11→1 순환, 사진 탭 시 lightbox, 약도 탭·Enter·Space 시 단독 lightbox와 Esc 닫기를 확인했다. 실제 터치 기기에서 핀치·더블탭은 확인하지 못했다(갤러리와 같은 코드).

## 2026-11-21 RSVP 섹션 제거·갤러리 순서 변경

- **RSVP 제거(사용자 요청)**: index.html에서 `<!-- 8. RSVP -->` 섹션 전체(eyebrow·제목·안내문·`#rsvp-link` 버튼, 코너 장식·디바이더는 원래 없었음)를 지우고, 뒤 섹션 주석을 `8. GUESTBOOK`(396)·`9. SHARE`(410)로 다시 매겼다. script.js에서 `RSVP_FORM_URL` 상수, `setupReveal()` 선택자의 `.rsvp`(60), `setupExternalLinks()`의 RSVP 분기를 지웠다. 방명록 분기(`script.js:894-907`)는 그대로이며 섹션 주석은 "11. Guestbook placeholder URL handling"으로 바꿨다. style.css에서는 `.rsvp-message`를 메시지 공통 규칙에서 빼고 섹션 주석을 "8. GUESTBOOK / 9. SHARE"로 고쳤다. 세 파일에서 `rsvp`(대소문자 무시) 검색 결과 0건. 계좌 → 방명록 → 공유 섹션은 바로 이어지고, 각각 위아래 패딩 96px로 다른 섹션과 같다(장식 연속·이중 여백 없음).
- **갤러리 순서**: 파일 이름은 그대로 두고 `<li class="gallery-slide">`만 3, 4, 9, 7, 8, 10, 11, 5, 6, 2, 1 순서로 다시 배열했다(`index.html:167-201`). img의 src·alt·width·height는 함께 옮겼고 `aria-label="사진 n / 11"`은 새 위치 기준으로 다시 매겼다. `loading="eager"`는 첫 슬라이드 gallery-03에만 두고 나머지는 lazy, 모두 `decoding="async"`. 스크립트로 확인한 결과 src 순서가 정확하고 중복·누락 없이 11개다.
- **검증**: `node --check script.js` 통과. localhost:8000에서 375px로 확인했다. 첫 장 gallery-03, 다음 버튼 순서 03→04→09→07→08→10→11→05→06→02→01→03(순환), 방명록 버튼을 누르면 "방명록은 준비 중입니다" 토스트가 뜬다. 콘솔 오류는 스크립트 클릭으로 생긴 `navigator.vibrate` 사용자 제스처 경고뿐이다. 미리보기 창이 가려져 CSS 트랜지션 렌더가 멈춰 있었기 때문에, 슬라이드 순서는 트랙의 inline transform 인덱스와 스크린샷으로 확인했다.

## 2026-11-21 배포 준비 (오케스트레이터 직접 수정)

- **og:url / og:image / twitter:image** 를 배포 주소 `https://joowop.github.io/wedding-letter/` 기준 절대 URL 로 채움(index.html head).
- **배경음악 자동 재생**(script.js `setupMusic`): 페이지가 열리면 재생을 시도하고, 브라우저가 막으면 첫 터치(pointerdown/touchend/click/keydown)에 시작. 사용자가 음표 버튼으로 끄면 다시 자동으로 켜지 않음. 다른 앱·탭으로 나가면 멈추고 돌아오면 이어서 재생. `audio/bgm.mp3` 는 사용자 제공 음원으로 교체, `preload="auto"`.
- **꽃잎 FPS 강등 기준 완화**(script.js `measureFps`): 명세의 50/40fps 대신 28/18fps. iOS 저전력 모드처럼 30fps 로 고정되는 정상 기기에서 꽃잎이 꺼지던 문제를 막기 위함(사용자 최우선 요구가 "꽃잎이 날아다니게").
- README 의 데모 주소를 이 저장소의 배포 주소로 변경.

