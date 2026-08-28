/* ══════════════════════════════════════════════════════════════════════
   asset-credits.js — 자료 출처와 저작권 (MASTER.md §9-6)

   ● PHOTOS 블록은 assets/photos/CREDITS.md 에서 만들어집니다.
     고치려면 CREDITS.md 를 고치고 `node tools/gen-credits.mjs` 를 다시 돌리세요.
   ● ATLAS_CREDITS_EXTRA 는 손으로 적는 곳입니다. append-only —
     새 자료를 넣은 사람이 배열 끝에 자기 항목만 더하고, 남의 항목은 지우지 않습니다.

   CC BY-SA 사진은 저작자 이름을 그대로 표시해야 합니다. 줄이거나 다듬지 마세요.
   ══════════════════════════════════════════════════════════════════════ */

var ATLAS_CREDITS_PHOTOS = [
  { file:"baekja-2.jpg", item:"baekja", orig:"hb_43798363", author:"Hiart", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"baekja.jpg", item:"baekja", orig:"hb_84959535", author:"Ismoon (talk) 10:44, 14 December 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bipa.jpg", item:"bipa", orig:"hb_43785609", author:"Prof. Gary Lee Todd", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bitsal.jpg", item:"bitsal", orig:"hb_30687085", author:"Szilas", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bulguksa.jpg", item:"bulguksa", orig:"hb_75717042", author:"Leonard J. DeFrancisci", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheomseongdae.jpg", item:"cheomseongdae", orig:"hb_50078045", author:"Zsinj", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheongja.jpg", item:"cheongja", orig:"hb_22047484", author:"The original uploader was Korea history at English", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daedongyeo.jpg", item:"daedongyeo", orig:"hb_94069864", author:"Gim Jeong-ho", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daehan.jpg", item:"daehan", orig:"hb_70108878", author:"Joseph de La Nézière", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daejoyeong.jpg", item:"daejoyeong", orig:"hb_88138414", author:"Good friend100 (talk) 01:13, 29 January 2008 (UTC)", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"daewongun.jpg", item:"daewongun", orig:"hb_32196305", author:"Hulbert, Homer B.", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"dangun-2.jpg", item:"dangun", orig:"hb_9215304", author:"Salamander724", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"dangun.jpg", item:"dangun", orig:"hb_68979560", author:"User:CatOnMars", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"galdol.jpg", item:"—", orig:"갈판(碾石, 연석) 신수22909", author:"국립중앙박물관", license:"공공누리 제1유형", source:'국립중앙박물관 소장품 검색', sourceUrl:'https://www.museum.go.kr/site/main/relic/search/view?relicId=167917' },
  { file:"ganggamchan.jpg", item:"ganggamchan", orig:"hb_65844808", author:"War Memorial of Korea Open Archives", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ganghwa-dolmen.jpg", item:"ganghwa-dolmen", orig:"hb_33610823", author:"ChongDae", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ganghwa-treaty.jpg", item:"ganghwa-treaty", orig:"hb_25966186", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gansingi.jpg", item:"—", orig:"뒤지개(석기 세 점) 신수22887", author:"국립중앙박물관", license:"공공누리 제1유형", source:'국립중앙박물관 소장품 검색', sourceUrl:'https://www.museum.go.kr/site/main/relic/search/view?relicId=4433' },
  { file:"garakbakwi.jpg", item:"ganseok", orig:"가락바퀴 (신석기 시대)", author:"국립중앙박물관", license:"공공누리 제1유형", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gaya-iron.jpg", item:"gaya-iron", orig:"hb_13193622", author:"Gary Lee Todd, Ph.D.", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"geumdong.jpg", item:"geumdong", orig:"hb_71497777", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"geumgwan.jpg", item:"geumgwan", orig:"hb_54725302", author:"Gary Todd", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwahak-2.jpg", item:"gwahak", orig:"hb_75338454", author:"Nina R from Africa", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwahak.jpg", item:"gwahak", orig:"hb_9384606", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwanggaeto-2.jpg", item:"gwanggaeto", orig:"hb_40111140", author:"Prcshaw", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwanggaeto.jpg", item:"gwanggaeto", orig:"hb_39651435", author:"Yumeto", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gyeongbok.jpg", item:"gyeongbok", orig:"hb_22180013", author:"Basile Morin", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hansando-2.jpg", item:"hansando", orig:"hb_29998068", author:"Byeon Bak", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hansando.jpg", item:"hansando", orig:"hb_84359976", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_14637964.jpg", item:"—", orig:"hb_14637964", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_22281302.jpg", item:"—", orig:"hb_22281302", author:"Ismoon (talk) 21:12, 9 July 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_23230617.jpg", item:"—", orig:"hb_23230617", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_30783945.jpg", item:"—", orig:"hb_30783945", author:"Abasaa", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_32134913.jpg", item:"—", orig:"hb_32134913", author:"The government of the Kingdom of Great(er) Joseon.", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_36423147.jpg", item:"—", orig:"hb_36423147", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_3834244.jpg", item:"—", orig:"hb_3834244", author:"Trainholic", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_39033938.jpg", item:"—", orig:"hb_39033938", author:"Likely Samuel Austin Moffett", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_49092074.jpg", item:"—", orig:"hb_49092074", author:"the Chosun Bimbo (https://www.flickr.com/photos/46", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_52180914.jpg", item:"—", orig:"hb_52180914", author:"Kang Byeong Kee, 강병기", license:"CC BY 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_55362657.jpg", item:"—", orig:"hb_55362657", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_61234265.jpg", item:"—", orig:"hb_61234265", author:"Contax3", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_66709271.jpg", item:"—", orig:"hb_66709271", author:"고려", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_69686179.jpg", item:"—", orig:"hb_69686179", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_70903956.jpg", item:"—", orig:"hb_70903956", author:"Steve46814", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_73347898.jpg", item:"—", orig:"hb_73347898", author:"Wikimedia Commons", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_78111482.jpg", item:"—", orig:"hb_78111482", author:"정초(鄭招), 변효문(卞孝文)", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_83468505.jpg", item:"—", orig:"hb_83468505", author:"Unknown artistUnknown artist", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_86380536.jpg", item:"—", orig:"hb_86380536", author:"Academy of Korean Studies", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_88642026.jpg", item:"—", orig:"hb_88642026", author:"User:Gapo", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_89187976.jpg", item:"—", orig:"hb_89187976", author:"Gyeongin Railway Co. Ltd., probably", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hb_94123189.jpg", item:"—", orig:"hb_94123189", author:"猫猫的日记本", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hwaseong.jpg", item:"hwaseong", orig:"hb_39333144", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jeongok.jpg", item:"jeongok", orig:"hb_50982713", author:"Ismoon (talk) 19:51, 23 May 2018 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jikji.jpg", item:"jikji", orig:"hb_11634954", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jongmyo.jpg", item:"jongmyo", orig:"hb_75846400", author:"Cultural Heritage Administration", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"kimhongdo.jpg", item:"kimhongdo", orig:"hb_70474534", author:"Kim Hong-do", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"mireuksa.jpg", item:"mireuksa", orig:"hb_3952844", author:"Bernard Gagnon", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"moneagi.jpg", item:"moneagi", orig:"hb_39150857", author:"Unknown photographerUnknown photographer", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"mugujeonggwang.jpg", item:"mugujeonggwang", orig:"hb_66576255", author:"Naturehead", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"muryeong.jpg", item:"muryeong", orig:"hb_23444134", author:"en:Gihoon81", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"muyongchong.jpg", item:"muyongchong", orig:"hb_42726041", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"namhansan.jpg", item:"namhansan", orig:"hb_80523512", author:"Steve46814 (talk)", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"palman.jpg", item:"palman", orig:"hb_56800902", author:"Lauren Heckler (the Flickr ID is malpuella) at Fli", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"pansori.jpg", item:"pansori", orig:"hb_25468906", author:"originally by photoren", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sambyeolcho.jpg", item:"sambyeolcho", orig:"hb_36774372", author:"Chipmunkdavis", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sejong.jpg", item:"sejong", orig:"hb_43464725", author:"Government of Joseon", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"seohee.jpg", item:"seohee", orig:"hb_59304179", author:"玖巧仔", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"seokguram.jpg", item:"seokguram", orig:"hb_69204044", author:"Cultural Heritage Administration", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"silhak.jpg", item:"silhak", orig:"hb_11603435", author:"Wikimedia Commons", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sungnyemun.jpg", item:"sungnyemun", orig:"hb_45293754", author:"Sean Young (@assanges)", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"suro.jpg", item:"suro", orig:"hb_18964888", author:"HappyMidnight", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"bi-gwanggaeto.jpg", item:"bi-gwanggaeto", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"seokchon.jpg", item:"seokchon", orig:"—", author:"Paulsbgo", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"chiljido.jpg", item:"chiljido", orig:"—", author:"Gary Todd from Xinzheng, China", license:"CC0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"goryeong.jpg", item:"goryeong", orig:"—", author:"Korea Heritage Service", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sillauisik.jpg", item:"sillauisik", orig:"—", author:"bifyu (a flickr user)", license:"CC BY-SA 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"maekjeok.jpg", item:"maekjeok", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jumong.jpg", item:"jumong", orig:"—", author:"The Australian National University", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jangsu.jpg", item:"jangsu", orig:"—", author:"Prcshaw", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"onjo.jpg", item:"onjo", orig:"—", author:"en:User:Straitgate", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hyeokgeose.jpg", item:"hyeokgeose", orig:"—", author:"Cultural Heritage Authority (of Korea)", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"icadon.jpg", item:"icadon", orig:"—", author:"Love29son", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jinheung.jpg", item:"jinheung", orig:"—", author:"National Museum of Korea", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"salsu.jpg", item:"salsu", orig:"—", author:"Ebadollah", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ansiseong.jpg", item:"ansiseong", orig:"—", author:"Rincewind42 [2]", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hwangsan.jpg", item:"hwangsan", orig:"—", author:"War Memorial of Korea Open Archives", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gwansanseong.jpg", item:"gwansanseong", orig:"—", author:"문화재청", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"jinju.jpg", item:"jinju", orig:"—", author:"Kang Byeong Kee", license:"CC BY 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"tongsinsa.jpg", item:"tongsinsa", orig:"—", author:"Appleysj", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sangpyeongtongbo.jpg", item:"sangpyeongtongbo", orig:"—", author:"Donald Trung Quoc Don (Chữ Hán: 徵國單) - Wikimedia Commons - © CC BY-SA 4.0 International.(Want to use this image?)Original publication 📤: --Donald Trung 『徵國單』 (No Fake News 💬) (WikiProject Numismatics 💴) (Articles 📚) 19:14, 28 November 2019 (UTC)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hangeulsoseol.jpg", item:"hangeulsoseol", orig:"—", author:"Anoymous", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"uibyeong.jpg", item:"uibyeong", orig:"—", author:"Unknown authorUnknown author", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"tangpyeong.jpg", item:"tangpyeong", orig:"—", author:"Chae Yong-sin / Jo Seokjin", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheonjugyo.jpg", item:"cheonjugyo", orig:"—", author:"Matthew smith 254", license:"CC BY-SA 3.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"donghak-changje.jpg", item:"donghak-changje", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"cheokhwabi.jpg", item:"cheokhwabi", orig:"—", author:"문화재청 (공공누리 제1유형)", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"dongnimmun.jpg", item:"dongnimmun", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"gukgwon.jpg", item:"gukgwon", orig:"—", author:"Willard D. Straight", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"yugwansun.jpg", item:"yugwansun", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"samil.jpg", item:"samil", orig:"—", author:"Jo So-ang (1887–1958)", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"joseoneo.jpg", item:"joseoneo", orig:"—", author:"LERK", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ssalsutal.jpg", item:"ssalsutal", orig:"—", author:"Korea Tourism Organiazation (한국관광공사)", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sinheung.jpg", item:"sinheung", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"chongseongeo.jpg", item:"chongseongeo", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"hangang-gyo.jpg", item:"hangang-gyo", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"heungnam.jpg", item:"heungnam", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"boatman.jpg", item:"boatman", orig:"—", author:"Unknown authorUnknown author", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"pinanjip.jpg", item:"pinanjip", orig:"—", author:"한국저작권위원회", license:"CC BY 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"muljigye.jpg", item:"muljigye", orig:"—", author:"국립민속박물관", license:"KOGL Type 1", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"sijang.jpg", item:"sijang", orig:"—", author:"Christophe95", license:"CC BY-SA 4.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"chinain.jpg", item:"chinain", orig:"—", author:"cezzie901", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"milmyeon.jpg", item:"milmyeon", orig:"—", author:"by shizu k (shezzz) at Flickr", license:"CC BY-SA 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"amnok.jpg", item:"amnok", orig:"—", author:"Caitriana Nicholson from 北京 ~ Beijing, 中国 ~ China", license:"CC BY-SA 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"armistice.jpg", item:"armistice", orig:"—", author:"United States Department of State", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"isan.jpg", item:"isan", orig:"—", author:"Rbtjd0201(talk / Contributions) at the Korean Wikipedia", license:"Public domain", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"ireumdoro.jpg", item:"ireumdoro", orig:"—", author:"JoshBerglund19", license:"CC BY 2.0", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' },
  { file:"umjip.jpg", item:"umjip-yumul", orig:"Korea-Seoul-Amsadong-Neolithic.age-01.jpg", author:"Jtm71", license:"CC BY-SA 2.0 KR", source:'위키미디어 공용', sourceUrl:'https://commons.wikimedia.org/' }
];

var ATLAS_CREDITS_EXTRA = [
  { file:'countries-50m.json', item:'지도 원본', author:'Natural Earth', license:'퍼블릭 도메인',
    source:'Natural Earth 1:50m', sourceUrl:'https://www.naturalearthdata.com/' },
  { file:'vendor/three', item:'3D 엔진', author:'three.js 기여자들', license:'MIT',
    source:'three.js 0.160.0', sourceUrl:'https://threejs.org/' },
  { file:'vendor/font', item:'글꼴', author:'길형진 (orioncactus)', license:'SIL OFL 1.1',
    source:'Pretendard v1.3.9', sourceUrl:'https://github.com/orioncactus/pretendard' },
  { file:'*.glb', item:'3D 모델 9점', author:'', license:'미확인',
    source:'출처와 이용 조건을 확인하기 전까지 앱에서 부르지 않습니다', sourceUrl:'' },
  { file:'assets/Models', item:'저폴리 키트 22점', author:'', license:'미확인',
    source:'라이선스 파일이 동봉되지 않아 사용을 보류했습니다', sourceUrl:'' },
  { file:'교과 내용', item:'학습 내용', author:'', license:'',
    source:'초등학교 5학년 2학기 사회 교과서 및 2022 개정 교육과정 문서를 참고해 새로 썼습니다', sourceUrl:'' },
  { file:'assets/kenney/bricks', item:'브릭 조각 74점 — 움집·가마·제단 따위를 쌓는 데 씁니다', author:'Kenney', license:'CC0 1.0',
    source:'Kenney Brick Kit 1.0', sourceUrl:'https://kenney.nl/assets/brick-kit' },
  { file:'assets/kenney/nature', item:'자연 조각 33점 — 풀과 바위를 뿌리는 데 씁니다', author:'Kenney', license:'CC0 1.0',
    source:'Kenney Nature Kit 2.1', sourceUrl:'https://kenney.nl/assets/nature-kit' },
  { file:'assets/kenney/characters', item:'캐릭터 12점 — 아직 앱에서 부르지 않습니다', author:'Kenney', license:'CC0 1.0',
    source:'Kenney Mini Characters 1.0', sourceUrl:'https://kenney.nl/assets/mini-characters' },
  { file:'assets/fonts', item:'글꼴 — 신라문화체(Medium·Bold)', author:'경주시', license:'공공누리 제1유형',
    source:'경주서체', sourceUrl:'https://www.gyeongju.go.kr/open_content/ko/page.do?mnu_uid=3288' }
];

(function (g) {
  var byFile = {};
  ATLAS_CREDITS_PHOTOS.forEach(function (c) { byFile[c.file] = c; });

  function find(file) {
    if (!file) return null;
    var name = String(file).split('/').pop();
    return byFile[name] || byFile[name.replace(/\.(jpg|jpeg|png|webp)$/i, '') + '.jpg'] || null;
  }

  /** 사진 아래에 적을 한 줄. 확인되지 않은 항목은 빈 줄을 만들지 않는다 */
  function creditLine(file) {
    var c = find(file);
    if (!c) return '';
    var bits = [];
    if (c.author) bits.push(c.author);
    if (c.license) bits.push(c.license);
    if (c.source) bits.push(c.source);
    return bits.join(' · ');
  }

  function all() {
    return { photos: ATLAS_CREDITS_PHOTOS.slice(), extra: ATLAS_CREDITS_EXTRA.slice() };
  }

  g.AtlasCredits = { find: find, creditLine: creditLine, all: all,
                     PHOTOS: ATLAS_CREDITS_PHOTOS, EXTRA: ATLAS_CREDITS_EXTRA };
})(typeof window !== 'undefined' ? window : globalThis);
