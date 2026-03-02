-- =============================================
-- Update existing recipes with base_dish and variant titles
-- =============================================

UPDATE recipi.recipes SET base_dish = 'nikujaga', title = '肉じゃが（定番甘辛）' WHERE slug = 'nikujaga';
UPDATE recipi.recipes SET base_dish = 'karaage', title = '唐揚げ（定番醤油）' WHERE slug = 'karaage';
UPDATE recipi.recipes SET base_dish = 'oyakodon', title = '親子丼（定番だし仕立て）' WHERE slug = 'oyakodon';
UPDATE recipi.recipes SET base_dish = 'tonjiru', title = '豚汁（定番味噌）' WHERE slug = 'tonjiru';
UPDATE recipi.recipes SET base_dish = 'shogayaki', title = '豚の生姜焼き（定番醤油だれ）' WHERE slug = 'pork-shogayaki';
UPDATE recipi.recipes SET base_dish = 'dashimaki', title = 'だし巻き卵（定番かつお出汁）' WHERE slug = 'dashimaki-tamago';
UPDATE recipi.recipes SET base_dish = 'misoshiru', title = '味噌汁（豆腐とわかめ）' WHERE slug = 'miso-soup-tofu-wakame';
UPDATE recipi.recipes SET base_dish = 'mapo-tofu', title = '麻婆豆腐（四川風ピリ辛）' WHERE slug = 'mapo-tofu';
UPDATE recipi.recipes SET base_dish = 'gyoza', title = '餃子（定番焼き餃子）' WHERE slug = 'gyoza';
UPDATE recipi.recipes SET base_dish = 'chahan', title = '炒飯（定番醤油）' WHERE slug = 'chahan';
UPDATE recipi.recipes SET base_dish = 'ebi-chili', title = 'エビチリ（定番ケチャップ）' WHERE slug = 'ebi-chili';
UPDATE recipi.recipes SET base_dish = 'carbonara', title = 'カルボナーラ（クラシック）' WHERE slug = 'carbonara';
UPDATE recipi.recipes SET base_dish = 'bolognese', title = 'ボロネーゼ（定番トマト）' WHERE slug = 'bolognese';
UPDATE recipi.recipes SET base_dish = 'bibimbap', title = 'ビビンバ（定番石焼き）' WHERE slug = 'bibimbap';
UPDATE recipi.recipes SET base_dish = 'kimchi-jjigae', title = 'キムチチゲ（定番豚バラ）' WHERE slug = 'kimchi-jjigae';
UPDATE recipi.recipes SET base_dish = 'green-curry', title = 'グリーンカレー（定番チキン）' WHERE slug = 'green-curry';
UPDATE recipi.recipes SET base_dish = 'gapao', title = 'ガパオライス（定番鶏ひき肉）' WHERE slug = 'gapao-rice';
UPDATE recipi.recipes SET base_dish = 'pudding', title = 'プリン（定番カスタード）' WHERE slug = 'custard-pudding';
UPDATE recipi.recipes SET base_dish = 'ratatouille', title = 'ラタトゥイユ（クラシック）' WHERE slug = 'ratatouille';
UPDATE recipi.recipes SET base_dish = 'pot-au-feu', title = 'ポトフ（定番コンソメ）' WHERE slug = 'pot-au-feu';