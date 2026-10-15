import type { GearItem, Location } from '../engine/types'

// Verified against the RQG core rulebook: weapon tables (pp.208-209, 212), weapon/shield/armor prices
// (pp.210-218), and the Equipment & Wealth price lists (pp.408-413). Costs in Lunars (1 L = 10 clacks).
// Damage excludes damage bonus. ENC shown in the book in parentheses "(n)" means n items per 1 ENC, stored as 1/n.

const W = (id: string, name: string, category: 'melee' | 'missile' | 'shield', skill: string, damage: string, sr: number | undefined, hp: number | undefined, enc: number, cost: number, range?: number): GearItem =>
  ({ id, name, category, skill, damage, sr, hp, enc, cost, range })

const ARMS: Location[] = ['rarm', 'larm']
const LEGS: Location[] = ['rleg', 'lleg']
const A = (id: string, name: string, ap: number, enc: number, cost: number, covers: Location[], mqPenalty = 0): GearItem =>
  ({ id, name, category: 'armor', ap, enc, cost, covers, ...(mqPenalty ? { mqPenalty } : {}) })

// General equipment. The book gives no ENC for most goods; those are recorded as ENC 0.
const G = (group: string, id: string, name: string, cost: number, costMax?: number, enc = 0): GearItem =>
  ({ id, name, category: 'gear', group, cost, enc, ...(costMax !== undefined ? { costMax } : {}) })
const C = (clacks: number) => clacks / 10

export const GEAR: GearItem[] = [
  // Melee
  W('battle_axe', 'Battle Axe', 'melee', 'battle_axe_1h', '1D8+2', 3, 8, 2, 20),
  W('small_axe', 'Small Axe', 'melee', 'small_axe', '1D6+1', 4, 6, 1, 15),
  W('great_axe', 'Great Axe', 'melee', 'great_axe', '2D6+2', 2, 10, 2, 30),
  W('dagger_axe', 'Dagger Axe', 'melee', 'dagger_axe', '3D6', 1, 10, 3, 75),
  W('dagger', 'Dagger', 'melee', 'dagger', '1D4+2', 4, 6, 0.25, 10),
  W('parrying_dagger', 'Parrying Dagger', 'melee', 'dagger', '1D4+2', 4, 8, 0.33, 20),
  W('sickle', 'Sickle', 'melee', 'sickle', '1D6+1', 3, 6, 1, 15),
  W('broadsword', 'Broadsword', 'melee', 'broadsword', '1D8+1', 2, 12, 1, 50),
  W('kopis', 'Kopis', 'melee', 'kopis', '1D8+1', 2, 12, 1, 50),
  W('rapier', 'Rapier', 'melee', 'rapier', '1D6+1', 2, 8, 1, 100),
  W('shortsword', 'Shortsword', 'melee', 'shortsword', '1D6+1', 3, 12, 1, 25),
  W('greatsword', 'Greatsword', 'melee', 'greatsword', '2D8', 1, 12, 2, 100),
  W('rhomphaia', 'Rhomphaia', 'melee', 'rhomphaia', '2D6+2', 2, 10, 2, 50),
  W('sickle_sword', 'Sickle-sword (Moonsword)', 'melee', 'sickle_sword', '1D10+1', 2, 12, 1, 60),
  W('war_hammer', 'War Hammer', 'melee', 'war_hammer', '1D6+2', 3, 10, 1, 20),
  W('great_hammer', 'Great Hammer', 'melee', 'great_hammer', '2D6+2', 1, 5, 3, 15),
  W('maul', 'Maul', 'melee', 'maul', '2D8', 1, 12, 5, 20),
  W('club', 'Wooden Club', 'melee', 'club', '1D6', 4, 4, 0.5, 0),
  W('heavy_mace', 'Heavy Mace', 'melee', 'heavy_mace', '1D8+2', 3, 10, 2, 20),
  W('light_mace', 'Light Mace', 'melee', 'light_mace', '1D6+2', 3, 6, 1, 10),
  W('singlestick', 'Singlestick', 'melee', 'singlestick', '1D6', 4, 5, 0.5, 1),
  W('mace_2h', 'Two-Handed Mace', 'melee', 'mace_2h', '1D8+2', 3, 10, 2, 25),
  W('quarterstaff', 'Quarterstaff', 'melee', 'quarterstaff', '1D8', 0, 8, 2, 5),
  // Shortspear: 1D6+1 / SR 2 one-handed; 1D8+1 / SR 1 two-handed (2H Spear skill); thrown 1D6+1, 20 m.
  W('shortspear', 'Shortspear', 'melee', 'shortspear_1h', '1D6+1', 2, 10, 2, 15),
  W('longspear', 'Longspear', 'melee', 'longspear', '1D10+1', 0, 10, 3, 20),
  W('pike', 'Pike', 'melee', 'pike', '2D6+1', 0, 12, 3, 25),
  W('lance', 'Lance', 'melee', 'lance', '1D10+1', 0, 10, 3, 25),
  W('light_cestus', 'Light Cestus', 'melee', 'fist', '1D3+1', 4, 4, 0.5, 10),
  W('heavy_cestus', 'Heavy Cestus', 'melee', 'fist', '1D3+2', 4, 8, 1, 20),
  W('claw', 'Claw', 'melee', 'fist', '1D4+1', 4, undefined, 1, 25),

  // Missile (range in meters; damage bonus is halved for thrown weapons and slings)
  // Javelin in melee: 1D6, SR 2, 1H Spear (Javelin) skill.
  W('javelin', 'Javelin', 'missile', 'javelin', '1D10', undefined, 8, 1, 35, 20),
  W('dart', 'Dart', 'missile', 'dart', '1D6', undefined, 4, 0.5, 25, 20),
  W('atlatl', 'Atlatl (+10 m range)', 'missile', 'atlatl', '+1D6', undefined, 6, 0.5, 10),
  W('throwing_axe', 'Throwing Axe', 'missile', 'thrown_axe', '1D6', undefined, 6, 1, 15, 20),
  // Melee table lists the throwing dagger at (6) per ENC, the missile table at (4).
  W('throwing_dagger', 'Throwing Dagger', 'missile', 'thrown_dagger', '1D4', undefined, 6, 0.17, 20, 20),
  W('rock', 'Rock', 'missile', 'thrown_rock', '1D4', undefined, undefined, 0.25, 0, 20),
  W('self_bow', 'Self Bow', 'missile', 'self_bow', '1D6+1', undefined, 5, 2, 50, 80),
  W('composite_bow', 'Composite Bow', 'missile', 'composite_bow', '1D8+1', undefined, 7, 2, 150, 100),
  W('light_crossbow', 'Light Crossbow', 'missile', 'crossbow', '2D4+2', undefined, 6, 2, 80, 100),
  W('heavy_crossbow', 'Heavy Crossbow', 'missile', 'crossbow', '2D6+2', undefined, 10, 2, 100, 120),
  W('arbalest', 'Arbalest', 'missile', 'arbalest', '3D6+1', undefined, 10, 3, 150, 150),
  W('sling', 'Sling', 'missile', 'sling', '1D8', undefined, undefined, 1, 1, 80),
  W('staff_sling', 'Staff Sling', 'missile', 'staff_sling', '1D10', undefined, 8, 2, 10, 100),
  W('pole_lasso', 'Pole Lasso', 'missile', 'pole_lasso', '—', undefined, 4, 3, 7, 3),

  // Shields (stats by size: small STR 5+, medium STR 9+, large STR 12+)
  W('shield_small', 'Small Wooden Shield', 'shield', 'shield_small', '1D3', 3, 8, 1, 4),
  W('shield_small_hide', 'Small Hide Shield', 'shield', 'shield_small', '1D3', 3, 8, 1, C(8)),
  W('shield_medium', 'Medium Wooden Shield', 'shield', 'shield_medium', '1D4', 3, 12, 2, 12),
  W('shield_medium_hide', 'Medium Hide Shield', 'shield', 'shield_medium', '1D4', 3, 12, 2, C(14)),
  W('shield_medium_wicker', 'Medium Wicker Shield', 'shield', 'shield_medium', '1D4', 3, 12, 2, 1),
  W('shield_large', 'Large Wooden Shield', 'shield', 'shield_large', '1D6', 3, 16, 3, 40),
  W('shield_large_hide', 'Large Hide Shield', 'shield', 'shield_large', '1D6', 3, 16, 3, C(25)),
  W('shield_large_wicker', 'Large Wicker Shield', 'shield', 'shield_large', '1D6', 3, 16, 3, 5),

  // Armor (last number: Move Quietly penalty)
  A('leather_hood', 'Leather Hood', 1, 0.5, 3, ['head']),
  A('broad_brimmed_hat', 'Broad-brimmed Leather Hat', 1, 0.5, 4, ['head']),
  A('leather_cap', 'Leather Cap', 2, 0.5, 5, ['head']),
  A('composite_helm', 'Composite Helm', 3, 0.5, 10, ['head']),
  A('open_helm', 'Open Helm', 4, 1, 20, ['head']),
  A('closed_helm', 'Closed Helm', 5, 1, 30, ['head']),
  A('full_helm', 'Full Helm', 6, 2, 50, ['head']),
  A('light_scale_sleeves', 'Light Scale Sleeves', 4, 2, 25, ARMS, 15),
  A('heavy_scale_sleeves', 'Heavy Scale Sleeves', 5, 3, 50, ARMS, 15),
  A('leather_vambraces', 'Leather Vambraces', 1, 0, 10, ARMS),
  A('cuirboilli_vambraces', 'Cuirboilli Vambraces', 3, 1, 30, ARMS),
  A('bronze_vambraces', 'Bronze Plate Vambraces', 6, 2, 100, ARMS, 10),
  A('leather_cuirass', 'Leather Cuirass', 1, 1, 10, ['chest']),
  A('heavy_leather_cuirass', 'Heavy Leather Cuirass', 2, 1, 20, ['chest']),
  A('ring_cuirass', 'Ring Mail Cuirass', 4, 1, 50, ['chest'], 5),
  A('turtleshell_cuirass', 'Turtleshell Cuirass', 4, 1, 15, ['chest']),
  A('light_scale_cuirass', 'Light Scale Cuirass', 4, 1, 25, ['chest'], 10),
  A('heavy_scale_cuirass', 'Heavy Scale Cuirass', 5, 3, 40, ['chest'], 25),
  A('disk_plate', 'Bronze Disk Plate', 5, 2, 100, ['chest'], 15),
  A('bronze_cuirass', 'Bronze Plate Cuirass', 6, 3, 175, ['chest'], 15),
  A('quilted_linothorax', 'Quilted Linothorax', 2, 1, 20, ['abdomen', 'chest']),
  A('linen_linothorax', 'Linen Linothorax', 3, 1, 30, ['abdomen', 'chest'], 5),
  A('leather_hauberk', 'Leather Hauberk', 1, 0.5, 20, ['abdomen', 'chest']),
  A('heavy_leather_hauberk', 'Heavy Leather Hauberk', 2, 1, 40, ['abdomen', 'chest']),
  A('ring_hauberk', 'Ring Mail Hauberk', 4, 2, 80, ['abdomen', 'chest'], 15),
  A('light_scale_hauberk', 'Light Scale Hauberk', 4, 2, 40, ['abdomen', 'chest'], 20),
  A('heavy_scale_hauberk', 'Heavy Scale Hauberk', 5, 3, 65, ['abdomen', 'chest'], 25),
  A('segmented_plate', 'Segmented Bronze Plate', 6, 5, 300, ['abdomen', 'chest'], 50),
  A('leather_skirts', 'Leather Skirts', 1, 0.5, 10, ['abdomen']),
  A('linen_skirts', 'Linen Skirts', 3, 1, 20, ['abdomen']),
  A('studded_skirts', 'Studded Leather Skirts', 3, 1, 20, ['abdomen'], 5),
  A('light_scale_skirts', 'Light Scale Skirts', 4, 2, 30, ['abdomen'], 15),
  A('heavy_scale_skirts', 'Heavy Scale Skirts', 5, 3, 60, ['abdomen'], 30),
  A('leather_trews', 'Leather Trews', 1, 0.5, 10, ['abdomen', ...LEGS]),
  A('heavy_leather_trews', 'Heavy Leather Trews', 2, 1, 20, ['abdomen', ...LEGS]),
  A('leather_greaves', 'Leather Greaves', 1, 0.5, 15, LEGS),
  A('cuirboilli_greaves', 'Cuirboilli Greaves', 3, 1, 40, LEGS),
  A('bronze_greaves', 'Bronze Plate Greaves', 6, 2, 120, LEGS, 15),

  // ---- General equipment ----
  // Missile accessories (p.213; price includes arrows/bolts)
  G('Missile Accessories', 'quiver_small', 'Quiver, Small (12)', 6, undefined, 0.5),
  G('Missile Accessories', 'quiver_medium', 'Quiver, Medium (24)', 12, undefined, 1),
  G('Missile Accessories', 'quiver_large', 'Quiver, Large (40)', 16, undefined, 2),

  // Clothing (pp.408-409). Suit price by material; dyed or embroidered doubles, exotic dyes x10; kaftan x3.
  G('Clothing', 'clothes_cotton', 'Suit of Clothes (Cotton)', 2),
  G('Clothing', 'clothes_hide', 'Suit of Clothes (Tanned Hide)', 1),
  G('Clothing', 'clothes_leather', 'Suit of Clothes (Leather)', 4),
  G('Clothing', 'clothes_linen', 'Suit of Clothes (Linen)', 2),
  G('Clothing', 'clothes_linen_imported', 'Suit of Clothes (Imported Linen)', 5),
  G('Clothing', 'clothes_silk', 'Suit of Clothes (Silk)', 20),
  G('Clothing', 'clothes_wool', 'Suit of Clothes (Wool)', 3),
  G('Clothing', 'sword_belt', 'Sword Belt', 1),
  G('Clothing', 'esrolian_bodice', 'Esrolian Bodice', 15, 35),
  G('Clothing', 'boots', 'Boots', 1),
  G('Clothing', 'cloak_grass', 'Grass Cloak', C(2)),
  G('Clothing', 'cloak_hide', 'Hide Cloak', C(5), 1),
  G('Clothing', 'esrolian_dress', 'Esrolian Dress', 15, 35),
  G('Clothing', 'esrolian_sheath', 'Esrolian Sheath Dress', 10, 40),
  G('Clothing', 'girdle', 'Girdle', 1),
  G('Clothing', 'hat_broad', 'Broad Hat (felt)', C(10)),
  G('Clothing', 'headdress_tall', 'Tall Headdress', 10, 100),
  G('Clothing', 'leggings', 'Leggings', 4),
  G('Clothing', 'sandals', 'Sandals', C(5)),
  G('Clothing', 'veil', 'Veil', C(2), 5),
  G('Clothing', 'winter_cloak_antelope', 'Winter Cloak (Antelope)', 2),
  G('Clothing', 'winter_cloak_bison', 'Winter Cloak (Bison)', 3),
  G('Clothing', 'winter_cloak_high_llama', 'Winter Cloak (High Llama)', 5),
  G('Clothing', 'winter_cloak_impala', 'Winter Cloak (Impala)', 2),
  G('Clothing', 'winter_cloak_wool', 'Winter Cloak (Wool)', 2),
  G('Clothing', 'winter_cloak_woven_hair', 'Winter Cloak (Woven Hair)', 10),
  G('Clothing', 'winter_cloak_zebra', 'Winter Cloak (Zebra)', 6),

  // Cosmetics (p.409)
  G('Cosmetics', 'henna', 'Henna (application)', C(5)),
  G('Cosmetics', 'kohl', 'Kohl (small container)', C(5)),
  G('Cosmetics', 'perfume', 'Perfume (application)', C(1), 1),

  // Jewelry (p.409)
  G('Jewelry', 'armband_gold', 'Gold Armband', 750),
  G('Jewelry', 'bracelet_bronze', 'Bronze Spiral Bracelet', 20),
  G('Jewelry', 'bracelet_gold', 'Gold Spiral Bracelet', 300),
  G('Jewelry', 'bracelet_gold_heavy', 'Heavy Gold Multi-Spiraled Bracelet', 3000),
  G('Jewelry', 'bracelet_silver', 'Silver Spiral Bracelet', 50),
  G('Jewelry', 'earrings_gold', 'Gold Earrings', 50),
  G('Jewelry', 'earrings_bronze', 'Bronze or Copper Spiral Earrings', 20),
  G('Jewelry', 'earrings_gold_elaborate', 'Elaborate Gold Earrings', 100),
  G('Jewelry', 'fibula_bronze', 'Bronze Fibula', 10),
  G('Jewelry', 'fibula_silver', 'Silver Fibula', 100),
  G('Jewelry', 'necklace_gold_beaded', 'Beaded Gold Necklace', 300),
  G('Jewelry', 'necklace_gold_pendant', 'Gold Necklace with Gemstone Pendant', 750),
  G('Jewelry', 'pectoral_gold', 'Gold Pectoral', 1000, 2000),
  G('Jewelry', 'ring_silver', 'Simple Silver Ring', 5),
  G('Jewelry', 'ring_gold', 'Simple Gold Ring', 25),
  G('Jewelry', 'ring_gold_heavy', 'Heavy Gold Ring', 50),
  G('Jewelry', 'ring_gold_gem', 'Gold Ring with Gemstone', 60),
  G('Jewelry', 'ring_gold_seal', 'Gold Ring with Carved Gemstone Seal', 100),
  G('Jewelry', 'torc_bronze', 'Bronze Torc', 20),
  G('Jewelry', 'torc_gold', 'Gold Torc', 750, 1500),

  // Meat beasts (p.410)
  G('Meat Beasts', 'meat_cow', 'Cow', 20),
  G('Meat Beasts', 'meat_bull', 'Bull', 30),
  G('Meat Beasts', 'meat_sheep', 'Sheep', 3),
  G('Meat Beasts', 'meat_bison', 'Bison', 20),
  G('Meat Beasts', 'meat_herd_man', 'Herd-man', 6),
  G('Meat Beasts', 'meat_high_llama', 'High Llama', 30),
  G('Meat Beasts', 'meat_horse', 'Horse', 40),
  G('Meat Beasts', 'meat_impala', 'Impala', 5),
  G('Meat Beasts', 'meat_sable', 'Sable Antelope', 15),
  G('Meat Beasts', 'meat_zebra', 'Zebra', 45),
  G('Meat Beasts', 'pig', 'Pig (yearling)', 2),
  G('Meat Beasts', 'duck', 'Domestic Duck', C(1)),
  G('Meat Beasts', 'chicken', 'Chicken', C(1)),
  G('Meat Beasts', 'goose', 'Goose', C(3)),

  // Riding beasts (p.410)
  G('Riding Beasts', 'riding_bison', 'Bison (riding)', 30),
  G('Riding Beasts', 'riding_herd_man', 'Herd-man, Trained', 15),
  G('Riding Beasts', 'riding_high_llama', 'High Llama (riding)', 55),
  G('Riding Beasts', 'riding_daron', 'Daron Horse (riding)', 75),
  G('Riding Beasts', 'riding_galana', 'Galana Pony (riding)', 50),
  G('Riding Beasts', 'riding_goldeneye', 'Goldeneye Horse (riding)', 350),
  G('Riding Beasts', 'riding_sered', 'Sered Horse (riding)', 65),
  G('Riding Beasts', 'riding_impala', 'Impala (riding)', 10),
  G('Riding Beasts', 'riding_mule', 'Mule', 35),
  G('Riding Beasts', 'riding_sable', 'Sable Antelope (riding)', 25),
  G('Riding Beasts', 'riding_zebra', 'Zebra (riding)', 70),

  // Cavalry beasts (p.410)
  G('Cavalry Beasts', 'cavalry_daron', 'Daron Horse (cavalry)', 150),
  G('Cavalry Beasts', 'cavalry_galana', 'Galana Pony (cavalry)', 100),
  G('Cavalry Beasts', 'cavalry_goldeneye', 'Goldeneye Horse (cavalry)', 700),
  G('Cavalry Beasts', 'cavalry_sered', 'Sered Horse (cavalry)', 130),
  G('Cavalry Beasts', 'cavalry_impala', 'Impala (cavalry)', 20),
  G('Cavalry Beasts', 'cavalry_sable', 'Sable Antelope (cavalry)', 50),
  G('Cavalry Beasts', 'cavalry_zebra', 'Zebra (cavalry)', 140),

  // War beasts (p.410; "+" prices recorded at their minimum)
  G('War Beasts', 'war_bison', 'Bison (war)', 90),
  G('War Beasts', 'war_herd_man', 'Herd-man (war)', 45),
  G('War Beasts', 'war_high_llama', 'High Llama (war)', 165),
  G('War Beasts', 'war_daron', 'Daron Horse (war)', 225),
  G('War Beasts', 'war_galana', 'Galana Pony (war)', 150),
  G('War Beasts', 'war_goldeneye', 'Goldeneye Horse (war)', 1000),
  G('War Beasts', 'war_sered', 'Sered Horse (war)', 195),
  G('War Beasts', 'war_rhino', 'Rhino (war, extremely rare)', 1000),
  G('War Beasts', 'war_sable', 'Sable Antelope (war)', 75),
  G('War Beasts', 'war_zebra', 'Zebra (war)', 210),

  // Other animals (p.411)
  G('Other Animals', 'house_cat', 'House Cat', 1),
  G('Other Animals', 'kaga', 'Kaga (gecko)', C(2)),
  G('Other Animals', 'mongoose', 'Mongoose', 1),
  G('Other Animals', 'prax_hound', 'Prax Hound', 2),
  G('Other Animals', 'song_bird', 'Song Bird', 3),
  G('Other Animals', 'wild_hawk', 'Wild Hawk', 35),

  // Riding gear and conveyances (p.411)
  G('Riding Gear', 'saddle', 'Saddle', 1, 15),
  G('Riding Gear', 'tack', 'Tack', 1, 5),
  G('Conveyances', 'boat_ten', 'Boat, Ten-man', 20),
  G('Conveyances', 'boat_three', 'Boat, Three-man (reed)', 5),
  G('Conveyances', 'cart', 'Cart, Two-wheeled', 4),
  G('Conveyances', 'chariot', 'Chariot, Two-wheeled', 200),
  G('Conveyances', 'palanquin', 'Palanquin', 5, 20),
  G('Conveyances', 'wagon', 'Wagon, Four-wheeled', 10),

  // Tools (pp.411-412)
  G('Tools', 'fish_hooks', 'Fish Hooks', C(1)),
  G('Tools', 'hammer', 'Hammer', C(4)),
  G('Tools', 'stone_knife', 'Stone Knife', C(1)),
  G('Tools', 'hasp_lock', 'Hasp Lock', 1, 25),
  G('Tools', 'mallet', 'Mallet', C(6)),
  G('Tools', 'papyrus', 'Papyrus (sheet)', C(1)),
  G('Tools', 'papyrus_large', 'Papyrus, Large (sheet)', C(3)),
  G('Tools', 'parchment', 'Hide Parchment (sheet)', C(1)),
  G('Tools', 'pick', 'Pick', 10),
  G('Tools', 'rope', 'Rope, 15 m', C(2)),
  G('Tools', 'shovel', 'Shovel', 1, 5),
  G('Tools', 'tools_stonemason', 'Stonemason Tools', 25),
  G('Tools', 'tools_woodworking', 'Woodworking Tools', 20),
  G('Tools', 'tools_writing', 'Writing Tools', C(4)),

  // Expedition gear (p.412)
  G('Expedition Gear', 'backpack', 'Backpack', 1),
  G('Expedition Gear', 'blanket', 'Blanket (hide)', C(2)),
  G('Expedition Gear', 'candle', 'Candle', C(1)),
  G('Expedition Gear', 'climbers_pack', 'Climber’s Pack', 2),
  G('Expedition Gear', 'cooking_gear', 'Cooking Gear', 2),
  G('Expedition Gear', 'firestarter', 'Firestarter', C(2)),
  G('Expedition Gear', 'lamp', 'Lamp', 1, 2),
  G('Expedition Gear', 'lamp_oil', 'Lamp Oil (load)', C(1)),
  G('Expedition Gear', 'pot_bronze', 'Pot or Pan, Bronze', 1),
  G('Expedition Gear', 'pot_clay', 'Pot, Clay', C(2)),
  G('Expedition Gear', 'sack_small', 'Sack, Small Leather', C(1)),
  G('Expedition Gear', 'sack_large', 'Sack, Large Leather', C(2)),
  G('Expedition Gear', 'tent_five', 'Tent, Five-man', 10),
  G('Expedition Gear', 'tent_one', 'Tent, One-man', 2),
  G('Expedition Gear', 'tent_three', 'Tent, Three-man', 8),
  G('Expedition Gear', 'torch', 'Wicker Torch', C(1)),

  // Exotic goods (p.412)
  G('Exotic Goods', 'dyes', 'Dyes (batch)', 1, 10),
  G('Exotic Goods', 'mordants', 'Mordants (batch)', 1, 10),
  G('Exotic Goods', 'salt', 'Salt, Good (30 ml)', 1),
  G('Exotic Goods', 'sweetgrass', 'Sweetgrass (bunch)', C(2)),
  G('Exotic Goods', 'spiceroot', 'Praxian Spiceroot', C(4)),

  // Musical instruments (p.412)
  G('Musical Instruments', 'bagpipes', 'Bagpipes', 10),
  G('Musical Instruments', 'castanets', 'Castanets', C(2)),
  G('Musical Instruments', 'cymbals', 'Cymbals', 1),
  G('Musical Instruments', 'drum', 'Skin Drum', 1),
  G('Musical Instruments', 'flute', 'Flute', C(1), 10),
  G('Musical Instruments', 'nose_flute', 'Nose Flute', C(1)),
  G('Musical Instruments', 'lur', 'Lur Horn', 10),
  G('Musical Instruments', 'kithara', 'Kithara', 50),
  G('Musical Instruments', 'lute', 'Lute', 10, 25),
  G('Musical Instruments', 'lyre', 'Lyre', 10, 25),
  G('Musical Instruments', 'reed_pipes', 'Reed Pipes', C(2)),
  G('Musical Instruments', 'rattle', 'Rattle', C(1), 5),

  // Food (p.413)
  G('Food', 'cheese', 'Cheese (1 kg)', C(2)),
  G('Food', 'bread', 'Loaf of Bread', C(0.1)),
  G('Food', 'sausage', 'Sausage', C(1)),
  G('Food', 'leg_of_lamb', 'Leg of Lamb', C(5)),
  G('Food', 'roast_pig', 'Entire Roasted Pig', 2),
  G('Food', 'midday_meal', 'Midday Meal', C(6)),
]
