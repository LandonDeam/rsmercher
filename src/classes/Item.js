export default class Item {
  constructor(examine, highalch, icon, id, limit, lowalch, members, name, value = 0) {
    this.examine = examine;
    this.highalch = highalch;
    this.icon = "https://oldschool.runescape.wiki/images/"+encodeURIComponent(String(icon).replace(/ /g, '_'));
    this.id = id;
    this.limit = limit;
    this.lowalch = lowalch;
    this.members = members;
    this.name = name;
    this.value = value;
  }
}