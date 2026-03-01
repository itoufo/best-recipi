/**
 * Seed initial data: ingredients, categories, sample recipes
 * Usage: npx tsx scripts/seed-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: 'recipi' } }
)

async function seedCategories() {
  const categories = [
    { slug: 'appetizer', name: '前菜', description: '食欲を刺激する一皿目', display_order: 1 },
    { slug: 'main', name: 'メイン', description: '食卓の主役となる一品', display_order: 2 },
    { slug: 'side-dish', name: '副菜', description: 'メインを引き立てる付け合わせ', display_order: 3 },
    { slug: 'soup', name: 'スープ', description: '心も体も温まるスープ', display_order: 4 },
    { slug: 'dessert', name: 'デザート', description: '食後の甘いひととき', display_order: 5 },
    { slug: 'drink', name: 'ドリンク', description: '特別な食材を使った飲み物', display_order: 6 },
    { slug: 'pasta', name: 'パスタ・麺', description: 'ニッチ食材と麺の組み合わせ', display_order: 7 },
    { slug: 'rice', name: 'ご飯もの', description: '炊き込みご飯やリゾットなど', display_order: 8 },
  ]

  const { error } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' })
  if (error) console.error('Categories error:', error.message)
  else console.log(`✓ Seeded ${categories.length} categories`)
}

async function seedNicheIngredients() {
  const dataPath = path.join(__dirname, 'data', 'niche-ingredients.json')
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  let count = 0
  for (const cat of data.categories) {
    for (const ing of cat.ingredients) {
      const { error } = await supabase.from('ingredients').upsert(
        {
          slug: ing.slug,
          name: ing.name,
          name_en: ing.name_en || null,
          name_reading: ing.name_reading || null,
          category: cat.name,
          season: ing.season || null,
          origin: ing.origin || null,
          is_niche: true,
          description: `${ing.name}（${ing.name_en}）は${cat.name}の一種です。${ing.origin ? `主な産地は${ing.origin}。` : ''}${ing.season ? `旬は${ing.season}。` : ''}`,
        },
        { onConflict: 'slug' }
      )
      if (error) console.error(`  ✗ ${ing.name}: ${error.message}`)
      else count++
    }
  }
  console.log(`✓ Seeded ${count} niche ingredients`)
}

async function seedAllIngredients() {
  const ingredientsDir = path.join(__dirname, 'data', 'ingredients')
  if (!fs.existsSync(ingredientsDir)) {
    console.log('⚠ No ingredients directory found, skipping common ingredients')
    return
  }

  const files = fs.readdirSync(ingredientsDir).filter(f => f.endsWith('.json'))
  let total = 0

  // Batch upsert per file for performance
  for (const file of files) {
    const filePath = path.join(ingredientsDir, file)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const categoryName = data.category
    const ingredients = data.ingredients

    if (!ingredients || !Array.isArray(ingredients)) {
      console.error(`  ✗ Invalid format in ${file}`)
      continue
    }

    const rows = ingredients.map((ing: { slug: string; name: string; name_en?: string; name_reading?: string; season?: string; origin?: string }) => ({
      slug: ing.slug,
      name: ing.name,
      name_en: ing.name_en || null,
      name_reading: ing.name_reading || null,
      category: categoryName,
      season: ing.season || null,
      origin: ing.origin || null,
      is_niche: data.is_niche === true,
      description: `${ing.name}${ing.name_en ? `（${ing.name_en}）` : ''}は${categoryName}の食材です。${ing.origin ? `主な産地は${ing.origin}。` : ''}${ing.season ? `旬は${ing.season}。` : ''}`,
    }))

    // Upsert in batches of 50
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50)
      const { error } = await supabase.from('ingredients').upsert(batch, { onConflict: 'slug' })
      if (error) console.error(`  ✗ Batch error in ${file}: ${error.message}`)
      else total += batch.length
    }
    console.log(`  ✓ ${categoryName}: ${ingredients.length} ingredients (${file})`)
  }
  console.log(`✓ Seeded ${total} ingredients from ${files.length} files`)
}

async function seedSampleRecipes() {
  // Insert sample recipes directly
  const recipes = [
    {
      slug: 'saffron-risotto',
      title: 'サフランリゾット',
      description: 'サフランの黄金色が美しいイタリアンの定番リゾット。クリーミーでコク深い味わい。',
      introduction: 'ミラノ発祥のサフランリゾットは、世界三大スパイスの一つであるサフランの香りと色合いを最大限に活かした一品です。丁寧にブイヨンを加えながら仕上げることで、アルデンテの食感とクリーミーさを両立させます。',
      prep_time_minutes: 10,
      cook_time_minutes: 25,
      total_time_minutes: 35,
      servings: 2,
      servings_unit: '人前',
      difficulty: 'medium',
      calories: 480,
      protein_g: 12,
      fat_g: 18,
      carbs_g: 65,
      fiber_g: 1.5,
      sodium_mg: 680,
      instructions: [
        { step: 1, text: 'サフラン（ひとつまみ）を温かいブイヨン50mlに浸し、10分以上置いて色と香りを抽出します。', tip: 'サフランは事前に浸しておくことで色が均一に出ます' },
        { step: 2, text: '玉ねぎをみじん切りにし、鍋にオリーブオイルとバターを熱して弱火で炒めます。', tip: '焦がさないよう弱火でじっくり' },
        { step: 3, text: '米（洗わない）を加え、油がなじむまで2分ほど炒めます。', tip: 'リゾット用のお米はアルボリオ米がベスト。なければコシヒカリでも代用可能' },
        { step: 4, text: '白ワインを加え、アルコールを飛ばします。', tip: null },
        { step: 5, text: '温かいブイヨンをお玉1杯分ずつ加え、吸収されたら次を加える、を繰り返します（約18分）。', tip: 'ブイヨンは必ず温めたものを使うこと。冷たいと温度が下がり米が開きません' },
        { step: 6, text: '途中でサフランを浸した液を加え、全体に黄金色を行き渡らせます。', tip: null },
        { step: 7, text: '火を止め、パルメザンチーズとバターを加えてよく混ぜ（マンテカトゥーラ）、2分蒸らして完成。', tip: '仕上げのバターとチーズがクリーミーさの決め手です' },
      ],
      meta_title: 'サフランリゾットの作り方 | 本格ミラノ風レシピ',
      meta_description: 'サフランの黄金色が美しい本格ミラノ風リゾット。プロのコツ付きで失敗しない作り方を丁寧に解説します。',
      keywords: ['サフラン', 'リゾット', 'イタリアン', 'サフランリゾット', 'ミラノ風'],
      cuisine: 'イタリアン',
      course: 'メイン',
      tips: 'リゾットは出来上がりをすぐに盛り付けることが大切。皿を温めておくと冷めにくくなります。サフランは高価ですが、ほんの少量で鮮やかな色と独特の風味が出ます。乾燥サフランを使う場合は、使用前に必ず温かい液体に浸してから使いましょう。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: true,
    },
    {
      slug: 'porcini-cream-pasta',
      title: 'ポルチーニのクリームパスタ',
      description: '乾燥ポルチーニの濃厚な旨味が溶け込んだ、贅沢なクリームパスタ。',
      introduction: 'イタリア料理で最も愛されるきのこ、ポルチーニ。乾燥ポルチーニの戻し汁には旨味が凝縮されており、これをソースのベースにすることで、レストラン級の深い味わいを実現できます。',
      prep_time_minutes: 15,
      cook_time_minutes: 15,
      total_time_minutes: 30,
      servings: 2,
      servings_unit: '人前',
      difficulty: 'easy',
      calories: 550,
      protein_g: 15,
      fat_g: 24,
      carbs_g: 68,
      fiber_g: 3,
      sodium_mg: 520,
      instructions: [
        { step: 1, text: '乾燥ポルチーニ（20g）をぬるま湯（200ml）に30分浸けて戻します。戻し汁は捨てずに取っておきます。', tip: '戻し汁こそが旨味の核。絶対に捨てないでください' },
        { step: 2, text: 'パスタを茹で始めます（表示時間より1分短く）。', tip: null },
        { step: 3, text: 'フライパンにオリーブオイルとニンニクのみじん切りを入れ、弱火で香りを出します。', tip: null },
        { step: 4, text: '戻したポルチーニを加え、中火で2分炒めます。', tip: null },
        { step: 5, text: 'ポルチーニの戻し汁を茶こしで濾しながら加え、半量になるまで煮詰めます。', tip: '底に砂が溜まることがあるので、最後の1cmは入れないのがコツ' },
        { step: 6, text: '生クリームを加え、軽くとろみがつくまで煮ます。', tip: null },
        { step: 7, text: '茹で上がったパスタを加え、パスタの茹で汁で濃度を調整。パルメザンチーズ、塩、黒胡椒で味を調えて完成。', tip: null },
      ],
      meta_title: 'ポルチーニのクリームパスタ | 乾燥ポルチーニで本格レシピ',
      meta_description: '乾燥ポルチーニの濃厚な旨味を活かしたクリームパスタのレシピ。戻し汁の使い方がプロの味の秘訣。',
      keywords: ['ポルチーニ', 'クリームパスタ', 'きのこパスタ', '乾燥ポルチーニ'],
      cuisine: 'イタリアン',
      course: 'メイン',
      tips: '乾燥ポルチーニは少量でも驚くほどの香りと旨味を出します。戻し汁は「天然の旨味だし」なので、余ったらリゾットやスープに活用できます。冷凍保存もOK。生のポルチーニが手に入ったら、厚めにスライスしてソテーするだけでも絶品です。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: true,
    },
    {
      slug: 'kohlrabi-slaw',
      title: 'コールラビのシャキシャキスロー',
      description: 'コールラビの食感を活かした爽やかなコールスロー。りんごとレモンで軽やかに。',
      introduction: 'ドイツ語で「キャベツのかぶ」を意味するコールラビ。生のままでも甘みがあり、シャキシャキとした食感が魅力です。りんごとレモンを合わせた爽やかなスローは、肉料理の付け合わせにぴったりです。',
      prep_time_minutes: 15,
      cook_time_minutes: 0,
      total_time_minutes: 15,
      servings: 4,
      servings_unit: '人前',
      difficulty: 'easy',
      calories: 85,
      protein_g: 2,
      fat_g: 4,
      carbs_g: 12,
      fiber_g: 3,
      sodium_mg: 180,
      instructions: [
        { step: 1, text: 'コールラビ（1個）の皮を厚めにむき、千切りにします。', tip: '皮の下の繊維質は硬いので、厚めにむくのがポイント' },
        { step: 2, text: 'りんご（1/2個）を薄切りにして千切りにします。', tip: 'りんごは変色防止にレモン汁をかけておく' },
        { step: 3, text: 'にんじん（1/2本）を千切りにします。', tip: null },
        { step: 4, text: 'ドレッシング：オリーブオイル大さじ2、レモン汁大さじ1、はちみつ小さじ1、塩少々をよく混ぜます。', tip: null },
        { step: 5, text: '全ての野菜を合わせ、ドレッシングで和えて完成。冷蔵庫で30分なじませるとさらに美味しくなります。', tip: '作り置きOK。冷蔵庫で2日間保存可能' },
      ],
      meta_title: 'コールラビのスローサラダ | シャキシャキ食感の簡単レシピ',
      meta_description: 'コールラビの食感が楽しい爽やかなスローサラダ。15分で作れる簡単レシピ。りんごとレモンで軽やかな味わいに。',
      keywords: ['コールラビ', 'スロー', 'サラダ', 'コールラビレシピ', '簡単'],
      cuisine: 'その他',
      course: '副菜',
      tips: 'コールラビは生で食べるのが最も食感を楽しめます。選ぶときは、ずっしりと重くて表面にツヤのあるものを。葉付きの場合、葉もケールのように炒めて食べられます。大きくなりすぎたものは繊維が硬いので、小〜中サイズがおすすめ。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: true,
    },
    {
      slug: 'elderflower-cordial',
      title: 'エルダーフラワーコーディアル',
      description: 'マスカットのような甘い香りのエルダーフラワーで作る、自家製シロップ。',
      introduction: 'ヨーロッパの初夏の風物詩、エルダーフラワー。その花を砂糖とレモンで漬け込んだコーディアル（濃縮シロップ）は、炭酸水やワインで割って楽しめます。フローラルで上品な香りは、一度味わうと忘れられません。',
      prep_time_minutes: 20,
      cook_time_minutes: 5,
      total_time_minutes: 25,
      servings: 10,
      servings_unit: '杯分',
      difficulty: 'easy',
      calories: 120,
      protein_g: 0,
      fat_g: 0,
      carbs_g: 30,
      fiber_g: 0,
      sodium_mg: 5,
      instructions: [
        { step: 1, text: 'エルダーフラワーの花房（20房ほど）を軽く振って虫を落とします。水洗いはしません。', tip: '水で洗うと花粉が落ちて香りが半減します' },
        { step: 2, text: '鍋に水1リットルと砂糖800gを入れ、火にかけて砂糖を完全に溶かします。', tip: null },
        { step: 3, text: '火を止め、レモン3個の皮と果汁、クエン酸大さじ1を加えます。', tip: 'レモンは国産無農薬のものを。輸入レモンの場合は皮をよく洗って' },
        { step: 4, text: 'エルダーフラワーの花房を加え、蓋をして常温で48時間置きます。1日1回かき混ぜます。', tip: null },
        { step: 5, text: '目の細かい布やガーゼで濾し、清潔な瓶に移して冷蔵庫で保存。炭酸水で5〜6倍に割ってお楽しみください。', tip: '冷蔵で1ヶ月、冷凍なら半年保存可能' },
      ],
      meta_title: 'エルダーフラワーコーディアルの作り方 | 自家製シロップレシピ',
      meta_description: 'エルダーフラワーの甘い花の香りを閉じ込めた自家製コーディアル。簡単な手順で作れる本格シロップレシピ。',
      keywords: ['エルダーフラワー', 'コーディアル', 'シロップ', '食用花', 'ドリンク'],
      cuisine: 'その他',
      course: 'ドリンク',
      tips: 'エルダーフラワーは5〜6月が旬。日本では一部のハーブ園やオンラインショップで手に入ります。ドライのエルダーフラワーでも作れますが、生花の方が圧倒的に香りが良いです。完成したコーディアルは、スパークリングワインに少量加えるとカクテルにもなります。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: false,
    },
    {
      slug: 'mukago-gohan',
      title: 'ムカゴの炊き込みご飯',
      description: '秋の味覚ムカゴをシンプルに味わう、素朴な炊き込みご飯。',
      introduction: '山芋の蔓にできる小さな実、ムカゴ。秋になると八百屋や道の駅で見かけるこの食材は、ホクホクとした食感と山芋に似た風味が特徴です。昆布と薄口醤油だけのシンプルな味付けで、ムカゴ本来の味を楽しみましょう。',
      prep_time_minutes: 10,
      cook_time_minutes: 40,
      total_time_minutes: 50,
      servings: 3,
      servings_unit: '合分',
      difficulty: 'easy',
      calories: 350,
      protein_g: 7,
      fat_g: 1,
      carbs_g: 75,
      fiber_g: 2,
      sodium_mg: 450,
      instructions: [
        { step: 1, text: '米3合を研ぎ、30分浸水させてからザルに上げます。', tip: null },
        { step: 2, text: 'ムカゴ（150g）を水でよく洗い、土やゴミを取り除きます。', tip: '皮はむかずにそのまま使います。皮ごとが風味の秘訣' },
        { step: 3, text: '炊飯器に米を入れ、薄口醤油大さじ2、酒大さじ1、塩小さじ1/2を加え、3合の目盛りまで水を入れます。', tip: null },
        { step: 4, text: '昆布（5cm角1枚）とムカゴを上にのせ、通常モードで炊飯します。', tip: '具材は混ぜずに上にのせて炊くのがポイント' },
        { step: 5, text: '炊き上がったら昆布を取り出し、全体をさっくり混ぜて5分蒸らして完成。', tip: null },
      ],
      meta_title: 'ムカゴの炊き込みご飯 | 秋の味覚を楽しむ簡単レシピ',
      meta_description: '秋の味覚ムカゴをシンプルに味わう炊き込みご飯。ホクホク食感と山芋のような風味が楽しめる素朴な一品。',
      keywords: ['ムカゴ', '炊き込みご飯', '秋の味覚', '山菜', '和食'],
      cuisine: '和食',
      course: 'メイン',
      tips: 'ムカゴは10〜11月が旬。道の駅やJAの直売所でよく見かけます。選ぶときは粒が揃っていて、シワのないものを。余ったムカゴは塩茹でにしておつまみにしたり、バター醤油で炒めても絶品です。冷凍保存も可能（約1ヶ月）。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: false,
    },
    {
      slug: 'beets-borscht',
      title: 'ビーツのボルシチ',
      description: '鮮やかな赤色が美しいウクライナの伝統スープ。サワークリームを添えて。',
      introduction: 'ビーツの深い赤色と甘みが特徴のボルシチは、東ヨーロッパを代表する料理です。牛肉と野菜を煮込んだコクのあるスープに、仕上げのサワークリームが酸味とクリーミーさを加えます。寒い日にぴったりの一品です。',
      prep_time_minutes: 20,
      cook_time_minutes: 60,
      total_time_minutes: 80,
      servings: 4,
      servings_unit: '人前',
      difficulty: 'medium',
      calories: 320,
      protein_g: 22,
      fat_g: 12,
      carbs_g: 28,
      fiber_g: 5,
      sodium_mg: 720,
      instructions: [
        { step: 1, text: '牛すね肉（300g）を大きめに切り、鍋に水1.5リットルと入れて火にかけ、アクを取りながら弱火で40分煮ます。', tip: 'アクをこまめに取ると澄んだスープになります' },
        { step: 2, text: 'ビーツ（2個）は皮をむいて千切りにします。', tip: 'ビーツの汁で手が染まるので、使い捨て手袋がおすすめ' },
        { step: 3, text: '玉ねぎ、にんじん、じゃがいも、キャベツをそれぞれ食べやすい大きさに切ります。', tip: null },
        { step: 4, text: 'フライパンにバターを溶かし、玉ねぎ、にんじん、ビーツを炒めます。トマトペースト大さじ2を加えて混ぜます。', tip: null },
        { step: 5, text: '肉のスープに炒めた野菜とじゃがいもを加え、さらに20分煮ます。', tip: null },
        { step: 6, text: 'キャベツを加えて5分煮て、塩・胡椒で味を調え、酢小さじ1で味を引き締めます。', tip: '酢を最後に加えることでビーツの色が鮮やかに保たれます' },
        { step: 7, text: '器に盛り、サワークリームとディルを添えて完成。', tip: null },
      ],
      meta_title: 'ビーツのボルシチの作り方 | 本格ウクライナ風レシピ',
      meta_description: 'ビーツの美しい赤色が映えるボルシチのレシピ。牛肉の旨味とビーツの甘みが調和した、本格的な東ヨーロッパの伝統スープ。',
      keywords: ['ビーツ', 'ボルシチ', 'ウクライナ料理', 'スープ', '冬のレシピ'],
      cuisine: 'その他',
      course: 'スープ',
      tips: 'ビーツは真空パックの水煮を使うと手軽ですが、生のビーツを使った方が色も味も格段に良くなります。日本では11〜12月が旬で、最近はスーパーでも見かけるようになりました。残ったボルシチは翌日さらに美味しくなるので、多めに作るのがおすすめ。',
      status: 'published',
      published_at: new Date().toISOString(),
      featured: true,
    },
  ]

  for (const recipe of recipes) {
    const { data: recipeRow, error: recipeError } = await supabase
      .from('recipes')
      .upsert(recipe, { onConflict: 'slug' })
      .select('id')
      .single()

    if (recipeError) {
      console.error(`✗ Recipe ${recipe.slug}: ${recipeError.message}`)
      continue
    }
    console.log(`✓ Recipe: ${recipe.title}`)

    // Add hero image
    const imageUrl = `https://abhrgewzglubansbyitm.supabase.co/storage/v1/object/public/recipi-images/recipes/${recipe.slug}.png`
    await supabase.from('recipe_images').delete().eq('recipe_id', recipeRow.id)
    const { error: imgError } = await supabase.from('recipe_images').insert({
      recipe_id: recipeRow.id,
      url: imageUrl,
      alt_text: recipe.title,
      is_hero: true,
      display_order: 0,
    })
    if (imgError) console.error(`  ✗ Image: ${imgError.message}`)
    else console.log(`  → Hero image set`)

    // Link ingredients
    const ingredientMap: Record<string, Array<{ name: string; slug: string; quantity: string; unit: string; preparation?: string; group_name?: string }>> = {
      'saffron-risotto': [
        { name: 'サフラン', slug: 'saffron', quantity: 'ひとつまみ', unit: '' },
        { name: 'アルボリオ米', slug: 'arborio-rice', quantity: '200', unit: 'g' },
        { name: '玉ねぎ', slug: 'onion', quantity: '1/2', unit: '個', preparation: 'みじん切り' },
        { name: 'チキンブイヨン', slug: 'chicken-bouillon', quantity: '800', unit: 'ml' },
        { name: '白ワイン', slug: 'white-wine', quantity: '100', unit: 'ml' },
        { name: 'パルメザンチーズ', slug: 'parmesan', quantity: '50', unit: 'g', preparation: 'すりおろし' },
        { name: 'バター', slug: 'butter', quantity: '30', unit: 'g' },
        { name: 'オリーブオイル', slug: 'olive-oil', quantity: '大さじ1', unit: '' },
      ],
      'porcini-cream-pasta': [
        { name: 'ポルチーニ', slug: 'porcini', quantity: '20', unit: 'g' },
        { name: 'パスタ', slug: 'pasta', quantity: '200', unit: 'g' },
        { name: 'ニンニク', slug: 'garlic', quantity: '1', unit: '片', preparation: 'みじん切り' },
        { name: '生クリーム', slug: 'heavy-cream', quantity: '150', unit: 'ml' },
        { name: 'パルメザンチーズ', slug: 'parmesan', quantity: '30', unit: 'g' },
        { name: 'オリーブオイル', slug: 'olive-oil', quantity: '大さじ1', unit: '' },
      ],
      'kohlrabi-slaw': [
        { name: 'コールラビ', slug: 'kohlrabi', quantity: '1', unit: '個' },
        { name: 'りんご', slug: 'apple', quantity: '1/2', unit: '個' },
        { name: 'にんじん', slug: 'carrot', quantity: '1/2', unit: '本', preparation: '千切り' },
        { name: 'レモン', slug: 'lemon', quantity: '1/2', unit: '個', preparation: '果汁' },
        { name: 'オリーブオイル', slug: 'olive-oil', quantity: '大さじ2', unit: '' },
        { name: 'はちみつ', slug: 'honey', quantity: '小さじ1', unit: '' },
      ],
      'elderflower-cordial': [
        { name: 'エルダーフラワー', slug: 'elderflower', quantity: '20', unit: '房' },
        { name: '砂糖', slug: 'sugar', quantity: '800', unit: 'g' },
        { name: 'レモン', slug: 'lemon', quantity: '3', unit: '個' },
        { name: 'クエン酸', slug: 'citric-acid', quantity: '大さじ1', unit: '' },
      ],
      'mukago-gohan': [
        { name: 'ムカゴ', slug: 'mukago', quantity: '150', unit: 'g' },
        { name: '米', slug: 'rice', quantity: '3', unit: '合' },
        { name: '昆布', slug: 'kombu', quantity: '5cm角1', unit: '枚' },
        { name: '薄口醤油', slug: 'light-soy-sauce', quantity: '大さじ2', unit: '' },
        { name: '酒', slug: 'sake', quantity: '大さじ1', unit: '' },
      ],
      'beets-borscht': [
        { name: 'ビーツ', slug: 'beets', quantity: '2', unit: '個', preparation: '千切り' },
        { name: '牛すね肉', slug: 'beef-shank', quantity: '300', unit: 'g' },
        { name: '玉ねぎ', slug: 'onion', quantity: '1', unit: '個' },
        { name: 'にんじん', slug: 'carrot', quantity: '1', unit: '本' },
        { name: 'じゃがいも', slug: 'potato', quantity: '2', unit: '個' },
        { name: 'キャベツ', slug: 'cabbage', quantity: '1/4', unit: '個' },
        { name: 'トマトペースト', slug: 'tomato-paste', quantity: '大さじ2', unit: '' },
        { name: 'サワークリーム', slug: 'sour-cream', quantity: '適量', unit: '', group_name: 'トッピング' },
        { name: 'ディル', slug: 'dill', quantity: '適量', unit: '', group_name: 'トッピング' },
      ],
    }

    const ingredients = ingredientMap[recipe.slug]
    if (ingredients && recipeRow) {
      // Clear existing
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeRow.id)

      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i]

        // Ensure ingredient exists
        const { data: existing } = await supabase
          .from('ingredients')
          .select('id')
          .eq('slug', ing.slug)
          .single()

        let ingredientId: number
        if (existing) {
          ingredientId = existing.id
        } else {
          const { data: created, error: createErr } = await supabase
            .from('ingredients')
            .insert({ slug: ing.slug, name: ing.name, is_niche: false })
            .select('id')
            .single()
          if (createErr || !created) {
            console.error(`  ✗ Ingredient ${ing.name}: ${createErr?.message}`)
            continue
          }
          ingredientId = created.id
        }

        await supabase.from('recipe_ingredients').insert({
          recipe_id: recipeRow.id,
          ingredient_id: ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          preparation: ing.preparation || null,
          is_optional: false,
          display_order: i,
          group_name: ing.group_name || null,
        })
      }
      console.log(`  → Linked ${ingredients.length} ingredients`)
    }
  }
}

async function main() {
  console.log('Seeding Recipi data...\n')
  await seedCategories()
  await seedNicheIngredients()
  await seedAllIngredients()
  await seedSampleRecipes()
  console.log('\nDone!')
}

main().catch(console.error)
