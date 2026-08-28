# 09 · 시대 전용 3D 소품 명세

> 시대 파일 안에서만 쓰는 3D 빌더들입니다. 공용 빌더(`buildGround`·`jRoofHanok` 등)는 [01-ARCHITECTURE.md](01-ARCHITECTURE.md)를 보세요.
>
> **좌표와 인자는 각 시대 문서의 「지역 지형 배치」 표에 있습니다.**
> 여기에는 *그 물건이 어떻게 생겼는지*만 적습니다.

기본 도형만 조립합니다. 외부 모델 로더나 커스텀 지오메트리를 쓰지 않습니다 — [03-DESIGN-SYSTEM.md](03-DESIGN-SYSTEM.md) 4장.

아바타 키가 2.5입니다. **지붕 꼭대기가 3.0 미만이면 다시 키우세요.**

> **여기에 없는 두 시대**
> **개항기**의 전용 소품 19개는 이 문서가 아니라 [`content/10-open-port.md`](content/10-open-port.md) 안에 있습니다.
> **후삼국**은 전용 소품이 하나도 없습니다 — 공용 빌더만으로 세 지역이 성립합니다.
>
> 아래 함수 165개에는 지역 빌더(`build<시대><지역>`)와 NPC 배치 함수도 섞여 있습니다.
> 실제로 새로 써야 하는 소품은 **시대당 2~5개, 6·25만 17개**입니다.

---

## 구석기

### `buildCaveCamp()`

  · 조립 — 구(6,10,7,0,π×2,0,π/1.7) + 원반(1.5,16) + 12면체(0.7+rand(0,0.5) + 원기둥(0.1,0.12,1.3,6) + 원뿔(0.32,0.85,8)
  · 반복 — 3번
  · 색 — #8B8171 #1B1712 #6B4A34 #F2903D

### `buildMammothGround()`

  · 치수 — a = (단번호/8)×π×2
  · 조립 — 구(2.4,10,8) + 구(1.2,10,8) + 원뿔(0.11,1.4,6) + 원기둥(0.36,0.42,2.2,6) + 원반(2.1,20) + 원뿔(0.09,0.6,5)
  · 반복 — 8번
  · 색 — #5B4632 #EDE3CC #3C2E1E #7A5A3E

### `buildNPCsPaleo()`

  · 함께 부르는 것 — makeNPC

### `buildWorldPaleo()`

  · 함께 부르는 것 — buildCaveCamp, buildGround, buildMammothGround, buildMountains, buildNPCsPaleo, buildTrees


## 신석기

### `buildBushesNeo()`

  · 치수 — s = 0.35+무작위×0.3
  · 조립 — 12면체(s,0) + 구(0.06,6,5)
  · 색 — #6E9257 #E4C05C

### `buildCanoeNeo()`

  · 조립 — CapsuleGeometry(0.55,3.6,4,8) + 원기둥(0.05,0.05,1.6,6) + 상자(0.32,0.5,0.05)
  · 색 — #6B4A34 #8A6A4A

### `buildFarmFieldNeo()`

  · 조립 — 평면(14,12) + 원뿔(0.16,0.55,5)
  · 반복 — 6번
  · 색 — #8A6B45 #C7B84A

### `buildFieldFenceNeo()`

  · 조립 — 원기둥(0.06,0.08,0.9,5)
  · 색 — #6B5033

### `buildFloodZoneNeo()`

  · 치수 — x = -9+단번호×2
  · 조립 — 평면(20,14) + 상자(0.3,1.1,0.3)
  · 반복 — 10번
  · 색 — #6E5A3E #5E4A32

### `buildGroundNeo()`

  · 조립 — 평면(150,150)
  · 색 — #CFDCA6

### `buildHillsNeo()`

  · 조립 — 구(r,12,8,0,π×2,0,π/2)
  · 색 — #B9CB8E

### `buildKilnNeo()`

  · 치수 — a = (단번호/6)×π×2
  · 조립 — 원기둥(1.1,1.4,1.3,10,1,true) + 원기둥(0.22,0.3,0.5,8)
  · 반복 — 6번
  · 색 — #7A5236 #B5673E

### `buildNPCs3D()`

  · 함께 부르는 것 — makeNPC

### `buildReedsNeo()`

  · 조립 — 원뿔(0.05,h,4)
  · 반복 — 70번
  · 색 — #8FA85C

### `buildRiverNeo()`

  · 치수 — bridgeX = riverXAtNeo(-16)
  · 조립 — 평면(16,15) + 평면(9,14) + 12면체(0.11+rand(0,0.12) + 원기둥(0.15,0.15,9.5,6)
  · 반복 — 4번
  · 색 — #D9C89E #8FC1C4 #B9AF95 #6B4A34

### `buildRocksNeo()`

  · 치수 — s = 0.3+무작위×0.6
  · 조립 — 12면체(s)

### `buildShellMoundNeo()`

  · 조립 — 구(1.7,10,7,0,π×2,0,π/2) + 12면체(0.08+rand(0,0.08)
  · 반복 — 30번
  · 색 — #D8CDB0 #EAE2CE

### `buildShrineNeo()`

  · 치수 — a = (단번호/8)×π×2
  · 조립 — 12면체(0.4+rand(0,0.2) + 원기둥(0.16,0.2,3.4,8) + 구(0.4,8,6)
  · 반복 — 8번
  · 색 — #9C9686 #5E4A32 #C4392E

### `buildTreesNeo()`

  · 치수 — s = 0.7+무작위×0.8 · tree = makeTree(s)
  · 함께 부르는 것 — makeTree

### `buildVillageNeo()`

  · 치수 — a = (단번호/7)×π×2 · jarA = 무작위×π×2 · woodA = jarA+π×0.7
  · 조립 — 원뿔(0.3,0.7,8) + 12면체(0.15) + 원기둥(0.06,0.06,1.6,5) + 원기둥(0.06,0.06,1.6,5) + 원기둥(0.04,0.04,1.8,5) + 원뿔(0.09,0.5,4) + 원기둥(0.16+rand(0,0.08) …
  · 반복 — 7번
  · 색 — #F2903D #8C8375 #6B5033 #B7C4A8 #B5673E #5E4A32

### `buildWorldNeo()`

  · 함께 부르는 것 — buildBushesNeo, buildCanoeNeo, buildFarmFieldNeo, buildFieldFenceNeo, buildFloodZoneNeo, buildGroundNeo

### `nearOccupiedNeo(x,z,clearance)`

  · (단순 조립)

### `pithouse(x,z,r,doorA)`

  · 조립 — 원기둥(r,r×1.05,0.35,12) + 원기둥(r×0.94,r,wallH,12,1,true) + 원뿔(r×1.28,roofH,12) + 원기둥(0.1,0.16,0.32,8) + 상자(0.85,wallH×0.8,0.18)
  · 색 — #8B7355 #9B8352 #5E4A32 #3F2E22

### `riverXAtNeo(z)`

  · 치수 — pts = RIVER_PTS_NEO · t = (z-z0)/(z1-z0)
  · 반복 — pts.length번


## 청동기·고조선

### `buildBorderMarkerBronze()`

  · 조립 — 원기둥(0.5,0.65,2.4,7)
  · 색 — #9C9686

### `buildCastingSiteBronze()`

  · 조립 — 원기둥(1.0,1.3,1.4,10,1,true) + 원반(0.7,16) + 상자(0.7,0.3,0.4)
  · 색 — #6B4A34 #F2903D #8B8171

### `buildCoastBronze()`

  · 조립 — 평면(150,26) + 평면(150,18)
  · 색 — #D9C89E #8FC1C4

### `buildDangunShrineBronze()`

  · 치수 — a = (단번호/5)×π×2
  · 조립 — 원기둥(0.5,0.7,6,8) + 구(3.2,10,8) + 12면체(0.35+rand(0,0.15)
  · 반복 — 5번
  · 색 — #5E4A32 #5C8A72 #9C9686

### `buildDefenseBronze()`

  · 치수 — x = -24-12+단번호×2.2
  · 조립 — 평면(26,10) + 원뿔(0.13,1.15,5)
  · 반복 — 12번
  · 색 — #6E5A3E #5E4A32

### `buildDolmenBronze(x,z,scale=1)`

  · 조립 — 상자(0.7,2.2,1.0) + 상자(5.2×scale,0.7×scale,2.6×scale)
  · 색 — #9C9686 #8B8171

### `buildDolmenFieldBronze()`

  · 조립 — 상자(0.7,2.2,1.0) + 상자(5.2,0.7,2.6)
  · 색 — #9C9686 #8B8171
  · 함께 부르는 것 — buildDolmenBronze

### `buildGroundBronze()`

  · 조립 — 평면(170,170)
  · 색 — #D9CE9C

### `buildHillsBronze()`

  · 조립 — 구(r,12,8,0,π×2,0,π/2)
  · 색 — #C7BE84

### `buildMirrorShrineBronze()`

  · 조립 — 원기둥(0.14,0.18,2.6,8) + 원반(0.6,20)
  · 색 — #5E4A32 #C9B37A

### `buildNPCsBronze()`

  · 함께 부르는 것 — makeNPC

### `buildPaddyBronze()`

  · 조립 — 평면(16,13) + 원뿔(0.16,0.5,5)
  · 반복 — 6번
  · 색 — #7E8A4A #C7B84A

### `buildStorehouseBronze(x,z)`

  · 조립 — 원기둥(0.14,0.16,1.6,6) + 상자(3.4,0.25,3.4) + 상자(2.9,1.5,2.9) + 원뿔(2.5,1.4,4)
  · 높이 — 가장 높은 부분 y≈4.00
  · 색 — #6B4A34 #8A6B45 #B9A06A #7A5236

### `buildTreesBronze()`

  · 치수 — s = 0.7+무작위×0.8 · tree = makeTree(s)
  · 함께 부르는 것 — makeTree

### `buildVillageBronze()`

  · 조립 — 원뿔(0.3,0.7,8)
  · 색 — #F2903D
  · 함께 부르는 것 — buildStorehouseBronze

### `buildWorldBronze()`

  · 함께 부르는 것 — buildBorderMarkerBronze, buildCastingSiteBronze, buildCoastBronze, buildDangunShrineBronze, buildDefenseBronze, buildDolmenFieldBronze

### `loadBronzeSpearhead(x,z,targetHeight=2.2)`

  · 치수 — targetScene = ST.scene
  · **3D 모델 파일** — `assets/bronze_age_spearhead.glb` (없으면 기본 도형으로 대체)

### `placeBronzeSpearhead(targetScene, model, x, z, targetHeight)`

  · 치수 — scale = targetHeight/size.y

### `squareHouseBronze(x,z,size,h)`

  · 조립 — 상자(size,0.3,size) + 상자(size×0.92,h,size×0.92) + 원뿔(size×0.82,h×0.9,4)
  · 색 — #8B7355 #9B8352 #7A5236


## 삼국시대

### `buildForge(x,z)`

  · 조립 — 원기둥(1.6,2,2.2,10) + 원기둥(1.1,1.1,0.3,10)
  · 높이 — 가장 높은 부분 y≈2.30
  · 색 — #5A4A3E #F2903D

### `buildNPCsSamguk()`

  · 함께 부르는 것 — makeNPC

### `buildObservatoryTower(x,z)`

  · 치수 — r = 2.2-단번호×0.18
  · 조립 — 원기둥(r,r+0.15,0.9,16) + 상자(2.6,0.5,2.6)
  · 반복 — 7번
  · 높이 — 가장 높은 부분 y≈0.50
  · 색 — #C9B98A

### `buildSamgukBaekje()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsSamguk, buildStonePagoda, buildTombMound, buildWater

### `buildSamgukGaya()`

  · 함께 부르는 것 — buildForge, buildGround, buildMountains, buildNPCsSamguk, buildTombMound, buildWater

### `buildSamgukGoguryeo()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsSamguk, buildTombMound, jRoofHanok, scatterHouses

### `buildSamgukSilla()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsSamguk, buildObservatoryTower, buildTombMound, buildTrainingGround


## 통일신라·발해

### `buildNPCsUnified()`

  · 함께 부르는 것 — makeNPC

### `buildUnifiedBalhae()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsUnified, buildStonePagoda, buildTombMound, jRoofHanok

### `buildUnifiedSilla()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsUnified, buildStonePagoda, buildTombMound, buildTrainingGround


## 고려

### `buildBongsudaeGukgyeong()`

  · 조립 — 원기둥(1.4,1.9,1.3,10) + 원뿔(0.36,0.95,8)
  · 색 — #8B8171 #F2903D

### `buildByeokrandoHarbor()`

  · 함께 부르는 것 — jRoofHanok

### `buildGagwolGanghwado()`

  · 함께 부르는 것 — jRoofHanok

### `buildGamaGangjin()`

  · 치수 — a = (단번호/7)×π×2
  · 조립 — 원기둥(1.0,1.35,1.4,10,1,true) + 원뿔(0.28,0.9,6) + 원기둥(0.2,0.28,0.5,8)
  · 반복 — 7번
  · 색 — #7A5236 #D9D4C6 #8FC1C4
  · 함께 부르는 것 — jRoofHanok

### `buildGoryeoByeokrando()`

  · 함께 부르는 것 — buildByeokrandoHarbor, buildGround, buildMountains, buildNPCsGoryeo, buildPier, buildShipHull

### `buildGoryeoGaegyeong()`

  · 함께 부르는 것 — buildGround, buildGwancheongRow, buildJeojatgeoriGaegyeong, buildMountainsWide, buildNPCsGoryeo, buildPalaceGaegyeong

### `buildGoryeoGanghwado()`

  · 함께 부르는 것 — buildFortressWall, buildGagwolGanghwado, buildGround, buildMountains, buildNPCsGoryeo, buildWater

### `buildGoryeoGangjin()`

  · 함께 부르는 것 — buildGamaGangjin, buildGround, buildMountains, buildNPCsGoryeo, scatterHouses, scatterTreesArea

### `buildGoryeoGukgyeong()`

  · 함께 부르는 것 — buildBongsudaeGukgyeong, buildFortressWall, buildGround, buildMountainsWide, buildNPCsGoryeo, scatterHouses

### `buildGoryeoHaeinsa()`

  · 함께 부르는 것 — buildGround, buildHeungdeoksa, buildJanggyeongPanjeon, buildMountains, buildNPCsGoryeo, jRoofHanok

### `buildGoryeoNamdo()`

  · 함께 부르는 것 — buildGround, buildHwapoJejakso, buildMokhwabatNamdo, buildMountains, buildNPCsGoryeo, buildShipHull

### `buildGwancheongRow()`

  · 함께 부르는 것 — jRoofHanok

### `buildHeungdeoksa()`

  · 함께 부르는 것 — buildStonePagoda, jRoofHanok

### `buildHwapoJejakso()`

  · 조립 — 원기둥(0.22,0.26,1.2,8)
  · 색 — #4A3A2A
  · 함께 부르는 것 — jRoofHanok

### `buildJanggyeongPanjeon()`

  · 조립 — 상자(9,2.4,3.6) + 상자(9.8,0.4,4.2) + 상자(0.3,0.9,0.05)
  · 반복 — 10번
  · 색 — #8B6A4A #3F2E22 #241C14

### `buildJeojatgeoriGaegyeong()`

  · 함께 부르는 것 — jRoofHanok

### `buildMokhwabatNamdo()`

  · 조립 — 평면(12,10) + 원기둥(0.03,0.04,0.5,5) + 구(0.14,7,6)
  · 반복 — 5번
  · 색 — #8A6B45 #5C8A4A #F4F0E6

### `buildNPCsGoryeo()`

  · 함께 부르는 것 — makeNPC

### `buildPalaceGaegyeong()`

  · 조립 — 상자(13,0.6,9) + 상자(w,h,d) + 원뿔(Math.max(w,d) + 상자(w,1,d)
  · 색 — #D9CBA3 #F1E6C8 #8B4A3D #B9A87F


## 조선 전기

### `buildBellPavilion()`

  · 조립 — 원기둥(0.16,0.18,3.2,8) + 원뿔(3.0,1.6,4) + 원기둥(0.5,0.62,0.9,14)
  · 색 — #6B4A34 #6B2C2C #7A6A3E

### `buildCityWallGate()`

  · 조립 — 상자(9,3,2.2) + 상자(6,2.6,2.4) + 상자(2.6,2.0,2.6) + 상자(w,h,d) + 원뿔(Math.max(w,d)
  · 색 — #9C9686 #241C14

### `buildGroundJoseon()`

  · 조립 — 평면(200,200) + 평면(6,42) + 원반(9,28)
  · 색 — #DCE0C0 #CBBB93

### `buildGroundWideJoseon(color)`

  · 조립 — 평면(200,200)

### `buildGwahakPavilion()`

  · 조립 — 원기둥(0.13,0.15,2.6,8) + 원뿔(2.6,1.2,4) + 원기둥(0.22,0.26,0.7,10) + 원기둥(0.16,0.16,0.8,10) + 원기둥(0.18,0.22,0.9,10) + 구(0.5,14,10,0,π×2,0,π/2) + 원뿔(0.03,0.55,6)
  · 색 — #5E4A32 #5B3B33 #8B8171 #B7C4C2 #3F5A6E #241C14

### `buildGyeongbokPalace()`

  · 조립 — 상자(20,0.7,15) + 상자(w,h,d) + 원뿔(Math.max(w,d) + 평면(7,5) + 원기둥(0.14,0.16,2.4,8) + 원뿔(3.6,1.3,4) + 12면체(0.7)
  · 색 — #C9BB94 #8FC1C4 #5E4A32 #5B3B33 #8B8171

### `buildJiphyeonjeon()`

  · 조립 — 상자(5.2,2.2,4) + 원뿔(4,1.4,4) + 상자(0.9,2.2,0.4) + 상자(0.35,0.08,0.06) + 상자(0.5,0.08,0.36)
  · 반복 — 4번
  · 색 — #F1E6C8 #5B3B33 #7A7468 #2A241C #C4392E

### `buildJongmyoShrine()`

  · 치수 — x = 12-4.4+단번호×1.1
  · 조립 — 상자(11,0.4,4.6) + 상자(10,2.4,3.6) + 상자(10.8,0.5,4.2) + 원기둥(0.1,0.1,2.4,6)
  · 반복 — 9번
  · 색 — #B9A87F #4A3A2A #241C14
  · 함께 부르는 것 — makeTree

### `buildJongnoMarket()`

  · 조립 — 평면(1.6,1)
  · 색 — #B23A3A
  · 함께 부르는 것 — jRoofHanok

### `buildJoseonEDonuimun()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsJoseonE, buildWestGateRoad, scatterHouses, scatterTreesArea

### `buildJoseonEGukgyeong()`

  · 함께 부르는 것 — buildGroundWideJoseon, buildMountainsWide, buildNPCsJoseonE, buildNorthernFort, buildPortWaegwan

### `buildJoseonEGyeongbok()`

  · 함께 부르는 것 — buildGround, buildGwahakPavilion, buildGyeongbokPalace, buildJiphyeonjeon, buildKilnVillageBaekja, buildMountains

### `buildJoseonEHanyang()`

  · 함께 부르는 것 — buildBellPavilion, buildGroundJoseon, buildJongnoMarket, buildMountainsWide, buildNPCsJoseonE, buildRiverWihwado

### `buildJoseonEHeunginjimun()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsJoseonE, buildSeodangSchool, scatterHouses, scatterTreesArea

### `buildJoseonEJongmyo()`

  · 함께 부르는 것 — buildGround, buildJongmyoShrine, buildMountains, buildNPCsJoseonE, scatterTreesArea

### `buildJoseonESajikdan()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsJoseonE, buildSajikAltar, scatterTreesArea

### `buildJoseonESukjeongmun()`

  · 함께 부르는 것 — buildFortressWall, buildGround, buildMountains, buildNPCsJoseonE, scatterHouses, scatterTreesArea

### `buildJoseonESungnyemun()`

  · 함께 부르는 것 — buildCityWallGate, buildGround, buildMarketRow, buildMountains, buildNPCsJoseonE, scatterHouses

### `buildKilnVillageBaekja()`

  · 치수 — a = (단번호/8)×π×2
  · 조립 — 원기둥(0.9-단번호×0.06,1.1-단번호×0.06,1.5,10,1,true) + 원뿔(0.3,1,6) + 원기둥(0.2,0.28,0.5,8) + 상자(2.6,1.6,2.2) + 원뿔(2.1,1,4)
  · 반복 — 5번
  · 색 — #7A5236 #D9D4C6 #F4F0E6 #D9CBA3 #6B4A34

### `buildMarketRow()`

  · 반복 — 5번
  · 함께 부르는 것 — jRoofHanok

### `buildNPCsJoseonE()`

  · 함께 부르는 것 — makeNPC

### `buildNorthernFort()`

  · 조립 — 원기둥(0.15,0.18,2.4,6) + 원기둥(0.1,0.12,3,6) + 상자(1.8,0.25,1.8) + 원뿔(1.5,1,4) + 원기둥(1.6,2.1,1.4,10) + 원뿔(0.4,1,8) + 원뿔(1.2,1.9,9) …
  · 반복 — 18번
  · 높이 — 가장 높은 부분 y≈3.70
  · 색 — #6B4A34 #4A3A2A #3F2E22 #8B8171 #F2903D #5A4A3E

### `buildPortWaegwan()`

  · 치수 — z = 41+단번호×3
  · 조립 — 평면(120,50) + 상자(4,0.3,16) + 원기둥(0.12,0.12,1.2,6) + 상자(2.2,0.8,5) + 원기둥(0.06,0.06,3.2,6) + 평면(1.6,2.2) + 상자(3.4,2,2.6) …
  · 반복 — 5번
  · 높이 — 가장 높은 부분 y≈2.90
  · 색 — #7FB4C7 #6B4A34 #4A3A2A #C9BB94 #5B3B33 #E8DFC8

### `buildRiverWihwado()`

  · 조립 — 평면(26,60) + 원기둥(7,7.6,0.5,16) + 원뿔(1.3,2,9) + 원기둥(0.04,0.04,3,5) + 평면(0.7,1)
  · 색 — #8FC1C4 #C9BB94 #3F5A6E #4A3A2A #C4392E

### `buildSajikAltar(x,z)`

  · 치수 — s = 6.4-단번호×1.7
  · 조립 — 상자(s,0.5,s) + 원기둥(0.15,0.17,1.7,8)
  · 반복 — 3번
  · 높이 — 가장 높은 부분 y≈0.25
  · 색 — #C9BB94 #B23A3A

### `buildSeodangSchool()`

  · 함께 부르는 것 — jRoofHanok

### `buildTreesJoseon()`

  · 치수 — lim = ST.BOUND-4 · s = 0.7+무작위×0.8 · tree = makeTree(s)
  · 함께 부르는 것 — makeTree

### `buildWestGateRoad()`

  · 조립 — 평면(26,6)
  · 색 — #CBBB93

### `buildYukjoStreet()`

  · 조립 — 상자(w,h,d) + 원뿔(Math.max(w,d) + 상자(1.1,0.4,0.06) + 상자(0.3,0.3,26)
  · 색 — #8C1F1F #B9A87F

### `loadJagyeokru(x,z,targetHeight=3.4)`

  · 치수 — targetScene = ST.scene
  · **3D 모델 파일** — `assets/clepsydra_of_changgyeonggung_palace.glb` (없으면 기본 도형으로 대체)

### `placeJagyeokru(targetScene, model, x, z, targetHeight)`

  · 치수 — scale = targetHeight/size.y


## 조선 후기

### `buildCrane(x,z)`

  · 조립 — 원기둥(0.14,0.16,4.2,6) + 상자(3.2,0.16,0.16) + 고리(0.3,0.06,6,12) + 상자(0.9,0.7,0.9)
  · 색 — #6B4A34 #3F2E22 #9C9484

### `buildJangsi(cx,cz)`

  · 치수 — post2 = post1.clone()
  · 조립 — 상자(1.6,0.06,1.6) + 원기둥(0.05,0.05,0.9,5) + 원뿔(1.3,0.5,4)
  · 색 — #8A6A4A #5C4A3A

### `buildJoseonLHanyang()`

  · 함께 부르는 것 — buildGround, buildJangsi, buildMountains, buildNPCsJoseonL, jRoofHanok, scatterHouses

### `buildJoseonLHwaseong()`

  · 함께 부르는 것 — buildCrane, buildFortressWall, buildGround, buildMountains, buildNPCsJoseonL, scatterTreesArea

### `buildJoseonLNamhae()`

  · 함께 부르는 것 — buildGround, buildMountains, buildNPCsJoseonL, buildShipHull, buildWater, scatterTreesArea

### `buildJoseonLNamhansan()`

  · 함께 부르는 것 — buildFortressWall, buildGround, buildMountains, buildNPCsJoseonL, scatterTreesArea

### `buildNPCsJoseonL()`

  · 함께 부르는 것 — makeNPC


## 일제강점기

### `buildAunaeMarket()`

  · 치수 — post2 = post1.clone()
  · 조립 — 상자(1.6,0.06,1.6) + 원기둥(0.05,0.05,1.4,5) + 원뿔(1.3,0.5,4)
  · 색 — #8A6A4A #5C4A3A

### `buildAunaeVillage()`

  · 함께 부르는 것 — scatterHouses

### `buildBattleField()`

  · 조립 — 12면체(0.7+rand(0,0.6)
  · 색 — #8B8171

### `buildCheonanGateSign()`

  · 조립 — 원기둥(0.12,0.15,2.6,6)
  · 색 — #6B4A34

### `buildCheonanGround()`

  · 조립 — 평면(70,70)
  · 색 — #DCD2AA

### `buildColonialCheonan()`

  · 함께 부르는 것 — buildAunaeMarket, buildAunaeVillage, buildCheonanGround, buildNPCsColonial, scatterTreesArea

### `buildColonialGround()`

  · 조립 — 평면(200,200) + 평면(7,160) + 평면(160,7)
  · 높이 — 가장 높은 부분 y≈0.01
  · 색 — #C9C2AE #8A8375

### `buildColonialGunsan()`

  · 함께 부르는 것 — buildGunsanGround, buildGunsanPort, buildImpiStation, buildNPCsColonial

### `buildColonialHazeHills()`

  · 조립 — 원뿔(6+rand(0,3)
  · 반복 — 16번
  · 색 — #9C9484

### `buildColonialHub()`

  · 함께 부르는 것 — buildCheonanGateSign, buildColonialGround, buildColonialHazeHills, buildDosiRow, buildGovStreet, buildHubTrees

### `buildColonialManchuria()`

  · 함께 부르는 것 — buildBattleField, buildIndependenceCamp, buildManchuriaGround, buildMountains, buildNPCsColonial

### `buildColonialShanghai()`

  · 함께 부르는 것 — buildHongkouPark, buildNPCsColonial, buildProvisionalGovt, buildShanghaiGround

### `buildDosiRow()`

  · 조립 — 원뿔(1.2,1.1,7)
  · 색 — #9C8B6A

### `buildGovStreet()`

  · 조립 — 구(2.1,14,10,0,π×2,0,π/2)
  · 색 — #8A8375

### `buildGunsanGround()`

  · 조립 — 평면(70,70) + 평면(60,26)
  · 색 — #B9C4C7 #7FB4C7

### `buildGunsanPort()`

  · 조립 — 구(0.5,8,6)
  · 반복 — 6번
  · 색 — #D9C99A
  · 함께 부르는 것 — buildPier, buildShipHull

### `buildHongkouPark()`

  · 치수 — t = makeTree(0.8)
  · 조립 — 원반(6,20) + 상자(2,0.6,1.2)
  · 색 — #7FA06E #9C9484
  · 함께 부르는 것 — makeTree

### `buildHubTrees()`

  · 치수 — t = makeTree(0.7+무작위×0.6)
  · 함께 부르는 것 — makeTree

### `buildImpiStation()`

  · 치수 — rail2 = rail1.clone()
  · 조립 — 상자(0.12,0.06,20) + 상자(1.8,0.06,0.22)
  · 반복 — 8번
  · 색 — #4A4438 #5C4A3A

### `buildIndependenceCamp()`

  · 조립 — 원뿔(1.3,2,9) + 상자(6,2.6,3.4) + 원기둥(0.05,0.05,4,6)
  · 색 — #5A4A3E #8C7A5E #4A3A2A

### `buildJongno()`

  · 반복 — 5번
  · 함께 부르는 것 — jRoofHanok

### `buildManchuriaGround()`

  · 조립 — 평면(110,110)
  · 색 — #B9AE8C

### `buildMitsukoshi()`

  · 조립 — 상자(3,0.5,0.1)
  · 색 — #C4392E

### `buildNPCsColonial()`

  · 함께 부르는 것 — makeNPC

### `buildPortSign()`

  · 조립 — 평면(50,20) + 상자(3,0.3,10)
  · 색 — #7FB4C7 #6B4A34

### `buildProvisionalGovt()`

  · 조립 — 상자(6,5,4) + 상자(3,0.5,0.1) + 상자(4,3.6,3.5) + 상자(4,4.2,3.5)
  · 색 — #8C7F6E #3A2E1E #7A7267 #8A8375

### `buildSchool()`

  · 조립 — 평면(8,6) + 원기둥(0.06,0.06,4,6)
  · 색 — #B7AE93 #8A8375

### `buildShanghaiGround()`

  · 조립 — 평면(80,80) + 평면(6,60)
  · 높이 — 가장 높은 부분 y≈0.01
  · 색 — #A9A6A0 #847E75

### `buildStationGate()`

  · (단순 조립)

### `buildTapgolPark()`

  · 치수 — t = makeTree(0.9)
  · 조립 — 원기둥(0.35,0.4,3.4,8) + 원기둥(0.35,0.4,3.4,8) + 상자(5.2,0.4,0.6) + 상자(1.6-단번호×0.15,0.5,1.6-단번호×0.15)
  · 반복 — 6번
  · 높이 — 가장 높은 부분 y≈0.30
  · 색 — #7A2E2E #B7B09B
  · 함께 부르는 것 — makeTree


## 광복과 6·25

### `buildBarbedWire(x,z,len,axis)`

  · 치수 — t = (단번호/n-0.5)×len
  · 조립 — 원기둥(0.06,0.07,1.1,6) + 상자(axis==='x'?len:0.03,0.03,axis==='x'?0.03:len)
  · 색 — #4A4438 #8A8375

### `buildBrokenBridge(x,z,len)`

  · 치수 — seg2 = seg1.clone()
  · 조립 — 상자(0.15,0.6,len×0.42) + 상자(4,0.5,len×0.42) + 원기둥(0.5,0.65,1.6,8)
  · 색 — #8B8171 #6E6455
  · 함께 부르는 것 — buildRubble

### `buildBunker(x,z,rotY)`

  · 조립 — 상자(3.2,1.4,2.4) + 구(2.2,10,6,0,π×2,0,π/2) + 상자(1.6,0.3,0.1)
  · 높이 — 가장 높은 부분 y≈0.70
  · 색 — #8B8878 #7A8A5E #1A1812

### `buildCapitolBuilding(x,z)`

  · 조립 — 구(1.8,14,10,0,π×2,0,π/2) + 원기둥(0.05,0.05,2,6)
  · 높이 — 가장 높은 부분 y≈5.40
  · 색 — #8A8375 #4A3A2A

### `buildCrates(x,z,n)`

  · 조립 — 상자(s,s,s)
  · 반복 — n번
  · 색 — #8A6A4A

### `buildCzechHedgehogs(x,z,n)`

  · 조립 — 상자(1.3,0.14,0.14)
  · 반복 — n번
  · 색 — #5C5A50

### `buildMarketStalls(x,z,n)`

  · 치수 — post2 = post1.clone()
  · 조립 — 상자(1.6,0.06,1.6) + 원기둥(0.05,0.05,1.4,5) + 원뿔(1.3,0.5,4)
  · 반복 — n번
  · 색 — #8A6A4A #5C4A3A

### `buildMemorialFence(x,z,len)`

  · 조립 — 평면(0.25,0.5)
  · 반복 — 10번
  · 함께 부르는 것 — buildBarbedWire

### `buildNPCsWar()`

  · 함께 부르는 것 — makeNPC

### `buildRubble(x,z,n)`

  · 치수 — s = 0.4+무작위×0.6
  · 조립 — 상자(s,s×0.7,s)
  · 반복 — n번
  · 색 — #9A9284

### `buildRuinedHouse(x,z)`

  · 함께 부르는 것 — buildRubble

### `buildShantyHouse(x,z,rotY)`

  · 조립 — 상자(1.5+rand(0,0.5) + 상자(body.geometry.parameters.width+0.3,0.08,body.geometry.parameters.depth+0.3)
  · 색 — #6E6455

### `buildShantyTown(x,z,n)`

  · 반복 — n번
  · 함께 부르는 것 — buildShantyHouse

### `buildTankHull(x,z,rotY)`

  · 조립 — 상자(2.2,0.9,3.6) + 원기둥(0.8,0.9,0.6,10) + 원기둥(0.08,0.08,2,8) + 상자(0.4,0.6,3.8)
  · 높이 — 가장 높은 부분 y≈1.45
  · 색 — #5C6048 #2E2A22

### `buildTentSchool(x,z)`

  · 조립 — 원뿔(3.4,2.6,4) + 상자(2,1.2,0.08) + 상자(2.2,0.3,0.4)
  · 반복 — 3번
  · 색 — #8C7A5E #2E3B2E #7A6A4A

### `buildVotingBooth(x,z)`

  · 조립 — 상자(1.6,2,1.4) + 상자(1.9,0.15,1.7) + 상자(0.6,0.5,0.5)
  · 높이 — 가장 높은 부분 y≈2.05
  · 색 — #D9CFB8 #8A6A4A #3F5A8C

### `buildWarBusan()`

  · 조립 — 평면(120,120)
  · 색 — #E7D9AE
  · 함께 부르는 것 — buildMarketStalls, buildNPCsWar, buildPier, buildShantyTown, buildShipHull, buildTentSchool

### `buildWarHungnam()`

  · 함께 부르는 것 — buildCrates, buildGround, buildNPCsWar, buildPier, buildShipHull, buildTankHull

### `buildWarIncheon()`

  · 함께 부르는 것 — buildCzechHedgehogs, buildGround, buildNPCsWar, buildPier, buildShipHull, buildWater

### `buildWarNakdong()`

  · 함께 부르는 것 — buildBarbedWire, buildBunker, buildGround, buildNPCsWar, buildWatchtower, buildWater

### `buildWarSeoul()`

  · 함께 부르는 것 — buildBrokenBridge, buildCapitolBuilding, buildGround, buildMemorialFence, buildNPCsWar, buildRuinedHouse

### `buildWatchtower(x,z)`

  · 조립 — 원기둥(0.09,0.11,3.4,6) + 상자(2.2,0.2,2.2) + 원뿔(1.7,0.9,4)
  · 높이 — 가장 높은 부분 y≈4.30
  · 색 — #6B4A34 #5C4A3A #4A3A2A

### `buildWell(x,z)`

  · 조립 — 원기둥(0.7,0.75,0.6,12) + 원기둥(0.06,0.06,1.4,6) + 원기둥(0.04,0.04,1.4,6) + 구(0.3,8,6)
  · 반복 — 4번
  · 높이 — 가장 높은 부분 y≈0.30
  · 색 — #8B8171 #6B4A34 #8C6A4A

### `sandbagRow(x,z,len,axis)`

  · 치수 — n = Math.round(len/0.9) · t = (단번호-n/2)×0.9
  · 조립 — 구(0.42,8,6)
  · 반복 — n번
  · 색 — #B7A97E

### `tentCluster(x,z,color,n)`

  · 치수 — a = (단번호/n)×π×2
  · 조립 — 원뿔(1.1,1.8,8)
  · 반복 — n번

