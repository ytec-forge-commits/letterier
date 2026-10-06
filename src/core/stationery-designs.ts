// Original art briefs. Catalog membership is not proof that the artwork is finished.
// Every entry needs a separately authored illustration and visual QA before UI exposure.
const briefs:Record<string,readonly [string,string,string,string,string]>={
 washi:['繊維の余白 / Paper fibers','流れる雲母 / Mica stream','透かしの竹 / Bamboo watermark','小さな折り鶴 / Paper crane','麻の葉の透かし / Hemp-leaf watermark'],
 ichimatsu:['藍の市松 / Indigo checks','市松と扇 / Checks and fan','組紐の結び / Braided cord knot','千鳥と格子 / Plovers and lattice','青海波の帯 / Ocean-wave band'],
 sakura:['桜の枝 / Cherry branch','花筏 / Petal raft','桜と小鳥 / Cherry and songbird','八重桜の花束 / Double-cherry bouquet','桜と和傘 / Cherry and paper umbrella'],
 nanohana:['菜の花と蝶 / Rapeseed and butterfly','野の花の小径 / Wildflower path','蜜蜂の便り / Honeybee letter','黄色い花籠 / Yellow flower basket','菜の花と風車 / Rapeseed and windmill'],
 asagao:['朝顔と風鈴 / Morning glory and wind chime','蔓のアーチ / Vine arch','竹垣の朝顔 / Flowers on bamboo fence','団扇と夏の花 / Summer flowers and fan','朝露の鉢植え / Dewy flower pot'],
 goldfish:['金魚と水紋 / Goldfish and ripples','睡蓮の池 / Water-lily pond','金魚鉢 / Glass fish bowl','蓮の葉と二匹 / Two fish and lotus leaf','水草の小川 / Stream with waterweeds'],
 momiji:['紅葉の枝 / Maple branch','落ち葉の小径 / Fallen-leaf path','紅葉と橋 / Maple and bridge','葉の花束 / Leaf bouquet','秋の手水鉢 / Autumn water basin'],
 moon:['月とすすき / Moon and pampas grass','うさぎのお月見 / Moon-viewing rabbit','月と雁 / Moon and wild geese','萩と月影 / Bush clover and moonlight','灯籠の秋夜 / Lantern on autumn night'],
 'snow-garden':['雪の枝 / Snow-covered branch','雪の石灯籠 / Snowy stone lantern','冬の山茶花 / Winter sasanqua','雪うさぎ / Snow rabbit','雪の竹 / Snow-covered bamboo'],
 camellia:['椿の花 / Camellia bloom','落ち椿の石畳 / Fallen camellias on stones','椿の一輪挿し / Camellia in a small vase','椿と小鳥 / Camellia and songbird','蕾の小枝 / Twig with buds'],
 classic:['角飾りの枠 / Ornamental frame','羽根ペンと封蝋 / Quill and wax seal','小さな鍵 / Small antique key','月桂樹の紋章 / Laurel medallion','蔵書の便り / Books and letter'],
 dots:['淡い水玉 / Pastel dots','紙吹雪とリボン / Confetti and ribbon','シャボン玉 / Soap bubbles','小さな風船 / Little balloons','ボタンと糸 / Buttons and thread'],
 mimosa:['ミモザのリース / Mimosa wreath','ミモザの花束 / Mimosa bouquet','ガラス瓶のミモザ / Mimosa in glass bottle','ミモザと蝶 / Mimosa and butterfly','ミモザの贈り物 / Mimosa gift parcel'],
 tulip:['チューリップの庭 / Tulip garden','チューリップの花束 / Tulip bouquet','花の自転車 / Flower bicycle','じょうろの花 / Flowers in watering can','チューリップと小鳥 / Tulips and songbird'],
 seaside:['波と貝殻 / Waves and seashell','帆船の便り / Sailboat letter','浜辺の灯台 / Coastal lighthouse','珊瑚と小魚 / Coral and small fish','砂浜の足跡 / Footprints on sand'],
 lemon:['レモンと葉 / Lemon and leaves','レモネード / Lemonade pitcher','レモンの花 / Lemon blossom','収穫の籠 / Harvest basket','レモンのタルト / Lemon tart'],
 'autumn-leaf':['秋色の小枝 / Autumn twig','葉のリース / Leaf wreath','落ち葉の傘 / Umbrella and fallen leaves','秋の木のベンチ / Autumn park bench','葉の押し花 / Pressed autumn leaves'],
 woodland:['どんぐりときのこ / Acorns and mushrooms','りすの収穫 / Squirrel harvest','森のハリネズミ / Woodland hedgehog','木の実の籠 / Forest-fruit basket','森の切り株 / Woodland tree stump'],
 snowflake:['雪の結晶 / Snow crystals','雪の街灯 / Snowy streetlight','ミトンと雪 / Mittens and snow','氷の小枝 / Frosted twig','雪の小さな家 / Little snowy house'],
 christmas:['クリスマスリース / Christmas wreath','小さなツリー / Little Christmas tree','贈り物と靴下 / Gifts and stocking','キャンドルの夜 / Candlelit evening','ベルと柊 / Bells and holly'],
};
export interface StationeryDesign {id:string;series:string;number:number;nameJa:string;nameEn:string}
export const stationeryDesigns:StationeryDesign[]=Object.entries(briefs).flatMap(([series,names])=>names.map((name,index)=>{const [nameJa,nameEn]=name.split(' / ');return {id:`${series}-v${index+1}`,series,number:index+1,nameJa,nameEn};}));
export const designsFor=(series:string)=>stationeryDesigns.filter(design=>design.series===series);
