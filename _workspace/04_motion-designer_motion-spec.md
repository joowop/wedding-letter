---
motion_mood: "romantic-lush (light) × botanical-soft"   # mood_keywords 첫 키워드 "spring breeze" → 봄/화사 계열. 단 '가볍고 산뜻하게'로 밀도는 balanced
density: "balanced"                                      # 파티클 12~20개, opacity는 이전보다 높지만 개수는 적게
performance_budget:
  particles_max: 20                                      # 동시 활성 파티클 절대 상한 (화면 폭 ≥1024px)
  particles_mobile: "12~18 (화면 폭 기준 자동 결정, 저사양 12)"
  particles_min_reduced: 0                               # prefers-reduced-motion 시 0개 (canvas 미생성)
  fps_target: 60
  fps_min: 50                                            # 5초 측정 후 미달 시 count ×0.6 (최소 8), 재측정 40 미만 시 canvas OFF
  dpr_max: 2                                             # 저사양·saveData 시 1.5 / FPS 강등 시 1
  cpu_budget: "≤2% (idle 모바일 기준)"
  reduced_motion_strategy: "static-only (canvas OFF + 정적 개나리 SVG 4개, mesh 정지, fade-in 즉시 표시)"
  paint_safe_props: ["transform", "opacity", "filter (단발·소면적만)"]
  forbidden_props: ["width", "height", "top", "left", "margin", "padding (animated)"]
concept_alignment:
  - "spring breeze → 좌우 살랑임(사인파) + 팔랑임(뒤집힘) + 8~15초마다 약한 돌풍"
  - "fresh & bright → 개나리 노랑 3톤 + 연두 잎 조각, opacity 0.35~0.7 (이전 0.18~0.32보다 또렷)"
  - "light botanical → 낱장 꽃잎 70% / 네 갈래 꽃 20% / 잎 10%, 워터컬러 blur-reveal 유지"
  - "가볍고 산뜻하게 → 트랜지션 500~700ms ease-out, stagger 80~120ms (이전 600~900ms보다 한 박자 경쾌)"
---

# Motion Specification — "봄바람에 살랑이는 개나리의 약속"

> **Frontend-developer 가이드**: 본 명세의 모든 수치는 그대로 구현 대상. 문서 구조·항목 ID·Must/Should/Nice 분류는 이전(가을 장미) 명세와 동일하며, **바로 아래 "0. 이전 명세 대비 변경점" 표만 보고 수정 범위를 파악**할 수 있게 정리했다. CSS 변수 토큰(섹션 5)을 먼저 갱신하고, 각 모션은 해당 토큰을 참조. 모든 무한 루프 모션은 `@media (prefers-reduced-motion: reduce)` 분기 필수.

---

## 0. 이전 명세 대비 변경점 (프론트엔드 작업 목록)

구분: **[신규]** = 새로 구현해야 하는 로직/마크업 · **[값]** = 기존 코드에서 숫자·색만 교체 · **[유지]** = 변경 없음

| ID | 항목 | 이전 값 | 새 값 | 구분 |
|----|------|---------|-------|------|
| 1-0 | 배경 레이어 구조 | canvas `z-index:1` 이 `.card`(z2, 불투명 배경) **뒤** → 모바일(폭<480px)에서 파티클·메시가 **전혀 보이지 않음** | canvas·정적장식·메시를 `.card` 내부로 이동, 섹션 배경 투명화 → "카드 배경 위 · 본문 아래" (§1-0) | **[신규]** |
| 1-A | 파티클 종류 | ellipse 단일 | 꽃잎 낱장 70% / 네 갈래 꽃 20% / 연두 잎 10% (Path2D, §1-A-3) | **[신규]** |
| 1-A | 개수 | 24 고정 | 폭 기준 12 / 16 / 18 / 20 (최대 20), 저사양 12 | [값]+[신규 로직] |
| 1-A | 색 | `#C9A2A2` 70% + `#A8B59C` 30% | 노랑 `#F2C230` / `#F7D561` / `#E8B21E` + 연두 `#B4C77A` / `#C5D48F` | [값] |
| 1-A | 크기 | 8~16px | 꽃잎 10~18 / 꽃 지름 14~22 / 잎 10~16px (깊이 z에 연동) | [값] |
| 1-A | opacity | 0.18~0.32 | 꽃잎 0.35~0.70 / 꽃 0.40~0.70 / 잎 0.35~0.55 (상한 0.70) | [값] |
| 1-A | 낙하 | 14~22s, t-기반 위치 | 화면 통과 **15~25s** (근경 15 ↔ 원경 25), **dt-기반 적분** | [값]+[신규] |
| 1-A | 좌우 흔들림 | 진폭 20~40px, 주기 ≈6.3s 고정 | 진폭 **20~50px**, 주기 **3~6s** 개별 랜덤 + 흔들림 방향으로 기울기(lean ±0.35rad) | [값]+[신규] |
| 1-A | 회전 | ±0.015 rad/frame | 꽃잎 ±0.3~0.9 / 꽃 ±0.1~0.4 / 잎 ±0.2~0.6 **rad/s** | [값] |
| 1-A | 뒤집힘(팔랑임) | 없음 | `scaleX = cos(flipPhase)`, 1.6~3.2 rad/s, 뒷면 alpha ×0.8 | **[신규]** |
| 1-A | 바람 | 없음 | 기본 우측 드리프트 10px/s + **8~15s마다 2~3s 돌풍** (최대 +45px/s, 회전×1.8, 뒤집힘×1.6, 낙하×0.85) | **[신규]** |
| 1-A | 화면 밖 처리 | y만 리셋 | 좌우 랩어라운드 + 재생성 시 x를 바람 상류(−15%W)로 바이어스 | **[신규]** |
| 1-A | 일시정지 | RAF 유지 + draw 생략 | `cancelAnimationFrame` + 복귀 시 `last` 재설정, lightbox 열림 시도 정지 | [신규] |
| 1-A | 저사양 | 5s 후 fps<50 → 12개 | fps<50 → count×0.6(최소 8)+DPR 1, 재측정 <40 → canvas OFF·정적장식 | [신규] |
| 1-A | resize | 매번 canvas 재할당 | 폭 변화 시에만 재할당(모바일 주소창 높이 변화 무시), 150ms debounce | [신규] |
| 1-A | reduced-motion 정적 장식 | 장밋빛/세이지 ellipse 4개, opacity 0.4 | 개나리 꽃잎 2 + 네 갈래 꽃 1 + 연두 잎 1, opacity 0.55 (SVG 마크업 §1-A-7) | [값] (index.html SVG 교체) |
| 1-B | 그라디언트 메시 색 | rose/sage/rosewood rgba | 노랑 0.16 / 연두 0.14 / 버터 0.12 / 노랑 0.10 | [값] |
| 1-B | 메시 루프 | 60s | **45s** | [값] |
| 1-B | 메시 위치 | `body::before` (모바일에서 가려짐) | `.card::before` fixed, `z-index:-2` (§1-0). `body::before`는 데스크톱 바깥 영역용으로 유지 가능 | [신규] |
| 2-1 | Hero 시퀀스 | 200~2300ms, 각 800ms, 일러스트 1200ms blur 6px | 150~1750ms, 각 **600ms**, 일러스트 **1000ms blur 4px** | [값] |
| 2-2 | Greeting | 900ms, stagger 150ms | **700ms**, stagger **120ms** | [값] |
| 2-3 | Couple | 700ms / delay 150, 350 | **600ms** / delay **120, 300** | [값] |
| 2-4 | Calendar 펄스 | primary(rose) α 0.4↔0.7, 1.6s, scale 1.15 | primary(**노랑**) α **0.35↔0.6**, **1.4s**, scale **1.12**, 셀 숫자는 `--color-text` | [값] |
| 2-4/3-1 | D-day 카운트업 | 1400ms, 숫자색 `#8B5A5A` | **1200ms**, 숫자색 **`#5F6B2C`**(accent) + (Nice) 종료 시 flip 1회 | [값] (+Nice 신규) |
| 2-5 | 갤러리 첫 슬라이드 | 1100ms, scale 1.03 | **900ms**, scale **1.02**, blur 4px 유지 | [값] |
| 2-6 | 공통 섹션 reveal | 700ms, stagger 100ms | **600ms**, stagger **80ms** | [값] |
| 3-3 | 계좌 복사 | 토스트 `#F2EAE2`/`#3A2E2A`, sage 체크 | 토스트 **`#FBF1D6`/`#3B3022`**, 체크 **`#5F6B2C`**(accent) | [값] |
| 3-5 | Lightbox 배경 | `rgba(58,46,42,.92)` | **`rgba(59,48,34,.92)`** | [값] |
| 3-6 | 음악 토글 | 정지 아이콘 sage, 배경 `#FBF7F3` 80%, ripple rosewood α.4 | 아이콘 **accent `#5F6B2C`**, 배경 **`rgba(255,251,241,.8)`**, ripple **노랑 `rgba(242,194,48,.45)`**, 테두리 `rgba(242,194,48,.6)` | [값] |
| 3-12 | 코너 개나리 가지 살랑임 | 없음 | rotate ±1.2deg, 6s ease-in-out 무한 (Nice) | **[신규]** (Nice) |
| 4 | 마이크로 인터랙션 색 | rose/sage 계열 rgba | 노랑/연두/올리브 계열 rgba (§4 표) | [값] |
| 5 | 토큰 | `--dur-mid .6 / --dur-slow .9 / --dur-xslow 1.4 / --dur-bg-mesh 60 / --dur-bg-petal 18 / --dur-pulse 1.6 / --dur-ken-burns 18 / --stagger .1 · .15` | `.5 / .7 / 1.2 / 45 / 20 / 1.4 / 16 / .08 · .12` + `--dur-branch-sway 6s` 추가 | [값] |
| 3-1,3-2,3-4,3-7,3-8,3-9,3-10,3-11 | 기타 인터랙션 | — | 동작 구성 동일 (색 참조만 §4 기준) | [유지] |

---

## 1. 애니메이션 배경

본 청첩장은 **두 종류의 배경 모션을 레이어링**한다 (개나리 파티클 + 그라디언트 메시). 두 레이어 모두 `.card` 배경 위 · 본문 아래에 위치해, 글자와 정보 박스는 항상 파티클보다 위에 그려진다.

### 1-0. 레이어 구조 (신규 — 반드시 먼저 적용)

**문제(현 구현)**: `.bg-petals`(z-index 1)가 `body` 직속이고 `.card`(position relative, z-index 2, `background: var(--color-bg)` 불투명)가 그 위를 덮는다. 모바일(폭<480px)에서는 카드가 화면 전체를 덮으므로 **파티클과 메시가 보이지 않는다** (데스크톱에서는 카드 바깥 여백에만 보임).

**해결: 모든 배경 모션을 `.card` 스태킹 컨텍스트 안으로 이동**

`.card` 내부 페인트 순서(아래 → 위):

| 순서 | 레이어 | 선택자 | position / z-index | 비고 |
|------|--------|--------|--------------------|------|
| 0 | 카드 크림 배경 | `.card` | relative / 2 (기존 유지) | `background: var(--color-bg)` = `#FFFBF1` 유지 |
| 1 | 그라디언트 메시 | `.card::before` | fixed, `inset:0` / **-2** | §1-B |
| 2 | 히어로 일러스트 | `.hero-illustration` | **relative / -1** | 불투명 크림 PNG가 파티클을 가리지 않도록 파티클 아래로 내림 |
| 3 | 파티클 캔버스 | `.bg-petals` (`.card` 첫 자식으로 이동) | fixed, `inset:0` / **0** | `pointer-events:none`, `aria-hidden` |
| 3' | 정적 장식(감속 모드) | `.bg-petals-static` (`.card` 안으로 이동) | fixed / **0** | reduced-motion에서만 표시 |
| 4 | 히어로 텍스트 | `.hero-content`, `.scroll-indicator` | absolute / **1** | 이름·날짜는 파티클 위 |
| 4 | 각 섹션 | `.greeting, .couple, .calendar-section, .gallery-section, .venue, .account, .rsvp, .guestbook, .share` | relative / **1** | **섹션 루트 `background: var(--color-bg)` → `transparent`** (카드가 크림 배경 제공) |
| 5 | 카드형 정보 박스 | `var(--color-surface)` 배경 요소들 | 기존 유지 | 불투명 유지 → 계좌번호·주소 위로는 파티클이 지나가지 않음 |
| (카드 밖) | 음악 토글 50 / 토스트 / lightbox | — | 기존 유지 | 파티클보다 항상 위 |

필수 부수 수정:
- `.hero` 의 `contain: layout style` → **`contain: style`** 로 변경 (`contain: layout` 은 스태킹 컨텍스트를 만들어 `.hero-illustration` 의 `z-index:-1` 이 카드 레벨로 내려가지 못함). `.hero` 에 z-index 지정 금지.
- `.hero-frame` 의 `overflow:hidden` 은 유지 (z-index -1 이어도 클리핑 정상 동작).
- `.section` 의 `contain: layout style` 은 유지 (hero 제외). 섹션들은 z-index 1 스태킹 컨텍스트로 통째로 파티클 위에 올라감.
- `.card` 에 `transform` / `filter` / `contain: paint` 를 추가하지 말 것 (fixed 자식이 카드 기준으로 바뀌어 스크롤에 따라 움직임).
- 데스크톱: fixed 캔버스는 뷰포트 전체를 덮으므로 카드 바깥 여백에도 꽃잎이 날린다 (의도된 동작).

**가독성 보장 근거**: 글자는 항상 파티클 위에 그려진다. 꽃잎은 글자 사이 여백으로만 비치며, 최악의 경우(가장 진한 노랑 `#E8B21E` × opacity 0.70 이 크림 배경에 깔린 지점)에도 본문 `#3B3022` 대비 ≈ **8.0:1** (AAA 유지) → opacity 상한 **0.70 을 넘기지 말 것**. muted `#76664A` 캡션은 같은 최악 지점에서 ≈ 3.5:1 까지 내려가지만, 22px 이하 꽃잎이 글자 뒤를 1~2초 스쳐 지나가는 순간에 한정된다. 캡션 가독성을 더 확보하려면 `#E8B21E` 가중치를 20% → 10%로 낮추거나 상한을 0.6으로 낮춘다.

> 대안(비권장): 구조 변경이 불가하면 캔버스를 `.card` 위(z-index 3, 음악 토글 아래)에 오버레이하되 opacity 상한을 **0.45**, 개수를 **12 고정**으로 낮춘다. 글자 위를 지나가므로 1차 선택지가 아님.

---

### 1-A. 개나리 꽃잎 파티클 (Canvas 2D, 1순위)

#### 1-A-1. 기본

| 항목 | 값 |
|------|-----|
| 트리거 | `DOMContentLoaded` → 무한 루프 (탭 비활성·lightbox 열림 시 정지) |
| 구현 방식 | `<canvas class="bg-petals">` fixed 전체 화면, Canvas 2D, `requestAnimationFrame`, **dt(초) 기반 적분** |
| 레이어 | §1-0 표 순서 3 (카드 배경·히어로 일러스트 위, 본문 아래) |
| pointer-events | `none` (탭·스크롤 절대 차단 금지) |
| devicePixelRatio | `min(dpr, 2)` · 저사양/saveData `min(dpr, 1.5)` · FPS 강등 시 1 |
| 접근성 | `aria-hidden="true"`, 장식 전용 |

#### 1-A-2. 파라미터 표

모든 파티클은 생성 시 **깊이 `z ∈ [0,1]`** (uniform random)을 하나 뽑고, 크기·opacity·속도를 z에 연동한다 (`lerp(a,b,z)`). z가 클수록 가깝다 = 크고, 진하고, 빠르다 → 자연스러운 원근감.

| 파라미터 | 꽃잎 낱장 (petal) | 네 갈래 꽃 (flower) | 연두 잎 조각 (leaf) |
|---------|-------------------|---------------------|---------------------|
| 비율 | **70%** | **20%** | **10%** |
| 색 (가중치) | `#F2C230` 50% · `#F7D561` 30% · `#E8B21E` 20% | 꽃잎 색 동일 3톤 / 중심점: 꽃잎이 `#E8B21E`이면 `#F7D561`, 그 외 `#E8B21E` | `#B4C77A` 70% · `#C5D48F` 30% |
| 크기 | 길이 L = lerp(10, 18, z) px | 지름 D = lerp(14, 22, z) px | 길이 L = lerp(10, 16, z) px |
| opacity | lerp(0.35, 0.70, z) | lerp(0.40, 0.70, z) | lerp(0.35, 0.55, z) |
| 화면 통과 시간 | lerp(25, 15, z) s | 동일 | 동일 |
| 좌우 흔들림 진폭 | rand(20, 50) px | rand(20, 40) px | rand(20, 50) px |
| 좌우 흔들림 주기 | rand(3, 6) s | rand(4, 6) s | rand(3, 5) s |
| 흔들림 기울기 (lean) | `cos(swayArg) × 0.35` rad | `× 0.15` rad | `× 0.30` rad |
| 회전 속도 (절대값, 부호 랜덤) | rand(0.3, 0.9) rad/s | rand(0.1, 0.4) rad/s | rand(0.2, 0.6) rad/s |
| 뒤집힘 속도 | rand(1.6, 3.2) rad/s → `scaleX` | rand(0.8, 1.6) rad/s → `scaleY` 0.6~1 (기울어짐만) | rand(1.2, 2.4) rad/s → `scaleX` |
| 뒷면 표현 | `cos<0` 일 때 alpha ×0.8 | 없음 | `cos<0` 일 때 alpha ×0.8 |
| 돌풍 민감도 | lerp(0.7, 1.0, z) | lerp(0.6, 0.9, z) (조금 무거움) | lerp(0.7, 1.0, z) |

**바람 (전역 1개 상태)**

| 파라미터 | 값 |
|---------|-----|
| 기본 드리프트 | `+10 px/s` (우측. 히어로 가지가 우측으로 휘는 방향과 일치) |
| 돌풍 간격 | 이전 돌풍 종료 후 `rand(8, 15)` s |
| 돌풍 지속 | `rand(2, 3)` s |
| 돌풍 곡선 | `env(u) = 0.5 − 0.5·cos(2πu)`, u = 0→1 (부드럽게 올라갔다 내려옴, 시작·끝 기울기 0) |
| 돌풍 최대 수평 속도 | 기본 + `45 px/s × env × 민감도` |
| 돌풍 시 회전 / 뒤집힘 | × `1 + 0.8·env` / × `1 + 0.6·env` |
| 돌풍 시 낙하 속도 | × `1 − 0.15·env` (살짝 떠오르는 느낌) |
| 첫 돌풍 | 로드 후 `rand(4, 7)` s (첫 화면에서 한 번 보여주기) |

**개수 결정**

| 조건 | count |
|------|-------|
| `innerWidth < 360` | 12 |
| `360 ≤ W < 480` (일반 모바일) | 16 |
| `480 ≤ W < 1024` | 18 |
| `W ≥ 1024` | 20 (절대 상한) |
| 저사양: `hardwareConcurrency ≤ 4` 또는 `deviceMemory ≤ 2` 또는 `connection.saveData` | `min(위 값, 12)` + DPR 상한 1.5 |
| FPS 강등 1단계 (5s 평균 < 50fps) | `max(8, round(count × 0.6))` + DPR 1 |
| FPS 강등 2단계 (재측정 < 40fps) | 루프 정지, canvas `display:none`, `.bg-petals-static` 표시 |

**위치·재생성**

| 항목 | 값 |
|------|-----|
| 초기 y | `rand(−40, H)` (첫 화면부터 고르게 분포) |
| 재생성 y | `−40 − rand(0, 60)` |
| 재생성 x | `rand(−0.15W, W)` (바람 상류 쪽으로 바이어스) |
| 하단 이탈 | `y > H + 40` → 재생성 |
| 좌우 이탈 | `x > W + 40` → 기준 x에서 `W + 80` 빼기 / `x < −40` → 더하기 (랩어라운드) |

#### 1-A-3. 형태 (Canvas path — 그대로 옮길 것)

모든 형태는 **단위 크기(길이 또는 지름 = 1) Path2D로 1회 생성**해 캐시하고, 그릴 때 `ctx.scale(size, size)` 후 `fill()` 한다 (매 프레임 path 재생성 금지).

**(a) 꽃잎 낱장 — 가늘고 긴 타원, 끝이 살짝 뾰족**
- 원점 중심, 세로 방향. 기저(꽃받침 쪽)는 `(0, +0.5L)` 로 좁게, 끝(tip)은 `(0, −0.5L)` 근처에서 둥글다가 살짝 뾰족.
- 반폭 `hw = 0.22·L` (전체 폭 ≈ 0.44L → 가늘고 긴 비율)

```js
function petalPath(L) {               // base (0, +L/2) → tip (0, -L/2)
  const hw = 0.22 * L, p = new Path2D();
  p.moveTo(0, 0.5 * L);
  p.bezierCurveTo( 1.3 * hw,  0.25 * L,  1.2 * hw, -0.30 * L,  0.25 * hw, -0.48 * L);
  p.quadraticCurveTo(0, -0.54 * L, -0.25 * hw, -0.48 * L);           // 살짝 뾰족한 끝
  p.bezierCurveTo(-1.2 * hw, -0.30 * L, -1.3 * hw,  0.25 * L,  0,         0.5 * L);
  p.closePath();
  return p;
}
const UNIT_PETAL = petalPath(1);
```

**(b) 네 갈래 꽃 — 꽃잎 4장이 중심에서 뻗음 + 중심점**
- 지름 D 기준. 꽃잎 길이 = 0.5D, **기저가 중심(0,0)** 에 오도록 `translate(0, −0.25)` 후 그림.
- 4장 각도: `0°, 92°, 178°, 272°` (정확한 90° 대신 ±2° 비틀어 손으로 그린 느낌)
- 중심점: 반지름 `0.08·D` 원, 색은 §1-A-2 규칙.

```js
const UNIT_FLOWER_PETAL = petalPath(0.5);          // 지름 1 기준 꽃잎 길이 0.5
const FLOWER_ANGLES = [0, 92, 178, 272].map(d => d * Math.PI / 180);

function drawFlower(ctx, petalColor, centerColor) { // ctx는 이미 translate/rotate/scale(D) 상태
  ctx.fillStyle = petalColor;
  for (const a of FLOWER_ANGLES) {
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -0.25);                       // 꽃잎 기저를 중심에 맞춤
    ctx.fill(UNIT_FLOWER_PETAL);
    ctx.restore();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, 0.08, 0, Math.PI * 2);
  ctx.fill();
}
```

**(c) 연두 잎 조각 — 양끝이 뾰족한 아몬드형**
- 길이 L, 반폭 `hw = 0.28·L` (quadratic 제어점을 `2·hw` 에 두면 최대 폭이 정확히 hw)

```js
const UNIT_LEAF = (() => {
  const hw = 0.28, p = new Path2D();
  p.moveTo(0, -0.5);
  p.quadraticCurveTo( 2 * hw, 0, 0, 0.5);
  p.quadraticCurveTo(-2 * hw, 0, 0, -0.5);
  p.closePath();
  return p;
})();
```

(선택·Nice) 꽃잎 길이 L ≥ 14 인 경우 중앙 잎맥: `moveTo(0, 0.45L) → lineTo(0, −0.2L)`, `lineWidth = 0.6px`(scale 보정), `strokeStyle` = 한 톤 진한 노랑(`#E8B21E`, 꽃잎이 `#E8B21E`면 `#F2C230`), alpha ×0.5.

#### 1-A-4. 갱신·그리기 (참고 구현)

```js
const CFG = {
  mix: { petal: 0.70, flower: 0.20, leaf: 0.10 },
  colors: {
    petal:  [['#F2C230', .5], ['#F7D561', .3], ['#E8B21E', .2]],
    leaf:   [['#B4C77A', .7], ['#C5D48F', .3]],
  },
  size:    { petal: [10, 18], flower: [14, 22], leaf: [10, 16] },
  alpha:   { petal: [.35, .70], flower: [.40, .70], leaf: [.35, .55] },
  passSec: [25, 15],                                   // z=0 → 25s, z=1 → 15s
  swayAmp: { petal: [20, 50], flower: [20, 40], leaf: [20, 50] },
  swayPer: { petal: [3, 6],   flower: [4, 6],   leaf: [3, 5] },
  lean:    { petal: .35, flower: .15, leaf: .30 },
  spin:    { petal: [.3, .9], flower: [.1, .4], leaf: [.2, .6] },
  flip:    { petal: [1.6, 3.2], flower: [.8, 1.6], leaf: [1.2, 2.4] },
  sens:    { petal: [.7, 1], flower: [.6, .9], leaf: [.7, 1] },
  windBase: 10,
  gust: { gap: [8, 15], first: [4, 7], dur: [2, 3], peak: 45, spin: .8, flip: .6, fall: .15 },
  margin: 40,
};
const rand = (a, b) => a + Math.random() * (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const pick = list => { let r = Math.random(); for (const [v, w] of list) { if ((r -= w) <= 0) return v; } return list[0][0]; };

// --- 바람 상태 ---
const wind = { env: 0, gustStart: 0, gustDur: 0, nextGust: 0 };
function updateWind(nowSec) {
  if (!wind.nextGust) wind.nextGust = nowSec + rand(...CFG.gust.first);
  if (!wind.gustDur && nowSec >= wind.nextGust) { wind.gustStart = nowSec; wind.gustDur = rand(...CFG.gust.dur); }
  if (wind.gustDur) {
    const u = (nowSec - wind.gustStart) / wind.gustDur;
    if (u >= 1) { wind.env = 0; wind.gustDur = 0; wind.nextGust = nowSec + rand(...CFG.gust.gap); }
    else wind.env = 0.5 - 0.5 * Math.cos(2 * Math.PI * u);
  }
}

class Particle {
  constructor(W, H, init) { this.reset(W, H, init); }
  reset(W, H, init) {
    const r = Math.random();
    this.type = r < CFG.mix.petal ? 'petal' : r < CFG.mix.petal + CFG.mix.flower ? 'flower' : 'leaf';
    const t = this.type, z = Math.random();
    this.color  = t === 'leaf' ? pick(CFG.colors.leaf) : pick(CFG.colors.petal);
    this.center = this.color === '#E8B21E' ? '#F7D561' : '#E8B21E';           // flower 전용
    this.size   = lerp(...CFG.size[t], z);
    this.alpha  = lerp(...CFG.alpha[t], z);
    this.fall   = (H + 2 * CFG.margin) / lerp(...CFG.passSec, z);            // px/s
    this.amp    = rand(...CFG.swayAmp[t]);
    this.per    = rand(...CFG.swayPer[t]);
    this.phase  = Math.random() * Math.PI * 2;
    this.spin   = rand(...CFG.spin[t]) * (Math.random() < .5 ? -1 : 1);
    this.flipV  = rand(...CFG.flip[t]);
    this.flipPh = Math.random() * Math.PI * 2;
    this.sens   = lerp(...CFG.sens[t], z);
    this.rot    = Math.random() * Math.PI * 2;
    this.x0     = init ? Math.random() * W : rand(-0.15 * W, W);
    this.y      = init ? rand(-CFG.margin, H) : -CFG.margin - Math.random() * 60;
    this.drift  = 0; this.swayT = Math.random() * this.per;
  }
  step(dt, W, H) {
    const e = wind.env, g = CFG.gust;
    this.y      += this.fall * (1 - g.fall * e) * dt;
    this.drift  += (CFG.windBase + g.peak * e) * this.sens * dt;
    this.swayT  += dt;
    this.rot    += this.spin  * (1 + g.spin * e) * dt;
    this.flipPh += this.flipV * (1 + g.flip * e) * dt;
    const arg = (2 * Math.PI * this.swayT) / this.per + this.phase;
    this.x    = this.x0 + this.drift + Math.sin(arg) * this.amp;
    this.lean = Math.cos(arg) * CFG.lean[this.type];
    const m = CFG.margin;
    if (this.x > W + m) this.x0 -= W + 2 * m;
    else if (this.x < -m) this.x0 += W + 2 * m;
    if (this.y > H + m) this.reset(W, H, false);
  }
  draw(ctx) {
    const c = Math.cos(this.flipPh);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot + this.lean);
    if (this.type === 'flower') {
      ctx.scale(this.size, this.size * (0.6 + 0.4 * Math.abs(c)));         // 기울어짐만
      ctx.globalAlpha = this.alpha;
      drawFlower(ctx, this.color, this.center);
    } else {
      const sx = Math.abs(c) < 0.15 ? (c < 0 ? -0.15 : 0.15) : c;            // 완전 소멸(깜빡임) 방지
      ctx.scale(this.size * sx, this.size);
      ctx.globalAlpha = this.alpha * (c < 0 ? 0.8 : 1);                       // 뒷면은 살짝 옅게
      ctx.fillStyle = this.color;
      ctx.fill(this.type === 'leaf' ? UNIT_LEAF : UNIT_PETAL);
    }
    ctx.restore();
  }
}
```

루프:
```js
let last = 0, rafId = 0;
function loop(nowMs) {
  const dt = Math.min(0.05, (nowMs - (last || nowMs)) / 1000);  // 최대 50ms로 클램프 (탭 복귀 점프 방지)
  last = nowMs;
  updateWind(nowMs / 1000);
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) { p.step(dt, W, H); p.draw(ctx); }
  measureFps(nowMs);                                             // §1-A-5
  rafId = requestAnimationFrame(loop);
}
```

#### 1-A-5. 성능·배터리

| 항목 | 규칙 |
|------|------|
| 탭 비활성 | `visibilitychange` → hidden 시 `cancelAnimationFrame(rafId)`, visible 복귀 시 `last = 0` 후 RAF 재시작. FPS 측정 창도 리셋 |
| lightbox 열림 (Should) | 열림 시 정지, 닫힘 시 재개 (캔버스가 모달 뒤에 가려져 무의미한 연산) |
| resize | 150ms debounce. **폭이 바뀐 경우에만** canvas 재할당·count 재계산. 높이만 변하는 모바일 주소창 수축/확장은 무시 (canvas 내부 높이는 지금까지 본 최대 `innerHeight` 사용, CSS `inset:0` 이 늘려 맞춤) |
| DPR | `canvas.width = W × dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`, dpr 상한은 §1-A-2 개수 표 |
| FPS 측정 | 로드 후 5s 창 평균. 1단계/2단계 강등은 §1-A-2 표. 강등은 되돌리지 않음 |
| 경로 캐시 | 단위 Path2D 3종만 사용, 매 프레임 `new Path2D` 금지. `shadowBlur`·`filter` 사용 금지 |
| 예상 비용 | 20개 × path fill ≈ 모바일 ≤1.5% CPU (이전 24 ellipse와 동급) |

#### 1-A-6. prefers-reduced-motion 대체
- `matchMedia('(prefers-reduced-motion: reduce)').matches` 이면 **canvas 루프 미생성** (`return` early, 기존 유지), `.bg-petals { display:none }`.
- `.bg-petals-static { display:block }` — 정적 개나리 장식 4개 표시 (§1-A-7). 위치 클래스 `.sp-1~.sp-4` 기존 좌표 유지.
- 설정 변경 시 reload (기존 유지).

#### 1-A-7. 정적 장식 SVG (index.html `.bg-petals-static` 내부 교체용)

각 56×56px, opacity 0.55, 회전 고정. 꽃잎·잎 path는 §1-A-3 공식을 L=40(잎 36), 중심 (30,30) 으로 환산한 값.

```html
<div class="bg-petals-static" aria-hidden="true">
  <!-- sp-1: 꽃잎 낱장 #F2C230 -->
  <svg viewBox="0 0 60 60" class="static-petal sp-1"><path d="M30 50 C41.44 40 40.56 18 32.2 10.8 Q30 8.4 27.8 10.8 C19.44 18 18.56 40 30 50 Z" fill="#F2C230" opacity="0.55" transform="rotate(35 30 30)"/></svg>
  <!-- sp-2: 네 갈래 꽃 #F7D561 + 중심 #E8B21E -->
  <svg viewBox="0 0 60 60" class="static-petal sp-2"><g transform="translate(30 30) rotate(-12)" opacity="0.55"><defs><path id="fp" d="M0 0 C6.86 -6 6.34 -19.2 1.32 -23.52 Q0 -24.96 -1.32 -23.52 C-6.34 -19.2 -6.86 -6 0 0 Z"/></defs><use href="#fp" fill="#F7D561"/><use href="#fp" fill="#F7D561" transform="rotate(92)"/><use href="#fp" fill="#F7D561" transform="rotate(178)"/><use href="#fp" fill="#F7D561" transform="rotate(272)"/><circle r="3" fill="#E8B21E"/></g></svg>
  <!-- sp-3: 연두 잎 #B4C77A -->
  <svg viewBox="0 0 60 60" class="static-petal sp-3"><path d="M30 12 Q50.16 30 30 48 Q9.84 30 30 12 Z" fill="#B4C77A" opacity="0.55" transform="rotate(60 30 30)"/></svg>
  <!-- sp-4: 꽃잎 낱장 #E8B21E -->
  <svg viewBox="0 0 60 60" class="static-petal sp-4"><path d="M30 50 C41.44 40 40.56 18 32.2 10.8 Q30 8.4 27.8 10.8 C19.44 18 18.56 40 30 50 Z" fill="#E8B21E" opacity="0.55" transform="rotate(-50 30 30)"/></svg>
</div>
```
(`id="fp"` 는 페이지 내 유일해야 함. 충돌 시 `fp-static` 등으로 변경)

---

### 1-B. 그라디언트 메시 (CSS, 2순위, 매우 은은)

| 항목 | 값 |
|------|-----|
| 트리거 | 페이지 진입 → 무한 루프 |
| 구현 방식 | **`.card::before`** pseudo (position: fixed), 4개 `radial-gradient` 레이어, `background-position` 애니메이션. 데스크톱 카드 바깥 여백용 `body::before` 는 같은 값으로 유지해도 됨 |
| z-index | `.card::before` = **-2** (§1-0) |
| pointer-events | `none` |

**파라미터:**

```css
.card::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 20% 30%, rgba(242, 194, 48, 0.16), transparent 70%),   /* primary 개나리 노랑 */
    radial-gradient(ellipse 50% 60% at 80% 70%, rgba(180, 199, 122, 0.14), transparent 70%),  /* secondary 새순 연두 */
    radial-gradient(ellipse 70% 40% at 50% 90%, rgba(247, 213, 97, 0.12), transparent 70%),   /* 밝은 버터 노랑 */
    radial-gradient(ellipse 40% 50% at 70% 10%, rgba(242, 194, 48, 0.10), transparent 70%);
  background-size: 200% 200%;
  animation: meshDrift var(--dur-bg-mesh) ease-in-out infinite alternate;   /* 45s */
  will-change: background-position;
}
@keyframes meshDrift {            /* 키프레임 값은 기존 유지 */
  0%   { background-position: 0% 0%, 100% 100%, 50% 100%, 100% 0%; }
  50%  { background-position: 30% 20%, 70% 80%, 60% 70%, 80% 20%; }
  100% { background-position: 60% 40%, 40% 60%, 80% 50%, 60% 40%; }
}
```

- 이전 3번째 레이어의 짙은 accent(rosewood)는 새 accent(올리브)로 바꾸면 화면이 탁해지므로 **밝은 버터 `#F7D561`** 로 대체.
- 노랑 alpha는 이전 rose(0.22)보다 낮춤 — 노랑은 명도가 높아 같은 alpha에서도 더 강하게 보임.
- (참고, 컨셉 영역) `html, body` 의 카드 바깥 그라디언트 `#E2D4C5 → #C8B7A8` 는 가을 톤 잔존. 새 팔레트 예: `linear-gradient(135deg, #F6EBC8 0%, #EFE3BC 50%, #E4DCB8 100%)`.

**성능:** CSS 그라디언트는 compositor 처리. `will-change: background-position` 은 이 요소 1곳에만.

**prefers-reduced-motion 대체:**
```css
@media (prefers-reduced-motion: reduce) {
  .card::before, body::before { animation: none !important; }   /* 그라디언트는 정적 첫 프레임으로 유지 */
}
```

---

## 2. 스크롤 시퀀스 (섹션별 진입 애니메이션)

**공통 패턴**: `IntersectionObserver`로 섹션이 viewport 진입(threshold 0.15) 시 `.is-visible` 클래스 부여 → CSS transition으로 fade-up. 무드는 "가볍고 산뜻하게" — 이동 거리는 그대로 두고 duration·stagger만 한 박자 짧게.

```css
.reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--dur-slow) var(--ease-standard), transform var(--dur-slow) var(--ease-standard); }  /* --dur-slow = 0.7s */
.reveal.is-visible { opacity: 1; transform: translateY(0); }
```

`reveal-stagger-N` 자식들은 `transition-delay: calc(var(--stagger-i, 0) * var(--stagger-base))` (= 80ms).

### 2-1. Hero 진입 (페이지 로드)

현 구현의 `data-hero-step` 1~7 번호 체계에 맞춤 (일러스트는 별도 행).

| Step | Element | Delay | Duration | Easing | Effect |
|------|---------|-------|----------|--------|--------|
| 1 | 영문 eyebrow ("We're getting married") | **150ms** | **600ms** | ease-decelerate | opacity 0→1 + translateY(12px → 0) |
| — | 개나리 일러스트 `.hero-illustration` | **300ms** | **1000ms** | ease-decelerate | opacity 0→1 + scale(1.03 → 1.0) + filter blur(**4px** → 0) |
| 2 | SAVE THE DATE + 영문 날짜 | **300ms** | 600ms | ease-decelerate | opacity 0→1 + translateY(12px → 0) |
| 3 | 신랑 이름 | **650ms** | 600ms | ease-decelerate | 동일 |
| 4 | "&" 스크립트 | **800ms** | 600ms | ease-decelerate | opacity 0→1 + translateY (기존과 동일 처리) |
| 5 | 신부 이름 | **950ms** | 600ms | ease-decelerate | 동일 |
| 6 | 예식일·장소 | **1250ms** | 600ms | ease-decelerate | opacity 0→1 |
| 7 | 스크롤 인디케이터 (이중 화살표 bounce) | **1750ms** | infinite | ease-in-out | translateY(0 ↔ 6px) loop **1.4s**, scroll 시 fadeOut 300ms |

- 일러스트 blur는 1회성 단발 트랜지션이므로 허용 (무한 루프 blur 금지).
- 파티클은 hero 시퀀스와 무관하게 로드 즉시 시작 (초기 y가 화면 전체에 분포하므로 첫 프레임부터 꽃잎이 보임).

**prefers-reduced-motion 대체:**
- 모든 step 동시 표시 (delay/duration 0), opacity 1, transform·filter none
- 스크롤 인디케이터: bounce 정지, 정적 화살표 표시

### 2-2. Greeting 섹션

- 트리거: 섹션 진입 (threshold 0.2)
- 효과: **masked text reveal** — 단락별 자식 요소에 `overflow: hidden` 부모 + 자식 `translateY(100%) → 0`, opacity 0 → 1
- duration: **700ms** (이전 900)
- stagger: 단락 간 **120ms** (이전 150)
- easing: `var(--ease-emphasized)` — `cubic-bezier(0.2, 0, 0, 1)`

**prefers-reduced-motion**: 즉시 표시, transform 없음

### 2-3. Couple-intro 섹션 (신랑신부 + 부모 함자)

- 트리거: 섹션 진입 (threshold 0.25)
- 효과: 좌(신랑) → 우(신부) 양쪽에서 슬라이드인
  - 신랑 카드: `translateX(-24px) → 0`, opacity 0→1, **600ms**
  - 신부 카드: `translateX(24px) → 0`, opacity 0→1, **600ms**, delay **120ms**
  - 부모 함자: opacity 0→1, **500ms**, delay **300ms**
- easing: ease-out (`--ease-decelerate`)

**prefers-reduced-motion**: opacity 0→1만 (300ms → 글로벌 강등으로 즉시)

### 2-4. Calendar 섹션

- 트리거: 섹션 진입 (threshold 0.3)
- 효과:
  - 캘린더 그리드: opacity 0→1, scale(0.97→1.0), **600ms**
  - 예식일(4월 17일) 셀: 캘린더 등장 후 400ms 뒤 **부드러운 펄스** (scale 1 → **1.12** → 1, **1.4s**, 3회 반복 후 정지)
  - 펄스 원: `background: var(--color-primary)` (`#F2C230`), alpha **0.35 → 0.6 → 0.35** 동기화
  - **셀 숫자색은 `var(--color-text)` `#3B3022`** (노랑 원 위 대비 ≈ 8:1). primary를 글자색으로 쓰지 말 것
  - **D-day 카운트업**: 0 → 실제 D-day까지 **1200ms**, ease-out cubic, 펄스와 동시 시작

**구현 (D-day 카운트업):**
```js
function countUp(el, target, dur = 1200) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

**prefers-reduced-motion**:
- 카운트업 → 즉시 최종 값 표시
- 펄스 → 정적 강조 (노랑 원 alpha 0.45 고정)

### 2-5. Gallery 섹션

- 트리거: 섹션 진입 (threshold 0.2)
- 효과:
  - 첫 슬라이드: opacity 0→1 + scale(**1.02** → 1.0) + **filter blur(4px → 0)**, **900ms** (컨셉 시트 motion_mood_hint "워터컬러처럼 번지는 reveal" 그대로)
  - 인디케이터 dots: opacity 0→1, 400ms, delay **500ms**
- easing: ease-out

**prefers-reduced-motion**: blur 제거, 즉시 opacity 1

### 2-6. Venue / Account / RSVP / Guestbook / Share 섹션 (공통)

- 트리거: 섹션 진입 (threshold 0.2)
- 효과: 헤더 → 본문 stagger fade-up
  - 섹션 제목: opacity 0→1 + translateY(16px → 0), **600ms**
  - 본문 자식들: stagger **80ms**, 동일 트랜지션
- easing: ease-out

**prefers-reduced-motion**: opacity 0→1만 (즉시), transform 없음

---

## 3. 인터랙티브 요소 인벤토리

### 🟥 Must (필수 — 출시 차단 항목)

#### 3-1. D-day 카운트다운/카운트업
- **위치**: calendar 섹션
- **트리거**: 섹션 viewport 진입 시 1회
- **동작**:
  - 페이지 로드 시 `(2027-04-17 - 오늘)` 일수 계산
  - 0 → 계산값까지 **1200ms** ease-out cubic 카운트업
  - 카운트업 종료 후 D-day 셀 펄스 (위 2-4 참조)
  - (Nice, 신규) 카운트업 종료 직후 숫자 요소에 **flip 1회**: `transform: perspective(400px) rotateX(70deg) → rotateX(0)`, opacity 0.4 → 1, 400ms `--ease-emphasized` (컨셉 "카운트다운 숫자는 부드러운 flip")
- **시각**: 숫자 폰트 Cormorant Garamond, 색상 **deep olive `#5F6B2C`** (`var(--color-accent)`)
- **접근성**: `aria-live="polite"`로 마운트, 카운트업 종료 시 최종 값만 스크린리더 읽기
- **reduced-motion**: 즉시 최종 값 표시, 펄스·flip 없음

#### 3-2. 갤러리 스와이프 (터치)
- **위치**: gallery 섹션
- **라이브러리**: 없음 (vanilla touch event + CSS transform)
- **동작**:
  - 좌우 스와이프 (threshold 50px, 또는 속도 0.3px/ms 이상)
  - 슬라이드 컨테이너: `transform: translateX(-N * 100%)`, transition 400ms ease-out
  - 인디케이터 dot: 활성 dot은 width 24px / 비활성 8px (transition 300ms). 활성 dot 색 `var(--color-accent)`, 비활성 `rgba(95,107,44,0.25)`
  - 자동 슬라이드: 5000ms 간격, 사용자 인터랙션 시 일시정지 (10초 후 재개)
  - 마지막 슬라이드에서 next 시 첫 슬라이드로 wrap
- **시각 피드백**: 스와이프 중 손가락 따라 실시간 transform (drag), 떼면 snap
- **햅틱**: 슬라이드 전환 완료 시 `navigator.vibrate(8)` (지원 시)
- **접근성**:
  - 좌우 화살표 버튼 (시각적으로 보임, 키보드 ←/→ 지원)
  - `role="region"` + `aria-label="갤러리"` + `aria-roledescription="carousel"`
  - 각 슬라이드 `aria-label="사진 N / 5"`
- **reduced-motion**: 자동 슬라이드 OFF, 사용자 스와이프만 동작

#### 3-3. 계좌번호 복사 + 토스트
- **위치**: account 섹션 각 항목 (양가 부모 4명 + 신랑 + 신부 = 6개)
- **동작**:
  - 버튼 클릭 → `navigator.clipboard.writeText(계좌번호)`
  - 클립보드 복사 성공 → 토스트 페이드인 (200ms) + 1500ms 후 페이드아웃 (300ms)
  - 토스트 메시지: "계좌번호가 복사되었습니다"
  - 버튼 아이콘: 복사 아이콘 → **올리브 체크마크 `#5F6B2C`** swap (400ms 동안), 1000ms 후 원복 (연두 `#B4C77A` 는 아이콘 대비 1.64:1로 미달이므로 사용 금지)
- **시각**: 토스트는 화면 하단 중앙 fixed, surface bg **`#FBF1D6`** + text **`#3B3022`** (11.43:1), border **`1px solid rgba(180,199,122,0.5)`**, border-radius 12px, padding 12px 20px
- **햅틱**: `navigator.vibrate(15)` (지원 시)
- **접근성**: 토스트 `role="status"` + `aria-live="polite"`, 버튼 `aria-label="계좌번호 복사"`
- **fallback**: clipboard API 실패 시 `document.execCommand('copy')` 폴리필 시도, 그래도 실패 시 토스트 "복사에 실패했습니다. 직접 선택해주세요"

#### 3-4. 부드러운 스크롤 (Smooth Scroll)
- **구현**: CSS `html { scroll-behavior: smooth; }` (모든 앵커 링크에 적용)
- **prefers-reduced-motion**: `scroll-behavior: auto` (즉시 점프)
- **참고**: hash anchor 없으면 비활성. 향후 목차/네비 추가 시 활용

---

### 🟨 Should (권장 — UX 향상)

#### 3-5. 갤러리 핀치 줌 Lightbox
- **위치**: 갤러리 슬라이드 클릭 시 모달 오픈
- **동작**:
  - 클릭 → fixed 풀스크린 lightbox 페이드인 (250ms), 배경 **`rgba(59, 48, 34, 0.92)`** (`#3B3022` 기반)
  - 이미지: 화면 중앙, max 90vw / 90vh
  - **핀치 줌**: `gesturestart/gesturechange` (iOS) + `touchmove` 2-finger distance 계산 (Android)
    - max scale 3.0, min scale 1.0
    - 줌 중심: 두 손가락 중점 (`transform-origin` 동적)
  - **더블탭 토글**: 1회 더블탭 → scale 2.5, 다시 더블탭 → scale 1.0 (300ms transition)
  - **팬**: scale > 1 시 단일 손가락 드래그로 이동
  - **닫기**: 우상단 ✕ 버튼 / 배경 클릭 / ESC 키 / 위→아래 swipe (100px)
  - **(신규 연동)** 열림 시 꽃잎 파티클 루프 정지, 닫힘 시 재개 (§1-A-5)
- **포커스 트랩**: lightbox 오픈 시 ✕ 버튼에 포커스, Tab 순환 lightbox 내부로 제한
- **스크롤 잠금**: `body { overflow: hidden }` (모달 동안)
- **접근성**:
  - `role="dialog"` + `aria-modal="true"` + `aria-label="사진 확대"`
  - 키보드: ESC 닫기, ←/→ 슬라이드 이동, +/- 줌 (선택)
- **reduced-motion**: 페이드 250ms → 0ms, 줌 transition 0ms (즉시)

#### 3-6. 음악 토글 (BGM)
- **위치**: 우상단 floating action (fixed, top: 16px, right: 16px, z-index: 50)
- **음원**: `audio/bgm.mp3` (기존), `loop preload="metadata"`
- **동작**:
  - 자동재생: 시도하되 브라우저 차단 시 사용자 클릭 대기 (`audio.play().catch(...)`)
  - 클릭 토글: 재생 ↔ 일시정지
  - 재생 시 페이드인 (volume 0 → 0.4, 1500ms ease-out)
  - 일시정지 시 페이드아웃 (volume → 0, 600ms) 후 pause
- **아이콘**: SVG 음표
  - 일시정지 상태: 음표 단독 (**accent `#5F6B2C`**)
  - 재생 상태: 음표 + 작은 이퀄라이저 3바 (각 막대 scaleY 0.3 ↔ 1.0, 400ms loop, stagger 100ms), 막대 색 `#5F6B2C`
  - 클릭 시 ripple: 원형 scale 0 → 2.5, opacity → 0, 600ms, 색 **`rgba(242, 194, 48, 0.45)`** (노랑 옅게 — 컨셉 지정)
- **사이즈**: 44x44px (터치 타겟 최소 보장)
- **배경**: **`rgba(255, 251, 241, 0.8)`** (#FFFBF1 80%), backdrop-filter blur(8px), border-radius 50%, border **`1px solid rgba(242, 194, 48, 0.6)`**
- **접근성**:
  - `aria-label="배경음악 재생/일시정지"` (상태에 따라 갱신)
  - `aria-pressed="true|false"`
  - 키보드 Enter/Space 동작
- **reduced-motion**: 이퀄라이저 정적 (3바 모두 scaleY 0.7 고정), ripple 없음

#### 3-7. 카카오톡 공유 버튼
- **위치**: share 섹션
- **동작**:
  - Kakao SDK (`Kakao.Share.sendDefault`) 가능 시 SDK 사용 — feed 템플릿 (제목, 설명, 썸네일, 버튼)
  - SDK 미사용 시 fallback: 현재 URL `navigator.clipboard.writeText` + 토스트 "링크가 복사되었습니다"
- **시각**: 버튼 hover/active 시 scale 0.96, 150ms
- **햅틱**: 클릭 시 `navigator.vibrate(15)`
- **접근성**: `aria-label="카카오톡으로 공유하기"`

#### 3-8. 햅틱 피드백 (전역)
- **대상**: 모든 주요 버튼 (계좌 복사, 카카오 공유, 갤러리 슬라이드, 음악 토글, lightbox 열기/닫기)
- **구현**: `navigator.vibrate(N)` 지원 체크 후 호출
  - 가벼운 탭: 8ms (슬라이드 전환)
  - 표준 탭: 15ms (복사, 공유)
  - 중요 액션: 25ms (lightbox 열기, RSVP 제출)
- **fallback**: 미지원 기기에서는 silently 무시

---

### 🟩 Nice-to-have (선택 — 시간 여유 시)

#### 3-9. 스크롤 리빌 (IntersectionObserver fade-up)
- **이미 섹션 2에서 명세** — 모든 섹션 공통 적용
- **고급 옵션**: 스크롤 방향 감지하여 위→아래 스크롤 시에만 reveal, 다시 위로 스크롤 시 유지

#### 3-10. 모서리 장식 패럴랙스
- **위치**: 각 섹션의 spot illustration (개나리 가지 디바이더·코너)
- **동작**: scroll 위치에 따라 `transform: translateY(scrollY * 0.15)` (매우 약한 패럴랙스)
- **구현**: scroll listener `passive: true`, rAF throttle
- **reduced-motion**: factor 0 (정적 위치 고정)
- 3-12와 동시 적용 시 transform 충돌 방지: 패럴랙스는 래퍼, 살랑임은 내부 `img` 에 적용

#### 3-11. Hero 일러스트 ken-burns slow zoom
- **동작**: hero 개나리 일러스트가 **16초**에 걸쳐 scale 1.0 → 1.04 (translateY 0 → -1%), ease-in-out, infinite alternate
- **레이어 주의**: §1-0 에 따라 `.hero-illustration` 은 `position: relative; z-index: -1` (transform 애니메이션과 공존 가능)
- **reduced-motion**: 정적 (animation: none)

#### 3-12. 코너 개나리 가지 살랑임 (신규)
- **위치**: `floral-corner.png` 코너 장식, `floral-divider.png` 디바이더 이미지
- **동작**: `rotate(-1.2deg) ↔ rotate(1.2deg)`, `var(--dur-branch-sway)` = 6s, ease-in-out, infinite alternate
  - `transform-origin`: 코너는 이미지가 붙은 모서리 (예: 좌상단 코너 → `top left`), 디바이더는 `center`
  - 디바이더는 진폭 절반(±0.6deg) — 가로로 길어 끝단 이동량이 크므로
  - 요소마다 `animation-delay: -N s` (0~6s 랜덤) 로 위상을 흩어 일제히 흔들리지 않게
- **트리거**: 해당 섹션이 viewport에 있을 때만 `animation-play-state: running` (IntersectionObserver), 밖이면 `paused`
- **성능**: transform만 사용, 이미지 6장 이하
- **reduced-motion**: `animation: none` (정적)

---

## 4. 마이크로 인터랙션 & 트랜지션 디테일

| 요소 | 상태 | 변화 | Duration | Easing |
|------|------|------|----------|--------|
| 모든 버튼 | hover (데스크톱) | scale 1.0 → 1.02, opacity 1 → 0.92 | 200ms | ease-standard |
| 모든 버튼 | active (탭) | scale 1.0 → 0.96 | 150ms | ease-standard |
| 모든 버튼 | focus-visible | outline 2px solid `#5F6B2C` + offset 3px | 0ms | — |
| 링크 (텍스트) | hover | color text → accent `#5F6B2C`, underline 등장 | 200ms | ease-standard |
| 카드 (account, venue) | hover | translateY 0 → -2px, shadow `0 4px 14px rgba(59,48,34,0.08)` | 250ms | ease-standard |
| 계좌 아코디언 | open | summary 배경 → **`rgba(242,194,48,0.10)`** (이전 rose 0.08) | 300ms | ease-standard |
| 칩/보조 버튼 테두리 | 기본 | **`rgba(180,199,122,0.5)`** (이전 sage 0.4) | — | — |
| 토스트 | enter | opacity 0→1 + translateY(20px → 0) | 200ms | ease-out |
| 토스트 | exit | opacity 1→0 | 300ms | ease-in |
| 디바이더 라인 (1px 연두) | scroll 진입 시 | scaleX 0 → 1 (origin: center), 색 `var(--color-secondary)` | **800ms** (이전 1000) | ease-out |
| 입력 필드 (RSVP, 방명록) | focus | border-color muted → accent `#5F6B2C`, 글로우 `0 0 0 3px rgba(242,194,48,0.25)` | 200ms | ease-standard |
| 모달 (lightbox) | enter | opacity 0→1 (배경) + scale(0.96 → 1.0) (내용) | 250ms | ease-out |
| 모달 (lightbox) | exit | opacity 1→0 + scale(1.0 → 0.98) | 200ms | ease-in |
| 체크마크 swap (계좌 복사 후) | swap | 복사 아이콘 opacity 1→0 + 체크(`#5F6B2C`) opacity 0→1, scale 0.8 → 1.0 | 400ms | ease-out |
| 카드 그림자 (`.card`) | 정적 | `0 0 60px rgba(59,48,34,0.08)` (이전 `rgba(58,46,42,.08)`) | — | — |

색 규칙 요약: 노랑 `#F2C230`·연두 `#B4C77A` 는 **면·장식·글로우에만**, 의미 있는 아이콘·글자·포커스 링은 **올리브 `#5F6B2C`** 또는 **브라운 `#3B3022`**.

---

## 5. CSS 변수 토큰 (frontend-developer가 :root에 그대로 갱신)

```css
:root {
  /* Easing (유지) */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);     /* 강조 진입 (텍스트 reveal, 마스크, flip) */
  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);   /* 기본 (버튼, 카드) */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* 감속 (페이지 진입) */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* 가속 (exit) */
  --ease-out-cubic:  cubic-bezier(0.33, 1, 0.68, 1); /* 카운트업 */

  /* Duration — "가볍고 산뜻하게" 한 박자 경쾌 */
  --dur-fast:   0.15s;   /* 마이크로 (active, focus) — 유지 */
  --dur-base:   0.3s;    /* 기본 (hover, 토스트) — 유지 */
  --dur-mid:    0.5s;    /* 페이드인 (이전 0.6s) */
  --dur-slow:   0.7s;    /* 섹션 reveal (이전 0.9s) */
  --dur-xslow:  1.2s;    /* 카운트업 (이전 1.4s) */

  /* Background loops */
  --dur-bg-mesh:      45s;   /* 이전 60s */
  --dur-bg-petal:     20s;   /* 평균값 참고용 (실제 15~25s, JS에서 사용) — 이전 18s */
  --dur-pulse:        1.4s;  /* 이전 1.6s */
  --dur-eq-bar:       0.4s;  /* 유지 */
  --dur-ken-burns:    16s;   /* 이전 18s */
  --dur-branch-sway:  6s;    /* 신규 (3-12) */

  /* Stagger */
  --stagger-base:   0.08s;   /* 이전 0.1s */
  --stagger-large:  0.12s;   /* 이전 0.15s */
}

/* prefers-reduced-motion 글로벌 강등 (유지 + 대상 추가) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  body::before, .card::before { animation: none !important; }
  .bg-petals { display: none; }
  .bg-petals-static { display: block; }
  .floral-corner, .divider img { animation: none !important; }   /* 3-12 선택자는 실제 클래스명에 맞출 것 */
}
```

현 style.css에 하드코딩된 ms 값(hero step 800ms/1200ms, couple 700ms, 갤러리 1100ms, 디바이더 1000ms 등)은 위 섹션 2·4의 새 값으로 교체하거나 토큰 참조로 바꾼다.

---

## 6. 구현 우선순위 매트릭스

| 우선순위 | 항목 | 출시 차단 여부 | 이번 변경 |
|---------|------|--------------|----------|
| **Must** | 1-0 배경 레이어 구조 (모바일에서 파티클 보이게) | ✅ | 신규 |
| **Must** | 1-A 개나리 파티클 (Canvas) | ✅ | 신규(형태·바람·뒤집힘) + 값 |
| **Must** | 1-B 그라디언트 메시 | ✅ | 값 + 위치 이동 |
| **Must** | 2-1~2-6 모든 섹션 스크롤 reveal | ✅ | 값 |
| **Must** | 3-1 D-day 카운트업 | ✅ | 값 |
| **Must** | 3-2 갤러리 스와이프 | ✅ | 색 |
| **Must** | 3-3 계좌 복사 + 토스트 | ✅ | 색 |
| **Must** | 3-4 부드러운 스크롤 | ✅ | 유지 |
| **Must** | 5. CSS 변수 토큰 갱신 | ✅ | 값 |
| **Must** | prefers-reduced-motion 글로벌 분기 + 정적 개나리 장식 | ✅ | 값(SVG 교체) |
| Should | 3-5 lightbox 핀치 줌 (+ 파티클 정지 연동) | ❌ | 색 + 연동 신규 |
| Should | 3-6 음악 토글 | ❌ | 색 |
| Should | 3-7 카카오 공유 | ❌ | 유지 |
| Should | 3-8 햅틱 피드백 | ❌ | 유지 |
| Should | 2-2 masked text reveal (greeting) | ❌ | 값 |
| Nice | 3-1 카운트업 종료 flip | ❌ | 신규 |
| Nice | 1-A-3 꽃잎 잎맥 라인 | ❌ | 신규 |
| Nice | 3-10 모서리 장식 패럴랙스 | ❌ | 유지 |
| Nice | 3-11 hero ken-burns | ❌ | 값 |
| Nice | 3-12 코너 개나리 가지 살랑임 | ❌ | 신규 |

---

## 7. 성능 가이드 (frontend-developer 준수 사항)

### 7-1. RAF 일시정지
- 개나리 파티클: `visibilitychange` hidden 시 `cancelAnimationFrame`, visible 복귀 시 `last` 리셋 후 재개 (dt 클램프 50ms로 점프 방지)
- lightbox 열림 시 파티클 정지 (Should)
- 갤러리 자동 슬라이드: viewport 외 시 setInterval clear
- 코너 가지 살랑임(3-12): viewport 외 `animation-play-state: paused`

### 7-2. will-change 사용 가이드
- **사용**: 그라디언트 메시 `.card::before` (background-position), hero 일러스트 (ken-burns), lightbox 모달 전환 직전
- **금지**: 모든 reveal 요소에 일괄 적용 → 메모리 폭발. 트랜지션 종료 시 제거. 캔버스에는 불필요 (자체 레이어)

### 7-3. CSS contain
```css
.section { contain: layout style; }      /* 각 섹션 격리 (hero 제외) */
.hero    { contain: style; }             /* 변경: layout 제거 (§1-0) */
.gallery-slide { contain: paint; }       /* 슬라이드 paint 격리 */
.lightbox { contain: strict; }           /* 모달 완전 격리 */
```

### 7-4. 이미지 lazy-load
- hero 일러스트: `loading="eager"`, `fetchpriority="high"` (LCP 핵심)
- 갤러리 5장: 첫 장 `loading="eager"`, 2~5장 `loading="lazy"`
- spot illustration (디바이더·코너): `loading="lazy"`

### 7-5. 폰트 로드 최적화
- Google Fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `font-display: swap` (FOIT 방지)
- 한글 폰트 (Nanum Myeongjo): 서브셋 (KR) 명시

### 7-6. 측정 기준
- Lighthouse Mobile Performance ≥ 85
- LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- 실 측정: iOS Safari (iPhone 12 시뮬), Android Chrome (Pixel 5 시뮬), 저사양 시뮬(CPU 4× slowdown)에서 FPS 강등 동작 확인

---

## 8. 접근성 체크리스트

- [ ] 모든 무한 루프 모션 (1-A, 1-B, 펄스, ken-burns, 이퀄라이저, 스크롤 인디케이터 bounce, 패럴랙스, 가지 살랑임)이 `prefers-reduced-motion: reduce`에서 정적 대체
- [ ] 파티클 canvas `pointer-events: none` + `aria-hidden="true"`, 본문 텍스트·정보 박스보다 아래 레이어 (§1-0)
- [ ] 파티클 opacity 상한 0.70 준수 (본문 대비 ≥ 8:1 유지 근거 §1-0)
- [ ] 돌풍·뒤집힘이 점멸로 인식되지 않음: 뒤집힘 최소 scale 0.15 클램프, 주기 ≥ 2s (0.5Hz), 돌풍 2~3s 완만 곡선
- [ ] 갤러리 자동 슬라이드 사용자 인터랙션 시 일시정지 (WCAG 2.2.2)
- [ ] 음악 토글 명확한 시각 표시 + 키보드(Enter/Space) 접근, 아이콘 색 `#5F6B2C` (비텍스트 대비 ≥ 3:1)
- [ ] 빠른 점멸 없음 (이퀄라이저 0.4s = 2.5Hz < 3Hz)
- [ ] 모든 인터랙티브 버튼 `aria-label`
- [ ] 토스트 `role="status"` + `aria-live="polite"`
- [ ] D-day 카운트업 `aria-live="polite"` (종료 시 1회만)
- [ ] Lightbox 포커스 트랩 + ESC 닫기 + 첫 포커스 닫기 버튼
- [ ] 갤러리 키보드 ←/→ 네비게이션
- [ ] 컬러 대비 (컨셉 시트 검증값): text `#3B3022` on bg `#FFFBF1` 12.45:1, on surface `#FBF1D6` 11.43:1 / accent `#5F6B2C` 5.60:1
- [ ] 토스트: text `#3B3022` on `#FBF1D6` 11.43:1 (AAA)
- [ ] **primary(노랑)·secondary(연두)가 글자색·의미 아이콘색으로 쓰인 곳 없음** (캘린더 예식일 숫자, 체크마크, 음악 아이콘 포함)

---

## 9. 자산 협의 사항 (image-artist 참고)

- **개나리 파티클**: 본 명세는 **Canvas Path2D 벡터 도형(꽃잎·네 갈래 꽃·잎)** 으로 그리므로 별도 이미지 자산 불필요. 색은 컨셉 팔레트 HEX와 1:1 일치하므로 워터컬러 일러스트와 톤이 맞는다. (워터컬러 질감 스프라이트를 원할 경우 투명 PNG 64×64 꽃잎 3종 + 꽃 1종을 `ctx.drawImage` 로 대체 가능 — 현재는 불필요)
- **prefers-reduced-motion 정적 장식**: 인라인 SVG로 명세 완료(§1-A-7), 자산 불필요.
- **히어로 일러스트**: 불투명 크림 배경 PNG여도 §1-0 레이어 구조(일러스트 z-index -1)로 파티클이 위에 보이므로 투명 PNG 재생성 불필요.
- **코너/디바이더 살랑임(3-12)**: 기존 `floral-corner.png`, `floral-divider.png` 그대로 회전 애니메이션. 가지 기부(붙은 모서리)가 이미지 모서리에 닿아 있어야 회전 축이 자연스러움 — 새 이미지가 그렇지 않다면 transform-origin만 조정.
- **음악 토글 / 계좌 복사 아이콘**: SVG 인라인 (외부 자산 불필요).

---

## 10. 한 줄 정리

> **모든 모션은 "봄바람에 살랑이는" 모티프에 충실하게 — 개나리 꽃잎·네 갈래 꽃·연두 잎 12~20개가 opacity 0.35~0.7로 15~25초에 걸쳐 좌우로 살랑이며 팔랑이고, 8~15초마다 2~3초 약한 봄바람이 분다. 파티클은 카드 배경 위·본문 아래에서만 날고, 트랜지션은 500~700ms로 한 박자 경쾌하게, prefers-reduced-motion 시 파티클·메시·가지 살랑임 OFF + 정적 개나리 장식 + 즉시 표시로 강등.**
