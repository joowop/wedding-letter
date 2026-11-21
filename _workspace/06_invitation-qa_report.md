# QA Report — 2026-11-21 (GitHub 공개 전 전체 점검)

> 대상: 서주완 ♡ 최윤경 / 2027-04-17(토) 오전 11시 / 파티움하우스 수원 2층 그레이스켈리홀
> 입력: `_workspace/01~05`, `index.html`(447줄), `style.css`, `script.js`(953줄), `images/` 15개 파일, `audio/bgm.mp3`
> 이 리포트는 같은 날 앞서 작성한 리포트(개나리 컨셉 전환 직후, 예시 이름·서울 예식장·14시 기준)를 대체한다.

## 요약

- **전체 결과: PASS** (FAIL 0건). 하객에게 나가는 정보(이름·함자·서열·일시·장소·주소·계좌·교통편)는 모두 컨셉 시트·카피와 일치한다.
- 지난 리포트의 WARNING 가운데 하객이 가장 먼저 보게 되는 **짧은 화면에서 히어로 문구와 개나리 가지가 겹치는 문제는 QA가 직접 고쳤다**(style.css:1300-1305).
- 카테고리별 (PASS / FAIL / WARNING):

| 카테고리 | PASS | FAIL | WARNING |
|----------|------|------|---------|
| 1. 정보 정합성 | 30 | 0 | 4 |
| 2. 모바일 반응형 | 9 | 0 | 2 (1건 직접 수정함) |
| 3. 접근성 | 13 | 0 | 4 |
| 4. 인터랙션 | 14 | 0 | 3 |
| 5. 모션 명세 구현도 | 28 | 0 | 5 |
| 6. 배포 준비 / 공개 전 점검 | 10 | 0 | 3 |

- 회귀: 없음. 지난 리포트에서 직접 고친 세 곳(반전 코너 origin, `.bus-green` 대비, 스크롤 인디케이터 중앙 정렬)은 그대로 유지돼 있다. `.bus-green`은 지금 버스 태그 하나의 올리브 색으로 통일돼 해당 클래스가 없다. 지금 쓰는 태그 대비는 크림 글자 / #5F6B2C = 5.60:1.

### 실행한 자동 검증 (출력 요약)

```
예시 이름 잔재  grep 김민준|박서연|민준|서연|김재현|이수진|박정훈|최은영|장녀|Minjun|Seoyeon  (index/style/script) → 0건
시간 잔재      grep 오후|14:00|2:00 PM|\b14\b  → 0건. 나온 것은 SVG width="14"와 파티클 size 14(오탐)뿐
이전 예식장    grep 인터컨티넨탈|파르나스|그랜드볼룸|테헤란|삼성중앙|tmap|강남구  → 0건 ("const mapCard"의 "t map" 오탐 1건)
삭제 자산      grep gallery-placeholder|rsvp  (index/style/script) → 0건, /images/gallery-placeholder-1.png → 404 (참조 없음)
계좌 6개       화면 번호에서 \D 제거 == data-copy : 6/6 True, aria-label "{관계} {이름} 계좌번호 복사" 6/6, 카피 account_info 원문 포함 6/6
갤러리 순서    파일 [3,4,9,7,8,10,11,5,6,2,1], aria-label [1..11], loading eager 1장 + lazy 10장
갤러리 alt     11/11이 매니페스트 "사용자 제공 자산" 표와 정확히 같음
이미지 실측    gallery-01 1280x1600, 02 1150, 03 1178, 04 1191, 05 1125, 06 1124, 07 1177, 08 1205, 09 1204, 10 1191, 11 1188 (x1600),
               venue-map 1122x838, hero 1024x1280, divider 1536x512, corner 1024x1024, og 1536x800  → HTML width/height와 전부 일치
JPEG 메타데이터 11장 모두 APP0(JFIF)만 있고 EXIF/GPS 없음. PNG에 tEXt/iTXt/eXIf 청크 없음
HTTP 상태      index/style/script/bgm.mp3/이미지 15종 + og-thumbnail → 전부 200. 브라우저 네트워크 로그에 4xx 없음
               (bgm.mp3 206 ERR_ABORTED는 preload="metadata"의 정상 중단)
날짜           new Date('2027-04-17').getDay()=6(토), 2027-04-01=4(목), 4월 30일, D-147 (2026-11-21 기준)
node --check script.js → OK / HTML 태그 균형 → 닫히지 않은 태그 0, 짝 불일치 0 / 중복 id 0 / alt 없는 img 0 (18개 중)
heading        h1 1 → h2 8 → h3 5 / 섹션 순서 hero, greeting, couple, calendar, gallery, venue, account, guestbook, share
headless Chrome --force-prefers-reduced-motion → #dday-num "147" 즉시, 8개 .reveal 전부 is-visible
headless Chrome 일반 → #dday-num "0" (data-target 147, 섹션 진입 시 카운트업)
motion 토큰    명세 --ease-*/--dur-* 목록 vs style.css :root → diff 없음
보안           .env → `git check-ignore -v` = .gitignore:3 (제외됨). 커밋 대상(추적+미추적, ignore 제외) 텍스트·바이너리에서
               sk-…, sk-proj, Bearer, AKIA, ghp_, AIza, api_key="…" 패턴 → 0건. OPENAI_API_KEY 문자열은
               generate_image.py:122,168의 오류 안내 문구뿐이고 .env.example은 값이 빈 칸
```

---

## 1. 정보 정합성

| 항목 | 컨셉시트 / 카피 값 | HTML / JS | 결과 |
|------|------------|---------|------|
| 신랑 이름 | 서주완 | index.html:73, 114, 333 / aria 335 | PASS |
| 신부 이름 | 최윤경 | index.html:75, 122, 369 / aria 371 | PASS |
| 신랑 부모 · 서열 | 서정표 · 이순영 의 장남 | index.html:113 | PASS |
| 신부 부모 · 서열 | 최상덕 · 김순옥 의 차녀 | index.html:121 | PASS |
| 영문 이름 | 삭제 (사용자 요청) | 없음 | PASS |
| `<title>` | 주완 ♡ 윤경 — 2027.04.17 결혼합니다 | index.html:7 | PASS |
| meta description | 카피 meta_description | index.html:9 (완전 일치, "오전 11시") | PASS |
| og:title / twitter:title | 서주완 ♡ 최윤경 결혼합니다 | index.html:13, 21 | PASS |
| og:description / twitter:description | 2027년 4월 17일 토요일 오전 11시 · 파티움하우스 수원 2층 그레이스켈리홀 | index.html:14, 22 | PASS |
| 히어로 Save the Date | 04 . 17 . 2027 | index.html:71 | PASS |
| 히어로 일시 · 장소 | 2027년 4월 17일 토요일 오전 11시 / 파티움하우스 수원 2층 그레이스켈리홀 | index.html:78-79 | PASS |
| 달력 헤드라인 | 2027년 4월 17일 토요일 / 오전 11시 | index.html:135-136 | PASS |
| 달력 data-target / aria-label / caption | 2027-04-17 / 2027년 4월 캘린더 / APRIL 2027 | index.html:139-140 | PASS |
| 달력 렌더 | 4/1 목요일 시작, 5줄, 17일 토요일 강조 | 실측: 첫 줄 빈칸 4 + 1·2·3, 17 = `class="today sat"` | PASS |
| D-day 라벨 | 주완 · 윤경의 결혼식까지 | index.html:150 | PASS |
| D-day 보조 캡션 | 오전 11시 / 파티움하우스 수원 2층 그레이스켈리홀 | index.html:152 | PASS |
| D-day 값 | 2026-11-21 기준 D-147 | 실측 data-target 147 | PASS |
| 예식장 / 홀 | 파티움하우스 수원 / 2층 그레이스켈리홀 | index.html:220-221 | PASS |
| 도로명 / 지번 | 경기 수원시 팔달구 효원로 289 / 인계동 1124-5번지 | index.html:222-223, 242 | PASS |
| 주소 복사 값 | 도로명 주소 문자열 그대로 | index.html:236 `data-copy-text`, script.js:770-779 (숫자 필터 없음) | PASS |
| 지도 버튼 | 카카오맵 / 네이버지도 / 주소 복사 (T map 제거) | index.html:234-236. 검색어 디코드 결과 "파티움하우스 수원" | PASS |
| 오시는 길 순서 | 자가용 → 주차 → 지하철 → 시내버스 → 시외버스 | index.html:240-313 | PASS |
| 자가용 · 주차 · 지하철 | 카피 directions | 문구 일치 ("10번출구"를 "10번 출구"로 띄어 쓴 것만 다름) | PASS |
| 시내버스 4개 노선 | 13-1·92-1 / 51 / 80·81 / 81, 하차 정류장·출구 9·1·1·10번 | index.html:255-274, 노선·정류장·출구 번호 누락·오타 없음 | PASS |
| 시외버스 6개 노선 | 3007·3002 / 7000·7001 / M5342 / 4000 | index.html:280-311, 환승 노선(81·61번)·출구(7·4·8·10번) 일치 | PASS |
| 계좌 6개 (은행·번호·예금주) | 카피 account_info | index.html:333-386, 스크립트 검증 6/6 | PASS |
| 예금주 = 부모 함자 | 서정표·이순영 / 최상덕·김순옥 | index.html:347, 355, 377, 385 | PASS |
| 푸터 | 2027 . 04 . 17 / 주완 & 윤경 | index.html:426-427 | PASS |
| SHARE_TITLE / SHARE_DESC | 카피 kakao_share | script.js:14-15 (줄바꿈 구분까지 일치) | PASS |
| 컬러 7종 `:root` · theme-color | 컨셉 palette | style.css:10-16, index.html:6 | PASS |
| `TARGET_HOUR = 11` | 오전 11시 | script.js:18. **어디에서도 읽지 않는 상수**. D-day는 자정 기준 일수(script.js:399-404)라 11시 변경의 영향을 받지 않고 결과도 맞다. 당일은 하루 종일 "오늘" 문구 | **WARNING** (죽은 상수. 지우거나 "참고용" 주석을 달면 다음 사람이 헷갈리지 않는다) |
| 컨셉 시트 본문 | — | 01의 sections_order "갤러리 (5장 스와이프…)", defaults_applied "갤러리 사진 5장 placeholder", 프론트엔드·QA 가이드의 "RSVP 폼", "이미지 9장"이 지금 상태(11장, RSVP 제거)와 다르다 | **WARNING** (문서만 낡음. 페이지에는 영향 없음. 01은 QA 수정 금지 범위라 concept-director가 갱신) |
| 05 요약 제목 | — | `_workspace/05_frontend-developer_summary.md:1` 제목이 아직 "김민준 ♡ 박서연 청첩장". 공개 저장소에 그대로 올라간다 | **WARNING** (frontend-developer가 고치면 됨) |
| D+ 문구 (예식 후) | 카피: "함께 걸어가는 {n}번째 날" | script.js:417 "함께 걸어가는 날 +" | **WARNING** (이전 판부터. 예식 다음 날부터만 보인다) |

---

## 2. 모바일 반응형

| 항목 | 결과 | 근거 |
|------|------|------|
| viewport 메타 | PASS | index.html:5 |
| 가로 스크롤 320 / 375 / 414 | PASS | 실측 scrollWidth = 뷰포트 폭 (320, 375, 414). 아코디언 2개를 연 상태에서 main 하위 요소가 뷰포트 밖으로 나가는 것 0건 (갤러리 트랙의 화면 밖 슬라이드는 stage overflow로 잘림, 정상) |
| 글자 잘림 | PASS | 320px에서 `p, dd, dt, li, h3, .btn, .copy-btn, .bus-tag, summary` 중 scrollWidth > clientWidth 0건 |
| 계좌 줄 | PASS | 320px에서 가장 긴 "새마을금고 9002-1395-8968-1", "NH농협은행 302-1980-1732-61"도 한 줄, 복사 버튼과 겹치지 않음 |
| 달력 | PASS | 320px에서 표 28~292px, 숫자 16px, 넘침 없음 |
| 오시는 길 (긴 버스 안내) | PASS | 320px 스크린샷 확인. 태그 옆 dd가 자연스럽게 줄바꿈되고 카드 밖으로 나가지 않음 |
| 글자 크기 조정 반영 | PASS | 실측 `.parents` 16px, 달력 숫자 16px, `.hero-info` 16px |
| 히어로 일시·장소 줄 | PASS | `.nowrap` 두 덩어리로 나뉘어 320px에서도 한 줄. 스크롤 인디케이터와의 간격 375×667 28px, 414×736 36px, 320×568 20px, 375×812 겹침 없음 |
| 짧은 화면에서 히어로 문구와 개나리 가지가 겹침 (지난 WARNING) | **WARNING → 직접 수정함** | 수정 전 375×667: "We're getting married"(top 177) · SAVE THE DATE · 날짜가 가지·꽃(이미지 위쪽 약 40%, ~267px) 위에 걸림. 414×736도 같은 현상. → style.css:1300-1305에 `@media (max-height: 760px) { .hero-content { padding-bottom: max(12vh, 72px); } .hero-savedate, .hero-names { margin-bottom: 18px; } }` 추가. 수정 후 375×667 eyebrow top 254, 414×736 315, 1280×720 293. 스크린샷에서 문구가 가지 아래 크림 여백에 놓인다. 높이 760px 넘는 화면(375×812 등)은 그대로 |
| 아주 짧은 화면 (≤600px, iPhone SE 1세대 320×568) | **WARNING** (남음) | 최소 패딩 72px로도 eyebrow top 175라 가지 끝과 조금 겹친다. 글자는 일러스트 위 레이어라 읽을 수는 있다. 더 고치려면 `.hero-eyebrow`, `.hero-savedate`에 `text-shadow: 0 0 8px #FFFBF1` 크림 헤일로를 주는 디자인 판단이 필요해 적용하지 않음 |

---

## 3. 접근성

| 항목 | 결과 | 근거 |
|------|------|------|
| `<html lang="ko">` | PASS | index.html:2 |
| 모든 `<img>` alt | PASS | 18개 모두 alt 있음. 장식(디바이더·코너)은 `aria-hidden="true"`, lightbox 이미지는 열 때 원본 alt 복사 |
| alt ↔ 매니페스트 | PASS | 갤러리 11 + 약도 1 + 생성 이미지 4종 모두 일치 |
| heading 계층 | PASS | h1 1(히어로 이름) → h2 8 → h3 5(오시는 길) |
| 시멘틱 | PASS | main / section 9 / article / footer / figure+figcaption(약도) |
| 갤러리 carousel role, 슬라이드 aria-label "사진 n / 11", 비활성 슬라이드 aria-hidden | PASS | index.html:166-200, script.js:489-491 |
| 약도 카드 `role="button" tabindex="0"` + Enter/Space | PASS | index.html:227, script.js:716-721, 실측 Enter·Space 모두 열림 |
| lightbox role=dialog, aria-modal, 열 때 포커스 닫기 버튼, Tab 트랩, Esc | PASS | 실측 activeElement=lightbox-close, Esc 후 포커스 #venue-map 복귀 |
| lightbox aria-label 구분 | PASS | 약도 "약도 확대 보기", 갤러리 "사진 확대 보기" (실측) |
| 토스트 role=status / D-day aria-live + aria-busy | PASS | index.html:440, 149 / script.js:437-444 |
| 노랑·연두가 글자색으로 쓰인 곳 | PASS | `color:` 선언에서 0건 (이전 검증과 같고, 이번 변경에 색 변경 없음) |
| 대비 (주요 쌍) | PASS | text/bg 12.45, muted/bg 5.39, muted/surface 4.95, accent/bg 5.60, 크림 글자/accent 버튼·버스 태그 5.60 (실측 computed rgb(255,251,241) on rgb(95,107,44)) |
| 캔버스·정적 장식 aria-hidden | PASS | index.html:47, 50 |
| 갤러리 사진을 키보드로 확대 | **WARNING** | stage는 ←/→로 넘길 수 있지만 슬라이드 `img`에 포커스·Enter 처리가 없어 키보드만으로는 lightbox를 열 수 없다. 제안: script.js:540-546에서 현재 슬라이드에 대해 stage `keydown` Enter → `openLightbox(idx)` 추가 |
| 약도의 접근 가능한 이름 | **WARNING** (경미) | `aria-label="약도 크게 보기"`가 안쪽 img alt(역 출구·주차 정보)를 덮는다. 같은 정보가 아래 오시는 길 본문에 있어 정보 손실은 없다 |
| 보조 `.btn` 테두리 연두 1.78:1 (지난 WARNING) | **WARNING** (그대로) | style.css:1124. 카카오맵·네이버지도·주소 복사·방명록·링크 복사 버튼 테두리가 크림 위에서 흐리다. 글자로 버튼임을 알 수 있어 WCAG 1.4.11 위반은 아님. 제안 `border-color: rgba(95,107,44,.35)` |
| 꽃잎이 muted 글자 뒤를 지날 때 3.47:1 (지난 WARNING) | **WARNING** (그대로) | script.js:108 `#E8B21E` 가중치 .2. 1~2초 스쳐 가는 순간 한정 |

---

## 4. 인터랙션

| 항목 | 결과 | 근거 |
|------|------|------|
| D-day 계산 · 당일 · D+ 분기 | PASS | script.js:399-419, 자정 기준 정수 일수 |
| 카운트업 1200ms, reduced 즉시 값 | PASS | headless 일반 "0" / reduced "147" |
| 계좌 복사 | PASS (코드) | `data-copy` → `\D` 제거 → `navigator.clipboard.writeText` → 실패 시 textarea + `execCommand('copy')` → 실패 토스트 (script.js:733-767) |
| 주소 복사 | PASS (코드) | `data-copy-text` 문자열 그대로, "주소가 복사되었습니다" 토스트 |
| 갤러리 점 11개 + "n / 11" 카운터 | PASS | 실측 dots 11, total "11". 점은 DOM 슬라이드 수로 생성 (script.js:467-472) |
| 갤러리 스와이프·화살표·키보드·자동 슬라이드(5s, viewport 게이팅, 조작 후 10s 정지) | PASS (코드) | script.js:483-562 |
| 갤러리 → lightbox, ←/→ 이동, 처음·끝 순환 | PASS (실측) | 3번째 슬라이드 클릭 → gallery-09.jpg, → 07(카운터 4), ← 3번 → 03(카운터 1) |
| 약도 → lightbox 단독 | PASS (실측) | 클릭·Enter·Space로 venue-map.png만 열림. 열린 상태에서 ←/→ 눌러도 약도 그대로이고 갤러리 카운터도 바뀌지 않음. 갤러리를 연 뒤 약도를 열어도 "약도 확대 보기"로 정확히 바뀜 |
| lightbox 닫기 (Esc / 닫기 버튼 / 배경 클릭) · 포커스 복귀 · body overflow 복구 | PASS (실측) | 세 방법 모두 닫힘, 포커스 #venue-map 복귀, overflow "" |
| 핀치 줌(1~3) / 더블탭 2.5 / 팬 / 아래로 100px 스와이프 닫기 | PASS (코드) | script.js:650-708, 약도도 같은 로직 공유 |
| 음악 토글 | PASS (코드) | 클릭 시 play, aria-pressed/label 갱신, 페이드, 실패 토스트. audio/bgm.mp3 200 |
| 카카오 공유 / Web Share / 링크 복사 폴백 | PASS (코드) | KAKAO_JS_KEY 비어 있으면 SDK 건너뜀 → Web Share → 복사 |
| 방명록 placeholder | PASS | GUESTBOOK_URL 비어 있으면 "방명록은 준비 중입니다" 토스트, `href="#"` 이동 막음 |
| og 메타 ↔ 카피 | PASS | 1절 참고 |
| 음악 자동재생 시도 (명세 3-6) | **WARNING** (그대로) | 클릭으로만 재생. 브라우저 정책상 지금 방식이 더 안전하므로 명세 쪽을 고치는 것을 권장 |
| 스와이프 속도 임계 / 핀치 중점 origin / lightbox exit scale | **WARNING** (그대로) | 명세 세부가 빠졌지만 동작에는 문제 없음 |
| `navigator.vibrate` 콘솔 오류 | **WARNING** (경미) | 사용자 탭 전에 호출하면 Chrome이 "Blocked call to navigator.vibrate" 오류를 콘솔에 남긴다(이번에는 합성 이벤트로 테스트해서 발생). 실제 탭에서는 생기지 않고 try/catch로 감싸 있어 동작 영향 없음 |

---

## 5. 모션 명세 구현도

지난 리포트의 명세-구현 매핑 표(27 PASS)를 기준으로 바뀐 셀만 다시 확인했다. 이번 변경(이름·시간·예식장·갤러리·약도·RSVP 제거)은 모션 코드를 건드리지 않았다.

| 항목 | 명세 (04) | 구현 | 결과 |
|------|------|------|------|
| --ease-* / --dur-* 토큰 | 명세 §5 | style.css:31-48, diff 없음 | PASS |
| 꽃잎 파티클 CFG (비율·색·크기·opacity·통과 15~25s·살랑임·돌풍·개수 12/16/18/20·DPR) | §1-A | script.js:105-123, 260-275 (지난 판과 같음) | PASS |
| visibilitychange / lightbox 시 정지 | Must | script.js:359-362, 613, 624. 약도 lightbox도 같은 `show()`를 거쳐 정지 | PASS |
| 1-0 레이어 (캔버스 z0, pointer-events none, 섹션 투명 z1) | §1-0 | 지난 실측과 같음, CSS 변경 없음 | PASS |
| 2-1 히어로 step-in 7단계 | §2-1 | style.css:363-369 | PASS (짧은 화면 수정은 패딩·마진만 바꿔 타이밍 영향 없음) |
| 2-5 갤러리 첫 슬라이드 900ms·1.02·blur 4 | §2-5 | `.gallery-slide:first-child` → gallery-03.jpg에 적용 | PASS |
| 2-6 공통 stagger (venue/account/guestbook/share) | §2-6 | script.js:60. `.rsvp` 선택자 제거 확인 | PASS |
| 3-12 가지 살랑임 + 반전 코너 | Nice | style.css 지난 수정(top center) 유지 | PASS |
| reduced-motion 글로벌 분기 | 모든 무한 루프 | style.css:1315-1341: 메시·ken-burns·가지·스크롤 bounce·이퀄라이저·펄스 `animation:none`, 파티클은 JS 미생성 + 캔버스 숨김 + 정적 장식 표시, reveal 즉시 | PASS |
| 갤러리 점 width 트랜지션 | 명세 3-2가 직접 지시 vs layout 속성 금지 | style.css:757 `transition: width 300ms` | **WARNING** (그대로. 점이 5개에서 11개가 됐지만 8px 요소라 비용은 무시할 만함) |
| 3-10 모서리 패럴랙스 (Nice) | — | 미구현 | **WARNING** (그대로) |
| 공통 threshold 0.15~0.3 | — | 0.18 일괄 | **WARNING** (그대로) |
| 버튼 hover scale / 카드 hover lift | §4 | 미구현 | **WARNING** (그대로, 데스크톱 전용) |
| 디바이더·코너 이미지 가장자리 패치 | — | style.css:193-194, 525-526 마스크가 박스 안에서 완전히 투명해지지 않아 옅은 패치·세로 경계가 남음 | **WARNING** (그대로) |

---

## 6. 배포 준비 / 공개 전 점검

| 항목 | 결과 | 근거 |
|------|------|------|
| `.env` 제외 | PASS | `git check-ignore -v .env` → `.gitignore:3:.env`. `.env` 파일은 열지 않음 |
| 커밋 대상에 API 키 | PASS | `git ls-files -co --exclude-standard` 전체(이미지·mp3 포함)에서 키 패턴 0건. `.env.example`은 `OPENAI_API_KEY=` 빈 값 |
| 사진 위치 정보 | PASS | gallery-01~11.jpg 모두 EXIF 세그먼트 없음 (매니페스트 152행 "EXIF 제거"와 일치). PNG 텍스트 청크 없음 |
| `.nojekyll` | PASS | 저장소 루트에 있음 (0 byte) |
| 하위 경로 `/wedding-letter/` 호환 | PASS | index.html/style.css에 `/`로 시작하는 자산 경로 0건, CSS `url()` 외부 자산 없음. SHARE_IMAGE는 `location.pathname` 기준으로 계산(script.js:16) |
| 외부 리소스 HTTPS | PASS | Google Fonts, jsdelivr Pretendard, (주석) Kakao SDK 모두 https. `http://` 0건 |
| 깨진 이미지 · 404 | PASS | 15종 이미지 + og-thumbnail 200, 브라우저 네트워크 로그 4xx 0건 |
| og 메타 구성 | PASS | og:type/title/description/image(+1536×800 실측 일치)/url/locale, twitter 4종 |
| 갤러리 용량 | PASS | JPEG 133~302KB, 11장 합계 약 2.2MB. 첫 장만 eager |
| placeholder 표시 | PASS | KAKAO_JS_KEY·GUESTBOOK_URL 주석 표기(script.js:12-13, index.html:406, 442) |
| og:image / twitter:image 상대 경로 | **WARNING** | index.html:15, 23 `images/og-thumbnail.png`. 카카오톡·문자 미리보기는 절대 URL이 필요해 지금은 이미지가 안 뜰 수 있다. 아래 "사용자가 채울 항목" 참고 (배포 주소 확정 전이라 고치지 않음) |
| README 데모 주소 | **WARNING** | README.md:5 `https://revfactory.github.io/wedding-letter/`. 실제 배포 계정 주소와 다를 수 있다. 사용자가 확인할 것 |
| 히어로·OG PNG 용량 | **WARNING** (경미) | hero-illustration.png 1.6MB(첫 화면 fetchpriority high), og-thumbnail.png 1.4MB. 모바일 데이터에서 첫 화면이 늦게 뜰 수 있다. 원하면 WebP/JPEG로 변환(images/는 QA 수정 금지 범위라 제안만) |

### 사용자가 채울 항목 (FAIL 아님)

| 항목 | 위치 | 비고 |
|------|------|------|
| og:url | index.html:18 | 예: `https://joowop.github.io/wedding-letter/` (배포 주소 확정 후) |
| og:image, twitter:image 절대 URL | index.html:15, 23 | 예: `https://joowop.github.io/wedding-letter/images/og-thumbnail.png`. 카카오 디벨로퍼스에 사이트 도메인 등록 필요 |
| KAKAO_JS_KEY + SDK `<script>` 주석 해제 | script.js:12, index.html:443 | 비어 있으면 Web Share / 링크 복사로 폴백 |
| GUESTBOOK_URL | script.js:13 | 비어 있으면 "방명록은 준비 중입니다" 토스트 |
| README 데모 주소 | README.md:5 | 실제 GitHub Pages 주소로 |

---

## 발견된 이슈와 수정 제안

### 직접 수정함
- [x] **style.css:1300-1305** (WARNING, 하객 체감) 높이 760px 이하 화면에서 히어로 문구가 개나리 가지 위에 겹침 → `@media (max-height: 760px)`로 `.hero-content` padding-bottom `max(12vh, 72px)`, `.hero-savedate`/`.hero-names` margin-bottom 18px. 375×667, 414×736, 320×568, 1280×720에서 문구 위치와 스크롤 인디케이터 간격을 실측하고 스크린샷으로 확인함.

### 제안 (사용자 정보·구조·디자인 판단이 필요하거나 수정 금지 파일이라 적용하지 않음)
- [ ] script.js:18 — `TARGET_HOUR` 미사용 → 지우거나 "참고용(D-day는 일 단위)" 주석.
- [ ] script.js:540-553 — 키보드로 갤러리 사진 확대 불가 → stage `keydown`에 Enter/Space → `openLightbox(idx)`.
- [ ] style.css:1124 — 보조 버튼 테두리 `rgba(95,107,44,.35)`.
- [ ] style.css:193-194, 525-526 — 디바이더·코너 마스크를 박스 안에서 완전히 투명해지도록.
- [ ] 320×568처럼 아주 짧은 화면 — `.hero-eyebrow`, `.hero-savedate`에 크림 text-shadow 헤일로 검토.
- [ ] script.js:417 — 예식 후 문구를 카피 "함께 걸어가는 {n}번째 날"에 맞출지 결정.
- [ ] `_workspace/01` — 갤러리 5장·RSVP·이미지 9장 서술 갱신 (concept-director).
- [ ] `_workspace/03` 요약 표 4~8행 — gallery-placeholder-1~5.png를 "삭제됨(실사진으로 대체)"으로 표시 (image-artist). 지금은 "성공"으로만 적혀 있어 현재도 쓰는 것처럼 읽힌다.
- [ ] `_workspace/05:1` — 제목의 예시 이름 "김민준 ♡ 박서연"을 실제 이름으로 (frontend-developer).
- [ ] images/hero-illustration.png, og-thumbnail.png — 용량 축소 검토.

## 검증하지 못한 것
- 실제 iOS/Android 기기의 터치(스와이프, 핀치 줌, 아래로 스와이프 닫기)와 햅틱.
- 실제 클립보드 복사: 미리보기 창에서 진짜 사용자 제스처를 만들 수 없어 코드 검토로 대신함.
- 카카오톡·문자 링크 미리보기: og:url·절대 og:image·카카오 키가 아직 없음.
- GitHub Pages 실제 배포 URL에서의 동작: 로컬 서버 루트(`/`)에서만 확인했다. 하위 경로 호환은 상대 경로 정적 점검으로 판단함.
- 외부 지도 링크(카카오맵·네이버지도)가 실제로 파티움하우스 수원을 첫 결과로 보여 주는지: 외부 사이트라 열어 보지 않음 (URL의 검색어만 확인).
- 60fps 실측: 미리보기 창이 자주 백그라운드 상태여서 측정할 수 없었다.
