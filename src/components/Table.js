import { useState, useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import Item from "../classes/Item";

const Table = () => {

  const itemMap = new Map();
  useEffect(() => {
    fetch('https://prices.runescape.wiki/api/v1/osrs/mapping/')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        data.forEach(element => {
          itemMap.set(element.id,
            new Item(element.examine, element.highalch, element.icon, element.id, element.limit, element.lowalch, element.members, element.name, element.value)
          );
        });
        console.log(itemMap);
      })
      .catch((err) => {
        console.log(err.message);
      })
  }, []);
  
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch('https://prices.runescape.wiki/api/v1/osrs/latest/')
      .then((response) => response.json())
      .then((raw) => {
        let keys = Object.keys(raw.data);
        let values = Object.values(raw.data);
        for (let i = 0; i < values.length; i++) {
          // values[i].id = Number(keys[i]);
          // console.log(Object.values(itemMap.get(Number(keys[i]))));
          if(itemMap.get(Number(keys[i])) == undefined) continue;
          let extraValues = Object.values(itemMap.get(Number(keys[i])));
          if(extraValues == undefined) continue;
          values[i].examine = extraValues[0];
          values[i].highalch = extraValues[1];
          values[i].icon = extraValues[2];
          values[i].id = extraValues[3];
          values[i].limit = extraValues[4];
          values[i].lowalch = extraValues[5];
          values[i].members = extraValues[6];
          values[i].name = extraValues[7];
          values[i].value = extraValues[8];
        }
        return values;
      })
      .then((data) => {
        console.log(data);
        setItems(data);
      })
      .catch((err) => {
        console.log(err.message);
      })
  }, []);

  const columns = [
    { label: "Name", accessor: "name" },
    { label: "Sell", accessor: "high" },
    { label: "Buy", accessor: "low" },
    { label: "Last Sold At", accessor: "highTime"},
    { label: "Last Bought At", accessor: "lowTime"},
    { label: "ID", accessor: "id"},
  ];



  return (
    <>
      <table className="table">
        <caption>
          OSRS Item Prices
        </caption>
        <TableHead columns={columns} />
        <TableBody columns={columns} items={items} />
      </table>
    </>
  );
};

export default Table;
