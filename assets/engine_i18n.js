/* Translations for the simulation engine. Loaded after i18n.js and before engine.js. */
(function () {
  "use strict";
  if (!window.I18N) return;
  var rows = [
    ["engine.stakes.income", "収入", "income"],
    ["engine.stakes.health", "健康", "health"],
    ["engine.stakes.happiness", "気力", "wellbeing"],
    ["engine.stakes.family", "家族・つながり", "family"],
    ["engine.stakes.education", "学び", "learning"],
    ["engine.stakes.debt", "借金", "debt"],
    ["engine.stakes.educationPath", "進学・修了", "education path"],
    ["engine.stakes.familyPath", "家族の暮らし", "family life"],
    ["engine.stakes.workPath", "働き方", "work path"],
    ["engine.stakes.insurancePath", "年金加入見込み", "pension access"],
    ["engine.stakes.noChange", "暮らしに大きな変化はありませんでした。", "no major lasting change"],
    ["engine.stakes.high", "高い", "high"],
    ["engine.stakes.normal", "ふつう", "moderate"],
    ["engine.stakes.low", "低い", "low"],
    ["engine.stakes.training.none", "追加要件なし", "no further training"],
    ["engine.stakes.training.primary", "初等教育", "primary school"],
    ["engine.stakes.training.secondary", "中等教育", "secondary school"],
    ["engine.stakes.training.univ", "高等教育", "higher education"],
    ["engine.stakes.followup", "{years}年前に「{choice}」を選びました。その後、{outcome}", "{years} years after “{choice}”: {outcome}"],
    ["engine.stakes.followup_one", "去年「{choice}」を選びました。その後、{outcome}", "Last year you chose “{choice}”: {outcome}"],
    ["engine.chronic.diabetes", "糖尿病", "diabetes"],
    ["engine.chronic.hypertension", "高血圧", "hypertension"],
    ["engine.chronic.hiv", "HIV", "HIV"],
    ["engine.chronic.tb", "結核", "tuberculosis"],
    ["engine.chronic.copd", "慢性閉塞性肺疾患", "COPD"],
    ["engine.chronic.depression", "うつ病", "depression"],
    ["engine.chronic.diagnosed", "{condition}と分かり、治療を続けることになりました。", "You were diagnosed with {condition} and began ongoing care."],
    ["engine.chronic.treatmentCost", "{condition}の治療費", "treatment for {condition}"],
    ["engine.chronic.followup", "{condition}の治療を続け、今年の費用は約{cost}でした。", "Care for {condition} continued, costing about {cost} this year."],
    ["engine.chronic.tbRecovered", "結核の治療を終えました。", "You completed tuberculosis treatment."],
    ["engine.chronic.cause.diabetes", "糖尿病の合併症", "complications of diabetes"],
    ["engine.chronic.cause.hypertension", "脳卒中", "stroke"],
    ["engine.chronic.cause.hiv", "HIV/エイズ関連の病気", "HIV/AIDS-related illness"],
    ["engine.chronic.cause.tb", "結核", "tuberculosis"],
    ["engine.chronic.cause.copd", "慢性閉塞性肺疾患（COPD）", "chronic obstructive pulmonary disease (COPD)"],
    ["engine.story.unknown", "この人", "this person"],
    ["engine.history.marriage", "{name}と暮らしをともにし始めました。", "They began sharing a life with {name}."],
    ["engine.history.parent_care", "{name}の世話を引き受けました。", "They took on care for {name}."],
    ["engine.history.child_illness", "{name}が病気になり、家族で治療と看病を続けました。", "When {name} became ill, the family arranged treatment and care."],
    ["engine.history.child_recovered", "{name}の体調が戻り、また日々の暮らしを始めました。", "{name} recovered and returned to everyday life."],
    ["engine.history.child_care_cost", "{name}の治療", "treatment for {name}"],
    ["engine.history.child_school", "{name}が学校に通いはじめました。", "{name} started school."],
    ["engine.history.child_marriage", "{name}が結婚し、新しい家庭を持ちました。", "{name} married and began a new household."],
    ["engine.history.child_education", "{name}の進学を支えました。", "They helped {name} continue school."],
    ["engine.history.child_support", "{name}が暮らしを支えてくれました。", "{name} helped with living costs."],
    ["engine.history.child_education_result", "進学を支えると、{name}はその後も学び続けました。", "After that support, {name} continued studying."],
    ["engine.history.grandchild", "{name}に子どもが生まれ、孫が{count}人になりました。", "{name} had a child, bringing the number of grandchildren to {count}."],
    ["engine.history.child_generic", "子ども", "their child"],
    ["engine.history.school_start", "学校に通いはじめました。", "They started school."],
    ["engine.history.family_origin", "{mother}と{father}が幼い日々を見守りました。", "{mother} and {father} cared for them in childhood."],
    ["engine.history.move", "{from}から{to}へ暮らしを移しました。", "They moved from {from} to {to}."],
    ["engine.history.level.primary", "初等教育", "primary school"],
    ["engine.history.level.secondary", "中等教育", "secondary school"],
    ["engine.history.level.univ", "大学", "university"],
    ["engine.history.story.birth", "{year}年、{name}は{place}で生まれました。", "{name} was born in {place} in {year}."],
    ["engine.history.story.family_origin", "母{mother}と父{father}に見守られて育ちました。", "After that, their mother {mother} and father {father} shaped their childhood."],
    ["engine.history.story.school_finish", "{firstYear}年に{level}へ進み、{year}年に修了しました。", "Starting {level} in {firstYear} led to its completion in {year}."],
    ["engine.history.story.work_start", "{year}年、{place}で{job}の仕事を始めました。", "After their earlier experiences, they began work as {jobPhrase} in {place} in {year}."],
    ["engine.history.story.move", "{year}年、{from}から{to}へ移り住みました。", "After those years, they moved from {from} to {to} in {year}."],
    ["engine.history.story.child_birth", "{spouse}と暮らすなか、{year}年に{person}が生まれました。", "After building a life with {spouse}, they welcomed {person} in {year}."],
    ["engine.history.story.child_school", "{person}は{year}年に学校へ通い始めました。", "After {person} was born, they saw that child start school in {year}."],
    ["engine.history.story.child_education", "{year}年には{person}の進学を支えました。", "To help {person} keep learning, they supported further schooling in {year}."],
    ["engine.history.story.child_education_result", "支えを受けた{person}は、{year}年も学び続けました。", "Because they supported further schooling, {person} kept studying in {year}."],
    ["engine.history.story.child_support", "{year}年、育ててきた{person}が生活費を助けてくれました。", "After years spent raising {person}, they received help with living costs in {year}."],
    ["engine.history.story.child_marriage", "{person}は成長し、{year}年に結婚しました。", "After watching {person} grow up, they saw that child's marriage in {year}."],
    ["engine.history.story.child_recovered", "家族で看病した{person}は、{year}年に回復しました。", "After the family cared for {person} through illness, that child recovered in {year}."],
    ["engine.history.story.parent_care", "幼いころに世話をしてくれた{person}を、{year}年には介護しました。", "After being cared for as a child, they in turn cared for {person} in {year}."],
    ["engine.history.story.dream_achieved", "{year}年、選んだ夢をかなえました。", "Through those experiences, they reached their chosen dream in {year}."],
    ["engine.history.story.remember", "晩年にも{person}と過ごした日々を思い出しました。", "In later years, they remembered the days shared with {person}."],
    ["engine.history.story.early_remember", "{person}とも一緒に過ごしました。", "{person} shared that time with them."],
    ["engine.history.story.link", "{first} やがて、{second}", "{first} That experience led to {second}"],
    ["engine.story.birth.0", "{year}年、{name}は{place}で生まれました。", "{name} was born in {place} in {year}."],
    ["engine.story.birth.1", "{year}年、{place}に{name}が生まれました。", "In {year}, {place} became {name}'s first home."],
    ["engine.story.birth.2", "{name}の歩みは、{year}年の{place}から始まりました。", "{name}'s life began in {place} in {year}."],
    ["engine.story.parents.0", "幼いころは、母{mother}と父{father}が見守ってくれました。", "Their earliest days were shared with their mother {mother} and father {father}."],
    ["engine.story.parents.1", "幼いころの家には、{mother}と{father}がいました。", "{mother} and {father} were there in the childhood home."],
    ["engine.story.spouseChild.0", "{spouse}と暮らすなか、{year}年に{child}が生まれました。", "While sharing a life with {spouse}, they welcomed {child} in {year}."],
    ["engine.story.spouseChild.1", "{year}年に{child}が生まれ、{spouse}と重ねる日々も変わりました。", "The arrival of {child} in {year} changed the days shared with {spouse}."],
    ["engine.story.child.0", "{year}年、子どもの{child}が生まれました。", "Their child {child} was born in {year}."],
    ["engine.story.child.1", "{child}を迎えた{year}年は、暮らしの節目になりました。", "The year {year} brought {child} into their life."],
    ["engine.story.spouse.0", "{spouse}と暮らしをともにしました。", "They made a home with {spouse}."],
    ["engine.story.spouse.1", "日々の多くを{spouse}と分かち合いました。", "Many ordinary days were shared with {spouse}."],
    ["engine.story.workMove.0", "{job}の仕事を{years}年続け、{from}から{to}へ移り住みました。", "They worked as {jobPhrase} for {years} years and moved from {from} to {to}."],
    ["engine.story.workMove.1", "{from}から{to}へ移り、{job}として{years}年働きました。", "After leaving {from} for {to}, they spent {years} years working as {jobPhrase}."],
    ["engine.story.workStay.0", "{place}に住み、{job}の仕事を{years}年続けました。", "They stayed in {place}, working as {jobPhrase} for {years} years."],
    ["engine.story.workStay.1", "{place}で{job}として{years}年働きました。", "Their {years} years as {jobPhrase} unfolded in {place}, where they remained."],
    ["engine.story.work.0", "{job}の仕事を{years}年続けました。", "They kept working as {jobPhrase} for {years} years."],
    ["engine.story.work.1", "{job}として{years}年働きました。", "For {years} years, work as {jobPhrase} shaped the days."],
    ["engine.story.move.0", "生まれた{from}を離れ、{to}に暮らしを移しました。", "They left {from} and made a life in {to}."],
    ["engine.story.move.1", "暮らしの場所は{from}から{to}へ変わりました。", "Home changed from {from} to {to}."],
    ["engine.story.stay.0", "生まれた{place}を離れずに暮らしました。", "They lived in {place} without leaving their birthplace."],
    ["engine.story.stay.1", "暮らしの場所は、最後まで{place}でした。", "{place} remained home through the final year."],
    ["engine.story.dreamReached.0", "目指した「{dream}」には、ついに届きました。", "The goal they named “{dream}” was eventually reached."],
    ["engine.story.dreamReached.1", "「{dream}」という夢を、ついにかなえました。", "They kept “{dream}” in view and in time reached it."],
    ["engine.story.dreamSought.0", "「{dream}」を目指し、届くところまで進みました。", "They kept moving toward “{dream},” though they did not reach it."],
    ["engine.story.dreamSought.1", "「{dream}」という夢は、最後までかなわないままでした。", "“{dream}” remained an unfinished aim."],
    ["engine.story.outcome.reached", "実現しました", "they reached it"],
    ["engine.story.outcome.unfinished", "道半ばでした", "it remained unfinished"],
    ["engine.story.dreamHardship.0", "「{dream}」を目指し、{year}年の{difficulty}を経て、{outcome}。", "They pursued “{dream}”; after {difficulty} in {year}, {outcome}."],
    ["engine.story.dreamHardship.1", "{year}年の{difficulty}を越えても「{dream}」を思い、{outcome}。", "Even after {difficulty} in {year}, they kept “{dream}” in view; {outcome}."],
    ["engine.story.dreamHardshipSupport.0", "{year}年の{difficulty}には{support}が支えとなり、「{dream}」は{outcome}。", "Amid {difficulty} in {year}, {support} helped; the aim “{dream}” endured, and {outcome}."],
    ["engine.story.dreamHardshipSupport.1", "「{dream}」を望む道には{year}年の{difficulty}もあり、{support}を支えに、夢は{outcome}。", "The path toward “{dream}” held {difficulty} in {year}; {support} steadied the days, and {outcome}."],
    ["engine.story.hardship.0", "{year}年は{difficulty}で暮らしが苦しくなりました。", "In {year}, {difficulty} made life harder."],
    ["engine.story.hardship.1", "{difficulty}が重なった{year}年もありました。", "{year} was marked by {difficulty}."],
    ["engine.story.hardshipSupport.0", "{year}年には{difficulty}があり、{support}が日々を支えました。", "In {year}, {difficulty} weighed on life; {support} gave the days a foothold."],
    ["engine.story.hardshipSupport.1", "{difficulty}に向き合った{year}年、{support}に戻る時間がありました。", "During the difficult year {year}, {support} remained part of ordinary life amid {difficulty}."],
    ["engine.story.support.0", "日々の支えの一つは、{support}でした。", "One everyday source of steadiness was {support}."],
    ["engine.story.support.1", "{support}を大切にする時間もありました。", "There was also time for {support}."],
    ["engine.story.lastPerson.0", "{name}を見送った家族には{person}もいました。", "Among the family who outlived {name} was {person}."],
    ["engine.story.lastPerson.1", "{person}は{name}との日々を覚えていました。", "After {name}'s death, {person} remained someone who had shared part of that life."],
    ["engine.story.lastPlace.0", "{name}は最後の年を{place}で過ごしました。", "Their final year came in {place}, a place that held some of {name}'s days."],
    ["engine.story.lastPlace.1", "{name}の最後の年は、{place}で過ぎました。", "{name}'s final year passed in {place}."],
    ["engine.story.texture.move", "{place}から{to}への引っ越しを、{name}の土地とのつながりを示す軸に反映しました。", "{name}'s move from {place} to {to} is part of the axis showing changes of place."],
    ["engine.story.texture.work", "{job}として働いた{years}年間を、{name}の仕事の軸に反映しました。", "The {years} years {name} spent as {jobPhrase} contribute to the work axis."],
    ["engine.story.texture.family", "子どもの{child}との関係を、{name}の人とのつながりを示す軸に反映しました。", "Their child {child} contributes to the axis describing {name}'s ties with others."],
    ["engine.story.texture.place", "{place}で過ごした{name}の時間を、日々の選択とともに四つの軸に置きました。", "The four axes place {name}'s time in {place} alongside the choices made there."],
    ["engine.story.difficulty.health", "健康の不安", "trouble with health"],
    ["engine.story.difficulty.economy", "家計の苦しさ", "pressure on the household budget"],
    ["engine.story.difficulty.disaster", "災害の影響", "the effects of a disaster"],
    ["engine.story.difficulty.family", "家族の変化", "a change in the family"],
    ["engine.story.difficulty.work", "仕事の難しさ", "difficulty with work"],
    ["engine.story.difficulty.world", "土地をめぐる不安", "uncertainty about where to live"],
    ["engine.story.difficulty.learn", "学ぶ道の壁", "a barrier to learning"],
    ["engine.category.health", "健康・医療", "Health and care"],
    ["engine.category.family", "家族・暮らし", "Family and daily life"],
    ["engine.category.work", "仕事・お金", "Work and money"],
    ["engine.category.learn", "学び", "Learning"],
    ["engine.category.society", "社会・政治", "Society and politics"],
    ["engine.category.disaster", "災害・環境", "Disasters and environment"],
    ["engine.category.economy", "経済", "Economy"],
    ["engine.category.world", "世界の動き", "World events"],
    ["engine.script.choice_outcome", "{event} 選択：{choice}", "{event} Choice: {choice}"],
    ["engine.era.past", "むかしの世界", "The world of the past"],
    ["engine.era.now", "いまの世界", "Today's world"],
    ["engine.era.future", "これからの世界", "The world ahead"],
    ["engine.job.farmhand", "農家の手伝い・小作", "farmhand"],
    ["engine.job.street_vendor", "露天商", "street vendor"],
    ["engine.job.construction", "建設作業員", "construction worker"],
    ["engine.job.domestic", "家事労働者", "domestic worker"],
    ["engine.job.day_laborer", "日雇いの運び手", "day laborer"],
    ["engine.job.fisher", "漁師", "fisher"],
    ["engine.job.factory", "工場の作業員", "factory worker"],
    ["engine.job.restaurant", "飲食店の店員", "restaurant worker"],
    ["engine.job.motorbike_taxi", "バイクタクシーの運転手", "motorcycle taxi driver"],
    ["engine.job.market", "市場の商人", "market trader"],
    ["engine.job.farmer", "農家", "farmer"],
    ["engine.job.garment", "縫製工", "garment worker"],
    ["engine.job.office", "事務員", "office worker"],
    ["engine.job.sales", "販売員", "sales associate"],
    ["engine.job.truck", "トラック運転手", "truck driver"],
    ["engine.job.electrician", "電気工", "electrician"],
    ["engine.job.cook", "調理師", "cook"],
    ["engine.job.care_worker", "介護士", "care worker"],
    ["engine.job.police", "警察官", "police officer"],
    ["engine.job.teacher", "教師", "teacher"],
    ["engine.job.nurse", "看護師", "nurse"],
    ["engine.job.engineer", "技術者", "engineer"],
    ["engine.job.accountant", "会計士", "accountant"],
    ["engine.job.doctor", "医師", "doctor"],
    ["engine.job.civil_servant", "公務員", "civil servant"],
    ["engine.job.programmer", "プログラマー", "programmer"],
    ["engine.job.researcher", "研究者", "researcher"],
    ["engine.job.lawyer", "弁護士", "lawyer"],
    ["engine.job.homemaker", "家事・子育て", "home and childcare"],
    ["engine.edu.pre", "就学前", "Not yet at school"],
    ["engine.edu.none", "学校に通っていない", "Not attending school"],
    ["engine.edu.primary", "初等教育", "Primary education"],
    ["engine.edu.secondary", "中等教育", "Secondary education"],
    ["engine.edu.univ", "大学", "University"],
    ["engine.edu.inprimary", "小学校に在学中", "In primary school"],
    ["engine.edu.insecondary", "中学・高校に在学中", "In secondary school"],
    ["engine.edu.inuniv", "大学に在学中", "At university"],
    ["engine.wealth.poorest", "いちばん貧しい層の", "the lowest income group"],
    ["engine.wealth.poor", "暮らしに余裕のない", "a low income"],
    ["engine.wealth.middle", "ふつうの", "a middle income"],
    ["engine.wealth.comfortable", "暮らし向きのよい", "a comfortable"],
    ["engine.wealth.richest", "いちばん豊かな層の", "the highest income group"],
    ["engine.temperament.explore", "好奇心が強い", "curious"],
    ["engine.temperament.active", "活発", "energetic"],
    ["engine.temperament.social", "人なつこい", "outgoing"],
    ["engine.temperament.grit", "粘り強い", "persistent"],
    ["engine.toy.explore", "ひっくり返して、どこが動くか探る", "Turn it over to see how it works"],
    ["engine.toy.active", "おもちゃを抱えて、家じゅうを駆けまわる", "Carry it around the house"],
    ["engine.toy.social", "近くの大人に見せて、いっしょに遊ぼうと誘う", "Show it to an adult and invite them to play"],
    ["engine.toy.grit", "うまくいかなくても、やり方を変えて何度も試す", "Keep trying different ways, even when it is hard"],
    ["engine.focus.work", "仕事に打ち込む", "Focus on work"],
    ["engine.focus.study", "勉強に打ち込む", "Focus on study"],
    ["engine.focus.work.effect", "収入・昇進↑ 健康・人間関係↓", "Income and career ↑  Health and relationships ↓"],
    ["engine.focus.study.effect", "知識↑↑ 幸福↓", "Knowledge ↑↑  Happiness ↓"],
    ["engine.focus.balance", "バランス", "Balance"],
    ["engine.focus.balance.effect", "少しずつ全部", "A little of everything"],
    ["engine.focus.family", "家族・友人", "Family and friends"],
    ["engine.focus.family.effect", "人間関係↑ 幸福↑", "Relationships ↑  Happiness ↑"],
    ["engine.focus.health", "体を大切に", "Care for your health"],
    ["engine.focus.health.effect", "健康↑ お金が少し↓", "Health ↑  Money slightly ↓"],
    ["engine.focus.learn", "学び直し", "Keep learning"],
    ["engine.focus.read", "本を読む", "Read books"],
    ["engine.focus.learn.effect", "知識↑ 転職の話↑", "Knowledge ↑  Job opportunities ↑"],
    ["engine.focus.read.effect", "知識↑", "Knowledge ↑"],
    ["engine.focus.hobby", "趣味", "Hobbies"],
    ["engine.focus.hobby.effect", "幸福↑ 腕前↑", "Happiness ↑  Skill ↑"],
    ["engine.hobby.0", "料理", "cooking"],
    ["engine.hobby.1", "サッカー", "football"],
    ["engine.hobby.2", "歌", "singing"],
    ["engine.hobby.3", "庭いじり", "gardening"],
    ["engine.hobby.4", "読書", "reading"],
    ["engine.hobby.5", "裁縫", "sewing"],
    ["engine.hobby.6", "釣り", "fishing"],
    ["engine.hobby.7", "ダンス", "dancing"],
    ["engine.hobby.8", "絵", "drawing"],
    ["engine.hobby.9", "チェス", "chess"],
    ["engine.hobby.10", "楽器", "playing music"],
    ["engine.theme.0.name", "学校に行けない子どもたち", "Children without access to school"],
    ["engine.theme.0.desc", "今日生まれる一人ひとりの人生から、このテーマを考えます。", "Explore this issue through one life beginning today."],
    ["engine.theme.0.fact", "世界では小学校に通う年齢の子どもの約7,800万人が学校に通っていません（UNESCO、概算）。", "About 78 million children of primary school age are out of school worldwide (UNESCO estimate)."],
    ["engine.theme.0.text", "学校に通えないまま、同い年の子が通学する姿を見送りました。", "You watched children your age leave for school while you could not attend."],
    ["engine.theme.1.name", "遠くの水場", "A long walk for water"],
    ["engine.theme.1.desc", "毎日の水くみから、暮らしの違いを考えます。", "Explore how the daily search for water shapes a life."],
    ["engine.theme.1.fact", "世界では約20億人が、安全に管理された飲み水を使えていません（WHO・UNICEF、概算）。", "Around 2 billion people lack safely managed drinking water (WHO and UNICEF estimate)."],
    ["engine.theme.1.text", "毎朝、遠くの井戸まで水を汲みに歩きました。", "Each morning you walked to a distant well for water."],
    ["engine.theme.2.name", "移り住む人たち", "People on the move"],
    ["engine.theme.2.desc", "住む場所を変える選択から、暮らしの変化を考えます。", "Explore how moving changes the course of a life."],
    ["engine.theme.2.fact", "生まれた国の外で暮らす人は世界に約2億8,000万人います（IOM、概算）。", "An estimated 280 million people live outside the country where they were born (IOM)."],
    ["engine.theme.2.text", "生まれた土地を離れて、新しい場所で暮らしはじめました。", "You left your birthplace and began a life somewhere new."],
    ["engine.budget.0", "税金・社会保険", "Taxes and social insurance"],
    ["engine.budget.1", "食費", "Food"],
    ["engine.budget.2", "住居", "Housing"],
    ["engine.budget.3", "交通", "Transport"],
    ["engine.budget.4", "医療", "Healthcare"],
    ["engine.budget.5", "教育・子育て", "Education and childcare"],
    ["engine.budget.6", "衣服・娯楽・通信", "Clothing, leisure and phone"],
    ["engine.budget.7", "貯蓄", "Savings"],
    ["engine.item.phone.label", "携帯電話", "Mobile phone"],
    ["engine.item.phone.effect", "家族と連絡しやすくなる", "Keep in touch with family"],
    ["engine.item.smartphone.label", "スマートフォン", "Smartphone"],
    ["engine.item.smartphone.effect", "連絡と学びに役立つ", "Connect and learn"],
    ["engine.item.bike.label", "自転車", "Bicycle"],
    ["engine.item.bike.effect", "通勤が少し速くなる", "Shorten your commute"],
    ["engine.item.motorbike.label", "バイク", "Motorcycle"],
    ["engine.item.motorbike.effect", "遠い職場へ通いやすくなる", "Reach more distant jobs"],
    ["engine.item.usedCar.label", "中古車", "Used car"],
    ["engine.item.usedCar.effect", "家族での移動が楽になる", "Make family trips easier"],
    ["engine.item.newCar.label", "新車", "New car"],
    ["engine.item.newCar.effect", "移動の選択肢が増える", "More ways to get around"],
    ["engine.item.fridge.label", "冷蔵庫", "Refrigerator"],
    ["engine.item.fridge.effect", "食べ物を長く保存できる", "Keep food fresh longer"],
    ["engine.item.tv.label", "テレビ", "Television"],
    ["engine.item.tv.effect", "家で楽しむ時間が増える", "Enjoy more time at home"],
    ["engine.item.computer.label", "パソコン", "Computer"],
    ["engine.item.computer.effect", "学びや仕事に使える", "Use it for study and work"],
    ["engine.item.roof.label", "屋根の修理", "Roof repair"],
    ["engine.item.roof.effect", "雨の日も安心して暮らせる", "Keep your home dry"],
    ["engine.item.home.label", "持ち家", "A home of your own"],
    ["engine.item.home.effect", "自分の住まいを持つ", "Own your home"],
    ["engine.item.washer.label", "洗濯機", "Washing machine"],
    ["engine.item.washer.effect", "洗濯にかかる時間を減らす", "Spend less time doing laundry"],
    ["engine.item.aircon.label", "エアコン", "Air conditioner"],
    ["engine.item.aircon.effect", "暑い日の室内を涼しくする", "Keep your home cooler on hot days"],
    ["engine.item.fan.label", "扇風機", "Electric fan"],
    ["engine.item.fan.effect", "暑い日の暮らしを少し楽にする", "Make hot days more comfortable"],
    ["engine.item.solarPanel.label", "太陽光パネル", "Solar panels"],
    ["engine.item.solarPanel.effect", "家庭で使える電気を増やす", "Supply more electricity at home"],
    ["engine.item.waterTank.label", "井戸・貯水タンク", "Well or water tank"],
    ["engine.item.waterTank.effect", "安全な水を手元に備える", "Keep a safer water supply close to home"],
    ["engine.item.solarLamp.label", "ソーラーランプ", "Solar lamp"],
    ["engine.item.solarLamp.effect", "夜も明かりの下で過ごせる", "Have light after dark"],
    ["engine.item.goats.label", "家畜（ヤギ）", "Goats"],
    ["engine.item.goats.effect", "家族の食料と小さな収入を支える", "Help provide food and a little income"],
    ["engine.item.cattle.label", "家畜（牛）", "Cattle"],
    ["engine.item.cattle.effect", "農作業と家族の食料を支える", "Help with farm work and food"],
    ["engine.item.farmTools.label", "農機具", "Farm tools"],
    ["engine.item.farmTools.effect", "畑仕事の負担を減らす", "Make field work easier"],
    ["engine.item.streetStall.label", "屋台・小さな店の開業", "Start a stall or small shop"],
    ["engine.item.streetStall.effect", "自分の商売を始める", "Begin a small business"],
    ["engine.item.deliveryBike.label", "中古バイクで配達の仕事", "Used motorcycle for deliveries"],
    ["engine.item.deliveryBike.effect", "配達の仕事に使える足を得る", "Gain transport for delivery work"],
    ["engine.service.travel.label", "旅行", "Travel"],
    ["engine.service.travel.effect", "新しい景色を見る", "See new places"],
    ["engine.service.checkup.label", "健康診断", "Health checkup"],
    ["engine.service.checkup.effect", "体の状態を確かめる", "Check on your health"],
    ["engine.service.schoolFees.label", "子の学費", "Child's school fees"],
    ["engine.service.schoolFees.effect", "子どもの学びを支える", "Support your child's education"],
    ["engine.service.parents.label", "親への仕送り", "Support for parents"],
    ["engine.service.parents.effect", "親の暮らしを支える", "Help your parents with living costs"],
    ["engine.service.donation.label", "寄付", "Donation"],
    ["engine.service.donation.effect", "地域を支える", "Support your community"],
    ["engine.service.vocationalTraining.label", "職業訓練", "Vocational training"],
    ["engine.service.vocationalTraining.effect", "仕事に役立つ技能を学ぶ", "Learn practical job skills"],
    ["engine.service.languageClass.label", "語学教室", "Language classes"],
    ["engine.service.languageClass.effect", "新しい言葉を学ぶ", "Learn another language"],
    ["engine.service.tutoring.label", "子どもの塾", "Tutoring for a child"],
    ["engine.service.tutoring.effect", "子どもの学びを助ける", "Support your child's learning"],
    ["engine.service.healthInsurance.label", "健康保険に加入", "Health insurance"],
    ["engine.service.healthInsurance.effect", "病気に備える", "Prepare for medical costs"],
    ["engine.service.dentalCare.label", "歯の治療", "Dental care"],
    ["engine.service.dentalCare.effect", "歯の痛みを治療する", "Treat dental problems"],
    ["engine.service.glasses.label", "めがね", "Glasses"],
    ["engine.service.glasses.effect", "文字や景色を見やすくする", "See text and surroundings more clearly"],
    ["engine.service.wedding.label", "結婚式の費用", "Wedding celebration"],
    ["engine.service.wedding.effect", "家族や友人と節目を祝う", "Celebrate with family and friends"],
    ["engine.service.parentRepair.label", "親の家の修理", "Repair a parent's home"],
    ["engine.service.parentRepair.effect", "親の住まいを整える", "Improve your parent's home"],
    ["engine.service.religiousDonation.label", "宗教行事への寄付", "Donation for a religious event"],
    ["engine.service.religiousDonation.effect", "地域の行事を支える", "Support a community event"],
    ["engine.service.schoolDonation.label", "地域の学校への寄付", "Donation to a local school"],
    ["engine.service.schoolDonation.effect", "地域の子どもの学びを支える", "Support local children's education"],
    ["engine.service.moveHouse.label", "引っ越し", "Move home"],
    ["engine.service.moveHouse.effect", "新しい場所で暮らし始める", "Start living in a new place"],
    ["engine.investment.savings.label", "預金", "Savings account"],
    ["engine.investment.savings.effect", "年ごとに少しずつ増える。元本の変動は小さい", "Gradual growth with little change to the principal"],
    ["engine.investment.index.label", "分散投資", "Diversified investment"],
    ["engine.investment.index.effect", "値動きはあるが長期の成長を目指す", "Prices fluctuate; aims for long-term growth"],
    ["engine.investment.shop.label", "小さな店への出資", "Investment in a small shop"],
    ["engine.investment.shop.effect", "大きく増える年も、減る年もある", "Returns may rise or fall sharply"],
    ["engine.investment.fixedDeposit.label", "定期預金", "Fixed-term deposit"],
    ["engine.investment.fixedDeposit.effect", "預ける期間を決めて安定した利息を得る", "Earn steady interest for a set term"],
    ["engine.investment.governmentBond.label", "国債", "Government bonds"],
    ["engine.investment.governmentBond.effect", "国に貸し付けて利息を得る", "Earn interest by lending to a government"],
    ["engine.investment.stocks.label", "株式", "Stocks"],
    ["engine.investment.stocks.effect", "企業の成長に参加する。値動きが大きい", "Share in company growth; prices can swing sharply"],
    ["engine.investment.gold.label", "金（ゴールド）", "Gold"],
    ["engine.investment.gold.effect", "価値の保存を目指す。価格は上下する", "Store value, though the price can rise or fall"],
    ["engine.investment.microfinance.label", "マイクロファイナンスの共同組合", "Microfinance cooperative"],
    ["engine.investment.microfinance.effect", "地域の小規模な事業に資金を回す", "Fund small businesses in the community"],
    ["engine.animal.0", "犬", "dog"],
    ["engine.animal.1", "猫", "cat"],
    ["engine.animal.2", "ヤギ", "goat"],
    ["engine.animal.3", "鶏", "chicken"],
    ["engine.animal.4", "インコ", "parakeet"],
    ["engine.decision.toy.title", "はじめてのおもちゃ", "A first toy"],
    ["engine.decision.toy.body", "新しいおもちゃを渡すと、まず何をするでしょう。", "{name} can walk confidently now. What will they do with a new toy? Your choice will help shape their temperament."],
    ["engine.decision.toy.note", "性格の違いの4割ほどは遺伝で説明できると考えられています。ほかにも、育つ中での経験が関わります（双子研究のまとめ）。", "Twin studies suggest genetics accounts for about 40% of differences in personality. Experiences while growing up matter too."],
    ["engine.decision.school.title", "学校に行きたい", "A chance to go to school"],
    ["engine.decision.school.body", "同じ年ごろの子が、制服を着て学校へ向かっていきます。家の仕事は山のようにあります。", "Children your age head to school in uniform while chores pile up at home. What will {name} do?"],
    ["engine.decision.school.note", "学校に通えるかどうかは、家の暮らし向きや住む場所に大きく左右されます。", "A family's means and where they live strongly affect access to school."],
    ["engine.decision.school.choice.0", "親に何度も頼んでみる", "Ask your parents again"],
    ["engine.decision.school.choice.1", "家の手伝いを続ける", "Keep helping at home"],
    ["engine.decision.university.title", "この先の進路", "What comes next"],
    ["engine.decision.university.body", "中等教育を終えます。大学に進むにはお金も時間もかかります。働けばすぐに家計を助けられます。", "You are finishing secondary school. University takes time and money; working would help the household right away."],
    ["engine.decision.university.note", "高等教育への進学率は、国によって数％から100％近くまで幅があります。", "Participation in higher education varies widely among countries."],
    ["engine.decision.university.choice.0", "大学をめざす", "Apply to university"],
    ["engine.decision.university.choice.1", "働きはじめる", "Start working"],
    ["engine.decision.firstJob.title", "最初の仕事", "A first job"],
    ["engine.decision.firstJob.body", "働き口がいくつか見つかりました。どれにしますか。", "You have found several job opportunities. Which will you take?"],
    ["engine.decision.firstJob.note", "{country}では、働く人の約{agri}％が農業に従事しています。", "About {agri}% of workers in {country} work in agriculture."],
    ["engine.decision.firstJob.wait", "もう少し探す（1年待つ）", "Keep looking (wait a year)"],
    ["engine.decision.jobOffer.title", "新しい仕事の話", "A new job offer"],
    ["engine.decision.jobOffer.body", "{job}として{years}年働いたころ、知人から別の仕事の話を聞きました。", "You have worked as {jobPhrase} for {years} years. An acquaintance mentions other openings."],
    ["engine.decision.jobOffer.body_one", "{job}として1年働いたころ、知人から別の仕事の話を聞きました。", "You have worked as {jobPhrase} for one year. An acquaintance mentions other openings."],
    ["engine.decision.jobOffer.note", "転職で収入が上がることもあれば、慣れるまで収入が不安定になることもあります。", "Changing jobs may raise your income, though earnings can be uncertain while you settle in."],
    ["engine.decision.jobOffer.take", "{job}に移る", "Take the {job} job"],
    ["engine.decision.jobOffer.step_down", "条件を下げて{job}に移る", "Step down to the {job} job"],
    ["engine.decision.jobOffer.keep", "いまの仕事を続ける", "Stay in your current job"],
    ["engine.job.unavailable.education", "{job}：学歴が足りない", "{job}: more education is required"],
    ["engine.job.unavailable.region", "{job}：この地域に求人がない", "{job}: no opening in this area"],
    ["engine.job.unavailable.papers", "{job}：資格や書類がない", "{job}: qualifications or papers are missing"],
    ["engine.job.unavailable.health", "{job}：健康上の理由", "{job}: health limits this work"],
    ["engine.job.unavailable.family", "{job}：家族の事情", "{job}: family responsibilities make this unavailable"],
    ["engine.job.unavailable.money", "{job}：資格取得の費用が足りない", "{job}: the qualification costs are out of reach"],
    ["engine.job.wait_cost", "仕事探しのあいだの家計費", "household costs while searching for work"],
    ["engine.job.wait_pressure", "仕事探しが長引き、家計が苦しくなり、家族の気苦労も増えました。", "The longer job search put more pressure on your household and family."],
    ["engine.job.waited", "もう1年、働き口を探すことにしました。", "You decided to keep looking for work for another year."],
    ["engine.job.auto_chose", "おまかせで{job}を選びました", "Auto-pilot chose {job}"],
    ["engine.decision.marry.title", "結婚の話", "A proposal"],
    ["engine.decision.marry.body", "{candidate}（{candidateAge}歳）と知り合って{knownYears}年。一緒に暮らす話が出ています。", "You have known {candidate} ({candidateAge}) for some time, and have talked about living together."],
    ["engine.decision.marry.note", "結婚する年齢や結婚を選ぶ人の割合は、国や時代によって異なります。", "The age at marriage and share of people who marry vary by country and era."],
    ["engine.decision.marry.choice.0", "いっしょになる", "Get married"],
    ["engine.decision.marry.choice.1", "もう少し待つ", "Wait a little longer"],
    ["engine.decision.child.title", "子どもを迎える？", "Growing the family?"],
    ["engine.decision.child.body", "いま子どもは{count}人です。家族を増やすか考えています。", "You have {count} children. You are thinking about welcoming {another} child."],
    ["engine.decision.child.body_one", "いま子どもは一人です。家族を増やすか考えています。", "You have one child. You are thinking about welcoming another child."],
    ["engine.decision.child.note", "{country}の合計特殊出生率は、女性1人あたり{tfr}人です。", "The total fertility rate in {country} is {tfr} children per woman."],
    ["engine.decision.child.choice.0", "子どもを迎えたい", "Try for a child"],
    ["engine.decision.child.choice.1", "いまはやめておく", "Not for now"],
    ["engine.decision.pet.title", "生きものを迎える？", "Adopt an animal?"],
    ["engine.decision.pet.body", "近所の{animal}に子が生まれ、引き取り手を探しています。", "A neighbor's {animal} has young in need of a home."],
    ["engine.decision.pet.note", "動物と暮らすことで、気持ちが落ち着くと感じる人もいます。", "Some people find living with an animal calming."],
    ["engine.decision.pet.choice.0", "迎える", "Adopt one"],
    ["engine.decision.pet.choice.1", "見送る", "Pass"],
    ["engine.decision.gamble.title", "ひと勝負してみる？", "Take a chance?"],
    ["engine.decision.gamble.body", "知人が「確実にもうかる」と言います。年収の半分を出せば、倍になるかもしれないそうです。", "An acquaintance offers a ‘sure thing’ that might double half a year's income."],
    ["engine.decision.gamble.note", "確実にもうかると約束されても、思いどおりの結果になるとは限りません。", "Even a promised profit may not turn out as expected."],
    ["engine.decision.gamble.choice.0", "乗ってみる", "Take the risk"],
    ["engine.decision.gamble.choice.1", "断る", "Decline"],
    ["engine.decision.move.title", "よその土地へ", "A life elsewhere"],
    ["engine.decision.move.body", "{destination}へ働きに行った人から、故郷への仕送りの話を聞きました。あなたも行きますか。", "Someone who moved to {destination} for work tells you about sending money home. Would you go too?"],
    ["engine.decision.move.note", "{country}から移り住む人の主な行き先は、{destinations}などです。", "Common destinations for people leaving {country} include {destinations}."],
    ["engine.decision.move.choice.0", "渡ってみる", "Try moving to {destination}"],
    ["engine.decision.move.choice.1", "この土地に残る", "Stay here"],
    ["engine.decision.drink.title", "お酒の量が増えて", "Drinking more"],
    ["engine.decision.drink.body", "眠れない夜が続き、酒に手が伸びる日が増えています。", "Sleepless nights have led you to drink more often."],
    ["engine.decision.drink.note", "飲酒の問題からの回復には時間がかかることもあります。身近な人や専門家に相談する道もあります。", "Recovery from problem drinking can take time. Talking with someone close or a professional may help."],
    ["engine.decision.drink.choice.0", "家族に打ち明けて、量を減らす", "Tell your family and cut back"],
    ["engine.decision.drink.choice.1", "酒でまぎらわす", "Drink to cope"],
    ["engine.decision.care.title", "親の世話", "Caring for your {parent}"],
    ["engine.decision.care.body", "親がひとりで暮らすのが難しくなってきました。", "Your {parent} is finding it harder to live alone. How will you help?"],
    ["engine.decision.care.note", "年をとった親を支える方法は、家族の事情や利用できる制度によって異なります。", "Ways to support an aging parent depend on family circumstances and available services."],
    ["engine.decision.care.choice.0", "引き取っていっしょに暮らす", "Invite them to live with you"],
    ["engine.decision.care.choice.1", "ほかのきょうだいに頼む", "Ask your siblings to help"],
    ["engine.decision.scholarship.title", "遠くで学ぶ誘い", "A chance to study away from home"],
    ["engine.decision.scholarship.body", "学費の一部を支える制度に応募できます。利用するには、家を離れて学ぶ必要があります。", "You can apply for help with some tuition costs, but would need to move away to study."],
    ["engine.decision.scholarship.note", "奨学金は進学の助けになりますが、生活費や移動費まで賄えるとは限りません。", "A scholarship may help with education, though it may not cover living or travel costs."],
    ["engine.decision.scholarship.choice.0", "応募して学びに行く", "Apply and go"],
    ["engine.decision.scholarship.choice.1", "近くで学び続ける", "Keep studying nearby"],
    ["engine.decision.scholarship.choice.2", "いまは働く", "Work for now"],
    ["engine.decision.treatment.title", "治療の選び方", "Choosing care"],
    ["engine.decision.treatment.body", "体調が戻らず、どこで診てもらうか決めることになりました。", "Your health is not improving. Where will you seek care?"],
    ["engine.decision.treatment.note", "医療費の自己負担が大きい地域では、治療を受ける時期や場所が家計に左右されがちです。", "Where people pay much of their healthcare costs themselves, household finances often shape when and where they seek treatment."],
    ["engine.decision.treatment.choice.0", "設備の整った病院に行く", "Go to a well-equipped hospital"],
    ["engine.decision.treatment.choice.1", "近くの診療所に通う", "Visit a nearby clinic"],
    ["engine.decision.treatment.choice.2", "身近な手当てで様子を見る", "Rest with care at home"],
    ["engine.decision.home.title", "住まいをどうする", "A place of your own"],
    ["engine.decision.home.body", "長く暮らせる家を持とうか考えています。まとまったお金が必要です。", "You are considering a home for the long term. It would take a substantial amount of money."],
    ["engine.decision.home.note", "家を持つ費用は、多くの家庭で長年にわたる大きな支出です。", "Housing is a major long-term expense for many families."],
    ["engine.decision.home.choice.0", "家を買うか建てる", "Buy or build a home"],
    ["engine.decision.home.choice.1", "いまの住まいを直す", "Repair your current home"],
    ["engine.decision.home.choice.2", "資金をためて待つ", "Save up and wait"],
    ["engine.decision.business.title", "小さな商売", "A small business"],
    ["engine.decision.business.body", "得意なものを売る場所が見つかりました。仕入れにお金がかかります。", "You found a place to sell something you make well. Supplies will cost money."],
    ["engine.decision.business.note", "小規模な商売は収入の道を増やしますが、売上は季節や景気で変わります。", "A small business can add a source of income, but sales vary with seasons and the economy."],
    ["engine.decision.business.choice.0", "自分で始める", "Start on your own"],
    ["engine.decision.business.choice.1", "仲間と共同で始める", "Start with others"],
    ["engine.decision.business.choice.2", "いまの仕事に専念する", "Focus on your current job"],
    ["engine.decision.evacuation.title", "避難の知らせ", "Evacuation notice"],
    ["engine.decision.evacuation.body", "近くで災害が起き、早めに移動するよう呼びかけられました。", "A disaster has struck nearby, and residents have been asked to leave early."],
    ["engine.decision.evacuation.note", "早めの避難は危険を減らせますが、移動手段や避難先の確保が必要です。", "Leaving early can reduce danger, but requires transport and somewhere to go."],
    ["engine.decision.evacuation.choice.0", "早めに避難する", "Evacuate early"],
    ["engine.decision.evacuation.choice.1", "近所の人と備えて待つ", "Prepare with neighbors and stay"],
    ["engine.decision.evacuation.choice.2", "家に残って様子を見る", "Wait at home"],
    ["engine.decision.loan.title", "友人からの頼み", "A friend asks for help"],
    ["engine.decision.loan.body", "古い友人が、一時的にお金を貸してほしいと訪ねてきました。", "An old friend asks to borrow some money for a short time."],
    ["engine.decision.loan.note", "個人間の貸し借りは、返済だけでなく人間関係にも影響することがあります。", "Loans between individuals can affect relationships as well as repayment."],
    ["engine.decision.loan.choice.0", "必要な額を貸す", "Lend the amount needed"],
    ["engine.decision.loan.choice.1", "返せる範囲で助ける", "Help with what you can spare"],
    ["engine.decision.loan.choice.2", "お金は貸さず相談に乗る", "Listen and look for other options"],
    ["engine.decision.community.title", "地域の役目", "A role in the community"],
    ["engine.decision.community.body", "暮らしの困りごとを話し合う集まりに、世話役として加わってほしいと言われました。", "A local group discussing everyday problems asks you to help lead it."],
    ["engine.decision.community.note", "地域の活動は人のつながりを広げる一方、時間や労力も必要です。", "Community work can build connections, but takes time and effort."],
    ["engine.decision.community.choice.0", "引き受ける", "Take the role"],
    ["engine.decision.community.choice.1", "手伝える日にだけ参加する", "Help when you can"],
    ["engine.decision.community.choice.2", "今回は断る", "Decline this time"],
    ["engine.decision.nightSchool.title", "夜に学び直す", "Learning after work"],
    ["engine.decision.nightSchool.body", "仕事のあとに通える教室ができました。続けるには時間が要ります。", "A new evening class has opened. It will take time to keep attending."],
    ["engine.decision.nightSchool.note", "大人の学び直しには、仕事や家事と両立できる時間が大切です。", "Adults need time to balance learning with work and household responsibilities."],
    ["engine.decision.nightSchool.choice.0", "教室に通う", "Attend classes"],
    ["engine.decision.nightSchool.choice.1", "本や人から学ぶ", "Learn from books and others"],
    ["engine.decision.nightSchool.choice.2", "いまは休む", "Rest for now"],
    ["engine.decision.childSchool.title", "子どもの進学費用", "Paying for your child's education"],
    ["engine.decision.childSchool.body", "子どもが次の学校に進みたいと話しています。学費と生活費をどうするか考えます。", "Your child wants to continue to the next level of school. How will you cover fees and living costs?"],
    ["engine.decision.childSchool.note", "進学に必要なお金は、授業料以外の交通費や暮らしの費用にも及びます。", "Education costs extend beyond tuition to transport and living expenses."],
    ["engine.decision.childSchool.choice.0", "蓄えから支える", "Pay from savings"],
    ["engine.decision.childSchool.choice.1", "奨学金を一緒に探す", "Look for scholarships together"],
    ["engine.decision.childSchool.choice.2", "働きながら学ぶ道を話す", "Talk about studying while working"],
    ["engine.decision.elderHome.title", "これからの住まい", "Where to live next"],
    ["engine.decision.elderHome.body", "年を重ね、どこで誰と暮らすかを考えるようになりました。", "As you grow older, you think about where and with whom you will live."],
    ["engine.decision.elderHome.note", "高齢期の住まい方は、家族の事情、健康、使える支援によって変わります。", "Housing choices in later life depend on family, health, and available support."],
    ["engine.decision.elderHome.choice.0", "子どもか親しい人の近くで暮らす", "Live near your children or people close to you"],
    ["engine.decision.elderHome.choice.1", "今の家で暮らす", "Stay in your current home"],
    ["engine.decision.elderHome.choice.2", "支援のある住まいを探す", "Find a place with support"],
    ["engine.decision.earlyMarriage.title", "若いころの縁談", "A marriage proposal while young"],
    ["engine.decision.earlyMarriage.body", "まだ学びたいと思っているところへ、家族から結婚の話が出ました。自分の気持ちをどう伝えますか。", "You still want to study when your family raises the idea of marriage. How will you respond?"],
    ["engine.decision.earlyMarriage.note", "18歳未満の結婚は、学びや将来の選択肢を狭めることがあります。", "Marriage before 18 can limit education and future choices."],
    ["engine.decision.earlyMarriage.choice.0", "学業を続けたいと伝える", "Say you want to keep studying"],
    ["engine.decision.earlyMarriage.choice.1", "信頼できる大人に相談する", "Talk to an adult you trust"],
    ["engine.decision.earlyMarriage.choice.2", "縁談を受け入れる", "Accept the proposal"],
    ["engine.decision.quitSmoking.title", "たばことの付き合い", "Rethinking smoking"],
    ["engine.decision.quitSmoking.body", "せきが続き、たばこの量を見直そうと思いました。", "A persistent cough makes you reconsider your smoking."],
    ["engine.decision.quitSmoking.note", "禁煙すると、年齢にかかわらず健康上の利益が少しずつ現れます。", "Quitting smoking brings gradual health benefits at any age."],
    ["engine.decision.quitSmoking.choice.0", "やめてみる", "Try to quit"],
    ["engine.decision.quitSmoking.choice.1", "本数を減らす", "Cut back"],
    ["engine.decision.quitSmoking.choice.2", "今は続ける", "Keep smoking for now"],
    ["engine.decision.returnHome.title", "生まれた土地へ", "Back to your birthplace"],
    ["engine.decision.returnHome.body", "移り住んだ先での暮らしが落ち着いてきました。故郷から、帰ってこないかと便りが届きました。", "You have settled into life elsewhere when a letter from your birthplace asks whether you will return."],
    ["engine.decision.returnHome.note", "移住した人が帰郷するかどうかは、仕事と家族の事情に左右されます。", "Whether migrants return home depends on work and family circumstances."],
    ["engine.decision.returnHome.choice.0", "故郷に帰る", "Return home"],
    ["engine.decision.returnHome.choice.1", "今いる場所に残る", "Stay where you are"],
    ["engine.decision.returnHome.choice.2", "しばらく行き来する", "Travel between both places"],
    ["engine.birth", "{year}年{month}月、{country}の{place}で、{wealth}家庭に{child}として生まれました。{siblings}生まれた家庭の宗教的背景は{religion}でした。", "In {month}/{year}, you were born as a {child} in a {wealth} household in {place}, {country}. {siblings} Your family's religious background was {religion}."],
    ["engine.birth.wealth.1", "いちばん貧しい層の", "very low-income"],
    ["engine.birth.wealth.2", "暮らしに余裕のない", "low-income"],
    ["engine.birth.wealth.3", "ふつうの", "middle-income"],
    ["engine.birth.wealth.4", "暮らし向きのよい", "comfortable"],
    ["engine.birth.wealth.5", "いちばん豊かな層の", "high-income"],
    ["engine.birth.sibling", "年上のきょうだいが{count}人いました。", "You had one older sibling."],
    ["engine.birth.siblings", "年上のきょうだいが{count}人いました。", "You had {count} older siblings."],
    ["engine.birth.first_child", "両親の最初の子どもでした。", "You were the family's first child."],
    ["engine.spend.invalid", "この使い道は選べません。", "This option is not available."],
    ["engine.spend.ended", "この一生は終わっています。", "This life has ended."],
    ["engine.spend.owned", "すでに持っています。", "You already own this."],
    ["engine.spend.no_child", "学費を払う子どもがいません。", "You have no child whose school fees you can pay."],
    ["engine.spend.no_parent", "仕送り先の親がいません。", "You have no parent to support."],
    ["engine.spend.no_spouse", "結婚相手がいません。", "You do not have a spouse to celebrate with."],
    ["engine.spend.not_yet", "この時代にはまだ手に入りません。", "This is not available in this era."],
    ["engine.spend.rural", "農村での暮らし向けです。", "This is for a rural household."],
    ["engine.spend.cash_short", "手元のお金が足りません。", "You do not have enough cash."],
    ["engine.spend.effect_note", "暮らしへの変化：{effect}。", "Effect: {effect}."],
    ["engine.spend.amount", "金額を確認してください。", "Check the amount."],
    ["engine.spend.investment_cash", "投資に使える現金が足りません。", "You do not have enough cash to invest."],
    ["engine.spend.loan_limit", "借りられる額の目安を超えています。", "That exceeds your borrowing limit."],
    ["engine.spend.cash", "手元のお金が足りません。借入を選べば、年収の半分まで補えます。", "You do not have enough cash. A loan can cover up to half your annual income."],
    ["engine.spend.investment_ledger", "{item}へ移したお金（日本の物価で{amount}円）", "Transferred to {item} (US${amount} at PPP)"],
    ["engine.spend.payment", "{item}の支払い", "Payment for {item}"],
    ["engine.spend.invested", "{item}に日本の物価で約{amount}円を移しました。{loan}", "You moved about US${amount} at PPP into {item}. {loan}"],
    ["engine.spend.bought", "{item}に日本の物価で約{amount}円を使いました。{loan}", "You spent about US${amount} at PPP on {item}. {loan}"],
    ["engine.spend.loan_added", "不足分を借り、利息がつきました。", "You borrowed the shortfall and will pay interest."],
    ["engine.death.log", "{age}歳のとき、{cause}で亡くなりました。", "You died at age {age} from {cause}."],
    ["engine.last.0", "みんな、ありがとう。", "Thank you, everyone."],
    ["engine.last.1", "大切な時間を過ごせたよ。", "I had precious time with you."],
    ["engine.last.2", "あの夕焼けを、もう一度見たかったな。", "I wish I could see that sunset once more."],
    ["engine.last.3", "これからも、元気でいてね。", "Take care of yourselves."],
    ["engine.last.4", "そばにいてくれて、うれしかった。", "I'm glad you were here with me."],
    ["engine.last.5", "また会おうね。", "Until we meet again."],
    ["engine.last.6", "窓を開けておいて。", "Leave the window open."],
    ["engine.texture.0", "灯をともす人", "The keeper of the light"],
    ["engine.texture.1", "畑を耕す人", "The one who tills the fields"],
    ["engine.texture.2", "港で待つ人", "The one who waits at the harbor"],
    ["engine.texture.3", "種をまく人", "The one who plants seeds"],
    ["engine.texture.4", "橋をかける人", "The bridge builder"],
    ["engine.texture.5", "道をひらく人", "The path maker"],
    ["engine.texture.6", "嵐をくぐる人", "The one who weathers storms"],
    ["engine.texture.7", "星を数える人", "The star counter"],
    ["engine.texture.8", "台所に立つ人", "The one who keeps the kitchen warm"],
    ["engine.texture.9", "糸を紡ぐ人", "The thread spinner"],
    ["engine.texture.10", "坂をのぼる人", "The hill climber"],
    ["engine.texture.11", "地図を描く人", "The map maker"],
    ["engine.texture.12", "井戸を掘る人", "The well digger"],
    ["engine.texture.13", "鐘を鳴らす人", "The bell ringer"],
    ["engine.texture.14", "川を渡る人", "The river crosser"],
    ["engine.texture.15", "風を読む人", "The one who reads the wind"],
    ["engine.axis.near", "そば", "Close to others"],
    ["engine.axis.work", "仕事", "Work"],
    ["engine.axis.roots", "根", "Roots"],
    ["engine.axis.wind", "風", "Change"],
    ["engine.axis.calm", "凪", "Calm"],
    ["engine.axis.waves", "波", "Ups and downs"],
    ["engine.axis.today", "今日", "Today"],
    ["engine.axis.tomorrow", "明日", "Tomorrow"],
    ["engine.degree.even", "半々", "Evenly"],
    ["engine.degree.strong", "大きく", "Strongly"],
    ["engine.degree.slight", "少し", "Slightly"],
    ["engine.summary.birth", "{country}・{place}の{wealth}家庭に、{child}として生まれました。", "You were born as a {child} in a {wealth} household in {place}, {country}."],
    ["engine.summary.village", "の村", "a nearby village"],
    ["engine.summary.education.none", "初等教育は修了しませんでした。", "You did not complete primary school."],
    ["engine.summary.education.primary", "初等教育を終えました。", "You completed primary school."],
    ["engine.summary.education.secondary", "中等教育を終えました。", "You completed secondary school."],
    ["engine.summary.education.univ", "大学を卒業しました。", "You graduated from university."],
    ["engine.summary.job", "{job}として働きました。", "You worked as {jobPhrase}."],
    ["engine.summary.job_retired", "{job}として働き、引退しました。", "You worked as {jobPhrase} before retiring."],
    ["engine.summary.moved", "{place}に移り住みました。", "You moved to {place}."],
    ["engine.summary.spouse", "{name}と{years}年連れ添いました。", "You and {name} spent {years} years together."],
    ["engine.summary.spouse_one", "{name}と{years}年連れ添いました。", "You and {name} spent one year together."],
    ["engine.summary.spouse_lost", "{name}と{years}年連れ添い、先に見送りました。", "You shared {years} years with {name} before they died."],
    ["engine.summary.spouse_lost_one", "{name}と{years}年連れ添い、先に見送りました。", "You shared one year with {name} before they died."],
    ["engine.summary.unmarried", "結婚せずに暮らしました。", "You did not marry."],
    ["engine.summary.children", "{count}人の子どもがいました。", "You had {count} children."],
    ["engine.summary.children_one", "{count}人の子どもがいました。", "You had one child."],
    ["engine.summary.grandchildren", "孫が{count}人生まれました。", "You had {count} grandchildren."],
    ["engine.summary.grandchildren_one", "孫が{count}人生まれました。", "You had one grandchild."],
    ["engine.summary.cared", "年を重ねた親をそばで支えました。", "You cared for an aging parent."],
    ["engine.summary.drink", "お酒の量に悩む時期がありました。", "There was a time when alcohol was a struggle."],
    ["engine.summary.scholar", "支援を受けて遠くで学びました。", "With support, you studied away from home."],
    ["engine.summary.business", "小さな商売を営みました。", "You ran a small business."],
    ["engine.summary.house", "自分の住まいを持ちました。", "You had a home of your own."],
    ["engine.summary.smoker", "たばこを吸う習慣が続きました。", "You continued to smoke."],
    ["engine.summary.quit_smoking", "たばこをやめました。", "You quit smoking."],
    ["engine.summary.early_marriage", "10代で結婚しました。", "You married as a teenager."],
    ["engine.summary.returned", "のちに故郷へ戻りました。", "You later returned to your birthplace."],
    ["engine.summary.death", "{age}歳のとき、{cause}で亡くなりました。", "You died at age {age} from {cause}."],
    ["engine.record.spouse", "{name}（{years}年）", "{name} ({years} years)"],
    ["engine.record.spouse_one", "{name}（{years}年）", "{name} (one year)"],
    ["engine.record.spouse_lost", "{name}（{years}年、先立たれた）", "{name} ({years} years; died before you)"],
    ["engine.record.spouse_lost_one", "{name}（{years}年、先立たれた）", "{name} (one year; died before you)"],
    ["engine.record.best_year", "{age}歳（{year}年）", "Age {age} ({year})"],
    ["engine.record.years", "{count}年", "{count} years"],
    ["engine.record.years_one", "{count}年", "one year"],
    ["engine.record.see_off_family", "子どもと孫と古い友人たち", "Family and longtime friends"],
    ["engine.record.see_off_parents", "両親", "Your parents"],
    ["engine.record.see_off_friends", "きょうだいと友人たち", "Siblings and friends"],
    ["engine.reflection.short", "短い時間でしたが、たしかにこの世界にいました。", "Your time was brief, but you were here in this world."],
    ["engine.reflection.debt_family", "家計に苦しい時期もありました。子どもと過ごした時間が残りました。", "Money was sometimes tight. The time you spent with your children stayed with you."],
    ["engine.reflection.moved", "生まれた場所を離れ、新しい土地で暮らしを重ねました。", "You left your birthplace and built a life somewhere new."],
    ["engine.reflection.learned", "学ぶ機会を得て、知識を広げました。", "You found chances to learn and widened your view of the world."],
    ["engine.reflection.connected", "人とのつながりを大切にしながら暮らしました。", "You valued the people close to you throughout your life."],
    ["engine.reflection.daily", "日々の小さな選択を重ねて、一生を歩みました。", "Your life took shape through countless everyday choices."],
    ["engine.cause.newborn_illness", "生まれてまもない時期の病気", "an illness soon after birth"],
    ["engine.cause.pneumonia", "肺炎", "pneumonia"],
    ["engine.cause.premature", "早産による合併症", "complications of premature birth"],
    ["engine.cause.dehydration", "下痢による脱水", "dehydration from diarrhea"],
    ["engine.cause.measles", "はしか", "measles"],
    ["engine.cause.malaria", "マラリア", "malaria"],
    ["engine.cause.road", "交通事故", "a road crash"],
    ["engine.cause.drowning", "水の事故", "a water accident"],
    ["engine.cause.infection", "感染症", "an infectious disease"],
    ["engine.cause.heart_disease", "心臓の病気", "heart disease"],
    ["engine.cause.tuberculosis", "結核", "tuberculosis"],
    ["engine.cause.birth_complication", "出産にともなう合併症", "complications of childbirth"],
    ["engine.cause.cancer", "がん", "cancer"],
    ["engine.cause.heart_attack", "心筋梗塞", "a heart attack"],
    ["engine.cause.stroke", "脳卒中", "a stroke"],
    ["engine.cause.diabetes", "糖尿病の合併症", "complications of diabetes"],
    ["engine.cause.lung_disease", "肺の病気", "lung disease"],
    ["engine.cause.heart_failure", "心不全", "heart failure"],
    ["engine.cause.old_age", "老衰", "old age"],
    ["engine.cause.hiv", "HIV/エイズ関連の病気", "an HIV-related illness"],
    ["engine.cause.violence", "暴力による死", "violence"],
    ["engine.cause.lung_cancer", "肺がん", "lung cancer"],
    ["engine.cause.copd", "慢性閉塞性肺疾患", "chronic obstructive pulmonary disease"],
    ["engine.cause.conflict", "紛争", "armed conflict"],
    ["engine.log.school_allowed", "何度も頼み込んで、学校に通わせてもらえることになりました。", "After asking many times, you were allowed to attend school."],
    ["engine.log.school_denied", "頼んでみましたが、家にその余裕はありませんでした。", "You asked, but your family could not afford it."],
    ["engine.log.help_family", "家族を助けることを選びました。", "You chose to help your family."],
    ["engine.log.university_accepted", "大学に合格しました。", "You were accepted to university."],
    ["engine.log.university_denied", "大学には進めませんでした。働きはじめることにしました。", "University did not work out, so you began working."],
    ["engine.log.stay_job", "今の仕事を続けることにしました。", "You decided to stay in your current job."],
    ["engine.log.no_child", "この年は子どもが生まれませんでした。", "No child was born this year."],
    ["engine.log.no_more_children", "今は子どもを増やさないことにしました。", "You decided not to have another child for now."],
    ["engine.log.gamble_win", "ひと勝負が当たり、お金が増えました。", "The gamble paid off, and you gained money."],
    ["engine.log.gamble_lose", "話はうまくいかず、出したお金は戻りませんでした。", "It did not work out, and the money you put in was gone."],
    ["engine.log.gamble_decline", "うまい話は断りました。", "You turned down the offer."],
    ["engine.log.stay_home", "生まれた土地に残ることにしました。", "You decided to stay where you were born."],
    ["engine.log.drink_less", "家族に打ち明け、少しずつお酒を減らしました。", "You told your family and gradually drank less."],
    ["engine.log.drink_more", "つらいことを、酒でまぎらわせるようになりました。", "You began using alcohol to cope."],
    ["engine.log.scholarship", "支援を受け、遠くで学ぶ機会を得ました。", "You received support and had the chance to study away from home."],
    ["engine.log.study_nearby", "住み慣れた場所で学びを続けました。", "You continued studying in familiar surroundings."],
    ["engine.log.work_instead", "進学を見送り、家計を支えました。", "You postponed further study and helped support the household."],
    ["engine.log.hospital", "費用を工面して病院で治療を受けました。", "You found a way to pay for hospital treatment."],
    ["engine.log.clinic", "近くの診療所に通い、少しずつ回復しました。", "You visited a nearby clinic and slowly recovered."],
    ["engine.log.rest_home", "家族に助けられながら休養しました。", "You rested with your family's help."],
    ["engine.log.home_owned", "自分たちの住まいを持ちました。", "You got a home of your own."],
    ["engine.log.home_repaired", "住まいの傷んだところを直しました。", "You repaired the worn parts of your home."],
    ["engine.log.home_wait", "住まいの話は先送りにしました。", "You put off the decision about a home."],
    ["engine.log.business_start", "小さな商売を始めました。", "You started a small business."],
    ["engine.log.business_together", "仲間と店を切り盛りし始めました。", "You and your partners began running a shop."],
    ["engine.log.business_decline", "商売の話を見送り、いまの仕事を続けました。", "You passed up the business opportunity and stayed in your current job."],
    ["engine.log.evacuate", "家族と早めに安全な場所へ移りました。", "You and your family moved to safety early."],
    ["engine.log.prepare", "近所の人と備えながら過ごしました。", "You stayed and prepared with your neighbors."],
    ["engine.log.wait_home", "家に残り、落ち着かない夜を過ごしました。", "You stayed home and spent an anxious night."],
    ["engine.log.friend_loan", "友人の急場を助けました。", "You helped your friend through a difficult moment."],
    ["engine.log.friend_support", "無理のない範囲で友人を助けました。", "You helped your friend within your means."],
    ["engine.log.friend_listen", "友人の話を聞き、別の手立てを一緒に探しました。", "You listened and looked for another way together."],
    ["engine.log.community_lead", "地域の世話役を引き受けました。", "You took on a community organizer role."],
    ["engine.log.community_help", "できる日に集まりを手伝いました。", "You helped the group when you could."],
    ["engine.log.community_decline", "いまは自分の暮らしを優先しました。", "You put your own needs first for now."],
    ["engine.log.night_school", "夜の教室に通い、学び直しました。", "You attended evening classes and returned to learning."],
    ["engine.log.self_study", "仕事の合間に少しずつ学びました。", "You learned bit by bit between work shifts."],
    ["engine.log.rest", "体を休める時間を選びました。", "You chose time to rest."],
    ["engine.log.child_school_pay", "蓄えを使い、子どもの進学を支えました。", "You used savings to support your child's education."],
    ["engine.log.child_school_aid", "子どもと支援制度を調べました。", "You and your child looked into financial aid."],
    ["engine.log.child_school_work", "働きながら学ぶ方法を子どもと話し合いました。", "You talked with your child about working while studying."],
    ["engine.log.elder_near_children", "子どもの近くに住まいを移しました。", "You moved closer to your children."],
    ["engine.log.elder_near_friends", "親しい人の近くに住まいを移しました。", "You moved closer to people you know well."],
    ["engine.log.elder_stay", "慣れた家で暮らし続けました。", "You stayed in your familiar home."],
    ["engine.log.elder_support", "手助けを受けられる住まいを選びました。", "You chose housing where help was available."],
    ["engine.log.early_marriage_refuse", "結婚を急がず、学びを続けたいと伝えました。", "You said you wanted to keep studying instead of marrying soon."],
    ["engine.log.early_marriage_delay", "相談できる人を見つけ、縁談を先に延ばしました。", "You found someone to talk to and postponed the proposal."],
    ["engine.log.early_marriage_accept", "若くして結婚し、学ぶ時間や暮らし方が変わりました。", "You married young, changing your time for study and daily life."],
    ["engine.log.quit_smoking", "たばこをやめ、息が楽になる日が増えました。", "You quit smoking and found breathing easier on more days."],
    ["engine.log.smoke_less", "たばこの本数を減らしました。", "You smoked fewer cigarettes."],
    ["engine.log.keep_smoking", "たばこを続けることにしました。", "You decided to keep smoking."],
    ["engine.log.return_home", "故郷に戻り、新しい暮らしを始めました。", "You returned home and began a new life."],
    ["engine.log.stay_abroad", "移り住んだ先で暮らし続けました。", "You continued living in the place you moved to."],
    ["engine.log.travel_between", "故郷と今の住まいを行き来しました。", "You traveled between your hometown and current home."],
    ["engine.decision.chosen", "{age}歳：{title} — {choice}を選びました。", "Age {age}: {title} — {choice}."],
    ["engine.small.child.0", "近所の子どもたちと、日が暮れるまで遊びました。", "You played with children nearby until sunset."],
    ["engine.small.child.1", "身近な大人に、昔から伝わる話を聞かせてもらいました。", "An adult close to you told you a story passed down through the years."],
    ["engine.small.child.2", "転んだあとも、自分で立ち上がりました。", "You got back up after a fall."],
    ["engine.small.child.3", "名前を呼ばれると、振り向くようになりました。", "You learned to turn when someone called your name."],
    ["engine.small.child.4", "地域の催しで、家族と人の輪に加わりました。", "You joined your family at a neighborhood gathering."],
    ["engine.small.child.5", "雨の日、軒下で水たまりを眺めました。", "On a rainy day, you watched puddles from the doorway."],
    ["engine.small.child.6", "小石を並べて数を覚えました。", "You lined up pebbles and learned to count."],
    ["engine.small.child.7", "家で聞いた歌をまねして口ずさみました。", "You hummed a song you had heard at home."],
    ["engine.small.student.0", "親友ができました。", "You made a close friend."],
    ["engine.small.student.1", "先生にほめられて、一日じゅううれしい気持ちでした。", "A teacher's praise stayed with you all day."],
    ["engine.small.student.2", "放課後、友だちとボールを追いかけました。", "You chased a ball with friends after school."],
    ["engine.small.student.3", "はじめて一人で遠くまでおつかいに行きました。", "You ran an errand far from home on your own for the first time."],
    ["engine.small.student.4", "夜遅くまで、こっそり本を読みました。", "You secretly read a book late into the night."],
    ["engine.small.student.5", "苦手な計算を何度も練習しました。", "You practiced difficult calculations again and again."],
    ["engine.small.student.6", "友だちと将来の夢を話しました。", "You and a friend talked about your hopes for the future."],
    ["engine.small.student.7", "学校行事の準備を手伝いました。", "You helped prepare for a school event."],
    ["engine.small.adult.0", "古い友人たちと久しぶりに集まり、夜ふけまで話しこみました。", "You caught up with old friends and talked late into the night."],
    ["engine.small.adult.1", "何も予定のない朝、温かい飲みものをゆっくり味わいました。", "On a free morning, a warm drink tasted especially good."],
    ["engine.small.adult.2", "近所の人が困っていたので、手を貸しました。", "You helped a neighbor who needed a hand."],
    ["engine.small.adult.3", "季節の行事を家族と過ごしました。", "You marked a seasonal occasion with your family."],
    ["engine.small.adult.4", "仕事帰りに見た夕焼けが、忘れられないほどきれいでした。", "The sunset on your way home from work stayed in your memory."],
    ["engine.small.adult.5", "古い道具を直してもう一度使いました。", "You repaired an old tool and put it to use again."],
    ["engine.small.adult.6", "仕事仲間の相談に耳を傾けました。", "You listened to a colleague who needed to talk."],
    ["engine.small.adult.7", "休日に少し遠くまで歩きました。", "You took a long walk on your day off."],
    ["engine.small.old.0", "親しい人が訪ねてきて、家がにぎやかになりました。", "Someone close visited, filling your home with conversation."],
    ["engine.small.old.1", "若いころの写真を見返しました。", "You looked through photographs from your younger years."],
    ["engine.small.old.2", "膝をいたわって歩く日が増えました。", "You took more care with your knees when walking."],
    ["engine.small.old.3", "近所の子どもに昔の話をしました。", "You told a child nearby a story about long ago."],
    ["engine.small.old.4", "古い友人と久しぶりに声を交わしました。", "You spoke with an old friend for the first time in a while."],
    ["engine.small.old.5", "朝の散歩で同じ木の成長を見守りました。", "On morning walks, you watched a familiar tree grow."],
    ["engine.small.old.6", "身近な人に、昔覚えた料理の作り方を教えました。", "You taught someone close to you a recipe you learned long ago."],
    ["engine.small.old.7", "読みかけの本を少しずつ読み進めました。", "You read a little more of a book you had started."],
    ["engine.small.urban.0", "朝の通りで店が開く音を聞きました。", "You heard shops opening along the street in the morning."],
    ["engine.small.urban.1", "混んだ乗り物で知らない人に席を譲りました。", "You offered your seat to a stranger on a crowded ride."],
    ["engine.small.urban.2", "街角の小さな市場に立ち寄りました。", "You stopped by a small market on the corner."],
    ["engine.small.urban.3", "工事の音に街の変化を感じました。", "Construction sounds reminded you that the city was changing."],
    ["engine.small.rural.0", "畑の土に触れ、雨が待ち遠しくなりました。", "You touched the soil in a field and hoped for rain."],
    ["engine.small.rural.1", "近所の家から収穫物を分けてもらいました。", "A neighbor shared some of their harvest with you."],
    ["engine.small.rural.2", "夜空にいつもより多く星が見えました。", "More stars than usual filled the night sky."],
    ["engine.small.rural.3", "道の途中で飼われている動物に会いました。", "You met a neighbor's animal along the road."],
    ["engine.small.poor.0", "使い古した服を丁寧に繕いました。", "You carefully mended worn clothes."],
    ["engine.small.poor.1", "買い物の前に小銭を数えました。", "You counted your coins before shopping."],
    ["engine.small.poor.2", "家族で食べものを分け合いました。", "Your family shared what food you had."],
    ["engine.small.poor.3", "借りた道具を大事に使いました。", "You took good care of a borrowed tool."],
    ["engine.small.rich.0", "休みの日に家族で小旅行に出ました。", "Your family took a short trip on a day off."],
    ["engine.small.rich.1", "家の本棚に新しい本を加えました。", "You added a new book to the shelf at home."],
    ["engine.small.rich.2", "知人を家に招いて食事をしました。", "You invited someone over for a meal."],
    ["engine.small.rich.3", "使わなくなった品を人に譲りました。", "You gave away something you no longer used."],
    ["engine.small.kids.0", "子どもの靴がまた小さくなりました。", "Your child's shoes were already too small again."],
    ["engine.small.kids.1", "子どもの宿題を一緒に考えました。", "You helped your child think through their homework."],
    ["engine.small.kids.2", "眠る前に子どもの話を聞きました。", "You listened to your child before bed."],
    ["engine.small.kids.3", "家族で次の休みの予定を話しました。", "Your family made plans for the next day off."],
    ["engine.small.retired.0", "平日の朝を急がずに過ごしました。", "You took your time on a weekday morning."],
    ["engine.small.retired.1", "長年の仕事仲間と近況を語りました。", "You caught up with a longtime colleague."],
    ["engine.small.retired.2", "若い人に仕事の経験を伝えました。", "You shared your work experience with someone younger."],
    ["engine.small.retired.3", "新しい散歩道を見つけました。", "You found a new route for your walks."],
    ["engine.small.abroad.0", "故郷の味を思い出して料理をしました。", "You cooked a meal that reminded you of home."],
    ["engine.small.abroad.1", "新しい土地の言葉を一つ覚えました。", "You learned a word used in your new home."],
    ["engine.small.abroad.2", "遠くの家族と近況を伝え合いました。", "You exchanged news with family far away."],
    ["engine.small.abroad.3", "違う習慣に少しずつ慣れました。", "You grew more used to unfamiliar customs."],
    ["engine.small.widowed.0", "二人で使った食器を静かに洗いました。", "You quietly washed dishes you once used together."],
    ["engine.small.widowed.1", "懐かしい声をふと思い出しました。", "A familiar voice suddenly came back to you."],
    ["engine.small.widowed.2", "友人と食卓を囲み、近況を話しました。", "You shared a meal and news with a friend."],
    ["engine.small.widowed.3", "古い写真を一枚、机に飾りました。", "You placed an old photograph on the table."],
    ["engine.small.child.8", "慣れない道を、小さな足で歩ききりました。", "You made it along an unfamiliar path on your small feet."],
    ["engine.small.child.9", "近所の犬と顔なじみになりました。", "You became familiar with a dog in the neighborhood."],
    ["engine.small.child.10", "朝のひんやりした空気に驚きました。", "The cool morning air surprised you."],
    ["engine.small.child.11", "身近な子と秘密の遊びを考えました。", "You and another child invented a secret game."],
    ["engine.small.child.12", "大人の仕事をまねて遊びました。", "You played at doing an adult's work."],
    ["engine.small.child.13", "眠る前にお気に入りの話をせがみました。", "You asked for your favorite story before bed."],
    ["engine.small.student.8", "図書室で知らない土地の本を読みました。", "You read about an unfamiliar place in the library."],
    ["engine.small.student.9", "年下の子に文字を教えました。", "You taught a younger child some letters."],
    ["engine.small.student.10", "試験の朝、少し早く起きました。", "You got up a little early on the morning of an exam."],
    ["engine.small.student.11", "失敗した友だちを励ましました。", "You encouraged a friend after a setback."],
    ["engine.small.student.12", "通学路の季節の変化に気づきました。", "You noticed the seasons changing along your route to school."],
    ["engine.small.student.13", "初めて自分の意見を人前で話しました。", "You voiced your own opinion in front of others for the first time."],
    ["engine.small.adult.8", "新しい料理を覚えました。", "You learned to make a new dish."],
    ["engine.small.adult.9", "久しぶりに家族へ手紙を書きました。", "You wrote a letter to family after a long time."],
    ["engine.small.adult.10", "思いがけず昔の恩師に会いました。", "You unexpectedly met a teacher who had helped you years ago."],
    ["engine.small.adult.11", "雨上がりの空気の匂いを楽しみました。", "You enjoyed the scent of the air after rain."],
    ["engine.small.adult.12", "若い同僚に仕事のこつを伝えました。", "You shared a work tip with a younger colleague."],
    ["engine.small.adult.13", "一日の終わりに静かな時間を持ちました。", "You found a quiet moment at the end of the day."],
    ["engine.small.old.8", "昔よく通った道を歩きました。", "You walked a road you often took long ago."],
    ["engine.small.old.9", "季節の花を窓辺に飾りました。", "You placed seasonal flowers by the window."],
    ["engine.small.old.10", "若い人の話を聞く時間が楽しみになりました。", "You looked forward to listening to younger people."],
    ["engine.small.old.11", "長く使った道具を手入れしました。", "You cared for a tool you had used for years."],
    ["engine.small.urban.4", "公園の木陰でひと息つきました。", "You took a break in the shade of a park tree."],
    ["engine.small.urban.5", "近所の店主と顔なじみになりました。", "You got to know a local shopkeeper."],
    ["engine.small.urban.6", "帰り道の屋台で温かいものを買いました。", "You bought something warm from a street stall on your way home."],
    ["engine.small.rural.4", "近所の人から村の知らせを聞きました。", "A neighbor brought you news from the village."],
    ["engine.small.rural.5", "木々の色が変わり、季節の移り変わりに気づきました。", "Changing colors in the trees marked the turn of the season."],
    ["engine.small.rural.6", "家の前の道を近所の人と整えました。", "You helped neighbors mend the path outside your home."],
    ["engine.small.poor.4", "安い店を探して遠回りしました。", "You took a longer route to find a cheaper shop."],
    ["engine.small.poor.5", "急な出費に備えて少しずつ蓄えました。", "You saved a little at a time for unexpected expenses."],
    ["engine.small.rich.4", "余裕のある日に町の催しを見に行きました。", "On a free day, you went to a town event."],
    ["engine.small.rich.5", "好きなことを学ぶ時間を作りました。", "You made time to learn something you enjoyed."],
    ["engine.small.kids.4", "子どもが描いた絵を壁に飾りました。", "You hung a picture your child drew on the wall."],
    ["engine.small.kids.5", "子どもの好きな料理を作りました。", "You cooked your child's favorite dish."],
    ["engine.small.kids.6", "小さな成長を日記に書き留めました。", "You wrote down a small milestone in your diary."],
    ["engine.small.retired.4", "昼の市場で買い物を楽しみました。", "You enjoyed shopping at the midday market."],
    ["engine.small.retired.5", "時計を気にせず庭を手入れしました。", "You tended the garden without watching the clock."],
    ["engine.small.abroad.4", "同郷の人と故郷の話をしました。", "You talked about home with someone from your birthplace."],
    ["engine.small.abroad.5", "新しい街の道を迷わず歩けました。", "You found your way through the new city's streets without getting lost."],
    ["engine.small.widowed.4", "一人で過ごす夕方の時間にも、少しずつ慣れました。", "You gradually grew used to quiet evenings on your own."],
    ["engine.small.widowed.5", "身近な人と、亡くなった伴侶の思い出を話しました。", "You shared memories of your late partner with someone close."],
    ["engine.small.child.variant.0", "庭先で見つけた虫を、しばらく観察しました。", "You watched an insect you found outside for a while."],
    ["engine.small.child.variant.1", "大人の手を引いて、行ったことのない道を歩きました。", "Holding an adult's hand, you walked down a road you had never taken."],
    ["engine.small.child.variant.2", "布を結び、見立て遊びの道具にしました。", "You tied scraps of cloth into a prop for pretend play."],
    ["engine.small.child.variant.3", "水を入れた器を並べ、音の違いを楽しみました。", "You lined up bowls of water and enjoyed the different sounds they made."],
    ["engine.small.child.variant.4", "見慣れた人の顔を描き、渡しました。", "You drew the face of someone familiar and gave them the picture."],
    ["engine.small.child.variant.5", "はじめて自分で靴を履こうとしました。", "You tried to put on your shoes by yourself for the first time."],
    ["engine.small.student.variant.0", "教室で係を任され、朝早く準備しました。", "You were given a classroom task and came early to prepare."],
    ["engine.small.student.variant.1", "新しく習った言葉を家で使ってみました。", "You tried out a new word you learned at school at home."],
    ["engine.small.student.variant.2", "放課後の小さな試合で、友だちを応援しました。", "You cheered for a friend at a small match after school."],
    ["engine.small.student.variant.3", "家の用事を済ませてから、机に向かいました。", "You finished chores at home before sitting down to study."],
    ["engine.small.student.variant.4", "地図を開いて、遠い町の名前を覚えました。", "You opened a map and learned the name of a distant town."],
    ["engine.small.student.variant.5", "難しい問題を友だちと相談して解きました。", "You and a friend solved a difficult problem together."],
    ["engine.small.adult.variant.0", "朝のうちに用事を片づけ、午後はゆっくり過ごしました。", "You finished your errands in the morning and took a slow afternoon."],
    ["engine.small.adult.variant.1", "初めて訪れた店で、店主と話しました。", "You talked with the owner of a shop you had never visited before."],
    ["engine.small.adult.variant.2", "近所の人と道の掃除をしました。", "You helped neighbors clean the road."],
    ["engine.small.adult.variant.3", "家にある材料で、いつもと違う料理を作りました。", "You made a different meal using what you had at home."],
    ["engine.small.adult.variant.4", "帰り道に空を見上げ、雨の気配に気づきました。", "You looked up on your way home and sensed rain coming."],
    ["engine.small.adult.variant.5", "古い服を繕って、また着られるようにしました。", "You mended old clothes so they could be worn again."],
    ["engine.small.adult.variant.6", "仕事帰りに寄り道して、店先を眺めました。", "You took a detour after work to look at shop windows."],
    ["engine.small.adult.variant.7", "休日に手紙を読み返しました。", "You reread a letter on your day off."],
    ["engine.small.old.variant.0", "朝の支度を終え、窓から通りを眺めました。", "After getting ready in the morning, you watched the street from your window."],
    ["engine.small.old.variant.1", "昔覚えた歌を、声に出して歌いました。", "You sang aloud a song you had learned long ago."],
    ["engine.small.old.variant.2", "座ってできる作業を選び、手を動かしました。", "You chose a task you could do while seated and kept your hands busy."],
    ["engine.small.old.variant.3", "近所の人に道を尋ねられ、案内しました。", "A neighbor asked for directions, and you showed the way."],
    ["engine.small.old.variant.4", "久しぶりに友人へ電話をかけました。", "You called a friend you had not spoken with in a while."],
    ["engine.small.old.variant.5", "季節の変わり目に、衣類を整理しました。", "You sorted your clothes as the seasons changed."],
    ["engine.small.urban.variant.0", "横断歩道で急ぐ人たちを見送りました。", "You watched people hurry across a crosswalk."],
    ["engine.small.urban.variant.1", "停留所で見知らぬ人と天気の話をしました。", "You chatted about the weather with a stranger at the stop."],
    ["engine.small.urban.variant.2", "夕方の通りで、帰宅する人の列に加わりました。", "You joined the stream of people heading home in the evening."],
    ["engine.small.urban.variant.3", "小さな店の前で、今日の献立を考えました。", "Outside a small shop, you decided what to make for dinner."],
    ["engine.small.rural.variant.0", "近所の人と道具を貸し借りしました。", "You and a neighbor lent each other tools."],
    ["engine.small.rural.variant.1", "朝、家の周りを歩いて風の向きを感じました。", "In the morning, you walked around your home and felt the wind shift."],
    ["engine.small.rural.variant.2", "遠くから聞こえる鳥の声に足を止めました。", "You stopped to listen to a bird calling in the distance."],
    ["engine.small.rural.variant.3", "収穫の時期を近所の人と相談しました。", "You talked with neighbors about when to harvest."],
    ["engine.small.poor.variant.0", "手持ちの材料で、数日分の食事を考えました。", "You planned several days of meals from the ingredients at hand."],
    ["engine.small.poor.variant.1", "壊れたかばんを修理して使いました。", "You repaired a broken bag so you could keep using it."],
    ["engine.small.poor.variant.2", "買うものを紙に書き、必要な品から選びました。", "You wrote a shopping list and chose the essentials first."],
    ["engine.small.poor.variant.3", "出費を抑えるため、歩いて用事を済ませました。", "You walked to run errands and save money."],
    ["engine.small.rich.variant.0", "家で使う道具を新しく買い替えました。", "You bought a replacement for a household tool."],
    ["engine.small.rich.variant.1", "遠くに住む知人を訪ねました。", "You visited someone you knew who lived far away."],
    ["engine.small.rich.variant.2", "習いごとの時間を予定に入れました。", "You set aside time for a class you wanted to take."],
    ["engine.small.rich.variant.3", "地域の催しに寄付をしました。", "You donated to a local event."],
    ["engine.small.kids.variant.0", "子どもが覚えた歌を一緒に歌いました。", "You sang a song your child had learned together."],
    ["engine.small.kids.variant.1", "子どもの話を聞きながら夕食を用意しました。", "You prepared dinner while listening to your child."],
    ["engine.small.kids.variant.2", "子どもと次の休みの過ごし方を決めました。", "You and your child planned how to spend the next day off."],
    ["engine.small.kids.variant.3", "子どもの好きな本を探しました。", "You looked for a book your child would enjoy."],
    ["engine.culture.food.child.0", "家族と食べた{food}の味を、覚えました。", "You remembered the taste of {food} shared with family."],
    ["engine.culture.food.child.1", "食卓で{food}を分け合いました。", "You shared {food} around the table."],
    ["engine.culture.food.child.2", "家族が用意した{food}を囲みました。", "Your family gathered around a meal of {food}."],
    ["engine.culture.food.child.3", "はじめて食べた{food}を気に入りました。", "You tasted {food} for the first time and liked it."],
    ["engine.culture.food.adult.0", "食卓に{food}が並ぶと、家族の会話が弾みました。", "A meal of {food} brought lively conversation to the table."],
    ["engine.culture.food.adult.1", "久しぶりに{food}を食べ、故郷の味を思い出しました。", "Eating {food} again reminded you of home."],
    ["engine.culture.food.adult.2", "家族と{food}を作って食べました。", "You made and ate {food} with your family."],
    ["engine.culture.food.adult.3", "食材を買いそろえ、{food}を作りました。", "You bought the ingredients and made {food}."],
    ["engine.culture.food.old.0", "若いころに食べた{food}を、家族に作ってみせました。", "You made {food} for your family, remembering it from your youth."],
    ["engine.culture.food.old.1", "食卓の{food}で、昔の出来事を思い出しました。", "The taste of {food} brought back an old memory."],
    ["engine.culture.food.old.2", "家族に{food}の味を教えました。", "You introduced your family to the taste of {food}."],
    ["engine.culture.food.old.3", "久しぶりに{food}を作り、ゆっくり味わいました。", "You made {food} again and savored it slowly."],
    ["engine.culture.festival.child", "{month}{festival}を迎え、町のにぎわいを楽しみました。", "You enjoyed the bustle around {festival} with people close to you."],
    ["engine.culture.festival.adult", "{month}{festival}を家族や友人と過ごしました。", "You spent {festival} with family and friends."],
    ["engine.culture.festival.old", "{month}{festival}の日、昔の祝い方を話しました。", "On {festival}, you shared memories of how it was once celebrated."],
    ["engine.culture.sport.child", "友だちと{sport}を楽しみました。", "You played {sport} with friends until sunset."],
    ["engine.culture.sport.adult", "{sport}の試合を見ました。", "You watched {sport} and talked with neighbors."],
    ["engine.culture.sport.old", "子どもたちの{sport}を眺めました。", "You watched children play {sport}."],
    ["engine.culture.language", "学校で{language}の読み書きを練習しました。", "At school, you practiced reading and writing {language}."],
    ["engine.culture.greeting.new", "新しい知り合いに「{greeting}」と声をかけました。", "You greeted a new acquaintance with ‘{greeting}’."],
    ["engine.culture.greeting.old", "久しぶりに会った人と「{greeting}」とあいさつを交わしました。", "You exchanged a ‘{greeting}’ with someone you had not seen in a while."],
    ["engine.culture.housing", "{home}。その日あったことを身近な人と話しました。", "You talked about the day with someone close to you at home: {home}."],
    ["engine.culture.weather.rain", "{month}月、雨の多い季節に道の水たまりをよけて歩きました。", "In month {month}, you stepped around puddles in the rainy season."],
    ["engine.culture.weather.flood", "{month}月、雨が続き、近くの川の水位を気にかけました。", "In month {month}, continued rain made you watch the nearby river."],
    ["engine.culture.weather.heat", "{month}月、暑さのなかで涼しい場所を探して休みました。", "In month {month}, you found a cool place to rest from the heat."],
    ["engine.culture.weather.drought", "{month}月、乾いた畑を見て雨が降るのを待ちました。", "In month {month}, you looked at the dry fields and hoped for rain."],
    ["engine.culture.weather.cold", "{month}月、冷え込む朝に温かい飲み物で体を温めました。", "On a cold morning in month {month}, a warm drink helped you thaw out."],
    ["engine.culture.weather.snow", "{month}月、雪の積もった道をゆっくり歩きました。", "In month {month}, you walked slowly along a snowy road."],
    ["engine.log.no_electricity_homework", "家に電気が届かず、ランプの明かりで宿題をしました。", "Without electricity at home, you did homework by lamplight."],
    ["engine.log.no_electricity_night", "家に電気が届かない夜、ランプを囲んで過ごしました。", "On a night without electricity, your family gathered around a lamp."],
    ["engine.log.solar_lamp", "家族で初めて小さなソーラーランプを手に入れました。", "Your family got its first small solar lamp."],
    ["engine.log.fetch_water_child", "家の水をくみに行くため、朝早く家族と歩きました。", "You walked with family early in the morning to fetch water."],
    ["engine.log.fetch_water_adult", "水を運ぶ道のりが、毎日の家事の一部になりました。", "Carrying water became part of your daily chores."],
    ["engine.log.cooking_smoke", "薪を使って食事を作り、室内に煙がこもらないようにしました。", "You cooked over firewood and tried to keep smoke out of the room."],
    ["engine.log.sanitation", "安心して使えるトイレが近くになく、使える場所を探しました。", "There was no safe toilet nearby, so you looked for a place to use."],
    ["engine.log.first_phone", "初めて携帯電話を手にし、離れた家族へ声を届けました。", "Your first mobile phone let you speak with family far away."],
    ["engine.log.adult_literacy", "大人になってから文字を習い、家族への便りを自分で読みました。", "You learned to read as an adult and could read a letter from family yourself."],
    ["engine.log.family_letter", "家族に届いた手紙を、いっしょに読みました。", "You read a letter together with your family."],
    ["engine.log.remittance", "遠くで働く親せきから仕送りが届き、家族で使い道を話しました。", "Money arrived from a relative working far away, and your family discussed how to use it."],
    ["engine.log.job_search_past", "今の仕事に就くまで、長く働き口を探しました。", "You spent a long time looking for work before finding your current job."],
    ["engine.log.job_search", "働き口を探して、何度も町へ足を運びました。", "You made many trips into town looking for work."],
    ["engine.log.child_help_gentle", "家の仕事を手伝う日が増えました。", "You spent more days helping with work at home."],
    ["engine.log.child_work_no_school", "家計を支えるため、幼いころから働きました。", "You worked from a young age to support the household."],
    ["engine.log.child_work_after_school", "学校が終わると、家計を助ける仕事をしました。", "After school, you worked to help support your family."],
    ["engine.log.distant_clinic", "診てもらえる医師を探し、遠くの診療所まで出かけました。", "You traveled to a distant clinic to find a doctor."],
    ["engine.log.food_budget_gentle", "出費が重なり、家族で食事を工夫しました。", "As expenses piled up, your family found ways to make meals stretch."],
    ["engine.log.food_budget", "苦しい年には、家族で食事の回数を減らしました。", "In a difficult year, your family ate fewer meals."],
    ["engine.log.girls_school", "同級生の女の子たちと、授業で学んだことを話しました。", "You talked with girls in your class about what you learned."],
    ["engine.log.women_work", "仕事帰りに、働く女性たちと近況を話しました。", "On your way home from work, you caught up with other working women."],
    ["engine.fact.entry", "【資料・{country}】{projection}{text}", "[From {country}] {projection}{text}"],
    ["engine.fact.projection", "見通しでは、", "Projection: "],
    ["engine.log.conflict_gentle", "地域の不安定な状況が続き、家族で安全な道を確かめました。", "Instability continued nearby, and your family planned safe routes."],
    ["engine.log.conflict", "地域で紛争が続き、家族で移動や仕事の予定を変えました。", "Conflict continued nearby, changing your family's travel and work plans."],
    ["engine.log.conflict_work", "地域の混乱で仕事が減り、収入が落ちました。", "Local unrest reduced your work and income."],
    ["engine.log.conflict_school", "安全を確かめる間、学校の授業に通えない日が続きました。", "You missed school for days while your family assessed whether it was safe."],
    ["engine.log.displaced_home", "安全を求めて家族と国内の別の土地へ移りました。", "Seeking safety, your family moved to another part of the country."],
    ["engine.log.return_after_conflict", "状況が落ち着き、家族と故郷へ戻りました。", "When things settled, your family returned home."],
    ["engine.log.economic_crisis", "経済の混乱で働き方を見直し、家計の支出を抑えました。", "Economic turmoil led you to rethink work and cut household spending."],
    ["engine.log.disaster_recovery", "災害の後片づけと生活の立て直しに、時間とお金を使いました。", "Cleaning up after a disaster and rebuilding daily life took time and money."],
    ["engine.log.infection_spread", "感染症の広がりを受け、家族で体調に気を配りました。", "As an illness spread, your family paid closer attention to everyone's health."],
    ["engine.log.child_stunted", "食べものが足りず、年齢に比べて小柄に育ちました。", "With too little food, you grew smaller than many children your age."],
    ["engine.log.fever", "高い熱が何日も続きました。", "You had a high fever for several days."],
    ["engine.log.diarrhea", "ひどい下痢になり、家族が夜通し看病しました。", "Severe diarrhea left your family caring for you through the night."],
    ["engine.log.child_pneumonia", "肺炎になり、診療所で診てもらいました。", "You had pneumonia and were seen at a clinic."],
    ["engine.log.child_rest", "体調を崩し、いつもより長く寝て過ごしました。", "You fell ill and spent more time resting than usual."],
    ["engine.log.primary_started", "小学校に通いはじめました。", "You started primary school."],
    ["engine.log.no_primary", "学校には通えず、家の仕事を手伝うことになりました。", "You could not attend school and helped with work at home."],
    ["engine.log.secondary_started", "中等教育に進みました。", "You moved on to secondary school."],
    ["engine.log.primary_finished", "初等教育を終えました。", "You completed primary school."],
    ["engine.log.secondary_finished", "中等教育を終えました。", "You completed secondary school."],
    ["engine.log.university_finished", "大学を卒業しました。", "You graduated from university."],
    ["engine.log.left_school", "学校を離れました。", "You left school."],
    ["engine.log.help_fields", "畑仕事を手伝いました。", "You helped with work in the fields."],
    ["engine.log.help_younger", "年下の子の世話を手伝いました。", "You helped care for younger children."],
    ["engine.log.help_market", "市場で品物を運ぶ手伝いをしました。", "You helped carry goods at the market."],
    ["engine.log.help_meals", "家で食事の支度を手伝いました。", "You helped prepare meals at home."],
    ["engine.log.pension", "働いていたころの加入により、年金を受け取り始めました。", "You began receiving a pension from your years of work."],
    ["engine.log.first_grandchild", "はじめての孫が生まれました。", "Your first grandchild was born."],
    ["engine.log.economic_downturn", "景気が悪くなり、仕事が減りました。", "An economic downturn reduced the work available to you."],
    ["engine.log.influenza", "インフルエンザで寝込みました。", "The flu kept you in bed."],
    ["engine.log.back_pain", "腰を痛めて、しばらく仕事を休みました。", "A back injury kept you away from work for a while."],
    ["engine.log.high_blood_pressure", "健康診断で、血圧が高いと言われました。", "A health check found that your blood pressure was high."],
    ["engine.log.ill_rest", "体調を崩し、家で休む日が続きました。", "You felt unwell and rested at home for several days."],
    ["engine.log.smoking_started", "周りの人に誘われ、たばこを吸い始めました。", "After people around you offered cigarettes, you started smoking."],
    ["engine.log.smoking_cough", "せきが長引き、診療所で肺の具合を診てもらいました。", "A lingering cough led you to have your lungs checked at a clinic."],
    ["engine.log.road_injury", "道での事故に巻き込まれ、しばらく通院しました。", "A road crash left you needing care for a while."],
    ["engine.log.long_treatment", "検査を受け、長く付き合う病気の治療を始めました。", "After a test, you began treatment for a long-term illness."],
    ["engine.log.safety_gentle", "地域の安全が心配になり、帰り道を変えました。", "Concerns about safety led you to change your route home."],
    ["engine.log.local_violence", "近所で暴力事件が起き、しばらく外出に気を配りました。", "After a violent incident nearby, you took more care when going out."],
    ["engine.log.business_up", "商売の売上が少し伸びました。", "Sales from your business rose a little."],
    ["engine.log.business_down", "商売の売上が落ち、やりくりを考えました。", "Sales fell, and you looked for ways to manage."],
    ["engine.log.clinic_recovery", "体調が悪化したため診療所に通い、少し回復しました。", "You went to a clinic as your health worsened and recovered a little."],
    ["engine.log.children_support", "大人になった子どもが、暮らしの費用を支えてくれました。", "Your grown children helped with living costs."],
    ["engine.log.children_debt", "子どもと相談し、借入の一部を返しました。", "After talking with your children, you repaid part of the loan."],
    ["engine.log.loan_reschedule", "貸し手と返済を相談し、利息を抑える条件に組み直しました。", "You worked out new repayment terms with your lender to lower interest."],
    ["engine.log.debt_relief", "返せない分の借入を整理し、家計を立て直しました。", "You settled debt you could not repay and rebuilt the household budget."],
    ["engine.log.src_stunting", "世界の5歳未満の子どもの2割ほどが発育阻害の状態にあります（UNICEF・WHO、概算）。", "About one in five children under five worldwide experience stunted growth (UNICEF and WHO estimate)."],
    ["engine.log.src_temperament", "幼いころの気質は、大人になっても続くことが多いとされています。", "Temperament in childhood often continues into adulthood."],
    ["engine.log.src_school", "世界では小学校の年齢の子どもの約7,800万人が学校に通っていません（UNESCO、概算）。", "About 78 million primary school age children worldwide are out of school (UNESCO estimate)."],
    ["engine.log.src_recession", "多くの国は、およそ10年に一度は景気後退を経験しています（IMF、概算）。", "Many countries experience a recession roughly once a decade (IMF estimate)."],
    ["engine.child.born", "{number}人目の子どもとして、{name}が生まれました。", "A child named {name} was born."],
    ["engine.job.started", "{job}として働きはじめました。月給は日本の物価に換算して約{monthYen}万円、1日あたりの所得は購買力平価で約{day}ドルでした。", "You began working as {jobPhrase}. Your monthly income was about US${month} at PPP, or US${day} per day."],
    ["engine.job.greeting", "仕事場で初めて会った人に「{greeting}」とあいさつしました。", "You greeted someone new at work with ‘{greeting}’."],
    ["engine.hobby.started", "{hobby}が好きになりました。", "You developed an interest in {hobby}."],
    ["engine.log.toy_action", "新しいおもちゃを手に取り、あれこれ試しました。", "You explored the new toy."],
    ["engine.log.marry", "{name}と結婚しました。", "You married {name}."],
    ["engine.log.marry_wait", "{name}との結婚は見送ることにしました。", "You decided to wait before marrying {name}."],
    ["engine.log.pet_adopt", "{animal}を家族に迎えました。", "You welcomed a {animal} into your family."],
    ["engine.log.pet_pass", "{animal}は、別の家にもらわれていきました。", "The {animal} went to another home."],
    ["engine.log.move_success", "{place}に移り住み、働きはじめました。", "You moved to {place} and started working."],
    ["engine.log.move_fail", "{place}へ渡ろうとしましたが、かないませんでした。", "You tried to move to {place}, but it did not work out."],
    ["engine.log.care_parent", "{parent}を引き取り、そばで世話をしました。", "You brought your {parent} home and cared for them."],
    ["engine.log.care_siblings", "{parent}の世話はきょうだいに任せ、仕送りをしました。", "Your siblings cared for your {parent} while you sent money."],
    ["engine.log.parent_death", "{parent}が亡くなりました。{age}歳でした。", "Your {parent} died at age {age}."],
    ["engine.log.temperament", "5歳になるころ、まわりの大人は{name}のことを「{temperament}」と話すようになりました。", "By age five, people around {name} described them as {temperament}."],
    ["engine.log.fifth_birthday", "5歳の誕生日を迎えました。生まれた年の{country}の5歳未満死亡率は{rate}％でした。", "You turned five. The under-five mortality rate in {country} in your birth year was {rate}%."],
    ["engine.log.retired", "{job}の仕事から退きました。", "You retired from your work as {jobPhrase}."],
    ["engine.log.spouse_death", "{name}が先に旅立ちました。{age}歳でした。", "{name} died before you at age {age}."],
    ["engine.log.child_death", "{name}が幼くして亡くなりました。", "{name} died young."],
    ["engine.log.child_school", "{name}が学校に通いはじめました。", "{name} started school."],
    ["engine.log.child_married", "{name}が結婚し、新しい家庭を持ちました。", "{name} married and started a family."],
    ["engine.log.child_talk", "{name}と、これからのことを夜遅くまで語り合いました。", "You and {name} talked late into the night about the future."],
    ["engine.log.child_learned", "{name}が新しく覚えたことを話してくれました。", "{name} told you about something new they had learned."],
    ["engine.log.child_school_talk", "{name}のことで学校に呼ばれ、帰り道に長く話しました。", "After a call from {name}'s school, you talked together on the way home."],
    ["engine.log.child_shopping", "{name}と買い物に出かけました。", "You went shopping with {name}."],
    ["engine.log.disaster_gentle", "{disaster}に見舞われ、暮らしが乱れました。", "{disaster} disrupted daily life."],
    ["engine.log.disaster_damage", "{disaster}に見舞われ、家や持ちものに被害が出ました。", "{disaster} damaged your home or belongings."],
    ["engine.log.sale", "返済のため、{item}を売りました。", "You sold {item} to repay debt."],
    ["engine.log.upkeep", "{item}の維持費を払えず、手放しました。", "You could not afford the upkeep on {item} and gave it up."],
    ["engine.log.displaced_abroad", "安全を求めて家族と{place}へ移り、暮らしを始めました。", "Seeking safety, your family moved to {place} and started over."],
    ["engine.money.gamble_win", "ひと勝負のもうけ", "Winnings from a gamble"],
    ["engine.money.gamble_loss", "ひと勝負の損", "Loss from a gamble"],
    ["engine.money.travel_cost", "渡航の費用", "Travel costs"],
    ["engine.money.parent_care", "親の世話", "Care for a parent"],
    ["engine.money.remittance", "仕送り", "Money sent to family"],
    ["engine.money.study_away", "遠くで学ぶ準備", "Preparation to study away from home"],
    ["engine.money.hospital", "病院での治療", "Hospital treatment"],
    ["engine.money.clinic", "診療所での治療", "Clinic treatment"],
    ["engine.money.home", "住まいの費用", "Housing costs"],
    ["engine.money.home_repair", "住まいの修繕", "Home repairs"],
    ["engine.money.business_seed", "商売の元手", "Capital to start a business"],
    ["engine.money.business_shared", "共同の元手", "Shared business capital"],
    ["engine.money.evacuation", "避難の費用", "Evacuation costs"],
    ["engine.money.friend_loan", "友人に貸したお金", "Loan to a friend"],
    ["engine.money.friend_help", "友人への援助", "Help for a friend"],
    ["engine.money.night_school", "夜学の費用", "Evening class fees"],
    ["engine.money.child_school", "子どもの進学", "Child's education"],
    ["engine.money.house_maintenance", "家の手入れ", "Home maintenance"],
    ["engine.money.supported_housing", "支援のある住まい", "Housing with support"],
    ["engine.money.return_trip", "帰省の交通費", "Travel to hometown"],
    ["engine.money.health", "体のための出費", "Health expenses"],
    ["engine.money.disaster_recovery", "災害後の暮らし", "Life after a disaster"],
    ["engine.money.business_balance", "小さな商売の収支", "Small business income"],
    ["engine.money.earnings_saved", "稼ぎから残したお金", "Money saved from earnings"],
    ["engine.money.children_support", "子どもからの仕送り", "Support from adult children"],
    ["engine.money.family_repayment", "家族と分担した返済", "Repayment shared with family"],
    ["engine.money.loan_interest", "借入の利息", "Loan interest"],
    ["engine.money.loan_repayment", "稼ぎから返したお金", "Loan repayment from earnings"],
    ["engine.money.loan_reschedule", "返済条件の見直し", "Revised repayment terms"],
    ["engine.money.cash_interest", "手元のお金の利子", "Interest on cash"],
    ["engine.money.debt_relief", "返済不能分の整理", "Debt relief"],
    ["engine.money.item_care", "{item}の世話", "Care for a {item}"],
    ["engine.money.disaster_damage", "{disaster}の被害", "Damage from {disaster}"],
    ["engine.money.item_sale", "{item}の売却", "Sale of {item}"],
    ["engine.money.item_upkeep", "{item}の維持費", "Upkeep of {item}"],
    ["engine.money.investment_return", "{item}の運用", "Return on {item}"],
    ["engine.transport.walk", "徒歩", "Walking"],
    ["engine.transport.bus", "乗り合いバス", "Shared bus"],
    ["engine.transport.bike", "自転車", "Bicycle"],
    ["engine.transport.motorbike", "バイク", "Motorcycle"],
    ["engine.transport.car", "車", "Car"],
    ["engine.course.unregistered", "出生の届け出がまだ済んでいません。後に書類が必要になるかもしれません。", "Your birth has not yet been registered. Documents may be needed later."],
    ["engine.course.slum", "家族は都市の非正規な居住地区で暮らし、公共サービスの利用に苦労することがありました。", "Your family lives in an informal urban settlement, where access to public services can be difficult."],
    ["engine.course.slum_services", "{year}年、住まいの地域では水や交通などの公共サービスを使いにくい日がありました。", "In {year}, access to water or transport in your neighborhood was difficult on some days."],
    ["engine.course.move_papers", "渡航に必要な書類をそろえられませんでした。", "You could not obtain the documents needed for travel."],
    ["engine.course.maternal_gentle", "出産後の合併症で、家族と別れることになりました。", "After complications following birth, your family had to say goodbye."],
    ["engine.course.maternal", "出産に伴う合併症で亡くなりました。", "You died from complications related to childbirth."],
    ["engine.course.maternal_cause", "妊娠・出産にともなう合併症", "complications of pregnancy and childbirth"],
    ["engine.course.informal_work", "契約書のない仕事で、毎月の収入が一定ではありません。", "Your work has no written contract, and income varies from month to month."],
    ["engine.course.job_papers", "必要な書類がなく、就ける仕事が少なくなりました。", "Without the required documents, your job options were limited."],
    ["engine.course.primary_unfinished", "何年も通いましたが、初等教育を修了できませんでした。次の学校への道が閉じました。", "You attended for years but did not complete primary school. The route to the next school closed."],
    ["engine.course.pension", "高齢期の給付を受け始めました。", "You began receiving support in old age."],
    ["engine.income.employerLarge", "規模の大きい勤め先で、同じ職種でも賃金が高めでした。", "A larger employer paid more for the same kind of work."],
    ["engine.income.employerSmall", "小さな勤め先で、同じ職種でも賃金は控えめでした。", "A smaller employer paid less for the same kind of work."],
    ["engine.income.skilled", "身につけた技能が、同じ職種の賃金にも表れました。", "Their skills helped lift pay within the occupation."],
    ["engine.income.learning", "仕事を覚える途中で、賃金はまだ低めでした。", "Pay was still modest while learning the work."],
    ["engine.income.urbanWage", "都市の求人で、地域の賃金水準が高めでした。", "City jobs tended to pay more in this area."],
    ["engine.income.ruralWage", "地方の求人で、地域の賃金水準は低めでした。", "Local rural jobs tended to pay less."],
    ["engine.income.informalGap", "契約のない仕事では、同じ職種でも賃金が低めでした。", "Without a formal contract, pay was lower even in the same occupation."],
    ["engine.income.femaleGap", "女性の就業機会が限られる環境で、賃金にも差がありました。", "Limited opportunities for women were reflected in pay."],
    ["engine.income.harvestGood", "収穫に恵まれ、この年の稼ぎが増えました。", "A good harvest raised this year's earnings."],
    ["engine.income.harvestBad", "収穫が振るわず、この年の稼ぎが減りました。", "A poor harvest reduced this year's earnings."],
    ["engine.income.pieceGood", "出来高のよい仕事が続き、稼ぎが増えました。", "Better piece rates raised earnings."],
    ["engine.income.pieceBad", "出来高のよい仕事が少なく、稼ぎが減りました。", "Fewer well-paid pieces reduced earnings."],
    ["engine.income.daysLost", "日雇いの仕事がない日が続きました。", "There were fewer days of paid work."],
    ["engine.income.migrantSeason", "出稼ぎの繁忙期に仕事が増えました。", "Seasonal migrant work brought extra pay."],
    ["engine.income.tips", "客からの心付けが、いつもより多い年でした。", "Tips were better than usual this year."],
    ["engine.income.overtime", "残業が増え、手取りが少し増えました。", "Overtime added a little to pay."],
    ["engine.income.bonus", "勤め先から賞与を受け取りました。", "The employer paid a bonus."],
    ["engine.income.experience", "経験を重ね、基本の賃金が少し上がりました。", "Experience brought a small rise in base pay."],
    ["engine.income.lateCareer", "年齢とともに、働ける時間や賃金の伸びが鈍りました。", "Later in life, working hours and pay growth slowed."],
    ["engine.income.promotion", "昇進して、基本の賃金が上がりました。", "A promotion raised base pay."],
    ["engine.income.demotion", "役割が変わり、賃金が下がりました。", "A change in role reduced pay."],
    ["engine.income.arrears", "賃金の一部が期日どおり支払われませんでした。", "Part of the wages went unpaid on time."],
    ["engine.income.unpaid", "働いた分の賃金が一部支払われませんでした。", "Some pay for work already done was never received."],
    ["engine.income.arrearsPaid", "遅れていた賃金が支払われました。", "Overdue wages finally arrived."],
    ["engine.income.strike", "職場のストライキで、働ける日が減りました。", "A workplace strike reduced paid days."],
    ["engine.income.inflation", "物価の上昇に賃金が追いつかず、実質収入が減りました。", "Pay did not keep up with prices, reducing real income."],
    ["engine.income.conflict", "紛争で仕事や取引が滞り、稼ぎが減りました。", "Conflict disrupted work and trade, reducing earnings."],
    ["engine.income.crisis", "経済危機で、この年の賃金が下がりました。", "An economic crisis reduced this year's pay."],
    ["engine.income.sideBusiness", "本業のほかに、小さな商売から収入がありました。", "A small business brought in income alongside the main job."],
    ["engine.income.sideWork", "本業のほかに、単発の仕事でも稼ぎました。", "Short jobs brought in extra income."],
    ["engine.income.remittanceReceived", "離れて暮らす家族から仕送りを受け取りました。", "Money arrived from family living away."],
    ["engine.income.remittanceSent", "離れて暮らす家族へ仕送りをしました。", "Money was sent to family living away."],
    ["engine.income.remittanceSentLabel", "家族への仕送り", "Remittance sent to family"],
    ["engine.income.transfer", "暮らしを支える公的な給付を受けました。", "A public benefit helped support everyday living."],
    ["engine.income.oldAgeSupport", "高齢期には年金がなく、公的な給付で生活費を補いました。", "Without a pension in old age, a support benefit helped cover living costs."],
    ["engine.income.rent", "貸している家や土地から家賃が入りました。", "A rented property brought in rent."],
    ["engine.income.rentLabel", "家賃収入", "Rental income"],
    ["engine.income.dividendInterest", "配当や利子などの資産収入がありました。", "Dividends, interest, or other asset returns brought income."],
    ["engine.course.no_pension", "高齢期を支える公的な給付は受けられず、家計をやりくりしました。", "Without public support in old age, you adjusted your household budget."],
    ["engine.course.food_gentle", "{year}年は食べものが十分でなく、家族で食事を工夫しました。", "In {year}, food was limited, so your family adjusted its meals."],
    ["engine.course.food", "{year}年は食料が足りず、食事の量を減らす日が続きました。", "In {year}, food was scarce and you had to eat smaller meals for a while."],
    ["engine.course.food_prose.first_child", "{year}年、食料が足りず、家族は食事を少しずつ分けました。", "In {year}, food ran short and your family divided each meal carefully."],
    ["engine.course.food_prose.first_adult", "{year}年、食料が足りず、買い物と食卓の品数を減らしました。", "In {year}, food supplies tightened, so you bought less and served simpler meals."],
    ["engine.course.food_prose.first_old", "{year}年、食料が足りず、蓄えていた食材を少しずつ使いました。", "In {year}, food ran short and you stretched what you had stored."],
    ["engine.course.food_prose.urban", "{year}年、再び食料が足りなくなり、店で買える品を家族で分けました。", "In {year}, another shortage meant sharing the few foods available in nearby shops."],
    ["engine.course.food_prose.rural", "{year}年、再び食料が足りなくなり、家に残る穀物を家族で分けました。", "In {year}, another shortage meant dividing the grain left at home."],
    ["engine.course.food_prose.disaster", "{year}年、災害のあと食料が足りず、家族で残る食材を分けました。", "In {year}, food ran short after the disaster and your family shared what remained."],
    ["engine.course.food_prose.gentle", "{year}年、食べものが十分でなく、家族で献立を工夫しました。", "In {year}, food was limited, so your family adjusted its meals."],
    ["engine.course.law", "{year}年、賃金をめぐる争いを相談しましたが、解決まで長くかかりました。", "In {year}, you sought help over a wage dispute, but a resolution took a long time."],
    ["engine.course.voice", "{year}年、地域の新聞が休刊し、人々は情報を確かめながら意見を交わしました。", "In {year}, a local newspaper closed, and people checked information carefully as they shared their views."],
    ["engine.course.stability", "{year}年、抗議や移動制限で学校や仕事の予定が変わりました。", "In {year}, protests or movement restrictions changed plans for school or work."],
    ["engine.violence.domestic", "同居する相手から家庭内で暴力を受けました。けがで通院し、家で安心して眠れなくなりました。", "A partner at home was violent toward you. You needed medical care and no longer felt safe sleeping there."],
    ["engine.violence.assault", "帰宅中に見知らぬ人から暴行を受けました。けがで通院し、同じ道を通れなくなりました。", "A stranger assaulted you on your way home. You needed medical care and avoided that route afterward."],
    ["engine.violence.robbery", "帰り道で強盗に遭い、持ち金を奪われました。帰宅後も手の震えが止まりませんでした。", "You were robbed on the way home and lost the money you carried. Your hands still shook afterward."],
    ["engine.violence.police", "警察官から暴力を受けました。治療を受け、通行のたびに身構えるようになりました。", "A police officer assaulted you. You needed treatment and felt afraid when passing officers."],
    ["engine.violence.conflict", "紛争中、近くで兵士の暴力を受けました。けがの治療と避難先探しが続きました。", "During the conflict, a soldier assaulted you. Treatment and the search for a safe place continued."],
    ["engine.violence.support", "ひとりで抱えずに、身近な人や相談窓口に話してください。", "You do not have to face this alone. Tell someone you trust or contact a support service."],
    ["engine.violence.loss.robbery", "強盗で失った持ち金", "Money lost in the robbery"],
    ["engine.violence.loss.care", "暴力被害後の治療費", "Treatment after violence"],
    ["engine.violence.after.domestic.1", "翌年も家庭内の暴力の記憶で眠れない夜があり、通院を続けました。", "The next year, memories of violence at home kept you awake, and you continued treatment."],
    ["engine.violence.after.domestic.3", "家庭内の暴力から3年たっても、家の中で物音に身構えました。", "Three years later, sounds at home still made you tense."],
    ["engine.violence.after.domestic.5", "家庭内の暴力から5年後も、安心して眠れる場所を探しました。", "Five years later, you were still looking for a place where you could sleep safely."],
    ["engine.violence.after.assault.1", "翌年も暴行のけがで通院し、帰り道を遠回りしました。", "The next year, you still needed care for your injury and took a longer route home."],
    ["engine.violence.after.assault.3", "暴行から3年後も、ひとりで帰る夜には足が止まりました。", "Three years after the assault, walking home alone at night could still stop you in your tracks."],
    ["engine.violence.after.assault.5", "暴行から5年後も、痛みで予定を変える日がありました。", "Five years later, pain still made you change your plans on some days."],
    ["engine.violence.after.robbery.1", "翌年も強盗で失ったお金を思い出し、支出に慎重になりました。", "The next year, remembering the stolen money made you cautious about spending."],
    ["engine.violence.after.robbery.3", "強盗から3年後も、帰り道を変える習慣が残りました。", "Three years after the robbery, you still took another route home."],
    ["engine.violence.after.robbery.5", "強盗から5年後も、同じ道を通るとあの日の恐怖が戻りました。", "Five years later, taking the same route could bring back the fear of that day."],
    ["engine.violence.after.police.1", "翌年も警察官から受けた暴力によるけがで通院しました。", "The next year, you still needed treatment for injuries caused by the officer."],
    ["engine.violence.after.police.3", "3年後も制服を見かけると、あの日の恐怖が戻りました。", "Three years later, a uniform could still bring back the fear of that day."],
    ["engine.violence.after.police.5", "5年後も制服の人に声をかけられると、体がこわばりました。", "Five years later, being addressed by someone in uniform still made your body tense."],
    ["engine.violence.after.conflict.1", "翌年も紛争で受けたけがの治療を続けました。", "The next year, you still needed care for injuries from the conflict."],
    ["engine.violence.after.conflict.3", "紛争の暴力から3年後も、眠りが浅くなりました。", "Three years after the violence, your sleep was still light."],
    ["engine.violence.after.conflict.5", "紛争の暴力から5年後も、大きな物音に身構えました。", "Five years later, a loud noise still made you brace yourself."],
    ["engine.history.conflict_gentle", "地域の不安定な状況が続き、家族で安全な道を確かめました。", "Unrest continued nearby, and your family checked which routes were safe."],
    ["engine.history.conflict", "地域で紛争が続き、通学や買い物の道がふさがれました。家族は毎朝、安全を確かめました。", "The conflict continued nearby. Routes to school and shops were blocked, and your family checked each morning for a safe way through."],
    ["engine.loss.mother", "母が亡くなりました。{name}は{age}歳でした。声を聞けない朝が続きました。", "Your mother, {name}, died at {age}. Each morning began without her voice."],
    ["engine.loss.father", "父が亡くなりました。{name}は{age}歳でした。いつもの場所に姿がなくなりました。", "Your father, {name}, died at {age}. His familiar place was empty."],
    ["engine.loss.spouse", "伴侶の{name}が先に旅立ちました。{age}歳で亡くなり、二人分の食卓を片づける日が続きました。", "Your partner, {name}, died at {age}. You kept setting and clearing the table without them."],
    ["engine.loss.child", "子の{name}が幼くして亡くなりました。{age}歳でした。小さな服をしまえないまま、季節が変わりました。", "Your child, {name}, died at {age}. The seasons changed before you could put away their small clothes."],
    ["engine.milestone.5", "5歳になりました。同じ年にこの国で生まれた子の{oneIn}人に1人は、推計でもう生きていません。あなたは今日を迎えました。", "You turned five. Among children born in this country in the same year, an estimated one in {oneIn} had already died. You reached this day."],
    ["engine.milestone.15.out", "15歳になりました。通学する同い年の子を見送り、自分の一日には授業がありませんでした。家の事情は努力だけでは変わりませんでした。", "You turned 15. You watched children your age go to school while your day had no lessons. Effort alone could not change your household's circumstances."],
    ["engine.milestone.15.school", "15歳になりました。学んだことは増えましたが、進級できるかは家計と学校の事情にもかかっていました。", "You turned 15. You had learned more, but moving to the next year of school also depended on money and the school itself."],
    ["engine.milestone.30.work", "30歳になりました。仕事を続けてきましたが、病気や家族の事情で休んだ日も賃金には戻りませんでした。", "You turned 30. You had kept working, but days lost to illness or family needs never returned as wages."],
    ["engine.milestone.30.no_work", "30歳になりました。働き口を探した時間は、収入にも職歴にも数えられませんでした。", "You turned 30. The time spent looking for work counted neither as pay nor as experience."],
    ["engine.milestone.50.debt", "50歳になりました。働いた年月を重ねても借入が残り、返済が次の月の選択を狭めました。", "You turned 50. Years of work had not cleared the debt, and repayments narrowed each month's choices."],
    ["engine.milestone.50.health", "50歳になりました。健康を保てた日もあれば、体調に合わせて予定を変えた日もありました。", "You turned 50. Some days your health held; on others, you had to change plans around it."],
    ["engine.milestone.70.child", "70歳になりました。先に亡くした子の年齢を今も数えました。祝いの日にも、あの子の席は空いたままでした。", "You turned 70. You still counted the years your child would have lived. Their place stayed empty even on days of celebration."],
    ["engine.milestone.70.parents", "70歳になりました。親に話したかったことが残っています。体の衰えで、遠くへ出かける日も減りました。", "You turned 70. There were still things you wished you had told your parent. Failing strength made long trips less frequent."],
    ["engine.milestone.70.living", "70歳になりました。できることが少しずつ減り、手伝ってもらう日の重みを知りました。", "You turned 70. As some things became harder, you came to know the weight of days when someone helped."],
    ["engine.milestone.70.cohort", "同じ年にこの国で生まれた100人のうち、70歳を迎えるのは推計{count}人でした。", "Of 100 people born in this country in the same year, an estimated {count} reached age 70."],
    ["engine.death.child_story", "短い生涯でした。家族には、成長を見届けられなかった時間が残りました。", "Your life was short. Your family was left with years of growing up they would never see."],
    ["engine.death.family_story", "子ども{count}人は、あなたを見送ったあとも、それぞれの人生を歩みました。", "Your {count} surviving children went on into years without you."],
    ["engine.death.debt_story", "借金を残し、果たせない約束もありました。", "Debt remained after your death, along with promises you could not keep."],
    ["engine.death.story", "見慣れた場所からあなたの姿が消えました。一緒に過ごした時間は、家族や友人の胸に残りました。", "After your death, you were absent from familiar places. The time you shared with others remained."],
    ["engine.death.safe_cause", "外傷", "an injury"],
    ["engine.death.cohort", "この国で生まれた人の平均寿命は推計{expected}歳でした。あなたは{age}歳まで生きました。", "Life expectancy at birth in this country was an estimated {expected} years. You lived {age} years."],
    ["engine.death.cohort_one", "この国で生まれた人の平均寿命は推計{expected}歳でした。あなたは{age}歳まで生きました。", "Life expectancy at birth in this country was an estimated {expected} years. You lived one year."],
    ["engine.course.fee_title", "書類の手続き", "Document application"],
    ["engine.course.fee_body", "必要な書類の手続きで、窓口から非公式な支払いを求められました。", "While applying for a needed document, an official asked for an unofficial payment."],
    ["engine.course.fee_note", "支払うかどうかで、手続きの結果と家計が変わります。", "Your choice affects the application and your household budget."],
    ["engine.course.fee_pay", "支払って手続きを進める", "Pay and continue the application"],
    ["engine.course.fee_decline", "支払わず正式な手続きを求める", "Decline and request the official process"],
    ["engine.course.fee_cost", "書類の手続き費", "Document application payment"],
    ["engine.course.fee_paid", "支払いのあと、必要な書類を受け取れました。", "After paying, you received the document."],
    ["engine.course.fee_resolved", "時間はかかりましたが、正式な手続きで書類を受け取れました。", "It took time, but the official process provided the document."],
    ["engine.course.fee_delayed", "書類の発行が遅れ、別の機会に手続きを試すことにしました。", "The document was delayed, so you decided to try again later."],
    ["engine.reference.historical_source", "歴史的事実", "Historical records"],
    ["engine.reference.script_year", "{year}年に記録された出来事です。", "This event was recorded in {year}."],
    ["engine.reference.script_since", "この制度は{year}年以降の出来事として記録されています。", "This institution is recorded as operating from {year} onward."],
    ["engine.reference.birth_registration", "この国の出生登録率は{rate}％です。", "The birth registration rate in this country is {rate}%."],
    ["engine.reference.slum", "この国の都市人口の{rate}％がスラム地区に暮らします。", "{rate}% of this country's urban population lives in slum areas."],
    ["engine.reference.birth_population", "この年のこの国の人口は推計約{count}人です。", "This country's population that year was estimated at about {count} people."],
    ["engine.reference.vaccination", "この年のDTP3接種率は{dtp3}％、はしか接種率は{measles}％です。", "That year's DTP3 vaccination coverage was {dtp3}%, and measles coverage was {measles}%."],
    ["engine.reference.same_sex_criminalized", "この国では同性間の関係が法律で禁じられています。", "Same-sex relations were prohibited by law in this country."],
    ["engine.reference.conscription", "この国の兵役期間は約{years}年です。", "Compulsory military service lasts about {years} years in this country."],
    ["engine.reference.conscription_one", "この国の兵役期間は約{years}年です。", "Compulsory military service lasts about one year in this country."],
    ["engine.reference.primary_completion", "この国の初等教育修了率は{rate}％です。", "The primary education completion rate in this country is {rate}%."],
    ["engine.reference.secondary_completion", "この国の前期中等教育修了率は{rate}％です。", "The lower secondary education completion rate in this country is {rate}%."],
    ["engine.reference.tertiary_enrollment", "この国の高等教育就学率は{rate}％です。", "The tertiary education enrollment rate in this country is {rate}%."],
    ["engine.reference.electricity_access", "この国で電気を利用できる人は{rate}％です。", "{rate}% of people in this country have access to electricity."],
    ["engine.reference.water_access", "この国で基本的な飲み水を利用できる人は{rate}％です。", "{rate}% of people in this country have access to basic drinking water."],
    ["engine.reference.child_labour", "この国で働く子どもの割合は{rate}％です。", "The child labour rate in this country is {rate}%."],
    ["engine.reference.sanitation_access", "この国で安全な衛生設備を利用できる人は{rate}％です。", "{rate}% of people in this country have access to safe sanitation."],
    ["engine.reference.literacy", "この国の識字率は{rate}％です。", "The literacy rate in this country is {rate}%."],
    ["engine.reference.under_five", "この国では、5歳までに亡くなる子どもは約{oneIn}人に1人です。", "About 1 in {oneIn} children in this country die before age five."],
    ["engine.reference.under_five_rate", "この国の5歳未満死亡率は{rate}％です。", "The under-five mortality rate in this country is {rate}%."],
    ["engine.reference.survival_70", "この国で同じ年に生まれた100人のうち、推計{count}人が70歳を迎えます。", "An estimated {count} of 100 people born in the same year in this country reach age 70."],
    ["engine.reference.covid_stringency", "2020年の政策厳格度指数の最大値は{rate}／100でした。", "The maximum policy stringency index in 2020 was {rate} out of 100."],
    ["engine.reference.covid_average", "2020年の政策厳格度指数の平均値は{rate}／100でした。", "The average policy stringency index in 2020 was {rate} out of 100."],
    ["engine.reference.food_insecurity", "この国で食料不安を経験する人は{rate}％です。", "{rate}% of people in this country experience food insecurity."],
    ["engine.reference.undernourishment", "この国で栄養不足の人は{rate}％です。", "{rate}% of people in this country are undernourished."],
    ["engine.reference.rule_of_law", "この国の法の支配の推計値は{score}です。", "This country's estimated rule-of-law score is {score}."],
    ["engine.reference.voice", "この国の発言・説明責任の推計値は{score}です。", "This country's estimated voice and accountability score is {score}."],
    ["engine.reference.stability", "この国の政治的安定の推計値は{score}です。", "This country's estimated political stability score is {score}."],
    ["engine.reference.conflict", "{year}年、この国の紛争死者は人口10万人あたり{rate}人でした。", "In {year}, conflict killed {rate} people per 100,000 residents in this country."],
    ["engine.reference.refugees", "{year}年、この国からの難民は{count}人と記録されています。", "In {year}, {count} refugees from this country were recorded."],
    ["engine.reference.historical_event", "{year}年に記録された出来事です：{event}", "Recorded event in {year}: {event}"],
    ["engine.reference.out_of_school", "この国の小学校年齢の不就学率は{rate}％です。", "The out-of-school rate for primary-school-age children in this country is {rate}%."],
    ["engine.reference.pension_age", "この国の法定退職年齢は{age}歳です。", "The statutory retirement age in this country is {age}."],
    ["engine.reference.pension_coverage", "この国で年金などの高齢期給付を受ける人は{rate}％です。", "{rate}% of older people in this country receive a pension or other old-age benefit."],
    ["engine.reference.child_marriage", "この国で18歳前に結婚した女性は{rate}％です。", "{rate}% of women in this country married before age 18."],
    ["engine.reference.inflation", "{year}年の消費者物価上昇率は{rate}％でした。", "Consumer prices rose {rate}% in {year}."],
    ["engine.reference.isco_wage", "この国の職業グループの賃金比率は全職種平均の{rate}倍です。", "This occupation group's wage ratio is {rate} times the national occupational average."],
    ["engine.reference.remittances", "この国への海外送金はGDPの{rate}％です。", "Remittances to this country equal {rate}% of GDP."],
    ["engine.reference.informal_employment", "この国で非公式に働く人は{rate}％です。", "{rate}% of workers in this country have informal employment."],
    ["engine.reference.female_participation", "この国の女性の労働力参加率は{rate}％です。", "Women's labour force participation in this country is {rate}%."],
    ["engine.reference.cause_share", "この国の同じ性別・年齢層の死亡のうち、この死因は{rate}％を占めます。", "This cause accounts for {rate}% of deaths in the same sex and age group in this country."],
    ["engine.reference.life_expectancy", "この国で生まれた人の平均寿命は推計{years}歳です。", "Estimated life expectancy at birth in this country is {years} years."],
    ["engine.reference.maternal_mortality", "この国の妊産婦死亡比は出生10万件あたり{rate}人です。", "The maternal mortality ratio in this country is {rate} per 100,000 live births."],
    ["engine.reference.same_sex_marriage", "この国で同性婚が法的に認められたのは{year}年です。", "Same-sex marriage became legal in this country in {year}."],
    ["engine.reference.partner_violence", "この地域で親密な相手から暴力を経験した女性は約{rate}％です。", "About {rate}% of women in this area have experienced intimate-partner violence."],
    ["engine.reference.homicide", "この国の殺人死亡率は人口10万人あたり{rate}人です。", "The homicide death rate in this country is {rate} per 100,000 people."],
    ["engine.reference.road_deaths", "この国の交通事故死は人口10万人あたり{rate}人です。", "Road traffic deaths in this country are {rate} per 100,000 people."],
    ["engine.reference.hiv_prevalence", "この国のHIV有病率は{rate}％です。", "HIV prevalence in this country is {rate}%."],
    ["engine.reference.annual_mortality", "{age}歳の年間死亡確率は生命表で約{rate}％です。", "The life table estimates a {rate}% annual mortality probability at age {age}." ]
  ];
  [
    ["engine.dream.doctor", "医師", "doctor"], ["engine.dream.teacher", "教師", "teacher"],
    ["engine.dream.nurse", "看護師", "nurse"], ["engine.dream.engineer", "技術者", "engineer"],
    ["engine.dream.lawyer", "弁護士", "lawyer"], ["engine.dream.artist", "芸術家・音楽家", "artist or musician"],
    ["engine.dream.athlete", "選手", "athlete"], ["engine.dream.scientist", "研究者", "scientist"],
    ["engine.dream.business_owner", "事業主", "business owner"], ["engine.dream.farmer_own_land", "自分の土地で農業", "farmer on your own land"],
    ["engine.dream.study_abroad", "海外で学ぶ", "study abroad"], ["engine.dream.move_to_city", "都市へ移る", "move to a city"],
    ["engine.dream.help_family", "家族を支える", "support your family"], ["engine.dream.travel_world", "世界を旅する", "travel the world"],
    ["engine.dream.have_family", "家庭を持つ", "have a family"], ["engine.dream.public_service", "公共の仕事", "public service"],
    ["engine.dream.religious_life", "信仰に関わる生活", "a life of faith"], ["engine.dream.craftsperson", "職人", "craftsperson"],
    ["engine.dream.pilot", "操縦士", "pilot"], ["engine.dream.journalist", "記者", "journalist"],
    ["engine.dream.set", "「{dream}」を将来の夢にしました。", "You began dreaming of becoming {dream}."],
    ["engine.dream.achieved", "長い道のりの末、「{dream}」という夢をかなえました。", "After a long journey, you reached your dream of becoming {dream}."],
    ["engine.dream.stage.none", "まだ夢は決まっていません。", "You have not chosen a dream yet."],
    ["engine.dream.stage.start", "道を探しています。", "You are looking for a path."],
    ["engine.dream.stage.progress", "少しずつ進んでいます。", "You are making progress."],
    ["engine.dream.stage.near", "夢に近づいています。", "You are getting closer to your dream."],
    ["engine.dream.stage.achieved", "夢をかなえました。", "You reached your dream."],
    ["engine.obstacle.household", "家計が苦しく、今は費用を出せませんでした。", "The household could not cover the cost at this time."],
    ["engine.obstacle.care_work", "家の仕事や弟妹の世話に時間が必要でした。", "Household work or caring for younger siblings needed your time."],
    ["engine.obstacle.distance", "近くに通える学校や施設がありませんでした。", "There was no school or service you could reach nearby."],
    ["engine.obstacle.fees", "学費や制服、教材の費用を用意できませんでした。", "Tuition, uniforms, or materials were beyond the household budget."],
    ["engine.obstacle.family_permission", "親族の理解が得られず、今回は進めませんでした。", "Relatives did not support the plan this time."],
    ["engine.obstacle.early_marriage", "若い時期の結婚で、学びに使える時間が減りました。", "Marriage at a young age left less time for learning."],
    ["engine.obstacle.illness", "病気やけがのため、今回は続けられませんでした。", "Illness or injury interrupted your plans."],
    ["engine.obstacle.conflict", "治安の悪化で学校や施設が一時閉まりました。", "Insecurity temporarily closed a school or service."],
    ["engine.obstacle.disaster", "災害の影響で、計画を延期しました。", "A disaster delayed the plan."],
    ["engine.obstacle.documents", "出生登録など必要な書類がそろいませんでした。", "Required records, such as birth registration, were missing."],
    ["engine.obstacle.bias", "選考で偏見や不公平な扱いに直面しました。", "You faced bias or unfair treatment in selection."],
    ["engine.obstacle.exam", "試験に届かず、今回は進めませんでした。", "You did not pass the exam this time."],
    ["engine.obstacle.connections", "推薦してくれる人や仕事のつながりが見つかりませんでした。", "You could not find a recommendation or work connection."],
    ["engine.obstacle.jobs", "希望する働き口が見つかりませんでした。", "The work you sought was unavailable."],
    ["engine.obstacle.migration_papers", "移動に必要な書類を取得できませんでした。", "You could not obtain the required travel documents."],
    ["engine.obstacle.elder_care", "介護が必要な家族を支える時間が必要でした。", "A family member needing care depended on your time."],
    ["engine.choice.ask_school", "学校に通い続けたいと頼む", "Ask to keep attending school"],
    ["engine.choice.scholarship", "奨学金に応募する", "Apply for a scholarship"],
    ["engine.choice.night_school", "夜間学校に通う", "Attend night school"],
    ["engine.choice.move_city", "都市へ出る", "Move to a city"],
    ["engine.choice.apprenticeship", "弟子入りを頼む", "Seek an apprenticeship"],
    ["engine.choice.vocational", "職業訓練を受ける", "Take vocational training"],
    ["engine.choice.marry", "恋人と結婚したいと伝える", "Ask to marry your partner"],
    ["engine.choice.start_business", "起業する", "Start a business"],
    ["engine.choice.migrate", "移住を試みる", "Try to migrate"],
    ["engine.choice.family_discussion", "親族と将来について話し合う", "Discuss your future with relatives"],
    ["engine.choice.distant_hospital", "遠くの病院で治療を受ける", "Seek care at a distant hospital"],
    ["engine.choice.ngo_program", "地域の支援制度を探す", "Find a community support program"],
    ["engine.choice.relatives_help", "親族に助けを頼む", "Ask relatives for help"],
    ["engine.choice.save_money", "少しずつ貯金する", "Save money gradually"],
    ["engine.choice.sit_exam", "試験に挑む", "Take an entrance exam"],
    ["engine.choice.seek_recommendation", "推薦を頼む", "Seek a recommendation"],
    ["engine.choice.try_job", "仕事に応募する", "Apply for a job"],
    ["engine.choice.practice_craft", "技能を練習する", "Practice a craft"],
    ["engine.choice.success", "{action}に取り組み、道が開けました。", "You tried: {action}. An opportunity opened."],
    ["engine.choice.blocked", "{action}を試みましたが、{reason}", "You tried: {action}. {reason}"],
    ["engine.choice.no_money", "費用を用意できません。", "You could not cover the cost."],
    ["engine.choice.unavailable", "今年はこの行動を選べません。", "This action is unavailable this year."],
    ["engine.choice.cost", "挑戦の費用", "cost of the attempt"],
    ["engine.choice.chance.high", "高い", "High"],
    ["engine.choice.chance.medium", "ふつう", "Moderate"],
    ["engine.choice.chance.low", "低い", "Low"],
    ["engine.vax.full", "必要な予防接種を受けました。", "You received the recommended childhood vaccinations."],
    ["engine.vax.partial", "予防接種を一部受けました。", "You received some childhood vaccinations."],
    ["engine.vax.missed", "予防接種を受けられませんでした。", "You could not receive childhood vaccinations."],
    ["engine.vax.partial_detail", "予防接種を一部受けました。{reason}", "You received some childhood vaccinations. {reason}"],
    ["engine.vax.missed_detail", "予防接種を受けられませんでした。{reason}", "You could not receive childhood vaccinations. {reason}"],
    ["engine.vax.reason.distance", "接種場所が遠くにありました。", "The vaccination site was far away."],
    ["engine.vax.reason.cost", "移動や受診の費用を用意できませんでした。", "Travel or care costs were difficult to cover."],
    ["engine.vax.reason.supply", "必要なワクチンがその時はありませんでした。", "The vaccine was unavailable at the time."],
    ["engine.vax.reason.conflict", "地域の治安のため、接種場所に行けませんでした。", "Local insecurity prevented travel to the vaccination site."],
    ["engine.vax.reason.information", "接種の案内が家族に届きませんでした。", "Vaccination information did not reach the family."],
    ["engine.vax.reason.family", "家族で話し合い、今回は接種を見送りました。", "After discussing it, the family deferred vaccination."],
    ["engine.vax.death", "予防接種を受けられなかったことも、感染症への弱さに関わりました。", "Missing childhood vaccinations also increased vulnerability to infection."],
    ["engine.vax.cause.measles", "はしか", "measles"],
    ["engine.vax.cause.diphtheria", "ジフテリア・百日せき・破傷風", "diphtheria, pertussis, or tetanus"]
  ].forEach(function (row) { rows.push(row); });
  rows.push(["engine.country_small.food.0", "食卓に{food}が並び、ゆっくり味わいました。", "You took your time over {food} at the table."]);
  rows.push(["engine.country_small.food.1", "{food}を分け合い、会話が弾みました。", "You shared {food} and talked together."]);
  rows.push(["engine.country_small.food.2", "{food}の作り方を身近な人に聞きました。", "You asked someone close how to make {food}."]);
  rows.push(["engine.country_small.food.3", "久しぶりの{food}を楽しみました。", "You enjoyed having {food} again."]);
  rows.push(["engine.country_small.food.4", "{food}を一緒に用意しました。", "You helped prepare {food}."]);
  rows.push(["engine.country_small.food.5", "{food}の香りに足を止めました。", "The smell of {food} made you pause."]);
  rows.push(["engine.country_small.food.6", "家で{food}を食べ、ひと息つきました。", "You ate {food} at home and rested."]);
  rows.push(["engine.country_small.food.7", "{food}を少し残し、あとで食べました。", "You saved some {food} for later."]);
  rows.push(["engine.country_small.food.8", "{food}を作る手順を覚えました。", "You learned how to make {food}."]);
  rows.push(["engine.country_small.food.9", "{food}を囲んで近況を話しました。", "You caught up over {food}."]);
  rows.push(["engine.country_small.food.10", "{food}を食べ、家の味を思い出しました。", "Eating {food} reminded you of home."]);
  rows.push(["engine.country_small.food.11", "{food}を身近な人に勧めました。", "You recommended {food} to someone close."]);
  rows.push(["engine.country_small.festival.0", "{festival}の日、人々の声を聞きました。", "On {festival}, you heard voices around you."]);
  rows.push(["engine.country_small.festival.1", "{festival}に合わせて家の用事を済ませました。", "You finished chores ahead of {festival}."]);
  rows.push(["engine.country_small.festival.2", "{festival}の準備を少し手伝いました。", "You helped a little with preparations for {festival}."]);
  rows.push(["engine.country_small.festival.3", "{festival}の話を身近な人としました。", "You talked about {festival} with someone close."]);
  rows.push(["engine.country_small.festival.4", "{festival}の日、町の様子を眺めました。", "On {festival}, you watched the town around you."]);
  rows.push(["engine.country_small.festival.5", "{festival}を迎え、家族に声をかけました。", "You greeted family on {festival}."]);
  rows.push(["engine.country_small.festival.6", "{festival}の思い出を聞きました。", "You heard someone recall a past {festival}."]);
  rows.push(["engine.country_small.festival.7", "{festival}の日、友人と歩きました。", "You walked with a friend on {festival}."]);
  rows.push(["engine.country_small.festival.8", "{festival}をきっかけに知人と会いました。", "{festival} gave you a chance to see an acquaintance."]);
  rows.push(["engine.country_small.festival.9", "{festival}の朝、いつもより早く起きました。", "You rose earlier than usual on {festival}."]);
  rows.push(["engine.country_small.festival.10", "{festival}の話題で会話が弾みました。", "You enjoyed a conversation about {festival}."]);
  rows.push(["engine.country_small.festival.11", "{festival}の日、家でゆっくり過ごしました。", "You spent {festival} quietly at home."]);
  rows.push(["engine.country_small.sport.0", "{sport}の話を友人としました。", "You talked about {sport} with a friend."]);
  rows.push(["engine.country_small.sport.1", "{sport}の試合結果を聞きました。", "You heard a result in {sport}."]);
  rows.push(["engine.country_small.sport.2", "{sport}をする人たちを見守りました。", "You watched people playing {sport}."]);
  rows.push(["engine.country_small.sport.3", "{sport}の練習を見かけました。", "You came across people practicing {sport}."]);
  rows.push(["engine.country_small.sport.4", "{sport}の好きな人と知り合いました。", "You met someone who enjoyed {sport}."]);
  rows.push(["engine.country_small.sport.5", "{sport}の試合を身近な人と見ました。", "You watched {sport} with someone close."]);
  rows.push(["engine.country_small.sport.6", "{sport}について新しいことを覚えました。", "You learned something new about {sport}."]);
  rows.push(["engine.country_small.sport.7", "{sport}の話題で笑い合いました。", "A conversation about {sport} made you laugh."]);
  rows.push(["engine.country_small.sport.8", "{sport}を少し練習しました。", "You practiced {sport} for a while."]);
  rows.push(["engine.country_small.sport.9", "{sport}の道具を手入れしました。", "You looked after your {sport} equipment."]);
  rows.push(["engine.country_small.sport.10", "{sport}の試合で友人を応援しました。", "You cheered for a friend competing in {sport}."]);
  rows.push(["engine.country_small.sport.11", "{sport}を楽しむ時間を作りました。", "You made time to enjoy {sport}."]);
  rows.push(["engine.country_small.rain.0", "{month}月、雨音を聞いて休みました。", "In month {month}, you rested while listening to the rain."]);
  rows.push(["engine.country_small.rain.1", "{month}月、雨をよけて歩きました。", "In month {month}, you walked under cover from the rain."]);
  rows.push(["engine.country_small.rain.2", "{month}月、雨上がりの道を歩きました。", "In month {month}, you walked after the rain."]);
  rows.push(["engine.country_small.rain.3", "{month}月、雨具を乾かしました。", "In month {month}, you dried your rain gear."]);
  rows.push(["engine.country_small.heat.0", "{month}月、日陰を選んで歩きました。", "In month {month}, you walked in the shade."]);
  rows.push(["engine.country_small.heat.1", "{month}月、涼しい時間に外へ出ました。", "In month {month}, you went out during cooler hours."]);
  rows.push(["engine.country_small.heat.2", "{month}月、暑さを避けて休みました。", "In month {month}, you rested away from the heat."]);
  rows.push(["engine.country_small.heat.3", "{month}月、飲み水を用意して出かけました。", "In month {month}, you took water when you went out."]);
  rows.push(["engine.country_small.cold.0", "{month}月、上着を重ねて出かけました。", "In month {month}, you put on extra layers."]);
  rows.push(["engine.country_small.cold.1", "{month}月、冷えた手を温めました。", "In month {month}, you warmed your cold hands."]);
  rows.push(["engine.country_small.cold.2", "{month}月、暖かい場所で休みました。", "In month {month}, you rested somewhere warm."]);
  rows.push(["engine.country_small.cold.3", "{month}月、冷たい風を避けて歩きました。", "In month {month}, you walked out of the cold wind."]);
  rows.push(["engine.country_small.elec.0", "電気を使える夜、明かりの下で過ごしました。", "One evening, you spent time under the electric light."]);
  rows.push(["engine.country_small.elec.1", "家の明かりを消し、静かに休みました。", "You turned off the lights at home and rested."]);
  rows.push(["engine.country_small.water.0", "飲み水を用意し、家でひと息つきました。", "You set out drinking water and rested at home."]);
  rows.push(["engine.country_small.water.1", "水を大切に使い、食事を作りました。", "You used water carefully while making a meal."]);
  rows.push(["engine.country_small.sanit.0", "家の水回りを掃除しました。", "You cleaned the wash area at home."]);
  rows.push(["engine.country_small.sanit.1", "手洗いの水を用意しました。", "You set out water for washing your hands."]);
  rows.push(["engine.country_small.mobile.0", "携帯電話で身近な人と連絡を取りました。", "You contacted someone close on a mobile phone."]);
  rows.push(["engine.country_small.mobile.1", "電話で家族の近況を聞きました。", "You called family to hear their news."]);
  rows.push(["engine.country_small.lit.0", "読める文字を増やそうと練習しました。", "You practiced reading more words."]);
  rows.push(["engine.country_small.lit.1", "短い文章を読み、内容を話しました。", "You read a short passage and talked about it."]);
  rows.push(["engine.country_small.clean_fuel.0", "台所の換気を確かめて料理しました。", "You checked the kitchen ventilation before cooking."]);
  rows.push(["engine.country_small.clean_fuel.1", "火を使う前に窓を開けました。", "You opened a window before lighting the stove."]);
  rows.push(["engine.context_small.explore.0", "知らない道を歩き、帰り道を覚えました。", "You walked a new route and learned the way home."]);
  rows.push(["engine.context_small.explore.1", "初めての店に入り、品物を眺めました。", "You stepped into a new shop and looked around."]);
  rows.push(["engine.context_small.active.0", "用事を早めに済ませ、外へ出ました。", "You finished your errands early and went outside."]);
  rows.push(["engine.context_small.active.1", "少し遠くまで歩き、体を動かしました。", "You walked farther than usual to get moving."]);
  rows.push(["engine.context_small.social.0", "近所の人と近況を話しました。", "You caught up with a neighbor."]);
  rows.push(["engine.context_small.social.1", "友人に声をかけ、短い時間を共に過ごしました。", "You invited a friend to spend a little time together."]);
  rows.push(["engine.context_small.grit.0", "難しい作業を、休みながら終えました。", "You finished a difficult task with breaks."]);
  rows.push(["engine.context_small.grit.1", "できなかったことをもう一度試しました。", "You tried again at something you could not do before."]);
  rows.push(["engine.context_small.poor.0", "手元の材料を工夫して食事を作りました。", "You made a meal with the ingredients you had."]);
  rows.push(["engine.context_small.poor.1", "壊れた品を直し、もう少し使いました。", "You repaired something broken and used it longer."]);
  rows.push(["engine.context_small.rich.0", "身近な人に食事をごちそうしました。", "You treated someone close to a meal."]);
  rows.push(["engine.context_small.rich.1", "新しい本を買い、少しずつ読みました。", "You bought a new book and read it bit by bit."]);
  rows.push(["engine.context_small.urban.0", "通りの店先で季節の品を見ました。", "You looked at seasonal goods outside a shop."]);
  rows.push(["engine.context_small.urban.1", "人通りの多い道をゆっくり歩きました。", "You walked slowly along a busy street."]);
  rows.push(["engine.context_small.rural.0", "近くの畑の様子を眺めました。", "You looked over a nearby field."]);
  rows.push(["engine.context_small.rural.1", "家の周りの道を歩いて回りました。", "You walked around the paths near home."]);
  rows.push(["engine.context_small.past.0", "家族へ短い手紙を書きました。", "You wrote a short letter to family."]);
  rows.push(["engine.context_small.past.1", "ラジオから流れる声に耳を傾けました。", "You listened to voices on the radio."]);
  rows.push(["engine.context_small.now.0", "離れた人と近況を伝え合いました。", "You exchanged news with someone far away."]);
  rows.push(["engine.context_small.now.1", "今日の予定を見直しました。", "You reviewed your plans for the day."]);
  rows.push(["engine.context_small.future.0", "新しい道具の使い方を教わりました。", "Someone showed you how to use a new tool."]);
  rows.push(["engine.context_small.future.1", "変わっていく町の話を聞きました。", "You heard how the town was changing."]);
  rows.push(["engine.context_small.child.0", "身近な大人と落ち葉を集めました。", "You collected fallen leaves with an adult close to you."]);
  rows.push(["engine.context_small.child.1", "小さな石を並べて遊びました。", "You lined up small stones to play."]);
  rows.push(["engine.context_small.student.0", "学んだことを友人と確かめました。", "You checked what you had learned with a friend."]);
  rows.push(["engine.context_small.student.1", "課題を終えて友人と話しました。", "You finished an assignment and talked with a friend."]);
  rows.push(["engine.context_small.adult.0", "仕事のあとに家の用事を済ませました。", "After work, you finished some chores at home."]);
  rows.push(["engine.context_small.adult.1", "身近な人と週末の予定を話しました。", "You talked about weekend plans with someone close."]);
  rows.push(["engine.context_small.old.0", "昔の友人に近況を伝えました。", "You sent news to an old friend."]);
  rows.push(["engine.context_small.old.1", "ゆっくり歩いて季節の花を見ました。", "You took a slow walk and looked at seasonal flowers."]);
  rows.push(["engine.context_small.region0.0", "近くの市場で品物を見ました。", "You looked at goods in a nearby market."]);
  rows.push(["engine.context_small.region0.1", "町の通りを歩き、人の声を聞きました。", "You walked through town and heard people talking."]);
  rows.push(["engine.context_small.region1.0", "地域の集まりで知人に会いました。", "You saw an acquaintance at a local gathering."]);
  rows.push(["engine.context_small.region1.1", "近所の人と天気の話をしました。", "You talked with a neighbor about the weather."]);
  rows.push(["engine.context_small.region2.0", "家の周りを片づけました。", "You tidied the area around home."]);
  rows.push(["engine.context_small.region2.1", "身近な人に料理を教わりました。", "Someone close showed you how to cook a dish."]);
  rows.push(["engine.frequent.0", "景気が冷え込み、働く日が減りました。", "An economic slowdown left you with fewer days of work."]);
  rows.push(["engine.frequent.1", "商売に来る人が増え、売上が伸びました。", "More customers came by, and your sales grew."]);
  rows.push(["engine.frequent.2", "今の職場で働き続けました。", "You stayed at your current workplace."]);
  rows.push(["engine.frequent.3", "初等教育を修了しました。", "You completed your primary education."]);
  rows.push(["engine.frequent.4", "薪で料理をし、煙を外へ逃がしました。", "You cooked with firewood and let the smoke out."]);
  rows.push(["engine.frequent.5", "体調がすぐれず、家で静かに休みました。", "You felt unwell and rested quietly at home."]);
  rows.push(["engine.frequent.6", "健診で血圧が高いと分かりました。", "A health check found that your blood pressure was high."]);
  rows.push(["engine.frequent.7", "成長した子どもが生活費を助けてくれました。", "Your grown child helped with living expenses."]);
  rows.push(["engine.frequent.8", "中等教育で学び始めました。", "You began studying at secondary school."]);
  rows.push(["engine.frequent.9", "腰の痛みで、仕事を数日休みました。", "Back pain kept you away from work for a few days."]);
  rows.push(["engine.frequent.10", "携帯電話を持ち、遠くの家族と話しました。", "With a mobile phone, you spoke to family far away."]);
  rows.push(["engine.frequent.11", "商売の売上が減り、支出を見直しました。", "Business sales fell, so you reviewed your spending."]);
  rows.push(["engine.frequent.12", "インフルエンザにかかり、家で休みました。", "You had influenza and rested at home."]);
  rows.push(["engine.frequent.13", "子どもを迎える時期を先に延ばしました。", "You put off having another child."]);
  rows.push(["engine.frequent.14", "偶然、昔の先生と再会しました。", "You unexpectedly met a former teacher again."]);
  rows.push(["engine.frequent.15", "離れた家族に手紙を送りました。", "You sent a letter to family far away."]);
  rows.push(["engine.frequent.16", "初めての料理を作れるようになりました。", "You learned to make a new dish."]);
  rows.push(["engine.frequent.17", "若い仕事仲間に経験を伝えました。", "You shared your experience with a younger coworker."]);
  rows.push(["engine.frequent.18", "雨上がりに外へ出て、澄んだ空気を吸いました。", "After the rain, you went outside and breathed the fresh air."]);
  rows.push(["engine.frequent.19", "夜は静かに過ごしました。", "You spent a quiet evening."]);
  rows.push(["engine.frequent.20", "母と暮らし、身の回りの世話をしました。", "You lived with your mother and helped care for her."]);
  rows.push(["engine.frequent.21", "交通事故のあと、しばらく治療を受けました。", "You received treatment for a while after a road accident."]);
  rows.push(["engine.frequent.22", "公園の木陰に座って休みました。", "You sat and rested in the shade of a park tree."]);
  rows.push(["engine.frequent.23", "大学での学びを終えました。", "You completed your university studies."]);
  rows.push(["engine.frequent.24", "電気のない夜は、ランプのそばで過ごしました。", "On nights without electricity, you sat beside a lamp."]);
  rows.push(["engine.frequent.25", "医師の診察を受けに、遠い診療所へ行きました。", "You traveled to a distant clinic to see a doctor."]);
  rows.push(["engine.frequent.26", "傷んだ道具を修理して使いました。", "You repaired a worn tool and used it again."]);
  rows.push(["engine.frequent.27", "朝は離れた井戸へ水を汲みに行きました。", "In the morning, you walked to a distant well for water."]);
  rows.push(["engine.frequent.28", "中等教育を修了しました。", "You completed your secondary education."]);
  rows.push(["engine.frequent.29", "帰宅途中に店の前で足を止めました。", "On your way home, you stopped outside a shop."]);
  rows.push(["engine.frequent.pattern.0", "{item}のために日本の物価で約{amount}円を支払いました。", "You paid about {amount} yen in Japanese purchasing power for {item}."]);
  rows.push(["engine.frequent.pattern.1", "近所の人と{sport}の試合を見ました。", "You watched {sport} with a neighbor."]);
  rows.push(["engine.frequent.pattern.2", "{disaster}で家や持ちものが傷みました。", "{disaster} damaged your home or belongings."]);
  rows.push(["engine.frequent.pattern.3", "{month}月、{festival}を家族や友人と迎えました。", "In month {month}, you marked {festival} with family and friends."]);
  rows.push(["engine.frequent.pattern.4", "子どもたちの{sport}を、そばで見守りました。", "You watched children play {sport} nearby."]);
  rows.push(["engine.frequent.english.0", "{item}に日本の物価で約{amount}円を支払いました。", "You paid about US${amount} at PPP for {item}."]);
  rows.push(["engine.frequent.english.1", "近所の人と{sport}の試合を見ました。", "You watched {sport} with a neighbor."]);
  rows.push(["engine.frequent.english.2", "{festival}を家族や友人と迎えました。", "You marked {festival} with family and friends."]);
  rows.push(["engine.frequent.english.3", "子どもたちの{sport}を、そばで見守りました。", "You watched children play {sport} nearby."]);
  // task55 translations
  rows.push(["engine.credit.student", "学生向け銀行融資", "Student bank loan"]);
  rows.push(["engine.econ.property_value", "住まいの価値", "Property value"]);
  rows.push(["engine.econ.seizure_value", "差し押さえた資産価値", "Value of seized collateral"]);
  rows.push(["engine.risk.low", "低い", "Low"]);
  rows.push(["engine.risk.medium", "ふつう", "Medium"]);
  rows.push(["engine.risk.high", "高い", "High"]);
  rows.push(["engine.debt.seizure", "返済が滞り、{item}を差し押さえられました。", "After missed payments, your {item} was seized as collateral."]);
  rows.push(["engine.job.porter", "荷物運搬員", "Porter"]);
  rows.push(["engine.job.waste_collector", "廃棄物収集員", "Waste collector"]);
  rows.push(["engine.job.dishwasher", "皿洗い係", "Dishwasher"]);
  rows.push(["engine.job.cleaner", "清掃員", "Cleaner"]);
  rows.push(["engine.job.delivery_helper", "配送助手", "Delivery assistant"]);
  rows.push(["engine.job.mining_laborer", "鉱山作業員", "Mine worker"]);
  rows.push(["engine.job.kitchen_helper", "調理補助員", "Kitchen assistant"]);
  rows.push(["engine.job.harvest_worker", "収穫作業員", "Harvest worker"]);
  rows.push(["engine.job.road_laborer", "道路作業員", "Road worker"]);
  rows.push(["engine.job.laundry_worker", "洗濯作業員", "Laundry worker"]);
  rows.push(["engine.job.recycler", "資源回収員", "Recycling worker"]);
  rows.push(["engine.job.hotel_cleaner", "宿泊施設清掃員", "Hotel cleaner"]);
  rows.push(["engine.job.livestock_helper", "家畜の世話係", "Livestock assistant"]);
  rows.push(["engine.job.dock_worker", "港湾作業員", "Dock worker"]);
  rows.push(["engine.job.street_cleaner", "道路清掃員", "Street cleaner"]);
  rows.push(["engine.job.livestock_keeper", "畜産農家", "Livestock farmer"]);
  rows.push(["engine.job.gardener", "庭師", "Gardener"]);
  rows.push(["engine.job.forestry_worker", "林業作業員", "Forestry worker"]);
  rows.push(["engine.job.dairy_farmer", "酪農家", "Dairy farmer"]);
  rows.push(["engine.job.orchard_worker", "果樹農家", "Orchard grower"]);
  rows.push(["engine.job.poultry_keeper", "養鶏農家", "Poultry farmer"]);
  rows.push(["engine.job.beekeeper", "養蜂家", "Beekeeper"]);
  rows.push(["engine.job.irrigation_worker", "灌漑作業員", "Irrigation worker"]);
  rows.push(["engine.job.plumber", "配管工", "Plumber"]);
  rows.push(["engine.job.carpenter", "大工", "Carpenter"]);
  rows.push(["engine.job.mason", "左官", "Mason"]);
  rows.push(["engine.job.mechanic", "整備士", "Mechanic"]);
  rows.push(["engine.job.welder", "溶接工", "Welder"]);
  rows.push(["engine.job.tailor", "仕立て職人", "Tailor"]);
  rows.push(["engine.job.baker", "パン職人", "Baker"]);
  rows.push(["engine.job.metalworker", "金属加工職人", "Metalworker"]);
  rows.push(["engine.job.printer", "印刷工", "Printer"]);
  rows.push(["engine.job.cashier", "レジ係", "Cashier"]);
  rows.push(["engine.job.hairdresser", "美容師", "Hairdresser"]);
  rows.push(["engine.job.security_guard", "警備員", "Security guard"]);
  rows.push(["engine.job.bus_driver", "バス運転手", "Bus driver"]);
  rows.push(["engine.job.taxi_driver", "タクシー運転手", "Taxi driver"]);
  rows.push(["engine.job.machine_operator", "機械運転員", "Machine operator"]);
  rows.push(["engine.job.assembly_operator", "組立作業員", "Assembly operator"]);
  rows.push(["engine.job.textile_operator", "繊維機械運転員", "Textile machine operator"]);
  rows.push(["engine.job.childcare_worker", "保育職員", "Childcare worker"]);
  rows.push(["engine.job.tour_guide", "観光ガイド", "Tour guide"]);
  rows.push(["engine.job.hotel_receptionist", "ホテル受付係", "Hotel receptionist"]);
  rows.push(["engine.job.receptionist", "受付係", "Receptionist"]);
  rows.push(["engine.job.bank_clerk", "銀行事務員", "Bank clerk"]);
  rows.push(["engine.job.data_entry", "データ入力係", "Data entry clerk"]);
  rows.push(["engine.job.payroll_clerk", "給与事務員", "Payroll clerk"]);
  rows.push(["engine.job.library_clerk", "図書館職員", "Library clerk"]);
  rows.push(["engine.job.shipping_clerk", "出荷事務員", "Shipping clerk"]);
  rows.push(["engine.job.records_clerk", "記録管理員", "Records clerk"]);
  rows.push(["engine.job.call_center", "電話相談員", "Call center agent"]);
  rows.push(["engine.job.travel_clerk", "旅行事務員", "Travel clerk"]);
  rows.push(["engine.job.lab_technician", "検査技師", "Laboratory technician"]);
  rows.push(["engine.job.engineering_technician", "技術補助員", "Engineering technician"]);
  rows.push(["engine.job.it_support", "情報機器支援員", "IT support worker"]);
  rows.push(["engine.job.bookkeeper", "簿記担当者", "Bookkeeper"]);
  rows.push(["engine.job.paramedic", "救急救命士", "Paramedic"]);
  rows.push(["engine.job.dental_assistant", "歯科助手", "Dental assistant"]);
  rows.push(["engine.job.surveyor", "測量技師", "Surveyor"]);
  rows.push(["engine.job.agricultural_technician", "農業技術員", "Agricultural technician"]);
  rows.push(["engine.job.broadcast_technician", "放送技術員", "Broadcast technician"]);
  rows.push(["engine.job.insurance_agent", "保険代理人", "Insurance agent"]);
  rows.push(["engine.job.crane_operator", "クレーン運転員", "Crane operator"]);
  rows.push(["engine.job.train_driver", "列車運転士", "Train driver"]);
  rows.push(["engine.job.forklift_driver", "フォークリフト運転員", "Forklift driver"]);
  rows.push(["engine.job.shop_manager", "店舗責任者", "Shop manager"]);
  rows.push(["engine.job.farm_manager", "農場責任者", "Farm manager"]);
  rows.push(["engine.job.restaurant_manager", "飲食店責任者", "Restaurant manager"]);
  rows.push(["engine.job.architect", "建築家", "Architect"]);
  rows.push(["engine.job.pharmacist", "薬剤師", "Pharmacist"]);
  rows.push(["engine.job.veterinarian", "獣医師", "Veterinarian"]);
  rows.push(["engine.job.journalist", "記者", "Journalist"]);
  rows.push(["engine.job.social_worker", "社会福祉士", "Social worker"]);
  rows.push(["engine.job.economist", "経済研究員", "Economist"]);
  rows.push(["engine.job.university_lecturer", "大学講師", "University lecturer"]);
  rows.push(["engine.job.dentist", "歯科医師", "Dentist"]);
  rows.push(["engine.job.psychologist", "心理士", "Psychologist"]);
  rows.push(["engine.job.urban_planner", "都市計画士", "Urban planner"]);
  rows.push(["engine.job.hotel_manager", "宿泊施設責任者", "Hotel manager"]);
  rows.push(["engine.job.factory_manager", "工場責任者", "Factory manager"]);
  rows.push(["engine.job.logistics_manager", "物流責任者", "Logistics manager"]);
  rows.push(["engine.job.hospital_manager", "病院管理者", "Hospital administrator"]);
  rows.push(["engine.job.school_principal", "学校長", "School principal"]);
  rows.push(["engine.job.finance_manager", "財務責任者", "Finance manager"]);
  rows.push(["engine.job.project_manager", "事業責任者", "Project manager"]);
  rows.push(["engine.job.government_manager", "行政管理者", "Government manager"]);
  rows.push(["engine.job.unavailable.experience", "{job}：経験が必要", "{job}: experience required"]);
  rows.push(["engine.job.unavailable.market", "{job}：この国では求人が少ない", "{job}: few openings in this country"]);
  rows.push(["engine.lifestyle.frugal", "節約", "Frugal"]);
  rows.push(["engine.lifestyle.normal", "ふつう", "Normal"]);
  rows.push(["engine.lifestyle.comfortable", "ゆとり", "Comfortable"]);
  rows.push(["engine.lifestyle.luxury", "ぜいたく", "Luxury"]);
  rows.push(["engine.asset.deposits", "預金", "Deposits"]);
  rows.push(["engine.asset.bonds", "国債", "Bonds"]);
  rows.push(["engine.asset.stocks", "株式", "Stocks"]);
  rows.push(["engine.asset.gold", "金", "Gold"]);
  rows.push(["engine.asset.realEstate", "不動産", "Property"]);
  rows.push(["engine.asset.business", "事業", "Business"]);
  rows.push(["engine.asset.retirement", "退職資金", "Retirement savings"]);
  rows.push(["engine.credit.bank", "銀行", "Bank"]);
  rows.push(["engine.credit.mortgage", "住宅ローン", "Mortgage"]);
  rows.push(["engine.credit.credit_card", "クレジットカード", "Credit card"]);
  rows.push(["engine.credit.microfinance", "マイクロファイナンス", "Microfinance"]);
  rows.push(["engine.credit.informal_lender", "非公式の貸し手", "Informal lender"]);
  rows.push(["engine.credit.family", "家族", "Family"]);
  rows.push(["engine.econ.ended", "この人生は終わっています。", "This life has ended."]);
  rows.push(["engine.econ.account", "金融口座を利用しにくい状況です。", "A financial account is hard to access."]);
  rows.push(["engine.econ.market", "株式市場や投資資金へのアクセスが必要です。", "Stock market access and investment funds are needed."]);
  rows.push(["engine.econ.wealth", "まとまった資金が必要です。", "More capital is needed."]);
  rows.push(["engine.econ.era", "この時代には利用できません。", "Unavailable in this era."]);
  rows.push(["engine.econ.cash", "使える現金が足りません。", "Not enough available cash."]);
  rows.push(["engine.econ.invested", "資産に投資しました。", "You invested in an asset."]);
  rows.push(["engine.econ.sell_unavailable", "売却できる資産が足りません。", "Not enough assets to sell."]);
  rows.push(["engine.econ.sold", "資産を売却しました。", "You sold an asset."]);
  rows.push(["engine.econ.credit_unavailable", "この借入先は利用できません。", "This lender is unavailable."]);
  rows.push(["engine.econ.credit_limit", "借入可能額を超えています。", "The borrowing limit was exceeded."]);
  rows.push(["engine.econ.borrowed", "借入を受けました。", "You borrowed money."]);
  rows.push(["engine.econ.repay_unavailable", "返済できる現金か借入残高が足りません。", "Not enough cash or debt balance for this repayment."]);
  rows.push(["engine.econ.repaid", "借入を返済しました。", "You repaid part of the debt."]);
  rows.push(["engine.econ.lifestyle_unavailable", "暮らし方を選べません。", "This lifestyle cannot be selected."]);
  rows.push(["engine.econ.lifestyle_set", "暮らし方を変えました。", "You changed your lifestyle."]);
  rows.push(["engine.econ.travel", "海外旅行の機会が限られています。", "Overseas travel is difficult to access here."]);
  rows.push(["engine.econ.income", "所得が増えると選べます。", "Available with a higher income."]);
  rows.push(["engine.econ.inheritance", "親からの相続", "Inheritance from a parent"]);
  rows.push(["engine.econ.inherited", "親から財産を受け継ぎました。", "You inherited assets from a parent."]);
  rows.push(["engine.econ.bequest", "残した財産を子どもたちに引き継ぎました。", "Your remaining assets passed to your children."]);
  rows.push(["engine.debt.eviction", "担保の家や土地を失い、住まいを移しました。", "Collateral was seized and you had to move home."]);
  rows.push(["engine.debt.child_work", "返済のため、子どもが学校を休んで働く日が増えました。", "A child missed school to help repay debt."]);
  rows.push(["engine.debt.food", "返済を優先し、食費と医療費を切り詰めました。", "Debt repayments led to cuts in food and medical spending."]);
  rows.push(["engine.debt.migrate", "返済のため、仕事を求めて別の土地へ移りました。", "You moved to find work to repay debt."]);
  rows.push(["engine.debt.bankruptcy", "正式な破産手続きで債務を整理しました。今後の借入は難しくなります。", "Formal bankruptcy cleared debt and limited future credit."]);
  rows.push(["engine.debt.illness", "医療費を用意できず、治療を先延ばしにしました。", "You delayed treatment because you could not afford it."]);
  rows.push(["engine.debt.work", "返済のため、手取りの少ない仕事を続けました。", "You kept working for little take-home pay to service debt."]);
  rows.push(["engine.debt.family", "借入の返済をめぐり、家族との関係が難しくなりました。", "Debt repayment strained family relationships."]);
  rows.push(["engine.decision.retire.title", "退職後の働き方", "Retirement and work"]);
  rows.push(["engine.decision.retire.body", "年齢と健康、年金と貯蓄を考え、働き方を選びます。", "Consider your health, pension and savings as you choose how to work."]);
  rows.push(["engine.decision.retire.note", "退職後の収入は年金の加入状況と蓄えに左右されます。", "Income after retirement depends on pension coverage and savings."]);
  rows.push(["engine.decision.retire.choice.0", "退職する", "Retire"]);
  rows.push(["engine.decision.retire.choice.1", "働き続ける", "Keep working"]);
  rows.push(["engine.decision.retire.choice.2", "短時間で働く", "Work part time"]);
  rows.push(["engine.decision.retire.choice.3", "別の仕事に就く", "Find another job"]);
  rows.push(["engine.decision.retire.choice.4", "小さな商売を始める", "Start a small business"]);
  rows.push(["engine.decision.partTime.title", "短時間勤務を考える", "Part time work"]);
  rows.push(["engine.decision.partTime.body", "仕事と学び、家族、健康に使う時間を考えます。", "Consider time for work, learning, family and health."]);
  rows.push(["engine.decision.partTime.note", "短時間勤務では収入と昇進機会が減る一方、時間の余裕が生まれます。", "Part time work reduces income and promotion chances but gives you more time."]);
  rows.push(["engine.decision.partTime.choice.0", "短時間勤務にする", "Work part time"]);
  rows.push(["engine.decision.partTime.choice.1", "今の勤務を続ける", "Keep current hours"]);
  rows.push(["engine.decision.partTime.choice.2", "仕事を一時休む", "Take a break from work"]);
  rows.push(["engine.item.gadget.label", "新しい電子機器", "New electronics"]);
  rows.push(["engine.item.gadget.effect", "学びと趣味の幅が広がる", "More options for learning and hobbies"]);
  rows.push(["engine.item.luxuryGoods.label", "高級品", "Luxury goods"]);
  rows.push(["engine.item.luxuryGoods.effect", "買い物を楽しむ", "Enjoy shopping"]);
  rows.push(["engine.item.secondHome.label", "別荘", "Second home"]);
  rows.push(["engine.item.secondHome.effect", "別の住まいで過ごせる", "Spend time in another home"]);
  rows.push(["engine.service.eatingOut.label", "外食", "Dining out"]);
  rows.push(["engine.service.eatingOut.effect", "家族や友人と食事を楽しむ", "Enjoy a meal with family or friends"]);
  rows.push(["engine.service.hobbyClass.label", "趣味の教室", "Hobby class"]);
  rows.push(["engine.service.hobbyClass.effect", "新しい趣味を学ぶ", "Learn a new hobby"]);
  rows.push(["engine.service.foreignTrip.label", "海外旅行", "Overseas travel"]);
  rows.push(["engine.service.foreignTrip.effect", "海外の文化に触れる", "Experience another culture"]);
  rows.push(["engine.service.privateSchool.label", "私立学校", "Private school"]);
  rows.push(["engine.service.privateSchool.effect", "子どもの学びの選択肢を広げる", "Expand a child's education options"]);
  rows.push(["engine.service.privateHealth.label", "民間医療", "Private health care"]);
  rows.push(["engine.service.privateHealth.effect", "診療の選択肢を増やす", "Expand treatment options"]);
  // Everyday observations use the Japanese templates in engine.js as their local fallback.
  // The English edition resolves the same keys through this dictionary.
  var everydayEn = {
    child: [
      "In the morning, you opened your eyes when you heard {person}.", "A hand on your back from {person} helped you settle.", "You slept near {person} while footsteps passed outside.",
      "Around {rhythm}, you followed {person} on small feet.", "You listened near the kitchen as {person} prepared a meal.", "On a rainy day, you looked out of the window with {person}.",
      "Your small hand held the edge of {person}'s clothes.", "You learned your name when {person} called it.", "You watched your family enjoy {joy} from nearby.",
      "You took in the smells and voices of the market with {person}.", "After a fall, you walked back to {person}.", "Before sleep, you listened to {person} talk about the day.",
      "On a day for {joy}, the house sounded different.", "You learned the sound of {person} returning home.", "On a windy day, you stood in the doorway with {person}.",
      "Before {rhythm}, you shared drinking water with your family.", "When {person} laughed, you laughed too.", "You showed {person} the pebbles you had played with.",
      "After {joy}, you helped the family put things away.", "When you had a fever, {person} checked on you through the night.", "You learned the names of roadside plants with {person}.",
      "You showed {person} the bowl you carried by yourself.", "You watched the light around {rhythm} from a corner of the house.", "You repeated a line of a song with {person}.",
      "You joined the adults enjoying {joy} for a little while.", "You folded freshly washed cloth with {person}.", "In the evening, you told {person} what you had seen.",
      "You watched {person}'s hands at work around the house.", "With {person}'s help, you put a tool back in its place.", "You learned to recognize when your family looked forward to {joy}.",
      "You stayed nearby and watched {person} prepare {food}.", "You watched older children enjoying {sport}."
    ],
    student: [
      "After {rhythm}, you told {person} your plans for the day.", "A conversation about {joy} made the walk home with friends longer.", "You read newly learned words aloud to {person}.",
      "You closed your book and listened to people enjoying {joy}.", "You checked tomorrow's preparations with {person}.", "On a familiar route, you heard the usual shop opening.",
      "You showed {person} the page where you had solved a difficult problem.", "You asked someone at home what {motivation} meant to them.", "You made plans with a friend to enjoy {joy}.",
      "Around {rhythm}, you finished chores and sat down to study.", "You helped {person} with work for a short while.", "Even while waiting for rain, you and a friend talked about tomorrow.",
      "You learned the names of people who shared your enjoyment of {joy}.", "You carried a borrowed book home carefully and showed {person} its cover.", "You began to think about what you could do for {motivation}.",
      "You handed water to {person}, who was rushing through the morning.", "You taught a younger child nearby something you had just learned.", "After {joy}, you came home and did your usual chores.",
      "You took a small detour with {person} and noticed the changing season.", "You stayed with a friend after a mistake and tried again together.", "Around {rhythm}, you thought back to something that had gone well.",
      "{person} showed you how to handle a familiar tool.", "You kept talking about {joy} after you returned home.", "Trusted with a small purchase, you checked the change.",
      "You noticed that you and {person} meant different things by {motivation}.", "You remembered what {person} said on the way home more than your exam result.", "You looked forward to {joy} through a long week.",
      "Without a desk, you found a quiet place to study.", "You talked with {person} about your friends while clearing dinner.", "You listened to someone explain why {motivation} mattered to them.",
      "{person} showed you how to make {food}.", "After watching {sport}, you walked and talked with friends."
    ],
    adult: [
      "After a long day, you made a little time for {joy}.", "From your first wages, you bought {person} a small gift.", "Around {rhythm}, you joined the people heading to work.",
      "You cleared the table with {person} and talked about the day.", "For {motivation}, you wrote down the money you could spend.", "A neighbor needed help, and you stopped on your way home from work.",
      "On a night without lights, you and {person} remembered a song and sang.", "{joy} brought you together with a friend you had not seen in a while.", "Even on a tired morning, you got up and prepared for the day's work.",
      "You prepared an extra plate of food for {person}.", "Before {rhythm}, you checked that the door was secure.", "Thinking of {motivation}, you looked for another way after a refusal.",
      "During {joy}, you set urgent tasks aside for a little while.", "You washed your working hands and sat down with {person}.", "You kept a drawing by {child} in a drawer.",
      "You weighed the household budget before choosing what {child} needed for learning.", "You stopped what you were doing and heard {person} out.", "Around {rhythm}, the neighboring home began to stir too.",
      "With {motivation} in mind, you finished a difficult job one part at a time.", "As you prepared for {joy}, you caught up with {person}.", "After the house lights went out, you kept preparing for tomorrow.",
      "After dinner, you sang a song {child} had learned.", "Even in a tight month, you shared the pleasure of {joy}.", "You walked the same road with {person} and talked without hurrying.",
      "You explained to {person} why you had chosen {motivation}.", "After {rhythm}, you cared for your tools for the next day.", "A conversation about {joy} made you and a neighbor laugh.",
      "You did not rush to answer {child}'s question; you thought it through together.", "On a difficult day, you still started work in your usual place.", "You ate the meal {person} had left for you when you got home.",
      "You put money saved for {motivation} into an envelope.", "Hearing people enjoying {joy} outside, you opened the window.", "At the table, you listened carefully to how {child}'s school day had gone.",
      "You stopped with {person} to shelter from rain and talked a while.", "Around {rhythm}, you set out once more for the field, shop, or workplace.", "Your thoughts about {motivation} changed, and you told {person}.",
      "After enjoying {joy}, you finished the household work that remained.", "You told a tired {person} to rest first.", "At the end of a long commute, the light at home quickened your step.",
      "Keeping {motivation} close, you chose what you could do today.", "You made {food} with {person} and saved some for tomorrow.",
      "Talk of {sport} gave you and your workmates a brief laugh."
    ],
    old: [
      "Around {rhythm}, you opened the window and listened outside.", "You watched younger people enjoying {joy} for a while.", "You and {person} talked about a road you once knew well.",
      "You kept tools within reach and worked a little at a time.", "You told {person} about the days you had kept going for {motivation}.", "You read a short message from {child} once more.",
      "You arranged with a friend to enjoy {joy} together.", "In the morning, you began getting ready after hearing {person}'s voice.", "You washed a bowl used for many years and put it back on the shelf.",
      "After {rhythm}, you sat and listened to the neighborhood.", "You taught {child}'s child a song you remembered.", "More people in the family came to value {motivation}.",
      "You changed your walking route a little to enjoy {joy}.", "You rested when needed and finished the chores at your own pace.", "You and {person} remembered where an old photo was taken.",
      "Around {rhythm}, you took care of errands more slowly than before.", "You showed {child} how to mend a well used tool.", "After {joy}, you walked a friend to the door.",
      "Listening to {person}, you learned how the neighborhood had changed.", "You had a different answer about {motivation} than when you were young.", "In the morning light, you checked how your plants were growing.",
      "Talk of {joy} brought someone's face to mind.", "You and {child} prepared a meal together.", "Before {rhythm}, you thought of the people you would see today.",
      "You told {person} about something good you had eaten recently.", "You and your family went over what you had saved for {motivation}.", "You still made room in your plans for {joy}.",
      "On weak days you accepted help; on stronger days you helped someone else.", "You sat quietly with {person} and watched people pass.", "Around {rhythm}, you began what your hands could still do today.",
      "You showed a younger person how to make {food}.", "You watched {sport} to the end with {person}."
    ],
    hard: [
      "Even on a hard morning, you rose around {rhythm} and went to work.", "On a day of stretching meals, you remembered the food {person} shared with you.",
      "When work ran out, you went looking for another place to work the next day.", "You came home tired and still spent time with family over {joy}.",
      "After a tool broke, you found a way to mend it and use it again.", "With {motivation} in mind, you held on to a small amount of savings.",
      "When plans changed, you and {person} worked out what to do tomorrow.", "You walked a long way home and finished the chores there too.",
      "A neighbor helped you; when you next had time, you helped someone else.", "On an uneasy night, you and {person} checked where the water and food were kept.",
      "After {rhythm}, you rested briefly, then carried on with the work at hand.", "Even in a difficult period, talk of {joy} made your family laugh for a moment.",
      "On a day when you had a little {food}, you shared it with {person}.", "Even on a hard day, you talked with a neighbor about a result in {sport}."
    ]
  };
  Object.keys(everydayEn).forEach(function (stage) {
    everydayEn[stage].forEach(function (line, index) { rows.push(["engine.everyday." + stage + "." + index, "", line]); });
  });
  [
    ["engine.institution.service_title", "兵役の通知", "Military service notice"],
    ["engine.institution.service_body", "兵役の対象年齢になり、通知が届きました。", "You reached the age for military service and received a notice."],
    ["engine.institution.service_note", "この国での兵役期間の目安は{years}年です。免除には審査があります。", "Service lasts about {years} years here. Exemption requires a review."],
    ["engine.institution.service_note_one", "この国での兵役期間の目安は{years}年です。免除には審査があります。", "Service lasts about one year here. Exemption requires a review."],
    ["engine.institution.service_accept", "兵役に就く", "Begin service"],
    ["engine.institution.service_exemption", "免除を申請する", "Apply for an exemption"],
    ["engine.institution.service_started", "兵役に就き、約{years}年間の訓練と任務を始めました。", "You began military training and duties for about {years} years."],
    ["engine.institution.service_started_one", "兵役に就き、約{years}年間の訓練と任務を始めました。", "You began military training and duties for about one year."],
    ["engine.institution.service_exempted", "審査の結果、兵役の免除が認められました。", "Your application was reviewed and an exemption was granted."],
    ["engine.institution.service_required", "免除は認められず、兵役に就きました。", "The exemption was not granted, and you began military service."],
    ["engine.institution.partner_title", "いっしょに暮らす話", "Living together"],
    ["engine.institution.partner_body", "{name}（{age}歳）と、いっしょに暮らすことを考えています。", "You and {name} ({age}) are thinking about living together."],
    ["engine.institution.partner_note", "この年、この国では同性の二人は結婚できません。", "In this year and country, two people of the same sex cannot legally marry."],
    ["engine.institution.partner_together", "ともに暮らす", "Live together"],
    ["engine.institution.partner_wait_choice", "もう少し待つ", "Wait a little longer"],
    ["engine.institution.married", "{name}と結婚しました。", "You married {name}."],
    ["engine.institution.partnered", "{name}と、ともに暮らし始めました。", "You and {name} began living together."],
    ["engine.institution.partner_privacy", "法律上の危険を避けるため、二人の関係を周囲に伝える相手を慎重に選びました。", "Because of legal risks, you chose carefully whom to tell about your relationship."],
    ["engine.institution.partner_wait", "{name}との暮らしの話を、もう少し先に延ばしました。", "You and {name} decided to wait before living together."],
    ["engine.institution.covid_stay_home", "2020年、外出を控える措置がとられ、家で過ごす時間が増えました。", "In 2020, stay-at-home measures meant spending more time at home."],
    ["engine.institution.covid_customers", "2020年、感染拡大で店を訪れる客が減り、地域の仕事にも影響が出ました。", "In 2020, fewer customers visited local shops during the pandemic, affecting work nearby."],
    ["engine.institution.covid_job_loss", "2020年、感染拡大と活動制限の影響で仕事を失いました。", "In 2020, the pandemic and restrictions led to the loss of your job."]
  ].forEach(function (row) { rows.push(row); });
  var ja = {}, en = {}, logKeys = {}, causeKeys = {}, moneyKeys = {};
  [
    ["engine.money.region", "この地域では一般的ではありません。", "This option is not normally offered in this region."],
    ["engine.money.religion", "この宗教的背景には合いません。", "This option does not match this person's religious background."],
    ["engine.money.wealth", "この選択にはより多くの蓄えが必要です。", "This option needs more savings."],
    ["engine.money.education", "この選択には学びや技能が必要です。", "This option needs additional education or skills."],
    ["engine.money.home", "貸せる住まいが必要です。", "A room that can be rented out is needed."],
    ["engine.money.franchise", "資金と中等教育が必要です。", "More capital and secondary education are needed."],
    ["engine.money.legal", "この国の制度では確認できません。", "This country's legal framework does not establish access here."],
    ["engine.money.collateral", "質に入れる品物が必要です。", "An item to pledge as collateral is needed."],
    ["engine.money.rich_credit", "高所得国で扱われる短期融資です。", "This short-term product is modeled for high-income countries."],
    ["engine.money.era_crypto", "暗号資産は2013年ごろからの選択肢です。", "Crypto becomes an option around 2013."],
    ["engine.money.mobile", "この時代・地域では携帯送金を利用できません。", "Mobile money is unavailable in this era or region."],
    ["engine.money.savings_value", "蓄えの価値", "Value held in savings"],
    ["engine.money.bet_ticket", "くじの代金", "Lottery ticket cost"],
    ["engine.money.bet_prize", "くじの賞金", "Lottery prize"],
    ["engine.money.bet_won", "くじが当たりました。", "The ticket won a prize."],
    ["engine.money.bet_lost", "くじは外れました。", "The ticket did not win."],
    ["engine.money.rotating.tontine", "トンチン（互助貯蓄）", "Tontine savings circle"],
    ["engine.money.rotating.ekub", "エクブ（互助貯蓄）", "Ekub savings circle"],
    ["engine.money.rotating.susu", "スス（互助貯蓄）", "Susu savings circle"],
    ["engine.money.rotating.chit", "チットファンド（互助貯蓄）", "Chit fund savings circle"],
    ["engine.money.rotating.arisan", "アリサン（互助貯蓄）", "Arisan savings circle"],
    ["engine.money.rotating.tanda", "タンダ／クンディナ（互助貯蓄）", "Tanda or cundina savings circle"],
    ["engine.money.rotating.hui", "会（互助貯蓄）", "Hui savings circle"],
    ["engine.money.rotating.stokvel", "ストックフェル（互助貯蓄）", "Stokvel savings circle"],
    ["engine.asset.goldJewellery", "金の装飾品", "Gold jewellery"],
    ["engine.asset.livestock", "家畜", "Livestock"],
    ["engine.asset.farmland", "農地", "Farmland"],
    ["engine.asset.rotatingSavings", "互助貯蓄", "Rotating savings"],
    ["engine.asset.mobileWallet", "携帯ウォレット", "Mobile wallet"],
    ["engine.asset.cooperativeShare", "協同組合の持分", "Cooperative share"],
    ["engine.asset.foreignCurrency", "外貨", "Foreign currency"],
    ["engine.asset.crypto", "暗号資産", "Crypto"],
    ["engine.asset.speculativeLand", "投機的な土地", "Speculative land"],
    ["engine.asset.treasuryBills", "短期国債", "Treasury bills"],
    ["engine.asset.rentalProperty", "賃貸用の住まい", "Rental property"],
    ["engine.asset.smallShop", "小さな店", "Small shop"],
    ["engine.asset.educationFund", "教育費の積立", "Education fund"],
    ["engine.asset.healthFund", "医療費の積立", "Health fund"],
    ["engine.asset.harvestStore", "収穫物の保管", "Stored harvest"],
    ["engine.asset.peerLoan", "知人への貸付", "Peer loan"],
    ["engine.credit.pawn", "質屋", "Pawn shop"],
    ["engine.credit.payday", "給料日前の短期融資", "Payday loan"],
    ["engine.credit.bnpl", "後払い", "Buy now, pay later"],
    ["engine.credit.shopCredit", "商店の掛け買い", "Shop credit"],
    ["engine.credit.cropLoan", "作付け資金融資", "Crop loan"],
    ["engine.choice.rideHailing", "配車サービスで働く", "Drive for a ride-hailing service"],
    ["engine.choice.deliveryDriving", "配達の仕事をする", "Work in delivery"],
    ["engine.choice.onlineSelling", "ネットで品物を売る", "Sell goods online"],
    ["engine.choice.sideJobs", "副業を探す", "Find a side job"],
    ["engine.choice.rentRoom", "部屋を貸す", "Rent out a room"],
    ["engine.choice.smallShop", "小さな店を開く", "Open a small shop"],
    ["engine.choice.franchise", "加盟店を始める", "Start a franchise"],
    ["engine.choice.homePiecework", "自宅で出来高の仕事をする", "Do piece-rate work at home"],
    ["engine.choice.seasonalMigration", "季節労働に出る", "Travel for seasonal work"],
    ["engine.choice.tutoringWork", "学習を教える", "Offer tutoring"],
    ["engine.choice.repairWork", "修理の仕事を請ける", "Take repair jobs"],
    ["engine.choice.marketTrading", "市場で売買する", "Trade at a market"],
    ["engine.choice.cateringWork", "食事を作って売る", "Sell prepared meals"],
    ["engine.choice.childcareWork", "子どもの世話を請ける", "Offer childcare"],
    ["engine.choice.freelanceWork", "仕事を単発で請ける", "Take freelance work"],
    ["engine.choice.houseCleaning", "清掃の仕事を請ける", "Take cleaning jobs"],
    ["engine.choice.farmWork", "農作業を請ける", "Take farm jobs"],
    ["engine.choice.remoteWork", "遠隔の仕事を請ける", "Take remote work"],
    ["engine.choice.lottery", "宝くじを買う", "Buy a lottery ticket"],
    ["engine.choice.sportsBetting", "合法のスポーツくじを買う", "Buy a legal sports lottery ticket"],
    ["engine.moneyEvent.inheritance.label", "遠縁からの相続", "Distant relative's inheritance"],
    ["engine.moneyEvent.inheritance.text", "遠縁の親族から思いがけない相続を受けました。", "A distant relative left an unexpected inheritance."],
    ["engine.moneyEvent.bonus.label", "仕事の臨時賞与", "Work bonus"],
    ["engine.moneyEvent.bonus.text", "仕事で臨時の賞与を受け取りました。", "Work brought a one-time bonus."],
    ["engine.moneyEvent.harvest.label", "収穫による収入", "Harvest income"],
    ["engine.moneyEvent.harvest.text", "収穫がよく、家計に余裕ができました。", "A good harvest brought extra income."],
    ["engine.moneyEvent.theft.label", "盗難による損失", "Theft loss"],
    ["engine.moneyEvent.theft.text", "盗難で手持ちのお金の一部を失いました。", "Theft took some of the money on hand."],
    ["engine.moneyEvent.scam.label", "電話・ネット詐欺の損失", "Phone or online scam loss"],
    ["engine.moneyEvent.scam.text", "電話やネットの詐欺でお金を失いました。", "A phone or online scam caused a loss."],
    ["engine.moneyEvent.inflation.label", "急な物価上昇", "Sudden inflation"],
    ["engine.moneyEvent.inflation.text", "物価が急に上がり、蓄えの購買力が下がりました。", "A sudden rise in prices reduced the purchasing power of savings."],
    ["engine.moneyEvent.devaluation.label", "通貨価値の下落", "Currency devaluation"],
    ["engine.moneyEvent.devaluation.text", "物価と通貨の変動で、手元のお金の価値が下がりました。", "Price and currency changes reduced the value of money on hand."],
    ["engine.moneyEvent.bankFailure.label", "銀行の破綻による損失", "Bank failure loss"],
    ["engine.moneyEvent.bankFailure.text", "銀行の破綻で預金の一部を失いました。", "A bank failure caused the loss of part of a deposit."],
    ["engine.moneyEvent.relativeRequest.label", "親族への支援", "Support for a relative"],
    ["engine.moneyEvent.relativeRequest.text", "親族に頼まれ、家計から支援しました。", "A relative asked for help, and the household contributed."],
    ["engine.moneyEvent.hospitalBill.label", "予期しない医療費", "Unexpected hospital bill"],
    ["engine.moneyEvent.hospitalBill.text", "急な治療で医療費がかかりました。", "Unexpected treatment brought a hospital bill."]
  ].forEach(function (row) { rows.push(row); });
  rows.forEach(function (row) {
    ja[row[0]] = row[1]; en[row[0]] = row[2];
    if (row[0].indexOf("engine.log.") === 0) logKeys[row[1]] = row[0];
    if (row[0].indexOf("engine.cause.") === 0) causeKeys[row[1]] = row[0];
    if (row[0].indexOf("engine.money.") === 0) moneyKeys[row[1]] = row[0];
  });
  window.I18N.add({ ja: ja, en: en });
  function dataName(value) {
    var countries = window.COUNTRIES || [], i, c, index;
    for (i = 0; i < countries.length; i++) {
      c = countries[i];
      if (c.name === value) return c.name_en || value;
      index = (c.emig || []).indexOf(value);
      if (index >= 0 && c.emig_en && c.emig_en[index]) return c.emig_en[index];
      index = (c.dis || []).indexOf(value);
      if (index >= 0 && c.dis_en && c.dis_en[index]) return c.dis_en[index];
    }
    index = ["犬", "猫", "ヤギ", "鶏", "インコ"].indexOf(value);
    return index >= 0 ? window.I18N.t("engine.animal." + index) : value;
  }
  function disasterPhrase(value) {
    var names = { "Cold waves": "a cold wave", "Cyclones": "a cyclone", "Disease outbreaks": "a disease outbreak",
      "Droughts": "a drought", "Earthquakes": "an earthquake", "Floods": "a flood", "Heat waves": "a heat wave",
      "Heavy rain": "heavy rain", "Hurricanes": "a hurricane", "Landslides": "a landslide", "Sandstorms": "a sandstorm",
      "Severe storms": "a severe storm", "Storm surges": "a storm surge", "Tornadoes": "a tornado", "Tsunamis": "a tsunami",
      "Typhoons": "a typhoon", "Volcanic eruptions": "a volcanic eruption", "Wildfires": "a wildfire", "Windstorms": "a windstorm" };
    return names[value] || String(value || "a disaster").toLowerCase();
  }
  function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }
  window.I18N.engineDataName = dataName;
  var patterns = [
    [/^おもちゃを手にすると、.*。$/, "engine.log.toy_action"],
    [/^(.+)と結婚しました。$/, "engine.log.marry", function (m) { return { name: m[1] }; }],
    [/^(.+)との結婚は見送ることにしました。$/, "engine.log.marry_wait", function (m) { return { name: m[1] }; }],
    [/^(.+)を家族に迎えました。$/, "engine.log.pet_adopt", function (m) { return { animal: dataName(m[1]) }; }],
    [/^(.+)は、別の家にもらわれていきました。$/, "engine.log.pet_pass", function (m) { return { animal: dataName(m[1]) }; }],
    [/^(.+)に移り住み、働きはじめました。$/, "engine.log.move_success", function (m) { return { place: dataName(m[1]) }; }],
    [/^(.+)へ渡ろうとしましたが、かないませんでした。$/, "engine.log.move_fail", function (m) { return { place: dataName(m[1]) }; }],
    [/^(母|父)を引き取り、そばで世話をしました。$/, "engine.log.care_parent", function (m) { return { parent: m[1] === "母" ? "mother" : "father" }; }],
    [/^(母|父)の世話はきょうだいに任せ、仕送りをしました。$/, "engine.log.care_siblings", function (m) { return { parent: m[1] === "母" ? "mother" : "father" }; }],
    [/^(母|父)が亡くなりました。(\d+)歳でした。$/, "engine.log.parent_death", function (m) { return { parent: m[1] === "母" ? "mother" : "father", age: m[2] }; }],
    [/^5歳になるころ、まわりの大人は(.+)のことを「(.+)」と話すようになりました。$/, "engine.log.temperament", function (m) { return { name: m[1], temperament: m[2] }; }],
    [/^5歳の誕生日を迎えました。生まれた年の(.+)の5歳未満死亡率は(.+)％でした。$/, "engine.log.fifth_birthday", function (m) { return { country: dataName(m[1]), rate: m[2] }; }],
    [/^(.+)の仕事から退きました。$/, "engine.log.retired", function (m) { var job = m[1]; return { job: job, jobPhrase: (/^[aeiou]/i.test(job) ? "an " : "a ") + job }; }],
    [/^(.+)が先に旅立ちました。(\d+)歳でした。$/, "engine.log.spouse_death", function (m) { return { name: m[1], age: m[2] }; }],
    [/^(.+)が幼くして亡くなりました。$/, "engine.log.child_death", function (m) { return { name: m[1] }; }],
    [/^(.+)が学校に通いはじめました。$/, "engine.log.child_school", function (m) { return { name: m[1] }; }],
    [/^(.+)が結婚し、新しい家庭を持ちました。$/, "engine.log.child_married", function (m) { return { name: m[1] }; }],
    [/^(.+)と、これからのことを夜遅くまで語り合いました。$/, "engine.log.child_talk", function (m) { return { name: m[1] }; }],
    [/^(.+)が新しく覚えたことを話してくれました。$/, "engine.log.child_learned", function (m) { return { name: m[1] }; }],
    [/^(.+)のことで学校に呼ばれ、帰り道に長く話しました。$/, "engine.log.child_school_talk", function (m) { return { name: m[1] }; }],
    [/^(.+)と買い物に出かけました。$/, "engine.log.child_shopping", function (m) { return { name: m[1] }; }],
    [/^(.+)に見舞われ、暮らしが乱れました。$/, "engine.log.disaster_gentle", function (m) { return { disaster: capitalize(disasterPhrase(dataName(m[1]))) }; }],
    [/^(.+)に見舞われ、家や持ちものに被害が出ました。$/, "engine.log.disaster_damage", function (m) { return { disaster: capitalize(disasterPhrase(dataName(m[1]))) }; }],
    [/^返済のため、(.+)を売りました。$/, "engine.log.sale", function (m) { return { item: m[1] }; }],
    [/^(.+)の維持費を払えず、手放しました。$/, "engine.log.upkeep", function (m) { return { item: m[1] }; }],
    [/^安全を求めて家族と(.+)へ移り、暮らしを始めました。$/, "engine.log.displaced_abroad", function (m) { return { place: dataName(m[1]) }; }]
  ];
  window.I18N.engineLog = function (value) {
    if (logKeys[value]) return window.I18N.t(logKeys[value]);
    var i, match;
    for (i = 0; i < patterns.length; i++) {
      match = patterns[i][0].exec(value);
      if (match) return window.I18N.t(patterns[i][1], patterns[i][2] ? patterns[i][2](match) : {});
    }
    return value;
  };
  window.I18N.engineMoney = function (value) {
    if (moneyKeys[value]) return window.I18N.t(moneyKeys[value]);
    var match = /^(.+)の世話$/.exec(value);
    if (match) return window.I18N.t("engine.money.item_care", { item: dataName(match[1]) });
    match = /^(.+)の被害$/.exec(value);
    if (match) return window.I18N.t("engine.money.disaster_damage", { disaster: disasterPhrase(dataName(match[1])) });
    match = /^(.+)の売却$/.exec(value);
    if (match) return window.I18N.t("engine.money.item_sale", { item: dataName(match[1]) });
    match = /^(.+)の維持費$/.exec(value);
    if (match) return window.I18N.t("engine.money.item_upkeep", { item: dataName(match[1]) });
    match = /^(.+)の運用$/.exec(value);
    if (match) return window.I18N.t("engine.money.investment_return", { item: { "預金": "savings", "分散投資": "diversified investments", "店への出資": "a small shop" }[match[1]] || dataName(match[1]) });
    return value;
  };
  window.I18N.engineCause = function (value) { return causeKeys[value] ? window.I18N.t(causeKeys[value]) : value; };
})();
